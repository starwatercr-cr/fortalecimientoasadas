# Disponibilidades de agua

Ruta: Plataforma → Análisis e Información de Abonados → Disponibilidades de agua.

1. En «Configurar machote de mi ASADA», ajuste el párrafo inicial, los datos adicionales y la despedida. Los marcadores entre llaves se completan con cada solicitud. La vigencia propuesta se confirma en cada expediente. Los cambios al machote se usan en nuevas solicitudes; los oficios guardados conservan su redacción.
2. Abra «Nueva solicitud». Complete solicitante, propietario, cédulas, plano, matrícula, referencia registral, ubicación, proyecto y número de servicios. Registre por separado capacidad hídrica, hidráulica y alcantarillado. Ninguna capacidad se considera positiva automáticamente ni se calcula desde el análisis de abonados.
3. Guarde el expediente para conservar un borrador y adjuntar plano, certificación literal, escritura, respaldo técnico, solicitud u oficio firmado. PDF/JPG/PNG, hasta 5 MB por archivo. Los adjuntos se descargan por separado, no se transcriben ni se incorporan al oficio automáticamente.
4. Registre las condiciones particulares y la referencia de revisión o acuerdo. Si no existe capacidad hídrica o hidráulica, explique el resultado en las observaciones. Complete la vigencia y quien firma; confirme la revisión y cambie a «Preparado para firma».
5. Use «Ver oficio», «Descargar Word» o «Descargar PDF». El oficio lleva el membrete configurado en «Nuestra ASADA» y un espacio para firma. Los borradores se identifican como no emitidos. El estado preparado no equivale a autorización firmada: descargue, firme y adjunte la versión firmada al expediente.

La administración, Junta Directiva y el administrador general pueden guardar. Los demás accesos autorizados son de consulta; los externos necesitan permiso para el módulo de abonados. Cada ASADA consulta sus propios expedientes. Se muestran los 500 expedientes actualizados más recientemente, con búsqueda por solicitante, cédula, plano, finca u oficio. Hasta 200 adjuntos por expediente. El número de oficio debe ser único dentro de cada ASADA.

Las tablas y el almacenamiento privado necesarios ya se crearon en el proyecto conectado. El SQL se conserva como referencia en availability-schema.sql. La actualización del código requiere publicar esta carpeta completa en el mismo proyecto Netlify, manteniendo sus variables de entorno y la configuración netlify.toml. No basta con subir únicamente index.html.

La estructura se adaptó del ejemplo aportado sin copiar nombres, firmas, sellos o condiciones de esa propiedad. Cada ASADA revisa y ajusta su machote antes de emitirlo.

## Revisión de uso y diseño

El encabezado utiliza el logo oficial sobre el azul de la plataforma. Los botones mantienen el turquesa y los formularios usan fondo claro. En la solicitud se muestra la lista de campos pendientes: cada elemento permite ir al dato que falta. Puede usar «Continuar como borrador» para descargar un documento que aún no está listo para firma. El aviso se muestra junto a la solicitud o al machote.

Use «El solicitante también es propietario» para copiar nombre y cédula cuando corresponde. La provincia, cantón y distrito de la ficha de la ASADA se proponen para la nueva solicitud; confirme o cambie estos datos según la ubicación de la propiedad. Si modifica datos del oficio después de confirmar la revisión, la casilla se desmarca: deberá revisarlo de nuevo antes de preparar para firma.
