// Activity statistics: no form values, keystrokes, documents or query strings are sent.
export const IDLE_MS=120000;
export function activeDelta(previous,now,lastInteraction,visible,ownsLease){
 if(!visible||!ownsLease||now<previous)return 0;
 return Math.max(0,Math.min(now,previous+10000,lastInteraction+IDLE_MS)-previous)/1000;
}
const trackedPages=new Set(['/herramientas.html','/panel-gestion.html','/nuestra-asada.html','/decision-center.html','/nuestra-agua.html','/aforos.html','/anc.html','/nuestras-finanzas.html','/morosidad.html','/bodega.html','/operacion.html','/calidad.html','/equipo.html','/asamblea.html','/diagnostico.html','/planes.html','/biblioteca.html','/abonados.html','/disponibilidades.html','/accesos.html']);
export function startUsageTracker(){
 if(!trackedPages.has(location.pathname))return;
 if(!globalThis.crypto?.randomUUID)return;
 const client=crypto.randomUUID(),page=location.pathname,leaseKey='starwater-usage-visible-tab-v1';
 let seq=0,pending=0,last=Date.now(),interaction=last,stopped=false,inflight=false;
 function lease(now){try{const raw=localStorage.getItem(leaseKey),value=raw?JSON.parse(raw):null;if(value&&value.id!==client&&value.until>now)return false;localStorage.setItem(leaseKey,JSON.stringify({id:client,until:now+12000}));return true;}catch{return true;}}
 function release(){try{const v=JSON.parse(localStorage.getItem(leaseKey)||'null');if(v?.id===client)localStorage.removeItem(leaseKey);}catch{}}
 function tick(){const now=Date.now(),visible=document.visibilityState==='visible',eligible=visible&&last-interaction<IDLE_MS;pending+=activeDelta(last,now,interaction,visible,eligible&&lease(now));if(!visible||now-interaction>=IDLE_MS)release();last=now;}
 async function flush(initial=false){
  if(stopped||inflight)return;tick();const seconds=Math.min(60,Math.floor(pending));if(!initial&&!seconds)return;
  pending-=seconds;inflight=true;
  try{const res=await fetch('/api/usage-pulse',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({page,client,seq:++seq,seconds})});if([401,402,403,428].includes(res.status)){stopped=true;release();}}catch{/* Statistics never block work. Unconfirmed time is not retried or counted twice. */}finally{inflight=false;}
 }
 const activity=()=>{interaction=Date.now();};
 for(const event of ['pointerdown','pointermove','keydown','scroll','touchstart'])addEventListener(event,activity,{passive:true});
 const ticking=setInterval(()=>{if(!stopped)tick();},5000),sending=setInterval(()=>flush(),60000);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){flush();release();}else{last=Date.now();interaction=last;}});
 addEventListener('pagehide',()=>{flush();release();clearInterval(ticking);clearInterval(sending);});
 flush(true);
}
