import {registryFields,registryMapping,normalizeService,reviewRegistry,registryTemplate} from './billing-registry-model.js';
import {categories} from './facturacion-model.js';
import {readSubscriberFile} from './abonados-files.js';

export function setupRegistry({asadaSelect,api,run,download}){
 const $=id=>document.getElementById('registry-'+id);
 let records=[],loadedAsada='',editing=null,tables=[],review=null,page=0;
 const form=$('form');
 const options=(values)=>values.map(([key,label])=>new Option(label,key));
 for(const [key,label] of Object.entries(registryFields)){
  const node=document.createElement('label');
  node.textContent=label;
  const input=document.createElement(['category','status'].includes(key)?'select':'input');
  input.name=key;
  if(key==='category')input.replaceChildren(new Option('Seleccione',''),...options(Object.entries(categories)));
  else if(key==='status')input.replaceChildren(...options([['activo','Activo'],['suspendido','Suspendido'],['inactivo','Inactivo']]));
  else input.type=key==='initialPeriod'?'month':key==='email'?'email':'text';
  input.required=['code','identity','name','category'].includes(key);
  if(key==='initialReading')input.inputMode='decimal';
  node.append(input);$('fields').append(node);
 }
 function render(){
  const search=$('search').value.trim().toLocaleLowerCase('es');
  const filtered=records.filter(({payload:p})=>[p.code,p.name,p.identity,p.meter,p.sector].join(' ').toLocaleLowerCase('es').includes(search));
  page=Math.max(0,Math.min(page,Math.ceil(filtered.length/25)-1));
  $('count').textContent=records.length+' servicios · '+records.filter(r=>r.payload.status==='activo').length+' activos';
  $('page').textContent=filtered.length?'Mostrando '+(page*25+1)+'–'+Math.min(filtered.length,(page+1)*25)+' de '+filtered.length:'Sin registros';
  $('prev').disabled=page===0;$('next').disabled=(page+1)*25>=filtered.length;
  $('rows').replaceChildren(...filtered.slice(page*25,(page+1)*25).map(r=>{
   const p=r.payload,tr=document.createElement('tr');
   for(const value of [p.code,p.name+' · '+p.identity,p.meter||'—',categories[p.category]||p.category,p.sector||'—',p.status])tr.insertCell().textContent=value;
   const button=document.createElement('button');button.type='button';button.className='button outline';button.textContent='Editar';button.onclick=()=>open(r);tr.insertCell().append(button);return tr;
  }));
 }
 function open(record=null){
  if(!asadaSelect.value){$('status').textContent='Seleccione una ASADA.';return;}
  editing=record;form.reset();
  for(const [key] of Object.entries(registryFields))if(record)form.elements[key].value=record.payload[key]||'';
  form.elements.code.readOnly=Boolean(record);
  $('form-title').textContent=record?'Editar servicio '+record.code:'Nuevo abonado / servicio';
  form.hidden=false;form.elements.code.focus();
 }
 function invalidateReview(){
  review=null;$('import-preview').hidden=true;$('import-confirm').checked=false;$('import-save').disabled=true;
 }
 async function load(){
  const result=await api('registry');
  records=result.services;loadedAsada=result.asada.id;
  render();$('status').textContent='Padrón actualizado · '+result.asada.name;
 }
 function reset(){
  records=[];loadedAsada='';editing=null;page=0;tables=[];form.hidden=true;
  $('file').value='';$('import-config').hidden=true;invalidateReview();render();
  $('status').textContent='Seleccione una ASADA y actualice el padrón.';
  $('import-status').textContent='Cargue el archivo de la ASADA seleccionada.';
 }
 $('search').oninput=()=>{page=0;render()};
 $('prev').onclick=()=>{page--;render()};
 $('next').onclick=()=>{page++;render()};
 $('add').onclick=()=>open();
 $('cancel').onclick=()=>{form.hidden=true;editing=null};
 $('refresh').onclick=()=>run(load,$('status'));
 form.onsubmit=event=>{
  event.preventDefault();
  run(async context=>{
   const service=normalizeService(Object.fromEntries(new FormData(form)));
   await api('registry-save',{...context,service,id:editing?.id,version:editing?.version});
   form.hidden=true;editing=null;await load();invalidateReview();
   $('status').textContent='Servicio guardado correctamente.';
  },$('status'));
 };
 function mapColumns(){
  invalidateReview();
  const header=Number($('header').value)-1;
  const table=tables[Number($('sheet').value)]?.rows||[];
  const headers=table[header]||[];
  const blocks=Math.ceil(Math.max(0,table.length-header-1)/500);
  $('block').replaceChildren(...Array.from({length:blocks},(_,i)=>new Option('Filas '+(header+2+i*500)+'–'+Math.min(table.length,header+1+(i+1)*500),i)));
  const suggested=registryMapping(headers);
  $('mapping').replaceChildren(...Object.entries(registryFields).map(([key,label])=>{
   const node=document.createElement('label');node.textContent=label;
   const select=document.createElement('select');select.dataset.field=key;
   select.replaceChildren(new Option('Sin columna','-1'),...Array.from(headers,(h,i)=>new Option(String(h??'Columna '+(i+1)),i)));
   select.value=String(suggested[key]);node.append(select);return node;
  }));
 }
 $('file').onchange=()=>{
  const file=$('file').files[0];invalidateReview();$('import-config').hidden=true;
  if(!file)return;
  run(async()=>{
   if(!/\.(xlsx|csv)$/i.test(file.name))throw Error('Use un Excel XLSX o CSV.');
   const result=await readSubscriberFile(file);
   tables=result.tables;
   if(!tables.length)throw Error('No hay hojas para importar.');
   $('sheet').replaceChildren(...tables.map((t,i)=>new Option(t.name,i)));
   $('header').value=1;$('import-config').hidden=false;mapColumns();
   $('import-status').textContent='Archivo cargado. Confirme la asignación de columnas.';
  },$('import-status'));
 };
 $('sheet').onchange=$('header').onchange=mapColumns;
 $('mapping').onchange=$('block').onchange=invalidateReview;
 $('template').onclick=()=>download(registryTemplate(),'plantilla-padron-star-water.csv');
 $('review').onclick=()=>run(async()=>{
  await load();invalidateReview();
  const header=Number($('header').value);
  if(!Number.isInteger(header)||header<1||header>100)throw Error('Revise la fila de encabezados.');
  const offset=Number($('block').value)*500;
  const rows=tables[Number($('sheet').value)]?.rows.slice(header+offset,header+offset+500)||[];
  if(!rows.length)throw Error('El bloque no contiene datos.');
  const mapping=Object.fromEntries([...$('mapping').querySelectorAll('select')].map(s=>[s.dataset.field,Number(s.value)]));
  if(['code','identity','name','category'].some(k=>mapping[k]<0))throw Error('Asigne las columnas de paja, identificación, nombre y categoría.');
  review=reviewRegistry(rows,mapping,records);
  $('import-errors').replaceChildren(...review.issues.map(issue=>{
   const li=document.createElement('li');li.textContent='Fila '+(issue.line+header-1+offset)+' · '+issue.reason;return li;
  }));
  $('import-rows').replaceChildren(...review.entries.map(({entry,action,line})=>{
   const tr=document.createElement('tr');
   for(const value of [line+header-1+offset,entry.code,entry.name+' · '+entry.identity,entry.meter,categories[entry.category],action])tr.insertCell().textContent=value;
   return tr;
  }));
  $('import-preview').hidden=false;
  $('import-status').textContent=review.entries.filter(r=>r.action==='Agregar').length+' nuevos · '+review.issues.length+' filas por revisar · '+review.entries.filter(r=>r.action==='Ya registrado').length+' existentes.';
 },$('import-status'));
 $('import-confirm').onchange=()=>{$('import-save').disabled=!$('import-confirm').checked||!review?.entries.length||Boolean(review?.issues.length)};
 $('import-save').onclick=()=>run(async context=>{
  if(!review||review.issues.length||!$('import-confirm').checked||loadedAsada!==context.asada)throw Error('Revise y confirme la importación nuevamente.');
  const data=await api('registry-import',{...context,confirm:true,services:review.entries.map(r=>r.entry)});
  invalidateReview();await load();$('import-status').textContent=data.added+' servicios incorporados; '+data.existing+' ya registrados.';
 },$('import-status'));
 return {reset,load,ensure:()=>{if(asadaSelect.value&&loadedAsada!==asadaSelect.value)return run(load,$('status'))}};
}
