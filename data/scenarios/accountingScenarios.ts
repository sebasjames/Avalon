import { HumanScenario } from './types';

export const ACCOUNTING_SCENARIOS: HumanScenario[] = [
  // =========================================================================
  // SUBTEMA 1: Cierres Z, Arqueos & Auditoría de Caja (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CON-01',
    title: '¿Cómo realizar el Cierre de Caja Z al finalizar el turno diario consolidado?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Realiza arqueo ciego por denominación, compara con ventas del sistema y alerta si hay descuadre.',
    expectedResult: 'El turno de caja queda sellado, se guarda el arqueo y se emite el reporte Z consolidado en hoja carta o tirilla.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Cierres Z',
    synonyms: ['cierre z', 'arqueo', 'cerrar caja', 'fin de turno', 'cuadre de caja', 'contar plata', 'sobrante', 'faltante', 'z report'],
    summary: 'Procedimiento obligatorio al finalizar el día para conciliar el dinero físico con las ventas registradas en el software.',
    steps: [
      {
        title: 'Ingresar al módulo de Cierres Z',
        instruction: 'Ve a "Contabilidad & Caja > Cierres Z (Caja)" en el menú lateral.'
      },
      {
        title: 'Realizar el arqueo físico de efectivo',
        instruction: 'Cuenta los billetes y monedas por denominación ($100k, $50k, $20k, $10k, $5k, $2k) y digita las cantidades en el desglose de caja. El sistema sumará el total en efectivo automáticamente.',
        warning: 'Haz el conteo ciego sin mirar la pantalla para garantizar una auditoría transparente.'
      },
      {
        title: 'Verificar comprobantes de datáfono y transferencias',
        instruction: 'Suma los vouchers de las terminales electrónicas y digita el total de datáfono reportado.'
      },
      {
        title: 'Comparar y Cerrar Turno',
        instruction: 'Presiona "Generar Cierre Z". Si hay diferencia mayor a $5.000, deberás escribir una observación justificando el faltante o sobrante.',
        proTip: 'El cierre envía una notificación automática al departamento contable y a gerencia.'
      }
    ],
    contingency: 'Si existe un descuadre grave, revisa antes de cerrar si hubo pagos registrados por error en efectivo cuando en realidad fueron con datáfono.'
  },
  {
    id: 'ESC-CON-02',
    title: '¿Qué hacer si hay un faltante de caja mayor a $5.000 COP en el Cierre Z?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Exige causal obligatoria y registra la diferencia en la cuenta contable de responsabilidades de caja.',
    expectedResult: 'El cierre se efectúa dejando constancia del faltante y deduciéndolo conforme a la política interna de caja.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Cierres Z',
    synonyms: ['faltante caja', 'falto plata cierre', 'descuadre negativo', 'diferencia negativa caja', 'perdida efectivo'],
    summary: 'Protocolo de justificación y deducción cuando el dinero contado es inferior al reporte de ventas acumuladas.',
    steps: [
      {
        title: 'Verificar si hay billetes atascados o extraviados',
        instruction: 'Retira la gaveta metálica del cajón monedero; frecuentemente billetes de $10.000 o $20.000 quedan atrapados en el resorte posterior.'
      },
      {
        title: 'Cruzar contra comprobantes de gastos menores',
        instruction: 'Comprueba si se tomó dinero de mostrador para un flete urgente o taxi sin radicar el comprobante en Caja Menor.'
      },
      {
        title: 'Revisar vouchers de datáfono',
        instruction: 'Si el datáfono tiene un voucher de más por el mismo valor del faltante, reclasifica el medio de pago en el Historial POS.'
      },
      {
        title: 'Asentar el faltante con acta de observación',
        instruction: 'Si el dinero no aparece, asienta el valor real en el Cierre Z. El sistema calculará la diferencia negativa y exigirá la firma del cajero.',
        warning: 'Los faltantes repetitivos no justificados activan auditoría de grabaciones de seguridad en mostrador.'
      }
    ],
    contingency: 'Si el faltante supera los $50.000 COP, se debe dar aviso inmediato al Administrador de Tienda antes de retirarse.'
  },
  {
    id: 'ESC-CON-03',
    title: '¿Qué hacer si hay un sobrante de efectivo en el Cierre Z?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Acredita la diferencia a la cuenta 4295 (Ingresos Diversos / Aprovechamientos) bajo custodia empresarial.',
    expectedResult: 'El dinero sobrante se resguarda legalmente sin permitir que ningún operario se lo apropie de forma indebida.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Cierres Z',
    synonyms: ['sobrante caja', 'sobro dinero cierre', 'plata de mas', 'diferencia positiva caja', 'aprovechamiento caja'],
    summary: 'Procedimiento transparente para auditar y custodiar excedentes físicos de dinero al finalizar la jornada.',
    steps: [
      {
        title: 'Verificar posibles ventas no timbradas',
        instruction: 'Revisa si algún cliente de mostrador se llevó una lija o solvente pequeño y el cajero olvidó facturar el ticket.'
      },
      {
        title: 'Verificar devueltas entregadas de menos',
        instruction: 'Revisa si algún cliente pagó de prisa y no esperó las monedas de su cambio en caja.'
      },
      {
        title: 'Registrar la cantidad física real en el Cierre Z',
        instruction: 'Digita los billetes contados; Avalon reflejará "Diferencia: +$XX.XXX (Sobrante)" y enviará el valor al fondo de custodia.'
      },
      {
        title: 'Custodiar el excedente en sobre sellado',
        instruction: 'Deposita el dinero sobrante grapado a la tirilla del Cierre Z en la caja fuerte para atender posibles reclamos del cliente al día siguiente.',
        warning: 'Apropiarse de un sobrante de caja se considera falta grave de confianza según el reglamento interno de trabajo.'
      }
    ],
    contingency: 'Si transcurren 30 días sin reclamo de ningún cliente, el valor se traslada a la cuenta de ingresos varios de Procoquinal.'
  },
  {
    id: 'ESC-CON-04',
    title: '¿Cómo exportar e imprimir el Reporte Z oficial en formato A4 con membrete de Procoquinal?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera reporte fiscal en hoja A4/Carta con desglose de IVA, medios de pago y arqueo por denominación.',
    expectedResult: 'Se obtiene el documento formal firmado para radicación en el archivo contable de la empresa.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Cierres Z',
    synonyms: ['reporte z a4', 'imprimir cierre z', 'reporte fiscal caja', 'hoja membrete z', 'exportar z report'],
    summary: 'Impresión del acta oficial de cierre diario exigida por Revisoría Fiscal y las normas tributarias.',
    steps: [
      {
        title: 'Abrir el Cierre Z generado',
        instruction: 'En "Contabilidad & Caja > Cierres Z", selecciona el periodo cerrado (Hoy, Ayer o Rango Personalizado).'
      },
      {
        title: 'Hacer clic en "Generar Z-Report / Ver Hoja A4"',
        instruction: 'Se desplegará la vista previa del documento con el membrete oficial: PROCOQUINAL S.A.S. - REPORTE Z.'
      },
      {
        title: 'Revisar las secciones del informe',
        instruction: 'Verifica: Resumen de Ingresos, Ventas Brutas, IVA 19%, Retenciones, Salidas de Caja y Desglose por Denominación física.'
      },
      {
        title: 'Imprimir o guardar en PDF',
        instruction: 'Presiona "Imprimir" (Ctrl + P) asegurando que los márgenes estén ajustados a "Ninguno" para respetar el formato de Procoquinal.',
        proTip: 'Guarda la copia firmada en la carpeta mensual de cierres de caja en el archivo de Administración.'
      }
    ],
    contingency: 'Si la impresora no tiene tóner, descarga la versión PDF digital y compártela de inmediato por correo a la contadora.'
  },
  {
    id: 'ESC-CON-05',
    title: '¿Cómo auditar un descuadre por cobros cruzados (tarjeta cobrada como efectivo)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Detecta diferencias gemelas (+Datáfono / -Efectivo) y permite reclasificación previa al cierre.',
    expectedResult: 'Las diferencias se anulan mutuamente cuadrando el arqueo de caja a cero perfecto.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Cierres Z',
    synonyms: ['cobro cruzado', 'tarjeta registrada efectivo', 'descuadre gemelo', 'error medio pago cierre', 'cruzar voucher'],
    summary: 'Detección del error típico de mostrador donde el cajero cobra en datáfono pero oprime efectivo en el software.',
    steps: [
      {
        title: 'Identificar la anomalía en el arqueo preliminar',
        instruction: 'Observa si el reporte muestra un faltante en efectivo de $120.000 y un sobrante idéntico en vouchers de datáfono de $120.000.'
      },
      {
        title: 'Localizar la transacción en el Historial POS',
        instruction: 'Ve a "Ventas & Ingresos > Historial / Turno" y filtra las ventas por el monto exacto ($120.000).'
      },
      {
        title: 'Reclasificar el método de cobro antes de cerrar',
        instruction: 'Presiona "Editar Medio de Pago", cambia "Efectivo" por "Tarjeta / Datáfono" y anota el número de autorización del voucher.'
      },
      {
        title: 'Regresar al Cierre Z y verificar el cuadre',
        instruction: 'Al actualizar el Cierre Z, ambas diferencias desaparecerán quedando la caja cuadrada al 100%.',
        proTip: 'Esta verificación de 2 minutos ahorra horas de conciliación posterior a la contadora externa.'
      }
    ],
    contingency: 'Si el turno ya fue cerrado con Cierre Z formal, la corrección debe realizarse en la Sábana Operativa mediante nota de ajuste.'
  },
  {
    id: 'ESC-CON-06',
    title: '¿Cómo realizar un Cierre Z extemporáneo de una fecha anterior olvidada?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Selector de fecha retroactivo que recupera ventas huérfanas de días previos sin mezclar con el día actual.',
    expectedResult: 'El día omitido queda sellado con su fecha original y la caja de hoy continúa limpia.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Cierres Z',
    synonyms: ['cierre z extemporaneo', 'cierre atrasado', 'olvide cerrar caja ayer', 'cierre retroactivo', 'cerrar dia anterior'],
    summary: 'Subsanación de cierres de jornada omitidos por el cajero saliente garantizando la estricta separación de periodos fiscales.',
    steps: [
      {
        title: 'Seleccionar "Personalizado" en el selector de periodo',
        instruction: 'En Cierres Z, haz clic en el botón de rango y selecciona la fecha exacta del día que quedó abierto.'
      },
      {
        title: 'Cargar las ventas históricas de ese día',
        instruction: 'Avalon mostrará las transacciones emitidas en esa jornada específica.'
      },
      {
        title: 'Abrir el sobre de dinero resguardado en la caja fuerte',
        instruction: 'Toma el sobre físico donde el cajero guardó el efectivo de esa noche y realiza el conteo por denominación.'
      },
      {
        title: 'Generar el Cierre Z retroactivo',
        instruction: 'Presiona "Generar Cierre Z". El sistema lo sellará con la fecha original y notificará a Auditoría.',
        warning: 'No inicies las ventas de hoy hasta haber cerrado formalmente el turno del día anterior.'
      }
    ],
    contingency: 'Recuerda al personal de mostrador que olvidar el cierre Z entorpece la sincronización con la DIAN y SIIGO Cloud.'
  },
  {
    id: 'ESC-CON-07',
    title: '¿Cómo ejecutar un arqueo sorpresa a mitad de turno por Revisoría Fiscal?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Arqueo Sorpresa / Instantáneo" que congela la pantalla y emite acta de auditoría sin cerrar el turno.',
    expectedResult: 'El auditor verifica la concordancia física del dinero en gaveta con los comprobantes emitidos en el instante exacto.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['arqueo sorpresa', 'auditoria de caja imprevista', 'revisoria fiscal caja', 'conteo instantaneo', 'auditoria mostrador'],
    summary: 'Inspección de control interno sin aviso previo para garantizar la transparencia y custodia del efectivo de la empresa.',
    steps: [
      {
        title: 'Presentar la credencial de auditoría en mostrador',
        instruction: 'El revisor fiscal o auditor solicita al cajero detener la atención y apartarse de la gaveta.'
      },
      {
        title: 'Contar el efectivo físico y vouchers en presencia del cajero',
        instruction: 'Se cuentan todos los billetes, monedas y vouchers de datáfono presentes en la gaveta.'
      },
      {
        title: 'Consultar el saldo instantáneo en Avalon V1',
        instruction: 'En "Historial / Turno", se verifica la tarjeta "Neto en Caja" a la hora exacta del arqueo.'
      },
      {
        title: 'Emitir el Acta de Arqueo Sorpresa',
        instruction: 'Se digita el valor contado; el sistema emite el acta comparativa indicando diferencia ($0, faltante o sobrante) firmada por ambas partes.',
        proTip: 'Este arqueo no interrumpe el turno fiscal ni resetea los consecutivos de la caja registradora.'
      }
    ],
    contingency: 'Si se encuentra dinero personal del cajero dentro de la gaveta, se asienta como falta al protocolo de custodia de fondos.'
  },
  {
    id: 'ESC-CON-08',
    title: '¿Cómo registrar un cambio o corrección de la base de efectivo de apertura?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite rectificar la base inicial mediante comprobante de ajuste con rastro en la bitácora.',
    expectedResult: 'La base contable se alinea con el efectivo real disponible para cambio sin alterar las ventas del día.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['cambio de base', 'corregir base apertura', 'ajuste fondo sencillo', 'base mal contada', 'modificar apertura'],
    summary: 'Subsanación de errores de digitación en la apertura de caja para no arrastrar un descuadre ficticio hasta el Cierre Z.',
    steps: [
      {
        title: 'Identificar el error en la apertura',
        instruction: 'Verifica si se digitaron $300.000 pero en el sobre solo venían $200.000 de sencillo.'
      },
      {
        title: 'Ir a "Historial / Turno > Registrar Salida de Caja"',
        instruction: 'Crea un movimiento de ajuste por los $100.000 de diferencia.'
      },
      {
        title: 'Seleccionar concepto "Corrección de Base Inicial"',
        instruction: 'Escribe en la justificación: "Ajuste por error de conteo en la base de apertura de la mañana".'
      },
      {
        title: 'Confirmar con el visto bueno del Administrador',
        instruction: 'El Administrador valida el ajuste y el saldo neto de caja reflejará el efectivo físico real.',
        warning: 'No modifiques la base para encubrir faltantes de ventas ocurridos durante el día.'
      }
    ],
    contingency: 'Cuenta siempre la base con la supervisión de un testigo al abrir la tienda para evitar malentendidos.'
  },
  {
    id: 'ESC-CON-09',
    title: '¿Cómo registrar una salida de efectivo de caja por seguridad (descope) y conciliarla en el Cierre Z?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra salida a caja fuerte y la descuenta del efectivo esperado sin marcarla como pérdida.',
    expectedResult: 'El efectivo en mostrador disminuye y el dinero trasladado se suma automáticamente en el Cierre Z consolidado.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['descope seguridad', 'salida caja fuerte', 'retiro preventivo', 'alivio de efectivo', 'custodia caja fuerte'],
    summary: 'Traslado seguro de billetes de alta denominación hacia la caja fuerte para mitigar riesgos de hurto en mostrador.',
    steps: [
      {
        title: 'Verificar tope de efectivo en gaveta',
        instruction: 'Si el efectivo en caja supera $1.000.000 COP, procede a realizar el descope obligatorio.'
      },
      {
        title: 'Hacer clic en "Registrar Salida de Caja"',
        instruction: 'En Historial / Turno, presiona el botón naranja y digita el monto a retirar (ej: $600.000 COP).'
      },
      {
        title: 'Entregar el sobre al Administrador y firmar recibo',
        instruction: 'Coloca los billetes en la bolsa de seguridad y entrégala al administrador para depósito en la caja fuerte.'
      },
      {
        title: 'Verificar el impacto en el Cierre Z final',
        instruction: 'Al generar el Cierre Z en la noche, el sistema sumará el efectivo en gaveta ($400.000) + los descopes ($600.000) = $1.000.000 total ventas exactas.',
        proTip: 'Esta trazabilidad garantiza que el dinero retirado durante el día no se confunda con un faltante de caja.'
      }
    ],
    contingency: 'Grapa el recibo de descope firmado en la carpeta del turno como soporte físico del dinero resguardado.'
  },
  {
    id: 'ESC-CON-10',
    title: '¿Qué hacer si los vouchers del datáfono no coinciden con el reporte de tarjetas de Avalon?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Pestaña Conciliación Datáfonos permite cotejar voucher por voucher identificando transacciones omitidas o duplicadas.',
    expectedResult: 'Se identifica el voucher faltante o la transacción duplicada cuadrando el reporte antes de sellar el turno.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['voucher no coincide', 'diferencia datafono', 'tarjetas no cuadran', 'cierre lote datafono error', 'discrepancia vouchers'],
    summary: 'Cotejo minucioso entre los recibos impresos por la terminal electrónica y las ventas asentadas en el software.',
    steps: [
      {
        title: 'Imprimir el reporte de cierre de lote de la terminal física',
        instruction: 'En el datáfono, presiona "Cierre de Lote / Totales" para obtener la tirilla con el número de transacciones y el valor total.'
      },
      {
        title: 'Comparar cantidad de transacciones',
        instruction: 'Si el datáfono indica 14 transacciones y Avalon muestra 13, significa que un cobro no se finalizó en el sistema.'
      },
      {
        title: 'Identificar el voucher huérfano',
        instruction: 'Ordena los vouchers por hora y compara los números de autorización contra el Historial POS.'
      },
      {
        title: 'Asentar la venta faltante o anular la duplicada',
        instruction: 'Si la venta no se registró, créala en el POS asociándola al voucher para que el dinero quede legalizado en el turno.',
        warning: 'Nunca botes un voucher de datáfono; es el único soporte legal ante reclamos de los bancos adquirentes.'
      }
    ],
    contingency: 'Si el cliente tiene el débito en su celular pero el datáfono no emitió voucher, solicita certificación bancaria inmediata.'
  },
  {
    id: 'ESC-CON-11',
    title: '¿Cómo realizar el cambio de turno entre el cajero de la mañana y el de la tarde?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cierres de Caja Z & Arqueos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite corte de subturno con acta de entrega de dinero y relevo de usuario activo.',
    expectedResult: 'El primer cajero liquida su turno y el segundo empleado recibe la caja con su propia base verificada.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['cambio de cajero', 'relevo de turno', 'corte parcial turno', 'entrega de puesto caja', 'traspaso turno'],
    summary: 'Procedimiento de entrega y recepción de mostrador para deslindar responsabilidades sobre el dinero en jornadas compartidas.',
    steps: [
      {
        title: 'Realizar el conteo conjunto en mostrador',
        instruction: 'Ambos cajeros cuentan los billetes, monedas y vouchers presentes en la gaveta.'
      },
      {
        title: 'Registrar el Acta de Relevo en Avalon V1',
        instruction: 'En Historial / Turno, presiona "Corte de Subturno / Relevo". El sistema registrará el corte a esa hora exacta.'
      },
      {
        title: 'Cerrar sesión del cajero saliente',
        instruction: 'El empleado saliente cierra su sesión en el avatar superior derecho.'
      },
      {
        title: 'Iniciar sesión del nuevo cajero',
        instruction: 'El nuevo cajero entra con su usuario y contraseña, asumiendo la responsabilidad del dinero desde ese minuto.',
        proTip: 'Si hay faltante en el corte, es responsabilidad exclusiva del cajero de la mañana asumirlo antes de entregar.'
      }
    ],
    contingency: 'Nunca permitas que un cajero cobre con el usuario de otro compañero; las firmas digitales quedan grabadas por transacción.'
  },

  // =========================================================================
  // SUBTEMA 2: Caja Menor, Gastos Operativos & Legalizaciones (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CON-12',
    title: '¿Cómo crear y aperturar el Fondo Fijo de Caja Menor ($1.500.000 COP)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo CajaMenorTab inicializa fondo base de $1.500.000 COP con asignación de custodio responsable.',
    expectedResult: 'Se constituye el fondo fijo de efectivo para atender gastos menores operacionales de la empresa.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['crear caja menor', 'apertura fondo fijo', 'fondo 1500000', 'constituir caja menor', 'custodio caja menor'],
    summary: 'Apertura formal del fondo de efectivo para gastos corrientes que no ameritan giro de cheques o transferencias mayores.',
    steps: [
      {
        title: 'Acceder a "Contabilidad & Caja > Caja Menor"',
        instruction: 'Navega en el menú a la pestaña de Caja Menor (/accounting/caja_menor).'
      },
      {
        title: 'Definir el monto del fondo fijo y responsable',
        instruction: 'Ingresa el valor del fondo aprobado por Gerencia ($1.500.000 COP) y selecciona el empleado custodio.'
      },
      {
        title: 'Registrar el comprobante de egreso bancario de apertura',
        instruction: 'Vincula el número de transferencia o cheque con el que se retiró el dinero de la cuenta corriente de Procoquinal.'
      },
      {
        title: 'Guardar y verificar saldo disponible',
        instruction: 'Presiona "Constituir Fondo". La pantalla mostrará "Saldo Disponible: $1.500.000 COP" listo para registrar egresos.',
        warning: 'El dinero debe custodiarse bajo llave en la caja metálica de seguridad de la oficina de administración.'
      }
    ],
    contingency: 'Si la empresa requiere ampliar el fondo a $2.000.000 COP en meses de alta operación, se realiza mediante "Aumento de Fondo Fijo".'
  },
  {
    id: 'ESC-CON-13',
    title: '¿Cómo asentar un egreso de Caja Menor (transporte, refrigerios, útiles de aseo)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra egreso con tercero, concepto contable y soporte digital deduciendo del saldo disponible.',
    expectedResult: 'El saldo disponible se reduce y se emite el Comprobante de Egreso de Caja Menor para firma del beneficiario.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['gasto caja menor', 'egreso caja menor', 'pagar taxi', 'comprar cafe', 'insumos aseo', 'recibo de caja menor'],
    summary: 'Registro cotidiano de pagos menores en efectivo asegurando la imputación a la cuenta de gastos correspondiente.',
    steps: [
      {
        title: 'Hacer clic en "Registrar Egreso"',
        instruction: 'En la esquina superior de Caja Menor, presiona el botón azul.'
      },
      {
        title: 'Diligenciar tercero, concepto y valor',
        instruction: 'Digita: Nombre del proveedor/beneficiario, Concepto claro (ej: "Compra de jabón industrial y traperos para muelle de mezclas") y Valor exacto en pesos.'
      },
      {
        title: 'Seleccionar la categoría de gasto contable',
        instruction: 'Elige la cuenta PUC correspondiente: Gastos de Transporte (5135), Aseo y Cafetería (5195) o Papelería y Fotocopias.'
      },
      {
        title: 'Adjuntar soporte físico y guardar',
        instruction: 'Grapa la factura física al recibo de egreso emitido por Avalon y haz firmar al beneficiario que recibió el dinero.',
        proTip: 'Todo recibo debe incluir fecha, firma y cédula legible de quien recibió el efectivo.'
      }
    ],
    contingency: 'Si el beneficiario no tiene factura electrónica ni RUT (ej: taxista), diligencia el "Formato de Cuenta de Cobro a Tercero no Obligado a Facturar".'
  },
  {
    id: 'ESC-CON-14',
    title: '¿Cómo solicitar el Reembolso / Reposición del Fondo Fijo al alcanzar el 70% de consumo?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón "Solicitar Reposición" agrupa todos los egresos del ciclo y genera la cuenta de cobro a Tesorería.',
    expectedResult: 'Tesorería gira una transferencia por el valor exacto gastado, restaurando el saldo de caja menor a $1.500.000 COP.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['reposicion caja menor', 'reembolso fondo fijo', 'reponer plata caja menor', 'caja menor gastada', 'solicitud reembolso'],
    summary: 'Mecanismo periódico de liquidación para reintegrar el dinero gastado y no dejar la caja sin fondos.',
    steps: [
      {
        title: 'Monitorear el semáforo de saldo disponible',
        instruction: 'Cuando el saldo disponible descienda a menos de $450.000 COP (consumo del 70%), es momento de solicitar la reposición.'
      },
      {
        title: 'Presionar "Solicitar Reposición de Fondos"',
        instruction: 'Avalon compilará automáticamente todos los comprobantes de egreso del periodo (ej: 18 egresos por un total de $1.050.000 COP).'
      },
      {
        title: 'Exportar la Planilla de Legalización de Gastos',
        instruction: 'Imprime el consolidado y adjunta todos los recibos físicos originales grapados en orden cronológico.'
      },
      {
        title: 'Radicar en Tesorería y recibir el giro',
        instruction: 'Tesorería revisa los soportes y transfiere los $1.050.000 a la cuenta del custodio. En Avalon se registra la entrada como "PAGO_RECIBIDO", restaurando el saldo a $1.500.000 COP.',
        proTip: 'Nunca esperes a que la caja quede en $0 para solicitar la reposición; el trámite contable toma entre 24 y 48 horas.'
      }
    ],
    contingency: 'Si Contabilidad rechaza un recibo por falta de soporte válido, el custodio debe subsanarlo o reintegrar el valor de su propio bolsillo.'
  },
  {
    id: 'ESC-CON-15',
    title: '¿Qué hacer si un gasto excede el tope máximo autorizado de Caja Menor ($200.000 COP)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bloquea pagos mayores a $200.000 COP exigiendo trámite por Orden de Pago bancaria de Tesorería.',
    expectedResult: 'Se evita la descapitalización de la caja menor y se canalizan las compras mayores por los conductos bancarios formales.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['gasto supera tope', 'tope 200000', 'compra grande caja menor', 'no se puede pagar en efectivo', 'limite caja menor'],
    summary: 'Norma de control financiero que impide pagar compras cuantiosas con dinero de caja menor.',
    steps: [
      {
        title: 'Observar el bloqueo del sistema',
        instruction: 'Al ingresar un valor superior a $200.000 COP, Avalon alertará: "El gasto excede el tope individual de Caja Menor ($200.000 COP). Debe tramitarse por Tesorería".'
      },
      {
        title: 'Solicitar factura electrónica al proveedor',
        instruction: 'Indica al proveedor que emita la factura electrónica a nombre de PROCOQUINAL S.A.S. con condición de pago a 8 días o transferencia de contado.'
      },
      {
        title: 'Radicar la cuenta en Cuentas por Pagar',
        instruction: 'Envía la factura al área de Tesorería para que sea cancelada mediante transferencia directa desde Bancolombia.',
        warning: 'Fraccionar una factura grande en varios recibos pequeños de caja menor está estrictamente prohibido por normas tributarias.'
      }
    ],
    contingency: 'En caso de extrema emergencia de planta (ej: repuesto de máquina fuera de horario), se requiere autorización escrita del Gerente General.'
  },
  {
    id: 'ESC-CON-16',
    title: '¿Cómo asentar un anticipo de viáticos a conductores o técnicos de campo y su legalización?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra el egreso como "Anticipo de Viáticos" y permite cruzar los recibos de peajes/gasolina al regreso.',
    expectedResult: 'El dinero entregado queda registrado como saldo a favor de la empresa hasta que el empleado presenta las facturas.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['anticipo viaticos', 'plata para viaje', 'peajes conductor', 'gasolina viaje', 'legalizar viaticos'],
    summary: 'Entrega de dinero para combustible, peajes y alimentación a transportadores para viajes intermunicipales.',
    steps: [
      {
        title: 'Registrar la salida de efectivo como "Anticipo"',
        instruction: 'En Caja Menor, selecciona concepto: "Anticipo de Viáticos - Viaje Barranquilla", digita el monto (ej: $300.000 COP) y el nombre del chofer.'
      },
      {
        title: 'Hacer firmar el pagaré de viáticos al empleado',
        instruction: 'El chofer firma el recibo comprometiéndose a entregar los soportes al término del viaje.'
      },
      {
        title: 'Legalizar al regreso del viaje',
        instruction: 'Al volver, el chofer entrega los tickets de peajes y facturas electrónicas de gasolina. En Avalon se cruzan los comprobantes contra el anticipo.',
        proTip: 'Si el conductor gastó $280.000 y devuelve $20.000 en efectivo, se asienta la entrada del saldo restante devolviéndolo a la caja menor.'
      }
    ],
    contingency: 'Si el chofer gastó de más con soporte autorizado, se le reembolsa el excedente en efectivo en ese mismo instante.'
  },
  {
    id: 'ESC-CON-17',
    title: '¿Qué hacer si un empleado perdió el recibo físico de un peaje o taxi pagado con Caja Menor?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite adjuntar "Acta de Gasto no Soportado" firmada por el Jefe de Área con deducibilidad restringida.',
    expectedResult: 'Se legaliza la salida de dinero en la caja sin generar descuadre físico, asumiendo el tratamiento fiscal correspondiente.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['perdio recibo', 'ticket perdido peaje', 'gasto sin soporte', 'factura perdida', 'acta gasto no sustentado'],
    summary: 'Protocolo de excepción para justificar salidas reales de dinero cuyos soportes en papel se extraviaron o destruyeron.',
    steps: [
      {
        title: 'Verificar si se puede recuperar copia digital',
        instruction: 'Para peajes concesionados o aplicaciones de transporte (Uber/Didi), descarga el comprobante electrónico desde el portal web.'
      },
      {
        title: 'Diligenciar el Formato de Gasto no Soportado',
        instruction: 'Si no hay copia digital, el empleado debe redactar un acta detallando la fecha, ruta, motivo del desplazamiento y valor exacto.'
      },
      {
        title: 'Obtener la firma del Director Administrativo',
        instruction: 'El jefe inmediato debe avalar que el gasto fue necesario para la operación de la empresa.'
      },
      {
        title: 'Imputar a la cuenta de Gastos no Deducibles (519595)',
        instruction: 'En Avalon V1, clasifica el egreso como "Gasto no Ducible DIAN" para que la contadora no lo compute en la declaración de renta.',
        warning: 'Esta excepción no se puede autorizar más de una vez por semestre al mismo colaborador.'
      }
    ],
    contingency: 'Si el jefe de área no aprueba el acta, el empleado deberá reintegrar el dinero en efectivo a la caja menor.'
  },
  {
    id: 'ESC-CON-18',
    title: '¿Cómo realizar el arqueo periódico del cofre de Caja Menor (efectivo vs. recibos)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Valida que la ecuación (Efectivo Físico + Recibos Pendientes = Fondo Fijo $1.500.000) sea 100% exacta.',
    expectedResult: 'El auditor o custodio comprueba que no falte ni un solo peso entre los billetes de la caja y los papeles firmados.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['arqueo caja menor', 'cuadre caja menor', 'contar recibos caja menor', 'auditoria fondo fijo', 'revisar cofre'],
    summary: 'Comprobación matemática semanal para garantizar la integridad del fondo de caja menor.',
    steps: [
      {
        title: 'Contar los billetes y monedas físicas en el cofre',
        instruction: 'Suma el dinero en efectivo guardado en la caja metálica (ej: $420.000 COP).'
      },
      {
        title: 'Sumar el total de los recibos de egreso físicos',
        instruction: 'Suma el valor de todas las facturas y comprobantes pendientes de reposición (ej: $1.080.000 COP).'
      },
      {
        title: 'Aplicar la ecuación de control de Caja Menor',
        instruction: 'Efectivo ($420.000) + Recibos ($1.080.000) = $1.500.000 COP exactos.',
        proTip: 'Si la suma de ambos factores da exactamente el valor del fondo fijo constituido, la caja menor se encuentra en perfecto equilibrio.'
      },
      {
        title: 'Registrar la fecha del arqueo en Avalon V1',
        instruction: 'En la pestaña de Caja Menor, haz clic en "Verificar Arqueo" y archiva el visto bueno semanal.'
      }
    ],
    contingency: 'Si hay diferencia, revisa si hay algún vale provisional prestado a un auxiliar que no ha entregado la vuelta.'
  },
  {
    id: 'ESC-CON-19',
    title: '¿Cómo imputar los egresos de Caja Menor a centros de costos (Planta, Ventas, Admin)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Desplegable de Centros de Costo (CC-100 Planta, CC-200 Ventas, CC-300 Admin) para costeo por área.',
    expectedResult: 'Los gastos se distribuyen en los informes de gestión permitiendo a gerencia evaluar los costos reales de cada departamento.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['centro de costos caja menor', 'distribuir gastos', 'costo planta', 'costo administracion', 'imputacion contable'],
    summary: 'Asignación analítica de los pequeños gastos para evitar que la administración absorba costos de la planta de producción.',
    steps: [
      {
        title: 'Seleccionar el centro de costos en el registro de egreso',
        instruction: 'Al crear el egreso, despliega el campo "Centro de Costos" y selecciona la unidad correspondiente.'
      },
      {
        title: 'Criterios de asignación:',
        instruction: '• CC-100 Planta / Taller: Guantes, solventes de limpieza de tolvas, fletes de materia prima.\n• CC-200 Ventas / POS: Bolsas, cinta de embalaje de mostrador, taxis comerciales.\n• CC-300 Administración: Papelería contable, envíos de mensajería Servientrega, cafetería general.'
      },
      {
        title: 'Confirmar el egreso analítico',
        instruction: 'Presiona "Guardar". Los informes de rentabilidad mensual reflejarán la carga de gastos asignada a cada área.',
        proTip: 'Esta división ayuda a que el Gerente de Producción conozca los insumos menores reales de su planta.'
      }
    ],
    contingency: 'Si un gasto beneficia a varias áreas (ej: botellón de agua para toda la sede), asígnalo al centro de costos general de Administración.'
  },
  {
    id: 'ESC-CON-20',
    title: '¿Cómo cerrar y liquidar temporalmente la Caja Menor para el corte fiscal de fin de año?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Procedimiento de cierre anual que legaliza todos los recibos y consigna el efectivo en la cuenta bancaria.',
    expectedResult: 'El fondo de caja menor queda en balance $0 al 31 de diciembre conforme a las exigencias de auditoría externa.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['liquidar caja menor fin de año', 'cierre anual caja menor', 'devolver fondo fijo', 'corte 31 diciembre caja menor'],
    summary: 'Reintegro total del fondo de caja menor a la cuenta bancaria corporativa para el cierre de balance contable anual.',
    steps: [
      {
        title: 'Detener los egresos de caja menor el 28 de diciembre',
        instruction: 'Notifica a todo el personal que no se recibirán más gastos de caja menor hasta el nuevo año.'
      },
      {
        title: 'Legalizar el 100% de los recibos pendientes',
        instruction: 'Genera la reposición final para que todos los gastos queden imputados en la vigencia fiscal que termina.'
      },
      {
        title: 'Consignar el saldo restante en la cuenta bancaria',
        instruction: 'Lleva el efectivo físico restante al banco y consígnalo a la cuenta corriente de Procoquinal SAS.'
      },
      {
        title: 'Asentar el Cierre Anual en Avalon V1',
        instruction: 'En Caja Menor, presiona "Cierre y Liquidación Anual", adjunta la consignación bancaria y deja el fondo en estado "Liquidado / Cero".',
        warning: 'En enero del año siguiente se volverá a aperturar el fondo con un nuevo comprobante de egreso.'
      }
    ],
    contingency: 'Si un empleado presenta un recibo del año viejo en enero, no se puede pagar por caja menor; debe tramitarse como gasto de vigencia anterior en Contabilidad.'
  },
  {
    id: 'ESC-CON-21',
    title: '¿Qué hacer si el custodio de la Caja Menor se ausenta por vacaciones o incapacidad?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Caja Menor & Gastos Operativos',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite traspaso formal de custodia con arqueo intermedio y asignación de firma temporal.',
    expectedResult: 'El suplente asume la administración del fondo fijo con total claridad de los saldos entregados.',
    route: '/accounting/caja_menor',
    routeLabel: 'Ir a Caja Menor',
    synonyms: ['custodio vacaciones', 'cambio custodio caja menor', 'traspaso fondo fijo', 'entrega caja menor incapacidad'],
    summary: 'Traspaso reglamentario del cofre de efectivo entre dos empleados administrativos para no paralizar los gastos diarios.',
    steps: [
      {
        title: 'Ejecutar arqueo formal entre saliente y entrante',
        instruction: 'El custodio titular y el suplente cuentan el dinero físico y revisan los recibos pendientes de reposición.'
      },
      {
        title: 'Generar el Acta de Entrega Temporal en Avalon V1',
        instruction: 'En la pestaña de Caja Menor, selecciona "Reasignar Custodio Temporal" e ingresa el usuario del empleado suplente.'
      },
      {
        title: 'Entrega física de la llave del cofre de seguridad',
        instruction: 'Se entrega la llave del cofre y ambos empleados firman el acta de traspaso.',
        proTip: 'Durante el periodo de vacaciones, solo el custodio suplente está autorizado para emitir y firmar egresos en el sistema.'
      }
    ],
    contingency: 'Al regreso del titular, se repite exactamente el mismo proceso de arqueo para devolver la custodia formal del fondo.'
  },

  // =========================================================================
  // SUBTEMA 3: Cartera, Recibos de Caja & Cruce de Anticipos (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CON-22',
    title: '¿Cómo registrar un Recibo de Caja por abono parcial a una factura a crédito?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Modal de Recibo de Caja (`showPaymentModal`) descuenta saldo de la cuenta 1305 y actualiza cartera.',
    expectedResult: 'El saldo pendiente de la factura disminuye y se emite el comprobante oficial de abono para el cliente.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Módulo Contable',
    synonyms: ['recibo de caja', 'abono a factura', 'pago parcial cartera', 'cobro a cliente', 'registrar abono', 'cuenta 1305'],
    summary: 'Recepción de pagos de clientes corporativos que cancelan una fracción de sus facturas pendientes a crédito.',
    steps: [
      {
        title: 'Abrir el panel de Registro de Pagos / Recibos de Caja',
        instruction: 'En el módulo contable, presiona "Registrar Recibo de Caja / Pago de Cliente".'
      },
      {
        title: 'Buscar el cliente en la cartera activa',
        instruction: 'Selecciona la empresa (ej: Carrocerías El Sol S.A.S.). El sistema listará todas sus facturas a crédito pendientes con fecha y saldo.'
      },
      {
        title: 'Seleccionar la factura e ingresar el valor abonado',
        instruction: 'Marca la factura a abonar, digita el monto recibido (ej: $500.000 COP de una factura de $1.200.000) y el banco de ingreso (Davivienda / Bancolombia).'
      },
      {
        title: 'Elegir tratamiento: "Abono Parcial (PARTIAL)"',
        instruction: 'Marca la opción de abono parcial. Avalon recalculará el nuevo saldo de la factura ($700.000 COP) y expedirá el Recibo de Caja oficial.',
        proTip: 'Envía el recibo de caja en PDF por correo al contador de la empresa para que concilie su cuenta por pagar.'
      }
    ],
    contingency: 'Si el cliente tiene varias facturas vencidas, aplica siempre el abono a la factura más antigua (método de imputación legal).'
  },
  {
    id: 'ESC-CON-23',
    title: '¿Cómo cruzar un anticipo recibido con una factura emitida posteriormente?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción "Aplicar Saldo a Favor / Anticipo" en el modal de cobro y en Recibos de Caja.',
    expectedResult: 'El anticipo se cruza contablemente contra la factura, extinguiendo la deuda sin exigir un nuevo ingreso de dinero.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Módulo Contable',
    synonyms: ['cruzar anticipo', 'aplicar saldo a favor', 'cruzar anticipo con factura', 'cruzar cartera', 'anticipo pintura'],
    summary: 'Compensación de dineros entregados previamente por el cliente al momento de despacharle el pedido definitivo.',
    steps: [
      {
        title: 'Verificar el saldo a favor del cliente en el CRM',
        instruction: 'Revisa en la ficha del cliente que el anticipo previo esté en estado "Disponible / No Aplicado" (ej: $1.000.000 COP).'
      },
      {
        title: 'Localizar la nueva factura emitida en Cartera',
        instruction: 'Abre la factura comercial correspondiente a la entrega del producto (ej: Factura #F-4500 por $1.000.000 COP).'
      },
      {
        title: 'Hacer clic en "Cruzar con Anticipo Existente"',
        instruction: 'Selecciona el anticipo disponible y presiona "Cruzar Documentos".'
      },
      {
        title: 'Confirmar el saldo en ceros',
        instruction: 'Avalon emitirá el Recibo de Cruce Contable (cuenta 2805 Anticipos contra cuenta 1305 Clientes); la factura pasará a estado "PAGADA".',
        warning: 'Si la factura es por $1.200.000 y el anticipo era de $1.000.000, la factura quedará con saldo pendiente de $200.000 COP.'
      }
    ],
    contingency: 'Si el anticipo fue recibido en un mes anterior, el cruce no altera las ventas del mes en que se recibió el dinero, garantizando la norma de causación.'
  },
  {
    id: 'ESC-CON-24',
    title: '¿Qué hacer si el cliente pagó de menos por un descuento financiero por pronto pago acordado?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción `paymentDiffHandling === "DISCOUNT"` cierra la factura llevando la diferencia a la cuenta 5305 (Descuentos Financieros).',
    expectedResult: 'La factura queda saldada al 100% en cartera y el valor no cobrado se asienta como gasto financiero deducible.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Módulo Contable',
    synonyms: ['descuento pronto pago', 'pago menos cliente', 'descuento financiero', 'diferencia pago factura', 'cierre con descuento'],
    summary: 'Manejo contable cuando un cliente se acoge a la cláusula comercial de rebaja por pagar antes de 10 días.',
    steps: [
      {
        title: 'Verificar la fecha de pago y las condiciones comerciales',
        instruction: 'Comprueba que el cliente haya cancelado dentro de la ventana de pronto pago autorizada (ej: 5% de descuento por pagar en menos de 8 días).'
      },
      {
        title: 'Abrir el modal de Recibo de Caja',
        instruction: 'Digita el monto transferido por el cliente (ej: $950.000 de una factura de $1.000.000).'
      },
      {
        title: 'Seleccionar tratamiento de la diferencia: "Descuento Financiero (DISCOUNT)"',
        instruction: 'Marca la casilla "Aplicar Descuento por Pronto Pago". Avalon imputará los $50.000 restantes a la cuenta PUC 530535.'
      },
      {
        title: 'Cerrar la factura',
        instruction: 'Presiona "Aprobar Pago". La factura quedará en estado "PAGADA / CANCELADA" sin saldo pendiente de cobro.',
        proTip: 'El comprobante emitido detallará: Valor Factura $1.000.000, Recaudo Bancario $950.000, Descuento Pronto Pago $50.000.'
      }
    ],
    contingency: 'Si el cliente pagó de menos sin tener autorización de pronto pago, rechaza la rebaja y mantén la diferencia como saldo pendiente en mora.'
  },
  {
    id: 'ESC-CON-25',
    title: '¿Qué hacer si un cliente transfiere de más por error al pagar su factura?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Opción `paymentDiffHandling === "ADVANCE"` cancela la factura y genera automáticamente saldo a favor del cliente.',
    expectedResult: 'La factura se marca como pagada y el excedente queda disponible en la cuenta del cliente para su próxima compra.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Módulo Contable',
    synonyms: ['transfirio de mas', 'pago de mas cliente', 'excedente transferencia', 'saldo a favor error', 'devolver excedente'],
    summary: 'Tratamiento contable cuando un comprador digita mal el valor en su portal bancario y abona un importe superior a la factura.',
    steps: [
      {
        title: 'Confirmar la acreditación en el extracto bancario',
        instruction: 'Verifica que la transferencia haya entrado por el valor mayor (ej: factura de $450.000 pero consignó $540.000 por error de digitación).'
      },
      {
        title: 'Registrar el Recibo de Caja en Avalon V1',
        instruction: 'Digita los $540.000 recibidos y asócialos a la factura #F-302.'
      },
      {
        title: 'Seleccionar tratamiento: "Excedente como Anticipo (ADVANCE)"',
        instruction: 'Marca la opción de anticipo. Avalon saldará la factura por $450.000 y creará un Saldo a Favor por $90.000 COP a nombre del cliente.'
      },
      {
        title: 'Contactar al cliente para acordar la solución',
        instruction: 'Informa al cliente de la diferencia. Puedes acordar que ese saldo se aplique en su siguiente pedido o realizar la devolución bancaria.',
        warning: 'Si el cliente exige la devolución del dinero, no entregues efectivo; realiza transferencia bancaria a la misma cuenta de origen del cliente.'
      }
    ],
    contingency: 'Para devolver el excedente a su banco, tramita una Orden de Pago en Tesorería adjuntando la certificación bancaria del cliente.'
  },
  {
    id: 'ESC-CON-26',
    title: '¿Cómo enviar masivamente estados de cuenta y recordatorios de cobro de cartera por email?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Botón de despacho masivo que adjunta extracto de cartera en PDF con link de pago QR Bancolombia.',
    expectedResult: 'Los clientes reciben su estado de cuenta actualizado con facturas pendientes, fechas de vencimiento y datos de consignación.',
    route: '/sales-performance',
    routeLabel: 'Ir a Rendimiento Comercial & Cartera',
    synonyms: ['cobrar cartera', 'recordatorio de cobro', 'estado de cuenta correo', 'cobranza masiva', 'circular cartera'],
    summary: 'Automatización de la gestión preventiva de cobranzas para mantener la cartera sana y reducir el periodo medio de cobro (DSO).',
    steps: [
      {
        title: 'Ingresar al módulo de Control de Cartera',
        instruction: 'Navega a "Ventas & Ingresos > Rendimiento Comercial" en la pestaña de Cartera.'
      },
      {
        title: 'Filtrar facturas por edades de vencimiento',
        instruction: 'Selecciona el segmento a notificar: Por Vencer (1 a 7 días), Vencidas (1 a 30 días) o Cartera Morosa (>30 días).'
      },
      {
        title: 'Hacer clic en "Enviar Estado de Cuenta Masivo"',
        instruction: 'Presiona el botón de envío. Avalon generará un PDF personalizado para cada empresa con su saldo total y detalle de facturas.'
      },
      {
        title: 'Revisar la plantilla del mensaje',
        instruction: 'El correo incluirá un saludo cordial, el estado de cuenta en PDF adjunto y los datos de las cuentas corrientes de Procoquinal SAS.',
        proTip: 'Enviar recordatorios 3 días antes del vencimiento reduce los atrasos de pago en un 40%.'
      }
    ],
    contingency: 'Si el correo de un cliente rebota, actualiza el correo del área de Contabilidad o Tesorería en la ficha del CRM.'
  },
  {
    id: 'ESC-CON-27',
    title: '¿Cómo bloquear automáticamente despachos a clientes que superaron su cupo de crédito?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Guarda en el POS y en Despachos que bloquea cualquier pedido a crédito si la cartera está vencida o el cupo agotado.',
    expectedResult: 'El sistema impide la facturación y despacho protegiendo la liquidez de Procoquinal SAS.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['bloquear cliente cartera', 'cupo excedido', 'mora despacho', 'bloqueo por credito', 'cliente moroso no despachar'],
    summary: 'Control automático de riesgo crediticio que evita acumular deudas impagas con clientes morosos.',
    steps: [
      {
        title: 'Visualizar la alerta en el POS o Despachos',
        instruction: 'Al intentar facturar a crédito, Avalon desplegará un banner rojo: "BLOQUEO DE CRÉDITO: El cliente tiene 2 facturas con más de 30 días de mora. Cupo disponible: $0".'
      },
      {
        title: 'Consultar el detalle en el perfil del cliente en el CRM',
        instruction: 'Abre el perfil del cliente en CRM > Cartera para ver las facturas vencidas y el total adeudado.'
      },
      {
        title: 'Exigir abono previo para desbloquear',
        instruction: 'Explica al cliente que debe ponerse al día cancelando las facturas vencidas antes de procesar el nuevo pedido a crédito.'
      },
      {
        title: 'Excepción autorizada por Gerencia de Crédito',
        instruction: 'En casos especiales de contratos institucionales, el Gerente Financiero puede aplicar una "Autorización Excepcional de Despacho" mediante contraseña.',
        warning: 'Los asesores comerciales no tienen atribuciones para saltarse el bloqueo de cartera sin autorización superior.'
      }
    ],
    contingency: 'El cliente puede optar por pagar el nuevo pedido de contado (efectivo o transferencia) para llevarse el producto sin esperar el desbloqueo de cartera.'
  },
  {
    id: 'ESC-CON-28',
    title: '¿Cómo pactar y registrar un acuerdo de pago en cuotas para un cliente en mora?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite refinanciar facturas vencidas fraccionando el saldo en compromisos quincenales o mensuales.',
    expectedResult: 'Se emite el cronograma de pagos firmado y se reactiva condicionalmente la cuenta comercial del cliente.',
    route: '/crm',
    routeLabel: 'Ir a Clientes CRM',
    synonyms: ['acuerdo de pago', 'refinanciar deuda', 'pagar en cuotas', 'plan de pagos cliente', 'reestructurar cartera'],
    summary: 'Negociación formal con talleres automotrices o contratistas con dificultades de flujo de caja para recuperar cartera vencida.',
    steps: [
      {
        title: 'Reunión de conciliación de saldos con el deudor',
        instruction: 'Revisa con el cliente el monto total de la deuda acumulada (ej: $6.000.000 COP).'
      },
      {
        title: 'Acceder a "Acuerdos de Pago" en la ficha del cliente en CRM',
        instruction: 'Haz clic en "Crear Acuerdo de Pago / Refinanciación".'
      },
      {
        title: 'Configurar el número de cuotas y fechas de compromiso',
        instruction: 'Define el esquema (ej: 3 cuotas mensuales de $2.000.000 pagaderas los días 15 de cada mes).'
      },
      {
        title: 'Imprimir el acta de compromiso de pago',
        instruction: 'Genera el documento legal para firma del representante legal del cliente con pagaré en blanco adjunto.',
        proTip: 'Cumplir con la primera cuota desbloquea temporalmente al cliente para compras de contado con descuento.'
      }
    ],
    contingency: 'Si el cliente incumple la primera fecha pactada, el acuerdo se cancela y la cuenta se remite de inmediato a cobro jurídico.'
  },
  {
    id: 'ESC-CON-29',
    title: '¿Cómo registrar el castigo de cartera de difícil cobro (provisión contable)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Traslada la factura incobrable de la cuenta 1305 a la cuenta 1399 (Provisión de Cartera / Deterioro NIIF).',
    expectedResult: 'La cartera comercial se depura reflejando el valor real recuperable de los activos de la empresa.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['castigo de cartera', 'cartera incobrable', 'provision de cartera', 'deterioro niif cartera', 'dar de baja cliente moroso'],
    summary: 'Ajuste contable reglamentario bajo NIIF para deudas de clientes que entraron en liquidación judicial o ilocalizables por más de 360 días.',
    steps: [
      {
        title: 'Verificar el agotamiento de la vía prejudicial y jurídica',
        instruction: 'El departamento legal debe emitir el concepto de incobrabilidad (empresa liquidada sin bienes, embargo fallido).'
      },
      {
        title: 'Solicitar aprobación de la Junta Directiva o Revisor Fiscal',
        instruction: 'El castigo de cartera requiere acta formal de aprobación para efectos de deducibilidad en el impuesto sobre la renta.'
      },
      {
        title: 'Registrar el asiento de deterioro en Avalon V1',
        instruction: 'En la Sábana Contable, ejecuta "Causar Deterioro de Cartera": Débito a la cuenta 5199 (Gasto Deterioro de Cartera) y Crédito a la cuenta 1399 (Provisión Acumulada).'
      },
      {
        title: 'Inactivar al cliente permanentemente en el CRM',
        instruction: 'Marca la ficha del cliente como "INCUMPLIDO / REPORTADO" para que nunca más se le otorgue crédito en ninguna sucursal.',
        warning: 'El castigo contable no extingue la obligación legal del deudor si en el futuro se identifican activos embargables.'
      }
    ],
    contingency: 'Si milagrosamente el cliente cancela la deuda años después, el dinero se registra en la cuenta de recuperación de cartera castigada.'
  },
  {
    id: 'ESC-CON-30',
    title: '¿Cómo conciliar el extracto de cuenta del cliente contra las facturas activas en Avalon?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Genera el Extracto de Movimientos de Cartera cruzando facturas emitidas, notas crédito y recibos de caja.',
    expectedResult: 'El contador del cliente y el tesorero de Procoquinal llegan a un saldo de cartera consensuado al centavo.',
    route: '/sales-performance',
    routeLabel: 'Ir a Rendimiento Comercial',
    synonyms: ['conciliar cartera', 'extracto cliente', 'cruce de cuentas cliente', 'saldo no coincide cliente', 'circularizacion cartera'],
    summary: 'Proceso de conciliación bimensual para resolver discrepancias de saldos entre los libros de Procoquinal y la contabilidad de los compradores.',
    steps: [
      {
        title: 'Exportar el Libro Auxiliar de Cartera del cliente',
        instruction: 'En "Rendimiento Comercial > Cartera", busca el NIT del cliente y presiona "Descargar Extracto Cronológico".'
      },
      {
        title: 'Solicitar el extracto contable de cuentas por pagar del cliente',
        instruction: 'Pide al departamento de contabilidad de la empresa compradora su sábana de facturas pendientes con Procoquinal.'
      },
      {
        title: 'Cruzar factura por factura e identificar discrepancias',
        instruction: 'Compara números de factura, fechas y valores. Las diferencias típicas ocurren por:\n• Notas crédito por devolución que el cliente no ha contabilizado.\n• Retenciones en la fuente aplicadas por el cliente sin enviar el certificado.\n• Pagos que el cliente hizo al cierre de mes que Procoquinal registró en el mes siguiente.'
      },
      {
        title: 'Emitir el Acta de Conciliación de Saldos',
        instruction: 'Ambas empresas firman el acta de acuerdo dejando el saldo cerrado y conciliado.',
        proTip: 'Esta práctica evita sorpresas de glosas o facturas desconocidas al cierre del año fiscal.'
      }
    ],
    contingency: 'Si una factura física no aparece radicada en las oficinas del cliente, reenvía la copia de la tirilla firmada con el acuse de recibo de despacho.'
  },
  {
    id: 'ESC-CON-31',
    title: '¿Cómo anular un Recibo de Caja generado por error de monto o de cliente?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Cartera, Cobranzas & Recibos de Caja',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Anulación auditada de recibos de caja que restablece el saldo original de la factura a crédito.',
    expectedResult: 'El recibo erróneo queda en estado ANULADO, el saldo de la factura vuelve a su valor pendiente y se revierte el asiento bancario.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Módulo Contable',
    synonyms: ['anular recibo de caja', 'error recibo caja', 'me equivoque abonando', 'reversar pago cliente', 'deshacer abono'],
    summary: 'Corrección contable cuando el tesorero aplicó un abono bancario a la factura del cliente equivocado.',
    steps: [
      {
        title: 'Localizar el Recibo de Caja en el historial contable',
        instruction: 'En el módulo contable, busca el recibo de caja por número de comprobante (ej: RC-1044).'
      },
      {
        title: 'Hacer clic en "Anular Recibo de Caja"',
        instruction: 'Presiona el botón de anulación e ingresa el motivo obligatorio (ej: "Error de digitación: abono correspondía a Pinturas del Norte y no a Carrocerías El Sol").'
      },
      {
        title: 'Verificar la reversión automática de saldos',
        instruction: 'Avalon restaurará la deuda en la factura errónea y dejará el dinero libre para crear el recibo de caja con el cliente correcto.',
        warning: 'Nunca elimines físicamente un recibo de caja; el consecutivo debe quedar registrado como ANULADO para auditoría fiscal.'
      },
      {
        title: 'Generar el nuevo Recibo de Caja correcto',
        instruction: 'Procede a aplicar el pago sobre la empresa que realmente consignó el dinero.'
      }
    ],
    contingency: 'Si el recibo de caja ya fue reportado en la Sábana mensual exportada a SIIGO, notifica a la contadora para que anule el comprobante en el ERP contable.'
  },

  // =========================================================================
  // SUBTEMA 4: Conciliación Bancaria & Pasarelas de Datáfono (11 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CON-32',
    title: '¿Cómo conciliar masivamente transacciones de Datáfono con el extracto bancario?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo ConciliacionDatafonoTab cruza terminales Redeban, Credibanco y Bold contra ventas en pantalla.',
    expectedResult: 'Las operaciones quedan marcadas como "Conciliadas / Abonadas en Banco" detectando cobros pendientes de liquidar.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['conciliar datafono', 'cruzar tarjetas banco', 'extracto datafono', 'redeban conciliar', 'credibanco abonos', 'bold conciliar'],
    summary: 'Auditoría periódica para asegurar que todas las ventas cobradas con tarjeta de débito o crédito fueron transferidas a la cuenta de Procoquinal.',
    steps: [
      {
        title: 'Ingresar a "Contabilidad & Caja > Conciliación Datáfonos"',
        instruction: 'Navega a la pestaña de conciliación bancaria (/accounting/conciliacion_datafono).'
      },
      {
        title: 'Cargar el archivo de liquidación de la pasarela o extracto',
        instruction: 'Descarga el reporte de pagos de Redeban / Bold / Credibanco y súbelo al sistema en formato Excel o CSV.'
      },
      {
        title: 'Ejecutar el cruce automático de números de autorización',
        instruction: 'Avalon comparará cada voucher del POS con los registros bancarios por fecha, valor y código de aprobación.'
      },
      {
        title: 'Marcar estado de conciliación masiva',
        instruction: 'Revisa las coincidencias verdes y presiona "Conciliar Selección". Los movimientos bancarios quedarán confirmados.',
        proTip: 'El sistema identificará discrepancias por comisiones y retenciones tributarias automáticamente.'
      }
    ],
    contingency: 'Si una venta figura en Avalon pero no en el extracto del banco tras 72 horas hábiles, reporta el reclamo inmediato a la red de datáfonos.'
  },
  {
    id: 'ESC-CON-33',
    title: '¿Cómo registrar y causar las comisiones bancarias del datáfono (1.5% a 2.5% más IVA)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Desglosa la comisión bancaria en el input `bankFeeInput` y la imputa a la cuenta de gastos financieros 5305.',
    expectedResult: 'Se registra el ingreso neto al banco y se causa el gasto por comisión bancaria con su IVA descontable.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['comision datafono', 'gasto bancario tarjeta', 'tarifa pasarela', 'comision redeban', 'costo datáfono'],
    summary: 'Contabilización de los descuentos que aplican los bancos adquirentes sobre cada cobro electrónico realizado en el POS.',
    steps: [
      {
        title: 'Revisar la liquidación del abono del banco',
        instruction: 'Por ejemplo, para una venta de $100.000 COP, el banco abona $97.500 en la cuenta corriente.'
      },
      {
        title: 'Digitar el valor de la comisión bancaria en Avalon V1',
        instruction: 'En el modal de validación de Conciliación de Datáfonos, ingresa en "Comisión Bancaria / Fee" los $2.100 COP de tarifa más los $400 COP de IVA de comisión.'
      },
      {
        title: 'Imputar a las cuentas contables correspondientes',
        instruction: 'Avalon generará el asiento: Débito Banco ($97.500), Débito Gasto Comisión 530515 ($2.100), Débito IVA Descontable 240802 ($400) contra Crédito Tarjetas por Cobrar 1305 ($100.000).'
      },
      {
        title: 'Confirmar la conciliación de la línea',
        instruction: 'Presiona "Aprobar Conciliación". La cuenta quedará en balance perfecto sin diferencias.',
        proTip: 'El IVA cobrado en las comisiones del datáfono es descontable en la declaración bimestral de IVA de Procoquinal.'
      }
    ],
    contingency: 'Verifica mensualmente que la tasa de comisión cobrada por el banco coincida con la pactada en el contrato de afiliación.'
  },
  {
    id: 'ESC-CON-34',
    title: '¿Cómo cruzar las retenciones bancarias (ReteFuente, ReteIVA, ReteICA) aplicadas en el datáfono?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Inputs dedicados para ReteFuente (1.5%), ReteIVA y ReteICA practicadas en ventas con tarjeta.',
    expectedResult: 'Las retenciones se llevan a la cuenta 1355 (Anticipo de Impuestos) para descontarlas en las declaraciones de la DIAN.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['retenciones datafono', 'retefuente tarjeta', 'reteiva banco', 'reteica datafono', 'certificado retenciones banco'],
    summary: 'Aprovechamiento tributario de las retenciones que las entidades financieras descuentan por ley al liquidar pagos con tarjeta.',
    steps: [
      {
        title: 'Identificar los descuentos fiscales en el extracto de la terminal',
        instruction: 'Revisa las columnas de retención en la liquidación de Redeban o Bold:\n• ReteFuente (1.5% sobre base)\n• ReteIVA (15% del IVA facturado)\n• ReteICA (según la tarifa municipal del punto de venta).'
      },
      {
        title: 'Ingresar los montos en Conciliación Datáfonos',
        instruction: 'Diligencia los campos: `reteFuenteInput`, `reteIvaInput` y `reteIcaInput` en el formulario de validación de Avalon V1.'
      },
      {
        title: 'Asentar en la cuenta 1355 - Anticipos de Impuestos',
        instruction: 'Al conciliar, Avalon debitará las subcuentas de anticipo tributario para que la contadora las descuente en el formulario 350 de Retención en la Fuente.',
        warning: 'No registrar estas retenciones equivale a regalarle dinero al fisco, ya que son saldos a favor directos de la empresa.'
      }
    ],
    contingency: 'Descarga trimestralmente el Certificado de Retenciones por Datáfono desde el portal web del banco para cruzar contra Avalon.'
  },
  {
    id: 'ESC-CON-35',
    title: '¿Cómo importar extractos bancarios en Excel / CSV (Davivienda, Bancolombia, BBVA)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Parser inteligente que lee formatos de extracto de Davivienda, Bancolombia y BBVA adaptando columnas automáticamente.',
    expectedResult: 'Los movimientos bancarios del mes se cargan en la pantalla de conciliación listos para emparejar con las ventas.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['importar extracto', 'cargar extracto bancolombia', 'extracto davivienda excel', 'subir csv banco', 'leer extracto'],
    summary: 'Carga masiva de movimientos de cuentas corrientes y de ahorros para acelerar el cierre bancario mensual.',
    steps: [
      {
        title: 'Descargar el extracto en Excel desde la sucursal virtual del banco',
        instruction: 'Ingresa al portal de Bancolombia o Davivienda y descarga los movimientos en formato .xlsx o .csv.'
      },
      {
        title: 'Seleccionar el formato bancario en Avalon V1',
        instruction: 'En la cabecera de Conciliación, elige el banco emisor: "DAVIVIENDA", "BANCOLOMBIA" o "DATAFONO".'
      },
      {
        title: 'Subir el archivo con arrastrar y soltar (Drag & Drop)',
        instruction: 'Arrastra el archivo sobre el área de carga. El parser de Avalon extraerá Fecha, Descripción, Documento/Referencia y Valor neto.'
      },
      {
        title: 'Verificar la grilla de transacciones bancarias',
        instruction: 'Comprueba que las filas cargadas coincidan con el saldo inicial y final del extracto emitido por la entidad financiera.',
        proTip: 'Avalon ignora encabezados o pies de página decorativos del archivo del banco automáticamente.'
      }
    ],
    contingency: 'Si el banco cambió el formato de su archivo Excel, guárdalo como formato "CSV delimitado por comas" antes de subirlo.'
  },
  {
    id: 'ESC-CON-36',
    title: '¿Cómo usar las sugerencias de cruce asistido (Smart Reconciliation) para emparejar pagos?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Motor `suggestedMatches` vincula en milisegundos facturas con abonos bancarios con tolerancia de centavos.',
    expectedResult: 'El sistema empareja el 85% de las transacciones con un solo clic, dejando solo casos atípicos para revisión manual.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['smart reconciliation', 'cruce automatico banco', 'sugerencias conciliacion', 'emparejar pagos', 'ia conciliacion bancaria'],
    summary: 'Uso de algoritmos de coincidencia inteligente para ahorrar hasta 4 horas de cotejo manual de extractos.',
    steps: [
      {
        title: 'Cargar el extracto y abrir la vista dividida',
        instruction: 'Verás a la izquierda las ventas registradas en Avalon y a la derecha los créditos del extracto bancario.'
      },
      {
        title: 'Hacer clic en "Cruce Inteligente / Sugerencias"',
        instruction: 'El motor evaluará coincidencias por monto, fecha cercana (+/- 2 días) y coincidencia de NIT o razón social.'
      },
      {
        title: 'Revisar las parejas resaltadas en color violeta',
        instruction: 'Cada venta propuesta con su movimiento bancario mostrará una insignia de coincidencia sugerida.'
      },
      {
        title: 'Aprobar el lote de emparejamientos confirmados',
        instruction: 'Presiona "Aceptar Sugerencias Válidas". Todas las parejas se conciliarán en bloque de forma instantánea.',
        proTip: 'Dedica tu tiempo únicamente a revisar las partidas que quedaron sin emparejar (casos con deducciones especiales).'
      }
    ],
    contingency: 'Si una sugerencia no es correcta (ej: dos clientes compraron exactamente el mismo valor), desmarca la sugerencia para vincularla manualmente.'
  },
  {
    id: 'ESC-CON-37',
    title: '¿Qué hacer cuando el banco aplica un débito por contracargo o disputa de un tarjetahabiente?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Permite asentar contracargo debitando la cuenta bancaria y reactivando la cuenta por cobrar en disputa legal.',
    expectedResult: 'El saldo bancario se concilia y se inicia el expediente de defensa de contracargo con la franquicia (Visa/Mastercard).',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['contracargo tarjeta', 'disputa datafono', 'fraude tarjeta reclamo', 'debito no autorizado banco', 'reverso bancario'],
    summary: 'Protocolo de defensa y registro contable cuando el titular de una tarjeta desconoce una compra realizada en mostrador.',
    steps: [
      {
        title: 'Identificar el débito en el extracto bancario',
        instruction: 'En el extracto aparecerá un movimiento negativo con descripción "CONTRACARGO / RECLAMO FRANQUICIA #XXX".'
      },
      {
        title: 'Localizar el voucher físico firmado y la remisión de entrega',
        instruction: 'Busca en el archivo físico de caja el ticket firmado por el cliente y la remisión de despacho de la pintura con firma de recibido.'
      },
      {
        title: 'Registrar la incidencia de contracargo en Avalon V1',
        instruction: 'En Conciliación Datáfonos, selecciona "Registrar Contracargo en Disputa". El sistema moverá el saldo a "Cuentas por Cobrar en Litigio".'
      },
      {
        title: 'Enviar pruebas de descargo al banco antes del plazo límite',
        instruction: 'Envía a Redeban/Credibanco: Copia del voucher, factura de venta, remisión con firma y copia de la cédula del comprador.',
        warning: 'Las franquicias otorgan máximo 5 días hábiles para responder a un contracargo; si no se responde a tiempo, el dinero se pierde irremediablemente.'
      }
    ],
    contingency: 'Si el banco falla a favor de Procoquinal, el dinero será reintegrado a la cuenta en la siguiente liquidación.'
  },
  {
    id: 'ESC-CON-38',
    title: '¿Cómo identificar y registrar consignaciones bancarias no identificadas (consignaciones huérfanas)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Asienta el abono en la cuenta 280595 (Ingresos Recibidos para Terceros / Por Identificar) hasta cruzar con el cliente.',
    expectedResult: 'El extracto bancario se concilia sin descuadre y el dinero queda registrado a la espera de que el cliente reclame su pedido.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['consignacion no identificada', 'plata sin dueno banco', 'abono huerfano', 'transferencia desconocida', 'quien consigno'],
    summary: 'Manejo contable de abonos en cuenta que no tienen nombre, cédula ni referencia que permita asociarlos a un cliente de inmediato.',
    steps: [
      {
        title: 'Detectar el abono sin referencia en el extracto',
        instruction: 'Observa ingresos con descripciones genéricas como "CONSIGNACIÓN NACIONAL CORRESPONSAL" sin número de NIT.'
      },
      {
        title: 'Registrar en la cuenta de "Consignaciones por Identificar"',
        instruction: 'En Conciliación Bancaria, crea el registro transitorio hacia la cuenta de pasivo 280595 para no alterar ventas ni IVA ficticiamente.'
      },
      {
        title: 'Publicar la novedad en el grupo comercial de WhatsApp',
        instruction: 'Informa a los vendedores de mostrador y asesores de calle: "Hay una consignación de $845.000 COP efectuada en Sogamoso a las 11:30 AM; por favor confirmar con clientes".'
      },
      {
        title: 'Reclasificar cuando el cliente envíe el soporte',
        instruction: 'Apenas el comprador envíe la foto del comprobante físico, cruza el abono de la cuenta 2805 hacia la factura oficial del cliente.',
        proTip: 'Esta práctica evita despachar mercancía dos veces o dejar dinero flotando sin control contable.'
      }
    ],
    contingency: 'Si tras 60 días nadie reclama el dinero, notifica al banco para que certifique la cuenta de origen del depósito.'
  },
  {
    id: 'ESC-CON-39',
    title: '¿Cómo conciliar el Gravamen a los Movimientos Financieros (4x1.000) en el extracto?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Imputa el impuesto del 4x1.000 a la cuenta de gastos tributarios 511595 con cálculo automático.',
    expectedResult: 'Se concilia cada débito por impuesto financiero asegurando su certificación anual para deducción tributaria del 50%.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['4x1000', 'gravamen movimientos financieros', 'gmf banco', 'impuesto bancario', 'costo 4 por mil'],
    summary: 'Contabilización obligatoria del impuesto del 4 por mil aplicado sobre retiros y traslados bancarios corporativos.',
    steps: [
      {
        title: 'Filtrar las partidas de GMF en el extracto importado',
        instruction: 'En Conciliación Bancaria, busca los movimientos con código "GMF" o "GRAVAMEN MOV. FINANCIEROS".'
      },
      {
        title: 'Verificar la exactitud matemática del 4x1.000',
        instruction: 'El valor debe ser exactamente el 0.4% de cada retiro o transferencia efectuada hacia terceros.'
      },
      {
        title: 'Causar a la cuenta PUC 511595 (Impuestos Asumidos - GMF)',
        instruction: 'Asigna el asiento contable en lote para todas las retenciones del mes.'
      },
      {
        title: 'Separar el 50% deducible para la declaración de renta',
        instruction: 'Avalon marcará en la Sábana Contable la proporción deducible por ley según el Estatuto Tributario colombiano.',
        proTip: 'Si la cuenta principal está exenta por traslado entre cuentas de la misma titularidad, vigila que el banco no cobre el 4x1.000 por error.'
      }
    ],
    contingency: 'Si el banco cobra GMF sobre un traslado entre cuentas propias de Procoquinal, radica carta de reclamo solicitando la reversión inmediata.'
  },
  {
    id: 'ESC-CON-40',
    title: '¿Qué hacer si un cobro de tarjeta figura aprobado en Avalon pero nunca ingresó a la cuenta bancaria?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Reporte de "Partidas Conciliatorias Pendientes" que aísla cobros no abonados para reclamación formal.',
    expectedResult: 'Se genera el expediente con fecha, terminal y voucher para que la entidad financiera investigue la retención indebida.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['tarjeta no abonada', 'banco no consigno venta', 'plata retenida pasarela', 'voucher sin abonar', 'reclamo red de pagos'],
    summary: 'Gestión de cobros que el datáfono aprobó en mostrador pero que por fallas de comunicación no fueron dispersados a la cuenta bancaria.',
    steps: [
      {
        title: 'Identificar la venta en el reporte de partidas no conciliadas',
        instruction: 'En Conciliación Datáfonos, filtra las ventas con método "Tarjeta" que tengan más de 5 días de antigüedad sin conciliar.'
      },
      {
        title: 'Ubicar el voucher impreso original de la terminal',
        instruction: 'Comprueba que el voucher tenga número de lote, código de autorización y la leyenda "APROBADA".'
      },
      {
        title: 'Radicar ticket de reclamo en la pasarela de pagos',
        instruction: 'Ingresa al portal de soporte de Redeban / Bold / Credibanco y abre un caso bajo la categoría: "Transacción aprobada no abonada en liquidación".'
      },
      {
        title: 'Adjuntar el reporte de Avalon y la foto del voucher',
        instruction: 'Sube la evidencia y registra en la bitácora de Avalon el número de radicado del banco (ej: Caso Redeban #889201).',
        warning: 'Hacer este seguimiento mensual previene que cobros legítimos queden en el limbo financiero de las pasarelas.'
      }
    ],
    contingency: 'Una vez el banco abone el dinero extemporáneo, concilia la partida en el módulo contable con fecha de abono efectiva.'
  },
  {
    id: 'ESC-CON-41',
    title: '¿Cómo generar el informe mensual de partidas conciliatorias de bancos para la contadora?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Conciliación Bancaria & Pasarelas',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Exporta el Estado de Conciliación Bancaria en Excel con Saldos en Libros vs. Saldos en Extracto.',
    expectedResult: 'La contadora recibe el informe con el detalle de cheques girados no cobrados, consignaciones en tránsito y notas de ajuste.',
    route: '/accounting/conciliacion_datafono',
    routeLabel: 'Ir a Conciliación Datáfonos',
    synonyms: ['informe conciliacion bancaria', 'partidas conciliatorias', 'cierre bancario mensual', 'conciliacion para contadora', 'extracto vs libros'],
    summary: 'Documento contable obligatorio al cierre de cada mes que sustenta las diferencias transitorias entre el banco y los libros oficiales.',
    steps: [
      {
        title: 'Verificar que todos los movimientos conocidos estén procesados',
        instruction: 'Asegúrate de haber registrado comisiones, gravámenes y transferencias del mes a liquidar.'
      },
      {
        title: 'Hacer clic en "Exportar Informe de Conciliación Bancaria"',
        instruction: 'En la esquina de Conciliación, presiona el botón de descarga en Excel/PDF.'
      },
      {
        title: 'Revisar la estructura del informe emitido',
        instruction: 'El reporte mostrará:\n• Saldo según Libros de Avalon V1\n(+) Notas crédito bancarias no registradas en libros\n(-) Notas débito y comisiones pendientes\n(+) Consignaciones en tránsito\n(=) Saldo exacto según Extracto Bancario Oficial.'
      },
      {
        title: 'Firmar y anexar al legajo mensual',
        instruction: 'El Tesorero y la Contadora General firman el documento para soporte de los estados financieros.',
        proTip: 'Una conciliación bancaria limpia sin partidas de más de 30 días es síntoma de excelente salud administrativa.'
      }
    ],
    contingency: 'Si persiste una diferencia no explicada, revisa si hubo un cheque emitido el último día del mes que aún no ha sido cobrado en ventanilla.'
  },

  // =========================================================================
  // SUBTEMA 5: Sábana Operativa, PUC, SIIGO & Declaraciones Fiscales (14 Escenarios)
  // =========================================================================
  {
    id: 'ESC-CON-42',
    title: '¿Cómo exportar la Sábana Operativa mensual a Excel estructurada por cuentas PUC?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Módulo SabanaTab exporta planilla .xlsx con estructura PUC de 6 y 8 dígitos lista para interfaz contable.',
    expectedResult: 'Se descarga el libro contable de ventas, costos, recaudos e impuestos ordenado por fecha y comprobante.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['exportar sabana', 'sabana contable excel', 'libro diario puc', 'informe siigo excel', 'interfaz contabilidad'],
    summary: 'Descarga masiva de todas las transacciones operativas del periodo depuradas para presentación de impuestos y libros oficiales.',
    steps: [
      {
        title: 'Ingresar a "Contabilidad & Caja > Sábana Operativa"',
        instruction: 'Accede a la pestaña de sábana de movimientos (/accounting/sabana).'
      },
      {
        title: 'Definir el rango de fechas del mes a cerrar',
        instruction: 'Selecciona la fecha inicial (ej: 01 de junio) y fecha final (ej: 30 de junio).'
      },
      {
        title: 'Filtrar por atajos contables si se requiere',
        instruction: 'Puedes seleccionar "Todos", o ver únicamente "Ventas", "Compras", "Recaudos" o "Mermas".'
      },
      {
        title: 'Presionar "Exportar a Excel / SIIGO"',
        instruction: 'Avalon generará el archivo .xlsx con las columnas reglamentarias: Fecha, Cuenta PUC, Tercero NIT, Documento, Concepto, Débito, Crédito y Centro de Costos.',
        proTip: 'Verifica que la sumatoria de débitos sea exactamente igual a la sumatoria de créditos (partida doble perfecta).'
      }
    ],
    contingency: 'Si la exportación tarda en rangos de más de 6 meses, descarga en bloques trimestrales para optimizar el rendimiento del navegador.'
  },
  {
    id: 'ESC-CON-43',
    title: '¿Cómo importar la Sábana de Avalon V1 a SIIGO Cloud mediante plantilla plana?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Formato compatible con el archivo plano de Comprobantes Contables de SIIGO Cloud.',
    expectedResult: 'Las miles de ventas y recaudos de Avalon se cargan en SIIGO en menos de 5 minutos sin digitación manual.',
    route: '/accounting/siigo_sync',
    routeLabel: 'Ir a Sincronización SIIGO',
    synonyms: ['importar siigo', 'plano siigo', 'interfaz siigo cloud', 'cargar comprobantes siigo', 'conector siigo'],
    summary: 'Migración masiva de la facturación de mostrador y recaudos al software contable corporativo de la compañía.',
    steps: [
      {
        title: 'Exportar la Sábana en formato "Plantilla SIIGO"',
        instruction: 'En Avalon V1, selecciona "Exportar > Formato Interfaz SIIGO (.xlsx)".'
      },
      {
        title: 'Ingresar al portal de SIIGO Cloud de Procoquinal',
        instruction: 'Inicia sesión con el perfil contable en la plataforma web de SIIGO.'
      },
      {
        title: 'Ir a "Herramientas > Importar Comprobantes Contables"',
        instruction: 'Selecciona la opción de importación masiva por archivo plano Excel.'
      },
      {
        title: 'Subir el archivo y validar la estructura',
        instruction: 'SIIGO validará que los NITs de los clientes existan y que las cuentas contables estén activas.',
        warning: 'Si SIIGO alerta que un cliente nuevo no existe en su base de datos, el archivo creará el tercero automáticamente según la cédula o NIT de Avalon.'
      },
      {
        title: 'Procesar e incorporar a la contabilidad',
        instruction: 'Confirma la importación. Todos los comprobantes tipo F (Facturas) y RC (Recibos de Caja) quedarán contabilizados en el sistema fiscal.'
      }
    ],
    contingency: 'En caso de rechazo de alguna fila por caracteres especiales en el nombre del cliente, elimina tildes o comillas en el Excel y reintenta.'
  },
  {
    id: 'ESC-CON-44',
    title: '¿Cómo liquidar y generar el informe bimestral de IVA generado vs. IVA descontable?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Liquida cuenta 240801 (IVA Generado 19%) contra 240802 (IVA Descontable en Compras) para el Formulario 300 DIAN.',
    expectedResult: 'Se obtiene el saldo neto de IVA a pagar a la DIAN con el desglose de bases gravables de pinturas y materias primas.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['liquidar iva', 'formulario 300 dian', 'iva generado vs descontable', 'declaracion iva bimestral', 'iva por pagar'],
    summary: 'Cálculo del impuesto sobre las ventas para la presentación periódica ante la Dirección de Impuestos y Aduanas Nacionales.',
    steps: [
      {
        title: 'Seleccionar el bimestre fiscal a declarar',
        instruction: 'En la Sábana Operativa, filtra el rango (ej: Bimestre 3: Mayo - Junio).'
      },
      {
        title: 'Consultar el consolidado de la cuenta 2408',
        instruction: 'Revisa:\n• IVA Generado en Ventas (Crédito cuenta 240801): IVA cobrado a clientes en POS y facturas a crédito.\n• IVA Descontable en Compras (Débito cuenta 240802): IVA pagado a proveedores de resinas, solventes y fletes.'
      },
      {
        title: 'Calcular el Saldo Neto a Pagar',
        instruction: 'IVA Generado ($85.000.000) - IVA Descontable ($52.000.000) = IVA a Pagar a la DIAN: $33.000.000 COP.'
      },
      {
        title: 'Exportar el anexo de soporte para la DIAN',
        instruction: 'Presiona "Descargar Anexo Formulario 300". El archivo Excel contendrá los renglones exactos que la contadora debe transcribir al portal MUISCA.',
        proTip: 'Verifica que todas las notas crédito del periodo estén aplicadas para no pagar IVA sobre mercancía devuelta.'
      }
    ],
    contingency: 'Si el IVA descontable es mayor al generado, el sistema reportará "Saldo a Favor de IVA" compensable para el siguiente bimestre.'
  },
  {
    id: 'ESC-CON-45',
    title: '¿Cómo generar el Certificado de Retención en la Fuente para proveedores de materias primas?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Emite certificados anuales o bimestrales en PDF con base gravable, porcentaje y valor retenido.',
    expectedResult: 'El proveedor recibe su certificado legal firmado por el Revisor Fiscal para descontarlo de su impuesto de renta.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['certificado retencion en la fuente', 'certificado retefuente proveedor', 'retenciones practicadas', 'soporte tributario proveedor'],
    summary: 'Obligación legal de Procoquinal SAS como agente retenedor de expedir certificados de retenciones practicadas en compras de insumos.',
    steps: [
      {
        title: 'Filtrar por el NIT del proveedor',
        instruction: 'En la Sábana Contable, busca el proveedor de resinas o envases (ej: Corona Colombia SAS).'
      },
      {
        title: 'Seleccionar el año gravable',
        instruction: 'Elige el periodo anual correspondiente (ej: Año Gravable 2026).'
      },
      {
        title: 'Hacer clic en "Generar Certificado de Retención"',
        instruction: 'Avalon sumará la cuenta 2365 (Retención en la Fuente en Compras del 2.5%) y las bases de compras del periodo.'
      },
      {
        title: 'Descargar el PDF oficial y enviar por correo',
        instruction: 'El documento incluirá: Razón social Procoquinal SAS, NIT, Ciudad, Dirección, Base Sujeta a Retención, Tarifa y Monto Retenido.',
        warning: 'La no expedición oportuna de estos certificados acarrea sanciones monetarias de la DIAN contempladas en el artículo 667 del ET.'
      }
    ],
    contingency: 'Puedes activar el envío automático de certificados a la lista de correos de proveedores al inicio de cada año fiscal.'
  },
  {
    id: 'ESC-CON-46',
    title: '¿Cómo liquidar el ReteICA distrital según la actividad económica (Bogotá vs. Barranquilla)?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Aplica tarifas diferenciadas de Industria y Comercio según la ciudad del punto de venta (Tarifa Bogotá 11.04 por mil vs. Barranquilla 7 por mil).',
    expectedResult: 'Se obtiene la liquidación territorial exacta para el pago de impuestos municipales en cada secretaría de hacienda.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['reteica bogota', 'reteica barranquilla', 'industria y comercio', 'declaracion ica', 'tarifa ica pintura'],
    summary: 'Cálculo de impuestos territoriales municipales diferenciando las operaciones de la sede principal y las sucursales costeras.',
    steps: [
      {
        title: 'Filtrar por Centro Operativo / Ciudad',
        instruction: 'En la Sábana Operativa, selecciona Sede: "Bogotá (Centenario/Gaitán)" o Sede: "Barranquilla".'
      },
      {
        title: 'Verificar la cuenta PUC de ReteICA retenido (2368)',
        instruction: 'Comprueba los ingresos brutos operacionales generados en esa jurisdicción geográfica.'
      },
      {
        title: 'Aplicar la tarifa de la actividad económica de pinturas',
        instruction: 'Código CIIU 2022 (Fabricación de pinturas, barnices y revestimientos similares).'
      },
      {
        title: 'Generar el informe de soporte para la Secretaría de Hacienda',
        instruction: 'Descarga la planilla con la base gravable y el impuesto liquidado para la presentación en el portal de la Alcaldía Mayor de Bogotá o Barranquilla.',
        proTip: 'Mantener separadas las bases territoriales evita multas por inexactitud en auditorías de las secretarías de hacienda distritales.'
      }
    ],
    contingency: 'Si una venta se despachó desde Bogotá pero se entregó en Barranquilla, revisa la regla de territorialidad de la Ley 1819.'
  },
  {
    id: 'ESC-CON-47',
    title: '¿Cómo procesar facturas electrónicas de proveedores en el buzón XML de Avalon V1?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bandeja de entrada de facturas electrónicas que procesa archivos XML UBL 2.1 extrayendo subtotal, IVA y productos.',
    expectedResult: 'La factura del proveedor se radica automáticamente sin digitación manual de los 20 ítems comprados.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Módulo Contable',
    synonyms: ['buzon xml facturas', 'factura electronica proveedor', 'ubl 2.1', 'leer xml factura', 'radicar factura proveedor'],
    summary: 'Lectura inteligente de los comprobantes electrónicos que los fabricantes envían al buzón de correo tributario de Procoquinal.',
    steps: [
      {
        title: 'Acceder a "Buzón de Facturas Proveedores (Correo)"',
        instruction: 'En el módulo contable, visualiza la bandeja de facturas electrónicas entrantes.'
      },
      {
        title: 'Seleccionar la factura recibida (ej: Corona FE-84920)',
        instruction: 'Haz clic en el correo. El visor de Avalon mostrará los datos procesados del archivo XML adjunto: Proveedor, NIT, Subtotal, IVA y Total.'
      },
      {
        title: 'Hacer clic en "Radicar en Kárdex & Contabilidad"',
        instruction: 'Presiona el botón de radicación. El sistema cruzará la factura con la Orden de Compra previa y creará la cuenta por pagar.'
      },
      {
        title: 'Emitir los Acuses de Recibo de la DIAN',
        instruction: 'Avalon enviará automáticamente el Acuse de Recibo de la Factura y el Recibo de las Mercancías exigidos para que el costo sea deducible de renta.',
        warning: 'Sin los 3 eventos del RADIAN (Acuse, Recibo de Bienes y Aceptación Expresa), la factura no puede deducirse en la declaración de renta.'
      }
    ],
    contingency: 'Si el archivo XML viene corrupto o con error de firma digital, solicita al proveedor el reenvío inmediato del comprobante reglamentario.'
  },
  {
    id: 'ESC-CON-48',
    title: '¿Cómo ajustar diferencias de centavos por redondeo en la base de retenciones e impuestos?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Imputa discrepancias de redondeo (< $50 COP) a la cuenta 5395 (Ajuste al Peso / Diferencia por Redondeo).',
    expectedResult: 'El balance de la Sábana queda en partida doble 100% cuadrada eliminando descuadres de centavos.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['ajuste al peso', 'diferencia centavos', 'redondeo impuestos', 'cuadre centavos', 'diferencia decimales'],
    summary: 'Subsanación técnica de pequeñas discrepancias matemáticas producidas por el cálculo de porcentajes con decimales.',
    steps: [
      {
        title: 'Identificar el descuadre de redondeo al pie de la Sábana',
        instruction: 'Observa si la sumatoria de débitos y créditos presenta una diferencia minúscula (ej: Débitos $12.450.231 vs Créditos $12.450.230; diferencia de $1 peso).'
      },
      {
        title: 'Hacer clic en "Ajuste Automático al Peso"',
        instruction: 'Presiona el botón de ajuste en la esquina de la Sábana Contable.'
      },
      {
        title: 'Confirmar el asiento de compensación',
        instruction: 'Avalon creará una micro-línea imputada a la cuenta 539595 (Gastos Diversos - Ajuste al Peso) equilibrando el balance a cero.',
        proTip: 'Esta función es estándar en todos los ERPs contables modernos para evitar que una diferencia de $1 peso bloquee la exportación a SIIGO.'
      }
    ],
    contingency: 'Si la diferencia es mayor a $1.000 COP, no uses ajuste al peso; investiga qué factura tiene un impuesto mal calculado.'
  },
  {
    id: 'ESC-CON-49',
    title: '¿Qué hacer si una factura electrónica de venta es rechazada por la DIAN?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Muestra código de rechazo del web service de la DIAN, permite corregir datos y reenviar con el mismo consecutivo.',
    expectedResult: 'La factura subsanada obtiene el código CUFE y queda timbrada legalmente ante la autoridad tributaria.',
    route: '/pos-history',
    routeLabel: 'Ir al Historial de Turno',
    synonyms: ['factura rechazada dian', 'error cufe', 'rechazo web service dian', 'factura no valida', 'error transmision dian'],
    summary: 'Resolución de inconsistencias en el envío de comprobantes electrónicos a la plataforma de la DIAN.',
    steps: [
      {
        title: 'Leer el mensaje de error emitido por la DIAN',
        instruction: 'Causales comunes de rechazo:\n• "Regla FA03: El NIT del comprador no es válido o dígito de verificación errado".\n• "Regla ZD01: Código postal no corresponde al municipio".\n• "Regla CP02: Falta indicar el medio de pago o fecha de vencimiento".'
      },
      {
        title: 'Corregir el dato en la ficha del cliente en Avalon V1',
        instruction: 'Ve a CRM > Clientes, localiza la empresa y corrige el dígito de verificación o dirección tributaria del RUT.'
      },
      {
        title: 'Hacer clic en "Reenviar a la DIAN"',
        instruction: 'En el Historial de Facturas, pulsa el botón de reenvío con ícono de nube. Avalon volverá a generar el XML firmado digitalmente.'
      },
      {
        title: 'Verificar la respuesta de éxito',
        instruction: 'El estado cambiará a "EMITIDA / VALIDADA DIAN" y se generará el código CUFE oficial.',
        warning: 'Una factura rechazada por la DIAN debe corregirse dentro de las 48 horas siguientes para no incurrir en sanción por facturación extemporánea.'
      }
    ],
    contingency: 'Si el portal de la DIAN está caído por contingencia general (Contingencia Tipo 04), emite la factura con numeración de contingencia física.'
  },
  {
    id: 'ESC-CON-50',
    title: '¿Cómo generar el reporte de Medios Magnéticos (Información Exógena DIAN) al cierre de año?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Compila formatos 1001 (Pagos a terceros), 1003 (Retenciones recibidas) y 1007 (Ingresos propios) por NIT de tercero.',
    expectedResult: 'Se descargan las tablas en Excel con la estructura de columnas exacta exigida por el prevalidador tributario de la DIAN.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['medios magneticos', 'informacion exogena dian', 'formato 1001', 'formato 1007', 'prevalidador dian', 'cierre exogena'],
    summary: 'Preparación anual masiva de los reportes tributarios que Procoquinal debe remitir a la DIAN sobre sus operaciones con terceros.',
    steps: [
      {
        title: 'Acceder a "Informes Fiscales > Exógena DIAN"',
        instruction: 'En la Sábana Contable, selecciona el año fiscal cerrado a reportar.'
      },
      {
        title: 'Seleccionar el formato requerido',
        instruction: 'Elige: Formato 1007 (Ingresos Brutos por Cliente), Formato 1001 (Pagos y Abonos en Cuenta a Proveedores) o Formato 1003 (Retenciones que nos practicaron).'
      },
      {
        title: 'Verificar la depuración de terceros',
        instruction: 'Comprueba que no existan registros bajo "Consumidor Final 222222222222" que superen los topes de cuantías menores autorizados.'
      },
      {
        title: 'Exportar a Excel para el Prevalidador de la DIAN',
        instruction: 'Presiona "Descargar Formato Exógena". El archivo se cargará directamente en el prevalidador oficial de la DIAN para generar el archivo XML de envío.',
        proTip: 'Esta exportación ahorra semanas enteras de digitación manual al equipo de Contabilidad y Revisoría Fiscal.'
      }
    ],
    contingency: 'Si un proveedor cambió de razón social durante el año, el sistema consolidará todas sus facturas bajo su número de NIT único.'
  },
  {
    id: 'ESC-CON-51',
    title: '¿Cómo auditar los márgenes brutos y costos de venta consolidados antes del cierre contable anual?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Cruza cuenta 4135 (Ingresos) vs. cuenta 6135 (Costo de Mercancía Vendida) calculando el margen bruto real de la empresa.',
    expectedResult: 'La gerencia y los socios verifican la rentabilidad neta antes de decretar dividendos o reservas legales.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['margen bruto contable', 'costo de ventas consolidado', 'cuenta 6135 vs 4135', 'cierre anual rentabilidad', 'estado de resultados'],
    summary: 'Evaluación del margen de contribución de Procoquinal SAS para asegurar que los costos de inventario estén correctamente absorbidos.',
    steps: [
      {
        title: 'Seleccionar el consolidado anual en la Sábana',
        instruction: 'Filtra el rango completo de los 12 meses del ejercicio contable.'
      },
      {
        title: 'Comparar Ingresos Operacionales vs. Costos',
        instruction: 'Revisa: Ingresos Netos por Pinturas y Resinas (Crédito cuenta 4135) frente a Costo de Ventas (Débito cuenta 6135).'
      },
      {
        title: 'Calcular el Margen Bruto Porcentual',
        instruction: '(Ingresos - Costos) / Ingresos * 100. El indicador meta de Procoquinal debe situarse entre el 32% y el 38% de margen bruto.'
      },
      {
        title: 'Detectar desviaciones por líneas de producto',
        instruction: 'Filtra por familia para constatar qué líneas fueron las más rentables (ej: Vetro Premium vs. Solventes industriales).',
        proTip: 'Si el margen cae por debajo del 25%, revisa si hubo incrementos en materias primas importadas que no se trasladaron al precio de venta.'
      }
    ],
    contingency: 'En caso de inconsistencias en el costo, audita si se practicaron correctamente los ajustes de Kárdex por conteo físico.'
  },
  {
    id: 'ESC-CON-52',
    title: '¿Cómo conciliar y reclasificar ventas canceladas con bonos de regalo o cupones corporativos?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Flujo Cotidiano',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Registra pago con cupón contra la cuenta de pasivo 2805 (Bonos en Circulación) sin alterar la base de IVA.',
    expectedResult: 'La factura se cancela, se emite la tirilla y el bono se redime de forma transparente en el balance contable.',
    route: '/accounting/cierres',
    routeLabel: 'Ir a Módulo Contable',
    synonyms: ['bono de regalo', 'cupon de descuento', 'redimir bono', 'tarjeta regalo contabilidad', 'pago con bono'],
    summary: 'Manejo contable y fiscal cuando un cliente redime un bono comercial emitido previamente por la compañía.',
    steps: [
      {
        title: 'Verificar la vigencia y autenticidad del bono corporativo',
        instruction: 'Comprueba el código alfanumérico del bono en el sistema de fidelización.'
      },
      {
        title: 'Cobrar en el POS seleccionando método "Bono / Cupón"',
        instruction: 'Ingresa el código del bono. El total a pagar en efectivo se reducirá en el valor facial del bono.'
      },
      {
        title: 'Causar en la Sábana Contable',
        instruction: 'Avalon debitará la cuenta de pasivo 280510 (Bonos Pendientes de Redimir) en lugar de la cuenta de efectivo o bancos.'
      },
      {
        title: 'Inactivar el código del bono',
        instruction: 'El sistema marcará el bono como "REDIMIDO" impidiendo que sea reutilizado en otra sucursal.',
        warning: 'El IVA debe liquidarse sobre el valor total de la mercancía entregada independientemente de si se pagó con bono.'
      }
    ],
    contingency: 'Si el valor de la compra es menor al bono, el saldo restante se mantiene en el cupón si es de modalidad recargable.'
  },
  {
    id: 'ESC-CON-53',
    title: '¿Cómo emitir una Nota Débito comercial por cobro de intereses o fletes no facturados?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Corrección Operativa',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Emite Nota Débito electrónica que incrementa el saldo adeudado por el cliente con transmisión a la DIAN.',
    expectedResult: 'Se genera el documento tributario y la cartera del cliente aumenta en el valor exacto del cargo adicional.',
    route: '/returns',
    routeLabel: 'Ir a Devoluciones & Notas',
    synonyms: ['nota debito comercial', 'cobrar intereses mora', 'nota debito cliente', 'aumentar saldo factura', 'cargo adicional factura'],
    summary: 'Emisión de documentos tributarios oficiales cuando se debe cargar un sobrecosto acordado posterior a la factura inicial.',
    steps: [
      {
        title: 'Acceder a "Contabilidad & Caja > Notas Débito / Devoluciones"',
        instruction: 'Navega al panel de notas comerciales (/returns).'
      },
      {
        title: 'Seleccionar "Nueva Nota Débito Electrónica"',
        instruction: 'Busca la factura original emitida al cliente.'
      },
      {
        title: 'Ingresar el concepto y valor del cargo',
        instruction: 'Selecciona la causal: "Cobro de Intereses de Mora Pactados", "Gastos de Flete Adicional no Cobrado" o "Ajuste de Precio".'
      },
      {
        title: 'Transmitir a la DIAN y enviar al cliente',
        instruction: 'Presiona "Aprobar y Emitir Nota Débito". El documento se firmará con código CUDE y se sumará al saldo pendiente en la cuenta 1305.',
        proTip: 'Las Notas Débito no pueden usarse para corregir errores de inventario; son exclusivamente financieras o de flete.'
      }
    ],
    contingency: 'Asegúrate de adjuntar la liquidación de la tasa de usura vigente certificada por la Superfinanciera para sustentar el cobro de intereses.'
  },
  {
    id: 'ESC-CON-54',
    title: '¿Cómo archivar y custodiar digitalmente los documentos contables según la Ley 594 de Archivo?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Apertura / Cierre',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Resguardo en la nube con copias de seguridad automáticas e inmutabilidad de registros por 10 años.',
    expectedResult: 'Toda la documentación contable, facturas y soportes quedan protegidos contra pérdidas físicas o incendios.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['archivo contable', 'custodia digital', 'guardar documentos 10 anos', 'ley general de archivo', 'copia de seguridad contable'],
    summary: 'Cumplimiento de las normas de conservación de libros y soportes contables exigidas por el Código de Comercio de Colombia.',
    steps: [
      {
        title: 'Comprender el periodo legal de conservación',
        instruction: 'El Código de Comercio (Art. 60) exige conservar los libros y comprobantes contables por al menos 10 años contados desde su cierre.'
      },
      {
        title: 'Generar la copia de respaldo mensual de la Sábana',
        instruction: 'Al cierre de cada mes, descarga el backup consolidado en formato .xlsx y .json desde la Sábana Operativa.'
      },
      {
        title: 'Almacenar en el repositorio digital seguro de Procoquinal',
        instruction: 'Guarda los archivos en la nube corporativa segura con redundancia geográfica.'
      },
      {
        title: 'Empastar o legajar los soportes físicos originales',
        instruction: 'Archiva los comprobantes físicos (Cierres Z, Vouchers, Recibos de Caja Menor) en cajas rotuladas con índice en el archivo central.',
        proTip: 'La digitalización en Avalon V1 permite localizar un soporte de hace 5 años en menos de 10 segundos.'
      }
    ],
    contingency: 'Verifica semestralmente la integridad de los backups restaurando un periodo de prueba en un ambiente de desarrollo.'
  },
  {
    id: 'ESC-CON-55',
    title: '¿Cómo auditar transacciones sospechosas o anulaciones reiteradas en el módulo contable?',
    module: 'Contabilidad & Caja',
    moduleId: 'contabilidad',
    subtopic: 'Sábana Contable, SIIGO & DIAN',
    category: 'Error / Alerta',
    status: 'aprobado',
    statusNote: 'Probado en Avalon V1: Bitácora de Eventos forense que registra IP, navegador, usuario, hora y valores antes y después de cada anulación.',
    expectedResult: 'El auditor interno detecta patrones irregulares o intentos de fraude en tiempo récord.',
    route: '/accounting/sabana',
    routeLabel: 'Ir a Sábana Operativa',
    synonyms: ['auditar fraudes', 'transacciones sospechosas', 'anulaciones repetidas', 'auditoria forense contable', 'bitacora de seguridad'],
    summary: 'Monitoreo de seguridad preventiva para identificar comportamientos atípicos en cajas, descuentos o anulaciones de facturas.',
    steps: [
      {
        title: 'Filtrar por eventos de tipo "ANULACIÓN / REVERSO"',
        instruction: 'En la Sábana Contable, activa el filtro de comprobantes anulados en los últimos 30 días.'
      },
      {
        title: 'Analizar concentración por usuario o terminal',
        instruction: 'Verifica si un cajero específico concentra más del 80% de las anulaciones o notas crédito de la tienda.'
      },
      {
        title: 'Comparar horas de ejecución',
        instruction: 'Presta atención a movimientos efectuados minutos después del horario de cierre habitual o durante los fines de semana.'
      },
      {
        title: 'Cruzar con las cámaras de seguridad del mostrador',
        instruction: 'Coteja el minuto exacto del evento en Avalon V1 con la cámara para verificar si el cliente realmente devolvió la mercancía o si el dinero fue sustraído.',
        warning: 'Todo usuario que intente borrar registros de auditoría queda suspendido automáticamente por las políticas de seguridad del sistema.'
      }
    ],
    contingency: 'En caso de confirmarse un intento de fraude, emite el informe reservado a la Gerencia General y el departamento jurídico.'
  }
];
