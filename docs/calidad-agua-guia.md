# Calidad de nuestra agua: interpretación y verificación

Actualización del 7 de octubre de 2026. Base normativa: Decreto 38924-S, texto consolidado aportado (versión 7/7), anexo 1, cuadros 1–6, y anexo 6. Se incorporan las reformas del texto, incluida 45019-S de 2025.

## Pantalla simplificada

1. **Identifique la muestra:** ASADA, punto, fecha, tipo y origen de agua. Laboratorio, número de informe y condiciones especiales se completan en “Otros datos del informe”.
2. **Ingrese los resultados:** cada entrada muestra a la derecha el estado, la referencia y qué hacer. Las casillas vacías no se interpretan como cero ni generan seguimiento. Se conservan las alertas y resultados pendientes, sin reducirlos incorrectamente a un sí/no.
3. **Seguimiento:** al revisar los resultados, aparece únicamente si hay hallazgos o datos por confirmar. Se completa acción acordada, responsable, fecha y verificación. Agua cruda se informa como contexto sin declarar cumplimiento.

La guía extensa se retiró de esta pantalla. El catálogo y los criterios compartidos con la bitácora se conservan. El Word contiene un resumen de resultado, estado, referencia y acción; incorpora seguimiento sólo cuando corresponde. No cambia el almacenamiento: esta lectura debe descargarse antes de salir.

## Criterios que se deben conservar

- Un rango exige mínimo y máximo. Un máximo no supone una concentración mínima que haya que aumentar.
- Una alerta no es un máximo admisible; los VMAAR de metabolitos se distinguen del valor de alerta.
- El total de plaguicidas se transcribe del laboratorio; no se suman ND como cero.
- ND depende del método. Si su sensibilidad no resuelve el criterio, la conclusión queda pendiente.
- Los límites de fluoruro dependen de los intervalos de temperatura expresos; no se interpola automáticamente.
- En agua subterránea se evalúa además hierro más manganeso, de la misma muestra, contra 0,3 mg/L.
- PCB es una sustancia química, no un microorganismo.
- Agua cruda se interpreta como información de la fuente, sin declarar cumplimiento del agua abastecida.

## Publicación

Suba el contenido completo del ZIP actualizado al mismo proyecto. Esta actualización no necesita SQL nuevo ni cambiar la configuración de Supabase. Conserva las actualizaciones anteriores del paquete. Recargue la página después de publicar para cargar los módulos nuevos.

## Verificación

Pruebas de límites y extremos, dirección de las explicaciones, unidades y conversiones, ND, resultados condicionados, plaguicidas y metabolitos, PCB, catálogo compartido y permisos de dependencias. La compilación comprueba sintaxis. La publicación y prueba de navegación en el sitio de producción deben hacerse después de subir el paquete.
