import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    CheckCircle2, Link2, Search, Check, FileWarning, Fingerprint, Tags, Beaker,
    UploadCloud, Wand2, ArrowRight, FileSpreadsheet, Database
} from 'lucide-react';
import { DataAuditGrid, AuditRow } from './DataAuditGrid';

type WizardStep = 'upload' | 'mapping' | 'validation' | 'success';

import { DEFAULT_SETTINGS } from '../constants';
import { SystemSettings } from '../types';

// Simulación de columnas extraídas del archivo "Sucio"
const RAW_COLUMNS = [
    { id: 'c1', header: 'Documento', sample: 'FAC-80921' },
    { id: 'c2', header: 'Fecha', sample: '2024-03-12' },
    { id: 'c3', header: 'Descripción', sample: 'TXS 5900 CATALIZADOR FENIX 1/4' },
    { id: 'c4', header: 'Cant_Pedida', sample: '20' },
    { id: 'c5', header: 'Precio_Total', sample: '850.50' }
];

const AVALON_FIELDS = [
    { id: 'traceId', label: 'Lote / TraceID', type: 'string', required: true, tooltip: 'Asegura trazabilidad del lote' },
    { id: 'sku', label: 'SKU Proveedor', type: 'string', required: true, tooltip: 'Limpiado por Regex' },
    { id: 'brand', label: 'Marca Origen', type: 'string', required: true, tooltip: 'ILVA, Barpimo, etc' },
    { id: 'uom', label: 'Und. Medida (Std)', type: 'string', required: true, tooltip: 'Gal, Lt, 1/4' },
    { id: 'qty', label: 'Cantidad', type: 'number', required: true, tooltip: 'Stock ingresado' },
    { id: 'unitCost', label: 'Costo Unitario ($)', type: 'number', required: true, tooltip: 'Calculado matemático' }
];

// Mock Result
interface ExtractedRow {
    rawDesc: string;
    rawDoc: string;
    traceId: string;
    originalSku: string;
    sku: string;
    brand: string;
    subCategory: string; // The semantic meaning computed from prefix
    uom: string;
    qty: number;
    unitCost: number;
    hasError: boolean;
    errorMsg?: string;
}

