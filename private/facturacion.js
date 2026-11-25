import {buildRate, previewBills, previewCsv, readingHeaders} from './facturacion-model.js';

const byId=id=>document.getElementById(id);
const form=byId('billing-form');
const tiers=byId('billing-tiers');
const add=byId('billing-add-tier');
const status=byId('billing-status');
const result=byId('billing-result');
const fileInput=byId('billing-file');
const calculate=byId('billing-calculate');
const money=new Intl.NumberFormat('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2});
const volume=new Intl.NumberFormat('es-CR',{maximumFractionDigits:3});
let preview=null, fileRead=0;

function invalidate(){
 preview=null;
 result.hidden=true;
 status.textContent='';
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
}

const month=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit'}).format(new Date());
form.elements.period.value=month;
form.addEventListener('input',event=>{
 if(event.target===form.elements.readings){fileRead++;calculate.disabled=false;}
 invalidate();
});
add.onclick=()=>addTier()?.querySelector('input').focus();
byId('billing-example').onclick=()=>{
 fileRead++;
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
  const limits=data.getAll('limit'),prices=data.getAll('price');
  const rate=buildRate({fixed:data.get('fixed'),overflow:data.get('overflow'),
   tiers:limits.map((limit,i)=>({limit,price:prices[i]}))});
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
