import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Globe, Calendar, Clock, DollarSign, Target, Activity, FileText, CheckCircle, Search, Eye, TrendingUp, TrendingDown, Briefcase, BarChart2 } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { getSourceBadge } from './CrmFull';

interface CrmClientFullProfileProps {
  contactId: string;
  onBack: () => void;
}

export const CrmClientFullProfile: React.FC<CrmClientFullProfileProps> = ({ contactId, onBack }) => {
  const { contacts, deals, activities, crmUsers, assignmentLogs, getContactHealthScore } = useEnterprise();
  const contact = contacts.find(c => c.id === contactId);

  if (!contact) return <div className="p-8">Contacto no encontrado.</div>;

  const contactDeals = deals.filter(d => d.contactId === contact.id);
  const contactActivities = activities.filter(a => a.contactId === contact.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const contactAssignments = assignmentLogs.filter(a => a.contactId === contact.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const assignedUser = crmUsers.find(u => u.id === contact.ownerId);

  const healthScore = getContactHealthScore(contact.id);
  const healthColor = healthScore === 'GREEN' ? 'bg-emerald-500' : healthScore === 'YELLOW' ? 'bg-amber-500' : 'bg-rose-500';
  const SourceBadge = getSourceBadge(contact.source);
  const SourceIcon = SourceBadge.icon;

  const totalWon = contactDeals.filter(d => d.stage === 'CLOSED_WON').reduce((sum, d) => sum + d.value, 0);
  const totalPipeline = contactDeals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      
      {/* FULL HEADER */}
      <div className="bg-slate-900 text-white p-8 pb-12 flex justify-between items-start shadow-md relative z-10">
        <div className="flex items-start gap-6">
          <button onClick={onBack} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors mt-1">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
              {contact.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-slate-900 ${healthColor}`} title={`Salud: ${healthScore}`} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black tracking-tight">{contact.name}</h1>
              <span className={`px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider ${SourceBadge.color} bg-opacity-20 text-white border border-white/20 flex items-center gap-1`}>
                <SourceIcon className="w-3 h-3"/> {SourceBadge.label}
              </span>
            </div>
            <h2 className="text-xl text-slate-400 font-medium mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> {contact.company}
            </h2>
            
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-300">
              <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /> {contact.email}</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" /> {contact.phone}</span>
              {contact.purchaseHistory?.purchasePattern && (
                 <span className="flex items-center gap-2 bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                    <Activity className="w-4 h-4" /> Patrón: {contact.purchaseHistory.purchasePattern}
                 </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Comercial Asignado</p>
          <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-xl border border-slate-700">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300">
              {assignedUser ? assignedUser.name.charAt(0) : '?'}
            </div>
            <div className="text-left pr-3">
              <p className="font-bold text-white">{assignedUser ? assignedUser.name : 'Sin Asignar'}</p>
              <p className="text-xs text-slate-400">{assignedUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* BODY / DASHBOARD GRIDS */}
      <div className="flex-1 overflow-y-auto p-8 -mt-6 relative z-20 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">

            {/* TOP METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Facturación Total (Ganado)</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-1">${totalWon.toLocaleString('es-CO')}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Valor en Pipeline Activo</p>
                    <h3 className="text-2xl font-black text-indigo-600 mt-1">${totalPipeline.toLocaleString('es-CO')}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Tratos en Curso</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{contactDeals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').length}</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase">Estado Actual</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{contact.status}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* FINANCIAL & PROFITABILITY */}
                    {contact.purchaseHistory && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-emerald-500"/> Módulo Financiero y Rentabilidad</h3>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Mes Actual</p>
                                    <p className="text-lg font-bold text-slate-900">${(contact.purchaseHistory.monthly / 1000000).toFixed(1)}M</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Trimestre</p>
                                    <p className="text-lg font-bold text-slate-900">${(contact.purchaseHistory.quarterly / 1000000).toFixed(1)}M</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Año Actual</p>
                                    <p className="text-lg font-bold text-slate-900">${(contact.purchaseHistory.annual / 1000000).toFixed(1)}M</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Rentabilidad</p>
                                    <p className="text-lg font-bold text-emerald-600">{contact.purchaseHistory.profitabilityMargin}%</p>
                                </div>
                            </div>

                            <p className="text-xs font-bold text-slate-400 uppercase mb-4 border-t border-slate-100 pt-4">Evolución Comercial (Últimos Meses)</p>
                            <div className="flex items-end gap-3 h-32 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {contact.purchaseHistory.evolution.map((point, idx) => {
                                    const maxAmount = Math.max(...contact.purchaseHistory!.evolution.map(e => e.amount));
                                    const heightPct = Math.max((point.amount / maxAmount) * 100, 10);
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-2 h-full group">
                                            <div className="w-full bg-emerald-200 rounded-t-md relative transition-all group-hover:bg-emerald-400" style={{ height: `${heightPct}%` }}>
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity z-10 shadow-lg">
                                                    ${(point.amount / 1000000).toFixed(1)}M
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 uppercase">{point.month}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* PIPELINE DEALS */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500"/> Negocios y Oportunidades (Pipeline)</h3>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800">+ Crear Trato</button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {contactDeals.length > 0 ? contactDeals.map(deal => (
                                <div key={deal.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{deal.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${deal.stage === 'CLOSED_WON' ? 'bg-emerald-100 text-emerald-700' : deal.stage === 'CLOSED_LOST' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {deal.stage}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> Creado: {new Date(deal.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-800">${deal.value.toLocaleString('es-CO')}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-500 italic">No hay negocios asociados a este cliente.</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                    
                    {/* TIMELINE COMPLETO */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: '800px' }}>
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shadow-sm relative z-10">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity className="w-5 h-5 text-amber-500"/> Timeline de Interacciones</h3>
                            <span className="text-xs font-bold text-slate-400">{contactActivities.length} registros</span>
                        </div>
                        <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                            {contactActivities.length > 0 ? contactActivities.map(act => (
                                <div key={act.id} className="relative pl-6 border-l-2 border-slate-100 pb-2">
                                    <div className={`absolute -left-[11px] top-0 p-1 rounded-full bg-white border-2 ${act.status === 'COMPLETED' ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                                        {act.type === 'CALL' ? <Phone className="w-3 h-3"/> : act.type === 'EMAIL' ? <Mail className="w-3 h-3"/> : <Calendar className="w-3 h-3"/>}
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:border-slate-200 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-slate-800">{act.title}</h4>
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(act.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">{act.description}</p>
                                        
                                        {act.nextAction && (
                                            <div className="mt-2 pt-2 border-t border-slate-200/60">
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase mb-0.5">Siguiente Paso</p>
                                                <p className="text-xs text-slate-700">{act.nextAction} <span className="text-slate-400 ml-1">({act.nextActionDate ? new Date(act.nextActionDate).toLocaleDateString() : 'Sin fecha'})</span></p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-sm text-slate-500 italic py-4">No hay interacciones registradas.</p>
                            )}
                        </div>
                    </div>

                    {/* VAULT */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5 text-rose-500"/> Bóveda de Archivos</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-100 text-rose-600 rounded"><FileText className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Contrato_Master_2026.pdf</p>
                                        <p className="text-[10px] text-slate-500">2.4 MB • Hace 2 días</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded"><FileText className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-800">Cotizacion_Aprobada.xlsx</p>
                                        <p className="text-[10px] text-slate-500">1.1 MB • Hace 1 semana</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-2 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                + Subir Archivo
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </motion.div>
  );
};
