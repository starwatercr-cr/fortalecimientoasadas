# Contratos laborales de la ASADA

Ubicación: Herramientas → Nuestro equipo → Contratos laborales.

1. Registrar al trabajador en Expedientes del equipo.
2. Seleccionarlo en Contratos laborales y preparar el contrato.
3. Elegir uno de seis modelos y cargar sus funciones. Ajustar funciones, supervisión y seguridad a la realidad de la ASADA.
4. Completar la identificación de las partes, representación, acuerdo de contratación, jornada efectiva, descansos, salario bruto, categoría, mínimo aplicable, fuente y revisión.
5. Guardar borrador en la nube. La información del contrato es una instantánea: no modifica salario ni condiciones del expediente y no cambia al editarlo después.
6. Descargar borrador, o completar los pendientes para descargar PDF para firma.
7. Firmar ambas partes y adjuntar el documento al expediente. Se admiten PDF/JPG/PNG hasta 2 MB. La plataforma no realiza una firma digital ni declara firmado un borrador.

## Alcance

Seis puestos: administrador(a), fontanero(a), asistente administrativo(a), misceláneo(a), secretario(a) y ayudante de fontanería. Modelos por tiempo indefinido para personas adultas; no suponen períodos de prueba, renuncias, trabajo gratuito ni excepción automática de jornada para administradores. Las condiciones de relaciones ya existentes requieren respetar antigüedad y derechos anteriores.

Los modelos se basan en el Código de Trabajo aportado y la lista MTSS 2026, Decreto 45303-MTSS. Fuentes enlazadas en la pantalla. Referencias consultadas el 7 de octubre de 2026. La categoría se confirma según funciones y formación exigida; un nombre de puesto no acredita una categoría ni un título aplicable. Secretaría como empleo es distinta de la Secretaría electa de la Junta.

La revisión detecta datos faltantes, salario inferior al mínimo ingresado, referencias de otro año y jornadas superiores a los límites ordinarios del modelo (8/48 diurna, 7/42 mixta, 6/36 nocturna). No analiza automáticamente horarios escritos ni clasifica una jornada por sus horas de reloj; verificar esos datos forma parte de la revisión de la persona responsable. No aplica jornadas acumulativas ni excepciones del artículo 143. Casos especiales requieren revisión laboral.

La comparación exige iguales períodos. No convierte automáticamente referencias diarias a mensuales ni prorratea jornadas parciales. Para esas situaciones se ingresa una referencia ajustada con fundamento y fuente, confirmada por la persona responsable. Alcanzar el mínimo registrado no acredita cumplimiento legal integral. Las referencias de años posteriores deben actualizarse con una fuente documentada; el año de inicio y la referencia deben coincidir. El formulario no valida por sí mismo los títulos ni el criterio de clasificación. Revisar jurídicamente las condiciones particulares antes de firmar.

Contrato descargado sin marca del proveedor: ASADA y trabajador son las partes. PDF real con fuentes embebidas, vista previa íntegra, firmas y testigos cuando corresponda. La generación de archivos funciona en el navegador; no remite el tercer tanto al MTSS ni inscribe al trabajador en CCSS o INS.

## Datos y privacidad

Nuevo tipo labor_contract en team_records, vinculado al empleado de la misma ASADA. Conserva control de versión, archivo e historial existentes. Sin acceso automático para Junta, Operación o consultas externas; solo administración de la ASADA y administrador general. No se aumentaron límites de archivos ni se abrieron permisos públicos.

La ampliación de restricciones de tipos se reproduce en supabase/10_contratos_laborales.sql. No elimina datos ni cambia los registros anteriores.
