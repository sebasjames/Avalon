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
  Factory
} from 'lucide-react';
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
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [txType, setTxType] = useState('ALL'); // ALL, VENTAS, DEVOLUCIONES
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter Data
  const filteredData = useMemo(() => {
    return ACCOUNTING_TRANSACTIONS.filter(tx => {
      // Solo ventas y notas (devoluciones)
      if (tx.type !== 'VENTA' && tx.type !== 'NOTA_CREDITO') return false;

      // Filter by Search (Client or Doc)
      const matchesSearch = 
        (tx.client && tx.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.document && tx.document.toLowerCase().includes(searchTerm.toLowerCase()));
      if (searchTerm && !matchesSearch) return false;

      // Filter by Date
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;

      // Filter by Type
      if (txType === 'VENTAS' && tx.total < 0) return false; // assuming returns are negative or NOTA_CREDITO
      if (txType === 'VENTAS' && tx.type === 'NOTA_CREDITO') return false;
      
      if (txType === 'DEVOLUCIONES' && tx.total >= 0 && tx.type !== 'NOTA_CREDITO') return false;

      return true;
    });
  }, [searchTerm, dateFrom, dateTo, txType]);

  // 2. Compute KPIs
  const kpis = useMemo(() => {
    let totalNet = 0;
    let totalGross = 0;
    let returnsTotal = 0;
    const uniqueDocs = new Set<string>();
    
    // Para Top Cliente
    const clientSales: Record<string, number> = {};

    filteredData.forEach(tx => {
      uniqueDocs.add(tx.document);
      
      const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
      const amount = Math.abs(tx.total);
      const netAmount = amount - (tx.iva || 0);

      if (isReturn) {
        returnsTotal += amount;
      } else {
        totalGross += amount;
        totalNet += netAmount;
        
        clientSales[tx.client] = (clientSales[tx.client] || 0) + netAmount;
      }
    });

    // Find Top Client
    let topClientName = 'N/A';
    let topClientAmount = 0;
    Object.entries(clientSales).forEach(([client, amount]) => {
      if (amount > topClientAmount) {
        topClientAmount = amount;
        topClientName = client;
      }
    });

    const docCount = uniqueDocs.size;
    const avgTicket = docCount > 0 ? (totalGross / docCount) : 0;
    const returnsImpact = totalGross > 0 ? (returnsTotal / totalGross) * 100 : 0;

    return {
      totalNet,
      totalGross,
      docCount,
      avgTicket,
      returnsTotal,
      returnsImpact,
      topClientName,
      topClientAmount
    };
  }, [filteredData]);

  // 3. Compute Time Series (Monthly)
  const timeSeriesData = useMemo(() => {
    const monthlyMap: Record<string, { month: string, ventas: number, ticket: number, docs: Set<string>, totalGross: number }> = {};

    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return; // Only positive sales for this chart

      const dateObj = new Date(tx.date);
      if (isNaN(dateObj.getTime())) return;

      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, ventas: 0, ticket: 0, docs: new Set(), totalGross: 0 };
      }

      const netAmount = tx.total - (tx.iva || 0);
      monthlyMap[monthKey].ventas += netAmount;
      monthlyMap[monthKey].totalGross += tx.total;
      monthlyMap[monthKey].docs.add(tx.document);
    });

    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)).map(item => ({
      month: item.month,
      ventas: item.ventas,
      ticket: item.docs.size > 0 ? (item.totalGross / item.docs.size) : 0
    }));
  }, [filteredData]);

  // 4. Compute Top 10 Clients Data
  const topClientsData = useMemo(() => {
    const clientSales: Record<string, number> = {};

    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;
      const netAmount = tx.total - (tx.iva || 0);
      clientSales[tx.client] = (clientSales[tx.client] || 0) + netAmount;
    });

    return Object.entries(clientSales)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 for better visualization
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // 5. Volumetric Analytics
  const { physicalKpis, mixQuimico, topVolumen } = useMemo(() => {
    let totalLiters = 0;
    let totalKilos = 0;
    
    // Para Mix Químico
    const familyVolume: Record<string, number> = {};
    const clientVolume: Record<string, number> = {};

    filteredData.forEach(tx => {
      if (tx.type === 'NOTA_CREDITO' || tx.total < 0) return;

      const product = INVENTORY_DATA.find(p => 
        p.sku === tx.sku || p.originalSku === tx.sku || p.name === tx.productName
      );

      let itemLiters = 0;
      let itemKilos = 0;

      if (product) {
          const qty = tx.qty || 1;
          const density = typeof product.density === 'number' ? product.density : parseFloat(product.density as string) || 1;
          
          if (product.netVolumeLiters) itemLiters = product.netVolumeLiters * qty;
          else if (product.baseUnit === 'GL') itemLiters = qty * 3.785;
          else if (product.baseUnit === 'LT') itemLiters = qty;
          else if (product.baseUnit === 'KG') itemLiters = qty / density;

          if (product.netWeightKg) itemKilos = product.netWeightKg * qty;
          else if (product.baseUnit === 'KG') itemKilos = qty;
          else if (product.baseUnit === 'GL') itemKilos = (qty * 3.785) * density;
          else if (product.baseUnit === 'LT') itemKilos = qty * density;
      }

      totalLiters += itemLiters;
      totalKilos += itemKilos;

      if (itemLiters > 0) {
        const family = product?.family || 'OTROS';
        familyVolume[family] = (familyVolume[family] || 0) + itemLiters;
        clientVolume[tx.client] = (clientVolume[tx.client] || 0) + itemLiters;
      }
    });

    const mixData = Object.entries(familyVolume)
        .map(([name, litros]) => ({ name, litros }))
        .sort((a, b) => b.litros - a.litros);

    const topVolData = Object.entries(clientVolume)
        .map(([name, litros]) => ({ name, litros, galones: litros / 3.785 }))
        .sort((a, b) => b.litros - a.litros)
        .slice(0, 5);

    return {
      physicalKpis: {
        liters: totalLiters,
        kilos: totalKilos,
        gallons: totalLiters / 3.785,
        profitPerKilo: totalKilos > 0 ? (kpis.totalNet / totalKilos) : 0
      },
      mixQuimico: mixData,
      topVolumen: topVolData
    };
  }, [filteredData, kpis.totalNet]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
            <BarChart4 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dashboard Ejecutivo de Ventas</h1>
            <p className="text-xs text-slate-400">Analítica Avanzada y Control Transaccional</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Exportar a Excel
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por Cliente o Documento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Ventas y Devoluciones</option>
              <option value="VENTAS">Solo Ventas</option>
              <option value="DEVOLUCIONES">Solo Devoluciones</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPIs Grid (Glassmorphism inspired) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Venta Neta Total</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{formatCOP(kpis.totalNet)}</div>
            <div className="text-xs text-slate-400 mt-1">Bruta: {formatCOP(kpis.totalGross)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Documentos</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{kpis.docCount.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Facturas procesadas</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{formatCOP(kpis.avgTicket)}</div>
            <div className="text-xs text-slate-400 mt-1">Venta bruta por doc</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-rose-500 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Devoluciones</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{formatCOP(kpis.returnsTotal)}</div>
            <div className="text-xs font-semibold text-rose-400 mt-1">Impacto: {kpis.returnsImpact.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Cliente Top #1</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 truncate" title={kpis.topClientName}>{kpis.topClientName}</div>
            <div className="text-base font-black text-blue-600 mt-1">{formatCOP(kpis.topClientAmount)}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Time Series */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Evolución de Ventas Netas (Mensual)</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tickFormatter={(val) => `$${(val/1000000).toFixed(1)}M`} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <RechartsTooltip 
                  formatter={(value: number) => formatCOP(value)}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  name="Venta Neta" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients Bar Chart */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">Top 10 Clientes por Venta Neta</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topClientsData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  tickFormatter={(val) => `$${(val/1000000).toFixed(0)}M`}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fill: '#475569', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  formatter={(value: number) => formatCOP(value)}
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" name="Venta Neta" radius={[0, 4, 4, 0]}>
                  {topClientsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">Detalle Transaccional</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filas por página:</span>
            <select 
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-xs border border-slate-200 rounded px-2 py-1"
            >
              <option value="15">15</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Producto/Servicio</th>
                <th className="py-3 px-4 text-center">Cant.</th>
                <th className="py-3 px-4 text-right">IVA</th>
                <th className="py-3 px-4 text-right">Total Neto</th>
                <th className="py-3 px-4 text-right">Total Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">No hay transacciones que coincidan con los filtros</td>
                </tr>
              ) : (
                paginatedData.map(tx => {
                  const isReturn = tx.type === 'NOTA_CREDITO' || tx.total < 0;
                  const netAmount = Math.abs(tx.total) - (tx.iva || 0);
                  
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 whitespace-nowrap">{tx.date}</td>
                      <td className="py-2.5 px-4 font-mono font-medium text-blue-600">
                        {tx.document} {isReturn && <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-700 font-bold">DEV</span>}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800 max-w-[200px] truncate" title={tx.client}>{tx.client}</td>
                      <td className="py-2.5 px-4 max-w-[200px] truncate" title={tx.productName}>{tx.productName}</td>
                      <td className="py-2.5 px-4 text-center">{tx.qty}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400">{formatCOP(tx.iva || 0)}</td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-700">{formatCOP(isReturn ? -netAmount : netAmount)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">{formatCOP(tx.total)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <div>
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} - {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length} registros
          </div>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 font-medium"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-100">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-50 font-medium"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Volumetric Analytics Module */}
      <div className="mt-8 space-y-6 border-t border-slate-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-500/20 text-purple-600 rounded-xl">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Analítica de Volumetría y Desplazamiento Químico</h2>
            <p className="text-xs text-slate-500">Indicadores de Producción y Rendimiento Físico</p>
          </div>
        </div>

        {/* Volumetric KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl shadow-sm border border-indigo-100 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Galonaje Equivalente</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Beaker className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-800">{physicalKpis.gallons.toLocaleString('es-CO', {maximumFractionDigits: 1})} <span className="text-lg text-slate-500 font-medium">Gal.</span></div>
              <div className="text-xs text-slate-500 mt-1">Total: {physicalKpis.liters.toLocaleString('es-CO', {maximumFractionDigits: 1})} Litros</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-white p-5 rounded-2xl shadow-sm border border-orange-100 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Tonelaje Movido</span>
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                <Factory className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-800">{(physicalKpis.kilos / 1000).toLocaleString('es-CO', {maximumFractionDigits: 2})} <span className="text-lg text-slate-500 font-medium">Ton.</span></div>
              <div className="text-xs text-slate-500 mt-1">Total: {physicalKpis.kilos.toLocaleString('es-CO', {maximumFractionDigits: 1})} Kilos</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Rentabilidad por Kilo</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-800">{formatCOP(physicalKpis.profitPerKilo)}</div>
              <div className="text-xs text-slate-500 mt-1">Utilidad Operativa Mínima</div>
            </div>
          </div>
        </div>

        {/* Charts: Mix and Top Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-6">
              <TestTube className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800">Mix Químico de Venta (Litros)</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mixQuimico} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `${val.toLocaleString()} L`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="litros" name="Litros Vendidos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-2 mb-6">
              <Factory className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-800">Devoradores de Volumen (Top Clientes en Galones)</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVolumen} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(val) => `${val} Gal.`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="galones" name="Galones Movidos" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
