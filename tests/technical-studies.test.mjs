import test from 'node:test';
import assert from 'node:assert/strict';
import {technicalStudies,validateQuote} from '../netlify/lib/technical-studies.mjs';
import {allowedTools} from '../public/tools-catalog.js';
const A='aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',B='bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',D='dddddddd-dddd-4ddd-addd-dddddddddddd',P='eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee';
class PublicError extends Error{constructor(status,message){super(message);this.status=status;}}
const uuid=v=>typeof v==='string'&&/^[0-9a-f-]{36}$/.test(v);
const json=(data,status=200)=>new Response(JSON.stringify(data),{status});
const auth=role=>({user:{id:A},admin:role==='Star Water',role,asada:{id:A,name:'ASADA de prueba'}});
const request=(api,data)=>new Request('https://solucionesstarwater.com/api/'+api,{method:data===undefined?'GET':'POST',body:data===undefined?undefined:JSON.stringify(data)});
const base={asadaName:'ASADA Ejemplo',contact:'Contacto de prueba',email:'ejemplo@example.test',location:'Costa Rica',purpose:'Planificación de inversiones',accept:true,users:100,conductionKm:2.5,distributionKm:4,tanks:2,sources:1,hydrants:0,microPercent:100,macroCount:1,aforos:'Sí',analysis:'No',micro:'Sí',macro:'Sí',attachment:Buffer.from('%PDF-ejemplo').toString('base64'),attachmentType:'application/pdf'};
const fail=m=>{throw Error(m);};
const deps=(who,sb)=>({sb,authorized:async()=>who,sessionToken:()=>'',body:r=>r.json(),uuid,json,PublicError,profileStorage:async()=>({url:'https://example.test/archivo'})});
test('study tool is present in all internal ASADA profiles but not external restricted profiles',()=>{
 for(const role of ['Administración','Junta Directiva','Operación'])assert(allowedTools(auth(role)).some(t=>t.id==='study'));
 assert(!allowedTools({...auth('Operación'),external:true,modules:['agua']}).some(t=>t.id==='study'));
});
test('quotation validates all required fields and rejects malformed attachments and counts',()=>{
 const d=validateQuote(base,fail);assert.equal(d.details.conductionKm,2.5);assert.equal(d.details.hydrants,0);assert.equal(d.attachment_name,'Datos-ASADA.pdf');
 for(const change of [{attachment:''},{attachment:Buffer.from('wrong').toString('base64')},{users:-1},{microPercent:110},{accept:false},{purpose:''},{website:'spam'}])assert.throws(()=>validateQuote({...base,...change},fail));
});
test('ASADA users cannot create or list invitations and cannot view another ASADA',async()=>{
 const noDB=()=>{throw Error('must not use DB');},d=deps(auth('Administración'),noDB);
 await assert.rejects(technicalStudies('study-quote-new',request('study-quote-new',{label:'Test'}),d),e=>e.status===403);
 await assert.rejects(technicalStudies('study-data',request('study-data?asada='+B),d),e=>e.status===403);
});
test('link uses the same document ID and same-tenant project with optimistic locking',async()=>{
 const calls=[];const sb=async(route,opts)=>{calls.push({route,opts});if(route.startsWith('/rest/v1/asada_documents'))return [{id:D,filename:'Estudio.pdf',type:'application/pdf'}];if(opts?.method==='PATCH')return [{id:P}];return [{id:P,payload:{title:'Tanque',documents:[]},version:4}];};
 const r=await technicalStudies('study-link',request('study-link',{asada:A,document:D,project:P,link:true}),deps(auth('Junta Directiva'),sb));assert.equal(r.status,200);
 assert(calls.every(x=>x.route.includes('asada_id=eq.'+A)));
 assert(calls[2].route.includes('version=eq.4'));assert.deepEqual(calls[2].opts.body.payload.documents,[{id:D,name:'Estudio.pdf',type:'application/pdf',category:'Estudio técnico'}]);
 await assert.rejects(technicalStudies('study-link',request('study-link',{asada:A,document:D,project:P,link:true}),deps(auth('Operación'),()=>{throw Error('must not write');})),e=>e.status===403);
});
test('only an admin issues a random single-use quote link; public submit stores attachment once',async()=>{
 let record;const calls=[];const sb=async(route,opts)=>{calls.push({route,opts});if(opts?.method==='POST'){record={...opts.body,id:D};return [record];}if(opts?.method==='PATCH'){if(record.submitted_at)return [];Object.assign(record,opts.body);return [{id:D}];}return record&&!record.submitted_at?[{id:D}]:[];};
 const r=await technicalStudies('study-quote-new',request('study-quote-new',{label:'ASADA de prueba'}),deps(auth('Star Water'),sb));
 const data=await r.json(),token=new URL(data.url).hash.slice(1);assert.equal(token.length,43);assert.equal(record.token_hash.length,64);assert.notEqual(token,record.token_hash);assert(!JSON.stringify(record).includes(token));
 const publicDeps={...deps(null,sb),authorized:()=>{throw Error('no session needed');}};
 const submit=()=>technicalStudies('study-quote-submit',request('study-quote-submit',{...base,token}),publicDeps);
 assert.equal((await submit()).status,201);assert(record.submitted_at);assert.equal(record.details.users,100);
 await assert.rejects(submit(),e=>e.status===410);
 assert(calls.filter(x=>x.opts?.method==='PATCH').every(x=>x.route.includes('submitted_at=is.null')&&x.route.includes('expires_at=gt.')));
});
