const fs = require('fs');
let content = fs.readFileSync('data/inventory.ts', 'utf-8');

// We will use regex to find all products since it's a TS file
const products = [];
let match;
const regex = /\{\s*"id":\s*"[^"]+",\s*"sku":\s*"([^"]+)",[\s\S]*?"brand":\s*"([^"]+)",[\s\S]*?"density":\s*([^,]+),[\s\S]*?("mixingInstructions":\s*"[^"]+")?/g;

while ((match = regex.exec(content)) !== null) {
    products.push({
        sku: match[1],
        brand: match[2],
        density: match[3],
        hasMix: match[4] ? true : false,
        mixRule: match[4]
    });
}

const withDensity = products.filter(p => p.density !== '1' && p.density !== 'null' && p.density !== 'undefined' && parseFloat(p.density) > 0);
const withMix = products.filter(p => p.hasMix);
const procoquinalMixes = withMix.filter(p => p.brand.toLowerCase().includes('procoquinal'));
const nonProcoquinalMixes = withMix.filter(p => !p.brand.toLowerCase().includes('procoquinal'));

console.log(`Total Products Extracted: ${products.length}`);
console.log(`With Custom Density: ${withDensity.length}`);
console.log(`With Mixing Instructions: ${withMix.length}`);
console.log(`Mixes from Procoquinal: ${procoquinalMixes.length}`);
console.log(`Mixes from other brands: ${nonProcoquinalMixes.length}`);

console.log('\n--- Mixes (Procoquinal) ---');
procoquinalMixes.forEach(p => console.log(`${p.sku}: ${p.mixRule}`));

console.log('\n--- Mixes (Otras Marcas) ---');
nonProcoquinalMixes.forEach(p => console.log(`${p.sku} (${p.brand}): ${p.mixRule}`));
