import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { MezclaReceta, MezclaOrder, MezclaStatus } from '../types';
import { 
    Database, Search, Filter, Plus, Beaker, Play, 
    Sparkles, User, Calendar, Layers, CheckCircle2, 
    Trash2, Edit3, X, ArrowRight, ShieldCheck, Scale, Info, BookOpen
} from 'lucide-react';

interface MezclasCatalogoProps {
    onOrderCreated?: (orderId: string) => void;
}

// Approximate color generator for UI badges
const getColorHex = (colorCode: string): string => {
    const code = colorCode.toUpperCase();
    if (code.includes('1000') || code.includes('BEIGE') || code.includes('ARENA')) return '#E3D7B5';
    if (code.includes('3000') || code.includes('ROJO')) return '#AF2B1E';
    if (code.includes('5002') || code.includes('AZUL') || code.includes('TRAF')) return '#1B4D89';
    if (code.includes('6005') || code.includes('VERDE')) return '#114232';
    if (code.includes('7035') || code.includes('GRIS') || code.includes('TITANIO')) return '#D7D7D7';
    if (code.includes('9003') || code.includes('BLANCO')) return '#F4F4F4';
    if (code.includes('9005') || code.includes('NEGRO')) return '#1A1A1A';
    if (code.includes('1021') || code.includes('AMARILLO')) return '#F3DA0B';
    if (code.includes('2004') || code.includes('NARANJA')) return '#E25303';
    return '#6366F1'; // Default Indigo
};

