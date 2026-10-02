# Star Water · Acceso privado para ASADAS

Esta versión prepara el inicio de sesión con correo y contraseña, cuentas vinculadas a una ASADA y el panel de Star Water para crear ASADAS, crear cuentas, restablecer contraseñas y activar o suspender accesos.

**Estado:** código preparado y probado localmente con respuestas simuladas del servicio de cuentas. Se crearon el proyecto de Supabase, las tablas y la cuenta administradora de Star Water. Se registraron las tres variables en Netlify. Falta publicar las funciones y verificar el acceso con el servicio real. La página anterior sigue funcionando; no está protegida por este paquete hasta que se despliegue esta versión.

## Qué contiene

- Página pública del programa, precios actuales, agua y WhatsApp.
- `public/acceso.html`: entrada con correo y contraseña.
- `public/administrar-accesos.html`: panel de Star Water. El servidor exige autorización de administrador para cada operación.
- `private/`: herramientas, análisis y documentos que el servidor entrega únicamente a personas autorizadas.
- `netlify/functions/gateway.mjs`: verifica identidad, ASADA y estado del acceso en cada solicitud. Las sesiones usan una cookie HttpOnly y segura.
- `supabase/`: estructura de ASADAS y cuentas con permisos públicos revocados.

Esta primera etapa controla el acceso. Los formularios conservan el comportamiento anterior: los resultados se descargan y todavía no se guardan como expedientes en línea. No incluye pagos automáticos ni historial de documentos. Todas las funciones de Administración, Junta Directiva y Operación tienen acceso al mismo conjunto de herramientas; su función se registra para identificar cada cuenta.

## Activación acompañada

1. Conectar la integración de Supabase en ChatGPT y seleccionar o crear un proyecto para Star Water. La creación de un proyecto con costo se debe autorizar antes de realizarla.
2. Ejecutar `supabase/01_accesos.sql` en ese proyecto. No ejecutarlo en una base existente que tenga tablas de esos nombres sin revisar los conflictos.
3. Crear la primera cuenta de Star Water en Authentication > Users, usando una contraseña propia. Sustituir el correo de ejemplo de `supabase/02_propietario.sql` por el correo de esa cuenta y ejecutar el archivo. La cuenta se administra en Supabase; no se escribe una contraseña en el código.
4. Desactivar el registro libre de usuarios en Supabase. La creación de cuentas se realiza desde el panel de Star Water. Configurar límites de autenticación y una política de contraseñas de al menos 12 caracteres.
5. Configurar en Netlify, con alcance para Functions, estas variables:
   - `SUPABASE_URL`: URL del proyecto.
   - `SUPABASE_ANON_KEY`: clave Publishable (`sb_publishable_...`) del proyecto para autenticación. El nombre de la variable se conserva por compatibilidad.
   - `SUPABASE_SERVICE_ROLE_KEY`: clave Secret (`sb_secret_...`) del servidor. El nombre de la variable se conserva por compatibilidad. Marcar como secreta y limitar a Functions. Nunca ponerla en HTML, archivos publicados, mensajes, capturas o un repositorio. El servidor también admite la clave service_role anterior.
6. Publicar el proyecto en el mismo sitio de Netlify mediante un repositorio conectado o Netlify CLI. Usar Node 20 o posterior. El archivo `netlify.toml` ya contiene el directorio publicado, las funciones y las rutas privadas.
7. Abrir `/acceso.html`, entrar con la cuenta de Star Water y abrir `/administrar-accesos.html`. Registrar una ASADA y las cuentas de sus integrantes.
8. Crear dos ASADAS de prueba. Confirmar en el entorno publicado que las cuentas muestran su ASADA correcta, que no pueden administrar accesos, que suspender una cuenta o una ASADA impide abrir herramientas y que la entrada, salida y cambio de contraseña funcionan. Revisar que las herramientas no se publiquen como archivos estáticos.

**No subir este ZIP como el anterior en un despliegue estático por arrastrar y soltar.** Esta versión necesita que Netlify construya y publique las funciones del servidor. El ZIP anterior sigue siendo el respaldo de la página pública.

## Desarrollo y comprobación

```sh
npm run build
npm test
```

El proyecto usa módulos de Node y no necesita dependencias para las funciones. Las pruebas no utilizan credenciales reales. La aprobación de pruebas locales no equivale a una comprobación de la configuración y del funcionamiento en producción.

## Uso cotidiano

- Cada persona utiliza su correo y su contraseña. Una misma cuenta corresponde a una ASADA.
- Star Water registra la ASADA y crea las cuentas desde su panel.
- La creación y el restablecimiento no envían correos automáticamente. Compartir el acceso directamente con la persona por un medio seguro.
- Cada usuario puede cambiar su contraseña desde las herramientas.
- La sesión dura hasta una hora; luego se solicita iniciar sesión otra vez. Cerrar sesión elimina la cookie del navegador.
- Suspender una ASADA bloquea a sus integrantes. Suspender una cuenta bloquea a esa persona.
- No se crean cuentas ficticias o claves compartidas predefinidas.

## Referencias oficiales

- https://docs.netlify.com/build/functions/configuration/
- https://docs.netlify.com/manage/routing/redirects/overview/
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/database/postgres/row-level-security
