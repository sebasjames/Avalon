import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingUp, Users, Target, Activity, CalendarDays, Snowflake, RotateCw, PhoneCall, CheckCircle, Clock } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { getSourceBadge } from './CrmFull';

export const CrmDashboard: React.FC = () => {
  const { deals, contacts, activities, crmUsers, crmSettings } = useEnterprise();

  // Global metrics (ignoring filterOwner because this is a global dashboard)
  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON').reduce((sum, deal) => sum + deal.value, 0);
  const winRate = deals.length > 0 ? (deals.filter(d => d.stage === 'CLOSED_WON').length / deals.length) * 100 : 0;
  const lostDealsCount = deals.filter(d => d.stage === 'CLOSED_LOST').length;

  const overdueActivities = activities.filter(a => 
      a.status !== 'COMPLETED' && 
      new Date(a.date).getTime() < Date.now()
  );

  const revenueGoal = crmSettings.globalGoals.monthlyRevenue;
  const progressPercent = Math.min((wonDeals / revenueGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {overdueActivities.length > 0 && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-rose-100 border border-rose-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 text-rose-700">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  <div>
                      <h4 className="font-bold">¡Atención global! Hay {overdueActivities.length} actividades retrasadas en el equipo.</h4>
                      <p className="text-xs font-medium opacity-80">Revisar el desempeño de seguimiento de los comerciales para evitar pérdida de oportunidades.</p>
                  </div>
              </div>
          </motion.div>
      )}

      {/* Global Goal Progress */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="bg-indigo-100 p-4 rounded-full">
          <Target className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold text-slate-500">Meta Global Mensual</p>
              <h3 className="text-2xl font-black text-slate-900">${wonDeals.toLocaleString('es-CO')} COP COP <span className="text-sm font-medium text-slate-400">/ ${revenueGoal.toLocaleString('es-CO')} COP COP</span></h3>
            </div>
            <span className="text-lg font-bold text-indigo-600">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} 
              className="bg-indigo-600 h-3 rounded-full" 
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Valor Total del Embudo</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalPipelineValue.toLocaleString('es-CO')} COP COP</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500">Ingresos Ganados</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">${wonDeals.toLocaleString('es-CO')} COP COP</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-sm font-medium text-slate-500">Oportunidades Perdidas</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">{lostDealsCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-slate-500">Tasa de Cierre Global</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{winRate.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 col-span-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Vendedores (Leaderboard)</h3>
          <div className="space-y-4">
            {crmUsers.filter(u => u.role === 'SALES_REP').map(user => {
              const userWon = deals.filter(d => d.ownerId === user.id && d.stage === 'CLOSED_WON').reduce((s, d) => s + d.value, 0);
              const userPct = Math.min((userWon / user.quota) * 100, 100);
              return (
                <div key={user.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    </div>
                    <span className="text-sm font-black text-emerald-600">${userWon.toLocaleString('es-CO')} COP COP</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${userPct}%` }}></div>
                  </div>
                  <p className="text-[10px] text-right text-slate-500 font-medium">{userPct.toFixed(0)}% de la cuota</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Orígenes de Leads Globales</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(contacts.reduce((acc, contact) => {
                acc[contact.source] = (acc[contact.source] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a).map(([source, count]) => {
              const badge = getSourceBadge(source as any);
              const percentage = Math.round((count / contacts.length) * 100);
              return (
                <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${badge.color}`}><badge.icon className="w-4 h-4" /></div>
                    <span className="text-sm font-bold text-slate-700">{badge.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-slate-900">{count}</span>
                    <span className="text-xs text-slate-400 font-medium">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hábitos de Compra (Req 21) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Análisis de Patrones y Hábitos de Compra
          </h3>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
            Inteligencia Comercial
          </span>
        </div>
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'RECURRENTE', label: 'Recurrentes', icon: RotateCw, color: 'text-emerald-600', bg: 'bg-emerald-100', desc: 'Compra constante' },
            { id: 'ESTACIONAL', label: 'Estacionales', icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-100', desc: 'Picos en temporada' },
            { id: 'DICIEMBRE', label: 'Diciembre', icon: Snowflake, color: 'text-blue-600', bg: 'bg-blue-100', desc: 'Fuerte fin de año' },
            { id: 'TRIMESTRAL', label: 'Trimestrales', icon: Target, color: 'text-purple-600', bg: 'bg-purple-100', desc: 'Pedidos grandes cada 3m' }
          ].map(pattern => {
            const count = contacts.filter(c => c.purchaseHistory?.purchasePattern === pattern.id).length;
            return (
              <div key={pattern.id} className="p-4 border border-slate-100 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${pattern.bg} ${pattern.color}`}>
                    <pattern.icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-800">{count}</span>
                </div>
                <h4 className="font-bold text-slate-700">{pattern.label}</h4>
                <p className="text-xs text-slate-500 mt-1">{pattern.desc}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-50">
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver clientes &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gestión Comercial (Req 24) */}
      {(() => {
        // LEADS
        const leadsRecibidos = contacts.length;
        const leadsAtendidos = contacts.filter(c => activities.some(a => a.contactId === c.id)).length;
        const leadsPendientes = leadsRecibidos - leadsAtendidos;

        // PROSPECTOS
        const prospectosIngresados = contacts.filter(c => c.status === 'PROSPECTO' || c.status === 'VINCULADO' || c.status === 'INACTIVO').length; // All that passed LEAD
        const prospectosActivos = contacts.filter(c => c.status === 'PROSPECTO').length;
        const prospectosConvertidos = contacts.filter(c => c.status === 'VINCULADO').length;

        // GESTIÓN TOTAL
        const numGestiones = activities.length;
        const numVisitas = activities.filter(a => a.type === 'VISIT').length;
        const numSeguimientos = activities.filter(a => a.type === 'FOLLOW_UP').length;
        const efectividad = leadsAtendidos > 0 ? (prospectosConvertidos / leadsAtendidos) * 100 : 0;

        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Informe de Gestión Comercial (Global)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Bloque LEADS */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4"><Users className="w-4 h-4"/> Leads</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Recibidos</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">{leadsRecibidos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Atendidos</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">{leadsAtendidos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Pendientes (Sin contacto)</span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded">{leadsPendientes}</span>
                  </div>
                </div>
              </div>

              {/* Bloque PROSPECTOS */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4"><Target className="w-4 h-4"/> Prospectos</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Ingresados</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">{prospectosIngresados}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Activos en Gestión</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded">{prospectosActivos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Convertidos (Ventas)</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">{prospectosConvertidos}</span>
                  </div>
                </div>
              </div>

              {/* Bloque GESTIÓN TOTAL */}
              <div className="p-6 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4"><Activity className="w-4 h-4"/> Gestión Total</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Número Gestiones</span>
                    <span className="font-bold text-indigo-600">{numGestiones}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Visitas Realizadas</span>
                    <span className="font-bold text-slate-900">{numVisitas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 font-medium">Seguimientos</span>
                    <span className="font-bold text-slate-900">{numSeguimientos}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 mt-2 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Efectividad General</span>
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${Math.min(efectividad, 100)}%` }} />
                      </div>
                      <span className="font-black text-slate-900">{efectividad.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
