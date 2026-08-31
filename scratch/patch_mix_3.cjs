const fs = require('fs');

let c = fs.readFileSync('data/inventory.ts', 'utf-8');
let replaced1 = false;
let replaced2 = false;

// Patch ILM1007
c = c.replace(/(\"sku\": \"ILM1007\"[\s\S]*?\"batches\": \[\s*\{[\s\S]*?\}\s*\])(\r?\n\s*)/g, (match, p1, p2) => {
    replaced1 = true;
    return p1 + ',' + p2 + '"mixingInstructions": "IGH822:100|IG23EL:90"' + p2;
});

// Patch IKRD260
c = c.replace(/(\"sku\": \"IKRD260\"[\s\S]*?\"batches\": \[\s*\{[\s\S]*?\}\s*\])(\r?\n\s*)/g, (match, p1, p2) => {
    replaced2 = true;
    return p1 + ',' + p2 + '"mixingInstructions": "IGH822:20|IG23EL:10"' + p2;
});

if (replaced1 || replaced2) {
    fs.writeFileSync('data/inventory.ts', c);
    console.log(`Successfully patched ILM1007: ${replaced1}, IKRD260: ${replaced2}`);
} else {
    console.log('Failed to patch products');
}
