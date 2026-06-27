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

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none z-0"></div>
            
            <div className="relative z-10 p-4 md:p-8 flex-1 flex flex-col overflow-hidden w-full">
                
                <header className="flex flex-col xl:flex-row justify-between items-end mb-6 gap-6 relative z-20">
                    <div className="text-center xl:text-left w-full xl:w-auto">
                        <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center xl:justify-start gap-3 tracking-tight">
                            <Box className="w-8 h-8 text-indigo-600" />
                            Centro de Inventarios <span className="text-lg font-medium text-slate-400 hidden sm:inline">| Operación Central</span>
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium text-sm md:text-base">Centro de control unificado para gestión del catálogo, lotes y compras.</p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-slate-100/80 p-1 rounded-xl w-full md:w-fit border border-slate-200 overflow-x-auto hide-scroll">
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
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap ${
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
                            {activeTab === 'catalog' && <SmartInventoryView />}
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
