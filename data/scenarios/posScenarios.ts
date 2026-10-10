import { HumanScenario } from './types';

export const POS_SCENARIOS: HumanScenario[] = [
  // =========================================================================
  // SUBTEMA 1: Atención en Mostrador, Clientes & Canasta (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-POS-01',
    title: '¿Cómo pistolear productos con lector de código de barras en el mostrador?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El listener global captura secuencias rápidas (<60ms) de pistolas USB/Bluetooth y auto-agrega el ítem.',
    expectedResult: 'El producto se añade al carrito al instante, sumando 1 unidad y limpiando el buscador para el siguiente escaneo.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['pistola', 'lector de barras', 'codigo de barras', 'escanear', 'pistolear', 'lector usb', 'pos'],
    summary: 'Uso del lector láser de código de barras para agilizar el registro continuo de productos en mostrador sin tocar el teclado.',
    steps: [
      {
        title: 'Verificar conexión del lector óptico',
        instruction: 'Asegúrate de que la pistola lectora esté conectada por USB o Bluetooth a la terminal de caja (debe emitir un pitido de enlace).',
        proTip: 'No es necesario hacer clic en ningún campo específico; Avalon cuenta con detección global de ráfagas de escáner.'
      },
      {
        title: 'Apuntar al código de barras del producto',
        instruction: 'Dispara el haz de luz sobre el código de barras (EAN-13 o Code-128) del envase o cuñete.'
      },
      {
        title: 'Confirmar adición a la canasta',
        instruction: 'El producto aparecerá de inmediato en la canasta lateral. Si pistoleas el mismo producto dos veces, incrementará la cantidad a 2.',
        warning: 'Si el lector pita pero no carga en pantalla, verifica que el cursor no esté dentro de un modal emergente o bloqueado por el navegador.'
      }
    ],
    contingency: 'Si el código de barras está rayado o manchado con pintura, escribe manualmente el SKU o nombre en la barra de búsqueda superior.'
  },
  {
    id: 'ESC-POS-02',
    title: '¿Cómo buscar productos por nombre, SKU comercial o código de fábrica original?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El motor de búsqueda filtra en milisegundos sobre 1.200 referencias comerciales.',
    expectedResult: 'El catálogo muestra únicamente los productos coincidentes con stock disponible y precio vigente.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['buscar producto', 'encontrar sku', 'codigo original', 'referencia fabrica', 'buscar pintura'],
    summary: 'Búsqueda flexible en el catálogo de mostrador cuando no se cuenta con código de barras o el cliente pide por referencia técnica.',
    steps: [
      {
        title: 'Enfocar la barra de búsqueda',
        instruction: 'Haz clic en el buscador superior del POS o presiona la tecla rápida F2.',
        proTip: 'Puedes escribir tanto el SKU interno de Procoquinal (ej. VETRO-PREM-01) como el código de fábrica o alias del fabricante.'
      },
      {
        title: 'Escribir las palabras clave',
        instruction: 'Digita las primeras 3 letras del producto (ej: "vet", "poli", "epox", "albaran").'
      },
      {
        title: 'Seleccionar e ingresar al carrito',
        instruction: 'Haz clic en la tarjeta del producto deseado para agregarlo con su precio unitario e impuesto correspondiente.'
      }
    ],
    contingency: 'Si el producto no aparece, recuerda que los pigmentos de laboratorio crudos (PIGMENT-*) están ocultos en POS por ser de uso exclusivo de planta.'
  },
  {
    id: 'ESC-POS-03',
    title: '¿Cómo cambiar la cantidad de un producto o digitar decimales/fracciones en mostrador?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite botones +/- y edición manual con soporte para fracciones (ej. 2.5 galones o cuartos).',
    expectedResult: 'La línea del carrito recalcula subtotal, IVA y peso total según la nueva cantidad digitada.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['cambiar cantidad', 'mas unidades', 'fraccion', 'decimales', 'medio galon', 'modificar unidades'],
    summary: 'Ajuste de volúmenes en la canasta para ventas fraccionadas o despachos por volumen en mostrador.',
    steps: [
      {
        title: 'Localizar el ítem en la canasta lateral',
        instruction: 'Ubica el producto agregado en el panel derecho de la pantalla de ventas.'
      },
      {
        title: 'Ajustar con botones o teclado',
        instruction: 'Usa los botones (+) o (-) para cambiar enteros, o haz doble clic sobre el número para escribir cantidades decimales directas (ej: 0.25 para cuarto o 3.5).',
        proTip: 'Para solventes y resinas líquidas, Avalon admite comas o puntos decimales indistintamente.'
      },
      {
        title: 'Validar subtotal de línea',
        instruction: 'Comprueba que el subtotal se multiplique de forma exacta por el precio unitario del catálogo.'
      }
    ],
    contingency: 'Si el producto no permite decimales (ej. brocha, rodillo), el sistema redondeará automáticamente al entero más cercano.'
  },
  {
    id: 'ESC-POS-04',
    title: '¿Cómo retener un ticket en espera mientras el cliente escoge otro producto?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Guarda el carrito completo con sus clientes y notas en memoria sin bloquear la caja.',
    expectedResult: 'La canasta actual se archiva en espera con una etiqueta descriptiva y la pantalla queda libre para el siguiente cliente en fila.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['retener ticket', 'poner en espera', 'aparcar orden', 'dejar pendiente', 'esperar cliente', 'pausar canasta'],
    summary: 'Procedimiento de mostrador para evitar embotellamientos en la fila cuando un cliente va a buscar otro tarro de thinner.',
    steps: [
      {
        title: 'Presionar "Retener / En Espera"',
        instruction: 'En la parte superior de la canasta lateral, haz clic en el ícono de reloj / pausa (Retener Orden).',
        proTip: 'Puedes pausar hasta 10 tickets independientes de forma simultánea.'
      },
      {
        title: 'Ingresar nota o nombre de referencia',
        instruction: 'Escribe un alias identificativo (ej: "Don Jorge - Thinner adicional", o "Mostrador Turno 3").'
      },
      {
        title: 'Confirmar y atender siguiente venta',
        instruction: 'Presiona "Aceptar". El carrito se limpiará de inmediato y podrás facturar al siguiente comprador en fila.'
      }
    ],
    contingency: 'Los productos retenidos permanecen en el carrito temporal pero no congelan inventario para otros cajeros hasta que se cierre la venta.'
  },
  {
    id: 'ESC-POS-05',
    title: '¿Cómo recuperar o reactivar una orden que estaba en espera?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Restaura los ítems, precios, descuentos y el cliente asociado exactamente como estaban.',
    expectedResult: 'La orden vuelve a la pantalla activa del POS lista para añadir nuevos productos o cobrar de inmediato.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['recuperar ticket', 'reanudar orden', 'volver a cobrar', 'ticket pausado', 'sacar de espera'],
    summary: 'Reanudación ágil de una canasta previamente pausada cuando el cliente regresa a la caja registradora.',
    steps: [
      {
        title: 'Abrir pestaña "Órdenes en Espera"',
        instruction: 'Haz clic en la pestaña superior "En Espera" en el encabezado del panel de ventas (mostrará un contador con las órdenes activas).'
      },
      {
        title: 'Localizar la orden del cliente',
        instruction: 'Identifica la orden por el nombre de referencia, valor total o la hora en que fue retenida.'
      },
      {
        title: 'Presionar "Reanudar Venta"',
        instruction: 'Haz clic en el botón azul de reanudar. Los productos se cargarán de nuevo en el carrito.',
        warning: 'Si ya tenías productos en el carrito actual, el sistema te preguntará si deseas fusionarlos o poner la orden actual en espera.'
      }
    ],
    contingency: 'Si el cliente decidió irse sin comprar, selecciona la orden en espera y presiona "Descartar" para borrarla definitivamente.'
  },
  {
    id: 'ESC-POS-06',
    title: '¿Cómo facturar a un cliente que no tiene NIT ni cédula (Consumidor Final)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asigna por defecto el tercero comodín "222222222222 - Consumidor Final" reglamentario DIAN.',
    expectedResult: 'La venta se registra y timbra legalmente bajo la modalidad de cuantías menores sin exigir documento tributario individual.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['sin cedula', 'sin nit', 'consumidor final', 'cliente mostrador', 'cuantias menores', 'persona natural no registrada'],
    summary: 'Manejo reglamentario de ventas de mostrador a clientes casuales que compran en efectivo o tarjeta sin requerir factura nominativa.',
    steps: [
      {
        title: 'Verificar el selector de cliente en el POS',
        instruction: 'Observa el campo de cliente en el panel superior. Si no se selecciona ningún tercero, Avalon asigna automáticamente "Consumidor Final (222222222222)".',
        proTip: 'Esta modalidad aplica para transacciones de mostrador que no superen el tope legal de UVT de venta sin identificación.'
      },
      {
        title: 'Cargar los productos normalmente',
        instruction: 'Agrega los productos a la canasta y procede al cobro con el medio de pago entregado (efectivo, tarjeta, QR).'
      },
      {
        title: 'Emitir tirilla de caja POS',
        instruction: 'Presiona "Cobrar e Imprimir". La tirilla saldrá con el membrete oficial y el NIT 222222222222 reglamentario.'
      }
    ],
    contingency: 'Si el cliente a última hora solicita factura electrónica para deducir costos de su empresa, NO cierres la venta como Consumidor Final; busca su NIT o créalo antes de cobrar.'
  },
  {
    id: 'ESC-POS-07',
    title: '¿Cómo cambiar de cliente a mitad de la venta sin perder los productos ya pistoleados?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Conserva la canasta íntegra y actualiza las listas de precios y retenciones fiscales del nuevo cliente en tiempo real.',
    expectedResult: 'El cliente asignado se actualiza en el encabezado y los precios se reajustan según el tier (Regular/Estratégico) del nuevo cliente.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['cambiar cliente', 'corregir tercero', 'reasignar cliente', 'me equivoque de cliente', 'otro nit'],
    summary: 'Cambio ágil del titular de la compra cuando el cajero seleccionó un cliente por error o el comprador indica que va a nombre de otra razón social.',
    steps: [
      {
        title: 'Abrir el selector de cliente',
        instruction: 'Haz clic sobre el nombre del cliente actual en el encabezado del POS para desplegar la lista o el buscador de contactos.',
        proTip: 'Puedes presionar la (X) pequeña al lado del nombre para desvincular el cliente actual al instante.'
      },
      {
        title: 'Buscar el nuevo tercero',
        instruction: 'Escribe el NIT, razón social o nombre de la persona correcta en el cuadro de búsqueda.'
      },
      {
        title: 'Seleccionar y confirmar el cambio',
        instruction: 'Haz clic sobre el nuevo cliente. Avalon mantendrá todos los productos del carrito pero recalculará de inmediato sus descuentos de lista (5%, 15%) y retenciones tributarias.',
        warning: 'Verifica los totales netos, ya que si el nuevo cliente es Gran Contribuyente se aplicará ReteFuente automáticamente.'
      }
    ],
    contingency: 'Si el cliente que dictaron no existe en el sistema, haz clic en "+ Crear Cliente Rápido" en el mismo desplegable sin salir del POS.'
  },
  {
    id: 'ESC-POS-08',
    title: '¿Cómo registrar un cliente nuevo desde la misma pantalla de cobro del POS?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal ligero integrado con validación de NIT duplicado y consentimiento Habeas Data.',
    expectedResult: 'El cliente queda guardado en la base de datos de Avalon y seleccionado de inmediato en la venta actual.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['crear cliente pos', 'nuevo tercero', 'registrar nit', 'vincular cliente', 'dar de alta cliente'],
    summary: 'Alta inmediata de personas naturales o jurídicas en el mostrador para emitir facturas nominativas sin abandonar el flujo de cobro.',
    steps: [
      {
        title: 'Abrir el modal de creación rápida',
        instruction: 'En el menú desplegable de clientes del POS, haz clic en el botón azul "+ Nuevo Cliente / Prospecto".'
      },
      {
        title: 'Diligenciar los datos requeridos',
        instruction: 'Ingresa Empresa/Razón Social, Nombre de Contacto, NIT o Cédula, Correo Electrónico (obligatorio para factura electrónica), Teléfono/WhatsApp y Ciudad.',
        warning: 'Es indispensable marcar la casilla de "Acepta Política de Datos (Habeas Data)" conforme a la Ley 1581.'
      },
      {
        title: 'Guardar y autoseleccionar',
        instruction: 'Haz clic en "Guardar Cliente". Avalon validará que el NIT no exista previamente y lo asignará directamente al carrito en curso.'
      }
    ],
    contingency: 'Si el sistema alerta "Ya existe un cliente con el documento/NIT", búscalo directamente en el buscador de la lista principal en lugar de crearlo.'
  },
  {
    id: 'ESC-POS-09',
    title: '¿Cómo atender las alertas de venta cruzada inteligente (Cross-Selling: Base + Catalizador)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Detecta automáticamente incompatibilidades químicas y sugiere el componente reactivo faltante.',
    expectedResult: 'El asesor ofrece el catalizador correspondiente al cliente, garantizando el secado correcto y aumentando el ticket promedio.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['catalizador', 'falta catalizador', 'cross selling', 'alerta inteligente', 'vetro prem', 'cat 7074', 'igh880'],
    summary: 'Aprovechamiento de las alertas técnicas en pantalla para evitar que los clientes se lleven pinturas bicomponentes sin su agente curador.',
    steps: [
      {
        title: 'Observar el banner amarillo de advertencia técnica',
        instruction: 'Al agregar productos como Vetro Premium o Vetro Multiadherencia, Avalon desplegará una alerta: "¡Falta el Catalizador! La gama Vetro Premium requiere CAT 7074. ¿Lo agregamos?".'
      },
      {
        title: 'Ofrecer el catalizador al comprador',
        instruction: 'Pregunta al cliente si ya cuenta con el endurecedor en su taller o si requiere que se lo despachen junto a la base.',
        proTip: 'Vender una pintura bicomponente sin catalizador casi siempre resulta en reclamos por pintura que no cura ni endurece.'
      },
      {
        title: 'Agregar el catalizador sugerido con un solo clic',
        instruction: 'Haz clic en el botón de agregar catalizador dentro de la misma alerta para sumarlo a la canasta con su proporción recomendada.'
      }
    ],
    contingency: 'Si el cliente insiste en que ya tiene catalizador en su bodega, puedes cerrar la alerta y continuar con la venta normalmente.'
  },
  {
    id: 'ESC-POS-10',
    title: '¿Cómo activar el "Modo Margen" para ver la rentabilidad en tiempo real antes de cerrar la venta?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Muestra costos unitarios, margen bruto en pesos ($) y margen porcentual (%) en el pie del carrito.',
    expectedResult: 'El vendedor o jefe de tienda verifica que el margen global de la operación no caiga por debajo del umbral de rentabilidad.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['modo margen', 'ver costo', 'rentabilidad pos', 'ganancia', 'margen bruto', 'costo unitario'],
    summary: 'Herramienta de control comercial para validar la rentabilidad neta de pedidos grandes o con descuentos especiales antes de timbrar.',
    steps: [
      {
        title: 'Activar el conmutador de Modo Margen',
        instruction: 'En la parte superior derecha de la canasta, haz clic en el ícono de porcentaje o escudo "Modo Margen".',
        warning: 'Esta función está restringida a perfiles Administrador, Gerente o Vendedor Senior para proteger la confidencialidad de los costos.'
      },
      {
        title: 'Revisar costos vs. precios de venta',
        instruction: 'Cada ítem mostrará su costo promedio ponderado de inventario y el porcentaje de margen de ganancia.'
      },
      {
        title: 'Verificar el margen global acumulado',
        instruction: 'En el pie de página verás el costo total del pedido y el margen ponderado neto (ej: Margen 34.2%).',
        proTip: 'Si el margen cae por debajo del 20%, evalúa reducir el descuento comercial concedido.'
      }
    ],
    contingency: 'Recuerda desactivar el Modo Margen antes de voltear la pantalla para que el cliente firme o revise los valores.'
  },
  {
    id: 'ESC-POS-11',
    title: '¿Qué hacer si se apaga el computador o se recarga la página a mitad de una venta?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Atención en Mostrador & Canasta',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Mecanismo de persistencia local (LocalStorage POS_CART y POS_CUSTOMER) 100% resiliente.',
    expectedResult: 'Al reabrir el navegador o restaurar la energía, todos los productos, cantidades y el cliente permanecen intactos en pantalla.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['se cerro la pagina', 'corte de luz', 'se apago el pc', 'recargar pantalla', 'perdi la venta', 'recuperar carrito'],
    summary: 'Garantía de tolerancia a fallos de red y energía eléctrica para no tener que pistolear de nuevo un pedido voluminoso de mostrador.',
    steps: [
      {
        title: 'Reabrir el navegador y acceder a Avalon V1',
        instruction: 'Enciende el equipo, abre Google Chrome / Edge e ingresa nuevamente a la plataforma.'
      },
      {
        title: 'Navegar al Punto de Venta (/pos)',
        instruction: 'Haz clic en "Ventas & Ingresos > Punto de Venta (POS)".'
      },
      {
        title: 'Comprobar la canasta restaurada',
        instruction: 'Verás que el carrito carga automáticamente con todos los productos pistoleados antes del corte, incluyendo el cliente y las notas.',
        proTip: 'No es necesario volver a escanear ningún producto. Solo valida con el cliente que no falte nada y continúa al cobro.'
      }
    ],
    contingency: 'Si por alguna razón la venta ya no es necesaria, haz clic en "Limpiar Carrito" para empezar una nueva sesión limpia.'
  },

  // =========================================================================
  // SUBTEMA 2: Descuentos, Tarifas & Precios (10 Escenarios)
  // =========================================================================
  {
    id: 'ESC-POS-12',
    title: '¿Cómo aplicar un descuento por ítem individual respetando el margen mínimo?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Aplica porcentaje directo a la línea seleccionada recalculando subtotal e IVA de inmediato.',
    expectedResult: 'El ítem individual refleja su precio original tachado, el porcentaje de descuento y el nuevo valor neto liquidado.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['descuento por item', 'rebaja por producto', 'descuento linea', 'descuento parcial', 'bajar precio pintura'],
    summary: 'Procedimiento para rebajar una referencia específica (ej. por saldo de lote o promoción) sin afectar el resto de la canasta.',
    steps: [
      {
        title: 'Seleccionar el ítem en la canasta',
        instruction: 'Haz clic sobre el producto en la canasta lateral para desplegar sus opciones de detalle.'
      },
      {
        title: 'Hacer clic en el botón de Descuento (%)',
        instruction: 'Ingresa el porcentaje pactado con el cliente (ej: 5%, 8% o 10%).'
      },
      {
        title: 'Verificar el nuevo valor neto',
        instruction: 'Comprueba que el subtotal del ítem disminuya y el IVA de esa línea se calcule sobre la nueva base gravable reducida.',
        warning: 'Si intentas aplicar un descuento mayor al límite de tu rol de usuario, el sistema exigirá PIN de supervisor.'
      }
    ],
    contingency: 'Si el botón de descuento está deshabilitado en gris, el producto pertenece a la categoría de precios protegidos no descontables.'
  },
  {
    id: 'ESC-POS-13',
    title: '¿Cómo aplicar un descuento global sobre el valor total de la venta?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Prorratea el descuento entre todos los ítems respetando bases de IVA diferenciales.',
    expectedResult: 'El valor total de la factura disminuye en el porcentaje indicado y se desglosa el ahorro total en la tirilla.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['descuento global', 'descuento total', 'rebaja general', 'descuento factura', 'descuento al cierre'],
    summary: 'Aplicación de un porcentaje general de descuento comercial autorizado sobre toda la transacción.',
    steps: [
      {
        title: 'Verificar que la canasta esté completa',
        instruction: 'Asegúrate de haber ingresado todos los productos solicitados por el comprador.'
      },
      {
        title: 'Hacer clic en "Descuento Global / Cupón"',
        instruction: 'En el pie de la canasta, presiona el botón de Descuento Global e ingresa el porcentaje acordado (ej: 5% por pronto pago).'
      },
      {
        title: 'Validar la liquidación final',
        instruction: 'El sistema recalculará el subtotal bruto, el monto total descontado en pesos ($) y el nuevo total a pagar.',
        proTip: 'En la tirilla impresa se imprimirá una línea clara indicando "Descuento Global Otorgado: -$XX.XXX".'
      }
    ],
    contingency: 'Si algún producto del carrito ya tenía descuento por ítem, el descuento global se aplicará de forma compuesta según la política comercial.'
  },
  {
    id: 'ESC-POS-14',
    title: '¿Cuál es la diferencia tributaria y contable entre descuento por ítem vs. descuento general?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Ambos métodos respetan la normatividad DIAN; el descuento por ítem reduce la base individual de IVA de cada producto.',
    expectedResult: 'El usuario comprende cómo afecta cada modalidad al cálculo del IVA del 19% y a la Sábana contable.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['diferencia descuento', 'iva con descuento', 'descuento pie de factura', 'base gravable descuento', 'norma dian descuento'],
    summary: 'Criterio operativo y fiscal para elegir correctamente entre rebaja por producto o descuento comercial al pie de factura.',
    steps: [
      {
        title: 'Comprender el Descuento por Ítem (En Línea)',
        instruction: 'Afecta directamente el valor unitario del producto antes de IVA. Es ideal para liquidar mercancía en promoción o dar una cortesía en un insumo específico.'
      },
      {
        title: 'Comprender el Descuento General (Pie de Factura)',
        instruction: 'Se calcula sobre el subtotal acumulado. Avalon lo distribuye proporcionalmente sobre cada línea para que los productos con IVA (19%) y los exentos mantengan su proporción legal exacta.'
      },
      {
        title: 'Impacto en Comisiones del Asesor',
        instruction: 'Los descuentos por ítem suelen afectar la comisión directa de ese producto en la Matriz de Comisiones, mientras que los globales aplican a la rentabilidad neta.',
        proTip: 'Para clientes corporativos, se recomienda usar las Listas de Precios por Tier en vez de descuentos manuales repetitivos.'
      }
    ],
    contingency: 'En caso de dudas con una factura DIAN rechazada, revisa en Contabilidad > Sábana Operativa que el descuento no supere el subtotal de la línea.'
  },
  {
    id: 'ESC-POS-15',
    title: '¿Cómo aplicar tarifas automáticas según lista de precios (Mayorista, Regular, Estratégico)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Al seleccionar el cliente, el motor evalúa su Tier (REGULAR: 5%, STRATEGIC: 15%) y actualiza el carrito al instante.',
    expectedResult: 'Los productos se cotizan automáticamente con la tarifa corporativa autorizada sin requerir digitación manual.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['lista de precios', 'precio mayorista', 'cliente estrategico', 'tarifa especial', 'descuento automatico', 'tier cliente'],
    summary: 'Automatización de listas de precios mayoristas vinculadas a la clasificación comercial del cliente en el CRM.',
    steps: [
      {
        title: 'Seleccionar al cliente en el buscador del POS',
        instruction: 'Digita el nombre o NIT de la empresa cliente (ej: Carrocerías El Sol S.A.S.).'
      },
      {
        title: 'Observar la insignia de clasificación comercial',
        instruction: 'Junto al nombre aparecerá la etiqueta "Tier: Estratégico (15%)" o "Tier: Regular (5%)".'
      },
      {
        title: 'Verificar la aplicación automática en el carrito',
        instruction: 'Todos los productos cargados reflejarán de inmediato el descuento pactado en su lista de precios corporativa.',
        proTip: 'Si el cliente cambia de nivel en el CRM, sus compras futuras tomarán la nueva tarifa de inmediato sin reiniciar la caja.'
      }
    ],
    contingency: 'Si un cliente estratégico compra productos a precio regular por error, simplemente selecciónalo en el encabezado y el carrito se recalculará.'
  },
  {
    id: 'ESC-POS-16',
    title: '¿Cómo registrar una entrega de muestra comercial al 100% de descuento ($0 cobrado)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Al seleccionar método "Muestra", aplica 100% de descuento, descuenta stock de kárdex y emite remisión técnica.',
    expectedResult: 'El inventario rebaja físicamente las unidades entregadas sin exigir ingreso de dinero a la caja registradora.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['muestra comercial', 'muestra gratis', 'dar muestra', 'descuento 100%', 'cobro cero', 'regalar muestra taller'],
    summary: 'Procedimiento formal para entregar muestras de pinturas o resinas a clientes potenciales descontando kárdex con control de costos.',
    steps: [
      {
        title: 'Seleccionar el cliente prospecto',
        instruction: 'Asigna el cliente o taller al que se le entrega la muestra técnica.'
      },
      {
        title: 'Agregar el producto al carrito',
        instruction: 'Selecciona la referencia entregada (ej: 1 cuarto de Poliuretano Blanco Nieve).'
      },
      {
        title: 'Seleccionar método de cobro "Muestra"',
        instruction: 'En el selector de métodos de pago, elige "Muestra". Avalon aplicará automáticamente un 100% de descuento dejando el total en $0.',
        warning: 'Las muestras comerciales son auditadas por Gerencia Comercial para evitar fugas de producto terminado.'
      },
      {
        title: 'Completar y emitir comprobante de salida',
        instruction: 'Presiona "Finalizar". Se emitirá un comprobante de entrega técnica firmado para soporte del asesor.'
      }
    ],
    contingency: 'Si el sistema no muestra el método "Muestra", solicita al Administrador que active el permiso de entrega de muestras en tu perfil.'
  },
  {
    id: 'ESC-POS-17',
    title: '¿Qué hacer si el sistema bloquea un descuento por exceder el tope del cajero?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bloquea intentos de otorgar descuentos superiores al perfil asignado (Cajero: 5%, Vendedor: 10%, Admin: sin límite).',
    expectedResult: 'El sistema solicita PIN de autorización de supervisor para validar el descuento excepcional sin abortar la venta.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['descuento bloqueado', 'tope descuento', 'no me deja descontar', 'autorizacion supervisor', 'permiso descuento'],
    summary: 'Protocolo de autorización de supervisor cuando un cliente solicita una rebaja superior a las atribuciones del cajero.',
    steps: [
      {
        title: 'Identificar el mensaje de bloqueo',
        instruction: 'Al ingresar un descuento no autorizado (ej: 20%), el sistema mostrará "Descuento excede el límite permitido para tu rol".'
      },
      {
        title: 'Solicitar autorización de Administrador o Gerente',
        instruction: 'Llama al encargado de tienda o supervisor para que verifique la rentabilidad del negocio.'
      },
      {
        title: 'Ingresar PIN o credenciales de aprobación',
        instruction: 'El supervisor digitará su código en el modal de desbloqueo, autorizando la excepción para esa venta específica.',
        proTip: 'La transacción quedará registrada en la Bitácora de Auditoría con el nombre del supervisor que autorizó el descuento.'
      }
    ],
    contingency: 'Si el supervisor no se encuentra disponible, cotiza la orden y guárdala como Cotización Formal en el CRM hasta recibir la autorización.'
  },
  {
    id: 'ESC-POS-18',
    title: '¿Cómo cotizar en el POS y enviar la proforma formal por correo en PDF al cliente?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera cotización con membrete, términos de validez y la despacha por correo electrónico con un clic.',
    expectedResult: 'El cliente recibe en su bandeja de entrada el PDF de la cotización formal y la orden se guarda en el pipeline de ventas.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['cotizar pos', 'enviar proforma', 'mandar cotizacion pdf', 'presupuesto pintura', 'cotizar mostrador'],
    summary: 'Conversión inmediata de una canasta de mostrador en cotización formal enviada por email cuando el cliente aún no va a pagar.',
    steps: [
      {
        title: 'Cargar los productos y seleccionar el cliente',
        instruction: 'Agrega las pinturas, catalizadores y solventes solicitados y asegúrate de que el cliente tenga su correo electrónico registrado.'
      },
      {
        title: 'Hacer clic en "Generar Cotización / Proforma"',
        instruction: 'En lugar del botón verde de cobrar, haz clic en el botón azul "Cotizar Pedido" o presiona el atajo F7.'
      },
      {
        title: 'Revisar la vista previa y enviar',
        instruction: 'Se abrirá el modal de QuoteEmailModal. Revisa el correo de destino, escribe un mensaje de saludo y presiona "Enviar Cotización en PDF".',
        proTip: 'La cotización queda guardada en el CRM con fecha de vigencia de 15 días para hacerle seguimiento comercial.'
      }
    ],
    contingency: 'Si el cliente no tiene internet en su celular en ese momento, presiona "Descargar PDF" para imprimirle una copia física en papel carta.'
  },
  {
    id: 'ESC-POS-19',
    title: '¿Cómo aplicar exenciones o tarifas especiales de IVA según la clasificación del cliente?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Respeta las reglas de exención tributaria (taxRules) asociadas al perfil fiscal del cliente.',
    expectedResult: 'El subtotal del carrito excluye el IVA del 19% si el cliente cuenta con certificado legal de exención tributaria.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['exento de iva', 'sin iva', 'zona franca', 'exencion tributaria', 'tarifa cero iva', 'iva especial'],
    summary: 'Facturación a entidades exentas de IVA, empresas en Zonas Francas o proyectos con régimen tributario especial certificado.',
    steps: [
      {
        title: 'Seleccionar al cliente certificado en el POS',
        instruction: 'El cliente debe estar configurado en el CRM con su regla tributaria de exención (ej. Zona Franca / Exento de IVA).'
      },
      {
        title: 'Verificar el desglose de impuestos en la canasta',
        instruction: 'Observa que en el resumen del carrito el campo "IVA (19%)" liquide $0 y se detalle "Régimen Exento / 0%".'
      },
      {
        title: 'Adjuntar o verificar número de resolución',
        instruction: 'Asegúrate de que en las notas de la venta quede citado el número de resolución de exención DIAN del cliente.',
        warning: 'Facturar sin IVA a un cliente no exento genera sanciones graves de la DIAN para Procoquinal.'
      }
    ],
    contingency: 'Si el cliente insiste en ser exento pero el sistema le cobra IVA, exige la copia física del RUT con la responsabilidad tributaria antes de cambiar su perfil.'
  },
  {
    id: 'ESC-POS-20',
    title: '¿Cómo verificar las retenciones automáticas en la fuente y ReteICA aplicadas en la venta?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Calcula automáticamente ReteFuente (2.5%) y ReteICA según la ciudad del cliente (Bogotá vs. Barranquilla).',
    expectedResult: 'El total a pagar se reduce exactamente en el valor de las retenciones que el cliente deducirá en su pago.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['retefuente', 'reteica', 'retenciones pos', 'gran contribuyente', 'persona juridica', 'descuento retencion'],
    summary: 'Cálculo transparente de retenciones en la fuente aplicables a Grandes Contribuyentes y Personas Jurídicas para evitar descuadres en caja.',
    steps: [
      {
        title: 'Asignar una Persona Jurídica o Gran Contribuyente',
        instruction: 'Selecciona la empresa cliente en el POS. Avalon detectará su clasificación fiscal.'
      },
      {
        title: 'Revisar la sección de Retenciones en el carrito',
        instruction: 'Verás el desglose: "ReteFuente (2.5%)" y "ReteICA (según ciudad: Bogotá o Barranquilla)".'
      },
      {
        title: 'Validar el valor neto de cobro',
        instruction: 'El cliente solo debe pagar el Total Neto tras descontar las retenciones. En la tirilla se imprimirán ambos montos para conciliación contable.',
        proTip: 'El comprobante emitido servirá para cruzar el certificado de retención trimestral que el cliente remitirá a Contabilidad.'
      }
    ],
    contingency: 'Si la venta es a una Persona Natural no responsable de IVA, las retenciones se mantendrán automáticamente en $0.'
  },
  {
    id: 'ESC-POS-21',
    title: '¿Qué hacer si el precio de un producto no coincide con la etiqueta física de la estantería?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Descuentos, Tarifas & Precios',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite auditar el precio maestro y aplicar ajuste temporal de precio si la ley de protección al consumidor lo exige.',
    expectedResult: 'Se respeta el precio exhibido al consumidor en caso de error y se reporta la novedad al encargado de almacén para reetiquetar.',
    route: '/inventory-hub',
    routeLabel: 'Ver Catálogo de Inventario',
    synonyms: ['precio diferente', 'etiqueta mal', 'precio estante', 'cobro diferente', 'error precio', 'precio no coincide'],
    summary: 'Protocolo comercial y legal ante discrepancias entre el valor grabado en el sistema y la etiqueta pegada en el estante de la sala de ventas.',
    steps: [
      {
        title: 'Verificar físicamente la etiqueta del estante',
        instruction: 'Revisa el código y la descripción de la etiqueta física para constatar si corresponde exactamente a la misma referencia y presentación.'
      },
      {
        title: 'Aplicar la política de protección al comprador',
        instruction: 'Por normativa comercial colombiana (SIC), si la etiqueta exhibida indica un precio menor por error de actualización, se debe respetar ese precio al cliente.'
      },
      {
        title: 'Ajustar la línea mediante descuento compensatorio',
        instruction: 'Aplica un descuento puntual sobre el ítem en el POS hasta igualar el valor exhibido y anota en la observación "Ajuste por etiqueta exhibida".'
      },
      {
        title: 'Notificar inmediatamente a Bodega/Almacén',
        instruction: 'Avisa al encargado de tienda para que retire la etiqueta desactualizada y pegue el sticker con el nuevo precio de lista.',
        warning: 'No dejes etiquetas antiguas en exhibición para evitar pérdidas recurrentes de margen comercial.'
      }
    ],
    contingency: 'Si el precio del sistema es MENOR al del estante, cobra siempre el precio del sistema, beneficiando al cliente.'
  },

  // =========================================================================
  // SUBTEMA 3: Medios de Pago & Facturación (12 Escenarios)
  // =========================================================================
  {
    id: 'ESC-POS-22',
    title: '¿Cómo registrar un cobro en Efectivo y calcular la devuelta / cambio exacto?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Valida que el efectivo entregado cubra el total y calcula el cambio en pesos colombianos con dígitos grandes.',
    expectedResult: 'La venta se cierra, se abre el cajón monedero, se muestra el cambio en pantalla y se imprime la tirilla fiscal.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['efectivo', 'devuelta', 'cambio', 'billetes', 'plata en efectivo', 'cuanto devolver', 'cajon monedero'],
    summary: 'Operación estándar de cobro con billetes y monedas con cálculo instantáneo de la devuelta para evitar equivocaciones humanas.',
    steps: [
      {
        title: 'Hacer clic en "Cobrar Pedido"',
        instruction: 'Presiona el botón verde de cobro o la tecla rápida F9.'
      },
      {
        title: 'Seleccionar "Efectivo" e ingresar valor recibido',
        instruction: 'Digita el monto que entrega el comprador (ej: entrega $100.000 para una cuenta de $68.500). Puedes usar los botones rápidos de billetes ($20k, $50k, $100k).'
      },
      {
        title: 'Verificar la devuelta calculada',
        instruction: 'La pantalla mostrará en texto gigante verde: "Cambio / Devuelta: $31.500".'
      },
      {
        title: 'Entregar el cambio y la tirilla',
        instruction: 'Toma el dinero del cajón monedero, cuenta el cambio en voz alta frente al cliente y presiona "Finalizar e Imprimir".',
        proTip: 'Verifica los billetes de alta denominación ($50.000 y $100.000) con el detector de luz ultravioleta antes de ingresarlos a la gaveta.'
      }
    ],
    contingency: 'Si el cliente entrega billetes incompletos, el sistema mantendrá deshabilitado el botón de finalizar indicando "Falta dinero para cubrir la venta".'
  },
  {
    id: 'ESC-POS-23',
    title: '¿Cómo registrar un cobro con Datáfono (Tarjeta Débito / Crédito) y digitar el voucher?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite ingresar el código de autorización / número de voucher bancario para conciliación automática.',
    expectedResult: 'La venta queda saldada por datáfono y queda vinculada al lote electrónico del cierre bancario.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['datafono', 'tarjeta', 'debito', 'credito', 'voucher', 'voucher datafono', 'codigo autorizacion', 'redeban', 'bold'],
    summary: 'Cobro electrónico con terminales financieras (Redeban, Credibanco, Bold) garantizando el cruce contable del comprobante.',
    steps: [
      {
        title: 'Pasar la tarjeta por el datáfono físico',
        instruction: 'Digita en la terminal de pago el valor exacto a cobrar y solicita al cliente su clave o firma digital.'
      },
      {
        title: 'Esperar la aprobación del banco',
        instruction: 'Espera a que el datáfono imprima el voucher con el mensaje "APROBADA".'
      },
      {
        title: 'Registrar la transacción en Avalon V1',
        instruction: 'En la pantalla de pago de Avalon, selecciona "Tarjeta / Datáfono" y digita el número de comprobante/autorización que aparece en el voucher impreso.',
        warning: 'NUNCA finalices la venta en el sistema antes de que el datáfono físico confirme la aprobación del cobro.'
      },
      {
        title: 'Grapar el voucher a la copia de caja',
        instruction: 'Guarda la copia del voucher en la ranura de tarjetas del cajón para el arqueo al final del día.'
      }
    ],
    contingency: 'Si el datáfono rechaza la tarjeta por fondos insuficientes, presiona "Volver" en Avalon y solicita otro medio de pago al cliente.'
  },
  {
    id: 'ESC-POS-24',
    title: '¿Cómo registrar un pago por Transferencia Bancaria (QR Bancolombia / Daviplata / Nequi)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra el banco de destino y el código CUS/Aprobación para auditoría de tesorería.',
    expectedResult: 'La venta se registra y el dinero se destina a la cuenta bancaria corporativa correspondiente.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['transferencia', 'qr bancolombia', 'nequi', 'daviplata', 'pago movil', 'cus', 'comprobante bancario'],
    summary: 'Cobro ágil mediante códigos QR de transferencias interbancarias asegurando la verificación del ingreso antes del despacho.',
    steps: [
      {
        title: 'Mostrar el código QR oficial de Procoquinal',
        instruction: 'Presenta al cliente el código QR de Bancolombia o Davivienda ubicado en el mostrador.'
      },
      {
        title: 'Verificar la notificación en el portal o teléfono de caja',
        instruction: 'Confirma que el dinero haya ingresado efectivamente a la cuenta de la empresa y que el nombre del remitente y valor coincidan con la venta.',
        warning: 'No aceptes pantallazos reenviados por WhatsApp sin validar el saldo real en la aplicación oficial de la tienda.'
      },
      {
        title: 'Seleccionar "Transferencia" en Avalon V1',
        instruction: 'Elige el banco de destino (ej: Bancolombia Cta Cte) y escribe los últimos 6 dígitos del comprobante o número CUS.'
      },
      {
        title: 'Finalizar la venta',
        instruction: 'Emite la tirilla de venta con la marca de "Pagado por Transferencia Bancaria".'
      }
    ],
    contingency: 'Si la transferencia queda en estado "En trámite" (transferencia interbancaria ACH diferida), retén la orden en espera hasta que los fondos se acrediten.'
  },
  {
    id: 'ESC-POS-25',
    title: '¿Cómo registrar un pago mixto (ej. 50% Efectivo + 50% Datáfono o Transferencia)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite fraccionar el pago en N métodos exigiendo que la sumatoria sea 100% exacta al total facturado.',
    expectedResult: 'La factura se cancela desglosando los dos medios de pago y enviando cada monto a su respectiva cuenta contable.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['pago mixto', 'dividir cobro', 'partir pago', 'dos formas de pago', 'mitad efectivo mitad tarjeta', 'multiples medios'],
    summary: 'Liquidación de compras donde el comprador cubre una parte en billetes y la diferencia con datáfono o QR.',
    steps: [
      {
        title: 'Abrir el modal de cobro',
        instruction: 'Presiona "Cobrar Pedido" una vez completada la canasta.'
      },
      {
        title: 'Ingresar el primer medio de pago',
        instruction: 'Selecciona "Efectivo" y digita el monto exacto entregado por el cliente (ej: $100.000 de una cuenta de $250.000).'
      },
      {
        title: 'Hacer clic en "+ Agregar otro medio de pago"',
        instruction: 'Presiona el botón para agregar una segunda línea. Avalon calculará automáticamente el saldo pendiente ($150.000).'
      },
      {
        title: 'Seleccionar el segundo medio y confirmar',
        instruction: 'Elige "Datáfono / Tarjeta" e ingresa el código del voucher de los $150.000 restantes.',
        proTip: 'El botón de "Finalizar Venta" se activará únicamente cuando el saldo pendiente sea exactamente $0.'
      }
    ],
    contingency: 'Si el cliente se equivoca y la tarjeta no pasa para el segundo monto, puedes eliminar la segunda línea y cambiarla por Efectivo o Transferencia.'
  },
  {
    id: 'ESC-POS-26',
    title: '¿Cómo cobrar una venta que incluye pago en Divisas / Dólares (USD) en efectivo?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite asentar cobro en divisas aplicando la TRM autorizada de caja con registro de devuelta en COP.',
    expectedResult: 'Se registra el ingreso de divisas al arqueo especial de moneda extranjera y se liquida la devuelta en pesos colombianos.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['dolares', 'usd', 'divisas', 'pagar en dolares', 'trm', 'cambio dolares', 'moneda extranjera'],
    summary: 'Recepción de billetes en dólares estadounidenses en mostrador para clientes internacionales o zonas francas bajo TRM del día.',
    steps: [
      {
        title: 'Consultar la tasa de cambio TRM autorizada de la tienda',
        instruction: 'Verifica en el tablero de Tesorería la tasa de cambio de compra del día (ej: $4.000 COP por 1 USD).'
      },
      {
        title: 'Inspeccionar los billetes de dólares',
        instruction: 'Examina con detenimiento los sellos de agua, banda holográfica y textura de los billetes de USD.',
        warning: 'No se aceptan billetes rotos, rayados con tinta, sellados o de series antiguas no autorizadas por gerencia.'
      },
      {
        title: 'Calcular la equivalencia en Avalon V1',
        instruction: 'En el modal de cobro mixto, selecciona "Efectivo USD", digita el valor en dólares (ej: $50 USD = $200.000 COP) y liquida la devuelta en pesos colombianos.'
      },
      {
        title: 'Guardar las divisas en el compartimento especial',
        instruction: 'Coloca los billetes de USD en el sobre de divisas del cajón para su arqueo independiente al Cierre Z.'
      }
    ],
    contingency: 'Si la tienda no tiene cambio suficiente en pesos colombianos para la devuelta de un billete de $100 USD, sugiere al cliente pagar por tarjeta o transferencia bancaria.'
  },
  {
    id: 'ESC-POS-27',
    title: '¿Cómo registrar una venta a Crédito con plazo pactado validando cupo de cartera?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Verifica cupo disponible y días de mora antes de permitir facturar a 15, 30 o 60 días.',
    expectedResult: 'Se emite la factura a crédito, se actualiza el saldo de cartera del cliente y no se exige dinero en caja física.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['venta a credito', 'fiado', 'plazo 30 dias', 'cupo de credito', 'cartera', 'factura a credito', 'cuenta por cobrar'],
    summary: 'Facturación B2B a crédito para clientes con cupo aprobado y condiciones comerciales vigentes.',
    steps: [
      {
        title: 'Seleccionar al cliente con crédito aprobado',
        instruction: 'El cliente debe estar seleccionado en el POS. Avalon mostrará su saldo de crédito actual y cupo disponible.'
      },
      {
        title: 'Seleccionar método de pago "Crédito / Cartera"',
        instruction: 'En el modal de cobro, elige "Crédito Comercial". Selecciona el plazo pactado (ej: 30 días o 60 días).'
      },
      {
        title: 'Verificar validación de cupo y mora',
        instruction: 'El sistema comprobará que el nuevo monto no exceda el límite autorizado y que el cliente no tenga facturas vencidas con más de 15 días de mora.',
        warning: 'Si el cupo se supera o hay mora vencida, el botón de cobro se bloqueará en rojo requiriendo autorización de Gerencia de Crédito.'
      },
      {
        title: 'Imprimir factura con copia para firma de recibido',
        instruction: 'Imprime la factura de venta y haz firmar la copia con sello de la empresa compradora para respaldo de cobranza.'
      }
    ],
    contingency: 'Si el cliente excede su cupo pero necesita el producto urgente, puede pagar el excedente en efectivo en esa misma venta (cobro mixto Crédito + Efectivo).'
  },
  {
    id: 'ESC-POS-28',
    title: '¿Qué hacer si el datáfono arroja error o rechaza la tarjeta luego de pasar la mercancía?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite cancelar el intento de cobro sin perder los productos de la canasta ni alterar el stock.',
    expectedResult: 'El cajero regresa a la pantalla de venta intacta para intentar con otra tarjeta o cambiar a efectivo.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['datafono rechazado', 'tarjeta declinada', 'error transaccion', 'fondos insuficientes', 'fallo datafono'],
    summary: 'Contingencia de mostrador cuando la entidad financiera deniega la transacción electrónica del cliente.',
    steps: [
      {
        title: 'Revisar el mensaje en el voucher del datáfono',
        instruction: 'Verifica la causal de rechazo en la tirilla física (ej: "Fondos Insuficientes", "Tarjeta Bloqueada", "Error de Comunicación").'
      },
      {
        title: 'Informar cortésmente al comprador',
        instruction: 'Explica al cliente la respuesta del banco y consulta si dispone de otra tarjeta de crédito, débito o si prefiere hacer transferencia bancaria.'
      },
      {
        title: 'Pulsar "Cancelar Cobro" en Avalon V1',
        instruction: 'En el modal de cobro de Avalon, presiona "Volver / Cancelar". Todos los productos seguirán en el carrito sin ningún cambio.',
        proTip: 'Si el cliente necesita salir al cajero automático más cercano, pon la orden "En Espera" para no frenar la fila de mostrador.'
      }
    ],
    contingency: 'Bajo ninguna circunstancia entregues la mercancía si el datáfono no expide el voucher impreso con la palabra "APROBADA".'
  },
  {
    id: 'ESC-POS-29',
    title: '¿Qué hacer si la transferencia de Bancolombia no cae de inmediato en la cuenta de la empresa?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite retener la orden en espera con la referencia CUS del cliente mientras Tesorería valida el abono.',
    expectedResult: 'Se evita entregar producto sin respaldo de dinero en cuenta bancaria y se protege la caja contra fraudes de comprobantes falsos.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['transferencia no cae', 'plata no llega', 'demora transferencia', 'comprobante sospechoso', 'validar transferencia'],
    summary: 'Protocolo de seguridad contra comprobantes ficticios o transferencias en tránsito diferidas.',
    steps: [
      {
        title: 'Verificar la plataforma bancaria de la empresa',
        instruction: 'El cajero o encargado de tienda debe refrescar la app de Bancolombia / Davivienda de la empresa para confirmar el saldo disponible.'
      },
      {
        title: 'Revisar si es una transferencia de otro banco (ACH)',
        instruction: 'Si el cliente transfirió desde un banco diferente (ej: de BBVA a Bancolombia), los fondos pueden demorar entre 2 y 24 horas en verse reflejados.'
      },
      {
        title: 'Explicar la política de despacho de la empresa',
        instruction: 'Indica al cliente que por política de auditoría de Procoquinal, la mercancía solo puede salir del mostrador cuando los fondos están acreditados en la cuenta.'
      },
      {
        title: 'Retener la orden en espera con el número de CUS',
        instruction: 'Pon la orden en espera en el POS anotando el número de comprobante para liberarla apenas ingrese el dinero.',
        warning: 'Existen aplicaciones móviles que simulan pantallas falsas de Nequi o Bancolombia. Exige siempre la confirmación en el saldo de la tienda.'
      }
    ],
    contingency: 'Si el cliente tiene urgencia inmediata, puede realizar el pago en efectivo o con tarjeta física por datáfono para llevarse la mercancía ya mismo.'
  },
  {
    id: 'ESC-POS-30',
    title: '¿Cómo emitir la tirilla de venta térmica POS con formato reglamentario?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal PosReceiptModal configurado para impresoras de 80mm y 58mm con encabezado fiscal completo.',
    expectedResult: 'La impresora térmica expide el ticket con datos de Procoquinal SAS, NIT, resolución DIAN, desglose de IVA y código de barras.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['imprimir tirilla', 'ticket pos', 'recibo termico', 'impresora 80mm', 'sacar ticket', 'tirilla caja'],
    summary: 'Generación reglamentaria del comprobante de venta físico para entrega inmediata al cliente de mostrador.',
    steps: [
      {
        title: 'Finalizar la venta en el POS',
        instruction: 'Al completar el cobro, el sistema abrirá automáticamente la ventana modal de vista previa del recibo (PosReceiptModal).'
      },
      {
        title: 'Presionar "Imprimir Recibo"',
        instruction: 'Haz clic en el botón azul con ícono de impresora o presiona Enter en tu teclado.'
      },
      {
        title: 'Confirmar el envío a la impresora térmica',
        instruction: 'El diálogo del sistema enviará la orden a la impresora térmica POS (ej: Epson TM-T20 o Xprinter 80mm) con corte automático de papel.',
        proTip: 'Asegúrate de que en el diálogo de impresión esté desactivada la opción "Márgenes" para que el texto aproveche el ancho completo del papel.'
      }
    ],
    contingency: 'Si el cliente solicita formato de factura electrónica tamaño carta en vez de tirilla, presiona "Descargar Factura PDF" en el mismo modal.'
  },
  {
    id: 'ESC-POS-31',
    title: '¿Cómo exportar o enviar por correo electrónico el recibo digital de la venta en PDF?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera PDF vectorial limpio y permite envío directo al correo registrado del comprador.',
    expectedResult: 'El comprobante en PDF se descarga en el equipo o se despacha al correo electrónico del cliente.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['recibo digital', 'enviar recibo correo', 'factura pdf', 'descargar tirilla pdf', 'recibo whatsapp'],
    summary: 'Opción ecológica y digital para clientes que prefieren recibir su soporte de compra en el celular o por correo.',
    steps: [
      {
        title: 'Acceder a la vista previa del recibo',
        instruction: 'En la pantalla de venta finalizada o desde el Historial POS, abre la visualización de la tirilla.'
      },
      {
        title: 'Hacer clic en "Enviar por Correo"',
        instruction: 'Presiona el botón de sobre (Email). Si el cliente ya tenía correo guardado, aparecerá precargado; de lo contrario puedes escribirlo en el momento.'
      },
      {
        title: 'Descargar copia en PDF para WhatsApp',
        instruction: 'Haz clic en "Descargar PDF". El archivo se guardará en tu carpeta de Descargas para que puedas adjuntarlo por WhatsApp Web al cliente.',
        proTip: 'El PDF incluye el código QR de verificación para que el cliente lo consulte desde cualquier teléfono móvil.'
      }
    ],
    contingency: 'Si el envío por correo rebota, verifica que la dirección de correo no tenga espacios ni caracteres especiales inválidos.'
  },
  {
    id: 'ESC-POS-32',
    title: '¿Qué hacer si la impresora de tirillas se queda sin papel térmico o se atasca durante la impresión?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: La transacción queda guardada en la base de datos sin alterarse; permite reimpresión ilimitada desde Historial.',
    expectedResult: 'El cajero recarga el rollo de papel y emite nuevamente la tirilla sin necesidad de volver a cobrar ni duplicar la venta.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['se acabo el papel', 'rollo papel', 'impresora atascada', 'no salio el ticket', 'rollo termico', 'reimprimir ticket atascado'],
    summary: 'Resolución de problemas mecánicos de la impresora térmica en mostrador sin afectar la integridad contable.',
    steps: [
      {
        title: 'Abrir la tapa de la impresora térmica',
        instruction: 'Presiona el botón de apertura mecánica y retira el cono de plástico del rollo agotado o el papel arrugado del atasco.'
      },
      {
        title: 'Colocar el nuevo rollo térmico de 80mm',
        instruction: 'Inserta el nuevo rollo con la cara sensible hacia el cabezal térmico (el papel debe salir desenrollándose desde abajo hacia arriba). Cierra la tapa firmemente.',
        warning: 'Si colocas el papel al revés, la impresora avanzará pero saldrá completamente en blanco.'
      },
      {
        title: 'Reimprimir la última venta',
        instruction: 'Ve a "Ventas & Ingresos > Historial / Turno", haz clic en la primera venta de la lista y presiona el ícono de impresora para sacar el ticket.',
        proTip: 'La tirilla saldrá con la marca de copia fiel sin alterar ningún saldo de caja.'
      }
    ],
    contingency: 'Mantén siempre al menos 2 rollos de papel térmico de repuesto debajo del mueble de caja registradora.'
  },
  {
    id: 'ESC-POS-33',
    title: '¿Cómo reimprimir una copia de una tirilla emitida previamente en el turno?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Medios de Pago & Facturación',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Historial con búsqueda instantánea por número de ticket, hora o cliente con marca de agua "Copia".',
    expectedResult: 'Se emite un duplicado idéntico del recibo para entregarlo al cliente que extravió el original.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['reimprimir', 'copia recibo', 'ticket perdido', 'duplicado tirilla', 'volver a imprimir factura'],
    summary: 'Generación de copias de recibos para clientes que requieren un segundo soporte para su departamento contable.',
    steps: [
      {
        title: 'Ir al módulo Historial / Turno',
        instruction: 'En el menú lateral, selecciona "Ventas & Ingresos > Historial / Turno".'
      },
      {
        title: 'Buscar la transacción requerida',
        instruction: 'Filtra por nombre del comprador, hora de la transacción o valor total cobrado.'
      },
      {
        title: 'Presionar el botón de Impresión',
        instruction: 'Haz clic en el ícono de impresora al final de la fila. Se abrirá la tirilla con el rótulo "COPIA DE FACTURA".',
        proTip: 'Puedes reimprimir tickets de turnos de semanas anteriores usando los filtros de fecha.'
      }
    ],
    contingency: 'Si la venta no aparece en el historial del día, revisa si fue emitida bajo otra caja o si fue guardada como cotización en vez de factura.'
  },

  // =========================================================================
  // SUBTEMA 4: Anulaciones, Correcciones & Contingencias (10 Escenarios)
  // =========================================================================
  {
    id: 'ESC-POS-34',
    title: '¿Cómo eliminar un producto individual del carrito antes de finalizar la venta?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Elimina la línea con un solo clic recalculando subtotal, IVA y totales al instante.',
    expectedResult: 'El producto se retira de la canasta sin generar ningún registro contable ni afectar el inventario.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['borrar producto', 'quitar del carrito', 'eliminar item', 'caneca', 'me equivoque producto', 'quitar pintura'],
    summary: 'Corrección inmediata en mostrador cuando el cliente decide no llevar un artículo específico antes de pagar.',
    steps: [
      {
        title: 'Ubicar el producto en el carrito lateral',
        instruction: 'Identifica la línea del producto que se desea descartar.'
      },
      {
        title: 'Hacer clic en el ícono de papelera roja',
        instruction: 'Haz clic en el botón con la caneca de basura ubicado al lado derecho del ítem.',
        proTip: 'También puedes reducir la cantidad a 0 con el botón (-) para que el ítem se autoelimine de la lista.'
      },
      {
        title: 'Validar la actualización del total',
        instruction: 'Comprueba que el subtotal y el IVA disminuyan en el valor exacto del producto retirado.'
      }
    ],
    contingency: 'Si eliminaste el producto por error, simplemente vuelve a pistolearlo con el lector de código de barras para añadirlo de nuevo.'
  },
  {
    id: 'ESC-POS-35',
    title: '¿Cómo vaciar el carrito completo y cancelar la venta antes del cobro?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal de confirmación EmptyCartModal para evitar vaciar canastas por clic accidental.',
    expectedResult: 'El carrito se limpia por completo, se desvincula el cliente y la pantalla queda lista para una nueva venta.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['vaciar carrito', 'limpiar canasta', 'cancelar venta', 'borrar todo', 'cliente desistio', 'anular canasta'],
    summary: 'Reinicio limpio de la pantalla del punto de venta cuando un cliente desiste de toda su compra antes de pagar.',
    steps: [
      {
        title: 'Presionar "Limpiar Carrito"',
        instruction: 'En la parte inferior de la canasta, haz clic en el botón "Limpiar Carrito" (ícono de papelera gris).'
      },
      {
        title: 'Confirmar en el modal de advertencia',
        instruction: 'Avalon mostrará un cuadro de diálogo: "¿Seguro que deseas vaciar todos los productos del carrito actual?". Presiona "Sí, Vaciar".',
        warning: 'Esta acción no se puede deshacer. Se borrarán todos los productos pistoleados en esa canasta.'
      },
      {
        title: 'Retornar productos al mostrador físico',
        instruction: 'Devuelve las latas de pintura y accesorios físicos a sus estantes correspondientes en la sala de ventas.'
      }
    ],
    contingency: 'Si el cliente solo iba al cajero automático y planea volver en 10 minutos, NO limpies el carrito; usa "Poner en Espera" (ESC-POS-04).'
  },
  {
    id: 'ESC-POS-36',
    title: '¿Cómo anular solo un producto de una tirilla ya cobrada e impresa? (Nota Crédito Parcial)',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Operación mediante Contabilidad > Devoluciones (/returns). Emite Nota Crédito y reingresa el stock al Kárdex.',
    expectedResult: 'El producto devuelto reingresa a inventario, se descuenta de las ventas del día y se entrega saldo a favor o reembolso.',
    route: '/returns',
    routeLabel: 'Ir al Panel de Devoluciones',
    synonyms: ['anular producto tirilla', 'anular de ticket impreso', 'nota credito parcial', 'devolver un producto', 'cliente se arrepintio de uno'],
    summary: 'Procedimiento formal y fiscal para reversar un solo producto de una venta ya cerrada y timbrada sin anular la factura entera.',
    steps: [
      {
        title: 'No intentar anular desde el POS',
        instruction: 'Una vez la venta fue cobrada y la tirilla salió, NO se puede alterar desde el carrito por normas tributarias de la DIAN.'
      },
      {
        title: 'Acceder a "Contabilidad & Caja > Devoluciones"',
        instruction: 'Navega en el menú lateral a la sección de Devoluciones (/returns).'
      },
      {
        title: 'Localizar la factura original por número o NIT',
        instruction: 'Escribe el número de tirilla (ej: T-10452) o el nombre del cliente en el buscador.'
      },
      {
        title: 'Marcar ÚNICAMENTE el ítem que se va a devolver',
        instruction: 'Selecciona la casilla del producto específico (ej: Galón de Thinner) e indica la cantidad (1 unidad). Deja los demás productos sin marcar.',
        proTip: 'Selecciona si el producto devuelto reingresa a "Stock Disponible" (si está sellado) o a "Cuarentena/Merma" (si fue destapado).'
      },
      {
        title: 'Generar Nota Crédito Parcial',
        instruction: 'Presiona "Aprobar Devolución". El sistema emitirá la Nota Crédito oficial y generará un comprobante de egreso si se devolvió efectivo de la caja.'
      }
    ],
    contingency: 'Si la venta original fue pagada con datáfono, puedes entregar el dinero en efectivo de caja menor o generar un Saldo a Favor en Avalon para su próxima compra.'
  },
  {
    id: 'ESC-POS-37',
    title: '¿Cómo anular una tirilla completa por desistimiento del cliente o error grave de digitación?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Anulación total mediante Nota Crédito 100% que revierte kárdex, caja e impuestos.',
    expectedResult: 'La factura queda en estado ANULADA, se repone la totalidad del stock en Kárdex y se emite el comprobante de reversión.',
    route: '/returns',
    routeLabel: 'Ir al Panel de Devoluciones',
    synonyms: ['anular factura completa', 'anular tirilla entera', 'cancelar venta ya cobrada', 'nota credito total', 'reversar venta'],
    summary: 'Anulación integral de una transacción cobrada por error de monto, equivocación de cliente o cancelación total del pedido.',
    steps: [
      {
        title: 'Dirigirse al módulo de Devoluciones (/returns)',
        instruction: 'Accede a "Contabilidad & Caja > Devoluciones".'
      },
      {
        title: 'Buscar la factura y seleccionar "Devolver Todos los Ítems"',
        instruction: 'Marca la casilla superior para seleccionar el 100% de los productos de la transacción.'
      },
      {
        title: 'Ingresar el motivo obligatorio de anulación',
        instruction: 'Escribe la justificación requerida por auditoría (ej: "Error de digitación de cajero", "Cliente canceló obra").'
      },
      {
        title: 'Emitir la Nota Crédito Total',
        instruction: 'Presiona "Generar Nota Crédito Total". La venta original quedará neutralizada en la Sábana contable y el dinero egresará del reporte del día.',
        warning: 'Grapa la tirilla original rayada con una línea diagonal ("ANULADA") junto con el comprobante de Nota Crédito en el sobre de caja.'
      }
    ],
    contingency: 'Si la factura tiene más de 30 días calendario, el sistema exigirá autorización del Revisor Fiscal o Gerente Financiero.'
  },
  {
    id: 'ESC-POS-38',
    title: '¿Cómo corregir el medio de pago si se registró por error Efectivo en lugar de Datáfono?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: En Historial POS permite editar el método de pago antes del Cierre Z de turno.',
    expectedResult: 'El monto se traslada de la cuenta de Efectivo a la cuenta de Datáfono/Bancos sin descuadrar el arqueo del Cierre Z.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['corregir medio de pago', 'me equivoque de pago', 'era tarjeta no efectivo', 'cambiar metodo pago', 'reclasificar cobro'],
    summary: 'Reclasificación contable de métodos de pago cuando el cajero cobró con tarjeta pero seleccionó efectivo en el software por descuido.',
    steps: [
      {
        title: 'Identificar la venta en el Historial del Turno',
        instruction: 'Ve a "Ventas & Ingresos > Historial / Turno" y localiza la venta antes de realizar el Cierre Z.'
      },
      {
        title: 'Hacer clic en "Reclasificar Método de Pago"',
        instruction: 'Presiona el ícono de intercambio (ArrowRightLeft) al lado del método de pago de la venta.'
      },
      {
        title: 'Seleccionar el método real y escribir el voucher',
        instruction: 'Cambia "Efectivo" por "Tarjeta / Datáfono" e ingresa el número de autorización del voucher impreso.',
        proTip: 'Esta corrección previene que al final del día la caja física presente un faltante ficticio de efectivo y un sobrante en los vouchers de datáfono.'
      },
      {
        title: 'Guardar la modificación',
        instruction: 'Presiona "Actualizar Método". El resumen de caja del día se recalculará de forma inmediata.'
      }
    ],
    contingency: 'Si el turno YA fue cerrado con Cierre Z, la reclasificación debe ser ejecutada por la contadora directamente en la Sábana Operativa.'
  },
  {
    id: 'ESC-POS-39',
    title: '¿Cómo gestionar un cambio de producto mano a mano por diferente color o galón?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Si los productos tienen igual precio, se tramita cambio mano a mano en Devoluciones manteniendo saldo cero.',
    expectedResult: 'El Kárdex da entrada al color devuelto y salida al nuevo color sin exigir cobro adicional ni generar devoluciones de dinero.',
    route: '/returns',
    routeLabel: 'Ir al Panel de Devoluciones',
    synonyms: ['cambio de producto', 'cambio mano a mano', 'cambiar color', 'cliente cambio de opinion', 'trocar producto'],
    summary: 'Procedimiento cuando un cliente regresa a cambiar una lata de pintura por otra de igual valor comercial.',
    steps: [
      {
        title: 'Revisar el estado físico del producto retornado',
        instruction: 'Verifica que el galón o cuñete esté completamente sellado, limpio, sin abolladuras y con su precinto intacto.',
        warning: 'Las pinturas tinturadas a pedido especial con código personalizado NO tienen cambio mano a mano por ser fórmulas a la medida.'
      },
      {
        title: 'Tramitar la devolución del producto original',
        instruction: 'En Contabilidad > Devoluciones, selecciona la factura y genera Nota Crédito con destino a "Saldo a Favor del Cliente".'
      },
      {
        title: 'Facturar el nuevo producto en el POS',
        instruction: 'Ve al POS, agrega el nuevo color o referencia y al momento de cobrar selecciona "Pagar con Saldo a Favor / Nota Crédito".',
        proTip: 'El valor a pagar será $0 si tienen el mismo precio, o la diferencia en pesos si el nuevo producto es de mayor valor.'
      }
    ],
    contingency: 'Si el nuevo producto es más económico, el cliente conservará el saldo restante en su cuenta de Avalon para su próxima visita.'
  },
  {
    id: 'ESC-POS-40',
    title: '¿Qué hacer cuando el POS alerta "Stock insuficiente / Reservado por ATP"?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: El motor ATP (Available to Promise) protege contra sobreventa de productos comprometidos en órdenes en despacho.',
    expectedResult: 'El cajero comprende por qué el producto físico en estante no se puede facturar y consulta qué pedido lo tiene apartado.',
    route: '/atp',
    routeLabel: 'Consultar Reservado ATP',
    synonyms: ['stock insuficiente', 'reservado atp', 'no hay stock', 'producto bloqueado', 'sin existencias', 'por que no puedo vender'],
    summary: 'Resolución de conflictos de inventario cuando hay tarros físicos en la tienda pero el sistema impide su facturación.',
    steps: [
      {
        title: 'Leer el mensaje de bloqueo del POS',
        instruction: 'Al intentar agregar el producto, Avalon indicará: "Stock Físico: 5 galones | Stock Disponible ATP: 0 galones (5 unidades reservadas por Pedido #XXX)".'
      },
      {
        title: 'Ingresar al módulo de Reservado ATP',
        instruction: 'Haz clic en el enlace de la alerta o ve a "Ventas & Ingresos > Reservado ATP".'
      },
      {
        title: 'Identificar la orden de reserva',
        instruction: 'Verifica si la reserva corresponde a una cotización vieja no pagada o a un despacho en ruta para entrega mañana.',
        proTip: 'Si la cotización anterior ya venció, puedes solicitar al vendedor o despachador que libere las unidades para vendérselas al cliente que tiene el dinero en mano.'
      }
    ],
    contingency: 'Si se confirma que hay más tarros en bodega que no han sido ingresados al sistema, solicita al bodeguero dar entrada a la remisión en Kárdex.'
  },
  {
    id: 'ESC-POS-41',
    title: '¿Cómo liberar una reserva de inventario en el módulo ATP si el cliente no retiró el pedido?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite cancelar reservas expiradas devolviendo el stock disponible al mostrador de inmediato.',
    expectedResult: 'Las unidades quedan inmediatamente habilitadas para ser facturadas y pistoleadas en el POS.',
    route: '/atp',
    routeLabel: 'Ir al Módulo ATP',
    synonyms: ['liberar atp', 'cancelar reserva', 'desbloquear stock', 'quitar apartado', 'cliente no vino'],
    summary: 'Desbloqueo de unidades retenidas por cotizaciones caducadas para permitir su venta inmediata en mostrador.',
    steps: [
      {
        title: 'Acceder a Reservado ATP (/atp)',
        instruction: 'Ve a "Ventas & Ingresos > Reservado ATP" en el menú de navegación.'
      },
      {
        title: 'Buscar la referencia o la cotización apartada',
        instruction: 'Filtra por SKU o nombre del cliente que tenía el apartado.'
      },
      {
        title: 'Presionar "Liberar Stock / Cancelar Apartado"',
        instruction: 'Haz clic en el botón rojo de liberación. Confirma que el cliente ya fue notificado y no retiró el pedido en el plazo pactado.',
        warning: 'Esta acción cancela la reserva para el cliente anterior y deja el producto disponible para cualquiera en el POS.'
      },
      {
        title: 'Regresar al POS y facturar',
        instruction: 'Vuelve a la pantalla de ventas; el producto ya podrá ser agregado a la canasta con stock en verde.'
      }
    ],
    contingency: 'Si el cliente anterior llega más tarde a reclamar, se le deberá fabricar un nuevo lote mediante orden de mezcla en Taller.'
  },
  {
    id: 'ESC-POS-42',
    title: '¿Cómo registrar la devolución de mercancía por defecto de fábrica o empaque abollado?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: En Devoluciones permite marcar el destino como "Cuarentena / Merma" para no mezclarlo con stock apto.',
    expectedResult: 'El producto defectuoso entra a la bodega de Cuarentena para reclamo al proveedor sin contaminar el stock vendible.',
    route: '/returns',
    routeLabel: 'Ir al Panel de Devoluciones',
    synonyms: ['producto defectuoso', 'lata abollada', 'pintura danada', 'garantia producto', 'reclamo calidad', 'cuarentena devolucion'],
    summary: 'Gestión técnica y contable de productos retornados por fallas de calidad o daños en envase.',
    steps: [
      {
        title: 'Inspeccionar el producto y registrar la novedad',
        instruction: 'Toma fotografías del defecto (ej: resina gelificada, lata perforada con fuga, grumos anormales).'
      },
      {
        title: 'Ingresar a Devoluciones (/returns)',
        instruction: 'Busca la factura original de compra del cliente.'
      },
      {
        title: 'Seleccionar motivo "Garantía / Defecto de Calidad"',
        instruction: 'Marca el producto y elige la causal de calidad correspondiente.'
      },
      {
        title: 'Seleccionar ubicación de destino: "Cuarentena"',
        instruction: 'Marca la casilla "Reingresar a Cuarentena / No Apto para Venta". Esto asegura que el sistema no lo vuelva a ofrecer en el POS.',
        proTip: 'El producto quedará disponible para que el Laboratorio de Calidad lo audite o se tramite la garantía con el fabricante de la materia prima.'
      },
      {
        title: 'Entregar un producto nuevo de reemplazo al cliente',
        instruction: 'Entrega una lata nueva y en perfecto estado para preservar la confianza del cliente.'
      }
    ],
    contingency: 'Si no hay más existencias del mismo lote en bodega, coordina con Laboratorio una producción exprés o genera la devolución del dinero.'
  },
  {
    id: 'ESC-POS-43',
    title: '¿Qué hacer si se cobró un monto de más por datáfono y se debe reversar al cliente?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Anulaciones & Correcciones',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Guía de anulación directa en datáfono físico antes del cierre de lote bancario de las 9:00 PM.',
    expectedResult: 'Se revierte el cobro erróneo en la tarjeta del cliente y se emite la tirilla correcta sin pérdida financiera.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['cobre de mas', 'error valor datafono', 'reversar tarjeta', 'anular voucher', 'devolver plata tarjeta'],
    summary: 'Procedimiento de emergencia cuando el cajero digita ceros de más en el datáfono (ej. cobró $500.000 en vez de $50.000).',
    steps: [
      {
        title: 'No dejar ir al cliente del mostrador',
        instruction: 'La reversión directa en datáfono solo se puede realizar mientras el lote del día de la terminal no haya cerrado y la tarjeta esté presente.'
      },
      {
        title: 'Tomar el datáfono físico y presionar "Anulación"',
        instruction: 'Presiona la tecla Función/Menú en el datáfono, selecciona "Anulaciones", digita la clave de supervisor del datáfono y escribe el número de recibo del voucher.'
      },
      {
        title: 'Insertar o deslizar la tarjeta del comprador',
        instruction: 'Pide al cliente que vuelva a pasar su tarjeta. El datáfono emitirá la tirilla con la leyenda "TRANSACCIÓN ANULADA / REVERSADA".',
        warning: 'Grapa ambas tirillas juntas (la de cobro erróneo y la de reversión) como comprobante de auditoría bancaria.'
      },
      {
        title: 'Volver a pasar el cobro por el valor correcto',
        instruction: 'Digita con cuidado el monto exacto en el datáfono y registra el nuevo voucher en Avalon V1.'
      }
    ],
    contingency: 'Si el cliente ya se fue cuando notaste el error, comunícate de inmediato con la línea de soporte de Redeban/Credibanco y tu entidad bancaria para solicitar el reverso administrativo.'
  },

  // =========================================================================
  // SUBTEMA 5: Caja, Turnos, Arqueos & Cierre Z (12 Escenarios)
  // =========================================================================
  {
    id: 'ESC-POS-44',
    title: '¿Cómo registrar la Base Inicial de Efectivo al abrir el turno de caja por la mañana?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra el fondo fijo de sencillo (ej: $200.000 COP) para no mezclarlo con las ventas del día.',
    expectedResult: 'El sistema abre la sesión de caja con la base contable registrada y lista para calcular devueltas.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['base de caja', 'apertura de caja', 'fondo inicial', 'abrir turno', 'plata para cambio', 'base de efectivo'],
    summary: 'Paso obligatorio de cada mañana para ingresar el sencillo disponible en gaveta antes de atender al primer cliente.',
    steps: [
      {
        title: 'Contar el dinero físico de la gaveta',
        instruction: 'Cuenta los billetes de baja denominación ($2.000, $5.000, $10.000) y monedas entregadas por el administrador como base (usualmente $200.000 COP).'
      },
      {
        title: 'Acceder a "Apertura de Caja / Base"',
        instruction: 'Al iniciar sesión en el POS por primera vez en el día, el sistema solicitará "Ingresar Base Inicial de Efectivo".'
      },
      {
        title: 'Digitar el valor exacto y confirmar',
        instruction: 'Escribe el monto (ej: $200.000) y presiona "Abrir Caja".',
        proTip: 'Esta base no sumará como ingreso de ventas, garantizando que el Cierre Z no presente sobrantes ficticios al final del turno.'
      }
    ],
    contingency: 'Si la base entregada no coincide con lo indicado en el sobre, notifica de inmediato al administrador antes de abrir la sesión.'
  },
  {
    id: 'ESC-POS-45',
    title: '¿Cómo modificar o corregir la base de efectivo si se contó mal al abrir la caja?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite ajuste de base mediante registro de salida/entrada justificada en Historial de Turno.',
    expectedResult: 'El saldo inicial de efectivo se ajusta reflejando el valor real contado y dejando rastro en auditoría.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['cambio de base', 'corregir base', 'modificar base caja', 'me equivoque en la base', 'ajustar apertura'],
    summary: 'Ajuste auditado del monto de apertura cuando el cajero digitó un cero adicional o encontró billetes pegados tras abrir.',
    steps: [
      {
        title: 'Ir a "Ventas & Ingresos > Historial / Turno"',
        instruction: 'Accede al panel de control del turno en curso.'
      },
      {
        title: 'Verificar el descuadre con el dinero físico',
        instruction: 'Comprueba cuánto fue el error (ej: se registraron $250.000 pero físicamente solo había $200.000).'
      },
      {
        title: 'Registrar un ajuste de caja correctivo',
        instruction: 'Haz clic en "Registrar Salida de Caja", digita los $50.000 de diferencia y escribe en la nota: "Ajuste por corrección de conteo en base inicial de apertura".',
        warning: 'El sistema enviará una notificación de alerta al Administrador de Tienda para que valide el ajuste.'
      },
      {
        title: 'Comprobar el nuevo Neto en Caja',
        instruction: 'Verifica en el tablero que el saldo neto en efectivo coincida con la plata física que tienes en la gaveta.'
      }
    ],
    contingency: 'Para evitar estos ajustes, cuenta siempre la base dos veces por denominación antes de digitar el valor de apertura.'
  },
  {
    id: 'ESC-POS-46',
    title: '¿Cómo realizar un arqueo ciego de efectivo a mitad de turno sin cerrar la caja?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite auditar el dinero de la gaveta sin interrumpir la operación ni cerrar el turno fiscal.',
    expectedResult: 'El supervisor verifica que el efectivo físico coincida con las ventas acumuladas hasta esa hora.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['arqueo a mitad de turno', 'arqueo ciego', 'auditoria de caja', 'contar caja medio dia', 'arqueo sorpresa'],
    summary: 'Inspección de control interno a mediodía para detectar diferencias de dinero antes de que termine la jornada laboral.',
    steps: [
      {
        title: 'Poner la atención de mostrador en pausa breve',
        instruction: 'Espera a no tener clientes en ventanilla o asigna la atención al segundo cajero.'
      },
      {
        title: 'Realizar el conteo ciego de billetes y monedas',
        instruction: 'El supervisor o cajero cuenta todo el dinero físico de la gaveta sin consultar la pantalla del sistema.',
        proTip: 'Hacer el conteo a ciegas evita sesgos cognitivos o intentos de cuadre forzado.'
      },
      {
        title: 'Consultar el saldo acumulado en Avalon V1',
        instruction: 'Revisa en "Historial / Turno" la tarjeta "Neto en Caja (Ventas del Día - Salidas de Caja + Base)".'
      },
      {
        title: 'Comparar el total físico vs. total del sistema',
        instruction: 'Resta el dinero físico del valor que arroja el sistema. Si la diferencia es menor a $1.000, la caja marcha en orden.',
        warning: 'Si encuentras un descuadre notable a mediodía, revisa de inmediato los últimos cobros en efectivo antes de que los clientes se marchen.'
      }
    ],
    contingency: 'Si hay exceso de billetes grandes en gaveta, procede de inmediato a realizar un descope de seguridad (ESC-POS-47).'
  },
  {
    id: 'ESC-POS-47',
    title: '¿Cómo registrar una salida de efectivo de caja por seguridad (descope a caja fuerte)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Registrar Salida de Caja" en PosHistory que descuenta el efectivo de gaveta y genera recibo de custodia.',
    expectedResult: 'El efectivo en mostrador disminuye a niveles seguros y el dinero transferido queda bajo custodia de la caja fuerte principal.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['descope', 'salida de caja', 'caja fuerte', 'retiro por seguridad', 'guardar plata', 'alivio de caja', 'retiro efectivo'],
    summary: 'Retiro preventivo de efectivo del cajón monedero cuando se acumula mucho dinero para mitigar riesgos de hurto o robo.',
    steps: [
      {
        title: 'Detectar tope de efectivo en gaveta',
        instruction: 'Por política de seguridad de Procoquinal, la gaveta de mostrador no debe acumular más de $1.000.000 COP en efectivo.'
      },
      {
        title: 'Hacer clic en "Registrar Salida de Caja"',
        instruction: 'En el encabezado de "Historial / Turno", presiona el botón naranja "Registrar Salida de Caja".'
      },
      {
        title: 'Digitar el monto retirado y concepto',
        instruction: 'Ingresa el valor a trasladar (ej: $700.000 COP en billetes de $50k y $100k) y escribe: "Descope preventivo a Caja Fuerte Principal".'
      },
      {
        title: 'Entregar el dinero al administrador y firmar',
        instruction: 'Coloca el dinero en la bolsa de custodia y entrégalo al administrador para que lo deposite en la caja fuerte.',
        proTip: 'Esta salida queda registrada formalmente, por lo que al hacer el Cierre Z no figurará como faltante de dinero.'
      }
    ],
    contingency: 'Guarda siempre el recibo de salida firmado por quien recibió el dinero en la caja fuerte dentro de la gaveta del cajero.'
  },
  {
    id: 'ESC-POS-48',
    title: '¿Cómo asentar un gasto operativo urgente de mostrador (taxi, refrigerio, insumos de aseo)?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra egresos de caja menor con soporte y concepto contable descontando del disponible de caja.',
    expectedResult: 'El gasto queda legalizado en el sistema, se deduce del saldo de caja y se adjunta a los soportes del turno.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['gasto de caja', 'comprar bolsas', 'pagar taxi', 'gasto imprevisto', 'caja menor mostrador', 'salida plata menor'],
    summary: 'Pago de contingencias menores operativas con dinero en efectivo de la gaveta manteniendo el control contable.',
    steps: [
      {
        title: 'Hacer clic en "Registrar Gasto de Caja"',
        instruction: 'En "Historial / Turno", presiona el botón rojo "Registrar Gasto de Caja".'
      },
      {
        title: 'Ingresar valor exacto y beneficiario',
        instruction: 'Digita el monto del gasto (ej: $15.000 COP) y el nombre de a quién se le pagó (ej: "Ferretería El Tornillo - Cinta de Embalaje").'
      },
      {
        title: 'Exigir y guardar la factura o recibo físico',
        instruction: 'Es obligatorio solicitar recibo, factura o firma del beneficiario.',
        warning: 'No se admiten salidas de dinero sin recibo o comprobante firmado, bajo causal de descuento al cajero.'
      },
      {
        title: 'Grapar el recibo en la carpeta del turno',
        instruction: 'Coloca el soporte físico en el sobre de arqueo del día para la entrega al departamento de Contabilidad.'
      }
    ],
    contingency: 'Si el gasto supera los $100.000 COP, no debe pagarse de la caja de mostrador; debe tramitarse por la Caja Menor Principal de Administración.'
  },
  {
    id: 'ESC-POS-49',
    title: '¿Cómo consultar el saldo neto en caja en tiempo real durante el turno?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Tarjetas en tiempo real en PosHistory mostrando: Ventas del Día, Salidas/Gastos y Neto en Caja.',
    expectedResult: 'El cajero conoce en cualquier instante cuántos billetes físicos debe tener en su cajón monedero.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['cuanto tengo en caja', 'saldo neto caja', 'ventas del dia', 'plata en gaveta', 'consultar total turno'],
    summary: 'Monitoreo constante del estado financiero del turno de mostrador para prevenir inconsistencias al cierre.',
    steps: [
      {
        title: 'Abrir "Ventas & Ingresos > Historial / Turno"',
        instruction: 'Navega a la pantalla de historial de ventas.'
      },
      {
        title: 'Examinar las tarjetas de resumen superior',
        instruction: 'Revisa las tres métricas clave:\n• Ventas del Día (Total facturado)\n• Salidas / Gastos (Descopes y egresos)\n• Neto en Caja (Efectivo que debe existir físicamente).'
      },
      {
        title: 'Desglosar por método de pago',
        instruction: 'Comprueba qué parte del total corresponde a Efectivo, qué parte a Datáfono y qué parte a Transferencias Bancarias.',
        proTip: 'Esta consulta no altera ningún dato y puede realizarse tantas veces como sea necesario a lo largo del día.'
      }
    ],
    contingency: 'Si los números no coinciden con tus cuentas mentales, revisa la lista de transacciones inferiores para verificar si alguna venta se cobró por duplicado.'
  },
  {
    id: 'ESC-POS-50',
    title: '¿Cómo realizar el Cierre Z de turno consolidando efectivo, tarjetas y transferencias?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera el Z-Report oficial de Procoquinal SAS para Contabilidad y bloquea nuevas ventas en ese turno.',
    expectedResult: 'El turno se cierra formalmente, se emite el reporte Z consolidado en hoja carta o tirilla y se notifica a Contabilidad.',
    route: '/accounting/cierres',
    routeLabel: 'Ir al Módulo de Cierres Z',
    synonyms: ['cierre z', 'cerrar caja', 'fin de turno', 'cierre de turno', 'cuadre de caja final', 'z report', 'cerrar dia'],
    summary: 'Rito de cierre definitivo al finalizar la jornada para sellar los movimientos fiscales y conciliar todas las formas de pago.',
    steps: [
      {
        title: 'Terminar la atención del último cliente',
        instruction: 'Asegúrate de que no queden órdenes pendientes en el carrito ni canastas en espera.'
      },
      {
        title: 'Imprimir el cierre del datáfono físico',
        instruction: 'En la terminal de tarjetas, presiona "Cierre de Lote / Cierre Diario" y obtén el ticket con el total procesado en el día.'
      },
      {
        title: 'Ingresar a "Contabilidad & Caja > Cierres Z (Caja)"',
        instruction: 'Haz clic en "Cierres Z" o presiona el botón "Cierre Z de Turno" en el Historial del POS.'
      },
      {
        title: 'Efectuar el arqueo por denominación',
        instruction: 'Digita las cantidades de billetes de $100k, $50k, $20k, $10k, $5k, $2k y monedas. Avalon sumará el total en efectivo automáticamente.'
      },
      {
        title: 'Digitar el total de vouchers y transferencias',
        instruction: 'Ingresa la suma de vouchers y el total verificado en cuentas bancarias.'
      },
      {
        title: 'Generar el Z-Report definitivo',
        instruction: 'Presiona "Generar Cierre Z". El sistema comparará el conteo con el registro del software y emitirá el reporte oficial de Procoquinal S.A.S.',
        warning: 'Una vez generado el Cierre Z, ese turno no podrá volver a facturar; cualquier venta posterior pertenecerá al turno del día siguiente.'
      }
    ],
    contingency: 'Si el sistema detecta descuadre, lee atentamente el escenario ESC-POS-51 (Faltante) o ESC-POS-52 (Sobrante).'
  },
  {
    id: 'ESC-POS-51',
    title: '¿Qué hacer si hay un faltante de $10.000 en el Cierre Z de caja?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite asentar el faltante con justificación obligatoria y notifica a Auditoría y Nómina.',
    expectedResult: 'El cierre se completa transparentemente dejando asentada la causal y deduciendo la diferencia según la política de la empresa.',
    route: '/accounting/cierres',
    routeLabel: 'Ir al Módulo de Cierres Z',
    synonyms: ['faltante de caja', 'falto plata', 'faltan 10000', 'descuadre negativo', 'perdida de plata', 'falta plata cierre z'],
    summary: 'Procedimiento de auditoría y justificación cuando el conteo físico de billetes arroja $10.000 menos que las ventas registradas.',
    steps: [
      {
        title: 'No entrar en pánico y revisar los lugares físicos habituales',
        instruction: 'Revisa debajo del cajón monedero (los billetes delgados de $10.000 a menudo se deslizan detrás de la gaveta metálica), en el suelo y entre las carpetas de recibos.'
      },
      {
        title: 'Revisar si hubo un cobro mal tipificado',
        instruction: 'Comprueba los vouchers de datáfono: si cobraste $10.000 con datáfono pero marcaste "Efectivo" en el POS, el efectivo tendrá un faltante de $10.000 y el datáfono un sobrante idéntico.',
        proTip: 'Si este fue el caso, reasigna el método de pago antes de cerrar (ESC-POS-38) para que la caja quede en cero perfecto.'
      },
      {
        title: 'Revisar si se pagó un gasto sin registrar',
        instruction: 'Verifica si alguien tomó $10.000 para pagar un taxi, tintos o domicilios de la tienda y olvidó pedir el registro.'
      },
      {
        title: 'Ingresar el faltante en el Cierre Z con justificación',
        instruction: 'Si tras la revisión el dinero no aparece, digita el monto real contado. Avalon marcará "Diferencia: -$10.000 (Faltante)". Escribe la observación detallada.',
        warning: 'Por política de contrato laboral, los faltantes no justificados de mostrador son asumidos por el cajero responsable del turno.'
      }
    ],
    contingency: 'Si el faltante supera los $50.000 COP, se debe solicitar revisión inmediata de las grabaciones de las cámaras de seguridad del mostrador.'
  },
  {
    id: 'ESC-POS-52',
    title: '¿Qué hacer si hay un sobrante de dinero en el Cierre Z de caja?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asienta el sobrante en cuenta contable de "Aprovechamientos / Sobrantes de Caja" sin ocultarlo.',
    expectedResult: 'El dinero sobrante se custodia legalmente y se indaga si algún cliente no recibió su devuelta completa.',
    route: '/accounting/cierres',
    routeLabel: 'Ir al Módulo de Cierres Z',
    synonyms: ['sobrante de caja', 'sobro plata', 'plata de mas', 'descuadre positivo', 'sobrante efectivo cierre'],
    summary: 'Tratamiento ético y reglamentario de dineros sobrantes en la gaveta al finalizar el turno de ventas.',
    steps: [
      {
        title: 'Verificar si se omitió ingresar una venta en el sistema',
        instruction: 'Revisa si algún cliente pagó un producto pequeño (ej: lija, cinta) y el cajero entregó el producto sin timbrar el ticket en el POS.'
      },
      {
        title: 'Verificar si se dio menos devuelta a un cliente',
        instruction: 'Comprueba si durante el día algún comprador no esperó su cambio o hubo una equivocación en el vuelto de billetes.'
      },
      {
        title: 'Registrar el sobrante en el Cierre Z',
        instruction: 'Digita el dinero real contado. Avalon reflejará "Diferencia: +$XX.XXX (Sobrante)". Anota en la observación los detalles del turno.',
        warning: 'Está estrictamente prohibido que el cajero se guarde el dinero sobrante en el bolsillo. Todo sobrante ingresa a la cuenta bancaria de la empresa.'
      },
      {
        title: 'Custodiar el excedente para posibles reclamos',
        instruction: 'Si un cliente regresa al día siguiente manifestando que le faltó devuelta, el registro del sobrante respaldará la devolución inmediata de su dinero.'
      }
    ],
    contingency: 'Si nadie reclama el dinero tras 30 días, el monto se reclasifica formalmente en la contabilidad como "Ingresos Extraordinarios por Sobrantes".'
  },
  {
    id: 'ESC-POS-53',
    title: '¿Cómo cambiar de cajero o transferir el turno al relevo de la tarde?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite cierre de subturno parcial con arqueo de entrega y bienvenida con nuevo usuario activo.',
    expectedResult: 'El primer cajero liquida su responsabilidad y el nuevo cajero inicia su sesión con su propia base auditada.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['cambio de cajero', 'relevo de turno', 'entregar caja', 'turno tarde', 'cambio de turno', 'traspaso de caja'],
    summary: 'Procedimiento de entrega y recepción de mostrador entre dos empleados para deslindar responsabilidades sobre el dinero.',
    steps: [
      {
        title: 'Efectuar el arqueo conjunto frente a frente',
        instruction: 'Ambos cajeros (el que entrega y el que recibe) cuentan el efectivo presente en la gaveta al momento del relevo.'
      },
      {
        title: 'Registrar el arqueo de relevo en Avalon V1',
        instruction: 'En Historial / Turno, presiona "Cierre de Turno / Relevo". Ingresa los valores contados y ambas partes firman la entrega.',
        proTip: 'Nunca asumas una caja sin contar físicamente los billetes que te están entregando.'
      },
      {
        title: 'Cerrar sesión del usuario saliente',
        instruction: 'Haz clic en el avatar superior derecho y selecciona "Cerrar Sesión".'
      },
      {
        title: 'Iniciar sesión con el nuevo cajero',
        instruction: 'El nuevo empleado ingresa con su propio usuario y contraseña, abriendo su sesión con la base recibida.'
      }
    ],
    contingency: 'Si se detecta una diferencia durante el relevo, debe registrarse y asumirse por el cajero saliente antes de que el nuevo cajero tome la estación.'
  },
  {
    id: 'ESC-POS-54',
    title: '¿Cómo consultar el historial de ventas del turno y exportar el resumen a Excel?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Exporta archivo .xlsx con todas las transacciones del día, clientes, productos y medios de pago.',
    expectedResult: 'Se descarga una planilla Excel formateada para análisis de ventas y auditoría interna de tienda.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['exportar ventas excel', 'descargar turno excel', 'informe ventas dia', 'planilla ventas pos', 'auditoria excel'],
    summary: 'Exportación rápida de las ventas de mostrador para que el administrador revise productos más vendidos y totales.',
    steps: [
      {
        title: 'Navegar a "Ventas & Ingresos > Historial / Turno"',
        instruction: 'Accede a la pantalla de historial de ventas.'
      },
      {
        title: 'Aplicar filtros si se requiere un periodo específico',
        instruction: 'Puedes ver solo las ventas de hoy o filtrar por cajero, medio de pago o rango de horas.'
      },
      {
        title: 'Hacer clic en "Exportar a Excel / CSV"',
        instruction: 'Presiona el botón de hoja de cálculo verde en la esquina superior derecha.',
        proTip: 'El archivo Excel incluye columnas desglosadas de Subtotal, IVA 19%, Retenciones, Descuentos y Margen Bruto.'
      }
    ],
    contingency: 'Si la descarga no inicia, verifica que el navegador no esté bloqueando las ventanas emergentes (pop-ups).'
  },
  {
    id: 'ESC-POS-55',
    title: '¿Qué hacer si el cajero olvidó hacer el Cierre Z antes de irse y ya es el día siguiente?',
    module: 'Ventas & POS',
    moduleId: 'pos',
    subtopic: 'Caja, Turnos & Cierre Z',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite Cierre Z extemporáneo fechado con el día anterior en Cierres Personalizados sin contaminar el nuevo día.',
    expectedResult: 'El día anterior queda cerrado retroactivamente con su fecha original y la caja de hoy se abre con su propia numeración limpia.',
    route: '/accounting/cierres',
    routeLabel: 'Ir al Módulo de Cierres Z',
    synonyms: ['olvido cierre z', 'cierre z dia siguiente', 'caja no se cerro ayer', 'cierre atrasado', 'cerrar ayer'],
    summary: 'Subsanación de cierres de caja omitidos al final de la jornada anterior garantizando la estricta separación de periodos contables.',
    steps: [
      {
        title: 'No empezar a facturar el día nuevo todavía',
        instruction: 'No registres ninguna venta de hoy en el POS hasta no haber cerrado formalmente el turno que quedó abierto de ayer.'
      },
      {
        title: 'Ingresar a "Contabilidad & Caja > Cierres Z"',
        instruction: 'Navega al módulo de cierres de caja en el menú contable.'
      },
      {
        title: 'Seleccionar "Cierre Extemporáneo / Turno Anterior"',
        instruction: 'Elige la fecha del día anterior que quedó abierta. El sistema mostrará las ventas exactas de esa jornada.'
      },
      {
        title: 'Digitar el arqueo del sobre sellado de anoche',
        instruction: 'Abre el sobre físico que el cajero dejó guardado en la caja fuerte con el dinero de ayer y digita los montos.'
      },
      {
        title: 'Generar el Cierre Z retroactivo',
        instruction: 'Confirma la emisión del reporte Z. Este se sellará con la fecha de ayer.',
        warning: 'Avisa al cajero que olvidar el cierre Z altera los cronogramas automáticos de la contadora y de la DIAN.'
      },
      {
        title: 'Abrir normalmente el turno de hoy',
        instruction: 'Una vez cerrado ayer, ingresa la base de efectivo de hoy y comienza la operación cotidiana.'
      }
    ],
    contingency: 'Para evitar olvidos futuros, configura en el sistema la alerta sonora obligatoria de cierre a las 6:30 PM.'
  }
];
