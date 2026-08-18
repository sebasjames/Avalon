import React, { useState, useMemo } from 'react';
import { MOCK_TRANSFERS } from '../constants';
import { Batch, Product, KardexTransaction } from '../types';
import { AlertOctagon, AlertTriangle, ArrowRightLeft, Boxes, CalendarClock, DollarSign, ShieldAlert, Search, History, X } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';

// Helper to calculate days difference
const getDaysDifference = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date(); 
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// Mock "Today" for consistent aging calculation with the static data
const MOCK_TODAY = new Date('2024-03-15');
const getAging = (dateIn: string) => {
    const date = new Date(dateIn);
    const diffTime = MOCK_TODAY.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getDaysToExpiry = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const diffTime = date.getTime() - MOCK_TODAY.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface FlattenedBatch extends Batch {
    productId: string;
    productName: string;
    unitCost: number;
    baseUnit: string;
    category: string;
    aging: number;
    daysToExpiry: number;
    totalValue: number;
    freeStock: number;
    barcode?: string;
    minStock: number;
}

const FlagBadge = ({ type }: { type: 'SILENT' | 'EXPIRING' | 'OVERSTOCK' | 'REORDER' }) => {
    if (type === 'SILENT') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 mr-1"><CalendarClock className="w-3 h-3 mr-1"/> SILENCIOSO</span>
    }
    if (type === 'EXPIRING') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 mr-1"><ShieldAlert className="w-3 h-3 mr-1"/> CADUCANDO</span>
    }
    if (type === 'OVERSTOCK') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 mr-1"><Boxes className="w-3 h-3 mr-1"/> EXCESO</span>
    }
    if (type === 'REORDER') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 mr-1"><AlertTriangle className="w-3 h-3 mr-1"/> REORDEN</span>
    }
    return null;
}

