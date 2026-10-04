import {QUALITY_PARAMS,parameterUnits,parseQualityValue} from '../../private/water-parameters.js';
export async function operationAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);},who=await authorized(sessionToken(request)),canManage=who.admin||who.role==='Administración',canEdit=canManage||who.role==='Operación';
 if(api==='ops-asadas'&&request.method==='GET')return json({asadas:who.admin?await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc'):[who.asada],canManage,canEdit,user:who.user.id});
 const u=new URL(request.url),input=request.method==='POST'?await body(request):null,requested=input?.asada||u.searchParams.get('asada');let asada=who.asada;
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('La ASADA no está activa.',403);}else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const scope='asada_id=eq.'+asada.id;
 const find=async(id,kind)=>{if(!uuid(id))fail('Seleccione un registro válido.');const r=(await sb('/rest/v1/operation_records?'+scope+'&id=eq.'+id+'&deleted=eq.false&select=*'))[0];if(!r||kind&&r.kind!==kind)fail('El registro no está disponible.',404);return r;};
 if(api==='ops-data'&&request.method==='GET'){
 const start=u.searchParams.get('start'),end=u.searchParams.get('end');if(!validDate(start)||!validDate(end)||end<start)fail('Revise el período de consulta.');
 const filter='&or='+encodeURIComponent('(kind.eq.point,and(date.gte.'+start+',date.lte.'+end+'))');let records=[];
 for(let offset=0;offset<20000;offset+=1000){const rows=await sb('/rest/v1/operation_records?'+scope+'&deleted=eq.false'+filter+'&select=*&order=date.asc.nullsfirst,created_at.asc,id.asc&offset='+offset+'&limit=1000');records.push(...rows);if(rows.length<1000)return json({asada,records,canEdit,canManage,user:who.user.id});}fail('Reduzca el período para consultar menos registros.',413);
 }
 if(api==='ops-history'&&request.method==='GET')return json({changes:await sb('/rest/v1/operation_changes?'+scope+'&select=record_id,actor,action,changed_at,current_data&order=changed_at.desc,id.desc&limit=100')});
 if(!['ops-save','ops-review'].includes(api)||request.method!=='POST')fail('Operación no disponible.',404);
 if(!canEdit)fail('Su acceso permite consultar. Operación y Administración pueden registrar información.',403);
 let old=null;if(input.id){old=await find(input.id);if(!Number.isInteger(input.version)||input.version!==old.version)fail('Otra persona cambió el registro. Actualice antes de editar.',409);if(!canManage&&old.created_by!==who.user.id)fail('Solo puede modificar sus propios registros. La administración puede revisarlos.',403);}
 if(api==='ops-review'){
 if(!canManage)fail('La revisión corresponde a la administración.',403);if(!old||old.kind==='point')fail('Seleccione una labor o una medición para revisar.');
 const rows=await sb('/rest/v1/operation_records?'+scope+'&id=eq.'+old.id+'&version=eq.'+old.version+'&deleted=eq.false',{method:'PATCH',body:{reviewed_by:who.user.id,reviewed_at:new Date().toISOString(),updated_by:who.user.id,updated_at:new Date().toISOString(),version:old.version+1},prefer:'return=representation'});if(!rows.length)fail('El registro cambió. Actualice antes de revisarlo.',409);return json({record:rows[0]});
 }
 if(!['point','log','chlorine'].includes(input.kind)||old&&old.kind!==input.kind)fail('Seleccione un tipo de registro válido.');if(input.kind==='point'&&!canManage)fail('La administración define los puntos de medición.',403);if(input.archive&&!old)fail('Seleccione el registro que desea archivar.');
 const p=input.archive?old.payload:validateOperation(input.kind,input.payload,fail),related=old?old.related_id:input.related_id||null,followup=old?old.followup_id:input.followup_id||null;
 if(input.kind!=='chlorine'&&(related||followup))fail('Este registro no se vincula a una medición.');
 if(input.kind==='chlorine'&&!input.archive){if(old&&p.type!==old.payload.type)fail('El tipo de cloro de una medición registrada no se cambia. Cree una nueva medición.');const point=await find(related,'point');p.pointName=point.payload.name;p.pointLocation=point.payload.location;if(followup){const previous=await find(followup,'chlorine');if(previous.related_id!==related||previous.payload.type!==p.type)fail('La medición de seguimiento debe corresponder al mismo punto y tipo de cloro.');if(p.date+'T'+p.time<previous.payload.date+'T'+previous.payload.time)fail('El seguimiento no puede ser anterior a la medición original.');p.followupReference=previous.payload.date+' '+previous.payload.time+' · '+previous.payload.value+' mg/L';}}
 const row={payload:p,date:input.kind==='point'?null:p.date,updated_by:who.user.id,updated_at:new Date().toISOString(),reviewed_by:null,reviewed_at:null};let rows;
 if(old){rows=await sb('/rest/v1/operation_records?'+scope+'&id=eq.'+old.id+'&version=eq.'+old.version+'&deleted=eq.false',{method:'PATCH',body:{...row,version:old.version+1,deleted:input.archive===true},prefer:'return=representation'});if(!rows.length)fail('El registro cambió. Actualice antes de editar.',409);}
 else rows=await sb('/rest/v1/operation_records',{method:'POST',body:{...row,asada_id:asada.id,kind:input.kind,related_id:related,followup_id:followup,created_by:who.user.id},prefer:'return=representation'});
 return json({record:rows[0]},old?200:201);
}
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function validateOperation(kind,p,fail){
 if(!p||typeof p!=='object'||Array.isArray(p))fail('Revise el formulario.');const str=(k,label,max=500,required=true)=>{if(typeof p[k]!=='string'||p[k].length>max||required&&!p[k].trim())fail('Revise '+label+'.');return p[k].trim();};
 if(kind==='point')return {name:str('name','el nombre del punto',160),location:str('location','la ubicación',300),category:str('category','el tipo de punto',100),note:str('note','las observaciones',600,false)};
 const date=p.date,time=p.time;if(!validDate(date)||typeof time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))fail('Revise la fecha y la hora.');const responsible=str('responsible','la persona responsable',160),note=str('note','las observaciones',1000,false);
 if(kind==='log'){const state=str('state','el estado',80);if(!['Pendiente','En proceso','Resuelto'].includes(state))fail('Seleccione el estado.');const due=str('due','la fecha de seguimiento',10,false);if(due&&(!validDate(due)||due<date))fail('Revise la fecha de seguimiento.');const water=validateWater(p,fail);return {date,time,responsible,note,...water,location:str('location','el lugar',300),activity:str('activity','el trabajo realizado',1200),category:str('category','el tipo de trabajo',100),materials:str('materials','los materiales',600,false),state,followupResponsible:str('followupResponsible','el responsable del pendiente',160,state!=='Resuelto'),due};}
 if(kind==='chlorine'){if(!['Libre','Total'].includes(p.type))fail('Seleccione cloro libre o total.');if(typeof p.value!=='number'||!Number.isFinite(p.value)||p.value<0||p.value>100)fail('Ingrese una medición entre 0 y 100 mg/L.');return {date,time,responsible,note,type:p.type,value:p.value,equipment:str('equipment','el equipo o método utilizado',300),action:str('action','la acción realizada',1000,false)};}
 fail('Tipo de registro no válido.');
}

