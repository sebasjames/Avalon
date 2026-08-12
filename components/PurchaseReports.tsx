import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { generatePurchaseSuggestions } from '../services/geminiService';
import { PurchaseSuggestion } from '../types';
import { PurchaseReportsExcelModal } from './PurchaseReportsExcelModal';
import { BrainCircuit, Loader2, Save, FileSpreadsheet, TrendingUp, DollarSign } from 'lucide-react';

export const PurchaseReports: React.FC = () => {
    const { inventory } = useEnterprise();
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState<PurchaseSuggestion[] | null>(null);
    const [showExcelModal, setShowExcelModal] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Pre-filter: only items that might need restocking (e.g. stock < 500)
        // For the demo, we take the bottom 20 items by stock.
        const subset = [...inventory].sort((a, b) => a.totalStock - b.totalStock).slice(0, 20);
        
        const results = await generatePurchaseSuggestions(subset);
        setSuggestions(results);
        setIsGenerating(false);
    };

    const handleUpdateQty = (sku: string, newQty: number) => {
        setSuggestions(prev => 
            prev?.map(s => s.sku === sku ? { ...s, editedQty: newQty } : s) || null
        );
    };

    const handleSaveOrder = () => {
        alert("Pedido guardado y enviado para aprobación financiera.");
        setSuggestions(null);
    };

    const totalInvestment = suggestions?.reduce((sum, s) => sum + (s.editedQty * s.unitCost), 0) || 0;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <FileSpreadsheet className="text-blue-600 w-8 h-8" />
                        Informes de Pedido
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Utiliza la Inteligencia Artificial para cruzar el inventario actual con el histórico de ventas y proyectar las necesidades de compra.
                    </p>
                </div>
                {!suggestions && !isGenerating && (
                    <button 
                        onClick={handleGenerate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                    >
                        <BrainCircuit size={20} />
                        Generar Proyección (IA)
                    </button>
                )}
            </div>

            {isGenerating && (
                <div className="bg-white border border-blue-100 rounded-2xl p-16 flex flex-col items-center justify-center space-y-4 shadow-sm">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <h3 className="text-xl font-bold text-slate-800">Analizando Inventario y Tendencias...</h3>
                    <p className="text-slate-500">Calculando proyecciones de consumo para los próximos 3 meses.</p>
                </div>
            )}

            {suggestions && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[70vh]">
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-emerald-400" size={20} />
                            <h3 className="text-white font-bold">Proyección de Compras Sugerida</h3>
                        </div>
                        <button 
                            onClick={() => setShowExcelModal(true)} 
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-md text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Formato Excel
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 font-semibold">SKU / Producto</th>
                                    <th className="p-4 font-semibold text-right">Stock Actual</th>
                                    <th className="p-4 font-semibold text-right">Sugerencia (IA)</th>
                                    <th className="p-4 font-semibold w-1/3">Justificación (IA)</th>
                                    <th className="p-4 font-semibold text-right bg-blue-50/50">Cantidad Final (Editar)</th>
                                    <th className="p-4 font-semibold text-right">Costo Estimado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {suggestions.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{item.sku}</div>
                                            <div className="text-xs text-slate-500">{item.description}</div>
                                        </td>
                                        <td className="p-4 text-right font-mono font-medium text-slate-600">
                                            {item.currentStock.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-blue-600">
                                            {item.suggestedQty.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-xs text-slate-600 italic">
                                            "{item.reason}"
                                        </td>
                                        <td className="p-4 text-right bg-blue-50/30">
                                            <input 
                                                type="number"
                                                min="0"
                                                value={item.editedQty}
                                                onChange={(e) => handleUpdateQty(item.sku, parseInt(e.target.value) || 0)}
                                                className="w-24 px-2 py-1 border border-blue-200 rounded text-right font-mono font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            />
                                        </td>
                                        <td className="p-4 text-right font-mono font-medium text-slate-700">
                                            ${(item.editedQty * item.unitCost).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50 p-6 border-t border-slate-200 shrink-0 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Inversión Estimada Total</p>
                            <div className="text-3xl font-black text-slate-800 flex items-center gap-1">
                                <DollarSign className="text-slate-400" />
                                {totalInvestment.toLocaleString()}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setSuggestions(null)}
                                className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveOrder}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                            >
                                <Save size={18} />
                                Aprobar y Exportar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {suggestions && (
                <PurchaseReportsExcelModal 
                    isOpen={showExcelModal} 
                    onClose={() => setShowExcelModal(false)} 
                    data={suggestions} 
                />
            )}
        </div>
    );
};
