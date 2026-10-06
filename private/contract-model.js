export const contractVersion='SW-ASADAS-2026-10-06';
export const contractPlans=[
 {id:'plataforma-500',name:'Plataforma · hasta 500 abonados',price:170,min:1,max:500},
 {id:'plataforma-1000',name:'Plataforma · 501–1.000 abonados',price:200,min:501,max:1000},
 {id:'plataforma-2500',name:'Plataforma · 1.001–2.500 abonados',price:250,min:1001,max:2500},
 {id:'plataforma-mas2500',name:'Plataforma · más de 2.500 abonados',price:350,min:2501,max:1e8},
 {id:'acompanamiento-cotizado',name:'Plataforma y acompañamiento · cotización personalizada',quote:true,accompaniment:true}
];
// Retain previous draft terms and signed document references; these plans are no longer offered.
const legacyPlans=[{id:'plataforma',name:'Acceso a la plataforma · condiciones anteriores',price:170,legacy:true},
 {id:'acompanamiento-500',name:'Plataforma y acompañamiento · condiciones anteriores',price:600,min:1,max:500,legacy:true,accompaniment:true},
 {id:'acompanamiento-1000',name:'Plataforma y acompañamiento · condiciones anteriores',price:845,min:501,max:1000,legacy:true,accompaniment:true},
 {id:'acompanamiento-2500',name:'Plataforma y acompañamiento · condiciones anteriores',price:1260,min:1001,max:2500,legacy:true,accompaniment:true}];
export const findContractPlan=id=>[...contractPlans,...legacyPlans].find(p=>p.id===id);
export const contractPrice=c=>{const p=findContractPlan(c.plan);return p?.quote?c.providerQuotePrice:p?.price;};
export const contractTax=p=>p.legacy?'IVA incluido':'más IVA; si existe exoneración, se aplicará previa presentación del documento vigente';
export const contractFields=[
 ['legalName','Nombre legal completo de la ASADA'],['tax','Cédula jurídica de la ASADA'],['address','Domicilio completo de la ASADA'],
 ['email','Correo oficial','email'],['representative','Representante legal de la ASADA'],['representativeId','Cédula del representante'],
 ['position','Cargo y facultades de representación'],['representation','Referencia de la personería o documento de representación'],
 ['users','Servicios o abonados activos','number'],['agreement','Número del acuerdo de Junta Directiva'],['session','Número de sesión'],
 ['agreementDate','Fecha del acuerdo','date'],['start','Fecha de inicio acordada','date'],['place','Lugar de firma'],['signDate','Fecha prevista de firma','date'],
 ['providerQuotePrice','Mensualidad cotizada por Star Water (US$, sin IVA)','number'],['providerQuoteReference','Referencia de la cotización de Star Water'],['providerQuoteScope','Alcance y modalidad del acompañamiento cotizado'],['providerAddress','Domicilio de Star Water'],['providerRepresentation','Referencia de representación de Star Water']
];
export function contractEnd(start){if(!/^\d{4}-\d{2}-\d{2}$/.test(start||''))return '';const d=new Date(start+'T12:00:00Z');if(isNaN(d)||d.toISOString().slice(0,10)!==start)return '';const year=d.getUTCFullYear()+2,month=d.getUTCMonth(),day=Math.min(d.getUTCDate(),new Date(Date.UTC(year,month+1,0)).getUTCDate());return new Date(Date.UTC(year,month,day)).toISOString().slice(0,10);}
export function validateContract(c,fail){if(!c||typeof c!=='object'||Array.isArray(c))fail('Revise los datos del contrato.');const out={};const plan=findContractPlan(c.plan);if(!plan)fail('Seleccione una modalidad válida.');out.plan=plan.id;out.templateVersion=plan.legacy?(c.templateVersion||'SW-ASADAS-2026-10-05'):contractVersion;
 for(const [k,label,type] of contractFields){if(k==='providerQuotePrice'){const n=c[k];if(n===null||n===''||n===undefined)out[k]=null;else if(typeof n!=='number'||!Number.isFinite(n)||n<=0||n>1e7||Math.abs(n*100-Math.round(n*100))>1e-6)fail('Revise el monto mensual de la cotización.');else out[k]=n;continue;}if(k==='users'){const n=c[k];if(n===null||n===''||n===undefined)out[k]=null;else if(typeof n!=='number'||!Number.isInteger(n)||n<0||n>1e8)fail('Revise la cantidad de abonados.');else out[k]=n;continue;}const v=c[k]??'';if(typeof v!=='string'||v.length>(['address','providerAddress','providerQuoteScope'].includes(k)?2000:254))fail('Revise '+label+'.');out[k]=v.trim();if(type==='date'&&out[k]&&!contractEnd(out[k]))fail('Revise '+label+'.');}
 if(out.email&&!/^\S+@\S+\.\S+$/.test(out.email))fail('Revise el correo del contrato.');
 if(plan.min!==undefined&&out.users!==null&&(out.users<plan.min||out.users>plan.max))fail('La cantidad de abonados no corresponde a la modalidad seleccionada.');
 out.monthlyPrice=plan.quote?out.providerQuotePrice:plan.price;out.end=contractEnd(out.start);return out;
}
export function requireCompleteContract(c){const valid=validateContract(c,m=>{throw Error(m);});if(findContractPlan(valid.plan).legacy)throw Error('Seleccione una modalidad vigente para preparar un nuevo contrato. Los documentos anteriores permanecen disponibles.');const missing=contractFields.filter(([k])=>(!k.startsWith('providerQuote')||findContractPlan(valid.plan).quote)&&(valid[k]===null||valid[k]==='')).map(([,label])=>label);if(missing.length)throw Error('Complete antes de generar el PDF: '+missing.join(', ')+'.');return valid;}
export function contractPrefill(p){return {legalName:p.name||'',tax:p.tax||'',address:[p.address,p.district,p.canton,p.province].filter(Boolean).join(', '),email:p.email||'',representative:p.president||'',position:'Representante legal',users:p.users??null,...p.contract};}
