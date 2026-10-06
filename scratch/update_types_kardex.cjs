const fs = require('fs');
const path = require('path');

const typesPath = path.resolve(__dirname, '../types.ts');
let code = fs.readFileSync(typesPath, 'utf8');

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
  operationType?: 'APERTURA_ENVASE' | 'CONSUMO_MEZCLA' | 'AJUSTE_BASCULA' | 'VACIADO_ENVASE' | 'AJUSTE_GENERAL';
  mezclaOrderId?: string;
  formulaName?: string;
  balanceBefore?: number;
  unit?: string;
  notes?: string;
}`;

if (code.includes('export interface KardexTransaction {')) {
    code = code.replace(oldKardex, newKardex);
    fs.writeFileSync(typesPath, code, 'utf8');
    console.log('KardexTransaction interface extended in types.ts');
} else {
    console.log('KardexTransaction interface not matched');
}
