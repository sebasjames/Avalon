const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../context/EnterpriseContext.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
if (!code.includes('MezclaReceta')) {
    code = code.replace(
        "ChemicalPresentation, ProductionBatch } from '../types';",
        "ChemicalPresentation, ProductionBatch, MezclaOrder, MezclaStatus, MezclaReceta } from '../types';"
    );
    console.log('Updated types import in EnterpriseContext');
}

// 2. Update EnterpriseContextType interface
const interfaceTarget = `    // --- Fórmulas y Recetas ---
    recipes: Recipe[];
    addRecipe: (recipe: Recipe) => void;
    deleteRecipe: (id: string) => void;
    processCreditNote: (t: AccountingTransaction) => void;
    reconcileDatáfonoTransaction: (id: string, bankAmount: number, bankFee: number) => void;`;

const interfaceAddition = `    // --- Fórmulas y Recetas ---
    recipes: Recipe[];
    addRecipe: (recipe: Recipe) => void;
    deleteRecipe: (id: string) => void;
    processCreditNote: (t: AccountingTransaction) => void;
    reconcileDatáfonoTransaction: (id: string, bankAmount: number, bankFee: number) => void;

    // --- Base de Datos de Mezclas y KDS ---
    mezclaOrders: MezclaOrder[];
    addMezclaOrder: (m: MezclaOrder) => void;
    updateMezclaOrder: (id: string, updates: Partial<MezclaOrder>) => void;
    mezclaCatalogo: MezclaReceta[];
    saveMezclaToCatalogo: (receta: Omit<MezclaReceta, 'id' | 'timesPrepared' | 'createdAt'> & { id?: string }) => MezclaReceta;
    updateMezclaCatalogo: (id: string, updates: Partial<MezclaReceta>) => void;
    deleteMezclaFromCatalogo: (id: string) => void;`;

if (!code.includes('mezclaCatalogo: MezclaReceta[];')) {
    code = code.replace(interfaceTarget, interfaceAddition);
    console.log('Updated EnterpriseContextType interface');
}

