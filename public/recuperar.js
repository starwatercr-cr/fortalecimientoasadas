(() => {
 const fragment=new URLSearchParams(location.hash.slice(1));
 const token=fragment.get('type')==='recovery' ? fragment.get('access_token') : null;
 const failed=fragment.has('error') || new URLSearchParams(location.search).has('error');
 history.replaceState(null,'',location.pathname);
 const request=document.getElementById('request'), save=document.getElementById('save'), status=document.getElementById('status');
 const form=token ? save : request;
 form.hidden=false;
 if(failed) status.textContent='Este enlace ya no está disponible. Solicite uno nuevo.';
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const input=new FormData(form);
  if(token && input.get('password')!==input.get('repeat')){
   status.textContent='Las contraseñas no coinciden.';return;
  }
  const button=form.querySelector('button');button.disabled=true;status.textContent='Procesando…';
  try{
   const headers={'Content-Type':'application/json'};
   if(token) headers.Authorization='Bearer '+token;
   const response=await fetch(token?'/api/recovery-save':'/api/recovery-request',{
    method:'POST',credentials:'omit',headers,body:JSON.stringify(token?{password:input.get('password')}:{email:input.get('email')})
   });
   const result=await response.json();
   if(!response.ok) throw new Error(result.error||'No se pudo completar la solicitud.');
   form.reset();
   if(token){form.hidden=true;status.textContent='Contraseña actualizada. Ya puede ingresar con su nueva contraseña.';}
   else status.textContent='Si existe una cuenta con ese correo, recibirá un enlace. Revise también la carpeta de correo no deseado.';
  }catch(error){status.textContent=error.message==='Failed to fetch'?'No se pudo conectar. Intente de nuevo.':error.message;}
  finally{button.disabled=false;}
 });
})();
