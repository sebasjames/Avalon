import React, { useState } from 'react';
import { INVENTORY_DATA } from '../constants';
import { InventoryStatus, ABCClass, XYZClass, Category } from '../types';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle, X, Columns } from 'lucide-react';
import { formatCOP } from '../utils/format';

const StatusBadge = ({ status }: { status: InventoryStatus }) => {
  switch (status) {
    case InventoryStatus.ACTIVE:
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Activo</span>;
    case InventoryStatus.SLOW:
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Lento</span>;
    case InventoryStatus.SILENT:
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Silencioso</span>;
    default:
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Desconocido</span>;
  }
};

const MatrixBadge = ({ abc, xyz }: { abc: ABCClass, xyz: XYZClass }) => {
    let colorClass = "bg-slate-100 text-slate-600";
    if (abc === ABCClass.A && xyz === XYZClass.X) colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
    if (abc === ABCClass.C && xyz === XYZClass.Z) colorClass = "bg-gray-100 text-gray-500 border border-gray-200";
    if (abc === ABCClass.A && xyz === XYZClass.Z) colorClass = "bg-orange-100 text-orange-700 border border-orange-200";

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono uppercase tracking-wider ${colorClass}`}>
            {abc}{xyz}
        </span>
    );
}

const ALL_COLUMNS = [
    'SKU / Producto', 
    'Categoría', 
    'Estatus', 
    'ABC/XYZ', 
    'Stock Total', 
    'ATP (Libre)', 
    'Minimo Stock', 
    'Aging (Días)', 
    'Valor Total (Costo)',
    'Densidad',
    'Punto de Inflamación',
    'Número ONU',
    'Apariencia',
    'Peligros',
    'Componentes'
];

export const InventoryTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS);
  
  const filteredData = INVENTORY_DATA.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeFiltersCount = (categoryFilter !== 'Todos' ? 1 : 0) + (statusFilter !== 'Todos' ? 1 : 0);

  const resetFilters = () => {
    setCategoryFilter('Todos');
    setStatusFilter('Todos');
    setIsFilterOpen(false);
  };

  const toggleColumn = (col: string) => {
      if (visibleColumns.includes(col)) {
          setVisibleColumns(prev => prev.filter(c => c !== col));
      } else {
          // Mantener el orden original
          setVisibleColumns(prev => {
              const next = [...prev, col];
              return ALL_COLUMNS.filter(c => next.includes(c));
          });
      }
  };

  const showCol = (col: string) => visibleColumns.includes(col);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventario Maestro</h2>
          <p className="text-sm text-slate-500">Niveles de stock, ATP y clasificación en tiempo real.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto relative">
            <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="Buscar SKU o Nombre..." 
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <div className="relative">
                <button 
                    onClick={() => {
                        setIsColumnMenuOpen(!isColumnMenuOpen);
                        if (isFilterOpen) setIsFilterOpen(false);
                    }}
                    className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        isColumnMenuOpen
                        ? 'bg-slate-100 border-slate-300 text-slate-800' 
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <Columns className="w-4 h-4 mr-2" />
                    Columnas
                </button>

                {isColumnMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-4">
                        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                            <h3 className="font-semibold text-sm text-slate-900">Ver Columnas</h3>
                            <button onClick={() => setIsColumnMenuOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {ALL_COLUMNS.map(col => (
                                <label key={col} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded">
                                    <input 
                                        type="checkbox" 
                                        checked={visibleColumns.includes(col)}
                                        onChange={() => toggleColumn(col)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    {col}
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <button 
                    onClick={() => {
                        setIsFilterOpen(!isFilterOpen);
                        if (isColumnMenuOpen) setIsColumnMenuOpen(false);
                    }}
                    className={`flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        isFilterOpen || activeFiltersCount > 0
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                    {activeFiltersCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {isFilterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-4">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                            <h3 className="font-semibold text-sm text-slate-900">Opciones de Filtro</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Categoría</label>
                                <select 
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 p-2.5 outline-none"
                                >
                                    <option value="Todos">Todas las Categorías</option>
                                    {Object.values(Category).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Estatus</label>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 p-2.5 outline-none"
                                >
                                    <option value="Todos">Todos los Estatus</option>
                                    {Object.values(InventoryStatus).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={resetFilters}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Limpiar
                                </button>
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200 whitespace-nowrap">
              <tr>
                {showCol('SKU / Producto') && <th className="px-6 py-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-100">SKU / Producto</th>}
                {showCol('Categoría') && <th className="px-6 py-4">Categoría</th>}
                {showCol('Estatus') && <th className="px-6 py-4">Estatus</th>}
                {showCol('ABC/XYZ') && <th className="px-6 py-4">ABC/XYZ</th>}
                {showCol('Stock Total') && <th className="px-6 py-4 text-right">Stock Total</th>}
                {showCol('ATP (Libre)') && <th className="px-6 py-4 text-right">ATP (Libre)</th>}
                {showCol('Minimo Stock') && <th className="px-6 py-4 text-right">Minimo Stock</th>}
                {showCol('Aging (Días)') && <th className="px-6 py-4 text-right">Aging (Días)</th>}
                {showCol('Valor Total (Costo)') && <th className="px-6 py-4 text-right">Valor Total (Costo)</th>}
                
                {showCol('Densidad') && <th className="px-6 py-4 text-slate-400">Densidad</th>}
                {showCol('Punto de Inflamación') && <th className="px-6 py-4 text-slate-400">Punto de Inflamación</th>}
                {showCol('Número ONU') && <th className="px-6 py-4 text-slate-400">Número ONU</th>}
                {showCol('Apariencia') && <th className="px-6 py-4 text-slate-400">Apariencia</th>}
                {showCol('Peligros') && <th className="px-6 py-4 text-slate-400">Peligros</th>}
                {showCol('Componentes') && <th className="px-6 py-4 text-slate-400">Componentes</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item: any) => {
                 const atp = item.totalStock - item.reservedStock;
                 const value = (item.category.includes('Materia Prima') ? item.unitCost : item.price) * item.totalStock;
                 
                 // Resumen de peligros y componentes
                 const hazardsCount = item.hazards ? item.hazards.length : 0;
                 const compCount = item.chemicalComponents ? item.chemicalComponents.length : 0;

                 return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap group">
                  {showCol('SKU / Producto') && (
                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 transition-colors">
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{item.name}</span>
                            <span className="text-xs text-slate-400 font-mono">{item.sku}</span>
                        </div>
                    </td>
                  )}
                  {showCol('Categoría') && (
                    <td className="px-6 py-4">
                        <span className="text-slate-600">{item.category}</span>
                    </td>
                  )}
                  {showCol('Estatus') && (
                    <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                    </td>
                  )}
                  {showCol('ABC/XYZ') && (
                    <td className="px-6 py-4">
                        <MatrixBadge abc={item.abc} xyz={item.xyz} />
                    </td>
                  )}
                  {showCol('Stock Total') && (
                    <td className="px-6 py-4 text-right font-medium">
                        {item.category === Category.SERVICE ? '∞' : item.totalStock.toLocaleString('es-CO')}
                    </td>
                  )}
                  {showCol('ATP (Libre)') && (
                    <td className={`px-6 py-4 text-right font-bold ${atp < 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {item.category === Category.SERVICE ? '∞' : atp.toLocaleString('es-CO')}
                    </td>
                  )}
                  {showCol('Minimo Stock') && (
                    <td className={`px-6 py-4 text-right font-bold text-slate-500`}>
                        {item.category === Category.SERVICE ? '-' : (item.minStock || 0).toLocaleString('es-CO')}
                    </td>
                  )}
                  {showCol('Aging (Días)') && (
                    <td className="px-6 py-4 text-right">
                        <span className={`${item.agingDays > 90 ? 'text-rose-600 font-bold' : ''}`}>{item.agingDays}</span>
                    </td>
                  )}
                  {showCol('Valor Total (Costo)') && (
                    <td className="px-6 py-4 text-right">
                        {item.category === Category.SERVICE ? formatCOP(0) : formatCOP(value)}
                    </td>
                  )}

                  {/* Nuevas Columnas Técnicas */}
                  {showCol('Densidad') && (
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {item.density || '-'}
                    </td>
                  )}
                  {showCol('Punto de Inflamación') && (
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {item.flashPoint || '-'}
                    </td>
                  )}
                  {showCol('Número ONU') && (
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {item.unNumber ? `UN ${item.unNumber}` : '-'}
                    </td>
                  )}
                  {showCol('Apariencia') && (
                    <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[150px]" title={item.appearance}>
                        {item.appearance || '-'}
                    </td>
                  )}
                  {showCol('Peligros') && (
                    <td className="px-6 py-4">
                        {hazardsCount > 0 ? (
                            <div className="relative group/tooltip inline-block">
                                <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] font-bold border border-rose-200 cursor-help">
                                    {hazardsCount} Peligro{hazardsCount !== 1 && 's'}
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-xl z-50">
                                    <ul className="list-disc pl-4 space-y-1">
                                        {item.hazards.map((h: string, i: number) => (
                                            <li key={i}>{h}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : <span className="text-slate-300">-</span>}
                    </td>
                  )}
                  {showCol('Componentes') && (
                    <td className="px-6 py-4">
                        {compCount > 0 ? (
                            <div className="relative group/tooltip inline-block">
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold border border-indigo-200 cursor-help">
                                    {compCount} Componente{compCount !== 1 && 's'}
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/tooltip:block w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-xl z-50">
                                    <ul className="list-disc pl-4 space-y-1">
                                        {item.chemicalComponents.map((c: any, i: number) => (
                                            <li key={i}>
                                                {c.name} {c.percentage && c.percentage !== 'N/A' ? `(${c.percentage})` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : <span className="text-slate-300">-</span>}
                    </td>
                  )}
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
            <div className="p-12 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No se encontraron artículos con estos filtros.
            </div>
        )}
      </div>
    </div>
  );
};