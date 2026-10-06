const fs = require('fs');
let c = fs.readFileSync('components/MezclasTablero.tsx', 'utf8');

const target = "if (orderToUpdate && newStatus === MezclaStatus.READY && orderToUpdate.status !== MezclaStatus.READY) {";

const replacement = `if (orderToUpdate && newStatus === MezclaStatus.READY && orderToUpdate.status !== MezclaStatus.READY) {
            const today = new Date().toISOString().split('T')[0];
            let itemsDeductedCount = 0;

            if (orderToUpdate.formula) {
                Object.entries(orderToUpdate.formula).forEach(([code, qtyStr], idx) => {
                    if (code !== 'Error') {
                        const qtyGrams = parseFloat(qtyStr) || 1;
                        consumeLabStock(\`PIGMENT-\${code}\`, qtyGrams);
                        addKardexTransaction({
                            id: \`TX-MZ-\${Date.now()}-PIG-\${idx}\`,
                            date: today,
                            skuId: \`PIGMENT-\${code}\`,
                            lotNumber: \`LOT-PIG-\${code}\`,
                            type: 'Salida',
                            quantity: qtyGrams,
                            balanceAfter: 0,
                            documentRef: orderToUpdate.id,
                            user: 'Bodega Mezclas (KDS)'
                        });
                        itemsDeductedCount++;
                    }
                });
                if (itemsDeductedCount > 0) {
                    setLastDeductionMessage(\`✅ Mezcla Finalizada. Se descontaron \${itemsDeductedCount} tintas exactas de la Bodega Mezclas.\`);
                    setTimeout(() => setLastDeductionMessage(null), 6000);
                }
            }`;

c = c.replace(target, replacement);
fs.writeFileSync('components/MezclasTablero.tsx', c);
console.log("Done");
