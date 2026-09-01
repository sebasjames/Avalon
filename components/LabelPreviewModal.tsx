import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, Copy, X, Check, QrCode, Beaker, ShieldAlert, Cpu, CheckCircle2, Play } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MezclaLabelData {
    id: string;
    saleId: string;
    clientName: string;
    colorId: string;
    baseSku: string;
    baseName: string;
    baseType?: string;
    formula: Record<string, string>;
    requestedAt?: string;
    operator?: string;
}

interface LabelPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: MezclaLabelData;
    onDispenseComplete?: () => void;
}

export const LabelPreviewModal: React.FC<LabelPreviewModalProps> = ({
    isOpen,
    onClose,
    data,
    onDispenseComplete
}) => {
    const { addToast } = useUIStore();
    const [copiedZpl, setCopiedZpl] = useState(false);
    const [isDispensing, setIsDispensing] = useState(false);
    const [dispenseProgress, setDispenseProgress] = useState(0);
    const [activeColorant, setActiveColorant] = useState<string | null>(null);

    if (!isOpen || !data) return null;

    const qrDataPayload = JSON.stringify({
        id: data.id,
        saleId: data.saleId,
        client: data.clientName,
        color: data.colorId,
        base: data.baseSku,
        date: data.requestedAt || new Date().toISOString()
    });

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataPayload)}`;

    const generateZplCode = () => {
        const formulaLines = Object.entries(data.formula)
            .map(([tinta, qty], i) => `^FO30,${340 + i * 28}^FD${tinta}: ${qty}^FS`)
            .join('\n');

        return `^XA
