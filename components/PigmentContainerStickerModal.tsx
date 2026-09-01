import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, Copy, X, Check, QrCode, Tag, Beaker, ShieldAlert } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { MezclaOrder } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PigmentContainerStickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: MezclaOrder;
}

export interface ContainerBalanceItem {
    pigmentCode: string;
    usedQtyStr: string;
    usedQtyGrams: number;
    initialQtyGrams: number;
    remainingQtyGrams: number;
    containerLot: string;
}

export const PigmentContainerStickerModal: React.FC<PigmentContainerStickerModalProps> = ({
    isOpen,
    onClose,
    order
}) => {
    const { addToast } = useUIStore();
    const [copiedZpl, setCopiedZpl] = useState(false);
    const [selectedPigment, setSelectedPigment] = useState<string | null>(null);

    if (!isOpen || !order) return null;

    // Calculate deducted and remaining balances for each pigment in formula
    const containerItems: ContainerBalanceItem[] = Object.entries(order.formula)
        .filter(([code]) => code !== 'Error')
        .map(([code, qtyStr]) => {
            const usedGrams = parseFloat(qtyStr) || 1.0;
            // Default initial container size: 1000g (or 500g for small components)
            const initialGrams = usedGrams > 200 ? 2000 : 1000;
            const remaining = Math.max(0, +(initialGrams - usedGrams).toFixed(2));
            
            return {
                pigmentCode: code,
                usedQtyStr: qtyStr,
                usedQtyGrams: usedGrams,
                initialQtyGrams: initialGrams,
                remainingQtyGrams: remaining,
                containerLot: `LOT-PIG-${code}-${order.id}`
            };
        });

    const activeItem = containerItems.find(item => item.pigmentCode === selectedPigment) || containerItems[0];

    const generateQrPayload = (item: ContainerBalanceItem) => JSON.stringify({
        pigmentSku: `PIGMENT-${item.pigmentCode}`,
        remainingGrams: item.remainingQtyGrams,
        lastUsedOrder: order.id,
        formulaColor: order.colorId,
        lot: item.containerLot,
        date: new Date().toISOString().split('T')[0]
    });

    const getQrUrl = (item: ContainerBalanceItem) => 
        `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(generateQrPayload(item))}`;

    const handleDownloadPdfForContainer = (item: ContainerBalanceItem) => {
        // Landscape 110mm x 85mm Thermal Sticker
        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: [110, 85] });

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.8);
        doc.rect(3, 3, 104, 79);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('PROCOQUINAL S.A.S.', 6, 9.5);
        doc.setFontSize(7);
        doc.text('RE-ETIQUETADO DE ENVASE / SALDO PIGMENTO', 6, 13.5);
        doc.line(6, 15, 68, 15);

        // Pigment Name & Balance
        doc.setFontSize(14);
        doc.text(`PIGMENTO: ${item.pigmentCode}`, 6, 22);

        doc.setFontSize(11);
        doc.text(`NUEVO SALDO: ${item.remainingQtyGrams} g`, 6, 28);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`Cantidad Usada: -${item.usedQtyGrams} g (Orden ${order.id})`, 6, 33);
        doc.text(`Fórmula Preparada: ${order.colorId}`, 6, 37);
        doc.text(`Lote Envase: ${item.containerLot}`, 6, 41);

        // QR Code Image on Right side (36mm x 36mm)
        try {
            doc.addImage(getQrUrl(item), 'PNG', 70, 5, 36, 36);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.4);
            doc.rect(70, 5, 36, 36);
        } catch (e) {
            console.warn('QR render error', e);
        }

        // Additional instructions box
        doc.line(6, 44, 104, 44);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.text('INSTRUCCIONES DE USO EN PLANTA:', 6, 48);
        doc.setFont('helvetica', 'normal');
        doc.text('• Escanear este QR antes de la siguiente dosificación para verificar saldo real.', 6, 52);
        doc.text('• Mantener el contenedor cerrado herméticamente y en lugar fresco.', 6, 56);

        // Footer Safety
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠ USO INDUSTRIAL - SUSTANCIA QUÍMICA RE-ENVASADA', 6, 77);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, 60, 77);

        doc.save(`Sticker_Saldo_Frasco_${item.pigmentCode}_${order.id}.pdf`);
        addToast({ title: 'Sticker PDF Descargado', message: `Etiqueta de saldo para el frasco ${item.pigmentCode} descargada.`, severity: 'SUCCESS' });
    };

    const handleDownloadAllStickersPdf = () => {
        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: [110, 85] });

        containerItems.forEach((item, idx) => {
            if (idx > 0) doc.addPage([110, 85], 'l');

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.8);
            doc.rect(3, 3, 104, 79);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('PROCOQUINAL S.A.S.', 6, 9.5);
            doc.setFontSize(7);
            doc.text('RE-ETIQUETADO DE ENVASE / SALDO PIGMENTO', 6, 13.5);
            doc.line(6, 15, 68, 15);

            doc.setFontSize(14);
            doc.text(`PIGMENTO: ${item.pigmentCode}`, 6, 22);

            doc.setFontSize(11);
            doc.text(`NUEVO SALDO: ${item.remainingQtyGrams} g`, 6, 28);

            doc.setFontSize(7.5);
            doc.setFont('helvetica', 'normal');
            doc.text(`Cantidad Usada: -${item.usedQtyGrams} g (Orden ${order.id})`, 6, 33);
            doc.text(`Fórmula Preparada: ${order.colorId}`, 6, 37);
            doc.text(`Lote Envase: ${item.containerLot}`, 6, 41);

            try {
                doc.addImage(getQrUrl(item), 'PNG', 70, 5, 36, 36);
                doc.setDrawColor(0, 0, 0);
                doc.setLineWidth(0.4);
                doc.rect(70, 5, 36, 36);
            } catch (e) {}

            doc.line(6, 44, 104, 44);
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'bold');
            doc.text('INSTRUCCIONES DE USO EN PLANTA:', 6, 48);
            doc.setFont('helvetica', 'normal');
            doc.text('• Escanear este QR antes de la siguiente dosificación para verificar saldo real.', 6, 52);
            doc.text('• Mantener el contenedor cerrado herméticamente y en lugar fresco.', 6, 56);

            doc.setFontSize(6);
            doc.setFont('helvetica', 'bold');
            doc.text('⚠ USO INDUSTRIAL - SUSTANCIA QUÍMICA RE-ENVASADA', 6, 77);
            doc.setFont('helvetica', 'normal');
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`, 60, 77);
        });

        doc.save(`Stickers_Saldos_Frascos_${order.id}.pdf`);
        addToast({ title: 'Stickers de Frascos Generados', message: `Descargadas ${containerItems.length} etiquetas térmicas de saldos de envases.`, severity: 'SUCCESS' });
    };

    const handleCopyZpl = (item: ContainerBalanceItem) => {
        const zpl = `^XA
