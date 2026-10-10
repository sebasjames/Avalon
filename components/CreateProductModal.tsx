import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Product, Category, InventoryStatus, ABCClass, XYZClass } from '../types';
import { 
    PackagePlus, 
    X, 
    Check, 
    AlertTriangle, 
    Sparkles, 
    Barcode, 
    DollarSign, 
    Layers, 
    FlaskConical, 
    TrendingUp, 
    Info, 
    Box, 
    Boxes,
    Tag,
    Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCOP } from '../utils/format';

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (createdProduct: Product) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { inventory, addInventoryProduct, addKardexTransaction } = useEnterprise();

    const [activeSection, setActiveSection] = useState<'BASIC' | 'TECHNICAL' | 'FINANCIAL'>('BASIC');

    // Section 1: Basic Identification
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [category, setCategory] = useState<Category>(Category.RAW_MATERIAL);
    const [family, setFamily] = useState('PIGMENTOS Y COLORANTES');
    const [brand, setBrand] = useState('Procoquinal');

    // Section 2: Technical & Mixing properties
    const [baseUnit, setBaseUnit] = useState<'GR' | 'LT' | 'GL' | 'KG' | 'UND'>('GR');
    const [density, setDensity] = useState<string>('1.00');
    const [netWeightKg, setNetWeightKg] = useState<string>('1000');
    const [mixingInstructions, setMixingInstructions] = useState('');
    const [informationalNote, setInformationalNote] = useState('');

    // Section 3: Financial & Initial Stock
    const [unitCost, setUnitCost] = useState<string>('35000');
    const [price, setPrice] = useState<string>('52000');
    const [taxRate, setTaxRate] = useState<number>(19);
    const [totalStock, setTotalStock] = useState<string>('10');
    const [minStock, setMinStock] = useState<string>('5');
    const [abcClass, setAbcClass] = useState<ABCClass>(ABCClass.A);
    const [xyzClass, setXyzClass] = useState<XYZClass>(XYZClass.X);

    // Validation
    const trimmedSku = sku.trim().toUpperCase();
    const isSkuDuplicate = useMemo(() => {
        if (!trimmedSku) return false;
        return inventory.some(p => p.sku.toUpperCase() === trimmedSku);
    }, [trimmedSku, inventory]);

    const numCost = parseFloat(unitCost) || 0;
    const numPrice = parseFloat(price) || 0;
    const grossMargin = numPrice > 0 ? ((numPrice - numCost) / numPrice) * 100 : 0;
    const profitPerUnit = numPrice - numCost;

    // Helper: Generate automatic SKU
    const handleGenerateSku = () => {
        let prefix = 'MAT';
        if (category === Category.RAW_MATERIAL || category === Category.RAW_MATERIAL_IMPORTADA) {
            if (family.toUpperCase().includes('PIGMENT')) prefix = 'PIGMENT';
            else if (family.toUpperCase().includes('BASE')) prefix = 'BASE';
            else if (family.toUpperCase().includes('SOLVENT')) prefix = 'SOLV';
            else prefix = 'MP';
        } else if (category === Category.FINISHED_GOOD) {
            prefix = 'PROD';
        } else if (category === Category.WIP) {
            prefix = 'WIP';
        }

        const cleanName = name
            .trim()
            .toUpperCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]/g, '-')
            .slice(0, 12);

        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const generated = cleanName ? `${prefix}-${cleanName}-${randomSuffix}` : `${prefix}-${Date.now().toString().slice(-6)}`;
        setSku(generated);
    };

    const isFormValid = useMemo(() => {
        return (
            trimmedSku.length >= 3 &&
            !isSkuDuplicate &&
            name.trim().length >= 3 &&
            numCost > 0 &&
            numPrice >= numCost
        );
    }, [trimmedSku, isSkuDuplicate, name, numCost, numPrice]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const initialStockQty = Math.max(0, parseInt(totalStock) || 0);
        const minStockQty = Math.max(0, parseInt(minStock) || 0);
        const netCapacity = parseFloat(netWeightKg) || (baseUnit === 'GR' ? 1000 : 1);
        const parsedDensity = parseFloat(density) || 1.0;

        const newProduct: Product = {
            id: trimmedSku.toLowerCase(),
            sku: trimmedSku,
            originalSku: trimmedSku,
            barcode: barcode.trim() || undefined,
            name: name.trim(),
            category,
            family: family.trim().toUpperCase(),
            brand: brand.trim(),
            baseUnit,
            density: parsedDensity,
            unitCost: numCost,
            price: numPrice,
            taxRate,
            totalStock: initialStockQty,
            reservedStock: 0,
            minStock: minStockQty,
            status: InventoryStatus.ACTIVE,
            abc: abcClass,
            xyz: xyzClass,
            agingDays: 0,
            batches: [],
            netWeightKg: netCapacity,
            netVolumeLiters: baseUnit === 'LT' || baseUnit === 'GL' ? netCapacity : undefined,
            mixingInstructions: mixingInstructions.trim() || undefined,
            informationalNote: informationalNote.trim() || undefined,
            labStock: 0
        };

        addInventoryProduct(newProduct);

        // Record Initial Inventory transaction in Kardex if stock > 0
        if (initialStockQty > 0) {
            const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
            addKardexTransaction({
                id: `TX-INIT-${Date.now()}`,
                date: nowStr,
                skuId: trimmedSku,
                productName: name.trim(),
                lotNumber: `LOTE-INI-${new Date().getFullYear()}`,
                type: 'Entrada',
                quantity: initialStockQty,
                balanceAfter: initialStockQty,
                unit: baseUnit,
                documentRef: 'CREACION-INVENTARIO',
                user: 'Administrador / Bodega',
                formulaName: 'Apertura de Catálogo',
                notes: `Creación de producto con saldo inicial de ${initialStockQty} unidades.`
            });
        }

        if (onSuccess) {
            onSuccess(newProduct);
        }

        handleClose();
    };

    const handleClose = () => {
        setSku('');
        setName('');
        setBarcode('');
        setCategory(Category.RAW_MATERIAL);
        setFamily('PIGMENTOS Y COLORANTES');
        setBrand('Procoquinal');
        setBaseUnit('GR');
        setDensity('1.00');
        setNetWeightKg('1000');
        setUnitCost('35000');
        setPrice('52000');
        setTotalStock('10');
        setMinStock('5');
        setActiveSection('BASIC');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[92vh]"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-indigo-50/30">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
                            <PackagePlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Crear Nuevo Producto / Insumo</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Catálogo maestro de inventario, tintometría y ficha técnica</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Section Navigation Tabs */}
                <div className="flex bg-slate-100/80 p-1.5 border-b border-slate-200 gap-1.5 px-6">
                    <button
                        type="button"
                        onClick={() => setActiveSection('BASIC')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSection === 'BASIC'
                                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Tag className="w-3.5 h-3.5" />
                        1. Identificación
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('TECHNICAL')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSection === 'TECHNICAL'
                                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <FlaskConical className="w-3.5 h-3.5" />
                        2. Ficha Técnica
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection('FINANCIAL')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            activeSection === 'FINANCIAL'
                                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        3. Precios & Stock
                    </button>
                </div>

                {/* Modal Form Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                    {/* SECTION 1: BASIC IDENTIFICATION */}
                    {activeSection === 'BASIC' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            {/* SKU with Duplicate Validation */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                        SKU / Código Único <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateSku}
                                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                                    >
                                        <Sparkles className="w-3 h-3" /> Generar sugerido
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: PIGMENT-AZUL-01 o BARNIZ-POLI-GL"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-mono text-sm font-bold text-slate-800 focus:outline-none focus:bg-white transition-all ${
                                        isSkuDuplicate 
                                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 text-rose-900 bg-rose-50/50' 
                                            : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                                    }`}
                                />
                                {isSkuDuplicate && (
                                    <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Este SKU ya existe en el inventario. Debe ser único.
                                    </p>
                                )}
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Nombre Comercial Completo <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Pigmento Azul Cobalto Super Concentrado"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>

                            {/* Category & Family */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Categoría de Inventario <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as Category)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value={Category.RAW_MATERIAL}>Materia Prima Nacional</option>
                                        <option value={Category.RAW_MATERIAL_IMPORTADA}>Materia Prima Importada</option>
                                        <option value={Category.FINISHED_GOOD}>Producto Terminado</option>
                                        <option value={Category.WIP}>En Proceso (WIP)</option>
                                        <option value={Category.HARDWARE}>Insumos y Ferretería</option>
                                        <option value={Category.SERVICE}>Servicio</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Familia Técnica <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        list="families-list"
                                        required
                                        placeholder="Ej: PIGMENTOS Y COLORANTES"
                                        value={family}
                                        onChange={(e) => setFamily(e.target.value.toUpperCase())}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                    <datalist id="families-list">
                                        <option value="PIGMENTOS Y COLORANTES" />
                                        <option value="BASES Y RESINAS" />
                                        <option value="DISOLVENTES Y SOLVENTES" />
                                        <option value="ACABADOS POLIURETANO" />
                                        <option value="CATALIZADORES Y ENDURECEDORES" />
                                        <option value="FONDOS Y PRIMERS" />
                                        <option value="MASILLAS Y SELLADORES" />
                                        <option value="PINTURAS ARQUITECTONICAS" />
                                    </datalist>
                                </div>
                            </div>

                            {/* Brand and Barcode */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Marca / Fabricante
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Procoquinal, Sayerlack"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                                        Código de Barras / EAN-13 (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 7701234567890"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION 2: TECHNICAL & CHEMICAL PROPERTIES */}
                    {activeSection === 'TECHNICAL' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/70 flex items-start gap-3">
                                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-900">
                                    <strong className="font-bold">Importante para el módulo de mezclas:</strong> La densidad y la unidad base se utilizan para calcular automáticamente las dosificaciones exactas de tintometría en gramos y litros.
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Base Unit */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Unidad Base <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={baseUnit}
                                        onChange={(e) => {
                                            const val = e.target.value as any;
                                            setBaseUnit(val);
                                            if (val === 'GR') setNetWeightKg('1000');
                                            else if (val === 'GL') setNetWeightKg('1');
                                            else if (val === 'LT') setNetWeightKg('1');
                                        }}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="GR">Gramos (GR)</option>
                                        <option value="LT">Litros (LT)</option>
                                        <option value="GL">Galón (GL)</option>
                                        <option value="KG">Kilogramos (KG)</option>
                                        <option value="UND">Unidad (UND)</option>
                                    </select>
                                </div>

                                {/* Density */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                                        <Scale className="w-3.5 h-3.5 text-indigo-500" />
                                        Densidad (Kg/L) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.1"
                                        required
                                        placeholder="1.00"
                                        value={density}
                                        onChange={(e) => setDensity(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Capacity per container */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Capacidad Tarro ({baseUnit})
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        min="1"
                                        placeholder="1000"
                                        value={netWeightKg}
                                        onChange={(e) => setNetWeightKg(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Mixing instructions */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Instrucciones de Catálisis o Mezcla (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: CAT 82 AL 50% DIS 7771 AL 25%"
                                    value={mixingInstructions}
                                    onChange={(e) => setMixingInstructions(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Informational note */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Nota Técnica de Advertencia (Opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Ej: Mantener herméticamente cerrado en mesón para evitar evaporación de solventes."
                                    value={informationalNote}
                                    onChange={(e) => setInformationalNote(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION 3: FINANCIAL & STOCK */}
                    {activeSection === 'FINANCIAL' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            {/* Financial calculations card */}
                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Margen Bruto Calculado</span>
                                    <h4 className="text-xl font-black text-emerald-800 mt-0.5">
                                        {grossMargin.toFixed(1)}%
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                                        Ganancia neta: <strong>{formatCOP(profitPerUnit)}</strong> por unidad
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Precio Final c/ IVA</span>
                                    <p className="text-base font-black text-slate-900">
                                        {formatCOP(Math.round(numPrice * (1 + taxRate / 100)))}
                                    </p>
                                </div>
                            </div>

                            {/* Cost and Price */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Costo Unitario ($ COP) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        required
                                        placeholder="35000"
                                        value={unitCost}
                                        onChange={(e) => setUnitCost(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                                    />
                                    <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                                        {formatCOP(numCost)}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Precio Venta ($ COP) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        required
                                        placeholder="52000"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white border-2 border-indigo-200 rounded-xl text-sm font-bold text-indigo-900 focus:outline-none focus:border-indigo-500"
                                    />
                                    <span className="text-[10px] text-indigo-600 font-bold mt-0.5 block">
                                        {formatCOP(numPrice)}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        IVA Aplicable
                                    </label>
                                    <select
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(Number(e.target.value))}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value={19}>19% (Tarifa General)</option>
                                        <option value={5}>5% (Tarifa Reducida)</option>
                                        <option value={0}>0% (Exento / Excluido)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price / Cost Validation Alerts */}
                            {numPrice <= 0 && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                                    <span>Validación obligatoria: El precio de venta debe ser superior a $0 COP para habilitar el producto en el POS.</span>
                                </div>
                            )}
                            {numPrice > 0 && numCost > 0 && numPrice < numCost && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                                    <span>Alerta de rentabilidad: El precio de venta no puede ser inferior al costo unitario ({formatCOP(numCost)}).</span>
                                </div>
                            )}

                            {/* Stock Initial & Safety Stock */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                                        Stock Físico Inicial (Bodega Central)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="10"
                                        value={totalStock}
                                        onChange={(e) => setTotalStock(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Tarros o unidades cerradas con las que inicia el producto.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Stock Mínimo (Punto de Reorden)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="5"
                                        value={minStock}
                                        onChange={(e) => setMinStock(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Alerta en amarillo cuando el inventario baje de este umbral.</p>
                                </div>
                            </div>

                            {/* ABC and XYZ Class */}
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Clasificación ABC (Valor)
                                    </label>
                                    <div className="flex gap-2">
                                        {[ABCClass.A, ABCClass.B, ABCClass.C].map((cls) => (
                                            <button
                                                key={cls}
                                                type="button"
                                                onClick={() => setAbcClass(cls)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                    abcClass === cls 
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                Clase {cls}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Demanda XYZ (Variabilidad)
                                    </label>
                                    <div className="flex gap-2">
                                        {[XYZClass.X, XYZClass.Y, XYZClass.Z].map((cls) => (
                                            <button
                                                key={cls}
                                                type="button"
                                                onClick={() => setXyzClass(cls)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                    xyzClass === cls 
                                                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs' 
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                Clase {cls}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Footer Controls */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                        >
                            Cancelar
                        </button>

                        <div className="flex items-center gap-2">
                            {activeSection !== 'BASIC' && (
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(prev => prev === 'FINANCIAL' ? 'TECHNICAL' : 'BASIC')}
                                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs rounded-xl"
                                >
                                    Anterior
                                </button>
                            )}

                            {activeSection !== 'FINANCIAL' ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(prev => prev === 'BASIC' ? 'TECHNICAL' : 'FINANCIAL')}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20"
                                >
                                    Siguiente paso
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                                >
                                    <Check className="w-4 h-4" />
                                    Guardar y Crear Producto
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
