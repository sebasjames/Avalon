const fs = require('fs');
const path = require('path');

['ActivosLiquidezTab', 'CierresTab', 'VentasTab', 'AuditoriaTab', 'ExportacionTab', 'ConciliacionDatafonoTab'].forEach(tabName => {
    const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);
    let compContent = fs.readFileSync(targetPath, 'utf-8');
    
    // Replace "\\n    );" with "\n    );"
    const toReplace = "\\n    );"; // this is literally backslash n in the file
    const replacement = "\\n    );"; // wait, to write an actual newline, I use "\n". 
    
    if (compContent.includes("\\n    );")) {
        compContent = compContent.replace("\\n    );", "\\n    );");
        fs.writeFileSync(targetPath, compContent);
        console.log(`Cleaned newlines in ${tabName}`);
    } else {
        console.log(`String not found in ${tabName}`);
    }
});
