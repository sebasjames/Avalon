import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
const products = [];
let currentProduct = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!currentProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        currentProduct = {};
        continue;
    }

    if (currentProduct) {
        if (line.includes('sku:')) {
            const match = line.match(/sku:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.sku = match[1];
        }
        if (line.includes('name:')) {
            const match = line.match(/name:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.name = match[1];
        }

        if (line.trim() === '},' || line.trim() === '}') {
            if (currentProduct.sku && currentProduct.name) {
                if (currentProduct.sku.endsWith('QT') || currentProduct.name.includes('QT') || currentProduct.name.includes('1/4 GALÓN')) {
                    products.push(currentProduct);
                }
            }
            currentProduct = null;
        }
    }
}

console.log(products.slice(0, 10));
console.log('Total matches:', products.length);