^PW880
^LL680
^FO20,20^GB840,640,4^FS
^FO40,40^A0N,38,38^FDPROCOQUINAL S.A.S. - TINTOMETRIA^FS
^FO40,85^A0N,44,44^FDCOLOR: ${data.colorId}^FS
^FO40,140^A0N,24,24^FDCLIENTE: ${data.clientName}^FS
^FO40,175^A0N,22,22^FDBASE: ${data.baseName} (${data.baseSku})^FS
^FO40,205^A0N,22,22^FDLOTE: ${data.id} | VENTA: ${data.saleId}^FS
^FO40,240^GB500,2,2^FS
^FO40,255^A0N,22,22^FDDOSIFICACION DE PIGMENTOS:^FS
${formulaLines}
^FO550,40^BQN,2,9^FDQA,${qrDataPayload}^FS
^FO550,380^A0N,18,18^FDESCANEAR PARA TRAZABILIDAD^FS
^FO40,620^A0N,20,20^FDINFLAMABLE - USO INDUSTRIAL EXCLUSIVO^FS
^XZ`;
    };

    const handleCopyZpl = () => {
        const zpl = generateZplCode();
        navigator.clipboard.writeText(zpl);
        setCopiedZpl(true);
        addToast({ title: 'ZPL Copiado', message: 'Comandos ZPL monocromáticos para impresora térmica (Horizontal 11x8.5 cm) copiados.', severity: 'SUCCESS' });
        setTimeout(() => setCopiedZpl(false), 3000);
    };

    const handleDownloadLabelPdf = () => {
        // Horizontal landscape thermal sticker: 110mm x 85mm (11 x 8.5 cm)
        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: [110, 85] });

        // Pure Monochrome Black & White styling for thermal clarity
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.8);
        doc.rect(3, 3, 104, 79);

        // Top Left Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('PROCOQUINAL S.A.S.', 6, 9.5);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text('SISTEMA TINTOMÉTRICO INDUSTRIAL', 6, 13.5);
        doc.line(6, 15, 68, 15);

        // Color ID Big Bold
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`FÓRMULA: ${data.colorId}`, 6, 21);

        // Left Details Column
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(`Cliente: ${data.clientName}`, 6, 26);
        doc.setFont('helvetica', 'normal');
        doc.text(`Lote: ${data.id}  |  Venta: ${data.saleId}`, 6, 30);
        doc.text(`Base: ${data.baseName} (${data.baseSku})`, 6, 34);

        // QR Code Image on Right side — Maximum Size Fill (36mm x 36mm)
        try {
            doc.addImage(qrImageUrl, 'PNG', 70, 5, 36, 36);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.4);
            doc.rect(70, 5, 36, 36);
        } catch (e) {
            console.warn('Could not embed QR image in PDF', e);
        }

        // Formula Components Table
        const formulaEntries = Object.entries(data.formula).filter(([k]) => k !== 'Error');
        const tableBody = formulaEntries.map(([tinta, qty]) => [tinta, qty]);

        autoTable(doc, {
            startY: 43,
            head: [['PIGMENTO / COLORANTE', 'DOSIS (g/mL)']],
            body: tableBody,
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 6.5, cellPadding: 1, fontStyle: 'bold' },
            styles: { fontSize: 6.5, textColor: [0, 0, 0], cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.2 },
            columnStyles: { 0: { cellWidth: 68 }, 1: { cellWidth: 30, halign: 'right', fontStyle: 'bold' } },
            margin: { left: 6, right: 6 }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 72;

        // Footer Safety
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠ INFLAMABLE - USO INDUSTRIAL EXCLUSIVO', 6, Math.min(finalY + 4, 79));
        doc.setFont('helvetica', 'normal');
        doc.text(`Expedición: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, 60, Math.min(finalY + 4, 79));

        doc.save(`Etiqueta_Termica_${data.colorId.replace(/\s+/g, '_')}_${data.id}.pdf`);
        addToast({ title: 'Etiqueta PDF Descargada', message: `Formato Térmico Monocromático Horizontal (11x8.5 cm) listo.`, severity: 'SUCCESS' });
    };

    const handleStartDispensing = () => {
        setIsDispensing(true);
        setDispenseProgress(0);

        const colorants = Object.keys(data.formula).filter(k => k !== 'Error');
        let currentIdx = 0;

        const interval = setInterval(() => {
            currentIdx++;
            const pct = Math.min(Math.round((currentIdx / colorants.length) * 100), 100);
            setDispenseProgress(pct);
            setActiveColorant(colorants[currentIdx - 1] || 'Finalizando');

            if (currentIdx >= colorants.length) {
                clearInterval(interval);
                setTimeout(() => {
                    setIsDispensing(false);
                    setActiveColorant(null);
                    addToast({
                        title: 'Dispensación Exitosa',
                        message: `Fórmula ${data.colorId} inyectada correctamente en la máquina dispensadora.`,
                        severity: 'SUCCESS'
                    });
                    if (onDispenseComplete) onDispenseComplete();
                }, 800);
            }
        }, 900);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col text-white"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                                <Printer className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Etiqueta Térmica Monocromática (B&N)</h3>
                                <p className="text-xs text-slate-400">Formato Horizontal 11 x 8.5 cm — QR Grande (25% Sticker) & Alto Contraste</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                        {/* Pure Black & White Thermal Sticker Preview (Horizontal 11 x 8.5 cm) */}
                        <div className="bg-white text-black p-5 rounded-lg shadow-2xl border-4 border-black w-full max-w-xl mx-auto relative font-mono select-none">
                            {/* Outer Border Box like thermal label print */}
                            <div className="border-2 border-black p-3 rounded">
                                {/* Top Layout: Split 70% Left Text Details / 30% Right GIANT QR CODE */}
                                <div className="flex justify-between items-stretch gap-3 mb-3 pb-3 border-b-2 border-black">
                                    {/* Left Text Block */}
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="border-b border-black pb-1">
                                            <h4 className="font-black text-xl tracking-tight uppercase font-sans leading-none">
                                                PROCOQUINAL S.A.S.
                                            </h4>
                                            <span className="text-[9.5px] font-sans font-extrabold text-black uppercase block tracking-wider mt-0.5">SISTEMA TINTOMÉTRICO INDUSTRIAL</span>
                                        </div>
                                        
                                        <div>
                                            <span className="text-[9px] text-slate-700 block font-sans font-bold uppercase">Fórmula Seleccionada:</span>
                                            <span className="text-xl font-black text-black leading-tight block tracking-tight font-sans">
                                                {data.colorId}
                                            </span>
                                        </div>

                                        <div className="text-[11px] font-sans pt-1 space-y-0.5">
                                            <p className="truncate"><span className="font-bold uppercase text-[9px]">Cliente:</span> <span className="font-extrabold">{data.clientName}</span></p>
                                            <p><span className="font-bold uppercase text-[9px]">Lote / Venta:</span> <span className="font-extrabold font-mono">{data.id} ({data.saleId})</span></p>
                                            <p className="truncate"><span className="font-bold uppercase text-[9px]">Base:</span> <span className="font-extrabold">{data.baseName}</span></p>
                                        </div>
                                    </div>

                                    {/* Right Giant QR Code Block (Maximizing available vertical/horizontal height) */}
                                    <div className="w-40 h-40 shrink-0 flex items-center justify-center border-2 border-black p-1 bg-white rounded self-center">
                                        <img src={qrImageUrl} alt="QR Code Trazabilidad" className="w-full h-full object-contain bg-white" />
                                    </div>
                                </div>

                                {/* Formula Pigments Table - Pure B&W Crisp Text */}
                                <div className="border border-black rounded overflow-hidden mb-3">
                                    <div className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase flex justify-between font-sans">
                                        <span>Componente / Pigmento</span>
                                        <span>Cantidad (g/mL)</span>
                                    </div>
                                    <div className="divide-y divide-black text-xs font-mono">
                                        {Object.entries(data.formula).map(([tinta, qty]) => (
                                            <div key={tinta} className="px-3 py-1 flex justify-between items-center font-bold">
                                                <span className="text-black">{tinta}</span>
                                                <span className="font-black text-black font-mono">{qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Safety Disclaimer */}
                                <div className="text-[10px] font-bold text-black border-t border-black pt-1 flex justify-between items-center font-sans">
                                    <span>⚠ INFLAMABLE - USO INDUSTRIAL EXCLUSIVO</span>
                                    <span className="text-[9px] font-mono">{new Date().toLocaleDateString('es-CO')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Dispensing progress bar if active */}
                        {isDispensing && (
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3 animate-in fade-in">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="flex items-center gap-2 text-indigo-400">
                                        <Cpu className="w-4 h-4 animate-spin" />
                                        Inyectando pigmento: {activeColorant}
                                    </span>
                                    <span className="text-amber-400">{dispenseProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                                    <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${dispenseProgress}%` }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap justify-between items-center gap-3">
                        <button
                            onClick={handleStartDispensing}
                            disabled={isDispensing}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            {isDispensing ? 'Dispensando...' : 'Enviar a Máquina Dispensadora'}
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyZpl}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                {copiedZpl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                ZPL (Zebra Horizontal 11x8.5)
                            </button>
                            <button
                                onClick={handleDownloadLabelPdf}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Imprimir Etiqueta B&N (11x8.5 cm)
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
