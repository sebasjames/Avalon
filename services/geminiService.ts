/// <reference types="vite/client" />
import { GoogleGenAI } from "@google/genai";
import { MOCK_INVENTORY, SALES_DATA } from '../constants';
import { AuditRow } from '../components/DataAuditGrid';

const SYSTEM_INSTRUCTION = `
Eres el "Sistema de Inteligencia Procoquinal OS", un asistente experto en análisis de datos.
RESPONDE SIEMPRE EN ESPAÑOL.

Reglas ESTRICTAS:
1. Basa tus respuestas EXCLUSIVAMENTE en el JSON de contexto proporcionado (incluyendo los metadatos y resúmenes).
2. Si el usuario pregunta por cantidades (ej. "¿Cuántos productos hay?"), SIEMPRE lee el nodo "resumen" (summary) del JSON y usa esos números exactos. NUNCA intentes contar los elementos del array manualmente.
3. Si un dato no está presente en el JSON, responde honestamente que no tienes esa información. ¡NO INVENTES DATOS (Cero alucinaciones)!
4. Sé conciso, profesional y basado puramente en la realidad de la información entregada. Usa viñetas cuando sea apropiado para listar información.
5. No menciones que estás leyendo un JSON, simplemente responde con naturalidad como si tuvieras acceso directo a la base de datos de la empresa.
`;

export const getApiKey = () => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
};

export const setApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
};

export const generateInsight = async (userPrompt: string, contextData: any = null): Promise<string> => {
    try {
        const apiKey = getApiKey();
        
        if (!apiKey) {
            return "Error: No se ha configurado la API Key de Gemini. Por favor, ingresa tu clave en el módulo de configuración o ingesta.";
        }

        const ai = new GoogleGenAI({ apiKey });
        const context = contextData ? JSON.stringify(contextData) : "No hay datos de contexto adicionales proporcionados.";
        
        const fullPrompt = `
        [CONTEXTO DE DATOS DEL SISTEMA (EN TIEMPO REAL)]:
        ${context}
        
        [CONSULTA DEL USUARIO]:
        ${userPrompt}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: fullPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        return response.text || "Procesé los datos pero no pude generar una respuesta textual.";

    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Hubo un error al procesar tu solicitud con Gemini. Revisa la consola para más detalles.";
    }
};


export const parseAlbaranImage = async (base64Image: string, mimeType: string): Promise<AuditRow[]> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.warn("No API key, returning mock data");
            return [
                {
                    rawDesc: '20 envases de 0.750L POLPARQUET',
                    rawDoc: 'Y-10022',
                    traceId: 'MOCK-1',
                    originalSku: '.2084/5975',
                    sku: 'FG-POLPARQ-075',
                    brand: 'POLPARQUET',
                    subCategory: 'Laca/Barniz',
                    uom: 'Lata',
                    qty: 20,
                    kgPerUnit: 25,
                    unitCost: 1.92,
                    hasError: false
                },
                {
                    rawDesc: '40 envases PU SELLADOR ULTRA CLEAR',
                    rawDoc: 'Y-10022',
                    traceId: 'MOCK-2',
                    originalSku: 'ITD1240',
                    sku: 'PU-SELL-CLEAR',
                    brand: 'CARPOLY',
                    subCategory: 'Resina/Base',
                    uom: 'Lata',
                    qty: 40,
                    kgPerUnit: 20,
                    unitCost: 2.30,
                    hasError: false
                }
            ];
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
Eres un experto extrayendo datos de albaranes y facturas de pinturas y químicos.
Analiza la imagen adjunta que corresponde a un albarán.
Extrae cada fila de producto de la tabla en formato JSON.
El JSON debe ser un array de objetos con esta estructura exacta:
[
  {
    "rawDesc": "Denominación original del producto + detalles de envases (ej. 20 envases de 0.75L)",
    "rawDoc": "Número de Albarán extraído del documento (ej. Y-10022)",
    "traceId": "ID único aleatorio generado por ti (ej. TRC-001)",
    "originalSku": "Referencia exacta encontrada en la tabla (ej. .2084/5975)",
    "sku": "",
    "brand": "Marca deducida (ej. BARPIDECOR, ECOBARP)",
    "subCategory": "Categoría (Laca/Barniz, Disolvente, etc.)",
    "uom": "Lata",
    "qty": 20, // Cantidad de unidades físicas (ej. latas)
    "kgPerUnit": 25, // Peso en Kilos de cada unidad física
    "unitCost": 1.92, // Precio FOB unitario en USD o EUR
    "hasError": false
  }
]
Solo devuelve JSON válido.
`;
        console.log("Enviando petición a Gemini (gemini-2.5-pro) con imágenes reales...");
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType
                    }
                }
            ]
        });

        const text = response.text || "[]";
        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || text.match(/\[[\s\S]*\]/);
        
        if (jsonMatch) {
            const rawJson = jsonMatch[1] || jsonMatch[0];
            return JSON.parse(rawJson) as AuditRow[];
        }
        
        return JSON.parse(text) as AuditRow[];
    } catch (error) {
        console.error("Error parsing Albaran:", error);
        throw error;
    }
};

