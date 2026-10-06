const fs = require('fs');
const path = require('path');

const contextPath = path.resolve(__dirname, '../context/EnterpriseContext.tsx');
let code = fs.readFileSync(contextPath, 'utf8');

// 1. Define INITIAL_LAB_KARDEX if not already
const initialLabKardexDef = `
const INITIAL_LAB_KARDEX: KardexTransaction[] = [
    {
        id: 'TX-LAB-101',
        date: '2026-10-05 08:35:10',
        skuId: 'PIGMENT-AMARILLO-OX',
        productName: 'Pigmento Amarillo Óxido Concentrado',
        lotNumber: 'LOTE-MZ-8821',
        type: 'Salida',
        quantity: -14.5,
        balanceBefore: 364.5,
        balanceAfter: 350.0,
        unit: 'GR',
        operationType: 'CONSUMO_MEZCLA',
        documentRef: 'ORD-MZ-001',
        mezclaOrderId: 'ORD-MZ-001',
        formulaName: 'Gris Platino Satinado (Lote #001)',
        user: 'Operador Tintometría (Báscula 1)',
        notes: 'Dosificado en mezcla. Consumo directo de saldo destapado.'
    },
    {
        id: 'TX-LAB-102',
        date: '2026-10-05 08:36:22',
        skuId: 'PIGMENT-BLANCO-TIT',
        productName: 'Pigmento Blanco Titanio Super Cubriente',
        lotNumber: 'LOTE-MZ-8821',
        type: 'Salida',
        quantity: -32.0,
        balanceBefore: 852.0,
        balanceAfter: 820.0,
        unit: 'GR',
        operationType: 'CONSUMO_MEZCLA',
        documentRef: 'ORD-MZ-001',
        mezclaOrderId: 'ORD-MZ-001',
        formulaName: 'Gris Platino Satinado (Lote #001)',
        user: 'Operador Tintometría (Báscula 1)',
        notes: 'Dosificado en mezcla. Saldo remanente en tarro.'
    },
    {
        id: 'TX-LAB-103',
        date: '2026-10-05 08:37:05',
        skuId: 'PIGMENT-NEGRO-HUMO',
        productName: 'Pigmento Negro Humo Especial',
        lotNumber: 'LOTE-MZ-8821',
        type: 'Salida',
        quantity: -1.8,
        balanceBefore: 121.8,
        balanceAfter: 120.0,
        unit: 'GR',
        operationType: 'CONSUMO_MEZCLA',
        documentRef: 'ORD-MZ-001',
        mezclaOrderId: 'ORD-MZ-001',
        formulaName: 'Gris Platino Satinado (Lote #001)',
        user: 'Operador Tintometría (Báscula 1)',
        notes: 'Nivel bajo en tarro destapado (120g restantes).'
    },
    {
        id: 'TX-LAB-104',
        date: '2026-10-05 09:12:44',
        skuId: 'PIGMENT-ROJO-ORGANICO',
        productName: 'Pigmento Rojo Orgánico Brillante',
        lotNumber: 'L-PRO-9442',
        type: 'Entrada',
        quantity: 1000.0,
        balanceBefore: 0.0,
        balanceAfter: 1000.0,
        unit: 'GR',
        operationType: 'APERTURA_ENVASE',
        documentRef: 'DESTAPE-MANUAL-04',
        user: 'Bodega Central -> Laboratorio',
        formulaName: 'Destape de 1 tarro nuevo de 1,000g',
        notes: 'Traslado de 1 unidad sellada de almacén a mesón de mezclas.'
    },
    {
        id: 'TX-LAB-105',
        date: '2026-10-05 09:45:30',
        skuId: 'PIGMENT-ROJO-ORGANICO',
        productName: 'Pigmento Rojo Orgánico Brillante',
        lotNumber: 'LOTE-MZ-8822',
        type: 'Salida',
        quantity: -520.0,
        balanceBefore: 1000.0,
        balanceAfter: 480.0,
        unit: 'GR',
        operationType: 'CONSUMO_MEZCLA',
        documentRef: 'ORD-MZ-002',
        mezclaOrderId: 'ORD-MZ-002',
        formulaName: 'Rojo Carmesí Industrial (Lote #002)',
        user: 'Operador Tintometría (Báscula 1)',
        notes: 'Consumidos 520g. Quedan 480g en tarro destapado.'
    },
    {
        id: 'TX-LAB-106',
        date: '2026-10-05 10:15:00',
        skuId: 'BASE-POLIURETANO-BLANCO',
        productName: 'Base Poliuretano Blanco Extra (Cuñete 20L)',
        lotNumber: 'LOTE-PU-002',
        type: 'Salida',
        quantity: -5.5,
        balanceBefore: 20.0,
        balanceAfter: 14.5,
        unit: 'LT',
        operationType: 'CONSUMO_MEZCLA',
        documentRef: 'ORD-MZ-001',
        mezclaOrderId: 'ORD-MZ-001',
        formulaName: 'Base para Esmalte Poliuretano Blanco',
        user: 'Operador Tintometría (Mesón 2)',
        notes: 'Descontados 5.5 Litros del cuñete destapado.'
    },
    {
        id: 'TX-LAB-107',
        date: '2026-10-05 10:40:15',
        skuId: 'PIGMENT-AMARILLO-OX',
        productName: 'Pigmento Amarillo Óxido Concentrado',
        lotNumber: 'LOTE-BASC-01',
        type: 'Ajuste',
        quantity: -10.0,
        balanceBefore: 360.0,
        balanceAfter: 350.0,
        unit: 'GR',
        operationType: 'AJUSTE_BASCULA',
        documentRef: 'CALIB-TARA-01',
        user: 'Supervisor Calidad Laboratorio',
        formulaName: 'Pesaje de Control en Báscula Digital',
        notes: 'Ajuste por residuo adherido a paredes del envase.'
    }
];
`;

