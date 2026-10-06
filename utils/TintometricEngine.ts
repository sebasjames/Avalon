import { Product, ChemicalPresentation } from '../types';

export class TintometricEngine {
    
    /**
     * Evalúa dinámicamente si un producto requiere fórmula de tinte en POS/Producción
     * comparando el SKU, nombre, marca o familia contra las reglas activas.
     */
    public static requiresTintometricFormula(
        item: { sku?: string; name?: string; brand?: string; family?: string; category?: string },
        tintometricRules: string[] = []
    ): boolean {
        if (!tintometricRules || tintometricRules.length === 0) return false;

        const sku = (item.sku || '').toUpperCase();
        const name = (item.name || '').toUpperCase();
        const brand = (item.brand || '').toUpperCase();
        const family = (item.family || '').toUpperCase();

        return tintometricRules.some(rule => {
            const cleanRule = rule.trim().toUpperCase();
            if (!cleanRule) return false;
            return (
                sku.includes(cleanRule) ||
                name.includes(cleanRule) ||
                brand.includes(cleanRule) ||
                family.includes(cleanRule)
            );
        });
    }

    /**
     * Detecta la marca de un producto o químico dinámicamente.
     */
    public static detectBrand(
        name: string = '', 
        sku: string = '', 
        knownBrands: string[] = ['ILVA', 'CARPOLY', 'BARPIMO', 'TITAN', 'SAYER']
    ): string {
        const text = `${name} ${sku}`.toUpperCase();
        for (const brand of knownBrands) {
            if (text.includes(brand)) {
                return brand === 'CARPOLY' ? 'Carpoly' : brand === 'BARPIMO' ? 'Barpimo' : brand;
            }
        }
        return 'Genérico';
    }

    /**
     * Convierte unidades de medida (UoM) químicas entre Cuñete, Galón, Cuarto, Litro, Kilo y Gramos
     * usando configuraciones personalizadas de presentaciones químicas.
     */
    public static convertUoM(
        quantity: number,
        fromUnit: string,
        toUnit: string = 'LITROS',
        presentations: ChemicalPresentation[] = []
    ): number {
        if (fromUnit.toUpperCase() === toUnit.toUpperCase()) return quantity;

        // Factores estándar de conversión a Litros (base)
        const standardToLiters: Record<string, number> = {
            'CUÑETE': 18.927, // 5 Gal
            'CUNETE': 18.927,
            'GALON': 3.785,
            'GALÓN': 3.785,
            'GAL': 3.785,
            'CUARTO': 0.946,
            '1/4': 0.946,
            'OCTAVO': 0.473,
            '1/8': 0.473,
            'LITRO': 1.0,
            'LITROS': 1.0,
            'L': 1.0,
            'MILILITRO': 0.001,
            'ML': 0.001,
            'KILO': 1.0,
            'KG': 1.0,
            'GRAMO': 0.001,
            'GR': 0.001,
            'G': 0.001
        };

        const fromKey = fromUnit.trim().toUpperCase();
        const toKey = toUnit.trim().toUpperCase();

        // 1. Verificar si hay presentación registrada en la configuración activa
        let fromFactor = standardToLiters[fromKey];
        if (presentations && presentations.length > 0) {
            const matchedPres = presentations.find(p => p.unit.toUpperCase() === fromKey || p.name.toUpperCase() === fromKey);
            if (matchedPres && matchedPres.conversionToLiters) {
                fromFactor = matchedPres.conversionToLiters;
            }
        }

        let toFactor = standardToLiters[toKey];
        if (presentations && presentations.length > 0) {
            const matchedPresTo = presentations.find(p => p.unit.toUpperCase() === toKey || p.name.toUpperCase() === toKey);
            if (matchedPresTo && matchedPresTo.conversionToLiters) {
                toFactor = matchedPresTo.conversionToLiters;
            }
        }

        if (!fromFactor || !toFactor || toFactor === 0) return quantity;

        const liters = quantity * fromFactor;
        return Number((liters / toFactor).toFixed(4));
    }

    /**
     * Evalúa si un producto debe mostrarse con orden invertido en catálogo POS.
     */
    public static shouldDisplayReversed(
        item: { sku?: string; name?: string; brand?: string },
        reverseDisplayRules: string[] = []
    ): boolean {
        if (!reverseDisplayRules || reverseDisplayRules.length === 0) return false;
        const target = `${item.sku || ''} ${item.name || ''} ${item.brand || ''}`.toUpperCase();
        return reverseDisplayRules.some(rule => target.includes(rule.toUpperCase()));
    }

    /**
     * Evalúa si un producto admite venta en cantidades decimales (ej. 1.5 Galones).
     */
    public static isFractionalAllowed(
        item: { sku?: string; name?: string; unit?: string },
        fractionalRules: string[] = []
    ): boolean {
        if (!fractionalRules || fractionalRules.length === 0) return false;
        const target = `${item.sku || ''} ${item.name || ''} ${item.unit || ''}`.toUpperCase();
        return fractionalRules.some(rule => target.includes(rule.toUpperCase()));
    }
}
