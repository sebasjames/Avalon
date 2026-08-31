const fs = require('fs');

const files = [
  'components/AccountingModule.tsx', 'components/accounting/ConciliacionDatafonoTab.tsx',
  'components/CrmContactDrawer.tsx', 'components/CrmContactsTable.tsx',
  'components/CrmDashboard.tsx', 'components/CrmDealCreateModal.tsx',
  'components/CrmExcelModal.tsx', 'components/CrmFull.tsx',
  'components/CrmTeam.tsx', 'components/ImportInvoicesPanel.tsx',
  'components/ImportRecipesModal.tsx', 'components/InventarioTransito.tsx',
  'components/InventoryControlDeep.tsx', 'components/InventoryExcelModal.tsx',
  'components/MatrixComisiones.tsx', 'components/PurchaseReportsExcelModal.tsx',
  'components/QuoteEmailModal.tsx', 'components/ReturnsPanel.tsx',
  'components/SmartInventoryView.tsx', 'components/SmartPosPanel.tsx',
  'components/TintometriaPanel.tsx', 'components/TransactionsExcelModal.tsx'
];

let removedCount = 0;

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  const content = fs.readFileSync(f, 'utf-8');
  let lines = content.split('\n');
  let filteredLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('useEscapeKey(')) {
      // Check if it's onClose or a valid variable in the file
      if (line.includes('onClose')) {
        filteredLines.push(line);
        continue;
      }

      // Extract the variable passed as condition (the 2nd argument)
      // e.g. useEscapeKey(() => setShowFilterModal(false), showFilterModal);
      const match = line.match(/useEscapeKey\([^,]+,\s*!*([a-zA-Z0-9_]+)\)/);
      if (match) {
        const varName = match[1];
        // Search if varName is declared in the file (excluding this line)
        const isDeclared = lines.some((l, idx) => idx !== i && (l.includes(`const [${varName}`) || l.includes(`const ${varName}`) || l.includes(`${varName}:`) || l.includes(`let ${varName}`)));
        if (isDeclared) {
          filteredLines.push(line);
        } else {
          console.log(`[REMOVING INVALID HOOK] ${f}:${i+1} -> Variable '${varName}' is not defined in component!`);
          removedCount++;
        }
      } else {
        filteredLines.push(line);
      }
    } else {
      filteredLines.push(line);
    }
  }

  fs.writeFileSync(f, filteredLines.join('\n'));
});

console.log(`Cleaned up ${removedCount} invalid useEscapeKey calls!`);
