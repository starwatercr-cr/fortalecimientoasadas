import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {panelAPI} from '../netlify/lib/panel.mjs';

const ASADA='11111111-1111-4111-8111-111111111111';
const RECORD='22222222-2222-4222-8222-222222222222';
const DOCUMENT='33333333-3333-4333-8333-333333333333';

test('el membrete Word usa la ASADA elegida en calidad',async()=>{
 const source=await readFile(new URL('../private/letterhead.js',import.meta.url),'utf8');
 const queries=[];
 class Paragraph{constructor(value){this.value=value;}}
 class TextRun{constructor(value){this.value=value;}}
 const select={value:ASADA};
 const context={document:{getElementById:id=>id==='quality-asada'?select:null,querySelector:()=>null},window:{docx:{Paragraph,TextRun}},fetch:async url=>{queries.push(url);return {ok:true,json:async()=>({asada:{id:ASADA},letterhead:{name:'ASADA de prueba',enabled:true}})};},console};
 vm.runInNewContext(source,context);
 const paragraphs=await context.window.SWLetterhead.word(ASADA);
 assert.equal(queries[0],'/api/letterhead-data?asada='+ASADA);
 assert.equal(paragraphs[0].value.children[0].value.text,'ASADA de prueba');
});

test('el informe PDF original se recupera desde el documento privado de la misma ASADA',async()=>{
 const accessed=[];
 const deps={authorized:async()=>({admin:true,user:{id:ASADA}}),sessionToken:()=>'',uuid:v=>/^[a-f\d-]{36}$/.test(v||''),PublicError:class extends Error{constructor(status,message){super(message);this.status=status;}},json:Response.json,profileStorage:async(method,path)=>{accessed.push([method,path]);return new TextEncoder().encode('%PDF-1.4 prueba').buffer;},sb:async route=>{const u=new URL(route,'https://test.local');if(u.pathname.endsWith('/asadas'))return [{id:ASADA,name:'ASADA de prueba'}];if(u.pathname.endsWith('/panel_records'))return [{payload:{documentId:DOCUMENT}}];if(u.pathname.endsWith('/asada_documents'))return [{category:'Otro documento',path:ASADA+'/informe.pdf',type:'application/pdf',filename:'Informe original.pdf'}];throw Error(route);}};
 const response=await panelAPI('panel-quality-file',new Request('https://test.local/api/panel-quality-file?asada='+ASADA+'&id='+RECORD),deps);
 assert.equal(response.status,200);
 assert.equal(response.headers.get('Content-Type'),'application/pdf');
 assert.match(response.headers.get('Content-Disposition'),/attachment/);
 assert.match(await response.text(),/^%PDF/);
 assert.deepEqual(accessed,[['GET',ASADA+'/informe.pdf']]);
});
