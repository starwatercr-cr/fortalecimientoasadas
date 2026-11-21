const types={disponibilidad:'Disponibilidad de agua',negativa:'Negativa de agua',proyecto:'Proyecto de agua'};
const labels={name:'Nombre',email:'Correo',phone:'Teléfono',location:'Ubicación',description:'Consulta',use:'Uso previsto',operator:'Operador o entidad',responseDate:'Fecha de respuesta',reason:'Motivo',projectType:'Tipo de proyecto',stage:'Etapa',units:'Unidades'};
const list=document.getElementById('requests'), notice=document.getElementById('status'), more=document.getElementById('more');
const requested=new URLSearchParams(location.search).get('caso');
let offset=0;

async function api(action, input){
  const response=await fetch('/api/client-request-'+action,input ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)} : {});
  const result=await response.json();
  if(!response.ok) throw Error(result.error);
  return result;
}

function render(row){
  const article=document.getElementById('request').content.firstElementChild.cloneNode(true);
  article.querySelector('h2').textContent=types[row.kind];
  article.querySelector('[data-case]').textContent='Caso 6009-'+row.case_number+' · '+new Date(row.created_at).toLocaleString('es-CR',{timeZone:'America/Costa_Rica'})+' · '+(row.notified_at?'Aviso enviado':'Sin aviso enviado');
  const details=article.querySelector('dl');
  for (const [key,label] of Object.entries(labels)){
    if(!row.details[key]) continue;
    const term=document.createElement('dt'), description=document.createElement('dd');
    term.textContent=label;
    description.textContent=row.details[key];
    details.append(term,description);
  }
  if(row.attachment_type){
    const file=article.querySelector('[data-file]');
    file.hidden=false;
    file.href='/api/client-request-file?id='+encodeURIComponent(row.id);
  }
  const form=article.querySelector('form');
  form.elements.status.value=row.status;
  form.elements.identification.value=row.identification||'';
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
      message.textContent='Cambios guardados.';
    }catch(error){message.textContent=error.message;}
    finally{button.disabled=false;}
  });
  list.append(article);
}

async function load(){
  more.disabled=true;
  notice.textContent='Cargando solicitudes…';
  try{
    const query=requested?'id='+encodeURIComponent(requested):'offset='+offset;
    const result=await api('list?'+query);
    for(const row of result.rows) render(row);
    notice.textContent=list.children.length?'':'No hay solicitudes para mostrar.';
    more.hidden=result.next===null;
    offset=result.next;
  }catch(error){notice.textContent=error.message;}
  finally{more.disabled=false;}
}
more.addEventListener('click',load);
load();