// 3. Define SEED_MEZCLAS_CATALOGO if not defined
const seedCode = `
export const SEED_MEZCLAS_CATALOGO: MezclaReceta[] = [
    {
        id: 'REC-RAL-1000',
        name: 'Beige Arena - RAL 1000',
        colorCode: 'RAL 1000',
        clientName: 'Constructor S.A.',
        baseSku: 'BASE-POLI-PST',
        baseName: 'Base Pastel Poliuretano',
        baseType: 'SOLVENTE INTERNO',
        formula: {
            'PIGMENT-AMARILLO-OX': '14.5',
            'PIGMENT-BLANCO-TIT': '32.0',
            'PIGMENT-NEGRO-HUMO': '1.8'
        },
        unit: 'GL',
        density: 1.15,
        category: 'ESTANDAR',
        timesPrepared: 12,
        lastPreparedAt: '2026-03-28T14:30:00.000Z',
        createdAt: '2025-11-10T09:00:00.000Z',
        createdByUser: 'Laboratorio Central',
        notes: 'Fórmula estándar de alta resistencia UV para exteriores.'
    },
    {
        id: 'REC-RAL-3000',
        name: 'Rojo Fuego Seguridad - RAL 3000',
        colorCode: 'RAL 3000',
        clientName: 'Taller El Rayo',
        baseSku: 'BASE-ACR-INT',
        baseName: 'Base Intensa Acrílica',
        baseType: 'ACRÍLICO AUTOMOTRIZ',
        formula: {
            'PIGMENT-ROJO-ORGANICO': '45.0',
            'PIGMENT-AMARILLO-MED': '8.2',
            'PIGMENT-MAGENTA': '3.4'
        },
        unit: 'GL',
        density: 1.05,
        category: 'ESPECIAL_CLIENTE',
        timesPrepared: 7,
        lastPreparedAt: '2026-04-01T10:15:00.000Z',
        createdAt: '2026-01-15T11:20:00.000Z',
        createdByUser: 'Operador Mezclas Gaitan',
        notes: 'Ajuste de brillo para carrocería comercial.'
    },
    {
        id: 'REC-CUSTOM-VERDE-CONTR',
        name: 'Verde Máquina Corporativo',
        colorCode: 'VERDE-CONST-02',
        clientName: 'Constructor S.A.',
        baseSku: 'BASE-EPOX-IND',
        baseName: 'Base Epóxica Industrial',
        baseType: 'EPÓXICO INDUSTRIAL',
        formula: {
            'PIGMENT-VERDE-FTALO': '28.0',
            'PIGMENT-AMARILLO-CROMO': '18.5',
            'PIGMENT-NEGRO-HUMO': '4.0'
        },
        unit: 'GL',
        density: 1.25,
        category: 'ESPECIAL_CLIENTE',
        timesPrepared: 5,
        lastPreparedAt: '2026-03-15T16:00:00.000Z',
        createdAt: '2026-02-05T08:30:00.000Z',
        createdByUser: 'Laboratorio Planta',
        notes: 'Tono especial desarrollado a muestra de chapa para equipos pesados.'
    },
    {
        id: 'REC-RAL-7035',
        name: 'Gris Luz Tableros - RAL 7035',
        colorCode: 'RAL 7035',
        clientName: 'Catálogo General',
        baseSku: 'BASE-POLI-PST',
        baseName: 'Base Pastel Poliuretano',
        baseType: 'SOLVENTE INTERNO',
        formula: {
            'PIGMENT-BLANCO-TIT': '48.0',
            'PIGMENT-NEGRO-HUMO': '2.1',
            'PIGMENT-OXIDO-AMARILLO': '0.9'
        },
        unit: 'GL',
        density: 1.18,
        category: 'ESTANDAR',
        timesPrepared: 19,
        lastPreparedAt: '2026-04-03T11:00:00.000Z',
        createdAt: '2025-10-01T10:00:00.000Z',
        createdByUser: 'Ing. Tintometría',
        notes: 'Color normalizado para tableros eléctricos y ductos.'
    },
    {
        id: 'REC-CUSTOM-AZUL-TRAF',
        name: 'Azul Tráfico Señalización',
        colorCode: 'AZUL-TRAF-PROCO',
        clientName: 'Catálogo General',
        baseSku: 'BASE-ACR-TRAF',
        baseName: 'Base Tráfico Acrílica',
        baseType: 'TRÁFICO BASE SOLVENTE',
        formula: {
            'PIGMENT-AZUL-FTALO': '35.0',
            'PIGMENT-BLANCO-TIT': '15.0'
        },
        unit: 'GL',
        density: 1.30,
        category: 'AJUSTE_PLANTA',
        timesPrepared: 9,
        lastPreparedAt: '2026-03-22T09:40:00.000Z',
        createdAt: '2026-01-20T14:10:00.000Z',
        createdByUser: 'Supervisor Planta Centenario',
        notes: 'Excelente adherencia y secado rápido (15 min al tacto).'
    }
];
`;

if (!code.includes('SEED_MEZCLAS_CATALOGO')) {
    code = code.replace(
        'export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {',
        seedCode + '\nexport const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {'
    );
    console.log('Added SEED_MEZCLAS_CATALOGO');
}

