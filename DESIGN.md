# STAR WATER · Diseño de espacios de trabajo

## Dirección visual
Interfaz profesional de gestión de acueductos, con la identidad de STAR WATER y prioridad en tareas administrativas, lectura de cifras y claridad de estados. Las pantallas de trabajo utilizan el menú lateral y un área de contenido consistente.

## Fundamentos reutilizables
- Tipografía: DM Sans (local, variable), títulos de peso 700 y cuerpo de peso 400–500. Cifras de informes y tablas con numerales tabulares.
- Fondo de trabajo: #f1f5f6; superficie: #ffffff; texto: #153645; texto secundario: #526b75; líneas: #d6e2e5.
- Navegación: azul titanio #102f3e; selección #23505e; acento turquesa #79d8ce sobre azul. Acciones primarias #086a70 con texto blanco.
- Estados de atención en ocre, confirmación en turquesa y errores con etiquetas explícitas. Mantener lectura comprensible también sin color.
- Radio de paneles 12 px, controles 8 px. Sombras suaves y selectivas. Iconos de trazo uniforme.
- Disposición: agrupar herramientas relacionadas en una superficie, con divisiones ligeras; reservar paneles destacados para acciones o datos prioritarios.
- Controles familiares, navegación de teclado, estados visibles de foco y objetivos táctiles cómodos; tablas con desplazamiento horizontal cuando los datos lo requieran.

## Movimiento
- Respuesta al pulsar 140 ms; apertura habitual de panel 180 ms y diálogo 220 ms, con desaceleración cubic-bezier(.23,1,.32,1).
- Gráficos: revelar barras desde su base al cargar datos (hasta 265 ms). Las cifras siguen siendo exactas.
- Evitar animar filtros repetitivos, búsquedas, teclado o elementos permanentemente decorativos. Respetar prefers-reduced-motion, sin retrasar las acciones.
- Implementar con CSS y JavaScript existente. No incorporar bibliotecas de animación para efectos que pueda resolver el navegador.

Las tres superficies iniciales comparten \`public/workspace-design.css\`. Aplicar estos fundamentos gradualmente a las demás herramientas.
