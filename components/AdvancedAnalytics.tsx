import React, { useState } from 'react';
import { 
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart, Legend, 
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell, ReferenceLine,
    PieChart, Pie
} from 'recharts';
import { 
    BrainCircuit, Box, Activity, Target, Factory, DollarSign, Tag, XCircle, 
    Users, Truck, FlaskConical, TrendingUp, Network, AlertTriangle, Play, 
    Layers, Search, ArrowRight, Zap, Microscope, Sigma, TrendingDown, Percent,
    Wallet, CreditCard, Landmark, Coins, Sparkles, GitBranch, Binary
} from 'lucide-react';

// --- MOCK ANALYTICS DATA ---
const BUBBLE_DATA = Array.from({ length: 20 }, (_, i) => ({
    id: `SKU-${100 + i}`,
    x: Math.floor(Math.random() * 180), // Aging Days
    y: Math.floor(Math.random() * 20000), // Value
    z: Math.floor(Math.random() * 100), // Risk Score
    name: `Prod ${i + 1}`,
    category: i % 3 === 0 ? 'RM' : 'FG'
}));

const DEMAND_CURVES = [
    { day: 1, actual: 100, predicted: 105, volatility: 5 },
    { day: 2, actual: 120, predicted: 110, volatility: 8 },
    { day: 3, actual: 90, predicted: 95, volatility: 12 },
    { day: 4, actual: 150, predicted: 140, volatility: 20 }, // Break pattern
    { day: 5, actual: 160, predicted: 145, volatility: 15 },
    { day: 6, actual: 170, predicted: 160, volatility: 10 },
];

const FORECAST_BIAS = [
    { bucket: '-20%', count: 5 },
    { bucket: '-10%', count: 12 },
    { bucket: '0%', count: 30 }, // Good
    { bucket: '+10%', count: 15 },
    { bucket: '+20%', count: 8 }, // Chronic Overstock
];

const SIMULATION_BASE = {
    revenue: 1200000,
    margin: 35,
    cash: 250000,
    inventory: 400000
};

// --- DATA FOR COST ANALYSIS (SECTION 5) ---
const COST_EVOLUTION_DATA = [
    { month: 'Oct', standard: 45.00, real: 45.10, ppv: 0.10 },
    { month: 'Nov', standard: 45.00, real: 46.20, ppv: 1.20 },
    { month: 'Dic', standard: 45.00, real: 48.50, ppv: 3.50 }, // High variance
    { month: 'Ene', standard: 46.50, real: 47.00, ppv: 0.50 }, // Std adjusted
    { month: 'Feb', standard: 46.50, real: 46.80, ppv: 0.30 },
    { month: 'Mar', standard: 46.50, real: 49.10, ppv: 2.60 }, // Inflation spike
];

const COST_STRUCTURE_DATA = [
    { family: 'Recubrimientos', material: 65, labor: 15, overhead: 10, logistics: 10 },
    { family: 'Solventes', material: 85, labor: 5, overhead: 5, logistics: 5 },
    { family: 'Aditivos', material: 40, labor: 25, overhead: 25, logistics: 10 },
    { family: 'Pigmentos', material: 70, labor: 10, overhead: 15, logistics: 5 },
];

const RAW_MATERIAL_INFLATION = [
    { name: 'Resina Epóxica', index: 112, trend: 'up', impact: 'High' },
    { name: 'Dióxido Titanio', index: 105, trend: 'up', impact: 'Medium' },
    { name: 'Solvente Xileno', index: 98, trend: 'down', impact: 'Low' },
    { name: 'Envase Plástico', index: 108, trend: 'up', impact: 'Medium' },
];

// --- DATA FOR PRICING ANALYSIS (SECTION 6) ---
const ELASTICITY_DATA = [
    { name: 'Prod A', priceDelta: 5, volDelta: -2, z: 10000, label: 'Inelástico (Oportunidad)' },
    { name: 'Prod B', priceDelta: 8, volDelta: -12, z: 5000, label: 'Elástico' },
    { name: 'Prod C', priceDelta: -5, volDelta: 2, z: 8000, label: 'Inelástico (Mala bajada)' },
    { name: 'Prod D', priceDelta: 2, volDelta: -1, z: 12000, label: 'Estable' },
    { name: 'Prod E', priceDelta: 10, volDelta: -25, z: 4000, label: 'Muy Elástico (Peligro)' },
    { name: 'Prod F', priceDelta: -2, volDelta: 10, z: 6000, label: 'Alta Respuesta' },
];

const PRICE_WATERFALL = [
    { name: 'Precio Lista', value: 100, fill: '#64748b' },
    { name: 'Desc. Estándar', value: -15, fill: '#f59e0b' },
    { name: 'Promo', value: -5, fill: '#eab308' },
    { name: 'Rebates', value: -3, fill: '#84cc16' },
    { name: 'Flete', value: -4, fill: '#10b981' },
    { name: 'Precio Bolsillo', value: 73, fill: '#3b82f6' }, // The result
];

const MARGIN_LEAKAGE = [
    { customer: 'Distribuidora Global', approved: 15, actual: 18, leak: 3 },
    { customer: 'Pinturas del Norte', approved: 10, actual: 14, leak: 4 },
    { customer: 'Constructora Mega', approved: 20, actual: 21, leak: 1 },
    { customer: 'Taller San José', approved: 5, actual: 12, leak: 7 }, // High leak
];

// --- DATA FOR PURCHASING & VENDORS (SECTION 9) ---
const VENDOR_PERFORMANCE = [
    { name: 'Global Chem', leadTimeVar: 12, qualityScore: 98, spend: 450000, risk: 'Low' },
    { name: 'Local Supply', leadTimeVar: 2, qualityScore: 92, spend: 120000, risk: 'Low' },
    { name: 'Asian Polymers', leadTimeVar: 25, qualityScore: 95, spend: 300000, risk: 'High' },
    { name: 'Insumos Fast', leadTimeVar: 5, qualityScore: 85, spend: 50000, risk: 'Medium' },
    { name: 'Tech Materials', leadTimeVar: 8, qualityScore: 99, spend: 200000, risk: 'Low' },
    { name: 'EcoSolvents', leadTimeVar: 15, qualityScore: 88, spend: 80000, risk: 'Medium' },
];

const PPV_TREND = [
    { month: 'Oct', standard: 100, actual: 102 },
    { month: 'Nov', standard: 100, actual: 99 },
    { month: 'Dic', standard: 100, actual: 105 },
    { month: 'Ene', standard: 102, actual: 103 },
    { month: 'Feb', standard: 102, actual: 101 },
    { month: 'Mar', standard: 102, actual: 108 },
];

const SUPPLY_RISK_DIST = [
    { name: 'Logístico', value: 45, color: '#3b82f6' },
    { name: 'Calidad', value: 25, color: '#f59e0b' },
    { name: 'Geopolítico', value: 15, color: '#ef4444' },
    { name: 'Financiero', value: 15, color: '#10b981' },
];

// --- DATA FOR FINANCIAL ANALYTICS (SECTION 11) ---
const CCC_WATERFALL = [
    { name: 'DIO (Inventario)', value: 65, fill: '#3b82f6' }, // Days Inventory Outstanding
    { name: 'DSO (Cobro)', value: 45, fill: '#f59e0b' }, // Days Sales Outstanding
    { name: 'DPO (Pago)', value: -30, fill: '#10b981' }, // Days Payable Outstanding (Negative impact on cycle)
    { name: 'CCC Total', value: 80, fill: '#6366f1' }, // Net Cycle (65+45-30)
];

