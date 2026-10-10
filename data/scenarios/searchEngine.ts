import { HumanScenario } from './types';

/**
 * Normaliza cadenas de texto para búsqueda:
 * - Elimina acentos/tildes (á->a, é->e, etc.)
 * - Convierte a minúsculas
 * - Homologa 'ñ' con 'n' para permitir búsquedas con o sin eñe (ej: "cuñete" o "cunete")
 */
export const normalizeSearchText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .trim();
};

/**
 * Diccionario Exhaustivo de Términos Coloquiales, Jerga de Taller, Mostrador y Prefijos
 * Diseñado para resolver la búsqueda exacta con tan solo 2 o 3 caracteres.
 */
export interface ColloquialMapping {
  triggers: string[]; // Términos o prefijos disparadores (ej: 'fia', 'fiado', 'tir', 'tirilla')
  scenarioIds: string[]; // IDs de escenarios prioritarios
  expansionKeywords: string[]; // Palabras clave añadidas para enriquecer el contexto
}

export const COLLOQUIAL_DICTIONARY: ColloquialMapping[] = [
  // --- MOSTRADOR, POS & CAJA ---
  {
    triggers: ['fia', 'fiado', 'fiar', 'credito', 'cartera', 'plazo', 'cobrar despues'],
    scenarioIds: ['ESC-POS-15', 'ESC-CRM-12', 'ESC-CRM-13', 'ESC-CON-23', 'ESC-POS-04'],
    expansionKeywords: ['venta a credito', 'cupo disponible', 'bloqueo por mora', 'atp reservado', 'autorizacion cartera']
  },
  {
    triggers: ['tir', 'tirilla', 'ticket', 'papel', 'termica', 'imprimir copia', 'reimprimir'],
    scenarioIds: ['ESC-POS-05', 'ESC-POS-42', 'ESC-POS-43', 'ESC-CFG-35'],
    expansionKeywords: ['reimprimir tirilla turno', 'copia factura pos', 'impresora termica 80mm', 'atasco de papel', 'voucher']
  },
  {
    triggers: ['pis', 'pistola', 'laser', 'escaner', 'lector', 'codigo barras', 'escanear'],
    scenarioIds: ['ESC-INV-45', 'ESC-LOG-02', 'ESC-POS-08', 'ESC-INV-46'],
    expansionKeywords: ['pistolear producto', 'lector laser usb', 'pick and pack', 'codigo ilegible', 'pistola de codigo']
  },
  {
    triggers: ['z', 'cierre z', 'arqueo', 'cuadre', 'turno', 'ciego', 'cierre caja', 'denominacion'],
    scenarioIds: ['ESC-CON-01', 'ESC-CON-11', 'ESC-CON-12', 'ESC-POS-49', 'ESC-POS-50'],
    expansionKeywords: ['arqueo ciego billetes', 'cierre z definitivo', 'diferencia sobrante faltante', 'corte de turno', 'base de caja']
  },
  {
    triggers: ['vue', 'vuelto', 'devuelta', 'cambio', 'base', 'sencillo', 'monedas'],
    scenarioIds: ['ESC-POS-46', 'ESC-POS-47', 'ESC-CON-15'],
    expansionKeywords: ['base de efectivo apertura', 'cambio en efectivo', 'pedir sencillo a banco', 'vuelto al cliente']
  },
  {
    triggers: ['anu', 'anular', 'cancelar', 'quitar', 'borrar', 'reversar', 'papelera', 'limpiar'],
    scenarioIds: ['ESC-POS-03', 'ESC-POS-33', 'ESC-POS-34', 'ESC-CON-04', 'ESC-LOG-11'],
    expansionKeywords: ['anular producto carrito', 'cancelar orden antes cobro', 'nota credito devolucion', 'reversar ticket']
  },
  {
    triggers: ['mix', 'mixto', 'varios pagos', 'tarjeta y efectivo', 'transferencia y plata'],
    scenarioIds: ['ESC-POS-02', 'ESC-POS-23', 'ESC-POS-24'],
    expansionKeywords: ['cobro mixto multiple', 'desglose medios de pago', 'pago parcial transferencia', 'cuadre exacto']
  },
  {
    triggers: ['nit', 'cedula', 'rut', 'cliente sin nit', 'consumidor final', 'duplicado'],
    scenarioIds: ['ESC-POS-10', 'ESC-CRM-01', 'ESC-CRM-03', 'ESC-CFG-31'],
    expansionKeywords: ['crear cliente rut', 'facturar a consumidor final 222222222222', 'nit duplicado', 'datos fiscales']
  },

  // --- PRODUCCIÓN, TINTOMETRÍA & TALLER ---
  {
    triggers: ['for', 'formula', 'receta', 'mezcla', 'proporcion', 'batch', 'componentes'],
    scenarioIds: ['ESC-PRD-01', 'ESC-PRD-02', 'ESC-PRD-03', 'ESC-CFG-27'],
    expansionKeywords: ['crear formula nueva', 'clonar duplicar formula', 'porcentaje 100%', 'costo de batch resina']
  },
  {
    triggers: ['cuñ', 'cunete', 'caneca', 'balde', 'tambor', '5 galones', 'envase'],
    scenarioIds: ['ESC-PRD-40', 'ESC-LOG-05', 'ESC-INV-34', 'ESC-LOG-34'],
    expansionKeywords: ['cuñete pintura industrial', 'rotulado cuñete', 'descuento envase caneca', 'derrame en camion']
  },
  {
    triggers: ['gal', 'galon', 'litro', 'cuarto', 'presentacion', 'fraccion'],
    scenarioIds: ['ESC-INV-34', 'ESC-PRD-41', 'ESC-INV-35'],
    expansionKeywords: ['cambio de presentacion galon litro', 'fraccionamiento envases', 'etiqueta galon']
  },
  {
    triggers: ['thi', 'thinner', 'solvente', 'diluyente', 'disolvente', 'inflamable', 'quimico'],
    scenarioIds: ['ESC-PRD-10', 'ESC-LOG-04', 'ESC-INV-40', 'ESC-PRD-20'],
    expansionKeywords: ['thinner fino corriente', 'catalizador epoxico', 'hoja de seguridad msds', 'ajuste de viscosidad']
  },
  {
    triggers: ['bas', 'bascula', 'balanza', 'gramera', 'pesaje', 'gramos', 'tara', 'pesar'],
    scenarioIds: ['ESC-PRD-13', 'ESC-PRD-14', 'ESC-PRD-15', 'ESC-CFG-35'],
    expansionKeywords: ['me pase de gramos bascula', 'tara recipiente', 'calibrar balanza taller', 'pesaje pigmentos']
  },
  {
    triggers: ['mer', 'merma', 'desperdicio', 'derrame', 'residuo', 'evaporacion', 'perdida'],
    scenarioIds: ['ESC-PRD-16', 'ESC-INV-23', 'ESC-LOG-34'],
    expansionKeywords: ['reportar merma paila', 'derrame quimico piso', 'merma por evaporacion thinner', 'baja de inventario']
  },
  {
    triggers: ['sob', 'sobrante', 'exceso', 'demas', 'sobro'],
    scenarioIds: ['ESC-CON-14', 'ESC-PRD-14', 'ESC-INV-24'],
    expansionKeywords: ['sobrante en caja z', 'me pase de peso tintometria', 'sobrante en conteo fisico']
  },
  {
    triggers: ['fal', 'faltante', 'perdio', 'descuadre', 'falta'],
    scenarioIds: ['ESC-CON-13', 'ESC-LOG-03', 'ESC-INV-25', 'ESC-CFG-45'],
    expansionKeywords: ['faltante dinero caja', 'falto cuñete alistamiento', 'descuadre inventario fisico']
  },
  {
    triggers: ['col', 'color', 'tinte', 'pigmento', 'ral', 'pantone', 'espectro', 'matiz'],
    scenarioIds: ['ESC-PRD-30', 'ESC-PRD-31', 'ESC-PRD-32', 'ESC-LOG-55'],
    expansionKeywords: ['calibrar codigo color', 'plaqueta de prueba contramuestra', 'ajustar tono ojo', 'color equivocado reclamo']
  },

  // --- INVENTARIO, TRÁNSITO & KÁRDEX ---
  {
    triggers: ['lan', 'landed', 'flete compra', 'costo promedio', 'prorrateo', 'arancel'],
    scenarioIds: ['ESC-INV-01', 'ESC-INV-02', 'ESC-INV-03'],
    expansionKeywords: ['costo landed compras', 'prorrateo fletes internacionales', 'actualizacion costo unitario kardex']
  },
  {
    triggers: ['tra', 'transito', 'traslado', 'entre bodegas', 'camion viajando', 'remesa'],
    scenarioIds: ['ESC-INV-12', 'ESC-INV-13', 'ESC-INV-14', 'ESC-INV-04'],
    expansionKeywords: ['inventario en transito', 'traslado bodega paloquemao soacha', 'mercancia en camion bloqueada']
  },
  {
    triggers: ['con', 'conteo', 'ciclico', 'inventario fisico', 'auditoria stock', 'diferencia'],
    scenarioIds: ['ESC-INV-23', 'ESC-INV-24', 'ESC-INV-25', 'ESC-INV-02'],
    expansionKeywords: ['conteo ciclico fin de mes', 'ajuste kardex diferencia', 'inventario rotativo semanal']
  },
  {
    triggers: ['atp', 'reservado', 'comprometido', 'disponible', 'sobreventa'],
    scenarioIds: ['ESC-POS-04', 'ESC-CRM-35', 'ESC-INV-30'],
    expansionKeywords: ['stock disponible atp', 'unidades retenidas cotizacion', 'liberar reserva atp', 'evitar sobreventa']
  },

  // --- CONTABILIDAD, CAJA MENOR & BANCOS ---
  {
    triggers: ['cajm', 'caja menor', 'fondo fijo', 'gastos menores', 'taxi', 'aseo', 'reembolso'],
    scenarioIds: ['ESC-CON-02', 'ESC-CON-23', 'ESC-CON-24', 'ESC-CFG-36'],
    expansionKeywords: ['gasto imprevisto caja menor', 'recibo menor de 200k', 'reembolso fondo 1.5M', 'legalizacion gastos']
  },
  {
    triggers: ['dat', 'datafono', 'voucher', 'lote', 'tarjeta', 'bold', 'redaban', 'credibanco'],
    scenarioIds: ['ESC-CON-03', 'ESC-CON-34', 'ESC-CON-35', 'ESC-POS-23'],
    expansionKeywords: ['conciliar datafono extracto', 'voucher duplicado', 'cierre de lote datafono', 'comision financiera']
  },
  {
    triggers: ['sab', 'sabana', 'contadora', 'puc', 'asientos', 'auxiliar', 'diario'],
    scenarioIds: ['ESC-CON-05', 'ESC-CON-45', 'ESC-CFG-34'],
    expansionKeywords: ['sabana operativa excel', 'cuentas puc 4135 2408', 'informe contadora mensual', 'exportar balance prueba']
  },
  {
    triggers: ['sii', 'siigo', 'conector', 'api siigo', 'nube contable', 'cargue plano'],
    scenarioIds: ['ESC-CFG-33', 'ESC-CON-45', 'ESC-CFG-03'],
    expansionKeywords: ['sincronizar siigo cloud', 'token api siigo', 'cargue plano terceros', 'comprobante contable']
  },
  {
    triggers: ['dia', 'dian', 'resolucion', 'factura electronica', 'cufe', 'habilitacion'],
    scenarioIds: ['ESC-CFG-32', 'ESC-CON-46', 'ESC-POS-28'],
    expansionKeywords: ['resolucion dian facturacion', 'consecutivo dian por vencer', 'formulario 1876', 'xml factura']
  },
  {
    triggers: ['ant', 'anticipo', 'saldo a favor', 'cruce', 'abono previo'],
    scenarioIds: ['ESC-CON-25', 'ESC-CON-26', 'ESC-CRM-23'],
    expansionKeywords: ['cruce anticipo factura', 'recibo de caja previo', 'saldo a favor cliente']
  },

  // --- LOGÍSTICA & DESPACHOS ---
  {
    triggers: ['pic', 'picking', 'alistamiento', 'muelle', 'recoger', 'pasillo', 'hoja picking'],
    scenarioIds: ['ESC-LOG-01', 'ESC-LOG-02', 'ESC-LOG-03', 'ESC-LOG-10'],
    expansionKeywords: ['orden alistamiento picking', 'recoger en racks bodega', 'picking consolidado ruta', 'urgencia obra']
  },
  {
    triggers: ['pac', 'pack', 'empaque', 'zuncho', 'embalaje', 'bulto', 'estiba'],
    scenarioIds: ['ESC-LOG-02', 'ESC-LOG-04', 'ESC-LOG-05', 'ESC-LOG-06'],
    expansionKeywords: ['pick and pack escanear', 'embalar quimicos solventes', 'bulto 1 de 3 rotulo', 'consolidar tarima']
  },
  {
    triggers: ['pod', 'cumplido', 'rem', 'remision', 'firma obra', 'sello', 'foto entrega'],
    scenarioIds: ['ESC-LOG-24', 'ESC-LOG-33', 'ESC-LOG-02', 'ESC-LOG-30'],
    expansionKeywords: ['foto remision firmada', 'cumplido pod celular', 'sello recibido obra', 'legalizar cumplidos fisica']
  },
  {
    triggers: ['fle', 'flete', 'camion', 'furgon', 'turbo', 'transportadora', 'envia', 'coordinadora'],
    scenarioIds: ['ESC-LOG-13', 'ESC-LOG-14', 'ESC-LOG-18', 'ESC-LOG-21'],
    expansionKeywords: ['flete camion contratado', 'transportadora nacional guia', 'limite de peso kg', 'cobro flete cliente']
  },
  {
    triggers: ['oti', 'otif', 'tiempo', 'efectividad', 'indicador', 'cumplimiento despacho'],
    scenarioIds: ['ESC-LOG-45', 'ESC-LOG-49', 'ESC-LOG-46'],
    expansionKeywords: ['indicador otif on time in full', 'productividad conductores', 'costo por galon entregado']
  },

  // --- CONFIGURACIÓN, ROLES & SCARPIAN AI ---
  {
    triggers: ['rol', 'rbac', 'permiso', 'bloquear', 'cajero contabilidad', 'acceso'],
    scenarioIds: ['ESC-CFG-01', 'ESC-CFG-02', 'ESC-CFG-05', 'ESC-CFG-06'],
    expansionKeywords: ['quitar contabilidad a cajero', 'restringir roles rbac', 'crear rol auxiliar', 'aislamiento cartera']
  },
  {
    triggers: ['cla', 'clave', 'password', 'contraseña', 'olvido', 'bloqueado', 'pin'],
    scenarioIds: ['ESC-CFG-03', 'ESC-CFG-08', 'ESC-CFG-09', 'ESC-CFG-10'],
    expansionKeywords: ['resetear clave olvidada', 'desbloquear cuenta intentos', 'forzar cierre sesiones', 'pin rapido caja']
  },
  {
    triggers: ['com', 'comision', 'bono', 'meta', 'umbral', 'tabla porcentajes', 'acelerador'],
    scenarioIds: ['ESC-CFG-11', 'ESC-CFG-12', 'ESC-CFG-13', 'ESC-CFG-14', 'ESC-CFG-17'],
    expansionKeywords: ['modificar tabla comisiones', 'umbral minimo 80%', 'liquidar quincena comisiones', 'recaudo real vs factura']
  },
  {
    triggers: ['bit', 'bitacora', 'log', 'quien borro', 'auditoria', 'forense', 'inmutable'],
    scenarioIds: ['ESC-CFG-21', 'ESC-CFG-22', 'ESC-CFG-23', 'ESC-CFG-29'],
    expansionKeywords: ['quien anulo factura bitacora', 'auditoria inmutable eventos', 'revisoria fiscal hash', 'merkle tree']
  },
  {
    triggers: ['tic', 'ticket', 'foto error', 'captura', 'bug', 'scarpian', 'soporte tecnico', 'ayuda'],
    scenarioIds: ['ESC-CFG-41', 'ESC-CFG-42', 'ESC-CFG-43', 'ESC-CFG-47'],
    expansionKeywords: ['widget fotos problema', 'radicar ticket scarpian ai', 'capturar pantalla nota', 'pin teleasistencia']
  },
  {
    triggers: ['off', 'offline', 'sin internet', 'caida red', 'fuera linea', 'contingencia'],
    scenarioIds: ['ESC-CFG-39', 'ESC-CFG-40', 'ESC-CFG-48'],
    expansionKeywords: ['facturar sin internet pos', 'modo offline local', 'sincronizar despues conexion', 'white screen']
  }
];

