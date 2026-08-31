const fs = require('fs');
const path = require('path');

['ActivosLiquidezTab', 'CierresTab', 'VentasTab', 'AuditoriaTab', 'ExportacionTab', 'ConciliacionDatafonoTab'].forEach(tabName => {
    const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);
    let compContent = fs.readFileSync(targetPath, 'utf-8');
    
    // In JS literal regex: \\n means literal backslash n
    compContent = compContent.replace(/\\n\s*\);/g, '\\n    );');
    fs.writeFileSync(targetPath, compContent);
    console.log(`Replaced in ${tabName}`);
});
