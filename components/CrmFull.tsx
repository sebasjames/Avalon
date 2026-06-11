import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Briefcase, Calendar, BarChart3, Plus, Search, Filter, 
  Phone, Mail, CheckCircle2, Clock, Share2, MapPin, Globe, UserPlus, AlertTriangle, Settings, PieChart, Target, Heart
} from 'lucide-react';

import { CrmDealStage, CrmLeadSource, CustomerTier, CrmDeal, CrmContact, CrmActivity } from '../types';

import { CrmPipeline } from './CrmPipeline';
import { CrmContactsTable } from './CrmContactsTable';
import { CrmContactDrawer } from './CrmContactDrawer';
import { CrmDashboard } from './CrmDashboard';
import { CrmTeam } from './CrmTeam';
import { CrmConfig } from './CrmConfig';
import { CrmPostSalePipeline } from './CrmPostSalePipeline';
import { CrmProfitabilityModule } from './CrmProfitabilityModule';
import { CrmClientFullProfile } from './CrmClientFullProfile';
import { useEnterprise } from '../context/EnterpriseContext';

type CrmTab = 'dashboard' | 'embudo' | 'postventa' | 'contactos' | 'equipo' | 'actividades' | 'configuracion' | 'rentabilidad';

export const getSourceBadge = (source: string | CrmLeadSource) => {
  switch (source as CrmLeadSource) {
    case 'FACEBOOK': return { label: 'Facebook', color: 'bg-blue-100 text-blue-700', icon: Share2 };
    case 'INSTAGRAM': return { label: 'Instagram', color: 'bg-pink-100 text-pink-700', icon: Share2 };
    case 'TIKTOK': return { label: 'TikTok', color: 'bg-slate-800 text-white', icon: Share2 };
    case 'GOOGLE_ADS': return { label: 'Google Ads', color: 'bg-red-100 text-red-700', icon: Search };
    case 'MANUAL': return { label: 'Manual', color: 'bg-slate-100 text-slate-700', icon: UserPlus };
    case 'STREET': return { label: 'Lead de calle', color: 'bg-emerald-100 text-emerald-700', icon: MapPin };
    case 'REFERRAL': return { label: 'Referido', color: 'bg-amber-100 text-amber-700', icon: Users };
    case 'WEBSITE': return { label: 'Sitio Web', color: 'bg-indigo-100 text-indigo-700', icon: Globe };
    default: return { label: source as string, color: 'bg-slate-100 text-slate-700', icon: Globe };
  }
};

