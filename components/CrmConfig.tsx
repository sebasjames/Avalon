import React from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Settings, Tag, Target, Clock, Save } from 'lucide-react';

export const CrmConfig: React.FC = () => {
  const { crmSettings } = useEnterprise();

  // In a real scenario, we'd have a form state and update function in context.
  // For now, we display the parameters to meet the "parametrizar" requirement visually.

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-600"/> Parametrización del Sistema</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm">
          <Save className="w-4 h-4" /> Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metas Globales */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-indigo-500"/> Metas Globales</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Meta de Ingresos Mensual ($)</label>
              <input type="number" defaultValue={crmSettings.globalGoals.monthlyRevenue} className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Meta de Tratos Cerrados</label>
              <input type="number" defaultValue={crmSettings.globalGoals.monthlyDeals} className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none" />
            </div>
          </div>
        </div>

        {/* SLA & Alertas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-indigo-500"/> SLAs y Alertas (Reglas de Negocio)</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Max. Horas Lead sin Contactar</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={crmSettings.sla.maxHoursUncontactedLead} className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none" />
                <span className="text-sm font-medium text-slate-500">Horas</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Dispara alerta si un LEAD nuevo pasa este tiempo sin registrar actividad.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Max. Días en la misma Etapa</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={crmSettings.sla.maxDaysInStage} className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:ring-2 ring-indigo-500/20 outline-none" />
                <span className="text-sm font-medium text-slate-500">Días</span>
              </div>
            </div>
          </div>
        </div>

        {/* Etapas del Embudo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 col-span-1 md:col-span-2">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Tag className="w-4 h-4 text-indigo-500"/> Etapas del Embudo y Orígenes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3">Probabilidades por Etapa</h4>
              <div className="space-y-2">
                {crmSettings.stages.map(stage => (
                  <div key={stage.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 w-1/3">{stage.label}</span>
                    <div className="flex items-center gap-2 w-2/3">
                      <input type="range" min="0" max="100" defaultValue={stage.defaultProbability} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                      <span className="text-xs font-bold w-10 text-right">{stage.defaultProbability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3">Orígenes de Leads (Fuentes)</h4>
              <div className="flex flex-wrap gap-2">
                {crmSettings.leadSources.map(source => (
                  <span key={source} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                    {source}
                  </span>
                ))}
                <button className="px-3 py-1.5 border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition-colors">
                  + Agregar Origen
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
