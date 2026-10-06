const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../components/InventarioMezclas.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add usedQuantity and manualReason states
if (!code.includes('const [usedQuantity, setUsedQuantity]')) {
    code = code.replace(
        "const [manualUnitsToOpen, setManualUnitsToOpen] = useState<number>(1);",
        `const [manualUnitsToOpen, setManualUnitsToOpen] = useState<number>(1);
    const [usedQuantity, setUsedQuantity] = useState<string>('0');
    const [manualReason, setManualReason] = useState<string>('');`
    );
}

// 2. Add nonHardwareInventory computation
const nonHardwareDef = `
    // Inventory strictly excluding Hardware (Ferretería, lijas, brochas, herramientas)
    const nonHardwareInventory = useMemo(() => {
        return inventory.filter(p => {
            const hasStock = (p.totalStock || 0) > 0;
            const categoryStr = (p.category || '').toLowerCase();
            const familyStr = (p.family || '').toLowerCase();
            const nameStr = (p.name || '').toLowerCase();

            const isHardware = 
                p.category === Category.HARDWARE ||
                categoryStr.includes('ferret') ||
                categoryStr.includes('insumo') ||
                familyStr.includes('ferret') ||
                familyStr.includes('lija') ||
                familyStr.includes('brocha') ||
                familyStr.includes('herramient') ||
                familyStr.includes('abrasiv') ||
                familyStr.includes('cinta') ||
                familyStr.includes('seguridad') ||
                nameStr.includes('brocha') ||
                nameStr.includes('rodillo') ||
                nameStr.includes('lija') ||
                nameStr.includes('disco abrasivo');

            return hasStock && !isHardware;
        });
    }, [inventory]);
`;

if (!code.includes('nonHardwareInventory')) {
    code = code.replace(
        "// ONLY items that have been destapados",
        nonHardwareDef + "\n    // ONLY items that have been destapados"
    );
}

// 3. Update handleConfirmOpenManual
const oldHandleConfirm = `    const handleConfirmOpenManual = () => {
        if (!selectedManualProduct) return;
        openUnitToLab(selectedManualProduct.sku, manualUnitsToOpen);
        setOpenManualModalOpen(false);
        setSelectedManualProduct(null);
        setManualUnitsToOpen(1);
    };`;

const newHandleConfirm = `    const handleConfirmOpenManual = () => {
        if (!selectedManualProduct) return;
        const usedNum = Math.max(0, parseFloat(usedQuantity) || 0);
        openUnitToLab(selectedManualProduct.sku, manualUnitsToOpen, usedNum, manualReason);
        setOpenManualModalOpen(false);
        setSelectedManualProduct(null);
        setManualUnitsToOpen(1);
        setUsedQuantity('0');
        setManualReason('');
    };`;

if (code.includes(oldHandleConfirm)) {
    code = code.replace(oldHandleConfirm, newHandleConfirm);
}

// 4. Update the Modal content to use nonHardwareInventory and the new usedQuantity controls
const oldModalBlockStart = '{/* Modal: Destapar Envase Manualmente';
const oldModalEnd = '{/* Modal de Historial y Trazabilidad Detallado */}';

