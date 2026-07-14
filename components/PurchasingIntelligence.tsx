import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { MOCK_PURCHASE_SUGGESTIONS, MOCK_VENDORS } from '../constants';
import { Vendor, PurchaseSuggestion, Category } from '../types';
import { 
    ShoppingCart, TrendingUp, AlertOctagon, CheckCircle2, 
    Truck, BarChart3, ShieldCheck, DollarSign, Clock, AlertTriangle, ArrowRight
} from 'lucide-react';

export const PurchasingIntelligence: React.FC = () => {
    const { inventory } = useEnterprise();
    const [suggestions, setSuggestions] = useState<PurchaseSuggestion[]>(MOCK_PURCHASE_SUGGESTIONS);
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
    const [segmentFilter, setSegmentFilter] = useState<'ALL' | 'NACIONAL' | 'IMPORTADA' | 'FERRETERIA'>('ALL');

    const handleAction = (id: string, action: 'Approve' | 'Reject') => {
        setSuggestions(prev => prev.map(s => 
            s.id === id ? { ...s, status: action === 'Approve' ? 'Approved' : 'Rejected' } : s
        ));
        setSelectedSuggestion(null);
    };

    const activeSuggestions = suggestions.filter(s => {
        if (s.status !== 'Proposed') return false;
        
        if (segmentFilter !== 'ALL') {
            const inventoryItem = inventory.find(i => i.sku === s.skuId);
            if (!inventoryItem) return false;
            
            if (segmentFilter === 'NACIONAL' && inventoryItem.category !== Category.RAW_MATERIAL) return false;
            if (segmentFilter === 'IMPORTADA' && inventoryItem.category !== Category.RAW_MATERIAL_IMPORTADA) return false;
            if (segmentFilter === 'FERRETERIA' && inventoryItem.category !== Category.HARDWARE) return false;
        }
        
        return true;
    });
    const totalProposedSpend = activeSuggestions.reduce((acc, s) => acc + s.totalCost, 0);

    const renderVendorComparison = (suggestion: PurchaseSuggestion) => {
        const recommended = MOCK_VENDORS.find(v => v.id === suggestion.recommendedVendorId);
        if (!recommended) return null;

        return (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 animate-in slide-in-from-top-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600"/>
                    Análisis de Proveedor: {recommended.name}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 mb-1">Lead Time</div>
                        <div className="text-lg font-bold text-slate-800 flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-blue-500"/> {recommended.leadTimeDays} días
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 mb-1">Confiabilidad</div>
                        <div className="text-lg font-bold text-slate-800 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500"/> {recommended.reliabilityScore}%
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 mb-1">Índice Precio</div>
                        <div className="text-lg font-bold text-slate-800 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-amber-500"/> {recommended.priceIndex}
                        </div>
                    </div>
                </div>

                {suggestion.riskOfOverstock === 'High' && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-start mb-4">
                        <AlertTriangle className="w-5 h-5 text-rose-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="text-sm font-bold text-rose-800">¡Alerta de Inventory Drain!</span>
                            <p className="text-xs text-rose-700 mt-1">
                                Esta compra cubre {suggestion.forecastCoverageDays} días, pero el ítem tiene movimiento "Lento/Silencioso".
                                Riesgo alto de convertirse en capital inmovilizado. Se sugiere reducir cantidad o posponer.
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                     <button 
                        onClick={() => handleAction(suggestion.id, 'Reject')}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Rechazar / Ajustar
                    </button>
                    <button 
                        onClick={() => handleAction(suggestion.id, 'Approve')}
                        className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Aprobar Compra
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="py-2 space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
            {/* Segment Filter Tabs */}
            <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-slate-200/50 shadow-sm w-full md:w-max">
                <button 
                    onClick={() => setSegmentFilter('ALL')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${segmentFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Todas las Compras
                </button>
                <button 
                    onClick={() => setSegmentFilter('NACIONAL')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${segmentFilter === 'NACIONAL' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    🇨🇴 Nacional
                </button>
                <button 
                    onClick={() => setSegmentFilter('IMPORTADA')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${segmentFilter === 'IMPORTADA' ? 'bg-sky-600 text-white shadow-md shadow-sky-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    🚢 Importada
                </button>
                <button 
                    onClick={() => setSegmentFilter('FERRETERIA')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${segmentFilter === 'FERRETERIA' ? 'bg-amber-600 text-white shadow-md shadow-amber-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    🔧 Ferretería
                </button>
            </div>

            <header className="flex justify-between items-end hidden">
                {/* Oculto porque InventoryHub ya tiene título */}
            </header>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-emerald-600"/> Sugerencias de Reposición (IA)
                    </h3>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded font-medium">
                        {activeSuggestions.length} Pendientes
                    </span>
                </div>

                <div className="divide-y divide-slate-100">
                    {activeSuggestions.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            No hay sugerencias de compra urgentes.
                        </div>
                    ) : (
                        activeSuggestions.map(suggestion => (
                            <div key={suggestion.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                suggestion.urgency === 'High' ? 'bg-rose-100 text-rose-700' :
                                                suggestion.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                Urgencia: {suggestion.urgency}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">{suggestion.id}</span>
                                        </div>
                                        <div className="font-bold text-slate-900 text-lg">{suggestion.productName}</div>
                                        <div className="text-sm text-slate-500">{suggestion.reason}</div>
                                    </div>

                                    <div className="flex gap-8 text-right">
                                        <div>
                                            <div className="text-xs text-slate-400">Cantidad</div>
                                            <div className="font-bold text-slate-800">{suggestion.suggestedQty.toLocaleString('es-CO')} u</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400">Costo Total</div>
                                            <div className="font-bold text-slate-800">${suggestion.totalCost.toLocaleString('es-CO')} COP</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-400">Cobertura</div>
                                            <div className="font-bold text-blue-600">{suggestion.forecastCoverageDays} días</div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedSuggestion(selectedSuggestion === suggestion.id ? null : suggestion.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center ${
                                            selectedSuggestion === suggestion.id 
                                            ? 'bg-slate-800 text-white border-slate-800' 
                                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                                        }`}
                                    >
                                        Analizar <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                </div>

                                {selectedSuggestion === suggestion.id && renderVendorComparison(suggestion)}
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2 flex items-center">
                        <AlertOctagon className="w-5 h-5 mr-2 text-rose-400"/>
                        Política Anti-Drain
                    </h3>
                    <p className="text-sm text-indigo-200 leading-relaxed mb-4">
                        El sistema bloquea automáticamente sugerencias de compra para SKUs clasificados como "Silenciosos" o con exceso de stock en otras bodegas, priorizando Transferencias sobre Compras.
                    </p>
                    <div className="text-xs font-mono bg-white/10 p-2 rounded text-indigo-100">
                        Regla Activa: IF (Inventario &gt; Pronóstico_180_Días) THEN BLOQUEAR_COMPRA
                    </div>
                </div>
                 <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600"/>
                        Ranking de Proveedores (Top 3)
                    </h3>
                    <div className="space-y-3">
                        {MOCK_VENDORS.map((v, i) => (
                            <div key={v.id} className="flex items-center gap-3">
                                <span className="font-bold text-slate-300 w-4">#{i+1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">{v.name}</span>
                                        <span className="font-bold text-emerald-600">{v.reliabilityScore}/100</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${v.reliabilityScore}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    );
};