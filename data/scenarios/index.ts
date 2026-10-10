import { HumanScenario, TopicGroup, ModuleId } from './types';
import { POS_SCENARIOS } from './posScenarios';
import { PRODUCTION_SCENARIOS } from './productionScenarios';
import { INVENTORY_SCENARIOS } from './inventoryScenarios';
import { ACCOUNTING_SCENARIOS } from './accountingScenarios';
import { CRM_SCENARIOS } from './crmScenarios';
import { DISPATCH_SCENARIOS } from './dispatchScenarios';
import { ADMIN_SCENARIOS } from './adminScenarios';

export * from './types';
export * from './posScenarios';
export * from './productionScenarios';
export * from './inventoryScenarios';
export * from './accountingScenarios';
export * from './crmScenarios';
export * from './dispatchScenarios';
export * from './adminScenarios';
export * from './searchEngine';

export const ALL_AVALON_SCENARIOS: HumanScenario[] = [
  ...POS_SCENARIOS,
  ...PRODUCTION_SCENARIOS,
  ...INVENTORY_SCENARIOS,
  ...ACCOUNTING_SCENARIOS,
  ...CRM_SCENARIOS,
  ...DISPATCH_SCENARIOS,
  ...ADMIN_SCENARIOS
];

/**
 * Builds the 3-level hierarchical navigation structure:
 * Nivel 1: Módulo Principal
 * Nivel 2: Subtema / Carpeta Funcional
 * Nivel 3: Artículos / Escenarios Específicos
 */
export const buildHierarchicalTopics = (scenarios: HumanScenario[] = ALL_AVALON_SCENARIOS): TopicGroup[] => {
  const modulesOrder: { id: ModuleId; name: string }[] = [
    { id: 'pos', name: 'Ventas & POS' },
    { id: 'produccion', name: 'Producción & Mezclas' },
    { id: 'inventario', name: 'Inventario & Kárdex' },
    { id: 'contabilidad', name: 'Contabilidad & Caja' },
    { id: 'crm', name: 'CRM & Clientes' },
    { id: 'logistica', name: 'Logística & Despachos' },
    { id: 'configuracion', name: 'Configuración & Roles' }
  ];

  return modulesOrder.map(({ id, name }) => {
    const moduleScenarios = scenarios.filter(s => s.moduleId === id);
    
    // Group scenarios by subtopic
    const subtopicMap = new Map<string, HumanScenario[]>();
    moduleScenarios.forEach(sc => {
      const list = subtopicMap.get(sc.subtopic) || [];
      list.push(sc);
      subtopicMap.set(sc.subtopic, list);
    });

    const subtopics = Array.from(subtopicMap.entries()).map(([subName, articles]) => ({
      name: subName,
      articles
    }));

    return {
      moduleId: id,
      moduleName: name,
      subtopics,
      totalArticles: moduleScenarios.length
    };
  }).filter(group => group.totalArticles > 0);
};
