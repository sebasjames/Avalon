import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Target, DollarSign, Filter, Calendar, 
  ArrowUpRight, ArrowDownRight, Trophy, Zap, Download, ChevronDown, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- MOCK DATA BASE ---
const baseSalesData = [
  { month: 'Ene', ecommerce: 45000, b2b: 85000, retail: 35000 },
  { month: 'Feb', ecommerce: 52000, b2b: 78000, retail: 38000 },
  { month: 'Mar', ecommerce: 48000, b2b: 92000, retail: 42000 },
  { month: 'Abr', ecommerce: 61000, b2b: 105000, retail: 45000 },
  { month: 'May', ecommerce: 59000, b2b: 98000, retail: 41000 },
  { month: 'Jun', ecommerce: 68000, b2b: 115000, retail: 48000 },
  { month: 'Jul', ecommerce: 75000, b2b: 125000, retail: 52000 },
];

const baseChannelData = [
  { name: 'B2B Corporativo', value: 450000, color: '#4f46e5' },
  { name: 'E-commerce', value: 280000, color: '#0ea5e9' },
  { name: 'Retail', value: 150000, color: '#f59e0b' },
  { name: 'Distribuidores', value: 120000, color: '#10b981' },
];

const baseTeamPerformance = [
  { id: 1, name: 'Ana Silva', role: 'Key Account B2B', avatar: 'AS', sales: 145000, quota: 120000, winRate: 72, trend: 'up' },
  { id: 2, name: 'Carlos Ruiz', role: 'Director Retail', avatar: 'CR', sales: 98000, quota: 110000, winRate: 54, trend: 'down' },
  { id: 3, name: 'Laura Gómez', role: 'E-commerce Lead', avatar: 'LG', sales: 156000, quota: 150000, winRate: 82, trend: 'up' },
  { id: 4, name: 'Miguel Paz', role: 'Ventas Directas', avatar: 'MP', sales: 85000, quota: 90000, winRate: 60, trend: 'up' },
];

const basePipelineStages = [
  { name: 'Leads Iniciales', amount: 850000, count: 124, color: 'bg-slate-200' },
  { name: 'Contactados', amount: 620000, count: 85, color: 'bg-indigo-200' },
  { name: 'Propuesta Enviada', amount: 480000, count: 42, color: 'bg-indigo-400' },
  { name: 'En Negociación', amount: 310000, count: 18, color: 'bg-indigo-600' },
  { name: 'Cierre Ganado', amount: 145000, count: 8, color: 'bg-emerald-500' },
];

// --- COMPONENTS ---
const KpiCard = ({ title, value, subValue, trend, icon: Icon, trendUp }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-in-out opacity-50 pointer-events-none"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Icon className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {trend}
            </div>
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
            <p className="text-sm text-slate-400">{subValue}</p>
        </div>
    </div>
);

