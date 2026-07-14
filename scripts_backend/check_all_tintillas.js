import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
let inside = false;
let name = '', brand = '', unit = '';

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!inside && l.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        inside = true;
        name = ''; brand = ''; unit = '';
    }
    if (inside) {
        if (l.includes('name:')) {
            const m = l.match(/name:\s*['"]([^'"]+)['"]/);
            if (m) name = m[1];
        }
        if (l.includes('brand:')) {
            const m = l.match(/brand:\s*['"]([^'"]+)['"]/);
            if (m) brand = m[1];
        }
        if (l.includes('baseUnit:')) {
            const m = l.match(/baseUnit:\s*['"]([^'"]+)['"]/);
            if (m) unit = m[1];
        }
        if (l.trim() === '},' || l.trim() === '}') {
            inside = false;
            if (name.toUpperCase().includes('TINTILLA')) {
                console.log(`${name} | Brand: ${brand} | Unit: ${unit}`);
            }
        }
    }
}
