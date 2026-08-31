const fs = require('fs');
const path = require('path');

const modulePath = path.join(__dirname, 'components', 'AccountingModule.tsx');
let content = fs.readFileSync(modulePath, 'utf-8');

// The states we want to remove:
const statesToRemove = [
    /    \/\/ --- DATÁFONO RECONCILIATION STATE ---\\n/,
    /    const \[bankTransactions, setBankTransactions\] = useState<any\[\]>\(\[\]\);\\n/,
    /    const \[saleSearch, setSaleSearch\] = useState\(''\);\\n/,
    /    const \[bankSearch, setBankSearch\] = useState\(''\);\\n/,
    /    const \[bankFileName, setBankFileName\] = useState\(''\);\\n/,
    /    const \[activeValidationSale, setActiveValidationSale\] = useState<AccountingTransaction \| null>\(null\);\\n/,
    /    const \[bankAmountInput, setBankAmountInput\] = useState\(''\);\\n/,
    /    const \[bankFeeInput, setBankFeeInput\] = useState\(''\);\\n/,
    /    const \[reconciledList, setReconciledList\] = useState<any\[\]>\(\[\]\);\\n/,
    /    const \[showReviewModal, setShowReviewModal\] = useState\(false\);\\n/,
    /    \/\/ --- EXTENSIÓN CONCILIACIÓN BANCARIA ---\\n/,
    /    const \[reconciliationType, setReconciliationType\] = useState<'DATAFONO' \| 'DAVIVIENDA' \| 'BBVA'>\('DATAFONO'\);\\n/,
    /    const \[reteFuenteInput, setReteFuenteInput\] = useState\('0'\);\\n/,
    /    const \[reteIvaInput, setReteIvaInput\] = useState\('0'\);\\n/,
    /    const \[reteIcaInput, setReteIcaInput\] = useState\('0'\);\\n/,
    /    const \[isProcessingAI, setIsProcessingAI\] = useState\(false\);\\n/
];

for (const regex of statesToRemove) {
    content = content.replace(regex, '');
}

// Remove suggestedMatches
const matchS = content.indexOf('const suggestedMatches = useMemo(() => {');
if (matchS !== -1) {
    const endS = content.indexOf('}, [bankTransactions, transactions, reconciledList]);', matchS) + '}, [bankTransactions, transactions, reconciledList]);'.length + 1;
    content = content.slice(0, matchS) + content.slice(endS);
}

// Replace JSX
const jsxStart = content.indexOf('{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}');
const jsxEndMarker = '{/* TAB: FACTURAS POR CORREO */}';
const jsxEnd = content.indexOf(jsxEndMarker);

if (jsxStart !== -1 && jsxEnd !== -1) {
    const replacement = `{/* TAB 8: CONCILIACIÓN DATÁFONOS Y BANCOS */}
                        {activeTab === 'conciliacion_datafono' && (
                            <ConciliacionDatafonoTab 
                                transactions={transactions}
                                reconcileDatáfonoTransaction={reconcileDatáfonoTransaction}
                            />
                        )}

                        `;
    content = content.slice(0, jsxStart) + replacement + content.slice(jsxEnd);
}

// Add import
if (!content.includes('import { ConciliacionDatafonoTab }')) {
    content = content.replace(
        "import { ImportacionesTab } from './accounting/ImportacionesTab';",
        "import { ImportacionesTab } from './accounting/ImportacionesTab';\\nimport { ConciliacionDatafonoTab } from './accounting/ConciliacionDatafonoTab';"
    );
}

fs.writeFileSync(modulePath, content);
console.log('Cleaned AccountingModule for ConciliacionDatafonoTab');
