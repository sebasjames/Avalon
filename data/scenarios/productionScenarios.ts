import { HumanScenario } from './types';

export const PRODUCTION_SCENARIOS: HumanScenario[] = [
  // =========================================================================
  // SUBTEMA 1: Fórmulas & Recetas (Catálogo)
  // =========================================================================
  {
    id: 'ESC-PRD-01',
    title: '¿Cómo crear una nueva fórmula de mezcla desde cero en el catálogo?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Valida suma de componentes y registra base, tecnología y gramos por ingrediente.',
    expectedResult: 'La fórmula queda guardada en el catálogo general lista para producción y ventas.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Mezclas',
    synonyms: ['crear formula', 'nueva receta', 'formula desde cero', 'guardar receta', 'ingredientes mezcla'],
    summary: 'Procedimiento estándar para registrar una nueva fórmula química especificando base, solventes y pigmentos.',
    steps: [
      {
        title: 'Abrir Catálogo de Fórmulas',
        instruction: 'En el menú lateral, dirígete a "Operación > Mezclas y Pedidos" y selecciona la pestaña "Catálogo".'
      },
      {
        title: 'Pulsar "Nueva Fórmula"',
        instruction: 'Haz clic en el botón superior "+ Nueva Fórmula". Se abrirá el formulario técnico.'
      },
      {
        title: 'Definir datos de identificación',
        instruction: 'Digita el nombre comercial (ej: Esmalte Poliuretano Ral 7035), código de color y selecciona la base química (ej: BASE-POLI-PST).'
      },
      {
        title: 'Cargar ingredientes y gramajes',
        instruction: 'Agrega cada pigmento o aditivo con sus gramos exactos por unidad de volumen (galón o litro).',
        proTip: 'El sistema calcula en vivo el costo de materias primas según el costo promedio del Kárdex.'
      },
      {
        title: 'Guardar en catálogo',
        instruction: 'Haz clic en "Guardar en Catálogo". La fórmula quedará disponible para todo el equipo.'
      }
    ],
    contingency: 'Si un pigmento no aparece en la lista, verifica en el Centro de Inventarios que esté clasificado como Materia Prima activa.'
  },
  {
    id: 'ESC-PRD-02',
    title: '¿Cómo clonar o duplicar una fórmula existente para crear una variante?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Copia la estructura completa de materias primas manteniendo intacta la receta original.',
    expectedResult: 'Se genera una nueva fórmula independiente con un código derivado sin riesgo de sobreescribir la original.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Fórmulas',
    synonyms: ['clonar formula', 'duplicar receta', 'copiar mezcla', 'nueva variante', 'clonar tono'],
    summary: 'Copia rápida de una base probada para desarrollar tonalidades similares ahorrando tiempo de digitación.',
    steps: [
      {
        title: 'Ubicar la receta base',
        instruction: 'En el Catálogo de Fórmulas, busca por código o nombre el tono de referencia.'
      },
      {
        title: 'Hacer clic en "Clonar / Duplicar"',
        instruction: 'El sistema abrirá el formulario con todas las materias primas precargadas.'
      },
      {
        title: 'Ajustar pigmentos y guardar nuevo código',
        instruction: 'Modifica únicamente los gramos de los colorantes específicos para la variante y guarda con su nuevo nombre (ej: Añadir sufijo "-V2").'
      }
    ],
    contingency: 'Si el nombre ya existe, Avalon te avisará para evitar duplicidad de fichas técnicas en producción.'
  },
  {
    id: 'ESC-PRD-03',
    title: '¿Cómo editar las proporciones de una fórmula sin alterar órdenes históricas?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Las órdenes finalizadas conservan la foto estática de su lote original.',
    expectedResult: 'Los cambios aplican para lotes futuros mientras los lotes anteriores preservan su trazabilidad exacta.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Fórmulas',
    synonyms: ['editar formula', 'modificar receta', 'cambiar proporciones', 'ajustar receta', 'versionar'],
    summary: 'Ajuste de estándares de formulación por cambio de viscosidad o reemplazo de materia prima.',
    steps: [
      {
        title: 'Localizar la fórmula y abrir edición',
        instruction: 'Haz clic en el ícono de lápiz en la tarjeta de la fórmula en el catálogo.'
      },
      {
        title: 'Modificar gramos de insumos',
        instruction: 'Digita los nuevos gramos requeridos y actualiza las instrucciones técnicas si cambiaron.'
      },
      {
        title: 'Confirmar actualización',
        instruction: 'Haz clic en "Guardar Cambios". La nueva versión regirá para todas las órdenes que se lancen a partir de ese momento.'
      }
    ],
    contingency: 'Si hay órdenes en estado "En Preparación" en taller, terminarán con la formulación que tenían asignada al momento de iniciar.'
  },
  {
    id: 'ESC-PRD-04',
    title: '¿Cómo archivar o eliminar una fórmula obsoleta que ya no se comercializa?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Valida que no existan órdenes pendientes de entrega antes de permitir el borrado.',
    expectedResult: 'La fórmula sale del catálogo activo impidiendo que ventas o taller la ordenen nuevamente.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Fórmulas',
    synonyms: ['borrar formula', 'eliminar receta', 'archivar mezcla', 'descontinuar tono'],
    summary: 'Depuración del catálogo para retirar tonos fuera de línea o fórmulas temporales de clientes inactivos.',
    steps: [
      {
        title: 'Verificar órdenes en curso',
        instruction: 'Asegúrate de que no haya lotes en cola de taller que dependan de esta fórmula.'
      },
      {
        title: 'Pulsar ícono de eliminar',
        instruction: 'En la tarjeta de la receta en el catálogo, pulsa el ícono de caneca roja.'
      },
      {
        title: 'Confirmar advertencia de seguridad',
        instruction: 'El sistema solicitará confirmación. Acepta para retirarla de la lista activa.'
      }
    ],
    contingency: 'Si la fórmula tiene historial antiguo, los reportes contables pasados seguirán mostrando el histórico sin alterarse.'
  },
  {
    id: 'ESC-PRD-05',
    title: '¿Cómo consultar el historial de preparaciones y veces fabricada de una receta?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El contador "timesPrepared" y el modal de historial listan fechas y clientes.',
    expectedResult: 'Se visualiza la lista completa de lotes fabricados con esa receta y el volumen total producido.',
    route: '/mezclas',
    routeLabel: 'Ir al Historial de Mezclas',
    synonyms: ['veces fabricada', 'historial formula', 'cuantas veces se preparo', 'trazabilidad receta'],
    summary: 'Auditoría de rotación y confiabilidad técnica de una fórmula en planta.',
    steps: [
      {
        title: 'Localizar la fórmula en catálogo',
        instruction: 'Observa la insignia que indica "Preparada X veces" en la tarjeta.'
      },
      {
        title: 'Hacer clic en "Ver Historial"',
        instruction: 'Se abrirá el modal con las fechas, operarios, clientes y números de orden asociados a esa receta.'
      }
    ],
    contingency: 'Si una orden fue cancelada antes de taller, no sumará al contador de preparaciones exitosas.'
  },
  {
    id: 'ESC-PRD-06',
    title: '¿Cómo crear una fórmula exclusiva para un cliente específico (Especial Cliente)?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asigna categoría ESPECIAL_CLIENTE vinculando el nombre o NIT del cliente.',
    expectedResult: 'La fórmula queda etiquetada con insignia azul "Especial Cliente" y asociada a su cuenta.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Mezclas',
    synonyms: ['formula cliente', 'color exclusivo', 'tono personalizado', 'formula especial'],
    summary: 'Registro de tonos personalizados desarrollados bajo muestra física para un cliente corporativo.',
    steps: [
      {
        title: 'En el modal de creación, seleccionar categoría',
        instruction: 'Elige la opción "Especial Cliente" en el selector de categoría.'
      },
      {
        title: 'Asignar nombre del cliente corporativo',
        instruction: 'Digita la razón social del cliente (ej: "Constructor S.A." o "Carrocerías del Norte").'
      },
      {
        title: 'Guardar la fórmula',
        instruction: 'La receta quedará visible al filtrar por ese cliente facilitando recompras inmediatas.'
      }
    ],
    contingency: 'Si otro cliente solicita el mismo color, puedes duplicarla y cambiarle la asignación sin alterar la original.'
  },
  {
    id: 'ESC-PRD-07',
    title: '¿Cómo clasificar una fórmula por tecnología (Base Solvente vs Base Agua / Acrílica)?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Filtro dinámico por baseType (Solvente Interno, Acrílico, Poliuretano, etc.).',
    expectedResult: 'El sistema segmenta las fórmulas para evitar mezclar resinas incompatibles.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Fórmulas',
    synonyms: ['tecnologia base', 'solvente', 'base agua', 'incompatibilidad resina', 'tipo de base'],
    summary: 'Clasificación de seguridad química para prevenir contaminación cruzada de dispersores y tuberías.',
    steps: [
      {
        title: 'Definir el campo "Tipo de Tecnología"',
        instruction: 'Al crear o editar, selecciona "SOLVENTE INTERNO", "POLIURETANO INDUSTRIAL", "ACRÍLICO" o "BASE AGUA".'
      },
      {
        title: 'Filtrar en catálogo por tecnología',
        instruction: 'Usa el menú desplegable "Todas las tecnologías" para visualizar únicamente las fórmulas de una línea.'
      }
    ],
    contingency: 'Si una base no encaja en las opciones existentes, escribe la tecnología personalizada en el campo de texto libre.'
  },
  {
    id: 'ESC-PRD-08',
    title: '¿Qué hacer si una materia prima requerida no aparece en la lista de ingredientes?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite crear el insumo en Inventario o ingresar el nombre de forma directa.',
    expectedResult: 'La materia prima se incorpora al Kárdex y queda habilitada para la receta.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['materia prima no aparece', 'falta pigmento', 'no encuentro ingrediente', 'crear insumo mezcla'],
    summary: 'Solución cuando un aditivo o colorante nuevo aún no ha sido dado de alta en el maestro de materiales.',
    steps: [
      {
        title: 'Ingresar al Centro de Inventarios',
        instruction: 'Ve a "Operación > Centro de Inventarios" y haz clic en "Nuevo Producto".'
      },
      {
        title: 'Clasificar como Materia Prima',
        instruction: 'Selecciona categoría "Materia Prima", asigna unidad de medida "GR" o "LT" y guarda.'
      },
      {
        title: 'Regresar al Catálogo de Fórmulas',
        instruction: 'Recarga la lista de ingredientes en la fórmula; el nuevo insumo aparecerá disponible de inmediato.'
      }
    ],
    contingency: 'Si la orden de taller es urgente, puedes escribir el nombre como nota de instrucción mientras compras ingresa la factura.'
  },
  {
    id: 'ESC-PRD-09',
    title: '¿Cómo calcular el costo teórico estimado de un galón o cuñete al ensamblar la fórmula?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Cruza los gramos ingresados con el costo unitario promedio de cada SKU.',
    expectedResult: 'Muestra en tiempo real el costo estimado de producción antes de autorizar el lote.',
    route: '/mezclas',
    routeLabel: 'Ir a Mezclas y Pedidos',
    synonyms: ['costo formula', 'cuanto cuesta preparar', 'costo teorico', 'costo por galon', 'costo batch'],
    summary: 'Análisis de rentabilidad previo al lanzamiento para asegurar que el precio de venta cubre materias primas.',
    steps: [
      {
        title: 'Diligenciar los componentes de la fórmula',
        instruction: 'A medida que agregas gramos de base y pigmentos, observa el indicador de costo en el panel derecho.'
      },
      {
        title: 'Verificar el costo por presentación',
        instruction: 'Compara el costo de 1 Galón vs 5 Galones (Cuñete) considerando el empaque plástico o metálico.'
      }
    ],
    contingency: 'Si el costo promedio del Kárdex está en $0 por falta de compras registradas, ingresa el costo de referencia en la ficha de inventario.'
  },
  {
    id: 'ESC-PRD-10',
    title: '¿Cómo importar o cargar fórmulas masivas desde archivo Excel al catálogo?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Panel de ingesta procesa matrices de tintometría en formato JSON/XLSX.',
    expectedResult: 'Se cargan cientos de códigos de color al catálogo en un solo proceso sin digitar uno por uno.',
    route: '/mezclas',
    routeLabel: 'Ir al Ingestor de Fórmulas',
    synonyms: ['importar formulas', 'cargar excel recetas', 'importar matriz', 'subir tintometria'],
    summary: 'Carga masiva de cartas de colores completas (Barpimo, Ilva o RAL) suministradas por fabricantes.',
    steps: [
      {
        title: 'Abrir el modal de Importación',
        instruction: 'En Mezclas y Pedidos, haz clic en el botón "Importar Fórmulas (Excel / Raw)".'
      },
      {
        title: 'Seleccionar archivo estructurado',
        instruction: 'Elige el archivo con las columnas: Código Color, Base, Pigmento 1, Gramos 1, etc.'
      },
      {
        title: 'Validar vista previa y confirmar',
        instruction: 'Revisa que las cabeceras coincidan y pulsa "Procesar e Integrar al Catálogo".'
      }
    ],
    contingency: 'Si algún color viene con caracteres corruptos o celdas vacías, el importador lo aislará en una lista de advertencias.'
  },
  {
    id: 'ESC-PRD-11',
    title: '¿Qué hacer si el sistema muestra "Fórmula no encontrada en la tecnología seleccionada"?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El extractor busca en todas las pestañas de tintometría y sugiere alternativas.',
    expectedResult: 'El usuario identifica en qué tecnología sí existe el código de color y ajusta la orden.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero de Mezclas',
    synonyms: ['formula no encontrada', 'error tecnologia', 'color no existe', 'no hay formula'],
    summary: 'Diagnóstico cuando un código de color existe para esmalte pero se intenta fabricar en poliuretano.',
    steps: [
      {
        title: 'Verificar la tecnología de la base seleccionada',
        instruction: 'Comprueba si estás pidiendo una base esmalte para un color que solo está formulado en acrílico.'
      },
      {
        title: 'Buscar el código en el Catálogo Global',
        instruction: 'Cambia el filtro de tecnología a "Todas" para descubrir en qué base química está registrado el color.'
      },
      {
        title: 'Solicitar desarrollo a laboratorio',
        instruction: 'Si el cliente exige la tecnología que no existe, pulsa "Solicitar Desarrollo Técnico" para que planta formule la equivalencia.'
      }
    ],
    contingency: 'En casos de emergencia, un químico de planta puede crear la fórmula manual en 2 minutos desde el botón "+ Nueva Fórmula".'
  },
  {
    id: 'ESC-PRD-12',
    title: '¿Cómo exportar la ficha técnica de una fórmula a formato PDF para el cliente?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Fórmulas & Recetas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera documento PDF con proporciones, densidad, solvente recomendado y precauciones.',
    expectedResult: 'Se descarga un PDF limpio con logo de Procoquinal listo para adjuntar al pedido o enviar por correo.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Fórmulas',
    synonyms: ['ficha tecnica pdf', 'descargar formula', 'imprimir receta', 'exportar pdf mezcla'],
    summary: 'Emisión de soporte técnico para ingenieros residentes o contratistas de obra que exigen ficha de producto.',
    steps: [
      {
        title: 'Abrir la receta en el catálogo',
        instruction: 'Haz clic en la tarjeta de la fórmula para abrir su vista detallada.'
      },
      {
        title: 'Hacer clic en "Descargar Ficha Técnica PDF"',
        instruction: 'El sistema compilará los datos y generará el documento oficial con membrete.'
      }
    ],
    contingency: 'Si deseas ocultar los gramajes confidenciales de la fórmula y solo mostrar recomendaciones de aplicación, selecciona "Versión Comercial".'
  },

  // =========================================================================
  // SUBTEMA 2: Operación de Taller & Pesaje en Planta
  // =========================================================================
  {
    id: 'ESC-PRD-13',
    title: '¿Cómo enviar una orden de mezcla desde el catálogo a la cola de taller?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Crea la orden en estado PENDING y la ubica en el Kanban de taller.',
    expectedResult: 'La orden queda en cola con su número MZ-XXXX listo para que el operario la tome.',
    route: '/mezclas',
    routeLabel: 'Ir a Tablero de Mezclas',
    synonyms: ['lanzar orden', 'enviar a taller', 'mandar a produccion', 'crear lote mezcla'],
    summary: 'Pase formal de una receta seleccionada a la cola operativa de fabricación física.',
    steps: [
      {
        title: 'Seleccionar "Lanzar Orden" en la receta',
        instruction: 'En el catálogo de fórmulas, haz clic en el botón azul "Lanzar Orden".'
      },
      {
        title: 'Ingresar cantidad y cliente',
        instruction: 'Digita el número de galones o cuñetes y el nombre del cliente destinatario.'
      },
      {
        title: 'Confirmar lanzamiento',
        instruction: 'Haz clic en "Crear Orden de Taller". Aparecerá inmediatamente en la columna "Pendiente" del tablero.'
      }
    ],
    contingency: 'Si te equivocaste en la cantidad, puedes editarla en la tarjeta de la orden antes de que pase a preparación.'
  },
  {
    id: 'ESC-PRD-14',
    title: '¿Cómo recibir y gestionar una orden originada directamente desde el POS?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Las ventas cobradas con productos mezclados entran automáticamente con insignia POS.',
    expectedResult: 'El taller visualiza el ticket de venta asociado y el cliente que está esperando en sala.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['orden pos', 'pedido de caja', 'cliente esperando', 'venta pos taller'],
    summary: 'Atención prioritaria de mezclas pedidas en mostrador mientras el cliente aguarda en tienda.',
    steps: [
      {
        title: 'Identificar órdenes con etiqueta POS',
        instruction: 'En la columna "Pendiente", busca las tarjetas con borde azul y referencia de venta (ej: "POS-0991").'
      },
      {
        title: 'Tomar la orden de inmediato',
        instruction: 'Asigna al operario disponible y cambia el estado a "En Preparación" para avisar a caja que el lote ya se está batiendo.'
      }
    ],
    contingency: 'Si el cliente en mostrador decide cambiar de color a último minuto, caja anula el ticket y la orden se retira automáticamente del tablero.'
  },
  {
    id: 'ESC-PRD-15',
    title: '¿Cómo verificar el semáforo de disponibilidad de materias primas antes de mezclar?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Semáforo verde/rojo que compara stock físico en Kárdex contra gramos requeridos.',
    expectedResult: 'Previene iniciar mezclas a medias si falta algún colorante crítico.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero de Mezclas',
    synonyms: ['semaforo inventario', 'alcanza el pigmento', 'stock materias primas', 'verificar bases'],
    summary: 'Validación preventiva de existencias para no dejar tarros abiertos sin completar.',
    steps: [
      {
        title: 'Abrir detalle de la orden en el Kanban',
        instruction: 'Haz clic en la tarjeta de la orden para desplegar los ingredientes.'
      },
      {
        title: 'Revisar indicadores verdes y rojos',
        instruction: 'Si todos los ingredientes muestran check verde, hay stock suficiente para el batch completo.'
      },
      {
        title: 'Gestionar faltantes si hay alerta roja',
        instruction: 'Si un pigmento aparece en rojo, solicita al almacenista reponer el tarro de laboratorio antes de empezar.'
      }
    ],
    contingency: 'No inicies la orden si falta un pigmento clave, o la pintura quedará incompleta y expuesta al aire.'
  },
  {
    id: 'ESC-PRD-16',
    title: '¿Cómo iniciar la orden de mezcla y verificar el descuento automático en Kárdex?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Al pasar a IN_PROGRESS genera transacción de Kárdex y descuenta la base física.',
    expectedResult: 'Se descuenta la base del inventario y queda registrado el número de documento TX-MZ-XXXX.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['iniciar mezcla', 'descontar base kardex', 'comenzar preparacion', 'in progress'],
    summary: 'Paso formal de inicio de manufactura con asiento contable de salida de materia prima.',
    steps: [
      {
        title: 'Presionar "Iniciar Mezcla en Planta"',
        instruction: 'En la tarjeta de la orden pendiente, presiona el botón verde de Play.'
      },
      {
        title: 'Observar mensaje de confirmación de Kárdex',
        instruction: 'Aparecerá una notificación verde confirmando: "Se descontaron materias primas en Kárdex bajo Lote MZ-XXXX".'
      },
      {
        title: 'La orden pasa a columna "En Preparación"',
        instruction: 'El cronómetro de tiempo de preparación comenzará a correr.'
      }
    ],
    contingency: 'Si el Kárdex arroja error de stock insuficiente en la base, consulta al almacenista para que registre la entrada de almacén correspondiente.'
  },
  {
    id: 'ESC-PRD-17',
    title: '¿Cómo completar la lista de chequeo previa (Pre-Start Checks) antes de encender el agitador?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal de seguridad industrial que exige verificación de aspas limpias y EPP.',
    expectedResult: 'Garantiza calidad del producto y seguridad física del operario en planta.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero de Mezclas',
    synonyms: ['lista chequeo', 'pre start checks', 'seguridad taller', 'limpieza aspa', 'epp operario'],
    summary: 'Protocolo de buenas prácticas de manufactura para evitar contaminación de lotes anteriores.',
    steps: [
      {
        title: 'Confirmar aspas del dispersor limpias',
        instruction: 'Verifica que no queden residuos de pintura seca en las hélices del agitador neumático.'
      },
      {
        title: 'Confirmar tara de la báscula en cero',
        instruction: 'Coloca el envase vacío sobre la plataforma y presiona TARA.'
      },
      {
        title: 'Marcar casillas de verificación en pantalla',
        instruction: 'Tilda los checks requeridos para desbloquear el inicio del proceso.'
      }
    ],
    contingency: 'Si el dispersor está sucio, lávalo con solvente de limpieza antes de introducirlo en la base nueva.'
  },
  {
    id: 'ESC-PRD-18',
    title: '¿Qué hacer si se requiere PIN de autorización de supervisor para iniciar un lote especial?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal de autorización por PIN para lotes mayores a 50 galones o clientes premium.',
    expectedResult: 'El supervisor valida la orden y permite que el operario continúe con el pesaje.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['pin supervisor', 'autorizacion lote', 'bloqueo taller', 'permiso mezcla grande'],
    summary: 'Control de calidad para órdenes de gran volumen que conllevan alto costo de materias primas.',
    steps: [
      {
        title: 'Aviso de PIN en pantalla',
        instruction: 'Al intentar iniciar un lote restringido, el sistema solicitará el PIN del Jefe de Planta.'
      },
      {
        title: 'El supervisor ingresa su clave de 4 dígitos',
        instruction: 'El supervisor digita su PIN para autorizar la liberación de materias primas.'
      },
      {
        title: 'La orden queda desbloqueada',
        instruction: 'El operario puede proceder normalmente con el pesaje.'
      }
    ],
    contingency: 'Si el supervisor no está en planta, el rol de Administrador puede autorizar remotamente desde su panel de control.'
  },
  {
    id: 'ESC-PRD-19',
    title: '¿Qué hacer si el operario se pasa de gramos en báscula durante el pesaje del colorante?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Algoritmo de rebalanceo calcula la adición proporcional de base para no perder el lote.',
    expectedResult: 'La mezcla se recupera químicamente evitando descartar materias primas costosas.',
    route: '/mezclas',
    routeLabel: 'Ir a Mezclas y Pedidos',
    synonyms: ['me pase de gramos', 'mucho pigmento', 'error pesaje', 'colorante de mas', 'exceso balanza'],
    summary: 'Procedimiento de salvamento de lote cuando cayó más colorante del especificado en la receta.',
    steps: [
      {
        title: 'No revolver todavía la mezcla',
        instruction: 'Detén la adición y anota el peso exacto que cayó en la báscula.'
      },
      {
        title: 'Digitar el peso real en la orden',
        instruction: 'Ingresa los gramos reales en la casilla de pesaje de la orden en Avalon.'
      },
      {
        title: 'Presionar "Calcular Rebalanceo"',
        instruction: 'El sistema indicará cuántos gramos o litros adicionales de base debes añadir para mantener la proporción exacta del tono.',
        proTip: 'El volumen final del lote aumentará proporcionalmente (ej: 1 galón pasará a 1.1 galones).'
      }
    ],
    contingency: 'Si el exceso de colorante es descomunal, traslada la mezcla a un tanque de 5 galones y prepara un batch mayor.'
  },
  {
    id: 'ESC-PRD-20',
    title: '¿Cómo rebalancear un batch adicionando base para no perder la mezcla?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra la salida adicional de base en Kárdex ajustando el costo final del lote.',
    expectedResult: 'El inventario y el costo del lote quedan perfectamente cuadrados con la cantidad física obtenida.',
    route: '/mezclas',
    routeLabel: 'Ir a Tablero de Mezclas',
    synonyms: ['rebalancear batch', 'agregar mas base', 'cuadrar tono', 'salvar pintura'],
    summary: 'Ajuste contable y físico al diluir un exceso de colorante con base adicional.',
    steps: [
      {
        title: 'Aceptar el rebalanceo sugerido por el sistema',
        instruction: 'Confirma la adición de los mililitros adicionales de base calculados.'
      },
      {
        title: 'Pesar la base adicional e incorporar al tarro',
        instruction: 'Agrega la cantidad indicada sobre la báscula y mezcla con el dispersor.'
      },
      {
        title: 'Generar ajuste en Kárdex',
        instruction: 'Avalon registrará el consumo de la base extra bajo el mismo número de orden de mezcla.'
      }
    ],
    contingency: 'Notifica a ventas para que ajusten el precio si el cliente aceptó llevarse el volumen adicional resultante.'
  },
  {
    id: 'ESC-PRD-21',
    title: '¿Cómo registrar el pesaje real vs el teórico en la orden de taller?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Guarda la bitácora de tolerancia de cada componente para auditorías de calidad ISO.',
    expectedResult: 'Queda constancia de la precisión del operario con delta de tolerancia inferior a +/- 0.5%.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['pesaje real', 'tolerancia balanza', 'registro de gramos', 'pesaje teorico'],
    summary: 'Registro de trazabilidad métrica exigido en plantas de recubrimientos industriales.',
    steps: [
      {
        title: 'Dosificar cada pigmento',
        instruction: 'A medida que agregas cada colorante, digita el peso real marcado por la balanza.'
      },
      {
        title: 'Verificar el indicador de tolerancia',
        instruction: 'Si el peso está dentro del rango aceptable (+/- 0.5%), el campo se marcará en verde.'
      },
      {
        title: 'Guardar registro del lote',
        instruction: 'Al terminar todos los ingredientes, presiona "Guardar Registro de Pesaje".'
      }
    ],
    contingency: 'Si la balanza oscila por vibración de motores cercanos, utiliza la función de tara estática de la balanza.'
  },
  {
    id: 'ESC-PRD-22',
    title: '¿Cómo reportar desperdicio o residuo pegado en las paredes del tanque/tarro?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo ControlMermasTab registra causal "Residuo seco en paredes" y calcula costo COP.',
    expectedResult: 'El inventario de materias primas no se descuadra y el costo se asienta como merma normal de proceso.',
    route: '/mezclas',
    routeLabel: 'Ir a Control de Mermas',
    synonyms: ['residuo tarro', 'desperdicio pegado', 'merma tanque', 'fondo de envase'],
    summary: 'Asentamiento de pérdidas físicas inevitables por adherencia de resinas de alta viscosidad.',
    steps: [
      {
        title: 'Ingresar a la pestaña "Control de Mermas"',
        instruction: 'En el módulo de Mezclas o Producción, selecciona "Control de Mermas".'
      },
      {
        title: 'Pulsar "+ Registrar Incidencia / Merma"',
        instruction: 'Selecciona el producto o pigmento que dejó residuo.'
      },
      {
        title: 'Digitar los gramos perdidos y causal',
        instruction: 'Ingresa la cantidad (ej: 80 gr) y elige "Residuo seco adherido a paredes del tarro".',
        proTip: 'El sistema calcula automáticamente el valor monetario en pesos de esa pérdida.'
      },
      {
        title: 'Guardar incidencia',
        instruction: 'El stock de laboratorio se ajustará reflejando la existencia real del tarro en uso.'
      }
    ],
    contingency: 'Si la merma es recurrente, evalúa con compras el uso de espátulas de silicona de mayor flexibilidad.'
  },
  {
    id: 'ESC-PRD-23',
    title: '¿Cómo asentar una merma por derrame accidental de pigmento concentrado?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera comprobante de pérdida extraordinaria para revisión de costos.',
    expectedResult: 'El Kárdex descuenta el pigmento derramado con motivo justificado de accidente de taller.',
    route: '/mezclas',
    routeLabel: 'Ir a Control de Mermas',
    synonyms: ['derrame de pigmento', 'accidente taller', 'se cayo el tarro', 'perdida colorante'],
    summary: 'Procedimiento transparente para reportar pérdidas accidentales sin temor a descuadre de inventarios.',
    steps: [
      {
        title: 'Recoger y limpiar el área de inmediato',
        instruction: 'Aplica aserrín o material absorbente según la ficha de seguridad del solvente.'
      },
      {
        title: 'Pesar el contenido restante del envase',
        instruction: 'Pesa lo que quedó en el tarro para calcular la cantidad exacta que se derramó al piso.'
      },
      {
        title: 'Registrar la merma en Avalon',
        instruction: 'Selecciona causal "Derrame accidental en mesón de preparación" e ingresa los gramos perdidos.',
        warning: 'No intentes reincorporar material que cayó al suelo para no contaminar el lote con polvo o impurezas.'
      }
    ],
    contingency: 'Si el derrame afectó una orden de cliente en curso, genera una requisición urgente a bodega para reponer el insumo.'
  },
  {
    id: 'ESC-PRD-24',
    title: '¿Cómo calcular el impacto económico en pesos ($ COP) de una merma en taller?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Multiplica gramos perdidos por el costo por gramo derivado del unitCost del Kárdex.',
    expectedResult: 'La jefatura de planta visualiza el acumulado mensual de pérdidas en dinero para planes de ahorro.',
    route: '/mezclas',
    routeLabel: 'Ir a Control de Mermas',
    synonyms: ['impacto merma cop', 'costo desperdicio', 'cuanto costo el derrame', 'perdida economica planta'],
    summary: 'Monitoreo de costos ocultos de fabricación para optimizar la rentabilidad de las formulaciones.',
    steps: [
      {
        title: 'Abrir el Tablero de Control de Mermas',
        instruction: 'Revisa las métricas superiores: "Costo Total de Mermas del Mes ($ COP)".'
      },
      {
        title: 'Filtrar por rango de tiempo',
        instruction: 'Consulta las mermas de "Hoy", "Esta Semana" o "Este Mes" para evaluar la tendencia del taller.'
      }
    ],
    contingency: 'Los pigmentos orgánicos y tintes fluorescentes tienen un costo por gramo hasta 10 veces mayor que el dióxido de titanio blanco.'
  },
  {
    id: 'ESC-PRD-25',
    title: '¿Cómo ajustar la viscosidad agregando solvente de dilución en planta?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite agregar aditivos de ajuste secundario registrando salida de solvente.',
    expectedResult: 'La pintura alcanza los segundos de copa Ford requeridos sin violar la ficha técnica.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero de Mezclas',
    synonyms: ['viscosidad', 'copa ford', 'agregar solvente', 'adelgazar pintura', 'tinner ajuste'],
    summary: 'Corrección física cuando el lote queda demasiado espeso para aplicación en pistola o brocha.',
    steps: [
      {
        title: 'Medir viscosidad con Copa Ford #4',
        instruction: 'Verifica los segundos de drenado del producto (ej: estándar 25 a 30 segundos).'
      },
      {
        title: 'Adicionar solvente en pequeños porcentajes',
        instruction: 'Agrega entre 2% y 5% de solvente de ajuste (ej: Thinner 7771) bajo agitación constante.'
      },
      {
        title: 'Registrar la salida de solvente en la orden',
        instruction: 'En la pestaña "Ajuste Secundario", digita los mililitros de solvente adicionados para descontar de bodega.'
      }
    ],
    contingency: 'Nunca agregues solvente de una sola vez; agrégalo en chorro fino para evitar choque térmico o separación de resina.'
  },
  {
    id: 'ESC-PRD-26',
    title: '¿Cómo mover una orden en el tablero Kanban según su avance real?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botones de transición de estado que actualizan tiempos y estados en tiempo real.',
    expectedResult: 'Todo el equipo (ventas, almacén y despacho) sabe exactamente en qué fase va la pintura.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['mover kanban', 'cambiar columna', 'orden en proceso', 'avance taller'],
    summary: 'Sincronización visual del flujo de trabajo entre los operadores de planta y los comerciales.',
    steps: [
      {
        title: 'De "Pendiente" a "En Preparación"',
        instruction: 'Pulsa el botón "Iniciar Mezcla" al encender el agitador.'
      },
      {
        title: 'De "En Preparación" a "Listo para Entrega"',
        instruction: 'Pulsa el botón "Finalizar y Empacar" una vez envasado y etiquetado el lote.'
      }
    ],
    contingency: 'Si te equivocaste de columna, el rol de Administrador puede devolver una orden a estado anterior.'
  },
  {
    id: 'ESC-PRD-27',
    title: '¿Cómo marcar una orden como "Listo para Entrega / Facturación"?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra completedAt, activa el sticker y notifica a caja que el producto está listo.',
    expectedResult: 'El producto pasa al área de despacho y se habilita para entrega al cliente.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['terminar orden', 'listo para entrega', 'finalizar mezcla', 'orden completada'],
    summary: 'Cierre del ciclo de fabricación física y entrega del producto terminado a mostrador.',
    steps: [
      {
        title: 'Verificar envases cerrados y limpios',
        instruction: 'Comprueba que las tapas estén selladas herméticamente y sin manchas de pintura exterior.'
      },
      {
        title: 'Pulsar "Marcar como Listo"',
        instruction: 'En la tarjeta de la orden, presiona el botón verde con ícono de check.'
      },
      {
        title: 'Trasladar al mesón de entrega',
        instruction: 'Lleva los cuñetes o galones a la zona de despacho identificados con su respectivo sticker.'
      }
    ],
    contingency: 'El sistema no permitirá marcar como "Listo" si no se ha confirmado la impresión obligatoria del sticker de seguridad.'
  },
  {
    id: 'ESC-PRD-28',
    title: '¿Cómo pausar o retener un lote si la prueba de secado no da el brillo esperado?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón de retención por control de calidad que bloquea entrega preventiva.',
    expectedResult: 'El lote queda en cuarentena en taller evitando reclamos y garantías de clientes en obra.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['retener lote', 'falla de brillo', 'no seco la pintura', 'control de calidad taller'],
    summary: 'Protocolo de retención ante anomalías de secado, poder cubriente o tono defectuoso.',
    steps: [
      {
        title: 'Hacer clic en "Retener Lote / Calidad"',
        instruction: 'En las opciones de la orden, selecciona "Poner en Cuarentena de Calidad".'
      },
      {
        title: 'Escribir la no conformidad detectada',
        instruction: 'Registra la causa (ej: "Acabado mate cuando se pidió brillante" o "Secado lento superior a 4 horas").'
      },
      {
        title: 'Solicitar inspección del Jefe de Calidad',
        instruction: 'El lote permanecerá bloqueado hasta que se autorice adición de secante o reformulación.'
      }
    ],
    contingency: 'Si el lote es irrecuperable, se envía a la bodega de mermas para reprocesos de imprimaciones oscuras.'
  },
  {
    id: 'ESC-PRD-29',
    title: '¿Qué hacer si la báscula digital pierde comunicación con la pantalla de Avalon?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modo de digitación manual de emergencia disponible en todas las pantallas de taller.',
    expectedResult: 'El operario continúa trabajando leyendo la pantalla de la báscula física sin frenar la producción.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero de Mezclas',
    synonyms: ['balanza desconectada', 'falla bascula', 'no lee el peso', 'modo manual balanza'],
    summary: 'Contingencia técnica cuando el puerto serial o USB de la balanza no transmite datos al navegador.',
    steps: [
      {
        title: 'Activar "Modo Manual de Pesaje"',
        instruction: 'En la esquina superior de la pantalla de pesaje, activa el interruptor "Entrada Manual".'
      },
      {
        title: 'Leer los gramos en el display de la balanza',
        instruction: 'Observa la pantalla digital física de la báscula y digita los gramos en el teclado numérico de Avalon.'
      },
      {
        title: 'Verificar cables y reiniciar convertidor serial',
        instruction: 'Revisa que el cable USB-RS232 no esté flojo o con polvo de pintura.'
      }
    ],
    contingency: 'Reporta el cable flojo al equipo de soporte de Scarpian AI para calibrar los drivers del puerto COM en mantenimiento.'
  },
  {
    id: 'ESC-PRD-30',
    title: '¿Cómo cambiar el operario asignado a una orden de mezcla en curso?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Operación de Taller & Pesaje',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite reasignar el lote registrando el cambio de turno en la bitácora.',
    expectedResult: 'La orden pasa a la pantalla del nuevo operario con los gramos que ya se habían avanzado.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['cambiar operario', 'cambio de turno taller', 'reasignar orden mezcla', 'nuevo mezclador'],
    summary: 'Continuidad de lotes largos cuando termina la jornada del primer mezclador.',
    steps: [
      {
        title: 'Abrir opciones de la orden en preparación',
        instruction: 'Haz clic en el nombre del operario actual en la tarjeta del Kanban.'
      },
      {
        title: 'Seleccionar al nuevo operario receptor',
        instruction: 'Elige al compañero que continuará el batido y envasado del lote.'
      },
      {
        title: 'Confirmar entrega de turno',
        instruction: 'Ambos operarios deben verificar que los envases pesados coincidan con lo guardado en pantalla.'
      }
    ],
    contingency: 'El nuevo operario asume la responsabilidad de calidad del lote a partir de la firma de entrega de turno.'
  },

  // =========================================================================
  // SUBTEMA 3: Tintometría, Igualación & Colorimetría
  // =========================================================================
  {
    id: 'ESC-PRD-31',
    title: '¿Cómo buscar una equivalencia exacta por código RAL en tintometría?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Extractor busca en la base tintometria_raw.json con coincidencia exacta y normalizada.',
    expectedResult: 'Despliega la receta de colorantes y el color aproximado en hex en pantalla.',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría y Colores',
    synonyms: ['buscar ral', 'color ral', 'equivalencia ral', 'carta ral colores'],
    summary: 'Localización inmediata de fórmulas estándar de la carta alemana RAL Classic.',
    steps: [
      {
        title: 'Abrir el módulo de Tintometría',
        instruction: 'Navega a "Operación > Tintometría y Colores".'
      },
      {
        title: 'Digitar el número RAL en el buscador',
        instruction: 'Escribe "RAL 7035", "RAL 1000", "RAL 5002", etc.'
      },
      {
        title: 'Visualizar la dosificación',
        instruction: 'La pantalla mostrará los gramos exactos de cada tinte requeridos por litro o galón de base.'
      }
    ],
    contingency: 'Si no aparece en la tecnología actual, cambia el selector de base a otra tecnología disponible.'
  },
  {
    id: 'ESC-PRD-32',
    title: '¿Cómo buscar y formular un color según carta NCS o Pantone?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Buscador cruzado de cartas internacionales con sugerencia de base pastel o intensa.',
    expectedResult: 'Muestra la base recomendada (Base Pastel para tonos claros, Base Intensa para saturados).',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría y Colores',
    synonyms: ['pantone', 'ncs', 'color arquitectonico', 'carta de colores pantone'],
    summary: 'Búsqueda de tonalidades corporativas y arquitectónicas demandadas por diseñadores.',
    steps: [
      {
        title: 'Ingresar código Pantone o NCS',
        instruction: 'Digita el código del cliente en el campo de búsqueda de tintometría.'
      },
      {
        title: 'Verificar la base asignada',
        instruction: 'Comprueba si el tono requiere base blanca pastel o base transparente para colores oscuros.'
      }
    ],
    contingency: 'Si el tono es muy vibrante y la base actual no alcanza la saturación, solicita base TR (Transparente).'
  },
  {
    id: 'ESC-PRD-33',
    title: '¿Cómo realizar una prueba de gota (Drop Test) en mesón antes de envasar?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Protocolo de verificación visual en cartulina Leneta de contraste.',
    expectedResult: 'Confirmación de que la mezcla húmeda y seca coincide con la muestra patrón del cliente.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero de Mezclas',
    synonyms: ['prueba de gota', 'drop test', 'cartulina leneta', 'verificar tono meson', 'secado rapido'],
    summary: 'Validación artesanal y rápida obligatoria antes de autorizar el cierre del cuñete.',
    steps: [
      {
        title: 'Tomar una gota con espátula de agitación',
        instruction: 'Extrae una pequeña muestra del centro del tanque luego de al menos 5 minutos de dispersión.'
      },
      {
        title: 'Aplicar sobre cartulina de secado',
        instruction: 'Coloca una gota al lado de la muestra original del cliente o del estándar de fábrica.'
      },
      {
        title: 'Secar con pistola de aire caliente',
        instruction: 'Acelera el secado para evaluar el color en estado seco, ya que muchas pinturas oscurecen al secar.'
      }
    ],
    contingency: 'Nunca apruebes el color solo con la pintura húmeda; espera siempre al secado al tacto.'
  },
  {
    id: 'ESC-PRD-34',
    title: '¿Qué hacer si el tono queda más claro del estándar (Adición de tinte de ajuste)?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Calculadora de gotas de ajuste registra micro-adición de pigmento sin diluir.',
    expectedResult: 'El tono alcanza la profundidad deseada y se registra el consumo adicional de pigmento.',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría',
    synonyms: ['tono muy claro', 'falta fuerza', 'mas tinte', 'oscurecer color'],
    summary: 'Ajuste fino de color cuando el poder colorante del tinte varió entre lotes de proveedor.',
    steps: [
      {
        title: 'Identificar el tinte dominante',
        instruction: 'Observa si al color le falta negro, azul o amarillo para llegar al estándar.'
      },
      {
        title: 'Agregar tinte en incrementos del 2% al 5%',
        instruction: 'Pesa micro-cantidades del pigmento requerido y agrégalo con jeringa o gotero de precisión.'
      },
      {
        title: 'Agitar durante 3 minutos y repetir prueba de gota',
        instruction: 'Asegúrate de que el tinte se disperse completamente antes de volver a comparar.'
      }
    ],
    contingency: 'Es preferible que un tono quede ligeramente claro a que quede oscuro, pues aclarar requiere agregar base y aumenta el volumen.'
  },
  {
    id: 'ESC-PRD-35',
    title: '¿Qué hacer si el tono queda más oscuro del estándar (Neutralización de color)?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Guía de reincorporación de base blanca y cálculo de incremento de volumen.',
    expectedResult: 'El tono se aclara hasta igualar la muestra del cliente.',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría',
    synonyms: ['tono muy oscuro', 'quedo negro', 'aclarar pintura', 'mucho color'],
    summary: 'Salvamento de color cuando el operario o la fórmula sobrecargó de negro u óxidos oscuros.',
    steps: [
      {
        title: 'No agregar más tintes de color',
        instruction: 'Añadir más colores solo ensuciará el tono volviéndolo grisáceo o parduzco.'
      },
      {
        title: 'Adicionar base blanca en porcentaje calculado',
        instruction: 'Agrega base blanca pastel para subir el valor de luminosidad (L*) del color.'
      },
      {
        title: 'Ajustar la orden en Avalon',
        instruction: 'Registra la base adicional para que el costo del producto quede correctamente imputado.'
      }
    ],
    contingency: 'Si el producto ya no cabe en el galón, trasvasa a dos envases y comercializa el excedente como muestra de taller.'
  },
  {
    id: 'ESC-PRD-36',
    title: '¿Cómo registrar los códigos de tinte de una muestra física traída por el cliente?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite guardar recetas personalizadas bajo la categoría "Especial Cliente".',
    expectedResult: 'Queda guardada la receta exclusiva para que el cliente pueda pedir exactamente el mismo color meses después.',
    route: '/mezclas',
    routeLabel: 'Ir al Catálogo de Fórmulas',
    synonyms: ['muestra fisica', 'trajo pedazo de pared', 'igualar muestra', 'color personalizado'],
    summary: 'Fidelización técnica de clientes que traen trozos de lámina, tela o pared para replicar en pintura.',
    steps: [
      {
        title: 'Realizar la igualación en mesón',
        instruction: 'El igualador anota en papel los gramos exactos de cada tinte que utilizó hasta dar con el color.'
      },
      {
        title: 'Abrir "+ Nueva Fórmula" en Avalon',
        instruction: 'Digita los gramos probados, bautiza el color con el nombre del cliente y guarda en el catálogo.'
      },
      {
        title: 'Entregar muestra testigo',
        instruction: 'Aplica una muestra en una lámina metálica testigo y guárdala en el archivo físico de laboratorio.'
      }
    ],
    contingency: 'Anota en las observaciones si el sustrato original del cliente tenía brillo satinado o poliéster.'
  },
  {
    id: 'ESC-PRD-37',
    title: '¿Cómo verificar el poder cubriente y opacidad de una pintura mezclada?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Estándar de verificación sobre fondo negro y blanco en tablero de control.',
    expectedResult: 'Garantiza que la pintura cubra la superficie con el número de manos estipulado.',
    route: '/mezclas',
    routeLabel: 'Ir a Mezclas y Pedidos',
    synonyms: ['poder cubriente', 'opacidad', 'tapa el fondo', 'cuantas manos necesita'],
    summary: 'Control de calidad para colores amarillos y rojos que suelen ser traslúcidos.',
    steps: [
      {
        title: 'Aplicar con aplicador de película húmeda (Bird applicator)',
        instruction: 'Pasa una película de 100 micras sobre el tablero ajedrezado blanco y negro.'
      },
      {
        title: 'Evaluar contraste de cuadros',
        instruction: 'Si el cuadro negro se sigue viendo claramente tras el secado, el color requerirá adición de dióxido de titanio u óxido cubriente.'
      }
    ],
    contingency: 'Informa al comercial si el color requerirá aplicar previamente una base de imprimación gris o blanca en obra.'
  },
  {
    id: 'ESC-PRD-38',
    title: '¿Cómo registrar una nueva carta de colores del fabricante en la base de tintometría?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Soporta incorporación de nuevas pestañas tecnológicas en tintometriaData.',
    expectedResult: 'Los nuevos colores aparecen disponibles de inmediato en los buscadores de tienda.',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría y Colores',
    synonyms: ['nueva carta colores', 'agregar coleccion', 'catalogo fabricante', 'actualizar tintometria'],
    summary: 'Expansión de la oferta de colores de Avalon con colecciones de temporada.',
    steps: [
      {
        title: 'Recibir la tabla técnica del fabricante',
        instruction: 'Verifica que contenga el nombre del color y las dosificaciones por tinte estándar.'
      },
      {
        title: 'Cargar la colección en Configuración > Ingesta',
        instruction: 'El módulo procesará los registros agregándolos a la memoria de tintometría de Avalon V1.'
      }
    ],
    contingency: 'Si algún color usa un tinte exclusivo que la planta no tiene en stock, márcalo como "Bajo Pedido Especial".'
  },

  // =========================================================================
  // SUBTEMA 4: Rotulado, Stickers & Trazabilidad de Envases
  // =========================================================================
  {
    id: 'ESC-PRD-39',
    title: '¿Cómo imprimir el sticker adhesivo de producto terminado para galón o cuñete?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera sticker adhesivo con código QR/Barras, lote, fecha y advertencias.',
    expectedResult: 'Se envía a la impresora de etiquetas térmicas el formato adhesivo listo para pegar en el cuñete o galón.',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría',
    synonyms: ['imprimir sticker', 'etiqueta adhesiva', 'rotulo galon', 'sticker cuñete', 'pegar etiqueta'],
    summary: 'Rotulación reglamentaria de envases con fórmula personalizada y datos de trazabilidad de lote.',
    steps: [
      {
        title: 'Abrir orden terminada en Tintometría',
        instruction: 'Ve a "Operación > Tintometría y Colores" o al detalle del lote finalizado en Mezclas.'
      },
      {
        title: 'Presionar "Imprimir Etiqueta / Sticker"',
        instruction: 'Haz clic en el ícono de etiqueta en la tarjeta del producto mezclado.'
      },
      {
        title: 'Seleccionar formato de envase',
        instruction: 'Elige si la etiqueta es para Cuñete (5 Gal), Galón o Cuarto de Galón para que el diseño ajuste los tamaños de letra y advertencias de seguridad.',
        proTip: 'La etiqueta incluye código de barras único para que el cajero pueda pistolearlo directamente al momento de entregar.'
      }
    ],
    contingency: 'Si la impresora térmica de stickers descalibra los márgenes, selecciona la opción "Descargar PDF de Etiqueta" para imprimirla en hoja carta adhesiva.'
  },
  {
    id: 'ESC-PRD-40',
    title: '¿Cómo imprimir la etiqueta de control para el contenedor de pigmento dosificado?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal PigmentContainerStickerModal emite sticker de laboratorio con gramajes individuales.',
    expectedResult: 'El operario pega el sticker en el vaso dosificador para verificar qué tintes ya fueron pesados.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['sticker pigmento', 'etiqueta laboratorio', 'vaso dosificador', 'control de pesaje sticker'],
    summary: 'Identificación de recipientes intermedios durante el pesaje de micro-aditivos.',
    steps: [
      {
        title: 'Hacer clic en "Sticker de Pigmentos"',
        instruction: 'En la tarjeta de la orden en el Kanban, presiona el ícono de frasco con etiqueta.'
      },
      {
        title: 'Imprimir la tira térmica pequeña',
        instruction: 'Saldrá una tira estrecha detallando el peso de cada colorante y el código de la orden.'
      },
      {
        title: 'Pegar en el borde del vaso de pesaje',
        instruction: 'El operario tilda con marcador cada colorante a medida que lo vierte en el tanque.'
      }
    ],
    contingency: 'Esto evita la duda común de taller: "¿Ya le eché el negro a este tarro o todavía no?".'
  },
  {
    id: 'ESC-PRD-41',
    title: '¿Qué hacer si la impresora térmica de stickers se descalibra o corta mal?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite calibrar salto de página y descargar respaldo en PDF estándar.',
    expectedResult: 'La etiqueta se imprime centrada respetando el gap entre stickers adhesivos.',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría',
    synonyms: ['impresora descalibrada', 'corta la mitad', 'sticker desfasado', 'atasco etiquetas'],
    summary: 'Solución a problemas mecánicos frecuentes de impresoras térmicas Zebra, Xprinter o TSC en planta.',
    steps: [
      {
        title: 'Presionar botón FEED en la impresora apagada',
        instruction: 'Enciende la impresora manteniendo presionado FEED durante 5 segundos para forzar auto-calibración de sensor de gap.'
      },
      {
        title: 'Revisar tamaño de papel en Avalon',
        instruction: 'En el modal de impresión de Avalon, comprueba que esté seleccionado "Etiqueta 100x100mm" o "Etiqueta 100x50mm".'
      },
      {
        title: 'Usar opción de emergencia en PDF',
        instruction: 'Si la térmica sigue fallando, pulsa "Descargar PDF" e imprime en la impresora láser de oficina sobre papel adhesivo.'
      }
    ],
    contingency: 'Limpia el sensor óptico de la impresora con un hisopo con alcohol isopropílico si hay polvo de pintura acumulado.'
  },
  {
    id: 'ESC-PRD-42',
    title: '¿Cómo reimprimir un sticker que se dañó durante el envasado o transporte?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón de reimpresión ilimitada desde el Historial de Lotes terminados.',
    expectedResult: 'Emite un duplicado exacto del sticker original con la misma información de lote y barras.',
    route: '/mezclas',
    routeLabel: 'Ir al Historial de Mezclas',
    synonyms: ['reimprimir sticker', 'sticker manchado', 'se rompio la etiqueta', 'duplicado sticker'],
    summary: 'Reposición rápida de etiquetas rasgadas o manchadas de solvente antes de cargar al camión.',
    steps: [
      {
        title: 'Buscar el lote en el Historial de Mezclas',
        instruction: 'Digita el número MZ o el nombre del cliente en el buscador del historial.'
      },
      {
        title: 'Pulsar ícono de impresora',
        instruction: 'Haz clic en "Reimprimir Etiqueta".'
      },
      {
        title: 'Pegar sobre el envase limpio y seco',
        instruction: 'Limpia la superficie exterior del tarro antes de adherir el nuevo sticker para asegurar fijación.'
      }
    ],
    contingency: 'No permitas que salgan a despacho envases sin etiqueta legible; los clientes de obra rechazan remisiones sin código de barras.'
  },
  {
    id: 'ESC-PRD-43',
    title: '¿Cómo validar que una orden no se pueda entregar sin antes haber impreso su sticker?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: MezclasTablero verifica printedStickersMap antes de permitir entrega.',
    expectedResult: 'El sistema bloquea la entrega si el mapa de stickers no tiene tildada la impresión obligatoria.',
    route: '/mezclas',
    routeLabel: 'Ir al Tablero Kanban',
    synonyms: ['bloqueo sin sticker', 'obligatorio imprimir', 'etiqueta obligatoria', 'candado rotulado'],
    summary: 'Mecanismo de control a prueba de errores (Poka-Yoke) para evitar despachos ciegos.',
    steps: [
      {
        title: 'Verificar el estado del sticker en la tarjeta',
        instruction: 'Si el sticker no ha sido impreso, aparecerá un ícono de alerta naranja: "Sticker Pendiente".'
      },
      {
        title: 'Imprimir el sticker para desbloquear',
        instruction: 'Abre el modal, envía la impresión y el ícono cambiará a check verde: "Sticker Verificado".'
      },
      {
        title: 'Finalizar la entrega con éxito',
        instruction: 'El botón de "Marcar como Entregado" quedará completamente habilitado.'
      }
    ],
    contingency: 'Si la impresora está dañada, un usuario con rol de Administrador puede ingresar su PIN para omitir temporalmente la restricción.'
  },
  {
    id: 'ESC-PRD-44',
    title: '¿Cómo rastrear el número de lote (LOT-MZ) impreso en el tarro hasta su orden original?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Buscador omni-canal localiza la orden y el Kárdex al pistolear el código de barras.',
    expectedResult: 'En 2 segundos se conoce quién fabricó la pintura, qué materias primas usó y qué día salió de planta.',
    route: '/mezclas',
    routeLabel: 'Ir al Historial de Mezclas',
    synonyms: ['rastrear lote', 'pistolear codigo tarro', 'trazabilidad lote mz', 'auditoria de calidad'],
    summary: 'Respuesta inmediata ante reclamos de clientes en obra mostrando la evidencia de fabricación.',
    steps: [
      {
        title: 'Escanear el código de barras del tarro',
        instruction: 'Pistolea el código impreso en la etiqueta directamente en el buscador de Avalon.'
      },
      {
        title: 'Visualizar la orden madre',
        instruction: 'Avalon abrirá la ficha completa: orden de venta, operario que mezcló, pesos reales de báscula y fecha/hora exacta.'
      }
    ],
    contingency: 'Si el código de barras está manchado, digita manualmente el texto alfanumérico impreso debajo de las barras.'
  },
  {
    id: 'ESC-PRD-45',
    title: '¿Cómo verificar la fecha de vencimiento y recomendaciones de seguridad impresas en la etiqueta?',
    module: 'Producción & Mezclas',
    moduleId: 'produccion',
    subtopic: 'Tintometría & Rotulado',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: LabelPreviewModal calcula automáticamente fecha de vencimiento a 12 meses y pictogramas SGA.',
    expectedResult: 'Cumplimiento de la norma técnica colombiana de rotulado de sustancias químicas inflamables y tóxicas.',
    route: '/tintometria',
    routeLabel: 'Ir a Tintometría',
    synonyms: ['vencimiento pintura', 'pictogramas sga', 'seguridad quimica', 'etiqueta inflamable'],
    summary: 'Inspección de datos legales y advertencias para transporte terrestre de mercancías peligrosas.',
    steps: [
      {
        title: 'Comprobar fecha de vencimiento en el preview',
        instruction: 'El sistema estipula automáticamente 12 meses de vida útil a partir de la fecha de fabricación.'
      },
      {
        title: 'Verificar rombo SGA / NFPA',
        instruction: 'Comprueba que los pictogramas de llama (inflamable) y toxicidad estén impresos con suficiente nitidez.'
      }
    ],
    contingency: 'Para productos catalizados de dos componentes (2K), la etiqueta imprime la advertencia: "Vida útil de mezcla (Pot Life): 4 horas una vez catalizado".'
  }
];
