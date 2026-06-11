import fs from 'fs';

const content = fs.readFileSync('C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts', 'utf-8');
const lines = content.split('\n');

let currentSku = '';
let currentName = '';

for (const line of lines) {
    if (line.includes('sku:')) {
        const match = line.match(/sku:\s*['"]([^'"]+)['"]/);
        if (match) currentSku = match[1];
    }
    if (line.includes('name:')) {
        const match = line.match(/name:\s*['"]([^'"]+)['"]/);
        if (match) currentName = match[1];
        
        if (currentSku.includes('VET-AUTO')) {
            console.log(`${currentSku} -> ${currentName}`);
        }
    }
}
