import {usageAPI} from '../lib/usage.mjs';
import {availabilityAPI} from '../lib/availability.mjs';
import {plansAPI} from '../lib/plans.mjs';
import {ancAPI} from '../lib/anc.mjs';
import {abonadosAPI} from '../lib/abonados.mjs';
import {accessAPI,externalAllowed,TRIAL_TERMS_VERSION} from '../lib/access.mjs';
import {arrearsAPI} from '../lib/arrears.mjs';
import {profileAPI} from '../lib/asada-profile.mjs';
import {warehouseAPI} from '../lib/warehouse.mjs';
import {assemblyAPI} from '../lib/assembly.mjs';
import {aforosAPI} from '../lib/aforos.mjs';
import {operationAPI} from '../lib/operation.mjs';
import {teamAPI,canManageTeam} from '../lib/team.mjs';
import {panelAPI} from '../lib/panel.mjs';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('private');
const cookieName='__Host-asada-session';
const refreshName='__Host-asada-refresh',rememberSeconds=30*24*60*60;
const requestTokens=new WeakMap();
const cookieValue=(request,name)=>{const part=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));const value=part?.slice(name.length+1);return value&&value.length<=16384&&/^[A-Za-z0-9._~-]+$/.test(value)?value:null;};
const cookie=(name,value,age)=>name+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+age;
const clearCookies=()=>[cookie(cookieName,'',0),cookie(refreshName,'',0)];
function withCookies(response,values){for(const value of values)response.headers.append('Set-Cookie',value);return response;}
function sessionCookies(session,remember){const access=session?.access_token,refresh=session?.refresh_token;if(typeof access!=='string'||access.length>16384||! /^[A-Za-z0-9._~-]+$/.test(access)||(remember&&(typeof refresh!=='string'||refresh.length>16384||! /^[A-Za-z0-9._~-]+$/.test(refresh))))throw new PublicError(502,'No pudimos preparar la sesión. Intente de nuevo.');return [cookie(cookieName,access,Math.max(1,Math.min(Number(session.expires_in)||3600,3600))),remember?cookie(refreshName,refresh,rememberSeconds):cookie(refreshName,'',0)];}
const maxBody=12000;
const protectedFiles=new Set(['financial-home-model.js','tools-page.js','uso-plataforma.html','usage.js','disponibilidades.html','availability.js','availability-model.js','availability-export.js','letterhead.js','planes.html','plans.js','plans-model.js','plans-export.js','anc.html','anc.js','anc-model.js','anc-export.js','abonados.html','abonados.js','abonados-model.js','abonados-files.js','abonados-export.js','accesos.html','accesos.js','condiciones-prueba.html','condiciones-prueba.js','aforos.html','aforos.js','aforos-model.js','aforos-export.js','contract-model.js','contract-template.js','contract-pdf.js','contract-ui.js','decision-center.html','decision-center.js','decision-model.js','morosidad.html','morosidad.js','morosidad-model.js','morosidad-excel.js','nuestra-asada.html','nuestra-asada.js','asada-profile-model.js','bodega.html','bodega.js','warehouse-model.js','warehouse-excel.js','assets/warehouse-template.xlsx','operacion.html','operacion.js','water-parameters.js','water-guidance.js','operation-excel.js','assets/operation-template.xlsx','equipo.html','equipo.js','evaluation-model.js','labor-model.js','labor-ui.js','labor-pdf.js','panel-gestion.html','panel-gestion.js','herramientas.html','diagnostico.html','diagnostic-model.js','diagnostic.js','diagnostic-pdf.js','assets/jspdf.umd.min.js','assets/diagnostic-fonts.js','nuestra-agua.html','nuestras-finanzas.html','asamblea.html','calidad.html','biblioteca.html','agua.js','water-model.js','finanzas.js','finance-word.js','asamblea.js','calidad.js','biblioteca.js','normativa-data.js','assets/docx.js','assets/normativa/agua-potable.pdf','assets/normativa/calidad.pdf','assets/normativa/asadas.pdf','assets/normativa/servicios-historico.pdf']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.pdf':'application/pdf','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
class PublicError extends Error{constructor(status,message){super(message);this.status=status;}}
const headers={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY'};
const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}});
function config(){const base=process.env.SUPABASE_URL?.replace(/\/$/,'');const publicKey=process.env.SUPABASE_ANON_KEY;const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!base||!publicKey||!secret)throw new PublicError(503,'El acceso privado está pendiente de configuración. Contacte a Star Water.');return {base,publicKey,secret};}
async function sb(endpoint,{method='GET',body,token,publicKey=false,prefer}={}){
 const c=config();const key=publicKey?c.publicKey:c.secret;
 const h={apikey:key,'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;else if(!publicKey&&!c.secret.startsWith('sb_secret_'))h.Authorization='Bearer '+c.secret;if(prefer)h.Prefer=prefer;
 let res;try{res=await fetch(c.base+endpoint,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});}catch{throw new PublicError(503,'No pudimos conectar con el servicio de cuentas. Intente de nuevo.');}
 const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null;}catch{data=null;}
 if(!res.ok){if(endpoint.startsWith('/rest/v1/water_availability_records')&&data?.code==='23505')throw new PublicError(409,'Ya existe ese número de oficio o machote. Recargue los expedientes y revise antes de guardar.');if(endpoint.startsWith('/rest/v1/water_anc_periods')&&data?.code==='23505')throw new PublicError(409,'Ya existe un balance ANC para ese mes. Abra el registro guardado para actualizarlo.');if(endpoint.startsWith('/rest/v1/subscriber_imports')&&data?.code==='23505')throw new PublicError(409,'Este conjunto de datos ya fue guardado. Actualice la lista de importaciones.');if(data?.message==='La ASADA ya tiene tres cuentas activas.')throw new PublicError(409,data.message);if(endpoint==='/rest/v1/rpc/reserve_asada_trial'&&['Ese correo ya tiene una cuenta. Ingrese con su acceso actual.','La prueba de esta ASADA ya fue utilizada.','Espere un minuto antes de volver a solicitar la prueba.','Ya existe una solicitud para esa cédula jurídica. Consulte a Star Water.','Hay muchas solicitudes. Intente más tarde.'].includes(data?.message))throw new PublicError(data.message.startsWith('Espere')||data.message.startsWith('Hay muchas')?429:409,data.message);if(endpoint.startsWith('/auth/v1/signup'))throw new PublicError(res.status===429?429:400,res.status===429?'Espere unos minutos antes de solicitar otro correo.':'No pudimos enviar la confirmación. Si ya tiene cuenta, ingrese. Si el problema continúa, contacte a Star Water.');if(endpoint.startsWith('/rest/v1/panel_records')&&data?.code==='23505')throw new PublicError(409,'Ya existe ese registro para el período. Si es un pago, revise el proveedor y el número de factura antes de guardar.');if(endpoint.startsWith('/rest/v1/arrears_records')&&body?.kind==='notice'&&data?.code==='23514'&&/arrears_records_(?:kind_)?check/.test(data?.message||''))throw new PublicError(409,'El guardado de oficios aún no está habilitado en la base de datos. Solicite a la administración aplicar la actualización de oficios.');if(endpoint.startsWith('/rest/v1/arrears_records')&&data?.code==='23505')throw new PublicError(409,'Ya existe un registro con ese número de abonado o factura. Actualice los datos.');if(endpoint==='/rest/v1/rpc/arrears_import'){if(data?.code==='23505')throw new PublicError(409,'Una factura ya fue guardada. Actualice y revise el archivo de nuevo.');if(['Los saldos cambiaron. Actualice y revise el archivo de nuevo','Solicitud repetida con datos distintos','Revise la identidad y fecha de corte'].includes(data?.message))throw new PublicError(409,data.message);}if(endpoint==='/rest/v1/rpc/warehouse_move'&&['El material cambió. Actualice antes de registrar','La salida supera las existencias disponibles','Material no disponible','Solicitud repetida con datos distintos','Proveedor no disponible','Revise cantidad, fecha, motivo y responsable'].includes(data?.message))throw new PublicError(409,data.message);if(endpoint.startsWith('/rest/v1/asada_profiles')&&data?.code==='23505')throw new PublicError(409,'Otra persona creó la ficha. Recargue antes de guardar.');if(endpoint.startsWith('/rest/v1/water_flow_records')&&data?.code==='23505')throw new PublicError(409,'Ya existe una fuente con ese nombre o un aforo de esa fuente en la misma fecha y campaña. Revise el historial.');if(endpoint.startsWith('/rest/v1/warehouse_records')&&data?.code==='23505')throw new PublicError(409,'Ya existe un material activo con ese código. Actualice los registros.');if(res.status===429)throw new PublicError(429,'Se hicieron demasiados intentos. Espere unos minutos.');throw new PublicError(res.status===400||res.status===401||res.status===403?401:502,'No fue posible completar la operación. Verifique los datos o consulte a Star Water.');}return data;
}
async function teamStorage(method,object,bytes,type,bucket='asada-team-private'){
 const c=config(),h={apikey:c.secret};if(!c.secret.startsWith('sb_secret_'))h.Authorization='Bearer '+c.secret;
 const call=(endpoint,options={})=>fetch(c.base+'/storage/v1/'+endpoint,{...options,headers:{...h,...options.headers},signal:AbortSignal.timeout(20000)});
 if(method==='POST'){
  let b=await call('bucket/'+bucket);
  if(b.status===404||b.status===400){
   const created=await call('bucket',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:bucket,name:bucket,public:false,file_size_limit:['asada-profile-private','asada-plans-private','asada-availability-private'].includes(bucket)?5242880:2097152,allowed_mime_types:['application/pdf','image/jpeg','image/png']})});
   if(!created.ok&&created.status!==409&&created.status!==400)throw new PublicError(502,'No se pudo preparar el archivo privado.');
   b=await call('bucket/'+bucket);
  }
  if(!b.ok)throw new PublicError(502,'No se pudo acceder a los documentos privados.');
  const metadata=await b.json();if(metadata.public!==false)throw new PublicError(503,'El archivo privado requiere revisión de su configuración.');
 }
 const resource=method==='GET'?'object/authenticated/':'object/';
 const res=await call(resource+bucket+'/'+object,{method,headers:type?{'Content-Type':type,'x-upsert':'false'}:{},body:bytes});
 if(!res.ok)throw new PublicError(502,'No fue posible '+(method==='GET'?'descargar':'guardar')+' el documento. Intente de nuevo.');
 return method==='GET'?await res.arrayBuffer():null;
}
function sessionToken(request){return requestTokens.get(request)||cookieValue(request,cookieName);}
async function authorizeToken(token){if(!token)throw new PublicError(401,'Inicie sesión para acceder.');let user;try{user=await sb('/auth/v1/user',{token,publicKey:true});}catch(e){if(e.status===401)throw new PublicError(401,'La sesión terminó. Inicie sesión de nuevo.');throw e;}
 if(!user?.id)throw new PublicError(401,'Inicie sesión de nuevo.');
 const uid=encodeURIComponent(user.id);
 const admins=await sb('/rest/v1/platform_admins?user_id=eq.'+uid+'&active=eq.true&select=user_id');
 if(admins?.length)return {user,admin:true,asada:null,role:'Star Water'};
 const membershipQuery='/rest/v1/memberships?user_id=eq.'+uid+'&active=eq.true&select=user_id,role,asada_id,full_name,external,allowed_modules,expires_at,asadas(id,name,active,access_kind,trial_started_at,trial_ends_at)';
 let rows=await sb(membershipQuery);
 if(!rows?.length&&user.email_confirmed_at){
  // Do not recreate an inactive membership or use editable user metadata.
  const existing=await sb('/rest/v1/memberships?user_id=eq.'+uid+'&select=user_id');
  if(!existing?.length){const created=await sb('/rest/v1/rpc/start_asada_trial',{method:'POST',body:{p_user:user.id}});if(created)rows=await sb(membershipQuery);}
 }
 const membership=rows?.[0];
 if(!membership?.asadas?.active)throw new PublicError(403,'Su acceso no está activo. Consulte a Star Water.');
 if(membership.asadas.access_kind==='trial'&&(!Number.isFinite(Date.parse(membership.asadas.trial_ends_at))||Date.now()>=Date.parse(membership.asadas.trial_ends_at)))throw new PublicError(402,'Su prueba gratuita de 3 días terminó. Contacte a Star Water para contratar y continuar con la información registrada.');
 if(membership.expires_at&&(!Number.isFinite(Date.parse(membership.expires_at))||Date.now()>=Date.parse(membership.expires_at)))throw new PublicError(403,'Su acceso temporal ha vencido. Consulte a la administración de la ASADA.');
 let termsPending=false;
 if(membership.asadas.access_kind==='trial'){
  const accepted=await sb('/rest/v1/trial_terms_acceptances?user_id=eq.'+uid+'&version=eq.'+TRIAL_TERMS_VERSION+'&select=user_id');
  termsPending=!accepted?.length;
 }
 return {user,admin:false,asada:membership.asadas,role:membership.external?'Consulta externa':membership.role,external:membership.external===true,modules:membership.allowed_modules||[],fullName:membership.full_name||'',expires:membership.expires_at||null,termsPending};
}
async function body(request,limit=maxBody){if(Number(request.headers.get('content-length'))>limit)throw new PublicError(413,'La solicitud es demasiado extensa.');const text=await request.text();if(text.length>limit)throw new PublicError(413,'La solicitud es demasiado extensa.');try{return JSON.parse(text);}catch{throw new PublicError(400,'La información enviada no es válida.');}}
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
async function owner(request,auth=authorizeToken){const who=await auth(sessionToken(request));if(!who.admin)throw new PublicError(403,'Esta acción corresponde a Star Water.');return who;}
async function dispatch(request,authorized=authorizeToken){
 const url=new URL(request.url);const api=url.pathname.startsWith('/api/')?url.pathname.slice(5):url.searchParams.get('api');
 try{
  if(request.method!=='GET'&&request.method!=='POST')return json({error:'Método no permitido.'},405);
  if(request.method==='POST'&&request.headers.get('origin')!==url.origin)throw new PublicError(403,'Origen de la solicitud no autorizado.');
  if(api){
   if(api.startsWith('usage-'))return await usageAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError});
   const moduleAPI=/^(availability|plans|anc|abonados|profile|arrears|warehouse|flow|ops|team|assembly|panel|access)-/.test(api);
   if(moduleAPI){const who=await authorized(sessionToken(request));if(who.termsPending)throw new PublicError(428,'Lea y acepte las condiciones de la prueba antes de continuar.');if(!externalAllowed(who,api,true,request.method))throw new PublicError(403,'Esta área o acción no está autorizada para su acceso externo.');}
   if(api.startsWith('access-'))return await accessAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError});
   if(api==='trial-accept'&&request.method==='POST'){
    const who=await authorized(sessionToken(request)),input=await body(request);
    if(who.admin||who.asada?.access_kind!=='trial'||input.accept!==true||input.version!==TRIAL_TERMS_VERSION)throw new PublicError(400,'Lea y acepte las condiciones vigentes de la prueba.');
    await sb('/rest/v1/trial_terms_acceptances?on_conflict=user_id,version',{method:'POST',prefer:'resolution=ignore-duplicates',body:{user_id:who.user.id,asada_id:who.asada.id,version:TRIAL_TERMS_VERSION}});return json({ok:true});
   }
   if(api.startsWith('availability-'))return await availabilityAPI(api,request,{sb,authorized,sessionToken,body:r=>body(r,60000),uuid,json,PublicError,storage:(method,object,bytes,type)=>teamStorage(method,object,bytes,type,'asada-availability-private')});
   if(api.startsWith('plans-'))return await plansAPI(api,request,{sb,authorized,sessionToken,body:r=>body(r,700000),uuid,json,PublicError,storage:(method,object,bytes,type)=>teamStorage(method,object,bytes,type,'asada-plans-private')});
   if(api.startsWith('anc-'))return await ancAPI(api,request,{sb,authorized,sessionToken,body:r=>body(r,45000),uuid,json,PublicError});
   if(api.startsWith('abonados-'))return await abonadosAPI(api,request,{sb,authorized,sessionToken,body:r=>body(r,5500000),uuid,json,PublicError});
   if(api.startsWith('profile-')||api==='letterhead-data')return await profileAPI(api,request,{sb,authorized,sessionToken,body:r=>body(r,300000),uuid,json,PublicError,profileStorage:(method,object,bytes,type)=>teamStorage(method,object,bytes,type,'asada-profile-private')});
   if(api.startsWith('arrears-'))return await arrearsAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError,storage:(method,path,bytes,type)=>teamStorage(method,path,bytes,type,'asada-arrears-private')});
   if(api.startsWith('warehouse-'))return await warehouseAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError});
   if(api.startsWith('flow-'))return await aforosAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError});
   if(api.startsWith('ops-'))return await operationAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError});
   if(api.startsWith('team-'))return await teamAPI(api,request,{sb,authorized,sessionToken,body:r=>body(r,24000),uuid,json,PublicError,teamStorage});
   if(api.startsWith('assembly-'))return await assemblyAPI(api,request,{sb,authorized,sessionToken,body:r=>body(r,160000),uuid,json,PublicError});
   if(api.startsWith('panel-')){const who=await authorized(sessionToken(request));const r=await panelAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError,profileStorage:(method,object,bytes,type)=>teamStorage(method,object,bytes,type,'asada-profile-private')});if(who.external&&!who.modules.includes('panel')&&api==='panel-planning'&&r.ok){const d=await r.json();d.records=d.records.filter(x=>x.kind==='water');return json(d);}return r;}
   if(api==='logout'&&request.method==='POST'){let token=sessionToken(request);try{if(!token&&cookieValue(request,refreshName)){const session=await sb('/auth/v1/token?grant_type=refresh_token',{method:'POST',publicKey:true,body:{refresh_token:cookieValue(request,refreshName)}});token=session?.access_token;}if(token){try{await sb('/auth/v1/logout?scope=local',{method:'POST',publicKey:true,token});}catch(error){if(error.status!==401||!cookieValue(request,refreshName))throw error;const session=await sb('/auth/v1/token?grant_type=refresh_token',{method:'POST',publicKey:true,body:{refresh_token:cookieValue(request,refreshName)}});await sb('/auth/v1/logout?scope=local',{method:'POST',publicKey:true,token:session.access_token});}}}catch{/* Browser credentials are cleared even if the account service is unavailable. */}return withCookies(json({ok:true}),clearCookies());}
   if(api==='trial-register'&&request.method==='POST'){
    const input=await body(request),email=text(input.email,254).toLowerCase(),name=text(input.name,160),contact=text(input.contact,120),phone=text(input.phone,30),legal=text(input.legal,30).replace(/[\s-]/g,''),role=input.role;
    if(!/^\S+@\S+\.\S+$/.test(email)||name.length<3||contact.length<3||!/^[0-9]{10}$/.test(legal)||phone.replace(/\D/g,'').length<8||!['Administración','Junta Directiva'].includes(role)||typeof input.password!=='string'||input.password.length<8||input.password.length>128||input.accept!==true||input.rights!==true||input.termsVersion!==TRIAL_TERMS_VERSION)throw new PublicError(400,'Complete los datos, la cédula jurídica de 10 dígitos y una contraseña de al menos 8 caracteres. Acepte las condiciones de la prueba.');
    await sb('/rest/v1/rpc/reserve_asada_trial',{method:'POST',body:{p_email:email,p_legal:legal,p_name:name,p_contact:contact,p_phone:phone,p_role:role}});
    await sb('/rest/v1/trial_requests?email=eq.'+encodeURIComponent(email),{method:'PATCH',body:{terms_version:TRIAL_TERMS_VERSION,terms_accepted_at:new Date().toISOString()}});
    const session=await sb('/auth/v1/signup?redirect_to='+encodeURIComponent(url.origin+'/acceso.html?prueba=confirmada'),{method:'POST',publicKey:true,body:{email,password:input.password}});
    if(session?.access_token){await authorized(session.access_token);return withCookies(json({ok:true,ready:true},201),sessionCookies(session,false));}
    return json({ok:true,ready:false,message:'Revise su correo para confirmar el acceso. Después ingrese con su correo y contraseña. Los 3 días comienzan con su primer ingreso.'},201);
   }
   if(api==='trial-confirm'&&request.method==='POST'){
    const input=await body(request);if(typeof input.token!=='string'||input.token.length>16384||! /^[A-Za-z0-9._~-]+$/.test(input.token))throw new PublicError(400,'El enlace no es válido. Ingrese con su correo y contraseña.');
    await authorized(input.token);
    return withCookies(json({ok:true}),[cookie(cookieName,input.token,3600),cookie(refreshName,'',0)]);
   }
   if(api==='admin-trial-convert'&&request.method==='POST'){
    await owner(request,authorized);const input=await body(request);if(!uuid(input.id)||input.confirm!==true)throw new PublicError(400,'Confirme la contratación antes de activar el acceso.');
    const found=await sb('/rest/v1/asadas?id=eq.'+input.id+'&access_kind=eq.trial&select=id');if(!found?.length)throw new PublicError(409,'Esta ASADA no tiene un acceso de prueba.');
    await sb('/rest/v1/asadas?id=eq.'+input.id+'&access_kind=eq.trial',{method:'PATCH',body:{access_kind:'standard',active:true}});return json({ok:true});
   }
      if(api==='recovery-request'&&request.method==='POST'){
    const input=await body(request,4096);
    const email=text(input.email,254).toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new PublicError(400,'Ingrese un correo válido.');
    const redirect='https://fortalecimientoasadas.netlify.app/recuperar.html';
    try{await sb('/auth/v1/recover?redirect_to='+encodeURIComponent(redirect),{method:'POST',publicKey:true,body:{email}});}
    catch(error){if(error.status!==401&&error.status!==429)throw error;}
    return json({ok:true});
   }
   if(api==='recovery-save'&&request.method==='POST'){
    const input=await body(request,16384);
    const token=request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_.-]{20,12000})$/)?.[1];
    if(!token)throw new PublicError(401,'Solicite un enlace nuevo para continuar.');
    if(typeof input.password!=='string'||input.password.length<8||input.password.length>128)throw new PublicError(400,'Use una contraseña de 8 a 128 caracteres.');
    try{await sb('/auth/v1/user',{method:'PUT',publicKey:true,token,body:{password:input.password}});}
    catch(error){if(error.status===401)throw new PublicError(400,'No se pudo guardar. Revise los requisitos de la contraseña o solicite un enlace nuevo si venció.');throw error;}
    return json({ok:true});
   }
