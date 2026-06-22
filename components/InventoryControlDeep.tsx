import React, { useState, useMemo } from 'react';
import { MOCK_INVENTORY, MOCK_TRANSFERS } from '../constants';
import { Batch, Product } from '../types';
import { AlertOctagon, AlertTriangle, ArrowRightLeft, Boxes, CalendarClock, DollarSign, ShieldAlert, Search } from 'lucide-react';

// Helper to calculate days difference
const getDaysDifference = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date(); // Assuming today is around March 2024 for mock data context, but using real date for logic
    // For visual consistency with mock data, let's assume "Today" is March 15, 2024 if using real dates makes the mock data look weird. 
    // However, for a real app, use: 
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
    productName: string;
    unitCost: number;
    category: string;
    aging: number;
    daysToExpiry: number;
    totalValue: number;
    freeStock: number;
    barcode?: string;
}

const FlagBadge = ({ type }: { type: 'SILENT' | 'EXPIRING' | 'OVERSTOCK' }) => {
    if (type === 'SILENT') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 mr-1"><CalendarClock className="w-3 h-3 mr-1"/> SILENCIOSO</span>
    }
    if (type === 'EXPIRING') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 mr-1"><ShieldAlert className="w-3 h-3 mr-1"/> CADUCANDO</span>
    }
    if (type === 'OVERSTOCK') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 mr-1"><Boxes className="w-3 h-3 mr-1"/> EXCESO</span>
    }
    return null;
}

export const InventoryControlDeep: React.FC = () => {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [orderBy, setOrderBy] = useState('risk_first');

    // 1. Flatten Data Structure for Table
    const rawBatches: FlattenedBatch[] = useMemo(() => {
        return MOCK_INVENTORY.flatMap(product => {
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
                    location: 'Principal'
                }];

            return batches.map(batch => {
                const aging = getAging(batch.dateIn);
                const daysToExpiry = getDaysToExpiry(batch.expiryDate);
                const isService = product.sku.toUpperCase().includes('SERV-');
                
                return {
                    ...batch,
                    productName: product.name || product.sku,
                    unitCost: product.unitCost || 0,
                    category: product.category || 'General',
                    aging,
                    daysToExpiry,
                    totalValue: isService ? 0 : batch.quantity * (product.unitCost || 0),
                    freeStock: batch.quantity - batch.reserved,
                    barcode: product.barcode
                };
            });
        });
    }, []);

    const flattenedBatches = useMemo(() => {
        let result = rawBatches.filter(batch => {
            const searchLower = search.toLowerCase();
            const matchesSearch = batch.productName.toLowerCase().includes(searchLower) || 
                                  (batch.skuId && batch.skuId.toLowerCase().includes(searchLower)) ||
                                  (batch.lotNumber && batch.lotNumber.toLowerCase().includes(searchLower)) ||
                                  (batch.barcode && batch.barcode.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;

            const isSilent = batch.aging > 90;
            const isExpiring = batch.daysToExpiry < 30;
            const isOverstock = batch.freeStock > 2000 && isSilent;

            if (filter === 'CADUCANDO') return isExpiring;
            if (filter === 'SILENCIOSO') return isSilent;
            if (filter === 'EXCESO') return isOverstock;

            return true;
        });

        result.sort((a, b) => {
            const isSilentA = a.aging > 90;
            const isExpiringA = a.daysToExpiry < 30;
            const isSilentB = b.aging > 90;
            const isExpiringB = b.daysToExpiry < 30;

            switch(orderBy) {
                case 'risk_first': {
                    if (isExpiringA && !isExpiringB) return -1;
                    if (!isExpiringA && isExpiringB) return 1;
                    if (isSilentA && !isSilentB) return -1;
                    if (!isSilentA && isSilentB) return 1;
                    return 0;
                }
                case 'expiry_asc': return a.daysToExpiry - b.daysToExpiry;
                case 'aging_desc': return b.aging - a.aging;
                case 'stock_desc': return b.quantity - a.quantity;
                case 'value_desc': return b.totalValue - a.totalValue;
                case 'loc_asc': return (a.location || '').localeCompare(b.location || '');
                default: return 0;
            }
        });

        return result;
    }, [rawBatches, search, filter, orderBy]);

    return (
        <div className="py-2 space-y-6">
            {/* Herramientas de Filtro y Búsqueda */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm flex flex-wrap items-center gap-3">
                <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden px-3 flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por SKU, Nombre o Lote..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2.5 bg-transparent text-sm font-medium text-slate-700 outline-none w-full placeholder:text-slate-400"
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
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">SKU / Info Lote</th>
                                <th className="px-4 py-3">Ubicación</th>
                                <th className="px-4 py-3 text-right">Antigüedad</th>
                                <th className="px-4 py-3 text-right">Caducidad</th>
                                <th className="px-4 py-3 text-right">Cant. Total</th>
                                <th className="px-4 py-3 text-right">Comprometido</th>
                                <th className="px-4 py-3 text-right">Stock Libre</th>
                                <th className="px-4 py-3 text-right">Capital Atado</th>
                                <th className="px-4 py-3 text-center">Alertas Auto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {flattenedBatches.map((batch) => {
                                const isSilent = batch.aging > 90;
                                const isExpiring = batch.daysToExpiry < 30; // Less than 30 days
                                const isOverstock = batch.freeStock > 2000 && isSilent;

                                return (
                                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{batch.productName}</div>
                                            <div className="text-xs text-slate-500 font-mono">
                                                {batch.skuId} • <span className="text-slate-700 font-semibold bg-slate-100 px-1 rounded">{batch.lotNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {batch.location}
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
                                        <td className="px-4 py-3 text-right text-slate-700">
                                            ${batch.totalValue.toLocaleString('es-CO')} COP COP
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col gap-1 items-center">
                                                {isSilent && <FlagBadge type="SILENT" />}
                                                {isExpiring && <FlagBadge type="EXPIRING" />}
                                                {isOverstock && <FlagBadge type="OVERSTOCK" />}
                                                {!isSilent && !isExpiring && !isOverstock && <span className="text-xs text-slate-300">-</span>}
                                            </div>
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

        </div>
    );
};