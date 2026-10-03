export const initialQuestions=[
 ['Organización del equipo','¿Están claras las funciones de la Junta Directiva, la administración y el personal operativo?','Revisen las funciones de cada persona y cómo se coordinan las tareas.'],
 ['Acuerdos de Junta','¿Los acuerdos de la Junta indican responsables y plazos, y se revisa su avance?','Organicen una lista de acuerdos, responsables, plazos y avances.'],
 ['Plan y presupuesto','¿La ASADA cuenta con un plan de trabajo y presupuesto anual aprobados, y revisa su ejecución?','Comparen lo planificado con lo realizado y los recursos utilizados.'],
 ['Información financiera','¿La Junta y la administración revisan sus estados financieros para tomar decisiones?','Conversen con el contador sobre ingresos, gastos, obligaciones y recursos disponibles.'],
 ['Personal','¿El personal conoce sus responsabilidades y recibe orientación y capacitación para realizar su trabajo?','Revisen los puestos, las necesidades de capacitación y el apoyo al equipo.'],
 ['Compras y bienes','¿Se justifican las compras y se llevan registros de proveedores, materiales y bienes?','Ordenen las compras y verifiquen sus existencias y bienes.'],
 ['Disponibilidad de agua','¿Conocen la producción de sus fuentes y la demanda de agua de la comunidad?','Reúnan los aforos, consumos y datos necesarios para revisar su balance hídrico.'],
 ['Calidad del agua','¿Se registran los controles de calidad del agua y las acciones tomadas ante resultados que requieren atención?','Revisen los análisis y sus registros con el personal responsable y apoyo técnico.'],
 ['Operación y mantenimiento','¿Se programa el mantenimiento del acueducto y se registran las reparaciones y averías?','Prioricen el mantenimiento y documenten las labores y los pendientes.'],
 ['Protección y emergencias','¿Se organizan acciones para proteger las fuentes y responder a situaciones que afecten el servicio?','Revisen las fuentes, los riesgos y la coordinación para atender emergencias.'],
 ['Atención de usuarios','¿Se registran las solicitudes y reclamos de los usuarios y se da seguimiento a las respuestas?','Definan quién atiende cada gestión y cómo se verifica su respuesta.'],
 ['Documentos y continuidad','¿Los documentos y registros están ordenados para que el equipo autorizado pueda consultarlos y dar continuidad al trabajo?','Organicen el archivo, sus responsables y el acceso a los documentos importantes.']
];
export const initialOptions=[['0','Todavía no lo hacemos'],['1','Lo hacemos parcialmente'],['2','Lo hacemos con regularidad'],['3','Lo hacemos y lo verificamos con registros'],['unknown','No tengo información para responder']];
export function initialResult(answers){
 if(!Array.isArray(answers)||answers.length!==12||answers.some(a=>!initialOptions.some(([v])=>a===v)))throw Error('Responda las 12 preguntas para obtener su orientación inicial.');
 const known=answers.filter(a=>a!=='unknown').map(Number);return {percent:known.length?Math.round(known.reduce((s,n)=>s+n,0)/(known.length*3)*100):null,known:known.length,unknown:12-known.length,strengths:initialQuestions.filter((_,i)=>answers[i]!=='unknown'&&Number(answers[i])>=2),priorities:initialQuestions.filter((_,i)=>answers[i]!=='unknown'&&Number(answers[i])<2),verify:initialQuestions.filter((_,i)=>answers[i]==='unknown')};
}