if (!code.includes('INITIAL_LAB_KARDEX')) {
    code = code.replace(
        "export const EnterpriseProvider",
        initialLabKardexDef + "\nexport const EnterpriseProvider"
    );
}

// 2. Prepend INITIAL_LAB_KARDEX to kardexTransactions state
const oldKardexInit = "const [kardexTransactions, setKardexTransactions] = useState<KardexTransaction[]>(KARDEX_TRANSACTIONS);";
const newKardexInit = `const [kardexTransactions, setKardexTransactions] = useState<KardexTransaction[]>(() => {
        return [...INITIAL_LAB_KARDEX, ...KARDEX_TRANSACTIONS];
    });`;

if (code.includes(oldKardexInit)) {
    code = code.replace(oldKardexInit, newKardexInit);
}

// 3. Update consumeLabStock, updateLabStock, openUnitToLab to record Kardex entries
const targetConsumeBlock = `    const consumeLabStock = (skuOrId: string, quantityToConsume: number): { success: boolean; message: string } => {
        let result = { success: false, message: '' };
        
        setInventory(prev => {
            const productIndex = prev.findIndex(p => p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId);
            if (productIndex === -1) {
                const isPigment = skuOrId.startsWith('PIGMENT-');
                const cleanName = isPigment ? skuOrId.replace('PIGMENT-', 'Pigmento ') : skuOrId;
                const unitCapacity = 1000;
                const unitsNeeded = Math.ceil(quantityToConsume / unitCapacity);
                const initialTotalStock = 10;
                const remainingTotalStock = Math.max(0, initialTotalStock - unitsNeeded);
                const newLabStock = (unitsNeeded * unitCapacity) - quantityToConsume;

                const newProduct: Product = {
                    id: skuOrId.toLowerCase(),
                    sku: skuOrId,
                    originalSku: skuOrId,
                    name: cleanName,
                    category: Category.RAW_MATERIAL,
                    family: 'Pigmentos y Colorantes',
                    brand: 'Tintometría Procoquinal',
                    baseUnit: 'GR',
                    density: 1.0,
                    unitCost: 35000,
                    price: 52000,
                    totalStock: remainingTotalStock,
                    reservedStock: 0,
                    status: InventoryStatus.ACTIVE,
                    abc: ABCClass.A,
                    xyz: XYZClass.X,
                    agingDays: 0,
                    batches: [],
                    netWeightKg: 1000,
                    labStock: newLabStock
                };

                result = { success: true, message: \`Destapado nuevo envase (\${newLabStock}g restantes)\` };
                return [...prev, newProduct];
            }

            const p = prev[productIndex];
            const currentLabStock = p.labStock || 0;
            
            if (currentLabStock >= quantityToConsume) {
                const newInventory = [...prev];
                newInventory[productIndex] = { ...p, labStock: currentLabStock - quantityToConsume };
                result = { success: true, message: \`Consumido de Bodega Mezclas\` };
                return newInventory;
            }

            const remainingToConsume = quantityToConsume - currentLabStock;
            const unitCapacity = p.netWeightKg || p.netVolumeLiters || 1; 
            const unitsNeeded = Math.ceil(remainingToConsume / unitCapacity);

            if (p.totalStock < unitsNeeded) {
                result = { success: false, message: \`Falta stock (sellado) para destapar.\` };
                return prev;
            }

            const newTotalStock = p.totalStock - unitsNeeded;
            const newLabStock = currentLabStock + (unitsNeeded * unitCapacity) - quantityToConsume;

            const newInventory = [...prev];
            newInventory[productIndex] = { 
                ...p, 
                totalStock: newTotalStock,
                labStock: newLabStock
            };
            
            result = { success: true, message: \`Se destaparon \${unitsNeeded} unidad(es)\` };
            return newInventory;
        });

        return result;
    };

    const updateLabStock = (skuOrId: string, newLabStock: number) => {
        setInventory(prev => prev.map(p => {
            if (p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId) {
                return { ...p, labStock: Math.max(0, newLabStock) };
            }
            return p;
        }));
    };

    const openUnitToLab = (skuOrId: string, units: number = 1) => {
        setInventory(prev => prev.map(p => {
            if (p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId) {
                const unitCapacity = p.netWeightKg || p.netVolumeLiters || 1;
                const unitsToOpen = Math.min(p.totalStock, units);
                if (unitsToOpen <= 0) return p;
                return {
                    ...p,
                    totalStock: p.totalStock - unitsToOpen,
                    labStock: (p.labStock || 0) + (unitsToOpen * unitCapacity)
                };
            }
            return p;
        }));
    };`;