export const MezclasCatalogo: React.FC<MezclasCatalogoProps> = ({ onOrderCreated }) => {
    const { 
        mezclaCatalogo, 
        saveMezclaToCatalogo, 
        updateMezclaCatalogo, 
        deleteMezclaFromCatalogo, 
        addMezclaOrder,
        mezclaOrders 
    } = useEnterprise();

    // Filters and Search
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ESTANDAR' | 'ESPECIAL_CLIENTE' | 'AJUSTE_PLANTA'>('ALL');
    const [technologyFilter, setTechnologyFilter] = useState<string>('ALL');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedRecipeForOrder, setSelectedRecipeForOrder] = useState<MezclaReceta | null>(null);
    const [historyRecipe, setHistoryRecipe] = useState<MezclaReceta | null>(null);

    // Order Creation State (Reutilizar fórmula)
    const [orderQuantity, setOrderQuantity] = useState<number>(1);
    const [orderClient, setOrderClient] = useState<string>('');
    const [orderNotes, setOrderNotes] = useState<string>('');
    const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

    // New Recipe Modal State
    const [newRecipeName, setNewRecipeName] = useState('');
    const [newRecipeColor, setNewRecipeColor] = useState('');
    const [newRecipeClient, setNewRecipeClient] = useState('Catálogo General');
    const [newRecipeBaseSku, setNewRecipeBaseSku] = useState('BASE-POLI-PST');
    const [newRecipeBaseName, setNewRecipeBaseName] = useState('Base Pastel Poliuretano');
    const [newRecipeBaseType, setNewRecipeBaseType] = useState('SOLVENTE INTERNO');
    const [newRecipeCategory, setNewRecipeCategory] = useState<'ESTANDAR' | 'ESPECIAL_CLIENTE' | 'AJUSTE_PLANTA'>('ESTANDAR');
    const [newRecipeInstructions, setNewRecipeInstructions] = useState('');
    const [newRecipeIngredients, setNewRecipeIngredients] = useState<Array<{ name: string; grams: string }>>([
        { name: 'PIGMENT-AMARILLO', grams: '12.0' },
        { name: 'PIGMENT-NEGRO', grams: '2.5' }
    ]);

    // Unique Technologies for filter
    const technologies = useMemo(() => {
        const set = new Set<string>();
        mezclaCatalogo.forEach(r => {
            if (r.baseType) set.add(r.baseType);
        });
        return Array.from(set);
    }, [mezclaCatalogo]);

    // Filtered recipes
    const filteredRecipes = useMemo(() => {
        return mezclaCatalogo.filter(r => {
            const matchesSearch = 
                r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.colorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.clientName && r.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                r.baseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.baseSku.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
            const matchesTech = technologyFilter === 'ALL' || r.baseType === technologyFilter;

            return matchesSearch && matchesCategory && matchesTech;
        });
    }, [mezclaCatalogo, searchTerm, categoryFilter, technologyFilter]);

    // Stats
    const totalPreparations = useMemo(() => {
        return mezclaCatalogo.reduce((acc, curr) => acc + (curr.timesPrepared || 0), 0);
    }, [mezclaCatalogo]);

    const clientSpecificCount = useMemo(() => {
        return mezclaCatalogo.filter(r => r.category === 'ESPECIAL_CLIENTE' || (r.clientName && r.clientName !== 'Catálogo General' && r.clientName !== 'General')).length;
    }, [mezclaCatalogo]);

    // Handler: Trigger Order Creation from Recipe
    const handleOpenOrderModal = (recipe: MezclaReceta) => {
        setSelectedRecipeForOrder(recipe);
        setOrderQuantity(1);
        setOrderClient(recipe.clientName || 'Cliente General');
        setOrderNotes(`Orden generada desde receta guardada: ${recipe.name}`);
    };

    const handleConfirmOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecipeForOrder) return;

        // Scale formula based on quantity (assuming unit recipe is 1 Gallon)
        const scaledFormula: Record<string, string> = {};
        Object.entries(selectedRecipeForOrder.formula).forEach(([ing, qtyStr]) => {
            const numericQty = parseFloat(qtyStr) || 0;
            if (numericQty > 0) {
                const scaled = (numericQty * orderQuantity).toFixed(2);
                scaledFormula[ing] = `${scaled}g`;
            } else {
                scaledFormula[ing] = qtyStr;
            }
        });

        const newOrderId = `MZ-${Math.floor(1000 + Math.random() * 9000)}`;
        const newOrder: MezclaOrder = {
            id: newOrderId,
            saleId: `REC-${selectedRecipeForOrder.id}`,
            clientName: orderClient || selectedRecipeForOrder.clientName || 'General',
            colorId: selectedRecipeForOrder.colorCode,
            baseSku: selectedRecipeForOrder.baseSku,
            baseName: `${selectedRecipeForOrder.baseName} (${orderQuantity} Gal)`,
            baseType: selectedRecipeForOrder.baseType,
            formula: scaledFormula,
            status: MezclaStatus.PENDING,
            requestedAt: new Date().toISOString(),
            operatorName: 'Operador Asignado',
            timelineNotes: [
                {
                    id: `NOTE-${Date.now()}`,
                    author: 'Sistema (Catálogo de Mezclas)',
                    process: 'Laboratorio',
                    text: `Orden escalada a ${orderQuantity} Gal(s). Receta base: ${selectedRecipeForOrder.name}. ${orderNotes}`,
                    date: new Date().toISOString()
                }
            ]
        };

        // 1. Add order to queue
        addMezclaOrder(newOrder);

        // 2. Increment usage in catalog
        updateMezclaCatalogo(selectedRecipeForOrder.id, {
            timesPrepared: (selectedRecipeForOrder.timesPrepared || 0) + 1,
            lastPreparedAt: new Date().toISOString()
        });

        setSelectedRecipeForOrder(null);
        setOrderSuccessMessage(`¡Orden ${newOrderId} enviada a la Cola de Mezclas con éxito!`);
        setTimeout(() => setOrderSuccessMessage(null), 5000);

        if (onOrderCreated) {
            onOrderCreated(newOrderId);
        }
    };

    // Handler: Add new ingredient row in create modal
    const handleAddIngredientRow = () => {
        setNewRecipeIngredients(prev => [...prev, { name: '', grams: '1.0' }]);
    };

    const handleIngredientChange = (index: number, field: 'name' | 'grams', value: string) => {
        setNewRecipeIngredients(prev => {
            const next = [...prev];
            next[index][field] = value;
            return next;
        });
    };

    const handleRemoveIngredientRow = (index: number) => {
        setNewRecipeIngredients(prev => prev.filter((_, i) => i !== index));
    };

    // Handler: Create Recipe from scratch
    const handleSaveNewRecipe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRecipeName || !newRecipeColor) return;

        const formulaMap: Record<string, string> = {};
        newRecipeIngredients.forEach(ing => {
            if (ing.name.trim()) {
                formulaMap[ing.name.trim()] = ing.grams || '1';
            }
        });

        saveMezclaToCatalogo({
            name: newRecipeName,
            colorCode: newRecipeColor,
            clientName: newRecipeClient,
            baseSku: newRecipeBaseSku,
            baseName: newRecipeBaseName,
            baseType: newRecipeBaseType,
            formula: formulaMap,
            unit: 'GL',
            category: newRecipeCategory,
            instructions: newRecipeInstructions,
            createdByUser: 'Usuario de Planta / Lab'
        });

        setIsCreateModalOpen(false);
        // Reset form
        setNewRecipeName('');
        setNewRecipeColor('');
        setNewRecipeClient('Catálogo General');
        setNewRecipeInstructions('');
        setOrderSuccessMessage('¡Fórmula guardada exitosamente en la Base de Datos de Mezclas!');
        setTimeout(() => setOrderSuccessMessage(null), 4000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Notification alert banner */}
            {orderSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>{orderSuccessMessage}</span>
                    </div>
                    <button onClick={() => setOrderSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-black text-sm">✕</button>
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por color, nombre, cliente o base (ej. RAL 1000, Taller El Rayo, Poliuretano)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
                        <button 
                            onClick={() => setCategoryFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'ALL' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Todas ({mezclaCatalogo.length})
                        </button>
                        <button 
                            onClick={() => setCategoryFilter('ESPECIAL_CLIENTE')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'ESPECIAL_CLIENTE' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Clientes
                        </button>
                        <button 
                            onClick={() => setCategoryFilter('ESTANDAR')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'ESTANDAR' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Estándar
                        </button>
                        <button 
                            onClick={() => setCategoryFilter('AJUSTE_PLANTA')}
                            className={`px-3 py-1.5 rounded-lg transition-all ${categoryFilter === 'AJUSTE_PLANTA' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Ajustes Planta
                        </button>
                    </div>

                    {technologies.length > 0 && (
                        <select 
                            value={technologyFilter}
                            onChange={(e) => setTechnologyFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                            <option value="ALL">Todas las Tecnologías</option>
                            {technologies.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    )}

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer text-xs shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Mezcla Manual
                    </button>
                </div>
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => {
                    const swatchColor = getColorHex(recipe.colorCode);
                    const formulaCount = Object.keys(recipe.formula).length;

                    return (
                        <div 
                            key={recipe.id}
                            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-indigo-200 relative overflow-hidden"
                        >
                            {/* Color Bar on Top */}
                            <div className="h-2 w-full absolute top-0 left-0" style={{ backgroundColor: swatchColor }}></div>

                            <div>
                                {/* Header Card */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-12 h-12 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center font-black text-xs uppercase"
                                            style={{ 
                                                backgroundColor: swatchColor, 
                                                color: swatchColor === '#1A1A1A' || swatchColor === '#114232' || swatchColor === '#1B4D89' || swatchColor === '#AF2B1E' ? '#FFFFFF' : '#1E293B' 
                                            }}
                                        >
                                            {recipe.colorCode.slice(0, 4)}
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                                                {recipe.colorCode}
                                            </span>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight mt-0.5 group-hover:text-indigo-600 transition-colors">
                                                {recipe.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                        recipe.category === 'ESPECIAL_CLIENTE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        recipe.category === 'AJUSTE_PLANTA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                        {recipe.category === 'ESPECIAL_CLIENTE' ? 'Cliente' :
                                         recipe.category === 'AJUSTE_PLANTA' ? 'Planta' : 'Estándar'}
                                    </span>
                                </div>

                                {/* Client and Technology Information */}
                                <div className="space-y-2 py-2 border-y border-slate-100 my-3 text-xs">
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                                            <User className="w-3.5 h-3.5 text-slate-400" /> Cliente:
                                        </span>
                                        <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">
                                            {recipe.clientName || 'Catálogo General'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="flex items-center gap-1.5 font-medium text-slate-500">
                                            <Layers className="w-3.5 h-3.5 text-slate-400" /> Base Requerida:
                                        </span>
                                        <span className="font-bold text-slate-800 truncate max-w-[180px]" title={recipe.baseName}>
                                            {recipe.baseName}
                                        </span>
                                    </div>
                                    {recipe.baseType && (
                                        <div className="flex items-center justify-between text-slate-600">
                                            <span className="text-slate-400 font-medium">Tecnología:</span>
                                            <span className="font-semibold text-indigo-700 bg-indigo-50/60 px-2 py-0.5 rounded text-[11px]">
                                                {recipe.baseType}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Formula Breakdown */}
                                <div className="space-y-1.5 mb-4">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                        <span>Componentes ({formulaCount})</span>
                                        <span>Dosis x Galón</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-2.5 space-y-1.5 border border-slate-100 max-h-36 overflow-y-auto custom-scrollbar">
                                        {Object.entries(recipe.formula).map(([ingName, qty], idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="font-mono text-slate-700 truncate max-w-[190px]" title={ingName}>
                                                    {ingName.replace('PIGMENT-', '')}
                                                </span>
                                                <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-xs border border-slate-200/50">
                                                    {String(qty)}g
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {recipe.notes && (
                                    <p className="text-xs text-slate-500 italic mb-4 line-clamp-2">
                                        "{recipe.notes}"
                                    </p>
                                )}
                            </div>

                            {/* Card Footer with History Metric & Actions */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500" title={`Preparada ${recipe.timesPrepared} veces`}>
                                    <Beaker className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="font-bold text-slate-700">{recipe.timesPrepared || 1}</span> preparaciones
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => handleOpenOrderModal(recipe)}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        Preparar Mezcla
                                    </button>
                                    <button 
                                        onClick={() => setHistoryRecipe(recipe)}
                                        className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                                        title="Ver historial de preparaciones"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm(`¿Eliminar la fórmula ${recipe.name} del catálogo de mezclas?`)) {
                                                deleteMezclaFromCatalogo(recipe.id);
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                        title="Eliminar del catálogo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredRecipes.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800">No se encontraron mezclas</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                        No hay recetas que coincidan con los filtros seleccionados. Puedes crear una nueva mezcla manual o limpiar la búsqueda.
                    </p>
                    <button 
                        onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); setTechnologyFilter('ALL'); }}
                        className="mt-4 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            )}

            {/* MODAL: PREPARAR ORDEN DE MEZCLA (REUTILIZAR Y ESCALAR) */}
            {selectedRecipeForOrder && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-in fade-in zoom-in-95 border border-slate-200">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Reutilizar Fórmula</span>
                                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                                    Preparar: {selectedRecipeForOrder.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Base: {selectedRecipeForOrder.baseName} ({selectedRecipeForOrder.baseSku})
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedRecipeForOrder(null)} 
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmOrder} className="space-y-5">
                            {/* Quantity Selector with Quick Buttons */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                    <span>Cantidad a Preparar (Galones)</span>
                                    <span className="text-indigo-600 font-mono font-bold">{orderQuantity} Gal(s)</span>
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[0.25, 1, 2, 5].map((qty) => (
                                        <button
                                            type="button"
                                            key={qty}
                                            onClick={() => setOrderQuantity(qty)}
                                            className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                                orderQuantity === qty 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30' 
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {qty === 0.25 ? '1/4 Gal' : qty === 5 ? '5 Gal (Cuñete)' : `${qty} Gal`}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    type="number"
                                    step="0.25"
                                    min="0.1"
                                    value={orderQuantity}
                                    onChange={(e) => setOrderQuantity(parseFloat(e.target.value) || 1)}
                                    className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                                />
                            </div>

                            {/* Client Name Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Cliente Destino</label>
                                <input 
                                    type="text"
                                    required
                                    value={orderClient}
                                    onChange={(e) => setOrderClient(e.target.value)}
                                    placeholder="Nombre del cliente o razón social"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800"
                                />
                            </div>

                            {/* Live Scaled Formula Preview */}
                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Scale className="w-3.5 h-3.5 text-indigo-600" />
                                        Cálculo de Pigmentos Requeridos:
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-mono">Factor x{orderQuantity}</span>
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pt-1">
                                    {Object.entries(selectedRecipeForOrder.formula).map(([ing, qtyStr], idx) => {
                                        const unitQty = parseFloat(qtyStr) || 0;
                                        const scaledTotal = (unitQty * orderQuantity).toFixed(2);
                                        return (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <span className="text-slate-600 font-mono truncate max-w-[240px]">
                                                    {ing.replace('PIGMENT-', '')}
                                                </span>
                                                <div className="font-mono">
                                                    <span className="text-slate-400 text-[10px] mr-1">({unitQty}g/gal)</span>
                                                    <span className="font-bold text-indigo-700">{scaledTotal}g</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Observaciones para Planta</label>
                                <input 
                                    type="text"
                                    value={orderNotes}
                                    onChange={(e) => setOrderNotes(e.target.value)}
                                    placeholder="Instrucciones adicionales para el operario..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRecipeForOrder(null)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Enviar a Mezclas
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: NUEVA MEZCLA MANUAL EN BASE DE DATOS */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-xl w-full space-y-6 animate-in fade-in zoom-in-95 border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Biblioteca de Fórmulas</span>
                                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                                    Registrar Nueva Mezcla Maestra
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Esta fórmula quedará archivada en la base de datos para futuras preparaciones y órdenes.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)} 
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewRecipe} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Nombre de la Mezcla *</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="Ej. Gris Perla Brillante"
                                        value={newRecipeName}
                                        onChange={(e) => setNewRecipeName(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Código / Referencia de Color *</label>
                                    <input 
                                        type="text"
                                        required
                                        placeholder="Ej. RAL 7035 o ESP-001"
                                        value={newRecipeColor}
                                        onChange={(e) => setNewRecipeColor(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Cliente Asociado</label>
                                    <input 
                                        type="text"
                                        placeholder="Ej. Taller El Rayo o 'Catálogo General'"
                                        value={newRecipeClient}
                                        onChange={(e) => setNewRecipeClient(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Categoría</label>
                                    <select 
                                        value={newRecipeCategory}
                                        onChange={(e: any) => setNewRecipeCategory(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                                    >
                                        <option value="ESTANDAR">Fórmula Estándar</option>
                                        <option value="ESPECIAL_CLIENTE">Exclusiva de Cliente</option>
                                        <option value="AJUSTE_PLANTA">Ajuste de Planta</option>
                                    </select>
                                </div>
                            </div>

                            {/* Base Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">SKU de Base</label>
                                    <input 
                                        type="text"
                                        required
                                        value={newRecipeBaseSku}
                                        onChange={(e) => setNewRecipeBaseSku(e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                    />
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase">Nombre de la Base</label>
                                    <input 
                                        type="text"
                                        required
                                        value={newRecipeBaseName}
                                        onChange={(e) => setNewRecipeBaseName(e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                    />
                                </div>
                            </div>

                            {/* Component Ingredients (Dosis x Galón) */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Beaker className="w-3.5 h-3.5 text-indigo-600" />
                                        Componentes / Pigmentos (Gramos x Galón)
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={handleAddIngredientRow}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Agregar Componente
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {newRecipeIngredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input 
                                                type="text"
                                                required
                                                placeholder="Código/Nombre del pigmento (ej. PIG-AMARILLO)"
                                                value={ing.name}
                                                onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                                            />
                                            <div className="flex items-center gap-1 w-28">
                                                <input 
                                                    type="number"
                                                    step="0.1"
                                                    min="0.1"
                                                    required
                                                    placeholder="Gramos"
                                                    value={ing.grams}
                                                    onChange={(e) => handleIngredientChange(idx, 'grams', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-right"
                                                />
                                                <span className="text-xs text-slate-500 font-bold">g</span>
                                            </div>
                                            {newRecipeIngredients.length > 1 && (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveIngredientRow(idx)}
                                                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Instrucciones Especiales / Notas</label>
                                <textarea 
                                    rows={2}
                                    placeholder="Ej. Mezclar a 1200 RPM por 5 minutos antes de envasar..."
                                    value={newRecipeInstructions}
                                    onChange={(e) => setNewRecipeInstructions(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer font-bold"
                                >
                                    Guardar en Catálogo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {historyRecipe && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                    Historial de Preparaciones
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">Fórmula: {historyRecipe.name}</p>
                            </div>
                            <button onClick={() => setHistoryRecipe(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {mezclaOrders?.filter(o => o.saleId === `REC-${historyRecipe.id}`).length === 0 ? (
                                <div className="text-center py-10">
                                    <BookOpen className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                    <p className="text-slate-400 font-medium">No hay registros de preparaciones para esta fórmula todavía.</p>
                                </div>
                            ) : (
                                mezclaOrders?.filter(o => o.saleId === `REC-${historyRecipe.id}`).sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()).map(order => (
                                    <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(order.requestedAt).toLocaleDateString()} {new Date(order.requestedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                <p className="font-bold text-slate-800 text-sm mt-0.5">{order.baseName}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${order.status === 'READY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {order.status === 'READY' ? 'FINALIZADA' : 'EN PROCESO'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                            <span className="font-bold text-slate-700">Operario:</span> {order.operatorName || 'No asignado'} <br/>
                                            <span className="font-bold text-slate-700">Cliente Destino:</span> {order.clientName}
                                        </div>
                                        {order.timelineNotes && order.timelineNotes.length > 0 && (
                                            <div className="mt-3 space-y-1.5">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas y Trazabilidad:</p>
                                                {order.timelineNotes.map(note => (
                                                    <div key={note.id} className="text-xs text-slate-500 pl-3 border-l-2 border-indigo-200">
                                                        <span className="font-medium text-slate-700">{note.author}:</span> {note.text}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
