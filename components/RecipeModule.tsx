import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Plus, Trash2, Search, ArrowRight, Save, DatabaseZap } from 'lucide-react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Product, Recipe, RecipeIngredient } from '../types';

export const RecipeModule: React.FC = () => {
    const { inventory, recipes, addRecipe, deleteRecipe } = useEnterprise();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // New Recipe State
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);

    const handleSaveRecipe = () => {
        if (!selectedProduct) return alert('Selecciona un producto final.');
        if (ingredients.length === 0) return alert('Añade al menos un ingrediente.');
        
        const existing = recipes.find(r => r.finalProductId === selectedProduct);
        if (existing) {
            alert('Este producto ya tiene una fórmula. Bórrala primero si quieres reemplazarla.');
            return;
        }

        addRecipe({
            id: `REC-${Date.now()}`,
            finalProductId: selectedProduct,
            ingredients
        });

        setIsCreating(false);
        setSelectedProduct('');
        setIngredients([]);
    };

    const getProductName = (id: string) => inventory.find(p => p.id === id)?.name || 'Desconocido';
    const getProductCost = (id: string) => inventory.find(p => p.id === id)?.unitCost || 0;

    const filteredRecipes = recipes.filter(r => {
        const pName = getProductName(r.finalProductId).toLowerCase();
        return pName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <FlaskConical size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Fórmulas y Recetas (BOM)</h2>
                        <p className="text-sm font-medium text-slate-500">Configura combos, mezclas y servicios conexos.</p>
                    </div>
                </div>
                {!isCreating && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} /> Nueva Fórmula
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    {isCreating ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
                        >
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <DatabaseZap className="text-indigo-600" /> Creador de Fórmulas
                            </h3>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Producto Final (El que se vende en POS)</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">-- Selecciona el Producto --</option>
                                    {inventory.map(p => (
                                        <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-bold text-slate-700">Explosión de Materiales (Componentes)</label>
                                    <button 
                                        onClick={() => setIngredients([...ingredients, { productId: '', quantity: 1 }])}
                                        className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800"
                                    >
                                        <Plus size={16} /> Añadir Ingrediente
                                    </button>
                                </div>
                                
                                {ingredients.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                        No hay ingredientes. Añade materias primas o mano de obra.
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex-1">
                                                <select 
                                                    className="w-full bg-transparent outline-none font-medium text-slate-700"
                                                    value={ing.productId}
                                                    onChange={(e) => {
                                                        const upd = [...ingredients];
                                                        upd[idx].productId = e.target.value;
                                                        setIngredients(upd);
                                                    }}
                                                >
                                                    <option value="">-- Selecciona Ingrediente --</option>
                                                    {inventory.map(p => (
                                                        <option key={p.id} value={p.id}>{p.sku} - {p.name} (${p.unitCost})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-32">
                                                <input 
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Cant."
                                                    value={ing.quantity || ''}
                                                    onChange={(e) => {
                                                        const upd = [...ingredients];
                                                        upd[idx].quantity = parseFloat(e.target.value) || 0;
                                                        setIngredients(upd);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 outline-none text-right font-bold"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                                                className="text-red-400 hover:text-red-600 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button 
                                    onClick={() => { setIsCreating(false); setSelectedProduct(''); setIngredients([]); }}
                                    className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSaveRecipe}
                                    className="bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl shadow-md hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} /> Guardar Fórmula
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar fórmula por producto..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredRecipes.map(recipe => {
                                    const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (getProductCost(ing.productId) * ing.quantity), 0);
                                    
                                    return (
                                        <div key={recipe.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                                            <button 
                                                onClick={() => deleteRecipe(recipe.id)}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <FlaskConical size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 line-clamp-1" title={getProductName(recipe.finalProductId)}>
                                                        {getProductName(recipe.finalProductId)}
                                                    </h3>
                                                    <p className="text-xs font-bold text-emerald-600">Costo Base: ${totalCost.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Descuenta:</p>
                                                <ul className="space-y-1">
                                                    {recipe.ingredients.map((ing, i) => (
                                                        <li key={i} className="text-sm text-slate-600 flex justify-between">
                                                            <span className="truncate pr-2">• {getProductName(ing.productId)}</span>
                                                            <span className="font-bold text-slate-800 shrink-0">x {ing.quantity}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {filteredRecipes.length === 0 && (
                                <div className="text-center py-20 text-slate-400">
                                    <FlaskConical size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No se encontraron fórmulas.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
