import React, { useState, useMemo } from 'react';
import { MezclaOrder, MezclaStatus } from '../types';
import tintometriaData from '../data/tintometria_raw.json';
import { Clock, Beaker, CheckCircle, PackageCheck, AlertCircle, Play, History, KanbanSquare, List, Printer, Tag } from 'lucide-react';
import { LabelPreviewModal, MezclaLabelData } from './LabelPreviewModal';
import { PigmentContainerStickerModal } from './PigmentContainerStickerModal';
import { useEnterprise } from '../context/EnterpriseContext';


const extractFormula = (colorId: string, baseType?: string): Record<string, string> => {
    const upperId = colorId.toUpperCase();
    
    let tabsToSearch = Object.keys(tintometriaData);
    if (baseType && (tintometriaData as any)[baseType]) {
        tabsToSearch = [baseType]; // Restrict to the specific tab
    }

    for (const tabName of tabsToSearch) {
        const tabData = (tintometriaData as any)[tabName];
        if (!Array.isArray(tabData)) continue;
        
        const found = tabData.find(row => row && row['Colore']?.toString().toUpperCase() === upperId);
        if (found) {
            const cleanFormula: Record<string, string> = {};
            for (const [key, value] of Object.entries(found)) {
                if (key !== 'Colore' && key !== 'DATA MODIFICA' && value !== null && value !== '') {
                    cleanFormula[key] = String(value);
                }
            }
            return cleanFormula;
        }
    }
    return { 'Error': `Fórmula no encontrada${baseType ? ` en la tecnología ${baseType}` : ''}` };
};

// Mock inicial de órdenes (Simulando lo que vendría del POS/EnterpriseContext)
const MOCK_ORDERS: MezclaOrder[] = [
    {
        id: 'MZ-1001',
        saleId: 'POS-0991',
        clientName: 'Constructor S.A.',
        colorId: 'RAL 1000',
        baseSku: 'BASE-POLI-PST',
        baseName: 'Base Pastel Poliuretano',
        baseType: 'SOLVENTE INTERNO',
        formula: extractFormula('RAL 1000', 'SOLVENTE INTERNO'),
        status: MezclaStatus.PENDING,
        requestedAt: new Date().toISOString()
    },
    {
        id: 'MZ-1002',
        saleId: 'POS-0995',
        clientName: 'Taller El Rayo',
        colorId: 'RAL 3000',
        baseSku: 'BASE-ACR-INT',
        baseName: 'Base Intensa Acrílica',
        formula: extractFormula('RAL 3000'),
        status: MezclaStatus.IN_PROGRESS,
        requestedAt: new Date(Date.now() - 3600000).toISOString()
    }
];

