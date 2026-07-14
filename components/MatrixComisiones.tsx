import React, { useState, useMemo } from 'react';
import { 
  Network, Plus, Save, Play, Calculator, ToggleLeft, ToggleRight, 
  Trash2, Edit3, ShieldAlert, BarChart3, Users, DollarSign, Target, Briefcase
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface Rule {
  id: string;
  name: string;
  type: 'Porcentaje' | 'Fijo' | 'Multiplicador';
  baseVariable: 'Recaudo' | 'Facturación' | 'Producto' | 'Familia' | 'Tarea CRM';
  value: number;
  target: 'Todos' | 'Oro/Diamante' | 'Plata/Bronce' | 'Selección Manual';
  active: boolean;
  cap?: number; // Optional maximum cap
}

export const MatrixComisiones: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', name: 'Comisión Base (General)', type: 'Porcentaje', baseVariable: 'Recaudo', value: 1.0, target: 'Todos', active: true },
    { id: '2', name: 'Bono Acelerador', type: 'Porcentaje', baseVariable: 'Facturación', value: 0.5, target: 'Oro/Diamante', active: true, cap: 2000 },
    { id: '3', name: 'Reto Datos Completos', type: 'Fijo', baseVariable: 'Tarea CRM', value: 50, target: 'Todos', active: false },
    { id: '4', name: 'Impulso Desengrasantes', type: 'Porcentaje', baseVariable: 'Familia', value: 3.0, target: 'Todos', active: true, cap: 500 },
  ]);

  // --- SIMULATION LOGIC ---
  // Proxy historical data (Last Month)
  const historical = {
    totalRecaudo: 400000,
    totalFacturacion: 650000,
    ventasDesengrasantes: 45000,
    tareasCrmEstimadas: 150 // instances
  };

  const simulateRuleCost = (rule: Rule) => {
    if (!rule.active) return 0;
    
    let cost = 0;
    if (rule.baseVariable === 'Recaudo' && rule.type === 'Porcentaje') {
      cost = historical.totalRecaudo * (rule.value / 100);
    } else if (rule.baseVariable === 'Facturación' && rule.type === 'Porcentaje') {
      cost = historical.totalFacturacion * (rule.value / 100);
      if (rule.target === 'Oro/Diamante') cost = cost * 0.4; // assume 40% of sales are from top tier
    } else if (rule.baseVariable === 'Familia' && rule.type === 'Porcentaje') {
      cost = historical.ventasDesengrasantes * (rule.value / 100);
    } else if (rule.baseVariable === 'Tarea CRM' && rule.type === 'Fijo') {
      cost = historical.tareasCrmEstimadas * rule.value;
    }
    
    // Apply cap if exists
    if (rule.cap && cost > rule.cap * 10 /* rough estimate of team size */) {
      cost = rule.cap * 10; 
    }
    
    return Math.round(cost);
  };

  // Calculate total costs for the Pie Chart
  const distributionData = useMemo(() => {
    const data = rules.filter(r => r.active).map(rule => ({
      name: rule.name,
      value: simulateRuleCost(rule)
    })).filter(d => d.value > 0);

    return data.length > 0 ? data : [{ name: 'Sin Reglas Activas', value: 1 }];
  }, [rules]);

  const totalSimulatedCost = distributionData.reduce((acc, curr) => acc + (curr.name === 'Sin Reglas Activas' ? 0 : curr.value), 0);
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'];

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const addNewRule = () => {
    const newRule: Rule = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nueva Regla',
      type: 'Porcentaje',
      baseVariable: 'Facturación',
      value: 1,
      target: 'Todos',
      active: false
    };
    setRules([...rules, newRule]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Network className="w-8 h-8 text-indigo-400" />
            Matrix Comisiones
          </h1>
          <p className="text-slate-400 mt-1">Motor de reglas dinámicas. Configura, simula y despliega esquemas de incentivos.</p>
        </div>
        <button 
          onClick={addNewRule}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          Crear Regla
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The Rules Builder */}
        <div className="xl:col-span-8 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-400" />
            Lienzo de Reglas
          </h2>
          
          {rules.map((rule) => (
            <div 
              key={rule.id} 
              className={`bg-slate-800 rounded-2xl p-5 border transition-all duration-300 ${
                rule.active ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-slate-700 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Rule Header & Toggle */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={() => toggleRule(rule.id)} className="transition-transform hover:scale-110">
                      {rule.active ? (
                        <ToggleRight className="w-8 h-8 text-indigo-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-500" />
                      )}
                    </button>
                    <input 
                      type="text" 
                      value={rule.name}
                      onChange={(e) => setRules(rules.map(r => r.id === rule.id ? { ...r, name: e.target.value } : r))}
                      className="bg-transparent text-lg font-bold text-white border-b border-transparent hover:border-slate-600 focus:border-indigo-500 focus:outline-none w-full max-w-xs transition-colors"
                    />
                  </div>
                  
                  {/* Rule Configuration Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    
                    {/* Variable */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Variable Base</label>
                      <select 
                        value={rule.baseVariable}
                        onChange={(e) => setRules(rules.map(r => r.id === rule.id ? { ...r, baseVariable: e.target.value as any } : r))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Recaudo">Recaudo (Dinero en Banco)</option>
                        <option value="Facturación">Facturación Total</option>
                        <option value="Producto">SKU Específico</option>
                        <option value="Familia">Familia de Producto</option>
                        <option value="Tarea CRM">Completar Datos (CRM)</option>
                      </select>
                      
                      {/* Conditional Render for SKU/Familia */}
                      {rule.baseVariable === 'Producto' && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                          <label className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Seleccionar SKU(s)</label>
                          <input 
                            type="text" 
                            placeholder="Ej. DESENG-01, LIMPI-02..."
                            className="w-full bg-slate-800 border border-indigo-500/50 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
                          />
                        </div>
                      )}
                      {rule.baseVariable === 'Familia' && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                          <label className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Seleccionar Familia</label>
                          <select className="w-full bg-slate-800 border border-indigo-500/50 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-400">
                            <option>Desengrasantes</option>
                            <option>Detergentes</option>
                            <option>Limpiadores Generales</option>
                            <option>Cuidado Automotriz</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Type */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cálculo</label>
                      <select 
                        value={rule.type}
                        onChange={(e) => setRules(rules.map(r => r.id === rule.id ? { ...r, type: e.target.value as any } : r))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Porcentaje">% Porcentaje</option>
                        <option value="Fijo">$ Monto Fijo</option>
                        <option value="Multiplicador">x Multiplicador</option>
                      </select>
                    </div>

                    {/* Value */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Valor</label>
                      <div className="relative">
                        {rule.type === 'Fijo' && <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>}
                        <input 
                          type="number" 
                          value={rule.value}
                          onChange={(e) => setRules(rules.map(r => r.id === rule.id ? { ...r, value: parseFloat(e.target.value) || 0 } : r))}
                          className={`w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg py-2 text-sm focus:outline-none focus:border-indigo-500 ${rule.type === 'Fijo' ? 'pl-7' : 'px-3'}`}
                        />
                        {rule.type === 'Porcentaje' && <span className="absolute right-3 top-2 text-slate-400 text-sm">%</span>}
                      </div>
                    </div>

                    {/* Target */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Asignación</label>
                      <select 
                        value={rule.target}
                        onChange={(e) => setRules(rules.map(r => r.id === rule.id ? { ...r, target: e.target.value as any } : r))}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Todos">Todos los Agentes</option>
                        <option value="Oro/Diamante">Solo Rango Oro/Diamante</option>
                        <option value="Plata/Bronce">Solo Rango Plata/Bronce</option>
                        <option value="Selección Manual">Selección Manual...</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* Actions (Delete, Edit Caps) */}
                <div className="flex md:flex-col justify-end md:justify-start gap-2 border-t md:border-t-0 md:border-l border-slate-700 pt-4 md:pt-0 md:pl-4">
                  <button className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-700 hover:border-slate-500 transition-colors tooltip-trigger" title="Opciones Avanzadas (Topes)">
                    <ShieldAlert className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-2 bg-slate-900 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg border border-slate-700 hover:border-rose-500/50 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

              </div>
            </div>
          ))}

          {rules.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500">
              <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay reglas en la Matrix. Haz clic en "Crear Regla" para comenzar.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dashboard & Simulator */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Master Pie Chart */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl relative">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Torta Global de Comisiones
            </h2>
            <p className="text-xs text-slate-400 mb-6">Distribución del presupuesto según reglas activas.</p>
            
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            formatter={(value: number) => [`$${value.toLocaleString('es-CO')} COP`, 'Presupuesto Estimado']}
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-white">
                        ${(totalSimulatedCost / 1000).toFixed(1)}k
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Estimado</span>
                </div>
            </div>

            {/* Legend generated dynamically */}
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {distributionData.map((item, i) => (
                item.name !== 'Sin Reglas Activas' && (
                  <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 truncate pr-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-slate-300 truncate" title={item.name}>{item.name}</span>
                      </div>
                      <span className="font-mono font-medium text-white shrink-0">${item.value.toLocaleString('es-CO')} COP</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Impact Simulator */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 rounded-2xl p-6 border border-indigo-500/30 shadow-xl">
            <h2 className="text-lg font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Simulador de Impacto
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              Basado en las ventas del <strong className="text-white">mes pasado</strong> ($650k facturados / $400k recaudados), este esquema tendría el siguiente costo:
            </p>
            
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-700 mb-6">
              <div className="text-sm text-slate-400 mb-1 uppercase tracking-wider font-semibold">Costo Total Estimado</div>
              <div className="text-4xl font-black text-white">${totalSimulatedCost.toLocaleString('es-CO')} COP</div>
              
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-sm text-slate-400">Margen Comprometido:</span>
                <span className="text-emerald-400 font-bold text-lg">
                  {((totalSimulatedCost / historical.totalFacturacion) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
              <Save className="w-5 h-5" />
              Hacer Reglas Oficiales (Deploy)
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              Los agentes verán estas reglas en su panel inmediatamente.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
