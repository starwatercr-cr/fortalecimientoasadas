# Acuerdos de Junta Directiva: respaldo y búsqueda

Ubicación: **Herramientas → Panel de gestión → Acuerdos de JD**.

## Registrar un acuerdo
- Conservar número de acuerdo/acta, título, fecha, responsable, plazo y estado. El avance se calcula automáticamente: Pendiente 0 %, En proceso 50 %, Cumplido 100 %. Se muestra la misma escala al consultar acuerdos anteriores, sin cambiar su historial.
- Agregar el **texto o resumen del acuerdo**, hasta 4.000 caracteres. Si se resume, indicarlo y conservar fidelidad al acta.
- Agregar **palabras clave**, hasta 300 caracteres; por ejemplo: tubería de 4 pulgadas, PVC, compras, materiales.
- Adjuntar el respaldo del libro de actas en PDF, JPG o PNG, de hasta 5 MB. Adjuntar únicamente las páginas pertinentes. El respaldo es opcional y puede completarse después.
- Guardar en la nube. El archivo se conserva en el archivo privado de documentos de la ASADA y su identificador se vincula al acuerdo.

La administración y la Junta Directiva pueden guardar información y adjuntar respaldos. Los perfiles internos de consulta pueden consultar los acuerdos y descargar el respaldo vinculado. Un externo debe tener autorizado Panel de gestión y finanzas; esa autorización permite consultar acuerdos y sus respaldos, y no permite subir ni editar archivos.

## Buscar
Escribir palabras o una referencia y presionar **Buscar acuerdos**. Elegir el año seleccionado o **Todos los años registrados**. Se revisan número de acuerdo/acta, título, texto, palabras clave, observaciones, responsable, fecha y año. La búsqueda no distingue mayúsculas ni tildes y reconoce, por ejemplo, `4"` y `4 pulgadas`. Las palabras deben aparecer en la información registrada; no se inventan sinónimos ni información del archivo. Se devuelven únicamente los acuerdos no archivados de la ASADA autorizada, incluidos los cumplidos. Los resultados se organizan en páginas de hasta 50 registros.

Cada resultado muestra estado, plazo, responsable, avance, texto y vínculo **Descargar respaldo del acta** cuando exista. Al editar un resultado de otro año, el Panel abre primero el año correspondiente. El control de versiones evita sobrescribir el cambio de otra persona.

## Qué ocurre con un PDF escaneado
El buscador no hace reconocimiento óptico de caracteres (OCR). Una imagen escaneada o un PDF con texto no se lee automáticamente. Es necesario copiar el acuerdo o registrar un resumen y palabras clave en el formulario. El archivo conserva la evidencia original y puede descargarse para revisarlo.

## Reemplazar un respaldo
Al adjuntar un archivo nuevo, el acuerdo queda vinculado al nuevo documento; el anterior se conserva en los documentos de la ASADA. Si el archivo se subió y falla el guardado del acuerdo, el identificador queda en el formulario para reintentar sin duplicar el archivo. Una recarga descarta ese formulario: el archivo permanece en los documentos de la ASADA y debe revisarse antes de volver a subirlo. No se elimina automáticamente evidencia ni se sustituye el libro de actas.

## Informe
**Guardar informe en PDF** imprime la consulta visible, incluyendo el texto del acuerdo. Si hay más de 50 resultados, imprime la página visible; los documentos escaneados se descargan por separado y no se incorporan como páginas de ese informe.

## Actualización y validación
Reemplazar los archivos del proyecto en GitHub y esperar el despliegue de Netlify. Esta mejora utiliza las tablas y el archivo privado de documentos existentes; no requiere crear tablas ni ejecutar un SQL nuevo. Se verificaron permisos de edición, aislamiento entre ASADAS, categoría y vínculo del archivo, búsqueda, paginación, campos nuevos compatibles con acuerdos anteriores y compilación. El paquete no se publicó automáticamente en Netlify.
