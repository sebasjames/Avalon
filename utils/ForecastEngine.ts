import { KardexTransaction } from '../types';

export interface ForecastScenarioResult {
    month: string;
    historical: number | null;
    conservative: number | null;
    base: number | null;
    aggressive: number | null;
    pipeline: number | null;
    pipelineWeighted: number | null;
}

export interface InventoryOptimizationResult {
    staticMin: number;
    staticMax: number;
    dynamicMin: number;
    dynamicMax: number;
    reason: string;
    volatilityPercent: number;
}

export class ForecastEngine {
    /**
     * Proyecta la demanda basándose en las transacciones de venta históricas (Kardex) y el pipeline actual.
     * Retorna una serie de tiempo lista para graficarse.
     */
    public static generateDemandForecast(
        kardexTransactions: KardexTransaction[], 
        openPipelineValue: number,
        historicalMonths: number = 6,
        forecastMonths: number = 3
    ): ForecastScenarioResult[] {
        const sales = kardexTransactions.filter(t => t.type === 'VENTA');
        
        const monthMap = new Map<string, number>();
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        
        // Inicializar mapa de meses históricos
        for (let i = historicalMonths - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
        }

        // Agregar ventas a los meses correspondientes
        sales.forEach(s => {
            const date = new Date(s.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthMap.has(key)) {
                // Si la venta no tiene total explícito, inferimos un aproximado para la simulación
                const amount = s.total || (s.quantity ? Math.abs(s.quantity) * 15000 : 0);
                monthMap.set(key, monthMap.get(key)! + amount);
            }
        });

        const data: ForecastScenarioResult[] = [];
        let sumValue = 0;
        let lastHistoricalValue = 0;
        
        // Poblar datos históricos
        monthMap.forEach((val, key) => {
            const [, m] = key.split('-');
            data.push({
                month: monthNames[parseInt(m)],
                historical: val,
                conservative: null,
                base: null,
                aggressive: null,
                pipeline: null,
                pipelineWeighted: null
            });
            sumValue += val;
            lastHistoricalValue = val;
        });

        const avgMonthlySales = sumValue / historicalMonths || 100000;
        
        // Poblar datos proyectados
        for (let i = 1; i <= forecastMonths; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            
            // Modelo de crecimiento lineal simplificado
            const baseProj = avgMonthlySales * (1 + (i * 0.05)); // 5% crecimiento base
            
            data.push({
                month: monthNames[d.getMonth()],
                historical: null,
                conservative: baseProj * 0.90, // -10% de la base
                base: baseProj,
                aggressive: baseProj * 1.20, // +20% de la base
                pipeline: i === 1 ? openPipelineValue : 0,
                pipelineWeighted: i === 1 ? openPipelineValue * 0.6 : 0 // Asume 60% prob de cierre
            });
        }
        
        // Conectar la línea del gráfico (el último punto histórico se convierte en el inicio del forecast)
        const lastIndex = historicalMonths - 1;
        if (data[lastIndex]) {
            data[lastIndex].base = data[lastIndex].historical;
            data[lastIndex].conservative = data[lastIndex].historical;
            data[lastIndex].aggressive = data[lastIndex].historical;
        }

        return data;
    }

    /**
     * Calcula los niveles Min/Max óptimos de inventario basados en la desviación estándar de la demanda.
     */
    public static calculateOptimalInventoryLevels(
        kardexTransactions: KardexTransaction[],
        leadTimeDays: number = 15,
        targetServiceLevelZScore: number = 1.65 // 95% service level
    ): InventoryOptimizationResult {
        const sales = kardexTransactions.filter(t => t.type === 'VENTA');
        
        // Agrupar ventas por día
        const dailySales = new Map<string, number>();
        sales.forEach(s => {
            const dateStr = s.date.split(' ')[0] || s.date.split('T')[0];
            const qty = s.quantity ? Math.abs(s.quantity) : 1;
            dailySales.set(dateStr, (dailySales.get(dateStr) || 0) + qty);
        });

        const dailyValues = Array.from(dailySales.values());
        if (dailyValues.length === 0) {
            return {
                staticMin: 500, staticMax: 1500,
                dynamicMin: 500, dynamicMax: 1500,
                reason: 'Sin datos históricos suficientes.',
                volatilityPercent: 0
            };
        }

        const avgDailySales = dailyValues.reduce((a, b) => a + b, 0) / (dailyValues.length || 1);
        
        // Calcular Desviación Estándar
        const variance = dailyValues.reduce((acc, val) => acc + Math.pow(val - avgDailySales, 2), 0) / dailyValues.length;
        const stdDev = Math.sqrt(variance);

        // Min = (Promedio Diario * Lead Time) + Safety Stock
        // Safety Stock = Z * StdDev * sqrt(Lead Time)
        const safetyStock = targetServiceLevelZScore * stdDev * Math.sqrt(leadTimeDays);
        const dynamicMin = Math.round((avgDailySales * leadTimeDays) + safetyStock);
        
        // Max = Min + Economic Order Quantity (Simplificamos a Min * 3 para este cálculo)
        const dynamicMax = Math.round(dynamicMin * 3);

        const staticMin = 500; // Hardcoded legacy limit
        const staticMax = 1500;
        
        // Calcular % de variabilidad (Coeficiente de Variación)
        const cv = (stdDev / (avgDailySales || 1)) * 100;

        let reason = 'Consumo estable.';
        if (cv > 20) {
            reason = `Alta variabilidad detectada (+${cv.toFixed(0)}%). Aumentando Safety Stock.`;
        } else if (cv < 5 && avgDailySales > 0) {
            reason = 'Baja variabilidad. Posibilidad de reducir stock de seguridad.';
        }

        return {
            staticMin,
            staticMax,
            dynamicMin: dynamicMin === 0 ? 620 : dynamicMin, // Fallback visual si el cálculo real da cero por datos pobres
            dynamicMax: dynamicMax === 0 ? 1800 : dynamicMax,
            reason,
            volatilityPercent: cv
        };
    }
}
