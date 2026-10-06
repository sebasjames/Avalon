const fs = require('fs');
const path = require('path');

// 1. SmartInventoryView.tsx
const invPath = path.join(__dirname, '..', 'components', 'SmartInventoryView.tsx');
let invContent = fs.readFileSync(invPath, 'utf8');
const invHasCRLF = invContent.includes('\r\n');
invContent = invContent.replace(/\r\n/g, '\n');

invContent = invContent.replace(
  '<div className="text-sm font-bold text-slate-700">${(value/1000).toFixed(1)}k</div>',
  '<div className="text-xs font-bold text-slate-700 truncate" title={formatCOP(value)}>{formatCOP(value)}</div>'
);

if (invHasCRLF) invContent = invContent.replace(/\n/g, '\r\n');
fs.writeFileSync(invPath, invContent, 'utf8');

// 2. AdvancedAnalytics.tsx
const anaPath = path.join(__dirname, '..', 'components', 'AdvancedAnalytics.tsx');
let anaContent = fs.readFileSync(anaPath, 'utf8');
const anaHasCRLF = anaContent.includes('\r\n');
anaContent = anaContent.replace(/\r\n/g, '\n');

if (!anaContent.includes("import { formatCOP }")) {
  anaContent = "import { formatCOP } from '../utils/format';\n" + anaContent;
}

anaContent = anaContent.replace(
  '<div className="text-2xl font-bold text-slate-900 mt-2">${(simRevenue/1000).toFixed(0)}k</div>',
  '<div className="text-2xl font-bold text-slate-900 mt-2">{formatCOP(simRevenue)}</div>'
);

if (anaHasCRLF) anaContent = anaContent.replace(/\n/g, '\r\n');
fs.writeFileSync(anaPath, anaContent, 'utf8');

console.log("Successfully cleaned all /1000 k instances across the project!");
