import React, { useState, useMemo } from 'react';
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
  FolderKanban
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useEnterprise } from '../context/EnterpriseContext';
import { ACCOUNTING_TRANSACTIONS } from '../data/accounting_ledger';
import { INVENTORY_DATA } from '../data/inventory';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
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

export const InformesOmar: React.FC = () => {
  const enterprise = useEnterprise();
  
  // Use live enterprise transactions if available, fallback to static ledger
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

  // --- WORLD OFFICE FILTER STATE ---
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  
  // 1. Fechas & Periodo
  const [periodPreset, setPeriodPreset] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | '2026' | '2025' | 'CUSTOM'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 2. Cuentas Contables (PUC)
  const [pucClassFilter, setPucClassFilter] = useState('ALL'); // ALL, 1_ACTIVOS, 2_PASIVOS, 4_INGRESOS, 5_GASTOS
  const [pucFrom, setPucFrom] = useState('110505');
  const [pucTo, setPucTo] = useState('413595');
  const [pucLevel, setPucLevel] = useState<'AUXILIAR' | 'SUBCUENTA' | 'CUENTA'>('AUXILIAR');

  // 3. Terceros
  const [terceroType, setTerceroType] = useState<'TODOS' | 'CLIENTES' | 'PROVEEDORES'>('TODOS');
  const [terceroFrom, setTerceroFrom] = useState('');
  const [terceroTo, setTerceroTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 4. Centro de Costos & Sucursales
  const [selectedCostCenter, setSelectedCostCenter] = useState('ALL');
  const [centroFrom, setCentroFrom] = useState('01');
  const [centroTo, setCentroTo] = useState('99');

  // 5. Documentos / Fuentes
  const [docTypeFVE, setDocTypeFVE] = useState(true);
  const [docTypeNC, setDocTypeNC] = useState(true);
  const [docTypeRC, setDocTypeRC] = useState(false);
  const [docTypeCE, setDocTypeCE] = useState(false);
  const [docConsecutivoFrom, setDocConsecutivoFrom] = useState('');
  const [docConsecutivoTo, setDocConsecutivoTo] = useState('');

  // 6. Inventario & Líneas Químicas
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [skuSearch, setSkuSearch] = useState('');

  // 7. Opciones de Presentación
  const [groupByTercero, setGroupByTercero] = useState(false);
  const [showDocDetails, setShowDocDetails] = useState(true);
  const [includeIvaBreakdown, setIncludeIvaBreakdown] = useState(true);
  const [showChemicalVolume, setShowChemicalVolume] = useState(true);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  // Paginación
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

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
    setPeriodPreset('ALL');
    setDateFrom('');
    setDateTo('');
    setPucClassFilter('ALL');
    setPucFrom('110505');
    setPucTo('413595');
    setPucLevel('AUXILIAR');
    setTerceroType('TODOS');
    setTerceroFrom('');
    setTerceroTo('');
    setSearchTerm('');
    setSelectedCostCenter('ALL');
    setCentroFrom('01');
    setCentroTo('99');
    setDocTypeFVE(true);
    setDocTypeNC(true);
    setDocTypeRC(false);
    setDocTypeCE(false);
    setDocConsecutivoFrom('');
    setDocConsecutivoTo('');
    setSelectedFamily('ALL');
    setSkuSearch('');
    setGroupByTercero(false);
    setShowDocDetails(true);
    setIncludeIvaBreakdown(true);
    setShowChemicalVolume(true);
    setHideZeroBalances(false);
    setCurrentPage(1);
  };

  // Distinct families from inventory & transactions for filters
  const uniqueFamilies = useMemo(() => {
    const set = new Set<string>();
    allRawTransactions.forEach(t => { if (t.family) set.add(t.family); });
    inventorySource.forEach(p => { if (p.family) set.add(p.family); });
    return Array.from(set).sort();
  }, [allRawTransactions, inventorySource]);

  // Distinct locations / cost centers
  const uniqueCostCenters = useMemo(() => {
    const set = new Set<string>();
    allRawTransactions.forEach(t => { if (t.posLocation) set.add(t.posLocation); });
    return Array.from(set).sort();
  }, [allRawTransactions]);

  // --- FILTER EXECUTION ---
  const filteredData = useMemo(() => {
    return allRawTransactions.filter(tx => {
      const txTypeStr = (tx.type || '') as string;
      const isVenta = txTypeStr === 'VENTA' || (!tx.type && (tx.id?.startsWith('FV') || tx.document?.startsWith('FV')));
      const isNotaCredito = txTypeStr === 'NOTA_CREDITO' || tx.total < 0 || tx.id?.startsWith('NC');
      const isCompraEgreso = txTypeStr === 'COMPRA' || txTypeStr === 'GASTO' || tx.id?.startsWith('CE') || tx.id?.startsWith('CM');
      const isReciboCaja = txTypeStr === 'RECIBO_CAJA' || txTypeStr === 'PAGO_RECIBIDO' || tx.id?.startsWith('RC');

      let matchesDocType = false;
      if (docTypeFVE && isVenta && !isNotaCredito) matchesDocType = true;
      if (docTypeNC && isNotaCredito) matchesDocType = true;
      if (docTypeCE && isCompraEgreso) matchesDocType = true;
      if (docTypeRC && isReciboCaja) matchesDocType = true;
      if (!matchesDocType) return false;

      // 2. Dates
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;

      // 3. Search Term (Client or Document or NIT)
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const clientMatch = tx.client && tx.client.toLowerCase().includes(q);
        const docMatch = tx.document && tx.document.toLowerCase().includes(q);
        const idMatch = tx.id && tx.id.toLowerCase().includes(q);
        const skuMatch = tx.sku && tx.sku.toLowerCase().includes(q);
        if (!clientMatch && !docMatch && !idMatch && !skuMatch) return false;
      }

      // 4. Tercero Rango (Alfabético / NIT)
      if (terceroFrom && tx.client && tx.client.toLowerCase() < terceroFrom.toLowerCase()) return false;
      if (terceroTo && tx.client && tx.client.toLowerCase() > terceroTo.toLowerCase()) return false;

      // 5. Centro de Costos / Sede
      if (selectedCostCenter !== 'ALL' && tx.posLocation && tx.posLocation !== selectedCostCenter) {
        return false;
      }

      // 6. Consecutivos
      if (docConsecutivoFrom && tx.document && tx.document.toLowerCase() < docConsecutivoFrom.toLowerCase()) return false;
      if (docConsecutivoTo && tx.document && tx.document.toLowerCase() > docConsecutivoTo.toLowerCase()) return false;

      // 7. Familia de Producto
      if (selectedFamily !== 'ALL' && tx.family && tx.family !== selectedFamily) {
        return false;
      }

      // 8. SKU específico
      if (skuSearch) {
        const s = skuSearch.toLowerCase();
        const skuMatches = (tx.sku && tx.sku.toLowerCase().includes(s)) || (tx.productName && tx.productName.toLowerCase().includes(s));
        if (!skuMatches) return false;
      }

      // 9. Cuentas PUC (Clase 1, 2, 4, 5)
      const mappedPuc = tx.type === 'VENTA' ? '413505' : (tx.type === 'NOTA_CREDITO' ? '417505' : (tx.type === 'COMPRA' ? '143505' : '110505'));
      if (pucClassFilter !== 'ALL') {
        if (pucClassFilter === '1_ACTIVOS' && !mappedPuc.startsWith('1')) return false;
        if (pucClassFilter === '2_PASIVOS' && !mappedPuc.startsWith('2')) return false;
        if (pucClassFilter === '4_INGRESOS' && !mappedPuc.startsWith('4')) return false;
        if (pucClassFilter === '5_GASTOS' && !mappedPuc.startsWith('5')) return false;
      }
      if (pucFrom && mappedPuc < pucFrom) return false;
      if (pucTo && mappedPuc > pucTo) return false;

      // 10. Hide zero balances
      if (hideZeroBalances && (!tx.total || tx.total === 0)) return false;

      return true;
    });
  }, [
    allRawTransactions, docTypeFVE, docTypeNC, docTypeCE, docTypeRC,
    dateFrom, dateTo, searchTerm, terceroFrom, terceroTo,
    selectedCostCenter, docConsecutivoFrom, docConsecutivoTo,
    selectedFamily, skuSearch, pucClassFilter, pucFrom, pucTo, hideZeroBalances
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

  // Top 10 Clients
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

  // Pagination Data
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Real Excel Export (World Office Style)
  const handleExportToExcel = () => {
    const exportRows = filteredData.map(tx => {
      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const net = Math.abs(tx.total) - (tx.iva || 0);
      const puc = tx.type === 'VENTA' ? '413505 (Comercio)' : (tx.type === 'NOTA_CREDITO' ? '417505 (Devolución)' : '110505 (Caja)');

      return {
        'Fecha': tx.date,
        'Tipo Comprobante': tx.type || 'VENTA',
        'Consecutivo Documento': tx.document || tx.id,
        'Tercero / Cliente': tx.client || 'Consumidor Final',
        'Identificación / NIT': tx.document || '222222222222',
        'Cuenta Contable PUC': puc,
        'Centro de Costos': tx.posLocation || 'Principal',
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
    XLSX.utils.book_append_sheet(wb, ws1, "Informe_WorldOffice");

    // Hoja 2: Resumen por Tercero
    const terceroMap: Record<string, { nit: string, ventasNetas: number, iva: number, total: number, docs: number }> = {};
    filteredData.forEach(tx => {
      const key = tx.client || 'Consumidor Final';
      if (!terceroMap[key]) {
        terceroMap[key] = { nit: tx.document || 'N/A', ventasNetas: 0, iva: 0, total: 0, docs: 0 };
      }
      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const net = Math.abs(tx.total) - (tx.iva || 0);
      terceroMap[key].ventasNetas += isReturn ? -net : net;
      terceroMap[key].iva += tx.iva || 0;
      terceroMap[key].total += tx.total;
      terceroMap[key].docs += 1;
    });

    const ws2Data = Object.entries(terceroMap).map(([client, data]) => ({
      'Tercero': client,
      'NIT/Documento': data.nit,
      'N° Transacciones': data.docs,
      'Ventas Netas ($)': data.ventasNetas,
      'IVA Total ($)': data.iva,
      'Total Facturado ($)': data.total
    }));

    const ws2 = XLSX.utils.json_to_sheet(ws2Data);
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen_Por_Tercero");

    XLSX.writeFile(wb, `Informe_Contable_Omar_${new Date().toISOString().split('T')[0]}.xlsx`);
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
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Explorador de Informes (Modo World Office)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                Filtros Dinámicos
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generador de informes contables, libros auxiliares y analítica ejecutiva para Omar.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button 
            onClick={() => setCurrentPage(1)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
            title="Procesar y aplicar criterios del informe"
          >
            <Activity className="w-4 h-4" /> Procesar Informe
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

      {/* 2. EL GRAN FILTRO WORLD OFFICE (MATRIX DE CRITERIOS) */}
      {isFilterPanelOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          
          {/* Quick Period Presets Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Rango Rápido de Periodo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Todo el Histórico' },
                { id: 'THIS_MONTH', label: 'Este Mes' },
                { id: 'LAST_MONTH', label: 'Mes Anterior' },
                { id: '2026', label: 'Año 2026' },
                { id: '2025', label: 'Año 2025' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPeriodPreset(p.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodPreset === p.id 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Secciones Filtros Desde - Hasta */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            
            {/* SECCIÓN 1: FECHAS (DESDE - HASTA) */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-600" /> 1. Rango de Fechas</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha Desde:</label>
                  <input 
                    type="date" 
                    value={dateFrom} 
                    onChange={e => { setDateFrom(e.target.value); setPeriodPreset('CUSTOM'); setCurrentPage(1); }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha Hasta:</label>
                  <input 
                    type="date" 
                    value={dateTo} 
                    onChange={e => { setDateTo(e.target.value); setPeriodPreset('CUSTOM'); setCurrentPage(1); }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: CUENTAS CONTABLES (PUC) */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-emerald-600" /> 2. Cuentas PUC</span>
                <select 
                  value={pucClassFilter} 
                  onChange={e => { setPucClassFilter(e.target.value); setCurrentPage(1); }}
                  className="text-[10px] font-bold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                >
                  <option value="ALL">Todas las Clases</option>
                  <option value="4_INGRESOS">Clase 4 (Ingresos/Ventas)</option>
                  <option value="1_ACTIVOS">Clase 1 (Activos/Caja)</option>
                  <option value="2_PASIVOS">Clase 2 (Pasivos/Impuestos)</option>
                  <option value="5_GASTOS">Clase 5 (Gastos)</option>
                </select>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cuenta Inicial:</label>
                    <input 
                      type="text" 
                      placeholder="110505"
                      value={pucFrom} 
                      onChange={e => { setPucFrom(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cuenta Final:</label>
                    <input 
                      type="text" 
                      placeholder="413595"
                      value={pucTo} 
                      onChange={e => { setPucTo(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nivel de Cuenta:</label>
                  <select 
                    value={pucLevel}
                    onChange={e => setPucLevel(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                  >
                    <option value="AUXILIAR">Nivel 6 Dígitos (Auxiliar)</option>
                    <option value="SUBCUENTA">Nivel 4 Dígitos (Subcuenta)</option>
                    <option value="CUENTA">Nivel 2 Dígitos (Cuenta Mayor)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: TERCEROS (CLIENTE / NIT) */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-600" /> 3. Terceros (NIT)</span>
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
                      placeholder="Nombre, razón social o NIT..."
                      value={searchTerm} 
                      onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tercero Desde:</label>
                    <input 
                      type="text" 
                      placeholder="A..."
                      value={terceroFrom} 
                      onChange={e => { setTerceroFrom(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tercero Hasta:</label>
                    <input 
                      type="text" 
                      placeholder="Z..."
                      value={terceroTo} 
                      onChange={e => { setTerceroTo(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: DOCUMENTOS Y COMPROBANTES */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-purple-600" /> 4. Tipos de Comprobante</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-1.5">
                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={docTypeFVE} 
                      onChange={e => { setDocTypeFVE(e.target.checked); setCurrentPage(1); }} 
                      className="rounded text-indigo-600" 
                    />
                    <span className="font-bold text-[11px] text-slate-700">FVE (Ventas)</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={docTypeNC} 
                      onChange={e => { setDocTypeNC(e.target.checked); setCurrentPage(1); }} 
                      className="rounded text-rose-600" 
                    />
                    <span className="font-bold text-[11px] text-rose-700">NC (Devoluc.)</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={docTypeCE} 
                      onChange={e => { setDocTypeCE(e.target.checked); setCurrentPage(1); }} 
                      className="rounded text-amber-600" 
                    />
                    <span className="font-bold text-[11px] text-amber-700">CE (Egresos)</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-1.5 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={docTypeRC} 
                      onChange={e => { setDocTypeRC(e.target.checked); setCurrentPage(1); }} 
                      className="rounded text-emerald-600" 
                    />
                    <span className="font-bold text-[11px] text-emerald-700">RC (Recaudos)</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Doc. Desde:</label>
                    <input 
                      type="text" 
                      placeholder="FV-001"
                      value={docConsecutivoFrom}
                      onChange={e => { setDocConsecutivoFrom(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Doc. Hasta:</label>
                    <input 
                      type="text" 
                      placeholder="FV-999"
                      value={docConsecutivoTo}
                      onChange={e => { setDocConsecutivoTo(e.target.value); setCurrentPage(1); }}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Fila Inferior: Centros de Costos, Familias Químicas y Checks de Presentación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-slate-100">
            
            {/* 5. CENTROS DE COSTOS / SUCURSALES */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" /> Centro de Costos / Sucursal
              </label>
              <select 
                value={selectedCostCenter}
                onChange={e => { setSelectedCostCenter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="ALL">00 - Consolidado Todas las Sucursales</option>
                {uniqueCostCenters.map(cc => (
                  <option key={cc} value={cc}>{cc}</option>
                ))}
              </select>
            </div>

            {/* 6. FAMILIAS QUÍMICAS & KARDEX */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-purple-600" /> Familia / Línea de Producto
              </label>
              <select 
                value={selectedFamily}
                onChange={e => { setSelectedFamily(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="ALL">Todas las Familias Químicas</option>
                {uniqueFamilies.map(fam => (
                  <option key={fam} value={fam}>{fam}</option>
                ))}
              </select>
            </div>

            {/* 7. OPCIONES DE SALIDA (CHECKS CLÁSICOS DE WORLD OFFICE) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" /> Opciones de Presentación
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={groupByTercero} 
                    onChange={e => setGroupByTercero(e.target.checked)} 
                    className="rounded text-indigo-600" 
                  />
                  <span className="text-[11px] font-medium text-slate-600">Agrupar por Tercero</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showDocDetails} 
                    onChange={e => setShowDocDetails(e.target.checked)} 
                    className="rounded text-indigo-600" 
                  />
                  <span className="text-[11px] font-medium text-slate-600">Ver Consecutivos</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showChemicalVolume} 
                    onChange={e => setShowChemicalVolume(e.target.checked)} 
                    className="rounded text-indigo-600" 
                  />
                  <span className="text-[11px] font-medium text-slate-600">Calcular Litros / Kilos</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hideZeroBalances} 
                    onChange={e => { setHideZeroBalances(e.target.checked); setCurrentPage(1); }} 
                    className="rounded text-indigo-600" 
                  />
                  <span className="text-[11px] font-medium text-slate-600">Ocultar en Cero</span>
                </label>
              </div>
            </div>

          </div>

          {/* Barra de Estado de Filtros Activos (Breadcrumbs) */}
          <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2 font-medium text-indigo-900">
              <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Criterios Activos:
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">
                Periodo: {dateFrom || 'Inicio'} a {dateTo || 'Fin'}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">
                PUC: {pucFrom} a {pucTo}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">
                Docs: {[docTypeFVE && 'FVE', docTypeNC && 'NC', docTypeCE && 'CE', docTypeRC && 'RC'].filter(Boolean).join(', ') || 'Ninguno'}
              </span>
              {selectedCostCenter !== 'ALL' && (
                <span className="bg-white px-2 py-0.5 rounded border border-indigo-200">
                  Sede: {selectedCostCenter}
                </span>
              )}
            </div>

            <div className="font-bold text-indigo-900 bg-white px-3 py-1 rounded-lg border border-indigo-200">
              Registros Encontrados: <span className="text-indigo-600">{filteredData.length.toLocaleString()}</span>
            </div>
          </div>

        </div>
      )}

      {/* 3. KPIS EJECUTIVOS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venta Neta</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatCOP(kpis.totalNet)}</div>
          <span className="text-[11px] text-slate-500 font-medium">Bruta: {formatCOP(kpis.totalGross)}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IVA Recaudado</span>
          <div className="text-xl font-black text-slate-900 mt-1">{formatCOP(kpis.totalIva)}</div>
          <span className="text-[11px] text-slate-400 font-medium">Cuenta 240801</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comprobantes</span>
          <div className="text-xl font-black text-blue-600 mt-1">{kpis.docCount.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-medium">Ticket: {formatCOP(kpis.avgTicket)}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Notas Crédito (Dev.)</span>
          <div className="text-xl font-black text-rose-600 mt-1">{formatCOP(kpis.returnsTotal)}</div>
          <span className="text-[11px] text-rose-400 font-semibold">Tasa: {kpis.returnsImpact.toFixed(1)}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Volumen Químico</span>
          <div className="text-xl font-black text-purple-700 mt-1">
            {Math.round(physicalKpis.totalLiters).toLocaleString()} <span className="text-xs font-normal">LT</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {Math.round(physicalKpis.totalKilos).toLocaleString()} KG Estimados
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Cliente Top #1</span>
          <div className="text-sm font-bold text-slate-800 truncate mt-1" title={kpis.topClientName}>
            {kpis.topClientName}
          </div>
          <span className="text-xs font-black text-amber-600">{formatCOP(kpis.topClientAmount)}</span>
        </div>

      </div>

      {/* 4. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Time Series */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Evolución de Ventas Netas (Consolidado Mensual)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip formatter={(value: number) => formatCOP(value)} labelStyle={{ fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="ventas" name="Venta Neta" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Clients Bar Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900">Top 10 Clientes por Venta Neta</h2>
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
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 5. TABLA DE RESULTADOS (LIBRO AUXILIAR CON TOTALES FIJOS) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Header & Size selector */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Detalle Transaccional y Comprobantes Contables
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
                <th className="py-3 px-4">Tercero / Cliente</th>
                <th className="py-3 px-4">Cuenta PUC</th>
                <th className="py-3 px-4">Referencia SKU</th>
                <th className="py-3 px-4">Producto / Detalle</th>
                <th className="py-3 px-4 text-center">Cant.</th>
                <th className="py-3 px-4">Sucursal</th>
                <th className="py-3 px-4 text-right">IVA</th>
                <th className="py-3 px-4 text-right">Total Neto</th>
                <th className="py-3 px-4 text-right">Total Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-medium">
                    No hay transacciones que coincidan con los criterios seleccionados en el filtro.
                  </td>
                </tr>
              ) : (
                paginatedData.map((tx, idx) => {
                  const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
                  const netAmount = Math.abs(tx.total) - (tx.iva || 0);
                  const puc = tx.type === 'VENTA' ? '413505' : (isReturn ? '417505' : (tx.type === 'COMPRA' ? '143505' : '110505'));

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
                      <td className="py-2.5 px-4 font-bold text-slate-800 max-w-[220px] truncate" title={tx.client}>
                        {tx.client || 'Consumidor Final'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 font-bold">
                        {puc}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600 text-xs">
                        {tx.sku && tx.sku !== '-' ? tx.sku : 'DIVERSO'}
                      </td>
                      <td className="py-2.5 px-4 max-w-[200px] truncate text-slate-700" title={tx.productName}>
                        {tx.productName || 'Varios'}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                        {tx.qty || 1}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-500">
                        {tx.posLocation || 'Principal'}
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
                  <td colSpan={6} className="py-3 px-4 text-right uppercase tracking-wider text-slate-600 font-bold">
                    Totales Consolidados del Informe ({filteredData.length} transacciones):
                  </td>
                  <td className="py-3 px-4 text-center">
                    {filteredData.reduce((sum, tx) => sum + (tx.qty || 1), 0).toLocaleString()}
                  </td>
                  <td></td>
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

    </div>
  );
};