export const GestionComercial: React.FC = () => {
    // State for Dropdowns
    const [dateRange, setDateRange] = useState('Este Mes');
    const [isDateOpen, setIsDateOpen] = useState(false);
    
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const dateOptions = ['Hoy', 'Esta Semana', 'Este Mes', 'Últimos 30 días', 'Últimos 90 días', 'Q3 2026', 'Año Actual'];
    const filterOptions = ['Solo B2B', 'Solo E-commerce', 'Solo Retail', 'Sin Distribuidores'];

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setIsDateOpen(false);
            setIsFilterOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleFilter = (f: string) => {
        if (['Solo B2B', 'Solo E-commerce', 'Solo Retail'].includes(f)) {
             if (activeFilters.includes(f)) {
                 setActiveFilters(prev => prev.filter(x => x !== f));
             } else {
                 setActiveFilters(prev => [...prev.filter(x => !['Solo B2B', 'Solo E-commerce', 'Solo Retail'].includes(x)), f]);
             }
        } else {
             setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
        }
    };

    // --- Dynamic Data Calculation ---
    const multiplier = dateRange === 'Hoy' ? 0.05 : dateRange === 'Esta Semana' ? 0.25 : dateRange === 'Últimos 30 días' ? 0.9 : dateRange === 'Este Mes' ? 1 : dateRange === 'Últimos 90 días' ? 2.5 : dateRange === 'Q3 2026' ? 3 : 8;
    
    let channelData = baseChannelData.map(c => ({...c, value: c.value * multiplier}));
    if (activeFilters.includes('Solo B2B')) channelData = channelData.filter(c => c.name === 'B2B Corporativo');
    else if (activeFilters.includes('Solo E-commerce')) channelData = channelData.filter(c => c.name === 'E-commerce');
    else if (activeFilters.includes('Solo Retail')) channelData = channelData.filter(c => c.name === 'Retail');
    if (activeFilters.includes('Sin Distribuidores')) channelData = channelData.filter(c => c.name !== 'Distribuidores');

    const totalChannelValue = channelData.reduce((acc, curr) => acc + curr.value, 0);

    const salesData = baseSalesData.map(s => ({
        month: s.month,
        ecommerce: activeFilters.includes('Solo B2B') || activeFilters.includes('Solo Retail') ? 0 : s.ecommerce * multiplier,
        b2b: activeFilters.includes('Solo E-commerce') || activeFilters.includes('Solo Retail') ? 0 : s.b2b * multiplier,
        retail: activeFilters.includes('Solo B2B') || activeFilters.includes('Solo E-commerce') ? 0 : s.retail * multiplier,
    }));

    const teamPerformance = baseTeamPerformance.map(t => ({
        ...t,
        sales: t.sales * multiplier,
        quota: t.quota * multiplier,
    })).filter(t => {
        if (activeFilters.includes('Solo B2B')) return t.role.includes('B2B');
        if (activeFilters.includes('Solo E-commerce')) return t.role.includes('E-commerce');
        if (activeFilters.includes('Solo Retail')) return t.role.includes('Retail');
        return true;
    });

    const pipelineStages = basePipelineStages.map(p => ({
        ...p,
        amount: p.amount * multiplier,
        count: Math.max(1, Math.round(p.count * multiplier))
    }));

    const totalRevenueStr = totalChannelValue > 1000000 
        ? `$${(totalChannelValue / 1000000).toFixed(2)}M` 
        : `$${(totalChannelValue / 1000).toFixed(1)}k`;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                        Centro de Mando Comercial
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-200">En Vivo</span>
                    </h1>
                    <p className="text-slate-500 mt-1">Monitoreo interactivo de ingresos y rendimiento del equipo.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto relative z-20">
                    {/* Date Picker Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsDateOpen(!isDateOpen); setIsFilterOpen(false); }}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-sm">{dateRange}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDateOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30">
                                {dateOptions.map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => { setDateRange(opt); setIsDateOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${dateRange === opt ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        {opt}
                                        {dateRange === opt && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); setIsDateOpen(false); }}
                            className={`flex items-center gap-2 bg-white border px-4 py-2 rounded-xl transition-colors shadow-sm ${activeFilters.length > 0 ? 'border-indigo-300 text-indigo-700 bg-indigo-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="font-medium text-sm hidden md:inline">
                                {activeFilters.length > 0 ? `${activeFilters.length} Filtros` : 'Filtros'}
                            </span>
                        </button>
                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 p-2" onClick={e => e.stopPropagation()}>
                                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Filtrar por Canal</div>
                                {filterOptions.map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => toggleFilter(opt)}
                                        className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-3 text-slate-700 hover:bg-slate-50"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                            {activeFilters.includes(opt) && <Check className="w-3 h-3" />}
                                        </div>
                                        {opt}
                                    </button>
                                ))}
                                {activeFilters.length > 0 && (
                                    <div className="border-t border-slate-100 mt-2 pt-2">
                                        <button onClick={() => setActiveFilters([])} className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-medium py-1">
                                            Limpiar filtros
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button className="flex items-center justify-center bg-indigo-600 text-white p-2 md:px-4 md:py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                        <Download className="w-4 h-4 md:mr-2" />
                        <span className="font-medium text-sm hidden md:inline">Reporte</span>
                    </button>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard 
                    title={`Ingresos Totales (${dateRange})`} 
                    value={totalRevenueStr} 
                    subValue="Basado en filtros activos" 
                    trend={activeFilters.length ? "+12.4%" : "+26.5%"} 
                    icon={DollarSign} 
                    trendUp={true} 
                />
                <KpiCard 
                    title="Tasa de Conversión" 
                    value="64.2%" 
                    subValue="Estable en el periodo" 
                    trend="+6.2%" 
                    icon={Target} 
                    trendUp={true} 
                />
                <KpiCard 
                    title="Ticket Promedio (AOV)" 
                    value={`$${(8450 * (multiplier > 1 ? 1 : multiplier)).toFixed(0)}`} 
                    subValue="Promedio general" 
                    trend="-2.1%" 
                    icon={TrendingUp} 
                    trendUp={false} 
                />
                <KpiCard 
                    title="Oportunidades" 
                    value={pipelineStages.reduce((acc, stage) => acc + stage.count, 0)} 
                    subValue="En el pipeline activo" 
                    trend="+12" 
                    icon={Users} 
                    trendUp={true} 
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Evolution Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Evolución de Ingresos</h3>
                            <p className="text-sm text-slate-500">Comparativa temporal según filtros</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorEcom" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`$${value.toLocaleString('es-CO')} COP COP COP COP`, '']}
                                />
                                {!activeFilters.includes('Solo E-commerce') && !activeFilters.includes('Solo Retail') && (
                                    <Area type="monotone" dataKey="b2b" name="B2B Corp" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorB2B)" />
                                )}
                                {!activeFilters.includes('Solo B2B') && !activeFilters.includes('Solo Retail') && (
                                    <Area type="monotone" dataKey="ecommerce" name="E-commerce" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorEcom)" />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col z-10">
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Distribución por Canal</h3>
                    <p className="text-sm text-slate-500 mb-6">Composición del ingreso</p>
                    
                    <div className="flex-1 flex flex-col justify-center relative">
                        <div className="h-48 w-full relative">
                            {channelData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={channelData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {channelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString('es-CO')} COP COP COP COP`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Sin datos para estos filtros</div>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-bold text-slate-900">{totalRevenueStr}</span>
                                <span className="text-xs text-slate-500">Total</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-4 space-y-3">
                            {channelData.map((channel, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }}></div>
                                        <span className="text-sm font-medium text-slate-700">{channel.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {totalChannelValue > 0 ? Math.round((channel.value / totalChannelValue) * 100) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Team & Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 z-10 relative">
                {/* Leaderboard */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Leaderboard de Ventas
                        </h3>
                        <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">Ver todos</button>
                    </div>

                    <div className="space-y-5">
                        {teamPerformance.length > 0 ? teamPerformance.map((member, i) => {
                            const percent = Math.min(100, (member.sales / member.quota) * 100);
                            return (
                                <div key={member.id} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 group-hover:border-indigo-300 transition-colors">
                                                {member.avatar}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">{member.name}</h4>
                                                <p className="text-xs text-slate-500">{member.role}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-900">${(member.sales / 1000).toFixed(1)}k</div>
                                            <div className="text-xs font-medium text-slate-500">Meta: ${(member.quota / 1000).toFixed(1)}k</div>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        }) : (
                             <div className="text-center py-8 text-slate-500 text-sm">No hay vendedores para los filtros seleccionados.</div>
                        )}
                    </div>
                </div>

                {/* Pipeline Funnel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <Zap className="w-5 h-5 text-indigo-500" />
                            Pipeline Activo (Forecast)
                        </h3>
                        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            Saludable
                        </div>
                    </div>

                    <div className="flex flex-col h-full justify-start mt-4 gap-2">
                        {pipelineStages.map((stage, i) => {
                            const widthPercent = 100 - (i * 18);
                            return (
                                <div key={i} className="flex flex-col items-center group cursor-pointer">
                                    <div 
                                        className={`${stage.color} h-12 flex items-center justify-between px-4 transition-all duration-300 group-hover:brightness-95`}
                                        style={{ 
                                            width: `${widthPercent}%`, 
                                            borderTopLeftRadius: i === 0 ? '12px' : '4px',
                                            borderTopRightRadius: i === 0 ? '12px' : '4px',
                                            borderBottomLeftRadius: i === pipelineStages.length - 1 ? '12px' : '4px',
                                            borderBottomRightRadius: i === pipelineStages.length - 1 ? '12px' : '4px',
                                        }}
                                    >
                                        <span className={`text-sm font-semibold truncate pr-2 ${i > 2 ? 'text-white' : 'text-slate-800'}`}>
                                            {stage.name}
                                        </span>
                                        <div className={`flex items-center gap-3 text-sm ${i > 2 ? 'text-white' : 'text-slate-700'}`}>
                                            <span className="font-mono opacity-80">{stage.count} orgs</span>
                                            <span className="font-bold">${(stage.amount / 1000).toFixed(0)}k</span>
                                        </div>
                                    </div>
                                    {i < pipelineStages.length - 1 && (
                                        <div className="w-1 h-1 bg-slate-200 my-0.5"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