function validateWater(p,fail){
 if(p.waterResults===undefined)return {};
 if(!Array.isArray(p.waterResults)||p.waterResults.length>40)fail('Registre hasta 40 parámetros por labor; continúe en otro registro si necesita más.');
 const clean=(v,n)=>{if(typeof v!=='string'||v.length>n)fail('Revise los datos del análisis de agua.');return v.trim();};
 const waterResults=p.waterResults.map(r=>{if(!r||typeof r!=='object')fail('Revise el parámetro.');const param=QUALITY_PARAMS.find(x=>x.id===r.param);if(!param)fail('Seleccione un parámetro válido.');const unit=clean(r.unit,40),value=clean(r.value,80),ld=clean(r.ld,40),customName=clean(r.customName||'',100);if(!unit)fail('Indique la unidad del resultado.');if(param.id!=='other'&&!parameterUnits(param).includes(unit))fail('Revise la unidad del parámetro.');if(['other','pesticide-other','organochlorine'].includes(param.id)&&!customName)fail('Indique el nombre exacto del parámetro o plaguicida.');const parsed=parseQualityValue(value,ld);if(!value||parsed.kind==='invalid'&&param.id!=='other')fail('Revise el resultado del parámetro.');return {param:param.id,value,unit,ld,...(customName?{customName}: {})};});
 const keys=waterResults.map(r=>r.param+':'+(r.customName||''));if(new Set(keys).size!==keys.length)fail('No repita un parámetro de la misma muestra.');
 const c=p.waterContext;if(!c||typeof c!=='object')fail('Revise los datos de la muestra.');const waterContext=Object.fromEntries(['stage','origin','disinfection','temperature','lab','report','sample'].map(k=>[k,clean(c[k]||'',k==='temperature'?20:100)]));
 if(!['treated','raw','unknown'].includes(waterContext.stage)||!['groundwater','surface','unknown'].includes(waterContext.origin)||!['free','combined','unknown'].includes(waterContext.disinfection))fail('Revise el tipo de agua y desinfección.');
 const serialized=JSON.stringify({...p,waterResults,waterContext}),spacing=(serialized.replace(/"(?:\\.|[^"\\])*"/g,'').match(/[:,]/g)||[]).length;
 if(Buffer.byteLength(serialized,'utf8')+spacing>8500)fail('El registro es muy extenso. Divida los parámetros en otra labor para conservar la información.');
 return {waterResults,waterContext};
}
