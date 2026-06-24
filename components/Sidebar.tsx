import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, PackageSearch, BrainCircuit, FlaskConical, LineChart, 
    Settings, ScanBarcode, Calculator, TrendingUp, Zap, ShoppingCart, 
    Wallet, ShieldCheck, BarChart4, ChevronDown, ChevronRight, Boxes,
    PieChart, Landmark, CircleDollarSign, GitCommit, LayoutGrid, Users, Briefcase, X, Database, Medal, Network, Heart, FileSpreadsheet,
    TableProperties, DollarSign, PackageOpen, UserCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, setIsOpen }) => {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // Auto-open groups if active route is inside them
  useEffect(() => {
    const operationPaths = ['/inventory', '/inventory-control', '/production'];
    const planningPaths = ['/forecast', '/purchasing', '/action-center'];
    const financePaths = ['/financial', '/governance', '/intelligence', '/analytics', '/event-log'];
    const salesPaths = ['/crm', '/sales-performance', '/atp', '/pos'];
    const staffPaths = ['/staff/sales-profiles', '/staff/gestion-comercial'];
    const accountingPaths = ['/accounting'];

    setOpenGroups(prev => {
        const newGroups = [...prev];
        if (operationPaths.includes(location.pathname) && !newGroups.includes('Operación')) {
            newGroups.push('Operación');
        }
        if (planningPaths.includes(location.pathname) && !newGroups.includes('Planificación & Optimización')) {
            newGroups.push('Planificación & Optimización');
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
        if (accountingPaths.includes(location.pathname) && !newGroups.includes('Contabilidad & Interfaces')) {
            newGroups.push('Contabilidad & Interfaces');
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

  const navStructure = [
    { type: 'item', to: "/", icon: LayoutDashboard, label: "Tablero Principal" },
    
    // Group: Sales & Revenue
    {
        type: 'group',
        label: "Ventas & Ingresos",
        icon: CircleDollarSign,
        children: [
            { to: "/pos", icon: ShoppingCart, label: "Punto de Venta (B2B)", special: true },
            { to: "/crm", icon: Users, label: "Gestión de Clientes (CRM)" },
            { to: "/crm/hobbies", icon: Heart, label: "Afinidades y Hobbies" },
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

    // Group: Planning & Optimization
    {
        type: 'group',
        label: "Planificación & Optimización",
        icon: TrendingUp,
        children: [
            { to: "/forecast", icon: PieChart, label: "Proyecciones y Planeación" },
            { to: "/action-center", icon: Zap, label: "Centro de Acción / Alertas" },
        ]
    },

    // Group: Finance & Intelligence
    {
        type: 'group',
        label: "Finanzas & Inteligencia",
        icon: Landmark,
        children: [
            { to: "/financial", icon: Wallet, label: "Impacto Financiero" },
            { to: "/intelligence", icon: BrainCircuit, label: "Inteligencia Artificial" },
            { to: "/analytics", icon: LineChart, label: "Analítica Avanzada" },
            { to: "/governance", icon: ShieldCheck, label: "Data Governance" },
            { to: "/event-log", icon: GitCommit, label: "Bitácora de Eventos" },
        ]
    },

    // Group: Accounting & Interfaces
    {
        type: 'group',
        label: "Contabilidad & Interfaces",
        icon: FileSpreadsheet,
        children: [
            { to: "/accounting/sabana", icon: TableProperties, label: "Sábana General" },
            { to: "/accounting/cartera", icon: HandCoins, label: "Estado de Cartera" },
            { to: "/accounting/cierres", icon: Calculator, label: "Cierres de Caja" },
            { to: "/accounting/ventas", icon: DollarSign, label: "Facturación (Ventas)" },
            { to: "/accounting/auditoria", icon: UserCheck, label: "Auditoría Terceros" },
            { to: "/accounting/inventario", icon: PackageOpen, label: "Inventario Valorizado" },
            { to: "/accounting/exportacion", icon: FileSpreadsheet, label: "Exportación SIIGO" },
            { to: "/accounting/importaciones", icon: FileSpreadsheet, label: "Carga de Facturas (EDI)" },
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
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Procoquinal OS</span>
        </div>
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
        {navStructure.map((item, index) => {
            if (item.type === 'group' && item.children) {
                const isOpen = openGroups.includes(item.label);
                const isChildActive = item.children.some(child => child.to === location.pathname);

                return (
                    <div key={index} className="mb-1">
                        <button 
                            onClick={() => toggleGroup(item.label)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                isChildActive ? 'text-white bg-slate-800' : 'hover:bg-slate-800 hover:text-white'
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
                );
            } else {
                // Regular Item
                const isSpecial = (item as any).special;
                return (
                    <NavLink
                        key={item.to}
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
                );
            }
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">        <NavLink
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
        <div className="mt-4 px-4">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Estado del Sistema</div>
             <div className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                ERP Conectado
             </div>
        </div>
      </div>
    </aside>
  );
};