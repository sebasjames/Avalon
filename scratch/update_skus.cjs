const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, '../data/inventory.ts');
let content = fs.readFileSync(contentPath, 'utf8');

let categories = {
  'Producto Terminado': 'PT',
  'FINISHED_GOOD': 'PT',
  'Materia Prima Nacional': 'MPN',
  'RAW_MATERIAL': 'MPN',
  'Materia Prima Importada': 'MPI',
  'RAW_MATERIAL_IMPORTADA': 'MPI',
  'En Proceso (WIP)': 'WIP',
  'Insumos y Ferretería': 'INF',
  'HARDWARE': 'INF',
  'Servicio': 'SRV',
  'SERVICE': 'SRV'
};

let counters = {};

// Split by the "id" field to get individual objects safely
const blocks = content.split(/(\{\s*"id":\s*"[^"]+",)/);

for (let i = 1; i < blocks.length; i += 2) {
  let idLine = blocks[i];
  let restOfObject = blocks[i+1];
  
  // Find category in restOfObject
  let catMatch = restOfObject.match(/"category":\s*"([^"]+)"/) || restOfObject.match(/"category":\s*Category\.([A-Z_]+)\s*as\s*any/) || restOfObject.match(/"category":\s*Category\.([A-Z_]+)/);
  
  if (catMatch) {
    let catVal = catMatch[1];
    let prefix = categories[catVal] || 'MISC';
    
    counters[prefix] = (counters[prefix] || 0) + 1;
    let numStr = counters[prefix].toString().padStart(3, '0');
    let newSku = `PQ-${prefix}-${numStr}`;
    
    // Replace sku in restOfObject
    restOfObject = restOfObject.replace(/"sku":\s*"[^"]+"/, `"sku": "${newSku}"`);
    blocks[i+1] = restOfObject;
  }
}

fs.writeFileSync(contentPath, blocks.join(''), 'utf8');
console.log('SKUs updated successfully!');
