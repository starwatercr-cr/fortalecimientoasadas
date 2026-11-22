import {QUALITY_PARAMS,qualityReport} from './water-parameters.js';
import {readWaterAnalysis,extractWaterAnalysis,waterAnalysisType} from '/quality-import.mjs';

export const filledQualityRows=rows=>rows.filter(row=>String(row.value||'').trim());
export const qualityWarningsForContext=(warnings,stage)=>stage==='unknown'?warnings:warnings.filter(w=>!w.startsWith('No se pudo confirmar si la muestra corresponde a agua tratada o sin tratamiento.')&&!/tipo de agua/i.test(w));
export function compactQualityResult(r){
 const p=QUALITY_PARAMS.find(p=>p.id===r.id),kind=p?.kind;
 if(r.status==='within')return {title:kind==='range'?'Dentro del rango':kind==='micro'||kind==='detection'?'No detectable reportado':kind==='odor'?'Aceptable':kind==='alert'?'Por debajo de la alerta':'Dentro del máximo',action:'Mantenga el control periódico y conserve el informe.',tone:'within'};
 if(r.status==='context')return {title:'Agua sin tratamiento',action:'Use este dato para evaluar la fuente. Analice también el agua tratada antes de comprobar el cumplimiento.',tone:'context'};
 if(r.status==='pending')return {title:'Por confirmar',action:r.comment,tone:'pending'};
 if(r.status==='urgent')return {title:r.label.startsWith('Detección')?'Detección · atención prioritaria':'Fuera del criterio · atención prioritaria',action:'Comunique de inmediato el hallazgo al responsable técnico y al Área Rectora de Salud. Active el procedimiento de respuesta y coordine las medidas de protección y verificación; no espere a otro análisis para informar.',tone:'urgent',priority:'Atención sanitaria inmediata'};
 if(r.id==='temperature'&&r.status==='outside')return {title:r.label,action:'Confirme la temperatura y el punto de muestreo con el laboratorio y el responsable técnico. Revise las características de la fuente; este dato por sí solo no indica contaminación.',tone:'outside',priority:'Revisión técnica'};
 let action=r.review||r.action;
 if(r.id==='chlorine')action=r.label==='Por debajo del rango'?'Verifique el cloro ahora con un equipo DPD: puede faltar protección de desinfección. Avise al responsable técnico y revise dosificador, producto y caudal. No aumente la dosis sin verificar.':'Verifique el cloro ahora con un equipo DPD. Avise al responsable técnico y revise dosificación y caudal para corregir el exceso y volver a medir. No ajuste la dosis a ciegas.';
 if(r.id==='ph')action='Repita la medición ahora con el pH-metro calibrado y avise al responsable técnico. Revise fuente y tratamiento y acuerde cómo corregir y verificar; no aplique productos sin valoración.';
 if(r.id==='turbidity')action='Verifique con el turbidímetro y revise captación, sedimentos, filtración y desinfección con el responsable técnico.';
 if(p?.pesticide)action=r.label==='Detección por debajo de la alerta'?'Confirme compuesto, unidad y método con el laboratorio. Comunique la detección al responsable técnico y a Salud y acuerde su seguimiento.':'Comunique de inmediato el resultado al responsable técnico y al Área Rectora de Salud. Confirme compuesto, unidad y método con el laboratorio y coordine la valoración del riesgo y las medidas de protección; una alerta no es un máximo admisible.';
 const immediate=r.status==='outside'||(p?.pesticide&&r.label!=='Detección por debajo de la alerta');
 if(r.status==='outside'&&!['chlorine','ph'].includes(r.id))action='Verifique el resultado ahora y avise al responsable técnico. '+action;
 const priority=immediate?'Atención inmediata del equipo':'Seguimiento y verificación';
 return {title:r.status==='alert'?r.label==='Detección por debajo de la alerta'?'Detección: requiere seguimiento':'Alerta: requiere revisión':r.label==='Por debajo del rango'?'Por debajo del rango':r.label==='Por encima del rango'?'Por encima del rango':'Fuera del criterio',action,tone:r.status,priority};
}
export async function buildQualityWord(report,tasks){
 const {Document,Paragraph,HeadingLevel,Packer}=globalThis.docx;
 const p=(text,heading)=>new Paragraph({text,heading,keepNext:!!heading,spacing:{after:130,line:260}}),d=report.context;
 const c=[...(await globalThis.SWLetterhead?.word()||[]),p('Resumen de calidad del agua',HeadingLevel.TITLE),p(d.name||'[Nombre de la ASADA pendiente]'),p('Muestra: '+(d.sample||'[Punto pendiente]')+' · Fecha: '+(d.date||'[Fecha pendiente]')),p('Laboratorio: '+(d.lab||'[Pendiente]')+' · Informe: '+(d.report||'[Pendiente]')),p('Tipo de agua: '+({treated:'Tratada',raw:'Sin tratamiento',unknown:'Por confirmar'}[d.stage]||'Por confirmar'))];
 for(const r of report.results){const brief=compactQualityResult(r);c.push(p(r.name,HeadingLevel.HEADING_2),p('Resultado: '+r.reported+' '+r.unit+' · '+brief.title),p('Referencia: '+r.criterion),...(brief.priority?[p('Prioridad: '+brief.priority)]:[]),p('Qué hacer: '+brief.action));}
 if(tasks.length){c.push(p('Seguimiento acordado',HeadingLevel.HEADING_1));for(const t of tasks)c.push(p(t.name,HeadingLevel.HEADING_2),p('Acción: '+(t.action||'[Pendiente de acordar]')),p('Responsable: '+(t.owner||'[Pendiente]')+' · Fecha de verificación: '+(t.deadline||'[Pendiente]')),p('Estado / verificación: '+(t.state||'[Pendiente]')));}
 c.push(p('Referencia: Decreto 38924-S, anexo 1, cuadros 1–6. Los valores de alerta no se confunden con máximos admisibles. Esta lectura corresponde a los parámetros de esta muestra; no certifica la potabilidad del acueducto ni sustituye el informe de laboratorio.'),p('Firma: __________________________________________'));
 return Packer.toBlob(new Document({creator:d.name||'ASADA',title:'Resumen de calidad del agua',styles:{default:{document:{run:{font:'Arial',size:22,color:'000000'}}}},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,right:1440,bottom:1080,left:1440}}},children:c}]}));
}
function initQuality(){
 const $=id=>document.getElementById(id);if(!$('quality-upload-form'))return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let asadas=[],asada='',canEdit=false,current=null,selected=null,records=[],busy=false;
 const status=t=>{$('quality-message').textContent=t;};
 async function api(route,input){
  const response=await fetch('/api/'+route,{method:input?'POST':'GET',credentials:'same-origin',headers:input?{'Content-Type':'application/json'}:{},body:input?JSON.stringify(input):undefined});
  const data=await response.json();if(!response.ok)throw Error(data.error||'No se pudo completar la operación.');return data;
 }
 const asadaName=()=>asadas.find(x=>x.id===asada)?.name||'Su ASADA';
 function render(payload,record){
  current=qualityReport(payload.rows,{...payload.context,name:asadaName()});selected=record;
  const results=current.results,flag=results.filter(r=>['urgent','outside','alert'].includes(r.status)).length,pending=results.filter(r=>r.status==='pending').length,favorable=results.filter(r=>r.status==='within').length;
  $('quality-output').hidden=false;
  $('quality-overview').textContent=payload.rows.length+' parámetros reconocidos · '+favorable+' con comparación favorable · '+flag+' requieren atención · '+pending+' por confirmar.';
  $('quality-context').textContent='ASADA: '+asadaName()+' · Muestra: '+(payload.context.date||'Fecha no identificada')+' · '+({treated:'Agua tratada',raw:'Agua sin tratamiento',unknown:'Tipo de agua por confirmar'}[payload.context.stage])+' · '+payload.filename+(payload.ocr?' · Leído mediante reconocimiento de imagen':'');
  $('quality-results').innerHTML=results.map((r,i)=>{const brief=compactQualityResult(r),source=payload.rows[i]?.source,immediate=brief.priority==='Atención inmediata del equipo'||brief.priority==='Atención sanitaria inmediata';return '<article class="quality-reading '+esc(r.status)+(immediate?' immediate':'')+'"><p class="small"><strong>'+esc(r.name)+'</strong> · '+esc(r.reported)+' '+esc(r.unit)+'</p>'+(brief.priority?'<p class="quality-priority">'+esc(brief.priority)+'</p>':'')+'<h3>'+esc(brief.title)+'</h3><p class="small"><strong>Referencia:</strong> '+esc(r.criterion)+'</p><p>'+esc(brief.action)+'</p>'+(source?'<p class="quality-source">Leído del informe: '+esc(source)+'</p>':'')+'</article>';}).join('');
  const alerts=[...qualityWarningsForContext(payload.warnings,payload.context.stage)];if(payload.context.stage==='unknown'&&!alerts.some(w=>w.includes('tipo de agua')))alerts.push('No se confirmó el tipo de agua; no se declara cumplimiento.');
  $('quality-warnings').hidden=!alerts.length;
  $('quality-warnings').innerHTML=alerts.length?'<h3>Datos que requieren confirmar con el informe</h3><ul>'+alerts.map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul>':'';
  const original=$('quality-original');original.hidden=!record;original.href=record?'/api/panel-quality-file?asada='+encodeURIComponent(asada)+'&id='+encodeURIComponent(record.id):'#';
  $('quality-reanalyze').hidden=!record||!canEdit;
  $('quality-download-status').textContent='';
  $('quality-results-title').focus();
 }
 function history(){
  $('quality-history').innerHTML=records.length?records.map(r=>'<div class="quality-history-row"><div><strong>'+esc(r.payload.filename)+'</strong><small>'+(r.payload.context.date?esc(r.payload.context.date)+' · ':'')+esc(r.payload.rows.length)+' parámetros reconocidos'+(r.payload.ocr?' · Imagen escaneada':'')+'</small></div><button class="button outline" type="button" data-quality-view="'+esc(r.id)+'">Ver interpretación</button></div>').join(''):'<p>Aún no hay análisis guardados.</p>';
 }
 async function load(){
  if(!asada){records=[];history();return;}
  $('quality-history').textContent='Cargando análisis…';
  const d=await api('panel-quality-list?asada='+encodeURIComponent(asada));records=d.records;canEdit=d.canEdit;history();
  $('quality-read').disabled=!canEdit;
  if(!canEdit)status('Su perfil permite consultar análisis; la administración o la Junta pueden adjuntar nuevos informes.');
 }
 $('quality-asada').addEventListener('change',async e=>{asada=e.target.value;current=null;selected=null;$('quality-output').hidden=true;$('quality-stage').value='auto';try{await load();}catch(error){status(error.message);}});
 $('quality-history').addEventListener('click',e=>{const button=e.target.closest('[data-quality-view]');if(!button)return;const r=records.find(x=>x.id===button.dataset.qualityView);if(r){render(r.payload,r);$('quality-stage').value='auto';if(canEdit)status('Para actualizar esta lectura, confirme arriba el tipo de agua de la muestra y pulse «Actualizar lectura del PDF».');$('quality-output').scrollIntoView({behavior:'smooth',block:'start'});}});
 async function analyze(file,previous=null){
  busy=true;$('quality-read').disabled=true;$('quality-reanalyze').disabled=true;status('Leyendo el análisis…');
  try{
   const reading=await readWaterAnalysis(file,status);
   const extracted=extractWaterAnalysis(reading.lines,QUALITY_PARAMS);
   if(!extracted.rows.length)throw Error('No se identificaron resultados con unidad y valor suficientes para una interpretación segura. Pruebe con un PDF legible o una foto nítida de una sola muestra.');
   if(extracted.rows.length>30)throw Error('El informe tiene demasiados parámetros para una lectura automática. Use el análisis de una sola muestra.');
   const chosen=$('quality-stage').value,context={...extracted.context,name:asadaName(),stage:chosen==='auto'?extracted.context.stage:chosen};
   const warnings=qualityWarningsForContext(extracted.warnings,context.stage);
   const preview={documentId:previous?.payload.documentId||'00000000-0000-0000-0000-000000000000',filename:file.name.slice(0,160),ocr:reading.ocr,context,rows:extracted.rows,warnings};
   if(new TextEncoder().encode(JSON.stringify(preview)).length>9500)throw Error('El documento contiene demasiados datos para guardarlos automáticamente. Use el análisis de una sola muestra.');
   status(previous?'Actualizando los resultados reconocidos…':'Guardando el documento y los resultados reconocidos…');
   let documentId=previous?.payload.documentId;
   if(!previous){
    const type=waterAnalysisType(file),label=('Análisis de agua · '+file.name.replace(/\.[^.]+$/,'')).slice(0,160);
    const params=new URLSearchParams({asada,name:label,category:'Otro documento'});
    const response=await fetch('/api/profile-upload?'+params,{method:'POST',credentials:'same-origin',headers:{'Content-Type':type},body:file}),uploaded=await response.json();
    if(!response.ok)throw Error(uploaded.error||'No se pudo guardar el informe.');
    documentId=uploaded.document.id;
   }
   const payload={...preview,documentId},year=previous?.year||Number(context.date.slice(0,4))||Number(new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'}).slice(0,4));
   const saved=await api('panel-save',{asada,year,kind:'quality_analysis',payload,...(previous?{id:previous.id,version:previous.version}:{})});
   await load();render(saved.record.payload,saved.record);$('quality-file').value='';
   status(previous?'Lectura actualizada. Revise los parámetros y el tipo de agua de la muestra.':'Análisis guardado. Revise los parámetros reconocidos y las observaciones de la lectura.');
  }catch(error){status(error.message);}finally{busy=false;$('quality-read').disabled=!canEdit;$('quality-reanalyze').disabled=false;}
 }
 $('quality-upload-form').addEventListener('submit',async e=>{e.preventDefault();if(busy||!canEdit||!asada)return;const file=$('quality-file').files[0];if(file)await analyze(file);});
 $('quality-reanalyze').addEventListener('click',async()=>{
  if(busy||!canEdit||!selected)return;
  const previous=selected;busy=true;$('quality-reanalyze').disabled=true;status('Recuperando el PDF original…');
  try{
   const response=await fetch('/api/panel-quality-file?asada='+encodeURIComponent(asada)+'&id='+encodeURIComponent(previous.id),{credentials:'same-origin'});
   if(!response.ok)throw Error('No se pudo recuperar el análisis original.');
   const blob=await response.blob();busy=false;
   await analyze(new File([blob],previous.payload.filename,{type:blob.type} ),previous);
  }catch(error){status(error.message);}finally{busy=false;$('quality-reanalyze').disabled=false;}
 });
 $('quality-download').addEventListener('click',async()=>{if(!current)return;const b=$('quality-download');b.disabled=true;$('quality-download-status').textContent='Preparando la interpretación…';try{const blob=await buildQualityWord(current,[]),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Interpretacion_Calidad_Agua_ASADA.docx';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$('quality-download-status').textContent='Documento preparado.';}catch(error){$('quality-download-status').textContent='No se pudo descargar. Intente nuevamente.';}finally{b.disabled=false;}});
 (async()=>{try{const d=await api('panel-asadas');asadas=d.asadas;canEdit=d.canEdit;$('quality-asada').innerHTML=asadas.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.name)+'</option>').join('');$('quality-asada-label').hidden=asadas.length<=1;asada=asadas[0]?.id||'';if(!asada)throw Error('No hay una ASADA disponible.');await load();if(canEdit)status('Adjunte un informe para iniciar la lectura automática.');}catch(error){status(error.message);$('quality-read').disabled=true;$('quality-history').textContent='No se pudieron cargar los análisis.';}})();
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initQuality);else initQuality();}
