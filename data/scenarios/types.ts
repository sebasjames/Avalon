export interface ScenarioStep {
  title: string;
  instruction: string;
  proTip?: string;
  warning?: string;
}

export type ScenarioStatus = 'aprobado' | 'falla' | 'pendiente';
export type ScenarioCategory = 'Flujo Cotidiano' | 'Corrección Operativa' | 'Error / Alerta' | 'Apertura / Cierre';
export type ModuleId = 'pos' | 'contabilidad' | 'inventario' | 'produccion' | 'crm' | 'logistica' | 'configuracion';

export interface HumanScenario {
  id: string;
  title: string;
  module: string;
  moduleId: ModuleId;
  subtopic: string; // Nivel 2: Área o Carpeta Funcional
  category: ScenarioCategory;
  status: ScenarioStatus;
  statusNote?: string;
  expectedResult: string;
  route?: string;
  routeLabel?: string;
  synonyms: string[];
  summary: string;
  steps: ScenarioStep[];
  contingency: string;
}

export interface TopicGroup {
  moduleId: ModuleId;
  moduleName: string;
  subtopics: {
    name: string;
    articles: HumanScenario[];
  }[];
  totalArticles: number;
}
