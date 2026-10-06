const fs = require('fs');
const path = require('path');

const contextPath = path.resolve(__dirname, '../context/EnterpriseContext.tsx');
let code = fs.readFileSync(contextPath, 'utf8');

// 1. Update the interface definition
const oldType = "openUnitToLab: (skuOrId: string, units?: number) => void;";
const newType = "openUnitToLab: (skuOrId: string, units?: number, usedQuantity?: number, reason?: string) => void;";

if (code.includes(oldType)) {
    code = code.replace(oldType, newType);
}

// 2. Update the implementation
const targetFuncStart = 'const openUnitToLab = (skuOrId: string, units: number = 1) => {';
const targetFuncEnd = 'const updateInventoryStock = (productId: string, quantityChange: number) => {';

const newFunc = `const openUnitToLab = (skuOrId: string, units: number = 1, usedQuantity: number = 0, reason: string = '') => {
        setInventory(prev => {
            const product = prev.find(p => p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId);
            if (product) {
                const unitCapacity = product.netWeightKg || product.netVolumeLiters || (product.baseUnit === 'GR' ? 1000 : 20);
                const unitsToOpen = Math.min(product.totalStock, units);
                if (unitsToOpen > 0) {
                    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    const prevLab = product.labStock || 0;
                    const addedQty = unitsToOpen * unitCapacity;
                    const validUsed = Math.min(addedQty, Math.max(0, usedQuantity));
                    const newLab = prevLab + addedQty - validUsed;

                    // 1. Transaction: Apertura de Envase
                    addKardexTransaction({
                        id: \`TX-OPEN-\${Date.now()}\`,
                        date: nowStr,
                        skuId: product.sku,
                        productName: product.name,
                        lotNumber: \`LOT-BOD-\${Date.now().toString().slice(-4)}\`,
                        type: 'Entrada',
                        quantity: addedQty,
                        balanceBefore: prevLab,
                        balanceAfter: prevLab + addedQty,
                        unit: product.baseUnit || 'GR',
                        operationType: 'APERTURA_ENVASE',
                        documentRef: reason || 'DESTAPE-BOD-CENTRAL',
                        user: 'Bodega Central -> Laboratorio',
                        formulaName: \`Destape de \${unitsToOpen} envase(s) nuevo(s) (\${addedQty} \${product.baseUnit || 'GR'})\`,
                        notes: \`Se destapó envase cerrado de \${unitCapacity}\${product.baseUnit || 'GR'} desde Bodega Central.\`
                    });

                    // 2. If usedQuantity > 0: Transaction Consumo Inmediato
                    if (validUsed > 0) {
                        addKardexTransaction({
                            id: \`TX-LAB-\${Date.now() + 1}\`,
                            date: nowStr,
                            skuId: product.sku,
                            productName: product.name,
                            lotNumber: \`LOT-MZ-\${Date.now().toString().slice(-4)}\`,
                            type: 'Salida',
                            quantity: -validUsed,
                            balanceBefore: prevLab + addedQty,
                            balanceAfter: newLab,
                            unit: product.baseUnit || 'GR',
                            operationType: 'CONSUMO_MEZCLA',
                            documentRef: reason || 'CONSUMO-DESTAPE',
                            user: 'Operador Tintometría (KDS)',
                            formulaName: reason || 'Consumo inmediato en lote de mezcla',
                            notes: \`Dosificados \${validUsed}\${product.baseUnit || 'GR'} al destapar. Saldo en tarro para inventario mezclas: \${newLab}\${product.baseUnit || 'GR'}.\`
                        });
                    }
                }
            }

            return prev.map(p => {
                if (p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId) {
                    const unitCapacity = p.netWeightKg || p.netVolumeLiters || (p.baseUnit === 'GR' ? 1000 : 20);
                    const unitsToOpen = Math.min(p.totalStock, units);
                    if (unitsToOpen <= 0) return p;
                    const addedQty = unitsToOpen * unitCapacity;
                    const validUsed = Math.min(addedQty, Math.max(0, usedQuantity));
                    return {
                        ...p,
                        totalStock: p.totalStock - unitsToOpen,
                        labStock: (p.labStock || 0) + addedQty - validUsed
                    };
                }
                return p;
            });
        });
    };`;

const sIdx = code.indexOf(targetFuncStart);
const eIdx = code.indexOf(targetFuncEnd);

if (sIdx !== -1 && eIdx !== -1) {
    code = code.substring(0, sIdx) + newFunc + "\n\n    " + code.substring(eIdx);
    fs.writeFileSync(contextPath, code, 'utf8');
    console.log('openUnitToLab updated in EnterpriseContext.tsx!');
} else {
    console.log('Could not find start or end index for openUnitToLab');
}
