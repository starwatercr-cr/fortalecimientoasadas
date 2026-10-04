export const profileFields=[
 ['name','Nombre de la ASADA','text'],['tax','Cédula jurídica','text'],['president','Nombre de quien ocupa la presidencia','text'],['boardPeriod','Período de la Junta Directiva','text'],['phone','Teléfono oficial','tel'],['email','Correo oficial','email'],['province','Provincia','text'],['canton','Cantón','text'],['district','Distrito','text'],['address','Ubicación o dirección','text'],['communities','Comunidades atendidas','textarea'],['users','Servicios o abonados activos','integer'],['population','Población abastecida estimada','integer'],['pipeKm','Kilómetros aproximados de tubería','number']
];
export function identityDraft(p){
 const clean=s=>String(s||'').trim().replace(/[.!?]+$/,'');
 const who=clean(p.who),service=clean(p.service),commitment=clean(p.commitment),future=clean(p.future),principles=String(p.principles||'').trim();
 if(!who||!service||!commitment||!future||!principles)throw Error('Complete las cinco preguntas para preparar el borrador.');
 return {mission:`Nuestra misión es ${service.charAt(0).toLowerCase()+service.slice(1)} para ${who}, con el compromiso de ${commitment.charAt(0).toLowerCase()+commitment.slice(1)}.`,vision:`En los próximos cinco años, aspiramos a ${future.charAt(0).toLowerCase()+future.slice(1)}.`,values:principles,identityStatus:'Borrador',agreement:'',approvedDate:''};
}
export function profileReport(p,updated){
 const out=[['Datos generales',profileFields.map(([k,label])=>[label,p[k]===null||p[k]===undefined||p[k]===''?'Pendiente de completar':String(p[k])])],['Identidad y Rumbo',[['Misión',p.mission||'Pendiente de definir'],['Visión',p.vision||'Pendiente de definir'],['Valores',p.values||'Pendiente de definir'],['Prioridades de mejora',p.priorities||'Pendiente de definir'],['Estado',p.identityStatus||'Borrador'],['Acuerdo de aprobación',p.agreement||'Sin acuerdo registrado'],['Fecha de aprobación',p.approvedDate||'Sin fecha registrada']]]];
 return {name:p.name||'Nuestra ASADA',updated:updated?new Date(updated).toLocaleString('es-CR'):'Sin actualización',sections:out};
}
