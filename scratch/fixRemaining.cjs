const fs = require('fs');

const config = {
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
    'components/CrmTeam.tsx': [
        "useEscapeKey(() => setSelectedUserId(null), !!selectedUserId);"
    ],
    'components/QuoteEmailModal.tsx': [
        "useEscapeKey(onClose, isOpen);"
    ]
};

for (const [file, hooks] of Object.entries(config)) {
    if (!fs.existsSync(file)) continue;

    let lines = fs.readFileSync(file, 'utf-8').split('\n');
    
    // Remove old hooks
    lines = lines.filter(l => !l.includes('useEscapeKey(') && !l.includes('// Escape key hooks'));

    const lastUseStateIndex = lines.findLastIndex(l => l.includes('useState(') || l.includes('useState<'));
    
    if (lastUseStateIndex !== -1) {
        // Insert after the last useState
        lines.splice(lastUseStateIndex + 1, 0, '\n  // Escape key hooks', ...hooks.map(h => '  ' + h), '');
        fs.writeFileSync(file, lines.join('\n'));
        console.log("Fixed " + file);
    } else {
        console.log("No useState found in " + file);
    }
}
