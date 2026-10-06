const fs = require('fs');
const path = require('path');

const contextPath = path.resolve(__dirname, '../context/EnterpriseContext.tsx');
let code = fs.readFileSync(contextPath, 'utf8');

// 1. Add Category, InventoryStatus, ABCClass, XYZClass to imports if not already
if (!code.includes('Category, InventoryStatus, ABCClass, XYZClass')) {
    code = code.replace(
        "import { Product, CrmDeal",
        "import { Product, Category, InventoryStatus, ABCClass, XYZClass, CrmDeal"
    );
}

// 2. Add methods to EnterpriseContextType
const typeTarget = "    consumeLabStock: (skuOrId: string, quantityToConsume: number) => { success: boolean; message: string };";
const typeReplacement = `    consumeLabStock: (skuOrId: string, quantityToConsume: number) => { success: boolean; message: string };
    updateLabStock: (skuOrId: string, newLabStock: number) => void;
    openUnitToLab: (skuOrId: string, units?: number) => void;`;

if (!code.includes('updateLabStock: (skuOrId: string, newLabStock: number) => void;')) {
    code = code.replace(typeTarget, typeReplacement);
}

// 3. Define INITIAL_LAB_PRODUCTS
const initialProductsDef = `
const INITIAL_LAB_PRODUCTS: Product[] = [
    {
        id: 'pig-am-ox',
        sku: 'PIGMENT-AMARILLO-OX',
        originalSku: 'AMARILLO-OX',
        name: 'Pigmento Amarillo Óxido Concentrado',
        category: Category.RAW_MATERIAL,
        family: 'Pigmentos y Colorantes',
        brand: 'Tintometría Procoquinal',
        baseUnit: 'GR',
        density: 1.2,
        unitCost: 35000,
        price: 52000,
        totalStock: 8,
        reservedStock: 0,
        status: InventoryStatus.ACTIVE,
        abc: ABCClass.A,
        xyz: XYZClass.X,
        agingDays: 12,
        batches: [],
        netWeightKg: 1000,
        labStock: 350
    },
    {
        id: 'pig-bl-tit',
        sku: 'PIGMENT-BLANCO-TIT',
        originalSku: 'BLANCO-TIT',
        name: 'Pigmento Blanco Titanio Super Cubriente',
        category: Category.RAW_MATERIAL,
        family: 'Pigmentos y Colorantes',
        brand: 'Tintometría Procoquinal',
        baseUnit: 'GR',
        density: 1.4,
        unitCost: 42000,
        price: 64000,
        totalStock: 14,
        reservedStock: 0,
        status: InventoryStatus.ACTIVE,
        abc: ABCClass.A,
        xyz: XYZClass.X,
        agingDays: 5,
        batches: [],
        netWeightKg: 1000,
        labStock: 820
    },
    {
        id: 'pig-neg-hum',
        sku: 'PIGMENT-NEGRO-HUMO',
        originalSku: 'NEGRO-HUMO',
        name: 'Pigmento Negro Humo Especial',
        category: Category.RAW_MATERIAL,
        family: 'Pigmentos y Colorantes',
        brand: 'Tintometría Procoquinal',
        baseUnit: 'GR',
        density: 1.1,
        unitCost: 28000,
        price: 45000,
        totalStock: 6,
        reservedStock: 0,
        status: InventoryStatus.ACTIVE,
        abc: ABCClass.B,
        xyz: XYZClass.Y,
        agingDays: 20,
        batches: [],
        netWeightKg: 1000,
        labStock: 120
    },
    {
        id: 'pig-roj-org',
        sku: 'PIGMENT-ROJO-ORGANICO',
        originalSku: 'ROJO-ORGANICO',
        name: 'Pigmento Rojo Orgánico Brillante',
        category: Category.RAW_MATERIAL,
        family: 'Pigmentos y Colorantes',
        brand: 'Tintometría Procoquinal',
        baseUnit: 'GR',
        density: 1.15,
        unitCost: 55000,
        price: 85000,
        totalStock: 5,
        reservedStock: 0,
        status: InventoryStatus.ACTIVE,
        abc: ABCClass.A,
        xyz: XYZClass.X,
        agingDays: 15,
        batches: [],
        netWeightKg: 1000,
        labStock: 480
    },
    {
        id: 'pig-az-fta',
        sku: 'PIGMENT-AZUL-FTALO',
        originalSku: 'AZUL-FTALO',
        name: 'Pigmento Azul Ftalocianina Profundo',
        category: Category.RAW_MATERIAL,
        family: 'Pigmentos y Colorantes',
        brand: 'Tintometría Procoquinal',
        baseUnit: 'GR',
        density: 1.12,
        unitCost: 48000,
        price: 72000,
        totalStock: 9,
        reservedStock: 0,
        status: InventoryStatus.ACTIVE,
        abc: ABCClass.A,
        xyz: XYZClass.Y,
        agingDays: 18,
        batches: [],
        netWeightKg: 1000,
        labStock: 210
    },
    {
        id: 'base-pu-blanco-20l',
        sku: 'BASE-POLIURETANO-BLANCO',
        originalSku: 'BASE-PU-BL',
        name: 'Base Poliuretano Blanco Extra (Cuñete 20L)',
        category: Category.RAW_MATERIAL,
        family: 'Bases Tintométricas',
        brand: 'Procoquinal Industrial',
        baseUnit: 'LT',
        density: 1.25,
        unitCost: 185000,
        price: 275000,
        totalStock: 18,
        reservedStock: 2,
        status: InventoryStatus.ACTIVE,
        abc: ABCClass.A,
        xyz: XYZClass.X,
        agingDays: 8,
        batches: [],
        netVolumeLiters: 20,
        labStock: 14.5
    },
    {
        id: 'base-pu-transp-20l',
        sku: 'BASE-POLIURETANO-TRANSP',
        originalSku: 'BASE-PU-TR',
        name: 'Base Poliuretano Transparente (Cuñete 20L)',
        category: Category.RAW_MATERIAL,
        family: 'Bases Tintométricas',
        brand: 'Procoquinal Industrial',
        baseUnit: 'LT',
        density: 0.98,
        unitCost: 165000,
        price: 245000,
        totalStock: 12,
        reservedStock: 0,
        status: InventoryStatus.ACTIVE,
        abc: ABCClass.A,
        xyz: XYZClass.X,
        agingDays: 14,
        batches: [],
        netVolumeLiters: 20,
        labStock: 5.0
    }
];
`;