export const CrmFull: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CrmTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<CrmLeadSource | 'ALL'>('ALL');

  // Advanced Filters
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterTier, setFilterTier] = useState<CustomerTier | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VINCULADO' | 'INACTIVO' | 'PROSPECTO'>('ALL');
  
  // Interactive Data States from Global Context
  const { contacts, deals, activities, assignmentLogs, crmUsers, globalSelectedContactId, setGlobalSelectedContactId, fullProfileContactId, setFullProfileContactId, moveDealStage, addContact, addDeal, addActivity, deleteContacts } = useEnterprise();
  
  // Custom Filter State
  const [filterOwner, setFilterOwner] = useState<string>('all');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRegistroType, setNewRegistroType] = useState<'CONTACT' | 'DEAL'>('CONTACT');
  const [newPayload, setNewPayload] = useState<any>({});
  
  // Lost Reason Modal State (Feature 4)
  const [lostModalDealId, setLostModalDealId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [purchaseExpectation, setPurchaseExpectation] = useState('');

  // Derived filtered data
  const filteredDeals = deals.filter(d => filterOwner === 'all' || d.ownerId === filterOwner);
  const filteredContacts = contacts.filter(c => filterOwner === 'all' || c.ownerId === filterOwner);

  // Overdue Activities (Feature 2)
  const overdueActivities = activities.filter(a => 
      a.status !== 'COMPLETED' && 
      new Date(a.date).getTime() < Date.now() &&
      (filterOwner === 'all' || a.ownerId === filterOwner)
  ).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleDealMove = (dealId: string, newStage: CrmDealStage | 'CLOSED_LOST') => {
    if (newStage === 'CLOSED_LOST') {
        setLostModalDealId(dealId); // Trigger Feature 4 Modal
    } else {
        moveDealStage(dealId, newStage);
    }
  };

  const confirmLostDeal = () => {
      if (lostModalDealId && lostReason) {
          moveDealStage(lostModalDealId, 'CLOSED_LOST', lostReason); // Also pass expectation in a real app, assuming logic is simple here
          setLostModalDealId(null);
          setLostReason('');
          setPurchaseExpectation('');
      }
  };

  const handleAddNote = (contactId: string, noteText: string, activityType: string, scheduledDate?: string, nextAction?: string, nextActionDate?: string) => {
    const newActivity: CrmActivity = {
      id: `ACT-NEW-${Date.now()}`,
      type: activityType as any,
      title: 'Registro de Interacción',
      description: noteText,
      date: scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
      contactId,
      status: scheduledDate ? 'PENDING' : 'COMPLETED',
      ownerId: 'U-ME',
      nextAction,
      nextActionDate
    };
    addActivity(newActivity);
  };

  const handleDeleteContacts = (contactIds: string[]) => {
    deleteContacts(contactIds);
  };

  const handleCreateRegistro = () => {
    if (newRegistroType === 'CONTACT') {
      const nc: CrmContact = {
        id: `C-NEW-${Date.now()}`,
        name: newPayload.name || 'Sin Nombre',
        company: newPayload.company || 'Sin Empresa',
        email: newPayload.email || '',
        phone: newPayload.phone || '',
        nit: newPayload.nit || '',
        tier: CustomerTier.REGULAR,
        status: newPayload.status || 'LEAD',
        source: 'MANUAL',
        lastContactDate: new Date().toISOString(),
        ownerId: 'U-ME',
        decisionMakers: newPayload.decisionMakers || []
      };
      addContact(nc);
    } else {
      const nd: CrmDeal = {
        id: `D-NEW-${Date.now()}`,
        title: newPayload.title || 'Nueva Oportunidad',
        contactId: filteredContacts[0]?.id || '',
        company: newPayload.company || 'Desconocida',
        value: Number(newPayload.value) || 0,
        stage: 'LEAD',
        expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        probability: 10,
        ownerId: 'U-ME'
      };
      addDeal(nd);
    }
    setIsModalOpen(false);
    setNewPayload({});
  };

  const handleAddDecisionMaker = () => {
      const current = newPayload.decisionMakers || [];
      setNewPayload({
          ...newPayload,
          decisionMakers: [...current, { name: '', position: '', hobby: '', birthday: '' }]
      });
  };

  const handleDecisionMakerChange = (index: number, field: string, value: string) => {
      const current = [...(newPayload.decisionMakers || [])];
      current[index] = { ...current[index], [field]: value };
      setNewPayload({ ...newPayload, decisionMakers: current });
  };

  const handleRemoveDecisionMaker = (index: number) => {
      const current = [...(newPayload.decisionMakers || [])];
      current.splice(index, 1);
      setNewPayload({ ...newPayload, decisionMakers: current });
  };

  // -- Render FULL PROFILE if selected --
  if (fullProfileContactId) {
    return (
      <div className="h-full bg-slate-50 relative z-50">
        <CrmClientFullProfile 
          contactId={fullProfileContactId} 
          onBack={() => setFullProfileContactId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full min-h-full relative flex flex-col flex-1">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CRM Corporativo</h1>
          <p className="text-slate-500 mt-2">Analítica de ventas, asignación de cuentas y gestión comercial integral.</p>
        </div>
        <div className="flex gap-3 relative">
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors font-medium text-sm shadow-sm ${isFiltersOpen ? 'bg-slate-100 border-slate-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            <Filter className="w-4 h-4" />
            Filtros {(filterTier !== 'ALL' || filterStatus !== 'ALL' || filterOwner !== 'ALL') && <span className="bg-indigo-600 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">!</span>}
          </button>
          
          {isFiltersOpen && (
            <div className="absolute top-12 right-32 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4">
              <h4 className="font-bold text-sm text-slate-900 mb-3">Vistas y Filtros</h4>
              <div className="space-y-3">
                {/* Feature 1 implementation */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Propietario / Vendedor</label>
                  <select 
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value as any)}
                    className="w-full text-sm border-slate-200 rounded-md bg-indigo-50 text-indigo-800 font-medium p-1.5 outline-none focus:ring-2 ring-indigo-500/20"
                  >
                    <option value="ALL">Ver Todo (Todos los Asesores)</option>
                    <option value="U-ME">Solo Mis Tratos</option>
                    <option value="U-CARLOS">Pipeline de Carlos</option>
                    <option value="U-MARIA">Pipeline de María</option>
                  </select>
                </div>
                <hr className="border-slate-100"/>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Nivel del Cliente (Tier)</label>
                  <select value={filterTier} onChange={(e) => setFilterTier(e.target.value as any)} className="w-full text-sm border-slate-200 rounded-md bg-slate-50 p-1.5 focus:ring-2 ring-indigo-500/20">
                    <option value="ALL">Cualquiera</option>
                    <option value="Estratégico">Estratégico</option>
                    <option value="Regular">Regular</option>
                    <option value="Nuevo">Nuevo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Estado del Contacto</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="w-full text-sm border-slate-200 rounded-md bg-slate-50 p-1.5 focus:ring-2 ring-indigo-500/20">
                    <option value="ALL">Cualquiera</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="PROSPECT">Prospecto</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button onClick={() => { setFilterTier('ALL'); setFilterStatus('ALL'); setFilterOwner('ALL'); setIsFiltersOpen(false); }} className="text-xs text-slate-500 underline hover:text-slate-800 w-full text-center"> Limpiar Filtros </button>
                </div>
              </div>
            </div>
          )}

          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200">
            <Plus className="w-4 h-4" /> Nuevo Registro
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl mb-6 w-fit border border-slate-200/60 flex-wrap">
        {[
          { id: 'dashboard', label: 'Informes', icon: PieChart }, 
          { id: 'embudo', label: 'Pipeline Ventas', icon: Target }, 
          { id: 'postventa', label: 'Post-Venta', icon: Heart }, 
          { id: 'contactos', label: 'Directorio', icon: Users }, 
          { id: 'rentabilidad', label: 'Rentabilidad', icon: BarChart3 },
          { id: 'equipo', label: 'Equipo Comercial', icon: Briefcase },
          { id: 'configuracion', label: 'Configuración', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as CrmTab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} /> {tab.label}
              {tab.id === 'actividades' && overdueActivities.length > 0 && <span className="flex h-2 w-2 relative ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>}
            </button>
          );
        })}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {activeTab === 'dashboard' && <CrmDashboard />}
        
        {activeTab === 'rentabilidad' && <CrmProfitabilityModule contacts={filteredContacts} />}

        {activeTab === 'equipo' && <CrmTeam />}

        {activeTab === 'configuracion' && <CrmConfig />}
        
        {activeTab === 'embudo' && (
          <CrmPipeline 
            deals={filteredDeals} 
            contacts={filteredContacts} 
            onDealMove={handleDealMove} 
            onDealClick={setGlobalSelectedContactId}
            getSourceBadge={getSourceBadge}
          />
        )}

        {activeTab === 'postventa' && (
          <CrmPostSalePipeline 
            contacts={filteredContacts} 
            onContactClick={setGlobalSelectedContactId}
          />
        )}
        
        {activeTab === 'contactos' && (
          <CrmContactsTable 
            contacts={filteredContacts}
            searchQuery={searchQuery}
            selectedSource={selectedSource}
            setSelectedSource={setSelectedSource}
            getSourceBadge={getSourceBadge}
            onContactClick={setGlobalSelectedContactId}
            onDeleteContacts={handleDeleteContacts}
            filterTier={filterTier}
            filterStatus={filterStatus}
          />
        )}
        
        {activeTab === 'actividades' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Agenda y Registro de Actividades</h3>
            <div className="space-y-4">
              {activities.filter(a => filterOwner === 'ALL' || a.ownerId === filterOwner).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(activity => (
                <div key={activity.id} onClick={() => setGlobalSelectedContactId(activity.contactId)} className={`flex gap-4 p-4 rounded-lg border shadow-sm cursor-pointer ${new Date(activity.date) < new Date() && activity.status !== 'COMPLETED' ? 'border-rose-300 bg-rose-50' : activity.status !== 'COMPLETED' ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white hover:border-indigo-100'}`}>
                  <div className={`p-3 rounded-xl ${activity.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : new Date(activity.date) < new Date() ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    {activity.type === 'CALL' ? <Phone className="w-5 h-5"/> : activity.type === 'EMAIL' ? <Mail className="w-5 h-5"/> : <Calendar className="w-5 h-5"/>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                        <h4 className="font-semibold text-slate-900 text-sm">{activity.title}</h4>
                        <span className="text-[10px] uppercase font-bold text-slate-500">{activity.status}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                    <time className={`text-xs mt-2 font-bold ${activity.status === 'COMPLETED' ? 'text-emerald-500' : new Date(activity.date) < new Date() ? 'text-rose-600' : 'text-amber-500'}`}>{new Date(activity.date).toLocaleString('es-CO')}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {globalSelectedContactId && (() => {
        const c = contacts.find(c => c.id === globalSelectedContactId);
        if (!c) return null;
        return (
          <CrmContactDrawer
             contact={c}
             contactDeals={deals.filter(d => d.contactId === c.id)}
             contactActivities={activities.filter(a => a.contactId === c.id)}
             contactAssignmentLogs={assignmentLogs.filter(a => a.contactId === c.id)}
             getSourceBadge={getSourceBadge}
             onClose={() => setGlobalSelectedContactId(null)}
             onAddNote={handleAddNote}
          />
        );
      })()}

      {/* Feature 4: Lost Reason Modal */}
      <AnimatePresence>
        {lostModalDealId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border-t-8 border-rose-500">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Trato Perdido</h2>
                    <p className="text-sm text-slate-600 mb-6">Para mejorar nuestra analítica (BI), por favor indica la razón por la cual se perdió esta oportunidad:</p>
                    <div className="space-y-3 mb-6">
                        {['Precio muy alto', 'Se fue con competencia local', 'Falta de presupuesto', 'Mala comunicación', 'Cambio de decisión', 'Otro'].map(r => (
                            <button key={r} onClick={() => setLostReason(r)} className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition-colors ${lostReason === r ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <div className="mb-6">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Expectativa de Compra (Retoma)</label>
                        <select value={purchaseExpectation} onChange={e => setPurchaseExpectation(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none">
                            <option value="">Seleccione...</option>
                            <option value="Corto Plazo (1-3 meses)">Corto Plazo (1-3 meses)</option>
                            <option value="Mediano Plazo (3-6 meses)">Mediano Plazo (3-6 meses)</option>
                            <option value="Largo Plazo (+6 meses)">Largo Plazo (+6 meses)</option>
                            <option value="NUNCA (Registro Basura)">NUNCA (Marcar como Basura)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setLostModalDealId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold">Cancelar</button>
                        <button onClick={confirmLostDeal} disabled={!lostReason} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50">Confirmar Pérdida</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* CRUD Creation Modal: Ingreso de Clientes */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm overflow-y-auto py-10">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl my-auto max-h-full overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-slate-900">Ingreso de Clientes / Oportunidades</h2>
              
              <div className="flex gap-2 mb-6 border-b border-slate-200 pb-4">
                <button onClick={() => setNewRegistroType('CONTACT')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${newRegistroType === 'CONTACT' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Nuevo Cliente</button>
                <button onClick={() => setNewRegistroType('DEAL')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${newRegistroType === 'DEAL' ? 'bg-indigo-600 text-white font-bold shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Nueva Oportunidad</button>
              </div>

              <div className="space-y-4">
                {newRegistroType === 'CONTACT' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nombre de la Empresa *</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 ring-indigo-500 outline-none" placeholder="Razón Social" onChange={(e) => setNewPayload({...newPayload, company: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">NIT o Cédula *</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 ring-indigo-500 outline-none" placeholder="123456789-0" onChange={(e) => setNewPayload({...newPayload, nit: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Teléfono Principal *</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 ring-indigo-500 outline-none" placeholder="+57 300 000 0000" onChange={(e) => setNewPayload({...newPayload, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Categoría Inicial</label>
                            <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 ring-indigo-500 outline-none bg-white" onChange={(e) => setNewPayload({...newPayload, status: e.target.value})}>
                                <option value="LEAD">Lead (Oportunidad Temprana)</option>
                                <option value="PROSPECTO">Prospecto (En Negociación)</option>
                                <option value="VINCULADO">Vinculado (Con Venta)</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-slate-800">Personas Determinantes para la Venta</h3>
                            <button onClick={handleAddDecisionMaker} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 flex items-center gap-1">
                                <Plus className="w-3 h-3"/> Añadir Persona
                            </button>
                        </div>
                        <div className="space-y-3">
                            {(newPayload.decisionMakers || []).map((dm: any, i: number) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                                    <button onClick={() => handleRemoveDecisionMaker(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50"><Trash2 className="w-4 h-4"/></button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input className="border border-slate-300 rounded-md p-2 text-xs" placeholder="Nombre Completo" value={dm.name} onChange={(e) => handleDecisionMakerChange(i, 'name', e.target.value)} />
                                        <input className="border border-slate-300 rounded-md p-2 text-xs" placeholder="Cargo (Ej. Gerente de Compras)" value={dm.position} onChange={(e) => handleDecisionMakerChange(i, 'position', e.target.value)} />
                                        <input className="border border-slate-300 rounded-md p-2 text-xs" placeholder="Hobby o Intereses" value={dm.hobby} onChange={(e) => handleDecisionMakerChange(i, 'hobby', e.target.value)} />
                                        <input className="border border-slate-300 rounded-md p-2 text-xs" type="date" placeholder="Cumpleaños" value={dm.birthday} onChange={(e) => handleDecisionMakerChange(i, 'birthday', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            {(!newPayload.decisionMakers || newPayload.decisionMakers.length === 0) && (
                                <p className="text-xs text-slate-500 text-center py-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl">No has añadido personas determinantes.</p>
                            )}
                        </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Título de Oportunidad *</label>
                        <input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="Ej. Licitación de Químicos 2026" onChange={(e) => setNewPayload({...newPayload, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Empresa Relacionada</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" placeholder="Empresa" onChange={(e) => setNewPayload({...newPayload, company: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Valor Estimado ($ COP) *</label>
                            <input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" type="number" placeholder="Ej. 50000000" onChange={(e) => setNewPayload({...newPayload, value: e.target.value})} />
                        </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                <button onClick={handleCreateRegistro} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-colors">Guardar Registro</button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};
