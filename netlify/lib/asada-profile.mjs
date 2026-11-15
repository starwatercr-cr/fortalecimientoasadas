export function validateLetterhead(value,fail){
 if(value===undefined)return {enabled:true,logo:''};
 if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.enabled!=='boolean'||typeof value.logo!=='string')fail('Revise el membrete.');
 const logo=value.logo;
 if(logo){
  if(logo.length>220000||!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(logo))fail('Use el selector para preparar un logo PNG válido.');
  const b=Buffer.from(logo.split(',')[1],'base64');
  if(b.length>160000||b.length<33||b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||b.subarray(12,16).toString()!=='IHDR'||b.readUInt32BE(16)<1||b.readUInt32BE(20)<1||b.readUInt32BE(16)>1024||b.readUInt32BE(20)>1024)fail('El logo debe ser una imagen PNG de tamaño reducido.');
 }
 return {enabled:value.enabled,logo};
}
import {validateContract} from '../../private/contract-model.js';
import {randomUUID} from 'node:crypto';
export function validateProfile(p,fail){
 if(!p||typeof p!=='object'||Array.isArray(p))fail('Revise la ficha de la ASADA.');
 const out={},str=(k,max=160)=>{const v=p[k]??'';if(typeof v!=='string'||v.length>max)fail('Revise el campo '+k+'.');return v.trim();};
 for(const k of ['name','president','province','canton','district','phone','email','boardPeriod','agreement'])out[k]=str(k,k==='email'?254:160);
 if(!out.name)fail('Ingrese el nombre de la ASADA.');
 out.tax=str('tax',50);out.communities=str('communities',1000);out.address=str('address',500);
 if(out.email&&!/^\S+@\S+\.\S+$/.test(out.email))fail('Revise el correo oficial.');
 for(const k of ['users','population','pipeKm']){const n=p[k];if(n===null||n===''||n===undefined)out[k]=null;else {if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e8||k!=='pipeKm'&&!Number.isInteger(n))fail('Revise servicios, población o kilómetros de tubería.');out[k]=k==='pipeKm'?Math.round(n*1000)/1000:n;}}
 for(const k of ['mission','vision','values','priorities','who','service','commitment','future','principles'])out[k]=str(k,2000);
 out.identityStatus=str('identityStatus',30)||'Borrador';if(!['Borrador','Aprobado'].includes(out.identityStatus))fail('Seleccione borrador o aprobado.');
 out.approvedDate=str('approvedDate',10);if(out.approvedDate&&!validDate(out.approvedDate))fail('Revise la fecha de aprobación.');
 if(out.identityStatus==='Aprobado'&&(!out.mission||!out.vision||!out.values||!out.agreement||!out.approvedDate))fail('Para registrar la aprobación complete misión, visión, valores, fecha y acuerdo de Junta Directiva.');
 out.letterhead=validateLetterhead(p.letterhead,fail);
 if(p.contract!==undefined)out.contract=validateContract(p.contract,fail);
 return out;
}
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export async function profileAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError,profileStorage}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);},who=await authorized(sessionToken(request)),u=new URL(request.url);
 const input=request.method==='POST'&&api!=='profile-upload'?await body(request):null;
 const requested=input?.asada||u.searchParams.get('asada');let asada=who.asada;
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('ASADA no disponible.',403);}else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const scope='asada_id=eq.'+asada.id,canEdit=who.admin||['Administración','Junta Directiva'].includes(who.role);
 const get=async()=> (await sb('/rest/v1/asada_profiles?'+scope+'&select=*'))[0]||null;
 if(api==='letterhead-data'&&request.method==='GET'){const p=(await get())?.payload||{};return json({asada,letterhead:{name:p.name||asada.name,tax:p.tax||'',phone:p.phone||'',email:p.email||'',address:p.address||'',enabled:p.letterhead?.enabled!==false,logo:p.letterhead?.logo||''}});}
 if(api==='profile-data'&&request.method==='GET')return json({asada,profile:await get(),canEdit,isPlatformAdmin:who.admin===true,documents:canEdit?await sb('/rest/v1/asada_documents?'+scope+'&select=id,name,category,filename,type,size,start_date,end_date,created_at&order=created_at.desc&limit=200'):[]});
 if(api==='profile-history'&&request.method==='GET'){if(!canEdit)fail('El historial corresponde a la Junta y la administración.',403);return json({changes:await sb('/rest/v1/asada_profile_changes?'+scope+'&select=actor,changed_at,current_data&order=changed_at.desc&limit=100')});}
 if(api==='profile-save'&&request.method==='POST'){
  if(!canEdit)fail('La Junta Directiva y la administración actualizan esta ficha.',403);
  const old=await get();if(!Number.isInteger(input.version)||input.version!==(old?.version||0))fail('Otra persona actualizó la ficha. Recargue antes de guardar.',409);
  const proposed={...input.payload};if(input.payload?.letterhead===undefined&&old?.payload?.letterhead)proposed.letterhead=old.payload.letterhead;
  const payload=validateProfile(proposed,fail);
  if(old?.payload?.contract&&!payload.contract)payload.contract=old.payload.contract;
  if(!who.admin&&payload.contract){
   for(const key of ['providerAddress','providerRepresentation','providerQuotePrice','providerQuoteReference','providerQuoteScope'])if(payload.contract[key]!== (old?.payload?.contract?.[key]??(key==='providerQuotePrice'?null:'')))fail('Star Water completa sus datos y las condiciones de la cotización.',403);
  }
  const row={payload,updated_by:who.user.id,updated_at:new Date().toISOString()};
  const rows=old?await sb('/rest/v1/asada_profiles?'+scope+'&version=eq.'+old.version,{method:'PATCH',body:{...row,version:old.version+1},prefer:'return=representation'}):await sb('/rest/v1/asada_profiles',{method:'POST',body:{...row,asada_id:asada.id},prefer:'return=representation'});
  if(!rows.length)fail('La ficha cambió. Recargue antes de guardar.',409);return json({profile:rows[0]});
 }
 if(api==='profile-file'&&request.method==='GET'){
  if(!canEdit)fail('Los documentos están disponibles para la Junta y la administración.',403);
  const id=u.searchParams.get('id');if(!uuid(id))fail('Documento inválido.');const r=(await sb('/rest/v1/asada_documents?'+scope+'&id=eq.'+id+'&select=*'))[0];if(!r||!r.path.startsWith(asada.id+'/'))fail('Documento no disponible.',404);
  return new Response(await profileStorage('GET',r.path),{headers:{'Content-Type':r.type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(r.filename),'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'}});
 }
 if(api==='profile-upload'&&request.method==='POST'){
  if(!canEdit&&!(who.role==='Operación'&&u.searchParams.get('category')==='Evidencia de trabajo'))fail('La Junta, la administración y operación autorizada adjuntan documentos.',403);
  const name=u.searchParams.get('name')?.trim(),category=u.searchParams.get('category'),start=u.searchParams.get('start')||null,end=u.searchParams.get('end')||null;
  if(!name||name.length>160||!['Contrato con Star Water','Contrato generado','Contrato firmado por ASADA','Contrato final con ambas firmas','Personería jurídica','Otro documento','Acuerdo de Junta Directiva','Evidencia de trabajo'].includes(category)||start&&!validDate(start)||end&&!validDate(end)||start&&end&&end<start)fail('Revise el nombre, categoría y vigencia del documento.');
  if(category==='Contrato final con ambas firmas'&&!who.admin)fail('Star Water carga la versión final con ambas firmas.',403);
  const type=request.headers.get('content-type'),MAX=5*1024*1024;if(category.startsWith('Contrato')&&category!=='Contrato con Star Water'&&type!=='application/pdf')fail('Adjunte el contrato completo en PDF.');if(!['application/pdf','image/png','image/jpeg'].includes(type))fail('Adjunte un PDF o imagen JPG/PNG.');if(Number(request.headers.get('content-length'))>MAX)fail('El archivo debe pesar como máximo 5 MB.',413);
  const reader=request.body?.getReader();if(!reader)fail('Seleccione un archivo.');const chunks=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX){await reader.cancel();fail('El archivo debe pesar como máximo 5 MB.',413);}chunks.push(value);}
  const bytes=Buffer.concat(chunks);if(!size||type==='application/pdf'&&bytes.subarray(0,5).toString()!=='%PDF-'||type==='image/png'&&bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||type==='image/jpeg'&&bytes.subarray(0,3).toString('hex')!=='ffd8ff')fail('Revise el formato del documento.');
  const ext={'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'}[type],path=asada.id+'/'+randomUUID()+'.'+ext;
  await profileStorage('POST',path,bytes,type);
  try{const rows=await sb('/rest/v1/asada_documents',{method:'POST',body:{asada_id:asada.id,name,category,start_date:start,end_date:end,path,type,size,filename:name.replace(/[\\/\r\n]/g,'_')+'.'+ext,created_by:who.user.id},prefer:'return=representation'});return json({document:rows[0]},201);}catch(e){try{await profileStorage('DELETE',path);}catch{}throw e;}
 }
 fail('Operación no disponible.',404);
}
