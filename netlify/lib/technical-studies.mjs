import {randomBytes,createHash} from 'node:crypto';
const table='/rest/v1/technical_study_quote_invitations';
const mime={'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'};
const hash=v=>createHash('sha256').update(v).digest('hex');
const tokenOK=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{43}$/.test(v);
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const flags=['Sí','No','Parcial','No se conoce'];
const fields=['users','conductionKm','distributionKm','tanks','sources','hydrants','microPercent','macroCount'];
export function validateQuote(input,fail){
 if(!input||typeof input!=='object')fail('Revise la información de la solicitud.');
 const d={asadaName:clean(input.asadaName,160),contact:clean(input.contact,160),email:clean(input.email,254),phone:clean(input.phone,40),taxId:clean(input.taxId,40),location:clean(input.location,250),purpose:clean(input.purpose,3000),observations:clean(input.observations,1500)};
 if(!d.asadaName||!d.contact||!d.purpose||!d.location||(!d.email&&!d.phone)||d.email&&!/^\S+@\S+\.\S+$/.test(d.email)||d.phone&&d.phone.replace(/\D/g,'').length<8||input.accept!==true||input.website)fail('Complete la información de la ASADA, contacto, ubicación y motivo del estudio.');
 for(const key of fields){const value=input[key];if(value===null||value===''){d[key]=null;continue;}if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e8||!['conductionKm','distributionKm','microPercent'].includes(key)&&!Number.isInteger(value)||key==='microPercent'&&value>100)fail('Revise las cantidades y porcentajes.');d[key]=value;}
 for(const key of ['aforos','analysis','micro','macro']){if(!flags.includes(input[key]))fail('Indique la disponibilidad de aforos, análisis y medición.');d[key]=input[key];}
 if((d.micro==='Sí'&&d.microPercent!==null&&d.microPercent!==100)||(d.micro==='No'&&d.microPercent===100))fail('Revise el porcentaje de micromedición.');
 const a=input.attachment,t=input.attachmentType;
 if(typeof a!=='string'||a.length>2796204||!Object.hasOwn(mime,t)||a.length%4!==0||! /^[A-Za-z0-9+/]+={0,2}$/.test(a))fail('Adjunte la personería jurídica o una imagen con los datos de la ASADA (PDF, JPG o PNG, máximo 2 MB).');
 const b=Buffer.from(a,'base64');
 if(!b.length||b.length>2097152||t==='application/pdf'&&b.subarray(0,5).toString()!=='%PDF-'||t==='image/png'&&b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||t==='image/jpeg'&&b.subarray(0,3).toString('hex')!=='ffd8ff')fail('El archivo adjunto no es válido.');
 return {details:d,attachment:a,attachment_type:t,attachment_name:'Datos-ASADA.'+mime[t]};
}
export async function technicalStudies(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError,profileStorage}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);};
 const u=new URL(request.url),method=request.method,now=new Date().toISOString();
 if(['study-quote-check','study-quote-submit'].includes(api)&&method==='POST'){
  const input=await body(request,api.endsWith('submit')?2850000:3000);
  if(!tokenOK(input?.token))fail('El enlace no está disponible.',404);
  const scope='token_hash=eq.'+hash(input.token)+'&submitted_at=is.null&revoked_at=is.null&expires_at=gt.'+encodeURIComponent(now);
  const found=(await sb(table+'?'+scope+'&select=id'))?.[0];if(!found)fail('El enlace venció, fue revocado o ya fue utilizado.',410);
  if(api==='study-quote-check')return json({valid:true});
  const data=validateQuote(input,fail);
  const result=await sb(table+'?'+scope+'&select=id',{method:'PATCH',body:{...data,submitted_at:now},prefer:'return=representation'});
  if(!result?.length)fail('El enlace ya no está disponible.',410);
  return json({ok:true,reference:found.id.slice(0,8).toUpperCase()},201);
 }
 const who=await authorized(sessionToken(request));
 if(who.termsPending)fail('Acepte las condiciones de la prueba.',428);
 if(who.external)fail('Esta herramienta corresponde a los perfiles internos de la ASADA.',403);
 if(api.startsWith('study-quote-')){
  if(!who.admin)fail('Las solicitudes de cotización corresponden a Star Water.',403);
  if(api==='study-quote-new'&&method==='POST'){
   const input=await body(request),label=clean(input.label,160);if(!label)fail('Indique la ASADA destinataria.');
   const token=randomBytes(32).toString('base64url'),expires_at=new Date(Date.now()+30*86400000).toISOString();
   const result=await sb(table+'?select=id,expires_at',{method:'POST',body:{label,token_hash:hash(token),created_by:who.user.id,expires_at},prefer:'return=representation'});
   return json({id:result[0].id,url:'https://solucionesstarwater.com/solicitar-estudio-tecnico.html#'+token,expires_at},201);
  }
  if(api==='study-quote-list'&&method==='GET')return json({rows:await sb(table+'?select=id,label,created_at,expires_at,revoked_at,submitted_at,details,attachment_name&order=created_at.desc&limit=200')});
  const id=u.searchParams.get('id');if(!uuid(id))fail('Solicitud inválida.');
  if(api==='study-quote-revoke'&&method==='POST'){
   const rows=await sb(table+'?id=eq.'+id+'&submitted_at=is.null&revoked_at=is.null&select=id',{method:'PATCH',body:{revoked_at:now},prefer:'return=representation'});
   if(!rows?.length)fail('La solicitud ya fue utilizada o revocada.',409);
   return json({ok:true});
  }
  if(api==='study-quote-file'&&method==='GET'){
   const row=(await sb(table+'?id=eq.'+id+'&submitted_at=not.is.null&select=attachment,attachment_type,attachment_name'))?.[0];
   if(!row?.attachment||!Object.hasOwn(mime,row.attachment_type))fail('Documento no disponible.',404);
   return new Response(Buffer.from(row.attachment,'base64'),{headers:{'Content-Type':row.attachment_type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(row.attachment_name),'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'}});
  }
  fail('Operación no disponible.',404);
 }
 const canEdit=who.admin||['Administración','Junta Directiva'].includes(who.role);
 if(api==='study-asadas'&&method==='GET')return json({admin:who.admin===true,canEdit,asadas:who.admin?await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc'):[who.asada]});
 const input=method==='POST'?await body(request):null,requested=input?.asada||u.searchParams.get('asada');
 let asada=who.asada;
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))?.[0];if(!asada)fail('ASADA no disponible.',403);}
 else if(!asada?.id||requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const scope='asada_id=eq.'+asada.id,docScope='/rest/v1/asada_documents?'+scope+'&category=eq.'+encodeURIComponent('Estudio técnico');
 const projectScope='/rest/v1/panel_records?'+scope+'&kind=eq.project&deleted=eq.false';
 if(api==='study-data'&&method==='GET'){
  const documents=await sb(docScope+'&select=id,name,filename,type,size,start_date,created_at&order=created_at.desc&limit=200');
  const rows=await sb(projectScope+'&select=id,year,payload,version&order=created_at.desc&limit=1000');
  const projects=rows.map(r=>({id:r.id,year:r.year,title:r.payload.title,state:r.payload.state,documentIds:(r.payload.documents||[]).map(d=>d.id)}));
  return json({asada,documents,projects,canEdit});
 }
 if(api==='study-file'&&method==='GET'){
  const id=u.searchParams.get('id');if(!uuid(id))fail('Documento inválido.');
  const doc=(await sb(docScope+'&id=eq.'+id+'&select=*'))?.[0];if(!doc||!doc.path.startsWith(asada.id+'/'))fail('Documento no disponible.',404);
  const signed=await profileStorage('SIGN_DOWNLOAD',doc.path),url=new URL(signed.url);url.searchParams.set('download',doc.filename);
  return new Response(null,{status:302,headers:{Location:url.toString(),'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer'}});
 }
 if(api==='study-link'&&method==='POST'){
  if(!canEdit)fail('La administración o la Junta Directiva vinculan estudios y proyectos.',403);
  if(!uuid(input.document)||!uuid(input.project)||typeof input.link!=='boolean')fail('Seleccione el estudio y el proyecto.');
  const doc=(await sb(docScope+'&id=eq.'+input.document+'&select=id,filename,type'))?.[0];
  const project=(await sb(projectScope+'&id=eq.'+input.project+'&select=id,payload,version'))?.[0];
  if(!doc||!project)fail('El estudio o el proyecto no pertenece a esta ASADA.',404);
  const documents=project.payload.documents||[],filtered=documents.filter(d=>d.id!==doc.id);
  if(input.link&&filtered.length>=12)fail('El proyecto admite hasta 12 respaldos.');
  const next=input.link?[...filtered,{id:doc.id,name:doc.filename,type:doc.type,category:'Estudio técnico'}]:filtered;
  const payload={...project.payload,documents:next};
  if(Buffer.byteLength(JSON.stringify(payload))>10000)fail('El proyecto es demasiado extenso.',413);
  const rows=await sb(projectScope+'&id=eq.'+project.id+'&version=eq.'+project.version+'&select=id',{method:'PATCH',body:{payload,version:project.version+1,updated_by:who.user.id,updated_at:now},prefer:'return=representation'});
  if(!rows?.length)fail('El proyecto cambió. Actualice e intente nuevamente.',409);
  return json({ok:true});
 }
 fail('Operación no disponible.',404);
}
