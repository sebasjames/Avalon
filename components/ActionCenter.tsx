import React, { useState, useEffect } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { ActionOpportunity, ActionType, ActionCategory } from '../types';
import { 
    DollarSign, Percent, Truck, PackagePlus, Trash2, CheckCircle2, AlertTriangle, Play, Bell, ShoppingCart, TrendingUp, ShieldCheck, Phone, FileText, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ActionIcon = ({ type }: { type: ActionType }) => {
    switch(type) {
        case 'LIQUIDATION': return <Percent className="w-5 h-5 text-rose-600" />;
        case 'TRANSFER': return <Truck className="w-5 h-5 text-blue-600" />;
        case 'BUNDLE': return <PackagePlus className="w-5 h-5 text-purple-600" />;
        case 'SCRAP': return <Trash2 className="w-5 h-5 text-slate-500" />;
        case 'RESTOCK': return <ShoppingCart className="w-5 h-5 text-emerald-600" />;
        case 'INVOICE': return <FileText className="w-5 h-5 text-indigo-600" />;
        case 'FOLLOWUP': return <Phone className="w-5 h-5 text-amber-600" />;
        case 'PAYMENT': return <DollarSign className="w-5 h-5 text-teal-600" />;
        case 'QUALITY': return <ShieldCheck className="w-5 h-5 text-rose-600" />;
        case 'LOGISTICS': return <Truck className="w-5 h-5 text-blue-600" />;
        default: return <AlertTriangle className="w-5 h-5 text-slate-500" />;
    }
};

const getCategoryColor = (category?: ActionCategory) => {
    switch(category) {
        case 'INVENTARIO': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'COMERCIAL': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'CONTABILIDAD': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'PRODUCCIÓN': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'SISTEMA': return 'bg-slate-100 text-slate-700 border-slate-200';
        case 'CRM': return 'bg-rose-100 text-rose-700 border-rose-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

export const ActionCenter: React.FC = () => {
    const { inventory } = useEnterprise();
    const [opportunities, setOpportunities] = useState<ActionOpportunity[]>([]);
    const [executedCount, setExecutedCount] = useState(0);
    const [cashUnlocked, setCashUnlocked] = useState(0);

    useEffect(() => {
        if (!inventory || inventory.length === 0) return;

        const categories: ActionCategory[] = ['INVENTARIO', 'COMERCIAL', 'CONTABILIDAD', 'PRODUCCIÓN', 'SISTEMA', 'CRM'];
        const types: ActionType[] = ['LIQUIDATION', 'TRANSFER', 'BUNDLE', 'SCRAP', 'RESTOCK', 'INVOICE', 'FOLLOWUP', 'PAYMENT', 'QUALITY', 'LOGISTICS'];
        
        const newActions: ActionOpportunity[] = Array.from({ length: 20 }).map((_, idx) => {
            const category = categories[idx % categories.length];
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Random item context
            const item = inventory[Math.floor(Math.random() * inventory.length)];
            const quantityToMove = Math.floor(Math.random() * 100) + 1;
            const value = quantityToMove * (item.unitCost || 1000);
            
            let reason = `🤖 AI Alert [${category}]: `;
            let suggestedAction = '';
            
            if (category === 'INVENTARIO') {
                reason += `Rotación lenta detectada en ${item.name}.`;
                suggestedAction = `Aplicar descuento o mover a paquete promocional.`;
            } else if (category === 'COMERCIAL') {
                reason += `Caída de ventas en 15% para clientes mayoristas.`;
                suggestedAction = `Llamar a Top 5 clientes VIP y ofrecer crédito.`;
            } else if (category === 'CONTABILIDAD') {
                reason += `Existen 3 facturas por cobrar con >30 días de mora.`;
                suggestedAction = `Bloquear nuevos despachos y enviar alerta de cartera.`;
            } else if (category === 'PRODUCCIÓN') {
                reason += `Lote de materia prima (Resina) próximo a caducar en 10 días.`;
                suggestedAction = `Programar orden de producción urgente de ${item.name}.`;
            } else if (category === 'CRM') {
                reason += `Prospecto importante no ha sido contactado en 7 días.`;
                suggestedAction = `Agendar reunión de seguimiento.`;
            } else {
                reason += `Actualización de seguridad requerida en el módulo POS.`;
                suggestedAction = `Ejecutar sincronización forzada.`;
            }

            return {
                id: `ACT-${String(idx + 1).padStart(3, '0')}`,
                type,
                category,
                skuId: item.sku,
                productName: category === 'INVENTARIO' || category === 'PRODUCCIÓN' ? item.name : 'Múltiples Referencias / General',
                reason,
                suggestedAction,
                quantityToMove,
                potentialCashRelease: value,
                marginImpactPercent: Math.floor(Math.random() * 20) * -1,
                costOfAction: Math.floor(value * 0.05),
                status: 'PENDING'
            };
        });

        setOpportunities(newActions.sort(() => 0.5 - Math.random()));
    }, [inventory]);

    const handleExecute = (id: string) => {
        const action = opportunities.find(o => o.id === id);
        if (action && action.status === 'PENDING') {
            const updated = opportunities.map(o => 
                o.id === id ? { ...o, status: 'EXECUTED' as const } : o
            );
            setOpportunities(updated);
            setExecutedCount(prev => prev + 1);
            setCashUnlocked(prev => prev + action.potentialCashRelease);
        }
    };

    const pendingActions = opportunities.filter(o => o.status === 'PENDING');

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                            className="relative"
                        >
                            <Bell className="w-8 h-8 text-rose-600 fill-rose-600" />
                            {pendingActions.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-rose-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-rose-600 shadow-sm">
                                    {pendingActions.length}
                                </span>
                            )}
                        </motion.div>
                        Centro de Alarmas & Acción
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Notificaciones críticas que requieren tu atención inmediata.</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg text-center">
                        <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Caja Liberada</div>
                        <div className="text-xl font-bold text-emerald-700 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" /> {cashUnlocked.toLocaleString('es-CO')}
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-center">
                        <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Atendidas</div>
                        <div className="text-xl font-bold text-blue-700">{executedCount} / 20</div>
                    </div>
                </div>
            </header>

            {/* MAIN ACTION BOARD */}
            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {pendingActions.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-12 rounded-xl border border-slate-200 text-center col-span-full shadow-sm"
                        >
                            <CheckCircle2 className="w-20 h-20 text-emerald-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-black text-slate-800">¡Bandeja Limpia!</h3>
                            <p className="text-slate-500 font-medium mt-2">Has atendido todas las alarmas críticas del sistema.</p>
                        </motion.div>
                    ) : (
                        pendingActions.map(action => (
                            <motion.div 
                                key={action.id} 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative group hover:border-slate-300 transition-colors"
                            >
                                {/* Categoria Etiqueta Esquina */}
                                <div className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryColor(action.category)}`}>
                                    {action.category}
                                </div>
                                
                                {/* LEFT: Context & Reason */}
                                <div className="p-5 md:w-5/12 border-b md:border-b-0 md:border-r border-slate-100">
                                    <div className="flex items-start gap-3 mb-3">
                                        <motion.div 
                                            animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                                            transition={{ repeat: Infinity, duration: 2, repeatDelay: 2 }}
                                            className="p-2 bg-rose-50 rounded-lg shrink-0 border border-rose-100"
                                        >
                                            <Bell className="w-6 h-6 text-rose-500 fill-rose-500" />
                                        </motion.div>
                                        <div className="pr-16">
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{action.productName}</h3>
                                            <span className="text-xs text-slate-400 font-mono">ID: {action.id}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100/50 text-sm text-rose-800 font-medium flex items-start leading-relaxed">
                                        <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-rose-600" />
                                        {action.reason}
                                    </div>
                                </div>

                                {/* MIDDLE: Suggested Action */}
                                <div className="p-5 flex-1 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 flex flex-col justify-center">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recomendación IA</h4>
                                    <div className="text-sm font-semibold text-slate-800">
                                        {action.suggestedAction}
                                    </div>
                                    <div className="mt-4 flex gap-4">
                                        <div className="bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Impacto</span>
                                            <span className={`font-bold text-sm ${action.marginImpactPercent < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {action.marginImpactPercent}%
                                            </span>
                                        </div>
                                        <div className="bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">
                                            <span className="block text-[10px] text-slate-400 uppercase font-bold">Costo Op.</span>
                                            <span className="font-bold text-sm text-slate-700">
                                                ${action.costOfAction.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: Controls */}
                                <div className="p-5 md:w-48 bg-slate-50 flex flex-col justify-center items-center gap-3 shrink-0">
                                    <button 
                                        onClick={() => handleExecute(action.id)}
                                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
                                    >
                                        <Check className="w-4 h-4" />
                                        Atender
                                    </button>
                                    <button 
                                        onClick={() => handleExecute(action.id)}
                                        className="w-full py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Ignorar
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};