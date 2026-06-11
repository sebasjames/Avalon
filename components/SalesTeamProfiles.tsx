import React, { useState } from 'react';
import { 
    Users, Trophy, Target, TrendingUp, Phone, Mail, 
    Briefcase, Star, Award, ChevronRight, BarChart3, 
    PieChart, Activity, UserCheck, Percent
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

// --- MOCK DATA ---
const SALES_TEAM = [
    { 
        id: 1, 
        name: "Ana García", 
        role: "Senior Account Manager", 
        avatar: "AG",
        color: "bg-indigo-600",
        quota: 150000, 
        actual: 162000, 
        deals: 12, 
        conversion: 34,
        phone: "+52 55 1234 5678",
        email: "ana.garcia@procoquinal.com",
        skills: { negotiation: 95, closing: 90, prospecting: 80, tech: 85, empathy: 92 },
        recentActivity: [
            { day: 'Lun', calls: 15, meetings: 3 },
            { day: 'Mar', calls: 20, meetings: 4 },
            { day: 'Mie', calls: 12, meetings: 5 },
            { day: 'Jue', calls: 18, meetings: 2 },
            { day: 'Vie', calls: 22, meetings: 4 },
        ]
    },
    { 
        id: 2, 
        name: "Carlos Méndez", 
        role: "Sales Executive", 
        avatar: "CM",
        color: "bg-emerald-600",
        quota: 100000, 
        actual: 85000, 
        deals: 18, 
        conversion: 22,
        phone: "+52 55 8765 4321",
        email: "carlos.mendez@procoquinal.com",
        skills: { negotiation: 75, closing: 80, prospecting: 95, tech: 70, empathy: 85 },
        recentActivity: [
            { day: 'Lun', calls: 30, meetings: 1 },
            { day: 'Mar', calls: 35, meetings: 2 },
            { day: 'Mie', calls: 28, meetings: 1 },
            { day: 'Jue', calls: 40, meetings: 3 },
            { day: 'Vie', calls: 32, meetings: 2 },
        ]
    },
    { 
        id: 3, 
        name: "Lucía Fernández", 
        role: "Key Account Manager (KAM)", 
        avatar: "LF",
        color: "bg-rose-600",
        quota: 200000, 
        actual: 195000, 
        deals: 5, 
        conversion: 45,
        phone: "+52 55 1122 3344",
        email: "lucia.fernandez@procoquinal.com",
        skills: { negotiation: 98, closing: 95, prospecting: 60, tech: 90, empathy: 88 },
        recentActivity: [
            { day: 'Lun', calls: 5, meetings: 4 },
            { day: 'Mar', calls: 8, meetings: 3 },
            { day: 'Mie', calls: 6, meetings: 5 },
            { day: 'Jue', calls: 10, meetings: 2 },
            { day: 'Vie', calls: 4, meetings: 4 },
        ]
    },
    { 
        id: 4, 
        name: "Miguel Torres", 
        role: "Junior Sales Rep", 
        avatar: "MT",
        color: "bg-amber-600",
        quota: 50000, 
        actual: 22000, 
        deals: 40, 
        conversion: 15,
        phone: "+52 55 9988 7766",
        email: "miguel.torres@procoquinal.com",
        skills: { negotiation: 60, closing: 55, prospecting: 98, tech: 95, empathy: 75 },
        recentActivity: [
            { day: 'Lun', calls: 50, meetings: 0 },
            { day: 'Mar', calls: 45, meetings: 1 },
            { day: 'Mie', calls: 55, meetings: 0 },
            { day: 'Jue', calls: 48, meetings: 1 },
            { day: 'Vie', calls: 60, meetings: 0 },
        ]
    }
];

export const SalesTeamProfiles: React.FC = () => {
    const [selectedAgent, setSelectedAgent] = useState(SALES_TEAM[0]);

    // Aggregate Metrics
    const totalRevenue = SALES_TEAM.reduce((acc, curr) => acc + curr.actual, 0);
    const totalQuota = SALES_TEAM.reduce((acc, curr) => acc + curr.quota, 0);
    const quotaAttainment = (totalRevenue / totalQuota) * 100;

    const radarData = [
        { subject: 'Negociación', A: selectedAgent.skills.negotiation, fullMark: 100 },
        { subject: 'Cierre', A: selectedAgent.skills.closing, fullMark: 100 },
        { subject: 'Prospección', A: selectedAgent.skills.prospecting, fullMark: 100 },
        { subject: 'Tech/CRM', A: selectedAgent.skills.tech, fullMark: 100 },
        { subject: 'Empatía', A: selectedAgent.skills.empathy, fullMark: 100 },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            
            {/* LEFT SIDEBAR: TEAM LIST */}
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar z-10 shadow-lg">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-xl font-bold text-slate-900 flex items-center mb-1">
                        <Users className="w-6 h-6 mr-2 text-indigo-600" />
                        Equipo
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Equipo de Ventas & Rendimiento</p>
                    
                    {/* Team KPI Mini Card */}
                    <div className="mt-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Meta Global</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${quotaAttainment >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {quotaAttainment.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(quotaAttainment, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-slate-500">${(totalRevenue/1000).toFixed(0)}k</span>
                            <span className="text-slate-400">/ ${(totalQuota/1000).toFixed(0)}k</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-4 space-y-3">
                    {SALES_TEAM.map((agent) => {
                        const percent = (agent.actual / agent.quota) * 100;
                        const isSelected = selectedAgent.id === agent.id;
                        
                        return (
                            <button
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group relative overflow-hidden ${
                                    isSelected 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200'
                                }`}
                            >
                                {/* Active Indicator Strip */}
                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30"></div>}

                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                                        isSelected ? 'bg-white/20 border-white/30 text-white' : 'bg-slate-100 border-white text-slate-600'
                                    }`}>
                                        {agent.avatar}
                                    </div>
                                    <div>
                                        <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{agent.name}</div>
                                        <div className={`text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{agent.role}</div>
                                    </div>
                                    {percent >= 100 && (
                                        <Trophy className={`w-4 h-4 ml-auto ${isSelected ? 'text-yellow-300' : 'text-yellow-500'}`} />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium opacity-90">
                                        <span>Logro: {percent.toFixed(0)}%</span>
                                        <span>${(agent.actual/1000).toFixed(0)}k</span>
                                    </div>
                                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-black/20' : 'bg-slate-100'}`}>
                                        <div 
                                            className={`h-full rounded-full ${isSelected ? 'bg-white' : agent.color}`} 
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT MAIN CONTENT: AGENT DETAIL */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto space-y-6">
                    
                    {/* Hero Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-24 h-24 rounded-2xl ${selectedAgent.color} flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-200`}>
                                    {selectedAgent.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-3xl font-bold text-slate-900">{selectedAgent.name}</h2>
                                        {selectedAgent.actual > selectedAgent.quota && (
                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold border border-emerald-200 flex items-center">
                                                <Star className="w-3 h-3 mr-1 fill-emerald-700" /> Top Performer
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-500 font-medium text-lg flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2" /> {selectedAgent.role}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                                        <span className="flex items-center hover:text-indigo-600 cursor-pointer transition-colors"><Phone className="w-3 h-3 mr-1" /> {selectedAgent.phone}</span>
                                        <span className="flex items-center hover:text-indigo-600 cursor-pointer transition-colors"><Mail className="w-3 h-3 mr-1" /> {selectedAgent.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="text-right">
                                    <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Smart Score</div>
                                    <div className="text-4xl font-black text-slate-900">{(selectedAgent.conversion * 1.5 + (selectedAgent.actual/selectedAgent.quota)*40).toFixed(0)}</div>
                                </div>
                                <div className="h-12 w-12 rounded-full border-4 border-slate-100 flex items-center justify-center">
                                    <Activity className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Radar Skill Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                            <h3 className="font-bold text-slate-800 mb-4 self-start flex items-center">
                                <UserCheck className="w-5 h-5 mr-2 text-indigo-500" /> Perfil de Habilidades
                            </h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name={selectedAgent.name} dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Target className="w-16 h-16 text-emerald-600" />
                                </div>
                                <div className="text-slate-500 font-medium text-sm">Revenue Actual</div>
                                <div className="text-3xl font-bold text-slate-900 mt-2">${selectedAgent.actual.toLocaleString('es-CO')} COP COP</div>
                                <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${selectedAgent.color}`} style={{ width: `${Math.min((selectedAgent.actual/selectedAgent.quota)*100, 100)}%` }}></div>
                                </div>
                                <div className="mt-2 text-xs flex justify-between text-slate-400">
                                    <span>Progreso</span>
                                    <span>Meta: ${selectedAgent.quota.toLocaleString('es-CO')} COP COP</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Percent className="w-5 h-5 text-amber-500 bg-amber-100 p-1 rounded-lg" />
                                    <span className="text-slate-500 font-medium text-sm">Tasa Conversión</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{selectedAgent.conversion}%</div>
                                <div className="text-xs text-emerald-600 font-bold mt-1">Top 15% de la industria</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-blue-500 bg-blue-100 p-1 rounded-lg" />
                                    <span className="text-slate-500 font-medium text-sm">Tratos Cerrados</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{selectedAgent.deals}</div>
                                <div className="text-xs text-slate-400 mt-1">Ticket Promedio: ${((selectedAgent.actual / selectedAgent.deals) || 0).toLocaleString('es-CO', {maximumFractionDigits: 0})} COP COP</div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-50 transition-colors border-dashed border-2">
                                <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
                                <span className="text-sm font-bold text-indigo-600">Ver Pipeline Completo</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-rose-500" /> Ritmo de Actividad Semanal
                            </h3>
                            <div className="flex gap-4 text-xs font-bold">
                                <span className="flex items-center text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-800 mr-2"></span> Llamadas</span>
                                <span className="flex items-center text-slate-500"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span> Reuniones</span>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={selectedAgent.recentActivity} barGap={0}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="calls" name="Llamadas" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar dataKey="meetings" name="Reuniones" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};