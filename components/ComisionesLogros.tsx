import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useEnterprise } from '../context/EnterpriseContext';
import { useUIStore } from '../stores/uiStore';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { dispatchActionSignal } from '../stores/actionSignals';
import { formatCOP } from '../utils/format';
import { 
  Trophy, Flame, Target, DollarSign, Star, TrendingUp, AlertCircle, 
  CheckCircle2, Lock, Unlock, ChevronRight, Gift, Medal, ChevronDown, Check, Users,
  ShieldAlert, KeyRound, X, ExternalLink, Building2, Clock, Sparkles, FileText, ArrowUpRight,
  Receipt, ShieldCheck, BadgeCheck, Printer, ChevronLeft, Layers
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { CommissionEngine, SalesMetrics } from '../utils/CommissionEngine';

interface CommissionDeal {
  id: string;
  title: string;
  company?: string;
  value?: number;
  stage?: string;
  ownerId?: string;
  advisorName?: string;
  contactId?: string;
}

interface TrophyItem {
  id: string;
  title: string;
  desc: string;
  reward: string;
  unlocked: boolean;
  icon: any;
  color: string;
  bg: string;
}

export interface AgentTransactionItem {
  id: string;
  dealId?: string;
  title: string;
  company: string;
  date: string;
  value: number;
  advisorName: string;
  recaudoStatus: 'RECAUDADO' | 'PENDIENTE' | 'EN_MORA' | 'NOTA_CREDITO';
  recaudoLabel: string;
  comisionValue: number;
  frozenValue?: number;
  penaltyValue?: number;
  comisionStatus: 'LIQUIDADA' | 'CONGELADA' | 'PENALIZADA' | 'DEDUCIDA';
  reason: string;
}

interface ComputedAgent {
  id: string;
  isConsolidated?: boolean;
  name: string;
  role: string;
  avatar: string;
  quota: number;
  currentSales: number;
  openPipelineValue: number;
  progressPercent: number;
  level: number;
  xp: number;
  nextRankXp: number;
  rank: string;
  rankColor: string;
  commissionDistribution: { name: string; value: number; color: string }[];
  transparencyData: {
    totalBilled: number;
    totalCollected: number;
    pendingCollection: number;
    commissionEarned: number;
    commissionFrozen: number;
    agingPenaltyValue?: number;
    returnsDeducted: number;
  };
  wonDeals: CommissionDeal[];
  openDeals: any[];
  trophies: TrophyItem[];
  transactionsList: AgentTransactionItem[];
}

export const ComisionesLogros: React.FC = () => {
  const navigate = useNavigate();
  const { systemUsers, deals, activities, commissionRules, addTransaction } = useEnterprise();
  const { addToast } = useUIStore();
  
  // Por defecto iniciamos con 'ALL' para ofrecer la vista consolidada de todo el equipo
  const [selectedAgentId, setSelectedAgentId] = useState<string>('ALL');
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  
  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPendingInvoicesModal, setShowPendingInvoicesModal] = useState(false);
  const [authId, setAuthId] = useState('');
  const [docCurrentPage, setDocCurrentPage] = useState<number>(1);
  const [docViewMode, setDocViewMode] = useState<'PAGINADO' | 'TODAS_HOJAS'>('PAGINADO');

  // Escape key hooks for accessible modal closing
  useEscapeKey(() => setShowAuthModal(false), showAuthModal);
  useEscapeKey(() => setShowPendingInvoicesModal(false), showPendingInvoicesModal);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setIsAgentMenuOpen(false);
    if (isAgentMenuOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isAgentMenuOpen]);

  // Helper para asignar el título correcto según baseRole
  const getAgentRoleTitle = (baseRole?: string) => {
    if (baseRole === 'admin') return 'Administrador General';
    if (baseRole === 'manager') return 'Gerente Comercial';
    return 'Ejecutivo de Ventas';
  };

  // 1. Filtrar los usuarios comerciales reales del sistema
  const commercialUsers = useMemo(() => {
    const list = (systemUsers || []).filter(u => u.baseRole === 'Comercial' || u.baseRole === 'manager' || u.baseRole === 'admin');
    return list.length > 0 ? list : [
      { id: '1', name: 'Admin Global', email: 'admin@avalon.com', baseRole: 'admin', quota: 100000000, avatar: 'AD' },
      { id: '3', name: 'Ana García', email: 'ana@avalon.com', baseRole: 'Comercial', quota: 150000000, avatar: 'AG' },
      { id: '4', name: 'Carlos Méndez', email: 'carlos@avalon.com', baseRole: 'Comercial', quota: 100000000, avatar: 'CM' },
      { id: '5', name: 'Lucía Fernández', email: 'lucia@avalon.com', baseRole: 'manager', quota: 200000000, avatar: 'LF' },
    ];
  }, [systemUsers]);

  // 2. Cálculo dinámico individual por cada asesor
  const individualAgents: ComputedAgent[] = useMemo(() => {
    return commercialUsers.map((u) => {
      const userDeals = (deals || []).filter(d => d.ownerId === u.id);
      const wonDeals: CommissionDeal[] = userDeals
        .filter(d => d.stage === 'CLOSED_WON')
        .map(d => ({ ...d, advisorName: u.name }));
      const openDeals = userDeals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST');
      const lostDeals = userDeals.filter(d => d.stage === 'CLOSED_LOST');

      const quota = u.quota || (u.baseRole === 'manager' ? 200000000 : u.baseRole === 'admin' ? 100000000 : 120000000);
      const currentSales = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const openPipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      
      // Simulación de recaudo real en base a cartera cerrada (78% cobrado, 22% pendiente a crédito)
      const totalBilled = currentSales;
      const totalCollected = Math.round(currentSales * 0.78);
      const pendingCollection = Math.max(0, totalBilled - totalCollected);

      // Reglas activas de la Matriz de Comisiones
      const activeRules = (commissionRules || []).filter(r => r.active);
      const userActivities = (activities || []).filter(a => a.ownerId === u.id);

      // 1. Construir las métricas de venta (En el futuro provendrán directo del backend)
      const metrics: SalesMetrics = {
        totalRecaudo: totalCollected,
        totalFacturacion: totalBilled,
        ventasPorFamilia: {
           'CARPOLY': Math.round(totalBilled * 0.35),
           'DESENGRASANTES': Math.round(totalBilled * 0.10)
        },
        ventasPorProducto: {},
        tareasCrmCompletadas: userActivities.length,
        porcentajeDescuentosAltos: 0.15, // Suposición de descuentos altos
        porcentajeRecaudoEnTiempo: {
           menosDe30Dias: 0.70,
           entre31Y60Dias: 0.20,
           masDe90Dias: 0.10
        }
      };

      // 2. Procesar las reglas de comisión con el Motor Puro (Domain-Driven Design)
      let commissionEarned = 0;
      const commissionDistribution: { name: string; value: number; color: string }[] = [];
      const ruleColors = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6'];

      activeRules.forEach((rule, idx) => {
        const rulePayout = CommissionEngine.calculateRuleCost(rule as any, metrics);
        if (rulePayout > 0) {
           commissionEarned += rulePayout;
           commissionDistribution.push({
             name: rule.name,
             value: rulePayout,
             color: ruleColors[idx % ruleColors.length]
           });
        }
      });

      // Deducciones y Congelados (Fingimos que la porción de mora se congeló basándonos en la tasa promedio ganada)
      const avgRateEarned = totalBilled > 0 ? (commissionEarned / totalBilled) : 0;
      const commissionFrozen = Math.round(pendingCollection * avgRateEarned);

      // Agregamos deducciones por notas crédito u otras penalidades a la gráfica como negativo/alerta
      const returnsDeducted = lostDeals.length > 0 ? 120000 : 0;
      const agingPenaltyValue = -Math.round(pendingCollection * 0.005); // Penalidad fija por la mora

      if (agingPenaltyValue < 0) {
        commissionDistribution.push({ name: 'Penalidad Mora Cartera', value: Math.abs(agingPenaltyValue), color: '#ef4444' });
      }

      // Porcentaje de meta
      const progressPercent = quota > 0 ? (currentSales / quota) * 100 : 0;

      // Rango y Nivel Gamificado
      let rank = 'Vendedor Bronce';
      let rankColor = 'text-amber-700';
      if (progressPercent >= 115) {
        rank = 'Vendedor Diamante';
        rankColor = 'text-blue-400';
      } else if (progressPercent >= 100) {
        rank = 'Vendedor Oro';
        rankColor = 'text-amber-400';
      } else if (progressPercent >= 65) {
        rank = 'Vendedor Plata';
        rankColor = 'text-slate-300';
      }

      const level = Math.max(1, Math.floor(currentSales / 8000000));
      const xp = Math.round((currentSales % 10000000) / 1000);
      const nextRankXp = 10000;

      // Trofeos y Retos Dinámicos
      const trophies: TrophyItem[] = [
        {
          id: 't-b2b',
          title: 'Cazador B2B',
          desc: 'Cierra 2 o más tratos corporativos en el ciclo.',
          reward: '+$150,000 COP',
          unlocked: wonDeals.length >= 2,
          icon: Target,
          color: 'text-amber-500',
          bg: 'bg-amber-500/20'
        },
        {
          id: 't-whale',
          title: 'Cazador de Ballenas',
          desc: 'Cierra un negocio superior a $40M COP.',
          reward: 'Bono Whale VIP',
          unlocked: wonDeals.some(d => (d.value || 0) >= 40000000),
          icon: Trophy,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/20'
        },
        {
          id: 't-crm',
          title: 'Disciplina CRM',
          desc: 'Registra al menos 3 interacciones o llamadas en el CRM.',
          reward: '+$80,000 COP',
          unlocked: userActivities.length >= 3,
          icon: Users,
          color: 'text-blue-400',
          bg: 'bg-blue-500/20'
        },
        {
          id: 't-target',
          title: 'Meta Superada',
          desc: 'Cumple el 100% de la cuota mensual asignada.',
          reward: 'Multiplicador 2.5x',
          unlocked: progressPercent >= 100,
          icon: Flame,
          color: 'text-orange-500',
          bg: 'bg-orange-500/20'
        },
        {
          id: 't-pipeline',
          title: 'Semillero Activo',
          desc: 'Mantén más de $20M en pipeline abierto.',
          reward: '+$50,000 COP',
          unlocked: openPipelineValue >= 20000000,
          icon: Star,
          color: 'text-purple-400',
          bg: 'bg-purple-500/20'
        }
      ];

      // Construcción del desglose detallado de transacciones auditadas (Página 2 del desprendible)
      const baseRate = 2.5;
      const transactionsList: AgentTransactionItem[] = [];

      wonDeals.forEach((deal, idx) => {
        const val = deal.value || 0;
        const dealDate = new Date(Date.now() - (idx * 5 + 3) * 86400000).toLocaleDateString('es-CO');
        const facId = `FV-2026-${String(1040 + idx * 17).slice(-4)}`;

        if (idx % 3 === 0) {
          // Factura recaudada al 100%
          const comm = Math.round(val * (baseRate / 100));
          transactionsList.push({
            id: facId,
            dealId: deal.id,
            title: deal.title,
            company: deal.company || 'Cliente B2B',
            date: dealDate,
            value: val,
            advisorName: u.name,
            recaudoStatus: 'RECAUDADO',
            recaudoLabel: 'Recaudado 100%',
            comisionValue: comm,
            comisionStatus: 'LIQUIDADA',
            reason: `Comisión base (${baseRate}%) liquidada al 100%. Factura cobrada a tiempo y conciliada en Tesorería.`
          });
        } else if (idx % 3 === 1) {
          // Factura en cartera pendiente de recaudo
          const commFrozen = Math.round(val * (baseRate / 100));
          transactionsList.push({
            id: facId,
            dealId: deal.id,
            title: deal.title,
            company: deal.company || 'Cliente B2B',
            date: dealDate,
            value: val,
            advisorName: u.name,
            recaudoStatus: 'PENDIENTE',
            recaudoLabel: 'Pendiente Cartera (30d)',
            comisionValue: 0,
            frozenValue: commFrozen,
            comisionStatus: 'CONGELADA',
            reason: `Comisión retenida en espera de recaudo ($0 desembolsado). Se liberará una vez el cliente pague su saldo.`
          });
        } else {
          // Factura con mora >45 días
          const fullComm = Math.round(val * (baseRate / 100));
          const penalty = Math.round(fullComm * 0.25);
          const commNet = fullComm - penalty;
          transactionsList.push({
            id: facId,
            dealId: deal.id,
            title: deal.title,
            company: deal.company || 'Cliente B2B',
            date: dealDate,
            value: val,
            advisorName: u.name,
            recaudoStatus: 'EN_MORA',
            recaudoLabel: 'Mora Cartera (>45d)',
            comisionValue: commNet,
            penaltyValue: penalty,
            comisionStatus: 'PENALIZADA',
            reason: `Penalidad de mora aplicada (-25%). El recaudo superó los 45 días de plazo según regla formal de Aging.`
          });
        }
      });

      if (returnsDeducted > 0) {
        transactionsList.push({
          id: 'NC-2026-0089',
          title: 'Devolución de Producto / Ajuste Comercial',
          company: 'Ferretería & Pinturas / Cliente B2B',
          date: new Date(Date.now() - 2 * 86400000).toLocaleDateString('es-CO'),
          value: returnsDeducted * 5,
          advisorName: u.name,
          recaudoStatus: 'NOTA_CREDITO',
          recaudoLabel: 'Nota Crédito ERP',
          comisionValue: -returnsDeducted,
          comisionStatus: 'DEDUCIDA',
          reason: 'Deducción por devolución de mercancía autorizada por bodega y asentada en el libro contable.'
        });
      }

      return {
        id: u.id,
        name: u.name,
        role: getAgentRoleTitle(u.baseRole),
        avatar: u.avatar || u.name.substring(0, 2).toUpperCase(),
        quota,
        currentSales,
        openPipelineValue,
        progressPercent,
        level,
        xp,
        nextRankXp,
        rank,
        rankColor,
        commissionDistribution,
        transparencyData: {
          totalBilled,
          totalCollected,
          pendingCollection,
          commissionEarned,
          commissionFrozen,
          agingPenaltyValue,
          returnsDeducted
        },
        wonDeals,
        openDeals,
        trophies,
        transactionsList
      };
    });
  }, [commercialUsers, deals, commissionRules, activities]);

  // 3. Vista consolidada "Todos" (Todo el Equipo Comercial)
  const allAgent: ComputedAgent = useMemo(() => {
    const totalQuota = individualAgents.reduce((sum, a) => sum + a.quota, 0);
    const totalSales = individualAgents.reduce((sum, a) => sum + a.currentSales, 0);
    const totalPipeline = individualAgents.reduce((sum, a) => sum + a.openPipelineValue, 0);
    const totalBilled = individualAgents.reduce((sum, a) => sum + a.transparencyData.totalBilled, 0);
    const totalCollected = individualAgents.reduce((sum, a) => sum + a.transparencyData.totalCollected, 0);
    const totalPending = individualAgents.reduce((sum, a) => sum + a.transparencyData.pendingCollection, 0);
    const totalCommissionEarned = individualAgents.reduce((sum, a) => sum + a.transparencyData.commissionEarned, 0);
    const totalCommissionFrozen = individualAgents.reduce((sum, a) => sum + a.transparencyData.commissionFrozen, 0);
    const totalAgingPenalty = individualAgents.reduce((sum, a) => sum + (a.transparencyData.agingPenaltyValue || 0), 0);
    const totalReturnsDeducted = individualAgents.reduce((sum, a) => sum + (a.transparencyData.returnsDeducted || 0), 0);

    const progressPercent = totalQuota > 0 ? (totalSales / totalQuota) * 100 : 0;

    let rank = 'Escuadrón Bronce';
    let rankColor = 'text-amber-700';
    if (progressPercent >= 115) {
      rank = 'Escuadrón Diamante';
      rankColor = 'text-blue-400';
    } else if (progressPercent >= 100) {
      rank = 'Escuadrón Oro';
      rankColor = 'text-amber-400';
    } else if (progressPercent >= 65) {
      rank = 'Escuadrón Plata';
      rankColor = 'text-slate-300';
    }

    const commissionDistribution: { name: string; value: number; color: string }[] = [];
    const ruleColors = ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6'];
    
    // Aggregating pie chart colors organically by name mapping from the individuals
    const groupedDistrib = individualAgents.flatMap(a => a.commissionDistribution).reduce((acc: any, curr) => {
       if (!acc[curr.name]) acc[curr.name] = { name: curr.name, value: 0, color: curr.color };
       acc[curr.name].value += curr.value;
       return acc;
    }, {});
    
    Object.values(groupedDistrib).forEach((item: any) => {
        commissionDistribution.push(item);
    });

    const allWonDeals = individualAgents.flatMap(a => a.wonDeals);
    const allOpenDeals = individualAgents.flatMap(a => a.openDeals);
    const totalActivitiesCount = (activities || []).length;

    const trophies: TrophyItem[] = [
      {
        id: 't-all-b2b',
        title: 'Fuerza B2B Conjunta',
        desc: 'El equipo ha cerrado 4 o más tratos corporativos en el ciclo.',
        reward: '+$500,000 COP Fondo',
        unlocked: allWonDeals.length >= 4,
        icon: Target,
        color: 'text-amber-500',
        bg: 'bg-amber-500/20'
      },
      {
        id: 't-all-whale',
        title: 'Caza Mayor en Equipo',
        desc: 'Al menos una cuenta cerrada de gran envergadura (≥ $40M COP).',
        reward: 'Trofeo VIP Avalon',
        unlocked: allWonDeals.some(d => (d.value || 0) >= 40000000),
        icon: Trophy,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/20'
      },
      {
        id: 't-all-crm',
        title: 'Sincronización Total CRM',
        desc: 'Más de 5 interacciones o seguimientos activos registrados.',
        reward: '+$200,000 COP Fondo',
        unlocked: totalActivitiesCount >= 5,
        icon: Users,
        color: 'text-blue-400',
        bg: 'bg-blue-500/20'
      },
      {
        id: 't-all-target',
        title: 'Meta Colectiva Alcanzada',
        desc: 'El equipo cumple el 100% de la cuota global asignada.',
        reward: 'Acelerador 2.5x Global',
        unlocked: progressPercent >= 100,
        icon: Flame,
        color: 'text-orange-500',
        bg: 'bg-orange-500/20'
      },
      {
        id: 't-all-pipeline',
        title: 'Semillero Robusto',
        desc: 'Mantener más de $40M COP en oportunidades de pipeline.',
        reward: 'Sostenibilidad Q4',
        unlocked: totalPipeline >= 40000000,
        icon: Star,
        color: 'text-purple-400',
        bg: 'bg-purple-500/20'
      }
    ];

    return {
      id: 'ALL',
      isConsolidated: true,
      name: 'Todo el Equipo Comercial',
      role: `Consolidado Global • ${individualAgents.length} Asesores`,
      avatar: '👥',
      quota: totalQuota,
      currentSales: totalSales,
      openPipelineValue: totalPipeline,
      progressPercent,
      level: Math.max(1, Math.floor(totalSales / 15000000)),
      xp: Math.round((totalSales % 25000000) / 2500),
      nextRankXp: 10000,
      rank,
      rankColor,
      commissionDistribution,
      transparencyData: {
        totalBilled,
        totalCollected,
        pendingCollection: totalPending,
        commissionEarned: totalCommissionEarned,
        commissionFrozen: totalCommissionFrozen,
        agingPenaltyValue: totalAgingPenalty,
        returnsDeducted: totalReturnsDeducted
      },
      wonDeals: allWonDeals,
      openDeals: allOpenDeals,
      trophies,
      transactionsList: individualAgents.flatMap(a => a.transactionsList)
    };
  }, [individualAgents, commissionRules, activities]);

  // Lista combinada de opciones
  const computedAgents = useMemo(() => {
    return [allAgent, ...individualAgents];
  }, [allAgent, individualAgents]);

  // Asesor o vista activa seleccionada
  const player = useMemo(() => {
    if (selectedAgentId === 'ALL') return allAgent;
    return individualAgents.find(a => a.id === selectedAgentId) || allAgent;
  }, [allAgent, individualAgents, selectedAgentId]);

  // Comisión neta a desembolsar
  const netCommission = useMemo(() => {
    return Math.max(0, player.transparencyData.commissionEarned - (player.transparencyData.returnsDeducted || 0));
  }, [player]);

  // Desembolsar Nómina con Firma Electrónica
  const handleOpenAuthModal = () => {
    if (netCommission <= 0) {
      addToast({ title: 'Saldo Insuficiente', message: 'No hay saldo positivo de comisiones líquidas para desembolsar.', severity: 'WARNING' });
      return;
    }
    setAuthId('');
    setDocCurrentPage(1);
    setDocViewMode('PAGINADO');
    setShowAuthModal(true);
  };

  const handleConfirmPayrollWithAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authId.trim().length < 3) {
      addToast({ title: 'PIN Requerido', message: 'Por favor ingresa una firma de ID / PIN válida de al menos 3 dígitos.', severity: 'WARNING' });
      return;
    }

    const isAll = player.id === 'ALL';
    addTransaction({
      id: `NOM-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'COMPRA',
      client: isAll ? 'Equipo Comercial Procoquinal' : player.name,
      document: isAll 
        ? `Nómina Consolidada Comisiones (${individualAgents.length} Asesores) - PIN: ${authId}`
        : `Nómina Comisiones - ${player.name} (PIN: ${authId})`,
      productName: isAll
        ? `Liquidación Global de Comisiones Comerciales (${individualAgents.length} Asesores) - Autorizado por PIN: ${authId}`
        : `Liquidación de Comisiones Comerciales (${player.rank}) - Autorizado por PIN: ${authId}`,
      sku: 'NOM-COMIS',
      qty: 1,
      total: netCommission,
      iva: 0,
      paymentMethod: 'Transferencia Bancaria',
      posLocation: 'Nómina Central',
      siigoExportStatus: 'PENDING_SIIGO_SYNC',
      siigoDocType: 'COMPROBANTE_EGRESO'
    });

    setShowAuthModal(false);
    setAuthId('');
    addToast({
      title: isAll ? 'Nómina Global Aprobada y Desembolsada' : 'Nómina Aprobada y Desembolsada',
      message: isAll
        ? `Comisiones de todo el equipo por ${formatCOP(netCommission)} COP autorizadas exitosamente con firma electrónica y registradas en Contabilidad.`
        : `Comisiones de ${player.name} por ${formatCOP(netCommission)} COP autorizadas exitosamente con firma electrónica y registradas en Contabilidad.`,
      severity: 'SUCCESS'
    });
  };

  // Termómetro de progreso (cap visual en 150%)
  const visualProgressPercent = Math.min(player.progressPercent, 150);
  const getMeterColor = (val: number) => {
    if (val >= 100) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const unlockedCount = player.trophies.filter(t => t.unlocked).length;

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans pb-24 overflow-x-hidden">
      {/* Header Title & Dynamic Agent Switcher */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Centro de Logros & Comisiones
          </h1>
          <p className="text-slate-400 mt-1">Liquidación en tiempo real, auditoría de recaudo y aceleradores de cuota.</p>
        </div>

        {/* Dynamic Agent Switcher Dropdown */}
        <div className="relative z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsAgentMenuOpen(!isAgentMenuOpen); }}
            className="flex items-center gap-3 bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-lg cursor-pointer"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${player.id === 'ALL' ? 'bg-gradient-to-tr from-amber-500 to-indigo-600' : 'bg-indigo-600'}`}>
              {player.avatar}
            </div>
            <div className="text-left">
              <span className="font-bold text-sm block leading-none flex items-center gap-1.5">
                {player.name}
                {player.id === 'ALL' && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-md border border-emerald-500/30">
                    Total
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-400 leading-none mt-0.5 block">{player.role}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isAgentMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAgentMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-in fade-in duration-150"
            >
              <div className="px-3.5 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80 border-b border-slate-700">
                Seleccionar Vista
              </div>
              
              {/* Opción 1: TODOS (Consolidado General) */}
              <button 
                onClick={() => { setSelectedAgentId('ALL'); setIsAgentMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between border-b border-slate-700 cursor-pointer ${selectedAgentId === 'ALL' ? 'bg-indigo-600/25 text-indigo-200' : 'text-slate-200 hover:bg-slate-700/80'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-sm shadow-md text-white font-bold">
                    👥
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm flex items-center gap-1.5 text-white">
                      Todos (Todo el Equipo)
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 font-bold rounded-md border border-emerald-500/30">
                        Total
                      </span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {allAgent.progressPercent.toFixed(0)}% Meta Global • {individualAgents.length} Asesores
                    </span>
                  </div>
                </div>
                {selectedAgentId === 'ALL' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>

              {/* Subencabezado para asesores individuales */}
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/60 border-b border-slate-700/50">
                Asesores Individuales
              </div>

              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {individualAgents.map(agent => (
                  <button 
                    key={agent.id}
                    onClick={() => { setSelectedAgentId(agent.id); setIsAgentMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between border-b border-slate-700/40 last:border-0 cursor-pointer ${selectedAgentId === agent.id ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {agent.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{agent.name}</span>
                        <span className="text-xs text-slate-400 font-medium">{agent.role} • {agent.progressPercent.toFixed(0)}% Meta</span>
                      </div>
                    </div>
                    {selectedAgentId === agent.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Player Profile & The Pie */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Player Card */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden transition-all duration-300">
            {/* Shimmer effect for Diamond/Gold or Consolidated Team */}
            {(player.id === 'ALL' || player.rank.includes('Diamante') || player.rank.includes('Oro')) && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-amber-500/10 pointer-events-none"></div>
            )}
            
            <div className="flex items-center gap-4 relative z-10 mb-6">
              <div className={`w-16 h-16 rounded-2xl p-0.5 shadow-lg ${player.id === 'ALL' ? 'bg-gradient-to-br from-amber-400 via-indigo-500 to-purple-600 shadow-amber-500/20' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30'}`}>
                <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
                  {player.avatar}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {player.name}
                  {player.id === 'ALL' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Global
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Medal className={`w-4 h-4 ${player.rankColor}`} />
                  <span className={`text-sm font-bold ${player.rankColor}`}>{player.rank}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{player.role}</div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  {player.id === 'ALL' ? 'Nivel Global del Escuadrón' : `Nivel ${player.level}`}
                </span>
                <span className="text-slate-300 font-mono text-xs">{player.xp} / {player.nextRankXp} XP</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((player.xp / player.nextRankXp) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 2. La Torta (Commission Distribution) */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white">
                {player.id === 'ALL' ? 'Comisiones Consolidadas del Equipo' : 'Composición de Comisiones'}
              </h3>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Reglas Matrix Activas
              </span>
            </div>
            
            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={player.commissionDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {player.commissionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => [formatCOP(Number(value) || 0), '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white">
                  {formatCOP(player.transparencyData.commissionEarned)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  {player.id === 'ALL' ? 'Total Equipo' : 'Total Devengado'}
                </span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-2 border-t border-slate-700/60 pt-3">
              {player.commissionDistribution.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{formatCOP(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Meter, Transparency & Trophies */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 3. Termómetro de Ventas con Fuego y Multiplicador */}
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  {player.id === 'ALL' ? 'Termómetro Colectivo del Equipo' : 'Termómetro de Cumplimiento'}
                  {player.progressPercent >= 100 && <Flame className="w-6 h-6 text-amber-500 animate-pulse" />}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {player.id === 'ALL' ? 'Meta mensual global combinada:' : 'Meta mensual asignada:'} <strong className="text-white">{formatCOP(player.quota)} COP</strong>
                </p>
              </div>
              <div className="bg-slate-900 px-5 py-2.5 rounded-xl border border-slate-700 flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acelerador Actual</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  {player.progressPercent >= 100 ? '2.5x' : player.progressPercent >= 50 ? '1.5x' : '1.0x'}
                </span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative pt-8 pb-4">
              <div className="absolute top-0 left-0 w-full flex justify-between text-xs font-bold text-slate-500 px-2">
                <span>$0</span>
                <span className="absolute left-[50%] -translate-x-1/2">Meta 1 (50%)</span>
                <span className="absolute left-[100%] -translate-x-full text-amber-500 font-black">Meta 100%</span>
              </div>
              
              <div className="w-full h-8 bg-slate-900 rounded-full p-1 border border-slate-700 relative overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 ${getMeterColor(player.progressPercent)}`}
                  style={{ width: `${Math.min(visualProgressPercent, 100)}%` }}
                >
                  {player.progressPercent >= 100 && (
                    <span className="text-white text-xs font-black tracking-wide drop-shadow">¡META SUPERADA!</span>
                  )}
                </div>
              </div>

              {/* Current Value Marker */}
              <div 
                className="absolute top-10 -mt-2 transition-all duration-1000 ease-out flex flex-col items-center"
                style={{ left: `calc(${Math.min(visualProgressPercent, 100)}% - 24px)` }}
              >
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-white mb-1"></div>
                <div className="bg-white text-slate-900 text-xs font-black px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap">
                  {formatCOP(player.currentSales)} ({player.progressPercent.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 4. Estado del Recaudo y Comisiones Congeladas (Transparencia) */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {player.id === 'ALL' ? 'Recaudo & Cartera Global' : 'Estado del Recaudo & Cartera'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Auditoría de comisiones cobradas vs en limbo</p>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-3.5">
                <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400 font-semibold">
                      {player.id === 'ALL' ? 'Comisiones Disponibles (Equipo)' : 'Comisión Disponible (Recaudada)'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">{formatCOP(player.transparencyData.commissionEarned)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Basado en {formatCOP(player.transparencyData.totalCollected)} de recaudo bancario efectivo total.
                  </div>
                </div>

                {player.transparencyData.returnsDeducted > 0 && (
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-rose-600/30">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-rose-300 font-bold">Deducción por Notas Crédito / Devolución</span>
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-lg font-black text-rose-400">-{formatCOP(player.transparencyData.returnsDeducted)}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Reverso automático por ajustes contables en el mes.</div>
                  </div>
                )}
                
                {/* Botón interactivo: Ver Facturas Pendientes */}
                <div 
                  onClick={() => setShowPendingInvoicesModal(true)}
                  className="bg-slate-900/60 rounded-xl p-4 border border-slate-700 hover:border-indigo-500/50 relative overflow-hidden group cursor-pointer transition-all"
                  title="Haga clic para inspeccionar los tratos y facturas pendientes de recaudo"
                >
                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-xs text-slate-400 font-semibold">
                      {player.id === 'ALL' ? 'Comisiones Congeladas (Total Equipo)' : 'Comisión Congelada (En Espera)'}
                    </span>
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 relative z-10">
                    {formatCOP(player.transparencyData.commissionFrozen)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 relative z-10 flex justify-between items-center">
                    <span>Cartera por cobrar: {formatCOP(player.transparencyData.pendingCollection)}</span>
                    <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-0.5">
                      Auditar <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleOpenAuthModal}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {player.id === 'ALL' ? 'Aprobar y Pagar Nómina Consolidada' : 'Aprobar y Pagar Nómina de Comisiones'}
                </button>
              </div>
            </div>

            {/* 5. Sala de Trofeos & Retos */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {player.id === 'ALL' ? 'Retos & Hitos del Escuadrón' : 'Retos & Trofeos Comerciales'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Incentivos automáticos por hitos reales</p>
                  </div>
                </div>
                <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full font-bold">
                  {unlockedCount} / {player.trophies.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 max-h-[360px]">
                {player.trophies.map(trophy => (
                  <div 
                    key={trophy.id} 
                    className={`p-3 rounded-xl border flex gap-3 transition-all ${
                      trophy.unlocked 
                        ? 'bg-slate-700/50 border-slate-600 shadow-xs' 
                        : 'bg-slate-900/40 border-slate-800/80 opacity-50 grayscale'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${trophy.bg}`}>
                      <trophy.icon className={`w-5 h-5 ${trophy.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className={`text-xs font-bold truncate ${trophy.unlocked ? 'text-white' : 'text-slate-400'}`}>
                          {trophy.title}
                        </h4>
                        {trophy.unlocked ? (
                          <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{trophy.desc}</p>
                      <div className={`text-[10px] font-bold mt-1 ${trophy.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                        Recompensa: {trophy.reward}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: INSPECTOR DE FACTURAS / COMISIONES CONGELADAS --- */}
      {showPendingInvoicesModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-white"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Comisiones Congeladas en Espera de Recaudo
                  </h3>
                  <p className="text-xs text-slate-400">
                    {player.id === 'ALL' ? (
                      <>Consolidado: <strong className="text-white">Todo el Equipo ({individualAgents.length} Asesores)</strong> • Se liberarán a medida que los clientes abonen.</>
                    ) : (
                      <>Asesor: <strong className="text-white">{player.name}</strong> • Se liberarán automáticamente cuando el cliente abone.</>
                    )}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPendingInvoicesModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cartera Pendiente</span>
                  <span className="text-xl font-black text-white mt-1 block">{formatCOP(player.transparencyData.pendingCollection)}</span>
                  <span className="text-[10px] text-slate-400">Saldo pendiente de cobro</span>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-amber-500/30">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Comisión en Limbo</span>
                  <span className="text-xl font-black text-amber-400 mt-1 block">{formatCOP(player.transparencyData.commissionFrozen)}</span>
                  <span className="text-[10px] text-slate-400">Al 2% estimado de recaudo</span>
                </div>
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tratos Involucrados</span>
                  <span className="text-xl font-black text-indigo-400 mt-1 block">{player.wonDeals.length} Cuentas</span>
                  <span className="text-[10px] text-slate-400">Cerradas en el periodo</span>
                </div>
              </div>

              {/* Table of Deals */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Detalle de Tratos Cerrados con Cartera</h4>
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400">
                        <th className="py-3 px-4 font-semibold">Trato / Oportunidad</th>
                        <th className="py-3 px-4 font-semibold">Cliente / Empresa</th>
                        {player.id === 'ALL' && <th className="py-3 px-4 font-semibold">Asesor Asignado</th>}
                        <th className="py-3 px-4 font-semibold">Monto Facturado</th>
                        <th className="py-3 px-4 font-semibold">Comisión a Liberar</th>
                        <th className="py-3 px-4 font-semibold text-center">Acción CRM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {player.wonDeals.length > 0 ? (
                        player.wonDeals.map((deal: CommissionDeal) => {
                          const frozenPortion = Math.round((deal.value || 0) * 0.22 * 0.02);
                          return (
                            <tr key={deal.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-white">{deal.title}</td>
                              <td className="py-3 px-4 text-slate-300">{deal.company || 'Cliente B2B'}</td>
                              {player.id === 'ALL' && (
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-medium text-[11px]">
                                    {deal.advisorName || 'Asesor'}
                                  </span>
                                </td>
                              )}
                              <td className="py-3 px-4 font-mono font-bold text-slate-200">{formatCOP(deal.value)}</td>
                              <td className="py-3 px-4 font-mono font-bold text-amber-400">+{formatCOP(frozenPortion)}</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => {
                                    setShowPendingInvoicesModal(false);
                                    dispatchActionSignal('HIGHLIGHT_CRM_DEAL', { dealId: deal.id, contactId: deal.contactId });
                                    navigate('/crm?tab=embudo');
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg font-bold text-[10px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  Ver en CRM <ExternalLink className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={player.id === 'ALL' ? 6 : 5} className="py-8 text-center text-slate-500 italic">
                            No hay facturas con comisiones retenidas para esta vista.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowPendingInvoicesModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar Auditoría
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* --- MODAL 2: AUTORIZACIÓN Y PAGO DE NÓMINA - FORMATO DOCUMENTO PDF OFICIAL --- */}
      {showAuthModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl h-[94vh] flex flex-col overflow-hidden text-white"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight flex items-center gap-2">
                    Autorización y Emisión de Nómina de Comisiones
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-mono hidden sm:inline">
                      PROCOQUINAL S.A.S.
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formato de Documento Oficial Electrónico • Liquidación, anexo de transacciones y firma por PIN
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Cerrar modal (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document PDF Toolbar */}
            {(() => {
              const txList = player.transactionsList || [];
              const TX_PER_PAGE = 21;
              const totalTxPages = Math.ceil(txList.length / TX_PER_PAGE);
              const totalDocPages = 1 + totalTxPages;

              return (
                <>
                  <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs select-none">
                    {/* Left: View Mode Toggle */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setDocViewMode('PAGINADO')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          docViewMode === 'PAGINADO'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Hoja por Hoja
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocViewMode('TODAS_HOJAS')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          docViewMode === 'TODAS_HOJAS'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Todas las Hojas ({totalDocPages})
                      </button>
                    </div>

                    {/* Center: Pagination Navigator (when in Hoja por Hoja mode) */}
                    {docViewMode === 'PAGINADO' && (
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
                          <button
                            type="button"
                            disabled={docCurrentPage === 1}
                            onClick={() => setDocCurrentPage(p => Math.max(1, p - 1))}
                            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white cursor-pointer font-bold shrink-0"
                            title="Página Anterior"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="font-mono text-amber-300 font-bold px-2 whitespace-nowrap shrink-0">
                            Página {docCurrentPage} de {totalDocPages}
                          </span>
                          <button
                            type="button"
                            disabled={docCurrentPage === totalDocPages}
                            onClick={() => setDocCurrentPage(p => Math.min(totalDocPages, p + 1))}
                            className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white cursor-pointer font-bold shrink-0"
                            title="Página Siguiente"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quick Jump Buttons */}
                        <div className="hidden lg:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto custom-scrollbar pb-1">
                          <button
                            type="button"
                            onClick={() => setDocCurrentPage(1)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shrink-0 ${
                              docCurrentPage === 1 
                                ? 'bg-indigo-600 text-white shadow-xs' 
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            1: Resumen
                          </button>
                          {Array.from({ length: totalTxPages }).map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setDocCurrentPage(i + 2)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shrink-0 ${
                                docCurrentPage === i + 2 
                                  ? 'bg-indigo-600 text-white shadow-xs' 
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {i + 2}: Anexo ({i * TX_PER_PAGE + 1}-{Math.min((i + 1) * TX_PER_PAGE, txList.length)})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Right: Print / Real PDF Action */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors"
                        title="Imprimir documento oficial o guardar en PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Imprimir / PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Viewing Canvas (Authentic Acrobat/Desk Grey Background #525659) */}
                  <div className="bg-[#525659] p-3 sm:p-6 overflow-y-auto overflow-x-auto custom-scrollbar flex-1 flex flex-col items-center">
                    
                    {/* Render Sheet Page 1: Resumen de Nómina */}
                    {(() => {
                      const renderSheetPage1 = () => (
                        <div 
                          key="payroll-sheet-1"
                          className="bg-white text-slate-900 shadow-2xl border border-slate-300 w-full max-w-4xl min-w-[760px] p-8 sm:p-10 font-sans min-h-[980px] flex flex-col justify-between my-3 rounded-xs select-text relative"
                        >
                          <div>
                            {/* Watermark / Pre-approval Stamp */}
                            <div className="absolute right-8 top-8 select-none pointer-events-none border-2 border-emerald-600/50 bg-emerald-50/60 text-emerald-800 font-mono font-black text-[10px] px-3 py-1 rounded tracking-widest uppercase rotate-[-3deg] shadow-xs">
                              DOCUMENTO OFICIAL • PRE-APROBADO
                            </div>

                            {/* Institutional Letterhead */}
                            <div className="border-b-2 border-slate-900 pb-4 mb-4">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                                      P
                                    </div>
                                    <div>
                                      <h1 className="text-xl font-black text-slate-950 tracking-tight leading-none">
                                        PROCOQUINAL S.A.S.
                                      </h1>
                                      <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                                        NIT: 900.823.141-8 • Régimen Común • Responsable de IVA
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-2 font-sans leading-tight">
                                    Calle 17 # 68D-40, Zona Industrial Montevideo, Bogotá D.C., Colombia<br />
                                    PBX: +57 (601) 411-2030 • info@procoquinal.com.co • Software Avalon OS ERP
                                  </div>
                                </div>

                                <div className="border border-slate-300 bg-slate-50 p-2.5 rounded text-[11px] font-mono text-slate-700 min-w-[240px]">
                                  <div className="font-bold text-slate-950 uppercase border-b border-slate-200 pb-1 mb-1 text-center">
                                    LIQUIDACIÓN DE COMISIONES
                                  </div>
                                  <div className="flex justify-between py-0.5">
                                    <span className="text-slate-500">Comprobante:</span>
                                    <span className="font-bold text-blue-900">{player.id === 'ALL' ? 'LIQ-CONSOL-2026-10' : `LIQ-${player.id}-2026-10`}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5">
                                    <span className="text-slate-500">Fecha Emisión:</span>
                                    <span className="font-bold text-slate-900">{new Date().toLocaleDateString('es-CO')}</span>
                                  </div>
                                  <div className="flex justify-between py-0.5">
                                    <span className="text-slate-500">Periodo Liquidado:</span>
                                    <span className="font-bold text-slate-900">Octubre 2026</span>
                                  </div>
                                  <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-bold text-slate-900">
                                    <span className="text-slate-500 font-normal">Página / Hoja:</span>
                                    <span className="text-blue-900">1 de {totalDocPages}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 text-center py-1 bg-slate-900 text-white rounded font-bold text-xs uppercase tracking-wider">
                                COMPROBANTE OFICIAL DE NÓMINA DE COMISIONES Y BONIFICACIONES
                              </div>
                            </div>

                            {/* Beneficiary Meta Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4 font-sans">
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Beneficiario / Perfil</span>
                                <span className="font-bold text-slate-900 truncate block">
                                  {player.id === 'ALL' ? 'TODO EL EQUIPO COMERCIAL' : player.name}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Cargo / Área</span>
                                <span className="font-medium text-slate-700 truncate block">
                                  {player.id === 'ALL' ? `${individualAgents.length} Asesores Activos` : player.role}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Rango / Escalafón</span>
                                <span className="font-bold text-indigo-700 truncate block">
                                  {player.rank} (Nivel {player.level})
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-slate-500 block">Forma de Pago</span>
                                <span className="font-bold text-emerald-700 block">
                                  Transferencia Bancaria
                                </span>
                              </div>
                            </div>

                            {/* Resumen de Desempeño Comercial y Recaudo */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 font-mono text-center">
                              <div className="border border-slate-200 bg-white p-2 rounded">
                                <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Ventas Facturadas</div>
                                <div className="font-bold text-slate-900 text-xs mt-0.5">{formatCOP(player.currentSales)} COP</div>
                              </div>
                              <div className="border border-slate-200 bg-white p-2 rounded">
                                <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Recaudo Efectivo Banco</div>
                                <div className="font-bold text-emerald-700 text-xs mt-0.5">{formatCOP(player.transparencyData.totalCollected)} COP</div>
                              </div>
                              <div className="border border-slate-200 bg-white p-2 rounded">
                                <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Cartera en Espera</div>
                                <div className="font-bold text-amber-700 text-xs mt-0.5">{formatCOP(player.transparencyData.pendingCollection)} COP</div>
                              </div>
                              <div className="border border-slate-200 bg-white p-2 rounded">
                                <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Cumplimiento Cuota</div>
                                <div className="font-bold text-blue-900 text-xs mt-0.5">{player.progressPercent.toFixed(1)}%</div>
                              </div>
                            </div>

                            {/* Main Table: Concepts or Consolidated */}
                            <div className="mb-4 overflow-x-auto border border-slate-300 rounded">
                              {player.id === 'ALL' ? (
                                <table className="w-full text-left text-[11px] font-sans border-collapse">
                                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9.5px]">
                                    <tr>
                                      <th className="py-2 px-3 whitespace-nowrap">Asesor Comercial</th>
                                      <th className="py-2 px-3 whitespace-nowrap">Cargo</th>
                                      <th className="py-2 px-3 whitespace-nowrap text-right">Ventas Won</th>
                                      <th className="py-2 px-3 whitespace-nowrap text-right">Devengado</th>
                                      <th className="py-2 px-3 whitespace-nowrap text-right">Deducciones</th>
                                      <th className="py-2 px-3 whitespace-nowrap text-right text-emerald-800">Neto a Liquidar</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {individualAgents.map(ag => {
                                      const agNet = Math.max(0, ag.transparencyData.commissionEarned - (ag.transparencyData.returnsDeducted || 0));
                                      return (
                                        <tr key={ag.id} className="hover:bg-slate-50">
                                          <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">{ag.name}</td>
                                          <td className="py-2 px-3 text-slate-600 text-[10px] whitespace-nowrap">{ag.role}</td>
                                          <td className="py-2 px-3 text-right font-mono text-slate-700 whitespace-nowrap">{formatCOP(ag.currentSales)} COP</td>
                                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">+{formatCOP(ag.transparencyData.commissionEarned)} COP</td>
                                          <td className="py-2 px-3 text-right font-mono text-rose-600 whitespace-nowrap">
                                            {ag.transparencyData.returnsDeducted ? `-${formatCOP(ag.transparencyData.returnsDeducted)} COP` : '$0 COP'}
                                          </td>
                                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">{formatCOP(agNet)} COP</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900 text-[11px]">
                                    <tr>
                                      <td colSpan={2} className="py-2 px-3 uppercase text-slate-700">TOTAL CONSOLIDADO EQUIPO:</td>
                                      <td className="py-2 px-3 text-right font-mono whitespace-nowrap">{formatCOP(player.currentSales)} COP</td>
                                      <td className="py-2 px-3 text-right font-mono whitespace-nowrap">+{formatCOP(player.transparencyData.commissionEarned)} COP</td>
                                      <td className="py-2 px-3 text-right font-mono text-rose-600 whitespace-nowrap">
                                        {player.transparencyData.returnsDeducted ? `-${formatCOP(player.transparencyData.returnsDeducted)} COP` : '$0 COP'}
                                      </td>
                                      <td className="py-2 px-3 text-right font-mono text-emerald-800 font-black whitespace-nowrap">{formatCOP(netCommission)} COP</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              ) : (
                                <table className="w-full text-left text-[11px] font-sans border-collapse">
                                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9.5px]">
                                    <tr>
                                      <th className="py-2 px-3 w-16 whitespace-nowrap">Cód</th>
                                      <th className="py-2 px-3">Concepto Salarial / Bono</th>
                                      <th className="py-2 px-3">Tipo de Regla</th>
                                      <th className="py-2 px-3 text-right whitespace-nowrap">Devengado (+)</th>
                                      <th className="py-2 px-3 text-right whitespace-nowrap">Deducción (-)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {player.commissionDistribution.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                        <td className="py-2 px-3 font-mono font-bold text-slate-500 whitespace-nowrap">{100 + (idx + 1) * 10}</td>
                                        <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                                        <td className="py-2 px-3 text-slate-600 text-[10px]">Acelerador y Cuota Activa</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">+{formatCOP(item.value)} COP</td>
                                        <td className="py-2 px-3 text-right font-mono text-slate-400 whitespace-nowrap">$0 COP</td>
                                      </tr>
                                    ))}
                                    {player.transparencyData.returnsDeducted > 0 && (
                                      <tr className="hover:bg-rose-50/40">
                                        <td className="py-2 px-3 font-mono font-bold text-rose-600 whitespace-nowrap">401</td>
                                        <td className="py-2 px-3 font-semibold text-rose-900">Deducción Notas Crédito / Devoluciones</td>
                                        <td className="py-2 px-3 text-rose-600 text-[10px]">Ajuste Contable Factura</td>
                                        <td className="py-2 px-3 text-right font-mono text-slate-400 whitespace-nowrap">$0 COP</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap">-{formatCOP(player.transparencyData.returnsDeducted)} COP</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              )}
                            </div>

                            {/* Totals Accounting Box */}
                            <div className="border-t-2 border-b-2 border-slate-900 bg-slate-50 p-3.5 mb-5 font-mono text-xs">
                              <div className="flex justify-between items-center py-0.5">
                                <span className="font-sans font-medium text-slate-600">Total Devengado Bruto de Comisiones:</span>
                                <span className="font-bold text-slate-900">+{formatCOP(player.transparencyData.commissionEarned)} COP</span>
                              </div>
                              {player.transparencyData.returnsDeducted > 0 && (
                                <div className="flex justify-between items-center py-0.5 text-rose-700">
                                  <span className="font-sans font-medium">Menos Deducciones por Devolución / Notas Crédito:</span>
                                  <span className="font-bold">-{formatCOP(player.transparencyData.returnsDeducted)} COP</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-sm pt-2 mt-1 border-t border-slate-300">
                                <span className="font-sans font-black text-slate-950 uppercase tracking-wide text-xs">
                                  VALOR TOTAL NETO A DESEMBOLSAR:
                                </span>
                                <span className="font-black text-emerald-800 text-base md:text-lg border-b-2 border-double border-emerald-800">
                                  {formatCOP(netCommission)} COP
                                </span>
                              </div>
                            </div>

                            {/* Signatures Block */}
                            <div className="pt-4 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-slate-700 font-sans">
                              <div>
                                <div className="border-t border-slate-800 pt-2 font-bold font-mono uppercase text-slate-900">GERENCIA GENERAL</div>
                                <div className="text-[10.5px] text-slate-600">Autorización Electrónica por PIN</div>
                                <div className="text-[9.5px] text-slate-400 mt-0.5">Aprobador Maestro ERP</div>
                              </div>
                              <div>
                                <div className="border-t border-slate-800 pt-2 font-bold font-mono uppercase text-slate-900">DEPARTAMENTO CONTABLE</div>
                                <div className="text-[10.5px] text-slate-600">Revisión Cuentas PUC 510515</div>
                                <div className="text-[9.5px] text-slate-400 mt-0.5">Certificación Fiscal</div>
                              </div>
                              <div>
                                <div className="border-t border-slate-800 pt-2 font-bold font-mono uppercase text-slate-900">
                                  {player.id === 'ALL' ? 'REPRESENTANTE COMERCIAL' : player.name}
                                </div>
                                <div className="text-[10.5px] text-slate-600">Recibí Conforme / Beneficiario</div>
                                <div className="text-[9.5px] text-slate-400 mt-0.5">Firma de Conformidad</div>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-6 pt-3 border-t border-slate-300 text-[10px] text-slate-500 font-mono flex justify-between items-center">
                            <div>PROCOQUINAL S.A.S. — NIT: 900.823.141-8 — Avalon OS ERP Nómina</div>
                            <div>Certificado Digital SHA-256</div>
                            <div className="font-bold text-slate-900">Página 1 de {totalDocPages}</div>
                          </div>
                        </div>
                      );

                      const renderSheetTxPage = (pageIndex: number) => {
                        const pageNum = 2 + pageIndex;
                        const pageTxItems = txList.slice(pageIndex * TX_PER_PAGE, (pageIndex + 1) * TX_PER_PAGE);
                        const isLastTxPage = pageIndex === totalTxPages - 1;

                        return (
                          <div 
                            key={`payroll-sheet-${pageNum}`}
                            className="bg-white text-slate-900 shadow-2xl border border-slate-300 w-full max-w-4xl min-w-[760px] p-8 sm:p-10 font-sans min-h-[980px] flex flex-col justify-between my-3 rounded-xs select-text relative"
                          >
                            <div>
                              {/* Institutional Letterhead Mini */}
                              <div className="border-b-2 border-slate-900 pb-3 mb-4">
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                                      P
                                    </div>
                                    <div>
                                      <span className="font-black text-slate-950 tracking-tight text-sm">PROCOQUINAL S.A.S.</span>
                                      <span className="text-slate-500 text-[10px] ml-2 font-mono">NIT: 900.823.141-8</span>
                                    </div>
                                  </div>
                                  <div className="font-mono text-[10.5px] text-slate-600">
                                    <span>Comprobante: <strong className="text-blue-900">{player.id === 'ALL' ? 'LIQ-CONSOL-2026-10' : `LIQ-${player.id}-2026-10`}</strong></span>
                                    <span className="mx-2">•</span>
                                    <span>Página: <strong className="text-slate-900">{pageNum} de {totalDocPages}</strong></span>
                                  </div>
                                </div>
                                <div className="mt-2 text-center py-1 bg-slate-100 rounded border border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-800">
                                  ANEXO DETALLADO DE TRANSACCIONES & AUDITORÍA DE LIQUIDACIÓN ({pageIndex * TX_PER_PAGE + 1} - {Math.min((pageIndex + 1) * TX_PER_PAGE, txList.length)} de {txList.length})
                                </div>
                              </div>

                              {/* Informative Subheader */}
                              <div className="text-[10.5px] text-slate-600 mb-3 flex justify-between items-center font-sans">
                                <span>Detalle de operaciones auditadas: cliente, fecha, recaudo efectivo bancario y justificación.</span>
                                <span className="font-bold text-slate-800 font-mono">Octubre 2026</span>
                              </div>

                              {/* Transactions Table: Always In-Line, No Squishing */}
                              <div className="overflow-x-auto border border-slate-300 rounded mb-4">
                                <table className="w-full text-left text-[11px] font-sans border-collapse">
                                  <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[9px]">
                                    <tr>
                                      <th className="py-1 px-2 whitespace-nowrap w-24">Doc. / Fecha</th>
                                      <th className="py-1 px-2 w-48">Cliente / Negocio</th>
                                      {player.id === 'ALL' && <th className="py-1 px-2 whitespace-nowrap w-24">Asesor</th>}
                                      <th className="py-1 px-2 whitespace-nowrap text-right w-24">Venta Fact.</th>
                                      <th className="py-1 px-2 whitespace-nowrap text-center w-24">Est. Recaudo</th>
                                      <th className="py-1 px-2 whitespace-nowrap text-right w-24">Comisión</th>
                                      <th className="py-1 px-2 min-w-[180px]">¿Por qué? (Regla & Criterio)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200">
                                    {pageTxItems.map((tx, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-1 px-2 font-mono whitespace-nowrap">
                                          <span className="font-bold text-slate-900">{tx.id}</span>
                                          <span className="text-[9px] text-slate-500 ml-1.5">{tx.date}</span>
                                        </td>
                                        <td className="py-1 px-2 truncate max-w-[200px]">
                                          <span className="font-semibold text-slate-900">{tx.company}</span>
                                          <span className="text-[9px] text-slate-500 ml-1.5 truncate">{tx.title}</span>
                                        </td>
                                        {player.id === 'ALL' && (
                                          <td className="py-1 px-2 whitespace-nowrap">
                                            <span className="font-bold text-blue-900 text-[9.5px]">{tx.advisorName}</span>
                                          </td>
                                        )}
                                        <td className="py-1 px-2 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                                          {formatCOP(tx.value)}
                                        </td>
                                        <td className="py-1 px-2 text-center whitespace-nowrap">
                                          <span className={`inline-block text-[8.5px] font-bold px-1.5 py-0.5 rounded border ${
                                            tx.recaudoStatus === 'RECAUDADO'
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                              : tx.recaudoStatus === 'PENDIENTE'
                                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                                              : tx.recaudoStatus === 'EN_MORA'
                                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                                              : 'bg-purple-50 text-purple-800 border-purple-300'
                                          }`}>
                                            {tx.recaudoLabel}
                                          </span>
                                        </td>
                                        <td className="py-1 px-2 text-right font-mono font-bold whitespace-nowrap">
                                          {tx.comisionValue > 0 ? (
                                            <span className="text-emerald-800">+{formatCOP(tx.comisionValue)}</span>
                                          ) : tx.comisionValue < 0 ? (
                                            <span className="text-rose-700">{formatCOP(tx.comisionValue)}</span>
                                          ) : (
                                            <span className="text-slate-500">$0</span>
                                          )}
                                          {tx.frozenValue ? (
                                            <span className="text-[8.5px] text-amber-700 font-normal ml-1">
                                              (En espera: {formatCOP(tx.frozenValue)})
                                            </span>
                                          ) : null}
                                        </td>
                                        <td className="py-1 px-2 text-[9.5px] leading-none text-slate-700 truncate max-w-[200px]" title={tx.reason}>
                                          {tx.reason}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* If last tx page, show Audit Certification & Summary */}
                              {isLastTxPage && (
                                <div className="mt-4 space-y-4">
                                  <div className="border border-slate-300 bg-slate-50 p-3.5 rounded font-mono text-xs">
                                    <div className="font-sans font-bold text-slate-900 text-[11px] uppercase tracking-wide mb-2 text-center">
                                      CONSOLIDADO TOTAL DEL ANEXO DE TRANSACCIONES AUDITADAS
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                                      <div className="bg-white border border-slate-200 p-2 rounded">
                                        <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Total Operaciones</div>
                                        <div className="font-bold text-slate-900 text-xs mt-0.5">{txList.length}</div>
                                      </div>
                                      <div className="bg-white border border-slate-200 p-2 rounded">
                                        <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Ventas Facturadas</div>
                                        <div className="font-bold text-slate-900 text-xs mt-0.5">{formatCOP(player.currentSales)} COP</div>
                                      </div>
                                      <div className="bg-white border border-slate-200 p-2 rounded">
                                        <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Recaudo Efectivo Banco</div>
                                        <div className="font-bold text-emerald-700 text-xs mt-0.5">{formatCOP(player.transparencyData.totalCollected)} COP</div>
                                      </div>
                                      <div className="bg-white border border-slate-200 p-2 rounded">
                                        <div className="text-[9px] uppercase font-sans font-bold text-slate-500">Comisión Total Anexo</div>
                                        <div className="font-bold text-emerald-800 text-xs mt-0.5">+{formatCOP(player.transparencyData.commissionEarned)} COP</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[10.5px] text-slate-600 italic text-center font-sans">
                                    "Certifico que las operaciones comerciales e importes de comisión aquí detallados han sido auditados contra los libros de venta y extractos de recaudo bancario en Procoquinal S.A.S."
                                  </div>

                                  <div className="pt-3 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-700 font-sans">
                                    <div>
                                      <div className="border-t border-slate-800 pt-1 font-bold font-mono uppercase text-slate-900">AUDITORÍA COMERCIAL & CONTROL INTERNO</div>
                                      <div className="text-[10px] text-slate-500">Verificación de Recaudo Efectivo</div>
                                    </div>
                                    <div>
                                      <div className="border-t border-slate-800 pt-1 font-bold font-mono uppercase text-slate-900">
                                        {player.id === 'ALL' ? 'DIRECCIÓN COMERCIAL' : player.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500">Aprobación Técnica de Liquidación</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-3 border-t border-slate-300 text-[10px] text-slate-500 font-mono flex justify-between items-center">
                              <div>PROCOQUINAL S.A.S. — NIT: 900.823.141-8 — Avalon OS ERP Nómina</div>
                              <div>Anexo de Liquidación Certificada</div>
                              <div className="font-bold text-slate-900">Página {pageNum} de {totalDocPages}</div>
                            </div>
                          </div>
                        );
                      };

                      if (docViewMode === 'TODAS_HOJAS') {
                        return (
                          <>
                            {renderSheetPage1()}
                            {Array.from({ length: totalTxPages }).map((_, idx) => renderSheetTxPage(idx))}
                          </>
                        );
                      }

                      if (docCurrentPage === 1) {
                        return renderSheetPage1();
                      }

                      return renderSheetTxPage(docCurrentPage - 2);
                    })()}
                  </div>
                </>
              );
            })()}

            {/* Bottom PIN Electronic Signature Form */}
            <form onSubmit={handleConfirmPayrollWithAuth} className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    Firma Electrónica por PIN (Administrador)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Ingrese su PIN para autorizar y asentar el comprobante de egreso en Contabilidad.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <input 
                  type="password" 
                  placeholder="PIN • • • •"
                  value={authId}
                  onChange={(e) => setAuthId(e.target.value)}
                  autoFocus
                  maxLength={6}
                  className="w-32 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 outline-none font-mono text-center tracking-[0.3em] text-lg text-amber-400 placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-xs transition-colors shadow-inner"
                />

                <button 
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button 
                  type="submit"
                  disabled={authId.trim().length < 3}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer shadow-emerald-900/30 active:scale-95 whitespace-nowrap"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Validar y Desembolsar
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};
