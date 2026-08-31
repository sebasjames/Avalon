const fs = require('fs');
const path = require('path');

const tabName = 'SabanaTab';
const rawPath = path.join(__dirname, 'components', 'accounting', `${tabName}_raw.tsx`);
const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);

const rawJSX = fs.readFileSync(rawPath, 'utf-8');

const componentContent = `import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, FileSpreadsheet, Download } from 'lucide-react';
import { AccountingTransaction } from '../../types';

export interface SabanaTabProps {
    accountingShortcuts: string[];
    activeShortcutFilter: string;
    setActiveShortcutFilter: (val: string) => void;
    showFilters: boolean;
    setShowFilters: (val: boolean) => void;
    setShowExcelModal: (val: boolean) => void;
    handleExportExcel: () => void;
    draftFilters: any;
    setDraftFilters: (val: any) => void;
    appliedFilters: any;
    setAppliedFilters: (val: any) => void;
    initialFilterState: any;
    filteredSabana: AccountingTransaction[];
}

export const ${tabName}: React.FC<SabanaTabProps> = ({
    accountingShortcuts,
    activeShortcutFilter,
    setActiveShortcutFilter,
    showFilters,
    setShowFilters,
    setShowExcelModal,
    handleExportExcel,
    draftFilters,
    setDraftFilters,
    appliedFilters,
    setAppliedFilters,
    initialFilterState,
    filteredSabana
}) => {
    return (
        ${rawJSX.trim()}
    );
};
`;

fs.writeFileSync(targetPath, componentContent);
console.log('Created ' + tabName);