if (!code.includes('INITIAL_LAB_PRODUCTS')) {
    code = code.replace(
        "export const EnterpriseProvider",
        initialProductsDef + "\nexport const EnterpriseProvider"
    );
}

// 4. Update useState for inventory
const oldInvInit = "const [inventory, setInventory] = useState<Product[]>(INVENTORY_DATA);";
const newInvInit = `const [inventory, setInventory] = useState<Product[]>(() => {
        const existingSkus = new Set(INVENTORY_DATA.map(p => p.sku));
        const toAdd = INITIAL_LAB_PRODUCTS.filter(p => !existingSkus.has(p.sku));
        return [...toAdd, ...INVENTORY_DATA];
    });`;

if (code.includes(oldInvInit)) {
    code = code.replace(oldInvInit, newInvInit);
}

// 5. Add updateLabStock and openUnitToLab functions, and enhance consumeLabStock
const targetConsume = `    const consumeLabStock = (skuOrId: string, quantityToConsume: number): { success: boolean; message: string } => {
        let result = { success: false, message: '' };
        
        setInventory(prev => {
            const productIndex = prev.findIndex(p => p.id === skuOrId || p.sku === skuOrId || p.originalSku === skuOrId);
            if (productIndex === -1) {
                result = { success: false, message: 'Producto no encontrado en inventario.' };
                return prev;
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
    };`;

const newConsumeAndHelpers = `    const consumeLabStock = (skuOrId: string, quantityToConsume: number): { success: boolean; message: string } => {
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

if (code.includes('const consumeLabStock = (skuOrId: string, quantityToConsume: number)')) {
    // Replace the block
    const startIdx = code.indexOf('const consumeLabStock = (skuOrId: string, quantityToConsume: number)');
    const endMarker = 'const updateInventoryStock = (productId: string, quantityChange: number)';
    const endIdx = code.indexOf(endMarker);
    if (startIdx !== -1 && endIdx !== -1) {
        code = code.substring(0, startIdx) + newConsumeAndHelpers.trim() + "\n\n    " + code.substring(endIdx);
    }
}

// 6. Add updateLabStock and openUnitToLab to provider value
if (!code.includes('updateLabStock,')) {
    code = code.replace(
        "consumeLabStock,",
        "consumeLabStock,\n            updateLabStock,\n            openUnitToLab,"
    );
}

fs.writeFileSync(contextPath, code, 'utf8');
console.log('Successfully updated EnterpriseContext.tsx with labStock capabilities and initial lab products!');
