import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useEnterprise } from '../context/EnterpriseContext';
import { 
    LayoutDashboard, PackageSearch, BrainCircuit, FlaskConical, LineChart, 
    Settings, ScanBarcode, Calculator, TrendingUp, Zap, ShoppingCart, 
    Wallet, ShieldCheck, BarChart4, ChevronDown, ChevronRight, Boxes,
    PieChart, Landmark, CircleDollarSign, GitCommit, LayoutGrid, Users, Briefcase, X, Database, Medal, Network, Heart, FileSpreadsheet,
    TableProperties, DollarSign, PackageOpen, UserCheck, HandCoins, RefreshCcw, CreditCard, Mail, ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, setIsOpen }) => {
  const { activeRole } = useEnterprise();
  const location = useLocation();
  const isPos = location.pathname === '/pos';
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
      if (!isPos) {
          setIsCollapsed(false);
      }
  }, [isPos]);

  const financeGroup = {
      label: "Finanzas & Inteligencia",
      children: [
          { to: "/forecast", icon: PieChart, label: "Proyecciones y Planeación" },
          { to: "/action-center", icon: Zap, label: "Centro de Acción / Alertas" },
          { to: "/financial", icon: Wallet, label: "Impacto Financiero" },
          { to: "/intelligence", icon: BrainCircuit, label: "Inteligencia Artificial" },
          { to: "/analytics", icon: LineChart, label: "Analítica Avanzada" },
          { to: "/governance", icon: ShieldCheck, label: "Gobierno de Datos" },
          { to: "/accounting/auditoria", icon: UserCheck, label: "Auditoría Terceros" },
          { to: "/event-log", icon: GitCommit, label: "Bitácora de Eventos" },
      ]
  };

  const isFinanceOpen = openGroups.includes(financeGroup.label);
  const isFinanceChildActive = financeGroup.children.some(child => child.to === location.pathname);

  // Auto-open groups if active route is inside them
  useEffect(() => {
    const operationPaths = ['/inventory', '/inventory-control', '/production'];
    const financePaths = ['/financial', '/governance', '/intelligence', '/analytics', '/event-log', '/forecast', '/action-center', '/accounting/auditoria'];
    const salesPaths = ['/crm', '/sales-performance', '/atp', '/pos'];
    const staffPaths = ['/staff/sales-profiles', '/staff/gestion-comercial'];
    const accountingPaths = ['/accounting', '/returns'];

    setOpenGroups(prev => {
        const newGroups = [...prev];
        if (operationPaths.includes(location.pathname) && !newGroups.includes('Operación')) {
            newGroups.push('Operación');
        }
        if (financePaths.includes(location.pathname) && !newGroups.includes('Finanzas & Inteligencia')) {
            newGroups.push('Finanzas & Inteligencia');
        }
        if (salesPaths.includes(location.pathname) && !newGroups.includes('Ventas & Ingresos')) {
            newGroups.push('Ventas & Ingresos');
        }
        if (staffPaths.includes(location.pathname) && !newGroups.includes('Staff & Talento')) {
            newGroups.push('Staff & Talento');
        }
        if ((accountingPaths.includes(location.pathname) || location.pathname.startsWith('/accounting')) && !newGroups.includes('Contabilidad')) {
            newGroups.push('Contabilidad');
        }
        return newGroups;
    });
  }, [location.pathname]);

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups(prev => 
        prev.includes(groupLabel) 
        ? prev.filter(g => g !== groupLabel) 
        : [...prev, groupLabel]
    );
  };

  const navStructure: any[] = [
    // Group: Sales & Revenue
    {
        type: 'group',
        label: "Ventas & Ingresos",
        icon: CircleDollarSign,
        children: [
            { to: "/pos", icon: ShoppingCart, label: "Punto de Venta (B2B)", special: true },
            { to: "/crm", icon: Users, label: "Gestión de Clientes (CRM)" },
            { to: "/sales-performance", icon: BarChart4, label: "Desempeño de Ventas" },
            { to: "/atp", icon: Calculator, label: "Disponibilidad ATP" },
        ]
    },
    
    // Group: Operation
    {
        type: 'group',
        label: "Operación",
        icon: Boxes,
        children: [
            { to: "/inventory-hub", icon: PackageSearch, label: "Centro de Inventarios" },
            { to: "/production", icon: FlaskConical, label: "Producción y Lotes" },
            { to: "/albaranes", icon: ScanBarcode, label: "Ingesta de Albaranes" },
            { to: "/inventory-mapper", icon: Database, label: "Asistente de Ingesta (ETL)" },
        ]
    },





    // Group: Accounting & Interfaces
    {
        type: 'group',
        label: "Contabilidad",
        icon: FileSpreadsheet,
        children: [
            { to: "/accounting/sabana", icon: TableProperties, label: "Sábana General" },
            { to: "/accounting/activos_liquidez", icon: Landmark, label: "Activos & Liquidez" },
            { to: "/accounting/cierres", icon: Calculator, label: "Cierres de Caja" },
            { to: "/accounting/ventas", icon: DollarSign, label: "Facturación (Ventas)" },
            { to: "/returns", icon: RefreshCcw, label: "Devoluciones" },
            { to: "/accounting/exportacion", icon: FileSpreadsheet, label: "Exportación SIIGO" },
            { to: "/accounting/importaciones", icon: FileSpreadsheet, label: "Carga de Facturas (EDI)" },
            { to: "/accounting/facturas_correo", icon: Mail, label: "Facturas por Correo" },
            { to: "/accounting/conciliacion_datafono", icon: CreditCard, label: "Conciliación Datáfonos" },
            { to: "/accounting/caja_menor", icon: Wallet, label: "Caja Menor" },
        ]
    },

    // Group: Staff
    {
        type: 'group',
        label: "Staff & Talento",
        icon: Users,
        children: [
            { to: "/staff/sales-profiles", icon: Briefcase, label: "Equipo" },
            { to: "/staff/gestion-comercial", icon: Briefcase, label: "Gestión Comercial" },
            { to: "/staff/comisiones", icon: Medal, label: "Comisiones y Logros" },
            { to: "/staff/matrix", icon: Network, label: "Matrix Comisiones" },
        ]
    },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 h-screen transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 ${isCollapsed ? 'md:w-0' : 'md:w-64'} w-64`}>
      <div className={`w-64 h-full flex flex-col transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white hover:opacity-85 transition-opacity">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Procoquinal OS</span>
        </Link>
        {setIsOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navStructure.map(group => {
            if (activeRole === 'admin' || activeRole === 'manager') return group;
            if (activeRole === 'Contabilidad') {
                if (group.label === 'Contabilidad') return group;
                if (group.label === 'Operación') {
                    return {
                        ...group,
                        children: group.children.filter((c: any) => c.to === '/inventory-hub')
                    };
                }
                return null;
            }
            if (activeRole === 'Comercial') {
                if (group.label === 'Ventas & Ingresos') return group;
                if (group.label === 'Staff & Talento') return group;
                return null;
            }
            if (activeRole === 'POS') {
                if (group.label === 'Ventas & Ingresos') {
                    return {
                        ...group,
                        children: group.children.filter((c: any) => c.to === '/pos' || c.to === '/crm')
                    };
                }
                if (group.label === 'Operación') {
                    return {
                        ...group,
                        children: group.children.filter((c: any) => c.to === '/inventory-hub' || c.to === '/production')
                    };
                }
                return null;
            }
            return null;
        }).filter(Boolean).map((item: any, index) => {
            if (item.type === 'group' && item.children) {
                const isOpen = openGroups.includes(item.label);
                const isChildActive = item.children.some(child => child.to === location.pathname);

                return (
                    <React.Fragment key={index}>
                        <div className="mb-1">
                            <button 
                                onClick={() => toggleGroup(item.label)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    isChildActive ? 'text-white bg-slate-700' : 'hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center">
                                    {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                                    {item.label}
                                </div>
                                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            
                            {isOpen && (
                                <div className="mt-1 space-y-1 pl-4 relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800"></div>
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.to}
                                            to={child.to}
                                            onClick={() => setIsOpen && setIsOpen(false)}
                                            className={({ isActive }) =>
                                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all relative z-10 ${
                                                isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                            }`
                                            }
                                        >
                                            <child.icon className="w-4 h-4 mr-3" />
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                        {item.label === 'Operación' && (
                            <div className="my-2 border-t border-slate-800/80 mx-2" />
                        )}
                    </React.Fragment>
                );
            } else {
                // Regular Item
                const isSpecial = (item as any).special;
                return (
                    <React.Fragment key={item.to}>
                        <NavLink
                            to={item.to!}
                            onClick={() => setIsOpen && setIsOpen(false)}
                            className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                                isActive
                                ? isSpecial 
                                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30" 
                                    : "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                : isSpecial
                                    ? "text-indigo-300 hover:text-white hover:bg-indigo-900/30 border border-indigo-500/30 my-2"
                                    : "hover:bg-slate-800 hover:text-white"
                            }`
                            }
                        >
                            {item.icon && <item.icon className={`w-5 h-5 mr-3 ${isSpecial ? 'animate-pulse' : ''}`} />}
                            {item.label}
                        </NavLink>
                        {item.to === "/" && (
                            <div className="my-2 border-t border-slate-800/80 mx-2" />
                        )}
                    </React.Fragment>
                );
            }
        })}
      </nav>

      <div className="p-4 relative space-y-2">
        <style>{`
          @keyframes lineShine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-line-shine {
            background: linear-gradient(90deg, transparent 20%, #3b82f6 50%, transparent 80%);
            background-size: 200% 100%;
            animation: lineShine 3.5s infinite linear;
          }
          @keyframes rotateBorder {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .border-beam-active {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
          }
          .border-beam-active::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(from 0deg, transparent 25%, #3b82f6 50%, transparent 75%);
            animation: rotateBorder 5s infinite linear;
            z-index: 0;
            pointer-events: none;
          }
          .border-beam-inner {
            position: relative;
            z-index: 10;
            background-color: rgba(15, 23, 42, 0.95);
            border-radius: 9px;
          }
        `}</style>

        {(activeRole === 'admin' || activeRole === 'manager') && (
            <>
        {/* Group: Finance & Intelligence (Bottom Pinned) */}
        <div className={`mb-2 transition-all duration-300 ${
            isFinanceChildActive || isFinanceOpen
                ? 'border-beam-active p-[3px]' 
                : 'p-[3px]'
        }`}>
            <div className={`p-1.5 transition-all duration-300 ${
                isFinanceChildActive || isFinanceOpen
                    ? 'border-beam-inner shadow-inner bg-slate-950/40 border border-slate-800/40' 
                    : ''
            }`}>
                <button 
                    onClick={() => toggleGroup(financeGroup.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isFinanceChildActive ? 'text-white bg-slate-800 font-bold' : 'hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <div className="flex items-center">
                        <Landmark className="w-5 h-5 mr-3 text-slate-400" />
                        Finanzas & Inteligencia
                    </div>
                    {isFinanceOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                
                {isFinanceOpen && (
                    <div className="mt-1 space-y-1 pl-4 relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800"></div>
                        {financeGroup.children.map((child) => (
                            <NavLink
                                key={child.to}
                                to={child.to}
                                onClick={() => setIsOpen && setIsOpen(false)}
                                className={({ isActive }) =>
                                `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all relative z-10 ${
                                    isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                }`
                                }
                            >
                                <child.icon className="w-4 h-4 mr-3" />
                                {child.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <NavLink
            to="/config"
            onClick={() => setIsOpen && setIsOpen(false)}
            className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
            }
        >
            <Settings className="w-5 h-5 mr-3" />
            Configuración
        </NavLink>
        </>
        )}
        <div className="mt-4 px-4">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Estado del Sistema</div>
             <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                ERP Conectado
             </div>
        </div>
      </div>
      </div>

      {isPos && (
        <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute bottom-6 z-50 p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 shadow-lg hover:bg-slate-700 hover:text-white transition-all duration-300 ${
                isCollapsed ? 'left-4' : '-right-4'
            }`}
            title={isCollapsed ? "Expandir panel" : "Cerrar panel"}
        >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      )}
    </aside>
  );
};