import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, RefreshCw } from 'lucide-react';
import { DataAuditGrid, AuditRow } from './DataAuditGrid';
import { RawExtractionView } from './RawExtractionView';
import { LandedCostCompendium } from './LandedCostCompendium';
import { useEnterprise } from '../context/EnterpriseContext';
import { motion, AnimatePresence } from 'framer-motion';
import { INVENTORY_DATA } from '../constants';
import { InboundReceipt, InboundReceiptItem } from '../types';
import { processExcelIngestion } from '../services/excelIngestionService';
import { InvoiceExtractionResult } from '../services/geminiService';

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
    const inputRef = useRef<HTMLInputElement>(null);

    const CHECKPOINTS = [
        "Mapeando estructura del proveedor con IA",
        "Extrayendo Productos y Cantidades",
        "Extrayendo Costos FOB y Gastos",
        "Procesamiento Finalizado"
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
        const file = fileList[0]; // We only process one Excel file
        
        setCurrentCheckpoint(0);

        try {
            const result = await processExcelIngestion(file, INVENTORY_DATA, (msg) => {
                setLoadingText(msg);
                if (msg.includes("productos")) setCurrentCheckpoint(1);
                if (msg.includes("FOB")) setCurrentCheckpoint(2);
                if (msg.includes("finalizada")) setCurrentCheckpoint(3);
            });
            
            setRawResult(result);
            
            if (result?.metadata?.currency === 'EUR' || result?.metadata?.currency === 'USD') {
                setCurrency(result.metadata.currency as 'EUR' | 'USD');
            }
            if (result?.metadata?.estimatedTRM) {
                setTrm(result.metadata.estimatedTRM);
            }
            
            const extractedColchonStr = result.metadata.discrepancies.find(d => d.startsWith('Colchón extraído:'));
            if (extractedColchonStr) {
                 setColchon(parseFloat(extractedColchonStr.split(':')[1].trim()));
            }

            setPhase('raw_review');
            
        } catch (error: any) {
            console.error(error);
            alert(`Error procesando el Excel: ${error.message || "Error desconocido"}`);
            setPhase('upload');
        }
    };

    const handleContinueToAudit = () => {
        if (!rawResult) return;
        
        const mappedAuditData: AuditRow[] = rawResult.products.map((p, idx) => ({
            rawDesc: p.rawName,
            rawDoc: documentNumber || 'Excel Upload',
            traceId: `TRC-${idx}`,
            originalSku: p.rawSku,
            sku: p.mappedSku,
            brand: 'Extracto Excel',
            subCategory: 'Categoría',
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
            status: 'TRANSITO'
        };

        processInboundReceipt(receipt);
        setAuditData(null);
        setRawResult(null);
        setDocumentNumber('');
        setPhase('upload');
        alert("Albarán procesado. La mercancía ha sido enviada al Inventario en Tránsito para su distribución.");
    };

    return (
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ingesta de Albaranes</h1>
                <p className="text-slate-500 mt-2">Carga tu archivo Excel para extraer automáticamente productos, costos FOB y gastos de importación reales.</p>
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
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">TRM Extraída/Pactada ({currency}/COP)</label>
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
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">Factor Colchón / Kilo</label>
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
                        <input ref={inputRef} type="file" accept=".xlsx, .xls" className="hidden" onChange={handleChange} />
                        <UploadCloud className="w-16 h-16 text-indigo-400 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Arrastra tu archivo Excel aquí</h3>
                        <p className="text-slate-500 text-sm mt-1">Soporta formatos .xlsx o .xls</p>
                    </motion.div>
                )}

                {/* 2. EXTRACTING PHASE */}
                {phase === 'extracting' && (
                    <motion.div
                        key="extracting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center py-16 px-4"
                    >
                        <RefreshCw className="text-indigo-500 w-12 h-12 mb-6 animate-spin" />
                        <h2 className="text-2xl font-black text-slate-800 mb-8">Procesando Hoja de Cálculo</h2>
                        
                        <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <div className="space-y-4">
                                {CHECKPOINTS.map((stepName, idx) => {
                                    const isCompleted = currentCheckpoint > idx;
                                    const isActive = currentCheckpoint === idx;

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
                                                {isActive && loadingText && (
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
                                    <h3 className="font-bold text-slate-800">Lectura de Excel Completada</h3>
                                    <p className="text-sm text-slate-500">Se extrajeron {auditData.length} líneas de producto desde el archivo.</p>
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
                                    Confirmar y Enviar a Tránsito
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
        </div>
    );
};
