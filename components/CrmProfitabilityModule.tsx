import React, { useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, TrendingUp, AlertOctagon, PhoneCall, Calendar, Target, DollarSign, Activity, CheckCircle2, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { CrmContact } from '../types';

interface CrmProfitabilityModuleProps {
  contacts: CrmContact[];
  onContactClick?: (id: string) => void;
}

interface RankedContact extends CrmContact {
  trendPercent: number;
  trendValue: number;
  comparisonBase: number;
}

const getSortedData = (data: RankedContact[], config: { key: string, direction: 'asc' | 'desc' } | null) => {
  if (!config) return data;
  return [...data].sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';
    switch (config.key) {
      case 'company': aVal = a.company; bVal = b.company; break;
      case 'annual': aVal = a.purchaseHistory?.annual || 0; bVal = b.purchaseHistory?.annual || 0; break;
      case 'base': aVal = a.comparisonBase; bVal = b.comparisonBase; break;
      case 'trendValue': aVal = Math.abs(a.trendValue); bVal = Math.abs(b.trendValue); break;
      case 'trendPercent': aVal = a.trendPercent; bVal = b.trendPercent; break;
      case 'margin': aVal = a.purchaseHistory?.profitabilityMargin || 0; bVal = b.purchaseHistory?.profitabilityMargin || 0; break;
      case 'status': aVal = a.postSaleStage || a.status; bVal = b.postSaleStage || b.status; break;
    }
    if (aVal < bVal) return config.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return config.direction === 'asc' ? 1 : -1;
    return 0;
  });
};

