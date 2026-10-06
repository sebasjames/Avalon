import { Product, SystemSettings } from '../types';

export const InventoryEngine = {
    /**
     * Calcula el estado dinámico del inventario (Lento, Silencioso, Obsoleto, Activo)
     * basado en los días de antigüedad y la configuración del sistema.
     */
    computeDynamicStatus: (agingDays: number, settings: SystemSettings): 'Activo' | 'Lento' | 'Silencioso' | 'Obsoleto' => {
        if (!agingDays) return 'Activo';
        
        if (agingDays >= settings.inventory.deadAgingDays) {
            return 'Obsoleto';
        }
        if (agingDays >= settings.inventory.silentAgingDays) {
            return 'Silencioso';
        }
        if (agingDays >= settings.inventory.slowAgingDays) {
            return 'Lento';
        }
        return 'Activo';
    },

    /**
     * Clasificación ABC basada en el valor total acumulado
     * Se usa cuando se evalúa todo el inventario de la compañía.
     */
    classifyABC: (inventory: Product[], settings: SystemSettings): Product[] => {
        // 1. Calcular valor total por item (stock libre * unitCost/price)
        const itemsWithValue = inventory.map(item => {
            const val = item.category === 'Servicio' ? 0 : item.totalStock * (item.category.includes('Materia Prima') ? item.unitCost : item.price);
            return { ...item, calculatedValue: val };
        });

        // 2. Ordenar de mayor a menor valor
        itemsWithValue.sort((a, b) => b.calculatedValue - a.calculatedValue);

        const totalInventoryValue = itemsWithValue.reduce((sum, item) => sum + item.calculatedValue, 0);
        let accumulatedValue = 0;

        return itemsWithValue.map(item => {
            accumulatedValue += item.calculatedValue;
            const percentageAccumulated = (totalInventoryValue === 0) ? 0 : (accumulatedValue / totalInventoryValue) * 100;

            let classification: 'A' | 'B' | 'C' = 'C';
            if (percentageAccumulated <= settings.inventory.abcThresholdA) {
                classification = 'A';
            } else if (percentageAccumulated <= (settings.inventory.abcThresholdA + settings.inventory.abcThresholdB)) {
                classification = 'B';
            }

            return {
                ...item,
                abcClass: classification
            };
        });
    }
};
