import React, { useState, useEffect } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { MOCK_PRODUCTION } from '../constants';
import { BatchStatus, ProductionBatch } from '../types';
import { 
    Factory, FlaskConical, AlertTriangle, CheckCircle2, 
    Activity, GitMerge, ChevronDown, ChevronRight, Fingerprint, Box, ArrowDown, Plus, X
} from 'lucide-react';

const StatusBadge = ({ status }: { status: BatchStatus }) => {
    switch (status) {
        case BatchStatus.COMPLETED:
            return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center w-fit uppercase tracking-wider"><CheckCircle2 className="w-3 h-3 mr-1" /> Completado</span>;
        case BatchStatus.IN_PROGRESS:
            return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center w-fit uppercase tracking-wider"><Activity className="w-3 h-3 mr-1 animate-pulse" /> En Proceso</span>;
        default:
            return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 w-fit uppercase tracking-wider">{status === BatchStatus.PLANNING ? 'Planeación' : status}</span>;
    }
};

interface BomNodeProps {
    ingredient: any;
}

import { TintometricEngine } from '../utils/TintometricEngine';

const BomNode: React.FC<BomNodeProps> = ({ ingredient }) => {
    // Detect brand dynamically using TintometricEngine
    const brand = TintometricEngine.detectBrand(ingredient.name);
    
    return (
        <div className="relative pl-8 py-2">
            {/* L-shaped connector logic managed by parent, here we draw the horizontal line */}
            <div className="absolute left-0 top-1/2 w-8 h-px bg-slate-300"></div>
            
            <div className={`p-3 rounded-lg border shadow-sm flex items-start gap-3 w-80 bg-white ${
                brand === 'ILVA' ? 'border-blue-200' :
                brand === 'Carpoly' ? 'border-orange-200' :
                brand === 'Barpimo' ? 'border-emerald-200' : 'border-slate-200'
            }`}>
                <div className={`p-1.5 rounded-md mt-0.5 ${
                    brand === 'ILVA' ? 'bg-blue-100 text-blue-600' :
                    brand === 'Carpoly' ? 'bg-orange-100 text-orange-600' :
                    brand === 'Barpimo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}>
                    <Box className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <div className="text-[10px] font-black uppercase text-slate-400 mb-0.5 flex justify-between">
                        <span>{brand}</span>
                        <span className="text-slate-300">TRC-8821{Math.floor(Math.random()*10)}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-800 leading-tight mb-1">{ingredient.name}</div>
                    
                    {/* Consumo y Conversion */}
                    <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-100 border-dashed">
                        <div>
                            <div className="text-[10px] text-slate-500">Receta exige:</div>
                            <div className="font-mono text-xs font-bold text-slate-700">{ingredient.plannedQty} {ingredient.unit}</div>
                        </div>
                        <div className="flex items-center text-slate-300 px-1"><ArrowDown className="w-3 h-3 -rotate-45"/></div>
                        <div className="text-right">
                             <div className="text-[10px] text-slate-500">Consumo Real (Lts):</div>
                             <div className="font-mono text-xs font-bold text-indigo-700">
                                {/* Simulating conversion Gal -> Lts if needed, otherwise just real qty */}
                                {ingredient.unit === 'GL' ? (ingredient.actualQty * 3.785).toFixed(2) : ingredient.actualQty} LT
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BomTree = ({ batch }: { batch: ProductionBatch }) => {
    return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4 overflow-x-auto">
            <h4 className="text-sm font-black text-slate-800 mb-6 flex items-center tracking-tight">
                <GitMerge className="w-5 h-5 mr-3 text-indigo-600"/>
                Módulo de Ensamblaje / Capas (BOM)
            </h4>
            
            <div className="flex flex-col items-start min-w-max">
                {/* Root Node - Finished Good */}
                <div className="bg-indigo-900 border-2 border-indigo-700 text-white p-4 rounded-xl shadow-lg flex items-center gap-4 w-96 relative z-10">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <FlaskConical className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">Salida: {batch.actualOutput} Unidades</div>
                        <div className="text-lg font-bold">{batch.productName}</div>
                        <div className="text-xs text-indigo-200 mt-1 flex items-center">
                            <Fingerprint className="w-3 h-3 mr-1"/> Lote: {batch.batchNumber}
                        </div>
                    </div>
                </div>

                {/* Vertical Line from Root */}
                <div className="w-px h-6 bg-slate-300 ml-12"></div>

                {/* Children Nodes Wrapper */}
                <div className="relative w-full ml-12">
                    {/* The vertical spine running down to the last child */}
                    <div className="absolute left-0 top-0 bottom-8 w-px bg-slate-300"></div>

                    <div className="flex flex-col gap-2 relative z-10 w-full">
                        {batch.ingredients.map((ing, idx) => (
                            <BomNode key={idx} ingredient={ing} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProductionManagement: React.FC = () => {
    const { productionOrders, addProductionOrder } = useEnterprise();
    const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
    const [selectedStatuses, setSelectedStatuses] = useState<BatchStatus[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newOrderName, setNewOrderName] = useState('');
    const [newOrderQty, setNewOrderQty] = useState('');
    const toggleBatch = (id: string) => {
        setExpandedBatch(expandedBatch === id ? null : id);
    };

    const toggleStatusFilter = (status: BatchStatus) => {
        setSelectedStatuses(prev => 
            prev.includes(status) 
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleCreateOrder = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseFloat(newOrderQty) || 1;
        const newBatch: ProductionBatch = {
            id: `ORD-00${productionOrders.length + 2}`,
            batchNumber: `LOTE-2026-${String.fromCharCode(66 + productionOrders.length)}`,
            productName: newOrderName || 'Mezcla Personalizada',
            sku: 'MIX-CUST',
            status: BatchStatus.PLANNING,
            startDate: new Date().toISOString().split('T')[0],
            plannedOutput: qty,
            actualOutput: 0,
            waste: 0,
            rework: false,
            standardUnitCost: 12000,
            realUnitCost: 0,
            ingredients: [
                { name: 'Base Acrílica Procoquinal', plannedQty: qty * 0.8, actualQty: 0, unit: 'GL', costImpact: 0 },
                { name: 'Tinte Universal', plannedQty: qty * 0.2, actualQty: 0, unit: 'LT', costImpact: 0 }
            ]
        };
        addProductionOrder(newBatch);
        setIsCreateModalOpen(false);
        setNewOrderName('');
        setNewOrderQty('');
    };

    const filteredMocks = selectedStatuses.length > 0 
        ? productionOrders.filter(batch => selectedStatuses.includes(batch.status))
        : productionOrders;

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                        <Factory className="w-6 h-6 mr-3 text-slate-700"/>
                        Historial de Producción y Lotes
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Archivo maestro de auditoría y trazabilidad de lotes terminados.</p>
                </div>
            </header>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-semibold text-slate-600 mr-2">Filtrar por estatus:</span>
                {Object.values(BatchStatus).map(status => {
                    const isChecked = selectedStatuses.includes(status);
                    return (
                        <label key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors select-none ${isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <input 
                                type="checkbox" 
                                className="hidden"
                                checked={isChecked}
                                onChange={() => toggleStatusFilter(status)}
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                {isChecked && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            {status}
                        </label>
                    );
                })}
                {selectedStatuses.length > 0 && (
                     <button onClick={() => setSelectedStatuses([])} className="text-xs text-slate-500 hover:text-indigo-600 underline ml-2">
                         Limpiar filtros
                     </button>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Órdenes de Mezcla / Producción</h3>
                    <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{filteredMocks.length} Resultados</span>
                </div>
                
                {filteredMocks.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-sm font-medium">
                        No hay órdenes que coincidan con los filtros seleccionados.
                    </div>
                )}

                <div className="divide-y divide-slate-100">
                    {filteredMocks.map(batch => {
                        const isExpanded = expandedBatch === batch.id;
                        return (
                            <div key={batch.id} className="group hover:bg-slate-50 transition-colors">
                                <div className="p-4 flex flex-col sm:flex-row items-center gap-4 cursor-pointer" onClick={() => toggleBatch(batch.id)}>
                                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Producto Terminado (Procoquinal)</div>
                                            <div className="font-bold text-slate-900 text-base">{batch.productName}</div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Estatus</div>
                                            <StatusBadge status={batch.status} />
                                        </div>

                                        <div className="text-sm">
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Volumen Elaborado</div>
                                            <div className="font-mono text-slate-900 font-bold">
                                                {batch.actualOutput} Lts
                                            </div>
                                        </div>

                                        <div className="text-sm">
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Costo Ensamblaje Promedio</div>
                                            <div className="font-mono text-indigo-700 font-bold">
                                                ${batch.realUnitCost.toFixed(2)} <span className="text-slate-400 text-[10px] font-sans">/ Lt</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-slate-400 bg-white p-2 border border-slate-200 shadow-sm rounded-full">
                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-2 bg-slate-100/50 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                                        {/* Arbol BOM */}
                                        <BomTree batch={batch} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Nueva Mezcla */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center">
                                <Factory className="w-5 h-5 mr-2 text-indigo-600" />
                                Crear Orden de Mezcla
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Producto a Preparar (Fórmula)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newOrderName}
                                    onChange={e => setNewOrderName(e.target.value)}
                                    placeholder="Ej: Laca Poliuretano Transparente..." 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Cantidad a Producir</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        required
                                        min="1"
                                        step="0.1"
                                        value={newOrderQty}
                                        onChange={e => setNewOrderQty(e.target.value)}
                                        placeholder="0.0" 
                                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <select className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 outline-none">
                                        <option>Galones</option>
                                        <option>Litros</option>
                                        <option>Cuñetes</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex gap-3 mt-4 text-sm">
                                <Activity className="w-5 h-5 text-blue-600 shrink-0" />
                                <div>
                                    <span className="font-bold block mb-1">Reserva de Inventario</span>
                                    Al crear la orden, el sistema reservará los ingredientes automáticamente de la <b>Bodega Centenario</b> según la receta.
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm"
                                >
                                    Crear y Reservar Material
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};