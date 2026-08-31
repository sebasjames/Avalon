import React from 'react';

export interface VentasTabProps {
    setShowPaymentModal?: (v: boolean) => void;
    salesMethodFilter: string;
    setSalesMethodFilter: (method: string) => void;
    uniqueSalesPaymentMethods: string[];
    salesDateFrom: string;
    setSalesDateFrom: (date: string) => void;
    salesDateTo: string;
    setSalesDateTo: (date: string) => void;
    filteredSales: any[];
}

export const VentasTab: React.FC<VentasTabProps> = ({
    salesMethodFilter,
    setSalesMethodFilter,
    uniqueSalesPaymentMethods,
    salesDateFrom,
    setSalesDateFrom,
    salesDateTo,
    setSalesDateTo,
    filteredSales
}) => {
    return (
                            <div className="space-y-4">
                                {/* Filters Bar */}
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Método de Pago</label>
                                        <select 
                                            value={salesMethodFilter} 
                                            onChange={e => setSalesMethodFilter(e.target.value)} 
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        >
                                            <option value="ALL">Todos los métodos</option>
                                            {uniqueSalesPaymentMethods.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Desde</label>
                                        <input 
                                            type="date" 
                                            value={salesDateFrom} 
                                            onChange={e => setSalesDateFrom(e.target.value)} 
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Hasta</label>
                                        <input 
                                            type="date" 
                                            value={salesDateTo} 
                                            onChange={e => setSalesDateTo(e.target.value)} 
                                            className="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        />
                                    </div>
                                </div>

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
                                            {filteredSales.map(v => (
                                                <tr key={v.id} className="hover:bg-slate-50">
                                                    <td className="p-4 font-bold text-sm text-slate-800">{v.id}</td>
                                                    <td className="p-4 text-sm text-slate-600">{v.date}</td>
                                                    <td className="p-4 text-sm text-slate-600 font-medium">{v.client}</td>
                                                    <td className="p-4"><span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold">{v.paymentMethod}</span></td>
                                                    <td className="p-4 text-sm font-bold text-emerald-600 text-right">${v.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            {filteredSales.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                                                        No se encontraron ventas con los filtros aplicados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        
    );
};
