import * as XLSX from 'xlsx';
import { InvoiceExtractionResult, ExtractedProduct, ExtractedLandedCost, InvoiceMetadata, analyzeExcelLayout, ExcelLayoutMap } from './geminiService';

export const processExcelIngestion = async (
    file: File,
    inventory: any[],
    onProgress?: (msg: string) => void
): Promise<InvoiceExtractionResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                if (onProgress) onProgress("Leyendo archivo Excel localmente...");
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                
                if (jsonData.length === 0) {
                    throw new Error("El archivo Excel está vacío.");
                }

                if (onProgress) onProgress("Generando mapa de estructura con IA (Gemini)...");
                
                // Construct a CSV sample to send to Gemini
                // We'll send first 50 rows and last 50 rows to fit in context efficiently.
                const firstRows = jsonData.slice(0, 70);
                const lastRows = jsonData.length > 70 ? jsonData.slice(-70) : [];
                
                let csvSample = firstRows.map((r, i) => `Fila ${i}: ${r.join(',')}`).join('\n');
                if (lastRows.length > 0) {
                    csvSample += '\n...[FILAS INTERMEDIAS OMITIDAS]...\n';
                    const startIndex = jsonData.length - lastRows.length;
                    csvSample += lastRows.map((r, i) => `Fila ${startIndex + i}: ${r.join(',')}`).join('\n');
                }

                let layoutMap: ExcelLayoutMap;
                try {
                    layoutMap = await analyzeExcelLayout(csvSample);
                } catch (aiError: any) {
                    console.error("Gemini mapping failed", aiError);
                    throw new Error("AI Error: " + (aiError.message || aiError.toString()));
                }

                if (onProgress) onProgress("Extrayendo productos usando el mapa inteligente...");

                let products: ExtractedProduct[] = [];
                let landedCosts: ExtractedLandedCost[] = [];
                let totalFob = 0;

                const { productsTable, landedCostsTable, metadata } = layoutMap;

                // 1. Extracción de Productos
                if (productsTable) {
                    const maxRow = productsTable.endRow !== null ? Math.min(productsTable.endRow, jsonData.length - 1) : jsonData.length - 1;
                    
                    for (let r = productsTable.startRow; r <= maxRow; r++) {
                        const row = jsonData[r];
                        if (!row) continue;
                        
                        const code = String(row[productsTable.skuCol] || '').trim();
                        if (!code || code.toUpperCase() === 'TOTAL' || code.toUpperCase() === 'TOTALES') {
                            if (productsTable.endRow === null) break; // Break if no explicit end row is provided by AI
                            else continue; // Skip blank lines if AI provided a hard boundary
                        }

                        const name = row[productsTable.nameCol] ? String(row[productsTable.nameCol]) : '';
                        
                        let qty = 0;
                        if (productsTable.qtyCol !== undefined && row[productsTable.qtyCol] !== undefined) {
                            const qtyStr = String(row[productsTable.qtyCol]).replace(',', '.');
                            qty = parseFloat(qtyStr.replace(/[^\d.-]/g, '')) || 0;
                        }
                        
                        let unitCost = 0;
                        if (productsTable.costCol !== undefined && row[productsTable.costCol] !== undefined) {
                            const costStr = String(row[productsTable.costCol]).replace(',', '.');
                            unitCost = parseFloat(costStr.replace(/[^\d.-]/g, '')) || 0;
                        }

                        let mappedSku = code;
                        let status: 'MATCH' | 'REVIEW' | 'ERROR' = 'REVIEW';
                        let confidence = 0.5;

                        const foundInCat = inventory.find(i => 
                            i.sku.toUpperCase() === code.toUpperCase() || 
                            i.name.toUpperCase().includes(name.toUpperCase().substring(0, 5))
                        );

                        if (foundInCat) {
                            mappedSku = foundInCat.sku;
                            status = 'MATCH';
                            confidence = 0.95;
                        }

                        products.push({
                            rawSku: code,
                            rawName: name,
                            mappedSku: mappedSku,
                            qty: qty,
                            cost: unitCost,
                            status,
                            confidence
                        });
                    }
                }

                if (onProgress) onProgress("Extrayendo liquidación de importación (FOB y Gastos)...");

                // 2. Extracción de Gastos / Costos
                if (landedCostsTable) {
                    const startR = landedCostsTable.startRow;
                    for (let r = startR; r < jsonData.length; r++) {
                        const row = jsonData[r];
                        if (!row) continue;
                        
                        const concept = String(row[landedCostsTable.conceptCol] || '').trim();
                        if (!concept) continue;

                        if (concept.toUpperCase() === 'TOTAL' || concept.toUpperCase() === 'TOTALES') {
                            break; 
                        }

                        let amount = 0;
                        if (row[landedCostsTable.amountCol] !== undefined && String(row[landedCostsTable.amountCol]).trim() !== '') {
                            const valStr = String(row[landedCostsTable.amountCol]).replace(',', '.');
                            amount = parseFloat(valStr.replace(/[^\d.-]/g, '')) || 0;
                        }

                        if (concept.toUpperCase() === 'FOB') {
                            totalFob = amount;
                            continue;
                        }

                        let mappedCategory = 'Otros Gastos';
                        const cUp = concept.toUpperCase();
                        if (cUp.includes('FLETE MARITIMO') || cUp.includes('RECARGO IMO')) mappedCategory = 'Flete Internacional';
                        else if (cUp.includes('SEGURO')) mappedCategory = 'Seguro';
                        else if (cUp.includes('ARANCEL') || cUp.includes('TRIBUTO')) mappedCategory = 'Tributos/Aranceles DIAN';
                        else if (cUp.includes('FLETE TERRESTRE')) mappedCategory = 'Flete Terrestre Interno';
                        else if (cUp.includes('AGENCIAMIENTO') || cUp.includes('SIA')) mappedCategory = 'Agenciamiento Aduanero';
                        else if (cUp.includes('LIBERACION') || cUp.includes('PUERTO') || cUp.includes('PORTUARIA') || cUp.includes('BODEGAJE') || cUp.includes('MYA') || cUp.includes('RIM')) mappedCategory = 'Bodegajes/Puerto';

                        if (amount > 0) {
                            landedCosts.push({
                                rawConcept: concept,
                                provider: 'Importación',
                                rawAmount: amount,
                                mappedCategory: mappedCategory
                            });
                        }
                    }
                }

                let trmFinal = metadata.trm || 4000;
                if (trmFinal > 0 && trmFinal < 100) trmFinal = trmFinal * 1000;

                const resultMetadata: InvoiceMetadata = {
                    doNumber: 'Excel-Upload-AI-Mapped',
                    totalFOB_Documents: totalFob || (products.reduce((acc, p) => acc + (p.cost * p.qty), 0)),
                    totalFOB_Inferred: totalFob || (products.reduce((acc, p) => acc + (p.cost * p.qty), 0)),
                    invoiceNumbers: ['EXCEL-1'],
                    discrepancies: [],
                    crossReferences: [],
                    currency: metadata.currency || 'USD',
                    invoiceDate: new Date().toISOString().split('T')[0],
                    estimatedTRM: trmFinal
                };

                const result: InvoiceExtractionResult = {
                    products,
                    landedCosts,
                    extractedDocuments: [{
                        docType: 'Excel Mapeado por IA',
                        issuer: 'Usuario Interno',
                        docNumber: 'Upload',
                        keyExtractedData: [`Extraídos ${products.length} productos y ${landedCosts.length} costos de importación usando layout de Gemini.`],
                        status: 'PROCESADO'
                    }],
                    metadata: resultMetadata
                };

                if (metadata.colchon && metadata.colchon > 0) {
                    result.metadata.discrepancies.push(`Colchón extraído: ${metadata.colchon}`);
                }

                if (onProgress) onProgress("Extracción finalizada exitosamente.");
                setTimeout(() => resolve(result), 500); 

            } catch (error) {
                console.error(error);
                reject(error);
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};
