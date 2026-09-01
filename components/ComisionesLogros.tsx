import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnterprise } from '../context/EnterpriseContext';
import { useUIStore } from '../stores/uiStore';
import { 
  Trophy, Flame, Target, DollarSign, Star, TrendingUp, AlertCircle, 
  CheckCircle2, Lock, Unlock, ChevronRight, Gift, Medal, ChevronDown, Check, Users,
  ShieldAlert, KeyRound, X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// --- MOCK DATA FOR AGENTS ---
const agentsData = [
  {
    id: 1,
    name: "Ana Silva (Escenario Ideal & Split)",
    rank: "Vendedor Diamante",
    xp: 8500,
    nextRankXp: 10000,
    avatar: "AS",
    level: 42,
    quota: 100000000,
    currentSales: 115000000,
    commissionDistribution: [
      { name: 'Comisión Base (1%)', value: 1150000, color: '#10b981' },
      { name: 'Comisión Compartida (Split 50%)', value: 450000, color: '#3b82f6' },
      { name: 'Micropagos (CRM Completo)', value: 150000, color: '#8b5cf6' },
    ],
    transparencyData: {
      totalBilled: 160000000,
      totalCollected: 120000000,
      pendingCollection: 40000000,
      commissionEarned: 1750000,
      commissionFrozen: 400000, // Por recaudos pendientes
    },
    trophies: [
      { id: 1, title: 'Cazador B2B', desc: 'Cierra 3 tratos corporativos en un mes.', reward: '+$100,000', unlocked: true, icon: Target, color: 'text-amber-500', bg: 'bg-amber-100' },
      { id: 2, title: 'Trabajo en Equipo', desc: 'Cierra trato compartido.', reward: '+$50,000', unlocked: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
    ]
  },
  {
    id: 2,
    name: "Carlos Ruiz (Mora & Notas Crédito)",
    rank: "Vendedor Plata",
    xp: 3200,
    nextRankXp: 5000,
    avatar: "CR",
    level: 18,
    quota: 80000000,
    currentSales: 95000000,
    commissionDistribution: [
      { name: 'Comisión Base (1%)', value: 950000, color: '#10b981' },
      { name: 'Penalidad por Mora (-0.5%)', value: -120000, color: '#ef4444' },
      { name: 'Deducción Notas Crédito', value: -300000, color: '#f97316' },
    ],
    transparencyData: {
      totalBilled: 95000000,
      totalCollected: 70000000,
      pendingCollection: 25000000,
      commissionEarned: 530000,
      commissionFrozen: 250000,
      returnsDeducted: 300000,
    },
    trophies: [
      { id: 4, title: 'Salvavidas', desc: 'Reactiva 2 clientes inactivos (>6 meses).', reward: '+$200,000', unlocked: true, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-100' },
    ]
  },
  {
    id: 3,
    name: "Laura Gómez (Whale & Apertura)",
    rank: "Vendedor Oro",
    xp: 6800,
    nextRankXp: 10000,
    avatar: "LG",
    level: 35,
    quota: 120000000,
    currentSales: 350000000,
    commissionDistribution: [
      { name: 'Comisión Base (1%)', value: 1200000, color: '#10b981' },
      { name: 'Whale Limit (Tope Dirección)', value: 0, color: '#94a3b8' },
      { name: 'Bono Apertura (Cliente Nuevo)', value: 800000, color: '#06b6d4' },
    ],
    transparencyData: {
      totalBilled: 350000000,
      totalCollected: 350000000,
      pendingCollection: 0,
      commissionEarned: 2000000,
      commissionFrozen: 0,
    },
    trophies: [
      { id: 1, title: 'Cazador de Ballenas', desc: 'Trae un negocio >200M.', reward: 'VIP', unlocked: true, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100' },
    ]
  }
];

export const ComisionesLogros: React.FC = () => {
  const { transactions, contacts, activities, addTransaction } = useEnterprise();
  const { addToast } = useUIStore();
  const [selectedAgentId, setSelectedAgentId] = useState<number>(1);
  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  
  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authId, setAuthId] = useState('');

  const player = useMemo(() => {
      const baseAgent = agentsData.find(a => a.id === selectedAgentId) || agentsData[0];
      return baseAgent;
  }, [selectedAgentId]);

  const netCommission = useMemo(() => {
      return Math.max(0, player.transparencyData.commissionEarned - (player.transparencyData.returnsDeducted || 0));
  }, [player]);

  const handleOpenAuthModal = () => {
      if (netCommission <= 0) {
          addToast({ title: 'Saldo Insuficiente', message: 'No hay saldo positivo de comisiones para liquidar.', severity: 'WARNING' });
          return;
      }
      setAuthId('');
      setShowAuthModal(true);
  };

  const handleConfirmPayrollWithAuth = (e: React.FormEvent) => {
      e.preventDefault();
      if (authId.trim().length < 3) {
          addToast({ title: 'ID Requerido', message: 'Por favor ingrese una firma de ID / PIN válida de al menos 3 dígitos.', severity: 'WARNING' });
          return;
      }

      addTransaction({
          id: `NOM-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'COMPRA',
          client: player.name,
          document: `Nómina Comisiones - ${player.name} (PIN: ${authId})`,
          productName: `Pago de Comisiones Comerciales (${player.rank}) - Autorizado por ID: ${authId}`,
          sku: 'N/A',
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
          title: 'Nómina Aprobada',
          message: `Comisiones de ${player.name} por $${netCommission.toLocaleString('es-CO')} COP autorizadas con ID ${authId} y enviadas a Contabilidad / SIIGO.`,
          severity: 'SUCCESS'
      });
  };
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setIsAgentMenuOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fire Meter calculation
  const progressPercent = Math.min((player.currentSales / player.quota) * 100, 150); // Cap at 150% visually
  
  // Color logic for meter: Red (<50%), Orange (50-99%), Green (>=100%)
  const getMeterColor = (val: number) => {
      if (val >= 100) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'; // Green + Glow
      if (val >= 50) return 'bg-amber-500'; // Orange
      return 'bg-rose-500'; // Red
  };

  const unlockedCount = player.trophies.filter(t => t.unlocked).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans pb-24 overflow-x-hidden">
        {/* Header Title & Agent Switcher */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-amber-400" />
                    Centro de Logros & Comisiones
                </h1>
                <p className="text-slate-400 mt-1">Progreso, multiplicadores y recompensas en tiempo real.</p>
            </div>

            {/* Agent Switcher Dropdown */}
            <div className="relative z-30">
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsAgentMenuOpen(!isAgentMenuOpen); }}
                    className="flex items-center gap-3 bg-slate-800 border border-slate-700 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors shadow-lg"
                >
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                        {player.avatar}
                    </div>
                    <span className="font-medium text-sm">Viendo a: {player.name}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isAgentMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAgentMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">Seleccionar Agente</div>
                        {agentsData.map(agent => (
                            <button 
                                key={agent.id}
                                onClick={() => { setSelectedAgentId(agent.id); setIsAgentMenuOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${selectedAgentId === agent.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                        {agent.avatar}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{agent.name}</span>
                                        <span className="text-xs text-slate-500">{agent.rank}</span>
                                    </div>
                                </div>
                                {selectedAgentId === agent.id && <Check className="w-4 h-4 text-indigo-400" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Player Card & Torta */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Player Card */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative overflow-hidden transition-all duration-300">
                    {/* Holographic background effect for Diamond/Gold rank */}
                    {(player.rank.includes('Diamante') || player.rank.includes('Oro')) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"></div>
                    )}
                    
                    <div className="flex items-center gap-4 relative z-10 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30">
                            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-bold text-white">
                                {player.avatar}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{player.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Medal className={`w-4 h-4 ${player.rank.includes('Diamante') ? 'text-blue-400' : player.rank.includes('Oro') ? 'text-amber-400' : 'text-slate-400'}`} />
                                <span className={`text-sm font-medium ${player.rank.includes('Diamante') ? 'text-blue-400' : player.rank.includes('Oro') ? 'text-amber-400' : 'text-slate-400'}`}>{player.rank}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Nivel {player.level}</span>
                            <span className="text-slate-300 font-mono">{player.xp} / {player.nextRankXp} XP</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                                style={{ width: `${(player.xp / player.nextRankXp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* 2. La Torta (Commission Distribution) */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Composición de Comisiones</h3>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={player.commissionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {player.commissionDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value: number) => [`$${value}`, '']}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white">
                                ${player.commissionDistribution.reduce((a, b) => a + b.value, 0).toLocaleString('es-CO')} COP
                            </span>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                        {player.commissionDistribution.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-slate-300">{item.name}</span>
                                </div>
                                <span className="font-mono font-medium text-white">${item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Meter, Transparency & Trophies */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* 3. Medidor de Fuego (Multiplicador) */}
                <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Termómetro de Ventas
                                {progressPercent >= 100 && <Flame className="w-5 h-5 text-amber-500 animate-pulse" />}
                            </h3>
                            <p className="text-sm text-slate-400">Escalones de comisión basados en el cumplimiento de cuota.</p>
                        </div>
                        <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-700 flex flex-col items-end">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Multiplicador Actual</span>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                {progressPercent >= 100 ? '2.5x' : progressPercent >= 50 ? '1.5x' : '1.0x'}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative pt-8 pb-4">
                        {/* Markers */}
                        <div className="absolute top-0 left-0 w-full flex justify-between text-xs font-bold text-slate-500 px-2">
                            <span>$0</span>
                            <span className="absolute left-[50%] -translate-x-1/2">Meta 1 (50%)</span>
                            <span className="absolute left-[100%] -translate-x-full text-amber-500">Meta Final (100%)</span>
                        </div>
                        
                        {/* The Track */}
                        <div className="w-full h-8 bg-slate-900 rounded-full p-1 border border-slate-700 relative overflow-hidden">
                            {/* The Fill */}
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 ${getMeterColor(progressPercent)}`}
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            >
                                {progressPercent >= 100 && <span className="text-white text-xs font-bold">¡META SUPERADA!</span>}
                            </div>
                        </div>

                        {/* Current Value Tooltip/Marker floating above */}
                        <div 
                            className="absolute top-10 -mt-2 transition-all duration-1000 ease-out flex flex-col items-center"
                            style={{ left: `calc(${Math.min(progressPercent, 100)}% - 24px)` }}
                        >
                            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-transparent border-b-white mb-1"></div>
                            <div className="bg-white text-slate-900 text-xs font-black px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                ${(player.currentSales / 1000000).toFixed(1)} Millones
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 4. Bono de Transparencia (40/60) */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <DollarSign className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="font-bold text-white">Estado del Recaudo (Transparencia)</h3>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center space-y-4">
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-emerald-500/20">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-400">Comisión Disponible (Cobrada)</span>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-400">${player.transparencyData.commissionEarned.toLocaleString('es-CO')} COP</div>
                                <div className="text-xs text-slate-500 mt-1">Basado en ${player.transparencyData.totalCollected.toLocaleString('es-CO')} COP de recaudo real.</div>
                            </div>

                            {player.transparencyData.returnsDeducted > 0 && (
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-rose-600/30">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-rose-300 font-bold">Deducción por Devoluciones (Notas Crédito)</span>
                                        <AlertCircle className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <div className="text-xl font-bold text-rose-500">-${player.transparencyData.returnsDeducted.toLocaleString('es-CO')} COP</div>
                                    <div className="text-xs text-slate-400 mt-1">Reverso automático de comisión por devoluciones de clientes en este periodo.</div>
                                </div>
                            )}
                            
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-500/20 relative overflow-hidden group cursor-pointer hover:border-slate-500/50 transition-colors">
                                <div className="flex justify-between items-center mb-1 relative z-10">
                                    <span className="text-sm text-slate-400">Comisión Congelada (En Limbo)</span>
                                    <Lock className="w-4 h-4 text-slate-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-400 relative z-10">${player.transparencyData.commissionFrozen.toLocaleString('es-CO')} COP</div>
                                <div className="text-xs text-slate-500 mt-1 relative z-10">Facturas pendientes: ${player.transparencyData.pendingCollection.toLocaleString('es-CO')} COP</div>
                                
                                {/* Hover Action */}
                                <div className="absolute inset-0 bg-slate-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[1px]">
                                    <span className="text-slate-300 text-sm font-bold flex items-center gap-1">
                                        Ver Facturas Pendientes <ChevronRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={handleOpenAuthModal}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Aprobar y Pagar Nómina de Comisiones
                            </button>
                        </div>
                    </div>

                    {/* 5. Sala de Trofeos (Retos) */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Gift className="w-5 h-5 text-amber-400" />
                                </div>
                                <h3 className="font-bold text-white">Retos y Recompensas</h3>
                            </div>
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full font-medium">{unlockedCount} Completados</span>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {player.trophies.map(trophy => (
                                <div 
                                    key={trophy.id} 
                                    className={`p-3 rounded-xl border flex gap-3 ${
                                        trophy.unlocked 
                                        ? 'bg-slate-700/50 border-slate-600' 
                                        : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${trophy.bg}`}>
                                        <trophy.icon className={`w-5 h-5 ${trophy.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-bold truncate ${trophy.unlocked ? 'text-white' : 'text-slate-400'}`}>
                                                {trophy.title}
                                            </h4>
                                            {trophy.unlocked ? (
                                                <Unlock className="w-3 h-3 text-emerald-400 shrink-0 ml-2" />
                                            ) : (
                                                <Lock className="w-3 h-3 text-slate-600 shrink-0 ml-2" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{trophy.desc}</p>
                                        <div className={`text-xs font-bold mt-1.5 ${trophy.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
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

        {showAuthModal && (
            <AnimatePresence>
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Autorización de Nómina</h3>
                                        <p className="text-xs text-slate-400">Verificación de firma electrónica por ID</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Vendedor:</span>
                                    <span className="font-bold text-white">{player.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Rango / Categoría:</span>
                                    <span className="font-bold text-amber-400">{player.rank}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
                                    <span className="text-slate-400">Monto Neto a Desembolsar:</span>
                                    <span className="font-black text-emerald-400 text-base">${netCommission.toLocaleString('es-CO')} COP</span>
                                </div>
                            </div>

                            <form onSubmit={handleConfirmPayrollWithAuth} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Firma de Autorización (ID / PIN Administrador)</label>
                                    <input 
                                        type="password" 
                                        placeholder="Ingrese su PIN de usuario..."
                                        value={authId}
                                        onChange={(e) => setAuthId(e.target.value)}
                                        autoFocus
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-amber-500 font-mono text-center tracking-widest text-lg text-amber-400 placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setShowAuthModal(false)}
                                        className="px-4 py-2.5 text-sm font-bold text-slate-400 hover:text-white rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={authId.trim().length < 3}
                                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                        Confirmar y Pagar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        )}
    </div>
  );
};
