const fs = require('fs');

const config = {
    'components/AccountingModule.tsx': [
        "useEscapeKey(() => setShowFilterModal(false), showFilterModal);",
        "useEscapeKey(() => setShowPaymentModal(false), showPaymentModal);",
        "useEscapeKey(() => setShowExpenseModal(false), showExpenseModal);"
    ],
    'components/accounting/ConciliacionDatafonoTab.tsx': [
        "useEscapeKey(() => setShowUploadModal(false), showUploadModal);",
        "useEscapeKey(() => setSelectedMatch(null), !!selectedMatch);"
    ],
    'components/CrmContactDrawer.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ],
    'components/CrmContactsTable.tsx': [
        "useEscapeKey(() => setShowDeleteConfirm(null), !!showDeleteConfirm);",
        "useEscapeKey(() => setShowContactModal(false), showContactModal);"
    ],
    'components/CrmDashboard.tsx': [
        "useEscapeKey(() => setShowNewContact(false), showNewContact);"
    ],
    'components/CrmDealCreateModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ],
    'components/CrmExcelModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ],
    'components/CrmFull.tsx': [
        "useEscapeKey(() => setShowNewContact(false), showNewContact);",
        "useEscapeKey(() => setShowGlobalSearch(false), showGlobalSearch);"
    ],
    'components/CrmTeam.tsx': [
        "useEscapeKey(() => setSelectedUserId(null), !!selectedUserId);"
    ],
    'components/ImportInvoicesPanel.tsx': [
        "useEscapeKey(() => setShowImportModal(false), showImportModal);"
    ],
    'components/ImportRecipesModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ],
    'components/InventarioTransito.tsx': [
        "useEscapeKey(() => setShowForm(false), showForm);",
        "useEscapeKey(() => setShowConfirm(null), !!showConfirm);"
    ],
    'components/InventoryControlDeep.tsx': [
        "useEscapeKey(() => setShowMovementModal(false), showMovementModal);"
    ],
    'components/InventoryExcelModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ],
    'components/MatrixComisiones.tsx': [
        "useEscapeKey(() => setShowEditModal(false), showEditModal);"
    ],
    'components/PurchaseReportsExcelModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ],
    'components/QuoteEmailModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ],
    'components/ReturnsPanel.tsx': [
        "useEscapeKey(() => setShowForm(false), showForm);"
    ],
    'components/SmartInventoryView.tsx': [
        "useEscapeKey(onClose, isOpen);",
        "useEscapeKey(() => setShowProductForm(false), showProductForm);",
        "useEscapeKey(() => setShowExcelModal(false), showExcelModal);"
    ],
    'components/SmartPosPanel.tsx': [
        "useEscapeKey(() => setIsQuoteModalOpen(false), isQuoteModalOpen);",
        "useEscapeKey(() => setShowShortcutsModal(false), showShortcutsModal);",
        "useEscapeKey(() => setShowCreateClientModal(false), showCreateClientModal);",
        "useEscapeKey(() => setShowChemicalPanel(false), showChemicalPanel);",
        "useEscapeKey(() => setShowSuccess(false), showSuccess);",
        "useEscapeKey(() => setShowExpenseModal(false), showExpenseModal);",
        "useEscapeKey(() => setShowDiscountModal(false), showDiscountModal);",
        "useEscapeKey(() => setShowClientModal(false), showClientModal);",
        "useEscapeKey(() => setShowRecentSales(false), showRecentSales);",
        "useEscapeKey(() => setShowGhostSuggestions(false), showGhostSuggestions);"
    ],
    'components/TintometriaPanel.tsx': [
        "useEscapeKey(() => setShowImportModal(false), showImportModal);"
    ],
    'components/TransactionsExcelModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ]
};

for (const [file, hooks] of Object.entries(config)) {
    if (!fs.existsSync(file)) continue;

    let lines = fs.readFileSync(file, 'utf-8').split('\n');
    let newLines = [];
    let insideComponent = false;
    let injected = false;
    let isSmartPos = file.includes('SmartPosPanel');

    // Filter out previous bad injections first!
    lines = lines.filter(l => !l.includes('useEscapeKey(') && !l.includes('// Escape key hooks'));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Did we hit the component declaration?
        if (line.match(/export const [A-Za-z0-9_]+:?\s*React\.FC[^=]*=\s*\([^)]*\)\s*=>\s*\{|export function [A-Za-z0-9_]+\([^)]*\)\s*\{/)) {
            insideComponent = true;
        }

        if (insideComponent && !injected && !isSmartPos) {
            // Check for the first main body `return` or `if` indented by exactly 4 spaces
            if (line.match(/^    return \(/) || line.match(/^    return </) || line.match(/^    if \(/) || line.match(/^    if\(/)) {
                newLines.push('  // Escape key hooks');
                hooks.forEach(h => newLines.push('  ' + h));
                newLines.push('');
                injected = true;
            }
        }
        
        // SmartPosPanel special case since it has many early returns
        if (insideComponent && !injected && isSmartPos) {
            if (line.includes('const handleCreateClient = () => {')) {
                newLines.push('  // Escape key hooks');
                hooks.forEach(h => newLines.push('  ' + h));
                newLines.push('');
                injected = true;
            }
        }

        newLines.push(line);
    }

    if (!injected) {
        console.log("FAILED to inject in " + file);
    } else {
        console.log("Fixed " + file);
    }
    
    fs.writeFileSync(file, newLines.join('\n'));
}
