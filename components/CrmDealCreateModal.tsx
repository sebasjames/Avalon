import { useEscapeKey } from '../hooks/useEscapeKey';
import React, { useState } from 'react';
import { X, Target, AlertTriangle } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { useAuthStore } from '../stores/authStore';
import { CrmDeal } from '../types';

interface CrmDealCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  companyName: string;
}

export const CrmDealCreateModal: React.FC<CrmDealCreateModalProps> = ({ isOpen, onClose, contactId, companyName }) => {
  const { addDeal, crmSettings, systemUsers, inventory } = useEnterprise();
  const { activeRole } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number | ''>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [probability, setProbability] = useState<number>(50);
  const [isNonCommissionable, setIsNonCommissionable] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState<{ userId: string, percentage: number }[]>([{ userId: '1', percentage: 100 }]); // Default current user 100%
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<string>('');

  // Escape key hooks
  useEscapeKey(onClose, isOpen);


  if (!isOpen) return null;

  const threshold = crmSettings.whaleAlertThreshold || 50000000;
  const isWhale = typeof value === 'number' && value >= threshold;

  const handleAddItem = () => {
    if (!selectedProduct || !selectedQuantity) return;
    const prod = inventory.find(p => p.id === selectedProduct);
    if (!prod) return;
    setItems([...items, { productId: prod.id, name: prod.name, quantity: Number(selectedQuantity), unitPrice: prod.price }]);
    setSelectedProduct('');
    setSelectedQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!value && items.length === 0) || !expectedCloseDate) return;

    const newDeal: CrmDeal = {
      id: `DEAL-${Date.now()}`,
      title,
      contactId,
      company: companyName,
      value: items.length > 0 ? items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) : Number(value),
      items: items.length > 0 ? items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })) : undefined,
      stage: 'PROSPECTO',
      expectedCloseDate,
      probability,
      ownerId: splits[0]?.userId || '1', 
      isNonCommissionable,
      splits: isSplit ? splits : undefined
    };

    // Note: CrmDeal in types might expect `createdAt` if we look at CrmClientFullProfile.tsx line 346 `deal.createdAt`
    // We add it dynamically.
    (newDeal as any).createdAt = new Date().toISOString();

    addDeal(newDeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Crear Nuevo Trato (Oportunidad)
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre del Trato</label>
            <input 
              type="text" 
              required
              placeholder="Ej: Dotación Restaurantes Q3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <label className="text-sm font-bold text-slate-800 block">Cotizador de Productos (Opcional)</label>
              
              <div className="flex gap-2">
                <select 
                  value={selectedProduct} 
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="flex-1 text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 ring-indigo-500/20"
                >
                  <option value="">Seleccionar Producto...</option>
                  {inventory.filter(p => (p.status as string) !== 'SILENT').map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price.toLocaleString('es-CO')}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="Cant" 
                  value={selectedQuantity}
                  onChange={e => {
                      let val = e.target.value.replace(',', '.');
                      if (/^\d*\.?\d*$/.test(val)) {
                          setSelectedQuantity(val);
                      }
                  }}
                  className="w-20 text-sm border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 ring-indigo-500/20"
                />
                <button 
                  type="button" 
                  onClick={handleAddItem}
                  className="px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-lg transition-colors"
                >
                  +
                </button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2 mt-3 pt-3 border-t border-slate-200">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded shadow-sm text-xs">
                      <div>
                        <span className="font-bold text-slate-700">{item.quantity}x</span> {item.name}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-500">${(item.quantity * item.unitPrice).toLocaleString('es-CO')}</span>
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-700">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block flex justify-between">
                <span>Valor Esperado ($)</span>
                {items.length > 0 && <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1 rounded border border-indigo-100">Calculado</span>}
              </label>
              <input 
                type="number" 
                required
                min="0"
                value={items.length > 0 ? items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) : value}
                onChange={(e) => { if(items.length === 0) setValue(Number(e.target.value)) }}
                disabled={items.length > 0}
                className={`w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none ${items.length > 0 ? 'bg-slate-100 font-bold text-slate-600' : ''}`} 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Fecha de Cierre Estimada</label>
              <input 
                type="date" 
                required
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 flex justify-between">
              <span>Probabilidad de Cierre (%)</span>
              <span className="text-indigo-600 font-bold">{probability}%</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="5"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
            />
          </div>

          {isWhale && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 mt-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Alerta: Cuenta Ballena</p>
                <p className="text-xs text-amber-700 mt-0.5">El valor supera el umbral de ${threshold.toLocaleString('es-CO')}. Este trato será monitoreado directamente por la Dirección Comercial.</p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isNonCommissionable}
                onChange={(e) => setIsNonCommissionable(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                disabled={activeRole === 'Comercial'} // Un comercial normal no debería poder auto-quitarse la comisión ni ponerla si la dirección dice lo contrario.
              />
              <div>
                <span className="text-sm font-bold text-slate-700 block">Venta No Comisionable (Cuenta Directa)</span>
                <span className="text-xs text-slate-500 mt-1 block">Marcar si esta venta es una negociación directa de gerencia o institucional que no genera comisión para el ejecutivo.</span>
              </div>
            </label>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-700 block">Comisión Compartida (Split)</span>
                <span className="text-xs text-slate-500 mt-1 block">Divide la comisión de este negocio con otros asesores.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsSplit(!isSplit);
                  if (!isSplit && splits.length === 1) {
                    // Initialize a generic split 50-50 for demo if enabling
                    setSplits([
                      { userId: '1', percentage: 50 },
                      { userId: systemUsers.find(u => u.id !== '1')?.id || '2', percentage: 50 }
                    ]);
                  } else if (isSplit) {
                    // Reset to 100% single owner if disabling
                    setSplits([{ userId: '1', percentage: 100 }]);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${isSplit ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}
              >
                {isSplit ? 'Desactivar Split' : 'Activar Split'}
              </button>
            </div>
            
            {isSplit && (
              <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                {splits.map((split, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={split.userId}
                      onChange={(e) => {
                        const newSplits = [...splits];
                        newSplits[index].userId = e.target.value;
                        setSplits(newSplits);
                      }}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      {systemUsers.filter(u => u.baseRole === 'Comercial' || u.baseRole === 'manager' || u.baseRole === 'admin').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 w-24">
                      <input 
                        type="number" 
                        min="0" max="100" 
                        value={split.percentage}
                        onChange={(e) => {
                          const newSplits = [...splits];
                          newSplits[index].percentage = Number(e.target.value);
                          setSplits(newSplits);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-slate-500 text-sm font-bold">%</span>
                    </div>
                  </div>
                ))}
                
                {splits.reduce((sum, s) => sum + s.percentage, 0) !== 100 && (
                  <p className="text-xs font-bold text-rose-500">⚠️ Los porcentajes deben sumar 100% (Actual: {splits.reduce((sum, s) => sum + s.percentage, 0)}%)</p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSplit && splits.reduce((sum, s) => sum + s.percentage, 0) !== 100}
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow transition-colors"
            >
              Crear Oportunidad
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
