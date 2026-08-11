const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\sebas\\Desktop\\OMAR\\Maestro de Clientes.xlsx';
const outputExcelPath = 'C:\\Users\\sebas\\Desktop\\OMAR\\Clientes_Limpios.xlsx';
const outputJsonPath = 'C:\\Users\\sebas\\Desktop\\OMAR\\clientes_limpios.json';

try {
    console.log("Reading file...");
    const workbook = XLSX.readFile(inputPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Read raw data with header: 1 to skip the first empty/title row
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    // The actual headers are in the second row (index 1)
    const headers = rawData[1];
    const dataRows = rawData.slice(2);
    
    // Map to array of objects
    const clients = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            if (header) {
                obj[header] = row[index];
            }
        });
        return obj;
    });

    console.log(`Initial records: ${clients.length}`);

    // Helper functions for cleaning
    const cleanId = (id) => {
        if (!id) return '';
        return String(id).replace(/[^0-9]/g, '');
    };

    const cleanName = (name) => {
        if (!name) return '';
        return String(name).trim().toUpperCase().replace(/\s+/g, ' ');
    };

    // Deduplication logic
    const mergedClientsMap = new Map();
    let idCounter = 1;

    clients.forEach(client => {
        if (!client.Nombre && !client.Identificacion) return; // Skip empty rows

        const rawId = client.Identificacion;
        const cleanIdStr = cleanId(rawId);
        const nameKey = cleanName(client.Nombre);
        
        // Determine the grouping key
        let key = cleanIdStr;
        if (!key) {
            key = `NAME_${nameKey}`; // fallback to name if no ID
        }

        if (mergedClientsMap.has(key)) {
            // Merge complementary data
            const existing = mergedClientsMap.get(key);
            
            // Prefer the one that has a real ID over empty
            if (!existing.Identificacion && client.Identificacion) {
                existing.Identificacion = client.Identificacion;
            }
            
            // Complement missing fields or take the longer one (more detailed)
            if (!existing.Dirección || (client.Dirección && String(client.Dirección).length > String(existing.Dirección).length)) {
                existing.Dirección = client.Dirección || existing.Dirección;
            }
            
            if (!existing.Teléfonos && client.Teléfonos) {
                existing.Teléfonos = client.Teléfonos;
            } else if (existing.Teléfonos && client.Teléfonos && existing.Teléfonos !== client.Teléfonos) {
                // If they have different phones, join them
                if (!String(existing.Teléfonos).includes(String(client.Teléfonos))) {
                    existing.Teléfonos = `${existing.Teléfonos} / ${client.Teléfonos}`;
                }
            }
            
            if (!existing.IdCiudad && client.IdCiudad) {
                existing.IdCiudad = client.IdCiudad;
            }
            
        } else {
            // Add new client
            mergedClientsMap.set(key, {
                _id: `CLI-${String(idCounter++).padStart(4, '0')}`,
                Nombre: client.Nombre || '',
                Identificacion: client.Identificacion || '',
                Dirección: client.Dirección || '',
                Teléfonos: client.Teléfonos || '',
                IdCiudad: client.IdCiudad || ''
            });
        }
    });

    const finalClients = Array.from(mergedClientsMap.values());
    console.log(`Final unique records after merge: ${finalClients.length}`);

    // Export to JSON
    fs.writeFileSync(outputJsonPath, JSON.stringify(finalClients, null, 2), 'utf-8');
    console.log(`Saved JSON to ${outputJsonPath}`);

    // Export to Excel
    const newSheet = XLSX.utils.json_to_sheet(finalClients);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Clientes Limpios");
    XLSX.writeFile(newWorkbook, outputExcelPath);
    console.log(`Saved Excel to ${outputExcelPath}`);

} catch (error) {
    console.error("Error processing file:", error);
}
