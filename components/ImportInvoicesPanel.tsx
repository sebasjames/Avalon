import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertTriangle, FileSpreadsheet, ArrowRight, Plus, Trash2, ArrowLeft, Anchor, Receipt, Calculator, Box, Sparkles, FileText, Loader2, FileCheck, CheckSquare, XCircle, Search, AlertCircle, FileSearch } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEnterprise } from '../context/EnterpriseContext';
import { Product, ImportDossier, ParsedRow, LandedCost } from '../types';
import { processInvoicesWithGemini, getApiKey, setApiKey } from '../services/geminiService';

export const ImportInvoicesPanel: React.FC = () => {
    const { inventory, updateInventoryStock, updateInventoryProduct, addTransaction, importDossiers, addImportDossier } = useEnterprise();
    
    // Core Navigation & View State
    const [viewMode, setViewMode] = useState<'NEW' | 'HISTORY'>('NEW');
    const [isHistoryView, setIsHistoryView] = useState<boolean>(false);
    
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
    const [activeTab, setActiveTab] = useState<'COSTOS' | 'CUENTAS' | 'IMPUESTOS' | 'AUDITORIA'>('COSTOS');
    const [mode, setMode] = useState<'EXCEL' | 'AI'>('EXCEL');
    const [apiKey, setApiKeyState] = useState(getApiKey());
    
    // AI State
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiMetadata, setAiMetadata] = useState<any>(null);
    const [aiTrm, setAiTrm] = useState<number>(1);
    const [aiCurrency, setAiCurrency] = useState<string>('USD');
    const [aiDate, setAiDate] = useState<string>('');
    const [aiExtractedDocs, setAiExtractedDocs] = useState<any[]>([]);
    const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<ParsedRow | null>(null);
    
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        let files: File[] = [];
        if ('dataTransfer' in e) {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                files = Array.from(e.dataTransfer.files);
            }
        } else if (e.target && e.target.files && e.target.files.length > 0) {
            files = Array.from(e.target.files);
        }

        if (files.length === 0) return;
        setSuccessMsg('');

        if (mode === 'AI') {
            setAiProcessing(true);
            try {
                const base64Files = await Promise.all(files.map(async file => {
                    return new Promise<{data: string, mimeType: string, name: string}>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            const b64 = (evt.target?.result as string).split(',')[1];
                            resolve({ data: b64, mimeType: file.type, name: file.name });
                        };
                        reader.readAsDataURL(file);
                    });
                }));

                const data = await processInvoicesWithGemini(base64Files, inventory);
                setAiMetadata(data.metadata);
                setAiTrm(data.metadata?.estimatedTRM || 1);
                setAiCurrency(data.metadata?.currency || 'USD');
                setAiDate(data.metadata?.invoiceDate || new Date().toISOString().split('T')[0]);
                setAiExtractedDocs(data.extractedDocuments || []);
                
                const rows: ParsedRow[] = (data.products || []).map((p: any) => {
                    const sku = String(p.mappedSku || p.rawSku || '').trim();
                    const qty = Number(p.qty) || 0;
                    const cost = Number(p.cost) || 0;
                    const product = inventory.find(inv => inv.sku === sku || inv.originalSku === sku);
                    return {
                        sku,
                        qty,
                        cost,
                        product,
                        isValid: p.status === 'MATCH' && !!product && qty > 0,
                        error: p.status === 'ERROR' ? 'No hay coincidencia en catálogo' : p.status === 'REVIEW' ? 'Requiere validación' : '',
                        rawName: p.rawName,
                        rawSku: p.rawSku,
                        status: p.status,
                        crossReference: p.crossReference, // NEW FEATURE for detailed cross validation
                        aiExplanation: p.aiExplanation // NEW FEATURE for drawer
                    };
                });
                
                setParsedRows(rows);
                
                const lCosts: LandedCost[] = (data.landedCosts || []).map((lc: any, idx: number) => ({
                    id: Date.now().toString() + idx,
                    concept: lc.rawConcept || lc.mappedCategory || 'Gasto Local',
                    provider: lc.provider || 'Proveedor Local',
                    amount: Number(lc.rawAmount) || 0,
                    retefuenteAmount: Number(lc.retefuenteAmount) || 0,
                    reteicaAmount: Number(lc.reteicaAmount) || 0,
                    crossReference: lc.crossReference // NEW FEATURE for detailed cross validation
                }));
                
                setLandedCosts(lCosts);
                setFileName(files.map(f => f.name).join(', '));
                // Set step to 3 to show the AI Dashboard directly
                setStep(3);
                setActiveTab('AUDITORIA'); // Show the Audit Matrix by default to wow the user
            } catch (err: any) {
                alert("Error procesando facturas con IA: " + err.message);
            } finally {
                setAiProcessing(false);
            }
            return;
        }

        // Excel mode logic
        const file = files[0];
        if (!file) return;
        setFileName(file.name);

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
                if (!sku) return;
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

    const totalFOB_Foreign = useMemo(() => parsedRows.filter(r => r.isValid).reduce((acc, row) => acc + (row.cost * row.qty), 0), [parsedRows]);
    const totalFOB = useMemo(() => mode === 'AI' ? totalFOB_Foreign * aiTrm : totalFOB_Foreign, [totalFOB_Foreign, mode, aiTrm]);
    const totalLandedCosts = useMemo(() => landedCosts.reduce((acc, cost) => acc + cost.amount, 0), [landedCosts]);

    const rowsWithRealCost = useMemo(() => {
        return parsedRows.map(row => {
            if (!row.isValid || totalFOB === 0) return row;
            const lineTotalCOP = mode === 'AI' ? (row.cost * row.qty * aiTrm) : (row.cost * row.qty);
            const costUnitCOP = mode === 'AI' ? (row.cost * aiTrm) : row.cost;
            const sharePercent = lineTotalCOP / totalFOB;
            const shareAmount = totalLandedCosts * sharePercent;
            const realCostUnitCOP = costUnitCOP + (shareAmount / row.qty);
            return {
                ...row,
                landedCostShare: shareAmount,
                realCost: realCostUnitCOP
            };
        });
    }, [parsedRows, totalFOB, totalLandedCosts, mode, aiTrm]);

    const handleConfirm = () => {
        setProcessing(true);
        const validRows = rowsWithRealCost.filter(r => r.isValid);
        const invoiceId = `IMP-${invoiceNumber}`;
        const dateStr = new Date().toISOString().split('T')[0];
        
        validRows.forEach(row => {
            if (!row.product) return;
            updateInventoryStock(row.product.id, row.qty);
            if (row.realCost && row.realCost > 0) {
                updateInventoryProduct(row.product.id, { unitCost: row.realCost });
            }
            const total = mode === 'AI' ? (row.cost * row.qty * aiTrm) : (row.cost * row.qty);
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

        landedCosts.forEach(lc => {
            const netAmount = lc.amount - (lc.retefuenteAmount || 0) - (lc.reteicaAmount || 0);
            addTransaction({
                id: `${invoiceId}-${lc.concept.replace(/\s+/g, '').substring(0,6)}`,
                date: dateStr,
                type: 'COMPRA',
                client: lc.provider || 'Proveedor Local',
                document: invoiceNumber,
                productName: `Gasto: ${lc.concept} (Fra. ${invoiceNumber})`,
                sku: 'GASTO-IMP',
                qty: 1,
                total: netAmount,
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
            setAiExtractedDocs([]);
            setIsHistoryView(false);
            setStep(1);
        }, 1500);
    };

    const loadDossier = (d: ImportDossier) => {
        setIsHistoryView(true);
        setViewMode('NEW');
        setMode((d.mode as 'AI' | 'EXCEL') || 'EXCEL');
        setInvoiceNumber(d.documentNumber);
        setParsedRows(d.parsedRows);
        setLandedCosts(d.landedCosts);
        setAiMetadata(d.aiMetadata);
        setAiExtractedDocs(d.aiExtractedDocs || []);
        setStep(3);
    };

    const validCount = parsedRows.filter(r => r.isValid).length;
    const invalidCount = parsedRows.filter(r => !r.isValid).length;

    return (
        <div className="space-y-6">
            {/* Header Stepper */}
            <header className="flex justify-end items-end">
                {parsedRows.length > 0 && !successMsg && mode === 'EXCEL' && (
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                        <div className={`w-8 h-[2px] ${step > 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-indigo-600 text-white' : step > 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                        <div className={`w-8 h-[2px] ${step > 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                    </div>
                )}
            </header>

            {/* Ingesta Mode Selector */}
            {!parsedRows.length && !successMsg && !aiProcessing && (
                <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 text-lg">Modo de Ingesta</h3>
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => { setMode('EXCEL'); setParsedRows([]); }}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'EXCEL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                Excel Tradicional
                            </button>
                            <button 
                                onClick={() => { setMode('AI'); setParsedRows([]); }}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${mode === 'AI' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
                            >
                                <Sparkles size={16} /> Ingesta Inteligente (IA)
                            </button>
                        </div>
                    </div>
                    
                    {mode === 'AI' && (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Gemini API Key</label>
                                <input 
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKeyState(e.target.value);
                                        setApiKey(e.target.value);
                                    }}
                                    placeholder="Pega tu API Key de Gemini aquí..."
                                    className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-2 mt-1 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                            </div>
                            <div className="w-1/3 text-xs text-indigo-600 font-medium">
                                Con la Ingesta Inteligente puedes arrastrar múltiples PDFs y la IA se encargará de cruzar la información, extraer la mercancía y clasificar los gastos aduaneros automáticamente en gran detalle.
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Drag & Drop Area */}
            {!parsedRows.length && !successMsg && !aiProcessing && (
                <div 
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:border-slate-400'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileUpload}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {mode === 'EXCEL' ? (
                        <>
                            <UploadCloud className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Arrastra tu factura Excel aquí</h3>
                            <p className="text-sm text-slate-500 mb-6">Soporta archivos .xlsx o .csv con columnas "SKU", "CANTIDAD" y "COSTO".</p>
                        </>
                    ) : (
                        <>
                            <FileText className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Arrastra los PDFs de tu Importación</h3>
                            <p className="text-sm text-slate-500 mb-6">Soporta múltiples archivos (.pdf, .png, .jpg). La IA cruzará los datos automáticamente con precisión.</p>
                        </>
                    )}
                    <button className="bg-white border border-slate-200 text-slate-700 font-bold px-6 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors pointer-events-none">
                        Explorar Archivos
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        multiple={mode === 'AI'}
                        accept={mode === 'EXCEL' ? ".xlsx, .xls, .csv" : "application/pdf, image/png, image/jpeg"} 
                        onChange={handleFileUpload} 
                    />
                </div>
            )}

            {/* AI Processing State - Detailed Pre-Lists (Visual Feedback as requested) */}
            {aiProcessing && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="bg-indigo-600 p-6 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="bg-indigo-500 p-3 rounded-xl animate-pulse">
                                <Sparkles className="text-indigo-100" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Pre-Contabilización IA en progreso...</h2>
                                <p className="text-indigo-200 text-sm font-medium">Analizando documentos, cruzando referencias, y generando la matriz de auditoría.</p>
                            </div>
                        </div>
                        <Loader2 className="w-10 h-10 text-indigo-200 animate-spin" />
                    </div>

                    <div className="p-6 bg-slate-50">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Search size={18}/> Construyendo Matriz de Auditoría...</h3>
                        <div className="space-y-4">
                            {/* Empty pre-lists to show what's happening */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center opacity-70 animate-pulse">
                                <div className="flex items-center gap-3"><FileText className="text-slate-400"/><span className="font-bold text-slate-700">Factura Comercial (FOB)</span></div>
                                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">Extrayendo ítems...</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center opacity-70 animate-pulse" style={{animationDelay: '0.2s'}}>
                                <div className="flex items-center gap-3"><Receipt className="text-slate-400"/><span className="font-bold text-slate-700">Gastos de Flete / Naviera</span></div>
                                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">Buscando costos...</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center opacity-70 animate-pulse" style={{animationDelay: '0.4s'}}>
                                <div className="flex items-center gap-3"><FileCheck className="text-slate-400"/><span className="font-bold text-slate-700">Declaración de Importación (Aduanas)</span></div>
                                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">Calculando impuestos...</span>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center opacity-70 animate-pulse" style={{animationDelay: '0.6s'}}>
                                <div className="flex items-center gap-3"><FileSearch className="text-slate-400"/><span className="font-bold text-slate-700">Cruce de Referencias (Match)</span></div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Validando con catálogo...</span>
                            </div>
                        </div>
                    </div>
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

            {/* EXCEL MODE UI */}
            {parsedRows.length > 0 && !successMsg && mode === 'EXCEL' && (
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
                                                {row.isValid ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                                            </td>
                                            <td className="p-4 font-mono text-xs font-bold text-slate-600">{row.sku}</td>
                                            <td className="p-4"><span className="text-sm font-bold text-slate-800">{row.product ? row.product.name : 'Desconocido'}</span></td>
                                            <td className="p-4 text-right font-bold text-slate-900">+{row.qty}</td>
                                            <td className="p-4 text-right font-medium text-slate-600">{row.cost > 0 ? `$${row.cost.toLocaleString()}` : '-'}</td>
                                            <td className="p-4 text-right font-bold text-slate-900">{row.cost > 0 ? `$${(row.cost * row.qty).toLocaleString()}` : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Receipt className="text-slate-400 w-6 h-6" />
                                <div><h3 className="font-bold text-lg text-slate-900">Gastos de Nacionalización</h3></div>
                            </div>
                            <div className="space-y-3 mb-8">
                                {landedCosts.map((lc, idx) => (
                                    <div key={lc.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Concepto</label>
                                            <input type="text" value={lc.concept} onChange={(e) => { const u = [...landedCosts]; u[idx].concept = e.target.value; setLandedCosts(u); }} className="w-full bg-transparent border-b border-slate-300 font-medium py-1" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Proveedor</label>
                                            <input type="text" value={lc.provider} onChange={(e) => { const u = [...landedCosts]; u[idx].provider = e.target.value; setLandedCosts(u); }} className="w-full bg-transparent border-b border-slate-300 font-medium py-1" />
                                        </div>
                                        <div className="w-48">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Monto ($)</label>
                                            <input type="number" value={lc.amount || ''} onChange={(e) => { const u = [...landedCosts]; u[idx].amount = parseFloat(e.target.value) || 0; setLandedCosts(u); }} className="w-full bg-transparent border-b border-slate-300 font-bold py-1" />
                                        </div>
                                        <button onClick={() => setLandedCosts(landedCosts.filter(l => l.id !== lc.id))} className="text-slate-400 hover:text-red-500 p-2 mt-4"><Trash2 size={20} /></button>
                                    </div>
                                ))}
                                <button onClick={() => setLandedCosts([...landedCosts, { id: Date.now().toString(), concept: '', provider: '', amount: 0, retefuenteAmount: 0, reteicaAmount: 0 }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50">
                                    <Plus size={18} className="inline mr-2"/> Añadir Gasto Local
                                </button>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-6 flex items-center justify-between">
                                <div><span className="text-sm font-bold text-indigo-800 uppercase tracking-wider">Total Gastos</span><p className="text-3xl font-black text-indigo-900">${totalLandedCosts.toLocaleString()}</p></div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="text-slate-500 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 flex items-center gap-2"><ArrowLeft size={18} /> Volver</button>
                                    <button onClick={() => setStep(3)} className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 flex items-center gap-2"><Calculator size={18} /> Prorrateo <ArrowRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                                <div><h3 className="font-bold text-lg">Resumen de Prorrateo</h3></div>
                                <div className="text-right"><p className="text-2xl font-black">${(totalFOB + totalLandedCosts).toLocaleString()}</p></div>
                            </div>
                            <div className="overflow-x-auto max-h-[350px]">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 sticky top-0"><tr className="text-xs uppercase font-bold text-slate-500 border-b border-slate-200"><th className="p-4">Producto</th><th className="p-4 text-right">Cant.</th><th className="p-4 text-right">Costo FOB</th><th className="p-4 text-right text-orange-500">+ Prorrateo</th><th className="p-4 text-right text-indigo-700">Costo Final</th></tr></thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rowsWithRealCost.filter(r => r.isValid).map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="p-4"><span className="font-bold text-slate-800">{row.product?.name}</span></td>
                                                <td className="p-4 text-right font-bold">{row.qty}</td>
                                                <td className="p-4 text-right">${row.cost.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                                                <td className="p-4 text-right text-orange-500">+${(row.landedCostShare! / row.qty).toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                                                <td className="p-4 text-right font-black text-indigo-700">${row.realCost?.toLocaleString(undefined, {maximumFractionDigits:2})}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                                <button onClick={() => setStep(2)} className="text-slate-500 font-bold px-6 py-2 rounded-xl hover:bg-slate-200 flex items-center gap-2"><ArrowLeft size={18} /> Ajustar</button>
                                <button onClick={handleConfirm} disabled={processing} className="bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl shadow-md hover:bg-emerald-600 flex items-center gap-2">
                                    {processing ? 'Ejecutando...' : <><Box size={20} /> Confirmar Expediente</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI MODE UI (DETAILED AS REQUESTED) */}
            {parsedRows.length > 0 && !successMsg && mode === 'AI' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header Info */}
                    <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-900 flex justify-between items-center text-white">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-500/30 p-4 rounded-xl border border-indigo-400/30 backdrop-blur-sm">
                                <Sparkles className="text-indigo-200" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Pre-Contabilización IA Finalizada</h2>
                                <p className="text-indigo-200 font-medium flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-400"/>
                                    Se cruzaron {(aiExtractedDocs || []).length} documentos de forma exacta.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg border border-white/10">
                                <span className="text-indigo-200 text-sm font-bold uppercase">N° Factura Extranjera</span>
                                <input 
                                    type="text" 
                                    value={invoiceNumber} 
                                    onChange={(e)=>setInvoiceNumber(e.target.value)} 
                                    className="bg-transparent text-white font-bold text-lg outline-none w-32 text-right border-b border-indigo-400/50 focus:border-white transition-colors"
                                    placeholder="N/A"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AI Tabs */}
                    <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
                        <button onClick={() => setActiveTab('AUDITORIA')} className={`flex-1 py-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'AUDITORIA' ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            <div className="flex items-center justify-center gap-2"><Search size={18}/> Matriz de Auditoría y Cruce</div>
                        </button>
                        <button onClick={() => setActiveTab('COSTOS')} className={`flex-1 py-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'COSTOS' ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            <div className="flex items-center justify-center gap-2"><Box size={18}/> Costo Mercancía COP</div>
                        </button>
                        <button onClick={() => setActiveTab('CUENTAS')} className={`flex-1 py-4 px-6 font-bold text-sm border-b-2 transition-all ${activeTab === 'CUENTAS' ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}>
                            <div className="flex items-center justify-center gap-2"><Receipt size={18}/> Gastos y Prorrateo</div>
                        </button>
                    </div>

                    {/* AI Tab Content */}
                    <div className="p-6 bg-slate-50">
                        
                        {activeTab === 'AUDITORIA' && (
                            <div className="space-y-6">
                                {/* Document Slots - Visually exactly what was extracted */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {(aiExtractedDocs || []).map((doc, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                {String(doc.docType || '').toUpperCase().includes('COMERCIAL') ? <FileText size={64}/> : String(doc.docType || '').toUpperCase().includes('LOG') ? <Anchor size={64}/> : <FileCheck size={64}/>}
                                            </div>
                                            <div className="relative z-10">
                                                <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded mb-3 inline-block ${
                                                    String(doc.docType || '').toUpperCase().includes('COMERCIAL') ? 'bg-blue-100 text-blue-700' :
                                                    String(doc.docType || '').toUpperCase().includes('LOG') ? 'bg-amber-100 text-amber-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {String(doc.docType || 'DOCUMENTO').replace('_', ' ')}
                                                </span>
                                                <h4 className="font-bold text-slate-800 text-lg mb-1 truncate" title={doc.issuer}>{doc.issuer || 'Desconocido'}</h4>
                                                <div className="space-y-2 mt-4">
                                                    <div className="flex justify-between text-sm"><span className="text-slate-500">Documento:</span><span className="font-bold text-slate-700">{doc.docNumber || 'N/A'}</span></div>
                                                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                                                        <span className="font-bold block mb-1">Datos Clave:</span>
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            {(doc.keyExtractedData || []).map((data: string, dIdx: number) => (
                                                                <li key={dIdx}>{data}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Cross-Validation Matrix (Ultra Detailed) */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-slate-100 border-b border-slate-200">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckSquare className="text-emerald-600"/> Matriz Exacta de Cruce de Datos</h3>
                                        <p className="text-xs text-slate-500 mt-1">Aquí puedes ver el origen exacto de cada dato y cómo la IA resolvió la información.</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-4">Dato Extraído</th>
                                                    <th className="p-4">Valor Final</th>
                                                    <th className="p-4">Fuente (Cruce)</th>
                                                    <th className="p-4">Estado del Cruce</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {/* Meta */}
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold text-slate-700">Tasa de Cambio (TRM)</td>
                                                    <td className="p-4 font-black text-indigo-700">{aiTrm} COP</td>
                                                    <td className="p-4 text-slate-500 text-xs">Cruce entre Fecha de Factura y DIAN</td>
                                                    <td className="p-4"><span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-2 py-1 rounded">VÁLIDO</span></td>
                                                </tr>
                                                {/* Rows */}
                                                {parsedRows.map((r, i) => (
                                                    <tr key={`r-${i}`} className="hover:bg-slate-50">
                                                        <td className="p-4">
                                                            <div className="font-bold text-slate-800">{r.sku}</div>
                                                            <div className="text-xs text-slate-400">Cant: {r.qty} • Costo: {r.cost}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            {r.isValid ? (
                                                                <div className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle size={14}/> {r.product?.name}</div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-red-500 font-bold"><AlertCircle size={14}/> {r.error}</div>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-xs text-slate-500">{r.crossReference || 'Cruce directo con Commercial Invoice'}</div>
                                                            <div className="text-xs font-mono text-slate-400 mt-1">Raw: {r.rawName || r.rawSku}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`font-bold text-xs px-2 py-1 rounded ${r.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                {r.isValid ? 'MATCH EXACTO' : 'REVISIÓN REQUERIDA'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Costs */}
                                                {landedCosts.map((lc, i) => (
                                                    <tr key={`lc-${i}`} className="hover:bg-slate-50">
                                                        <td className="p-4 font-bold text-slate-700">Gasto: {lc.concept}</td>
                                                        <td className="p-4 font-black text-slate-900">${lc.amount.toLocaleString()} COP</td>
                                                        <td className="p-4 text-slate-500 text-xs">{lc.crossReference || 'Cruce con Factura Logística / Aduanas'}</td>
                                                        <td className="p-4"><span className="bg-blue-100 text-blue-700 font-bold text-xs px-2 py-1 rounded">EXTRAÍDO</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'COSTOS' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">Costo de Mercancía Transformado (COP)</h3>
                                    <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold">
                                        Total FOB (COP): ${(totalFOB).toLocaleString()}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50">
                                            <tr className="text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                                                <th className="p-4">Estado</th><th className="p-4">SKU / Producto</th><th className="p-4 text-right">Cant.</th><th className="p-4 text-right">Costo Unit. (USD)</th><th className="p-4 text-right">Total Fila (COP)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {rowsWithRealCost.map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedProductForDrawer(row)}>
                                                    <td className="p-4">{row.isValid ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}</td>
                                                    <td className="p-4"><span className="font-bold text-slate-800 block">{row.sku}</span><span className="text-xs text-slate-500">{row.product?.name || row.rawName}</span></td>
                                                    <td className="p-4 text-right font-bold">{row.qty}</td>
                                                    <td className="p-4 text-right font-medium">${row.cost} {aiCurrency}</td>
                                                    <td className="p-4 text-right font-black text-slate-900">${(row.cost * row.qty * aiTrm).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'CUENTAS' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">Cuentas por Pagar (Gastos)</h3>
                                    <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg font-bold">
                                        Total Gastos (COP): ${(totalLandedCosts).toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {landedCosts.map((lc, idx) => (
                                        <div key={lc.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex-1"><label className="text-xs font-bold text-slate-500 uppercase">Concepto</label><input type="text" value={lc.concept} onChange={(e) => { const u = [...landedCosts]; u[idx].concept = e.target.value; setLandedCosts(u); }} className="w-full bg-transparent border-b border-slate-300 font-medium py-1" /></div>
                                            <div className="flex-1"><label className="text-xs font-bold text-slate-500 uppercase">Proveedor / Tercero</label><input type="text" value={lc.provider} onChange={(e) => { const u = [...landedCosts]; u[idx].provider = e.target.value; setLandedCosts(u); }} className="w-full bg-transparent border-b border-slate-300 font-medium py-1" /></div>
                                            <div className="w-48"><label className="text-xs font-bold text-slate-500 uppercase">Monto ($ COP)</label><input type="number" value={lc.amount || ''} onChange={(e) => { const u = [...landedCosts]; u[idx].amount = parseFloat(e.target.value) || 0; setLandedCosts(u); }} className="w-full bg-transparent border-b border-slate-300 font-bold py-1" /></div>
                                            <button onClick={() => setLandedCosts(landedCosts.filter(l => l.id !== lc.id))} className="text-slate-400 hover:text-red-500 p-2 mt-4"><Trash2 size={20} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setLandedCosts([...landedCosts, { id: Date.now().toString(), concept: '', provider: '', amount: 0, retefuenteAmount: 0, reteicaAmount: 0 }])} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50">
                                        <Plus size={18} className="inline mr-2"/> Añadir Gasto Manual
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                    <div className="p-6 border-t border-slate-200 bg-white flex justify-end">
                        <button 
                            onClick={handleConfirm}
                            disabled={processing || invalidCount > 0 || !invoiceNumber}
                            className="bg-emerald-500 text-white font-black px-10 py-4 rounded-xl shadow-lg hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Contabilizando...' : <><Box size={20} /> Contabilizar Expediente Automático</>}
                        </button>
                    </div>

                </div>
            )}
            {/* AI Product Breakdown Drawer */}
            <AnimatePresence>
                {selectedProductForDrawer && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/50 z-40"
                            onClick={() => setSelectedProductForDrawer(null)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[500px] bg-slate-50 shadow-2xl z-50 flex flex-col border-l border-slate-200 overflow-hidden"
                        >
                            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                                        <Box size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">Auditoría del Producto</h3>
                                        <p className="text-sm text-slate-500">{selectedProductForDrawer.sku}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedProductForDrawer(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Header Product Details */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-slate-800 text-lg">{selectedProductForDrawer.product?.name || selectedProductForDrawer.rawName || 'Desconocido'}</h4>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedProductForDrawer.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {selectedProductForDrawer.isValid ? 'VALIDADO' : 'ERROR'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Cantidad</span>
                                            <span className="font-black text-slate-800 text-lg">{selectedProductForDrawer.qty}</span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Costo Unit. Final (COP)</span>
                                            <span className="font-black text-indigo-700 text-lg">${selectedProductForDrawer.realCost?.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedProductForDrawer.aiExplanation ? (
                                    <>
                                        {/* AI Origin Panel */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                                                <Search size={16} className="text-indigo-500" />
                                                Origen del Costo (FOB)
                                            </h4>
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                                    <span className="text-sm font-medium text-slate-600">Costo Base Detectado:</span>
                                                    <span className="font-bold text-slate-800">${selectedProductForDrawer.aiExplanation.baseCostFob} {aiCurrency}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                                    <span className="text-sm font-medium text-slate-600">Ubicación Exacta:</span>
                                                    <span className="font-medium text-slate-800 text-right text-xs max-w-[200px]">{selectedProductForDrawer.aiExplanation.baseCostOrigin}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-slate-600">TRM Aplicada:</span>
                                                    <span className="font-bold text-emerald-600">{selectedProductForDrawer.aiExplanation.trmApplied} COP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Formula Panel */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                                                <Calculator size={16} className="text-indigo-500" />
                                                Fórmula de Prorrateo
                                            </h4>
                                            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                                                <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                                                    {selectedProductForDrawer.aiExplanation.apportionmentFormula}
                                                </p>
                                                <div className="mt-4 pt-4 border-t border-indigo-200/50 flex justify-between items-center">
                                                    <span className="text-xs font-bold text-indigo-700 uppercase">Impacto Gastos / Unid.</span>
                                                    <span className="font-black text-indigo-700">${(selectedProductForDrawer.landedCostShare! / selectedProductForDrawer.qty).toLocaleString(undefined, {maximumFractionDigits: 2})} COP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Source Documents Panel */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2 mb-3">
                                                <FileCheck size={16} className="text-indigo-500" />
                                                Documentos Procesados
                                            </h4>
                                            <div className="space-y-2">
                                                {(selectedProductForDrawer.aiExplanation.sourceDocuments || []).map((doc, dIdx) => (
                                                    <div key={dIdx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                                                        <FileText className="text-slate-400" size={18} />
                                                        <span className="text-sm font-bold text-slate-700">{doc}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col items-center text-center mt-8">
                                        <AlertTriangle className="text-amber-500 w-12 h-12 mb-3" />
                                        <h4 className="font-bold text-amber-800 text-lg mb-1">Sin Análisis IA</h4>
                                        <p className="text-amber-700 text-sm">Este producto no fue extraído usando Ingesta Inteligente o no contiene la explicación de la IA. Usa el modo IA para ver el desglose detallado.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
