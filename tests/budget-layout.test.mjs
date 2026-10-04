import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('private/panel-gestion.js','utf8');
const ctx=vm.createContext({months:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],sum:a=>a.reduce((s,n)=>s+Number(n||0),0),esc:s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;'),money:n=>'₡'+n,pct:n=>Number.isFinite(n)?n+' %':'Sin base'});
vm.runInContext(source.slice(source.indexOf('const budgetServices='),source.indexOf('function cashMatrix(')),ctx);
const part={service:'Acueducto',budgetType:'expense',group:'Operativos',part:'Sueldos'};
test('Presupuesto: doce meses, corte acumulado, centavos y partidas separadas por servicio y grupo',()=>{
 const budgets=[{...part,amount:100},{...part,group:'Administrativos',amount:200},{...part,service:'Hidrantes',amount:300}];
 const tx=[{...part,type:'out',amount:20.10,date:'2026-01-01'},{...part,type:'out',amount:0.20,date:'2026-01-02'},{...part,type:'out',amount:110,date:'2026-12-31'},{...part,group:'Administrativos',type:'out',amount:40,date:'2026-02-01'}];
 const rows=ctx.budgetMatrix(budgets,tx,2);assert.equal(rows.length,3);const operating=rows.find(r=>r.service==='Acueducto'&&r.group==='Operativos');assert.equal(operating.executed,20.30);assert.equal(operating.remaining,79.70);assert.equal(operating.monthly[11],110);assert.equal(operating.monthly.length,12);
 const html=ctx.budgetHorizontal(rows,2);assert.equal((html.match(/scope="col"/g)||[]).length,17);assert.match(html,/Acumulado a Feb/);assert.match(html,/sw-budget-future/);assert.match(ctx.budgetHorizontal(ctx.budgetMatrix(budgets,tx,12),12),/sw-negative/);
});
test('Presupuesto: ingresos e inversiones conservan clasificación, filtros y movimientos sin presupuesto',()=>{
 const budgets=[{...part,budgetType:'income',group:'Ingresos',amount:500},{...part,budgetType:'investment',group:'Inversiones',amount:100}];
 const tx=[{...budgets[0],type:'in',date:'2026-01-01',amount:50},{...budgets[1],type:'out',date:'2026-02-01',amount:150},{date:'2026-01-01',type:'out',amount:10,part:'<img>'}];
 const rows=ctx.budgetMatrix(budgets,tx);assert.equal(rows.length,3);assert.equal(rows.find(r=>r.budgetType==='income').remaining,450);assert.equal(rows.find(r=>r.budgetType==='investment').remaining,-50);assert.equal(rows.find(r=>r.service==='Sin clasificar').hasBudget,false);assert.equal(ctx.budgetMatrix(budgets,tx,12,'Hidrantes').length,0);assert.equal(ctx.budgetMatrix(budgets,tx,12,'Acueducto','income').length,1);assert.match(ctx.budgetHorizontal(rows,12),/&lt;img&gt;/);assert.doesNotMatch(ctx.budgetHorizontal(rows,12),/<img>/);
});
test('Presupuesto: registros anteriores se conservan sin inventar un servicio ni duplicar caja chica',()=>{
 const rows=ctx.budgetMatrix([{part:'Administración',amount:100}],[{date:'2026-01-01',type:'out',part:'Administración',amount:10}]);assert.equal(rows.length,1);assert.equal(rows[0].service,'Sin clasificar');assert.equal(rows[0].budgetType,'expense');assert.equal(rows[0].executed,10);
});
