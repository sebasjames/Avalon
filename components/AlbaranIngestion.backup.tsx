import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { processInvoicesWithGemini, InvoiceExtractionResult } from '../services/geminiService';
import { DataAuditGrid, AuditRow } from './DataAuditGrid';
import { RawExtractionView } from './RawExtractionView';
import { LandedCostCompendium } from './LandedCostCompendium';
import { useEnterprise } from '../context/EnterpriseContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { INVENTORY_DATA } from '../constants';
import { InboundReceipt, InboundReceiptItem } from '../types';

export const AlbaranIngestion: React.FC = () => {
    const { processInboundReceipt } = useEnterprise();
    const [dragActive, setDragActive] = useState(false);
    const [phase, setPhase] = useState<'upload' | 'extracting' | 'raw_review' | 'audit'>('upload');
    const [auditData, setAuditData] = useState<AuditRow[] | null>(null);
    const [rawResult, setRawResult] = useState<InvoiceExtractionResult | null>(null);
    const [documentNumber, setDocumentNumber] = useState<string>('');
    const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
    const [trm, setTrm] = useState<number>(4920);
    const [colchon, setColchon] = useState<number>(2600);
    const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const [showApiModal, setShowApiModal] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const CHECKPOINTS = [
        "Extracción de Texto (OCR)",
        "Armar Base (FOB y Kilos)",
        "Fijar TRM del Viaje",
        "Cacería y Deduplicación de Gastos",
        "Hallar Factor de Prorrateo",
        "Saneamiento y Costeo Unitario",
        "Veredicto Final"
    ];

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFiles = async (fileList: FileList | File[]) => {
        setPhase('extracting');
        const files = Array.from(fileList);
        
        // Iniciamos en el paso 0: OCR
        setCurrentCheckpoint(0);
        let intelligenceInterval: NodeJS.Timeout;

        try {
            const fileDataArray = [];
            for (const file of files) {
                const base64Data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const base64Url = e.target?.result as string;
                        resolve(base64Url.split(',')[1]);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                fileDataArray.push({ data: base64Data, mimeType: file.type, name: file.name });
            }

            const result = await processInvoicesWithGemini(fileDataArray, INVENTORY_DATA, (msg) => {
                setLoadingText(msg);
                if (msg.startsWith("Consolidando")) {
                    // Terminó el OCR, empieza la consolidación. 
                    // Avanzamos artificialmente por los pasos 1, 2 y 3 mientras esperamos a Gemini.
                    setCurrentCheckpoint(1);
                    intelligenceInterval = setInterval(() => {
                        setCurrentCheckpoint(prev => (prev < 3 ? prev + 1 : prev));
                    }, 4000);
                }
            });
            
            clearInterval(intelligenceInterval!);

            // Phase 2: AI returned! Quickly check off the math steps (4, 5, 6)
            for (let i = 4; i <= 6; i++) {
                setCurrentCheckpoint(i);
                await new Promise(resolve => setTimeout(resolve, 600)); // 600ms per step
            }
            
            setRawResult(result);
            
            if (result?.metadata?.doNumber) {
                setDocumentNumber(result.metadata.doNumber);
            } else if (result?.metadata?.invoiceNumbers && result.metadata.invoiceNumbers.length > 0) {
                setDocumentNumber(result.metadata.invoiceNumbers[0]);
            }

            if (result?.metadata?.currency === 'EUR' || result?.metadata?.currency === 'USD') {
                setCurrency(result.metadata.currency);
            }

            setPhase('raw_review');
            
        } catch (error: any) {
            console.error(error);
            if (intelligenceInterval!) clearInterval(intelligenceInterval);
            
            if (error.message === 'MISSING_API_KEY') {
                setShowApiModal(true);
            } else {
                alert(`Error procesando los documentos: ${error.message || "Error desconocido"}`);
            }
            
            setPhase('upload');
        }
    };

    const handleContinueToAudit = () => {
        if (!rawResult) return;
        
        const mappedAuditData: AuditRow[] = rawResult.products.map((p, idx) => ({
            rawDesc: p.rawName,
            rawDoc: documentNumber,
            traceId: `TRC-${idx}`,
            originalSku: p.rawSku,
            sku: p.mappedSku,
            brand: 'Extracto IA',
            subCategory: 'Categoría Auto',
            uom: 'Unidad',
            qty: p.qty,
            kgPerUnit: 25, 
            unitCost: p.cost,
            hasError: p.status === 'ERROR'
        }));
        
        setAuditData(mappedAuditData);
        setPhase('audit');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
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
            packages: 0,
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
        setRawResult(null);
        setDocumentNumber('');
        setPhase('upload');
        alert("Albarán procesado y stock actualizado correctamente.");
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ingesta de Albaranes</h1>
                <p className="text-slate-500 mt-2">Carga documentos escaneados o facturas FOB para extraer automáticamente y recalcular costos de importación reales.</p>
            </div>

            <div className="bg-white border border-indigo-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">Divisa de Facturación</label>
                    <select 
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR')}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full max-w-[200px] outline-none focus:border-indigo-500 font-bold text-slate-800 text-lg appearance-none cursor-pointer"
                    >
                        <option value="USD">Dólares (USD)</option>
                        <option value="EUR">Euros (EUR)</option>
                    </select>
                </div>
                <div className="w-px bg-slate-200 hidden md:block"></div>
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">TRM Pactada ({currency}/COP)</label>
                    <div className="flex items-center gap-2">
                        <span className="text-indigo-600 font-black">$</span>
                        <input 
                            type="number"
                            value={trm}
                            onChange={(e) => setTrm(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full max-w-[200px] outline-none focus:border-indigo-500 font-bold text-slate-800 text-lg"
                        />
                    </div>
                </div>
                <div className="w-px bg-slate-200 hidden md:block"></div>
                <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">Factor Colchón (Costos Extra / Kg)</label>
                    <div className="flex items-center gap-2">
                        <span className="text-rose-500 font-black">$</span>
                        <input 
                            type="number"
                            value={colchon}
                            onChange={(e) => setColchon(Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-full max-w-[200px] outline-none focus:border-rose-500 font-bold text-slate-800 text-lg"
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'upload' && (
                    <motion.div 
                        key="upload"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                            dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-300 hover:border-indigo-400 bg-white"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleChange} />
                        <UploadCloud className="w-16 h-16 text-indigo-400 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Arrastra tus documentos aquí</h3>
                        <p className="text-slate-500 text-sm mt-1">Selecciona uno o múltiples PDFs / Imágenes</p>
                    </motion.div>
                )}

                {/* 2. EXTRACTING PHASE (CHECKPOINTS UI) */}
                {phase === 'extracting' && (
                    <motion.div
                        key="extracting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center py-16 px-4"
                    >
                        <RefreshCw className="text-indigo-500 w-12 h-12 mb-6 animate-spin" />
                        <h2 className="text-2xl font-black text-slate-800 mb-8">Auditoría en Curso</h2>
                        
                        <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="space-y-4">
                                {CHECKPOINTS.map((stepName, idx) => {
                                    const isCompleted = currentCheckpoint > idx;
                                    const isActive = currentCheckpoint === idx;
                                    const isPending = currentCheckpoint < idx;

                                    return (
                                        <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50/50 border border-indigo-100' : 'border border-transparent'}`}>
                                            <div className="flex-shrink-0">
                                                {isCompleted ? (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    </div>
                                                ) : isActive ? (
                                                    <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-bold ${isCompleted ? 'text-emerald-700' : isActive ? 'text-indigo-700' : 'text-slate-400'}`}>
                                                    {idx + 1}. {stepName}
                                                </span>
                                                {isActive && (idx === 0 || idx === 3) && loadingText && (
                                                    <p className="text-xs text-indigo-500 mt-1 font-medium animate-pulse">{loadingText}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'raw_review' && rawResult && (
                    <motion.div key="raw_review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <RawExtractionView 
                            data={rawResult} 
                            onContinue={handleContinueToAudit} 
                        />
                    </motion.div>
                )}

                {phase === 'audit' && auditData && (
                    <motion.div 
                        key="audit"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                                <div>
                                    <h3 className="font-bold text-slate-800">Cruce Inteligente Completado</h3>
                                    <p className="text-sm text-slate-500">Se asociaron {auditData.length} líneas de producto con el catálogo</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase">DO / Albarán</label>
                                    <input 
                                        type="text" 
                                        value={documentNumber}
                                        onChange={(e) => setDocumentNumber(e.target.value)}
                                        className="border-b-2 border-slate-200 focus:border-indigo-500 outline-none font-mono text-slate-800 py-1"
                                        placeholder="Nº DO"
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
                            <DataAuditGrid 
                                data={auditData} 
                                onUpdateRow={handleUpdateRow} 
                                trm={trm} 
                                colchon={colchon} 
                                currency={currency}
                            />
                        </div>

                        {/* Landed Cost Compendium */}
                        {rawResult && (
                            <LandedCostCompendium 
                                auditData={auditData}
                                landedCosts={rawResult.landedCosts}
                                trm={trm}
                                colchonEstimado={colchon}
                                currency={currency}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de API Key Faltante */}
            <AnimatePresence>
                {showApiModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-rose-100"
                        >
                            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Faltando API de Inteligencia</h2>
                            
                            <p className="text-slate-500 text-center mb-8">
                                Avalon requiere una clave de acceso (API Key) a Gemini 1.5 Pro para ejecutar el cruce contable. El filtro de seguridad simulado ha sido desactivado.
                            </p>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowApiModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <Link 
                                    to="/configuracion"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-center"
                                >
                                    Configurar API
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
