const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
let content = fs.readFileSync(modulePath, 'utf-8');

function cleanTabJSX(startMarker, endMarker, replacement) {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker, startIdx);
    if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(0, startIdx) + replacement + "\\n\\n                        " + content.substring(endIdx);
    }
}

cleanTabJSX("{/* TAB 1: SABANA GENERAL */}", "{/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}", 
    `{/* TAB 1: SABANA GENERAL */}
                        {activeTab === 'sabana' && (
                            <SabanaTab 
                                draftFilters={draftFilters}
                                setDraftFilters={setDraftFilters}
                                appliedFilters={appliedFilters}
                                setAppliedFilters={setAppliedFilters}
                                showFilters={showFilters}
                                setShowFilters={setShowFilters}
                                handleExportSabana={handleExportSabana}
                                activeShortcutFilter={activeShortcutFilter}
                                setActiveShortcutFilter={setActiveShortcutFilter}
                                accountingShortcuts={accountingShortcuts}
                            />
                        )}`);
                        
cleanTabJSX("{/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}", "{/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}", 
    `{/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}
                        {activeTab === 'activos_liquidez' && (
                            <ActivosLiquidezTab 
                                inventory={inventory}
                                expandedCarteraClient={expandedCarteraClient}
                                setExpandedCarteraClient={setExpandedCarteraClient}
                            />
                        )}`);
                        
cleanTabJSX("{/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}", "{/* TAB 3: VENTAS */}", 
    `{/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}
                        {activeTab === 'cierres' && (
                            <CierresTab 
                                cierreTimeRange={cierreTimeRange}
                                setCierreTimeRange={setCierreTimeRange}
                                cierreDateFrom={cierreDateFrom}
                                setCierreDateFrom={setCierreDateFrom}
                                showZReport={showZReport}
                                setShowZReport={setShowZReport}
                                handleExportZReport={handleExportZReport}
                            />
                        )}`);

cleanTabJSX("{/* TAB 3: VENTAS */}", "{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}", 
    `{/* TAB 3: VENTAS */}
                        {activeTab === 'ventas' && (
                            <VentasTab 
                                salesMethodFilter={salesMethodFilter}
                                setSalesMethodFilter={setSalesMethodFilter}
                                salesDateFrom={salesDateFrom}
                                setSalesDateFrom={setSalesDateFrom}
                                salesDateTo={salesDateTo}
                                setSalesDateTo={setSalesDateTo}
                                uniqueSalesPaymentMethods={uniqueSalesPaymentMethods}
                                filteredSales={filteredSales}
                                setShowPaymentModal={setShowPaymentModal}
                                setPaymentClient={setPaymentClient}
                                setPaymentAmount={setPaymentAmount}
                                setPaymentBank={setPaymentBank}
                                setPaymentRef={setPaymentRef}
                                setPaymentDate={setPaymentDate}
                                setPaymentSelectedInvoice={setPaymentSelectedInvoice}
                            />
                        )}`);

cleanTabJSX("{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}", "{/* TAB 6: EXPORTACIÓN SIIGO */}", 
    `{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}
                        {activeTab === 'auditoria' && (
                            <AuditoriaTab 
                                activeReport={auditReports[0]} 
                                runAuditAction={runAuditAction}
                                auditReports={auditReports}
                                setSelectedReportId={() => {}}
                            />
                        )}`);

cleanTabJSX("{/* TAB 6: EXPORTACIÓN SIIGO */}", "{/* TAB 7: IMPORTACIONES EDI */}", 
    `{/* TAB 6: EXPORTACIÓN SIIGO */}
                        {activeTab === 'exportacion' && (
                            <ExportacionTab handleExportSIIGO={handleExportSIIGO} />
                        )}`);
                        
cleanTabJSX("{/* TAB 7: IMPORTACIONES EDI */}", "{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}", 
    `{/* TAB 7: IMPORTACIONES EDI */}
                        {activeTab === 'importaciones' && (
                            <ImportacionesTab />
                        )}`);

cleanTabJSX("{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}", "{/* TAB: FACTURAS POR CORREO */}", 
    `{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}
                        {activeTab === 'conciliacion_datafono' && (
                            <ConciliacionDatafonoTab 
                                transactions={transactions}
                                reconcileDatáfonoTransaction={reconcileDatáfonoTransaction}
                            />
                        )}`);

cleanTabJSX("{/* TAB: FACTURAS POR CORREO */}", "{/* TAB 10: CAJA MENOR */}", 
    `{/* TAB: FACTURAS POR CORREO */}
                        {activeTab === 'facturas_correo' && (
                            <FacturasCorreoTab 
                                inboxMails={inboxMails}
                                activeMailId={activeMailId}
                                setActiveMailId={setActiveMailId}
                                handleContabilizarFactura={handleContabilizarFactura}
                            />
                        )}`);

