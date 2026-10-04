# Centro de decisiones de mi ASADA

Esta actualización agrega el Centro de decisiones como una opción dentro de la plataforma. Al ingresar se muestran todas las herramientas, con una franja destacada Centro de decisiones sobre el catálogo. Mantiene las herramientas anteriores y consulta únicamente los registros permitidos de la ASADA seleccionada. No requiere tablas, migraciones, claves nuevas ni cambios de configuración en Supabase.

## Qué muestra

- Presupuesto: salidas del flujo de efectivo y caja chica hasta el mes de corte, frente al presupuesto anual registrado de gastos e inversiones. El gráfico permite explorar cada mes. Estos movimientos no sustituyen los ingresos y gastos contables de los estados financieros.
- Acuerdos de pago: presentados hasta el corte, separados entre pendientes de aprobación y aprobados por pagar. Se usan sus estados actuales, sin reconstruir el historial de aprobación a una fecha pasada. No se duplican como movimientos de efectivo.
- Efectivo: saldo inicial explícito más entradas menos salidas hasta el corte. Sin saldo inicial, indica Por completar; el cálculo no consulta ni concilia el banco.
- Nuestras finanzas: último estado completo con fecha hasta el corte; activos, pasivos, ingresos, gastos y resultado. Las cifras y barras tienen comentarios interactivos; se advierte si activos no coinciden con pasivos más patrimonio.
- Morosidad: casos manuales abiertos, próximas gestiones y compromisos pendientes vencidos al consultar. Excluye compromisos de casos resueltos; los montos faltantes no se reemplazan por cero. No representa un saldo total del sistema de facturación.
- Calidad del agua: reutiliza los criterios de interpretación de la bitácora; muestra hallazgos, datos sin comparación aplicable y registros pendientes de revisión. Un hallazgo revisado no se considera corregido. No certifica potabilidad.
- Acuerdos: del año seleccionado, con vencimiento comparado contra la fecha actual de Costa Rica. Excluye los cumplidos de la lista de vencidos.
- Bodega: existencias actuales de materiales activos iguales o inferiores al mínimo, incluidos los agotados. El detalle abre el filtro Necesitan reposición.
- Operación: labores abiertas y registros de cloro o resultados de agua sin revisión registrada, del año seleccionado hasta la fecha de consulta. No representa un calendario de controles sanitarios.
- Agua: Por completar. La herramienta Nuestra agua calcula el balance, pero todavía no lo guarda en la nube; este Centro no puede recuperar ese balance automáticamente.

El mes de corte afecta el presupuesto y el gráfico. Las existencias son actuales; los vencimientos se comparan con hoy y la bitácora usa el período indicado en pantalla. Cada indicador abre un detalle y su herramienta; estas incluyen un botón para volver al Centro conservando ASADA, año y mes de corte.

Sin registros, el Centro indica Por completar. Una consulta fallida indica No disponible. No asigna una nota de cumplimiento ni usa información de ejemplo. La vista de Operación se concentra en agua, bodega y bitácora; no solicita el panel financiero. Se conservan las autorizaciones actuales del servidor.

## Publicación

1. Descomprima el paquete.
2. Suba sus archivos y carpetas al repositorio conectado con Netlify, reemplazando las versiones correspondientes. Conserve los archivos y recursos existentes que no aparezcan en el paquete. No suba el ZIP como un archivo suelto.
3. Espere a que Netlify termine la publicación y abra Ingresar a la plataforma. Después del ingreso aparecerán todas las herramientas. Use Abrir Centro de decisiones en la franja destacada para abrir el resumen.
4. También puede abrir /decision-center.html o el botón Centro de decisiones en Herramientas.

Incluye CSS público y tres archivos privados servidos por el acceso protegido. Las consultas no escriben ni cambian datos. Verificación: 114 pruebas automáticas y revisión en navegador con registros de prueba, filtros, navegación de ida y vuelta, vista móvil, fallos de consulta y cambio de ASADA. No se realizó una prueba de carga ni se publicó desde esta sesión.
