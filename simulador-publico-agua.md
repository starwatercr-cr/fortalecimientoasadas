# Simulador público: el futuro del agua

Acceso desde public/futuro-agua.html, enlazado en la portada. No requiere cuenta y no consulta APIs privadas. Los datos se calculan en el navegador y se conservan solo mientras la página está abierta. No guarda escenarios en la nube ni cambia registros de Nuestra agua.

Pérdidas iniciales del 30 %, identificadas como supuesto editable. Ejemplo ficticio: 4 L/s, 500 abonados, 14 m³/abonado/mes, crecimiento anual 2,5 % y horizonte de 15 años.

Mes de referencia de 30 días: 1 L/s equivale a 2.592 m³/mes. La oferta neta descuenta pérdidas del volumen producido. La demanda corresponde al consumo mensual medido por abonado multiplicado por los abonados proyectados. No vuelve a agregar las pérdidas a la demanda. El crecimiento de abonados y la disminución de producción son compuestos; los abonados se redondean hacia arriba evitando artefactos de precisión binaria.

La alternativa aplica gradualmente metas de pérdidas y ahorro de consumo en el plazo elegido. La nueva fuente aporta desde el año seleccionado, como caudal constante supuesto. Puede explorar horizonte de hasta 30 años. La tabla incluye año inicial y todos los años proyectados; el primer déficit se informa aunque una nueva fuente posterior restablezca el balance.

Controles: números y deslizadores, datos desconocidos con supuestos visibles, selector de año, unidades m³/mes o L/s, comparación de escenarios, accesos a otras decisiones y restablecimiento del ejemplo. CSV descargable con supuestos y tabla para abrir en Excel. Guardar PDF abre la impresión del navegador, con tabla desplegada. Contenido y botones orientan a conocer los planes o conversar con Star Water, sin prometer funciones privadas aún no implementadas.

Una proyección no certifica disponibilidad ni evalúa presiones, almacenamiento, distribución por hora, bombeo o calidad. Aforos, pérdidas y demanda deben verificarse y revisarse técnicamente antes de respaldar decisiones.

Integrar este paquete en la carpeta original y publicar con GitHub/Netlify. No requiere migraciones SQL ni cambios de usuarios. Conserva la actualización de parámetros de agua y las actualizaciones previas incluidas. Este paquete no se publica automáticamente.
