import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../netlify/functions/gateway.mjs';
const originalFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=originalFetch;});
process.env.SUPABASE_URL='https://example.supabase.co';process.env.SUPABASE_ANON_KEY='sb_publishable_test';process.env.SUPABASE_SERVICE_ROLE_KEY='sb_secret_test';
const memberID='11111111-1111-4111-8111-111111111111';
const cookie='__Host-asada-session=test-token';
const req=(route,body,cookieValue=cookie)=>new Request('https://example.netlify.app/.netlify/functions/gateway?'+route,{method:body===undefined?'GET':'POST',headers:{cookie:cookieValue,origin:'https://example.netlify.app','content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
function mock({admin=false,active=true,foreign=false,role='Administración'}={}){globalThis.fetch=async(url,options)=>{
 const u=new URL(url);assert.equal(u.origin,'https://example.supabase.co');
 if(u.pathname.startsWith('/rest/')){assert.equal(options.headers.apikey,'sb_secret_test');assert.equal(options.headers.Authorization,undefined);}
 if(u.pathname==='/auth/v1/user'){assert.equal(options.headers.apikey,'sb_publishable_test');assert.equal(options.headers.Authorization,'Bearer test-token');}
 if(u.pathname==='/auth/v1/token'){assert.equal(options.headers.apikey,'sb_publishable_test');assert.equal(options.headers.Authorization,undefined);}
 if(u.pathname==='/auth/v1/user')return Response.json({id:memberID,email:'user@example.test'});
 if(u.pathname==='/auth/v1/token')return Response.json({access_token:'test-token',expires_in:3600});
 if(u.pathname==='/rest/v1/platform_admins')return Response.json(admin?[{user_id:memberID}]:[]);
 if(u.pathname==='/rest/v1/memberships'){assert(u.searchParams.get('user_id')==='eq.'+memberID);return Response.json(foreign?[]:[{user_id:memberID,role,asada_id:'asada-a',asadas:{id:'asada-a',name:'ASADA A',active}}]);}
 throw new Error('Unexpected endpoint '+u.pathname);
};}
test('la página privada redirige sin sesión; scripts y PDF no se entregan',async()=>{for(const file of ['diagnostic.js','diagnostic-model.js','diagnostic-pdf.js','assets/jspdf.umd.min.js','assets/diagnostic-fonts.js','nuestra-asada.html','nuestra-asada.js','asada-profile-model.js','bodega.html','bodega.js','warehouse-model.js','warehouse-excel.js','assets/warehouse-template.xlsx','operacion.html','operacion.js','operation-excel.js','assets/operation-template.xlsx','equipo.html','equipo.js','herramientas.html','panel-gestion.html','panel-gestion.js','finanzas.js','assets/normativa/asadas.pdf']){const r=await handler(req('file='+file,undefined,''));assert.equal(r.status,file.endsWith('.html')?303:401);assert.equal(r.headers.get('cache-control'),'no-store, private');}});
test('una ASADA suspendida no puede abrir herramientas ni archivos',async()=>{mock({active:false});for(const file of ['herramientas.html','finanzas.js'])assert.equal((await handler(req('file='+file))).status,403);});
test('una persona ajena no hereda la membresía de otra ASADA',async()=>{mock({foreign:true});assert.equal((await handler(req('api=me'))).status,403);});
test('un miembro accede solo a su identidad y ASADA',async()=>{mock();const r=await handler(req('api=me'));assert.equal(r.status,200);const d=await r.json();assert.equal(d.asada.name,'ASADA A');assert.equal(d.admin,false);});
test('miembros no pueden listar ni modificar permisos administrativos',async()=>{mock();assert.equal((await handler(req('api=admin-list'))).status,403);assert.equal((await handler(req('api=admin-toggle',{kind:'asada',id:memberID,active:false}))).status,403);});
test('sesión autorizada sirve las herramientas desde el directorio privado',async()=>{mock();const r=await handler(req('file=herramientas.html'));assert.equal(r.status,200);assert((await r.text()).includes('Herramientas para su ASADA'));});
test('inicio usa cookie HttpOnly y no expone tokens al navegador',async()=>{mock();const r=await handler(req('api=login',{email:'user@example.test',password:'a long test password'}));assert.equal(r.status,200);const set=r.headers.get('set-cookie');assert(set.includes('HttpOnly')&&set.includes('Secure')&&set.includes('SameSite=Lax'));assert.equal((await r.json()).access_token,undefined);});
test('solicitud desde otro sitio no inicia ni cambia sesión',async()=>{const request=new Request('https://example.netlify.app/.netlify/functions/gateway?api=login',{method:'POST',headers:{origin:'https://attacker.test'},body:'{}'});assert.equal((await handler(request)).status,403);});
test('rutas arbitrarias y recorridos de directorio no entregan archivos',async()=>{for(const f of ['../public/index.html','../../etc/passwd','assets/../../.env'])assert.equal((await handler(req('file='+encodeURIComponent(f)))).status,404);});
test('sin configuración falla cerrado; nunca entrega herramientas',async()=>{const previous=process.env.SUPABASE_URL;delete process.env.SUPABASE_URL;try{assert.equal((await handler(req('file=herramientas.html'))).status,503);}finally{process.env.SUPABASE_URL=previous;}});
test('build no publica archivos protegidos ni secretos',()=>{assert(!fs.existsSync('build/herramientas.html'));assert(!fs.existsSync('build/equipo.html'));assert(!fs.existsSync('build/equipo.js'));assert(!fs.existsSync('build/evaluation-model.js'));assert(!fs.existsSync('build/operacion.html'));assert(!fs.existsSync('build/operacion.js'));assert(!fs.existsSync('build/assets/operation-template.xlsx'));assert(!fs.existsSync('build/assets/normativa'));assert(!fs.existsSync('build/netlify/functions'));assert(fs.existsSync('build/acceso.html'));});

test('Netlify conserva la ruta original al reescribir: API y archivos privados',async()=>{
 mock();
 const request=(pathname,body)=>new Request('https://example.netlify.app'+pathname,{method:body===undefined?'GET':'POST',headers:{cookie,origin:'https://example.netlify.app','content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 assert.equal((await handler(request('/api/me'))).status,200);
 assert.equal((await handler(request('/api/login',{email:'user@example.test',password:'a long test password'}))).status,200);
 assert.equal((await handler(request('/herramientas.html'))).status,200);
 assert.equal((await handler(new Request('https://example.netlify.app/finanzas.js'))).status,401);
 assert.equal((await handler(new Request('https://example.netlify.app/herramientas.html'))).status,303);
});

test('solo administración y propietario reciben el módulo laboral privado',async()=>{for(const role of ['Junta Directiva','Operación']){mock({role});for(const file of ['equipo.html','equipo.js','evaluation-model.js'])assert.equal((await handler(req('file='+file))).status,403);}for(const options of [{role:'Administración'},{admin:true}]){mock(options);for(const file of ['equipo.html','equipo.js','evaluation-model.js'])assert.equal((await handler(req('file='+file))).status,200);}});

test('adjuntos preparan y verifican el archivo privado antes de subir, incluso si ya fue creado',async()=>{
 const asada='22222222-2222-4222-8222-222222222222',worker='33333333-3333-4333-8333-333333333333';
 for(const publicBucket of [false,true]){
 let checks=0,uploaded=false;
 globalThis.fetch=async(url,o)=>{const u=new URL(url);
 if(u.pathname==='/auth/v1/user')return Response.json({id:memberID});
 if(u.pathname==='/rest/v1/platform_admins')return Response.json([{user_id:memberID}]);
 if(u.pathname==='/rest/v1/asadas')return Response.json([{id:asada,name:'Prueba'}]);
 if(u.pathname==='/rest/v1/team_records')return Response.json(o.method==='POST'?[{id:worker}]:[{id:worker,kind:'employee'}]);
 assert.equal(o.headers.apikey,'sb_secret_test');assert.equal(o.headers.Authorization,undefined);
 if(u.pathname==='/storage/v1/bucket/asada-team-private'){checks++;return checks===1?Response.json({error:'Not found'},{status:400}):Response.json({public:publicBucket});}
 if(u.pathname==='/storage/v1/bucket'){assert.equal(JSON.parse(o.body).public,false);return Response.json({error:'Already exists'},{status:409});}
 if(u.pathname.startsWith('/storage/v1/object/')){uploaded=true;return Response.json({ok:true});}
 throw Error('Unexpected endpoint');
 };
 const request=new Request('https://example.netlify.app/api/team-upload?'+new URLSearchParams({asada,worker,name:'Contrato',category:'Contrato',date:'2026-10-03'}),{method:'POST',headers:{cookie,origin:'https://example.netlify.app','content-type':'application/pdf'},body:'%PDF-test'});
 assert.equal((await handler(request)).status,publicBucket?503:201);assert.equal(uploaded,!publicBucket);assert.equal(checks,2);
 }
});

test('los tres roles acceden a la bitácora privada y la plantilla Excel requiere sesión',async()=>{for(const role of ['Administración','Operación','Junta Directiva']){mock({role});for(const file of ['operacion.html','operacion.js','operation-excel.js','assets/operation-template.xlsx'])assert.equal((await handler(req('file='+file))).status,200);}assert.equal((await handler(req('file=assets/operation-template.xlsx',undefined,''))).status,401);});
