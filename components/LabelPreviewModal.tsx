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

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrDataPayload)}`;

    const generateZplCode = () => {
        const formulaLines = Object.entries(data.formula)
            .map(([tinta, qty], i) => `^FO30,${340 + i * 25}^FD${tinta}: ${qty}^FS`)
            .join('\n');

        return `^XA
^PW680
^LL880
^FO30,30^GB620,820,3^FS
^FO50,50^A0N,36,36^FDPROCOQUINAL S.A.S.^FS
^FO50,90^A0N,24,24^FDSISTEMA TINTOMETRICO INDUSTRIAL (8.5x11 cm)^FS
^FO50,130^GB580,2,2^FS
^FO50,150^A0N,28,28^FDFORMULA: ${data.colorId}^FS
^FO50,185^A0N,22,22^FDCLIENTE: ${data.clientName}^FS
^FO50,215^A0N,22,22^FDVENTA NO: ${data.saleId} | LOTE: ${data.id}^FS
^FO50,245^A0N,22,22^FDBASE: ${data.baseName} (${data.baseSku})^FS
^FO50,275^GB580,2,2^FS
^FO50,295^A0N,24,24^FDDOSIFICACION DE PIGMENTOS:^FS
${formulaLines}
^FO460,580^BQN,2,5^FDQA,${qrDataPayload}^FS
^FO50,750^A0N,18,18^FDINFLAMABLE - USO INDUSTRIAL EXCLUSIVO^FS
^XZ`;
    };

    const handleCopyZpl = () => {
        const zpl = generateZplCode();
        navigator.clipboard.writeText(zpl);
        setCopiedZpl(true);
        addToast({ title: 'ZPL Copiado', message: 'Comandos ZPL para impresora térmica (Zebra 8.5x11) copiados al portapapeles.', severity: 'SUCCESS' });
        setTimeout(() => setCopiedZpl(false), 3000);
    };

    const handleDownloadLabelPdf = () => {
        // Page size: 8.5 x 11 cm -> 85mm x 110mm thermal sticker
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [85, 110] });

        // Header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 85, 16, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('PROCOQUINAL S.A.S.', 5, 7);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);
        doc.text('ETIQUETA TINTOMÉTRICA (8.5 x 11 cm)', 5, 12);

        // Color badge
        doc.setFillColor(254, 240, 138); // yellow-100
        doc.roundedRect(5, 19, 75, 10, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(146, 64, 14);
        doc.text(`COLOR: ${data.colorId}`, 8, 25.5);

        // Details
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`Cliente: ${data.clientName}`, 5, 33);
        doc.setFont('helvetica', 'normal');
        doc.text(`Orden Mezcla: ${data.id}  |  Venta: ${data.saleId}`, 5, 37);
        doc.text(`Base: ${data.baseName}`, 5, 41);
        doc.text(`SKU Base: ${data.baseSku}`, 5, 45);

        // Pigments Table
        const formulaEntries = Object.entries(data.formula).filter(([k]) => k !== 'Error');
        const tableBody = formulaEntries.map(([tinta, qty]) => [tinta, qty]);

        autoTable(doc, {
            startY: 48,
            head: [['PIGMENTO / COLORANTE', 'CANTIDAD (g/mL)']],
            body: tableBody,
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 6.5, cellPadding: 1.5 },
            styles: { fontSize: 6.5, cellPadding: 1.5 },
            columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 25, halign: 'right', fontStyle: 'bold' } },
            margin: { left: 5, right: 5 }
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 80;

        // Footer note & Safety
        doc.setFontSize(6);
        doc.setTextColor(225, 29, 72);
        doc.text('⚠ LIQUIDO INFLAMABLE - MANTENER ALEJADO DEL FUEGO', 5, Math.min(finalY + 6, 102));
        doc.setTextColor(100, 116, 139);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, 5, Math.min(finalY + 10, 106));

        doc.save(`Etiqueta_Formula_${data.colorId.replace(/\s+/g, '_')}_${data.id}.pdf`);
        addToast({ title: 'Etiqueta PDF Generada', message: `Etiqueta de formato térmico 8.5x11 cm descargada.`, severity: 'SUCCESS' });
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
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-white"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                                <Printer className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Previsualización de Etiqueta Térmica</h3>
                                <p className="text-xs text-slate-400">Formato Sticker Industrial 8.5 x 11 cm</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                        {/* Interactive Thermal Sticker Canvas Box */}
                        <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border-4 border-slate-300 max-w-md mx-auto relative font-sans select-none">
                            {/* Sticker Header */}
                            <div className="bg-slate-900 text-white p-3 rounded-xl mb-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-extrabold text-sm tracking-wide">PROCOQUINAL S.A.S.</h4>
                                    <p className="text-[10px] text-slate-300">SISTEMA TINTOMÉTRICO (8.5 x 11 cm)</p>
                                </div>
                                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                                    8.5x11 cm
                                </span>
                            </div>

                            {/* Color Header Banner */}
                            <div className="bg-amber-100 border border-amber-300 text-amber-950 p-3 rounded-xl mb-4 flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Fórmula Seleccionada</span>
                                    <span className="text-lg font-black tracking-tight">{data.colorId}</span>
                                </div>
                                <img src={qrImageUrl} alt="QR Code" className="w-14 h-14 rounded border border-amber-400 bg-white p-0.5" />
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cliente</span>
                                    <span className="font-bold text-slate-800 truncate block">{data.clientName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Orden / Lote</span>
                                    <span className="font-bold text-slate-800 font-mono">{data.id}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Base de Pintura</span>
                                    <span className="font-bold text-slate-800">{data.baseName} ({data.baseSku})</span>
                                </div>
                            </div>

                            {/* Pigment table */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                                <div className="bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase flex justify-between">
                                    <span>Pigmento / Tinta</span>
                                    <span>Dosificación (g/mL)</span>
                                </div>
                                <div className="divide-y divide-slate-100 text-xs">
                                    {Object.entries(data.formula).map(([tinta, qty]) => (
                                        <div key={tinta} className="px-3 py-1.5 flex justify-between items-center">
                                            <span className="font-medium text-slate-700">{tinta}</span>
                                            <span className="font-bold font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{qty}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hazmat Warning */}
                            <div className="flex items-center gap-2 text-[10px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>LÍQUIDO INFLAMABLE - USO INDUSTRIAL EXCLUSIVO</span>
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
                                ZPL (Zebra 8.5x11)
                            </button>
                            <button
                                onClick={handleDownloadLabelPdf}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                Imprimir Etiqueta PDF (8.5x11)
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
