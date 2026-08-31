const fs = require('fs');
let content = fs.readFileSync('data/inventory.ts', 'utf-8');
content = content.replace(/^ +density: ".*",?\r?\n/gm, '');
fs.writeFileSync('data/inventory.ts', content);
console.log('Fixed density in inventory.ts');
