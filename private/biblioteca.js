/* Local PDF index: queries never leave this page. */
function libraryFold(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function libraryEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const libraryStop=new Set('a al alguna algun ante articulo articulos art como con cual cuales cuando cuanto cuantos de del debo deben desde donde el ella en es esa ese esta estas estan este estos esto hacer hay la las le lo los me mi necesito nos o para por podria puede pueden puedo que quien quienes se segun si sin sobre su sus tengo un una y'.split(' '));
const libraryContext=new Set(['agua','potable','servicio','asada','reglamento','normativa','ley']);
const librarySynonyms=[
 ['junta directiva','junta de directiva','organo directivo','miembro directivo','directivos'],
 ['falta de pago','morosidad','mora','impago','atraso en el pago','facturacion pendiente','facturas pendientes','deuda pendiente','pendiente de pago'],
 ['corte de agua','corte del agua','corte del servicio','suspension del servicio','suspension de agua','suspender el servicio','cortar el agua','desconexion','suspension','suspender','corte','cortar'],
 ['disponibilidad de agua','disponibilidad del agua','disponibilidad de servicio','disponibilidad de servicios','disponibilidad','constancia de disponibilidad','factibilidad de agua'],
 ['pozo','pozos','perforacion de pozo','perforacion de pozos','perforar un pozo','perforacion','perforar','aguas subterraneas'],
 ['permiso','permisos','autorizacion','requisito','requisitos','solicitud de permiso','permiso de perforacion'],
 ['lote','lotes','terreno','inmueble','fraccionamiento','parcela','urbanizacion','lotificacion'],
 ['elige','elegir','eleccion','electo','nombramiento','nombrar','designacion','designar'],
 ['periodo','periodos','duracion','dura','duran','plazo','plazos','vigencia','periodo de nombramiento','plazo de nombramiento','plazos y nombramientos'],
 ['tarifa','tarifas','tarifario','tarifaria','estructura tarifaria'],
 ['regula','regular','regulacion','regulador','reguladora','fija','fijar','fijacion','fijado','fijada','establece','establecer','establecimiento','aprueba','aprobar','aprobacion','aprobado','aprobada','autoridad reguladora'],
 ['aresep','autoridad reguladora de los servicios publicos','autoridad reguladora de servicios publicos'],
 ['hidrante','hidrantes'],['cloracion','desinfeccion','cloro'],
 ['convocar','convocatoria','convocada','convocado'],
 ['presidente','presidenta','presidencia'],['tesorero','tesorera','tesoreria'],['fiscal','fiscalia'],
 ['factura','facturacion','facturar','cobro','cobrar'],
 ['cambio','cambiar','sustitucion','sustituir','reemplazo','reemplazar'],
 ['solicitud','solicitar','solicitante'],
 ['administrador','administradora','personal administrativo','gestion administrativa','administracion de la asada'],
 ['responsabilidad','responsabilidades','responsable','responsables','obligacion','obligaciones','funciones','facultades','atribuciones','corresponde','encarga','competencias'],
 ['analisis de agua','analisis','muestreo','muestra','laboratorio'],
 ['contratacion','contrataciones','compra publica','compras publicas','adquisicion'],
 ['agua no contabilizada','anc','perdidas de agua','agua no facturada'],
 ['reconexion','reconectar','rehabilitacion del servicio'],
 ['reclamo','reclamacion','queja','recurso','recursos'],
 ['concesion','concesiones','aprovechamiento de agua'],
 ['asamblea general','asamblea de asociados','junta general','asamblea'],
 ['negativa','denegatoria','denegacion','rechazo','denegar','denegada'],
 ['medidor','medidores','hidrometro','micromedidor'],
 ['abonado','abonados','usuario','usuarios','persona usuaria'],
 ['contabilidad','contable','financiero contable','gestion contable'],
 ['rendicion de cuentas','transparencia','rendicion']
];
const libraryDocumentAliases={
 'asadas':['reglamento de asadas','reglamento asadas','reglamento de las asadas','decreto ejecutivo 42582','decreto 42582','42582'],
 'agua-potable':['ley general de agua potable','ley 1634','1634'],
 calidad:['reglamento para la calidad del agua potable','reglamento de calidad del agua potable','reglamento de calidad del agua','decreto 38924','38924'],
 'servicios-aya':['reglamento de prestacion de los servicios de aya','reglamento de prestacion de servicios de aya','reglamento de servicios de aya','reglamento de servicios aya','reglamento de prestacion de servicios','acuerdo 2020 442'],
 pozos:['reglamento para la perforacion de pozos y aprovechamiento de aguas subterraneas','reglamento de pozos','decreto 43053','43053'],
 hidrantes:['ley de hidrantes','ley 8641','8641'],
 'sicop-solicitud':['manual sicop','manual de sicop','p ps 101 04 2013'],
 'aresep-contratacion':['procedimiento de contratacion publica de aresep','procedimiento de contratacion de aresep','pr po 02']
};
function libraryWords(text){return libraryFold(text).match(/[a-z0-9]+/g)||[];}
function libraryStem(word){
 if(word.length<4)return word;
 if(word.endsWith('ces'))return word.slice(0,-3)+'z';
 if(/(?:ciones|siones|dades|tudes|ales|iles|ores|eses)$/.test(word))return word.slice(0,-2);
 return word.endsWith('s')?word.slice(0,-1):word;
}
const libraryKey=text=>libraryWords(text).map(libraryStem).join(' ');
const libraryTokens=query=>[...new Set(libraryWords(query).filter(t=>!libraryStop.has(t)))];
const libraryGroups=librarySynonyms.map(group=>[...new Set(group.map(libraryKey))]);
const libraryPhrases=libraryGroups.flatMap(group=>group.map(term=>({group,term,length:term.split(' ').length}))).sort((a,b)=>b.length-a.length);
function libraryNormalizeQuery(data,query,{documentId='',article=''}={}){
 let words=libraryWords(query),text=' '+words.join(' ')+' ';
 const procedural=/\b(?:requisitos?|permisos?|tramites?|solicitar|necesito)\b/.test(text);
 text=text.replace(/\b(?:no paga|no pago|no ha pagado|sin pagar)\b/g,'falta de pago')
  .replace(/\bsin disponibilidad\b/g,'negativa disponibilidad');
 let requested=article===''?null:Number(article);
 const articleMatch=text.match(/\b(?:articulo|articulos|art)\s+(\d{1,3})\b/);
 const bareArticle=words.length===1&&/^\d{1,3}$/.test(words[0]);
 if(articleMatch||bareArticle){
  const number=Number(articleMatch?articleMatch[1]:words[0]);
  if(requested!==null&&requested!==number)return {invalid:true};
  requested=number;
  text=articleMatch?text.replace(articleMatch[0],' '):' ';
 }
 if(requested!==null&&(!Number.isInteger(requested)||requested<1||requested>999))return {invalid:true};
 const aliases=data.documents.flatMap(d=>[d.title,d.number,...(libraryDocumentAliases[d.id]||[])].filter(Boolean).map(a=>({doc:d.id,alias:libraryWords(a).join(' ')}))).sort((a,b)=>b.alias.length-a.alias.length);
 const reference=aliases.find(a=>text.includes(' '+a.alias+' '));
 if(reference){
  if(documentId&&documentId!==reference.doc)return {invalid:true};
  documentId=reference.doc;
  // Remove the document reference, whose content is already enforced by the filter.
  text=text.replace(' '+reference.alias+' ',' ');
  for(const a of aliases.filter(a=>a.doc===documentId))text=text.replace(' '+a.alias+' ',' ');

 }
 words=libraryWords(text);
 const significant=words.filter(t=>!libraryStop.has(t));
 const stems=words.map(libraryStem);
 const groups=[];
 for(let i=0;i<stems.length;){
  const match=libraryPhrases.find(a=>stems.slice(i,i+a.length).join(' ')===a.term);
  if(match){
   if(!groups.some(g=>g.variants.includes(match.term)))groups.push({term:match.term,variants:match.group});
   i+=match.length;
  }else{
   const word=words[i],term=stems[i++];
   if(!libraryStop.has(word)&&!groups.some(g=>g.term===term))groups.push({term,variants:[term]});
  }
 }
 // Contextual water/ASADA terms can help ranking, but a specific topic must be present.
 const specific=groups.filter(g=>!libraryContext.has(g.term));
 return {documentId,reference:reference?.doc||'',article:requested,groups:specific.length?specific:groups,context:specific.length?groups.filter(g=>libraryContext.has(g.term)):[],significant,procedural};
}
const libraryIndexes=new WeakMap();
function libraryIndex(data){
 const existing=libraryIndexes.get(data);
 if(existing&&existing.length===data.chunks.length)return existing.rows;
 const docs=new Map(data.documents.map(d=>[d.id,d]));
 const rows=data.chunks.map(c=>{
  const words=libraryWords(c.text).map(libraryStem);
  const heading=c.text.match(/^art[ií]culo\s+\d+[º°.]?\s*[-–—.:]*\s*([^.!?]{5,160})[.!?]/i)?.[1]||'';
  return {chunk:c,document:docs.get(c.doc),body:' '+words.join(' ')+' ',lead:' '+words.slice(0,28).join(' ')+' ',heading:' '+libraryKey(heading)+' ',length:words.length};
 });
 libraryIndexes.set(data,{length:data.chunks.length,rows});
 return rows;
}
const libraryFind=(text,term)=>text.indexOf(' '+term+' ');
function libraryMatch(row,group){
 const direct=libraryFind(row.body,group.term);
 const variants=group.variants.filter(term=>libraryFind(row.body,term)>=0);
 if(!variants.length)return null;
 const leading=variants.some(term=>libraryFind(row.lead,term)>=0);
 const leadingPhrase=variants.some(term=>term.includes(' ')&&libraryFind(row.lead,term)>=0);
 const heading=variants.some(term=>libraryFind(row.heading,term)>=0);
 const positions=variants.map(term=>libraryFind(row.body,term));
 return {direct:direct>=0,leading,leadingPhrase,heading,variants,position:Math.min(...positions)};
}
function librarySearch(data,query,filters={}){
 const request=libraryNormalizeQuery(data,query,filters);
 if(request.invalid||(!request.groups.length&&request.article===null&&!request.reference))return [];
 const {groups,context,documentId,article,reference}=request;
 const indexed=libraryIndex(data);
 const waterContext=request.significant.some(word=>['asada','agua','potable','acueducto'].includes(libraryStem(word)));
 const contractingContext=request.significant.some(word=>['sicop','contratacion','compra','adquisicion'].includes(libraryStem(word)));
 const asadaContext=request.significant.some(word=>libraryStem(word)==='asada');
 // A document reference alone opens its first indexed page.
 if(reference&&article===null&&!groups.length){
  const row=indexed.find(r=>r.document?.id===reference&&!r.document.historical);
  return row?[{...row.chunk,document:row.document,score:0,matches:0,matchedTerms:[]}]:[];
 }
 return indexed.flatMap(row=>{
  const c=row.chunk,d=row.document;
  if(!d||d.historical||(documentId&&c.doc!==documentId)||(article!==null&&c.article!==article))return [];
  if(!documentId&&article===null&&waterContext&&!contractingContext&&d.category==='contratacion')return [];
  const matches=groups.map(group=>libraryMatch(row,group));
  if(matches.some(m=>!m))return [];
  const direct=matches.filter(m=>m.direct).length,leading=matches.filter(m=>m.leading).length;
  const leadingPhrases=matches.filter(m=>m.leadingPhrase).length;
  const headingMatches=matches.filter(m=>m.heading).length;
  const positions=matches.map(m=>m.position);
  const proximity=positions.length>1?Math.max(0,6-(Math.max(...positions)-Math.min(...positions))/65):0;
  const contextMatches=context.filter(g=>libraryMatch(row,g)).length;
  const title=' '+libraryKey(d.title)+' ';
  const topicInTitle=groups.filter(g=>g.variants.some(t=>libraryFind(title,t)>=0)).length;
  const contextualTitle=context.filter(g=>g.variants.some(t=>libraryFind(title,t)>=0)).length;
  const phrase=groups.length>1?libraryFind(row.body,groups.map(g=>g.term).join(' '))>=0:false;
  // Exact concepts outrank synonyms alone; the leading title and nearby mentions break ties.
  const proceduralHeading=request.procedural&&/\b(?:solicitud|requisito|admisibilidad|tramite|procedimiento)\b/.test(row.heading);
  const score=direct*7+leading*5+headingMatches*5+leadingPhrases*3+proximity+topicInTitle*5+contextMatches+contextualTitle*2+(asadaContext&&d.id==='asadas'?12:0)+(phrase?8:0)+(proceduralHeading?15:0)
   +(c.article!==null?.5:0)-Math.log1p(row.length)*.4;
  return [{...c,document:d,score,matches:groups.length,matchedTerms:matches.flatMap(m=>m.variants)}];
 }).sort((a,b)=>b.score-a.score||a.doc.localeCompare(b.doc)||a.page-b.page);
}
function libraryExcerpt(text,terms=[],max=750){
 const words=[...text.matchAll(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+/g)].map(m=>({key:libraryStem(libraryFold(m[0])),start:m.index,end:m.index+m[0].length}));
 const unique=[...new Set(terms)],spans=[];
 for(const term of unique){
  const parts=term.split(' ');
  for(let i=0;i<=words.length-parts.length;i++){
   if(parts.every((part,j)=>words[i+j].key===part))spans.push({start:words[i].start,end:words[i+parts.length-1].end,term});
  }
 }
 spans.sort((a,b)=>a.start-b.start||b.end-a.end);
 let start=0,best=0;
 for(const span of spans){
  const candidate=Math.max(0,span.start-100);
  const score=new Set(spans.filter(s=>s.start>=candidate&&s.end<=candidate+max).map(s=>s.term)).size;
  if(score>best){best=score;start=candidate;}
 }
 if(start>0){const space=text.indexOf(' ',start);if(space>=0)start=space+1;}
 let end=Math.min(text.length,start+max);
 if(end<text.length){const space=text.lastIndexOf(' ',end);if(space>start)end=space;}
 const merged=[];
 for(const span of spans.filter(s=>s.start>=start&&s.end<=end)){
  const last=merged.at(-1);
  if(last&&span.start<=last.end)last.end=Math.max(last.end,span.end);
  else merged.push({...span});
 }
 let html=start?'… ':'',cursor=start;
 for(const span of merged){
  html+=libraryEscape(text.slice(cursor,span.start))+'<mark>'+libraryEscape(text.slice(span.start,span.end))+'</mark>';
  cursor=span.end;
 }
 return html+libraryEscape(text.slice(cursor,end))+(end<text.length?' …':'');
}
if(typeof document!=='undefined'){
 document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('library-form');if(!form)return;
  const data={documents:[...NORMATIVA_DATA.documents],chunks:[...NORMATIVA_DATA.chunks]},query=document.getElementById('library-query'),docFilter=document.getElementById('library-document'),article=document.getElementById('library-article'),status=document.getElementById('library-status'),results=document.getElementById('library-results'),more=document.getElementById('library-more');
  let hits=[],shown=0;
  const catalog=document.getElementById('library-catalog'),searchView=document.getElementById('library-search-view'),docsView=document.getElementById('library-docs-view');
  function showDocs(active){
   document.getElementById('library-search-panel').hidden=active;document.getElementById('library-docs-panel').hidden=!active;
   for(const [btn,on] of [[searchView,!active],[docsView,active]]){btn.setAttribute('aria-pressed',String(on));btn.classList.toggle('primary',on);btn.classList.toggle('outline',!on);}
  }
  searchView.addEventListener('click',()=>showDocs(false));docsView.addEventListener('click',()=>showDocs(true));
  function addOption(d){const opt=document.createElement('option');opt.value=d.id;opt.textContent=d.title;docFilter.append(opt);}
  function renderCatalog(){const cards=docs=>docs.map(d=>`<article class="library-doc"><p class="library-badge">${d.local?'PDF DE ESTA SESIÓN':d.category==='contratacion'?'REFERENCIA DE CONTRATACIÓN':'COPIA DE CONSULTA'}</p><h3>${libraryEscape(d.title)}</h3><p>${libraryEscape(d.number||'')}${d.version?' · Versión '+libraryEscape(d.version):''}<br>${d.pages} páginas${d.date?' · Copia del '+libraryEscape(d.date):d.edition?' · '+libraryEscape(d.edition):''}</p><a href="${libraryEscape(d.url)}" target="_blank" rel="noopener">Abrir PDF</a> · <a href="${libraryEscape(d.url)}" download="${libraryEscape(d.filename||d.id+'.pdf')}">Descargar PDF</a></article>`).join('');catalog.innerHTML=cards(data.documents.filter(d=>d.category!=='contratacion'));document.getElementById('library-contracting-catalog').innerHTML=cards(data.documents.filter(d=>d.category==='contratacion'));}
  data.documents.forEach(addOption);renderCatalog();
  const upload=document.getElementById('library-upload'),uploadStatus=document.getElementById('library-upload-status');
  upload.addEventListener('submit',async e=>{
   e.preventDefault();const file=document.getElementById('library-file').files[0],button=upload.querySelector('button');
   if(!file||!file.name.toLowerCase().endsWith('.pdf')||file.size>20*1024*1024){uploadStatus.textContent='Seleccione un PDF de hasta 20 MB.';return;}
   if(data.documents.filter(d=>d.local).length>=5){uploadStatus.textContent='Puede agregar hasta cinco PDF por sesión.';return;}
   button.disabled=true;uploadStatus.textContent='Leyendo el PDF…';let task;
   try{
    const pdfjs=await import('/vendor/abonados/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc='/vendor/abonados/pdf.worker.min.mjs';
    task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});const pdf=await task.promise;
    if(pdf.numPages>200)throw Error('El PDF supera las 200 páginas.');
    const id='sesion-'+data.documents.length,parts=[];let number=null;
    for(let page=1;page<=pdf.numPages;page++){
     const p=await pdf.getPage(page),content=await p.getTextContent(),text=content.items.map(x=>(x.str||'')+(x.hasEOL?'\n':' ')).join('');
     for(const section of text.split(/(?=^[ \t]*art[ií]culo[ \t]+\d+[ \t]*(?:[º°.:–-]|$))/im)){
      const clean=section.trim().replace(/\s+/g,' ');if(!clean)continue;
      const found=clean.match(/^art[ií]culo\s+(\d+)/i);if(found)number=Number(found[1]);
      parts.push({doc:id,page,label:number===null?'Texto del documento':'Artículo '+number,article:number,text:clean});
     }
     p.cleanup();
    }
    if(!parts.some(p=>libraryTokens(p.text).length>=3))throw Error('No se encontró texto suficiente. Use un PDF con texto seleccionable.');
    const d={id,title:file.name.replace(/\.pdf$/i,''),filename:file.name,url:URL.createObjectURL(file),pages:pdf.numPages,local:true};
    data.documents.push(d);data.chunks.push(...parts);addOption(d);renderCatalog();upload.reset();uploadStatus.textContent='PDF agregado. Ya puede consultarlo desde el buscador.';
   }catch(error){uploadStatus.textContent=error instanceof Error?error.message:'No fue posible leer el PDF.';}
   finally{button.disabled=false;if(task)await task.destroy().catch(()=>{});}
  });
  function renderMore(){const subset=hits.slice(shown,shown+12);shown+=subset.length;results.insertAdjacentHTML('beforeend',subset.map(c=>`<article class="library-result"><p class="library-badge">${libraryEscape(c.document.number||'PDF DE ESTA SESIÓN')}</p><h3>${libraryEscape(c.label)} · Página ${c.page}</h3><p class="library-source">${libraryEscape(c.document.title)}</p><blockquote>${libraryExcerpt(c.text,c.matchedTerms)}</blockquote><details><summary>Leer el texto de este segmento</summary><p class="library-full">${libraryEscape(c.text)}</p></details><a href="${c.document.url}#page=${c.page}" target="_blank" rel="noopener">Ver página ${c.page} en el PDF original<span class="sr-only"> de ${libraryEscape(c.document.title)}</span></a></article>`).join(''));more.hidden=shown>=hits.length;status.textContent=hits.length?`${hits.length} fragmento${hits.length===1?'':'s'} encontrado${hits.length===1?'':'s'}. Mostrando ${shown}.`:'No encontramos fragmentos que reúnan los conceptos de su consulta. Pruebe menos palabras, revise los filtros o agregue el documento correspondiente.';}
  function search(){results.innerHTML='';shown=0;more.hidden=true;if(!libraryTokens(query.value).length&&article.value===''){status.textContent='Escriba una pregunta, un tema o un número de artículo para comenzar.';hits=[];return;}const filters={documentId:docFilter.value,article:article.value};if(libraryNormalizeQuery(data,query.value,filters).invalid){hits=[];status.textContent='La referencia o el artículo no coincide con los filtros seleccionados. Revise ambos campos.';return;}hits=librarySearch(data,query.value,filters);renderMore();}
  form.addEventListener('submit',e=>{e.preventDefault();search();});more.addEventListener('click',renderMore);
  for(const filter of [docFilter,article])filter.addEventListener('change',()=>{if(query.value.trim()||article.value||hits.length)search();});
  query.addEventListener('input',()=>{results.innerHTML='';more.hidden=true;hits=[];shown=0;status.textContent=query.value.trim()?'Pulse «Buscar información» para consultar los documentos.':'Escriba un tema o indique un artículo para comenzar.';});
  document.getElementById('library-clear').addEventListener('click',()=>{form.reset();hits=[];shown=0;results.innerHTML='';more.hidden=true;status.textContent='Escriba un tema o indique un artículo para comenzar.';query.focus();});
 });
}

if (typeof document !== 'undefined') {
 document.addEventListener('DOMContentLoaded', async () => {
  if (!document.getElementById('example-return')) return;
  const panel = document.getElementById('library-example');
  try {
   const script = document.createElement('script');
   script.src = '/assets/jspdf.umd.min.js';
   const ready = new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
   });
   document.head.append(script);
   const [{showExampleDocuments}] = await Promise.all([import('./asada-ejemplo.js?v=2'), ready]);
   showExampleDocuments(panel);
  } catch {
   panel.append('No se pudieron cargar los documentos del ejemplo.');
   panel.hidden = false;
  }
 });
}
