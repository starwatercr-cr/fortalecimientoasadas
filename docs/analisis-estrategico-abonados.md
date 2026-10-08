# Análisis e Información de Abonados

## Dónde se encuentra
En las herramientas de la plataforma y en el menú del Panel de gestión para Administración y Junta Directiva. La nueva herramienta requiere iniciar sesión; no se publica información de abonados.

## Uso
1. Seleccione su ASADA y un archivo .xlsx, .csv o .pdf.
2. Revise la hoja, los encabezados y las columnas reconocidas. Se reconocen el reporte agrupado de consumos y el formato MAC utilizados en los ejemplos. Otros formatos requieren asignar las columnas. Los PDF con texto utilizan la posición de sus columnas; los escaneos utilizan OCR en español. Tablas complejas, fotografías deficientes o formatos distintos pueden necesitar corregir el texto detectado.
3. Confirme que los datos y períodos son correctos y pertenecen a la ASADA seleccionada. Las filas inválidas deben corregirse. Esta confirmación no es una comprobación automática de titularidad.
4. Analice consumos, facturación y pagos cuando existan sus respectivos montos. El umbral inicial es mayor a 30 m³ mensuales. Exactamente 30 m³ no se incluye. Los aumentos comparan el mes calendario anterior; no se comparan meses distantes como si fueran consecutivos ni se rellenan faltantes con cero.
5. Guarde los registros revisados o explore el archivo solo en este dispositivo. Abra una importación guardada o agregue varias al análisis. Se excluyen duplicados idénticos y se bloquea la combinación cuando una factura o un período tiene cifras diferentes. Para revisar versiones distintas, abra cada archivo por separado.
6. Descargue el informe PDF con gráfico, comentarios y detalle del filtro. El CSV contiene los registros del filtro y puede abrirse en Excel. Las descargas se identifican con el nombre de la ASADA y no incorporan la marca Star Water.

## Interpretación
- Facturado y pagado son medidas diferentes. Un estado PAGADA no se convierte en monto cobrado ni acredita su fecha de pago.
- El consumo del abonado suma sus medidores del mismo mes. Las cantidades de abonados mensuales corresponden a los registros disponibles, no al padrón completo de la ASADA.
- Los comentarios usan reglas comprobables y cálculos sobre los registros revisados. No se incorporó un servicio externo de IA ni se requiere una clave o pago por consulta a un modelo.
- En el MAC de ejemplo el consumo a cobro tiene ceros aunque existe consumo de acueducto. Se utiliza CONSUMO ACUEDUCTO. El mes del consumo se obtiene de FECHA DE LECTURA ACTUAL; se señala la inconsistencia del año declarado respecto a la fecha de emisión.
- Un aumento no confirma una fuga. Debe revisarse lectura, días del período, medidor y cambios en el uso del agua.

## Guardado y protección
La tabla subscriber_imports guarda conjuntos inmutables de datos normalizados por ASADA. El servidor calcula su huella y comprueba usuario, ASADA y rol. Administración y Junta Directiva pueden guardar; el acceso externo autorizado solo consulta. RLS habilitado y privilegios directos de anon/authenticated revocados. No se guarda el archivo Excel/PDF original ni se distribuyen los archivos de ejemplo o sus datos en el ZIP.
La migración docs/abonados-schema.sql se aplicó en el proyecto existente durante esta actualización. No es necesario volver a ejecutarla allí. Las claves privadas permanecen en variables de entorno del servidor.

## Límites iniciales
15 MB por archivo, 100 páginas por PDF, 50.000 filas de lectura y 20.000 registros por importación guardada. Excel .xls antiguo debe convertirse a .xlsx. El reporte no realiza cobros ni modifica el sistema de facturación. OCR puede tardar y necesita revisión humana antes de guardar.

## Comprobaciones
72 pruebas automatizadas aprobadas. Se verificaron los dos Excel reales: 2.493 y 4.014 registros, sin filas inválidas ni conflictos, excluyendo totales. Se comprobó la extracción de los XML reales con el lector XLSX, la lectura de un PDF tabular de prueba, OCR de un escaneo de prueba y generación/inspección del informe PDF. Las pruebas de autorización incluyen consulta de otra ASADA, permisos externos y restricción de guardado por rol. La tabla nueva tiene RLS activado y carece de permisos directos de lectura/escritura para clientes.
La publicación y la prueba completa desde los botones con una cuenta real aún requieren actualizar el repositorio conectado a Netlify. No se ha desplegado desde esta actualización y no se comprobó una sesión privada real de producción.

## Dependencias locales
PDF.js 5.6.205 y Tesseract.js/Core 7.0.0, con modelo español tessdata_fast. Archivos distribuidos desde sus paquetes oficiales instalados; licencias junto a esta documentación. La lectura y el OCR ocurren en el dispositivo. Se envían a la nube solo los datos revisados al pulsar Guardar.