const WORKING_CAPITAL_TREND = [
    { month: 'Oct', assets: 500, liabilities: 200, ratio: 2.5 },
    { month: 'Nov', assets: 520, liabilities: 210, ratio: 2.47 },
    { month: 'Dic', assets: 600, liabilities: 300, ratio: 2.0 }, // Cash consumed by inventory
    { month: 'Ene', assets: 550, liabilities: 250, ratio: 2.2 },
    { month: 'Feb', assets: 580, liabilities: 240, ratio: 2.4 },
    { month: 'Mar', assets: 620, liabilities: 230, ratio: 2.7 }, // Strong recovery
];

const GMROI_SCATTER = [
    { name: 'Cat A', turns: 12, margin: 15, revenue: 500000, label: 'Ganar y Girar' }, // High Turn, Low Margin
    { name: 'Cat B', turns: 3, margin: 45, revenue: 300000, label: 'Cash Cow' }, // Low Turn, High Margin
    { name: 'Cat C', turns: 2, margin: 15, revenue: 100000, label: 'Perro (Problema)' }, // Low Turn, Low Margin
    { name: 'Cat D', turns: 8, margin: 40, revenue: 450000, label: 'Estrella' }, // High Turn, High Margin
    { name: 'Cat E', turns: 5, margin: 25, revenue: 200000, label: 'Promedio' },
];

// --- DATA FOR IA / ML ENGINE (SECTION 12) ---
const ANOMALY_DATA = [
    { x: 100, y: 200, isAnomaly: false },
    { x: 120, y: 240, isAnomaly: false },
    { x: 130, y: 260, isAnomaly: false },
    { x: 140, y: 280, isAnomaly: false },
    { x: 150, y: 700, isAnomaly: true, label: 'Fuga Energía' }, // Anomaly
    { x: 160, y: 320, isAnomaly: false },
    { x: 170, y: 340, isAnomaly: false },
    { x: 180, y: 150, isAnomaly: true, label: 'Paro Línea' }, // Anomaly
    { x: 190, y: 380, isAnomaly: false },
];

const FEATURE_IMPORTANCE = [
    { name: 'Precio Competencia', value: 85, fill: '#3b82f6' },
    { name: 'Promociones', value: 72, fill: '#6366f1' },
    { name: 'Clima (Humedad)', value: 45, fill: '#8b5cf6' },
    { name: 'Día de la Semana', value: 30, fill: '#a855f7' },
    { name: 'Tendencia Google', value: 20, fill: '#d8b4fe' },
];

const AUTO_RULES = [
    { id: 1, rule: "IF Temperatura > 32°C THEN Venta 'Impermeabilizante' +25%", confidence: 94, impact: 'High' },
    { id: 2, rule: "IF LeadTime > 45d AND Stock < 200u THEN Riesgo Quiebre = Crítico", confidence: 98, impact: 'High' },
    { id: 3, rule: "IF Cliente = 'Constructora X' AND Mes = 'Diciembre' THEN Devolución +15%", confidence: 82, impact: 'Medium' },
];


// --- REUSABLE COMPONENTS ---

