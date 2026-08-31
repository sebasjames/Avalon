const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
const content = fs.readFileSync(modulePath, 'utf-8');

function extractJSX(startMarker, endMarker) {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker, startIdx);
    if (startIdx === -1 || endIdx === -1) {
        console.error('Markers not found:', startMarker, endMarker);
        return '';
    }
    
    const conditionStr = "&& (";
    const condIdx = content.indexOf(conditionStr, startIdx);
    if (condIdx === -1 || condIdx > endIdx) {
        // Special case for 'caja_menor' maybe: "&& (() => {"
        const condIdx2 = content.indexOf("&& (() => {", startIdx);
        if (condIdx2 !== -1 && condIdx2 < endIdx) {
            const contentStart = condIdx2 + "&& (() => {".length;
            let contentEnd = content.lastIndexOf('})()}', endIdx);
            return content.substring(contentStart, contentEnd);
        }
        return '';
    }
    
    const contentStart = condIdx + conditionStr.length;
    let contentEnd = content.lastIndexOf(')}', endIdx);
    
    return content.substring(contentStart, contentEnd);
}

function updateComponent(tabName, startMarker, endMarker) {
    const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);
    const jsx = extractJSX(startMarker, endMarker);
    if (!jsx) {
        console.error(`Failed to extract JSX for ${tabName}`);
        return;
    }
    
    let compContent = fs.readFileSync(targetPath, 'utf-8');
    // We want to replace whatever is inside return ( ... ); with our jsx.
    // Sometimes it's empty like return (\n\n    ); or return (\n    );
    // So we use regex to replace between return ( and );
    compContent = compContent.replace(/return \\([\\s\\S]*?\\);/, `return (${jsx}\\n    );`);
    fs.writeFileSync(targetPath, compContent);
    console.log(`Updated ${tabName}`);
}

updateComponent('ActivosLiquidezTab', "{/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}", "{/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}");
updateComponent('CierresTab', "{/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}", "{/* TAB 3: VENTAS */}");
updateComponent('VentasTab', "{/* TAB 3: VENTAS */}", "{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}");
updateComponent('AuditoriaTab', "{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}", "{/* TAB 6: EXPORTACIÓN SIIGO */}");
updateComponent('ExportacionTab', "{/* TAB 6: EXPORTACIÓN SIIGO */}", "{/* TAB 7: IMPORTACIONES EDI */}");
updateComponent('ConciliacionDatafonoTab', "{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}", "{/* TAB: FACTURAS POR CORREO */}");

