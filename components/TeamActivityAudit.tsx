import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEnterprise } from '../context/EnterpriseContext';
import { formatCOP } from '../utils/format';
import { 
    Search, Filter, Calendar, Users, DollarSign, 
    FileText, CheckCircle2, Phone, Briefcase, Download, 
    ArrowUpRight, Clock, Eye, X, ChevronDown, RefreshCw, 
    Receipt, Tag, AlertCircle, Sparkles, Building2, UserCheck,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AuditItem {
    id: string;
    date: string;
    timestamp: number;
    type: 'VENTA' | 'COTIZACION' | 'TRATO_CRM' | 'LLAMADA' | 'REUNION' | 'TAREA' | 'NUEVO_CLIENTE';
    agentId: string;
    agentName: string;
    clientName: string;
    description: string;
    value: number;
    status: string;
    badgeColor: string;
    metadata?: Record<string, any>;
}

export const TeamActivityAudit: React.FC<{ initialAgentId?: string | null }> = ({ initialAgentId = null }) => {
    const [searchParams] = useSearchParams();
    const urlAgentId = searchParams.get('agentId');
    const { 
        systemUsers, 
        deals, 
        transactions, 
        activities, 
        contacts 
    } = useEnterprise();

    // Filters state
    const [search, setSearch] = useState('');
    const [selectedAgent, setSelectedAgent] = useState<string>(initialAgentId || urlAgentId || 'ALL');
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [dateRange, setDateRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [detailItem, setDetailItem] = useState<AuditItem | null>(null);

    // List of commercial team users for the dropdown
    const commercialUsers = useMemo(() => {
        return systemUsers.filter(u => u.baseRole === 'Comercial' || u.baseRole === 'manager' || u.baseRole === 'admin');
    }, [systemUsers]);

    // Fast O(1) Lookups for users and contacts
    const usersMapById = useMemo(() => new Map((systemUsers || []).map(u => [u.id, u])), [systemUsers]);
    const usersMapByName = useMemo(() => new Map((systemUsers || []).map(u => [u.name.toLowerCase(), u])), [systemUsers]);
    const contactsMapById = useMemo(() => new Map((contacts || []).map(c => [c.id, c])), [contacts]);

    // Build unified chronological activity feed
    const allActivities = useMemo<AuditItem[]>(() => {
        const feed: AuditItem[] = [];

        // 1. Transactions / Sales & Quotes from Accounting / POS
        (transactions || []).forEach((t, idx) => {
            const isQuote = (t.document || '').toLowerCase().includes('cotización');
            const parsedDate = t.date ? new Date(t.date).getTime() : Date.now();
            const agentName = (t as any).user || t.posLocation || 'Equipo Ventas';
            const matchedUser = usersMapByName.get(agentName.toLowerCase());

            feed.push({
                id: t.id || `TX-${idx}`,
                date: t.date || new Date().toISOString().split('T')[0],
                timestamp: isNaN(parsedDate) ? Date.now() : parsedDate,
                type: isQuote ? 'COTIZACION' : 'VENTA',
                agentId: matchedUser?.id || 'pos',
                agentName: agentName,
                clientName: t.client || 'Cliente Mostrador',
                description: `${t.document || (isQuote ? 'Cotización Comercial' : 'Factura POS')} - ${t.productName || 'Productos varios'}`,
                value: t.total || 0,
                status: isQuote ? 'Emitida (15 días)' : (t.siigoExportStatus || 'Facturada'),
                badgeColor: isQuote ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                metadata: {
                    sku: t.sku,
                    qty: t.qty,
                    iva: t.iva,
                    paymentMethod: t.paymentMethod,
                    posLocation: t.posLocation
                }
            });
        });

        // 2. CRM Deals
        (deals || []).forEach((d, idx) => {
            const owner = usersMapById.get(d.ownerId);
            const client = contactsMapById.get(d.contactId);
            const created = d.createdAt ? new Date(d.createdAt).getTime() : Date.now();

            let stageLabel = d.stage || d.stageId || 'En Gestión';
            if (stageLabel === 'CLOSED_WON') stageLabel = 'Cerrado Ganado';
            else if (stageLabel === 'CLOSED_LOST') stageLabel = 'Perdido';
            else if (stageLabel === 'NUEVO_LEAD') stageLabel = 'Nuevo Lead';
            else if (stageLabel === 'PROPOSAL') stageLabel = 'Propuesta Enviada';

            feed.push({
                id: d.id || `DEAL-${idx}`,
                date: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                timestamp: isNaN(created) ? Date.now() : created,
                type: 'TRATO_CRM',
                agentId: d.ownerId || 'unassigned',
                agentName: owner?.name || 'Asesor Comercial',
                clientName: client?.name || client?.company || d.title,
                description: `Negocio CRM: ${d.title}`,
                value: d.value || 0,
                status: stageLabel,
                badgeColor: stageLabel === 'Cerrado Ganado' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : stageLabel === 'Perdido' 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200',
                metadata: {
                    probability: d.probability,
                    source: d.source,
                    expectedCloseDate: d.expectedCloseDate,
                    splits: d.splits
                }
            });
        });

        // 3. CRM Activities (Calls, Meetings, Tasks)
        (activities || []).forEach((a, idx) => {
            const owner = usersMapById.get(a.ownerId);
            const client = contactsMapById.get(a.contactId);
            const actDate = a.date ? new Date(a.date).getTime() : Date.now();
            const actType = a.type === 'CALL' ? 'LLAMADA' : a.type === 'MEETING' ? 'REUNION' : 'TAREA';

            feed.push({
                id: a.id || `ACT-${idx}`,
                date: a.date ? new Date(a.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                timestamp: isNaN(actDate) ? Date.now() : actDate,
                type: actType,
                agentId: a.ownerId || 'unassigned',
                agentName: owner?.name || 'Asesor Comercial',
                clientName: client?.name || client?.company || 'Cliente Registrado',
                description: a.title + (a.description ? ` - ${a.description}` : ''),
                value: a.expenseAmount || 0,
                status: a.status === 'COMPLETED' ? 'Completada' : 'Pendiente',
                badgeColor: actType === 'LLAMADA' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : actType === 'REUNION' 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-slate-100 text-slate-700 border-slate-200',
                metadata: {
                    type: a.type,
                    description: a.description,
                    nextAction: a.nextAction,
                    nextActionDate: a.nextActionDate
                }
            });
        });

        // 4. New Clients / Accounts Created
        (contacts || []).forEach((c, idx) => {
            const owner = usersMapById.get(c.ownerId);
            const clientCreated = (c as any).createdAt || c.lastContactDate || new Date(Date.now() - (idx * 86400000)).toISOString().split('T')[0];
            const parsedCreated = new Date(clientCreated).getTime();
            const timestamp = isNaN(parsedCreated) ? Date.now() - (idx * 86400000) : parsedCreated;

            feed.push({
                id: c.id || `CLI-${idx}`,
                date: clientCreated.includes('T') ? clientCreated.split('T')[0] : clientCreated,
                timestamp,
                type: 'NUEVO_CLIENTE',
                agentId: c.ownerId || 'unassigned',
                agentName: owner?.name || 'Registro Comercial',
                clientName: `${c.name} (${c.company})`,
                description: `Vinculación de cliente nuevo en ${c.city || 'Bogotá'} - ${c.documentType || 'NIT'} ${c.documentNumber || 'S/N'}`,
                value: 0,
                status: c.status || 'VINCULADO',
                badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
                metadata: {
                    email: c.email,
                    phone: c.phone || c.whatsapp,
                    tier: c.tier,
                    city: c.city
                }
            });
        });

        // Sort chronological descending (most recent first)
        return feed.sort((a, b) => b.timestamp - a.timestamp);
    }, [transactions, deals, activities, contacts, systemUsers, usersMapById, usersMapByName, contactsMapById]);

    // Apply Filters
    const filteredFeed = useMemo(() => {
        const now = Date.now();
        const oneDay = 86400000;
        const oneWeek = oneDay * 7;
        const oneMonth = oneDay * 30;

        return allActivities.filter(item => {
            // Search text
            if (search.trim()) {
                const term = search.toLowerCase();
                const matches = 
                    item.clientName.toLowerCase().includes(term) ||
                    item.agentName.toLowerCase().includes(term) ||
                    item.description.toLowerCase().includes(term) ||
                    item.id.toLowerCase().includes(term) ||
                    item.status.toLowerCase().includes(term);
                if (!matches) return false;
            }

            // Agent filter
            if (selectedAgent !== 'ALL' && item.agentId !== selectedAgent) {
                return false;
            }

            // Type filter
            if (selectedType !== 'ALL' && item.type !== selectedType) {
                return false;
            }

            // Status filter
            if (selectedStatus !== 'ALL') {
                if (selectedStatus === 'COMPLETED' && !item.status.toLowerCase().includes('completad') && !item.status.toLowerCase().includes('ganad') && !item.status.toLowerCase().includes('facturad')) {
                    return false;
                }
                if (selectedStatus === 'PENDING' && !item.status.toLowerCase().includes('pendient') && !item.status.toLowerCase().includes('emitid') && !item.status.toLowerCase().includes('lead')) {
                    return false;
                }
            }

            // Date Range
            if (dateRange === 'TODAY' && (now - item.timestamp) > oneDay) {
                return false;
            }
            if (dateRange === 'WEEK' && (now - item.timestamp) > oneWeek) {
                return false;
            }
            if (dateRange === 'MONTH' && (now - item.timestamp) > oneMonth) {
                return false;
            }

            return true;
        });
    }, [allActivities, search, selectedAgent, selectedType, dateRange, selectedStatus]);

    // Computed Summary KPIs from filtered view in a single fast loop
    const metrics = useMemo(() => {
        let totalSales = 0;
        let totalQuotes = 0;
        let ordersCount = 0;
        let quotesCount = 0;
        let crmActivitiesCount = 0;
        let newClientsCount = 0;

        for (let i = 0; i < filteredFeed.length; i++) {
            const item = filteredFeed[i];
            if (item.type === 'VENTA') {
                totalSales += item.value;
                ordersCount++;
            } else if (item.type === 'TRATO_CRM' && item.status === 'Cerrado Ganado') {
                totalSales += item.value;
            } else if (item.type === 'COTIZACION') {
                totalQuotes += item.value;
                quotesCount++;
            } else if (item.type === 'LLAMADA' || item.type === 'REUNION' || item.type === 'TAREA') {
                crmActivitiesCount++;
            } else if (item.type === 'NUEVO_CLIENTE') {
                newClientsCount++;
            }
        }

        return {
            totalSales,
            totalQuotes,
            ordersCount,
            quotesCount,
            crmActivitiesCount,
            newClientsCount
        };
    }, [filteredFeed]);

    // Client-side Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Reset page to 1 when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedAgent, selectedType, dateRange, selectedStatus]);

    const totalPages = Math.max(1, Math.ceil(filteredFeed.length / pageSize));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredFeed.slice(start, start + pageSize);
    }, [filteredFeed, currentPage, pageSize]);

    // Export to CSV helper
    const handleExportCSV = () => {
        const headers = ['ID', 'Fecha', 'Tipo', 'Asesor', 'Cliente', 'Descripcion', 'Valor_COP', 'Estado'];
        const rows = filteredFeed.map(item => [
            `"${item.id}"`,
            `"${item.date}"`,
            `"${item.type}"`,
            `"${item.agentName.replace(/"/g, '""')}"`,
            `"${item.clientName.replace(/"/g, '""')}"`,
            `"${item.description.replace(/"/g, '""')}"`,
            item.value,
            `"${item.status}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Bitacora_Comercial_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-slate-50 overflow-hidden">
            
            {/* Top Filter & Search Header */}
            <div className="p-6 bg-white border-b border-slate-200 shadow-xs shrink-0">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-indigo-600" />
                            Registro Integral de Órdenes y Actividad Comercial
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Historial unificado de ventas, cotizaciones, negocios CRM, contactos y llamadas en tiempo real.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-stretch xl:self-auto">
                        <button
                            onClick={handleExportCSV}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
                            title="Descargar reporte en formato CSV"
                        >
                            <Download className="w-4 h-4 text-slate-500" /> Exportar CSV
                        </button>
                    </div>
                </div>

                {/* Filter Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar cliente, orden, SKU..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Agent Filter */}
                    <div className="relative">
                        <select
                            value={selectedAgent}
                            onChange={e => setSelectedAgent(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">👤 Todos los Asesores</option>
                            {commercialUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.baseRole})</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <select
                            value={selectedType}
                            onChange={e => setSelectedType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">📌 Todos los Tipos</option>
                            <option value="VENTA">💰 Facturas / Ventas POS</option>
                            <option value="COTIZACION">📄 Cotizaciones Emitidas</option>
                            <option value="TRATO_CRM">🤝 Tratos y Negocios CRM</option>
                            <option value="LLAMADA">📞 Llamadas Comerciales</option>
                            <option value="REUNION">📅 Reuniones Agendadas</option>
                            <option value="NUEVO_CLIENTE">🏢 Clientes Vinculados</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Date Range */}
                    <div className="relative">
                        <select
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">🗓️ Todo el Historial</option>
                            <option value="TODAY">Hoy</option>
                            <option value="WEEK">Últimos 7 Días</option>
                            <option value="MONTH">Últimos 30 Días</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">⚡ Todos los Estados</option>
                            <option value="COMPLETED">✅ Completados / Ganados</option>
                            <option value="PENDING">⏳ Pendientes / En Gestión</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Quick KPI Counters Cards */}
            <div className="p-6 pb-2 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ventas Facturadas</div>
                        <div className="text-lg font-black text-slate-900">{formatCOP(metrics.totalSales)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{metrics.ordersCount} órdenes registradas</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cotizaciones</div>
                        <div className="text-lg font-black text-slate-900">{formatCOP(metrics.totalQuotes)}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{metrics.quotesCount} cotizaciones emitidas</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gestiones CRM</div>
                        <div className="text-lg font-black text-slate-900">{metrics.crmActivitiesCount}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Llamadas, citas y tareas</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cuentas Nuevas</div>
                        <div className="text-lg font-black text-slate-900">{metrics.newClientsCount}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Clientes vinculados a cartera</div>
                    </div>
                </div>
            </div>

            {/* Classic Data Grid / Table */}
            <div className="flex-1 p-6 pt-2 overflow-y-auto custom-scrollbar">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-500">
                        <span>Mostrando {filteredFeed.length} registro(s)</span>
                        {(search || selectedAgent !== 'ALL' || selectedType !== 'ALL' || dateRange !== 'ALL' || selectedStatus !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setSelectedAgent('ALL');
                                    setSelectedType('ALL');
                                    setDateRange('ALL');
                                    setSelectedStatus('ALL');
                                }}
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold text-[11px]"
                            >
                                <RefreshCw className="w-3 h-3" /> Limpiar filtros
                            </button>
                        )}
                    </div>

                    {filteredFeed.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
                            <h3 className="font-bold text-slate-700 text-base">No se encontraron registros</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                No hay actividades u órdenes que coincidan con los filtros aplicados. Intenta ampliar el rango de fechas o limpiar los filtros.
                            </p>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
                                        <th className="py-3 px-4">Fecha</th>
                                        <th className="py-3 px-4">Asesor</th>
                                        <th className="py-3 px-4">Tipo</th>
                                        <th className="py-3 px-4">Cliente / Cuenta</th>
                                        <th className="py-3 px-4">Descripción / Documento</th>
                                        <th className="py-3 px-4 text-right">Monto (COP)</th>
                                        <th className="py-3 px-4 text-center">Estado</th>
                                        <th className="py-3 px-3 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedItems.map((item) => (
                                        <tr 
                                            key={item.id} 
                                            onClick={() => setDetailItem(item)}
                                            className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600 font-semibold">
                                                {item.date}
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black flex items-center justify-center text-[10px] shrink-0 border border-white shadow-2xs">
                                                        {item.agentName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-800">{item.agentName}</span>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${item.badgeColor}`}>
                                                    {item.type === 'VENTA' && '💰 Venta'}
                                                    {item.type === 'COTIZACION' && '📄 Cotización'}
                                                    {item.type === 'TRATO_CRM' && '🤝 Trato CRM'}
                                                    {item.type === 'LLAMADA' && '📞 Llamada'}
                                                    {item.type === 'REUNION' && '📅 Reunión'}
                                                    {item.type === 'TAREA' && '📋 Tarea'}
                                                    {item.type === 'NUEVO_CLIENTE' && '🏢 Nuevo Cliente'}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 font-bold text-slate-900 max-w-[200px] truncate" title={item.clientName}>
                                                {item.clientName}
                                            </td>

                                            <td className="py-3 px-4 text-slate-600 max-w-[320px] truncate font-medium" title={item.description}>
                                                {item.description}
                                            </td>

                                            <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                                                {item.value > 0 ? (
                                                    <span className="font-black text-slate-900 text-xs">
                                                        {formatCOP(item.value)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-semibold text-[11px]">-</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailItem(item);
                                                    }}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-all shadow-2xs"
                                                    title="Ver detalle de la operación"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer Controls */}
                        {filteredFeed.length > 0 && (
                            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs select-none">
                                <div className="flex items-center gap-3 text-slate-500 font-medium">
                                    <span>
                                        Mostrando <strong className="text-slate-800 font-bold">{Math.min((currentPage - 1) * pageSize + 1, filteredFeed.length)}</strong> a <strong className="text-slate-800 font-bold">{Math.min(currentPage * pageSize, filteredFeed.length)}</strong> de <strong className="text-slate-800 font-bold">{filteredFeed.length}</strong> operaciones
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <div className="flex items-center gap-1.5">
                                        <span>Por pág:</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700 outline-none hover:border-slate-300 transition-colors"
                                        >
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        Anterior
                                    </button>
                                    <div className="flex items-center gap-1 px-2">
                                        <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg font-bold text-indigo-700">
                                            {currentPage}
                                        </span>
                                        <span className="text-slate-400 font-medium">/</span>
                                        <span className="text-slate-600 font-semibold px-1">
                                            {totalPages}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                                    >
                                        Siguiente
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>

            {/* Quick Detail Drawer / Popup Modal (z-[9999] overlay all) */}
            <AnimatePresence>
                {detailItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDetailItem(null)}
                        className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col"
                        >
                            <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 px-2 py-0.5 rounded text-indigo-300 font-bold">
                                        {detailItem.id}
                                    </span>
                                    <h3 className="text-lg font-black mt-2 tracking-tight text-white">
                                        {detailItem.description}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">Registrado el {detailItem.date}</p>
                                </div>
                                <button
                                    onClick={() => setDetailItem(null)}
                                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 bg-slate-50 space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Asesor Responsable</span>
                                        <div className="font-black text-slate-900 text-sm mt-0.5">{detailItem.agentName}</div>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Estado</span>
                                        <div className="font-black text-slate-900 text-sm mt-0.5">{detailItem.status}</div>
                                    </div>
                                </div>

                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente / Cuenta Vinculada</span>
                                    <div className="font-black text-slate-900 text-sm mt-0.5">{detailItem.clientName}</div>
                                </div>

                                {detailItem.value > 0 && (
                                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex justify-between items-center">
                                        <span className="font-bold text-emerald-800">Valor de la Transacción / Trato</span>
                                        <span className="font-black text-emerald-700 text-lg">{formatCOP(detailItem.value)}</span>
                                    </div>
                                )}

                                {detailItem.metadata && Object.keys(detailItem.metadata).length > 0 && (
                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Metadatos Operativos</span>
                                        {Object.entries(detailItem.metadata).map(([key, val]) => {
                                            if (val === undefined || val === null || val === '') return null;
                                            return (
                                                <div key={key} className="flex justify-between text-slate-600 font-medium">
                                                    <span className="capitalize">{key}:</span>
                                                    <span className="font-bold text-slate-800">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setDetailItem(null)}
                                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                                >
                                    Cerrar Detalle
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
