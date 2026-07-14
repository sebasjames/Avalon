import React, { useState } from 'react';
import { 
    Search, Filter, Clock, User, Bot, Server, 
    AlertTriangle, CheckCircle2, DollarSign, Fingerprint, 
    ChevronRight, X, ArrowRight, GitCommit, Eye
} from 'lucide-react';
import { MOCK_EVENT_LOG } from '../constants';
import { SystemEvent, EventCategory, EventActorType } from '../types';

const EventIcon = ({ type }: { type: EventCategory | 'ERROR' }) => {
    switch (type) {
        case 'OPERATIONS': return <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Fingerprint className="w-5 h-5" /></div>;
        case 'INTELLIGENCE': return <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Bot className="w-5 h-5" /></div>;
        case 'FINANCE': return <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign className="w-5 h-5" /></div>;
        case 'ERROR': return <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><AlertTriangle className="w-5 h-5" /></div>;
        case 'PLANNING': return <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Clock className="w-5 h-5" /></div>;
        default: return <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Server className="w-5 h-5" /></div>;
    }
};

const ActorBadge = ({ type, id }: { type: EventActorType, id: string }) => {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
            type === 'HUMAN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
            type === 'AI' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
            'bg-slate-50 text-slate-600 border-slate-200'
        }`}>
            {type === 'HUMAN' && <User className="w-3 h-3" />}
            {type === 'AI' && <Bot className="w-3 h-3" />}
            {type === 'SYSTEM' && <Server className="w-3 h-3" />}
            {id}
        </span>
    );
};

export const EventLog: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);

    const filteredEvents = MOCK_EVENT_LOG.filter(evt => {
        const matchesSearch = 
            evt.event_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
            evt.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            evt.event_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || evt.event_category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            
            {/* MAIN LIST AREA */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedEvent ? 'mr-96' : ''}`}>
                <header className="px-8 py-6 border-b border-slate-200 bg-white z-10">
                    <div className="flex justify-end items-center">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            STREAMING LIVE
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Buscar por ID de Evento, Entidad o Tipo..." 
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="pl-3 pr-8 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="ALL">Todas las Categorías</option>
                            <option value="OPERATIONS">Operaciones</option>
                            <option value="FINANCE">Finanzas</option>
                            <option value="INTELLIGENCE">Inteligencia (IA)</option>
                            <option value="ERROR">Errores</option>
                        </select>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[3.25rem] top-8 bottom-0 w-px bg-slate-200 z-0"></div>

                    <div className="space-y-6 relative z-10">
                        {filteredEvents.map((evt) => (
                            <div 
                                key={evt.event_id}
                                onClick={() => setSelectedEvent(evt)}
                                className={`group flex gap-6 p-4 rounded-xl border transition-all cursor-pointer ${
                                    selectedEvent?.event_id === evt.event_id 
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                }`}
                            >
                                <div className="flex-shrink-0 relative">
                                    <EventIcon type={evt.event_category} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">{evt.event_type}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-mono text-slate-500">{evt.event_id}</span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-600 font-medium">{evt.entity_type}: {evt.entity_id}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-500 font-mono">
                                                {new Date(evt.timestamp).toLocaleTimeString()}
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {new Date(evt.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <ActorBadge type={evt.actor_type} id={evt.actor_id} />
                                            {evt.confidence_level !== 'MANUAL' && (
                                                <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold border border-purple-100">
                                                    {evt.confidence_level}
                                                </span>
                                            )}
                                        </div>
                                        <button className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No se encontraron eventos con los filtros actuales.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAIL SLIDE-OVER PANEL */}
            <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 flex flex-col z-50 ${
                selectedEvent ? 'translate-x-0' : 'translate-x-full'
            }`}>
                {selectedEvent && (
                    <>
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-slate-500" />
                                Detalle Forense
                            </h2>
                            <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Event ID</label>
                                    <div className="text-xs font-mono text-slate-900 break-all">{selectedEvent.event_id}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</label>
                                    <div className="text-xs font-mono text-slate-900">{selectedEvent.timestamp}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Causal Chain</label>
                                    <div className="text-xs font-mono text-blue-600 underline cursor-pointer hover:text-blue-800">
                                        {selectedEvent.causal_chain_id}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Actor</label>
                                    <div className="text-xs font-mono text-slate-900">{selectedEvent.actor_id}</div>
                                </div>
                            </div>

                            {/* Context */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">Contexto Operativo</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Canal:</span>
                                        <span className="font-medium text-slate-900">{selectedEvent.context.channel}</span>
                                    </div>
                                    {selectedEvent.context.location && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Ubicación:</span>
                                            <span className="font-medium text-slate-900">{selectedEvent.context.location}</span>
                                        </div>
                                    )}
                                    {selectedEvent.context.reason && (
                                        <div className="pt-2 mt-2 border-t border-slate-200">
                                            <span className="text-slate-500 block mb-1">Motivo / Justificación:</span>
                                            <p className="text-slate-800 italic">"{selectedEvent.context.reason}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* State Diff */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-700 uppercase mb-3 flex items-center">
                                    <ArrowRight className="w-3 h-3 mr-1" /> Cambio de Estado (State Diff)
                                </h3>
                                <div className="space-y-2 font-mono text-xs">
                                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg">
                                        <div className="text-rose-700 font-bold mb-1 opacity-75">PREVIOUS STATE</div>
                                        {selectedEvent.previous_state ? (
                                            <pre className="whitespace-pre-wrap text-rose-900">
                                                {JSON.stringify(selectedEvent.previous_state, null, 2)}
                                            </pre>
                                        ) : (
                                            <span className="text-rose-400 italic">null (Creation Event)</span>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-center">
                                        <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                                        <div className="text-emerald-700 font-bold mb-1 opacity-75">NEW STATE</div>
                                        {selectedEvent.new_state ? (
                                            <pre className="whitespace-pre-wrap text-emerald-900">
                                                {JSON.stringify(selectedEvent.new_state, null, 2)}
                                            </pre>
                                        ) : (
                                            <span className="text-emerald-400 italic">null</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                                    Exportar Evidencia JSON
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};