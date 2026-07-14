import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileSpreadsheet } from 'lucide-react';

interface TransactionsExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
}

export const TransactionsExcelModal: React.FC<TransactionsExcelModalProps> = ({ isOpen, onClose, data }) => {
    
    const columns = [
        { id: 'id', label: 'ID Comprobante', fixed: true },
        { id: 'date', label: 'Fecha' },
        { id: 'type', label: 'Tipo' },
        { id: 'client', label: 'Tercero / Cliente' },
        { id: 'document', label: 'Documento Ref' },
        { id: 'productName', label: 'Concepto / Producto' },
        { id: 'sku', label: 'SKU' },
        { id: 'qty', label: 'Cant' },
        { id: 'total', label: 'Valor Total' },
        { id: 'iva', label: 'IVA' },
        { id: 'paymentMethod', label: 'Forma Pago' },
        { id: 'posLocation', label: 'Punto Venta' },
        { id: 'paymentStatus', label: 'Estado Cartera' },
        { id: 'balance', label: 'Saldo Cartera' },
        { id: 'validationStatus', label: 'Concil. Datáfono' },
        { id: 'bankAmount', label: 'Neto Banco' },
        { id: 'bankFee', label: 'Comisión Banco' }
    ];

    const getRowData = (item: any) => {
        return {
            id: item.id,
            date: item.date,
            type: item.type,
            client: item.client,
            document: item.document,
            productName: item.productName,
            sku: item.sku || 'N/A',
            qty: item.qty?.toString() || '1',
            total: item.total ? `$${item.total.toLocaleString('es-CO')}` : '$0',
            iva: item.iva ? `$${item.iva.toLocaleString('es-CO')}` : '$0',
            paymentMethod: item.paymentMethod || 'N/A',
            posLocation: item.posLocation || 'N/A',
            paymentStatus: item.paymentStatus || 'N/A',
            balance: item.balance ? `$${item.balance.toLocaleString('es-CO')}` : '$0',
            validationStatus: item.validationStatus || 'N/A',
            bankAmount: item.bankAmount ? `$${item.bankAmount.toLocaleString('es-CO')}` : '$0',
            bankFee: item.bankFee ? `$${item.bankFee.toLocaleString('es-CO')}` : '$0'
        };
    };

    if (!isOpen) return null;

    // Resizable columns logic
    const [colWidths, setColWidths] = useState<Record<string, number>>({
        'id': 130,
        'client': 200,
        'productName': 300,
    });
    const [resizingCol, setResizingCol] = useState<string | null>(null);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);

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

                    {/* Sheet Grid Body */}
                    <div className="flex-1 overflow-auto bg-slate-900 text-xs font-mono select-none custom-scrollbar">
                        <div className="min-w-max relative">
                            {/* Sticky Header Row */}
                            <div className="flex bg-slate-950 border-b border-slate-800 sticky top-0 z-20 h-9 items-center">
                                <div className="w-10 text-center text-slate-600 font-bold border-r border-slate-800 shrink-0">#</div>
                                {columns.map((col) => {
                                    const width = colWidths[col.id] || 120;
                                    return (
                                        <div 
                                            key={col.id} 
                                            className="h-full flex items-center px-3 font-bold text-slate-400 border-r border-slate-800 relative group select-none shrink-0"
                                            style={{ width }}
                                        >
                                            <span className="truncate">{col.label}</span>
                                            {/* Resize Handle */}
                                            <div 
                                                onMouseDown={(e) => handleMouseDown(e, col.id)}
                                                className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors z-30 ${resizingCol === col.id ? 'bg-indigo-500' : ''}`}
                                            ></div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Data Rows */}
                            <div className="divide-y divide-slate-800">
                                {data.map((item, rowIndex) => {
                                    const row = getRowData(item);
                                    return (
                                        <div 
                                            key={rowIndex} 
                                            className="flex h-8 items-center bg-slate-900/50 hover:bg-indigo-950/20 group border-b border-slate-800/60"
                                        >
                                            <div className="w-10 text-center text-slate-600 font-bold border-r border-slate-800 shrink-0 bg-slate-950/20">{rowIndex + 1}</div>
                                            {columns.map((col) => {
                                                const width = colWidths[col.id] || 120;
                                                const val = (row as any)[col.id];
                                                
                                                // Highlight coloring logic
                                                let cellColor = "text-slate-300";
                                                if (col.id === "total" || col.id === "bankAmount") cellColor = "text-emerald-400 font-bold";
                                                if (col.id === "bankFee") cellColor = "text-rose-400 font-bold";
                                                if (col.id === "id") cellColor = "text-indigo-300 font-bold";
                                                if (col.id === "type") {
                                                    cellColor = val === "VENTA" ? "text-blue-400" : val === "COMPRA" ? "text-amber-400" : "text-slate-400";
                                                }

                                                return (
                                                    <div 
                                                        key={col.id} 
                                                        className={`h-full flex items-center px-3 border-r border-slate-800/60 truncate shrink-0 ${cellColor}`}
                                                        style={{ width }}
                                                        title={val}
                                                    >
                                                        {val}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Status Bar */}
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
