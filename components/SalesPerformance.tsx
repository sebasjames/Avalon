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
import { useEnterprise } from '../context/EnterpriseContext';

export const SalesPerformance: React.FC = () => {
    const { transactions, deals, contacts, dispatches } = useEnterprise();
    const [selectedMonth, setSelectedMonth] = React.useState('ALL');
    const [selectedYear, setSelectedYear] = React.useState('ALL');

    const { kpiData, trendData, delayedOrders, blockedCustomers, availableYears } = React.useMemo(() => {
        const now = new Date();
        const sales = transactions.filter(t => t.type === 'VENTA');
        
        const yearsSet = new Set<string>();
        transactions.forEach(t => yearsSet.add(t.date.substring(0, 4)));
        const availableYearsList = Array.from(yearsSet).sort().reverse();
        if (availableYearsList.length === 0) availableYearsList.push(now.getFullYear().toString());

        const isMatchDate = (dateStr: string) => {
            if (!dateStr) return false;
            const yearMatch = selectedYear === 'ALL' || dateStr.substring(0, 4) === selectedYear;
            const monthMatch = selectedMonth === 'ALL' || dateStr.substring(5, 7) === selectedMonth;
            return yearMatch && monthMatch;
        };

        const filteredSales = sales.filter(s => isMatchDate(s.date));

        const lostDeals = deals.filter(d => d.stage === 'CLOSED_LOST');
        const filteredLostDeals = lostDeals.filter(ld => ld.expectedCloseDate && isMatchDate(ld.expectedCloseDate));

        const lostSalesValue = filteredLostDeals.reduce((sum, d) => sum + d.value, 0);

        const delayedDeals = deals.filter(d => 
            d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST' && 
            d.expectedCloseDate && new Date(d.expectedCloseDate) < now
        );
        const delayedSalesValue = delayedDeals.reduce((sum, d) => sum + d.value, 0);

        const dynamicDelayedOrders = delayedDeals.map(d => {
            const daysLate = Math.floor((now.getTime() - new Date(d.expectedCloseDate!).getTime()) / (1000 * 3600 * 24));
            return {
                id: d.id,
                client: contacts.find(c => c.id === d.contactId)?.name || d.company || 'Cliente',
                sku: 'Mix Productos',
                qty: 1,
                value: d.value,
                daysLate,
                reason: d.notes || 'Retraso de Cierre'
            };
        }).sort((a, b) => b.daysLate - a.daysLate).slice(0, 5);

        const dynamicBlockedCustomers = contacts.filter(c => c.hasOverdueBills || (c.creditLimit && c.creditLimitUsed && c.creditLimitUsed >= c.creditLimit)).map(c => {
            const isCredit = c.creditLimit && c.creditLimitUsed && c.creditLimitUsed >= c.creditLimit;
            return {
                id: c.id,
                name: c.name,
                blockedAmount: c.creditLimitUsed || 0,
                ordersBlocked: 1,
                impact: isCredit ? 'Medium' : 'High',
                reason: isCredit ? 'Límite Crédito Excedido' : 'Facturas en Mora'
            };
        });

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d);
        }

        const dynamicTrendData = months.map(d => {
            const monthStr = d.toISOString().slice(0, 7);
            const monthLabel = d.toLocaleString('es-ES', { month: 'short' }).substring(0, 3);
            
            const monthSales = sales.filter(s => s.date.startsWith(monthStr)).reduce((sum, s) => sum + s.total, 0) / 1000;
            const monthLost = lostDeals.filter(ld => ld.expectedCloseDate && ld.expectedCloseDate.startsWith(monthStr)).reduce((sum, ld) => sum + ld.value, 0) / 1000;

            const monthDispatches = dispatches.filter(d => d.promisedDate.startsWith(monthStr));
            let otifMonth = 0;
            let fillRateMonth = 0;
            
            if (monthDispatches.length > 0) {
                const onTimeCount = monthDispatches.filter(d => d.actualDeliveryDate && d.actualDeliveryDate <= d.promisedDate).length;
                otifMonth = (onTimeCount / monthDispatches.length) * 100;

                const totalDelivered = monthDispatches.reduce((acc, d) => acc + d.items.reduce((s, i) => s + i.deliveredQty, 0), 0);
                const totalOrdered = monthDispatches.reduce((acc, d) => acc + d.items.reduce((s, i) => s + i.orderedQty, 0), 0);
                if (totalOrdered > 0) fillRateMonth = (totalDelivered / totalOrdered) * 100;
            }

            return {
                month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
                otif: +otifMonth.toFixed(1),
                fillRate: +fillRateMonth.toFixed(1),
                sales: Math.round(monthSales || 0),
                lost: Math.round(monthLost || 0)
            };
        });

        const filteredDispatches = dispatches.filter(d => isMatchDate(d.promisedDate));
        
        let globalOtif = 0;
        let globalFillRate = 0;

        if (filteredDispatches.length > 0) {
            const onTimeCount = filteredDispatches.filter(d => d.actualDeliveryDate && d.actualDeliveryDate <= d.promisedDate).length;
            globalOtif = (onTimeCount / filteredDispatches.length) * 100;

            const totalDelivered = filteredDispatches.reduce((acc, d) => acc + d.items.reduce((s, i) => s + i.deliveredQty, 0), 0);
            const totalOrdered = filteredDispatches.reduce((acc, d) => acc + d.items.reduce((s, i) => s + i.orderedQty, 0), 0);
            if (totalOrdered > 0) globalFillRate = (totalDelivered / totalOrdered) * 100;
        }

        return {
            availableYears: availableYearsList,
            kpiData: {
                otif: +globalOtif.toFixed(1),
                fillRate: +globalFillRate.toFixed(1),
                lostSales: lostSalesValue,
                delayedSales: delayedSalesValue,
                totalOrders: filteredSales.length,
                delayedOrdersCount: delayedDeals.length
            },
            trendData: dynamicTrendData,
            delayedOrders: dynamicDelayedOrders,
            blockedCustomers: dynamicBlockedCustomers
        };
    }, [transactions, deals, contacts, dispatches, selectedMonth, selectedYear]);

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
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Ciclo:
                     </span>
                     <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="text-sm font-semibold text-slate-700 bg-slate-100 border-none outline-none focus:ring-2 ring-indigo-500/20 px-3 py-1.5 rounded-full cursor-pointer"
                     >
                        <option value="ALL">Todo el Año</option>
                        <option value="01">Enero</option>
                        <option value="02">Febrero</option>
                        <option value="03">Marzo</option>
                        <option value="04">Abril</option>
                        <option value="05">Mayo</option>
                        <option value="06">Junio</option>
                        <option value="07">Julio</option>
                        <option value="08">Agosto</option>
                        <option value="09">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                     </select>
                     <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="text-sm font-semibold text-slate-700 bg-slate-100 border-none outline-none focus:ring-2 ring-indigo-500/20 px-3 py-1.5 rounded-full cursor-pointer"
                     >
                        <option value="ALL">Todos los Años</option>
                        {availableYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                     </select>
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
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {blockedCustomers.map((customer, idx) => (
                            <div 
                                key={idx} 
                                className="group p-4 hover:bg-blue-50/50 cursor-pointer transition-colors border-l-2 border-transparent hover:border-blue-500"
                                onClick={() => window.location.hash = `#/crm?openClient=${customer.id}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{customer.name}</h4>
                                    <span className="text-xs font-mono text-slate-400">{customer.id}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                                        {customer.ordersBlocked} Órdenes
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Valor: <b>${customer.blockedAmount.toLocaleString('es-CO')} COP</b>
                                    </span>
                                </div>
                                <div className="bg-slate-100 p-2 rounded text-xs text-slate-600 flex items-start gap-2">
                                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {customer.reason}
                                </div>
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
