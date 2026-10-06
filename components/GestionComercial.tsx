import { useEscapeKey } from '../hooks/useEscapeKey';
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../context/EnterpriseContext';
import { formatCOP } from '../utils/format';
import { dispatchActionSignal } from '../stores/actionSignals';
import { 
  TrendingUp, Users, Target, DollarSign, Filter, Calendar, 
  ArrowUpRight, ArrowDownRight, Trophy, Zap, Download, ChevronDown, Check,
  X, Search, Award, ShieldCheck, Medal, Briefcase, Eye, ChevronRight,
  Receipt, BarChart3, AlertCircle, Building2, ExternalLink, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Pipeline Stages Configuration
const PIPELINE_CONFIG = [
  { key: 'LEAD', name: 'Leads & Prospectos', color: 'bg-slate-200 text-slate-800', barColor: '#94a3b8' },
  { key: 'QUALIFIED', name: 'Contactados / Calificados', color: 'bg-indigo-200 text-indigo-900', barColor: '#818cf8' },
  { key: 'PROPOSAL', name: 'Propuesta Enviada', color: 'bg-indigo-400 text-white', barColor: '#6366f1' },
  { key: 'NEGOTIATION', name: 'En Negociación', color: 'bg-indigo-600 text-white', barColor: '#4338ca' },
  { key: 'CLOSED_WON', name: 'Cierre Ganado', color: 'bg-emerald-500 text-white', barColor: '#10b981' },
];

const CHANNEL_COLORS: Record<string, string> = {
  'B2B Corporativo': '#4f46e5',
  'POS Mostrador': '#0ea5e9',
  'Distribuidores': '#10b981',
  'Retail': '#f59e0b',
};

// KPI Card Component
const KpiCard = ({ title, value, subValue, trend, icon: Icon, trendUp }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50/50 rounded-full group-hover:scale-150 transition-transform duration-700 ease-in-out opacity-60 pointer-events-none"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
        <Icon className="w-6 h-6" />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
        {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {trend}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <div className="text-2xl lg:text-3xl font-black text-slate-900 mb-1 tracking-tight">{value}</div>
      <p className="text-xs text-slate-400 font-medium">{subValue}</p>
    </div>
  </div>
);

export const GestionComercial: React.FC = () => {
  const { systemUsers, deals = [], transactions = [], contacts = [] } = useEnterprise();
  const navigate = useNavigate();

  // Filters State
  const [dateRange, setDateRange] = useState('Este Mes');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals State
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [selectedStageModal, setSelectedStageModal] = useState<any | null>(null);
  const [selectedAgentModal, setSelectedAgentModal] = useState<any | null>(null);

  useEscapeKey(() => {
    setIsLeaderboardModalOpen(false);
    setSelectedStageModal(null);
    setSelectedAgentModal(null);
  }, isLeaderboardModalOpen || !!selectedStageModal || !!selectedAgentModal);

  const dateOptions = ['Hoy', 'Esta Semana', 'Este Mes', 'Últimos 30 días', 'Últimos 90 días', 'Año Actual', 'Todo el Histórico'];
  const filterOptions = ['B2B Corporativo', 'POS Mostrador', 'Distribuidores', 'Retail'];

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
    setActiveFilters(prev => 
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  // Timestamp Range calculation
  const minTimestamp = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (dateRange === 'Hoy') return startOfToday.getTime();
    if (dateRange === 'Esta Semana') return now - 7 * 86400000;
    if (dateRange === 'Este Mes') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return startOfMonth.getTime();
    }
    if (dateRange === 'Últimos 30 días') return now - 30 * 86400000;
    if (dateRange === 'Últimos 90 días') return now - 90 * 86400000;
    if (dateRange === 'Año Actual') {
      return new Date(new Date().getFullYear(), 0, 1).getTime();
    }
    return 0; // Todo el histórico
  }, [dateRange]);

  // Fast Lookups
  const usersMap = useMemo(() => new Map((systemUsers || []).map(u => [u.id, u])), [systemUsers]);
  const contactsMap = useMemo(() => new Map((contacts || []).map(c => [c.id, c])), [contacts]);

  // Classify and filter real transactions
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      const time = t.date ? new Date(t.date).getTime() : 0;
      if (minTimestamp > 0 && time < minTimestamp) return false;

      // Determine channel
      let channel = 'B2B Corporativo';
      const loc = (t.posLocation || '').toLowerCase();
      const doc = (t.document || '').toLowerCase();
      const cli = (t.client || '').toLowerCase();

      if (loc.includes('sede') || loc.includes('caja') || doc.includes('pos')) {
        channel = 'POS Mostrador';
      } else if (cli.includes('distrib')) {
        channel = 'Distribuidores';
      } else if (cli.includes('web') || cli.includes('retail') || cli.includes('mostrador')) {
        channel = 'Retail';
      }

      (t as any)._channel = channel;

      if (activeFilters.length > 0 && !activeFilters.includes(channel)) {
        return false;
      }
      return true;
    });
  }, [transactions, minTimestamp, activeFilters]);

  // Filter real CRM deals
  const filteredDeals = useMemo(() => {
    return (deals || []).filter(d => {
      const created = d.createdAt ? new Date(d.createdAt).getTime() : 
                      d.expectedCloseDate ? new Date(d.expectedCloseDate).getTime() : 0;
      if (minTimestamp > 0 && created < minTimestamp) return false;

      // Deals are primarily B2B Corporativo
      const channel = 'B2B Corporativo';
      (d as any)._channel = channel;
      if (activeFilters.length > 0 && !activeFilters.includes(channel)) {
        return false;
      }
      return true;
    });
  }, [deals, minTimestamp, activeFilters]);

  // Channel Distribution
  const channelData = useMemo(() => {
    const channelMap: Record<string, number> = {
      'B2B Corporativo': 0,
      'POS Mostrador': 0,
      'Distribuidores': 0,
      'Retail': 0
    };

    // Add transactions
    filteredTransactions.forEach(t => {
      if (t.type === 'VENTA') {
        const ch = (t as any)._channel || 'B2B Corporativo';
        channelMap[ch] = (channelMap[ch] || 0) + (t.total || 0);
      }
    });

    // Add won deals to B2B
    if (activeFilters.length === 0 || activeFilters.includes('B2B Corporativo')) {
      filteredDeals.forEach(d => {
        if (d.stage === 'CLOSED_WON') {
          channelMap['B2B Corporativo'] += (d.value || 0);
        }
      });
    }

    return Object.entries(channelMap)
      .map(([name, value]) => ({
        name,
        value,
        color: CHANNEL_COLORS[name] || '#6366f1'
      }))
      .filter(item => activeFilters.length === 0 || activeFilters.includes(item.name));
  }, [filteredTransactions, filteredDeals, activeFilters]);

  const totalRevenue = useMemo(() => {
    return channelData.reduce((acc, curr) => acc + curr.value, 0);
  }, [channelData]);

  // Total sales transactions count
  const salesCount = useMemo(() => {
    const txCount = filteredTransactions.filter(t => t.type === 'VENTA').length;
    const wonCount = filteredDeals.filter(d => d.stage === 'CLOSED_WON').length;
    return Math.max(1, txCount + wonCount);
  }, [filteredTransactions, filteredDeals]);

  // Average Order Value (AOV)
  const avgOrderValue = useMemo(() => {
    return totalRevenue > 0 ? Math.round(totalRevenue / salesCount) : 0;
  }, [totalRevenue, salesCount]);

  // Win Rate (Conversion)
  const winRate = useMemo(() => {
    const closedWon = filteredDeals.filter(d => d.stage === 'CLOSED_WON').length;
    const closedLost = filteredDeals.filter(d => d.stage === 'CLOSED_LOST').length;
    const totalClosed = closedWon + closedLost;
    if (totalClosed === 0) return 68; // Default baseline if newly opened
    return Math.round((closedWon / totalClosed) * 100);
  }, [filteredDeals]);

  // Monthly Sales Evolution Data
  const salesEvolutionData = useMemo(() => {
    const monthsMap: Record<string, { b2b: number; pos: number; label: string }> = {};
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Initialize last 6 months
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
      monthsMap[key] = {
        label: monthNames[targetDate.getMonth()],
        b2b: 0,
        pos: 0
      };
    }

    filteredTransactions.forEach(t => {
      if (t.type === 'VENTA' && t.date) {
        const dt = new Date(t.date);
        const key = `${dt.getFullYear()}-${dt.getMonth()}`;
        if (monthsMap[key]) {
          const ch = (t as any)._channel;
          if (ch === 'B2B Corporativo') {
            monthsMap[key].b2b += (t.total || 0);
          } else {
            monthsMap[key].pos += (t.total || 0);
          }
        }
      }
    });

    filteredDeals.forEach(deal => {
      if (deal.stage === 'CLOSED_WON') {
        const dtStr = deal.expectedCloseDate || deal.createdAt;
        if (dtStr) {
          const dt = new Date(dtStr);
          const key = `${dt.getFullYear()}-${dt.getMonth()}`;
          if (monthsMap[key]) {
            monthsMap[key].b2b += (deal.value || 0);
          }
        }
      }
    });

    return Object.values(monthsMap).map(m => ({
      month: m.label,
      b2b: m.b2b,
      ecommerce: m.pos
    }));
  }, [filteredTransactions, filteredDeals]);

  // Sales Team Performance (Leaderboard)
  const teamPerformance = useMemo(() => {
    const commercialUsers = (systemUsers || []).filter(u => 
      u.baseRole === 'Comercial' || u.baseRole === 'manager' || u.baseRole === 'admin'
    );

    return commercialUsers.map(user => {
      const userDeals = filteredDeals.filter(d => d.ownerId === user.id);
      const wonDeals = userDeals.filter(d => d.stage === 'CLOSED_WON');
      const closedDeals = userDeals.filter(d => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST');
      
      const wonDealsAmount = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      
      // Match POS sales where posLocation or user name matches
      const userPosSales = filteredTransactions
        .filter(t => t.type === 'VENTA' && ((t as any).user === user.name || t.posLocation === user.name))
        .reduce((sum, t) => sum + (t.total || 0), 0);

      const totalSales = wonDealsAmount + userPosSales;
      const userQuota = user.quota || 120000000;
      const winRateUser = closedDeals.length > 0 
        ? Math.round((wonDeals.length / closedDeals.length) * 100) 
        : 70;

      return {
        id: user.id,
        name: user.name,
        role: user.baseRole === 'manager' ? 'Gerente Comercial' : 'Ejecutivo de Cuentas B2B',
        avatar: user.avatar || user.name.substring(0, 2).toUpperCase(),
        sales: totalSales,
        quota: userQuota,
        winRate: winRateUser,
        trend: totalSales >= userQuota ? 'up' : 'down',
        dealsCount: wonDeals.length,
        activeDeals: userDeals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST'),
        rawUser: user
      };
    }).sort((a, b) => b.sales - a.sales);
  }, [systemUsers, filteredDeals, filteredTransactions]);

  // Filtered Leaderboard for modal search
  const filteredLeaderboardModalData = useMemo(() => {
    if (!leaderboardSearch.trim()) return teamPerformance;
    const q = leaderboardSearch.toLowerCase();
    return teamPerformance.filter(t => 
      t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q)
    );
  }, [teamPerformance, leaderboardSearch]);

  // Pipeline Stages Funnel (Live CRM calculation)
  const pipelineStages = useMemo(() => {
    return PIPELINE_CONFIG.map(cfg => {
      const matchingDeals = filteredDeals.filter(d => {
        if (cfg.key === 'LEAD') return d.stage === 'LEAD' || d.stage === 'PROSPECTO';
        if (cfg.key === 'QUALIFIED') return d.stage === 'QUALIFIED';
        if (cfg.key === 'PROPOSAL') return d.stage === 'PROPOSAL';
        if (cfg.key === 'NEGOTIATION') return d.stage === 'NEGOTIATION';
        if (cfg.key === 'CLOSED_WON') return d.stage === 'CLOSED_WON';
        return false;
      });

      const totalAmount = matchingDeals.reduce((sum, d) => sum + (d.value || 0), 0);

      return {
        key: cfg.key,
        name: cfg.name,
        color: cfg.color,
        barColor: cfg.barColor,
        amount: totalAmount,
        count: matchingDeals.length,
        deals: matchingDeals
      };
    });
  }, [filteredDeals]);

  // Total active pipeline opportunities
  const totalPipelineOpportunities = useMemo(() => {
    return pipelineStages.reduce((sum, stage) => sum + stage.count, 0);
  }, [pipelineStages]);

  // Export Executive Commercial Report to CSV
  const handleExportReport = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lines: string[] = [];

    lines.push('RESUMEN EJECUTIVO DE GESTION COMERCIAL - PROCOQUINAL OS');
    lines.push(`Fecha de emision: ${todayStr}`);
    lines.push(`Rango seleccionado: ${dateRange}`);
    lines.push(`Filtros activos: ${activeFilters.length > 0 ? activeFilters.join(' | ') : 'Todos los canales'}`);
    lines.push('');

    // Section 1: KPIs
    lines.push('--- METRICAS GENERALES (KPIS) ---');
    lines.push(`Ingresos Totales: ${totalRevenue}`);
    lines.push(`Tasa de Cierre: ${winRate}%`);
    lines.push(`Ticket Promedio (AOV): ${avgOrderValue}`);
    lines.push(`Oportunidades Activas en Embudo: ${totalPipelineOpportunities}`);
    lines.push('');

    // Section 2: Canales
    lines.push('--- DISTRIBUCION POR CANALES ---');
    lines.push('Canal,Facturacion_COP,Porcentaje');
    channelData.forEach(c => {
      const pct = totalRevenue > 0 ? Math.round((c.value / totalRevenue) * 100) : 0;
      lines.push(`"${c.name}",${c.value},${pct}%`);
    });
    lines.push('');

    // Section 3: Ranking Asesores
    lines.push('--- RANKING DE DESEMPENO COMERCIAL ---');
    lines.push('Posicion,Asesor,Cargo,Ventas_COP,Meta_COP,Cumplimiento_Pct,Tratos_Ganados,Tasa_Cierre_Pct');
    teamPerformance.forEach((member, idx) => {
      const pct = member.quota > 0 ? Math.round((member.sales / member.quota) * 100) : 0;
      lines.push(`${idx + 1},"${member.name}","${member.role}",${member.sales},${member.quota},${pct}%,${member.dealsCount},${member.winRate}%`);
    });
    lines.push('');

    // Section 4: Embudo
    lines.push('--- EMBUDO ACTIVO DE VENTAS (PIPELINE) ---');
    lines.push('Etapa,Cantidad_Tratos,Valor_Total_COP');
    pipelineStages.forEach(st => {
      lines.push(`"${st.name}",${st.count},${st.amount}`);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(e => e).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Gestion_Comercial_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
            Centro de Mando Comercial
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              En Vivo (ERP & CRM)
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitoreo estratégico de ingresos, canales, embudo activo y rendimiento del equipo en tiempo real.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto relative z-20">
          {/* Date Picker Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsDateOpen(!isDateOpen); setIsFilterOpen(false); }}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs text-sm font-semibold"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{dateRange}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDateOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-30">
                {dateOptions.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { setDateRange(opt); setIsDateOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between ${dateRange === opt ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {opt}
                    {dateRange === opt && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); setIsDateOpen(false); }}
              className={`flex items-center gap-2 bg-white border px-4 py-2 rounded-xl transition-colors shadow-2xs text-sm font-semibold ${activeFilters.length > 0 ? 'border-indigo-300 text-indigo-700 bg-indigo-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">
                {activeFilters.length > 0 ? `${activeFilters.length} Canales` : 'Canales'}
              </span>
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-30 p-2" onClick={e => e.stopPropagation()}>
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Filtrar por Canal</div>
                {filterOptions.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => toggleFilter(opt)}
                    className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-3 text-slate-700 hover:bg-slate-50"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeFilters.includes(opt) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                      {activeFilters.includes(opt) && <Check className="w-3 h-3" />}
                    </div>
                    {opt}
                  </button>
                ))}
                {activeFilters.length > 0 && (
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <button onClick={() => setActiveFilters([])} className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-bold py-1">
                      Limpiar canales
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Functional Report Download */}
          <button 
            onClick={handleExportReport}
            className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 font-bold text-sm cursor-pointer"
            title="Descargar reporte comercial en formato CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Reporte</span>
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title={`Ingresos (${dateRange})`} 
          value={formatCOP(totalRevenue)} 
          subValue={`${salesCount} operaciones registradas`} 
          trend="+18.4%" 
          icon={DollarSign} 
          trendUp={true} 
        />
        <KpiCard 
          title="Tasa de Cierre (Win Rate)" 
          value={`${winRate}%`} 
          subValue="Efectividad en tratos cerrados" 
          trend="+5.8%" 
          icon={Target} 
          trendUp={true} 
        />
        <KpiCard 
          title="Ticket Promedio (AOV)" 
          value={formatCOP(avgOrderValue)} 
          subValue="Monto medio por transacción" 
          trend="+3.2%" 
          icon={TrendingUp} 
          trendUp={true} 
        />
        <KpiCard 
          title="Oportunidades en Embudo" 
          value={totalPipelineOpportunities} 
          subValue={`Valor total: ${formatCOP(pipelineStages.reduce((a, b) => a + b.amount, 0))}`} 
          trend="+8 tratos" 
          icon={Users} 
          trendUp={true} 
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Evolution Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-slate-200 z-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Evolución de Ingresos
              </h3>
              <p className="text-xs text-slate-500">Comparativa mensual real (B2B Corporativo vs. Canales Mostrador)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5"></span> B2B Corporativo
              </span>
              <span className="flex items-center text-sky-500">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-1.5"></span> POS / Retail
              </span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesEvolutionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11}} 
                  tickFormatter={(val) => `$${(val/1000000).toFixed(0)}M`} 
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => [formatCOP(value), name === 'b2b' ? 'B2B Corp' : 'POS / Retail']}
                />
                <Area type="monotone" dataKey="b2b" name="b2b" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorB2B)" />
                <Area type="monotone" dataKey="ecommerce" name="ecommerce" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorEcom)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col z-10">
          <h3 className="font-bold text-slate-900 text-lg mb-1">Distribución por Canal</h3>
          <p className="text-xs text-slate-500 mb-6">Composición de los ingresos en el periodo</p>
          
          <div className="flex-1 flex flex-col justify-center relative">
            <div className="h-48 w-full relative">
              {channelData.length > 0 && totalRevenue > 0 ? (
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
                    <RechartsTooltip formatter={(value: number) => formatCOP(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Sin datos para estos filtros</div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900">{formatCOP(totalRevenue)}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2.5">
              {channelData.map((channel, i) => {
                const pct = totalRevenue > 0 ? Math.round((channel.value / totalRevenue) * 100) : 0;
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }}></div>
                      <span className="font-medium text-slate-700">{channel.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono text-[11px]">{formatCOP(channel.value)}</span>
                      <span className="font-bold text-slate-900 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Team & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 z-10 relative">
        {/* Leaderboard */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Leaderboard de Ventas del Equipo
            </h3>
            <button 
              onClick={() => setIsLeaderboardModalOpen(true)}
              className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors hover:underline cursor-pointer flex items-center gap-1"
            >
              Ver todos ({teamPerformance.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {teamPerformance.length > 0 ? teamPerformance.slice(0, 4).map((member, i) => {
              const percent = Math.min(100, (member.sales / member.quota) * 100);
              return (
                <div 
                  key={member.id} 
                  onClick={() => setSelectedAgentModal(member)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:border-indigo-400 transition-colors">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          {member.name}
                          {i === 0 && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">Líder</span>}
                        </h4>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">{formatCOP(member.sales)}</div>
                      <div className="text-[11px] font-medium text-slate-400">Meta: {formatCOP(member.quota)}</div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex items-center">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Cumplimiento: <strong>{percent.toFixed(0)}%</strong></span>
                    <span>Tasa de cierre: <strong>{member.winRate}%</strong></span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-500 text-sm">No hay vendedores para los filtros seleccionados.</div>
            )}
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                Embudo Activo (Funnel CRM)
              </h3>
              <p className="text-xs text-slate-500">Haz clic en cualquier etapa para ver sus oportunidades</p>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {totalPipelineOpportunities} Tratos Activos
            </div>
          </div>

          <div className="flex flex-col h-full justify-start mt-2 gap-2">
            {pipelineStages.map((stage, i) => {
              const widthPercent = 100 - (i * 12);
              return (
                <div 
                  key={stage.key} 
                  onClick={() => setSelectedStageModal(stage)}
                  className="flex flex-col items-center group cursor-pointer"
                  title="Haz clic para inspeccionar los tratos en esta etapa"
                >
                  <div 
                    className={`${stage.color} h-12 flex items-center justify-between px-4 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-md shadow-xs`}
                    style={{ 
                      width: `${widthPercent}%`, 
                      borderTopLeftRadius: i === 0 ? '12px' : '6px',
                      borderTopRightRadius: i === 0 ? '12px' : '6px',
                      borderBottomLeftRadius: i === pipelineStages.length - 1 ? '12px' : '6px',
                      borderBottomRightRadius: i === pipelineStages.length - 1 ? '12px' : '6px',
                    }}
                  >
                    <span className="text-xs font-bold truncate pr-2 flex items-center gap-1.5">
                      {stage.name}
                      <Eye className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold opacity-90">{stage.count} tratos</span>
                      <span className="font-black">{formatCOP(stage.amount)}</span>
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

      {/* --- MODAL 1: FULL LEADERBOARD MODAL --- */}
      {isLeaderboardModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    Leaderboard Completo de Ventas
                    <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full font-bold">
                      {teamPerformance.length} Vendedores
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Ranking oficial de rendimiento comercial y cumplimiento de metas ({dateRange})</p>
                </div>
              </div>
              <button 
                onClick={() => setIsLeaderboardModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Top Stats Summary */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venta Total Equipo</p>
                  <p className="text-base font-black text-slate-900">{formatCOP(teamPerformance.reduce((a, b) => a + b.sales, 0))}</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Promedio Cumplimiento</p>
                  <p className="text-base font-black text-slate-900">
                    {teamPerformance.length > 0 
                      ? Math.round(teamPerformance.reduce((a, b) => a + (b.sales / b.quota) * 100, 0) / teamPerformance.length)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Líder del Ranking</p>
                  <p className="text-base font-black text-slate-900">{teamPerformance[0]?.name || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-white shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Buscar vendedor por nombre o cargo..."
                  value={leaderboardSearch}
                  onChange={e => setLeaderboardSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:bg-white transition-all"
                />
                {leaderboardSearch && (
                  <button onClick={() => setLeaderboardSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Table List */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center w-14">Posición</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Vendedor</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Ventas Reales</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Meta Asignada</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Cumplimiento (%)</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Tasa Cierre</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaderboardModalData.length > 0 ? (
                      filteredLeaderboardModalData.map((member) => {
                        const rank = teamPerformance.findIndex(t => t.id === member.id) + 1;
                        const percent = Math.min(100, Math.round((member.sales / member.quota) * 100));
                        const isExceeded = member.sales >= member.quota;
                        
                        return (
                          <tr 
                            key={member.id} 
                            onClick={() => {
                              setSelectedAgentModal(member);
                              setIsLeaderboardModalOpen(false);
                            }}
                            className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                          >
                            <td className="px-4 py-3.5 text-center">
                              <div className={`w-8 h-8 rounded-xl mx-auto flex items-center justify-center font-black text-xs ${
                                rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-300 shadow-xs' :
                                rank === 2 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                                rank === 3 ? 'bg-amber-700/10 text-amber-800 border border-amber-700/20' :
                                'bg-slate-50 text-slate-500 font-bold'
                              }`}>
                                {rank === 1 ? <Trophy className="w-4 h-4 text-amber-500" /> : `#${rank}`}
                              </div>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                  {member.avatar}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                    {member.name}
                                    {rank === 1 && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Líder</span>}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium">{member.role}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-right font-black text-slate-900">
                              {formatCOP(member.sales)}
                            </td>

                            <td className="px-4 py-3.5 text-right text-slate-500 font-medium">
                              {formatCOP(member.quota)}
                            </td>

                            <td className="px-4 py-3.5 w-44">
                              <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span className={isExceeded ? 'text-emerald-600' : 'text-indigo-600'}>{percent}%</span>
                                <span className="text-slate-400 font-normal">{member.dealsCount} tratos</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                              {member.winRate}%
                            </td>

                            <td className="px-4 py-3.5 text-center">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                isExceeded ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                percent >= 80 ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}>
                                {isExceeded ? 'Superado' : percent >= 80 ? 'En Meta' : 'Alerta'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium text-sm">
                          No se encontraron vendedores que coincidan con "{leaderboardSearch}".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL 2: STAGE DEALS INSPECTION MODAL --- */}
      {selectedStageModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Etapa: {selectedStageModal.name}
                    <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                      {selectedStageModal.count} Oportunidades
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Valor total en esta fase: <strong className="text-white">{formatCOP(selectedStageModal.amount)}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStageModal(null)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
              {selectedStageModal.deals && selectedStageModal.deals.length > 0 ? (
                <div className="space-y-3">
                  {selectedStageModal.deals.map((deal: any) => {
                    const client = contactsMap.get(deal.contactId);
                    const owner = usersMap.get(deal.ownerId);
                    return (
                      <div key={deal.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{deal.title}</h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {client?.name || client?.company || 'Cliente Corporativo'} • Asesor: <strong>{owner?.name || 'Comercial'}</strong>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-indigo-700 text-sm">{formatCOP(deal.value)}</div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                              Prob: {deal.probability || 50}%
                            </span>
                          </div>
                        </div>
                        {deal.notes && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {deal.notes}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                          <span>Cierre esperado: {deal.expectedCloseDate || 'Por definir'}</span>
                          <button 
                            onClick={() => {
                              setSelectedStageModal(null);
                              dispatchActionSignal('HIGHLIGHT_CRM_DEAL', { dealId: deal.id });
                              navigate('/crm?tab=embudo');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            Ver en CRM <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No hay tratos en esta etapa para el rango actual.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- MODAL 3: AGENT QUICK DETAIL MODAL --- */}
      {selectedAgentModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white text-xl font-bold flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  {selectedAgentModal.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedAgentModal.name}</h3>
                  <p className="text-xs text-slate-400">{selectedAgentModal.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {selectedAgentModal.dealsCount} Tratos Ganados
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {selectedAgentModal.winRate}% Éxito
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgentModal(null)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 bg-slate-50 flex-1">
              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Facturación Periodo</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{formatCOP(selectedAgentModal.sales)}</div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Meta Asignada</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{formatCOP(selectedAgentModal.quota)}</div>
                </div>
              </div>

              {/* Active Pipeline Preview */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Tratos en Proceso Activo</span>
                  <span className="text-indigo-600 font-bold">{selectedAgentModal.activeDeals.length} abiertos</span>
                </h4>
                {selectedAgentModal.activeDeals.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {selectedAgentModal.activeDeals.slice(0, 3).map((d: any) => (
                      <div 
                        key={d.id} 
                        onClick={() => {
                          setSelectedAgentModal(null);
                          dispatchActionSignal('HIGHLIGHT_CRM_DEAL', { dealId: d.id });
                          navigate('/crm?tab=embudo');
                        }}
                        className="text-xs p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 flex justify-between items-center cursor-pointer transition-colors group"
                        title="Haga clic para ver este trato en el CRM"
                      >
                        <span className="font-semibold text-slate-800 group-hover:text-indigo-600 truncate max-w-[200px] flex items-center gap-1">
                          {d.title}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500 transition-opacity" />
                        </span>
                        <span className="font-bold text-indigo-700">{formatCOP(d.value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tiene tratos abiertos pendientes actualmente.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setSelectedAgentModal(null);
                    navigate(`/staff/registro-actividad?agentId=${selectedAgentModal.id}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-indigo-200 cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  Ver Historial en Registro de Actividad Comercial
                </button>
                <button
                  onClick={() => {
                    setSelectedAgentModal(null);
                    navigate(`/staff/sales-profiles`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                >
                  <Users className="w-4 h-4" />
                  Ver Perfil de Rendimiento del Asesor
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
