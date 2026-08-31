const fs = require('fs');
const path = require('path');

const tabName = 'ExportacionTab';
const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);

const content = fs.readFileSync(modulePath, 'utf-8');

const lines = content.split('\\n');
let sIdx = -1;
let eIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'exportacion' && (")) {
        sIdx = i;
    }
    if (sIdx !== -1 && lines[i].includes("{/* TAB 7: IMPORTACIONES EDI */}")) {
        eIdx = i - 2; // close brace
        break;
    }
}
const rawJSX = lines.slice(sIdx + 1, eIdx).join('\\n').replace(/                            /g, '        ');

const componentContent = `import React from 'react';
import { FileSpreadsheet, Calendar, ArrowRight, Download } from 'lucide-react';

export interface ExportacionTabProps {
    handleExportSIIGO: () => void;
}

export const ${tabName}: React.FC<ExportacionTabProps> = ({
    handleExportSIIGO
}) => {
    return (
${rawJSX}
    );
};
`;
fs.writeFileSync(targetPath, componentContent);
console.log('Created ' + tabName);
