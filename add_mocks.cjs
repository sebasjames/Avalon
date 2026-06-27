const fs = require('fs');
let content = fs.readFileSync('constants.ts', 'utf8');

const newContacts = [];
const sources = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'GOOGLE_ADS', 'MANUAL', 'STREET', 'REFERRAL', 'WEBSITE'];
const statuses = ['LEAD', 'PROSPECTO', 'VINCULADO', 'INACTIVO'];
const tiers = ['CustomerTier.STRATEGIC', 'CustomerTier.REGULAR', 'CustomerTier.NEW'];
const tagsList = ['VIP', 'En Riesgo', 'Alta Prioridad', 'Nuevo', 'Referido', 'Socio'];

for (let i = 10; i < 30; i++) {
    const id = `C-0${i}`;
    const name = `Cliente Mock ${i}`;
    const company = `Empresa Falsa ${i} SAS`;
    const email = `contacto${i}@empresa${i}.com`;
    const phone = `+57 300 000 ${i.toString().padStart(4, '0')}`;
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    
    let tags = [];
    if (Math.random() > 0.5) {
        tags.push(tagsList[Math.floor(Math.random() * tagsList.length)]);
    }
    
    let isClient = status === 'VINCULADO';
    
    const contactStr = `  {
    id: '${id}',
    name: '${name}',
    company: '${company}',
    email: '${email}',
    phone: '${phone}',
    tier: ${tier},
    status: '${status}',
    source: '${source}',
    lastContactDate: new Date(Date.now() - ${Math.floor(Math.random() * 30)} * 86400000).toISOString(),
    documentType: 'NIT',
    documentNumber: '901${i.toString().padStart(6, '0')}-1',
    tags: ${JSON.stringify(tags)},
    ownerId: 'U-001',
    cityCode: 'BOGOTA',
    accountBalance: 0
  }`;
    newContacts.push(contactStr);
}

const appendStr = ',\n' + newContacts.join(',\n') + '\n';
const endIdx = content.indexOf('];', content.indexOf('export const MOCK_CRM_CONTACTS'));

const newContent = content.slice(0, endIdx) + appendStr + content.slice(endIdx);
fs.writeFileSync('constants.ts', newContent);
console.log('Appended 20 contacts');
