import React, { useState } from 'react';
import { Wallet, Search, Filter, Download, ArrowRight, TableProperties } from 'lucide-react';
import { formatCOP } from '../../utils/format';
import { AccountingTransaction } from '../../types';
import { useEnterprise } from '../../context/EnterpriseContext';

export interface CajaMenorTabProps {
    transactions: AccountingTransaction[];
}

export const CajaMenorTab: React.FC<CajaMenorTabProps> = ({
    transactions
}) => {
    // Local State
    const FONDO_BASE = 1500000; // COP 1,500,000 as base
    const [cajaMenorSearch, setCajaMenorSearch] = useState('');
    const [cajaMenorFilter, setCajaMenorFilter] = useState('ALL');



                                const { inventory, updateInventoryStock, addTransaction, pointsOfSale } = useEnterprise();
    const [cmHistoryDateFrom, setCmHistoryDateFrom] = useState('');
    const [cmHistoryDateTo, setCmHistoryDateTo] = useState('');
    const [cmHistorySku, setCmHistorySku] = useState('');
    const [cmHistoryMinPrice, setCmHistoryMinPrice] = useState('');
    const [cmHistoryMaxPrice, setCmHistoryMaxPrice] = useState('');
    const [egresoTercero, setEgresoTercero] = useState('');
    const [egresoConcepto, setEgresoConcepto] = useState('');
    const [egresoValor, setEgresoValor] = useState('');
    const [egresoType, setEgresoType] = useState('GASTO');
    const [egresoSku, setEgresoSku] = useState('');
    const [egresoCantidad, setEgresoCantidad] = useState('');
    const [egresoFecha, setEgresoFecha] = useState(new Date().toISOString().split('T')[0]);

                            
                            // Egresos realizados
                            const egresos = transactions.filter(t => t.paymentMethod === 'Caja Menor' && t.type === 'COMPRA');
                            const totalEgresos = egresos.reduce((sum, e) => sum + e.total, 0);
                            
                            // Reposiciones / Reembolsos
                            const reposiciones = transactions.filter(t => t.paymentMethod === 'Caja Menor' && t.type === 'PAGO_RECIBIDO');
                            const totalReposiciones = reposiciones.reduce((sum, r) => sum + r.total, 0);
                            
                            const saldoDisponible = FONDO_BASE - totalEgresos + totalReposiciones;

                            const filteredCmHistory = [...egresos, ...reposiciones].filter(mov => {
                                if (cmHistoryDateFrom && mov.date < cmHistoryDateFrom) return false;
                                if (cmHistoryDateTo && mov.date > cmHistoryDateTo) return false;
                                if (cmHistorySku && (!mov.sku || !mov.sku.toLowerCase().includes(cmHistorySku.toLowerCase()))) return false;
                                if (cmHistoryMinPrice && mov.total < Number(cmHistoryMinPrice)) return false;
                                if (cmHistoryMaxPrice && mov.total > Number(cmHistoryMaxPrice)) return false;
                                return true;
                            }).sort((a, b) => b.date.localeCompare(a.date));

                            const handleRegistrarEgreso = (e: React.FormEvent) => {
                                e.preventDefault();
                                if (!egresoTercero || !egresoConcepto || !egresoValor || Number(egresoValor) <= 0) {
                                    alert('Por favor complete Tercero, Concepto y un Valor mayor a cero.');
                                    return;
                                }

                                if (egresoType === 'INVENTARIO') {
                                    if (!egresoSku) {
                                        alert('Por favor seleccione un SKU/Producto para el ingreso de inventario.');
                                        return;
                                    }
                                    if (!egresoCantidad || Number(egresoCantidad) <= 0) {
                                        alert('Por favor ingrese una cantidad válida mayor a cero.');
                                        return;
                                    }
                                }

                                const valor = Number(egresoValor);
                                if (valor > saldoDisponible) {
                                    alert('OPERACIÓN RECHAZADA: Saldo insuficiente en la Caja Menor para cubrir este egreso.');
                                    return;
                                }

                                const selectedProduct = inventory.find(p => p.sku === egresoSku);
                                
                                // Si es de tipo inventario, sumamos stock en Avalon
                                if (egresoType === 'INVENTARIO' && selectedProduct) {
                                    updateInventoryStock(selectedProduct.id, Number(egresoCantidad));
                                }

                                addTransaction({
                                    id: `CM-${Math.floor(Math.random() * 9000) + 1000}`,
                                    date: egresoFecha,
                                    type: 'COMPRA',
                                    client: egresoTercero,
                                    document: 'Caja Menor',
                                    productName: egresoType === 'INVENTARIO'
                                        ? `[Caja Menor] Compra Insumo: ${selectedProduct?.name || egresoSku} (${egresoConcepto})`
                                        : `[Caja Menor] Gasto: ${egresoConcepto}`,
                                    sku: egresoType === 'INVENTARIO' ? egresoSku : 'N/A',
                                    qty: egresoType === 'INVENTARIO' ? Number(egresoCantidad) : 1,
                                    total: valor,
                                    iva: 0,
                                    paymentMethod: 'Caja Menor',
                                    posLocation: pointsOfSale?.[0] || 'Bogotá',
                                    siigoExportStatus: 'PENDING_SIIGO_SYNC',
                                    siigoDocType: 'EGRESO'
                                });

                                // Limpiar formulario
                                setEgresoTercero('');
                                setEgresoConcepto('');
                                setEgresoValor('');
                                setEgresoSku('');
                                setEgresoCantidad('');
                                alert('Egreso registrado exitosamente en Caja Menor (Encolado para exportación SIIGO).');
                            };

                            const handleReembolsoCaja = () => {
                                const montoAReembolsar = FONDO_BASE - saldoDisponible;
                                if (montoAReembolsar <= 0) {
                                    alert('La Caja Menor ya se encuentra al 100% de su capacidad. No se requiere reembolso.');
                                    return;
                                }

                                if (confirm(`¿Confirma el reembolso de la Caja Menor por un valor de $${montoAReembolsar.toLocaleString('es-CO')} COP desde Bancos?`)) {
                                    addTransaction({
                                        id: `RC-${Math.floor(Math.random() * 9000) + 1000}`,
                                        date: new Date().toISOString().split('T')[0],
                                        type: 'PAGO_RECIBIDO',
                                        client: 'Reembolso Caja Menor',
                                        document: 'Reembolso Caja Menor',
                                        productName: 'Reposición / Reembolso de fondos de Caja Menor',
                                        sku: 'N/A',
                                        qty: 1,
                                        total: montoAReembolsar,
                                        iva: 0,
                                        paymentMethod: 'Caja Menor',
                                        posLocation: pointsOfSale?.[0] || 'Bogotá',
                                        siigoExportStatus: 'PENDING_SIIGO_SYNC',
                                        siigoDocType: 'REEMBOLSO_BANCOS'
                                    });
                                    alert(`Caja Menor reembolsada. Saldo disponible restablecido a $${FONDO_BASE.toLocaleString('es-CO')} COP (Encolado para SIIGO).`);
                                }
                            };

                            return (
                                <div className="space-y-6">
                                    {/* Caja Menor Metrics Card */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        \n    return (\n<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fondo Total Base</div>
                                                <div className="text-3xl font-black text-slate-900 mt-2">${FONDO_BASE.toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">COP</span></div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">Monto fijo autorizado de caja menor</div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gastos Acumulados</div>
                                                <div className="text-3xl font-black text-rose-600 mt-2">${(totalEgresos - totalReposiciones).toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">COP</span></div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-xs text-slate-500 font-medium">Pendientes por reembolso</span>
                                                <button
                                                    onClick={handleReembolsoCaja}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
                                                >
                                                    Reembolsar Caja
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo Disponible</div>
                                                <div className={`text-3xl font-black mt-2 ${saldoDisponible > 500000 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    ${saldoDisponible.toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-400">COP</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                                                Capacidad disponible: {((saldoDisponible / FONDO_BASE) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Register Expense and History layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                        {/* Register Form */}
                                        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <Wallet className="w-5 h-5 text-indigo-500" />
                                                Registrar Egreso de Caja
                                            </h3>

                                            <form onSubmit={handleRegistrarEgreso} className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tipo de Movimiento</label>
                                                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEgresoType('GASTO')}
                                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${egresoType === 'GASTO' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                                                        >
                                                            Gasto General
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEgresoType('INVENTARIO')}
                                                            className={`py-2 text-xs font-bold rounded-lg transition-all ${egresoType === 'INVENTARIO' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                                                        >
                                                            Compra Empaque/Stock
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fecha</label>
                                                    <input
                                                        type="date"
                                                        value={egresoFecha}
                                                        onChange={e => setEgresoFecha(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tercero / Proveedor</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. Papelería La 15, Empaques S.A.S."
                                                        value={egresoTercero}
                                                        onChange={e => setEgresoTercero(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Descripción / Concepto</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. Compra de marcadores, café, cajas de cartón"
                                                        value={egresoConcepto}
                                                        onChange={e => setEgresoConcepto(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium"
                                                        required
                                                    />
                                                </div>

                                                {egresoType === 'INVENTARIO' && (
                                                    <div className="space-y-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-indigo-600 mb-1">Seleccionar Producto/Insumo</label>
                                                            <select
                                                                value={egresoSku}
                                                                onChange={e => setEgresoSku(e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                                            >
                                                                <option value="">-- Seleccionar SKU --</option>
                                                                {inventory.map(p => (
                                                                    <option key={p.id} value={p.sku}>
                                                                        {p.sku} - {p.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] uppercase font-bold text-indigo-600 mb-1">Cantidad a ingresar</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                placeholder="Cantidad de unidades/litros"
                                                                value={egresoCantidad}
                                                                onChange={e => setEgresoCantidad(e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Monto / Valor ($)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Monto total del gasto"
                                                        value={egresoValor}
                                                        onChange={e => setEgresoValor(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800"
                                                        required
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full py-3 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                                                >
                                                    Registrar Movimiento
                                                </button>
                                            </form>
                                        </div>

                                        {/* History Table */}
                                        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-[550px]">
                                            <h3 className="text-base font-bold text-slate-800 mb-2">Historial de Movimientos de Caja Menor</h3>
                                            
                                            {/* Filters Bar */}
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Fecha Desde</label>
                                                    <input 
                                                        type="date" 
                                                        value={cmHistoryDateFrom} 
                                                        onChange={e => setCmHistoryDateFrom(e.target.value)} 
                                                        className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Fecha Hasta</label>
                                                    <input 
                                                        type="date" 
                                                        value={cmHistoryDateTo} 
                                                        onChange={e => setCmHistoryDateTo(e.target.value)} 
                                                        className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Buscar por SKU</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ej: 202401" 
                                                        value={cmHistorySku} 
                                                        onChange={e => setCmHistorySku(e.target.value)} 
                                                        className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white font-mono"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Monto (Mín - Máx)</label>
                                                    <div className="flex gap-1">
                                                        <input 
                                                            type="number" 
                                                            placeholder="Mín" 
                                                            value={cmHistoryMinPrice} 
                                                            onChange={e => setCmHistoryMinPrice(e.target.value)} 
                                                            className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                        />
                                                        <input 
                                                            type="number" 
                                                            placeholder="Máx" 
                                                            value={cmHistoryMaxPrice} 
                                                            onChange={e => setCmHistoryMaxPrice(e.target.value)} 
                                                            className="w-full text-[11px] border-slate-200 rounded-lg p-1 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                                                        <tr className="border-b border-slate-200">
                                                            <th className="py-3 px-4">Fecha</th>
                                                            <th className="py-3 px-4">Comprobante ID</th>
                                                            <th className="py-3 px-4">Tercero</th>
                                                            <th className="py-3 px-4">Concepto</th>
                                                            <th className="py-3 px-4">SKU</th>
                                                            <th className="py-3 px-4 text-center">Cant</th>
                                                            <th className="py-3 px-4 text-right">Valor</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {filteredCmHistory.map((mov, idx) => (
                                                            <tr key={idx} className="hover:bg-slate-50/50">
                                                                <td className="py-3.5 px-4 text-slate-500 font-medium">{mov.date}</td>
                                                                <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{mov.id}</td>
                                                                <td className="py-3.5 px-4 text-slate-700 font-bold">{mov.client}</td>
                                                                <td className="py-3.5 px-4 text-slate-600 font-medium truncate max-w-[200px]" title={mov.productName}>
                                                                    {mov.productName}
                                                                </td>
                                                                <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{mov.sku || 'N/A'}</td>
                                                                <td className="py-3.5 px-4 text-center font-bold text-slate-700">{mov.qty}</td>
                                                                <td className={`py-3.5 px-4 text-right font-black ${mov.type === 'PAGO_RECIBIDO' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                                    {mov.type === 'PAGO_RECIBIDO' ? '+' : '-'}${mov.total.toLocaleString('es-CO')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {filteredCmHistory.length === 0 && (
                                                            <tr>
                                                                <td colSpan={7} className="text-center py-20 text-slate-400 font-medium">
                                                                    No se encontraron movimientos con los filtros aplicados.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
    );
};