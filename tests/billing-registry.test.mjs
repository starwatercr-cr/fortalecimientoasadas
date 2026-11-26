import test from 'node:test';
import assert from 'node:assert/strict';
import {registryMapping,normalizeService,reviewRegistry,readingPlan} from '../private/billing-registry-model.js';
import {billingAPI,billingOwnerId} from '../netlify/lib/billing.mjs';

const tenant='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const service={code:'001',identity:'001234567',name:'Persona Ejemplo',meter:'0005',category:'residencial',status:'activo',initialPeriod:'2026-12',initialReading:'100,5'};
const headers=['Número de paja','Cédula','Nombre completo','Medidor','Tarifa','Estado','Primer mes','Lectura anterior'];
test('mapeo del padrón conserva identificadores, permite varias pajas y detecta conflictos',()=>{
 const mapping=registryMapping(headers);
 const rows=[['001','001234567','Persona Ejemplo','0005','Residencial','Activo','2026-12','100,5'],['002','001234567','Persona Ejemplo','0006','Residencial','Activo','','']];
 const review=reviewRegistry(rows,mapping);
 assert.equal(review.issues.length,0);
 assert.equal(review.entries[0].entry.identity,'001234567');
 assert.equal(review.entries[0].entry.code,'001');
 assert.equal(review.entries[0].entry.initialReading,'100.5');
 const existing=[{code:'001',payload:review.entries[0].entry}];
 assert.equal(reviewRegistry(rows,mapping,existing).entries[0].action,'Ya registrado');
 assert.equal(reviewRegistry([...rows,rows[0]],mapping).issues.length,1);
 assert.match(reviewRegistry([['001','001234567','Otro','0005','Residencial','Activo','','']],mapping,existing).issues[0].reason,/ya existe/);
 assert.throws(()=>normalizeService({...service,initialPeriod:''}),/juntos/);
});
test('plan mensual usa lectura inicial confirmada o el mes anterior aprobado y excluye servicios futuros e inactivos',()=>{
 const p=normalizeService(service),records=[{payload:p},{payload:{...p,code:'002',initialPeriod:'',initialReading:''}},{payload:{...p,code:'003',status:'suspendido'}},{payload:{...p,code:'004',initialPeriod:'2027-01'}}];
 assert.deepEqual(readingPlan(records,[{subscriber:'002',current:27}], '2026-12').map(r=>[r.subscriber,r.previous]),[['001','100.5'],['002','27']]);
 assert.deepEqual(readingPlan(records,[], '2026-11').map(r=>[r.subscriber,r.previous]),[['002','']]);
});
test('registro e importación requieren propietario, ASADA válida y conservan pajas existentes',async()=>{
 class PublicError extends Error{constructor(status,message){super(message);this.status=status;}}
 const who={admin:true,user:{id:billingOwnerId}},records=[];
 const sb=async(path,options)=>{
  if(path.startsWith('/rest/v1/asadas?'))return path.includes(tenant)?[{id:tenant,name:'ASADA'}]:[];
  if(path.startsWith('/rest/v1/billing_services?'))return records;
  if(path==='/rest/v1/billing_services'){
   for(const obj of Array.isArray(options.body)?options.body:[options.body])records.push({...obj,id:'id-'+obj.code,version:1});
   return records;
  }
  throw Error(path);
 };
 const call=(api,input,profile=who)=>billingAPI(api,new Request('https://example.test/api/'+api,{method:'POST',body:JSON.stringify({asada:tenant,...input})}),{who:profile,sb,body:r=>r.json(),uuid:()=>true,json:r=>r,PublicError});
 await assert.rejects(call('billing-registry-save',{service},{admin:true,user:{id:'other'}}),e=>e.status===403);
 await call('billing-registry-save',{service});
 assert.equal(records[0].code,'001');
 assert.deepEqual(await call('billing-registry-import',{confirm:true,services:[service,{...service,code:'002',meter:'0006'}]}),{added:1,existing:1});
 assert.deepEqual(await call('billing-registry-import',{confirm:true,services:[service]}),{added:0,existing:1});
 await assert.rejects(call('billing-registry-import',{confirm:true,services:[{...service,name:'Otro'}]}),e=>e.status===409);
 assert.equal(records.length,2);
});
