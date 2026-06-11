import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEnterprise } from '../context/EnterpriseContext';
import { User, Target, BarChart2, Calendar, Phone, Mail, X, Activity, TrendingDown, TrendingUp } from 'lucide-react';
import { CrmUser } from '../types';

export const CrmTeam: React.FC = () => {
  const { crmUsers, deals, activities } = useEnterprise();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedUser = crmUsers.find(u => u.id === selectedUserId);
  const salesReps = crmUsers.filter(u => u.role === 'SALES_REP' || u.role === 'MANAGER');

  return (
    <div className="space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salesReps.map(user => {
          const userDeals = deals.filter(d => d.ownerId === user.id);
          const won = userDeals.filter(d => d.stage === 'CLOSED_WON').reduce((s, d) => s + d.value, 0);
          const pipeline = userDeals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').reduce((s, d) => s + d.value, 0);
          const pct = Math.min((won / user.quota) * 100, 100);

          return (
            <motion.div 
              whileHover={{ y: -4 }}
              key={user.id} 
              onClick={() => setSelectedUserId(user.id)}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{user.name}</h3>
                  <p className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block">{user.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500 font-medium">Cuota Mensual</span>
                    <span className="font-bold text-slate-800">${won.toLocaleString('es-CO')} COP COP / ${user.quota.toLocaleString('es-CO')} COP COP</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Pipeline Activo</p>
                    <p className="font-bold text-indigo-600">${pipeline.toLocaleString('es-CO')} COP COP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Tratos</p>
                    <p className="font-bold text-slate-700">{userDeals.length}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedUser.name}</h2>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserId(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Modulo 1: Actividad */}
              {(() => {
                const uActs = activities.filter(a => a.ownerId === selectedUser.id);
                const visited = uActs.filter(a => a.type === 'VISIT' && a.status === 'COMPLETED').length;
                const contacted = new Set(uActs.map(a => a.contactId)).size;
                const meetings = uActs.filter(a => a.type === 'MEETING' && a.status === 'COMPLETED').length;
                const calls = uActs.filter(a => a.type === 'CALL' && a.status === 'COMPLETED').length;
                const followUps = uActs.filter(a => a.type === 'FOLLOW_UP' && a.status === 'COMPLETED').length;

                return (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-indigo-500"/> Actividad (Ejecución)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Clientes Visitados</p>
                          <p className="text-xl font-bold text-slate-900">{visited}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Contactados</p>
                          <p className="text-xl font-bold text-slate-900">{contacted}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Reuniones</p>
                          <p className="text-xl font-bold text-indigo-600">{meetings}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Llamadas</p>
                          <p className="text-xl font-bold text-indigo-600">{calls}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Seguimientos</p>
                          <p className="text-xl font-bold text-indigo-600">{followUps}</p>
                        </div>
                    </div>
                  </div>
                )
              })()}

              {/* Modulo 2: Conversión */}
              {(() => {
                const uContacts = contacts.filter(c => c.ownerId === selectedUser.id);
                const leadsIngresados = uContacts.filter(c => c.status === 'LEAD' || c.status === 'PROSPECTO').length;
                const leadsGestionados = uContacts.filter(c => activities.some(a => a.contactId === c.id && a.status === 'COMPLETED')).length;
                const leadsConvertidos = uContacts.filter(c => c.status === 'VINCULADO').length;
                
                const uDeals = deals.filter(d => d.ownerId === selectedUser.id);
                const negociosEfectivos = uDeals.filter(d => d.stage === 'CLOSED_WON').length;
                const tasaConversion = uDeals.length > 0 ? (negociosEfectivos / uDeals.length) * 100 : 0;

                return (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Target className="w-4 h-4 text-emerald-500"/> Conversión (Efectividad)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Prospectos Ingresados</p>
                          <p className="text-lg font-bold text-slate-900">{leadsIngresados}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Prospectos Gestionados</p>
                          <p className="text-lg font-bold text-slate-900">{leadsGestionados}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Prospectos Convertidos</p>
                          <p className="text-lg font-bold text-emerald-600">{leadsConvertidos}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Negocios Efectivos</p>
                          <p className="text-lg font-bold text-emerald-600">{negociosEfectivos}</p>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Porcentaje de Conversión</p>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${tasaConversion}%` }}></div>
                            </div>
                            <p className="text-sm font-bold text-slate-900">{tasaConversion.toFixed(1)}%</p>
                          </div>
                        </div>
                    </div>
                  </div>
                )
              })()}

              {/* Modulo 3: Rentabilización */}
              {(() => {
                const uContacts = contacts.filter(c => c.ownerId === selectedUser.id && c.purchaseHistory);
                
                let mejoranColor = 0;
                let bajanColor = 0;
                let recuperados = 0;
                let estables = 0;

                uContacts.forEach(c => {
                    const hist = c.purchaseHistory!;
                    const base = hist.historicalAverage || hist.previousYear || 1;
                    const trendPct = ((hist.annual - base) / base) * 100;

                    if (c.status === 'VINCULADO' && c.postSaleStage === 'ONBOARDING') {
                       recuperados++;
                    } else if (trendPct > 5) {
                       mejoranColor++;
                    } else if (trendPct < -5) {
                       bajanColor++;
                    } else {
                       estables++;
                    }
                });

                return (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4 text-purple-500"/> Rentabilización (Cartera)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Mejoran Color (Salud +)</p>
                          <p className="text-lg font-bold text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> {mejoranColor}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Bajan Color (Riesgo)</p>
                          <p className="text-lg font-bold text-rose-600 flex items-center gap-1"><TrendingDown className="w-3 h-3"/> {bajanColor}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Clientes Recuperados</p>
                          <p className="text-lg font-bold text-blue-600">{recuperados}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Clientes Estables</p>
                          <p className="text-lg font-bold text-slate-600">{estables}</p>
                        </div>
                    </div>
                  </div>
                )
              })()}

              <div>
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-indigo-500"/> Pipeline Principal</h4>
                <div className="space-y-3">
                  {deals.filter(d => d.ownerId === selectedUser.id && d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').sort((a,b) => b.value - a.value).slice(0, 5).map(deal => (
                    <div key={deal.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm text-slate-800">{deal.title}</span>
                        <span className="font-bold text-sm text-indigo-600">${deal.value.toLocaleString('es-CO')} COP COP</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500">{deal.company}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded">{deal.stage}</span>
                      </div>
                    </div>
                  ))}
                  {deals.filter(d => d.ownerId === selectedUser.id && d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').length === 0 && (
                    <p className="text-sm text-slate-500 italic">No hay tratos activos en este momento.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-indigo-500"/> Actividades Recientes</h4>
                <div className="space-y-3">
                  {activities.filter(a => a.ownerId === selectedUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(act => (
                    <div key={act.id} className="flex gap-3">
                      <div className={`mt-1 p-1.5 rounded-full ${act.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {act.type === 'CALL' ? <Phone className="w-3 h-3"/> : act.type === 'EMAIL' ? <Mail className="w-3 h-3"/> : <Calendar className="w-3 h-3"/>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{act.title}</p>
                        <p className="text-xs text-slate-500">{new Date(act.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/20 z-40" onClick={() => setSelectedUserId(null)} />
      )}
    </div>
  );
};
