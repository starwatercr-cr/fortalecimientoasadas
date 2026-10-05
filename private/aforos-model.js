export const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function validateFlow(kind,p,fail){
 if(!p||typeof p!=='object'||Array.isArray(p))fail('Revise los datos del registro.');
 const labels={name:'nombre de la fuente',type:'tipo de fuente',location:'ubicación',note:'observaciones',method:'método utilizado',responsible:'persona responsable',campaign:'nombre de campaña',season:'época'};
 const text=(k,max,required=true)=>{if(typeof p[k]!=='string'||p[k].length>max||required&&!p[k].trim())fail('Revise '+(labels[k]||k)+'.');return p[k].trim();};
 if(kind==='source'){const type=text('type',30);if(!['Naciente','Pozo','Captación superficial','Otra'].includes(type)||typeof p.includeTotal!=='boolean')fail('Revise el tipo de fuente y su participación en el total.');return {name:text('name',160),type,location:text('location',300,false),includeTotal:p.includeTotal,note:text('note',1000,false)};}
 if(kind!=='measurement')fail('Tipo de registro no válido.');
 if(!validDate(p.date)||p.date>new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'}))fail('Ingrese una fecha real de aforo, no una fecha futura.');
 if(typeof p.flow!=='number'||!Number.isFinite(p.flow)||p.flow<0||p.flow>1000000)fail('Ingrese el caudal en L/s; cero es válido si se midió ausencia de agua.');
 const season=text('season',30);if(!['Verano','Invierno','Transición','Sin especificar'].includes(season))fail('Seleccione la época.');
 return {date:p.date,flow:p.flow,season,method:text('method',160),responsible:text('responsible',160),campaign:text('campaign',120,false),note:text('note',1000,false)};
}
export function flowSeries(records,{source='',start='0000-01-01',end='9999-12-31',general=false}={}){
 const sources=records.filter(r=>r.kind==='source'),map=new Map(sources.map(s=>[s.id,s])),measure=records.filter(r=>r.kind==='measurement'&&r.payload.date>=start&&r.payload.date<=end&&(general||!source||r.source_id===source)).sort((a,b)=>a.payload.date.localeCompare(b.payload.date)||a.id.localeCompare(b.id));
 if(!general)return {points:measure.map(r=>({id:r.id,date:r.payload.date,flow:r.payload.flow,group:r.source_id,name:map.get(r.source_id)?.payload.name||r.payload.sourceName,campaign:r.payload.campaign})),incomplete:[],sources};
 const expected=sources.filter(s=>s.payload.includeTotal),groups=new Map();
 // Active source roster defines coverage, including historical campaigns; incomplete coverage is explicit.
 for(const r of measure){if(!r.payload.campaign)continue;const key=r.payload.date+'\0'+r.payload.campaign.toLocaleLowerCase('es');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
 const points=[],incomplete=[];
 for(const rows of groups.values()){const available=expected.map(s=>rows.filter(r=>r.source_id===s.id)),missing=expected.filter((_,i)=>available[i].length!==1).map(s=>s.payload.name),head=rows[0].payload;if(!expected.length||missing.length){incomplete.push({date:head.date,campaign:head.campaign,missing});continue;}
 points.push({id:rows[0].id,date:head.date,flow:available.reduce((n,r)=>n+r[0].payload.flow,0),group:'general',name:'Total de fuentes independientes',campaign:head.campaign});}
 points.sort((a,b)=>a.date.localeCompare(b.date));return {points,incomplete,sources};
}
export function flowComment(points){if(!points.length)return 'Todavía no hay mediciones comparables para este filtro. Un espacio sin datos no significa cero agua.';const groups=[...new Set(points.map(p=>p.group))];if(groups.length>1)return 'Cada línea corresponde a una fuente distinta. Seleccione una fuente para revisar sus cambios; los puntos no representan caudal constante entre aforos.';const first=points[0],last=points.at(-1);if(points.length<2)return 'Hay una medición de '+last.flow.toLocaleString('es-CR')+' L/s. Registre más aforos para comparar su comportamiento.';if(first.date===last.date)return 'Las mediciones corresponden a la misma fecha. Hace falta otro momento de medición para comparar cambios en el tiempo.';if(first.flow===0)return 'El primer aforo registró 0 L/s y el último '+last.flow.toLocaleString('es-CR')+' L/s. No se calcula una variación porcentual desde cero.';const pct=(last.flow-first.flow)/first.flow*100;return 'Entre el primer y el último aforo del filtro, el caudal '+(pct<0?'disminuyó':pct>0?'aumentó':'se mantuvo')+(pct?' '+Math.abs(pct).toLocaleString('es-CR',{maximumFractionDigits:1})+' %':'')+'. Revise la época, la lluvia, el método y las condiciones de captación antes de atribuir una causa. Esta comparación no confirma una tendencia ni sustituye un estudio técnico.';}
