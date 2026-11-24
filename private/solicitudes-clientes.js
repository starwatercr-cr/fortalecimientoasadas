const types={disponibilidad:'Disponibilidad de agua',negativa:'Negativa de agua',proyecto:'Proyecto de agua',fuente:'Inscripción de fuente o concesión'};
const labels={name:'Nombre de contacto',email:'Correo',phone:'Teléfono',location:'Ubicación',ownerName:'Nombre de la persona propietaria',ownerIdentification:'Identificación de la persona propietaria',legacyIdentification:'Identificación registrada anteriormente',description:'Consulta',use:'Uso previsto',operator:'Operador o entidad',responseDate:'Fecha de respuesta',reason:'Motivo',projectType:'Tipo de proyecto',stage:'Etapa',units:'Unidades',sourceProcedure:'Trámite',sourceType:'Tipo de fuente',sourceName:'Nombre de la fuente',sourceLocation:'Coordenadas o enlace de ubicación',sourceUse:'Uso previsto del agua',sourceFlow:'Caudal solicitado (L/s)',hasMeasurements:'Cuenta con aforos',interestedIdentification:'Cédula de la persona interesada',sourceDemand:'Detalle del aprovechamiento'};
const list=document.getElementById('requests'), notice=document.getElementById('status'), more=document.getElementById('more');
const requested=new URLSearchParams(location.search).get('caso');
const search=document.getElementById('request-search');
const detail=document.getElementById('request-detail');
const placeholder=document.getElementById('request-placeholder');
const entries=[];
let offset=0, selected=null;

const normalize=value=>String(value||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim();
function setBadge(badge,state){
  badge.textContent=state;
  badge.dataset.state=state;
}
function select(entry,focus=false){
  if(selected){
    selected.button.removeAttribute('aria-current');
    selected.article.hidden=true;
  }
  selected=entry;
  if(!entry.article) entry.article=render(entry);
  entry.article.hidden=false;
  entry.button.setAttribute('aria-current','true');
  placeholder.hidden=true;
  if(focus) entry.article.querySelector('h2').focus({preventScroll:!matchMedia('(max-width: 740px)').matches});
}
function filter(){
  const query=normalize(search.value);
  for(const entry of entries) entry.item.hidden=!entry.key.includes(query);
  return entries.some(entry=>!entry.item.hidden);
}
function add(row){
  const item=document.createElement('li'), button=document.createElement('button');
  button.type='button';
  button.className='requests-entry';
  const title=document.createElement('strong'), meta=document.createElement('span'), badge=document.createElement('span');
  title.textContent=row.details?.name||types[row.kind];
  meta.className='requests-entry-meta';
  meta.textContent='6009-'+row.case_number+' · '+types[row.kind];
  badge.className='requests-badge';
  setBadge(badge,row.status);
  button.append(title,meta,badge);
  item.append(button);
  list.append(item);
  const entry={row,item,button,badge,key:normalize(title.textContent+' '+meta.textContent)};
  entries.push(entry);
  button.addEventListener('click',()=>select(entry,true));
}
search.addEventListener('input',()=>{
  const found=filter();
  notice.textContent=found?'':entries.length?'No hay coincidencias en la lista.':'No hay solicitudes para mostrar.';
});

async function api(action, input){
  const response=await fetch('/api/client-request-'+action,input ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)} : {});
  const result=await response.json();
  if(!response.ok) throw Error(result.error);
  return result;
}

function render(entry){
  const {row}=entry;
  const article=document.getElementById('request').content.firstElementChild.cloneNode(true);
  article.querySelector('h2').textContent=types[row.kind];
  article.querySelector('[data-case]').textContent='Caso 6009-'+row.case_number+' · '+new Date(row.created_at).toLocaleString('es-CR',{timeZone:'America/Costa_Rica'});
  const badge=article.querySelector('[data-detail-status]');
  setBadge(badge,row.status);
  const documents=article.querySelector('.requests-documents');
  const documentTypes=row.negative_document_types || [];
  documents.hidden=!row.attachment_type&&!row.source_plan_type&&!documentTypes.length;
  documentTypes.forEach((_,index)=>{
    const number=index+1;
    const link=document.createElement('a');
    link.href='/api/client-request-file?document=negativa-'+number+'&id='+encodeURIComponent(row.id);
    link.textContent='Descargar documento '+number;
    documents.append(link);
  });
  const details=article.querySelector('dl');
  const values={...row.details,legacyIdentification:row.identification};
  for (const [key,label] of Object.entries(labels)){
    if(!values[key]) continue;
    const term=document.createElement('dt'), description=document.createElement('dd');
    term.textContent=label;
    description.textContent=values[key];
    details.append(term,description);
  }
  if(row.attachment_type){
    const file=article.querySelector('[data-file]');
    file.hidden=false;
    if(row.kind==='fuente') file.textContent='Descargar aforos';
    file.href='/api/client-request-file?id='+encodeURIComponent(row.id);
  }
  if(row.source_plan_type){
    const plan=article.querySelector('[data-plan]');
    plan.hidden=false;
    plan.href='/api/client-request-file?document=plano&id='+encodeURIComponent(row.id);
  }
  const form=article.querySelector('form');
  form.elements.status.value=row.status;
  if(row.appointment) form.elements.appointment.value=new Date(Date.parse(row.appointment)-21600000).toISOString().slice(0,16);
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const button=form.querySelector('button'), message=form.querySelector('[role=status]');
    button.disabled=true;
    message.textContent='Guardando…';
    try{
      const data=Object.fromEntries(new FormData(form));
      if(data.appointment) data.appointment+=':00-06:00';
      await api('update?id='+encodeURIComponent(row.id),data);
      setBadge(entry.badge,data.status);
      setBadge(badge,data.status);
      message.textContent='Cambios guardados.';
    }catch(error){message.textContent=error.message;}
    finally{button.disabled=false;}
  });
  detail.append(article);
  return article;
}

async function load(){
  more.disabled=true;
  notice.textContent='Cargando solicitudes…';
  try{
    const query=requested?'id='+encodeURIComponent(requested):'offset='+offset;
    const result=await api('list?'+query);
    for(const row of result.rows) add(row);
    const found=filter();
    if(!selected && found) select(entries.find(entry=>!entry.item.hidden));
    notice.textContent=found?'':entries.length?'No hay coincidencias en la lista.':'No hay solicitudes para mostrar.';
    more.hidden=result.next===null;
    offset=result.next;
  }catch(error){notice.textContent=error.message;}
  finally{more.disabled=false;}
}
more.addEventListener('click',load);
load();
