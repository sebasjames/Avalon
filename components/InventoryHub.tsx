import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Box, ScanBarcode, ShoppingCart, LayoutGrid } from 'lucide-react';

// Importamos los widgets internos
import { SmartInventoryView } from './SmartInventoryView';
import { InventoryControlDeep } from './InventoryControlDeep';
import { PurchasingIntelligence } from './PurchasingIntelligence';
import { RecipeModule } from './RecipeModule';
import { FlaskConical } from 'lucide-react';

type InventoryTab = 'catalog' | 'logistics' | 'purchasing' | 'formulas';

export const InventoryHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<InventoryTab>('catalog');
    const [segmentFilter, setSegmentFilter] = useState<'ALL' | 'NACIONAL' | 'IMPORTADA' | 'FERRETERIA'>('ALL');

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none z-0"></div>
            
            <div className="relative z-10 p-4 md:px-8 md:pt-4 md:pb-8 flex-1 flex flex-col overflow-hidden w-full">
                
                <header className="flex flex-col xl:flex-row justify-between items-center mb-3 w-full relative z-20 gap-4">
                    {/* Segment Filters */}
                    <div className={`flex bg-slate-100/80 p-1 rounded-xl w-full md:w-fit border border-slate-200 overflow-x-auto hide-scroll transition-opacity ${activeTab !== 'catalog' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {['ALL', 'NACIONAL', 'IMPORTADA', 'FERRETERIA'].map((seg) => (
                            <button
                                key={seg}
                                onClick={() => setSegmentFilter(seg as any)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                    segmentFilter === seg 
                                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                {seg === 'ALL' && 'Todos'}
                                {seg === 'NACIONAL' && '🇨🇴 Nacional'}
                                {seg === 'IMPORTADA' && '🚢 Importada'}
                                {seg === 'FERRETERIA' && '🔧 Ferretería'}
                            </button>
                        ))}
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
