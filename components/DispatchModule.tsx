import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnterprise } from '../context/EnterpriseContext';
import { useUIStore } from '../stores/uiStore';
import { Truck, Package, PackageCheck, AlertTriangle, CheckCircle2, Search, FileText, Download, Printer, Eye, X, Maximize2, Minimize2 } from 'lucide-react';
import { DispatchLog, CrmContact } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const DispatchModule: React.FC = () => {
    const { dispatches, updateDispatch, contacts } = useEnterprise();
    const { addToast } = useUIStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; blobUrl: string; title: string; dispatchLog?: DispatchLog } | null>(null);
    const [isModalFullscreen, setIsModalFullscreen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

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
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                        {d.promisedDate}
                    </span>
                </div>
                
                <div className="text-sm text-slate-600 space-y-1">
                    {d.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                            <span className="truncate pr-2">{item.productName}</span>
                            <span className="font-mono text-xs font-medium">
                                {item.deliveredQty} / {item.orderedQty}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between gap-2 flex-wrap items-center">
                    {d.status === 'PENDIENTE' && (
                        <button onClick={() => handleStatusChange(d.id, 'ARMANDO_PEDIDO')} className="flex-1 text-xs py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100">
                            Armar Pedido
                        </button>
                    )}
                    {d.status === 'ARMANDO_PEDIDO' && (
                        <button onClick={() => handleStatusChange(d.id, 'EN_TRANSITO')} className="flex-1 text-xs py-1.5 bg-amber-50 text-amber-700 rounded-md font-medium hover:bg-amber-100">
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
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Truck className="w-6 h-6 mr-2 text-indigo-600" />
                        Módulo de Despachos y Logística
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Control de entregas, asignación de rutas y registro de tiempos para OTIF y Fill Rate.</p>
                </div>
                <button
                    onClick={handleDownloadManifestPdf}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
                >
                    <Printer className="w-4 h-4 text-amber-400" />
                    Manifiesto de Carga (PDF)
                </button>
            </header>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por ID de despacho, cliente..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full max-w-md border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
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
        </div>
    );
};


