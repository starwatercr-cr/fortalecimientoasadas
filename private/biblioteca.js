/* Local PDF index: queries never leave this page. */
function libraryFold(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function libraryEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function libraryTokens(query){return [...new Set(libraryFold(query).match(/[a-z0-9]+/g)||[])].filter(t=>!['de','del','la','las','el','los','y','en','para','por','un','una','que','al'].includes(t));}
function librarySearch(data,query,{documentId='',article='',historical=false}={}){
 const tokens=libraryTokens(query),n=article===''?null:Number(article);
 if(!tokens.length&&n===null)return [];
 const docs=new Map(data.documents.map(d=>[d.id,d]));
 return data.chunks.filter(c=>{const d=docs.get(c.doc);return d&&(!d.historical||historical)&&(!documentId||c.doc===documentId)&&(n===null||c.article===n)&&tokens.every(t=>libraryFold(c.text).includes(t));}).map(c=>{
  const norm=libraryFold(c.text),positions=tokens.map(t=>norm.indexOf(t));
  return {...c,document:docs.get(c.doc),score:tokens.reduce((sum,t)=>sum+(libraryFold(c.label).includes(t)?5:0),0)+(positions.length?1/(1+Math.max(...positions)):0)};
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
  const data=NORMATIVA_DATA,query=document.getElementById('library-query'),docFilter=document.getElementById('library-document'),article=document.getElementById('library-article'),history=document.getElementById('library-history'),status=document.getElementById('library-status'),results=document.getElementById('library-results'),more=document.getElementById('library-more');
  let hits=[],shown=0,tokens=[];
  for(const d of data.documents){const opt=document.createElement('option');opt.value=d.id;opt.textContent=d.title;docFilter.append(opt);}
  document.getElementById('library-catalog').innerHTML=data.documents.map(d=>`<article class="library-doc${d.historical?' library-historic':''}"><p class="library-badge">${d.historical?'DEROGADO · CONSULTA HISTÓRICA':'COPIA APORTADA'}</p><h3>${libraryEscape(d.title)}</h3><p>${libraryEscape(d.number)} · Versión ${libraryEscape(d.version)}<br>${d.pages} páginas · Generado el ${d.date}</p><p>${d.historical?'La primera página identifica la derogación. Consúltelo únicamente como antecedente.':'El archivo indica «última versión de la norma». Confirme reformas posteriores antes de aplicarlo.'}</p><a href="${d.url}" target="_blank" rel="noopener">Abrir PDF completo<span class="sr-only"> de ${libraryEscape(d.title)}</span></a> · <a href="${d.url}" download>Descargar PDF<span class="sr-only"> de ${libraryEscape(d.title)}</span></a></article>`).join('');
  function renderMore(){const subset=hits.slice(shown,shown+12);shown+=subset.length;results.insertAdjacentHTML('beforeend',subset.map(c=>`<article class="library-result"><p class="library-badge">${libraryEscape(c.document.number)}${c.document.historical?' · DEROGADO':''}</p><h3>${libraryEscape(c.label)} · Página ${c.page}</h3><p class="library-source">${libraryEscape(c.document.title)}</p>${c.document.historical?'<p class="library-historic-note">Antecedente histórico: este reglamento está marcado como derogado.</p>':''}<blockquote>${libraryExcerpt(c.text,tokens)}</blockquote><details><summary>Leer el texto de este segmento</summary><p class="library-full">${libraryEscape(c.text)}</p></details><a href="${c.document.url}#page=${c.page}" target="_blank" rel="noopener">Ver página ${c.page} en el PDF original<span class="sr-only"> de ${libraryEscape(c.document.title)}</span></a></article>`).join(''));more.hidden=shown>=hits.length;status.textContent=hits.length?`${hits.length} fragmento${hits.length===1?'':'s'} encontrado${hits.length===1?'':'s'}. Mostrando ${shown}. ${history.checked?'Se incluyen documentos históricos.':'El reglamento derogado está excluido.'}`:'No encontramos fragmentos con todos esos criterios. Pruebe menos palabras, cambie el documento o quite el número de artículo.';}
  function search(){results.innerHTML='';shown=0;more.hidden=true;if(!history.checked&&docFilter.value==='servicios-historico'){status.textContent='Este archivo está marcado como derogado. Active «Incluir el reglamento de AyA marcado como derogado» para consultar sus antecedentes.';hits=[];return;}tokens=libraryTokens(query.value);if(!tokens.length&&article.value===''){status.textContent='Escriba una palabra del tema o indique un número de artículo para comenzar.';hits=[];return;}hits=librarySearch(data,query.value,{documentId:docFilter.value,article:article.value,historical:history.checked});renderMore();}
  form.addEventListener('submit',e=>{e.preventDefault();search();});more.addEventListener('click',renderMore);
  for(const filter of [docFilter,history,article])filter.addEventListener('change',()=>{if(query.value.trim()||article.value||hits.length)search();});
  query.addEventListener('input',()=>{if(shown){results.innerHTML='';more.hidden=true;hits=[];shown=0;status.textContent='La búsqueda cambió. Pulse «Buscar información» para actualizar los resultados.';}});
  document.getElementById('library-clear').addEventListener('click',()=>{form.reset();hits=[];shown=0;results.innerHTML='';more.hidden=true;status.textContent='Escriba un tema o indique un artículo para comenzar.';query.focus();});
 });
}
