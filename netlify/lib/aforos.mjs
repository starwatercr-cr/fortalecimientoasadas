import {validateFlow,validDate} from '../../private/aforos-model.js';
export async function aforosAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);},who=await authorized(sessionToken(request)),canManage=who.admin||who.role==='Administración',canEdit=canManage||who.role==='Operación';
 if(api==='flow-asadas'&&request.method==='GET')return json({asadas:who.admin?await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc'):[who.asada],canEdit,canManage,user:who.user.id});
 const u=new URL(request.url),input=request.method==='POST'?await body(request):null,requested=input?.asada||u.searchParams.get('asada');let asada=who.asada;
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('La ASADA no está activa.',403);}else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const scope='asada_id=eq.'+asada.id,find=async(id)=>{if(!uuid(id))fail('Seleccione un registro válido.');const r=(await sb('/rest/v1/water_flow_records?'+scope+'&id=eq.'+id+'&deleted=eq.false&select=*'))[0];if(!r)fail('Registro no disponible.',404);return r;};
 if(api==='flow-data'&&request.method==='GET'){let records=[];for(let offset=0;offset<30000;offset+=1000){const rows=await sb('/rest/v1/water_flow_records?'+scope+'&deleted=eq.false&select=*&order=date.asc.nullsfirst,id.asc&limit=1000&offset='+offset);records.push(...rows);if(rows.length<1000)return json({asada,records,canEdit,canManage,user:who.user.id});}fail('El historial excede el límite de consulta. Contacte a Star Water.',413);}
 if(api!=='flow-save'||request.method!=='POST')fail('Operación no disponible.',404);if(!canEdit)fail('Su acceso permite consultar los aforos.',403);
 let old=null;if(input.id){old=await find(input.id);if(input.version!==old.version)fail('Otra persona cambió el registro. Actualice antes de editar.',409);if(!canManage&&(old.kind==='source'||old.created_by!==who.user.id))fail('Solo puede modificar sus propios aforos.',403);}
 if(!['source','measurement'].includes(input.kind)||old&&old.kind!==input.kind)fail('Seleccione un tipo válido.');if(input.kind==='source'&&!canManage)fail('La administración define las fuentes.',403);if(input.archive&&!old)fail('Seleccione un registro.');
 const p=input.archive?old.payload:validateFlow(input.kind,input.payload,fail);let source=old?.source_id||input.source_id||null;
 if(input.kind==='source'){if(source)fail('Una fuente no se vincula a otra.');if(input.archive){const children=await sb('/rest/v1/water_flow_records?'+scope+'&source_id=eq.'+old.id+'&deleted=eq.false&select=id&limit=1');if(children.length)fail('La fuente tiene aforos. Manténgala para conservar su historial; puede excluirla del total.');}}
 if(input.kind==='measurement'&&!input.archive){const parent=await find(source);if(parent.kind!=='source')fail('Seleccione una fuente válida.');p.sourceName=parent.payload.name;}
 const row={payload:p,date:input.kind==='source'?null:p.date,updated_by:who.user.id,updated_at:new Date().toISOString()};let rows;
 if(old){rows=await sb('/rest/v1/water_flow_records?'+scope+'&id=eq.'+old.id+'&version=eq.'+old.version+'&deleted=eq.false',{method:'PATCH',body:{...row,deleted:input.archive===true,version:old.version+1},prefer:'return=representation'});if(!rows.length)fail('El registro cambió. Actualice antes de editar.',409);}
 else rows=await sb('/rest/v1/water_flow_records',{method:'POST',body:{...row,asada_id:asada.id,kind:input.kind,source_id:source,created_by:who.user.id},prefer:'return=representation'});
 return json({record:rows[0]},old?200:201);
}
