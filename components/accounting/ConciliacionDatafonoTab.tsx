import { useEscapeKey } from '../../hooks/useEscapeKey';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Calculator, FileSpreadsheet, Download, AlertTriangle, 
    CheckCircle2, DollarSign, PackageOpen, TableProperties,
    Calendar, Filter, Search, ArrowRight, UserCheck, Mail, Send, CreditCard, Banknote, Wallet, HandCoins, UploadCloud, Landmark, X, BrainCircuit
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AccountingTransaction } from '../../types';

export interface ConciliacionDatafonoTabProps {
    transactions: AccountingTransaction[];
    reconcileDatáfonoTransaction: (invoiceId: string, bankAmount: number, bankFee: number) => void;
}

export const ConciliacionDatafonoTab: React.FC<ConciliacionDatafonoTabProps> = ({
    transactions,
    reconcileDatáfonoTransaction
}) => {
    // Local State
    const [reconciliationType, setReconciliationType] = useState<'DATAFONO' | 'DAVIVIENDA' | 'BBVA'>('DATAFONO');
    const [bankTransactions, setBankTransactions] = useState<any[]>([]);
    const [saleSearch, setSaleSearch] = useState('');
    const [bankSearch, setBankSearch] = useState('');
    const [bankFileName, setBankFileName] = useState('');
    const [activeValidationSale, setActiveValidationSale] = useState<AccountingTransaction | null>(null);
    const [bankAmountInput, setBankAmountInput] = useState('');
    const [bankFeeInput, setBankFeeInput] = useState('');
    const [reconciledList, setReconciledList] = useState<any[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reteFuenteInput, setReteFuenteInput] = useState('0');
    const [reteIvaInput, setReteIvaInput] = useState('0');
    const [reteIcaInput, setReteIcaInput] = useState('0');
    const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Escape key hooks


    // AI suggestion logic
    const suggestedMatches = useMemo(() => {
        const matches = new Map<string, any>();
        transactions.filter(t => t.type === 'VENTA').forEach(sale => {
            const possibleMatch = bankTransactions.find(b => 
                !reconciledList.some(r => r.bank?.id === b.id) && 
                Math.abs(b.amount - sale.total) < (sale.total * 0.1)
            );
            if (possibleMatch) matches.set(sale.id, possibleMatch);
        });
        return matches;
    }, [bankTransactions, transactions, reconciledList]);

    return (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col overflow-hidden relative">
                                {/* Format Selector Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 shrink-0">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                            <Landmark className="w-5 h-5 text-indigo-600" />
                                            Conciliación Bancaria Avanzada (Extractos & Tarjetas)
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">Cruza movimientos de extractos bancarios o abonos de pasarelas con las facturas y ventas del ERP.</p>
                                    </div>
                                    <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                                        <button
                                            onClick={() => {
                                                setReconciliationType('DATAFONO');
                                                setBankTransactions([]);
                                                setBankFileName('');
                                            }}
                                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${reconciliationType === 'DATAFONO' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Tarjetas / Datáfonos
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReconciliationType('DAVIVIENDA');
                                                setBankTransactions([]);
                                                setBankFileName('');
                                            }}
                                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${reconciliationType === 'DAVIVIENDA' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Extracto Davivienda
                                        </button>
                                        <button
                                            onClick={() => {
                                                setReconciliationType('BBVA');
                                                setBankTransactions([]);
                                                setBankFileName('');
                                            }}
                                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${reconciliationType === 'BBVA' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Extracto BBVA
                                        </button>
                                    </div>
                                </div>

                                {/* Header / KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                                            {reconciliationType === 'DATAFONO' ? 'Pendiente Datáfono' : 'Ventas por Conciliar'}
                                        </span>
                                        <span className="text-2xl font-black text-indigo-900 mt-1">
                                            ${transactions
                                                .filter(t => t.type === 'VENTA' && (
                                                    reconciliationType === 'DATAFONO' 
                                                        ? t.paymentMethod.includes('Datáfonos') 
                                                        : (t.paymentMethod.includes('Transferencia') || t.paymentMethod.includes('PSE'))
                                                ) && t.validationStatus === 'PENDIENTE_VALIDACION')
                                                .filter(t => !reconciledList.some(r => r.sale.id === t.id))
                                                .reduce((sum, t) => sum + t.total, 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-indigo-600 mt-1 font-semibold">
                                            {transactions.filter(t => t.type === 'VENTA' && (
                                                reconciliationType === 'DATAFONO' 
                                                    ? t.paymentMethod.includes('Datáfonos') 
                                                    : (t.paymentMethod.includes('Transferencia') || t.paymentMethod.includes('PSE'))
                                            ) && t.validationStatus === 'PENDIENTE_VALIDACION').filter(t => !reconciledList.some(r => r.sale.id === t.id)).length} registros
                                        </span>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Movimientos Cargados</span>
                                        <span className="text-2xl font-black text-emerald-900 mt-1">
                                            ${bankTransactions
                                                .filter(b => !reconciledList.some(r => r.bank?.id === b.id))
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-emerald-600 mt-1 font-semibold">
                                            {bankTransactions.filter(b => !reconciledList.some(r => r.bank?.id === b.id)).length} transacciones libres
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Neto en Banco</span>
                                        <span className="text-2xl font-black text-slate-900 mt-1">
                                            ${transactions
                                                .filter(t => t.validationStatus === 'VALIDADA' && t.bankAmount)
                                                .reduce((sum, t) => sum + (t.bankAmount || 0), 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-1 font-semibold font-mono">
                                            Cuenta 111005 (Bancos)
                                        </span>
                                    </div>
                                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col">
                                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wide">Gastos & Retenciones</span>
                                        <span className="text-2xl font-black text-rose-900 mt-1">
                                            ${transactions
                                                .filter(t => t.validationStatus === 'VALIDADA')
                                                .reduce((sum, t) => sum + (t.bankFee || 0), 0)
                                                .toLocaleString('es-CO')}
                                        </span>
                                        <span className="text-xs text-rose-600 mt-1 font-semibold font-mono">
                                            Comisiones (Gasto 5195)
                                        </span>
                                    </div>
                                </div>

                                {/* Banner superior para guardar lote */}
                                {reconciledList.length > 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm shrink-0 animate-fade-in">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-amber-900 text-sm">Cruces listos para confirmación contable ({reconciledList.length})</h4>
                                                <p className="text-xs text-amber-700">Revisa el lote de conciliación antes de asentar los comprobantes en el libro mayor.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            Guardar Todo
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Main Split View */}
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                                    {/* Left Pane: Ventas ERP */}
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-4 shrink-0">
                                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                <CreditCard className="w-5 h-5 text-indigo-600" />
                                                Ventas ERP Pendientes de Cruce
                                            </h3>
                                            <div className="relative w-48">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar venta..."
                                                    value={saleSearch}
                                                    onChange={e => setSaleSearch(e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                            {transactions
                                                .filter(t => t.type === 'VENTA' && (
                                                    reconciliationType === 'DATAFONO' 
                                                        ? t.paymentMethod.includes('Datáfonos') 
                                                        : (t.paymentMethod.includes('Transferencia') || t.paymentMethod.includes('PSE'))
                                                ) && t.validationStatus === 'PENDIENTE_VALIDACION')
                                                .filter(t => !reconciledList.some(r => r.sale.id === t.id))
                                                .filter(t => !saleSearch || t.client.toLowerCase().includes(saleSearch.toLowerCase()) || t.id.toLowerCase().includes(saleSearch.toLowerCase()) || t.total.toString().includes(saleSearch))
                                                .map(t => {
                                                    const suggestion = suggestedMatches.get(t.id);
                                                    return (
                                                        <div
                                                            key={t.id}
                                                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col gap-3 shadow-sm"
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="text-xs font-mono text-slate-400">{t.date}</div>
                                                                    <div className="font-black text-slate-800 mt-0.5">{t.id}</div>
                                                                    <div className="text-xs font-semibold text-slate-600 mt-1">{t.client}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-black text-slate-900">${t.total.toLocaleString('es-CO')}</div>
                                                                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                                                                        {t.paymentMethod}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {suggestion && (
                                                                <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                                                                    <span>Coincidencia sugerida: {suggestion.description} (${suggestion.amount.toLocaleString('es-CO')})</span>
                                                                    <span className="font-mono text-slate-400">Ref: {suggestion.ref}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex justify-end pt-2 border-t border-slate-100">
                                                                <button
                                                                    onClick={() => {
                                                                        setActiveValidationSale(t);
                                                                        if (suggestion) {
                                                                            setBankAmountInput(suggestion.amount.toString());
                                                                            setBankFeeInput((t.total - suggestion.amount).toString());
                                                                        } else {
                                                                            setBankAmountInput(t.total.toString());
                                                                            setBankFeeInput('0');
                                                                        }
                                                                        setReteFuenteInput('0');
                                                                        setReteIvaInput('0');
                                                                        setReteIcaInput('0');
                                                                    }}
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-1.5 px-3 rounded-lg shadow-sm active:scale-95 transition-all"
                                                                >
                                                                    Conciliar Fila
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Right Pane: Bank Statement */}
                                    <div className="border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-4 shrink-0">
                                            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                <Landmark className="w-5 h-5 text-emerald-600" />
                                                Extracto Bancario
                                                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-black font-mono">
                                                    {reconciliationType}
                                                </span>
                                            </h3>
                                            
                                            {bankTransactions.length > 0 ? (
                                                <button
                                                    onClick={() => {
                                                        setBankTransactions([]);
                                                        setBankFileName('');
                                                    }}
                                                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                                                >
                                                    Limpiar Extracto
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setBankFileName(`EXTRACTO_DEMO_${reconciliationType}_${new Date().toISOString().split('T')[0]}.xlsx`);
                                                        // Generate simulation data based on type
                                                        if (reconciliationType === 'DAVIVIENDA') {
                                                            setBankTransactions([
                                                                { id: 'bank-dv-1', date: new Date().toISOString().split('T')[0], description: 'TRF REC. CLIENTE MEGA S.A.', amount: 15000000, ref: 'DV-982103' },
                                                                { id: 'bank-dv-2', date: new Date().toISOString().split('T')[0], description: 'PSE PAGO PINTURAS NORTE', amount: 4950000, ref: 'PSE-348210' },
                                                                { id: 'bank-dv-3', date: new Date().toISOString().split('T')[0], description: 'ABONO CLIENTE TALLER S.', amount: 980000, ref: 'DV-120934' },
                                                                { id: 'bank-dv-4', date: new Date().toISOString().split('T')[0], description: 'COBRO CUOTA MANEJO PYME', amount: -65000, ref: 'DV-G1' }
                                                            ]);
                                                        } else if (reconciliationType === 'BBVA') {
                                                            setBankTransactions([
                                                                { id: 'bank-bb-1', date: new Date().toISOString().split('T')[0], description: 'ABONO TRANSF DISTRIBUIDORA G.', amount: 8500000, ref: 'BB-98210' },
                                                                { id: 'bank-bb-2', date: new Date().toISOString().split('T')[0], description: 'ABONO DIRECTO MEGA CONSTR', amount: 12000000, ref: 'BB-92348' },
                                                                { id: 'bank-bb-3', date: new Date().toISOString().split('T')[0], description: 'COMISION TRANSFERENCIA', amount: -4000, ref: 'BB-COM01' }
                                                            ]);
                                                        } else {
                                                            setBankTransactions([
                                                                { id: 'bank-dt-1', date: new Date().toISOString().split('T')[0], description: 'LIQ DIARIA DATAFONO REDEBAN', amount: 1450000, ref: 'RB-9021' },
                                                                { id: 'bank-dt-2', date: new Date().toISOString().split('T')[0], description: 'LIQ DIARIA CREDIBANCO VIS', amount: 2890000, ref: 'CB-4921' }
                                                            ]);
                                                        }
                                                    }}
                                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg"
                                                >
                                                    Cargar Extracto Demo (Muestra)
                                                </button>
                                            )}
                                        </div>

                                        {bankTransactions.length === 0 ? (
                                            <div className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 bg-white">
                                                <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
                                                <p className="text-sm font-bold text-slate-700 mb-1">Cargar Extracto {reconciliationType}</p>
                                                <p className="text-xs text-slate-400 text-center mb-4 max-w-xs">
                                                    Sube el archivo Excel provisto por tu portal de {reconciliationType === 'DATAFONO' ? 'Datáfonos' : reconciliationType} para iniciar.
                                                </p>
                                                <input
                                                    type="file"
                                                    accept=".xlsx, .xls, .pdf, image/jpeg, image/png, image/webp"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setIsProcessingAI(true);
                                                        setBankFileName(file.name);
                                                        
                                                        try {
                                                            const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

                                                            if (isExcel) {
                                                                const bstr = await new Promise<string>((resolve) => {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (evt) => resolve(evt.target?.result as string);
                                                                    reader.readAsBinaryString(file);
                                                                });
                                                                const wb = XLSX.read(bstr, { type: 'binary' });
                                                                const wsname = wb.SheetNames[0];
                                                                
                                                                // Parse all columns perfectly
                                                                const rawData = XLSX.utils.sheet_to_json<any>(wb.Sheets[wsname]);
                                                                
                                                                const mappedData = rawData.map((row, idx) => {
                                                                    const rowKeys = Object.keys(row);
                                                                    const findKey = (keywords: string[]) => rowKeys.find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
                                                                    
                                                                    const dateKey = findKey(['fecha', 'date']);
                                                                    const descKey = findKey(['concepto', 'descripción', 'detalle', 'description', 'observacion', 'tipo']);
                                                                    const amountKey = findKey(['monto', 'valor', 'amount', 'total', 'abono', 'cargo', 'ingreso']);
                                                                    const refKey = findKey(['ref', 'documento', 'comprobante', 'transaccion', 'id']);
                                                                    
                                                                    const extraData: Record<string, any> = {};
                                                                    rowKeys.forEach(k => {
                                                                        if (k !== dateKey && k !== descKey && k !== amountKey && k !== refKey) {
                                                                            extraData[k] = row[k];
                                                                        }
                                                                    });
                                                                    
                                                                    return {
                                                                        id: `bank-${Date.now()}-${idx}`,
                                                                        date: dateKey && row[dateKey] ? String(row[dateKey]) : new Date().toISOString().split('T')[0],
                                                                        description: descKey ? String(row[descKey]) : 'Transacción de Extracto',
                                                                        amount: amountKey ? Math.abs(Number(String(row[amountKey]).replace(/[^0-9.-]+/g,""))) || 0 : 0,
                                                                        ref: refKey ? String(row[refKey]) : `REF-${Math.floor(100000 + Math.random() * 900000)}`,
                                                                        extraData
                                                                    };
                                                                });
                                                                
                                                                setBankTransactions(mappedData);
                                                                setIsProcessingAI(false);
                                                                return; // Termina aquí para excel
                                                            }

                                                            // Si NO es Excel, usamos IA
                                                            let promptText = `Eres un asistente experto contable financiero. Extrae los movimientos (transacciones) de este extracto bancario de ${reconciliationType}.
Devuelve EXCLUSIVAMENTE un arreglo JSON válido sin markdown adicional con este formato exacto:
[
  {
    "date": "YYYY-MM-DD",
    "description": "concepto o descripción de la transacción",
    "amount": 123456, // número entero, SIEMPRE POSITIVO absoluto (sin comas ni símbolos)
    "ref": "número de referencia o documento",
    "extraData": {
       // Agrega aquí CUALQUIER columna extra que encuentres. Por ejemplo: Retefuente, ReteIVA, Comisiones, Monto Bruto, Monto Neto, etc. Mantén su nombre original como clave y su valor numérico o texto.
    }
  }
]`;
                                                            let parts: any[] = [];
                                                            const base64Data = await new Promise<string>((resolve) => {
                                                                const reader = new FileReader();
                                                                reader.onload = (evt) => {
                                                                    const result = evt.target?.result as string;
                                                                    resolve(result.split(',')[1]);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            });
                                                            parts = [
                                                                { text: promptText },
                                                                { inlineData: { mimeType: file.type || 'application/pdf', data: base64Data } }
                                                            ];
                                                            
                                                            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
                                                            if (!apiKey) throw new Error('API Key de Gemini no configurada.');
                                                            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ contents: [{ parts }] })
                                                            });
                                                            
                                                            const result = await response.json();
                                                            if (result.error) throw new Error(result.error.message);
                                                            
                                                            let textResponse = result.candidates[0].content.parts[0].text;
                                                            const jsonString = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
                                                            const parsedData = JSON.parse(jsonString);
                                                            
                                                            const mappedData = parsedData.map((item: any, idx: number) => ({
                                                                id: `bank-${Date.now()}-${idx}`,
                                                                date: item.date || new Date().toISOString().split('T')[0],
                                                                description: item.description || 'Transacción de Extracto',
                                                                amount: Math.abs(Number(item.amount) || 0),
                                                                ref: item.ref || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
                                                                extraData: item.extraData || {}
                                                            }));
                                                            
                                                            setBankTransactions(mappedData);
                                                        } catch (error: any) {
                                                            console.error('Error procesando con IA:', error);
                                                            alert(`Hubo un error procesando el documento con IA: ${error.message || error}`);
                                                            setBankFileName('');
                                                        } finally {
                                                            setIsProcessingAI(false);
                                                        }
                                                        
                                                        // Reset file input so it can trigger again for same file
                                                        e.target.value = '';
                                                    }}
                                                    className="hidden"
                                                    id="bank-excel-file-extended"
                                                />
                                                <label
                                                    htmlFor="bank-excel-file-extended"
                                                    className={`text-white text-xs font-black py-2.5 px-4 rounded-xl cursor-pointer transition-all ${isProcessingAI ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                                >
                                                    {isProcessingAI ? 'Analizando con IA...' : 'Seleccionar Archivo (Excel/PDF/Imagen)'}
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col min-h-0">
                                                <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-lg font-medium mb-3 border border-emerald-100 flex items-center justify-between">
                                                    <span className="truncate">Archivo: <strong>{bankFileName}</strong></span>
                                                    <span className="shrink-0">{bankTransactions.filter(b => !reconciledList.some(r => r.bank?.id === b.id)).length} libres</span>
                                                </div>

                                                <div className="flex-1 overflow-auto bg-white rounded-xl border border-slate-200 custom-scrollbar relative">
                                                    {isProcessingAI && (
                                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                                                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                                                            <p className="text-sm font-bold text-slate-700">La Inteligencia Artificial está procesando...</p>
                                                            <p className="text-xs text-slate-500 max-w-xs text-center mt-1">Extrayendo fechas, referencias y montos automáticamente</p>
                                                        </div>
                                                    )}
                                                    {(() => {
                                                        const uniqueExtraKeys = Array.from(
                                                            new Set(
                                                                bankTransactions.flatMap(b => Object.keys(b.extraData || {}))
                                                            )
                                                        ).filter(k => k !== '__rowNum__' && k.trim() !== '');

                                                        return (
                                                            <table className="w-full text-left border-collapse min-w-[500px]">
                                                                <thead className="sticky top-0 bg-slate-50 shadow-sm z-0">
                                                                    <tr>
                                                                        <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">Fecha</th>
                                                                        <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">Concepto / Descripción</th>
                                                                        <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200">Referencia</th>
                                                                        {uniqueExtraKeys.map(k => (
                                                                            <th key={k} className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 text-right whitespace-nowrap">{k}</th>
                                                                        ))}
                                                                        <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 text-right">Monto Principal</th>
                                                                        <th className="px-4 py-2.5 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 text-center">Estado</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                    {bankTransactions
                                                                        .filter(b => !reconciledList.some(r => r.bank?.id === b.id))
                                                                        .map(b => {
                                                                            const isLinked = Array.from(suggestedMatches.values()).some(m => m.id === b.id);
                                                                            return (
                                                                                <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${isLinked ? 'bg-emerald-50/20' : ''}`}>
                                                                                    <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{b.date}</td>
                                                                                    <td className="px-4 py-3 text-sm font-black text-slate-800">{b.description}</td>
                                                                                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{b.ref}</td>
                                                                                    {uniqueExtraKeys.map(k => {
                                                                                        const val = b.extraData?.[k];
                                                                                        const isNum = typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '');
                                                                                        const displayVal = isNum ? `$${Number(val).toLocaleString('es-CO')}` : (val || '-');
                                                                                        return (
                                                                                            <td key={k} className="px-4 py-3 text-xs font-mono text-slate-500 text-right whitespace-nowrap">{displayVal}</td>
                                                                                        );
                                                                                    })}
                                                                                    <td className="px-4 py-3 text-sm font-black text-emerald-700 text-right whitespace-nowrap">${b.amount.toLocaleString('es-CO')}</td>
                                                                                    <td className="px-4 py-3 text-center">
                                                                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isLinked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                                                                                            {isLinked ? 'Sugerido' : 'Libre'}
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                </tbody>
                                                            </table>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Popup de Conciliación con Fórmulas de Retenciones */}
                                <AnimatePresence>
                                    {activeValidationSale && (() => {
                                        const suggestion = suggestedMatches.get(activeValidationSale.id);
                                        
                                        const valTotal = activeValidationSale.total;
                                        const totalNet = Number(bankAmountInput) || 0;
                                        const fee = Number(bankFeeInput) || 0;
                                        const rf = Number(reteFuenteInput) || 0;
                                        const ri = Number(reteIvaInput) || 0;
                                        const rc = Number(reteIcaInput) || 0;

                                        const sumDebits = totalNet + fee + rf + ri + rc;
                                        const difference = valTotal - sumDebits;

                                        return (
                                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
                                                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[90vh]">
                                                    {/* Modal Header */}
                                                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
                                                        <h3 className="text-base font-black text-white flex items-center gap-2">
                                                            <Landmark className="w-5 h-5 text-indigo-400" />
                                                            Conciliar Factura vs. Banco
                                                        </h3>
                                                        <button onClick={() => setActiveValidationSale(null)} className="text-slate-400 hover:text-white transition-colors">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>

                                                    {/* Modal Body */}
                                                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Factura ERP</span>
                                                                <div className="text-xs font-black text-slate-800 mt-0.5">{activeValidationSale.id}</div>
                                                                <div className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{activeValidationSale.client}</div>
                                                                <div className="text-sm font-black text-slate-950 mt-1">${valTotal.toLocaleString('es-CO')}</div>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Movimiento Banco</span>
                                                                {suggestion ? (
                                                                    <>
                                                                        <div className="text-xs font-black text-emerald-800 mt-0.5 truncate">{suggestion.description}</div>
                                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {suggestion.ref}</div>
                                                                        <div className="text-sm font-black text-emerald-700 mt-1">${suggestion.amount.toLocaleString('es-CO')}</div>
                                                                    </>
                                                                ) : (
                                                                    <div className="text-xs text-slate-400 italic mt-2">No se vinculó movimiento del extracto</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Monto Neto Acreditado ($)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={bankAmountInput}
                                                                        onChange={e => setBankAmountInput(e.target.value)}
                                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Costo / Comisión Banco ($)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={bankFeeInput}
                                                                        onChange={e => setBankFeeInput(e.target.value)}
                                                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Colombian Withholdings Section */}
                                                            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-3">
                                                                <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">Impuestos & Deducciones (Retenciones)</span>
                                                                
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-slate-500 mb-1">ReteFuente ($)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={reteFuenteInput}
                                                                            onChange={e => setReteFuenteInput(e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono font-bold text-slate-700"
                                                                        />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setReteFuenteInput(Math.round(valTotal * 0.015).toString())}
                                                                            className="text-[9px] text-indigo-600 font-bold mt-1 block hover:underline"
                                                                        >
                                                                            Calcular (1.5%)
                                                                        </button>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-slate-500 mb-1">ReteIVA ($)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={reteIvaInput}
                                                                            onChange={e => setReteIvaInput(e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono font-bold text-slate-700"
                                                                        />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setReteIvaInput(Math.round((activeValidationSale.iva || (valTotal * 0.19 / 1.19)) * 0.15).toString())}
                                                                            className="text-[9px] text-indigo-600 font-bold mt-1 block hover:underline"
                                                                        >
                                                                            Calcular (15% IVA)
                                                                        </button>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[9px] font-bold text-slate-500 mb-1">ReteICA ($)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={reteIcaInput}
                                                                            onChange={e => setReteIcaInput(e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono font-bold text-slate-700"
                                                                        />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => setReteIcaInput(Math.round(valTotal * 0.00966).toString())}
                                                                            className="text-[9px] text-indigo-600 font-bold mt-1 block hover:underline"
                                                                        >
                                                                            Calcular (9.66‰)
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Accounting Preview - Partida Doble */}
                                                            <div className="bg-slate-900 rounded-xl p-3 text-slate-300 font-mono text-[10px] space-y-1.5 border border-slate-950 shadow-inner">
                                                                <span className="text-slate-400 font-bold block border-b border-slate-800 pb-1 uppercase tracking-wide">
                                                                    Pre-visualización Contable (Partida Doble SIIGO)
                                                                </span>
                                                                <div className="flex justify-between">
                                                                    <span>111005 - Bancos (Débito)</span>
                                                                    <span className="text-emerald-400 font-bold">${totalNet.toLocaleString()}</span>
                                                                </div>
                                                                {fee > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>519595 - Gasto Bancario / Comisión (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${fee.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {rf > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>135515 - ReteFuente (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${rf.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {ri > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>135517 - ReteIVA (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${ri.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {rc > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span>135518 - ReteICA (Débito)</span>
                                                                        <span className="text-emerald-400 font-bold">${rc.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between border-t border-slate-800 pt-1">
                                                                    <span>130505 - Clientes Nacionales (Crédito)</span>
                                                                    <span className="text-rose-400 font-bold">${valTotal.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between border-t border-slate-700 pt-1 text-[9px]">
                                                                    <span className="text-slate-400">DESCUADRE CONTABLE:</span>
                                                                    <span className={`font-bold ${difference === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                        ${difference.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Modal Footer */}
                                                    <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center shrink-0">
                                                        <div>
                                                            {difference !== 0 && (
                                                                <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                                    Diferencia pendiente: ${difference.toLocaleString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => setActiveValidationSale(null)}
                                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setReconciledList(prev => [
                                                                        ...prev,
                                                                        {
                                                                            sale: activeValidationSale,
                                                                            bankAmount: totalNet,
                                                                            bankFee: fee + rf + ri + rc, // Total financial deductions
                                                                            bank: suggestion
                                                                        }
                                                                    ]);
                                                                    setActiveValidationSale(null);
                                                                }}
                                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-100 active:scale-95 transition-all"
                                                            >
                                                                Pre-validar Cruce
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </AnimatePresence>

                                {/* Batch validation review modal popup (overlay style) */}
                                {showReviewModal && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                                        <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                                            {/* Modal Header */}
                                            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-indigo-400" />
                                                    Confirmar Lote de Conciliaciones
                                                </h3>
                                                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            {/* Modal Body */}
                                            <div className="p-6 flex-1 overflow-y-auto">
                                                <p className="text-xs text-slate-500 mb-4">
                                                    Por favor revisa el listado de IDs de ventas pre-validadas antes de confirmar. Al guardar, las ventas pasarán a estado VALIDADA y se registrará el neto y la comisión en el banco.
                                                </p>
                                                
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-50 text-slate-500 font-bold">
                                                        <tr className="border-b border-slate-200">
                                                            <th className="py-2.5 px-3">Venta ID</th>
                                                            <th className="py-2.5 px-3">Cliente</th>
                                                            <th className="py-2.5 px-3 text-right">Monto ERP</th>
                                                            <th className="py-2.5 px-3 text-right">Neto Banco</th>
                                                            <th className="py-2.5 px-3 text-right">Deducción / Comis.</th>
                                                            <th className="py-2.5 px-3 text-center">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {reconciledList.map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                                <td className="py-3 px-3 font-mono font-bold text-slate-700">{item.sale.id}</td>
                                                                <td className="py-3 px-3 text-slate-600 font-medium">{item.sale.client}</td>
                                                                <td className="py-3 px-3 text-right font-bold text-slate-900">${item.sale.total.toLocaleString('es-CO')}</td>
                                                                <td className="py-3 px-3 text-right text-emerald-700 font-bold">${item.bankAmount.toLocaleString('es-CO')}</td>
                                                                <td className="py-3 px-3 text-right text-rose-600 font-bold">${item.bankFee.toLocaleString('es-CO')}</td>
                                                                <td className="py-3 px-3 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setReconciledList(prev => prev.filter((_, i) => i !== idx));
                                                                            if (reconciledList.length <= 1) setShowReviewModal(false);
                                                                        }}
                                                                        className="text-rose-600 hover:text-rose-700 hover:underline font-black text-xs"
                                                                    >
                                                                        Descartar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {/* Modal Footer */}
                                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between shrink-0">
                                                <div className="text-left">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resumen del Lote</div>
                                                    <div className="text-base font-black text-slate-800 mt-0.5">
                                                        Deducciones Totales: <span className="text-rose-600">${reconciledList.reduce((sum, item) => sum + item.bankFee, 0).toLocaleString('es-CO')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setShowReviewModal(false)}
                                                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            reconciledList.forEach(item => {
                                                                reconcileDatáfonoTransaction(item.sale.id, item.bankAmount, item.bankFee);
                                                            });
                                                            setReconciledList([]);
                                                            setShowReviewModal(false);
                                                        }}
                                                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 shadow-md shadow-indigo-200 active:scale-95 transition-all"
                                                    >
                                                        Confirmar y Asentar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        
    );
};
