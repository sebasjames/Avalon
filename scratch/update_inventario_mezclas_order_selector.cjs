const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../components/InventarioMezclas.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add MezclaOrder and MezclaStatus to types import if not present
if (!code.includes('MezclaOrder')) {
    code = code.replace(
        "import { Product, Category } from '../types';",
        "import { Product, Category, MezclaOrder, MezclaStatus } from '../types';"
    );
}

// 2. Destructure mezclaOrders from useEnterprise
if (!code.includes('mezclaOrders')) {
    code = code.replace(
        "openUnitToLab \n    } = useEnterprise();",
        "openUnitToLab,\n        mezclaOrders\n    } = useEnterprise();"
    );
    if (!code.includes('mezclaOrders')) {
        code = code.replace(
            "openUnitToLab\n    } = useEnterprise();",
            "openUnitToLab,\n        mezclaOrders\n    } = useEnterprise();"
        );
    }
}

// 3. Add states for selectedOrderId and customReason
if (!code.includes('selectedOrderId')) {
    code = code.replace(
        "const [manualReason, setManualReason] = useState<string>('');",
        `const [manualReason, setManualReason] = useState<string>('');
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');`
    );
}

// 4. Add activeMezclaOrders computation
const activeOrdersDef = `
    // Active Mezcla Orders currently open in KDS
    const activeMezclaOrders = useMemo(() => {
        return (mezclaOrders || []).filter(o => 
            o.status === MezclaStatus.PENDING || 
            o.status === MezclaStatus.IN_PROGRESS
        );
    }, [mezclaOrders]);
`;

if (!code.includes('activeMezclaOrders')) {
    code = code.replace(
        "// Inventory strictly excluding Hardware",
        activeOrdersDef + "\n    // Inventory strictly excluding Hardware"
    );
}

// 5. Update handleConfirmOpenManual
const targetConfirmFunc = 'const handleConfirmOpenManual = () => {';
const targetConfirmEnd = 'return (';

const newConfirmFunc = `const handleConfirmOpenManual = () => {
        if (!selectedManualProduct) return;
        const usedNum = Math.max(0, parseFloat(usedQuantity) || 0);

        let finalReason = '';
        if (selectedOrderId === 'OTRO') {
            finalReason = customReason.trim() || 'Ajuste / Muestra interna sin orden';
        } else if (selectedOrderId) {
            const foundOrder = activeMezclaOrders.find(o => o.id === selectedOrderId);
            if (foundOrder) {
                finalReason = \`Orden #\${foundOrder.id}: \${foundOrder.colorName || 'Color Especial'} (\${foundOrder.clientName || 'Cliente'})\`;
            } else {
                finalReason = \`Orden #\${selectedOrderId}\`;
            }
        } else if (usedNum === 0) {
            finalReason = 'Apertura de envase sin consumo inmediato';
        } else {
            finalReason = customReason.trim() || manualReason.trim() || 'Consumo en mesón de mezclas';
        }

        openUnitToLab(selectedManualProduct.sku, manualUnitsToOpen, usedNum, finalReason);
        setOpenManualModalOpen(false);
        setSelectedManualProduct(null);
        setManualUnitsToOpen(1);
        setUsedQuantity('0');
        setSelectedOrderId('');
        setCustomReason('');
        setManualReason('');
    };`;

const cIdx = code.indexOf(targetConfirmFunc);
const retIdx = code.indexOf(targetConfirmEnd, cIdx);
if (cIdx !== -1 && retIdx !== -1) {
    code = code.substring(0, cIdx) + newConfirmFunc + "\n\n    " + code.substring(retIdx);
}

// 6. Update the Order / Reason section inside the modal
const oldReasonInput = `{/* Input 2: Motivo / Lote de mezcla (Opcional) */}
                                                <div className="space-y-1">
                                                    <label className="text-[11px] font-bold text-slate-700">
                                                        Lote / Orden / Motivo del Consumo (Opcional):
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Lote #MZ-8825, Orden de Despacho #34, etc."
                                                        value={manualReason}
                                                        onChange={(e) => setManualReason(e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                    />
                                                </div>`;

