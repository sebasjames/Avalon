import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export interface AuditoriaTabProps {
    activeReport: any;
    runAuditAction: () => void;
    auditReports: any[];
    setSelectedReportId: (id: string) => void;
}

export const AuditoriaTab: React.FC<AuditoriaTabProps> = ({
    activeReport,
    runAuditAction,
    auditReports,
    setSelectedReportId
}) => {
    return (
                            <div className="space-y-6">
                                {/* Header / Current Run Info */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                                        <div>
                                            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Auto-Auditor Contable & Fiscal</div>
                                            <h2 className="text-xl font-bold text-slate-800 mt-1">Informe de Auditoría</h2>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Ejecución programada cada 24 horas. Último reporte: <span className="font-semibold text-slate-700">{new Date(activeReport.timestamp).toLocaleString()}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-black border ${
                                                activeReport.status === 'SUCCESS' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                    : activeReport.status === 'WARNING'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {activeReport.status === 'SUCCESS' && '✓ SIN ERRORES'}
                                                {activeReport.status === 'WARNING' && '⚠ ADVERTENCIA'}
                                                {activeReport.status === 'ERROR' && '✗ ERRORES DETECTADOS'}
                                            </span>
                                            <button 
                                                onClick={runAuditAction}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 animate-pulse"
                                            >
                                                Ejecutar Auditoría Ahora
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Report Results */}
                                    {activeReport.issues.length === 0 ? (
                                        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-4">
                                            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                                            <h3 className="text-lg font-bold text-emerald-900 mb-1">¡Felicidades! Todo en Orden</h3>
                                            <p className="text-sm text-emerald-700">
                                                No se encontraron discrepancias en el cruce de datos contables, impuestos, SKUs o datos fiscales de terceros. Listo para SIIGO.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Detalle de Incidencias Halladas ({activeReport.issues.length})</div>
                                            <div className="grid grid-cols-1 gap-3">
                                                {activeReport.issues.map((issue, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${
                                                            issue.severity === 'HIGH' 
                                                                ? 'bg-rose-50/40 border-rose-100' 
                                                                : 'bg-amber-50/30 border-amber-100'
                                                        }`}
                                                    >
                                                        <div className="mt-0.5">
                                                            <AlertTriangle className={`w-5 h-5 ${issue.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-slate-800">{issue.description}</span>
                                                                <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded ${
                                                                    issue.severity === 'HIGH' 
                                                                        ? 'bg-rose-100 text-rose-700' 
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                    {issue.severity === 'HIGH' ? 'Crítico' : 'Medio'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded">
                                                                    {issue.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{issue.details}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Historical Reports Log */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-4">Historial de Corridas de Auditoría (Últimos 24H / Días Previos)</h3>
                                    <div className="overflow-hidden border border-slate-100 rounded-xl">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3">ID Informe</th>
                                                    <th className="p-3">Fecha Corrida</th>
                                                    <th className="p-3">Hora de Ejecución</th>
                                                    <th className="p-3 text-center">Incidencias</th>
                                                    <th className="p-3">Resultado</th>
                                                    <th className="p-3 text-center">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                                {auditReports.map((report) => (
                                                    <tr 
                                                        key={report.id} 
                                                        className={`hover:bg-slate-50/50 transition-colors ${
                                                            activeReport.id === report.id ? 'bg-indigo-50/30' : ''
                                                        }`}
                                                    >
                                                        <td className="p-3 font-mono font-bold text-indigo-600">{report.id}</td>
                                                        <td className="p-3 font-semibold">{report.date}</td>
                                                        <td className="p-3 text-slate-500">{new Date(report.timestamp).toLocaleTimeString()}</td>
                                                        <td className="p-3 text-center font-bold text-slate-800">{report.issues.length}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                                report.status === 'SUCCESS' 
                                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                                    : report.status === 'WARNING'
                                                                        ? 'bg-amber-50 text-amber-700'
                                                                        : 'bg-rose-50 text-rose-700'
                                                            }`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button 
                                                                onClick={() => setSelectedReportId(report.id)}
                                                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-xs"
                                                            >
                                                                {activeReport.id === report.id ? 'Viendo Reporte' : 'Ver Detalles'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        
    );
};
