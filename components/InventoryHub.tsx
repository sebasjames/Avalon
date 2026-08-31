import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, ScanBarcode, ShoppingCart, LayoutGrid } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';

// Importamos los widgets internos
import { SmartInventoryView } from './SmartInventoryView';
import { InventoryControlDeep } from './InventoryControlDeep';
import { PurchasingIntelligence } from './PurchasingIntelligence';
import { RecipeModule } from './RecipeModule';
import { FlaskConical } from 'lucide-react';

type InventoryTab = 'catalog' | 'logistics' | 'purchasing' | 'formulas';

export const InventoryHub: React.FC = () => {
    const { locations } = useEnterprise();
    const activeLocations = locations.filter(l => l.status === 'Activa');
    const [activeTab, setActiveTab] = useState<InventoryTab>('catalog');
    const [segmentFilter, setSegmentFilter] = useState<string>('ALL');

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none z-0"></div>
            
            <div className="relative z-10 p-4 md:px-8 md:pt-4 md:pb-8 flex-1 flex flex-col overflow-hidden w-full">
                
                <header className="flex flex-col xl:flex-row justify-between items-center mb-3 w-full relative z-20 gap-4">
                    {/* Location Filters */}
                    <div className={`flex bg-slate-100/80 p-1 rounded-xl w-full md:w-fit border border-slate-200 overflow-x-auto hide-scroll transition-opacity items-center gap-1 ${activeTab !== 'catalog' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <button
                            onClick={() => setSegmentFilter('ALL')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                segmentFilter === 'ALL' 
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                        >
                            Todos
                        </button>
                        {activeLocations.map((loc) => (
                            <button
                                key={loc.id}
                                onClick={() => setSegmentFilter(loc.id)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                    segmentFilter === loc.id
                                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                {loc.name}
                            </button>
                        ))}
                        <button 
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all ml-1 border border-transparent hover:border-slate-200/50"
                            title="Configurar Locaciones"
                            onClick={() => {
                                // Simulate navigating to Configuration -> Locaciones by clicking standard nav
                                alert("Ve a Configuración > Locaciones para administrar las bodegas.");
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200 overflow-x-auto hide-scroll">
                        {[
                          { id: 'catalog', label: 'Catálogo & ATP', icon: LayoutGrid },
                          { id: 'logistics', label: 'Kardex Deep & Lotes', icon: ScanBarcode },
                          { id: 'purchasing', label: 'Abastecimiento', icon: ShoppingCart },
                          { id: 'formulas', label: 'Fórmulas y Recetas', icon: FlaskConical }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id as InventoryTab)} 
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                        isActive ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </header>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }} 
                            transition={{ duration: 0.2 }} 
                            className="flex-1 overflow-hidden"
                        >
                            {activeTab === 'catalog' && <SmartInventoryView segmentFilter={segmentFilter} />}
                            {activeTab === 'logistics' && <InventoryControlDeep />}
                            {activeTab === 'purchasing' && <PurchasingIntelligence />}
                            {activeTab === 'formulas' && <RecipeModule />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
