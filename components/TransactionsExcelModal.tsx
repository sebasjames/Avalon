import { useEscapeKey } from '../hooks/useEscapeKey';
import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { KardexTransaction } from '../types';

interface TransactionsExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: KardexTransaction[];
}

export const TransactionsExcelModal: React.FC<TransactionsExcelModalProps> = ({ isOpen, onClose, data }) => {
    const columns = [
        { id: 'id', label: 'ID Transacción', width: 140 },
        { id: 'date', label: 'Fecha / Hora', width: 160 },
        { id: 'type', label: 'Tipo', width: 120 },
        { id: 'sku', label: 'SKU Producto', width: 120 },
        { id: 'productName', label: 'Nombre Producto', width: 220 },
        { id: 'quantity', label: 'Cantidad', width: 100 },
        { id: 'previousStock', label: 'Stock Previo', width: 100 },
        { id: 'newStock', label: 'Nuevo Stock', width: 100 },
        { id: 'reason', label: 'Motivo / Concepto', width: 250 },
        { id: 'user', label: 'Usuario Responsable', width: 150 },
        { id: 'warehouse', label: 'Bodega / Ubicación', width: 140 },
        { id: 'referenceDoc', label: 'Doc. Referencia', width: 140 },
        { id: 'unitCost', label: 'Costo Unitario ($)', width: 130 },
        { id: 'totalCost', label: 'Costo Total ($)', width: 130 },
    ];

    const getRowData = (item: KardexTransaction | any) => {
        return {
            id: item.id || '',
            date: item.date ? new Date(item.date).toLocaleString('es-CO') : '',
            type: item.type || '',
            sku: item.productId || 'N/A',
            productName: item.productName || 'Producto',
            quantity: item.quantity?.toString() || '0',
            previousStock: item.previousStock?.toString() || '0',
            newStock: item.newStock?.toString() || '0',
            reason: item.reason || item.notes || 'N/A',
            user: item.userName || item.userId || 'Sistema',
            warehouse: item.warehouse || 'Principal',
            referenceDoc: item.referenceDocument || 'N/A',
            unitCost: item.unitCost ? `$${item.unitCost.toLocaleString('es-CO')}` : '$0',
            totalCost: item.totalCost ? `$${item.totalCost.toLocaleString('es-CO')}` : '$0',
        };
    };

    const [colWidths, setColWidths] = useState<Record<string, number>>({});
    const [resizingCol, setResizingCol] = useState<string | null>(null);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);

    useEscapeKey(onClose, isOpen);

    const handleMouseDown = (e: React.MouseEvent, colId: string) => {
        e.preventDefault();
        setResizingCol(colId);
        setStartX(e.clientX);
        const currentWidth = colWidths[colId] || 120;
        setStartWidth(currentWidth);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!resizingCol) return;
            const diffX = e.clientX - startX;
            setColWidths(prev => ({
                ...prev,
                [resizingCol]: Math.max(50, startWidth + diffX)
            }));
        };
        
        const handleMouseUp = () => {
            setResizingCol(null);
        };

        if (resizingCol) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingCol, startX, startWidth]);

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 md:p-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-slate-700 w-full h-full rounded-2xl flex flex-col overflow-hidden text-slate-300 shadow-2xl"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-white flex items-center gap-2">
                                    Auditoría de Movimientos (Vista Excel)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Visualización de celdas densas en cuadrícula. Desplaza horizontalmente para ver todo.</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Table grid view */}
                    <div className="flex-1 overflow-auto bg-slate-950 relative font-mono text-xs">
                        <table className="w-max border-collapse">
                            <thead className="sticky top-0 z-20 bg-slate-900 shadow-md">
                                <tr className="border-b border-slate-800">
                                    {columns.map((col) => {
                                        const width = colWidths[col.id] || col.width;
                                        return (
                                            <th 
                                                key={col.id} 
                                                style={{ width: `${width}px`, minWidth: `${width}px` }}
                                                className="px-3 py-2 text-left font-bold text-slate-400 border-r border-slate-800 select-none relative group"
                                            >
                                                <span>{col.label}</span>
                                                <div 
                                                    onMouseDown={(e) => handleMouseDown(e, col.id)}
                                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500/50 z-30"
                                                />
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {data.map((item, idx) => {
                                    const row = getRowData(item);
                                    return (
                                        <tr key={item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                                            {columns.map((col) => {
                                                const val = (row as any)[col.id];
                                                const width = colWidths[col.id] || col.width;
                                                return (
                                                    <td 
                                                        key={col.id}
                                                        style={{ width: `${width}px`, minWidth: `${width}px` }}
                                                        className="px-3 py-1.5 border-r border-slate-800/50 truncate text-slate-300"
                                                        title={val}
                                                    >
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 shrink-0 select-none">
                        <div className="flex gap-4">
                            <span>TOTAL FILAS: <strong className="text-slate-300">{data.length}</strong></span>
                            <span>FONDO DE CELDA: <strong className="text-slate-300">LECTURA</strong></span>
                        </div>
                        <div>
                            <span>Avalon Grid Engine v1.2</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};
