const fs = require('fs');
const path = require('path');

const tabName = 'VentasTab';
const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);

const content = fs.readFileSync(modulePath, 'utf-8');

// Find the start and end of VentasTab
const lines = content.split('\\n');
let sIdx = -1;
let eIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{activeTab === 'ventas' && (")) {
        sIdx = i;
    }
    if (sIdx !== -1 && lines[i].includes("{/* TAB 4: AUDITORIA TERCEROS */}")) {
        eIdx = i - 2; // close brace
        break;
    }
}
const rawJSX = lines.slice(sIdx + 1, eIdx).join('\\n').replace(/                            /g, '        ');

const componentContent = `import React from 'react';

export interface VentasTabProps {
    salesMethodFilter: string;
    setSalesMethodFilter: (method: string) => void;
    uniqueSalesPaymentMethods: string[];
    salesDateFrom: string;
    setSalesDateFrom: (date: string) => void;
    salesDateTo: string;
    setSalesDateTo: (date: string) => void;
    filteredSales: any[];
}

export const ${tabName}: React.FC<VentasTabProps> = ({
    salesMethodFilter,
    setSalesMethodFilter,
    uniqueSalesPaymentMethods,
    salesDateFrom,
    setSalesDateFrom,
    salesDateTo,
    setSalesDateTo,
    filteredSales
}) => {
    return (
${rawJSX}
    );
};
`;
fs.writeFileSync(targetPath, componentContent);
console.log('Created ' + tabName);
