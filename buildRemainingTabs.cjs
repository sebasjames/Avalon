const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
let content = fs.readFileSync(modulePath, 'utf-8');

function extractJSX(startMarker, endMarker) {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker, startIdx);
    if (startIdx === -1 || endIdx === -1) {
        console.error('Markers not found:', startMarker, endMarker);
        return '';
    }
    
    const conditionStr = "&& (";
    const condIdx = content.indexOf(conditionStr, startIdx);
    if (condIdx === -1 || condIdx > endIdx) {
        const condIdx2 = content.indexOf("&& (() => {", startIdx);
        if (condIdx2 !== -1 && condIdx2 < endIdx) {
            const contentStart = condIdx2 + "&& (() => {".length;
            let contentEnd = content.lastIndexOf('})()}', endIdx);
            return content.substring(contentStart, contentEnd);
        }
        return '';
    }
    
    const contentStart = condIdx + conditionStr.length;
    let contentEnd = content.lastIndexOf(')}', endIdx);
    
    return content.substring(contentStart, contentEnd);
}

// Build FacturasCorreoTab
const facturasJSX = extractJSX("{/* TAB: FACTURAS POR CORREO */}", "{/* TAB 10: CAJA MENOR */}");
const facturasComponent = `import React from 'react';
import { Mail, CheckCircle2, PackageOpen, Download, AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';
import { formatCOP } from '../../utils/format';

export interface FacturasCorreoTabProps {
    inboxMails: any[];
    activeMailId: string | null;
    setActiveMailId: (id: string | null) => void;
    handleContabilizarFactura: (mail: any) => void;
}

export const FacturasCorreoTab: React.FC<FacturasCorreoTabProps> = ({
    inboxMails,
    activeMailId,
    setActiveMailId,
    handleContabilizarFactura
}) => {
    return (
${facturasJSX}
    );
};
`;
fs.writeFileSync(path.join(__dirname, 'components', 'accounting', 'FacturasCorreoTab.tsx'), facturasComponent);
console.log('Created FacturasCorreoTab');

// Build CajaMenorTab
const cajaMenorJSX = extractJSX("{/* TAB 10: CAJA MENOR */}", "{/* MODAL: CONTABILIZAR FACTURA PROVEEDOR CON IA */}");
const cajaMenorComponent = `import React, { useState } from 'react';
import { Wallet, Search, Filter, Download, ArrowRight, TableProperties } from 'lucide-react';
import { formatCOP } from '../../utils/format';
import { AccountingTransaction } from '../../types';

export interface CajaMenorTabProps {
    transactions: AccountingTransaction[];
}

export const CajaMenorTab: React.FC<CajaMenorTabProps> = ({
    transactions
}) => {
    // Local State
    const FONDO_BASE = 1500000; // COP 1,500,000 as base
    const [cajaMenorSearch, setCajaMenorSearch] = useState('');
    const [cajaMenorFilter, setCajaMenorFilter] = useState('ALL');

    return (
${cajaMenorJSX}
    );
};
`;
fs.writeFileSync(path.join(__dirname, 'components', 'accounting', 'CajaMenorTab.tsx'), cajaMenorComponent);
console.log('Created CajaMenorTab');
