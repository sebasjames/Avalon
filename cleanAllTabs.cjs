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

cleanTab("{/* TAB 1: SABANA GENERAL */}", "{/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}", 
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
                        
cleanTab("{/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}", "{/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}", 
    `{/* TAB: ACTIVOS & LIQUIDEZ (CARTERA E INVENTARIO CONSOLIDADO) */}
                        {activeTab === 'activos_liquidez' && (
                            <ActivosLiquidezTab 
                                inventory={inventory}
                                expandedCarteraClient={expandedCarteraClient}
                                setExpandedCarteraClient={setExpandedCarteraClient}
                            />
                        )}`);
                        
cleanTab("{/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}", "{/* TAB 3: VENTAS */}", 
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

cleanTab("{/* TAB 3: VENTAS */}", "{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}", 
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

cleanTab("{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}", "{/* TAB 6: EXPORTACIÓN SIIGO */}", 
    `{/* TAB 4: AUDITORIA DE TERCEROS (AUTO-AUDITOR) */}
                        {activeTab === 'auditoria' && (
                            <AuditoriaTab 
                                activeReport={auditReports[0]} 
                                runAuditAction={runAuditAction}
                                auditReports={auditReports}
                                setSelectedReportId={() => {}}
                            />
                        )}`);

cleanTab("{/* TAB 6: EXPORTACIÓN SIIGO */}", "{/* TAB 7: IMPORTACIONES EDI */}", 
    `{/* TAB 6: EXPORTACIÓN SIIGO */}
                        {activeTab === 'exportacion' && (
                            <ExportacionTab handleExportSIIGO={handleExportSIIGO} />
                        )}`);
                        
cleanTab("{/* TAB 7: IMPORTACIONES EDI */}", "{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}", 
    `{/* TAB 7: IMPORTACIONES EDI */}
                        {activeTab === 'importaciones' && (
                            <ImportacionesTab />
                        )}`);

cleanTab("{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}", "{/* TAB: FACTURAS POR CORREO */}", 
    `{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}
                        {activeTab === 'conciliacion_datafono' && (
                            <ConciliacionDatafonoTab 
                                transactions={transactions}
                                reconcileDatáfonoTransaction={reconcileDatáfonoTransaction}
                            />
                        )}`);

const statesToRemove = [
    /    \/\/ --- DATÁFONO RECONCILIATION STATE ---\\r?\\n/,
    /    const \[bankTransactions, setBankTransactions\] = useState<any\[\]>\(\[\]\);\\r?\\n/,
    /    const \[saleSearch, setSaleSearch\] = useState\(''\);\\r?\\n/,
    /    const \[bankSearch, setBankSearch\] = useState\(''\);\\r?\\n/,
    /    const \[bankFileName, setBankFileName\] = useState\(''\);\\r?\\n/,
    /    const \[activeValidationSale, setActiveValidationSale\] = useState<AccountingTransaction \| null>\(null\);\\r?\\n/,
    /    const \[bankAmountInput, setBankAmountInput\] = useState\(''\);\\r?\\n/,
    /    const \[bankFeeInput, setBankFeeInput\] = useState\(''\);\\r?\\n/,
    /    const \[reconciledList, setReconciledList\] = useState<any\[\]>\(\[\]\);\\r?\\n/,
    /    const \[showReviewModal, setShowReviewModal\] = useState\(false\);\\r?\\n/,
    /    \/\/ --- EXTENSIÓN CONCILIACIÓN BANCARIA ---\\r?\\n/,
    /    const \[reconciliationType, setReconciliationType\] = useState<'DATAFONO' \| 'DAVIVIENDA' \| 'BBVA'>\('DATAFONO'\);\\r?\\n/,
    /    const \[reteFuenteInput, setReteFuenteInput\] = useState\('0'\);\\r?\\n/,
    /    const \[reteIvaInput, setReteIvaInput\] = useState\('0'\);\\r?\\n/,
    /    const \[reteIcaInput, setReteIcaInput\] = useState\('0'\);\\r?\\n/,
    /    const \[isProcessingAI, setIsProcessingAI\] = useState\(false\);\\r?\\n/
];

for (const regex of statesToRemove) {
    content = content.replace(regex, '');
}

// Remove suggestedMatches
const matchS = content.indexOf('const suggestedMatches = useMemo(() => {');
if (matchS !== -1) {
    const endStr = '}, [bankTransactions, transactions, reconciledList]);';
    const endS = content.indexOf(endStr, matchS);
    if (endS !== -1) {
        content = content.slice(0, matchS) + content.slice(endS + endStr.length + 1);
    }
}

fs.writeFileSync(modulePath, content);
console.log('Cleaned ALL tabs in AccountingModule.tsx');
