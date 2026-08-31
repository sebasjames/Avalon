const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

// Ensure API key is set
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

// Instantiate GoogleGenAI properly.
// The new SDK initializes via `new GoogleGenAI({ apiKey })`
const ai = new GoogleGenAI({ apiKey: apiKey });

const rootDir = 'C:\\James\\Scarpian AI\\Projects\\Procoquinal\\Avalon_V1';
const extractionDirs = [
    'raw_json_extractions',
    'raw_json_extractions_barpimo',
    'raw_json_extractions_ilva',
    'raw_json_extractions_procoquinal'
];

let inventoryPath = path.join(rootDir, 'Avalon_V1_CODE', 'data', 'inventory.ts');
let inventoryContent = fs.readFileSync(inventoryPath, 'utf-8');

// 1. Extract valid SKUs from inventory
const skuMatches = inventoryContent.match(/"sku":\s*"([^"]+)"/g);
const validSkus = skuMatches ? skuMatches.map(m => m.replace(/"sku":\s*"/, '').replace('"', '')) : [];
console.log(`Loaded ${validSkus.length} valid SKUs from inventory.`);

// Filter for only unique SKUs to reduce prompt size slightly
const uniqueSkus = [...new Set(validSkus)];
// To avoid context limits, maybe just a string array
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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const rawText = data.rawText || data.raw_text_snippet || "";
        
        // Find baseSku from the filename
        let baseSku = "";
        const filename = path.basename(filePath);
        for (let sku of uniqueSkus) {
            if (filename.includes(sku)) {
                baseSku = sku;
                break;
            }
        }

        if (!rawText || rawText.length < 20 || !baseSku) return null;

        // Skip if this product already has mixingInstructions in inventory.ts
        if (inventoryContent.indexOf(`"sku": "${baseSku}"`) !== -1) {
            let skuRegex = new RegExp(`(\"sku\":\\s*\"${baseSku}\"[\\s\\S]*?\"batches\":\\s*\\[\\s*\\{[\\s\\S]*?\\}\\s*\\])`, 'g');
            let blockMatch = skuRegex.exec(inventoryContent);
            if (blockMatch && blockMatch[0].includes('"mixingInstructions"')) {
                return null; // Already processed
            }
        }

        const prompt = promptTemplate.replace('[LIST_OF_SKUS]', validSkusStr) + '\n\nTEXTO DE LA FICHA TÉCNICA (SKU BASE: ' + baseSku + '):\n' + rawText;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json"
            }
        });

        let jsonText = response.text || "{}";
        
        let result = JSON.parse(jsonText);
        return result;

    } catch (e) {
        console.error(`Error with API for ${filePath}: ${e.message}`);
        return null; // Return null so we can continue
    }
}

async function run() {
    let filesToProcess = [];
    extractionDirs.forEach(dirName => {
        const fullPath = path.join(rootDir, dirName);
        if (fs.existsSync(fullPath)) {
            const files = fs.readdirSync(fullPath);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    filesToProcess.push(path.join(fullPath, file));
                }
            });
        }
    });

    console.log(`Found ${filesToProcess.length} files to process.`);
    
    let updatedCount = 0;
    let report = [];

    // Process just a few files first to avoid a massive run and rate limits
    // We'll process 10 files as a test run.
    for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        
        // Let's only process max 20 files that actually get sent to API
        if (updatedCount >= 20) break; 
        
        const result = await processFile(file);
        if (result && result.mixingInstructions && result.baseSku) {
            
            // Check if valid SKU
            let sku = result.baseSku;
            let mix = result.mixingInstructions;
            
            let skuRegex = new RegExp(`(\"sku\":\\s*\"${sku}\"[\\s\\S]*?\"batches\":\\s*\\[\\s*\\{[\\s\\S]*?\\}\\s*\\])(\\r?\\n\\s*)`, 'g');
            if (skuRegex.test(inventoryContent)) {
                 let actuallyUpdated = false;
                 inventoryContent = inventoryContent.replace(skuRegex, (m, p1, p2) => {
                     if (m.includes('"mixingInstructions"')) return m;
                     actuallyUpdated = true;
                     return p1 + ',' + p2 + `"mixingInstructions": "${mix}"` + p2;
                 });
                 
                 if (actuallyUpdated) {
                     updatedCount++;
                     report.push({file: path.basename(file), baseSku: sku, mixingInstructions: mix});
                     console.log(`Updated ${sku}: ${mix}`);
                     fs.writeFileSync(inventoryPath, inventoryContent); // Save immediately
                 }
            }
        }
        
        // Rate limit delay (1 second)
        await delay(1000);
    }
    
    const summaryPath = path.join(rootDir, 'Avalon_V1_CODE', 'scratch', 'ai_extraction_report.json');
    fs.writeFileSync(summaryPath, JSON.stringify({updatedCount, items: report}, null, 2));

    console.log(`Batch finished. Updated ${updatedCount} products.`);
}

run();
