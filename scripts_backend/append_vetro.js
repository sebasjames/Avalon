import xlsx from 'xlsx';
import * as fs from 'fs';

const filePath = 'C:\\Users\\sebas\\Desktop\\Vetro_Faltantes.xlsx';
const constantsPath = 'C:\\James\\Scarpian AI\\Projects\\Procoquinal\\Avalon_V1\\Avalon_V1_CODE\\constants.ts';

const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

let idCounter = 9000; // Start high to avoid collisions

const newProducts = rawRows.map(row => {
    const desc = String(row['NOMBRE O DESCRIPCION'] || '').trim().toUpperCase();
    let unit = 'UN';
    if (desc.includes('1/4 GALON') || desc.includes('1/4 GALÓN')) unit = '1/4 Galón';
    else if (desc.includes('1/2 GALON') || desc.includes('1/2 GALÓN')) unit = '1/2 Galón';
    else if (desc.includes('CUÑETE')) unit = 'Cuñete';
    else if (desc.includes('GALON') || desc.includes('GALÓN') || desc.includes('GLS')) unit = 'Galón';

    const codigo = String(row['CODIGO PRODUCTO'] || '').trim();
    const brand = String(row['MARCAS (GRUPO 2)'] || 'VETRO').trim();

    return {
        id: (idCounter++).toString(),
        sku: codigo,
        originalSku: codigo,
        name: desc,
        category: "Category.FINISHED_GOOD",
        family: String(row['MARCA (PERSONALIZADO 1)'] || 'Pinturas Vetro').trim(),
        brand: brand,
        baseUnit: unit,
        density: 1,
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
});

let constantsContent = fs.readFileSync(constantsPath, 'utf-8');

const productsStr = newProducts.map(prod => {
    const jsonStr = JSON.stringify(prod, null, 2);
    return jsonStr.replace(/"Category\.([^"]+)"/g, 'Category.$1')
                  .replace(/"InventoryStatus\.([^"]+)"/g, 'InventoryStatus.$1')
                  .replace(/"ABCClass\.([^"]+)"/g, 'ABCClass.$1')
                  .replace(/"XYZClass\.([^"]+)"/g, 'XYZClass.$1');
}).join(',\n    ');

// Find where DEFAULT_INVENTORY array starts
const targetString = 'export const MOCK_INVENTORY: Product[] = [';
if (constantsContent.includes(targetString)) {
    constantsContent = constantsContent.replace(targetString, targetString + '\n    ' + productsStr + ',');
    fs.writeFileSync(constantsPath, constantsContent);
    console.log(`Successfully added ${newProducts.length} missing VETRO products to constants.ts!`);
} else {
    console.error("Could not find MOCK_INVENTORY array in constants.ts");
}
