import {createHash} from 'node:crypto';
import {validateDataset} from '../../private/abonados-model.js';
export async function abonadosAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError}){
 const who=await authorized(sessionToken(request)),fail=(m,s=400)=>{throw new PublicError(s,m);},canEdit=!who.external&&(who.admin||['Administración','Junta Directiva'].includes(who.role));const u=new URL(request.url),input=request.method==='POST'?await body(request):null,requested=input?.asada||u.searchParams.get('asada');let asada=who.asada;
 if(api==='abonados-asadas'&&request.method==='GET')return json({asadas:who.admin?await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc'):[asada],canEdit});
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('ASADA no disponible.',403);}else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const scope='asada_id=eq.'+asada.id;
 if(api==='abonados-list'&&request.method==='GET')return json({asada,imports:await sb('/rest/v1/subscriber_imports?'+scope+'&select=id,filename,format,operator,row_count,created_at&order=created_at.desc&limit=100'),canEdit});
 if(api==='abonados-data'&&request.method==='GET'){const id=u.searchParams.get('id');if(!uuid(id))fail('Seleccione una importación.');const r=(await sb('/rest/v1/subscriber_imports?'+scope+'&id=eq.'+id+'&select=*'))[0];if(!r)fail('Importación no disponible.',404);return json({asada,import:r,canEdit});}
 if(api!=='abonados-save'||request.method!=='POST')fail('Operación no disponible.',404);if(!canEdit)fail('Su perfil permite consultar los análisis guardados.',403);if(input.confirm!==true)fail('Confirme que revisó los datos y pertenecen a esta ASADA.');let p;try{p=validateDataset(input.dataset);}catch(e){fail(e.message);}
 p.hash=createHash('sha256').update(JSON.stringify(p.adjustments?{operator:p.operator,adjustments:p.adjustments}:p.rows)).digest('hex');
 const existing=(await sb('/rest/v1/subscriber_imports?'+scope+'&hash=eq.'+p.hash+'&select=id'))[0];if(existing)return json({id:existing.id,already:true});
 const [saved]=await sb('/rest/v1/subscriber_imports',{method:'POST',body:{asada_id:asada.id,filename:p.filename,format:p.format,operator:p.operator,hash:p.hash,row_count:p.adjustments?.length||p.rows.length,payload:{rows:p.rows,warnings:p.warnings,...(p.adjustments?{adjustments:p.adjustments}:{})},created_by:who.user.id},prefer:'return=representation'});return json({id:saved.id},201);
}
