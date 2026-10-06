const fs = require('fs');
let c = fs.readFileSync('components/MezclasTablero.tsx', 'utf8');

// 1. Add states
c = c.replace(
    "const [authError, setAuthError] = useState('');",
    "const [authError, setAuthError] = useState('');\n    const [preStartModalOrder, setPreStartModalOrder] = useState<MezclaOrder | null>(null);\n    const [preStartChecks, setPreStartChecks] = useState<Record<string, boolean>>({});"
);

// 2. Replace the first onClick
c = c.replace(
    "onClick={() => updateStatus(order.id, MezclaStatus.IN_PROGRESS)}",
    "onClick={() => { setPreStartModalOrder(order); setPreStartChecks({}); }}"
);

// 3. Replace the second onClick
c = c.replace(
    "onClick={() => updateStatus(order.id, MezclaStatus.IN_PROGRESS)}",
    "onClick={() => { setPreStartModalOrder(order); setPreStartChecks({}); }}"
);

// 4. Inject Modal rendering logic before the Auth Modal
const modalCode = `
            {preStartModalOrder && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Asistente de Bodega: Lote {preStartModalOrder.id}</h2>
                                <p className="text-sm text-slate-500">Revisa las siguientes recomendaciones de inventario antes de iniciar.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(preStartModalOrder.formula || {}).filter(([k]) => k !== 'Error').map(([code, qtyStr], idx) => {
                                const requested = parseFloat(qtyStr as string) || 1;
                                const skuId = \`PIGMENT-\${code}\`;
                                // We need to check inventory
                                // Wait, the component state 'inventory' is not directly exported from useEnterprise in this file, we need to get it.
                                // Actually, useEnterprise returns inventory! Let's just use it.
                                const p = inventory.find(i => i.sku === skuId || i.id === skuId || i.originalSku === skuId);
                                const labStock = p?.labStock || 0;
                                
                                let message = '';
                                let type = '';
                                
                                if (labStock >= requested) {
                                    message = \`✅ Tienes \${labStock.toLocaleString('es-CO')}g destapados. Usa esos y no abras una unidad nueva.\`;
                                    type = 'green';
                                } else if (labStock > 0 && labStock < requested) {
                                    message = \`⚠️ Tienes \${labStock.toLocaleString('es-CO')}g destapados. Úsalos y destapa una unidad nueva para los \${(requested - labStock).toLocaleString('es-CO')}g faltantes.\`;
                                    type = 'amber';
                                } else {
                                    message = \`⚠️ No hay destapados. Deberás destapar una unidad nueva desde el almacén principal.\`;
                                    type = 'slate';
                                }

                                const isChecked = !!preStartChecks[code];

                                return (
                                    <div key={code} className={\`p-4 rounded-xl border flex items-start gap-4 transition-colors cursor-pointer \${isChecked ? 'bg-slate-50 border-indigo-200' : 'bg-white border-slate-200'}\`} onClick={() => setPreStartChecks(prev => ({...prev, [code]: !prev[code]}))}>
                                        <div className={\`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-1 transition-colors \${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-100 border border-slate-300'}\`}>
                                            {isChecked && <Check className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-bold text-slate-800">{code}</span>
                                                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{requested}g</span>
                                            </div>
                                            <p className={\`text-sm \${type === 'green' ? 'text-emerald-700' : type === 'amber' ? 'text-amber-700' : 'text-slate-600'}\`}>
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => setPreStartModalOrder(null)}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    updateStatus(preStartModalOrder.id, MezclaStatus.IN_PROGRESS);
                                    setPreStartModalOrder(null);
                                }}
                                disabled={Object.keys(preStartModalOrder.formula || {}).filter(k => k !== 'Error').length > 0 && Object.keys(preStartChecks).filter(k => preStartChecks[k]).length !== Object.keys(preStartModalOrder.formula || {}).filter(k => k !== 'Error').length}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-indigo-200"
                            >
                                Entendido, Iniciar Mezcla
                            </button>
                        </div>
                    </div>
                </div>
            )}
`;

c = c.replace(
    "{authModalOrder && (",
    modalCode + "\n            {authModalOrder && ("
);

// We need 'inventory' from useEnterprise. Let's add it to the destructuring.
c = c.replace(
    "const { addKardexTransaction, updateInventoryStock, consumeLabStock",
    "const { inventory, addKardexTransaction, updateInventoryStock, consumeLabStock"
);

fs.writeFileSync('components/MezclasTablero.tsx', c);
console.log("Done");
