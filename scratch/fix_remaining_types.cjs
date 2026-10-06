const fs = require('fs');
const path = require('path');

// 1. CrmDealCreateModal.tsx
const crmPath = path.join(__dirname, '..', 'components', 'CrmDealCreateModal.tsx');
let crm = fs.readFileSync(crmPath, 'utf8');
crm = crm.replace("p.status !== 'SILENT'", "(p.status as string) !== 'SILENT'");
fs.writeFileSync(crmPath, crm, 'utf8');
console.log('CrmDealCreateModal.tsx updated');

// 2. DispatchModule.tsx
const dispatchPath = path.join(__dirname, '..', 'components', 'DispatchModule.tsx');
let dispatch = fs.readFileSync(dispatchPath, 'utf8');
dispatch = dispatch.replace(/severity:\s*'ERROR'/g, "severity: 'CRITICAL'");
fs.writeFileSync(dispatchPath, dispatch, 'utf8');
console.log('DispatchModule.tsx updated');
