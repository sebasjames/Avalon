const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\sebas\\Desktop\\OMAR\\clientes_limpios.json';
const outputPath = path.join(__dirname, '..', 'data', 'crm_contacts.json');

try {
  const rawData = fs.readFileSync(inputPath, 'utf8');
  const clientesLimpios = JSON.parse(rawData);

  const mappedContacts = clientesLimpios.map((cliente, index) => {
    // Generate an ID if one doesn't exist, though it should be in _id
    const id = cliente._id || `C-${(index + 1).toString().padStart(4, '0')}`;
    
    // Parse identification
    let docType = 'NIT';
    let docNumber = '';
    if (cliente.Identificacion) {
      const idStr = cliente.Identificacion.toString().toUpperCase();
      if (idStr.includes('CC') || idStr.includes('C.C') || idStr.includes('CDULA') || idStr.includes('CEDULA')) {
        docType = 'CC';
      }
      // Extract digits and dashes
      docNumber = idStr.replace(/[^\d-]/g, '').trim();
    }

    // Default tier logic (just default to REGULAR for now)
    const tier = 'REGULAR';
    
    return {
      id: id,
      name: cliente.Nombre || 'Sin Nombre',
      company: cliente.Nombre || 'Sin Nombre',
      email: cliente.Email || '',
      phone: cliente.Teléfonos || cliente.Teléfono || '',
      address: cliente.Dirección || '',
      documentType: docType,
      documentNumber: docNumber,
      tier: tier,
      status: 'VINCULADO',
      source: 'Manual',
      lastContactDate: new Date().toISOString(),
      ownerId: 'U-001' // Carlos Perez
    };
  });

  fs.writeFileSync(outputPath, JSON.stringify(mappedContacts, null, 2), 'utf8');
  console.log(`Migrated ${mappedContacts.length} contacts successfully to ${outputPath}`);
} catch (error) {
  console.error('Error during migration:', error);
}
