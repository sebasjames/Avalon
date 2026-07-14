import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
const products = [];
let currentProduct = null;
let currentProductLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!currentProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        currentProduct = { lines: [line] };
        continue;
    }

    if (currentProduct) {
        currentProduct.lines.push(line);
        
        if (line.includes('sku:')) {
            const match = line.match(/sku:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.sku = match[1];
        }
        if (line.includes('brand:')) {
            const match = line.match(/brand:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.brand = match[1];
        }

        if (line.trim() === '},' || line.trim() === '}') {
            if (currentProduct.sku) {
                products.push(currentProduct);
            }
            currentProduct = null;
        }
    }
}

// Find generic candidates
const genericSkusToRemove = [];

products.forEach(baseProduct => {
    const baseSku = baseProduct.sku;
    
    // Only target Barpimo
    if (baseProduct.brand !== 'BARPIMO') return;

    const variants = products.filter(p => 
        p.sku !== baseSku && 
        (p.sku.startsWith(baseSku + ' ') || p.sku.startsWith(baseSku + '-'))
    );

    if (variants.length > 0) {
        genericSkusToRemove.push(baseSku);
    }
});

console.log('Barpimo generics to remove:', genericSkusToRemove);

// Now recreate the file
const newLines = [];
let insideTargetProduct = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!insideTargetProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        // Look ahead to find sku
        let isTarget = false;
        for (let j = i + 1; j < i + 10; j++) {
            if (lines[j] && lines[j].includes('sku:')) {
                const match = lines[j].match(/sku:\s*['"]([^'"]+)['"]/);
                if (match && genericSkusToRemove.includes(match[1])) {
                    isTarget = true;
                }
                break;
            }
        }
        
        if (isTarget) {
            insideTargetProduct = true;
            continue;
        }
    }

    if (insideTargetProduct) {
        if (line.trim() === '},' || line.trim() === '}') {
            insideTargetProduct = false;
        }
        continue;
    }

    newLines.push(line);
}

if (genericSkusToRemove.length > 0) {
    fs.writeFileSync(constantsPath, newLines.join('\n'));
    console.log(`Successfully removed ${genericSkusToRemove.length} generic Barpimo products.`);
} else {
    console.log('No generic Barpimo products found to remove.');
}
