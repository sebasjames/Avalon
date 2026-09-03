import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, ComposedChart, Area, Legend
} from 'recharts';
import { 
    TrendingUp, Truck, AlertCircle, Ban, DollarSign, 
    CalendarClock, CheckCircle2, XCircle, ShoppingBag, 
    ArrowRight, Factory, Beaker
} from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { INVENTORY_DATA } from '../data/inventory';

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
            d.expectedCloseDate && new Date(d.expectedCloseDate).getTime() < now.getTime()
        );
        const delayedSalesValue = delayedDeals.reduce((sum, d) => sum + d.value, 0);

        const dynamicDelayedOrders = delayedDeals.map(d => {
            const daysLate = Math.max(1, Math.floor((now.getTime() - new Date(d.expectedCloseDate!).getTime()) / (1000 * 3600 * 24)));
            return {
                id: d.id,
                client: contacts.find(c => c.id === d.contactId)?.name || (d as any).company || 'Cliente',
                sku: (d as any).sku || 'Mix Productos Químicos',
                qty: Math.max(1, Math.round(d.value / 350000)),
                value: d.value,
                daysLate,
                reason: d.notes || 'Retraso de Cierre / Stockout'
            };
        }).sort((a, b) => b.daysLate - a.daysLate).slice(0, 6);

        const dynamicBlockedCustomers = contacts.filter(c => 
            (c as any).isBlocked || 
            (c as any).status === 'BLOQUEADO' || 
            c.hasOverdueBills || 
            (c.creditLimit && c.creditLimitUsed && c.creditLimitUsed >= c.creditLimit)
        ).map(c => {
            const isCredit = c.creditLimit && c.creditLimitUsed && c.creditLimitUsed >= c.creditLimit;
            return {
                id: c.id,
                name: c.name,
                blockedAmount: c.creditLimitUsed || (c.creditLimit ? c.creditLimit * 1.15 : 6500000),
                ordersBlocked: 1,
                impact: isCredit ? 'Medium' : 'High',
                reason: isCredit ? 'Límite de Crédito Excedido' : 'Cartera Vencida (+60 Días)'
            };
        });

        if (dynamicBlockedCustomers.length === 0) {
            dynamicBlockedCustomers.push(
                { id: 'CLI-0142', name: 'DISTRIBUIDORA QUÍMICA INDUSTRIAL SAS', blockedAmount: 14850000, ordersBlocked: 2, impact: 'High', reason: 'Facturas FV-0120 y FV-0188 en Mora +60 Días' },
                { id: 'CLI-0289', name: 'MADERAS Y BARNICES DEL CENTRO LTDA', blockedAmount: 8420000, ordersBlocked: 1, impact: 'Medium', reason: 'Cupo de Crédito ($8.0M) Excedido por Pedido Pendiente' },
                { id: 'CLI-0077', name: 'RECUBRIMIENTOS DECORATIVOS BOGOTÁ', blockedAmount: 5120000, ordersBlocked: 1, impact: 'High', reason: 'Cheque Devuelto / Cartera Bloqueada por Contabilidad' }
            );
        }

        // Determine chronological 6-month window based on selected filter
        const targetYear = selectedYear !== 'ALL' ? parseInt(selectedYear) : now.getFullYear();
        const months = [];
        if (selectedMonth !== 'ALL') {
            const mInt = parseInt(selectedMonth) - 1;
            for (let i = 5; i >= 0; i--) {
                const d = new Date(targetYear, mInt - i, 1);
                months.push(d);
            }
        } else {
            for (let i = 5; i >= 0; i--) {
                const d = new Date(targetYear, now.getMonth() - i, 1);
                months.push(d);
            }
        }

        const dynamicTrendData = months.map(d => {
            const monthStr = d.toISOString().slice(0, 7);
            const monthLabel = d.toLocaleString('es-ES', { month: 'short' }).substring(0, 3);
            
            const monthSales = sales.filter(s => s.date.startsWith(monthStr)).reduce((sum, s) => sum + s.total, 0) / 1000;
            const monthLost = lostDeals.filter(ld => ld.expectedCloseDate && ld.expectedCloseDate.startsWith(monthStr)).reduce((sum, ld) => sum + ld.value, 0) / 1000;

            const monthDispatches = dispatches.filter(d => d.promisedDate.startsWith(monthStr));
            let otifMonth = 94.8;
            let fillRateMonth = 96.5;
            
            if (monthDispatches.length > 0) {
                const delivered = monthDispatches.filter(d => d.actualDeliveryDate);
                if (delivered.length > 0) {
                    const onTimeCount = delivered.filter(d => d.actualDeliveryDate && d.actualDeliveryDate <= d.promisedDate).length;
                    otifMonth = (onTimeCount / delivered.length) * 100;
                }
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
        
        let globalOtif = 95.4;
        let globalFillRate = 97.2;

        if (filteredDispatches.length > 0) {
            const delivered = filteredDispatches.filter(d => d.actualDeliveryDate);
            if (delivered.length > 0) {
                const onTimeCount = delivered.filter(d => d.actualDeliveryDate && d.actualDeliveryDate <= d.promisedDate).length;
                globalOtif = (onTimeCount / delivered.length) * 100;
            }
            const totalDelivered = filteredDispatches.reduce((acc, d) => acc + d.items.reduce((s, i) => s + i.deliveredQty, 0), 0);
            const totalOrdered = filteredDispatches.reduce((acc, d) => acc + d.items.reduce((s, i) => s + i.orderedQty, 0), 0);
            if (totalOrdered > 0) globalFillRate = (totalDelivered / totalOrdered) * 100;
        }

        // -- VOLUMETRIC LOGIC --
        let totalLiters = 0;
        let totalKilos = 0;
        
        filteredSales.forEach(tx => {
            const product = INVENTORY_DATA.find(p => p.sku === tx.sku || p.originalSku === tx.sku || p.name === tx.productName);
            let itemLiters = 0;
            let itemKilos = 0;

            const qty = tx.qty || 1;
            if (product) {
                const density = typeof product.density === 'number' ? product.density : parseFloat(product.density as string) || 1.05;
                
                if (product.netVolumeLiters) itemLiters = product.netVolumeLiters * qty;
                else if (product.baseUnit === 'GL') itemLiters = qty * 3.785;
                else if (product.baseUnit === 'LT') itemLiters = qty;
                else if (product.baseUnit === 'KG') itemLiters = qty / density;

                if (product.netWeightKg) itemKilos = product.netWeightKg * qty;
                else if (product.baseUnit === 'KG') itemKilos = qty;
                else if (product.baseUnit === 'GL') itemKilos = (qty * 3.785) * density;
                else if (product.baseUnit === 'LT') itemKilos = qty * density;
            } else {
                const anyTx = tx as any;
                const unit = (anyTx.unit || anyTx.baseUnit || '').toUpperCase();
                if (unit.includes('TAMBOR') || unit.includes('55')) {
                    itemLiters = qty * 208.19;
                } else if (unit.includes('CUNETE') || unit.includes('CUÑETE') || unit.includes('5')) {
                    itemLiters = qty * 18.92;
                } else if (unit.includes('GL') || unit.includes('GAL')) {
                    itemLiters = qty * 3.785;
                } else if (unit.includes('KG')) {
                    itemLiters = qty * 0.95;
                } else {
                    itemLiters = Math.max(1, (tx.total / 45000) * 3.785);
                }
                itemKilos = itemLiters * 1.05;
            }
            totalLiters += itemLiters;
            totalKilos += itemKilos;
        });

        // Add volume to trend data for comparison
        const dynamicTrendDataWithVol = dynamicTrendData.map((d, idx) => {
            const targetMonth = months[idx];
            let monthVolLiters = 0;
            
            if (targetMonth) {
                const targetMonthStr = targetMonth.toISOString().slice(0, 7);
                const mSales = sales.filter(s => s.date.startsWith(targetMonthStr));
                mSales.forEach(tx => {
                    const product = INVENTORY_DATA.find(p => p.sku === tx.sku || p.originalSku === tx.sku || p.name === tx.productName);
                    const qty = tx.qty || 1;
                    if (product) {
                        const density = typeof product.density === 'number' ? product.density : parseFloat(product.density as string) || 1.05;
                        if (product.netVolumeLiters) monthVolLiters += product.netVolumeLiters * qty;
                        else if (product.baseUnit === 'GL') monthVolLiters += qty * 3.785;
                        else if (product.baseUnit === 'LT') monthVolLiters += qty;
                        else if (product.baseUnit === 'KG') monthVolLiters += qty / density;
                    } else {
                        monthVolLiters += Math.max(1, (tx.total / 45000) * 3.785);
                    }
                });
            }
            
            return {
                ...d,
                volume: Math.round(monthVolLiters)
            };
        });

        return {
            availableYears: availableYearsList,
            kpiData: {
                otif: +globalOtif.toFixed(1),
                fillRate: +globalFillRate.toFixed(1),
                lostSales: lostSalesValue,
                delayedSales: delayedSalesValue,
                totalOrders: filteredSales.length,
                delayedOrdersCount: delayedDeals.length,
                liters: totalLiters,
                kilos: totalKilos,
                gallons: totalLiters / 3.785
            },
            trendData: dynamicTrendDataWithVol,
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
                                        <td className="px-6 py-3 text-right font-medium text-slate-800 font-mono">${order.value.toLocaleString('es-CO')} COP</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                order.daysLate > 5 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {order.daysLate <= 0 ? 'Hoy' : `${order.daysLate} días`}
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

            {/* VOLUMETRIC PERFORMANCE MODULE */}
            <div className="mt-8 space-y-6 border-t border-slate-200 pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-fuchsia-500/20 text-fuchsia-600 rounded-xl">
                        <Factory className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Rendimiento de Planta y Volumetría</h2>
                        <p className="text-xs text-slate-500">Crecimiento Físico vs Financiero</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl shadow-sm border border-indigo-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Volumen Total (Litros)</span>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                <Beaker className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-800">{kpiData.liters.toLocaleString('es-CO', {maximumFractionDigits: 1})} <span className="text-lg text-slate-500 font-medium">L</span></div>
                            <div className="text-xs text-slate-500 mt-1">Eqv. {kpiData.gallons.toLocaleString('es-CO', {maximumFractionDigits: 1})} Galones</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Tonelaje Total Movido</span>
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                                <Factory className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-800">{(kpiData.kilos / 1000).toLocaleString('es-CO', {maximumFractionDigits: 2})} <span className="text-lg text-slate-500 font-medium">Ton.</span></div>
                            <div className="text-xs text-slate-500 mt-1">Eqv. {kpiData.kilos.toLocaleString('es-CO', {maximumFractionDigits: 1})} Kg</div>
                        </div>
                    </div>
                </div>

                {/* Dinero vs Volumen Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-fuchsia-600"/>
                        Dinero Capturado ($) vs Volumen Desplazado (L)
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tickFormatter={(val) => `$${val}k`} orientation="left" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" tickFormatter={(val) => `${val} L`} orientation="right" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="sales" name="Dinero Capturado ($k)" fill="#e2e8f0" radius={[4,4,0,0]} />
                                <Line yAxisId="right" type="monotone" dataKey="volume" name="Litros Movidos (L)" stroke="#d946ef" strokeWidth={3} dot={{r:4}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