/**
 * Resultado evaluado con puntuación de relevancia para el ranking predictivo.
 */
export interface ScoredScenario {
  scenario: HumanScenario;
  score: number;
  matchedTrigger?: string;
  matchedField: 'id' | 'trigger' | 'title' | 'synonym' | 'subtopic' | 'content';
}

/**
 * Motor Predictivo de Búsqueda Sub-Milisegundo:
 * - Soporta consultas ultra-cortas (2 a 3 letras: "fia", "tir", "z", "cuñ", "thi", "bas", etc.)
 * - Expande términos mediante el diccionario coloquial de Procoquinal SAS
 * - Ordena por relevancia algorítmica ponderada
 */
export const searchScenariosPredictive = (
  rawQuery: string,
  scenarios: HumanScenario[],
  limit: number = 8
): ScoredScenario[] => {
  if (!rawQuery || rawQuery.trim().length === 0) {
    return scenarios.slice(0, limit).map(s => ({
      scenario: s,
      score: 1,
      matchedField: 'title'
    }));
  }

  const query = normalizeSearchText(rawQuery);
  const queryTokens = query.split(/\s+/).filter(Boolean);

  // 1. Detectar si la consulta activa algún disparador del diccionario coloquial
  const triggeredMappings: ColloquialMapping[] = [];
  for (const mapping of COLLOQUIAL_DICTIONARY) {
    const isTriggered = mapping.triggers.some(t => {
      const normTrigger = normalizeSearchText(t);
      return normTrigger.startsWith(query) || query.startsWith(normTrigger) || normTrigger.includes(query);
    });
    if (isTriggered) {
      triggeredMappings.push(mapping);
    }
  }

  // Recolectar IDs priorizados por jerga coloquial
  const priorityScenarioIds = new Set<string>();
  triggeredMappings.forEach(m => m.scenarioIds.forEach(id => priorityScenarioIds.add(id)));

  // Palabras expandidas por contexto
  const expansionWords = triggeredMappings.flatMap(m => m.expansionKeywords.map(normalizeSearchText));

  // 2. Puntuar cada escenario contra la consulta y expansiones
  const scoredList: ScoredScenario[] = [];

  for (const scenario of scenarios) {
    let score = 0;
    let matchedField: ScoredScenario['matchedField'] = 'content';
    let matchedTrigger: string | undefined = undefined;

    const normId = normalizeSearchText(scenario.id);
    const normTitle = normalizeSearchText(scenario.title);
    const normSubtopic = normalizeSearchText(scenario.subtopic);
    const normModule = normalizeSearchText(scenario.module);
    const normSynonyms = scenario.synonyms.map(normalizeSearchText);
    const normSummary = normalizeSearchText(scenario.summary);

    // A. Coincidencia Exacta de ID (ej: "ESC-POS-01" o "pos-01")
    if (normId === query || normId.replace('-', '').includes(query.replace('-', ''))) {
      score += 1000;
      matchedField = 'id';
    }

    // B. Prioridad Máxima por Disparador Coloquial / Jerga
    if (priorityScenarioIds.has(scenario.id)) {
      score += 1500;
      matchedField = 'trigger';
      matchedTrigger = triggeredMappings[0]?.triggers[0];
    }

    // C. Coincidencia en Título (priorizando inicio de palabra y coincidencia exacta)
    const titleWords = normTitle.split(/[\s,()¿?¡!/.-]+/).filter(Boolean);
    const hasWordExactQuery = titleWords.some(w => w === query);
    const hasWordStartingWithQuery = titleWords.some(w => w.startsWith(query));

    if (hasWordExactQuery) {
      score += 900;
      if (score < 1500) matchedField = 'title';
    } else if (hasWordStartingWithQuery) {
      score += 500;
      if (score < 1500) matchedField = 'title';
    } else if (query.length > 2 && normTitle.includes(query)) {
      score += 200;
      if (score < 1500) matchedField = 'title';
    } else if (query.length > 2) {
      // Coincidencia token por token en el título
      const titleMatches = queryTokens.filter(tok => normTitle.includes(tok)).length;
      if (titleMatches > 0) {
        score += titleMatches * 80;
        if (score < 1500) matchedField = 'title';
      }
    }

    // D. Coincidencia en Sinónimos
    for (const syn of normSynonyms) {
      const synWords = syn.split(/[\s,()¿?¡!/.-]+/).filter(Boolean);
      if (synWords.some(w => w === query)) {
        score += 850;
        if (score < 1500) matchedField = 'synonym';
        break;
      } else if (synWords.some(w => w.startsWith(query))) {
        score += 450;
        if (score < 1500) matchedField = 'synonym';
        break;
      } else if (query.length > 2 && syn.includes(query)) {
        score += 150;
        if (score < 1500) matchedField = 'synonym';
        break;
      }
    }

    // E. Coincidencia con palabras expandidas del diccionario
    for (const exp of expansionWords) {
      if (normTitle.includes(exp) || normSynonyms.some(s => s.includes(exp))) {
        score += 120;
        break;
      }
    }

    // F. Coincidencia en Subtema o Módulo
    if (normSubtopic.includes(query) || normModule.includes(query)) {
      score += 90;
      if (score < 200) matchedField = 'subtopic';
    }

    // G. Coincidencia en Resumen o Pasos
    if (normSummary.includes(query)) {
      score += 50;
    }

    if (score > 0) {
      scoredList.push({
        scenario,
        score,
        matchedField,
        matchedTrigger
      });
    }
  }

  // 3. Ordenar por puntuación descendente y aplicar límite
  scoredList.sort((a, b) => b.score - a.score);
  return scoredList.slice(0, limit);
};
