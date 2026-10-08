# Membrete para documentos de la ASADA

## Configuración
Ingrese a Herramientas → Nuestra ASADA → Membrete para documentos. Complete los datos oficiales en Datos generales: nombre, cédula jurídica, teléfono, correo y dirección. Suba el logo en PNG o JPG, revise la vista previa y guarde la ficha en la nube. La administración y la Junta Directiva pueden actualizarlo conforme a sus permisos.

El logo conserva sus proporciones y se reduce a una imagen PNG liviana. Cada descarga consulta el membrete de la ASADA seleccionada. No se comparte el membrete entre ASADAS. Si la consulta falla, la descarga informa el problema en lugar de utilizar datos de otra ASADA.

## Documentos
El membrete aparece al inicio de los Word y PDF generados: informes para Asamblea, finanzas, calidad del agua, ficha general, planes, diagnóstico, aforos, ANC, análisis de abonados y contratos. También se incorpora a las impresiones de acuerdos de pago, Panel de gestión, equipo, operación, morosidad y bodega.

El resumen de Nuestra agua ahora se descarga en Word para permitir el logo y los datos de contacto. En Excel se incorpora una hoja inicial Membrete ASADA con el logo, y los datos oficiales en el encabezado de impresión de las hojas de datos. Las celdas, registros y filtros se mantienen en sus ubicaciones originales. Los encabezados de impresión de Excel tienen un límite de longitud; la hoja inicial conserva el texto completo.

Los CSV y JSON son archivos de datos y mantienen su estructura para permitir importaciones. Los documentos originales adjuntos —facturas, análisis, planos, contratos firmados y documentos normativos— conservan su formato y firmas. La configuración no modifica documentos descargados anteriormente.

Para usuarios administradores de Star Water, las herramientas sin selector propio muestran un selector de ASADA para los documentos. Los usuarios de cada ASADA consultan únicamente su propia ficha.

## Publicación
Suba esta actualización completa a Netlify. No requiere una migración de base de datos: el membrete se guarda con los datos generales existentes. Verifique posteriormente una descarga con una sesión real en el sitio publicado.

## Verificación
Compilación y pruebas automatizadas; validación de imagen, permisos y aislamiento por ASADA; generación de Word y PDF reales con logo; XML y relaciones de los cuatro tipos de Excel; conservación de valores y filtros; revisión visual de documentos y encabezado de impresión.
