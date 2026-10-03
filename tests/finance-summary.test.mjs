import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context=vm.createContext({});vm.runInContext(readFileSync('private/finanzas.js','utf8'),context);
test('El resumen usa el estado guardado, agrega activos y calcula excedente o déficit',()=>{
 const p={cash:10,receivables:20,fixed:100,other:5,liabilities:40,equity:95,income:200,expenses:180,date:'2026-12-31'};
 const s=context.summarizeSavedStatement(p);assert.equal(s.assets,135);assert.equal(s.result,20);assert.equal(s.liabilities,40);
 assert.equal(context.summarizeSavedStatement({...p,income:0,expenses:5}).result,-5);
 assert.equal(context.summarizeSavedStatement({...p,income:0,expenses:0}).result,0);
 assert.throws(()=>context.summarizeSavedStatement({...p,fixed:undefined}),/incompletas/);
});
