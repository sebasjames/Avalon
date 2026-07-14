import { useState } from 'react';
import { motion } from 'motion/react';
import { MoreVertical, Building2, Clock, XCircle, LayoutGrid, List } from 'lucide-react';
import { CrmDealStage, CrmDeal, CrmContact, CrmLeadSource } from '../types';

interface CrmPipelineProps {
  deals: CrmDeal[];
  contacts: CrmContact[];
  onDealMove: (dealId: string, newStage: CrmDealStage) => void;
  onDealClick: (contactId: string) => void;
  getSourceBadge: (source: CrmLeadSource) => { label: string; color: string; icon: any };
}

export const CrmPipeline: React.FC<CrmPipelineProps> = ({ deals, contacts, onDealMove, onDealClick, getSourceBadge }) => {
  const stages: { id: CrmDealStage; label: string; color: string }[] = [
    { id: 'PROSPECTO', label: 'Prospecto', color: 'bg-slate-100 border-slate-200' },
    { id: 'QUALIFIED', label: 'Calificado', color: 'bg-blue-50 border-blue-200' },
    { id: 'PROPOSAL', label: 'Propuesta', color: 'bg-indigo-50 border-indigo-200' },
    { id: 'NEGOTIATION', label: 'Negociación', color: 'bg-amber-50 border-amber-200' },
    { id: 'CLOSED_WON', label: 'Ganado', color: 'bg-emerald-50 border-emerald-200' }
  ];

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: CrmDealStage | 'CLOSED_LOST') => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      onDealMove(dealId, stageId as CrmDealStage);
    }
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* View Toggle Bar */}
      <div className="flex justify-end border-b border-slate-200 pb-2">
        <div className="bg-slate-100 p-1 rounded-lg inline-flex items-center">
          <button 
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Tablero
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 flex items-center gap-1.5 rounded-md text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List className="w-4 h-4" /> Lista
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <>
          {/* Dropzone LOST - Fixed at bottom when dragging */}
          <div 
            className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-rose-600 shadow-2xl border-2 border-dashed border-white rounded-xl p-4 flex flex-col items-center justify-center text-white font-bold transition-all duration-300 z-50
              ${isDragging ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}
            `}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'CLOSED_LOST')}
          >
            <span className="flex items-center text-sm uppercase tracking-wide"><XCircle className="w-5 h-5 mr-2" /> Arrastra aquí para marcar como PERDIDO</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-320px)] custom-scrollbar">
            {stages.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage.id);
              const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

              return (
                <div 
                  key={stage.id} 
                  className="flex-shrink-0 w-80 flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className={`p-3 rounded-t-xl border-t border-x ${stage.color}`}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-slate-800">{stage.label}</h3>
                      <span className="text-xs font-medium bg-white px-2 py-1 rounded-full shadow-sm">
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">${stageTotal.toLocaleString('es-CO')} COP</p>
                  </div>
                  <div className="flex-1 bg-slate-50 border-x border-b border-slate-200 rounded-b-xl p-3 space-y-3 overflow-y-auto">
                    {stageDeals.map(deal => {
                      const contact = contacts.find(c => c.id === deal.contactId);
                      const sourceBadge = contact ? getSourceBadge(contact.source) : null;
                      const SourceIcon = sourceBadge?.icon;

                      return (
                      <motion.div 
                        layoutId={deal.id}
                        key={deal.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, deal.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onDealClick(deal.contactId)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2 pointer-events-none">
                          <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{deal.title}</h4>
                          <button className="text-slate-400 hover:text-slate-600 pointer-events-auto">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mb-3 pointer-events-none">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{deal.company}</span>
                          </div>
                          {sourceBadge && SourceIcon && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider ${sourceBadge.color}`}>
                              <SourceIcon className="w-2.5 h-2.5" />
                              {sourceBadge.label}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-100 pointer-events-none">
                          <span className="text-sm font-bold text-indigo-600">${deal.value.toLocaleString('es-CO')} COP</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            {new Date(deal.expectedCloseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </motion.div>
                    )})}
                    {stageDeals.length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg pointer-events-none">
                        <span className="text-sm text-slate-400">Suelta aquí</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">Trato</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">Empresa</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">Etapa</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200/60">Valor</th>
                <th className="py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cierre Esperado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.filter(d => d.stage !== 'CLOSED_LOST').map(deal => {
                const stageObj = stages.find(s => s.id === deal.stage);
                return (
                  <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onDealClick(deal.contactId)}>
                    <td className="py-2 px-4 border-r border-slate-100/50">
                      <span className="text-sm font-semibold text-slate-800">{deal.title}</span>
                    </td>
                    <td className="py-2 px-4 border-r border-slate-100/50">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Building2 className="w-4 h-4 text-slate-400" /> {deal.company}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-r border-slate-100/50">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${stageObj?.color || 'bg-slate-100'}`}>
                        {stageObj?.label || deal.stage}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-r border-slate-100/50">
                      <span className="text-sm font-bold text-indigo-700">${deal.value.toLocaleString('es-CO')}</span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(deal.expectedCloseDate).toLocaleDateString('es-CO')}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {deals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500 italic">No hay tratos activos en el embudo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
