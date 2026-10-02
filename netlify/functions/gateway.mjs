import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('private');
const cookieName='__Host-asada-session';
const maxBody=12000;
const protectedFiles=new Set(['herramientas.html','diagnostico.html','nuestra-agua.html','nuestras-finanzas.html','asamblea.html','calidad.html','biblioteca.html','agua.js','finanzas.js','finance-word.js','asamblea.js','calidad.js','biblioteca.js','normativa-data.js','assets/docx.js','assets/normativa/agua-potable.pdf','assets/normativa/calidad.pdf','assets/normativa/asadas.pdf','assets/normativa/servicios-historico.pdf']);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.pdf':'application/pdf'};
class PublicError extends Error{constructor(status,message){super(message);this.status=status;}}
const headers={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY'};
const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}});
function config(){const base=process.env.SUPABASE_URL?.replace(/\/$/,'');const publicKey=process.env.SUPABASE_ANON_KEY;const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!base||!publicKey||!secret)throw new PublicError(503,'El acceso privado está pendiente de configuración. Contacte a Star Water.');return {base,publicKey,secret};}
async function sb(endpoint,{method='GET',body,token,publicKey=false,prefer}={}){
 const c=config();const key=publicKey?c.publicKey:c.secret;
 const h={apikey:key,'Content-Type':'application/json'};if(token)h.Authorization='Bearer '+token;else if(!publicKey&&!c.secret.startsWith('sb_secret_'))h.Authorization='Bearer '+c.secret;if(prefer)h.Prefer=prefer;
 let res;try{res=await fetch(c.base+endpoint,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(12000)});}catch{throw new PublicError(503,'No pudimos conectar con el servicio de cuentas. Intente de nuevo.');}
 const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null;}catch{data=null;}
 if(!res.ok){if(res.status===429)throw new PublicError(429,'Se hicieron demasiados intentos. Espere unos minutos.');throw new PublicError(res.status===400||res.status===401||res.status===403?401:502,'No fue posible completar la operación. Verifique los datos o consulte a Star Water.');}return data;
}
function sessionToken(request){const part=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='));const token=part?.slice(cookieName.length+1);if(!token||token.length>16384)return null;return token;}
async function authorized(token){if(!token)throw new PublicError(401,'Inicie sesión para acceder.');let user;try{user=await sb('/auth/v1/user',{token,publicKey:true});}catch(e){if(e.status===401)throw new PublicError(401,'La sesión terminó. Inicie sesión de nuevo.');throw e;}
 if(!user?.id)throw new PublicError(401,'Inicie sesión de nuevo.');
 const uid=encodeURIComponent(user.id);
 const admins=await sb('/rest/v1/platform_admins?user_id=eq.'+uid+'&active=eq.true&select=user_id');
 if(admins?.length)return {user,admin:true,asada:null,role:'Star Water'};
 const rows=await sb('/rest/v1/memberships?user_id=eq.'+uid+'&active=eq.true&select=user_id,role,asada_id,asadas(id,name,active)');const membership=rows?.[0];
 if(!membership?.asadas?.active)throw new PublicError(403,'Su acceso no está activo. Consulte a Star Water.');
 return {user,admin:false,asada:membership.asadas,role:membership.role};
}
async function body(request){if(Number(request.headers.get('content-length'))>maxBody)throw new PublicError(413,'La solicitud es demasiado extensa.');const text=await request.text();if(text.length>maxBody)throw new PublicError(413,'La solicitud es demasiado extensa.');try{return JSON.parse(text);}catch{throw new PublicError(400,'La información enviada no es válida.');}}
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const text=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
async function owner(request){const who=await authorized(sessionToken(request));if(!who.admin)throw new PublicError(403,'Esta acción corresponde a Star Water.');return who;}
export default async function handler(request){
 const url=new URL(request.url);const api=url.searchParams.get('api');
 try{
  if(request.method!=='GET'&&request.method!=='POST')return json({error:'Método no permitido.'},405);
  if(request.method==='POST'&&request.headers.get('origin')!==url.origin)throw new PublicError(403,'Origen de la solicitud no autorizado.');
  if(api){
   if(api==='logout'&&request.method==='POST')return json({ok:true},200,{'Set-Cookie':cookieName+'=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'});
   if(api==='login'&&request.method==='POST'){
    const input=await body(request);const email=text(input.email,254).toLowerCase(),password=input.password;
    if(!email||typeof password!=='string'||password.length<1||password.length>256)throw new PublicError(400,'Ingrese su correo y contraseña.');
    const session=await sb('/auth/v1/token?grant_type=password',{method:'POST',publicKey:true,body:{email,password}});
    const who=await authorized(session?.access_token);
    return json({ok:true,admin:who.admin},200,{'Set-Cookie':cookieName+'='+session.access_token+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+Math.min(Number(session.expires_in)||3600,3600)});
   }
   if(api==='me'&&request.method==='GET'){const who=await authorized(sessionToken(request));return json({email:who.user.email,admin:who.admin,asada:who.asada,role:who.role});}
   if(api==='password'&&request.method==='POST'){
    const token=sessionToken(request);await authorized(token);const input=await body(request);if(typeof input.password!=='string'||input.password.length<12||input.password.length>128)throw new PublicError(400,'Use una contraseña de 12 a 128 caracteres.');
    await sb('/auth/v1/user',{method:'PUT',publicKey:true,token,body:{password:input.password}});return json({ok:true});
   }
   if(api==='admin-list'&&request.method==='GET'){await owner(request);const [asadas,members]=await Promise.all([sb('/rest/v1/asadas?select=id,name,active&order=name.asc'),sb('/rest/v1/memberships?select=user_id,asada_id,email,role,active&order=email.asc')]);return json({asadas,members});}
   if(api==='admin-asada'&&request.method==='POST'){
    await owner(request);const input=await body(request);const name=text(input.name,160);if(!name)throw new PublicError(400,'Ingrese el nombre de la ASADA.');
    const created=await sb('/rest/v1/asadas',{method:'POST',body:{name},prefer:'return=representation'});return json({asada:created?.[0]},201);
   }
   if(api==='admin-toggle'&&request.method==='POST'){
    await owner(request);const input=await body(request);if(!uuid(input.id)||typeof input.active!=='boolean'||!['asada','member'].includes(input.kind))throw new PublicError(400,'Seleccione un acceso válido.');
    const table=input.kind==='asada'?'asadas':'memberships',key=input.kind==='asada'?'id':'user_id';await sb('/rest/v1/'+table+'?'+key+'=eq.'+encodeURIComponent(input.id),{method:'PATCH',body:{active:input.active}});return json({ok:true});
   }
   if(api==='admin-reset'&&request.method==='POST'){
    await owner(request);const input=await body(request);if(!uuid(input.user)||typeof input.password!=='string'||input.password.length<12||input.password.length>128)throw new PublicError(400,'Seleccione una cuenta y una contraseña de al menos 12 caracteres.');
    const member=await sb('/rest/v1/memberships?user_id=eq.'+encodeURIComponent(input.user)+'&select=user_id');if(!member?.length)throw new PublicError(400,'Esta cuenta no corresponde a una ASADA.');
    await sb('/auth/v1/admin/users/'+input.user,{method:'PUT',body:{password:input.password}});return json({ok:true});
   }
   if(api==='admin-user'&&request.method==='POST'){
    await owner(request);const input=await body(request);const email=text(input.email,254).toLowerCase();const roles=['Administración','Junta Directiva','Operación'];
    if(!uuid(input.asada)||!/^\S+@\S+\.\S+$/.test(email)||!roles.includes(input.role)||typeof input.password!=='string'||input.password.length<12||input.password.length>128)throw new PublicError(400,'Revise la ASADA, el correo, la función y la contraseña de al menos 12 caracteres.');
    const exists=await sb('/rest/v1/asadas?id=eq.'+encodeURIComponent(input.asada)+'&select=id');if(!exists?.length)throw new PublicError(400,'La ASADA seleccionada no existe.');
    const user=await sb('/auth/v1/admin/users',{method:'POST',body:{email,password:input.password,email_confirm:true}});const id=user?.id||user?.user?.id;if(!uuid(id))throw new PublicError(502,'No fue posible crear la cuenta.');
    try{await sb('/rest/v1/memberships',{method:'POST',body:{user_id:id,asada_id:input.asada,email,role:input.role}});}catch(error){try{await sb('/auth/v1/admin/users/'+id,{method:'DELETE'});}catch{throw new PublicError(502,'La cuenta quedó pendiente de vincular. Revísela en el servicio de cuentas antes de reintentar.');}throw error;}
    return json({ok:true},201);
   }
   throw new PublicError(404,'Operación no disponible.');
  }
  const file=url.searchParams.get('file');if(!protectedFiles.has(file))throw new PublicError(404,'Página no disponible.');
  try{await authorized(sessionToken(request));}catch(e){if(e.status===401&&file.endsWith('.html'))return new Response(null,{status:303,headers:{...headers,Location:'/acceso.html?return='+encodeURIComponent('/'+file)}});throw e;}
  const bytes=await readFile(path.join(root,file));return new Response(bytes,{headers:{...headers,'Content-Type':mime[path.extname(file)]||'application/octet-stream'}});
 }catch(error){return json({error:error instanceof PublicError?error.message:'No fue posible completar la operación. Intente de nuevo.'},error instanceof PublicError?error.status:500);}
}
export {protectedFiles};