const SortableHeader = ({ label, sortKey, currentSort, onSort, alignRight = false }: any) => (
  <th 
    className={`px-6 py-3 cursor-pointer hover:bg-slate-200 transition-colors group select-none ${alignRight ? 'text-right' : ''}`}
    onClick={() => onSort(sortKey)}
  >
    <div className={`flex items-center gap-1 ${alignRight ? 'justify-end' : ''}`}>
      {label}
      <ArrowUpDown className={`w-3.5 h-3.5 ${currentSort?.key === sortKey ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
    </div>
  </th>
);

export const CrmProfitabilityModule: React.FC<CrmProfitabilityModuleProps> = ({ contacts, onContactClick }) => {
  const [sortDecreasing, setSortDecreasing] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [sortGrowing, setSortGrowing] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [sortMatrix, setSortMatrix] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (table: 'decreasing' | 'growing' | 'matrix', key: string) => {
    const setSort = table === 'decreasing' ? setSortDecreasing : table === 'growing' ? setSortGrowing : setSortMatrix;
    const currentSort = table === 'decreasing' ? sortDecreasing : table === 'growing' ? sortGrowing : sortMatrix;
    
    if (currentSort?.key === key) {
      if (currentSort.direction === 'asc') setSort({ key, direction: 'desc' });
      else setSort(null);
    } else {
      setSort({ key, direction: 'asc' });
    }
  };

  const [isDecreasingExpanded, setIsDecreasingExpanded] = useState(false);
  const [isGrowingExpanded, setIsGrowingExpanded] = useState(false);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState(false);

  const decreasingRef = useRef<HTMLElement>(null);
  const growingRef = useRef<HTMLElement>(null);
  const matrixRef = useRef<HTMLElement>(null);

  // 1. Process contacts with purchase history
  const processedContacts: RankedContact[] = useMemo(() => {
    return contacts
      .filter(c => c.purchaseHistory)
      .map(c => {
        const history = c.purchaseHistory!;
        const base = history.historicalAverage || history.previousYear || 1; // Prevent division by zero
        const trendValue = history.annual - base;
        const trendPercent = (trendValue / base) * 100;

        return {
          ...c,
          trendPercent,
          trendValue,
          comparisonBase: base
        };
      });
  }, [contacts]);

  // 2. Ranking: Top 20 that are decreasing in purchases (Req 18)
  const topDecreasing = useMemo(() => {
    const data = processedContacts
      .filter(c => c.trendPercent < 0)
      .sort((a, b) => a.trendPercent - b.trendPercent) // Most negative first
      .slice(0, 20);
    return getSortedData(data, sortDecreasing);
  }, [processedContacts, sortDecreasing]);

  // 3. Ranking: Top 20 that are increasing in purchases (Req 19)
  const topGrowing = useMemo(() => {
    const data = processedContacts
      .filter(c => c.trendPercent > 0)
      .sort((a, b) => b.trendPercent - a.trendPercent) // Most positive first
      .slice(0, 20);
    return getSortedData(data, sortGrowing);
  }, [processedContacts, sortGrowing]);

  const sortedMatrix = useMemo(() => {
    const data = processedContacts.sort((a, b) => b.purchaseHistory!.annual - a.purchaseHistory!.annual);
    return getSortedData(data, sortMatrix);
  }, [processedContacts, sortMatrix]);

  const totalAtRisk = topDecreasing.reduce((sum, c) => sum + Math.abs(c.trendValue), 0);
  const totalGrowth = topGrowing.reduce((sum, c) => sum + Math.abs(c.trendValue), 0);

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => {
            setIsDecreasingExpanded(true);
            setTimeout(() => decreasingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
          }}
          className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Clientes en Riesgo</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-rose-600">{topDecreasing.length}</h3>
                <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                  -${(totalAtRisk / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-rose-700 bg-rose-50 px-3 py-1.5 rounded-md font-medium border border-rose-100">
            Requieren gestión preventiva inmediata
          </p>
        </div>

        <div 
          onClick={() => {
            setIsGrowingExpanded(true);
            setTimeout(() => growingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
          }}
          className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Crecimiento Proyectado</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-emerald-600">{topGrowing.length}</h3>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  +${(totalGrowth / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md font-medium border border-emerald-100">
            Aumento en Top 20 Clientes Crecimiento
          </p>
        </div>

        <div 
          onClick={() => {
            setIsMatrixExpanded(true);
            setTimeout(() => matrixRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
          }}
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Margen de rentabilidad de Clientes</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">
                {processedContacts.length > 0 
                  ? (processedContacts.reduce((sum, c) => sum + (c.purchaseHistory?.profitabilityMargin || 0), 0) / processedContacts.length).toFixed(1)
                  : '0'}%
              </h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md font-medium border border-slate-100">
            Rentabilidad global de cartera
          </p>
        </div>
      </div>

      {/* TOP 20 Decreasing Ranking (Req 18) */}
      <section ref={decreasingRef} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden scroll-mt-6">
        <div 
          className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
          onClick={() => setIsDecreasingExpanded(!isDecreasingExpanded)}
        >
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Ranking Dinámico: Disminución de Compras (Top 20)
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
              Foco Preventivo
            </span>
            {isDecreasingExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>
        
        <AnimatePresence>
          {isDecreasingExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
        {topDecreasing.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
            <p className="font-medium text-lg">¡Excelente! No hay clientes en riesgo de abandono.</p>
            <p className="text-sm mt-1">Todos los clientes tienen tendencia de compra positiva.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <th className="px-6 py-3">Rank</th>
                  <SortableHeader label="Cliente" sortKey="company" currentSort={sortDecreasing} onSort={(k: string) => handleSort('decreasing', k)} />
                  <SortableHeader label="Facturación Actual" sortKey="annual" currentSort={sortDecreasing} onSort={(k: string) => handleSort('decreasing', k)} />
                  <SortableHeader label="Base Histórica" sortKey="base" currentSort={sortDecreasing} onSort={(k: string) => handleSort('decreasing', k)} />
                  <SortableHeader label="Caída (Valor)" sortKey="trendValue" currentSort={sortDecreasing} onSort={(k: string) => handleSort('decreasing', k)} />
                  <SortableHeader label="Tendencia" sortKey="trendPercent" currentSort={sortDecreasing} onSort={(k: string) => handleSort('decreasing', k)} />
                  <th className="px-6 py-3 text-right">Acción Recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topDecreasing.map((contact, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={contact.id} 
                    className="hover:bg-rose-50/30 transition-colors cursor-pointer"
                    onClick={() => onContactClick?.(contact.id)}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{contact.company}</div>
                      <div className="text-xs text-slate-500">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${(contact.purchaseHistory!.annual / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500">
                      ${(contact.comparisonBase / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-600">
                      -${(Math.abs(contact.trendValue) / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-bold">
                        <TrendingDown className="w-3 h-3" />
                        {contact.trendPercent.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                        <PhoneCall className="w-3.5 h-3.5" />
                        Llamar Ahora
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* TOP 20 Growing Ranking (Req 19) */}
      <section ref={growingRef} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden scroll-mt-6">
        <div 
          className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
          onClick={() => setIsGrowingExpanded(!isGrowingExpanded)}
        >
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Ranking Dinámico: Crecimiento de Compras (Top 20)
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
              Fidelización
            </span>
            {isGrowingExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>
        </div>
        
        <AnimatePresence>
          {isGrowingExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
        {topGrowing.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="font-medium text-lg">No hay clientes con crecimiento destacado actual.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                  <th className="px-6 py-3">Rank</th>
                  <SortableHeader label="Cliente" sortKey="company" currentSort={sortGrowing} onSort={(k: string) => handleSort('growing', k)} />
                  <SortableHeader label="Facturación Actual" sortKey="annual" currentSort={sortGrowing} onSort={(k: string) => handleSort('growing', k)} />
                  <SortableHeader label="Base Histórica" sortKey="base" currentSort={sortGrowing} onSort={(k: string) => handleSort('growing', k)} />
                  <SortableHeader label="Crecimiento (Valor)" sortKey="trendValue" currentSort={sortGrowing} onSort={(k: string) => handleSort('growing', k)} />
                  <SortableHeader label="Tendencia" sortKey="trendPercent" currentSort={sortGrowing} onSort={(k: string) => handleSort('growing', k)} />
                  <th className="px-6 py-3 text-right">Acción Recomendada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topGrowing.map((contact, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={contact.id} 
                    className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                    onClick={() => onContactClick?.(contact.id)}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{contact.company}</div>
                      <div className="text-xs text-slate-500">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${(contact.purchaseHistory!.annual / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500">
                      ${(contact.comparisonBase / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      +${(Math.abs(contact.trendValue) / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        +{contact.trendPercent.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                        Visita Estratégica
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* General Profitability Table (Req 17) */}
      <section ref={matrixRef} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden scroll-mt-6">
        <div 
          className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
          onClick={() => setIsMatrixExpanded(!isMatrixExpanded)}
        >
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Matriz de Rentabilidad y Movimientos
          </h2>
          {isMatrixExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
        
        <AnimatePresence>
          {isMatrixExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <SortableHeader label="Cliente" sortKey="company" currentSort={sortMatrix} onSort={(k: string) => handleSort('matrix', k)} />
                <SortableHeader label="Facturación Anual" sortKey="annual" currentSort={sortMatrix} onSort={(k: string) => handleSort('matrix', k)} />
                <SortableHeader label="Margen Rentabilidad" sortKey="margin" currentSort={sortMatrix} onSort={(k: string) => handleSort('matrix', k)} />
                <SortableHeader label="Tendencia vs Histórico" sortKey="trendPercent" currentSort={sortMatrix} onSort={(k: string) => handleSort('matrix', k)} />
                <SortableHeader label="Estado Comercial" sortKey="status" currentSort={sortMatrix} onSort={(k: string) => handleSort('matrix', k)} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMatrix.map(contact => (
                <tr key={contact.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onContactClick?.(contact.id)}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{contact.company}</div>
                    <div className="text-xs text-slate-500">ID: {contact.id}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    ${(contact.purchaseHistory!.annual / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            (contact.purchaseHistory?.profitabilityMargin || 0) > 20 ? 'bg-emerald-500' : 
                            (contact.purchaseHistory?.profitabilityMargin || 0) > 10 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, (contact.purchaseHistory?.profitabilityMargin || 0) * 2))}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700">
                        {contact.purchaseHistory?.profitabilityMargin?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {contact.trendPercent >= 0 ? (
                      <div className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm">
                        <TrendingUp className="w-4 h-4" />
                        +{contact.trendPercent.toFixed(1)}%
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-rose-600 font-bold text-sm">
                        <TrendingDown className="w-4 h-4" />
                        {contact.trendPercent.toFixed(1)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        contact.postSaleStage === 'FIDELIZACION' ? 'bg-emerald-100 text-emerald-700' : 
                        contact.postSaleStage === 'RENTABILIZACION' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                     }`}>
                       {contact.postSaleStage || contact.status}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </div>
  );
};
