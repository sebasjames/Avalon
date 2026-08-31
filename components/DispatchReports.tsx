import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { motion } from 'motion/react';
import { 
    BarChart3, History, CheckCircle2, AlertTriangle, 
    Clock, Truck, Search, Filter, TrendingUp
} from 'lucide-react';

type ViewMode = 'METRICS' | 'HISTORY';

export const DispatchReports: React.FC = () => {
    const { dispatches } = useEnterprise();
    const [viewMode, setViewMode] = useState<ViewMode>('METRICS');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Metrics calculations
    const metrics = useMemo(() => {
        const list = dispatches || [];
        const total = list.length;
        const delivered = list.filter(d => d.status === 'ENTREGADO').length;
        const failed = list.filter(d => d.status === 'ENTREGA_FALLIDA').length;
        const pending = total - delivered - failed;

        let onTime = 0;
        let delayed = 0;

        list.forEach(d => {
            if (d.status === 'ENTREGADO' && d.actualDeliveryDate) {
                const promised = new Date(d.promisedDate).getTime();
                const actual = new Date(d.actualDeliveryDate).getTime();
                if (actual <= promised) onTime++;
                else delayed++;
            }
        });

        const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
        const onTimeRate = delivered > 0 ? Math.round((onTime / delivered) * 100) : 0;

        return { total, delivered, failed, pending, onTime, delayed, successRate, onTimeRate };
    }, [dispatches]);

    // History filtering
    const filteredHistory = useMemo(() => {
        return (dispatches || []).filter(d => {
            if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
            
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchId = (d.id || '').toLowerCase().includes(searchLower);
                const matchDriver = (d.driver || '').toLowerCase().includes(searchLower);
                return matchId || matchDriver;
            }
            return true;
        });
    }, [dispatches, statusFilter, searchTerm]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ENTREGADO': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Entregado</span>;
            case 'ENTREGA_FALLIDA': return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">Fallida</span>;
            case 'EN_TRANSITO': return <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold">En Tránsito</span>;
            default: return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col p-4 md:px-8 md:pt-4 md:pb-8">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none z-0"></div>

            <div className="relative z-10 w-full">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-indigo-600" />
                            Informe de Despachos
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">Métricas logísticas y registro histórico</p>
                    </div>

                    <div className="flex bg-slate-200/70 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('METRICS')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                                viewMode === 'METRICS'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Métricas Generales
                        </button>
                        <button
                            onClick={() => setViewMode('HISTORY')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                                viewMode === 'HISTORY'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            <History className="w-4 h-4" />
                            Registro Histórico
                        </button>
                    </div>
                </header>

                {viewMode === 'METRICS' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl">
                                    <Truck className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                    Total
                                </span>
                            </div>
                            <h3 className="text-slate-500 text-sm font-bold mb-1">Volumen de Despachos</h3>
                            <p className="text-3xl font-black text-slate-900">{metrics.total}</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                            <h3 className="text-slate-500 text-sm font-bold mb-1">Tasa de Cumplimiento</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-slate-900">{metrics.successRate}%</p>
                                <span className="text-sm font-bold text-slate-400">({metrics.delivered} de {metrics.total})</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-sky-50 rounded-xl">
                                    <Clock className="w-6 h-6 text-sky-600" />
                                </div>
                            </div>
                            <h3 className="text-slate-500 text-sm font-bold mb-1">Entregas a Tiempo (SLA)</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-slate-900">{metrics.onTimeRate}%</p>
                                <span className="text-sm font-bold text-slate-400">({metrics.onTime} a tiempo)</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-rose-50 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                                </div>
                            </div>
                            <h3 className="text-slate-500 text-sm font-bold mb-1">Fallidas / Retrasos</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black text-slate-900">{metrics.failed + metrics.delayed}</p>
                                <span className="text-sm font-bold text-slate-400">incidentes</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]"
                    >
                        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                            <div className="relative w-full md:w-96">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por ID o Conductor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none w-full md:w-auto"
                                >
                                    <option value="ALL">Todos los Estados</option>
                                    <option value="PENDIENTE">Pendientes</option>
                                    <option value="ARMANDO_PEDIDO">Armando</option>
                                    <option value="EN_TRANSITO">En Tránsito</option>
                                    <option value="ENTREGADO">Entregados</option>
                                    <option value="ENTREGA_FALLIDA">Fallidos</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                                    <tr>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Despacho</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Promesa</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entrega Real</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Conductor / Vehículo</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredHistory.map(d => (
                                        <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 font-bold text-indigo-600">{d.id}</td>
                                            <td className="py-3 px-4">{getStatusBadge(d.status)}</td>
                                            <td className="py-3 px-4 text-sm font-medium text-slate-600">{new Date(d.promisedDate).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 text-sm font-medium text-slate-600">
                                                {d.actualDeliveryDate ? new Date(d.actualDeliveryDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                <div className="font-bold text-slate-700">{d.driver || 'No asignado'}</div>
                                                <div className="text-slate-400 text-xs">{d.vehicle || '-'}</div>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-slate-600">
                                                {d.items.reduce((acc, item) => acc + item.orderedQty, 0)} uds.
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                                No se encontraron despachos con los filtros actuales.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
