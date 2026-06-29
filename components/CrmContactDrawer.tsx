import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Phone, Users, Plus, Calendar, Clock, Send, Paperclip, FileText, Download, UploadCloud, Trophy, CheckCircle2, TrendingUp, BarChart2, Eye, Tags } from 'lucide-react';
import { CrmContact, CrmDeal, CrmActivity, CustomerTier, CrmAssignmentLog } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';

interface CrmContactDrawerProps {
  contact: CrmContact;
  contactDeals: CrmDeal[];
  contactActivities: CrmActivity[];
  contactAssignmentLogs: CrmAssignmentLog[];
  getSourceBadge: (source: string) => { label: string; color: string; icon: any };
  onClose: () => void;
  onAddNote: (contactId: string, noteText: string, activityType: string, scheduledDate?: string, nextAction?: string, nextActionDate?: string) => void;
}

export const CrmContactDrawer: React.FC<CrmContactDrawerProps> = ({ 
  contact, contactDeals, contactActivities, contactAssignmentLogs, getSourceBadge, onClose, onAddNote 
}) => {
  const [noteText, setNoteText] = useState('');
  const [activityType, setActivityType] = useState('CALL');
  const [taskDate, setTaskDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const { setFullProfileContactId, taxRules, pricingRules, paymentRules, updateContact } = useEnterprise();
  
  const [mockFiles, setMockFiles] = useState([
    { id: 'f1', name: 'Cotizacion_Procoquinal_v2.pdf', size: '1.2 MB', date: 'Hoy' },
    { id: 'f2', name: 'Contrato_Soporte_Firmado.pdf', size: '4.5 MB', date: 'Hace 3 días' }
  ]);

  const [affinityData, setAffinityData] = useState({
    birthday: '',
    children: '',
    hobbies: '',
    favoriteSport: ''
  });
  const [isEditingCommercialRules, setIsEditingCommercialRules] = useState(false);

  // Calculate completeness based on filled affinity fields (mock logic)
  const filledFields = Object.values(affinityData).filter(val => val.trim() !== '').length;
  const profileCompleteness = filledFields === 0 ? 25 : filledFields === 1 ? 50 : filledFields === 2 ? 75 : 100;


  const sourceBadge = getSourceBadge(contact.source);
  const SourceIcon = sourceBadge.icon;

  const handleSend = () => {
    if (noteText.trim()) {
      onAddNote(contact.id, noteText.trim(), activityType, taskDate, nextAction, nextActionDate);
      setNoteText('');
      setTaskDate('');
      setNextAction('');
      setNextActionDate('');
    }
  };

  const handleSimulateUpload = () => {
    setMockFiles([{ id: Date.now().toString(), name: 'Documento_Adjunto_Nuevo.pdf', size: '0.8 MB', date: 'Recién ahora' }, ...mockFiles]);
  };

  const timelineEvents = [
    ...contactActivities.map(a => ({ ...a, eventType: 'ACTIVITY' as const })),
    ...contactAssignmentLogs.map(l => ({ ...l, eventType: 'ASSIGNMENT' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col relative z-10 border-l border-slate-200"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-inner">
              {contact.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{contact.name}</h2>
              <p className="text-sm text-slate-500 font-medium">{contact.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setFullProfileContactId(contact.id)}
              className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors flex items-center gap-1"
              title="Abrir Panel Full Data"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Action Box: Note OR Task (NEW) */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 bg-indigo-50 px-4 py-2">
                <span className="text-sm font-bold text-indigo-800">Registrar Interacción</span>
            </div>
            <div className="p-3">
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500">Tipo de Gestión</label>
                        <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-md p-1.5 text-sm outline-none focus:border-indigo-500">
                            <option value="CALL">Llamada</option>
                            <option value="VISIT">Visita</option>
                            <option value="WHATSAPP">WhatsApp</option>
                            <option value="EMAIL">Correo</option>
                            <option value="QUOTE">Cotización</option>
                            <option value="MEETING">Reunión</option>
                            <option value="FOLLOW_UP">Seguimiento</option>
                            <option value="TASK">Otra Tarea</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Fecha de Gestión</label>
                        <input type="datetime-local" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-md p-1.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                </div>
                
                <textarea 
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={"Observaciones de la gestión..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all resize-none h-20 mb-3"
                />

                <div className="grid grid-cols-2 gap-3 mb-3 border-t border-slate-100 pt-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500">Siguiente Acción</label>
                        <input type="text" value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Ej. Enviar propuesta" className="w-full mt-1 border border-slate-200 rounded-md p-1.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">Próxima Fecha de Contacto</label>
                        <input type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)} className="w-full mt-1 border border-slate-200 rounded-md p-1.5 text-sm outline-none focus:border-indigo-500" />
                    </div>
                </div>

                <div className="mt-2 flex justify-end">
                    <button 
                      onClick={handleSend}
                      disabled={!noteText.trim()}
                      className="px-4 py-1.5 flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 font-medium text-sm transition-colors"
                    >
                      <Send className="w-4 h-4"/> Guardar Registro
                    </button>
                </div>
            </div>
          </section>

          {/* Attachments Section (NEW) */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Archivos y Cotizaciones</h3>
              <button onClick={handleSimulateUpload} className="text-indigo-600 flex items-center gap-1 hover:text-indigo-700 px-2 py-1 text-xs font-semibold rounded hover:bg-indigo-50 transition-colors">
                <UploadCloud className="w-3.5 h-3.5" /> Subir
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {mockFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-slate-50 group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-md">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-[10px] text-slate-400">{file.size} • {file.date}</p>
                            </div>
                        </div>
                        <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="w-4 h-4 hover:text-indigo-600" />
                        </button>
                    </div>
                ))}
            </div>
          </section>

          {/* Info Section */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Información del Contacto</h3>
            <div className="space-y-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">{contact.phone}</span>
              </div>

              {(contact.contact2 || contact.phone2) && (
                <div className="pt-3 mt-1 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contacto 2</div>
                  <div className="flex flex-col gap-1.5">
                    {contact.contact2 && <span className="text-sm font-medium text-slate-700">{contact.contact2}</span>}
                    {contact.phone2 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{contact.phone2}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(contact.contact3 || contact.phone3) && (
                <div className="pt-3 mt-1 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contacto 3</div>
                  <div className="flex flex-col gap-1.5">
                    {contact.contact3 && <span className="text-sm font-medium text-slate-700">{contact.contact3}</span>}
                    {contact.phone3 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600">{contact.phone3}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 mt-1 border-t border-slate-100 flex items-center gap-3 text-sm">
                <SourceIcon className="w-4 h-4 text-slate-400" />
                <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sourceBadge.color}`}>
                  {sourceBadge.label}
                </div>
              </div>
            </div>
          </section>

          {/* Historical Purchase Section (Req 16) */}
          {contact.purchaseHistory && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                Histórico de Compra
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mes Actual</p>
                    <p className="text-lg font-bold text-slate-900">${(contact.purchaseHistory.monthly / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Trimestre</p>
                    <p className="text-lg font-bold text-slate-900">${(contact.purchaseHistory.quarterly / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Año Actual</p>
                    <p className="text-lg font-bold text-slate-900">${(contact.purchaseHistory.annual / 1000000).toFixed(1)}M</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Año Anterior</p>
                    <div className="flex items-end justify-between">
                        <p className="text-lg font-bold text-slate-900">${(contact.purchaseHistory.previousYear / 1000000).toFixed(1)}M</p>
                        {contact.purchaseHistory.annual > contact.purchaseHistory.previousYear ? (
                           <span className="text-xs font-bold text-emerald-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> +{((contact.purchaseHistory.annual / contact.purchaseHistory.previousYear - 1) * 100).toFixed(1)}%</span>
                        ) : (
                           <span className="text-xs font-bold text-rose-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5 transform rotate-180" /> {((contact.purchaseHistory.annual / contact.purchaseHistory.previousYear - 1) * 100).toFixed(1)}%</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Evolución Comercial (Últimos 4 Meses)</p>
                <div className="flex items-end gap-2 h-24">
                    {contact.purchaseHistory.evolution.map((point, idx) => {
                        const maxAmount = Math.max(...contact.purchaseHistory!.evolution.map(e => e.amount));
                        const heightPct = Math.max((point.amount / maxAmount) * 100, 5); // min 5% height
                        return (
                            <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-2 h-full group cursor-pointer">
                                <div className="w-full bg-emerald-100 rounded-t-sm relative transition-all group-hover:bg-emerald-300" style={{ height: `${heightPct}%` }}>
                                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 shadow-lg">
                                        ${(point.amount / 1000000).toFixed(1)}M
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{point.month}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
          </section>
          )}

          {/* Deep Profiling / Affinity Data Section (NEW) */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                Perfilado Profundo (Afinidad)
              </h3>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {profileCompleteness}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profileCompleteness}%` }}
                    className={`h-full transition-all duration-500 ${profileCompleteness === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                />
            </div>
            
            {profileCompleteness === 100 && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-2 rounded-lg text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    ¡Perfil completo! Bono "Detective de Datos" desbloqueado.
                </motion.div>
            )}

            <div className="space-y-3 bg-slate-50 border border-indigo-100 rounded-xl p-4">
              <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Cumpleaños</label>
                  <input 
                      type="date" 
                      value={affinityData.birthday}
                      onChange={(e) => setAffinityData({...affinityData, birthday: e.target.value})}
                      className="w-full text-sm border border-slate-200 rounded-md p-1.5 bg-white focus:outline-none focus:border-indigo-400" 
                  />
              </div>
              <div className="flex gap-3">
                  <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Hijos</label>
                      <input 
                          type="number" 
                          placeholder="Cantidad"
                          value={affinityData.children}
                          onChange={(e) => setAffinityData({...affinityData, children: e.target.value})}
                          className="w-full text-sm border border-slate-200 rounded-md p-1.5 bg-white focus:outline-none focus:border-indigo-400" 
                      />
                  </div>
                  <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Deporte Fav.</label>
                      <input 
                          type="text" 
                          placeholder="Ej. Fútbol"
                          value={affinityData.favoriteSport}
                          onChange={(e) => setAffinityData({...affinityData, favoriteSport: e.target.value})}
                          className="w-full text-sm border border-slate-200 rounded-md p-1.5 bg-white focus:outline-none focus:border-indigo-400" 
                      />
                  </div>
              </div>
              <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Hobbies / Intereses</label>
                  <input 
                      type="text" 
                      placeholder="Ej. Colecciona vinos, viajes..."
                      value={affinityData.hobbies}
                      onChange={(e) => setAffinityData({...affinityData, hobbies: e.target.value})}
                      className="w-full text-sm border border-slate-200 rounded-md p-1.5 bg-white focus:outline-none focus:border-indigo-400" 
                  />
              </div>
            </div>
          </section>

          {/* Unified Timeline Section (Phase 1) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeline ({timelineEvents.length})</h3>
            </div>
            <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 pb-4">
              {timelineEvents.length > 0 ? timelineEvents.map((event) => {
                const isActivity = event.eventType === 'ACTIVITY';
                if (isActivity) {
                  const activity = event as typeof event & CrmActivity;
                  return (
                    <div key={activity.id} className="relative pl-6">
                      <div className={`absolute -left-[17px] top-1 p-1.5 rounded-full border-2 border-white ${
                        activity.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 
                        new Date(activity.date) < new Date() ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {activity.type === 'CALL' ? <Phone className="w-3 h-3" /> : 
                         activity.type === 'EMAIL' ? <Mail className="w-3 h-3" /> : 
                         <Calendar className="w-3 h-3" />}
                      </div>
                      <div className={`p-3 rounded-lg border shadow-sm ${new Date(activity.date) > new Date() && activity.status !== 'COMPLETED' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 bg-white'}`}>
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-slate-900 text-sm flex gap-2">
                            {activity.title}
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{activity.type}</span>
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                        {activity.nextAction && (
                            <div className="mt-2 p-2 bg-indigo-50 border border-indigo-100 rounded-md">
                                <span className="text-[10px] font-bold text-indigo-700 uppercase">Siguiente Acción:</span>
                                <p className="text-xs text-slate-700">{activity.nextAction} {activity.nextActionDate && <b>({new Date(activity.nextActionDate).toLocaleDateString()})</b>}</p>
                            </div>
                        )}
                        <time className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${activity.status === 'COMPLETED' ? 'text-emerald-500' : new Date(activity.date) < new Date() ? 'text-rose-500' : 'text-amber-500'}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(activity.date).toLocaleString('es-CO')} • {activity.status === 'COMPLETED' ? 'COMPLETADO' : activity.status === 'PENDING' ? 'PENDIENTE' : activity.status}
                        </time>
                      </div>
                    </div>
                  );
                } else {
                  const log = event as typeof event & CrmAssignmentLog;
                  return (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute -left-[17px] top-1 p-1.5 rounded-full border-2 border-white bg-blue-100 text-blue-600">
                        <Users className="w-3 h-3" />
                      </div>
                      <div className="p-3 rounded-lg border border-slate-100 shadow-sm bg-slate-50">
                        <h4 className="font-semibold text-slate-900 text-sm">Transferido a ID: {log.newOwnerId}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Asignado por: {log.assignedByUserId} {log.previousOwnerId ? `(Anterior: ${log.previousOwnerId})` : ''}</p>
                        <time className="text-[10px] font-bold flex items-center gap-1 mt-2 text-slate-400">
                          <Clock className="w-3 h-3" />
                          {new Date(log.date).toLocaleString('es-CO')}
                        </time>
                      </div>
                    </div>
                  );
                }
              }) : (
                <p className="text-sm text-slate-500 italic ml-6">No hay timeline registrado.</p>
              )}
            </div>
          </section>

          {/* Commercial Rules Section (Moved to Bottom) */}
          <section>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tags className="w-4 h-4 text-indigo-500" />
                    Condiciones Comerciales
                </h3>
                {!isEditingCommercialRules ? (
                    <button 
                        onClick={() => setIsEditingCommercialRules(true)}
                        className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-100 font-bold transition-colors"
                    >
                        Solicitar Cambio
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsEditingCommercialRules(false)}
                        className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-md hover:bg-emerald-100 font-bold transition-colors"
                    >
                        Guardar
                    </button>
                )}
            </div>
            <div className="space-y-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Regla Fiscal (Impuestos)</label>
                    <select 
                        disabled={!isEditingCommercialRules}
                        value={contact.taxRuleId || ''}
                        onChange={(e) => updateContact(contact.id, { taxRuleId: e.target.value || undefined })}
                        className={`w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditingCommercialRules ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <option value="">Ninguna (Por defecto)</option>
                        {taxRules.map(r => <option key={r.id} value={r.id}>{r.name} (IVA {r.taxRateOverride}%)</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Regla de Precio</label>
                    <select 
                        disabled={!isEditingCommercialRules}
                        value={contact.pricingRuleId || ''}
                        onChange={(e) => updateContact(contact.id, { pricingRuleId: e.target.value || undefined })}
                        className={`w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditingCommercialRules ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <option value="">Ninguna (Sin descuento especial)</option>
                        {pricingRules.map(r => <option key={r.id} value={r.id}>{r.name} ({r.discountPercentage}%)</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Condición de Pago</label>
                    <select 
                        disabled={!isEditingCommercialRules}
                        value={contact.paymentRuleId || ''}
                        onChange={(e) => updateContact(contact.id, { paymentRuleId: e.target.value || undefined })}
                        className={`w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditingCommercialRules ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <option value="">Ninguna (Contado por defecto)</option>
                        {paymentRules.map(r => <option key={r.id} value={r.id}>{r.name} {r.type === 'CREDITO' ? `(${r.days} días)` : ''}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Clasificación Fiscal</label>
                    <select 
                        disabled={!isEditingCommercialRules}
                        value={contact.fiscalClassification || ''}
                        onChange={(e) => updateContact(contact.id, { fiscalClassification: (e.target.value as any) || undefined })}
                        className={`w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditingCommercialRules ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <option value="">Seleccione clasificación...</option>
                        <option value="PERSONA_NATURAL">Persona Natural</option>
                        <option value="PERSONA_JURIDICA">Persona Jurídica</option>
                        <option value="GRAN_CONTRIBUYENTE">Gran Contribuyente</option>
                        <option value="REGIMEN_SIMPLE">Régimen Simple</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Ciudad (Sede de Operación)</label>
                    <select 
                        disabled={!isEditingCommercialRules}
                        value={contact.cityCode || ''}
                        onChange={(e) => updateContact(contact.id, { cityCode: (e.target.value as any) || undefined })}
                        className={`w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 ${!isEditingCommercialRules ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <option value="">Seleccione ciudad...</option>
                        <option value="BOGOTA">Bogotá D.C.</option>
                        <option value="BARRANQUILLA">Barranquilla</option>
                        <option value="OTRA">Otra / Exento</option>
                    </select>
                </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};
