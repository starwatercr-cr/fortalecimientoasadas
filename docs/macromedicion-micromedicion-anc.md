# Macromedición, micromedición y ANC — actualización v36

Se abre desde Nuestra agua → Analizar Agua No Contabilizada · ANC.

La administración o Junta Directiva registra el mes y las fechas de lectura, las entradas independientes y las salidas a otros sistemas. Las transferencias internas se conservan como referencia y no se suman. Puede ingresar lecturas acumuladas inicial/final o un volumen verificado con explicación de respaldo. Los cambios de medidor o reinicios requieren un volumen verificado. La variación del almacenamiento es opcional y solo corresponde si el límite de medición incluye los tanques.

La micromedición puede consolidarse manualmente o traerse de un reporte guardado en Análisis e Información de Abonados. Se seleccionan volúmenes del mismo mes, se evitan duplicados y el servidor vuelve a calcular el consolidado antes de guardarlo. Si faltan datos de facturación, la importación no se acepta como consumo facturado: primero debe clasificarse y registrarse un consolidado verificado. Los montos pagados no intervienen en el volumen de ANC. Un monto de facturación, por sí solo, no permite verificar que las fechas de lectura sean idénticas: la ASADA confirma este alcance.

## Fórmulas y alcance

- Disponible de comparación = entradas independientes − salidas a otros sistemas − incremento de almacenamiento (si aplica).
- Facturado autorizado = consumo micromedido facturado + volumen facturado sin micromedidor.
- ANC = disponible de comparación − facturado autorizado.
- ANC % = ANC / disponible de comparación × 100.
- Remanente por investigar = ANC − usos autorizados no facturados.

Los usos autorizados no facturados forman parte del ANC, aunque no necesariamente sean pérdidas. El remanente puede incluir errores de medición, facturación, consumos no registrados y pérdidas reales. No equivale automáticamente a fugas. El ajuste por almacenamiento da un balance operativo del período; al comparar auditorías estandarizadas se debe mantener la misma frontera y metodología.

No se convierte un aforo aislado en L/s en producción mensual. La herramienta requiere volúmenes medidos o consolidados con respaldo. Las fechas desiguales, lecturas decrecientes, entradas duplicadas y balances negativos se rechazan. Cobertura desconocida o incompleta deja el resultado como datos por completar. Una meta de ANC es definida por la ASADA y no se presenta como límite normativo.

## Historial y descargas

Un balance por ASADA y mes; admite revisión con contador de versión y evita sobrescrituras concurrentes. No conserva una copia de cada versión anterior. El gráfico muestra períodos registrados y calidad de datos; no sustituye meses ausentes por cero. Informe PDF con nombre de la ASADA, desglose, gráfico y observaciones; historial CSV compatible con Excel. No lleva marca Star Water en el documento propio de la ASADA.

## Guardado y permisos

Tabla `water_anc_periods`, creada en el proyecto vinculado mediante la migración `water_anc_periods_private_balance`. RLS habilitado; clientes anon/authenticated sin acceso directo. El servidor valida sesión y ASADA. Administración y Junta Directiva guardan; externos autorizados para agua consultan agregados y no escriben. El esquema reproducible está en `docs/anc-schema.sql`.

## Verificación y publicación

81 pruebas automatizadas aprobadas, incluidas fórmulas, períodos, cobertura, deduplicación, aislamiento, permisos, recalculado del servidor, concurrencia y generación de un PDF real. Construcción y revisión de sintaxis aprobadas. Se renderizó el PDF y se comprobó su texto y distribución. No se completó una prueba visual de la pantalla en navegador: el ejecutable local no estaba disponible y su descarga falló. La prueba de acceso real en Netlify queda pendiente de publicar esta actualización y entrar con una cuenta autorizada.

El ZIP conserva el proyecto completo y sus funciones privadas. Debe publicarse como el proyecto existente con sus funciones Netlify; subir solo el index.html no incorpora esta herramienta. No se ha publicado desde esta sesión.

## Referencias de método

- IWA: https://www.iwa-network.org/our-work/performance-based-contracts-for-non-revenue-water-market-development
- AWWA: https://www.awwa.org/elearning/controlling-non-revenue-water-certificate-program/
- EPA, Control and Mitigation of Drinking Water Losses (2010): https://www.epa.gov/sites/default/files/2015-05/documents/epa816r10019.pdf

## Corrección visual v37

El apartado ANC reutiliza la cabecera azul, el logo oficial sobre el fondo de la plataforma, el menú y el pie de página de Nuestra agua/Aforos. Fondo claro y controles con la paleta existente; títulos de sección reducidos y presentación adaptable al móvil. Cálculos, datos y PDF permanecen iguales. Construcción y enlaces locales verificados.

## Corrección de respuesta al calcular v38

Los avisos de validación y operación se muestran también junto al botón. Los errores desplazan la pantalla y enfocan el aviso; un cálculo válido lleva a su resultado. Se versionaron las referencias a los scripts ANC para evitar cargar dependencias anteriores. No se modificaron las fórmulas ni las validaciones. Construcción aprobada y 81 pruebas aprobadas.

## Guía de llenado v39

Ejemplo visible en Macromedición con tabla de todos los campos, lectura acumulada inicial/final, resta de 10 000 m³ y ejemplo de ANC de 30 %. Explica volumen verificado, unidades, reinicios, estimaciones, almacenamiento y doble conteo. Los datos ficticios no se introducen ni guardan automáticamente.
