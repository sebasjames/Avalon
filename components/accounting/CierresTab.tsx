// @ts-nocheck
import React from 'react';
import { DollarSign, Wallet, Banknote, CreditCard, TableProperties, FileSpreadsheet, Calendar, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

export interface CierresTabProps {
    cierreTimeRange: 'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'MES_PASADO' | 'ESTE_AÑO' | 'PERSONALIZADO';
    setCierreTimeRange: (range: 'HOY' | 'ESTA_SEMANA' | 'ESTE_MES' | 'MES_PASADO' | 'ESTE_AÑO' | 'PERSONALIZADO') => void;
    cierreDateFrom: string;
    setCierreDateFrom: (date: string) => void;
    cierreDateTo: string;
    setCierreDateTo: (date: string) => void;
    showZReport: boolean;
    setShowZReport: (show: boolean) => void;
    cierreData: any;
    handleExportZReport: () => void;
}

export const CierresTab: React.FC<CierresTabProps> = ({
    cierreTimeRange,
    setCierreTimeRange,
    cierreDateFrom,
    setCierreDateFrom,
    cierreDateTo,
    setCierreDateTo,
    showZReport,
    setShowZReport,
    cierreData,
    handleExportZReport
}) => {
    return (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {['HOY', 'ESTA_SEMANA', 'ESTE_MES', 'MES_PASADO', 'ESTE_AÑO', 'PERSONALIZADO'].map(range => (
                                            <button 
                                                key={range}
                                                onClick={() => setCierreTimeRange(range as any)}
                                                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${cierreTimeRange === range ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {range.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                    {cierreTimeRange === 'PERSONALIZADO' && (
                                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                            <Calendar className="w-4 h-4 ml-2 text-slate-500" />
                                            <input type="date" value={cierreDateFrom} onChange={e => setCierreDateFrom(e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white" />
                                            <span className="text-slate-500 text-sm font-medium">a</span>
                                            <input type="date" value={cierreDateTo} onChange={e => setCierreDateTo(e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white mr-1" />
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setShowZReport(!showZReport)}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm active:scale-95"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" /> {showZReport ? 'Ocultar Z-Report' : 'Generar Z-Report'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showZReport && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="relative bg-slate-200/50 p-8 rounded-2xl border border-slate-200 mt-4 mb-8 flex justify-center overflow-x-auto shadow-inner">
                                                {/* Hoja A4 */}
                                                <div 
                                                    className="bg-white shadow-xl flex flex-col justify-between print:shadow-none print:m-0 shrink-0"
                                                    style={{ 
                                                        width: '210mm', 
                                                        minHeight: '297mm', 
                                                        padding: '20mm',
                                                        margin: '0 auto'
                                                    }}
                                                >
                                                    <div className="space-y-6">
                                                        {/* Header */}
                                                        <div className="text-center border-b-[3px] border-slate-800 pb-6 mb-8">
                                                            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">PROCOQUINAL S.A.S</h1>
                                                            <h2 className="text-xl font-bold text-slate-500 mt-2">REPORTE Z - CIERRE DE CAJA</h2>
                                                            <div className="mt-6 flex justify-center gap-12 text-sm font-medium text-slate-600">
                                                                <div><span className="font-bold text-slate-800">Emisión:</span> {new Date().toLocaleString('es-CO')}</div>
                                                                <div><span className="font-bold text-slate-800">Periodo:</span> {cierreTimeRange.replace('_', ' ')}</div>
                                                            </div>
                                                        </div>

                                                        {/* Resumen General */}
                                                        <div className="border border-slate-300 p-6 bg-slate-50/50">
                                                            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4 text-slate-800" /> Resumen de Ingresos
                                                            </h3>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <div className="text-center">
                                                                    <div className="text-xs font-bold text-slate-500 uppercase">Total Ventas</div>
                                                                    <div className="text-xl font-black text-slate-800">${cierreData.totalVentas.toLocaleString('es-CO')}</div>
                                                                </div>
                                                                <div className="text-center md:border-l border-slate-300">
                                                                    <div className="text-xs font-bold text-slate-500 uppercase">Total IVA</div>
                                                                    <div className="text-xl font-black text-slate-800">${cierreData.totalIVA.toLocaleString('es-CO')}</div>
                                                                </div>
                                                                <div className="text-center md:border-l border-slate-300">
                                                                    <div className="text-xs font-bold text-slate-500 uppercase">Costo (COGS)</div>
                                                                    <div className="text-xl font-black text-slate-800">-${cierreData.totalCOGS.toLocaleString('es-CO', {maximumFractionDigits:0})}</div>
                                                                </div>
                                                                <div className="text-center md:border-l border-slate-300 bg-white shadow-sm py-2">
                                                                    <div className="text-xs font-bold text-slate-800 uppercase">Margen Bruto</div>
                                                                    <div className="text-xl font-black text-slate-800">${(cierreData.totalVentas - cierreData.totalCOGS).toLocaleString('es-CO', {maximumFractionDigits:0})}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Arqueo de Métodos de Pago */}
                                                        <div className="grid grid-cols-2 gap-6 mt-8">
                                                            <div className="border border-slate-300 p-6 bg-white">
                                                                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase flex items-center gap-2">
                                                                    <Wallet className="w-4 h-4 text-slate-800" /> Arqueo de Pagos
                                                                </h3>
                                                                <div className="space-y-2 mt-4">
                                                                    {Object.entries(cierreData.paymentMethodBreakdown).sort((a,b)=>(b[1] as number)-(a[1] as number)).map(([method, amount]) => (
                                                                        <div key={method} className="flex justify-between items-center py-2 border-b border-slate-100">
                                                                            <span className="text-sm text-slate-600">{method}</span>
                                                                            <span className="text-sm font-bold text-slate-800">${amount.toLocaleString('es-CO')}</span>
                                                                        </div>
                                                                    ))}
                                                                    <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-slate-800">
                                                                        <span className="text-sm font-bold text-slate-800">Total Recaudado</span>
                                                                        <span className="text-sm font-black text-slate-800">${cierreData.totalVentas.toLocaleString('es-CO')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Egresos / Caja Menor */}
                                                            <div className="border border-slate-300 p-6 bg-white flex flex-col justify-between">
                                                                <div>
                                                                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase flex items-center gap-2">
                                                                        <Banknote className="w-4 h-4 text-slate-800" /> Egresos & Caja Menor
                                                                    </h3>
                                                                    <div className="flex justify-between items-center py-2 mt-4">
                                                                        <span className="text-sm italic text-slate-500">Sin egresos registrados</span>
                                                                        <span className="text-sm font-mono text-slate-500">$0</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-slate-800">
                                                                    <span className="text-sm font-bold text-slate-800">Neto a Consignar</span>
                                                                    <span className="text-lg font-black text-slate-800">${cierreData.totalVentas.toLocaleString('es-CO')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Footer Firmas */}
                                                    <div className="mt-16 pt-8">
                                                        <div className="grid grid-cols-2 gap-16 mb-8 px-8">
                                                            <div className="border-t border-slate-800 pt-2 text-center">
                                                                <div className="text-sm font-bold text-slate-800">Preparado por</div>
                                                                <div className="text-xs text-slate-500">Firma Cajero / Analista</div>
                                                            </div>
                                                            <div className="border-t border-slate-800 pt-2 text-center">
                                                                <div className="text-sm font-bold text-slate-800">Revisado por</div>
                                                                <div className="text-xs text-slate-500">Firma Auditoría / Contabilidad</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest border-t border-slate-200 pt-4 mt-8">
                                                            Documento Oficial de Cierre - Valide totales contra extractos bancarios
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Floating Actions */}
                                                <div className="absolute top-8 right-8 flex flex-col gap-3 print:hidden">
                                                    <button className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-700 flex items-center justify-center gap-2 transition" onClick={() => window.print()}>
                                                        🖨️ Imprimir
                                                    </button>
                                                    <button className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition" onClick={handleExportZReport}>
                                                        <Download className="w-4 h-4"/> Excel
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
                                                    <div className="text-sm font-semibold text-indigo-600">Margen Bruto</div>
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
                        
    );
};
