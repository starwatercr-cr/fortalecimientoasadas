import {QUALITY_PARAMS,qualityReport,parameterUnits} from './water-parameters.js';

export const filledQualityRows=rows=>rows.filter(row=>String(row.value||'').trim());
export function compactQualityResult(r){
 const p=QUALITY_PARAMS.find(p=>p.id===r.id),kind=p?.kind;
 if(r.status==='within')return {title:kind==='range'?'Dentro del rango':kind==='micro'||kind==='detection'?'No detectable reportado':kind==='odor'?'Aceptable':kind==='alert'?'Por debajo de la alerta':'Dentro del máximo',action:'Mantenga el control periódico y conserve el informe.',tone:'within'};
 if(r.status==='context')return {title:'Agua sin tratamiento',action:'Use este dato para evaluar la fuente. Analice también el agua tratada antes de comprobar el cumplimiento.',tone:'context'};
 if(r.status==='pending')return {title:'Por confirmar',action:r.comment,tone:'pending'};
 if(r.status==='urgent')return {title:r.label.startsWith('Detección')?'Detección · atención prioritaria':'Fuera del criterio · atención prioritaria',action:'Comunique el hallazgo al responsable técnico y al Área Rectora de Salud. Coordine las medidas de protección y verificación sin esperar a otro análisis para informar.',tone:'urgent'};
 let action=r.review||r.action;
 if(r.id==='chlorine')action=r.label==='Por debajo del rango'?'Confirme con un equipo DPD y revise dosificador, producto y caudal con el responsable técnico. No aumente la dosis sin verificar.':'Confirme con un equipo DPD y revise dosificación y caudal con el responsable técnico. No ajuste la dosis a ciegas.';
 if(r.id==='ph')action='Repita la medición con el pH-metro calibrado. Revise fuente y tratamiento con el responsable técnico antes de aplicar productos.';
 if(r.id==='turbidity')action='Verifique con el turbidímetro. Revise captación, sedimentos y filtración, junto con el control de desinfección.';
 if(p?.pesticide)action='Confirme compuesto, unidad y método con el laboratorio. Comunique la detección al responsable técnico y a Salud para definir el seguimiento.';
 return {title:r.status==='alert'?r.label==='Detección por debajo de la alerta'?'Detección: requiere seguimiento':'Alerta: requiere revisión':r.label==='Por debajo del rango'?'Por debajo del rango':r.label==='Por encima del rango'?'Por encima del rango':'Fuera del criterio',action,tone:r.status};
}
export async function buildQualityWord(report,tasks){
 const {Document,Paragraph,HeadingLevel,Packer}=globalThis.docx;
 const p=(text,heading)=>new Paragraph({text,heading,keepNext:!!heading,spacing:{after:130,line:260}}),d=report.context;
 const c=[p('Resumen de calidad del agua',HeadingLevel.TITLE),p(d.name||'[Nombre de la ASADA pendiente]'),p('Muestra: '+(d.sample||'[Punto pendiente]')+' · Fecha: '+(d.date||'[Fecha pendiente]')),p('Laboratorio: '+(d.lab||'[Pendiente]')+' · Informe: '+(d.report||'[Pendiente]')),p('Tipo de agua: '+({treated:'Tratada',raw:'Sin tratamiento',unknown:'Por confirmar'}[d.stage]||'Por confirmar'))];
 for(const r of report.results){const brief=compactQualityResult(r);c.push(p(r.name,HeadingLevel.HEADING_2),p('Resultado: '+r.reported+' '+r.unit+' · '+brief.title),p('Referencia: '+r.criterion),p('Qué hacer: '+brief.action));}
 if(tasks.length){c.push(p('Seguimiento acordado',HeadingLevel.HEADING_1));for(const t of tasks)c.push(p(t.name,HeadingLevel.HEADING_2),p('Acción: '+(t.action||'[Pendiente de acordar]')),p('Responsable: '+(t.owner||'[Pendiente]')+' · Fecha de verificación: '+(t.deadline||'[Pendiente]')),p('Estado / verificación: '+(t.state||'[Pendiente]')));}
 c.push(p('Referencia: Decreto 38924-S, anexo 1, cuadros 1–6. Los valores de alerta no se confunden con máximos admisibles. Esta lectura corresponde a los parámetros de esta muestra; no certifica la potabilidad del acueducto ni sustituye el informe de laboratorio.'),p('Firma: __________________________________________'));
 return Packer.toBlob(new Document({creator:d.name||'ASADA',title:'Resumen de calidad del agua',styles:{default:{document:{run:{font:'Arial',size:22,color:'000000'}}}},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,right:1440,bottom:1080,left:1440}}},children:c}]}));
}
function initQuality(){
 const $q=id=>document.getElementById(id);if(!$q('quality-form'))return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let current=null,rowId=0,timer;const taskCache={};
 const context=()=>Object.fromEntries(['name','sample','date','lab','report','stage','origin','disinfection','temperature'].map(k=>[k,$q('q-'+k).value.trim()]));
 const readRow=div=>Object.fromEntries(['param','value','unit','ld'].map(k=>[k,div.querySelector('[data-q="'+k+'"]').value.trim()]));
 function reading(r){const brief=compactQualityResult(r);return `<h3>${esc(brief.title)}</h3><p class="small"><strong>Referencia:</strong> ${esc(r.criterion)}</p><p><strong>Qué hacer:</strong> ${esc(brief.action)}</p>`;}
 function saveTasks(){document.querySelectorAll('.quality-task').forEach(t=>{taskCache[t.dataset.key]=Object.fromEntries(['action','owner','deadline','state'].map(k=>[k,t.querySelector('[data-task="'+k+'"]').value]));});}
 function tasksNow(){return [...document.querySelectorAll('.quality-task')].map(t=>({name:t.dataset.key,...Object.fromEntries(['action','owner','deadline','state'].map(k=>[k,t.querySelector('[data-task="'+k+'"]').value.trim()]))}));}
 function refresh(){
  const c=context(),divs=[...$q('quality-rows').children],rows=divs.map(readRow),filled=filledQualityRows(rows),report=qualityReport(filled,c);
  let idx=0;for(let i=0;i<divs.length;i++){const box=divs[i].querySelector('[data-q="reading"]');if(!rows[i].value){box.className='quality-reading';box.innerHTML='<h3>Ingrese el resultado</h3><p class="small">Aquí verá cómo está y qué hacer.</p>';continue;}const r=report.results[idx++];box.className='quality-reading '+r.status;box.innerHTML=reading(r);}
  const aggregate=report.results.slice(filled.length);$q('quality-aggregate').innerHTML=aggregate.map(r=>`<div class="quality-reading ${r.status}"><h3>${esc(r.name)}</h3><p>${esc(r.reported)} ${esc(r.unit)}</p>${reading(r)}</div>`).join('');
 }
 function changed(){saveTasks();current=null;$q('quality-output').hidden=true;$q('quality-followup').hidden=true;$q('quality-download-status').textContent='';$q('quality-message').textContent='';clearTimeout(timer);timer=setTimeout(refresh,250);}
 function add(param='chlorine'){
  const id=++rowId,p=QUALITY_PARAMS.find(p=>p.id===param),div=document.createElement('div');div.className='quality-input-row';
  div.innerHTML=`<div class="quality-entry"><div class="quality-entry-top"><label for="q-param-${id}">Parámetro<select id="q-param-${id}" data-q="param">${QUALITY_PARAMS.map(p=>`<option value="${p.id}" ${p.id===param?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><button type="button" class="button outline" data-q="remove" aria-label="Quitar parámetro ${id}">Quitar</button></div><div class="quality-entry-fields"><label for="q-value-${id}">Resultado<input id="q-value-${id}" data-q="value" maxlength="80" placeholder="Ej.: 0,45, ND o presente"></label><label for="q-unit-${id}">Unidad<select id="q-unit-${id}" data-q="unit">${parameterUnits(p).map(u=>'<option>'+esc(u)+'</option>').join('')}</select></label></div><details class="quality-ld"><summary>Límite de detección (si el informe lo indica)</summary><label for="q-ld-${id}">En la unidad seleccionada<input id="q-ld-${id}" data-q="ld" maxlength="40" placeholder="Ej.: 0,01"></label></details></div><div class="quality-reading" data-q="reading" aria-live="polite"><h3>Ingrese el resultado</h3><p class="small">Aquí verá cómo está y qué hacer.</p></div>`;
  div.querySelector('[data-q="param"]').addEventListener('change',()=>{const np=QUALITY_PARAMS.find(p=>p.id===readRow(div).param);div.querySelector('[data-q="unit"]').innerHTML=parameterUnits(np).map(u=>'<option>'+esc(u)+'</option>').join('');div.querySelector('[data-q="value"]').value='';div.querySelector('[data-q="ld"]').value='';if(np.id==='fluoride'||np.id==='combined')$q('q-temperature').closest('details').open=true;changed();});
  div.querySelector('[data-q="remove"]').addEventListener('click',()=>{div.remove();changed();});$q('quality-rows').append(div);
 }
 $q('quality-add').addEventListener('click',()=>{add();changed();});$q('quality-form').addEventListener('input',changed);$q('quality-form').addEventListener('change',changed);
 $q('quality-form').addEventListener('submit',e=>{
  e.preventDefault();clearTimeout(timer);saveTasks();refresh();const rows=filledQualityRows([...$q('quality-rows').children].map(readRow));
  if(!rows.length){$q('quality-message').textContent='Ingrese al menos un resultado.';return;}
  if(new Set(rows.map(r=>r.param)).size!==rows.length){$q('quality-message').textContent='Hay parámetros repetidos. Use un resultado por parámetro de la misma muestra.';return;}
  current=qualityReport(rows,context());const results=current.results,tasks=results.filter(r=>r.status!=='within'&&r.status!=='context');
  $q('quality-output').hidden=false;$q('quality-followup').hidden=!tasks.length;
  const favorable=results.filter(r=>r.status==='within').length;
  $q('quality-overview').textContent=favorable+' con comparación favorable · '+tasks.length+' requieren atención o confirmación'+(results.some(r=>r.status==='context')?' · Agua sin tratamiento: no se califica cumplimiento.':'.');
  $q('quality-tasks').innerHTML=tasks.map((r,i)=>{const t=taskCache[r.name]||{};return `<fieldset class="quality-task" data-key="${esc(r.name)}"><legend>${esc(r.name)} · ${esc(compactQualityResult(r).title)}</legend><label for="q-task-action-${i}">Acción acordada<textarea id="q-task-action-${i}" data-task="action" rows="2" maxlength="3000" placeholder="Ej.: verificar medición y revisar el dosificador">${esc(t.action||'')}</textarea></label><div class="fin-fields"><label for="q-task-owner-${i}">Responsable<input id="q-task-owner-${i}" data-task="owner" maxlength="150" value="${esc(t.owner||'')}"></label><label for="q-task-deadline-${i}">Fecha de verificación<input id="q-task-deadline-${i}" data-task="deadline" type="date" value="${esc(t.deadline||'')}"></label></div><label for="q-task-state-${i}">Estado / resultado de la verificación<textarea id="q-task-state-${i}" data-task="state" rows="2" maxlength="3000">${esc(t.state||'')}</textarea></label></fieldset>`;}).join('');
  $q('quality-results-title').focus();
 });
 $q('quality-download').addEventListener('click',async()=>{if(!current)return;const button=$q('quality-download');button.disabled=true;$q('quality-download-status').textContent='Preparando el resumen…';try{const blob=await buildQualityWord(current,tasksNow()),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Resumen_Calidad_Agua_ASADA.docx';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$q('quality-download-status').textContent='Resumen preparado.';}catch{$q('quality-download-status').textContent='No se pudo descargar. Intente nuevamente.';}finally{button.disabled=false;}});
 for(const p of ['ecoli','fecal','chlorine','turbidity','ph','color'])add(p);
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initQuality);else initQuality();}
