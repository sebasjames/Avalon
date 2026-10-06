import React, { useState, useMemo } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Product, Category, MezclaOrder, MezclaStatus } from '../types';
import { HistorialMezclasModal } from './HistorialMezclasModal';
import { 
    FlaskConical,
    LayoutGrid,
    List,
    History,
    Lock,
    ShieldCheck, 
    Search, 
    Filter, 
    Scale, 
    AlertTriangle, 
    CheckCircle2, 
    Plus, 
    Trash2, 
    Package, 
    Boxes, 
    Sparkles, 
    Layers, 
    ArrowUpRight, 
    Check, 
    X,
    TrendingDown,
    PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCOP } from '../utils/format';

export const InventarioMezclas: React.FC = () => {
    const { 
        inventory, 
        updateLabStock, 
        openUnitToLab,
        mezclaOrders
    } = useEnterprise();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PIGMENTS' | 'BASES' | 'SOLVENTS'>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    
    // Modal states
    const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
    const [adjustValue, setAdjustValue] = useState<string>('');

    const [openManualModalOpen, setOpenManualModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // ID Validation Modal State
    const [authModalData, setAuthModalData] = useState<{
        product: Product;
        units: number;
        usedQty: number;
        reason: string;
    } | null>(null);
    const [operatorIdInput, setOperatorIdInput] = useState('OP-104');
    const [operatorPinInput, setOperatorPinInput] = useState('');
    const [authError, setAuthError] = useState('');
    const [manualSkuSearch, setManualSkuSearch] = useState('');
    const [selectedManualProduct, setSelectedManualProduct] = useState<Product | null>(null);
    const [manualUnitsToOpen, setManualUnitsToOpen] = useState<number>(1);
    const [usedQuantity, setUsedQuantity] = useState<string>('0');
    const [manualReason, setManualReason] = useState<string>('');
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');

    
    
    // Active Mezcla Orders currently open in KDS
    const activeMezclaOrders = useMemo(() => {
        return (mezclaOrders || []).filter(o => 
            o.status === MezclaStatus.PENDING || 
            o.status === MezclaStatus.IN_PROGRESS
        );
    }, [mezclaOrders]);

    // Inventory strictly excluding Hardware (Ferretería, lijas, brochas, herramientas)
    const nonHardwareInventory = useMemo(() => {
        return inventory.filter(p => {
            const hasStock = (p.totalStock || 0) > 0;
            const categoryStr = (p.category || '').toLowerCase();
            const familyStr = (p.family || '').toLowerCase();
            const nameStr = (p.name || '').toLowerCase();

            const isHardware = 
                p.category === Category.HARDWARE ||
                categoryStr.includes('ferret') ||
                categoryStr.includes('insumo') ||
                familyStr.includes('ferret') ||
                familyStr.includes('lija') ||
                familyStr.includes('brocha') ||
                familyStr.includes('herramient') ||
                familyStr.includes('abrasiv') ||
                familyStr.includes('cinta') ||
                familyStr.includes('seguridad') ||
                nameStr.includes('brocha') ||
                nameStr.includes('rodillo') ||
                nameStr.includes('lija') ||
                nameStr.includes('disco abrasivo');

            return hasStock && !isHardware;
        });
    }, [inventory]);

    // ONLY items that have been destapados and have remaining stock in mezclas (labStock > 0)
    const destapadosProducts = useMemo(() => {
        return inventory.filter(p => (p.labStock || 0) > 0);
    }, [inventory]);

    // Filtered list strictly within the destapados
    const filteredProducts = useMemo(() => {
        return destapadosProducts.filter(p => {
            // Text search
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  p.sku.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            // Category filter
            if (selectedCategory === 'PIGMENTS') {
                return p.sku.startsWith('PIGMENT-') || p.family?.toLowerCase().includes('pigment');
            }
            if (selectedCategory === 'BASES') {
                return p.sku.startsWith('BASE-') || p.family?.toLowerCase().includes('base');
            }
            if (selectedCategory === 'SOLVENTS') {
                return p.sku.toLowerCase().includes('solv') || p.sku.toLowerCase().includes('diluy') || p.name.toLowerCase().includes('solvente');
            }
            return true;
        });
    }, [destapadosProducts, searchTerm, selectedCategory]);

    // KPIs
    const openContainersCount = destapadosProducts.length;

    const criticalContainersCount = useMemo(() => {
        return destapadosProducts.filter(p => {
            const lab = p.labStock || 0;
            const cap = p.netWeightKg || p.netVolumeLiters || 1000;
            return (lab / cap) < 0.15; // menos del 15% restante
        }).length;
    }, [destapadosProducts]);

    const totalSealedInWarehouse = useMemo(() => {
        return destapadosProducts.reduce((acc, p) => acc + (p.totalStock || 0), 0);
    }, [destapadosProducts]);

    // Handle adjust save
    const handleSaveAdjustment = () => {
        if (!adjustModalProduct) return;
        const val = parseFloat(adjustValue);
        if (!isNaN(val) && val >= 0) {
            updateLabStock(adjustModalProduct.sku, val);
        }
        setAdjustModalProduct(null);
        setAdjustValue('');
    };

    // Handle manual open
    
    // Execute action after ID/PIN validation
    const handleConfirmAuthorizedOpen = () => {
        if (!authModalData) return;
        if (!operatorIdInput.trim()) {
            setAuthError('Debes ingresar tu ID de operador o cédula.');
            return;
        }
        if (operatorPinInput.length < 4) {
            setAuthError('El PIN de seguridad debe tener mínimo 4 dígitos.');
            return;
        }

        const operatorLabel = `${operatorIdInput.trim()} (Autorizado)`;
        const finalReason = authModalData.reason 
            ? `${authModalData.reason} | Autorizado por: ${operatorLabel}`
            : `Destape autorizado por ${operatorLabel}`;

        openUnitToLab(
            authModalData.product.sku,
            authModalData.units,
            authModalData.usedQty,
            finalReason
        );

        setAuthModalData(null);
        setOperatorPinInput('');
        setAuthError('');
    };

    const handleConfirmOpenManual = () => {
        if (!selectedManualProduct) return;
        const usedNum = Math.max(0, parseFloat(usedQuantity) || 0);

        let finalReason = '';
        if (selectedOrderId === 'OTRO') {
            finalReason = customReason.trim() || 'Ajuste / Muestra interna sin orden';
        } else if (selectedOrderId) {
            const foundOrder = activeMezclaOrders.find(o => o.id === selectedOrderId);
            if (foundOrder) {
                finalReason = `Orden #${foundOrder.id}: ${foundOrder.colorName || 'Color Especial'} (${foundOrder.clientName || 'Cliente'})`;
            } else {
                finalReason = `Orden #${selectedOrderId}`;
            }
        } else if (usedNum === 0) {
            finalReason = 'Apertura de envase sin consumo inmediato';
        } else {
            finalReason = customReason.trim() || manualReason.trim() || 'Consumo en mesón de mezclas';
        }

        // Open ID validation modal to confirm
        setAuthModalData({
            product: selectedManualProduct,
            units: manualUnitsToOpen,
            usedQty: usedNum,
            reason: finalReason
        });
        setOperatorPinInput('');
        setAuthError('');

        setOpenManualModalOpen(false);
        setSelectedManualProduct(null);
        setManualUnitsToOpen(1);
        setUsedQuantity('0');
        setSelectedOrderId('');
        setCustomReason('');
        setManualReason('');
    };

    return (
        <div className="p-6 bg-slate-50 min-h-full space-y-6">
            {/* Top Banner / Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
                        <FlaskConical className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bodega de Mezclas & Tintometría</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                Solo Productos Destapados ({openContainersCount})
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Visualización exclusiva de envases abiertos, tarros en uso y saldos disponibles en mesón de laboratorio.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setHistoryModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold transition-all shadow-2xs active:scale-95"
                    >
                        <History className="w-4 h-4 text-purple-600" />
                        Historial de Consumo
                    </button>

                    <button
                        onClick={() => setOpenManualModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Destapar Envase
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Envases Destapados</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{openContainersCount}</h3>
                        <p className="text-xs text-purple-600 font-medium mt-1">En uso actualmente</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                        <FlaskConical className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nivel Crítico (&lt;15%)</p>
                        <h3 className={`text-2xl font-extrabold mt-1 ${criticalContainersCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                            {criticalContainersCount}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Próximos a agotarse</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${criticalContainersCount > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reserva Sellada</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalSealedInWarehouse}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Tarros sellados en Bodega</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <Boxes className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Regla Antimerma</p>
                        <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            100% Activa
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Prioriza saldos abiertos</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Sparkles className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text"
                        placeholder="Buscar entre los envases destapados..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 font-medium"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setSelectedCategory('ALL')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCategory === 'ALL' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Todos ({destapadosProducts.length})
                    </button>
                    <button
                        onClick={() => setSelectedCategory('PIGMENTS')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCategory === 'PIGMENTS' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Pigmentos
                    </button>
                    <button
                        onClick={() => setSelectedCategory('BASES')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCategory === 'BASES' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Bases y Resinas
                    </button>
                    <button
                        onClick={() => setSelectedCategory('SOLVENTS')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedCategory === 'SOLVENTS' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        Solventes
                    </button>
                </div>

                {/* View Mode Toggle (Grid vs Table) */}
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            viewMode === 'grid' 
                                ? 'bg-white text-purple-700 shadow-2xs' 
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Vista Tarjetas (Cilindros de nivel)"
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span className="hidden sm:inline">Tarjetas</span>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            viewMode === 'table' 
                                ? 'bg-white text-purple-700 shadow-2xs' 
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Vista Lista / Tabla (Formato Catálogo de Inventario)"
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline">Lista</span>
                    </button>
                </div>
            </div>

            {/* Containers Cards Grid */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                    <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                        <FlaskConical className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No hay envases destapados actualmente</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
                        Aquí solo se muestran los productos que han sido destapados y tienen saldo disponible. Si inicias una mezcla o destapas un tarro manualmente, aparecerá de inmediato en este tablero.
                    </p>
                    <button
                        onClick={() => setOpenManualModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        Destapar Envase Ahora
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProducts.map(product => {
                        const labStock = product.labStock || 0;
                        const capacity = product.netWeightKg || product.netVolumeLiters || (product.baseUnit === 'GR' ? 1000 : 20);
                        const unitName = product.baseUnit || 'GR';
                        const percentage = Math.min(100, Math.max(0, Math.round((labStock / capacity) * 100)));
                        const isCritical = (labStock / capacity) < 0.15;
                        const isGood = (labStock / capacity) >= 0.40;

                        return (
                            <motion.div
                                key={product.id || product.sku}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                                    isCritical 
                                        ? 'border-amber-300 ring-1 ring-amber-300/50' 
                                        : 'border-slate-200'
                                }`}
                            >
                                {/* Card Top */}
                                <div className="p-5 pb-4">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                                    {product.sku}
                                                </span>
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                    isCritical 
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                                                    {isCritical ? 'Nivel Crítico' : 'En Uso / Destapado'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2" title={product.name}>
                                                {product.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Visual Gauge Bar */}
                                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <div>
                                                <span className="text-xs font-semibold text-slate-500 uppercase">Saldo en Mesón</span>
                                                <div className="text-2xl font-black text-slate-900 mt-0.5 flex items-baseline gap-1">
                                                    {labStock.toLocaleString('es-CO')}
                                                    <span className="text-xs font-bold text-slate-500">{unitName}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold text-slate-500 uppercase">Capacidad Envase</span>
                                                <div className="text-sm font-bold text-slate-700 mt-0.5">
                                                    {capacity.toLocaleString('es-CO')} {unitName}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden p-0.5">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isCritical 
                                                        ? 'bg-amber-500' 
                                                        : isGood 
                                                            ? 'bg-emerald-500' 
                                                            : 'bg-indigo-500'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 font-medium">
                                            <span>{percentage}% restante del envase</span>
                                            <span className="text-slate-400">
                                                {capacity > labStock ? `Consumidos ${(capacity - labStock).toLocaleString('es-CO')}${unitName}` : 'Envase completo'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Backup in central warehouse */}
                                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50/60 px-3 py-2 rounded-lg border border-slate-100">
                                        <span className="flex items-center gap-1.5 font-medium">
                                            <Boxes className="w-3.5 h-3.5 text-slate-400" />
                                            Bodega Central (Sellados):
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {product.totalStock} unidades cerradas
                                        </span>
                                    </div>
                                </div>

                                {/* Card Actions Footer */}
                                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => {
                                            setAdjustModalProduct(product);
                                            setAdjustValue(labStock.toString());
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
                                        title="Pesar envase y registrar tara real"
                                    >
                                        <Scale className="w-3.5 h-3.5" />
                                        Pesar / Ajustar
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (window.confirm(`¿Seguro que deseas vaciar/marcar como agotado el envase de ${product.name}?`)) {
                                                updateLabStock(product.sku, 0);
                                            }
                                        }}
                                        className="px-2.5 py-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
                                        title="Marcar tarro como vacío / agotado"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (product.totalStock <= 0) {
                                                alert('No hay unidades selladas disponibles en Bodega Central para destapar.');
                                                return;
                                            }
                                            setAuthModalData({
                                                product,
                                                units: 1,
                                                usedQty: 0,
                                                reason: 'Apertura de +1 tarro adicional desde mesón'
                                            });
                                            setOperatorPinInput('');
                                            setAuthError('');
                                        }}
                                        disabled={product.totalStock <= 0}
                                        className="flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                                        title="Validar ID para destapar 1 unidad adicional"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5" />
                                        +1 Tarro
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                /* Table / List View with identical format as SmartInventoryView */
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                                    <th className="p-4 w-4"></th>
                                    <th className="p-4">SKU / Producto</th>
                                    <th className="p-4">Familia / Tipo</th>
                                    <th className="p-4 text-center">Unidad</th>
                                    <th className="p-4 text-center">Saldo en Mesón</th>
                                    <th className="p-4 text-center w-40">Nivel Envase</th>
                                    <th className="p-4 text-center">Bodega Central (Sellados)</th>
                                    <th className="p-4 text-right">Valor en Mesón</th>
                                    <th className="p-4 text-center w-48">Acciones Rápidas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map(product => {
                                    const labStock = product.labStock || 0;
                                    const capacity = product.netWeightKg || product.netVolumeLiters || (product.baseUnit === 'GR' ? 1000 : 20);
                                    const unitName = product.baseUnit || 'GR';
                                    const percentLevel = Math.min(100, Math.round((labStock / capacity) * 100));
                                    const isLow = percentLevel <= 20;
                                    const unitCost = product.unitCost || 35000;
                                    const costPerUnit = capacity > 0 ? (unitCost / capacity) : 35;
                                    const totalValue = Math.round(labStock * costPerUnit);

                                    return (
                                        <tr 
                                            key={product.sku}
                                            className="hover:bg-purple-50/30 transition-colors group cursor-default"
                                        >
                                            {/* Indicator */}
                                            <td className="p-4">
                                                <div 
                                                    className={`w-2.5 h-2.5 rounded-full ${
                                                        percentLevel > 50 ? 'bg-emerald-500' : percentLevel > 20 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                                                    }`}
                                                    title={`Nivel: ${percentLevel}%`}
                                                />
                                            </td>

                                            {/* SKU / Product */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors text-sm">
                                                        {product.name}
                                                    </span>
                                                    {isLow && (
                                                        <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
                                                            Por Agotar
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                                                    <span>{product.sku}</span>
                                                    {product.brand && (
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-sans font-medium">
                                                            {product.brand}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Family */}
                                            <td className="p-4">
                                                <span className="text-xs font-medium text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg">
                                                    {product.family || product.category || 'Materia Prima'}
                                                </span>
                                            </td>

                                            {/* Base Unit */}
                                            <td className="p-4 text-center">
                                                <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                    {unitName}
                                                </span>
                                            </td>

                                            {/* Lab Stock */}
                                            <td className="p-4 text-center">
                                                <div className="font-black text-slate-900 text-sm">
                                                    {labStock} <span className="text-xs font-semibold text-slate-400">{unitName}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                    {percentLevel}% del tarro
                                                </div>
                                            </td>

                                            {/* Level Gauge Bar */}
                                            <td className="p-4">
                                                <div className="w-36 mx-auto">
                                                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                                                        <span className="font-bold text-slate-700">{percentLevel}%</span>
                                                        <span>{capacity} {unitName}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-500 ${
                                                                percentLevel > 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                                                percentLevel > 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                                'bg-gradient-to-r from-rose-500 to-rose-600'
                                                            }`}
                                                            style={{ width: `${percentLevel}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Sealed in warehouse */}
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    product.totalStock > 0 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    <Boxes className="w-3 h-3" />
                                                    {product.totalStock} {product.totalStock === 1 ? 'cerrado' : 'cerrados'}
                                                </span>
                                            </td>

                                            {/* Cost in lab */}
                                            <td className="p-4 text-right">
                                                <div className="font-bold text-xs text-slate-800">
                                                    {formatCOP(totalValue)}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    ~{formatCOP(costPerUnit)}/{unitName}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => {
                                                            setAdjustModalProduct(product);
                                                            setAdjustValue(labStock.toString());
                                                        }}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 rounded-lg text-xs font-bold transition-all shadow-2xs"
                                                        title="Pesar envase y registrar tara real"
                                                    >
                                                        <Scale className="w-3 h-3" />
                                                        Ajustar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (product.totalStock <= 0) {
                                                                alert('No hay unidades selladas disponibles en Bodega Central para destapar.');
                                                                return;
                                                            }
                                                            setAuthModalData({
                                                                product,
                                                                units: 1,
                                                                usedQty: 0,
                                                                reason: 'Apertura de +1 tarro adicional desde mesón'
                                                            });
                                                            setOperatorPinInput('');
                                                            setAuthError('');
                                                        }}
                                                        disabled={product.totalStock <= 0}
                                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                                                        title="Validar ID para destapar 1 unidad adicional"
                                                    >
                                                        <PlusCircle className="w-3 h-3" />
                                                        +1
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`¿Seguro que deseas vaciar/marcar como agotado el envase de ${product.name}?`)) {
                                                                updateLabStock(product.sku, 0);
                                                            }
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Marcar tarro como vacío / retirar del mesón"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Ajustar Saldo / Pesar */}
            <AnimatePresence>
                {adjustModalProduct && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                                            <Scale className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Pesar / Ajustar Saldo</h3>
                                            <p className="text-xs text-slate-500">Bodega de Mezclas</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setAdjustModalProduct(null)}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 mb-4">
                                    <span className="font-mono text-xs font-bold text-purple-700">{adjustModalProduct.sku}</span>
                                    <p className="font-bold text-slate-800 text-sm mt-0.5">{adjustModalProduct.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Capacidad nominal: {adjustModalProduct.netWeightKg || adjustModalProduct.netVolumeLiters || 1000} {adjustModalProduct.baseUnit || 'GR'}
                                    </p>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Cantidad Real Medida en Báscula ({adjustModalProduct.baseUnit || 'GR'})
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            value={adjustValue}
                                            onChange={(e) => setAdjustValue(e.target.value)}
                                            placeholder="Ej: 350.5"
                                            autoFocus
                                            className="w-full pl-4 pr-16 py-3 bg-white border-2 border-purple-200 focus:border-purple-600 rounded-xl text-lg font-bold text-slate-900 focus:outline-none transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                            {adjustModalProduct.baseUnit || 'GR'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Ingresa el peso neto sin el peso del tarro vacío (tara descontada). Si pones 0, el producto saldrá de este tablero.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setAdjustModalProduct(null)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveAdjustment}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all"
                                    >
                                        Guardar Saldo
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Destapar Envase Manualmente (busca en productos químicos, excluyendo ferretería) */}
            <AnimatePresence>
                {openManualModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                                            <PlusCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Destapar Envase & Registrar Consumo</h3>
                                            <p className="text-xs text-slate-500">Mueve envases sellados a mezclas y define lo consumido</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setOpenManualModalOpen(false);
                                            setSelectedManualProduct(null);
                                            setUsedQuantity('0');
                                            setManualReason('');
                                        }}
                                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Product search (No ferreteria) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                                1. Selecciona el Producto Químico / Materia Prima
                                            </label>
                                            <span className="text-[11px] text-slate-400 font-semibold">
                                                (Ferretería excluida)
                                            </span>
                                        </div>
                                        <div className="relative mb-2">
                                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por código SKU, pigmento, resina, base..."
                                                value={manualSkuSearch}
                                                onChange={(e) => setManualSkuSearch(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50 custom-scrollbar">
                                            {nonHardwareInventory
                                                .filter(p => 
                                                    p.name.toLowerCase().includes(manualSkuSearch.toLowerCase()) || 
                                                    p.sku.toLowerCase().includes(manualSkuSearch.toLowerCase()) ||
                                                    (p.family || '').toLowerCase().includes(manualSkuSearch.toLowerCase())
                                                )
                                                .slice(0, 15)
                                                .map(p => {
                                                    const isSelected = selectedManualProduct?.sku === p.sku;
                                                    const cap = p.netWeightKg || p.netVolumeLiters || (p.baseUnit === 'GR' ? 1000 : 20);
                                                    return (
                                                        <div
                                                            key={p.sku}
                                                            onClick={() => {
                                                                setSelectedManualProduct(p);
                                                                setUsedQuantity('0');
                                                            }}
                                                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                                                                isSelected 
                                                                    ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-400' 
                                                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono text-[11px] font-bold text-purple-700">{p.sku}</span>
                                                                    <span className="text-[10px] text-slate-500 font-medium">({p.totalStock} cerrados de {cap}{p.baseUnit || 'GR'})</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                                                            </div>
                                                            {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Configuration if product is selected */}
                                    {selectedManualProduct && (() => {
                                        const cap = selectedManualProduct.netWeightKg || selectedManualProduct.netVolumeLiters || (selectedManualProduct.baseUnit === 'GR' ? 1000 : 20);
                                        const unit = selectedManualProduct.baseUnit || 'GR';
                                        const totalOpened = manualUnitsToOpen * cap;
                                        const usedVal = parseFloat(usedQuantity) || 0;
                                        const remainingVal = Math.max(0, totalOpened - usedVal);

                                        return (
                                            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-4">
                                                {/* Product capacity & stock */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Capacidad por envase:</span>
                                                        <p className="text-sm font-extrabold text-purple-950">
                                                            {cap.toLocaleString('es-CO')} {unit}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">Stock cerrado en bodega:</span>
                                                        <p className="text-sm font-extrabold text-purple-950">
                                                            {selectedManualProduct.totalStock} unidades
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Units to open */}
                                                <div className="flex items-center justify-between pt-2.5 border-t border-purple-200/60">
                                                    <label className="text-xs font-bold text-purple-900">
                                                        Unidades cerradas a destapar:
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setManualUnitsToOpen(Math.max(1, manualUnitsToOpen - 1))}
                                                            className="w-7 h-7 rounded-lg bg-white border border-purple-200 font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-mono font-bold text-xs text-purple-950 px-1">
                                                            {manualUnitsToOpen} envase(s) = {totalOpened.toLocaleString('es-CO')} {unit}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setManualUnitsToOpen(Math.min(selectedManualProduct.totalStock, manualUnitsToOpen + 1))}
                                                            className="w-7 h-7 rounded-lg bg-white border border-purple-200 font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Input 1: ¿Cuánto usaste inmediatamente? */}
                                                <div className="pt-2.5 border-t border-purple-200/60 space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                            ¿Cuánto usaste o dosificaste de este envase?
                                                        </label>
                                                        <span className="text-[11px] text-purple-700 font-bold">({unit})</span>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            max={totalOpened}
                                                            value={usedQuantity}
                                                            onChange={(e) => setUsedQuantity(e.target.value)}
                                                            placeholder="0"
                                                            className="w-full pl-4 pr-16 py-2.5 bg-white border-2 border-purple-200 focus:border-purple-600 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                                            {unit}
                                                        </span>
                                                    </div>

                                                    {/* Quick shortcut buttons */}
                                                    <div className="flex items-center gap-1.5 pt-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity('0')}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            0 (Solo destapar)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity((totalOpened * 0.25).toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            25%
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity((totalOpened * 0.5).toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            50%
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity((totalOpened * 0.8).toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            80%
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUsedQuantity(totalOpened.toString())}
                                                            className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-700 hover:bg-purple-100"
                                                        >
                                                            100% (Todo)
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Visual Card: Saldo que queda en el tarro para Bodega Mezclas */}
                                                <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Saldo que quedará en el tarro</span>
                                                        <div className="text-lg font-black text-purple-900 mt-0.5 flex items-baseline gap-1">
                                                            {remainingVal.toLocaleString('es-CO')}
                                                            <span className="text-xs font-bold text-slate-500">{unit}</span>
                                                        </div>
                                                        <p className="text-[10px] text-purple-700 font-medium">
                                                            {remainingVal > 0 
                                                                ? 'Estará disponible en Bodega Mezclas para evitar abrir otro envase.' 
                                                                : 'El envase fue consumido por completo (no quedará saldo remanente).'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                                            {Math.round((remainingVal / totalOpened) * 100)}% remanente
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Selector de Mezcla / Lote Activo (Aparece cuando hay consumo > 0) */}
                                                {usedVal > 0 && (
                                                    <div className="space-y-2 pt-2 border-t border-purple-200/60">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                                ¿A qué Orden de Mezcla o Lote se cargará este gasto?
                                                            </label>
                                                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                                Requerido para costos
                                                            </span>
                                                        </div>

                                                        {activeMezclaOrders.length > 0 ? (
                                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                                                                {activeMezclaOrders.map(order => {
                                                                    const isSelected = selectedOrderId === order.id;
                                                                    const isProgress = order.status === MezclaStatus.IN_PROGRESS;
                                                                    return (
                                                                        <div
                                                                            key={order.id}
                                                                            onClick={() => {
                                                                                setSelectedOrderId(order.id);
                                                                                setCustomReason('');
                                                                            }}
                                                                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                                                                                isSelected 
                                                                                    ? 'bg-purple-100/80 border-purple-400 ring-2 ring-purple-500/20' 
                                                                                    : 'bg-white border-slate-200 hover:bg-purple-50/50'
                                                                            }`}
                                                                        >
                                                                            <div className="min-w-0 flex-1 pr-2">
                                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                                    <span className="font-mono text-xs font-bold text-purple-700">
                                                                                        #{order.id}
                                                                                    </span>
                                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                                                                        isProgress 
                                                                                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                                                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                                                    }`}>
                                                                                        {isProgress ? 'En Proceso' : 'Pendiente'}
                                                                                    </span>
                                                                                    <span className="text-xs font-bold text-slate-800 truncate">
                                                                                        {order.colorName || 'Mezcla'}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-[11px] text-slate-500 truncate">
                                                                                    Cliente: <strong className="text-slate-700">{order.clientName}</strong> — Pres: {order.presentation || 'Galón'}
                                                                                </p>
                                                                            </div>
                                                                            {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                                                                        </div>
                                                                    );
                                                                })}

                                                                {/* Option for custom reason */}
                                                                <div
                                                                    onClick={() => setSelectedOrderId('OTRO')}
                                                                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between text-xs font-bold ${
                                                                        selectedOrderId === 'OTRO' 
                                                                            ? 'bg-purple-100/80 border-purple-400 text-purple-900 ring-2 ring-purple-500/20' 
                                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    <span>+ Otro motivo / Muestra de laboratorio o ajuste sin orden</span>
                                                                    {selectedOrderId === 'OTRO' && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                                                                No hay órdenes de mezcla en proceso en este momento en el KDS. Puedes ingresar el motivo del consumo manual abajo.
                                                            </div>
                                                        )}

                                                        {/* If 'OTRO' or no active orders, show text input */}
                                                        {(selectedOrderId === 'OTRO' || activeMezclaOrders.length === 0) && (
                                                            <div className="pt-1">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Escribe el motivo del gasto (Ej: Muestra técnica, prueba de viscosidad, etc.)..."
                                                                    value={customReason}
                                                                    onChange={(e) => setCustomReason(e.target.value)}
                                                                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setOpenManualModalOpen(false);
                                            setSelectedManualProduct(null);
                                            setUsedQuantity('0');
                                            setManualReason('');
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmOpenManual}
                                        disabled={
                                            !selectedManualProduct || 
                                            selectedManualProduct.totalStock < manualUnitsToOpen ||
                                            (parseFloat(usedQuantity) > 0 && !selectedOrderId && activeMezclaOrders.length > 0) ||
                                            (parseFloat(usedQuantity) > 0 && selectedOrderId === 'OTRO' && !customReason.trim()) ||
                                            (parseFloat(usedQuantity) > (manualUnitsToOpen * (selectedManualProduct.netWeightKg || selectedManualProduct.netVolumeLiters || (selectedManualProduct.baseUnit === 'GR' ? 1000 : 20))))
                                        }
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Check className="w-4 h-4" />
                                        Confirmar y Destapar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Historial y Trazabilidad Detallado */}
            
            {/* Modal de Validación de ID / PIN de Operador */}
            <AnimatePresence>
                {authModalData && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 max-w-md w-full text-white space-y-5"
                        >
                            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/30">
                                <Lock className="w-7 h-7 text-purple-400" />
                            </div>

                            <div className="text-center space-y-1.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Control de Inventario & Auditoría
                                </span>
                                <h3 className="text-xl font-bold text-white">Validación de Identidad</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Para autorizar el destape de <strong className="text-purple-400 font-mono">{authModalData.product.sku}</strong> ({authModalData.units} envase(s)), ingresa tu ID de Operador y PIN de seguridad.
                                </p>
                            </div>

                            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        ID de Operador / Cédula
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={operatorIdInput}
                                            onChange={(e) => setOperatorIdInput(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="OP-104: Miguel Ángel (Tintometría)">OP-104: Miguel Ángel (Tintometría)</option>
                                            <option value="OP-102: Carlos Gómez (Operador KDS)">OP-102: Carlos Gómez (Operador KDS)</option>
                                            <option value="SUP-01: Supervisor de Planta">SUP-01: Supervisor de Planta</option>
                                            <option value="ALM-03: Almacenista Principal">ALM-03: Almacenista Principal</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        PIN de Seguridad (4 dígitos)
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••"
                                        value={operatorPinInput}
                                        onChange={(e) => setOperatorPinInput(e.target.value)}
                                        maxLength={6}
                                        autoFocus
                                        className="w-full text-center text-2xl tracking-[0.5em] font-mono py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-white"
                                    />
                                    {authError && (
                                        <p className="text-rose-400 text-xs font-medium text-center mt-2 flex items-center justify-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            {authError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setAuthModalData(null);
                                        setOperatorPinInput('');
                                        setAuthError('');
                                    }}
                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmAuthorizedOpen}
                                    disabled={operatorPinInput.length < 4}
                                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <ShieldCheck className="w-4 h-4" />
                                    Autorizar Apertura
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            <HistorialMezclasModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />
        </div>
    );
};
