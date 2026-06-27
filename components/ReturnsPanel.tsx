import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Search, CheckCircle, Package, ArrowRight, User } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Product, CrmContact } from '../types';

export const ReturnsPanel: React.FC = () => {
    const { inventory, contacts, pointsOfSale, processCreditNote, transactions } = useEnterprise();
    
    const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);
    const [contactSearch, setContactSearch] = useState('');
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSearch, setProductSearch] = useState('');
    
    const [qty, setQty] = useState<number>(1);
    const [location, setLocation] = useState<string>('Garantías / Averías');
    const [reason, setReason] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [historySearch, setHistorySearch] = useState('');

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        (c.documentNumber && c.documentNumber.includes(contactSearch))
    ).slice(0, 5);

    const filteredProducts = inventory.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 5);

    const handleProcessReturn = () => {
        if (!selectedContact || !selectedProduct || qty <= 0) return;
        
        setProcessing(true);
        setTimeout(() => {
            const totalValue = selectedProduct.price * qty;
            const ivaRate = selectedProduct.taxRate ?? 19;
            const ivaValue = Math.round(totalValue * (ivaRate / 100));
            
            processCreditNote({
                id: `NC-${Date.now()}`,
                date: new Date().toISOString(),
                type: 'NOTA_CREDITO',
                client: selectedContact.name,
                clientId: selectedContact.id,
                document: `Devolución - ${reason}`,
                sku: selectedProduct.sku,
                productName: selectedProduct.name,
                qty: qty,
                total: totalValue + ivaValue,
                iva: ivaValue,
                paymentMethod: 'Saldo a Favor',
                posLocation: location
            });
            
            setProcessing(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSelectedContact(null);
                setSelectedProduct(null);
                setQty(1);
                setReason('');
                setContactSearch('');
                setProductSearch('');
            }, 3000);
        }, 1000);
    };

    const creditNotesHistory = (transactions || []).filter(t => (t.type as string) === 'NOTA_CREDITO');
    const filteredHistory = creditNotesHistory.filter(cn => {
        const query = historySearch.toLowerCase();
        return (
            cn.id.toLowerCase().includes(query) ||
            cn.client.toLowerCase().includes(query) ||
            (cn.sku && cn.sku.toLowerCase().includes(query)) ||
            (cn.productName && cn.productName.toLowerCase().includes(query)) ||
            (cn.document && cn.document.toLowerCase().includes(query))
        );
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                    <RefreshCcw size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Devoluciones y Notas Crédito</h2>
                    <p className="text-sm font-medium text-slate-500">Registra retornos de mercancía y genera saldos a favor.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-4"
                        >
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Nota Crédito Generada</h3>
                            <p className="text-slate-600 max-w-md">
                                El producto ha ingresado a la bodega <strong>{location}</strong> y el saldo a favor ha sido abonado a la cuenta del cliente.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Left Column: Selection */}
                            <div className="space-y-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <User size={16} className="text-indigo-500" /> 1. Seleccionar Cliente
                                    </h3>
                                    
                                    {!selectedContact ? (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    placeholder="Buscar por nombre o NIT..."
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                    value={contactSearch}
                                                    onChange={e => setContactSearch(e.target.value)}
                                                />
                                            </div>
                                            {contactSearch && (
                                                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                                                    {filteredContacts.map(c => (
                                                        <div 
                                                            key={c.id}
                                                            onClick={() => setSelectedContact(c)}
                                                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                                                        >
                                                            <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                                                            <div className="text-xs text-slate-500">{c.documentType} {c.documentNumber}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                                            <div>
                                                <div className="font-bold text-indigo-900">{selectedContact.name}</div>
                                                <div className="text-xs text-indigo-700 font-medium">Saldo a Favor Actual: ${(selectedContact.accountBalance || 0).toLocaleString()}</div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedContact(null)}
                                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                            >
                                                Cambiar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Package size={16} className="text-rose-500" /> 2. Producto Devuelto
                                    </h3>
                                    
                                    {!selectedProduct ? (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input 
                                                    type="text"
                                                    placeholder="Buscar producto..."
                                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                    value={productSearch}
                                                    onChange={e => setProductSearch(e.target.value)}
                                                    disabled={!selectedContact}
                                                />
                                            </div>
                                            {productSearch && (
                                                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                                    {filteredProducts.map(p => (
                                                        <div 
                                                            key={p.id}
                                                            onClick={() => setSelectedProduct(p)}
                                                            className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center"
                                                        >
                                                            <div>
                                                                <div className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{p.name}</div>
                                                                <div className="text-xs text-slate-500">{p.sku}</div>
                                                            </div>
                                                            <div className="font-bold text-slate-700 text-sm">
                                                                ${p.price.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center p-4 bg-rose-50 border border-rose-100 rounded-xl">
                                            <div>
                                                <div className="font-bold text-rose-900 line-clamp-1">{selectedProduct.name}</div>
                                                <div className="text-xs text-rose-700 font-medium">{selectedProduct.sku} - ${(selectedProduct.price).toLocaleString()} c/u</div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedProduct(null)}
                                                className="text-xs font-bold text-rose-600 hover:text-rose-800"
                                            >
                                                Cambiar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Details & Confirm */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">3. Detalles de la Devolución</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cantidad Devuelta</label>
                                            <input 
                                                type="number"
                                                min="1"
                                                value={qty}
                                                onChange={e => setQty(Number(e.target.value) || 1)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                disabled={!selectedProduct}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bodega Destino</label>
                                            <select 
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                {pointsOfSale.map(pos => (
                                                    <option key={pos} value={pos}>{pos}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivo</label>
                                        <textarea 
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            placeholder="Ej: Defecto de fábrica, cambio de color, etc..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                                            disabled={!selectedProduct}
                                        />
                                    </div>

                                    {selectedProduct && (() => {
                                        const calculatedIva = Math.round(selectedProduct.price * ((selectedProduct.taxRate ?? 19) / 100));
                                        return (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-500">Subtotal</span>
                                                    <span className="text-sm font-bold text-slate-700">${(selectedProduct.price * qty).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-500">IVA a reversar</span>
                                                    <span className="text-sm font-bold text-slate-700">${(calculatedIva * qty).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                                    <span className="font-bold text-slate-800">Saldo a Favor Total</span>
                                                    <span className="text-lg font-black text-indigo-600">${((selectedProduct.price + calculatedIva) * qty).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <button 
                                    onClick={handleProcessReturn}
                                    disabled={!selectedContact || !selectedProduct || qty <= 0 || processing}
                                    className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {processing ? 'Procesando...' : 'Confirmar Devolución'}
                                    {!processing && <ArrowRight size={18} />}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Historial de Devoluciones y Notas Crédito */}
                <div className="border-t border-slate-200 pt-8 mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <RefreshCcw size={18} className="text-rose-500" />
                            Historial de Devoluciones y Notas Crédito
                        </h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Filtro inteligente..."
                                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                value={historySearch}
                                onChange={e => setHistorySearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-slate-500">ID / Fecha</th>
                                        <th className="p-4 text-xs font-bold text-slate-500">Cliente</th>
                                        <th className="p-4 text-xs font-bold text-slate-500">Producto (SKU)</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 text-center">Cant.</th>
                                        <th className="p-4 text-xs font-bold text-slate-500 text-right">Monto NC</th>
                                        <th className="p-4 text-xs font-bold text-slate-500">Concepto / Bodega</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                                                No se encontraron devoluciones que coincidan con la búsqueda.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHistory.map((cn, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-800 font-mono">{cn.id}</div>
                                                    <div className="text-xs text-slate-500">{cn.date.split('T')[0]}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-800">{cn.client}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-800 truncate max-w-[200px]">{cn.productName}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{cn.sku}</div>
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-600">{cn.qty}</td>
                                                <td className="p-4 text-right font-black text-rose-600">${cn.total.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <div className="text-xs text-slate-700">{cn.document}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase">{cn.posLocation}</div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
