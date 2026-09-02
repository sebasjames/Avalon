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
  Tag
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

  // --- STATE: WORLD OFFICE FULL CRITERIA MATRIX ---
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [activeFilterCategory, setActiveFilterCategory] = useState<'ALL' | 'OPERACION' | 'FECHAS' | 'CLIENTES' | 'PRODUCTOS' | 'CONTABLE'>('ALL');
  const [hasGeneratedReport, setHasGeneratedReport] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>(
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  
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
  const [selectedTimeShift, setSelectedTimeShift] = useState('ALL'); // ALL, MANANA, TARDE

  // 3. Terceros & Clientes
  const [terceroType, setTerceroType] = useState<'TODOS' | 'CLIENTES' | 'PROVEEDORES'>('TODOS');
  const [terceroFrom, setTerceroFrom] = useState('');
  const [terceroTo, setTerceroTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [clientCategory, setClientCategory] = useState('ALL'); // ALL, VIP, FRECUENTE, OCASIONAL

  // 4. Inventario & Familias Químicas
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [skuSearch, setSkuSearch] = useState('');
  const [skuFrom, setSkuFrom] = useState('');
  const [skuTo, setSkuTo] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ALL');

  // 5. Cuentas Contables (PUC) & Fiscal
  const [pucClassFilter, setPucClassFilter] = useState('ALL');
  const [pucFrom, setPucFrom] = useState('110505');
  const [pucTo, setPucTo] = useState('413595');
  const [pucLevel, setPucLevel] = useState<'AUXILIAR' | 'SUBCUENTA' | 'CUENTA'>('AUXILIAR');
  const [centroFrom, setCentroFrom] = useState('01');
  const [centroTo, setCentroTo] = useState('99');

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
  const [onlyPendingBalance, setOnlyPendingBalance] = useState(false);

  // Active View Tab for Report
  const [reportActiveTab, setReportActiveTab] = useState<'TODOS' | 'TORTAS' | 'TENDENCIAS' | 'TABLA'>('TODOS');

  // Paginación
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Operational Enrichment Helpers (Deterministic business mapping for records lacking fields)
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

  // Quick Period Presets Handler
  const handleApplyPeriodPreset = (preset: 'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | '2026' | '2025') => {
    setPeriodPreset(preset);
    const now = new Date();
    
    if (preset === 'ALL') {
      setDateFrom('');
      setDateTo('');
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
    } else if (preset === '2025') {
      setDateFrom('2025-01-01');
      setDateTo('2025-12-31');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    // Operación
    setSelectedSeller('ALL');
    setSellerFrom('');
    setSellerTo('');
    setSelectedCostCenter('ALL');
    setSelectedPosPoint('ALL');
    setSelectedChannel('ALL');
    setSelectedCity('ALL');
    setMinAmount('');
    setMaxAmount('');

    // Fechas
    setPeriodPreset('ALL');
    setDateFrom('');
    setDateTo('');
    setSelectedTimeShift('ALL');

    // Terceros
    setTerceroType('TODOS');
    setTerceroFrom('');
    setTerceroTo('');
    setSearchTerm('');
    setClientCategory('ALL');

    // Inventario
    setSelectedFamily('ALL');
    setSkuSearch('');
    setSkuFrom('');
    setSkuTo('');
    setSelectedUnit('ALL');

    // Contable
    setPucClassFilter('ALL');
    setPucFrom('110505');
    setPucTo('413595');
    setPucLevel('AUXILIAR');
    setCentroFrom('01');
    setCentroTo('99');

    // Documentos
    setDocTypeFVE(true);
    setDocTypeNC(true);
    setDocTypeRC(false);
    setDocTypeCE(false);
    setDocTypeCOT(false);
    setDocTypeREM(false);
    setDocConsecutivoFrom('');
    setDocConsecutivoTo('');
    setSelectedPaymentMethod('ALL');

    // Opciones
    setGroupByTercero(false);
    setShowDocDetails(true);
    setIncludeIvaBreakdown(true);
    setShowChemicalVolume(true);
    setHideZeroBalances(false);
    setOnlyPendingBalance(false);
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
    'Carlos Ruiz (Director Mostrador)',
    'Ana Silva (Key Account B2B)',
    'Laura Gómez (E-commerce Lead)',
    'Jorge Vargas (Distribución)',
    'Andrés Mendoza (Institucional)',
    'Sofía Castro (Ejecutiva B2B)',
    'Omar Procoquinal (Gerencia Comercial)'
  ];

  const uniqueChannels = ['B2B Corporativo', 'Venta Mostrador', 'Distribuidores', 'E-commerce / WhatsApp'];
  const uniqueCities = ['Bogotá D.C.', 'Soacha', 'Chía / Cota', 'Funza / Mosquera', 'Medellín'];
  const uniquePosPoints = ['Caja 01 Mostrador', 'Caja 02 B2B Mayoristas', 'Caja 03 Despachos', 'Caja Digital E-com'];
  const uniquePaymentMethods = ['Datáfonos', 'Efectivo', 'Bancolombia', 'Nequi', 'Crédito'];

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
      if (selectedSeller !== 'ALL' && seller !== selectedSeller) return false;
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
      if (selectedCity !== 'ALL' && city !== selectedCity) return false;

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

  // Torta 2: Ventas por Vendedor / Comercial (Operativo)
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
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-slate-50 min-h-screen text-slate-800">
      
      {/* 1. TOP HEADER & WORLD OFFICE TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center shadow-md shadow-slate-300">
            <FolderKanban className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Explorador de Informes Completo (Modo World Office)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                Operativo & Fiscal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Matriz integral de filtros: ventas, sedes, puntos, comerciales, fechas, terceros, inventario y PUC contable.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-2 cursor-pointer"
            title="Procesar y generar informe visual completo"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            {isGenerating ? 'Generando...' : 'Generar Informe'}
          </button>

          <button 
            onClick={handleExportToExcel}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
            title="Exportar a libro Excel formal con hojas de detalle y terceros"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar a Excel
          </button>

          <button 
            onClick={handleResetFilters}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            title="Limpiar y restablecer todos los filtros"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Limpiar
          </button>

          <button 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {isFilterPanelOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. EL GRAN FILTRO WORLD OFFICE TOTAL (MATRIZ COMPLETA DE CRITERIOS) */}
      {isFilterPanelOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          
          {/* Navegador de Categorías de Filtro (Estilo ERP World Office) */}
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

            {/* Quick Period Presets */}
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

          {/* Grid de Secciones Filtros Desde - Hasta */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            
            {/* BLOQUE A: ASESOR COMERCIAL & VENTAS (OPERACIÓN) */}
            {(activeFilterCategory === 'ALL' || activeFilterCategory === 'OPERACION') && (
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-indigo-600" /> 1. Asesor Comercial / Vendedor</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seleccionar Vendedor:</label>
                    <select 
                      value={selectedSeller}
                      onChange={e => { setSelectedSeller(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 outline-none"
                    >
                      <option value="ALL">-- Todos los Comerciales --</option>
                      {uniqueSellers.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vendedor Desde:</label>
                      <input 
                        type="text" 
                        placeholder="A..."
                        value={sellerFrom}
                        onChange={e => { setSellerFrom(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vendedor Hasta:</label>
                      <input 
                        type="text" 
                        placeholder="Z..."
                        value={sellerTo}
                        onChange={e => { setSellerTo(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE B: SEDES, PUNTOS DE VENTA & BODEGAS */}
            {(activeFilterCategory === 'ALL' || activeFilterCategory === 'OPERACION') && (
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-blue-600" /> 2. Sedes, Puntos & Cajas</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sede / Sucursal:</label>
                    <select 
                      value={selectedCostCenter}
                      onChange={e => { setSelectedCostCenter(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 outline-none"
                    >
                      <option value="ALL">-- Todas las Sedes --</option>
                      {uniqueCostCenters.map(cc => (
                        <option key={cc} value={cc}>{cc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Punto / Caja POS:</label>
                      <select 
                        value={selectedPosPoint}
                        onChange={e => { setSelectedPosPoint(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value="ALL">Todas las Cajas</option>
                        {uniquePosPoints.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Canal de Venta:</label>
                      <select 
                        value={selectedChannel}
                        onChange={e => { setSelectedChannel(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value="ALL">Todos los Canales</option>
                        {uniqueChannels.map(ch => (
                          <option key={ch} value={ch}>{ch}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE C: RANGO DE FECHAS & PERIODOS */}
            {(activeFilterCategory === 'ALL' || activeFilterCategory === 'FECHAS') && (
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-600" /> 3. Fechas y Horarios</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha Desde:</label>
                      <input 
                        type="date" 
                        value={dateFrom} 
                        onChange={e => { setDateFrom(e.target.value); setPeriodPreset('CUSTOM'); setCurrentPage(1); }}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha Hasta:</label>
                      <input 
                        type="date" 
                        value={dateTo} 
                        onChange={e => { setDateTo(e.target.value); setPeriodPreset('CUSTOM'); setCurrentPage(1); }}
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jornada / Turno:</label>
                    <select 
                      value={selectedTimeShift}
                      onChange={e => setSelectedTimeShift(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                    >
                      <option value="ALL">Todo el Horario Comercial</option>
                      <option value="MANANA">Turno Mañana (07:00 AM - 01:00 PM)</option>
                      <option value="TARDE">Turno Tarde (01:00 PM - 06:30 PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE D: TERCEROS, CLIENTES & CIUDAD */}
            {(activeFilterCategory === 'ALL' || activeFilterCategory === 'CLIENTES') && (
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-600" /> 4. Terceros & Clientes</span>
                  <select 
                    value={terceroType} 
                    onChange={e => { setTerceroType(e.target.value as any); setCurrentPage(1); }}
                    className="text-[10px] font-bold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="CLIENTES">Clientes</option>
                    <option value="PROVEEDORES">Proveedores</option>
                  </select>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Buscar Tercero / NIT:</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Nombre, NIT o cédula..."
                        value={searchTerm} 
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ciudad / Región:</label>
                      <select 
                        value={selectedCity}
                        onChange={e => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value="ALL">Todas</option>
                        {uniqueCities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tercero Desde:</label>
                      <input 
                        type="text" 
                        placeholder="A..."
                        value={terceroFrom} 
                        onChange={e => { setTerceroFrom(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE E: QUÍMICOS, PRODUCTO & KARDEX */}
            {(activeFilterCategory === 'ALL' || activeFilterCategory === 'PRODUCTOS') && (
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-purple-600" /> 5. Portafolio & Línea Química</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Familia Química:</label>
                    <select 
                      value={selectedFamily}
                      onChange={e => { setSelectedFamily(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none"
                    >
                      <option value="ALL">-- Todas las Familias --</option>
                      {uniqueFamilies.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKU Desde:</label>
                      <input 
                        type="text" 
                        placeholder="IL-001"
                        value={skuFrom} 
                        onChange={e => { setSkuFrom(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SKU Hasta:</label>
                      <input 
                        type="text" 
                        placeholder="IL-999"
                        value={skuTo} 
                        onChange={e => { setSkuTo(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BLOQUE F: CUENTAS CONTABLES PUC & COMPROBANTES */}
            {(activeFilterCategory === 'ALL' || activeFilterCategory === 'CONTABLE') && (
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-emerald-600" /> 6. Cuentas PUC & Comprobantes</span>
                  <select 
                    value={pucClassFilter} 
                    onChange={e => { setPucClassFilter(e.target.value); setCurrentPage(1); }}
                    className="text-[10px] font-bold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                  >
                    <option value="ALL">Todas las Clases</option>
                    <option value="4_INGRESOS">Clase 4 (Ingresos)</option>
                    <option value="1_ACTIVOS">Clase 1 (Activos)</option>
                    <option value="2_PASIVOS">Clase 2 (Pasivos)</option>
                  </select>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cuenta Desde:</label>
                      <input 
                        type="text" 
                        placeholder="110505"
                        value={pucFrom} 
                        onChange={e => { setPucFrom(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cuenta Hasta:</label>
                      <input 
                        type="text" 
                        placeholder="413595"
                        value={pucTo} 
                        onChange={e => { setPucTo(e.target.value); setCurrentPage(1); }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={docTypeFVE} onChange={e => { setDocTypeFVE(e.target.checked); setCurrentPage(1); }} className="rounded" />
                      <span className="font-bold text-slate-700">FVE</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={docTypeNC} onChange={e => { setDocTypeNC(e.target.checked); setCurrentPage(1); }} className="rounded text-rose-600" />
                      <span className="font-bold text-rose-700">NC</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={docTypeCE} onChange={e => { setDocTypeCE(e.target.checked); setCurrentPage(1); }} className="rounded" />
                      <span className="font-bold text-amber-700">CE</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={docTypeRC} onChange={e => { setDocTypeRC(e.target.checked); setCurrentPage(1); }} className="rounded" />
                      <span className="font-bold text-emerald-700">RC</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={docTypeCOT} onChange={e => { setDocTypeCOT(e.target.checked); setCurrentPage(1); }} className="rounded" />
                      <span className="font-bold text-indigo-700">COT</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RANGO DE MONTOS & OPCIONES DE PRESENTACIÓN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarIcon className="w-3.5 h-3.5 text-emerald-600" /> Rango de Montos de Venta ($ COP)
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Monto Mínimo $"
                  value={minAmount}
                  onChange={e => { setMinAmount(e.target.value); setCurrentPage(1); }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <input 
                  type="number" 
                  placeholder="Monto Máximo $"
                  value={maxAmount}
                  onChange={e => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" /> Opciones de Auditoría y Salida
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={groupByTercero} onChange={e => setGroupByTercero(e.target.checked)} className="rounded text-indigo-600" />
                  <span className="text-[11px] font-medium text-slate-600">Agrupar por Tercero</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={showChemicalVolume} onChange={e => setShowChemicalVolume(e.target.checked)} className="rounded text-indigo-600" />
                  <span className="text-[11px] font-medium text-slate-600">Calcular Litros / Kilos</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={hideZeroBalances} onChange={e => { setHideZeroBalances(e.target.checked); setCurrentPage(1); }} className="rounded text-indigo-600" />
                  <span className="text-[11px] font-medium text-slate-600">Ocultar en Cero</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={includeIvaBreakdown} onChange={e => setIncludeIvaBreakdown(e.target.checked)} className="rounded text-indigo-600" />
                  <span className="text-[11px] font-medium text-slate-600">Desglose de Impuestos</span>
                </label>
              </div>
            </div>
          </div>

          {/* Gran Botón de Acción Principal para Omar: GENERAR INFORME */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Criterios completos aplicados: <strong>{filteredData.length.toLocaleString()} transacciones</strong> encontradas.</span>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-300" />
              )}
              <span>{isGenerating ? 'PROCESANDO CRITERIOS...' : 'GENERAR INFORME COMPLETO & TORTAS'}</span>
            </button>
          </div>

        </div>
      )}

      {/* 3. RESUMEN DE CRITERIOS ACTIVOS & ESTADO DEL INFORME */}
      <div ref={reportResultsRef} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-extrabold text-indigo-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Informe Generado
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 font-medium">Actualizado: <strong className="text-slate-900">{reportGeneratedAt}</strong></span>
          <span className="text-slate-400">|</span>
          <span className="bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
            Vendedor: {selectedSeller === 'ALL' ? 'Todos' : selectedSeller.split(' (')[0]}
          </span>
          <span className="bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
            Sede: {selectedCostCenter === 'ALL' ? 'Todas' : selectedCostCenter}
          </span>
          <span className="bg-slate-100 px-2.5 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
            Periodo: {dateFrom || 'Inicio'} a {dateTo || 'Fin'}
          </span>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button 
            onClick={() => setReportActiveTab('TODOS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              reportActiveTab === 'TODOS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vista Completa
          </button>
          <button 
            onClick={() => setReportActiveTab('TORTAS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              reportActiveTab === 'TORTAS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" /> Tortas
          </button>
          <button 
            onClick={() => setReportActiveTab('TENDENCIAS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              reportActiveTab === 'TENDENCIAS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Tendencias
          </button>
          <button 
            onClick={() => setReportActiveTab('TABLA')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              reportActiveTab === 'TABLA' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Sábana
          </button>
        </div>
      </div>

      {/* 4. KPIS EJECUTIVOS (TARJETAS VISUALES) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venta Neta</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">{formatCOP(kpis.totalNet)}</div>
          <span className="text-[11px] text-slate-500 font-medium">Bruta: {formatCOP(kpis.totalGross)}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IVA Recaudado</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2">{formatCOP(kpis.totalIva)}</div>
          <span className="text-[11px] text-slate-400 font-medium">Cuenta 240801</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comprobantes</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-blue-600 mt-2">{kpis.docCount.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-medium">Ticket: {formatCOP(kpis.avgTicket)}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-rose-300 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Devoluciones</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-600 mt-2">{formatCOP(kpis.returnsTotal)}</div>
          <span className="text-[11px] text-rose-400 font-semibold">Tasa: {kpis.returnsImpact.toFixed(1)}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Volumen Químico</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TestTube className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-700 mt-2">
            {Math.round(physicalKpis.totalLiters).toLocaleString()} <span className="text-xs font-normal">LT</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {Math.round(physicalKpis.totalKilos).toLocaleString()} KG Estimados
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Cliente Top #1</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-800 truncate mt-2" title={kpis.topClientName}>
            {kpis.topClientName}
          </div>
          <span className="text-xs font-black text-amber-600">{formatCOP(kpis.topClientAmount)}</span>
        </div>

      </div>

      {/* 5. SECCIÓN DE TORTAS Y COSAS VISUALES (OPERACIÓN, VENTAS, SEDES, COMERCIALES) */}
      {(reportActiveTab === 'TODOS' || reportActiveTab === 'TORTAS') && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">Distribución Visual en Tortas (Operación, Sedes y Comerciales)</h2>
            <span className="text-xs text-slate-400 font-medium">Analítica multidimensional requerida</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
            {/* TORTA 1: VENTAS POR ASESOR COMERCIAL / VENDEDOR */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" /> Ventas por Comercial
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Fuerza Venta</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">Aporte por asesor y ejecutivo de cuenta</p>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sellerPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={70}
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

              {/* Leyenda Detallada */}
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pt-2 border-t border-slate-100 text-xs">
                {sellerPieData.slice(0, 5).map((entry, idx) => {
                  const pct = kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : '0';
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-slate-700 font-medium truncate">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TORTA 2: DISTRIBUCIÓN POR SEDES / SUCURSALES */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-600" /> Sedes y Sucursales
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Puntos POS</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">Ventas por centro operativo y mostrador</p>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costCenterPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={70}
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

              {/* Leyenda */}
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pt-2 border-t border-slate-100 text-xs">
                {costCenterPieData.map((entry, idx) => {
                  const pct = kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : '0';
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[(idx + 2) % PIE_COLORS.length] }} />
                        <span className="text-slate-700 font-medium truncate">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TORTA 3: MIX POR FAMILIAS QUÍMICAS */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-purple-600" /> Familias Químicas
                  </h3>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Kardex</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">Poliuretano, Fondos, Acabados, Solventes</p>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={familyPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={70}
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

              {/* Leyenda */}
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pt-2 border-t border-slate-100 text-xs">
                {familyPieData.slice(0, 5).map((entry, idx) => {
                  const pct = kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : '0';
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[(idx + 4) % PIE_COLORS.length] }} />
                        <span className="text-slate-700 font-medium truncate">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TORTA 4: CANAL DE VENTA & DISTRIBUCIÓN */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-500" /> Canales de Venta
                  </h3>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Rutas</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">B2B, Mostrador, Mayoristas y E-com</p>
                
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={70}
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

              {/* Leyenda */}
              <div className="mt-3 space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pt-2 border-t border-slate-100 text-xs">
                {channelPieData.map((entry, idx) => {
                  const pct = kpis.totalNet > 0 ? ((entry.value / kpis.totalNet) * 100).toFixed(1) : '0';
                  return (
                    <div key={entry.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[(idx + 6) % PIE_COLORS.length] }} />
                        <span className="text-slate-700 font-medium truncate">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. CHARTS SECTION (TENDENCIAS Y TOP CLIENTES) */}
      {(reportActiveTab === 'TODOS' || reportActiveTab === 'TENDENCIAS') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Time Series */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900">Evolución Mensual de Ventas Netas</h2>
              </div>
              <span className="text-xs font-bold text-slate-400">Total Histórico</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip formatter={(value: number) => formatCOP(value)} labelStyle={{ fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="ventas" name="Venta Neta" stroke="#4f46e5" strokeWidth={3} dot={{ r: 3.5 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 10 Clients Bar Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-black text-slate-900">Top 10 Clientes por Volumen Facturado</h2>
              </div>
              <span className="text-xs font-bold text-amber-600">Venta Neta</span>
            </div>
            <div className="h-64">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Table Header & Size selector */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Sábana Operativa & Comprobantes Contables (Detalle Fila por Fila)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Filas por vista:</span>
              <select 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs font-bold border border-slate-200 bg-white rounded-lg px-2.5 py-1 text-slate-700 outline-none"
              >
                <option value="15">15 filas</option>
                <option value="50">50 filas</option>
                <option value="100">100 filas</option>
                <option value="250">250 filas</option>
                <option value="1000">1000 filas</option>
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Comprobante</th>
                  <th className="py-3 px-4">Asesor Comercial</th>
                  <th className="py-3 px-4">Sede / POS</th>
                  <th className="py-3 px-4">Tercero / Cliente</th>
                  <th className="py-3 px-4">Cuenta PUC</th>
                  <th className="py-3 px-4">Referencia SKU</th>
                  <th className="py-3 px-4">Producto / Detalle</th>
                  <th className="py-3 px-4 text-center">Cant.</th>
                  <th className="py-3 px-4 text-right">IVA</th>
                  <th className="py-3 px-4 text-right">Total Neto</th>
                  <th className="py-3 px-4 text-right">Total Bruto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400 font-medium">
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
                      <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-mono whitespace-nowrap text-slate-500">{tx.date}</td>
                        <td className="py-2.5 px-4 font-mono font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isReturn 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {tx.document || tx.id}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-semibold max-w-[140px] truncate" title={getTxSeller(tx)}>
                          {sellerName}
                        </td>
                        <td className="py-2.5 px-4 text-[11px] text-slate-500 max-w-[140px] truncate" title={tx.posLocation}>
                          {tx.posLocation || 'Principal'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 max-w-[200px] truncate" title={tx.client}>
                          {tx.client || 'Consumidor Final'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 font-bold">
                          {puc}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 text-xs">
                          {tx.sku && tx.sku !== '-' ? tx.sku : 'DIVERSO'}
                        </td>
                        <td className="py-2.5 px-4 max-w-[180px] truncate text-slate-700" title={tx.productName}>
                          {tx.productName || 'Varios'}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                          {tx.qty || 1}
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-400 font-mono">
                          {formatCOP(tx.iva || 0)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-700 font-mono">
                          {formatCOP(isReturn ? -netAmount : netAmount)}
                        </td>
                        <td className={`py-2.5 px-4 text-right font-black font-mono ${isReturn ? 'text-rose-600' : 'text-slate-900'}`}>
                          {formatCOP(tx.total)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              
              {/* Totales Fijos en el Pie de la Tabla (Como en World Office) */}
              {filteredData.length > 0 && (
                <tfoot className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300 text-xs">
                  <tr>
                    <td colSpan={8} className="py-3 px-4 text-right uppercase tracking-wider text-slate-600 font-bold">
                      Totales Consolidados del Informe ({filteredData.length} transacciones):
                    </td>
                    <td className="py-3 px-4 text-center">
                      {filteredData.reduce((sum, tx) => sum + (tx.qty || 1), 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {formatCOP(kpis.totalIva)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-indigo-700">
                      {formatCOP(kpis.totalNet)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">
                      {formatCOP(kpis.totalGross)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length.toLocaleString()} registros
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 font-bold"
              >
                « Primero
              </button>
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 font-bold"
              >
                Anterior
              </button>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded-lg border border-indigo-100">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 font-bold"
              >
                Siguiente
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 font-bold"
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