const InsightCard = ({ title, insight, type = 'neutral' }: { title: string, insight: string, type?: 'risk' | 'opportunity' | 'neutral' }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
        type === 'risk' ? 'bg-rose-50 border-rose-500' : 
        type === 'opportunity' ? 'bg-emerald-50 border-emerald-500' : 
        'bg-slate-50 border-slate-400'
    }`}>
        <h4 className={`text-xs font-bold uppercase mb-1 ${
            type === 'risk' ? 'text-rose-700' : 
            type === 'opportunity' ? 'text-emerald-700' : 
            'text-slate-600'
        }`}>{title}</h4>
        <p className="text-sm text-slate-800 leading-relaxed font-medium">{insight}</p>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
    <div className="mb-6 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <div className="p-2 bg-slate-900 rounded-lg mr-3">
                <Icon className="w-6 h-6 text-white" />
            </div>
            {title}
        </h2>
        <p className="text-slate-500 mt-1 ml-14">{subtitle}</p>
    </div>
);

export const AdvancedAnalytics: React.FC = () => {
    const [activeSection, setActiveSection] = useState<number>(1);
    
    // Simulation State
    const [simPrice, setSimPrice] = useState(0); // % change
    const [simCost, setSimCost] = useState(0); // % change
    const [simDemand, setSimDemand] = useState(0); // % change

    const SECTIONS = [
        { id: 1, title: "Análisis de Inventario Profundo", icon: Box, desc: "Rotación, Silencioso, Aging Ponderado, Churn" },
        { id: 2, title: "Análisis de Demanda Avanzado", icon: Activity, desc: "Curvas, Volatilidad, Canibalización, Deriva" },
        { id: 3, title: "Forecast Diagnostics", icon: Target, desc: "MAPE, Bias, Confidence Intervals, Backtesting" },
        { id: 4, title: "Análisis de Producción", icon: Factory, desc: "Yield, Mermas, Cost Variance, Cuellos de Botella" },
        { id: 5, title: "Análisis de Costos", icon: DollarSign, desc: "Costo Real vs Std, Inflación Interna, Cost-to-Serve" },
        { id: 6, title: "Análisis de Pricing", icon: Tag, desc: "Elasticidad, Sensibilidad, Precio Óptimo" },
        { id: 7, title: "Ventas Perdidas", icon: XCircle, desc: "Quiebres, Retrasos, ATP Block, Revenue Leakage" },
        { id: 8, title: "Análisis de Clientes", icon: Users, desc: "Rentabilidad Real, Churn Risk, Complejidad" },
        { id: 9, title: "Compras y Proveedores", icon: Truck, desc: "Lead Time Real, Variabilidad, Dependencia" },
        { id: 10, title: "Simulación & Escenarios", icon: Play, desc: "What-If Analysis, Stress Test, Supply Crisis" },
        { id: 11, title: "Finanzas Avanzadas", icon: Layers, desc: "Cash Tied, Cash Risk, Working Capital Efficiency" },
        { id: 12, title: "IA / ML Engine", icon: BrainCircuit, desc: "Anomalías, Reglas Autoaprendidas, Clustering" },
        { id: 13, title: "System Meta-Analytics", icon: Microscope, desc: "Data Quality Drift, Latencia, Model Error" },
        { id: 14, title: "Cruces Avanzados", icon: Network, desc: "Matrices Multidimensionales (Valor x Riesgo x Margen)" },
    ];

    const renderContent = () => {
        switch(activeSection) {
            case 1: // Inventory Deep
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Box} title="Análisis de Inventario Profundo" subtitle="Diagnóstico vectorial de salud del inventario: Riesgo vs. Valor vs. Envejecimiento." />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Matriz de Riesgo de Obsolescencia (Bubble Plot)</h3>
                                <p className="text-xs text-slate-500 mb-4">Eje X: Aging Days | Eje Y: Valor Total ($) | Tamaño: Risk Score (Probabilidad Vencimiento)</p>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid />
                                            <XAxis type="number" dataKey="x" name="Días Aging" unit="d" />
                                            <YAxis type="number" dataKey="y" name="Valor" unit="$" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <ReferenceLine x={90} stroke="red" strokeDasharray="3 3" label="Critical Aging" />
                                            <Scatter name="SKUs" data={BUBBLE_DATA} fill="#8884d8">
                                                {BUBBLE_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.x > 90 ? '#ef4444' : entry.x > 60 ? '#f59e0b' : '#10b981'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <InsightCard 
                                    type="risk"
                                    title="Riesgo Detectado"
                                    insight="Se detecta 'churn' negativo en SKUs de alto valor. El inventario silencioso (aging > 90) creció un 12% vs mes anterior."
                                />
                                <InsightCard 
                                    type="opportunity"
                                    title="Oportunidad de Liquidación"
                                    insight="5 SKUs concentran el 40% del riesgo de vencimiento. Ejecutar promoción flash liberaría $45k en caja inmediata."
                                />
                                <div className="bg-slate-900 text-white p-4 rounded-xl">
                                    <div className="text-xs text-slate-400 uppercase">Velocidad de Salida (Weighted)</div>
                                    <div className="text-2xl font-bold font-mono text-emerald-400">452 units/day</div>
                                    <div className="text-xs text-slate-400 mt-2">Cobertura Real: <span className="text-white font-bold">42 días</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Demand Advanced
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Activity} title="Análisis de Demanda Avanzado" subtitle="Deconstrucción de patrones de consumo, volatilidad y canibalización." />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">Detección de Rupturas Estructurales</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={DEMAND_CURVES}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="volatility" fill="#fee2e2" stroke="#ef4444" name="Volatilidad (CV)" />
                                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Demanda Real" />
                                            <Line type="monotone" dataKey="predicted" stroke="#94a3b8" strokeDasharray="5 5" name="Modelo Base" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">SKU Cannibalization Matrix</h3>
                                <p className="text-sm text-slate-500 mb-4">Impacto de la introducción de "Prod B" sobre "Prod A".</p>
                                <div className="flex items-center justify-center h-48 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-rose-600">-15%</div>
                                        <div className="text-sm text-slate-600">Erosión en Prod A</div>
                                        <div className="w-px h-8 bg-slate-300 mx-auto my-2"></div>
                                        <div className="text-3xl font-bold text-emerald-600">+40%</div>
                                        <div className="text-sm text-slate-600">Captura en Prod B</div>
                                        <div className="mt-2 text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Neto: +25% Volumen</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <InsightCard 
                            title="Diagnóstico de Estacionalidad"
                            insight="La volatilidad en el Día 4 no es estacionalidad, es un evento atípico (Ruptura de Patrón). El modelo ha sido ajustado para ignorar este outlier en el futuro."
                        />
                    </div>
                );

            case 3: // Forecast Diagnostics
                 return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Target} title="Forecast Diagnostics" subtitle="Auditoría forense de la precisión de los modelos predictivos." />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">Histograma de Sesgo (Bias Distribution)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={FORECAST_BIAS}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="bucket" />
                                        <YAxis />
                                        <Tooltip cursor={{fill: 'transparent'}} />
                                        <ReferenceLine x="0%" stroke="#10b981" label="Perfect" />
                                        <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]}>
                                            {FORECAST_BIAS.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.bucket === '0%' ? '#10b981' : entry.bucket.includes('+') ? '#f59e0b' : '#3b82f6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Forecast Drift</div>
                                    <div className="text-3xl font-bold text-rose-600 mt-1">2.4% / mes</div>
                                    <p className="text-xs text-slate-400 mt-2">El modelo pierde precisión a medida que se aleja el horizonte.</p>
                                </div>
                                <InsightCard 
                                    type="risk"
                                    title="Sobreestimación Crónica"
                                    insight="Se detecta un sesgo positivo sistemático en la Familia 'Pinturas'. El equipo comercial está inflando el input manual en un +15% vs realidad histórica."
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4: // Production Analysis
                const PRODUCTION_TREND = [
                    { month: 'Oct', volume: 12000, yield: 98.2, variance: 0.5 },
                    { month: 'Nov', volume: 13500, yield: 97.5, variance: 1.2 },
                    { month: 'Dic', volume: 11000, yield: 95.0, variance: 3.8 }, // Issue here
                    { month: 'Ene', volume: 12500, yield: 96.5, variance: 2.1 },
                    { month: 'Feb', volume: 14000, yield: 97.8, variance: 0.8 },
                    { month: 'Mar', volume: 14500, yield: 98.0, variance: 0.4 },
                ];

                const WASTE_PARETO = [
                    { reason: 'Purga Inicio', cost: 4500 },
                    { reason: 'Falla Envasadora', cost: 3200 },
                    { reason: 'Muestra Calidad', cost: 1500 },
                    { reason: 'Derrame', cost: 800 },
                    { reason: 'Ajuste Color', cost: 500 },
                ];

                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Factory} title="Análisis de Producción" subtitle="Eficiencia de planta, rendimiento de lotes y variaciones de costo industrial." />
                        
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Yield Global (YTD)</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">97.2%</div>
                                <div className="text-xs text-slate-400 mt-1">Meta: &gt;98.0%</div>
                            </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Costo No-Calidad</div>
                                <div className="text-2xl font-bold text-rose-600 mt-2">$10.5k</div>
                                <div className="text-xs text-slate-400 mt-1">Últimos 30 días</div>
                            </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">OEE Planta</div>
                                <div className="text-2xl font-bold text-amber-500 mt-2">74.5%</div>
                                <div className="text-xs text-slate-400 mt-1">Baja Disponibilidad Línea 2</div>
                            </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Var. Costo Conversión</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">-1.2%</div>
                                <div className="text-xs text-slate-400 mt-1">Mejor que estándar</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart: Yield vs Volume */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Tendencia de Rendimiento vs Volumen</h3>
                                <div className="h-72">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={PRODUCTION_TREND}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" />
                                            <YAxis yAxisId="left" orientation="left" stroke="#64748b" />
                                            <YAxis yAxisId="right" orientation="right" domain={[90, 100]} stroke="#10b981" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="volume" name="Volumen (kg)" fill="#94a3b8" barSize={30} radius={[4,4,0,0]} />
                                            <Line yAxisId="right" type="monotone" dataKey="yield" name="Yield %" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Pareto of Waste */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                 <h3 className="font-bold text-slate-800 mb-4">Pareto de Mermas (Por Costo)</h3>
                                 <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={WASTE_PARETO} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                                            <YAxis dataKey="reason" type="category" width={100} tick={{fontSize: 11}} />
                                            <Tooltip formatter={(v) => `$${v}`} />
                                            <Bar dataKey="cost" fill="#f43f5e" radius={[0,4,4,0]} barSize={25}>
                                                {WASTE_PARETO.map((entry, index) => (
                                                     <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#fca5a5'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                            </div>
                        </div>

                        {/* Bottleneck Visualization (Simple CSS representation) */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-indigo-600"/>
                                Monitor de Flujo de Proceso (Cuellos de Botella)
                            </h3>
                            <div className="flex items-center justify-between relative px-4">
                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-0"></div>

                                {/* Step 1: Mixing */}
                                <div className="relative z-10 flex flex-col items-center bg-white p-2">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-sm text-emerald-600">
                                        <FlaskConical className="w-6 h-6" />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="font-bold text-sm text-slate-700">Mezclado</div>
                                        <div className="text-xs text-emerald-600 font-bold">98% OEE</div>
                                    </div>
                                </div>

                                {/* Step 2: Reaction */}
                                <div className="relative z-10 flex flex-col items-center bg-white p-2">
                                     <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-sm text-emerald-600">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="font-bold text-sm text-slate-700">Reacción</div>
                                        <div className="text-xs text-emerald-600 font-bold">95% OEE</div>
                                    </div>
                                </div>

                                 {/* Step 3: Filling (Bottleneck) */}
                                 <div className="relative z-10 flex flex-col items-center bg-white p-2">
                                     <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center border-4 border-white shadow-lg shadow-rose-100 text-rose-600 animate-pulse">
                                        <Factory className="w-6 h-6" />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="font-bold text-sm text-rose-700">Envasado</div>
                                        <div className="text-xs text-rose-600 font-bold">65% OEE</div>
                                        <div className="text-[10px] text-slate-400 bg-slate-100 px-2 rounded mt-1">CUELLO BOTELLA</div>
                                    </div>
                                </div>

                                 {/* Step 4: Packing */}
                                 <div className="relative z-10 flex flex-col items-center bg-white p-2">
                                     <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center border-4 border-white shadow-sm text-amber-600">
                                        <Box className="w-6 h-6" />
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="font-bold text-sm text-slate-700">Empaque</div>
                                        <div className="text-xs text-amber-600 font-bold">88% OEE</div>
                                         <div className="text-[10px] text-slate-400 mt-1">Starved</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <InsightCard 
                            type="risk"
                            title="Acción Requerida en Envasado"
                            insight="La etapa de Envasado está limitando el Throughput total de la planta (65% OEE). El principal motivo de paro es 'Falla de sensor en tolva'. Resolver esto aumentaría la capacidad en un 15% sin inversión de capital."
                        />
                    </div>
                );

            case 5: // Cost Analysis
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={DollarSign} title="Análisis de Costos" subtitle="Desglose estructural de varianzas: Standard vs Real, Inflación y Costo de Servir." />

                        {/* Financial KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Varianza Total (PPV)</div>
                                <div className="text-2xl font-bold text-rose-600 mt-2">+$2.60</div>
                                <div className="text-xs text-slate-400 mt-1">Promedio por Unidad (Marzo)</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Impacto Inflación MP</div>
                                <div className="text-2xl font-bold text-amber-500 mt-2">+$12.5k</div>
                                <div className="text-xs text-slate-400 mt-1">Acumulado YTD</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Absorción Overhead</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">98.5%</div>
                                <div className="text-xs text-slate-400 mt-1">Alta utilización de planta</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Costo Logístico / Venta</div>
                                <div className="text-2xl font-bold text-slate-700 mt-2">4.8%</div>
                                <div className="text-xs text-slate-400 mt-1">Dentro del objetivo (5%)</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart: Standard vs Real Cost Evolution */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Evolución Costo Unitario Promedio (Std vs Real)</h3>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={COST_EVOLUTION_DATA}>
                                            <defs>
                                                <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" />
                                            <YAxis domain={['auto', 'auto']} />
                                            <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                                            <Legend />
                                            <Area type="monotone" dataKey="real" name="Costo Real" stroke="#f43f5e" fillOpacity={1} fill="url(#colorReal)" strokeWidth={2} />
                                            <Line type="step" dataKey="standard" name="Costo Estándar" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart: Cost Structure */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Estructura de Costos por Familia (%)</h3>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={COST_STRUCTURE_DATA} layout="vertical" stackOffset="expand">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                            <YAxis dataKey="family" type="category" width={100} />
                                            <Tooltip formatter={(v: number) => `${v}%`} />
                                            <Legend />
                                            <Bar dataKey="material" name="Mat. Prima" stackId="a" fill="#3b82f6" />
                                            <Bar dataKey="labor" name="Mano Obra" stackId="a" fill="#f59e0b" />
                                            <Bar dataKey="overhead" name="Indirectos" stackId="a" fill="#64748b" />
                                            <Bar dataKey="logistics" name="Logística" stackId="a" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Raw Material Inflation Monitor */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-slate-600"/>
                                Monitor de Inflación (Top Commodities)
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Insumo Clave</th>
                                            <th className="px-6 py-3 text-center">Índice Precio (Base 100)</th>
                                            <th className="px-6 py-3 text-center">Tendencia</th>
                                            <th className="px-6 py-3 text-right">Impacto Costo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {RAW_MATERIAL_INFLATION.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                                <td className="px-6 py-4 text-center font-mono">{item.index}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        {item.trend === 'up' 
                                                            ? <TrendingUp className="w-4 h-4 text-rose-500" />
                                                            : <TrendingDown className="w-4 h-4 text-emerald-500" />
                                                        }
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        item.impact === 'High' ? 'bg-rose-100 text-rose-700' : 
                                                        item.impact === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {item.impact}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <InsightCard 
                            type="risk"
                            title="Alerta de Margen: Resinas"
                            insight="El incremento del 12% en el índice de precios de Resina Epóxica no ha sido trasladado al precio de venta del 'Kit Epóxico Marino', erosionando el margen bruto en 4 puntos porcentuales este mes."
                        />
                    </div>
                );

            case 6: // Pricing Analysis
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Tag} title="Análisis de Pricing" subtitle="Elasticidad, Rentabilidad y Optimización de Márgenes." />

                        {/* Top KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Precio Promedio (ASP)</div>
                                    <DollarSign className="w-4 h-4 text-blue-600"/>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 mt-2">$42.50</div>
                                <div className="text-xs text-emerald-600 mt-1 flex items-center font-bold">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +2.1%
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Tasa de Descuento</div>
                                    <Percent className="w-4 h-4 text-amber-500"/>
                                </div>
                                <div className="text-2xl font-bold text-amber-600 mt-2">18.5%</div>
                                <div className="text-xs text-slate-400 mt-1">Alta (Meta &lt; 15%)</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Realización de Precio</div>
                                    <Target className="w-4 h-4 text-emerald-600"/>
                                </div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">92.0%</div>
                                <div className="text-xs text-slate-400 mt-1">Efectividad comercial</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="text-xs font-bold text-slate-500 uppercase">Fuga de Margen</div>
                                    <XCircle className="w-4 h-4 text-rose-600"/>
                                </div>
                                <div className="text-2xl font-bold text-rose-600 mt-2">$15.2k</div>
                                <div className="text-xs text-slate-400 mt-1">Descuentos no aprobados</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart 1: Price Elasticity Scatter */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">Matriz de Elasticidad Precio-Volumen</h3>
                                <p className="text-xs text-slate-500 mb-4">Eje X: Cambio Precio (%) | Eje Y: Cambio Volumen (%)</p>
                                <div className="h-80 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid />
                                            <XAxis type="number" dataKey="priceDelta" name="Cambio Precio" unit="%" domain={[-10, 15]} />
                                            <YAxis type="number" dataKey="volDelta" name="Cambio Volumen" unit="%" domain={[-30, 15]} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={2} />
                                            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                                            <Scatter name="Elasticidad" data={ELASTICITY_DATA} fill="#8884d8">
                                                {ELASTICITY_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.volDelta < -10 && entry.priceDelta > 0 ? '#ef4444' : '#10b981'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-2 right-2 text-xs font-bold text-rose-600">Zona Peligro (Elástica)</div>
                                    <div className="absolute top-2 left-2 text-xs font-bold text-emerald-600">Oportunidad (Volumen)</div>
                                </div>
                            </div>

                            {/* Chart 2: Pocket Price Waterfall */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Waterfall de Precios (Pocket Price)</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={PRICE_WATERFALL}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                                            <YAxis />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <Bar dataKey="value" label={{ position: 'top' }}>
                                                {PRICE_WATERFALL.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Margin Leakage by Customer */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <Search className="w-5 h-5 mr-2 text-slate-600"/>
                                    Análisis de Desviación de Descuentos (Top Clientes)
                                </h3>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Cliente</th>
                                            <th className="px-6 py-3 text-center">Desc. Aprobado</th>
                                            <th className="px-6 py-3 text-center">Desc. Real Aplicado</th>
                                            <th className="px-6 py-3 text-right">Fuga (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {MARGIN_LEAKAGE.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 font-medium text-slate-900">{item.customer}</td>
                                                <td className="px-6 py-4 text-center text-slate-500">{item.approved}%</td>
                                                <td className="px-6 py-4 text-center font-bold text-slate-800">{item.actual}%</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        item.leak > 5 ? 'bg-rose-100 text-rose-700' : 
                                                        item.leak > 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        +{item.leak}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-4">
                                <InsightCard 
                                    type="opportunity"
                                    title="Oportunidad de Precio"
                                    insight="El 'Prod A' muestra comportamiento inelástico (Cuadrante superior derecho). Subir el precio un 5% solo reduciría el volumen un 2%, mejorando el margen neto total."
                                />
                                <InsightCard 
                                    type="risk"
                                    title="Fuga en Taller San José"
                                    insight="El cliente 'Taller San José' tiene un descuento real del 12% vs aprobado del 5%. Se detectan múltiples notas de crédito manuales."
                                />
                            </div>
                        </div>
                    </div>
                );

            case 7: // Ventas Perdidas
                const REVENUE_WATERFALL = [
                    { name: 'Potencial', value: 1000000, fill: '#94a3b8' },
                    { name: 'Quiebre Stock', value: -120000, fill: '#ef4444' }, // Lost
                    { name: 'Bloqueo ATP', value: -80000, fill: '#f59e0b' }, // Blocked
                    { name: 'Logística', value: -30000, fill: '#eab308' }, // Delayed
                    { name: 'Real (Capturado)', value: 770000, fill: '#10b981' },
                ];

                const FRICTION_CLIENTS = [
                    { name: 'Constructora Mega', lost: 45000, blocked: 20000, friction: 'Alta', incidents: 5 },
                    { name: 'Pinturas del Norte', lost: 12000, blocked: 50000, friction: 'Crítica', incidents: 8 },
                    { name: 'Taller San José', lost: 5000, blocked: 0, friction: 'Media', incidents: 2 },
                ];

                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={XCircle} title="Análisis de Ventas Perdidas & Fricción" subtitle="Cuantificación de ingresos no capturados por ineficiencias de inventario." />
                        
                        {/* KPI GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-rose-500">
                                <div className="text-xs font-bold text-slate-500 uppercase">Total Ingresos No Capturados</div>
                                <div className="text-3xl font-bold text-rose-600 mt-2">$230,000</div>
                                <div className="text-xs text-slate-400 mt-1">~18.5% del Potencial Total</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Bloqueo por ATP</div>
                                <div className="text-3xl font-bold text-amber-500 mt-2">$80,000</div>
                                <div className="text-xs text-slate-400 mt-1">Stock existente pero mal asignado</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Impacto en Revenue</div>
                                <div className="text-3xl font-bold text-slate-700 mt-2">-12.5%</div>
                                <div className="text-xs text-slate-400 mt-1">Debido exclusivamente a Quiebres</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Waterfall Chart */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Puente de Ingresos (Revenue Bridge)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={REVENUE_WATERFALL}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{fontSize: 10}} />
                                        <YAxis />
                                        <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `$${Math.abs(value).toLocaleString('es-CO')} COP COP COP COP`} />
                                        <Bar dataKey="value" radius={[4,4,0,0]}>
                                            {REVENUE_WATERFALL.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Client Friction Table */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-slate-600"/>
                                    Clientes con Fricción Recurrente
                                </h3>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-2">Cliente</th>
                                            <th className="px-4 py-2 text-right">Venta Perdida</th>
                                            <th className="px-4 py-2 text-right">ATP Block</th>
                                            <th className="px-4 py-2 text-center">Nivel Fricción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {FRICTION_CLIENTS.map((client, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 font-medium">{client.name}</td>
                                                <td className="px-4 py-3 text-right text-rose-600 font-bold">${client.lost.toLocaleString('es-CO')} COP COP</td>
                                                <td className="px-4 py-3 text-right text-amber-600 font-medium">${client.blocked.toLocaleString('es-CO')} COP COP</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        client.friction === 'Crítica' ? 'bg-rose-100 text-rose-700' :
                                                        client.friction === 'Alta' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {client.friction}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        <InsightCard 
                            type="risk"
                            title="Diagnóstico de Fuga"
                            insight="El 65% de los ingresos no capturados provienen de 'Pinturas del Norte' debido a una mala configuración de prioridades ATP. Hay stock físico ($50k), pero está reservado para clientes de menor valor."
                        />
                    </div>
                );

            case 8: // Customer Analysis
                const CUSTOMER_SCATTER = [
                    { id: 'C1', x: 20, y: 85, z: 10, name: 'MegaConstrucciones', segment: 'Estratégico' },
                    { id: 'C2', x: 30, y: 75, z: 20, name: 'Global Paints', segment: 'Estratégico' },
                    { id: 'C3', x: 80, y: 25, z: 50, name: 'Taller X', segment: 'Revisar' },
                    { id: 'C4', x: 70, y: 90, z: 80, name: 'Industrias B', segment: 'Desarrollar' },
                    { id: 'C5', x: 15, y: 40, z: 5, name: 'Local A', segment: 'Mantenimiento' },
                ];

                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                         <SectionHeader icon={Users} title="Análisis de Clientes (Customer 360)" subtitle="Segmentación por valor real, costo de servicio y riesgo de fuga." />
                         
                         {/* KPIs */}
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Dependencia (Pareto)</div>
                                <div className="text-2xl font-bold text-rose-600 mt-1">45%</div>
                                <div className="text-xs text-slate-400">Top 3 Clientes concentran el ingreso</div>
                            </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Riesgo Churn</div>
                                <div className="text-2xl font-bold text-amber-500 mt-1">12%</div>
                                <div className="text-xs text-slate-400">Volatilidad de pedidos {'>'} 30%</div>
                            </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Rentabilidad Avg</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-1">28.4%</div>
                                <div className="text-xs text-slate-400">Margen neto después de servicio</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Inv. Silencioso Generado</div>
                                <div className="text-2xl font-bold text-rose-600 mt-1">$45k</div>
                                <div className="text-xs text-slate-400">Pedidos cancelados / únicos</div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Matrix */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Matriz Valor vs Complejidad</h3>
                                <p className="text-xs text-slate-500 mb-4">Eje X: Complejidad (Costo Servicio) | Eje Y: Valor (Margen) | Tamaño: Volatilidad</p>
                                <div className="h-80 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid />
                                            <XAxis type="number" dataKey="x" name="Complejidad" unit="%" />
                                            <YAxis type="number" dataKey="y" name="Valor" unit="%" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            {/* Quadrant Lines */}
                                            <ReferenceLine x={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                                            <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                                            <Scatter name="Clientes" data={CUSTOMER_SCATTER} fill="#8884d8">
                                                {CUSTOMER_SCATTER.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.x > 50 && entry.y < 50 ? '#ef4444' : entry.x < 50 && entry.y > 50 ? '#10b981' : '#f59e0b'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-2 right-2 text-xs font-bold text-emerald-600">Estratégicos</div>
                                    <div className="absolute bottom-2 right-2 text-xs font-bold text-rose-600">Revisar/Eliminar</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Silent Inventory Generators */}
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                                        Generadores de Stock Silencioso
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-4 py-2">Cliente</th>
                                                    <th className="px-4 py-2">SKU Atrapado</th>
                                                    <th className="px-4 py-2 text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                <tr>
                                                    <td className="px-4 py-3 font-medium">Taller X</td>
                                                    <td className="px-4 py-3 text-slate-500">SKU-SPECIAL-99</td>
                                                    <td className="px-4 py-3 text-right text-rose-600 font-bold">$12,400</td>
                                                </tr>
                                                 <tr>
                                                    <td className="px-4 py-3 font-medium">Industrias B</td>
                                                    <td className="px-4 py-3 text-slate-500">RM-OLD-ADDITIVE</td>
                                                    <td className="px-4 py-3 text-right text-rose-600 font-bold">$8,200</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <InsightCard 
                                    type="risk"
                                    title="Alerta de Dependencia"
                                    insight="El cliente 'Global Paints' representa el 28% del margen pero su volatilidad de pedidos ha subido al 45%. Riesgo alto de 'Bullwhip Effect' en producción."
                                />
                            </div>
                         </div>
                    </div>
                );

            case 9: // Compras y Proveedores
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Truck} title="Compras y Proveedores" subtitle="Inteligencia de Suministro: Riesgo, Desempeño y Costos (PPV)." />

                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Gasto Gestionado (YTD)</div>
                                <div className="text-2xl font-bold text-slate-900 mt-2">$1.2M</div>
                                <div className="text-xs text-emerald-600 mt-1 font-bold">+5.4% vs LY</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Lead Time Promedio</div>
                                <div className="text-2xl font-bold text-amber-500 mt-2">34 Días</div>
                                <div className="text-xs text-slate-400 mt-1">Target: 30 Días</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">PPV Global (Var. Precio)</div>
                                <div className="text-2xl font-bold text-rose-600 mt-2">+3.2%</div>
                                <div className="text-xs text-slate-400 mt-1">Inflación en Resinas</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Prov. Riesgo Alto</div>
                                <div className="text-2xl font-bold text-rose-600 mt-2">3</div>
                                <div className="text-xs text-slate-400 mt-1">Geopolítico / Financiero</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Chart 1: Vendor Performance Matrix */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">Matriz de Desempeño (Riesgo vs Calidad)</h3>
                                <p className="text-xs text-slate-500 mb-4">Eje X: Variabilidad Lead Time (Días) | Eje Y: Score Calidad (%) | Tamaño: Gasto</p>
                                <div className="h-80 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid />
                                            <XAxis type="number" dataKey="leadTimeVar" name="Var. Lead Time" unit="d" />
                                            <YAxis type="number" dataKey="qualityScore" name="Calidad" unit="%" domain={[80, 100]} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label="Meta Calidad" />
                                            <ReferenceLine x={10} stroke="#f59e0b" strokeDasharray="3 3" label="Límite Var." />
                                            <Scatter name="Proveedores" data={VENDOR_PERFORMANCE} fill="#8884d8">
                                                {VENDOR_PERFORMANCE.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.risk === 'High' ? '#ef4444' : entry.risk === 'Medium' ? '#f59e0b' : '#10b981'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2: PPV Trend */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Tendencia de Variación de Precio (PPV)</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={PPV_TREND}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="standard" name="Costo Std" fill="#cbd5e1" barSize={20} />
                                            <Line type="monotone" dataKey="actual" name="Costo Real" stroke="#f43f5e" strokeWidth={3} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Risk Distribution */}
                             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Distribución de Riesgos</h3>
                                <div className="h-64 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={SUPPLY_RISK_DIST}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {SUPPLY_RISK_DIST.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-4 text-center">
                                        <div className="text-xs text-slate-400">Total Riesgos</div>
                                        <div className="text-xl font-bold text-slate-800">12</div>
                                    </div>
                                </div>
                            </div>

                             {/* Vendor Details Table */}
                             <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <Truck className="w-5 h-5 mr-2 text-slate-600"/>
                                    Scorecard de Proveedores Críticos
                                </h3>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-2">Proveedor</th>
                                            <th className="px-4 py-2 text-center">Calidad</th>
                                            <th className="px-4 py-2 text-center">Var. Lead Time</th>
                                            <th className="px-4 py-2 text-center">Riesgo</th>
                                            <th className="px-4 py-2 text-right">Gasto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {VENDOR_PERFORMANCE.map((vendor, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 font-medium">{vendor.name}</td>
                                                <td className="px-4 py-3 text-center">
                                                     <span className={`font-bold ${vendor.qualityScore >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {vendor.qualityScore}%
                                                     </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono">
                                                    +{vendor.leadTimeVar}d
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        vendor.risk === 'High' ? 'bg-rose-100 text-rose-700' : 
                                                        vendor.risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                        {vendor.risk}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-600">
                                                    ${(vendor.spend / 1000).toFixed(0)}k
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                         
                         <InsightCard 
                            type="risk"
                            title="Riesgo de Suministro: Asian Polymers"
                            insight="El proveedor 'Asian Polymers' presenta una variabilidad de Lead Time crítica (+25 días) y está catalogado como Riesgo Alto. Se recomienda activar fuente alterna 'Local Supply' para cubrir el 30% del volumen."
                        />
                    </div>
                );

            case 10: // Simulation
                const simRevenue = SIMULATION_BASE.revenue * (1 + (simPrice/100)) * (1 + (simDemand/100));
                const simCOGS = (SIMULATION_BASE.revenue * 0.65) * (1 + (simCost/100)) * (1 + (simDemand/100));
                const simMargin = simRevenue - simCOGS;
                const simMarginPercent = (simMargin / simRevenue) * 100;

                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                         <SectionHeader icon={Play} title="Simulación & Escenarios (Digital Twin)" subtitle="Motor de What-If para estrés de cadena de suministro y rentabilidad." />
                         
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Controls */}
                            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                                <h3 className="font-bold text-lg mb-6 flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-400" /> Variables de Control</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2 text-sm font-medium">
                                            <span>Precio de Venta</span>
                                            <span className={simPrice > 0 ? 'text-emerald-400' : 'text-slate-300'}>{simPrice > 0 ? '+' : ''}{simPrice}%</span>
                                        </div>
                                        <input type="range" min="-20" max="20" value={simPrice} onChange={(e) => setSimPrice(Number(e.target.value))} className="w-full accent-blue-500" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2 text-sm font-medium">
                                            <span>Costo de Materia Prima</span>
                                            <span className={simCost > 0 ? 'text-rose-400' : 'text-slate-300'}>{simCost > 0 ? '+' : ''}{simCost}%</span>
                                        </div>
                                        <input type="range" min="-20" max="50" value={simCost} onChange={(e) => setSimCost(Number(e.target.value))} className="w-full accent-rose-500" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2 text-sm font-medium">
                                            <span>Elasticidad Demanda</span>
                                            <span className={simDemand > 0 ? 'text-emerald-400' : simDemand < 0 ? 'text-rose-400' : 'text-slate-300'}>{simDemand > 0 ? '+' : ''}{simDemand}%</span>
                                        </div>
                                        <input type="range" min="-50" max="50" value={simDemand} onChange={(e) => setSimDemand(Number(e.target.value))} className="w-full accent-purple-500" />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => { setSimPrice(0); setSimCost(0); setSimDemand(0); }}
                                    className="mt-8 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Resetear Escenario Base
                                </button>
                            </div>

                            {/* Results */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
                                        <div className="text-slate-500 text-xs font-bold uppercase">Ingresos Proyectados</div>
                                        <div className="text-2xl font-bold text-slate-900 mt-2">${(simRevenue/1000).toFixed(0)}k</div>
                                        <div className={`text-xs mt-1 ${simRevenue > SIMULATION_BASE.revenue ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {((simRevenue - SIMULATION_BASE.revenue) / SIMULATION_BASE.revenue * 100).toFixed(1)}% vs Base
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-300">
                                        <div className="text-slate-500 text-xs font-bold uppercase">Margen Neto (%)</div>
                                        <div className={`text-2xl font-bold mt-2 ${simMarginPercent < 30 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {simMarginPercent.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">Target &gt; 35%</div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-4">Proyección de Impacto Financiero</h3>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Base', val: SIMULATION_BASE.revenue / 1000 },
                                                { name: 'Simulado', val: simRevenue / 1000 },
                                            ]} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={80} />
                                                <Tooltip />
                                                <Bar dataKey="val" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40}>
                                                    {
                                                        [0,1].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : (simRevenue >= SIMULATION_BASE.revenue ? '#10b981' : '#ef4444')} />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <InsightCard 
                                        type={simMarginPercent < 30 ? 'risk' : 'neutral'}
                                        title="Análisis de Escenario"
                                        insight={simMarginPercent < 30 
                                            ? "ALERTA: Este escenario erosiona el margen por debajo del umbral de rentabilidad operativa. Se sugiere no aplicar descuentos agresivos con el costo actual."
                                            : "El escenario es saludable. El aumento de volumen compensa la reducción leve de precio."
                                        }
                                    />
                                </div>
                            </div>
                         </div>
                    </div>
                );

            case 11: // Finanzas Avanzadas
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Layers} title="Finanzas Avanzadas" subtitle="Optimización de Flujo de Caja, Capital de Trabajo y Retorno de Inventario (GMROI)." />

                        {/* Top KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Ciclo Cash (CCC)</div>
                                <div className="text-2xl font-bold text-slate-900 mt-2">80 Días</div>
                                <div className="text-xs text-rose-600 mt-1 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +5 días vs LY
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Ratio Capital Trabajo</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">2.7</div>
                                <div className="text-xs text-slate-400 mt-1">Activos / Pasivos Ctes</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Rotación Inventario</div>
                                <div className="text-2xl font-bold text-amber-500 mt-2">4.5x</div>
                                <div className="text-xs text-slate-400 mt-1">Anualizada (Target 6x)</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">GMROI Promedio</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">185%</div>
                                <div className="text-xs text-slate-400 mt-1">Retorno $1.85 por cada $1 inv.</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Chart 1: CCC Waterfall Bridge */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">Ciclo de Conversión de Efectivo (Días)</h3>
                                <p className="text-xs text-slate-500 mb-4">Cómo se atrapa y libera el efectivo: DIO (Inv) + DSO (Cobro) - DPO (Pago)</p>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={CCC_WATERFALL}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{fontSize: 11}} />
                                            <YAxis />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <ReferenceLine y={0} stroke="#000" />
                                            <Bar dataKey="value" label={{ position: 'top' }}>
                                                {CCC_WATERFALL.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Chart 2: Working Capital Trend */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4">Tendencia Capital de Trabajo</h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={WORKING_CAPITAL_TREND}>
                                            <defs>
                                                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="assets" name="Activos Ctes" stroke="#3b82f6" fill="url(#colorAssets)" />
                                            <Area type="monotone" dataKey="liabilities" name="Pasivos Ctes" stroke="#ef4444" fill="none" strokeDasharray="5 5" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Chart 3: GMROI Matrix */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-2">Matriz de Rentabilidad de Inventario (GMROI)</h3>
                            <p className="text-xs text-slate-500 mb-4">Eje X: Rotación (Veces/Año) | Eje Y: Margen Bruto (%) | Tamaño: Revenue</p>
                            <div className="h-80 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid />
                                        <XAxis type="number" dataKey="turns" name="Rotación" unit="x" domain={[0, 15]} />
                                        <YAxis type="number" dataKey="margin" name="Margen" unit="%" domain={[0, 60]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        
                                        {/* Quadrant Lines */}
                                        <ReferenceLine x={6} stroke="#cbd5e1" strokeDasharray="3 3" label="Meta Rotación" />
                                        <ReferenceLine y={30} stroke="#cbd5e1" strokeDasharray="3 3" label="Meta Margen" />

                                        <Scatter name="Categorías" data={GMROI_SCATTER} fill="#8884d8">
                                            {GMROI_SCATTER.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    entry.turns > 6 && entry.margin > 30 ? '#10b981' : // Star
                                                    entry.turns < 6 && entry.margin < 30 ? '#ef4444' : // Dog
                                                    entry.turns > 6 ? '#3b82f6' : '#f59e0b' // Cash Cow / Opportunity
                                                } />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                                <div className="absolute top-2 right-2 text-xs font-bold text-emerald-600 bg-white/80 px-1 rounded">ESTRELLAS</div>
                                <div className="absolute bottom-2 left-2 text-xs font-bold text-rose-600 bg-white/80 px-1 rounded">PROBLEMAS</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InsightCard 
                                type="risk"
                                title="Ciclo de Efectivo Extendido"
                                insight="El CCC ha aumentado a 80 días debido principalmente a un inventario lento (DIO 65 días). Se recomienda ejecutar las acciones de liquidación del módulo 'Inventory Drain' para liberar capital."
                            />
                            <InsightCard 
                                type="opportunity"
                                title="Oportunidad en Cuentas por Pagar"
                                insight="El DPO es de solo 30 días. Renegociar con proveedores estratégicos (como 'Global Chem') a 45 días liberaría $150k en flujo de caja operativo inmediato."
                            />
                        </div>
                    </div>
                );

            case 12: // IA / ML Engine
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={BrainCircuit} title="IA / ML Engine" subtitle="Motor de inferencia, detección de anomalías y reglas auto-aprendidas." />

                        {/* Top Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Anomalías Detectadas</div>
                                <div className="text-2xl font-bold text-slate-900 mt-2">12</div>
                                <div className="text-xs text-rose-600 mt-1 flex items-center font-bold">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> +2 esta semana
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Reglas Activas</div>
                                <div className="text-2xl font-bold text-indigo-600 mt-2">145</div>
                                <div className="text-xs text-slate-400 mt-1">Optimizando precios y stock</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Confianza del Modelo</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">94.2%</div>
                                <div className="text-xs text-slate-400 mt-1">Random Forest + LSTM</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Ahorro Potencial</div>
                                <div className="text-2xl font-bold text-blue-600 mt-2">$28.5k</div>
                                <div className="text-xs text-slate-400 mt-1">Sugerido por IA</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Anomaly Chart */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-rose-500" />
                                    Detección de Anomalías Multivariable
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">Eje X: Volumen Producción | Eje Y: Consumo Energía. Puntos rojos = Fuera de patrón.</p>
                                <div className="h-80 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid />
                                            <XAxis type="number" dataKey="x" name="Volumen" unit="u" />
                                            <YAxis type="number" dataKey="y" name="Energía" unit="kWh" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter name="Operaciones" data={ANOMALY_DATA} fill="#8884d8">
                                                {ANOMALY_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.isAnomaly ? '#ef4444' : '#94a3b8'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Feature Importance */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2 flex items-center">
                                    <Binary className="w-5 h-5 mr-2 text-blue-600" />
                                    Importancia de Variables (Feature Importance)
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">Factores de mayor peso en la predicción de demanda actual.</p>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={FEATURE_IMPORTANCE} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                                            <Tooltip />
                                            <Bar dataKey="value" radius={[0,4,4,0]} barSize={25}>
                                                {FEATURE_IMPORTANCE.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Auto Rules */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                                Reglas Auto-Aprendidas (Discovery)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {AUTO_RULES.map((rule) => (
                                    <div key={rule.id} className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex flex-col justify-between">
                                        <div className="flex items-start gap-3">
                                            <GitBranch className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                                            <p className="text-sm text-indigo-900 font-medium leading-relaxed italic">
                                                "{rule.rule}"
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-xs">
                                            <span className="font-bold text-indigo-700">Confianza: {rule.confidence}%</span>
                                            <span className={`px-2 py-1 rounded bg-white border border-indigo-200 text-indigo-600 font-bold`}>
                                                Impacto {rule.impact}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 13: // System Meta-Analytics
                const SYSTEM_LATENCY = [
                    { time: '08:00', latency: 120, queries: 450 },
                    { time: '10:00', latency: 145, queries: 1200 },
                    { time: '12:00', latency: 132, queries: 800 },
                    { time: '14:00', latency: 180, queries: 1500 }, // Peak
                    { time: '16:00', latency: 125, queries: 900 },
                    { time: '18:00', latency: 110, queries: 300 },
                ];

                const MODULE_STATUS = [
                    { name: 'SAP S/4HANA Core', status: 'Online', latency: '45ms', uptime: '99.99%', type: 'ERP' },
                    { name: 'Salesforce CRM', status: 'Online', latency: '120ms', uptime: '99.95%', type: 'CRM' },
                    { name: 'IoT Gateway (Plant)', status: 'Degraded', latency: '450ms', uptime: '98.50%', type: 'IoT' },
                    { name: 'Gemini AI Inference', status: 'Online', latency: '800ms', uptime: '99.90%', type: 'AI' },
                    { name: 'WMS Connector', status: 'Online', latency: '65ms', uptime: '99.98%', type: 'WMS' },
                ];

                const MODEL_DRIFT = [
                    { week: 'W1', accuracy: 95, threshold: 90 },
                    { week: 'W2', accuracy: 94, threshold: 90 },
                    { week: 'W3', accuracy: 95, threshold: 90 },
                    { week: 'W4', accuracy: 92, threshold: 90 },
                    { week: 'W5', accuracy: 89, threshold: 90 }, // Drifting
                    { week: 'W6', accuracy: 85, threshold: 90 }, // Needs retraining
                ];

                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Microscope} title="System Meta-Analytics" subtitle="Telemetría del ecosistema digital: Salud, Latencia y Deriva de Modelos." />

                        {/* Top KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">System Health Score</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">98.5%</div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center">
                                    <Activity className="w-3 h-3 mr-1 text-emerald-500" /> Operativo
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Latencia Promedio</div>
                                <div className="text-2xl font-bold text-slate-900 mt-2">135ms</div>
                                <div className="text-xs text-slate-400 mt-1">Global API Response</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">Data Freshness</div>
                                <div className="text-2xl font-bold text-blue-600 mt-2">Real-Time</div>
                                <div className="text-xs text-slate-400 mt-1">Lag {`<`} 500ms</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 uppercase">AI Token Usage</div>
                                <div className="text-2xl font-bold text-purple-600 mt-2">1.2M</div>
                                <div className="text-xs text-slate-400 mt-1">Quota: 5M / Month</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Latency Chart */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">Latencia y Carga del Sistema (Hoy)</h3>
                                <p className="text-xs text-slate-500 mb-4">Relación entre volumen de consultas y tiempo de respuesta.</p>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={SYSTEM_LATENCY}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="time" />
                                            <YAxis yAxisId="left" orientation="left" stroke="#64748b" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" />
                                            <Tooltip />
                                            <Legend />
                                            <Bar yAxisId="right" dataKey="queries" name="Consultas/Min" fill="#cbd5e1" barSize={30} radius={[4,4,0,0]} />
                                            <Line yAxisId="left" type="monotone" dataKey="latency" name="Latencia (ms)" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Service Status List */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                                    <Network className="w-5 h-5 mr-2 text-indigo-600"/>
                                    Estado de Conectores (Service Mesh)
                                </h3>
                                <div className="space-y-4">
                                    {MODULE_STATUS.map((mod, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${mod.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{mod.name}</div>
                                                    <div className="text-xs text-slate-500">{mod.type} • Uptime {mod.uptime}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-mono font-bold ${
                                                    parseInt(mod.latency) > 200 ? 'text-amber-600' : 'text-slate-600'
                                                }`}>
                                                    {mod.latency}
                                                </div>
                                                <div className="text-[10px] text-slate-400">Ping</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Model Drift Chart */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-2">Monitoreo de "Drift" de Modelos IA</h3>
                                <p className="text-xs text-slate-500 mb-4">Degradación de la precisión del modelo de Forecast con el tiempo.</p>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={MODEL_DRIFT}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="week" />
                                            <YAxis domain={[80, 100]} />
                                            <Tooltip />
                                            <Legend />
                                            <ReferenceLine y={90} stroke="red" strokeDasharray="3 3" label="Umbral Retraining" />
                                            <Line type="monotone" dataKey="accuracy" name="Precisión (%)" stroke="#8b5cf6" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Action Card */}
                            <div className="space-y-4">
                                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-amber-600 mt-1" />
                                        <div>
                                            <h4 className="font-bold text-amber-800">Alerta de Infraestructura</h4>
                                            <p className="text-sm text-amber-700 mt-2 leading-relaxed">
                                                El <strong>IoT Gateway</strong> presenta latencia alta (450ms). Esto puede retrasar la actualización de los contadores de producción en tiempo real.
                                            </p>
                                            <p className="text-sm text-amber-700 mt-2 font-bold">
                                                Acción: Reiniciar servicio de ingestión.
                                            </p>
                                        </div>
                                    </div>
                                    <button className="mt-4 w-full py-2 bg-white border border-amber-300 text-amber-800 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors">
                                        Diagnosticar Gateway
                                    </button>
                                </div>

                                <InsightCard 
                                    title="AI Health Check"
                                    insight="El modelo de Forecast ha caído por debajo del 90% de precisión en la Semana 6. Se ha programado un re-entrenamiento automático para esta noche."
                                    type="risk"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 14: // Advanced Crosses
                const RADAR_DATA = [
                  { subject: 'Margen', A: 120, B: 110, fullMark: 150 },
                  { subject: 'Rotación', A: 98, B: 130, fullMark: 150 },
                  { subject: 'Cash Flow', A: 86, B: 130, fullMark: 150 },
                  { subject: 'Forecast Acc', A: 99, B: 100, fullMark: 150 },
                  { subject: 'Satisfaction', A: 85, B: 90, fullMark: 150 },
                  { subject: 'Risk (Inv)', A: 65, B: 85, fullMark: 150 },
                ];
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <SectionHeader icon={Network} title="Cruces Avanzados (Multi-Dimensional)" subtitle="Donde reside el valor real: Intersección de métricas aisladas." />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                                <h3 className="font-bold text-slate-800 mb-2 w-full text-left">Salud Holística: Familia A vs Familia B</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} />
                                        <Radar name="Familia A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        <Radar name="Familia B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                        <Legend />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center">
                                        <Search className="w-4 h-4 mr-2" />
                                        Matriz de Oportunidad Detectada
                                    </h4>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex justify-between items-center p-2 bg-white rounded shadow-sm border-l-4 border-emerald-500">
                                            <span>Forecast Error (Bajo) × Margen (Alto)</span>
                                            <span className="font-bold text-emerald-700">Potenciar Stock</span>
                                        </li>
                                        <li className="flex justify-between items-center p-2 bg-white rounded shadow-sm border-l-4 border-rose-500">
                                            <span>Inventario Silencioso × Cash at Risk</span>
                                            <span className="font-bold text-rose-700">Liquidar Inmediato</span>
                                        </li>
                                        <li className="flex justify-between items-center p-2 bg-white rounded shadow-sm border-l-4 border-amber-500">
                                            <span>Alta Producción × Baja Venta (Churn)</span>
                                            <span className="font-bold text-amber-700">Frenar Lotes</span>
                                        </li>
                                    </ul>
                                </div>
                                <InsightCard 
                                    title="Regla de Oro"
                                    insight="La Familia A tiene buen margen pero alto riesgo de inventario. La estrategia debe ser 'Maximizar Rotación' incluso sacrificando 2-3 puntos de margen."
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-96 text-center space-y-4 animate-in fade-in zoom-in">
                        <div className="p-4 bg-slate-100 rounded-full">
                            <Microscope className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">Módulo en Construcción</h3>
                        <p className="text-slate-500 max-w-md">
                            La sección <span className="font-bold text-slate-900">"{SECTIONS.find(s => s.id === activeSection)?.title}"</span> está siendo conectada al motor de datos en tiempo real.
                        </p>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
                            Ver Documentación Técnica
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* LEFT NAVIGATION SIDEBAR */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold text-slate-900 flex items-center">
                        <BrainCircuit className="w-6 h-6 mr-2 text-indigo-600" />
                        Analítica Avanzada
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Motor de Inteligencia Operacional</p>
                </div>
                
                <div className="flex-1 py-4">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left px-6 py-4 border-l-4 transition-all hover:bg-slate-50 group ${
                                    isActive 
                                    ? 'border-indigo-600 bg-indigo-50/50' 
                                    : 'border-transparent'
                                }`}
                            >
                                <div className="flex items-start">
                                    <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                                    }`} />
                                    <div>
                                        <div className={`text-sm font-bold ${
                                            isActive ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'
                                        }`}>
                                            {section.title}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                                            {section.desc}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Sigma className="w-4 h-4" />
                        <span>v2.4.0 Engine Ready</span>
                    </div>
                </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};