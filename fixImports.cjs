const fs = require('fs');

let c = fs.readFileSync('components/AccountingModule.tsx', 'utf-8');
c = c.replace(/CajaMenorTab';\\\\nimport/g, "CajaMenorTab';\nimport");
c = c.replace(/CajaMenorTab';\\nimport/g, "CajaMenorTab';\nimport");
fs.writeFileSync('components/AccountingModule.tsx', c);

let c2 = fs.readFileSync('components/accounting/CajaMenorTab.tsx', 'utf-8');
console.log("CajaMenorTab ends with:", JSON.stringify(c2.substring(c2.length - 200)));
