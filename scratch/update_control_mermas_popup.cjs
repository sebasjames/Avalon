const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'components', 'ControlMermasTab.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Enterprise hook destructuring to include mezclaOrders
content = content.replace(
    'const { kardexTransactions, inventory, updateLabStock } = useEnterprise();',
    'const { kardexTransactions, inventory, updateLabStock, mezclaOrders } = useEnterprise();'
);

// 2. Add actualCanRemaining state and synchronization logic
const oldStateBlock = `    // Manual incident form state
    const [incidentSku, setIncidentSku] = useState('');
    const [incidentGrams, setIncidentGrams] = useState('');
    const [incidentReason, setIncidentReason] = useState('Residuo seco en paredes del envase');
    const [incidentOrder, setIncidentOrder] = useState('');`;

const newStateBlock = `    // Manual incident form state
    const [incidentSku, setIncidentSku] = useState('');
    const [incidentGrams, setIncidentGrams] = useState('');
    const [actualCanRemaining, setActualCanRemaining] = useState('');
    const [incidentReason, setIncidentReason] = useState('Residuo seco adherido a paredes del tarro');
    const [incidentOrder, setIncidentOrder] = useState('');

    // Selected product calculation helpers
    const selectedIncidentProduct = useMemo(() => {
        if (!incidentSku) return null;
        return inventory.find(p => p.sku === incidentSku || p.id === incidentSku) || null;
    }, [incidentSku, inventory]);

    const incidentProductStock = selectedIncidentProduct?.labStock || 0;
    const incidentProductUnit = selectedIncidentProduct?.baseUnit || 'GR';
    const incidentUnitCapacity = selectedIncidentProduct?.netWeightKg || selectedIncidentProduct?.netVolumeLiters || (incidentProductUnit === 'GR' ? 1000 : 20);
    const incidentUnitCost = selectedIncidentProduct?.unitCost || 35000;
    const incidentCostPerUnit = incidentUnitCapacity > 0 ? (incidentUnitCost / incidentUnitCapacity) : 35;

    const calculatedMerma = parseFloat(incidentGrams) || 0;
    const calculatedCostLoss = Math.round(calculatedMerma * incidentCostPerUnit);

    // Sync handlers
    const handleProductChange = (sku: string) => {
        setIncidentSku(sku);
        setIncidentGrams('');
        setActualCanRemaining('');
    };

    const handleMermaChange = (val: string) => {
        setIncidentGrams(val);
        if (!selectedIncidentProduct || val === '' || isNaN(parseFloat(val))) {
            setActualCanRemaining('');
            return;
        }
        const mermaVal = parseFloat(val);
        const remaining = Math.max(0, incidentProductStock - mermaVal);
        setActualCanRemaining(Number(remaining.toFixed(2)).toString());
    };

    const handleCanRemainingChange = (val: string) => {
        setActualCanRemaining(val);
        if (!selectedIncidentProduct || val === '' || isNaN(parseFloat(val))) {
            setIncidentGrams('');
            return;
        }
        const remainingVal = parseFloat(val);
        const merma = Math.max(0, incidentProductStock - remainingVal);
        setIncidentGrams(merma > 0 ? Number(merma.toFixed(2)).toString() : '0');
    };

    const handleSetEmptyCan = () => {
        if (!selectedIncidentProduct) return;
        setActualCanRemaining('0');
        setIncidentGrams(incidentProductStock.toString());
        setIncidentReason('Residuo seco adherido a paredes del tarro');
    };`;

content = content.replace(oldStateBlock, newStateBlock);

// 3. Update handleSaveIncident
const oldSaveFn = `    // Save manual incident
    const handleSaveIncident = () => {
        if (!incidentSku || !incidentGrams) return;
        const grams = parseFloat(incidentGrams);
        if (isNaN(grams) || grams <= 0) return;

        const product = inventory.find(p => p.sku === incidentSku || p.id === incidentSku);
        if (product) {
            const currentLab = product.labStock || 0;
            const newLab = Math.max(0, currentLab - grams);
            updateLabStock(product.sku, newLab);
        }

        setManualIncidentModalOpen(false);
        setIncidentSku('');
        setIncidentGrams('');
        setIncidentOrder('');
    };`;

