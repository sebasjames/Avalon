const fs = require('fs');
let p = 'components/accounting/CajaMenorTab.tsx';
let c = fs.readFileSync(p, 'utf-8');
c = c.substring(0, c.lastIndexOf(');\\n};\\n')) + '\\n    );\\n};\\n';
fs.writeFileSync(p, c);
