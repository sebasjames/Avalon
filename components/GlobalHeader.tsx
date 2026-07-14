import React, { useState } from 'react';
import {
    Search, Bell, X, Users, ShoppingCart, Calculator, BrainCircuit, Zap, Package,
    LayoutGrid, Heart, Database, FileSpreadsheet, TrendingUp, DollarSign, LineChart,
    Factory, ShieldCheck, PieChart, History, Briefcase, Medal, TableProperties, Settings,
    RefreshCcw, Info
} from 'lucide-react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useEnterprise } from '../context/EnterpriseContext';
import { MOCK_OPPORTUNITIES } from '../constants';

export const GlobalHeader: React.FC = () => {
    const {
        contacts, getActiveNotifications, setGlobalSelectedContactId,
        globalInventorySearch, setGlobalInventorySearch, clearNotifications,
        activeRole, setActiveRole
    } = useEnterprise();
    const navigate = useNavigate();
    const location = useLocation();
    const pendingCount = MOCK_OPPORTUNITIES.filter(o => o.status === 'PENDING').length;

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

    const isInventoryView = location.pathname.includes('/inventory-hub');

    // Sync local searchTerm with globalInventorySearch if we just entered inventory view
    React.useEffect(() => {
        if (isInventoryView) {
            setSearchTerm(globalInventorySearch);
        }
    }, [isInventoryView]);

    const notifications = getActiveNotifications();

    const filteredContacts = contacts.filter(c => {
        if (!searchTerm) return false;
        const q = searchTerm.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            (c.documentNumber && c.documentNumber.includes(q)) ||
            (c.decisionMakers && c.decisionMakers.some(dm => dm.name.toLowerCase().includes(q)))
        );
    }).slice(0, 5);

    const handleSelectResult = (contactId: string) => {
        setSearchTerm('');
        setIsSearchOpen(false);
        setGlobalSelectedContactId(contactId);
        if (location.pathname !== '/crm') {
            navigate('/crm');
        }
    };

    // Helper to get title and icon based on current route
    const getPageInfo = () => {
        const path = location.pathname;
        if (path === '/') return { title: 'Torre de Control Operativo', icon: LayoutGrid };
        if (path === '/crm') return { title: 'CRM Corporativo', icon: Users };
        if (path === '/crm/hobbies') return { title: 'Afinidades y Hobbies', icon: Heart };
        if (path === '/pos') return { title: 'Punto de Venta | B2B', icon: ShoppingCart };
        if (path.includes('/inventory-hub')) return { title: 'Centro de Inventarios', icon: Package };
        if (path === '/inventory-mapper') return { title: 'Flujo de Datos (Ingesta MP)', icon: Database };
        if (path === '/albaranes') return { title: 'Ingesta de Albaranes', icon: FileSpreadsheet };
        if (path === '/sales-performance') return { title: 'Desempeño de Ventas', icon: TrendingUp };
        if (path === '/financial') return { title: 'Impacto Financiero', icon: DollarSign };
        if (path === '/forecast') return { title: 'Planeación de Demanda', icon: LineChart };
        if (path === '/action-center') return { title: 'Centro de Acción', icon: Zap };
        if (path === '/production') return { title: 'Gestión de Producción', icon: Factory };
        if (path === '/atp') return { title: 'ATP & Reparto (Asignación)', icon: Calculator };
        if (path === '/governance') return { title: 'Gobierno de Datos', icon: ShieldCheck };
        if (path === '/intelligence') return { title: 'Centro de Inteligencia', icon: BrainCircuit };
        if (path === '/analytics') return { title: 'Analítica Avanzada', icon: PieChart };
        if (path === '/event-log') return { title: 'Registro de Eventos', icon: History };
        if (path === '/staff/sales-profiles') return { title: 'Perfiles Comerciales', icon: Users };
        if (path === '/staff/gestion-comercial') return { title: 'Gestión Comercial', icon: Briefcase };
        if (path === '/staff/comisiones') return { title: 'Comisiones y Logros', icon: Medal };
        if (path === '/staff/matrix') return { title: 'Matriz de Comisiones', icon: TableProperties };
        if (path === '/config') return { title: 'Panel de Control Maestro', icon: Settings };
        if (path.startsWith('/accounting')) return { title: 'Contabilidad & Interfaces', icon: Calculator };
        if (path === '/returns') return { title: 'Gestión de Devoluciones', icon: RefreshCcw };
        return { title: '', icon: null };
    };

    const { title, icon: Icon } = getPageInfo();

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 hidden md:flex items-center justify-between px-6 py-3">
            {/* Left: Dynamic Title */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {Icon && (
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <h1 className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap hidden lg:block">
                    {title}
                </h1>
                {location.pathname === '/pos' && (
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('open-pos-shortcuts'))}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-500 p-1.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                        title="Ver Atajos de Teclado"
                    >
                        <Info className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-lg mx-8">
                <div className="relative w-full">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={isInventoryView ? "Buscar en inventario (SKU, nombre, familia)..." : "Buscar cliente, NIT, persona clave..."}
                            value={searchTerm}
                            onChange={e => {
                                const val = e.target.value;
                                setSearchTerm(val);
                                if (isInventoryView) {
                                    setGlobalInventorySearch(val);
                                } else {
                                    setIsSearchOpen(true);
                                }
                            }}
                            onFocus={() => { if (!isInventoryView) setIsSearchOpen(true); }}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 ring-indigo-500 outline-none transition-all"
                        />
                        {searchTerm && <button onClick={() => { setSearchTerm(''); if (isInventoryView) setGlobalInventorySearch(''); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>}
                    </div>
                    {isSearchOpen && searchTerm && !isInventoryView && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-2">
                            {filteredContacts.length > 0 ? filteredContacts.map(c => (
                                <button key={c.id} onClick={() => handleSelectResult(c.id)} className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                                    <div className="font-bold text-sm text-slate-900">{c.name}</div>
                                    <div className="text-xs text-slate-500">{c.company} {c.documentNumber ? `• ${c.documentType || 'NIT'}: ${c.documentNumber}` : ''}</div>
                                </button>
                            )) : (
                                <div className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron resultados para "{searchTerm}"</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 flex-shrink-0 justify-end">
                {/* Shortcut Buttons */}
                <div className="flex items-center gap-1.5 mr-2">
                    <NavLink
                        to="/crm"
                        className={({ isActive }) => {
                            const isCrmActive = isActive || location.pathname.startsWith('/crm');
                            return `p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center ${isCrmActive
                                    ? "bg-blue-600 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] translate-y-[1px] scale-[0.95]"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 active:scale-95 active:translate-y-[1px]"
                                }`;
                        }}
                        title="Gestión de Clientes (CRM)"
                    >
                        <Users className="w-5 h-5" />
                    </NavLink>
                    <NavLink
                        to="/inventory-hub"
                        className={({ isActive }) => {
                            const isInvActive = isActive || location.pathname.startsWith('/inventory-hub');
                            return `p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center ${isInvActive
                                    ? "bg-blue-600 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] translate-y-[1px] scale-[0.95]"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 active:scale-95 active:translate-y-[1px]"
                                }`;
                        }}
                        title="Inventario (Inventory Hub)"
                    >
                        <Package className="w-5 h-5" />
                    </NavLink>
                    <NavLink
                        to="/pos"
                        className={({ isActive }) =>
                            `p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center ${isActive
                                ? "bg-blue-600 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] translate-y-[1px] scale-[0.95]"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 active:scale-95 active:translate-y-[1px]"
                            }`
                        }
                        title="Punto de Venta (POS)"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </NavLink>
                    <NavLink
                        to="/accounting/activos_liquidez"
                        className={({ isActive }) => {
                            const isAccActive = isActive || location.pathname.startsWith('/accounting');
                            return `p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center ${isAccActive
                                    ? "bg-blue-600 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] translate-y-[1px] scale-[0.95]"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 active:scale-95 active:translate-y-[1px]"
                                }`;
                        }}
                        title="Contabilidad & Interfaces"
                    >
                        <Calculator className="w-5 h-5" />
                    </NavLink>

                    <div className="h-5 w-[1px] bg-slate-200 mx-2" />

                    <NavLink
                        to="/intelligence"
                        className={({ isActive }) =>
                            `p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center ${isActive
                                ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 animate-gradient-shift text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)] translate-y-[1px] scale-[0.95]"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 active:scale-95 active:translate-y-[1px]"
                            }`
                        }
                        title="Inteligencia Artificial"
                    >
                        <BrainCircuit className="w-5 h-5" />
                    </NavLink>
                    <NavLink
                        to="/action-center"
                        className={({ isActive }) =>
                            `p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center relative ${isActive
                                ? "bg-orange-500 text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] translate-y-[1px] scale-[0.95]"
                                : pendingCount > 0
                                    ? "text-amber-500 fill-amber-500 hover:bg-amber-50/50 hover:text-amber-600 active:scale-95 active:translate-y-[1px]"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 active:scale-95 active:translate-y-[1px]"
                            }`
                        }
                        title="Centro de Acción / Alertas"
                    >
                        <Zap className="w-5 h-5" />
                        {pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full scale-75 origin-top-right border border-white">
                                {pendingCount}
                            </span>
                        )}
                    </NavLink>
                </div>

                <div className="relative">
                    <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
                    </button>
                    {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between font-bold text-sm text-slate-800">
                                <span>Notificaciones ({notifications.length})</span>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearNotifications();
                                        }}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
                                    >
                                        Marcar todo como leído
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} onClick={() => { if (n.relatedContactId) handleSelectResult(n.relatedContactId); setIsNotifOpen(false); }} className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                                        <div className="flex gap-3">
                                            <div className="mt-0.5">
                                                {n.type === 'BIRTHDAY' ? '🎂' : n.type === 'GARBAGE_WARNING' ? '⚠️' : '🔔'}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm text-slate-900">{n.title}</div>
                                                <div className="text-xs text-slate-600 mt-0.5">{n.message}</div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-4 text-center text-sm text-slate-500">No hay notificaciones nuevas.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-slate-200"></div>

                <div className="relative">
                    <button
                        onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                        className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors text-left"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                            {activeRole === 'admin' ? 'A' : activeRole === 'manager' ? 'M' : activeRole === 'Comercial' ? 'C' : activeRole === 'POS' ? 'P' : 'C'}
                        </div>
                        <div className="hidden lg:block">
                            <div className="text-sm font-bold text-slate-900 leading-none capitalize">{activeRole} User</div>
                            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">{activeRole}</div>
                        </div>
                    </button>

                    {isRoleMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                            {['admin', 'manager', 'Comercial', 'Contabilidad', 'POS'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        setActiveRole(role as any);
                                        setIsRoleMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${activeRole === role ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="capitalize">{role}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
