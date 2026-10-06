const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, '..', 'types.ts');
let content = fs.readFileSync(typesPath, 'utf8');

// Detect CRLF vs LF
const isCRLF = content.includes('\r\n');
const eol = isCRLF ? '\r\n' : '\n';

// Replace KardexTransaction
const oldKardexLines = [
  'export interface KardexTransaction {',
  '  id: string;',
  '  date: string;',
  '  skuId: string;',
  '  lotNumber: string;',
  "  type: 'Entrada' | 'Salida' | 'Ajuste';",
  '  quantity: number;',
  '  balanceAfter: number;',
  '  documentRef: string;',
  '  user: string;',
  '}'
].join(eol);

const newKardexLines = [
  'export interface KardexTransaction {',
  '  id: string;',
  '  date: string;',
  '  skuId: string;',
  '  lotNumber: string;',
  "  type: 'Entrada' | 'Salida' | 'Ajuste';",
  '  quantity: number;',
  '  balanceAfter: number;',
  '  documentRef: string;',
  '  user: string;',
  '  productName?: string;',
  "  operationType?: 'APERTURA_ENVASE' | 'CONSUMO_MEZCLA' | 'AJUSTE_BASCULA' | 'VACIADO_ENVASE' | 'AJUSTE_GENERAL' | 'INGRESO_DESTAPADO' | string;",
  '  mezclaOrderId?: string;',
  '  formulaName?: string;',
  '  balanceBefore?: number;',
  '  unit?: string;',
  '  notes?: string;',
  '}'
].join(eol);

if (content.includes(oldKardexLines)) {
  content = content.replace(oldKardexLines, newKardexLines);
  console.log('KardexTransaction successfully updated in types.ts');
} else {
  console.log('oldKardexLines not found');
}

// Replace MezclaOrder
const oldMezclaLines = [
  'export interface MezclaOrder {',
  '    id: string;',
  '    saleId: string;',
  '    clientName: string;',
  '    colorId: string;',
  '    baseSku: string;',
  '    baseName: string;',
  '    formula: Record<string, string>; // e.g., { "TINTA AMARILLA": "15oz", ... }',
  '    status: MezclaStatus;',
  '    baseType?: string; // Enlace a la tecnología (ej. SOLVENTE INTERNO)',
  '    requestedAt: string;',
  '    completedAt?: string;',
  '    operatorName?: string;',
  '    timelineNotes?: TimelineNote[];',
  '}'
].join(eol);

const newMezclaLines = [
  'export interface MezclaOrder {',
  '    id: string;',
  '    saleId: string;',
  '    clientName: string;',
  '    colorId: string;',
  '    baseSku: string;',
  '    baseName: string;',
  '    formula: Record<string, string>; // e.g., { "TINTA AMARILLA": "15oz", ... }',
  '    status: MezclaStatus;',
  '    baseType?: string; // Enlace a la tecnología (ej. SOLVENTE INTERNO)',
  '    requestedAt: string;',
  '    completedAt?: string;',
  '    operatorName?: string;',
  '    timelineNotes?: TimelineNote[];',
  '    colorName?: string;',
  '    presentation?: string;',
  '    recipeName?: string;',
  '    customerName?: string;',
  '}'
].join(eol);

if (content.includes(oldMezclaLines)) {
  content = content.replace(oldMezclaLines, newMezclaLines);
  console.log('MezclaOrder successfully updated in types.ts');
} else {
  console.log('oldMezclaLines not found');
}

fs.writeFileSync(typesPath, content, 'utf8');
