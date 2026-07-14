import React, { useState } from 'react';
import { MOCK_INVENTORY } from '../constants';
import { InventoryStatus, ABCClass, XYZClass, Category } from '../types';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle, X } from 'lucide-react';
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

export const InventoryTable: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  
  const filteredData = MOCK_INVENTORY.filter(item => {
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
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">SKU / Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Estatus</th>
                <th className="px-6 py-4">ABC/XYZ</th>
                <th className="px-6 py-4 text-right">Stock Total</th>
                <th className="px-6 py-4 text-right">ATP (Libre)</th>
                <th className="px-6 py-4 text-right">Aging (Días)</th>
                <th className="px-6 py-4 text-right">Valor Total (Costo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => {
                 const atp = item.totalStock - item.reservedStock;
                 const value = (item.category.includes('Materia Prima') ? item.unitCost : item.price) * item.totalStock;
                 return (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{item.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{item.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4">
                    <MatrixBadge abc={item.abc} xyz={item.xyz} />
                  </td>
                   <td className="px-6 py-4 text-right font-medium">
                     {item.category === Category.SERVICE ? '∞' : item.totalStock.toLocaleString('es-CO')}
                   </td>
                   <td className={`px-6 py-4 text-right font-bold ${atp < 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
                     {item.category === Category.SERVICE ? '∞' : atp.toLocaleString('es-CO')}
                   </td>
                   <td className="px-6 py-4 text-right">
                     <span className={`${item.agingDays > 90 ? 'text-rose-600 font-bold' : ''}`}>{item.agingDays}</span>
                   </td>
                   <td className="px-6 py-4 text-right">
                     {item.category === Category.SERVICE ? formatCOP(0) : formatCOP(value)}
                   </td>
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