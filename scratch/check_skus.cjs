const fs = require('fs');
let c = fs.readFileSync('data/inventory.ts', 'utf-8');
let matches = c.match(/\"sku\":\s*\"I[GS][^\"]*\"/g);
console.log(matches ? matches.slice(0, 10) : 'none');
