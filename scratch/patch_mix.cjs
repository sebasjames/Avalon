const fs = require('fs');

let c = fs.readFileSync('data/inventory.ts', 'utf-8');

// Find IMD8400 block
// The block ends around "batches": [...]
// We'll replace it.

let replaced = false;
c = c.replace(/(\"sku\": \"IMD8400\"[\s\S]*?\"batches\": \[\s*\{[\s\S]*?\}\s*\])(\r?\n\s*)/g, (match, p1, p2) => {
    replaced = true;
    return p1 + ',' + p2 + '"mixingInstructions": "IG82XE:50|IS-11G:50"' + p2;
});

if (replaced) {
    fs.writeFileSync('data/inventory.ts', c);
    console.log('Successfully added mixingInstructions for IMD8400');
} else {
    console.log('Failed to find IMD8400 block to replace');
}
