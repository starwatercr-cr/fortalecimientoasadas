import {normalizeService,registryFields,readingPlan} from '../../private/billing-registry-model.js';
import {categories, normalizeTariff, paymentCents, previewBills, validMonth, billingHistoryRows} from '../../private/facturacion-model.js';

// Keep the pilot restricted to the owner's verified platform account.
export const billingOwnerId='55c49ed1-78ad-4169-915a-856cf6e9f45e';
export const canManageBilling=who=>who.admin===true&&!who.external&&who.user?.id===billingOwnerId;

export async function billingAPI(api,request,{who,sb,body,uuid,json,PublicError}){
 const fail=(message,status=400)=>{throw new PublicError(status,message);};
 if(!canManageBilling(who))fail('La facturación de agua está en construcción.',403);
 const url=new URL(request.url);
 const input=request.method==='POST'?await body(request):null;
 const method=request.method;
 if(method==='POST'&&(!input||typeof input!=='object'||Array.isArray(input)))fail('Revise la información enviada.');
 if(api==='billing-asadas'&&method==='GET'){
  const asadas=await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc');
  return json({asadas});
 }
 const requested=input?.asada??url.searchParams.get('asada');
 if(!uuid(requested))fail('Seleccione una ASADA.');
 const [asada]=await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name');
 if(!asada)fail('ASADA no disponible.',403);
 const paidTotals=async(batchId)=>{
  const rows=[];
  for(let offset=0;;offset+=500){
   const part=await sb('/rest/v1/rpc/billing_paid_totals?order=subscriber.asc&limit=500&offset='+offset,{
    method:'POST',body:{p_asada:asada.id,p_batch:batchId},
   });
   rows.push(...part);
   if(part.length<500)return rows;
  }
 };
 const registry=async()=>{
  const rows=[];
  for(let offset=0;;offset+=500){
   const part=await sb('/rest/v1/billing_services?asada_id=eq.'+asada.id+'&select=id,code,payload,version&order=code_key.asc&limit=500&offset='+offset);
   rows.push(...part);
   if(part.length<500)return rows;
  }
 };
 const validateRegistryBills=async(bills,period,snapshot)=>{
  const services=await registry();
  if(services.length){
   const byCode=new Map(services.map(r=>[r.code,r.payload]));
   for(const bill of bills){
    const service=byCode.get(bill.subscriber);
    if(!service||service.status!=='activo')fail('Paja '+bill.subscriber+' no está activa en el padrón.');
    if(service.category!==bill.category)fail('Revise la categoría tarifaria de la paja '+bill.subscriber+' según el padrón.');
    if(service.initialPeriod&&service.initialPeriod>period)fail('La paja '+bill.subscriber+' aún no inicia en este período.');
    if(service.initialPeriod===period&&Number(service.initialReading)!==bill.previous)fail('La lectura anterior de la paja '+bill.subscriber+' no coincide con la lectura inicial registrada.');
    if(snapshot){bill.name=service.name;bill.meter=service.meter;}
    else if(bill.meter!==undefined&&bill.meter!==service.meter)fail('Cambió el medidor de la paja '+bill.subscriber+'. Recalcule el borrador.',409);
   }
  }
 };
 if(api==='billing-registry'&&method==='GET')return json({asada,services:await registry()});
 if(api==='billing-registry-save'&&method==='POST'){
  let service;
  try{service=normalizeService(input.service);}catch(error){fail(error.message);}
  const values={payload:service,updated_by:who.user.id,updated_at:new Date().toISOString()};
  if(input.id){
   if(!uuid(input.id)||!Number.isInteger(input.version)||input.version<1)fail('Vuelva a abrir el registro.');
   const existing=(await registry()).find(r=>r.id===input.id);
   if(!existing||existing.code!==service.code)fail('El número de paja identifica el servicio y no se puede modificar.',409);
   if(existing.payload.meter!==service.meter&&existing.payload.meter&&(!service.initialPeriod||!service.initialReading||service.initialPeriod===existing.payload.initialPeriod))fail('Si reemplaza el medidor, indique un nuevo primer mes y su lectura inicial.');
   const rows=await sb('/rest/v1/billing_services?asada_id=eq.'+asada.id+'&id=eq.'+input.id+'&version=eq.'+input.version,
    {method:'PATCH',prefer:'return=representation',body:{...values,version:input.version+1}});
   if(!rows.length)fail('El registro cambió. Actualice el padrón.',409);
   return json({service:rows[0]});
  }
  const rows=await sb('/rest/v1/billing_services',{method:'POST',prefer:'return=representation',
   body:{...values,code:service.code,asada_id:asada.id,created_by:who.user.id}});
  return json({service:rows[0]},201);
 }
 if(api==='billing-registry-import'&&method==='POST'){
  if(input.confirm!==true||!Array.isArray(input.services)||!input.services.length||input.services.length>500)fail('Confirme un bloque revisado de hasta 500 servicios.');
  let entries;
  try{entries=input.services.map(normalizeService);}catch(error){fail(error.message);}
  const existing=new Map((await registry()).map(r=>[r.code.toLowerCase(),r]));
  const seen=new Set(),pending=[];
  for(const service of entries){
   const key=service.code.toLowerCase(),old=existing.get(key);
   if(seen.has(key))fail('Hay números de paja repetidos en la importación.');
   seen.add(key);
   if(old){
    if(!Object.keys(registryFields).every(k=>old.payload[k]===service[k]))fail('Una paja ya registrada tiene datos diferentes. Actualice la revisión.',409);
    continue;
   }
   pending.push({asada_id:asada.id,code:service.code,payload:service,created_by:who.user.id,updated_by:who.user.id});
  }
  if(pending.length)await sb('/rest/v1/billing_services',{method:'POST',body:pending});
  return json({added:pending.length,existing:entries.length-pending.length});
 }
 if(api==='billing-reading-plan'&&method==='GET'){
  const period=url.searchParams.get('period');
  if(!validMonth(period))fail('Seleccione un mes válido.');
  const previous=new Date(period+'-01T12:00:00Z');
  previous.setUTCMonth(previous.getUTCMonth()-1);
  const batches=await sb('/rest/v1/billing_batches?asada_id=eq.'+asada.id+'&status=eq.approved&period=eq.'+previous.toISOString().slice(0,10)+'&select=report');
  return json({rows:readingPlan(await registry(),batches[0]?.report,period)});
 }
 if(api==='billing-history'&&method==='GET'){
  const year=url.searchParams.get('year');
  if(!/^20\d{2}$/.test(year||''))fail('Seleccione un año válido.');
  const batches=await sb('/rest/v1/billing_batches?asada_id=eq.'+asada.id+
   '&status=eq.approved&period=gte.'+year+'-01-01&period=lt.'+(Number(year)+1)+'-01-01&select=id,period,due_date,report&order=period.asc&limit=12');
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica'}).format(new Date());
  const rows=(await Promise.all(batches.map(async batch=>{
   const paid=await paidTotals(batch.id);
   return billingHistoryRows(batch,paid,today);
  }))).flat();
  return json({asada,year,today,rows});
 }
 const period=input?.period??url.searchParams.get('period');
 if(!validMonth(period))fail('Seleccione un mes válido.');
 const tariffs=async()=>{
  const rows=await sb('/rest/v1/rpc/billing_tariffs_for_month',{method:'POST',body:{p_asada:asada.id,p_period:period+'-01'}});
  return rows.map(({id,profile})=>({...profile,id}));
 };
 if(api==='billing-tariffs'&&method==='GET')return json({profiles:await tariffs()});
 if(api==='billing-tariff-save'&&method==='POST'){
  if(input.confirm!==true)fail('Confirme que verificó la tarifa aplicable de esta ASADA.');
  let profile;
  try{profile=normalizeTariff(input.profile);}
  catch(error){fail(error.message);}
  const [saved]=await sb('/rest/v1/billing_tariff_profiles',{method:'POST',prefer:'return=representation',
   body:{asada_id:asada.id,category:profile.category,effective_month:profile.from+'-01',profile,created_by:who.user.id},
  });
  return json({id:saved.id},201);
 }
 const table='/rest/v1/billing_batches?asada_id=eq.'+asada.id+'&period=eq.'+period+'-01';
 const [batch]=await sb(table+'&select=id,period,due_date,status,version,source,report,approved_at');
 if(api==='billing-load'&&method==='GET'){
  const paid=batch?.status==='approved'?await paidTotals(batch.id):[];
  return json({batch:batch||null,paid});
 }
 if(api==='billing-save'&&method==='POST'){
  if(batch&&(batch.status!=='draft'||input.version!==batch.version))fail('El lote cambió o ya fue aprobado. Cárguelo antes de continuar.',409);
  if(!batch&&input.version!=null)fail('Vuelva a cargar el período antes de guardar.',409);
  if(typeof input.readings!=='string'||typeof input.defaultCategory!=='string'||input.defaultCategory&&!Object.hasOwn(categories,input.defaultCategory))fail('Revise las lecturas y la categoría.');
  if(typeof input.due!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(input.due))fail('Indique la fecha de vencimiento.');
  const date=new Date(input.due+'T12:00:00Z');
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==input.due||input.due<period+'-01')fail('Revise la fecha de vencimiento.');
  const profiles=await tariffs();
  if(!profiles.length)fail('Configure primero las tarifas aplicables de la ASADA.');
  const {readings,defaultCategory}=input;
  let report;
  try{report=previewBills({period,readings,profiles,defaultCategory});}
  catch(error){fail(error.message);}
  if(report.issues.length||!report.bills.length)fail('Corrija las lecturas marcadas antes de guardar.');
  await validateRegistryBills(report.bills,period,true);
  const used=new Set(report.bills.map(bill=>bill.category));
  const applied=profiles.filter(p=>used.has(p.category));
  const ids=new Set(Array.isArray(input.profileIds)?input.profileIds:[]);
  if(ids.size!==applied.length||applied.some(p=>!ids.has(p.id)))fail('Cambió la tarifa aplicable. Calcule el borrador nuevamente.',409);
  const source={readings,defaultCategory,profiles:applied};
  const values={source,report:report.bills,due_date:input.due,updated_by:who.user.id};
  const saved=batch?await sb(table+'&version=eq.'+batch.version+'&status=eq.draft',{
   method:'PATCH',prefer:'return=representation',body:{...values,version:batch.version+1},
  }):await sb('/rest/v1/billing_batches',{
   method:'POST',prefer:'return=representation',body:{...values,asada_id:asada.id,period:period+'-01',created_by:who.user.id},
  });
  if(!saved.length)fail('Otra persona actualizó el lote. Vuelva a cargarlo.',409);
  return json({batch:saved[0],paid:[]});
 }
 if(!batch)fail('Guarde el borrador del período primero.',404);
 if(api==='billing-approve'&&method==='POST'){
  if(batch.status==='approved'&&input.version===batch.version-1)return json({ok:true});
  if(batch.status!=='draft'||input.version!==batch.version)fail('El lote cambió. Vuelva a cargarlo y revise los montos.',409);
  await validateRegistryBills(batch.report,period,false);
  const configured=await tariffs();
  if(!batch.source.profiles?.length||batch.source.profiles.some(p=>!configured.some(active=>active.id===p.id)))fail('La tarifa del lote cambió o falta su respaldo. Recalcule y vuelva a guardar el borrador.',409);
  const saved=await sb(table+'&version=eq.'+batch.version+'&status=eq.draft',{
   method:'PATCH',prefer:'return=representation',body:{status:'approved',version:batch.version+1,approved_at:new Date().toISOString(),approved_by:who.user.id,updated_by:who.user.id},
  });
  if(!saved.length)fail('Otra persona actualizó el lote. Vuelva a cargarlo.',409);
  return json({ok:true});
 }
 if(api==='billing-payment'&&method==='POST'){
  if(batch.status!=='approved')fail('Apruebe el lote antes de registrar pagos.',409);
  const reference=typeof input.reference==='string'?input.reference.trim().toUpperCase():'';
  if(!reference||reference.length>100||/[\r\n\t]/.test(reference))fail('Indique una referencia bancaria válida.');
  if(typeof input.subscriber!=='string'||!batch.report.some(r=>r.subscriber===input.subscriber))fail('Seleccione un abonado del lote.');
  let cents;
  try{cents=paymentCents(input.amount);}
  catch(error){fail(error.message);}
  if(cents<=0)fail('El monto del pago debe ser mayor que cero.');
  await sb('/rest/v1/rpc/billing_register_payment',{
   method:'POST',body:{p_asada:asada.id,p_batch:batch.id,p_subscriber:input.subscriber,p_amount:cents,p_reference:reference,p_actor:who.user.id},
  });
  return json({ok:true});
 }
 fail('Operación no disponible.',404);
}
