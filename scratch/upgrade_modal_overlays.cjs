const fs = require('fs');
const path = require('path');

const targetFiles = [
  'components/HistorialMezclasModal.tsx',
  'components/InventarioMezclas.tsx',
  'components/ControlMermasTab.tsx',
  'components/MezclasTablero.tsx',
  'components/MezclasCatalogo.tsx',
  'components/TintometriaPanel.tsx',
  'components/PosHistory.tsx',
  'components/ProductionManagement.tsx',
  'components/ReturnsPanel.tsx',
  'components/DispatchModule.tsx',
  'components/InformesOmar.tsx',
  'components/MatrixComisiones.tsx',
  'components/InventarioTransito.tsx',
  'components/InventoryControlDeep.tsx',
  'components/CrmContactsTable.tsx',
  'components/CrmDashboard.tsx',
  'components/CrmDealCreateModal.tsx',
  'components/CrmFull.tsx',
  'components/CrmContactDrawer.tsx',
  'components/SmartPosPanel.tsx',
  'components/AccountingModule.tsx',
  'components/accounting/ConciliacionDatafonoTab.tsx'
];

let updatedCount = 0;

targetFiles.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Specific file treatments
  if (relPath.includes('HistorialMezclasModal.tsx')) {
    content = content.replace(
      'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs',
      'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm'
    );
  }

  if (relPath.includes('ControlMermasTab.tsx')) {
    content = content.replace(
      'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs',
      'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm'
    );
  }

  if (relPath.includes('InventarioMezclas.tsx')) {
    content = content.replace(
      /fixed inset-0 z-50 flex items-center justify-center bg-slate-900\/60 backdrop-blur-xs/g,
      'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm'
    );
    content = content.replace(
      'fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80',
      'fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85'
    );
  }

  // General modal overlay elevation for fixed inset-0 with z-50 / z-[100] / z-[60]
  content = content.replace(/className="fixed inset-0 ([^"]*?)z-50([^"]*?)"/g, (match, before, after) => {
    return `className="fixed inset-0 ${before}z-[9999]${after}"`;
  });

  content = content.replace(/className="fixed inset-0 ([^"]*?)z-\[100\]([^"]*?)"/g, (match, before, after) => {
    return `className="fixed inset-0 ${before}z-[9999]${after}"`;
  });

  content = content.replace(/className="fixed inset-0 ([^"]*?)z-\[60\]([^"]*?)"/g, (match, before, after) => {
    return `className="fixed inset-0 ${before}z-[9999]${after}"`;
  });

  // Background blur and backdrop contrast enhancement
  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated z-index overlay in ${relPath}`);
    updatedCount++;
  }
});

console.log(`Finished updating ${updatedCount} files.`);
