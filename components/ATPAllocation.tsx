// @ts-nocheck
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerTier } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';
import { 
    Calculator, Truck, AlertOctagon, CheckCircle2, 
    TrendingUp, Users, AlertTriangle, PlayCircle, BarChart3,
    ArrowRight, Search, ChevronDown
} from 'lucide-react';

export const ATPAllocation: React.FC = () => {
    const navigate = useNavigate();
    const { inventory, deals, contacts, locations, addDispatch } = useEnterprise();
    const [selectedLocationId, setSelectedLocationId] = useState('ALL');
    const [selectedCustomerId, setSelectedCustomerId] = useState('ALL');
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
    // State for the "What-If" Simulator
    const [selectedSku, setSelectedSku] = useState('');
    const [simOrderQty, setSimOrderQty] = useState(0);
    const [simCustomerType, setSimCustomerType] = useState<CustomerTier>(CustomerTier.STRATEGIC);
    const [simulationResult, setSimulationResult] = useState<any>(null);

    // Autocomplete/Combobox state for Product
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Autocomplete/Combobox state for Customer
    const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const customerDropdownRef = useRef<HTMLDivElement>(null);

    const products = useMemo(() => inventory.filter(i => i.category === 'Producto Terminado'), [inventory]);
    
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const lowerQuery = searchQuery.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.sku.toLowerCase().includes(lowerQuery)
        );
    }, [products, searchQuery]);

    const filteredContacts = useMemo(() => {
        if (!searchCustomerQuery) return contacts;
        const lowerQuery = searchCustomerQuery.toLowerCase();
        return contacts.filter(c => 
            c.name.toLowerCase().includes(lowerQuery) || 
            (c.email && c.email.toLowerCase().includes(lowerQuery))
        );
    }, [contacts, searchCustomerQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
                setIsCustomerDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get selected product name for display
    const selectedProductDisplay = useMemo(() => {
        const p = products.find(p => p.sku === selectedSku);
        return p ? `${p.name} (${p.sku})` : 'Seleccionar Producto...';
    }, [selectedSku, products]);

    const selectedCustomerDisplay = useMemo(() => {
        if (selectedCustomerId === 'ALL') return 'Todos los clientes';
        const c = contacts.find(c => c.id === selectedCustomerId);
        return c ? c.name : 'Todos los clientes';
    }, [selectedCustomerId, contacts]);

    // Get current product context
    const product = selectedSku ? inventory.find(p => p.sku === selectedSku) : null;
    
    const activeLocation = selectedLocationId !== 'ALL' ? locations.find(l => l.id === selectedLocationId) : null;
    let stockFisico = 0;
    let stockReservado = 0;

    if (product) {
        if (activeLocation) {
            const locationBatches = product.batches?.filter(b => 
                b.location.toLowerCase().includes(activeLocation.name.toLowerCase()) ||
                (activeLocation.name === 'Centenario' && b.location.toLowerCase().includes('bodega principal'))
            ) || [];
            stockFisico = locationBatches.reduce((acc, b) => acc + (b.quantity || 0), 0);
            stockReservado = locationBatches.reduce((acc, b) => acc + (b.reserved || 0), 0);
        } else {
            stockFisico = product.totalStock;
            stockReservado = product.reservedStock;
        }
    }

    const atp = stockFisico - stockReservado;
    
    // Get related orders sorted by priority
    const orders = useMemo(() => {
        const rawDeals = deals
            .filter(d => d.stage !== 'CLOSED_LOST' && d.stage !== 'CLOSED_WON')
            .map(d => {
                const contact = contacts.find(c => c.id === d.contactId);
                const priority = contact?.tier === 'STRATEGIC' ? 90 : (contact?.tier === 'KEY_ACCOUNT' ? 70 : 40);

                let items: { sku: string, qty: number }[] = [];
                try {
                    if (d.customFields?.cartItems) {
                        items = JSON.parse(d.customFields.cartItems);
                    }
                } catch (e) {}

                const hasMatchingSku = selectedSku ? items.some(item => item.sku === selectedSku) : true;

                return hasMatchingSku && items.length > 0 ? {
                    id: `ORD-${d.id.substring(0, 5).toUpperCase()}`,
                    customerId: contact?.id || d.contactId,
                    items: items,
                    orderDate: d.expectedCloseDate || d.createdAt || new Date().toISOString(),
                    requiredDate: d.expectedCloseDate || d.createdAt || new Date().toISOString(),
                    priorityScore: priority + (Math.floor((d.value || 0) / 1000000))
                } : null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => b.priorityScore - a.priorityScore);

        const stockTracker: Record<string, number> = {};

        return rawDeals.map((order: any) => {
            const processedItems = order.items.map((item: any) => {
                if (stockTracker[item.sku] === undefined) {
                    const prod = inventory.find(p => p.sku === item.sku);
                    if (!prod) {
                        stockTracker[item.sku] = 0;
                    } else {
                        const activeLoc = selectedLocationId !== 'ALL' ? locations.find(l => l.id === selectedLocationId) : null;
                        if (activeLoc) {
                            const locBatches = prod.batches?.filter(b => 
                                b.location.toLowerCase().includes(activeLoc.name.toLowerCase()) ||
                                (activeLoc.name === 'Centenario' && b.location.toLowerCase().includes('bodega principal'))
                            ) || [];
                            stockTracker[item.sku] = locBatches.reduce((acc, b) => acc + (b.quantity || 0), 0);
                        } else {
                            stockTracker[item.sku] = prod.totalStock;
                        }
                    }
                }

                let itemStatus = 'Pending';
                if (stockTracker[item.sku] >= item.qty) {
                    itemStatus = 'Allocated';
                    stockTracker[item.sku] -= item.qty;
                } else if (stockTracker[item.sku] > 0) {
                    itemStatus = 'Partial';
                    stockTracker[item.sku] = 0; 
                }

                return { ...item, status: itemStatus };
            });

            const allAllocated = processedItems.every((i: any) => i.status === 'Allocated');
            const allPending = processedItems.every((i: any) => i.status === 'Pending');
            const status = allAllocated ? 'Allocated' : (allPending ? 'Pending' : 'Partial');

            return {
                ...order,
                items: processedItems,
                status
            };
        }).filter((o: any) => selectedCustomerId === 'ALL' || o.customerId === selectedCustomerId);
    }, [deals, contacts, inventory, locations, selectedSku, selectedLocationId, selectedCustomerId]);

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
            {/* PRODUCT SELECTOR & KPI SUMMARY */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="w-full md:w-1/2 flex gap-4">
                        <div className="w-1/3 relative" ref={dropdownRef}>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Producto</label>
                            <div 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 flex justify-between items-center cursor-pointer"
                            >
                                <span className="truncate">{selectedProductDisplay}</span>
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            </div>

                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                                <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50">
                                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                    />
                                </div>
                                <div className="overflow-y-auto">
                                    {filteredProducts.length === 0 ? (
                                        <div className="p-3 text-sm text-slate-500 text-center">No se encontraron productos</div>
                                    ) : (
                                        filteredProducts.map(p => (
                                            <div 
                                                key={p.sku} 
                                                onClick={() => {
                                                    setSelectedSku(p.sku);
                                                    setSimulationResult(null);
                                                    setIsDropdownOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className={`p-2 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${p.sku === selectedSku ? 'bg-blue-50/50 font-semibold text-blue-700' : 'text-slate-700'}`}
                                            >
                                                {p.name} <span className="text-xs text-slate-400 ml-1">({p.sku})</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                        </div>

                        <div className="w-1/3">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Locación</label>
                            <select 
                                value={selectedLocationId}
                                onChange={(e) => setSelectedLocationId(e.target.value)}
                                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="ALL">Todas las locaciones</option>
                                {locations?.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-1/3 relative" ref={customerDropdownRef}>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Cliente</label>
                            <div 
                                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                                className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 flex justify-between items-center cursor-pointer"
                            >
                                <span className="truncate">{selectedCustomerDisplay}</span>
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            </div>

                            {isCustomerDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                                    <div className="p-2 border-b border-slate-100 flex items-center bg-slate-50">
                                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                                        <input
                                            type="text"
                                            placeholder="Buscar cliente..."
                                            className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-700"
                                            value={searchCustomerQuery}
                                            onChange={(e) => setSearchCustomerQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="overflow-y-auto">
                                        <div 
                                            onClick={() => {
                                                setSelectedCustomerId('ALL');
                                                setIsCustomerDropdownOpen(false);
                                                setSearchCustomerQuery('');
                                            }}
                                            className={`p-2 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${selectedCustomerId === 'ALL' ? 'bg-blue-50/50 font-semibold text-blue-700' : 'text-slate-700'}`}
                                        >
                                            Todos los clientes
                                        </div>
                                        {filteredContacts.length === 0 ? (
                                            <div className="p-3 text-sm text-slate-500 text-center">No se encontraron clientes</div>
                                        ) : (
                                            filteredContacts.map(c => (
                                                <div 
                                                    key={c.id} 
                                                    onClick={() => {
                                                        setSelectedCustomerId(c.id);
                                                        setIsCustomerDropdownOpen(false);
                                                        setSearchCustomerQuery('');
                                                    }}
                                                    className={`p-2 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 ${c.id === selectedCustomerId ? 'bg-blue-50/50 font-semibold text-blue-700' : 'text-slate-700'}`}
                                                >
                                                    {c.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-8 w-full md:w-1/2 justify-around">
                        <div className="text-center">
                            <div className="text-sm text-slate-500 mb-1">Stock Físico</div>
                            <div className="text-2xl font-bold text-slate-900">{product ? stockFisico : '-'}</div>
                        </div>
                        <div className="text-center relative">
                            <div className="text-sm text-slate-500 mb-1">Reservado (Hard)</div>
                            <div className="text-2xl font-bold text-slate-400">{product ? stockReservado : '-'}</div>
                            <div className="absolute -top-2 -right-4 bg-slate-100 text-slate-500 text-[10px] px-2 rounded-full">
                                {product ? orders.filter(o => o.status === 'Allocated').length : 0} Órdenes
                            </div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 min-w-[120px]">
                            <div className="text-sm text-emerald-700 font-bold mb-1 flex justify-center items-center">
                                ATP REAL
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                            </div>
                            <div className="text-3xl font-extrabold text-emerald-600">{product ? atp : '-'}</div>
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
                                    <th className="px-4 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order: any) => {
                                    const customer = contacts.find(c => c.id === order.customerId);
                                    const isExpanded = expandedOrders[order.id];
                                    const totalQty = order.items.reduce((acc: number, item: any) => acc + item.qty, 0);

                                    return (
                                        <React.Fragment key={order.id}>
                                            <tr 
                                                className="hover:bg-slate-50 cursor-pointer transition-colors"
                                                onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        <div>
                                                            <div className="font-medium text-slate-900">{order.id}</div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                                {customer?.name}
                                                                {customer?.tier === CustomerTier.STRATEGIC && (
                                                                    <span className="bg-purple-100 text-purple-700 text-[9px] px-1 rounded font-bold">EST</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{order.requiredDate}</td>
                                                <td className="px-4 py-3 text-right font-medium">{totalQty} <span className="text-[10px] text-slate-400">({order.items.length} items)</span></td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs">
                                                        {order.priorityScore}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        order.status === 'Allocated' 
                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                        : order.status === 'Partial'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {order.status === 'Allocated' ? 'Asignado' : order.status === 'Partial' ? 'Parcial' : 'Pendiente'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                    {order.status === 'Allocated' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addDispatch({
                                                                    id: `DSP-${Date.now().toString().slice(-5)}`,
                                                                    dealId: order.id,
                                                                    contactId: order.customerId,
                                                                    status: 'PENDIENTE',
                                                                    promisedDate: order.requiredDate,
                                                                    items: order.items.map((i: any) => ({
                                                                        sku: i.sku,
                                                                        productName: products.find((p: any) => p.sku === i.sku)?.name || i.sku,
                                                                        orderedQty: i.qty,
                                                                        deliveredQty: 0
                                                                    }))
                                                                });
                                                                navigate('/mezclas');
                                                            }}
                                                            className="px-3 py-1 bg-emerald-600 text-white rounded font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                                                        >
                                                            Alistar Pedido <Truck className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/mezclas');
                                                        }}
                                                        className="px-3 py-1 bg-white border border-slate-300 rounded text-slate-600 font-bold text-xs hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm flex items-center gap-1"
                                                    >
                                                        Ver <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={6} className="bg-slate-50/50 p-0 border-b border-slate-200">
                                                        <div className="px-8 py-3 bg-indigo-50/30 shadow-inner">
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                                        <th className="pb-2">Producto</th>
                                                                        <th className="pb-2 text-right">Cantidad</th>
                                                                        <th className="pb-2 text-center">Estado</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {order.items.map((item: any, idx: number) => {
                                                                        const itemProduct = products.find(p => p.sku === item.sku);
                                                                        return (
                                                                            <tr key={idx} className="border-t border-indigo-100/50">
                                                                                <td className="py-2">
                                                                                    <div className="font-medium text-slate-700">{itemProduct?.name || item.sku}</div>
                                                                                    <div className="text-[10px] text-slate-400">{item.sku}</div>
                                                                                </td>
                                                                                <td className="py-2 text-right font-medium text-slate-600">{item.qty}</td>
                                                                                <td className="py-2 text-center">
                                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                                                                        item.status === 'Allocated' 
                                                                                        ? 'bg-emerald-100 text-emerald-700' 
                                                                                        : item.status === 'Partial'
                                                                                        ? 'bg-amber-100 text-amber-700'
                                                                                        : 'bg-red-100 text-red-700'
                                                                                    }`}>
                                                                                        {item.status === 'Allocated' ? 'Asignado' : item.status === 'Partial' ? 'Parcial' : 'Pendiente'}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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