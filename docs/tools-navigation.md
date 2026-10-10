# Nuevo inicio de herramientas

Menú por áreas, buscador sin tildes, tarjetas compactas, favoritas y accesos recientes. Los enlaces llevan a las herramientas privadas existentes; no se cambia el almacenamiento de sus registros. Se conserva el Centro de decisiones destacado y el acceso a Usuarios y permisos, Administrar accesos y Uso de la plataforma según la cuenta.

El encabezado muestra la ASADA y la persona de la sesión real. Si existe un logo PNG en el membrete, se presenta junto al nombre; en caso de falla de consulta se mantiene el nombre de la ASADA. Star Water conserva su marca en el menú lateral. El logo y los documentos de cada ASADA se administran en Nuestra ASADA.

La búsqueda y los filtros muestran únicamente herramientas autorizadas. Nuestro equipo corresponde a la administración o Star Water. El acceso externo muestra solo los módulos autorizados y mantiene las restricciones de servidor. La organización por áreas es navegación, no un cambio de permisos: los roles habituales mantienen las autorizaciones que ya tenían.

Las favoritas y los ocho accesos recientes se guardan por correo y espacio de ASADA en localStorage, en ese navegador. No se sincronizan entre dispositivos. No incluyen cifras, documentos ni datos de abonados. Si el navegador no permite almacenar, las herramientas siguen disponibles. Al volver a Herramientas desde una herramienta interna, la visita se registra desde la sesión verificada.

## Publicación

Descomprimir Actualizacion_Diseno_Herramientas.zip y subir su contenido al repositorio de GitHub, conservando las rutas public, private, netlify, docs y tests; reemplazar los archivos existentes. No subir el ZIP sin descomprimir. No arrastrar solo este parche a un despliegue manual de Netlify, porque necesita los otros archivos del proyecto. El paquete completo actualizado también queda disponible por separado.

El parche incluye las actualizaciones de Uso de la plataforma y el diseño, por si todavía no se había aplicado el parche anterior. No requiere nuevas tablas ni cambios de contraseñas. Se mantiene el esquema de uso ya preparado en el proyecto conectado.

Validación: compilación y pruebas de rutas, filtros, permisos externos, cuentas administrativas, aislamiento de preferencias, almacenamiento bloqueado y flujo de la página. No se pudo realizar una inspección visual en navegador en este entorno; el diseño utiliza la propuesta aprobada y reglas adaptables a celular. Tras publicar, verificar que el encabezado, el menú móvil y los enlaces se presenten correctamente en los dispositivos utilizados.
