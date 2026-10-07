import {agreementMatches} from './agreement-search.mjs';
import {computeWater} from '../../private/water-model.js';
const kinds=['settings','movement','petty','budget','statement','asset','agreement','payment','workplan','water'];
export async function panelAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError,profileStorage}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);};
 const who=await authorized(sessionToken(request));const url=new URL(request.url);
 if(api==='panel-asadas')return json({isPlatformAdmin:who.admin===true,asadas:who.admin?await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc'):[who.asada],canEdit:who.admin||['Administración','Junta Directiva'].includes(who.role)});
 const input=request.method==='POST'?await body(request):null;
 const requested=input?.asada||url.searchParams.get('asada');
 let asada=who.asada;
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+encodeURIComponent(requested)+'&active=eq.true&select=id,name'))?.[0];if(!asada)fail('La ASADA no está activa.',403);}
 else if(requested&&requested!==asada.id)fail('No tiene acceso a esta ASADA.',403);
 if(api==='panel-agreements'&&request.method==='GET'){
  const raw=url.searchParams.get('year'),y=raw&&raw!=='all'?Number(raw):null; if(y!==null&&(!Number.isInteger(y)||y<1900||y>2200))fail('Seleccione un año válido.');const q=(url.searchParams.get('q')||'').trim(),offset=Number(url.searchParams.get('offset')||0);
  if(q.length>200||!Number.isInteger(offset)||offset<0||offset>50000)fail('Revise la búsqueda.');
  let matches=[];
  for(let start=0;start<50000;start+=1000){
   const rows=await sb('/rest/v1/panel_records?asada_id=eq.'+asada.id+'&kind=eq.agreement&deleted=eq.false'+(y?'&year=eq.'+y:'')+'&select=id,year,kind,payload,version,created_at,updated_at&order=year.desc,created_at.desc,id.asc&offset='+start+'&limit=1000');
   matches.push(...rows.filter(r=>r.kind==='agreement'&&!r.deleted&&agreementMatches(r,q)));
   if(rows.length<1000)return json({asada,year:y,query:q,records:matches.slice(offset,offset+50),total:matches.length,offset,limit:50,canEdit:who.admin||['Administración','Junta Directiva'].includes(who.role)});
  }
  fail('Seleccione un año para reducir la consulta.',413);
 }
 if(api==='panel-agreement-file'&&request.method==='GET'){
  const id=url.searchParams.get('id');if(!uuid(id))fail('Acuerdo inválido.');
  const record=(await sb('/rest/v1/panel_records?asada_id=eq.'+asada.id+'&id=eq.'+id+'&kind=eq.agreement&deleted=eq.false&select=id,kind,payload'))?.[0];
  if(!record||record.kind!=='agreement'||!uuid(record.payload?.documentId))fail('Este acuerdo no tiene un respaldo disponible.',404);
  const doc=(await sb('/rest/v1/asada_documents?asada_id=eq.'+asada.id+'&id=eq.'+record.payload.documentId+'&select=*'))?.[0];
  if(!doc||doc.category!=='Acuerdo de Junta Directiva'||typeof doc.path!=='string'||!doc.path.startsWith(asada.id+'/'))fail('El respaldo no está disponible para este acuerdo.',404);
  return new Response(await profileStorage('GET',doc.path),{headers:{'Content-Type':doc.type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(doc.filename),'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'}});
 }
 const year=Number(input?.year||url.searchParams.get('year'));if(!Number.isInteger(year)||year<1900||year>2200)fail('Seleccione un año válido.');
 const scope='asada_id=eq.'+asada.id+'&year=eq.'+year;
 if(['panel-data','panel-planning'].includes(api)&&request.method==='GET'){
  let records=[];for(let offset=0;offset<50000;offset+=1000){const rows=await sb('/rest/v1/panel_records?'+scope+(api==='panel-planning'?'&kind=in.(workplan,water)':'')+'&deleted=eq.false&select=id,year,kind,payload,version,created_at,updated_at&order=created_at.asc,id.asc&limit=1000&offset='+offset);records.push(...rows);if(rows.length<1000)return json({asada,year,records,canEdit:who.admin||['Administración','Junta Directiva'].includes(who.role),canSaveWater:who.admin||['Administración','Junta Directiva','Operación'].includes(who.role)});}
  fail('Este período requiere una consulta por bloques. Contacte a Star Water.',413);
 }
 if(api==='panel-history'&&request.method==='GET')return json({changes:await sb('/rest/v1/panel_changes?'+scope+'&select=id,record_id,actor,action,changed_at,current_data&order=changed_at.desc&limit=200')});
 if(api!=='panel-save'||request.method!=='POST')fail('Operación no disponible.',404);
 if(!who.admin&&!['Administración','Junta Directiva'].includes(who.role)&&!(input.kind==='water'&&who.role==='Operación'))fail('Su perfil permite consultar. La administración o la Junta pueden guardar cambios.',403);
 if(!kinds.includes(input.kind))fail('Seleccione un tipo de registro válido.');
 let old=null;if(input.id){if(!uuid(input.id)||!Number.isInteger(input.version)||input.version<1)fail('El registro no es válido.');old=(await sb('/rest/v1/panel_records?'+scope+'&id=eq.'+input.id+'&deleted=eq.false&select=id,kind,version,payload'))?.[0];if(!old||old.kind!==input.kind)fail('El registro no está disponible.',404);if(old.version!==input.version)fail('Otra persona actualizó este registro. Recargue los datos antes de editarlo.',409);}
 if(input.archive&&!old)fail('Seleccione el registro que desea archivar.');
 const payload=input.archive?old.payload:validate(input.kind,input.payload,year,fail);
 if(input.kind==='payment'){
  if(input.archive&&['Aprobado','Pagado'].includes(old?.payload.state))fail('Los pagos aprobados o pagados se conservan. Registre una devolución para revisión antes de archivar.',409);
  if(!input.archive){
   if(old?.payload.state==='Aprobado'&&payload.state==='Pendiente de aprobación')fail('Devuelva el pago a revisión y explique el motivo antes de volver a presentarlo.',409);
   if(old?.payload.state==='Pagado'&&payload.state!=='Pagado')fail('Un pago realizado no puede volver a pendiente.',409);
   if(old&&['Aprobado','Pagado'].includes(old.payload.state)&&['Aprobado','Pagado'].includes(payload.state)&&['date','supplier','supplierTax','invoice','concept','amount','session','sessionDate','agreement','approvalDate','approvalBy','paidDate','paymentRef'].some(k=>old.payload[k]!==payload[k]&&!(old.payload.state==='Aprobado'&&['paidDate','paymentRef'].includes(k))))fail('Para modificar un pago aprobado, devuélvalo primero a revisión. Un pago realizado conserva sus datos.',409);
   if(payload.state==='Pagado'&&(!old||!['Aprobado','Pagado'].includes(old.payload.state)))fail('Registre primero la aprobación de Junta Directiva antes de marcarlo pagado.');
   if(payload.documentId){if(!uuid(payload.documentId))fail('Adjunto inválido.');const document=(await sb('/rest/v1/asada_documents?asada_id=eq.'+asada.id+'&id=eq.'+payload.documentId+'&select=id'))?.[0];if(!document)fail('El documento no pertenece a esta ASADA.',403);}
  }
 }
 if(input.kind==='agreement'&&payload.documentId){
  if(!uuid(payload.documentId))fail('Adjunto del acuerdo inválido.');
  const document=(await sb('/rest/v1/asada_documents?asada_id=eq.'+asada.id+'&id=eq.'+payload.documentId+'&select=id,category'))?.[0];
  if(!document||document.category!=='Acuerdo de Junta Directiva')fail('El respaldo del acuerdo no pertenece a esta ASADA o no corresponde a un acuerdo.',403);
 }
 if(new TextEncoder().encode(JSON.stringify(payload)).length>10000)fail('El registro es demasiado extenso. Reduzca las observaciones o la cantidad de fuentes.',413);
 const row={payload,updated_by:who.user.id,updated_at:new Date().toISOString()};
 let result;
 if(old){result=await sb('/rest/v1/panel_records?'+scope+'&id=eq.'+old.id+'&version=eq.'+input.version+'&deleted=eq.false',{method:'PATCH',body:{...row,version:input.version+1,deleted:input.archive===true},prefer:'return=representation'});if(!result.length)fail('Otra persona actualizó este registro. Recargue los datos antes de editarlo.',409);}
 else result=await sb('/rest/v1/panel_records',{method:'POST',body:{...row,asada_id:asada.id,year,kind:input.kind,created_by:who.user.id},prefer:'return=representation'});
 return json({record:result[0]},old?200:201);
}
function validate(kind,p,y,fail){
 if(!p||typeof p!=='object'||Array.isArray(p))fail('Revise los datos del formulario.');
 const str=(k,max=160,required=true)=>{if(typeof p[k]!=='string'||p[k].length>max||(required&&!p[k].trim()))fail('Revise el campo '+k+'.');return p[k].trim();};
 const num=(k,negative=false)=>{const n=p[k];if(typeof n!=='number'||!Number.isFinite(n)||(!negative&&n<0)||Math.abs(n)>1e12)fail('Revise el monto '+k+'.');return Math.round(n*100)/100;};
 const date=(k,rule='same')=>{const s=str(k,10),d=new Date(s+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==s||rule==='same'&&!s.startsWith(y+'-')||rule==='before'&&Number(s.slice(0,4))>y)fail('Revise la fecha '+k+' y el período del registro.');return s;};
 const classification=()=>{
  const result={};
  const choices={service:['Sin clasificar','Acueducto','Alcantarillado','Hidrantes','Protección del recurso hídrico'],budgetType:['income','expense','investment'],group:['Sin clasificar','Ingresos','Operativos','Administrativos','Financieros','Inversiones']};
  for(const [key,list] of Object.entries(choices))if(p[key]!==undefined){if(!list.includes(p[key]))fail('Revise la clasificación presupuestaria.');result[key]=p[key];}
  const type=result.budgetType||(kind==='movement'&&p.type==='in'?'income':'expense');
  if(kind==='movement'&&((p.type==='in')!==(type==='income')))fail('Las entradas corresponden a ingresos; las salidas a gastos o inversiones.');
  if(kind==='petty'&&type==='income')fail('Caja chica registra salidas, no ingresos.');
  if(result.group&&result.group!=='Sin clasificar'&&!(type==='income'?result.group==='Ingresos':type==='investment'?result.group==='Inversiones':['Operativos','Administrativos','Financieros'].includes(result.group)))fail('El grupo no corresponde al tipo de presupuesto.');
  return result;
 };

 if(kind==='workplan'){
  if(!['Junta Directiva','Administración','Operación'].includes(p.area))fail('Seleccione el área responsable.');
  if(!['Pendiente','En proceso','Cumplido','Cancelado'].includes(p.state))fail('Seleccione el estado de la actividad.');
  if(!['Borrador','Aprobado'].includes(p.approval))fail('Revise la aprobación del plan.');
  const progress=num('progress');if(progress>100||p.state==='Cumplido'&&progress!==100||p.state!=='Cumplido'&&progress===100)fail('El avance de 100 % corresponde al estado Cumplido.');
  const start=date('date'),due=date('due');if(due<start)fail('La fecha final no puede ser anterior al inicio.');
  const approvalDate=p.approvalDate?date('approvalDate','any'):'',agreement=str('agreement',160,false);
  if(p.approval==='Aprobado'&&(!approvalDate||!agreement))fail('Registre la fecha y referencia del acuerdo que aprueba esta actividad.');
  return {objective:str('objective',500),title:str('title',500),indicator:str('indicator',300),target:str('target',300),area:p.area,responsible:str('responsible'),date:start,due,budget:num('budget'),part:str('part',160,false),progress,state:p.state,approval:p.approval,approvalDate,agreement,note:str('note',1500,false)};
 }
 if(kind==='water'){
  const numeric=(obj,key,max,integer=false,nullable=true)=>{const n=obj[key];if(nullable&&n===null)return null;if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>max||integer&&!Number.isInteger(n))fail('Revise el dato '+key+' del balance hídrico.');return n;};
  if(p.example===true)fail('Los ejemplos ficticios no se guardan como datos de la ASADA.');
  if(!['summer','winter'].includes(p.season))fail('Seleccione la época del escenario.');
  if(!Array.isArray(p.sources)||!p.sources.length||p.sources.length>20)fail('Ingrese entre 1 y 20 fuentes.');
  const sources=p.sources.map(source=>{if(!source||typeof source!=='object')fail('Revise las fuentes.');const name=source.name;if(typeof name!=='string'||!name.trim()||name.length>80)fail('Revise el nombre de la fuente.');const out={name:name.trim(),summer:numeric(source,'summer',1e6),winter:numeric(source,'winter',1e6)};for(const key of ['summerDate','winterDate']){const value=source[key];if(typeof value!=='string')fail('Revise la fecha de aforo.');if(value){const d=new Date(value+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)fail('Revise la fecha de aforo.');}out[key]=value;}return out;});
  const days=numeric(p,'days',366,true,false);if(days<1)fail('El período debe tener al menos un día.');
  const d={days,flows:sources.map(source=>source[p.season]),connections:numeric(p,'connections',1e6,true),average:numeric(p,'average',1e5),loss:numeric(p,'loss',95),input:numeric(p,'input',1e9),recorded:numeric(p,'recorded',1e9),reduction:numeric(p,'reduction',100,false,false),added:numeric(p,'added',1e6,true,false),improvement:numeric(p,'improvement',50,false,false)};
  if(d.connections===0||d.average===0)fail('Conexiones y consumo promedio deben ser positivos o quedar pendientes.');
  const results=computeWater(d);
  return {name:str('name',120),date:date('date'),note:str('note',1000,false),season:p.season,sources,...Object.fromEntries(Object.entries(d).filter(([key])=>key!=='flows')),results,modelVersion:1};
 }
 if(kind==='settings')return {opening:num('opening',true),fund:num('fund'),note:str('note',1000,false)};
 if(kind==='movement'){if(!['in','out'].includes(p.type))fail('Seleccione entrada o salida.');if(num('amount')<=0)fail('El monto debe ser mayor que cero.');return {date:date('date'),type:p.type,amount:num('amount'),part:str('part'),concept:str('concept',500),reference:str('reference',160,false),...classification()};}
 if(kind==='petty'){if(num('amount')<=0)fail('El monto debe ser mayor que cero.');if(typeof p.reimbursed!=='boolean')fail('Revise el reintegro.');return {date:date('date'),amount:num('amount'),concept:str('concept',500),reference:str('reference',160),responsible:str('responsible'),reimbursed:p.reimbursed,...(p.part!==undefined?{part:str('part')}:{}),...classification()};}
 if(kind==='budget')return {part:str('part'),amount:num('amount'),reference:str('reference',500,false),...classification()};
 if(kind==='statement'){const result={};for(const k of ['cash','receivables','fixed','other','liabilities','payables','equity','income','expenses'])result[k]=num(k,k==='equity');if(result.payables>result.liabilities)fail('Las cuentas por pagar no pueden superar el total de pasivos.');return {...result,date:date('date'),note:str('note',1000,false)};}
 if(kind==='asset'){const cost=num('cost'),depreciation=num('depreciation');if(depreciation>cost)fail('La depreciación acumulada no puede superar el costo.');return {code:str('code',80),name:str('name'),category:str('category'),date:date('date','before'),cost,depreciation,life:num('life'),location:str('location'),responsible:str('responsible'),state:str('state',80)};}
 if(kind==='payment'){
  if(!['Pendiente de aprobación','Aprobado','Devuelto para revisión','Pagado'].includes(p.state))fail('Seleccione el estado del pago.');
  const out={date:date('date'),supplier:str('supplier'),supplierTax:str('supplierTax',50,false),invoice:str('invoice',100),concept:str('concept',1000),amount:num('amount'),state:p.state,session:str('session',80,false),sessionDate:p.sessionDate?date('sessionDate','any'):'',agreement:str('agreement',80,false),approvalDate:p.approvalDate?date('approvalDate','any'):'',approvalBy:str('approvalBy',160,false),paidDate:p.paidDate?date('paidDate','any'):'',paymentRef:str('paymentRef',160,false),note:str('note',1500,false),documentId:p.documentId===undefined?'':str('documentId',36,false)};
  if(out.amount<=0)fail('El monto a pagar debe ser mayor que cero.');
  if(['Aprobado','Pagado'].includes(out.state)&&(!out.session||!out.sessionDate||!out.agreement||!out.approvalDate||!out.approvalBy||p.confirmApproval!==true))fail('Complete sesión, fecha, acuerdo y responsable; confirme que la aprobación consta en el acta.');
  if(out.state==='Pagado'&&(!out.paidDate||!out.paymentRef||out.paidDate<out.approvalDate))fail('Complete la fecha y referencia del pago; no puede ser anterior a la aprobación.');
  if(out.state==='Devuelto para revisión'&&!out.note)fail('Explique por qué se devuelve el pago para revisión.');
  if(!['Aprobado','Pagado'].includes(out.state)){out.agreement='';out.approvalDate='';out.approvalBy='';out.paidDate='';out.paymentRef='';}
  if(out.state==='Aprobado'){out.paidDate='';out.paymentRef='';}
  return out;
 }
 if(kind==='agreement'){if(!['Pendiente','En proceso','Cumplido'].includes(p.state))fail('Seleccione el estado del acuerdo.');const progress=num('progress');if(progress>100||p.state==='Cumplido'&&progress!==100||p.state!=='Cumplido'&&progress===100)fail('Un avance del 100 % debe corresponder al estado Cumplido.');return {code:str('code',80),title:str('title',500),date:date('date'),due:date('due','any'),responsible:str('responsible'),progress,state:p.state,note:str('note',1500,false),text:p.text===undefined?'':str('text',4000,false),keywords:p.keywords===undefined?'':str('keywords',300,false),documentId:p.documentId===undefined?'':str('documentId',36,false)};}
}

