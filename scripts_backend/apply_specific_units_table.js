import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const unitMap = {
    'IL-TXS 521': 'LT',
    'IL-TX 72': 'LT',
    'IL-TX 75': 'LT',
    'IL-TX 90 X 12,5': 'LT',
    'IL-TX 90': 'LT',
    'IL-TX 92': 'LT',
    'IL-TXS 5900': 'LT',
    'IL-TXS 1V671': 'LT',
    'IL-TXW 13': 'LT',
    'IL-TXW 14': 'LT',
    'IL-TSM 0476': 'LT',
    'IL-TG 25': 'LT',
    'IL-PL 1070': 'KG',
    'IL-TTM 5023': 'KG',
    'IL-TTM 5AA1': 'LT'
};

// Sort keys by length descending so longer SKUs are checked first
const sortedKeys = Object.keys(unitMap).sort((a, b) => b.length - a.length);

const lines = content.split('\n');
const newLines = [];
let currentProductLines = [];
let insideProduct = false;

let currentSku = '';
let currentName = '';

let updateCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!insideProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        insideProduct = true;
        currentProductLines = [line];
        currentSku = '';
        currentName = '';
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

        if (line.trim() === '},' || line.trim() === '}') {
            insideProduct = false;

            let targetUnit = null;
            for (const key of sortedKeys) {
                if (currentSku === key || currentSku.startsWith(key + ' ') || currentSku.startsWith(key + '-')) {
                    targetUnit = unitMap[key];
                    break;
                }
            }

            let modified = false;
            if (targetUnit) {
                for (let j = 0; j < currentProductLines.length; j++) {
                    if (currentProductLines[j].includes('baseUnit:')) {
                        const oldUnitMatch = currentProductLines[j].match(/baseUnit:\s*['"]([^'"]+)['"]/);
                        if (oldUnitMatch && oldUnitMatch[1] !== targetUnit) {
                            currentProductLines[j] = currentProductLines[j].replace(`'${oldUnitMatch[1]}'`, `'${targetUnit}'`).replace(`"${oldUnitMatch[1]}"`, `"${targetUnit}"`);
                            modified = true;
                        }
                        break;
                    }
                }
            }

            if (modified) {
                console.log(`Updated ${currentSku} to ${targetUnit}`);
                updateCount++;
            }
            newLines.push(...currentProductLines);
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(constantsPath, newLines.join('\n'));
console.log(`\nUpdated ${updateCount} products in constants.ts.`);
