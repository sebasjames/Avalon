import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
const newLines = [];
let currentProductLines = [];
let insideProduct = false;

// Variables to keep track of current product attributes
let currentSku = '';
let currentName = '';
let currentBrand = '';

let updateCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!insideProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        insideProduct = true;
        currentProductLines = [line];
        currentSku = '';
        currentName = '';
        currentBrand = '';
        continue;
    }

    if (insideProduct) {
        currentProductLines.push(line);

        if (line.includes('sku:')) {
            const match = line.match(/sku:\s*['"]([^'"]+)['"]/);
            if (match) currentSku = match[1];
        }
        if (line.includes('name:')) {
            const match = line.match(/name:\s*['"]([^'"]+)['"]/);
            if (match) currentName = match[1];
        }
        if (line.includes('brand:')) {
            const match = line.match(/brand:\s*['"]([^'"]+)['"]/);
            if (match) currentBrand = match[1];
        }

        if (line.trim() === '},' || line.trim() === '}') {
            insideProduct = false;

            // Process product logic
            let modified = false;
            if (currentBrand === 'ILVA') {
                const nameUpper = currentName.toUpperCase();
                const skuUpper = currentSku.toUpperCase();
                
                // Identify if it's an acrylic or TX
                const isAcrylicOrTx = nameUpper.includes('ACRILICO') || nameUpper.includes('ACRÍLICO') || skuUpper.includes('-TX');

                if (isAcrylicOrTx) {
                    let targetUnit = null;

                    if (skuUpper.startsWith('IL-TG 25')) {
                        // Exception requested by user
                        targetUnit = 'KG';
                    } else if (nameUpper.includes('TRANSP') || nameUpper.includes('INCOLORO') || nameUpper.includes('CLEAR') || nameUpper.includes('NEUTRO')) {
                        targetUnit = 'LT';
                    } else if (nameUpper.includes('BLANC') || nameUpper.includes('PIG') || nameUpper.includes('COLOR') || skuUpper.includes('IL-TTM 5023') || skuUpper.includes('IL-PL 1070')) {
                        targetUnit = 'KG';
                    } else if (skuUpper.includes('-TX')) {
                        targetUnit = 'LT';
                    }

                    if (targetUnit) {
                        // Apply the change
                        for (let j = 0; j < currentProductLines.length; j++) {
                            if (currentProductLines[j].includes('baseUnit:')) {
                                const oldUnitMatch = currentProductLines[j].match(/baseUnit:\s*['"]([^'"]+)['"]/);
                                if (oldUnitMatch && oldUnitMatch[1] !== targetUnit) {
                                    currentProductLines[j] = currentProductLines[j].replace(oldUnitMatch[1], targetUnit);
                                    modified = true;
                                }
                                break;
                            }
                        }
                    }
                }
            }

            if (modified) updateCount++;
            newLines.push(...currentProductLines);
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(constantsPath, newLines.join('\n'));
console.log(`Updated ${updateCount} acrylic products in constants.ts.`);
