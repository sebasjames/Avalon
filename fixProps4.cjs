const fs = require('fs');
const p = 'components/AccountingModule.tsx';
let c = fs.readFileSync(p, 'utf-8');

c = c.replace(/<ActivosLiquidezTab[^>]*>/m, 
`<ActivosLiquidezTab 
                                inventory={inventory}
                                expandedCarteraClient={expandedCarteraClient}
                                setExpandedCarteraClient={setExpandedCarteraClient}
                                inventarioValorizado={inventarioValorizado}
                                carteraData={carteraData}
                                cxPData={cxPData}
                                leftPanelMode={leftPanelMode}
                                setLeftPanelMode={setLeftPanelMode}
                                setPaymentClient={setPaymentClient}
                                setPaymentAmount={setPaymentAmount}
                                setPaymentRef={setPaymentRef}
                                setPaymentSelectedInvoice={setPaymentSelectedInvoice}
                                setShowPaymentModal={setShowPaymentModal}
                                transactions={transactions}
                                setSelectedCxPInvoice={setSelectedCxPInvoice}
                                setCxPPaymentAmount={setCxPPaymentAmount}
                                setShowCxPPaymentModal={setShowCxPPaymentModal}
                                inventorySortBy={inventorySortBy}
                                setInventorySortBy={setInventorySortBy}
                                inventorySearchQuery={inventorySearchQuery}
                                setInventorySearchQuery={setInventorySearchQuery}
                            />`);

c = c.replace(/<CierresTab[^>]*>/m, 
`<CierresTab 
                                cierreTimeRange={cierreTimeRange}
                                setCierreTimeRange={setCierreTimeRange}
                                cierreDateFrom={cierreDateFrom}
                                setCierreDateFrom={setCierreDateFrom}
                                showZReport={showZReport}
                                setShowZReport={setShowZReport}
                                handleExportZReport={handleExportZReport}
                                cierreDateTo={cierreDateTo}
                                setCierreDateTo={setCierreDateTo}
                                cierreData={cierreData}
                            />`);

// Fix missing state variables in AccountingModule for inboxMails:
if (!c.includes('const [inboxMails')) {
    c = c.replace('// Valid tabs',
`    const [inboxMails, setInboxMails] = useState<any[]>([]);
    const [activeMailId, setActiveMailId] = useState<string | null>(null);
    const handleContabilizarFactura = () => {};
    // Valid tabs`);
}

if (!c.includes('handleExportSabana')) {
    c = c.replace('// Valid tabs',
`    const handleExportSabana = () => {};
    // Valid tabs`);
}

fs.writeFileSync(p, c);
console.log('Fixed props with regex!');
