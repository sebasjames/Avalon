const fs = require('fs');
const path = require('path');

// 1. Fix MezclasCatalogo.tsx line 433
const catalogoPath = path.resolve(__dirname, '../components/MezclasCatalogo.tsx');
let catalogoCode = fs.readFileSync(catalogoPath, 'utf8');
catalogoCode = catalogoCode.replace('{qty}g', '{String(qty)}g');
fs.writeFileSync(catalogoPath, catalogoCode, 'utf8');
console.log('Fixed MezclasCatalogo.tsx');

// 2. Fix EnterpriseContext.tsx
const ecPath = path.resolve(__dirname, '../context/EnterpriseContext.tsx');
let ecCode = fs.readFileSync(ecPath, 'utf8');

// Add to EnterpriseContextType
if (!ecCode.includes('mezclaCatalogo: MezclaReceta[];')) {
    ecCode = ecCode.replace(
        "reconcileDat\u00e1fonoTransaction: (id: string, bankAmount: number, bankFee: number) => void;",
        `reconcileDat\u00e1fonoTransaction: (id: string, bankAmount: number, bankFee: number) => void;

    // --- Base de Datos de Mezclas y KDS ---
    mezclaOrders: MezclaOrder[];
    addMezclaOrder: (m: MezclaOrder) => void;
    updateMezclaOrder: (id: string, updates: Partial<MezclaOrder>) => void;
    mezclaCatalogo: MezclaReceta[];
    saveMezclaToCatalogo: (receta: Omit<MezclaReceta, 'id' | 'timesPrepared' | 'createdAt'> & { id?: string }) => MezclaReceta;
    updateMezclaCatalogo: (id: string, updates: Partial<MezclaReceta>) => void;
    deleteMezclaFromCatalogo: (id: string) => void;`
    );
    console.log('Added mezclaCatalogo to EnterpriseContextType');
}

// Add locations state
const locationsState = `    const [locations, setLocations] = useState<WarehouseLocation[]>([
        { id: 'LOC-001', name: 'Centenario', address: 'Sede Principal Centenario', type: 'Bodega Principal', status: 'Activa' },
        { id: 'LOC-002', name: 'Gaitan', address: 'Punto de Venta Gaitan', type: 'Punto de Venta', status: 'Activa' },
        { id: 'LOC-003', name: 'Barranquilla', address: 'Bodega Satélite Barranquilla', type: 'Bodega Satélite', status: 'Activa' },
        { id: 'LOC-004', name: 'Transito', address: 'Productos en tránsito (llegaron, no distribuidos)', type: 'Bodega Satélite', status: 'Activa' },
    ]);
`;

if (!ecCode.includes('const [locations, setLocations] = useState<WarehouseLocation[]>')) {
    ecCode = ecCode.replace(
        'const addLocation = (loc: WarehouseLocation) => setLocations(prev => [...prev, loc]);',
        locationsState + '\n    const addLocation = (loc: WarehouseLocation) => setLocations(prev => [...prev, loc]);'
    );
    console.log('Restored locations state');
}

fs.writeFileSync(ecPath, ecCode, 'utf8');
console.log('EnterpriseContext.tsx fixed successfully');
