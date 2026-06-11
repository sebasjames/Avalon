import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
const newLines = [];
let currentProductLines = [];
let insideProduct = false;

let currentName = '';
let currentBrand = '';
let updateCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!insideProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        insideProduct = true;
        currentProductLines = [line];
        currentName = '';
        currentBrand = '';
        continue;
    }

    if (insideProduct) {
        currentProductLines.push(line);

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
            if (currentBrand.toUpperCase() === 'PROCOQUINAL' && currentName.toUpperCase().includes('TINTILLA')) {
                const targetUnit = 'LT';
                let modified = false;

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

                if (modified) {
                    updateCount++;
                    console.log(`Updated to LT: ${currentName}`);
                }
            }

            newLines.push(...currentProductLines);
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(constantsPath, newLines.join('\n'));
console.log(`Updated ${updateCount} Tintillas from PROCOQUINAL to LT.`);
