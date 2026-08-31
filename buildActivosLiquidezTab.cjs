const fs = require('fs');
const path = require('path');

const tabName = 'ActivosLiquidezTab';
const rawPath = path.join(__dirname, 'components', 'accounting', `${tabName}_raw.tsx`);
const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);

const rawJSX = fs.readFileSync(rawPath, 'utf-8');

const componentContent = `import React from 'react';
import { HandCoins, Banknote, PackageOpen, AlertTriangle, Landmark, FileSpreadsheet, Search } from 'lucide-react';
import { formatCOP } from '../../utils/format';

export interface ActivosLiquidezTabProps {
    inventarioValorizado: any;
    carteraData: any;
    cxPData: any;
    leftPanelMode: 'AR' | 'AP';
    setLeftPanelMode: (mode: 'AR' | 'AP') => void;
    expandedCarteraClient: string | null;
    setExpandedCarteraClient: (client: string | null) => void;
    setPaymentClient: (client: any) => void;
    setPaymentAmount: (amount: string) => void;
    setPaymentRef: (ref: string) => void;
    setPaymentSelectedInvoice: (invoice: any) => void;
    setShowPaymentModal: (show: boolean) => void;
    transactions: any[];
    setSelectedCxPInvoice: (invoice: any) => void;
    setCxPPaymentAmount: (amount: string) => void;
    setShowCxPPaymentModal: (show: boolean) => void;
    inventorySortBy: string;
    setInventorySortBy: (sortBy: string) => void;
    inventorySearchQuery: string;
    setInventorySearchQuery: (query: string) => void;
}

export const ${tabName}: React.FC<ActivosLiquidezTabProps> = ({
    inventarioValorizado,
    carteraData,
    cxPData,
    leftPanelMode,
    setLeftPanelMode,
    expandedCarteraClient,
    setExpandedCarteraClient,
    setPaymentClient,
    setPaymentAmount,
    setPaymentRef,
    setPaymentSelectedInvoice,
    setShowPaymentModal,
    transactions,
    setSelectedCxPInvoice,
    setCxPPaymentAmount,
    setShowCxPPaymentModal,
    inventorySortBy,
    setInventorySortBy,
    inventorySearchQuery,
    setInventorySearchQuery
}) => {
    const filteredInventoryItems = inventarioValorizado.items.filter((item: any) => {
        if (!inventorySearchQuery) return true;
        const q = inventorySearchQuery.toLowerCase();
        return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    });
    const filteredInventoryTotal = filteredInventoryItems.reduce((sum: number, item: any) => sum + item.valorTotal, 0);

    return (
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
            ${rawJSX.substring(rawJSX.indexOf('<div className="grid')).trim()}
    );
};
`;

fs.writeFileSync(targetPath, componentContent);
console.log('Created ' + tabName);
