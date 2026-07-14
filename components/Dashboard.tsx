import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import { TrendingUp, AlertTriangle, Package, DollarSign, Activity, Truck } from 'lucide-react';
import { SALES_DATA, MOCK_INVENTORY } from '../constants';
import { InventoryStatus, Category } from '../types';
import { formatCOP } from '../utils/format';

const KPICard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={change >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
        {change > 0 ? "+" : ""}{change}%
      </span>
      <span className="text-slate-400 ml-2">vs mes anterior</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  // Calculated metrics
  const totalValue = MOCK_INVENTORY.reduce((acc, item) => acc + (item.category === Category.SERVICE ? 0 : item.totalStock * (item.category.includes('Materia Prima') ? item.unitCost : item.price)), 0);
  const silentStockCount = MOCK_INVENTORY.filter(i => i.status === InventoryStatus.SILENT).length;
  const activeStockCount = MOCK_INVENTORY.filter(i => i.status === InventoryStatus.ACTIVE).length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Valor Total Inventario" 
          value={formatCOP(totalValue)} 
          change={-2.4} 
          icon={DollarSign} 
          color="bg-blue-600" 
        />
        <KPICard 
          title="Nivel de Servicio (OTIF)" 
          value="94.2%" 
          change={1.5} 
          icon={Truck} 
          color="bg-emerald-500" 
        />
        <KPICard 
          title="Riesgo Inv. Silencioso" 
          value={`${silentStockCount} SKUs`} 
          change={12} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
        <KPICard 
          title="Velocidad Stock Activo" 
          value={`${activeStockCount} SKUs`} 
          change={5.2} 
          icon={Activity} 
          color="bg-indigo-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Forecast Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Ventas vs. Pronóstico
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="forecast" stroke="#94a3b8" strokeDasharray="5 5" fill="none" name="Pronóstico" />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" name="Ventas Reales" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Composition by Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-indigo-600" />
            Distribución por Estatus
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Activo', value: activeStockCount, color: '#10b981' },
                { name: 'Lento', value: MOCK_INVENTORY.filter(i => i.status === InventoryStatus.SLOW).length, color: '#f59e0b' },
                { name: 'Silencioso', value: silentStockCount, color: '#ef4444' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};