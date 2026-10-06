# Plan anual y escenarios del balance hídrico

El Plan anual se abre desde Herramientas o Panel de gestión. La administración y la Junta Directiva registran actividades, objetivos, metas, responsables, fechas, presupuesto estimado, aprobación y seguimiento. Operación puede consultarlo. Cada actividad corresponde al año seleccionado; las fechas inicial y final deben estar en ese año. Las actividades que continúan en otro año se registran en el plan de ese año.

El presupuesto estimado del plan no crea partidas ni pagos. La aprobación registra la referencia del acuerdo y su fecha; no representa una votación electrónica.

Nuestra agua guarda escenarios por ASADA y año, con fecha, nombre, fuentes, datos, supuestos y resultados. Administración, Junta Directiva y Operación pueden guardar, actualizar y archivar escenarios. Los ejemplos ficticios no se guardan como datos reales. Se conservan los valores cero y los campos pendientes. El botón Actualizar usa control de versión para evitar sobrescribir cambios de otra persona. Guardar como nuevo crea una copia independiente. Se admiten hasta 20 fuentes por escenario.

El Centro de decisiones consulta actividades iniciadas hasta el mes de corte y su estado actual. Presenta el último escenario con fecha hasta el corte, sin utilizar escenarios futuros. El margen corresponde a los días del análisis, no necesariamente al mes de consulta. Los resultados son orientativos y no certifican capacidad del acueducto ni autorizan nuevas conexiones.

Los registros reutilizan panel_records y su historial panel_changes, con permisos de acceso en el servidor. El historial muestra hasta 200 cambios del año. La consulta de escenarios filtra únicamente workplan y water. No se habilitó acceso directo de anon ni authenticated a estas tablas.

La ampliación de tipos se aplicó al proyecto conectado Star Water ASADAS mediante la migración annual_workplan_water_scenarios. docs/planning-water-schema.sql conserva el cambio para otra instalación. No requiere ejecutar SQL adicional en el proyecto conectado.

Verificación: node --test tests/planning-water.test.mjs; node scripts/build.mjs; comprobación de inserción, edición e historial en la base conectada dentro de una transacción revertida. No se realizó una prueba visual en navegador ni un despliegue en Netlify.

Este ZIP actualiza el proyecto existente. Conserve los demás archivos del repositorio, incluidos los recursos de marca que no están en este paquete.
