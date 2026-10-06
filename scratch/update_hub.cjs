const fs = require('fs');
const path = require('path');

const hubPath = path.resolve(__dirname, '../components/OperationsHub.tsx');

const content = `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MezclasTablero } from './MezclasTablero';
import { DispatchModule } from './DispatchModule';
import { InventarioMezclas } from './InventarioMezclas';
import { Beaker, Truck, ClipboardList, FlaskConical } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';

export const OperationsHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'mezclas' | 'despachos' | 'inventarioMezclas'>('despachos');
    const { inventory } = useEnterprise();

    const openCount = inventory.filter(p => (p.labStock || 0) > 0).length;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
            {/* Header Tabs */}
            <div className="bg-white border-b border-slate-200 shadow-sm z-50 flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Mezclas y Pedidos</h1>
                        <p className="text-xs text-slate-500 font-medium">Control de Mezclas, Despachos e Inventario de Laboratorio</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/60">
                    <button 
                        onClick={() => setActiveTab('despachos')}
                        className={\`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'despachos' ? 'bg-white text-emerald-700 shadow border border-slate-200' : 'text-slate-500 hover:text-slate-700'}\`}
                    >
                        <Truck className="w-4 h-4" />
                        Pedidos
                    </button>
                    <button 
                        onClick={() => setActiveTab('mezclas')}
                        className={\`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'mezclas' ? 'bg-white text-indigo-700 shadow border border-slate-200' : 'text-slate-500 hover:text-slate-700'}\`}
                    >
                        <Beaker className="w-4 h-4" />
                        Laboratorio (KDS)
                    </button>
                    <button 
                        onClick={() => setActiveTab('inventarioMezclas')}
                        className={\`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all \${activeTab === 'inventarioMezclas' ? 'bg-white text-purple-700 shadow border border-slate-200' : 'text-slate-500 hover:text-slate-700'}\`}
                    >
                        <FlaskConical className="w-4 h-4" />
                        Inventario Mezclas
                        {openCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-black bg-purple-100 text-purple-700 border border-purple-200">
                                {openCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-full"
                    >
                        {activeTab === 'mezclas' && (
                            <div className="pb-10">
                                <MezclasTablero />
                            </div>
                        )}
                        {activeTab === 'despachos' && (
                            <div className="pb-10">
                                <DispatchModule />
                            </div>
                        )}
                        {activeTab === 'inventarioMezclas' && (
                            <div className="pb-10">
                                <InventarioMezclas />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
`;

fs.writeFileSync(hubPath, content, 'utf8');
console.log('OperationsHub.tsx updated successfully with Inventario Mezclas tab!');
