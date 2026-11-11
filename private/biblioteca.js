/* Local PDF index: queries never leave this page. */
function libraryFold(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function libraryEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const libraryStop=new Set('a al alguna algun ante como con cual cuales cuando cuanto de del debo deben donde el ella en es esa ese esta este esto hacer hay la las le lo los me mi necesito o para por puede pueden puedo que quien se si sin sobre su tengo un una y'.split(' '));
const librarySynonyms=[
 ['pozo','perforacion','perforar','aguas subterraneas'],['permiso','licencia','autorizacion','requisito','tramite'],['hidrante','incendio','bomberos'],['cloro','desinfeccion','cloracion'],['corte','cortar','suspension','suspender','desconexion'],['morosidad','atraso','impago','mora','falta de pago'],['disponibilidad','constancia','factibilidad'],['abastecimiento','suministro','servicio de agua'],['junta directiva','directivos','directiva'],['cuota','tarifa','cobro'],['responsable','responsabilidad','corresponde','obligacion'],['analisis','muestreo','muestra','laboratorio'],['elige','elegir','eleccion','nombramiento','nombrar'],['encarga','responsable','responsabilidad','corresponde']
];
function libraryTokens(query){return [...new Set(libraryFold(query).match(/[a-z0-9]+/g)||[])].filter(t=>!libraryStop.has(t));}
const libraryStem=t=>t.length>4?t.replace(/(?:ces|es|s)$/,''):t;
const libraryTerms=text=>new Set((libraryFold(text).match(/[a-z0-9]+/g)||[]).map(libraryStem));
const libraryContains=(text,words,term)=>term.includes(' ')?text.includes(term):words.has(libraryStem(term));
function librarySearch(data,query,{documentId='',article=''}={}){
 const tokens=libraryTokens(query),n=article===''?null:Number(article);
 if(!tokens.length&&n===null)return [];
 const docs=new Map(data.documents.map(d=>[d.id,d]));
 const groups=tokens.map(t=>[...new Set(librarySynonyms.filter(g=>g.some(x=>x.split(' ').some(w=>libraryStem(w)===libraryStem(t)))).flat())]);
 return data.chunks.flatMap(c=>{
  const d=docs.get(c.doc);
  if(!d||d.historical||(documentId&&c.doc!==documentId)||(n!==null&&c.article!==n))return [];
  const norm=libraryFold(c.text),title=libraryFold(d.title),terms=libraryTerms(norm),titleTerms=libraryTerms(title);
  const lead=norm.slice(0,200),leadTerms=libraryTerms(lead);
  let score=0,matches=0;
  tokens.forEach((t,i)=>{const direct=libraryContains(norm,terms,t),alias=!direct&&groups[i].some(x=>libraryContains(norm,terms,x));
   if(direct||alias){matches++;score+=direct?4:1;if(libraryContains(lead,leadTerms,t)||groups[i].some(x=>libraryContains(lead,leadTerms,x)))score+=1.5;}
   if(libraryContains(title,titleTerms,t))score+=direct?3:1;
  });
  if(!matches&&n===null)return [];
  return [{...c,document:d,score:score+matches*matches+Number(c.article!==null)*.25-Math.log1p(c.text.length)/4,matches}];
 }).sort((a,b)=>b.score-a.score||a.doc.localeCompare(b.doc)||a.page-b.page);
}
function libraryExcerpt(text,tokens,max=750){
 const fold=libraryFold(text),positions=tokens.map(t=>fold.indexOf(t)).filter(x=>x>=0);
 let start=positions.length?Math.max(0,Math.min(...positions)-110):0;
 if(start>0){const space=text.indexOf(' ',start);if(space>=0)start=space+1;}
 let end=Math.min(text.length,start+max);if(end<text.length){const space=text.lastIndexOf(' ',end);if(space>start)end=space;}
 const excerpt=text.slice(start,end),normal=libraryFold(excerpt);let spans=[];
 for(const t of tokens){let at=normal.indexOf(t);while(at!==-1){spans.push([at,at+t.length]);at=normal.indexOf(t,at+t.length);}}
 spans.sort((a,b)=>a[0]-b[0]);const merged=[];for(const s of spans){const last=merged[merged.length-1];if(last&&s[0]<=last[1])last[1]=Math.max(last[1],s[1]);else merged.push([...s]);}
 let html=start?'… ':'';let cursor=0;for(const [a,b] of merged){html+=libraryEscape(excerpt.slice(cursor,a))+'<mark>'+libraryEscape(excerpt.slice(a,b))+'</mark>';cursor=b;}html+=libraryEscape(excerpt.slice(cursor))+(end<text.length?' …':'');return html;
}
if(typeof document!=='undefined'){
 document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('library-form');if(!form)return;
  const data={documents:[...NORMATIVA_DATA.documents],chunks:[...NORMATIVA_DATA.chunks]},query=document.getElementById('library-query'),docFilter=document.getElementById('library-document'),article=document.getElementById('library-article'),status=document.getElementById('library-status'),results=document.getElementById('library-results'),more=document.getElementById('library-more');
  let hits=[],shown=0,tokens=[];
  const catalog=document.getElementById('library-catalog'),searchView=document.getElementById('library-search-view'),docsView=document.getElementById('library-docs-view');
  function showDocs(active){
   document.getElementById('library-search-panel').hidden=active;document.getElementById('library-docs-panel').hidden=!active;
   for(const [btn,on] of [[searchView,!active],[docsView,active]]){btn.setAttribute('aria-pressed',String(on));btn.classList.toggle('primary',on);btn.classList.toggle('outline',!on);}
  }
  searchView.addEventListener('click',()=>showDocs(false));docsView.addEventListener('click',()=>showDocs(true));
  function addOption(d){const opt=document.createElement('option');opt.value=d.id;opt.textContent=d.title;docFilter.append(opt);}
  function renderCatalog(){catalog.innerHTML=data.documents.map(d=>`<article class="library-doc"><p class="library-badge">${d.local?'PDF DE ESTA SESIÓN':'COPIA DE CONSULTA'}</p><h3>${libraryEscape(d.title)}</h3><p>${libraryEscape(d.number||'')}${d.version?' · Versión '+libraryEscape(d.version):''}<br>${d.pages} páginas${d.date?' · Copia del '+libraryEscape(d.date):''}</p><a href="${libraryEscape(d.url)}" target="_blank" rel="noopener">Abrir PDF</a> · <a href="${libraryEscape(d.url)}" download="${libraryEscape(d.filename||d.id+'.pdf')}">Descargar PDF</a></article>`).join('');}
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
  function renderMore(){const subset=hits.slice(shown,shown+12);shown+=subset.length;results.insertAdjacentHTML('beforeend',subset.map(c=>`<article class="library-result"><p class="library-badge">${libraryEscape(c.document.number||'PDF DE ESTA SESIÓN')}</p><h3>${libraryEscape(c.label)} · Página ${c.page}</h3><p class="library-source">${libraryEscape(c.document.title)}</p><blockquote>${libraryExcerpt(c.text,tokens)}</blockquote><details><summary>Leer el texto de este segmento</summary><p class="library-full">${libraryEscape(c.text)}</p></details><a href="${c.document.url}#page=${c.page}" target="_blank" rel="noopener">Ver página ${c.page} en el PDF original<span class="sr-only"> de ${libraryEscape(c.document.title)}</span></a></article>`).join(''));more.hidden=shown>=hits.length;status.textContent=hits.length?`${hits.length} fragmento${hits.length===1?'':'s'} encontrado${hits.length===1?'':'s'}. Mostrando ${shown}.`:'No encontramos fragmentos relacionados. Pruebe otra forma de preguntar o revise los filtros.';}
  function search(){results.innerHTML='';shown=0;more.hidden=true;tokens=libraryTokens(query.value);if(!tokens.length&&article.value===''){status.textContent='Escriba una pregunta, un tema o un número de artículo para comenzar.';hits=[];return;}hits=librarySearch(data,query.value,{documentId:docFilter.value,article:article.value});renderMore();}
  form.addEventListener('submit',e=>{e.preventDefault();search();});more.addEventListener('click',renderMore);
  for(const filter of [docFilter,article])filter.addEventListener('change',()=>{if(query.value.trim()||article.value||hits.length)search();});
  query.addEventListener('input',()=>{if(shown){results.innerHTML='';more.hidden=true;hits=[];shown=0;status.textContent='La búsqueda cambió. Pulse «Buscar información» para actualizar los resultados.';}});
  document.getElementById('library-clear').addEventListener('click',()=>{form.reset();hits=[];shown=0;results.innerHTML='';more.hidden=true;status.textContent='Escriba un tema o indique un artículo para comenzar.';query.focus();});
 });
}
