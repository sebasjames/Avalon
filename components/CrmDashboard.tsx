import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, TrendingUp, Users, Target, Activity, CalendarDays, Snowflake, RotateCw, PhoneCall, CheckCircle, Clock, X } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { getSourceBadge } from './CrmFull';

export const CrmDashboard: React.FC = () => {
  const { deals, contacts, activities, crmUsers, crmSettings } = useEnterprise();

  // Global metrics (ignoring filterOwner because this is a global dashboard)
  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON').reduce((sum, deal) => sum + deal.value, 0);
  const winRate = deals.length > 0 ? (deals.filter(d => d.stage === 'CLOSED_WON').length / deals.length) * 100 : 0;
  const lostDealsCount = deals.filter(d => d.stage === 'CLOSED_LOST').length;
  const wonDealsCountTop = deals.filter(d => d.stage === 'CLOSED_WON').length;

  const overdueActivities = activities.filter(a =>
    a.status !== 'COMPLETED' &&
    new Date(a.date).getTime() < Date.now()
  );

  const revenueGoal = crmSettings.globalGoals.monthlyRevenue;
  const progressPercent = Math.min((wonDeals / revenueGoal) * 100, 100);

  const [selectedPatternClients, setSelectedPatternClients] = useState<{id: string, label: string} | null>(null);

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
            <div className="flex gap-12">
              <div>
                <p className="text-sm font-bold text-slate-500">Recaudado</p>
                <h3 className={`text-2xl font-black ${progressPercent >= 95 ? 'text-emerald-600' : 'text-orange-500'}`}>${wonDeals.toLocaleString('es-CO')} COP</h3>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Meta Global</p>
                <h3 className="text-2xl font-black text-slate-900">${revenueGoal.toLocaleString('es-CO')} COP</h3>
              </div>
            </div>
            <span className="text-4xl font-black text-indigo-600">{progressPercent.toFixed(1)}%</span>
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
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalPipelineValue.toLocaleString('es-CO')} COP</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500">Ingresos Ganados (Caja)</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">${wonDeals.toLocaleString('es-CO')} COP</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500">Oportunidades/Prospectos Ganadas</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{wonDealsCountTop}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-sm font-medium text-slate-500">Oportunidades/Prospectos Perdidas</p>
          <h3 className="text-2xl font-bold text-rose-600 mt-1">{lostDealsCount}</h3>
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
                    <span className="text-sm font-black text-emerald-600">${userWon.toLocaleString('es-CO')} COP</span>
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
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Orígenes de Prospectos Globales</h3>
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
                  <button 
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedPatternClients({ id: pattern.id, label: pattern.label })}
                  >
                    Ver clientes &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informe de Productividad y Rendimiento (Global) */}
      {(() => {
        // 1. Embudo de Conversión
        const totalContacts = contacts.length;
        const openDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').length;
        const wonDealsCount = deals.filter(d => d.stage === 'CLOSED_WON').length;
        
        // 2. Desglose de Productividad
        const totalActivities = activities.length || 1; // Evitar división por cero
        const actVisits = activities.filter(a => a.type === 'VISIT').length;
        const actCalls = activities.filter(a => a.type === 'CALL').length;
        const actWhatsApp = activities.filter(a => a.type === 'WHATSAPP').length;
        const actEmails = activities.filter(a => a.type === 'EMAIL').length;
        const actMeetings = activities.filter(a => a.type === 'MEETING').length;
        
        const completedActivities = activities.filter(a => a.status === 'COMPLETED').length;
        const completionRate = (completedActivities / totalActivities) * 100;

        // 3. Salud del Pipeline
        const activeDeals = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
        const pipelineNominal = activeDeals.reduce((sum, d) => sum + d.value, 0);
        const pipelinePonderado = activeDeals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);
        const ticketPromedio = deals.length > 0 ? (deals.reduce((sum, d) => sum + d.value, 0) / deals.length) : 0;
        const leadsSinSeguimiento = contacts.filter(c => !activities.some(a => a.contactId === c.id)).length;

        return (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Productividad y Rendimiento del Embudo
              </h3>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Data
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              {/* 1. EMBUDO DE CONVERSIÓN */}
              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6"><Target className="w-4 h-4" /> Embudo Comercial</h4>
                <div className="space-y-4 relative">
                  {/* Línea conectora visual */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>
                  
                  <div className="flex items-center gap-4 bg-white">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-slate-200">1</div>
                    <div className="flex-1 flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <span className="text-sm text-slate-600 font-bold">Total Base Datos</span>
                      <span className="font-black text-slate-900">{totalContacts}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-blue-200">2</div>
                    <div className="flex-1 flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <span className="text-sm text-slate-600 font-bold">Oportunidades Abiertas</span>
                      <span className="font-black text-blue-700">{openDeals}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-emerald-200">3</div>
                    <div className="flex-1 flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                      <span className="text-sm text-emerald-800 font-bold">Negocios Ganados</span>
                      <span className="font-black text-emerald-700">{wonDealsCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6"><Activity className="w-4 h-4" /> Actividades Comerciales</h4>
                
                <div className="space-y-3 mb-6">
                  {/* Barras de progreso de actividades */}
                  {[
                    { label: 'Visitas', count: actVisits, color: 'bg-emerald-500' },
                    { label: 'WhatsApp', count: actWhatsApp, color: 'bg-green-500' },
                    { label: 'Llamadas', count: actCalls, color: 'bg-blue-500' },
                    { label: 'Reuniones', count: actMeetings, color: 'bg-purple-500' },
                    { label: 'Correos', count: actEmails, color: 'bg-slate-400' },
                  ].map(act => (
                    <div key={act.label} className="flex items-center gap-3">
                      <div className="w-20 text-xs font-semibold text-slate-500">{act.label}</div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${act.color} rounded-full`} style={{ width: `${(act.count / totalActivities) * 100}%` }} />
                      </div>
                      <div className="w-8 text-right text-xs font-bold text-slate-700">{act.count}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tasa de Ejecución</p>
                      <p className="text-sm text-slate-600 font-medium">Actividades completadas</p>
                    </div>
                    <span className="text-xl font-black text-indigo-600">{completionRate.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* 3. SALUD DEL PIPELINE */}
              <div className="p-6 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6"><CheckCircle className="w-4 h-4" /> Salud del Embudo</h4>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-500 font-medium">Embudo Nominal</span>
                      <span className="font-bold text-slate-800">${(pipelineNominal / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg">
                      <span className="text-sm text-indigo-800 font-bold">Embudo Ponderado</span>
                      <span className="font-black text-indigo-700">${(pipelinePonderado / 1000000).toFixed(1)}M</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 ml-1 leading-tight">Valor ajustado según la probabilidad de cierre de cada oportunidad activa.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Ticket Promedio</p>
                      <p className="font-black text-slate-800">${(ticketPromedio / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className={`border p-3 rounded-lg shadow-sm ${leadsSinSeguimiento > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <p className={`text-[10px] uppercase font-bold mb-1 ${leadsSinSeguimiento > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>Leads sin gestión</p>
                      <p className={`font-black ${leadsSinSeguimiento > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{leadsSinSeguimiento}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <AnimatePresence>
        {selectedPatternClients && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-800">
                  Clientes - Patrón: {selectedPatternClients.label}
                </h3>
                <button onClick={() => setSelectedPatternClients(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-3">
                  {contacts.filter(c => c.purchaseHistory?.purchasePattern === selectedPatternClients.id).length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No hay clientes con este patrón de compra en este momento.
                    </div>
                  ) : (
                    contacts.filter(c => c.purchaseHistory?.purchasePattern === selectedPatternClients.id).map(contact => (
                      <div key={contact.id} className="p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all flex justify-between items-center bg-white">
                        <div>
                          <div className="font-bold text-slate-800">{contact.company}</div>
                          <div className="text-sm text-slate-500">{contact.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Facturación</div>
                          <div className="font-medium text-slate-900">${(contact.purchaseHistory?.annual || 0).toLocaleString('es-CO')} COP</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
