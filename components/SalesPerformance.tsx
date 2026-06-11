import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, ComposedChart, Area, Legend
} from 'recharts';
import { 
    TrendingUp, Truck, AlertCircle, Ban, DollarSign, 
    CalendarClock, CheckCircle2, XCircle, ShoppingBag, 
    ArrowRight
} from 'lucide-react';
import { MOCK_CUSTOMERS } from '../constants';

export const SalesPerformance: React.FC = () => {
    // --- Mock Data for Sales Performance ---

    // 1. KPI Aggregates
    const kpiData = {
        otif: 88.5, // Target 95%
        fillRate: 92.3, // Target 98%
        lostSales: 145000, // Revenue lost this month
        delayedSales: 320000, // Backlog value
        totalOrders: 450,
        delayedOrdersCount: 32
    };

    // 2. Trend Data (Execution)
    const trendData = [
        { month: 'Oct', otif: 94, fillRate: 96, sales: 420, lost: 10 },
        { month: 'Nov', otif: 92, fillRate: 95, sales: 450, lost: 15 },
        { month: 'Dic', otif: 89, fillRate: 91, sales: 480, lost: 35 }, // Holiday rush stockouts
        { month: 'Ene', otif: 85, fillRate: 88, sales: 390, lost: 50 }, // Post-holiday depletion
        { month: 'Feb', otif: 87, fillRate: 90, sales: 410, lost: 40 },
        { month: 'Mar', otif: 88.5, fillRate: 92.3, sales: 460, lost: 30 },
    ];

    // 3. Delayed Orders / Backlog Detail
    const delayedOrders = [
        { id: 'ORD-5004', client: 'Constructora Mega', sku: 'FG-COAT-550', qty: 300, value: 36000, daysLate: 5, reason: 'Stockout' },
        { id: 'ORD-5009', client: 'Pinturas del Norte', sku: 'RM-SOLV-099', qty: 1200, value: 18000, daysLate: 12, reason: 'Producción Retrasada' },
        { id: 'ORD-5012', client: 'Taller San José', sku: 'FG-PRIM-200', qty: 50, value: 3250, daysLate: 2, reason: 'Logística' },
        { id: 'ORD-5015', client: 'Distribuidora Global', sku: 'FG-EPOX-900', qty: 100, value: 45000, daysLate: 1, reason: 'Allocated to Strategic' },
    ];

    // 4. Blocked Customers (Inventory + Credit check simulation)
    const blockedCustomers = [
        { id: 'CUST-002', name: 'Pinturas del Norte', blockedAmount: 18000, ordersBlocked: 2, impact: 'High', reason: 'Inventario Crítico' },
        { id: 'CUST-004', name: 'Taller San José', blockedAmount: 3250, ordersBlocked: 1, impact: 'Low', reason: 'Límite Crédito + Stock' },
    ];

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <ShoppingBag className="w-6 h-6 mr-2 text-slate-700"/>
                        Performance Comercial (Operativo)
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Análisis de cumplimiento, ventas perdidas y fricción operativa por inventario.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                        Ciclo: Marzo 2024
                     </span>
                </div>
            </header>

            {/* TOP ROW: KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. OTIF */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-sm font-medium">OTIF (A tiempo / Completo)</span>
                        <Truck className={`w-5 h-5 ${kpiData.otif < 90 ? 'text-rose-500' : 'text-emerald-500'}`} />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">{kpiData.otif}%</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
                        <div className={`h-1.5 rounded-full ${kpiData.otif < 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${kpiData.otif}%`}}></div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Target: 95.0%</div>
                </div>

                {/* 2. Fill Rate */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-sm font-medium">Fill Rate (Volumen)</span>
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">{kpiData.fillRate}%</div>
                    <div className="flex items-center text-xs text-rose-600 font-medium mt-2">
                        <TrendingUp className="w-3 h-3 mr-1 rotate-180" /> 
                        -2.5% vs mes anterior
                    </div>
                </div>

                {/* 3. Lost Sales */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-sm font-medium">Ventas Perdidas (Stockout)</span>
                        <XCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="text-3xl font-bold text-rose-600 mt-2">${(kpiData.lostSales / 1000).toFixed(1)}k</div>
                    <div className="text-xs text-slate-400 mt-2">Demanda no capturada</div>
                </div>

                {/* 4. Delayed Revenue */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-sm font-medium">Backlog (Retrasado)</span>
                        <CalendarClock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mt-2">${(kpiData.delayedSales / 1000).toFixed(1)}k</div>
                    <div className="text-xs text-amber-600 font-medium mt-2 bg-amber-50 inline-block px-1.5 rounded">
                        {kpiData.delayedOrdersCount} órdenes afectadas
                    </div>
                </div>
            </div>

            {/* MIDDLE ROW: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Quality of Service Trend */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-600"/>
                        Tendencia de Servicio (6 Meses)
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" orientation="left" domain={[80, 100]} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="fillRate" name="Fill Rate %" fill="#e0e7ff" stroke="#6366f1" strokeWidth={2} />
                                <Line yAxisId="left" type="monotone" dataKey="otif" name="OTIF %" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Lost Sales vs Captured */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-rose-500"/>
                        Impacto de Stockouts en Ingresos ($k)
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Legend />
                                <Bar dataKey="sales" name="Venta Capturada" stackId="a" fill="#3b82f6" radius={[0,0,4,4]} />
                                <Bar dataKey="lost" name="Venta Perdida" stackId="a" fill="#f43f5e" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* BOTTOM ROW: DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Delayed Orders Table */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 flex items-center">
                            <CalendarClock className="w-4 h-4 mr-2 text-amber-600"/>
                            Órdenes Retrasadas (Backlog Crítico)
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Orden</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Producto / SKU</th>
                                    <th className="px-6 py-3 text-right">Valor</th>
                                    <th className="px-6 py-3 text-center">Retraso</th>
                                    <th className="px-6 py-3">Razón</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {delayedOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-mono text-slate-500">{order.id}</td>
                                        <td className="px-6 py-3 font-medium text-slate-900">{order.client}</td>
                                        <td className="px-6 py-3">
                                            <div className="text-slate-700">{order.sku}</div>
                                            <div className="text-[10px] text-slate-400">{order.qty} units</div>
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium">${order.value.toLocaleString('es-CO')} COP COP</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                order.daysLate > 5 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.daysLate} días
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-xs text-slate-500">{order.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Blocked Customers */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-rose-50/30 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 flex items-center">
                            <Ban className="w-4 h-4 mr-2 text-rose-600"/>
                            Clientes Bloqueados
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {blockedCustomers.map((customer, idx) => (
                            <div key={idx} className="p-4 hover:bg-slate-50">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-900 text-sm">{customer.name}</h4>
                                    <span className="text-xs font-mono text-slate-400">{customer.id}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                                        {customer.ordersBlocked} Órdenes
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Valor: <b>${customer.blockedAmount.toLocaleString('es-CO')} COP COP</b>
                                    </span>
                                </div>
                                <div className="bg-slate-100 p-2 rounded text-xs text-slate-600 flex items-start gap-2">
                                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {customer.reason}
                                </div>
                                <button className="mt-3 w-full py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
                                    Ver Detalle Cliente
                                </button>
                            </div>
                        ))}
                         {blockedCustomers.length === 0 && (
                            <div className="p-6 text-center text-slate-400 text-sm">
                                No hay clientes bloqueados por inventario.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
