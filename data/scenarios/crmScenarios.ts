import { HumanScenario } from './types';

export const CRM_SCENARIOS: HumanScenario[] = [
  // =========================================================================
  // SUBTEMA 1: Alta de Clientes, RUT, Datos Fiscales & Habeas Data (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CRM-01',
    title: '¿Cómo crear un cliente persona jurídica con NIT, RUT y datos de facturación electrónica?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Valida dígito de verificación del NIT, correo para recepción de facturas DIAN y ciudad.',
    expectedResult: 'El cliente queda guardado en la base de datos central y disponible de inmediato en POS, cotizaciones y cartera.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['crear cliente empresa', 'nuevo nit', 'registrar persona juridica', 'rut cliente', 'facturacion electronica cliente', 'dar de alta empresa'],
    summary: 'Registro completo de empresas, carrocerías y constructoras con validación de requisitos fiscales de la DIAN.',
    steps: [
      {
        title: 'Acceder a Gestión de Clientes (CRM)',
        instruction: 'En el menú lateral, dirígete a "Ventas & Ingresos > Gestión de Clientes (CRM)" y presiona el botón azul "+ Nuevo Cliente / Prospecto".'
      },
      {
        title: 'Diligenciar la información tributaria del RUT',
        instruction: 'Ingresa: Razón Social oficial (ej: Carrocerías El Sol S.A.S.), Tipo de Documento (NIT), Número de NIT con su dígito de verificación y Ciudad tributaria.'
      },
      {
        title: 'Ingresar correo obligatorio de facturación electrónica',
        instruction: 'Escribe el buzón de recepción de facturas de la empresa compradora (ej: facturacion@carroceriaselsol.com).',
        warning: 'Sin un correo electrónico válido, el web service de la DIAN rechazará la emisión de facturas electrónicas para este cliente.'
      },
      {
        title: 'Asignar clasificación comercial y vendedor',
        instruction: 'Selecciona el asesor comercial responsable de la cuenta y el Tier comercial inicial (Regular o Estratégico).'
      }
    ],
    contingency: 'Si el cliente no tiene RUT a la mano, puedes crearlo temporalmente como prospecto completando los datos antes de la primera venta a crédito.'
  },
  {
    id: 'ESC-CRM-02',
    title: '¿Cómo registrar un cliente persona natural o tallerista sin cámara de comercio?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite registro ágil con Cédula de Ciudadanía, WhatsApp de contacto y clasificación No Responsable de IVA.',
    expectedResult: 'El tallerista queda vinculado con su historial de compras sin exigir documentos mercantiles complejos.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['cliente persona natural', 'tallerista cedula', 'maestro pintor registrar', 'cliente sin camara comercio', 'crear pintor'],
    summary: 'Alta simplificada de pintores independientes, ebanistas y talleres locales que compran con cédula personal.',
    steps: [
      {
        title: 'Seleccionar Tipo de Documento: "Cédula de Ciudadanía"',
        instruction: 'En el modal de creación de cliente, elige CC o Cédula de Extranjería.'
      },
      {
        title: 'Digitar nombre completo y nombre del taller',
        instruction: 'Ingresa Nombre del contacto (ej: Pedro Nel Gómez) y en Empresa anota el alias del taller (ej: Taller Los Amigos).'
      },
      {
        title: 'Registrar número de WhatsApp de contacto',
        instruction: 'Ingresa el número celular; Avalon lo vinculará para envío directo de cotizaciones y avisos de despacho por WhatsApp Web.'
      },
      {
        title: 'Guardar con condición de contado',
        instruction: 'Deja las condiciones comerciales en "Contado / Sin Crédito" y presiona "Guardar Cliente".',
        proTip: 'Registrar sus compras con cédula en vez de Consumidor Final permite premiarlo con promociones de fidelización por volumen.'
      }
    ],
    contingency: 'Si el pintor formaliza su negocio más adelante y saca RUT, edita su ficha y actualiza el tipo de documento a NIT sin perder su historial.'
  },
  {
    id: 'ESC-CRM-03',
    title: '¿Qué hacer si el sistema alerta "Ya existe un cliente con el documento/NIT"?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Validador estricto anti-duplicados que impide crear dos cuentas con el mismo NIT para no fragmentar cartera.',
    expectedResult: 'El sistema muestra el enlace a la ficha existente para actualizarla o vincular una nueva sucursal.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['nit duplicado', 'cliente ya existe', 'documento repetido', 'error crear cliente', 'duplicado crm'],
    summary: 'Protección de integridad de datos que previene la creación accidental de registros dobles para la misma empresa.',
    steps: [
      {
        title: 'Observar la advertencia en pantalla',
        instruction: 'Al ingresar el documento, Avalon mostrará: "Ya existe un cliente con el documento/NIT 900.123.456-7 (Inversiones Industriales SAS)".'
      },
      {
        title: 'Hacer clic en "Ver Ficha del Cliente Existente"',
        instruction: 'Presiona el botón para abrir el perfil ya creado en el sistema.'
      },
      {
        title: 'Verificar si se trata de un nuevo contacto de la misma empresa',
        instruction: 'Si es una persona diferente (ej: nuevo jefe de compras), no crees un nuevo cliente; ve a la sección "Contactos Adicionales" y agrégalo allí.',
        proTip: 'Esto asegura que todas las facturas y pagos sumen a la misma cuenta unificada de cartera.'
      }
    ],
    contingency: 'Si se trata de dos empresas distintas que comparten consorcio, asigna el código de consorcio o sufijo de sucursal en el campo correspondiente.'
  },
  {
    id: 'ESC-CRM-04',
    title: '¿Cómo capturar y registrar el consentimiento de Habeas Data (Ley 1581) del cliente?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Casilla obligatoria `dataConsent` que almacena fecha, hora y origen de autorización de tratamiento de datos.',
    expectedResult: 'El cliente queda habilitado para recibir notificaciones comerciales cumpliendo con la Superintendencia de Industria y Comercio.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['habeas data', 'politica de datos', 'consentimiento ley 1581', 'autorizacion datos', 'sic proteccion datos'],
    summary: 'Cumplimiento legal colombiano sobre recolección y tratamiento de datos personales y comerciales en el CRM.',
    steps: [
      {
        title: 'Marcar la casilla de consentimiento en el formulario',
        instruction: 'En el modal de creación de cliente, activa el conmutador: "El cliente autoriza el tratamiento de datos personales conforme a la política de Procoquinal SAS (Ley 1581/2012)".'
      },
      {
        title: 'Indicar el canal de recolección',
        instruction: 'Selecciona cómo se obtuvo el aval: Firma física en mostrador, Confirmación por correo electrónico o Aceptación digital vía web.'
      },
      {
        title: 'Guardar la constancia digital',
        instruction: 'Avalon grabará en la ficha el sello de tiempo (Timestamp) y el usuario que registró la autorización.',
        warning: 'Enviar campañas masivas de promociones a clientes sin consentimiento de Habeas Data acarrea sanciones graves de la SIC.'
      }
    ],
    contingency: 'Si un cliente solicita la revocatoria de sus datos, desmarca la casilla en su perfil para excluirlo de envíos publicitarios.'
  },
  {
    id: 'ESC-CRM-05',
    title: '¿Cómo configurar múltiples direcciones de entrega para obras y sedes de un mismo cliente?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Pestaña "Sedes & Obras" en el perfil del cliente permite guardar N direcciones de despacho con contacto en sitio.',
    expectedResult: 'Al cotizar o despachar, el asesor puede elegir la dirección de destino exacta sin cambiar la razón social de facturación.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['multiples direcciones', 'direccion de obra', 'sede cliente', 'sucursal entrega', 'despacho a obra'],
    summary: 'Administración de puntos de entrega para constructoras o carroceras que tienen plantas o proyectos en diferentes ciudades.',
    steps: [
      {
        title: 'Abrir el perfil del cliente en el CRM',
        instruction: 'Localiza la empresa en la tabla de contactos y abre su expediente completo.'
      },
      {
        title: 'Ir a la pestaña "Direcciones de Despacho & Sedes"',
        instruction: 'Haz clic en "+ Agregar Dirección de Entrega".'
      },
      {
        title: 'Ingresar los detalles del punto de obra',
        instruction: 'Digita: Nombre de la obra (ej: Obra Puerta del Sol - Torre 2), Dirección completa, Ciudad/Municipio, Nombre del maestro residente y teléfono celular de recepción.'
      },
      {
        title: 'Guardar la dirección adicional',
        instruction: 'Presiona "Guardar Dirección". Al generar un despacho en el módulo de Logística, el transportador verá la dirección seleccionada con su contacto en obra.',
        proTip: 'Esto evita que el camión de despacho llegue a la oficina administrativa del cliente en lugar de la bodega donde se aplica la pintura.'
      }
    ],
    contingency: 'Si una obra ya finalizó, márcala como "Finalizada / Inactiva" para que los despachadores no la elijan por error.'
  },
  {
    id: 'ESC-CRM-06',
    title: '¿Cómo asignar el Tier comercial (Regular 5%, Estratégico 15%, Distribuidor) a un cliente?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Enum `CustomerTier` en CrmContact vincula automáticamente listas de precios y descuentos en el POS.',
    expectedResult: 'Todas las cotizaciones y ventas aplicarán la tarifa mayorista asignada sin requerir digitación manual de descuentos.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['tier cliente', 'clasificacion comercial', 'cliente estrategico 15', 'cliente regular 5', 'tarifa distribuidor', 'nivel cliente'],
    summary: 'Segmentación de clientes por volumen de compra para premiar su fidelidad con listas de precios preferenciales automáticas.',
    steps: [
      {
        title: 'Evaluar el volumen mensual de compra del cliente',
        instruction: 'Criterios de clasificación:\n• REGULAR: Compras menores a $5.000.000 COP/mes (Descuento lista: 5%).\n• ESTRATÉGICO: Compras entre $5M y $20M COP/mes (Descuento lista: 15%).\n• DISTRIBUIDOR / VIP: Compras superiores a $20M COP/mes (Tarifa especial mayorista neta).'
      },
      {
        title: 'Modificar el campo "Tier Comercial" en la ficha del cliente',
        instruction: 'En el perfil del cliente, cambia el selector a "STRATEGIC" o "REGULAR".'
      },
      {
        title: 'Confirmar la actualización de tarifas',
        instruction: 'Presiona "Guardar Cambios". A partir de ese segundo, cada vez que el cajero cargue ese cliente en el POS, los precios se rebajarán en el porcentaje pactado.',
        proTip: 'El cambio de nivel queda registrado en la bitácora indicando qué supervisor autorizó el ascenso de categoría.'
      }
    ],
    contingency: 'Si un cliente estratégico reduce drásticamente sus compras durante 3 meses, Gerencia Comercial puede reclasificarlo a nivel Regular.'
  },
  {
    id: 'ESC-CRM-07',
    title: '¿Cómo reasignar un cliente a un nuevo asesor comercial tras la salida de un vendedor?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Herramienta de reasignación individual o masiva que traslada historial, tratos y comisiones futuras.',
    expectedResult: 'El nuevo vendedor recibe la cuenta en su panel móvil y el cliente no queda desatendido ni un solo día.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['reasignar cliente', 'cambiar de vendedor', 'traspaso de cartera', 'vendedor renuncio', 'asignar asesor cuenta'],
    summary: 'Transferencia ordenada de cuentas comerciales entre miembros del equipo de ventas garantizando la continuidad del servicio.',
    steps: [
      {
        title: 'Filtrar los clientes del vendedor saliente',
        instruction: 'En la tabla de CRM, filtra por "Asesor Asignado: [Nombre Vendedor Saliente]".'
      },
      {
        title: 'Seleccionar las cuentas a transferir',
        instruction: 'Marca las casillas de los clientes que asumirá el nuevo asesor comercial.'
      },
      {
        title: 'Hacer clic en "Reasignar Propietario de Cuenta (Owner)"',
        instruction: 'Elige el nuevo asesor en el menú desplegable y anota el motivo del traspaso.'
      },
      {
        title: 'Confirmar la transferencia de la cartera',
        instruction: 'Presiona "Reasignar Cuentas". Todos los tratos activos en el Pipeline y cotizaciones pendientes pasarán al nuevo vendedor.',
        warning: 'Las comisiones de facturas ya cobradas en el mes anterior pertenecen al vendedor que cerró la venta original.'
      }
    ],
    contingency: 'Envía un mensaje de presentación formal por WhatsApp o correo al cliente informándole el nombre y teléfono de su nuevo asesor de cuenta.'
  },
  {
    id: 'ESC-CRM-08',
    title: '¿Cómo actualizar datos tributarios cuando un cliente pasa a ser Gran Contribuyente?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Actualiza `fiscalClassification === "GRAN_CONTRIBUYENTE"` activando cálculo automático de retenciones en caja.',
    expectedResult: 'El sistema liquida ReteFuente (2.5%) y ReteIVA en cada venta que se le facture a esa empresa.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['gran contribuyente cliente', 'resolucion dian cliente', 'cambio clasificacion fiscal', 'retefuente automatica cliente', 'actualizar rut'],
    summary: 'Ajuste de responsabilidades tributarias para que las facturas liquiden exactamente los impuestos y retenciones que la DIAN exige.',
    steps: [
      {
        title: 'Solicitar copia del nuevo RUT actualizado con la resolución DIAN',
        instruction: 'Verifica la fecha de expedición de la resolución que designa a la empresa como Gran Contribuyente.'
      },
      {
        title: 'Abrir los datos fiscales del cliente en Avalon V1',
        instruction: 'Ve al perfil del cliente y presiona "Editar Configuración Fiscal".'
      },
      {
        title: 'Cambiar clasificación fiscal a "GRAN_CONTRIBUYENTE"',
        instruction: 'Selecciona la nueva opción e ingresa el número de resolución oficial.'
      },
      {
        title: 'Comprobar el impacto en la facturación',
        instruction: 'A partir de este cambio, en el POS y cotizaciones se calcularán automáticamente las retenciones tributarias correspondientes.',
        proTip: 'Esto evita que el cliente rechace las facturas por no incluir las retenciones que por ley está obligado a practicar.'
      }
    ],
    contingency: 'Si la empresa también es Autorretenedora, marca la casilla correspondiente para que no se le descuente ReteFuente en sus compras.'
  },
  {
    id: 'ESC-CRM-09',
    title: '¿Qué hacer si el cliente solicita factura electrónica a un correo diferente al de cobranzas?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite separar campo "Correo DIAN / Factura Electrónica" del "Correo de Cobranzas / Cartera" y "Correo Comercial".',
    expectedResult: 'Las facturas electrónicas llegan al buzón tributario y los estados de cuenta llegan al tesorero sin cruces erróneos.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['correo diferente facturacion', 'correo cobranzas', 'buzon tributario cliente', 'donde enviar factura', 'cambiar correo cliente'],
    summary: 'Diferenciación de canales de comunicación digital en empresas con departamentos independientes de compras, pagos e impuestos.',
    steps: [
      {
        title: 'Acceder a la sección de Contacto del cliente en el CRM',
        instruction: 'Abre la edición de la ficha del cliente.'
      },
      {
        title: 'Configurar los tres correos diferenciados:',
        instruction: '1. Correo DIAN Facturación: buzondian@empresa.com (exclusivo para archivos XML y PDF de la DIAN).\n2. Correo de Pagos / Tesorería: tesoreria@empresa.com (para estados de cuenta y recibos de caja).\n3. Correo del Jefe de Taller: compras@empresa.com (para cotizaciones y fichas técnicas).'
      },
      {
        title: 'Guardar y verificar el despacho',
        instruction: 'Al facturar en el POS, Avalon enviará los comprobantes a cada buzón según el tipo de documento generado.',
        proTip: 'Esta separación elimina el 90% de las quejas de clientes que dicen "no me llegó la factura a contabilidad".'
      }
    ],
    contingency: 'En caso de que el cliente cambie de software de recepción electrónica, actualiza el correo DIAN antes del siguiente corte de facturación.'
  },
  {
    id: 'ESC-CRM-10',
    title: '¿Cómo inactivar o archivar un cliente inactivo sin borrar su historial contable?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Cambia estado a "INACTIVO / ARCHIVADO"; lo oculta de la vista comercial pero preserva su histórico inmutable.',
    expectedResult: 'La lista de contactos se mantiene depurada sin perder los registros exigidos por la DIAN durante 10 años.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['inactivar cliente', 'archivar cliente', 'cliente cerro negocio', 'borrar cliente crm', 'ocultar cliente'],
    summary: 'Depuración de la base de datos comercial de empresas que cerraron sus operaciones o no compran hace más de dos años.',
    steps: [
      {
        title: 'Verificar que el cliente tenga saldo $0 en Cartera',
        instruction: 'Asegúrate de que no tenga facturas pendientes ni cheques en custodia antes de archivarlo.'
      },
      {
        title: 'Cambiar el estado del cliente a "INACTIVO"',
        instruction: 'En las opciones de la ficha de contacto, conmuta el estado de "Vinculado" a "Archivado / Inactivo".'
      },
      {
        title: 'Anotar el motivo del archivo',
        instruction: 'Indica la causal (ej: "Taller cerrado por liquidación voluntaria", "Cambio de actividad económica").'
      },
      {
        title: 'Comprobar la depuración en el POS y Pipeline',
        instruction: 'El cliente no aparecerá en las sugerencias del buscador de mostrador, agilizando la atención diaria.',
        warning: 'NUNCA borres la cuenta de un cliente de la base de datos; la ley exige conservar el registro de facturas emitidas por 10 años.'
      }
    ],
    contingency: 'Si el cliente reabre su taller meses después, puedes reactivarlo con un solo clic conservando todos sus datos históricos.'
  },
  {
    id: 'ESC-CRM-11',
    title: '¿Cómo fusionar dos fichas de clientes duplicadas en el CRM manteniendo todas sus facturas?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Alta de Clientes & Datos Fiscales',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asistente de fusión de contactos que consolida tratos, cotizaciones y facturas bajo el NIT principal.',
    expectedResult: 'Se elimina el registro duplicado y toda la historia comercial queda unificada en una sola cuenta limpia.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['fusionar clientes', 'unificar contactos', 'cliente duplicado crm', 'dos fichas mismo cliente', 'limpiar base de datos clientes'],
    summary: 'Subsanación de duplicidades cuando dos vendedores registraron la misma empresa con pequeñas variaciones de ortografía.',
    steps: [
      {
        title: 'Identificar la ficha Principal y la ficha Secundaria',
        instruction: 'Elige la ficha que tenga los datos fiscales más completos como "Registro Maestro".'
      },
      {
        title: 'Seleccionar ambas cuentas en la tabla de clientes',
        instruction: 'Marca las casillas de las dos empresas y haz clic en "Acciones > Fusionar Contactos Seleccionados".'
      },
      {
        title: 'Confirmar la migración de documentos',
        instruction: 'Avalon trasladará todas las cotizaciones, pedidos POS, notas de visita y saldo de cartera de la cuenta secundaria hacia la maestra.'
      },
      {
        title: 'Archivar el registro duplicado',
        instruction: 'La cuenta duplicada quedará marcada como fusionada y redirigirá automáticamente a la ficha principal.',
        proTip: 'Esta unificación evita que un cliente tenga cupo de crédito dividido en dos cuentas paralelas.'
      }
    ],
    contingency: 'Esta operación es definitiva; verifica cuidadosamente que ambos registros correspondan efectivamente a la misma persona o empresa.'
  },

  // =========================================================================
  // SUBTEMA 2: Cupos de Crédito, Plazos & Evaluación de Riesgo (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CRM-12',
    title: '¿Cómo realizar el estudio y otorgamiento de cupo de crédito para un taller automotriz?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Formulario de solicitud de crédito con adjunto de RUT, estados financieros y verificación de referencias.',
    expectedResult: 'Se aprueba el límite de crédito formal (ej: $15.000.000 COP a 30 días) quedando activo para compras en POS y planta.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['estudio de credito', 'solicitud cupo', 'dar credito cliente', 'aprobar plazo 30 dias', 'evaluacion financiera cliente'],
    summary: 'Trámite formal de análisis de solvencia para autorizar despachos a crédito sin comprometer la liquidez de Procoquinal.',
    steps: [
      {
        title: 'Recopilar los requisitos documentales',
        instruction: 'Exige al taller: RUT actualizado, Cámara de Comercio (máximo 30 días), Estados Financieros del último año y dos referencias comerciales del sector de pinturas.'
      },
      {
        title: 'Verificar referencias comerciales y centrales de riesgo',
        instruction: 'Llama a los proveedores de referencia para constatar cumplimiento de pagos y consulta el reporte crediticio.'
      },
      {
        title: 'Ingresar al módulo de Crédito del cliente en Avalon V1',
        instruction: 'En la ficha del cliente, ve a la sección "Políticas de Crédito & Plazos".'
      },
      {
        title: 'Configurar Cupo Aprobado y Días de Plazo',
        instruction: 'Digita el cupo autorizado (ej: $15.000.000 COP), selecciona el plazo pactado (ej: 30 días) y sube los documentos en PDF.',
        proTip: 'Para clientes nuevos, se recomienda iniciar con un cupo conservador durante los primeros 3 meses de prueba.'
      }
    ],
    contingency: 'Si el cliente no cumple con la capacidad financiera para el cupo solicitado, se le puede aprobar un cupo menor condicionado o compras contra entrega.'
  },
  {
    id: 'ESC-CRM-13',
    title: '¿Cómo exigir y adjuntar el Pagaré en Blanco con Carta de Instrucciones notariado?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Campo obligatorio "Garantía Legal / Pagaré" que bloquea la activación del crédito hasta adjuntar el soporte legal.',
    expectedResult: 'El crédito queda respaldado con título valor ejecutivo legal ante cualquier eventualidad de cobro jurídico.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['pagare notariado', 'carta de instrucciones', 'garantia de credito', 'titulo valor cliente', 'respaldo juridico credito'],
    summary: 'Garantía legal indispensable para ventas B2B que permite demandar ejecutivamente en caso de impago prolongado.',
    steps: [
      {
        title: 'Descargar el formato oficial de Pagaré de Procoquinal SAS',
        instruction: 'En el CRM, presiona "Descargar Formato Pagaré & Carta de Instrucciones".'
      },
      {
        title: 'Hacer firmar y autenticar con reconocimiento biométrico',
        instruction: 'El representante legal del cliente debe firmar el documento ante notaría pública con huella dactilar.'
      },
      {
        title: 'Custodiar el original en la caja fuerte de Gerencia',
        instruction: 'El documento físico original se entrega al área Jurídica para archivo bajo llave en bóveda.'
      },
      {
        title: 'Cargar la copia escaneada en Avalon V1 y activar crédito',
        instruction: 'Sube el archivo PDF notariado en la ficha del cliente y marca la casilla "Pagaré en Custodia Aprobado". El botón de facturación a crédito se habilitará.',
        warning: 'NUNCA despaches mercancía a crédito sin que el pagaré físico repose en las oficinas de Procoquinal.'
      }
    ],
    contingency: 'Si el cliente está en otra ciudad, debe enviar el pagaré original por correo certificado antes del primer despacho de pintura.'
  },
  {
    id: 'ESC-CRM-14',
    title: '¿Cómo autorizar un Aumento Temporal de Cupo por temporada alta o contrato de obra?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite ampliación transitoria con fecha de expiración automática y justificación comercial.',
    expectedResult: 'El cupo se expande temporalmente (ej: de $15M a $30M COP) durante 45 días sin alterar el cupo básico permanente.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['aumento temporal cupo', 'ampliar credito', 'cupo temporada alta', 'autorizar mas credito obra', 'excepcion cupo'],
    summary: 'Flexibilidad financiera para apoyar a clientes que ganaron licitaciones grandes de pintura sin descontrolar el riesgo anual.',
    steps: [
      {
        title: 'Verificar el historial impecable de pagos del cliente',
        instruction: 'Comprueba que en los últimos 6 meses el cliente haya pagado puntualmente sus facturas sin moras mayores a 5 días.'
      },
      {
        title: 'Solicitar copia del contrato de obra o licitación',
        instruction: 'El cliente debe aportar la orden de servicio que demuestre la necesidad extraordinaria de pintura (ej: repintado de flota de buses).'
      },
      {
        title: 'Ingresar a "Ampliación Temporal de Cupo" en Avalon V1',
        instruction: 'Digita el nuevo tope transitorio (ej: $30.000.000 COP) y la fecha de vigencia del incremento (ej: válido hasta el 30 de noviembre).'
      },
      {
        title: 'Aprobación de Gerencia Financiera',
        instruction: 'El Director Financiero digita su PIN de confirmación. Al expirar la fecha, el cupo regresará automáticamente a su valor ordinario de $15M.',
        proTip: 'Esta automatización evita que un aumento temporal concedido para una obra específica quede abierto indefinidamente por descuido.'
      }
    ],
    contingency: 'Si el cliente se atrasa durante la vigencia del aumento temporal, el cupo extraordinario se revoca de inmediato.'
  },
  {
    id: 'ESC-CRM-15',
    title: '¿Qué hacer cuando el sistema bloquea a un cliente por facturas vencidas con más de 15 días?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bloqueo de seguridad automático que congela pedidos en POS y Despachos ante mora superior a 15 días.',
    expectedResult: 'El asesor explica cortésmente la situación y coordina un abono inmediato para reactivar los despachos.',
    route: '/sales-performance',
    routeLabel: 'Consultar Cartera Vencida',
    synonyms: ['bloqueo por mora', '15 dias de mora', 'no puedo despachar mora', 'cliente bloqueado credito', 'mora vencida'],
    summary: 'Procedimiento operativo de cobranza cuando un cliente habitual entra en mora impidiendo la salida de nueva mercancía.',
    steps: [
      {
        title: 'Identificar el motivo exacto del bloqueo en la pantalla',
        instruction: 'Avalon mostrará: "DESPACHO BLOQUEADO: Factura F-3890 con 18 días de mora por valor de $4.200.000 COP".'
      },
      {
        title: 'Comunicarse de inmediato con el jefe de compras del cliente',
        instruction: 'Informa cortésmente: "Estimado Don Carlos, el sistema de planta tiene en espera su pedido debido a que tenemos la factura F-3890 con vencimiento superado".'
      },
      {
        title: 'Coordinar la transferencia o consignación del abono',
        instruction: 'Pide al cliente que realice el pago de la factura vencida y comparta el comprobante bancario.'
      },
      {
        title: 'Registrar el Recibo de Caja para desbloqueo automático',
        instruction: 'Al asentar el pago en Contabilidad > Recibos de Caja (ESC-CON-22), el sistema liberará el bloqueo en menos de 10 segundos.',
        warning: 'Está estrictamente prohibido despachar producto con promesa verbal de pago si la mora supera los 15 días.'
      }
    ],
    contingency: 'Si el cliente tiene una emergencia en taller pero no puede pagar hoy, un Gerente puede autorizar un "Desbloqueo de Emergencia por 24 horas" con firma de compromiso.'
  },
  {
    id: 'ESC-CRM-16',
    title: '¿Cómo gestionar un Desbloqueo Excepcional de Cartera autorizado por Gerencia?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal de override de crédito que exige credenciales de Gerente y deja justificación en la Bitácora de Auditoría.',
    expectedResult: 'Se libera la orden de despacho específica para ese cliente sin levantar el bloqueo general de la cuenta.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['desbloqueo excepcional', 'autorizacion gerencia credito', 'override cartera', 'desbloquear despacho manual', 'permiso especial credito'],
    summary: 'Mecanismo de excepción administrativa para no perder negocios estratégicos con clientes institucionales solventes.',
    steps: [
      {
        title: 'Presentar el caso al Gerente Financiero o General',
        instruction: 'El asesor comercial expone la justificación (ej: cliente es la Alcaldía Mayor o un concesionario aliado con pago programado para el viernes).'
      },
      {
        title: 'Abrir el modal de "Desbloqueo Excepcional de Orden"',
        instruction: 'En la pantalla del pedido bloqueado en el POS o CRM, presiona el botón "Solicitar Aprobación Superior".'
      },
      {
        title: 'Ingresar credenciales y justificación del Gerente',
        instruction: 'El Gerente digita su usuario, contraseña y escribe la razón: "Autorizado por Gerencia General según radicado de pago confirmado para el día 15".'
      },
      {
        title: 'Generar la factura y remisión de despacho',
        instruction: 'La orden se procesará de inmediato para entrega en camión.',
        proTip: 'Esta autorización aplica exclusivamente para ese pedido específico; futuras compras seguirán bloqueadas hasta el pago efectivo de la mora.'
      }
    ],
    contingency: 'Si el pago prometido no ingresa en la fecha pactada, el sistema suspende permanentemente la opción de desbloqueo excepcional para ese cliente.'
  },
  {
    id: 'ESC-CRM-17',
    title: '¿Cómo reducir o revocar el cupo de crédito a un cliente por deterioro de comportamiento de pago?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modificación del cupo a $0 o valor reducido con notificación formal al cliente de cambio a modalidad de contado.',
    expectedResult: 'El cliente ya no puede comprar a crédito, mitigando el riesgo de pérdidas por incobrabilidad.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['reducir cupo', 'quitar credito', 'revocar credito', 'pasar a contado', 'cancelar credito cliente'],
    summary: 'Medida preventiva de control de riesgo ante clientes que presentan cheques devueltos o moras recurrentes de más de 45 días.',
    steps: [
      {
        title: 'Revisar el informe de comportamiento de pagos',
        instruction: 'En "Rendimiento Comercial", audita los días promedio de pago del cliente (ej: plazo pactado 30 días, pago real promedio 72 días).'
      },
      {
        title: 'Emitir concepto del Comité de Crédito',
        instruction: 'El comité dictamina pasar al cliente a compras estrictas de contado para proteger el capital de trabajo.'
      },
      {
        title: 'Modificar el Cupo de Crédito a $0 en Avalon V1',
        instruction: 'En el perfil del cliente, cambia "Cupo Autorizado" a $0 y cambia condición a "Contado / Anticipado".'
      },
      {
        title: 'Notificar formalmente a la empresa cliente',
        instruction: 'Envía comunicación formal en PDF explicando que sus nuevas compras se atenderán bajo condición de contado comercial.',
        warning: 'Exige el pago del saldo pendiente remanente antes de entregar cualquier nuevo pedido, incluso si es de contado.'
      }
    ],
    contingency: 'Si el cliente normaliza su situación y demuestra solvencia demostrada durante 6 meses, se puede reevaluar un cupo menor en el futuro.'
  },
  {
    id: 'ESC-CRM-18',
    title: '¿Cómo atender a clientes con modalidad de Pago Contra Entrega (COD)?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Condición "Contra Entrega / COD" que despacha mercancía con remisión y exige confirmación de cobro antes de descargar.',
    expectedResult: 'El conductor o transportador cobra en efectivo o QR al descargar la pintura en la bodega del cliente.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['pago contra entrega', 'cod', 'cash on delivery', 'cobro en destino', 'pagar al recibir camion'],
    summary: 'Esquema comercial para clientes sin cupo de crédito que pagan en el instante en que el camión de Procoquinal llega a su taller.',
    steps: [
      {
        title: 'Configurar condición comercial: "Contra Entrega (COD)"',
        instruction: 'En la ficha del cliente, selecciona condición de pago: "Contra Entrega / Efectivo o Transferencia al Descargar".'
      },
      {
        title: 'Generar la orden de despacho con planilla de recaudo',
        instruction: 'En el módulo de Despachos, se emitirá la remisión con un distintivo destacado: "COBRO OBLIGATORIO CONTRA ENTREGA: $X.XXX.XXX COP".'
      },
      {
        title: 'Instrucciones obligatorias para el conductor',
        instruction: 'El chofer no debe romper el precinto del camión ni bajar los cuñetes hasta que el cliente entregue el efectivo o muestre la transferencia confirmada en la cuenta de la empresa.'
      },
      {
        title: 'Confirmar el recaudo y cerrar la entrega',
        instruction: 'El conductor confirma el pago en la app móvil de despachos y entrega la mercancía al cliente.',
        warning: 'Si el cliente no tiene el dinero listo, el conductor tiene orden estricta de no descargar y regresar el producto a planta.'
      }
    ],
    contingency: 'Si el cliente transfiere por QR al momento de la llegada del camión, el chofer confirma telefónicamente con Tesorería antes de bajar la carga.'
  },
  {
    id: 'ESC-CRM-19',
    title: '¿Cómo configurar un Cupo Compartido para un grupo empresarial con múltiples NITs o sucursales?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite vincular cuentas bajo un "Holding / Empresa Matriz" compartiendo un límite de crédito global consolidado.',
    expectedResult: 'Cualquiera de las empresas filiales puede comprar a crédito, descontando del cupo matriz sin exceder el techo corporativo.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['cupo compartido', 'grupo empresarial credito', 'holding credito', 'empresas asociadas cupo', 'matriz y filiales'],
    summary: 'Administración de crédito para conglomerados de talleres o concesionarios que operan con diferentes razones sociales.',
    steps: [
      {
        title: 'Crear la Empresa Matriz / Holding en el CRM',
        instruction: 'Registra la empresa principal del grupo (ej: Grupo Carrocero Andino S.A.S.) y asígnale el cupo global (ej: $50.000.000 COP).'
      },
      {
        title: 'Vincular las empresas filiales',
        instruction: 'En las fichas de las sucursales (Taller Norte, Taller Sur, Taller Occidente), activa la casilla "Subordinada a Grupo Empresarial" y selecciona la matriz.'
      },
      {
        title: 'Activar la opción "Consumir de Cupo Matriz"',
        instruction: 'Las compras de cualquiera de los NITs se validarán contra el saldo disponible del cupo consolidado de $50M.'
      },
      {
        title: 'Facturación nominativa individual',
        instruction: 'Cada factura saldrá a nombre del NIT respectivo de la filial que recibió el producto, pero el riesgo crediticio se audita en conjunto.',
        proTip: 'Esto evita otorgar cupos independientes a empresas del mismo dueño que sumados triplicarían el riesgo financiero tolerable.'
      }
    ],
    contingency: 'Si una de las filiales entra en mora, el bloqueo preventivo se extiende a todas las empresas del grupo hasta normalizar la cartera.'
  },
  {
    id: 'ESC-CRM-20',
    title: '¿Cómo generar el Paz y Salvo de cartera oficial para un cliente que canceló su deuda?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Emite certificado en PDF con firma digital verificando automáticamente que el saldo sea $0 en todas las cuentas.',
    expectedResult: 'El cliente recibe el certificado formal de no adeudo con Procoquinal SAS para sus trámites comerciales y bancarios.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['paz y salvo', 'certificado de saldo en cero', 'constancia de no adeudo', 'paz y salvo cartera', 'certificado cliente al dia'],
    summary: 'Expedición de constancias de solvencia solicitadas por clientes corporativos para licitaciones o créditos financieros.',
    steps: [
      {
        title: 'Comprobar que no existan facturas pendientes ni cheques en canje',
        instruction: 'En la ficha del cliente, revisa que la pestaña de Cartera indique: "Saldo Total Pendiente: $0 COP".'
      },
      {
        title: 'Hacer clic en "Generar Paz y Salvo Oficial"',
        instruction: 'En las herramientas del cliente, presiona el botón de certificado de paz y salvo.'
      },
      {
        title: 'Verificar los datos del documento',
        instruction: 'El PDF incluirá: Razón social, NIT, fecha y hora de emisión, y la leyenda: "PROCOQUINAL S.A.S. certifica que a la fecha la empresa no registra saldos pendientes por concepto de suministro de pinturas y recubrimientos".'
      },
      {
        title: 'Descargar y enviar por correo electrónico',
        instruction: 'El documento se despachará firmado digitalmente por la Jefatura de Cartera y Cobranzas.',
        warning: 'El sistema bloqueará la emisión del paz y salvo si existe al menos una factura con saldo pendiente superior a $1 peso.'
      }
    ],
    contingency: 'Si el cliente pagó hoy pero la transferencia está en canje interbancario, espera a que los fondos se acrediten antes de expedir el paz y salvo.'
  },
  {
    id: 'ESC-CRM-21',
    title: '¿Qué hacer si un cliente solicita prórroga de fecha de vencimiento de una factura a crédito?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cupos de Crédito & Riesgo',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite aplazamiento de fecha de vencimiento hasta por 15 días con justificación comercial aprobada.',
    expectedResult: 'La fecha límite de pago se actualiza evitando que el sistema active el bloqueo automático de despachos por mora.',
    route: '/sales-performance',
    routeLabel: 'Consultar Cartera',
    synonyms: ['prorroga factura', 'aplazar vencimiento', 'cambiar fecha pago', 'dar mas dias plazo', 'extension de credito'],
    summary: 'Trámite de prórroga comercial cuando un buen cliente notifica con antelación que su ciclo de cobro se retrasó unos días.',
    steps: [
      {
        title: 'Exigir solicitud formal por escrito antes del vencimiento',
        instruction: 'El cliente debe remitir carta o correo electrónico explicando la causa de la demora antes de que la factura venza.'
      },
      {
        title: 'Localizar la factura en el panel de Cartera',
        instruction: 'Ve a Rendimiento Comercial > Cartera y busca la factura respectiva.'
      },
      {
        title: 'Presionar "Solicitar Prórroga de Vencimiento"',
        instruction: 'Ingresa la nueva fecha acordada (ej: aplazamiento de 10 días calendario) y adjunta la comunicación del cliente.'
      },
      {
        title: 'Aprobación del Director Comercial',
        instruction: 'Al autorizar, la fecha de expiración se postergará y el semáforo de crédito se mantendrá en verde.',
        proTip: 'Conceder prórrogas controladas fortalece la relación de confianza con clientes que enfrentan iliquidez transitoria.'
      }
    ],
    contingency: 'No se admiten más de dos prórrogas sobre una misma factura comercial; si no paga en la nueva fecha, pasa a cobro prejurídico.'
  },

  // =========================================================================
  // SUBTEMA 3: Cotizaciones, Proformas & Generación de PDF (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CRM-22',
    title: '¿Cómo crear una cotización formal desde el CRM y enviarla en PDF por correo?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal QuoteEmailModal genera documento PDF con membrete oficial, fotos de producto, términos de vigencia y lo despacha por email.',
    expectedResult: 'El cliente recibe la proforma formal en su bandeja de entrada y la oportunidad se registra en el Pipeline de ventas.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['crear cotizacion', 'enviar propuesta pdf', 'cotizar pintura cliente', 'presupuesto oficial', 'mandar cotizacion correo'],
    summary: 'Emisión rápida de cotizaciones profesionales con cálculo automático de impuestos, fletes y descuentos comerciales.',
    steps: [
      {
        title: 'Iniciar nueva cotización en el CRM',
        instruction: 'En el perfil del cliente o desde el Pipeline comercial, presiona el botón "+ Nueva Cotización / Trato".'
      },
      {
        title: 'Agregar productos del catálogo',
        instruction: 'Selecciona las referencias solicitadas (ej: 10 Galones de Vetro Premium + 5 Cuartos de Catalizador CAT-7074) y verifica las cantidades.'
      },
      {
        title: 'Verificar vigencia de precios y fletes',
        instruction: 'Define la vigencia de la oferta (estándar: 15 días calendario) e ingresa el costo de transporte si aplica entrega en obra.'
      },
      {
        title: 'Presionar "Generar PDF & Enviar por Correo"',
        instruction: 'Se abrirá el modal de QuoteEmailModal. Revisa el correo prellenado del cliente, escribe un saludo y haz clic en "Enviar Cotización".',
        proTip: 'El documento PDF incluye código QR para que el cliente consulte la cotización desde su teléfono móvil.'
      }
    ],
    contingency: 'Si el cliente no tiene internet en ese momento, presiona "Descargar PDF" para compartir el archivo por WhatsApp Web.'
  },
  {
    id: 'ESC-CRM-23',
    title: '¿Cómo simular y proteger el margen bruto (%) en una cotización antes de enviarla?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Simulador de margen que compara costo unitario vs. precio cotizado, alertando si el margen cae bajo el 20%.',
    expectedResult: 'El asesor conoce exactamente la ganancia en pesos ($) y el margen porcentual antes de comprometer tarifas con el comprador.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['simular margen', 'margen cotizacion', 'rentabilidad propuesta', 'ganancia cotizacion', 'no cotizar a perdida'],
    summary: 'Herramienta comercial que asegura que los descuentos otorgados en cotizaciones de volumen mantengan la rentabilidad de Procoquinal.',
    steps: [
      {
        title: 'Cargar los productos y aplicar los descuentos deseados',
        instruction: 'En la pantalla de cotización, ingresa los porcentajes de descuento ofrecidos al cliente.'
      },
      {
        title: 'Observar la barra de rentabilidad proyectada',
        instruction: 'Avalon mostrará en tiempo real: Costo de Mercancía ($), Ingreso Neto ($), Ganancia Bruta ($) y Margen de Utilidad (%).'
      },
      {
        title: 'Verificar el semáforo de margen comercial',
        instruction: '• Verde: Margen > 30% (Excelente rentabilidad).\n• Amarillo: Margen entre 20% y 30% (Aceptable para proyectos grandes).\n• Rojo: Margen < 20% (Bloqueado por política comercial).',
        warning: 'Cotizaciones con margen inferior al 20% requieren aprobación expresa de la Dirección Comercial.'
      }
    ],
    contingency: 'Si la competencia ofrece un precio más bajo, consulta con Laboratorio si se puede sustituir la base por una alternativa más económica.'
  },
  {
    id: 'ESC-CRM-24',
    title: '¿Cómo convertir una cotización aprobada en Pedido de Venta en el POS con un solo clic?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Facturar / Convertir a Pedido" traslada automáticamente todos los ítems y precios pactados al POS.',
    expectedResult: 'El pedido queda cargado en la canasta de ventas sin tener que volver a pistolear ni digitar los productos.',
    route: '/pos',
    routeLabel: 'Ir al Punto de Venta',
    synonyms: ['convertir cotizacion a venta', 'facturar cotizacion', 'aprobar cotizacion pos', 'pasar cotizacion a pedido', 'cerrar trato pos'],
    summary: 'Integración fluida entre el pipeline comercial y el punto de venta cuando el cliente da el sí a la propuesta.',
    steps: [
      {
        title: 'Ubicar la cotización en el Pipeline Comercial',
        instruction: 'En el CRM, localiza la cotización en la columna "Ganado / Aprobado".'
      },
      {
        title: 'Hacer clic en "Facturar en POS / Generar Venta"',
        instruction: 'Presiona el botón verde de conversión.'
      },
      {
        title: 'Revisar la canasta en el Punto de Venta',
        instruction: 'El sistema abrirá el POS con todos los productos, cantidades, el cliente y los precios especiales ya cargados en la canasta.'
      },
      {
        title: 'Proceder al cobro o remisión',
        instruction: 'Selecciona el método de pago (Efectivo, Tarjeta, Transferencia o Crédito) y emite la tirilla o factura oficial.',
        proTip: 'Esto reduce a cero los errores de digitación de precios o códigos en el mostrador.'
      }
    ],
    contingency: 'Si el cliente decidió cambiar la cantidad de algún producto a última hora, modifícalo en el carrito antes de cobrar.'
  },
  {
    id: 'ESC-CRM-25',
    title: '¿Cómo clonar o duplicar una cotización anterior para un pedido recurrente?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Duplicar Cotización" genera una nueva proforma idéntica actualizando los precios a la fecha vigente.',
    expectedResult: 'Se crea una nueva cotización en 5 segundos ahorrando tiempo en pedidos mensuales repetitivos.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['duplicar cotizacion', 'clonar propuesta', 'pedido repetido', 'cotizar lo mismo de siempre', 'reorden cotizacion'],
    summary: 'Agilización de cotizaciones para clientes habituales que consumen las mismas pinturas y catalizadores todos los meses.',
    steps: [
      {
        title: 'Buscar la cotización del mes pasado en el historial',
        instruction: 'En el perfil del cliente, localiza la propuesta anterior.'
      },
      {
        title: 'Hacer clic en "Clonar / Duplicar Cotización"',
        instruction: 'Presiona el ícono de duplicación.'
      },
      {
        title: 'Verificar la actualización automática de precios',
        instruction: 'Avalon cargará todos los ítems pero evaluará si alguna materia prima tuvo incremento de precio en el catálogo vigente.'
      },
      {
        title: 'Generar la nueva propuesta con fecha de hoy',
        instruction: 'Confirma los datos y envía el nuevo PDF al cliente.',
        proTip: 'Esta función es perfecta para carrocerías que compran lotes estándar de 20 galones de poliuretano cada 30 días.'
      }
    ],
    contingency: 'Si una de las referencias fue descontinuada, el sistema te alertará para que selecciones el nuevo producto sustituto.'
  },
  {
    id: 'ESC-CRM-26',
    title: '¿Cómo dar seguimiento a cotizaciones vencidas y reactivarlas con ajuste de tarifas?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Alerta en amarillo "Cotización Expirada (>15 días)" con opción de "Reactivar y Recalcular Precios".',
    expectedResult: 'El asesor retoma contacto con el comprador y actualiza los precios evitando despachos con costos desactualizados.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['cotizacion vencida', 'reactivar propuesta', 'precios vencidos', 'seguimiento cotizacion expirada', 'renovar cotizacion'],
    summary: 'Recuperación de oportunidades comerciales que quedaron en pausa durante semanas y requieren revalidación de costos.',
    steps: [
      {
        title: 'Filtrar por "Cotizaciones Vencidas" en el CRM',
        instruction: 'Consulta las ofertas emitidas hace más de 15 días que no han sido cerradas.'
      },
      {
        title: 'Contactar al cliente para validar el interés en la obra',
        instruction: 'Llama al encargado de compras para consultar si el proyecto sigue en marcha o si requieren ajustes técnicos.'
      },
      {
        title: 'Hacer clic en "Reactivar Cotización"',
        instruction: 'Presiona el botón de reactivación. Avalon revisará si hubo variaciones en los costos de materias primas o fletes.'
      },
      {
        title: 'Enviar la nueva versión actualizada',
        instruction: 'Emite la versión renovada con una nueva vigencia de 15 días para la toma de decisión.',
        warning: 'Nunca respetes precios de una cotización vencida de hace meses sin verificar el costo actual de las resinas importadas.'
      }
    ],
    contingency: 'Si el cliente cerró con la competencia, marca la cotización como "Perdida" anotando el motivo para análisis comercial.'
  },
  {
    id: 'ESC-CRM-27',
    title: '¿Cómo registrar el motivo de pérdida al descartar una cotización en el Pipeline?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Desplegable de causas de pérdida obligatorias: Precio, Tiempo de entrega, Competencia, Calidad u Obra cancelada.',
    expectedResult: 'La oportunidad se archiva como "PERDIDA" y alimenta los tableros analíticos de inteligencia comercial de gerencia.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['cotizacion perdida', 'motivo de perdida', 'cliente no compro', 'descartar trato', 'analisis competencia'],
    summary: 'Retroalimentación indispensable para que la dirección comercial conozca por qué se pierden negocios y ajuste la estrategia.',
    steps: [
      {
        title: 'Arrastrar el trato a la zona "Perdido" en el Pipeline',
        instruction: 'En la vista Kanban de oportunidades, mueve la tarjeta hacia la papelera o botón "Marcar como Perdido".'
      },
      {
        title: 'Seleccionar la causal de pérdida principal',
        instruction: 'Opciones:\n• Precio más alto que la competencia (especificar competidor: Pintuco, Tito Pabón, etc.).\n• Tiempo de entrega de mezcla muy largo.\n• Cliente canceló el proyecto o cerró la obra.\n• Falta de cupo de crédito aprobado.'
      },
      {
        title: 'Escribir notas de retroalimentación',
        instruction: 'Anota detalles clave (ej: "El competidor ofreció 10% más de descuento y flete gratis hasta la obra").'
      },
      {
        title: 'Guardar y cerrar oportunidad',
        instruction: 'Presiona "Confirmar Cierre". Los tableros de gestión comercial consolidarán las causales del mes.',
        proTip: 'Saber con quién y por qué se pierde permite ajustar las negociaciones con los fabricantes de resinas.'
      }
    ],
    contingency: 'Programa una tarea de seguimiento a 60 días para volver a contactar al cliente y evaluar su grado de satisfacción con el competidor.'
  },
  {
    id: 'ESC-CRM-28',
    title: '¿Cómo incluir flete terrestre (CIF) vs. flete contra entrega en una cotización?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Selector de condición logística que suma el flete al total de la factura o emite la leyenda "Flete a Cargo del Comprador".',
    expectedResult: 'La cotización clarifica las responsabilidades de transporte evitando disputas al momento de la entrega.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['flete cotizacion', 'transporte incluido', 'flete contra entrega', 'costo envio cotizar', 'condicion logistica'],
    summary: 'Definición transparente de los costos de envío para despachos locales o envíos intermunicipales a obras distantes.',
    steps: [
      {
        title: 'Seleccionar la modalidad de transporte en la cotización',
        instruction: 'En la sección Logística, elige: "Flete Incluido (Puesto en Obra)" o "Flete al Cobro (Transportadora)".'
      },
      {
        title: 'Ingresar el valor del transporte si es incluido',
        instruction: 'Digita la tarifa de flete pactada con la transportadora (ej: $180.000 COP para despacho a Villavicencio). Avalon lo sumará al total con su IVA correspondiente.'
      },
      {
        title: 'Indicar empresa de transporte si es al cobro',
        instruction: 'Si el cliente paga el envío en destino, selecciona la transportadora acordada (Servientrega, Envía, Coordinadora) y el sistema aclarará: "Flete a convenir cancelado por el cliente en muelle de destino".'
      },
      {
        title: 'Exportar la propuesta',
        instruction: 'El documento PDF reflejará las condiciones de entrega con total claridad jurídica.',
        warning: 'Nunca prometas "Flete Gratis" sin verificar previamente el margen bruto del pedido; un flete costoso puede absorber toda la ganancia.'
      }
    ],
    contingency: 'Para compras superiores a $15.000.000 COP en el área metropolitana de Bogotá, Procoquinal asume el flete en su flota propia.'
  },
  {
    id: 'ESC-CRM-29',
    title: '¿Cómo cotizar pedidos especiales de pinturas con colores personalizados de muestra física?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite vincular notas de color (`colorNote`), código RAL/Pantone y recargo por desarrollo de color.',
    expectedResult: 'Se emite la cotización con la advertencia de formulación a la medida y se pre-asigna la fórmula en el Taller de Tintometría.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['cotizar color especial', 'color personalizado', 'muestra fisica cotizar', 'desarrollo de color', 'color a la medida'],
    summary: 'Cotización de recubrimientos formulados por igualación sobre muestra de lámina o muestra plástica traída por el cliente.',
    steps: [
      {
        title: 'Registrar la referencia de base tintométrica',
        instruction: 'En la cotización, selecciona la base requerida (ej: Base Poliuretano Vetro Brillante).'
      },
      {
        title: 'Ingresar la anotación técnica de color',
        instruction: 'En el campo `colorNote`, digita la referencia (ej: "Igualación sobre tapa de gasolina Mazda Rojo Cristal").'
      },
      {
        title: 'Aplicar el recargo por desarrollo de igualación',
        instruction: 'Si es un color de alta complejidad que requiere prueba de espectrofotómetro, agrega el concepto "Desarrollo y Calibración de Color de Laboratorio" ($50.000 COP).'
      },
      {
        title: 'Establecer la política de no devolución',
        instruction: 'El sistema imprimirá en la cotización: "Las pinturas formuladas a pedido especial no tienen cambio ni devolución una vez tinturadas".',
        warning: 'Exige un anticipo mínimo del 50% antes de enviar la orden de tintometría al taller de producción.'
      }
    ],
    contingency: 'Una vez el cliente apruebe la cotización, la muestra física se rotula y se entrega al colorista con el número de trato del CRM.'
  },
  {
    id: 'ESC-CRM-30',
    title: '¿Cómo consultar el historial completo de cotizaciones y pedidos de un cliente?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Pestaña "Historial Comercial 360°" en el perfil del cliente consolida todas sus compras históricas.',
    expectedResult: 'El vendedor conoce las preferencias de compra del cliente, colores habituales y frecuencia de consumo en un solo vistazo.',
    route: '/crm',
    routeLabel: 'Ir a Gestión de Clientes',
    synonyms: ['historial cliente', 'compras anteriores cliente', 'que me ha comprado', 'historico cotizaciones', 'resumen cliente 360'],
    summary: 'Visualización integral de la trayectoria comercial del cliente para ofrecer una atención altamente personalizada.',
    steps: [
      {
        title: 'Buscar el cliente en la tabla de CRM',
        instruction: 'Digita el nombre o NIT en el buscador principal.'
      },
      {
        title: 'Abrir el expediente completo del cliente (CrmContactDrawer)',
        instruction: 'Haz clic sobre el nombre del contacto.'
      },
      {
        title: 'Navegar a la pestaña "Historial de Cotizaciones & Ventas"',
        instruction: 'Verás la lista cronológica con fecha, número de factura/cotización, productos comprados, valor total y estado (Pagada, Pendiente, Vencida).'
      },
      {
        title: 'Analizar el producto más comprado',
        instruction: 'Avalon destacará el SKU más frecuente (ej: "Producto preferido: Barniz Poliuretano ILVA TZ1555 - 60 galones comprados en el año").',
        proTip: 'Usa esta información para ofrecerle promociones del producto que realmente utiliza en su taller.'
      }
    ],
    contingency: 'Puedes exportar el historial de compras del cliente a Excel para reuniones de revisión de cuentas con gerencia.'
  },
  {
    id: 'ESC-CRM-31',
    title: '¿Cómo archivar cotizaciones descartadas para mantener limpio el tablero del Pipeline?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Filtro rápido que oculta oportunidades cerradas/perdidas manteniendo visible solo el embudo activo.',
    expectedResult: 'El asesor se enfoca únicamente en las cotizaciones vivas con probabilidad real de cierre en el mes en curso.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['archivar cotizaciones', 'limpiar pipeline', 'ocultar tratos cerrados', 'embudo activo', 'ordenar tablero crm'],
    summary: 'Mantenimiento del tablero Kanban comercial para evitar la saturación visual con propuestas viejas.',
    steps: [
      {
        title: 'Ingresar a la vista de Pipeline Comercial',
        instruction: 'Accede a "Ventas & Ingresos > Pipeline / Tratos".'
      },
      {
        title: 'Aplicar el filtro de estado: "Solo Activas / En Proceso"',
        instruction: 'En la barra superior de filtros, desmarca las opciones "Ganadas" y "Perdidas".'
      },
      {
        title: 'Visualizar el embudo limpio',
        instruction: 'El tablero mostrará exclusivamente las columnas: "Nuevo Prospecto", "Cotización Enviada" y "En Negociación / Cierre".'
      },
      {
        title: 'Archivar masivamente oportunidades con más de 90 días',
        instruction: 'Presiona "Herramientas > Archivar Tratos Antiguos". Quedarán resguardados en el historial pero no ocuparán espacio en el tablero activo.',
        proTip: 'Un Pipeline con menos de 30 tratos visibles por asesor garantiza un seguimiento mucho más riguroso y puntual.'
      }
    ],
    contingency: 'Si necesitas consultar una propuesta archivada del año pasado, activa el filtro "Ver Archivadas" en cualquier momento.'
  },
  {
    id: 'ESC-CRM-32',
    title: '¿Cómo generar una cotización con lista de precios mayorista para distribuidores regionales?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Cotizaciones & Propuestas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asigna lista de precios `pricingRules` especial para distribuidores mayoristas con volumen mínimo de cuñetes.',
    expectedResult: 'La cotización liquida precios de escala mayorista exigiendo cumplir el pedido mínimo para activar la tarifa.',
    route: '/crm',
    routeLabel: 'Ir a Cotizaciones',
    synonyms: ['cotizar distribuidor', 'precio mayorista distribucion', 'pedido minimo cuñetes', 'cotizacion por volumen', 'tarifa reventa'],
    summary: 'Propuestas comerciales para ferreterías y almacenes de pintura que revenden las marcas de Procoquinal en otras ciudades.',
    steps: [
      {
        title: 'Seleccionar al cliente con perfil de Distribuidor',
        instruction: 'El cliente debe estar marcado con el tier comercial "Distribuidor Regional".'
      },
      {
        title: 'Cargar referencias por volumen de estibas o cuñetes',
        instruction: 'Ingresa las cantidades requeridas (ej: 50 cuñetes de pintura arquitectónica y 20 tambores de solventes).'
      },
      {
        title: 'Comprobar la regla de Pedido Mínimo Mayorista',
        instruction: 'Avalon verificará que el valor antes de IVA supere el umbral mínimo de distribución ($25.000.000 COP).'
      },
      {
        title: 'Generar la propuesta con condiciones de reventa',
        instruction: 'La cotización detallará los precios unitarios de distribuidor, el margen sugerido para reventa y los tiempos de despacho en tractomula.',
        warning: 'No apliques precios de distribuidor a clientes finales o talleres pequeños para no distorsionar el canal de distribución.'
      }
    ],
    contingency: 'Si el distribuidor solicita exclusividad territorial en su municipio, el acuerdo debe escalarse al Director General.'
  },

  // =========================================================================
  // SUBTEMA 4: Pipeline Comercial, Oportunidades & Tratos (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CRM-33',
    title: '¿Cómo crear y gestionar un Trato (Deal) en el tablero Kanban del Pipeline?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Tablero Kanban interactivo con arrastrar y soltar (Drag & Drop) para avanzar oportunidades de etapa.',
    expectedResult: 'El negocio avanza visualmente por las fases de venta reflejando el pronóstico de ingresos del mes.',
    route: '/crm',
    routeLabel: 'Ir al Pipeline',
    synonyms: ['crear trato', 'nuevo deal', 'pipeline kanban', 'etapas de venta', 'mover oportunidad', 'tablero comercial'],
    summary: 'Gestión visual de oportunidades comerciales desde el primer contacto hasta el cierre exitoso del contrato.',
    steps: [
      {
        title: 'Crear un nuevo trato en el Pipeline',
        instruction: 'En la vista Kanban de CRM, haz clic en el botón "+ Nuevo Trato" en la columna "Prospecto / Lead".'
      },
      {
        title: 'Diligenciar nombre del proyecto y valor estimado',
        instruction: 'Ingresa: Título (ej: Suministro Pintura Flota TransMilenio), Cliente asociado, Valor proyectado ($35.000.000 COP) y Fecha estimada de cierre.'
      },
      {
        title: 'Arrastrar la tarjeta a medida que avanza la negociación',
        instruction: 'Avanza la tarjeta arrastrándola entre columnas:\n1. Prospecto Identificado\n2. Cotización Entregada\n3. Visita Técnica en Taller\n4. En Negociación / Espera de OC\n5. Ganado / Cerrado.'
      },
      {
        title: 'Monitorear la suma total de cada columna',
        instruction: 'La cabecera de cada columna sumará el valor total de los tratos activos en esa etapa.',
        proTip: 'Esta vista permite al Director de Ventas proyectar el flujo de caja del mes con base en las probabilidades de cierre.'
      }
    ],
    contingency: 'Si una oportunidad se cancela, arrástrala a la columna "Perdido" y registra la causa para retroalimentación.'
  },
  {
    id: 'ESC-CRM-34',
    title: '¿Cómo registrar una visita técnica o reunión en la bitácora de interacciones del cliente?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Sección "Línea de Tiempo / Actividades" en CrmContactDrawer registra notas, llamadas, visitas y tareas.',
    expectedResult: 'Queda guardada la memoria técnica de la reunión disponible para cualquier empleado que atienda al cliente.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['registrar visita tecnica', 'bitacora de cliente', 'nota de reunion', 'historial de llamadas', 'actividades crm'],
    summary: 'Registro sistemático de compromisos y acuerdos alcanzados en visitas comerciales a plantas y talleres.',
    steps: [
      {
        title: 'Abrir el panel lateral del cliente (CrmContactDrawer)',
        instruction: 'Localiza el contacto en el CRM y haz clic sobre su nombre.'
      },
      {
        title: 'Seleccionar tipo de actividad: "Visita Técnica en Taller"',
        instruction: 'Haz clic en el ícono de ubicación o maletín.'
      },
      {
        title: 'Escribir el resumen de la conversación y compromisos',
        instruction: 'Digita los puntos tratados (ej: "Se revisó problema de cáscara de naranja en aplicación de barniz; se recomendó cambiar diluyente por Thinner Lento PQ-DIL-02 y ajustar presión de pistola a 2.5 bar").'
      },
      {
        title: 'Guardar en la línea de tiempo',
        instruction: 'Presiona "Registrar Actividad". La nota se sellará con fecha, hora y usuario del asesor.',
        proTip: 'Cualquier otro vendedor que hable con el cliente podrá leer esta nota y no repetir preguntas innecesarias.'
      }
    ],
    contingency: 'Puedes adjuntar fotos de la prueba de pintura tomada con el celular directamente en la misma nota.'
  },
  {
    id: 'ESC-CRM-35',
    title: '¿Cómo programar tareas y recordatorios de seguimiento comercial en el calendario?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo FloatingTaskNote y notificaciones integradas que alertan al asesor en la fecha y hora programada.',
    expectedResult: 'El vendedor recibe una alerta en su pantalla para no olvidar llamar al cliente en la fecha pactada.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Tareas',
    synonyms: ['programar tarea', 'recordatorio crm', 'tarea de seguimiento', 'agendar llamada cliente', 'alerta asesor'],
    summary: 'Automatización de la disciplina comercial para asegurar que ninguna cotización quede sin seguimiento oportuno.',
    steps: [
      {
        title: 'Hacer clic en "+ Programar Tarea"',
        instruction: 'En la ficha del contacto o trato, selecciona la opción de nueva tarea.'
      },
      {
        title: 'Definir el tipo de tarea y fecha límite',
        instruction: 'Elige: "Llamada de Seguimiento", "Enviar Ficha Técnica", "Cobrar Factura" o "Visita de Demostración". Asigna fecha y hora (ej: Jueves 10:00 AM).'
      },
      {
        title: 'Escribir el objetivo de la acción',
        instruction: 'Anota: "Confirmar si la junta aprobó la cotización de los 15 cuñetes de anticorrosivo".'
      },
      {
        title: 'Recibir la notificación y marcar como completada',
        instruction: 'Llegado el día, Avalon mostrará la alerta en el encabezado. Una vez ejecutada la llamada, presiona "Marcar como Completada".',
        warning: 'Acumular más de 5 tareas vencidas alerta al Director Comercial sobre falta de seguimiento del asesor.'
      }
    ],
    contingency: 'Si el cliente pide que lo llamen la semana siguiente, puedes posponer la tarea con el botón "Reprogramar +7 días".'
  },
  {
    id: 'ESC-CRM-36',
    title: '¿Cómo registrar una prueba técnica de homologación con visita conjunta del laboratorista químico?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra orden de "Prueba Técnica de Laboratorio" vinculando al químico formulador y al asesor comercial.',
    expectedResult: 'Se emite el informe de ensayo técnico en taller con resultados de adherencia, brillo y tiempo de curado.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Tratos',
    synonyms: ['prueba tecnica taller', 'homologacion pintura', 'visita laboratorista', 'ensayo de adherencia taller', 'demostracion tecnica'],
    summary: 'Servicio de valor agregado donde un técnico de Procoquinal asiste al taller del cliente para demostrar el rendimiento de las pinturas.',
    steps: [
      {
        title: 'Crear solicitud de acompañamiento técnico en el CRM',
        instruction: 'En el trato comercial, selecciona "Solicitar Visita de Laboratorista".'
      },
      {
        title: 'Describir los ensayos a realizar en la planta del cliente',
        instruction: 'Indica los sustratos a pintar (ej: Lámina galvanizada, fibra de vidrio, madera MDF) y los ensayos requeridos (Prueba de corte por enrejado ASTM D3359).'
      },
      {
        title: 'Ejecutar la prueba física en el taller aliado',
        instruction: 'El laboratorista aplica la pintura, calibra la pistola aerográfica y toma mediciones de micras secas.'
      },
      {
        title: 'Subir el Acta de Homologación Aprobada a Avalon V1',
        instruction: 'Adjunta el reporte firmado por el jefe de taller del cliente. El trato avanzará automáticamente a la etapa "Homologado / Listo para Compra".',
        proTip: 'Homologar técnicamente el producto frente al jefe de taller garantiza compras cautivas de largo plazo.'
      }
    ],
    contingency: 'Si la prueba no superó la prueba de brillo requerida, el laboratorio formulará un ajuste en taller mediante aditivo mateante.'
  },
  {
    id: 'ESC-CRM-37',
    title: '¿Cómo gestionar el Pipeline de Post-Venta (seguimiento a satisfacción 7 días tras la entrega)?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo CrmPostSalePipeline automatiza el seguimiento a la satisfacción del cliente tras el despacho.',
    expectedResult: 'Se detectan a tiempo pequeñas dudas de aplicación y se asegura la recompra mensual recurrente.',
    route: '/crm',
    routeLabel: 'Ir a Post-Venta',
    synonyms: ['post venta crm', 'seguimiento post venta', 'satisfaccion cliente pintura', 'recompra cliente', 'atencion al cliente crm'],
    summary: 'Proceso proactivo de calidad para constatar que el cliente aplicó la pintura sin inconvenientes en sus líneas de pintura.',
    steps: [
      {
        title: 'Disparo automático de la tarea de post-venta',
        instruction: 'Al marcarse una factura como "ENTREGADA" en Logística, Avalon programa una tarea automática de post-venta a los 7 días calendario.'
      },
      {
        title: 'Contactar al cliente mediante llamada de cortesía',
        instruction: 'Pregunta: "¿Cómo se comportó el barniz en la cabina de secado? ¿El color igualó con total exactitud? ¿Requiere insumos adicionales?".'
      },
      {
        title: 'Registrar la calificación de satisfacción (CSAT)',
        instruction: 'Ingresa la puntuación del 1 al 5 en el formulario de post-venta de Avalon V1.'
      },
      {
        title: 'Cerrar el ciclo o activar soporte técnico',
        instruction: 'Si el cliente está 100% satisfecho, programa la siguiente fecha de reposición estimada; si reporta alguna duda, coordina soporte inmediato.',
        proTip: 'Los clientes que reciben llamadas de post-venta tienen una tasa de fidelización un 65% mayor.'
      }
    ],
    contingency: 'Si el cliente reporta un defecto de producto, genera de inmediato un ticket de garantía en el módulo de Devoluciones (ESC-INV-42).'
  },
  {
    id: 'ESC-CRM-38',
    title: '¿Cómo medir la tasa de conversión comercial de cada asesor (% de cotizaciones ganadas)?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Tablero en SalesPerformance que calcula Win Rate: (Cotizaciones Ganadas / Cotizaciones Totales * 100).',
    expectedResult: 'La gerencia evalúa el desempeño de ventas identificando cuellos de botella en la negociación de cada asesor.',
    route: '/sales-performance',
    routeLabel: 'Ir a Rendimiento de Ventas',
    synonyms: ['tasa de conversion', 'win rate crm', 'efectividad asesor', 'porcentaje cotizaciones ganadas', 'kpi ventas'],
    summary: 'Métrica de eficiencia comercial para determinar qué vendedores cierran más negocios y quiénes requieren capacitación.',
    steps: [
      {
        title: 'Acceder a "Ventas & Ingresos > Rendimiento Comercial"',
        instruction: 'Abre la pestaña de métricas y KPIs de ventas.'
      },
      {
        title: 'Filtrar por periodo y equipo comercial',
        instruction: 'Selecciona el mes o trimestre a evaluar.'
      },
      {
        title: 'Consultar la tarjeta "Tasa de Cierre / Win Rate"',
        instruction: 'Revisa los indicadores por vendedor:\n• Total Cotizaciones Emitidas\n• Total Cotizaciones Ganadas ($)\n• Tasa de Conversión (%) (Meta Procoquinal: > 45%).'
      },
      {
        title: 'Identificar el tiempo medio de ciclo de venta',
        instruction: 'Comprueba cuántos días tarda cada asesor desde que emite la propuesta hasta que el cliente consigna el dinero.',
        proTip: 'Un vendedor con alta tasa de cotizaciones pero bajo cierre suele fallar en el seguimiento telefónico posterior al envío del PDF.'
      }
    ],
    contingency: 'Utiliza estos datos en las reuniones quincenales de ventas para retroalimentar las técnicas de cierre del equipo.'
  },
  {
    id: 'ESC-CRM-39',
    title: '¿Cómo auditar tratos estancados con más de 30 días sin avance en el embudo comercial?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Insignia roja "Trato Estancado (>30d)" que alerta sobre oportunidades abandonadas en el embudo.',
    expectedResult: 'El asesor reactiva la negociación o descarta formalmente el trato para no inflar las proyecciones de venta.',
    route: '/crm',
    routeLabel: 'Ir al Pipeline',
    synonyms: ['trato estancado', 'oportunidad dormida', 'deal estancado', 'limpiar embudo estancado', 'alerta inactividad trato'],
    summary: 'Detección de propuestas olvidadas para mantener el pronóstico comercial realista y depurado.',
    steps: [
      {
        title: 'Filtrar por "Tratos Estancados" en el Pipeline',
        instruction: 'Presiona el filtro rápido de inactividad comercial (>30 días).'
      },
      {
        title: 'Revisar la última nota de interacción del trato',
        instruction: 'Comprueba hace cuánto tiempo no se llama al cliente y cuál fue el último acuerdo registrado.'
      },
      {
        title: 'Ejecutar la llamada de reactivación definitiva',
        instruction: 'Pregunta al comprador si el proyecto sigue vigente para este mes o si ya tomaron otra decisión.'
      },
      {
        title: 'Tomar acción: Avanzar o Cerrar como Perdido',
        instruction: 'Si el cliente ratifica el pedido, avanza la tarjeta a "En Cierre"; si desistió, márcala como "Perdida" con la causal correspondiente.',
        warning: 'Mantener tratos ficticios abiertos en el embudo distorsiona las compras de materia prima en planta.'
      }
    ],
    contingency: 'Configura la regla de auto-archivado para oportunidades que cumplan 60 días sin actividad humana.'
  },
  {
    id: 'ESC-CRM-40',
    title: '¿Cómo gestionar la entrega de muestras comerciales de prueba para homologación en taller?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra salida de muestras al 100% de descuento vinculada al Deal con fecha de prueba técnica.',
    expectedResult: 'Se entrega el cuarto de galón con control de costos en Kárdex y se programa el seguimiento a la prueba.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Tratos',
    synonyms: ['entregar muestra', 'muestra para prueba taller', 'cuarto de muestra gratis', 'probar esmalte taller', 'homologar muestra'],
    summary: 'Procedimiento formal de entrega de producto sin costo para convencer a talleres de migrar hacia las marcas de Procoquinal.',
    steps: [
      {
        title: 'Registrar la oportunidad en etapa "Muestra en Evaluación"',
        instruction: 'En el CRM, crea el trato asociando el cliente y la referencia a probar (ej: Barniz Poliuretano Alto Brillo).'
      },
      {
        title: 'Generar la salida de muestra en el POS',
        instruction: 'Cobra la muestra bajo el método "Muestra Comercial ($0)" (ESC-POS-16) para dar de baja legal en el Kárdex de almacén.'
      },
      {
        title: 'Entregar la muestra con la Ficha Técnica impresa',
        instruction: 'Entrega el producto al jefe de pintura del cliente junto a la hoja de proporciones de catalizado.'
      },
      {
        title: 'Programar la llamada de seguimiento técnico a las 48 horas',
        instruction: 'Agenda la tarea en Avalon V1: "Llamar a revisar acabado y nivelación de la muestra aplicada".',
        proTip: 'Las muestras con seguimiento telefónico a las 48 horas tienen una tasa de cierre de venta superior al 70%.'
      }
    ],
    contingency: 'Si el tallerista no aplica la muestra en 15 días, el asesor debe visitarlo para hacer la aplicación conjunta en su taller.'
  },
  {
    id: 'ESC-CRM-41',
    title: '¿Cómo registrar y hacer seguimiento a licitaciones públicas o contratos industriales grandes?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo de Licitaciones B2B con gestión de pólizas, fechas de pliego, muestras y adjudicación.',
    expectedResult: 'Se controla cada hito del proceso licitatorio evitando descalificaciones por vencimiento de plazos.',
    route: '/crm',
    routeLabel: 'Ir a Licitaciones CRM',
    synonyms: ['licitacion publica', 'contrato industrial', 'pliegos licitacion', 'poliza de seriedad oferta', 'secop pintura'],
    summary: 'Gestión estructurada de propuestas de suministro masivo para entidades estatales o grandes contratistas de infraestructura.',
    steps: [
      {
        title: 'Crear el trato bajo tipo "Licitación / Contrato Industrial"',
        instruction: 'Ingresa el número de proceso (ej: SECOP II - Licitación #LP-2026-04).'
      },
      {
        title: 'Configurar los hitos y fechas críticas',
        instruction: 'Establece en el cronograma: Cierre de observaciones, Presentación de oferta económica, Entrega de muestras de laboratorio y Audiencia de adjudicación.'
      },
      {
        title: 'Adjuntar pólizas de seriedad y certificaciones de calidad ISO',
        instruction: 'Sube al repositorio del trato: Póliza de seriedad de la oferta, Certificados de laboratorio ICONTEC y estados financieros certificados.'
      },
      {
        title: 'Seguimiento a la adjudicación',
        instruction: 'Al ganar la licitación, el trato pasa a "ADJUDICADO / EN CONTRATO" habilitando la reserva de stock a largo plazo en el motor ATP.',
        warning: 'El incumplimiento de pliegos de licitaciones públicas acarrea inhabilidades legales para contratar con el Estado.'
      }
    ],
    contingency: 'Si la licitación se declara desierta, archiva el expediente técnico para presentarlo en la siguiente convocatoria.'
  },
  {
    id: 'ESC-CRM-42',
    title: '¿Cómo exportar el informe de Pipeline y Forecast de ventas a Excel para el Comité Comercial?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal CrmExcelModal exporta planilla con tratos, probabilidades ponderadas y pronóstico de ingresos.',
    expectedResult: 'La gerencia cuenta con la proyección financiera de ventas para la reunión semanal de dirección.',
    route: '/crm',
    routeLabel: 'Ir al CRM / Pipeline',
    synonyms: ['exportar pipeline excel', 'forecast de ventas', 'pronostico comercial excel', 'informe comite ventas', 'descargar tratos excel'],
    summary: 'Generación del reporte consolidado de oportunidades comerciales ponderadas por probabilidad de éxito.',
    steps: [
      {
        title: 'Acceder al CRM y presionar "Exportar Informe / Excel"',
        instruction: 'Haz clic en el botón verde de hoja de cálculo en la barra de herramientas del CRM.'
      },
      {
        title: 'Seleccionar filtros de fecha y asesores',
        instruction: 'Elige el mes proyectado y si deseas ver todo el equipo o un asesor individual.'
      },
      {
        title: 'Revisar las columnas del Forecast ponderado',
        instruction: 'El Excel descargado detallará: Cliente, Vendedor, Valor del Trato, Etapa actual, Probabilidad (%) y Valor Ponderado Realista (ej: $50M al 70% de probabilidad = $35M COP esperados).'
      },
      {
        title: 'Presentar en el comité de dirección',
        instruction: 'Utiliza el informe para coordinar con Producción las mezclas requeridas para atender los pedidos que están por cerrar.',
        proTip: 'Cruzar el Forecast de ventas con el inventario de Kárdex evita quedarse sin insumos cuando caen pedidos grandes.'
      }
    ],
    contingency: 'Si un trato no tiene probabilidad asignada, Avalon le asignará la probabilidad estándar de su etapa en el embudo.'
  },
  {
    id: 'ESC-CRM-43',
    title: '¿Cómo pactar y registrar un Acuerdo de Exclusividad de Marca con un taller carrocero aliado?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Pipeline Comercial & Tratos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra acuerdos de consumo mínimo mensual a cambio de descuentos preferenciales y comodato de equipos.',
    expectedResult: 'El taller se compromete a pintar 100% con líneas de Procoquinal a cambio de tarifas preferentes y asesoría técnica.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['acuerdo de exclusividad', 'taller exclusivo', 'convenio comercial taller', 'comodato de maquina', 'fidelizacion taller'],
    summary: 'Alianzas comerciales estratégicas para blindar clientes corporativos frente a la competencia de fabricantes multinacionales.',
    steps: [
      {
        title: 'Negociar los términos del convenio de exclusividad',
        instruction: 'Parámetros típicos: Consumo mínimo de $12.000.000 COP mensuales a cambio de descuento especial del 18%, dotación de uniformes y mantenimiento preventivo de pistolas aerográficas.'
      },
      {
        title: 'Registrar el convenio en la ficha del cliente en el CRM',
        instruction: 'En la sección "Convenios Especiales", selecciona "Acuerdo de Exclusividad", digita la meta mensual y la vigencia (ej: 12 meses).'
      },
      {
        title: 'Subir el contrato firmado en PDF',
        instruction: 'Adjunta el contrato con las firmas de los representantes legales de ambas partes.'
      },
      {
        title: 'Monitorear el cumplimiento mensual automático',
        instruction: 'Avalon evaluará automáticamente al cierre de cada mes si el taller alcanzó el consumo pactado para mantener la tarifa preferente.',
        proTip: 'Los talleres en exclusividad son la base más estable del flujo de caja de la compañía.'
      }
    ],
    contingency: 'Si el taller incumple la meta durante dos meses consecutivos, el sistema revoca automáticamente la tarifa preferente.'
  },

  // =========================================================================
  // SUBTEMA 5: Matriz de Comisiones, Logros & Metas de Vendedores (12 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CRM-44',
    title: '¿Cómo liquidar las comisiones comerciales del mes basadas en el recaudo real de cartera?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo ComisionesLogros liquida comisiones exclusivamente sobre facturas efectivamente cobradas (recaudo real).',
    expectedResult: 'El asesor cobra comisión por el dinero que realmente ingresó al banco de la empresa, evitando comisiones sobre cartera impaga.',
    route: '/comisiones-logros',
    routeLabel: 'Ir a Comisiones & Logros',
    synonyms: ['liquidar comisiones', 'comision sobre recaudo', 'pago comisiones vendedores', 'comisiones mensuales', 'calcular comision asesor'],
    summary: 'Procedimiento de cierre mensual de nómina comercial para remunerar a los vendedores según el recaudo efectivo.',
    steps: [
      {
        title: 'Ingresar a "Ventas & Ingresos > Comisiones & Logros"',
        instruction: 'Accede al panel de comisiones (/comisiones-logros).'
      },
      {
        title: 'Seleccionar el mes de corte de la nómina',
        instruction: 'Elige el mes vencido a liquidar (ej: Junio).'
      },
      {
        title: 'Hacer clic en "Generar Liquidación sobre Recaudo"',
        instruction: 'El motor de Avalon cruzará los Recibos de Caja efectivamente conciliados en banco asociados a cada vendedor.'
      },
      {
        title: 'Revisar la tabla individual de comisiones',
        instruction: 'Se desglosará por asesor: Total Recaudado, Base Comisionable, Porcentaje según Matriz y Monto Neto a Pagar en nómina.',
        proTip: 'Liquidar sobre recaudo incentiva a los vendedores a apoyar activamente la cobranza de sus clientes a crédito.'
      }
    ],
    contingency: 'Las facturas vendidas a crédito en el mes pero no cobradas aún, se acumulan para comisionar en el mes en que el cliente pague.'
  },
  {
    id: 'ESC-CRM-45',
    title: '¿Cómo funciona la Matriz de Comisiones por líneas de producto y margen de rentabilidad?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo MatrixComisiones asigna mayor porcentaje a productos premium de alto margen (3%) y menor a solventes (1%).',
    expectedResult: 'La fuerza de ventas enfoca su esfuerzo en comercializar las referencias más rentables para la compañía.',
    route: '/matrix-comisiones',
    routeLabel: 'Ir a Matriz de Comisiones',
    synonyms: ['matriz de comisiones', 'porcentaje comision producto', 'comision por margen', 'tabla comisiones', 'escalas de comision'],
    summary: 'Reglas de remuneración variable diferenciadas según el margen de contribución de cada familia química.',
    steps: [
      {
        title: 'Acceder a "Configuración > Matriz de Comisiones"',
        instruction: 'Abre el configurador de reglas de comisión.'
      },
      {
        title: 'Comprender las escalas por familia de producto:',
        instruction: '• Línea Premium / Poliuretanos Vetro (Margen > 35%): Comisión del 3.0% sobre recaudo.\n• Esmaltes Sintéticos & Primers (Margen 25-35%): Comisión del 2.0% sobre recaudo.\n• Solventes & Thinners comoditizados (Margen < 20%): Comisión del 0.8% sobre recaudo.'
      },
      {
        title: 'Verificar el cálculo automático en cada venta',
        instruction: 'Al facturar un pedido mixto, Avalon prorratea la comisión ítem por ítem según su familia.',
        proTip: 'Esto evita que un vendedor cumpla su meta vendiendo únicamente solventes de bajo margen que no dejan ganancia neta.'
      }
    ],
    contingency: 'Las modificaciones en la matriz de comisiones deben anunciarse con 30 días de anticipación al equipo comercial conforme a la ley laboral.'
  },
  {
    id: 'ESC-CRM-46',
    title: '¿Cómo penaliza el sistema las comisiones cuando el asesor otorga descuentos excesivos?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Regla de descuento compartido: por cada 1% de descuento extra otorgado al cliente, la comisión se reduce proporcionalmente.',
    expectedResult: 'El vendedor defiende el precio oficial de lista y solo otorga descuentos cuando es estrictamente indispensable para cerrar.',
    route: '/matrix-comisiones',
    routeLabel: 'Ir a Matriz de Comisiones',
    synonyms: ['penalizacion descuento comision', 'descuento castiga comision', 'comision compartida descuento', 'defender precio venta'],
    summary: 'Mecanismo de alineación de incentivos que evita que los vendedores regalen el margen de la empresa para inflar sus ventas.',
    steps: [
      {
        title: 'Entender la fórmula de penalización comercial',
        instruction: 'Si el precio de lista tiene 0% de descuento, el asesor gana su 3% pleno de comisión.\nSi otorga un 5% de descuento al cliente, su comisión baja a 2.2%.\nSi otorga el descuento máximo del 10%, su comisión se reduce a 1.2%.'
      },
      {
        title: 'Visualizar el simulador de comisión en la cotización',
        instruction: 'Al aplicar un descuento en el CRM, el asesor verá en su pantalla: "Tu comisión estimada pasará de $150.000 a $90.000 COP con este descuento".'
      },
      {
        title: 'Tomar la decisión comercial consciente',
        instruction: 'El vendedor evalúa si prefiere defender el precio para ganar su comisión completa o ceder margen para ganar un cliente nuevo.',
        proTip: 'Esta transparencia en tiempo real reduce las solicitudes injustificadas de rebajas comerciales a gerencia.'
      }
    ],
    contingency: 'En negociaciones corporativas aprobadas por Junta Directiva, la gerencia puede exonerar la penalización para esa cuenta específica.'
  },
  {
    id: 'ESC-CRM-47',
    title: '¿Cómo configurar aceleradores y bonos por cumplimiento de metas mensuales ($100M, $150M)?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Escalas de acelerador (100% de meta: multiplicador 1.0x; 120% de meta: multiplicador 1.25x más bono fijo).',
    expectedResult: 'Los vendedores que superan su cuota de ventas reciben un premio adicional motivador en su liquidación.',
    route: '/comisiones-logros',
    routeLabel: 'Ir a Comisiones & Logros',
    synonyms: ['acelerador comision', 'bono cumplimiento meta', 'meta 100 millones', 'premio vendedor del mes', 'escalas de incentivo'],
    summary: 'Estructuración de planes de incentivos que recompensan extraordinariamente a los asesores de alto rendimiento.',
    steps: [
      {
        title: 'Definir las metas mensuales individuales en el CRM',
        instruction: 'En CrmTeam, asigna la cuota de ventas del mes a cada asesor (ej: Meta Carlos: $120.000.000 COP).'
      },
      {
        title: 'Configurar los tramos de aceleración:',
        instruction: '• Menos del 80% de la meta: Comisión base sin bono.\n• Entre 80% y 99%: Comisión estándar (1.0x).\n• Del 100% al 119%: Acelerador del 1.15x sobre todas las comisiones del mes.\n• 120% o más: Acelerador del 1.30x + Bono de Éxito de $1.000.000 COP en efectivo.'
      },
      {
        title: 'Monitorear la barra de progreso en vivo',
        instruction: 'Cada vendedor ve en su panel personal el velocímetro de cumplimiento diario y cuánto le falta para disparar el bono.',
        proTip: 'El seguimiento diario en vivo genera una sana competencia en el equipo comercial hacia el cierre de mes.'
      }
    ],
    contingency: 'Las metas se ajustan trimestralmente teniendo en cuenta la estacionalidad del mercado de recubrimientos industriales.'
  },
  {
    id: 'ESC-CRM-48',
    title: '¿Cómo ajustar comisiones cuando un cliente devuelve mercancía o se emite una Nota Crédito?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Descuenta automáticamente la comisión proporcional generada en facturas afectadas por devolución en el mes.',
    expectedResult: 'La liquidación de comisiones se ajusta justamente descontando las ventas que fueron reversadas por producto retornado.',
    route: '/comisiones-logros',
    routeLabel: 'Ir a Comisiones & Logros',
    synonyms: ['ajuste comision devolucion', 'reversar comision nota credito', 'descontar comision producto devuelto', 'ajuste negativo comisiones'],
    summary: 'Corrección matemática de comisiones cuando una venta comisionada previamente es devuelta total o parcialmente por el comprador.',
    steps: [
      {
        title: 'Detectar la Nota Crédito emitida en Devoluciones',
        instruction: 'Cuando Contabilidad aprueba una Nota Crédito por retorno de pintura, Avalon identifica la factura de origen y el vendedor asociado.'
      },
      {
        title: 'Calcular el valor de la comisión a reversar',
        instruction: 'El sistema calcula la comisión pagada sobre el valor devuelto (ej: devolución de $2.000.000 COP a tasa del 3% = ajuste de -$60.000 COP).'
      },
      {
        title: 'Aplicar el descuento en la liquidación del mes en curso',
        instruction: 'En el reporte de comisiones de ese asesor, aparecerá una línea: "Ajuste por Devolución Factura #F-2900: -$60.000 COP".',
        warning: 'Si la devolución ocurrió por defecto de calidad del fabricante y no por error del vendedor, Gerencia puede exonerar el descuento de comisión.'
      }
    ],
    contingency: 'El detalle de la Nota Crédito queda visible para que el asesor pueda revisar la razón de la devolución con su cliente.'
  },
  {
    id: 'ESC-CRM-49',
    title: '¿Cómo dividir una comisión compartida entre el asesor técnico y el vendedor de mostrador?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Venta Compartida (Split Commission)" que permite fraccionar (ej: 50% / 50%) la comisión entre dos usuarios.',
    expectedResult: 'Ambos colaboradores reciben su reconocimiento económico fomentando el trabajo colaborativo en equipo.',
    route: '/crm',
    routeLabel: 'Ir a Cotizaciones',
    synonyms: ['comision compartida', 'split comision', 'dividir comision dos vendedores', 'comision asesor y mostrador', 'venta en equipo'],
    summary: 'Liquidación equitativa cuando un asesor de campo capta la cuenta corporativa pero el cajero de mostrador atiende los despachos diarios.',
    steps: [
      {
        title: 'Activar la casilla "Venta Compartida" en el POS o cotización',
        instruction: 'Al crear la venta, marca la opción de comisión compartida.'
      },
      {
        title: 'Seleccionar los dos usuarios beneficiarios',
        instruction: 'Elige: Asesor Principal (ej: Vendedor de Campo) y Asesor Secundario (ej: Colorista de Mostrador).'
      },
      {
        title: 'Definir el porcentaje de distribución',
        instruction: 'Ingresa los porcentajes acordados (ej: 50% / 50% o 70% / 30%).'
      },
      {
        title: 'Verificar la liquidación automática',
        instruction: 'Al recaudarse el dinero, Avalon dispersará la comisión en las planillas de nómina de ambos empleados exactamente en la proporción pactada.',
        proTip: 'Esta modalidad elimina las disputas internas de "quién es el dueño del cliente" y fomenta un servicio impecable.'
      }
    ],
    contingency: 'Los porcentajes de comisión compartida quedan inmutables una vez la venta es timbrada fiscalmente.'
  },
  {
    id: 'ESC-CRM-50',
    title: '¿Cómo consultar el tablero de logros y comisiones proyectadas en el celular por cada asesor?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Vista móvil optimizada en SalesTeamProfiles donde cada vendedor consulta sus ventas, comisiones y ranking diario.',
    expectedResult: 'El asesor conoce en cualquier momento cuánto dinero lleva acumulado en comisiones y qué facturas faltan por cobrar.',
    route: '/sales-performance',
    routeLabel: 'Ver Mi Rendimiento Comercial',
    synonyms: ['ver mis comisiones', 'cuanto llevo ganado', 'tablero movil vendedor', 'comisiones celular', 'logros asesor'],
    summary: 'Autogestión y transparencia total para que cada miembro del equipo comercial audite sus ganancias en tiempo real.',
    steps: [
      {
        title: 'Ingresar a Avalon V1 desde el teléfono móvil',
        instruction: 'Abre el navegador del celular e inicia sesión con las credenciales personales de vendedor.'
      },
      {
        title: 'Abrir "Mi Panel de Ventas & Logros"',
        instruction: 'Toca la tarjeta de bienvenida superior.'
      },
      {
        title: 'Revisar las métricas personales:',
        instruction: '• Ventas Acumuladas del Mes ($)\n• Porcentaje de Cumplimiento de Meta (%)\n• Comisiones Ganadas Liquidadas ($)\n• Comisiones Pendientes por Cobrar de Cartera ($)\n• Posición en el Ranking de Ventas de la Empresa.'
      },
      {
        title: 'Ver la lista de clientes morosos a gestionar',
        instruction: 'Toca en "Comisiones por Cobrar" para ver la lista de facturas que si el cliente paga hoy, dispararán el pago de su comisión.',
        proTip: 'Tener esta lista en el bolsillo convierte a los vendedores en los mejores aliados de la cobranza diaria.'
      }
    ],
    contingency: 'Por seguridad, cada asesor solo puede visualizar sus propias comisiones y no las de sus compañeros de trabajo.'
  },
  {
    id: 'ESC-CRM-51',
    title: '¿Cómo auditar y congelar el periodo de comisiones mensual antes del pago de nómina?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Cerrar Periodo de Comisiones" congela los valores y emite el archivo de novedades de nómina para Contabilidad.',
    expectedResult: 'Las comisiones quedan selladas de forma inmutable evitando modificaciones posteriores tras el pago bancario.',
    route: '/comisiones-logros',
    routeLabel: 'Ir a Comisiones & Logros',
    synonyms: ['cerrar comisiones mes', 'congelar comisiones', 'auditoria comisiones nomina', 'archivo novedades nomina', 'cierre mensual comisiones'],
    summary: 'Paso obligatorio de cada fin de mes para aprobar oficialmente los pagos de incentivos y enviarlos a la liquidación de sueldos.',
    steps: [
      {
        title: 'Revisar la prenómina de comisiones con los supervisores',
        instruction: 'El Director Comercial y el Jefe de Cartera auditan la planilla verificando que no existan cobros atípicos.'
      },
      {
        title: 'Hacer clic en "Aprobar y Congelar Periodo"',
        instruction: 'En ComisionesLogros, presiona el botón de cierre mensual. El sistema solicitará la firma digital de aprobación.'
      },
      {
        title: 'Exportar el archivo plano de Novedades de Nómina',
        instruction: 'Descarga el archivo formateado (.xlsx o .csv) con las columnas: Cédula del empleado, Código de Novedad (Comisiones Comerciales) y Valor Neto.'
      },
      {
        title: 'Entregar a Gestión Humana para dispersión bancaria',
        instruction: 'Gestión Humana incorpora el archivo al software de nómina para el pago de la quincena.',
        warning: 'Una vez congelado el periodo, ningún ajuste posterior podrá alterar los valores pagados de ese mes.'
      }
    ],
    contingency: 'Cualquier reclamo o ajuste extemporáneo de un asesor se liquidará como ajuste retroactivo en la nómina del mes siguiente.'
  },
  {
    id: 'ESC-CRM-52',
    title: '¿Cómo liquidar comisiones para comisionistas o intermediarios comerciales externos independientes?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite liquidar honorarios a terceros con RUT exigiendo Cuenta de Cobro y retenciones tributarias (10% / 11%).',
    expectedResult: 'Se genera el comprobante de liquidación de corretaje comercial cumpliendo con la normatividad tributaria de la DIAN.',
    route: '/comisiones-logros',
    routeLabel: 'Ir a Comisiones & Logros',
    synonyms: ['comisionistas externos', 'intermediario comercial', 'honorarios comision', 'corretaje pintura', 'tercero comisiones'],
    summary: 'Remuneración a contratistas o ingenieros independientes que refieren contratos de pintura a Procoquinal SAS.',
    steps: [
      {
        title: 'Crear al comisionista externo como Tercero con RUT',
        instruction: 'En Gestión de Clientes, regístralo con tipo de tercero "Intermediario Comercial / Comisionista Externo".'
      },
      {
        title: 'Asociar el intermediario al contrato u obra específica',
        instruction: 'En la cotización, asigna el código del comisionista y el porcentaje acordado (ej: 2.5% sobre valor neto antes de IVA).'
      },
      {
        title: 'Generar la planilla de liquidación de intermediación',
        instruction: 'Al recaudarse el pago del cliente, Avalon calculará los honorarios brutos.'
      },
      {
        title: 'Exigir Cuenta de Cobro, RUT y pago de Seguridad Social',
        instruction: 'El comisionista debe radicar su cuenta de cobro adjuntando la planilla PILA de pago de salud y pensión.',
        warning: 'Por ley, Procoquinal debe aplicar Retención en la Fuente por Honorarios (10% o 11%) sobre el pago del intermediario independiente.'
      }
    ],
    contingency: 'Tesorería gira el valor neto por transferencia bancaria tras verificar el certificado de aportes parafiscales.'
  },
  {
    id: 'ESC-CRM-53',
    title: '¿Cómo generar el informe comparativo de ventas por asesor, margen aportado y ticket promedio?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo CrmDashboard y SalesPerformance compara volumen ($), margen bruto (%) y número de clientes atendidos.',
    expectedResult: 'La gerencia identifica con claridad a los asesores más rentables y detecta oportunidades de mejora.',
    route: '/sales-performance',
    routeLabel: 'Ir a Rendimiento de Ventas',
    synonyms: ['ranking vendedores', 'ticket promedio asesor', 'margen por vendedor', 'comparativa equipo comercial', 'productividad asesores'],
    summary: 'Evaluación de productividad comercial integral que mide no solo cuánto vende cada asesor, sino cuánta ganancia neta aporta.',
    steps: [
      {
        title: 'Acceder a "Ventas & Ingresos > Rendimiento Comercial"',
        instruction: 'Abre la pestaña "Análisis del Equipo de Ventas".'
      },
      {
        title: 'Seleccionar el periodo trimestral o mensual',
        instruction: 'Elige el rango de análisis comparativo.'
      },
      {
        title: 'Examinar los 4 pilares de productividad:',
        instruction: '1. Facturación Bruta Total ($).\n2. Margen Bruto Promedio Ponderado (%) (Meta > 32%).\n3. Ticket Promedio de Venta (Valor promedio por factura emitida).\n4. Número de Clientes Nuevos Captados en el Mes.'
      },
      {
        title: 'Identificar al Vendedor Más Rentable del Periodo',
        instruction: 'Avalon destacará al asesor con mejor combinación de volumen y margen, otorgándole la insignia de "Asesor Estrella".',
        proTip: 'Un vendedor que factura $80M con margen del 38% aporta más ganancia real a la empresa que uno que factura $100M con margen del 22%.'
      }
    ],
    contingency: 'Exporta los gráficos comparativos en PDF para proyectarlos en la pantalla de la sala de juntas durante el comité mensual.'
  },
  {
    id: 'ESC-CRM-54',
    title: '¿Cómo consultar las comisiones históricas pagadas en meses anteriores para reclamos o certificados?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Historial histórico inmutable en ComisionesLogros con desglose de facturas cobradas y comprobantes de nómina.',
    expectedResult: 'El asesor o el área contable obtiene el desglose exacto de cualquier mes de años previos en menos de 5 segundos.',
    route: '/comisiones-logros',
    routeLabel: 'Ir a Comisiones & Logros',
    synonyms: ['historico comisiones', 'comisiones meses pasados', 'certificado de comisiones', 'reclamo comision pasada', 'auditar comisiones viejas'],
    summary: 'Consulta de archivos de liquidación cerrados para expedición de certificados de ingresos o aclaración de dudas de nómina.',
    steps: [
      {
        title: 'Ingresar a Comisiones & Logros',
        instruction: 'Navega al módulo de comisiones comerciales.'
      },
      {
        title: 'Seleccionar la pestaña "Historial de Periodos Cerrados"',
        instruction: 'Elige el año y mes que se desea auditar (ej: Noviembre del año pasado).'
      },
      {
        title: 'Filtrar por el nombre del asesor comercial',
        instruction: 'Selecciona al empleado; se desplegará el acta de liquidación original tal como fue aprobada en esa fecha.'
      },
      {
        title: 'Descargar el Comprobante Oficial de Comisiones en PDF',
        instruction: 'Presiona "Descargar Soporte de Liquidación". El documento servirá para soporte bancario o declaración de renta del colaborador.',
        proTip: 'Los registros históricos no pueden ser editados ni alterados, garantizando total transparencia laboral.'
      }
    ],
    contingency: 'Si un empleado solicita certificación para crédito de vivienda, este informe certifica el promedio salarial variable de los últimos 6 meses.'
  },
  {
    id: 'ESC-CRM-55',
    title: '¿Cómo auditar anomalías o comisiones duplicadas por facturas cruzadas en el cierre de ventas?',
    module: 'CRM & Clientes',
    moduleId: 'crm',
    subtopic: 'Comisiones Comerciales & Metas',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Algoritmo de detección de inconsistencias que bloquea comisiones sobre facturas anuladas o duplicadas en auditoría.',
    expectedResult: 'Se previene el pago indebido de comisiones dobles protegiendo los recursos financieros de Procoquinal SAS.',
    route: '/comisiones-logros',
    routeLabel: 'Ir a Comisiones & Logros',
    synonyms: ['comision duplicada', 'error en comisiones', 'auditar comisiones', 'comision sobre factura anulada', 'inconsistencia comisiones'],
    summary: 'Auditoría preventiva de liquidaciones comerciales para detectar errores antes de autorizar la dispersión bancaria de sueldos.',
    steps: [
      {
        title: 'Ejecutar la "Auditoría de Inconsistencias de Liquidación"',
        instruction: 'En ComisionesLogros, presiona el botón de escudo "Auditar Errores de Comisiones".'
      },
      {
        title: 'Revisar las alertas generadas por el sistema:',
        instruction: '• Facturas con más de un vendedor asignado sin regla de Split activa.\n• Facturas que fueron anuladas mediante Nota Crédito pero cuyo recaudo figura activo.\n• Facturas que ya habían sido comisionadas en un corte de nómina anterior.'
      },
      {
        title: 'Corregir la partida anómala con un solo clic',
        instruction: 'Presiona "Subsanar y Recalcular". Avalon eliminará la duplicidad y ajustará la base de recaudo real.'
      },
      {
        title: 'Emitir el Certificado de Auditoría Limpia',
        instruction: 'El informe quedará sellado como "Auditado / Sin Discrepancias", listo para la firma del Revisor Fiscal.',
        warning: 'Pagar comisiones erróneas genera problemas de retención en la fuente y reclamos de nómina difíciles de recuperar.'
      }
    ],
    contingency: 'Si se detecta que un usuario manipuló manualmente la asignación de un cliente para apropiarse de comisiones ajenas, se remite a Control Interno.'
  }
];
