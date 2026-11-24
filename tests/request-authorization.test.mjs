import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/gateway.mjs';
const original=globalThis.fetch;
afterEach(()=>{globalThis.fetch=original;});
process.env.SUPABASE_URL='https://example.supabase.co';
process.env.SUPABASE_ANON_KEY='sb_publishable_test';
process.env.SUPABASE_SERVICE_ROLE_KEY='sb_secret_test';
const user='11111111-1111-4111-8111-111111111111';
const asada='22222222-2222-4222-8222-222222222222';
test('access-list verifica identidad una vez por solicitud y vuelve a validar una suspensión',async()=>{
 let active=true,checks=0;
 globalThis.fetch=async(url)=>{
  const u=new URL(url);
  if(u.pathname==='/auth/v1/user'){checks++;return Response.json({id:user});}
  if(u.pathname==='/rest/v1/platform_admins')return Response.json([]);
  if(u.pathname==='/rest/v1/memberships'){
   if(u.searchParams.has('user_id'))return Response.json([{user_id:user,role:'Administración',asada_id:asada,asadas:{id:asada,name:'Prueba',active,access_kind:'standard'}}]);
   return Response.json([]);
  }
  throw Error('Unexpected endpoint '+u.pathname);
 };
 const request=()=>new Request('https://example.netlify.app/api/access-list',{headers:{cookie:'__Host-asada-session=test-token'}});
 assert.equal((await handler(request())).status,200);
 assert.equal(checks,1);
 active=false;
 assert.equal((await handler(request())).status,403);
 assert.equal(checks,2);
});
