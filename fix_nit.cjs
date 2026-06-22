const fs = require('fs');
const data = fs.readFileSync('constants.ts', 'utf8');
const result = data.replace(/nit: '(.+?)'/g, "documentType: 'NIT', documentNumber: '$1'");
fs.writeFileSync('constants.ts', result);
