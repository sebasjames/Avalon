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

    let content = fs.readFileSync(file, 'utf-8');
    
    // Auto-inject the import if not present
    if (!content.includes('useEscapeKey')) {
        content = content.replace("import React", "import { useEscapeKey } from '../hooks/useEscapeKey';\nimport React");
    }

    let lines = content.split('\n');
    lines = lines.filter(l => !l.includes('useEscapeKey(') && !l.includes('// Escape key hooks'));

    const lastUseStateIndex = lines.findLastIndex(l => l.includes('useState(') || l.includes('useState<'));
    
    if (lastUseStateIndex !== -1) {
        lines.splice(lastUseStateIndex + 1, 0, '\n  // Escape key hooks', ...hooks.map(h => '  ' + h), '');
        fs.writeFileSync(file, lines.join('\n'));
        console.log("Fixed " + file);
    } else {
        console.log("No useState found in " + file);
    }
}
