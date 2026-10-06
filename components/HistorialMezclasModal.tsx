import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { KardexTransaction } from '../types';
import { 
    History, 
    Search, 
    X, 
    Beaker, 
    Package, 
    Scale, 
    Trash2, 
    ArrowDownRight, 
    ArrowUpRight, 
    Download, 
    Filter, 
    Calendar, 
    CheckCircle2, 
    SlidersHorizontal,
    Boxes,
    FileSpreadsheet,
    Clock,
    UserCheck,
    FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistorialMezclasModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HistorialMezclasModal: React.FC<HistorialMezclasModalProps> = ({ isOpen, onClose }) => {
    const { kardexTransactions, inventory } = useEnterprise();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedProductSku, setSelectedProductSku] = useState<string>('ALL');

    // Filter only transactions related to laboratory, mixing, pigments, or with operationType
    const labTransactions = useMemo(() => {
        return kardexTransactions.filter(tx => {
            const isLabOperation = !!tx.operationType;
            const isPigmentOrBase = tx.skuId.startsWith('PIGMENT-') || tx.skuId.startsWith('BASE-') || tx.user?.includes('Mezcla') || tx.user?.includes('Tintometría');
            return isLabOperation || isPigmentOrBase;
        });
    }, [kardexTransactions]);

    // Unique products present in lab transactions for the dropdown
    const availableProducts = useMemo(() => {
        const map = new Map<string, string>();
        labTransactions.forEach(tx => {
            if (!map.has(tx.skuId)) {
                map.set(tx.skuId, tx.productName || tx.skuId);
            }
        });
        return Array.from(map.entries()).map(([sku, name]) => ({ sku, name }));
    }, [labTransactions]);

    // Filtered transactions
    const filteredTransactions = useMemo(() => {
        return labTransactions.filter(tx => {
            // Text search
            const search = searchTerm.toLowerCase();
            const matchesSearch = 
                (tx.productName || '').toLowerCase().includes(search) ||
                tx.skuId.toLowerCase().includes(search) ||
                (tx.formulaName || '').toLowerCase().includes(search) ||
                (tx.documentRef || '').toLowerCase().includes(search) ||
                (tx.lotNumber || '').toLowerCase().includes(search) ||
                (tx.user || '').toLowerCase().includes(search);
            if (!matchesSearch) return false;

            // Type filter
            if (selectedType !== 'ALL') {
                if (tx.operationType !== selectedType) return false;
            }

            // Product filter
            if (selectedProductSku !== 'ALL') {
                if (tx.skuId !== selectedProductSku) return false;
            }

            return true;
        });
    }, [labTransactions, searchTerm, selectedType, selectedProductSku]);

    // Summary KPIs
    const totalGramsConsumed = useMemo(() => {
        return Math.abs(
            labTransactions
                .filter(tx => tx.operationType === 'CONSUMO_MEZCLA' && (tx.unit === 'GR' || !tx.unit))
                .reduce((acc, tx) => acc + (tx.quantity < 0 ? tx.quantity : 0), 0)
        );
    }, [labTransactions]);

    const totalLitersConsumed = useMemo(() => {
        return Math.abs(
            labTransactions
                .filter(tx => tx.operationType === 'CONSUMO_MEZCLA' && (tx.unit === 'LT' || tx.unit === 'L'))
                .reduce((acc, tx) => acc + (tx.quantity < 0 ? tx.quantity : 0), 0)
        );
    }, [labTransactions]);

    const totalOpenUnitsCount = useMemo(() => {
        return labTransactions.filter(tx => tx.operationType === 'APERTURA_ENVASE').length;
    }, [labTransactions]);

    const totalAdjustmentsCount = useMemo(() => {
        return labTransactions.filter(tx => tx.operationType === 'AJUSTE_BASCULA').length;
    }, [labTransactions]);

    // Export to CSV
    const handleExportCSV = () => {
        const headers = ['ID', 'Fecha', 'SKU', 'Producto', 'Tipo Operación', 'Cantidad', 'Unidad', 'Saldo Antes', 'Saldo Después', 'Orden/Lote', 'Fórmula', 'Responsable', 'Notas'];
        const rows = filteredTransactions.map(tx => [
            tx.id,
            tx.date,
            tx.skuId,
            `"${(tx.productName || tx.skuId).replace(/"/g, '""')}"`,
            tx.operationType || tx.type,
            tx.quantity,
            tx.unit || 'GR',
            tx.balanceBefore ?? '',
            tx.balanceAfter ?? '',
            tx.documentRef || tx.lotNumber,
            `"${(tx.formulaName || '').replace(/"/g, '""')}"`,
            `"${(tx.user || '').replace(/"/g, '""')}"`,
            `"${(tx.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `historial_consumos_mezclas_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200"
            >
                {/* Header */}
                <div className="p-6 pb-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
                            <History className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-900">Historial y Trazabilidad de Consumo</h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                    Kardex de Laboratorio
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Registro cronológico y detallado de cada gramo dosificado, destapes de envases y pesajes en báscula.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
                            title="Exportar registros a archivo Excel / CSV"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            Exportar CSV
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-4 bg-slate-50/80 border-b border-slate-200/80">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Gramos Dosificados</span>
                        <div className="text-xl font-black text-rose-600 mt-0.5">
                            {totalGramsConsumed.toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">g</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Consumidos en mezclas</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Litros de Base</span>
                        <div className="text-xl font-black text-indigo-600 mt-0.5">
                            {totalLitersConsumed.toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">L</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Bases y solventes usados</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Envases Destapados</span>
                        <div className="text-xl font-black text-purple-700 mt-0.5">
                            {totalOpenUnitsCount} <span className="text-xs font-bold text-slate-400">tarros</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Nuevas aperturas</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Ajustes / Balanza</span>
                        <div className="text-xl font-black text-amber-600 mt-0.5">
                            {totalAdjustmentsCount} <span className="text-xs font-bold text-slate-400">pesajes</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Control de tara y calibración</span>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="p-4 px-6 border-b border-slate-200 bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por pigmento, SKU, lote, orden, responsable..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        <select
                            value={selectedProductSku}
                            onChange={(e) => setSelectedProductSku(e.target.value)}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shrink-0"
                        >
                            <option value="ALL">Todos los Productos ({availableProducts.length})</option>
                            {availableProducts.map(p => (
                                <option key={p.sku} value={p.sku}>
                                    {p.sku} - {p.name.slice(0, 30)}
                                </option>
                            ))}
                        </select>

                        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                            <button
                                onClick={() => setSelectedType('ALL')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedType === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Todos ({labTransactions.length})
                            </button>
                            <button
                                onClick={() => setSelectedType('CONSUMO_MEZCLA')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedType === 'CONSUMO_MEZCLA' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Consumos
                            </button>
                            <button
                                onClick={() => setSelectedType('APERTURA_ENVASE')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedType === 'APERTURA_ENVASE' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Destapes
                            </button>
                            <button
                                onClick={() => setSelectedType('AJUSTE_BASCULA')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedType === 'AJUSTE_BASCULA' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Pesajes
                            </button>
                            <button
                                onClick={() => setSelectedType('VACIADO_ENVASE')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedType === 'VACIADO_ENVASE' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Vaciados
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detailed Transactions List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-slate-50/40">
                    {filteredTransactions.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center my-6">
                            <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-purple-100">
                                <History className="w-7 h-7" />
                            </div>
                            <h4 className="text-base font-bold text-slate-800">No se encontraron movimientos registrados</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                                Intenta cambiando los filtros o el término de búsqueda. Cada consumo o apertura generará una entrada aquí automáticamente.
                            </p>
                        </div>
                    ) : (
                        filteredTransactions.map((tx) => {
                            const isConsumo = tx.operationType === 'CONSUMO_MEZCLA';
                            const isApertura = tx.operationType === 'APERTURA_ENVASE';
                            const isAjuste = tx.operationType === 'AJUSTE_BASCULA';
                            const isVaciado = tx.operationType === 'VACIADO_ENVASE';

                            const unit = tx.unit || 'GR';

                            return (
                                <motion.div
                                    key={tx.id}
                                    layout
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                >
                                    {/* Left: Type Icon + Product + Operation Info */}
                                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                            isConsumo
                                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                : isApertura
                                                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                                    : isAjuste
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {isConsumo && <Beaker className="w-5 h-5" />}
                                            {isApertura && <Package className="w-5 h-5" />}
                                            {isAjuste && <Scale className="w-5 h-5" />}
                                            {isVaciado && <Trash2 className="w-5 h-5" />}
                                            {!tx.operationType && <History className="w-5 h-5" />}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                    {tx.skuId}
                                                </span>

                                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                    isConsumo
                                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                        : isApertura
                                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                            : isAjuste
                                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                                                }`}>
                                                    {isConsumo && '🧪 Consumo en Mezcla'}
                                                    {isApertura && '📦 Apertura de Envase'}
                                                    {isAjuste && '⚖️ Ajuste / Báscula'}
                                                    {isVaciado && '🗑️ Envase Vaciado'}
                                                    {!tx.operationType && tx.type}
                                                </span>

                                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {tx.date}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-slate-900 text-sm truncate" title={tx.productName || tx.skuId}>
                                                {tx.productName || tx.skuId}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                                                {tx.formulaName && (
                                                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                                        {tx.formulaName}
                                                    </span>
                                                )}
                                                {tx.documentRef && (
                                                    <span className="font-mono text-[11px] text-slate-500">
                                                        Doc: <strong className="text-slate-700">{tx.documentRef}</strong>
                                                    </span>
                                                )}
                                                {tx.user && (
                                                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                        <UserCheck className="w-3 h-3 text-slate-400" />
                                                        {tx.user}
                                                    </span>
                                                )}
                                            </div>

                                            {tx.notes && (
                                                <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                                                    "{tx.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Quantity & Balance Progression */}
                                    <div className="sm:text-right shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto border sm:border-0 border-slate-100 flex sm:flex-col justify-between items-center sm:items-end">
                                        <div>
                                            <div className={`text-base font-black flex items-center sm:justify-end gap-1 ${
                                                tx.quantity < 0 
                                                    ? 'text-rose-600' 
                                                    : tx.quantity > 0 
                                                        ? 'text-emerald-600' 
                                                        : 'text-slate-700'
                                            }`}>
                                                {tx.quantity < 0 ? (
                                                    <ArrowDownRight className="w-4 h-4" />
                                                ) : tx.quantity > 0 ? (
                                                    <ArrowUpRight className="w-4 h-4" />
                                                ) : null}
                                                {tx.quantity > 0 ? `+${tx.quantity.toLocaleString('es-CO')}` : tx.quantity.toLocaleString('es-CO')} {unit}
                                            </div>

                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Variación
                                            </span>
                                        </div>

                                        {(tx.balanceBefore !== undefined || tx.balanceAfter !== undefined) && (
                                            <div className="sm:mt-2 text-right">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                                    <span className="text-slate-400 font-mono">
                                                        {tx.balanceBefore !== undefined ? `${tx.balanceBefore.toLocaleString('es-CO')}${unit}` : '-'}
                                                    </span>
                                                    <span className="text-slate-400">➔</span>
                                                    <span className="font-bold text-slate-900 font-mono">
                                                        {tx.balanceAfter !== undefined ? `${tx.balanceAfter.toLocaleString('es-CO')}${unit}` : '-'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium block">
                                                    Saldo en Mesón
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <span>
                        Mostrando <strong className="text-slate-800">{filteredTransactions.length}</strong> de <strong className="text-slate-800">{labTransactions.length}</strong> movimientos registrados
                    </span>
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
