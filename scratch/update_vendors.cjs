const fs = require('fs');
const path = require('path');

const inventoryPath = path.join(__dirname, '../data/inventory.ts');
const constantsPath = path.join(__dirname, '../constants.ts');

const inventoryFile = fs.readFileSync(inventoryPath, 'utf8');

const brandRegex = /["']?brand["']?:\s*(["'])(.*?)\1/g;
const uniqueBrands = new Set();
let match;
while ((match = brandRegex.exec(inventoryFile)) !== null) {
    let b = match[2].trim();
    if (b) {
        let nBrand = b.toUpperCase();
        if (nBrand.includes('PROCOQUINAL')) nBrand = 'PROCOQUINAL';
        else if (nBrand.includes('PREMIUM')) nBrand = 'PINTURAS PREMIUM';
        else if (nBrand.includes('SAYERLACK')) nBrand = 'SAYERLACK';
        else if (nBrand.includes('BARPIMO')) nBrand = 'BARPIMO';
        else if (nBrand.includes('CARPOLY')) nBrand = 'CARPOLY';
        else if (nBrand.includes('VETRO')) nBrand = 'VETRO';
        else if (nBrand.includes('ILVA')) nBrand = 'ILVA';
        else nBrand = b;
        
        uniqueBrands.add(nBrand);
    }
}

const vendors = Array.from(uniqueBrands).map((brand, i) => {
    return {
        id: `V-${i+1}`,
        name: brand,
        leadTimeDays: 60,
        reliabilityScore: 90,
        qualityScore: 95,
        priceIndex: 'Medium'
    };
});

let constantsFile = fs.readFileSync(constantsPath, 'utf8');
const vendorsString = `export const MOCK_VENDORS: Vendor[] = ${JSON.stringify(vendors, null, 4).replace(/"([^"]+)":/g, '$1:')};`;
constantsFile = constantsFile.replace(/export const MOCK_VENDORS: Vendor\[\] = \[.*?\];/s, vendorsString);

fs.writeFileSync(constantsPath, constantsFile);
console.log('Updated constants.ts with vendors:', Array.from(uniqueBrands));
