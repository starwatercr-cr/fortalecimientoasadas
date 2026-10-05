# Registro de aforos y comportamiento de las fuentes

Ubicación: Herramientas → Nuestra agua → Registro de aforos y comportamiento de las fuentes.

## Cómo comenzar
1. La administración o Star Water agrega las nacientes, pozos o captaciones. Indique nombre, tipo, ubicación y observaciones.
2. Marque “incluir en el total” únicamente para fuentes independientes que aportan al acueducto. No cuente nuevamente la misma agua medida en un tanque o tubería aguas abajo.
3. Administración y Operación registran fecha, caudal en L/s, época, método, responsable y observaciones. Se admiten aforos históricos; no se admiten fechas futuras. Cero debe corresponder a una medición real sin caudal.
4. Para comparar campañas generales, use la misma fecha y nombre de campaña en cada fuente. Una campaña exige un aforo único por cada fuente actualmente incluida. Los nombres de campaña se comparan sin distinguir mayúsculas.
5. Filtre fuente y fechas. Puede ver cada fuente por fecha, comparar años por mes para una sola fuente, o consultar los totales de campañas completas. Toque o enfoque y active un punto para leer su detalle.
6. Descargue el PDF con gráfico, comentario y registros, o el Excel nativo con cuatro hojas: Aforos, Fuentes, Lectura y Gráfico (datos del gráfico).

La Junta Directiva consulta y descarga. Operación registra y modifica sus propios aforos. Administración y Star Water administran las fuentes y los registros de su ámbito. Archivar conserva el registro fuera del historial activo; una fuente con aforos no se archiva mientras tenga registros activos.

## Lectura de resultados
Los puntos representan mediciones puntuales; no se inventan datos para meses sin aforo. Los cambios no prueban causas ni tendencias. Compare época, método, lluvia y condiciones de la fuente. Los totales requieren cobertura completa con la lista actual de fuentes independientes, incluso para campañas históricas. Si cambió la composición del sistema, revise la comparabilidad antes de usar esos totales. Este módulo no transfiere automáticamente los aforos al formulario de balance hídrico.

## Publicación
La tabla water_flow_records ya se creó en Supabase ncdxzlrhbvhafefledtq y se verificó con una transacción de prueba revertida. No necesita ejecutar SQL.

Actualice el paquete completo en el repositorio conectado a Netlify, en grupos de menos de 100 archivos. Incluya private, netlify, public, scripts, configuración y documentación. Espere la publicación final; actualizar solo index.html no agrega el módulo.

Los permisos se verifican en el servidor por ASADA y función. La tabla tiene RLS y ningún acceso directo para anon/authenticated, siguiendo el modelo privado del resto de la plataforma. No se incluyeron datos ficticios en el historial de clientes.

Validación: 132 pruebas automatizadas correctas; compilación correcta; consulta de permisos y guardado real revertido; PDF generado y revisado visualmente; Excel abierto y comprobado con valores numéricos. La actualización está preparada y no se publicó desde este entorno. No se verificó el flujo completo en un navegador del sitio publicado.
