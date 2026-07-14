import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertTriangle, FileSpreadsheet, ArrowRight, Plus, Trash2, ArrowLeft, Anchor, Receipt, Calculator, Box } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEnterprise } from '../context/EnterpriseContext';
import { Product } from '../types';

interface ParsedRow {
    sku: string;
    qty: number;
    cost: number;
    product?: Product;
    isValid: boolean;
    error?: string;
    landedCostShare?: number;
    realCost?: number;
}

interface LandedCost {
    id: string;
    concept: string;
    provider: string;
    amount: number;
}

export const ImportInvoicesPanel: React.FC = () => {
    const { inventory, updateInventoryStock, updateInventoryProduct, addTransaction } = useEnterprise();
    
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    // Step 1 State
    const [isDragging, setIsDragging] = useState(false);
    const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
    const [fileName, setFileName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Step 2 State
    const [landedCosts, setLandedCosts] = useState<LandedCost[]>([]);

    // Step 3 State
    const [processing, setProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        let file: File | undefined;
        
        if ('dataTransfer' in e) {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                file = e.dataTransfer.files[0];
            }
        } else if (e.target && e.target.files && e.target.files.length > 0) {
            file = e.target.files[0];
        }

        if (!file) return;
        setFileName(file.name);
        setSuccessMsg('');

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            if (!bstr) return;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const rows: ParsedRow[] = [];

            data.forEach((row: any) => {
                let sku = '';
                let qty = 0;
                let cost = 0;

                Object.keys(row).forEach(key => {
                    const k = key.toLowerCase().trim();
                    if (k === 'sku' || k === 'codigo' || k === 'referencia') sku = String(row[key]).trim();
                    if (k === 'cantidad' || k === 'qty') qty = Number(row[key]) || 0;
                    if (k === 'costo' || k === 'precio' || k === 'valor unitario') cost = Number(row[key]) || 0;
                });

                if (!sku) return; // Ignore empty rows

                const product = inventory.find(p => p.sku === sku || p.originalSku === sku);
                
                rows.push({
                    sku,
                    qty,
                    cost,
                    product,
                    isValid: !!product && qty > 0,
                    error: !product ? 'SKU no encontrado' : qty <= 0 ? 'Cantidad inválida' : ''
                });
            });

            setParsedRows(rows);
            setStep(1);
        };
        reader.readAsBinaryString(file);
    };

    // Calculations for Step 3
    const totalFOB = useMemo(() => {
        return parsedRows.filter(r => r.isValid).reduce((acc, row) => acc + (row.cost * row.qty), 0);
    }, [parsedRows]);

    const totalLandedCosts = useMemo(() => {
        return landedCosts.reduce((acc, cost) => acc + cost.amount, 0);
    }, [landedCosts]);

    const rowsWithRealCost = useMemo(() => {
        return parsedRows.map(row => {
            if (!row.isValid || totalFOB === 0) return row;
            const lineTotal = row.cost * row.qty;
            const sharePercent = lineTotal / totalFOB;
            const shareAmount = totalLandedCosts * sharePercent;
            const realCostUnit = row.cost + (shareAmount / row.qty);
            return {
                ...row,
                landedCostShare: shareAmount,
                realCost: realCostUnit
            };
        });
    }, [parsedRows, totalFOB, totalLandedCosts]);


    const handleConfirm = () => {
        setProcessing(true);

        const validRows = rowsWithRealCost.filter(r => r.isValid);
        const invoiceId = `IMP-${invoiceNumber}`;
        const dateStr = new Date().toISOString().split('T')[0];
        
        validRows.forEach(row => {
            if (!row.product) return;
            
            // 1. Update stock
            updateInventoryStock(row.product.id, row.qty);
            
            // 2. Update cost
            if (row.realCost && row.realCost > 0) {
                updateInventoryProduct(row.product.id, { unitCost: row.realCost });
            }

            // 3. Create Accounting Transaction for goods
            const total = row.cost * row.qty;
            
            addTransaction({
                id: `${invoiceId}-${row.product.sku}`,
                date: dateStr,
                type: 'COMPRA',
                client: 'Proveedor Extranjero',
                document: invoiceNumber,
                productName: row.product.name,
                sku: row.product.sku,
                qty: row.qty,
                total: total,
                iva: 0,
                paymentMethod: 'TRANSFERENCIA',
                posLocation: 'Bodega Central'
            });
        });

        // 4. Create Transactions for landed costs
        landedCosts.forEach(lc => {
            addTransaction({
                id: `${invoiceId}-${lc.concept.replace(/\s+/g, '').substring(0,6)}`,
                date: dateStr,
                type: 'COMPRA',
                client: lc.provider || 'Proveedor Local',
                document: invoiceNumber,
                productName: `Gasto: ${lc.concept} (Fra. ${invoiceNumber})`,
                sku: 'GASTO-IMP',
                qty: 1,
                total: lc.amount,
                iva: 0,
                paymentMethod: 'TRANSFERENCIA',
                posLocation: 'Bodega Central'
            });
        });

        setTimeout(() => {
            setProcessing(false);
            setSuccessMsg(`¡Expediente procesado! Se ingresaron ${validRows.length} productos y se causaron ${landedCosts.length} cuentas locales.`);
            setParsedRows([]);
            setFileName('');
            setInvoiceNumber('');
            setLandedCosts([]);
            setStep(1);
        }, 1500);
    };

    const validCount = parsedRows.filter(r => r.isValid).length;
    const invalidCount = parsedRows.filter(r => !r.isValid).length;

    return (
        <div className="space-y-6">
            <header className="flex justify-end items-end">
                {parsedRows.length > 0 && !successMsg && (
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                        <div className={`w-8 h-[2px] ${step > 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-indigo-600 text-white' : step > 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                        <div className={`w-8 h-[2px] ${step > 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                    </div>
                )}
            </header>

            {!parsedRows.length && !successMsg && (
                <div 
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileUpload}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Arrastra tu factura Excel aquí</h3>
                    <p className="text-sm text-slate-500 mb-6">Soporta archivos .xlsx o .csv con columnas "SKU", "CANTIDAD" y "COSTO".</p>
                    <button className="bg-white border border-slate-200 text-slate-700 font-bold px-6 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors pointer-events-none">
                        Explorar Archivos
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileUpload} 
                    />
                </div>
            )}

            {successMsg && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-800 mb-2">{successMsg}</h3>
                    <button 
                        onClick={() => setSuccessMsg('')}
                        className="mt-6 bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                        Ingresar otra Importación
                    </button>
                </motion.div>
            )}

            {parsedRows.length > 0 && !successMsg && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{fileName}</h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    <span className="text-emerald-600 font-bold">{validCount} válidos</span> • 
                                    <span className="text-red-500 font-bold ml-1">{invalidCount} errores</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input 
                                type="text"
                                placeholder="N° de Factura (Obligatorio)"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                            {step === 1 && (
                                <button 
                                    onClick={() => {
                                        if(!invoiceNumber) { alert('Ingresa el número de factura para continuar.'); return; }
                                        setStep(2);
                                    }}
                                    disabled={!invoiceNumber || validCount === 0}
                                    className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Siguiente: Gastos <ArrowRight size={18} />
                                </button>
                            )}
                            <button 
                                onClick={() => { setParsedRows([]); setFileName(''); setStep(1); }}
                                className="text-slate-400 hover:text-slate-600 p-2"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* STEP 1: MERCANCIA */}
                    {step === 1 && (
                        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr className="text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                                        <th className="p-4">Estado</th>
                                        <th className="p-4">SKU Leído</th>
                                        <th className="p-4">Producto en Catálogo</th>
                                        <th className="p-4 text-right">Cant.</th>
                                        <th className="p-4 text-right">Costo FOB Unit.</th>
                                        <th className="p-4 text-right">Total Fila</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {parsedRows.map((row, i) => (
                                        <tr key={i} className={`hover:bg-slate-50 ${!row.isValid ? 'bg-red-50/50' : ''}`}>
                                            <td className="p-4">
                                                {row.isValid ? (
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <div className="flex items-center gap-1 text-red-500" title={row.error}>
                                                        <AlertTriangle className="w-5 h-5" />
                                                        <span className="text-xs font-bold">{row.error}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-xs font-bold text-slate-600">{row.sku}</td>
                                            <td className="p-4">
                                                {row.product ? (
                                                    <span className="text-sm font-bold text-slate-800">{row.product.name}</span>
                                                ) : (
                                                    <span className="text-sm italic text-slate-400">Desconocido</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-900">+{row.qty}</td>
                                            <td className="p-4 text-right font-medium text-slate-600">
                                                {row.cost > 0 ? `$${row.cost.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-900">
                                                {row.cost > 0 ? `$${(row.cost * row.qty).toLocaleString()}` : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {validCount > 0 && (
                                        <tr className="bg-slate-100 font-bold text-slate-900">
                                            <td colSpan={5} className="p-4 text-right">TOTAL FACTURA FOB:</td>
                                            <td className="p-4 text-right">${totalFOB.toLocaleString()}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* STEP 2: NACIONALIZACION (Landed Costs) */}
                    {step === 2 && (
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Receipt className="text-slate-400 w-6 h-6" />
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Gastos de Nacionalización</h3>
                                    <p className="text-sm text-slate-500">Añade los costos de flete, aduanas o bodegaje. El sistema los prorrateará.</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                {landedCosts.map((lc, idx) => (
                                    <div key={lc.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Concepto</label>
                                            <input 
                                                type="text" 
                                                value={lc.concept}
                                                onChange={(e) => {
                                                    const updated = [...landedCosts];
                                                    updated[idx].concept = e.target.value;
                                                    setLandedCosts(updated);
                                                }}
                                                placeholder="Ej. Flete Marítimo"
                                                className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none font-medium py-1"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Proveedor / Tercero</label>
                                            <input 
                                                type="text" 
                                                value={lc.provider}
                                                onChange={(e) => {
                                                    const updated = [...landedCosts];
                                                    updated[idx].provider = e.target.value;
                                                    setLandedCosts(updated);
                                                }}
                                                placeholder="Ej. Naviera XYZ"
                                                className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none font-medium py-1"
                                            />
                                        </div>
                                        <div className="w-48">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Monto ($ COP)</label>
                                            <input 
                                                type="number" 
                                                value={lc.amount || ''}
                                                onChange={(e) => {
                                                    const updated = [...landedCosts];
                                                    updated[idx].amount = parseFloat(e.target.value) || 0;
                                                    setLandedCosts(updated);
                                                }}
                                                className="w-full bg-transparent border-b border-slate-300 focus:border-indigo-500 outline-none font-bold py-1"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => setLandedCosts(landedCosts.filter(l => l.id !== lc.id))}
                                            className="text-slate-400 hover:text-red-500 p-2 mt-4 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}

                                <button 
                                    onClick={() => setLandedCosts([...landedCosts, { id: Date.now().toString(), concept: '', provider: '', amount: 0 }])}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Añadir Gasto Local
                                </button>
                            </div>

                            <div className="bg-indigo-50 rounded-xl p-6 flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-bold text-indigo-800 uppercase tracking-wider">Total Gastos a Prorratear</span>
                                    <p className="text-3xl font-black text-indigo-900">${totalLandedCosts.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeft size={18} /> Volver
                                    </button>
                                    <button 
                                        onClick={() => setStep(3)}
                                        className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    >
                                        <Calculator size={18} /> Calcular Prorrateo <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONCILIACIÓN FINAL */}
                    {step === 3 && (
                        <div>
                            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">Resumen de Prorrateo (Landed Cost)</h3>
                                    <p className="text-indigo-200 text-sm">Los costos adicionales fueron distribuidos usando el Valor FOB.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Total Expediente</p>
                                    <p className="text-2xl font-black">${(totalFOB + totalLandedCosts).toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                        <tr className="text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                                            <th className="p-4">Producto</th>
                                            <th className="p-4 text-right">Cant.</th>
                                            <th className="p-4 text-right text-slate-400">Costo FOB</th>
                                            <th className="p-4 text-right text-orange-500">+ Prorrateo</th>
                                            <th className="p-4 text-right text-indigo-700">Costo Real Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rowsWithRealCost.filter(r => r.isValid).map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="p-4">
                                                    <span className="font-bold text-slate-800">{row.product?.name}</span>
                                                    <div className="text-xs text-slate-400">{row.sku}</div>
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-900">{row.qty}</td>
                                                <td className="p-4 text-right text-slate-400">${row.cost.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                                                <td className="p-4 text-right text-orange-500 font-medium">
                                                    +${(row.landedCostShare! / row.qty).toLocaleString(undefined, {maximumFractionDigits:2})} c/u
                                                </td>
                                                <td className="p-4 text-right font-black text-indigo-700">
                                                    ${row.realCost?.toLocaleString(undefined, {maximumFractionDigits:2})}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <button 
                                    onClick={() => setStep(2)}
                                    className="text-slate-500 font-bold px-6 py-2 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft size={18} /> Ajustar Gastos
                                </button>
                                <button 
                                    onClick={handleConfirm}
                                    disabled={processing}
                                    className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                >
                                    {processing ? 'Ejecutando...' : <><Box size={20} /> Confirmar Expediente Definitivo</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
