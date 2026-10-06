const fs = require('fs');
const path = require('path');

const typesPath = path.resolve(__dirname, '../types.ts');
let code = fs.readFileSync(typesPath, 'utf8');

const addition = `
export interface MezclaReceta {
    id: string;
    name: string;
    colorCode: string;
    clientName?: string;
    baseSku: string;
    baseName: string;
    baseType?: string;
    formula: Record<string, string>; // Gramos / proporción por unidad (ej. Galón)
    unit?: string; // 'GL', 'LT', 'KG'
    density?: number | string;
    instructions?: string;
    category?: 'ESTANDAR' | 'ESPECIAL_CLIENTE' | 'AJUSTE_PLANTA';
    timesPrepared: number;
    lastPreparedAt?: string;
    createdAt: string;
    createdByUser?: string;
    notes?: string;
}
`;

if (!code.includes('export interface MezclaReceta')) {
    code = code.replace(
        /export interface MezclaOrder\s*\{[\s\S]*?\n\}/,
        (match) => match + '\n' + addition
    );
    fs.writeFileSync(typesPath, code, 'utf8');
    console.log('Successfully updated types.ts');
} else {
    console.log('MezclaReceta already in types.ts');
}
