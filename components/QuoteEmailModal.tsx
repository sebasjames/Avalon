import { useEscapeKey } from '../hooks/useEscapeKey';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Send, Paperclip, FileText, Check, Loader2, Download, Edit3, RotateCcw } from 'lucide-react';
import { PosCartItem } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const { addTransaction } = useEnterprise();
    const [includeTechDocs, setIncludeTechDocs] = useState(false);
    const [removedTechDocIds, setRemovedTechDocIds] = useState<string[]>([]);

    const handleToggleTechDocs = (checked: boolean) => {
        setIncludeTechDocs(checked);
        if (checked && removedTechDocIds.length > 0 && removedTechDocIds.length === cart.length) {
            setRemovedTechDocIds([]);
        }
    };

    const handleRemoveDoc = (docId: string) => {
        setRemovedTechDocIds(prev => [...prev, docId]);
    };

    const handleRestoreAllDocs = () => {
        setRemovedTechDocIds([]);
    };

    const activeTechDocs = cart.filter((item, i) => {
        const docId = item.id || `${item.sku || 'sku'}-${i}`;
        return !removedTechDocIds.includes(docId);
    });

    // Editable email message state
    const [isEditingMessage, setIsEditingMessage] = useState(false);
    const [customIntro, setCustomIntro] = useState('De acuerdo a nuestra conversación, adjunto la cotización solicitada con los productos requeridos:');
    const [customClosing, setCustomClosing] = useState('Esta cotización tiene una validez de 15 días. Quedo atento a cualquier inquietud para proceder con la orden de compra.');
    const [customSignature, setCustomSignature] = useState('Equipo Comercial - Procoquinal S.A.S.');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    
    // Accounting toggles
    const [showDiscount, setShowDiscount] = useState(discountAmount > 0);
    const [showIva, setShowIva] = useState(true);
    const [showReteFuente, setShowReteFuente] = useState(retenciones.reteFuente > 0);
    const [showReteIca, setShowReteIca] = useState(retenciones.reteIca > 0);

  // Escape key hooks
  useEscapeKey(onClose, isOpen);


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

    const handleDownloadPdfAndSave = () => {
        setIsDownloading(true);
        setTimeout(() => {
            // 1. Guardar la cotización como Pendiente en la plataforma
            addTransaction({
                id: `COT-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'VENTA',
                client: clientName || 'Cliente General',
                document: 'Cotización Comercial (Pendiente)',
                productName: `Cotización de ${cart.length} producto(s) [Pendiente]`,
                sku: cart[0]?.sku || 'N/A',
                qty: cart.reduce((sum, item) => sum + item.quantity, 0),
                total: calculatedTotal,
                iva: totalIva,
                paymentMethod: 'Cotización / Crédito',
                posLocation: 'B2B Comercial',
                siigoExportStatus: 'PENDING_SIIGO_SYNC',
                siigoDocType: 'COTIZACION_PENDIENTE'
            });

            // 2. Generar documento PDF nativo con jsPDF
            const doc = new jsPDF();

            // Header Banner
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, 210, 35, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.text('PROCOQUINAL S.A.S.', 14, 20);

            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text('COTIZACIÓN COMERCIAL B2B', 14, 27);

            doc.setFillColor(254, 243, 199); // amber-100
            doc.rect(145, 12, 50, 12, 'F');
            doc.setFontSize(9);
            doc.setTextColor(180, 83, 9); // amber-700
            doc.text('ESTADO: PENDIENTE', 149, 19);

            // Client & Info metadata
            doc.setTextColor(30, 41, 59); // slate-800
            doc.setFontSize(11);
            doc.text(`Cliente: ${clientName || 'Cliente General'}`, 14, 46);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 53);
            doc.text(`Validez Comercial: 15 Días Calendario`, 14, 60);

            // Table
            const tableData = cart.map(item => [
                item.sku || item.product?.sku || 'N/A',
                item.name,
                `${item.quantity}`,
                item.baseUnit || item.unit || item.product?.baseUnit || 'UND',
                `$${(item.quantity * item.price).toLocaleString('es-CO')}`
            ]);

            autoTable(doc, {
                startY: 68,
                head: [['Referencia (SKU)', 'Producto', 'Cantidad', 'Unidad de Medida', 'Total']],
                body: tableData,
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 }
            });

            const finalY = (doc as any).lastAutoTable.finalY + 12;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Subtotal: $${subtotal.toLocaleString('es-CO')}`, 130, finalY);
            if (showIva) {
                doc.text(`IVA (Impuesto): $${totalIva.toLocaleString('es-CO')}`, 130, finalY + 6);
            }
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(`TOTAL COTIZACIÓN: $${calculatedTotal.toLocaleString('es-CO')} COP`, 105, finalY + 16);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139);
            doc.text('Procoquinal S.A.S. - Departamento Comercial - Documento generado automáticamente', 14, finalY + 30);

            // Save PDF
            doc.save(`Cotizacion_Procoquinal_${(clientName || 'Cliente').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

            setIsDownloading(false);
            setDownloaded(true);
            setTimeout(() => {
                setDownloaded(false);
                onClose();
            }, 1500);
        }, 800);
    };

    const formatCOP = (num: number) => `$${num.toLocaleString('es-CO')}`;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto"
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
                    <div className="p-6 bg-slate-50 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                        
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

                        {/* Header bar with 'Editar Mensaje Escrito' button */}
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" /> Mensaje Escrito del Correo
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsEditingMessage(!isEditingMessage)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                                    isEditingMessage
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                        : 'bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300'
                                }`}
                                title={isEditingMessage ? 'Guardar y volver a la vista previa' : 'Personalizar saludo, validez y despedida'}
                            >
                                {isEditingMessage ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" /> Guardar y Previsualizar
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="w-3.5 h-3.5" /> Editar Mensaje Escrito
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Editor Mode vs Preview Mode */}
                        {isEditingMessage ? (
                            <div className="bg-white p-5 rounded-xl border-2 border-indigo-200 shadow-sm space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">1. Párrafo de Apertura / Saludo</label>
                                        <span className="text-[11px] text-slate-400 font-medium">Estimado(a) {clientName || 'Cliente'},</span>
                                    </div>
                                    <textarea
                                        value={customIntro}
                                        onChange={e => setCustomIntro(e.target.value)}
                                        rows={3}
                                        className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y"
                                        placeholder="Escribe el mensaje introductorio al cliente..."
                                    />
                                </div>

                                <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                                    <span className="font-semibold flex items-center gap-1.5">
                                        📊 En el medio se adjunta la tabla interactiva de {cart.length} ítem(s) y desglose de impuestos
                                    </span>
                                    <span className="font-black text-indigo-950 text-sm">{formatCOP(calculatedTotal)}</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">2. Condiciones Comerciales / Validez</label>
                                    <textarea
                                        value={customClosing}
                                        onChange={e => setCustomClosing(e.target.value)}
                                        rows={3}
                                        className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed resize-y"
                                        placeholder="Condiciones de validez, despacho, tiempos de entrega, forma de pago..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">3. Firma / Despedida Comercial</label>
                                    <input
                                        type="text"
                                        value={customSignature}
                                        onChange={e => setCustomSignature(e.target.value)}
                                        className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                                        placeholder="Ej: Asesor Comercial - Procoquinal S.A.S."
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomIntro('De acuerdo a nuestra conversación, adjunto la cotización solicitada con los productos requeridos:');
                                            setCustomClosing('Esta cotización tiene una validez de 15 días. Quedo atento a cualquier inquietud para proceder con la orden de compra.');
                                            setCustomSignature('Equipo Comercial - Procoquinal S.A.S.');
                                        }}
                                        className="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 transition-colors"
                                    >
                                        <RotateCcw className="w-3 h-3" /> Restablecer texto predeterminado
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditingMessage(false)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                                    >
                                        <Check className="w-3.5 h-3.5" /> Aplicar y Previsualizar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 max-h-[320px] overflow-y-auto custom-scrollbar text-sm text-slate-700 font-sans leading-relaxed shadow-inner">
                                <p className="mb-3">Estimado(a) <strong>{clientName || 'Cliente'}</strong>,</p>
                                <p className="mb-4 whitespace-pre-line">{customIntro}</p>
                            
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                            <th className="pb-2 font-bold">Referencia (SKU)</th>
                                            <th className="pb-2 font-bold">Producto</th>
                                            <th className="pb-2 font-bold text-center">Cantidad</th>
                                            <th className="pb-2 font-bold text-center">Unidad de Medida</th>
                                            <th className="pb-2 font-bold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {cart.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-100/50 transition-colors">
                                                <td className="py-2.5 font-mono text-xs font-bold text-slate-700">
                                                    {item.sku || item.product?.sku || 'N/A'}
                                                </td>
                                                <td className="py-2.5 text-slate-800 font-medium text-xs">
                                                    {item.name}
                                                </td>
                                                <td className="py-2.5 text-center font-bold text-slate-800 text-xs">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-2.5 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-600 border border-slate-200 shadow-2xs">
                                                        {item.baseUnit || item.unit || item.product?.baseUnit || 'UND'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-right font-black text-slate-900 text-xs">
                                                    {formatCOP(item.quantity * item.price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-slate-200">
                                            <td colSpan={4} className="pt-2 text-right font-medium text-slate-500">Subtotal:</td>
                                            <td className="pt-2 text-right font-bold text-slate-700">{formatCOP(subtotal)}</td>
                                        </tr>
                                        {discountAmount > 0 && showDiscount && (
                                            <tr>
                                                <td colSpan={4} className="py-1 text-right font-medium text-emerald-600 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowDiscount(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    Descuento Comercial ({discountPercent}%):
                                                </td>
                                                <td className="py-1 text-right font-bold text-emerald-600">-{formatCOP(discountAmount)}</td>
                                            </tr>
                                        )}
                                        {totalIva > 0 && showIva && (
                                            <tr>
                                                <td colSpan={4} className="py-1 text-right font-medium text-slate-500 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowIva(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    IVA (Impuesto):
                                                </td>
                                                <td className="py-1 text-right font-bold text-slate-700">{formatCOP(totalIva)}</td>
                                            </tr>
                                        )}
                                        {retenciones.reteFuente > 0 && showReteFuente && (
                                            <tr>
                                                <td colSpan={4} className="py-1 text-right font-medium text-rose-500 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowReteFuente(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    Retención en la Fuente:
                                                </td>
                                                <td className="py-1 text-right font-bold text-rose-500">-{formatCOP(retenciones.reteFuente)}</td>
                                            </tr>
                                        )}
                                        {retenciones.reteIca > 0 && showReteIca && (
                                            <tr>
                                                <td colSpan={4} className="py-1 text-right font-medium text-rose-500 flex items-center justify-end gap-2">
                                                    <button onClick={() => setShowReteIca(false)} className="text-slate-400 hover:text-rose-500" title="Remover"><X size={14}/></button>
                                                    ReteICA:
                                                </td>
                                                <td className="py-1 text-right font-bold text-rose-500">-{formatCOP(retenciones.reteIca)}</td>
                                            </tr>
                                        )}
                                        {(!showDiscount && discountAmount > 0) || (!showIva && totalIva > 0) || (!showReteFuente && retenciones.reteFuente > 0) || (!showReteIca && retenciones.reteIca > 0) ? (
                                            <tr>
                                                <td colSpan={5} className="py-2 text-right">
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
                                            <td colSpan={4} className="pt-3 text-right font-bold text-slate-800">Total Cotización:</td>
                                            <td className="pt-3 text-right font-black text-slate-900 text-xl">{formatCOP(calculatedTotal)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <p className="mb-4 whitespace-pre-line">{customClosing}</p>
                            
                            <div className="text-slate-500 text-xs">
                                <p className="font-bold text-slate-700 whitespace-pre-line">{customSignature}</p>
                            </div>
                        </div>
                    )}

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
                                    <input type="checkbox" className="sr-only" checked={includeTechDocs} onChange={e => handleToggleTechDocs(e.target.checked)} />
                                    <span className="text-sm font-bold text-slate-800 block">Agregar Fichas Técnicas (PDF)</span>
                                    <span className="text-xs text-slate-500">Adjunta automáticamente las fichas técnicas y hojas de seguridad de los productos cotizados.</span>
                                </div>
                            </label>
                            
                            {includeTechDocs && (
                                <div className="space-y-2 pl-1">
                                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                                        <span>Fichas técnicas vinculadas ({activeTechDocs.length}):</span>
                                        {removedTechDocIds.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleRestoreAllDocs}
                                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                            >
                                                Restaurar todas ({removedTechDocIds.length})
                                            </button>
                                        )}
                                    </div>

                                    {activeTechDocs.length === 0 ? (
                                        <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-400">
                                            Se han quitado todas las fichas técnicas de este envío.{' '}
                                            <button 
                                                type="button" 
                                                onClick={handleRestoreAllDocs} 
                                                className="text-blue-600 font-bold hover:underline ml-1"
                                            >
                                                Volver a agregarlas
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2.5 pt-0.5">
                                            {activeTechDocs.map((item, i) => {
                                                const docId = item.id || `${item.sku || 'sku'}-${i}`;
                                                const fileName = `FT_${item.name.substring(0, 16).replace(/\s+/g, '')}.pdf`;
                                                return (
                                                    <div 
                                                        key={docId} 
                                                        className="relative group inline-flex items-center"
                                                    >
                                                        <span className="bg-blue-50/90 group-hover:bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-blue-200/90 flex items-center gap-1.5 transition-all shadow-xs group-hover:shadow-sm select-none">
                                                            <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                            <span className="truncate max-w-[150px] sm:max-w-[200px]" title={fileName}>
                                                                {fileName}
                                                            </span>
                                                        </span>

                                                        {/* Botón X en la punta que aparece al hacer hover */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveDoc(docId);
                                                            }}
                                                            title={`Quitar ficha técnica de ${item.name}`}
                                                            aria-label={`Quitar ficha técnica de ${item.name}`}
                                                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 hover:bg-rose-600 active:scale-90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-md z-10 cursor-pointer"
                                                        >
                                                            <X className="w-2.5 h-2.5 stroke-[3]" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0 flex-wrap">
                        <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        
                        <button
                            onClick={handleDownloadPdfAndSave}
                            disabled={isDownloading || downloaded}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 border ${
                                downloaded 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                        >
                            {isDownloading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Loader2 className="w-4 h-4 text-slate-600" /></motion.div> :
                             downloaded ? <><Check className="w-4 h-4 text-emerald-600" /> Guardado & Descargado</> :
                             <><Download className="w-4 h-4 text-slate-600" /> Descargar PDF & Guardar</>}
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
