const fs = require('fs');
const path = require('path');

const tabName = 'AuditoriaTab';
const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);

const content = fs.readFileSync(modulePath, 'utf-8');

// Find the start and end of AuditoriaTab
const lines = content.split('\\n');
let sIdx = -1;
let eIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'auditoria' && (")) {
        sIdx = i;
    }
    if (sIdx !== -1 && lines[i].includes("{/* TAB 6: EXPORTACIÓN SIIGO */}")) {
        eIdx = i - 3; // close brace
        break;
    }
}
const rawJSX = lines.slice(sIdx + 1, eIdx).join('\\n').replace(/                            /g, '        ');

const componentContent = `import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export interface AuditoriaTabProps {
    activeReport: any;
    runAuditAction: () => void;
    auditReports: any[];
    setSelectedReportId: (id: string) => void;
}

export const ${tabName}: React.FC<AuditoriaTabProps> = ({
    activeReport,
    runAuditAction,
    auditReports,
    setSelectedReportId
}) => {
    return (
${rawJSX}
    );
};
`;
fs.writeFileSync(targetPath, componentContent);
console.log('Created ' + tabName);
