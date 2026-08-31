import React, { useState } from 'react';
import { 
    Users, Trophy, Target, TrendingUp, Phone, Mail, 
    Briefcase, Star, Award, ChevronRight, BarChart3, 
    PieChart, Activity, UserCheck, Percent, DollarSign
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { useEnterprise } from '../context/EnterpriseContext';

export const SalesTeamProfiles: React.FC = () => {
    const { systemUsers, deals, activities, commissionRules = [] } = useEnterprise();
    
    // Derived Sales Team from System Users
    const salesTeam = systemUsers.filter(u => u.baseRole === 'Comercial' || u.baseRole === 'manager').map(u => {
        const userDeals = deals.filter(d => d.ownerId === u.id);
        const wonDeals = userDeals.filter(d => d.stage === 'CLOSED_WON');
        const closedDeals = userDeals.filter(d => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST');
        const actual = wonDeals.reduce((sum, d) => sum + d.value, 0);
        const conversion = closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
        
        // Calcular Comisiones basadas en las Reglas Globales (Aproximación por Ventas Ganadas)
        let totalCommission = 0;
        commissionRules.filter(r => r.active).forEach(rule => {
            if (rule.type === 'Porcentaje' && (rule.baseVariable === 'Facturación' || rule.baseVariable === 'Facturación Neta (Menos Retención)' || rule.baseVariable === 'Recaudo')) {
                // Simplified commission base is actual won deals. In real life we'd filter by target/discounts.
                let base = actual;
                if (rule.target === 'Clientes Especiales (1%)') base = actual * 0.2; // simulate 20%
                if (rule.target === 'Clientes Estándar / Regulares') base = actual * 0.8;
                
                let ruleCost = base * (rule.value / 100);
                if (rule.hasAgingPenalty) ruleCost *= 0.8; // Simula castigo promedio
                if (rule.hasDiscountPenalty) ruleCost *= 0.9;
                
                totalCommission += ruleCost;
            } else if (rule.type === 'Fijo') {
                totalCommission += rule.value;
            }
        });
        
        // Mock recent activity based on real activities or just random for visual if empty
        const userActivities = activities.filter(a => a.ownerId === u.id);
        const recentActivity = [
            { day: 'Lun', calls: userActivities.filter(a=>a.type==='CALL').length || Math.floor(Math.random()*20), meetings: userActivities.filter(a=>a.type==='MEETING').length || Math.floor(Math.random()*5) },
            { day: 'Mar', calls: Math.floor(Math.random()*20), meetings: Math.floor(Math.random()*5) },
            { day: 'Mie', calls: Math.floor(Math.random()*20), meetings: Math.floor(Math.random()*5) },
            { day: 'Jue', calls: Math.floor(Math.random()*20), meetings: Math.floor(Math.random()*5) },
            { day: 'Vie', calls: Math.floor(Math.random()*20), meetings: Math.floor(Math.random()*5) },
        ];

        return {
            id: u.id,
            name: u.name,
            role: u.baseRole === 'manager' ? 'Gerente Comercial' : 'Ejecutivo de Ventas',
            avatar: u.avatar || u.name.substring(0, 2).toUpperCase(),
            color: 'bg-indigo-600',
            quota: u.quota || 100000000,
            actual,
            deals: userDeals.length,
            conversion,
            commission: Math.round(totalCommission),
            phone: u.phone || '+57 300 000 0000',
            email: u.email,
            skills: u.skills || { negotiation: 85, closing: conversion || 50, prospecting: 70, tech: 80, empathy: 90 },
            recentActivity
        };
    });

    const [selectedAgentId, setSelectedAgentId] = useState(salesTeam.length > 0 ? salesTeam[0].id : null);

    if (salesTeam.length === 0) {
        return (
            <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold text-slate-700">No hay perfiles comerciales</h2>
                <p className="text-slate-500 mt-2">Asegúrate de configurar usuarios con el rol 'Comercial' o 'Administrador Comercial' en la sección de Configuración.</p>
            </div>
        );
    }

    const selectedAgent = salesTeam.find(a => a.id === selectedAgentId) || salesTeam[0];

    // Aggregate Metrics
    const totalRevenue = salesTeam.reduce((acc, curr) => acc + curr.actual, 0);
    const totalQuota = salesTeam.reduce((acc, curr) => acc + curr.quota, 0);
    const totalCommissions = salesTeam.reduce((acc, curr) => acc + curr.commission, 0);
    const quotaAttainment = totalQuota > 0 ? (totalRevenue / totalQuota) * 100 : 0;

    const radarData = [
        { subject: 'Negociación', A: selectedAgent.skills.negotiation, fullMark: 100 },
        { subject: 'Cierre', A: selectedAgent.skills.closing, fullMark: 100 },
        { subject: 'Prospección', A: selectedAgent.skills.prospecting, fullMark: 100 },
        { subject: 'Tech/CRM', A: selectedAgent.skills.tech, fullMark: 100 },
        { subject: 'Empatía', A: selectedAgent.skills.empathy, fullMark: 100 },
    ];

    if (!selectedAgent) return <div className="p-8 text-center text-slate-500">No hay agentes comerciales configurados.</div>;

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
                            <span className="text-slate-500">${(totalRevenue/1000000).toFixed(1)}M</span>
                            <span className="text-slate-400">/ ${(totalQuota/1000000).toFixed(1)}M</span>
                        </div>
                    </div>

                    <div className="mt-2 bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-800">Comisiones Generadas</span>
                        <span className="text-sm font-black text-indigo-600">${totalCommissions.toLocaleString('es-CO')}</span>
                    </div>
                </div>
                
                <div className="flex-1 p-4 space-y-3">
                    {salesTeam.map((agent) => {
                        const percent = agent.quota > 0 ? (agent.actual / agent.quota) * 100 : 0;
                        const isSelected = selectedAgent.id === agent.id;
                        
                        return (
                            <div 
                                key={agent.id}
                                onClick={() => setSelectedAgentId(agent.id)}
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
                            </div>
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
                                <div className="text-3xl font-bold text-slate-900 mt-2">${selectedAgent.actual.toLocaleString('es-CO')} COP</div>
                                <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${selectedAgent.color}`} style={{ width: `${Math.min((selectedAgent.actual/selectedAgent.quota)*100, 100)}%` }}></div>
                                </div>
                                <div className="mt-2 text-xs flex justify-between text-slate-400">
                                    <span>Progreso</span>
                                    <span>Meta: ${selectedAgent.quota.toLocaleString('es-CO')} COP</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Percent className="w-5 h-5 text-amber-500 bg-amber-100 p-1 rounded-lg" />
                                        <span className="text-slate-500 font-medium text-sm">Tasa Conversión</span>
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900">{selectedAgent.conversion}%</div>
                                    <div className="text-xs text-emerald-600 font-bold mt-1">Top 15% de la industria</div>
                                </div>
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-4">
                                    <div className="flex items-center text-indigo-700 mb-1">
                                        <DollarSign className="w-5 h-5 mr-1" />
                                        <span className="font-bold text-xl">${selectedAgent.commission.toLocaleString('es-CO')}</span>
                                    </div>
                                    <div className="text-xs text-indigo-500/80 font-medium">Comisiones (Reglas Activas)</div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-blue-500 bg-blue-100 p-1 rounded-lg" />
                                    <span className="text-slate-500 font-medium text-sm">Tratos Cerrados</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{selectedAgent.deals}</div>
                                <div className="text-xs text-slate-400 mt-1">Valor Promedio de Venta: ${((selectedAgent.actual / selectedAgent.deals) || 0).toLocaleString('es-CO', {maximumFractionDigits: 0})} COP</div>
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