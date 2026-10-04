export async function assemblyAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);},who=await authorized(sessionToken(request)),url=new URL(request.url),canEdit=who.admin||['Administración','Junta Directiva'].includes(who.role);
 const input=request.method==='POST'?await body(request):null,requested=input?.asada||url.searchParams.get('asada');let asada=who.asada;
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('La ASADA no está activa.',403);}else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 const year=Number(input?.year||url.searchParams.get('year')),type=input?.type||url.searchParams.get('type');
 if(!Number.isInteger(year)||year<1900||year>2200||!['presidencia','tesoreria','fiscalia'].includes(type))fail('Revise el año y el tipo de informe.');
 const scope='asada_id=eq.'+asada.id+'&year=eq.'+year+'&type=eq.'+type;
 if(api==='assembly-draft'&&request.method==='GET'){const records=await sb('/rest/v1/assembly_drafts?'+scope+'&select=*');return json({draft:records[0]||null,canEdit,asada});}
 if(api!=='assembly-save'||request.method!=='POST')fail('Operación no disponible.',404);if(!canEdit)fail('Su perfil permite consultar; la administración y la Junta pueden guardar borradores.',403);
 const payload=validateAssemblyDraft(input.payload,fail);
 for(const key of ['start','end']){const value=payload.data[key];if(value!==undefined&&(!validDate(value)||!value.startsWith(year+'-')))fail('El período del borrador debe corresponder al año seleccionado.');}
 if(payload.data.start&&payload.data.end&&payload.data.start>payload.data.end)fail('Revise las fechas del borrador.');
 if(payload.source&&(payload.source.year!==year||payload.source.start!==payload.data.start||payload.source.end!==payload.data.end))fail('Actualice las fuentes: no coinciden con el período del borrador.');
 let old=(await sb('/rest/v1/assembly_drafts?'+scope+'&select=id,version'))[0];
 if(old&&(!uuid(input.id)||input.id!==old.id||input.version!==old.version))fail('El borrador cambió o ya existe. Cárguelo antes de guardar para no sobrescribir información.',409);
 if(!old&&(input.id||input.version))fail('El borrador no está disponible.',404);
 const row={payload,updated_by:who.user.id,updated_at:new Date().toISOString()};let rows;
 if(old)rows=await sb('/rest/v1/assembly_drafts?'+scope+'&id=eq.'+old.id+'&version=eq.'+old.version,{method:'PATCH',body:{...row,version:old.version+1},prefer:'return=representation'});
 else rows=await sb('/rest/v1/assembly_drafts',{method:'POST',body:{...row,asada_id:asada.id,year,type,created_by:who.user.id},prefer:'return=representation'});
 if(!rows.length)fail('Otra persona actualizó el borrador. Cárguelo nuevamente.',409);return json({draft:rows[0],canEdit});
}
export function validateAssemblyDraft(p,fail){
 if(!p||typeof p!=='object'||Array.isArray(p)||!p.data||typeof p.data!=='object'||Array.isArray(p.data))fail('El borrador no es válido.');
 const allowed=['data','source','edited'];if(Object.keys(p).some(k=>!allowed.includes(k)))fail('El borrador contiene campos no admitidos.');
 function check(v,depth=0){if(depth>8)fail('El borrador tiene demasiados niveles.');if(v===null||typeof v==='boolean')return;if(typeof v==='number'){if(!Number.isFinite(v))fail('El borrador contiene un monto inválido.');return;}if(typeof v==='string'){if(v.length>30000)fail('Una respuesta es demasiado extensa.');return;}if(Array.isArray(v)){if(v.length>200)fail('Reduzca la cantidad de elementos.');v.forEach(x=>check(x,depth+1));return;}if(typeof v==='object'){if(Object.keys(v).length>180)fail('El borrador contiene demasiados campos.');for(const [k,x]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k)||k.length>100)fail('Campo inválido.');check(x,depth+1);}return;}fail('El borrador contiene información inválida.');}
 check(p);if(Buffer.byteLength(JSON.stringify(p),'utf8')>150000)fail('El borrador supera el tamaño permitido. Reduzca el texto.',413);return p;
}

function validDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;}
