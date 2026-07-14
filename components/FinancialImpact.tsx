import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { 
    DollarSign, Wallet, TrendingUp, AlertOctagon, 
    ArrowUpRight, ArrowDownRight, Coins, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { MOCK_PRODUCTION, SALES_DATA, MOCK_FORECAST_DATA } from '../constants';
import { InventoryStatus, Category } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';
import { formatCOP } from '../utils/format';

export const FinancialImpact: React.FC = () => {
    const { inventory } = useEnterprise();

    // --- 1. Calculations & Logic ---

    // Capital Inmovilizado (Total Inventory Value)
    const totalInventoryValue = inventory.reduce((acc, item) => {
        if (item.category === Category.SERVICE) return acc;
        const cost = item.category === Category.RAW_MATERIAL ? item.unitCost : (item.unitCost * 0.8); // Estimate internal cost for FG if not explicit
        return acc + (item.totalStock * cost);
    }, 0);

    // Cash at Risk (Silent + Slow Moving Value)
    const silentInventoryValue = inventory
        .filter(i => i.status === InventoryStatus.SILENT || i.status === InventoryStatus.DEAD)
        .reduce((acc, item) => {
            const cost = item.category === Category.RAW_MATERIAL ? item.unitCost : (item.unitCost * 0.8);
            return acc + (item.totalStock * cost);
        }, 0);

    const expiringValue = inventory
        .reduce((acc, item) => {
            const expiringBatchValue = (item.batches || [])
                .filter(b => {
                    const days = Math.ceil((new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return days < 90; // Risk threshold
                })
                .reduce((bAcc, b) => bAcc + (b.quantity * item.unitCost), 0);
            return acc + expiringBatchValue;
        }, 0);
    
    const totalCashAtRisk = silentInventoryValue + expiringValue;

    // Consolidated Real Margin
    // Weighted average of production batches (Standard vs Real Cost)
    const marginMetrics = MOCK_PRODUCTION.reduce((acc, batch) => {
        if (batch.status === 'Completado' || batch.status === 'Control Calidad') {
            acc.totalStdCost += (batch.standardUnitCost * batch.actualOutput);
            acc.totalRealCost += (batch.realUnitCost * batch.actualOutput);
            // Assuming a theoretical sales price of cost * 1.4 for the calculation
            acc.totalRevenue += ((batch.standardUnitCost * 1.4) * batch.actualOutput);
        }
        return acc;
    }, { totalStdCost: 0, totalRealCost: 0, totalRevenue: 0 });

    const projectedMarginPercent = ((marginMetrics.totalRevenue - marginMetrics.totalRealCost) / marginMetrics.totalRevenue) * 100;
    const marginErosion = ((marginMetrics.totalRealCost - marginMetrics.totalStdCost) / marginMetrics.totalRevenue) * 100;

    // Inventory as % of Cash (Mocking Company Cash Position)
    const MOCK_COMPANY_CASH = 2500000; // $2.5M Cash on Hand
    const inventoryToCashRatio = (totalInventoryValue / MOCK_COMPANY_CASH) * 100;

    // Forecast to Cash Flow Projection
    const cashFlowData = MOCK_FORECAST_DATA.slice(-6).map(data => {
        const revenue = data.base * 120; // Avg Selling Price estimate
        const cogs = revenue * 0.65; // Cost of Goods Sold approx
        const operationalEx = 15000; // Fixed OpEx
        return {
            month: data.month,
            revenue: revenue,
            netCashFlow: revenue - cogs - operationalEx,
            cumulativeCash: revenue - cogs - operationalEx // Simplified for chart
        };
    });

    // Capital Composition Data for Pie Chart
    const statusComposition = [
        { name: 'Activo (Saludable)', value: totalInventoryValue - totalCashAtRisk, color: '#10b981' }, // Emerald
        { name: 'En Riesgo (Lento/Cad)', value: totalCashAtRisk * 0.7, color: '#f59e0b' }, // Amber
        { name: 'Muerto (Silencioso)', value: totalCashAtRisk * 0.3, color: '#ef4444' }, // Red
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex justify-end items-end mb-2">
                <div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-right shadow-lg">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Posición de Caja (Est)</div>
                    <div className="text-xl font-bold font-mono">${(MOCK_COMPANY_CASH / 1000000).toFixed(2)}M</div>
                </div>
            </header>

            {/* --- TOP ROW: FINANCIAL KPIS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Capital Inmovilizado */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-2 -mt-2 transition-all group-hover:bg-blue-100"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Coins className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-semibold text-slate-500">Capital Inmovilizado</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {formatCOP(totalInventoryValue)}
                        </div>
                        <div className="mt-3 flex items-center text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{inventory.length} SKUs</span>
                            <span className="mx-1">•</span>
                            Valoración promedio costo
                        </div>
                    </div>
                </div>

                {/* 2. Cash at Risk */}
                <div className="bg-white p-6 rounded-xl border-l-4 border-rose-500 shadow-sm relative">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertOctagon className="w-5 h-5 text-rose-600" />
                        <span className="text-sm font-semibold text-rose-700">Capital en Riesgo</span>
                    </div>
                    <div className="text-2xl font-bold text-rose-600">
                        {formatCOP(totalCashAtRisk)}
                    </div>
                    <div className="mt-3 text-xs bg-rose-50 text-rose-800 px-2 py-1 rounded inline-block font-medium">
                        {(totalCashAtRisk / totalInventoryValue * 100).toFixed(1)}% del Inventario Total
                    </div>
                </div>

                {/* 3. Real Margin */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-semibold text-slate-500">Margen Real Consolidado</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 flex items-baseline gap-2">
                        {projectedMarginPercent.toFixed(1)}%
                        <span className="text-sm font-normal text-rose-500 flex items-center">
                            <ArrowDownRight className="w-4 h-4" /> 
                            -{marginErosion.toFixed(2)}% vs Std
                        </span>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                        Impactado por mermas y variaciones costo
                    </div>
                </div>

                {/* 4. Inventory % of Cash */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <PieChartIcon className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-500">Inventario / Caja</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">
                        {inventoryToCashRatio.toFixed(1)}%
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
                        <div 
                            className={`h-1.5 rounded-full ${inventoryToCashRatio > 40 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${Math.min(inventoryToCashRatio, 100)}%` }}
                        ></div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400 text-right">Target &lt; 30%</div>
                </div>
            </div>

            {/* --- MIDDLE ROW: CHARTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart 1: Capital Composition */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-6">Composición del Capital</h3>
                    <div className="h-64 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusComposition}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCOP(value)} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-5 text-center pointer-events-none">
                            <div className="text-xs text-slate-400 uppercase">Total</div>
                            <div className="text-base font-bold text-slate-800">{formatCOP(totalInventoryValue)}</div>
                        </div>
                    </div>
                </div>

                {/* Chart 2: Forecast to Cash Impact */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600"/>
                            Proyección Impacto Forecast → Cash Flow
                        </h3>
                        <div className="flex gap-2">
                            <span className="flex items-center text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Flujo Neto
                            </span>
                            <span className="flex items-center text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-indigo-100 mr-1"></span> Ingresos Est.
                            </span>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlowData}>
                                <defs>
                                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => [formatCOP(value), '']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stackId="1" 
                                    stroke="#6366f1" 
                                    fill="#e0e7ff" 
                                    name="Ingresos Proyectados"
                                    strokeWidth={2}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="netCashFlow" 
                                    stackId="2" 
                                    stroke="#10b981" 
                                    fill="url(#colorCash)" 
                                    name="Flujo de Caja Operativo"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM ROW: CASH TRAPS ANALYSIS --- */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center">
                        <AlertOctagon className="w-4 h-4 mr-2 text-rose-600"/>
                        "Trampas de Caja": Top Inventario Inmovilizado
                    </h3>
                    <button className="text-xs text-blue-600 font-bold hover:underline">Ver reporte completo</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3">Categoría</th>
                                <th className="px-6 py-3">Estatus</th>
                                <th className="px-6 py-3 text-right">Stock Total</th>
                                <th className="px-6 py-3 text-right">Valor Total</th>
                                <th className="px-6 py-3 text-right">Días Rotación</th>
                                <th className="px-6 py-3 text-right">Oportunidad Cash</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inventory
                                .filter(i => i.status === InventoryStatus.SILENT || i.status === InventoryStatus.SLOW)
                                .sort((a, b) => (b.totalStock * b.unitCost) - (a.totalStock * a.unitCost))
                                .slice(0, 5)
                                .map(item => {
                                    const value = item.totalStock * item.unitCost;
                                    // Estimated liquidation return (e.g., 70% of value)
                                    const opportunity = value * 0.7; 
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{item.category}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    item.status === InventoryStatus.SILENT ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">{item.totalStock.toLocaleString('es-CO')}</td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCOP(value)}</td>
                                            <td className="px-6 py-4 text-right text-slate-500">{item.agingDays} días</td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                +{formatCOP(opportunity)}
                                            </td>
                                        </tr>
                                    );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
