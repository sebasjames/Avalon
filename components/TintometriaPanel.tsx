import React, { useState } from 'react';
import { Pencil, Save, X, Lock, AlertCircle } from 'lucide-react';
import tintometriaDataRaw from '../data/tintometria_raw.json';

export const TintometriaPanel: React.FC = () => {
  const [data, setData] = useState<Record<string, any[]>>(tintometriaDataRaw as any);
  const tabs = Object.keys(data);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  
  // Edit State
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  const currentData = data[activeTab] || [];
  const columns = currentData.length > 0 ? Object.keys(currentData[0]) : [];

  const handleEditClick = (rowIdx: number, row: any) => {
    setEditingRowIdx(rowIdx);
    setEditFormData({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingRowIdx(null);
    setEditFormData(null);
  };

  const handleSaveIntent = () => {
    setShowAuthModal(true);
    setPinInput('');
    setAuthError('');
  };

  const confirmSave = () => {
    // In a real scenario, this would validate against the EnterpriseContext or a backend API.
    // For now, any PIN >= 4 digits is accepted as a valid authorization.
    if (pinInput.length >= 4) {
      const newData = { ...data };
      newData[activeTab][editingRowIdx!] = editFormData;
      setData(newData);
      setEditingRowIdx(null);
      setEditFormData(null);
      setShowAuthModal(false);
    } else {
      setAuthError('PIN inválido o insuficiente');
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Sistema Tintométrico
          </h1>
          <p className="text-slate-500 mt-2">
            Base de datos cruda extraída del formulario original. Editando en tiempo real.
          </p>
        </div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-6 custom-scrollbar-hide h-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              handleCancelEdit(); // Cancel any ongoing edits when switching tabs
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 font-bold scale-105 z-10'
                : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
        <div className="overflow-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16 text-center">
                  Acciones
                </th>
                {columns.map((col, idx) => (
                  <th key={idx} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((row: any, rIdx: number) => {
                const isEditing = editingRowIdx === rIdx;
                
                return (
                  <tr key={rIdx} className={`transition-colors ${isEditing ? 'bg-indigo-50/50' : 'hover:bg-indigo-50/30'}`}>
                    <td className="p-4 border-b border-slate-100 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={handleSaveIntent} 
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
                            title="Guardar"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleCancelEdit} 
                            className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(rIdx, row)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all mx-auto block"
                          title="Editar Fila"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                    
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-4 text-sm text-slate-700 font-medium border-b border-slate-100">
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full min-w-[80px] p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
                            value={editFormData[col] || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, [col]: e.target.value })}
                          />
                        ) : (
                          row[col]
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={(columns.length || 1) + 1} className="p-8 text-center text-slate-500">
                    No hay datos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auth Modal for Saving Edits */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6 mx-auto">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
              Autorización Requerida
            </h2>
            <p className="text-center text-slate-500 mb-8">
              Ingresa tu PIN de seguridad para confirmar la modificación de esta fórmula.
            </p>
            
            <div className="space-y-6">
              <div>
                <input 
                  type="password" 
                  autoFocus
                  maxLength={6}
                  placeholder="••••"
                  className={`w-full text-center text-3xl tracking-[0.5em] font-mono p-4 bg-slate-50 border-2 rounded-xl outline-none transition-all ${
                    authError ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                  }`}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                    setAuthError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
                />
                {authError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-3 justify-center font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="w-4 h-4" />
                    {authError}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthError('');
                    setPinInput('');
                  }}
                  className="flex-1 py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmSave}
                  disabled={pinInput.length < 4}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
