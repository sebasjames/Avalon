import React, { useState } from 'react';
import { Search, Bell, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEnterprise } from '../context/EnterpriseContext';

export const GlobalHeader: React.FC = () => {
    const { contacts, getActiveNotifications, setGlobalSelectedContactId, globalInventorySearch, setGlobalInventorySearch } = useEnterprise();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

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
            (c.nit && c.nit.includes(q)) ||
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

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 hidden md:flex items-center justify-between px-6 py-3">
            {/* Search */}
            <div className="relative w-96">
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
                        onFocus={() => { if(!isInventoryView) setIsSearchOpen(true); }}
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 ring-indigo-500 outline-none transition-all"
                    />
                    {searchTerm && <button onClick={() => { setSearchTerm(''); if(isInventoryView) setGlobalInventorySearch(''); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3"/></button>}
                </div>
                {isSearchOpen && searchTerm && !isInventoryView && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-2">
                        {filteredContacts.length > 0 ? filteredContacts.map(c => (
                            <button key={c.id} onClick={() => handleSelectResult(c.id)} className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                                <div className="font-bold text-sm text-slate-900">{c.name}</div>
                                <div className="text-xs text-slate-500">{c.company} {c.nit ? `• NIT: ${c.nit}` : ''}</div>
                            </button>
                        )) : (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center">No se encontraron resultados para "{searchTerm}"</div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
                    </button>
                    {isNotifOpen && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 font-bold text-sm text-slate-800">
                                Notificaciones ({notifications.length})
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} onClick={() => { if(n.relatedContactId) handleSelectResult(n.relatedContactId); setIsNotifOpen(false); }} className="p-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
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

                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">A</div>
                    <div className="hidden lg:block">
                        <div className="text-sm font-bold text-slate-900 leading-none">Admin User</div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Gerencia</div>
                    </div>
                </div>
            </div>
        </header>
    );
};
