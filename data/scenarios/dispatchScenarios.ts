import { HumanScenario } from './types';

export const DISPATCH_SCENARIOS: HumanScenario[] = [
  // =========================================================================
  // SUBTEMA 1: Alistamiento, Picking & Packing en Muelle (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-LOG-01',
    title: '¿Cómo generar la Orden de Alistamiento (Picking List) optimizada por pasillos de bodega?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Agrupa pedidos aprobados y genera la ruta de recogida ordenada por posición de rack (Pasillo/Nivel).',
    expectedResult: 'El auxiliar de bodega recoge los productos en una sola pasada sin retroceder ni cruzar pasillos innecesariamente.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['picking list', 'orden de alistamiento', 'hoja de picking', 'recoger pedidos bodega', 'alistamiento muelle'],
    summary: 'Planificación de la recolección física de latas, cuñetes y accesorios en la bodega para preparar los envíos del día.',
    steps: [
      {
        title: 'Acceder a "Despachos & Logística > Tablero de Despachos"',
        instruction: 'Navega en el menú a la pantalla de despachos (/dispatch).'
      },
      {
        title: 'Seleccionar los pedidos en estado "PENDIENTE"',
        instruction: 'Marca las órdenes de venta que deben salir en la primera ruta de la mañana.'
      },
      {
        title: 'Presionar "Generar Picking Consolidado"',
        instruction: 'Avalon emitirá la hoja de alistamiento agrupando los productos por ubicación física en estantería (ej: primero solventes en Pasillo 1, luego esmaltes en Pasillo 3).'
      },
      {
        title: 'Entregar la planilla al operario de muelle',
        instruction: 'El auxiliar carga la carretilla siguiendo el orden de la lista para trasladar los ítems a la mesa de empaque.',
        proTip: 'El picking agrupado reduce el tiempo de alistamiento de pedidos en un 40% en bodegas de más de 500 m².'
      }
    ],
    contingency: 'Si un operario reporta que una posición de rack está vacía, activa de inmediato la verificación de stock en Kárdex (ESC-LOG-03).'
  },
  {
    id: 'ESC-LOG-02',
    title: '¿Cómo realizar el escaneo con lector de código de barras durante el empaque (Pick & Pack)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal `PickPackModal` exige pistolear el código de barras de cada producto antes de autorizar la remisión.',
    expectedResult: 'El sistema valida que no se empaque ninguna referencia equivocada ni falten unidades prometidas.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['pick and pack', 'escanear empaque', 'pistolear despacho', 'verificar pedido empaque', 'control de despacho laser'],
    summary: 'Auditoría óptica obligatoria en muelle para garantizar cero errores en el despacho de colores y referencias químicas.',
    steps: [
      {
        title: 'Abrir el pedido en estado "ARMANDO_PEDIDO"',
        instruction: 'En el Tablero de Despachos, haz clic en el ícono de paquete (Pick & Pack) sobre la orden a preparar.'
      },
      {
        title: 'Pistolear el código de barras de cada lata',
        instruction: 'Pasa el lector láser sobre el sticker de cada producto. El contador en pantalla avanzará (ej: 3 de 5 escaneados).'
      },
      {
        title: 'Alerta sonora ante producto equivocado',
        instruction: 'Si el auxiliar intenta pistolear un cuñete de color Blanco Hueso en vez de Blanco Nieve, el sistema emitirá un pitido de alerta en rojo bloqueando el avance.',
        warning: 'Esta validación es el filtro más crítico para evitar reclamos costosos de flete por pintura equivocada en obra.'
      },
      {
        title: 'Cerrar el empaque al completar el 100%',
        instruction: 'Cuando todas las barras estén en verde, presiona "Cerrar Empaque & Generar Rótulo". La orden pasará a "LISTO PARA DESPACHO".'
      }
    ],
    contingency: 'Si una etiqueta física tiene el código de barras roto, digita el SKU alfanumérico en el campo manual de contingencia.'
  },
  {
    id: 'ESC-LOG-03',
    title: '¿Qué hacer si falta un producto durante el alistamiento en bodega (quiebre en muelle)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite despacho parcial con saldo pendiente en backorder o sustitución técnica aprobada por el asesor.',
    expectedResult: 'El camión no se retrasa; sale con lo disponible y se programa la entrega prioritaria del saldo faltante.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['quiebre de stock muelle', 'falta producto alistamiento', 'no hay stock fisico despacho', 'faltante en bodega empaque'],
    summary: 'Procedimiento de emergencia cuando el software indicaba existencias pero físicamente no se encuentran los tarros en el estante.',
    steps: [
      {
        title: 'Reportar la novedad en la pantalla de Pick & Pack',
        instruction: 'En el modal de alistamiento, pulsa el botón "Reportar Novedad de Faltante" sobre el ítem ausente.'
      },
      {
        title: 'Opciones de resolución comercial:',
        instruction: '1. Despacho Parcial: Despachar las unidades presentes y dejar el saldo en entrega pendiente para mañana.\n2. Sustitución Técnica: Reemplazar por presentación equivalente (ej: si falta 1 cuñete de 5 GL, sustituir por 5 galones individuales con aval del cliente).'
      },
      {
        title: 'Notificar al asesor comercial de la cuenta',
        instruction: 'El sistema enviará una alerta automática al vendedor para que informe al cliente antes de que llegue el camión.'
      },
      {
        title: 'Disparar recuento cíclico inmediato en Kárdex',
        instruction: 'Avalon generará una orden de ajuste cíclico para que el jefe de bodega investigue por qué el sistema tenía saldo fantasma.',
        proTip: 'Comunicar el faltante antes de que el camión arribe a la obra evita que el cliente rechace la totalidad del pedido.'
      }
    ],
    contingency: 'Si la fábrica puede mezclar el lote faltante en menos de 2 horas, retén la orden para la segunda ruta de la tarde.'
  },
  {
    id: 'ESC-LOG-04',
    title: '¿Cómo rotular y zunchar estibas de cuñetes pesados para transporte seguro?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera rótulo de estiba Master Pallet Label con peso total en kilogramos y centro de gravedad seguro.',
    expectedResult: 'La carga queda asegurada mecánicamente evitando que los cuñetes se deslicen o vuelquen durante las curvas en carretera.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['zunchar estiba', 'embalaje cuñetes', 'pallet de pintura', 'rotulo de estiba', 'estiba pesada', 'vinipel estiba'],
    summary: 'Normas de empaque y estibado para el transporte seguro de recipientes químicos de 5 galones (aprox. 25 kg cada uno).',
    steps: [
      {
        title: 'Configurar el patrón de apilamiento en la estiba de madera',
        instruction: 'Coloca máximo 3 niveles de altura (máximo 12 a 16 cuñetes por estiba estándar de 1.20 x 1.00 m) para no exceder la resistencia de las tapas.'
      },
      {
        title: 'Aplicar zuncho plástico de alta resistencia y esquineros de cartón',
        instruction: 'Coloca esquineros verticales y asegura con 2 zunchos transversales y 2 longitudinales tensados con la máquina zunchadora.'
      },
      {
        title: 'Envolver con plástico termoencogible (Película Stretch / Vinipel)',
        instruction: 'Aplica al menos 5 capas de película stretch comenzando desde la base de la madera para anclar la carga a la estiba.'
      },
      {
        title: 'Pegar el rótulo Master Pallet Label emitido por Avalon V1',
        instruction: 'Adhiere en dos caras opuestas de la estiba el sticker con número de remisión, peso total (ej: 400 kg) y destino.',
        warning: 'Transportar cuñetes sueltos sin estiba zunchada en furgones ocasiona el 80% de los derrames por frenadas bruscas.'
      }
    ],
    contingency: 'Si la estiba de madera presenta tablas rotas o clavos salidos, cámbiala antes de montar el producto.'
  },
  {
    id: 'ESC-LOG-05',
    title: '¿Cómo separar y rotular solventes inflamables como mercancía peligrosa (SGA / ONU)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Detecta automáticamente productos inflamables (UN 1263 / UN 1993) e imprime rótulo de transporte de sustancias peligrosas.',
    expectedResult: 'El despacho cumple con el Decreto 1609 del Ministerio de Transporte sobre transporte terrestre de mercancías peligrosas.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['mercancia peligrosa', 'un 1263', 'transporte solventes', 'decreto 1609', 'rotulo llama inflamable', 'hoja de seguridad transporte'],
    summary: 'Protocolo de seguridad legal obligatorio para el despacho de thinners, catalizadores isocianatos y alcoholes.',
    steps: [
      {
        title: 'Verificar el código ONU del producto en la orden',
        instruction: 'Las pinturas y solventes clasificados como inflamables llevan el código UN 1263 (Líquidos Inflamables Clase 3).'
      },
      {
        title: 'Imprimir la Tarjeta de Emergencia de Transporte (Tarjeta Roja)',
        instruction: 'En Avalon V1, presiona "Imprimir Tarjeta de Emergencia / FDS Transporte". El documento debe entregarse al conductor del camión.'
      },
      {
        title: 'Separación física dentro del vehículo',
        instruction: 'Nunca estibes solventes volátiles junto a catalizadores reactivos o pinturas al agua que puedan sufrir contaminación por vapores.'
      },
      {
        title: 'Verificar el rombo de seguridad Clase 3 en el exterior del camión',
        instruction: 'El camión debe portar las placas metálicas con el rombo rojo (Llama líquida Clase 3) y el número 1263 en las cuatro caras del vehículo.',
        warning: 'Mover solventes sin tarjeta de emergencia ni placas ONU acarrea la inmovilización inmediata del vehículo por la Policía de Carreteras.'
      }
    ],
    contingency: 'Asegúrate de que el vehículo porte el kit reglamentario de carretera para sustancias químicas (pala antichispa, absorbente y extintor multipropósito de 20 lbs).'
  },
  {
    id: 'ESC-LOG-06',
    title: '¿Cómo controlar el peso bruto y cubicaje (m³) antes de autorizar el cargue del camión?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Sumatoria automática de peso neto, peso bruto con envase y volumen m³ con alerta de sobrepeso.',
    expectedResult: 'El camión viaja con su capacidad de carga óptima sin sobrepeso que genere multas en básculas viales de Invías.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['peso del camion', 'cubicaje despacho', 'sobrepeso bascula invias', 'capacidad carga camion', 'kilos despacho'],
    summary: 'Cálculo de ingeniería logística para balancear la carga vehicular y evitar sobrepasar los límites de peso por eje.',
    steps: [
      {
        title: 'Consultar la tarjeta de capacidad del camión asignado',
        instruction: 'Ejemplo: Camión Turbo NPR - Capacidad de carga útil legal: 4.500 Kilogramos / Volumen de furgón: 18 m³.'
      },
      {
        title: 'Revisar el consolidado de la ruta en Avalon V1',
        instruction: 'En el encabezado de la ruta, el sistema mostrará: "Peso Total Consolidado: 3.820 Kg (85% de capacidad) | Volumen: 12.4 m³ (69%)".'
      },
      {
        title: 'Validar la barra de semáforo de peso',
        instruction: '• Verde: Carga segura (<90%).\n• Amarillo: Al límite (90% - 100%).\n• Rojo: SOBREPESO (>100%): El sistema bloqueará la emisión de la planilla de despacho hasta retirar pedidos.'
      },
      {
        title: 'Distribuir el peso sobre los ejes del furgón',
        instruction: 'Indica a los cargadores ubicar los cuñetes más pesados cerca del eje central y delantero del vehículo, no en el voladizo trasero.',
        proTip: 'Una buena distribución de peso alarga la vida útil de los neumáticos y ahorra hasta un 12% de combustible en ruta.'
      }
    ],
    contingency: 'Si la ruta excede la capacidad por 300 kg, traslada el pedido más pesado a la siguiente ruta para evitar sanciones en báscula.'
  },
  {
    id: 'ESC-LOG-07',
    title: '¿Cómo acondicionar cuartos y galones en cajas corrugadas reforzadas para empresas de paqueteo?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo Packing genera etiqueta de paqueteo individual con número de guía y flechas de orientación ("Este lado arriba").',
    expectedResult: 'Las latas viajan protegidas contra caídas en las cintas transportadoras de Servientrega, Envía o TCC.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['embalaje paqueteo', 'cajas para pintura', 'enviar por servientrega lata', 'embalaje envia', 'caja corrugada pintura'],
    summary: 'Empaque de alta resistencia exigido por transportadoras comerciales para admitir líquidos químicos en encomienda.',
    steps: [
      {
        title: 'Inspeccionar el sellado hermético de los tapones',
        instruction: 'Verifica con el martillo de goma que las tapas de los galones y cuartos estén 100% ajustadas a ras del aro metálico.'
      },
      {
        title: 'Insertar las latas en cajas con separadores de cartón',
        instruction: 'Utiliza cajas corrugadas de doble pared con separadores internos tipo celda (4 galones por caja o 12 cuartos por caja).'
      },
      {
        title: 'Rellenar espacios vacíos con material amortiguador',
        instruction: 'Coloca plástico de burbuja o viruta en los espacios libres para que las latas no choquen entre sí.'
      },
      {
        title: 'Sellar con cinta de seguridad y adherir rótulos de orientación',
        instruction: 'Sella las aletas con cinta adhesiva de 3 pulgadas en patrón de "H" y pega los stickers de "LÍQUIDO FRÁGIL" y "ESTE LADO ARRIBA" (Flechas negras hacia arriba).',
        warning: 'Las transportadoras no responden por averías si la caja no lleva los pictogramas de orientación de flechas.'
      }
    ],
    contingency: 'Coloca cada lata dentro de una bolsa plástica sellada individual antes de meterla a la caja como contención ante fugas accidentales.'
  },
  {
    id: 'ESC-LOG-08',
    title: '¿Cómo asignar y registrar precintos de seguridad numerados en compuertas de camiones?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Campo dedicado `securitySealNumber` obligatorio antes de marcar el camión como "EN_RUTA".',
    expectedResult: 'Se previene la apertura no autorizada del furgón durante el trayecto, garantizando que nadie extraiga producto.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['precinto de seguridad', 'sello compuerta camion', 'sello plastico furgon', 'control antirobo camion', 'candado seguridad despacho'],
    summary: 'Procedimiento de control de seguridad para furgones de reparto intermunicipal para evitar robos hormiga en carretera.',
    steps: [
      {
        title: 'Cerrar las compuertas traseras y laterales del furgón',
        instruction: 'Una vez completado el cargue en muelle, baja las varillas de cierre de la carrocería.'
      },
      {
        title: 'Colocar el precinto plástico o metálico numerado',
        instruction: 'Inserta el vástago del precinto a través de las manijas de cierre y presiona firmemente hasta escuchar el clic de bloqueo.'
      },
      {
        title: 'Digitar el número de serie del precinto en Avalon V1',
        instruction: 'En la pantalla de despacho del camión, ingresa el código alfanumérico grabado en el precinto (ej: SELLO-PQ-88412).'
      },
      {
        title: 'Imprimir la planilla con el número de sello',
        instruction: 'La guía de despacho llevará impreso el número de precinto para que el cliente receptor verifique que el sello llegó intacto antes de abrir.',
        warning: 'Si el camión llega con el precinto roto o con número diferente, el cliente tiene instrucción de no recibir la carga.'
      }
    ],
    contingency: 'En rutas con entregas múltiples urbanas, se usan precintos reutilizables con candado satelital electrónico.'
  },
  {
    id: 'ESC-LOG-09',
    title: '¿Cómo verificar la estanqueidad de tapas en cuñetes para evitar fugas por vibración?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Lista de chequeo de calidad en muelle (Quality Gate) obligatoria antes de estibar.',
    expectedResult: 'Cero derrames durante el viaje por carreteras destapadas o con resaltos pronunciados.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['estanqueidad cuñetes', 'fugas por vibracion', 'tapas sueltas pintura', 'revision calidad muelle', 'control derrames carga'],
    summary: 'Inspección física preventiva para detectar tapas mal ajustadas antes de que los recipientes sean cargados al vehículo.',
    steps: [
      {
        title: 'Revisar el precinto plástico de la tapa del cuñete',
        instruction: 'Asegúrate de que la lengüeta de desgarre esté intacta y que el aro de cierre esté completamente embutido en la pestaña del balde.'
      },
      {
        title: 'Prueba de presión suave sobre la tapa',
        instruction: 'Presiona el centro de la tapa con la mano; no debe escucharse silbido de escape de aire ni presentar deformación elástica excesiva.'
      },
      {
        title: 'Verificar la posición vertical de transporte',
        instruction: 'Los cuñetes de pintura NUNCA deben transportarse acostados de lado, sin importar el espacio disponible en el furgón.',
        warning: 'Transportar un cuñete acostado garantiza que la pintura buscará la junta del empaque y se derramará por la vibración del motor.'
      },
      {
        title: 'Marcar el check de estanqueidad en Avalon V1',
        instruction: 'En la lista de alistamiento, confirma: "Estanqueidad y Tapas Verificadas: OK".'
      }
    ],
    contingency: 'Si un cuñete presenta holgura en la tapa, devuélvelo al taller para cambio de tapa con la máquina cerradora neumática.'
  },
  {
    id: 'ESC-LOG-10',
    title: '¿Cómo alistar pedidos combinados (pinturas líquidas + abrasivos y brochas secas)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Separa la orden en dos bultos: "Bulto Líquidos Pesados" y "Bulto Mercancía Seca Liviana" con rótulos independientes.',
    expectedResult: 'Los rodillos, lijas y cintas de enmascarar no se aplastan bajo los cuñetes pesados de pintura.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['pedido combinado', 'separar liquidos de secos', 'empaque lijas y pintura', 'embalaje mixto', 'proteger brochas'],
    summary: 'Organización física inteligente para evitar que productos frágiles o livianos sufran daños por aplastamiento en el camión.',
    steps: [
      {
        title: 'Identificar la composición mixta del pedido',
        instruction: 'Avalon desglosará la orden en dos secciones: Químicos Líquidos (Galones/Cuñetes) y Accesorios Secos (Lijas, Cintas, Espátulas, Brochas).'
      },
      {
        title: 'Empacar los accesorios secos en caja de cartón independiente',
        instruction: 'Coloca las lijas y cintas en su propia caja rotulada con la leyenda: "BULTO 2 DE 2 - MERCANCÍA SECA".'
      },
      {
        title: 'Regla de estiba en el vehículo:',
        instruction: 'Los cuñetes y galones pesados van sobre el piso de la carrocería; las cajas de brochas y lijas se ubican en la parte superior sobre los cuñetes o en los gaveteros superiores.',
        proTip: 'Nunca coloques un cuñete de 25 kg encima de una caja de cinta de enmascarar; la aplastará dejándola inservible.'
      },
      {
        title: 'Generar la remisión con indicación de 2 bultos',
        instruction: 'La guía de despacho imprimirá: "Total Bultos: 2 (1 Estiba Líquidos + 1 Caja Accesorios)".'
      }
    ],
    contingency: 'Si el cliente solo recibe la estiba de pintura y olvida la caja de lijas, el conductor debe verificar el conteo total de bultos antes de despedirse.'
  },
  {
    id: 'ESC-LOG-11',
    title: '¿Cómo cancelar o desarmar un alistamiento antes de cargar al camión por cambio del cliente?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Alistamiento, Picking & Packing',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Desarmar Alistamiento / Devolver a Estantería" cancela el Pick & Pack y devuelve el stock al estado listo en bodega.',
    expectedResult: 'Los productos se reintegran a sus pasillos originales y la orden se reprograma sin descuadrar inventarios.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['desarmar alistamiento', 'cancelar empaque muelle', 'cliente pidio aplazar entrega', 'desarmar pedido preparado', 'cancelar pick pack'],
    summary: 'Reversión rápida cuando el cliente llama de última hora a cancelar o postergar el despacho de su pedido.',
    steps: [
      {
        title: 'Recibir la solicitud de cancelación antes del cargue',
        instruction: 'Verifica que el camión no haya salido del muelle de planta.'
      },
      {
        title: 'Abrir la orden en el Tablero de Despachos',
        instruction: 'Localiza la tarjeta en la columna "LISTO PARA DESPACHO".'
      },
      {
        title: 'Hacer clic en "Desarmar Alistamiento / Retornar a Rack"',
        instruction: 'Presiona el botón de reversión e ingresa la justificación (ej: "Cliente Don Mario solicitó aplazar entrega para el lunes").'
      },
      {
        title: 'Retirar los zunchos y devolver los productos a sus racks',
        instruction: 'El auxiliar de bodega devuelve cada lata a su pasillo correspondiente según la hoja de desarmado.',
        warning: 'No dejes pedidos cancelados ocupando espacio en el muelle de alistamiento para evitar confusiones con otras rutas.'
      }
    ],
    contingency: 'Si la orden incluía pinturas tinturadas a pedido especial, trasládalas a la zona de "Pedidos Reservados en Espera" para no mezclarlas con stock comercial.'
  },

  // =========================================================================
  // SUBTEMA 2: Programación de Rutas, Vehículos & Fletes (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-LOG-12',
    title: '¿Cómo agrupar pedidos geográficamente por zonas de entrega (Norte, Sur, Occidente)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Filtro inteligente por Zonas Geográficas (Bogotá Norte, Bogotá Sur, Calle 80 Industrial, Autopista Sur) para armar rutas eficientes.',
    expectedResult: 'El camión realiza un circuito continuo sin cruzar la ciudad de lado a lado en horas pico.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['agrupar por zonas', 'rutas de despacho', 'reparto geografico', 'zonas bogota entrega', 'planificar ruta camión'],
    summary: 'Agrupación lógica de entregas urbanas para minimizar tiempos de viaje, consumo de combustible y peajes.',
    steps: [
      {
        title: 'Filtrar pedidos listos por zona de despacho',
        instruction: 'En el Tablero de Despachos, selecciona el filtro geográfico (ej: "Zona Occidente / Calle 80 - Cota - Siberia").'
      },
      {
        title: 'Seleccionar los pedidos de esa franja',
        instruction: 'Marca todas las órdenes de ferreterías y talleres ubicados a lo largo del mismo corredor vial.'
      },
      {
        title: 'Presionar "Crear Ruta Consolidada"',
        instruction: 'Avalon creará la ruta asignándole un código (ej: RUTA-OCC-2026-04).'
      },
      {
        title: 'Ordenar las paradas en secuencia lógica',
        instruction: 'Ordena la entrega desde el punto más lejano hacia el más cercano a la planta (o viceversa) para optimizar el retorno.',
        proTip: 'Entregar los pedidos más pesados primero reduce el esfuerzo del motor del camión en el resto de la jornada.'
      }
    ],
    contingency: 'Si queda un pedido aislado en una zona distante, evalúa enviarlo por mensajería en moto o con transportadora de paqueteo.'
  },
  {
    id: 'ESC-LOG-13',
    title: '¿Cómo asignar un vehículo de la flota propia según su capacidad de carga (Turbo vs. Sencillo)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Catálogo de flota propia con placas, tonelaje máximo y volumen m³ con validación automática.',
    expectedResult: 'Se asigna el camión idóneo para el peso de la ruta evitando sobrecargar furgones pequeños.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['asignar camion', 'flota propia procoquinal', 'camion turbo npr', 'camion sencillo', 'elegir vehiculo despacho'],
    summary: 'Selección técnica del vehículo adecuado según el tonelaje y dimensiones de los recipientes a transportar.',
    steps: [
      {
        title: 'Revisar el peso total de la ruta creada',
        instruction: 'Ejemplo: Ruta con 120 cuñetes de pintura = 3.000 Kilogramos de carga neta.'
      },
      {
        title: 'Seleccionar el camión adecuado en el desplegable:',
        instruction: '• Camioneta Chana / Carry: Hasta 800 Kg (para pedidos express de galones pequeños).\n• Camión Turbo NPR: Hasta 4.500 Kg (para rutas urbanas estándar de cuñetes).\n• Camión Sencillo 2 Ejes: Hasta 8.500 Kg (para grandes suministros de tambores y distribuidores).'
      },
      {
        title: 'Asignar el conductor titular',
        instruction: 'Elige el chofer asignado a ese vehículo con su número de celular corporativo.'
      },
      {
        title: 'Confirmar la asignación vehicular',
        instruction: 'Presiona "Asignar Vehículo y Generar Manifiesto".',
        warning: 'Nunca asignes 4 toneladas a una camioneta pequeña; genera riesgo de volcamiento y pérdida de la garantía de la póliza.'
      }
    ],
    contingency: 'Si el camión asignado presenta falla mecánica matutina, reasigna la ruta a otro vehículo con el botón "Cambiar Vehículo".'
  },
  {
    id: 'ESC-LOG-14',
    title: '¿Cómo programar y despachar pedidos intermunicipales (Villavicencio, Tunja, Girardot)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera Manifiesto de Carga Intermunicipal con cálculo de peajes, viáticos y tiempos de viaje.',
    expectedResult: 'El vehículo sale con toda la documentación reglamentaria para superar retenes de la Policía de Tránsito.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['despacho intermunicipal', 'viaje fuera de bogota', 'manifiesto de carga', 'despacho villavicencio', 'entrega nacional'],
    summary: 'Planificación de viajes de reparto de mediana distancia saliendo de la planta de Bogotá hacia departamentos cercanos.',
    steps: [
      {
        title: 'Agrupar pedidos del corredor intermunicipal',
        instruction: 'Filtra las órdenes con destino a municipios del mismo eje vial (ej: Cáqueza, Guayabetal, Villavicencio, Acacías).'
      },
      {
        title: 'Crear el Manifiesto Electrónico de Carga (RNDCT)',
        instruction: 'Avalon compilará la información reglamentaria del Ministerio de Transporte: Placa, Conductor, Remitente, Destinatario y Flete.'
      },
      {
        title: 'Asignar viáticos de viaje al conductor',
        instruction: 'En coordinación con Caja Menor (ESC-CON-16), entrega los recursos para peajes, combustible y alimentación del chofer.'
      },
      {
        title: 'Comprobar el estado del corredor vial antes de salir',
        instruction: 'Consulta en la web de Invías (#767) si la vía Bogotá-Villavicencio o Bogotá-Tunja presenta cierres programados o derrumbes.',
        proTip: 'Programar la salida a las 4:30 AM permite sortear el tráfico de salida de la ciudad y llegar a primera hora a la obra.'
      }
    ],
    contingency: 'Si la carretera presenta cierre total por derrumbe, reprograma la salida y avisa de inmediato a los clientes de la ruta.'
  },
  {
    id: 'ESC-LOG-15',
    title: '¿Cómo despachar mediante transportadoras de paqueteo externas (Envía, Servientrega, TCC)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra transportadora externa, número de guía de seguimiento y enlace de tracking online para el cliente.',
    expectedResult: 'El cliente recibe por correo y WhatsApp su número de guía para rastrear el camión de la transportadora.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['transportadora externa', 'guia servientrega', 'guia envia', 'guia tcc', 'paqueteo nacional', 'despacho por encomienda'],
    summary: 'Envío de pedidos a ciudades intermedias o municipios distantes donde Procoquinal no opera con camiones propios.',
    steps: [
      {
        title: 'Seleccionar tipo de transporte: "Transportadora Externa / Paqueteo"',
        instruction: 'En la orden de despacho, elige la empresa convenida (ej: Envía Colvanes, Servientrega o Coordinadora Mercantil).'
      },
      {
        title: 'Digitar el número de guía de la transportadora',
        instruction: 'Ingresa el número de radicado de la guía física o electrónica (ej: Guía Envía #012893847).'
      },
      {
        title: 'Adjuntar la copia de la guía firmada por el recolector',
        instruction: 'Cuando el camión de Envía recoja las cajas en el muelle de Procoquinal, fotografía la planilla firmada y súbela a Avalon V1.'
      },
      {
        title: 'Enviar notificación de tracking al cliente',
        instruction: 'Presiona "Notificar Despacho al Cliente". Avalon enviará un mensaje automático con el enlace de rastreo directo en la web de la transportadora.',
        proTip: 'El cliente podrá ver en vivo si su pedido está en tránsito, en bodega de destino o en reparto local.'
      }
    ],
    contingency: 'Si la transportadora pierde la caja en su centro de distribución, utiliza el número de guía registrado para tramitar la indemnización.'
  },
  {
    id: 'ESC-LOG-16',
    title: '¿Cómo generar e imprimir la Guía Oficial de Despacho y Remisión en PDF?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Función `buildDispatchPdfDoc` genera documento formal en formato A4 con membrete, tabla de productos y firmas.',
    expectedResult: 'Se imprimen las dos copias reglamentarias (Copia Cliente y Copia Cumplido de Conductor) antes de que el camión arranque.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['imprimir remision despacho', 'guia de transporte pdf', 'orden de entrega pdf', 'remision oficial procoquinal', 'hoja de ruta pdf'],
    summary: 'Expedición del soporte físico de transporte que acompaña la mercancía durante su recorrido por carretera.',
    steps: [
      {
        title: 'Localizar la orden en el Tablero de Despachos',
        instruction: 'Haz clic en el ícono de ojo (Preview) sobre la tarjeta del despacho.'
      },
      {
        title: 'Revisar la vista previa del documento PDF generado',
        instruction: 'Comprueba los datos: Membrete PROCOQUINAL S.A.S., Número de Guía, Cliente, Dirección de Entrega, Teléfono de Contacto, Placa del Vehículo, Conductor y Lista de Pinturas con cantidades y pesos.'
      },
      {
        title: 'Imprimir 2 copias físicas en papel',
        instruction: 'Presiona "Imprimir Guía Oficial". El conductor llevará:\n• Copia 1: Para el cliente al momento de la entrega.\n• Copia 2: Para Procoquinal con firma y sello de recibido (Cumplido de Cartera).'
      },
      {
        title: 'Entregar la carpeta de ruta al conductor',
        instruction: 'Entrega las remisiones junto con las facturas electrónicas y certificados de calidad de los lotes.',
        warning: 'Ningún camión debe salir de la portería de planta sin portar las remisiones físicas impresas.'
      }
    ],
    contingency: 'Si se modifica la cantidad de un producto antes de salir, regenera e imprime nuevamente la guía con la versión actualizada.'
  },
  {
    id: 'ESC-LOG-17',
    title: '¿Cómo sortear restricciones vehiculares urbanas (Pico y Placa ambiental de carga)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Calendario de Pico y Placa de carga integrado por último dígito de placa con alertas de horario.',
    expectedResult: 'El despachador programa los vehículos en los días y horarios legalmente autorizados por la Secretaría de Movilidad.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['pico y placa carga', 'restriccion ambiental camion', 'horario carga bogota', 'alerta pico y placa camion'],
    summary: 'Gestión de la circulación vehicular para evitar comparendos e inmovilizaciones de camiones de reparto en Bogotá.',
    steps: [
      {
        title: 'Verificar la placa del camión programado',
        instruction: 'Revisa el último dígito de la placa del vehículo (ej: Placa WNV-482 = Dígito 2).'
      },
      {
        title: 'Comprobar el calendario ambiental de carga en Avalon V1',
        instruction: 'El sistema indicará si el camión tiene restricción ese día según su año de modelo (vehículos de más de 20 años tienen restricción ampliada de 6:00 AM a 12:00 PM y de 5:00 PM a 10:00 PM).'
      },
      {
        title: 'Ajustar la ventana de salida del camión',
        instruction: 'Programa el cargue en muelle para salir antes de las 5:30 AM o después de las 9:00 AM según la zona de la ciudad.'
      },
      {
        title: 'Asignar un camión alterno de modelo reciente si es urgente',
        instruction: 'Si el cliente exige entrega en hora de restricción, asigna el furgón nuevo que no tiene restricción ambiental.',
        warning: 'Una inmovilización por Pico y Placa detiene las entregas de todo el día y genera pérdidas económicas en grúa y patios.'
      }
    ],
    contingency: 'En días de Alerta Ambiental Fase 1 decretada por el Distrito, consulta las restricciones extraordinarias en el módulo de noticias de Avalon.'
  },
  {
    id: 'ESC-LOG-18',
    title: '¿Cómo liquidar y auditar fletes cobrados por transportadores terceros independientes?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra flete pactado contra remisiones entregadas cruzando valor por tonelada o viaje contratado.',
    expectedResult: 'Se audita la cuenta de cobro del transportador contra los cumplidos reales antes de autorizar el pago en Tesorería.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['liquidar fletes', 'pago transportador tercero', 'cuenta de cobro flete', 'auditoria fletes camiones', 'costo flete viaje'],
    summary: 'Control de pagos a camioneros contratados por viaje para asegurar que solo se cancelen los viajes efectivamente cumplidos.',
    steps: [
      {
        title: 'Recibir la cuenta de cobro del transportador independiente',
        instruction: 'El chofer radica su planilla con las remisiones firmadas por los clientes que visitó.'
      },
      {
        title: 'Abrir el módulo de Liquidación de Fletes en Avalon V1',
        instruction: 'Ve a "Despachos > Liquidación de Transportistas".'
      },
      {
        title: 'Cruzar las remisiones físicas contra el sistema',
        instruction: 'Verifica que cada entrega coincida en estado "ENTREGADO". Si una entrega fue fallida por culpa del transportador, se deduce el porcentaje correspondiente.'
      },
      {
        title: 'Aprobar la orden de pago del flete',
        instruction: 'Avalon emitirá el comprobante de liquidación de transporte con retención en la fuente por fletes (1.0%) lista para giro bancario.',
        proTip: 'Esta auditoría previene pagos duplicados de fletes por viajes que no se completaron.'
      }
    ],
    contingency: 'Si el transportador causó una avería por golpe en un cuñete, descuenta el valor del producto dañado de la liquidación del flete.'
  },
  {
    id: 'ESC-LOG-19',
    title: '¿Cómo reprogramar una ruta en vivo ante un cierre vial o accidente en carretera?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite alterar el orden de paradas en tiempo real y notificar al chofer mediante su aplicación móvil.',
    expectedResult: 'El camión toma una ruta alterna atendiendo primero a los clientes de zonas despejadas.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['reprogramar ruta en vivo', 'accidente carretera desvio', 'via cerrada despacho', 'cambiar orden entregas', 'desvio camion'],
    summary: 'Respuesta ágil a contingencias de tráfico vehicular urbano e intermunicipal para no perder el día de reparto.',
    steps: [
      {
        title: 'Recibir el reporte del conductor varado en tráfico',
        instruction: 'El chofer comunica por radio o celular que la Autopista Sur presenta bloqueo total por accidente vial.'
      },
      {
        title: 'Abrir la ruta activa en el Tablero de Despachos',
        instruction: 'Ubica el camión en la columna "EN_TRANSITO".'
      },
      {
        title: 'Invertir la secuencia de las paradas',
        instruction: 'Mueve las entregas de Soacha para el final de la tarde y adelanta las entregas del sector de Bosa y Kennedy por vías alternas.'
      },
      {
        title: 'Avisar a los clientes sobre el nuevo horario de arribo',
        instruction: 'Envía un mensaje rápido a los clientes afectados informando el desvío por contingencia vial.',
        proTip: 'La flexibilidad en la reprogramación evita que un camión quede atrapado 4 horas en un trancón con entregas urgentes a bordo.'
      }
    ],
    contingency: 'Si el cierre de vía es absoluto y no hay desvío posible, autoriza al camión a retornar a planta para no exponer la carga en la noche.'
  },
  {
    id: 'ESC-LOG-20',
    title: '¿Cómo gestionar un despacho de extrema urgencia ("Mismo Día / Express") para una obra parada?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Etiqueta "DESPACHO EXPRÉS / URGENCIA CRÍTICA" que prioriza el pedido en muelle y asigna vehículo liviano.',
    expectedResult: 'La pintura llega a la cabina del cliente en menos de 3 horas, salvando al taller de multas por retraso de entrega.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['despacho urgente', 'entrega mismo dia', 'obra parada pintura urgente', 'despacho express moto', 'emergencia cliente taller'],
    summary: 'Servicio de respuesta exprés para atender paradas de línea en talleres industriales o constructoras aliadas.',
    steps: [
      {
        title: 'Recibir la solicitud crítica de Gerencia Comercial',
        instruction: 'El cliente comunica que su línea de pintura automotriz está frenada por falta de 2 galones de catalizador especial.'
      },
      {
        title: 'Marcar la orden con prioridad "URGENCIA CRÍTICA"',
        instruction: 'En Avalon V1, activa la insignia roja de prioridad exprés. El pedido saltará al primer lugar de la fila de alistamiento en muelle.'
      },
      {
        title: 'Asignar a vehículo liviano o mensajero en moto',
        instruction: 'No esperes a llenar un camión grande; asigna la camioneta de respuesta rápida o el mensajero de planta.'
      },
      {
        title: 'Monitorear la entrega minuto a minuto',
        instruction: 'Realiza seguimiento hasta que el mensajero confirme la entrega en las manos del jefe de taller.',
        proTip: 'Resolver una urgencia crítica de obra parada consolida la lealtad del cliente por años.'
      }
    ],
    contingency: 'Si el flete exprés tiene costo adicional acordado con el cliente, inclúyelo en la factura de venta en mostrador.'
  },
  {
    id: 'ESC-LOG-21',
    title: '¿Cómo auditar la documentación y estado del conductor (Licencia, SOAT, ARL) antes de salir?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Validador de seguridad en portería que bloquea la salida si el SOAT, Tecnomecánica o ARL están vencidos.',
    expectedResult: 'Se garantiza que ningún camión circule de forma ilegal o sin cobertura de seguro de accidentes laborales.',
    route: '/dispatch',
    routeLabel: 'Ir a Tablero de Despachos',
    synonyms: ['seguridad conductor', 'soat vencido camion', 'tecnomecanica furgon', 'arl conductor carga', 'control porteria salida'],
    summary: 'Inspección de seguridad y cumplimiento legal en la portería de planta antes de autorizar la apertura de la reja.',
    steps: [
      {
        title: 'Presentar la planilla de despacho al vigilante de portería',
        instruction: 'El guarda escanea el código QR de la remisión en la tableta de seguridad de la portería.'
      },
      {
        title: 'Validación automática del estado de los documentos:',
        instruction: 'El sistema comprobará en tiempo real:\n• Licencia de conducción del chofer (Categoría C2 o C3 vigente).\n• SOAT y Revisión Técnico-Mecánica del vehículo al día.\n• Planilla de pago de Seguridad Social (ARL Nivel 4 o 5 para transporte de químicos).'
      },
      {
        title: 'Inspección física rápida en portería',
        instruction: 'El vigilante verifica: Luces direccionales, estado visual de las llantas, extintor vigente y uso de botas de seguridad.'
      },
      {
        title: 'Apertura de la reja de salida',
        instruction: 'Si el semáforo de Avalon marca verde, el vigilante sella la remisión y autoriza la salida del furgón.',
        warning: 'Si el SOAT está vencido, el sistema bloqueará la salida; el camión no puede abandonar la planta bajo ninguna circunstancia.'
      }
    ],
    contingency: 'Si el chofer titular tiene la licencia vencida, asigna inmediatamente al conductor de relevo de la planta.'
  },

  // =========================================================================
  // SUBTEMA 3: Entregas en Obra, Cumplidos & Firmas Digitales (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-LOG-22',
    title: '¿Cómo registrar la entrega exitosa con fotografía de remisión firmada y sellada?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Registrar Cumplido / Entrega" permite capturar foto con la cámara del celular y cerrar la orden en tiempo real.',
    expectedResult: 'La orden pasa a estado "ENTREGADO", la foto queda archivada en la nube y se habilita el cobro de la factura en Cartera.',
    route: '/dispatch',
    routeLabel: 'Ir al Tablero de Despachos',
    synonyms: ['registrar cumplido', 'remision firmada foto', 'entrega exitosa', 'cerrar despacho entregado', 'prueba de entrega pod'],
    summary: 'Cierre del ciclo logístico mediante la captura digital de la evidencia documental de recibo a satisfacción.',
    steps: [
      {
        title: 'Hacer firmar y sellar la remisión en papel por el cliente',
        instruction: 'El encargado de la obra debe estampar: Sello de la empresa, Firma legible, Cédula y Fecha exacta de recibo.'
      },
      {
        title: 'Abrir el Tablero de Despachos desde el teléfono móvil',
        instruction: 'El conductor localiza la orden en la columna "EN_TRANSITO" y pulsa "Registrar Entrega".'
      },
      {
        title: 'Tomar la fotografía clara de la remisión física',
        instruction: 'Captura la imagen enfocando el sello y las firmas; la foto debe ser nítida y sin sombras que tapen los números.'
      },
      {
        title: 'Digitar el nombre de quien recibió y confirmar',
        instruction: 'Escribe: "Recibido por Ing. Carlos Mendoza (Jefe de Obra)" y presiona "Guardar Cumplido".',
        proTip: 'Esta foto queda visible al segundo para el equipo contable de Procoquinal para radicar la factura de cobro.'
      }
    ],
    contingency: 'Si el teléfono del chofer se quedó sin señal en sótano de obra, la foto se guarda en memoria local y sincroniza al salir a la superficie.'
  },
  {
    id: 'ESC-LOG-23',
    title: '¿Qué hacer si en la obra no hay quién reciba la mercancía o el contacto no contesta el celular?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Protocolo de espera de 15 minutos con llamada de escalamiento a Comercial y registro de intento fallido.',
    expectedResult: 'Se evita que el camión quede atrapado todo el día esperando y se reprograma la entrega con cobro de segundo flete.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['obra cerrada', 'cliente no contesta celular', 'no hay quien reciba', 'espera en obra camion', 'sitio cerrado entrega'],
    summary: 'Actuación reglamentaria del conductor cuando llega a la dirección de destino y no encuentra al personal autorizado para recibir.',
    steps: [
      {
        title: 'Realizar 3 llamadas al contacto principal y esperar 15 minutos',
        instruction: 'El chofer marca al celular del residente de obra registrado en la remisión y espera en la puerta.'
      },
      {
        title: 'Escalar al asesor comercial de Procoquinal',
        instruction: 'Si a los 15 minutos no hay respuesta, el chofer llama al vendedor para que contacte a la gerencia del cliente.'
      },
      {
        title: 'Tomar fotografía de la fachada de la obra cerrada',
        instruction: 'Captura foto del portón cerrado con la placa del camión visible como evidencia de que el vehículo sí llegó al sitio a la hora acordada.'
      },
      {
        title: 'Marcar en Avalon V1: "Intento Fallido - Sitio Cerrado"',
        instruction: 'El sistema registrará la novedad con geolocalización GPS y autorizará al camión a continuar con los siguientes clientes de la ruta.',
        warning: 'Nunca descargues pintura en la portería o con vigilantes sin que firmen la remisión de responsabilidad.'
      }
    ],
    contingency: 'La mercancía regresa a planta y se reprograma la entrega para el día siguiente aplicando el cobro del reenvío según política comercial.'
  },
  {
    id: 'ESC-LOG-24',
    title: '¿Cómo gestionar una entrega con descargue manual en pisos altos sin ascensor de carga?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Política de entrega en primer piso muelle a nivel; cobro de acarreo manual interno si se solicita subir escaleras.',
    expectedResult: 'El cliente asume la cuadrilla de descargue interno o cancela el servicio extraordinario de acarreo.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['subir pintura piso alto', 'descargue escaleras', 'acarreo manual obra', 'subir cuñetes piso 4', 'entrega en altura'],
    summary: 'Límites de responsabilidad del transporte de Procoquinal respecto al movimiento vertical de carga pesada dentro de edificios.',
    steps: [
      {
        title: 'Aclarar la política de transporte estándar de Procoquinal',
        instruction: 'El flete comercial cubre la entrega en el muelle de descarga o primer piso a pie de camión.'
      },
      {
        title: 'Si el cliente exige subir cuñetes por escaleras al piso 5',
        instruction: 'El chofer explica que por normas de seguridad y salud en el trabajo (SST), los conductores no pueden realizar acarreos de 25 kg por escaleras sin equipo especial.'
      },
      {
        title: 'Opciones de solución en sitio:',
        instruction: '1. El cliente dispone de sus propios auxiliares o maestros de obra para subir la pintura.\n2. Si el conductor y su ayudante acceden voluntariamente fuera de horario laboral, se tramita el cobro adicional de acarreo manual.'
      },
      {
        title: 'Firmar la remisión en el primer piso',
        instruction: 'La entrega legal concluye cuando el cliente recibe y firma las unidades a pie de camión.',
        warning: 'Subir cuñetes pesados por escaleras estrechas genera riesgo de accidentes lumbares y caídas de pintura que manchen las áreas comunes.'
      }
    ],
    contingency: 'En obras grandes, exige con antelación que el cliente tenga habilitada la pluma grúa o el malacate de carga.'
  },
  {
    id: 'ESC-LOG-25',
    title: '¿Qué hacer si el cliente firma la remisión con salvedad ("Recibido con lata abollada o falta 1 galón")?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite registrar "Cumplido con Salvedad", descontando la unidad dañada y notificando a Calidad de inmediato.',
    expectedResult: 'Se acepta la salvedad por escrito, se firma la remisión por las unidades conformes y se tramita el reemplazo exprés.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['remision con salvedad', 'recibido con observaciones', 'cliente anoto en remision', 'llegaron latas golpeadas entrega', 'salvedad firma'],
    summary: 'Procedimiento reglamentario cuando el receptor detecta averías o faltantes menores en el momento de la descarga.',
    steps: [
      {
        title: 'Inspeccionar la avería junto con el cliente',
        instruction: 'Revisa si la lata golpeada tiene fuga de pintura o si solo es una deformación estética de la hojalata.'
      },
      {
        title: 'Permitir que el cliente anote la observación en la remisión',
        instruction: 'El cliente debe escribir: "Se reciben 19 cuñetes conformes y 1 cuñete averiado por golpe en transporte que se devuelve con el camión".'
      },
      {
        title: 'Tomar fotografía de la anotación y del producto dañado',
        instruction: 'Sube ambas fotos a la pantalla de cumplido en Avalon V1.'
      },
      {
        title: 'Reingresar la lata averiada al camión y traer a planta',
        instruction: 'El chofer no deja el producto dañado en la obra; lo regresa para que Almacén lo ingrese a Cuarentena y Contabilidad emita la Nota Crédito o reposición.',
        proTip: 'Nunca discutas con el cliente en muelle; aceptar la salvedad con respeto protege la relación comercial a largo plazo.'
      }
    ],
    contingency: 'Envía el galón de reemplazo en la ruta de la tarde para que la obra no sufra demoras en su cronograma de pintura.'
  },
  {
    id: 'ESC-LOG-26',
    title: '¿Cómo capturar la firma digital táctil del cliente en la aplicación móvil de despachos?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Lienzo táctil (Signature Pad) que captura la firma digital sobre la pantalla del celular con sello de geolocalización.',
    expectedResult: 'Se genera el comprobante digital de entrega sin necesidad de imprimir papel físico.',
    route: '/dispatch',
    routeLabel: 'Ir al Tablero de Despachos',
    synonyms: ['firma digital entrega', 'firmar en pantalla celular', 'comprobante digital pod', 'signature pad despacho', 'entrega sin papel'],
    summary: 'Tecnología sin papel (Paperless) para capturar la conformidad del cliente directamente en la pantalla táctil del transportador.',
    steps: [
      {
        title: 'Abrir el pedido a entregar en el celular del conductor',
        instruction: 'En Avalon V1 móvil, presiona "Firmar Entrega Digital".'
      },
      {
        title: 'Mostrar el resumen del pedido al receptor',
        instruction: 'El cliente visualiza en pantalla: Nombre del cliente, Lista de productos, Lotes entregados y Total de unidades.'
      },
      {
        title: 'Presentar el lienzo de firma digital al cliente',
        instruction: 'El cliente traza su firma con el dedo o lápiz óptico en el recuadro blanco.'
      },
      {
        title: 'Digitar nombre legible y número de cédula',
        instruction: 'Ingresa los datos personales del receptor y presiona "Confirmar Entrega".',
        proTip: 'Avalon insertará la firma vectorial en el PDF de la remisión y enviará una copia automática al correo del cliente.'
      }
    ],
    contingency: 'Si la pantalla del celular está mojada o el cliente prefiere papel, utiliza la remisión física impresa de respaldo.'
  },
  {
    id: 'ESC-LOG-27',
    title: '¿Cómo proceder ante una entrega a un tercero autorizado (vigilante o maestro pintor)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Campo "Receptor Autorizado" exige nombre, documento de identidad, parentesco/cargo y foto de la cédula.',
    expectedResult: 'La entrega queda debidamente legalizada evitando que el comprador desconozca posteriormente el recibo de la mercancía.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['entrega a tercero', 'recibio el vigilante', 'recibio el pintor', 'entrega autorizada', 'firma tercero remision'],
    summary: 'Procedimiento de entrega cuando el titular de la cuenta no está físicamente en el predio y delega la recepción.',
    steps: [
      {
        title: 'Verificar la autorización previa',
        instruction: 'Consulta si en las notas del pedido en Avalon V1 el cliente anotó: "Autorizado para recibir Maestro Pedro Pérez C.C. 19.450.222".'
      },
      {
        title: 'Solicitar la cédula física del receptor en sitio',
        instruction: 'Comprueba que el nombre y documento del tercero coincidan exactamente con la persona autorizada.'
      },
      {
        title: 'Hacer firmar la remisión especificando su cargo',
        instruction: 'El receptor debe anotar: Firma, Cédula legible, Teléfono y Cargo (ej: "Vigilante de Turno - Empresa Sevicol" o "Pintor Contratista").'
      },
      {
        title: 'Tomar fotografía del receptor junto a la carga descargada',
        instruction: 'Captura la foto donde se aprecien los cuñetes en el piso y el personal receptor.',
        warning: 'Nunca entregues mercancía a personas que no se identifiquen con cédula física o que se nieguen a firmar el documento.'
      }
    ],
    contingency: 'Si la persona no está autorizada, comunícate con el cliente titular antes de descargar para que envíe autorización por WhatsApp.'
  },
  {
    id: 'ESC-LOG-28',
    title: '¿Cómo ejecutar el protocolo de cobro obligatorio en entregas Contra Entrega (COD)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bloqueo de confirmación que impide cerrar el despacho si no se adjunta el comprobante de pago o efectivo recibido.',
    expectedResult: 'El dinero queda recaudado en el mismo instante en que se entrega la pintura, garantizando cero riesgo de cartera.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['cobro contra entrega chofer', 'cobrar al descargar', 'chofer recibe efectivo', 'pago cod entrega', 'recaudo conductor'],
    summary: 'Operación financiera de mostrador móvil donde el conductor tiene la responsabilidad de cobrar antes de entregar la carga.',
    steps: [
      {
        title: 'Identificar la orden con distintivo "COBRO CONTRA ENTREGA"',
        instruction: 'En la planilla del camión, el pedido figurará con la etiqueta roja de recaudo obligatorio por valor exacto (ej: $1.850.000 COP).'
      },
      {
        title: 'Solicitar el pago antes de romper los precintos del furgón',
        instruction: 'Indica al cliente: "Don Jorge, buenos días; traemos su pedido de 6 cuñetes. Por favor prepare el efectivo o realice la transferencia para proceder al descargue".'
      },
      {
        title: 'Si paga en efectivo: Contar billete por billete',
        instruction: 'El conductor cuenta el dinero en presencia del cliente y verifica billetes con detector portátil.'
      },
      {
        title: 'Si paga por transferencia QR Bancolombia / Daviplata',
        instruction: 'El cliente escanea el QR corporativo de Procoquinal; el chofer llama a Tesorería para confirmar la acreditación de los fondos.'
      },
      {
        title: 'Descargar el producto y firmar la remisión',
        instruction: 'Una vez confirmado el dinero, se bajan los cuñetes y se entrega la copia del recibo de caja de mostrador.',
        warning: 'Si el chofer descarga la pintura antes de cobrar y el cliente se niega a pagar, el valor del flete y producto es responsabilidad del chofer.'
      }
    ],
    contingency: 'Si el cliente manifiesta que no tiene la plata hoy, el chofer no descarga y devuelve la mercancía a planta.'
  },
  {
    id: 'ESC-LOG-29',
    title: '¿Qué hacer si la dirección de entrega no existe o el camión no cabe por la calle?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite acordar "Punto de Transbordo Cercano" con geolocalización o retorno de carga a planta.',
    expectedResult: 'Se resuelve el obstáculo físico de acceso sin arriesgar el vehículo en calles empinadas o con cables bajos.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['direccion no existe', 'camion no cabe calle', 'calle estrecha entrega', 'cables bajos camion', 'calle empinada descarga'],
    summary: 'Contingencia de acceso urbano cuando la infraestructura de la zona impide que un camión de carga pesada llegue hasta la puerta.',
    steps: [
      {
        title: 'Evaluar el riesgo vial en sitio',
        instruction: 'El conductor detecta que la calle es un callejón sin salida muy estrecho, con cables eléctricos a baja altura o pendiente resbaladiza.'
      },
      {
        title: 'No forzar el vehículo en situaciones de peligro',
        instruction: 'Detén el camión en una avenida principal segura y no intentes maniobras riesgosas que puedan ocasionar volcamientos o daños a casas vecinas.'
      },
      {
        title: 'Llamar al cliente y acordar punto de transbordo',
        instruction: 'Propón: "Don Mario, el camión no cabe por el callejón de su taller; estamos parqueados en la esquina de la Calle 13. ¿Puede acercar una camioneta pequeña para hacer el transbordo aquí?".'
      },
      {
        title: 'Hacer el transbordo y firmar la remisión en el punto acordado',
        instruction: 'Transfiere los cuñetes al vehículo del cliente y haz firmar la remisión con la anotación: "Entregado por transbordo en esquina Calle 13 por restricción de acceso vial".',
        proTip: 'Esta solución colaborativa evita el retraso de la obra y protege la integridad de la flota.'
      }
    ],
    contingency: 'Si el cliente no tiene vehículo de apoyo ni auxiliares, se reprograma la entrega para enviarla en una camioneta Carry más pequeña.'
  },
  {
    id: 'ESC-LOG-30',
    title: '¿Cómo cumplir con las ventanas horarias restringidas de descargue en centros comerciales?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Campo "Ventana Horaria Estricta" que programa la parada para horarios nocturnos o de madrugada (ej: 5:00 AM - 7:00 AM).',
    expectedResult: 'El vehículo llega puntualmente dentro del horario autorizado por la administración del centro comercial.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['ventana horaria centro comercial', 'descargue nocturno', 'horario restringido entrega', 'entrega centro comercial', 'permiso descargue'],
    summary: 'Planificación de entregas para locales comerciales o constructoras con reglamentos de propiedad horizontal estrictos.',
    steps: [
      {
        title: 'Identificar el requerimiento de ventana horaria en el pedido',
        instruction: 'Revisa las condiciones especiales: "Centro Comercial Unicentro - Muelle de carga habilitado únicamente de 6:00 AM a 7:30 AM".'
      },
      {
        title: 'Tramitar con 24 horas de antelación los permisos de ingreso',
        instruction: 'Envía a la administración del centro comercial: Cédulas de conductor y ayudante, planilla de ARL vigente y placas del camión.'
      },
      {
        title: 'Programar el despacho como primera parada obligatoria',
        instruction: 'En Avalon V1, fija la hora de salida de planta para que el vehículo esté en la rampa de descargue 15 minutos antes de la apertura del muelle.'
      },
      {
        title: 'Descarga rápida y retiro del vehículo',
        instruction: 'Descarga con zorra hidráulica y retira el camión antes del horario límite de apertura al público.',
        warning: 'Llegar 15 minutos tarde a un centro comercial implica perder el permiso de descargue de todo el día.'
      }
    ],
    contingency: 'Si la administración no autoriza el ingreso por mantenimiento de ascensores, reprograma para la siguiente ventana autorizada.'
  },
  {
    id: 'ESC-LOG-31',
    title: '¿Cómo radicar los cumplidos físicos en el departamento de Cartera para iniciar el cobro?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo de Cierre de Ruta que concilia las remisiones físicas entregadas contra el sistema y las transfiere a Cartera.',
    expectedResult: 'Cartera recibe los soportes originales para radicar ante los departamentos de cuentas por pagar de los clientes.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['radicar cumplidos', 'entrega remisiones cartera', 'cierre de ruta conductor', 'liquidar ruta entrega', 'radicacion facturas obra'],
    summary: 'Rito de retorno de los conductores al final del día donde entregan los documentos físicos que respaldan la cobranza.',
    steps: [
      {
        title: 'Retorno del camión a la planta de Procoquinal',
        instruction: 'El chofer parquea en el muelle y entrega su carpeta de viaje al Coordinador de Despachos.'
      },
      {
        title: 'Revisar la carpeta remisión por remisión',
        instruction: 'El coordinador verifica que cada guía tenga firma, sello y cédula. En Avalon V1, presiona "Cerrar Ruta y Transferir a Cartera".'
      },
      {
        title: 'Entrega física mediante Acta de Custodia',
        instruction: 'Se pasan los documentos físicos al área de Cartera y Cobranzas mediante planilla de entrega con fecha y hora.'
      },
      {
        title: 'Radicación en portales de clientes institucionales',
        instruction: 'Cartera sube los cumplidos a los portales corporativos de los clientes para que comiencen a correr los 30 días de plazo para pago.',
        proTip: 'Un cumplido radicado el mismo día de la entrega asegura que el cliente pague su factura en el plazo previsto sin demoras.'
      }
    ],
    contingency: 'Si un chofer extravía la remisión física original, debe regresar a la obra al día siguiente a solicitar copia firmada y sellada.'
  },
  {
    id: 'ESC-LOG-32',
    title: '¿Cómo enviar avisos automáticos por WhatsApp al cliente informando que el camión va en camino?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Entregas en Obra & Cumplidos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Notificar Salida WhatsApp" que envía mensaje prediseñado con placa, nombre del chofer y hora estimada.',
    expectedResult: 'El cliente prepara la zona de descarga y al personal receptor, reduciendo el tiempo de espera del camión en obra.',
    route: '/dispatch',
    routeLabel: 'Ir al Tablero de Despachos',
    synonyms: ['aviso whatsapp camion', 'camion en camino whatsapp', 'notificar entrega cliente', 'tiempo estimado llegada eta', 'alerta despacho whatsapp'],
    summary: 'Comunicación proactiva con los compradores para asegurar una recepción ágil sin contratiempos.',
    steps: [
      {
        title: 'Marcar el pedido como "EN_TRANSITO"',
        instruction: 'Cuando el camión sale de la portería de planta, presiona el botón de cambio de estado a en tránsito.'
      },
      {
        title: 'Hacer clic en el ícono de WhatsApp en la tarjeta del despacho',
        instruction: 'Se abrirá WhatsApp Web con el mensaje preformateado dirigido al contacto de obra.'
      },
      {
        title: 'Revisar el mensaje automático:',
        instruction: '"Hola [Nombre Cliente], su pedido de pintura de Procoquinal SAS va en camino en el camión de placas [Placa] conducido por [Nombre Chofer]. Hora estimada de llegada: [ETA]. Por favor tener listo el personal para descargue".'
      },
      {
        title: 'Enviar mensaje con un clic',
        instruction: 'El cliente confirmará de inmediato, garantizando que el muelle de su taller esté desocupado al arribar el vehículo.',
        proTip: 'Esta pequeña acción reduce los tiempos muertos de descarga de 45 minutos a menos de 15 minutos por cliente.'
      }
    ],
    contingency: 'Si el cliente no tiene WhatsApp, el sistema permite enviar el mismo texto como mensaje SMS tradicional.'
  },

  // =========================================================================
  // SUBTEMA 4: Rechazos, Devoluciones en Muelle & Novedades (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-LOG-33',
    title: '¿Cómo registrar una Entrega Fallida con Devolución cuando el cliente rechaza el pedido?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "ENTREGA_FALLIDA" en DispatchModule que registra la causal y genera la orden de reingreso a bodega.',
    expectedResult: 'La mercancía no se pierde de vista, se mantiene en custodia del camión y se prepara su reingreso al Kárdex de planta.',
    route: '/dispatch',
    routeLabel: 'Ir al Tablero de Despachos',
    synonyms: ['entrega fallida', 'cliente rechazo pedido', 'devolucion en entrega', 'rechazo mercancia chofer', 'fallo de despacho'],
    summary: 'Protocolo de registro ante el rechazo total de un pedido en la puerta de la obra o taller del comprador.',
    steps: [
      {
        title: 'Identificar la causal del rechazo en sitio',
        instruction: 'Pregunta al encargado por qué no recibe (ej: "Error en el color solicitado", "Obra suspendida por lluvia", "Factura con datos tributarios erróneos").'
      },
      {
        title: 'En el Tablero de Despachos, marcar estado "ENTREGA_FALLIDA"',
        instruction: 'Cambia el estado de la orden a Entrega Fallida.'
      },
      {
        title: 'Diligenciar el formulario de novedad logística',
        instruction: 'Selecciona la causal en el menú desplegable y escribe las observaciones dictadas por el receptor.'
      },
      {
        title: 'Asegurar el producto dentro del camión',
        instruction: 'Vuelve a trincar la carga con los zunchos para el retorno a planta.',
        warning: 'Nunca dejes producto descargado si el cliente no firmó la remisión de recibido conforme.'
      }
    ],
    contingency: 'El sistema enviará una notificación urgente al asesor comercial para que intervenga de inmediato con la gerencia del cliente.'
  },
  {
    id: 'ESC-LOG-34',
    title: '¿Cómo gestionar una Devolución Parcial en obra (cliente recibe 8 galones y devuelve 2)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite modificar cantidades entregadas (ej: 8 de 10) y emite automáticamente la solicitud de Nota Crédito por los 2 restantes.',
    expectedResult: 'El cliente paga o asume solo lo recibido y las unidades devueltas reingresan formalmente al Kárdex.',
    route: '/dispatch',
    routeLabel: 'Ir al Tablero de Despachos',
    synonyms: ['devolucion parcial obra', 'cliente devolvio 2 galones', 'recibo parcial despacho', 'novedad cantidad entrega', 'ajuste remision obra'],
    summary: 'Ajuste en caliente cuando el cliente solo requiere una fracción del pedido y devuelve el excedente con el mismo camión.',
    steps: [
      {
        title: 'Verificar el estado de las unidades devueltas',
        instruction: 'Comprueba que los 2 galones devueltos estén completamente sellados, limpios y sin haber sido abiertos.'
      },
      {
        title: 'Modificar la cantidad en la pantalla de entrega en Avalon V1',
        instruction: 'En la orden móvil, digita "Cantidad Entregada: 8" y "Cantidad Devuelta: 2".'
      },
      {
        title: 'Anotar en la remisión física de puño y letra',
        instruction: 'El cliente debe escribir: "Se reciben 8 galones a satisfacción; se devuelven 2 galones sellados por ajuste de metraje". Ambas partes firman.'
      },
      {
        title: 'Disparo de la Nota Crédito Parcial automática',
        instruction: 'Al confirmar en Avalon, el sistema creará la solicitud de Nota Crédito en Contabilidad por el valor de los 2 galones devueltos (ESC-POS-36).',
        proTip: 'Esto evita que el cliente reciba una factura por 10 galones cuando físicamente solo se quedó con 8.'
      }
    ],
    contingency: 'Al llegar a planta, el chofer entrega los 2 galones al almacenista para que se le selle la planilla de devolución.'
  },
  {
    id: 'ESC-LOG-35',
    title: '¿Qué hacer ante una avería de producto causada por volcamiento o frenada brusca en el camión?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo de Siniestro en Transporte genera Acta de Avería en Ruta con afectación al seguro de carga.',
    expectedResult: 'Se da de baja el producto derramado en el Kárdex imputando el costo a la cuenta de siniestros de transporte.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['accidente camion pintura', 'volcamiento cuñete en furgon', 'frenada brusca derrame', 'averia en transporte', 'siniestro ruta pintura'],
    summary: 'Procedimiento de emergencia y contención ambiental cuando una maniobra en carretera revienta un recipiente dentro del furgón.',
    steps: [
      {
        title: 'Detener el camión en lugar seguro y ventilar el furgón',
        instruction: 'Abre las puertas traseras para permitir la salida de vapores inflamables. No enciendas fósforos ni uses celulares dentro del furgón.'
      },
      {
        title: 'Aplicar el kit de derrames químicos de carretera',
        instruction: 'Vierte arena absorbente sobre la pintura derramada en el piso de la carrocería para evitar que escurra hacia la calle.'
      },
      {
        title: 'Fotografiar los daños para la aseguradora',
        instruction: 'Toma fotos detalladas de los cuñetes rotos, el número de lote y el estado del amarre de la carga.'
      },
      {
        title: 'Registrar el Acta de Avería en Ruta en Avalon V1',
        instruction: 'En el Tablero de Despachos, selecciona "Reportar Avería en Tránsito", digita las unidades destruidas y adjunta las fotos.',
        warning: 'Inspecciona las demás cajas de la ruta para constatar si se mancharon o si pueden ser entregadas a los siguientes clientes.'
      }
    ],
    contingency: 'Coordina de inmediato con planta el envío de un camión de reemplazo para no dejar colgados a los clientes de las entregas siguientes.'
  },
  {
    id: 'ESC-LOG-36',
    title: '¿Cómo reingresar física y contablemente mercancía devuelta a la bodega de origen?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Inspección técnica en muelle que decide si el producto reingresa a "Stock Disponible" o a "Cuarentena".',
    expectedResult: 'El producto sellado vuelve a quedar disponible para la venta sin desajustes en el Kárdex.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['reingreso bodega devolucion', 'descargar devolucion camion', 'retorno de mercancia a estante', 'devolucion a inventario'],
    summary: 'Recepción formal de productos que regresaron en los camiones de reparto por rechazo o devolución de clientes.',
    steps: [
      {
        title: 'Inspección física en el muelle de descarga de planta',
        instruction: 'El almacenista inspecciona envase, precinto de seguridad, limpieza y peso de cada recipiente retornado.'
      },
      {
        title: 'Si el producto está intacto y sellado de fábrica:',
        instruction: 'En Avalon V1, presiona "Aprobar Reingreso a Stock Disponible". Las unidades sumarán de nuevo a existencias para venta inmediata.'
      },
      {
        title: 'Si el producto tiene abolladuras o etiquetas manchadas:',
        instruction: 'Presiona "Reingresar a Bodega de Cuarentena / Reacondicionamiento" para que el taller cambie la etiqueta antes de volver a comercializarlo.'
      },
      {
        title: 'Firmar la planilla de descargue del conductor',
        instruction: 'El almacenista sella la planilla al chofer liberándolo de la custodia de la mercancía devuelta.',
        proTip: 'Esta inspección evita que un producto que fue abierto o contaminado por un cliente vuelva a ser vendido a otro comprador.'
      }
    ],
    contingency: 'Si la pintura devuelta fue formulada a la medida en tintometría, se traslada a la zona de "Saldos de Color / Outlet" con descuento.'
  },
  {
    id: 'ESC-LOG-37',
    title: '¿Qué hacer si el cliente solicita el reenvío inmediato de un producto corregido el mismo día?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Reenvío Inmediato / Reposición Rápida" que clona la orden con prioridad 1 sin costo de flete para el cliente.',
    expectedResult: 'El producto correcto sale en el turno de la tarde subsanando la insatisfacción del comprador.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['reenvio mismo dia', 'reposicion inmediata', 'corregir despacho hoy', 'cambio urgente de pintura obra'],
    summary: 'Protocolo de resarcimiento comercial cuando un error de Procoquinal en el despacho matutino requiere corrección en la tarde.',
    steps: [
      {
        title: 'Identificar el error de despacho en el reclamo',
        instruction: 'Ejemplo: El cliente pidió Thinner Acrílico y se le despachó Thinner Corriente por error de alistamiento.'
      },
      {
        title: 'Crear la orden de reposición con flete bonificado ($0)',
        instruction: 'En el CRM, presiona "Crear Reposición por Garantía de Despacho". El costo de transporte se asignará a cargo de Procoquinal.'
      },
      {
        title: 'Priorizar el alistamiento en el muelle de planta',
        instruction: 'Toma la referencia correcta inmediatamente de bodega y empácala con rótulo de prioridad roja.'
      },
      {
        title: 'Despachar en la ruta de la tarde o en mensajero exprés',
        instruction: 'Envía el producto en la primera salida disponible para que el cliente pueda continuar sus labores de pintura antes de finalizar su jornada.',
        proTip: 'Asumir el error con rapidez y sin costo adicional transforma una queja en un cliente altamente fidelizado.'
      }
    ],
    contingency: 'El conductor debe recoger la referencia equivocada en la obra al momento de entregar la correcta (cambio mano a mano).'
  },
  {
    id: 'ESC-LOG-38',
    title: '¿Cómo tramitar una reclamación de seguro ante una transportadora externa por pérdida o daño de carga?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera el expediente de indemnización con factura de venta, guía de paqueteo y fotografías del daño.',
    expectedResult: 'La aseguradora de la transportadora indemniza el 100% del valor declarado de la mercancía dañada.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['reclamo seguro transportadora', 'indemnizacion servientrega', 'cobro seguro carga', 'perdida de paqueteo indemnizar'],
    summary: 'Procedimiento formal para recuperar el costo de productos destruidos o extraviados en manos de empresas de encomienda.',
    steps: [
      {
        title: 'Obtener la constancia de avería o pérdida de la transportadora',
        instruction: 'Exige el reporte formal de la transportadora (ej: Acta de Siniestro de Envía o Coordinadora).'
      },
      {
        title: 'Compilar los documentos del siniestro en Avalon V1',
        instruction: 'En Reportes de Despacho, selecciona la guía afectada y presiona "Expediente de Indemnización". El sistema agrupará: Factura electrónica comercial con valor declarado, Guía de transporte y Fotografías de la mercancía dañada.'
      },
      {
        title: 'Radicar la reclamación en el portal de la transportadora',
        instruction: 'Ingresa la solicitud formal dentro del plazo legal (máximo 5 días hábiles según el Código de Comercio).'
      },
      {
        title: 'Seguimiento hasta la nota de crédito o giro de la indemnización',
        instruction: 'Al recibir el pago de la aseguradora, Contabilidad cruzará la cuenta de reclamos a transportadoras.',
        warning: 'Declarar un valor menor al real en la guía de paqueteo limita la indemnización de la aseguradora a ese valor inferior.'
      }
    ],
    contingency: 'Asegúrate de que todas las guías de transporte externo declaren siempre el 100% del valor comercial de la pintura.'
  },
  {
    id: 'ESC-LOG-39',
    title: '¿Cómo registrar el retorno de estibas de madera y envases retornables desde la obra del cliente?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Control de activos retornables (estibas de madera estándar y tambores metálicos) en comodato logístico.',
    expectedResult: 'Las estibas regresan al inventario de embalaje de planta sin perder activos logísticos en las obras.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['retorno de estibas', 'estibas de madera devueltas', 'tambores retornables', 'comodato de estibas', 'devolucion de pallets'],
    summary: 'Administración de activos de embalaje reutilizables para evitar la compra continua de estibas de madera.',
    steps: [
      {
        title: 'Contar las estibas entregadas en el despacho inicial',
        instruction: 'En la remisión saliente se anota: "Incluye 3 Estibas de Madera Retornables en Comodato".'
      },
      {
        title: 'Recoger las estibas vacías en la siguiente entrega',
        instruction: 'Cuando el camión regresa a la obra del cliente a llevar un nuevo pedido, el chofer recoge las 3 estibas desocupadas.'
      },
      {
        title: 'Registrar la entrada de embalaje en Avalon V1',
        instruction: 'En el módulo móvil del chofer, selecciona "Recolección de Embalaje Retornable: 3 Estibas".'
      },
      {
        title: 'Descargar en la bodega de carpintería y empaque',
        instruction: 'El almacenista inspecciona que las estibas estén en buen estado y las reintegra al inventario de embalaje.',
        proTip: 'Controlar las estibas ahorra más de $15.000.000 COP al año en compras innecesarias de madera.'
      }
    ],
    contingency: 'Si el cliente destruyó o extravió las estibas, se le factura el valor de reposición según la política de comodato logístico.'
  },
  {
    id: 'ESC-LOG-40',
    title: '¿Cómo acordar un descuento comercial en sitio si el cliente acepta una lata con avería estética menor?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite aplicar "Descuento por Merma Estética (5% a 10%)" con aval de Gerencia sin retornar el producto.',
    expectedResult: 'El cliente se queda con la pintura, se ahorra el flete de retorno y se emite la Nota Crédito por la rebaja pactada.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['descuento lata abollada', 'rebaja por empaque golpeado', 'acuerdo averia menor', 'aceptar lata con descuento'],
    summary: 'Solución ganar-ganar cuando el empaque sufrió un golpe leve pero el contenido químico está 100% perfecto e intacto.',
    steps: [
      {
        title: 'Constatar que el producto no tiene fugas de pintura',
        instruction: 'Verifica que solo sea una abolladura estética de la lámina y que el precinto y contenido estén íntegros.'
      },
      {
        title: 'Proponer la alternativa comercial al cliente',
        instruction: 'El asesor ofrece: "Don Carlos, la pintura está perfecta; si la recibe así para no retrasar su obra, le aplicamos un 10% de descuento inmediato sobre ese cuñete".'
      },
      {
        title: 'Registrar la novedad en Avalon V1',
        instruction: 'El chofer selecciona en la orden móvil: "Entregado con Descuento por Avería Estética (10%)".'
      },
      {
        title: 'Emisión de la Nota Crédito de compensación',
        instruction: 'Contabilidad emitirá la Nota Crédito por el valor acordado y el cliente firmará la remisión con total conformidad.',
        proTip: 'Esta solución evita el costo de traer el cuñete de vuelta en el camión, reenvasar y volver a despachar.'
      }
    ],
    contingency: 'Si el cliente no acepta el descuento y exige una lata perfecta, procede con la devolución total sin forzar la negociación.'
  },
  {
    id: 'ESC-LOG-41',
    title: '¿Cómo custodiar en muelle pedidos rechazados que están pendientes de aclaración con el cliente?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Zona de bodega "Despachos en Controversia" que bloquea la reventa hasta resolver con el cliente.',
    expectedResult: 'El pedido permanece identificado bajo custodia sin mezclarse con la mercancía general de la bodega.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['custodia pedido rechazado', 'zona de controversia', 'mercancia en disputa entrega', 'espera de aclaracion cliente'],
    summary: 'Almacenamiento transitorio de pedidos retornados mientras el departamento comercial y el cliente concilian la solución.',
    steps: [
      {
        title: 'Descargar el producto del camión al retornar a planta',
        instruction: 'El operario traslada los bultos a la zona señalizada como "ÁREA DE DESPACHOS RETORNADOS EN CONTROVERSIA".'
      },
      {
        title: 'Pegar el rótulo de retención temporal',
        instruction: 'Adhiere la etiqueta amarilla con número de pedido, cliente y fecha de retorno.'
      },
      {
        title: 'Plazo límite de 48 horas para resolución',
        instruction: 'El asesor comercial tiene un plazo perentorio de 48 horas para definir si el pedido se reenvía, se cambia de fórmula o se cancela definitivamente.'
      },
      {
        title: 'Liberación o desarmado del pedido',
        instruction: 'Si el cliente cancela la compra, el pedido se desarma y los productos regresan al stock general.',
        warning: 'No permitas que pedidos rechazados permanezcan más de 5 días en la zona de muelle para evitar congestión operativa.'
      }
    ],
    contingency: 'Si a las 48 horas no hay respuesta, el Administrador de Planta ordenará el desarmado obligatorio del pedido.'
  },
  {
    id: 'ESC-LOG-42',
    title: '¿Qué hacer si una transportadora externa entrega un pedido en la ciudad equivocada?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite abrir "Disputa por Error de Ruteo de Transportadora" con reenvío de emergencia a cargo del operador.',
    expectedResult: 'La transportadora asume el flete del reenvío urgente hacia el destino correcto sin costo para Procoquinal.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['entrega ciudad equivocada', 'transportadora desvio paquete', 'error de destino envia', 'guia mal enrutada'],
    summary: 'Gestión de errores operativos graves cometidos por empresas de paqueteo que envían la carga a una bodega errónea.',
    steps: [
      {
        title: 'Verificar la guía de despacho original emitida por Avalon V1',
        instruction: 'Comprueba que en la remisión de Procoquinal la ciudad estuviera correctamente digitada (ej: Villavicencio - Meta).'
      },
      {
        title: 'Identificar el desvío en el portal de tracking',
        instruction: 'Observa si la transportadora enrutó el paquete erróneamente hacia Bucaramanga por error en su centro de clasificación.'
      },
      {
        title: 'Exigir el Reenvío Exprés a cargo de la transportadora',
        instruction: 'Radica el reclamo prioritario ante el ejecutivo de cuenta de la transportadora exigiendo el traslado aéreo o exprés hacia la ciudad correcta.'
      },
      {
        title: 'Informar al cliente y monitorear la llegada',
        instruction: 'Comunica la novedad al cliente aportando la evidencia de que el error fue de la empresa de transporte.',
        proTip: 'Tener la copia digital de la guía emitida por Avalon demuestra que la dirección suministrada por Procoquinal era impecable.'
      }
    ],
    contingency: 'Si la transportadora tarda más de 3 días en corregir el desvío, despacha un nuevo pedido desde planta y cobra la devolución a la transportadora.'
  },

  // =========================================================================
  // SUBTEMA 5: Métricas Logísticas, OTIF & Auditoría de Flota (13 Escenarios)
  // =========================================================================
  {
    id: 'ESC-LOG-43',
    title: '¿Cómo medir el indicador logístico OTIF (On-Time In-Full) en Avalon V1?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo DispatchReports calcula automáticamente `onTimeRate` y `successRate` cruzando fecha prometida vs. fecha real.',
    expectedResult: 'Se obtiene el porcentaje de excelencia operativa de entregas completas y a tiempo (Meta Procoquinal: > 95%).',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Métricas de Despacho',
    synonyms: ['otif logistica', 'on time in full', 'cumplimiento entregas', 'kpi logistica', 'porcentaje entregas a tiempo'],
    summary: 'Indicador reina de la logística mundial que evalúa la confiabilidad del servicio de entrega de la compañía.',
    steps: [
      {
        title: 'Acceder a "Despachos & Logística > Reportes & Métricas"',
        instruction: 'Navega al tablero de rendimiento logístico (/dispatch-reports).'
      },
      {
        title: 'Seleccionar la vista "MÉTRICAS (METRICS)"',
        instruction: 'El sistema cargará el consolidado de los despachos del mes.'
      },
      {
        title: 'Interpretar las tarjetas de rendimiento:',
        instruction: '• On-Time Rate: Porcentaje de pedidos entregados antes o en la fecha prometida.\n• Success Rate (In-Full): Porcentaje de pedidos entregados al 100% sin faltantes ni averías.\n• OTIF Ponderado: Multiplicación de ambos factores (ej: 96% a tiempo x 98% completo = 94.08% OTIF).'
      },
      {
        title: 'Identificar causas de desviación',
        instruction: 'Revisa si los retrasos ocurrieron por demoras en taller de tintometría o por tráfico vehicular en carretera.',
        proTip: 'Un OTIF superior al 95% es el mejor argumento comercial para ganar contratos con grandes flotas de transporte.'
      }
    ],
    contingency: 'Exporta los datos a Excel para la presentación trimestral de la junta directiva.'
  },
  {
    id: 'ESC-LOG-44',
    title: '¿Cómo analizar las entregas retrasadas (Delayed Rate) y eliminar cuellos de botella?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Filtra pedidos donde `actualDeliveryDate > promisedDate` mostrando los días promedio de atraso.',
    expectedResult: 'La dirección logística detecta si las demoras son causadas por alistamiento lento o por transportadoras deficientes.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Métricas de Despacho',
    synonyms: ['entregas retrasadas', 'retrasos despacho', 'delayed rate', 'cuello de botella logistica', 'por que se atrasan pedidos'],
    summary: 'Auditoría analítica de los pedidos que no cumplieron la promesa de entrega para corregir fallas operativas.',
    steps: [
      {
        title: 'Filtrar por "Despachos Retrasados" en DispatchReports',
        instruction: 'Activa el filtro de pedidos donde la fecha real superó la fecha pactada.'
      },
      {
        title: 'Desglosar por causas principales:',
        instruction: '1. Retraso en Taller de Mezclas: La pintura tardó más tiempo en formularse o igualar el color.\n2. Retraso en Alistamiento: Falta de auxiliares de bodega en muelle de empaque.\n3. Retraso en Ruta: Tráfico vehicular, derrumbes o fallas mecánicas del camión.'
      },
      {
        title: 'Ajustar los tiempos de promesa comercial (Lead Time)',
        instruction: 'Si los colores complejos toman 24 horas en tinturarse, instruye a los vendedores a prometer entrega a 48 horas en vez de 24 horas.',
        warning: 'Prometer plazos imposibles de cumplir genera estrés en el equipo y frustración en los clientes.'
      }
    ],
    contingency: 'Implementa un turno nocturno de alistamiento si el cuello de botella se concentra en el muelle de carga.'
  },
  {
    id: 'ESC-LOG-45',
    title: '¿Cómo auditar el rendimiento y cumplimiento (SLA) de transportadoras externas?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Compara tiempos de entrega de Servientrega vs. Envía vs. TCC vs. Coordinadora por departamento.',
    expectedResult: 'Se asigna cada ruta a la transportadora más rápida y económica según su histórico de efectividad real.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Métricas de Despacho',
    synonyms: ['rendimiento transportadoras', 'sla servientrega', 'comparar envia y tcc', 'mejor transportadora pintura', 'evaluacion operadores logisticos'],
    summary: 'Evaluación comparativa de proveedores de transporte para optimizar los convenios comerciales de paqueteo.',
    steps: [
      {
        title: 'Filtrar por empresa transportadora en los reportes',
        instruction: 'Selecciona "Transportadora: Envía" y luego "Transportadora: Coordinadora".'
      },
      {
        title: 'Comparar indicadores de cumplimiento:',
        instruction: '• Tiempo promedio de entrega en días (ej: Envía 1.8 días vs Coordinadora 2.4 días a Medellín).\n• Porcentaje de mercancía averiada o golpeada (tasa de siniestros).\n• Cumplimiento en retorno oportuno de cumplidos firmados.'
      },
      {
        title: 'Reasignar zonas según fortaleza de cada operador',
        instruction: 'Asigna la Costa Atlántica a la empresa con mejor cobertura regional y el Eje Cafetero al operador con mejor tiempo de tránsito.',
        proTip: 'Esta especialización reduce los tiempos de entrega intermunicipal en casi un día completo.'
      }
    ],
    contingency: 'Si una transportadora supera el 3% de averías en un mes, suspende los envíos con esa empresa hasta una reunión de calidad.'
  },
  {
    id: 'ESC-LOG-46',
    title: '¿Cómo controlar el consumo de combustible (Galones ACPM por km) de la flota propia?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra kilometraje inicial/final de odómetro y galones tanqueados calculando el rendimiento por galón.',
    expectedResult: 'Se detectan consumos anormales de combustible por desvíos de ruta o inyectores diésel descalibrados.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['consumo combustible', 'galones acpm camion', 'rendimiento kilometro galon', 'control gasolina camion', 'auditoria combustible flota'],
    summary: 'Monitoreo del costo operativo más importante de la flota vehicular propia para evitar sobrecostos y fugas.',
    steps: [
      {
        title: 'Registrar el kilometraje al salir y regresar de planta',
        instruction: 'El chofer anota el odómetro en la planilla de viaje (ej: Odómetro salida 124.500 km / Odómetro regreso 124.720 km = 220 km recorridos).'
      },
      {
        title: 'Ingresar las facturas electrónicas de tanqueo',
        instruction: 'En Avalon V1, digita los galones de ACPM tanqueados (ej: 18.5 galones).'
      },
      {
        title: 'Verificar el indicador de rendimiento (Km / Galón)',
        instruction: '220 km / 18.5 galones = 11.89 Km/Galón (parámetro estándar para Turbo NPR cargada: entre 11 y 13 Km/Galón).'
      },
      {
        title: 'Alertas por consumo excesivo',
        instruction: 'Si el rendimiento cae por debajo de 9 Km/Galón, el sistema alertará: "Consumo excesivo de combustible; programar mantenimiento de inyección".',
        warning: 'Consumos anómalos repentinos pueden indicar extracción indebida de combustible en carretera.'
      }
    ],
    contingency: 'Exige que todos los tanqueos se realicen con la tarjeta corporativa de combustible (Terpel/Primax) para control sistematizado.'
  },
  {
    id: 'ESC-LOG-47',
    title: '¿Cómo auditar los tiempos de permanencia en muelle (Lead Time de cargue en planta)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra hora de atraque en muelle vs. hora de salida de portería midiendo el tiempo de cargue.',
    expectedResult: 'El muelle opera con agilidad cargando un camión de 4 toneladas en menos de 45 minutos.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['tiempo de cargue muelle', 'lead time cargue', 'permanencia muelle camion', 'demora en cargar camion', 'eficiencia muelle despacho'],
    summary: 'Optimización de las operaciones de muelle para que los vehículos no pierdan horas productivas esperando que les suban la carga.',
    steps: [
      {
        title: 'Registrar la hora de inicio de cargue',
        instruction: 'Al retroceder el camión a la rampa de muelle, el auxiliar presiona "Iniciar Cargue Vehicular".'
      },
      {
        title: 'Cargar y trincar la mercancía',
        instruction: 'Se suben las estibas zunchadas y se colocan las barras de trincaje en el furgón.'
      },
      {
        title: 'Registrar el fin de cargue y salida',
        instruction: 'Al cerrar las compuertas, se presiona "Cargue Finalizado".'
      },
      {
        title: 'Auditar el promedio mensual en los reportes',
        instruction: 'Avalon mostrará el tiempo promedio por vehículo (meta: < 45 minutos para camiones medianos).',
        proTip: 'Tener los pedidos previamente alistados en estibas zunchadas antes de que el camión llegue reduce el cargue a solo 20 minutos.'
      }
    ],
    contingency: 'Si el cargue se demora más de 90 minutos, se debe registrar la causa (espera de pintura en tintometría o falta de montacargas).'
  },
  {
    id: 'ESC-LOG-48',
    title: '¿Cómo programar y auditar el mantenimiento preventivo de los camiones de reparto?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Alertas por kilometraje acumulado para cambio de aceite (cada 5.000 km), frenos y rotación de llantas.',
    expectedResult: 'La flota se mantiene en perfectas condiciones mecánicas reduciendo varadas en carretera a casi cero.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['mantenimiento camion', 'cambio aceite furgon', 'frenos camion reparto', 'hoja de vida vehiculo', 'mantenimiento flota propia'],
    summary: 'Administración de la vida útil de los vehículos de Procoquinal SAS para garantizar la seguridad vial.',
    steps: [
      {
        title: 'Configurar los intervalos de mantenimiento preventivo',
        instruction: 'En la hoja de vida de cada camión, define:\n• Cambio de Aceite y Filtros: Cada 5.000 Km.\n• Revisión de Frenos y Bandas: Cada 15.000 Km.\n• Calibración y Rotación de Llantas: Cada 10.000 Km.'
      },
      {
        title: 'Monitorear la alerta de kilometraje próximo',
        instruction: 'Cuando falten 500 km para el servicio, Avalon desplegará una alerta amarilla: "Vehículo NPR [Placa] próximo a cambio de aceite".'
      },
      {
        title: 'Programar el ingreso a taller mecánico autorizado',
        instruction: 'Agenda el mantenimiento para un sábado por la tarde para no afectar las rutas comerciales de la semana.'
      },
      {
        title: 'Registrar la factura de mantenimiento y resetear el odómetro',
        instruction: 'Sube la factura del taller y reinicia el contador de servicio en Avalon V1.',
        warning: 'Omitir los cambios de aceite en motores diésel de carga pesada ocasiona daños de motor de más de $20.000.000 COP.'
      }
    ],
    contingency: 'Mantén un camión de contingencia o convenio con una transportadora aliada para cubrir el vehículo que esté en taller.'
  },
  {
    id: 'ESC-LOG-49',
    title: '¿Cómo calcular el Costo Logístico como porcentaje de las ventas netas (Meta: < 4.5%)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Consolida costos de combustible, peajes, fletes terceros, salarios de choferes y mantenimiento vs. ventas facturadas.',
    expectedResult: 'La dirección financiera verifica que la distribución física no devore la rentabilidad comercial de la empresa.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['costo logistico sobre ventas', 'fletes porcentaje ventas', 'costo de distribucion', 'indicador costo transporte', 'kpi financiero fletes'],
    summary: 'Indicador estratégico de eficiencia en la cadena de suministro que compara el gasto de entrega contra los ingresos generados.',
    steps: [
      {
        title: 'Compilar los costos totales de distribución del mes',
        instruction: 'Suma: Combustible diésel + Peajes viales + Fletes pagados a transportadoras externas + Mantenimiento de vehículos + Salarios de conductores.'
      },
      {
        title: 'Consultar las ventas netas del periodo en Avalon V1',
        instruction: 'En la Sábana Contable, toma el valor de ventas facturadas del mes (ej: $500.000.000 COP).'
      },
      {
        title: 'Calcular el indicador de esfuerzo logístico:',
        instruction: '(Costo Logístico Total / Ventas Netas) * 100.\nEjemplo: $21.000.000 de gastos de reparto / $500.000.000 de ventas = 4.20% (Cumple la meta de Procoquinal: < 4.5%).'
      },
      {
        title: 'Identificar rutas no rentables',
        instruction: 'Si una ruta intermunicipal supera el 8% de costo de flete, evalúa aumentar el pedido mínimo o cobrar flete compartido al cliente.',
        proTip: 'Optimizar el cubicaje de los camiones es la forma más rápida de bajar este porcentaje sin subir precios.'
      }
    ],
    contingency: 'En meses con alzas decretadas del diésel ACPM, revisa el impacto en los fletes de inmediato con gerencia.'
  },
  {
    id: 'ESC-LOG-50',
    title: '¿Cómo auditar paradas no autorizadas o desvíos de ruta de los camiones en carretera?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Integración con plataforma GPS satelital que alerta paradas mayores a 20 minutos fuera de la geocerca de entrega.',
    expectedResult: 'Se previene el uso indebido de vehículos de la empresa y se detectan riesgos de seguridad en carretera.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['auditoria gps camion', 'parada no autorizada furgon', 'desvio de ruta gps', 'geocerca camion entrega', 'rastreo satelital despacho'],
    summary: 'Monitoreo de seguridad de la flota en tiempo real para asegurar que los conductores cumplan con el itinerario establecido.',
    steps: [
      {
        title: 'Observar la alerta de parada prolongada en el tablero',
        instruction: 'Avalon mostrará una notificación: "ALERTA GPS: Camión NPR [Placa] detenido por más de 25 minutos en punto no registrado en ruta".'
      },
      {
        title: 'Contactar al conductor por radio o teléfono',
        instruction: 'Consulta el motivo de la detención (ej: pinchazo de llanta, almuerzo autorizado o trancón vial).'
      },
      {
        title: 'Verificar la ubicación satelital en el mapa',
        instruction: 'Comprueba que el vehículo se encuentre en una estación de servicio autorizada y no en una zona residencial no planificada.'
      },
      {
        title: 'Registrar la justificación en la bitácora de viaje',
        instruction: 'Anota la causa del retraso para que no afecte la evaluación de puntualidad del chofer si fue por causa justificada.',
        warning: 'Paradas no autorizadas en sitios oscuros o desvíos recurrentes activan investigación de seguridad por riesgo de robo.'
      }
    ],
    contingency: 'Si el conductor no contesta y el botón de pánico satelital está activado, contacta de inmediato a la Policía de Carreteras.'
  },
  {
    id: 'ESC-LOG-51',
    title: '¿Cómo exportar la Sábana de Despachos y Cumplidos a Excel para liquidación de fletes?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Exporta reporte masivo con número de guía, cliente, dirección, conductor, fecha prometida, fecha real y estado.',
    expectedResult: 'Se obtiene la planilla Excel limpia para auditar entregas mensuales y liquidar honorarios de conductores.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['exportar despachos excel', 'sabana logistica excel', 'descargar entregas excel', 'reporte cumplidos excel', 'informe fletes mensual'],
    summary: 'Generación del informe consolidado de transporte para revisiones de auditoría y análisis de operaciones.',
    steps: [
      {
        title: 'Acceder a "Despachos & Logística > Reportes"',
        instruction: 'Abre la pantalla de informes de despacho.'
      },
      {
        title: 'Definir el rango de fechas mensual a liquidar',
        instruction: 'Selecciona la fecha de inicio y fin del mes cerrado.'
      },
      {
        title: 'Presionar "Exportar a Excel / CSV"',
        instruction: 'El sistema procesará los registros de todos los camiones y descargará automáticamente el archivo .xlsx.'
      },
      {
        title: 'Revisar las columnas del reporte:',
        instruction: 'Guía #, Factura #, Cliente, Destino/Ciudad, Vehículo/Placa, Conductor, Kilos Despachados, Estado (Entregado/Fallido) y Observaciones de cumplido.',
        proTip: 'Esta planilla sirve de respaldo para responder a cualquier auditoría de entregas de la Revisoría Fiscal.'
      }
    ],
    contingency: 'Si necesitas ver solo los viajes de un transportador específico, aplica el filtro de conductor antes de presionar exportar.'
  },
  {
    id: 'ESC-LOG-52',
    title: '¿Cómo inspeccionar el kit de seguridad física del camión antes de salir de muelle (extintor, derrames, llantas)?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Lista de chequeo preoperacional vehicular digital obligatoria según el Plan Estratégico de Seguridad Vial (PESV).',
    expectedResult: 'El vehículo cumple con la normatividad de tránsito y está equipado para responder ante cualquier emergencia química.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['chequeo preoperacional camion', 'pesv inspeccion vehiculo', 'extintor camion carga', 'kit de derrames camion', 'inspeccion seguridad camion'],
    summary: 'Revisión técnica obligatoria diaria que debe realizar el conductor antes de encender el motor de reparto.',
    steps: [
      {
        title: 'Abrir el Formulario Preoperacional en el celular del conductor',
        instruction: 'En Avalon V1 móvil, selecciona "Inspección Preoperacional Diaria PESV".'
      },
      {
        title: 'Verificar los elementos del Kit de Carretera y Emergencias Químicas:',
        instruction: '• Extintor de Polvo Químico Seco (PQS) de 20 lbs con manómetro en verde y fecha de recarga vigente.\n• Kit Antiderrames: Arena absorbente, bolsa plástica gruesa, pala plástica antichispa y cinta de acordonamiento.\n• Botiquín de primeros auxilios y tacos de bloqueo de ruedas.'
      },
      {
        title: 'Revisión mecánica visual:',
        instruction: 'Verifica presión de llantas con calibrador, nivel de líquido de frenos, aceite de motor y agua de limpiaparabrisas.'
      },
      {
        title: 'Firmar digitalmente la lista de chequeo',
        instruction: 'El conductor firma la declaración juramentada de que el vehículo es apto para transitar.',
        warning: 'Mover sustancias químicas con extintor vencido o sin kit de derrames acarrea la inmovilización del furgón.'
      }
    ],
    contingency: 'Si se detecta una llanta lisa o con cortaduras profundas, el vehículo debe ingresar a cambio de neumáticos antes de cargar.'
  },
  {
    id: 'ESC-LOG-53',
    title: '¿Cómo coordinar el retorno seguro de la flota al cierre de operaciones de la tarde?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Métricas Logísticas & Flota',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registro de cierre de patio que confirma el ingreso de todos los camiones y el parqueo en sus bahías asignadas.',
    expectedResult: 'Todos los vehículos quedan resguardados bajo vigilancia en la planta de Procoquinal SAS al finalizar la jornada.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['cierre de patio logistica', 'retorno de flota planta', 'parqueo camiones noche', 'cierre de despachos turno'],
    summary: 'Protocolo de cierre de la jornada de transporte para asegurar la custodia de los vehículos y la entrega de cuentas.',
    steps: [
      {
        title: 'Monitorear el arribo de los vehículos en el tablero',
        instruction: 'Verifica en Avalon V1 que todos los camiones despachados en la mañana hayan cambiado de estado "EN_TRANSITO" a "RETORNADO A PLANTA".'
      },
      {
        title: 'Parqueo en reversa en las bahías de cargue',
        instruction: 'Los conductores parquean en posición de salida (en reversa) con freno de seguridad accionado y tacos de madera en las llantas.'
      },
      {
        title: 'Entrega de llaves y documentación en la caseta de transporte',
        instruction: 'Se entregan las llaves de los furgones, las planillas firmadas y las tarjetas de combustible.'
      },
      {
        title: 'Bloqueo general del patio de maniobras',
        instruction: 'El Coordinador de Despachos sella el turno logístico del día y activa el sistema de alarma perimetral de la planta.',
        proTip: 'Parquear en reversa es una norma internacional de seguridad industrial que permite evacuar los vehículos rápidamente ante una emergencia.'
      }
    ],
    contingency: 'Si un camión intermunicipal debe pernoctar en otra ciudad, debe hacerlo exclusivamente en parqueaderos cerrados con vigilancia 24 horas.'
  },
  {
    id: 'ESC-LOG-54',
    title: '¿Cómo reprogramar un despacho cuando el cliente solicita cambio de fecha con 24 horas de antelación?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Programación de Rutas & Vehículos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Reprogramar Fecha Prometida (`promisedDate`)" en la tarjeta de despacho sin penalización de flete.',
    expectedResult: 'La orden se traslada en el calendario logístico hacia la nueva fecha acordada manteniendo la reserva de stock.',
    route: '/dispatch',
    routeLabel: 'Ir a Despachos',
    synonyms: ['cambiar fecha entrega', 'reprogramar despacho', 'cliente pide entrega manana', 'aplazar envio pintura'],
    summary: 'Ajuste coordinado de cronogramas de entrega para clientes que tuvieron retrasos en la preparación de las superficies de su obra.',
    steps: [
      {
        title: 'Recibir la solicitud del cliente o asesor comercial',
        instruction: 'El cliente notifica que la losa de concreto aún no ha secado y solicita recibir la pintura 3 días después.'
      },
      {
        title: 'Localizar la orden en el Tablero de Despachos',
        instruction: 'Busca el pedido en la columna de pendientes.'
      },
      {
        title: 'Hacer clic en "Reprogramar Fecha Prometida"',
        instruction: 'Selecciona la nueva fecha de entrega solicitada (ej: cambiar del jueves 12 al lunes 16).'
      },
      {
        title: 'Confirmar el reajuste logístico',
        instruction: 'El pedido saldrá de la ruta del jueves y se programará en la planilla del lunes sin afectar el inventario reservado.',
        proTip: 'Avisar con 24 horas de anticipación evita alistar el camión en vano y permite asignar ese cupo de peso a otro cliente.'
      }
    ],
    contingency: 'Si el pedido ya estaba montado en el camión, se descarga y se guarda temporalmente en la zona de pedidos en espera.'
  },
  {
    id: 'ESC-LOG-55',
    title: '¿Cómo actuar ante un reclamo de cliente que asegura que le llegó un cuñete con color equivocado?',
    module: 'Logística & Despachos',
    moduleId: 'logistica',
    subtopic: 'Rechazos, Devoluciones & Novedades',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Cruza el código de barras pistoleado en Pick & Pack contra la contramuestra del laboratorio en 2 minutos.',
    expectedResult: 'Se audita si el error fue de despacho o si el cliente solicitó el código equivocado, resolviendo la controversia con pruebas objetivas.',
    route: '/dispatch-reports',
    routeLabel: 'Ir a Reportes de Despacho',
    synonyms: ['color equivocado reclamo', 'pintura no es el color', 'error de tinte despacho', 'reclamo tono pintura', 'auditar color entregado'],
    summary: 'Procedimiento técnico y logístico para resolver quejas sobre discrepancias de color en la pintura entregada.',
    steps: [
      {
        title: 'Consultar el registro de escaneo Pick & Pack de la orden',
        instruction: 'En Avalon V1, abre el log de escaneo del despacho: comprueba qué código de barras y lote exacto pistoleó el auxiliar en muelle.'
      },
      {
        title: 'Revisar la contramuestra física en el Laboratorio de Calidad',
        instruction: 'El laboratorista busca la plaqueta de prueba del lote (guardada según ESC-PRD-18) para constatar si el tono coincide con la fórmula aprobada.'
      },
      {
        title: 'Diagnosticar la causa raíz:',
        instruction: '• Escenario A (Error de Procoquinal): El laboratorio formuló un código diferente al de la cotización. Se despacha cambio urgente exprés el mismo día sin costo.\n• Escenario B (Error del Cliente): El cliente dictó el código RAL 9010 pero en realidad necesitaba RAL 9016. Se le asiste técnicamente para matizar en obra si es posible.'
      },
      {
        title: 'Cerrar el caso en el módulo de Garantías',
        instruction: 'Registra la resolución técnica y archiva el reporte firmado por el cliente.',
        warning: 'Tener la trazabilidad del escaneo óptico y la contramuestra blindan a Procoquinal contra cobros indebidos de repintado.'
      }
    ],
    contingency: 'Si la obra está detenida, envía al colorista de campo con la maleta de tintometría para ajustar el tono directamente en el taller del cliente.'
  }
];
