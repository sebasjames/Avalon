// @ts-nocheck
import React from 'react';
import { Mail, CheckCircle2, PackageOpen, Download, AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';
import { formatCOP } from '../../utils/format';

export interface FacturasCorreoTabProps {
    inboxMails: any[];
    activeMailId: string | null;
    setActiveMailId: (id: string | null) => void;
    handleContabilizarFactura: (mail: any) => void;
}

export const FacturasCorreoTab: React.FC<FacturasCorreoTabProps> = ({
    inboxMails,
    activeMailId,
    setActiveMailId,
    handleContabilizarFactura
}) => {
    return (

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex flex-col overflow-hidden relative">
                                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                                    {/* Left pane: Mailbox list (Col span 5) */}
                                    <div className="lg:col-span-5 border border-slate-200 rounded-xl p-4 flex flex-col min-h-0 bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2 shrink-0">
                                            <Mail className="w-5 h-5 text-indigo-600" />
                                            Inbox de Facturación Electrónica (Recepcionados)
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                            {inboxMails.map(email => (
                                                <div
                                                    key={email.id}
                                                    onClick={() => setActiveMailId(email)}
                                                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                                                        activeMailId.id === email.id
                                                            ? 'border-indigo-600 bg-indigo-50/30'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] text-slate-400 font-mono">{email.date}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                            email.status === 'PROCESADA'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {email.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-xs mt-1 truncate">{email.sender}</h4>
                                                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">{email.subject}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right pane: Email Detail (Col span 7) */}
                                    <div className="lg:col-span-7 border border-slate-200 rounded-xl p-6 bg-white flex flex-col min-h-0">
                                        {(inboxMails.find(m => m.id === activeMailId) || null) ? (
                                            <div className="flex-1 flex flex-col min-h-0 space-y-4">
                                                {/* Header */}
                                                <div className="border-b border-slate-100 pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-sm">{(inboxMails.find(m => m.id === activeMailId) || null).subject}</h3>
                                                            <p className="text-xs text-slate-500 mt-1">De: <strong className="text-slate-700">{(inboxMails.find(m => m.id === activeMailId) || null).sender}</strong></p>
                                                        </div>
                                                        <span className="text-xs text-slate-400 font-mono">{(inboxMails.find(m => m.id === activeMailId) || null).date}</span>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="flex-1 overflow-y-auto text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    {(inboxMails.find(m => m.id === activeMailId) || null).body}
                                                </div>

                                                {/* Attachments */}
                                                <div className="border-t border-slate-100 pt-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Documento Adjunto (XML / Factura Electrónica DIAN)</span>
                                                    <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs font-mono">XML</div>
                                                            <div>
                                                                <div className="text-xs font-bold text-slate-800">{(inboxMails.find(m => m.id === activeMailId) || null).attachment}</div>
                                                                <div className="text-[10px] text-slate-400 font-medium">{(inboxMails.find(m => m.id === activeMailId) || null).attachmentSize}</div>
                                                            </div>
                                                        </div>
                                                        {(inboxMails.find(m => m.id === activeMailId) || null).status === 'PENDIENTE' ? (
                                                            <button
                                                                onClick={() => {
                                                                    const p = (inboxMails.find(m => m.id === activeMailId) || null).parsedData;
                                                                    setAiProvider(p.provider);
                                                                    setAiNit(p.nit);
                                                                    setAiInvoiceId(p.invoiceId);
                                                                    setAiDate(p.date);
                                                                    setAiSubtotal(p.subtotal.toString());
                                                                    setAiIva(p.iva.toString());
                                                                    setAiTotal(p.total.toString());
                                                                    setAiItems(p.items);
                                                                    setShowAiFormModal(true);
                                                                }}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                                                            >
                                                                <BrainCircuit className="w-4 h-4 animate-pulse" /> Procesar con IA
                                                            </button>
                                                        ) : (
                                                            <div className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                                                                ✓ Factura Contabilizada
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                                <Mail className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
                                                <p className="text-sm font-bold text-slate-600 mb-1">Visualizador de Facturas de Proveedores</p>
                                                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                                                    Selecciona un correo del listado de la izquierda para abrir el mensaje, descargar los soportes y contabilizar con la ayuda del Copiloto IA.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        
    );
};
