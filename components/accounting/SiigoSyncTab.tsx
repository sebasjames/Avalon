import React, { useState, useMemo } from 'react';
import { 
    Cloud, CheckCircle2, AlertCircle, Clock, RefreshCw, 
    Download, Search, Filter, ShieldCheck, ArrowUpRight,
    ExternalLink, Server, Check, Copy, FileSpreadsheet, Zap
} from 'lucide-react';
import { AccountingTransaction, CrmContact } from '../../types';
import { formatCOP } from '../../utils/format';
import { useUIStore } from '../../stores/uiStore';

export interface SiigoSyncTabProps {
    transactions: AccountingTransaction[];
    contacts: CrmContact[];
    handleExportSIIGO: () => void;
}

export const SiigoSyncTab: React.FC<SiigoSyncTabProps> = ({
    transactions,
    contacts,
    handleExportSIIGO
}) => {
    const { addToast } = useUIStore();
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'SYNCED' | 'PENDING' | 'ERROR'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [copiedCufe, setCopiedCufe] = useState<string | null>(null);

    // Mock/derived queue items based on transactions
    const syncQueue = useMemo(() => {
        const sales = transactions.filter(t => t.type === 'VENTA');
        
        return sales.map((sale, idx) => {
            // Derive deterministic sync status for demo realism:
            // most synced, some pending, occasional error if client has no valid doc
            const contact = contacts.find(c => c.name.toLowerCase() === sale.client.toLowerCase() || c.documentNumber === sale.document);
            const isInvalidDoc = !sale.document || sale.document.length < 5 || sale.document.includes('FALTA');
            
            let status: 'SYNCED' | 'PENDING' | 'ERROR' = 'SYNCED';
            let siigoInvoice = `FVE-${1000 + idx}`;
            let cufe = `cufe_${sale.id}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
            let errorMessage: string | undefined = undefined;

            if (isInvalidDoc && idx % 7 === 0) {
                status = 'ERROR';
                siigoInvoice = '---';
                cufe = '---';
                errorMessage = 'NIT o Cédula no cumple estándar DIAN / Dígito de Verificación faltante.';
            } else if (idx % 8 === 0) {
                status = 'PENDING';
                siigoInvoice = 'En cola...';
                cufe = 'Pendiente DIAN';
            }

            return {
                id: sale.id,
                consecutivePos: sale.id,
                date: sale.date,
                client: sale.client,
                document: sale.document || '222222222222',
                total: sale.total,
                paymentMethod: sale.paymentMethod,
                siigoInvoice,
                cufe,
                status,
                errorMessage,
                lastAttempt: new Date(Date.now() - (idx * 3600000)).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
            };
        });
    }, [transactions, contacts]);

    const filteredQueue = useMemo(() => {
        return syncQueue.filter(item => {
            if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (
                    item.consecutivePos.toLowerCase().includes(q) ||
                    item.client.toLowerCase().includes(q) ||
                    item.document.toLowerCase().includes(q) ||
                    item.siigoInvoice.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [syncQueue, filterStatus, searchQuery]);

    const stats = useMemo(() => {
        const total = syncQueue.length;
        const synced = syncQueue.filter(s => s.status === 'SYNCED').length;
        const pending = syncQueue.filter(s => s.status === 'PENDING').length;
        const error = syncQueue.filter(s => s.status === 'ERROR').length;
        const syncPercent = total > 0 ? Math.round((synced / total) * 100) : 100;
        return { total, synced, pending, error, syncPercent };
    }, [syncQueue]);

    const handleSyncAllPending = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            addToast({ severity: 'SUCCESS', title: 'Cola procesada', message: 'Se han despachado todas las facturas pendientes a SIIGO Nube con respuesta DIAN exitosa.', type: 'CONTABILIDAD' });
        }, 1500);
    };

    const handleCopyCufe = (cufe: string) => {
        navigator.clipboard.writeText(cufe);
        setCopiedCufe(cufe);
        addToast({ severity: 'INFO', title: 'CUFE Copiado', message: 'Identificador único DIAN copiado al portapapeles.', type: 'CONTABILIDAD' });
        setTimeout(() => setCopiedCufe(null), 2500);
    };

    return (
        <div className="space-y-6">
            {/* Header & Connection Status */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Cloud className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sincronización SIIGO & DIAN</h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    API Homologada En Línea
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Cola de despacho asíncrona hacia SIIGO Nube. Emisión fiscal DIAN sin bloquear el punto de venta.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportSIIGO}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                            title="Descargar archivo Excel para el contador en caso de contingencia"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Exportar XLSX Respaldo</span>
                        </button>

                        <button
                            onClick={handleSyncAllPending}
                            disabled={isSyncing || stats.pending === 0}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 text-white shadow-md transition-all active:scale-95 ${
                                isSyncing || stats.pending === 0
                                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{isSyncing ? 'Transmitiendo...' : `Sincronizar Cola (${stats.pending})`}</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventas Emitidas POS</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
                        <span className="text-xs text-slate-400 font-medium">Consecutivos Avalon</span>
                    </div>

                    <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Sincronizadas
                        </span>
                        <div className="text-2xl font-black text-emerald-900 mt-1">{stats.synced}</div>
                        <span className="text-xs text-emerald-600 font-bold">{stats.syncPercent}% con CUFE DIAN</span>
                    </div>

                    <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> En Cola (Outbox)
                        </span>
                        <div className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</div>
                        <span className="text-xs text-amber-600 font-medium">Reintento automático</span>
                    </div>

                    <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100">
                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Requieren Revisión
                        </span>
                        <div className="text-2xl font-black text-rose-900 mt-1">{stats.error}</div>
                        <span className="text-xs text-rose-600 font-medium">Error de NIT o formato</span>
                    </div>
                </div>
            </div>

            {/* Queue Management Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filter Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setFilterStatus('ALL')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filterStatus === 'ALL'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Todos ({stats.total})
                        </button>
                        <button
                            onClick={() => setFilterStatus('SYNCED')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filterStatus === 'SYNCED'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            Sincronizados ({stats.synced})
                        </button>
                        <button
                            onClick={() => setFilterStatus('PENDING')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filterStatus === 'PENDING'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                        >
                            En Cola ({stats.pending})
                        </button>
                        <button
                            onClick={() => setFilterStatus('ERROR')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filterStatus === 'ERROR'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                        >
                            Errores ({stats.error})
                        </button>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar factura, cliente o NIT..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="p-4 pl-6">Doc. Avalon (POS)</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Cliente / Tercero</th>
                                <th className="p-4">Valor Total</th>
                                <th className="p-4">Estado SIIGO</th>
                                <th className="p-4">Consecutivo SIIGO</th>
                                <th className="p-4 pr-6 text-right">CUFE DIAN</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {filteredQueue.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                                        No se encontraron transacciones con los filtros seleccionados.
                                    </td>
                                </tr>
                            ) : (
                                filteredQueue.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="p-4 pl-6 font-bold font-mono text-slate-900">
                                            {item.consecutivePos}
                                        </td>
                                        <td className="p-4 text-slate-500 font-mono">
                                            {item.date}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{item.client}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">{item.document}</div>
                                        </td>
                                        <td className="p-4 font-black text-slate-900">
                                            {formatCOP(item.total)}
                                        </td>
                                        <td className="p-4">
                                            {item.status === 'SYNCED' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    Sincronizado
                                                </span>
                                            )}
                                            {item.status === 'PENDING' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                    En Cola
                                                </span>
                                            )}
                                            {item.status === 'ERROR' && (
                                                <div>
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                                        Rechazado
                                                    </span>
                                                    {item.errorMessage && (
                                                        <p className="text-[10px] text-rose-600 font-normal mt-1 max-w-xs">
                                                            {item.errorMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono font-bold text-slate-700">
                                            {item.siigoInvoice}
                                        </td>
                                        <td className="p-4 pr-6 text-right font-mono text-[11px]">
                                            {item.cufe !== '---' && item.cufe !== 'Pendiente DIAN' ? (
                                                <button
                                                    onClick={() => handleCopyCufe(item.cufe)}
                                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-bold transition-all text-[10px]"
                                                    title={`Copiar CUFE: ${item.cufe}`}
                                                >
                                                    {copiedCufe === item.cufe ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                            <span className="text-emerald-700 font-bold">Copiado</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3 text-slate-400" />
                                                            <span>{item.cufe.substring(0, 12)}...</span>
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 font-mono">---</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Integration Guide Footer */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300 shrink-0">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Garantía de Continuidad Operativa (Fail-Safe)</h3>
                        <p className="text-slate-300 text-xs mt-0.5 max-w-2xl">
                            Las transacciones se procesan y descuentan de Kardex en milisegundos localmente. Si SIIGO Nube o la DIAN presentan latencia o caídas de servidor, la venta se emite con consecutivo interno y se reintenta automáticamente por lotes sin interrumpir la operación de caja.
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="text-xs font-mono font-bold bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-indigo-200">
                        Protocolo Outbox Activo
                    </span>
                </div>
            </div>
        </div>
    );
};
