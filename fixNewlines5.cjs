const fs = require('fs');
const path = require('path');

['ActivosLiquidezTab', 'CierresTab', 'VentasTab', 'AuditoriaTab', 'ExportacionTab', 'ConciliacionDatafonoTab'].forEach(tabName => {
    const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);
    let compContent = fs.readFileSync(targetPath, 'utf-8');
    
    // In node, "\\n    );" is the literal string "\n    );"
    const toReplace = "\\n    );";
    // We replace it with "\n    );" which is a real newline
    const replacement = "\n    );";
    
    compContent = compContent.replace(toReplace, replacement);
    fs.writeFileSync(targetPath, compContent);
    console.log(`Fixed ${tabName}`);
});
