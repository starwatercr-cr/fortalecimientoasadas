import {csv, parseCSV} from './morosidad-model.js';

export const readingHeaders=['abonado','lectura_anterior','lectura_actual'];
export const categories={
 residencial:'Residencial',comercio:'Comercio y servicios',industrial:'Industrial',preferencial:'Preferencial',
 social:'Residencial social',pobreza_extrema:'Residencial pobreza extrema',grandes_consumidores:'Grandes consumidores',
};
export const categoryKey=value=>String(value??'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'').replace(/^comercio_y_servicios$/,'comercio').replace(/^residencial_social$/,'social').replace(/^residencial_pobreza_extrema$/,'pobreza_extrema');
export const validMonth=value=>typeof value==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(value);
const maximumRows=1000;
const consumptionLimit=100000000; // Milli-cubic metres.
const rateLimit=10000000; // Cents per cubic metre.

function decimal(value,digits,max,label){
 const raw=String(value??'').trim();
 if(!new RegExp('^\\d+(?:[.,]\\d{1,'+digits+'})?$').test(raw))throw Error(label+' debe ser un número sin separadores de miles.');
 const [whole,fraction='']=raw.split(/[.,]/);
 const scaled=Number(whole)*10**digits+Number(fraction.padEnd(digits,'0'));
 if(!Number.isSafeInteger(scaled)||scaled>max)throw Error(label+' supera el límite del simulador.');
 return scaled;
}

export const paymentCents=value=>decimal(value,2,1010000000000,'Monto del pago');

function buildBlocks(tiers,overflow){
 if(!Array.isArray(tiers)||tiers.length>10)throw Error('Use hasta 10 tramos antes de la tarifa final.');
 let previous=0;
 const blocks=tiers.map(({limit,price},i)=>{
  const cap=decimal(limit,3,consumptionLimit,'Límite del tramo '+(i+1));
  if(cap<=previous||cap>=consumptionLimit)throw Error('Los límites deben aumentar de un tramo al siguiente.');
  previous=cap;
  return {cap,rate:decimal(price,2,rateLimit,'Precio del tramo '+(i+1))};
 });
 return [...blocks,{cap:consumptionLimit,rate:decimal(overflow,2,rateLimit,'Precio final por m³')}];
}
export function buildRate({fixed,tiers,overflow,hydrants='0',resource=null}){
 return {
  fixedCents:decimal(fixed,2,100000000,'Cargo fijo'),
  hydrantsCents:decimal(hydrants,2,100000000,'Cargo fijo de hidrantes'),
  blocks:buildBlocks(tiers,overflow),
  resourceBlocks:resource===null?[]:buildBlocks(resource.tiers,resource.overflow),
 };
}

export function normalizeTariff(input){
 if(!input?.rate||typeof input.rate!=='object')throw Error('Revise la configuración de la tarifa.');
 const {category,from,resolution,resourceResolution,rate}=input;
 if(!Object.hasOwn(categories,category))throw Error('Seleccione una categoría válida.');
 if(!validMonth(from))throw Error('Indique el primer mes de aplicación.');
 const ref=(value,label)=>{
  if(typeof value!=='string'||!value.trim()||value.length>160)throw Error('Indique '+label+'.');
  return value.trim();
 };
 buildRate(rate);
 const cleanTiers=tiers=>tiers.map(({limit,price})=>({limit:String(limit).trim(),price:String(price).trim()}));
 const resource=rate.resource?{tiers:cleanTiers(rate.resource.tiers),overflow:String(rate.resource.overflow).trim()}:null;
 return {category,from,resolution:ref(resolution,'la resolución de acueducto'),
  resourceResolution:resource?ref(resourceResolution,'la resolución de recurso hídrico'):'',
  rate:{fixed:String(rate.fixed).trim(),tiers:cleanTiers(rate.tiers),overflow:String(rate.overflow).trim(),
   hydrants:String(rate.hydrants??0).trim(),resource}};
}

function chargeBlocks(volume,blocks){
 let lower=0,charge=0;
 for(const {cap,rate} of blocks){
  charge+=Math.max(0,Math.min(volume,cap)-lower)*rate;
  lower=cap;
  if(lower>=volume)break;
 }
 return Math.round(charge/1000);
}

export function previewBills({period,readings,rate,profiles=null,defaultCategory=''}){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw Error('Seleccione un mes de facturación.');
 if(readings.length>400000)throw Error('El archivo de lecturas supera el tamaño permitido.');
 const [header,...rawRows]=parseCSV(readings);
 const columns=(header||[]).map(column=>column.trim().toLowerCase());
 if(new Set(columns).size!==columns.length||readingHeaders.some(key=>!columns.includes(key))){
  throw Error('Use los encabezados abonado, lectura_anterior y lectura_actual.');
 }
 const indexes=readingHeaders.map(key=>columns.indexOf(key));
 const categoryIndex=columns.indexOf('categoria');
 const configured=profiles&&new Map(profiles.map(p=>[p.category,buildRate(p.rate)]));
 const rows=rawRows.map((values,i)=>({values,line:i+2})).filter(({values})=>values.some(value=>value.trim()));
 if(!rows.length)throw Error('Agregue al menos una lectura.');
 if(rows.length>maximumRows)throw Error('Use hasta '+maximumRows.toLocaleString('es-CR')+' lecturas por lote.');
 const ids=new Map();
 for(const {values} of rows){
  const key=(values[indexes[0]]||'').trim().toLocaleLowerCase('es');
  if(key)ids.set(key,(ids.get(key)||0)+1);
 }
 const bills=[],issues=[];
 for(const {values,line} of rows){
  const [subscriber,previous,current]=indexes.map(index=>(values[index]||'').trim());
  try{
   if(values.length!==columns.length)throw Error('La fila tiene una cantidad incorrecta de columnas.');
   if(!subscriber||subscriber.length>80||/[\r\n\t]/.test(subscriber))throw Error('Revise el código del abonado.');
   if(ids.get(subscriber.toLocaleLowerCase('es'))>1)throw Error('El código de abonado está duplicado en el lote.');
   const before=decimal(previous,3,100000000000,'Lectura anterior');
   const after=decimal(current,3,100000000000,'Lectura actual');
   const volume=after-before;
   if(volume<0)throw Error('La lectura actual es menor. Revise si hubo cambio de medidor.');
   if(volume>consumptionLimit)throw Error('El consumo supera el límite por recibo del simulador.');
   const category=categoryKey(values[categoryIndex]||defaultCategory);
   const schedule=configured?configured.get(category):rate;
   if(!schedule)throw Error(category?'La categoría «'+category+'» tiene pendiente su tarifa para este mes.':'Indique la categoría de este abonado.');
   const variableCents=chargeBlocks(volume,schedule.blocks);
   const resourceCents=chargeBlocks(volume,schedule.resourceBlocks||[]);
   const hydrantsCents=schedule.hydrantsCents||0;
   bills.push({subscriber,category,previous:before/1000,current:after/1000,consumption:volume/1000,
    fixedCents:schedule.fixedCents,variableCents,hydrantsCents,resourceCents,
    totalCents:schedule.fixedCents+variableCents+hydrantsCents+resourceCents});
  }catch(error){
   issues.push({line,subscriber,reason:error.message});
  }
 }
 return {period,bills,issues,totalCents:bills.reduce((total,bill)=>total+bill.totalCents,0)};
}

export function previewCsv(report){
 if(report.issues.length||!report.bills.length)throw Error('Corrija todas las lecturas antes de exportar.');
 return csv([
  ['tipo','periodo','abonado','lectura_anterior','lectura_actual','consumo_m3','cargo_fijo_crc','cargo_variable_crc','categoria','hidrantes_crc','recurso_hidrico_crc','total_estimado_crc'],
  ...report.bills.map(bill=>['BORRADOR',report.period,bill.subscriber,bill.previous,bill.current,bill.consumption,
   (bill.fixedCents/100).toFixed(2),(bill.variableCents/100).toFixed(2),bill.category||'',((bill.hydrantsCents||0)/100).toFixed(2),((bill.resourceCents||0)/100).toFixed(2),(bill.totalCents/100).toFixed(2)]),
 ]);
}

// Approved internal charges and verified payments share a single source across views.
export function billingHistoryRows(batch,paid,today){
 const amounts=new Map(paid.map(p=>[p.subscriber,Number(p.paid_cents)]));
 return batch.report.map(bill=>{
  const paidCents=amounts.get(bill.subscriber)??0;
  const balanceCents=bill.totalCents-paidCents;
  if(!Number.isSafeInteger(paidCents)||paidCents<0||balanceCents<0)throw Error('Los pagos del lote requieren revisión.');
  return {subscriber:bill.subscriber,period:batch.period.slice(0,7),dueDate:batch.due_date,
   category:bill.category||'',consumption:bill.consumption,totalCents:bill.totalCents,paidCents,balanceCents,
   overdueCents:batch.due_date<today?balanceCents:0};
 });
}

export function summarizeBillingHistory(rows){
 const empty=()=>({count:0,consumption:0,totalCents:0,paidCents:0,balanceCents:0,overdueCents:0});
 const total=empty(),months=new Map();
 for(const row of rows){
  if(!months.has(row.period))months.set(row.period,empty());
  for(const summary of [total,months.get(row.period)]){
   summary.count++;
   summary.consumption+=Math.round(row.consumption*1000);
   for(const key of ['totalCents','paidCents','balanceCents','overdueCents']){
    summary[key]+=row[key];
    if(!Number.isSafeInteger(summary[key]))throw Error('El total supera el límite de cálculo. Consulte un período menor.');
   }
  }
 }
 const finish=summary=>({...summary,consumption:summary.consumption/1000});
 return {total:finish(total),months:[...months].sort(([a],[b])=>a.localeCompare(b)).map(([period,summary])=>({period,...finish(summary)}))};
}

export function billingHistoryCsv(rows){
 return csv([
  ['tipo','periodo','abonado','categoria','consumo_m3','vencimiento','cargo_interno_crc','pago_aplicado_crc','saldo_crc','vencido_crc'],
  ...rows.map(r=>['COBRO INTERNO',r.period,r.subscriber,categories[r.category]||r.category,r.consumption,r.dueDate,
   ...[r.totalCents,r.paidCents,r.balanceCents,r.overdueCents].map(cents=>(cents/100).toFixed(2))]),
 ]);
}
