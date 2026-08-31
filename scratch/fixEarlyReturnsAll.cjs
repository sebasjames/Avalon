const fs = require('fs');

// 1. Fix AccountingModule.tsx early return
let accContent = fs.readFileSync('components/AccountingModule.tsx', 'utf-8');
accContent = accContent.replace(
  /if \(!tabId \|\| !validTabs\.includes\(tabId\)\) \{\s*return <Navigate to="\/accounting\/sabana" replace \/>;\s*\}/,
  '// Removed early return to preserve hook order'
);
fs.writeFileSync('components/AccountingModule.tsx', accContent);
console.log('Fixed AccountingModule.tsx');

// 2. Fix Excel Modals with if (!isOpen) return null;
const modalFiles = [
  'components/CrmExcelModal.tsx',
  'components/InventoryExcelModal.tsx',
  'components/TransactionsExcelModal.tsx'
];

modalFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let lines = fs.readFileSync(file, 'utf-8').split('\n');
  
  // Remove if (!isOpen) return null;
  const earlyReturnIdx = lines.findIndex(l => l.includes('if (!isOpen) return null;'));
  if (earlyReturnIdx !== -1) {
    lines.splice(earlyReturnIdx, 1);
  }

  // Find last useEffect or useState or useEscapeKey
  const lastHookIdx = lines.findLastIndex(l => l.includes('useState(') || l.includes('useEffect(') || l.includes('useEscapeKey('));
  if (lastHookIdx !== -1) {
    // Find the end of that hook/block
    let insertIdx = lastHookIdx + 1;
    while (insertIdx < lines.length && (lines[insertIdx].trim() !== '' && !lines[insertIdx].includes('const handle') && !lines[insertIdx].includes('return ('))) {
      insertIdx++;
    }
    lines.splice(insertIdx, 0, '\n    if (!isOpen) return null;\n');
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Fixed ' + file);
  }
});
