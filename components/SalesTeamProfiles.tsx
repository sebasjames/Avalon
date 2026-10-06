import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { formatCOP } from '../utils/format';
import { 
    Users, Trophy, Target, TrendingUp, Phone, Mail, 
    Briefcase, Star, Award, ChevronRight, BarChart3, 
    PieChart, Activity, UserCheck, Percent, DollarSign,
    Receipt, X, ExternalLink, Download, CheckCircle2,
    AlertCircle, Sparkles, ArrowUpRight, ShieldCheck,
    Layers, TableProperties, HelpCircle, Flame, Calendar
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { useEnterprise } from '../context/EnterpriseContext';

export const SalesTeamProfiles: React.FC = () => {
    const { systemUsers, deals = [], activities = [], commissionRules = [], transactions = [] } = useEnterprise();
    const navigate = useNavigate();
    
    // View mode: 'agent' for individual profile, 'global' for team metas compendium on current screen
    const [viewMode, setViewMode] = useState<'agent' | 'global'>('agent');
    const [activeModalTab, setActiveModalTab] = useState<'metas' | 'comisiones'>('metas');

    useEscapeKey(() => {
        if (viewMode === 'global') {
            setViewMode('agent');
        }
    }, viewMode === 'global');
    
    // Derived Sales Team from System Users
    const salesTeam = useMemo(() => {
        return (systemUsers || []).filter(u => u.baseRole === 'Comercial' || u.baseRole === 'manager').map(u => {
            const userDeals = (deals || []).filter(d => d.ownerId === u.id);
            const wonDeals = userDeals.filter(d => d.stage === 'CLOSED_WON');
            const closedDeals = userDeals.filter(d => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST');
            const actual = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
            const conversion = closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
            
            // Calcular Comisiones basadas en las Reglas Globales (Aproximación por Ventas Ganadas)
            let totalCommission = 0;
            (commissionRules || []).filter(r => r.active).forEach(rule => {
                if (rule.type === 'Porcentaje' && (rule.baseVariable === 'Facturación' || rule.baseVariable === 'Facturación Neta (Menos Retención)' || rule.baseVariable === 'Recaudo')) {
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
            
            const userActivities = (activities || []).filter(a => a.ownerId === u.id);
            const recentActivity = [
                { day: 'Lun', calls: userActivities.filter(a => a.type === 'CALL').length || Math.floor(Math.random() * 20), meetings: userActivities.filter(a => a.type === 'MEETING').length || Math.floor(Math.random() * 5) },
                { day: 'Mar', calls: Math.floor(Math.random() * 20), meetings: Math.floor(Math.random() * 5) },
                { day: 'Mie', calls: Math.floor(Math.random() * 20), meetings: Math.floor(Math.random() * 5) },
                { day: 'Jue', calls: Math.floor(Math.random() * 20), meetings: Math.floor(Math.random() * 5) },
                { day: 'Vie', calls: Math.floor(Math.random() * 20), meetings: Math.floor(Math.random() * 5) },
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
                wonDealsCount: wonDeals.length,
                conversion,
                commission: Math.round(totalCommission),
                phone: u.phone || '+57 300 000 0000',
                email: u.email,
                skills: u.skills || { negotiation: 85, closing: conversion || 50, prospecting: 70, tech: 80, empathy: 90 },
                recentActivity
            };
        });
    }, [systemUsers, deals, commissionRules, activities]);

    const [selectedAgentId, setSelectedAgentId] = useState(salesTeam.length > 0 ? salesTeam[0].id : null);

    // Aggregate Metrics
    const totalRevenue = useMemo(() => salesTeam.reduce((acc, curr) => acc + curr.actual, 0), [salesTeam]);
    const totalQuota = useMemo(() => salesTeam.reduce((acc, curr) => acc + curr.quota, 0), [salesTeam]);
    const totalCommissions = useMemo(() => salesTeam.reduce((acc, curr) => acc + curr.commission, 0), [salesTeam]);
    const quotaAttainment = totalQuota > 0 ? (totalRevenue / totalQuota) * 100 : 0;
    const remainingGap = Math.max(0, totalQuota - totalRevenue);

    // Corporate Pacing & Projection
    const pacingMetrics = useMemo(() => {
        const now = new Date();
        const currentDay = Math.max(1, now.getDate());
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const runRateProjection = (totalRevenue / currentDay) * daysInMonth;
        const projectedAttainment = totalQuota > 0 ? (runRateProjection / totalQuota) * 100 : 0;
        return { currentDay, daysInMonth, runRateProjection, projectedAttainment };
    }, [totalRevenue, totalQuota]);

    // Active pipeline supporting goals
    const supportingDeals = useMemo(() => {
        return (deals || []).filter(d => d.stage === 'PROPOSAL' || d.stage === 'NEGOTIATION' || d.stage === 'QUALIFIED');
    }, [deals]);

    const supportingPipelineValue = useMemo(() => {
        return supportingDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    }, [supportingDeals]);

    const weightedPipelineValue = useMemo(() => {
        return supportingDeals.reduce((sum, d) => sum + ((d.value || 0) * ((d.probability || 50) / 100)), 0);
    }, [supportingDeals]);

    // Active Commission Rules from Matrix
    const activeCommissionRules = useMemo(() => {
        return (commissionRules || []).filter(r => r.active);
    }, [commissionRules]);

    // Function to export CSV of the Global Compendium
    const handleExportCompendioCSV = () => {
        const headers = ["Tipo", "Nombre / Concepto", "Cuota COP", "Venta Real COP", "Cumplimiento %", "Tratos Cerrados", "Comisión Estimada COP", "Estado"];
        const rows: string[][] = [];

        // Header summary row
        rows.push([
            "RESUMEN GLOBAL",
            "Meta Consolidada Empresa",
            totalQuota.toString(),
            totalRevenue.toString(),
            quotaAttainment.toFixed(1) + "%",
            salesTeam.reduce((a, b) => a + b.deals, 0).toString(),
            totalCommissions.toString(),
            quotaAttainment >= 100 ? "Cumplida" : "En Curso"
        ]);

        // Individual agent rows
        salesTeam.forEach(agent => {
            const pct = agent.quota > 0 ? ((agent.actual / agent.quota) * 100).toFixed(1) : "0";
            rows.push([
                "ASESOR",
                `"${agent.name.replace(/"/g, '""')}"`,
                agent.quota.toString(),
                agent.actual.toString(),
                pct + "%",
                agent.deals.toString(),
                agent.commission.toString(),
                Number(pct) >= 100 ? "Meta Lograda" : "En Progreso"
            ]);
        });

        // Commission rules
        activeCommissionRules.forEach(rule => {
            rows.push([
                "REGLA COMISIÓN",
                `"${rule.name.replace(/"/g, '""')}"`,
                "N/A",
                rule.baseVariable,
                `${rule.value}${rule.type === 'Porcentaje' ? '%' : ' COP'}`,
                rule.target,
                "Activa",
                rule.hasAgingPenalty ? "Con Penalidad Cartera" : "Estándar"
            ]);
        });

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Compendio_Metas_Comisiones_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (salesTeam.length === 0) {
        return (
            <div className="p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold text-slate-700">No hay perfiles comerciales</h2>
                <p className="text-slate-500 mt-2">Asegúrate de configurar usuarios con el rol 'Comercial' o 'Administrador Comercial' en la sección de Configuración.</p>
            </div>
        );
    }

    const selectedAgent = salesTeam.find(a => a.id === selectedAgentId) || salesTeam[0];

    const radarData = [
        { subject: 'Negociación', A: selectedAgent.skills.negotiation, fullMark: 100 },
        { subject: 'Cierre', A: selectedAgent.skills.closing, fullMark: 100 },
        { subject: 'Prospección', A: selectedAgent.skills.prospecting, fullMark: 100 },
        { subject: 'Tech/CRM', A: selectedAgent.skills.tech, fullMark: 100 },
        { subject: 'Empatía', A: selectedAgent.skills.empathy, fullMark: 100 },
    ];

    if (!selectedAgent) return <div className="p-8 text-center text-slate-500">No hay agentes comerciales configurados.</div>;

    return (
        <div className="flex h-[calc(100vh-65px)] bg-slate-50 overflow-hidden">
            {/* LEFT SIDEBAR: TEAM LIST */}
            <div className="w-96 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar z-10 shadow-lg">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-xl font-bold text-slate-900 flex items-center mb-1">
                        <Users className="w-6 h-6 mr-2 text-indigo-600" />
                        Equipo
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Perfiles Comerciales & Rendimiento</p>
                    
                    {/* Team KPI Mini Card (Interactive Clickable Trigger to change view inline) */}
                    <div 
                        onClick={() => {
                            setActiveModalTab('metas');
                            setViewMode('global');
                        }}
                        className={`mt-4 p-3.5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                            viewMode === 'global' && activeModalTab === 'metas'
                                ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500 shadow-md'
                                : 'bg-white border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-md'
                        }`}
                        title="Haga clic para ver el compendio de metas globales en la pantalla actual"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold uppercase transition-colors ${
                                    viewMode === 'global' && activeModalTab === 'metas' ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-600'
                                }`}>
                                    Meta Global
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5 ${
                                    viewMode === 'global' && activeModalTab === 'metas'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                                }`}>
                                    {viewMode === 'global' && activeModalTab === 'metas' ? 'En pantalla ✓' : 'Ver en pantalla'}
                                </span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${quotaAttainment >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {quotaAttainment.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(quotaAttainment, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                            <span className="text-slate-700 font-bold">{formatCOP(totalRevenue)}</span>
                            <span className="text-slate-400 font-medium">/ {formatCOP(totalQuota)}</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => {
                            setActiveModalTab('comisiones');
                            setViewMode('global');
                        }}
                        className={`mt-2 border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs group ${
                            viewMode === 'global' && activeModalTab === 'comisiones'
                                ? 'bg-indigo-100/80 border-indigo-500 ring-2 ring-indigo-500 shadow-md'
                                : 'bg-indigo-50/70 hover:bg-indigo-50 border-indigo-100 hover:border-indigo-300'
                        }`}
                        title="Haga clic para ver el desglose de comisiones en la pantalla actual"
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-indigo-900 group-hover:text-indigo-700">Comisiones Generadas</span>
                            <span className="text-[10px] text-indigo-600 underline font-semibold">
                                {viewMode === 'global' && activeModalTab === 'comisiones' ? 'En pantalla ✓' : 'Ver en pantalla'}
                            </span>
                        </div>
                        <span className="text-sm font-black text-indigo-600">{formatCOP(totalCommissions)}</span>
                    </div>
                </div>
                
                <div className="flex-1 p-4 space-y-3">
                    {salesTeam.map((agent) => {
                        const percent = agent.quota > 0 ? (agent.actual / agent.quota) * 100 : 0;
                        const isSelected = viewMode === 'agent' && selectedAgent.id === agent.id;
                        
                        return (
                            <div 
                                key={agent.id}
                                onClick={() => {
                                    setSelectedAgentId(agent.id);
                                    setViewMode('agent');
                                }}
                                className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md group relative overflow-hidden cursor-pointer ${
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
                                        <span className="font-bold">{formatCOP(agent.actual)}</span>
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

            {/* RIGHT MAIN CONTENT: SWITCHABLE (GLOBAL COMPENDIUM vs AGENT DETAIL) */}
            {viewMode === 'global' ? (
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Global Compendium Header */}
                        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-indigo-600/30 border border-indigo-400/30 text-indigo-400 rounded-2xl">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        Compendio Ejecutivo: Metas Globales & Comisiones
                                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                            Mes Actual
                                        </span>
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Pacing corporativo, contribución individual por asesor y auditoría de reglas de compensación.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <button
                                    onClick={handleExportCompendioCSV}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                                    title="Descargar reporte en formato CSV"
                                >
                                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                                    Descargar CSV
                                </button>
                                <button
                                    onClick={() => setViewMode('agent')}
                                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                                    title="Ver perfil individual de asesor"
                                >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Ver Asesor ({selectedAgent.name.split(' ')[0]})
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                            <button
                                onClick={() => setActiveModalTab('metas')}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    activeModalTab === 'metas'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <Target className="w-4 h-4" />
                                Metas Corporativas & Pacing del Equipo
                            </button>
                            <button
                                onClick={() => setActiveModalTab('comisiones')}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    activeModalTab === 'comisiones'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                <DollarSign className="w-4 h-4" />
                                Resumen de Comisiones Configuradas ({activeCommissionRules.length} Reglas Activas)
                            </button>
                        </div>

                        {/* Global Content Body */}
                        <div className="space-y-6">
                            {activeModalTab === 'metas' ? (
                                <>
                                    {/* Top 4 KPI Metrics */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Meta Consolidada</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${quotaAttainment >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                    {quotaAttainment.toFixed(1)}% Logrado
                                                </span>
                                            </div>
                                            <div className="text-xl font-black text-slate-900">{formatCOP(totalQuota)}</div>
                                            <p className="text-[11px] text-slate-400 mt-1">Presupuesto total del equipo comercial</p>
                                        </div>

                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Facturación Cerrada</span>
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div className="text-xl font-black text-emerald-600">{formatCOP(totalRevenue)}</div>
                                            <p className="text-[11px] text-slate-400 mt-1">Ventas cerradas ganadas este mes</p>
                                        </div>

                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Brecha Faltante</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${remainingGap === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {remainingGap === 0 ? 'Meta Superada' : 'Faltante'}
                                                </span>
                                            </div>
                                            <div className="text-xl font-black text-slate-900">{formatCOP(remainingGap)}</div>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                {remainingGap === 0 ? '¡Meta 100% alcanzada!' : 'Monto para alcanzar el 100% de la cuota'}
                                            </p>
                                        </div>

                                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Proyección Run-Rate</span>
                                                <TrendingUp className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div className="text-xl font-black text-indigo-700">{formatCOP(pacingMetrics.runRateProjection)}</div>
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Ritmo diario ({pacingMetrics.projectedAttainment.toFixed(1)}% esperado al cierre)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Supporting Pipeline Banner */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/60 p-4 rounded-2xl border border-indigo-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-indigo-950 text-sm">Pipeline Caliente de Apoyo (Cierres Previstos)</h4>
                                                <p className="text-xs text-indigo-700">
                                                    Existen <strong>{supportingDeals.length} tratos en Propuesta o Negociación</strong> por un valor total de <strong>{formatCOP(supportingPipelineValue)}</strong> (Ponderado: <strong>{formatCOP(weightedPipelineValue)}</strong>).
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setViewMode('agent');
                                                navigate('/crm?tab=embudo');
                                            }}
                                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                                        >
                                            Ver Tratos en CRM <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Breakdown Table by Agent */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm">Desglose Individual de Cuotas & Logro por Asesor</h3>
                                                <p className="text-xs text-slate-500">Comparativa del equipo comercial frente a la meta asignada</p>
                                            </div>
                                            <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                                {salesTeam.length} Asesores
                                            </span>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                                                    <tr>
                                                        <th className="py-3 px-4">Asesor</th>
                                                        <th className="py-3 px-4">Cuota Asignada</th>
                                                        <th className="py-3 px-4">Venta Real</th>
                                                        <th className="py-3 px-4">Cumplimiento %</th>
                                                        <th className="py-3 px-4">Brecha</th>
                                                        <th className="py-3 px-4">Aporte (%)</th>
                                                        <th className="py-3 px-4">Comisión Est.</th>
                                                        <th className="py-3 px-4 text-center">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                                    {salesTeam.map((agent) => {
                                                        const pct = agent.quota > 0 ? (agent.actual / agent.quota) * 100 : 0;
                                                        const gap = Math.max(0, agent.quota - agent.actual);
                                                        const share = totalRevenue > 0 ? (agent.actual / totalRevenue) * 100 : 0;
                                                        return (
                                                            <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors">
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                                                            {agent.avatar}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-slate-900">{agent.name}</div>
                                                                            <div className="text-[10px] text-slate-400">{agent.role}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 font-semibold text-slate-700">
                                                                    {formatCOP(agent.quota)}
                                                                </td>
                                                                <td className="py-3 px-4 font-bold text-slate-900">
                                                                    {formatCOP(agent.actual)}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                                            <div 
                                                                                className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                                            pct >= 100 ? 'bg-emerald-100 text-emerald-700' : pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                                        }`}>
                                                                            {pct.toFixed(0)}%
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4 text-slate-600">
                                                                    {gap === 0 ? (
                                                                        <span className="text-emerald-600 font-bold">¡Alcanzada!</span>
                                                                    ) : (
                                                                        formatCOP(gap)
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-4 font-bold text-indigo-700">
                                                                    {share.toFixed(1)}%
                                                                </td>
                                                                <td className="py-3 px-4 font-black text-slate-900">
                                                                    {formatCOP(agent.commission)}
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedAgentId(agent.id);
                                                                            setViewMode('agent');
                                                                        }}
                                                                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        Inspeccionar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Comisiones Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                                            <div className="text-[11px] font-bold text-slate-400 uppercase">Bolsa Total de Comisiones</div>
                                            <div className="text-2xl font-black text-indigo-700 mt-1">{formatCOP(totalCommissions)}</div>
                                            <p className="text-xs text-slate-400 mt-1">Compensación estimada total para el equipo en este periodo</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                                            <div className="text-[11px] font-bold text-slate-400 uppercase">Reglas Comerciales Activas</div>
                                            <div className="text-2xl font-black text-slate-900 mt-1">{activeCommissionRules.length} Reglas</div>
                                            <p className="text-xs text-slate-400 mt-1">Configuradas y vigentes en la Matriz de Comisiones</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                                            <div>
                                                <div className="text-[11px] font-bold text-slate-400 uppercase">Ajustes & Configuración</div>
                                                <p className="text-xs text-slate-600 mt-1">Modifique porcentajes, bonos o penalidades en la Matriz central.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setViewMode('agent');
                                                    navigate('/staff/matrix');
                                                }}
                                                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                            >
                                                <TableProperties className="w-3.5 h-3.5" />
                                                Ir a Matrix Comisiones
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Commission Rules List */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-sm">Reglas de Compensación Aplicadas este Mes</h3>
                                                <p className="text-xs text-slate-500">Parámetros que rigen la liquidación sobre ventas, recaudo y cartera</p>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                Vigente para Nómina
                                            </span>
                                        </div>

                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activeCommissionRules.map(rule => (
                                                <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:border-indigo-300 transition-colors">
                                                    <div className="flex justify-between items-start gap-2 mb-2">
                                                        <h4 className="font-bold text-slate-900 text-sm">{rule.name}</h4>
                                                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                                            {rule.value}{rule.type === 'Porcentaje' ? '%' : ' COP'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-2">
                                                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                                                            Base: {rule.baseVariable}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold">
                                                            Target: {rule.target}
                                                        </span>
                                                    </div>
                                                    {(rule.hasAgingPenalty || rule.hasDiscountPenalty) && (
                                                        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                                                            {rule.hasAgingPenalty && (
                                                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                                    Penalidad Mora Cartera (&gt;30d)
                                                                </span>
                                                            )}
                                                            {rule.hasDiscountPenalty && (
                                                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                                                    Castigo por Descuento (&gt;5%)
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Link to Centro de Logros */}
                                    <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div>
                                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-amber-400" />
                                                ¿Desea autorizar y liquidar nómina de comisiones?
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">
                                                En el módulo de Comisiones y Logros puede validar firmas con PIN, consultar facturas congeladas y desembolsar a contabilidad.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setViewMode('agent');
                                                navigate('/staff/comisiones');
                                            }}
                                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer shadow-lg shadow-amber-500/20"
                                        >
                                            Ir a Comisiones y Logros
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Bar */}
                        <div className="p-4 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-2xs">
                            <span className="text-xs text-slate-400 font-medium">
                                Datos consolidados en tiempo real desde el CRM y Facturación
                            </span>
                            <button
                                onClick={() => setViewMode('agent')}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Volver a Perfil de {selectedAgent.name}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
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
                                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center">
                                        <button
                                            onClick={() => navigate(`/staff/registro-actividad?agentId=${selectedAgent.id}`)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all border border-indigo-200 shadow-sm"
                                            title="Ver historial de órdenes, cotizaciones y actividades de este agente en Registro de Actividad Comercial"
                                        >
                                            <Receipt className="w-3.5 h-3.5" />
                                            Ver Registro & Órdenes de {selectedAgent.name.split(' ')[0]}
                                        </button>
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
                                <div className="text-3xl font-bold text-slate-900 mt-2">{formatCOP(selectedAgent.actual)}</div>
                                <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${selectedAgent.color}`} style={{ width: `${Math.min((selectedAgent.actual/selectedAgent.quota)*100, 100)}%` }}></div>
                                </div>
                                <div className="mt-2 text-xs flex justify-between text-slate-400">
                                    <span>Progreso</span>
                                    <span>Meta: {formatCOP(selectedAgent.quota)}</span>
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
                                <div 
                                    onClick={() => navigate('/staff/matrix')}
                                    className="bg-indigo-50 hover:bg-indigo-100/90 p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 mt-4 cursor-pointer transition-all shadow-xs hover:shadow-md group"
                                    title="Haga clic para ir al panel de configuración de comisiones (Matrix)"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center text-indigo-700">
                                            <span className="font-bold text-xl">{formatCOP(selectedAgent.commission)}</span>
                                        </div>
                                        <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-0.5">
                                            Configurar <ArrowUpRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-indigo-600/90 font-medium">
                                        <span>Comisiones (Reglas Activas)</span>
                                        <span className="text-[10px] underline font-bold group-hover:text-indigo-800">
                                            Panel de Configuración &rarr;
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-blue-500 bg-blue-100 p-1 rounded-lg" />
                                    <span className="text-slate-500 font-medium text-sm">Tratos Cerrados</span>
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{selectedAgent.deals}</div>
                                <div className="text-xs text-slate-400 mt-1">Valor Promedio de Venta: {formatCOP((selectedAgent.actual / selectedAgent.deals) || 0)}</div>
                            </div>

                            <div 
                                onClick={() => navigate('/crm?tab=embudo')}
                                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-50 transition-colors border-dashed border-2 group"
                            >
                                <BarChart3 className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" />
                                <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-800">Ver Pipeline Completo</span>
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
            )}
        </div>
    );
};
