import React from 'react';
import { HandCoins, Banknote, PackageOpen, AlertTriangle, Landmark, FileSpreadsheet, Search } from 'lucide-react';
import { formatCOP } from '../../utils/format';

export interface ActivosLiquidezTabProps {
    inventory: any[];
    inventarioValorizado: any;
    carteraData: any;
    cxPData: any;
    leftPanelMode: 'AR' | 'AP';
    setLeftPanelMode: (mode: 'AR' | 'AP') => void;
    expandedCarteraClient: string | null;
    setExpandedCarteraClient: (client: string | null) => void;
    setPaymentClient: (client: any) => void;
    setPaymentAmount: (amount: string) => void;
    setPaymentRef: (ref: string) => void;
    setPaymentSelectedInvoice: (invoice: any) => void;
    setShowPaymentModal: (show: boolean) => void;
    transactions: any[];
    setSelectedCxPInvoice: (invoice: any) => void;
    setCxPPaymentAmount: (amount: string) => void;
    setShowCxPPaymentModal: (show: boolean) => void;
    inventorySortBy: string;
    setInventorySortBy: any;
    inventorySearchQuery: string;
    setInventorySearchQuery: (query: string) => void;
}

export const ActivosLiquidezTab: React.FC<ActivosLiquidezTabProps> = ({
    inventory,
    inventarioValorizado,
    carteraData,
    cxPData,
    leftPanelMode,
    setLeftPanelMode,
    expandedCarteraClient,
    setExpandedCarteraClient,
    setPaymentClient,
    setPaymentAmount,
    setPaymentRef,
    setPaymentSelectedInvoice,
    setShowPaymentModal,
    transactions,
    setSelectedCxPInvoice,
    setCxPPaymentAmount,
    setShowCxPPaymentModal,
    inventorySortBy,
    setInventorySortBy,
    inventorySearchQuery,
    setInventorySearchQuery
}) => {
    const filteredInventoryItems = inventarioValorizado.items.filter((item: any) => {
        if (!inventorySearchQuery) return true;
        const q = inventorySearchQuery.toLowerCase();
        return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    });
    const filteredInventoryTotal = filteredInventoryItems.reduce((sum: number, item: any) => sum + item.valorTotal, 0);

    return (() => {
                            const filteredInventoryItems = inventarioValorizado.items.filter(item => {
                                if (!inventorySearchQuery) return true;
                                const q = inventorySearchQuery.toLowerCase();
                                return item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
                            });
                            const filteredInventoryTotal = filteredInventoryItems.reduce((sum, item) => sum + item.valorTotal, 0);

                            return (
                                <div className="space-y-6 flex flex-col h-full overflow-hidden">
                                    {/* Consolidado de Activos Líquidos KPI Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                <HandCoins className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Cartera Cobrar (AR)</p>
                                                <p className="text-base font-black text-slate-800">{formatCOP(carteraData.carteraTotal)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                                <Banknote className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Cuentas por Pagar (AP)</p>
                                                <p className="text-base font-black text-slate-800">{formatCOP(cxPData.totalPagar)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <PackageOpen className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Inventario Valorizado</p>
                                                <p className="text-base font-black text-slate-800">{formatCOP(inventarioValorizado.totalCosto)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Pasivo Vencido (Mora)</p>
                                                <p className="text-base font-black text-amber-700">{formatCOP(cxPData.pagarVencido)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md flex items-center gap-3">
                                            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl">
                                                <Landmark className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-indigo-200 uppercase">Capital Neto Corriente</p>
                                                <p className="text-base font-black text-white">
                                                    {formatCOP(carteraData.carteraTotal + inventarioValorizado.totalCosto - cxPData.totalPagar)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Split View Grid */}
                                    <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
                                        {/* Left: Accounts Receivable or Accounts Payable List (7 cols) */}
                                        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col min-h-0">
                                            <div className="flex justify-between items-center mb-3 shrink-0">
                                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                                    {leftPanelMode === 'AR' ? (
                                                        <>
                                                            <HandCoins className="w-4 h-4 text-indigo-600" />
                                                            Cartera de Clientes & Cuentas por Cobrar
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Banknote className="w-4 h-4 text-rose-600" />
                                                            Cuentas por Pagar a Proveedores
                                                        </>
                                                    )}
                                                </h3>
                                                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                                    <button 
                                                        onClick={() => setLeftPanelMode('AR')}
                                                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${leftPanelMode === 'AR' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Cuentas por Cobrar (AR)
                                                    </button>
                                                    <button 
                                                        onClick={() => setLeftPanelMode('AP')}
                                                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${leftPanelMode === 'AP' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        Cuentas por Pagar (AP)
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto">
                                                {leftPanelMode === 'AR' ? (
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-10">
                                                            <tr className="border-b border-slate-200">
                                                                <th className="p-3">Cliente</th>
                                                                <th className="p-3">Estado</th>
                                                                <th className="p-3 text-right">Saldo Pendiente</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {carteraData.clientList.map((c, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <tr 
                                                                        className="hover:bg-slate-50 cursor-pointer transition"
                                                                        onClick={() => setExpandedCarteraClient(expandedCarteraClient === c.client ? null : c.client)}
                                                                    >
                                                                        <td className="p-3 font-bold text-sm text-slate-800">{c.client}</td>
                                                                        <td className="p-3">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                                                                c.status === 'MORA' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                            }`}>
                                                                                {c.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3 text-sm font-black text-slate-900 text-right">{formatCOP(c.totalDebt)}</td>
                                                                    </tr>
                                                                    {expandedCarteraClient === c.client && (
                                                                        <tr>
                                                                            <td colSpan={3} className="p-0 border-b border-slate-200">
                                                                                <div className="bg-slate-50 p-4 border-l-4 border-indigo-500 shadow-inner">
                                                                                    <div className="flex justify-between items-center mb-3">
                                                                                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                                                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                                                                                            Estado de Cuenta
                                                                                        </h4>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setPaymentClient(c);
                                                                                                setPaymentAmount('');
                                                                                                setPaymentRef('');
                                                                                                setPaymentSelectedInvoice(null);
                                                                                                setShowPaymentModal(true);
                                                                                            }}
                                                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition active:scale-95"
                                                                                        >
                                                                                            <HandCoins className="w-3 h-3" /> Registrar Recibo
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="overflow-x-auto text-[11px]">
                                                                                        <table className="w-full text-left bg-white rounded border border-slate-200 shadow-sm">
                                                                                            <thead className="bg-slate-100 border-b border-slate-200">
                                                                                                <tr>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Fecha</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Documento</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Tipo</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500 text-right">Valor</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody className="divide-y divide-slate-100">
                                                                                                {transactions
                                                                                                    .filter(t => t.client === c.client && ['VENTA', 'PAGO_RECIBIDO', 'NOTA_CREDITO'].includes(t.type))
                                                                                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                                                                                    .map((t, tIdx) => (
                                                                                                        <tr key={tIdx}>
                                                                                                            <td className="p-2 font-medium text-slate-500">{t.date}</td>
                                                                                                            <td className="p-2 font-mono font-bold text-slate-700">{t.id}</td>
                                                                                                            <td className="p-2 font-bold text-slate-600">{t.type === 'VENTA' ? 'Factura Venta' : 'Recibo Caja'}</td>
                                                                                                            <td className={`p-2 text-right font-black ${t.type === 'VENTA' ? 'text-slate-800' : 'text-emerald-600'}`}>
                                                                                                                {t.type === 'VENTA' ? '' : '-'}{formatCOP(t.total)}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    ))}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-10">
                                                            <tr className="border-b border-slate-200">
                                                                <th className="p-3">Proveedor</th>
                                                                <th className="p-3">Estado</th>
                                                                <th className="p-3 text-right">Saldo Pendiente</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {cxPData.providerList.map((p, idx) => (
                                                                <React.Fragment key={idx}>
                                                                    <tr 
                                                                        className="hover:bg-slate-50 cursor-pointer transition"
                                                                        onClick={() => setExpandedCarteraClient(expandedCarteraClient === p.provider ? null : p.provider)}
                                                                    >
                                                                        <td className="p-3">
                                                                            <div className="font-bold text-sm text-slate-800">{p.provider}</div>
                                                                            <div className="text-[10px] text-slate-400 font-mono">{p.document}</div>
                                                                        </td>
                                                                        <td className="p-3">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                                                                p.status === 'VENCIDO' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                                                            }`}>
                                                                                {p.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-3 text-sm font-black text-slate-900 text-right">{formatCOP(p.balance)}</td>
                                                                    </tr>
                                                                    {expandedCarteraClient === p.provider && (
                                                                        <tr>
                                                                            <td colSpan={3} className="p-0 border-b border-slate-200">
                                                                                <div className="bg-slate-50 p-4 border-l-4 border-rose-500 shadow-inner">
                                                                                    <div className="flex justify-between items-center mb-3">
                                                                                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                                                            <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" />
                                                                                            Facturas y Cuentas de Cobro Pendientes
                                                                                        </h4>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setSelectedCxPInvoice(p);
                                                                                                setCxPPaymentAmount(p.balance.toString());
                                                                                                setShowCxPPaymentModal(true);
                                                                                            }}
                                                                                            className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition active:scale-95"
                                                                                        >
                                                                                            <Banknote className="w-3 h-3" /> Registrar Pago
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="overflow-x-auto text-[11px]">
                                                                                        <table className="w-full text-left bg-white rounded border border-slate-200 shadow-sm">
                                                                                            <thead className="bg-slate-100 border-b border-slate-200">
                                                                                                <tr>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Vencimiento</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Factura / Cuenta</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500">Días Restantes</th>
                                                                                                    <th className="p-2 text-[10px] font-bold text-slate-500 text-right">Saldo</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody className="divide-y divide-slate-100">
                                                                                                <tr>
                                                                                                    <td className="p-2 font-medium text-slate-500">{p.dueDate}</td>
                                                                                                    <td className="p-2 font-mono font-bold text-slate-700">{p.invoiceId}</td>
                                                                                                    <td className="p-2 font-bold text-slate-600">
                                                                                                        {(() => {
                                                                                                            const diffTime = new Date(p.dueDate).getTime() - new Date().getTime();
                                                                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                                                            return diffDays > 0 ? `${diffDays} días` : `Vencido hace ${Math.abs(diffDays)} días`;
                                                                                                        })()}
                                                                                                    </td>
                                                                                                    <td className="p-2 text-right font-black text-rose-600">
                                                                                                        {formatCOP(p.balance)}
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Valued Inventory (5 cols) */}
                                        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col min-h-0">
                                            <div className="flex justify-between items-center mb-2 shrink-0">
                                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                                                    <PackageOpen className="w-4 h-4 text-indigo-600" />
                                                    Valorización de Inventario Físico (Stock)
                                                </h3>
                                                <select
                                                    value={inventorySortBy}
                                                    onChange={e => setInventorySortBy(e.target.value as any)}
                                                    className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-700 outline-none"
                                                >
                                                    <option value="VALOR_DESC">Valor (Mayor a Menor)</option>
                                                    <option value="VALOR_ASC">Valor (Menor a Mayor)</option>
                                                    <option value="STOCK_DESC">Stock (Mayor a Menor)</option>
                                                    <option value="STOCK_ASC">Stock (Menor a Mayor)</option>
                                                    <option value="SKU_ASC">SKU (A-Z)</option>
                                                    <option value="SKU_DESC">SKU (Z-A)</option>
                                                </select>
                                            </div>

                                            {/* Search input and dynamic total */}
                                            <div className="mb-3 flex items-center gap-2 shrink-0">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-xs">
                                                    <Search className="w-3.5 h-3.5 text-slate-400" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Buscar SKU o producto..." 
                                                        value={inventorySearchQuery}
                                                        onChange={e => setInventorySearchQuery(e.target.value)}
                                                        className="bg-transparent outline-none w-full font-medium text-slate-700 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg text-[10px] font-black whitespace-nowrap">
                                                    En plata: {formatCOP(filteredInventoryTotal)}
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 z-10">
                                                        <tr className="border-b border-slate-200">
                                                            <th className="p-3">SKU / Producto</th>
                                                            <th className="p-3 text-right">Stock</th>
                                                            <th className="p-3 text-right">Valor Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {[...filteredInventoryItems].sort((a, b) => {
                                                            if (inventorySortBy === 'VALOR_DESC') return b.valorTotal - a.valorTotal;
                                                            if (inventorySortBy === 'VALOR_ASC') return a.valorTotal - b.valorTotal;
                                                            if (inventorySortBy === 'STOCK_DESC') return b.totalStock - a.totalStock;
                                                            if (inventorySortBy === 'STOCK_ASC') return a.totalStock - b.totalStock;
                                                            if (inventorySortBy === 'SKU_ASC') return a.sku.localeCompare(b.sku);
                                                            if (inventorySortBy === 'SKU_DESC') return b.sku.localeCompare(a.sku);
                                                            return 0;
                                                        }).slice(0, 40).map(item => (
                                                            <tr key={item.id} className="hover:bg-slate-50">
                                                                <td className="p-3">
                                                                    <div className="font-bold text-slate-800 font-mono">{item.sku}</div>
                                                                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{item.name}</div>
                                                                </td>
                                                                <td className="p-3 text-right font-semibold text-slate-600">{item.totalStock} {item.baseUnit}</td>
                                                                <td className="p-3 text-right font-black text-slate-800">{formatCOP(item.valorTotal)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="pt-2 text-center text-[10px] text-slate-400 font-medium border-t border-slate-100 shrink-0">
                                                Mostrando top existencias.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })(
    );
};
