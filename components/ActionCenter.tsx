import React, { useState } from 'react';
import { MOCK_OPPORTUNITIES } from '../constants';
import { ActionOpportunity, ActionType } from '../types';
import { 
    Zap, DollarSign, TrendingDown, ArrowRight, Percent, 
    Truck, PackagePlus, Trash2, CheckCircle2, AlertTriangle, Play
} from 'lucide-react';

const ActionIcon = ({ type }: { type: ActionType }) => {
    switch(type) {
        case 'LIQUIDATION': return <Percent className="w-5 h-5 text-rose-600" />;
        case 'TRANSFER': return <Truck className="w-5 h-5 text-blue-600" />;
        case 'BUNDLE': return <PackagePlus className="w-5 h-5 text-purple-600" />;
        case 'SCRAP': return <Trash2 className="w-5 h-5 text-slate-500" />;
    }
};

export const ActionCenter: React.FC = () => {
    const [opportunities, setOpportunities] = useState<ActionOpportunity[]>(MOCK_OPPORTUNITIES);
    const [executedCount, setExecutedCount] = useState(0);
    const [cashUnlocked, setCashUnlocked] = useState(0);

    const handleExecute = (id: string) => {
        const action = opportunities.find(o => o.id === id);
        if (action && action.status === 'PENDING') {
            // Mutate global constant in memory
            const globalAction = MOCK_OPPORTUNITIES.find(o => o.id === id);
            if (globalAction) {
                globalAction.status = 'EXECUTED';
            }
            const updated = opportunities.map(o => 
                o.id === id ? { ...o, status: 'EXECUTED' as const } : o
            );
            setOpportunities(updated);
            setExecutedCount(prev => prev + 1);
            setCashUnlocked(prev => prev + action.potentialCashRelease);
        }
    };

    const pendingActions = opportunities.filter(o => o.status === 'PENDING');

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-amber-500 fill-amber-500"/>
                        Inventory Drain / Action Center
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Ejecución de estrategias para liberar caja y sanear inventario. 
                        <span className="text-rose-600 font-bold ml-1">Zona de Impacto Real.</span>
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg text-center">
                        <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Caja Liberada (Sesión)</div>
                        <div className="text-xl font-bold text-emerald-700 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" /> {cashUnlocked.toLocaleString('es-CO')}
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-center">
                        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Acciones Ejecutadas</div>
                        <div className="text-xl font-bold text-blue-700">{executedCount}</div>
                    </div>
                </div>
            </header>

            {/* MAIN ACTION BOARD */}
            <div className="grid grid-cols-1 gap-6">
                {pendingActions.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">¡Todo al día!</h3>
                        <p className="text-slate-500">No hay acciones críticas pendientes recomendadas por el sistema.</p>
                    </div>
                ) : (
                    pendingActions.map(action => (
                        <div key={action.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                            
                            {/* LEFT: Context & Reason */}
                            <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <ActionIcon type={action.type} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{action.type}</h3>
                                            <span className="text-xs text-slate-400 font-mono">{action.id}</span>
                                        </div>
                                    </div>
                                    <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded font-bold uppercase">
                                        Prioridad Alta
                                    </span>
                                </div>
                                
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-slate-800">{action.productName}</h4>
                                    <p className="text-sm text-slate-500 font-mono mb-3">{action.skuId}</p>
                                    
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-sm text-amber-800 flex items-start">
                                        <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                        {action.reason}
                                    </div>
                                </div>
                            </div>

                            {/* MIDDLE: Suggested Action & Controls */}
                            <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Estrategia Recomendada</h4>
                                <div className="text-base font-medium text-slate-900 mb-4">
                                    {action.suggestedAction}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 flex justify-between mb-1">
                                            <span>Volumen a Ejecutar</span>
                                            <span className="text-slate-900">{action.quantityToMove} u</span>
                                        </label>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-3/4"></div>
                                        </div>
                                    </div>
                                    
                                    {action.type === 'LIQUIDATION' && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 flex justify-between mb-1">
                                                <span>Descuento Aplicado</span>
                                                <span className="text-rose-600 font-bold">20%</span>
                                            </label>
                                            <input type="range" className="w-full accent-rose-600" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT: Impact & Execution */}
                            <div className="p-6 w-full md:w-80 flex flex-col justify-between bg-slate-50">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Impacto Proyectado</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">Cash Release</span>
                                            <span className="text-base font-bold text-emerald-600">
                                                +${action.potentialCashRelease.toLocaleString('es-CO')} COP COP
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600">Impacto Margen</span>
                                            <span className={`text-base font-bold ${action.marginImpactPercent < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                                                {action.marginImpactPercent}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                            <span className="text-sm text-slate-600">Costo Op.</span>
                                            <span className="text-sm font-medium text-slate-500">
                                                ${action.costOfAction}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleExecute(action.id)}
                                    className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    EJECUTAR ACCIÓN
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-center justify-center">
                <Truck className="w-5 h-5 mr-2" />
                Las acciones ejecutadas se sincronizarán con el ERP en el próximo ciclo de actualización (15 min).
            </div>
        </div>
    );
};