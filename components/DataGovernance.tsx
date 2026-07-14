import React, { useState } from 'react';
import { 
    ShieldCheck, Database, AlertTriangle, FileDiff, 
    History, CheckCircle2, RefreshCw, XCircle, Search, 
    ArrowRightLeft, FileWarning
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { InventoryStatus, ABCClass } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';

export const DataGovernance: React.FC = () => {
    const { inventory } = useEnterprise();
    const [activeTab, setActiveTab] = useState<'quality' | 'reconciliation' | 'audit'>('quality');

    // --- 1. DATA QUALITY LOGIC ---

    // Check 1: Integrity (Header Stock vs Sum of Batches)
    const integrityIssues = inventory.map(item => {
        const batchSum = (item.batches || []).reduce((acc, b) => acc + b.quantity, 0);
        const diff = item.totalStock - batchSum;
        return {
            ...item,
            batchSum,
            diff,
            hasError: diff !== 0
        };
    }).filter(i => i.hasError);

    // Check 2: Misclassification (Silent items that are Class A, or Missing Costs)
    const classificationIssues = inventory.filter(item => {
        const isSilentButImportant = item.status === InventoryStatus.SILENT && item.abc === ABCClass.A;
        const missingCost = item.unitCost <= 0;
        return isSilentButImportant || missingCost;
    }).map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        issue: item.unitCost <= 0 ? 'Costo Cero/Faltante' : 'Incoherencia Estatus (Silencioso pero Clase A)',
        severity: 'HIGH'
    }));

    // Mock Data for "ERP vs BI" Discrepancies (Simulated)
    const erpDiffs = [
        { sku: 'RM-POLY-001', name: 'Resina de Polímero X-200', erpQty: 5000, biQty: 5000, variance: 0, lastSync: '10 min' },
        { sku: 'FG-COAT-550', name: 'Sellador Industrial Pro 550', erpQty: 860, biQty: 850, variance: -10, lastSync: '10 min' }, // Variance!
        { sku: 'RM-SOLV-099', name: 'Acetona Grado Técnico', erpQty: 12000, biQty: 12000, variance: 0, lastSync: '10 min' },
        { sku: 'FG-PRIM-200', name: 'Primer Universal Gris', erpQty: 2500, biQty: 2450, variance: -50, lastSync: '2 horas' }, // Variance!
    ].filter(i => i.variance !== 0);

    // Mock Audit Log
    const auditLog = [
        { id: 1, user: 'System', action: 'Sync ERP', details: 'Actualización masiva de stock', time: '10:00 AM', status: 'Success' },
        { id: 2, user: 'J. Perez', action: 'Manual Adjustment', details: 'Ajuste merma lote L-240101 (-15kg)', time: '09:45 AM', status: 'Warning' },
        { id: 3, user: 'M. Rodriguez', action: 'Status Change', details: 'FG-PRIM-200 marcado como "Lento"', time: 'Yesterday', status: 'Success' },
        { id: 4, user: 'System', action: 'Data Validation', details: 'Error detectado en costo RM-PIGM-RED', time: 'Yesterday', status: 'Error' },
    ];

    // Mock Trend Data
    const qualityTrend = [
        { day: 'Lun', score: 92 },
        { day: 'Mar', score: 94 },
        { day: 'Mie', score: 91 },
        { day: 'Jue', score: 95 },
        { day: 'Vie', score: 96 },
    ];

    const qualityScore = 96; // Calculated mock score

    return (
        <div className="p-6 bg-slate-50 min-h-screen space-y-6">
            <header className="flex justify-end items-end">
                <div className="flex gap-2">
                     <button className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Forzar Sync ERP
                     </button>
                </div>
            </header>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-xs font-bold uppercase">Data Quality Score</span>
                        <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-2">{qualityScore}/100</div>
                    <div className="text-xs text-emerald-600 mt-1 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Saludable
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-xs font-bold uppercase">Diferencias ERP</span>
                        <ArrowRightLeft className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold text-rose-600 mt-2">{erpDiffs.length} SKUs</div>
                    <div className="text-xs text-slate-400 mt-1">Requieren conciliación</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-xs font-bold uppercase">Lotes Huérfanos</span>
                        <FileWarning className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-amber-600 mt-2">{integrityIssues.length}</div>
                    <div className="text-xs text-slate-400 mt-1">Sum(Lotes) ≠ Header</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-500 text-xs font-bold uppercase">Mal Clasificados</span>
                        <Search className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-2">{classificationIssues.length} SKUs</div>
                    <div className="text-xs text-slate-400 mt-1">Incoherencia Lógica</div>
                </div>
            </div>

            {/* TABS */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('quality')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'quality' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Calidad e Integridad
                    </button>
                    <button
                        onClick={() => setActiveTab('reconciliation')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'reconciliation' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Diferencias ERP vs BI
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'audit' 
                            ? 'border-blue-500 text-blue-600' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Trazabilidad (Logs)
                    </button>
                </nav>
            </div>

            {/* CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT MAIN CONTENT */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* TAB: QUALITY */}
                    {activeTab === 'quality' && (
                        <>
                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
                                    <h3 className="font-semibold text-slate-800 flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2 text-rose-500"/>
                                        Anomalías de Integridad (Header vs Detalles)
                                    </h3>
                                </div>
                                {integrityIssues.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-6 py-3">SKU</th>
                                                <th className="px-6 py-3 text-right">Stock Header</th>
                                                <th className="px-6 py-3 text-right">Suma Lotes</th>
                                                <th className="px-6 py-3 text-right">Diferencia</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {integrityIssues.map(item => (
                                                <tr key={item.id} className="border-b border-slate-100">
                                                    <td className="px-6 py-3 font-medium">{item.sku}</td>
                                                    <td className="px-6 py-3 text-right">{item.totalStock}</td>
                                                    <td className="px-6 py-3 text-right">{item.batchSum}</td>
                                                    <td className="px-6 py-3 text-right text-rose-600 font-bold">{item.diff}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2"/>
                                        <p>Integridad de Lotes vs Headers verificada al 100%.</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-800 flex items-center">
                                        <Search className="w-4 h-4 mr-2 text-indigo-500"/>
                                        SKUs Mal Clasificados / Datos Faltantes
                                    </h3>
                                </div>
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Producto</th>
                                            <th className="px-6 py-3">Problema Detectado</th>
                                            <th className="px-6 py-3">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {classificationIssues.map(issue => (
                                            <tr key={issue.id} className="border-b border-slate-100">
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-slate-900">{issue.name}</div>
                                                    <div className="text-xs text-slate-400">{issue.sku}</div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
                                                        {issue.issue}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <button className="text-blue-600 hover:underline text-xs font-bold">Corregir</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {classificationIssues.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-6 text-center text-slate-500">
                                                    No se detectaron problemas de clasificación lógica.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* TAB: RECONCILIATION */}
                    {activeTab === 'reconciliation' && (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 flex items-center">
                                    <FileDiff className="w-4 h-4 mr-2 text-indigo-600"/>
                                    Conciliación ERP vs Procoquinal OS (BI)
                                </h3>
                                <span className="text-xs text-slate-500">Última sync: Hace 2 minutos</span>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">SKU / Producto</th>
                                        <th className="px-6 py-3 text-right">Cant. ERP (SAP)</th>
                                        <th className="px-6 py-3 text-right">Cant. Procoquinal OS</th>
                                        <th className="px-6 py-3 text-right">Varianza</th>
                                        <th className="px-6 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {erpDiffs.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-6 py-3 font-medium">
                                                {item.name}
                                                <div className="text-xs text-slate-400">{item.sku}</div>
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono text-slate-600">{item.erpQty}</td>
                                            <td className="px-6 py-3 text-right font-mono text-slate-900 font-bold">{item.biQty}</td>
                                            <td className={`px-6 py-3 text-right font-bold ${item.variance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {item.variance} u
                                            </td>
                                            <td className="px-6 py-3">
                                                <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50">
                                                    Investigar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TAB: AUDIT */}
                    {activeTab === 'audit' && (
                         <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 flex items-center">
                                    <History className="w-4 h-4 mr-2 text-slate-600"/>
                                    Log de Actividades y Cambios
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {auditLog.map(log => (
                                    <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${
                                                log.status === 'Success' ? 'bg-emerald-500' : 
                                                log.status === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} />
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{log.action}</div>
                                                <div className="text-xs text-slate-500">{log.details}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">User: {log.user}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono text-slate-500">{log.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT SIDEBAR: TRENDS */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-4">Tendencia de Calidad</h3>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={qualityTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '8px'}} />
                                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{r: 3}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-2">
                            Score diario (Base 100)
                        </p>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 mb-2 flex items-center">
                            <RefreshCw className="w-4 h-4 mr-2"/> Reglas de Sincronización
                        </h3>
                        <ul className="space-y-2 text-sm text-indigo-800">
                            <li className="flex items-start">
                                <span className="mr-2">•</span> 
                                El stock se sincroniza con SAP cada 15 minutos.
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span> 
                                Las diferencias menores al 0.5% se ajustan automáticamente al cierre del día.
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span> 
                                Los lotes "huérfanos" (sin header) se mueven a cuarentena virtual.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};