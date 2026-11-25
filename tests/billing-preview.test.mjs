import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRate,previewBills,previewCsv} from '../private/facturacion-model.js';
import {allowedTools,canOpenTool} from '../public/tools-catalog.js';

const period='2026-11';
const rate=buildRate({fixed:'2',tiers:[{limit:'10',price:'100'},{limit:'20',price:'150'}],overflow:'200'});
const header='abonado;lectura_anterior;lectura_actual\r\n';
const preview=lines=>previewBills({period,readings:header+lines,rate});

test('liquida tramos progresivos y conserva números de abonado y consumo cero',()=>{
 const report=preview('001;10;35\r\n002;0;0\r\n003;0;10\r\n004;0;20');
 assert.deepEqual(report.issues,[]);
 assert.deepEqual(report.bills.map(r=>[r.subscriber,r.consumption,r.variableCents]),[
  ['001',25,350000],['002',0,0],['003',10,100000],['004',20,250000],
 ]);
 assert.equal(report.totalCents,700800);
 assert.match(previewCsv(report),/"BORRADOR";"2026-11";"001"/);
});

test('acepta decimales con coma y redondea el consumo una vez por recibo',()=>{
 const report=previewBills({
  period,readings:header+'A;1,000;1,125\nB;0;0,225',
  rate:buildRate({fixed:'0,10',tiers:[],overflow:'0,20'}),
 });
 assert.deepEqual(report.bills.map(r=>r.totalCents),[13,15]);
});

test('señala duplicados y lecturas descendentes y bloquea salidas parciales',()=>{
 const report=preview('X;1;5\nx;1;5\nZ;2;1\nOK;0;0');
 assert.deepEqual(report.issues.map(r=>r.line),[2,3,4]);
 assert.equal(report.bills.length,1);
 assert.throws(()=>previewCsv(report),/Corrija todas/);
 assert.throws(()=>preview(''),/Agregue al menos/);
 assert.throws(()=>previewBills({period:'2026-13',readings:header,rate}),/Seleccione un mes/);
 assert.throws(()=>buildRate({fixed:'0',overflow:'1',tiers:[{limit:10,price:1},{limit:9,price:1}]}),/límites deben aumentar/);
});

test('la tarjeta es visible internamente y solo se abre con el permiso de facturación',()=>{
 const find=who=>allowedTools(who).find(t=>t.id==='facturacion');
 for(const who of [{role:'Administración'},{role:'Junta Directiva'},{role:'Operación'},{admin:true}]){
  const tool=find(who);
  assert.equal(tool.status,'En construcción');
  assert.equal(canOpenTool(tool,who),false);
 }
 const owner={admin:true,billingAccess:true};
 assert.equal(canOpenTool(find(owner),owner),true);
 assert.equal(find({external:true,modules:['abonados']}),undefined);
});

test('el servidor recalcula el lote, respeta su versión y conserva el límite de cada ASADA',async()=>{
 const {billingAPI,billingOwnerId}=await import('../netlify/lib/billing.mjs');
 class PublicError extends Error { constructor(status,message){super(message);this.status=status;} }
 const tenant='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const base={asada:tenant,period,readings:header+'001;10;12',defaultCategory:'residencial',profileIds:['r1'],due:'2026-12-15'};
 const who={admin:true,user:{id:billingOwnerId}};
 let saved;
 let tariffId='r1';
 const db=async(path,options)=>{
  if(path.startsWith('/rest/v1/asadas?'))return path.includes('id=eq.'+tenant+'&')?[{id:tenant}]:[];
  if(path.endsWith('/rpc/billing_tariffs_for_month'))return [{id:tariffId,profile:{category:'residencial',rate:{fixed:'1000',tiers:[],overflow:'100'}}}];
  if(path.startsWith('/rest/v1/billing_batches?')&&!options){
   assert(path.includes('asada_id=eq.'+tenant));
   return saved?[saved]:[];
  }
  if(path.startsWith('/rest/v1/billing_batches')&&options){
   saved={id:'batch',status:'draft',version:1,...saved,...options.body};
   return [saved];
  }
  throw Error(path);
 };
 const call=(api,input,profile=who)=>billingAPI(api,new Request('https://example.test/api/'+api,{
  method:'POST',body:JSON.stringify(input),
 }),{who:profile,sb:db,body:r=>r.json(),uuid:()=>true,json:data=>data,PublicError});
 await assert.rejects(call('billing-save',{...base,asada:'otra'}),e=>e.status===403);
 await assert.rejects(call('billing-save',base,{...who,external:true}),e=>e.status===403);
 await call('billing-save',{...base,report:[{totalCents:1}]});
 assert.equal(saved.report[0].totalCents,120000);
 await assert.rejects(call('billing-save',base),e=>e.status===409);
 await assert.rejects(call('billing-approve',{...base,version:2}),e=>e.status===409);
 tariffId='r2';
 await assert.rejects(call('billing-approve',{...base,version:1}),e=>e.status===409);
 tariffId='r1';
 await call('billing-approve',{...base,version:1});
 assert.equal(saved.status,'approved');
 assert.equal(saved.version,2);
 assert.deepEqual(await call('billing-approve',{...base,version:1}),{ok:true});
 await assert.rejects(call('billing-save',{...base,version:2}),e=>e.status===409);
});

test('separa cargos por categoría y reproduce el total de referencia de 25 m³',()=>{
 const profiles=[
  {category:'residencial',rate:{fixed:'2800',hydrants:'650',tiers:[{limit:15,price:245},{limit:30,price:283},{limit:60,price:331}],overflow:'368',
   resource:{tiers:[{limit:15,price:40},{limit:30,price:43},{limit:60,price:48}],overflow:'54'}}},
  {category:'comercio',rate:{fixed:'1000',tiers:[],overflow:'100'}},
 ];
 const report=previewBills({period,readings:`abonado;lectura_anterior;lectura_actual;categoria
A;640;665;Residencial
B;0;25;Comercio y servicios
C;0;2;Industrial`,profiles});
 assert.deepEqual(report.bills.map(r=>[r.variableCents,r.resourceCents,r.hydrantsCents,r.totalCents]),[
  [650500,103000,65000,1098500],[250000,0,0,350000],
 ]);
 assert.match(report.issues[0].reason,/industrial/);
});
