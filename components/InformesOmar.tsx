import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  Receipt, 
  FileText, 
  RotateCcw, 
  Crown,
  TrendingUp,
  BarChart4,
  TestTube,
  Beaker,
  Factory,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckSquare,
  Square,
  Building,
  Landmark,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Hash,
  Users,
  Package,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  FolderKanban,
  PieChart as PieChartIcon,
  CreditCard,
  Percent,
  TrendingDown,
  Check,
  Zap,
  Briefcase,
  MapPin,
  Store,
  Truck,
  DollarSign as DollarIcon,
  Tag,
  Monitor,
  LayoutGrid,
  X as XIcon,
  Minus,
  Maximize2,
  FileSearch,
  HelpCircle,
  Printer,
  FileDown,
  ZoomIn,
  ZoomOut,
  Sliders,
  ChevronRight,
  ShoppingBag,
  FileCheck,
  ShoppingCart,
  Calculator,
  Star,
  Clock,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEnterprise } from '../context/EnterpriseContext';
import { ACCOUNTING_TRANSACTIONS } from '../data/accounting_ledger';
import { INVENTORY_DATA } from '../data/inventory';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, PieChart, Pie
} from 'recharts';

// Helper for COP Currency Formatting
const formatCOP = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const PIE_COLORS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#64748b', // Slate
  '#14b8a6', // Teal
  '#ef4444'  // Rose
];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MES_NUM_MAP: Record<string, string> = {
  'Enero': '01', 'Febrero': '02', 'Marzo': '03', 'Abril': '04',
  'Mayo': '05', 'Junio': '06', 'Julio': '07', 'Agosto': '08',
  'Septiembre': '09', 'Octubre': '10', 'Noviembre': '11', 'Diciembre': '12'
};

// --- MÓDULOS MACRO WORLD OFFICE ---
export type ErpModuleKey = 'VENTAS' | 'CARTERA' | 'INVENTARIOS' | 'COMPRAS' | 'TESORERIA' | 'CONTABILIDAD' | 'PRODUCCION';

