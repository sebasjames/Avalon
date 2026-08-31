import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, FileSpreadsheet, Download } from 'lucide-react';
import { AccountingTransaction } from '../../types';

export interface SabanaTabProps {
    handleExportSabana?: () => void;
    accountingShortcuts: string[];
    activeShortcutFilter: string;
    setActiveShortcutFilter: (val: string) => void;
    showFilters: boolean;
    setShowFilters: (val: boolean) => void;
    setShowExcelModal: (val: boolean) => void;
    handleExportExcel: () => void;
    draftFilters: any;
    setDraftFilters: (val: any) => void;
    appliedFilters: any;
    setAppliedFilters: (val: any) => void;
    initialFilterState: any;
    filteredSabana: AccountingTransaction[];
}

export const SabanaTab: React.FC<SabanaTabProps> = ({
    accountingShortcuts,
    activeShortcutFilter,
    setActiveShortcutFilter,
    showFilters,
    setShowFilters,
    setShowExcelModal,
    handleExportExcel,
    draftFilters,
    setDraftFilters,
    appliedFilters,
    setAppliedFilters,
    initialFilterState,
    filteredSabana
}) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-lg font-bold text-slate-800">Sábana de Movimientos</h2>
                                            
                                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                                <button
                                                    onClick={() => setActiveShortcutFilter('Todos')}
                                                    className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeShortcutFilter === 'Todos' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Todos
                                                </button>
                                                {accountingShortcuts?.map(shortcut => (
                                                    <button
                                                        key={shortcut}
                                                        onClick={() => setActiveShortcutFilter(shortcut)}
                                                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeShortcutFilter === shortcut ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        {shortcut}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowFilters(!showFilters)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition ${showFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                <Filter className="w-4 h-4" /> Filtros {showFilters ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                            <button 
                                                onClick={() => setShowExcelModal(true)}
                                                className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition"
                                                title="Ver movimientos en cuadrícula densa tipo Excel"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" /> Ver en Excel
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
                                                        <select value={draftFilters.type} onChange={e => setDraftFilters({...draftFilters, type: e.target.value as 'ALL' | 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA'})} className="w-full text-sm border-slate-200 rounded-lg">
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
    );
};