^PW880
^LL680
^FO20,20^GB840,640,4^FS
^FO40,40^A0N,46,46^FDPROCOQUINAL S.A.S.^FS
^FO40,95^A0N,36,36^FDPIGMENTO: ${item.pigmentCode}^FS
^FO40,145^A0N,32,32^FDNUEVO SALDO: ${item.remainingQtyGrams} g^FS
^FO40,195^A0N,22,22^FDDESCUENTO: -${item.usedQtyGrams} g (MEZCLA ${order.id})^FS
^FO40,230^A0N,22,22^FDFORMULA: ${order.colorId}^FS
^FO40,265^A0N,20,20^FDLOTE: ${item.containerLot}^FS
^FO550,40^BQN,2,9^FDQA,${generateQrPayload(item)}^FS
^FO40,620^A0N,20,20^FDINFLAMABLE - CONTROL DE SALDOS EN PLANTA^FS
^XZ`;
        navigator.clipboard.writeText(zpl);
        setCopiedZpl(true);
        addToast({ title: 'ZPL Copiado', message: `Código ZPL para el frasco de ${item.pigmentCode} copiado al portapapeles.`, severity: 'SUCCESS' });
        setTimeout(() => setCopiedZpl(false), 3000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col text-white"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                                <Tag className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Stickers de Saldos para Envases / Frascos</h3>
                                <p className="text-xs text-slate-400">Re-Etiquetado con QR de Trazabilidad para {containerItems.length} pigmento(s) en la Orden {order.id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                        {/* Selector Tabs for active Pigment container */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {containerItems.map((item) => (
                                <button
                                    key={item.pigmentCode}
                                    onClick={() => setSelectedPigment(item.pigmentCode)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                                        activeItem.pigmentCode === item.pigmentCode
                                            ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                                >
                                    <Beaker className="w-3.5 h-3.5" />
                                    <span>{item.pigmentCode}</span>
                                    <span className="font-mono bg-slate-950/40 px-1.5 py-0.5 rounded text-[10px]">{item.remainingQtyGrams}g rest.</span>
                                </button>
                            ))}
                        </div>

                        {/* Thermal Sticker Preview Box for Active Pigment */}
                        <div className="bg-white text-black p-5 rounded-lg shadow-2xl border-4 border-black w-full max-w-xl mx-auto relative font-mono select-none">
                            <div className="border-2 border-black p-3 rounded">
                                <div className="flex justify-between items-stretch gap-3 mb-3 pb-3 border-b-2 border-black">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="border-b border-black pb-1">
                                            <h4 className="font-black text-xl tracking-tight uppercase font-sans leading-none">
                                                PROCOQUINAL S.A.S.
                                            </h4>
                                            <span className="text-[9px] font-sans font-extrabold text-black uppercase block mt-0.5">RE-ETIQUETADO DE ENVASE</span>
                                        </div>

                                        <div className="pt-1">
                                            <span className="text-[9px] text-slate-700 block font-sans font-bold uppercase">Pigmento:</span>
                                            <span className="text-xl font-black text-black leading-tight block tracking-tight font-sans">
                                                {activeItem.pigmentCode}
                                            </span>
                                        </div>

                                        <div className="text-[11px] font-sans pt-1 space-y-0.5">
                                            <p><span className="font-bold uppercase text-[9px]">Nuevo Saldo Restante:</span> <span className="font-extrabold font-mono text-emerald-700">{activeItem.remainingQtyGrams} g</span></p>
                                            <p><span className="font-bold uppercase text-[9px]">Descontado:</span> <span className="font-bold font-mono">-{activeItem.usedQtyGrams} g</span></p>
                                            <p className="truncate"><span className="font-bold uppercase text-[9px]">Mezcla Origen:</span> <span className="font-extrabold">{order.colorId} ({order.id})</span></p>
                                        </div>
                                    </div>

                                    {/* Giant QR Code Block */}
                                    <div className="w-40 h-40 shrink-0 flex items-center justify-center border-2 border-black p-1 bg-white rounded self-center">
                                        <img src={getQrUrl(activeItem)} alt="QR Code Envase" className="w-full h-full object-contain bg-white" />
                                    </div>
                                </div>

                                <div className="text-[10px] font-bold text-black border-t border-black pt-1 flex justify-between items-center font-sans">
                                    <span>⚠ SUSTANCIA QUÍMICA EN RE-USO</span>
                                    <span className="text-[9px] font-mono">{new Date().toLocaleDateString('es-CO')}</span>
                                </div>
                            </div>
                        </div>

                        {/* List Summary of all Containers */}
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumen de Envases a Re-Etiquetar ({containerItems.length})</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {containerItems.map(item => (
                                    <div key={item.pigmentCode} className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-white block">{item.pigmentCode}</span>
                                            <span className="text-[11px] text-slate-400 block font-mono">Lote: {item.containerLot}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-emerald-400 font-mono block">{item.remainingQtyGrams} g rest.</span>
                                            <span className="text-[10px] text-rose-400 font-mono block">-{item.usedQtyGrams} g</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-wrap justify-between items-center gap-3">
                        <button
                            onClick={() => handleCopyZpl(activeItem)}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            {copiedZpl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            ZPL Sticker ({activeItem.pigmentCode})
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDownloadPdfForContainer(activeItem)}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Download className="w-4 h-4 text-amber-400" />
                                Sticker ({activeItem.pigmentCode})
                            </button>
                            <button
                                onClick={handleDownloadAllStickersPdf}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir Todos los Stickers ({containerItems.length} Envases)
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
