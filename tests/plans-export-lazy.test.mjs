import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('planes no descarga bibliotecas al iniciar; comparte solicitudes y permite reintentos',async()=>{
 const scripts=[],window={},document={createElement:()=>({remove(){}}),head:{appendChild:s=>scripts.push(s)}};
 const ctx=vm.createContext({window,document});
 const code=fs.readFileSync('private/plans-export.js','utf8').replace(/export /g,'');
 vm.runInContext(code+'\nthis.prepareWord=preparePlanWord;this.preparePDF=preparePlanPDF;',ctx);
 assert.equal(scripts.length,0);
 const a=ctx.prepareWord(),b=ctx.prepareWord();assert.equal(a,b);assert.equal(scripts.length,1);
 scripts[0].onerror();await assert.rejects(a);
 const c=ctx.prepareWord();assert.equal(scripts.length,2);window.docx={Document:true,Packer:true};scripts[1].onload();await c;
 const p=ctx.preparePDF();assert.equal(scripts.length,4);window.jspdf={jsPDF:true};window.AsadaDiagnosticFonts={};scripts[2].onload();scripts[3].onload();await p;
 const html=fs.readFileSync('private/planes.html','utf8');assert.doesNotMatch(html,/<script[^>]+src="assets\/(docx|jspdf\.umd\.min|diagnostic-fonts)\.js"/);
});
