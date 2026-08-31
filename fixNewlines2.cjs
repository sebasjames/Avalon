const fs = require('fs');
const path = require('path');

['ActivosLiquidezTab', 'CierresTab', 'VentasTab', 'AuditoriaTab', 'ExportacionTab', 'ConciliacionDatafonoTab'].forEach(tabName => {
    const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);
    let compContent = fs.readFileSync(targetPath, 'utf-8');
    
    // Replace "\\n    );" with "\n    );"
    const toReplace = "\\\\n    );";
    const replacement = "\\n    );";
    
    if (compContent.includes(toReplace)) {
        compContent = compContent.replace(toReplace, replacement);
        fs.writeFileSync(targetPath, compContent);
        console.log(`Cleaned newlines in ${tabName}`);
    } else {
        console.log(`String not found in ${tabName}`);
    }
});
