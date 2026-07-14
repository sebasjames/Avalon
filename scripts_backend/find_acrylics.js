import fs from 'fs';

const constantsPath = 'C:\\\\James\\\\Scarpian AI\\\\Projects\\\\Procoquinal\\\\Avalon_V1\\\\Avalon_V1_CODE\\\\constants.ts';
let content = fs.readFileSync(constantsPath, 'utf-8');

const lines = content.split('\n');
const products = [];
let currentProduct = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!currentProduct && line.trim() === '{' && lines[i+1] && lines[i+1].includes('id:')) {
        currentProduct = {};
        continue;
    }

    if (currentProduct) {
        if (line.includes('sku:')) {
            const match = line.match(/sku:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.sku = match[1];
        }
        if (line.includes('name:')) {
            const match = line.match(/name:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.name = match[1];
        }
        if (line.includes('brand:')) {
            const match = line.match(/brand:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.brand = match[1];
        }
        if (line.includes('baseUnit:')) {
            const match = line.match(/baseUnit:\s*['"]([^'"]+)['"]/);
            if (match) currentProduct.baseUnit = match[1];
        }

        if (line.trim() === '},' || line.trim() === '}') {
            if (currentProduct.sku && currentProduct.brand === 'ILVA') {
                products.push(currentProduct);
            }
            currentProduct = null;
        }
    }
}

// Find acrylics
const acrylics = products.filter(p => {
    const nameUpper = p.name.toUpperCase();
    const skuUpper = p.sku.toUpperCase();
    // Rule: Name contains ACRILICO/ACRÍLICO or SKU contains TX (as per user example "ejemplo, tx")
    return nameUpper.includes('ACRILICO') || nameUpper.includes('ACRÍLICO') || skuUpper.includes('-TX');
});

const report = [];

acrylics.forEach(p => {
    const nameUpper = p.name.toUpperCase();
    let type = 'Desconocido';
    let proposedUnit = 'Desconocido';
    
    if (nameUpper.includes('TRANSP') || nameUpper.includes('INCOLORO') || nameUpper.includes('CLEAR')) {
        type = 'Transparente';
        proposedUnit = 'Litros';
    } else if (nameUpper.includes('BLANC') || nameUpper.includes('PIG') || nameUpper.includes('COLOR')) {
        type = 'Blanco/Pigmentado';
        proposedUnit = 'Kilos';
    } else {
        // Fallbacks
        if (p.sku.includes('-TX')) {
            type = 'Transparente (Asumido por TX)';
            proposedUnit = 'Litros';
        } else {
            type = 'Sin clasificar';
            proposedUnit = '?';
        }
    }

    report.push({
        SKU: p.sku,
        Nombre: p.name,
        UnidadActual: p.baseUnit || 'UN',
        TipoDetectado: type,
        UnidadPropuesta: proposedUnit
    });
});

console.log(JSON.stringify(report, null, 2));
