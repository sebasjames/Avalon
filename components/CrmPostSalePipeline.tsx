import React from 'react';
import { motion } from 'motion/react';
import { MoreVertical, Heart, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';
import { CrmContact, CrmPostSaleStage } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';

interface CrmPostSalePipelineProps {
  contacts: CrmContact[];
  onContactClick: (contactId: string) => void;
}

export const CrmPostSalePipeline: React.FC<CrmPostSalePipelineProps> = ({ contacts, onContactClick }) => {
  const { moveContactPostSaleStage } = useEnterprise();

  const stages: { id: CrmPostSaleStage; label: string; color: string; desc: string }[] = [
    { id: 'ONBOARDING', label: 'Vinculación (Onboarding)', color: 'bg-blue-50 border-blue-200', desc: 'Asegurando el primer éxito' },
    { id: 'RENTABILIZACION', label: 'Rentabilización (Up-sell)', color: 'bg-indigo-50 border-indigo-200', desc: 'Candidatos para nuevos productos' },
    { id: 'FIDELIZACION', label: 'Fidelización (Renovación)', color: 'bg-emerald-50 border-emerald-200', desc: 'Clientes recurrentes y sanos' },
    { id: 'MONITOREO', label: 'Monitoreo (Riesgo Fuga)', color: 'bg-rose-50 border-rose-200', desc: 'Atención inmediata requerida' }
  ];

  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    e.dataTransfer.setData('text/plain', contactId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: CrmPostSaleStage) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('text/plain');
    if (contactId) {
      moveContactPostSaleStage(contactId, stageId);
    }
  };

  // We only show ACTIVE contacts that have a postSaleStage
  const activeContacts = contacts.filter(c => c.status === 'VINCULADO' && c.postSaleStage);

  const getHealthBadge = (score?: string) => {
    switch(score) {
      case 'GREEN': return <span className="flex h-3 w-3 relative"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span>;
      case 'YELLOW': return <span className="flex h-3 w-3 relative"><span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>;
      case 'RED': return <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span></span>;
      default: return <span className="flex h-3 w-3 relative"><span className="relative inline-flex rounded-full h-3 w-3 bg-slate-300"></span></span>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
        <Heart className="w-6 h-6 text-indigo-600" />
        <div>
            <h3 className="font-bold text-indigo-900">Key Account Management (Gestión de Cuentas)</h3>
            <p className="text-sm text-indigo-700">Mueve a los clientes activos por su ciclo de vida. Los tratos Ganados entran aquí automáticamente a Onboarding.</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-320px)] custom-scrollbar">
        {stages.map(stage => {
          const stageContacts = activeContacts.filter(c => c.postSaleStage === stage.id);

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
                    {stageContacts.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{stage.desc}</p>
              </div>
              
              <div className="flex-1 bg-slate-50 border-x border-b border-slate-200 rounded-b-xl p-3 space-y-3 overflow-y-auto">
                {stageContacts.map(contact => (
                  <motion.div 
                    layoutId={`post-${contact.id}`}
                    key={contact.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, contact.id)}
                    onClick={() => onContactClick(contact.id)}
                    className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing transition-colors ${contact.healthScore === 'RED' ? 'hover:border-rose-300' : 'hover:border-indigo-300'}`}
                  >
                    <div className="flex justify-between items-start mb-2 pointer-events-none">
                      <div className="flex items-center gap-2">
                        {getHealthBadge(contact.healthScore)}
                        <h4 className="text-sm font-semibold text-slate-900">{contact.name}</h4>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 pointer-events-auto">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3 pointer-events-none">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{contact.company}</span>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 pointer-events-none">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        contact.tier === 'STRATEGIC' ? 'bg-purple-100 text-purple-700' : 
                        contact.tier === 'REGULAR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        Tier {contact.tier}
                      </span>
                      {contact.healthScore === 'RED' && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> Riesgo
                        </div>
                      )}
                      {contact.healthScore === 'GREEN' && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Sano
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {stageContacts.length === 0 && (
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
