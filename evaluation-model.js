// Modelo 2: cada criterio tiene el mismo peso dentro de su área.
export const ratingLabels=['No se pudo valorar','Necesita apoyo considerable','Requiere acompañamiento frecuente','Cumple parcialmente','Cumple lo esperado','Supera lo esperado'];
const specific={
 'Administración':['Prepara informes claros y oportunos para la Junta Directiva','Da seguimiento a los acuerdos y coordina las tareas del equipo','Ejecuta y controla el presupuesto y los procesos aprobados'],
 'Asistencia administrativa':['Mantiene actualizados los registros y respaldos asignados','Realiza los trámites con exactitud y comunica los pendientes','Apoya la preparación de información y el seguimiento administrativo'],
 'Atención al usuario':['Explica los procedimientos y las respuestas con claridad','Registra solicitudes y reclamos con información completa','Da seguimiento a las gestiones y comunica sus avances'],
 'Fontanería y operación':['Realiza el mantenimiento programado y atiende averías según las prioridades acordadas','Registra trabajos, lecturas y mediciones y comunica las anomalías','Aplica los procedimientos operativos e instrucciones para cuidar la continuidad del servicio'],
 'Otro puesto':['Cumple las funciones y prioridades acordadas para su puesto','Entrega los resultados con la calidad y los plazos acordados','Registra su trabajo y comunica las necesidades de apoyo']
};
export function evaluationAreas(type){return [
 {id:'responsibility',name:'Responsabilidad y cumplimiento',weight:20,criteria:['Cumple las tareas y los plazos acordados','Respeta el horario y comunica oportunamente ausencias o cambios','Sigue las instrucciones y comunica pendientes y dificultades']},
 {id:'quality',name:'Calidad del trabajo',weight:25,criteria:['Realiza el trabajo con exactitud y revisa posibles errores','Mantiene ordenados y completos los registros de su labor','Corrige los errores identificados y cuida los detalles del servicio']},
 {id:'service',name:'Servicio y trabajo en equipo',weight:20,criteria:['Trata con respeto a usuarios, compañeros y miembros de la Junta','Comparte la información necesaria para coordinar el trabajo','Colabora con el equipo dentro de las funciones y prioridades acordadas']},
 {id:'position',name:'Desempeño propio del puesto',weight:25,criteria:specific[type]||[]},
 {id:'care',name:'Cuidado de recursos y mejora',weight:10,criteria:['Cuida las herramientas, materiales, documentos y recursos de la ASADA','Aplica las prácticas de seguridad y utiliza la protección requerida para su labor','Participa en la capacitación y aplica aprendizajes o propone mejoras']}
 ];}
export function evaluationResult(p){
 const schema=evaluationAreas(p.type);let offset=0,total=0,weight=0,count=0;
 const areas=schema.map(a=>{const rows=p.ratings.slice(offset,offset+a.criteria.length);offset+=a.criteria.length;const valued=rows.filter(v=>v.score>0);const covered=a.weight*valued.length/a.criteria.length;const average=valued.length?valued.reduce((n,v)=>n+v.score,0)/valued.length:null;const points=average===null?null:average/5*covered;if(points!==null)total+=points;weight+=covered;count+=valued.length;return {...a,average,points,count:valued.length,covered};});
 const score=weight?total/weight*100:null,complete=count===15;
 const label=score===null?'Pendiente de valoración':score<60?'Necesita apoyo prioritario':score<80?'En desarrollo':score<90?'Cumple lo esperado':'Supera lo esperado';
 const comment=score===null?'Todavía no hay criterios valorados. Reúna ejemplos y converse con la persona antes de emitir un resultado.':score<60?'Conviene acompañar a la persona de cerca. Revise las dificultades y las condiciones de trabajo, defina apoyos concretos y programe un seguimiento próximo.':score<80?'La persona muestra avances y tiene aspectos por fortalecer. Reconozca lo que hace bien y acuerden acciones concretas, con herramientas, orientación o capacitación.':score<90?'El resultado refleja cumplimiento de lo esperado según los criterios registrados. Reconozca los logros y revisen las áreas donde todavía se puede mejorar.':'El resultado refleja un desempeño que supera lo esperado según los ejemplos registrados. Reconozca sus aportes y acuerden cómo sostenerlos y compartir buenas prácticas.';
 return {score,complete,count,coverage:weight,label,comment,areas};
}