const enhancedConsumeBlock = `    const consumeLabStock = (skuOrId: string, quantityToConsume: number): { success: boolean; message: string } => {
        let result = { success: false, message: '' };
        
        setInventory(prev => {
            const productIndex = prev.findIndex(p => p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId);
            const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

            if (productIndex === -1) {
                const isPigment = skuOrId.startsWith('PIGMENT-');
                const cleanName = isPigment ? skuOrId.replace('PIGMENT-', 'Pigmento ') : skuOrId;
                const unitCapacity = 1000;
                const unitsNeeded = Math.ceil(quantityToConsume / unitCapacity);
                const initialTotalStock = 10;
                const remainingTotalStock = Math.max(0, initialTotalStock - unitsNeeded);
                const newLabStock = (unitsNeeded * unitCapacity) - quantityToConsume;

                const newProduct: Product = {
                    id: skuOrId.toLowerCase(),
                    sku: skuOrId,
                    originalSku: skuOrId,
                    name: cleanName,
                    category: Category.RAW_MATERIAL,
                    family: 'Pigmentos y Colorantes',
                    brand: 'Tintometría Procoquinal',
                    baseUnit: 'GR',
                    density: 1.0,
                    unitCost: 35000,
                    price: 52000,
                    totalStock: remainingTotalStock,
                    reservedStock: 0,
                    status: InventoryStatus.ACTIVE,
                    abc: ABCClass.A,
                    xyz: XYZClass.X,
                    agingDays: 0,
                    batches: [],
                    netWeightKg: 1000,
                    labStock: newLabStock
                };

                // Log Kardex
                addKardexTransaction({
                    id: \`TX-LAB-\${Date.now()}\`,
                    date: nowStr,
                    skuId: skuOrId,
                    productName: cleanName,
                    lotNumber: \`LOTE-MZ-\${Date.now().toString().slice(-4)}\`,
                    type: 'Salida',
                    quantity: -quantityToConsume,
                    balanceBefore: unitsNeeded * unitCapacity,
                    balanceAfter: newLabStock,
                    unit: 'GR',
                    operationType: 'CONSUMO_MEZCLA',
                    documentRef: 'ORD-MEZCLA-ACTIVA',
                    user: 'Operador Tintometría (KDS)',
                    formulaName: 'Dosificación en Lote de Mezcla',
                    notes: \`Destapadas \${unitsNeeded} unidad(es) de Bodega Central. Consumo: \${quantityToConsume}g. Saldo restante: \${newLabStock}g\`
                });

                result = { success: true, message: \`Destapado nuevo envase (\${newLabStock}g restantes)\` };
                return [...prev, newProduct];
            }

            const p = prev[productIndex];
            const currentLabStock = p.labStock || 0;
            const unitName = p.baseUnit || 'GR';
            
            if (currentLabStock >= quantityToConsume) {
                const newLabStock = currentLabStock - quantityToConsume;
                const newInventory = [...prev];
                newInventory[productIndex] = { ...p, labStock: newLabStock };
                
                // Log Kardex
                addKardexTransaction({
                    id: \`TX-LAB-\${Date.now()}\`,
                    date: nowStr,
                    skuId: p.sku,
                    productName: p.name,
                    lotNumber: \`LOTE-MZ-\${Date.now().toString().slice(-4)}\`,
                    type: 'Salida',
                    quantity: -quantityToConsume,
                    balanceBefore: currentLabStock,
                    balanceAfter: newLabStock,
                    unit: unitName,
                    operationType: 'CONSUMO_MEZCLA',
                    documentRef: 'ORD-MEZCLA-ACTIVA',
                    user: 'Operador Tintometría (KDS)',
                    formulaName: 'Dosificación en Lote de Mezcla',
                    notes: \`Consumidos \${quantityToConsume}\${unitName} de saldo destapado. Remanente: \${newLabStock}\${unitName}\`
                });

                result = { success: true, message: \`Consumido de Bodega Mezclas\` };
                return newInventory;
            }

            const remainingToConsume = quantityToConsume - currentLabStock;
            const unitCapacity = p.netWeightKg || p.netVolumeLiters || 1; 
            const unitsNeeded = Math.ceil(remainingToConsume / unitCapacity);

            if (p.totalStock < unitsNeeded) {
                result = { success: false, message: \`Falta stock (sellado) para destapar.\` };
                return prev;
            }

            const newTotalStock = p.totalStock - unitsNeeded;
            const newLabStock = currentLabStock + (unitsNeeded * unitCapacity) - quantityToConsume;

            const newInventory = [...prev];
            newInventory[productIndex] = { 
                ...p, 
                totalStock: newTotalStock,
                labStock: newLabStock
            };

            // Log Kardex
            addKardexTransaction({
                id: \`TX-LAB-\${Date.now()}\`,
                date: nowStr,
                skuId: p.sku,
                productName: p.name,
                lotNumber: \`LOTE-MZ-\${Date.now().toString().slice(-4)}\`,
                type: 'Salida',
                quantity: -quantityToConsume,
                balanceBefore: currentLabStock + (unitsNeeded * unitCapacity),
                balanceAfter: newLabStock,
                unit: unitName,
                operationType: 'CONSUMO_MEZCLA',
                documentRef: 'ORD-MEZCLA-ACTIVA',
                user: 'Operador Tintometría (KDS)',
                formulaName: 'Dosificación en Lote de Mezcla',
                notes: \`Agotado saldo previo (\${currentLabStock}\${unitName}) y destapadas \${unitsNeeded} unidad(es) de \${unitCapacity}\${unitName}. Saldo: \${newLabStock}\${unitName}\`
            });
            
            result = { success: true, message: \`Se destaparon \${unitsNeeded} unidad(es)\` };
            return newInventory;
        });

        return result;
    };

    const updateLabStock = (skuOrId: string, newLabStock: number) => {
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
            }

            return prev.map(p => {
                if (p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId) {
                    return { ...p, labStock: Math.max(0, newLabStock) };
                }
                return p;
            });
        });
    };

    const openUnitToLab = (skuOrId: string, units: number = 1) => {
        setInventory(prev => {
            const product = prev.find(p => p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId);
            if (product) {
                const unitCapacity = product.netWeightKg || product.netVolumeLiters || 1;
                const unitsToOpen = Math.min(product.totalStock, units);
                if (unitsToOpen > 0) {
                    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
                    const prevLab = product.labStock || 0;
                    const addedQty = unitsToOpen * unitCapacity;
                    const newLab = prevLab + addedQty;

                    addKardexTransaction({
                        id: \`TX-OPEN-\${Date.now()}\`,
                        date: nowStr,
                        skuId: product.sku,
                        productName: product.name,
                        lotNumber: \`LOT-BOD-\${Date.now().toString().slice(-4)}\`,
                        type: 'Entrada',
                        quantity: addedQty,
                        balanceBefore: prevLab,
                        balanceAfter: newLab,
                        unit: product.baseUnit || 'GR',
                        operationType: 'APERTURA_ENVASE',
                        documentRef: 'DESTAPE-MANUAL',
                        user: 'Bodega Central -> Laboratorio',
                        formulaName: \`Apertura de \${unitsToOpen} envase(s) nuevo(s)\`,
                        notes: \`Se destaparon \${unitsToOpen} unidad(es) de \${unitCapacity}\${product.baseUnit || 'GR'}. Nuevo saldo destapado: \${newLab}\${product.baseUnit || 'GR'}.\`
                    });
                }
            }

            return prev.map(p => {
                if (p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId) {
                    const unitCapacity = p.netWeightKg || p.netVolumeLiters || 1;
                    const unitsToOpen = Math.min(p.totalStock, units);
                    if (unitsToOpen <= 0) return p;
                    return {
                        ...p,
                        totalStock: p.totalStock - unitsToOpen,
                        labStock: (p.labStock || 0) + (unitsToOpen * unitCapacity)
                    };
                }
                return p;
            });
        });
    };`;

if (code.includes('const consumeLabStock = (skuOrId: string, quantityToConsume: number)')) {
    const startIdx = code.indexOf('const consumeLabStock = (skuOrId: string, quantityToConsume: number)');
    const endMarker = 'const updateInventoryStock = (productId: string, quantityChange: number)';
    const endIdx = code.indexOf(endMarker);
    if (startIdx !== -1 && endIdx !== -1) {
        code = code.substring(0, startIdx) + enhancedConsumeBlock.trim() + "\n\n    " + code.substring(endIdx);
    }
}

fs.writeFileSync(contextPath, code, 'utf8');
console.log('EnterpriseContext.tsx updated with comprehensive lab Kardex logging & initial transactions!');
