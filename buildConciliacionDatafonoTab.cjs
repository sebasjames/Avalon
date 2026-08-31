const fs = require('fs');
const path = require('path');

const tabName = 'ConciliacionDatafonoTab';
const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
const targetPath = path.join(__dirname, 'components', 'accounting', `${tabName}.tsx`);

const content = fs.readFileSync(modulePath, 'utf-8');

const lines = content.split('\\n');
let sIdx = -1;
let eIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}")) {
        sIdx = i + 1;
    }
    if (sIdx !== -1 && lines[i].includes("{/* TAB: FACTURAS POR CORREO */}")) {
        eIdx = i - 2; // close brace
        break;
    }
}
let rawJSX = lines.slice(sIdx + 1, eIdx).join('\\n').replace(/                            /g, '        ');

// Remove suggestedMatches useMemo from AccountingModule to move it here if it's there, but actually we can just find it.
// I'll extract it manually below in the template.

const componentContent = `import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Calculator, FileSpreadsheet, Download, AlertTriangle, 
    CheckCircle2, DollarSign, PackageOpen, TableProperties,
    Calendar, Filter, Search, ArrowRight, UserCheck, Mail, Send, CreditCard, Banknote, Wallet, HandCoins, UploadCloud, Landmark, X, BrainCircuit
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AccountingTransaction } from '../../types';

export interface ConciliacionDatafonoTabProps {
    transactions: AccountingTransaction[];
    reconcileDatáfonoTransaction: (invoiceId: string, bankAmount: number, bankFee: number) => void;
}

export const ${tabName}: React.FC<ConciliacionDatafonoTabProps> = ({
    transactions,
    reconcileDatáfonoTransaction
}) => {
    // Local State
    const [reconciliationType, setReconciliationType] = useState<'DATAFONO' | 'DAVIVIENDA' | 'BBVA'>('DATAFONO');
    const [bankTransactions, setBankTransactions] = useState<any[]>([]);
    const [saleSearch, setSaleSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [bankFileName, setBankFileName] = useState('');
    const [activeValidationSale, setActiveValidationSale] = useState<AccountingTransaction | null>(null);
    const [bankAmountInput, setBankAmountInput] = useState('');
    const [bankFeeInput, setBankFeeInput] = useState('');
    const [reconciledList, setReconciledList] = useState<any[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reteFuenteInput, setReteFuenteInput] = useState('0');
    const [reteIvaInput, setReteIvaInput] = useState('0');
    const [reteIcaInput, setReteIcaInput] = useState('0');
    const [isProcessingAI, setIsProcessingAI] = useState(false);

    // AI suggestion logic
    const suggestedMatches = useMemo(() => {
        const matches = new Map<string, any>();
        transactions.filter(t => t.type === 'VENTA').forEach(sale => {
            const possibleMatch = bankTransactions.find(b => 
                !reconciledList.some(r => r.bank?.id === b.id) && 
                Math.abs(b.amount - sale.total) < (sale.total * 0.1)
            );
            if (possibleMatch) matches.set(sale.id, possibleMatch);
        });
        return matches;
    }, [bankTransactions, transactions, reconciledList]);

    return (
${rawJSX}
    );
};
`;
fs.writeFileSync(targetPath, componentContent);
console.log('Created ' + tabName);
