import {csv, parseCSV} from './morosidad-model.js';

export const readingHeaders=['abonado','lectura_anterior','lectura_actual'];
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

export function buildRate({fixed,tiers,overflow}){
 if(!Array.isArray(tiers)||tiers.length>10)throw Error('Use hasta 10 tramos antes de la tarifa final.');
 let previous=0;
 const blocks=tiers.map(({limit,price},i)=>{
  const cap=decimal(limit,3,consumptionLimit,'Límite del tramo '+(i+1));
  if(cap<=previous)throw Error('Los límites deben aumentar de un tramo al siguiente.');
  previous=cap;
  return {cap,rate:decimal(price,2,rateLimit,'Precio del tramo '+(i+1))};
 });
 return {
  fixedCents:decimal(fixed,2,100000000,'Cargo fijo'),
  blocks:[...blocks,{cap:consumptionLimit,rate:decimal(overflow,2,rateLimit,'Precio final por m³')}],
 };
}

export function previewBills({period,readings,rate}){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw Error('Seleccione un mes de facturación.');
 if(readings.length>400000)throw Error('El archivo de lecturas supera el tamaño permitido.');
 const [header,...rawRows]=parseCSV(readings);
 const columns=(header||[]).map(column=>column.trim().toLowerCase());
 if(new Set(columns).size!==columns.length||readingHeaders.some(key=>!columns.includes(key))){
  throw Error('Use los encabezados abonado, lectura_anterior y lectura_actual.');
 }
 const indexes=readingHeaders.map(key=>columns.indexOf(key));
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
   let lower=0, charge=0;
   for(const {cap,rate:price} of rate.blocks){
    charge+=Math.max(0,Math.min(volume,cap)-lower)*price;
    lower=cap;
    if(lower>=volume)break;
   }
   const variableCents=Math.round(charge/1000);
   bills.push({subscriber,previous:before/1000,current:after/1000,consumption:volume/1000,fixedCents:rate.fixedCents,variableCents,totalCents:rate.fixedCents+variableCents});
  }catch(error){
   issues.push({line,subscriber,reason:error.message});
  }
 }
 return {period,bills,issues,totalCents:bills.reduce((total,bill)=>total+bill.totalCents,0)};
}

export function previewCsv(report){
 if(report.issues.length||!report.bills.length)throw Error('Corrija todas las lecturas antes de exportar.');
 return csv([
  ['tipo','periodo','abonado','lectura_anterior','lectura_actual','consumo_m3','cargo_fijo_crc','cargo_variable_crc','total_estimado_crc'],
  ...report.bills.map(bill=>['BORRADOR',report.period,bill.subscriber,bill.previous,bill.current,bill.consumption,
   (bill.fixedCents/100).toFixed(2),(bill.variableCents/100).toFixed(2),(bill.totalCents/100).toFixed(2)]),
 ]);
}