// 4. State and handlers
const stateAddition = `    const [mezclaOrders, setMezclaOrders] = useState<MezclaOrder[]>([]);
    const [mezclaCatalogo, setMezclaCatalogo] = useState<MezclaReceta[]>(SEED_MEZCLAS_CATALOGO);

    const addMezclaOrder = (m: MezclaOrder) => setMezclaOrders(prev => [...prev, m]);
    const updateMezclaOrder = (id: string, updates: Partial<MezclaOrder>) => {
        setMezclaOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    };

    const saveMezclaToCatalogo = (receta: Omit<MezclaReceta, 'id' | 'timesPrepared' | 'createdAt'> & { id?: string }): MezclaReceta => {
        let savedResult: MezclaReceta;
        setMezclaCatalogo(prev => {
            const existingIndex = prev.findIndex(r => 
                (receta.id && r.id === receta.id) ||
                (r.colorCode.toUpperCase() === (receta.colorCode || '').toUpperCase() && 
                 r.baseSku === receta.baseSku &&
                 (r.clientName || 'General').toUpperCase() === (receta.clientName || 'General').toUpperCase())
            );

            if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                savedResult = {
                    ...existing,
                    ...receta,
                    id: existing.id,
                    timesPrepared: (existing.timesPrepared || 0) + 1,
                    lastPreparedAt: new Date().toISOString(),
                    formula: { ...existing.formula, ...receta.formula }
                };
                const next = [...prev];
                next[existingIndex] = savedResult;
                return next;
            } else {
                savedResult = {
                    ...receta,
                    id: receta.id || \`REC-MZ-\${Date.now()}-\${Math.floor(Math.random() * 1000)}\`,
                    timesPrepared: 1,
                    createdAt: new Date().toISOString(),
                    lastPreparedAt: new Date().toISOString(),
                    category: receta.category || (receta.clientName && receta.clientName !== 'Catálogo General' && receta.clientName !== 'General' ? 'ESPECIAL_CLIENTE' : 'ESTANDAR')
                };
                return [savedResult, ...prev];
            }
        });
        return savedResult!;
    };

    const updateMezclaCatalogo = (id: string, updates: Partial<MezclaReceta>) => {
        setMezclaCatalogo(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const deleteMezclaFromCatalogo = (id: string) => {
        setMezclaCatalogo(prev => prev.filter(r => r.id !== id));
    };`;

if (!code.includes('saveMezclaToCatalogo =')) {
    code = code.replace(
        /const \[mezclaOrders, setMezclaOrders\] = useState<MezclaOrder\[\]>\(\[\]\);[\s\S]*?const updateMezclaOrder = \(id: string, updates: Partial<MezclaOrder>\) => \{[\s\S]*?\};/,
        stateAddition
    );
    console.log('Added mezclaCatalogo state and functions');
}

// 5. Update getCompleteState & restoreCompleteState
if (!code.includes('mezclaCatalogo, mezclaOrders,')) {
    code = code.replace(
        'crmSettings, mezclaOrders, locations,',
        'crmSettings, mezclaOrders, mezclaCatalogo, locations,'
    );
}

if (!code.includes('if (data.mezclaCatalogo) setMezclaCatalogo(data.mezclaCatalogo);')) {
    code = code.replace(
        'if (data.locations) setLocations(data.locations);',
        'if (data.mezclaCatalogo) setMezclaCatalogo(data.mezclaCatalogo);\n        if (data.locations) setLocations(data.locations);'
    );
}

if (!code.includes('if (parsed.mezclaCatalogo) setMezclaCatalogo(parsed.mezclaCatalogo);')) {
    code = code.replace(
        'if (parsed.mezclaOrders) setMezclaOrders(parsed.mezclaOrders);',
        'if (parsed.mezclaOrders) setMezclaOrders(parsed.mezclaOrders);\n                    if (parsed.mezclaCatalogo) setMezclaCatalogo(parsed.mezclaCatalogo);'
    );
}

// 6. Update Provider value
if (!code.includes('saveMezclaToCatalogo,')) {
    code = code.replace(
        'mezclaOrders, addMezclaOrder, updateMezclaOrder,',
        'mezclaOrders, addMezclaOrder, updateMezclaOrder, mezclaCatalogo, saveMezclaToCatalogo, updateMezclaCatalogo, deleteMezclaFromCatalogo,'
    );
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('EnterpriseContext.tsx updated successfully');
