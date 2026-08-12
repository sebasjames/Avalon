import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, Download } from 'lucide-react';
import { PurchaseSuggestion } from '../types';

interface PurchaseReportsExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: PurchaseSuggestion[];
}

export const PurchaseReportsExcelModal: React.FC<PurchaseReportsExcelModalProps> = ({ isOpen, onClose, data }) => {
    
    const columns = [
        { id: 'sku', label: 'SKU / Producto', fixed: true },
        { id: 'description', label: 'Descripción' },
        { id: 'currentStock', label: 'Stock Actual' },
        { id: 'suggestedQty', label: 'Sugerencia (IA)' },
        { id: 'reason', label: 'Justificación' },
        { id: 'editedQty', label: 'Cantidad Final' },
        { id: 'unitCost', label: 'Costo Unit.' },
        { id: 'totalCost', label: 'Costo Estimado' },
    ];

    const getRowData = (item: PurchaseSuggestion) => {
        return {
            sku: item.sku,
            description: item.description,
            currentStock: item.currentStock.toString(),
            suggestedQty: item.suggestedQty.toString(),
            reason: item.reason,
            editedQty: item.editedQty.toString(),
            unitCost: `$${item.unitCost.toLocaleString('es-CO')}`,
            totalCost: `$${(item.editedQty * item.unitCost).toLocaleString('es-CO')}`,
        };
    };

    const downloadExcel = async () => {
        try {
            // Lazy load xlsx
            const XLSX = await import('xlsx');
            
            // Format data
            const wsData = data.map(item => {
                const row = getRowData(item);
                const rowObj: Record<string, string> = {};
                columns.forEach(col => {
                    rowObj[col.label] = (row[col.id as keyof typeof row] || '').toString();
                });
                return rowObj;
            });
            
            // Create workbook
            const ws = XLSX.utils.json_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
            
            // Download
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const filename = `Reporte_Compras_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            alert("Hubo un error al exportar el archivo Excel.");
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg">
                                <FileSpreadsheet className="text-emerald-400 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-white">Formato Excel Pedidos</h2>
                                <p className="text-slate-400 text-sm">Vista previa de exportación interactiva</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={downloadExcel}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                            >
                                <Download size={18} />
                                Descargar .XLSX
                            </button>
                            <button 
                                onClick={onClose}
                                className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-auto bg-slate-50 relative">
                        <table className="w-full border-collapse text-sm">
                            <thead className="sticky top-0 z-20 shadow-sm">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th 
                                            key={col.id} 
                                            className={`bg-slate-200 border border-slate-300 text-slate-700 p-2 font-bold whitespace-nowrap text-left ${col.fixed ? 'sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, rowIndex) => {
                                    const rowData = getRowData(item);
                                    return (
                                        <tr key={rowIndex} className="hover:bg-white transition-colors">
                                            {columns.map((col, colIndex) => (
                                                <td 
                                                    key={col.id}
                                                    className={`border border-slate-200 p-2 text-slate-600 whitespace-nowrap ${col.fixed ? 'sticky left-0 bg-slate-50 font-medium z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : 'bg-white'}`}
                                                >
                                                    {(rowData as any)[col.id]}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};
