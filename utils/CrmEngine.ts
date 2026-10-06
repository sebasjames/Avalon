import { CrmDeal, CrmSettings, CrmDealStage } from '../types';

export interface StageConfig {
    id: CrmDealStage | string;
    label: string;
    defaultProbability: number;
    color?: string;
}

export const DEFAULT_CRM_STAGES: StageConfig[] = [
    { id: 'PROSPECTO', label: 'Prospecto / Lead', defaultProbability: 10, color: 'bg-slate-100 border-slate-200' },
    { id: 'QUALIFIED', label: 'Calificado', defaultProbability: 30, color: 'bg-blue-50 border-blue-200' },
    { id: 'PROPOSAL', label: 'Propuesta / Cotización', defaultProbability: 50, color: 'bg-indigo-50 border-indigo-200' },
    { id: 'NEGOTIATION', label: 'Negociación', defaultProbability: 80, color: 'bg-amber-50 border-amber-200' },
    { id: 'CLOSED_WON', label: 'Ganado', defaultProbability: 100, color: 'bg-emerald-50 border-emerald-200' },
    { id: 'CLOSED_LOST', label: 'Perdido', defaultProbability: 0, color: 'bg-rose-50 border-rose-200' }
];

export class CrmEngine {

    /**
     * Retorna las etapas activas del pipeline combinando la configuración dinámica con defaults.
     */
    public static getActiveStages(crmSettings?: CrmSettings): StageConfig[] {
        if (!crmSettings || !crmSettings.stages || crmSettings.stages.length === 0) {
            return DEFAULT_CRM_STAGES;
        }

        return crmSettings.stages.map(configuredStage => {
            const defaultMatch = DEFAULT_CRM_STAGES.find(s => s.id === configuredStage.id);
            return {
                id: configuredStage.id,
                label: configuredStage.label || defaultMatch?.label || configuredStage.id,
                defaultProbability: configuredStage.defaultProbability ?? defaultMatch?.defaultProbability ?? 50,
                color: configuredStage.color || defaultMatch?.color || 'bg-slate-50 border-slate-200'
            };
        });
    }

    /**
     * Calcula el valor ponderado del pipeline basándose en la probabilidad dinámica de cada etapa.
     */
    public static calculateWeightedPipeline(deals: CrmDeal[], crmSettings?: CrmSettings): {
        totalRawValue: number;
        totalWeightedValue: number;
    } {
        const stages = this.getActiveStages(crmSettings);
        const stageMap = new Map<string, number>();
        stages.forEach(s => stageMap.set(s.id, s.defaultProbability));

        let totalRawValue = 0;
        let totalWeightedValue = 0;

        deals.forEach(deal => {
            if (deal.stage === 'CLOSED_LOST') return;
            const value = deal.value || 0;
            totalRawValue += value;

            const prob = stageMap.has(deal.stage) ? stageMap.get(deal.stage)! : 50;
            totalWeightedValue += value * (prob / 100);
        });

        return {
            totalRawValue: Math.round(totalRawValue),
            totalWeightedValue: Math.round(totalWeightedValue)
        };
    }
}