export const InventoryControlDeep: React.FC = () => {
    const { inventory, kardexTransactions, updateBatchStatus } = useEnterprise();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [orderBy, setOrderBy] = useState('risk_first');

    // Modal State
    const [historyModalBatch, setHistoryModalBatch] = useState<FlattenedBatch | null>(null);

    // 1. Flatten Data Structure for Table
    const rawBatches: FlattenedBatch[] = useMemo(() => {
        return inventory.flatMap(product => {
            const batches = product.batches && product.batches.length > 0 
                ? product.batches 
                : [{
                    id: `${product.id}-default`,
                    skuId: product.sku,
                    lotNumber: 'N/A',
                    dateIn: MOCK_TODAY.toISOString().split('T')[0],
                    expiryDate: new Date(MOCK_TODAY.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    quantity: product.totalStock || 0,
                    reserved: product.reservedStock || 0,
                    location: 'Principal',
                    status: 'Disponible' as const
                }];

            return batches.map(batch => {
                const aging = getAging(batch.dateIn);
                const daysToExpiry = getDaysToExpiry(batch.expiryDate);
                const isService = product.sku.toUpperCase().includes('SERV-');
                const rawFree = batch.quantity - batch.reserved;
                const freeStock = (batch.status === 'Cuarentena' || batch.status === 'Retenido') ? 0 : rawFree;

                return {
                    ...batch,
                    productId: product.id,
                    productName: product.name || product.sku,
                    unitCost: product.unitCost || 0,
                    baseUnit: product.baseUnit || 'UND',
                    minStock: product.minStock || 0,
                    category: product.category || 'General',
                    aging,
                    daysToExpiry,
                    totalValue: isService ? 0 : batch.quantity * (product.unitCost || 0),
                    freeStock,
                    barcode: product.barcode
                };
            });
        });
    }, [inventory]);

    const flattenedBatches = useMemo(() => {
        let result = rawBatches.filter(batch => {
            const searchLower = search.toLowerCase();
            const matchesSearch = batch.productName.toLowerCase().includes(searchLower) || 
                                  (batch.skuId && batch.skuId.toLowerCase().includes(searchLower)) ||
                                  (batch.lotNumber && batch.lotNumber.toLowerCase().includes(searchLower)) ||
                                  (batch.location && batch.location.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;

            if (filter === 'CADUCANDO') return batch.daysToExpiry < 30;
            if (filter === 'SILENCIOSO') return batch.aging > 90;
            if (filter === 'EXCESO') return batch.freeStock > 2000 && batch.aging > 90;
            if (filter === 'REORDEN') return batch.freeStock < batch.minStock;

            return true;
        });

        // Sorting
        result.sort((a, b) => {
            if (orderBy === 'expiry_asc') return a.daysToExpiry - b.daysToExpiry;
            if (orderBy === 'aging_desc') return b.aging - a.aging;
            if (orderBy === 'stock_desc') return b.quantity - a.quantity;
            if (orderBy === 'value_desc') return b.totalValue - a.totalValue;
            if (orderBy === 'loc_asc') return a.location.localeCompare(b.location);
            
            // risk_first
            const aRisk = (a.daysToExpiry < 30 ? 1000 : 0) + (a.freeStock < a.minStock ? 500 : 0) + (a.aging > 90 ? 100 : 0);
            const bRisk = (b.daysToExpiry < 30 ? 1000 : 0) + (b.freeStock < b.minStock ? 500 : 0) + (b.aging > 90 ? 100 : 0);
            return bRisk - aRisk;
        });

        return result;
    }, [rawBatches, search, filter, orderBy]);

    // Derived metrics
    const totalInventoryValue = flattenedBatches.reduce((sum, b) => sum + b.totalValue, 0);
    const expiringBatchesCount = flattenedBatches.filter(b => b.daysToExpiry < 30).length;
    const overstockBatchesCount = flattenedBatches.filter(b => b.freeStock > 2000 && b.aging > 90).length;

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            
            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Capital Atado</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalInventoryValue.toLocaleString('es-CO')}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign className="w-5 h-5"/></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-rose-600 uppercase">Lotes Caducando</p>
                            <h3 className="text-2xl font-bold text-rose-700 mt-1">{expiringBatchesCount}</h3>
                        </div>
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ShieldAlert className="w-5 h-5"/></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Lotes en Exceso</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{overstockBatchesCount}</h3>
                        </div>
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Boxes className="w-5 h-5"/></div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por SKU, Nombre o Lote..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-3 py-2.5 bg-white border border-slate-200 text-sm font-medium text-slate-700 outline-none rounded-xl w-full shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl outline-none shadow-sm h-[42px]"
                >
                    <option value="ALL">Alertas: Todas</option>
                    <option value="CADUCANDO">Caducando (&lt;30 días)</option>
                    <option value="SILENCIOSO">Silencioso (&gt;90 días)</option>
                    <option value="EXCESO">Exceso de Stock</option>
                    <option value="REORDEN">Punto de Reorden</option>
                </select>

                <select 
                    value={orderBy} 
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl outline-none shadow-sm h-[42px]"
                >
                    <option value="risk_first">Orden: Priorizar Riesgos</option>
                    <option value="expiry_asc">Orden: Caducidad (Próximos)</option>
                    <option value="aging_desc">Orden: Antigüedad (Mayor)</option>
                    <option value="stock_desc">Orden: Mayor Stock total</option>
                    <option value="value_desc">Orden: Capital Atado</option>
                    <option value="loc_asc">Orden: Ubicación</option>
                </select>
            </div>

            {/* BATCH CONTROL TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                        <Boxes className="w-4 h-4 mr-2 text-blue-600"/> Inventario por Lote ({flattenedBatches.length})
                    </h3>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left relative">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3">SKU / Lote</th>
                                <th className="px-4 py-3">Estado Lote</th>
                                <th className="px-4 py-3 text-right">UoM / Costo</th>
                                <th className="px-4 py-3 text-right">Antigüedad</th>
                                <th className="px-4 py-3 text-right">Caducidad</th>
                                <th className="px-4 py-3 text-right">Cant. Total</th>
                                <th className="px-4 py-3 text-right">Compr.</th>
                                <th className="px-4 py-3 text-right">Stock Libre</th>
                                <th className="px-4 py-3 text-right">Minimo Stock</th>
                                <th className="px-4 py-3 text-right">Capital Atado</th>
                                <th className="px-4 py-3 text-center">Alertas Auto</th>
                                <th className="px-4 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {flattenedBatches.map((batch) => {
                                const isSilent = batch.aging > 90;
                                const isExpiring = batch.daysToExpiry < 30; // Less than 30 days
                                const isOverstock = batch.freeStock > 2000 && isSilent;
                                const isReorder = batch.freeStock < batch.minStock;

                                return (
                                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{batch.productName}</div>
                                            <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-1">
                                                {batch.skuId}
                                                <span className="text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                    {batch.lotNumber}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-1">{batch.location}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select 
                                                value={batch.status || 'Disponible'}
                                                onChange={(e) => updateBatchStatus(batch.productId, batch.id, e.target.value as any)}
                                                className={`text-xs font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                                                    batch.status === 'Cuarentena' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    batch.status === 'Retenido' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}
                                            >
                                                <option value="Disponible">Disponible</option>
                                                <option value="Cuarentena">Cuarentena</option>
                                                <option value="Retenido">Retenido</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-bold text-slate-700">{batch.baseUnit}</div>
                                            <div className="text-xs text-slate-500">${batch.unitCost.toLocaleString('es-CO')}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className={`font-mono ${isSilent ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                                                {batch.aging} días
                                            </div>
                                            <div className="text-[10px] text-slate-400">Entrada: {batch.dateIn}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className={`font-mono ${isExpiring ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                                                {batch.daysToExpiry} días
                                            </div>
                                            <div className="text-[10px] text-slate-400">{batch.expiryDate}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                                            {batch.quantity.toLocaleString('es-CO')}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-500">
                                            {batch.reserved.toLocaleString('es-CO')}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                            {batch.freeStock.toLocaleString('es-CO')}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-500">
                                            {batch.minStock.toLocaleString('es-CO')}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-700">
                                            ${batch.totalValue.toLocaleString('es-CO')} COP
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                {isReorder && <FlagBadge type="REORDER" />}
                                                {isSilent && <FlagBadge type="SILENT" />}
                                                {isExpiring && <FlagBadge type="EXPIRING" />}
                                                {isOverstock && <FlagBadge type="OVERSTOCK" />}
                                                {!isReorder && !isSilent && !isExpiring && !isOverstock && <span className="text-xs text-slate-300">-</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => setHistoryModalBatch(batch)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver Kárdex (Historial)"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* INTERNAL TRANSFERS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                        <ArrowRightLeft className="w-4 h-4 mr-2 text-orange-600"/> Transferencias Internas (En Curso)
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                        {MOCK_TRANSFERS.length} Activas
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">ID Transf.</th>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3">Origen</th>
                                <th className="px-6 py-3">Destino</th>
                                <th className="px-6 py-3">Cant.</th>
                                <th className="px-6 py-3">Estatus</th>
                                <th className="px-6 py-3 text-right">ETA</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_TRANSFERS.map((transfer) => (
                                <tr key={transfer.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{transfer.id}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{transfer.productName}</td>
                                    <td className="px-6 py-4 text-slate-600">{transfer.fromLocation}</td>
                                    <td className="px-6 py-4 text-slate-600">{transfer.toLocation}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{transfer.quantity}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            transfer.status === 'En Tránsito' ? 'bg-blue-100 text-blue-700' : 
                                            transfer.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {transfer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500 text-xs">{transfer.eta}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* HISTORY MODAL (Kardex Ledger) */}
            {historyModalBatch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                    <History className="w-5 h-5 mr-2 text-blue-600" />
                                    Kárdex de Movimientos
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {historyModalBatch.productName} ({historyModalBatch.skuId}) • Lote: <span className="font-mono font-bold text-slate-700">{historyModalBatch.lotNumber}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => setHistoryModalBatch(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Tipo</th>
                                            <th className="px-4 py-3">Documento Ref.</th>
                                            <th className="px-4 py-3">Usuario</th>
                                            <th className="px-4 py-3 text-right">Cantidad</th>
                                            <th className="px-4 py-3 text-right">Saldo Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {kardexTransactions
                                            .filter(tx => tx.skuId === historyModalBatch.skuId && tx.lotNumber === historyModalBatch.lotNumber)
                                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                            .map(tx => (
                                            <tr key={tx.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{tx.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        tx.type === 'Entrada' ? 'bg-emerald-100 text-emerald-700' :
                                                        tx.type === 'Salida' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{tx.documentRef}</td>
                                                <td className="px-4 py-3 text-slate-600 text-xs">{tx.user}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {tx.quantity > 0 ? '+' : ''}{tx.quantity.toLocaleString('es-CO')}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-800">
                                                    {tx.balanceAfter.toLocaleString('es-CO')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};