import React from 'react';
import { motion } from 'motion/react';
import { MoreVertical, Building2, Clock, XCircle } from 'lucide-react';
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
    { id: 'LEAD', label: 'Lead', color: 'bg-slate-100 border-slate-200' },
    { id: 'QUALIFIED', label: 'Calificado', color: 'bg-blue-50 border-blue-200' },
    { id: 'PROPOSAL', label: 'Propuesta', color: 'bg-indigo-50 border-indigo-200' },
    { id: 'NEGOTIATION', label: 'Negociación', color: 'bg-amber-50 border-amber-200' },
    { id: 'CLOSED_WON', label: 'Ganado', color: 'bg-emerald-50 border-emerald-200' }
  ];

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
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
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Dropzone LOST */}
      <div 
        className="w-full bg-rose-50/50 shadow-sm border-2 border-dashed border-rose-300 hover:bg-rose-100 hover:border-rose-400 rounded-xl p-4 flex flex-col items-center justify-center text-rose-700 font-bold transition-all min-h-[80px]"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'CLOSED_LOST')}
      >
        <span className="flex items-center text-sm uppercase tracking-wide"><XCircle className="w-5 h-5 mr-2" /> Arrastra aquí para marcar como PERDIDO</span>
        <span className="text-xs font-medium text-rose-400 mt-1">Análisis profundo sobre razones de pérdida</span>
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
                <p className="text-xs text-slate-600 font-medium">${stageTotal.toLocaleString('es-CO')} COP COP</p>
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
                      <span className="text-sm font-bold text-indigo-600">${deal.value.toLocaleString('es-CO')} COP COP</span>
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
    </div>
  );
};
