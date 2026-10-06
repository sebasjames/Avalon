import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { KardexTransaction, Product, Category } from '../types';
import { 
    TrendingDown, 
    AlertTriangle, 
    DollarSign, 
    Scale, 
    FileSpreadsheet, 
    Search, 
    Filter, 
    CheckCircle2, 
    AlertOctagon, 
    Clock, 
    UserCheck, 
    Plus, 
    X, 
    Check, 
    Layers, 
    PieChart, 
    Calendar,
    ArrowDownRight,
    Beaker
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCOP } from '../utils/format';

export const ControlMermasTab: React.FC = () => {
    const { kardexTransactions, inventory, updateLabStock, mezclaOrders } = useEnterprise();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
    const [manualIncidentModalOpen, setManualIncidentModalOpen] = useState(false);

    // Manual incident form state
    const [incidentSku, setIncidentSku] = useState('');
    const [incidentGrams, setIncidentGrams] = useState('');
    const [actualCanRemaining, setActualCanRemaining] = useState('');
    const [incidentReason, setIncidentReason] = useState('Residuo seco adherido a paredes del tarro');
    const [incidentOrder, setIncidentOrder] = useState('');

    // Selected product calculation helpers
    const selectedIncidentProduct = useMemo(() => {
        if (!incidentSku) return null;
        return inventory.find(p => p.sku === incidentSku || p.id === incidentSku) || null;
    }, [incidentSku, inventory]);

    const incidentProductStock = selectedIncidentProduct?.labStock || 0;
    const incidentProductUnit = selectedIncidentProduct?.baseUnit || 'GR';
    const incidentUnitCapacity = selectedIncidentProduct?.netWeightKg || selectedIncidentProduct?.netVolumeLiters || (incidentProductUnit === 'GR' ? 1000 : 20);
    const incidentUnitCost = selectedIncidentProduct?.unitCost || 35000;
    const incidentCostPerUnit = incidentUnitCapacity > 0 ? (incidentUnitCost / incidentUnitCapacity) : 35;

    const calculatedMerma = parseFloat(incidentGrams) || 0;
    const calculatedCostLoss = Math.round(calculatedMerma * incidentCostPerUnit);

    // Sync handlers
    const handleProductChange = (sku: string) => {
        setIncidentSku(sku);
        setIncidentGrams('');
        setActualCanRemaining('');
    };

    const handleMermaChange = (val: string) => {
        setIncidentGrams(val);
        if (!selectedIncidentProduct || val === '' || isNaN(parseFloat(val))) {
            setActualCanRemaining('');
            return;
        }
        const mermaVal = parseFloat(val);
        const remaining = Math.max(0, incidentProductStock - mermaVal);
        setActualCanRemaining(Number(remaining.toFixed(2)).toString());
    };

    const handleCanRemainingChange = (val: string) => {
        setActualCanRemaining(val);
        if (!selectedIncidentProduct || val === '' || isNaN(parseFloat(val))) {
            setIncidentGrams('');
            return;
        }
        const remainingVal = parseFloat(val);
        const merma = Math.max(0, incidentProductStock - remainingVal);
        setIncidentGrams(merma > 0 ? Number(merma.toFixed(2)).toString() : '0');
    };

    const handleSetEmptyCan = () => {
        if (!selectedIncidentProduct) return;
        setActualCanRemaining('0');
        setIncidentGrams(incidentProductStock.toString());
        setIncidentReason('Residuo seco adherido a paredes del tarro');
    };

    const { systemSettings } = useEnterprise();
    const TOLERANCE_PERCENT = systemSettings.production.wasteTolerancePercent;

    // Filter transactions that represent waste (Mermas: negative adjustments, canister scrapes, evaporation)
    const wasteTransactions = useMemo(() => {
        return kardexTransactions.filter(tx => {
            const isAjusteNegativo = (tx.operationType === 'AJUSTE_BASCULA' || tx.type === 'Ajuste') && tx.quantity < 0;
            const isVaciado = tx.operationType === 'VACIADO_ENVASE';
            const isExplicitMerma = tx.notes?.toLowerCase().includes('merma') || tx.formulaName?.toLowerCase().includes('merma');
            const isLabItem = tx.skuId.startsWith('PIGMENT-') || tx.skuId.startsWith('BASE-') || !!tx.operationType;

            return isLabItem && (isAjusteNegativo || isVaciado || isExplicitMerma);
        });
    }, [kardexTransactions]);

    // Calculate detailed waste item with costs
    const enrichedWasteData = useMemo(() => {
        return wasteTransactions.map(tx => {
            const product = inventory.find(p => p.sku === tx.skuId || p.id === tx.skuId);
            const unitCapacity = product?.netWeightKg || product?.netVolumeLiters || (product?.baseUnit === 'GR' ? 1000 : 20);
            const unitCost = product?.unitCost || 35000;
            const costPerUnit = unitCapacity > 0 ? (unitCost / unitCapacity) : 35;

            const lostQty = Math.abs(tx.quantity);
            const costLost = Math.round(lostQty * costPerUnit);

            return {
                ...tx,
                lostQty,
                unit: tx.unit || product?.baseUnit || 'GR',
                costLost,
                costPerUnit,
                productName: product?.name || tx.productName || tx.skuId
            };
        });
    }, [wasteTransactions, inventory]);

    // Filter by text search
    const filteredWaste = useMemo(() => {
        return enrichedWasteData.filter(item => {
            const search = searchTerm.toLowerCase();
            return (
                item.productName.toLowerCase().includes(search) ||
                item.skuId.toLowerCase().includes(search) ||
                (item.formulaName || '').toLowerCase().includes(search) ||
                (item.notes || '').toLowerCase().includes(search) ||
                (item.user || '').toLowerCase().includes(search)
            );
        });
    }, [enrichedWasteData, searchTerm]);

    // Financial & Volume Totals
    const totalCostLost = useMemo(() => {
        return enrichedWasteData.reduce((acc, curr) => acc + curr.costLost, 0);
    }, [enrichedWasteData]);

    const totalGramsLost = useMemo(() => {
        return enrichedWasteData
            .filter(item => item.unit === 'GR' || item.unit === 'g')
            .reduce((acc, curr) => acc + curr.lostQty, 0);
    }, [enrichedWasteData]);

    const totalLitersLost = useMemo(() => {
        return enrichedWasteData
            .filter(item => item.unit === 'LT' || item.unit === 'L' || item.unit === 'GL')
            .reduce((acc, curr) => acc + curr.lostQty, 0);
    }, [enrichedWasteData]);

    // Total material consumed in mixtures to compute global % waste
    const totalConsumedInMixes = useMemo(() => {
        return Math.abs(
            kardexTransactions
                .filter(tx => tx.operationType === 'CONSUMO_MEZCLA')
                .reduce((acc, tx) => acc + (tx.quantity < 0 ? tx.quantity : 0), 0)
        );
    }, [kardexTransactions]);

    const globalWastePercentage = useMemo(() => {
        const totalBase = totalConsumedInMixes + totalGramsLost;
        if (totalBase <= 0) return 0;
        return Number(((totalGramsLost / totalBase) * 100).toFixed(2));
    }, [totalConsumedInMixes, totalGramsLost]);

    // Waste by Product (Pareto)
    const wasteByProduct = useMemo(() => {
        const map = new Map<string, { sku: string; name: string; grams: number; cost: number; incidents: number }>();
        enrichedWasteData.forEach(item => {
            const existing = map.get(item.skuId) || {
                sku: item.skuId,
                name: item.productName,
                grams: 0,
                cost: 0,
                incidents: 0
            };
            existing.grams += item.lostQty;
            existing.cost += item.costLost;
            existing.incidents += 1;
            map.set(item.skuId, existing);
        });

        return Array.from(map.values()).sort((a, b) => b.cost - a.cost);
    }, [enrichedWasteData]);

    const highestWasteProduct = wasteByProduct[0] || null;

    // Export to CSV
    const handleExportCSV = () => {
        const headers = ['ID', 'Fecha', 'SKU', 'Producto', 'Cantidad Perdida', 'Unidad', 'Costo Perdido (COP)', 'Motivo', 'Responsable', 'Detalle'];
        const rows = filteredWaste.map(w => [
            w.id,
            w.date,
            w.skuId,
            `"${w.productName.replace(/"/g, '""')}"`,
            w.lostQty,
            w.unit,
            w.costLost,
            `"${(w.formulaName || 'Ajuste de báscula').replace(/"/g, '""')}"`,
            `"${(w.user || '').replace(/"/g, '""')}"`,
            `"${(w.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `reporte_mermas_tintometria_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Save manual incident with detailed audit metadata
    const handleSaveIncident = () => {
        if (!incidentSku || !selectedIncidentProduct) return;
        const merma = parseFloat(incidentGrams);
        if (isNaN(merma) || merma <= 0) return;

        const newLab = actualCanRemaining !== '' && !isNaN(parseFloat(actualCanRemaining))
            ? Math.max(0, parseFloat(actualCanRemaining))
            : Math.max(0, incidentProductStock - merma);

        updateLabStock(selectedIncidentProduct.sku, newLab, {
            documentRef: incidentOrder || 'MERMA-MANUAL',
            formulaName: `Merma: ${incidentReason}`,
            notes: `Merma registrada por báscula. Saldo anterior: ${incidentProductStock}${incidentProductUnit}, en envase: ${newLab}${incidentProductUnit}, merma: ${merma}${incidentProductUnit} (${formatCOP(calculatedCostLoss)}). Causa: ${incidentReason}.${incidentOrder ? ` [Ref: ${incidentOrder}]` : ''}`,
            user: 'Operador de Mesón'
        });

        setManualIncidentModalOpen(false);
        setIncidentSku('');
        setIncidentGrams('');
        setActualCanRemaining('');
        setIncidentOrder('');
        setIncidentReason('Residuo seco adherido a paredes del tarro');
    };

    return (
        <div className="p-6 bg-slate-50 min-h-full space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
                        <TrendingDown className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control y Auditoría de Mermas</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                globalWastePercentage <= TOLERANCE_PERCENT 
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                    : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}>
                                {globalWastePercentage <= TOLERANCE_PERCENT ? 'Tolerancia Óptima' : 'Alerta de Exceso'}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Seguimiento de desperdicio por diferencias de pesaje en báscula, adherencia en envases y evaporación.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Exportar Reporte
                    </button>
                    <button
                        onClick={() => setManualIncidentModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-600/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Registrar Merma / Incidente
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Total de Mermas</p>
                        <h3 className="text-2xl font-black text-rose-600 mt-1">
                            {formatCOP(totalCostLost)}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Impacto financiero en laboratorio</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gramos Perdidos</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                            {totalGramsLost.toLocaleString('es-CO')} <span className="text-sm font-bold text-slate-400">g</span>
                        </h3>
                        <p className="text-xs text-amber-600 font-medium mt-1">
                            {totalLitersLost > 0 ? `+ ${totalLitersLost.toFixed(1)} L de bases` : 'Diferencias registradas'}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                        <Scale className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">% Merma Global</p>
                        <h3 className={`text-2xl font-black mt-1 ${globalWastePercentage <= TOLERANCE_PERCENT ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {globalWastePercentage}%
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Límite permitido: <strong>{TOLERANCE_PERCENT}%</strong></p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        globalWastePercentage <= TOLERANCE_PERCENT 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                        {globalWastePercentage <= TOLERANCE_PERCENT ? (
                            <CheckCircle2 className="w-6 h-6" />
                        ) : (
                            <AlertTriangle className="w-6 h-6" />
                        )}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mayor Desperdicio</p>
                        <h3 className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1" title={highestWasteProduct?.name || 'N/A'}>
                            {highestWasteProduct ? highestWasteProduct.sku.replace('PIGMENT-', '') : 'Ninguno'}
                        </h3>
                        <p className="text-xs text-rose-600 font-bold mt-1">
                            {highestWasteProduct ? formatCOP(highestWasteProduct.cost) : '$0'}
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                        <Beaker className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Pareto Ranking Grid */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Ranking de Mermas por Materia Prima (Pareto de Costos)</h3>
                        <p className="text-xs text-slate-500">Distribución del valor económico perdido por producto</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                        {wasteByProduct.length} productos con merma registrada
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {wasteByProduct.map((item, idx) => {
                        const percentOfTotalCost = totalCostLost > 0 ? Math.round((item.cost / totalCostLost) * 100) : 0;
                        return (
                            <div key={item.sku} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                {item.sku}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm mt-1 line-clamp-1">{item.name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-rose-600">{formatCOP(item.cost)}</span>
                                        <span className="text-[11px] text-slate-400 font-medium block">
                                            {item.grams.toLocaleString('es-CO')}g perdidos ({item.incidents} registros)
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
                                    <div 
                                        className="h-full bg-rose-500 rounded-full"
                                        style={{ width: `${percentOfTotalCost}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-medium">
                                    <span>Representa el {percentOfTotalCost}% del costo total de mermas</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed Table / Audit List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">Detalle de Incidentes & Diferencias de Pesaje</h3>
                        <p className="text-xs text-slate-500">Auditoría completa evento por evento</p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por pigmento, SKU, lote..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4">Fecha / Hora</th>
                                <th className="py-3 px-4">Materia Prima</th>
                                <th className="py-3 px-4">Motivo / Causa</th>
                                <th className="py-3 px-4 text-right">Cantidad Perdida</th>
                                <th className="py-3 px-4 text-right">Costo Estimado</th>
                                <th className="py-3 px-4">Responsable / Lote</th>
                                <th className="py-3 px-4">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {filteredWaste.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-slate-400">
                                        No se encontraron registros de merma que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredWaste.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                                            {row.date}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mr-1.5">
                                                {row.skuId}
                                            </span>
                                            <span className="font-bold text-slate-900">{row.productName}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                {row.operationType === 'VACIADO_ENVASE' ? 'Envase Vaciado / Raspe' : 'Diferencia en Báscula'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-black text-rose-600 whitespace-nowrap">
                                            -{row.lostQty.toLocaleString('es-CO')} {row.unit}
                                        </td>
                                        <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                                            {formatCOP(row.costLost)}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                            {row.user || 'Operador de Mesón'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={row.notes || row.formulaName}>
                                            {row.notes || row.formulaName}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Registrar Merma / Incidente Manual */}
            <AnimatePresence>
                {manualIncidentModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
                        >
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Registrar Merma o Incidente</h3>
                                            <p className="text-xs text-slate-500">Reporte directo de pérdida en mesón</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setManualIncidentModalOpen(false)}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3.5">
                                    {/* 1. Producto Destapado */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Producto Afectado (Destapado en Mesón)
                                        </label>
                                        <select
                                            value={incidentSku}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                        >
                                            <option value="">Selecciona un producto destapado...</option>
                                            {inventory.filter(p => (p.labStock || 0) > 0).map(p => (
                                                <option key={p.sku} value={p.sku}>
                                                    {p.sku} — {p.name} ({p.labStock} {p.baseUnit || 'GR'} en mesón)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* System Info Banner if product selected */}
                                    {selectedIncidentProduct && (
                                        <div className="bg-slate-100/90 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
                                                    <Beaker className="w-4 h-4 text-rose-600" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo en Sistema</span>
                                                    <p className="font-extrabold text-slate-900 text-sm">
                                                        {incidentProductStock} <span className="text-xs font-semibold text-slate-500">{incidentProductUnit}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Costo Aprox</span>
                                                <p className="font-bold text-slate-700 text-xs">
                                                    ~{formatCOP(incidentCostPerUnit)} / {incidentProductUnit}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dual Fields: 1. Cantidad Merma, 2. Cantidad en Envase debajo */}
                                    <div className="space-y-3 bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100">
                                        {/* Cantidad de Merma / Desperdicio */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                                                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                                                    Cantidad de Merma / Desperdicio ({incidentProductUnit})
                                                </label>
                                                {calculatedMerma > 0 && (
                                                    <span className="text-[11px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                                                        Pérdida: {formatCOP(calculatedCostLoss)}
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                placeholder="Ej: 20.0"
                                                value={incidentGrams}
                                                onChange={(e) => handleMermaChange(e.target.value)}
                                                disabled={!selectedIncidentProduct}
                                                className="w-full px-4 py-2.5 bg-white border-2 border-rose-200 focus:border-rose-600 rounded-xl text-base font-black text-rose-900 focus:outline-none transition-all disabled:bg-slate-100 disabled:opacity-60"
                                            />
                                        </div>

                                        {/* Cantidad en Envase (debajo) */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                    <Scale className="w-3.5 h-3.5 text-blue-600" />
                                                    Cantidad en Envase (Peso actual en báscula — {incidentProductUnit})
                                                </label>
                                                {selectedIncidentProduct && incidentProductStock > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleSetEmptyCan}
                                                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-white hover:bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition-colors shadow-2xs"
                                                    >
                                                        Marcar vacío (0 {incidentProductUnit})
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0"
                                                placeholder={selectedIncidentProduct ? `Ej: ${incidentProductStock}` : 'Selecciona un producto primero'}
                                                value={actualCanRemaining}
                                                onChange={(e) => handleCanRemainingChange(e.target.value)}
                                                disabled={!selectedIncidentProduct}
                                                className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 focus:border-blue-600 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all disabled:bg-slate-100 disabled:opacity-60"
                                            />
                                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                <span className="font-semibold text-blue-600">💡 Tip:</span> 
                                                Si pesas el envase y anotas lo que queda, el sistema calcula automáticamente cuánto se perdió.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Real-time Calculation Summary Card */}
                                    {selectedIncidentProduct && calculatedMerma > 0 && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl border border-rose-200/80 text-xs flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2">
                                                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                                                <div>
                                                    <span className="font-bold text-rose-900">Merma detectada: {calculatedMerma} {incidentProductUnit}</span>
                                                    <p className="text-[11px] text-slate-600">
                                                        Quedarán en mesón: <strong className="text-slate-800">{actualCanRemaining || Math.max(0, incidentProductStock - calculatedMerma)} {incidentProductUnit}</strong>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-rose-500">Costo Desperdicio</span>
                                                <p className="font-black text-rose-700 text-sm">{formatCOP(calculatedCostLoss)}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Causa / Motivo */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Causa / Motivo del Incidente
                                        </label>
                                        <select
                                            value={incidentReason}
                                            onChange={(e) => setIncidentReason(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none"
                                        >
                                            <option value="Residuo seco adherido a paredes del tarro">Residuo seco adherido a paredes del tarro</option>
                                            <option value="Evaporación de solventes en mesón">Evaporación de solventes en mesón</option>
                                            <option value="Derrame accidental en dosificación">Derrame accidental en dosificación</option>
                                            <option value="Filtro o residuo de purga de manguera">Filtro o residuo de purga de manguera</option>
                                            <option value="Diferencia de tara de báscula">Diferencia de tara de báscula</option>
                                            <option value="Envase contaminado o dañado">Envase contaminado o dañado</option>
                                            <option value="Muestra de ajuste de color / descarte">Muestra de ajuste de color / descarte</option>
                                        </select>
                                    </div>

                                    {/* Lote / Orden Relacionada */}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                            Lote / Orden Relacionada (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            list="incident-orders-list"
                                            placeholder="Selecciona orden abierta o escribe lote (Ej: MZ-8821)"
                                            value={incidentOrder}
                                            onChange={(e) => setIncidentOrder(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                                        />
                                        <datalist id="incident-orders-list">
                                            {(mezclaOrders || []).map(o => (
                                                <option key={o.id} value={`${o.id} — ${o.recipeName || o.baseName || o.clientName || 'Mezcla'}`}>
                                                    {o.customerName || o.clientName ? `Cliente: ${o.customerName || o.clientName}` : o.status}
                                                </option>
                                            ))}
                                        </datalist>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setManualIncidentModalOpen(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveIncident}
                                        disabled={!incidentSku || !incidentGrams || parseFloat(incidentGrams) <= 0}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        Guardar Merma {calculatedMerma > 0 ? `(${formatCOP(calculatedCostLoss)})` : ''}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

