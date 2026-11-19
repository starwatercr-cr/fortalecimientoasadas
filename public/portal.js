(() => {
 const $=id=>document.getElementById(id),message=$('portal-message');
 const returnAreas={finanzas:'Finanzas',agua:'Agua y operación',cobros:'Abonados y cobros',junta:'Junta Directiva y planificación',consulta:'Organización y consultas'};
 const returnArea=new URLSearchParams(location.search).get('volverArea');
 if(Object.hasOwn(returnAreas,returnArea)){
  const updateReturnLinks=()=>document.querySelectorAll('a[href]').forEach(link=>{
   const url=new URL(link.href,location.href);
   if(url.origin!==location.origin||!['/herramientas.html','/herramientas'].includes(url.pathname)||!/^\s*←?\s*volver a (?:las )?herramientas\b/i.test(link.textContent))return;
   url.searchParams.set('area',returnArea);
   link.href=url.href;
   link.textContent='← Volver a '+returnAreas[returnArea];
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateReturnLinks,{once:true});else updateReturnLinks();
 }
 function notify(text){if(message)message.textContent=text;}
 async function api(route,body){const res=await fetch('/api/'+route,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});let data;try{data=await res.json();}catch{throw new Error('No pudimos conectar con la plataforma. Revise que el acceso privado esté configurado.');}if(!res.ok)throw new Error(data.error||'No fue posible completar la operación.');return data;}
 const fields=form=>Object.fromEntries(new FormData(form));
 async function submit(form,route,transform=x=>x,after=()=>{}){const button=form.querySelector('[type=submit]');button.disabled=true;notify('Procesando…');try{await api(route,transform(fields(form)));await after();}catch(e){notify(e.message);}finally{button.disabled=false;}}
 const trialMode=new URLSearchParams(location.search).get('prueba');
 if(trialMode==='registro'&&$('trial-registration')){
  $('trial-registration').hidden=false;$('portal-login-form').hidden=true;$('trial-access-link').hidden=true;
  document.querySelector('h1').textContent='Conozca lo que su ASADA puede lograr.';$('access-intro').textContent='Pruebe las herramientas antes de contratar.';
  $('trial-register-form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('[type=submit]'),m=$('trial-message');b.disabled=true;m.textContent='Preparando su acceso…';try{const d=fields(f);if(d.password!==d.repeat)throw new Error('Las contraseñas no coinciden.');const r=await api('trial-register',{...d,accept:f.elements.accept.checked,rights:f.elements.rights.checked,termsVersion:'2026-10-07-v1'});f.elements.password.value='';f.elements.repeat.value='';if(r.ready){location.assign('/condiciones-prueba.html');return;}m.textContent=r.message;f.querySelectorAll('input,select,button').forEach(x=>x.disabled=true);}catch(err){m.textContent=err.message;b.disabled=false;}});return;
 }
 if(trialMode==='vencida'&&$('trial-expired')){$('trial-expired').hidden=false;$('trial-access-link').hidden=true;notify('Su prueba gratuita ha terminado. Puede contratar para continuar.');}
 const login=$('portal-login-form');
 if(login){const next=new URLSearchParams(location.search).get('return');const allowed=['/uso-plataforma.html','/decision-center.html','/morosidad.html','/nuestra-asada.html','/bodega.html','/operacion.html','/equipo.html','/panel-gestion.html','/herramientas.html','/diagnostico.html','/nuestra-agua.html','/nuestras-finanzas.html','/asamblea.html','/calidad.html','/biblioteca.html'];const redirect=d=>location.replace(d.termsPending?'/condiciones-prueba.html':allowed.includes(next)?next:'/herramientas.html');const enter=async()=>redirect(await api('me'));let submitting=false;login.addEventListener('submit',e=>{e.preventDefault();submitting=true;submit(login,'login',x=>({...x,remember:login.elements.remember.checked}),()=>{login.elements.password.value='';return enter();}).finally(()=>{submitting=false;});});const fragment=new URLSearchParams(location.hash.slice(1)),token=fragment.get('access_token');
 if(token&&trialMode==='confirmada'){history.replaceState(null,'',location.pathname+'?prueba=confirmada');api('trial-confirm',{token}).then(enter).catch(e=>notify(e.message));}
 else{if(trialMode==='confirmada')notify('Correo confirmado. Ingrese con la contraseña que creó para comenzar.');if(fragment.get('error_description')){notify('El enlace de confirmación venció o no es válido. Contacte a Star Water.');history.replaceState(null,'',location.pathname);}api('me').then(d=>{if(!submitting)redirect(d);}).catch(()=>{});}return;}
 const context=new URLSearchParams(location.search);if(context.get('from')==='centro'){const host=document.querySelector('.portal-session>div');if(host){const back=document.createElement('a');back.className='button primary';back.textContent='Volver al Centro de decisiones';back.href='/decision-center.html?'+new URLSearchParams({asada:context.get('asada')||'',year:context.get('year')||'',month:context.get('month')||''});host.prepend(back);}}
 $('portal-logout')?.addEventListener('click',async()=>{try{await api('logout',{});location.assign('/acceso.html');}catch(e){notify(e.message);}});
 $('portal-password-form')?.addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget;submit(f,'password',x=>{if(x.password!==x.repeat)throw new Error('Las contraseñas no coinciden.');return {password:x.password};},()=>{f.reset();notify('Su contraseña se actualizó.');});});
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const trialExpired=x=>x.access_kind==='trial'&&(!Number.isFinite(Date.parse(x.trial_ends_at))||Date.parse(x.trial_ends_at)<=Date.now());
 const accessSwitch=(id,kind,on,label)=>`<button class="button outline" type="button" role="switch" aria-checked="${on}" aria-label="Acceso de ${safe(label)}" data-id="${safe(id)}" data-kind="${kind}" data-active="${on}"><svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true" style="vertical-align:middle;margin-inline-end:.5em"><rect width="44" height="24" rx="12" fill="${on?'#087755':'#616c75'}"/><circle cx="${on?32:12}" cy="12" r="8" fill="white"/></svg>${on?'Desactivar':'Activar'}</button>`;

 const adminList=$('portal-asadas-list');
 async function loadAdmin(openId){
  const d=await api('admin-list');
  const open=new Set([...adminList.querySelectorAll('details[open]')].map(x=>x.dataset.asada));
  if(openId)open.add(openId);
  const members=new Map();
  for(const member of d.members){
   if(!members.has(member.asada_id))members.set(member.asada_id,[]);
   members.get(member.asada_id).push(member);
  }
  adminList.innerHTML=d.asadas.map(x=>{
   const expired=trialExpired(x),on=x.active&&!expired,trial=x.access_kind==='trial';
   const detail=trial?(expired?'Prueba vencida · Activar concede 5 días':'En prueba · vence '+new Date(x.trial_ends_at).toLocaleString('es-CR',{timeZone:'America/Costa_Rica'})):'Contratada';
   const team=members.get(x.id)||[];
   return `<article class="water-panel">
    <div class="portal-access-row"><div><h3>${safe(x.name)}</h3><p>${on?'Activa':'Inactiva'} · ${safe(detail)}</p></div>${accessSwitch(x.id,'asada',on,x.name)}</div>
    <details data-asada="${safe(x.id)}"${open.has(x.id)?' open':''}>
     <summary><strong>Usuarios (${team.length})</strong></summary>
     ${team.length?'<ul>'+team.map(m=>`<li><strong>${safe(m.full_name||m.email)}</strong> · ${safe(m.role)} · ${safe(m.email)}${m.active?'':' · Suspendida'}</li>`).join('')+'</ul>':'<p>Todavía no hay usuarios.</p>'}
     <form data-add-user>
      <input type="hidden" name="asada" value="${safe(x.id)}">
      <label>Nombre completo<input name="name" minlength="3" maxlength="120" required></label>
      <label>Correo electrónico<input name="email" type="email" maxlength="254" required></label>
      <label>Función<select name="role"><option>Administración</option><option>Junta Directiva</option><option>Operación</option></select></label>
      <label>Contraseña inicial<input name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label>
      <button class="button primary" type="submit">Agregar usuario</button>
      <p role="status"></p>
     </form>
     ${trial?'<button class="button outline" type="button" data-convert="'+safe(x.id)+'">Pasar a contratada</button>':''}
    </details>
   </article>`;
  }).join('')||'<p>Aún no hay ASADAS registradas.</p>';
 }
 let accessSaving=false;
 adminList?.addEventListener('click',async e=>{
  const btn=e.target.closest('button[data-id],button[data-convert]');
  if(!btn||accessSaving)return;
  const convert=btn.dataset.convert,target=convert||btn.dataset.id,active=btn.dataset.active!=='true';
  if(convert&&!confirm('¿Confirmás la contratación de esta ASADA? Conserva sus usuarios y registros.'))return;
  accessSaving=true;btn.disabled=true;
  try{
   const result=convert?await api('admin-trial-convert',{id:target,confirm:true}):await api('admin-toggle',{id:target,kind:'asada',active});
   await loadAdmin();
   [...adminList.querySelectorAll('button[data-id]')].find(x=>x.dataset.id===target)?.focus({preventScroll:true});
   notify(convert?'ASADA contratada y activa.':result.renewed?'Prueba reactivada por 5 días.':active?'ASADA activada.':'ASADA desactivada.');
  }catch(err){notify(err.message);btn.disabled=false;}
  finally{accessSaving=false;}
 });
 adminList?.addEventListener('submit',async e=>{
  const f=e.target.closest('form[data-add-user]');if(!f)return;
  e.preventDefault();if(accessSaving)return;
  const btn=f.querySelector('button[type=submit]'),status=f.querySelector('[role=status]'),data=fields(f);
  accessSaving=true;btn.disabled=true;status.textContent='Guardando…';
  try{
   await api('admin-user',data);
   f.reset();
   await loadAdmin(data.asada);
   const opened=[...adminList.querySelectorAll('details')].find(x=>x.dataset.asada===data.asada);
   if(opened){opened.querySelector('[role=status]').textContent='Usuario agregado. Compartí su contraseña por un medio seguro.';opened.querySelector('input[name=name]').focus({preventScroll:true});}
  }catch(err){status.textContent=err.message;}
  finally{accessSaving=false;btn.disabled=false;}
 });
 $('portal-asada-form')?.addEventListener('submit',e=>{
  e.preventDefault();const f=e.currentTarget,button=f.querySelector('[type=submit]');
  if(accessSaving)return;
  accessSaving=true;button.disabled=true;
  (async()=>{
   try{
    const result=await api('admin-asada',fields(f));f.reset();
    f.closest('details').open=false;
    await loadAdmin(result.asada?.id);notify('ASADA registrada. Ya podés agregar sus usuarios.');
    [...adminList.querySelectorAll('details')].find(x=>x.dataset.asada===result.asada?.id)?.querySelector('input[name=name]').focus();
   }catch(err){notify(err.message);}
   finally{accessSaving=false;button.disabled=false;}
  })();
 });
 api('me').then(async who=>{if(who.termsPending){location.replace('/condiciones-prueba.html');return;}import('/tools-catalog.js?v=70').then(m=>m.rememberVisit(who,location.pathname,undefined,location.search)).catch(()=>{});if(who.admin){const host=document.querySelector('.portal-session>div')||document.querySelector('.portal-session');if(host&&!host.querySelector('[href="uso-plataforma.html"]')){const a=document.createElement('a');a.href='uso-plataforma.html';a.className='button primary';a.textContent='Uso de la plataforma';host.prepend(a);}}else if(who.asada&&location.pathname!=='/condiciones-prueba.html'){import('/usage-tracker.js').then(m=>m.startUsageTracker()).catch(()=>{});}if(who.admin||who.role==='Administración'){const host=document.querySelector('.portal-session>div')||document.querySelector('.portal-session');if(host&&!host.querySelector('[href="accesos.html"]')){const a=document.createElement('a');a.href='accesos.html';a.className='button outline';a.textContent='Usuarios y permisos';host.prepend(a);}}if(who.external){const mapping={'planes.html':'planes','abonados.html':'abonados','panel-gestion.html':'panel','nuestras-finanzas.html':'panel','nuestra-agua.html':'agua','bodega.html':'bodega','asamblea.html':'asamblea','calidad.html':'calidad','biblioteca.html':'biblioteca','diagnostico.html':'diagnostico','morosidad.html':'morosidad','operacion.html':'operacion'};document.querySelector('.tools-decision')?.setAttribute('hidden','');document.querySelectorAll('.tool-card').forEach(card=>{const href=card.querySelector('a.button')?.getAttribute('href')?.split('?')[0];if(!who.modules.includes(mapping[href]))card.hidden=true;});const info=document.createElement('p');info.className='water-panel';info.textContent='Acceso externo de consulta · '+(who.fullName||who.email)+' · vence '+new Date(who.expires).toLocaleString('es-CR');document.querySelector('main')?.prepend(info);}if(who.asada?.access_kind==='trial'){
 const banner=document.createElement('aside');banner.className='trial-banner';banner.setAttribute('aria-label','Prueba gratuita');
 const label=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('p'),link=document.createElement('a');title.textContent='Está explorando la plataforma · Prueba gratuita';label.append(title,detail);link.className='button primary';link.textContent='Consultar para contratar';link.href='https://wa.me/50673006172?text='+encodeURIComponent('Hola, quisiera contratar la plataforma para '+who.asada.name+'.');banner.append(label,link);document.querySelector('main')?.prepend(banner);
 const update=()=>{const left=Date.parse(who.asada.trial_ends_at)-Date.now();if(left<=0){location.replace('/acceso.html?prueba=vencida');return;}const hours=Math.ceil(left/3600000);detail.textContent='Le quedan aproximadamente '+hours+' horas. Vence el '+new Date(who.asada.trial_ends_at).toLocaleString('es-CR')+'. Sus registros pertenecen a su espacio privado.';};update();setInterval(update,60000);
 }
if($('profile-quick-info')&&who.asada){try{const d=await api('profile-data?asada='+encodeURIComponent(who.asada.id)),p=d.profile?.payload;if(p){$('profile-quick-info').textContent=[p.name,'Presidencia: '+(p.president||'por completar'),'Servicios activos: '+(p.users??'por confirmar'),[p.district,p.canton,p.province].filter(Boolean).join(', ')].filter(Boolean).join(' · ');}}catch{$('profile-quick-info').textContent='Abra Nuestra ASADA para consultar o completar la ficha.';}}if($('team-tool-card'))$('team-tool-card').hidden=!(who.admin||who.role==='Administración');if($('portal-user-label'))$('portal-user-label').textContent=who.admin?'Star Water · '+who.email:who.asada.name+' · '+who.role+' · '+who.email;if($('portal-admin-link'))$('portal-admin-link').hidden=!who.admin;if($('portal-admin')){if(!who.admin){notify('El control de accesos corresponde a Star Water.');return;}$('portal-admin').hidden=false;await loadAdmin();notify('Accesos listos para administrar.');}}).catch(e=>{notify(e.message);});
})();
