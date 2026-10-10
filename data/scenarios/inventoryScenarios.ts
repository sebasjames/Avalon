import { HumanScenario } from './types';

export const INVENTORY_SCENARIOS: HumanScenario[] = [
  // =========================================================================
  // SUBTEMA 1: Entradas de Almacén, Compras & Landed Cost (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-INV-01',
    title: '¿Cómo dar entrada a nueva mercancía recibida con fletes y gastos Landed Cost?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El motor Landed Cost distribuye fletes, seguros y aranceles sobre el costo unitario de cada producto según kilos/volumen.',
    expectedResult: 'El producto suma existencias en bodega física y actualiza su costo promedio ponderado exacto para no vender a pérdida.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['entrada mercancia', 'recepcion compra', 'landed cost', 'fletes adicionales', 'costo nacionalizacion', 'factura compra'],
    summary: 'Recepción formal de compras de materias primas o pinturas terminadas prorrateando los gastos de transporte en el costo unitario.',
    steps: [
      {
        title: 'Abrir el Centro de Inventarios',
        instruction: 'En el menú lateral, dirígete a "Operación > Centro de Inventarios" y haz clic en "Nueva Entrada de Almacén".'
      },
      {
        title: 'Seleccionar proveedor y digitar factura',
        instruction: 'Elige el proveedor (nacional o extranjero), ingresa el número de factura de compra y agrega los productos verificados físicamente en muelle.'
      },
      {
        title: 'Prorratear fletes y aranceles (Landed Cost)',
        instruction: 'En la sección "Gastos Logísticos Adicionales", ingresa el valor de la guía de transporte (ej: $350.000 COP de flete terrestre). El sistema distribuirá el costo proporcionalmente por peso o valor.',
        proTip: 'Avalon calculará el "Colchón Real Matemático" para comparar el flete estimado contra el cobrado por la transportadora.'
      },
      {
        title: 'Aprobar e ingresar a Kárdex',
        instruction: 'Presiona "Confirmar Entrada". El stock disponible aumentará de inmediato y el costo promedio de inventario quedará actualizado.'
      }
    ],
    contingency: 'Si la factura del flete llega días después de la mercancía, puedes ingresar la entrada con costo FOB provisional y aplicar un "Ajuste de Landed Cost Extemporáneo".'
  },
  {
    id: 'ESC-INV-02',
    title: '¿Cómo liquidar una importación marítima con aranceles, seguro y colchón aduanero?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo Compendio Contable de Nacionalización en LandedCostCompendium convierte USD/EUR a COP con TRM aduanera.',
    expectedResult: 'Se calcula el costo unitario nacionalizado exacto por kilogramo importado con desglose de arancel e IVA importaciones.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['importacion', 'nacionalizacion', 'aduana', 'arancel', 'trm importacion', 'colchon aduanero', 'fob importado'],
    summary: 'Liquidación técnica de contenedores marítimos de resinas y pigmentos italianos (ILVA/Vetro) con conversión de moneda extranjera.',
    steps: [
      {
        title: 'Acceder al Compendio de Nacionalización',
        instruction: 'En el Centro de Inventarios, abre la pestaña "Compendio de Nacionalización / Landed Cost".'
      },
      {
        title: 'Digitar valores FOB, TRM y moneda',
        instruction: 'Ingresa la moneda de origen (USD o EUR), la TRM oficial de la Declaración de Importación de la DIAN y el valor FOB total de la factura.'
      },
      {
        title: 'Cargar gastos de puerto, agenciamiento y flete marítimo',
        instruction: 'Digita los gastos locales en pesos: bodegajes de puerto, flete internacional, arancel y seguro de carga.',
        warning: 'Verifica que el Colchón de Nacionalización no sea negativo; un colchón negativo alerta que los gastos aduaneros superaron el presupuesto estimado.'
      },
      {
        title: 'Guardar y asentar en el Kárdex de importaciones',
        instruction: 'Presiona "Asentar Costos Nacionalizados" para reflejar el nuevo costo promedio en pesos por kilo de materia prima.'
      }
    ],
    contingency: 'Si la DIAN inspecciona el contenedor y genera sobrecostos de bodegaje en puerto, añádelos como gasto extraordinario en la liquidación.'
  },
  {
    id: 'ESC-INV-03',
    title: '¿Qué hacer si el proveedor envió menos unidades de las facturadas (faltante en remisión)?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite entrada parcial con generación automática de Acta de Novedad para Nota Crédito de proveedor.',
    expectedResult: 'El Kárdex solo ingresa lo contado físicamente y se emite la novedad contable para cruzar la cuenta por pagar.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['faltante proveedor', 'llegaron menos unidades', 'factura incompleta', 'faltaron cuñetes', 'discrepancia recepcion'],
    summary: 'Procedimiento de muelle cuando la factura indica por ejemplo 50 cuñetes pero el camión solo descargó 47 unidades.',
    steps: [
      {
        title: 'Efectuar conteo ciego en el muelle de descarga',
        instruction: 'El almacenista cuenta los bultos o cuñetes antes de firmarle la planilla al transportador de la carga.'
      },
      {
        title: 'Registrar la cantidad física real en Avalon V1',
        instruction: 'Al crear la Entrada de Almacén, digita únicamente las unidades que entraron a bodega (ej: 47 de 50).'
      },
      {
        title: 'Marcar la casilla "Recepción Parcial con Novedad"',
        instruction: 'El sistema marcará un faltante de 3 unidades y generará el reporte de discrepancia con fecha, placa del camión y firma del conductor.',
        warning: 'Firma la remisión física de la transportadora con la anotación: "Recibido con faltante de 3 cuñetes por verificar con proveedor".'
      },
      {
        title: 'Enviar reporte a Compras y Contabilidad',
        instruction: 'Presiona "Notificar Faltante a Proveedor". Compras solicitará el envío del saldo o la respectiva Nota Crédito comercial.'
      }
    ],
    contingency: 'Si el proveedor asegura que las unidades faltantes vienen en un segundo camión mañana, la entrada se mantendrá en estado "Pendiente de Completar".'
  },
  {
    id: 'ESC-INV-04',
    title: '¿Cómo gestionar un producto que llega con el empaque roto, lata perforada o goteando?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Aísla la mercancía dañada en bodega "Cuarentena / Dañados" sin ingresarla al stock disponible para la venta.',
    expectedResult: 'Se previene la contaminación de bodega, no se compromete stock averiado en el POS y se tramita el reclamo de transporte.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['empaque roto', 'lata perforada', 'derrame proveedor', 'llegaron tarros rotos', 'pintura regada', 'cuarentena recepcion'],
    summary: 'Protocolo de recepción cuando los recipientes sufrieron golpes en tránsito que comprometen la calidad o generan derrames químicos.',
    steps: [
      {
        title: 'Tomar evidencia fotográfica inmediata',
        instruction: 'Fotografía el envase averiado, la placa del camión transportador y el estado de la estiba antes de mover el producto.'
      },
      {
        title: 'Poner la mercancía dañada en zona de contención',
        instruction: 'Traslada el envase perforado a una bandeja antiderrames para evitar que el químico manche el suelo o contamine otras referencias.'
      },
      {
        title: 'Ingresar en Avalon V1 con destino "Cuarentena / Avería"',
        instruction: 'En la Entrada de Almacén, registra las unidades intactas a "Bodega Principal" y las unidades averiadas a "Bodega Cuarentena".',
        proTip: 'Esto evita que el punto de venta o el taller de mezclas intenten facturar o formular con un tarro que está perdiendo peso.'
      },
      {
        title: 'Generar Informe de No Conformidad en Recepción',
        instruction: 'Adjunta las fotos en Avalon y emite el reclamo formal a la aseguradora de carga o al proveedor de la pintura.'
      }
    ],
    contingency: 'Si el químico es altamente inflamable o tóxico, activa el kit de emergencias químicas de bodega (arena absorbente y extintor).'
  },
  {
    id: 'ESC-INV-05',
    title: '¿Cómo rechazar mercancía en portería y devolverla inmediatamente al transportador?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite rechazo total de orden de compra sin impactar kárdex con emisión de Acta de Rechazo en Muelle.',
    expectedResult: 'El camión se retira con la mercancía no conforme y no se genera ninguna obligación de pago en Contabilidad.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['rechazo mercancia', 'rechazar camion', 'devolver en porteria', 'producto equivocado proveedor', 'no recibir'],
    summary: 'Procedimiento de rechazo total cuando el proveedor despacha un lote caducado, una referencia incorrecta o sin documentos legales.',
    steps: [
      {
        title: 'Constatar la causa legal de rechazo',
        instruction: 'Causales válidas: mercancía sin factura/remisión, producto caducado o próximo a vencer, o referencias no solicitadas por Procoquinal.'
      },
      {
        title: 'Rechazar la orden en el módulo de Recepción',
        instruction: 'En Avalon V1, localiza la orden de compra pendiente y selecciona "Rechazar en Muelle". Indica el motivo técnico formal.'
      },
      {
        title: 'Firmar la guía del transportador con causal de rechazo',
        instruction: 'Escribe en la guía física del camión: "MERCANCÍA RECHAZADA POR PROCOQUINAL: PRODUCTO NO CORRESPONDE A LA ORDEN DE COMPRA".',
        warning: 'NUNCA firmes con sello de recibido limpio si el camión se va a llevar la mercancía de regreso.'
      },
      {
        title: 'Notificar al departamento de Compras',
        instruction: 'Comunica el rechazo a Compras para que suspendan la radicación de la factura electrónica en la DIAN.'
      }
    ],
    contingency: 'Si el transportador se niega a llevarse el producto, no permitas la descarga y solicita apoyo al Jefe de Seguridad de Planta.'
  },
  {
    id: 'ESC-INV-06',
    title: '¿Cómo realizar una devolución a proveedor posterior por defecto de calidad en taller?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera salida de inventario por devolución de compra descontando del pasivo con el proveedor.',
    expectedResult: 'El Kárdex resta las unidades defectuosas y emite la orden de salida para despacho al fabricante.',
    route: '/returns',
    routeLabel: 'Ir al Panel de Devoluciones',
    synonyms: ['devolucion a proveedor', 'reclamo garantia materia prima', 'resina defectuosa', 'devolver materia prima', 'nota debito proveedor'],
    summary: 'Trámite de retorno de materias primas que al abrirse en el taller de formulación presentaron gelificación, grumos o falta de reactividad.',
    steps: [
      {
        title: 'Solicitar dictamen del Laboratorio de Calidad',
        instruction: 'El laboratorista emitirá el reporte de no conformidad confirmando que el lote del proveedor no cumple con la viscosidad o pureza pactada.'
      },
      {
        title: 'Ingresar a "Contabilidad & Caja > Devoluciones"',
        instruction: 'Selecciona la pestaña "Devolución a Proveedores / Compras".'
      },
      {
        title: 'Localizar la factura de compra original y marcar los ítems',
        instruction: 'Selecciona los cuñetes o tambores a retornar y adjunta el informe técnico del laboratorio.'
      },
      {
        title: 'Generar la Remisión de Salida y Nota Débito',
        instruction: 'Presiona "Aprobar Devolución a Proveedor". El stock saldrá del Kárdex y se emitirá la remisión para que el transportador retire la carga.',
        proTip: 'Contabilidad aplicará la Nota Débito contra las facturas futuras que se le deban a ese mismo proveedor.'
      }
    ],
    contingency: 'Conserva siempre una contramuestra sellada de 500 gramos en el Laboratorio para cualquier controversia técnica con el fabricante.'
  },
  {
    id: 'ESC-INV-07',
    title: '¿Cómo registrar una compra de urgencia en mostrador sin orden de compra previa?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite entrada rápida directa vinculando factura de contado o caja menor.',
    expectedResult: 'El producto se ingresa a existencias en menos de 2 minutos para permitir su venta inmediata en mostrador.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['compra urgente', 'sin orden de compra', 'compra directa', 'entrada rapida', 'comprar en la esquina'],
    summary: 'Ingreso express de insumos adquiridos de emergencia en ferreterías locales (ej: brochas, cinta de enmascarar o solventes).',
    steps: [
      {
        title: 'Abrir "Entrada Rápida / Directa"',
        instruction: 'En el Centro de Inventarios, presiona el botón "Entrada Directa sin OC".'
      },
      {
        title: 'Buscar el SKU o crearlo si es nuevo',
        instruction: 'Escribe el nombre del producto o selecciona la referencia del catálogo.'
      },
      {
        title: 'Digitar cantidad recibida y precio de compra de contado',
        instruction: 'Ingresa las unidades y el valor cancelado con dinero de Caja Menor o tarjeta empresarial.',
        warning: 'Verifica que el precio de venta al público en el POS mantenga el margen comercial mínimo del 25%.'
      },
      {
        title: 'Finalizar y colocar en exhibición',
        instruction: 'Presiona "Guardar Entrada". Los productos quedarán habilitados de inmediato en el POS para facturación.'
      }
    ],
    contingency: 'Grapa la factura física de contado al comprobante de entrada para que el administrador la legalice en el arqueo del día.'
  },
  {
    id: 'ESC-INV-08',
    title: '¿Cómo asignar lote y fecha de vencimiento a materias primas químicas perecederas?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra código de batch del fabricante y fecha de caducidad para alertas de rotación PEPS.',
    expectedResult: 'El sistema asocia las unidades al lote específico y calendariza alertas preventivas de vencimiento.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['asignar lote', 'fecha de vencimiento', 'caducidad resina', 'lote fabricante', 'trazabilidad lote', 'vencimiento quimico'],
    summary: 'Control riguroso de fechas de vida útil de catalizadores y resinas con vida de almacenamiento limitada (shelf-life).',
    steps: [
      {
        title: 'Identificar la etiqueta del fabricante en el tambor',
        instruction: 'Ubica el número de lote (Batch No.) y la fecha de expiración indicada en la etiqueta original del envase.'
      },
      {
        title: 'Ingresar los datos en la pantalla de Entrada de Almacén',
        instruction: 'En la línea del producto, despliega el campo "Lote & Vencimiento", digita el código de lote (ej: L-2026-B44) y selecciona el día/mes/año de caducidad.'
      },
      {
        title: 'Verificar la regla de rotación automática',
        instruction: 'Avalon programará este lote para consumo prioritario mediante el método PEPS (Primero en Entrar, Primero en Salir).',
        proTip: 'Los catalizadores poliuretánicos suelen tener una vida útil de 6 meses; si el lote tiene menos de 60 días de vigencia, notifica a Compras.'
      }
    ],
    contingency: 'Si el fabricante no imprimió fecha de vencimiento, toma la fecha de fabricación y suma el periodo estándar indicado en la Hoja Técnica.'
  },
  {
    id: 'ESC-INV-09',
    title: '¿Cómo ingresar envases vacíos, cuñetes plásticos y latas de hojalata al inventario?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Categorizados como "Insumos de Empaque / Packaging" descontables por orden de producción.',
    expectedResult: 'Las unidades de envases suman al kárdex de empaque para que Producción pueda envasar lotes mezclados.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['envases vacios', 'latas hojalata', 'cuñetes plasticos', 'tarros vacios', 'empaques', 'ingreso envases'],
    summary: 'Administración de inventario de recipientes y tapas necesarios para la tintometría y envasado en planta.',
    steps: [
      {
        title: 'Filtrar por categoría "Empaque & Envases"',
        instruction: 'En el Centro de Inventarios, selecciona la categoría de Packaging.'
      },
      {
        title: 'Contar las pacas o estibas de envases',
        instruction: 'Cuenta las cantidades por capacidad: Tambor 55 Galones, Cuñete 5 Galones, Galón (3.785 L), Cuarto (0.946 L) y Octavo.'
      },
      {
        title: 'Crear la entrada con costo unitario de hojalatería',
        instruction: 'Registra la entrada con el valor facturado por el proveedor de envases plásticos o metálicos.',
        warning: 'Revisa que las tapas vengan con sus empaques de nitrilo herméticos; envases sin tapa no deben ser aprobados.'
      }
    ],
    contingency: 'Si llegan envases golpeados o sin manija plástica, repórtalos como merma de empaque para solicitar reposición.'
  },
  {
    id: 'ESC-INV-10',
    title: '¿Qué hacer si hay diferencia de precio entre la orden de compra y la factura radicada?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Alerta variación de tarifa mayor al 2% y exige autorización de Gerencia de Compras antes de asentar.',
    expectedResult: 'Se evita cargar sobrecostos no pactados a la empresa y se congela la radicación hasta conciliar el precio.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['precio diferente factura', 'variacion precio compra', 'aumento no autorizado', 'cobro de mas proveedor', 'diferencia tarifa'],
    summary: 'Detección automática de discrepancias comerciales cuando el proveedor factura a un precio superior al cotizado.',
    steps: [
      {
        title: 'Cargar la factura electrónica en Avalon V1',
        instruction: 'Al ingresar el valor facturado, el sistema comparará el costo unitario contra la Orden de Compra (OC) aprobada.'
      },
      {
        title: 'Observar la alerta de Variación de Costo',
        instruction: 'Si el precio subió más del 2%, Avalon mostrará: "ALERTA: El costo del ítem aumentó de $45.000 a $48.500 (+7.7%). Requiere autorización".'
      },
      {
        title: 'Verificar la causa con el comprador de Procoquinal',
        instruction: 'Consulta si hubo un incremento internacional de materias primas o si se trata de un error de digitación del proveedor.'
      },
      {
        title: 'Autorizar o solicitar refacturación',
        instruction: 'Si el incremento no fue acordado, rechaza la factura electrónica en el buzón DIAN y exige el envío de la Nota Crédito comercial.',
        warning: 'Nunca apruebes una entrada con sobrecosto sin la firma digital del Director de Compras.'
      }
    ],
    contingency: 'Para no frenar la producción, puedes descargar la mercancía en custodia temporal mientras el área contable concilia el valor.'
  },
  {
    id: 'ESC-INV-11',
    title: '¿Cómo dar entrada a una bonificación comercial del proveedor (producto recibido gratis / $0)?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Entradas de Almacén & Landed Cost',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite entrada con concepto "Bonificación Comercial" reduciendo el costo promedio ponderado de la bodega.',
    expectedResult: 'Las existencias físicas aumentan sin generar pasivo financiero y el costo promedio unitario disminuye favorablemente.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['bonificacion proveedor', 'producto gratis', 'pague 10 lleve 12', 'obsequio proveedor', 'mercancia regalada'],
    summary: 'Registro contable y físico de unidades adicionales entregadas por proveedores en promociones de volumen.',
    steps: [
      {
        title: 'Identificar las unidades bonificadas en la factura',
        instruction: 'Comprueba que en la factura del proveedor los ítems aparezcan identificados como "Bonificación / Muestra sin valor comercial ($0)".'
      },
      {
        title: 'Seleccionar tipo de entrada: "Bonificación Comercial"',
        instruction: 'En Avalon V1, marca la casilla "Bonificación". El sistema permitirá registrar el costo en $0 asociándolo a la compra principal.'
      },
      {
        title: 'Comprobar el impacto en el costo promedio',
        instruction: 'Observa cómo el costo promedio de esa referencia disminuye automáticamente (ej: 10 cuñetes a $100.000 + 2 cuñetes a $0 = nuevo costo promedio de $83.333 por cuñete).',
        proTip: 'Esta reducción del costo promedio eleva el margen de rentabilidad de la tienda en las ventas siguientes.'
      }
    ],
    contingency: 'Asegúrate de que la bonificación corresponda a la misma referencia que se comercializa habitualmente en catálogo.'
  },

  // =========================================================================
  // SUBTEMA 2: Traslados Entre Bodegas & Control en Tránsito (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-INV-12',
    title: '¿Cómo crear un traslado interno entre Planta Principal y Sucursal Barranquilla?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera remisión de traslado, descuenta de origen y aloja en bodega "Transito" hasta recepción formal.',
    expectedResult: 'La mercancía queda registrada en viaje intermunicipal con número de guía, transportador y sello de seguridad.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['traslado barranquilla', 'mover a sucursal', 'remision entre bodegas', 'despacho intermunicipal', 'traslado plantas'],
    summary: 'Transferencia de producto terminado entre sedes de Procoquinal garantizando que no se dupliquen ni desaparezcan existencias.',
    steps: [
      {
        title: 'Acceder al módulo Inventario en Tránsito',
        instruction: 'Navega a "Operación > Inventario Tránsito" (/inventario-transito) y presiona "Nuevo Traslado".'
      },
      {
        title: 'Seleccionar bodega de origen y destino',
        instruction: 'Elige Origen: "Centenario (Planta Principal)" y Destino: "Barranquilla".'
      },
      {
        title: 'Agregar productos y número de precinto',
        instruction: 'Digita los SKUs, cantidades a trasladar y el número de sello/precinto plástico de seguridad del camión.'
      },
      {
        title: 'Confirmar salida y generar Remisión de Traslado',
        instruction: 'Presiona "Despachar Traslado". Se imprimirá la planilla para el transportador y el stock se descontará de la bodega de origen.',
        warning: 'El producto permanecerá en estado "TRANSITO" y no se podrá vender en Barranquilla hasta que la sucursal confirme el recibo.'
      }
    ],
    contingency: 'Si la orden de traslado se digitó con destino incorrecto, cancélala de inmediato antes de que el camión salga de báscula.'
  },
  {
    id: 'ESC-INV-13',
    title: '¿Cómo funciona la protección de stock mientras el camión está en ruta (Bodega Transito)?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: La bodega virtual "Transito" aísla los productos; el ATP bloquea ventas simultáneas en origen y destino.',
    expectedResult: 'Ningún vendedor puede facturar mercancía que está físicamente viajando por carretera.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['stock en ruta', 'bodega transito', 'camion en carretera', 'bloqueo traslado', 'doble venta traslado'],
    summary: 'Mecanismo de seguridad lógica que previene la sobreventa de productos durante viajes que toman de 12 a 48 horas.',
    steps: [
      {
        title: 'Comprender el estado "TRANSITO"',
        instruction: 'En cuanto se firma el despacho en Centenario, las unidades salen del stock de Centenario y entran a la cuenta contable "1435 - Inventario en Tránsito".'
      },
      {
        title: 'Intentar consultar en mostrador de Barranquilla',
        instruction: 'Si un asesor en Barranquilla busca el producto en el POS, el stock disponible indicará 0 unidades (o solo las existencias que ya tenían en estantería).'
      },
      {
        title: 'Monitorear la ruta en el tablero de traslados',
        instruction: 'En el tablero de tránsito verás la hora de salida, tiempo estimado de viaje y nombre del chofer.',
        proTip: 'Esta separación estricta evita reclamos de clientes en tienda esperando productos de un camión que aún no llega.'
      }
    ],
    contingency: 'En caso de urgencia de un cliente corporativo, el Administrador puede consultar el arribo estimado para pre-vender con reserva condicionada.'
  },
  {
    id: 'ESC-INV-14',
    title: '¿Qué hacer si mercancía se extravió o fue hurtada durante el trayecto en camión?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite registrar "Siniestro / Pérdida en Tránsito" generando acta de reclamación aseguradora.',
    expectedResult: 'El inventario en tránsito se cancela, se traslada la pérdida a la cuenta de reclamos a transportadora y se notifica a Gerencia.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['robo camion', 'perdida transito', 'mercancia extraviada', 'pirateria terrestre', 'accidente transporte', 'siniestro traslado'],
    summary: 'Protocolo de contingencia y reporte legal ante pérdidas o hurtos de carga durante el transporte intermunicipal.',
    steps: [
      {
        title: 'Exigir el reporte formal de la empresa de transporte',
        instruction: 'Solicita a la transportadora la denuncia policial de la fiscalía o el informe de novedad de carretera con fecha y hora.'
      },
      {
        title: 'Ingresar a Inventario en Tránsito (/inventario-transito)',
        instruction: 'Localiza la remisión de traslado afectada por el siniestro.'
      },
      {
        title: 'Hacer clic en "Reportar Siniestro / Pérdida en Ruta"',
        instruction: 'Marca los productos extraviados y selecciona la causal: "Robo / Hurto en Tránsito" o "Volcamiento de Vehículo".'
      },
      {
        title: 'Asentar la salida contable de tránsito',
        instruction: 'Presiona "Confirmar Baja por Siniestro". Los productos saldrán de la cuenta de tránsito y se trasladarán a "Cuentas por Cobrar a Aseguradora / Transportadora".',
        warning: 'Adjunta el denuncio penal en el registro de Avalon para el cobro de la póliza de seguro de transporte.'
      }
    ],
    contingency: 'Si solo se perdió una fracción de la carga, realiza una "Recepción Parcial con Novedad" ingresando lo recuperado (ESC-INV-15).'
  },
  {
    id: 'ESC-INV-15',
    title: '¿Cómo realizar la recepción parcial en destino si llegaron 18 cuñetes de 20 despachados?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Ingresa los 18 a bodega destino y deja las 2 unidades faltantes en investigación de transporte.',
    expectedResult: 'La sede receptora recibe las unidades sanas y el sistema emite automáticamente el cobro del faltante al chofer.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['recepcion parcial traslado', 'faltaron cuñetes traslado', 'llegaron menos en destino', 'novedad descarga sucursal'],
    summary: 'Recepción formal en sucursal cuando el camión llega con diferencias físicas respecto a la remisión despachada.',
    steps: [
      {
        title: 'Verificar el precinto de seguridad del camión',
        instruction: 'Revisa si el precinto plástico llegó roto o con un número diferente al anotado en la remisión de salida.'
      },
      {
        title: 'Abrir el traslado en el módulo Inventario Tránsito',
        instruction: 'En la sede Barranquilla, localiza el traslado entrante y presiona "Recibir Mercancía".'
      },
      {
        title: 'Modificar la cantidad recibida a 18 unidades',
        instruction: 'Digita 18 en el campo recibido. Avalon alertará de inmediato: "Faltante en Recepción: 2 cuñetes".'
      },
      {
        title: 'Firmar la planilla con salvedad y confirmar',
        instruction: 'Anota en la copia física del transportador el faltante exacto y presiona "Aprobar Recepción Parcial".',
        proTip: 'Los 18 cuñetes quedarán habilitados para la venta en Barranquilla de inmediato, sin esperar la resolución del conflicto.'
      }
    ],
    contingency: 'Si los 2 cuñetes se quedaron por error en la bodega de Centenario sin cargar, el administrador de Centenario anulará el saldo restante.'
  },
  {
    id: 'ESC-INV-16',
    title: '¿Cómo usar la distribución asistida (Split Transit) para repartir contenedores entre bodegas?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El motor Split Transit sugiere distribución óptima entre Centenario, Gaitán y Barranquilla según demanda histórica.',
    expectedResult: 'El cargamento de un contenedor se fracciona automáticamente en las órdenes de traslado a cada punto de venta.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['split transit', 'repartir contenedor', 'distribuir carga', 'fraccionar recepcion', 'sugerencia distribucion'],
    summary: 'Asignación rápida de grandes volúmenes importados a las diferentes bodegas y puntos de venta de la compañía.',
    steps: [
      {
        title: 'Abrir el recibo de importación en tránsito',
        instruction: 'En "Inventario Tránsito", localiza el contenedor de importación entrante.'
      },
      {
        title: 'Hacer clic en "Sugerir Distribución / Split"',
        instruction: 'El sistema analizará el inventario actual y la velocidad de venta de cada tienda para sugerir porcentajes (ej: 50% Centenario, 30% Barranquilla, 20% Gaitán).'
      },
      {
        title: 'Ajustar manualmente si se requiere',
        instruction: 'Edita las cantidades para cada ubicación según los pedidos especiales pendientes de despacho.'
      },
      {
        title: 'Generar los traslados derivados',
        instruction: 'Presiona "Aprobar Distribución". Se crearán automáticamente las guías de traslado para cada destino final.',
        proTip: 'Esto ahorra hasta 2 horas de digitación manual de traslados individuales por producto.'
      }
    ],
    contingency: 'Si una sede no tiene espacio físico en estantería para recibir el volumen sugerido, reasigna el excedente a Centenario.'
  },
  {
    id: 'ESC-INV-17',
    title: '¿Cómo registrar un traslado urgente mano a mano de un galón entre tiendas para un cliente?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Traslado Exprés Local" que descuenta y carga en minutos mediante mensajero en moto.',
    expectedResult: 'El producto se traslada de tienda en tiempo récord para cerrar una venta importante de mostrador.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['traslado express', 'pedir prestado a otra tienda', 'mensajero galon', 'traslado urgente', 'socorro entre tiendas'],
    summary: 'Intercambio ágil de una referencia agotada en una tienda pero disponible en otra sede de la misma ciudad.',
    steps: [
      {
        title: 'Confirmar existencia física telefónicamente',
        instruction: 'Llama al encargado de la otra sede (ej: Punto Gaitán) para que tome la lata de la estantería física y la aparte.'
      },
      {
        title: 'Crear Traslado Exprés en Avalon V1',
        instruction: 'En Inventario Tránsito, presiona "Traslado Exprés Urbano", selecciona origen (Gaitán), destino (Centenario) y cantidad (1 Galón).'
      },
      {
        title: 'Despachar con el domiciliario / mensajero en moto',
        instruction: 'El mensajero recoge el producto con la remisión exprés impresa.'
      },
      {
        title: 'Recepción inmediata al llegar a la caja',
        instruction: 'El cajero receptor presiona "Recibir Exprés"; el galón ingresa al sistema y se puede facturar al cliente que espera en mostrador.',
        proTip: 'El tiempo total de tránsito se marca como "Urbano Exprés" para no exigir guías de carga intermunicipal.'
      }
    ],
    contingency: 'Si el cliente se fue antes de que el mensajero llegara, mantén el producto en la estantería de la nueva sede.'
  },
  {
    id: 'ESC-INV-18',
    title: '¿Cómo cancelar un traslado cuando el camión aún no ha salido de portería?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Abortar / Cancelar Traslado" devuelve el stock al almacén de origen sin registros de tránsito.',
    expectedResult: 'El traslado se anula, el inventario regresa íntegro a las existencias de Centenario y se destruye la remisión.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['cancelar traslado', 'abortar viaje', 'camion no salio', 'anular remision traslado', 'devolver a bodega salida'],
    summary: 'Reversión rápida de una orden de transporte cuando el viaje se suspende por orden de gerencia o daño mecánico del camión.',
    steps: [
      {
        title: 'Verificar que el camión no haya cruzado la portería',
        instruction: 'Confirma que la mercancía siga físicamente dentro de las instalaciones de Procoquinal.'
      },
      {
        title: 'Localizar el traslado en Inventario en Tránsito',
        instruction: 'Filtra por los traslados creados en la última hora en estado "TRANSITO".'
      },
      {
        title: 'Presionar "Cancelar Traslado / Reintegrar a Bodega"',
        instruction: 'Haz clic en el botón rojo de cancelación y escribe la justificación (ej: "Falla mecánica del furgón antes de salir").'
      },
      {
        title: 'Descargar el producto del camión y guardar en estante',
        instruction: 'Regresa los cuñetes a sus estibas originales en la bodega.',
        warning: 'Rompe la remisión impresa original para evitar que el conductor intente usarla posteriormente.'
      }
    ],
    contingency: 'Si el camión ya salió a la vía pública, NO se puede cancelar directamente; debe registrarse el traslado completo y generar un traslado de retorno.'
  },
  {
    id: 'ESC-INV-19',
    title: '¿Cómo reubicar mercancía internamente entre pasillos y racks de la misma bodega?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modificación de ubicación física (Rack/Nivel/Posición) sin alterar existencias numéricas de Kárdex.',
    expectedResult: 'El sistema actualiza la dirección de estantería del producto para que los despachadores lo localicen al instante.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['reubicar producto', 'mover de estante', 'cambiar de pasillo', 'posicion rack', 'ordenar bodega', 'mover de rack'],
    summary: 'Organización física del almacén para mejorar los tiempos de alistamiento y respetar zonas de almacenamiento seguro.',
    steps: [
      {
        title: 'Localizar el producto en el Centro de Inventarios',
        instruction: 'Busca la referencia por SKU o nombre.'
      },
      {
        title: 'Hacer clic en "Editar Ubicación en Bodega"',
        instruction: 'En los detalles del producto, pulsa el ícono de mapa/ubicación (MapPin).'
      },
      {
        title: 'Actualizar código de posición física',
        instruction: 'Ingresa la nueva nomenclatura (ej: Pasillo 3, Rack B, Nivel 2: "P3-RB-N2").',
        proTip: 'Ubica siempre los productos de mayor rotación (Clasificación A) en los niveles inferiores y cercanos al muelle de despacho.'
      },
      {
        title: 'Guardar cambios',
        instruction: 'Presiona "Actualizar Ubicación". La nueva dirección saldrá impresa en las próximas planillas de alistamiento (Picking).'
      }
    ],
    contingency: 'Pega una cinta adhesiva de rotulación en el nuevo rack con el SKU del producto para evitar confusiones de los operarios.'
  },
  {
    id: 'ESC-INV-20',
    title: '¿Cómo controlar inventario entregado en custodia o consignación a talleres aliados?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Mantiene bodega virtual "Consignación - Taller X" donde el stock sigue siendo propiedad de Procoquinal.',
    expectedResult: 'Se audita el inventario en poder del tercero hasta que este reporte el consumo real para facturarlo.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['consignacion', 'taller aliado', 'stock en custodia', 'maquila', 'producto en comodato', 'bodega cliente'],
    summary: 'Manejo de pinturas y barnices depositados en las instalaciones de talleres carroceros estratégicos bajo modalidad de consignación.',
    steps: [
      {
        title: 'Crear traslado a "Bodega Consignación - [Nombre Taller]"',
        instruction: 'El stock sale de bodega principal pero permanece como activo de Procoquinal en la bodega del taller aliado.'
      },
      {
        title: 'Hacer corte periódico de consumos',
        instruction: 'Al finalizar cada semana, el asesor técnico audita los tarros abiertos y vacíos en el taller.'
      },
      {
        title: 'Facturar únicamente el volumen consumido',
        instruction: 'En el POS, factura los galones consumidos descontándolos de la bodega de consignación de ese taller específico.',
        proTip: 'Esta modalidad fideliza a los talleres industriales asegurando que siempre tengan producto disponible para pintar.'
      }
    ],
    contingency: 'Si el taller aliado entra en cese de actividades o mora financiera, Procoquinal retira el stock no consumido mediante Acta de Restitución.'
  },
  {
    id: 'ESC-INV-21',
    title: '¿Qué hacer cuando un traslado en tránsito lleva más de 72 horas sin ser recibido en destino?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Traslados & Tránsito',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Alerta en rojo "Tránsito Crítico / Demorado" en el encabezado de Inventario en Tránsito.',
    expectedResult: 'Se dispara investigación de tráfico para localizar el vehículo e intervenir demoras por cierres viales o fallas.',
    route: '/inventario-transito',
    routeLabel: 'Ir a Inventario en Tránsito',
    synonyms: ['traslado demorado', 'transito critico', 'camion retrasado', 'alerta transito', 'mas de 72 horas'],
    summary: 'Detección proactiva de anomalías logísticas en envíos intermunicipales que exceden los tiempos normales de viaje.',
    steps: [
      {
        title: 'Identificar la alerta roja en el tablero',
        instruction: 'Los traslados con más de 72 horas aparecerán con el distintivo "RETRASO CRÍTICO (>72h)".'
      },
      {
        title: 'Contactar al operador logístico o chofer del furgón',
        instruction: 'Verifica el estado del trayecto: derrumbes en la vía Bogotá-Costa, paros de transporte o desperfectos mecánicos.'
      },
      {
        title: 'Actualizar la fecha estimada de arribo (ETA)',
        instruction: 'Ingresa la nueva fecha calculada y anota en la bitácora: "Vehículo varado en Aguachica; flete reprogramado para mañana".'
      },
      {
        title: 'Notificar al equipo comercial de la sede de destino',
        instruction: 'Informa a los asesores de la sucursal para que reprogramen las promesas de entrega con los clientes finales.',
        warning: 'Si el transportador no contesta y han pasado 96 horas, se debe activar el protocolo de rastreo satelital GPS.'
      }
    ],
    contingency: 'En caso de bloqueo total de vía por semanas, evalúa con la transportadora el transbordo de la carga a una ruta alterna.'
  },

  // =========================================================================
  // SUBTEMA 3: Kárdex, Ajustes & Conteos Cíclicos (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-INV-22',
    title: '¿Cómo realizar un conteo cíclico programado de fin de mes por familias ABC?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite exportar lista ciega de conteo, ingresar conteos físicos y calcular diferencias automáticamente.',
    expectedResult: 'Se obtiene el porcentaje de exactitud de inventario (IRA) y se concilian las existencias sin cerrar la operación comercial.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['conteo ciclico', 'inventario fin de mes', 'conteo fisico', 'toma fisica inventario', 'exactitud de inventario', 'conteo abc'],
    summary: 'Auditoría periódica de inventarios por zonas para mantener la exactitud del Kárdex por encima del 98%.',
    steps: [
      {
        title: 'Generar la Planilla Ciega de Conteo',
        instruction: 'En el Centro de Inventarios, presiona "Conteo Cíclico" y selecciona la familia a contar (ej: "Esmaltes Sintéticos / Clasificación A"). El sistema generará una hoja sin mostrar las cantidades teóricas.'
      },
      {
        title: 'Contar físicamente en estantería por parejas',
        instruction: 'Dos operarios cuentan lata por lata anotando en la planilla física (uno cuenta y el otro registra).'
      },
      {
        title: 'Digitar las cantidades contadas en Avalon V1',
        instruction: 'Ingresa los valores contados en la columna "Físico Real". Avalon calculará la diferencia: Sobrantes (+), Faltantes (-) y Coincidencias exactas.'
      },
      {
        title: 'Hacer reconteo de las discrepancias mayores al 1%',
        instruction: 'Vuelve a contar únicamente las referencias que presentaron diferencias para descartar errores de conteo humano antes de asentar.',
        proTip: 'Un conteo cíclico semanal evita tener que paralizar la empresa durante días en el inventario general de fin de año.'
      }
    ],
    contingency: 'Si una referencia presenta faltante crítico, revisa en el Kárdex si hubo despachos recientes pendientes de remisionar.'
  },
  {
    id: 'ESC-INV-23',
    title: '¿Cómo registrar un ajuste de Kárdex por merma de evaporación natural de solventes volátiles?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo ControlMermasTab permite asentar mermas por evaporación técnica con justificación química.',
    expectedResult: 'El Kárdex rebaja los litros mermados imputándolos a la cuenta de Costos de Pérdida Técnica Operativa.',
    route: '/control-mermas',
    routeLabel: 'Ir a Control de Mermas',
    synonyms: ['merma evaporacion', 'thinner evaporado', 'perdida solvente', 'evaporacion natural', 'merma quimica'],
    summary: 'Ajuste justificado de volumen en tanques y tambores de thinners, acetonas y alcoholes por volatilidad térmica.',
    steps: [
      {
        title: 'Medir el nivel del tanque o tambor con varilla milimetrada',
        instruction: 'Mide la altura del líquido y calcula el volumen real presente a la temperatura ambiente.'
      },
      {
        title: 'Acceder al módulo Control de Mermas (/control-mermas)',
        instruction: 'Navega en el menú lateral a "Operación > Control de Mermas".'
      },
      {
        title: 'Registrar la incidencia de merma por evaporación',
        instruction: 'Selecciona el SKU del solvente (ej: Thinner Corriente), digita los litros mermados (ej: 8 litros) y elige la causal: "Merma Técnica por Volatilidad / Evaporación".',
        warning: 'La norma técnica de Procoquinal admite un máximo de 1.5% de merma por evaporación mensual; mermas superiores requieren revisión de fugas o válvulas.'
      },
      {
        title: 'Guardar y asentar en el Kárdex',
        instruction: 'Presiona "Registrar Incidencia". El inventario teórico se ajustará al volumen medido y se generará el soporte para costos.'
      }
    ],
    contingency: 'Si la merma se repite en el mismo tanque, solicita mantenimiento urgente para cambiar los empaques de cierre de la tapa.'
  },
  {
    id: 'ESC-INV-24',
    title: '¿Cómo asentar un derrame accidental en bodega (lata caída del montacargas)?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra merma con cálculo automático de pérdida en pesos ($) y motivo "Derrame Accidental".',
    expectedResult: 'El producto destruido se da de baja del inventario, se valora el costo económico y se archiva el reporte de seguridad.',
    route: '/control-mermas',
    routeLabel: 'Ir a Control de Mermas',
    synonyms: ['derrame bodega', 'se cayo una lata', 'accidente montacargas', 'lata destruida', 'merma por dano', 'baja por derrame'],
    summary: 'Procedimiento de baja cuando una maniobra en bodega ocasiona la rotura y derrame total de un envase de pintura.',
    steps: [
      {
        title: 'Atender la seguridad del área y limpiar el derrame',
        instruction: 'Aplica arena o material absorbente del kit de derrames químicos, ventila la zona y retira los restos de hojalata dañada.'
      },
      {
        title: 'Ingresar a "Control de Mermas" en Avalon V1',
        instruction: 'Haz clic en "Registrar Incidencia Manual" en la pestaña de mermas.'
      },
      {
        title: 'Seleccionar el SKU y digitar las unidades destruidas',
        instruction: 'Elige la referencia (ej: Cuñete de Primer Epóxico) y selecciona motivo: "Derrame Accidental por Caída / Maniobra".'
      },
      {
        title: 'Revisar la pérdida financiera calculada',
        instruction: 'Avalon mostrará el costo exacto de la pérdida (ej: -$320.000 COP) y registrará el usuario que reportó el incidente.',
        proTip: 'Se generará un número de ticket de merma para el informe mensual de seguridad y salud en el trabajo (SST).'
      }
    ],
    contingency: 'Si el líquido derramado afectó otras latas adyacentes, límpialas antes de que la pintura cure para evitar que se dañe su etiqueta.'
  },
  {
    id: 'ESC-INV-25',
    title: '¿Cómo registrar un ajuste por sobrante físico inesperado en estantería?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite ajuste positivo (+) en Kárdex con causal "Sobrante por Conteo Físico" ingresando al costo promedio.',
    expectedResult: 'El sistema incrementa las unidades disponibles haciéndolas coincidir con el stock real verificado en estante.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['sobrante stock', 'mas unidades de las que dice', 'ajuste positivo', 'sobro mercancia', 'ajuste hacia arriba'],
    summary: 'Ajuste hacia arriba en el Kárdex cuando un conteo revela que hay más producto en la bodega del que reporta el software.',
    steps: [
      {
        title: 'Investigar la causa antes de ajustar',
        instruction: 'Verifica si se digitó erróneamente una salida de más en días previos o si una devolución de cliente no fue ingresada al sistema.'
      },
      {
        title: 'Abrir el producto en el Centro de Inventarios',
        instruction: 'Localiza el ítem y presiona "Ajuste de Kárdex" en el menú de acciones.'
      },
      {
        title: 'Digitar la cantidad física real observada',
        instruction: 'Ingresa la nueva cantidad (ej: de 12 a 14 galones). Avalon marcará "Ajuste: +2 unidades (Sobrante)".'
      },
      {
        title: 'Seleccionar causal obligatoria y confirmar',
        instruction: 'Elige "Sobrante por Conteo Cíclico" y anota la estiba donde se hallaron. Presiona "Guardar Ajuste".',
        warning: 'Los sobrantes recurrentes en un mismo producto indican que se está despachando otra referencia similar por confusión.'
      }
    ],
    contingency: 'Revisa las referencias hermanas de la misma marca; frecuentemente un sobrante en color Blanco Nieve corresponde a un faltante idéntico en Blanco Hueso.'
  },
  {
    id: 'ESC-INV-26',
    title: '¿Cómo auditar el Kárdex completo y la Bitácora de Eventos de un SKU sospechoso?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El ProductDrawer muestra pestaña "Kárdex" con cada entrada, venta, reserva y ajuste con fecha y usuario.',
    expectedResult: 'El auditor reconstruye el balance cronológico de existencias desde la creación del producto hasta el segundo actual.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['auditar kardex', 'movimientos de producto', 'historial de inventario', 'quien saco producto', 'trazabilidad sku', 'bitacora eventos'],
    summary: 'Rastreo forense inmutable de todas las transacciones que han afectado el inventario de un producto.',
    steps: [
      {
        title: 'Abrir el cajón de detalle del producto (ProductDrawer)',
        instruction: 'En el Centro de Inventarios, haz clic sobre la tarjeta o fila del producto a investigar.'
      },
      {
        title: 'Seleccionar la pestaña "Kárdex / Movimientos"',
        instruction: 'Se desplegará la línea de tiempo cronológica con cada evento registrado.'
      },
      {
        title: 'Analizar las columnas de auditoría',
        instruction: 'Revisa: Tipo (ENTRADA, SALIDA, RESERVA, AJUSTE), Cantidad (+/-), Fecha y Hora exacta, Motivo / Documento (Factura #, Remisión #) y Usuario responsable.',
        proTip: 'Puedes filtrar por usuario para ver qué empleado realizó la última modificación sobre ese stock.'
      }
    ],
    contingency: 'Si detectas movimientos no autorizados fuera del horario laboral, exporta el registro en PDF para la reunión de auditoría interna.'
  },
  {
    id: 'ESC-INV-27',
    title: '¿Cómo conciliar el descuadre entre inventario físico de taller y kárdex de planta?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Separa el stock comercial del stock de materias primas de laboratorio (LabStock) con conciliación cruzada.',
    expectedResult: 'Las diferencias se concilian distinguiendo entre producto terminado listo para venta y materia prima en proceso de mezcla.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['descuadre taller', 'stock planta vs taller', 'diferencia laboratorio', 'materia prima no cuadra', 'conciliar taller'],
    summary: 'Resolución de discrepancias cuando producción consume bases tintométricas pero aún no ha cerrado la orden de mezcla.',
    steps: [
      {
        title: 'Comprobar órdenes de mezcla abiertas en Taller',
        instruction: 'Antes de declarar un faltante en bodega, revisa en el Tablero de Mezclas si hay órdenes en estado "En Proceso" o "Pesaje".'
      },
      {
        title: 'Verificar si el insumo fue retirado físicamente de bodega',
        instruction: 'Si el operario ya tomó el cuñete para tinturar en la máquina pero no ha presionado "Completar Orden", el sistema aún muestra el stock en bodega.'
      },
      {
        title: 'Cerrar la orden de producción en Avalon V1',
        instruction: 'Al dar por finalizada la orden de mezcla, el sistema descontará automáticamente los insumos consumidos en Kárdex.',
        warning: 'No realices ajustes manuales de Kárdex sobre materias primas que están en medio de una formulación activa.'
      }
    ],
    contingency: 'Establece como norma de planta que ningún operario retire pigmentos del almacén sin escanear la orden de producción respectiva.'
  },
  {
    id: 'ESC-INV-28',
    title: '¿Cómo reclasificar un producto que fue ingresado con el SKU incorrecto en la entrada?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite transferencia de balance entre SKUs de igual costo con trazabilidad de corrección de error.',
    expectedResult: 'Se descuenta del SKU erróneo y se acredita en el SKU correcto manteniendo el balance contable neutro.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['reclasificar sku', 'error de sku', 'me equivoque de codigo', 'cambiar de referencia', 'trasladar entre codigos'],
    summary: 'Corrección ágil cuando el bodeguero ingresó por equivocación Galones de Esmalte Brillante bajo el código de Esmalte Mate.',
    steps: [
      {
        title: 'Localizar los dos productos involucrados',
        instruction: 'Identifica el SKU que tiene el sobrante artificial (ej: SKU A) y el SKU que quedó en cero (ej: SKU B).'
      },
      {
        title: 'Realizar salida por reclasificación en SKU A',
        instruction: 'En el SKU A, haz un ajuste de salida por la cantidad errónea seleccionando motivo: "Reclasificación por Error de Código en Recepción".'
      },
      {
        title: 'Realizar entrada por reclasificación en SKU B',
        instruction: 'En el SKU B, haz un ajuste de entrada por la misma cantidad y costo unitario indicando en la nota el cruce con el SKU A.',
        proTip: 'Esta operación no genera pérdida ni ganancia contable; deja ambos saldos en estantería exactamente donde corresponden.'
      }
    ],
    contingency: 'Si los dos productos tienen costos diferentes, notifica a la contadora para que valide el ajuste de costo promedio.'
  },
  {
    id: 'ESC-INV-29',
    title: '¿Qué hacer si el sistema bloquea un ajuste de Kárdex por superar el límite de $500.000 COP?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Guarda de seguridad de control interno que exige PIN de Administrador para bajas de alto impacto financiero.',
    expectedResult: 'El ajuste queda en estado "Pendiente de Aprobación Gerencial" hasta que el Administrador valide la justificación.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['ajuste bloqueado', 'limite 500000', 'permiso ajuste kardex', 'autorizacion administrador ajuste', 'bloqueo ajuste grande'],
    summary: 'Mecanismo antifraude que previene que operarios o cajeros den de baja mercancía valiosa sin supervisión de la dirección.',
    steps: [
      {
        title: 'Observar el mensaje de seguridad en pantalla',
        instruction: 'Al intentar dar de baja un monto superior a $500.000 COP, Avalon indicará: "Ajuste supera el límite operativo. Requiere autorización de Administrador".'
      },
      {
        title: 'Presentar las evidencias físicas al Administrador',
        instruction: 'Muestra al administrador las latas averiadas, fotos o la planilla de reconteo firmada.'
      },
      {
        title: 'Ingresar PIN o clave de Administrador',
        instruction: 'El Administrador ingresa sus credenciales en el modal de confirmación, autorizando formalmente el asiento en Kárdex.',
        warning: 'El evento quedará registrado en la Bitácora con la identidad de quien solicitó y quien autorizó el movimiento.'
      }
    ],
    contingency: 'Si el Administrador no está en planta, se puede enviar una solicitud de aprobación remota por correo desde el mismo sistema.'
  },
  {
    id: 'ESC-INV-30',
    title: '¿Cómo congelar temporalmente una bodega para la toma física general de fin de año?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Bloqueo Operativo por Inventario" que impide movimientos de Kárdex durante la auditoría.',
    expectedResult: 'El sistema congela el corte de saldos garantizando que ninguna venta o traslado altere la foto del inventario fiscal.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['congelar bodega', 'cierre por inventario', 'bloqueo inventario fin de año', 'toma fisica general', 'inventario fiscal'],
    summary: 'Procedimiento de control interno obligatorio para el inventario físico oficial exigido por Revisoría Fiscal y la DIAN.',
    steps: [
      {
        title: 'Cerrar todas las ventas y despachos del día',
        instruction: 'Asegúrate de que no queden órdenes en espera ni camiones cargando en muelle.'
      },
      {
        title: 'Activar "Modo Conteo General / Auditoría"',
        instruction: 'En Configuración de Inventarios, presiona "Congelar Movimientos de Bodega".'
      },
      {
        title: 'Generar la fotografía de saldos contables (Snapshot)',
        instruction: 'Avalon guardará la foto exacta de todas las existencias y costos al corte de las 18:00 horas.'
      },
      {
        title: 'Ejecutar el conteo físico con los auditores',
        instruction: 'Los equipos de auditoría cuentan la totalidad de las bodegas sin interferencia de movimientos en el software.',
        proTip: 'Una vez finalizada la digitación y conciliadas las diferencias, el Administrador descongela la bodega para reanudar la operación.'
      }
    ],
    contingency: 'Si un cliente corporativo tiene una emergencia vital mientras la bodega está congelada, se atiende con remisión manual de contingencia.'
  },
  {
    id: 'ESC-INV-31',
    title: '¿Cómo dar de baja y registrar la destrucción de producto vencido con acta legal?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Emite Acta de Baja y Destrucción de Inventario con certificado para deducción tributaria en renta.',
    expectedResult: 'El Kárdex descarga el producto vencido y emite el certificado exigido por la DIAN para deducir la pérdida de impuestos.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['baja producto vencido', 'destruccion pintura', 'acta de baja', 'disposicion final quimicos', 'deduccion renta inventario'],
    summary: 'Disposición final ambiental y fiscal de catalizadores o pinturas que superaron su vida útil y no son aptos para la venta.',
    steps: [
      {
        title: 'Separar el producto vencido en la zona de residuos químicos',
        instruction: 'Traslada los recipientes caducados a la zona de acopio de residuos peligrosos (RESPEL).'
      },
      {
        title: 'Registrar la baja en Avalon V1',
        instruction: 'Selecciona los productos y ejecuta "Baja por Vencimiento / Destrucción Ambiental".'
      },
      {
        title: 'Generar e imprimir el Acta Oficial de Destrucción',
        instruction: 'El sistema expedirá el acta formal con el listado de lotes, costos históricos y firmas de Almacén, Calidad y Revisor Fiscal.',
        warning: 'Contrata una empresa certificada por la autoridad ambiental (SDA / CAR) para la incineración de los residuos químicos.'
      },
      {
        title: 'Adjuntar el manifiesto de incineración a Contabilidad',
        instruction: 'Guarda el manifiesto de la empresa gestora de residuos junto al acta de Avalon para el soporte de la declaración de renta.'
      }
    ],
    contingency: 'Antes de destruir una resina vencida, consulta con el Laboratorio si puede ser regenerada o usada como fondo de taller.'
  },
  {
    id: 'ESC-INV-32',
    title: '¿Cómo exportar el informe de diferencias de inventario físico vs. teórico a Excel para Contabilidad?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal InventoryExcelModal exporta archivo .xlsx con columnas de Kárdex, Físico, Diferencia y Valor Neto en COP.',
    expectedResult: 'Se descarga la planilla Excel lista con fórmulas de auditoría para presentar al comité de finanzas.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['exportar inventario excel', 'informe diferencias', 'descargar kardex excel', 'planilla auditoria inventario', 'informe contadora inventario'],
    summary: 'Generación del reporte comparativo mensual para conciliar el valor del inventario en libros contra el saldo en estantería.',
    steps: [
      {
        title: 'Acceder al Centro de Inventarios',
        instruction: 'Navega a "Operación > Centro de Inventarios".'
      },
      {
        title: 'Hacer clic en "Exportar Reporte / Excel"',
        instruction: 'Presiona el botón verde de hoja de cálculo en la esquina superior derecha.'
      },
      {
        title: 'Seleccionar tipo de reporte: "Diferencias y Auditoría"',
        instruction: 'Elige el rango de fechas del corte mensual y marca la casilla "Incluir valorización en pesos COP".'
      },
      {
        title: 'Descargar y compartir con la contadora',
        instruction: 'El archivo Excel se descargará con las pestañas formateadas de Existencias, Costos Ponderados y Mermas del Periodo.',
        proTip: 'Verifica que la sumatoria de la columna "Costo Total" coincida con la cuenta 1435 del balance contable.'
      }
    ],
    contingency: 'Si el archivo tarda en generarse, filtra previamente por bodega específica (ej: solo Bodega Centenario) para aligerar la consulta.'
  },

  // =========================================================================
  // SUBTEMA 4: Catálogo Maestro, Presentaciones & Unidades de Medida (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-INV-33',
    title: '¿Cómo fraccionar un cuñete (5 galones) en 5 galones individuales en el sistema?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Operación de Reenvasado / Fraccionamiento que da salida a 1 cuñete y entrada a 5 galones más costo de envases.',
    expectedResult: 'El cuñete desaparece del Kárdex y se acreditan 5 galones listos para vender en mostrador.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['fraccionar cuñete', 'desarmar cuñete', 'pasar a galones', 'reenvasado', 'cambio de empaque', 'fraccionar pintura'],
    summary: 'Transformación de presentación mayorista a presentación minorista para atender clientes que no requieren cuñete completo.',
    steps: [
      {
        title: 'Ir a "Transformaciones / Reenvasado de Inventario"',
        instruction: 'En el Centro de Inventarios, presiona "Nueva Transformación / Fraccionamiento".'
      },
      {
        title: 'Seleccionar el producto padre a descontar',
        instruction: 'Elige el cuñete (ej: 1 Cuñete de Esmalte Blanco 5 Galones) y confirma su salida de inventario.'
      },
      {
        title: 'Seleccionar los productos hijos a ingresar',
        instruction: 'Selecciona la referencia en galón individual y digita la cantidad generada (5 Galones).'
      },
      {
        title: 'Consumir los 5 envases vacíos de hojalata',
        instruction: 'El sistema descontará automáticamente los 5 tarros vacíos de galón de la bodega de empaques.',
        proTip: 'El costo unitario de los galones incorporará el costo proporcional de la pintura más el valor del envase nuevo.'
      }
    ],
    contingency: 'Si durante el trasvase se derrama medio galón, registra 4 galones generados y 1 galón mermado en el mismo formulario.'
  },
  {
    id: 'ESC-INV-34',
    title: '¿Cómo convertir unidades de medida (de litros a galón o de kilogramos a gramos)?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Factores de conversión estándar integrados: 1 Galón = 3.785 Litros, 1 Kg = 1000 Gr, densidad química configurable.',
    expectedResult: 'El sistema calcula equivalencias exactas para pesaje en taller y venta en mostrador sin errores de redondeo.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['litros a galon', 'kilos a gramos', 'factor de conversion', 'unidad de medida', 'densidad pintura', 'cambio uom'],
    summary: 'Administración de factores de conversión entre volumen y masa indispensables para la industria de pinturas y recubrimientos.',
    steps: [
      {
        title: 'Abrir la ficha técnica del producto en el catálogo',
        instruction: 'Localiza el producto en el Centro de Inventarios y presiona "Editar Ficha Técnica".'
      },
      {
        title: 'Verificar la Unidad de Medida Base (UOM)',
        instruction: 'Revisa si la base está en Litros (L), Galones (GL), Kilogramos (KG) o Gramos (GR).'
      },
      {
        title: 'Configurar la gravedad específica / densidad',
        instruction: 'Ingresa la densidad de la pintura (ej: 1.25 g/cm³). Avalon usará este factor para convertir automáticamente litros a kilos cuando se requiera formular en balanza electrónica.',
        warning: 'Una pintura con alta carga mineral pesa más que un solvente; nunca uses factor 1:1 para convertir litros a kilos en esmaltes o primers.'
      },
      {
        title: 'Guardar configuración',
        instruction: 'Presiona "Actualizar Factores". El POS y el taller mostrarán las equivalencias automáticas.'
      }
    ],
    contingency: 'En caso de duda con la densidad de un lote nuevo, consulta el Certificado de Calidad (CoA) emitido por el fabricante.'
  },
  {
    id: 'ESC-INV-35',
    title: '¿Cómo crear un nuevo producto impidiendo precios o costos en $0 COP? (Parche BUG-INV-04)',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'CORREGIDO Y VERIFICADO [PARCHE AVALON V1.2]: CreateProductModal valida en tiempo real que precio > $0 y precio > costo, bloqueando el guardado.',
    expectedResult: 'El botón de guardar se bloquea si el precio es $0 y muestra el margen proyectado en tiempo real.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['crear producto', 'nuevo sku', 'precio cero', 'bloqueo precio 0', 'dar de alta pintura', 'catalogo nuevo'],
    summary: 'Proceso seguro de creación de referencias comerciales con protección estricta contra precios en cero que causen fugas financieras.',
    steps: [
      {
        title: 'Abrir el modal de creación de producto',
        instruction: 'En el Centro de Inventarios, presiona el botón azul "+ Crear Producto".'
      },
      {
        title: 'Completar datos de identificación y categoría',
        instruction: 'Ingresa Nombre comercial, SKU Avalon, Código original de fabricante, Marca y Categoría.'
      },
      {
        title: 'Diligenciar la pestaña Financiera',
        instruction: 'Digita el Costo Unitario (ej: $40.000 COP) y el Precio de Venta (ej: $65.000 COP).',
        proTip: 'Observa cómo el banner dinámico calcula al instante la Ganancia en Pesos (+$25.000 COP) y el Margen Bruto (+38.5%).'
      },
      {
        title: 'Validación del botón de guardado',
        instruction: 'Si el precio es menor o igual a $0 o si el precio es menor al costo, el botón "Guardar y Crear Producto" permanecerá deshabilitado con un banner de advertencia.',
        warning: 'Esta validación previene que se publiquen accidentalmente productos gratis en el punto de venta.'
      }
    ],
    contingency: 'Si se trata de un insumo interno de taller que no se vende en mostrador, asígnalo a la categoría "Materia Prima" para que no figure en catálogo comercial.'
  },
  {
    id: 'ESC-INV-36',
    title: '¿Cómo descontinuar un producto u ocultarlo del POS sin borrar su histórico contable?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite cambiar estado a "DESCONTINUADO / INACTIVO"; oculta del POS pero conserva facturas y kárdex pasados.',
    expectedResult: 'El producto ya no se puede facturar ni pedir, pero sus transacciones históricas permanecen intactas en la contabilidad.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['descontinuar producto', 'inactivar sku', 'producto obsoleto', 'ocultar del pos', 'no vender mas', 'borrar producto'],
    summary: 'Retiro ordenado de referencias del portafolio comercial protegiendo la integridad de las bases de datos contables de años anteriores.',
    steps: [
      {
        title: 'Buscar el producto a descontinuar',
        instruction: 'Localiza la referencia en el Centro de Inventarios.'
      },
      {
        title: 'Hacer clic en "Editar Datos Maestros"',
        instruction: 'Abre el panel de propiedades del producto.'
      },
      {
        title: 'Cambiar el estado a "INACTIVO / DESCONTINUADO"',
        instruction: 'Cambia el conmutador de estado de "Activo" a "Descontinuado". Selecciona si se permite agotar las existencias remanentes en bodega.',
        warning: 'NUNCA intentes eliminar físicamente un producto de la base de datos si ya tiene ventas o facturas asociadas en años previos.'
      },
      {
        title: 'Verificar desaparición en el POS',
        instruction: 'El producto dejará de sugerirse en el buscador de ventas de mostrador de forma inmediata.'
      }
    ],
    contingency: 'Si el fabricante reanuda la producción el próximo año, puedes reactivar el producto con un solo clic conservando su mismo código.'
  },
  {
    id: 'ESC-INV-37',
    title: '¿Cómo unificar o fusionar dos productos duplicados creados por error con diferente nombre?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Herramienta de fusión que traslada existencias al SKU maestro y redirige el SKU alias para no quebrar ventas.',
    expectedResult: 'El catálogo queda limpio con una sola referencia unificada y los dos códigos de barras dirigen al mismo producto.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['unificar productos', 'fusionar referencias', 'producto duplicado', 'dos codigos mismo producto', 'limpiar catalogo'],
    summary: 'Subsanación de duplicidades en catálogo cuando dos empleados crearon el mismo barniz con diferente ortografía.',
    steps: [
      {
        title: 'Identificar el SKU Principal y el SKU Duplicado',
        instruction: 'Elige cuál código se conservará como oficial (ej: SKU Maestro) y cuál se dará de baja (ej: SKU Duplicado).'
      },
      {
        title: 'Acceder a "Herramientas de Catálogo > Fusionar Referencias"',
        instruction: 'Selecciona ambos códigos en el asistente de unificación.'
      },
      {
        title: 'Aprobar la consolidación de existencias',
        instruction: 'El sistema trasladará el saldo de Kárdex del duplicado al SKU principal y registrará el código de barras antiguo como "Código Alterno / Alias".',
        proTip: 'De este modo, cuando un cajero pistolee una lata vieja con el código duplicado, Avalon reconocerá el SKU principal sin arrojar error.'
      }
    ],
    contingency: 'Esta operación es irreversible; verifica previamente que ambas referencias tengan idéntica presentación y características técnicas.'
  },
  {
    id: 'ESC-INV-38',
    title: '¿Cómo actualizar la ficha técnica (viscosidad, secado, densidad) de un producto?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Pestaña de Ficha Técnica editable con exportación automática a PDF para entrega a clientes industriales.',
    expectedResult: 'Los parámetros químicos quedan grabados y los asesores comerciales pueden descargar la ficha técnica en 1 clic.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['ficha tecnica', 'viscosidad copa ford', 'tiempo de secado', 'solidos por peso', 'hoja tecnica pintura', 'especificaciones quimicas'],
    summary: 'Actualización de especificaciones técnicas de laboratorio para asesoría a ingenieros de plantas industriales.',
    steps: [
      {
        title: 'Abrir el producto en el Centro de Inventarios',
        instruction: 'Haz clic en "Ver Ficha Técnica".'
      },
      {
        title: 'Diligenciar los parámetros de aplicación',
        instruction: 'Actualiza: Viscosidad de aplicación (Copa Ford 4 en segundos), Sólidos por volumen (%), Tiempo de secado al tacto (minutos), Secado total y Vida de la mezcla (Pot-life).'
      },
      {
        title: 'Adjuntar hoja de seguridad MSDS / FDS',
        instruction: 'Sube el archivo PDF de la Hoja de Seguridad con los pictogramas SGA correspondientes.',
        proTip: 'Los clientes automotrices e industriales exigen la ficha técnica antes de autorizar pruebas de pintura en sus líneas de ensamble.'
      },
      {
        title: 'Guardar versión técnica',
        instruction: 'Presiona "Actualizar Ficha Técnica". La versión se actualizará a la última revisión del laboratorio.'
      }
    ],
    contingency: 'Si el fabricante modifica la proporción de mezcla del catalizador, actualiza la regla en el motor de mezclas de inmediato.'
  },
  {
    id: 'ESC-INV-39',
    title: '¿Cómo armar y vender un Combo o Kit comercial (ej: Galón + Catalizador + Thinner)?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Soporta productos compuestos (Bundle / Kit) que descuentan automáticamente sus componentes del Kárdex.',
    expectedResult: 'El cajero factura un solo código promocional y el sistema descuenta los 3 productos físicos individuales de la bodega.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['combo comercial', 'kit de pintura', 'bundle', 'producto compuesto', 'paquete promocional', 'armar kit'],
    summary: 'Creación de ofertas comerciales empaquetadas que facilitan la venta de sistemas completos de pintura con descuento especial.',
    steps: [
      {
        title: 'Crear un producto de tipo "Kit / Combo"',
        instruction: 'En el Centro de Inventarios, crea un nuevo producto marcando la casilla "Producto Compuesto / Kit".'
      },
      {
        title: 'Asociar los productos componentes (BOM Comercial)',
        instruction: 'Agrega: 1 Galón de Esmalte Poliuretano + 1 Cuarto de Catalizador CAT-7074 + 1 Galón de Thinner Poliuretano.'
      },
      {
        title: 'Definir el precio especial del Combo',
        instruction: 'Establece el precio promocional con descuento por paquete (ej: $185.000 COP en vez de $210.000 individuales).',
        proTip: 'Vender kits completos asegura que el cliente use el diluyente y catalizador correctos, reduciendo reclamos por ampollamiento.'
      },
      {
        title: 'Facturación transparente en mostrador',
        instruction: 'Al pistolear el código del Combo en el POS, la tirilla imprimirá el kit y el Kárdex rebajará los tres componentes de bodega.'
      }
    ],
    contingency: 'Si uno de los tres componentes se agota en bodega, el sistema bloqueará preventivamente la venta del Combo para evitar faltantes.'
  },
  {
    id: 'ESC-INV-40',
    title: '¿Cómo configurar el Stock Mínimo y Punto de Reorden para alertas automáticas de compra?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Semáforo dinámico en SmartInventoryView que resalta en rojo cuando las existencias caen bajo el stock de seguridad.',
    expectedResult: 'El jefe de compras recibe alertas automáticas antes de que un producto crítico se agote en el mostrador.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['stock minimo', 'punto de reorden', 'stock de seguridad', 'alerta stock bajo', 'cuando comprar', 'semáforo inventario'],
    summary: 'Parámetros de reposición continua basados en el tiempo de entrega de los proveedores (Lead Time) y la demanda promedio.',
    steps: [
      {
        title: 'Abrir los parámetros de inventario del producto',
        instruction: 'En los detalles del producto, localiza la sección "Umbrales de Abastecimiento".'
      },
      {
        title: 'Digitar Stock Mínimo y Stock Máximo',
        instruction: 'Ingresa: Stock de Seguridad (ej: 10 cuñetes) y Capacidad Máxima de Bodega (ej: 50 cuñetes).'
      },
      {
        title: 'Configurar el Lead Time del proveedor',
        instruction: 'Indica los días que tarda el proveedor en entregar (ej: 5 días hábiles para proveedores nacionales o 45 días para importados).',
        proTip: 'Avalon calculará automáticamente el "Punto de Reorden": el día exacto en que debe emitirse la orden de compra antes de entrar en quiebre de stock.'
      },
      {
        title: 'Consultar el reporte de Reabastecimiento',
        instruction: 'En "Compras > Inteligencia de Compras", verás el listado de todos los productos que alcanzaron su nivel de reorden.'
      }
    ],
    contingency: 'Revisa estos umbrales trimestralmente para ajustar por temporadas de alta demanda (ej: fin de año en pinturas arquitectónicas).'
  },
  {
    id: 'ESC-INV-41',
    title: '¿Cómo asociar el SKU original del fabricante internacional (ILVA / Vetro) a un producto?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Campo dedicado `originalSku` que permite buscar indistintamente por código Procoquinal o código italiano.',
    expectedResult: 'El asesor puede atender clientes que piden por el código del catálogo italiano sin dudar de la equivalencia.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['sku original', 'codigo fabricante', 'codigo ilva', 'codigo vetro', 'referencia italia', 'equivalencia codigo'],
    summary: 'Homologación de códigos entre la codificación comercial de Procoquinal y las fórmulas matrices de proveedores extranjeros.',
    steps: [
      {
        title: 'Editar el producto en el catálogo maestro',
        instruction: 'Abre la pestaña de identificación del producto.'
      },
      {
        title: 'Diligenciar el campo "Original SKU / Fábrica"',
        instruction: 'Escribe la referencia exacta de la matriz europea (ej: TZ1555/00 para barniz ILVA o IPT1090 para promotor Vetro).'
      },
      {
        title: 'Probar la búsqueda cruzada',
        instruction: 'Ve al POS o al buscador de inventario y escribe "TZ1555"; el sistema traerá de inmediato el producto con su SKU comercial de Procoquinal.',
        proTip: 'Esto evita que los clientes crean que la pintura cambió de calidad cuando se comercializa bajo la marca nacionalizada.'
      }
    ],
    contingency: 'Si el fabricante italiano actualiza una letra en su código, actualiza el campo Original SKU manteniendo el SKU interno de Avalon.'
  },
  {
    id: 'ESC-INV-42',
    title: '¿Cómo homologar las cuentas contables PUC / SIIGO en la ficha de inventario?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asigna cuenta PUC de inventario (1435), cuenta de costo (6135) y cuenta de ingreso (4135) para sincronización SIIGO.',
    expectedResult: 'Cada movimiento de venta o compra se contabiliza automáticamente en la cuenta contable correcta sin ajustes manuales.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['cuentas contables puc', 'homologacion siigo', 'cuenta 1435', 'cuenta costo 6135', 'interfaz contable inventario'],
    summary: 'Configuración técnica tributaria para que las transacciones de inventario se exporten limpiamente a los libros contables oficiales.',
    steps: [
      {
        title: 'Ingresar a "Datos Maestros Contables" del producto',
        instruction: 'En los detalles del producto, pulsa la pestaña "Configuración Contable PUC".'
      },
      {
        title: 'Verificar la cuenta de inventario (Activo)',
        instruction: 'Para producto terminado de reventa asigna 143501; para materias primas químicas asigna 140501.'
      },
      {
        title: 'Verificar cuenta de costo de ventas y ventas',
        instruction: 'Asigna Costo de Ventas (613501) e Ingresos Operacionales (413501).'
      },
      {
        title: 'Confirmar homologación',
        instruction: 'Presiona "Guardar Parámetros PUC". Cuando se exporte la Sábana Operativa para la contadora, cada fila llevará su código PUC exacto.',
        warning: 'No modifiques estas cuentas sin previa autorización escrita de la Contadora General de Procoquinal.'
      }
    ],
    contingency: 'Si un producto nuevo no tiene cuenta asignada, heredará automáticamente la cuenta por defecto de su categoría.'
  },
  {
    id: 'ESC-INV-43',
    title: '¿Cómo reclasificar la rotación ABC de un producto según su volumen y rentabilidad real?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Catálogo Maestro & Presentaciones',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Insignia visual ABC/XYZ en SmartInventoryView basada en el principio de Pareto 80/20.',
    expectedResult: 'El almacén identifica los productos estratégicos de alta rotación para no permitir quiebres de existencias.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['clasificacion abc', 'pareto inventario', 'rotacion abc', 'producto tipo a', 'analisis abc', 'alta rotacion'],
    summary: 'Categorización de inventarios por importancia económica para enfocar los conteos cíclicos y la inversión de capital de trabajo.',
    steps: [
      {
        title: 'Comprender los niveles de la clasificación ABC',
        instruction: '• A: El 20% de los productos que generan el 80% de las ventas (Poliuretanos estrella, Thinners).\n• B: Rotación media (30% de productos / 15% de ventas).\n• C: Baja rotación o tintas de nicho (50% de productos / 5% de ventas).'
      },
      {
        title: 'Ejecutar el recálculo automático de Pareto',
        instruction: 'En Inteligencia de Inventarios, presiona "Recalcular Matriz ABC". Avalon evaluará las ventas de los últimos 90 días.'
      },
      {
        title: 'Observar la insignia en el catálogo',
        instruction: 'Cada producto mostrará su etiqueta verde "A", azul "B" o gris "C".',
        proTip: 'Los productos "A" deben contarse físicamente cada 15 días, mientras que los "C" pueden contarse de forma trimestral.'
      }
    ],
    contingency: 'Si un producto nuevo recién lanzado queda clasificado como C por falta de histórico, puedes forzar su categoría a A manualmente.'
  },

  // =========================================================================
  // SUBTEMA 5: Etiquetado, Código de Barras & Control de Lotes (12 Escenarios)
  // =========================================================================
  {
    id: 'ESC-INV-44',
    title: '¿Qué hacer si el código de barras de una lata física está rayado, roto o ilegible?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite búsqueda por SKU en mostrador y reimpresión inmediata de sticker de código de barras.',
    expectedResult: 'El producto se puede despachar sin demoras y el envase se reetiqueta para futuros escaneos.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['codigo barras roto', 'no lee codigo barras', 'sticker dañado', 'pistola no lee lata', 'codigo ilegible', 'reetiquetar'],
    summary: 'Solución inmediata en mostrador o muelle cuando el lector óptico no reconoce la etiqueta deteriorada por fricción o solventes.',
    steps: [
      {
        title: 'Digitar el SKU manualmente en el buscador',
        instruction: 'En el POS o en el Centro de Inventarios, escribe las letras visibles del SKU impreso en la parte superior del envase para continuar la venta.'
      },
      {
        title: 'Abrir el generador de etiquetas de Avalon V1',
        instruction: 'Ve a "Operación > Centro de Inventarios", busca el producto y haz clic en "Imprimir Etiqueta / Código de Barras".'
      },
      {
        title: 'Imprimir el sticker en la impresora térmica de etiquetas',
        instruction: 'Selecciona el formato adhesivo (ej: 50x30mm o 100x50mm) y envía la orden a la impresora térmica (Zebra / Xprinter).'
      },
      {
        title: 'Pegar el nuevo sticker sobre la lata',
        instruction: 'Pega la etiqueta limpia sobre el área lateral seca del envase y verifica el escaneo con la pistola lectora.',
        proTip: 'Aplica una cinta transparente sobre la etiqueta si la lata se va a almacenar cerca de zonas de trasvase de solventes.'
      }
    ],
    contingency: 'Si no hay impresora de etiquetas disponible en ese momento, escribe el código numérico legible con marcador indeleble debajo del código de barras.'
  },
  {
    id: 'ESC-INV-45',
    title: '¿Cómo generar e imprimir etiquetas con código de barras EAN-13 para nuevos productos?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera código EAN-13 oficial con dígito verificador y formato de impresión adhesivo.',
    expectedResult: 'Se obtiene el rollo de etiquetas listo para aplicar a los lotes envasados en la línea de producción.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['imprimir etiquetas barras', 'generar ean13', 'stickers codigo barras', 'impresora zebra', 'etiquetar lote nuevo'],
    summary: 'Rotulación reglamentaria de productos recién fabricados para garantizar su identificación automática en bodega y POS.',
    steps: [
      {
        title: 'Localizar la referencia en el Centro de Inventarios',
        instruction: 'Asegúrate de que el producto tenga su código EAN-13 asignado en la ficha maestra.'
      },
      {
        title: 'Hacer clic en "Generar Etiquetas por Lote"',
        instruction: 'Presiona el botón de código de barras.'
      },
      {
        title: 'Ingresar cantidad de stickers requeridos',
        instruction: 'Digita el número de envases a rotular (ej: 50 galones = 50 etiquetas).'
      },
      {
        title: 'Enviar a la impresora térmica de etiquetas',
        instruction: 'Verifica que la etiqueta incluya: Nombre de producto, SKU, Código de barras legible, Lote de producción y Fecha de envasado.',
        warning: 'Comprueba el contraste de impresión; si la barra sale tenue o con líneas blancas cortadas, limpia el cabezal térmico con alcohol isopropílico.'
      }
    ],
    contingency: 'Si la empresa se queda sin etiquetas adhesivas, imprime provisionalmente en hojas de etiquetas tamaño carta en impresora láser.'
  },
  {
    id: 'ESC-INV-46',
    title: '¿Cómo poner en Cuarentena un lote completo de resina sospechoso de contaminación?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bloquea el lote en todo el sistema; impide su uso en órdenes de mezcla y su venta en mostradores.',
    expectedResult: 'Los cuñetes quedan bloqueados en el software con alerta roja de "CUARENTENA POR CALIDAD" hasta nueva orden.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['poner en cuarentena', 'bloquear lote', 'lote contaminado', 'resina defectuosa', 'aislar lote', 'calidad cuarentena'],
    summary: 'Aislamiento preventivo urgente cuando un cliente reporta que un lote de pintura no seca o tiene problemas de adherencia.',
    steps: [
      {
        title: 'Identificar el número de lote afectado',
        instruction: 'Verifica el código de batch (ej: Batch #2026-09-A) en la factura o reporte del cliente.'
      },
      {
        title: 'Ingresar a Gestión de Lotes en Avalon V1',
        instruction: 'En el Centro de Inventarios, busca la referencia y presiona "Administrar Lotes".'
      },
      {
        title: 'Cambiar estado del lote a "CUARENTENA / RETENIDO"',
        instruction: 'Selecciona el lote y presiona "Bloquear por Calidad". Escribe la causal (ej: "Investigación por tiempo de curado anormal").'
      },
      {
        title: 'Etiquetar físicamente los cuñetes en bodega',
        instruction: 'Coloca cinta perimetral amarilla/negra y stickers rojos con la leyenda "LOTE EN CUARENTENA - PROHIBIDO SU USO" sobre los recipientes en estantería.',
        warning: 'Ningún vendedor ni operario podrá procesar este lote en el software mientras esté en cuarentena.'
      }
    ],
    contingency: 'Toma 3 muestras aleatorias de diferentes tambores y envíalas al Laboratorio de I+D para el ensayo de caracterización.'
  },
  {
    id: 'ESC-INV-47',
    title: '¿Cómo liberar un lote bloqueado tras la aprobación del Laboratorio de Calidad?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Desbloquea el lote registrando el Certificado de Calidad (CoA) de aprobación y devuelve el stock a disponible.',
    expectedResult: 'El producto vuelve a estar habilitado para la venta en el POS y para consumo en formulación de mezclas.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['liberar lote', 'desbloquear lote', 'aprobado por calidad', 'quitar de cuarentena', 'coa aprobado'],
    summary: 'Restablecimiento de la disponibilidad comercial de un lote una vez el laboratorio certifica que cumple los estándares técnicos.',
    steps: [
      {
        title: 'Recibir el Certificado de Análisis (CoA) favorable',
        instruction: 'Verifica que el informe del químico confirme viscosidad, densidad y tiempo de secado dentro de la norma técnica.'
      },
      {
        title: 'Localizar el lote en estado "CUARENTENA"',
        instruction: 'En la sección de lotes del Centro de Inventarios, filtra por los lotes retenidos.'
      },
      {
        title: 'Hacer clic en "Liberar Lote / Aprobado"',
        instruction: 'Ingresa el número de informe de laboratorio, adjunta el PDF del ensayo y presiona "Aprobar Liberación".'
      },
      {
        title: 'Retirar las etiquetas rojas de los envases físicos',
        instruction: 'Quita los stickers de cuarentena de los cuñetes en bodega para que los bodegueros puedan despacharlos normalmente.',
        proTip: 'El Kárdex reflejará la trazabilidad completa: fecha de bloqueo, fecha de liberación y usuario del laboratorista que firmó.'
      }
    ],
    contingency: 'Si el lote no superó la prueba, no se libera; se procede a dar de baja definitiva o solicitar devolución al fabricante.'
  },
  {
    id: 'ESC-INV-48',
    title: '¿Cómo ejecutar la trazabilidad inversa (Recall) para rastrear a qué clientes se les vendió un lote defectuoso?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo Trazabilidad Inversa rastrea en 5 segundos todas las facturas, clientes, despachos y obras que recibieron ese lote.',
    expectedResult: 'Se obtiene la lista de teléfonos, empresas y contactos a llamar para recoger el producto antes de que sea aplicado en obra.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['recall producto', 'trazabilidad inversa', 'recoger lote defectuoso', 'a quien se vendio lote', 'alerta calidad lote'],
    summary: 'Procedimiento de emergencia para retirar del mercado un lote con fallas graves antes de que cause daños millonarios en instalaciones de clientes.',
    steps: [
      {
        title: 'Abrir el buscador de Trazabilidad Inversa (Recall)',
        instruction: 'En el Centro de Inventarios, presiona "Trazabilidad Inversa / Recall de Lote".'
      },
      {
        title: 'Digitar el número de lote afectado',
        instruction: 'Escribe el lote exacto (ej: LOTE-2026-088).'
      },
      {
        title: 'Revisar el informe de distribución en pantalla',
        instruction: 'Avalon mostrará de inmediato:\n• Unidades totales fabricadas/recibidas\n• Unidades que aún quedan en bodega física\n• Facturas emitidas, nombres de empresas compradoras, números de contacto y fechas de despacho.'
      },
      {
        title: 'Activar el plan de contacto y recolección',
        instruction: 'Comunícate de inmediato con los clientes listados para solicitar la retención del producto y coordinar el cambio mano a mano por un lote conforme.',
        warning: 'Actuar en menos de 24 horas previene demandas por costos de lijado o repintado en proyectos industriales.'
      }
    ],
    contingency: 'Emite una alerta circular al equipo comercial para que ningún vendedor ofrezca esa referencia hasta que se aclare el recall.'
  },
  {
    id: 'ESC-INV-49',
    title: '¿Qué hacer si un producto próximo a vencer (menos de 30 días) sigue en la bodega principal?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Alerta amarilla "Próximo a Vencer" en inventario; permite reasignar precio promocional o consumo prioritario en taller.',
    expectedResult: 'Se evacúa el producto antes de su caducidad evitando pérdidas financieras de inventario vencido.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['proximo a vencer', 'vence en 30 dias', 'alerta caducidad', 'evacuar producto', 'remate pintura', 'promocion vencimiento'],
    summary: 'Gestión proactiva de existencias con fecha de caducidad cercana para evitar que se conviertan en pérdidas operativas.',
    steps: [
      {
        title: 'Revisar la pestaña "Alertas de Vencimiento"',
        instruction: 'Filtra en el Centro de Inventarios los productos con caducidad inferior a 30 días.'
      },
      {
        title: 'Ofrecer a Gerencia Comercial para plan de evacuación',
        instruction: 'Opciones de evacuación:\n1. Aplicar descuento promocional especial en mostrador por pronto vencimiento (ESC-POS-12).\n2. Destinar las unidades al taller de mezclas interno para consumirlas como base de inmediato en órdenes de producción programadas.'
      },
      {
        title: 'Marcar los envases físicos con etiqueta de "SALIDA PRIORITARIA"',
        instruction: 'Coloca los cuñetes en la primera línea de despacho de la bodega para que los bodegueros los entreguen en los siguientes pedidos.',
        proTip: 'Verifica con el cliente comprador que su aplicación sea inmediata para asegurar el desempeño óptimo de la película.'
      }
    ],
    contingency: 'Si faltan 5 días y no se vendió, transfiérelo al laboratorio para ensayos técnicos o pruebas de color antes de darlo de baja.'
  },
  {
    id: 'ESC-INV-50',
    title: '¿Cómo imprimir etiquetas de seguridad química (Rombos NFPA / Pictogramas SGA) para tambores de solventes?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera etiquetas reglamentarias con rombo de seguridad NFPA 704 y pictogramas SGA (GHS) para transporte seguro.',
    expectedResult: 'Los recipientes químicos cumplen con la normatividad del Decreto 1496 del Ministerio de Trabajo (SGA).',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['etiquetas sga', 'rombo nfpa', 'seguridad quimica', 'pictogramas peligro', 'tambor solvente etiqueta', 'norma sga'],
    summary: 'Rotulado obligatorio de recipientes de sustancias inflamables o corrosivas para la protección del personal y cumplimiento legal.',
    steps: [
      {
        title: 'Acceder a la sección de Rotulado de Seguridad Química',
        instruction: 'En los detalles del producto químico, presiona "Imprimir Rótulo de Seguridad SGA/NFPA".'
      },
      {
        title: 'Verificar los pictogramas de peligro precargados',
        instruction: 'Comprueba los símbolos asignados: Llama (Inflamable), Calavera (Toxicidad aguda), Corrosión o Signo de exclamación.'
      },
      {
        title: 'Revisar frases de peligro (H) y consejos de prudencia (P)',
        instruction: 'Asegúrate de que la etiqueta incluya: "Líquido y vapores muy inflamables", "Mantener alejado del calor y chispas", "Usar guantes y gafas de protección".'
      },
      {
        title: 'Imprimir en papel adhesivo resistente a químicos',
        instruction: 'Imprime en vinilo o papel laminado resistente a la intemperie y adhiérelo en un lugar visible del tambor de 55 galones.',
        warning: 'Despachar sustancias químicas sin rotulado SGA acarrea multas severas por parte de las autoridades de tránsito y de trabajo.'
      }
    ],
    contingency: 'En caso de tambores reutilizados, raspa o retira las etiquetas anteriores antes de pegar el nuevo rótulo de seguridad.'
  },
  {
    id: 'ESC-INV-51',
    title: '¿Cómo reetiquetar masivamente un lote por actualización de marca o cambio de advertencias legales?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción de impresión en ráfaga para reetiquetado de estibas completas en bodega.',
    expectedResult: 'Todas las unidades físicas quedan actualizadas con la nueva imagen y código de barras vigente.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['reetiquetado masivo', 'cambio de etiqueta', 'actualizar rotulos lote', 'imprimir muchas etiquetas', 'cambio de marca lote'],
    summary: 'Procedimiento eficiente para sustituir etiquetas antiguas en lotes almacenados sin interrumpir la operación de despacho.',
    steps: [
      {
        title: 'Seleccionar la referencia y el lote a reetiquetar',
        instruction: 'En el Centro de Inventarios, busca la referencia y haz clic en "Reetiquetado Masivo".'
      },
      {
        title: 'Indicar la cantidad total de unidades en existencia',
        instruction: 'El sistema calculará el total de etiquetas necesarias según el saldo actual de Kárdex (ej: 120 galones).'
      },
      {
        title: 'Enviar el trabajo de impresión en bloques de 50',
        instruction: 'Envía las etiquetas a la impresora industrial de bodega.'
      },
      {
        title: 'Proceder al reetiquetado físico en bodega',
        instruction: 'Los auxiliares de bodega pegan la nueva etiqueta cubriendo totalmente la anterior y verifican con escaneo de prueba.',
        proTip: 'Verifica con el lector que el código antiguo haya quedado completamente tapado para que la pistola no lea el código equivocado.'
      }
    ],
    contingency: 'Si la etiqueta nueva no se adhiere por frío o humedad en bodega, calienta levemente la superficie del plástico antes de pegar.'
  },
  {
    id: 'ESC-INV-52',
    title: '¿Cómo dar entrada a productos importados cuando el fabricante cambia el formato de su código de barras?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite agregar múltiples códigos de barras secundarios (Barcodes Alias) a un mismo SKU.',
    expectedResult: 'El producto se puede pistolear tanto con el código de barras antiguo como con el nuevo sin generar productos duplicados.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['cambio codigo barras fabricante', 'nuevo codigo barras', 'agregar codigo secundario', 'alias codigo barras', 'lector no reconoce nuevo empaque'],
    summary: 'Actualización transparente de códigos de barras cuando proveedores internacionales rediseñan sus empaques o cambian de EAN a UPC.',
    steps: [
      {
        title: 'Detectar que la pistola no reconoce el nuevo empaque',
        instruction: 'Al recibir la nueva importación, la pistola lee un número desconocido (ej: 801234567890).'
      },
      {
        title: 'Abrir el producto existente en el Centro de Inventarios',
        instruction: 'Busca el SKU habitual de esa referencia.'
      },
      {
        title: 'Agregar el nuevo código en "Códigos de Barras Secundarios"',
        instruction: 'En los datos maestros, haz clic en "+ Agregar Código de Barras Alterno", pistolea el nuevo envase y presiona "Guardar".'
      },
      {
        title: 'Probar el reconocimiento automático',
        instruction: 'Pistolea el nuevo envase en el POS o en recepción; el sistema lo reconocerá de inmediato asignándolo al mismo producto e inventario.',
        proTip: 'Esto evita crear un producto nuevo duplicado que fragmentaría el stock y las estadísticas de venta.'
      }
    ],
    contingency: 'Puedes mantener activos hasta 5 códigos de barras alternos para una sola referencia comercial.'
  },
  {
    id: 'ESC-INV-53',
    title: '¿Cómo registrar y reportar mermas de solvente por goteo o fuga en válvulas de descarga?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Kárdex, Ajustes & Conteos Cíclicos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra merma con causa "Fuga / Goteo en Válvula" generando orden automática de mantenimiento preventivo.',
    expectedResult: 'Se descuenta la pérdida física real del solvente y se solicita la reparación inmediata de la tubería.',
    route: '/control-mermas',
    routeLabel: 'Ir a Control de Mermas',
    synonyms: ['fuga solvente', 'goteo valvula', 'llave goteando', 'perdida liquido tuberia', 'merma por fuga'],
    summary: 'Detección y control de pérdidas continuas en las líneas de llenado y tanques de almacenamiento de thinner y alcoholes.',
    steps: [
      {
        title: 'Contener el goteo y cuantificar el volumen perdido',
        instruction: 'Coloca un recipiente aforado debajo de la válvula para medir los litros perdidos por hora.'
      },
      {
        title: 'Cerrar la válvula principal de paso',
        instruction: 'Bloquea el flujo del tanque hacia la línea de envasado para frenar la fuga.'
      },
      {
        title: 'Registrar la merma en Avalon V1',
        instruction: 'En "Control de Mermas", selecciona el solvente, digita los litros perdidos y marca motivo: "Fuga / Daño Mecánico en Válvula".'
      },
      {
        title: 'Notificar al equipo de Mantenimiento de Planta',
        instruction: 'El reporte alertará a Mantenimiento para el cambio inmediato del empaque de teflón de la válvula de bola.',
        warning: 'Los vapores de solventes acumulados por goteo son altamente inflamables; prohíbe el uso de herramientas que produzcan chispas en el área.'
      }
    ],
    contingency: 'Si la fuga es mayor a 50 litros, activa el plan de contingencia ambiental de la planta.'
  },
  {
    id: 'ESC-INV-54',
    title: '¿Cómo exportar el catálogo completo con códigos de barras para toma física con colector de datos?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Exporta archivo plano estructurado compatible con terminales colectoras de datos Honeywell, Zebra y CipherLab.',
    expectedResult: 'El colector de datos carga el maestro de productos para escanear inventario físico sin conexión a internet.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['colector de datos', 'terminal portatil inventario', 'exportar codigos barras', 'archivo plano inventario', 'honeywell inventario'],
    summary: 'Preparación de archivos maestros para pistoleo masivo continuo de estanterías mediante terminales industriales de captura.',
    steps: [
      {
        title: 'Ir a "Herramientas de Inventario > Exportar para Colectores"',
        instruction: 'En el Centro de Inventarios, abre el menú de utilidades.'
      },
      {
        title: 'Seleccionar formato de terminal (CSV / TXT delimitado)',
        instruction: 'Elige el formato de tu equipo colector (Columnas: Código de Barras, SKU, Descripción, Ubicación en Rack).'
      },
      {
        title: 'Cargar el archivo en la memoria del colector de datos',
        instruction: 'Conecta el colector por cable USB o Wi-Fi y transfiere el archivo maestro a la aplicación de conteo.'
      },
      {
        title: 'Pistolear las bodegas y reimportar los conteos',
        instruction: 'Al terminar la jornada de conteo, descarga el archivo de lecturas en Avalon V1 para la conciliación automática.',
        proTip: 'El colector de datos reduce los tiempos de toma física en un 70% comparado con el conteo en papel.'
      }
    ],
    contingency: 'Verifica la batería del colector antes de iniciar la jornada para no perder las lecturas en memoria volátil.'
  },
  {
    id: 'ESC-INV-55',
    title: '¿Qué hacer si un lote de pintura presenta sedimentación en el fondo tras meses de almacenamiento?',
    module: 'Inventario & Kárdex',
    moduleId: 'inventario',
    subtopic: 'Etiquetado & Control de Lotes',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite enviar orden de "Reagitado / Homogeneización en Taller" antes de autorizar su despacho.',
    expectedResult: 'El producto se redispensa en el agitador giroscópico, recupera su viscosidad y se certifica para entrega al cliente.',
    route: '/inventory-hub',
    routeLabel: 'Ir al Centro de Inventarios',
    synonyms: ['sedimentacion pintura', 'pigmento asentado', 'reagitar cuñete', 'homogeneizar pintura', 'agitador giroscopico'],
    summary: 'Procedimiento de acondicionamiento de pinturas con alta carga mineral que han estado estáticas en estantería por más de 6 meses.',
    steps: [
      {
        title: 'Detectar la presencia de sedimento duro en el fondo',
        instruction: 'Al destapar para inspección de calidad o por tiempo de almacenamiento, se observa pasta concentrada en el fondo del recipiente.'
      },
      {
        title: 'No considerar el producto como merma de inmediato',
        instruction: 'La sedimentación de pigmentos pesados (ej: dióxido de titanio o anticorrosivos) es un fenómeno físico reversible si no hay gelificación.'
      },
      {
        title: 'Colocar el cuñete en el Agitador Giroscópico de Mostrador / Taller',
        instruction: 'Asegura el envase en la máquina de agitación biaxial y programa un ciclo de mezclado de 5 a 10 minutos a alta velocidad.'
      },
      {
        title: 'Verificar la homogeneidad con espátula de fondo',
        instruction: 'Comprueba que el fondo esté completamente limpio y que la viscosidad sea uniforme en todo el volumen.',
        proTip: 'Entrega la pintura recién agitada al cliente explicándole que está lista para aplicar de inmediato sin esfuerzo manual.'
      }
    ],
    contingency: 'Si tras 10 minutos de agitación mecánica persisten grumos duros que no se dispersan, declara el producto en merma por polimerización irreversible.'
  }
];
