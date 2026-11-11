export const TRIAL_TERMS_VERSION='2026-10-07-v1';
export const ACCESS_MODULES={planes:'Planes y seguimiento de la ASADA',abonados:'Análisis e Información de Abonados',panel:'Panel de gestión y finanzas (incluye acuerdos, presupuesto y plan anual)',agua:'Nuestra agua y aforos',operacion:'Bitácora de operación',bodega:'Proveedores y bodega',asamblea:'Informes para la Asamblea',calidad:'Interpretación de análisis de agua',biblioteca:'Biblioteca normativa',diagnostico:'Diagnóstico',morosidad:'Seguimiento de morosidad'};
const FILE_MODULES={planes:['planes.html','plans.js','plans-model.js','plans-export.js'],abonados:['disponibilidades.html','availability.js','availability-model.js','availability-export.js','abonados.html','abonados.js','abonados-model.js','abonados-files.js','abonados-export.js'],panel:['financial-home-model.js','panel-gestion.html','panel-gestion.js','nuestras-finanzas.html','finanzas.js','finance-word.js'],agua:['anc.html','anc.js','anc-model.js','anc-export.js','nuestra-agua.html','agua.js','water-model.js','aforos.html','aforos.js','aforos-model.js','aforos-export.js'],operacion:['operacion.html','operacion.js','water-parameters.js','water-guidance.js','operation-excel.js','assets/operation-template.xlsx'],bodega:['bodega.html','bodega.js','warehouse-model.js','warehouse-excel.js','assets/warehouse-template.xlsx'],asamblea:['asamblea.html','asamblea.js'],calidad:['calidad.html','calidad.js','water-parameters.js','water-guidance.js'],biblioteca:['biblioteca.html','biblioteca.js','normativa-data.js','assets/normativa/agua-potable.pdf','assets/normativa/asadas.pdf','assets/normativa/calidad.pdf','assets/normativa/servicios-aya.pdf','assets/normativa/pozos.pdf','assets/normativa/hidrantes.pdf'],diagnostico:['diagnostico.html','diagnostic.js','diagnostic-model.js','diagnostic-pdf.js'],morosidad:['morosidad.html','morosidad.js','morosidad-model.js','morosidad-excel.js']};
const API_MODULES={planes:['plans-asadas','plans-data','plans-files','plans-file'],abonados:['availability-asadas','availability-data','availability-files','availability-file','abonados-asadas','abonados-list','abonados-data'],panel:['panel-asadas','panel-data','panel-planning','panel-history','panel-agreements','panel-agreement-file'],agua:['anc-asadas','anc-data','anc-micro','flow-asadas','flow-data','panel-asadas','panel-planning'],operacion:['ops-asadas','ops-data','ops-history'],bodega:['panel-asadas','warehouse-data','warehouse-history','warehouse-tdr-list','warehouse-tdr-get'],asamblea:['panel-asadas','assembly-draft'],morosidad:['panel-asadas','arrears-data','arrears-history']};
export function externalAllowed(who,resource,isAPI=false,method='GET'){
 if(!who.external)return true;
 if(isAPI&&['me','logout','password'].includes(resource))return true;
 if(method!=='GET')return false;
 if(!isAPI&&['tools-page.js','herramientas.html','condiciones-prueba.html','condiciones-prueba.js','assets/docx.js','assets/jspdf.umd.min.js','assets/diagnostic-fonts.js'].includes(resource))return true;
 if(isAPI&&resource==='letterhead-data'&&method==='GET')return true;
 if(!isAPI&&resource==='letterhead.js')return true;
 const map=isAPI?API_MODULES:FILE_MODULES;
 return (who.modules||[]).some(m=>map[m]?.includes(resource));
}
export async function accessAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError}){
 const who=await authorized(sessionToken(request)),fail=(m,s=400)=>{throw new PublicError(s,m);};
 if(!who.admin&&(who.external||who.role!=='Administración'))fail('La administración de la ASADA autoriza y gestiona sus cuentas.',403);
 const u=new URL(request.url),input=request.method==='POST'?await body(request):null,requested=input?.asada||u.searchParams.get('asada');let asada=who.asada;
 if(who.admin){if(api==='access-asadas')return json({asadas:await sb('/rest/v1/asadas?select=id,name,active&order=name.asc')});if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&select=id,name,active'))?.[0];}
 else if(requested&&requested!==asada.id)fail('Solo puede gestionar las cuentas de su ASADA.',403);
 if(!asada)fail('La ASADA no existe.',404);
 const scope='asada_id=eq.'+asada.id,columns='user_id,asada_id,email,role,active,full_name,external,allowed_modules,expires_at,authorized_by,access_reason,created_at';
 const members=await sb('/rest/v1/memberships?'+scope+'&select='+columns+'&order=created_at.asc');
 if(api==='access-list'&&request.method==='GET')return json({asada,members,limit:3,modules:ACCESS_MODULES,self:who.user.id});
 if(!['access-create','access-update'].includes(api)||request.method!=='POST')fail('Operación no disponible.',404);
 const name=typeof input.name==='string'?input.name.trim().slice(0,120):'',external=input.external===true,role=external?'Operación':input.role;
 if(name.length<3||!['Administración','Junta Directiva','Operación'].includes(role))fail('Indique el nombre y la función de la persona.');
 const modules=external?input.modules:[];
 if(external&&(!Array.isArray(modules)||!modules.length||modules.length>Object.keys(ACCESS_MODULES).length||modules.some(m=>!Object.hasOwn(ACCESS_MODULES,m))))fail('Seleccione las áreas que podrá consultar.');
 let expires=null;if(external){const t=Date.parse(input.expires);if(!Number.isFinite(t)||(input.active!==false&&t<=Date.now())||t>Date.now()+366*86400000)fail('El acceso externo requiere un vencimiento futuro, hasta un año.');expires=new Date(t).toISOString();}
 const reason=typeof input.reason==='string'?input.reason.trim().slice(0,300):'';if(external&&reason.length<5)fail('Indique el trabajo o motivo que autoriza el acceso externo.');
 const active=input.active!==false,row={full_name:name,role,external,allowed_modules:modules,expires_at:expires,access_reason:reason,active,authorized_by:who.user.id};
 const live=m=>m.active&&(!m.expires_at||Date.parse(m.expires_at)>Date.now());
 if(api==='access-update'){
  if(!uuid(input.user))fail('Seleccione una persona.');const old=members.find(m=>m.user_id===input.user);if(!old)fail('Esa cuenta no pertenece a la ASADA.',403);
  if(!who.admin&&old.user_id===who.user.id)fail('Para cambiar su propio permiso, solicite apoyo de Star Water.',403);
  if(!who.admin&&old.role==='Administración'&&!old.external&&live(old)&&(!active||external||role!=='Administración')&&!members.some(m=>m.user_id!==old.user_id&&m.role==='Administración'&&!m.external&&live(m)))fail('Mantenga una cuenta de administración activa.');
  if(active&&(!expires||Date.parse(expires)>Date.now())&&!live(old)&&members.filter(live).length>=3)fail('La ASADA ya tiene tres cuentas activas. Suspenda una antes de habilitar otra.',409);
  await sb('/rest/v1/memberships?user_id=eq.'+input.user+'&'+scope,{method:'PATCH',body:row});return json({ok:true});
 }
 if(members.filter(live).length>=3)fail('La ASADA ya tiene tres cuentas activas. Suspenda una antes de crear otra.',409);
 const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
 if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||typeof input.password!=='string'||input.password.length<8||input.password.length>128||!active)fail('Indique correo y contraseña inicial de al menos 8 caracteres.');
 const user=await sb('/auth/v1/admin/users',{method:'POST',body:{email,password:input.password,email_confirm:true}}),id=user?.id||user?.user?.id;
 if(!uuid(id))fail('No se pudo crear la cuenta.',502);
 try{await sb('/rest/v1/memberships',{method:'POST',body:{...row,user_id:id,asada_id:asada.id,email}});}catch(e){try{await sb('/auth/v1/admin/users/'+id,{method:'DELETE'});}catch{fail('La cuenta quedó pendiente de vincular. Contacte a Star Water.',502);}throw e;}
 return json({ok:true},201);
}
