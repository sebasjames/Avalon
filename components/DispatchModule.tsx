import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Truck, Package, PackageCheck, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { DispatchLog } from '../types';

export const DispatchModule: React.FC = () => {
    const { dispatches, updateDispatch, contacts } = useEnterprise();
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = (dispatches || []).filter(d => {
        const idMatch = (d.id || '').toLowerCase().includes(searchQuery.toLowerCase());
        const contactName = contacts.find(c => c.id === d.contactId)?.name || '';
        const contactMatch = contactName.toLowerCase().includes(searchQuery.toLowerCase());
        return idMatch || contactMatch;
    });

    const pending = filtered.filter(d => d.status === 'PENDIENTE' || d.status === 'ARMANDO_PEDIDO');
    const inTransit = filtered.filter(d => d.status === 'EN_TRANSITO');
    const completed = filtered.filter(d => d.status === 'ENTREGADO' || d.status === 'ENTREGA_FALLIDA');

    const handleStatusChange = (id: string, newStatus: DispatchLog['status']) => {
        const update: Partial<DispatchLog> = { status: newStatus };
        if (newStatus === 'ENTREGADO') {
            update.actualDeliveryDate = new Date().toISOString().split('T')[0];
        }
        updateDispatch(id, update);
    };

    const renderCard = (d: DispatchLog) => {
        const contact = contacts.find(c => c.id === d.contactId);
        return (
            <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-slate-800">{d.id}</div>
                        <div className="text-sm text-slate-500">{contact?.name || 'Cliente'}</div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                        {d.promisedDate}
                    </span>
                </div>
                
                <div className="text-sm text-slate-600 space-y-1">
                    {d.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                            <span className="truncate pr-2">{item.productName}</span>
                            <span className="font-mono text-xs font-medium">
                                {item.deliveredQty} / {item.orderedQty}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between gap-2">
                    {d.status === 'PENDIENTE' && (
                        <button onClick={() => handleStatusChange(d.id, 'ARMANDO_PEDIDO')} className="flex-1 text-xs py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100">
                            Armar Pedido
                        </button>
                    )}
                    {d.status === 'ARMANDO_PEDIDO' && (
                        <button onClick={() => handleStatusChange(d.id, 'EN_TRANSITO')} className="flex-1 text-xs py-1.5 bg-amber-50 text-amber-700 rounded-md font-medium hover:bg-amber-100">
                            Despachar
                        </button>
                    )}
                    {d.status === 'EN_TRANSITO' && (
                        <>
                            <button onClick={() => handleStatusChange(d.id, 'ENTREGA_FALLIDA')} className="flex-1 text-xs py-1.5 bg-red-50 text-red-700 rounded-md font-medium hover:bg-red-100">
                                Fallida
                            </button>
                            <button onClick={() => handleStatusChange(d.id, 'ENTREGADO')} className="flex-1 text-xs py-1.5 bg-emerald-50 text-emerald-700 rounded-md font-medium hover:bg-emerald-100">
                                Entregado
                            </button>
                        </>
                    )}
                    {(d.status === 'ENTREGADO' || d.status === 'ENTREGA_FALLIDA') && (
                        <div className="flex-1 text-center text-xs py-1.5 text-slate-500 font-medium flex items-center justify-center">
                            {d.status === 'ENTREGADO' ? <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> : <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />}
                            {d.actualDeliveryDate || 'Sin Fecha'}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Truck className="w-6 h-6 mr-2 text-indigo-600" />
                    Módulo de Despachos y Logística
                </h1>
                <p className="text-slate-500 text-sm mt-1">Control de entregas, asignación de rutas y registro de tiempos para OTIF y Fill Rate.</p>
            </header>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por ID de despacho, cliente..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full max-w-md border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-100 p-4 rounded-2xl flex flex-col h-[calc(100vh-220px)]">
                    <h2 className="font-semibold text-slate-700 mb-4 flex items-center justify-between">
                        <span className="flex items-center"><Package className="w-4 h-4 mr-2" /> Por Despachar</span>
                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{pending.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {pending.map(renderCard)}
                        {pending.length === 0 && <div className="text-center text-slate-400 text-sm py-10">No hay despachos pendientes</div>}
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl flex flex-col h-[calc(100vh-220px)]">
                    <h2 className="font-semibold text-indigo-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center"><Truck className="w-4 h-4 mr-2" /> En Tránsito</span>
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{inTransit.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {inTransit.map(renderCard)}
                        {inTransit.length === 0 && <div className="text-center text-indigo-300 text-sm py-10">No hay vehículos en ruta</div>}
                    </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-2xl flex flex-col h-[calc(100vh-220px)]">
                    <h2 className="font-semibold text-emerald-900 mb-4 flex items-center justify-between">
                        <span className="flex items-center"><PackageCheck className="w-4 h-4 mr-2" /> Entregados</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{completed.length}</span>
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {completed.map(renderCard)}
                        {completed.length === 0 && <div className="text-center text-emerald-300 text-sm py-10">No hay entregas recientes</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