const newSaveFn = `    // Save manual incident with detailed audit metadata
    const handleSaveIncident = () => {
        if (!incidentSku || !selectedIncidentProduct) return;
        const merma = parseFloat(incidentGrams);
        if (isNaN(merma) || merma <= 0) return;

        const newLab = actualCanRemaining !== '' && !isNaN(parseFloat(actualCanRemaining))
            ? Math.max(0, parseFloat(actualCanRemaining))
            : Math.max(0, incidentProductStock - merma);

        updateLabStock(selectedIncidentProduct.sku, newLab, {
            documentRef: incidentOrder || 'MERMA-MANUAL',
            formulaName: \`Merma: \${incidentReason}\`,
            notes: \`Merma registrada por báscula. Saldo anterior: \${incidentProductStock}\${incidentProductUnit}, en envase: \${newLab}\${incidentProductUnit}, merma: \${merma}\${incidentProductUnit} (\${formatCOP(calculatedCostLoss)}). Causa: \${incidentReason}.\${incidentOrder ? \` [Ref: \${incidentOrder}]\` : ''}\`,
            user: 'Operador de Mesón'
        });

        setManualIncidentModalOpen(false);
        setIncidentSku('');
        setIncidentGrams('');
        setActualCanRemaining('');
        setIncidentOrder('');
        setIncidentReason('Residuo seco adherido a paredes del tarro');
    };`;

content = content.replace(oldSaveFn, newSaveFn);

// 4. Update the Modal JSX
const oldModalBody = `                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Producto Afectado (Destapado)
                                        </label>
                                        <select
                                            value={incidentSku}
                                            onChange={(e) => setIncidentSku(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                        >
                                            <option value="">Selecciona un producto destapado...</option>
                                            {inventory.filter(p => (p.labStock || 0) > 0).map(p => (
                                                 <option key={p.sku} value={p.sku}>
                                                     {p.sku} — {p.name} ({p.labStock} {p.baseUnit || 'GR'} en mesón)
                                                 </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Cantidad de Merma / Desperdicio (Gramos o Litros)
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="Ej: 15.0"
                                            value={incidentGrams}
                                            onChange={(e) => setIncidentGrams(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border-2 border-rose-200 focus:border-rose-600 rounded-xl text-base font-bold text-slate-900 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Causa / Motivo del Incidente
                                        </label>
                                        <select
                                            value={incidentReason}
                                            onChange={(e) => setIncidentReason(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                                        >
                                            <option value="Residuo seco adherido a paredes">Residuo seco adherido a paredes del tarro</option>
                                            <option value="Evaporación de solventes">Evaporación de solventes en mesón</option>
                                            <option value="Derrame accidental en dosificación">Derrame accidental en dosificación</option>
                                            <option value="Filtro o residuo de purga">Filtro o residuo de purga de manguera</option>
                                            <option value="Diferencia de tara de báscula">Diferencia de tara de báscula</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Lote / Orden Relacionada (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Lote #MZ-8821"
                                            value={incidentOrder}
                                            onChange={(e) => setIncidentOrder(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setManualIncidentModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveIncident}
                                        disabled={!incidentSku || !incidentGrams || parseFloat(incidentGrams) <= 0}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-rose-600/20"
                                    >
                                        Guardar Merma
                                    </button>
                                </div>`;