if(api==='login'&&request.method==='POST'){
    const input=await body(request);const email=text(input.email,254).toLowerCase(),password=input.password;
    if(!email||typeof password!=='string'||password.length<1||password.length>256)throw new PublicError(400,'Ingrese su correo y contraseña.');
    const session=await sb('/auth/v1/token?grant_type=password',{method:'POST',publicKey:true,body:{email,password}});
    const who=await authorized(session?.access_token);
    return withCookies(json({ok:true,admin:who.admin}),sessionCookies(session,input.remember===true));
   }
   if(api==='me'&&request.method==='GET'){const who=await authorized(sessionToken(request));return json({email:who.user.email,admin:who.admin,asada:who.asada,role:who.role,external:who.external===true,modules:who.modules||[],fullName:who.fullName||'',expires:who.expires||null,termsPending:who.termsPending===true,termsVersion:TRIAL_TERMS_VERSION});}
   if(api==='password'&&request.method==='POST'){
    const token=sessionToken(request);await authorized(token);const input=await body(request);if(typeof input.password!=='string'||input.password.length<8||input.password.length>128)throw new PublicError(400,'Use una contraseña de 8 a 128 caracteres.');
    await sb('/auth/v1/user',{method:'PUT',publicKey:true,token,body:{password:input.password}});return json({ok:true});
   }
   if(api==='admin-list'&&request.method==='GET'){await owner(request,authorized);const [asadas,members]=await Promise.all([sb('/rest/v1/asadas?select=id,name,active,access_kind,trial_started_at,trial_ends_at&order=name.asc'),sb('/rest/v1/memberships?select=user_id,asada_id,email,full_name,role,active&order=email.asc')]);return json({asadas,members});}
   if(api==='admin-asada'&&request.method==='POST'){
    await owner(request,authorized);const input=await body(request);const name=text(input.name,160);if(!name)throw new PublicError(400,'Ingrese el nombre de la ASADA.');
    const created=await sb('/rest/v1/asadas',{method:'POST',body:{name},prefer:'return=representation'});return json({asada:created?.[0]},201);
   }
   if(api==='admin-toggle'&&request.method==='POST'){
    await owner(request,authorized);
    const input=await body(request);
    if(!uuid(input.id)||typeof input.active!=='boolean'||!['asada','member'].includes(input.kind))throw new PublicError(400,'Seleccione un acceso válido.');
    const id=encodeURIComponent(input.id);
    let route=input.kind==='asada'?'/rest/v1/asadas?id=eq.'+id:'/rest/v1/memberships?user_id=eq.'+id;
    const changes={active:input.active};
    let renewed=false;
    if(input.kind==='asada'&&input.active){
     const [asada]=await sb(route+'&select=access_kind,trial_ends_at');
     if(!asada)throw new PublicError(404,'No se encontró la ASADA.');
     route+='&access_kind=eq.'+encodeURIComponent(asada.access_kind);
     if(asada.access_kind==='trial'){
      route+=asada.trial_ends_at==null?'&trial_ends_at=is.null':'&trial_ends_at=eq.'+encodeURIComponent(asada.trial_ends_at);
      const now=Date.now(),end=Date.parse(asada.trial_ends_at);
      if(!Number.isFinite(end)||end<=now){
       changes.trial_started_at=new Date(now).toISOString();
       changes.trial_ends_at=new Date(now+3*86400000).toISOString();
       renewed=true;
      }
     }
    }
    const updated=await sb(route,{method:'PATCH',body:changes,prefer:'return=representation'});
    if(!updated?.length)throw new PublicError(409,'No se pudo guardar. Recargue el listado e inténtelo de nuevo.');
    return json({ok:true,renewed});
   }
   if(api==='admin-reset'&&request.method==='POST'){
    await owner(request,authorized);const input=await body(request);if(!uuid(input.user)||typeof input.password!=='string'||input.password.length<8||input.password.length>128)throw new PublicError(400,'Seleccione una cuenta y una contraseña de al menos 8 caracteres.');
    const member=await sb('/rest/v1/memberships?user_id=eq.'+encodeURIComponent(input.user)+'&select=user_id');if(!member?.length)throw new PublicError(400,'Esta cuenta no corresponde a una ASADA.');
    await sb('/auth/v1/admin/users/'+input.user,{method:'PUT',body:{password:input.password}});return json({ok:true});
   }
   if(api==='admin-user'&&request.method==='POST'){
    await owner(request,authorized);const input=await body(request);const email=text(input.email,254).toLowerCase();const roles=['Administración','Junta Directiva','Operación'];
    if(!uuid(input.asada)||!/^\S+@\S+\.\S+$/.test(email)||!roles.includes(input.role)||typeof input.password!=='string'||input.password.length<8||input.password.length>128)throw new PublicError(400,'Revise la ASADA, el correo, la función y la contraseña de al menos 8 caracteres.');
    const current=await sb('/rest/v1/memberships?asada_id=eq.'+input.asada+'&active=eq.true&select=expires_at');if(current.filter(m=>!m.expires_at||Date.parse(m.expires_at)>Date.now()).length>=3)throw new PublicError(409,'La ASADA ya tiene tres cuentas activas. Suspenda una antes de crear otra.');
    const exists=await sb('/rest/v1/asadas?id=eq.'+encodeURIComponent(input.asada)+'&select=id');if(!exists?.length)throw new PublicError(400,'La ASADA seleccionada no existe.');
    const user=await sb('/auth/v1/admin/users',{method:'POST',body:{email,password:input.password,email_confirm:true}});const id=user?.id||user?.user?.id;if(!uuid(id))throw new PublicError(502,'No fue posible crear la cuenta.');
    try{await sb('/rest/v1/memberships',{method:'POST',body:{user_id:id,asada_id:input.asada,email,role:input.role,full_name:text(input.name,120),authorized_by:(await owner(request,authorized)).user.id}});}catch(error){try{await sb('/auth/v1/admin/users/'+id,{method:'DELETE'});}catch{throw new PublicError(502,'La cuenta quedó pendiente de vincular. Revísela en el servicio de cuentas antes de reintentar.');}throw error;}
    return json({ok:true},201);
   }
   throw new PublicError(404,'Operación no disponible.');
  }
  const file=protectedFiles.has(url.pathname.slice(1))?url.pathname.slice(1):url.searchParams.get('file');if(!protectedFiles.has(file))throw new PublicError(404,'Página no disponible.');
  try{const who=await authorized(sessionToken(request));if(who.termsPending&&!['condiciones-prueba.html','condiciones-prueba.js'].includes(file)){if(file.endsWith('.html'))return new Response(null,{status:303,headers:{...headers,Location:'/condiciones-prueba.html'}});throw new PublicError(428,'Acepte las condiciones de la prueba.');}if(['uso-plataforma.html','usage.js'].includes(file)&&!who.admin)throw new PublicError(403,'Uso de la plataforma está disponible únicamente para Star Water.');if(!externalAllowed(who,file))throw new PublicError(403,'Esta herramienta no está autorizada para su acceso externo.');if(['accesos.html','accesos.js'].includes(file)&&!who.admin&&who.role!=='Administración')throw new PublicError(403,'Usuarios y permisos corresponde a la administración de la ASADA.');if(['equipo.html','equipo.js','evaluation-model.js','labor-model.js','labor-ui.js','labor-pdf.js'].includes(file)&&!canManageTeam(who))throw new PublicError(403,'Nuestro equipo está disponible para la administración de la ASADA.');}catch(e){if(e.status===402&&file.endsWith('.html'))return new Response(null,{status:303,headers:{...headers,Location:'/acceso.html?prueba=vencida'}});if(e.status===401&&file.endsWith('.html'))return new Response(null,{status:303,headers:{...headers,Location:'/acceso.html?return='+encodeURIComponent('/'+file)}});throw e;}
  const bytes=await readFile(path.join(root,file));return new Response(bytes,{headers:{...headers,'Content-Type':mime[path.extname(file)]||'application/octet-stream'}});
 }catch(error){return json({error:error instanceof PublicError?error.message:'No fue posible completar la operación. Intente de nuevo.'},error instanceof PublicError?error.status:500);}
}
export default async function handler(request){
 const url=new URL(request.url),api=url.pathname.startsWith('/api/')?url.pathname.slice(5):url.searchParams.get('api');
 // Reject cross-origin writes before inspecting or renewing any credentials.
 if(request.method==='POST'&&request.headers.get('origin')!==url.origin)return json({error:'Origen de la solicitud no autorizado.'},403);
 const refresh=cookieValue(request,refreshName);if(!refresh||['recovery-request','recovery-save'].includes(api)||api==='login'||api==='logout'||api==='trial-register'||api==='trial-confirm'||!['GET','POST'].includes(request.method))return dispatch(request);
 let renewed=[];
 try{let token=sessionToken(request),who;
  try{who=await authorizeToken(token);}catch(error){if(error.status!==401)throw error;const session=await sb('/auth/v1/token?grant_type=refresh_token',{method:'POST',publicKey:true,body:{refresh_token:refresh}});renewed=sessionCookies(session,true);token=session.access_token;who=await authorizeToken(token);requestTokens.set(request,token);}
  return withCookies(await dispatch(request,t=>t===token?Promise.resolve(who):authorizeToken(t)),renewed);
 }catch(error){const code=error instanceof PublicError?error.status:500,values=[401,403].includes(code)?clearCookies():[];const file=protectedFiles.has(url.pathname.slice(1))?url.pathname.slice(1):url.searchParams.get('file');if(code===402&&protectedFiles.has(file)&&file.endsWith('.html'))return new Response(null,{status:303,headers:{...headers,Location:'/acceso.html?prueba=vencida'}});if(code===401&&protectedFiles.has(file)&&file.endsWith('.html'))return withCookies(new Response(null,{status:303,headers:{...headers,Location:'/acceso.html?return='+encodeURIComponent('/'+file)}}),values);return withCookies(json({error:error instanceof PublicError?error.message:'No fue posible completar la operación. Intente de nuevo.'},code),values);
 }finally{requestTokens.delete(request);}
}
export {protectedFiles};