const newReasonSelector = `{/* Selector de Mezcla / Lote Activo (Aparece cuando hay consumo > 0) */}
                                                {usedVal > 0 && (
                                                    <div className="space-y-2 pt-2 border-t border-purple-200/60">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                                ¿A qué Orden de Mezcla o Lote se cargará este gasto?
                                                            </label>
                                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                                Requerido para costos
                                                            </span>
                                                        </div>

                                                        {activeMezclaOrders.length > 0 ? (
                                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                                                                {activeMezclaOrders.map(order => {
                                                                    const isSelected = selectedOrderId === order.id;
                                                                    const isProgress = order.status === MezclaStatus.IN_PROGRESS;
                                                                    return (
                                                                        <div
                                                                            key={order.id}
                                                                            onClick={() => {
                                                                                setSelectedOrderId(order.id);
                                                                                setCustomReason('');
                                                                            }}
                                                                            className={\`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between \${
                                                                                isSelected 
                                                                                    ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-500/20' 
                                                                                    : 'bg-white border-slate-200 hover:bg-purple-50/50'
                                                                            }\`}
                                                                        >
                                                                            <div className="min-w-0 flex-1 pr-2">
                                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                                    <span className="font-mono text-xs font-bold text-purple-700">
                                                                                        #{order.id}
                                                                                    </span>
                                                                                    <span className={\`text-[10px] font-bold px-1.5 py-0.2 rounded-full \${
                                                                                        isProgress 
                                                                                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                                                    }\`}>
                                                                                        {isProgress ? 'En Proceso' : 'Pendiente'}
                                                                                    </span>
                                                                                    <span className="text-xs font-bold text-slate-800 truncate">
                                                                                        {order.colorName || 'Mezcla'}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-[11px] text-slate-500 truncate">
                                                                                    Cliente: <strong className="text-slate-700">{order.clientName}</strong> — Pres: {order.presentation || 'Galón'}
                                                                                </p>
                                                                            </div>
                                                                            {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                                                                        </div>
                                                                    );
                                                                })}

                                                                {/* Option for custom reason */}
                                                                <div
                                                                    onClick={() => setSelectedOrderId('OTRO')}
                                                                    className={\`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between text-xs font-bold \${
                                                                        selectedOrderId === 'OTRO' 
                                                                            ? 'bg-purple-100/80 border-purple-400 text-purple-900 ring-2 ring-purple-500/20' 
                                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                    }\`}
                                                                >
                                                                    <span>+ Otro motivo / Muestra de laboratorio o ajuste sin orden</span>
                                                                    {selectedOrderId === 'OTRO' && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                                                No hay órdenes de mezcla en proceso en este momento en el KDS. Puedes ingresar el motivo del consumo manual abajo.
                                                            </div>
                                                        )}

                                                        {/* If 'OTRO' or no active orders, show text input */}
                                                        {(selectedOrderId === 'OTRO' || activeMezclaOrders.length === 0) && (
                                                            <div className="pt-1">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Escribe el motivo del gasto (Ej: Muestra técnica, prueba de viscosidad, etc.)..."
                                                                    value={customReason}
                                                                    onChange={(e) => setCustomReason(e.target.value)}
                                                                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}`;

if (code.includes(oldReasonInput)) {
    code = code.replace(oldReasonInput, newReasonSelector);
}

// 7. Update the confirm button disable condition
const oldDisabledBtn = `disabled={!selectedManualProduct || selectedManualProduct.totalStock < manualUnitsToOpen}`;
const newDisabledBtn = `disabled={
                                            !selectedManualProduct || 
                                            selectedManualProduct.totalStock < manualUnitsToOpen ||
                                            (parseFloat(usedQuantity) > 0 && !selectedOrderId && activeMezclaOrders.length > 0) ||
                                            (parseFloat(usedQuantity) > 0 && selectedOrderId === 'OTRO' && !customReason.trim()) ||
                                            (parseFloat(usedQuantity) > (manualUnitsToOpen * (selectedManualProduct.netWeightKg || selectedManualProduct.netVolumeLiters || (selectedManualProduct.baseUnit === 'GR' ? 1000 : 20))))
                                        }`;

if (code.includes(oldDisabledBtn)) {
    code = code.replace(oldDisabledBtn, newDisabledBtn);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('InventarioMezclas.tsx successfully updated with active Mezcla Order selector!');
