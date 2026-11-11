import {randomUUID} from 'node:crypto';
export function validateArrears(kind,p,fail){
 if(!p||typeof p!=='object'||Array.isArray(p))fail('Revise los datos.');
 const str=(k,n=160,required=false)=>{const v=p[k]??'';if(typeof v!=='string'||v.length>n||required&&!v.trim())fail('Revise '+k+'.');return v.trim();};
 const date=k=>{const s=str(k,10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(Date.parse(s+'T00:00:00Z'))||new Date(s+'T00:00:00Z').toISOString().slice(0,10)!==s)fail('Revise la fecha '+k+'.');return s;};
 const amount=k=>{const n=p[k];if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e12||Math.abs(n*100-Math.round(n*100))>1e-4)fail('Revise el monto '+k+'.');return n;};
 if(kind==='subscriber'){const state=str('state',30,true);if(!['Pendiente','En seguimiento','Compromiso de pago','Resuelto'].includes(state))fail('Seleccione el estado del seguimiento.');return {code:str('code',80,true),name:str('name',160,true),date:date('date'),phone:str('phone',50),email:str('email',254),sector:str('sector',160),reason:str('reason',1500),responsible:str('responsible',160),nextDate:p.nextDate?date('nextDate'):'',state,note:str('note',1500)};}
 if(kind==='debt')return {code:str('code',80,true),name:str('name',160,true),invoice:str('invoice',80,true),due:date('due'),cutoff:date('cutoff'),balance:amount('balance'),phone:str('phone',50),email:str('email',254),sector:str('sector',160),note:str('note',1500)};
 if(kind==='notice_sent')return {date:date('date'),office:str('office',254,true)};
 if(kind==='notice'){
  const level=str('level',40,true),role=str('role',40,true);
  if(!['I','II','III'].some(n=>level===n+' Notificación de cobro')||!['Administración','Representante legal','Otro cargo autorizado'].includes(role))fail('Revise el tipo de notificación y el cargo.');
  return {level,role,date:date('date'),office:str('office',254,true),place:str('place',254,true),code:str('code',80,true),name:str('name',160,true),ownerId:str('ownerId',254,true),amount:p.amount==null?null:amount('amount'),period:str('period',254),contact:str('contact',254),signer:str('signer',254,true),body:str('body',1500,true)};
 }
 if(kind==='collection'){const channel=str('channel',40,true);if(!['Llamada','Correo','Visita','WhatsApp','Otro'].includes(channel))fail('Seleccione el medio de contacto.');return {date:date('date'),channel,responsible:str('responsible',160,true),result:str('result',1500,true),next:str('next',1000),nextDate:p.nextDate?date('nextDate'):''};}
 if(kind==='promise'){const state=str('state',30,true),total=p.amount===null||p.amount===undefined?null:amount('amount');if(!['Pendiente','Cumplido','Incumplido','Cancelado'].includes(state)||total!==null&&total<=0)fail('Revise el compromiso.');const d=date('date'),due=date('due');if(due<d)fail('El plazo no puede ser anterior al acuerdo.');return {date:d,due,amount:total,responsible:str('responsible',160,true),state,reference:str('reference',160),note:str('note',1500,total===null)};}
 fail('Tipo de registro inválido.');
}
export async function arrearsAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError,storage}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);},who=await authorized(sessionToken(request)),url=new URL(request.url),input=request.method==='POST'&&api!=='arrears-notice-upload'?await body(request,1500000):null;
 if(!who.admin&&!['Administración','Junta Directiva'].includes(who.role))fail('Este apartado corresponde a la administración y la Junta Directiva.',403);
 let asada=who.asada;const requested=input?.asada||url.searchParams.get('asada');
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('ASADA no disponible.',403);}else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const scope='asada_id=eq.'+asada.id,canEdit=who.admin||who.role==='Administración';
 if(api==='arrears-data'&&request.method==='GET'){let records=[];for(let offset=0;offset<50000;offset+=1000){const part=await sb('/rest/v1/arrears_records?'+scope+'&select=*&order=created_at.asc,id.asc&limit=1000&offset='+offset);records.push(...part);if(part.length<1000)return json({asada,records,canEdit});}fail('El volumen requiere una consulta por bloques.',413);}
 if(api==='arrears-history'&&request.method==='GET')return json({changes:await sb('/rest/v1/arrears_changes?'+scope+'&select=*&order=changed_at.desc&limit=200')});
 if(api==='arrears-notice-file'&&request.method==='GET'){
  const id=url.searchParams.get('id');if(!uuid(id))fail('Respaldo inválido.');
  const r=(await sb('/rest/v1/arrears_records?'+scope+'&id=eq.'+id+'&kind=eq.notice_sent&select=payload,parent_id'))[0];
  if(!r||!uuid(r.parent_id)||!uuid(r.payload.fileKey))fail('Respaldo no disponible.',404);
  const path=asada.id+'/'+r.parent_id+'/'+r.payload.fileKey+'.pdf';
  return new Response(await storage('GET',path),{headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="Notificacion-enviada.pdf"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }
 if(!canEdit)fail('La Junta Directiva puede consultar. La administración registra y actualiza.',403);
 if(api==='arrears-notice-upload'&&request.method==='POST'){
  const parent=url.searchParams.get('parent');if(!uuid(parent))fail('Seleccione el expediente.');
  const owner=(await sb('/rest/v1/arrears_records?'+scope+'&id=eq.'+parent+'&kind=eq.subscriber&select=id'))[0];
  if(!owner)fail('Expediente no disponible.',404);
  const payload=validateArrears('notice_sent',{date:url.searchParams.get('date'),office:url.searchParams.get('office')},fail);
  const max=3*1024*1024;
  if(request.headers.get('content-type')!=='application/pdf')fail('Adjunte el PDF de la notificación enviada.');
  if(Number(request.headers.get('content-length'))>max)fail('El PDF debe pesar como máximo 3 MB.',413);
  const reader=request.body?.getReader();if(!reader)fail('Seleccione el PDF.');
  const chunks=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail('El PDF debe pesar como máximo 3 MB.',413);}chunks.push(value);}
  const bytes=Buffer.concat(chunks);if(bytes.subarray(0,5).toString()!=='%PDF-')fail('El archivo no tiene un encabezado PDF válido.');
  const fileKey=randomUUID(),path=asada.id+'/'+parent+'/'+fileKey+'.pdf';
  await storage('POST',path,bytes,'application/pdf');
  try{
   const [record]=await sb('/rest/v1/arrears_records',{method:'POST',body:{asada_id:asada.id,kind:'notice_sent',parent_id:parent,payload:{...payload,fileKey},created_by:who.user.id,updated_by:who.user.id},prefer:'return=representation'});
   if(!record)fail('No se pudo guardar el respaldo.',502);
   return json({record},201);
  }catch(e){try{await storage('DELETE',path);}catch{}throw e;}
 }
 if(api==='arrears-import'&&request.method==='POST'){
  if(!uuid(input.request_id)||!Array.isArray(input.entries)||!input.entries.length||input.entries.length>500)fail('Revise el archivo de importación.');
  const seen=new Set(),entries=input.entries.map(e=>{const p=validateArrears('debt',e.payload,fail),key=p.code.toLowerCase()+'|'+p.invoice.toLowerCase();if(seen.has(key))fail('Hay facturas repetidas en el archivo.');seen.add(key);if(e.id&&(!uuid(e.id)||!Number.isInteger(e.version)||e.version<1))fail('Versión inválida.');return {id:e.id||null,version:e.version||null,payload:p};});
  return json(await sb('/rest/v1/rpc/arrears_import',{method:'POST',body:{target_asada:asada.id,actor_id:who.user.id,request_id:input.request_id,entries}}));
 }
 if(api!=='arrears-save'||request.method!=='POST')fail('Operación no disponible.',404);
 if(input.kind==='notice_sent')fail('Registre el envío adjuntando el PDF.');
 const payload=validateArrears(input.kind,input.payload,fail);let old=null;
 if(input.id){if(!uuid(input.id)||!Number.isInteger(input.version))fail('Registro inválido.');old=(await sb('/rest/v1/arrears_records?'+scope+'&id=eq.'+input.id+'&kind=eq.'+input.kind+'&select=*'))[0];if(!old)fail('Registro no disponible.',404);if(old.version!==input.version)fail('Otra persona cambió el registro. Actualice antes de guardar.',409);}
 let parent=null;if(!['debt','subscriber'].includes(input.kind)){if(!uuid(input.parent))fail('Seleccione el expediente del abonado.');parent=(await sb('/rest/v1/arrears_records?'+scope+'&id=eq.'+input.parent+(input.kind==='notice'?'&kind=eq.subscriber':'&kind=in.(debt,subscriber)')+'&select=id'))[0];if(!parent||old&&old.parent_id!==parent.id)fail('Expediente no disponible.',404);}
 if(old&&input.kind==='debt'){if(payload.code!==old.payload.code||payload.invoice!==old.payload.invoice)fail('El código y la factura son permanentes para conservar el historial.');if(payload.cutoff<old.payload.cutoff)fail('El corte no puede ser anterior al saldo guardado.');}
 if(old&&input.kind==='subscriber'&&payload.code!==old.payload.code)fail('El número de abonado se conserva para mantener su historial.');
 const row={payload,updated_by:who.user.id,updated_at:new Date().toISOString()};const saved=old?await sb('/rest/v1/arrears_records?'+scope+'&id=eq.'+old.id+'&version=eq.'+old.version,{method:'PATCH',body:{...row,version:old.version+1},prefer:'return=representation'}):await sb('/rest/v1/arrears_records',{method:'POST',body:{...row,asada_id:asada.id,kind:input.kind,parent_id:parent?.id||null,created_by:who.user.id},prefer:'return=representation'});
 if(!saved.length)fail('Otra persona cambió el registro. Actualice antes de guardar.',409);return json({record:saved[0]},old?200:201);
}