export const SmartDataMapper: React.FC = () => {
    const [step, setStep] = useState<WizardStep>('upload');
    const [fileStats, setFileStats] = useState({ name: '', rows: 0 });
    
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [isSimulatingAI, setIsSimulatingAI] = useState(false);
    const [extractedData, setExtractedData] = useState<AuditRow[]>([]);
    
    const [settings, setSettings] = React.useState<SystemSettings>(DEFAULT_SETTINGS);

    const handleUpdateRow = (index: number, updatedRow: AuditRow) => {
        setExtractedData(prev => {
            const newData = [...prev];
            newData[index] = updatedRow;
            return newData;
        });
    };

    React.useEffect(() => {
        const saved = localStorage.getItem('procoquinal_settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    // --- Actions ---
    const handleSimulateUpload = () => {
        setFileStats({ name: 'Reporte_Ventas_Quimicos_Sucio.csv', rows: 840 });
        setStep('mapping');
    };

    const handleAutoMapAI = () => {
        setIsSimulatingAI(true);
        setTimeout(() => {
            setMapping({
                traceId: 'c1',
                sku: 'c3', // Mapped to Desc, will be stripped
                brand: 'c3',
                uom: 'c3', 
                qty: 'c4',
                unitCost: 'c5' // Total price divided by Qty later
            });
            setIsSimulatingAI(false);
        }, 1200);
    };

    const handleValidation = () => {
        // Simular ejecución del motor Procoquinal ETL
        const rawMocks = [
            { doc: 'FAC-80921', desc: 'TXS 5900 CATALIZADOR FENIX 1/4', qty: 50, cost: 850.50 },
            { doc: 'FAC-80922', desc: 'PINTURA BARPIMO MOD-TVA BLANCO LT', qty: 100, cost: 1200.00 }, // Collision test, should be Barpimo not ILVA
            { doc: 'FAC-80923', desc: 'IME 200 BASE TRANSPARENTE GL', qty: 'N/A', cost: 450.00 }, // Error test
            { doc: 'FAC-80924', desc: 'A-4050 TINTE MADERA', qty: 25, cost: 300.00 }
        ];

        const processed: ExtractedRow[] = rawMocks.map((r, idx) => {
            let brand = 'NO_DETECTADA';
            let originalSku = 'INDEFINIDO';
            let sku = 'INDEFINIDO';
            let uom = 'UN (Fallback)';
            let subCategory = 'General';
            let hasError = false;
            let errorMsg = '';

            // Compilar reglas dinámicamente desde Settings
            const dynamicVendorRules = settings.formulation.vendorRules.map(r => ({
                brand: r.brand,
                prefixRules: r.prefixRules.map(p => ({
                    regex: new RegExp(`\\b(${p.prefix})\\w*\\b`, 'i'),
                    meaning: p.meaning,
                    prefix: p.prefix
                })),
                category: r.categoryName
            }));

            // 1. Detect Brand, SKU and Semantic Category
            for (const vendor of dynamicVendorRules) {
                for (const pRule of vendor.prefixRules) {
                    const match = r.desc.match(pRule.regex);
                    if (match) {
                        brand = vendor.brand;
                        subCategory = pRule.meaning;
                        originalSku = match[0];

                        // Strict collision handling for BARPIMO
                        if (r.desc.toUpperCase().includes('BARPIMO') && brand !== 'Barpimo') {
                            const barpimoVendor = dynamicVendorRules.find(v => v.brand === 'Barpimo');
                            if (barpimoVendor) {
                                for (const bp of barpimoVendor.prefixRules) {
                                    const bpMatch = r.desc.match(bp.regex);
                                    if (bpMatch) {
                                        brand = 'Barpimo';
                                        originalSku = bpMatch[0];
                                        subCategory = bp.meaning;
                                        // Aplicar patrón Global con Separador
                                        const tokens = settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || [];
                                        sku = tokens.map(t => {
                                            if (t === '[BRAND]') return brand;
                                            if (t === '[PREFIX]') return bp.prefix;
                                            if (t === '[ORIGINAL]') return originalSku;
                                            if (t === '[MEANING]') return subCategory;
                                            return '';
                                        }).filter(v => v).join(settings.formulation.skuSeparator);
                                        break;
                                    }
                                }
                            }
                            // Aplicar patrón Global estándar con Separador
                            const tokens = settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || [];
                            sku = tokens.map(t => {
                                if (t === '[BRAND]') return brand;
                                if (t === '[PREFIX]') return pRule.prefix;
                                if (t === '[ORIGINAL]') return originalSku;
                                if (t === '[MEANING]') return subCategory;
                                return '';
                            }).filter(v => v).join(settings.formulation.skuSeparator);
                        }

                        // Final cleanup
                        sku = sku.toUpperCase();
                        break;
                    }
                }
                if (brand !== 'NO_DETECTADA') break;
            }

            // Compilar reglas dinámicas de UOM
            const dynamicUomRules = settings.formulation.uomRules.map(r => ({
                std: r.std,
                regex: new RegExp(`\\b(${r.regexTags.join('|')})\\b`, 'i')
            }));

            // 2. Detect UOM
            for (const uRule of dynamicUomRules) {
                if (r.desc.match(uRule.regex)) {
                    uom = uRule.std;
                    break;
                }
            }

            // 3. Validation and Math
            const qtyNum = Number(r.qty);
            if (isNaN(qtyNum)) {
                hasError = true;
                errorMsg = `TYPE_ERROR: '${r.qty}' no es número`;
            }

            return {
                rawDesc: r.desc,
                rawDoc: r.doc,
                traceId: `TRC-${r.doc}-${idx}`,
                originalSku,
                sku,
                brand,
                subCategory,
                uom,
                qty: isNaN(qtyNum) ? 0 : qtyNum,
                unitCost: isNaN(qtyNum) || qtyNum === 0 ? 0 : Number((r.cost / qtyNum).toFixed(2)),
                hasError,
                errorMsg
            };
        });

        setExtractedData(processed);
        setStep('validation');
    };

    // --- Sub-Renders ---
    const renderUpload = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-2">Motor ETL Procoquinal</h2>
            <p className="text-slate-500 mb-8 text-center">Sube el reporte sucio de ventas/compras. El motor detectará automáticamente marcas (ILVA, Carpoly, Barpimo), limpiará SKUs y extraerá Lotes.</p>
            
            <div 
                className="w-full h-80 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center cursor-pointer group hover:border-indigo-400 shadow-sm"
                onClick={handleSimulateUpload}
            >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200/50 mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 text-indigo-500" />
                </div>
                <div className="text-xl font-bold text-slate-700">Arrastra tu reporte de compras aquí</div>
                <div className="text-sm font-medium text-slate-500 mt-2">Soporta formatos sucios del proveedor para limpieza inteligente.</div>
            </div>
        </div>
    );

    const renderMapping = () => (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Wand2 className="w-6 h-6 text-indigo-600" />
                        Mapeo Nodal (ILVA / Carpoly / Barpimo Engine)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Archivo cargado: <span className="font-bold text-slate-700">{fileStats.name}</span>
                    </p>
                </div>
                {!Object.keys(mapping).length ? (
                    <button 
                        onClick={handleAutoMapAI}
                        disabled={isSimulatingAI}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-lg flex items-center transition-all hover:scale-105"
                    >
                        {isSimulatingAI ? 'Inyectando Expresiones...' : 'Asignación Automática'}
                    </button>
                ) : (
                    <button 
                        onClick={handleValidation}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg flex items-center transition"
                    >
                        Ejecutar Pipeline <ArrowRight className="w-5 h-5 ml-3" />
                    </button>
                )}
            </div>

            <div className="flex gap-8 flex-1 overflow-hidden">
                {/* Avalon Schema */}
                <div className="w-1/2 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700 flex items-center justify-between">
                        <span>Schema Estricto (Procoquinal)</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {AVALON_FIELDS.map(field => {
                            const mappedRawId = mapping[field.id];
                            return (
                                <div key={field.id} className={`p-4 rounded-xl border ${mappedRawId ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{field.label}</span>
                                            <span className="text-[10px] text-slate-500">{field.tooltip}</span>
                                        </div>
                                        {mappedRawId && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                    </div>
                                    <div className="relative">
                                        <select 
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg py-2.5 px-3 appearance-none focus:ring-2 focus:ring-indigo-500"
                                            value={mappedRawId || ""}
                                            onChange={(e) => setMapping(prev => ({...prev, [field.id]: e.target.value}))}
                                        >
                                            <option value="" disabled>Selecciona columna origen...</option>
                                            {RAW_COLUMNS.map(r => (
                                                <option key={r.id} value={r.id}>{r.header}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Raw Input */}
                <div className="w-1/2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden text-slate-300">
                   <div className="p-4 border-b border-slate-800 font-bold text-white flex items-center">
                        <FileSpreadsheet className="w-5 h-5 mr-3 text-indigo-400" /> Datos Crudos del Proveedor
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {RAW_COLUMNS.map(raw => {
                            const isUsed = Object.values(mapping).includes(raw.id);
                            return (
                                <div key={raw.id} className={`p-4 rounded-lg border ${isUsed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-800/50'}`}>
                                    <div className={`font-mono text-sm ${isUsed ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>"{raw.header}"</div>
                                    <div className="text-xs text-slate-400 mt-2 bg-black/20 p-2 rounded">
                                        Ej: <span className="text-slate-200">{raw.sample}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderValidation = () => {
        const errorCount = extractedData.filter(d => d.hasError).length;

        return (
            <div className="flex-1 flex flex-col h-full">
                <div className="text-center max-w-3xl mx-auto mb-6 animate-in slide-in-from-bottom-4">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Auditoría de Reconciliación (Excel Light)</h2>
                    <p className="text-slate-500 text-sm">
                        Compara el dato <strong>Origen</strong> contra el mapeo de <strong>Avalon</strong>. 
                        Puedes corregir SKUs, Familias o Cantidades directamente en la grilla antes del ingreso final.
                        <strong> {errorCount} Errores detectados.</strong>
                    </p>
                </div>

                <div className="flex-1 min-h-0 mb-6">
                    <DataAuditGrid data={extractedData} onUpdateRow={handleUpdateRow} />
                </div>

                <div className="flex justify-end p-4 bg-slate-900 rounded-2xl shadow-xl mt-auto items-center gap-6">
                    <div className="text-slate-400 text-xs flex items-center gap-2">
                        <BadgeCheck className="text-emerald-400" size={16}/>
                        Datos verificados por Audit-Grid
                    </div>
                    <button onClick={() => setStep('success')} className="px-8 py-3 bg-indigo-500 text-white font-black rounded-lg shadow-lg hover:scale-105 transition-all flex items-center">
                        <Database className="w-5 h-5 mr-3" />
                        Confirmar e Inyectar al Inventario
                    </button>
                </div>
            </div>
        );
    };

    const BadgeCheck: React.FC<{className?: string, size?: number}> = ({className, size}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
    );

    const renderSuccess = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
            <div className="w-32 h-32 relative mb-8">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-emerald-100 rounded-full flex items-center justify-center shadow-2xl">
                    <Check className="w-16 h-16 text-emerald-500" strokeWidth={3} />
                </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Ingesta Estructurada Completada</h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto">Materias primas (ILVA, Barpimo, Carpoly) inyectadas. Ahora puedes consumirlas en el Árbol de Producción.</p>
        </div>
    );

    return (
        <div className="p-4 md:p-8 flex flex-col h-full bg-slate-50">
            <div className="mb-6 flex items-center justify-between max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Pipeline (Ingesta MP)</h1>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avalon Enterprise</span>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={step} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        transition={{ duration: 0.2 }}
                        className="h-full flex flex-col"
                    >
                        {step === 'upload' && renderUpload()}
                        {step === 'mapping' && renderMapping()}
                        {step === 'validation' && renderValidation()}
                        {step === 'success' && renderSuccess()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
