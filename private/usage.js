const $=id=>document.getElementById('usage-'+id),safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const minutes=s=>Number(s)/60,format=s=>minutes(s).toLocaleString('es-CR',{maximumFractionDigits:1})+' min';
const crDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const dateBack=(day,n)=>new Date(Date.parse(day+'T12:00:00Z')-n*86400000).toISOString().slice(0,10);
const timestamp=v=>new Date(v).toLocaleString('es-CR',{timeZone:'America/Costa_Rica',dateStyle:'short',timeStyle:'short'});
let members=[],report=null,loadedFilters=null,requestId=0;
async function api(route){const res=await fetch('/api/'+route,{credentials:'same-origin'});const d=await res.json();if(!res.ok)throw new Error(d.error||'No fue posible consultar la actividad.');return d;}
function status(s){$('status').textContent=s;}
function userOptions(){const chosen=$('user').value,asada=$('asada').value;$('user').innerHTML='<option value="">Todas las personas</option>'+members.filter(x=>!asada||x.asada_id===asada).map(x=>`<option value="${safe(x.user_id)}">${safe(x.full_name||x.email)}${x.active?'':' (suspendida)'}</option>`).join('');if([...$('user').options].some(x=>x.value===chosen))$('user').value=chosen;}
function filters(){return new URLSearchParams({start:$('start').value,end:$('end').value,asada:$('asada').value,user:$('user').value,kind:$('kind').value});}
function rangeDays(start,end){const values=[];for(let d=start;d<=end&&values.length<93;d=dateBack(d,-1))values.push(d);return values;}
function render(d){
 $('time').textContent=format(d.seconds);$('asadas').textContent=d.asadas;$('users').textContent=d.users;$('views').textContent=Number(d.views).toLocaleString('es-CR');
 const days=rangeDays(d.start,d.end).map(day=>d.days.find(x=>x.day===day)||{day,seconds:0,views:0}),max=Math.max(1,...days.map(x=>Number(x.seconds)));
 $('days').innerHTML='<div class="usage-bars">'+days.map(x=>`<button type="button" data-day="${x.day}" style="--bar:${Math.max(2,Number(x.seconds)/max*100)}%" title="${safe(x.day+' · '+format(x.seconds)+' · '+x.views+' aperturas')}" aria-label="${safe(x.day+' · '+format(x.seconds)+' · '+x.views+' aperturas')}"></button>`).join('')+'</div><div class="usage-dates"><span>'+safe(d.start)+'</span><span>'+safe(d.end)+'</span></div>';
 $('day-detail').textContent=d.days.length?'Tiempo activo aproximado, por día.':'Sin actividad registrada en este período.';
 const toolMax=Math.max(1,...d.tools.map(x=>Number(x.seconds)));
 $('tools').innerHTML=d.tools.length?'<div class="usage-tools">'+d.tools.map(x=>`<div class="usage-tool"><button data-tool="${safe(x.tool)}" type="button"><span class="usage-tool-top"><span>${safe(d.toolsCatalog[x.tool]||x.tool)}</span><strong>${format(x.seconds)}</strong></span><div class="usage-track"><i style="width:${Math.max(1,Number(x.seconds)/toolMax*100)}%"></i></div></button></div>`).join('')+'</div>':'<p class="usage-empty">Todavía no hay herramientas registradas en este período.</p>';
 $('tool-detail').textContent='';
 $('people').innerHTML=d.people.length?'<table><thead><tr><th>ASADA</th><th>Persona</th><th>Acceso</th><th>Tiempo activo</th><th>Aperturas</th><th>Última actividad en el período</th></tr></thead><tbody>'+d.people.map(x=>`<tr><td>${safe(x.asada_name)}</td><td><button class="usage-person" data-user="${safe(x.user_id)}" data-asada="${safe(x.asada_id)}">${safe(x.full_name||x.email)}</button><small>${safe(x.email)}</small><small>${safe(x.role)}</small></td><td><span class="usage-kind ${x.kind==='trial'?'trial':''}">${x.kind==='trial'?'Prueba de 3 días':'Contratado'}</span></td><td>${format(x.seconds)}</td><td>${Number(x.views).toLocaleString('es-CR')}</td><td>${safe(timestamp(x.last_seen))}</td></tr>`).join('')+'</tbody></table>':'<p class="usage-empty">No hay actividad registrada para estos filtros. Si acaba de publicar la actualización, los registros aparecerán cuando las personas utilicen sus herramientas.</p>';
 $('period').textContent='Datos del '+d.start+' al '+d.end+' · Horario de Costa Rica.';$('export').disabled=!d.people.length;
}
async function load(){
 const id=++requestId,q=filters();$('load').disabled=true;$('export').disabled=true;status('Consultando actividad…');
 try{const d=await api('usage-report?'+q);if(id!==requestId)return;report=d;loadedFilters=q;render(d);status(d.people.length?'Actividad actualizada. Los minutos son aproximados.':'Consulta completada. Aún no hay actividad para este período.');}
 catch(e){if(id===requestId){report=null;loadedFilters=null;status(e.message);$('export').disabled=true;}}
 finally{if(id===requestId)$('load').disabled=false;}
}
$('filter-form').addEventListener('submit',e=>{e.preventDefault();load();});$('asada').addEventListener('change',userOptions);
$('reset').addEventListener('click',()=>{$('end').value=crDate();$('start').value=dateBack(crDate(),29);$('asada').value='';$('kind').value='';$('user').value='';userOptions();load();});
$('month').addEventListener('click',()=>{$('end').value=crDate();$('start').value=crDate().slice(0,8)+'01';load();});
$('days').addEventListener('click',e=>{const day=e.target.closest('[data-day]')?.dataset.day;if(day&&report){const x=report.days.find(x=>x.day===day)||{seconds:0,views:0};$('day-detail').textContent=day+' · '+format(x.seconds)+' activos · '+x.views+' aperturas.';}});
$('tools').addEventListener('click',e=>{const tool=e.target.closest('[data-tool]')?.dataset.tool,x=report?.tools.find(x=>x.tool===tool);if(x)$('tool-detail').textContent=(report.toolsCatalog[tool]||tool)+' · '+format(x.seconds)+' activos · '+x.views+' aperturas.';});
$('people').addEventListener('click',e=>{const b=e.target.closest('[data-user]');if(b){$('asada').value=b.dataset.asada;userOptions();$('user').value=b.dataset.user;load();}});
// Escape spreadsheet formulas before exporting untrusted names/emails.
const csv=v=>'"'+String(/^[\s]*[=+@-]/.test(String(v))?"'"+v:v).replace(/"/g,'""')+'"';
$('export').addEventListener('click',()=>{if(!report||!loadedFilters)return;const rows=[['Desde',report.start,'Hasta',report.end],['ASADA','Persona','Correo','Función','Tipo de acceso','Minutos activos aproximados','Aperturas','Última actividad (Costa Rica)'],...report.people.map(x=>[x.asada_name,x.full_name,x.email,x.role,x.kind==='trial'?'Prueba':'Contratado',minutes(x.seconds).toFixed(1),x.views,timestamp(x.last_seen)])];const blob=new Blob(['\ufeff'+rows.map(r=>r.map(csv).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Uso_plataforma_'+report.start+'_'+report.end+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
(async()=>{try{const who=await api('me');if(!who.admin)throw new Error('Este panel es exclusivo para la administración de Star Water.');const options=await api('admin-list');members=options.members;$('asada').innerHTML='<option value="">Todas las ASADAS</option>'+options.asadas.map(x=>`<option value="${safe(x.id)}">${safe(x.name)}${x.access_kind==='trial'?' · Prueba':''}</option>`).join('');userOptions();$('content').hidden=false;$('end').value=crDate();$('start').value=dateBack(crDate(),29);await load();}catch(e){status(e.message);}})();
