const fs = require('fs');
const content = fs.readFileSync('buildExportacionTab.cjs', 'utf-8');
console.log("Builder script:", content);
