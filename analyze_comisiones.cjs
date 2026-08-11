const XLSX = require('xlsx');

try {
    const filePath = 'C:\\Users\\sebas\\Desktop\\OMAR\\Esquema Ejemplo de Comisiones.xlsx';
    console.log(`Reading file: ${filePath}`);
    
    // Read the file and parse formulas if available
    const workbook = XLSX.readFile(filePath, { cellFormula: true, cellDates: true });
    
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        
        // Let's get raw json with header 1
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        console.log(`Total Rows: ${rawData.length}`);
        if (rawData.length > 0) {
            console.log("First 10 rows:");
            rawData.slice(0, 10).forEach((row, i) => {
                console.log(`Row ${i + 1}: ${JSON.stringify(row)}`);
            });
            
            // Let's also look for cells that might contain formulas
            let formulaCells = [];
            for (let cell in sheet) {
                if (cell[0] === '!') continue;
                if (sheet[cell].f) {
                    formulaCells.push(`${cell}: Formula => ${sheet[cell].f} | Value => ${sheet[cell].v}`);
                }
            }
            if (formulaCells.length > 0) {
                console.log(`\nFound ${formulaCells.length} cells with formulas. Sample (first 5):`);
                formulaCells.slice(0, 5).forEach(f => console.log(f));
            } else {
                console.log("\nNo explicit formulas found (might be values only or unsupported formula type).");
            }
        }
    });

} catch (error) {
    console.error("Error reading file:", error);
}
