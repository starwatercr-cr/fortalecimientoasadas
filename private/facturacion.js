import {buildRate, previewBills, previewCsv, readingHeaders} from './facturacion-model.js';

const byId=id=>document.getElementById(id);
const form=byId('billing-form');
const tiers=byId('billing-tiers');
const add=byId('billing-add-tier');
const status=byId('billing-status');
const result=byId('billing-result');
const fileInput=byId('billing-file');
const calculate=byId('billing-calculate');
const asadaSelect=byId('billing-asada');
const cloudStatus=byId('billing-cloud-status');
const paymentForm=byId('billing-payment');
const saveButton=byId('billing-save');
const approveButton=byId('billing-approve');
const money=new Intl.NumberFormat('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2});
const volume=new Intl.NumberFormat('es-CR',{maximumFractionDigits:3});
let preview=null, fileRead=0, saved=null, busy=false, example=false, dirty=false;
const inbound=new URLSearchParams(location.search);
const inboundSubscriber=inbound.get('subscriber')||'';
const context=()=>({asada:asadaSelect.value,period:form.elements.period.value});
const buttons=()=>{
 saveButton.disabled=busy||!dirty||example||!asadaSelect.value||!preview?.bills.length||preview.issues.length>0||saved?.status==='approved';
 approveButton.hidden=!saved||saved.status!=='draft'||dirty;
 byId('billing-load').disabled=busy||!asadaSelect.value;
};

function invalidate(){
 dirty=true;
 preview=null;
 result.hidden=true;
 status.textContent='';
 buttons();
}

function addTier(limit='',price=''){
 if(tiers.children.length>=10)return;
 const row=document.createElement('div');
 row.className='fields';
 row.innerHTML='<label>Hasta (m³ acumulados)<input name="limit" inputmode="decimal" required></label>'+
  '<label>Precio por m³ (₡)<input name="price" inputmode="decimal" required></label>'+
  '<button type="button" class="button outline">Quitar tramo</button>';
 row.querySelector('[name="limit"]').value=limit;
 row.querySelector('[name="price"]').value=price;
 row.querySelector('button').onclick=()=>{
  row.remove();
  add.disabled=false;
  invalidate();
  add.focus();
 };
 tiers.append(row);
 add.disabled=tiers.children.length>=10;
 invalidate();
 return row;
}

function download(text,filename){
 const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');
 link.href=url;
 link.download=filename;
 link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function display(report){
 byId('billing-summary').textContent=report.period+' · '+report.bills.length+' lecturas válidas · '+
  report.issues.length+' por revisar · Total de las lecturas válidas: ₡'+money.format(report.totalCents/100);
 const table=document.createDocumentFragment();
 for(const bill of report.bills){
  const row=document.createElement('tr');
  for(const value of [bill.subscriber,...[bill.previous,bill.current,bill.consumption].map(n=>volume.format(n)),
   ...[bill.fixedCents,bill.variableCents,bill.totalCents].map(n=>money.format(n/100))]){
   row.insertCell().textContent=value;
  }
  table.append(row);
 }
 byId('billing-rows').replaceChildren(table);
 byId('billing-issues').replaceChildren(...report.issues.map(({line,subscriber,reason})=>{
  const li=document.createElement('li');
  li.textContent='Fila '+line+(subscriber?' · '+subscriber:'')+' · '+reason;
  return li;
 }));
 const review=byId('billing-review');
 review.hidden=!report.issues.length;
 review.open=Boolean(report.issues.length);
 byId('billing-export').disabled=Boolean(report.issues.length);
 result.hidden=false;
 buttons();
}

const month=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit'}).format(new Date());
form.elements.period.value=month;
form.addEventListener('input',event=>{
 if(event.target===form.elements.period){saved=null;clearAccounts();cloudStatus.textContent='Cargue el lote de este mes si ya lo guardó.';}
 if(event.target===form.elements.readings){fileRead++;calculate.disabled=false;example=false;}
 invalidate();
});
add.onclick=()=>addTier()?.querySelector('input').focus();
byId('billing-example').onclick=()=>{
 fileRead++;
 example=true;
 fileInput.value='';
 calculate.disabled=false;
 tiers.replaceChildren();
 form.elements.fixed.value='2200';
 form.elements.overflow.value='240';
 addTier('10','90');
 addTier('20','150');
 form.elements.readings.value=readingHeaders.join(';')+'\n'+'EJ-001;120;132\nEJ-002;75;75\nEJ-003;201;229';
 status.textContent='Ejemplo cargado con tarifas y lecturas ficticias.';
};
byId('billing-template').onclick=()=>download('\uFEFF'+readingHeaders.join(';')+'\r\n','plantilla-lecturas.csv');
fileInput.addEventListener('change',async()=>{
 const ticket=++fileRead;
 const file=fileInput.files[0];
 fileInput.value='';
 if(!file)return;
 invalidate();
 form.elements.readings.value='';
 calculate.disabled=true;
 try{
  if(file.size>400000)throw Error('Use un archivo CSV de hasta 400 KB.');
  const text=await file.text();
  if(ticket!==fileRead)return;
  example=false;
  form.elements.readings.value=text;
  status.textContent='Archivo cargado. Revise la tarifa y pulse Calcular borrador.';
 }catch(error){
  if(ticket===fileRead)status.textContent=error.message;
 }finally{
  if(ticket===fileRead)calculate.disabled=false;
 }
});
form.addEventListener('submit',event=>{
 event.preventDefault();
 if(calculate.disabled)return;
 invalidate();
 try{
  const data=new FormData(form);
  const rate=buildRate(sourceFields(data));
  preview=previewBills({period:data.get('period'),readings:data.get('readings'),rate});
  display(preview);
  status.textContent=preview.issues.length?'Corrija las lecturas señaladas para descargar el lote.':'Borrador calculado.';
 }catch(error){
  status.textContent=error.message;
 }
});
byId('billing-export').onclick=()=>{
 if(preview)download(previewCsv(preview),'borrador-facturacion-'+preview.period+'.csv');
};

function sourceFields(data=new FormData(form)){
 const prices=data.getAll('price');
 return {fixed:data.get('fixed'),overflow:data.get('overflow'),readings:data.get('readings'),
  tiers:data.getAll('limit').map((limit,i)=>({limit,price:prices[i]}))};
}

async function api(name,input){
 const target='/api/billing-'+name+(input?'':'?'+new URLSearchParams(context()));
 const res=await fetch(target,{credentials:'same-origin',...(input?{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),
 }:{})});
 const data=await res.json();
 if(!res.ok)throw Error(data.error||'No se pudo completar la operación.');
 return data;
}

function clearAccounts(){byId('billing-accounts').hidden=true;paymentForm.reset();}

function showSaved(batch,paid=[]){
 saved=batch;
 clearAccounts();
 if(!batch){dirty=false;cloudStatus.textContent='Este mes todavía no tiene lote guardado.';buttons();return;}
 if(batch.status==='draft'){
  example=false;
  form.elements.fixed.value=batch.source.fixed;
  form.elements.overflow.value=batch.source.overflow;
  form.elements.due.value=batch.due_date;
  form.elements.readings.value=batch.source.readings;
  tiers.replaceChildren();
  add.disabled=false;
  for(const tier of batch.source.tiers)addTier(tier.limit,tier.price);
  preview={period:batch.period.slice(0,7),bills:batch.report,issues:[],totalCents:batch.report.reduce((total,r)=>total+r.totalCents,0)};
  display(preview);
  cloudStatus.textContent='Borrador guardado · '+batch.report.length+' recibos · versión '+batch.version+'.';
 }else{
  cloudStatus.textContent='Lote aprobado para cobro interno · '+batch.report.length+' recibos.';
  const payments=new Map(paid.map(p=>[p.subscriber,Number(p.paid_cents)]));
  const options=[];
  const rows=document.createDocumentFragment();
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica'}).format(new Date());
  let pending=0;
  const ordered=[...batch.report].sort((a,b)=>Number(b.subscriber===inboundSubscriber)-Number(a.subscriber===inboundSubscriber));
  for(const bill of ordered){
   const applied=payments.get(bill.subscriber)||0;
   const balance=bill.totalCents-applied;
   pending+=balance;
   const row=document.createElement('tr');
   if(bill.subscriber===inboundSubscriber)row.className='billing-focused';
   const state=balance===0?'Sin saldo':batch.due_date<today?'Vencido':applied>0?'Pago parcial':'Pendiente';
   for(const value of [bill.subscriber,...[bill.totalCents,applied,balance].map(n=>money.format(n/100)),state]){
    row.insertCell().textContent=value;
   }
   rows.append(row);
   if(balance>0)options.push(new Option(bill.subscriber+' · ₡'+money.format(balance/100),bill.subscriber));
  }
  paymentForm.elements.subscriber.replaceChildren(new Option('Seleccione un abonado',''),...options);
  if(options.some(o=>o.value===inboundSubscriber))paymentForm.elements.subscriber.value=inboundSubscriber;
  byId('billing-accounts-summary').textContent='Vencimiento '+batch.due_date+' · Saldo pendiente: ₡'+money.format(pending/100);
  byId('billing-accounts-rows').replaceChildren(rows);
  byId('billing-accounts').hidden=false;
  paymentForm.hidden=!options.length;
 }
 dirty=false;
 buttons();
}

async function run(action,feedback=cloudStatus){
 if(busy||!asadaSelect.value)return;
 const request=context();
 busy=true;
 asadaSelect.disabled=true;
 form.inert=true;
 byId('billing-example').disabled=true;
 approveButton.disabled=true;
 const paymentButton=paymentForm.querySelector('button');
 paymentButton.disabled=true;
 buttons();
 try{await action(request);}
 catch(error){feedback.textContent=error.message;}
 finally{
  busy=false;
  asadaSelect.disabled=false;
  form.inert=false;
  byId('billing-example').disabled=false;
  approveButton.disabled=false;
  paymentButton.disabled=false;
  buttons();
 }
}

async function loadSaved(){
 fileRead++;
 calculate.disabled=false;
 preview=null;
 result.hidden=true;
 const {batch,paid}=await api('load');
 showSaved(batch,paid);
}

asadaSelect.addEventListener('change',()=>{
 fileRead++;
 calculate.disabled=false;
 saved=null;
 example=false;
 form.elements.readings.value='';
 form.elements.fixed.value='';
 form.elements.overflow.value='';
 form.elements.due.value='';
 tiers.replaceChildren();
 add.disabled=false;
 clearAccounts();
 invalidate();
 cloudStatus.textContent='Seleccione el mes y cargue un lote guardado o prepare un borrador.';
});
byId('billing-load').onclick=()=>run(loadSaved);
saveButton.onclick=()=>{
 if(!dirty||!preview||preview.issues.length||example)return;
 if(!form.elements.due.value){cloudStatus.textContent='Indique la fecha de vencimiento para guardar.';form.elements.due.focus();return;}
 const source=sourceFields(),due=form.elements.due.value,version=saved?.version;
 run(async request=>{
  const {batch}=await api('save',{...request,...source,due,version});
  preview=null;
  result.hidden=true;
  showSaved(batch);
 });
};
approveButton.onclick=()=>{
 if(!saved||saved.status!=='draft'||dirty)return;
 if(!window.confirm('¿Poner al cobro interno '+saved.report.length+' recibos por ₡'+money.format(preview.totalCents/100)+'? Los montos quedarán fijos.'))return;
 const version=saved.version;
 run(async request=>{await api('approve',{...request,version});await loadSaved();});
};
paymentForm.addEventListener('submit',event=>{
 event.preventDefault();
 const fields=Object.fromEntries(new FormData(paymentForm));
 const feedback=byId('billing-payment-status');
 run(async request=>{
  await api('payment',{...request,...fields});
  await loadSaved();
  cloudStatus.textContent+=' Pago aplicado.';
 },feedback);
});

(async()=>{
 try{
  const {asadas}=await api('asadas');
  asadaSelect.replaceChildren(new Option('Seleccione una ASADA',''),...asadas.map(a=>new Option(a.name,a.id)));
  const requested=inbound.get('asada'),period=inbound.get('period');
  if(asadas.some(a=>a.id===requested))asadaSelect.value=requested;
  else if(asadas.length===1)asadaSelect.value=asadas[0].id;
  if(/^20\d{2}-(0[1-9]|1[0-2])$/.test(period||''))form.elements.period.value=period;
  asadaSelect.disabled=false;
  cloudStatus.textContent=asadas.length?'Seleccione el mes. Puede cargar un lote guardado o preparar uno nuevo.':'No hay ASADAS activas para su acceso.';
  buttons();
  if(inboundSubscriber&&asadaSelect.value)await run(loadSaved);
 }catch(error){cloudStatus.textContent=error.message;}
})();
