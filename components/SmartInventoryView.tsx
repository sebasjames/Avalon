import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../context/EnterpriseContext';
import { InventoryExcelModal } from './InventoryExcelModal';
import { InventoryStatus } from '../types';
import { 
    Search, Layers, Box, Cpu, Activity, Droplet, Ghost,
    LayoutGrid, List, X, History, TrendingUp, TrendingDown, RefreshCw, AlertCircle,
    TestTube, Shield, BoxSelect, PaintBucket, Sparkles, Palette, Grid3x3, Waves, Tent, Wand2, Flame, Hexagon, Armchair, Hammer, Zap, Timer, Brush, Crown, Edit3, Save, Check, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react'; // if not installed, use framer-motion approach, but I see motion is imported in CrmFull

const getProductIcon = (product: any) => {
    const s = product.sku.toUpperCase();
    const orig = product.originalSku.toUpperCase();
    
    // Vetro specific icons
    if (s.includes('VETRO-BASIC')) return <Box className="w-6 h-6 text-slate-500" />;
    if (s.includes('VETRO-PREM')) return <Sparkles className="w-6 h-6 text-amber-500" />;
    if (s.includes('VETRO-IPT1090')) return <Layers className="w-6 h-6 text-emerald-500" />;
    if (s.includes('VETRO-COMP') || orig.includes('PRIMER VETRO')) return <TestTube className="w-6 h-6 text-cyan-600" />;

    // Procoquinal specific icons
    if (s.includes('PQPM')) return <Crown className="w-6 h-6 text-amber-500" />;
    if (s.includes('PQ-ALC') || s.includes('PQ-DIL') || s.includes('PQ-BUTYL') || s.includes('PQ-INM')) return <Droplet className="w-6 h-6 text-slate-400" />;
    if (s.includes('PQ-SC') || s.includes('PQ-FONDO')) return <Shield className="w-6 h-6 text-emerald-600" />;
    if (s.includes('PQ-LCS') || s.includes('PQ-SLC')) return <Sparkles className="w-6 h-6 text-amber-500" />;
    if (s.includes('PQ-LC')) return <PaintBucket className="w-6 h-6 text-blue-500" />;

    // ILVA specific icons
    if (s.includes('-TZ-')) return <TestTube className="w-6 h-6 text-cyan-600" />;
    if (s.includes('-TF-')) return <Shield className="w-6 h-6 text-slate-700" />;
    if (s.includes('-PA-')) return <PaintBucket className="w-6 h-6 text-indigo-500" />;
    if (s.includes('-TO-') || s.includes('-TP-')) return <Sparkles className="w-6 h-6 text-amber-500" />;
    if (s.includes('-PL-') || s.includes('-PM-') || s.includes('-PLM-')) return <Palette className="w-6 h-6 text-pink-500" />;
    if (s.includes('-TS-1555') || s.includes('-TSM-0476')) return <Flame className="w-6 h-6 text-rose-500" />;
    if (s.includes('-TS-364') || s.includes('-PFT-') || s.includes('-DOM-')) return <Brush className="w-6 h-6 text-stone-500" />;
    if (s.includes('-TM-')) return <Grid3x3 className="w-6 h-6 text-slate-600" />;
    if (s.includes('-HMM-B') || s.includes('-HMM-5457') || s.includes('-TXW-')) return <Waves className="w-6 h-6 text-blue-500" />;
    if (s.includes('-HMM-') || s.includes('-WBS-') || s.includes('-HOM-')) return <Armchair className="w-6 h-6 text-amber-700" />;
    if (s.includes('-HNS-') || s.includes('-TW-') || s.includes('-HTM-') || s.includes('-TDS-') || s.includes('-TTM-')) return <Tent className="w-6 h-6 text-emerald-600" />;
    if (s.includes('-PR-') || s.includes('-TSM-1V670') || s.includes('-PSM-') || s.includes('-PD-') || s.includes('-TOM-')) return <Wand2 className="w-6 h-6 text-purple-500" />;
    if (s.includes('-TG-') || s.includes('-PI-')) return <Hexagon className="w-6 h-6 text-orange-500" />;
    if (s.includes('-TX-9') || s.includes('-TXS-1V') || s.includes('-HXS-')) return <Zap className="w-6 h-6 text-yellow-500" />;
    if (s.includes('-TX-') || s.includes('-TXS-')) return <Hammer className="w-6 h-6 text-slate-500" />;
    if (s.includes('-TV-')) return <Timer className="w-6 h-6 text-red-500" />;
    if (s.includes('-TS-') || s.includes('-TA-') || s.includes('-TAS-')) return <BoxSelect className="w-6 h-6 text-sky-500" />;
    
    // Albaran specific icons
    if (s.includes('ALB-')) return <BoxSelect className="w-6 h-6 text-indigo-500" />;

    return <Box className="w-6 h-6 text-slate-400" />;
};

const CardSkeleton = () => (
    <div className="bg-white/50 border border-slate-200/40 rounded-3xl p-5 shadow-sm animate-pulse h-64 flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-slate-200/80 rounded-2xl"></div>
            <div className="w-3 h-3 bg-slate-200/80 rounded-full"></div>
        </div>
        <div className="mt-4">
            <div className="h-5 w-3/4 bg-slate-200/80 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-slate-200/80 rounded mb-4"></div>
        </div>
        <div className="space-y-2 mb-4 w-full">
            <div className="flex justify-between w-full">
                <div className="w-16 h-3 bg-slate-200/80 rounded"></div>
                <div className="w-12 h-3 bg-slate-200/80 rounded"></div>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-100">
            <div className="h-12 bg-slate-100 rounded-xl"></div>
            <div className="h-12 bg-slate-100 rounded-xl"></div>
        </div>
    </div>
);

const ProductDrawer = ({ product, onClose }: { product: any, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'kardex' | 'details'>('kardex');
    const navigate = useNavigate();
    const { events } = useEnterprise();

    const validTotal = product.totalStock || 1;
    const atp = product.totalStock - product.reservedStock;
    const value = (product.category === 'Materia Prima' ? product.unitCost : product.price) * product.totalStock;

    // Obtener los verdaderos del contexto, mezclados con algunos mocks de UI si está vacío
    const realEvents = events.filter(e => e.entity_id === product.sku).map((evt, idx) => ({
        id: evt.event_id,
        type: evt.event_type.includes('RESERVE') ? 'RESERVA' : evt.event_type.includes('IN') ? 'ENTRADA' : 'SALIDA',
        qty: evt.new_state?.reservedStock ? (evt.new_state.reservedStock - (evt.previous_state?.reservedStock || 0)) : (evt.new_state?.quantity || 0),
        date: new Date(evt.timestamp).toLocaleString('es-CO'),
        reason: evt.context?.reason || evt.event_type,
        user: evt.actor_id
    }));

    const mockEvents = realEvents.length > 0 ? realEvents : [
        { id: 1, type: 'ENTRADA', qty: +150, date: 'Hace 2 días', reason: 'Compra a Proveedor #1029', user: 'Carlos M.' },
        { id: 2, type: 'SALIDA', qty: -5, date: 'Hace 3 días', reason: 'Venta - Factura F-203', user: 'Sistema POS' },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 uppercase">
                                {product.abc}{product.xyz}
                            </span>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                {product.category}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mt-2">{product.name}</h2>
                        <div className="flex flex-col gap-1 mt-2">
                             <p className="text-xs font-mono text-slate-500 flex items-center gap-2">
                                <span className="font-bold text-indigo-600">AVALON SKU:</span> {product.sku}
                            </p>
                            <p className="text-xs font-mono text-slate-400 flex items-center gap-2 border-l-2 border-slate-200 pl-2 ml-1">
                                <span className="font-bold text-slate-500">ORIGINAL:</span> {product.originalSku}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors border border-slate-200 shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Stock Dashboard */}
                <div className="p-6 grid grid-cols-3 gap-3 bg-white">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <div className="text-[10px] uppercase font-bold text-indigo-500 mb-1">Stock Físico</div>
                        <div className="text-2xl font-black text-indigo-900">{product.totalStock}</div>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1">Disponible (ATP)</div>
                        <div className="text-2xl font-black text-emerald-900">{atp}</div>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                        <div className="text-[10px] uppercase font-bold text-amber-500 mb-1">Reservado</div>
                        <div className="text-2xl font-black text-amber-900">{product.reservedStock}</div>
                    </div>
                </div>

                {product.mixingInstructions && (
                    <div className="px-6 mt-4 mb-2">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                            <div className="text-[10px] text-amber-600 font-black mb-1 uppercase tracking-wider flex items-center gap-1">
                                <TestTube className="w-3 h-3" /> Nota Técnica: Mezclas
                            </div>
                            <div className="text-sm font-bold text-amber-900 mt-1">
                                {product.mixingInstructions}
                            </div>
                        </div>
                    </div>
                )}

                {product.informationalNote && (
                    <div className="px-6 mt-2 mb-2">
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
                            <div className="text-[10px] text-sky-600 font-black mb-1 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Información
                            </div>
                            <div className="text-sm font-bold text-sky-900 mt-1 whitespace-pre-line">
                                {product.informationalNote}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex border-b border-slate-200 px-6 mt-2 overflow-x-auto custom-scrollbar">
                    <button 
                        onClick={() => setActiveTab('kardex')}
                        className={`pb-3 text-sm font-bold border-b-2 px-4 whitespace-nowrap transition-colors ${activeTab === 'kardex' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Trazabilidad / Kardex
                    </button>
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`pb-3 text-sm font-bold border-b-2 px-4 whitespace-nowrap transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Análisis de Costos
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'kardex' && (
                        <div className="space-y-4 relative">
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100"></div>
                            {mockEvents.map(ev => (
                                <div key={ev.id} className="relative z-10 flex gap-4 items-start group">
                                    <div className={`p-2 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${
                                        ev.type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-600' : 
                                        ev.type === 'SALIDA' ? 'bg-rose-100 text-rose-600' : 
                                        ev.type === 'RESERVA' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {ev.type === 'ENTRADA' ? <TrendingUp className="w-4 h-4" /> : 
                                         ev.type === 'SALIDA' ? <TrendingDown className="w-4 h-4" /> : 
                                         ev.type === 'RESERVA' ? <History className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex-1 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-bold ${
                                                ev.qty > 0 ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>{ev.qty > 0 ? '+' : ''}{ev.qty} Und.</span>
                                            <span className="text-[10px] font-bold text-slate-400">{ev.date}</span>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-800">{ev.reason}</div>
                                        <div className="text-[10px] text-slate-500 mt-1 uppercase">Operador: {ev.user}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-slate-500 font-bold mb-1">Valoración Total</div>
                                    <div className="text-xl font-black text-slate-800">${value.toLocaleString('es-CO')} COP COP</div>
                                </div>
                                <Activity className="w-8 h-8 text-slate-300" />
                            </div>
                            <button 
                                onClick={() => { navigate('/intelligence'); }}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                            >
                                <Cpu className="w-4 h-4" /> Ejecutar Análisis de IA
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

const Card = ({ product, onClick }: { product: any, onClick: () => void }) => {
    const validTotal = product.totalStock || 1; 
    const atp = product.totalStock - product.reservedStock;
    const atpPercent = Math.min(100, Math.max(0, (atp / validTotal) * 100)); 
    const value = (product.category === 'Materia Prima' ? product.unitCost : product.price) * product.totalStock;
    
    let rawHealth = 100;
    if (product.status === InventoryStatus.SLOW) rawHealth -= 30;
    if (product.status === InventoryStatus.SILENT) rawHealth -= 60;
    if (product.agingDays > 90) rawHealth -= 20;
    if (atp < 0) rawHealth = 0;
    const healthScore = Math.max(0, Math.min(100, rawHealth)); 
    
    const healthColor = healthScore > 80 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-amber-500' : 'bg-rose-500';
    const shadowColor = healthScore > 80 ? 'shadow-emerald-200' : healthScore > 50 ? 'shadow-amber-200' : 'shadow-rose-200';

    return (
        <div onClick={onClick} className={`group relative bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 hover:-translate-y-1 transition-all duration-300 shadow-xl ${shadowColor} hover:shadow-2xl flex flex-col h-full cursor-pointer overflow-hidden`}>
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${healthColor}`}></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-600 group-hover:scale-110 transition-transform">
                        {getProductIcon(product)}
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {product.abc}{product.xyz}
                            </span>
                            {product.status === InventoryStatus.SILENT && (
                                <span className="text-[10px] font-bold bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200 flex items-center">
                                    <Ghost className="w-3 h-3 mr-1" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${healthColor}`}></div>
                    <div className={`absolute top-0 left-0 w-3 h-3 rounded-full ${healthColor} animate-ping opacity-50`}></div>
                </div>
            </div>

            <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 truncate relative z-10" title={product.originalSku}>
                {product.originalSku}
            </h3>
            <div className="flex flex-col mb-4 relative z-10">
                <p className="text-[10px] text-indigo-600 font-black font-mono uppercase tracking-tighter truncate" title={product.name}>{product.name}</p>
                <p className="text-[10px] text-slate-400 font-bold font-mono uppercase truncate">Avalon: {product.sku}</p>
            </div>

            <div className="space-y-1 mb-4 flex-1 relative z-10">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Nivel ATP</span>
                    <span className={atp <= 0 ? 'text-rose-500 font-bold' : 'text-slate-700'}>{atp} / {product.totalStock}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            atp <= 0 ? 'bg-rose-500' : product.status === InventoryStatus.SILENT ? 'bg-slate-300' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`} 
                        style={{ width: `${atpPercent}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100/80 relative z-10">
                <div className="bg-slate-50/50 rounded-xl p-2 text-center border border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Val.</div>
                    <div className="text-sm font-bold text-slate-700">${(value/1000).toFixed(1)}k</div>
                </div>
                <div className={`rounded-xl p-2 text-center border bg-white/50 ${
                    product.agingDays > 60 ? 'border-rose-100' : 'border-emerald-100'
                }`}>
                    <div className={`text-[10px] uppercase font-bold ${product.agingDays > 60 ? 'text-rose-400' : 'text-emerald-400'}`}>Aging</div>
                    <div className={`text-sm font-bold ${product.agingDays > 60 ? 'text-rose-600' : 'text-emerald-600'}`}>{product.agingDays}d</div>
                </div>
            </div>
        </div>
    );
};



const CheckboxDropdown = ({ title, options, selected, onChange }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`bg-white border text-xs font-bold py-2.5 px-3 rounded-xl outline-none shadow-sm h-[42px] flex items-center justify-between min-w-[140px] max-w-[180px] transition-colors ${selected.length > 0 ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
                <span className="truncate">{title} {selected.length > 0 && `(${selected.length})`}</span>
                <span className="ml-2 text-[10px] text-slate-400">▼</span>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-12 left-0 w-64 bg-white border border-slate-200 shadow-xl z-50 rounded-xl py-2 max-h-72 overflow-y-auto custom-scrollbar">
                        {options.map((opt: any) => (
                            <label key={opt.id} className={`flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm font-semibold transition-colors ${opt.colorClass ? opt.colorClass : 'text-slate-700'}`}>
                                <input 
                                    type="checkbox" 
                                    checked={selected.includes(opt.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) onChange([...selected, opt.id]);
                                        else onChange(selected.filter((x: string) => x !== opt.id));
                                    }}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                />
                                {opt.label}
                            </label>
                        ))}
                        {options.length === 0 && <div className="p-4 text-xs text-slate-400 text-center">No hay opciones</div>}
                    </div>
                </>
            )}
        </div>
    );
};

const normalizeBrand = (b?: string) => {
    if (!b) return '';
    const trimmed = b.trim();
    if (trimmed.toUpperCase() === 'PROCOQUINAL') return 'Procoquinal';
    return trimmed;
};

export const SmartInventoryView: React.FC = () => {
    const { inventory, updateInventoryProduct, tintometricRules, reverseDisplayRules, globalInventorySearch, setGlobalInventorySearch } = useEnterprise();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedRows, setEditedRows] = useState<Record<string, { totalStock?: number; price?: number; barcode?: string; taxRate?: number }>>({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
    const [authSignature, setAuthSignature] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [orderBy, setOrderBy] = useState('name_asc');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [displayLimit, setDisplayLimit] = useState(12);
    
    // UI State
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    
    // Checkbox Filters
    const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

    const availableBrands = useMemo(() => {
        const brandSet = new Set<string>();
        inventory.forEach(item => {
            const parts = item.sku.split('-');
            const size = parts[parts.length - 1];
            const sizeMatches = selectedSizes.length === 0 || selectedSizes.includes(size);
            const familyMatches = selectedFamilies.length === 0 || selectedFamilies.includes(item.family);
            
            if (sizeMatches && familyMatches && item.brand) {
                brandSet.add(normalizeBrand(item.brand));
            }
        });
        return Array.from(brandSet).sort().map(b => {
            let colorClass = '';
            if (b.toUpperCase().includes('PROCOQUINAL')) colorClass = 'text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-md px-1.5 py-0.5 shadow-sm';
            else if (b.toUpperCase().includes('PREMIUM')) colorClass = 'text-amber-700 bg-amber-50 border border-amber-200/60 rounded-md px-1.5 py-0.5 shadow-sm';
            else if (b.toUpperCase().includes('SAYERLACK')) colorClass = 'text-sky-700 bg-sky-50 border border-sky-200/60 rounded-md px-1.5 py-0.5 shadow-sm';
            return { id: b, label: b, colorClass };
        });
    }, [inventory, selectedFamilies, selectedSizes]);

    const availableSizes = useMemo(() => {
        const sizeSet = new Set<string>();
        inventory.forEach(item => {
            const nBrand = normalizeBrand(item.brand);
            const brandMatches = selectedBrands.length === 0 || selectedBrands.includes(nBrand);
            const familyMatches = selectedFamilies.length === 0 || selectedFamilies.includes(item.family);
            
            if (brandMatches && familyMatches) {
                const parts = item.sku.split('-');
                const size = parts[parts.length - 1];
                if (size && !size.includes('IL')) sizeSet.add(size);
            }
        });
        return Array.from(sizeSet).sort().map(s => ({ id: s, label: s }));
    }, [inventory, selectedBrands, selectedFamilies]);

    const availableFamilies = useMemo(() => {
        const familySet = new Set<string>();
        inventory.forEach(item => {
            const nBrand = normalizeBrand(item.brand);
            const brandMatches = selectedBrands.length === 0 || selectedBrands.includes(nBrand);
            const parts = item.sku.split('-');
            const size = parts[parts.length - 1];
            const sizeMatches = selectedSizes.length === 0 || selectedSizes.includes(size);
            
            if (brandMatches && sizeMatches && item.family && item.family.trim() !== '') {
                familySet.add(item.family.trim());
            }
        });
        return Array.from(familySet).sort().map(f => ({ id: f, label: f }));
    }, [inventory, selectedBrands, selectedSizes]);

    useEffect(() => {
        setSelectedBrands(prev => {
            const filtered = prev.filter(id => availableBrands.some(a => a.id === id));
            return filtered.length !== prev.length ? filtered : prev;
        });
    }, [availableBrands]);

    useEffect(() => {
        setSelectedFamilies(prev => {
            const filtered = prev.filter(id => availableFamilies.some(a => a.id === id));
            return filtered.length !== prev.length ? filtered : prev;
        });
    }, [availableFamilies]);

    useEffect(() => {
        setSelectedSizes(prev => {
            const filtered = prev.filter(id => availableSizes.some(a => a.id === id));
            return filtered.length !== prev.length ? filtered : prev;
        });
    }, [availableSizes]);

    useEffect(() => {
        const loadTimer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(loadTimer);
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setSearch(searchInput);
            setDisplayLimit(viewMode === 'grid' ? 12 : 50); // Mismo para tabla pero más alto
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchInput, viewMode]);

    // Sync with global search from header
    useEffect(() => {
        if (globalInventorySearch !== undefined && globalInventorySearch !== searchInput) {
            setSearchInput(globalInventorySearch);
        }
    }, [globalInventorySearch]);

    const setSearchInputRef = useRef(setSearchInput);
    const setGlobalSearchRef = useRef(setGlobalInventorySearch);

    useEffect(() => {
        setSearchInputRef.current = setSearchInput;
        setGlobalSearchRef.current = setGlobalInventorySearch;
    }, [setSearchInput, setGlobalInventorySearch]);

    // --- GLOBAL BARCODE SCANNER LISTENER ---
    useEffect(() => {
        let barcodeBuffer = '';
        let lastKeyTime = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                if (e.target.type !== 'text') return;
            }

            const now = Date.now();
            if (now - lastKeyTime > 60) {
                barcodeBuffer = '';
            }

            if (e.key === 'Enter' && barcodeBuffer.length > 5) {
                const found = inventory.find(p => p.barcode === barcodeBuffer);
                if (found) {
                    setSearchInputRef.current(barcodeBuffer);
                    setGlobalSearchRef.current(barcodeBuffer);
                    e.preventDefault();
                }
                barcodeBuffer = '';
            } else if (e.key.length === 1) {
                barcodeBuffer += e.key;
            }
            lastKeyTime = now;
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inventory]);

    const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchInput(val);
        setGlobalInventorySearch(val);
    };

    const filteredData = useMemo(() => {
        let result = inventory.filter(item => {
            if (filter !== 'ALL') {
                if (['A', 'B', 'C'].includes(filter)) {
                    if (item.abc !== filter) return false;
                } else if (item.status !== filter) {
                    return false;
                }
            }

            if (selectedFamilies.length > 0) {
                if (!selectedFamilies.includes(item.family)) return false;
            }

            if (selectedBrands.length > 0) {
                const nBrand = normalizeBrand(item.brand);
                if (!selectedBrands.includes(nBrand)) return false;
            }

            if (selectedSizes.length > 0) {
                const sizePart = item.sku.split('-').pop() || '';
                if (!selectedSizes.includes(sizePart)) return false;
            }

            return true;
        });

        const matchesSearch = (item: any) => {
            if (!search) return true;
            const s = search.toLowerCase();
            if ((s.includes('albaran') || s.includes('albarran')) && item.sku.startsWith('ALB-')) return true;
            return item.name.toLowerCase().includes(s) || 
                   item.sku.toLowerCase().includes(s) ||
                   (item.originalSku && item.originalSku.toLowerCase().includes(s)) ||
                   (item.barcode && item.barcode.toLowerCase().includes(s));
        };
        result = result.filter(matchesSearch);

        result.sort((a, b) => {
            switch(orderBy) {
                case 'name_asc': return a.name.localeCompare(b.name);
                case 'name_desc': return b.name.localeCompare(a.name);
                case 'stock_desc': return b.totalStock - a.totalStock;
                case 'stock_asc': return a.totalStock - b.totalStock;
                case 'value_desc': {
                    const valA = (a.category === 'Materia Prima' ? a.unitCost : a.price) * a.totalStock;
                    const valB = (b.category === 'Materia Prima' ? b.unitCost : b.price) * b.totalStock;
                    return valB - valA;
                }
                case 'atp_asc': {
                     const atpA = a.totalStock - a.reservedStock;
                     const atpB = b.totalStock - b.reservedStock;
                     return atpA - atpB;
                }
                default: return 0;
            }
        });

        return result;
    }, [filter, search, inventory, orderBy, selectedFamilies, selectedSizes, selectedBrands]);

    const handleSaveEdits = () => {
        const hasChanges = Object.keys(editedRows).some(id => {
            const product = inventory.find(p => p.id === id);
            if (!product) return false;
            const updates = editedRows[id];
            return (updates.totalStock !== undefined && updates.totalStock !== product.totalStock) ||
                   (updates.price !== undefined && updates.price !== product.price) ||
                   (updates.barcode !== undefined && updates.barcode !== product.barcode) ||
                   (updates.taxRate !== undefined && updates.taxRate !== product.taxRate);
        });

        if (hasChanges) {
            setSelectedChanges(Object.keys(editedRows));
            setAuthSignature('');
            setShowReviewModal(true);
        } else {
            setIsEditing(false);
            setEditedRows({});
        }
    };

    const confirmAndSaveEdits = () => {
        selectedChanges.forEach(id => {
            const updates = editedRows[id];
            updateInventoryProduct(id, updates);
        });
        setEditedRows({});
        setIsEditing(false);
        setShowReviewModal(false);
    };

    return (
        <div className="h-full flex flex-col relative w-full pt-2">
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="flex flex-col xl:flex-row justify-between items-center mb-4 gap-4 bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm">

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Vista Holográfica"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Data Grid"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden px-3">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Escanear SKU..." 
                                value={searchInput}
                                onChange={handleLocalSearchChange}
                                className="px-3 py-2.5 bg-transparent text-sm font-medium text-slate-700 outline-none w-32 sm:w-48 lg:w-56 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

                        <CheckboxDropdown 
                            title="Proveedor" 
                            options={availableBrands} 
                            selected={selectedBrands} 
                            onChange={setSelectedBrands} 
                        />

                        <CheckboxDropdown 
                            title="Categorías" 
                            options={availableFamilies} 
                            selected={selectedFamilies} 
                            onChange={setSelectedFamilies} 
                        />
                        
                        <CheckboxDropdown 
                            title="Tamaños / Envasado" 
                            options={availableSizes} 
                            selected={selectedSizes} 
                            onChange={setSelectedSizes} 
                        />
                        
                        <select 
                            value={filter} 
                            onChange={(e) => { setFilter(e.target.value); setDisplayLimit(viewMode==='grid'?12:50); }}
                            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl outline-none shadow-sm h-[42px]"
                        >
                            <option value="ALL">Filtro: Todo</option>
                            <option value="Activo">Estado: Activo</option>
                            <option value="Silencioso">Estado: Silencioso</option>
                            <option value="Lento">Estado: Lento</option>
                            <option value="A">Clase A</option>
                            <option value="B">Clase B</option>
                            <option value="C">Clase C</option>
                        </select>

                        <select 
                            value={orderBy} 
                            onChange={(e) => setOrderBy(e.target.value)}
                            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl outline-none shadow-sm h-[42px]"
                        >
                            <option value="name_asc">Orden: Nombre (A-Z)</option>
                            <option value="name_desc">Orden: Nombre (Z-A)</option>
                            <option value="stock_desc">Orden: Mayor Stock Físico</option>
                            <option value="stock_asc">Orden: Menor Stock Físico</option>
                            <option value="value_desc">Orden: Mayor Valor</option>
                            <option value="atp_asc">Orden: Menor ATP (Crítico)</option>
                        </select>
                        {viewMode === 'table' && (
                            <div className="flex items-center gap-2 ml-auto">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSaveEdits} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors h-[42px]">
                                            <Save className="w-4 h-4" /> Guardar
                                        </button>
                                        <button onClick={() => {setIsEditing(false); setEditedRows({});}} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors h-[42px]">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setShowExcelModal(true)} className="flex items-center justify-center w-[42px] h-[42px] bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 shadow-sm transition-colors" title="Auditoría Excel">
                                            <FileSpreadsheet className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 shadow-sm transition-colors h-[42px]">
                                            <Edit3 className="w-4 h-4" /> Editar Precios/Stock
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                    {!isLoading && filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500 h-full min-h-[350px]">
                            <div className="bg-slate-100 p-6 rounded-full mb-6 relative">
                                <Search className="w-12 h-12 text-slate-300" />
                                <div className="absolute top-0 right-0 bg-white rounded-full">
                                    <AlertCircle className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">No se encontraron resultados para este tipo de busqueda</h3>
                            <p className="text-sm mt-2 text-slate-500 max-w-sm text-center">Prueba quitando las restricciones en las categorías y tamaños, o asegúrate de que el producto exista en el inventario.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-1">
                                {isLoading ? (
                                    Array.from({ length: 10 }).map((_, idx) => <CardSkeleton key={idx} />)
                                ) : (
                                    filteredData.slice(0, displayLimit).map((product, idx) => (
                                        <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (idx % 12) * 0.05 }}>
                                            <Card product={product} onClick={() => setSelectedProduct(product)} />
                                        </motion.div>
                                    ))
                                )}
                            </div>
                            {!isLoading && filteredData.length > displayLimit && (
                                <div className="flex justify-center mt-8">
                                    <button 
                                        onClick={() => setDisplayLimit(d => d + 12)}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                                    >
                                        <Layers className="w-4 h-4 text-indigo-500" /> Cargar Más
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Data Grid View */
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                                            <th className="p-4 w-4"></th>
                                            <th className="p-4">SKU / Producto</th>
                                            <th className="p-4 text-center">Barcode</th>
                                            <th className="p-4 text-center">Clase</th>
                                            <th className="p-4 text-center">Físico</th>
                                            <th className="p-4 text-center text-indigo-600">Precio Unit.</th>
                                            <th className="p-4 text-center">IVA %</th>
                                            <th className="p-4 text-center">Reservado</th>
                                            <th className="p-4 text-center text-indigo-600">ATP (Disp)</th>
                                            <th className="p-4 text-right">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            Array.from({ length: 15 }).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={9} className="p-4 h-16 bg-slate-50/50"></td>
                                                </tr>
                                            ))
                                        ) : (
                                            filteredData.slice(0, displayLimit).map((product) => {
                                                const atp = product.totalStock - product.reservedStock;
                                                const val = (product.category === 'Materia Prima' ? product.unitCost : product.price) * product.totalStock;
                                                return (
                                                    <tr 
                                                        key={product.id} 
                                                        onClick={() => !isEditing && setSelectedProduct(product)}
                                                        className="hover:bg-slate-50 cursor-pointer transition-colors group"
                                                    >
                                                        <td className="p-4">
                                                            <div className={`w-2 h-2 rounded-full ${atp <= 0 ? 'bg-rose-500' : atp < 10 ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{product.name}</div>
                                                            <div className="text-xs font-mono text-slate-400">{product.sku}</div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="text" 
                                                                    className="w-24 text-center border border-indigo-300 rounded px-1 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-mono text-xs"
                                                                    placeholder="Escanear..."
                                                                    value={editedRows[product.id]?.barcode ?? product.barcode ?? ''}
                                                                    onChange={(e) => setEditedRows(prev => ({ ...prev, [product.id]: { ...prev[product.id], barcode: e.target.value } }))}
                                                                    onClick={e => e.stopPropagation()}
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-mono text-slate-500">{product.barcode || '-'}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className="text-[10px] bg-slate-100 font-bold px-2 py-1 rounded text-slate-600">
                                                                {product.abc}{product.xyz}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center font-semibold text-slate-600">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="number" 
                                                                    className="w-20 text-center border border-indigo-300 rounded px-1 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                                    value={editedRows[product.id]?.totalStock ?? product.totalStock}
                                                                    onChange={(e) => setEditedRows(prev => ({ ...prev, [product.id]: { ...prev[product.id], totalStock: Number(e.target.value) } }))}
                                                                    onClick={e => e.stopPropagation()}
                                                                />
                                                            ) : (
                                                                product.totalStock
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center font-semibold text-indigo-600">
                                                            {isEditing ? (
                                                                <input 
                                                                    type="number" 
                                                                    className="w-24 text-center border border-indigo-300 rounded px-1 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                                    value={editedRows[product.id]?.price ?? product.price}
                                                                    onChange={(e) => setEditedRows(prev => ({ ...prev, [product.id]: { ...prev[product.id], price: Number(e.target.value) } }))}
                                                                    onClick={e => e.stopPropagation()}
                                                                />
                                                            ) : (
                                                                `$${(product.price || 0).toLocaleString('es-CO')}`
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center font-semibold text-slate-600">
                                                            {isEditing ? (
                                                                <select 
                                                                    className="w-16 text-center border border-indigo-300 rounded px-1 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                                    value={editedRows[product.id]?.taxRate ?? product.taxRate ?? 19}
                                                                    onChange={(e) => setEditedRows(prev => ({ ...prev, [product.id]: { ...prev[product.id], taxRate: Number(e.target.value) } }))}
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    <option value={19}>19%</option>
                                                                    <option value={5}>5%</option>
                                                                    <option value={0}>0%</option>
                                                                </select>
                                                            ) : (
                                                                `${product.taxRate ?? 19}%`
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-center font-semibold text-amber-600">{product.reservedStock}</td>
                                                        <td className="p-4 text-center font-black text-indigo-600 bg-indigo-50/30">{atp}</td>
                                                        <td className="p-4 text-right font-bold text-slate-700">${val.toLocaleString('es-CO')} COP</td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {!isLoading && filteredData.length > displayLimit && (
                                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                                    <button 
                                        onClick={() => setDisplayLimit(d => d + 50)} 
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                                    >
                                        Cargar 50 filas más...
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <AnimatePresence>
                <InventoryExcelModal 
                    isOpen={showExcelModal} 
                    onClose={() => setShowExcelModal(false)} 
                    data={filteredData} 
                />
                {selectedProduct && (
                    <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />
                )}
                {showReviewModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-400" />
                                    Auditoría de Cambios
                                </h3>
                                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 flex-1 overflow-y-auto">
                                <div className="mb-4 flex justify-between items-center">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                                            checked={selectedChanges.length > 0 && selectedChanges.length === Object.keys(editedRows).length}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedChanges(Object.keys(editedRows));
                                                else setSelectedChanges([]);
                                            }}
                                        />
                                        Seleccionar Todos
                                    </label>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        {selectedChanges.length} / {Object.keys(editedRows).length} Cambios
                                    </span>
                                </div>
                                
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="p-3 w-10"></th>
                                                <th className="p-3 font-bold text-slate-600">Producto</th>
                                                <th className="p-3 font-bold text-slate-600 text-center">Antes ❌</th>
                                                <th className="p-3 font-bold text-slate-600 text-center">Después ✅</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {Object.entries(editedRows).map(([id, updates]) => {
                                                const product = inventory.find(p => p.id === id);
                                                if (!product) return null;
                                                
                                                const hasStockChange = updates.totalStock !== undefined && updates.totalStock !== product.totalStock;
                                                const hasPriceChange = updates.price !== undefined && updates.price !== product.price;
                                                const hasBarcodeChange = updates.barcode !== undefined && updates.barcode !== product.barcode;
                                                const hasTaxChange = updates.taxRate !== undefined && updates.taxRate !== product.taxRate;
                                                
                                                if (!hasStockChange && !hasPriceChange && !hasBarcodeChange && !hasTaxChange) return null;
                                                
                                                const isSelected = selectedChanges.includes(id);
                                                
                                                return (
                                                    <tr key={id} className={`hover:bg-slate-50 transition-colors ${!isSelected ? 'opacity-50 grayscale' : ''}`}>
                                                        <td className="p-3 text-center">
                                                            <input 
                                                                type="checkbox"
                                                                className="rounded text-indigo-600 w-4 h-4 cursor-pointer"
                                                                checked={isSelected}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) setSelectedChanges(prev => [...prev, id]);
                                                                    else setSelectedChanges(prev => prev.filter(x => x !== id));
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="font-bold text-slate-800 text-xs">{product.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{product.sku}</div>
                                                        </td>
                                                        <td className="p-3 text-center text-rose-500 font-medium">
                                                            {hasStockChange && <div>{product.totalStock} ud.</div>}
                                                            {hasPriceChange && <div>${(product.price||0).toLocaleString('es-CO')}</div>}
                                                            {hasBarcodeChange && <div className="text-xs text-slate-500">{product.barcode || 'Sin Barcode'}</div>}
                                                        </td>
                                                        <td className="p-3 text-center text-emerald-600 font-bold">
                                                            {hasStockChange && <div>{updates.totalStock} ud.</div>}
                                                            {hasPriceChange && <div>${(updates.price||0).toLocaleString('es-CO')}</div>}
                                                            {hasBarcodeChange && <div className="text-xs text-indigo-600">{updates.barcode || 'Sin Barcode'}</div>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-200">
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase text-center">Firma de Autorización (ID de Operador)</label>
                                <input 
                                    type="password" 
                                    placeholder="Ingrese su código ID..."
                                    value={authSignature}
                                    onChange={(e) => setAuthSignature(e.target.value)}
                                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4 font-mono text-center tracking-widest text-lg"
                                />
                                <button 
                                    onClick={confirmAndSaveEdits}
                                    disabled={selectedChanges.length === 0 || authSignature.trim().length < 3}
                                    className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                                        selectedChanges.length > 0 && authSignature.trim().length >= 3
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Check className="w-5 h-5" /> Ejecutar Cambios Autorizados
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};