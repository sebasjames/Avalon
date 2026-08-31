const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
let content = fs.readFileSync(modulePath, 'utf-8');

function cleanTab(startMarker, endMarker, replacement) {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker, startIdx);
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + replacement + "\\n\\n                        " + content.substring(endIdx);
    }
}

cleanTab("{/* TAB: FACTURAS POR CORREO */}", "{/* TAB 10: CAJA MENOR */}", 
    `{/* TAB: FACTURAS POR CORREO */}
                        {activeTab === 'facturas_correo' && (
                            <FacturasCorreoTab 
                                inboxMails={inboxMails}
                                activeMailId={activeMailId}
                                setActiveMailId={setActiveMailId}
                                handleContabilizarFactura={handleContabilizarFactura}
                            />
                        )}`);
                        
cleanTab("{/* TAB 10: CAJA MENOR */}", "{/* MODAL: CONTABILIZAR FACTURA PROVEEDOR CON IA */}", 
    `{/* TAB 10: CAJA MENOR */}
                        {activeTab === 'caja_menor' && (
                            <CajaMenorTab 
                                transactions={transactions}
                            />
                        )}`);

const strToRemove = [
    "    // --- CAJA MENOR STATE ---\\r?\\n",
    "    const FONDO_BASE = 1500000; // COP 1,500,000 as base\\r?\\n",
    "    const [cajaMenorSearch, setCajaMenorSearch] = useState('');\\r?\\n",
    "    const [cajaMenorFilter, setCajaMenorFilter] = useState('ALL');\\r?\\n"
];

for (const str of strToRemove) {
    content = content.replace(new RegExp(str), '');
}

// Ensure imports
if (!content.includes('import { FacturasCorreoTab }')) {
    content = content.replace(
        "import { ConciliacionDatafonoTab } from './accounting/ConciliacionDatafonoTab';",
        "import { ConciliacionDatafonoTab } from './accounting/ConciliacionDatafonoTab';\\nimport { FacturasCorreoTab } from './accounting/FacturasCorreoTab';\\nimport { CajaMenorTab } from './accounting/CajaMenorTab';"
    );
}

fs.writeFileSync(modulePath, content);
console.log('Cleaned FacturasCorreo and CajaMenor in AccountingModule');
