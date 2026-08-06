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
    return localStorage.getItem('gemini_api_key') || import.meta.env?.VITE_GEMINI_API_KEY || '';
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
            model: 'gemini-3-flash-preview',
            contents: fullPrompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                thinkingConfig: { thinkingBudget: 0 } // Fast response for UI chat
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
                    uom: 'L',
                    qty: 15,
                    unitCost: 8.85,
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
    "uom": "L",
    "qty": 15.00, // número de TOTAL KG./L. (Litros totales)
    "unitCost": 8.85, // número de €/UD. (Precio por litro)
    "hasError": false
  }
]
Solo devuelve JSON válido.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
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

export const processInvoicesWithGemini = async (files: { data: string, mimeType: string }[], inventory: any[]): Promise<InvoiceExtractionResult> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new Error("No hay API Key configurada. Ingresa tu API Key de Gemini para usar la Ingesta Inteligente.");
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

Reglas Estrictas:
1. MERCANCÍA (products): Extrae los productos de las facturas comerciales del exterior. Identifica el nombre original (rawName) y código original (rawSku).
   - Intenta mapear el producto con el <CATALOGO_INTERNO>. Si estás muy seguro, pon status="MATCH" y asigna el "mappedSku".
   - Si tienes dudas, pon status="REVIEW". Si no encuentras nada parecido, pon status="ERROR" y mappedSku="".
   - "cost" debe ser el costo unitario FOB.
   - EXPLICACIÓN DETALLADA OBLIGATORIA ("aiExplanation"): Por CADA producto, debes generar un objeto que explique paso a paso cómo hallaste su costo y qué documentos utilizaste, para pintar un panel lateral de desglose exacto.
       * "baseCostOrigin": Explicación literal de dónde salió el costo base. Ej: "Factura Y-10022, Fila 4".
       * "baseCostFob": El costo FOB original (número).
       * "trmApplied": La TRM usada (número).
       * "apportionmentFormula": Fórmula teórica de cómo se calcularía el costo final. Ej: "FOB (12.50 USD * TRM) + Proporción de peso/volumen sobre $3,500,000 COP de Gastos Nacionalización".
       * "sourceDocuments": Array de strings con los nombres de todos los documentos implicados en el análisis de este producto (Ej. ["Factura Y-10022", "Declaración de Importación DIM-09"]).
2. GASTOS DE NACIONALIZACIÓN Y LOGÍSTICA (landedCosts): Extrae EXHAUSTIVAMENTE TODOS los cobros, tasas e impuestos encontrados en los documentos (Agenciamiento aduanero, fletes internacionales e internos, bodegajes, puertos, liberación de BL, seguros, aranceles, IVA de importación, tributos aduaneros, gastos bancarios, etc.).
   - REGLA DE DESGLOSE: ¡NUNCA agrupes facturas! Si una agencia (SIA) te cobra Honorarios y Reembolso de Terceros, extrae CADA servicio de terceros como una fila independiente.
   - REGLA DE DEDUPLICACIÓN: Si detectas que una Agencia te cobra un Reembolso de Transporte, y también tienes la factura original de la Transportadora adjunta, extrae el cobro SOLO UNA VEZ usando la factura original como respaldo y la de la Agencia como cobro.
   - "rawConcept": Especifica el cobro detalladamente (ej. "Bodegaje Zona Franca", "Tributos DIAN", "Honorarios Agencia").
   - "provider": Nombre del proveedor, aduana o entidad que lo cobra.
   - "rawAmount": El monto BRUTO total cobrado antes de aplicar retenciones (usualmente en COP).
   - "retefuenteAmount": Si existe una Retención en la Fuente descontada en la factura, anota el valor absoluto descontado aquí. Si no hay, pon 0.
   - "reteicaAmount": Si existe una Retención de ICA descontada en la factura, anota el valor absoluto aquí. Si no hay, pon 0.
   - "mappedCategory": Clasifica en: "Flete Internacional", "Seguro", "Tributos/Aranceles DIAN", "Bodegajes/Puerto", "Agenciamiento Aduanero", "Flete Terrestre Interno", "Otros Gastos".
3. METADATA DE AUDITORÍA: Extrae el número de Declaración de Importación (DO) si existe.
   - Extrae la "currency" (divisa) principal de las facturas comerciales (ej. USD, EUR, RMB, COP). Si no estás seguro asume USD.
   - Extrae la fecha de expedición de la factura principal en formato YYYY-MM-DD ("invoiceDate").
   - A partir de la fecha ("invoiceDate") y la divisa ("currency"), estima cuál era la Tasa de Cambio (TRM) a Pesos Colombianos (COP) en esa fecha exacta o aproximada ("estimatedTRM"). Si es en COP, la TRM es 1.
   - Suma el valor total FOB explícito en los documentos ("totalFOB_Documents"). Este valor estará en la "currency" detectada.
   - Calcula el total FOB sumando qty*cost de los productos extraídos ("totalFOB_Inferred").
   - Compara y registra cualquier discrepancia ("discrepancies") entre lo cobrado, lo facturado y las cuentas locales (ej. retenciones, tasas de cambio).
   - SLOT FILLING - CRUCES DOCUMENTALES ("crossReferences"): Por CADA cobro de terceros detectado, DEBES rellenar una celda de cruce estructurado validando matemáticamente:
       * "targetDocument": Factura que consolida el cobro (Ej. "Agencia Aduanas MYA-123").
       * "sourceDocument": Factura original del tercero (Ej. "Transportes Rápidos #445").
       * "concept": Concepto cruzado (Ej. "Reembolso Transporte Internacional").
       * "targetAmount": Monto cobrado en la factura consolidada.
       * "sourceAmount": Monto soportado en la factura original.
       * "difference": targetAmount - sourceAmount.
       * "isValid": true si difference es 0 o si está justificada contablemente, false si hay un descuadre. CRÍTICO: Si la agencia de aduanas cobra Pagos a Terceros y no anexan las facturas soportes, genera la fila con sourceDocument="FALTA SOPORTE", sourceAmount=0, difference=targetAmount, isValid=false.
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

        const contents = [
            prompt,
            ...files.map(f => ({
                inlineData: {
                    data: f.data,
                    mimeType: f.mimeType
                }
            }))
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents
        });

        const text = response.text || "{}";
        const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            const rawJson = jsonMatch[1] || jsonMatch[0];
            return JSON.parse(rawJson);
        }
        
        return JSON.parse(text);

    } catch (error) {
        console.error("Error processing invoices:", error);
        throw error;
    }
};

