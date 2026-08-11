const XLSX = require('xlsx');

try {
    const workbook = XLSX.readFile('C:\\Users\\sebas\\Desktop\\OMAR\\Maestro de Clientes.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`--- Analysis of Maestro de Clientes.xlsx ---`);
    console.log(`Total Rows: ${data.length}`);
    if (data.length > 0) {
        console.log(`\nHeaders:`);
        console.log(data[0]);
        
        console.log(`\nSample Data (First 3 rows):`);
        console.log(JSON.stringify(data.slice(1, 4), null, 2));
    } else {
        console.log("File is empty.");
    }
} catch (error) {
    console.error("Error reading file:", error);
}
