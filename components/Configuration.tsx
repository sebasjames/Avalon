import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Package, 
  Factory, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  Save, 
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Beaker,
  Tags,
  Scale,
  X,
  Plus,
  Trash2,
  ArrowRightLeft,
  Database
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../constants';
import { SystemSettings } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';

export const Configuration: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'inventario' | 'produccion' | 'formulas' | 'ventas' | 'compras' | 'finanzas'>('inventario');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { tintometricRules, updateTintometricRules, reverseDisplayRules, updateReverseDisplayRules } = useEnterprise();
  const [newRule, setNewRule] = useState('');
  const [newReverseRule, setNewReverseRule] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('procoquinal_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('procoquinal_settings', JSON.stringify(settings));
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que deseas restablecer todos los valores a los predeterminados?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => {
      const categoryData = prev[category] as any;
      if (typeof categoryData[key] === 'object' && !Array.isArray(categoryData[key])) {
        // Handle nested objects like priorityWeights
        return {
          ...prev,
          [category]: {
            ...categoryData,
            [key]: { ...categoryData[key], ...value }
          }
        };
      }
      return {
        ...prev,
        [category]: {
          ...categoryData,
          [key]: value
        }
      };
    });
  };

  const handleAddVendorPrefix = (vendorId: string, prefix: string, meaning: string) => {
      if (!prefix.trim() || !meaning.trim()) return;
      setSettings(prev => ({
          ...prev,
          formulation: {
              ...prev.formulation,
              vendorRules: prev.formulation.vendorRules.map(r => 
                  r.id === vendorId 
                      ? { ...r, prefixRules: [...r.prefixRules, { id: Date.now().toString(), prefix: prefix.trim(), meaning: meaning.trim() }] } 
                      : r
              )
          }
      }));
  };

  const handleRemoveVendorPrefix = (vendorId: string, prefixId: string) => {
      setSettings(prev => ({
          ...prev,
          formulation: {
              ...prev.formulation,
              vendorRules: prev.formulation.vendorRules.map(r => 
                  r.id === vendorId 
                      ? { ...r, prefixRules: r.prefixRules.filter(p => p.id !== prefixId) } 
                      : r
              )
          }
      }));
  };

  const handleAddVendor = () => {
      const brand = prompt("Nombre del Proveedor / Marca:");
      if (!brand) return;
      setSettings(prev => ({
          ...prev,
          formulation: {
              ...prev.formulation,
              vendorRules: [
                  ...prev.formulation.vendorRules,
                  { id: Date.now().toString(), brand, prefixRules: [], categoryName: `Materia Prima (${brand})` }
              ]
          }
      }));
  };

  const handleRemoveVendor = (vendorId: string) => {
      if (!window.confirm("¿Eliminar este proveedor y todas sus reglas?")) return;
      setSettings(prev => ({
          ...prev,
          formulation: {
              ...prev.formulation,
              vendorRules: prev.formulation.vendorRules.filter(r => r.id !== vendorId)
          }
      }));
  };

  const tabs = [
    { id: 'inventario', label: 'Inventario', icon: Package },
    { id: 'produccion', label: 'Producción', icon: Factory },
    { id: 'formulas', label: 'Reglas ETL', icon: Beaker },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Settings size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Configuración del Sistema</span>
          </div>
          <h1 className="text-4xl font-light text-slate-900 tracking-tight">Panel de Control Maestro</h1>
          <p className="text-slate-500 mt-2">Ajusta cada parámetro operativo de la herramienta Procoquinal.</p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw size={18} />
            Restablecer
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Guardar Cambios
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            Configuración guardada exitosamente. Los cambios se aplicarán en todos los módulos.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Superior Navigation Tabs */}
      <nav className="flex gap-2 overflow-x-auto pb-6 custom-scrollbar-hide h-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 font-bold scale-105 z-10' 
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-8">
        {/* Content Area */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="p-10">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'inventario' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Package size={18} className="text-indigo-500" />
                      Umbrales de Envejecimiento (Días)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ConfigInput 
                        label="Inventario Lento" 
                        description="Días para marcar como 'Lento'"
                        value={settings.inventory.slowAgingDays}
                        onChange={(v) => updateSetting('inventory', 'slowAgingDays', parseInt(v))}
                      />
                      <ConfigInput 
                        label="Inventario Silencioso" 
                        description="Días para marcar como 'Silencioso'"
                        value={settings.inventory.silentAgingDays}
                        onChange={(v) => updateSetting('inventory', 'silentAgingDays', parseInt(v))}
                      />
                      <ConfigInput 
                        label="Inventario Obsoleto" 
                        description="Días para marcar como 'Muerto'"
                        value={settings.inventory.deadAgingDays}
                        onChange={(v) => updateSetting('inventory', 'deadAgingDays', parseInt(v))}
                      />
                    </div>
                  </section>

                  <div className="h-px bg-slate-100" />

                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Clasificación ABC (Porcentaje de Valor)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ConfigInput 
                        label="Umbral Clase A" 
                        description="% de valor total acumulado"
                        value={settings.inventory.abcThresholdA}
                        suffix="%"
                        onChange={(v) => updateSetting('inventory', 'abcThresholdA', parseInt(v))}
                      />
                      <ConfigInput 
                        label="Umbral Clase B" 
                        description="% de valor adicional"
                        value={settings.inventory.abcThresholdB}
                        suffix="%"
                        onChange={(v) => updateSetting('inventory', 'abcThresholdB', parseInt(v))}
                      />
                    </div>
                  </section>

                  <div className="h-px bg-slate-100" />

                  <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <ShoppingCart size={18} className="text-indigo-600" />
                      Reglas de Facturación Especial (POS)
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Define qué familias, SKUs o descripciones requerirán que el cajero ingrese una fórmula de color en el punto de venta.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tintometricRules.map((rule, idx) => (
                        <div key={idx} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                          {rule}
                          <button 
                            onClick={() => updateTintometricRules(tintometricRules.filter(r => r !== rule))}
                            className="hover:text-rose-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newRule.trim() && !tintometricRules.includes(newRule.trim().toUpperCase())) {
                          updateTintometricRules([...tintometricRules, newRule.trim().toUpperCase()]);
                          setNewRule('');
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input 
                        type="text" 
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        placeholder="Ej: PL 900 o TINTILLA" 
                        className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                      />
                      <button 
                        type="submit" 
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                      >
                        <Plus size={16} /> Añadir Regla
                      </button>
                    </form>
                    </form>
                  </section>

                  <div className="h-px bg-slate-100 my-8" />

                  <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <ArrowRightLeft size={18} className="text-indigo-600" />
                      Reglas de Visualización Invertida (POS)
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Define qué familias, SKUs o descripciones mostrarán su nombre en la cabecera y el código en la etiqueta secundaria dentro del catálogo.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {reverseDisplayRules.map((rule, idx) => (
                        <div key={idx} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                          {rule}
                          <button 
                            onClick={() => updateReverseDisplayRules(reverseDisplayRules.filter(r => r !== rule))}
                            className="hover:text-rose-300 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newReverseRule.trim() && !reverseDisplayRules.includes(newReverseRule.trim().toUpperCase())) {
                          updateReverseDisplayRules([...reverseDisplayRules, newReverseRule.trim().toUpperCase()]);
                          setNewReverseRule('');
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <input 
                        type="text" 
                        value={newReverseRule}
                        onChange={(e) => setNewReverseRule(e.target.value)}
                        placeholder="Ej: ILVA o DIS 7771" 
                        className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                      />
                      <button 
                        type="submit" 
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors"
                      >
                        <Plus size={16} /> Añadir Regla
                      </button>
                    </form>
                  </section>
                </div>
              )}

              {activeTab === 'produccion' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Factory size={18} className="text-indigo-500" />
                      Parámetros de Planta
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ConfigInput 
                        label="Tolerancia de Merma" 
                        description="Desviación máxima permitida"
                        value={settings.production.wasteTolerancePercent}
                        suffix="%"
                        onChange={(v) => updateSetting('production', 'wasteTolerancePercent', parseFloat(v))}
                      />
                      <ConfigInput 
                        label="Costo Laboral Estándar" 
                        description="Costo por hora de mano de obra"
                        value={settings.production.standardLaborCostPerHour}
                        prefix="$"
                        onChange={(v) => updateSetting('production', 'standardLaborCostPerHour', parseFloat(v))}
                      />
                      <ConfigInput 
                        label="Tasa de Gastos Indirectos (Overhead)" 
                        description="Porcentaje sobre costo directo"
                        value={settings.production.overheadRate}
                        suffix="%"
                        onChange={(v) => updateSetting('production', 'overheadRate', parseFloat(v))}
                      />
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'formulas' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <header>
                     <h2 className="text-2xl font-black text-slate-900 flex items-center">
                        <Beaker className="w-6 h-6 mr-3 text-indigo-600" />
                        Rules Engine: Formulación y ETL
                     </h2>
                     <p className="text-slate-500 text-sm mt-1">Configura las palabras clave y matemáticas que el Asistente de Ingesta (ETL) utilizará para entender los códigos sucios de los proveedores.</p>
                  </header>

                  <section className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Database size={160} />
                    </div>
                    
                    <div className="relative z-10">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h3 className="text-xl font-black flex items-center gap-3 text-indigo-400">
                                    <div className="bg-indigo-500/20 p-2 rounded-lg">
                                        <ArrowRightLeft size={24} />
                                    </div>
                                    Master SKU Slot Builder
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Configura el ADN de tus productos. Los bloques se unirán automáticamente con el separador elegido.</p>
                            </div>
                            
                            {/* Selector de Separador */}
                            <div className="bg-slate-800 p-1.5 rounded-xl border border-slate-700 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase px-3">Separador:</span>
                                {['-', '_', '.', '/', ':'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateSetting('formulation', 'skuSeparator', s)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                                            settings.formulation.skuSeparator === s 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                            : 'text-slate-400 hover:bg-slate-700'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            {/* Área de Ensamblaje */}
                            <div className="lg:col-span-8">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Línea de Ensamblaje</span>
                                <div className="bg-slate-950/50 min-h-[100px] rounded-2xl border-2 border-dashed border-slate-800 p-6 flex flex-wrap items-center gap-3">
                                    {(settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || []).map((token, idx) => (
                                        <div key={idx} className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                            <div className="relative group/chip">
                                                <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-sm shadow-xl flex items-center gap-2 border border-indigo-400/50">
                                                    {token.replace('[','').replace(']','')}
                                                    <button 
                                                        onClick={() => {
                                                            const currentTokens = settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || [];
                                                            currentTokens.splice(idx, 1);
                                                            updateSetting('formulation', 'globalSkuPattern', currentTokens.join(''));
                                                        }}
                                                        className="hover:text-rose-300 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Separador Visual */}
                                            {idx < (settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || []).length - 1 && (
                                                <div className="text-slate-700 font-black text-xl italic">{settings.formulation.skuSeparator}</div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {/* Botón de Ayuda / Placeholder */}
                                    {(settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || []).length === 0 && (
                                        <div className="text-slate-600 text-sm italic py-2">Agrega bloques abajo para empezar a construir...</div>
                                    )}
                                </div>

                                {/* Banco de Bloques */}
                                <div className="mt-6">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Bloques Disponibles</span>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: '[BRAND]', label: 'Proveedor / Marca', icon: <Tags size={14}/> },
                                            { id: '[PREFIX]', label: 'Sector / Prefijo', icon: <Beaker size={14}/> },
                                            { id: '[ORIGINAL]', label: 'Código Original', icon: <Scale size={14}/> },
                                            { id: '[MEANING]', label: 'Significado Químico', icon: <Database size={14}/> }
                                        ].map(block => (
                                            <button
                                                key={block.id}
                                                onClick={() => {
                                                    const currentPattern = settings.formulation.globalSkuPattern;
                                                    updateSetting('formulation', 'globalSkuPattern', currentPattern + block.id);
                                                }}
                                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <Plus size={14} className="text-indigo-400" />
                                                {block.icon}
                                                {block.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Preview Master Card */}
                            <div className="lg:col-span-4 self-stretch">
                                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 h-full flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Resultado Avalon SKU</span>
                                        <div className="text-2xl font-black font-mono text-white tracking-[0.2em] break-all leading-relaxed">
                                            {(settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || []).length > 0 ? (
                                                (settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || []).map((t, i) => {
                                                    const val = t === '[BRAND]' ? 'ILVA' : t === '[PREFIX]' ? 'TZ' : t === '[ORIGINAL]' ? '110' : 'SOLVENTE';
                                                    return val + (i < (settings.formulation.globalSkuPattern.match(/\[[A-Z]+\]/g) || []).length - 1 ? settings.formulation.skuSeparator : '');
                                                })
                                            ) : (
                                                <span className="text-slate-700">ESPERANDO BLOQUES...</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-slate-800">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            Motor de Identidad Activo
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </section>

                  <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Tags size={18} className="text-indigo-600" />
                          Zona A: Mapeo de Categorías (Prefijo = Significado)
                        </h3>
                        <button 
                            onClick={handleAddVendor}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2"
                        >
                            <Plus size={16}/> Añadir Proveedor
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {settings.formulation?.vendorRules?.map((rule, idx) => (
                            <div key={rule.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                                   <div className="flex items-center gap-3">
                                       <div className="font-black text-slate-800 text-lg uppercase tracking-wider">{rule.brand}</div>
                                       <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">Categoria Base: {rule.categoryName}</div>
                                   </div>
                                   <button 
                                        onClick={() => handleRemoveVendor(rule.id)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                   >
                                        <Trash2 size={16} />
                                   </button>
                                </div>
                                
                                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto custom-scrollbar">
                                    {rule.prefixRules.map(prefixRule => (
                                        <div key={prefixRule.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded w-24 text-center text-xs font-black font-mono">
                                                    {prefixRule.prefix}
                                                </div>
                                                <div className="text-slate-400 text-xs font-bold">=</div >
                                                <div className="text-sm font-bold text-slate-700 flex-1">
                                                    {prefixRule.meaning}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveVendorPrefix(rule.id, prefixRule.id)}
                                                className="text-slate-400 hover:text-rose-500 p-1"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <form 
                                    className="flex items-center gap-2 mt-2 pt-3 border-t border-slate-100"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget as any;
                                        handleAddVendorPrefix(rule.id, form.prefix.value, form.meaning.value);
                                        form.reset();
                                    }}
                                >
                                    <input 
                                        name="prefix"
                                        type="text"
                                        placeholder="Prefijo (Ej: TX)"
                                        required
                                        className="bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 w-32 focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                    />
                                    <span className="text-slate-400 text-xs font-bold">=</span>
                                    <input 
                                        name="meaning"
                                        type="text"
                                        placeholder="Significado (Ej: Laca/Barniz)"
                                        required
                                        className="bg-slate-50 border border-slate-200 text-sm rounded px-3 py-2 flex-1 focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-slate-100 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded text-sm font-bold border border-slate-200 transition-colors flex items-center"
                                    >
                                        Añadir
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Package size={18} className="text-emerald-500" />
                          Zona B: Dimensiones U.M.
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">¿Cuántos Litros tiene un galón o cuñete?</p>
                        <div className="space-y-3">
                            {settings.formulation?.uomRules?.filter(r => r.std !== 'KG').map(uom => (
                                <div key={uom.id} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-slate-700">{uom.std}</span>
                                        <div className="text-[10px] text-slate-400 font-mono mt-1 w-32 truncate">{uom.regexTags.join(' | ')}</div>
                                    </div>
                                    <div className="flex items-center">
                                        <input 
                                            type="number"
                                            value={uom.factorToLiter}
                                            className="w-20 text-right bg-slate-50 border border-emerald-200 rounded px-2 py-1 font-bold text-emerald-700 mr-2"
                                            onChange={() => {}} // ReadOnly mockup for now
                                        />
                                        <span className="text-xs text-slate-500 font-bold">Lts</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Scale size={18} className="text-amber-500" />
                          Zona C: Densidades (KG a Lts)
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Gravedad específica para calcular consumos.</p>
                        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                             <div className="flex justify-between items-center bg-white p-3 rounded border border-amber-100 shadow-sm mb-3">
                                <div className="font-bold text-slate-700 text-sm">Resinas / Bases</div>
                                <div className="text-sm font-mono text-amber-700 font-bold">1.00 L/kg</div>
                             </div>
                             <div className="flex justify-between items-center bg-white p-3 rounded border border-amber-100 shadow-sm">
                                <div className="font-bold text-slate-700 text-sm">Catalizadores (Densos)</div>
                                <div className="text-sm font-mono text-amber-700 font-bold">0.85 L/kg</div>
                             </div>
                             <button className="w-full mt-4 py-2 border-2 border-dashed border-amber-300 text-amber-600 rounded font-bold text-sm hover:bg-amber-100 transition-colors">
                                + Añadir Familia Densidad
                             </button>
                        </div>
                      </section>
                  </div>
                </div>
              )}

              {activeTab === 'ventas' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-indigo-500" />
                      Estrategia Comercial
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ConfigInput 
                        label="Margen Objetivo Predeterminado" 
                        description="Margen mínimo esperado"
                        value={settings.sales.defaultTargetMargin}
                        suffix="%"
                        onChange={(v) => updateSetting('sales', 'defaultTargetMargin', parseFloat(v))}
                      />
                      <ConfigInput 
                        label="Descuento Cliente Estratégico" 
                        description="Descuento base para Tier Gold"
                        value={settings.sales.strategicCustomerDiscount}
                        suffix="%"
                        onChange={(v) => updateSetting('sales', 'strategicCustomerDiscount', parseFloat(v))}
                      />
                    </div>
                  </section>

                  <div className="h-px bg-slate-100" />

                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Pesos de Prioridad (ATP Allocation)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ConfigInput 
                        label="Peso Margen" 
                        description="Importancia del margen (0-1)"
                        value={settings.sales.priorityWeights.margin}
                        onChange={(v) => updateSetting('sales', 'priorityWeights', { margin: parseFloat(v) })}
                      />
                      <ConfigInput 
                        label="Peso Tier Cliente" 
                        description="Importancia del nivel de cliente"
                        value={settings.sales.priorityWeights.customerTier}
                        onChange={(v) => updateSetting('sales', 'priorityWeights', { customerTier: parseFloat(v) })}
                      />
                      <ConfigInput 
                        label="Peso Urgencia" 
                        description="Importancia de fecha requerida"
                        value={settings.sales.priorityWeights.urgency}
                        onChange={(v) => updateSetting('sales', 'priorityWeights', { urgency: parseFloat(v) })}
                      />
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'compras' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <ShoppingCart size={18} className="text-indigo-500" />
                      Gestión de Adquisiciones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ConfigInput 
                        label="Buffer Stock de Seguridad" 
                        description="Días adicionales de cobertura"
                        value={settings.purchasing.safetyStockBufferDays}
                        suffix="días"
                        onChange={(v) => updateSetting('purchasing', 'safetyStockBufferDays', parseInt(v))}
                      />
                      <ConfigInput 
                        label="Confiabilidad Mínima Proveedor" 
                        description="Score mínimo para sugerencia automática"
                        value={settings.purchasing.minVendorReliability}
                        suffix="/100"
                        onChange={(v) => updateSetting('purchasing', 'minVendorReliability', parseInt(v))}
                      />
                      <ConfigInput 
                        label="Umbral Auto-Aprobación" 
                        description="Monto máximo para aprobación directa"
                        value={settings.purchasing.autoApproveThreshold}
                        prefix="$"
                        onChange={(v) => updateSetting('purchasing', 'autoApproveThreshold', parseFloat(v))}
                      />
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'finanzas' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <DollarSign size={18} className="text-indigo-500" />
                      Contabilidad y Tesorería
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ConfigInput 
                        label="Moneda Base" 
                        description="Moneda principal del sistema"
                        value={settings.finance.currency}
                        onChange={(v) => updateSetting('finance', 'currency', v)}
                      />
                      <ConfigInput 
                        label="Tasa de Impuestos (IVA)" 
                        description="Porcentaje impositivo estándar"
                        value={settings.finance.taxRate}
                        suffix="%"
                        onChange={(v) => updateSetting('finance', 'taxRate', parseFloat(v))}
                      />
                      <ConfigInput 
                        label="Costo de Mantenimiento Anual" 
                        description="% de valor de inventario (Holding Cost)"
                        value={settings.finance.annualHoldingCostPercent}
                        suffix="%"
                        onChange={(v) => updateSetting('finance', 'annualHoldingCostPercent', parseFloat(v))}
                      />
                    </div>
                  </section>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConfigInputProps {
  label: string;
  description: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  onChange: (value: string) => void;
}

const ConfigInput: React.FC<ConfigInputProps> = ({ label, description, value, prefix, suffix, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            {prefix}
          </div>
        )}
        <input
          type={typeof value === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium uppercase">
            {suffix}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
};
