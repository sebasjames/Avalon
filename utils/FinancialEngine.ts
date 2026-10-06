import { KardexTransaction, ProductionBatch, InventoryItem, Category, SystemSettings } from '../types';

export class FinancialEngine {
    
    /**
     * Calculates the true margin by comparing standard vs actual costs of production batches
     * using the dynamically configured target margin (sales.defaultTargetMargin).
     */
    public static calculateRealMargin(batches: ProductionBatch[], targetMarginPercent: number = 30): { 
        projectedMarginPercent: number; 
        marginErosion: number; 
    } {
        // Multiplier based on configured target margin (e.g., 30% margin => revenue = stdCost / (1 - 0.30))
        const markupMultiplier = targetMarginPercent < 100 && targetMarginPercent > 0 
            ? 1 / (1 - (targetMarginPercent / 100)) 
            : 1.4;

        const marginMetrics = batches.reduce((acc, batch) => {
            if (batch.status === 'Completado' || batch.status === 'Control Calidad') {
                acc.totalStdCost += (batch.standardUnitCost * batch.actualOutput);
                acc.totalRealCost += (batch.realUnitCost * batch.actualOutput);
                acc.totalRevenue += ((batch.standardUnitCost * markupMultiplier) * batch.actualOutput);
            }
            return acc;
        }, { totalStdCost: 0, totalRealCost: 0, totalRevenue: 0 });

        if (marginMetrics.totalRevenue === 0) {
            return { projectedMarginPercent: 0, marginErosion: 0 };
        }

        const projectedMarginPercent = ((marginMetrics.totalRevenue - marginMetrics.totalRealCost) / marginMetrics.totalRevenue) * 100;
        const marginErosion = ((marginMetrics.totalRealCost - marginMetrics.totalStdCost) / marginMetrics.totalRevenue) * 100;

        return { projectedMarginPercent, marginErosion };
    }

    /**
     * Calculates annual and monthly inventory holding cost dynamically based on system settings.
     */
    public static calculateHoldingCost(totalInventoryValue: number, annualCostPercent: number = 25): {
        annualCost: number;
        monthlyCost: number;
    } {
        const annualCost = totalInventoryValue * (annualCostPercent / 100);
        return {
            annualCost: Math.round(annualCost),
            monthlyCost: Math.round(annualCost / 12)
        };
    }

    /**
     * Projects upcoming Cash Flow operations based on historical transaction trend and dynamic target margin.
     */
    public static projectCashFlow(
        transactions: KardexTransaction[], 
        defaultOpEx: number = 15000000,
        targetMarginPercent: number = 30
    ): any[] {
        const sales = transactions.filter(t => t.type === 'VENTA' || t.type === 'Salida');
        
        const monthMap = new Map<string, number>();
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const now = new Date();
        for (let i = 2; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthMap.set(`${d.getFullYear()}-${d.getMonth()}`, 0);
        }

        sales.forEach(s => {
            const date = new Date(s.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            if (monthMap.has(key)) {
                const amount = s.total || (s.quantity ? Math.abs(s.quantity) * 15000 : 0);
                monthMap.set(key, monthMap.get(key)! + amount);
            }
        });

        // Calculate average to project forward 3 months
        let sumValue = 0;
        let count = 0;
        monthMap.forEach((val) => { sumValue += val; count++; });
        const avgMonthlySales = (count > 0 ? sumValue / count : 0) || 50000000;
        const cogsRatio = Math.max(0.1, 1 - (targetMarginPercent / 100));

        const data: any[] = [];
        let projectionIndex = 0;
        
        // 1. Add historical actuals
        monthMap.forEach((val, key) => {
            const [, m] = key.split('-');
            const revenue = val || avgMonthlySales * 0.9; 
            const cogs = revenue * cogsRatio;
            data.push({
                month: monthNames[parseInt(m)],
                revenue: revenue,
                netCashFlow: revenue - cogs - defaultOpEx,
                cumulativeCash: revenue - cogs - defaultOpEx
            });
            projectionIndex++;
        });

        // 2. Add future projections
        for (let i = 1; i <= 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const projectedRevenue = avgMonthlySales * (1 + (i * 0.05)); // 5% monthly growth
            const projectedCogs = projectedRevenue * cogsRatio;
            
            data.push({
                month: monthNames[d.getMonth()],
                revenue: projectedRevenue,
                netCashFlow: projectedRevenue - projectedCogs - defaultOpEx,
                cumulativeCash: projectedRevenue - projectedCogs - defaultOpEx
            });
        }

        return data;
    }

    /**
     * Simulates company cash position using inventory ratio or fallback standard.
     */
    public static calculateCompanyCash(inventory: InventoryItem[]): number {
        const totalInventoryValue = inventory.reduce((acc, item) => {
            if (item.category === Category.SERVICE) return acc;
            const cost = item.category === Category.RAW_MATERIAL ? item.unitCost : (item.unitCost * 0.8);
            return acc + (item.totalStock * cost);
        }, 0);

        return totalInventoryValue > 0 ? (totalInventoryValue * 2.5) : 250000000; 
    }
}
