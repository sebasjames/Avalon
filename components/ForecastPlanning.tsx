import React, { useState } from 'react';
import { 
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { 
    TrendingUp, ShieldAlert, BarChart3, Settings2, Target, ArrowUpRight, 
    ArrowDownRight, TrendingDown, Layers
} from 'lucide-react';
import { MOCK_INVENTORY, MOCK_FORECAST_DATA, MOCK_DEMAND_ALERTS } from '../constants';
import { Category } from '../types';

export const ForecastPlanning: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'base' | 'aggressive'>('base');
    const [selectedFamily, setSelectedFamily] = useState<string>('All');
    
    // Mock Accuracy Metrics
    const forecastAccuracy = 88.5; // MAPE 11.5%
    const bias = 2.3; // Slight positive bias (over-forecasting)

    // Dynamic Min/Max Logic (Mock calculation visualization)
    // Formula: Min = (Avg Daily Usage * Lead Time) + Safety Stock
    // Safety Stock = Z * StdDev * Sqrt(Lead Time)
    const mockDynamicCalc = {
        staticMin: 500,
        staticMax: 1500,
        dynamicMin: 620, // System suggests increasing min due to volatility
        dynamicMax: 1800,
        reason: 'Alta variabilidad detectada en últimos 30 días (+15%)'
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <TrendingUp className="w-6 h-6 mr-2 text-slate-700"/>
                        Planificación y Pronóstico (Forecast)
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        El corazón del sistema: Proyecciones, estacionalidad y ajuste dinámico de inventario.
                    </p>
                </div>
                <div className="flex gap-2">
                     <select 
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedFamily}
                        onChange={(e) => setSelectedFamily(e.target.value)}
                    >
                        <option value="All">Todas las Familias</option>
                        {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </header>

            {/* ALERTS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_DEMAND_ALERTS.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-xl border flex items-start gap-4 ${
                        alert.type === 'STOCKOUT' 
                        ? 'bg-rose-50 border-rose-200' 
                        : 'bg-indigo-50 border-indigo-200'
                    }`}>
                        <div className={`p-2 rounded-lg ${
                            alert.type === 'STOCKOUT' ? 'bg-rose-100' : 'bg-indigo-100'
                        }`}>
                            {alert.type === 'STOCKOUT' 
                                ? <TrendingDown className={`w-5 h-5 text-rose-600`} />
                                : <Layers className={`w-5 h-5 text-indigo-600`} />
                            }
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-sm font-bold ${
                                alert.type === 'STOCKOUT' ? 'text-rose-800' : 'text-indigo-800'
                            }`}>
                                {alert.type === 'STOCKOUT' ? 'Quiebre de Stock Proyectado' : 'Riesgo de Sobreinventario'}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1">
                                {alert.sku} - {alert.productName}
                            </p>
                            <div className="mt-2 text-xs font-medium flex gap-4">
                                <span>Fecha Est: {alert.projectedDate}</span>
                                <span>Gap: {alert.gapQuantity} u</span>
                            </div>
                        </div>
                        {alert.type === 'STOCKOUT' && (
                             <button className="px-3 py-1 bg-white text-rose-600 text-xs font-bold border border-rose-200 rounded-lg hover:bg-rose-50">
                                Crear PO
                             </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* MAIN CHART AREA */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-blue-600"/>
                                Proyección de Demanda
                            </h3>
                            
                            {/* SCENARIO SELECTOR */}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button 
                                    onClick={() => setSelectedScenario('conservative')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        selectedScenario === 'conservative' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Conservador
                                </button>
                                <button 
                                    onClick={() => setSelectedScenario('base')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        selectedScenario === 'base' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Base
                                </button>
                                <button 
                                    onClick={() => setSelectedScenario('aggressive')}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                        selectedScenario === 'aggressive' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    Agresivo
                                </button>
                            </div>
                        </div>

                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={MOCK_FORECAST_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="historical" name="Venta Histórica" fill="#cbd5e1" barSize={40} />
                                    
                                    {/* Forecast Lines */}
                                    <Line 
                                        type="monotone" 
                                        dataKey={selectedScenario} 
                                        name={`Forecast (${selectedScenario})`}
                                        stroke={
                                            selectedScenario === 'conservative' ? '#f59e0b' : 
                                            selectedScenario === 'base' ? '#3b82f6' : '#10b981'
                                        } 
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                    {/* Pipeline Context */}
                                    <Line 
                                        type="monotone" 
                                        dataKey="pipelineWeighted" 
                                        name="Pipeline Ponderado" 
                                        stroke="#8b5cf6" 
                                        strokeDasharray="5 5"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase font-bold">Precisión (MAPE)</div>
                                <div className={`text-xl font-bold ${forecastAccuracy > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                    {forecastAccuracy}%
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase font-bold">Sesgo (Bias)</div>
                                <div className="text-xl font-bold text-slate-700">+{bias}%</div>
                                <div className="text-[10px] text-slate-400">Tendencia a sobre-estimar</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-xs text-slate-500 uppercase font-bold">Horizonte</div>
                                <div className="text-xl font-bold text-blue-600">4 Meses</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: DYNAMIC MIN/MAX */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <Settings2 className="w-5 h-5 mr-2 text-emerald-600"/>
                            Min / Max Dinámico
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            El sistema recalcula los niveles de inventario óptimos basados en la variabilidad reciente.
                        </p>

                        <div className="relative pt-6 pb-2">
                             {/* Static Range */}
                            <div className="h-4 bg-slate-200 rounded-full w-full relative">
                                <div className="absolute top-0 bottom-0 bg-slate-300 rounded-full" style={{ left: '20%', right: '30%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                                <span style={{ marginLeft: '20%' }}>Min Est: {mockDynamicCalc.staticMin}</span>
                                <span style={{ marginRight: '30%' }}>Max Est: {mockDynamicCalc.staticMax}</span>
                            </div>

                             {/* Dynamic Range Overlay */}
                             <div className="h-1.5 bg-transparent rounded-full w-full relative -mt-6">
                                <div className="absolute top-0 bottom-0 bg-emerald-500 rounded-full opacity-70" style={{ left: '25%', right: '20%' }}></div>
                            </div>
                             <div className="flex justify-between text-xs text-emerald-600 mt-4 font-bold font-mono">
                                <span style={{ marginLeft: '25%' }}>Min Din: {mockDynamicCalc.dynamicMin}</span>
                                <span style={{ marginRight: '20%' }}>Max Din: {mockDynamicCalc.dynamicMax}</span>
                            </div>
                        </div>

                        <div className="mt-6 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Target className="w-4 h-4 text-emerald-600 mt-0.5" />
                                <div>
                                    <span className="text-sm font-bold text-emerald-800">Recomendación IA:</span>
                                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                                        {mockDynamicCalc.reason}. Se sugiere actualizar parámetros maestros.
                                    </p>
                                </div>
                            </div>
                            <button className="mt-3 w-full py-1.5 bg-white border border-emerald-200 text-emerald-700 text-xs font-bold rounded hover:bg-emerald-100 transition-colors">
                                Aplicar Cambios
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
                        <h3 className="font-bold text-lg mb-2">Simulación de Escenarios</h3>
                        <div className="space-y-4 text-sm text-slate-300">
                            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <span>Escenario Base</span>
                                <span className="text-white font-bold">Crecimiento 5%</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <span>Escenario Agresivo</span>
                                <span className="text-emerald-400 font-bold">Crecimiento 12% (Promo)</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                <span>Escenario Conservador</span>
                                <span className="text-amber-400 font-bold">Caída -2% (Recesión)</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};