import {buildRate, categories, normalizeTariff, previewBills, previewCsv, readingHeaders, validMonth} from './facturacion-model.js?v=2';

const byId=id=>document.getElementById(id);
const form=byId('billing-form');
const tiers=byId('billing-tiers');
const add=byId('billing-add-tier');
const profileForm=byId('billing-profile');
const resourceTiers=byId('billing-resource-tiers');
const addResource=byId('billing-add-resource');
const profileStatus=byId('billing-rate-status');
const profileSave=byId('billing-save-rate');
let profiles=[], profileRequest=0;
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
 approveButton.hidden=!saved||saved.status!=='draft'||dirty||!saved.source.profiles?.length;
 byId('billing-load').disabled=busy||!asadaSelect.value;
 profileSave.disabled=busy||!asadaSelect.value;
};

function invalidate(){
 dirty=true;
 preview=null;
 result.hidden=true;
 status.textContent='';
 buttons();
}

function addTier(limit='',price='',resource=false){
 const container=resource?resourceTiers:tiers,button=resource?addResource:add;
 if(container.children.length>=10)return;
 const row=document.createElement('div');
 row.className='fields';
 row.innerHTML='<label>Hasta (m³ acumulados)<input inputmode="decimal" required></label>'+
  '<label>Precio por m³ (₡)<input inputmode="decimal" required></label>'+
  '<button type="button" class="button outline">Quitar tramo</button>';
 const [cap,rate]=row.querySelectorAll('input');
 cap.value=limit;
 rate.value=price;
 row.querySelector('button').onclick=()=>{row.remove();button.disabled=false;button.focus();};
 container.append(row);
 button.disabled=container.children.length>=10;
 return row;
}
const profileTiers=container=>[...container.children].map(row=>{
 const [cap,rate]=row.querySelectorAll('input');
 return {limit:cap.value,price:rate.value};
});
function setTiers(values,resource=false){
 const container=resource?resourceTiers:tiers;
 (resource?addResource:add).disabled=false;
 container.replaceChildren();
 for(const tier of values)addTier(tier.limit,tier.price,resource);
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
   categories[bill.category]||'—',...[bill.fixedCents,bill.variableCents,bill.hydrantsCents||0,bill.resourceCents||0,bill.totalCents].map(n=>money.format(n/100))]){
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
 if(event.target===form.elements.period){saved=null;clearAccounts();cloudStatus.textContent='Cargue el lote de este mes si ya lo guardó.';refreshProfiles();}
 if(event.target===form.elements.readings){fileRead++;calculate.disabled=false;example=false;}
 invalidate();
});
const sampleBills=buildRate({fixed:'2800',tiers:[{limit:'15',price:'245'},{limit:'30',price:'283'},{limit:'60',price:'331'}],overflow:'368',
 hydrants:'650',resource:{tiers:[{limit:'15',price:'40'},{limit:'30',price:'43'},{limit:'60',price:'48'}],overflow:'54'}});
