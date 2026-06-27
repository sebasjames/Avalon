const fs = require('fs');
let content = fs.readFileSync('constants.ts', 'utf8');

const lines = content.split('\n');
let inInventory = false;
let currentItem = {};
let currentItemStart = -1;
let updatedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('export const MOCK_INVENTORY: Product[] = [')) {
    inInventory = true;
    continue;
  }
  
  if (inInventory) {
    if (line.includes('export const MOCK_PURCHASE_SUGGESTIONS')) {
      inInventory = false;
      break;
    }
    
    if (line.trim() === '{') {
      currentItemStart = i;
      currentItem = {};
    } else if (line.trim() === '},' || line.trim() === '}') {
      let newCategory = 'Category.RAW_MATERIAL'; 
      
      const skuMatch = currentItem.sku || '';
      const brandMatch = currentItem.brand || '';
      const nameMatch = currentItem.name || '';
      const familyMatch = currentItem.family || '';
      
      const isImportada = skuMatch.includes('IL-') || skuMatch.includes('VETRO-') || 
                          brandMatch.includes('ILVA') || brandMatch.includes('Sayerlack') || brandMatch.includes('Vetro');
                          
      const isFerreteria = familyMatch.includes('Ferreter') || familyMatch.includes('Insumos') || 
                           familyMatch.includes('Herramientas') || familyMatch.includes('Abrasivos') ||
                           nameMatch.toLowerCase().includes('lija') || nameMatch.toLowerCase().includes('cinta') || 
                           nameMatch.toLowerCase().includes('brocha') || nameMatch.toLowerCase().includes('rodillo') || 
                           nameMatch.toLowerCase().includes('estopa') || skuMatch.includes('SERV') || skuMatch.includes('ALB');
                           
      if (isImportada) newCategory = 'Category.RAW_MATERIAL_IMPORTADA';
      else if (isFerreteria) newCategory = 'Category.HARDWARE';
      
      if (currentItem.categoryLineIndex !== undefined && newCategory !== 'Category.RAW_MATERIAL') {
        // Solo reemplazar si todavía no está actualizado y era RAW_MATERIAL
        if (lines[currentItem.categoryLineIndex].includes('Category.RAW_MATERIAL') && !lines[currentItem.categoryLineIndex].includes('IMPORTADA')) {
            lines[currentItem.categoryLineIndex] = lines[currentItem.categoryLineIndex].replace(/Category\.RAW_MATERIAL/, newCategory);
            updatedCount++;
        }
      }
      
    } else if (currentItemStart !== -1) {
      if (line.includes('"sku":') || line.includes("'sku':")) currentItem.sku = line;
      if (line.includes('"brand":') || line.includes("'brand':")) currentItem.brand = line;
      if (line.includes('"name":') || line.includes("'name':")) currentItem.name = line;
      if (line.includes('"family":') || line.includes("'family':")) currentItem.family = line;
      if (line.includes('"category":') || line.includes("'category':")) currentItem.categoryLineIndex = i;
    }
  }
}

fs.writeFileSync('constants.ts', lines.join('\n'));
console.log('Successfully updated ' + updatedCount + ' categories in constants.ts');
