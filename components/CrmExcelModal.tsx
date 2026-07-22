import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileSpreadsheet, Download } from 'lucide-react';
import { CrmContact, CrmUser } from '../types';

interface CrmExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: CrmContact[];
    crmUsers: CrmUser[];
}

export const CrmExcelModal: React.FC<CrmExcelModalProps> = ({ isOpen, onClose, data, crmUsers }) => {
    const columns = [
        { id: 'company', label: 'Empresa / Cliente', fixed: true },
        { id: 'document', label: 'NIT/Cédula' },
        { id: 'phone', label: 'Teléfono de Cliente' },
        { id: 'email', label: 'Email de cliente' },
        { id: 'address', label: 'Dirección' },
        { id: 'cityCode', label: 'Ciudad' },
        { id: 'name', label: 'Contacto Principal' },
        { id: 'whatsapp', label: 'Whatsapp C. 1' },
        { id: 'hobby', label: 'Aficiones (CP)' },
        { id: 'birthday', label: 'Cumpleaños (CP)' },
        { id: 'observations', label: 'Observaciones (CP)' },
        { id: 'contact2', label: 'Contacto 2' },
        { id: 'phone2', label: 'Teléfono 2' },
        { id: 'hobby2', label: 'Aficiones (C2)' },
        { id: 'birthday2', label: 'Cumpleaños (C2)' },
        { id: 'observations2', label: 'Observaciones (C2)' },
        { id: 'contact3', label: 'Contacto 3' },
        { id: 'phone3', label: 'Teléfono 3' },
        { id: 'hobby3', label: 'Aficiones (C3)' },
        { id: 'birthday3', label: 'Cumpleaños (C3)' },
        { id: 'observations3', label: 'Observaciones (C3)' },
        { id: 'status', label: 'Estado' },
        { id: 'tier', label: 'Tier' },
        { id: 'source', label: 'Origen' },
        { id: 'postSaleStage', label: 'Etapa KAM' },
        { id: 'lastContactDate', label: 'Último Contacto' },
        { id: 'owner', label: 'Responsable' },
        { id: 'tags', label: 'Etiquetas' },
        { id: 'accountBalance', label: 'Saldo a Favor' },
        { id: 'creditLimit', label: 'Cupo Crédito Total' },
        { id: 'creditLimitUsed', label: 'Cupo Utilizado' },
        { id: 'hasOverdueBills', label: 'En Mora' },
        { id: 'taxRuleId', label: 'Regla de Impuestos' },
        { id: 'pricingRuleId', label: 'Regla de Precios' },
        { id: 'paymentRuleId', label: 'Regla de Pago' },
        { id: 'fiscalClassification', label: 'Clasificación Fiscal' },
        { id: 'hist_monthly', label: 'Compra Mensual' },
        { id: 'hist_quarterly', label: 'Compra Trimestral' },
        { id: 'hist_annual', label: 'Compra Anual' },
        { id: 'hist_previousYear', label: 'Compra Año Anterior' },
        { id: 'hist_avg', label: 'Promedio Histórico' },
        { id: 'hist_margin', label: 'Margen Rentabilidad %' },
        { id: 'hist_pattern', label: 'Patrón de Compra' }
    ];

    const getRowData = (item: CrmContact) => {
        const owner = crmUsers.find(u => u.id === item.ownerId)?.name || 'Sin Asignar';
        const doc = item.documentNumber ? `${item.documentType || 'NIT'} ${item.documentNumber}` : 'N/A';
        const tags = item.tags ? item.tags.join(', ') : '';
        const ph = item.purchaseHistory;

        return {
            company: item.company || '',
            document: doc,
            name: item.name || '',
            phone: item.phone || '',
            whatsapp: item.whatsapp || '',
            email: item.email || '',
            address: item.address || '',
            hobby: item.hobby || '',
            birthday: item.birthday || '',
            observations: item.observations || '',
            contact2: item.contact2 || '',
            phone2: item.phone2 || '',
            hobby2: item.hobby2 || '',
            birthday2: item.birthday2 || '',
            observations2: item.observations2 || '',
            contact3: item.contact3 || '',
            phone3: item.phone3 || '',
            hobby3: item.hobby3 || '',
            birthday3: item.birthday3 || '',
            observations3: item.observations3 || '',
            status: item.status || '',
            tier: item.tier || '',
            source: item.source || '',
            postSaleStage: item.postSaleStage || '',
            lastContactDate: item.lastContactDate ? new Date(item.lastContactDate).toLocaleDateString('es-CO') : '',
            owner: owner,
            tags: tags,
            accountBalance: item.accountBalance?.toString() || '0',
            creditLimit: item.creditLimit?.toString() || '0',
            creditLimitUsed: item.creditLimitUsed?.toString() || '0',
            hasOverdueBills: item.hasOverdueBills ? 'Sí' : 'No',
            taxRuleId: item.taxRuleId || '',
            pricingRuleId: item.pricingRuleId || '',
            paymentRuleId: item.paymentRuleId || '',
            fiscalClassification: item.fiscalClassification || '',
            cityCode: item.cityCode || '',
            hist_monthly: ph?.monthly?.toString() || '0',
            hist_quarterly: ph?.quarterly?.toString() || '0',
            hist_annual: ph?.annual?.toString() || '0',
            hist_previousYear: ph?.previousYear?.toString() || '0',
            hist_avg: ph?.historicalAverage?.toString() || '0',
            hist_margin: ph?.profitabilityMargin?.toString() || '0',
            hist_pattern: ph?.purchasePattern || ''
        };
    };

    if (!isOpen) return null;

    const [isExportingXLSX, setIsExportingXLSX] = useState(false);

    const [colWidths, setColWidths] = useState<Record<string, number>>({
        'company': 250,
        'name': 200,
        'email': 200,
    });
    const [resizingCol, setResizingCol] = useState<string | null>(null);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);

    const handleMouseDown = (e: React.MouseEvent, colId: string) => {
        e.preventDefault();
        setResizingCol(colId);
        setStartX(e.clientX);
        const currentWidth = colWidths[colId] || 150;
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
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingCol, startX, startWidth]);

    const downloadBlob = async (blob: Blob, filename: string, extension: string, mimeType: string, description: string) => {
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description,
                        accept: { [mimeType]: [extension] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            }
        } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.warn('showSaveFilePicker API failed, falling back to file-saver:', err);
        }
        
        const { saveAs } = await import('file-saver');
        saveAs(blob, filename);
    };

    const handleExportXLSX = async () => {
        try {
            setIsExportingXLSX(true);
            const XLSX = await import('xlsx');
            
            const wsData = data.map(item => {
                const row = getRowData(item);
                const rowObj: Record<string, string> = {};
                columns.forEach(col => {
                    rowObj[col.label] = (row[col.id as keyof typeof row] || '').toString();
                });
                return rowObj;
            });
            
            const ws = XLSX.utils.json_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "CRM");
            
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const filename = `Auditoria_CRM_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            await downloadBlob(blob, filename, '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Excel Document');
            
        } catch (error) {
            console.error("Error exporting XLSX:", error);
            alert("Hubo un error al exportar el archivo Excel.");
        } finally {
            setIsExportingXLSX(false);
        }
    };

    const handleExportCSV = async () => {
        const header = columns.map(col => `"${col.label}"`).join(',');
        const rows = data.map(item => {
            const row = getRowData(item);
            return columns.map(col => {
                let val = row[col.id as keyof typeof row] || '';
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(',');
        });
        
        const csvContent = [header, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const filename = `Auditoria_CRM_${new Date().toISOString().split('T')[0]}.csv`;
        
        await downloadBlob(blob, filename, '.csv', 'text/csv', 'CSV File');
    };

    return createPortal(
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex flex-col bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
            >
                <motion.div 
                    initial={{ y: 50, scale: 0.95 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 50, scale: 0.95 }}
                    className="flex-1 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-white">Auditoría Excel CRM</h2>
                                <p className="text-xs text-slate-400 font-medium">{data.length} registros cargados</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleExportXLSX} 
                                disabled={isExportingXLSX}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 transition-colors rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                            >
                                <FileSpreadsheet className="w-4 h-4" /> 
                                {isExportingXLSX ? 'Cargando...' : 'Exportar XLSX'}
                            </button>
                            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-lg text-sm font-bold shadow-lg shadow-emerald-900/20">
                                <Download className="w-4 h-4" /> Exportar CSV
                            </button>
                            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar">
                        <table className="w-max text-left border-collapse bg-white" style={{ tableLayout: 'fixed' }}>
                            <thead className="sticky top-0 z-30 bg-slate-100 shadow-sm">
                                <tr>
                                    {columns.map((col) => {
                                        const width = colWidths[col.id] || 150;
                                        return (
                                            <th 
                                                key={col.id} 
                                                className={`px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-r border-slate-200 whitespace-nowrap relative select-none group ${
                                                    col.fixed ? 'sticky left-0 bg-slate-200 z-40 shadow-[1px_0_0_0_#cbd5e1]' : ''
                                                }`}
                                                style={{ width, minWidth: width, maxWidth: width }}
                                            >
                                                <div className="overflow-hidden text-ellipsis">{col.label}</div>
                                                <div 
                                                    onMouseDown={(e) => handleMouseDown(e, col.id)}
                                                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500/50 z-50 flex items-center justify-center transition-colors"
                                                >
                                                    <div className="h-4 w-px bg-slate-300 group-hover:bg-emerald-500"></div>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.map((item) => {
                                    const row = getRowData(item);
                                    return (
                                        <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors group">
                                            {columns.map((col) => {
                                                const val = row[col.id as keyof typeof row];
                                                const width = colWidths[col.id] || 150;
                                                return (
                                                    <td 
                                                        key={col.id} 
                                                        className={`px-4 py-2.5 text-sm font-medium border-r border-slate-100 whitespace-nowrap overflow-hidden text-ellipsis ${
                                                            col.fixed ? 'sticky left-0 bg-slate-50 group-hover:bg-emerald-50 z-20 shadow-[1px_0_0_0_#e2e8f0]' : 'text-slate-600'
                                                        } ${
                                                            val === 'N/A' ? 'text-slate-300 italic' : 
                                                            val === 'VINCULADO' ? 'text-emerald-600 font-black' : ''
                                                        }`}
                                                        style={{ width, minWidth: width, maxWidth: width }}
                                                    >
                                                        <div className="overflow-hidden text-ellipsis" title={val.toString()}>{val || <span className="text-rose-300 italic text-[11px] uppercase tracking-wider font-bold">Vacio</span>}</div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};
