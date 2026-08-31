const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

const rootDir = 'C:\\James\\Scarpian AI\\Projects\\Procoquinal\\Avalon_V1';
let inventoryContent = fs.readFileSync(path.join(rootDir, 'Avalon_V1_CODE', 'data', 'inventory.ts'), 'utf-8');
const skuMatches = inventoryContent.match(/"sku":\s*"([^"]+)"/g);
const validSkus = skuMatches ? skuMatches.map(m => m.replace(/"sku":\s*"/, '').replace('"', '')) : [];
const uniqueSkus = [...new Set(validSkus)];
const validSkusStr = JSON.stringify(uniqueSkus);

const promptTemplate = `
Eres un experto químico industrial extrayendo fórmulas de fichas técnicas de pinturas y poliuretanos.
Tarea: Extraer los catalizadores (Parte B) y diluyentes (Parte C) requeridos para el producto principal, y calcular su porcentaje en peso o volumen relativo a la base (que siempre será 100%).
Regla de Oro (Validación cruzada): Tienes una lista de SKUs válidos que existen en nuestra base de datos.
Si la ficha técnica menciona un catalizador o solvente, y menciona una referencia/código, debes intentar usar un SKU de esta lista que coincida.
Por ejemplo, si dice "IG82XE", y ese NO está en la lista, pero "IGH822" sí está y es un catalizador, úsalo como mejor aproximación si es el único parecido.
¡Bajo ninguna circunstancia puedes sugerir un SKU que no esté en la lista!

Lista de SKUs válidos:
[LIST_OF_SKUS]

Instrucciones de formato de salida:
Responde SOLO con un objeto JSON (sin comillas invertidas ni bloques de markdown).
Estructura:
{
  "baseSku": "SKU_DEL_PRODUCTO_PRINCIPAL",
  "mixingInstructions": "SKU_CATALIZADOR:PORCENTAJE|SKU_SOLVENTE:PORCENTAJE"
}

- "mixingInstructions" debe estar vacío si no requiere mezcla.
- El PORCENTAJE es un número sin el símbolo %. Si dice 50%, pon 50.
- Separa cada instrucción con el carácter "|".
`;

async function test() {
    const filePath = path.join(rootDir, 'raw_json_extractions', 'TDS - ID122 - POLIURETANO FONDO BLANCO.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const rawText = data.rawText || data.raw_text_snippet || "";
    const baseSku = data.sku || "";

    console.log("Extracted baseSku:", baseSku);

    const prompt = promptTemplate.replace('[LIST_OF_SKUS]', validSkusStr) + '\n\nTEXTO DE LA FICHA TÉCNICA (SKU BASE: ' + baseSku + '):\n' + rawText;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });
        console.log("Raw Response:");
        console.log(response.text);
    } catch(e) {
        console.error("API error:", e);
    }
}
test();
