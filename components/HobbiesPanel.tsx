import React, { useState } from 'react';
import { Search, Heart, Cake, Briefcase } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const HobbiesPanel: React.FC = () => {
    const { contacts, setGlobalSelectedContactId } = useEnterprise();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const allDecisionMakers = contacts.flatMap(c => 
        (c.decisionMakers || []).map(dm => ({
            ...dm,
            contactId: c.id,
            contactName: c.name,
            contactCompany: c.company,
            tier: c.tier
        }))
    ).filter(dm => dm.hobby || dm.birthday);

    const filtered = allDecisionMakers.filter(dm => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (dm.hobby && dm.hobby.toLowerCase().includes(q)) ||
            (dm.name && dm.name.toLowerCase().includes(q)) ||
            (dm.contactCompany && dm.contactCompany.toLowerCase().includes(q))
        );
    });

    const handleGoToContact = (contactId: string) => {
        setGlobalSelectedContactId(contactId);
        navigate('/crm');
    };

    return (
        <div className="p-4 md:p-8 w-full min-h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Heart className="w-8 h-8 text-rose-500" /> Afinidades y Hobbies
                </h1>
                <p className="text-slate-500 mt-2">Encuentra intereses comunes en tus clientes clave para generar fidelización.</p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar por hobby (ej. Fútbol, Vinos) o nombre..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                </div>
                <div className="text-sm font-semibold text-slate-500">
                    {filtered.length} Personas encontradas
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((dm, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (idx % 10) * 0.05 }}
                        key={`${dm.contactId}-${idx}`} 
                        className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-rose-200 transition-all cursor-pointer"
                        onClick={() => handleGoToContact(dm.contactId)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-slate-900 leading-tight">{dm.name}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dm.tier === 'STRATEGIC' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>{dm.tier}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium">{dm.position || 'Sin Cargo'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="truncate">{dm.contactCompany}</span>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-slate-100">
                            {dm.hobby && (
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 p-1 bg-rose-50 rounded text-rose-500"><Heart className="w-3 h-3" /></div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intereses / Hobbies</div>
                                        <div className="text-sm font-medium text-slate-800">{dm.hobby}</div>
                                    </div>
                                </div>
                            )}
                            {dm.birthday && (
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 p-1 bg-amber-50 rounded text-amber-500"><Cake className="w-3 h-3" /></div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cumpleaños</div>
                                        <div className="text-sm font-medium text-slate-800">{new Date(dm.birthday).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        No se encontraron personas con esos intereses.
                    </div>
                )}
            </div>
        </div>
    );
};
