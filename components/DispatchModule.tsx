import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnterprise } from '../context/EnterpriseContext';
import { useUIStore } from '../stores/uiStore';
import { Truck, Package, PackageCheck, AlertTriangle, CheckCircle2, Search, FileText, Download, Printer, Eye, X, Maximize2, Minimize2, User, MessageSquare } from 'lucide-react';
import { DispatchLog, CrmContact } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCOP } from '../utils/format';

export const DispatchModule: React.FC = () => {
    const { dispatches, updateDispatch, contacts, inventory } = useEnterprise();
    const { addToast } = useUIStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; blobUrl: string; title: string; dispatchLog?: DispatchLog } | null>(null);
    const [isModalFullscreen, setIsModalFullscreen] = useState(false);
    const [notesDropdownOpen, setNotesDropdownOpen] = useState<string | null>(null);
    const [pickPackOrder, setPickPackOrder] = useState<DispatchLog | null>(null);
    const [scannedQtys, setScannedQtys] = useState<Record<string, number>>({});
    const [scanInput, setScanInput] = useState('');
    const [invoiceOrder, setInvoiceOrder] = useState<DispatchLog | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const openPickPackModal = (d: DispatchLog) => {
        setPickPackOrder(d);
        setScannedQtys({});
        setScanInput('');
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsModalFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const toggleNativeFullscreen = () => {
        if (!document.fullscreenElement) {
            const el = modalRef.current || document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {});
            } else if ((el as any).webkitRequestFullscreen) {
                (el as any).webkitRequestFullscreen();
            }
            setIsModalFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            }
            setIsModalFullscreen(false);
        }
    };

    const filtered = (dispatches || []).filter(d => {
        const idMatch = (d.id || '').toLowerCase().includes(searchQuery.toLowerCase());
        const contactName = contacts.find(c => c.id === d.contactId)?.name || '';
        const contactMatch = contactName.toLowerCase().includes(searchQuery.toLowerCase());
        return idMatch || contactMatch;
    });

    const pending = filtered.filter(d => d.status === 'PENDIENTE' || d.status === 'ARMANDO_PEDIDO');
    const inTransit = filtered.filter(d => d.status === 'EN_TRANSITO');
    const completed = filtered.filter(d => d.status === 'ENTREGADO' || d.status === 'ENTREGA_FALLIDA');

    const handleStatusChange = (id: string, newStatus: DispatchLog['status']) => {
        const update: Partial<DispatchLog> = { status: newStatus };
        if (newStatus === 'ENTREGADO') {
            update.actualDeliveryDate = new Date().toISOString().split('T')[0];
        }
        updateDispatch(id, update);
    };

    const buildDispatchPdfDoc = (d: DispatchLog, contactsList: CrmContact[]) => {
        const contact = contactsList.find(c => c.id === d.contactId);
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

        // Header banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 32, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('PROCOQUINAL S.A.S.', 14, 15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);
        doc.text('GUÍA OFICIAL DE DESPACHO Y REMISIÓN', 14, 22);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`GUÍA Nº ${d.id}`, 196, 15, { align: 'right' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha Prometida: ${d.promisedDate}`, 196, 22, { align: 'right' });

        // Client & Driver Info section
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DE DESTINO Y ENTREGA', 14, 42);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Cliente / Razón Social: ${contact?.name || 'Cliente Particular'}`, 14, 48);
        doc.text(`NIT / Cédula: ${(contact as any)?.taxId || (contact as any)?.nit || 'N/A'}`, 14, 53);
        doc.text(`Dirección Entrega: ${(contact as any)?.address || contact?.company || 'Dirección de Registro'}`, 14, 58);
        doc.text(`Teléfono Contacto: ${contact?.phone || 'N/A'}`, 14, 63);

        doc.text(`Estado Despacho: ${d.status}`, 120, 48);
        doc.text(`Conductor Asignado: ${d.driver || 'Por Asignar'}`, 120, 53);
        doc.text(`Vehículo / Placa: ${d.vehicle || 'Por Asignar'}`, 120, 58);
        doc.text(`Fecha Entrega Real: ${d.actualDeliveryDate || 'En Proceso'}`, 120, 63);

        // Items table
        const tableBody = d.items.map((item, idx) => [
            (idx + 1).toString(),
            item.sku || 'N/A',
            item.productName,
            item.orderedQty.toString(),
            item.deliveredQty.toString(),
            item.deliveredQty === item.orderedQty ? 'COMPLETO' : 'PARCIAL'
        ]);

        autoTable(doc, {
            startY: 70,
            head: [['#', 'SKU', 'DESCRIPCIÓN DEL PRODUCTO', 'CANT. PEDIDA', 'CANT. ENTREGADA', 'ESTADO']],
            body: tableBody,
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 8.5, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 30 },
                2: { cellWidth: 80 },
                3: { cellWidth: 25, halign: 'center' },
                4: { cellWidth: 25, halign: 'center' },
                5: { cellWidth: 20, halign: 'center' }
            }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 120;

        // Signature boxes
        const signatureY = Math.max(finalY + 30, 210);
        doc.setDrawColor(148, 163, 184);
        doc.line(14, signatureY, 84, signatureY);
        doc.line(126, signatureY, 196, signatureY);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text('FIRMA / NOMBRE TRANSPORTADOR', 14, signatureY + 5);
        doc.text('FIRMA / SELLO RECIBIDO CONFORME', 126, signatureY + 5);
        doc.setFont('helvetica', 'normal');
        doc.text('C.C. / Placa:', 14, signatureY + 10);
        doc.text('C.C. / Fecha y Hora:', 126, signatureY + 10);

        return doc;
    };

    const handleDownloadDispatchPdf = (d: DispatchLog) => {
        const doc = buildDispatchPdfDoc(d, contacts);
        doc.save(`Guia_Despacho_${d.id}.pdf`);
        addToast({ title: 'PDF Generado', message: `Guía de Despacho ${d.id} descargada exitosamente.`, severity: 'SUCCESS' });
    };

    const handlePreviewDispatchPdf = (d: DispatchLog) => {
        const doc = buildDispatchPdfDoc(d, contacts);
        const blobUrl = doc.output('bloburl').toString();
        setPreviewModal({
            isOpen: true,
            title: `Previsualización: Guía de Despacho #${d.id}`,
            blobUrl,
            dispatchLog: d
        });
    };

    const handleDownloadManifestPdf = () => {
        const activeDispatches = (dispatches || []).filter(d => d.status === 'EN_TRANSITO' || d.status === 'ARMANDO_PEDIDO' || d.status === 'PENDIENTE');
        if (activeDispatches.length === 0) {
            addToast({ title: 'Sin Rutas Activas', message: 'No hay despachos activos para generar el manifiesto de carga.', severity: 'WARNING' });
            return;
        }

        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });

        // Header banner
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 297, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.text('PROCOQUINAL S.A.S. - MANIFIESTO DE CARGA Y DESPACHO DE RUTA', 14, 14);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);
        doc.text(`FECHA EXPEDICIÓN: ${new Date().toLocaleDateString('es-CO')} | TOTAL DESPACHOS EN MANIFIESTO: ${activeDispatches.length}`, 14, 21);

        const tableBody = activeDispatches.map((d, idx) => {
            const contact = contacts.find(c => c.id === d.contactId);
            const totalItems = d.items.reduce((acc, item) => acc + item.orderedQty, 0);
            return [
                (idx + 1).toString(),
                d.id,
                contact?.name || 'Cliente Particular',
                (contact as any)?.address || contact?.company || 'Dirección de Registro',
                d.promisedDate,
                d.driver || 'Por Asignar',
                d.vehicle || 'Por Asignar',
                `${totalItems} Unid (${d.items.length} SKUs)`,
                d.status
            ];
        });

        autoTable(doc, {
            startY: 34,
            head: [['#', 'GUÍA Nº', 'CLIENTE / DESTINO', 'DIRECCIÓN DE ENTREGA', 'FECHA PROM.', 'CONDUCTOR', 'VEHÍCULO', 'CANT. BULTOS', 'ESTADO RUTA']],
            body: tableBody,
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 8.5, cellPadding: 3 },
        });

        doc.save(`Manifiesto_Carga_Ruta_${new Date().toISOString().split('T')[0]}.pdf`);
        addToast({ title: 'Manifiesto Descargado', message: 'Manifiesto de Carga en Ruta consolidado generado en PDF.', severity: 'SUCCESS' });
    };

    const renderCard = (d: DispatchLog) => {
        const contact = contacts.find(c => c.id === d.contactId);
        return (
            <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                            {d.id}
                            <button 
                                onClick={() => handleDownloadDispatchPdf(d)}
                                title="Descargar Guía Oficial de Entrega (PDF)"
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="text-sm text-slate-500">{contact?.name || 'Cliente'}</div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setNotesDropdownOpen(notesDropdownOpen === d.id ? null : d.id); }}
                            className="relative p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Notas y Bitácora"
                        >
                            <FileText className="w-4 h-4" />
                            {(d.timelineNotes?.length || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                    {d.timelineNotes!.length}
                                </span>
                            )}
                        </button>
                        
                        {notesDropdownOpen === d.id && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden flex flex-col max-h-96">
                                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500" /> Notas de Despacho</h4>
                                    <button onClick={(e) => { e.stopPropagation(); setNotesDropdownOpen(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 custom-scrollbar">
                                    {(!d.timelineNotes || d.timelineNotes.length === 0) ? (
                                        <p className="text-xs text-center text-slate-400 italic py-4">No hay notas registradas.</p>
                                    ) : (
                                        d.timelineNotes.map(n => (
                                            <div key={n.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase tracking-wider">{n.process}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 mb-2 leading-relaxed">{n.text}</p>
                                                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-50">
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="w-3 h-3 text-slate-500"/>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-500">{n.author}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 border-t border-slate-100 bg-white">
                                    <textarea
                                        autoFocus
                                        id={`note-input-${d.id}`}
                                        placeholder="Escribe una nota aquí..."
                                        className="w-full text-sm border-2 border-slate-200 rounded-lg focus:ring-0 focus:border-indigo-400 p-2.5 min-h-[60px] resize-none transition-colors bg-slate-50 focus:bg-white"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                const text = (e.target as HTMLTextAreaElement).value.trim();
                                                if (text) {
                                                    const newNote = {
                                                        id: Math.random().toString(36).substr(2, 9),
                                                        author: 'Operario Despachos',
                                                        process: 'Despachos',
                                                        text,
                                                        date: new Date().toLocaleDateString('es-CO') + ' ' + new Date().toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})
                                                    };
                                                    updateDispatch(d.id, { timelineNotes: [...(d.timelineNotes || []), newNote] });
                                                    (e.target as HTMLTextAreaElement).value = '';
                                                    addToast({ title: 'Nota Guardada', message: 'La nota ha sido agregada a la bitácora.', severity: 'SUCCESS' });
                                                }
                                            }
                                        }}
                                    />
                                    <p className="text-[9px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1"><CheckCircle2 className="w-3 h-3"/> Presiona ENTER para guardar</p>
                                </div>
                            </div>
                        )}

                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                            {d.promisedDate}
                        </span>
                    </div>
                </div>
                
                <div className="text-sm text-slate-600 space-y-1">
                    {d.items.map((item, idx) => {
                        const product = inventory?.find((p: any) => p.sku === item.sku);
                        return (
                            <div key={idx} className="flex flex-col bg-slate-50 p-2 rounded gap-1 border border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-800 pr-2 truncate">
                                        <span>{item.sku}</span>
                                        {product?.originalSku && (
                                            <>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-indigo-600">{product.originalSku}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="font-mono text-xs font-bold whitespace-nowrap bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                                        {item.deliveredQty} / {item.orderedQty} {product?.baseUnit || 'UND'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 font-medium truncate">
                                    {item.productName}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between gap-2 flex-wrap items-center">
                    {d.status === 'PENDIENTE' && (
                        <button onClick={() => handleStatusChange(d.id, 'ARMANDO_PEDIDO')} className="flex-1 text-xs py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100">
                            Armar Pedido
                        </button>
                    )}
                    {d.status === 'ARMANDO_PEDIDO' && (
                        <button onClick={() => openPickPackModal(d)} className="flex-1 text-xs py-1.5 bg-amber-50 text-amber-700 rounded-md font-medium hover:bg-amber-100">
                            Despachar
                        </button>
                    )}
                    {d.status === 'EN_TRANSITO' && (
                        <>
                            <button onClick={() => handleStatusChange(d.id, 'ENTREGA_FALLIDA')} className="flex-1 text-xs py-1.5 bg-red-50 text-red-700 rounded-md font-medium hover:bg-red-100">
                                Fallida
                            </button>
                            <button onClick={() => handleStatusChange(d.id, 'ENTREGADO')} className="flex-1 text-xs py-1.5 bg-emerald-50 text-emerald-700 rounded-md font-medium hover:bg-emerald-100">
                                Entregado
                            </button>
                        </>
                    )}
                    {(d.status === 'ENTREGADO' || d.status === 'ENTREGA_FALLIDA') && (
                        <div className="flex-1 text-center text-xs py-1.5 text-slate-500 font-medium flex items-center justify-center">
                            {d.status === 'ENTREGADO' ? <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />}
                            {d.actualDeliveryDate || 'Sin Fecha'}
                        </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => handlePreviewDispatchPdf(d)}
                            title="Previsualizar Guía en Pantalla"
                            className="px-2 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        <button 
                            onClick={() => handleDownloadDispatchPdf(d)}
                            title="Descargar PDF Nativo"
                            className="px-2 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                        >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            Guía PDF
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por ID de despacho, cliente..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                </div>
                <button
                    onClick={handleDownloadManifestPdf}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
                >
                    <Printer className="w-4 h-4 text-amber-400" />
                    Manifiesto de Carga (PDF)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-100 p-4 rounded-2xl flex flex-col h-[calc(100vh-220px)]">
                    <h2 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
                        <span className="flex items-center"><Package className="w-4 h-4 mr-2" /> Por Despachar</span>
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{pending.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {pending.map(renderCard)}
                        {pending.length === 0 && <div className="text-center text-slate-400 text-sm py-10">No hay despachos pendientes</div>}
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl flex flex-col h-[calc(100vh-220px)]">
                    <h2 className="font-semibold text-indigo-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center"><Truck className="w-4 h-4 mr-2" /> En Tránsito</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{inTransit.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {inTransit.map(renderCard)}
                        {inTransit.length === 0 && <div className="text-center text-indigo-300 text-sm py-10">No hay vehículos en ruta</div>}
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-2xl flex flex-col h-[calc(100vh-220px)]">
                    <h2 className="font-semibold text-emerald-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center"><PackageCheck className="w-4 h-4 mr-2" /> Entregados</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{completed.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {completed.map(renderCard)}
                        {completed.length === 0 && <div className="text-center text-emerald-300 text-sm py-10">No hay entregas recientes</div>}
                    </div>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {previewModal?.isOpen && (
                <AnimatePresence>
                    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm ${isModalFullscreen ? 'p-0' : 'p-4'}`}>
                        <motion.div
                            ref={modalRef}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                                isModalFullscreen 
                                ? 'w-full h-full max-w-none max-h-none rounded-none border-0' 
                                : 'w-full max-w-5xl rounded-2xl h-[85vh]'
                            }`}
                        >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-base font-bold text-white">{previewModal.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {previewModal.dispatchLog && (
                                        <button
                                            onClick={() => handleDownloadDispatchPdf(previewModal.dispatchLog!)}
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all cursor-pointer mr-1"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Descargar PDF
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleNativeFullscreen}
                                        title={isModalFullscreen ? "Salir de Pantalla Completa (ESC)" : "Pantalla Completa Nativa (F11)"}
                                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        {isModalFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (document.fullscreenElement && document.exitFullscreen) {
                                                document.exitFullscreen().catch(() => {});
                                            }
                                            setPreviewModal(null);
                                            setIsModalFullscreen(false);
                                        }}
                                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 flex-1 bg-slate-950/50 overflow-hidden flex flex-col min-h-0">
                                <iframe 
                                    src={previewModal.blobUrl} 
                                    className="w-full h-full border border-slate-800 rounded-xl bg-slate-900 flex-1"
                                    title="PDF Preview"
                                />
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>
            )}

            {/* PICK & PACK VERIFICATION MODAL */}
            {pickPackOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full border border-slate-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <PackageCheck className="w-6 h-6 text-indigo-600" />
                                    Auditoría de Salida (Pick & Pack)
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    Escanee los productos del pedido <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{pickPackOrder.id}</span> para autorizar el despacho.
                                </p>
                            </div>
                            <button onClick={() => setPickPackOrder(null)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="mb-6 relative">
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Puntero láser: Escanee el código de barras (Ej: SKU)"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && scanInput) {
                                        const rawScan = scanInput.trim();
                                        let isMixtureScan = false;
                                        let scannedSku = rawScan.toUpperCase();

                                        try {
                                            const parsed = JSON.parse(rawScan);
                                            // Validar si el JSON corresponde al QR de una mezcla (contiene id y base)
                                            if (parsed.id && parsed.base) {
                                                isMixtureScan = true;
                                                // Buscar un ítem de tipo mezcla (MIX-) que falte por escanear
                                                const mixItem = pickPackOrder.items.find(i => i.sku.startsWith('MIX-') && (scannedQtys[i.sku] || 0) < i.orderedQty);
                                                if (mixItem) {
                                                    scannedSku = mixItem.sku;
                                                } else {
                                                    scannedSku = 'INVALID_MIX_LOT'; // Forzar error si no hay mezclas pendientes
                                                }
                                            }
                                        } catch(err) {
                                            // No es un JSON válido, se asume que es un escaneo de código de barras normal (SKU/EAN)
                                        }

                                        const item = pickPackOrder.items.find(i => i.sku.toUpperCase() === scannedSku);
                                        
                                        if (item) {
                                            // LÓGICA HÍBRIDA: Si es mezcla, EXIGIR escaneo de QR único. No permitir SKU genérico.
                                            if (item.sku.startsWith('MIX-') && !isMixtureScan) {
                                                addToast({ title: 'Validación de Seguridad', message: 'Este producto es una mezcla personalizada. DEBE escanear el Código QR único del lote, no el SKU genérico.', severity: 'CRITICAL' });
                                                setScanInput('');
                                                return;
                                            }

                                            const current = scannedQtys[item.sku] || 0;
                                            if (current < item.orderedQty) {
                                                setScannedQtys({...scannedQtys, [item.sku]: current + 1});
                                                setScanInput('');
                                                const msg = isMixtureScan ? `Código Único de Mezcla validado correctamente (+1)` : `SKU genérico: ${item.sku} escaneado correctamente (+1)`;
                                                addToast({ title: 'Producto Validado', message: msg, severity: 'SUCCESS' });
                                            } else {
                                                addToast({ title: 'Atención', message: 'Ya se escaneó la cantidad total pedida de este producto.', severity: 'WARNING' });
                                                setScanInput('');
                                            }
                                        } else {
                                            addToast({ title: 'Error de lectura', message: 'El producto o lote escaneado no pertenece a esta orden de despacho.', severity: 'CRITICAL' });
                                            setScanInput('');
                                        }
                                    }
                                }}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono text-center text-lg tracking-widest shadow-inner placeholder:text-sm placeholder:tracking-normal placeholder:font-sans transition-all"
                            />
                            <div className="absolute left-4 top-3.5 text-indigo-500">
                                <Search className="w-6 h-6 animate-pulse" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto mb-6 bg-slate-50/50 rounded-xl border border-slate-100 p-3 space-y-3 custom-scrollbar">
                            {pickPackOrder.items.map(item => {
                                const qty = scannedQtys[item.sku] || 0;
                                const isComplete = qty === item.orderedQty;
                                const product = inventory?.find(p => p.sku === item.sku);
                                return (
                                    <div key={item.sku} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isComplete ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${isComplete ? 'bg-emerald-500 text-white shadow-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {isComplete ? <CheckCircle2 className="w-6 h-6" /> : qty}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-800">{item.sku}</p>
                                                    {product?.originalSku && (
                                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono border border-indigo-100">Ref: {product.originalSku}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{item.productName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Progreso</div>
                                                <div className={`font-mono text-lg font-bold ${isComplete ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                                    {qty} <span className="text-sm font-sans text-slate-400">/ {item.orderedQty}</span>
                                                </div>
                                            </div>
                                            {!isComplete && (
                                                <button 
                                                    onClick={() => {
                                                        setScannedQtys({...scannedQtys, [item.sku]: qty + 1});
                                                        addToast({ title: 'Validación Manual', message: `Se agregó 1 unidad de ${item.sku}`, severity: 'SUCCESS' });
                                                    }}
                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 rounded-lg text-xs font-bold transition-all"
                                                    title="Simular escaneo de 1 unidad"
                                                >
                                                    Validar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={() => setPickPackOrder(null)}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            {(() => {
                                const allComplete = pickPackOrder.items.every(item => (scannedQtys[item.sku] || 0) === item.orderedQty);
                                return (
                                    <button 
                                        disabled={!allComplete}
                                        onClick={() => {
                                            setInvoiceOrder(pickPackOrder);
                                            setPickPackOrder(null);
                                        }}
                                        className={`flex-[2] py-3.5 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${allComplete ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                    >
                                        <Truck className="w-5 h-5" />
                                        {allComplete ? 'Confirmar y Despachar Pedido' : 'Faltan productos por escanear...'}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
            {invoiceOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-indigo-600" />
                                Emitir Factura Electrónica (Online)
                            </h2>
                            <button onClick={() => setInvoiceOrder(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl mb-6">
                            <div className="text-center mb-4">
                                <h3 className="font-bold text-lg text-slate-800">PROCOQUINAL S.A.S.</h3>
                                <p className="text-sm text-slate-500">NIT: 800.123.456-7</p>
                                <p className="text-sm text-slate-500">Factura Electrónica de Venta - PREVIEW</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                <div>
                                    <p className="text-slate-500">Cliente:</p>
                                    <p className="font-bold">{contacts.find(c => c.id === invoiceOrder.contactId)?.name || 'Cliente Genérico'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Pedido / Orden:</p>
                                    <p className="font-bold">{invoiceOrder.id}</p>
                                </div>
                            </div>

                            <table className="w-full text-sm mb-4">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2">Item</th>
                                        <th className="text-right py-2">Cant.</th>
                                        <th className="text-right py-2">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceOrder.items.map((it, idx) => {
                                        const prod = inventory.find(p => p.sku === it.sku);
                                        const price = prod?.price || 0;
                                        return (
                                            <tr key={idx} className="border-b border-slate-100">
                                                <td className="py-2">{it.sku}</td>
                                                <td className="text-right py-2">{it.orderedQty}</td>
                                                <td className="text-right py-2">{formatCOP(it.orderedQty * price)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>TOTAL A PAGAR:</span>
                                <span>{formatCOP(invoiceOrder.items.reduce((acc, it) => {
                                    const prod = inventory.find(p => p.sku === it.sku);
                                    return acc + (it.orderedQty * (prod?.price || 0));
                                }, 0))}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button onClick={() => setInvoiceOrder(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                                Cancelar
                            </button>
                            <button onClick={() => {
                                handleStatusChange(invoiceOrder.id, 'EN_TRANSITO');
                                setInvoiceOrder(null);
                                addToast({ title: 'Factura Emitida', message: `Se ha emitido la factura para el pedido ${invoiceOrder.id} y el despacho fue autorizado.`, severity: 'SUCCESS' });
                            }} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                                <FileText className="w-5 h-5" /> Emitir Factura
                            </button>
                            <button onClick={() => {
                                addToast({ title: 'Imprimiendo', message: 'Enviando a la impresora local...', severity: 'INFO' });
                            }} className="py-3 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                                <Printer className="w-5 h-5" /> Imprimir Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


