const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\James\\Scarpian AI\\Projects\\Procoquinal\\Avalon_V1';
const extractionDirs = [
    'raw_json_extractions',
    'raw_json_extractions_barpimo',
    'raw_json_extractions_ilva',
    'raw_json_extractions_procoquinal'
];

let inventoryPath = path.join(rootDir, 'Avalon_V1_CODE', 'data', 'inventory.ts');
let inventoryContent = fs.readFileSync(inventoryPath, 'utf-8');

let matchCount = 0;
let modifiedSkus = [];

function parseMixing(rawText, baseSku) {
    if (!rawText) return null;
    
    // Attempt to match the pattern:
    // PARTE B (CATALIZADOR) 
    // IG82XE         50
    // PARTE C (DILUYENTE) 
    // IS-11G         50 
    
    // We will look for anything that looks like PARTE B or PARTE C followed by a SKU and a number
    let instructions = [];
    
    let regex = /PARTE\s+[BC]\s*\([^\)]+\)\s*([A-Z0-9\-]+)\s+(\d+(?:\.\d+)?)/gi;
    let match;
    while ((match = regex.exec(rawText)) !== null) {
        let sku = match[1];
        let pct = match[2];
        if (sku !== baseSku) {
             instructions.push(`${sku}:${pct}`);
        }
    }
    
    if (instructions.length > 0) {
        return instructions.join('|');
    }
    return null;
}

extractionDirs.forEach(dirName => {
    const fullPath = path.join(rootDir, dirName);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
                    const data = JSON.parse(content);
                    const rawText = data.rawText || data.raw_text_snippet || "";
                    const sku = data.sku || "";
                    
                    if (sku && rawText) {
                        let mix = parseMixing(rawText, sku);
                        if (mix) {
                            // Find the product in inventory.ts
                            // We need to replace the block for this sku
                            let skuRegex = new RegExp(`(\"sku\":\\s*\"${sku}\"[\\s\\S]*?\"batches\":\\s*\\[\\s*\\{[\\s\\S]*?\\}\\s*\\])(\\r?\\n\\s*)`, 'g');
                            if (skuRegex.test(inventoryContent)) {
                                // Only update if it doesn't already have mixingInstructions
                                if (!inventoryContent.includes(`"sku": "${sku}"`) || inventoryContent.indexOf(`"mixingInstructions"`) === -1) {
                                    inventoryContent = inventoryContent.replace(skuRegex, (m, p1, p2) => {
                                         if (m.includes('"mixingInstructions"')) return m; // Skip if already there
                                         return p1 + ',' + p2 + `"mixingInstructions": "${mix}"` + p2;
                                    });
                                    matchCount++;
                                    modifiedSkus.push({sku, mix});
                                }
                            }
                        }
                    }
                } catch (e) {
                    // ignore parse errors
                }
            }
        });
    }
});

fs.writeFileSync(inventoryPath, inventoryContent);
const summaryPath = path.join(rootDir, 'Avalon_V1_CODE', 'scratch', 'mixing_updates.json');
fs.writeFileSync(summaryPath, JSON.stringify({updated: matchCount, items: modifiedSkus}, null, 2));

console.log(`Successfully updated ${matchCount} products with mixing instructions.`);
