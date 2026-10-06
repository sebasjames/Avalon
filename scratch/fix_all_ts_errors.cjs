const fs = require('fs');
const path = require('path');

// 1. Update types.ts
const typesPath = path.join(__dirname, '..', 'types.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

// KardexTransaction extension
const oldKardex = `export interface KardexTransaction {
  id: string;
  date: string;
  skuId: string;
  lotNumber: string;
  type: 'Entrada' | 'Salida' | 'Ajuste';
  quantity: number;
  balanceAfter: number;
  documentRef: string;
  user: string;
}`;

const newKardex = `export interface KardexTransaction {
  id: string;
  date: string;
  skuId: string;
  lotNumber: string;
  type: 'Entrada' | 'Salida' | 'Ajuste';
  quantity: number;
  balanceAfter: number;
  documentRef: string;
  user: string;
  productName?: string;
  operationType?: 'APERTURA_ENVASE' | 'CONSUMO_MEZCLA' | 'AJUSTE_BASCULA' | 'VACIADO_ENVASE' | 'AJUSTE_GENERAL' | 'INGRESO_DESTAPADO' | string;
  mezclaOrderId?: string;
  formulaName?: string;
  balanceBefore?: number;
  unit?: string;
  notes?: string;
}`;

typesContent = typesContent.replace(oldKardex, newKardex);

// AccountingTransaction GASTO_CAJA
typesContent = typesContent.replace(
  "type: 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA' | 'NOTA_CREDITO' | 'NOTA_DEBITO' | 'PAGO_RECIBIDO';",
  "type: 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA' | 'NOTA_CREDITO' | 'NOTA_DEBITO' | 'PAGO_RECIBIDO' | 'GASTO_CAJA';"
);

// MezclaOrder optional fields
const oldMezcla = `export interface MezclaOrder {
    id: string;
    saleId: string;
    clientName: string;
    colorId: string;
    baseSku: string;
    baseName: string;
    formula: Record<string, string>; // e.g., { "TINTA AMARILLA": "15oz", ... }
    status: MezclaStatus;
    baseType?: string; // Enlace a la tecnología (ej. SOLVENTE INTERNO)
    requestedAt: string;
    completedAt?: string;
    operatorName?: string;
    timelineNotes?: TimelineNote[];
}`;

const newMezcla = `export interface MezclaOrder {
    id: string;
    saleId: string;
    clientName: string;
    colorId: string;
    baseSku: string;
    baseName: string;
    formula: Record<string, string>; // e.g., { "TINTA AMARILLA": "15oz", ... }
    status: MezclaStatus;
    baseType?: string; // Enlace a la tecnología (ej. SOLVENTE INTERNO)
    requestedAt: string;
    completedAt?: string;
    operatorName?: string;
    timelineNotes?: TimelineNote[];
    colorName?: string;
    presentation?: string;
    recipeName?: string;
    customerName?: string;
}`;

typesContent = typesContent.replace(oldMezcla, newMezcla);
fs.writeFileSync(typesPath, typesContent, 'utf8');
console.log('types.ts updated');

// 2. Update utils/format.ts
const formatPath = path.join(__dirname, '..', 'utils', 'format.ts');
let formatContent = fs.readFileSync(formatPath, 'utf8');
if (!formatContent.includes('export const formatDate')) {
  formatContent += `\nexport const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
};\n`;
  fs.writeFileSync(formatPath, formatContent, 'utf8');
  console.log('utils/format.ts updated');
}

// 3. Update components/ProductionManagement.tsx
const prodPath = path.join(__dirname, '..', 'components', 'ProductionManagement.tsx');
let prodContent = fs.readFileSync(prodPath, 'utf8');
const oldProdState = `    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);`;
const newProdState = `    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newOrderName, setNewOrderName] = useState('');
    const [newOrderQty, setNewOrderQty] = useState('');`;

if (prodContent.includes(oldProdState) && !prodContent.includes('newOrderName')) {
  prodContent = prodContent.replace(oldProdState, newProdState);
  fs.writeFileSync(prodPath, prodContent, 'utf8');
  console.log('ProductionManagement.tsx updated');
}
