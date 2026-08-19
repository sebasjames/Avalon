const fs = require('fs');
const path = require('path');

// Read data
const clientsPath = path.join(__dirname, '../data/clients.json');
const clientsData = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));

// Extract simple mock inventory for the script since we can't easily parse TS inventory.ts in JS
const mockInventory = [
    { sku: 'FG-PU-002', name: 'Barniz Poliuretano Mate', price: 85000, taxRate: 19, family: 'BARNICES', category: 'FINISHED_GOOD' },
    { sku: 'CLORO-01', name: 'Cloro Industrial', price: 15000, taxRate: 19, family: 'QUIMICOS', category: 'FINISHED_GOOD' },
    { sku: 'JABON-05', name: 'Jabón Multiusos', price: 25000, taxRate: 19, family: 'ASEO', category: 'FINISHED_GOOD' },
    { sku: 'IL-TAS 124', name: 'ILVA TAS 124', price: 120000, taxRate: 19, family: 'ILVA', category: 'FINISHED_GOOD' },
    { sku: 'RM-PU-01', name: 'Resina PU', price: 45000, taxRate: 19, family: 'MATERIA_PRIMA', category: 'RAW_MATERIAL' }
];

const transactions = [];

// Base manual transactions
transactions.push({
    id: 'RC-CM01',
    date: '2026-06-01',
    type: 'PAGO_RECIBIDO',
    client: 'Banco de Occidente',
    document: 'Reembolso Inicial de Caja Menor',
    productName: 'Reposición de fondos Caja Menor',
    sku: '-',
    qty: 1,
    total: 1500000,
    iva: 0,
    paymentMethod: 'Transferencia',
    posLocation: 'Sede Principal Centro'
});

const mockExtractoVentas = [
    { date: '2025-05-02', total: 278470, doc: '42097' },
    { date: '2025-05-02', total: 520434, doc: '42098' },
    { date: '2025-05-02', total: 109143, doc: '42099' }
];

mockExtractoVentas.forEach(v => {
    transactions.push({
        id: 'FV-' + v.doc,
        date: v.date,
        type: 'VENTA',
        client: 'Cliente Mostrador / Web (Mock)',
        document: 'FV-' + v.doc,
        productName: 'Productos Varios',
        sku: '-',
        family: 'DIVERSOS',
        category: 'FINISHED_GOOD',
        qty: 1,
        total: v.total,
        iva: Math.round(v.total * 0.19),
        paymentMethod: 'Datáfonos',
        posLocation: 'Sede Principal Centro',
        validationStatus: 'PENDIENTE_VALIDACION'
    });
});

let ventaCounter = 1;
let compraCounter = 1;
let ajusteCounter = 1;

const methods = ['Efectivo', 'Tarjeta', 'Transferencia', 'Nequi', 'Datáfonos (111505)'];

// Generate exactly 1 year of data (365 days)
// We will generate about 1200 transactions
const now = new Date();
for (let i = 0; i < 1500; i++) {
    const rand = Math.random();
    let type = 'VENTA';
    if (rand > 0.8 && rand <= 0.95) type = 'COMPRA';
    else if (rand > 0.95) type = 'AJUSTE_MERMA';

    const contact = clientsData[Math.floor(Math.random() * clientsData.length)];
    const product = mockInventory[Math.floor(Math.random() * mockInventory.length)];

    // Random date within the last 365 days
    const pastDate = new Date(now.getTime() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const dateStr = pastDate.toISOString().split('T')[0];
    const qty = Math.floor(Math.random() * 15) + 1;

    let id = '';
    let total = 0;
    let iva = 0;
    let paymentMethod = '';

    if (type === 'VENTA') {
        id = `FV-${ventaCounter.toString().padStart(4, '0')}`;
        ventaCounter++;
        total = product.price * qty;
        const rate = product.taxRate || 19;
        iva = Math.round(total * (rate / 100));
        paymentMethod = methods[Math.floor(Math.random() * methods.length)];
    } else if (type === 'COMPRA') {
        id = `FC-${compraCounter.toString().padStart(4, '0')}`;
        compraCounter++;
        total = product.price * qty * 0.6; // Purchase price is 60% of sales price
        iva = Math.round(total * 0.19);
        paymentMethod = 'Transferencia';
    } else {
        id = `AJ-${ajusteCounter.toString().padStart(4, '0')}`;
        ajusteCounter++;
        total = product.price * qty;
        iva = 0;
        paymentMethod = 'N/A';
    }

    transactions.push({
        id,
        date: dateStr,
        type,
        client: contact ? (contact.name || contact.company) : 'Cliente Genérico',
        document: id,
        productName: product.name,
        sku: product.sku,
        family: product.family,
        category: product.category,
        qty,
        total,
        iva,
        paymentMethod,
        posLocation: 'Sede Principal Centro'
    });
}

// Sort chronologically
transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

const content = `import { AccountingTransaction } from '../types';\n\nexport const ACCOUNTING_TRANSACTIONS: AccountingTransaction[] = ${JSON.stringify(transactions, null, 2)};\n`;

fs.writeFileSync(path.join(__dirname, '../data/accounting_ledger.ts'), content);
console.log('Accounting ledger generated successfully with ' + transactions.length + ' transactions.');
