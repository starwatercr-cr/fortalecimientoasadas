(function(){
const c=window.STRATEGIA_CONFIG;
const sessionKey='s360-remember-session';
const storage={getItem(key){return localStorage.getItem(key)??sessionStorage.getItem(key)},setItem(key,value){if(localStorage.getItem(sessionKey)==='no'){sessionStorage.setItem(key,value);localStorage.removeItem(key)}else{localStorage.setItem(key,value);sessionStorage.removeItem(key)}},removeItem(key){localStorage.removeItem(key);sessionStorage.removeItem(key)}};
const ready=import('https://esm.sh/@supabase/supabase-js@2.76.1').then(({createClient})=>createClient(c.url,c.publishableKey,{auth:{storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
window.S360={
 async requestDemo(datos){const s=await ready;const {error}=await s.from('solicitudes_demo').insert({nombre:datos.nombre,empresa:datos.empresa,email:datos.email,whatsapp:datos.whatsapp});if(error)throw Error('No se pudo registrar la solicitud. Intente nuevamente.');return true},
 async isAdmin(){const s=await ready;const {data,error}=await s.rpc('s360_es_admin');if(error)throw error;return data===true},
 async listRequests(){const s=await ready;const {data,error}=await s.from('solicitudes_demo').select('id,nombre,empresa,email,whatsapp,estado,creado_en').order('creado_en',{ascending:false});if(error)throw error;return data},
 async reviewRequest(id,accion){const s=await ready;const {data:{session}}=await s.auth.getSession();if(!session)throw Error('Inicie sesión nuevamente');const res=await fetch(c.url+'/functions/v1/revisar-solicitud-demo',{method:'POST',headers:{'Content-Type':'application/json','apikey':c.publishableKey,'Authorization':'Bearer '+session.access_token},body:JSON.stringify({id,accion})});const body=await res.json().catch(()=>({}));if(!res.ok)throw Error(body.error||'No se pudo procesar la solicitud');return body},
 async signUpDemo(email,password,nombre,empresa){const client=await ready;const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:new URL('activar-demo.html',location.href).href,data:{nombre_contacto:nombre,nombre_empresa:empresa}}});if(error)throw error;return data},
 async activateDemo(empresa,version){const client=await ready;const {data,error}=await client.rpc('activar_demo_3h',{p_nombre_empresa:empresa,p_version_terminos:version});if(error)throw error;return data},
 async currentUser(){const client=await ready;const {data,error}=await client.auth.getUser();if(error)throw error;return data.user},
 async demoStatus(){const client=await ready;const {data,error}=await client.rpc('estado_demo');if(error)throw error;return data},
 async signIn(email,password,remember=true){localStorage.setItem(sessionKey,remember?'yes':'no');const s=await ready;const {error}=await s.auth.signInWithPassword({email:email.trim(),password});if(error)throw Error('No se pudo iniciar sesión. Revisa el correo y la contraseña.');if(await this.isAdmin())return true;const {data,error:accessError}=await s.from('miembros_empresa').select('empresa_id').limit(1);if(accessError||!data?.length){const {data:status}=await s.rpc('estado_demo');if(status?.estado==='vencida')throw Error('Su demostración de 3 horas finalizó. Contáctenos para contratar el servicio.');throw Error('Su cuenta todavía no tiene una empresa activa. Si confirmó su correo, active su demostración gratuita.')}return true},
 async check(){try{const s=await ready;const {data:{user},error}=await s.auth.getUser();if(error||!user)return false;if(await this.isAdmin())return true;const {data,error:accessError}=await s.from('miembros_empresa').select('empresa_id').limit(1);return !accessError&&!!data?.length}catch{return false}},
 async logout(){try{const s=await ready;await s.auth.signOut()}finally{location.replace('login.html')}},
 async reset(email){const s=await ready;const {error}=await s.auth.resetPasswordForEmail(email.trim(),{redirectTo:new URL('restablecer.html',location.href).href});if(error)throw error;return true},
 async updatePassword(password){const s=await ready;const {error}=await s.auth.updateUser({password});if(error)throw error;return true}
};
})();
