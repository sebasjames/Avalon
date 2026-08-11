import React from 'react';
import { ExtractedLandedCost } from '../services/geminiService';
import { AuditRow } from './DataAuditGrid';
import { Calculator, TrendingDown, TrendingUp } from 'lucide-react';

interface LandedCostCompendiumProps {
    auditData: AuditRow[];
    landedCosts: ExtractedLandedCost[];
    trm: number;
    colchonEstimado: number;
    currency: 'USD' | 'EUR';
}

export const LandedCostCompendium: React.FC<LandedCostCompendiumProps> = ({ 
    auditData, landedCosts, trm, colchonEstimado, currency 
}) => {
    // 1. Calcular Kilos Totales
    const totalKilos = auditData.reduce((acc, row) => acc + (row.qty * (row.kgPerUnit || 1)), 0);
    
    // 2. Calcular FOB Total
    const totalFobUSD = auditData.reduce((acc, row) => acc + (row.qty * row.unitCost), 0);
    const totalFobCOP = totalFobUSD * trm;
    
    // 3. Calcular Total Gastos Logísticos (Suma de los landedCosts crudos)
    const totalGastosCOP = landedCosts.reduce((acc, cost) => acc + cost.rawAmount, 0);

    // 4. Gran Total Importación
    const granTotalCOP = totalFobCOP + totalGastosCOP;

    // 5. El Veredicto (Colchón Real Matemático)
    const colchonReal = totalKilos > 0 ? (totalGastosCOP / totalKilos) : 0;
    
    // Comparativa para UI
    const diferenciaColchon = colchonEstimado - colchonReal;
    const isColchonSeguro = diferenciaColchon >= 0;

    const formatCurrency = (val: number, curr = 'COP') => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: curr, maximumFractionDigits: 2 }).format(val);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                    <Calculator className="text-indigo-400" />
                    Compendio Contable de Nacionalización
                </h3>
                <div className="text-right">
                    <span className="text-slate-400 text-sm">Kilos Importados: </span>
                    <span className="text-white font-mono font-bold text-lg">{totalKilos.toLocaleString('es-CO', {maximumFractionDigits: 2})} KG</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Panel Izquierdo: Resumen Excel Style */}
                <div className="col-span-12 md:col-span-8 border-r border-slate-200">
                    {/* Header: Gran Total */}
                    <div className="grid grid-cols-4 bg-yellow-300 font-black text-slate-800 border-b border-slate-300">
                        <div className="col-span-2 p-3 text-right uppercase text-sm border-r border-yellow-400">
                            Con Costo Importación
                        </div>
                        <div className="col-span-2 p-3 text-right font-mono text-lg">
                            {formatCurrency(granTotalCOP)}
                        </div>
                    </div>

                    {/* Sub Header: FOB */}
                    <div className="grid grid-cols-4 bg-yellow-200 font-bold text-slate-800 border-b border-slate-300">
                        <div className="col-span-2 p-2 text-right uppercase text-xs border-r border-yellow-300 flex items-center justify-end">
                            FOB ({currency})
                        </div>
                        <div className="col-span-2 p-2 text-right font-mono text-sm flex justify-between px-4 items-center">
                            <span className="text-slate-600 font-normal bg-yellow-100 px-2 py-0.5 rounded">{formatCurrency(totalFobUSD, currency)}</span>
                            <span>{formatCurrency(totalFobCOP)}</span>
                        </div>
                    </div>

                    {/* Lista de Gastos */}
                    <div className="bg-yellow-50 min-h-[200px]">
                        {landedCosts.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 italic text-sm">
                                No hay facturas logísticas extraídas para cruzar en este viaje.
                            </div>
                        ) : (
                            landedCosts.map((cost, idx) => (
                                <div key={idx} className="grid grid-cols-4 border-b border-yellow-200 text-sm hover:bg-yellow-100 transition-colors">
                                    <div className="col-span-2 p-2 pl-4 border-r border-yellow-200 uppercase text-xs text-slate-700 flex flex-col justify-center text-right pr-4">
                                        <span className="font-bold">{cost.rawConcept}</span>
                                        <span className="text-[10px] text-slate-500">{cost.provider}</span>
                                    </div>
                                    <div className="col-span-2 p-2 text-right font-mono text-slate-800 flex items-center justify-end pr-4">
                                        {formatCurrency(cost.rawAmount)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer: Suma Gastos */}
                    <div className="grid grid-cols-4 bg-slate-400 text-white font-bold">
                        <div className="col-span-2 p-3 text-center uppercase tracking-widest border-r border-slate-500">
                            TOTAL GASTOS
                        </div>
                        <div className="col-span-2 p-3 text-right font-mono text-lg text-blue-900 bg-blue-200">
                            {formatCurrency(totalGastosCOP)}
                        </div>
                    </div>
                </div>

                {/* Panel Derecho: Veredicto del Colchón */}
                <div className="col-span-12 md:col-span-4 bg-slate-50 p-6 flex flex-col justify-center items-center text-center">
                    <h4 className="uppercase text-xs font-bold text-slate-500 tracking-wider mb-6">Auditoría de Factor Colchón</h4>
                    
                    <div className="w-full space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                            <span className="text-slate-500 text-sm font-medium">Estimado Inicialmente</span>
                            <span className="font-mono font-bold text-slate-700">{formatCurrency(colchonEstimado)} / KG</span>
                        </div>
                        
                        <div className={`p-5 rounded-xl border-2 flex flex-col items-center justify-center shadow-sm ${
                            isColchonSeguro ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                        }`}>
                            <span className={`text-sm font-bold uppercase mb-1 ${isColchonSeguro ? 'text-emerald-600' : 'text-rose-600'}`}>
                                Colchón Real Liquidado
                            </span>
                            <span className={`font-mono font-black text-2xl ${isColchonSeguro ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {formatCurrency(colchonReal)} / KG
                            </span>
                        </div>

                        <div className={`mt-2 p-3 rounded-lg flex items-start gap-3 text-left ${
                            isColchonSeguro ? 'bg-emerald-100/50 text-emerald-800' : 'bg-rose-100/50 text-rose-800'
                        }`}>
                            {isColchonSeguro ? (
                                <>
                                    <TrendingDown className="w-6 h-6 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <span className="font-bold block mb-1">¡Operación Saludable!</span>
                                        Tuviste un ahorro logístico de <strong>{formatCurrency(diferenciaColchon)}</strong> por cada kilo frente a lo provisionado.
                                    </div>
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-6 h-6 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <span className="font-bold block mb-1">¡Sobrecosto Logístico!</span>
                                        El viaje salió <strong>{formatCurrency(Math.abs(diferenciaColchon))}</strong> más caro por kilo de lo estimado.
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
