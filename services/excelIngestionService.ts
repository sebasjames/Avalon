import * as XLSX from 'xlsx';
import { InvoiceExtractionResult, ExtractedProduct, ExtractedLandedCost, InvoiceMetadata } from './geminiService';

export const processExcelIngestion = async (
    file: File,
    inventory: any[],
    onProgress?: (msg: string) => void
): Promise<InvoiceExtractionResult> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                if (onProgress) onProgress("Leyendo archivo Excel...");
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Assuming everything is on the first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to array of arrays
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                
                if (onProgress) onProgress("Buscando y extrayendo productos...");

                let products: ExtractedProduct[] = [];
                let landedCosts: ExtractedLandedCost[] = [];
                let currency = 'USD';
                let trm = 0;
                let totalFob = 0;
                let estimatedColchon = 0;

                // 1. Detección de Divisa y TRM
                for (let r = 0; r < Math.min(20, jsonData.length); r++) {
                    const row = jsonData[r];
                    if (!row) continue;
                    for (let c = 0; c < row.length; c++) {
                        const cellVal = String(row[c] || '').toUpperCase();
                        if (cellVal.includes('EURO') || cellVal.includes('€')) {
                            currency = 'EUR';
                            if (c + 1 < row.length && String(row[c+1]).trim() !== '') {
                                trm = parseFloat(String(row[c+1]).replace(/[^\d.,]/g, '').replace(',', '.'));
                            }
                            if (c + 2 < row.length && String(row[c+2]).trim() !== '' && !trm) {
                                trm = parseFloat(String(row[c+2]).replace(/[^\d.,]/g, '').replace(',', '.'));
                            }
                        } else if (cellVal.includes('DOLAR') || cellVal.includes('USD') || cellVal === '$') {
                            if (currency !== 'EUR') currency = 'USD'; 
                            if (c + 1 < row.length && String(row[c+1]).trim() !== '') {
                                const val = parseFloat(String(row[c+1]).replace(/[^\d.,]/g, '').replace(',', '.'));
                                if (val > 1000) trm = val; // ensure it looks like a TRM
                            }
                        }
                    }
                }

                if (trm > 0 && trm < 100) trm = trm * 1000;

                // 2. Detección de la tabla de Productos
                let productStartRow = -1;
                let codeColIdx = -1;
                let refColIdx = -1;
                let qtyColIdx = -1; 
                let unitCostColIdx = -1;
                let uomColIdx = -1;

                for (let r = 0; r < jsonData.length; r++) {
                    const row = jsonData[r];
                    if (!row) continue;
                    
                    let foundHeader = false;
                    for (let c = 0; c < row.length; c++) {
                        const cellVal = String(row[c] || '').toUpperCase().trim();
                        if (cellVal === 'CODIGO' || cellVal === 'CÓDIGO') {
                            codeColIdx = c;
                            foundHeader = true;
                        }
                        if (cellVal.includes('REFERENCIA') || cellVal.includes('DESCRIPCION')) refColIdx = c;
                        if (cellVal.includes('CANTIDAD KL') || cellVal.includes('CANTIDAD LT') || cellVal === 'CANTIDAD') {
                            if (qtyColIdx === -1 || cellVal.includes('KL') || cellVal.includes('LT')) {
                                qtyColIdx = c;
                            }
                        }
                        if (cellVal.includes('VR UNITARIO') || cellVal.includes('VALOR UNITARIO') || cellVal.includes('UNITARIO')) unitCostColIdx = c;
                        if (cellVal === 'U.M' || cellVal === 'UM') uomColIdx = c;
                    }

                    if (foundHeader && codeColIdx !== -1 && refColIdx !== -1) {
                        productStartRow = r + 1;
                        break;
                    }
                }

                if (productStartRow !== -1) {
                    for (let r = productStartRow; r < jsonData.length; r++) {
                        const row = jsonData[r];
                        if (!row || !row[codeColIdx]) {
                            // Empty code -> likely end of product list
                            if (r + 1 < jsonData.length && (!jsonData[r+1] || !jsonData[r+1][codeColIdx])) {
                                break;
                            }
                            continue; 
                        }

                        const code = String(row[codeColIdx]).trim();
                        if (code === '' || code.toUpperCase() === 'TOTAL' || code.toUpperCase() === 'TOTALES') break;

                        const name = row[refColIdx] ? String(row[refColIdx]) : '';
                        
                        let qty = 0;
                        if (qtyColIdx !== -1 && row[qtyColIdx]) {
                            const qtyStr = String(row[qtyColIdx]).replace(',', '.');
                            qty = parseFloat(qtyStr.replace(/[^\d.-]/g, ''));
                        }
                        
                        let unitCost = 0;
                        if (unitCostColIdx !== -1 && row[unitCostColIdx]) {
                            const costStr = String(row[unitCostColIdx]).replace(',', '.');
                            unitCost = parseFloat(costStr.replace(/[^\d.-]/g, ''));
                        }

                        const uom = uomColIdx !== -1 && row[uomColIdx] ? String(row[uomColIdx]) : 'Und';

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
                            qty: qty || 0,
                            cost: unitCost || 0,
                            status,
                            confidence
                        });
                    }
                }

                if (onProgress) onProgress("Extrayendo liquidación de importación (FOB y Gastos)...");

                // 3. Detección de tabla de Gastos / Costos de Importación
                let costsStartRow = -1;
                let conceptColIdx = -1;
                let valueColIdx = -1;

                for (let r = productStartRow !== -1 ? productStartRow : 0; r < jsonData.length; r++) {
                    const row = jsonData[r];
                    if (!row) continue;
                    
                    let rowStr = row.map(c => String(c || '').toUpperCase()).join(' ');
                    
                    // The expenses table starts near FOB
                    if ((rowStr.includes('FOB') || rowStr.includes('FLETE MARITIMO')) && !rowStr.includes('TOTAL')) {
                        costsStartRow = r;
                        for(let c = 0; c < row.length; c++) {
                            const cell = String(row[c] || '').toUpperCase().trim();
                            if (cell === 'FOB' || cell.includes('FLETE')) conceptColIdx = c;
                            else if (cell !== '' && !isNaN(parseFloat(String(row[c]).replace(/[^\d.-]/g, ''))) && valueColIdx === -1) {
                                valueColIdx = c;
                            }
                        }
                        break;
                    }
                }

                if (costsStartRow !== -1 && conceptColIdx !== -1) {
                    if (valueColIdx === -1) valueColIdx = conceptColIdx + 1;

                    for (let r = costsStartRow; r < jsonData.length; r++) {
                        const row = jsonData[r];
                        if (!row) continue;
                        
                        const concept = String(row[conceptColIdx] || '').trim();
                        if (!concept) continue;

                        if (concept.toUpperCase() === 'TOTAL' || concept.toUpperCase() === 'TOTALES') {
                            break; 
                        }

                        let amount = 0;
                        if (row[valueColIdx] && String(row[valueColIdx]).trim() !== '') {
                            const valStr = String(row[valueColIdx]).replace(',', '.');
                            amount = parseFloat(valStr.replace(/[^\d.-]/g, ''));
                        } else if (row[valueColIdx + 1] && String(row[valueColIdx+1]).trim() !== '') {
                             const valStr = String(row[valueColIdx + 1]).replace(',', '.');
                             amount = parseFloat(valStr.replace(/[^\d.-]/g, ''));
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

                // 4. Buscar Colchón
                for (let r = (costsStartRow !== -1 ? costsStartRow : 0); r < jsonData.length; r++) {
                    const row = jsonData[r];
                    if (!row) continue;
                    for (let c = 0; c < row.length; c++) {
                        const cellVal = String(row[c] || '').toUpperCase();
                        if (cellVal.includes('COSTEO DE IMPORTACIÓN POR KILO') || cellVal.includes('COSTO DE IMPORTACION')) {
                             if (c + 1 < row.length && String(row[c+1]).trim() !== '') {
                                 const valStr = String(row[c+1]).replace(',', '.');
                                 estimatedColchon = parseFloat(valStr.replace(/[^\d.-]/g, ''));
                             }
                             if (c + 2 < row.length && String(row[c+2]).trim() !== '' && !estimatedColchon) {
                                 const valStr = String(row[c+2]).replace(',', '.');
                                 estimatedColchon = parseFloat(valStr.replace(/[^\d.-]/g, ''));
                             }
                        }
                    }
                }

                const metadata: InvoiceMetadata = {
                    doNumber: 'Excel-Upload',
                    totalFOB_Documents: totalFob || (products.reduce((acc, p) => acc + (p.cost * p.qty), 0)),
                    totalFOB_Inferred: totalFob || (products.reduce((acc, p) => acc + (p.cost * p.qty), 0)),
                    invoiceNumbers: ['EXCEL-1'],
                    discrepancies: [],
                    crossReferences: [],
                    currency: currency,
                    invoiceDate: new Date().toISOString().split('T')[0],
                    estimatedTRM: trm || 4000
                };

                const result: InvoiceExtractionResult = {
                    products,
                    landedCosts,
                    extractedDocuments: [{
                        docType: 'Excel Estructurado',
                        issuer: 'Usuario Interno',
                        docNumber: 'Upload',
                        keyExtractedData: [`Extraídos ${products.length} productos y ${landedCosts.length} costos de importación.`],
                        status: 'PROCESADO'
                    }],
                    metadata
                };

                if (estimatedColchon > 0) {
                    result.metadata.discrepancies.push(`Colchón extraído: ${estimatedColchon}`);
                }

                if (onProgress) onProgress("Lectura de Excel finalizada exitosamente.");
                setTimeout(() => resolve(result), 500); 

            } catch (error) {
                console.error(error);
                reject(new Error("Error procesando el archivo Excel. Asegúrate de que tiene el formato correcto."));
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
};
