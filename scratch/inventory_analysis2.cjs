const fs = require('fs');
let content = fs.readFileSync('data/inventory.ts', 'utf-8');

const blocks = content.split('"sku":');
let densityCount = 0;
let mixes = [];

blocks.slice(1).forEach(block => {
    // block starts with something like `"IMD8400",\n...`
    const skuMatch = block.match(/^\s*"([^"]+)"/);
    if (!skuMatch) return;
    const sku = skuMatch[1];
    
    // Check density
    const densityMatch = block.match(/"density":\s*([^,]+)/);
    if (densityMatch) {
        const d = parseFloat(densityMatch[1]);
        if (!isNaN(d) && d > 0 && d !== 1) {
            densityCount++;
        }
    }
    
    // Check brand
    const brandMatch = block.match(/"brand":\s*"([^"]+)"/);
    const brand = brandMatch ? brandMatch[1] : "Unknown";
    
    // Check mixingInstructions
    const mixMatch = block.match(/"mixingInstructions":\s*"([^"]+)"/);
    if (mixMatch) {
        mixes.push({
            sku,
            brand,
            rule: mixMatch[1]
        });
    }
});

console.log(`With Custom Density: ${densityCount}`);
console.log(`With Mixing Instructions: ${mixes.length}`);

const procoquinalMixes = mixes.filter(p => p.brand.toLowerCase().includes('procoquinal'));
const nonProcoquinalMixes = mixes.filter(p => !p.brand.toLowerCase().includes('procoquinal'));

console.log(`Mixes from Procoquinal: ${procoquinalMixes.length}`);
console.log(`Mixes from other brands: ${nonProcoquinalMixes.length}`);

console.log('\n--- Mixes ---');
mixes.forEach(p => console.log(`${p.sku} (${p.brand}): ${p.rule}`));
