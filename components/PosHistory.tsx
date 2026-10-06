import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { useAuthStore } from '../stores/authStore';
import { FileSpreadsheet, Receipt, Wallet, Search, Filter, Printer, ArrowRightLeft, DollarSign } from 'lucide-react';
import { formatCOP, formatDate } from '../utils/format';

export const PosHistory: React.FC = () => {
    const { transactions, systemUsers, addTransaction } = useEnterprise();
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseType, setExpenseType] = useState<'SALIDA' | 'GASTO'>('GASTO');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseNote, setExpenseNote] = useState('');

    const { activeUserId, activeRole } = useAuthStore();
    const currentUser = systemUsers.find(u => u.id === activeUserId);

    const today = new Date().toISOString().split('T')[0];

    // Get today's sales and expenses
    const todaysTransactions = transactions.filter(t => 
        t.date === today && 
        (t.type === 'VENTA' || t.type === 'GASTO_CAJA') &&
        (activeRole === 'admin' || activeRole === 'manager' || t.posLocation === currentUser?.name)
    );

    const filteredTransactions = todaysTransactions.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.client.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSales = todaysTransactions.filter(t => t.type === 'VENTA').reduce((acc, t) => acc + t.total, 0);
    const totalExpenses = todaysTransactions.filter(t => t.type === 'GASTO_CAJA').reduce((acc, t) => acc + t.total, 0);

    const handleRegisterExpense = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(expenseAmount);
        if (!amount || amount <= 0) return;

        addTransaction({
            id: `GC-${Math.floor(Math.random() * 10000)}`,
            date: today,
            type: 'GASTO_CAJA',
            client: 'Caja Menor',
            document: 'N/A',
            productName: expenseNote || 'Salida de caja menor',
            sku: 'EXPENSE',
            qty: 1,
            total: amount,
            iva: 0,
            paymentMethod: 'Efectivo',
            posLocation: currentUser?.name || 'Caja Principal',
            paymentStatus: 'PAGADA',
            balance: 0
        });

        setExpenseAmount('');
        setExpenseNote('');
        setIsExpenseModalOpen(false);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                        <FileSpreadsheet className="w-6 h-6 mr-3 text-slate-700"/>
                        Historial / Turno
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Consulta las facturas generadas hoy, reimprime recibos y registra salidas de caja menor.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { setExpenseType('SALIDA'); setIsExpenseModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg font-bold hover:bg-orange-100 transition-colors shadow-sm border border-orange-200"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Registrar Salida de Caja
                    </button>
                    <button 
                        onClick={() => { setExpenseType('GASTO'); setIsExpenseModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-colors shadow-sm border border-red-200"
                    >
                        <Wallet className="w-4 h-4" />
                        Registrar Gasto de Caja
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm">
                        <DollarSign className="w-4 h-4" />
                        Cierre Z de Turno
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-xl">
                        <Receipt className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-500">Ventas del Día</div>
                        <div className="text-2xl font-black text-slate-900">{formatCOP(totalSales)}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-xl">
                        <Wallet className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-500">Salidas / Gastos</div>
                        <div className="text-2xl font-black text-slate-900">{formatCOP(totalExpenses)}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-xl">
                        <DollarSign className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-500">Neto en Caja</div>
                        <div className="text-2xl font-black text-slate-900">{formatCOP(totalSales - totalExpenses)}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar por cliente o factura..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider font-bold">
                                <th className="p-4">Recibo / Ref</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No hay transacciones para el día de hoy.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono text-sm font-bold text-indigo-600">{tx.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{tx.client}</div>
                                            <div className="text-xs text-slate-500">{tx.paymentMethod}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                tx.type === 'VENTA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-slate-800">
                                            {tx.type === 'GASTO_CAJA' ? '-' : ''}{formatCOP(tx.total)}
                                        </td>
                                        <td className="p-4 text-center">
                                            {tx.type === 'VENTA' && (
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Reimprimir Recibo">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para Registrar Salida */}
            {isExpenseModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center">
                                <Wallet className={`w-5 h-5 mr-2 ${expenseType === 'GASTO' ? 'text-red-600' : 'text-orange-600'}`} />
                                Registrar {expenseType === 'GASTO' ? 'Gasto' : 'Salida'} de Caja
                            </h3>
                        </div>
                        <form onSubmit={handleRegisterExpense} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Motivo o Descripción</label>
                                <input 
                                    type="text" 
                                    required
                                    value={expenseNote}
                                    onChange={e => setExpenseNote(e.target.value)}
                                    placeholder="Ej: Pago de envíos, tintos, insumos..." 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Monto Retirado ($)</label>
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    value={expenseAmount}
                                    onChange={e => setExpenseAmount(e.target.value)}
                                    placeholder="0" 
                                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsExpenseModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className={`px-6 py-2 text-white rounded-lg text-sm font-bold shadow-sm ${expenseType === 'GASTO' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    Guardar {expenseType === 'GASTO' ? 'Gasto' : 'Salida'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
