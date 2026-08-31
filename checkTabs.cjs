const fs = require('fs');
const path = require('path');

function fix(tabName) {
    const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);
    let compContent = fs.readFileSync(targetPath, 'utf-8');
    
    // Instead of regex on empty return, if it failed because it had return (\n\n    ); it is unchanged!
    // So let's look for "return (" and ");" manually
    const start = compContent.indexOf('return (');
    const end = compContent.lastIndexOf(');');
    
    if (start !== -1 && end !== -1 && start < end) {
        const inside = compContent.substring(start + 'return ('.length, end).trim();
        if (!inside) {
            console.log(`Still empty: ${tabName}`);
        } else {
            console.log(`Has content now, but might be malformed: ${tabName}`);
        }
    } else {
        console.log(`Failed to find return blocks for ${tabName}`);
    }
}

['ActivosLiquidezTab', 'CierresTab', 'VentasTab', 'AuditoriaTab', 'ExportacionTab', 'ConciliacionDatafonoTab'].forEach(fix);
