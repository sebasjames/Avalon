import React, { useState, useEffect, useMemo } from 'react';
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
  Database,
  Receipt,
  Wallet,
  TableProperties,
  Users,
  Shield,
  Edit2,
  UserPlus,
  Truck,
  Sparkles,
  MapPin
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../constants';
import { SystemSettings, TaxRule, PricingRule, PaymentRule, Supplier } from '../types';
import { useEnterprise } from '../context/EnterpriseContext';

export const Configuration: React.FC = () => {
  const {
    paymentMethods, setPaymentMethods, pointsOfSale, setPointsOfSale, taxRates, setTaxRates,
    taxRules, setTaxRules, pricingRules, setPricingRules, paymentRules, setPaymentRules,
    systemUsers, addSystemUser, updateSystemUser, deleteSystemUser,
    suppliers, addSupplier, updateSupplier, deleteSupplier,
    locations, addLocation, updateLocation, deleteLocation,
    crmSettings, updateCrmSettings
  } = useEnterprise();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'inventario' | 'produccion' | 'formulas' | 'ventas' | 'compras' | 'finanzas' | 'impuestos' | 'reglas' | 'contabilidad' | 'usuarios' | 'proveedores' | 'locaciones' | 'integraciones'>('integraciones');
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({});
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationForm, setLocationForm] = useState<Partial<any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { tintometricRules, updateTintometricRules, reverseDisplayRules, updateReverseDisplayRules, litersToCunetesRules, updateLitersToCunetesRules, fractionalRules, updateFractionalRules, inventory, rawMaterialCategories, updateRawMaterialCategories, accountingShortcuts, updateAccountingShortcuts } = useEnterprise();
  const [newRule, setNewRule] = useState('');
  const [newReverseRule, setNewReverseRule] = useState('');
  const [newCuneteRule, setNewCuneteRule] = useState('');
  const [newFractionalRule, setNewFractionalRule] = useState('');
  const [newRawCategory, setNewRawCategory] = useState('');

  const [geminiKeyInput, setGeminiKeyInput] = useState(localStorage.getItem('gemini_api_key') || '');

  // RBAC State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const getSuggestions = (input: string) => {
    if (input.length < 2) return [];
    const search = input.toUpperCase();
    const results = new Set<string>();

    for (const item of inventory) {
      if (results.size >= 8) break;
      if (item.sku.toUpperCase().includes(search)) results.add(item.sku);
      if (item.name.toUpperCase().includes(search)) results.add(item.name);
      if (item.brand && item.brand.toUpperCase().includes(search)) results.add(item.brand.toUpperCase());
      if (item.family && item.family.toUpperCase().includes(search)) results.add(item.family.toUpperCase());
    }
    return Array.from(results).slice(0, 8);
  };

  const ruleSuggestions = useMemo(() => getSuggestions(newRule), [newRule, inventory]);
  const reverseRuleSuggestions = useMemo(() => getSuggestions(newReverseRule), [newReverseRule, inventory]);
  const cuneteRuleSuggestions = useMemo(() => getSuggestions(newCuneteRule), [newCuneteRule, inventory]);
  const fractionalRuleSuggestions = useMemo(() => getSuggestions(newFractionalRule), [newFractionalRule, inventory]);

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
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign },
    { id: 'contabilidad', label: 'Contabilidad', icon: Wallet },
    { id: 'impuestos', label: 'Impuestos', icon: Receipt },
    { id: 'reglas', label: 'Reglas Comerciales', icon: Tags },
    { id: 'usuarios', label: 'Usuarios y Permisos', icon: Users },
    { id: 'proveedores', label: 'Proveedores', icon: Truck },
    { id: 'locaciones', label: 'Locaciones', icon: MapPin },
    { id: 'integraciones', label: 'IA & Integraciones', icon: Sparkles },
  ];

  return (
    <div className="p-8 w-full">
      <header className="mb-8 flex justify-end items-end">

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
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all ${isActive
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
                      className="flex items-start gap-2 relative"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={newRule}
                          onChange={(e) => setNewRule(e.target.value)}
                          placeholder="Ej: PL 900 o TINTILLA"
                          className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        />
                        {ruleSuggestions.length > 0 && (
                          <ul className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                            {ruleSuggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                onClick={() => {
                                  if (!tintometricRules.includes(suggestion)) {
                                    updateTintometricRules([...tintometricRules, suggestion]);
                                  }
                                  setNewRule('');
                                }}
                                className="px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer font-medium border-b border-slate-50 last:border-0"
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors h-[38px]"
                      >
                        <Plus size={16} /> Añadir Regla
                      </button>
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
                      className="flex items-start gap-2 relative"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={newReverseRule}
                          onChange={(e) => setNewReverseRule(e.target.value)}
                          placeholder="Ej: ILVA o DIS 7771"
                          className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        />
                        {reverseRuleSuggestions.length > 0 && (
                          <ul className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                            {reverseRuleSuggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                onClick={() => {
                                  if (!reverseDisplayRules.includes(suggestion)) {
                                    updateReverseDisplayRules([...reverseDisplayRules, suggestion]);
                                  }
                                  setNewReverseRule('');
                                }}
                                className="px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer font-medium border-b border-slate-50 last:border-0"
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors h-[38px]"
                      >
                        <Plus size={16} /> Añadir Regla
                      </button>
                    </form>
                  </section>

                  <div className="h-px bg-slate-100 my-8" />

                  <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Scale size={18} className="text-indigo-600" />
                      Reglas de Conversión a Cuñetes (POS)
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Define qué familias, SKUs o descripciones habilitarán el modo de facturación en cuñetes (20 Litros) en el punto de venta.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {litersToCunetesRules.map((rule, idx) => (
                        <div key={idx} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                          {rule}
                          <button
                            onClick={() => updateLitersToCunetesRules(litersToCunetesRules.filter(r => r !== rule))}
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
                        if (newCuneteRule.trim() && !litersToCunetesRules.includes(newCuneteRule.trim().toUpperCase())) {
                          updateLitersToCunetesRules([...litersToCunetesRules, newCuneteRule.trim().toUpperCase()]);
                          setNewCuneteRule('');
                        }
                      }}
                      className="flex items-start gap-2 relative"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={newCuneteRule}
                          onChange={(e) => setNewCuneteRule(e.target.value)}
                          placeholder="Ej: TZ o PINTURA"
                          className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        />
                        {cuneteRuleSuggestions.length > 0 && (
                          <ul className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                            {cuneteRuleSuggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                onClick={() => {
                                  if (!litersToCunetesRules.includes(suggestion)) {
                                    updateLitersToCunetesRules([...litersToCunetesRules, suggestion]);
                                  }
                                  setNewCuneteRule('');
                                }}
                                className="px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer font-medium border-b border-slate-50 last:border-0"
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors h-[38px]"
                      >
                        <Plus size={16} /> Añadir Regla
                      </button>
                    </form>
                  </section>

                  <div className="h-px bg-slate-100 my-8" />

                  <section className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Scale size={18} className="text-emerald-600" />
                      Reglas de Venta Fraccionada (POS)
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Define qué familias, marcas, SKUs o nombres de productos están permitidos para venderse en cantidades decimales (ej: 2.5 Litros). Los demás serán forzados a enteros.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {fractionalRules.map((rule, idx) => (
                        <div key={idx} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                          {rule}
                          <button
                            onClick={() => updateFractionalRules(fractionalRules.filter(r => r !== rule))}
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
                        if (newFractionalRule.trim() && !fractionalRules.includes(newFractionalRule.trim().toUpperCase())) {
                          updateFractionalRules([...fractionalRules, newFractionalRule.trim().toUpperCase()]);
                          setNewFractionalRule('');
                        }
                      }}
                      className="flex items-start gap-2 relative"
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={newFractionalRule}
                          onChange={(e) => setNewFractionalRule(e.target.value)}
                          placeholder="Ej: KILO, LITRO, PL 800"
                          className="bg-white border border-slate-200 text-sm rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
                        />
                        {fractionalRuleSuggestions.length > 0 && (
                          <ul className="absolute z-50 left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                            {fractionalRuleSuggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                onClick={() => {
                                  if (!fractionalRules.includes(suggestion)) {
                                    updateFractionalRules([...fractionalRules, suggestion]);
                                  }
                                  setNewFractionalRule('');
                                }}
                                className="px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 cursor-pointer font-medium border-b border-slate-50 last:border-0"
                              >
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors h-[38px]"
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
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Beaker size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-800">Motor de Identidad y SKUs</h2>
                      <p className="text-slate-500">Configura cómo se generarán los SKUs automáticamente.</p>
                    </div>
                  </div>
                  <section>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8">
                        <div className="bg-slate-950/50 min-h-[100px] rounded-2xl border-2 border-dashed border-slate-800 p-6 flex flex-wrap items-center gap-3">
                          {(settings.formulation.globalSkuPattern.match(/\[[A-Z_]+\]/g) || []).map((token, idx) => (
                              <div key={idx} className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                                <div className="relative group/chip">
                                  <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-sm shadow-xl flex items-center gap-2 border border-indigo-400/50">
                                    {token.replace('[', '').replace(']', '')}
                                    <button
                                      onClick={() => {
                                        const currentTokens = settings.formulation.globalSkuPattern.match(/\[[A-Z_]+\]/g) || [];
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
                                {idx < (settings.formulation.globalSkuPattern.match(/\[[A-Z_]+\]/g) || []).length - 1 && (
                                  <div className="text-slate-700 font-black text-xl italic">{settings.formulation.skuSeparator}</div>
                                )}
                              </div>
                            ))}

                            {/* Botón de Ayuda / Placeholder */}
                            {(settings.formulation.globalSkuPattern.match(/\[[A-Z_]+\]/g) || []).length === 0 && (
                              <div className="text-slate-600 text-sm italic py-2">Agrega bloques abajo para empezar a construir...</div>
                            )}
                          </div>

                          {/* Banco de Bloques */}
                          <div className="mt-6">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Bloques Disponibles</span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { id: '[PQ]', label: 'Prefijo Fijo (PQ)', icon: <Factory size={14} /> },
                                { id: '[CATEGORY]', label: 'Categoría', icon: <Package size={14} /> },
                                { id: '[AUTO_NUM]', label: 'Consecutivo', icon: <TrendingUp size={14} /> },
                                { id: '[BRAND]', label: 'Proveedor / Marca', icon: <Tags size={14} /> },
                                { id: '[PREFIX]', label: 'Sector / Prefijo', icon: <Beaker size={14} /> },
                                { id: '[ORIGINAL]', label: 'Código Original', icon: <Scale size={14} /> },
                                { id: '[MEANING]', label: 'Significado Químico', icon: <Database size={14} /> }
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
                                {(settings.formulation.globalSkuPattern.match(/\[[A-Z_]+\]/g) || []).length > 0 ? (
                                  (settings.formulation.globalSkuPattern.match(/\[[A-Z_]+\]/g) || []).map((t, i) => {
                                    const val = t === '[BRAND]' ? 'ILVA' : t === '[PREFIX]' ? 'TZ' : t === '[ORIGINAL]' ? '110' : t === '[PQ]' ? 'PQ' : t === '[CATEGORY]' ? 'LIM' : t === '[AUTO_NUM]' ? '001' : 'SOLVENTE';
                                    return val + (i < (settings.formulation.globalSkuPattern.match(/\[[A-Z_]+\]/g) || []).length - 1 ? settings.formulation.skuSeparator : '');
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
                    </section>
                  </div>
                )}

              {activeTab === 'contabilidad' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-800">Contabilidad & Cuentas</h2>
                      <p className="text-slate-500">Configura los atajos contables para la Sábana General.</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <TableProperties size={20} className="text-indigo-500" />
                      Pestañas Rápidas (Sábana General)
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Selecciona cuáles métodos de pago o cuentas deseas anclar como pestañas de acceso rápido en el panel de Contabilidad.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        'Efectivo (110505)', 'Caja General (110505)', 'Caja Menor (110510)', 'Transferencia (111005)', 'Bancos (111005)', 'Nequi (112005)', 'Daviplata (112005)', 'Datáfonos (111505)',
                        'Crédito 30 días (130505)', 'Crédito 60 días (130505)', 'Crédito 90 días (130505)', 'Anticipos de Clientes (280505)',
                        'Proveedores Nacionales (220505)', 'Costos y Gastos (233595)', 'Nómina (2505)', 'Nota Crédito (4175)', 'Gastos Operativos (5195)', 'Impuestos (2365)'
                      ].map((method) => {
                        const isEnabled = accountingShortcuts?.includes(method);
                        return (
                          <div
                            key={method}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isEnabled ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 bg-white'}`}
                          >
                            <span className={`font-medium ${isEnabled ? 'text-indigo-900' : 'text-slate-700'}`}>{method}</span>

                            {/* Toggle Switch */}
                            <button
                              onClick={() => {
                                const current = accountingShortcuts || [];
                                if (isEnabled) {
                                  updateAccountingShortcuts(current.filter(s => s !== method));
                                } else {
                                  updateAccountingShortcuts([...current, method]);
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
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

                  <section>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-indigo-500" />
                      Puntos de Venta (POS)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ConfigInput
                        label="Puntos de Venta (Separados por coma)"
                        description="Sucursales o bodegas disponibles en caja"
                        value={pointsOfSale.join(', ')}
                        onChange={(v) => setPointsOfSale(v.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                      <ConfigInput
                        label="Formas de Pago (Separados por coma)"
                        description="Efectivo, Tarjeta, Créditos, etc."
                        value={paymentMethods.join(', ')}
                        onChange={(v) => setPaymentMethods(v.split(',').map(s => s.trim()).filter(Boolean))}
                      />
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'impuestos' && (
                <div className="space-y-8">
                  <section>
                    <header className="mb-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                          <Receipt size={18} className="text-indigo-500" />
                          Impuestos y Retenciones (Globales)
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Configura las tasas impositivas que el sistema usar por defecto.</p>
                      </div>
                      <button
                        onClick={() => {
                          const newId = `t${Date.now()}`;
                          setTaxRates([...taxRates, { id: newId, name: 'Nuevo Impuesto', percentage: 0, isActive: true, isDefault: false }]);
                        }}
                        className="text-sm bg-indigo-50 text-indigo-700 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                      >
                        <Plus size={16} /> Añadir Tasa
                      </button>
                    </header>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                            <th className="p-4 border-b border-slate-200">Nombre del Impuesto</th>
                            <th className="p-4 border-b border-slate-200 w-32">Porcentaje (%)</th>
                            <th className="p-4 border-b border-slate-200 w-32 text-center">Tasa por Defecto</th>
                            <th className="p-4 border-b border-slate-200 w-24 text-center">Estado</th>
                            <th className="p-4 border-b border-slate-200 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {taxRates.map((tax) => (
                            <tr key={tax.id} className="hover:bg-slate-50/50">
                              <td className="p-4">
                                <input
                                  className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-800 font-medium py-1 transition-colors"
                                  value={tax.name}
                                  onChange={(e) => setTaxRates(taxRates.map(t => t.id === tax.id ? { ...t, name: e.target.value } : t))}
                                />
                              </td>
                              <td className="p-4">
                                <div className="relative">
                                  <input
                                    type="number"
                                    className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none text-slate-800 font-bold py-1 pr-6 transition-colors"
                                    value={tax.percentage}
                                    onChange={(e) => setTaxRates(taxRates.map(t => t.id === tax.id ? { ...t, percentage: parseFloat(e.target.value) || 0 } : t))}
                                  />
                                  <span className="absolute right-2 top-1.5 text-slate-400 font-bold">%</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => {
                                    setTaxRates(taxRates.map(t => ({ ...t, isDefault: t.id === tax.id })));
                                  }}
                                  className={`px-3 py-1 text-xs font-bold rounded-full ${tax.isDefault ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >
                                  {tax.isDefault ? 'Por Defecto' : 'Marcar'}
                                </button>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setTaxRates(taxRates.map(t => t.id === tax.id ? { ...t, isActive: !t.isActive } : t))}
                                  className={`w-10 h-5 rounded-full relative transition-colors ${tax.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tax.isActive ? 'right-0.5' : 'left-0.5'}`} />
                                </button>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => setTaxRates(taxRates.filter(t => t.id !== tax.id))}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'reglas' && (
                <div className="space-y-8">
                  {/* Categorías de Materia Prima */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Categorías de Materia Prima</h2>
                    <p className="text-sm text-slate-500 mb-6">
                      Las categorías agregadas aquí serán tratadas financieramente como Materia Prima (ej. recargos en POS, fórmulas de costos).
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rawMaterialCategories.map((cat, idx) => (
                        <div key={idx} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2">
                          {cat}
                          <button
                            onClick={() => updateRawMaterialCategories(rawMaterialCategories.filter(c => c !== cat))}
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
                        if (newRawCategory.trim() && !rawMaterialCategories.includes(newRawCategory.trim())) {
                          updateRawMaterialCategories([...rawMaterialCategories, newRawCategory.trim()]);
                          setNewRawCategory('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newRawCategory}
                        onChange={(e) => setNewRawCategory(e.target.value)}
                        placeholder="Añadir Categoría..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="submit"
                        disabled={!newRawCategory.trim()}
                        className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Plus size={16} /> Añadir Categoría
                      </button>
                    </form>
                  </section>

                  {/* Reglas Fiscales */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Reglas Fiscales (Impuestos)</h2>
                        <p className="text-sm text-slate-500">Exenciones de IVA (ej. Zona Franca)</p>
                      </div>
                      <button
                        onClick={() => {
                          const name = prompt("Nombre de la regla fiscal (ej. Zona Franca):");
                          if (!name) return;
                          const rate = parseFloat(prompt("Override de IVA (%):") || "0");
                          setTaxRules([...taxRules, { id: 'TAX-' + Date.now(), name, taxRateOverride: isNaN(rate) ? 0 : rate }]);
                        }}
                        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 flex items-center gap-2"
                      >
                        <Plus size={16} /> Nueva Regla Fiscal
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Nombre</th>
                            <th className="p-4 text-right">IVA Override (%)</th>
                            <th className="p-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {taxRules.map(rule => (
                            <tr key={rule.id} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-800">{rule.name}</td>
                              <td className="p-4 font-mono text-slate-600 text-right">{rule.taxRateOverride}%</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setTaxRules(taxRules.filter(r => r.id !== rule.id))}
                                  className="text-slate-400 hover:text-red-500 p-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Reglas de Precios */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Reglas de Precios y Descuentos</h2>
                        <p className="text-sm text-slate-500">Descuentos fijos por cliente (ej. Mayorista)</p>
                      </div>
                      <button
                        onClick={() => {
                          const name = prompt("Nombre de la regla de precio (ej. Mayorista VIP):");
                          if (!name) return;
                          const pct = parseFloat(prompt("Porcentaje de descuento (%):") || "0");
                          setPricingRules([...pricingRules, { id: 'PR-' + Date.now(), name, discountPercentage: isNaN(pct) ? 0 : pct }]);
                        }}
                        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 flex items-center gap-2"
                      >
                        <Plus size={16} /> Nueva Regla Precio
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Nombre</th>
                            <th className="p-4 text-right">Descuento (%)</th>
                            <th className="p-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pricingRules.map(rule => (
                            <tr key={rule.id} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-800">{rule.name}</td>
                              <td className="p-4 font-mono text-slate-600 text-right">{rule.discountPercentage}%</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setPricingRules(pricingRules.filter(r => r.id !== rule.id))}
                                  className="text-slate-400 hover:text-red-500 p-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Reglas de Pago */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Condiciones de Crédito y Pago</h2>
                        <p className="text-sm text-slate-500">Plazos y términos (ej. 30, 60, 90 días)</p>
                      </div>
                      <button
                        onClick={() => {
                          const name = prompt("Nombre de la regla de pago (ej. Crédito 45 Días):");
                          if (!name) return;
                          const type = prompt("Tipo (CONTADO / CREDITO):", "CREDITO")?.toUpperCase();
                          if (type !== 'CONTADO' && type !== 'CREDITO') return alert("Tipo inválido. Usa CONTADO o CREDITO.");
                          let days = 0;
                          if (type === 'CREDITO') {
                            days = parseInt(prompt("Días de crédito (ej. 45):") || "0");
                          }
                          setPaymentRules([...paymentRules, { id: 'PAY-' + Date.now(), name, type: type as 'CONTADO' | 'CREDITO', days: isNaN(days) ? 0 : days }]);
                        }}
                        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 flex items-center gap-2"
                      >
                        <Plus size={16} /> Nueva Regla Pago
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-4">Nombre</th>
                            <th className="p-4 text-center">Tipo</th>
                            <th className="p-4 text-right">Días Plazo</th>
                            <th className="p-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paymentRules.map(rule => (
                            <tr key={rule.id} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-slate-800">{rule.name}</td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${rule.type === 'CONTADO' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                  {rule.type}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-slate-600 text-right">{rule.days ? `${rule.days} días` : '-'}</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setPaymentRules(paymentRules.filter(r => r.id !== rule.id))}
                                  className="text-slate-400 hover:text-red-500 p-2"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Reglas de CRM */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">Reglas Comerciales y CRM</h2>
                        <p className="text-sm text-slate-500">Configuración global de comportamiento comercial.</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Asignación Automática de Leads (Round Robin)</p>
                        <p className="text-xs text-slate-500 mt-1">Distribuye equitativamente nuevos prospectos entre comerciales</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!crmSettings.autoAssignLeads}
                          onChange={(e) => updateCrmSettings({ autoAssignLeads: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'usuarios' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <header className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-indigo-600" />
                        Usuarios del Sistema y Permisos Granulares
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">Configura quién tiene acceso al panel, su rol base y excepciones específicas de seguridad.</p>
                    </div>
                    <button
                      onClick={() => {
                        const newId = 'USR-' + Date.now();
                        addSystemUser({
                          id: newId,
                          name: 'Nuevo Usuario',
                          email: 'correo@ejemplo.com',
                          baseRole: 'Contabilidad',
                          customPermissions: {} as any
                        });
                        setEditingUserId(newId);
                      }}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <UserPlus size={18} /> Nuevo Usuario
                    </button>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Lista de Usuarios */}
                    <div className="lg:col-span-4 flex flex-col gap-3">
                      {systemUsers.map(user => (
                        <div
                          key={user.id}
                          onClick={() => setEditingUserId(user.id)}
                          className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${editingUserId === user.id ? 'border-indigo-500 bg-indigo-50 shadow-md scale-[1.02]' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-slate-800">{user.name}</h3>
                              <p className="text-xs text-slate-500 mb-2">{user.email}</p>
                              <span className="text-[10px] font-bold uppercase px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded">
                                {user.baseRole}
                              </span>
                            </div>
                            <Edit2 size={16} className={editingUserId === user.id ? 'text-indigo-500' : 'text-slate-400'} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Editor de Permisos */}
                    <div className="lg:col-span-8">
                      {editingUserId ? (() => {
                        const user = systemUsers.find(u => u.id === editingUserId);
                        if (!user) return null;
                        return (
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50 flex gap-4">
                              <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                                <input
                                  value={user.name}
                                  onChange={e => updateSystemUser(user.id, { name: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
                                <input
                                  value={user.email}
                                  onChange={e => updateSystemUser(user.id, { email: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Rol Base (Plantilla)</label>
                                <select
                                  value={user.baseRole}
                                  onChange={e => updateSystemUser(user.id, { baseRole: e.target.value as any, customPermissions: {} as any })}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="admin">Administrador General</option>
                                  <option value="manager">Gerencia / Manager</option>
                                  <option value="Comercial">Fuerza Comercial</option>
                                  <option value="Contabilidad">Contabilidad</option>
                                </select>
                              </div>
                            </div>

                            <div className="p-6">
                              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Shield size={16} className="text-indigo-500" /> Matriz de Excepciones
                                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded ml-2">Enciende o apaga permisos individuales</span>
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {[
                                  {
                                    cat: 'Operación & Logística', perms: [
                                      { id: 'VER_INVENTARIO', label: 'Ver Inventario General' },
                                      { id: 'AJUSTES_STOCK', label: 'Ajustes de Stock Manual' }
                                    ]
                                  },
                                  {
                                    cat: 'Ventas & Ingresos', perms: [
                                      { id: 'ACCESO_POS', label: 'Punto de Venta (POS)' },
                                      { id: 'VER_CRM', label: 'Acceso Completo al CRM' },
                                      { id: 'ASIGNAR_PROSPECTOS', label: 'Reasignar Prospectos entre Comerciales' }
                                    ]
                                  },
                                  {
                                    cat: 'Contabilidad', perms: [
                                      { id: 'MODULOS_FINANCIEROS', label: 'Panel Financiero' },
                                      { id: 'EXPORTAR_SIIGO', label: 'Exportación a SIIGO' },
                                      { id: 'CIERRES_CAJA', label: 'Auditar Cierres de Caja' }
                                    ]
                                  },
                                  {
                                    cat: 'Configuración', perms: [
                                      { id: 'PANEL_MAESTRO', label: 'Ver Panel de Configuración' },
                                      { id: 'GESTION_USUARIOS', label: 'Crear y Editar Usuarios' }
                                    ]
                                  }
                                ].map(group => (
                                  <div key={group.cat}>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{group.cat}</div>
                                    <div className="space-y-3">
                                      {group.perms.map(p => {
                                        const baseValue = (user.baseRole === 'admin' || user.baseRole === 'manager') ? true :
                                          (user.baseRole === 'Contabilidad' && ['VER_INVENTARIO', 'MODULOS_FINANCIEROS', 'EXPORTAR_SIIGO', 'CIERRES_CAJA'].includes(p.id)) ? true :
                                            (user.baseRole === 'Comercial' && ['ACCESO_POS', 'VER_CRM'].includes(p.id)) ? true : false;

                                        const isOverride = user.customPermissions[p.id as any] !== undefined;
                                        const finalValue = isOverride ? user.customPermissions[p.id as any] : baseValue;

                                        return (
                                          <label key={p.id} className="flex items-start gap-3 cursor-pointer group/chk">
                                            <div className="mt-0.5">
                                              <input
                                                type="checkbox"
                                                checked={finalValue}
                                                onChange={(e) => {
                                                  const newChecked = e.target.checked;
                                                  const newCustom = { ...user.customPermissions };
                                                  if (newChecked === baseValue) {
                                                    delete newCustom[p.id as any];
                                                  } else {
                                                    newCustom[p.id as any] = newChecked;
                                                  }
                                                  updateSystemUser(user.id, { customPermissions: newCustom });
                                                }}
                                                className="sr-only peer"
                                              />
                                              <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center transition-colors">
                                                {finalValue && <CheckCircle2 size={14} className="text-white" />}
                                              </div>
                                            </div>
                                            <div className="flex-1">
                                              <div className="text-sm font-bold text-slate-700 group-hover/chk:text-indigo-600 transition-colors">{p.label}</div>
                                              {isOverride && (
                                                <div className="text-[10px] font-bold text-amber-600 uppercase mt-0.5 bg-amber-50 inline-block px-1.5 rounded">
                                                  Excepción Manual
                                                </div>
                                              )}
                                            </div>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <button
                                  onClick={() => {
                                    deleteSystemUser(user.id);
                                    setEditingUserId(null);
                                  }}
                                  className="text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                                >
                                  <Trash2 size={16} /> Eliminar Usuario
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2 rounded-lg font-bold text-sm transition-colors"
                                >
                                  Cerrar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 py-20">
                          <Shield size={48} className="mb-4 text-slate-300" />
                          <p className="font-bold">Selecciona un usuario para ver o editar sus permisos</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'proveedores' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Directorio de Proveedores</h3>
                      <p className="text-sm text-slate-500">Gestione la información de sus proveedores y tiempos de entrega.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSupplierId('NEW');
                        setSupplierForm({ status: 'Activo', deliveryTimeDays: 1 });
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={16} />
                      Nuevo Proveedor
                    </button>
                  </div>

                  {editingSupplierId === 'NEW' && (
                    <div className="p-4 border border-indigo-200 bg-indigo-50/50 rounded-xl mb-6">
                      <h4 className="font-semibold text-slate-800 mb-4">Agregar Nuevo Proveedor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <input type="text" placeholder="Razón Social" className="p-2 border rounded" value={supplierForm.name || ''} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} />
                        <input type="text" placeholder="NIT" className="p-2 border rounded" value={supplierForm.nit || ''} onChange={e => setSupplierForm({ ...supplierForm, nit: e.target.value })} />
                        <input type="text" placeholder="Contacto" className="p-2 border rounded" value={supplierForm.contactName || ''} onChange={e => setSupplierForm({ ...supplierForm, contactName: e.target.value })} />
                        <input type="email" placeholder="Correo" className="p-2 border rounded" value={supplierForm.email || ''} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                        <input type="text" placeholder="Teléfono" className="p-2 border rounded" value={supplierForm.phone || ''} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                        <input type="text" placeholder="Términos (ej. 30 Días)" className="p-2 border rounded" value={supplierForm.paymentTerms || ''} onChange={e => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })} />
                        <input type="number" placeholder="Días Entrega" className="p-2 border rounded" value={supplierForm.deliveryTimeDays || ''} onChange={e => setSupplierForm({ ...supplierForm, deliveryTimeDays: parseInt(e.target.value) || 0 })} />
                        <select className="p-2 border rounded" value={supplierForm.status} onChange={e => setSupplierForm({ ...supplierForm, status: e.target.value as any })}>
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingSupplierId(null)} className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded text-sm font-medium">Cancelar</button>
                        <button
                          onClick={() => {
                            if (supplierForm.name && supplierForm.nit) {
                              addSupplier({ ...supplierForm, id: 'SUP-' + Date.now() } as Supplier);
                              setEditingSupplierId(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
                        >Guardar Proveedor</button>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
                        <tr>
                          <th className="p-3 font-semibold">Proveedor / NIT</th>
                          <th className="p-3 font-semibold">Contacto</th>
                          <th className="p-3 font-semibold">Email</th>
                          <th className="p-3 font-semibold">Teléfono</th>
                          <th className="p-3 font-semibold text-center">Términos</th>
                          <th className="p-3 font-semibold text-center">Entrega</th>
                          <th className="p-3 font-semibold text-center">Estado</th>
                          <th className="p-3 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {suppliers.map(sup => (
                          <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              {editingSupplierId === sup.id ? (
                                <div className="space-y-2">
                                  <input type="text" className="w-full p-1 text-sm border rounded" value={supplierForm.name || ''} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} />
                                  <input type="text" className="w-full p-1 text-sm border rounded" value={supplierForm.nit || ''} onChange={e => setSupplierForm({ ...supplierForm, nit: e.target.value })} />
                                </div>
                              ) : (
                                <div>
                                  <p className="font-semibold text-slate-800">{sup.name}</p>
                                  <p className="text-xs text-slate-500">NIT: {sup.nit}</p>
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {editingSupplierId === sup.id ? (
                                <input type="text" className="w-full p-1 text-sm border rounded" value={supplierForm.contactName || ''} onChange={e => setSupplierForm({ ...supplierForm, contactName: e.target.value })} />
                              ) : (
                                <span>{sup.contactName}</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500 text-xs">
                              {editingSupplierId === sup.id ? (
                                <input type="email" className="w-full p-1 text-sm border rounded" value={supplierForm.email || ''} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} />
                              ) : (
                                <span>{sup.email}</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-500 text-xs">
                              {editingSupplierId === sup.id ? (
                                <input type="text" className="w-full p-1 text-sm border rounded" value={supplierForm.phone || ''} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                              ) : (
                                <span>{sup.phone}</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {editingSupplierId === sup.id ? (
                                <input type="text" className="w-full p-1 text-sm border rounded text-center" value={supplierForm.paymentTerms || ''} onChange={e => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })} />
                              ) : (
                                <span className="px-2 py-1 bg-slate-100 rounded text-slate-700 font-medium text-xs">{sup.paymentTerms}</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {editingSupplierId === sup.id ? (
                                <input type="number" className="w-16 p-1 text-sm border rounded text-center" value={supplierForm.deliveryTimeDays || ''} onChange={e => setSupplierForm({ ...supplierForm, deliveryTimeDays: parseInt(e.target.value) || 0 })} />
                              ) : (
                                <span>{sup.deliveryTimeDays} <span className="text-slate-400 text-xs">días</span></span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {editingSupplierId === sup.id ? (
                                <select className="p-1 border rounded text-sm" value={supplierForm.status} onChange={e => setSupplierForm({ ...supplierForm, status: e.target.value as any })}>
                                  <option value="Activo">Activo</option>
                                  <option value="Inactivo">Inactivo</option>
                                </select>
                              ) : (
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${sup.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {sup.status}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {editingSupplierId === sup.id ? (
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingSupplierId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded bg-slate-100 hover:bg-slate-200">
                                    <X size={14} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateSupplier(sup.id, supplierForm);
                                      setEditingSupplierId(null);
                                    }}
                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded bg-indigo-50 hover:bg-indigo-100"
                                  >
                                    <Save size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSupplierForm(sup);
                                      setEditingSupplierId(sup.id);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded transition-colors"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('¿Eliminar proveedor?')) {
                                        deleteSupplier(sup.id);
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'locaciones' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">Bodegas y Locaciones</h3>
                      <p className="text-sm text-slate-500">Gestione sus sucursales, puntos de venta y bodegas de inventario.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingLocationId('NEW');
                        setLocationForm({ status: 'Activa', type: 'Punto de Venta' });
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={16} />
                      Nueva Locación
                    </button>
                  </div>

                  {editingLocationId === 'NEW' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <h4 className="font-semibold text-slate-800">Crear Nueva Locación</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ConfigInput
                          label="Nombre de Locación"
                          description="Ej. Sede Sur, Bodega 2"
                          value={locationForm.name || ''}
                          onChange={v => setLocationForm(prev => ({ ...prev, name: v }))}
                        />
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Tipo de Locación</label>
                          <select
                            value={locationForm.type || 'Punto de Venta'}
                            onChange={e => setLocationForm(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="Bodega Principal">Bodega Principal</option>
                            <option value="Punto de Venta">Punto de Venta</option>
                            <option value="Planta de Producción">Planta de Producción</option>
                            <option value="Bodega Satélite">Bodega Satélite</option>
                          </select>
                        </div>
                        <ConfigInput
                          label="Dirección"
                          description="Dirección física"
                          value={locationForm.address || ''}
                          onChange={v => setLocationForm(prev => ({ ...prev, address: v }))}
                        />
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Estado</label>
                          <select
                            value={locationForm.status || 'Activa'}
                            onChange={e => setLocationForm(prev => ({ ...prev, status: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="Activa">Activa</option>
                            <option value="Inactiva">Inactiva</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={() => {
                            setEditingLocationId(null);
                            setLocationForm({});
                          }}
                          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            if (!locationForm.name || !locationForm.address) return alert('Nombre y Dirección son requeridos');
                            addLocation({
                              id: `LOC-${Date.now()}`,
                              name: locationForm.name,
                              address: locationForm.address,
                              type: locationForm.type as any,
                              status: locationForm.status as any,
                            });
                            setEditingLocationId(null);
                            setLocationForm({});
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg"
                        >
                          Guardar Locación
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                          <th className="p-4 font-semibold">Nombre</th>
                          <th className="p-4 font-semibold">Tipo</th>
                          <th className="p-4 font-semibold">Dirección</th>
                          <th className="p-4 font-semibold">Estado</th>
                          <th className="p-4 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {locations.map(loc => (
                          <tr key={loc.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              {editingLocationId === loc.id ? (
                                <input
                                  type="text"
                                  className="border rounded p-1 w-full text-sm"
                                  value={locationForm.name || ''}
                                  onChange={e => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                              ) : (
                                <span className="font-medium text-slate-800">{loc.name}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingLocationId === loc.id ? (
                                <select
                                  className="border rounded p-1 w-full text-sm"
                                  value={locationForm.type || ''}
                                  onChange={e => setLocationForm(prev => ({ ...prev, type: e.target.value as any }))}
                                >
                                  <option value="Bodega Principal">Bodega Principal</option>
                                  <option value="Punto de Venta">Punto de Venta</option>
                                  <option value="Planta de Producción">Planta de Producción</option>
                                  <option value="Bodega Satélite">Bodega Satélite</option>
                                </select>
                              ) : (
                                <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{loc.type}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingLocationId === loc.id ? (
                                <input
                                  type="text"
                                  className="border rounded p-1 w-full text-sm"
                                  value={locationForm.address || ''}
                                  onChange={e => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                                />
                              ) : (
                                <span className="text-sm text-slate-600">{loc.address}</span>
                              )}
                            </td>
                            <td className="p-4">
                              {editingLocationId === loc.id ? (
                                <select
                                  className="border rounded p-1 w-full text-sm"
                                  value={locationForm.status || ''}
                                  onChange={e => setLocationForm(prev => ({ ...prev, status: e.target.value as any }))}
                                >
                                  <option value="Activa">Activa</option>
                                  <option value="Inactiva">Inactiva</option>
                                </select>
                              ) : (
                                <span className={`text-sm px-2 py-1 rounded-full ${loc.status === 'Activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {loc.status}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {editingLocationId === loc.id ? (
                                <>
                                  <button
                                    onClick={() => {
                                      updateLocation(loc.id, locationForm);
                                      setEditingLocationId(null);
                                    }}
                                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setEditingLocationId(null)}
                                    className="text-slate-500 hover:text-slate-700 text-sm"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingLocationId(loc.id);
                                      setLocationForm({ ...loc });
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('¿Seguro que desea eliminar esta locación?')) {
                                        deleteLocation(loc.id);
                                      }
                                    }}
                                    className="text-rose-600 hover:text-rose-800 text-sm font-medium"
                                  >
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'integraciones' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <header>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center">
                      <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
                      Inteligencia Artificial y APIs
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Configura las credenciales de los servicios externos y motores de Inteligencia Artificial.</p>
                  </header>

                  <section className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      Motor Cognitivo: Scarpian AI
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      Avalon AI utiliza Scarpian AI 3.6 para auditoría contable (OCR y deduplicación) y para el Chat de Inteligencia.
                      Ingresa tu API Key para activar estas funcionalidades.
                    </p>

                    <div className="flex items-end gap-4 max-w-xl">
                      <div className="flex-1 space-y-2">
                        <label className="block text-sm font-bold text-indigo-900">API Key</label>
                        <input
                          type="password"
                          placeholder="AIzaSyB..."
                          value={geminiKeyInput}
                          onChange={(e) => setGeminiKeyInput(e.target.value)}
                          className="w-full bg-white border border-indigo-200 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono"
                        />
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem('gemini_api_key', geminiKeyInput.trim());
                          alert('API Key de Gemini guardada correctamente en este navegador.');
                        }}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors h-[42px]"
                      >
                        Vincular AI
                      </button>
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
