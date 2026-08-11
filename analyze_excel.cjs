const XLSX = require('xlsx');

try {
    const filePath = 'C:\\Users\\sebas\\Desktop\\PROCO_Working Session\\Docs\\Ejercicio factura\\Ejercicio 1 - Carpoly 10\\ejemplo costeo Carpoly 10.xlsx';
    const workbook = XLSX.readFile(filePath);
    
    console.log(`--- Analysis of ${filePath} ---`);
    console.log(`Sheets: ${workbook.SheetNames.join(', ')}`);
    
    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`\n--- Sheet: ${sheetName} ---`);
        console.log(`Total Rows: ${data.length}`);
        
        // Print the first 20 rows to understand the layout
        console.log(JSON.stringify(data.slice(0, 20), null, 2));
    });

} catch (error) {
    console.error("Error reading file:", error);
}
