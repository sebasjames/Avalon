import xlsx from 'xlsx';
import * as fs from 'fs';
const filePaths = [
    'C:\\Users\\sebas\\Downloads\\v1-Q tienen Variables.xlsx',
    'C:\\Users\\sebas\\Downloads\\Ilva-Solo 1 fila con variables.xlsx',
    'C:\\Users\\sebas\\Downloads\\Carpoly.xlsx',
    'C:\\Users\\sebas\\Downloads\\Barpimo.xlsx',
    'C:\\Users\\sebas\\Downloads\\Vetro.xlsx',
    'C:\\Users\\sebas\\Downloads\\Procoquinal.xlsx',
    'C:\\Users\\sebas\\Downloads\\Materias Primas.xlsx',
    'C:\\Users\\sebas\\Downloads\\Ferreteria.xlsx'
];
let data = [];
for (const fp of filePaths) {
    const workbook = xlsx.readFile(fp);
    const sheetName = workbook.SheetNames[0];
    if (fp.includes('Ferreteria')) {
        const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
        const mappedRows = rawRows.filter(row => row[0] && String(row[0]).trim().length > 0).map(row => ({
            'DESCRIPCIÓN': String(row[0]).trim(),
            'CODIGO': '',
            'U.Medida Original': 'UNIDAD',
            'Marca / Proveedor': String(row[2] || 'PROCOQUINAL').trim(),
            'Tipología Producto': String(row[1] || 'Ferretería').trim()
        }));
        data = data.concat(mappedRows);
    } else {
        data = data.concat(xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' }));
    }
}

// Sanitización de datos
let autoSkuCounter = 1;
data = data.filter(row => String(row['DESCRIPCIÓN'] || '').trim().length > 0).map(row => {
    let codigo = String(row['CODIGO'] || row['Codigo'] || row['codigo'] || row['CÓDIGO'] || '').trim().toUpperCase();
    let desc = String(row['DESCRIPCIÓN'] || '').trim().toUpperCase();
    let unit = String(row['U.Medida Original'] || '').trim();

    // Sanitize Codigo
    if (!codigo || codigo.length > 20 || codigo === 'PRIMER' || codigo === 'IMPRIMACIONES, ADITIVOS') {
        const brand = String(row['Marca / Proveedor'] || '').trim().toUpperCase();
        const prefix = brand ? brand.substring(0,3) : 'UNK';
        codigo = `${prefix}-AUTO-${autoSkuCounter++}`;
        row['CODIGO'] = codigo;
    }

    // Sanitize Unit
    if (!unit) {
        if (/\\b(50 CC|250 CC|500 CC|UNIDAD|UNIDADES|UND|UN)\\b/i.test(desc)) {
            unit = "UN";
        } else if (/\\b(\\d+\\s*L|\\d+\\s*LT|LATA)\\b/i.test(desc)) {
            unit = "LT";
        } else if (/\\b(GALON|GALÓN|GLS?)\\b/i.test(desc)) {
            unit = "Galón";
        } else if (/\\b(CUÑETE)\\b/i.test(desc)) {
            unit = "Cuñete";
        } else {
            unit = "TBD";
        }
        row['U.Medida Original'] = unit;
    }
    return row;
});

// Helper to remove duplicate products by code
const uniqueProductsMap = new Map();

const hasSuffix = (codigo) => {
    if (!codigo) return false;
    const upperCode = String(codigo).toUpperCase().trim();
    return upperCode.endsWith(' GL') || 
           upperCode.endsWith(' QT') || 
           upperCode.endsWith('-GL') || 
           upperCode.endsWith('-QT') || 
           upperCode.endsWith('-CU') || 
           upperCode.endsWith('-LT') || 
           upperCode.endsWith('-TB') || 
           upperCode.endsWith(' CU') || 
           upperCode.endsWith(' LT') || 
           upperCode.endsWith(' L') || 
           upperCode.endsWith(' 1/4') ||
           upperCode.match(/^(?:D-101|D-103)(GL|LT|TB|CU|QT)$/) !== null;
};

const hasSizeInDescription = (desc) => {
    if (!desc) return false;
    const upperDesc = String(desc).toUpperCase();
    return upperDesc.includes('GALON') || 
           upperDesc.includes('GL X') || 
           upperDesc.includes('GLX') || 
           upperDesc.includes(' QT') || 
           upperDesc.includes('1/4') || 
           upperDesc.includes('CUÑETE') || 
           upperDesc.includes('LATA X') || 
           upperDesc.includes('KILO') || 
           upperDesc.includes('500 CC') || 
           upperDesc.includes('250 CC');
};

const familiesWithSuffixes = new Set();
const allOriginalCodes = new Set();
const variantToRowMap = new Map(); // Para saber de qué fila sacar la data base

const codes = data.map(row => String(row['CODIGO']).trim().toUpperCase());
for (const code of codes) {
    allOriginalCodes.add(code);
    if (hasSuffix(code)) {
        let base = code;
        if (/^(?:D-101|D-103)/.test(code)) base = code.replace(/(GL|LT|TB|CU|QT)$/, '');
        else base = code.replace(/( GL| QT|-GL|-QT|-CU|-LT|-TB| CU| LT| L| 1\/4)$/, '').trim();
        familiesWithSuffixes.add(base);
    }
}

data.forEach(row => {
    const code = String(row['CODIGO']).trim().toUpperCase();
    if (hasSuffix(code)) {
        let base = code;
        if (/^(?:D-101|D-103)/.test(code)) base = code.replace(/(GL|LT|TB|CU|QT)$/, '');
        else base = code.replace(/( GL| QT|-GL|-QT|-CU|-LT|-TB| CU| LT| L| 1\/4)$/, '').trim();
        
        if (!variantToRowMap.has(base)) {
            variantToRowMap.set(base, row);
        }
    }
});

let generatedProducts = [];
let idCounter = 1000;

const BASES_TO_EXCLUDE = new Set([
    "2716", "2717", "2718", "2719", "2782", "2786", "2801", "2811", "2832", "2871", "2905", "2918", "2951",
    "IPT1062B", "A4638", "A2726", "DA", "DE", "D-101", "DIL91"
]);

function createProduct(row, suffix, variantDesc, unitOverride, customCode = null, customName = null) {
    let codigo = customCode || String(row['CODIGO']).trim().toUpperCase();
    let name = customName || String(row['DESCRIPCIÓN']).trim().toUpperCase();
    
    // Extirpar bases específicas para que solo existan sus variantes (GL, QT, etc)
    if (!suffix && BASES_TO_EXCLUDE.has(codigo)) {
        return;
    }
    
    // Check golden rule
    if (suffix) {
        // Prevent double suffix
        if (hasSuffix(codigo)) {
            console.warn("Golden Rule Triggered! Preventing double suffix on:", codigo);
            return;
        }
        codigo = `${codigo} ${suffix}`;
        name = `${name} ${variantDesc}`;
    }
    
    // De-duplicate exactly identical codes
    if (uniqueProductsMap.has(codigo)) {
        return;
    }
    uniqueProductsMap.set(codigo, true);

    let brand = String(row['Marca / Proveedor']).trim() || 'Desconocido';
    
    if (/^(?:D-101|D-103)/.test(codigo)) {
        brand = 'PROCOQUINAL';
    }
    
    if (codigo.startsWith('DIS 7771')) {
        brand = 'VETRO';
    }
    
    let sku = codigo;
    if (brand.toUpperCase() === 'ILVA' && !sku.startsWith('IL-')) {
        sku = `IL-${sku}`;
    }

    const prod = {
        id: (idCounter++).toString(),
        sku: sku,
        originalSku: codigo,
        name: name,
        category: "Category.FINISHED_GOOD",
        family: String(row['Tipología Producto']).trim() || "General",
        brand: brand,
        baseUnit: unitOverride || String(row['U.Medida Original']).trim() || "UN",
        density: parseFloat(row['Peso original']) || 1,
        unitCost: 0,
        price: 0,
        totalStock: 0,
        reservedStock: 0,
        status: "InventoryStatus.ACTIVE",
        abc: "ABCClass.A",
        xyz: "XYZClass.X",
        agingDays: 0,
        batches: []
    };
    generatedProducts.push(prod);
}

const tzBasesMap = new Map();

data.forEach(row => {
    const codigo = String(row['CODIGO']).trim().toUpperCase();
    const desc = String(row['DESCRIPCIÓN']).trim().toUpperCase();
    const galon = String(row['Galon']).trim().toLowerCase() === 'si';
    const cuarto = String(row['Cuarto Galon']).trim().toLowerCase() === 'si';

    const isSuffixCode = hasSuffix(codigo);
    const isSizeDesc = hasSizeInDescription(desc);
    
    let cleanCode = codigo;
    if (/^(?:D-101|D-103)/.test(codigo)) cleanCode = codigo.replace(/(GL|LT|TB|CU|QT)$/, '');
    else cleanCode = codigo.replace(/( GL| QT|-GL|-QT|-CU|-LT|-TB| CU| LT| L| 1\/4)$/, '').trim();

    if (cleanCode.startsWith('IL-TZ') || cleanCode.startsWith('TZ')) {
        if (!tzBasesMap.has(cleanCode)) tzBasesMap.set(cleanCode, row);
        return; // Ignore normal logic, handled at the end
    }

    const isFamilyMember = familiesWithSuffixes.has(codigo) || familiesWithSuffixes.has(cleanCode);

    const isEscenarioA = isSuffixCode || isSizeDesc || isFamilyMember;

    if (isEscenarioA) {
        // Just insert as is
        let unit = String(row['U.Medida Original']).trim();
        if (codigo.endsWith(' GL') || codigo.endsWith('-GL') || codigo.match(/GL$/)) unit = "Galón";
        if (codigo.endsWith(' QT') || codigo.endsWith('-QT') || codigo.endsWith(' 1/4') || codigo.match(/QT$/)) unit = "1/4 Galón";
        if (codigo.endsWith(' CU') || codigo.endsWith('-CU') || codigo.match(/CU$/)) unit = "Cuñete";
        if (codigo.endsWith(' TB') || codigo.endsWith('-TB') || codigo.match(/TB$/)) unit = "Tambor";
        createProduct(row, null, null, unit);
    } else if (galon || cuarto) {
        // Escenario B: base product, plus variants
        createProduct(row, null, null, String(row['U.Medida Original']).trim() || "LT"); // Base
        if (galon) {
            createProduct(row, "GL", "- GALÓN", "Galón");
        }
        if (cuarto) {
            createProduct(row, "QT", "- 1/4 GALÓN", "1/4 Galón");
        }
    } else {
        // Ignorados
        createProduct(row, null, null, String(row['U.Medida Original']).trim() || "UN");
    }
});

// Post-process: Add missing bases
let missingBasesAdded = 0;
for (const base of familiesWithSuffixes) {
    if (base.startsWith('IL-TZ') || base.startsWith('TZ')) continue; // handled below
    if (!allOriginalCodes.has(base)) {
        // We need to generate this base product!
        const referenceRow = variantToRowMap.get(base);
        if (referenceRow) {
            // Limpiar descripción de la variante para la base
            let cleanName = String(referenceRow['DESCRIPCIÓN']).trim().toUpperCase();
            cleanName = cleanName.replace(/ GALON| GL X.*| GLX.*| QT.*| 1\/4.*| CUÑETE| LATA X.*| KILO| 500 CC| 250 CC/g, '').trim();
            cleanName = cleanName.replace(/ -$/, '').trim(); // clean trailing dashes
            
            createProduct(referenceRow, null, null, 'TBD', base, cleanName);
            missingBasesAdded++;
        }
    }
}

// Post-process: Force TZ variants
console.log("TZ Bases to process:", tzBasesMap.size);
for (const [base, row] of tzBasesMap.entries()) {
    console.log("Processing TZ base:", base);
    let cleanName = String(row['DESCRIPCIÓN']).trim().toUpperCase();
    cleanName = cleanName.replace(/ GALON| GL X.*| GLX.*| QT.*| 1\/4.*| CUÑETE| LATA X.*| KILO| 500 CC| 250 CC/g, '').trim();
    cleanName = cleanName.replace(/ -$/, '').trim(); 
    
    // Generate exactly 5 variants, NO base
    createProduct(row, "TB", "- TAMBOR", "Tambor", base, cleanName);
    createProduct(row, "LT", "- LITRO", "Litro", base, cleanName);
    createProduct(row, "GL", "- GALÓN", "Galón", base, cleanName);
    createProduct(row, "QT", "- 1/4 GALÓN", "1/4 Galón", base, cleanName);
    createProduct(row, "250CC", "- 250 CC", "250 CC", base, cleanName);
}

// Format as string to insert into constants.ts
let tsOutput = '[\n';
generatedProducts.forEach((p, index) => {
    tsOutput += `  {
    id: "${p.id}",
    sku: "${p.sku}",
    originalSku: "${p.originalSku}",
    name: "${p.name.replace(/"/g, '\\"')}",
    category: ${p.category},
    family: "${p.family}",
    brand: "${p.brand}",
    baseUnit: "${p.baseUnit}",
    density: ${p.density},
    unitCost: ${p.unitCost},
    price: ${p.price},
    totalStock: ${p.totalStock},
    reservedStock: ${p.reservedStock},
    status: ${p.status},
    abc: ${p.abc},
    xyz: ${p.xyz},
    agingDays: ${p.agingDays},
    batches: []
  }${index < generatedProducts.length - 1 ? ',' : ''}\n`;
});
tsOutput += ']';

// Update constants.ts
const targetFile = 'constants.ts';
let constantsTs = fs.readFileSync(targetFile, 'utf8');

const regex = /(export const MOCK_INVENTORY:\s*Product\[\]\s*=\s*\[)[\s\S]*?(\];)/;
if (constantsTs.match(regex)) {
    constantsTs = constantsTs.replace(regex, `export const MOCK_INVENTORY: Product[] = ${tsOutput};`);
    fs.writeFileSync(targetFile, constantsTs, 'utf8');
}

fs.writeFileSync('scripts_backend/data.json', JSON.stringify(generatedProducts, null, 2), 'utf8');
console.log(`Generated ${generatedProducts.length} products successfully (${Array.from(allOriginalCodes).length - Object.keys(variantToRowMap).length} bases faltantes agregadas como TBD) y constants.ts actualizado.`);
