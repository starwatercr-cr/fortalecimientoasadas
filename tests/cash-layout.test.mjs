import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('private/panel-gestion.js','utf8');
const helpers=source.slice(source.indexOf('function cashMatrix('),source.indexOf('function draw(){'));
const ctx=vm.createContext({months:Array.from({length:12},(_,i)=>String(i+1)),sum:a=>a.reduce((s,n)=>s+Number(n||0),0),esc:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;'),money:n=>'₡'+n,assemblyLink:new URLSearchParams()});
vm.runInContext(helpers,ctx);
test('El flujo horizontal agrupa conceptos, arrastra saldos y no suma saldos en el resumen',()=>{
 const data=[{date:'2026-01-02',type:'in',part:'Agua',concept:'Recaudación',amount:100},{date:'2026-01-03',type:'in',part:'Agua',concept:'Recaudación',amount:50},{date:'2026-02-02',type:'out',part:'Administración',concept:'Salarios',amount:200},{date:'2026-02-03',type:'out',part:'Administración',concept:'Caja chica · Materiales',amount:10}];
 const m=ctx.cashMatrix(data,20);
 assert.equal(m.incomeGroups.length,1);assert.equal(m.incomeGroups[0].values[0],150);
 assert.equal(m.initial[1],170);assert.equal(m.closing[1],-40);assert.equal(m.initial[2],-40);assert.equal(m.closing[11],-40);
 assert.equal(m.expense[1],210);
 const html=ctx.cashTable(data,20);assert.match(html,/Resumen anual/);assert.match(html,/sw-negative/);assert.match(html,/Saldo final disponible/);
 assert.equal((html.match(/scope="col"/g)||[]).length,14);
});
test('Los meses sin movimientos conservan el saldo y los conceptos se escapan',()=>{
 const m=ctx.cashMatrix([],50);assert.ok(m.closing.every(n=>n===50));
 const html=ctx.cashTable([{date:'2026-01-01',type:'in',part:'Agua',concept:'<img>',amount:1}],0);
 assert.ok(!html.includes('<img>'));assert.ok(html.includes('&lt;img&gt;'));
});
