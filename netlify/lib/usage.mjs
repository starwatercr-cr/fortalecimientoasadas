import {externalAllowed} from './access.mjs';
export const USAGE_PAGES={
 '/herramientas.html':['herramientas','Herramientas'], '/panel-gestion.html':['panel','Panel de gestión'],
 '/nuestra-asada.html':['asada','Nuestra ASADA'], '/decision-center.html':['centro','Centro de decisiones'],
 '/nuestra-agua.html':['agua','Nuestra agua'], '/aforos.html':['aforos','Aforos'], '/anc.html':['anc','Macromedición y micromedición'],
 '/nuestras-finanzas.html':['finanzas','Nuestras finanzas'], '/morosidad.html':['morosidad','Seguimiento de morosidad'],
 '/bodega.html':['bodega','Proveeduría'], '/operacion.html':['operacion','Bitácora de operación'],
 '/calidad.html':['calidad','Calidad de nuestra agua'], '/equipo.html':['equipo','Nuestro equipo'],
 '/asamblea.html':['asamblea','Informes para la Asamblea'], '/diagnostico.html':['diagnostico','Evaluación de la ASADA'],
 '/planes.html':['planes','Planes de gestión'], '/biblioteca.html':['biblioteca','Biblioteca de consulta'],
 '/abonados.html':['abonados','Análisis e Información de Abonados'], '/disponibilidades.html':['disponibilidades','Disponibilidades de agua'],
 '/accesos.html':['accesos','Usuarios y permisos']
};
export function reportFilters(url,uuid,ErrorType){
 const q=url.searchParams,start=q.get('start'),end=q.get('end');
 const valid=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
 if(!valid(start)||!valid(end)||end<start||(Date.parse(end)-Date.parse(start))/86400000>92)throw new ErrorType(400,'Seleccione un período de hasta 93 días.');
 const asada=q.get('asada')||null,user=q.get('user')||null,kind=q.get('kind')||null;
 if(asada&&!uuid(asada)||user&&!uuid(user)||kind&&!['trial','paid'].includes(kind))throw new ErrorType(400,'Revise los filtros de ASADA, usuario y acceso.');
 return {p_start:start,p_end:end,p_asada:asada,p_user:user,p_kind:kind};
}
export async function usageAPI(api,request,ctx){
 const {authorized,sessionToken,sb,json,body,uuid,PublicError}=ctx,who=await authorized(sessionToken(request));
 if(api==='usage-pulse'&&request.method==='POST'){
  if(who.admin)return json({ok:true,recorded:false});
  if(who.termsPending)throw new PublicError(428,'Acepte las condiciones de la prueba.');
  const p=await body(request),tool=USAGE_PAGES[p.page];
  if(!tool||!uuid(p.client)||!Number.isInteger(p.seq)||p.seq<1||p.seq>1000000||!Number.isInteger(p.seconds)||p.seconds<0||p.seconds>60)throw new PublicError(400,'Registro de actividad no válido.');
  if(!externalAllowed(who,p.page.slice(1))||p.page==='/equipo.html'&&who.role!=='Administración'||p.page==='/accesos.html'&&who.role!=='Administración')throw new PublicError(403,'Herramienta no autorizada.');
  await sb('/rest/v1/rpc/record_platform_usage',{method:'POST',body:{p_user:who.user.id,p_asada:who.asada.id,p_client:p.client,p_seq:p.seq,p_seconds:p.seconds,p_tool:tool[0],p_kind:who.asada.access_kind==='trial'?'trial':'paid',p_email:who.user.email||'',p_name:who.fullName||'',p_role:who.role}});
  return json({ok:true});
 }
 if(!who.admin)throw new PublicError(403,'Uso de la plataforma está disponible únicamente para Star Water.');
 if(api==='usage-report'&&request.method==='GET'){
  const data=await sb('/rest/v1/rpc/platform_usage_report',{method:'POST',body:reportFilters(new URL(request.url),uuid,PublicError)});
  return json({...data,toolsCatalog:Object.fromEntries(Object.values(USAGE_PAGES))});
 }
 throw new PublicError(404,'Operación no disponible.');
}
