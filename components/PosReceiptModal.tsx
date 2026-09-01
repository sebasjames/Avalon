import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, Copy, X, Check, QrCode, Maximize2, Minimize2, CheckCircle2, ShieldCheck, Receipt } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { formatCOP } from '../utils/format';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PosReceiptData {
    invoiceId: string;
    idempotencyKey: string;
    cufe: string;
    date: string;
    time: string;
    clientName: string;
    clientDocument: string;
    clientAddress?: string;
    posLocation: string;
    cashierName: string;
    paymentMethod: string;
    cart: {
        sku: string;
        name: string;
        qty: number;
        unitPrice: number;
        totalPrice: number;
        colorNote?: string;
    }[];
    subtotal: number;
    discountAmount: number;
    ivaAmount: number;
    reteFuenteAmount: number;
    reteIcaAmount: number;
    total: number;
    amountPaid?: number;
    changeGiven?: number;
}

interface PosReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PosReceiptData;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
    isOpen,
    onClose,
    data
}) => {
    const { addToast } = useUIStore();
    const [copiedEscPos, setCopiedEscPos] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    if (!isOpen || !data) return null;

    const dianQrPayload = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${data.cufe}&numfac=${data.invoiceId}&fecfac=${data.date}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(dianQrPayload)}`;
    const barcodeImageUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(data.invoiceId)}&scale=3&rotate=N&includetext`;

    const toggleNativeFullscreen = () => {
        if (!document.fullscreenElement) {
            const el = modalRef.current || document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {});
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
            setIsFullscreen(false);
        }
    };

    const generateEscPosBuffer = () => {
        // Raw ESC/POS commands for Starpos TP80NC 80mm thermal printer
        const ESC = '\x1B';
        const GS = '\x1D';
        const INIT = `${ESC}@`;
        const ALIGN_CENTER = `${ESC}a\x01`;
        const ALIGN_LEFT = `${ESC}a\x00`;
        const BOLD_ON = `${ESC}E\x01`;
        const BOLD_OFF = `${ESC}E\x00`;
        const CUT_PAPER = `${GS}V\x42\x00`; // Partial cut
        const OPEN_DRAWER = `${ESC}p\x00\x19\xFA`; // Open cash drawer

        let receiptText = `${INIT}${ALIGN_CENTER}${BOLD_ON}PROCOQUINAL S.A.S.${BOLD_OFF}\n`;
        receiptText += `NIT: 900.123.456-7\n`;
        receiptText += `SISTEMA TINTOMETRICO B2B\n`;
        receiptText += `Res. DIAN 18760000001 del 2026-01-01\n`;
        receiptText += `Rango: FACT-00100 a FACT-99999\n`;
        receiptText += `------------------------------------------------\n`;
        receiptText += `${ALIGN_LEFT}FACTURA VENTA: ${data.invoiceId}\n`;
        receiptText += `FECHA: ${data.date}  HORA: ${data.time}\n`;
        receiptText += `PUNTO VENTA: ${data.posLocation}\n`;
        receiptText += `CAJERO: ${data.cashierName}\n`;
        receiptText += `CLIENTE: ${data.clientName}\n`;
        receiptText += `DOC: ${data.clientDocument}\n`;
        receiptText += `PAGO: ${data.paymentMethod}\n`;
        receiptText += `IDEMPOTENCY: ${data.idempotencyKey.substring(0, 16)}...\n`;
        receiptText += `------------------------------------------------\n`;
        receiptText += `CANT  DESCRIPCION             P.UNIT      TOTAL\n`;
        receiptText += `------------------------------------------------\n`;

        data.cart.forEach(item => {
            const name = (item.name + (item.colorNote ? ` [${item.colorNote}]` : '')).substring(0, 22).padEnd(22, ' ');
            const qty = item.qty.toString().padEnd(5, ' ');
            const unit = formatCOP(item.unitPrice).padStart(10, ' ');
            const total = formatCOP(item.totalPrice).padStart(10, ' ');
            receiptText += `${qty} ${name} ${unit} ${total}\n`;
        });

        receiptText += `------------------------------------------------\n`;
        receiptText += `SUBTOTAL:               ${formatCOP(data.subtotal).padStart(15, ' ')}\n`;
        receiptText += `IVA (19%):              ${formatCOP(data.ivaAmount).padStart(15, ' ')}\n`;
        if (data.reteFuenteAmount > 0) receiptText += `RETEFUENTE:            -${formatCOP(data.reteFuenteAmount).padStart(15, ' ')}\n`;
        if (data.reteIcaAmount > 0) receiptText += `RETEICA:               -${formatCOP(data.reteIcaAmount).padStart(15, ' ')}\n`;
        receiptText += `${BOLD_ON}TOTAL FACTURA:         ${formatCOP(data.total).padStart(15, ' ')}${BOLD_OFF}\n`;
        receiptText += `------------------------------------------------\n`;
        receiptText += `${ALIGN_CENTER}CUFE DIAN:\n${data.cufe}\n\n`;
        receiptText += `¡GRACIAS POR SU COMPRA!\n\n\n`;
        receiptText += `${OPEN_DRAWER}${CUT_PAPER}`;

        return receiptText;
    };

    const handleCopyEscPos = () => {
        const text = generateEscPosBuffer();
        navigator.clipboard.writeText(text);
        setCopiedEscPos(true);
        addToast({ title: 'Comandos ESC/POS Copiados', message: 'Secuencia ESC/POS para impresora Starpos TP80NC (80mm) copiada.', severity: 'SUCCESS' });
        setTimeout(() => setCopiedEscPos(false), 3000);
    };

    const handleDownload80mmPdf = () => {
        // Continuous 80mm thermal receipt PDF (width: 80mm, dynamic height ~200mm)
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [80, 220] });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('PROCOQUINAL S.A.S.', 40, 8, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('NIT: 900.123.456-7  •  IVA REGIMEN COMUN', 40, 12, { align: 'center' });
        doc.text('Res. DIAN 18760000001 (Rango FACT-00100 a FACT-99999)', 40, 16, { align: 'center' });
        doc.line(4, 18, 76, 18);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`FACTURA POS Nº: ${data.invoiceId}`, 4, 23);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.text(`Fecha: ${data.date} ${data.time}`, 4, 27);
        doc.text(`Cliente: ${data.clientName} (${data.clientDocument})`, 4, 31);
        doc.text(`Punto Venta: ${data.posLocation} | Cajero: ${data.cashierName}`, 4, 35);
        doc.text(`Método Pago: ${data.paymentMethod}`, 4, 39);
        doc.text(`Idempotency Key: ${data.idempotencyKey.substring(0, 20)}...`, 4, 43);

        // Cart items table
        const tableBody = data.cart.map(i => [
            i.qty.toString(),
            i.name + (i.colorNote ? ` [${i.colorNote}]` : ''),
            formatCOP(i.unitPrice),
            formatCOP(i.totalPrice)
        ]);

        autoTable(doc, {
            startY: 46,
            head: [['CANT', 'PRODUCTO', 'P.UNIT', 'TOTAL']],
            body: tableBody,
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 6, cellPadding: 1, fontStyle: 'bold' },
            styles: { fontSize: 6, textColor: [0, 0, 0], cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.1 },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: 34 },
                2: { cellWidth: 15, halign: 'right' },
                3: { cellWidth: 15, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 4, right: 4 }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 120;

        // Totals
        doc.line(4, finalY + 2, 76, finalY + 2);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Subtotal: ${formatCOP(data.subtotal)}`, 76, finalY + 6, { align: 'right' });
        doc.text(`IVA (19%): ${formatCOP(data.ivaAmount)}`, 76, finalY + 10, { align: 'right' });
        if (data.reteFuenteAmount > 0) doc.text(`ReteFuente: -${formatCOP(data.reteFuenteAmount)}`, 76, finalY + 14, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`TOTAL FACTURA: ${formatCOP(data.total)}`, 76, finalY + 19, { align: 'right' });

        // Barcode Image
        try {
            doc.addImage(barcodeImageUrl, 'PNG', 10, finalY + 23, 60, 12);
        } catch (e) {}

        // QR Code DIAN (CUFE)
        try {
            doc.addImage(qrImageUrl, 'PNG', 26, finalY + 37, 28, 28);
            doc.setFontSize(5);
            doc.setFont('helvetica', 'normal');
            doc.text('CUFE DIAN / VERIFICACIÓN VÁLIDA', 40, finalY + 67, { align: 'center' });
        } catch (e) {}

        doc.save(`Factura_POS_${data.invoiceId}.pdf`);
        addToast({ title: 'Factura 80mm Generada', message: `Ticket térmico POS descargado para Starpos TP80NC.`, severity: 'SUCCESS' });
    };

    return (
        <AnimatePresence>
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm ${isFullscreen ? 'p-0' : 'p-4'}`}>
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                        isFullscreen ? 'w-full h-full rounded-none border-0' : 'w-full max-w-2xl rounded-2xl max-h-[90vh]'
                    }`}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>Comprobante Factura POS (80mm Starpos TP80NC)</span>
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[10px] rounded border border-emerald-500/30 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> IDEMPOTENTE
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400">Previsualizador de Tirilla Térmica con Código de Barras & QR DIAN</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleNativeFullscreen}
                                title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa Nativa (F11)"}
                                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-950/50 min-h-0 custom-scrollbar">
                        {/* Interactive Pure 80mm Thermal Receipt Canvas (Starpos TP80NC Format) */}
                        <div className="bg-white text-black p-6 rounded-lg shadow-2xl border-4 border-black w-[360px] mx-auto font-mono text-xs select-none relative">
                            {/* Receipt Outer Frame */}
                            <div className="border-2 border-black p-4 space-y-3 rounded">
                                {/* Header Info */}
                                <div className="text-center border-b-2 border-black pb-3 space-y-1 font-sans">
                                    <h2 className="font-black text-lg uppercase tracking-tight">PROCOQUINAL S.A.S.</h2>
                                    <p className="text-[10px] font-bold text-slate-700">NIT: 900.123.456-7  •  IVA REGIMEN COMUN</p>
                                    <p className="text-[9px] font-medium text-slate-600">Res. DIAN 18760000001 (FACT-00100 a FACT-99999)</p>
                                    <p className="text-[9px] font-bold text-slate-800 uppercase">SISTEMA POS B2B TINTOMÉTRICO</p>
                                </div>

                                {/* Invoice Details */}
                                <div className="space-y-1 text-[11px] border-b border-black pb-2 font-sans">
                                    <div className="flex justify-between font-bold">
                                        <span>FACTURA POS Nº:</span>
                                        <span className="font-mono">{data.invoiceId}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span>FECHA / HORA:</span>
                                        <span className="font-mono">{data.date} {data.time}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span>CLIENTE:</span>
                                        <span className="font-bold truncate max-w-[180px]">{data.clientName}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span>NIT / CC:</span>
                                        <span className="font-mono">{data.clientDocument}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span>PUNTO VENTA:</span>
                                        <span>{data.posLocation}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span>PAGO:</span>
                                        <span className="font-bold">{data.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-600">
                                        <span>IDEMPOTENCY:</span>
                                        <span className="font-mono">{data.idempotencyKey.substring(0, 14)}...</span>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="border border-black rounded overflow-hidden">
                                    <div className="bg-black text-white px-2 py-1 text-[9px] font-bold uppercase flex justify-between font-sans">
                                        <span>CANT / DESCRIPCIÓN</span>
                                        <span>TOTAL</span>
                                    </div>
                                    <div className="divide-y divide-black text-[11px] font-mono">
                                        {data.cart.map((item, idx) => (
                                            <div key={idx} className="p-2 space-y-0.5">
                                                <div className="flex justify-between font-bold">
                                                    <span className="truncate pr-2">{item.name} {item.colorNote ? `[${item.colorNote}]` : ''}</span>
                                                    <span>{formatCOP(item.totalPrice)}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-slate-700">
                                                    <span>{item.qty} x {formatCOP(item.unitPrice)}</span>
                                                    <span>SKU: {item.sku}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Financial Summary */}
                                <div className="space-y-1 pt-1 text-[11px] font-sans border-t border-black">
                                    <div className="flex justify-between">
                                        <span>Subtotal Neto:</span>
                                        <span className="font-mono">{formatCOP(data.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>IVA (19%):</span>
                                        <span className="font-mono">{formatCOP(data.ivaAmount)}</span>
                                    </div>
                                    {data.reteFuenteAmount > 0 && (
                                        <div className="flex justify-between text-rose-700">
                                            <span>ReteFuente:</span>
                                            <span className="font-mono">-{formatCOP(data.reteFuenteAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-black text-sm border-t-2 border-black pt-1">
                                        <span>TOTAL FACTURA:</span>
                                        <span className="font-mono">{formatCOP(data.total)}</span>
                                    </div>
                                </div>

                                {/* Barcode CODE128 Section */}
                                <div className="text-center pt-2 border-t border-black space-y-1">
                                    <img src={barcodeImageUrl} alt="Barcode 128" className="h-12 mx-auto object-contain" />
                                    <span className="text-[9px] font-mono font-bold block">{data.invoiceId}</span>
                                </div>

                                {/* QR Code DIAN CUFE Section */}
                                <div className="text-center border-t-2 border-black pt-3 space-y-1.5 font-sans">
                                    <img src={qrImageUrl} alt="QR DIAN CUFE" className="w-32 h-32 border-2 border-black p-0.5 bg-white mx-auto" />
                                    <span className="text-[9px] font-extrabold block text-center uppercase tracking-tight">CUFE DIAN / FACTURA ELECTRÓNICA VÁLIDA</span>
                                    <p className="text-[8px] font-mono text-slate-600 break-all px-2">{data.cufe.substring(0, 32)}...</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap justify-between items-center gap-3 shrink-0">
                        <button
                            onClick={handleCopyEscPos}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            {copiedEscPos ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            Comandos ESC/POS (Starpos TP80NC)
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownload80mmPdf}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir Ticket Térmico 80mm (Starpos TP80NC)
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
