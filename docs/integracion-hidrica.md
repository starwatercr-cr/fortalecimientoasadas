# Integración hídrica: revisión de interfaces existentes

## Hallazgos
- Aforos consulta flow-data por ASADA; conserva registros de fuentes y mediciones.
- Nuestra agua guarda escenarios versionados mediante panel-planning y panel-save. Los caudales de verano e invierno incluyen fechas independientes. No se debe asumir la estación a partir del mes.
- ANC ya integra reportes de abonados mediante anc-micro con ASADA, identificador de importación y período. Exige confirmar comparabilidad y completitud; rechaza importaciones con consumos sin información de facturación.
- ANC distingue volumen facturado, consumos autorizados no facturados y ajustes de almacenamiento. No equivale automáticamente al supuesto de proporción no registrada de Nuestra agua.

## Próxima implementación propuesta
1. Consulta de aforos de la misma ASADA, selección explícita de mediciones por fuente y estación, fecha y unidad L/s.
2. Vista previa antes de sustituir campos del escenario; conservar valores manuales si no se confirma.
3. No guardar automáticamente; respetar permisos existentes y control de versiones.
4. Para demanda, seleccionar período y validar población de conexiones y cobertura del reporte. No usar número de filas como número de conexiones sin deduplicación.
5. Para ANC, presentar volumen y período como referencia; no copiar automáticamente porcentajes a supuestos de planificación.

## Pruebas de aceptación
- Aislamiento por ASADA, permisos de lectura y escritura, cambio de ASADA durante consulta.
- Cero medido distinto de dato ausente; fechas y unidades conservadas.
- Cancelación sin cambios; respuesta tardía no modifica otro escenario.
- Sin datos ficticios en registros reales; sin inferencia automática de estación ni de disponibilidad de servicio.
- Conservación de resultados previos y trazabilidad de fuentes.

No se han cambiado fórmulas, API, esquema de base de datos ni producción en esta revisión.
