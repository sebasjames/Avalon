import React from 'react';
import { FileSpreadsheet, Calendar, ArrowRight, Download } from 'lucide-react';

export interface ExportacionTabProps {
    handleExportSIIGO: () => void;
}

export const ExportacionTab: React.FC<ExportacionTabProps> = ({
    handleExportSIIGO
}) => {
    return (
                            <div className="max-w-2xl mx-auto mt-8">
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 text-white text-center">
                                        <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-90" />
                                        <h2 className="text-2xl font-black mb-2">Generador SIIGO Nube</h2>
                                        <p className="text-indigo-100">Descarga las plantillas en Excel con los formatos oficiales de la DIAN listas para importar.</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Rango de Exportación</label>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <input type="date" className="bg-transparent font-bold text-slate-700 outline-none w-full" defaultValue="2026-06-01" />
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-300" />
                                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <input type="date" className="bg-transparent font-bold text-slate-700 outline-none w-full" defaultValue="2026-06-30" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-slate-100 flex gap-4">
                                            <button 
                                                onClick={handleExportSIIGO}
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-5 h-5" />
                                                Generar Interfaces .XLSX
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        
    );
};
