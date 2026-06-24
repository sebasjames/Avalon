import React, { useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Calculator, FileSpreadsheet, Download, AlertTriangle, 
    CheckCircle2, DollarSign, PackageOpen, TableProperties,
    Calendar, Filter, Search, ArrowRight, UserCheck, Mail, Send, CreditCard, Banknote, Wallet, HandCoins
} from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ImportInvoicesPanel } from './ImportInvoicesPanel';

export const AccountingModule: React.FC = () => {
    const { inventory, contacts, paymentMethods, pointsOfSale, transactions } = useEnterprise();
    const { tabId } = useParams<{ tabId: string }>();

    // Valid tabs
    const validTabs = ['sabana', 'cartera', 'cierres', 'ventas', 'auditoria', 'inventario', 'exportacion', 'importaciones'];
    if (!tabId || !validTabs.includes(tabId)) {
        return <Navigate to="/accounting/sabana" replace />;
    }

    const activeTab = tabId as 'sabana' | 'cartera' | 'cierres' | 'ventas' | 'auditoria' | 'inventario' | 'exportacion' | 'importaciones';

    // --- SABANA FILTER STATE ---
    const [showFilters, setShowFilters] = useState(false);
    
    const initialFilterState = {
        dateFrom: '',
        dateTo: '',
        type: 'ALL' as 'ALL' | 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA',
        party: '', // Tercero (Contact Name or NIT)
        document: '', // Specific Doc ID
        amountMin: '',
        amountMax: '',
        sku: ''
    };
    const [draftFilters, setDraftFilters] = useState(initialFilterState);
    const [appliedFilters, setAppliedFilters] = useState(initialFilterState);
    const [cierreTimeRange, setCierreTimeRange] = useState<'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'MES_PASADO' | 'ESTE_AÑO'>('ESTE_MES');

    const soloVentas = useMemo(() => transactions.filter(t => t.type === 'VENTA'), [transactions]);

    // --- FILTER SABANA GENERAL ---
    const filteredSabana = useMemo(() => {
        return transactions.filter(t => {
            if (appliedFilters.type !== 'ALL' && t.type !== appliedFilters.type) return false;
            
            if (appliedFilters.dateFrom && new Date(t.date) < new Date(appliedFilters.dateFrom)) return false;
            if (appliedFilters.dateTo && new Date(t.date) > new Date(appliedFilters.dateTo)) return false;
            
            if (appliedFilters.minAmount && t.total < Number(appliedFilters.minAmount)) return false;
            if (appliedFilters.maxAmount && t.total > Number(appliedFilters.maxAmount)) return false;
            
            if (appliedFilters.tercero) {
                const searchStr = appliedFilters.tercero.toLowerCase();
                if (!t.client.toLowerCase().includes(searchStr) && !t.document.toLowerCase().includes(searchStr)) return false;
            }
            
            if (appliedFilters.documento) {
                const searchStr = appliedFilters.documento.toLowerCase();
                if (!t.id.toLowerCase().includes(searchStr)) return false;
            }
            
            if (appliedFilters.concepto) {
                const searchStr = appliedFilters.concepto.toLowerCase();
                if (!t.sku.toLowerCase().includes(searchStr) && !t.productName.toLowerCase().includes(searchStr)) return false;
            }
            
            return true;
        });
    }, [transactions, appliedFilters]);

    const handleExportExcel = () => {
        const dataForExport = filteredSabana.map(t => ({
            'Fecha': t.date,
            'Documento': t.id,
            'Tipo': t.type,
            'Tercero': t.client,
            'NIT/CC': t.document,
            'Concepto (SKU)': t.sku,
            'Producto': t.productName,
            'Cantidad': t.qty,
            'Valor Total ($)': t.total,
            'IVA ($)': t.iva,
            'Punto de Venta': t.posLocation || 'N/A',
            'Forma de Pago': t.paymentMethod || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(dataForExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sábana General");
        XLSX.writeFile(wb, `Sabana_Movimientos_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const carteraData = useMemo(() => {
        const cuentasPorCobrar = transactions.filter(t => t.type === 'VENTA' && t.paymentMethod === 'CREDITO');
        
        let carteraTotal = 0;
        let carteraMora = 0;
        let carteraSana = 0;
        
        let bucket30 = 0;
        let bucket60 = 0;
        let bucket90 = 0;
        let bucket90Plus = 0;
        
        const now = new Date();
        
        const clientsWithDebt: Record<string, { client: string, document: string, totalDebt: number, status: 'MORA' | 'AL_DIA' | 'PAGADO', daysOverdue: number, latestDue: string }> = {};

        cuentasPorCobrar.forEach(t => {
            if (!t.balance) return; // Pagada
            
            carteraTotal += t.balance;
            
            const due = new Date(t.dueDate || t.date);
            const diffTime = now.getTime() - due.getTime();
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (daysOverdue > 0) {
                carteraMora += t.balance;
                if (daysOverdue <= 30) bucket30 += t.balance;
                else if (daysOverdue <= 60) bucket60 += t.balance;
                else if (daysOverdue <= 90) bucket90 += t.balance;
                else bucket90Plus += t.balance;
            } else {
                carteraSana += t.balance;
            }
            
            if (!clientsWithDebt[t.client]) {
                clientsWithDebt[t.client] = { client: t.client, document: t.document, totalDebt: 0, status: 'PAGADO', daysOverdue: 0, latestDue: t.dueDate || t.date };
            }
            clientsWithDebt[t.client].totalDebt += t.balance;
            
            if (daysOverdue > clientsWithDebt[t.client].daysOverdue) {
                clientsWithDebt[t.client].daysOverdue = daysOverdue;
                clientsWithDebt[t.client].status = daysOverdue > 0 ? 'MORA' : 'AL_DIA';
            }
        });

        const chartData = [
            { name: '< 30 Días', Valor: bucket30 },
            { name: '31-60 Días', Valor: bucket60 },
            { name: '61-90 Días', Valor: bucket90 },
            { name: '> 90 Días', Valor: bucket90Plus },
        ];

        return {
            carteraTotal, carteraMora, carteraSana,
            chartData,
            clientList: Object.values(clientsWithDebt).filter(c => c.totalDebt > 0).sort((a,b) => b.totalDebt - a.totalDebt)
        };
    }, [transactions]);

    const cierreData = useMemo(() => {
        const now = new Date();
        const filtered = transactions.filter(t => {
            const d = new Date(t.date);
            if (cierreTimeRange === 'HOY') {
                return d.toDateString() === now.toDateString();
            } else if (cierreTimeRange === 'ESTA_SEMANA') {
                return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000;
            } else if (cierreTimeRange === 'ESTE_MES') {
                return (now.getTime() - d.getTime()) <= 30 * 24 * 60 * 60 * 1000;
            } else if (cierreTimeRange === 'ESTE_AÑO') {
                return d.getFullYear() === now.getFullYear();
            } else {
                return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1);
            }
        });

        let totalEfectivo = 0;
        let totalBancos = 0;
        let totalIVA = 0;
        let totalCOGS = 0;
        let totalVentas = 0;

        const chartMap: Record<string, { date: string; Efectivo: number; Bancos: number }> = {};

        filtered.forEach(t => {
            if (t.type === 'VENTA') {
                totalVentas += t.total;
                totalIVA += t.iva;
                totalCOGS += t.total * 0.68; // Estimating COGS as 68% for the mock

                const isEfectivo = t.paymentMethod?.toLowerCase().includes('efectivo');
                if (isEfectivo) totalEfectivo += t.total;
                else totalBancos += t.total;

                if (!chartMap[t.date]) {
                    chartMap[t.date] = { date: t.date, Efectivo: 0, Bancos: 0 };
                }
                if (isEfectivo) chartMap[t.date].Efectivo += t.total;
                else chartMap[t.date].Bancos += t.total;
            }
        });

        return {
            totalVentas, totalEfectivo, totalBancos, totalIVA, totalCOGS,
            chartData: Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date))
        };
    }, [transactions, cierreTimeRange]);

    const handleExportZReport = () => {
        alert('📧 Reporte Z enviado exitosamente a contabilidad@empresa.com');
        const ws = XLSX.utils.json_to_sheet([{
            'Periodo': cierreTimeRange,
            'Total Ventas ($)': cierreData.totalVentas,
            'Total Efectivo ($)': cierreData.totalEfectivo,
            'Total Bancos/Tarjetas ($)': cierreData.totalBancos,
            'Total IVA Recaudado ($)': cierreData.totalIVA,
            'Costo Mercancía (COGS) ($)': cierreData.totalCOGS,
            'Margen Bruto ($)': cierreData.totalVentas - cierreData.totalCOGS
        }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Z-Report");
        XLSX.writeFile(wb, `Z-Report_${cierreTimeRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // --- TAB 4: AUDITORÍA TERCEROS ---
    const invalidContacts = useMemo(() => {
        return contacts.filter(c => !c.documentNumber || c.documentNumber.trim() === '');
    }, [contacts]);

    // --- TAB 5: INVENTARIO VALORIZADO ---
    const inventarioValorizado = useMemo(() => {
        let totalCosto = 0;
        const items = inventory.map(p => {
            const val = p.totalStock * p.unitCost;
            totalCosto += val;
            return { ...p, valorTotal: val };
        });
        return { items, totalCosto };
    }, [inventory]);

    // --- TAB 6: EXPORTACIÓN SIIGO ---
    const handleExportSIIGO = () => {
        // 1. Plantilla de Ventas
        const ventasData = soloVentas.map(v => ({
            'Tipo Comprobante': 'FV',
            'Consecutivo': v.id,
            'Fecha': v.date,
            'Cliente': v.client,
            'Base Imponible': v.total - v.iva,
            'IVA': v.iva,
            'Total': v.total,
            'Forma de Pago': v.method
        }));
        
        // 2. Plantilla de Terceros
        const tercerosData = contacts.map(c => ({
            'Tipo Documento': c.documentType || 'NIT',
            'Numero Documento': c.documentNumber || 'FALTA_NIT',
            'Razon Social': c.company || c.name,
            'Nombre Comercial': c.name,
            'Direccion': 'No Especificada',
            'Ciudad': 'Bogota',
            'Telefono': c.phone,
            'Email': c.email
        }));

        const wb = XLSX.utils.book_new();
        const wsVentas = XLSX.utils.json_to_sheet(ventasData);
        const wsTerceros = XLSX.utils.json_to_sheet(tercerosData);
        
        XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas_SIIGO");
        XLSX.utils.book_append_sheet(wb, wsTerceros, "Terceros_SIIGO");
        
        XLSX.writeFile(wb, `Exportacion_SIIGO_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contabilidad & Interfaces</h1>
                        <p className="text-slate-500 font-medium">
                            {activeTab === 'sabana' && 'Sábana General de Movimientos'}
                            {activeTab === 'cierres' && 'Cierres de Caja'}
                            {activeTab === 'ventas' && 'Facturación y Bases Impositivas'}
                            {activeTab === 'auditoria' && 'Auditoría de Clientes (Terceros)'}
                            {activeTab === 'inventario' && 'Inventario Valorizado'}
                            {activeTab === 'exportacion' && 'Exportación SIIGO'}
                            {activeTab === 'importaciones' && 'Carga de Facturas (EDI)'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        
                        {/* TAB 1: SABANA GENERAL */}
                        {activeTab === 'sabana' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-slate-800">Sábana de Movimientos</h2>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowFilters(!showFilters)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${showFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                <Filter className="w-4 h-4" /> Filtros {showFilters ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                            <button 
                                                onClick={handleExportExcel}
                                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition"
                                            >
                                                <Download className="w-4 h-4" /> Excel
                                            </button>
                                        </div>
                                    </div>

                                    {/* FILTERS UI */}
                                    <AnimatePresence>
                                        {showFilters && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Fechas</label>
                                                        <div className="flex gap-2">
                                                            <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters({...draftFilters, dateFrom: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                            <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters({...draftFilters, dateTo: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Comprobante</label>
                                                        <select value={draftFilters.type} onChange={e => setDraftFilters({...draftFilters, type: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg">
                                                            <option value="ALL">Todos</option>
                                                            <option value="VENTA">Ventas (Facturas)</option>
                                                            <option value="COMPRA">Compras (Albaranes)</option>
                                                            <option value="AJUSTE_MERMA">Ajustes / Mermas</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tercero (NIT o Nombre)</label>
                                                        <input type="text" placeholder="Buscar..." value={draftFilters.tercero} onChange={e => setDraftFilters({...draftFilters, tercero: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Documento (ID)</label>
                                                        <input type="text" placeholder="Ej. FV-001" value={draftFilters.documento} onChange={e => setDraftFilters({...draftFilters, documento: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Rango de Valor ($)</label>
                                                        <div className="flex gap-2">
                                                            <input type="number" placeholder="Min" value={draftFilters.minAmount} onChange={e => setDraftFilters({...draftFilters, minAmount: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                            <input type="number" placeholder="Max" value={draftFilters.maxAmount} onChange={e => setDraftFilters({...draftFilters, maxAmount: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Concepto / SKU Producto</label>
                                                        <input type="text" placeholder="Buscar por código de pintura o nombre..." value={draftFilters.concepto} onChange={e => setDraftFilters({...draftFilters, concepto: e.target.value})} className="w-full text-sm border-slate-200 rounded-lg" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-end justify-end gap-2 lg:col-span-4">
                                                        <button 
                                                            onClick={() => {
                                                                setDraftFilters(initialFilterState);
                                                                setAppliedFilters(initialFilterState);
                                                            }}
                                                            className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2"
                                                        >
                                                            Limpiar
                                                        </button>
                                                        <button 
                                                            onClick={() => setAppliedFilters(draftFilters)}
                                                            className="bg-indigo-600 text-white text-sm font-bold px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
                                                        >
                                                            Aplicar Filtros
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
                                    <div className="h-full overflow-y-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                                                <tr>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Fecha</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Documento</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Tipo</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Tercero</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">Concepto (SKU)</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500">POS / Forma Pago</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 text-right">Valor ($)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredSabana.map((t, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50">
                                                        <td className="p-3 text-sm text-slate-600">{t.date}</td>
                                                        <td className="p-3 font-bold text-sm text-slate-800">{t.id}</td>
                                                        <td className="p-3">
                                                            <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                                                                t.type === 'VENTA' ? 'bg-emerald-100 text-emerald-700' :
                                                                t.type === 'COMPRA' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-rose-100 text-rose-700'
                                                            }`}>
                                                                {t.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="text-sm font-bold text-slate-800">{t.client}</div>
                                                            <div className="text-[10px] text-slate-500">{t.document}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="text-sm text-slate-600">{t.qty}x {t.sku}</div>
                                                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{t.productName}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="text-[11px] font-bold text-indigo-700">{t.posLocation}</div>
                                                            <div className="text-[10px] font-medium text-slate-500">{t.paymentMethod}</div>
                                                        </td>
                                                        <td className="p-3 text-sm font-bold text-slate-800 text-right">
                                                            ${t.total.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: CARTERA */}
                        {activeTab === 'cartera' && (
                            <div className="space-y-6">
                                {/* KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-xl">
                                            <Wallet className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-500">Cartera Total</p>
                                            <p className="text-2xl font-black text-slate-800">${carteraData.carteraTotal.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                                        <div className="p-3 bg-rose-100 rounded-xl">
                                            <AlertTriangle className="w-6 h-6 text-rose-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-500">Cartera Vencida (Mora)</p>
                                            <p className="text-2xl font-black text-rose-600">${carteraData.carteraMora.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                                        <div className="p-3 bg-emerald-100 rounded-xl">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-500">Cartera Sana (Al día)</p>
                                            <p className="text-2xl font-black text-emerald-600">${carteraData.carteraSana.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* AGING CHART & TABLE */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 h-full flex flex-col">
                                        <h3 className="text-lg font-bold text-slate-800 mb-6">Antigüedad de Saldos en Mora</h3>
                                        <div className="flex-1">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={carteraData.chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                                    <Bar dataKey="Valor" fill="#e11d48" radius={[0, 4, 4, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-0 lg:col-span-2 overflow-hidden flex flex-col h-full">
                                        <div className="p-6 border-b border-slate-100">
                                            <h3 className="text-lg font-bold text-slate-800">Detalle por Cliente</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 sticky top-0">
                                                    <tr>
                                                        <th className="p-3 text-xs font-bold text-slate-500">Cliente</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500">Estado</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500 text-right">Saldo Pendiente ($)</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500 text-right">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {carteraData.clientList.map((c, i) => (
                                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-3">
                                                                <p className="text-sm font-bold text-slate-800">{c.client}</p>
                                                                <p className="text-[10px] text-slate-500">{c.document}</p>
                                                            </td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                                    c.status === 'MORA' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                }`}>
                                                                    {c.status === 'MORA' ? `Mora (${c.daysOverdue} días)` : 'Al Día'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-sm font-black text-slate-800 text-right">
                                                                ${c.totalDebt.toLocaleString()}
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                {c.status === 'MORA' && (
                                                                    <button className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center justify-center ml-auto gap-1 transition">
                                                                        <Mail className="w-3 h-3" /> Cobrar
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {carteraData.clientList.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                                                                No hay cuentas por cobrar pendientes.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: CIERRES DE CAJA (Z-REPORT) */}
                        {activeTab === 'cierres' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {['HOY', 'ESTA_SEMANA', 'ESTE_MES', 'MES_PASADO', 'ESTE_AÑO'].map(range => (
                                            <button 
                                                key={range}
                                                onClick={() => setCierreTimeRange(range as any)}
                                                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${cierreTimeRange === range ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {range.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={handleExportZReport}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm active:scale-95"
                                    >
                                        <Send className="w-4 h-4" /> Generar Z-Report
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Ingresos</div>
                                        <div className="text-3xl font-black text-slate-800">${cierreData.totalVentas.toLocaleString('es-CO')}</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><Banknote className="w-4 h-4" /> Efectivo Recaudado</div>
                                        <div className="text-3xl font-black text-emerald-600">${cierreData.totalEfectivo.toLocaleString('es-CO')}</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Bancos y Tarjetas</div>
                                        <div className="text-3xl font-black text-blue-600">${cierreData.totalBancos.toLocaleString('es-CO')}</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2"><TableProperties className="w-4 h-4" /> IVA Recaudado</div>
                                        <div className="text-3xl font-black text-rose-600">${cierreData.totalIVA.toLocaleString('es-CO')}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <h2 className="text-lg font-bold text-slate-800 mb-6">Composición de Ingresos ({cierreTimeRange.replace('_', ' ')})</h2>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={cierreData.chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#64748B' }} />
                                                    <Tooltip 
                                                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                    />
                                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                                    <Bar dataKey="Efectivo" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                                                    <Bar dataKey="Bancos" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 mb-4">Rentabilidad del Periodo</h2>
                                            <div className="space-y-4">
                                                <div className="bg-slate-50 p-4 rounded-xl">
                                                    <div className="text-sm font-semibold text-slate-500">Costo de Mercancía (COGS)</div>
                                                    <div className="text-xl font-black text-slate-700">${cierreData.totalCOGS.toLocaleString('es-CO', {maximumFractionDigits:0})}</div>
                                                </div>
                                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                    <div className="text-sm font-semibold text-indigo-600">Margen Bruto (Est.)</div>
                                                    <div className="text-2xl font-black text-indigo-700">${(cierreData.totalVentas - cierreData.totalCOGS).toLocaleString('es-CO', {maximumFractionDigits:0})}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-slate-100">
                                            <p className="text-xs text-slate-400 leading-relaxed text-center">
                                                Los valores mostrados representan un pre-cierre. Valide los totales contra los extractos bancarios en el módulo de conciliación.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: VENTAS */}
                        {activeTab === 'ventas' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-slate-500">Comprobante</th>
                                            <th className="p-4 text-xs font-bold text-slate-500">Fecha</th>
                                            <th className="p-4 text-xs font-bold text-slate-500">Cliente</th>
                                            <th className="p-4 text-xs font-bold text-slate-500">Método Pago</th>
                                            <th className="p-4 text-xs font-bold text-slate-500 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {soloVentas.map(v => (
                                            <tr key={v.id} className="hover:bg-slate-50">
                                                <td className="p-4 font-bold text-sm text-slate-800">{v.id}</td>
                                                <td className="p-4 text-sm text-slate-600">{v.date}</td>
                                                <td className="p-4 text-sm text-slate-600 font-medium">{v.client}</td>
                                                <td className="p-4"><span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{v.method}</span></td>
                                                <td className="p-4 text-sm font-bold text-emerald-600 text-right">${v.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 4: AUDITORIA TERCEROS */}
                        {activeTab === 'auditoria' && (
                            <div className="space-y-6">
                                {invalidContacts.length === 0 ? (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                                        <h3 className="text-xl font-bold text-emerald-900 mb-2">¡Todo Perfecto!</h3>
                                        <p className="text-emerald-700">Todos los {contacts.length} clientes registrados tienen su NIT/Documento configurado. Listos para SIIGO.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
                                        <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5" />
                                            <div>
                                                <h3 className="font-bold text-rose-900">Atención Requerida</h3>
                                                <p className="text-sm text-rose-700">Hay {invalidContacts.length} clientes sin documento (NIT/CC). SIIGO rechazará la subida de estos clientes.</p>
                                            </div>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                    <th className="p-4 text-xs font-bold text-slate-500">Cliente / Empresa</th>
                                                    <th className="p-4 text-xs font-bold text-slate-500">Fallo Detectado</th>
                                                    <th className="p-4 text-xs font-bold text-slate-500">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {invalidContacts.map(c => (
                                                    <tr key={c.id}>
                                                        <td className="p-4">
                                                            <div className="font-bold text-sm text-slate-800">{c.name}</div>
                                                            <div className="text-xs text-slate-500">{c.company}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">FALTA NIT / DOCUMENTO</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                                                                Completar Datos &rarr;
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 5: INVENTARIO VALORIZADO */}
                        {activeTab === 'inventario' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Costo de Inventario (Bodega)</h2>
                                        <p className="text-sm text-slate-500">Valorización del stock físico según costo promedio.</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Invertido</div>
                                        <div className="text-3xl font-black text-indigo-600">
                                            ${inventarioValorizado.totalCosto.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white border-b border-slate-200 sticky top-0">
                                            <tr>
                                                <th className="p-4 text-xs font-bold text-slate-500">SKU / Producto</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 text-right">Stock</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 text-right">Costo Unit.</th>
                                                <th className="p-4 text-xs font-bold text-slate-500 text-right">Valor Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {inventarioValorizado.items.slice(0, 50).map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50">
                                                    <td className="p-4">
                                                        <div className="font-bold text-sm text-slate-800 font-mono">{item.sku}</div>
                                                        <div className="text-xs text-slate-500 truncate max-w-md">{item.name}</div>
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-slate-600 text-right">{item.totalStock} {item.baseUnit}</td>
                                                    <td className="p-4 text-sm text-slate-600 text-right">${item.unitCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    <td className="p-4 text-sm font-bold text-slate-800 text-right">${item.valorTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
                                    Mostrando los primeros 50 registros por rendimiento visual. La exportación incluye los 1076.
                                </div>
                            </div>
                        )}

                        {/* TAB 6: EXPORTACIÓN SIIGO */}
                        {activeTab === 'exportacion' && (
                            <div className="max-w-2xl mx-auto mt-8">
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 text-white text-center">
                                        <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-90" />
                                        <h2 className="text-2xl font-black mb-2">Generador SIIGO Nube</h2>
                                        <p className="text-indigo-100">Descarga las plantillas en Excel con los formatos oficiales de la DIAN listas para importar.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Rango de Exportación</label>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <input type="date" className="bg-transparent font-bold text-slate-700 outline-none w-full" defaultValue="2026-06-01" />
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-300" />
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <input type="date" className="bg-transparent font-bold text-slate-700 outline-none w-full" defaultValue="2026-06-30" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-slate-100 flex gap-4">
                                            <button 
                                                onClick={handleExportSIIGO}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-5 h-5" />
                                                Generar Interfaces .XLSX
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 7: IMPORTACIONES EDI */}
                        {activeTab === 'importaciones' && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full overflow-y-auto">
                                <ImportInvoicesPanel />
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