export interface ExtractedProduct {
    rawSku: string;
    rawName: string;
    mappedSku: string;
    qty: number;
    cost: number;
    status: 'MATCH' | 'REVIEW' | 'ERROR';
    confidence: number;
}

export interface ExtractedLandedCost {
    rawConcept: string;
    provider: string;
    rawAmount: number;
    retefuenteAmount?: number;
    reteicaAmount?: number;
    mappedCategory: string;
}

export interface CrossReferenceRow {
    targetDocument: string;
    sourceDocument: string;
    concept: string;
    targetAmount: number;
    sourceAmount: number;
    difference: number;
    isValid: boolean;
}

export interface InvoiceMetadata {
    doNumber: string;
    totalFOB_Documents: number;
    totalFOB_Inferred: number;
    invoiceNumbers: string[];
    discrepancies: string[];
    crossReferences: CrossReferenceRow[];
    currency: string;
    invoiceDate: string;
    estimatedTRM: number;
}

export interface ExtractedDocument {
    docType: string;
    issuer: string;
    docNumber: string;
    keyExtractedData: string[];
    status: string;
}

export interface InvoiceExtractionResult {
    products: ExtractedProduct[];
    landedCosts: ExtractedLandedCost[];
    extractedDocuments: ExtractedDocument[];
    metadata: InvoiceMetadata;
}

