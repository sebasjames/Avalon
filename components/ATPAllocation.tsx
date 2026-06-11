import React, { useState, useMemo } from 'react';
import { MOCK_INVENTORY, MOCK_CUSTOMERS, MOCK_SALES_ORDERS } from '../constants';
import { InventoryStatus, CustomerTier } from '../types';
import { 
    Calculator, Truck, AlertOctagon, CheckCircle2, 
    TrendingUp, Users, AlertTriangle, PlayCircle, BarChart3,
    ArrowRight
} from 'lucide-react';

export const ATPAllocation: React.FC = () => {
    // State for the "What-If" Simulator
    const [selectedSku, setSelectedSku] = useState('FG-COAT-550');
    const [simOrderQty, setSimOrderQty] = useState(0);
    const [simCustomerType, setSimCustomerType] = useState<CustomerTier>(CustomerTier.STRATEGIC);
    const [simulationResult, setSimulationResult] = useState<any>(null);

    // Get current product context
    const product = MOCK_INVENTORY.find(p => p.sku === selectedSku) || MOCK_INVENTORY[1];
    const atp = product.totalStock - product.reservedStock;
    
    // Get related orders sorted by priority
    const orders = MOCK_SALES_ORDERS.filter(o => o.skuId === selectedSku)
        .sort((a, b) => b.priorityScore - a.priorityScore);

    const handleSimulate = () => {
        if (simOrderQty <= 0) return;

        let currentFreeStock = atp;
        let conflictOrders = [];
        let canFulfill = false;

        // Simple Logic: 
        // 1. If we have enough ATP, easy.
        // 2. If not, can we "steal" from lower priority orders?
        
        if (currentFreeStock >= simOrderQty) {
            canFulfill = true;
            setSimulationResult({
                status: 'OK',
                message: 'Stock disponible suficiente. No afecta otras órdenes.',
                impactedOrders: []
            });
        } else {
            // How much do we need?
            const deficit = simOrderQty - currentFreeStock;
            
            // Look for victims (Allocated orders with lower priority than NEW simulated order)
            // Assuming the new order has high priority for this test
            const simulatedPriority = simCustomerType === CustomerTier.STRATEGIC ? 90 : 50;

            let recoveredStock = 0;
            const potentialVictims = orders
                .filter(o => o.status === 'Allocated' && o.priorityScore < simulatedPriority)
                .sort((a, b) => a.priorityScore - b.priorityScore); // Take from lowest first

            const victims = [];
            for (const victim of potentialVictims) {
                if (recoveredStock < deficit) {
                    recoveredStock += victim.qty;
                    victims.push(victim);
                }
            }

            if (recoveredStock >= deficit) {
                setSimulationResult({
                    status: 'WARNING',
                    message: `Se requiere re-asignar stock. ${victims.length} orden(es) de menor prioridad pasarán a Backorder.`,
                    impactedOrders: victims
                });
            } else {
                setSimulationResult({
                    status: 'FAIL',
                    message: 'Imposible cumplir incluso reasignando. Stock insuficiente total.',
                    impactedOrders: []
                });
            }
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Calculator className="w-6 h-6 mr-2 text-slate-700"/>
                    ATP & Reparto (Asignación)
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Gestión de disponible para prometer, priorización de clientes y simulación de conflictos.
                </p>
            </header>

            {/* PRODUCT SELECTOR & KPI SUMMARY */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="w-full md:w-1/3">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Producto Analizado</label>
                        <select 
                            value={selectedSku}
                            onChange={(e) => { setSelectedSku(e.target.value); setSimulationResult(null); }}
                            className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-blue-500"
                        >
                            {MOCK_INVENTORY.filter(i => i.category === 'Producto Terminado').map(p => (
                                <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-8 w-full md:w-2/3 justify-around">
                        <div className="text-center">
                            <div className="text-sm text-slate-500 mb-1">Stock Físico</div>
                            <div className="text-2xl font-bold text-slate-900">{product.totalStock}</div>
                        </div>
                        <div className="text-center relative">
                            <div className="text-sm text-slate-500 mb-1">Reservado (Hard)</div>
                            <div className="text-2xl font-bold text-slate-400">{product.reservedStock}</div>
                            <div className="absolute -top-2 -right-4 bg-slate-100 text-slate-500 text-[10px] px-2 rounded-full">
                                {orders.filter(o => o.status === 'Allocated').length} Órdenes
                            </div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 min-w-[120px]">
                            <div className="text-sm text-emerald-700 font-bold mb-1 flex justify-center items-center">
                                ATP REAL
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                            </div>
                            <div className="text-3xl font-extrabold text-emerald-600">{atp}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: ORDER QUEUE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800 flex items-center">
                                <Truck className="w-4 h-4 mr-2 text-indigo-600"/> Cola de Asignación Actual
                            </h3>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
                                Ordenado por Score (Margen + SLA)
                            </span>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Orden / Cliente</th>
                                    <th className="px-4 py-3">Req. Date</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3 text-center">Score</th>
                                    <th className="px-4 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map(order => {
                                    const customer = MOCK_CUSTOMERS.find(c => c.id === order.customerId);
                                    return (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{order.id}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                                    {customer?.name}
                                                    {customer?.tier === CustomerTier.STRATEGIC && (
                                                        <span className="bg-purple-100 text-purple-700 text-[9px] px-1 rounded font-bold">EST</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{order.requiredDate}</td>
                                            <td className="px-4 py-3 text-right font-medium">{order.qty}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs">
                                                    {order.priorityScore}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    order.status === 'Allocated' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {order.status === 'Allocated' ? 'Asignado' : 'Backorder'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT COLUMN: SIMULATOR */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold text-slate-800 flex items-center mb-4">
                            <AlertOctagon className="w-4 h-4 mr-2 text-rose-500"/> 
                            Simulador de Impacto ("What-If")
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Nueva Cantidad Solicitada</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                    placeholder="Ej. 500"
                                    value={simOrderQty}
                                    onChange={(e) => setSimOrderQty(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de Cliente Simulado</label>
                                <select 
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                    value={simCustomerType}
                                    onChange={(e) => setSimCustomerType(e.target.value as CustomerTier)}
                                >
                                    <option value={CustomerTier.STRATEGIC}>Estratégico (Alta Prioridad)</option>
                                    <option value={CustomerTier.REGULAR}>Regular (Estándar)</option>
                                </select>
                            </div>
                            
                            <button 
                                onClick={handleSimulate}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium flex justify-center items-center transition-colors"
                            >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Ejecutar Simulación
                            </button>
                        </div>

                        {/* SIMULATION RESULTS */}
                        {simulationResult && (
                            <div className={`mt-6 p-4 rounded-lg border animate-in fade-in zoom-in duration-300 ${
                                simulationResult.status === 'OK' 
                                ? 'bg-emerald-50 border-emerald-200' 
                                : simulationResult.status === 'WARNING' 
                                    ? 'bg-amber-50 border-amber-200' 
                                    : 'bg-rose-50 border-rose-200'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {simulationResult.status === 'OK' && <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />}
                                    {simulationResult.status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />}
                                    {simulationResult.status === 'FAIL' && <AlertOctagon className="w-5 h-5 text-rose-600 mt-0.5" />}
                                    
                                    <div>
                                        <h4 className={`text-sm font-bold mb-1 ${
                                            simulationResult.status === 'OK' ? 'text-emerald-800' : 
                                            simulationResult.status === 'WARNING' ? 'text-amber-800' : 'text-rose-800'
                                        }`}>
                                            Resultado: {simulationResult.status}
                                        </h4>
                                        <p className="text-xs text-slate-700 leading-relaxed">
                                            {simulationResult.message}
                                        </p>
                                    </div>
                                </div>

                                {simulationResult.impactedOrders.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-amber-200/50">
                                        <p className="text-xs font-semibold text-amber-800 mb-2">Órdenes que perderán asignación:</p>
                                        <ul className="space-y-1">
                                            {simulationResult.impactedOrders.map((o: any) => (
                                                <li key={o.id} className="text-xs text-slate-600 flex justify-between bg-white/50 p-1 rounded">
                                                    <span>{o.id} ({o.qty}u)</span>
                                                    <span className="font-mono text-slate-400">Score: {o.priorityScore}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};