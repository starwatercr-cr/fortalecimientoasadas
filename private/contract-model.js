export const contractVersion='SW-ASADAS-2026-10-05';
export const contractPlans=[
 {id:'plataforma',name:'Acceso a la plataforma',price:170},
 {id:'acompanamiento-500',name:'Plataforma y acompañamiento · 1–500 usuarios',price:600,min:1,max:500},
 {id:'acompanamiento-1000',name:'Plataforma y acompañamiento · 501–1.000 usuarios',price:845,min:501,max:1000},
 {id:'acompanamiento-2500',name:'Plataforma y acompañamiento · 1.001–2.500 usuarios',price:1260,min:1001,max:2500}
];
export const contractFields=[
 ['legalName','Nombre legal completo de la ASADA'],['tax','Cédula jurídica de la ASADA'],['address','Domicilio completo de la ASADA'],
 ['email','Correo oficial','email'],['representative','Representante legal de la ASADA'],['representativeId','Cédula del representante'],
 ['position','Cargo y facultades de representación'],['representation','Referencia de la personería o documento de representación'],
 ['users','Servicios o abonados activos','number'],['agreement','Número del acuerdo de Junta Directiva'],['session','Número de sesión'],
 ['agreementDate','Fecha del acuerdo','date'],['start','Fecha de inicio acordada','date'],['place','Lugar de firma'],['signDate','Fecha prevista de firma','date'],
 ['providerAddress','Domicilio de Star Water'],['providerRepresentation','Referencia de representación de Star Water']
];
export function contractEnd(start){if(!/^\d{4}-\d{2}-\d{2}$/.test(start||''))return '';const d=new Date(start+'T12:00:00Z');if(isNaN(d)||d.toISOString().slice(0,10)!==start)return '';const year=d.getUTCFullYear()+2,month=d.getUTCMonth(),day=Math.min(d.getUTCDate(),new Date(Date.UTC(year,month+1,0)).getUTCDate());return new Date(Date.UTC(year,month,day)).toISOString().slice(0,10);}
export function validateContract(c,fail){if(!c||typeof c!=='object'||Array.isArray(c))fail('Revise los datos del contrato.');const out={};const plan=contractPlans.find(p=>p.id===c.plan);if(!plan)fail('Seleccione una modalidad válida.');out.plan=plan.id;out.templateVersion=contractVersion;out.monthlyPrice=plan.price;
 for(const [k,label,type] of contractFields){if(k==='users'){const n=c[k];if(n===null||n===''||n===undefined)out[k]=null;else if(typeof n!=='number'||!Number.isInteger(n)||n<0||n>1e8)fail('Revise la cantidad de abonados.');else out[k]=n;continue;}const v=c[k]??'';if(typeof v!=='string'||v.length>(k==='address'||k==='providerAddress'?500:254))fail('Revise '+label+'.');out[k]=v.trim();if(type==='date'&&out[k]&&!contractEnd(out[k]))fail('Revise '+label+'.');}
 if(out.email&&!/^\S+@\S+\.\S+$/.test(out.email))fail('Revise el correo del contrato.');
 if(plan.min!==undefined&&out.users!==null&&(out.users<plan.min||out.users>plan.max))fail('La cantidad de abonados no corresponde a la modalidad seleccionada.');
 out.end=contractEnd(out.start);return out;
}
export function requireCompleteContract(c){const valid=validateContract(c,m=>{throw Error(m);});const missing=contractFields.filter(([k])=>valid[k]===null||valid[k]==='').map(([,label])=>label);if(missing.length)throw Error('Complete antes de generar el PDF: '+missing.join(', ')+'.');return valid;}
export function contractPrefill(p){return {legalName:p.name||'',tax:p.tax||'',address:[p.address,p.district,p.canton,p.province].filter(Boolean).join(', '),email:p.email||'',representative:p.president||'',position:'Representante legal',users:p.users??null,...p.contract};}
