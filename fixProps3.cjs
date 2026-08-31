const fs = require('fs');
const p = 'components/AccountingModule.tsx';
let c = fs.readFileSync(p, 'utf-8');

// ActivosLiquidezTab
c = c.replace('<ActivosLiquidezTab \\n                                inventory={inventory}\\n                                expandedCarteraClient={expandedCarteraClient}\\n                                setExpandedCarteraClient={setExpandedCarteraClient}\\n                            />', 
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

// CierresTab
c = c.replace('<CierresTab \\n                                cierreTimeRange={cierreTimeRange}\\n                                setCierreTimeRange={setCierreTimeRange}\\n                                cierreDateFrom={cierreDateFrom}\\n                                setCierreDateFrom={setCierreDateFrom}\\n                                showZReport={showZReport}\\n                                setShowZReport={setShowZReport}\\n                                handleExportZReport={handleExportZReport}\\n                            />',
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

// VentasTab
c = c.replace('<VentasTab \\n                                salesMethodFilter={salesMethodFilter}\\n                                setSalesMethodFilter={setSalesMethodFilter}\\n                                salesDateFrom={salesDateFrom}\\n                                setSalesDateFrom={setSalesDateFrom}\\n                                salesDateTo={salesDateTo}\\n                                setSalesDateTo={setSalesDateTo}\\n                                uniqueSalesPaymentMethods={uniqueSalesPaymentMethods}\\n                                filteredSales={filteredSales}\\n                                setShowPaymentModal={setShowPaymentModal}\\n                                setPaymentClient={setPaymentClient}\\n                                setPaymentAmount={setPaymentAmount}\\n                                setPaymentBank={setPaymentBank}\\n                                setPaymentRef={setPaymentRef}\\n                                setPaymentDate={setPaymentDate}\\n                                setPaymentSelectedInvoice={setPaymentSelectedInvoice}\\n                            />',
`<VentasTab 
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
                            />`);

// FacturasCorreoTab
c = c.replace('<FacturasCorreoTab \\n                                inboxMails={inboxMails}\\n                                activeMailId={activeMailId}\\n                                setActiveMailId={setActiveMailId}\\n                                handleContabilizarFactura={handleContabilizarFactura}\\n                            />',
`<FacturasCorreoTab 
                                inboxMails={inboxMails}
                                activeMailId={activeMailId}
                                setActiveMailId={setActiveMailId}
                                handleContabilizarFactura={handleContabilizarFactura}
                            />`);

// Also fix SabanaTab missing handleExportSabana if it complains
c = c.replace('<SabanaTab \\n                                draftFilters={draftFilters}\\n                                setDraftFilters={setDraftFilters}\\n                                handleClearSabanaFilters={handleClearSabanaFilters}\\n                                exportSabanaData={exportSabanaData}\\n                                sabanaTotals={sabanaTotals}\\n                            />',
`<SabanaTab 
                                draftFilters={draftFilters}
                                setDraftFilters={setDraftFilters}
                                handleClearSabanaFilters={handleClearSabanaFilters}
                                exportSabanaData={exportSabanaData}
                                sabanaTotals={sabanaTotals}
                            />`);

// But wait, the literal replaces using \\n might fail if node uses \n in readFileSync.
// It is better to use Regex!

fs.writeFileSync(p, c);
