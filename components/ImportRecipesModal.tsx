import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertTriangle, X, FileSpreadsheet, ArrowRight, Save, DatabaseZap } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEnterprise } from '../context/EnterpriseContext';
import { Product, Recipe, RecipeIngredient } from '../types';
import { createPortal } from 'react-dom';

interface ParsedRecipeRow {
    finalSku: string;
    finalProductName?: string;
    finalProductId?: string;
    ingredientSku: string;
    ingredientName?: string;
    ingredientId?: string;
    quantity: number;
    isValid: boolean;
    error?: string;
}

interface ImportRecipesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ImportRecipesModal: React.FC<ImportRecipesModalProps> = ({ isOpen, onClose }) => {
    const { inventory, addRecipe, recipes } = useEnterprise();
    
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    // Step 1 State
    const [isDragging, setIsDragging] = useState(false);
    const [parsedRows, setParsedRows] = useState<ParsedRecipeRow[]>([]);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Step 3 State
    const [processing, setProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        let file: File | undefined;
        
        if ('dataTransfer' in e) {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                file = e.dataTransfer.files[0];
            }
        } else if (e.target && (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files!.length > 0) {
            file = (e.target as HTMLInputElement).files![0];
        }

        if (!file) return;
        setFileName(file.name);
        setSuccessMsg('');

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            if (!bstr) return;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const rows: ParsedRecipeRow[] = [];

            data.forEach((row: any) => {
                let finalSku = '';
                let ingredientSku = '';
                let qty = 0;

                Object.keys(row).forEach(key => {
                    const k = key.toLowerCase().trim();
                    if (k.includes('final') || k.includes('producto') || k.includes('ensamblado')) {
                        if (!finalSku) finalSku = String(row[key]).trim();
                    }
                    if (k.includes('ingrediente') || k.includes('materia') || k.includes('componente') || k === 'sku') {
                        if (!ingredientSku && String(row[key]).trim() !== finalSku) ingredientSku = String(row[key]).trim(); // Avoid self-match if only 1 SKU col
                    }
                    if (k.includes('cantidad') || k.includes('qty')) qty = Number(row[key]) || 0;
                });

                if (!finalSku && !ingredientSku) return; // Empty row

                const finalProduct = inventory.find(p => p.sku === finalSku || p.originalSku === finalSku);
                const ingredientProduct = inventory.find(p => p.sku === ingredientSku || p.originalSku === ingredientSku);
                
                let error = '';
                if (!finalProduct) error = 'SKU Producto Final no encontrado. ';
                if (!ingredientProduct) error += 'SKU Ingrediente no encontrado. ';
                if (qty <= 0) error += 'Cantidad inválida.';

                rows.push({
                    finalSku,
                    finalProductName: finalProduct?.name,
                    finalProductId: finalProduct?.id,
                    ingredientSku,
                    ingredientName: ingredientProduct?.name,
                    ingredientId: ingredientProduct?.id,
                    quantity: qty,
                    isValid: !!finalProduct && !!ingredientProduct && qty > 0,
                    error: error.trim()
                });
            });

            setParsedRows(rows);
            setStep(2);
        };
        reader.readAsBinaryString(file);
    };

    const handleConfirm = () => {
        setProcessing(true);
        setStep(3);
        
        setTimeout(() => {
            // Agrupar filas válidas por Producto Final
            const validRows = parsedRows.filter(r => r.isValid);
            const grouped = new Map<string, RecipeIngredient[]>();
            
            validRows.forEach(row => {
                const fId = row.finalProductId!;
                const ing: RecipeIngredient = {
                    productId: row.ingredientId!,
                    quantity: row.quantity
                };
                if (!grouped.has(fId)) grouped.set(fId, []);
                grouped.get(fId)!.push(ing);
            });

            let addedCount = 0;
            for (const [finalId, ingredients] of grouped.entries()) {
                const existing = recipes.find(r => r.finalProductId === finalId);
                if (!existing) {
                    addRecipe({
                        id: `REC-IMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                        finalProductId: finalId,
                        ingredients
                    });
                    addedCount++;
                }
            }

            setSuccessMsg(`Se importaron ${addedCount} fórmulas nuevas con éxito. Las fórmulas preexistentes se ignoraron.`);
            setProcessing(false);
        }, 1500);
    };

    if (!isOpen) return null;

    const validRows = parsedRows.filter(r => r.isValid).length;
    const invalidRows = parsedRows.length - validRows;
    const uniqueRecipes = new Set(parsedRows.filter(r => r.isValid).map(r => r.finalProductId)).size;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[999] flex justify-center items-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <FileSpreadsheet size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Importar Fórmulas desde Excel</h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm">
                                    <h4 className="font-bold mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Formato Requerido</h4>
                                    <p>El Excel debe contener las siguientes columnas (el nombre no tiene que ser exacto, pero sí similar):</p>
                                    <ul className="list-disc ml-5 mt-2 opacity-80">
                                        <li><strong>Producto Final:</strong> SKU o Código del producto terminado.</li>
                                        <li><strong>Ingrediente:</strong> SKU o Código de la materia prima.</li>
                                        <li><strong>Cantidad:</strong> Cantidad necesaria del ingrediente por unidad.</li>
                                    </ul>
                                </div>

                                <div 
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                                        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                                    }`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleFileUpload}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <UploadCloud size={48} className={`mx-auto mb-4 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">Arrastra tu archivo Excel aquí</h3>
                                    <p className="text-slate-500 mb-6">o haz clic para seleccionar (Formatos soportados: .xlsx, .csv)</p>
                                    <button className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition-colors">
                                        Explorar Archivos
                                    </button>
                                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.csv" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div>
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <DatabaseZap className="text-indigo-600" /> Resumen de Análisis
                                        </h3>
                                        <p className="text-sm text-slate-500">Archivo: {fileName}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-indigo-600">{uniqueRecipes}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nuevas Fórmulas</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-emerald-500">{validRows}</div>
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingredientes OK</div>
                                        </div>
                                        {invalidRows > 0 && (
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-red-500">{invalidRows}</div>
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Con Errores</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="overflow-x-auto max-h-[400px]">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold sticky top-0 z-10 shadow-sm">
                                                <tr>
                                                    <th className="p-3">Estado</th>
                                                    <th className="p-3">SKU Prod. Final</th>
                                                    <th className="p-3">Nombre Prod. Final</th>
                                                    <th className="p-3">SKU Ingrediente</th>
                                                    <th className="p-3">Nombre Ingrediente</th>
                                                    <th className="p-3 text-right">Cantidad</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-sm">
                                                {parsedRows.map((row, idx) => (
                                                    <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50 hover:bg-red-100'}>
                                                        <td className="p-3">
                                                            {row.isValid 
                                                                ? <CheckCircle size={18} className="text-emerald-500" />
                                                                : <AlertTriangle size={18} className="text-red-500" title={row.error} />
                                                            }
                                                        </td>
                                                        <td className="p-3 font-medium text-slate-700">{row.finalSku}</td>
                                                        <td className="p-3 text-slate-500 truncate max-w-[150px]">{row.finalProductName || '-'}</td>
                                                        <td className="p-3 font-medium text-slate-700">{row.ingredientSku}</td>
                                                        <td className="p-3 text-slate-500 truncate max-w-[150px]">{row.ingredientName || '-'}</td>
                                                        <td className="p-3 text-right font-bold text-slate-700">{row.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {invalidRows > 0 && (
                                    <p className="text-sm text-red-600 font-medium">Hay filas con errores (SKUs no encontrados). Esas filas serán ignoradas.</p>
                                )}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                {processing ? (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                                        <h3 className="text-xl font-bold text-slate-800">Procesando y creando fórmulas...</h3>
                                        <p className="text-slate-500">Esto puede tomar unos segundos</p>
                                    </div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800">¡Importación Exitosa!</h3>
                                        <p className="text-slate-600 font-medium">{successMsg}</p>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            {step === 3 && !processing ? 'Cerrar' : 'Cancelar'}
                        </button>

                        {step === 2 && (
                            <button 
                                onClick={handleConfirm}
                                disabled={uniqueRecipes === 0}
                                className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar Importación <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};