const newModalBody = `                                <div className="space-y-3.5">
                                    {/* 1. Producto Destapado */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Producto Afectado (Destapado en Mesón)
                                        </label>
                                        <select
                                            value={incidentSku}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                        >
                                            <option value="">Selecciona un producto destapado...</option>
                                            {inventory.filter(p => (p.labStock || 0) > 0).map(p => (
                                                <option key={p.sku} value={p.sku}>
                                                    {p.sku} — {p.name} ({p.labStock} {p.baseUnit || 'GR'} en mesón)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* System Info Banner if product selected */}
                                    {selectedIncidentProduct && (
                                        <div className="bg-slate-100/90 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
                                                    <Beaker className="w-4 h-4 text-rose-600" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo en Sistema</span>
                                                    <p className="font-extrabold text-slate-900 text-sm">
                                                        {incidentProductStock} <span className="text-xs font-semibold text-slate-500">{incidentProductUnit}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Costo Aprox</span>
                                                <p className="font-bold text-slate-700 text-xs">
                                                    ~{formatCOP(incidentCostPerUnit)} / {incidentProductUnit}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dual Fields: 1. Cantidad Merma, 2. Cantidad en Envase debajo */}
                                    <div className="space-y-3 bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                                        {/* Cantidad de Merma / Desperdicio */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                                                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                                                    Cantidad de Merma / Desperdicio ({incidentProductUnit})
                                                </label>
                                                {calculatedMerma > 0 && (
                                                    <span className="text-[11px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                                                        Pérdida: {formatCOP(calculatedCostLoss)}
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                placeholder="Ej: 20.0"
                                                value={incidentGrams}
                                                onChange={(e) => handleMermaChange(e.target.value)}
                                                disabled={!selectedIncidentProduct}
                                                className="w-full px-4 py-2.5 bg-white border-2 border-rose-200 focus:border-rose-600 rounded-xl text-base font-black text-rose-900 focus:outline-none transition-all disabled:bg-slate-100 disabled:opacity-60"
                                            />
                                        </div>

                                        {/* Cantidad en Envase (debajo) */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                                                    Cantidad en Envase (Peso actual en báscula — {incidentProductUnit})
                                                </label>
                                                {selectedIncidentProduct && incidentProductStock > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSetEmptyCan}
                                                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-white hover:bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition-colors shadow-2xs"
                                                    >
                                                        Marcar vacío (0 {incidentProductUnit})
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                placeholder={selectedIncidentProduct ? \`Ej: \${incidentProductStock}\` : 'Selecciona un producto primero'}
                                                value={actualCanRemaining}
                                                onChange={(e) => handleCanRemainingChange(e.target.value)}
                                                disabled={!selectedIncidentProduct}
                                                className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all disabled:bg-slate-100 disabled:opacity-60"
                                            />
                                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                <span className="font-semibold text-blue-600">💡 Tip:</span> 
                                                Si pesas el envase y anotas lo que queda, el sistema calcula automáticamente cuánto se perdió.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Real-time Calculation Summary Card */}
                                    {selectedIncidentProduct && calculatedMerma > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-200/80 text-xs flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                                                <div>
                                                    <span className="font-bold text-rose-900">Merma detectada: {calculatedMerma} {incidentProductUnit}</span>
                                                    <p className="text-[11px] text-slate-600">
                                                        Quedarán en mesón: <strong className="text-slate-800">{actualCanRemaining || Math.max(0, incidentProductStock - calculatedMerma)} {incidentProductUnit}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-rose-500">Costo Desperdicio</span>
                                                <p className="font-black text-rose-700 text-sm">{formatCOP(calculatedCostLoss)}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Causa / Motivo */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Causa / Motivo del Incidente
                                        </label>
                                        <select
                                            value={incidentReason}
                                            onChange={(e) => setIncidentReason(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                                        >
                                            <option value="Residuo seco adherido a paredes del tarro">Residuo seco adherido a paredes del tarro</option>
                                            <option value="Evaporación de solventes en mesón">Evaporación de solventes en mesón</option>
                                            <option value="Derrame accidental en dosificación">Derrame accidental en dosificación</option>
                                            <option value="Filtro o residuo de purga de manguera">Filtro o residuo de purga de manguera</option>
                                            <option value="Diferencia de tara de báscula">Diferencia de tara de báscula</option>
                                            <option value="Envase contaminado o dañado">Envase contaminado o dañado</option>
                                            <option value="Muestra de ajuste de color / descarte">Muestra de ajuste de color / descarte</option>
                                        </select>
                                    </div>

                                    {/* Lote / Orden Relacionada */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Lote / Orden Relacionada (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            list="incident-orders-list"
                                            placeholder="Selecciona orden abierta o escribe lote (Ej: MZ-8821)"
                                            value={incidentOrder}
                                            onChange={(e) => setIncidentOrder(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                                        />
                                        <datalist id="incident-orders-list">
                                            {(mezclaOrders || []).filter(o => o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY').map(o => (
                                                <option key={o.id} value={\`\${o.id} — \${o.recipeName}\`}>
                                                    {o.customerName ? \`Cliente: \${o.customerName}\` : o.status}
                                                </option>
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setManualIncidentModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveIncident}
                                        disabled={!incidentSku || !incidentGrams || parseFloat(incidentGrams) <= 0}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        Guardar Merma {calculatedMerma > 0 ? \`(\${formatCOP(calculatedCostLoss)})\` : ''}
                                    </button>
                                </div>`;

const normalize = str => str.replace(/\r\n/g, '\n');

if (normalize(content).includes(normalize(oldModalBody))) {
    const parts = normalize(content).split(normalize(oldModalBody));
    content = parts.join(normalize(newModalBody));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modal JSX updated successfully');
} else {
    console.log('Old modal body not matched directly, checking normalized chunks');
}
