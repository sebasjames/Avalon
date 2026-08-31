const fs = require('fs');
let p = 'components/accounting/CajaMenorTab.tsx';
let c = fs.readFileSync(p, 'utf-8');
c = c.replace(/\\);\\r?\\n\\s*\\);\\n};/, ');\\n};'); // Wait, double escaping
// I will just substring
let lastIdx = c.lastIndexOf(');\\r\\n                            );\\n};');
if (lastIdx !== -1) {
    c = c.substring(0, lastIdx) + ');\\n};';
    fs.writeFileSync(p, c);
    console.log("Fixed CajaMenorTab 1");
} else {
    // try without \r
    let lastIdx2 = c.lastIndexOf(');\\n                            );\\n};');
    if (lastIdx2 !== -1) {
        c = c.substring(0, lastIdx2) + ');\\n};';
        fs.writeFileSync(p, c);
        console.log("Fixed CajaMenorTab 2");
    } else {
        console.log("Not found, replacing last 100 chars");
        c = c.substring(0, c.length - 100) + c.substring(c.length - 100).replace(/\\);\\r?\\n\\s*\\);\\n};/, ');\\n};');
        fs.writeFileSync(p, c);
    }
}
