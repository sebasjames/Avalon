import React from 'react';
import { InvoiceExtractionResult } from '../services/geminiService';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Package, DollarSign, Activity } from 'lucide-react';

interface RawExtractionViewProps {
    data: InvoiceExtractionResult;
    onContinue: () => void;
}

export const RawExtractionView: React.FC<RawExtractionViewProps> = ({ data, onContinue }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <Activity className="text-indigo-500" />
                            Paso 1: Extracción en Bruto
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Estos son los datos literales que la IA pudo leer de los documentos aportados.</p>
                    </div>
                    <button 
                        onClick={onContinue}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                    >
                        Procesar y Cruzar
                        <ArrowRight size={18} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Documentos */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <FileText size={18} className="text-blue-500" />
                            Documentos Identificados
                        </h3>
                        <div className="space-y-3">
                            {data.extractedDocuments.map((doc, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                                    <div className="font-bold text-slate-800">{doc.docType}</div>
                                    <div className="text-xs text-slate-500">{doc.issuer} | {doc.docNumber}</div>
                                    <ul className="mt-2 space-y-1">
                                        {doc.keyExtractedData.map((kd, kIdx) => (
                                            <li key={kIdx} className="text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                                                {kd}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mercancía */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <Package size={18} className="text-indigo-500" />
                            Mercancía Cruda (FOB)
                        </h3>
                        <div className="space-y-3">
                            {data.products.map((prod, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                                    <div className="font-bold text-slate-800">{prod.rawName}</div>
                                    <div className="text-xs text-slate-500">SKU Original: {prod.rawSku}</div>
                                    <div className="mt-2 flex items-center justify-between bg-indigo-50/50 p-2 rounded">
                                        <div className="font-bold text-indigo-900">Cant: {prod.qty}</div>
                                        <div className="font-mono font-bold text-indigo-700">FOB {prod.cost}</div>
                                    </div>
                                    {prod.aiExplanation && (
                                        <div className="mt-2 text-[10px] text-slate-400">
                                            Origen: {prod.aiExplanation.baseCostOrigin}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Costos Logísticos */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                            <DollarSign size={18} className="text-rose-500" />
                            Costos Logísticos & Aduanas
                        </h3>
                        <div className="space-y-3">
                            {data.landedCosts.map((cost, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                                    <div className="font-bold text-slate-800">{cost.rawConcept}</div>
                                    <div className="text-xs text-slate-500">{cost.provider}</div>
                                    <div className="mt-2 flex items-center justify-between bg-rose-50 p-2 rounded">
                                        <span className="text-rose-900 text-xs">Monto Crudo</span>
                                        <span className="font-mono font-bold text-rose-700">${cost.rawAmount.toLocaleString()}</span>
                                    </div>
                                    {(cost.retefuenteAmount || cost.reteicaAmount) ? (
                                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 justify-end">
                                            {cost.retefuenteAmount > 0 && <span>RTE: -${cost.retefuenteAmount}</span>}
                                            {cost.reteicaAmount > 0 && <span>ICA: -${cost.reteicaAmount}</span>}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                            {data.landedCosts.length === 0 && (
                                <div className="text-sm text-slate-500 italic p-4 text-center">
                                    No se extrajeron costos adicionales en los documentos aportados.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
