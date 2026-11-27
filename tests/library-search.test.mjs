import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({});
vm.runInContext(fs.readFileSync('private/normativa-data.js','utf8')+'\n'+fs.readFileSync('private/biblioteca.js','utf8'),context);
const data=vm.runInContext('NORMATIVA_DATA',context);
const search=(query,filters={})=>{
 context.query=query;context.filters=filters;
 return Array.from(vm.runInContext('librarySearch(NORMATIVA_DATA,query,filters)',context));
};
const article=(doc,n)=>r=>r.doc===doc&&r.article===n;

test('la biblioteca interpreta referencias de artículo y documento como filtros exactos',()=>{
 for(const query of ['artículo 15 del Reglamento de ASADAS','decreto 42582 artículo 15','art 15 reglamento ASADAS']){
  const hits=search(query);
  assert(hits.length);
  assert(hits.every(article('asadas',15)),query);
 }
 assert(search('15').every(r=>r.article===15));
 assert(search('artículo 15').every(r=>r.article===15));
 assert(search('',{documentId:'asadas',article:'20'}).every(article('asadas',20)));
 assert.equal(search('artículo 15',{article:'20'}).length,0);
 assert.equal(search('reglamento de ASADAS',{documentId:'pozos'}).length,0);
 assert.equal(search('ley 8641')[0].doc,'hidrantes');
});

test('las preguntas completas devuelven artículos relevantes antes que coincidencias genéricas',()=>{
 const cases=[
  ['quién elige la junta directiva de la ASADA',article('asadas',20),3],
  ['cuánto dura la junta directiva',article('asadas',20),1],
  ['cómo convocar asamblea extraordinaria',article('asadas',17),2],
  ['qué permisos necesito para hacer un pozo',article('pozos',18),8],
  ['qué permisos necesito para hacer un pozo',article('pozos',19),12],
  ['corte de agua por falta de pago',article('servicios-aya',108),1],
  ['cortar el agua si no paga',article('servicios-aya',108),3],
  ['disponibilidad de agua para un lote',article('servicios-aya',31),4],
  ['cloro residual libre',article('calidad',17),3],
  ['tarifa de hidrantes',article('hidrantes',3),3],
  ['quién aprueba las tarifas de las ASADAS',article('asadas',59),2],
  ['responsabilidades del administrador de la ASADA',article('asadas',53),1],
  ['contratación en SICOP',r=>r.doc==='sicop-solicitud',3],
 ];
 for(const [query,relevant,top] of cases)assert(search(query).slice(0,top).some(relevant),query);
});

test('una palabra incidental no se interpreta como una respuesta a un tema ausente',()=>{
 assert.equal(search('licencia de maternidad').length,0);
 assert.equal(search('tarifa de matrícula universitaria').length,0);
 assert.equal(search('cloro residual libre',{documentId:'pozos'}).length,0);
 assert.equal(search('qué puedo hacer').length,0);
 assert(search('responsabilidades del administrador de la ASADA').every(r=>r.document.category!=='contratacion'));
 assert(search('HIDRANTES').length>0);
 assert.deepEqual(search('cloro residual libre').map(r=>[r.doc,r.article,r.page]),search('CLÓRO RESIDUAL LÍBRE').map(r=>[r.doc,r.article,r.page]));
});

test('el extracto destaca variantes completas y escapa el texto de un PDF',()=>{
 context.excerptText='Una ASADA registra hidrantes. <script>contenido</script> La tarifa tarifaria.';
 context.excerptTerms=['hidrante','tarifa'];
 const html=vm.runInContext('libraryExcerpt(excerptText,excerptTerms)',context);
 assert.match(html,/<mark>hidrantes<\/mark>/);
 assert.match(html,/<mark>tarifa<\/mark>/);
 assert.doesNotMatch(html,/<mark>tarifa<\/mark>ria/);
 assert.match(html,/&lt;script&gt;/);
 assert.doesNotMatch(html,/<script>/);
});

test('un PDF agregado en la sesión queda disponible en el índice sin recargar',()=>{
 context.session={documents:[...data.documents],chunks:[...data.chunks]};
 assert.equal(vm.runInContext("librarySearch(session,'licencia de maternidad').length",context),0);
 context.session.documents.push({id:'sesion-1',title:'Documento de prueba',local:true});
 context.session.chunks.push({doc:'sesion-1',page:2,label:'Texto del documento',article:null,text:'La licencia de maternidad se registra en este documento de prueba.'});
 const hits=vm.runInContext("librarySearch(session,'licencia de maternidad')",context);
 assert.equal(hits.length,1);assert.equal(hits[0].doc,'sesion-1');
});
