import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountingAPI} from '../netlify/lib/cras.mjs';
import {catalog} from '../netlify/lib/cras-catalog.mjs';

const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const U='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const E='dddddddd-dddd-4ddd-8ddd-dddddddddddd';
class PublicError extends Error{constructor(status,message){super(message);this.status=status;}}
function accountant(modules=['cras']){
 const calls=[];
 const deps={sb:async(path,options={})=>{calls.push({path,options});if(path.includes('/rpc/cras_post'))return 7;return [];},authorized:async()=>({admin:false,external:true,modules,asada:{id:A,name:'ASADA A'},user:{id:U}}),sessionToken:()=>'',body:r=>r.json(),uuid:s=>/^[0-9a-f-]{36}$/.test(s||''),json:(data,status=200)=>Response.json(data,{status}),PublicError};
 const call=(api,data,method='POST')=>accountingAPI(api,new Request('https://test/api/'+api,{method,...(data?{headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{})}),deps);
 return {call,calls};
}

test('contador autorizado registra y revierte asientos de su ASADA, sin cerrar meses',async()=>{
 const a=accountant();
 const config=await (await a.call('cras-config',null,'GET')).json();
 assert.equal(config.canWrite,true);assert.equal(config.canClose,false);
 assert.deepEqual(config.asadas.map(x=>x.id),[A]);
 const [debit,credit]=catalog.filter(x=>!x.review&&x.services.includes('AC'));
 const base={asada:B,id:E,date:'2026-11-20',kind:'diario',reference:'FAC-12',memo:'Ingreso del período',lines:[
  {account:debit.code,service:'AC',debit:'1000',credit:'0'},
  {account:credit.code,service:'AC',debit:'0',credit:'1000'}
 ]};
 const entry=await a.call('cras-post',base);
 assert.equal(entry.status,201);
 const initial=a.calls.find(x=>x.path.includes('/rpc/cras_post'));
 assert.equal(initial.options.body.p_asada,A);
 assert.equal(initial.options.body.p_lines.length,2);
 const reversal=await a.call('cras-post',{...base,id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',reverses:E});
 assert.equal(reversal.status,201);
 const posted=a.calls.filter(x=>x.path.includes('/rpc/cras_post')).at(-1);
 assert.equal(posted.options.body.p_asada,A);
 assert.equal(posted.options.body.p_kind,'reversion');
 assert.equal(posted.options.body.p_reverses,E);
 await assert.rejects(a.call('cras-close',{asada:A,month:'2026-10-01'}),e=>e.status===403);
});

test('cuenta externa sin módulo contable no lee ni registra',async()=>{
 const a=accountant(['calidad']);
 await assert.rejects(a.call('cras-config',null,'GET'),e=>e.status===403);
 await assert.rejects(a.call('cras-post',{asada:A}),e=>e.status===403);
 assert.equal(a.calls.length,0);
});
