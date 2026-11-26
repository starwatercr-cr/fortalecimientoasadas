import {categories,categoryKey,validMonth} from './facturacion-model.js';
import {csv} from './morosidad-model.js';

export const registryFields={
 code:'Número de paja',identity:'Cédula / identificación',name:'Nombre completo o razón social',
 meter:'Número de medidor',category:'Categoría tarifaria',sector:'Sector / ruta',
 address:'Dirección',phone:'Teléfono',email:'Correo electrónico',status:'Estado',
 initialPeriod:'Primer mes a facturar',initialReading:'Lectura anterior a ese mes (m³)',
 legacyCode:'Código del sistema anterior'
};
export const registryColumns={
 code:['paja','numero de paja','n paja','codigo de servicio','numero de servicio','servicio','codigo'],
 identity:['cedula','identificacion','documento','cedula juridica','cedula de identidad'],
 name:['nombre','abonado','nombre abonado','nombre completo','razon social','propietario'],
 meter:['medidor','numero de medidor','n medidor','serie medidor'],
 category:['categoria','tarifa','categoria tarifaria'],
 sector:['sector','ruta','sector ruta'],address:['direccion','domicilio'],
 phone:['telefono','celular'],email:['correo','email','correo electronico'],
 status:['estado','estado servicio'],initialPeriod:['primer mes','primer mes a facturar','periodo inicial'],
 initialReading:['lectura anterior','lectura inicial','lectura anterior m3'],
 legacyCode:['codigo anterior','codigo del sistema anterior','codigo abonado','numero abonado','numero de abonado']
};
const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function registryMapping(headers){
 const normalized=headers.map(norm);
 return Object.fromEntries(Object.entries(registryColumns).map(([key,aliases])=>[key,normalized.findIndex(h=>aliases.includes(h))]));
}
export function normalizeService(input){
 if(!input||typeof input!=='object')throw Error('Revise los datos del servicio.');
 const lengths={code:80,identity:40,name:180,meter:80,category:50,sector:120,address:300,phone:50,email:254,status:40,initialPeriod:7,initialReading:30,legacyCode:80};
 const result={};
 for(const [key,max] of Object.entries(lengths)){
  const value=String(input[key]??'').trim();
  if(value.length>max||/[\u0000-\u001f\u007f]/.test(value))throw Error('Revise '+registryFields[key]+'.');
  result[key]=value;
 }
 for(const key of ['code','identity','name','category'])if(!result[key])throw Error('Complete '+registryFields[key]+'.');
 if(/^[=+@-]/.test(result.code))throw Error('Revise el número de paja.');
 result.category=categoryKey(result.category);
 if(!Object.hasOwn(categories,result.category))throw Error('Seleccione una categoría tarifaria válida.');
 const states={activo:'activo',activa:'activo',suspendido:'suspendido',suspendida:'suspendido',inactivo:'inactivo',inactiva:'inactivo'};
 result.status=states[norm(result.status||'activo')];
 if(!result.status)throw Error('Seleccione un estado válido.');
 if(result.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))throw Error('Revise el correo electrónico.');
 if(Boolean(result.initialPeriod)!==Boolean(result.initialReading))throw Error('Indique el primer mes y su lectura anterior juntos.');
 if(result.initialPeriod&&!validMonth(result.initialPeriod))throw Error('Use AAAA-MM para el primer mes.');
 if(result.initialReading){
  if(!/^\d+(?:[.,]\d{1,3})?$/.test(result.initialReading)||Number(result.initialReading.replace(',','.'))>100000000)throw Error('Revise la lectura inicial en m³.');
  result.initialReading=String(Number(result.initialReading.replace(',','.')));
  if(!result.meter)throw Error('Indique el medidor asociado a la lectura inicial.');
 }
 return result;
}
const key=value=>String(value).toLowerCase();
export function reviewRegistry(rows,mapping,existing=[]){
 const entries=[],issues=[],byCode=new Map(existing.map(r=>[key(r.code),r])),seen=new Set(),meters=new Set(existing.filter(r=>r.payload.status==='activo'&&r.payload.meter).map(r=>key(r.payload.meter)));
 if(rows.length>500)throw Error('Revise hasta 500 servicios por bloque de importación.');
 for(const [index,row] of rows.entries()){
  if(!row.some(v=>String(v??'').trim()))continue;
  try{
   const entry=normalizeService(Object.fromEntries(Object.keys(registryFields).map(k=>[k,row[mapping[k]]??''])));
   const id=key(entry.code);
   if(seen.has(id))throw Error('Número de paja duplicado en el archivo.');
   seen.add(id);
   const old=byCode.get(id);
   if(old){
    const identical=Object.keys(registryFields).every(k=>entry[k]===old.payload[k]);
    if(!identical)throw Error('La paja ya existe con datos diferentes. Revise su ficha.');
    entries.push({entry,action:'Ya registrado',line:index+2});
    continue;
   }
   if(entry.status==='activo'&&entry.meter){
    if(meters.has(key(entry.meter)))throw Error('Medidor repetido en servicios activos.');
    meters.add(key(entry.meter));
   }
   entries.push({entry,action:'Agregar',line:index+2});
  }catch(error){issues.push({line:index+2,reason:error.message});}
 }
 return {entries,issues};
}
export function registryTemplate(){
 return csv([Object.values(registryColumns).map(aliases=>aliases[0])]);
}
export function readingPlan(records,previous,period){
 const last=new Map((previous||[]).map(r=>[key(r.subscriber),r]));
 return records.filter(r=>r.payload.status==='activo'&&(!r.payload.initialPeriod||r.payload.initialPeriod<=period)).map(({payload:p})=>{
  const prev=last.get(key(p.code));
  // A declared initial reading starts a service or a new meter in that month.
  const initial=p.initialPeriod===period;
  const previousReading=initial?p.initialReading:
   p.initialPeriod&&p.initialPeriod>period?'':prev&&(!p.initialPeriod||p.initialPeriod<period)?String(prev.current):'';
  return {subscriber:p.code,name:p.name,meter:p.meter,category:p.category,sector:p.sector,previous:previousReading};
 });
}
