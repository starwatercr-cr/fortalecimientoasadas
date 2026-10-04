# Parámetros de agua en la bitácora

Esta actualización añade resultados de campo y de laboratorio al registro de labores, conservando los permisos de Administración, Operación y Junta Directiva y el historial de cambios.

## Uso

1. Abra Bitácora de operación y seleccione la ASADA y el período.
2. En Registrar labor complete la información de la labor.
3. En Parámetros de agua indique tipo de agua, origen, desinfección y referencias del laboratorio.
4. Agregue únicamente los parámetros medidos. Puede buscarlos por nombre.
5. Transcriba resultado, unidad y límite de detección si el informe reporta ND. Para otros parámetros o plaguicidas escriba su nombre exacto.
6. Guarde en la nube. Consulte o edite los resultados desde la labor o desde Parámetros de agua.
7. El PDF incluye los resultados del apartado seleccionado. Excel agrega una hoja Calidad con todos los resultados de las labores del período, además de las hojas anteriores.

Hasta 40 parámetros por labor, sujetos al tamaño máximo existente del registro. Para un informe mayor, continúe en otra labor con la misma referencia de muestra e informe. No se calcula el total de plaguicidas a partir de resultados ND ni de un conjunto incompleto: transcriba el total reportado por el laboratorio.

## Base y alcance

Catálogo de CO, N1, N2, N3 y N4 del anexo 1, cuadros 1 a 6, del Reglamento para la Calidad del Agua Potable, Decreto 38924-S consolidado. Incorpora la reforma 44220-S de 2023 y 45019-S de 2025. Texto aportado por el usuario, generado por la Procuraduría el 1 de octubre de 2026. Revisión de fuentes el 4 de octubre de 2026.

https://pgrweb.go.cr/scij/Busqueda/Normativa/Normas/nrm_texto_completo.aspx?nValor1=1&nValor2=80050
https://sinalevi.go.cr/ResultadosNormativa/Informacion?param1=104679&param2=146343&param3=1&param4=

Los plaguicidas tienen valores de alerta de referencia; los ocho metabolitos identificados de clorotalonil tienen criterios específicos en el cuadro 6. La aplicación de medidas corresponde a la valoración técnica y sanitaria. La herramienta distingue alertas y máximos, convierte mg/L y µg/L cuando corresponde, conserva ND y remite a revisión los datos que no permiten concluir. Para parámetros genéricos sin criterio no declara cumplimiento. Una lectura favorable no certifica potabilidad ni cumplimiento integral. El programa de muestreo, las condiciones conjuntas y el seguimiento sanitario deben revisarse con el responsable técnico y el Área Rectora de Salud.

## Actualización

Integrar los archivos de este ZIP en la carpeta original del proyecto y publicar la actualización por el procedimiento habitual de GitHub/Netlify. No sustituir las imágenes, logos ni documentos originales por una carpeta vacía. No se requiere ejecutar una migración SQL: los resultados utilizan el campo JSON existente de las labores. No modifica usuarios ni la configuración de ingreso. Este paquete no se publica automáticamente.
