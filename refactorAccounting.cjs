const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

const tabs = [
    { name: 'SabanaTab', key: 'sabana' },
    { name: 'ActivosLiquidezTab', key: 'activos_liquidez' },
    { name: 'CierresTab', key: 'cierres' },
    { name: 'VentasTab', key: 'ventas' },
    { name: 'AuditoriaTab', key: 'auditoria' },
    { name: 'ExportacionTab', key: 'exportacion' },
    { name: 'ImportacionesTab', key: 'importaciones' },
    { name: 'ConciliacionDatafonoTab', key: 'conciliacion_datafono' },
    { name: 'FacturasCorreoTab', key: 'facturas_correo' },
    { name: 'CajaMenorTab', key: 'caja_menor' }
];

// Helper to find matching bracket
function findClosingBracket(str, openPos) {
    let count = 1;
    let pos = openPos + 1;
    while (count > 0 && pos < str.length) {
        if (str[pos] === '(') count++;
        if (str[pos] === ')') count--;
        pos++;
    }
    return pos;
}

let importStatements = [];

tabs.forEach(tab => {
    const searchStr1 = `{activeTab === '${tab.key}' && (`;
    const searchStr2 = `{activeTab === '${tab.key}' && (() => {`;
    
    let startIdx = content.indexOf(searchStr1);
    let isFunc = false;
    let searchStr = searchStr1;
    
    if (startIdx === -1) {
        startIdx = content.indexOf(searchStr2);
        isFunc = true;
        searchStr = searchStr2;
    }
    
    if (startIdx !== -1) {
        let openParenIdx = startIdx + searchStr.length - 1;
        let closeParenIdx = findClosingBracket(content, openParenIdx);
        
        let jsxContent = content.substring(openParenIdx + 1, closeParenIdx - 1);
        
        if (isFunc) {
            // Very naive stripping for this specific structure
            jsxContent = jsxContent.replace(/^\s*\(\)\s*=>\s*\{/, '');
            jsxContent = jsxContent.replace(/\}\s*$/, '');
        }

        // Just writing the raw JSX for now into text files to inspect them
        fs.writeFileSync(path.join(__dirname, 'components', 'accounting', `${tab.name}_raw.tsx`), jsxContent);
        console.log(`Extracted ${tab.name}`);
    }
});
