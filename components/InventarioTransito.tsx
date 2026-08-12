import React, { useState, useEffect } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { PackageSearch, CheckCircle2, MapPin, Save, Lock, XCircle, AlertTriangle, Split } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOCATIONS = ['Centenario', 'Gaitán', 'Barranquilla'];

interface SplitItem {
    id: string;
    sku: string;
    description: string;
    totalLiters: number;
    capacity: string;
    assignedLocation?: string;
}

export const InventarioTransito: React.FC = () => {
    const { receipts, distributeTransitInventory } = useEnterprise();
    const transitReceipts = receipts.filter(r => r.status === 'TRANSITO');
    
    // Local state for split items: { [receiptId]: SplitItem[] }
    const [splitItems, setSplitItems] = useState<Record<string, SplitItem[]>>({});
    
    useEffect(() => {
        const initial: Record<string, SplitItem[]> = {};
        let changed = false;
        transitReceipts.forEach(r => {
            if (!splitItems[r.id]) {
                initial[r.id] = r.items.map((item, idx) => ({
                    id: `${item.sku}-${idx}-${Date.now()}`,
                    sku: item.sku,
                    description: item.description,
                    totalLiters: item.totalLiters,
                    capacity: item.capacity || 'UOM'
                }));
                changed = true;
            }
        });
        if (changed) {
            setSplitItems(prev => ({...prev, ...initial}));
        }
    }, [transitReceipts]);
    
    // Split Modal State
    const [splitModalData, setSplitModalData] = useState<{receiptId: string, itemId: string, maxQty: number, sku: string} | null>(null);
    const [splitQty, setSplitQty] = useState<string>('');
    const [splitLocation, setSplitLocation] = useState<string>('');

    const [approvingReceiptId, setApprovingReceiptId] = useState<string | null>(null);
    const [approvalId, setApprovalId] = useState('');
    const [error, setError] = useState('');

    const handleAssign = (receiptId: string, itemId: string, location: string) => {
        setSplitItems(prev => {
            const items = [...(prev[receiptId] || [])];
            const idx = items.findIndex(i => i.id === itemId);
            if (idx !== -1) items[idx] = { ...items[idx], assignedLocation: location };
            return { ...prev, [receiptId]: items };
        });
    };

    const handleSplitConfirm = () => {
        if (!splitModalData) return;
        const qty = parseFloat(splitQty);
        if (isNaN(qty) || qty <= 0 || qty >= splitModalData.maxQty) {
            alert(`Por favor ingrese una cantidad válida (mayor a 0 y menor a ${splitModalData.maxQty})`);
            return;
        }
        
        setSplitItems(prev => {
            const items = prev[splitModalData.receiptId] || [];
            const itemIndex = items.findIndex(i => i.id === splitModalData.itemId);
            if (itemIndex === -1) return prev;
            
            const originalItem = items[itemIndex];
            const newItems = [...items];
            
            // Decrease original item qty
            newItems[itemIndex] = { ...originalItem, totalLiters: originalItem.totalLiters - qty };
            
            // Insert new item right below it
            const newItem: SplitItem = {
                ...originalItem,
                id: `${originalItem.sku}-split-${Date.now()}`,
                totalLiters: qty,
                assignedLocation: splitLocation || undefined
            };
            newItems.splice(itemIndex + 1, 0, newItem);
            
            return { ...prev, [splitModalData.receiptId]: newItems };
        });
        
        setSplitModalData(null);
        setSplitQty('');
        setSplitLocation('');
    };

    const handleSave = (receiptId: string) => {
        const items = splitItems[receiptId] || [];
        const unassigned = items.some(item => !item.assignedLocation);
        
        if (unassigned) {
            alert('Aún hay productos sin bodega asignada. Por favor, asigna una bodega a cada producto o fragmento.');
            return;
        }

        setApprovingReceiptId(receiptId);
        setApprovalId('');
        setError('');
    };

    const confirmSave = () => {
        if (!approvalId || approvalId.length < 4) {
            setError('El ID de aprobación debe tener al menos 4 caracteres.');
            return;
        }

        const receiptId = approvingReceiptId;
        if (!receiptId) return;

        const items = splitItems[receiptId] || [];
        const distributionData: Record<string, Record<string, number>> = {};
        
        items.forEach(item => {
            const loc = item.assignedLocation;
            if (loc) {
                if (!distributionData[item.sku]) distributionData[item.sku] = {};
                if (!distributionData[item.sku][loc]) distributionData[item.sku][loc] = 0;
                distributionData[item.sku][loc] += item.totalLiters;
            }
        });

        distributeTransitInventory(receiptId, distributionData);
        setApprovingReceiptId(null);
        alert('Inventario distribuido y stock actualizado exitosamente.');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <PackageSearch className="text-indigo-600 w-8 h-8" />
                    Inventario en Tránsito
                </h1>
                <p className="text-slate-500 mt-2">
                    Gestiona la mercancía recibida y distribúyela físicamente a las diferentes bodegas. Utiliza "Dividir" para enviar partes del mismo lote a distintas sedes.
                </p>
            </div>

            {transitReceipts.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500 font-medium">
                    No hay inventario en tránsito pendiente por distribuir.
                </div>
            ) : (
                <div className="space-y-8">
                    {transitReceipts.map(receipt => {
                        const items = splitItems[receipt.id] || [];
                        const allAssigned = items.length > 0 && items.every(i => !!i.assignedLocation);

                        return (
                            <div key={receipt.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-white font-bold">Documento: {receipt.documentNumber}</h3>
                                        <p className="text-slate-400 text-sm">Ingreso: {new Date(receipt.dateIn).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30 flex items-center gap-2">
                                        <AlertTriangle size={14} />
                                        En Cuarentena
                                    </div>
                                </div>

                                <div className="p-0">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="p-4 font-semibold w-1/3">Producto</th>
                                                <th className="p-4 font-semibold text-right">Cantidad</th>
                                                <th className="p-4 font-semibold text-center">Acción</th>
                                                <th className="p-4 font-semibold text-center">Bodega de Destino</th>
                                                <th className="p-4 font-semibold text-center">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((item) => {
                                                const assignedLocation = item.assignedLocation;
                                                return (
                                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-bold text-slate-800">{item.sku}</div>
                                                            <div className="text-xs text-slate-500">{item.description}</div>
                                                        </td>
                                                        <td className="p-4 text-right font-mono font-bold text-slate-700">
                                                            {item.totalLiters.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">{item.capacity}</span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {item.totalLiters > 1 && (
                                                                <button 
                                                                    onClick={() => setSplitModalData({receiptId: receipt.id, itemId: item.id, maxQty: item.totalLiters, sku: item.sku})}
                                                                    className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1 mx-auto transition-colors"
                                                                >
                                                                    <Split size={14} /> Dividir
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <select
                                                                value={assignedLocation || ''}
                                                                onChange={(e) => handleAssign(receipt.id, item.id, e.target.value)}
                                                                className={`bg-white border rounded-lg px-3 py-2 outline-none text-sm font-medium w-full max-w-[200px] cursor-pointer transition-colors ${
                                                                    assignedLocation ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-600 focus:border-indigo-500'
                                                                }`}
                                                            >
                                                                <option value="" disabled>Seleccione sede...</option>
                                                                {LOCATIONS.map(loc => (
                                                                    <option key={loc} value={loc}>{loc}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {assignedLocation ? (
                                                                <div className="flex items-center justify-center text-emerald-500">
                                                                    <CheckCircle2 size={24} />
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center text-slate-300">
                                                                    <MapPin size={24} />
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                                    <button
                                        onClick={() => handleSave(receipt.id)}
                                        disabled={!allAssigned}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm ${
                                            allAssigned 
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30' 
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <Save size={18} />
                                        Guardar Inventario
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {splitModalData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200"
                        >
                            <div className="bg-slate-800 p-5 flex justify-between items-center border-b border-slate-700">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <Split size={20} className="text-indigo-400" />
                                    Dividir Lote
                                </h3>
                                <button onClick={() => { setSplitModalData(null); setSplitQty(''); setSplitLocation(''); }} className="text-slate-400 hover:text-white">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-slate-500">
                                    Estás dividiendo el bloque de <strong>{splitModalData.sku}</strong>. Hay un máximo de <strong>{splitModalData.maxQty.toLocaleString()}</strong> disponibles.
                                </p>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Cantidad a Extraer</label>
                                    <input 
                                        type="number"
                                        max={splitModalData.maxQty - 1}
                                        min={1}
                                        value={splitQty}
                                        onChange={(e) => setSplitQty(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 font-mono text-lg"
                                        placeholder="Ej. 30"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Bodega (Opcional)</label>
                                    <select
                                        value={splitLocation}
                                        onChange={(e) => setSplitLocation(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                                    >
                                        <option value="">Dejar sin asignar</option>
                                        {LOCATIONS.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleSplitConfirm}
                                    disabled={!splitQty || parseFloat(splitQty) >= splitModalData.maxQty || parseFloat(splitQty) <= 0}
                                    className="w-full bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition-all mt-4"
                                >
                                    Confirmar División
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {approvingReceiptId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
                        >
                            <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <Lock size={20} className="text-indigo-400" />
                                    Confirmar Liberación
                                </h3>
                                <button onClick={() => setApprovingReceiptId(null)} className="text-slate-400 hover:text-white">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200 text-sm">
                                    <strong>¡Atención!</strong> Estás a punto de liberar esta mercancía de su estado en Tránsito y sumar el stock oficialmente a las bodegas seleccionadas.
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        ID de Aprobación (Firma Logística)
                                    </label>
                                    <input 
                                        type="password"
                                        value={approvalId}
                                        onChange={(e) => setApprovalId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 font-mono tracking-widest text-center text-xl"
                                        placeholder="****"
                                        autoFocus
                                    />
                                    {error && <p className="text-rose-500 text-sm mt-2 font-medium text-center">{error}</p>}
                                </div>

                                <button
                                    onClick={confirmSave}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition-all"
                                >
                                    Confirmar y Distribuir
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
