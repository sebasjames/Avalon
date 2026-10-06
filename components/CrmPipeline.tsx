import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MoreVertical, Building2, Clock, XCircle, LayoutGrid, List, Box } from 'lucide-react';
import { CrmDealStage, CrmDeal, CrmContact, CrmLeadSource } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';
import { CrmEngine } from '../utils/CrmEngine';

interface CrmPipelineProps {
  deals: CrmDeal[];
  contacts: CrmContact[];
  onDealMove: (dealId: string, newStage: CrmDealStage) => void;
  onDealClick: (contactId: string) => void;
  getSourceBadge: (source: CrmLeadSource) => { label: string; color: string; icon: any };
  highlightDealId?: string | null;
  highlightSignal?: { dealId: string; nonce: number } | null;
}

export const CrmPipeline: React.FC<CrmPipelineProps> = ({ 
  deals, 
  contacts: _contacts, 
  onDealMove, 
  onDealClick, 
  getSourceBadge, 
  highlightDealId, 
  highlightSignal 
}) => {
  const { crmSettings } = useEnterprise();
  const stages = CrmEngine.getActiveStages(crmSettings).filter(s => s.id !== 'CLOSED_LOST');

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isDragging, setIsDragging] = useState(false);

  // Auto-scroll suave de fondo hacia la tarjeta sin bloquear clics ni colocar letreros invasivos
  useEffect(() => {
    const targetId = highlightSignal?.dealId || highlightDealId;
    if (!targetId) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`crm-deal-${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [highlightSignal?.nonce, highlightDealId]);

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
              const stageDeals = deals.filter(d => 
                d.stage === stage.id || 
                (stage.id === 'CLOSED_WON' && d.stage === ('GANADO' as any)) ||
                (stage.id === 'PROSPECTO' && d.stage === ('LEAD' as any))
              );
              const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

              return (
                <div 
                  key={stage.id} 
                  className="flex-shrink-0 w-80 bg-slate-50/50 rounded-xl flex flex-col max-h-full border border-slate-200/60 shadow-xs"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id as CrmDealStage)}
                >
                  {/* Column Header */}
                  <div className={`p-3 border-b rounded-t-xl ${stage.color} flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">{stage.label}</span>
                      <span className="bg-white/80 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold shadow-xs">
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      ${stageTotal.toLocaleString('es-CO')}
                    </span>
                  </div>

                  {/* Deals List */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                    {stageDeals.map(deal => {
                      const sourceBadge = deal.contactId ? getSourceBadge('MANUAL' as any) : null;
                      const SourceIcon = sourceBadge ? sourceBadge.icon : null;

                      return (
                        <motion.div
                          id={`crm-deal-${deal.id}`}
                          layoutId={deal.id}
                          key={deal.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e as any, deal.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            onDealClick(deal.contactId);
                          }}
                          className="p-4 rounded-xl shadow-xs border cursor-grab active:cursor-grabbing transition-all duration-200 relative bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5 flex-1">
                              {deal.items && deal.items.length > 0 && (
                                <div className="bg-indigo-100 text-indigo-700 p-0.5 rounded shadow-sm" title="Cotización Adjunta">
                                  <Box className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <h4 className="text-sm font-semibold line-clamp-2 text-slate-900">{deal.title}</h4>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 pointer-events-auto">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mb-3">
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
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <span className="font-bold text-slate-900">${deal.value.toLocaleString('es-CO')}</span>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(deal.expectedCloseDate).toLocaleDateString('es-CO')}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {stageDeals.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                        Sin tratos
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* List / Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Trato</th>
                <th className="py-3 px-4">Empresa / Contacto</th>
                <th className="py-3 px-4">Etapa</th>
                <th className="py-3 px-4">Valor (COP)</th>
                <th className="py-3 px-4">Fecha Cierre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {deals.map(deal => {
                const stageObj = stages.find(s => s.id === deal.stage);

                return (
                  <tr 
                    id={`crm-deal-${deal.id}`}
                    key={deal.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer" 
                    onClick={() => {
                      onDealClick(deal.contactId);
                    }}
                  >
                    <td className="py-2.5 px-4 border-r border-slate-100/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{deal.title}</span>
                      </div>
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
