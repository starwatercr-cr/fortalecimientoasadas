# Línea base de rendimiento — 23 de noviembre de 2026

Auditoría de solo lectura del proyecto STAR WATER ASADAS. No se modificó la base de producción.

## Resultados
- 38 tablas públicas con RLS habilitado y sin lectura directa para anon/authenticated ni escritura directa para authenticated, según revisión previa.
- Asesor de rendimiento: 51 claves foráneas sin índice de cobertura y 10 índices sin uso registrado. Son recomendaciones informativas, no fallos demostrados.
- Contadores de accesos por índice: platform_usage_clients 4651; platform_usage_daily 1705; panel_records 434; asada_profiles 412; arrears_records 77; asada_documents 73. Son contadores acumulados, no latencias ni usuarios únicos.
- El panel ya consulta por ASADA y año con bloques de 1000 registros y orden estable.

## Criterios de intervención
1. No eliminar índices por ausencia de uso sin revisar el período de observación y restricciones.
2. Priorizar consultas frecuentes mediante planes EXPLAIN y mediciones representativas en un entorno de pruebas.
3. Evaluar índices de claves foráneas según volumen, operaciones de mantenimiento y costo de escritura.
4. Medir latencia p50/p95, errores, tamaño de respuestas y número de consultas con datos sintéticos representativos de 100 ASADAS antes de afirmar capacidad.
5. Mantener filtros por ASADA y permisos en cada consulta. No compartir caché de datos privados entre organizaciones.
6. Probar exportaciones y navegación en una sesión autorizada antes de publicar.

## Consulta reproducible (solo lectura)
```sql
select relname,n_live_tup,seq_scan,idx_scan,pg_total_relation_size(relid) as bytes
from pg_stat_user_tables where schemaname='public'
order by pg_total_relation_size(relid) desc;
```

No se han medido todavía latencias reales ni ejecutado pruebas de carga. No se recomienda aplicar cambios de esquema únicamente a partir de estos contadores.
