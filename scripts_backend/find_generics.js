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
            if (currentProduct.sku) {
                products.push(currentProduct);
            }
            currentProduct = null;
        }
    }
}

const skuMap = new Map();
products.forEach(p => skuMap.set(p.sku, p));

const genericCandidates = [];

products.forEach(baseProduct => {
    const baseSku = baseProduct.sku;
    
    // Find variants that start with baseSku + " " or baseSku + "-"
    const variants = products.filter(p => 
        p.sku !== baseSku && 
        (p.sku.startsWith(baseSku + ' ') || p.sku.startsWith(baseSku + '-'))
    );

    if (variants.length > 0) {
        // Exclude cases where the baseSku is super short (like "A") or common prefixes
        // unless it's an actual product. 
        genericCandidates.push({
            base: baseProduct,
            variants: variants
        });
    }
});

let output = '# Reporte de Productos Base y sus Variantes\n\n';
output += 'Estos son los productos que tienen el SKU base "a solas", pero que también existen en otras unidades o variantes en el inventario. Revisa si quieres borrar los productos base.\n\n';

genericCandidates.forEach(cand => {
    output += `### Base: **${cand.base.sku}** - ${cand.base.name}\n`;
    output += `*Variantes encontradas:*\n`;
    cand.variants.forEach(v => {
        output += `- ${v.sku} - ${v.name}\n`;
    });
    output += `\n`;
});

fs.writeFileSync('C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\analysis.md', output);
console.log(`Found ${genericCandidates.length} generic candidates. Wrote to artifact.`);
