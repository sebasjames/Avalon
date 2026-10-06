const fs = require('fs');
const path = require('path');

const tabPath = path.join(__dirname, '..', 'components', 'ControlMermasTab.tsx');
let content = fs.readFileSync(tabPath, 'utf8');

// Update datalist map in ControlMermasTab.tsx
content = content.replace(
    /\{\(mezclaOrders \|\| \[\]\)\.filter\(o => o\.status === 'PENDING' \|\| o\.status === 'PREPARING' \|\| o\.status === 'READY'\)\.map\(o => \([\s\S]*?\)\)\}/,
    `{(mezclaOrders || []).map(o => (
                                                <option key={o.id} value={\`\${o.id} — \${o.recipeName || o.baseName || o.clientName || 'Mezcla'}\`}>
                                                    {o.customerName || o.clientName ? \`Cliente: \${o.customerName || o.clientName}\` : o.status}
                                                </option>
                                            ))}`
);

fs.writeFileSync(tabPath, content, 'utf8');
console.log('ControlMermasTab.tsx datalist updated');
