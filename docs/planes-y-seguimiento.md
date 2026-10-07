# Planes y seguimiento de la ASADA

## Ubicación
Herramientas → Cumplimiento y Mejora de la Gestión → Planes y seguimiento de la ASADA.

## Qué incluye
Plan de Gestión Integral de Residuos, Plan de Seguridad del Agua, Plan de Gestión de Riesgos y Plan de Emergencias. Hidrantes y Salud Ocupacional quedan pendientes de incorporar sus estructuras.

## Cómo usarlo
1. Seleccione el plan y elija elaboración guiada o seguimiento de un plan existente.
2. Complete los datos de la ASADA, responsables, diagnóstico y apartados de cada plan. Guarde el borrador; puede continuar después.
3. Registre acciones, responsables, fechas, presupuesto y evidencia. Pendiente equivale a 0%, En proceso a 50% y Cumplida a 100%. Este porcentaje mide las actividades registradas, no certifica el cumplimiento técnico del plan.
4. Adjunte el plan existente, documentos de respaldo o evidencias. Los anexos se descargan por separado; el informe contiene su relación, no incorpora sus páginas.
5. Revise la vista previa y descargue Word o PDF. La información pendiente aparece expresamente como Por completar.

Las respuestas se organizan en un borrador estructurado. Los datos técnicos, metodología de valoración de riesgos, revisión y aprobación deben completarse y verificarse por las personas responsables. El sistema no interpreta automáticamente un PDF adjunto ni certifica conformidad normativa.

## Acceso y seguimiento
La administración y la Junta Directiva pueden registrar información según sus permisos. El personal operativo y personas externas autorizadas tienen lectura conforme a la configuración del módulo. Los registros y anexos se filtran por ASADA en el servidor. El Centro de decisiones muestra acciones y revisiones vencidas.

## Límites y archivos
Hasta 500 planes listados por ASADA; 150 filas por tabla; hasta 200 anexos por plan. Cada anexo admite PDF, JPG o PNG de hasta 5 MB. Si un documento pesa más, comprímalo o divídalo antes de adjuntarlo. El control de versión evita sobrescribir cambios simultáneos; no constituye un historial de copias anteriores.

## Instalación y verificación
La migración asada_plans_and_private_evidence se aplicó al proyecto Supabase configurado. El SQL de referencia está en docs/plans-schema.sql. Incluye tablas con RLS y acceso desde el servidor, y un contenedor privado para anexos.

Se verificaron la compilación, 90 pruebas automatizadas, generación real de Word/PDF y presentación de documentos. Falta publicar esta actualización en Netlify y comprobar el recorrido con una sesión real en producción. Esta entrega no publica automáticamente la página.
