import { CommissionRule } from '../types';

/**
 * Interfaz estandarizada para las métricas de ventas.
 * En producción, esto se calculará sumando transacciones reales.
 * En Sandbox, se inyectarán datos pre-generados.
 */
export interface SalesMetrics {
  totalRecaudo: number;
  totalFacturacion: number;
  ventasPorFamilia: Record<string, number>;
  ventasPorProducto: Record<string, number>;
  tareasCrmCompletadas: number;
  porcentajeDescuentosAltos: number; // Porcentaje de ventas con >5% descuento
  porcentajeRecaudoEnTiempo: {
    menosDe30Dias: number; // 0.70 = 70%
    entre31Y60Dias: number; // 0.20 = 20%
    masDe90Dias: number; // 0.10 = 10%
  };
}

/**
 * Domain Engine para calcular comisiones puras.
 * Completamente aislado de React, Contextos, o Bases de datos.
 * Altamente testeable.
 */
export class CommissionEngine {
  /**
   * Simula o calcula el costo exacto de una regla basada en un set de métricas de venta.
   */
  public static calculateRuleCost(rule: CommissionRule, metrics: SalesMetrics): number {
    if (!rule.active) return 0;

    let baseAmount = 0;

    // 1. Determinar la base gravable según la regla
    switch (rule.baseVariable) {
      case 'Recaudo':
        if (rule.type === 'Porcentaje') baseAmount = metrics.totalRecaudo;
        break;
      
      case 'Facturación':
        if (rule.type === 'Porcentaje') baseAmount = metrics.totalFacturacion;
        break;
      
      case 'Facturación Neta (Menos Retención)':
        if (rule.type === 'Porcentaje') {
          const retencionPromedio = metrics.totalFacturacion * 0.025;
          baseAmount = metrics.totalFacturacion - retencionPromedio;
        }
        break;

      case 'Familia':
        if (rule.type === 'Porcentaje') {
          // Si es Carpoly o Desengrasantes, usamos un genérico o leemos el mapa de familias
          // Para esta demostración matemática, buscamos en las ventas por familia
          const familia = rule.minVolumeThreshold ? 'CARPOLY' : 'DESENGRASANTES';
          const familiaSales = metrics.ventasPorFamilia[familia] || 0;
          
          if (rule.minVolumeThreshold) {
            const percentageOfTotal = (familiaSales / metrics.totalFacturacion) * 100;
            if (percentageOfTotal <= rule.minVolumeThreshold) {
               return 0; // No califica
            }
          }
          baseAmount = familiaSales;
        }
        break;

      case 'Tarea CRM':
        if (rule.type === 'Fijo') {
          return Math.round(metrics.tareasCrmCompletadas * (rule.value || 0));
        }
        break;

      default:
        break;
    }

    // 2. Aplicar Modificadores por Target
    let cost = 0;
    if (rule.type === 'Porcentaje') {
      cost = baseAmount * ((rule.value || 0) / 100);

      // Simulamos la distribución de cartera (En la vida real se filtran las facturas directamente)
      if (rule.target === 'Oro/Diamante') {
        cost = cost * 0.40; // Asume que el 40% de las ventas son de esta categoría
      } else if (rule.target === 'Clientes Especiales (1%)') {
        cost = cost * 0.15; 
      } else if (rule.target === 'Clientes Estándar / Regulares') {
        cost = cost * 0.85; 
      }
    } else if (rule.type === 'Fijo') {
       // Costos fijos puros si aplicara (Ej. Bono quemado)
       cost = rule.value || 0;
    }

    // 3. Evaluar Cap (Topes)
    // Asumimos un tope global del cap multiplicado por 10 asesores para simulaciones agregadas
    if (rule.cap && cost > rule.cap * 10) {
      cost = rule.cap * 10;
    }

    // 4. Aplicar Penalizaciones (Reglas de Negocio)
    if (rule.hasAgingPenalty) {
      // 0-30d: 100%, 31-60d: 50%, >90d: 0%
      const penaltyMultiplier = 
        (metrics.porcentajeRecaudoEnTiempo.menosDe30Dias * 1.0) + 
        (metrics.porcentajeRecaudoEnTiempo.entre31Y60Dias * 0.5) + 
        (metrics.porcentajeRecaudoEnTiempo.masDe90Dias * 0.0);
      cost = cost * penaltyMultiplier;
    }

    if (rule.hasDiscountPenalty) {
      // Si el 20% de sus ventas tuvieron alto descuento, esa porción gana la mitad
      const ventasNormales = 1 - metrics.porcentajeDescuentosAltos;
      cost = cost * (ventasNormales * 1.0 + metrics.porcentajeDescuentosAltos * 0.5);
    }

    return Math.round(cost);
  }
}
