import React, { useState, useMemo, useRef } from 'react';
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
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
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

const REPORT_TYPES_WORLD_OFFICE = [
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
];

export const InformesOmar: React.FC = () => {
  const enterprise = useEnterprise();
  const reportResultsRef = useRef<HTMLDivElement>(null);
  
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

  // --- STATE: WORLD OFFICE FULL CRITERIA MATRIX ---
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [activeFilterCategory, setActiveFilterCategory] = useState<'ALL' | 'OPERACION' | 'FECHAS' | 'CLIENTES' | 'PRODUCTOS' | 'CONTABLE'>('ALL');
  const [hasGeneratedReport, setHasGeneratedReport] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>(
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Selected Classic Report Type
  const [selectedReportType, setSelectedReportType] = useState('Informe por Cliente Agrupado Por Producto');

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
  const [selectedPosPoint, setSelectedPosPoint] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // 2. Fechas & Periodo
  const [periodPreset, setPeriodPreset] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | '2026' | '2025' | 'CUSTOM'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTimeShift, setSelectedTimeShift] = useState('ALL');

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
  const [pucLevel, setPucLevel] = useState<'AUXILIAR' | 'SUBCUENTA' | 'CUENTA'>('AUXILIAR');

  // 6. Documentos / Fuentes
  const [docTypeFVE, setDocTypeFVE] = useState(true);
  const [docTypeNC, setDocTypeNC] = useState(true);
  const [docTypeRC, setDocTypeRC] = useState(false);
  const [docTypeCE, setDocTypeCE] = useState(false);
  const [docTypeCOT, setDocTypeCOT] = useState(false);
  const [docTypeREM, setDocTypeREM] = useState(false);
  const [docConsecutivoFrom, setDocConsecutivoFrom] = useState('');
  const [docConsecutivoTo, setDocConsecutivoTo] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');

  // 7. Opciones de Presentación
  const [groupByTercero, setGroupByTercero] = useState(false);
  const [showDocDetails, setShowDocDetails] = useState(true);
  const [includeIvaBreakdown, setIncludeIvaBreakdown] = useState(true);
  const [showChemicalVolume, setShowChemicalVolume] = useState(true);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [agruparZona1, setAgruparZona1] = useState(true);
  const [agruparZona2, setAgruparZona2] = useState(false);
  const [conversionTipo, setConversionTipo] = useState<'MOVIMIENTO' | 'CORTE'>('MOVIMIENTO');
  const [ordenSeleccionado, setOrdenSeleccionado] = useState('Codigo-Descripción');

  // Active View Tab for Report
  const [reportActiveTab, setReportActiveTab] = useState<'TODOS' | 'TORTAS' | 'TENDENCIAS' | 'TABLA'>('TODOS');

  // Paginación
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

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
  };

  const handleResetFilters = () => {
    setSelectedSeller('ALL');
    setSellerFrom('');
    setSellerTo('');
    setSelectedCostCenter('ALL');
    setSelectedPosPoint('ALL');
    setSelectedChannel('ALL');
    setSelectedCity('ALL');
    setMinAmount('');
    setMaxAmount('');
    setPeriodPreset('ALL');
    setDateFrom('');
    setDateTo('');
    setSelectedTimeShift('ALL');
    setTerceroType('TODOS');
    setTerceroFrom('');
    setTerceroTo('');
    setSearchTerm('');
    setSelectedFamily('ALL');
    setSkuSearch('');
    setSkuFrom('');
    setSkuTo('');
    setPucClassFilter('ALL');
    setPucFrom('110505');
    setPucTo('413595');
    setPucLevel('AUXILIAR');
    setDocTypeFVE(true);
    setDocTypeNC(true);
    setDocTypeRC(false);
    setDocTypeCE(false);
    setDocTypeCOT(false);
    setDocTypeREM(false);
    setDocConsecutivoFrom('');
    setDocConsecutivoTo('');
    setSelectedPaymentMethod('ALL');
    setGroupByTercero(false);
    setShowDocDetails(true);
    setIncludeIvaBreakdown(true);
    setShowChemicalVolume(true);
    setHideZeroBalances(false);
    setCurrentPage(1);
  };

  // Trigger Generar Informe with Visual Feedback
  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGeneratedReport(true);
      setReportGeneratedAt(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentPage(1);
      if (reportResultsRef.current) {
        reportResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 350);
  };

  // Distinct lists for dropdowns
  const uniqueFamilies = useMemo(() => {
    const set = new Set<string>();
    allRawTransactions.forEach(t => { if (t.family) set.add(t.family); });
    inventorySource.forEach(p => { if (p.family) set.add(p.family); });
    return Array.from(set).sort();
  }, [allRawTransactions, inventorySource]);

  const uniqueCostCenters = useMemo(() => {
    const set = new Set<string>();
    allRawTransactions.forEach(t => { if (t.posLocation) set.add(t.posLocation); });
    return Array.from(set).sort();
  }, [allRawTransactions]);

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

  const uniqueChannels = ['B2B Corporativo', 'Venta Mostrador', 'Distribuidores', 'E-commerce / WhatsApp'];
  const uniqueCities = ['BOGOTÁ', 'MEDELLIN', 'CALI', 'BARRANQUILLA', 'SOACHA', 'CHÍA'];
  const uniquePosPoints = ['Caja 01 Mostrador', 'Caja 02 B2B Mayoristas', 'Caja 03 Despachos', 'Caja Digital E-com'];

  // --- FILTER EXECUTION ---
  const filteredData = useMemo(() => {
    return allRawTransactions.filter(tx => {
      const txTypeStr = (tx.type || '') as string;
      const isVenta = txTypeStr === 'VENTA' || (!tx.type && (tx.id?.startsWith('FV') || tx.document?.startsWith('FV')));
      const isNotaCredito = txTypeStr === 'NOTA_CREDITO' || tx.total < 0 || tx.id?.startsWith('NC');
      const isCompraEgreso = txTypeStr === 'COMPRA' || txTypeStr === 'GASTO' || tx.id?.startsWith('CE') || tx.id?.startsWith('CM');
      const isReciboCaja = txTypeStr === 'RECIBO_CAJA' || txTypeStr === 'PAGO_RECIBIDO' || tx.id?.startsWith('RC');
      const isCotizacion = txTypeStr === 'COTIZACION' || tx.id?.startsWith('COT');
      const isRemision = txTypeStr === 'REMISION' || tx.id?.startsWith('REM');

      // 1. Tipos de Comprobante
      let matchesDocType = false;
      if (docTypeFVE && isVenta && !isNotaCredito) matchesDocType = true;
      if (docTypeNC && isNotaCredito) matchesDocType = true;
      if (docTypeCE && isCompraEgreso) matchesDocType = true;
      if (docTypeRC && isReciboCaja) matchesDocType = true;
      if (docTypeCOT && isCotizacion) matchesDocType = true;
      if (docTypeREM && isRemision) matchesDocType = true;
      if (!matchesDocType) return false;

      // 2. Fechas
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;

      // 3. Operación: Vendedor
      const seller = getTxSeller(tx);
      if (selectedSeller !== 'ALL' && !seller.toLowerCase().includes(selectedSeller.toLowerCase())) return false;
      if (sellerFrom && seller.toLowerCase() < sellerFrom.toLowerCase()) return false;
      if (sellerTo && seller.toLowerCase() > sellerTo.toLowerCase()) return false;

      // 4. Operación: Sede / Sucursal
      if (selectedCostCenter !== 'ALL' && tx.posLocation && tx.posLocation !== selectedCostCenter) {
        return false;
      }

      // 5. Operación: Punto / Caja POS
      const posPoint = getTxPosPoint(tx);
      if (selectedPosPoint !== 'ALL' && posPoint !== selectedPosPoint) return false;

      // 6. Operación: Canal de Venta
      const channel = getTxChannel(tx);
      if (selectedChannel !== 'ALL' && channel !== selectedChannel) return false;

      // 7. Operación: Ciudad
      const city = getTxCity(tx);
      if (selectedCity !== 'ALL' && !city.toLowerCase().includes(selectedCity.toLowerCase())) return false;

      // 8. Operación: Rango de Montos
      const amountVal = Math.abs(tx.total || 0);
      if (minAmount && amountVal < Number(minAmount)) return false;
      if (maxAmount && amountVal > Number(maxAmount)) return false;

      // 9. Operación: Medio de Pago
      if (selectedPaymentMethod !== 'ALL' && tx.paymentMethod && !tx.paymentMethod.toLowerCase().includes(selectedPaymentMethod.toLowerCase())) {
        return false;
      }

      // 10. Clientes: Búsqueda y Rango
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const clientMatch = tx.client && tx.client.toLowerCase().includes(q);
        const docMatch = tx.document && tx.document.toLowerCase().includes(q);
        const idMatch = tx.id && tx.id.toLowerCase().includes(q);
        const skuMatch = tx.sku && tx.sku.toLowerCase().includes(q);
        if (!clientMatch && !docMatch && !idMatch && !skuMatch) return false;
      }
      if (terceroFrom && tx.client && tx.client.toLowerCase() < terceroFrom.toLowerCase()) return false;
      if (terceroTo && tx.client && tx.client.toLowerCase() > terceroTo.toLowerCase()) return false;

      // 11. Consecutivos Documento
      if (docConsecutivoFrom && tx.document && tx.document.toLowerCase() < docConsecutivoFrom.toLowerCase()) return false;
      if (docConsecutivoTo && tx.document && tx.document.toLowerCase() > docConsecutivoTo.toLowerCase()) return false;

      // 12. Inventario: Familia y SKU
      if (selectedFamily !== 'ALL' && tx.family && tx.family !== selectedFamily) {
        return false;
      }
      if (skuSearch) {
        const s = skuSearch.toLowerCase();
        const skuMatches = (tx.sku && tx.sku.toLowerCase().includes(s)) || (tx.productName && tx.productName.toLowerCase().includes(s));
        if (!skuMatches) return false;
      }
      if (skuFrom && tx.sku && tx.sku.toLowerCase() < skuFrom.toLowerCase()) return false;
      if (skuTo && tx.sku && tx.sku.toLowerCase() > skuTo.toLowerCase()) return false;

      // 13. Cuentas PUC (Clase 1, 2, 4, 5)
      const mappedPuc = tx.type === 'VENTA' ? '413505' : (tx.type === 'NOTA_CREDITO' ? '417505' : (tx.type === 'COMPRA' ? '143505' : '110505'));
      if (pucClassFilter !== 'ALL') {
        if (pucClassFilter === '1_ACTIVOS' && !mappedPuc.startsWith('1')) return false;
        if (pucClassFilter === '2_PASIVOS' && !mappedPuc.startsWith('2')) return false;
        if (pucClassFilter === '4_INGRESOS' && !mappedPuc.startsWith('4')) return false;
        if (pucClassFilter === '5_GASTOS' && !mappedPuc.startsWith('5')) return false;
      }
      if (pucFrom && mappedPuc < pucFrom) return false;
      if (pucTo && mappedPuc > pucTo) return false;

      // 14. Checks de Saldo / Cero
      if (hideZeroBalances && (!tx.total || tx.total === 0)) return false;

      return true;
    });
  }, [
    allRawTransactions, docTypeFVE, docTypeNC, docTypeCE, docTypeRC, docTypeCOT, docTypeREM,
    dateFrom, dateTo, selectedSeller, sellerFrom, sellerTo, selectedCostCenter,
    selectedPosPoint, selectedChannel, selectedCity, minAmount, maxAmount, selectedPaymentMethod,
    searchTerm, terceroFrom, terceroTo, docConsecutivoFrom, docConsecutivoTo,
    selectedFamily, skuSearch, skuFrom, skuTo, pucClassFilter, pucFrom, pucTo, hideZeroBalances
  ]);

  // Compute KPIs
  const kpis = useMemo(() => {
    let totalNet = 0;
    let totalGross = 0;
    let totalIva = 0;
    let returnsTotal = 0;
    const uniqueDocs = new Set<string>();
    const clientSales: Record<string, number> = {};

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
        if (tx.client) {
          clientSales[tx.client] = (clientSales[tx.client] || 0) + netAmount;
        }
      }
    });

    let topClientName = 'N/A';
    let topClientAmount = 0;
    Object.entries(clientSales).forEach(([client, amount]) => {
      if (amount > topClientAmount) {
        topClientAmount = amount;
        topClientName = client;
      }
    });

    const docCount = uniqueDocs.size || filteredData.length;
    const avgTicket = docCount > 0 ? (totalGross / docCount) : 0;
    const returnsImpact = totalGross > 0 ? (returnsTotal / totalGross) * 100 : 0;

    return {
      totalNet,
      totalGross,
      totalIva,
      docCount,
      avgTicket,
      returnsTotal,
      returnsImpact,
      topClientName,
      topClientAmount
    };
  }, [filteredData]);

  // Volumetric Analytics
  const physicalKpis = useMemo(() => {
    let totalLiters = 0;
    let totalKilos = 0;

    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const product = inventorySource.find(p => p.sku === tx.sku || p.name === tx.productName);
      const qty = tx.qty || 1;
      
      let itemLiters = 0;
      let itemKilos = 0;

      if (product) {
        const density = typeof product.density === 'number' ? product.density : parseFloat(product.density as string) || 1;
        if (product.netVolumeLiters) itemLiters = product.netVolumeLiters * qty;
        else if (product.baseUnit === 'GL') itemLiters = qty * 3.785;
        else if (product.baseUnit === 'LT') itemLiters = qty;
        else itemLiters = qty;

        if (product.netWeightKg) itemKilos = product.netWeightKg * qty;
        else itemKilos = itemLiters * density;
      } else {
        itemLiters = qty;
        itemKilos = qty * 1.05;
      }

      totalLiters += itemLiters;
      totalKilos += itemKilos;
    });

    return { totalLiters, totalKilos };
  }, [filteredData, inventorySource]);

  // --- TORTAS (DONUT / PIE CHARTS DATA) ---

  // Torta 1: Mix por Familia Química
  const familyPieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const fam = tx.family || 'DIVERSOS';
      const net = tx.total - (tx.iva || 0);
      map[fam] = (map[fam] || 0) + net;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Torta 2: Ventas por Vendedor / Comercial
  const sellerPieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const s = getTxSeller(tx).split(' (')[0];
      const net = tx.total - (tx.iva || 0);
      map[s] = (map[s] || 0) + net;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Torta 3: Distribución por Sede / Sucursal
  const costCenterPieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const loc = tx.posLocation || 'Principal Centro';
      const net = tx.total - (tx.iva || 0);
      map[loc] = (map[loc] || 0) + net;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Torta 4: Canal de Venta & Despacho
  const channelPieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const ch = getTxChannel(tx);
      const net = tx.total - (tx.iva || 0);
      map[ch] = (map[ch] || 0) + net;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Top 10 Clientes
  const topClientsData = useMemo(() => {
    const clientSales: Record<string, number> = {};
    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const netAmount = tx.total - (tx.iva || 0);
      if (tx.client) {
        clientSales[tx.client] = (clientSales[tx.client] || 0) + netAmount;
      }
    });

    return Object.entries(clientSales)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredData]);

  // Time Series Data (Monthly)
  const timeSeriesData = useMemo(() => {
    const monthlyMap: Record<string, { month: string, ventas: number, ticket: number, docs: Set<string>, totalGross: number }> = {};

    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const dateObj = new Date(tx.date);
      if (isNaN(dateObj.getTime())) return;

      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, ventas: 0, ticket: 0, docs: new Set(), totalGross: 0 };
      }

      const netAmount = tx.total - (tx.iva || 0);
      monthlyMap[monthKey].ventas += netAmount;
      monthlyMap[monthKey].totalGross += tx.total;
      if (tx.document) monthlyMap[monthKey].docs.add(tx.document);
    });

    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)).map(item => ({
      month: item.month,
      ventas: item.ventas,
      ticket: item.docs.size > 0 ? (item.totalGross / item.docs.size) : 0
    }));
  }, [filteredData]);

  // Pagination Data
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Real Excel Export (Full Operational + Accounting Columns)
  const handleExportToExcel = () => {
    const exportRows = filteredData.map(tx => {
      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const net = Math.abs(tx.total) - (tx.iva || 0);
      const puc = tx.type === 'VENTA' ? '413505 (Comercio)' : (tx.type === 'NOTA_CREDITO' ? '417505 (Devolución)' : '110505 (Caja)');

      return {
        'Fecha': tx.date,
        'Tipo Comprobante': tx.type || 'VENTA',
        'Consecutivo Documento': tx.document || tx.id,
        'Asesor Comercial / Vendedor': getTxSeller(tx),
        'Sede / Sucursal': tx.posLocation || 'Sede Principal Centro',
        'Punto / Caja POS': getTxPosPoint(tx),
        'Canal de Venta': getTxChannel(tx),
        'Ciudad': getTxCity(tx),
        'Tercero / Cliente': tx.client || 'Consumidor Final',
        'Identificación / NIT': tx.document || '222222222222',
        'Cuenta Contable PUC': puc,
        'Referencia SKU': tx.sku || 'N/A',
        'Producto / Detalle': tx.productName || 'Venta Mostrador',
        'Familia Química': tx.family || 'DIVERSOS',
        'Cantidad': tx.qty || 1,
        'IVA Recaudado ($)': tx.iva || 0,
        'Total Neto ($)': isReturn ? -net : net,
        'Total Bruto ($)': tx.total,
        'Forma de Pago': tx.paymentMethod || 'Efectivo'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws1, "Informe_Operativo_Contable");

    // Hoja 2: Resumen por Vendedor
    const sellerMap: Record<string, { ventasNetas: number, total: number, docs: number }> = {};
    filteredData.forEach(tx => {
      const s = getTxSeller(tx);
      if (!sellerMap[s]) sellerMap[s] = { ventasNetas: 0, total: 0, docs: 0 };
      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const net = Math.abs(tx.total) - (tx.iva || 0);
      sellerMap[s].ventasNetas += isReturn ? -net : net;
      sellerMap[s].total += tx.total;
      sellerMap[s].docs += 1;
    });

    const ws2Data = Object.entries(sellerMap).map(([seller, data]) => ({
      'Asesor Comercial / Vendedor': seller,
      'N° Transacciones': data.docs,
      'Total Venta Neta ($)': data.ventasNetas,
      'Total Facturado ($)': data.total
    }));
    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen_Por_Vendedor");

    XLSX.writeFile(wb, `Informe_WorldOffice_Procoquinal_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto bg-[#f1f3f7] min-h-screen text-slate-800 font-sans">
      
      {/* 1. TOP HEADER & BARRA DE ACCIÓN PRINCIPAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1c3b70] text-white flex items-center justify-center shadow-xs">
            <FolderKanban className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                {filterLayoutMode === 'CLASICA' ? 'World Office — Informes de Ventas Criterios' : 'Explorador de Informes (Modo Moderno)'}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                filterLayoutMode === 'CLASICA' 
                  ? 'bg-amber-50 text-amber-900 border-amber-300' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {filterLayoutMode === 'CLASICA' ? 'Vista Clásica Activa' : 'Vista Moderna Activa'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Generador de informes con el layout nativo de World Office sin fricción para Omar.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* TOGGLE VISTA CLASICA / MODERNA */}
          <button
            onClick={() => setFilterLayoutMode(filterLayoutMode === 'CLASICA' ? 'MODERNA' : 'CLASICA')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
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

          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Procesar informe y actualizar gráficos"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>Generar Informe</span>
          </button>

          <button 
            onClick={handleExportToExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>

          <button 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. VISTA CLÁSICA (REPLICA WIREFRAME EXACTA DE WORLD OFFICE)
          ========================================================================= */}
      {isFilterPanelOpen && filterLayoutMode === 'CLASICA' && (
        <div className="bg-[#cbd3df] p-2 rounded-xs border-2 border-[#546e96] shadow-md font-sans text-slate-900 text-xs select-none">
          
          {/* Top Title Tabs & Window Chrome */}
          <div className="flex items-center justify-between pb-1.5 border-b border-[#96a5bc] mb-2">
            <div className="flex items-end gap-1">
              <div className="px-3 py-1 bg-[#a6b1c2] text-[#2c3e55] font-bold text-[11px] border border-[#7f8c9f] border-b-0 rounded-t-sm">
                INFORMES DE VENTAS
              </div>
              <div className="px-4 py-1.5 bg-gradient-to-t from-[#ffd972] to-[#ffefa8] text-slate-950 font-black text-xs border border-[#9b8441] border-b-0 rounded-t-sm shadow-xs flex items-center gap-1.5">
                <FolderKanban className="w-3.5 h-3.5 text-amber-800" />
                <span>Informes de Ventas Criterios</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-2.5 py-0.5 bg-[#e67300] hover:bg-[#ff851b] text-white font-black text-[11px] border border-[#a65200] rounded-xs shadow-xs flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                <span>AYUDA</span>
              </button>
            </div>
          </div>

          {/* 3 Main Classic Columns Wireframe Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            
            {/* -------------------------------------------------------------
                COLUMNA 1 (IZQUIERDA - EMPRESAS, FECHAS & TIPOS DE INFORME)
                ------------------------------------------------------------- */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              
              {/* Empresas Box */}
              <div className="border border-[#7f9db9] bg-white">
                <div className="bg-[#1c3b70] text-white px-2 py-1 font-bold text-[11px] flex justify-between items-center">
                  <span>Empresas</span>
                  <button onClick={() => {}} className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1.5 py-0.2 border border-slate-400 text-[10px] font-medium cursor-pointer">
                    Desmarcar Todo
                  </button>
                </div>
                <div className="p-1 bg-[#1a3b68] text-white font-mono text-[11px] font-bold flex items-center justify-between">
                  <span>PROCOQUINAL S.A.S.</span>
                  <span className="text-[10px] bg-emerald-600 px-1 rounded-xs">ACTIVA</span>
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

              {/* Tipo de Informe Box (Radio List Scrollable) */}
              <div className="border border-[#7f9db9] bg-white flex flex-col flex-1">
                <div className="bg-[#dcdfe5] border-b border-[#7f9db9] text-slate-800 text-center font-bold text-[11px] py-0.5">
                  Tipo de informe
                </div>
                <div className="h-[280px] overflow-y-auto p-1.5 space-y-1 bg-white text-[11px]">
                  {REPORT_TYPES_WORLD_OFFICE.map(tipo => (
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

            {/* -------------------------------------------------------------
                COLUMNA 2 (CENTRO - COMPROBANTES, VENDEDORES, CC, PRODUCTOS)
                ------------------------------------------------------------- */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              
              {/* Documentos que Incluye el Informe Box */}
              <div className="border border-[#7f9db9] bg-white">
                <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                  <span>Documentos que Incluye el Informe</span>
                  <button 
                    onClick={() => { setDocTypeFVE(true); setDocTypeNC(true); setDocTypeCE(true); setDocTypeRC(true); setDocTypeCOT(true); }}
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
                    <span>Cuenta de Cobro / Egreso</span>
                  </label>
                </div>
              </div>

              {/* Lista de Vendedores Box */}
              <div className="border border-[#7f9db9] bg-white">
                <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span>Lista de Vendedores</span>
                    <Search className="w-3 h-3 text-amber-300" />
                  </div>
                  <button 
                    onClick={() => setSelectedSeller('ALL')}
                    className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[10px] cursor-pointer"
                  >
                    Marcar Todo
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

              {/* Grupo Uno que Excluye el Informe */}
              <div className="border border-[#7f9db9] bg-white">
                <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked className="cursor-pointer" />
                    <span>Grupo Uno que Excluye el Informe</span>
                  </div>
                  <button className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[10px]">
                    Marcar Todo
                  </button>
                </div>
                <div className="p-1 space-y-0.5 text-[11px] max-h-16 overflow-y-auto bg-white">
                  <div className="text-slate-700">CONTABILIZACIONES AUTOMATICAS</div>
                  <div className="text-slate-700">MATERIA PRIMA</div>
                  <div className="text-slate-700">POR UTILIZAR</div>
                </div>
                <div className="bg-[#f0f3f8] p-1 border-t border-slate-200">
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked />
                    <span className="font-bold">Incluir registros sin agrupación Uno</span>
                  </label>
                </div>
              </div>

              {/* Centro de Costos Box */}
              <div className="border border-[#7f9db9] bg-white">
                <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center gap-1">
                  <span>Centro de Costos</span>
                  <input 
                    type="text" 
                    placeholder="123-AAA" 
                    className="w-16 bg-white text-slate-900 px-1 py-0.2 text-[10px] border border-slate-400"
                  />
                  <Search className="w-3 h-3 text-amber-300 cursor-pointer" />
                  <button className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[10px] ml-auto">
                    Marcar Todo
                  </button>
                </div>
                <div className="p-1 space-y-0.5 text-[11px] max-h-16 overflow-y-auto">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked />
                    <span>1 CENTENARIO</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked />
                    <span>100 ADMINISTRACION</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked />
                    <span>2 APRENDIZ SENA</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked />
                    <span>3 SEDE PRINCIPAL CENTRO</span>
                  </label>
                </div>
              </div>

              {/* Producto Box */}
              <div className="border border-[#7f9db9] bg-white">
                <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex items-center justify-between">
                  <span>Producto</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="text" 
                      placeholder="123-AAA / SKU"
                      value={skuSearch}
                      onChange={e => setSkuSearch(e.target.value)}
                      className="w-24 bg-white text-slate-900 px-1 py-0.2 text-[10px] border border-slate-400"
                    />
                    <Search className="w-3 h-3 text-amber-300 cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* Opciones del Informe (Checkboxes clásicos) */}
              <div className="border border-[#7f9db9] bg-white">
                <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px]">
                  Opciones del Informe
                </div>
                <div className="p-1.5 space-y-1 text-[10.5px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={showDocDetails} onChange={e => setShowDocDetails(e.target.checked)} />
                    <span className="font-bold">Detallar Movimiento</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Ordenar Por Cantidad</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Sin Lineas</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked />
                    <span className="font-bold">Agrupar Por Vendedor</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Filtrar Documentos Anulados</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Agrupación Clasificación Encabezado</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Incluir información en otras monedas</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Ver valores en otra moneda</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Agrupar y/o Filtrar por vendedor y Zonas</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" />
                    <span>Agrupar y/o Filtrar Por Sucursal Cliente</span>
                  </label>
                </div>
              </div>

            </div>

            {/* -------------------------------------------------------------
                COLUMNA 3 (DERECHA - CLIENTE, ZONAS, SUCURSAL & BOTONES 3D)
                ------------------------------------------------------------- */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              
              {/* Ventana Header 'Cliente' con controles Windows */}
              <div className="border border-[#7f9db9] bg-[#ece9d8]">
                <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[11px] flex justify-between items-center">
                  <span>Cliente</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="w-3.5 h-3.5 bg-[#d4d0c8] text-slate-800 flex items-center justify-center font-bold border border-slate-500 cursor-pointer">_</span>
                    <span className="w-3.5 h-3.5 bg-[#d4d0c8] text-slate-800 flex items-center justify-center font-bold border border-slate-500 cursor-pointer">□</span>
                    <span className="w-3.5 h-3.5 bg-[#c00] text-white flex items-center justify-center font-bold border border-slate-500 cursor-pointer">✕</span>
                  </div>
                </div>

                <div className="p-1 space-y-2">
                  
                  {/* Zona 1 Box */}
                  <div className="border border-[#7f9db9] bg-white">
                    <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[10.5px] flex justify-between items-center">
                      <span>Zona 1</span>
                      <button className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[9.5px]">
                        Marcar Todo
                      </button>
                    </div>
                    <div className="p-1 text-[11px] max-h-20 overflow-y-auto space-y-0.5">
                      {['BOGOTÁ', 'MEDELLIN', 'CALI', 'BARRANQUILLA'].map(z => (
                        <div key={z} className={`px-1 cursor-pointer ${selectedCity === z ? 'bg-[#316ac5] text-white font-bold' : 'hover:bg-slate-100'}`} onClick={() => setSelectedCity(selectedCity === z ? 'ALL' : z)}>
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

                  {/* Zona 2 Box */}
                  <div className="border border-[#7f9db9] bg-white">
                    <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[10.5px] flex justify-between items-center">
                      <span>Zona 2</span>
                      <button className="bg-[#e4e4e4] hover:bg-white text-slate-800 px-1 py-0.2 border border-slate-400 text-[9.5px]">
                        Marcar Todo
                      </button>
                    </div>
                    <div className="p-1 text-[11px] h-8 overflow-y-auto text-slate-400 italic">
                      -- Sin subdivisiones --
                    </div>
                    <div className="p-1 bg-[#f0f3f8] border-t border-slate-200">
                      <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                        <input type="checkbox" checked={agruparZona2} onChange={e => setAgruparZona2(e.target.checked)} />
                        <span>Agrupar por Zona 2</span>
                      </label>
                    </div>
                  </div>

                  {/* Mas Opciones del Informe */}
                  <div className="border border-[#7f9db9] bg-white">
                    <div className="bg-[#1c3b70] text-white px-2 py-0.5 font-bold text-[10.5px]">
                      Mas Opciones del Informe
                    </div>
                    <div className="p-1.5 space-y-1 text-[10.5px]">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="convTipo" 
                          checked={conversionTipo === 'MOVIMIENTO'} 
                          onChange={() => setConversionTipo('MOVIMIENTO')} 
                        />
                        <span>Conversión a Fecha del movimiento</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="radio" 
                          name="convTipo" 
                          checked={conversionTipo === 'CORTE'} 
                          onChange={() => setConversionTipo('CORTE')} 
                        />
                        <span>Conversión a Fecha de Corte</span>
                      </label>
                    </div>
                  </div>

                  {/* Sucursal & Orden */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <button className="px-2 py-0.5 bg-[#e4e4e4] border border-[#7f9db9] font-bold">
                      Sucursal
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
                        <option value="Mayor Venta">Mayor Venta</option>
                      </select>
                    </div>
                  </div>

                  {/* Tallas & Colores Boxes */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="border border-[#7f9db9] bg-white">
                      <div className="bg-[#1c3b70] text-white px-1 py-0.5 font-bold text-[10px] flex justify-between">
                        <span>Tallas</span>
                        <span className="text-[9px] cursor-pointer">Marcar Todo</span>
                      </div>
                      <div className="h-6 p-1 text-[10px] text-slate-400">Todas</div>
                    </div>

                    <div className="border border-[#7f9db9] bg-white">
                      <div className="bg-[#1c3b70] text-white px-1 py-0.5 font-bold text-[10px] flex justify-between">
                        <span>Colores</span>
                        <span className="text-[9px] cursor-pointer">Marcar Todo</span>
                      </div>
                      <div className="h-6 p-1 text-[10px] text-slate-400">Todos</div>
                    </div>
                  </div>

                  {/* Bottom Checkboxes */}
                  <div className="space-y-1 text-[10px] text-slate-700 pt-1">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" />
                      <span>Mostrar Terceros Desactivados</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" />
                      <span>Ver Características</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" defaultChecked />
                      <span>Al exportar mostrar en todos los registros los valores de las agrupaciones</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" />
                      <span>Mostrar Hora y Forma de Pago</span>
                    </label>
                  </div>

                  {/* Classic 3D Beveled Buttons (Vista Previa & Exportar a Excel) */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#b0b7c4]">
                    <button
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                      className="px-3 py-1.5 bg-[#ece9d8] hover:bg-[#dfdbce] active:bg-[#d0ccc0] text-slate-900 font-bold text-xs border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-blue-800" />
                      <span>{isGenerating ? 'Generando...' : 'Vista Previa'}</span>
                    </button>

                    <button
                      onClick={handleExportToExcel}
                      className="px-3 py-1.5 bg-[#ece9d8] hover:bg-[#dfdbce] active:bg-[#d0ccc0] text-slate-900 font-bold text-xs border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Exportar a Excel</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Bottom Status / Footer Bar */}
          <div className="mt-2 bg-[#dcdfe5] p-1 border border-[#7f9db9] text-[10px] text-slate-700 flex justify-between items-center font-mono">
            <span>Terminal: POS-PROCOQUINAL-01 | Usuario: OMAR | Estado: CONECTADO</span>
            <span className="font-bold">Total Transacciones Filtradas: {filteredData.length.toLocaleString()}</span>
          </div>

        </div>
      )}

      {/* =========================================================================
          VISTA MODERNA (SI SE SELECCIONA EL MODO MODERNO)
          ========================================================================= */}
      {isFilterPanelOpen && filterLayoutMode === 'MODERNA' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'ALL', label: '⚡ Ver Todos los Filtros', icon: Layers },
                { id: 'OPERACION', label: '🏢 Operación & Ventas', icon: Briefcase },
                { id: 'FECHAS', label: '📅 Fechas & Periodo', icon: Calendar },
                { id: 'CLIENTES', label: '👥 Clientes & Terceros', icon: Users },
                { id: 'PRODUCTOS', label: '🧪 Químicos & Inventario', icon: Package },
                { id: 'CONTABLE', label: '🏛️ Fiscal & PUC', icon: Landmark },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeFilterCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilterCategory(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      active ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {tab.label}
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
            {/* Vendedor */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <span className="font-bold flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Vendedor / Comercial</span>
              <select 
                value={selectedSeller}
                onChange={e => { setSelectedSeller(e.target.value); setCurrentPage(1); }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="ALL">-- Todos los Comerciales --</option>
                {uniqueSellers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Sede */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <span className="font-bold flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-blue-600" /> Sede / Sucursal</span>
              <select 
                value={selectedCostCenter}
                onChange={e => { setSelectedCostCenter(e.target.value); setCurrentPage(1); }}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="ALL">-- Todas las Sedes --</option>
                {uniqueCostCenters.map(cc => <option key={cc} value={cc}>{cc}</option>)}
              </select>
            </div>

            {/* Fechas */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              <span className="font-bold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-600" /> Rango de Fechas</span>
              <div className="flex gap-2">
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded" />
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-2 py-1 bg-white border border-slate-300 rounded" />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-6 py-3 bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>GENERAR INFORME</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. RESUMEN DE CRITERIOS ACTIVOS & ESTADO DEL INFORME */}
      <div ref={reportResultsRef} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-indigo-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Informe Generado
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-medium">Actualizado: <strong className="text-slate-900">{reportGeneratedAt}</strong></span>
          <span className="text-slate-400">|</span>
          <span className="bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
            Vendedor: {selectedSeller === 'ALL' ? 'Todos' : selectedSeller}
          </span>
          <span className="bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
            Periodo: {dateFrom || `${diaInicio} ${mesInicio} ${anoInicio}`} a {dateTo || `${diaFin} ${mesFin} ${anoFin}`}
          </span>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
          <button 
            onClick={() => setReportActiveTab('TODOS')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              reportActiveTab === 'TODOS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vista Completa
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
            <FileSpreadsheet className="w-3.5 h-3.5" /> Sábana
          </button>
        </div>
      </div>

      {/* 4. KPIS EJECUTIVOS (TARJETAS VISUALES) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venta Neta</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatCOP(kpis.totalNet)}</div>
          <span className="text-[11px] text-slate-500 font-medium">Bruta: {formatCOP(kpis.totalGross)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IVA Recaudado</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatCOP(kpis.totalIva)}</div>
          <span className="text-[11px] text-slate-400 font-medium">Cuenta 240801</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comprobantes</span>
          <div className="text-xl font-black text-blue-600 mt-1">{kpis.docCount.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-medium">Ticket: {formatCOP(kpis.avgTicket)}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Devoluciones</span>
          <div className="text-xl font-black text-rose-600 mt-1">{formatCOP(kpis.returnsTotal)}</div>
          <span className="text-[11px] text-rose-400 font-semibold">Tasa: {kpis.returnsImpact.toFixed(1)}%</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Volumen Químico</span>
          <div className="text-xl font-black text-purple-700 mt-1">
            {Math.round(physicalKpis.totalLiters).toLocaleString()} <span className="text-xs font-normal">LT</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {Math.round(physicalKpis.totalKilos).toLocaleString()} KG Estimados
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Cliente Top #1</span>
          <div className="text-xs font-bold text-slate-800 truncate mt-1" title={kpis.topClientName}>
            {kpis.topClientName}
          </div>
          <span className="text-xs font-black text-amber-600">{formatCOP(kpis.topClientAmount)}</span>
        </div>
      </div>

      {/* 5. SECCIÓN DE TORTAS Y COSAS VISUALES */}
      {(reportActiveTab === 'TODOS' || reportActiveTab === 'TORTAS') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Distribución Visual en Tortas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* TORTA 1: VENTAS POR ASESOR COMERCIAL */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Ventas por Comercial
                </h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sellerPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {sellerPieData.map((_, index) => (
                          <Cell key={`cell-sel-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => formatCOP(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pt-2 border-t border-slate-100 text-[11px]">
                {sellerPieData.slice(0, 5).map((entry, idx) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="truncate pr-2">{entry.name}</span>
                    <span className="font-bold">{kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TORTA 2: SEDES Y SUCURSALES */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" /> Sedes y Sucursales
                </h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costCenterPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {costCenterPieData.map((_, index) => (
                          <Cell key={`cell-cc-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => formatCOP(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pt-2 border-t border-slate-100 text-[11px]">
                {costCenterPieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="truncate pr-2">{entry.name}</span>
                    <span className="font-bold">{kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TORTA 3: FAMILIAS QUÍMICAS */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-purple-600" /> Familias Químicas
                </h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={familyPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {familyPieData.map((_, index) => (
                          <Cell key={`cell-fam-${index}`} fill={PIE_COLORS[(index + 4) % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => formatCOP(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pt-2 border-t border-slate-100 text-[11px]">
                {familyPieData.slice(0, 5).map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="truncate pr-2">{entry.name}</span>
                    <span className="font-bold">{kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TORTA 4: CANALES DE VENTA */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-500" /> Canales de Venta
                </h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={65}
                        paddingAngle={3}
                      >
                        {channelPieData.map((_, index) => (
                          <Cell key={`cell-ch-${index}`} fill={PIE_COLORS[(index + 6) % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => formatCOP(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pt-2 border-t border-slate-100 text-[11px]">
                {channelPieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="truncate pr-2">{entry.name}</span>
                    <span className="font-bold">{kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. CHARTS SECTION (TENDENCIAS Y TOP CLIENTES) */}
      {(reportActiveTab === 'TODOS' || reportActiveTab === 'TENDENCIAS') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
            <h2 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Evolución Mensual de Ventas Netas
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip formatter={(value: number) => formatCOP(value)} labelStyle={{ fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="ventas" name="Venta Neta" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
            <h2 className="text-xs font-black text-slate-900 mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" /> Top 10 Clientes por Volumen Facturado
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClientsData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={(val) => `$${(val/1000000).toFixed(0)}M`} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip formatter={(value: number) => formatCOP(value)} />
                  <Bar dataKey="amount" name="Venta Neta" radius={[0, 4, 4, 0]}>
                    {topClientsData.map((_, index) => (
                      <Cell key={`cell-bar-${index}`} fill={index === 0 ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 7. TABLA DE RESULTADOS (LIBRO AUXILIAR CON TOTALES FIJOS Y COLUMNAS OPERATIVAS) */}
      {(reportActiveTab === 'TODOS' || reportActiveTab === 'TABLA') && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Sábana Operativa & Comprobantes Contables
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filas:</span>
              <select 
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="font-bold border border-slate-200 bg-white rounded px-2 py-1 text-slate-700 outline-none"
              >
                <option value="15">15</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="250">250</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Comprobante</th>
                  <th className="py-2.5 px-3">Asesor Comercial</th>
                  <th className="py-2.5 px-3">Sede / POS</th>
                  <th className="py-2.5 px-3">Tercero / Cliente</th>
                  <th className="py-2.5 px-3">Cuenta PUC</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Detalle</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">IVA</th>
                  <th className="py-2.5 px-3 text-right">Total Neto</th>
                  <th className="py-2.5 px-3 text-right">Total Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-10 text-center text-slate-400 font-medium">
                      No hay transacciones que coincidan con los criterios seleccionados en el filtro.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((tx, idx) => {
                    const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
                    const netAmount = Math.abs(tx.total) - (tx.iva || 0);
                    const puc = tx.type === 'VENTA' ? '413505' : (isReturn ? '417505' : (tx.type === 'COMPRA' ? '143505' : '110505'));
                    const sellerName = getTxSeller(tx).split(' (')[0];

                    return (
                      <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono whitespace-nowrap text-slate-500">{tx.date}</td>
                        <td className="py-2 px-3 font-mono font-bold">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            isReturn ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {tx.document || tx.id}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-semibold max-w-[130px] truncate" title={getTxSeller(tx)}>
                          {sellerName}
                        </td>
                        <td className="py-2 px-3 text-slate-500 max-w-[130px] truncate" title={tx.posLocation}>
                          {tx.posLocation || 'Principal'}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-800 max-w-[180px] truncate" title={tx.client}>
                          {tx.client || 'Consumidor Final'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 font-bold">
                          {puc}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 text-[10.5px]">
                          {tx.sku && tx.sku !== '-' ? tx.sku : 'DIVERSO'}
                        </td>
                        <td className="py-2 px-3 max-w-[170px] truncate text-slate-700" title={tx.productName}>
                          {tx.productName || 'Varios'}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-800">
                          {tx.qty || 1}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400 font-mono">
                          {formatCOP(tx.iva || 0)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-700 font-mono">
                          {formatCOP(isReturn ? -netAmount : netAmount)}
                        </td>
                        <td className={`py-2 px-3 text-right font-black font-mono ${isReturn ? 'text-rose-600' : 'text-slate-900'}`}>
                          {formatCOP(tx.total)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              
              {filteredData.length > 0 && (
                <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-xs">
                  <tr>
                    <td colSpan={8} className="py-2.5 px-3 text-right uppercase tracking-wider text-slate-600 font-bold">
                      Totales ({filteredData.length} docs):
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {filteredData.reduce((sum, tx) => sum + (tx.qty || 1), 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatCOP(kpis.totalIva)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-700">
                      {formatCOP(kpis.totalNet)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">
                      {formatCOP(kpis.totalGross)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
            <div>
              {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length.toLocaleString()} registros
            </div>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 font-bold"
              >
                « Primero
              </button>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 font-bold"
              >
                Anterior
              </button>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded border border-indigo-100">
                {currentPage} / {totalPages || 1}
              </span>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 font-bold"
              >
                Siguiente
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 font-bold"
              >
                Último »
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
