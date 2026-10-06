const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'context', 'EnterpriseContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update interface definition
const oldInterface = 'updateLabStock: (skuOrId: string, newLabStock: number) => void;';
const newInterface = 'updateLabStock: (skuOrId: string, newLabStock: number, options?: { notes?: string; documentRef?: string; formulaName?: string; user?: string; lotNumber?: string }) => void;';

if (content.includes(oldInterface)) {
    content = content.replace(oldInterface, newInterface);
    console.log('Interface updated successfully');
} else {
    console.log('Old interface string not found or already updated');
}

// 2. Update function implementation
const oldFnStart = `    const updateLabStock = (skuOrId: string, newLabStock: number) => {
        setInventory(prev => {
            const product = prev.find(p => p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId);
            if (product) {
                const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
                const prevLab = product.labStock || 0;
                const diff = newLabStock - prevLab;
                const isVaciar = newLabStock === 0;

                addKardexTransaction({
                    id: \`TX-ADJ-\${Date.now()}\`,
                    date: nowStr,
                    skuId: product.sku,
                    productName: product.name,
                    lotNumber: 'LOTE-BASCULA',
                    type: isVaciar ? 'Salida' : 'Ajuste',
                    quantity: diff,
                    balanceBefore: prevLab,
                    balanceAfter: newLabStock,
                    unit: product.baseUnit || 'GR',
                    operationType: isVaciar ? 'VACIADO_ENVASE' : 'AJUSTE_BASCULA',
                    documentRef: isVaciar ? 'VACIADO-MANUAL' : 'PESAJE-BASCULA',
                    user: 'Operador de Mesón',
                    formulaName: isVaciar ? 'Envase marcado como agotado/vaciado' : 'Ajuste de tara y saldo en balanza de precisión',
                    notes: isVaciar ? 'Se retiró el envase vacío del laboratorio.' : \`Pesaje neto ajustado de \${prevLab} a \${newLabStock} \${product.baseUnit || 'GR'}.\`
                });
            }`;

const newFnStart = `    const updateLabStock = (
        skuOrId: string, 
        newLabStock: number,
        options?: { notes?: string; documentRef?: string; formulaName?: string; user?: string; lotNumber?: string }
    ) => {
        setInventory(prev => {
            const product = prev.find(p => p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId);
            if (product) {
                const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
                const prevLab = product.labStock || 0;
                const diff = newLabStock - prevLab;
                const isVaciar = newLabStock === 0;

                addKardexTransaction({
                    id: \`TX-ADJ-\${Date.now()}\`,
                    date: nowStr,
                    skuId: product.sku,
                    productName: product.name,
                    lotNumber: options?.lotNumber || 'LOTE-BASCULA',
                    type: isVaciar ? 'Salida' : 'Ajuste',
                    quantity: diff,
                    balanceBefore: prevLab,
                    balanceAfter: newLabStock,
                    unit: product.baseUnit || 'GR',
                    operationType: isVaciar ? 'VACIADO_ENVASE' : 'AJUSTE_BASCULA',
                    documentRef: options?.documentRef || (isVaciar ? 'VACIADO-MANUAL' : 'PESAJE-BASCULA'),
                    user: options?.user || 'Operador de Mesón',
                    formulaName: options?.formulaName || (isVaciar ? 'Envase marcado como agotado/vaciado' : 'Ajuste de tara y saldo en balanza de precisión'),
                    notes: options?.notes || (isVaciar ? 'Se retiró el envase vacío del laboratorio.' : \`Pesaje neto ajustado de \${prevLab} a \${newLabStock} \${product.baseUnit || 'GR'}.\`)
                });
            }`;

// Normalize line breaks for matching
const normalize = str => str.replace(/\r\n/g, '\n');
if (normalize(content).includes(normalize(oldFnStart))) {
    // Replace with normalized or preserve
    const parts = normalize(content).split(normalize(oldFnStart));
    content = parts.join(normalize(newFnStart));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Implementation updated successfully');
} else {
    console.log('Old implementation string not found');
}
