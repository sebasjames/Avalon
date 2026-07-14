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
    qty: number;
    unitCost: number;
    hasError: boolean;
    errorMsg?: string;
}

interface DataAuditGridProps {
    data: AuditRow[];
    onUpdateRow: (index: number, updatedRow: AuditRow) => void;
}

export const DataAuditGrid: React.FC<DataAuditGridProps> = ({ data, onUpdateRow }) => {
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
                            <th className="px-4 py-3 w-40">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <span>SKU Final (Avalon)</span>
                                    <ArrowRightLeft size={14}/>
                                </div>
                            </th>
                            <th className="px-4 py-3 w-40">Familia Mapeada</th>
                            <th className="px-4 py-3 w-24 text-center">UM</th>
                            <th className="px-4 py-3 w-24 text-center">Cant.</th>
                            <th className="px-4 py-3 w-32 text-right">Costo Unit.</th>
                            <th className="px-4 py-3 flex-1">Estatus</th>
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
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <select 
                                        className="w-full bg-indigo-50/30 border border-transparent group-hover:border-indigo-100 focus:border-indigo-500 rounded px-2 py-1 text-xs font-bold text-indigo-700 outline-none transition-all appearance-none"
                                        value={row.subCategory}
                                        onChange={(e) => onUpdateRow(idx, { ...row, subCategory: e.target.value })}
                                    >
                                        <option>{row.subCategory}</option>
                                        <option>Disolvente</option>
                                        <option>Catalizador</option>
                                        <option>Resina/Base</option>
                                        <option>Tinte</option>
                                        <option>Laca/Barniz</option>
                                        <option>Especial</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2 text-center text-xs font-black text-slate-500">
                                    <input 
                                        type="text" 
                                        className="w-16 text-center bg-white border border-transparent group-hover:border-slate-200 focus:border-indigo-500 rounded py-1 outline-none font-black uppercase"
                                        value={row.uom}
                                        onChange={(e) => onUpdateRow(idx, { ...row, uom: e.target.value })}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input 
                                        type="number" 
                                        className="w-16 text-center bg-emerald-50/30 border border-transparent group-hover:border-emerald-100 focus:border-emerald-500 rounded py-1 text-emerald-700 font-black outline-none"
                                        value={row.qty}
                                        onChange={(e) => onUpdateRow(idx, { ...row, qty: Number(e.target.value) })}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-slate-400 text-[10px]">$</span>
                                        <input 
                                            type="number" 
                                            className="w-24 text-right bg-white border border-transparent group-hover:border-slate-200 focus:border-indigo-500 rounded py-1 text-slate-900 font-bold outline-none"
                                            value={row.unitCost}
                                            onChange={(e) => onUpdateRow(idx, { ...row, unitCost: Number(e.target.value) })}
                                        />
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
