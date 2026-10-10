# ☢️ PROTOCOLOS DE EMERGENCIA Y CONTINGENCIA (AVALON DEFCON) ☢️

Este documento define la arquitectura y los procedimientos tácticos del "Búnker de Emergencia" (Panel de Control Fuera de Banda) para la plataforma Avalon V1. Estos protocolos están diseñados para operar bajo escenarios de misión crítica, ciberataques, fallas en cascada o compromisos de seguridad internos.

---

## 🏗️ 1. ARQUITECTURA DEL BÚNKER (OUT-OF-BAND)

El panel de emergencia no debe depender de la infraestructura principal (GKE/Compute Engine).
- **Backend Aislado:** Contenedor Serverless (Google Cloud Run) independiente de la red principal.
- **Base de Datos de Estado:** Google Cloud Firestore (para aprovechar los *Realtime Listeners* y empujar el estado a los clientes sin latencia).
- **Fallback UI:** Interfaz estática inmutable alojada en Firebase Hosting, accesible mediante una URL secreta (ej. `sos.scarpian-admin.com`), usada solo si el frontend principal de Avalon colapsa.

---

## 🔴 2. PROTOCOLOS DE REACCIÓN MANUAL (CONTROL DESDE EL BÚNKER)

### 2.1 Pausa Global (Protocolo DEFCON 1)
- **Definición:** Bloqueo total de la operación. El sistema pasa a modo "Solo Lectura / Mantenimiento".
- **Two-Man Rule (Regla de Dos Llaves):** Su activación exige la autenticación simultánea de dos perfiles `MASTER_ADMIN` mediante Token/MFA dentro de una ventana de tiempo estricta.
- **Acción:** Corta tráfico a nivel WAF/Load Balancer, bloquea escrituras en BD y encola eventos en modo "Fail-Safe".

### 2.2 Lockdown de Accesos (Frontera Cerrada)
- **Definición:** Bloqueo preventivo de inicios de sesión.
- **Acción:** Al activarse el switch `RESTRICT_AUTH`, el sistema de autenticación rechaza cualquier nuevo token JWT. **Nadie** puede iniciar sesión, excepto los usuarios con rol `MASTER_ADMIN`. Las sesiones activas de usuarios normales pueden ser revocadas masivamente.

### 2.3 Kill-Switches Granulares (Circuit Breakers)
Permiten degradación elegante (Graceful Degradation) sin apagar toda la planta:
- **Switch Motor de IA (EMP):** Apaga instantáneamente el uso de Modelos de Lenguaje (LLMs) si hay alucinaciones o inyección de prompts, revirtiendo el sistema a automatizaciones clásicas.
- **Switch APIs Externas:** Detiene la comunicación con pasarelas de pago o proveedores si reportan latencias extremas.
- **Switch Motor de Ventas:** Evita la creación de nuevas transacciones en el POS/Checkout.
- **Switch Cronjobs:** Detiene envíos masivos de correos, conciliaciones y workers en segundo plano.

### 2.4 Protocolo "Freeze & Snapshot" (Ojo de Dios)
- **Definición:** Congela la sesión de todos los usuarios (o de grupos específicos) para auditoría en tiempo real.
- **Acción:** Emite un evento WebSocket (`EMERGENCY_FREEZE`). El frontend de cada cliente bloquea la UI con un overlay de seguridad opaco, ejecuta `html2canvas` para capturar la pantalla exacta de lo que estaban haciendo, y envía esa imagen junto con el estado de su navegador directo al Búnker.

### 2.5 Neutralización de Usuario Específico (Francotirador Táctico)
- **Definición:** Acción dirigida contra una amenaza interna.
- **Acción:** Si se detecta a un empleado haciendo algo sospechoso, un botón en el panel invalida instantáneamente su token JWT, corta su conexión WebSocket y lo expulsa a la pantalla de login, bloqueando su IP y su usuario.

### 2.6 Sistema de Intercomunicador (Override Broadcast)
- **Definición:** Alerta crítica e ineludible para todo el personal.
- **Acción:** Se redacta un mensaje en el Búnker que se superpone (override) a pantalla completa en todas las terminales conectadas (ej. "APAGUE LA MÁQUINA AHORA"). El usuario no puede seguir trabajando hasta confirmar que leyó el mensaje.

### 2.7 Control Térmico (Throttling / Degradación Controlada)
- **Definición:** En caso de ataque DDoS o picos anormales de tráfico (scraping abusivo).
- **Acción:** Un dial en el panel de emergencia permite inducir un retraso forzado en las respuestas del servidor (ej. +2000ms por request). Esto agota a los bots automatizados y enfría el servidor, permitiendo que los usuarios humanos (aunque lentos) sigan operando.

---

## 🤖 3. PROTOCOLOS AUTOMATIZADOS (DEFENSAS ACTIVAS)

### 3.1 Tripwires (Cables Trampa)
Límites de comportamiento automatizados que disparan bloqueos sin intervención humana.
- **Ejemplo A:** Eliminación de más de 5 registros críticos (clientes, facturas) en menos de 1 minuto.
- **Ejemplo B:** Intento de exportación masiva de inventario o cartera fuera de horario laboral aprobado.
- **Acción Automática:** Cierra el WebSocket del atacante, revoca el JWT y envía alerta máxima (SMS/PagerDuty) a ingeniería.

### 3.2 Modo Fantasma (Shadow Ban / Sandboxing)
- **Definición:** Trampa táctica para amenazas internas (se activa manual o por Tripwire).
- **Acción Automática:** El usuario sospechoso no es expulsado del sistema (para que no sepa que fue descubierto). La UI sigue respondiendo y mostrando mensajes de "Éxito", pero todas sus mutaciones (POST, PUT, DELETE) se desvían a una base de datos de basura (Sandbox) y no afectan los datos reales. Permite auditar sus intenciones.

### 3.3 Dead Man's Switch (Interruptor de Hombre Muerto)
- **Definición:** Protección extrema contra compromisos de la cadena de mando (secuestros, pérdida de acceso de fundadores).
- **Acción Automática:** Si el sistema no recibe un inicio de sesión validado criptográficamente por un `MASTER_ADMIN` durante `X` días, ejecuta un Lockdown Total: cifra bases de datos sensibles, revoca accesos de exportación y bloquea cuentas bancarias integradas hasta recibir una llave maestra de recuperación.

### 3.4 Modo Pánico Visual (Anti-Raid / Data Masking)
- **Definición:** Diseñado para amenazas físicas (ej. alguien no autorizado entra observando pantallas en oficinas).
- **Acción Automática (o vía atajo de teclado):** Al presionar una combinación secreta de teclas (ej. `ESC` tres veces rápidas), se inyecta una clase CSS global. Todos los datos financieros, balances, costos reales y nombres de clientes se reemplazan por `****` o se difuminan (blur). Permite al cajero seguir operando a ciegas sin revelar inteligencia de negocios a los observadores.

---
*Este documento debe ser mantenido bajo extrema confidencialidad y sus directrices implementadas progresivamente en la hoja de ruta de desarrollo de Scarpian AI / Avalon.*