const newModalContent = `{/* Modal: Destapar Envase Manualmente (busca en productos químicos, excluyendo ferretería) */}
            <AnimatePresence>
                {openManualModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                                            <PlusCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Destapar Envase & Registrar Consumo</h3>
                                            <p className="text-xs text-slate-500">Mueve envases sellados a mezclas y define lo consumido</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setOpenManualModalOpen(false);
                                            setSelectedManualProduct(null);
                                            setUsedQuantity('0');
                                            setManualReason('');
                                        }}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Product search (No ferreteria) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                                1. Selecciona el Producto Químico / Materia Prima
                                            </label>
                                            <span className="text-[11px] text-slate-400 font-semibold">
                                                (Ferretería excluida)
                                            </span>
                                        </div>
                                        <div className="relative mb-2">
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por código SKU, pigmento, resina, base..."
                                                value={manualSkuSearch}
                                                onChange={(e) => setManualSkuSearch(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50 custom-scrollbar">
                                            {nonHardwareInventory
                                                .filter(p => 
                                                    p.name.toLowerCase().includes(manualSkuSearch.toLowerCase()) || 
                                                    p.sku.toLowerCase().includes(manualSkuSearch.toLowerCase()) ||
                                                    (p.family || '').toLowerCase().includes(manualSkuSearch.toLowerCase())
                                                )
                                                .slice(0, 15)
                                                .map(p => {
                                                    const isSelected = selectedManualProduct?.sku === p.sku;
                                                    const cap = p.netWeightKg || p.netVolumeLiters || (p.baseUnit === 'GR' ? 1000 : 20);
                                                    return (
                                                        <div
                                                            key={p.sku}
                                                            onClick={() => {
                                                                setSelectedManualProduct(p);
                                                                setUsedQuantity('0');
                                                            }}
                                                            className={\`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between \${
                                                                isSelected 
                                                                    ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-400' 
                                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                                            }\`}
                                                        >
                                                            <div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono text-[11px] font-bold text-purple-700">{p.sku}</span>
                                                                    <span className="text-[10px] text-slate-500 font-medium">({p.totalStock} cerrados de {cap}{p.baseUnit || 'GR'})</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                                            </div>
                                                            {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Configuration if product is selected */}
                                    {selectedManualProduct && (() => {
                                        const cap = selectedManualProduct.netWeightKg || selectedManualProduct.netVolumeLiters || (selectedManualProduct.baseUnit === 'GR' ? 1000 : 20);
                                        const unit = selectedManualProduct.baseUnit || 'GR';
                                        const totalOpened = manualUnitsToOpen * cap;
                                        const usedVal = parseFloat(usedQuantity) || 0;
                                        const remainingVal = Math.max(0, totalOpened - usedVal);

                                        return (
                                            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-4">
                                                {/* Product capacity & stock */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Capacidad por envase:</span>
                                                        <p className="text-sm font-extrabold text-purple-950">
                                                            {cap.toLocaleString('es-CO')} {unit}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Stock cerrado en bodega:</span>
                                                        <p className="text-sm font-extrabold text-purple-950">
                                                            {selectedManualProduct.totalStock} unidades
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Units to open */}
                                                <div className="flex items-center justify-between pt-2.5 border-t border-purple-200/60">
                                                    <label className="text-xs font-bold text-purple-900">
                                                        Unidades cerradas a destapar:
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setManualUnitsToOpen(Math.max(1, manualUnitsToOpen - 1))}
                                                            className="w-7 h-7 rounded-lg bg-white border border-purple-200 font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-mono font-bold text-xs text-purple-950 px-1">
                                                            {manualUnitsToOpen} envase(s) = {totalOpened.toLocaleString('es-CO')} {unit}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setManualUnitsToOpen(Math.min(selectedManualProduct.totalStock, manualUnitsToOpen + 1))}
                                                            className="w-7 h-7 rounded-lg bg-white border border-purple-200 font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Input 1: ¿Cuánto usaste inmediatamente? */}
                                                <div className="pt-2.5 border-t border-purple-200/60 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                            ¿Cuánto usaste o dosificaste de este envase?
                                                        </label>
                                                        <span className="text-[11px] text-purple-700 font-bold">({unit})</span>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            max={totalOpened}
                                                            value={usedQuantity}
                                                            onChange={(e) => setUsedQuantity(e.target.value)}
                                                            placeholder="0"
                                                            className="w-full pl-4 pr-16 py-2.5 bg-white border-2 border-purple-200 focus:border-purple-600 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                                            {unit}
                                                        </span>
                                                    </div>

                                                    {/* Quick shortcut buttons */}
                                                    <div className="flex items-center gap-1.5 pt-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity('0')}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            0 (Solo destapar)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity((totalOpened * 0.25).toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            25%
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity((totalOpened * 0.5).toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            50%
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity((totalOpened * 0.8).toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            80%
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity(totalOpened.toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            100% (Todo)
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Visual Card: Saldo que queda en el tarro para Bodega Mezclas */}
                                                <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Saldo que quedará en el tarro</span>
                                                        <div className="text-lg font-black text-purple-900 mt-0.5 flex items-baseline gap-1">
                                                            {remainingVal.toLocaleString('es-CO')}
                                                            <span className="text-xs font-bold text-slate-500">{unit}</span>
                                                        </div>
                                                        <p className="text-[10px] text-purple-700 font-medium">
                                                            {remainingVal > 0 
                                                                ? 'Estará disponible en Bodega Mezclas para evitar abrir otro envase.' 
                                                                : 'El envase fue consumido por completo (no quedará saldo remanente).'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                                            {Math.round((remainingVal / totalOpened) * 100)}% remanente
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Input 2: Motivo / Lote de mezcla (Opcional) */}
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
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setOpenManualModalOpen(false);
                                            setSelectedManualProduct(null);
                                            setUsedQuantity('0');
                                            setManualReason('');
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmOpenManual}
                                        disabled={!selectedManualProduct || selectedManualProduct.totalStock < manualUnitsToOpen}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirmar y Destapar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            `;

const startIdx = code.indexOf(oldModalBlockStart);
const endIdx = code.indexOf(oldModalEnd);

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + newModalContent + code.substring(endIdx);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('InventarioMezclas.tsx destapar modal successfully updated!');
} else {
    console.log('Could not find modal block boundaries', { startIdx, endIdx });
}
