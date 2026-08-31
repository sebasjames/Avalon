const fs = require('fs');
const path = require('path');

const tabName = 'CierresTab';
const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);

const content = fs.readFileSync(modulePath, 'utf-8');

// Find the start and end of CierresTab
const startStr = "{activeTab === 'cierres' && (\\n                            <div className=\\\"space-y-6\\\">";
let startIndex = content.indexOf("{activeTab === 'cierres' && (\\n                            <div className=\\\"space-y-6\\\">");
if (startIndex === -1) {
    // maybe different whitespace
    const lines = content.split('\\n');
    let sIdx = -1;
    let eIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("{activeTab === 'cierres' && (")) {
            sIdx = i;
        }
        if (sIdx !== -1 && lines[i].includes("{/* TAB 3: VENTAS */}")) {
            eIdx = i - 2; // close brace
            break;
        }
    }
    const rawJSX = lines.slice(sIdx + 1, eIdx).join('\\n').replace(/                            /g, '        ');

    const componentContent = `import React from 'react';
import { DollarSign, Wallet, Banknote, CreditCard, TableProperties, FileSpreadsheet, Calendar, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

export interface CierresTabProps {
    cierreTimeRange: 'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'MES_PASADO' | 'ESTE_AÑO' | 'PERSONALIZADO';
    setCierreTimeRange: (range: 'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'MES_PASADO' | 'ESTE_AÑO' | 'PERSONALIZADO') => void;
    cierreDateFrom: string;
    setCierreDateFrom: (date: string) => void;
    cierreDateTo: string;
    setCierreDateTo: (date: string) => void;
    showZReport: boolean;
    setShowZReport: (show: boolean) => void;
    cierreData: any;
    handleExportZReport: () => void;
}

export const ${tabName}: React.FC<CierresTabProps> = ({
    cierreTimeRange,
    setCierreTimeRange,
    cierreDateFrom,
    setCierreDateFrom,
    cierreDateTo,
    setCierreDateTo,
    showZReport,
    setShowZReport,
    cierreData,
    handleExportZReport
}) => {
    return (
${rawJSX}
    );
};
`;
    fs.writeFileSync(targetPath, componentContent);
    console.log('Created ' + tabName);
}
