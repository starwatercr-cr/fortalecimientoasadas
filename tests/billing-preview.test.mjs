import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRate,previewBills,previewCsv} from '../private/facturacion-model.js';
import {allowedTools} from '../public/tools-catalog.js';

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

test('la facturación aparece únicamente para la administración y Star Water',()=>{
 const has=who=>allowedTools(who).some(t=>t.id==='facturacion');
 assert(has({role:'Administración'}));
 assert(has({admin:true}));
 assert(!has({role:'Junta Directiva'}));
 assert(!has({role:'Operación'}));
 assert(!has({external:true,role:'Administración',modules:['abonados']}));
});
