export function validateWarehouse(kind,p,fail,uuid){
 if(!p||typeof p!=='object'||Array.isArray(p))fail('Revise los datos del formulario.');
 const str=(k,n=160,required=false)=>{const v=p[k]??'';if(typeof v!=='string'||v.length>n||(required&&!v.trim()))fail('Revise el campo '+k+'.');return v.trim();};
 const num=(k)=>{const n=p[k];if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e9||Math.abs(n*1000-Math.round(n*1000))>1e-5)fail('Revise '+k+': use hasta tres decimales.');return n;};
 if(kind==='supplier')return {name:str('name',160,true),legal:str('legal'),tax:str('tax',50),contact:str('contact'),phone:str('phone',50),email:str('email',254),category:str('category',300,true),terms:str('terms',500),delivery:str('delivery',160),quality:str('quality',1000),note:str('note',1500)};
 if(kind==='item'){const supplier=str('supplier',36);if(supplier&&!uuid(supplier))fail('Proveedor inválido.');const minimum=num('minimum'),target=num('target');if(target<minimum)fail('La existencia deseada debe ser igual o mayor al mínimo.');return {code:str('code',80,true),name:str('name',160,true),category:str('category',160,true),unit:str('unit',50,true),location:str('location'),specs:str('specs',1000),minimum,target,supplier,note:str('note',1500)};}
 fail('Tipo de registro inválido.');
}
export async function warehouseAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);},who=await authorized(sessionToken(request)),url=new URL(request.url),input=request.method==='POST'?await body(request):null;
 let asada=who.asada;const requested=input?.asada||url.searchParams.get('asada');
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('La ASADA no está activa.',403);}else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const canManage=who.admin||who.role==='Administración',canMove=canManage||who.role==='Operación',scope='asada_id=eq.'+asada.id;
 async function rows(table,extra=''){let all=[];for(let offset=0;offset<50000;offset+=1000){const a=await sb('/rest/v1/'+table+'?'+scope+extra+'&select=*&order=created_at.asc,id.asc&limit=1000&offset='+offset);all.push(...a);if(a.length<1000)return all;}fail('Hay demasiados registros para una sola consulta. Contacte a Star Water.',413);}
 if(api==='warehouse-data'&&request.method==='GET'){const records=await rows('warehouse_records'),moves=await rows('warehouse_moves');return json({asada,records,moves,canManage,canMove,loadedAt:new Date().toISOString()});}
 if(api==='warehouse-history'&&request.method==='GET')return json({changes:await sb('/rest/v1/warehouse_changes?'+scope+'&select=*&order=changed_at.desc&limit=200')});
 if(api==='warehouse-save'&&request.method==='POST'){
  if(!canManage)fail('La administración administra proveedores y materiales.',403);
  if(!['supplier','item'].includes(input.kind))fail('Tipo de registro inválido.');
  let old;if(input.id){if(!uuid(input.id)||!Number.isInteger(input.version))fail('Registro inválido.');old=(await sb('/rest/v1/warehouse_records?'+scope+'&id=eq.'+input.id+'&kind=eq.'+input.kind+'&select=*'))[0];if(!old)fail('Registro no disponible.',404);if(old.version!==input.version)fail('Otra persona cambió el registro. Actualice antes de editar.',409);}
  const archived=input.archived===true;if(archived&&!old)fail('Seleccione un registro.');if(archived&&old.kind==='item'&&Number(old.stock)!==0)fail('Primero registre la salida o el ajuste de sus existencias antes de desactivar este material.');
  const payload=archived?old.payload:validateWarehouse(input.kind,input.payload,fail,uuid);
  if(old?.kind==='item'&&payload.unit!==old.payload.unit){const history=await sb('/rest/v1/warehouse_moves?'+scope+'&item_id=eq.'+old.id+'&select=id&limit=1');if(history.length)fail('La unidad no se cambia después de registrar movimientos. Cree otro material si necesita otra unidad.');}
  if(payload.supplier&&!archived){const supplier=(await sb('/rest/v1/warehouse_records?'+scope+'&id=eq.'+payload.supplier+'&kind=eq.supplier&archived=eq.false&select=id'))[0];if(!supplier)fail('Seleccione un proveedor activo de esta ASADA.');}
  if(input.kind==='item'&&!archived){const duplicate=(await sb('/rest/v1/warehouse_records?'+scope+'&kind=eq.item&archived=eq.false&select=id,payload')).find(r=>r.id!==old?.id&&r.payload.code.toLowerCase()===payload.code.toLowerCase());if(duplicate)fail('Ya existe un material activo con ese código.');}
  const row={payload,archived,updated_by:who.user.id,updated_at:new Date().toISOString()},saved=old?await sb('/rest/v1/warehouse_records?'+scope+'&id=eq.'+old.id+'&version=eq.'+old.version,{method:'PATCH',body:{...row,version:old.version+1},prefer:'return=representation'}):await sb('/rest/v1/warehouse_records',{method:'POST',body:{...row,asada_id:asada.id,kind:input.kind,created_by:who.user.id},prefer:'return=representation'});
  if(!saved.length)fail('Otra persona cambió el registro. Actualice antes de editar.',409);return json({record:saved[0]});
 }
 if(api==='warehouse-move'&&request.method==='POST'){
  if(!canMove)fail('Junta Directiva consulta. Administración y Operación registran movimientos.',403);
  const p=input.payload;if(!p||!uuid(input.item)||!uuid(input.request_id)||!Number.isInteger(input.version)||input.version<1)fail('Revise el material y la solicitud.');
  if(!['in','out','adjust'].includes(p.type)||typeof p.quantity!=='number'||!Number.isFinite(p.quantity)||!p.quantity||Math.abs(p.quantity)>1e9||Math.abs(p.quantity*1000-Math.round(p.quantity*1000))>1e-5||p.type!=='adjust'&&p.quantity<0)fail('Revise la cantidad: máximo tres decimales.');
  if(p.type==='adjust'&&!canManage)fail('Los ajustes de inventario corresponden a Administración.',403);
  const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'});if(typeof p.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date||p.date>today)fail('Ingrese una fecha válida que no sea futura.');
  for(const [k,n] of [['responsible',160],['reason',1000],['reference',160]])if(typeof p[k]!=='string'||p[k].length>n||(k!=='reference'&&!p[k].trim()))fail('Complete responsable y motivo.');
  const item=(await sb('/rest/v1/warehouse_records?'+scope+'&id=eq.'+input.item+'&kind=eq.item&archived=eq.false&select=id'))[0];if(!item)fail('Material no disponible.',404);
  if(p.supplier&&(!uuid(p.supplier)||p.type!=='in'||!(await sb('/rest/v1/warehouse_records?'+scope+'&id=eq.'+p.supplier+'&kind=eq.supplier&archived=eq.false&select=id')).length))fail('Seleccione un proveedor activo para la entrada.');
  const result=await sb('/rest/v1/rpc/warehouse_move',{method:'POST',body:{p_asada:asada.id,p_item:input.item,p_actor:who.user.id,p_request:input.request_id,p_version:input.version,p_date:p.date,p_type:p.type,p_quantity:p.quantity,p_responsible:p.responsible.trim(),p_reason:p.reason.trim(),p_reference:p.reference.trim(),p_supplier:p.supplier||null}});return json(result);
 }
 fail('Operación no disponible.',404);
}
