# Uso de la plataforma

Solo las cuentas activas de `platform_admins` pueden abrir `/uso-plataforma.html` y consultar `/api/usage-report`. El botón aparece en la sesión de Herramientas y en Administrar accesos. No se agrega a las herramientas disponibles de las ASADAS ni a permisos externos.

## Activación

1. Publicar los archivos de la actualización, conservando las carpetas originales en la raíz del proyecto. Netlify reconstruye el sitio.
2. El esquema aditivo `usage-schema.sql` se aplicó en el proyecto conectado al preparar esta actualización. Si se usa otro proyecto, aplicar ese esquema antes de publicar.
3. Entrar con la cuenta administradora de Star Water, abrir Herramientas y seleccionar **Uso de la plataforma**.
4. Hacer una visita con una cuenta de ASADA. Se registra una apertura; después de aproximadamente un minuto de interacción aparece tiempo activo. En Star Water presionar Consultar actividad.

## Qué mide

Aperturas de páginas privadas de herramientas, tiempo activo aproximado, fecha, herramienta, ASADA y persona identificada por su cuenta. No mide tiempo anterior a la publicación. No utiliza contraseñas ni recopila contenido de formularios, archivos, consultas o teclas escritas. Un aviso aparece dentro de las herramientas para informar a las personas del registro.

Se diferencia el acceso de prueba del contratado según la situación al registrar cada actividad. Al convertir una prueba en contrato, los datos anteriores mantienen la categoría Prueba. Cuentas sin actividad no aparecen como activas en los resultados, aunque sí pueden estar registradas en Administrar accesos.

Se envía un pulso inicial y pulsos de hasta 60 segundos mientras hay actividad; se pausa tras dos minutos sin interacción y al ocultarse la pestaña. Un permiso de pestaña local y un reloj por persona en el servidor reducen el doble conteo entre pestañas y dispositivos. El servidor limita el tiempo acreditado al tiempo transcurrido y descarta secuencias duplicadas. Es una estimación, no evidencia de productividad ni registro de asistencia. Conexiones fallidas, cierre brusco, bloqueos del navegador y cambios rápidos de página pueden disminuir el tiempo acreditado. No se reenvían pulsos fallidos.

Los informes usan agregados diarios en horario de Costa Rica, intervalos de hasta 93 días y filtros por ASADA, persona y tipo de acceso. No se descarga un listado limitado de eventos para calcular totales: la base de datos agrega los resultados completos del período. Las aperturas incluyen navegación entre herramientas y no deben interpretarse como inicios de sesión.

## Seguridad y mantenimiento

Las tres tablas y las dos funciones tienen RLS/permisos restringidos al servidor (service_role). No se publica ninguna clave privada. El servidor obtiene la ASADA y el usuario desde la sesión autenticada, valida la herramienta y sus permisos y no acepta IDs de ASADA proporcionados por el navegador. El informe requiere autorización de administrador de plataforma en cada solicitud. Los datos de otras ASADAS no se entregan a usuarios ordinarios.

Los identificadores temporales de páginas de cada persona se limpian después de siete días al registrar actividad nueva. Los agregados diarios se conservan hasta una decisión de retención explícita; supervisar el crecimiento de almacenamiento y las invocaciones de Netlify conforme aumenten las cuentas. El contador se detiene al vencer la prueba o suspenderse el acceso. La estadística falla de forma independiente y no bloquea el trabajo de las herramientas.
