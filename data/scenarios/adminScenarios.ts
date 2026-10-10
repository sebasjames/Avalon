import { HumanScenario } from './types';

export const ADMIN_SCENARIOS: HumanScenario[] = [
  // =========================================================================
  // SUBTEMA 1: Usuarios, Roles & Seguridad (RBAC) (10 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CFG-01',
    title: '¿Cómo crear un nuevo usuario y asignarle credenciales de acceso iniciales?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal de Alta de Usuario genera credenciales únicas con hash seguro y solicita cambio en primer inicio.',
    expectedResult: 'El colaborador ingresa a Avalon con su usuario y contraseña temporal, visualizando solo las funciones de su cargo.',
    route: '/config',
    routeLabel: 'Ir a Configuración de Usuarios',
    synonyms: ['crear usuario nuevo', 'alta de empleado', 'nuevo acceso avalon', 'dar usuario colaborador', 'registrar usuario'],
    summary: 'Procedimiento formal para dar de alta a un nuevo miembro del equipo en el sistema con su perfil operativo asignado.',
    steps: [
      {
        title: 'Navegar a "Configuración > Usuarios del Sistema"',
        instruction: 'En el menú lateral de Avalon, haz clic en "Configuración" y selecciona la pestaña "Usuarios".'
      },
      {
        title: 'Hacer clic en "Nuevo Usuario"',
        instruction: 'Presiona el botón superior derecho "+ Nuevo Usuario" para abrir el formulario de registro.'
      },
      {
        title: 'Completar información básica del empleado',
        instruction: 'Digita: Nombre completo, Correo corporativo (@procoquinal.com), Cédula de ciudadanía, Cargo y Sucursal base.'
      },
      {
        title: 'Asignar Rol Funcional y contraseña temporal',
        instruction: 'Selecciona el rol correspondiente (ej: "Asesor Comercial", "Cajero POS", "Jefe de Producción") y genera una clave inicial.',
        proTip: 'Activa la casilla "Exigir cambio de contraseña en el primer inicio de sesión" para cumplir normas de seguridad de la información.'
      },
      {
        title: 'Guardar y entregar credenciales',
        instruction: 'Haz clic en "Guardar Usuario". Avalon enviará un correo de bienvenida con el enlace de acceso directo a la plataforma.'
      }
    ],
    contingency: 'Si el correo corporativo aún no está creado por TI, asigna el acceso con su cédula como identificador temporal.'
  },
  {
    id: 'ESC-CFG-02',
    title: '¿Cómo restringir accesos y roles (ej. Cajero sin acceso a Contabilidad ni Márgenes)?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Aplica RBAC estricto en Sidebar, rutas y componentes según el rol activo.',
    expectedResult: 'El usuario solo puede ver los módulos correspondientes a su perfil de trabajo; botones confidenciales quedan ocultos.',
    route: '/config',
    routeLabel: 'Ir a Configuración de Usuarios',
    synonyms: ['restringir accesos', 'quitar contabilidad cajero', 'bloquear modulo usuario', 'ocultar margen comercial', 'roles y permisos rbac'],
    summary: 'Administración de privilegios para proteger datos financieros, utilidades y fórmulas industriales confidenciales.',
    steps: [
      {
        title: 'Acceder a la lista de usuarios en Configuración',
        instruction: 'Localiza al usuario que requiere restricción en la tabla de personal activo.'
      },
      {
        title: 'Hacer clic en el botón de edición (Lápiz)',
        instruction: 'Abre la ficha del colaborador y selecciona la pestaña "Permisos y Restricciones".'
      },
      {
        title: 'Desmarcar módulos y funciones restringidas',
        instruction: 'Para un cajero o asesor de mostrador: desmarca "Módulo de Contabilidad", "Sábana Operativa", "Ver Costo Landed / Margen de Utilidad" y "Modificar Precios de Lista".',
        warning: 'Nunca otorgues privilegios de "Administrador General" a personal temporal, cajeros o personal en periodo de prueba.'
      },
      {
        title: 'Guardar cambios y actualizar permisos',
        instruction: 'Haz clic en "Actualizar Permisos". Los cambios se aplicarán de inmediato en la sesión activa del usuario.'
      }
    ],
    contingency: 'Si el usuario sigue viendo una pantalla restringida, indícale que presione Ctrl+F5 para refrescar la memoria local de la app.'
  },
  {
    id: 'ESC-CFG-03',
    title: '¿Cómo resetear la contraseña olvidada o desbloquear la cuenta de un colaborador?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Resetear Clave" genera enlace de recuperación seguro de un solo uso.',
    expectedResult: 'El colaborador recupera el acceso de inmediato sin tener que reiniciar ni reinstalar el sistema.',
    route: '/config',
    routeLabel: 'Ir a Usuarios',
    synonyms: ['olvido contraseña', 'resetear clave usuario', 'desbloquear cuenta empleado', 'cambiar clave cajero', 'recuperar password avalon'],
    summary: 'Desbloqueo rápido de usuarios que olvidaron su clave o fueron bloqueados tras 3 intentos fallidos consecutivos.',
    steps: [
      {
        title: 'Localizar al usuario bloqueado en Configuración',
        instruction: 'Filtra por nombre o cédula. Si la cuenta está bloqueada, verás una insignia roja de "BLOQUEADO POR INTENTOS".'
      },
      {
        title: 'Hacer clic en "Desbloquear y Resetear Clave"',
        instruction: 'Selecciona la opción en el menú de acciones rápidas del usuario.'
      },
      {
        title: 'Confirmar el método de entrega de la nueva clave',
        instruction: 'Elige entre "Enviar enlace temporal al correo del empleado" o "Generar clave provisional en pantalla" (ej: Procoquinal2026*).'
      },
      {
        title: 'Entregar la clave y verificar ingreso',
        instruction: 'El colaborador inicia sesión con la clave temporal y el sistema le exige definir una nueva contraseña de 8 dígitos.',
        proTip: 'Verifica la identidad física o telefónica del empleado antes de resetear cualquier clave de acceso con permisos financieros.'
      }
    ],
    contingency: 'Si el colaborador está en otra ciudad, envíale el código temporal por WhatsApp verificado de la empresa.'
  },
  {
    id: 'ESC-CFG-04',
    title: '¿Cómo desactivar o archivar a un usuario que se retiró de la empresa sin perder su historial?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Desactiva el acceso inmediatamente preservando facturas, cotizaciones y registros históricos inmutables.',
    expectedResult: 'El ex-empleado no puede iniciar sesión, pero todas sus ventas y notas de Kárdex permanecen intactas para auditoría.',
    route: '/config',
    routeLabel: 'Ir a Gestión de Usuarios',
    synonyms: ['desactivar usuario retiro', 'dar de baja empleado', 'bloquear acceso renunció', 'archivar usuario avalon', 'revocar acceso personal'],
    summary: 'Bloqueo seguro de cuentas al finalizar el vínculo laboral, manteniendo la integridad histórica contable y comercial.',
    steps: [
      {
        title: 'Abrir el registro del colaborador saliente',
        instruction: 'En "Configuración > Usuarios", busca la cuenta de la persona que se desvincula de Procoquinal.'
      },
      {
        title: 'Cambiar el estado de "ACTIVO" a "INACTIVO / RETIRADO"',
        instruction: 'Haz clic en el selector de estado. Nunca presiones "Eliminar Fila" para no romper relaciones de base de datos.'
      },
      {
        title: 'Forzar cierre de sesiones activas concurrentes',
        instruction: 'Marca la casilla "Cerrar todas las sesiones abiertas en navegadores y dispositivos móviles".'
      },
      {
        title: 'Reasignar su cartera de clientes a otro asesor comercial',
        instruction: 'Avalon mostrará una ventana emergente preguntando: "¿Deseas transferir los 45 clientes asignados a otro vendedor?". Selecciona el nuevo responsable.',
        warning: 'Nunca dejes clientes sin vendedor asignado para evitar que queden huérfanos sin seguimiento comercial.'
      },
      {
        title: 'Guardar la desvinculación',
        instruction: 'Confirma con tu clave de Administrador para registrar el evento en la Bitácora de Auditoría.'
      }
    ],
    contingency: 'Si el retiro fue imprevisto y urgente, ejecuta el bloqueo de inmediato desde cualquier celular con acceso de Administrador.'
  },
  {
    id: 'ESC-CFG-05',
    title: '¿Cómo crear o editar un perfil de rol personalizado con permisos granulares?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Matriz de permisos por checkbox permite crear roles específicos como "Auxiliar de Tintometría" o "Auditor de Inventario".',
    expectedResult: 'Se crea una plantilla de rol reutilizable que se puede asignar a múltiples trabajadores simultáneamente.',
    route: '/config',
    routeLabel: 'Ir a Roles & Permisos',
    synonyms: ['crear nuevo rol', 'perfil personalizado permisos', 'rol auxiliar tintometria', 'configurar privilegios matriz', 'matriz rbac'],
    summary: 'Definición de roles a la medida para puestos con responsabilidades mixtas (ej: bodega que apoya mostrador).',
    steps: [
      {
        title: 'Entrar a "Configuración > Perfiles y Roles"',
        instruction: 'Haz clic en la pestaña "Roles y Perfiles" para ver la lista de roles maestros del sistema.'
      },
      {
        title: 'Hacer clic en "+ Crear Nuevo Perfil de Rol"',
        instruction: 'Asigna un nombre descriptivo (ej: "Supervisor de Planta & Tintometría") y una descripción del alcance.'
      },
      {
        title: 'Marcar la matriz de permisos por módulo:',
        instruction: '• Producción & Mezclas: Crear fórmulas, Ver costos de resinas, Enviar orden a taller.\n• Inventario: Ver stock físico, Bloquear ajuste manual.\n• Ventas & POS: Sin acceso.\n• Contabilidad: Sin acceso.'
      },
      {
        title: 'Guardar la plantilla de rol',
        instruction: 'Haz clic en "Guardar Perfil". Ahora este rol aparecerá en el menú desplegable al crear o editar cualquier usuario.',
        proTip: 'Crear roles por funciones evita tener que configurar permisos individuales usuario por usuario.'
      }
    ],
    contingency: 'Si tienes dudas sobre qué permisos asignar, consulta con Scarpian AI para auditar que no otorgues privilegios de riesgo.'
  },
  {
    id: 'ESC-CFG-06',
    title: '¿Cómo limitar a un vendedor para que solo vea los clientes y cotizaciones de su cartera?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Flag `strict_salesperson_scope` filtra vistas de CRM, Pipeline y Cotizaciones en tiempo real.',
    expectedResult: 'El asesor comercial solo tiene acceso visual a sus cuentas asignadas, evitando canibalización de prospectos entre el equipo.',
    route: '/config',
    routeLabel: 'Ir a Configuración de Usuarios',
    synonyms: ['restringir clientes vendedor', 'privacidad de cartera comercial', 'vendedor solo sus clientes', 'ocultar cotizaciones otros asesores', 'blindar prospectos'],
    summary: 'Aislamiento de cartera comercial para mantener la sana competencia y privacidad de negociaciones entre ejecutivos.',
    steps: [
      {
        title: 'Abrir la ficha del asesor en Configuración > Usuarios',
        instruction: 'Selecciona al comercial de la lista.'
      },
      {
        title: 'Activar la casilla "Aislamiento Estricto de Cartera"',
        instruction: 'En la sección CRM, activa el switch: "Restringir visualización únicamente a Clientes Asignados".'
      },
      {
        title: 'Definir permisos sobre clientes no asignados',
        instruction: 'Configura si el asesor puede "Crear nuevos clientes libres" pero no consultar los prospectos asignados a sus compañeros.'
      },
      {
        title: 'Guardar configuración',
        instruction: 'Al iniciar sesión, el vendedor verá en su CRM únicamente sus 60 empresas y sus tratos activos del Pipeline.',
        proTip: 'El Gerente Comercial y el Administrador conservan siempre la vista consolidada 360° de toda la fuerza de ventas.'
      }
    ],
    contingency: 'Si dos asesores atienden al mismo grupo empresarial, asígnales permiso de "Cuentas Compartidas" en la ficha del cliente.'
  },
  {
    id: 'ESC-CFG-07',
    title: '¿Cómo asignar sucursales o bodegas autorizadas a un usuario específico?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Restringe el selector de bodega en POS e Inventario a las ubicaciones autorizadas del usuario.',
    expectedResult: 'El cajero o bodeguero de la Sede Paloquemao no puede facturar ni mover inventario de la Sede Soacha por error.',
    route: '/config',
    routeLabel: 'Ir a Sucursales y Usuarios',
    synonyms: ['asignar bodega usuario', 'restringir sucursal cajero', 'usuario solo bodega principal', 'bloquear sedes avalon', 'control multisede'],
    summary: 'Segmentación geográfica de operaciones para evitar cruces indebidos de stock entre almacenes físicos.',
    steps: [
      {
        title: 'Acceder al usuario en Configuración',
        instruction: 'Abre la pestaña "Ubicaciones y Bodegas Autorizadas".'
      },
      {
        title: 'Seleccionar la Sede Principal y Bodegas Permitidas',
        instruction: 'Marca únicamente las bodegas donde labora físicamente el usuario (ej: "Bodega 01 - Principal Bogotá"). Desmarca bodegas satélite.'
      },
      {
        title: 'Definir política de traslados',
        instruction: 'Especifica si el usuario puede "Recibir traslados provenientes de otras sedes" pero no "Despachar a otras sedes" sin autorización.'
      },
      {
        title: 'Confirmar y guardar',
        instruction: 'En los módulos de POS e Inventario, el selector de bodega quedará fijado automáticamente en su sede asignada.'
      }
    ],
    contingency: 'Si un empleado cubre un turno de emergencia en otra sucursal, el Administrador puede activar la sede secundaria en 10 segundos.'
  },
  {
    id: 'ESC-CFG-08',
    title: '¿Cómo forzar el cierre de sesiones activas abiertas en otros equipos o celulares?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Cerrar Todas las Sesiones" invalida los tokens JWT concurrentes en todos los clientes.',
    expectedResult: 'Cualquier ventana o app móvil abierta con esa cuenta queda desconectada de inmediato solicitando login.',
    route: '/config',
    routeLabel: 'Ir a Sesiones Activas',
    synonyms: ['cerrar sesiones remotas', 'desconectar cuenta abierta otro pc', 'cerrar sesion forzada', 'revocar tokens login', 'cerrar sesión en tablet'],
    summary: 'Procedimiento de seguridad si un trabajador dejó abierta su sesión en un computador público o perdió su teléfono móvil.',
    steps: [
      {
        title: 'Entrar a "Configuración > Seguridad & Sesiones"',
        instruction: 'Ve a la lista de "Sesiones Activas Concurrentes".'
      },
      {
        title: 'Identificar la sesión sospechosa o huérfana',
        instruction: 'El sistema muestra: Dispositivo (Chrome Windows / Móvil Android), Dirección IP, Ubicación aproximada y Hora de última actividad.'
      },
      {
        title: 'Hacer clic en "Cerrar Sesión Remota"',
        instruction: 'Presiona el ícono rojo de desconexión junto al dispositivo que deseas expulsar.'
      },
      {
        title: 'O bien, presionar "Cerrar TODAS las sesiones de este usuario"',
        instruction: 'Avalon invalidará las credenciales en caché exigiendo ingreso manual con contraseña nueva.',
        warning: 'Recomienda al colaborador cambiar su contraseña inmediatamente si sospecha que su clave fue vulnerada.'
      }
    ],
    contingency: 'En caso de robo de equipo de cómputo, inhabilita al usuario completamente (ESC-CFG-04) antes de cerrar las sesiones.'
  },
  {
    id: 'ESC-CFG-09',
    title: '¿Cómo configurar la expiración automática de sesión por inactividad (seguridad en mostrador)?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Temporizador de inactividad configurable (15 min, 30 min, 1 hora) bloquea la pantalla en POS y Cajas.',
    expectedResult: 'Si el cajero se levanta del puesto, la pantalla se bloquea automáticamente exigiendo PIN para evitar ventas no autorizadas.',
    route: '/config',
    routeLabel: 'Ir a Políticas de Seguridad',
    synonyms: ['tiempo inactividad bloqueo', 'auto bloqueo de pantalla', 'bloqueo automatico caja', 'cerrar sesion inactiva', 'timeout sesion pos'],
    summary: 'Protección perimetral del punto de venta para evitar que terceras personas manipulen la caja en ausencia del titular.',
    steps: [
      {
        title: 'Abrir "Configuración > Parámetros de Seguridad"',
        instruction: 'Localiza la sección "Políticas de Sesión & Bloqueo".'
      },
      {
        title: 'Definir el tiempo límite de inactividad',
        instruction: 'Selecciona el umbral recomendado para puntos de venta: "15 minutos sin interacción de mouse o teclado".'
      },
      {
        title: 'Configurar el método de desbloqueo rápido',
        instruction: 'Elige si al expirar el tiempo el cajero puede reingresar con un "PIN numérico de 4 dígitos" o si debe digitar la contraseña completa.'
      },
      {
        title: 'Guardar la directiva global',
        instruction: 'La política se aplicará a todas las terminales de mostrador de Procoquinal en el siguiente ciclo de sincronización.',
        proTip: 'El desbloqueo por PIN ahorra tiempo en mostrador mientras mantiene el registro individual de quién realizó cada venta.'
      }
    ],
    contingency: 'Si el cajero olvida su PIN rápido, puede hacer clic en "Ingresar con Contraseña Completa" para restaurarlo.'
  },
  {
    id: 'ESC-CFG-10',
    title: '¿Cómo auditar los intentos fallidos de inicio de sesión o bloqueos por contraseña errónea?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Usuarios, Roles & Seguridad (RBAC)',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Log de autenticación registra IP, fecha, hora y usuario ante cada intento fallido.',
    expectedResult: 'El Oficial de Seguridad identifica si alguien está intentando adivinar contraseñas de cuentas administrativas.',
    route: '/config',
    routeLabel: 'Ir a Logs de Seguridad',
    synonyms: ['intentos fallidos login', 'ataque contraseña auditoria', 'quien intento entrar avalon', 'bloqueos por clave errada', 'seguridad accesos'],
    summary: 'Supervisión de eventos de autenticación sospechosos para prevenir accesos no autorizados al sistema.',
    steps: [
      {
        title: 'Acceder a "Configuración > Auditoría & Seguridad > Intentos de Acceso"',
        instruction: 'Abre la pestaña de registros de inicio de sesión.'
      },
      {
        title: 'Filtrar por eventos con estado "FALLIDO / BLOQUEADO"',
        instruction: 'El sistema listará los intentos rechazados resaltando en rojo las cuentas con más de 3 fallos seguidos.'
      },
      {
        title: 'Inspeccionar la dirección IP y la hora de los intentos',
        instruction: 'Revisa si los intentos provienen de una IP interna de la empresa o de una ubicación geográfica extraña.'
      },
      {
        title: 'Tomar medidas preventivas si se detecta anomalía',
        instruction: 'Si los intentos son reiterados sobre la cuenta de Gerencia o Contabilidad, bloquea la IP origen y fuerza cambio de clave preventivo.',
        warning: 'Cualquier patrón de más de 5 intentos fallidos a medianoche debe ser reportado inmediatamente a Scarpian AI.'
      }
    ],
    contingency: 'Puedes activar la lista blanca de IPs para que Avalon solo permita inicios de sesión desde las conexiones de red de Procoquinal.'
  },

  // =========================================================================
  // SUBTEMA 2: Matriz de Comisiones, Metas & Liquidación Staff (10 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CFG-11',
    title: '¿Cómo modificar la tabla de porcentajes de comisión por categoría de producto o margen?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Tabla matricial en `/comisiones-matrix` permite configurar comisiones por línea (Pinturas, Resinas, Accesorios) y margen de rentabilidad.',
    expectedResult: 'El motor recalcula la comisión proyectada en cada cotización y venta respetando las nuevas reglas comerciales.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Matriz de Comisiones',
    synonyms: ['modificar tabla comisiones', 'cambiar porcentajes comision', 'comision por margen de utilidad', 'matriz comisiones vendedor', 'reglas comision procoquinal'],
    summary: 'Ajuste de las reglas de incentivos para premiar la venta de productos con mayor margen de ganancia líquida.',
    steps: [
      {
        title: 'Navegar a "Gestión Comercial > Matriz de Comisiones"',
        instruction: 'Accede a la pantalla de configuración de comisiones (/comisiones-matrix).'
      },
      {
        title: 'Seleccionar la Línea o Categoría a modificar',
        instruction: 'Elige entre: "Pinturas Industriales & Esmaltes", "Resinas Poliéster & Químicos", "Thinner & Solventes" o "Accesorios y Brochas".'
      },
      {
        title: 'Ajustar la escala de comisiones según margen bruto obtenido:',
        instruction: '• Margen >= 35%: 3.0% de comisión.\n• Margen 25% a 34%: 2.0% de comisión.\n• Margen 18% a 24%: 1.0% de comisión.\n• Margen < 18%: 0% de comisión (sin incentivo).'
      },
      {
        title: 'Establecer fecha de entrada en vigencia',
        instruction: 'Define si la nueva tabla aplica a partir del primer día del próximo mes o con vigencia inmediata.',
        warning: 'Nunca modifiques la tabla de comisiones en mitad de una quincena sin previa notificación firmada con el equipo de ventas.'
      },
      {
        title: 'Guardar y certificar con clave de Gerencia',
        instruction: 'Haz clic en "Aplicar Nueva Matriz de Comisiones" para actualizar las fórmulas del sistema.'
      }
    ],
    contingency: 'Las facturas ya emitidas bajo la tabla anterior conservarán su cálculo histórico inmutable para evitar reclamos laborales.'
  },
  {
    id: 'ESC-CFG-12',
    title: '¿Qué hacer si un asesor comercial no alcanzó el umbral mínimo de ventas del mes (comisión cero)?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Regla de umbral mínimo (ej: 80% de la cuota mensual) congela la liquidación hasta alcanzar la meta base.',
    expectedResult: 'El sistema genera la liquidación en cero comisiones informando claramente el porcentaje alcanzado frente al presupuesto.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Liquidación de Comisiones',
    synonyms: ['no cumplio umbral comisiones', 'meta minima no alcanzada', 'vendedor no llego a la cuota', 'comision cero por bajo cumplimiento', 'umbral ventas minimo'],
    summary: 'Aplicación automática de las condiciones contractuales cuando un vendedor no alcanza el piso mínimo de facturación mensual.',
    steps: [
      {
        title: 'Abrir el reporte de liquidación del asesor',
        instruction: 'En "Gestión Comercial > Liquidación de Comisiones", consulta el período mensual del asesor.'
      },
      {
        title: 'Verificar el cumplimiento frente a la meta fijada',
        instruction: 'El sistema muestra: Meta Asignada: $50.000.000 | Ventas Logradas: $34.000.000 | Cumplimiento: 68% (Umbral mínimo exigido: 80%).'
      },
      {
        title: 'Revisar la alerta visual en el volante de comisiones',
        instruction: 'Avalon marcará el estado como "NO APLICA POR DEBAJO DEL UMBRAL (68% < 80%)". El total a liquidar quedará en $0.'
      },
      {
        title: 'Evaluar excepción gerencial si aplica:',
        instruction: 'Si Gerencia autoriza liquidar proporcionalmente por tratarse de un asesor nuevo en inducción, haz clic en "Autorizar Excepción Gerencial", digita el motivo y el porcentaje acordado.',
        proTip: 'Todas las excepciones gerenciales quedan registradas en la Bitácora de Auditoría con fecha y usuario que autorizó.'
      }
    ],
    contingency: 'Si el asesor alega que un cliente pagó el último día pero el banco no acreditó a tiempo, revisa el escenario ESC-CFG-14.'
  },
  {
    id: 'ESC-CFG-13',
    title: '¿Cómo liquidar las comisiones quincenales o mensuales de toda la fuerza de ventas para nómina?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Ejecutar Cierre de Comisiones" consolida todas las facturas cobradas del ciclo y genera resumen exportable a Excel.',
    expectedResult: 'El departamento de Recursos Humanos / Nómina recibe el archivo con el valor exacto a pagar a cada comercial sin tachaduras ni reprocesos.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Cierre de Comisiones',
    synonyms: ['liquidar comisiones quincena', 'cierre mensual comisiones', 'exportar comisiones nómina', 'calcular pago vendedores', 'reporte comisiones contabilidad'],
    summary: 'Procedimiento formal de corte y aprobación de comisiones comerciales para su pago en la nómina quincenal o mensual.',
    steps: [
      {
        title: 'Verificar que todos los recaudos del período estén ingresados',
        instruction: 'Antes de liquidar, confirma con Cartera que todos los recibos de caja hasta el día de corte estén aplicados en el sistema.'
      },
      {
        title: 'Acceder a "Cierre y Liquidación de Comisiones"',
        instruction: 'Selecciona el rango de fechas (ej: 01 al 15 de Octubre de 2026).'
      },
      {
        title: 'Presionar "Calcular Liquidación Masiva"',
        instruction: 'Avalon procesará las ventas y recaudos de cada comercial, aplicando umbrales, descuentos por mora y comisiones por línea.'
      },
      {
        title: 'Auditar la tabla previa de resultados',
        instruction: 'Verifica los totales por vendedor: Venta Neta, Recaudo Aplicado, Porcentaje Efectivo y Total Comisión a Pagar.'
      },
      {
        title: 'Aprobar Cierre y Exportar a Excel',
        instruction: 'Haz clic en "Aprobar Cierre de Comisiones". Se descargará el reporte formal para nómina y el período quedará congelado.',
        warning: 'Una vez aprobado el cierre, las facturas liquidadas quedan bloqueadas para no volver a comisionar en el siguiente ciclo.'
      }
    ],
    contingency: 'Si se detecta un error de digitación después de cerrar, utiliza la función de "Ajuste Manual en Siguiente Ciclo" (ESC-CFG-19).'
  },
  {
    id: 'ESC-CFG-14',
    title: '¿Cómo configurar el pago de comisiones sobre Recaudo Real Efectivo vs. Venta Facturada?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Conmutador de política comercial permite comisionar contra factura emitida o contra pago real en banco.',
    expectedResult: 'El sistema incentiva a los vendedores a cobrar su cartera, protegiendo el flujo de caja de Procoquinal.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Políticas de Comisión',
    synonyms: ['comision sobre recaudo real', 'comision sobre factura vs pago', 'politica de cartera comisiones', 'incentivo por cobro cartera', 'comision cuando el cliente pague'],
    summary: 'Configuración del modelo de comisiones basado en el recaudo bancario real para evitar pagar incentivos sobre facturas incobrables.',
    steps: [
      {
        title: 'Acceder a "Configuración > Parámetros Comerciales"',
        instruction: 'Localiza la sección "Criterio de Disparo de Comisiones".'
      },
      {
        title: 'Seleccionar la modalidad oficial de la empresa:',
        instruction: '• Opción A (Recomendada): "Sobre Recaudo Real Efectivo" (La comisión se liquida cuando el cliente paga la factura en banco o caja).\n• Opción B: "Sobre Venta Facturada" (Se liquida al emitir la factura, pero con riesgo de cartera).'
      },
      {
        title: 'Definir el tratamiento de anticipos',
        instruction: 'Configura si los anticipos recibidos comisionan inmediatamente o solo al emitir la factura definitiva del despacho.'
      },
      {
        title: 'Guardar la política empresarial',
        instruction: 'Avalon asociará cada peso de comisión al número de Recibo de Caja correspondiente para total transparencia.',
        proTip: 'Comisionar sobre recaudo real reduce la cartera vencida a más de 30 días en más de un 45%.'
      }
    ],
    contingency: 'Para vendedores de mostrador POS donde la venta es de contado inmediato, ambos métodos coinciden en tiempo real.'
  },
  {
    id: 'ESC-CFG-15',
    title: '¿Cómo penalizar o descontar comisión si una factura entra en mora superior a 60 días?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Regla de degradación de comisión por días de mora descuenta puntos porcentuales según antigüedad del saldo.',
    expectedResult: 'Se desincentivan las ventas a clientes morosos y se motiva la gestión activa de cobranza por parte del comercial.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Reglas de Mora en Comisiones',
    synonyms: ['penalizacion por mora comisiones', 'descuento comision cartera vencida', 'degradacion comision 60 dias', 'castigo factura morosa comision', 'mora cartera vendedor'],
    summary: 'Escala de penalización que reduce el porcentaje de comisión si el cliente se retrasa en el pago de sus facturas a crédito.',
    steps: [
      {
        title: 'Abrir "Parámetros de Comisiones > Reglas de Cartera"',
        instruction: 'Activa la directiva "Degradación de Comisión por Días de Mora".'
      },
      {
        title: 'Configurar los tramos de penalización:',
        instruction: '• Pago de 1 a 30 días: 100% de la comisión pactada (sin descuento).\n• Pago de 31 a 45 días: 75% de la comisión pactada (castigo del 25%).\n• Pago de 46 a 60 días: 50% de la comisión pactada (castigo del 50%).\n• Pago a más de 60 días: 0% de comisión (pasa a gestión jurídica de cobro).'
      },
      {
        title: 'Notificar automáticamente al comercial',
        instruction: 'El sistema enviará una alerta al asesor 5 días antes de que una factura cumpla 45 y 60 días para que gestione el recaudo urgente.'
      },
      {
        title: 'Guardar parámetros',
        instruction: 'La liquidación quincenal aplicará automáticamente el factor reductor al momento de conciliar el recibo de pago.'
      }
    ],
    contingency: 'Si la mora fue causada por una reclamación técnica justificada de Procoquinal, Gerencia puede exonerar la penalización.'
  },
  {
    id: 'ESC-CFG-16',
    title: '¿Cómo asignar comisiones compartidas entre dos asesores para una cuenta corporativa?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: División porcentual de orden (ej: 50%-50% o 70%-30%) divide el crédito de venta y la comisión entre dos ejecutivos.',
    expectedResult: 'Ambos comerciales reciben su parte justa en la liquidación sin duplicar el costo de comisiones para la empresa.',
    route: '/crm',
    routeLabel: 'Ir a CRM / Cuentas',
    synonyms: ['comision compartida dos vendedores', 'dividir venta dos comerciales', 'comision cuenta corporativa mixta', 'co-asesores venta', 'split comisiones avalon'],
    summary: 'Manejo equitativo cuando un comercial consigue la cuenta pero otro asesor técnico realiza la formulación y acompañamiento en obra.',
    steps: [
      {
        title: 'Abrir la cotización o pedido en el CRM',
        instruction: 'En la cabecera de la orden, localiza el campo "Asesor Comercial Asignado".'
      },
      {
        title: 'Hacer clic en "Agregar Co-Asesor / Comisión Compartida"',
        instruction: 'Selecciona al segundo comercial de la lista desplegable.'
      },
      {
        title: 'Definir el porcentaje de participación',
        instruction: 'Ingresa los porcentajes acordados (ej: 50% Asesor Comercial / 50% Asesor Técnico de Tintometría). La suma debe ser exactamente 100%.'
      },
      {
        title: 'Guardar la orden de venta',
        instruction: 'Al facturar y recaudar, Avalon dividirá el valor de la comisión y el cumplimiento de meta proporcionalmente entre ambos asesores.',
        proTip: 'Esta práctica fomenta el trabajo en equipo en ventas técnicas complejas de resinas y epóxicos industriales.'
      }
    ],
    contingency: 'Si surge una disputa entre asesores sobre los porcentajes, el Gerente Comercial tiene la potestad de laudar y fijar el ratio definitivo.'
  },
  {
    id: 'ESC-CFG-17',
    title: '¿Cómo configurar metas comerciales escalonadas (aceleradores por 100%, 120%, 150%)?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Motor de incentivos escalonados premia el sobrecumplimiento con multiplicadores de comisión adicionales.',
    expectedResult: 'Los comerciales que superan su presupuesto reciben un porcentaje superior sobre las ventas excedentes.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Metas y Aceleradores',
    synonyms: ['acelerador de comisiones', 'escalon de ventas meta', 'premio sobrecumplimiento 120%', 'bono meta superada', 'escalas comerciales'],
    summary: 'Estructuración de planes de compensación agresivos para motivar la superación de las metas presupuestales de Procoquinal.',
    steps: [
      {
        title: 'Ir a "Matriz de Comisiones > Aceleradores de Cumplimiento"',
        instruction: 'Activa la pestaña de incentivos adicionales por meta.'
      },
      {
        title: 'Configurar los multiplicadores por tramo de cumplimiento:',
        instruction: '• Cumplimiento del 100% al 119%: Comisión estándar + Bono fijo de $500.000.\n• Cumplimiento del 120% al 139%: Factor multiplicador 1.25x sobre las comisiones del excedente.\n• Cumplimiento del 140% o más: Factor multiplicador 1.50x sobre las comisiones del excedente.'
      },
      {
        title: 'Asignar el presupuesto del mes a cada vendedor',
        instruction: 'Ingresa el valor monetario base asignado a cada asesor en su perfil de ventas (ej: Don Jorge: $60.000.000).'
      },
      {
        title: 'Guardar la política',
        instruction: 'El tablero de control del comercial mostrará una barra de progreso en vivo indicando a cuánto está del siguiente acelerador.'
      }
    ],
    contingency: 'Los aceleradores solo se liquidan sobre cartera cobrada dentro del plazo pactado; no aplican sobre cuentas morosas.'
  },
  {
    id: 'ESC-CFG-18',
    title: '¿Cómo emitir y exportar el volante de liquidación de comisiones detallado por factura para nómina?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera PDF individual con desglose de cada factura cobrada, base liquidable, retención y neto a pagar.',
    expectedResult: 'El asesor comercial recibe su extracto detallado con total claridad de cuentas, evitando reclamos infundados.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Reportes de Liquidación',
    synonyms: ['volante comisiones pdf', 'desglose comisiones por factura', 'extracto liquidacion vendedor', 'comprobante pago comisiones', 'detalle nómina comision'],
    summary: 'Generación del comprobante oficial de comisiones para firma del trabajador y archivo contable.',
    steps: [
      {
        title: 'Localizar el período liquidado del comercial',
        instruction: 'En "Cierre de Comisiones", haz clic en el nombre del asesor (ej: "Ver Detalle - Luis Gómez").'
      },
      {
        title: 'Revisar el desglose factura por factura',
        instruction: 'El informe muestra: Número de Factura, Cliente, Fecha de Pago, Días de Cartera, Margen Bruto, Porcentaje Aplicado y Valor en Pesos.'
      },
      {
        title: 'Hacer clic en "Exportar Volante Individual (PDF)"',
        instruction: 'Avalon genera el documento formal con membrete de Procoquinal SAS, espacio para firma de Gerencia y firma del asesor.'
      },
      {
        title: 'Enviar copia digital al correo del empleado',
        instruction: 'Presiona "Enviar por Email" para que el asesor pueda revisar sus números antes del pago de la quincena.',
        proTip: 'Entregar volantes detallados con fórmula transparente elimina el 95% de las discusiones comerciales sobre nómina.'
      }
    ],
    contingency: 'Si el empleado tiene dudas sobre una factura en particular, el PDF incluye el enlace directo para auditar el recibo de caja.'
  },
  {
    id: 'ESC-CFG-19',
    title: '¿Cómo registrar un ajuste manual o bonificación especial aprobada por Gerencia General?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal "Ajuste Manual de Comisión" permite sumar o restar valores justificando la causal contable obligatoria.',
    expectedResult: 'Se aplica el ajuste en la liquidación del comercial dejando constancia inmutable en la bitácora de auditoría.',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Ajustes de Comisión',
    synonyms: ['ajuste manual comision', 'bono especial gerencia', 'descuento extraordinario vendedor', 'corregir liquidacion comisiones', 'premio extraordinario ventas'],
    summary: 'Inclusión de reconocimientos extraordinarios, correcciones de períodos anteriores o descuentos por anticipos concedidos.',
    steps: [
      {
        title: 'Abrir la liquidación activa del asesor en cuestión',
        instruction: 'Haz clic en el botón "+ Agregar Ajuste Manual / Novedad".'
      },
      {
        title: 'Seleccionar el tipo de ajuste:',
        instruction: '• "Crédito a Favor (Suma)": Bonificación por concurso de ventas, corrección de factura omitida, o auxilio especial.\n• "Débito en Contra (Resta)": Descuento por anticipo de comisiones previo, penalización por daño de muestras, etc.'
      },
      {
        title: 'Digitar el valor monetario y la justificación detallada',
        instruction: 'Ingresa: Valor: $300.000 | Concepto: "Bono especial autorizado por Gerencia por apertura de cuenta Ferretería El Progreso".'
      },
      {
        title: 'Adjuntar número de acta o autorización',
        instruction: 'Digita el código de aprobación de Gerencia General y haz clic en "Aplicar Ajuste".',
        warning: 'Los ajustes manuales sin causal clara son observados en las auditorías de control interno.'
      }
    ],
    contingency: 'Si el ajuste fue digitado con valor erróneo, anúlalo antes de aprobar el cierre de nómina definitivo.'
  },
  {
    id: 'ESC-CFG-20',
    title: '¿Cómo auditar discrepancias entre las ventas reportadas en POS/CRM y la matriz de comisiones?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Matriz de Comisiones & Liquidación Staff',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Herramienta de conciliación cruza facturación total vs. facturación comisionada identificando ítems excluidos.',
    expectedResult: 'Se explica con exactitud al vendedor por qué ciertas facturas no generaron comisión (ej: ventas a precio de costo, notas crédito o mora).',
    route: '/comisiones-matrix',
    routeLabel: 'Ir a Conciliador de Comisiones',
    synonyms: ['auditar discrepancia comisiones', 'por que no comisiono esta factura', 'reclamo comision vendedor', 'diferencia ventas y liquidacion', 'revisar calculo comisiones'],
    summary: 'Mecanismo de diagnóstico para resolver reclamos de asesores que reclaman que vendieron más de lo que les aparece liquidado.',
    steps: [
      {
        title: 'Acceder a "Herramientas > Conciliador de Ventas vs. Comisiones"',
        instruction: 'Digita el número de cédula del asesor y el mes a auditar.'
      },
      {
        title: 'Ejecutar el diagnóstico automático de Avalon',
        instruction: 'El sistema contrastará todas las facturas donde el asesor figura como responsable contra la base liquidada.'
      },
      {
        title: 'Analizar las razones de exclusión de facturas:',
        instruction: '• Razón 1: Factura aún no pagada por el cliente (Cartera pendiente).\n• Razón 2: Producto vendido con margen inferior al 18% (Excluido por matriz).\n• Razón 3: La factura tuvo una Nota Crédito por devolución total del producto.\n• Razón 4: El pago entró con fecha posterior al día de corte de la quincena.'
      },
      {
        title: 'Generar reporte de conciliación y entregarlo al comercial',
        instruction: 'El informe muestra con claridad absoluta la justificación matemática de cada peso liquidado.',
        proTip: 'Esta herramienta ahorra horas de reuniones tensas entre Gerencia y el equipo comercial.'
      }
    ],
    contingency: 'Si efectivamente hubo una factura cobrada que no se asoció al asesor, reasígnala desde el módulo de Cartera con un solo clic.'
  },

  // =========================================================================
  // SUBTEMA 3: Gobernanza, Auditoría & Bitácora de Eventos (10 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CFG-21',
    title: '¿Cómo rastrear quién borró, anuló o modificó un registro en la Bitácora de Eventos inmutable?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bitácora de auditoría en `/intelligence` y `/governance` almacena cada acción crítica con timestamp, IP, usuario y valor anterior vs nuevo.',
    expectedResult: 'Se identifica con precisión forense quién realizó la modificación sensible y en qué fecha y segundo exacto.',
    route: '/governance',
    routeLabel: 'Ir a Bitácora de Eventos',
    synonyms: ['quien borro registro', 'rastrear cambios bitacora', 'auditoria de eventos inmutable', 'log de modificaciones avalon', 'investigar quien anulo'],
    summary: 'Rastreo forense inmutable de todas las transacciones de borrado, anulación o ajuste realizadas en la plataforma.',
    steps: [
      {
        title: 'Navegar a "Gobernanza & Control > Bitácora de Auditoría"',
        instruction: 'Accede al módulo de auditoría (/governance o /intelligence).'
      },
      {
        title: 'Filtrar por Tipo de Acción Crítica',
        instruction: 'Selecciona en el filtro: "ANULACIÓN", "ELIMINACIÓN DE PRODUCTO", "CAMBIO DE PRECIO" o "AJUSTE DE KÁRDEX".'
      },
      {
        title: 'Ingresar el identificador o fecha del registro sospechoso',
        instruction: 'Digita el número de factura, código de producto o selecciona el rango de horas donde ocurrió el hecho.'
      },
      {
        title: 'Abrir el registro detallado del evento (Payload)',
        instruction: 'Avalon mostrará: Usuario que ejecutó la acción, Rol activo, IP del equipo, Valor Anterior (Old Value) y Valor Nuevo (New Value).',
        warning: 'La Bitácora de Eventos de Avalon V1 es inmutable; ningún usuario, ni siquiera el Administrador, puede borrar estos logs.'
      }
    ],
    contingency: 'Si se sospecha que una cuenta fue suplantada, cruza la IP del log contra las sesiones activas en ESC-CFG-10.'
  },
  {
    id: 'ESC-CFG-22',
    title: '¿Cómo filtrar la Bitácora por fecha, usuario, módulo o tipo de acción crítica?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Filtros reactivos multi-criterio permiten búsquedas instantáneas en historiales de más de 100.000 eventos.',
    expectedResult: 'La tabla presenta únicamente los sucesos relevantes reduciendo el tiempo de investigación de horas a segundos.',
    route: '/governance',
    routeLabel: 'Ir a Filtros de Auditoría',
    synonyms: ['filtrar bitacora eventos', 'buscar logs por usuario', 'historial auditoria fechas', 'filtro acciones criticas', 'buscar en log del sistema'],
    summary: 'Uso eficiente de los filtros combinados para auditar áreas específicas (ej: solo movimientos de caja del turno de la tarde).',
    steps: [
      {
        title: 'Abrir la Bitácora de Auditoría en Gobernanza',
        instruction: 'Haz clic en la barra de filtros avanzados en la parte superior del tablero.'
      },
      {
        title: 'Aplicar los filtros deseados:',
        instruction: '• Filtro 1: Rango de Fechas (ej: "Últimas 24 horas").\n• Filtro 2: Módulo (ej: "Inventario & Kárdex").\n• Filtro 3: Usuario específico (ej: "operario.taller@procoquinal.com").\n• Filtro 4: Nivel de Severidad (ej: "WARNING / CRITICAL").'
      },
      {
        title: 'Presionar "Aplicar Filtros"',
        instruction: 'La tabla se actualizará al instante mostrando la cronología de eventos con sus respectivas etiquetas de color.'
      },
      {
        title: 'Guardar vista predefinida si es una auditoría frecuente',
        instruction: 'Puedes marcar la búsqueda como "Favorito" para consultarla todos los lunes en la reunión de gerencia.',
        proTip: 'Filtrar por nivel CRITICAL permite detectar anomalías operativas antes de que afecten el cierre de mes.'
      }
    ],
    contingency: 'Si el volumen de eventos es muy grande, utiliza la exportación a Excel para procesar tablas dinámicas complejas.'
  },
  {
    id: 'ESC-CFG-23',
    title: '¿Cómo exportar el historial forense de auditoría en Excel/PDF para revisión de revisoría fiscal?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera libro Excel estructurado con hash criptográfico SHA-256 de integridad para soporte legal.',
    expectedResult: 'El Revisor Fiscal o Auditor Externo recibe la evidencia técnica certificada sin posibilidad de alteración.',
    route: '/governance',
    routeLabel: 'Ir a Exportar Auditoría',
    synonyms: ['exportar auditoria excel', 'informe revisoria fiscal logs', 'descargar bitacora eventos', 'certificado de trazabilidad sistemas', 'soporte auditoria externa'],
    summary: 'Extracción de evidencia documental formal requerida durante auditorías contables, fiscales o de calidad ISO.',
    steps: [
      {
        title: 'Definir el período requerido por la Revisoría Fiscal',
        instruction: 'Selecciona el mes o trimestre completo a certificar (ej: 01 de Julio al 30 de Septiembre de 2026).'
      },
      {
        title: 'Hacer clic en "Exportar Informe Forense Oficial"',
        instruction: 'Selecciona el formato: "Libro de Auditoría Estructurado (.xlsx)" o "Informe Ejecutivo Sellado (.pdf)".'
      },
      {
        title: 'Incluir metadatos de validación criptográfica',
        instruction: 'Avalon insertará al final del archivo el hash SHA-256 generado al momento de la descarga, demostrando que el archivo no fue manipulado tras la exportación.'
      },
      {
        title: 'Descargar y firmar digitalmente',
        instruction: 'Guarda el archivo en el repositorio de archivo de Revisoría Fiscal y entrega copia con acuse de recibo.',
        warning: 'Conserva estos archivos en custodia por un período mínimo de 5 años conforme a las normas comerciales colombianas.'
      }
    ],
    contingency: 'Si la revisoría solicita auditar un evento puntual en vivo, puedes darles acceso con un rol de "Auditor Externo Solo Lectura".'
  },
  {
    id: 'ESC-CFG-24',
    title: '¿Qué hacer si se detecta un intento de anulación de factura o movimiento fuera de horario laboral?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Regla de horario laboral bloquea transacciones sensibles entre 9:00 PM y 6:00 AM salvo token de contingencia.',
    expectedResult: 'El sistema congela la transacción sospechosa y despacha una alerta inmediata a la gerencia de Procoquinal.',
    route: '/governance',
    routeLabel: 'Ir a Alertas de Gobernanza',
    synonyms: ['anulacion fuera de horario', 'movimiento nocturno sospechoso', 'bloqueo transaccion fin de semana', 'alerta fraude horario', 'seguridad transacciones no laborales'],
    summary: 'Detección temprana y bloqueo de operaciones sospechosas ejecutadas en horas no hábiles (madrugada o festivos).',
    steps: [
      {
        title: 'Revisar la notificación de alerta en el panel de control',
        instruction: 'Avalon mostrará un banner rojo: "ALERTA DE SEGURIDAD: Intento de anulación de Factura FV-1045 a las 11:42 PM".'
      },
      {
        title: 'Auditar el origen de la transacción',
        instruction: 'En la Bitácora de Eventos, verifica la IP, el dispositivo y el usuario que intentó la acción.'
      },
      {
        title: 'Contactar al usuario titular de la cuenta',
        instruction: 'Confirma de inmediato si el colaborador estaba trabajando con autorización expresa de Gerencia o si su cuenta fue vulnerada.'
      },
      {
        title: 'Tomar acción correctiva:',
        instruction: '• Si fue no autorizado: Suspende la cuenta preventivamente (ESC-CFG-04) y revoca todas las sesiones.\n• Si fue autorizado: Aprueba la transacción en la bandeja de excepciones gerenciales.',
        proTip: 'Tener bloqueos por horario elimina más del 80% de los intentos de fraude interno en empresas de distribución.'
      }
    ],
    contingency: 'Puedes habilitar el modo "Permiso Especial 24 Horas" si el equipo de bodega debe hacer inventario nocturno de fin de año.'
  },
  {
    id: 'ESC-CFG-25',
    title: '¿Cómo supervisar los cambios realizados en los precios de lista y costos de Kárdex?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Log de Precios registra cada alteración en tarifas base, costo promedio ponderado y margen mínimo con causal obligatoria.',
    expectedResult: 'Se evita que alguien venda productos con descuentos artificiales o altere el costo promedio para maquillar utilidades.',
    route: '/governance',
    routeLabel: 'Ir a Auditoría de Precios',
    synonyms: ['quien cambio el precio producto', 'auditoria de tarifas y costos', 'cambios de precio no autorizados', 'historial de precios avalon', 'modificacion costo kardex'],
    summary: 'Vigilancia continua sobre las modificaciones de la lista oficial de precios para proteger el margen de comercialización.',
    steps: [
      {
        title: 'Abrir "Gobernanza > Auditoría de Precios & Catálogo"',
        instruction: 'Selecciona la pestaña de variaciones de precios.'
      },
      {
        title: 'Filtrar por producto de alta rotación (ej: Esmalte Barpimo Galón)',
        instruction: 'El tablero mostrará la línea de tiempo histórica de precios del ítem.'
      },
      {
        title: 'Examinar los campos comparativos:',
        instruction: '• Precio Anterior: $42.000 COP.\n• Precio Modificado: $36.000 COP.\n• Usuario responsable: Don Jorge (Comercial).\n• Justificación ingresada: "Promoción ferretera autorizada por gerencia".'
      },
      {
        title: 'Validar si el precio viola el margen mínimo de seguridad',
        instruction: 'Si el precio fijado deja un margen inferior al 15%, Avalon resaltará la fila con advertencia amarilla de riesgo financiero.',
        warning: 'Cualquier modificación masiva de precios mediante importación Excel debe ser visada por la Dirección Financiera.'
      }
    ],
    contingency: 'Si un cambio de precio fue un error de digitación, utiliza el botón "Revertir al Precio Anterior" para restaurar la tarifa oficial al segundo.'
  },
  {
    id: 'ESC-CFG-26',
    title: '¿Cómo monitorear accesos con permisos de Administrador y cambios en privilegios de roles?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registro de auto-auditoría sobre cambios de RBAC; vigila a los propios administradores del sistema.',
    expectedResult: 'Se audita que nadie se auto-otorgue permisos indebidos ni cree cuentas maestras fantasmas a espaldas de la Gerencia.',
    route: '/governance',
    routeLabel: 'Ir a Auditoría de Privilegios',
    synonyms: ['auditar administradores', 'cambios en roles rbac log', 'quien le dio permisos al usuario', 'escalamiento de privilegios auditoria', 'seguridad cuentas root'],
    summary: 'Principio de segregación de funciones: vigilar quién modifica los permisos de los demás usuarios en el sistema.',
    steps: [
      {
        title: 'Entrar a "Gobernanza > Auditoría de Seguridad > Cambios de Roles"',
        instruction: 'Abre el historial de asignación de privilegios.'
      },
      {
        title: 'Revisar las últimas modificaciones de roles',
        instruction: 'La tabla muestra: Fecha, Administrador que autorizó, Usuario beneficiario, Rol anterior y Nuevo Rol asignado.'
      },
      {
        title: 'Comprobar la regla de "Doble Control" para roles críticos',
        instruction: 'Para otorgar el rol de "Administrador General", Avalon exige confirmación mediante código OTP enviado al celular del Gerente General.'
      },
      {
        title: 'Verificar la ausencia de cuentas inactivas con privilegios altos',
        instruction: 'Ejecuta el escaneo de higiene: Avalon listará si hay usuarios con rol Admin que lleven más de 30 días sin iniciar sesión.',
        proTip: 'Eliminar privilegios administrativos no utilizados reduce la superficie de ataque cibernético en un 70%.'
      }
    ],
    contingency: 'Si detectas un usuario con permisos de Administrador no autorizado, revócale el acceso inmediatamente desde el panel principal.'
  },
  {
    id: 'ESC-CFG-27',
    title: '¿Cómo auditar la trazabilidad de modificaciones en las fórmulas maestras de pintura?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Log de Fórmulas Industriales registra cada gramo modificado en bases químicas, resinas y pigmentos con versionamiento.',
    expectedResult: 'Se protege el secreto industrial de Procoquinal y se detecta si alguien cambió proporciones químicas afectando la calidad.',
    route: '/mezclas',
    routeLabel: 'Ir a Taller de Fórmulas',
    synonyms: ['auditoria formulas pintura', 'quien cambio la formula mezclas', 'historial de versiones formula', 'trazabilidad quimica laboratorio', 'secreto industrial formulas'],
    summary: 'Auditoría sobre la propiedad intelectual y formulaciones químicas para asegurar estandarización de lotes y calidad de color.',
    steps: [
      {
        title: 'Abrir el catálogo de fórmulas en "Producción & Mezclas"',
        instruction: 'Localiza la fórmula en cuestión (ej: "Esmalte Secado Rápido Blanco Puro").'
      },
      {
        title: 'Hacer clic en "Historial de Versiones (v1.0, v1.1, v1.2)"',
        instruction: 'Avalon mostrará la evolución cronológica de la formulación.'
      },
      {
        title: 'Comparar componentes entre versiones (Diff Químico):',
        instruction: 'El comparador resaltará en verde componentes agregados y en rojo componentes disminuidos (ej: Resina Alquídica subió de 450 g a 480 g, Pigmento Blanco bajó de 120 g a 90 g).'
      },
      {
        title: 'Auditar al autor del cambio y la justificación técnica',
        instruction: 'Verifica: Químico formulador que editó, fecha y número de prueba de viscosidad en laboratorio.',
        warning: 'Nunca autorices cambios en fórmulas maestras sin la firma electrónica del Director Técnico de Calidad.'
      }
    ],
    contingency: 'Si un lote nuevo sale defectuoso tras un cambio de fórmula, presiona "Restaurar Versión Anterior" para volver a la receta probada.'
  },
  {
    id: 'ESC-CFG-28',
    title: '¿Cómo exigir causales obligatorias antes de autorizar cualquier ajuste sensible en la app?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modales de anulación, ajuste de inventario y notas crédito bloquean el botón Guardar si no se escoge causal formal y texto explicativo.',
    expectedResult: 'Se eliminan los ajustes anónimos o sin motivo documentado en toda la operación de la empresa.',
    route: '/config',
    routeLabel: 'Ir a Políticas de Causal',
    synonyms: ['causal obligatoria anulacion', 'motivo obligatorio ajuste', 'exigir justificacion escrita', 'bloquear guardado sin motivo', 'catalogo de causales avalon'],
    summary: 'Obligatoriedad de justificar técnicamente cualquier anulación, baja de inventario o descuento comercial.',
    steps: [
      {
        title: 'Entrar a "Configuración > Parámetros Generales > Causales Operativas"',
        instruction: 'Revisa el catálogo maestro de causales tipificadas por el departamento de control interno.'
      },
      {
        title: 'Verificar la lista de motivos estandarizados:',
        instruction: '• Anulación de Venta: "Error de digitación en caja", "Cliente se arrepintió antes del pago", "Medio de pago rechazado".\n• Ajuste de Kárdex: "Merma por evaporación", "Rotura en manipulación", "Diferencia en conteo cíclico".'
      },
      {
        title: 'Activar el flag "Exigir Comentario Detallado Mínimo de 15 Caracteres"',
        instruction: 'El sistema no permitirá escribir frases vagas como "ajuste" o "error"; obligará a redactar una explicación comprensible.'
      },
      {
        title: 'Guardar la directiva',
        instruction: 'A partir de este momento, ningún modal sensible permitirá confirmar sin completar la justificación formal.',
        proTip: 'Las causales tipificadas permiten generar gráficos estadísticos mensuales de las principales causas de merma y anulación.'
      }
    ],
    contingency: 'Si un operario requiere una causal no tipificada, el Administrador puede agregar una nueva opción al catálogo en 30 segundos.'
  },
  {
    id: 'ESC-CFG-29',
    title: '¿Cómo verificar la integridad de las firmas criptográficas o hashes de los logs inmutables?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Verificador de cadena de bloques local (Merkle Tree / Hash Chaining) valida que ningún registro de base de datos haya sido editado por SQL directo.',
    expectedResult: 'Avalon certifica que el 100% de los registros de auditoría conservan su hash original sin manipulación informática externa.',
    route: '/governance',
    routeLabel: 'Ir a Verificador de Integridad',
    synonyms: ['verificar integridad hash', 'prueba forense inmutabilidad', 'merkle tree logs avalon', 'cadena de bloques interna auditoria', 'certificar que no borraron base datos'],
    summary: 'Auditoría criptográfica avanzada que demuestra legalmente que las bases de datos de Avalon no fueron alteradas por fuera del sistema.',
    steps: [
      {
        title: 'Acceder a "Gobernanza > Integridad Criptográfica del Sistema"',
        instruction: 'Abre la herramienta de diagnóstico de seguridad de datos.'
      },
      {
        title: 'Presionar "Ejecutar Verificación de Cadena de Hashes"',
        instruction: 'El motor escaneará la secuencia de bloques de transacciones contrastando cada hash con su predecesor (Chained Ledger).'
      },
      {
        title: 'Interpretar el resultado del diagnóstico:',
        instruction: '• Semáforo Verde (100% ÍNTEGRO): La cadena está intacta. No hay saltos de consecutivos ni modificaciones directas por base de datos.\n• Semáforo Rojo (ALERTA DE RUPTURA): Un registro fue alterado o borrado directamente en el motor PostgreSQL / SQLite sin pasar por Avalon.'
      },
      {
        title: 'Descargar el Certificado de Integridad de Datos',
        instruction: 'Emite el acta firmada digitalmente para adjuntar a la carpeta anual de Revisoría Fiscal y DIAN.',
        warning: 'Cualquier ruptura en la cadena de hashes dispara una alerta inmediata a la mesa técnica de Scarpian AI.'
      }
    ],
    contingency: 'En caso de alerta roja, los ingenieros de Scarpian AI aislarán el respaldo y determinarán qué usuario o proceso ejecutó la alteración.'
  },
  {
    id: 'ESC-CFG-30',
    title: '¿Cómo configurar alertas automáticas al correo del Gerente ante eventos sospechosos de alto impacto?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Gobernanza & Bitácora de Auditoría',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Sistema de Webhooks y notificaciones SMTP envía alertas en tiempo real ante descuentos > 25%, ventas > $20M o descuadres de caja.',
    expectedResult: 'La Gerencia se entera en su celular al instante de sucesos atípicos sin necesidad de estar frente al computador.',
    route: '/config',
    routeLabel: 'Ir a Centro de Notificaciones',
    synonyms: ['alertas correo gerente', 'notificar eventos criticos email', 'aviso celular descuento alto', 'notificacion ventas extraordinarias', 'disparador de alertas gerencia'],
    summary: 'Configuración de alertas tempranas para que la dirección de la empresa mantenga control en tiempo real de operaciones críticas.',
    steps: [
      {
        title: 'Ir a "Configuración > Notificaciones & Disparadores Automáticos"',
        instruction: 'Abre la pestaña de reglas de alerta gerencial.'
      },
      {
        title: 'Seleccionar los eventos disparadores:',
        instruction: '• Descuento comercial mayor al 25% otorgado en mostrador.\n• Factura o cotización individual superior a $20.000.000 COP.\n• Cierre de Caja Z con faltante o sobrante superior a $50.000 COP.\n• Creación o reactivación de un usuario con rol de Administrador.'
      },
      {
        title: 'Ingresar los correos y números de WhatsApp de destino',
        instruction: 'Digita: Correo de Gerencia General (gerencia@procoquinal.com) y Director Financiero.'
      },
      {
        title: 'Guardar y probar envío de prueba',
        instruction: 'Haz clic en "Enviar Notificación de Prueba" para constatar que el mensaje ingrese de inmediato a la bandeja de entrada.',
        proTip: 'Las alertas tempranas permiten frenar despachos erróneos antes de que el camión salga de la planta.'
      }
    ],
    contingency: 'Si el correo falla temporalmente, Avalon guarda la alerta en la campana de notificaciones superior del sistema.'
  },

  // =========================================================================
  // SUBTEMA 4: Parámetros del Sistema, DIAN & SIIGO (10 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CFG-31',
    title: '¿Cómo configurar los datos de la empresa, NIT, razón social, régimen tributario y logo en Avalon?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Formulario institucional actualiza encabezados de tirillas POS, facturas PDF, cotizaciones y membretes.',
    expectedResult: 'Todos los documentos emitidos muestran los datos fiscales correctos y el logo oficial en alta resolución.',
    route: '/config',
    routeLabel: 'Ir a Datos Institucionales',
    synonyms: ['cambiar nit empresa', 'configurar razon social', 'cambiar logo facturas', 'datos fiscales procoquinal', 'encabezado tirilla pos'],
    summary: 'Definición de la identidad fiscal y corporativa que aparecerá en todas las cotizaciones, remisiones y facturas del sistema.',
    steps: [
      {
        title: 'Acceder a "Configuración > Parámetros de la Empresa"',
        instruction: 'Abre la pestaña institucional en el menú de ajustes.'
      },
      {
        title: 'Completar los datos fiscales legales:',
        instruction: '• Razón Social: PRODUCTOS COQUINAL S.A.S. (PROCOQUINAL SAS).\n• NIT: 900.XXX.XXX - DV.\n• Régimen: Responsable de IVA (Régimen Común).\n• Dirección Principal, Ciudad (Bogotá D.C.) y Teléfonos de contacto.'
      },
      {
        title: 'Subir el logo institucional en formato PNG transparente',
        instruction: 'Haz clic en "Cargar Logo" y selecciona el archivo con resolución mínima de 400x150 px.'
      },
      {
        title: 'Guardar cambios y verificar vista previa',
        instruction: 'Haz clic en "Guardar Datos Institucionales" y revisa una cotización de muestra para constatar que el encabezado luzca impecable.',
        warning: 'Cualquier cambio de NIT o Razón Social debe coincidir exactamente con el Registro Único Tributario (RUT) vigente.'
      }
    ],
    contingency: 'Si el logo se ve deformado, sube una imagen en proporción 3:1 para garantizar ajuste perfecto en papel térmico de 80 mm.'
  },
  {
    id: 'ESC-CFG-32',
    title: '¿Cómo actualizar la resolución de facturación electrónica de la DIAN y vigencia de consecutivos?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Alertas tempranas 30 días antes del vencimiento de la resolución DIAN o cuando queda menos del 10% del rango numerario.',
    expectedResult: 'El sistema emite facturas con el número de resolución DIAN vigente sin riesgo de sanciones tributarias.',
    route: '/config',
    routeLabel: 'Ir a Resoluciones DIAN',
    synonyms: ['actualizar resolucion dian', 'rango de facturacion dian', 'vencimiento resolucion facturas', 'consecutivo dian vencido', 'autorizacion numeracion dian'],
    summary: 'Parametrización obligatoria de la autorización de numeración otorgada por la DIAN para facturación formal.',
    steps: [
      {
        title: 'Ingresar a "Configuración > Parámetros Tributarios & DIAN"',
        instruction: 'Localiza la sección "Resoluciones de Facturación".'
      },
      {
        title: 'Digitar los datos del Formulario 1876 de la DIAN:',
        instruction: '• Número de Resolución: 187640XXXXXXXX.\n• Prefijo autorizado: (ej: FE / PRO).\n• Rango de numeración: Del número 1 al 10.000.\n• Fecha de Vigencia: Desde 10/10/2026 hasta 10/10/2028 (24 meses).'
      },
      {
        title: 'Configurar el umbral de alerta preventiva',
        instruction: 'Activa la alarma para avisar a Contabilidad cuando la numeración alcance la factura 9.000 o falten 30 días para vencer.'
      },
      {
        title: 'Guardar la resolución activa',
        instruction: 'El texto legal obligatorio de la DIAN se actualizará automáticamente al pie de todas las facturas electrónicas y tirillas.',
        warning: 'Facturar con una resolución vencida o fuera de rango genera sanciones económicas graves ante la administración tributaria.'
      }
    ],
    contingency: 'Si la DIAN tarda en expedir la nueva resolución, tramita con anterioridad la solicitud de habilitación en el portal Muisca.'
  },
  {
    id: 'ESC-CFG-33',
    title: '¿Cómo gestionar los tokens de integración con la API de SIIGO Cloud y estado de sincronización?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Flujo Cotidiano',
    status: 'pendiente',
    statusNote: 'EN HOMOLOGACIÓN: Conector directo API SIIGO en validación final de endpoints. Solución provisional activa: Exportación de Sábana Operativa (.xlsx).',
    expectedResult: 'Verificación del estado de enlace entre Avalon y los servicios contables en la nube de SIIGO.',
    route: '/accounting/siigo_sync',
    routeLabel: 'Ir a Sincronización SIIGO',
    synonyms: ['api siigo cloud token', 'conector contable siigo', 'sincronizacion siigo avalon', 'credenciales webhook siigo', 'estado enlace erp'],
    summary: 'Administración de credenciales de autenticación para la transmisión de comprobantes fiscales al software contable.',
    steps: [
      {
        title: 'Acceder a "Contabilidad & Caja > Sincronización SIIGO"',
        instruction: 'Abre la pestaña técnica de estado de enlace API.'
      },
      {
        title: 'Verificar el indicador del conector',
        instruction: 'El sistema indicará: "Estado: EN HOMOLOGACIÓN / PENDIENTE CERTIFICACIÓN DIAN".'
      },
      {
        title: 'Ingresar o renovar el API Key y Partner Token de SIIGO',
        instruction: 'Si el departamento contable recibió nuevas credenciales de producción de SIIGO Cloud, cópialas en los campos seguros.'
      },
      {
        title: 'Utilizar el método provisional de cargue masivo mensual',
        instruction: 'Mientras concluye la fase de certificación, el contador debe hacer clic en "Exportar Sábana Formato Plano SIIGO" para importar los asientos en 2 minutos.',
        proTip: 'La Sábana en Excel cuenta con la estructura exacta de columnas que exige SIIGO, garantizando cero reprocesos contables.'
      }
    ],
    contingency: 'En caso de rechazo del token por parte de SIIGO, contacta a la mesa técnica de Scarpian AI para auditar los headers del webhook.'
  },
  {
    id: 'ESC-CFG-34',
    title: '¿Cómo parametrizar las cuentas contables del PUC para ventas, IVA, retenciones y bancos?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Mapeo de cuentas PUC comerciales colombianas (4135, 2408, 1305, 1105, 1110) en `/accounting/sabana`.',
    expectedResult: 'Cada movimiento de venta, compra o recaudo contabiliza automáticamente en la cuenta auxiliar correcta.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Mapeo de Cuentas PUC',
    synonyms: ['parametrizar puc contabilidad', 'cuentas puc ventas e iva', 'mapeo contable 4135 2408', 'configurar plan de cuentas', 'auxiliares contables avalon'],
    summary: 'Homologación de códigos contables según el Plan Único de Cuentas para garantizar consistencia con los libros oficiales.',
    steps: [
      {
        title: 'Entrar a "Contabilidad > Parámetros Contables > Cuentas PUC"',
        instruction: 'Abre la matriz de causación automática de transacciones.'
      },
      {
        title: 'Verificar las cuentas maestras asignadas:',
        instruction: '• Ventas Comerciales de Pintura: Cuenta 4135 (Comercio al por mayor y menor).\n• Impuesto sobre las Ventas (IVA 19%): Cuenta 240805 (IVA Generado en Ventas).\n• Clientes Nacionales (Cartera): Cuenta 130505.\n• Caja General: Cuenta 110505 | Caja Menor: Cuenta 110510.\n• Bancos Nacionales (Bancolombia / Davivienda): Cuentas 111005XX.'
      },
      {
        title: 'Ajustar subcuentas o auxiliares por sucursal',
        instruction: 'Si el contador requiere separar las ventas por sede, asigna auxiliares de 8 dígitos (ej: 41350101 Sede Norte, 41350102 Sede Sur).'
      },
      {
        title: 'Guardar la matriz de contabilización',
        instruction: 'Los reportes de Sábana y cierres Z se generarán con las cuentas PUC homologadas.',
        warning: 'Nunca modifiques una cuenta PUC activa sin el aval escrito de la Contadora Pública de Procoquinal.'
      }
    ],
    contingency: 'Si una cuenta queda mal configurada, el contador puede reclasificarla en la exportación Excel antes de subirla al sistema contable.'
  },
  {
    id: 'ESC-CFG-35',
    title: '¿Cómo configurar las impresoras térmicas de tirillas (POS) y puertos de balanzas del taller?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Soporte directo Web Serial / USB / Driver Windows para impresoras térmicas ESC/POS de 80mm y 58mm y balanzas de pesaje.',
    expectedResult: 'La tirilla se imprime de forma inmediata al cobrar y la balanza de tintometría envía el peso en gramos sin digitar a mano.',
    route: '/config',
    routeLabel: 'Ir a Periféricos y Hardware',
    synonyms: ['configurar impresora termica pos', 'balanza pesaje taller conectar', 'impresora tirillas esc pos 80mm', 'puerto com balanza tintometria', 'hardware pos avalon'],
    summary: 'Conexión y calibración de los dispositivos físicos de mostrador y laboratorio con la aplicación web.',
    steps: [
      {
        title: 'Conectar la impresora térmica o balanza al equipo por USB',
        instruction: 'Asegúrate de que Windows reconozca el dispositivo en el Administrador de Dispositivos.'
      },
      {
        title: 'Abrir "Configuración > Periféricos & Hardware"',
        instruction: 'En Avalon, haz clic en la pestaña "Dispositivos de Hardware".'
      },
      {
        title: 'Configurar la Impresora de Tirillas:',
        instruction: 'Selecciona "Impresora Térmica POS (80mm)", marca "Corte automático de papel" y presiona "Imprimir Página de Prueba".'
      },
      {
        title: 'Configurar la Balanza de Taller (Si aplica):',
        instruction: 'Selecciona el puerto serie (COM3/COM4), velocidad (9600 baudios) y pulsa "Probar Lectura en Vivo". El display de Avalon debe mostrar los gramos exactos de la báscula.',
        proTip: 'Conectar la balanza directamente elimina errores humanos de digitación de pigmentos en el taller en un 100%.'
      }
    ],
    contingency: 'Si la impresora no responde, verifica que el servicio de cola de impresión de Windows (*Print Spooler*) esté iniciado.'
  },
  {
    id: 'ESC-CFG-36',
    title: '¿Cómo definir los topes de gastos máximos de Caja Menor y umbrales de autorización de crédito?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Guarda en `EnterpriseContext` bloquea egresos individuales mayores a $200.000 COP en caja menor y ventas a crédito sin cupo.',
    expectedResult: 'El sistema impide gastos desmedidos sin visto bueno administrativo, cuidando los recursos diarios de la compañía.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['tope maximo caja menor', 'limite gasto caja menor', 'umbral credito cliente maximo', 'politica gastos menores avalon', 'reglas de autorizacion gasto'],
    summary: 'Establecimiento de límites financieros automáticos para evitar desvíos de efectivo en compras menores.',
    steps: [
      {
        title: 'Ir a "Contabilidad > Parámetros de Caja Menor"',
        instruction: 'Abre la configuración del fondo fijo.'
      },
      {
        title: 'Definir el fondo fijo total y el tope por egreso individual:',
        instruction: '• Fondo Total Asignado: $1.500.000 COP.\n• Gasto Máximo Permitido por Recibo: $200.000 COP (gastos mayores deben pagarse por transferencia bancaria de tesorería).\n• Saldo Mínimo de Alerta de Reembolso: $300.000 COP (dispara aviso para reponer el fondo).'
      },
      {
        title: 'Establecer los conceptos autorizados',
        instruction: 'Marca las categorías válidas: "Transporte y Taxis de urgencia", "Aseo y Cafetería", "Papelería menor", "Mantenimiento locativo básico".'
      },
      {
        title: 'Guardar parámetros',
        instruction: 'Si un cajero intenta registrar un gasto de $250.000, Avalon bloqueará el registro exigiendo autorización de la Dirección.',
        warning: 'Nunca autorices gastos de caja menor sin soporte físico de factura electrónica o documento equivalente válido.'
      }
    ],
    contingency: 'En emergencias de fuerza mayor (ej: cerrajería o plomería urgente), el Gerente puede liberar un código de autorización puntual.'
  },
  {
    id: 'ESC-CFG-37',
    title: '¿Cómo respaldar la base de datos local y restaurar copias de seguridad de contingencia?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Exportación cifrada de base de datos (`.avalonbackup`) con compresión completa de tablas, fórmulas y clientes.',
    expectedResult: 'Se cuenta con copias de respaldo descargables para garantizar la continuidad del negocio ante fallas del servidor.',
    route: '/config',
    routeLabel: 'Ir a Copias de Seguridad',
    synonyms: ['respaldo base de datos', 'backup avalon descargar', 'restaurar copia seguridad', 'hacer copia de respaldo sistema', 'seguridad datos contingencia'],
    summary: 'Procedimiento de protección de la información contra pérdida de datos, fallas de hardware o siniestros técnicos.',
    steps: [
      {
        title: 'Acceder a "Configuración > Mantenimiento & Backups"',
        instruction: 'Abre la sección de administración de datos.'
      },
      {
        title: 'Presionar "Generar Copia de Seguridad Inmediata"',
        instruction: 'Avalon empaquetará todas las tablas (Ventas, Inventario, Kárdex, Fórmulas de Color y Cartera) en un archivo comprimido cifrado.'
      },
      {
        title: 'Descargar el archivo `.avalonbackup`',
        instruction: 'Guarda el archivo en una unidad externa segura (Disco duro externo o carpeta de nube corporativa OneDrive/Google Drive protegida).'
      },
      {
        title: 'Verificar la programación de backups automáticos',
        instruction: 'Confirma que el respaldo automático diario esté activo para ejecutarse todas las noches a las 11:00 PM.',
        proTip: 'Guardar al menos una copia de seguridad semanal en una ubicación física fuera de la planta protege contra cualquier imprevisto.'
      }
    ],
    contingency: 'Para restaurar un sistema dañado, instala la app en un equipo nuevo, pulsa "Restaurar Backup" y selecciona tu archivo más reciente.'
  },
  {
    id: 'ESC-CFG-38',
    title: '¿Cómo configurar los correos automáticos de notificación a clientes (servidor SMTP / remitente)?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Conector SMTP seguro (TLS/SSL) para despacho de cotizaciones PDF, remisiones y facturas desde correos oficiales.',
    expectedResult: 'Los clientes reciben sus cotizaciones desde un correo institucional confiable (ej: cotizaciones@procoquinal.com) evitando bandejas de SPAM.',
    route: '/config',
    routeLabel: 'Ir a Servidor de Correo',
    synonyms: ['configurar smtp correo', 'servidor de email cotizaciones', 'correo saliente notificaciones', 'email corporativo avalon', 'remitente facturas correo'],
    summary: 'Parametrización de la mensajería electrónica para el envío automático de propuestas y documentos fiscales.',
    steps: [
      {
        title: 'Entrar a "Configuración > Servicios de Integración > Servidor de Correo (SMTP)"',
        instruction: 'Abre la configuración de mensajería saliente.'
      },
      {
        title: 'Digitar los parámetros del servidor corporativo:',
        instruction: '• Servidor SMTP: smtp.office365.com / smtp.gmail.com.\n• Puerto: 587 (TLS) o 465 (SSL).\n• Usuario Remitente: facturacion@procoquinal.com.\n• Contraseña de aplicación segura de correo.'
      },
      {
        title: 'Personalizar la plantilla del mensaje predeterminado',
        instruction: 'Edita el saludo y pie de firma: "Estimado cliente, adjuntamos su cotización de Procoquinal SAS. Quedamos atentos a sus requerimientos."'
      },
      {
        title: 'Enviar correo de prueba',
        instruction: 'Digita tu propio correo y presiona "Enviar Prueba". Al recibir el mensaje con el logo oficial, guarda la configuración.',
        warning: 'Usa contraseñas de aplicación dedicadas en lugar de contraseñas personales de correo para no bloquear la cuenta.'
      }
    ],
    contingency: 'Si el servidor SMTP está caído, el asesor puede descargar el PDF directamente a su equipo y enviarlo manualmente.'
  },
  {
    id: 'ESC-CFG-39',
    title: '¿Cómo activar el modo fuera de línea (Offline Mode) en puntos de venta ante caídas de internet?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Motor local en IndexedDB y ServiceWorker permite seguir registrando ventas en contingencia y sincroniza al volver la red.',
    expectedResult: 'El mostrador de Procoquinal nunca detiene su facturación ni hace esperar a los clientes en la fila por fallas de internet.',
    route: '/pos',
    routeLabel: 'Ir a Punto de Venta',
    synonyms: ['modo offline sin internet', 'facturar sin señal pos', 'contingencia caida internet', 'modo fuera de linea avalon', 'sincronizar ventas despues'],
    summary: 'Resiliencia operativa para mantener la atención al público en caso de cortes imprevistos de fibra óptica o energía.',
    steps: [
      {
        title: 'Detectar la desconexión a internet',
        instruction: 'Avalon mostrará un aviso flotante amarillo: "MODO OFFLINE ACTIVO - Trabajando con catálogo local en memoria".'
      },
      {
        title: 'Continuar facturando en el mostrador normalmente',
        instruction: 'Agrega productos al carrito, digita el cliente y cobra en efectivo. El sistema emitirá la tirilla térmica de contingencia.'
      },
      {
        title: 'Verificar la cola de transacciones pendientes',
        instruction: 'En la esquina superior derecha verás el contador: "3 ventas pendientes por sincronizar en la nube".'
      },
      {
        title: 'Sincronización automática al restaurar la conexión',
        instruction: 'Tan pronto regrese la señal de internet, Avalon subirá las transacciones en segundo plano, actualizará el Kárdex y asignará los consecutivos definitivos.',
        proTip: 'No cierres la ventana del navegador mientras haya ventas pendientes por subir para asegurar la sincronización.'
      }
    ],
    contingency: 'Si la falla de internet dura varias horas, puedes compartir datos móviles desde un celular corporativo para forzar la sincronización.'
  },
  {
    id: 'ESC-CFG-40',
    title: '¿Cómo purgar datos temporales de caché sin perder el estado del carrito ni documentos en tránsito?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Parámetros del Sistema, DIAN & SIIGO',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Limpiar Caché Seguro" elimina assets obsoletos de versiones previas protegiendo llaves `POS_CART` y sesiones activas.',
    expectedResult: 'La aplicación carga a la máxima velocidad y resuelve problemas visuales sin borrar el trabajo que el usuario tenía a medias.',
    route: '/config',
    routeLabel: 'Ir a Mantenimiento de Caché',
    synonyms: ['limpiar cache avalon', 'borrar archivos temporales navegador', 'refrescar version app segura', 'aplicacion lenta limpiar memoria', 'purgar datos temporales'],
    summary: 'Mantenimiento preventivo local para solucionar ralentizaciones o estilos desactualizados en las terminales de trabajo.',
    steps: [
      {
        title: 'Ir a "Configuración > Diagnóstico del Sistema"',
        instruction: 'Localiza la tarjeta "Almacenamiento Local & Rendimiento".'
      },
      {
        title: 'Hacer clic en "Limpieza de Caché Segura"',
        instruction: 'Avalon purgará imágenes temporales, scripts cacheados y fragmentos de versiones anteriores.'
      },
      {
        title: 'Verificar la protección de datos operativos',
        instruction: 'El sistema preservará de forma garantizada tu sesión activa, tus carritos guardados en mostrador y tus borradores de cotizaciones.'
      },
      {
        title: 'Recargar la aplicación',
        instruction: 'Presiona "Recargar Sistema Ahora". Avalon se iniciará en menos de 2 segundos con todos los componentes frescos y actualizados.',
        proTip: 'Hacer esta limpieza una vez al mes mantiene la interfaz sumamente ágil y fluida.'
      }
    ],
    contingency: 'Si un equipo presenta bloqueos persistentes de pantalla, pulsa Ctrl + Shift + R en Chrome para forzar la recarga dura desde el servidor.'
  },

  // =========================================================================
  // SUBTEMA 5: Asistencia Técnica, Diagnóstico & Soporte Scarpian AI (10 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CFG-41',
    title: '¿Cómo tomar capturas de pantalla de fallas con notas usando el widget flotante de Scarpian AI?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Widget flotante captura pantalla con notas y adjunta a ticket de ingeniería.',
    expectedResult: 'El equipo de ingeniería recibe la imagen exacta del error con resolución, versión y notas explicativas.',
    route: '/config',
    routeLabel: 'Ir a Soporte Scarpian AI',
    synonyms: ['tomar captura pantalla error', 'widget flotante fotos soporte', 'foto de la falla avalon', 'capturar pantalla bug', 'asistente soporte scarpian'],
    summary: 'Herramienta visual interactiva para capturar evidencias directas de errores en pantalla sin usar programas externos.',
    steps: [
      {
        title: 'Ir a "Configuración > Soporte Técnico Scarpian AI"',
        instruction: 'Accede a la pestaña de asistencia técnica de ingeniería.'
      },
      {
        title: 'Presionar "Tomar fotos del problema"',
        instruction: 'Se activará el widget flotante inferior derecho. Navega libremente por Avalon hasta la pantalla donde ocurre la falla.'
      },
      {
        title: 'Tomar la foto y escribir una nota explicativa',
        instruction: 'Haz clic en el botón de la cámara "Tomar Foto", escribe una breve explicación (ej: "Miren este botón que no responde al hacer clic") y guarda la captura.',
        proTip: 'Puedes tomar varias fotos de diferentes pantallas en una sola sesión de reporte para mostrar la secuencia completa del problema.'
      },
      {
        title: 'Finalizar y adjuntar al ticket',
        instruction: 'Haz clic en "Terminar y Volver a Soporte". Verás tus fotos miniatura listas para ser enviadas al equipo de ingeniería.'
      }
    ],
    contingency: 'Si la aplicación no carga por completo, toma una foto con tu teléfono celular y envíala por WhatsApp al canal de soporte técnico.'
  },
  {
    id: 'ESC-CFG-42',
    title: '¿Cómo radicar un ticket de ingeniería directamente desde Avalon a la mesa de soporte Scarpian?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal de ticket genera radicado formal con telemetría técnica (versión, navegador, logs recientes) adjunta.',
    expectedResult: 'Se genera un número de ticket (ej: #SC-2026-104) asignado a un ingeniero de guardia con tiempo de respuesta garantizado.',
    route: '/config',
    routeLabel: 'Ir a Radicar Ticket',
    synonyms: ['radicar ticket soporte', 'crear ticket ingenieria', 'reportar bug scarpian ai', 'mesa de ayuda avalon', 'solicitar soporte tecnico'],
    summary: 'Canal prioritario de comunicación entre el personal de Procoquinal y los desarrolladores de Scarpian AI.',
    steps: [
      {
        title: 'Abrir el formulario de nuevo ticket en Soporte',
        instruction: 'En "Configuración > Soporte Scarpian AI", haz clic en "+ Crear Nuevo Ticket".'
      },
      {
        title: 'Seleccionar la categoría y nivel de impacto:',
        instruction: '• "Bloqueo Crítico (No se puede facturar ni producir)": Atención prioritaria en menos de 30 minutos.\n• "Falla Menor / Duda Operativa": Atención estándar en horario hábil.\n• "Sugerencia de Mejora / Nuevo Requerimiento": Evaluación para el próximo sprint.'
      },
      {
        title: 'Describir el problema y adjuntar capturas tomadas',
        instruction: 'Redacta: "Al intentar aplicar descuento del 10% en mostrador a la Ferretería El Sol, el sistema mostró error de red".'
      },
      {
        title: 'Presionar "Enviar Ticket a Scarpian"',
        instruction: 'El ticket se transmitirá con la bitácora técnica de los últimos 2 minutos para que los ingenieros diagnostiquen la causa raíz de inmediato.',
        warning: 'Usa la categoría de "Bloqueo Crítico" únicamente cuando la operación comercial o de planta esté completamente paralizada.'
      }
    ],
    contingency: 'Recibirás confirmación por correo con el enlace directo para seguir el avance del ticket en tiempo real.'
  },
  {
    id: 'ESC-CFG-43',
    title: '¿Cómo consultar el estado y tiempo de respuesta de los tickets técnicos abiertos?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Tablero de tickets muestra semáforo de estado (ABIERTO, EN ANÁLISIS, RESUELTO, EN PRUEBAS) en vivo.',
    expectedResult: 'El usuario conoce en todo momento quién está atendiendo su solicitud y cuándo quedará desplegada la solución.',
    route: '/config',
    routeLabel: 'Ir a Historial de Tickets',
    synonyms: ['estado ticket soporte', 'consultar radicado ayuda', 'cuando arreglan el ticket', 'seguimiento soporte tecnico', 'tickets abiertos scarpian'],
    summary: 'Seguimiento transparente de las solicitudes de soporte y tiempos de atención de acuerdos de nivel de servicio (SLA).',
    steps: [
      {
        title: 'Acceder a la bandeja de "Mis Tickets de Soporte"',
        instruction: 'En Configuración > Soporte, revisa la lista de reportes generados por tu sucursal.'
      },
      {
        title: 'Revisar la tarjeta del ticket',
        instruction: 'Identifica: Número de Ticket, Ingeniero Asignado, Fecha de Apertura y Última Actualización.'
      },
      {
        title: 'Consultar las notas y respuestas de ingeniería',
        instruction: 'Haz clic en el ticket para leer las respuestas del equipo de Scarpian AI (ej: "Parche aplicado en versión 1.2. Favor recargar con Ctrl+F5 y verificar").'
      },
      {
        title: 'Cerrar el ticket o solicitar reapertura si persiste la duda',
        instruction: 'Si el problema quedó resuelto satisfactoriamente, califica la atención con estrellas y presiona "Marcar como Resuelto".',
        proTip: 'Calificar los tickets nos permite mejorar continuamente la calidad de asistencia para Procoquinal.'
      }
    ],
    contingency: 'Si un ticket urgente no ha sido atendido en el tiempo previsto, haz clic en "Escalar a Gerencia Técnica".'
  },
  {
    id: 'ESC-CFG-44',
    title: '¿Cómo descargar el informe de salud del sistema (Healthcheck) y telemetría de rendimiento?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo de Telemetría diagnostica velocidad de respuesta de red, memoria RAM consumida, espacio de almacenamiento y versión de compilación.',
    expectedResult: 'Se obtiene una radiografía completa del estado de salud técnico del computador y del navegador.',
    route: '/config',
    routeLabel: 'Ir a Telemetría del Sistema',
    synonyms: ['diagnostico salud sistema', 'healthcheck avalon', 'velocidad y rendimiento pc', 'telemetria tecnica soporte', 'estado del servidor y app'],
    summary: 'Auditoría automática para identificar si la lentitud de una terminal se debe a problemas de red, memoria del equipo o del sistema.',
    steps: [
      {
        title: 'Entrar a "Configuración > Diagnóstico & Telemetría"',
        instruction: 'Abre el monitor de rendimiento en tiempo real.'
      },
      {
        title: 'Ejecutar el test de diagnóstico integral',
        instruction: 'Haz clic en "Iniciar Escaneo de Salud". El sistema evaluará en 5 segundos:\n• Latencia de Conexión a la Base de Datos (Ping en ms).\n• Uso de Memoria del Navegador (MB libres).\n• Espacio Disponible en Disco Local (IndexedDB Storage).\n• Integridad de Scripts y Caché.'
      },
      {
        title: 'Interpretar el Semáforo de Rendimiento:',
        instruction: '• Verde: Rendimiento Óptimo (Respuesta < 100 ms).\n• Amarillo: Conexión lenta o memoria saturada (Se recomienda cerrar pestañas de YouTube o programas pesados).\n• Rojo: Falla crítica de conectividad.'
      },
      {
        title: 'Exportar informe de telemetría si es solicitado por soporte',
        instruction: 'Presiona "Copiar Diagnóstico al Portapapeles" y pégalo en el ticket para que el ingeniero revise las métricas técnicas.',
        proTip: 'Realizar este test ayuda a diferenciar si la lentitud es del proveedor de internet (Claro/Tigo) o de la aplicación.'
      }
    ],
    contingency: 'Si la latencia de red supera los 800 ms, reinicia el módem de internet de la sede para refrescar el canal de enlace.'
  },
  {
    id: 'ESC-CFG-45',
    title: '¿Cómo utilizar el asistente de IA para diagnosticar descuadres de caja o inconsistencias de stock?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asistente analítico inteligente cruza en segundos cobros contra existencias y formula hipótesis explicativas del faltante.',
    expectedResult: 'El sistema encuentra la transacción exacta que causó la diferencia (ej: un cobro que se digitó como Efectivo en vez de Datáfono).',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Asistente de Cuadre',
    synonyms: ['asistente ia descuadre caja', 'diagnosticar diferencia dinero', 'ayuda ia faltante caja z', 'inteligencia artificial cuadre dinero', 'encontrar error en caja pos'],
    summary: 'Uso de inteligencia analítica para resolver misterios de cuadre de turno sin tener que revisar recibos en papel uno por uno.',
    steps: [
      {
        title: 'Abrir el Cierre de Caja Z con diferencia',
        instruction: 'En "Contabilidad > Cierres de Caja", abre el arqueo que muestra alerta de descuadre (ej: Faltante de $35.000 COP).'
      },
      {
        title: 'Hacer clic en "Diagnosticar con Asistente Scarpian AI"',
        instruction: 'Presiona el botón con el ícono de chispas de IA en el encabezado del cierre.'
      },
      {
        title: 'Revisar las hipótesis sugeridas por el motor:',
        instruction: '• "Se detectó la venta FV-1089 por $35.000 registrada como EFECTIVO, pero en el datáfono hay un voucher por el mismo valor a esa misma hora (Posible cobro cruzado de medio de pago)".\n• "Se registró un gasto de caja menor sin cerrar el comprobante correspondiente".'
      },
      {
        title: 'Aplicar la corrección sugerida',
        instruction: 'Corrige la marcación del medio de pago en la transacción identificada y verifica cómo el descuadre se reduce a $0.',
        proTip: 'El asistente reduce el tiempo de auditoría de un cierre de turno de 40 minutos a menos de 60 segundos.'
      }
    ],
    contingency: 'Si la diferencia es física real (dinero perdido), procede a registrar el faltante formal conforme a ESC-CON-01.'
  },
  {
    id: 'ESC-CFG-46',
    title: '¿Cómo reportar una sugerencia de mejora o solicitud de nueva funcionalidad a Scarpian AI?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo de Ideas y Roadmap permite a los empleados postular sugerencias operativas que son votadas y evaluadas para desarrollo.',
    expectedResult: 'La idea queda registrada en el Roadmap de Producto de Procoquinal para evaluación del equipo de ingeniería.',
    route: '/config',
    routeLabel: 'Ir a Buzón de Mejoras',
    synonyms: ['sugerencia de mejora avalon', 'pedir nueva funcion sistema', 'buzon de ideas scarpian', 'solicitar cambio en pantalla', 'propuesta de mejora continua'],
    summary: 'Canal abierto para que los colaboradores aporten ideas prácticas que hagan más fácil y rápido su trabajo diario.',
    steps: [
      {
        title: 'Acceder a "Configuración > Soporte > Sugerencias & Mejoras"',
        instruction: 'Abre el formulario de propuestas operativas.'
      },
      {
        title: 'Explicar la idea con lenguaje claro y práctico:',
        instruction: '• Título: (ej: "Agregar botón de WhatsApp directo en la ficha de cotizaciones").\n• Beneficio esperado: "Nos ahorraría tener que copiar el número de celular del cliente y guardarlo en el teléfono personal del asesor".'
      },
      {
        title: 'Adjuntar un boceto o captura si ayuda a ilustrar',
        instruction: 'Sube una imagen o foto dibujada a mano mostrando cómo te imaginas el botón o la pantalla.'
      },
      {
        title: 'Enviar la sugerencia',
        instruction: 'El equipo de diseño evaluará la viabilidad de la propuesta y te notificará cuando sea aprobada para la siguiente versión.',
        proTip: 'Las mejores funcionalidades de Avalon V1 han nacido de sugerencias directas de los operarios de taller y cajeros.'
      }
    ],
    contingency: 'Puedes revisar el Roadmap público en la app para ver qué nuevas herramientas se están programando este mes.'
  },
  {
    id: 'ESC-CFG-47',
    title: '¿Cómo autorizar una sesión de teleasistencia o soporte remoto seguro con los ingenieros?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Generador de PIN de Teleasistencia temporal (válido por 30 minutos) otorga acceso seguro de soporte sin compartir contraseñas.',
    expectedResult: 'El ingeniero de soporte se conecta de forma cifrada a tu sesión para diagnosticar el problema contigo en línea.',
    route: '/config',
    routeLabel: 'Ir a Teleasistencia Remota',
    synonyms: ['soporte remoto teleasistencia', 'conectar ingeniero scarpian', 'compartir pantalla soporte tecnico', 'pin de acceso remoto seguro', 'asistencia en vivo avalon'],
    summary: 'Mecanismo de acompañamiento en vivo donde el especialista técnico visualiza el sistema junto con el usuario para resolver dudas complejas.',
    steps: [
      {
        title: 'Estar en comunicación telefónica o chat con el ingeniero de soporte',
        instruction: 'El especialista te indicará: "Por favor genera un PIN de Teleasistencia en tu pantalla de configuración".'
      },
      {
        title: 'Ir a "Configuración > Soporte Técnico > Sesión Remota"',
        instruction: 'Haz clic en el botón "Generar PIN de Teleasistencia Segura".'
      },
      {
        title: 'Dictar el PIN numérico temporal de 6 dígitos',
        instruction: 'El código generado (ej: 849-201) tiene una vigencia estricta de 30 minutos y caduca automáticamente tras la sesión.'
      },
      {
        title: 'Observar la asistencia en tu pantalla',
        instruction: 'Verás un indicador verde: "SESIÓN DE SOPORTE ACTIVA con Ing. Sebastián". El ingeniero podrá orientarte paso a paso.',
        warning: 'Nunca compartas tu PIN con personas ajenas al equipo oficial verificado de Scarpian AI.'
      }
    ],
    contingency: 'Puedes presionar el botón rojo "Terminar Sesión Remota" en cualquier segundo para revocar el acceso de inmediato.'
  },
  {
    id: 'ESC-CFG-48',
    title: '¿Qué hacer si la aplicación muestra una pantalla en blanco (White Screen) o error de JavaScript?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Barrera de contención de errores (`ErrorBoundary`) captura fallas no controladas y ofrece botón "Reiniciar sin Pérdida".',
    expectedResult: 'La app se recupera de inmediato aislando el componente que falló sin que el usuario tenga que reiniciar el computador.',
    route: '/config',
    routeLabel: 'Ir a Recuperación',
    synonyms: ['pantalla en blanco error', 'white screen avalon', 'error de javascript bloqueo', 'pantalla congelada no responde', 'reiniciar aplicacion modo seguro'],
    summary: 'Protocolo de rescate rápido ante bloqueos visuales o fallas imprevistas de renderizado en el navegador web.',
    steps: [
      {
        title: 'Identificar la pantalla de recuperación de emergencia',
        instruction: 'En lugar de quedar congelada, Avalon mostrará una pantalla de diagnóstico: "Ups! Se presentó un problema inesperado en esta vista".'
      },
      {
        title: 'Presionar el botón "Reiniciar Componente de Forma Segura"',
        instruction: 'El sistema intentará recargar únicamente el módulo afectado preservando tus datos en memoria.'
      },
      {
        title: 'Si persiste la pantalla en blanco:',
        instruction: 'Presiona en tu teclado la combinación de teclas: **Ctrl + Shift + R** (o Ctrl + F5) para forzar la recarga limpia de código desde el servidor.'
      },
      {
        title: 'Reportar el código de error mostrado',
        instruction: 'Copia el texto del error (ej: `TypeError: Cannot read property of undefined in TintometriaPanel`) y pégalo en un ticket a Scarpian AI.',
        proTip: 'Avalon guarda tus carritos de venta en almacenamiento local persistente, por lo que una recarga nunca borrará tu venta en curso.'
      }
    ],
    contingency: 'Si el problema ocurre en una sola máquina, prueba abriendo la aplicación en modo incógnito temporalmente mientras TI revisa las extensiones.'
  },
  {
    id: 'ESC-CFG-49',
    title: '¿Cómo actualizar Avalon V1 a la última versión disponible liberada por Scarpian AI?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Notificador de nueva versión detecta actualizaciones liberadas y permite recargar en 3 segundos sin reinstalaciones.',
    expectedResult: 'Todas las terminales de Procoquinal quedan homologadas con las últimas correcciones y mejoras de rendimiento.',
    route: '/config',
    routeLabel: 'Ir a Actualizaciones',
    synonyms: ['actualizar version avalon', 'nueva version disponible parche', 'descargar actualizacion sistema', 'update avalon scarpian', 'verificar version actual'],
    summary: 'Mantenimiento del software para disfrutar de las últimas mejoras, parches de seguridad y optimizaciones de velocidad.',
    steps: [
      {
        title: 'Verificar la barra de notificación de actualización',
        instruction: 'Cuando los ingenieros despliegan una mejora, verás un cintillo azul en la parte superior: "Hay una nueva versión de Avalon disponible (v1.2.4)".'
      },
      {
        title: 'Guardar el trabajo en curso',
        instruction: 'Asegúrate de no estar a mitad de una transacción de cobro o formulación de pesaje en báscula.'
      },
      {
        title: 'Presionar "Actualizar y Recargar Ahora"',
        instruction: 'La aplicación descargará los nuevos archivos en segundo plano y se reiniciará automáticamente en menos de 3 segundos.'
      },
      {
        title: 'Comprobar el número de versión actualizado',
        instruction: 'En el pie del menú lateral, constata que aparezca la versión vigente y revisa las notas de la versión (Changelog) con los cambios aplicados.',
        warning: 'No pospongas las actualizaciones por más de 48 horas para asegurar compatibilidad con la facturación electrónica DIAN.'
      }
    ],
    contingency: 'Las actualizaciones se realizan en caliente sin interrumpir la base de datos ni apagar los servidores.'
  },
  {
    id: 'ESC-CFG-50',
    title: '¿Cómo capacitar a nuevos empleados utilizando el Centro de Soporte Interactivo de Avalon V1?',
    module: 'Configuración & Roles',
    moduleId: 'configuracion',
    subtopic: 'Soporte Técnico & Diagnóstico Scarpian AI',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Centro de Soporte con árbol de navegación de 3 niveles y buscador inteligente con más de 370 escenarios operativos reales.',
    expectedResult: 'El nuevo colaborador aprende a operar su puesto en menos de 2 días consultando el paso a paso exacto en pantalla.',
    route: '/config',
    routeLabel: 'Ir al Centro de Soporte',
    synonyms: ['capacitacion personal nuevo', 'manual de usuario avalon', 'como aprender a usar el sistema', 'guia de induccion empleados', 'centro de ayuda interactivo'],
    summary: 'Aprovechamiento de la base de conocimiento integrada para reducir la curva de aprendizaje de cajeros, laboratoristas y comerciales.',
    steps: [
      {
        title: 'Presentar al nuevo empleado la ruta de acceso al Centro de Soporte',
        instruction: 'Enséñale a ir a "Configuración > Soporte & Documentación" en el menú principal.'
      },
      {
        title: 'Explicar la navegación por árbol de 3 niveles:',
        instruction: '• Nivel 1: Módulos Operativos (Ventas, Mezclas, Inventario, Contabilidad, CRM, Logística, Configuración).\n• Nivel 2: Subtemas o Carpetas Funcionales.\n• Nivel 3: Artículos y Escenarios Paso a Paso.'
      },
      {
        title: 'Enseñar el uso del Buscador Predictivo Inteligente',
        instruction: 'Muéstrale cómo buscar con palabras cotidianas (ej: "fiado", "sticker", "merma", "quitar producto", "z-report") para encontrar la solución inmediata.'
      },
      {
        title: 'Fomentar la lectura de Pro-Tips y Advertencias',
        instruction: 'Cada artículo incluye consejos prácticos para evitar los errores comunes que cometen los principiantes en la empresa.',
        proTip: 'Tener una base de conocimiento viva reduce en un 80% las llamadas de auxilio a la gerencia y a los compañeros.'
      }
    ],
    contingency: 'Si un nuevo empleado encuentra un caso no documentado, puede solicitar agregarlo enviando una sugerencia con ESC-CFG-46.'
  }
];
