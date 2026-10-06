const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../components/InventarioMezclas.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add Lock, ShieldCheck to lucide-react imports
if (!code.includes('Lock,')) {
    code = code.replace(
        "History,",
        "History,\n    Lock,\n    ShieldCheck,"
    );
}

// 2. Add auth modal state
const stateTarget = "const [historyModalOpen, setHistoryModalOpen] = useState(false);";
const stateReplacement = `const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // ID Validation Modal State
    const [authModalData, setAuthModalData] = useState<{
        product: Product;
        units: number;
        usedQty: number;
        reason: string;
    } | null>(null);
    const [operatorIdInput, setOperatorIdInput] = useState('OP-104');
    const [operatorPinInput, setOperatorPinInput] = useState('');
    const [authError, setAuthError] = useState('');`;

if (!code.includes('authModalData')) {
    code = code.replace(stateTarget, stateReplacement);
}

// 3. Add function to execute verified action
const helperFunc = `
    // Execute action after ID/PIN validation
    const handleConfirmAuthorizedOpen = () => {
        if (!authModalData) return;
        if (!operatorIdInput.trim()) {
            setAuthError('Debes ingresar tu ID de operador o cédula.');
            return;
        }
        if (operatorPinInput.length < 4) {
            setAuthError('El PIN de seguridad debe tener mínimo 4 dígitos.');
            return;
        }

        const operatorLabel = \`\${operatorIdInput.trim()} (Autorizado)\`;
        const finalReason = authModalData.reason 
            ? \`\${authModalData.reason} | Autorizado por: \${operatorLabel}\`
            : \`Destape autorizado por \${operatorLabel}\`;

        openUnitToLab(
            authModalData.product.sku,
            authModalData.units,
            authModalData.usedQty,
            finalReason
        );

        setAuthModalData(null);
        setOperatorPinInput('');
        setAuthError('');
    };
`;

if (!code.includes('handleConfirmAuthorizedOpen')) {
    code = code.replace(
        "const handleConfirmOpenManual = () => {",
        helperFunc + "\n    const handleConfirmOpenManual = () => {"
    );
}

// 4. Update the card button '+1 Tarro' to trigger auth modal
const oldCardButton = `<button
                                        onClick={() => {
                                            if (product.totalStock <= 0) {
                                                alert('No hay unidades selladas disponibles en Bodega Central para destapar.');
                                                return;
                                            }
                                            openUnitToLab(product.sku, 1);
                                        }}
                                        disabled={product.totalStock <= 0}
                                        className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                        title="Destapar 1 unidad adicional desde Bodega Central"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        +1 Tarro
                                    </button>`;

const newCardButton = `<button
                                        onClick={() => {
                                            if (product.totalStock <= 0) {
                                                alert('No hay unidades selladas disponibles en Bodega Central para destapar.');
                                                return;
                                            }
                                            setAuthModalData({
                                                product,
                                                units: 1,
                                                usedQty: 0,
                                                reason: 'Apertura de +1 tarro adicional desde mesón'
                                            });
                                            setOperatorPinInput('');
                                            setAuthError('');
                                        }}
                                        disabled={product.totalStock <= 0}
                                        className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                                        title="Validar ID para destapar 1 unidad adicional"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        +1 Tarro
                                    </button>`;

if (code.includes(oldCardButton)) {
    code = code.replace(oldCardButton, newCardButton);
}

// 5. Update handleConfirmOpenManual to also trigger auth modal if destapando
const oldManualOpenCall = `openUnitToLab(selectedManualProduct.sku, manualUnitsToOpen, usedNum, finalReason);
        setOpenManualModalOpen(false);
        setSelectedManualProduct(null);
        setManualUnitsToOpen(1);
        setUsedQuantity('0');
        setSelectedOrderId('');
        setCustomReason('');
        setManualReason('');`;

const newManualOpenCall = `// Open ID validation modal to confirm
        setAuthModalData({
            product: selectedManualProduct,
            units: manualUnitsToOpen,
            usedQty: usedNum,
            reason: finalReason
        });
        setOperatorPinInput('');
        setAuthError('');

        setOpenManualModalOpen(false);
        setSelectedManualProduct(null);
        setManualUnitsToOpen(1);
        setUsedQuantity('0');
        setSelectedOrderId('');
        setCustomReason('');
        setManualReason('');`;

if (code.includes(oldManualOpenCall)) {
    code = code.replace(oldManualOpenCall, newManualOpenCall);
}

// 6. Mount the ID Validation Popup at the bottom of the component
const authModalJSX = `
            {/* Modal de Validación de ID / PIN de Operador */}
            <AnimatePresence>
                {authModalData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 max-w-md w-full text-white space-y-5"
                        >
                            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
                                <Lock className="w-7 h-7 text-purple-400" />
                            </div>

                            <div className="text-center space-y-1.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Control de Inventario & Auditoría
                                </span>
                                <h3 className="text-xl font-bold text-white">Validación de Identidad</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Para autorizar el destape de <strong className="text-purple-400 font-mono">{authModalData.product.sku}</strong> ({authModalData.units} envase(s)), ingresa tu ID de Operador y PIN de seguridad.
                                </p>
                            </div>

                            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        ID de Operador / Cédula
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={operatorIdInput}
                                            onChange={(e) => setOperatorIdInput(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="OP-104: Miguel Ángel (Tintometría)">OP-104: Miguel Ángel (Tintometría)</option>
                                            <option value="OP-102: Carlos Gómez (Operador KDS)">OP-102: Carlos Gómez (Operador KDS)</option>
                                            <option value="SUP-01: Supervisor de Planta">SUP-01: Supervisor de Planta</option>
                                            <option value="ALM-03: Almacenista Principal">ALM-03: Almacenista Principal</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        PIN de Seguridad (4 dígitos)
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••"
                                        value={operatorPinInput}
                                        onChange={(e) => setOperatorPinInput(e.target.value)}
                                        maxLength={6}
                                        autoFocus
                                        className="w-full text-center text-2xl tracking-[0.5em] font-mono py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                    />
                                    {authError && (
                                        <p className="text-rose-400 text-xs font-medium text-center mt-2 flex items-center justify-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            {authError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setAuthModalData(null);
                                        setOperatorPinInput('');
                                        setAuthError('');
                                    }}
                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmAuthorizedOpen}
                                    disabled={operatorPinInput.length < 4}
                                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Autorizar Apertura
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
`;

if (!code.includes('authModalData &&')) {
    code = code.replace(
        "<HistorialMezclasModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />",
        authModalJSX + "\n\n            <HistorialMezclasModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />"
    );
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('InventarioMezclas.tsx successfully updated with ID & PIN Validation Popup!');