byId('billing-example').onclick=()=>{
 fileRead++;
 example=true;
 fileInput.value='';
 calculate.disabled=false;
 invalidate();
 form.elements.readings.value=[readingHeaders.join(';')+';categoria','EJ-001;640;665;residencial','EJ-002;75;75;residencial'].join('\n');
 status.textContent='Ejemplo histórico cargado para practicar. Pulse Calcular borrador.';
};
byId('billing-template').onclick=()=>download('\uFEFF'+[...readingHeaders,'categoria'].join(';')+'\r\n','plantilla-lecturas.csv');
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
 if(calculate.disabled||busy)return;
 invalidate();
 const calculatePreview=(configured)=>{
  if(!example&&!configured?.length)throw Error('Configure la tarifa de la ASADA antes de calcular el lote.');
  const {period,readings,defaultCategory}=form.elements;
  preview=previewBills({period:period.value,readings:readings.value,rate:sampleBills,profiles:configured,defaultCategory:defaultCategory.value});
  preview.profileIds=configured?.filter(p=>preview.bills.some(b=>b.category===p.category)).map(p=>p.id)||[];
  display(preview);
  status.textContent=preview.issues.length?'Corrija las lecturas señaladas para descargar el lote.':'Borrador calculado.';
 };
 if(example){
  try{calculatePreview(null);}catch(error){status.textContent=error.message;}
 }else if(!asadaSelect.value)status.textContent='Seleccione una ASADA.';
 else run(async()=>{const data=await api('tariffs');calculatePreview(data.profiles);},status);
});
byId('billing-export').onclick=()=>{
 if(preview)download(previewCsv(preview),'borrador-facturacion-'+preview.period+'.csv');
};

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
  form.elements.due.value=batch.due_date;
  form.elements.readings.value=batch.source.readings;
  form.elements.defaultCategory.value=batch.source.defaultCategory||'';
  preview={period:batch.period.slice(0,7),bills:batch.report,issues:[],totalCents:batch.report.reduce((total,r)=>total+r.totalCents,0)};
  display(preview);
  cloudStatus.textContent=batch.source.profiles?.length?'Borrador guardado · '+batch.report.length+' recibos · versión '+batch.version+'.':'Borrador anterior. Configure las tarifas y vuelva a calcularlo antes de aprobar.';
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
 profileForm.inert=true;
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
  profileForm.inert=false;
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
 form.elements.due.value='';
 clearAccounts();
 refreshProfiles();
 invalidate();
 cloudStatus.textContent='Seleccione el mes y cargue un lote guardado o prepare un borrador.';
});
byId('billing-load').onclick=()=>run(loadSaved);
saveButton.onclick=()=>{
 if(!dirty||!preview||preview.issues.length||example)return;
 if(!form.elements.due.value){cloudStatus.textContent='Indique la fecha de vencimiento para guardar.';form.elements.due.focus();return;}
 const {readings,defaultCategory,due}=form.elements,version=saved?.version;
 const source={readings:readings.value,defaultCategory:defaultCategory.value,due:due.value,profileIds:preview.profileIds};
 run(async request=>{
  const {batch}=await api('save',{...request,...source,version});
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

const resourceField=byId('billing-resource');
function syncResource(){
 resourceField.hidden=resourceField.disabled=!profileForm.elements.hasResource.checked;
}
function openProfile(){
 const category=profileForm.elements.category.value;
 const profile=profiles.find(p=>p.category===category);
 const rate=profile?.rate;
 profileForm.reset();
 profileForm.elements.category.value=category;
 profileForm.elements.from.value=form.elements.period.value;
 for(const key of ['fixed','overflow','hydrants'])profileForm.elements[key].value=rate?.[key]??(key==='hydrants'?'0':'');
 profileForm.elements.resolution.value=profile?.resolution||'';
 profileForm.elements.resourceResolution.value=profile?.resourceResolution||'';
 profileForm.elements.resourceOverflow.value=rate?.resource?.overflow||'';
 profileForm.elements.hasResource.checked=Boolean(rate?.resource);
 setTiers(rate?.tiers||[]);
 setTiers(rate?.resource?.tiers||[],true);
 syncResource();
}
async function refreshProfiles(){
 const ticket=++profileRequest;
 const selected=form.elements.defaultCategory.value;
 if(asadaSelect.value&&validMonth(form.elements.period.value)){
  try{const data=await api('tariffs');if(ticket!==profileRequest)return;profiles=data.profiles;}
  catch(error){if(ticket!==profileRequest)return;profiles=[];profileStatus.textContent=error.message;}
 }else profiles=[];
 byId('billing-rate-summary').textContent=profiles.length?profiles.map(p=>categories[p.category]+' · '+p.resolution+' · desde '+p.from).join(' | '):'Todavía no hay tarifas configuradas para la ASADA y el mes seleccionado.';
 form.elements.defaultCategory.replaceChildren(new Option('Usar la categoría del CSV',''),...profiles.map(p=>new Option(categories[p.category],p.category)));
 if(profiles.some(p=>p.category===selected))form.elements.defaultCategory.value=selected;
 else if(profiles.length===1)form.elements.defaultCategory.value=profiles[0].category;
 openProfile();
}
profileForm.elements.category.replaceChildren(...Object.entries(categories).map(([key,name])=>new Option(name,key)));
profileForm.elements.category.addEventListener('change',openProfile);
profileForm.elements.hasResource.addEventListener('change',syncResource);
add.onclick=()=>addTier()?.querySelector('input').focus();
addResource.onclick=()=>addTier('','',true)?.querySelector('input').focus();
const suggest=(limits,resource)=>{if(!(resource?resourceTiers:tiers).children.length)setTiers(limits.map(limit=>({limit,price:''})),resource);
 else profileStatus.textContent='Quite los tramos existentes para cargar una sugerencia.';};
byId('billing-residential-ranges').onclick=()=>suggest([15,30,60],false);
byId('billing-resource-ranges').onclick=()=>{
 const category=profileForm.elements.category.value;
 if(category==='residencial')suggest([15,30,60],true);
 else if(category==='comercio')suggest([20,65],true);
 else profileStatus.textContent='Ingrese los límites que indica la resolución para esta categoría.';
};
profileForm.addEventListener('submit',event=>{
 event.preventDefault();
 const data=new FormData(profileForm);
 run(async request=>{
  const profile=normalizeTariff({category:data.get('category'),from:data.get('from'),resolution:data.get('resolution'),
   resourceResolution:data.get('resourceResolution'),rate:{fixed:data.get('fixed'),overflow:data.get('overflow'),
    hydrants:data.get('hydrants')||'0',tiers:profileTiers(tiers),
    resource:data.has('hasResource')?{tiers:profileTiers(resourceTiers),overflow:data.get('resourceOverflow')}:null}});
  await api('tariff-save',{...request,profile,confirm:data.has('confirm')});
  invalidate();
  await refreshProfiles();
  profileStatus.textContent='Tarifa guardada para '+categories[profile.category]+' desde '+profile.from+'.';
 },profileStatus);
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
  await refreshProfiles();
  if(inboundSubscriber&&asadaSelect.value)await run(loadSaved);
 }catch(error){cloudStatus.textContent=error.message;}
})();
