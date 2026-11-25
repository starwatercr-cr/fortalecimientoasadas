import {buildRate, paymentCents, previewBills} from '../../private/facturacion-model.js';

export const canManageBilling=who=>who.admin||!who.external&&who.role==='Administración';

export async function billingAPI(api,request,{who,sb,body,uuid,json,PublicError}){
 const fail=(message,status=400)=>{throw new PublicError(status,message);};
 if(!canManageBilling(who))fail('La facturación corresponde a la administración de la ASADA.',403);
 const url=new URL(request.url);
 const input=request.method==='POST'?await body(request):null;
 const method=request.method;
 if(method==='POST'&&(!input||typeof input!=='object'||Array.isArray(input)))fail('Revise la información enviada.');
 if(api==='billing-asadas'&&method==='GET'){
  const asadas=who.admin?await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc'):[who.asada];
  return json({asadas});
 }
 const requested=input?.asada??url.searchParams.get('asada');
 let asada=who.asada;
 if(who.admin){
  if(!uuid(requested))fail('Seleccione una ASADA.');
  [asada]=await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name');
 }else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 if(!asada)fail('ASADA no disponible.',403);
 const period=input?.period??url.searchParams.get('period');
 if(typeof period!=='string'||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period))fail('Seleccione un mes válido.');
 const table='/rest/v1/billing_batches?asada_id=eq.'+asada.id+'&period=eq.'+period+'-01';
 const [batch]=await sb(table+'&select=id,period,due_date,status,version,source,report,approved_at');
 if(api==='billing-load'&&method==='GET'){
  const paid=batch?.status==='approved'?await sb('/rest/v1/rpc/billing_paid_totals',{
   method:'POST',body:{p_asada:asada.id,p_batch:batch.id},
  }):[];
  return json({batch:batch||null,paid});
 }
 if(api==='billing-save'&&method==='POST'){
  if(batch&&(batch.status!=='draft'||input.version!==batch.version))fail('El lote cambió o ya fue aprobado. Cárguelo antes de continuar.',409);
  if(!batch&&input.version!=null)fail('Vuelva a cargar el período antes de guardar.',409);
  if(typeof input.readings!=='string'||typeof input.fixed!=='string'||typeof input.overflow!=='string')fail('Revise la tarifa y las lecturas.');
  if(typeof input.due!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(input.due))fail('Indique la fecha de vencimiento.');
  const date=new Date(input.due+'T12:00:00Z');
  if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==input.due||input.due<period+'-01')fail('Revise la fecha de vencimiento.');
  const source={readings:input.readings,fixed:input.fixed,overflow:input.overflow,tiers:input.tiers};
  let report;
  try{report=previewBills({period,readings:source.readings,rate:buildRate(source)});}
  catch(error){fail(error.message);}
  if(report.issues.length||!report.bills.length)fail('Corrija las lecturas marcadas antes de guardar.');
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
