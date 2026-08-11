import React from 'react';
import { motion } from 'motion/react';
import { 
    AlertCircle, FileText, Database, Info, 
    ArrowRightLeft, BadgeCheck, XCircle, Search
} from 'lucide-react';

export interface AuditRow {
    rawDesc: string;
    rawDoc: string;
    traceId: string;
    originalSku: string; // The literal SKU found by regex
    sku: string;         // The final Avalon SKU (editable)
    brand: string;
    subCategory: string;
    uom: string;
    qty: number;         // Total Latas or packages
    kgPerUnit: number;   // e.g. 25kg
    unitCost: number;    // FOB in USD/EUR
    hasError: boolean;
    errorMsg?: string;
}

interface DataAuditGridProps {
    data: AuditRow[];
    onUpdateRow: (index: number, updatedRow: AuditRow) => void;
    trm: number;
    colchon: number;
    currency: 'USD' | 'EUR';
}

export const DataAuditGrid: React.FC<DataAuditGridProps> = ({ data, onUpdateRow, trm, colchon, currency }) => {
    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-20">
                        {/* Headers Grupo A vs Grupo B */}
                        <tr className="bg-slate-900 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                            <th colSpan={4} className="px-6 py-2 border-r border-slate-800 bg-slate-950/50">
                                <div className="flex items-center gap-2">
                                    <FileText size={12} className="text-rose-400" />
                                    <span>Origen (Datos Brutos del Proveedor)</span>
                                </div>
                            </th>
                            <th colSpan={6} className="px-6 py-2 bg-indigo-950/20">
                                <div className="flex items-center gap-2">
                                    <Database size={12} className="text-indigo-400" />
                                    <span>Sistema Avalon (Procesamiento Maestro)</span>
                                </div>
                            </th>
                        </tr>
                        {/* Headers de Columnas */}
                        <tr className="bg-white text-xs font-bold text-slate-500 border-b border-slate-200 shadow-sm">
                            {/* Raw Cols */}
                            <th className="px-4 py-3 bg-slate-50 w-48">Descripción Sucia</th>
                            <th className="px-4 py-3 bg-slate-50 w-24">Doc/Ref</th>
                            <th className="px-4 py-3 bg-slate-50 w-32">SKU Original</th>
                            <th className="px-4 py-3 bg-slate-50 border-r border-slate-200 w-32 text-rose-500">Trace ID</th>
                            
                            {/* Processed Cols (Editable) */}
                            <th className="px-4 py-3 w-32 text-indigo-600">SKU (Avalon)</th>
                            <th className="px-2 py-3 w-20 text-center">Peso Neto (KG/Lata)</th>
                            <th className="px-2 py-3 w-28 text-right bg-blue-50/50">Precio Unit. ({currency})</th>
                            <th className="px-2 py-3 w-20 text-center">Q Ordenada (Latas)</th>
                            <th className="px-2 py-3 w-24 text-center bg-slate-100">Kilos Pedidos</th>
                            <th className="px-2 py-3 w-24 text-right bg-blue-50/50">Valor Total ({currency})</th>
                            <th className="px-3 py-3 w-28 text-right bg-indigo-50/50">FOB Unit. (COP)</th>
                            <th className="px-3 py-3 w-28 text-right bg-emerald-50/50">Saneado (COP)</th>
                            <th className="px-4 py-3 w-16">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {data.map((row, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.03 }}
                                key={idx} 
                                className={`group transition-colors hover:bg-slate-50 ${row.hasError ? 'bg-rose-50/30' : ''}`}
                            >
                                {/* Raw Data - ReadOnly & Muted */}
                                <td className="px-4 py-2 bg-slate-50/50">
                                    <div className="text-[11px] font-mono text-slate-400 leading-tight truncate w-44" title={row.rawDesc}>
                                        {row.rawDesc}
                                    </div>
                                </td>
                                <td className="px-4 py-2 bg-slate-50/50 text-center uppercase tracking-tighter">
                                    <div className="text-[10px] font-mono text-slate-400">{row.rawDoc}</div>
                                </td>
                                <td className="px-4 py-2 bg-slate-50/50">
                                    <div className="text-xs font-mono text-slate-500 font-bold bg-slate-200/50 px-2 py-0.5 rounded text-center">
                                        {row.originalSku}
                                    </div>
                                </td>
                                <td className="px-4 py-2 bg-slate-50 border-r border-slate-200">
                                    <div className="text-[10px] font-bold text-rose-400 font-mono italic">{row.traceId}</div>
                                </td>

                                {/* Processed Data - Editable "Excel Light" */}
                                <td className="px-4 py-2">
                                    <input 
                                        type="text" 
                                        className="w-full bg-white border border-transparent group-hover:border-slate-200 focus:border-indigo-500 rounded px-2 py-1 text-sm font-bold text-slate-700 outline-none transition-all shadow-sm focus:shadow-indigo-100 uppercase"
                                        value={row.sku}
                                        onChange={(e) => onUpdateRow(idx, { ...row, sku: e.target.value })}
                                        title="CODIGO"
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <div className="flex items-center justify-center gap-1">
                                        <input 
                                            type="number" 
                                            className="w-12 text-center bg-white border border-transparent group-hover:border-slate-200 focus:border-indigo-500 rounded py-1 text-slate-700 font-bold outline-none"
                                            value={row.kgPerUnit}
                                            onChange={(e) => onUpdateRow(idx, { ...row, kgPerUnit: Number(e.target.value) })}
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold">KG</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2 bg-blue-50/20">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-blue-400 text-[10px] font-bold">{currency === 'EUR' ? '€' : '$'}</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-16 text-right bg-white border border-transparent group-hover:border-blue-200 focus:border-blue-500 rounded py-1 text-blue-900 font-bold outline-none"
                                            value={row.unitCost}
                                            onChange={(e) => onUpdateRow(idx, { ...row, unitCost: Number(e.target.value) })}
                                        />
                                    </div>
                                </td>
                                <td className="px-2 py-2">
                                    <div className="flex items-center justify-center gap-1">
                                        <input 
                                            type="number" 
                                            className="w-12 text-center bg-emerald-50/30 border border-transparent group-hover:border-emerald-100 focus:border-emerald-500 rounded py-1 text-emerald-700 font-black outline-none"
                                            value={row.qty}
                                            onChange={(e) => onUpdateRow(idx, { ...row, qty: Number(e.target.value) })}
                                        />
                                        <span className="text-[10px] text-emerald-600 font-bold">UN</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 bg-slate-100/50 text-center">
                                    <div className="font-mono text-sm font-bold text-slate-700">
                                        {(row.qty * (row.kgPerUnit || 1)).toLocaleString()} <span className="text-[10px] text-slate-400">KG</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 bg-blue-50/20 text-right">
                                    <div className="font-mono text-sm font-bold text-blue-900">
                                        <span className="text-blue-400 text-[10px] mr-1">{currency === 'EUR' ? '€' : '$'}</span>
                                        {((row.qty * (row.kgPerUnit || 1)) * row.unitCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-right bg-indigo-50/20">
                                    <div className="font-mono text-sm font-bold text-indigo-900">
                                        ${(row.unitCost * trm).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                    </div>
                                </td>
                                <td className="px-3 py-2 text-right bg-emerald-50/20">
                                    <div className="font-mono text-sm font-black text-emerald-700">
                                        ${((row.unitCost * trm) + colchon).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    {row.hasError ? (
                                        <div className="flex items-center gap-2 text-rose-500 text-[11px] font-bold bg-rose-50 p-1 rounded animate-pulse">
                                            <XCircle size={14} />
                                            {row.errorMsg}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-500 text-[11px] font-bold">
                                            <BadgeCheck size={14} />
                                            Certificado Avalon
                                        </div>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-slate-500 text-xs">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Origen</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Saneado</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span>Acción Requerida</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-mono">
                   <Info size={14} className="text-indigo-400"/>
                   Tip: Puedes editar cualquier celda de la derecha directamente como en Excel.
                </div>
            </div>
        </div>
    );
};
