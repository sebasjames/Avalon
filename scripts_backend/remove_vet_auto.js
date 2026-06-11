import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
const newLines = [];

let insideProduct = false;
let currentProductLines = [];
let hasVetAuto = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of an object inside the MOCK_INVENTORY array
    // Objects start with "  {" or "    {"
    if (!insideProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        insideProduct = true;
        currentProductLines = [line];
        hasVetAuto = false;
        continue;
    }

    if (insideProduct) {
        currentProductLines.push(line);
        if (line.includes('sku:') && line.includes('VET-AUTO-')) {
            hasVetAuto = true;
        }

        // Detect end of the object
        if (line.trim() === '},' || line.trim() === '}') {
            insideProduct = false;
            if (!hasVetAuto) {
                newLines.push(...currentProductLines);
            } else {
                console.log('Removed a VET-AUTO product');
            }
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(constantsPath, newLines.join('\n'));
console.log('Cleanup complete!');