export const processInvoicesWithGemini = async (
    files: { data: string, mimeType: string, name?: string }[], 
    inventory: any[],
    onProgress?: (msg: string) => void
): Promise<InvoiceExtractionResult> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error('MISSING_API_KEY');
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const catalogContext = inventory.map(item => `{ sku: "${item.sku}", name: "${item.name}" }`).join('\n');

        const prompt = `
Eres un agente experto en auditoría aduanera, extracción de importaciones y normalización de datos.
Te he pasado uno o más documentos (PDFs/Imágenes) correspondientes a una importación.

Tu objetivo es analizar TODOS los documentos de forma conjunta, hacer un cruce de auditoría y normalizar los productos basándote EXCLUSIVAMENTE en el siguiente catálogo interno:
<CATALOGO_INTERNO>
${catalogContext}
</CATALOGO_INTERNO>

INSTRUCCIONES DE PASO A PASO (CHAIN OF THOUGHT):
Debes seguir rigurosamente estos 4 pasos mentales antes de emitir tu respuesta.

[PASO 1: ARMAR BASE FOB Y KILOS]
Enfócate SOLO en las Facturas Comerciales Internacionales (Supplier Invoices).
- Extrae la divisa ("currency") y la fecha ("invoiceDate"). Suma el total explícito ("totalFOB_Documents") y calcula el sumado por ti ("totalFOB_Inferred").
- Identifica todos los productos ("products"): código original (rawSku), nombre original (rawName), cantidad de unidades/latas (qty).
- Determina el costo unitario FOB ("cost").
- Mapea el producto contra el <CATALOGO_INTERNO> (status="MATCH" o "REVIEW").
- EXPLICACIÓN DETALLADA ("aiExplanation"): Documenta cómo hallaste el costo base para cada ítem (ej. "baseCostOrigin", "baseCostFob", "sourceDocuments").

[PASO 2: FIJAR TRM DEL VIAJE]
Busca las Declaraciones de Importación (DO / DIM), liquidaciones de aduanas o soportes bancarios de pago al exterior.
- Identifica la Tasa de Cambio (TRM) oficial aplicada para la nacionalización ("estimatedTRM").
- Si no hay un documento oficial, estima la TRM aproximada para la fecha "invoiceDate".

[PASO 3: CACERÍA Y EXTRACCIÓN DE GASTOS]
Analiza el resto de PDFs (MIA Cargo, Agencias de Aduana J. Gutierrez, Puertos de Cartagena, Seguros). Extrae EXHAUSTIVAMENTE TODOS los cobros (landedCosts).
- REGLA DE DESGLOSE: ¡NUNCA agrupes facturas! Cada concepto es una línea separada. Extrae Ingresos Propios y Reembolsos/Pagos a Terceros de forma independiente.
- "rawConcept": Especifica el cobro (ej. "Bodegaje", "Tributos DIAN", "Honorarios Agencia", "Flete Marítimo").
- "provider": Proveedor o entidad que lo cobra.
- "rawAmount": Monto bruto total (antes de retenciones).
- "retefuenteAmount" y "reteicaAmount": Valores absolutos de retenciones descontadas en la factura.
- "mappedCategory": Clasifica en "Flete Internacional", "Seguro", "Tributos/Aranceles DIAN", "Bodegajes/Puerto", "Agenciamiento Aduanero", "Flete Terrestre Interno", "Otros Gastos".
- Extrae el número de Declaración ("importDeclarationNumber"). Documenta discrepancias ("discrepancies").

[PASO 4: DEDUPLICACIÓN DE TERCEROS Y CRUCE DOCUMENTAL]
Audita los cobros hallados en el Paso 3. Si detectas que una Agencia te cobra un Reembolso (ej. VUCE, Pagos a Puerto) y TAMBIÉN existe la factura original adjunta:
- Evita contabilizar el mismo gasto dos veces en "landedCosts" si es humanamente obvio que amparan el mismo pago.
- Llena la matriz de auditoría "crossReferences" matemáticamente:
    * "targetDocument": Factura que consolida el cobro (Ej. "Agencia Aduanas").
    * "sourceDocument": Factura original del tercero (Ej. "Comprobante VUCE").
    * "concept": Concepto cruzado.
    * "targetAmount": Monto cobrado en la consolidada.
    * "sourceAmount": Monto soportado en el original.
    * "difference": targetAmount - sourceAmount.
    * "isValid": true si es 0. Si hay descuadre o falta el soporte original (Ej. "FALTA SOPORTE"), isValid=false.
4. RESUMEN DE DOCUMENTOS LECTURADOS (extractedDocuments): Crea un resumen ULTRA DETALLADO de cada documento analizado. PROHIBIDO hacer resúmenes genéricos como "Se encontraron 25 productos".
   - "docType": Tipo (ej. "Factura Comercial", "Factura Transporte", "Declaración Importación").
   - "issuer": Quién lo emite (ej. Proveedor, SIA, Transportadora).
   - "docNumber": Número del documento.
   - "keyExtractedData": Array de strings ULTRA DETALLADO. Desglosa la información financiera línea por línea de lo que encontraste importante. Ejemplos obligatorios:
       * "Desglose financiero: Subtotal $1,000,000 COP, Retefuente (11%) -$110,000 COP, ReteICA (0.966%) -$9,660 COP. Total Neto: $880,340 COP."
       * "Mercancía identificada: 12 unidades de Resina Epóxica (SKU: 9021) a 12.50 USD c/u. 50 unidades de Endurecedor (SKU: 5044) a 5.00 USD c/u."
       * "Auditoría Cruzada: ✅ Este cobro de Transporte (Factura #445) ampara exactamente el ítem 3 cobrado en la factura de la Agencia de Aduanas (MYA-123)."
   - "status": Pon siempre "PROCESADO" si lograste leer la data.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "extractedDocuments": [
    { "docType": "Factura Agenciamiento", "issuer": "SIA XYZ", "docNumber": "FC-9912", "keyExtractedData": ["Desglose: Honorarios $1,500,000 COP", "Retenciones: Retefuente (11%) -$165,000 COP, ReteICA (0.966%) -$14,490 COP", "Neto a pagar: $1,320,510 COP", "✅ Documento cruzado con éxito contra los pagos de aduana"], "status": "PROCESADO" }
  ],
  "products": [
    { 
      "rawSku": "cod-prov", "rawName": "nombre-prov", "mappedSku": "sku-interno", "qty": 100, "cost": 15.5, "status": "MATCH", "confidence": 0.95,
      "aiExplanation": {
        "baseCostOrigin": "Factura Comercial Y-10022, Fila 2",
        "baseCostFob": 15.5,
        "trmApplied": 4120,
        "apportionmentFormula": "FOB (15.5 USD * 4120 TRM) + 5% participación por valor en gastos logísticos totales",
        "sourceDocuments": ["Factura Comercial Y-10022", "BL #998371"]
      }
    }
  ],
  "landedCosts": [
    { "rawConcept": "Tributos Aduaneros y Arancel", "provider": "DIAN", "rawAmount": 2500000, "retefuenteAmount": 0, "reteicaAmount": 0, "mappedCategory": "Tributos/Aranceles DIAN" },
    { "rawConcept": "Honorarios Agenciamiento", "provider": "SIA Ltda", "rawAmount": 1500000, "retefuenteAmount": 165000, "reteicaAmount": 14490, "mappedCategory": "Agenciamiento Aduanero" }
  ],
  "metadata": {
    "doNumber": "0748",
    "totalFOB_Documents": 12500.00,
    "totalFOB_Inferred": 12500.00,
    "invoiceNumbers": ["6301"],
    "discrepancies": ["No hay discrepancias"],
    "crossReferences": [
      {
        "targetDocument": "Factura Agenciamiento FC-9912",
        "sourceDocument": "Factura Naviera #5566",
        "concept": "Liberación de BL",
        "targetAmount": 350000,
        "sourceAmount": 350000,
        "difference": 0,
        "isValid": true
      }
    ],
    "currency": "USD",
    "invoiceDate": "2024-03-15",
    "estimatedTRM": 3950.50
  }
}
`;

        const partialJsonResults = [];

        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const docName = f.name || `Documento_${i + 1}`;
            if (onProgress) onProgress(`Leyendo documento ${i + 1} de ${files.length}: ${docName}`);

            const mapPrompt = `
            Actúa como un escáner OCR experto. 
            Tu único trabajo es extraer TODO el texto visible, tablas, conceptos, números y totales de este documento de forma estructurada. 
            No intentes analizar contabilidad, no clasifiques, no apliques reglas. 
            Solo devuelve una transcripción fiel y estructurada del contenido (en texto plano o formato clave-valor) para que otro sistema lo analice después.
            `;

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-1.5-pro',
                    contents: [
                        mapPrompt,
                        { inlineData: { data: f.data, mimeType: f.mimeType } }
                    ]
                });
                const text = response.text || "";
                partialJsonResults.push(`[${docName}]:\n${text}`);
            } catch (err) {
                console.error(`Error leyendo documento ${i+1}:`, err);
            }
        }

        if (onProgress) onProgress("Consolidando información y deduplicando cobros...");

        const reducePrompt = `
        ${prompt}
        
        A continuación te presento la transcripción pura (OCR) de TODOS los documentos de esta importación.
        Ejecuta tus 4 PASOS MENTALES obligatorios basándote en esta información y devuelve el JSON final validado.
        
        [TRANSCRIPCIONES DE DOCUMENTOS]
        ${partialJsonResults.join('\n\n---\n\n')}
        `;

        const finalResponse = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: reducePrompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const finalText = finalResponse.text || "{}";
        
        try {
            return JSON.parse(finalText);
        } catch (parseError) {
            console.error("JSON parse error. Final Text was:", finalText);
            // Intento con regex como fallback por si acaso ignora el mimeType
            const finalJsonMatch = finalText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || finalText.match(/\{[\s\S]*\}/);
            if (finalJsonMatch) {
                return JSON.parse(finalJsonMatch[1] || finalJsonMatch[0]);
            }
            throw new Error("No se pudo parsear el resultado de la IA como JSON.");
        }
        
        return JSON.parse(finalText);

    } catch (error) {
        console.error("Error processing invoices:", error);
        throw error;
    }
};