// Caja menor uses a different end because there is no tab marker after it, but we can look for `})()}`
const start10 = content.indexOf("{/* TAB 10: CAJA MENOR */}");
if (start10 !== -1) {
    const end10Str = "})()}";
    const end10 = content.indexOf(end10Str, start10);
    if (end10 !== -1) {
        content = content.substring(0, start10) + 
            `{/* TAB 10: CAJA MENOR */}
                        {activeTab === 'caja_menor' && (
                            <CajaMenorTab 
                                transactions={transactions}
                            />
                        )}` + "\\n\\n" + content.substring(end10 + end10Str.length);
    }
}

// Now remove all the states that we extracted
const strToRemove = [
    "    // --- DATÁFONO RECONCILIATION STATE ---\\r?\\n",
    "    const \\[bankTransactions, setBankTransactions\\] = useState<any\\[\\]>\\(\\[\\]\\);\\r?\\n",
    "    const \\[saleSearch, setSaleSearch\\] = useState\\(''\\);\\r?\\n",
    "    const \\[bankSearch, setBankSearch\\] = useState\\(''\\);\\r?\\n",
    "    const \\[bankFileName, setBankFileName\\] = useState\\(''\\);\\r?\\n",
    "    const \\[activeValidationSale, setActiveValidationSale\\] = useState<AccountingTransaction \\| null>\\(null\\);\\r?\\n",
    "    const \\[bankAmountInput, setBankAmountInput\\] = useState\\(''\\);\\r?\\n",
    "    const \\[bankFeeInput, setBankFeeInput\\] = useState\\(''\\);\\r?\\n",
    "    const \\[reconciledList, setReconciledList\\] = useState<any\\[\\]>\\(\\[\\]\\);\\r?\\n",
    "    const \\[showReviewModal, setShowReviewModal\\] = useState\\(false\\);\\r?\\n",
    "    // --- EXTENSIÓN CONCILIACIÓN BANCARIA ---\\r?\\n",
    "    const \\[reconciliationType, setReconciliationType\\] = useState<'DATAFONO' \\| 'DAVIVIENDA' \\| 'BBVA'>\\('DATAFONO'\\);\\r?\\n",
    "    const \\[reteFuenteInput, setReteFuenteInput\\] = useState\\('0'\\);\\r?\\n",
    "    const \\[reteIvaInput, setReteIvaInput\\] = useState\\('0'\\);\\r?\\n",
    "    const \\[reteIcaInput, setReteIcaInput\\] = useState\\('0'\\);\\r?\\n",
    "    const \\[isProcessingAI, setIsProcessingAI\\] = useState\\(false\\);\\r?\\n",
    "    // --- CAJA MENOR STATE ---\\r?\\n",
    "    const FONDO_BASE = 1500000; // COP 1,500,000 as base\\r?\\n",
    "    const \\[cajaMenorSearch, setCajaMenorSearch\\] = useState\\(''\\);\\r?\\n",
    "    const \\[cajaMenorFilter, setCajaMenorFilter\\] = useState\\('ALL'\\);\\r?\\n"
];

for (const str of strToRemove) {
    content = content.replace(new RegExp(str), '');
}

const matchS = content.indexOf('const suggestedMatches = useMemo(() => {');
if (matchS !== -1) {
    const endStr = '}, [bankTransactions, transactions, reconciledList]);';
    const endS = content.indexOf(endStr, matchS);
    if (endS !== -1) {
        content = content.substring(0, matchS) + content.substring(endS + endStr.length + 1);
    }
}

// Add imports
const imports = `import { SabanaTab } from './accounting/SabanaTab';
import { ActivosLiquidezTab } from './accounting/ActivosLiquidezTab';
import { CierresTab } from './accounting/CierresTab';
import { VentasTab } from './accounting/VentasTab';
import { AuditoriaTab } from './accounting/AuditoriaTab';
import { ExportacionTab } from './accounting/ExportacionTab';
import { ImportacionesTab } from './accounting/ImportacionesTab';
import { ConciliacionDatafonoTab } from './accounting/ConciliacionDatafonoTab';
import { FacturasCorreoTab } from './accounting/FacturasCorreoTab';
import { CajaMenorTab } from './accounting/CajaMenorTab';`;

if (!content.includes('import { SabanaTab }')) {
    content = content.replace("import { formatCOP } from '../utils/format';", imports + "\\nimport { formatCOP } from '../utils/format';");
}

fs.writeFileSync(modulePath, content);
console.log('Cleaned ALL tabs in AccountingModule.tsx');
