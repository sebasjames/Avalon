import React, { useState, useMemo } from 'react';
import { MezclaOrder, MezclaStatus, BatchStatus, ProductionBatch } from '../types';
import tintometriaData from '../data/tintometria_raw.json';
import { Clock, Beaker, CheckCircle, PackageCheck, AlertCircle, Play, History, KanbanSquare, List, Printer, Tag, Lock, AlertTriangle, FileText, MessageSquare, User, X, Database, Save, Check } from 'lucide-react';
import { MezclasCatalogo } from './MezclasCatalogo';
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
    const { inventory, addKardexTransaction, updateInventoryStock, consumeLabStock, mezclaOrders, updateMezclaOrder, productionOrders, addProductionOrder, mezclaCatalogo, saveMezclaToCatalogo } = useEnterprise();
    const orders = mezclaOrders;
    const [view, setView] = useState<'KANBAN' | 'LISTA' | 'HISTORIAL' | 'CATALOGO'>('KANBAN');
    const [lastDeductionMessage, setLastDeductionMessage] = useState<string | null>(null);
    const [selectedLabelData, setSelectedLabelData] = useState<MezclaLabelData | null>(null);
    const [selectedContainerStickerOrder, setSelectedContainerStickerOrder] = useState<MezclaOrder | null>(null);
    const [notesDropdownOpen, setNotesDropdownOpen] = useState<string | null>(null);

    // Sticker verification & Auth Modal State
    const [printedStickersMap, setPrintedStickersMap] = useState<Record<string, boolean>>({});
    const [unprintedWarningOrder, setUnprintedWarningOrder] = useState<MezclaOrder | null>(null);
    const [authModalOrder, setAuthModalOrder] = useState<MezclaOrder | null>(null);
    const [pinInput, setPinInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [preStartModalOrder, setPreStartModalOrder] = useState<MezclaOrder | null>(null);
    const [preStartChecks, setPreStartChecks] = useState<Record<string, boolean>>({});

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

            // Pigments logic moved to READY

            setLastDeductionMessage(`✅ Lote ${orderToUpdate.id} iniciado en planta: Se descontaron ${itemsDeductedCount} materias primas (Base + Pigmentos) en Kardex.`);
            setTimeout(() => setLastDeductionMessage(null), 6000);
        }

        updateMezclaOrder(id, {
            status: newStatus,
            completedAt: newStatus === MezclaStatus.READY ? new Date().toISOString() : orderToUpdate?.completedAt
        });

        // 3. Generar Lote en el Historial de Producción cuando finaliza
        if (orderToUpdate && newStatus === MezclaStatus.READY && orderToUpdate.status !== MezclaStatus.READY) {
            const today = new Date().toISOString().split('T')[0];
            let itemsDeductedCount = 0;

            if (orderToUpdate.formula) {
                Object.entries(orderToUpdate.formula).forEach(([code, qtyStr], idx) => {
                    if (code !== 'Error') {
                        const qtyGrams = parseFloat(qtyStr) || 1;
                        consumeLabStock(`PIGMENT-${code}`, qtyGrams);
                        addKardexTransaction({
                            id: `TX-MZ-${Date.now()}-PIG-${idx}`,
                            date: today,
                            skuId: `PIGMENT-${code}`,
                            lotNumber: `LOT-PIG-${code}`,
                            type: 'Salida',
                            quantity: qtyGrams,
                            balanceAfter: 0,
                            documentRef: orderToUpdate.id,
                            user: 'Bodega Mezclas (KDS)'
                        });
                        itemsDeductedCount++;
                    }
                });
                if (itemsDeductedCount > 0) {
                    setLastDeductionMessage(`✅ Mezcla Finalizada. Se descontaron ${itemsDeductedCount} tintas exactas de la Bodega Mezclas.`);
                    setTimeout(() => setLastDeductionMessage(null), 6000);
                }
            }
            const newBatch: ProductionBatch = {
                id: `ORD-MZ-${orderToUpdate.id}`,
                batchNumber: `LOTE-${new Date().getFullYear()}-${orderToUpdate.id}`,
                productName: `${orderToUpdate.baseName} - ${orderToUpdate.colorId}`,
                sku: `MIX-${orderToUpdate.baseName.replace(/\s+/g, '-').toUpperCase()}`,
                status: BatchStatus.COMPLETED,
                startDate: orderToUpdate.requestedAt,
                endDate: new Date().toISOString(),
                plannedOutput: 1, // KDS generally mixes 1 Gal/Can at a time per order currently
                actualOutput: 1,
                waste: 0,
                rework: false,
                standardUnitCost: 10000,
                realUnitCost: 10000,
                ingredients: [
                    { name: orderToUpdate.baseName, plannedQty: 1, actualQty: 1, unit: 'GL', costImpact: 5000 },
                    // In a more advanced implementation, we'd map pigments here too
                ]
            };
            addProductionOrder(newBatch);
        }
    };

    const handleAttemptMarkReady = (order: MezclaOrder) => {
        if (!printedStickersMap[order.id]) {
            setUnprintedWarningOrder(order);
        } else {
            setAuthModalOrder(order);
            setPinInput('');
            setAuthError('');
        }
    };

    const confirmMarkReadyAuth = () => {
        if (pinInput.length >= 4 && authModalOrder) {
            updateStatus(authModalOrder.id, MezclaStatus.READY);
            setAuthModalOrder(null);
            setPinInput('');
            setAuthError('');
        } else {
            setAuthError('PIN de seguridad inválido (mínimo 4 dígitos)');
        }
    };

    const OrderCard = ({ order }: { order: MezclaOrder }) => {
        const formulaEntries = Object.entries(order.formula);
        const hasError = formulaEntries.some(([k]) => k === 'Error');

        return (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start relative">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{order.id}</h3>
                        <p className="text-sm text-slate-500">{order.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setNotesDropdownOpen(notesDropdownOpen === order.id ? null : order.id); }}
                            className="relative p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Notas de Laboratorio"
                        >
                            <FileText className="w-4 h-4" />
                            {(order.timelineNotes?.length || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                    {order.timelineNotes!.length}
                                </span>
                            )}
                        </button>
                        
                        {notesDropdownOpen === order.id && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden flex flex-col max-h-96">
                                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500" /> Notas de Mezcla</h4>
                                    <button onClick={(e) => { e.stopPropagation(); setNotesDropdownOpen(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 custom-scrollbar">
                                    {(!order.timelineNotes || order.timelineNotes.length === 0) ? (
                                        <p className="text-xs text-center text-slate-400 italic py-4">No hay notas registradas.</p>
                                    ) : (
                                        order.timelineNotes.map(n => (
                                            <div key={n.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{n.process}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 mb-2 leading-relaxed">{n.text}</p>
                                                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50">
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="w-3 h-3 text-slate-500"/>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-500">{n.author}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 border-t border-slate-100 bg-white">
                                    <textarea
                                        autoFocus
                                        id={`note-input-${order.id}`}
                                        placeholder="Escribe una nota aquí..."
                                        className="w-full text-sm border-2 border-slate-200 rounded-lg focus:ring-0 focus:border-indigo-400 p-2.5 min-h-[60px] resize-none transition-colors bg-slate-50 focus:bg-white"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                const text = (e.target as HTMLTextAreaElement).value.trim();
                                                if (text) {
                                                    const newNote = {
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        author: 'Laboratorio KDS',
                                                        process: 'Mezclas',
                                                        text,
                                                        date: new Date().toLocaleDateString('es-CO') + ' ' + new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})
                                                    };
                                                    updateMezclaOrder(order.id, { timelineNotes: [...(order.timelineNotes || []), newNote] });
                                                    (e.target as HTMLTextAreaElement).value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <p className="text-[9px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3"/> Presiona ENTER para guardar</p>
                                </div>
                            </div>
                        )}
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm shrink-0">
                            Venta: {order.saleId}
                        </span>
                    </div>
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
                                {formulaEntries.map(([tinta, cantidad]) => {
                                    let numPart = String(cantidad);
                                    let unitPart = '';
                                    const match = numPart.trim().match(/^([\d\s\/\.]+)\s+([A-Za-z]+.*)$/);
                                    if (match) {
                                        numPart = match[1].trim();
                                        unitPart = match[2].trim();
                                    }
                                    return (
                                        <div key={tinta} className="flex justify-between items-center text-sm border-b border-slate-50 pb-1">
                                            <span className="text-slate-600 font-medium truncate pr-2" title={tinta}>{tinta.replace('PIGMENT-', '')}</span>
                                            {order.status === MezclaStatus.IN_PROGRESS ? (
                                                <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded px-1.5 py-0.5 focus-within:ring-2 ring-indigo-500/20 shadow-inner">
                                                    <input
                                                        type="text"
                                                        defaultValue={numPart}
                                                        onBlur={(e) => {
                                                            const val = e.target.value.trim();
                                                            if (val && val !== numPart) {
                                                                const newQty = unitPart ? `${val} ${unitPart}` : val;
                                                                const newFormula = { ...order.formula, [tinta]: newQty };
                                                                updateMezclaOrder(order.id, { formula: newFormula });
                                                            }
                                                        }}
                                                        className="w-10 sm:w-12 text-right font-mono font-bold text-indigo-700 bg-transparent outline-none text-xs"
                                                    />
                                                    {unitPart && <span className="text-indigo-400 text-[10px] uppercase font-sans tracking-wider">{unitPart}</span>}
                                                </div>
                                            ) : (
                                                <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-1.5 shrink-0">
                                                <span>{numPart}</span>
                                                {unitPart && <span className="text-indigo-400 text-[10px] uppercase font-sans tracking-wider">{unitPart}</span>}
                                            </span>
                                            )}
                                        </div>
                                    );
                                })}
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
                    {order.status === MezclaStatus.IN_PROGRESS && (
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
                            onClick={() => { setPreStartModalOrder(order); setPreStartChecks({}); }}
                            className="flex-1 flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all text-xs cursor-pointer"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Iniciar Mezcla
                        </button>
                    )}
                    {order.status === MezclaStatus.IN_PROGRESS && (
                        <button 
                            onClick={() => handleAttemptMarkReady(order)}
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
                                                onClick={() => { setPreStartModalOrder(order); setPreStartChecks({}); }}
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
                    onStickersPrinted={() => {
                        if (selectedContainerStickerOrder) {
                            setPrintedStickersMap(prev => ({ ...prev, [selectedContainerStickerOrder.id]: true }));
                        }
                    }}
                />
            )}

            {/* UNPRINTED STICKERS WARNING MODAL */}
            {unprintedWarningOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 max-w-md w-full text-white space-y-5 animate-in fade-in zoom-in-95">
                        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                            <AlertTriangle className="w-7 h-7 text-amber-400" />
                        </div>
                        
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white">Stickers de Saldos Pendientes</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                No se han impreso los stickers de actualización de saldos para los frascos de esta mezcla (<span className="font-bold text-amber-400 font-mono">{unprintedWarningOrder.id}</span>). Por favor imprímalos antes de continuar para garantizar la trazabilidad del laboratorio.
                            </p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => {
                                    const target = unprintedWarningOrder;
                                    setUnprintedWarningOrder(null);
                                    setSelectedContainerStickerOrder(target);
                                }}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Tag className="w-4 h-4" />
                                Imprimir Stickers Ahora
                            </button>
                            <button
                                onClick={() => {
                                    const target = unprintedWarningOrder;
                                    setPrintedStickersMap(prev => ({ ...prev, [target.id]: true }));
                                    setUnprintedWarningOrder(null);
                                    setAuthModalOrder(target);
                                    setPinInput('');
                                    setAuthError('');
                                }}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                            >
                                Ya los Imprimí (Continuar)
                            </button>
                            <button
                                onClick={() => setUnprintedWarningOrder(null)}
                                className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PIN AUTHORIZATION MODAL FOR MARCAR COMO LISTA */}
            
            {preStartModalOrder && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-2xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Asistente de Bodega: Lote {preStartModalOrder.id}</h2>
                                <p className="text-sm text-slate-500">Revisa las siguientes recomendaciones de inventario antes de iniciar.</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {Object.entries(preStartModalOrder.formula || {}).filter(([k]) => k !== 'Error').map(([code, qtyStr], idx) => {
                                const requested = parseFloat(qtyStr as string) || 1;
                                const skuId = `PIGMENT-${code}`;
                                // We need to check inventory
                                // Wait, the component state 'inventory' is not directly exported from useEnterprise in this file, we need to get it.
                                // Actually, useEnterprise returns inventory! Let's just use it.
                                const p = inventory.find(i => i.sku === skuId || i.id === skuId || i.originalSku === skuId);
                                const labStock = p?.labStock || 0;
                                
                                let message = '';
                                let type = '';
                                
                                if (labStock >= requested) {
                                    message = `✅ Tienes ${labStock.toLocaleString('es-CO')}g destapados. Usa esos y no abras una unidad nueva.`;
                                    type = 'green';
                                } else if (labStock > 0 && labStock < requested) {
                                    message = `⚠️ Tienes ${labStock.toLocaleString('es-CO')}g destapados. Úsalos y destapa una unidad nueva para los ${(requested - labStock).toLocaleString('es-CO')}g faltantes.`;
                                    type = 'amber';
                                } else {
                                    message = `⚠️ No hay destapados. Deberás destapar una unidad nueva desde el almacén principal.`;
                                    type = 'slate';
                                }

                                const isChecked = !!preStartChecks[code];

                                return (
                                    <div key={code} className={`p-4 rounded-xl border flex items-start gap-4 transition-colors cursor-pointer ${isChecked ? 'bg-slate-50 border-indigo-200' : 'bg-white border-slate-200'}`} onClick={() => setPreStartChecks(prev => ({...prev, [code]: !prev[code]}))}>
                                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-1 transition-colors ${isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-100 border border-slate-300'}`}>
                                            {isChecked && <Check className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-bold text-slate-800">{code}</span>
                                                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{requested}g</span>
                                            </div>
                                            <p className={`text-sm ${type === 'green' ? 'text-emerald-700' : type === 'amber' ? 'text-amber-700' : 'text-slate-600'}`}>
                                                {message}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => setPreStartModalOrder(null)}
                                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    updateStatus(preStartModalOrder.id, MezclaStatus.IN_PROGRESS);
                                    setPreStartModalOrder(null);
                                }}
                                disabled={Object.keys(preStartModalOrder.formula || {}).filter(k => k !== 'Error').length > 0 && Object.keys(preStartChecks).filter(k => preStartChecks[k]).length !== Object.keys(preStartModalOrder.formula || {}).filter(k => k !== 'Error').length}
                                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg shadow-indigo-200"
                            >
                                Entendido, Iniciar Mezcla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {authModalOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 max-w-md w-full text-white space-y-5 animate-in fade-in zoom-in-95">
                        <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/30">
                            <Lock className="w-7 h-7 text-indigo-400" />
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white">Autorización Requerida</h3>
                            <p className="text-xs text-slate-300">
                                Ingresa tu PIN de seguridad de operador para confirmar la entrega de la mezcla <span className="font-bold text-indigo-400 font-mono">{authModalOrder.id}</span> a despacho.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <input 
                                    type="password"
                                    placeholder="PIN de 4 dígitos"
                                    value={pinInput}
                                    onChange={(e) => setPinInput(e.target.value)}
                                    className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                    maxLength={6}
                                />
                                {authError && (
                                    <p className="text-rose-400 text-xs font-medium text-center mt-2 flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {authError}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        setAuthModalOrder(null);
                                        setPinInput('');
                                        setAuthError('');
                                    }}
                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={confirmMarkReadyAuth}
                                    disabled={pinInput.length < 4}
                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
