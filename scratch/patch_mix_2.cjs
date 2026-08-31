const fs = require('fs');

let c = fs.readFileSync('data/inventory.ts', 'utf-8');

let replaced = false;
c = c.replace(/"mixingInstructions": "IG82XE:50\|IS-11G:50"/g, () => {
    replaced = true;
    return '"mixingInstructions": "IGH822:50|IG23EL:50"';
});

if (replaced) {
    fs.writeFileSync('data/inventory.ts', c);
    console.log('Successfully updated mixingInstructions to use existing SKUs');
} else {
    console.log('Failed to find old mixing rule');
}
