import {getStore} from '@netlify/blobs';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import files from '../../server/files.json' with {type:'json'};
import {createAuth,AccessError,cookie,tokenFrom} from '../../server/auth.mjs';
const security={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY'};
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{...security,'Content-Type':'application/json; charset=utf-8',...headers}});
const redirect=to=>new Response(null,{status:303,headers:{...security,Location:to}});
export async function handle(request,context={},deps={}){
 const url=new URL(request.url),api=url.searchParams.get('api')||(url.pathname.startsWith('/api/')?url.pathname.slice(5):''),file=url.searchParams.get('file')||url.pathname.slice(1);
 try{
  const store=deps.store||getStore({name:'asadas-private-access',consistency:'strong'});
  const auth=createAuth(store,{setupSecret:deps.setupSecret??process.env.ADMIN_SETUP_SECRET??'',now:deps.now});
  const token=tokenFrom(request),ip=context.ip||'unknown';
  if(api){
   const post=request.method==='POST';
   if(!['GET','POST'].includes(request.method))throw new AccessError(405,'Método no permitido.');
   if(post&&request.headers.get('origin')!==url.origin)throw new AccessError(403,'La solicitud debe realizarse desde esta plataforma.');
   let data={};if(post){if(Number(request.headers.get('content-length')||0)>16384)throw new AccessError(413,'La solicitud es demasiado grande.');const body=await request.text();if(body.length>16384)throw new AccessError(413,'La solicitud es demasiado grande.');try{data=JSON.parse(body);}catch{throw new AccessError(400,'Los datos no tienen un formato válido.');}if(!data||typeof data!=='object'||Array.isArray(data))throw new AccessError(400,'Revise los datos ingresados.');}
   if(!post&&api==='status')return json(await auth.status());
   if(!post&&api==='me')return json(await auth.me(token));
   if(!post&&api==='admin')return json(await auth.dashboard(token));
   if(!post)throw new AccessError(404,'No encontramos esa función.');
   const calls={setup:()=>auth.setup(data,ip),login:()=>auth.login(data,ip),password:()=>auth.password(token,data),'admin/asadas':()=>auth.addAsada(token,data),'admin/users':()=>auth.addUser(token,data),'admin/asada-access':()=>auth.accessAsada(token,data),'admin/user-access':()=>auth.accessUser(token,data),'admin/reset-password':()=>auth.resetPassword(token,data)};
   if(api==='logout'){await auth.logout(token);return json({ok:true},200,{'Set-Cookie':cookie('',true)});}
   if(!calls[api])throw new AccessError(404,'No encontramos esa función.');const result=await calls[api]();if(result.token){const {token:sessionToken,...safe}=result;return json(safe,200,{'Set-Cookie':cookie(sessionToken)});}return json({ok:true,result});
  }
  if(!files[file])throw new AccessError(404,'No encontramos esa página.');
  if(!['GET','HEAD'].includes(request.method))throw new AccessError(405,'Método no permitido.');
  try{await auth.session(token);}catch(e){if(e instanceof AccessError&&file.endsWith('.html'))return redirect(e.status===428?'/cuenta.html':'/acceso.html');throw e;}
  const bytes=await readFile(resolve(process.cwd(),'protected',files[file]));const type=file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'application/pdf';
  return new Response(request.method==='HEAD'?null:bytes,{headers:{...security,'Content-Type':type}});
 }catch(e){if(e instanceof AccessError)return json({error:e.message},e.status);console.error('Portal: servicio no disponible',e.name);return json({error:'No pudimos conectar con el servicio de acceso. Intente nuevamente; si continúa, contacte a Star Water.'},503);}
}
export default handle;
