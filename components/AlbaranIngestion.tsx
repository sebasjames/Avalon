import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { parseAlbaranImage } from '../services/geminiService';
import { DataAuditGrid, AuditRow } from './DataAuditGrid';
import { useEnterprise } from '../context/EnterpriseContext';
import { InboundReceipt, InboundReceiptItem } from '../types';
import { motion } from 'framer-motion';

export const AlbaranIngestion: React.FC = () => {
    const { processInboundReceipt } = useEnterprise();
    const [dragActive, setDragActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [auditData, setAuditData] = useState<AuditRow[] | null>(null);
    const [documentNumber, setDocumentNumber] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Url = e.target?.result as string;
                const base64Data = base64Url.split(',')[1];
                
                try {
                    const parsedData = await parseAlbaranImage(base64Data, file.type);
                    setAuditData(parsedData);
                    // Extract doc number from first row if available
                    if (parsedData.length > 0 && parsedData[0].rawDoc) {
                        setDocumentNumber(parsedData[0].rawDoc);
                    }
                } catch (err) {
                    console.error(err);
                    alert("Error procesando la imagen con IA.");
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleUpdateRow = (index: number, updatedRow: AuditRow) => {
        if (!auditData) return;
        const newData = [...auditData];
        newData[index] = updatedRow;
        setAuditData(newData);
    };

    const handleSave = () => {
        if (!auditData) return;
        
        const docNum = documentNumber || `ALB-${Date.now()}`;
        
        const receiptItems: InboundReceiptItem[] = auditData.map(row => ({
            sku: row.sku || row.originalSku,
            description: row.rawDesc,
            packages: 0, // Not explicitly in AuditRow, but could be derived from rawDesc
            capacity: row.uom,
            totalLiters: row.qty,
            unitCost: row.unitCost
        }));

        const receipt: InboundReceipt = {
            id: `RCPT-${Date.now()}`,
            documentNumber: docNum,
            dateIn: new Date().toISOString(),
            items: receiptItems,
            status: 'PROCESSED'
        };

        processInboundReceipt(receipt);
        setAuditData(null);
        setDocumentNumber('');
        alert("Albarán procesado y stock actualizado correctamente.");
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ingesta de Albaranes</h1>
                <p className="text-slate-500 mt-2">Carga documentos escaneados o fotos para extraer automáticamente referencias, cantidades y precios.</p>
            </div>

            {!auditData && !isProcessing && (
                <div 
                    className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                        dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-300 hover:border-indigo-400 bg-white"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input 
                        ref={inputRef}
                        type="file" 
                        accept="image/*,application/pdf"
                        className="hidden" 
                        onChange={handleChange}
                    />
                    <UploadCloud className="w-16 h-16 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Arrastra tu Albarán aquí</h3>
                    <p className="text-slate-500 text-sm mt-1">Soporta JPG, PNG, PDF</p>
                </div>
            )}

            {isProcessing && (
                <div className="border border-slate-200 bg-white rounded-xl p-12 flex flex-col items-center justify-center">
                    <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Extrayendo datos con IA...</h3>
                    <p className="text-slate-500 text-sm mt-1">Identificando SKUs, cantidades y costos unitarios</p>
                </div>
            )}

            {auditData && !isProcessing && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                            <div>
                                <h3 className="font-bold text-slate-800">Lectura Completada</h3>
                                <p className="text-sm text-slate-500">Se encontraron {auditData.length} líneas de producto</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase">Doc / Albarán</label>
                                <input 
                                    type="text" 
                                    value={documentNumber}
                                    onChange={(e) => setDocumentNumber(e.target.value)}
                                    className="border-b-2 border-slate-200 focus:border-indigo-500 outline-none font-mono text-slate-800 py-1"
                                    placeholder="Nº Albarán"
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                Confirmar y Actualizar Stock
                            </button>
                        </div>
                    </div>

                    <div className="h-[600px]">
                        <DataAuditGrid data={auditData} onUpdateRow={handleUpdateRow} />
                    </div>
                </motion.div>
            )}
        </div>
    );
};
