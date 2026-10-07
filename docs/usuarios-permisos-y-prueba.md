# Usuarios, permisos y condiciones de la prueba

## Dónde se encuentra
- Administración de la ASADA: entrar con su propio correo y contraseña; abrir **Usuarios y permisos** en la barra de su cuenta.
- Star Water: el mismo botón permite seleccionar una ASADA. También se enlaza desde **Administrar accesos**.
- La prueba muestra el aviso de derechos de autor al registrarse y solicita la aceptación de la versión vigente antes de abrir herramientas en el primer ingreso. Las pruebas existentes también deben aceptarlo.

## Cómo agregar una persona
1. Indicar nombre completo, correo individual y contraseña inicial de al menos 12 caracteres.
2. Seleccionar Administración, Junta Directiva u Operación según el trabajo que realizará.
3. Guardar y compartir las credenciales por un canal privado. La creación de cuentas no envía correos automáticamente. Cada persona puede cambiar su contraseña desde su cuenta.
4. No compartir un mismo correo y clave entre varias personas.

Las tres cuentas se vinculan al mismo espacio de la ASADA. La cédula jurídica no es una contraseña. Las nuevas cuentas no pueden trasladarse a otra ASADA desde este formulario; si una persona necesita trabajar en más de una organización, debe consultar a Star Water para definir la vinculación (la estructura actual asigna una ASADA por cuenta).

Los permisos internos mantienen el funcionamiento existente: Administración gestiona equipo, cuentas y registros; Junta Directiva puede consultar y guardar información en los módulos que ya lo permiten; Operación registra mediciones y labores con los controles propios de cada módulo. No se cambia la autoridad de aprobación de la Junta mediante este formulario.

## Colaboraciones externas
Seleccionar **Persona externa · solo consulta**; indicar trabajo autorizado, fecha y hora de vencimiento (según la zona horaria del dispositivo) y áreas de consulta. El vencimiento puede fijarse hasta un año adelante.

El acceso externo ocupa uno de los tres cupos mientras esté activo y vigente. No puede modificar registros, gestionar cuentas ni consultar contratos o expedientes laborales. El módulo **Panel de gestión y finanzas** incluye presupuesto, estados financieros, caja, activos, acuerdos y planificación; autorizarlo permite consultar todo ese conjunto, no un único rubro. Los informes de Asamblea pueden contener las cifras y fuentes previamente incorporadas a sus borradores; autorizar Asamblea permite consultar esos informes. Para cargar cifras nuevas desde el Panel también debe autorizarse Panel. Los accesos a agua sin Panel reciben únicamente los escenarios de agua de la consulta de planificación.

**Editar permisos** permite ajustar el alcance o suspender una cuenta. No se elimina su historial. Una cuenta vencida o suspendida deja de permitir solicitudes al servidor incluso si conserva una cookie de sesión. No se pueden retirar copias ya descargadas ni datos que la persona ya vio. El formulario protege la cuenta propia y exige mantener otra administración activa al retirar la última administración desde una cuenta de la ASADA. Star Water conserva la gestión general.

## Tres cuentas
El límite se controla en el servidor y en la base de datos, incluyendo intentos simultáneos. Una cuenta suspendida o vencida deja de ocupar un cupo. No es un límite de documentos ni de usuarios del acueducto. Un cuarto acceso simultáneo no se habilita automáticamente; requiere acordar una ampliación y configurar su alcance.

## Aviso de uso de la prueba
La plataforma identifica a Star Water como desarrollador y señala que no se autoriza copiar, reproducir, distribuir ni comercializar el código, diseño o contenidos propios sin autorización escrita. Los datos que registre la ASADA y los documentos generados con ellos le pertenecen a la ASADA. La aceptación queda registrada con cuenta, ASADA, fecha y versión. El aviso establece condiciones; no impide por sí mismo toda copia técnica.

## Actualizar la página
Se preparó este paquete sobre la versión más reciente, conservando los precios, la tienda y las últimas herramientas. Reemplazar los archivos del proyecto en GitHub (en grupos de menos de 100 archivos) y esperar a que Netlify termine el despliegue. No basta con subir index.html: esta mejora incluye archivos privados, funciones, páginas de acceso y redirecciones. La ampliación de la base de datos ya se aplicó y verificó; el SQL incluido sirve como referencia. No es necesario volver a crear cuentas ni restablecer contraseñas existentes.

## Validación
Pruebas automatizadas de aislamiento entre ASADAS, rechazo de escrituras externas, filtrado de planificación, consentimiento, vencimiento, suspensión, cupos y limpieza de cuentas ante inserción rechazada. Verificación transaccional del límite en la base de datos (sin conservar registros de prueba), revisión de permisos de tablas y compilación. No se publicó en Netlify ni se probó el sitio desplegado con cuentas reales.
