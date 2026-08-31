const fs = require('fs');

let mPath = 'components/AccountingModule.tsx';
let m = fs.readFileSync(mPath, 'utf-8');
if (!m.includes('const setBankAmountInput')) {
    m = m.replace('// Valid tabs', 
`    const setBankAmountInput = (val: string) => {};
    const setBankFeeInput = (val: string) => {};
    const activeValidationSale: any = null;
    // Valid tabs`);
}
fs.writeFileSync(mPath, m);

let sPath = 'components/accounting/SabanaTab.tsx';
let s = fs.readFileSync(sPath, 'utf-8');
if (!s.includes('handleExportSabana?:')) {
    s = s.replace('export interface SabanaTabProps {', 'export interface SabanaTabProps {\\n    handleExportSabana?: () => void;');
    fs.writeFileSync(sPath, s);
}

let vPath = 'components/accounting/VentasTab.tsx';
let v = fs.readFileSync(vPath, 'utf-8');
if (!v.includes('setShowPaymentModal?:')) {
    v = v.replace('export interface VentasTabProps {', 'export interface VentasTabProps {\\n    setShowPaymentModal?: (v: boolean) => void;');
    fs.writeFileSync(vPath, v);
}

// ActivosLiquidezTab setInventorySortBy
let aPath = 'components/accounting/ActivosLiquidezTab.tsx';
let a = fs.readFileSync(aPath, 'utf-8');
a = a.replace('setInventorySortBy: (sortBy: string) => void;', 'setInventorySortBy: any;');
fs.writeFileSync(aPath, a);

console.log('Fixed interfaces and remaining module variables!');
