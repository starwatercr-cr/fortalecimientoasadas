import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('private/finance-word.js','utf8');
function fixture(){
 const scripts=[];
 const context=vm.createContext({document:{createElement:()=>({remove(){}}),head:{appendChild:s=>scripts.push(s)}}});
 vm.runInContext(source,context);
 return {scripts,context,load:()=>context.ensureFinanceWordLibrary()};
}
test('panel financiero no descarga Word al abrir y comparte carga concurrente',async()=>{
 const html=readFileSync('private/panel-gestion.html','utf8');
 assert(!/<script[^>]+src=["'][^"']*assets\/docx\.js/.test(html));
 const f=fixture();
 assert.equal(f.scripts.length,0);
 const a=f.load(),b=f.load();
 assert.equal(a,b);
 assert.equal(f.scripts.length,1);
 assert.equal(f.scripts[0].src,'/assets/docx.js');
 f.context.docx={};
 f.scripts[0].onload();
 await Promise.all([a,b]);
 await f.load();
 assert.equal(f.scripts.length,1);
});
test('Word permite reintentar después de una descarga fallida',async()=>{
 const f=fixture(),a=f.load();
 f.scripts[0].onerror();
 await assert.rejects(a,/No se pudo cargar Word/);
 const b=f.load();
 assert.equal(f.scripts.length,2);
 f.context.docx={};
 f.scripts[1].onload();
 await b;
});
