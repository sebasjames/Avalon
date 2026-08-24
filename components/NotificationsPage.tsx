import React, { useEffect, useRef } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Bell, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
    const { getActiveNotifications, clearNotifications } = useEnterprise();
    const navigate = useNavigate();
    const location = useLocation();
    const notifications = getActiveNotifications();
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#notif-', '');
            const element = document.getElementById(`notif-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('bg-indigo-50', 'ring-2', 'ring-indigo-500', 'transition-all', 'duration-500');
                setTimeout(() => {
                    element.classList.remove('bg-indigo-50', 'ring-2', 'ring-indigo-500');
                }, 3000);
            }
        }
    }, [location.hash, notifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'BIRTHDAY': return '🎂';
            case 'GARBAGE_WARNING': return '⚠️';
            case 'COMERCIAL': return '💼';
            case 'INVENTARIO': return '📦';
            case 'PRODUCCION': return '⚙️';
            case 'FINANZAS': return '💰';
            case 'LOGISTICA': return '🚚';
            case 'CONTABILIDAD': return '🧾';
            default: return '🔔';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        title="Volver"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-indigo-600" />
                            Centro de Notificaciones
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Revisa todas tus alertas y avisos del sistema</p>
                    </div>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={clearNotifications}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto" ref={listRef}>
                    {notifications.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">No hay notificaciones</h3>
                            <p className="text-slate-500 mt-2">Estás al día con todas tus alertas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    id={`notif-${n.id}`}
                                    className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-default flex items-start gap-4 ${!n.read ? 'border-l-4 border-l-indigo-500' : ''}`}
                                >
                                    <div className="text-3xl shrink-0 mt-1 bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl border border-slate-100">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{n.title}</h3>
                                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md shrink-0 uppercase tracking-wider">
                                                {n.type === 'GARBAGE_WARNING' ? 'SISTEMA' : n.type}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-base mb-3">{n.message}</p>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                                            <span>{new Date(n.date).toLocaleString()}</span>
                                            {n.relatedContactId && (
                                                <button 
                                                    onClick={() => navigate(`/crm?contact=${n.relatedContactId}`)}
                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                                >
                                                    Ver cliente relacionado
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
