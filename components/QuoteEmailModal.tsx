import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, Paperclip, FileText, Check, Loader2 } from 'lucide-react';
import { PosCartItem } from '../types';

interface QuoteEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: PosCartItem[];
    clientName: string;
    subtotal: number;
    discountAmount: number;
    discountPercent: number;
    taxesBreakdown: Record<string, number>;
    retenciones: { reteFuente: number; reteIca: number };
}

export const QuoteEmailModal: React.FC<QuoteEmailModalProps> = ({ 
    isOpen, onClose, cart, clientName, 
    subtotal, discountAmount, discountPercent, taxesBreakdown, retenciones 
}) => {
    const [includeTechDocs, setIncludeTechDocs] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    
    // Accounting toggles
    const [showDiscount, setShowDiscount] = useState(discountAmount > 0);
    const [showIva, setShowIva] = useState(true);
    const [showReteFuente, setShowReteFuente] = useState(retenciones.reteFuente > 0);
    const [showReteIca, setShowReteIca] = useState(retenciones.reteIca > 0);

    if (!isOpen) return null;

    const totalIva = Object.values(taxesBreakdown).reduce((a, b) => a + b, 0);

    const calculatedTotal = subtotal 
        - (showDiscount ? discountAmount : 0) 
        + (showIva ? totalIva : 0) 
        - (showReteFuente ? retenciones.reteFuente : 0)
        - (showReteIca ? retenciones.reteIca : 0);

    const handleSend = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSent(true);
            setTimeout(() => {
                setSent(false);
                onClose();
            }, 1500);
        }, 1000);
    };

    const formatCOP = (num: number) => `$${num.toLocaleString('es-CO')}`;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                <Mail className="text-blue-400 w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-white">Enviar Cotización</h2>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Email Form */}
                    <div className="p-6 bg-slate-50 flex-1 overflow-auto space-y-4">
                        
                        {/* To / Subject */}
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-2">
                                <span className="text-sm font-semibold text-slate-500 w-16">Para:</span>
                                <input type="text" className="flex-1 outline-none text-sm text-slate-800 font-medium" defaultValue={`${clientName || 'Cliente'} <contacto@cliente.com>`} />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-slate-500 w-16">Asunto:</span>
                                <input type="text" className="flex-1 outline-none text-sm text-slate-800 font-medium" defaultValue={`Cotización Comercial Procoquinal - ${clientName || 'Cliente'}`} />
                            </div>
                        </div>

                        {/* Email Body Preview */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 min-h-[300px] text-sm text-slate-700 font-sans leading-relaxed shadow-inner">
                            <p className="mb-4">Estimado(a) <strong>{clientName || 'Cliente'}</strong>,</p>
                            <p className="mb-4">De acuerdo a nuestra conversación, adjunto la cotización solicitada con los productos requeridos:</p>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500">
                                            <th className="pb-2 font-semibold">Producto</th>
                                            <th className="pb-2 font-semibold text-right">Cant.</th>
                                            <th className="pb-2 font-semibold text-right">Unitario</th>
                                            <th className="pb-2 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {cart.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-2 text-slate-800 font-medium">{item.name}</td>
                                                <td className="py-2 text-right">{item.quantity}</td>
                                                <td className="py-2 text-right">{formatCOP(item.price)}</td>
                                                <td className="py-2 text-right font-bold">{formatCOP(item.quantity * item.price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-slate-200">
                                            <td colSpan={3} className="pt-2 text-right font-medium text-slate-500">Subtotal:</td>
                                            <td className="pt-2 text-right font-bold text-slate-700">{formatCOP(subtotal)}</td>
                                        </tr>
                                        {discountAmount > 0 && showDiscount && (
                                            <tr>
                                                <td colSpan={3} className="py-1 text-right font-medium text-emerald-600 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowDiscount(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    Descuento Comercial ({discountPercent}%):
                                                </td>
                                                <td className="py-1 text-right font-bold text-emerald-600">-{formatCOP(discountAmount)}</td>
                                            </tr>
                                        )}
                                        {totalIva > 0 && showIva && (
                                            <tr>
                                                <td colSpan={3} className="py-1 text-right font-medium text-slate-500 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowIva(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    IVA (Impuesto):
                                                </td>
                                                <td className="py-1 text-right font-bold text-slate-700">{formatCOP(totalIva)}</td>
                                            </tr>
                                        )}
                                        {retenciones.reteFuente > 0 && showReteFuente && (
                                            <tr>
                                                <td colSpan={3} className="py-1 text-right font-medium text-rose-500 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowReteFuente(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    Retención en la Fuente:
                                                </td>
                                                <td className="py-1 text-right font-bold text-rose-500">-{formatCOP(retenciones.reteFuente)}</td>
                                            </tr>
                                        )}
                                        {retenciones.reteIca > 0 && showReteIca && (
                                            <tr>
                                                <td colSpan={3} className="py-1 text-right font-medium text-rose-500 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowReteIca(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    ReteICA:
                                                </td>
                                                <td className="py-1 text-right font-bold text-rose-500">-{formatCOP(retenciones.reteIca)}</td>
                                            </tr>
                                        )}
                                        {(!showDiscount && discountAmount > 0) || (!showIva && totalIva > 0) || (!showReteFuente && retenciones.reteFuente > 0) || (!showReteIca && retenciones.reteIca > 0) ? (
                                            <tr>
                                                <td colSpan={4} className="py-2 text-right">
                                                    <div className="flex justify-end gap-2 text-[10px] uppercase font-bold text-blue-500">
                                                        {!showDiscount && discountAmount > 0 && <button onClick={() => setShowDiscount(true)} className="hover:underline">+ Dcto</button>}
                                                        {!showIva && totalIva > 0 && <button onClick={() => setShowIva(true)} className="hover:underline">+ IVA</button>}
                                                        {!showReteFuente && retenciones.reteFuente > 0 && <button onClick={() => setShowReteFuente(true)} className="hover:underline">+ RteFte</button>}
                                                        {!showReteIca && retenciones.reteIca > 0 && <button onClick={() => setShowReteIca(true)} className="hover:underline">+ RteICA</button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : null}
                                        <tr className="border-t border-slate-300 mt-2">
                                            <td colSpan={3} className="pt-3 text-right font-bold text-slate-800">Total Cotización:</td>
                                            <td className="pt-3 text-right font-black text-slate-900 text-xl">{formatCOP(calculatedTotal)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <p className="mb-4">Esta cotización tiene una validez de 15 días. Quedo atento a cualquier inquietud para proceder con la orden de compra.</p>
                            
                            <div className="text-slate-500 text-xs">
                                <p className="font-bold text-slate-700">Equipo Comercial</p>
                                <p>Procoquinal S.A.S.</p>
                            </div>
                        </div>

                        {/* Attachments & Options */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <Paperclip className="w-4 h-4 text-slate-400" /> Adjuntos Automáticos:
                                <span className="bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200 flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-red-500" /> Cotizacion_{clientName?.replace(/\s+/g, '') || 'Cliente'}.pdf
                                </span>
                            </div>
                            
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${includeTechDocs ? 'bg-blue-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${includeTechDocs ? 'translate-x-5' : 'translate-x-0'}`} />
                                </div>
                                <div>
                                    <input type="checkbox" className="sr-only" checked={includeTechDocs} onChange={e => setIncludeTechDocs(e.target.checked)} />
                                    <span className="text-sm font-bold text-slate-800 block">Agregar Fichas Técnicas (PDF)</span>
                                    <span className="text-xs text-slate-500">Adjunta automáticamente las fichas técnicas y hojas de seguridad de los productos cotizados.</span>
                                </div>
                            </label>
                            
                            {includeTechDocs && (
                                <div className="flex flex-wrap gap-2 pl-2">
                                    {cart.map((item, i) => (
                                        <span key={i} className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-700 border border-blue-200 flex items-center gap-1">
                                            <FileText className="w-3 h-3 text-red-500" /> FT_{item.name.substring(0, 15).replace(/\s+/g, '')}.pdf
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
                        <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={isSending || sent}
                            className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-all flex items-center gap-2 shadow-sm ${sent ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isSending ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 className="w-4 h-4" /></motion.div> : 
                             sent ? <><Check className="w-4 h-4" /> Enviado</> : 
                             <><Send className="w-4 h-4" /> Enviar Correo</>}
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};