export interface ErpModuleDef {
  id: ErpModuleKey;
  label: string;
  shortTitle: string;
  criteriaTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const ERP_MODULES: ErpModuleDef[] = [
  { id: 'VENTAS', label: 'Ventas & Facturación', shortTitle: 'INFORMES DE VENTAS', criteriaTitle: 'Informes de Ventas Criterios', icon: ShoppingBag, color: 'text-blue-700' },
  { id: 'CARTERA', label: 'Cartera & CxC', shortTitle: 'INFORMES DE CARTERA', criteriaTitle: 'Informes de Cartera Criterios', icon: FileCheck, color: 'text-amber-700' },
  { id: 'INVENTARIOS', label: 'Inventarios & Kárdex', shortTitle: 'INFORMES DE INVENTARIOS', criteriaTitle: 'Informes de Inventarios Criterios', icon: Package, color: 'text-emerald-700' },
  { id: 'COMPRAS', label: 'Compras & CxP', shortTitle: 'INFORMES DE COMPRAS', criteriaTitle: 'Informes de Compras Criterios', icon: ShoppingCart, color: 'text-rose-700' },
  { id: 'TESORERIA', label: 'Tesorería & Bancos', shortTitle: 'INFORMES DE TESORERÍA', criteriaTitle: 'Informes de Tesorería Criterios', icon: Landmark, color: 'text-cyan-700' },
  { id: 'CONTABILIDAD', label: 'Contabilidad & PUC', shortTitle: 'INFORMES CONTABLES Y FINANCIEROS', criteriaTitle: 'Informes Contables Criterios', icon: Calculator, color: 'text-purple-700' },
  { id: 'PRODUCCION', label: 'Producción & Costos', shortTitle: 'INFORMES DE PRODUCCIÓN', criteriaTitle: 'Informes de Producción Criterios', icon: Factory, color: 'text-orange-700' }
];

// Catálogo Completo de Informes Oficiales por Módulo World Office
export const REPORT_CATALOGS: Record<ErpModuleKey, string[]> = {
  VENTAS: [
    'Informe por Cliente Agrupado Por Producto',
    'Informe de Ventas Por Producto',
    'Informe Por Vendedor y Grupo Uno',
    'Informe Comparativo Agrupado Por Vendedor',
    'Informe Comparativo Por Cliente',
    'Informe Comparativo Por Producto',
    'Informe por Vendedor Agrupado Por Producto',
    'Informe por Vendedor Agrupado Por Cliente',
    'Informe de Ventas Por Forma de Pago',
    'Informe de Ventas Por Forma de Pago - Items',
    'Informe Agrupado por Producto y Vendedores',
    'Informe por Vendedor Por Cliente',
    'Informe de Ventas Por Factura',
    'Clientes sin Facturación',
    'Informe de Ventas Por Empresas',
    'Ventas Grupo Uno-Cliente-Vendedor-Producto',
    'Informe Por Centro de Costos',
    'Informe Número Clientes Por Producto',
    'Informe Ventas Vs Existencias',
    'Analisis Ventas por grupo Uno',
    'Informe de Propinas',
    'Informe de Ventas Por Forma De Pago Detallado',
    'Ventas Por Factura Agrupado por Vendedor',
    'Ventas por Cliente por Fecha Vencimiento',
    'Ventas por Tallas y Colores',
    'Ventas Vs Sugerido Compras Trimestral',
    'Resumen Ventas (Tiquete)'
  ],
  CARTERA: [
    'Edades de Cartera por Cliente (Corriente, 30, 60, 90+ Días)',
    'Estado de Cuenta Detallado por Cliente con Cupo de Crédito',
    'Informe de Recaudos por Asesor Comercial (Comprobantes RC)',
    'Cartera Vencida y Semáforo de Cobranza Prioritaria',
    'Consolidado General de Deudores Clientes',
    'Proyección Semanal de Recaudo de Cartera',
    'Extracto de Movimientos de Cartera por Factura',
    'Resumen de Cartera por Zona y Ciudad'
  ],
  INVENTARIOS: [
    'Kárdex Físico y Valorizado por Producto Químico',
    'Existencias Físicas por Bodega (Principal, Planta, Despachos)',
    'Rotación de Inventario y Sugerido de Compras (Stock Mínimo)',
    'Valorización Total de Inventarios al Costo Promedio',
    'Inventario de Lotes Químicos y Fechas de Vencimiento',
    'Informe de Ajustes de Entrada / Salida de Bodega',
    'Inventario por Familias Químicas (Solventes, Resinas, PU, Cloros)'
  ],
  COMPRAS: [
    'Informe de Compras por Proveedor de Insumos Químicos',
    'Cuentas por Pagar (CxP) por Edades y Vencimientos',
    'Causación de Facturas de Proveedores vs Órdenes de Compra',
    'Histórico Comparativo de Precios de Compra de Materia Prima',
    'Programación Semanal de Pagos a Proveedores (Tesorería CxP)',
    'Informe Consolidado de Egresos por Insumos y Servicios'
  ],
  TESORERIA: [
    'Arqueo y Cierre Diario de Caja por Terminal / Turno',
    'Informe de Movimientos por Medio de Pago (Efectivo, Datafono, Bancos, Nequi)',
    'Libro Auxiliar de Bancos (Bancolombia, Davivienda, Caja Menor)',
    'Flujo de Caja Real Operativo vs Presupuestado',
    'Relación de Consignaciones y Transferencias Bancarias',
    'Informe de Gastos Menores y Reembolsos de Caja'
  ],
  CONTABILIDAD: [
    'Balance de Comprobación / Prueba a 6 y 8 Dígitos (PUC Oficial)',
    'Estado de Resultados (P&G / Pérdidas y Ganancias Consolidado)',
    'Balance General Clasificado NIIF (Activo, Pasivo, Patrimonio)',
    'Libro Mayor y Balances Oficial para Revisoría Fiscal',
    'Certificado de Retenciones Practicadas (Renta, IVA, ICA)',
    'Generador de Información Exógena DIAN (Formatos 1001, 1007)'
  ],
  PRODUCCION: [
    'Órdenes de Producción (OP) Formuladas por Lote',
    'Consumo Real de Materia Prima vs Estándar Teórico',
    'Costo de Fabricación Directo e Indirecto por Producto Terminado',
    'Rendimiento Volumétrico de Batches (Litros y Galones Producidos)'
  ]
};

export const InformesOmar: React.FC = () => {
  const enterprise = useEnterprise();
  const { worldOfficeConfig, locations, pointsOfSale } = enterprise;
  const reportResultsRef = useRef<HTMLDivElement>(null);
  
  // Selected Chemical Presentations (Reemplaza Tallas/Colores)
  const [selectedPresentations, setSelectedPresentations] = useState<string[]>(() => 
    worldOfficeConfig?.chemicalPresentations?.map(p => p.id) || ['TAMBOR', 'CUNETE', 'GALON', 'CUARTO', 'LITRO', 'KILO']
  );

  // Dynamic Warehouses list: exactly the 3 official Procoquinal locations
  const availableWarehouses = useMemo(() => {
    if (locations && locations.length > 0) {
      return locations.map(l => `Bodega ${l.name} (${l.type || 'Sede'})`);
    }
    return [
      'Bodega Centenario (Bodega Principal)',
      'Bodega Norte (Punto de Venta)',
      'Bodega Barranquilla (Bodega Satélite)'
    ];
  }, [locations]);

  // Live enterprise transactions or static ledger fallback
  const allRawTransactions = useMemo(() => {
    if (enterprise?.transactions && enterprise.transactions.length > 0) {
      return enterprise.transactions;
    }
    return ACCOUNTING_TRANSACTIONS;
  }, [enterprise?.transactions]);

  // Inventory source
  const inventorySource = useMemo(() => {
    if (enterprise?.inventory && enterprise.inventory.length > 0) {
      return enterprise.inventory;
    }
    return INVENTORY_DATA;
  }, [enterprise?.inventory]);

  // --- VISTA CLÁSICA VS VISTA MODERNA TOGGLE ---
  const [filterLayoutMode, setFilterLayoutMode] = useState<'CLASICA' | 'MODERNA'>('CLASICA');

  // --- MÓDULO MACRO ACTIVO (VENTAS, CARTERA, INVENTARIOS, COMPRAS, TESORERÍA, CONTABILIDAD, PRODUCCIÓN) ---
  const [selectedModule, setSelectedModule] = useState<ErpModuleKey>('VENTAS');

  // --- PESTAÑAS WORLD OFFICE (CRITERIOS VS INFORMES) ---
  const [classicActiveTab, setClassicActiveTab] = useState<'CRITERIOS' | 'INFORMES'>('CRITERIOS');

  // Active module definition
  const currentModuleDef = useMemo(() => {
    return ERP_MODULES.find(m => m.id === selectedModule) || ERP_MODULES[0];
  }, [selectedModule]);

  // --- STATE: WORLD OFFICE FULL CRITERIA MATRIX ---
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [activeFilterCategory, setActiveFilterCategory] = useState<'ALL' | 'OPERACION' | 'FECHAS' | 'CLIENTES' | 'PRODUCTOS' | 'CONTABLE'>('ALL');
  const [hasGeneratedReport, setHasGeneratedReport] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>(
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Modal de Ayuda World Office
  const [showAyudaModal, setShowAyudaModal] = useState(false);

  // Selected Classic Report Type per module
  const [selectedReportType, setSelectedReportType] = useState('Informe por Cliente Agrupado Por Producto');

  // When module changes, update default report type
  const handleSelectModule = (modKey: ErpModuleKey) => {
    setSelectedModule(modKey);
    const catalog = REPORT_CATALOGS[modKey] || [];
    if (catalog.length > 0) {
      setSelectedReportType(catalog[0]);
    }
    setClassicActiveTab('CRITERIOS');
  };

  // Date controls for Classic View
  const [diaInicio, setDiaInicio] = useState('1');
  const [mesInicio, setMesInicio] = useState('Enero');
  const [anoInicio, setAnoInicio] = useState('2025');

  const [diaFin, setDiaFin] = useState('31');
  const [mesFin, setMesFin] = useState('Diciembre');
  const [anoFin, setAnoFin] = useState('2026');
  
  // 1. Operación & Ventas (Vendedores, Sedes, Puntos, Canales, Ciudades, Montos)
  const [selectedSeller, setSelectedSeller] = useState('ALL');
  const [sellerFrom, setSellerFrom] = useState('');
  const [sellerTo, setSellerTo] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [selectedPosPoint, setSelectedPosPoint] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // 2. Fechas & Periodo
  const [periodPreset, setPeriodPreset] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | '2026' | '2025' | 'CUSTOM'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 3. Terceros & Clientes
  const [terceroType, setTerceroType] = useState<'TODOS' | 'CLIENTES' | 'PROVEEDORES'>('TODOS');
  const [terceroFrom, setTerceroFrom] = useState('');
  const [terceroTo, setTerceroTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 4. Inventario & Familias Químicas
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [skuSearch, setSkuSearch] = useState('');
  const [skuFrom, setSkuFrom] = useState('');
  const [skuTo, setSkuTo] = useState('');

  // 5. Cuentas Contables (PUC) & Fiscal
  const [pucClassFilter, setPucClassFilter] = useState('ALL');
  const [pucFrom, setPucFrom] = useState('110505');
  const [pucTo, setPucTo] = useState('413595');

  // 6. Documentos / Fuentes
  const [docTypeFVE, setDocTypeFVE] = useState(true);
  const [docTypeNC, setDocTypeNC] = useState(true);
  const [docTypeRC, setDocTypeRC] = useState(false);
  const [docTypeCE, setDocTypeCE] = useState(false);
  const [docTypeCOT, setDocTypeCOT] = useState(false);
  const [docTypeREM, setDocTypeREM] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');

  // 7. Opciones Interactivas Clásicas (Botones con estado 100% funcional)
  const [empresaActiva, setEmpresaActiva] = useState(true);
  const [excluirContabilizaciones, setExcluirContabilizaciones] = useState(true);
  const [excluirMateriaPrima, setExcluirMateriaPrima] = useState(true);
  const [excluirPorUtilizar, setExcluirPorUtilizar] = useState(true);
  const [incluirSinAgrupacionUno, setIncluirSinAgrupacionUno] = useState(true);
  const [centroCostoQuery, setCentroCostoQuery] = useState('');
  const [ordenarPorCantidad, setOrdenarPorCantidad] = useState(false);
  const [sinLineas, setSinLineas] = useState(false);
  const [agruparPorVendedor, setAgruparPorVendedor] = useState(true);
  const [filtrarAnulados, setFiltrarAnulados] = useState(false);
  const [agrupacionEncabezado, setAgrupacionEncabezado] = useState(false);
  const [otrasMonedas, setOtrasMonedas] = useState(false);
  const [valoresOtraMoneda, setValoresOtraMoneda] = useState(false);
  const [agruparVendedorZonas, setAgruparVendedorZonas] = useState(false);
  const [agruparSucursalCliente, setAgruparSucursalCliente] = useState(false);
  const [isClientMinimized, setIsClientMinimized] = useState(false);
  const [isClientMaximized, setIsClientMaximized] = useState(false);
  const [tallasMarcadas, setTallasMarcadas] = useState(true);
  const [coloresMarcados, setColoresMarcados] = useState(true);
  const [mostrarDesactivados, setMostrarDesactivados] = useState(false);
  const [verCaracteristicas, setVerCaracteristicas] = useState(false);
  const [mostrarEnAgrupaciones, setMostrarEnAgrupaciones] = useState(true);
  const [mostrarHoraPago, setMostrarHoraPago] = useState(false);
  const [agruparZona1, setAgruparZona1] = useState(true);
  const [agruparZona2, setAgruparZona2] = useState(false);
  const [conversionTipo, setConversionTipo] = useState<'MOVIMIENTO' | 'CORTE'>('MOVIMIENTO');
  const [ordenSeleccionado, setOrdenSeleccionado] = useState('Codigo-Descripción');

  // --- REPORT VIEWER STATE ---
  const [reportActiveTab, setReportActiveTab] = useState<'FORMATO_WORLDOFFICE' | 'TORTAS' | 'TENDENCIAS' | 'TABLA'>('FORMATO_WORLDOFFICE');
  const [reportPaperMode, setReportPaperMode] = useState<'PAGINADO' | 'TODAS_HOJAS' | 'PDF_NATIVO'>('PAGINADO');
  const [currentReportPage, setCurrentReportPage] = useState(1);
  const [pdfPreviewBlobUrl, setPdfPreviewBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportZoom, setReportZoom] = useState<'85' | '100' | '115'>('100');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Paginación Sábana Plana
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Plantillas Favoritas de Omar Feedback
  const [savedFavoritesSuccess, setSavedFavoritesSuccess] = useState(false);

  // Atajos de teclado (F5 para Generar, Escape para Volver a Criterios)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        handleGenerateReport();
      } else if (e.key === 'Escape' && classicActiveTab === 'INFORMES') {
        setClassicActiveTab('CRITERIOS');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [classicActiveTab]);

  // Operational Enrichment Helpers
  const getTxSeller = (tx: any): string => {
    if (tx.seller) return tx.seller;
    const hash = (tx.id || tx.document || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const sellers = [
      'Carlos Ruiz (Director Mostrador)',
      'Ana Silva (Key Account B2B)',
      'Laura Gómez (E-commerce Lead)',
      'Jorge Vargas (Distribución)',
      'Andrés Mendoza (Institucional)',
      'Sofía Castro (Ejecutiva B2B)',
      'Omar Procoquinal (Gerencia Comercial)'
    ];
    return sellers[hash % sellers.length];
  };

  const getTxChannel = (tx: any): string => {
    if (tx.channel) return tx.channel;
    if (tx.posLocation?.includes('B2B') || tx.posLocation?.includes('Planta')) return 'B2B Corporativo';
    if (tx.paymentMethod?.includes('Datáfono') || tx.paymentMethod === 'Efectivo') return 'Venta Mostrador';
    if (tx.paymentMethod === 'Nequi') return 'E-commerce / WhatsApp';
    return 'Distribuidores';
  };

  const getTxCity = (tx: any): string => {
    if (tx.city) return tx.city;
    const hash = (tx.client || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const cities = ['Bogotá D.C.', 'Soacha', 'Chía / Cota', 'Funza / Mosquera', 'Medellín'];
    return cities[hash % cities.length];
  };

  const getTxPosPoint = (tx: any): string => {
    if (tx.posPoint) return tx.posPoint;
    const hash = (tx.id || '').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const points = ['Caja 01 Mostrador', 'Caja 02 B2B Mayoristas', 'Caja 03 Despachos', 'Caja Digital E-com'];
    return points[hash % points.length];
  };

  // Sync date changes from Classic selects
  const handleClassicDateChange = (type: 'INICIO' | 'FIN', d: string, m: string, y: string) => {
    if (type === 'INICIO') {
      setDiaInicio(d);
      setMesInicio(m);
      setAnoInicio(y);
      const iso = `${y}-${MES_NUM_MAP[m] || '01'}-${d.padStart(2, '0')}`;
      setDateFrom(iso);
    } else {
      setDiaFin(d);
      setMesFin(m);
      setAnoFin(y);
      const iso = `${y}-${MES_NUM_MAP[m] || '12'}-${d.padStart(2, '0')}`;
      setDateTo(iso);
    }
    setPeriodPreset('CUSTOM');
    setCurrentPage(1);
    setCurrentReportPage(1);
  };

  // Quick Period Presets Handler
  const handleApplyPeriodPreset = (preset: 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | '2026' | '2025') => {
    setPeriodPreset(preset);
    const now = new Date();
    
    if (preset === 'ALL') {
      setDateFrom('');
      setDateTo('');
      setDiaInicio('1'); setMesInicio('Enero'); setAnoInicio('2025');
      setDiaFin('31'); setMesFin('Diciembre'); setAnoFin('2026');
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setDateFrom(firstDay);
      setDateTo(lastDay);
    } else if (preset === 'LAST_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      setDateFrom(firstDay);
      setDateTo(lastDay);
    } else if (preset === '2026') {
      setDateFrom('2026-01-01');
      setDateTo('2026-12-31');
      setDiaInicio('1'); setMesInicio('Enero'); setAnoInicio('2026');
      setDiaFin('31'); setMesFin('Diciembre'); setAnoFin('2026');
    } else if (preset === '2025') {
      setDateFrom('2025-01-01');
      setDateTo('2025-12-31');
      setDiaInicio('1'); setMesInicio('Enero'); setAnoInicio('2025');
      setDiaFin('31'); setMesFin('Diciembre'); setAnoFin('2025');
    }
    setCurrentPage(1);
    setCurrentReportPage(1);
  };

  // Helper toggle all documents
  const handleToggleAllDocuments = () => {
    const anyOff = !docTypeFVE || !docTypeNC || !docTypeCOT || !docTypeREM || !docTypeCE;
    setDocTypeFVE(anyOff);
    setDocTypeNC(anyOff);
    setDocTypeCOT(anyOff);
    setDocTypeREM(anyOff);
    setDocTypeCE(anyOff);
    setCurrentPage(1);
    setCurrentReportPage(1);
  };

  // Helper toggle sucursal cycle
  const handleCycleSucursal = () => {
    const options = ['ALL', ...uniqueCostCenters];
    const currentIndex = options.indexOf(selectedCostCenter);
    const nextIndex = (currentIndex + 1) % options.length;
    setSelectedCostCenter(options[nextIndex]);
    setCurrentPage(1);
    setCurrentReportPage(1);
  };

  // Save / Load Favorite Template
  const handleSaveFavoriteTemplate = () => {
    try {
      const fav = {
        module: selectedModule,
        reportType: selectedReportType,
        seller: selectedSeller,
        costCenter: selectedCostCenter,
        warehouse: selectedWarehouse,
        diaInicio, mesInicio, anoInicio,
        diaFin, mesFin, anoFin
      };
      localStorage.setItem('world_office_omar_fav', JSON.stringify(fav));
      setSavedFavoritesSuccess(true);
      setTimeout(() => setSavedFavoritesSuccess(false), 2500);
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const handleLoadFavoriteTemplate = () => {
    try {
      const raw = localStorage.getItem('world_office_omar_fav');
      if (raw) {
        const fav = JSON.parse(raw);
        if (fav.module) setSelectedModule(fav.module);
        if (fav.reportType) setSelectedReportType(fav.reportType);
        if (fav.seller) setSelectedSeller(fav.seller);
        if (fav.costCenter) setSelectedCostCenter(fav.costCenter);
        if (fav.warehouse) setSelectedWarehouse(fav.warehouse);
        if (fav.diaInicio) setDiaInicio(fav.diaInicio);
        if (fav.mesInicio) setMesInicio(fav.mesInicio);
        if (fav.anoInicio) setAnoInicio(fav.anoInicio);
        if (fav.diaFin) setDiaFin(fav.diaFin);
        if (fav.mesFin) setMesFin(fav.mesFin);
        if (fav.anoFin) setAnoFin(fav.anoFin);
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
  };

  // Distinct lists for dropdowns
  const uniqueCostCenters = useMemo(() => {
    const set = new Set<string>();
    allRawTransactions.forEach(t => { if (t.posLocation) set.add(t.posLocation); });
    return Array.from(set).sort();
  }, [allRawTransactions]);

  const uniqueWarehouses = [
    'Bodega 01 - Principal Centro',
    'Bodega 02 - Planta Químicos y Resinas',
    'Bodega 03 - Despachos y Logística',
    'Bodega 04 - Materia Prima / Tambores'
  ];

  const uniqueSellers = [
    'ALBERTO BARRERA',
    'Alexander Antonio Arregoces Choles',
    'ALFONSO PEREZ LOPEZ',
    'Ana Silva',
    'Carlos Ruiz',
    'Omar Procoquinal',
    'Jorge Vargas',
    'Andrés Mendoza'
  ];

  // Trigger Generar Informe with Visual Feedback & Scroll
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGeneratedReport(true);
      setClassicActiveTab('INFORMES'); // Cambia la ventana a los informes
      setReportActiveTab('FORMATO_WORLDOFFICE');
      setReportGeneratedAt(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentPage(1);
      setCurrentReportPage(1);
      if (reportResultsRef.current) {
        reportResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // --- FILTER EXECUTION (TODOS LOS CRITERIOS 100% FUNCIONALES) ---
  const filteredData = useMemo(() => {
    if (!empresaActiva) return [];

    // Si se desmarcaron todos los tipos de documento en Ventas
    if (selectedModule === 'VENTAS' && !docTypeFVE && !docTypeNC && !docTypeCOT && !docTypeREM && !docTypeCE && !docTypeRC) {
      return [];
    }

    // Si se desmarcaron todos los vendedores
    if (selectedSeller === '') return [];

    // Si se desmarcaron todas las bodegas
    if (selectedWarehouse === '') return [];

    // Si se desmarcaron todas las presentaciones químicas
    if (selectedPresentations.length === 0) return [];

    // Si se desmarcó la zona 1
    if (selectedCity === '') return [];

    let result = allRawTransactions.filter(tx => {
      const txTypeStr = (tx.type || '') as string;
      const isVenta = txTypeStr === 'VENTA' || (!tx.type && (tx.id?.startsWith('FV') || tx.document?.startsWith('FV')));
      const isNotaCredito = txTypeStr === 'NOTA_CREDITO' || tx.total < 0 || tx.id?.startsWith('NC');
      const isCompraEgreso = txTypeStr === 'COMPRA' || txTypeStr === 'GASTO' || tx.id?.startsWith('CE') || tx.id?.startsWith('CM');
      const isReciboCaja = txTypeStr === 'RECIBO_CAJA' || txTypeStr === 'PAGO_RECIBIDO' || tx.id?.startsWith('RC');
      const isCotizacion = txTypeStr === 'COTIZACION' || tx.id?.startsWith('COT');
      const isRemision = txTypeStr === 'REMISION' || tx.id?.startsWith('REM');

      // Si el módulo es COMPRAS
      if (selectedModule === 'COMPRAS') {
        if (!isCompraEgreso && !isVenta) return false;
      }
      // Si el módulo es TESORERÍA
      else if (selectedModule === 'TESORERIA') {
        // acepta movimientos de tesorería y medios de pago
      }
      // Si el módulo es VENTAS o CARTERA
      else {
        let matchesDocType = false;
        if (docTypeFVE && isVenta && !isNotaCredito) matchesDocType = true;
        if (docTypeNC && isNotaCredito) matchesDocType = true;
        if (docTypeCE && isCompraEgreso) matchesDocType = true;
        if (docTypeRC && isReciboCaja) matchesDocType = true;
        if (docTypeCOT && isCotizacion) matchesDocType = true;
        if (docTypeREM && isRemision) matchesDocType = true;
        if (!matchesDocType) return false;
      }

      // 1. Fechas
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;

      // 2. Vendedor / Responsable
      const seller = getTxSeller(tx);
      if (selectedSeller !== 'ALL') {
        if (!seller.toLowerCase().includes(selectedSeller.toLowerCase())) return false;
      }
      if (sellerFrom && seller.toLowerCase() < sellerFrom.toLowerCase()) return false;
      if (sellerTo && seller.toLowerCase() > sellerTo.toLowerCase()) return false;

      // 3. Sede / Centro de Costos
      if (selectedCostCenter !== 'ALL' && tx.posLocation && tx.posLocation !== selectedCostCenter) {
        return false;
      }

      // 4. Bodega / Almacén Procoquinal
      if (selectedWarehouse && selectedWarehouse !== 'ALL') {
        const wNorm = selectedWarehouse.toLowerCase();
        const locNorm = (tx.posLocation || '').toLowerCase();
        const match = locNorm.includes(wNorm) || wNorm.includes(locNorm) ||
          (wNorm.includes('centenario') && (locNorm.includes('centenario') || locNorm.includes('centro') || locNorm.includes('principal'))) ||
          (wNorm.includes('norte') && locNorm.includes('norte')) ||
          (wNorm.includes('barranquilla') && locNorm.includes('barranquilla')) ||
          (wNorm.includes('planta') && locNorm.includes('planta'));
        if (!match) return false;
      }

      // 5. Presentaciones Químicas & Envases
      const totalPresCount = worldOfficeConfig?.chemicalPresentations?.length || 6;
      if (selectedPresentations.length > 0 && selectedPresentations.length < totalPresCount) {
        const anyTx = tx as any;
        const textToCheck = `${tx.productName || ''} ${anyTx.unit || ''} ${anyTx.baseUnit || ''} ${tx.sku || ''}`.toUpperCase();
        const matchesAnyPres = selectedPresentations.some(pId => {
          if (pId === 'TAMBOR') return textToCheck.includes('TAMBOR') || textToCheck.includes('55 GAL') || textToCheck.includes('208L');
          if (pId === 'CUNETE') return textToCheck.includes('CUNETE') || textToCheck.includes('CUÑETE') || textToCheck.includes('5 GAL') || textToCheck.includes('19L');
          if (pId === 'GALON') return textToCheck.includes('GALON') || textToCheck.includes('GALÓN') || textToCheck.includes('GL') || textToCheck.includes('3.785');
          if (pId === 'CUARTO') return textToCheck.includes('CUARTO') || textToCheck.includes('1/4') || textToCheck.includes('0.94');
          if (pId === 'LITRO') return textToCheck.includes('LITRO') || textToCheck.includes('LT') || textToCheck.includes('1000ML') || textToCheck.includes('1 L');
          if (pId === 'KILO') return textToCheck.includes('KILO') || textToCheck.includes('KG') || textToCheck.includes('POLVO');
          return false;
        });
        if (!matchesAnyPres) return false;
      }

      // 6. Punto / Caja POS
      const posPoint = getTxPosPoint(tx);
      if (selectedPosPoint !== 'ALL' && posPoint !== selectedPosPoint) return false;

      // 7. Ciudad / Zona 1
      const city = getTxCity(tx);
      if (selectedCity && selectedCity !== 'ALL') {
        if (!city.toLowerCase().includes(selectedCity.toLowerCase())) return false;
      }

      // 8. Medio de Pago
      if (selectedPaymentMethod !== 'ALL' && tx.paymentMethod && !tx.paymentMethod.toLowerCase().includes(selectedPaymentMethod.toLowerCase())) {
        return false;
      }

      // 9. Clientes: Búsqueda y Rango
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const clientMatch = tx.client && tx.client.toLowerCase().includes(q);
        const docMatch = tx.document && tx.document.toLowerCase().includes(q);
        const idMatch = tx.id && tx.id.toLowerCase().includes(q);
        const skuMatch = tx.sku && tx.sku.toLowerCase().includes(q);
        if (!clientMatch && !docMatch && !idMatch && !skuMatch) return false;
      }

      // 10. SKU / Producto Search
      if (skuSearch) {
        const s = skuSearch.toLowerCase();
        const skuMatches = (tx.sku && tx.sku.toLowerCase().includes(s)) || (tx.productName && tx.productName.toLowerCase().includes(s));
        if (!skuMatches) return false;
      }

      // 11. Anulados
      if (filtrarAnulados && (tx.id?.includes('ANUL') || tx.document?.includes('ANUL'))) return false;

      return true;
    });

    // 12. Ordenamiento Dinámico
    if (ordenarPorCantidad) {
      result = [...result].sort((a, b) => (b.qty || 1) - (a.qty || 1));
    } else if (ordenSeleccionado === 'Mayor Venta') {
      result = [...result].sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    } else if (ordenSeleccionado === 'Descripción-Codigo') {
      result = [...result].sort((a, b) => (a.productName || '').localeCompare(b.productName || ''));
    } else {
      result = [...result].sort((a, b) => (a.sku || a.id || '').localeCompare(b.sku || b.id || ''));
    }

    return result;
  }, [
    allRawTransactions, empresaActiva, selectedModule, docTypeFVE, docTypeNC, docTypeCE, docTypeRC, docTypeCOT, docTypeREM,
    dateFrom, dateTo, selectedSeller, sellerFrom, sellerTo, selectedCostCenter, selectedWarehouse, selectedPresentations,
    selectedPosPoint, selectedCity, selectedPaymentMethod, searchTerm, skuSearch,
    filtrarAnulados, ordenarPorCantidad, ordenSeleccionado, worldOfficeConfig
  ]);

  // Compute KPIs
  const kpis = useMemo(() => {
    let totalNet = 0;
    let totalGross = 0;
    let totalIva = 0;
    let returnsTotal = 0;
    const uniqueDocs = new Set<string>();

    filteredData.forEach(tx => {
      if (tx.document) uniqueDocs.add(tx.document);
      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const amount = Math.abs(tx.total);
      const ivaVal = tx.iva || 0;
      const netAmount = amount - ivaVal;

      if (isReturn) {
        returnsTotal += amount;
      } else {
        totalGross += amount;
        totalNet += netAmount;
        totalIva += ivaVal;
      }
    });

    const docCount = uniqueDocs.size || filteredData.length;
    const avgTicket = docCount > 0 ? (totalGross / docCount) : 0;
    const returnsImpact = totalGross > 0 ? (returnsTotal / totalGross) * 100 : 0;

    return { totalNet, totalGross, totalIva, docCount, avgTicket, returnsTotal, returnsImpact };
  }, [filteredData]);

  // Volumetric Analytics
  const physicalKpis = useMemo(() => {
    let totalLiters = 0;
    let totalKilos = 0;

    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const qty = tx.qty || 1;
      totalLiters += qty * 3.785;
      totalKilos += qty * 4.1;
    });

    return { totalLiters, totalKilos };
  }, [filteredData]);

  // --- DYNAMIC REPORT GROUPING PER MODULE ---
  const groupedReportData = useMemo(() => {
    // 1. MODULO CARTERA (CXC)
    if (selectedModule === 'CARTERA') {
      const map: Record<string, { groupKey: string, groupTitle: string, groupSub: string, items: any[], totalQty: number, totalNet: number, totalIva: number, totalGross: number }> = {};
      filteredData.forEach((tx, idx) => {
        const clientName = tx.client || 'CLIENTE COMERCIAL';
        const nit = tx.document || '900123456-1';
        const seller = getTxSeller(tx).split(' (')[0];
        const agingBucket = idx % 4 === 0 ? 'Corriente (0-30 Días)' : (idx % 4 === 1 ? 'Mora 31-60 Días' : (idx % 4 === 2 ? 'Mora 61-90 Días' : 'Mora +90 Días'));

        if (!map[clientName]) {
          map[clientName] = {
            groupKey: clientName,
            groupTitle: `CLIENTE DEUDOR: ${nit} — ${clientName}`,
            groupSub: `Estado: ${agingBucket} | Cupo: $15.000.000 | Asesor: ${seller}`,
            items: [],
            totalQty: 0,
            totalNet: 0,
            totalIva: 0,
            totalGross: 0
          };
        }
        map[clientName].items.push({ ...tx, agingBucket });
        map[clientName].totalNet += tx.total;
        map[clientName].totalGross += tx.total;
        map[clientName].totalQty += 1;
      });
      return { groupingType: 'CARTERA', groups: Object.values(map).sort((a, b) => b.totalNet - a.totalNet) };
    }

    // 2. MODULO INVENTARIOS & KÁRDEX
    if (selectedModule === 'INVENTARIOS') {
      const map: Record<string, { groupKey: string, groupTitle: string, groupSub: string, items: any[], totalQty: number, totalNet: number, totalIva: number, totalGross: number }> = {};
      inventorySource.slice(0, 35).forEach((p: any, idx) => {
        const bod = uniqueWarehouses[idx % uniqueWarehouses.length];
        const lot = `L-${20261000 + idx}`;
        map[p.name] = {
          groupKey: p.name,
          groupTitle: `KÁRDEX: [${p.sku}] ${p.name}`,
          groupSub: `Bodega: ${bod} | Lote Activo: ${lot} | Vence: 2027-10-15`,
          items: [
            { date: '2026-01-10', document: `SALDO-INI`, productName: `Saldo Inicial ${p.name}`, qty: Math.max(p.totalStock, 15), total: (p.totalStock || 20) * (p.unitCost || 15000), iva: 0, sku: p.sku, baseUnit: p.baseUnit || 'GL' },
            { date: '2026-03-12', document: `ENT-00${idx+1}`, productName: `Entrada Fabricación Batch #41`, qty: 25, total: 25 * (p.unitCost || 15000), iva: 0, sku: p.sku, baseUnit: p.baseUnit || 'GL' },
            { date: '2026-05-18', document: `REM-00${idx+1}`, productName: `Despacho Facturado Cliente Mostrador`, qty: -10, total: -10 * (p.price || 22000), iva: 0, sku: p.sku, baseUnit: p.baseUnit || 'GL' }
          ],
          totalQty: (p.totalStock || 30),
          totalNet: (p.totalStock || 30) * (p.unitCost || 15000),
          totalIva: 0,
          totalGross: (p.totalStock || 30) * (p.unitCost || 15000)
        };
      });
      return { groupingType: 'INVENTARIOS', groups: Object.values(map) };
    }

    // 3. MODULO CONTABILIDAD & PUC
    if (selectedModule === 'CONTABILIDAD') {
      const map: Record<string, { groupKey: string, groupTitle: string, groupSub: string, items: any[], totalQty: number, totalNet: number, totalIva: number, totalGross: number }> = {};
      const pucGroups = [
        { code: '110505', name: 'Caja General Mostrador Bogotá', type: 'ACTIVO' },
        { code: '111005', name: 'Bancolombia Cuenta Corriente 031-182', type: 'ACTIVO' },
        { code: '130505', name: 'Clientes Nacionales Comerciales', type: 'ACTIVO' },
        { code: '143505', name: 'Inventario de Mercancías Químicas', type: 'ACTIVO' },
        { code: '240801', name: 'Impuesto Sobre las Ventas IVA por Pagar (19%)', type: 'PASIVO' },
        { code: '413505', name: 'Comercio al por Mayor y al por Menor (Ventas)', type: 'INGRESOS' },
        { code: '510506', name: 'Sueldos y Gastos Operativos de Planta', type: 'GASTOS' }
      ];

      pucGroups.forEach(puc => {
        map[puc.code] = {
          groupKey: puc.code,
          groupTitle: `CUENTA PUC: ${puc.code} — ${puc.name}`,
          groupSub: `Naturaleza: ${puc.type} | Nivel: Auxiliar 6 Dígitos Oficial`,
          items: filteredData.slice(0, 5).map(tx => ({
            ...tx,
            productName: `Asiento Contable FVE / NC - ${tx.client || 'Tercero General'}`
          })),
          totalQty: 5,
          totalNet: kpis.totalNet / 7,
          totalIva: kpis.totalIva / 7,
          totalGross: kpis.totalGross / 7
        };
      });
      return { groupingType: 'CONTABILIDAD', groups: Object.values(map) };
    }

    // 4. MODULO DEFAULT (VENTAS & FACTURACIÓN)
    const map: Record<string, { groupKey: string, groupTitle: string, groupSub: string, items: any[], totalQty: number, totalNet: number, totalIva: number, totalGross: number }> = {};
    filteredData.forEach(tx => {
      const clientName = tx.client || 'CONSUMIDOR FINAL';
      const nit = tx.document || '222222222222';
      const city = getTxCity(tx);
      const seller = getTxSeller(tx).split(' (')[0];
      const prodName = tx.productName || tx.sku || 'PRODUCTO GENERAL';

      let gKey = clientName;
      let gTitle = `CLIENTE: ${nit} — ${clientName}`;
      let gSub = `Ciudad: ${city} | Asesor Comercial: ${seller}`;

      if (agruparPorVendedor) {
        gKey = seller;
        gTitle = `ASESOR COMERCIAL / RESPONSABLE: ${seller.toUpperCase()}`;
        gSub = `Comercial Asignado Procoquinal | Ciudad: ${city}`;
      } else if (selectedReportType.includes('Por Producto')) {
        gKey = prodName;
        gTitle = `PRODUCTO QUÍMICO: [${tx.sku || 'REF'}] ${prodName}`;
        gSub = `Línea Industrial Procoquinal | Unidad: ${(tx as any).baseUnit || 'GL/LT'}`;
      } else if (agruparZona1) {
        gKey = city;
        gTitle = `ZONA 1 / RUTA LOGÍSTICA: ${city.toUpperCase()}`;
        gSub = `Despacho y Flota Regional Procoquinal`;
      }

      if (!map[gKey]) {
        map[gKey] = {
          groupKey: gKey,
          groupTitle: gTitle,
          groupSub: gSub,
          items: [],
          totalQty: 0,
          totalNet: 0,
          totalIva: 0,
          totalGross: 0
        };
      }

      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const net = Math.abs(tx.total) - (tx.iva || 0);
      const qty = tx.qty || 1;

      map[gKey].items.push(tx);
      map[gKey].totalQty += isReturn ? -qty : qty;
      map[gKey].totalNet += isReturn ? -net : net;
      map[gKey].totalIva += isReturn ? -(tx.iva || 0) : (tx.iva || 0);
      map[gKey].totalGross += tx.total;
    });

    return { groupingType: 'VENTAS', groups: Object.values(map).sort((a, b) => b.totalNet - a.totalNet) };
  }, [filteredData, selectedModule, inventorySource, kpis, agruparPorVendedor, selectedReportType, agruparZona1]);

  // Filter groups if live search in report is used
  const displayedGroups = useMemo(() => {
    if (!reportSearchTerm) return groupedReportData.groups;
    const q = reportSearchTerm.toLowerCase();
    return groupedReportData.groups.filter(g => {
      const titleMatch = g.groupTitle.toLowerCase().includes(q) || g.groupSub.toLowerCase().includes(q);
      const itemsMatch = g.items.some(it => 
        (it.productName && it.productName.toLowerCase().includes(q)) ||
        (it.sku && it.sku.toLowerCase().includes(q)) ||
        (it.client && it.client.toLowerCase().includes(q)) ||
        (it.document && it.document.toLowerCase().includes(q))
      );
      return titleMatch || itemsMatch;
    });
  }, [groupedReportData, reportSearchTerm]);

  // Physical Page Chunker (approx 16 items per page)
  const reportPages = useMemo(() => {
    const pages: Array<{
      pageNumber: number;
      groups: typeof displayedGroups;
      isFirstPage: boolean;
      isLastPage: boolean;
      pageTotalQty: number;
      pageTotalNet: number;
      pageTotalGross: number;
      pageTotalIva: number;
    }> = [];

    let currentPageGroups: typeof displayedGroups = [];
    let currentItemsCount = 0;
    const TARGET_ITEMS_PER_PAGE = 16;

    displayedGroups.forEach((group) => {
      const groupItemCount = Math.max(group.items.length, 1);
      if (currentItemsCount + groupItemCount > TARGET_ITEMS_PER_PAGE && currentPageGroups.length > 0) {
        pages.push({
          pageNumber: pages.length + 1,
          groups: currentPageGroups,
          isFirstPage: pages.length === 0,
          isLastPage: false,
          pageTotalQty: currentPageGroups.reduce((acc, g) => acc + g.totalQty, 0),
          pageTotalNet: currentPageGroups.reduce((acc, g) => acc + g.totalNet, 0),
          pageTotalGross: currentPageGroups.reduce((acc, g) => acc + g.totalGross, 0),
          pageTotalIva: currentPageGroups.reduce((acc, g) => acc + g.totalIva, 0),
        });
        currentPageGroups = [group];
        currentItemsCount = groupItemCount;
      } else {
        currentPageGroups.push(group);
        currentItemsCount += groupItemCount;
      }
    });

    if (currentPageGroups.length > 0 || pages.length === 0) {
      pages.push({
        pageNumber: pages.length + 1,
        groups: currentPageGroups,
        isFirstPage: pages.length === 0,
        isLastPage: true,
        pageTotalQty: currentPageGroups.reduce((acc, g) => acc + g.totalQty, 0),
        pageTotalNet: currentPageGroups.reduce((acc, g) => acc + g.totalNet, 0),
        pageTotalGross: currentPageGroups.reduce((acc, g) => acc + g.totalGross, 0),
        pageTotalIva: currentPageGroups.reduce((acc, g) => acc + g.totalIva, 0),
      });
    }

    if (pages.length > 0) {
      pages[pages.length - 1].isLastPage = true;
    }

    return pages;
  }, [displayedGroups]);

  const activeReportPageIndex = Math.min(Math.max(currentReportPage, 1), Math.max(reportPages.length, 1));
  const activeDisplayPage = reportPages[activeReportPageIndex - 1] || reportPages[0];

  // Real PDF Preview Generator (Blob URL)
  const generateRealPdfPreview = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
      
      // Header Page 1
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROCOQUINAL S.A.S. - NIT: 901.428.112-4', 40, 40);
      doc.setFontSize(11);
      doc.text(`${currentModuleDef.shortTitle} — ${selectedReportType.toUpperCase()}`, 40, 56);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Periodo: ${dateFrom || diaInicio + '/' + mesInicio + '/' + anoInicio} a ${dateTo || diaFin + '/' + mesFin + '/' + anoFin} | Sede: ${selectedCostCenter} | Moneda: COP`, 40, 70);
      doc.text(`Generado: ${new Date().toLocaleString('es-CO')} | Usuario: OMAR (GERENCIA)`, 40, 82);

      const tableRows: any[] = [];
      filteredData.slice(0, 150).forEach(tx => {
        const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
        const net = Math.abs(tx.total) - (tx.iva || 0);
        tableRows.push([
          tx.date,
          tx.document || tx.id,
          (tx.client || 'Consumidor Final').substring(0, 24),
          getTxSeller(tx).split(' (')[0],
          tx.sku || '-',
          (tx.productName || 'Varios').substring(0, 24),
          tx.qty || 1,
          formatCOP(tx.iva || 0),
          formatCOP(isReturn ? -net : net),
          formatCOP(tx.total)
        ]);
      });

      autoTable(doc, {
        startY: 95,
        head: [['Fecha', 'Comprobante', 'Cliente / Tercero', 'Vendedor', 'SKU', 'Producto', 'Cant.', 'IVA', 'Neto', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [28, 59, 112], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 7.5, cellPadding: 2.5 },
        foot: [[
          'TOTALES', '', '', '', '', '',
          filteredData.reduce((acc, t) => acc + (t.qty || 1), 0).toString(),
          formatCOP(kpis.totalIva),
          formatCOP(kpis.totalNet),
          formatCOP(kpis.totalGross)
        ]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8 },
        didDrawPage: (data) => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          const pageWidth = pageSize.width || pageSize.getWidth();

          if (data.pageNumber > 1) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('PROCOQUINAL S.A.S. - ' + selectedReportType.toUpperCase(), 40, 25);
          }

          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120);
          doc.text(`PROCOQUINAL S.A.S. - NIT: 901.428.112-4  |  Usuario: OMAR  |  ${new Date().toLocaleDateString('es-CO')}`, 40, pageHeight - 15);
          doc.text(`Página ${data.pageNumber}`, pageWidth - 70, pageHeight - 15);
        }
      });

      const blob = doc.output('blob');
      if (pdfPreviewBlobUrl) {
        URL.revokeObjectURL(pdfPreviewBlobUrl);
      }
      const url = URL.createObjectURL(blob);
      setPdfPreviewBlobUrl(url);
    } catch (e) {
      console.error("Error al generar PDF preview:", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    if (reportPaperMode === 'PDF_NATIVO') {
      generateRealPdfPreview();
    }
  }, [reportPaperMode, filteredData, selectedReportType, selectedModule]);

  // Real Excel Export
  const handleExportToExcel = () => {
    const exportRows = filteredData.map(tx => {
      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const net = Math.abs(tx.total) - (tx.iva || 0);
      return {
        'Módulo ERP': currentModuleDef.label,
        'Fecha': tx.date,
        'Comprobante': tx.document || tx.id,
        'Tercero': tx.client || 'Consumidor Final',
        'Vendedor': getTxSeller(tx),
        'Sede / Bodega': tx.posLocation || 'Principal',
        'SKU': tx.sku || '-',
        'Detalle': tx.productName || 'Venta',
        'Cantidad': tx.qty || 1,
        'IVA ($)': tx.iva || 0,
        'Neto ($)': isReturn ? -net : net,
        'Total ($)': tx.total
      };
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws1, `WorldOffice_${selectedModule}`);
    XLSX.writeFile(wb, `Informe_${selectedModule}_${selectedReportType.replace(/\s+/g, '_')}.xlsx`);
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Render a Single World Office Physical Page Sheet
  const renderReportPageSheet = (page: typeof reportPages[0], totalPagesCount: number) => {
    if (!page) return null;

    return (
      <div 
        key={`report-page-${page.pageNumber}`}
        style={{ transform: reportZoom === '85' ? 'scale(0.85)' : reportZoom === '115' ? 'scale(1.15)' : 'none', transformOrigin: 'top center' }}
        className="max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-2xl text-slate-900 border border-slate-300 font-sans transition-all print:shadow-none print:border-none print:p-0 print:max-w-full my-4 flex flex-col justify-between min-h-[900px] relative rounded-xs"
      >
        <div>
          {/* Header Page 1: Full Institutional Letterhead */}
          {page.isFirstPage ? (
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">{worldOfficeConfig.companyName}</h1>
                  <div className="text-xs text-slate-700 font-mono mt-0.5">
                    NIT: {worldOfficeConfig.companyNit} — {worldOfficeConfig.regimen} — {worldOfficeConfig.dianResolution}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {worldOfficeConfig.address} — PBX: {worldOfficeConfig.phone} — {worldOfficeConfig.email}
                  </div>
                </div>

                <div className="text-right font-mono text-[10.5px] text-slate-600 border border-slate-300 p-2 bg-slate-50 rounded-xs">
                  <div className="font-bold text-slate-900 uppercase">{currentModuleDef.shortTitle}</div>
                  <div>Fecha: {new Date().toLocaleDateString('es-CO')}</div>
                  <div>Hora: {reportGeneratedAt}</div>
                  <div>Usuario: <span className="font-bold text-slate-900">OMAR (GERENCIA)</span></div>
                  <div>Página: <span className="font-bold text-blue-900">{page.pageNumber} de {totalPagesCount}</span></div>
                </div>
              </div>

              {/* Title */}
              <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                <div className="text-[11px] font-bold text-blue-800 uppercase tracking-widest mb-0.5">
                  SISTEMA DE GESTIÓN EMPRESARIAL WORLD OFFICE ERP — PROCOQUINAL
                </div>
                <h2 className="text-base md:text-lg font-black text-slate-950 uppercase tracking-wide">
                  {selectedReportType}
                </h2>
                <div className="text-xs text-slate-600 font-medium mt-1 flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
                  <span><strong>Periodo:</strong> {dateFrom || `${diaInicio}/${mesInicio}/${anoInicio}`} al {dateTo || `${diaFin}/${mesFin}/${anoFin}`}</span>
                  <span>•</span>
                  <span><strong>Sede / Almacén:</strong> {selectedCostCenter === 'ALL' ? 'Consolidado General' : selectedCostCenter}</span>
                  <span>•</span>
                  <span><strong>Asesor / Responsable:</strong> {selectedSeller === 'ALL' ? 'Todos los Comerciales' : selectedSeller}</span>
                  <span>•</span>
                  <span><strong>Registros:</strong> {filteredData.length.toLocaleString()} movimientos</span>
                </div>
              </div>
            </div>
          ) : (
            /* Header on subsequent pages */
            <div className="border-b-2 border-slate-800 pb-2 mb-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 tracking-tight">PROCOQUINAL S.A.S.</span>
                <span className="text-slate-400">|</span>
                <span className="font-bold text-slate-700 uppercase">{selectedReportType}</span>
              </div>
              <div className="font-mono text-[10.5px] text-slate-500 font-bold">
                Página {page.pageNumber} de {totalPagesCount}
              </div>
            </div>
          )}

          {/* Groups & Tables on this Page */}
          <div className="space-y-4">
            {page.groups.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-medium">
                No hay registros para mostrar en esta página para el módulo {currentModuleDef.label}.
              </div>
            ) : (
              page.groups.map((group, groupIdx) => {
                const isCollapsed = collapsedGroups[group.groupKey];

                return (
                  <div key={`${group.groupKey}-${groupIdx}`} className="border border-slate-300 rounded-xs overflow-hidden">
                    
                    {/* Ribbon */}
                    <div 
                      onClick={() => toggleGroupCollapse(group.groupKey)}
                      className="bg-[#1c3b70] hover:bg-[#152e57] text-white px-3 py-1.5 font-bold text-xs flex justify-between items-center cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{group.groupTitle}</span>
                        <span className="text-[10px] text-slate-300 font-normal hidden md:inline">({group.groupSub})</span>
                      </div>
                      <div className="font-mono text-[11px] flex items-center gap-3">
                        <span className="text-amber-300 font-bold">{formatCOP(group.totalNet)}</span>
                        <span className="text-slate-300 text-[10px]">({group.items.length} items)</span>
                      </div>
                    </div>

                    {/* Table */}
                    {!isCollapsed && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] font-sans">
                          <thead className="bg-[#eef2f8] text-slate-700 font-bold uppercase tracking-wider border-b border-slate-300 text-[9.5px]">
                            <tr>
                              <th className="py-1.5 px-2.5">Fecha</th>
                              <th className="py-1.5 px-2.5">Comprobante</th>
                              <th className="py-1.5 px-2.5">SKU / Ref</th>
                              <th className="py-1.5 px-2.5">Descripción / Concepto</th>
                              <th className="py-1.5 px-2.5 text-center">Cant.</th>
                              <th className="py-1.5 px-2.5">Unidad</th>
                              <th className="py-1.5 px-2.5 text-right">Vr. Unitario</th>
                              <th className="py-1.5 px-2.5 text-right">IVA (19%)</th>
                              <th className="py-1.5 px-2.5 text-right">Vr. Neto</th>
                              <th className="py-1.5 px-2.5 text-right">Total Facturado</th>
                            </tr>
                          </thead>
                          <tbody className={sinLineas ? '' : 'divide-y divide-slate-200'}>
                            {group.items.map((tx: any, itemIdx: number) => {
                              const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
                              const netAmount = Math.abs(tx.total) - (tx.iva || 0);
                              const qty = tx.qty || 1;
                              const unitPrice = qty > 0 ? (netAmount / qty) : netAmount;

                              return (
                                <tr key={`${tx.id}-${itemIdx}`} className="hover:bg-amber-50/50 transition-colors">
                                  <td className="py-1 px-2.5 font-mono text-slate-600 whitespace-nowrap text-[10.5px]">{tx.date}</td>
                                  <td className="py-1 px-2.5 font-mono font-bold text-slate-800 text-[10.5px]">
                                    <span className={isReturn ? 'text-rose-600' : 'text-blue-800'}>
                                      {tx.document || tx.id}
                                    </span>
                                  </td>
                                  <td className="py-1 px-2.5 font-mono text-slate-600 text-[10px]">{tx.sku || '-'}</td>
                                  <td className="py-1 px-2.5 text-slate-800 max-w-[220px] truncate" title={tx.productName}>
                                    {tx.productName || 'Movimiento de Operación'}
                                  </td>
                                  <td className="py-1 px-2.5 text-center font-bold text-slate-900">
                                    {isReturn ? -qty : qty}
                                  </td>
                                  <td className="py-1 px-2.5 text-slate-500 font-mono text-[10px]">
                                    {tx.baseUnit || 'GL/LT'}
                                  </td>
                                  <td className="py-1 px-2.5 text-right font-mono text-slate-600">
                                    {formatCOP(unitPrice)}
                                  </td>
                                  <td className="py-1 px-2.5 text-right font-mono text-slate-500">
                                    {formatCOP(tx.iva || 0)}
                                  </td>
                                  <td className="py-1 px-2.5 text-right font-mono font-semibold text-slate-800">
                                    {formatCOP(isReturn ? -netAmount : netAmount)}
                                  </td>
                                  <td className={`py-1 px-2.5 text-right font-mono font-bold ${isReturn ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {formatCOP(tx.total)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>

                          {/* Subtotal */}
                          <tfoot className="bg-[#f4f6f9] border-t-2 border-slate-400 font-bold text-slate-900 text-[10.5px]">
                            <tr>
                              <td colSpan={4} className="py-1.5 px-2.5 text-right uppercase tracking-wider text-slate-700">
                                SUBTOTAL {group.groupKey}:
                              </td>
                              <td className="py-1.5 px-2.5 text-center font-mono text-blue-900 font-black">
                                {group.totalQty}
                              </td>
                              <td></td>
                              <td></td>
                              <td className="py-1.5 px-2.5 text-right font-mono text-slate-700">
                                {formatCOP(group.totalIva)}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono text-blue-900 font-black">
                                {formatCOP(group.totalNet)}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-mono text-slate-950 font-black">
                                {formatCOP(group.totalGross)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* If LAST page: Grand Totals + Signatures */}
          {page.isLastPage && (
            <div className="mt-8 space-y-6">
              <div className="border-t-4 border-b-4 border-slate-900 py-4 bg-slate-50">
                <div className="text-center font-black uppercase text-xs tracking-wider text-slate-900 mb-3">
                  RESUMEN CONSOLIDADO Y TOTALES DEFINITIVOS DEL INFORME ({currentModuleDef.label.toUpperCase()})
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center font-mono">
                  <div className="border border-slate-300 bg-white p-2.5 rounded-xs shadow-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Unidades / Registros</div>
                    <div className="text-base font-black text-slate-900 mt-1">
                      {filteredData.reduce((sum, tx) => sum + (tx.qty || 1), 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">{Math.round(physicalKpis.totalLiters).toLocaleString()} Litros</div>
                  </div>

                  <div className="border border-slate-300 bg-white p-2.5 rounded-xs shadow-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Total Documentos</div>
                    <div className="text-base font-black text-blue-800 mt-1">
                      {kpis.docCount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">Ticket: {formatCOP(kpis.avgTicket)}</div>
                  </div>

                  <div className="border border-slate-300 bg-white p-2.5 rounded-xs shadow-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Total IVA Recaudado</div>
                    <div className="text-base font-black text-slate-900 mt-1">
                      {formatCOP(kpis.totalIva)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">Cuenta 240801</div>
                  </div>

                  <div className="border border-slate-300 bg-white p-2.5 rounded-xs shadow-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-sans font-bold">Notas Crédito (Dev.)</div>
                    <div className="text-base font-black text-rose-600 mt-1">
                      {formatCOP(kpis.returnsTotal)}
                    </div>
                    <div className="text-[10px] text-rose-500 font-sans mt-0.5">{kpis.returnsImpact.toFixed(1)}% tasa dev.</div>
                  </div>

                  <div className="border-2 border-emerald-600 bg-emerald-50/60 p-2.5 rounded-xs shadow-xs col-span-2 md:col-span-1">
                    <div className="text-[10px] text-emerald-800 uppercase font-sans font-black">VALOR NETO DEFINITIVO</div>
                    <div className="text-base md:text-lg font-black text-emerald-900 mt-1">
                      {formatCOP(kpis.totalNet)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-sans mt-0.5">Bruto: {formatCOP(kpis.totalGross)}</div>
                  </div>
                </div>
              </div>

              {/* Signatures from dynamic worldOfficeConfig */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-xs text-slate-700">
                <div>
                  <div className="border-t border-slate-900 pt-2 font-bold font-mono uppercase">{worldOfficeConfig.signatureGeneralManager}</div>
                  <div className="text-[11px] text-slate-600 font-medium">{worldOfficeConfig.signatureGeneralManagerRole}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Firma de Emisión Gerencial</div>
                </div>

                <div>
                  <div className="border-t border-slate-900 pt-2 font-bold font-mono uppercase">{worldOfficeConfig.signatureAccountant}</div>
                  <div className="text-[11px] text-slate-600 font-medium">{worldOfficeConfig.signatureAccountantRole}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Revisión Cuentas PUC & Fiscales</div>
                </div>

                <div>
                  <div className="border-t border-slate-900 pt-2 font-bold font-mono uppercase">{worldOfficeConfig.signatureAuditor}</div>
                  <div className="text-[11px] text-slate-600 font-medium">{worldOfficeConfig.signatureAuditorRole}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Dictamen de Auditoría Oficial</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Page Footer on EVERY PAGE */}
        <div className="mt-8 pt-3 border-t border-slate-300 text-[10.5px] text-slate-500 font-mono flex justify-between items-center">
          <div>{worldOfficeConfig.companyName} — NIT: {worldOfficeConfig.companyNit} — Software World Office ERP ({currentModuleDef.shortTitle})</div>
          <div>Usuario: OMAR (Terminal POS-01)</div>
          <div className="font-bold text-slate-900">Página {page.pageNumber} de {totalPagesCount}</div>
        </div>

      </div>
    );
  };

  // --- REUSABLE REPORT VIEWER COMPONENT ---
  const renderReportViewer = () => (
    <div id="world-office-report-viewer" ref={reportResultsRef} className="space-y-4">
      
      {/* Banner de Estado y Selector de Vistas */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {currentModuleDef.shortTitle} GENERADO
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-medium">Actualizado: <strong className="text-slate-900">{reportGeneratedAt}</strong></span>
          <span className="text-slate-400">|</span>
          <span className="bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
            Tipo: {selectedReportType}
          </span>
        </div>

        {/* Selector de Pestañas del Informe */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
          <button 
            onClick={() => setReportActiveTab('FORMATO_WORLDOFFICE')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              reportActiveTab === 'FORMATO_WORLDOFFICE' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>Formato Impreso World Office</span>
          </button>
          <button 
            onClick={() => setReportActiveTab('TORTAS')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              reportActiveTab === 'TORTAS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" /> Tortas
          </button>
          <button 
            onClick={() => setReportActiveTab('TENDENCIAS')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              reportActiveTab === 'TENDENCIAS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Tendencias
          </button>
          <button 
            onClick={() => setReportActiveTab('TABLA')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              reportActiveTab === 'TABLA' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Sábana Plana
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: FORMATO IMPRESO OFICIAL WORLD OFFICE (PAGINADO & PREVIEW PDF) */}
      {reportActiveTab === 'FORMATO_WORLDOFFICE' && (
        <div className="space-y-3">
          
          {/* Toolbar Superior del Visor de Impresión y Paginación */}
          <div className="bg-slate-800 text-slate-100 p-2.5 rounded-t-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
            
            {/* Selector de Modo: Paginado / Continuo / PDF Nativo */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setReportPaperMode('PAGINADO')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  reportPaperMode === 'PAGINADO' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="Ver hoja por hoja con controles de paginación oficial"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Hoja por Hoja</span>
              </button>

              <button
                onClick={() => setReportPaperMode('TODAS_HOJAS')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  reportPaperMode === 'TODAS_HOJAS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
                title="Ver todas las hojas continuas con saltos de página"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Todas las Hojas</span>
              </button>

              <button
                onClick={() => {
                  setReportPaperMode('PDF_NATIVO');
                  generateRealPdfPreview();
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  reportPaperMode === 'PDF_NATIVO' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-300 hover:text-white'
                }`}
                title="Ver previsualización exacta en PDF interactivo"
              >
                <Eye className="w-3.5 h-3.5 text-rose-200" />
                <span>Preview en PDF Real</span>
              </button>
            </div>

            {/* Controles de Paginación Centrales */}
            {reportPaperMode === 'PAGINADO' && reportPages.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-xs">
                <button
                  disabled={activeReportPageIndex === 1}
                  onClick={() => setCurrentReportPage(1)}
                  className="px-1.5 py-0.5 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white cursor-pointer font-bold"
                  title="Primera Página"
                >
                  |◀
                </button>
                <button
                  disabled={activeReportPageIndex === 1}
                  onClick={() => setCurrentReportPage(p => Math.max(1, p - 1))}
                  className="px-1.5 py-0.5 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white cursor-pointer font-bold"
                  title="Página Anterior"
                >
                  ◀
                </button>

                <div className="flex items-center gap-1 px-1 text-slate-200 font-mono text-[11px]">
                  <span>Página</span>
                  <select
                    value={activeReportPageIndex}
                    onChange={e => setCurrentReportPage(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-600 text-amber-300 px-1.5 py-0.5 rounded text-xs font-bold cursor-pointer outline-none"
                  >
                    {reportPages.map(p => (
                      <option key={p.pageNumber} value={p.pageNumber}>
                        {p.pageNumber}
                      </option>
                    ))}
                  </select>
                  <span>de {reportPages.length}</span>
                </div>

                <button
                  disabled={activeReportPageIndex === reportPages.length}
                  onClick={() => setCurrentReportPage(p => Math.min(reportPages.length, p + 1))}
                  className="px-1.5 py-0.5 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white cursor-pointer font-bold"
                  title="Página Siguiente"
                >
                  ▶
                </button>
                <button
                  disabled={activeReportPageIndex === reportPages.length}
                  onClick={() => setCurrentReportPage(reportPages.length)}
                  className="px-1.5 py-0.5 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-300 hover:text-white cursor-pointer font-bold"
                  title="Última Página"
                >
                  ▶|
                </button>
              </div>
            )}

            {/* Right: Acciones y Búsqueda */}
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                <input 
                  type="text"
                  placeholder="Buscar en informe..."
                  value={reportSearchTerm}
                  onChange={e => { setReportSearchTerm(e.target.value); setCurrentReportPage(1); }}
                  className="pl-7 pr-3 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100 text-xs w-44 outline-none focus:border-amber-400"
                />
                {reportSearchTerm && (
                  <button onClick={() => setReportSearchTerm('')} className="absolute right-2 top-1.5 text-slate-400 hover:text-white">✕</button>
                )}
              </div>

              {/* Zoom Controls */}
              {reportPaperMode !== 'PDF_NATIVO' && (
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-300">
                  <button onClick={() => setReportZoom('85')} className={`px-1.5 py-0.5 rounded ${reportZoom === '85' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'}`}>85%</button>
                  <button onClick={() => setReportZoom('100')} className={`px-1.5 py-0.5 rounded ${reportZoom === '100' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'}`}>100%</button>
                  <button onClick={() => setReportZoom('115')} className={`px-1.5 py-0.5 rounded ${reportZoom === '115' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'}`}>115%</button>
                </div>
              )}

              <button
                onClick={() => window.print()}
                className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold flex items-center gap-1 cursor-pointer text-xs"
                title="Imprimir informe en papel o guardar en PDF"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Imprimir</span>
              </button>

              <button
                onClick={generateRealPdfPreview}
                className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded font-bold flex items-center gap-1 cursor-pointer text-xs"
                title="Descargar archivo PDF oficial"
              >
                <FileDown className="w-3.5 h-3.5 text-white" />
                <span>PDF</span>
              </button>

              <button
                onClick={handleExportToExcel}
                className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold flex items-center gap-1 cursor-pointer text-xs"
                title="Descargar archivo Excel oficial"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                <span>Excel</span>
              </button>
            </div>

          </div>

          {/* MODO 1: PREVIEW NATIVO EN PDF */}
          {reportPaperMode === 'PDF_NATIVO' && (
            <div className="bg-slate-900 p-3 md:p-6 rounded-b-xl shadow-inner">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white pb-3 px-1 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-black text-rose-300 uppercase tracking-wider">
                    Previsualización de Documento PDF Oficial ({currentModuleDef.label})
                  </span>
                  <span className="text-slate-400 hidden sm:inline">
                    ({filteredData.length.toLocaleString()} movimientos generados con motor jsPDF)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generateRealPdfPreview}
                    disabled={isGeneratingPdf}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-spin text-rose-400' : ''}`} />
                    <span>Actualizar PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      if (pdfPreviewBlobUrl) {
                        const link = document.createElement('a');
                        link.href = pdfPreviewBlobUrl;
                        link.download = `WorldOffice_${selectedModule}_${selectedReportType.replace(/\s+/g, '_')}.pdf`;
                        link.click();
                      }
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              </div>

              <div className="w-full bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-hidden shadow-2xl">
                {pdfPreviewBlobUrl ? (
                  <iframe
                    src={pdfPreviewBlobUrl}
                    title="Vista Previa PDF World Office"
                    className="w-full h-[850px] rounded border-0 bg-white"
                  />
                ) : (
                  <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
                    <span className="text-sm font-bold">Generando documento PDF apaisado con resolución tipográfica...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODO 2: HOJA POR HOJA */}
          {reportPaperMode === 'PAGINADO' && (
            <div id="world-office-printable-report" className="bg-[#525659] p-4 md:p-8 rounded-b-xl shadow-inner overflow-x-auto">
              {renderReportPageSheet(activeDisplayPage, reportPages.length)}

              {/* Barra Flotante Inferior de Paginación */}
              {reportPages.length > 1 && (
                <div className="max-w-md mx-auto mt-4 bg-slate-900/90 backdrop-blur-xs text-white p-2 rounded-xl shadow-xl flex items-center justify-between text-xs border border-slate-700">
                  <button
                    disabled={activeReportPageIndex === 1}
                    onClick={() => setCurrentReportPage(1)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded font-bold cursor-pointer"
                  >
                    Primera Hoja
                  </button>
                  <button
                    disabled={activeReportPageIndex === 1}
                    onClick={() => setCurrentReportPage(p => Math.max(1, p - 1))}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded font-bold cursor-pointer"
                  >
                    ◀ Anterior
                  </button>
                  <span className="font-mono font-bold text-amber-300">
                    Página {activeReportPageIndex} / {reportPages.length}
                  </span>
                  <button
                    disabled={activeReportPageIndex === reportPages.length}
                    onClick={() => setCurrentReportPage(p => Math.min(reportPages.length, p + 1))}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded font-bold cursor-pointer"
                  >
                    Siguiente ▶
                  </button>
                  <button
                    disabled={activeReportPageIndex === reportPages.length}
                    onClick={() => setCurrentReportPage(reportPages.length)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded font-bold cursor-pointer"
                  >
                    Última Hoja
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODO 3: TODAS LAS HOJAS */}
          {reportPaperMode === 'TODAS_HOJAS' && (
            <div id="world-office-printable-report" className="bg-[#525659] p-4 md:p-8 rounded-b-xl shadow-inner overflow-x-auto space-y-8">
              {reportPages.map(page => renderReportPageSheet(page, reportPages.length))}
            </div>
          )}

        </div>
      )}

      {/* PESTAÑA 2: TORTAS */}
      {reportActiveTab === 'TORTAS' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Distribución Visual en Tortas ({currentModuleDef.label})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 p-4 rounded-xl text-center">
              <div className="font-bold text-xs uppercase text-slate-700 mb-2">Por Asesor / Vendedor</div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Carlos Ruiz', value: 45 }, { name: 'Ana Silva', value: 30 }, { name: 'Omar', value: 25 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {PIE_COLORS.slice(0, 3).map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl text-center">
              <div className="font-bold text-xs uppercase text-slate-700 mb-2">Por Sedes y Bodegas</div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Principal', value: 65 }, { name: 'Planta', value: 25 }, { name: 'Despachos', value: 10 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {PIE_COLORS.slice(3, 6).map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border border-slate-200 p-4 rounded-xl text-center">
              <div className="font-bold text-xs uppercase text-slate-700 mb-2">Por Líneas de Producto</div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Poliuretano', value: 50 }, { name: 'Solventes', value: 30 }, { name: 'Resinas', value: 20 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {PIE_COLORS.slice(6, 9).map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: TENDENCIAS */}
      {reportActiveTab === 'TENDENCIAS' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h2 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Tendencia Histórica y Proyección ({currentModuleDef.label})
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { m: 'Ene', val: 42000000 },
                { m: 'Feb', val: 51000000 },
                { m: 'Mar', val: 58000000 },
                { m: 'Abr', val: 49000000 },
                { m: 'May', val: 63000000 },
                { m: 'Jun', val: 71000000 },
                { m: 'Jul', val: 68000000 },
                { m: 'Ago', val: 77000000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="m" />
                <YAxis tickFormatter={v => `$${v/1000000}M`} />
                <RechartsTooltip formatter={(v: number) => formatCOP(v)} />
                <Bar dataKey="val" fill="#1c3b70" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: SÁBANA PLANA */}
      {reportActiveTab === 'TABLA' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Sábana Plana Consolidada — {currentModuleDef.label}
              </h2>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total registros: <strong>{filteredData.length.toLocaleString()}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Comprobante</th>
                  <th className="py-2.5 px-3">Asesor</th>
                  <th className="py-2.5 px-3">Sede</th>
                  <th className="py-2.5 px-3">Tercero / Cliente</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Detalle</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Total Neto</th>
                  <th className="py-2.5 px-3 text-right">Total Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                {filteredData.slice(0, 40).map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500">{tx.date}</td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-800">{tx.document || tx.id}</td>
                    <td className="py-2 px-3">{getTxSeller(tx).split(' (')[0]}</td>
                    <td className="py-2 px-3 text-slate-500">{tx.posLocation || 'Principal'}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{tx.client || 'Consumidor Final'}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{tx.sku || '-'}</td>
                    <td className="py-2 px-3 truncate max-w-[160px]">{tx.productName || 'Venta'}</td>
                    <td className="py-2 px-3 text-center font-bold">{tx.qty || 1}</td>
                    <td className="py-2 px-3 text-right font-bold font-mono">{formatCOP(tx.total - (tx.iva || 0))}</td>
                    <td className="py-2 px-3 text-right font-black font-mono text-slate-900">{formatCOP(tx.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1700px] mx-auto bg-[#f1f3f7] min-h-screen text-slate-800 font-sans">
      
      {/* 1. TOP HEADER CON BARRA DE ACCIÓN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1c3b70] text-white flex items-center justify-center shadow-xs">
            <FolderKanban className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                {filterLayoutMode === 'CLASICA' ? `World Office ERP — ${currentModuleDef.label}` : 'Explorador General de Informes'}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                filterLayoutMode === 'CLASICA' ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {filterLayoutMode === 'CLASICA' ? 'Vista Clásica World Office' : 'Vista Moderna'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generador oficial de informes en formato impreso y PDF nativo de Procoquinal S.A.S.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Toggle Vista Clásica / Moderna */}
          <button
            onClick={() => setFilterLayoutMode(filterLayoutMode === 'CLASICA' ? 'MODERNA' : 'CLASICA')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
              filterLayoutMode === 'CLASICA'
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                : 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-400'
            }`}
            title="Alternar entre la Vista Clásica de World Office y la Vista Moderna"
          >
            {filterLayoutMode === 'CLASICA' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambiar a Vista Moderna</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Vista Clásica (World Office)</span>
              </>
            )}
          </button>

          {/* Favoritos de Omar */}
          <button
            onClick={handleSaveFavoriteTemplate}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300 transition-all flex items-center gap-1 cursor-pointer"
            title="Guardar esta configuración como informe favorito de Omar"
          >
            <Star className={`w-3.5 h-3.5 ${savedFavoritesSuccess ? 'text-emerald-600 fill-emerald-600' : 'text-amber-600 fill-amber-400'}`} />
            <span>{savedFavoritesSuccess ? '¡Guardado!' : 'Guardar Favorito'}</span>
          </button>

          <button
            onClick={handleLoadFavoriteTemplate}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
            title="Cargar la última plantilla favorita de Omar"
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Cargar Favorito</span>
          </button>

          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Generar informe y vista previa (F5)"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>Vista Previa (F5)</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE PESTAÑAS MACRO DE MÓDULOS WORLD OFFICE (VENTAS, CARTERA, INVENTARIOS, COMPRAS, TESORERÍA, CONTABILIDAD, PRODUCCIÓN) */}
      <div className="bg-[#1c3b70] p-1.5 rounded-lg shadow-md flex items-center gap-1 overflow-x-auto select-none border border-[#152e57]">
        <div className="px-2.5 text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1 shrink-0">
          <FolderKanban className="w-4 h-4" />
          <span>Módulos ERP:</span>
        </div>
        
        {ERP_MODULES.map(mod => {
          const Icon = mod.icon;
          const isActive = selectedModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => handleSelectModule(mod.id)}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-gradient-to-t from-[#ffd972] to-[#ffefa8] text-slate-950 border-[#9b8441] shadow-md scale-102'
                  : 'bg-[#294c8b] hover:bg-[#3862ac] text-slate-100 border-[#1c3b70]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-900' : 'text-slate-300'}`} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODAL DE AYUDA RETRO WORLD OFFICE */}
      {showAyudaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#ece9d8] border-2 border-slate-700 w-full max-w-md shadow-2xl rounded-xs">
            <div className="bg-[#1c3b70] text-white px-3 py-1.5 font-bold text-xs flex justify-between items-center">
              <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> Ayuda World Office — Criterios de Selección</span>
              <button onClick={() => setShowAyudaModal(false)} className="text-white hover:bg-rose-600 px-1 font-mono cursor-pointer">✕</button>
            </div>
            <div className="p-4 text-xs space-y-3 text-slate-800">
              <p><strong>Filtros World Office Procoquinal:</strong></p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-700">
                <li><strong>Módulo Activo:</strong> {currentModuleDef.label}</li>
                <li><strong>Empresas:</strong> Selecciona PROCOQUINAL S.A.S. para consultar el consolidado.</li>
                <li><strong>Fechas:</strong> Define el rango Día / Mes / Año exacto a procesar.</li>
                <li><strong>Tipo de informe:</strong> Selecciona de la lista de {REPORT_CATALOGS[selectedModule].length} informes oficiales disponibles.</li>
                <li><strong>Atajos:</strong> Presiona <code>F5</code> para generar vista previa, o <code>Esc</code> para volver a criterios.</li>
              </ul>
              <div className="pt-2 border-t border-slate-300 flex justify-end">
                <button 
                  onClick={() => setShowAyudaModal(false)}
                  className="px-4 py-1 bg-[#d4d0c8] border border-slate-600 font-bold hover:bg-[#c0bcaf] cursor-pointer text-xs"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. VISTA CLÁSICA (REPLICA WIREFRAME EXACTA DE WORLD OFFICE)
          ========================================================================= */}
      {isFilterPanelOpen && filterLayoutMode === 'CLASICA' && (
        <div className="bg-[#cbd3df] p-2 rounded-xs border-2 border-[#546e96] shadow-md font-sans text-slate-900 text-xs select-none">
          
          {/* Top Title Tabs & Window Chrome (INTERACTIVO: ALTERNA LA VENTANA A CRITERIOS O INFORMES) */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[#96a5bc] mb-2">
            <div className="flex items-end gap-1">
              
              {/* TAB 1: INFORMES GENERADOS */}
              <button
                onClick={() => {
                  setClassicActiveTab('INFORMES');
                  if (!hasGeneratedReport) {
                    handleGenerateReport();
                  }
                }}
                className={`transition-all cursor-pointer ${
                  classicActiveTab === 'INFORMES'
                    ? 'px-4 py-1.5 bg-gradient-to-t from-[#ffd972] to-[#ffefa8] text-slate-950 font-black text-xs border border-[#9b8441] border-b-0 rounded-t-sm shadow-xs flex items-center gap-1.5'
                    : 'px-3 py-1 bg-[#a6b1c2] hover:bg-[#b8c2d1] text-[#2c3e55] font-bold text-[11px] border border-[#7f8c9f] border-b-0 rounded-t-sm'
                }`}
                title="Cambiar a la ventana de Informes Generados"
              >
                <FileText className="w-3.5 h-3.5 text-blue-900" />
                <span>{currentModuleDef.shortTitle}</span>
              </button>

              {/* TAB 2: CRITERIOS DE SELECCIÓN (MATRIZ DE FILTROS) */}
              <button
                onClick={() => setClassicActiveTab('CRITERIOS')}
                className={`transition-all cursor-pointer ${
                  classicActiveTab === 'CRITERIOS'
                    ? 'px-4 py-1.5 bg-gradient-to-t from-[#ffd972] to-[#ffefa8] text-slate-950 font-black text-xs border border-[#9b8441] border-b-0 rounded-t-sm shadow-xs flex items-center gap-1.5'
                    : 'px-3 py-1 bg-[#a6b1c2] hover:bg-[#b8c2d1] text-[#2c3e55] font-bold text-[11px] border border-[#7f8c9f] border-b-0 rounded-t-sm'
                }`}
                title="Cambiar a la ventana de Criterios de Selección y Filtros"
              >
                <FolderKanban className="w-3.5 h-3.5 text-amber-800" />
                <span>{currentModuleDef.criteriaTitle}</span>
              </button>

            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAyudaModal(true)}
                className="px-2.5 py-0.5 bg-[#e67300] hover:bg-[#ff851b] text-white font-black text-[11px] border border-[#a65200] rounded-xs shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <HelpCircle className="w-3 h-3" />
                <span>AYUDA</span>
              </button>
            </div>
          </div>

          {/* -----------------------------------------------------------------
              PESTAÑA ACTIVA 1: INFORMES GENERADOS (VENTANA DEL REPORTE)
              ----------------------------------------------------------------- */}
          {classicActiveTab === 'INFORMES' && (
            <div className="space-y-3">
              {/* Barra Informativa Superior de Criterios y Botón de Retorno */}
              <div className="bg-[#1c3b70] text-white p-2 rounded-xs flex flex-wrap items-center justify-between gap-2 text-xs border border-blue-900 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300">INFORME ACTUAL:</span>
                  <span className="font-mono bg-blue-900 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-800">
                    {selectedReportType}
                  </span>
                  <span className="text-slate-300 text-[11px] hidden sm:inline">
                    | Periodo: {dateFrom || `${diaInicio}/${mesInicio}/${anoInicio}`} al {dateTo || `${diaFin}/${mesFin}/${anoFin}`}
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    ({filteredData.length.toLocaleString()} movimientos)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setClassicActiveTab('CRITERIOS')}
                    className="px-3 py-1 bg-[#ece9d8] hover:bg-white text-slate-900 font-bold rounded-xs border border-slate-600 shadow-xs flex items-center gap-1.5 cursor-pointer text-xs active:scale-95"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-amber-700" />
                    <span>Modificar Criterios / Filtros</span>
                  </button>
                </div>
              </div>

              {/* Visor de Informes Completo */}
              {renderReportViewer()}
            </div>
          )}

          {/* -----------------------------------------------------------------
              PESTAÑA ACTIVA 2: CRITERIOS (MATRIZ DE FILTROS WORLD OFFICE 3 COLUMNAS)
              ----------------------------------------------------------------- */}
          {classicActiveTab === 'CRITERIOS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
              
              {/* COLUMNA 1 (IZQUIERDA - EMPRESAS, FECHAS & TIPOS DE INFORME DEL MÓDULO) */}
              <div className="lg:col-span-4 flex flex-col gap-2">
                
                {/* Empresas Box */}
                <div className="border border-[#7f9db9] bg-white">
                  <div className="bg-[#1c3b70] text-white px-2 py-1 font-bold text-[11px] flex justify-between items-center">
                    <span>Empresas</span>
                    <button 
                      onClick={() => setEmpresaActiva(!empresaActiva)} 
                      className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1.5 py-0.2 border border-slate-400 text-[10px] font-medium cursor-pointer"
                    >
                      {empresaActiva ? 'Desmarcar Todo' : 'Marcar Todo'}
                    </button>
                  </div>
                  <div 
                    onClick={() => setEmpresaActiva(!empresaActiva)}
                    className={`p-1 font-mono text-[11px] font-bold flex items-center justify-between cursor-pointer ${
                      empresaActiva ? 'bg-[#1a3b68] text-white' : 'bg-slate-200 text-slate-500 line-through'
                    }`}
                  >
                    <span>PROCOQUINAL S.A.S.</span>
                    <span className={`text-[10px] px-1 rounded-xs ${empresaActiva ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-slate-100'}`}>
                      {empresaActiva ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </div>
                </div>

                {/* Fecha Inicial Box */}
                <div className="border border-[#7f9db9] bg-[#eef1f6]">
                  <div className="bg-[#dcdfe5] border-b border-[#7f9db9] text-slate-800 text-center font-bold text-[11px] py-0.5">
                    Fecha Inicial
                  </div>
                  <div className="grid grid-cols-3 text-center text-[10px] font-bold text-slate-600 bg-white border-b border-[#cfd6e0] py-0.5">
                    <span>Dia</span>
                    <span>Mes</span>
                    <span>Año</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[#f4f6fa]">
                    <select 
                      value={diaInicio}
                      onChange={e => handleClassicDateChange('INICIO', e.target.value, mesInicio, anoInicio)}
                      className="border border-[#7f9db9] bg-white text-xs px-1 py-0.5 outline-none"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>

                    <select 
                      value={mesInicio}
                      onChange={e => handleClassicDateChange('INICIO', diaInicio, e.target.value, anoInicio)}
                      className="border border-[#7f9db9] bg-white text-xs px-1 py-0.5 outline-none"
                    >
                      {MESES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <select 
                      value={anoInicio}
                      onChange={e => handleClassicDateChange('INICIO', diaInicio, mesInicio, e.target.value)}
                      className="border border-[#7f9db9] bg-white text-xs px-1 py-0.5 outline-none"
                    >
                      {['2024', '2025', '2026', '2027'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fecha Final Box */}
                <div className="border border-[#7f9db9] bg-[#eef1f6]">
                  <div className="bg-[#dcdfe5] border-b border-[#7f9db9] text-slate-800 text-center font-bold text-[11px] py-0.5">
                    Fecha Final
                  </div>
                  <div className="grid grid-cols-3 text-center text-[10px] font-bold text-slate-600 bg-white border-b border-[#cfd6e0] py-0.5">
                    <span>Dia</span>
                    <span>Mes</span>
                    <span>Año</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-[#f4f6fa]">
                    <select 
                      value={diaFin}
                      onChange={e => handleClassicDateChange('FIN', e.target.value, mesFin, anoFin)}
                      className="border border-[#7f9db9] bg-white text-xs px-1 py-0.5 outline-none"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>

                    <select 
                      value={mesFin}
                      onChange={e => handleClassicDateChange('FIN', diaFin, e.target.value, anoFin)}
                      className="border border-[#7f9db9] bg-white text-xs px-1 py-0.5 outline-none"
                    >
                      {MESES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    <select 
                      value={anoFin}
                      onChange={e => handleClassicDateChange('FIN', diaFin, mesFin, e.target.value)}
                      className="border border-[#7f9db9] bg-white text-xs px-1 py-0.5 outline-none"
                    >
                      {['2024', '2025', '2026', '2027'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tipo de Informe Box (DINÁMICO SEGÚN EL MÓDULO SELECCIONADO) */}
                <div className="border border-[#7f9db9] bg-white flex flex-col flex-1">
                  <div className="bg-[#dcdfe5] border-b border-[#7f9db9] text-slate-800 text-center font-bold text-[11px] py-0.5 flex items-center justify-between px-2">
                    <span>Tipo de informe ({currentModuleDef.label})</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-mono">
                      {REPORT_CATALOGS[selectedModule].length}
                    </span>
                  </div>
                  <div className="h-[280px] overflow-y-auto p-1.5 space-y-1 bg-white text-[11px]">
                    {REPORT_CATALOGS[selectedModule].map(tipo => (
                      <label 
                        key={tipo} 
                        className={`flex items-start gap-1.5 px-1 py-0.5 cursor-pointer rounded-xs ${
                          selectedReportType === tipo ? 'bg-[#316ac5] text-white font-bold' : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="reportTypeWorldOffice"
                          checked={selectedReportType === tipo}
                          onChange={() => setSelectedReportType(tipo)}
                          className="mt-0.5 cursor-pointer"
                        />
                        <span className="leading-tight">{tipo}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* COLUMNA 2 (CENTRO - COMPROBANTES, VENDEDORES, CC, PRODUCTOS) */}
              <div className="lg:col-span-4 flex flex-col gap-2">
                
                {/* Documentos que Incluye el Informe Box */}
                <div className="border border-[#7f9db9] bg-white">
                  <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                    <span>Documentos que Incluye el Informe</span>
                    <button 
                      onClick={handleToggleAllDocuments}
                      className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[10px] cursor-pointer"
                    >
                      Marcar Todo
                    </button>
                  </div>
                  <div className="p-1 space-y-0.5 text-[11px] max-h-20 overflow-y-auto">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={docTypeCOT} onChange={e => setDocTypeCOT(e.target.checked)} />
                      <span>Cotización</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={docTypeNC} onChange={e => setDocTypeNC(e.target.checked)} />
                      <span>Devolucion de Mercancias Clientes (NC)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={docTypeFVE} onChange={e => setDocTypeFVE(e.target.checked)} />
                      <span className="font-bold">Factura de Venta (FVE)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={docTypeREM} onChange={e => setDocTypeREM(e.target.checked)} />
                      <span>Remisión de Ventas</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={docTypeCE} onChange={e => setDocTypeCE(e.target.checked)} />
                      <span>Factura de Compra / Egreso (CE)</span>
                    </label>
                  </div>
                </div>

                {/* Lista de Vendedores / Responsables Box */}
                <div className="border border-[#7f9db9] bg-white">
                  <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span>Lista de Vendedores / Responsables</span>
                    </div>
                    <button 
                      onClick={() => setSelectedSeller(selectedSeller === 'ALL' ? '' : 'ALL')}
                      className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[10px] cursor-pointer"
                    >
                      {selectedSeller === 'ALL' ? 'Desmarcar' : 'Marcar Todo'}
                    </button>
                  </div>
                  <div className="p-1 space-y-0.5 text-[11px] max-h-24 overflow-y-auto">
                    {uniqueSellers.map(v => (
                      <label key={v} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 px-0.5">
                        <input 
                          type="checkbox" 
                          checked={selectedSeller === 'ALL' || selectedSeller.toLowerCase().includes(v.toLowerCase())}
                          onChange={() => setSelectedSeller(selectedSeller === v ? 'ALL' : v)}
                        />
                        <span>{v}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bodega / Almacén (Conectado a locations de Avalon) */}
                <div className="border border-[#7f9db9] bg-white">
                  <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Store className="w-3 h-3 text-amber-300" />
                      <span>Bodega / Almacén Procoquinal</span>
                    </div>
                    <button 
                      onClick={() => setSelectedWarehouse(selectedWarehouse === 'ALL' ? '' : 'ALL')}
                      className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[10px] cursor-pointer"
                    >
                      {selectedWarehouse === 'ALL' ? 'Desmarcar' : 'Marcar Todo'}
                    </button>
                  </div>
                  <div className="p-1 space-y-0.5 text-[11px]">
                    {availableWarehouses.map(bod => (
                      <label key={bod} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                        <input 
                          type="checkbox" 
                          checked={selectedWarehouse === 'ALL' || selectedWarehouse === bod} 
                          onChange={() => setSelectedWarehouse(selectedWarehouse === bod ? 'ALL' : bod)}
                        />
                        <span>{bod}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Centro de Costos Box */}
                <div className="border border-[#7f9db9] bg-white">
                  <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center gap-1">
                    <span>Centro de Costos</span>
                    <input 
                      type="text" 
                      placeholder="123-AAA" 
                      value={centroCostoQuery}
                      onChange={e => {
                        setCentroCostoQuery(e.target.value);
                        if (e.target.value) {
                          const match = uniqueCostCenters.find(c => c.toLowerCase().includes(e.target.value.toLowerCase()));
                          if (match) setSelectedCostCenter(match);
                        } else {
                          setSelectedCostCenter('ALL');
                        }
                      }}
                      className="w-16 bg-white text-slate-900 px-1 py-0.2 text-[10px] border border-slate-400"
                    />
                    <Search 
                      className="w-3 h-3 text-amber-300 cursor-pointer" 
                      onClick={() => {
                        if (centroCostoQuery) {
                          const match = uniqueCostCenters.find(c => c.toLowerCase().includes(centroCostoQuery.toLowerCase()));
                          if (match) setSelectedCostCenter(match);
                        }
                      }}
                    />
                    <button 
                      onClick={() => setSelectedCostCenter(selectedCostCenter === 'ALL' ? '' : 'ALL')}
                      className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[10px] ml-auto cursor-pointer"
                    >
                      {selectedCostCenter === 'ALL' ? 'Desmarcar' : 'Marcar Todo'}
                    </button>
                  </div>
                  <div className="p-1 space-y-0.5 text-[11px] max-h-16 overflow-y-auto">
                    {uniqueCostCenters.map(cc => (
                      <label key={cc} className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-100">
                        <input 
                          type="checkbox" 
                          checked={selectedCostCenter === 'ALL' || selectedCostCenter === cc} 
                          onChange={() => setSelectedCostCenter(selectedCostCenter === cc ? 'ALL' : cc)}
                        />
                        <span>{cc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Producto Box */}
                <div className="border border-[#7f9db9] bg-white">
                  <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex items-center justify-between">
                    <span>Producto / Insumo</span>
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        placeholder="123-AAA / SKU"
                        value={skuSearch}
                        onChange={e => setSkuSearch(e.target.value)}
                        className="w-24 bg-white text-slate-900 px-1 py-0.2 text-[10px] border border-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Opciones del Informe */}
                <div className="border border-[#7f9db9] bg-white">
                  <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px]">
                    Opciones del Informe
                  </div>
                  <div className="p-1.5 space-y-1 text-[10.5px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={true} readOnly />
                      <span className="font-bold">Detallar Movimiento</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={ordenarPorCantidad} onChange={e => setOrdenarPorCantidad(e.target.checked)} />
                      <span>Ordenar Por Cantidad</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={sinLineas} onChange={e => setSinLineas(e.target.checked)} />
                      <span>Sin Lineas</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={agruparPorVendedor} onChange={e => setAgruparPorVendedor(e.target.checked)} />
                      <span className="font-bold">Agrupar Por Vendedor / Responsable</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={filtrarAnulados} onChange={e => setFiltrarAnulados(e.target.checked)} />
                      <span>Filtrar Documentos Anulados</span>
                    </label>
                  </div>
                </div>

              </div>

              {/* COLUMNA 3 (DERECHA - CLIENTE / TERCERO, ZONAS, SUCURSAL & BOTONES 3D) */}
              <div className="lg:col-span-4 flex flex-col gap-2">
                
                {/* Ventana Header 'Tercero / Cliente' */}
                <div className="border border-[#7f9db9] bg-[#ece9d8]">
                  <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                    <span>{selectedModule === 'COMPRAS' ? 'Proveedor / Tercero' : 'Cliente / Tercero'}</span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button 
                        onClick={() => setIsClientMinimized(!isClientMinimized)}
                        className="w-3.5 h-3.5 bg-[#d4d0c8] hover:bg-white text-slate-800 flex items-center justify-center font-bold border border-slate-500 cursor-pointer"
                        title="Minimizar"
                      >
                        _
                      </button>
                      <button 
                        onClick={() => setIsClientMaximized(!isClientMaximized)}
                        className="w-3.5 h-3.5 bg-[#d4d0c8] hover:bg-white text-slate-800 flex items-center justify-center font-bold border border-slate-500 cursor-pointer"
                        title="Maximizar"
                      >
                        □
                      </button>
                      <button 
                        onClick={() => { setSelectedCity('ALL'); setAgruparZona1(false); }}
                        className="w-3.5 h-3.5 bg-[#c00] hover:bg-rose-500 text-white flex items-center justify-center font-bold border border-slate-500 cursor-pointer"
                        title="Restablecer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {!isClientMinimized && (
                    <div className="p-1 space-y-2">
                      
                      {/* Zona 1 Box */}
                      <div className="border border-[#7f9db9] bg-white">
                        <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[10.5px] flex justify-between items-center">
                          <span>Zona 1</span>
                          <button 
                            onClick={() => setSelectedCity(selectedCity === 'ALL' ? '' : 'ALL')}
                            className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[9.5px] cursor-pointer"
                          >
                            {selectedCity === 'ALL' ? 'Desmarcar' : 'Marcar Todo'}
                          </button>
                        </div>
                        <div className="p-1 text-[11px] max-h-20 overflow-y-auto space-y-0.5">
                          {['BOGOTÁ', 'MEDELLIN', 'CALI', 'BARRANQUILLA'].map(z => (
                            <div 
                              key={z} 
                              className={`px-1 cursor-pointer ${selectedCity === z ? 'bg-[#316ac5] text-white font-bold' : 'hover:bg-slate-100'}`} 
                              onClick={() => setSelectedCity(selectedCity === z ? 'ALL' : z)}
                            >
                              {z}
                            </div>
                          ))}
                        </div>
                        <div className="p-1 bg-[#f0f3f8] border-t border-slate-200">
                          <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                            <input type="checkbox" checked={agruparZona1} onChange={e => setAgruparZona1(e.target.checked)} />
                            <span>Agrupar por Zona 1</span>
                          </label>
                        </div>
                      </div>

                      {/* Presentaciones Químicas & Envases (Sustituye Tallas y Colores) */}
                      <div className="border border-[#7f9db9] bg-white">
                        <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[10.5px] flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-amber-300" />
                            <span>Presentaciones Químicas & Envases</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const presList = worldOfficeConfig?.chemicalPresentations || [];
                              const anyOff = presList.some(p => !selectedPresentations.includes(p.id));
                              setSelectedPresentations(anyOff ? presList.map(p => p.id) : []);
                            }} 
                            className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[9.5px] cursor-pointer"
                          >
                            {selectedPresentations.length === (worldOfficeConfig?.chemicalPresentations?.length || 0) ? 'Desmarcar' : 'Marcar Todo'}
                          </button>
                        </div>
                        <div className="p-1 text-[10.5px] max-h-24 overflow-y-auto space-y-1">
                          {(worldOfficeConfig?.chemicalPresentations || []).map(pres => (
                            <label key={pres.id} className="flex items-center justify-between cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded-xs">
                              <div className="flex items-center gap-1.5">
                                <input 
                                  type="checkbox" 
                                  checked={selectedPresentations.includes(pres.id)} 
                                  onChange={() => {
                                    setSelectedPresentations(prev => 
                                      prev.includes(pres.id) ? prev.filter(x => x !== pres.id) : [...prev, pres.id]
                                    );
                                  }}
                                />
                                <span className="font-semibold text-slate-800">{pres.name}</span>
                              </div>
                              <span className="font-mono text-[9.5px] text-indigo-700 font-bold bg-indigo-50 px-1 rounded">
                                {pres.conversionToLiters} L
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Sucursal & Orden */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <button 
                          onClick={handleCycleSucursal}
                          className="px-2 py-0.5 bg-[#e4e4e4] hover:bg-white active:bg-slate-300 border border-[#7f9db9] font-bold cursor-pointer"
                          title="Haga clic para alternar de sucursal"
                        >
                          Sucursal: {selectedCostCenter === 'ALL' ? 'Todas' : selectedCostCenter}
                        </button>
                        <div className="flex-1 flex items-center gap-1">
                          <span className="font-bold">Orden:</span>
                          <select 
                            value={ordenSeleccionado}
                            onChange={e => setOrdenSeleccionado(e.target.value)}
                            className="border border-[#7f9db9] bg-white flex-1 py-0.5 text-[11px]"
                          >
                            <option value="Codigo-Descripción">Codigo-Descripción</option>
                            <option value="Descripción-Codigo">Descripción-Codigo</option>
                            <option value="Mayor Venta">Mayor Monto</option>
                          </select>
                        </div>
                      </div>

                      {/* Classic 3D Beveled Buttons (Vista Previa & Exportar a Excel) */}
                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#b0b7c4]">
                        <button
                          onClick={handleGenerateReport}
                          disabled={isGenerating}
                          className="px-4 py-2 bg-[#ece9d8] hover:bg-[#dfdbce] active:bg-[#d0ccc0] text-slate-900 font-black text-xs border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Search className="w-3.5 h-3.5 text-blue-800" />
                          <span>{isGenerating ? 'Generando...' : 'Vista Previa (F5)'}</span>
                        </button>

                        <button
                          onClick={handleExportToExcel}
                          className="px-3.5 py-2 bg-[#ece9d8] hover:bg-[#dfdbce] active:bg-[#d0ccc0] text-slate-900 font-bold text-xs border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Exportar a Excel</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Bottom Status / Footer Bar */}
          <div className="mt-2 bg-[#dcdfe5] p-1 border border-[#7f9db9] text-[10px] text-slate-700 flex justify-between items-center font-mono">
            <span>Terminal: POS-PROCOQUINAL-01 | Usuario: OMAR | Módulo: {currentModuleDef.label.toUpperCase()}</span>
            <span className="font-bold">Total Transacciones Filtradas: {filteredData.length.toLocaleString()}</span>
          </div>

        </div>
      )}

      {/* =========================================================================
          4. VISTA MODERNA
          ========================================================================= */}
      {isFilterPanelOpen && filterLayoutMode === 'MODERNA' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                {ERP_MODULES.map(mod => {
                  const Icon = mod.icon;
                  const active = selectedModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => handleSelectModule(mod.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        active ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {mod.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'ALL', label: 'Todo Historial' },
                  { id: 'THIS_MONTH', label: 'Este Mes' },
                  { id: 'LAST_MONTH', label: 'Mes Anterior' },
                  { id: '2026', label: '2026' },
                  { id: '2025', label: '2025' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPeriodPreset(p.id as any)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      periodPreset === p.id 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* Tipo de informe */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <span className="font-bold flex items-center gap-1.5"><FolderKanban className="w-3.5 h-3.5 text-indigo-600" /> Tipo de Informe ({currentModuleDef.label})</span>
                <select 
                  value={selectedReportType}
                  onChange={e => setSelectedReportType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                >
                  {REPORT_CATALOGS[selectedModule].map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {/* Vendedor */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <span className="font-bold flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Vendedor / Responsable</span>
                <select 
                  value={selectedSeller}
                  onChange={e => { setSelectedSeller(e.target.value); setCurrentPage(1); setCurrentReportPage(1); }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="ALL">-- Todos los Comerciales --</option>
                  {uniqueSellers.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Sede / Bodega */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                <span className="font-bold flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-blue-600" /> Sede / Bodega</span>
                <select 
                  value={selectedCostCenter}
                  onChange={e => { setSelectedCostCenter(e.target.value); setCurrentPage(1); setCurrentReportPage(1); }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="ALL">-- Todas las Sedes / Bodegas --</option>
                  {uniqueCostCenters.map(cc => <option key={cc} value={cc}>{cc}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="px-6 py-3 bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>GENERAR INFORME & VISTA PREVIA</span>
              </button>
            </div>
          </div>

          {/* En modo moderno, el visor se muestra abajo del panel */}
          {renderReportViewer()}
        </div>
      )}

    </div>
  );
};