export const MezclasTablero: React.FC = () => {
    const { addKardexTransaction, updateInventoryStock } = useEnterprise();
    const [orders, setOrders] = useState<MezclaOrder[]>(MOCK_ORDERS);
    const [view, setView] = useState<'KANBAN' | 'LISTA' | 'HISTORIAL'>('KANBAN');
    const [lastDeductionMessage, setLastDeductionMessage] = useState<string | null>(null);
    const [selectedLabelData, setSelectedLabelData] = useState<MezclaLabelData | null>(null);
    const [selectedContainerStickerOrder, setSelectedContainerStickerOrder] = useState<MezclaOrder | null>(null);

    const pending = orders.filter(o => o.status === MezclaStatus.PENDING);
    const inProgress = orders.filter(o => o.status === MezclaStatus.IN_PROGRESS);
    const ready = orders.filter(o => o.status === MezclaStatus.READY);

    const updateStatus = (id: string, newStatus: MezclaStatus) => {
        const orderToUpdate = orders.find(o => o.id === id);
        
        // Deduct raw materials and log in Kardex when transitioning to IN_PROGRESS ("Iniciar Mezcla en Planta")
        if (orderToUpdate && newStatus === MezclaStatus.IN_PROGRESS && orderToUpdate.status !== MezclaStatus.IN_PROGRESS) {
            const today = new Date().toISOString().split('T')[0];
            let itemsDeductedCount = 0;

            // 1. Deduct Base
            if (orderToUpdate.baseSku) {
                addKardexTransaction({
                    id: `TX-MZ-${Date.now()}-BASE`,
                    date: today,
                    skuId: orderToUpdate.baseSku,
                    lotNumber: `LOT-MZ-${orderToUpdate.id}`,
                    type: 'Salida',
                    quantity: 1,
                    balanceAfter: 0,
                    documentRef: orderToUpdate.id,
                    user: 'Operador de Planta (Mezclas)'
                });
                updateInventoryStock(orderToUpdate.baseSku, -1);
                itemsDeductedCount++;
            }

            // 2. Deduct Pigments/Formula Components
            if (orderToUpdate.formula) {
                Object.entries(orderToUpdate.formula).forEach(([code, qtyStr], idx) => {
                    if (code !== 'Error') {
                        const qtyGrams = parseFloat(qtyStr) || 1;
                        addKardexTransaction({
                            id: `TX-MZ-${Date.now()}-PIG-${idx}`,
                            date: today,
                            skuId: `PIGMENT-${code}`,
                            lotNumber: `LOT-PIG-${code}`,
                            type: 'Salida',
                            quantity: qtyGrams,
                            balanceAfter: 0,
                            documentRef: orderToUpdate.id,
                            user: 'Operador de Planta (Mezclas)'
                        });
                        updateInventoryStock(`PIGMENT-${code}`, -qtyGrams);
                        itemsDeductedCount++;
                    }
                });
            }

            setLastDeductionMessage(`✅ Lote ${orderToUpdate.id} iniciado en planta: Se descontaron ${itemsDeductedCount} materias primas (Base + Pigmentos) en Kardex.`);
            setTimeout(() => setLastDeductionMessage(null), 6000);
        }

        setOrders(prev => prev.map(o => {
            if (o.id === id) {
                return {
                    ...o, 
                    status: newStatus,
                    completedAt: newStatus === MezclaStatus.READY ? new Date().toISOString() : o.completedAt
                };
            }
            return o;
        }));
    };

    const OrderCard = ({ order }: { order: MezclaOrder }) => {
        const formulaEntries = Object.entries(order.formula);
        const hasError = formulaEntries.some(([k]) => k === 'Error');

        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{order.id}</h3>
                        <p className="text-sm text-slate-500">{order.clientName}</p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm">
                        Venta: {order.saleId}
                    </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Beaker className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-700">Preparación requerida</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                        Base: <span className="font-bold text-slate-800">{order.baseName}</span>
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-slate-600">Color ID:</span>
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 font-bold font-mono rounded-md border border-yellow-200 shadow-sm">
                            {order.colorId}
                        </span>
                    </div>

                    <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fórmula a inyectar</p>
                        {hasError ? (
                            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                {order.formula['Error']}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {formulaEntries.map(([tinta, cantidad]) => (
                                    <div key={tinta} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1">
                                        <span className="text-slate-600 font-medium">{tinta}</span>
                                        <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 rounded">{cantidad}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 mt-auto pt-2">
                    <button
                        onClick={() => setSelectedLabelData(order)}
                        title="Ver Etiqueta Térmica 8.5x11 cm & Dispensar"
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                    >
                        <Printer className="w-4 h-4 text-indigo-600" />
                        Etiqueta Producto Final
                    </button>
                    {(order.status === MezclaStatus.IN_PROGRESS || order.status === MezclaStatus.READY) && (
                        <button
                            onClick={() => setSelectedContainerStickerOrder(order)}
                            title="Imprimir Stickers con QR de Saldos Restantes en los Frascos de Pigmentos"
                            className="px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl flex items-center gap-1.5 transition-all text-xs cursor-pointer"
                        >
                            <Tag className="w-4 h-4 text-amber-600" />
                            Stickers Saldos Frascos
                        </button>
                    )}
                    {order.status === MezclaStatus.PENDING && (
                        <button 
                            onClick={() => updateStatus(order.id, MezclaStatus.IN_PROGRESS)}
                            className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all text-xs cursor-pointer"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Iniciar Mezcla
                        </button>
                    )}
                    {order.status === MezclaStatus.IN_PROGRESS && (
                        <button 
                            onClick={() => updateStatus(order.id, MezclaStatus.READY)}
                            className="flex-1 flex justify-center items-center gap-2 bg-emerald-500 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all text-xs cursor-pointer"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Marcar como Lista
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 w-full max-w-[1600px] mx-auto min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Laboratorio de Mezclas (KDS)
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Tablero de producción tintométrica en tiempo real.
                    </p>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
                    <button 
                        onClick={() => setView('KANBAN')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'KANBAN' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <KanbanSquare className="w-5 h-5" />
                        Tablero Activo
                    </button>
                    <button 
                        onClick={() => setView('LISTA')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'LISTA' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <List className="w-5 h-5" />
                        Lista Activas
                    </button>
                    <button 
                        onClick={() => setView('HISTORIAL')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'HISTORIAL' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History className="w-5 h-5" />
                        Historial
                    </button>
                </div>
            </div>

            {lastDeductionMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                    <span>{lastDeductionMessage}</span>
                    <button onClick={() => setLastDeductionMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-black text-sm">✕</button>
                </div>
            )}

            {view === 'KANBAN' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    {/* Columna Pendientes */}
                    <div className="flex flex-col bg-slate-100/50 rounded-[32px] border border-slate-200 overflow-hidden">
                        <div className="p-5 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                            <h2 className="font-bold text-slate-700 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Pendientes
                            </h2>
                            <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                                {pending.length}
                            </span>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                            {pending.map(order => <OrderCard key={order.id} order={order} />)}
                            {pending.length === 0 && <p className="text-slate-400 text-center mt-10 font-medium">No hay órdenes pendientes</p>}
                        </div>
                    </div>

                    {/* Columna En Proceso */}
                    <div className="flex flex-col bg-indigo-50/30 rounded-[32px] border border-indigo-100 overflow-hidden">
                        <div className="p-5 border-b border-indigo-100 bg-white/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                            <h2 className="font-bold text-indigo-700 flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-indigo-500 animate-pulse" />
                                En Proceso
                            </h2>
                            <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                                {inProgress.length}
                            </span>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                            {inProgress.map(order => <OrderCard key={order.id} order={order} />)}
                            {inProgress.length === 0 && <p className="text-indigo-300 text-center mt-10 font-medium">Libre de momento</p>}
                        </div>
                    </div>

                    {/* Columna Listas */}
                    <div className="flex flex-col bg-emerald-50/30 rounded-[32px] border border-emerald-100 overflow-hidden">
                        <div className="p-5 border-b border-emerald-100 bg-white/50 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
                            <h2 className="font-bold text-emerald-700 flex items-center gap-2">
                                <PackageCheck className="w-5 h-5 text-emerald-500" />
                                Listas para Despacho
                            </h2>
                            <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                                {ready.length}
                            </span>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                            {ready.map(order => <OrderCard key={order.id} order={order} />)}
                            {ready.length === 0 && <p className="text-emerald-300 text-center mt-10 font-medium">Aún no hay listas hoy</p>}
                        </div>
                    </div>
                </div>
            )}

            {view === 'LISTA' && (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">ID / Venta</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Cliente</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Color / Fórmula</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Estado</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[...pending, ...inProgress, ...ready].map(order => (
                                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{order.id}</div>
                                        <div className="text-xs text-indigo-600 font-bold bg-indigo-50 inline-block px-2 py-0.5 rounded mt-1">{order.saleId}</div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-600">{order.clientName}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-slate-800">{order.colorId}</span>
                                            <span className="text-xs text-slate-500">{order.baseName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {order.status === MezclaStatus.PENDING && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200"><Clock className="w-3.5 h-3.5"/> Pendiente</span>}
                                        {order.status === MezclaStatus.IN_PROGRESS && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200"><Beaker className="w-3.5 h-3.5 animate-pulse"/> En Proceso</span>}
                                        {order.status === MezclaStatus.READY && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200"><PackageCheck className="w-3.5 h-3.5"/> Lista</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {order.status === MezclaStatus.PENDING && (
                                            <button 
                                                onClick={() => updateStatus(order.id, MezclaStatus.IN_PROGRESS)}
                                                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-sm transition-all text-sm"
                                            >
                                                <Play className="w-3.5 h-3.5 fill-current" /> Iniciar
                                            </button>
                                        )}
                                        {order.status === MezclaStatus.IN_PROGRESS && (
                                            <button 
                                                onClick={() => updateStatus(order.id, MezclaStatus.READY)}
                                                className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-emerald-600 shadow-sm transition-all text-sm"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" /> Terminar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {[...pending, ...inProgress, ...ready].length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                                        No hay órdenes activas en este momento
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {view === 'HISTORIAL' && (
                <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">ID</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Cliente</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Color</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Base</th>
                                <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Fecha Completada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ready.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-800">{order.id}</td>
                                    <td className="p-4 text-slate-600">{order.clientName}</td>
                                    <td className="p-4 font-mono font-bold text-indigo-600">{order.colorId}</td>
                                    <td className="p-4 text-slate-600">{order.baseName}</td>
                                    <td className="p-4 text-slate-500">
                                        {order.completedAt ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.completedAt)) : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {ready.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">No hay historial de mezclas terminadas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedLabelData && (
                <LabelPreviewModal
                    isOpen={!!selectedLabelData}
                    onClose={() => setSelectedLabelData(null)}
                    data={selectedLabelData}
                    onDispenseComplete={() => {
                        updateStatus(selectedLabelData.id, MezclaStatus.IN_PROGRESS);
                    }}
                />
            )}

            {selectedContainerStickerOrder && (
                <PigmentContainerStickerModal
                    isOpen={!!selectedContainerStickerOrder}
                    onClose={() => setSelectedContainerStickerOrder(null)}
                    order={selectedContainerStickerOrder}
                />
            )}
        </div>
    );
};
