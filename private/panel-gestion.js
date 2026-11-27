(()=>{
'use strict';
const root=document.getElementById('sw-asadas-demo'),$=s=>root.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statementStyle=document.createElement('style');
statementStyle.textContent=`
#sw-asadas-demo .sw-insight{padding:28px;border:1px solid var(--sw-line);border-radius:16px;background:var(--sw-panel);color:var(--sw-text)}
#sw-asadas-demo .sw-insight *{box-sizing:border-box}
#sw-asadas-demo .sw-insight-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:24px}
#sw-asadas-demo .sw-insight-eyebrow{display:block;color:var(--sw-brand);font-size:12px;font-weight:800;letter-spacing:.11em;margin-bottom:9px}
#sw-asadas-demo .sw-insight h2{font-size:clamp(24px,2.7vw,32px);line-height:1.2;letter-spacing:-.025em;margin:0 0 7px}
#sw-asadas-demo .sw-insight-heading p{color:var(--sw-muted);margin:0}
#sw-asadas-demo .sw-insight-status{flex:none;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:700}
#sw-asadas-demo .sw-insight-status.ok{background:#e5f5ee;color:#126244}
#sw-asadas-demo .sw-insight-status.attention{background:#fff0e5;color:#9b451d}
#sw-asadas-demo .sw-insight-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:0 0 22px}
#sw-asadas-demo .sw-insight-metric{display:flex;flex-direction:column;gap:6px;min-width:0;min-height:126px;padding:18px;border:1px solid var(--sw-line);border-radius:12px;background:var(--sw-bg);border-top:3px solid var(--sw-brand)}
#sw-asadas-demo .sw-insight-metric.expenses{border-top-color:#8098aa}
#sw-asadas-demo .sw-insight-metric.negative{border-top-color:#bd604e;background:#fff8f5}
#sw-asadas-demo .sw-insight-metric.cash{border-top-color:#579d82}
#sw-asadas-demo .sw-insight-metric span{font-size:13px;font-weight:700;color:var(--sw-muted)}
#sw-asadas-demo .sw-insight-metric strong{display:block;font-size:clamp(17px,1.8vw,23px);line-height:1.25;letter-spacing:-.025em;overflow-wrap:anywhere}
#sw-asadas-demo .sw-insight-metric.negative strong{color:#a44635}
#sw-asadas-demo .sw-insight-metric small{font-size:12px;color:var(--sw-muted);margin-top:auto}
#sw-asadas-demo .sw-insight-charts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:0 0 20px}
#sw-asadas-demo .sw-insight-chart{min-width:0;padding:22px;border:1px solid var(--sw-line);border-radius:12px;background:var(--sw-panel)}
#sw-asadas-demo .sw-insight-chart h3,#sw-asadas-demo .sw-insight-reading h3{font-size:18px;margin:0 0 5px}
#sw-asadas-demo .sw-insight-chart>p{font-size:13px;color:var(--sw-muted);margin:0 0 22px}
#sw-asadas-demo .sw-insight-bar{margin:16px 0}
#sw-asadas-demo .sw-insight-bar-label{display:flex;justify-content:space-between;gap:12px;align-items:baseline;font-size:13px}
#sw-asadas-demo .sw-insight-bar-label strong{font-size:13px;white-space:nowrap}
#sw-asadas-demo .sw-insight-track{display:block;width:100%;height:12px;margin-top:8px;background:var(--sw-bg);border-radius:999px;overflow:hidden}
#sw-asadas-demo .sw-insight-track>span{display:block;height:100%;border-radius:999px;background:var(--sw-brand)}
#sw-asadas-demo .sw-insight-track>span.expenses{background:#8098aa}
#sw-asadas-demo .sw-insight-track>span.equity{background:#579d82}
#sw-asadas-demo .sw-insight-reading{padding:22px;border-radius:12px;background:var(--sw-soft)}
#sw-asadas-demo .sw-insight-reading h3{margin-bottom:14px}
#sw-asadas-demo .sw-insight-alert{padding:14px 16px;border-left:4px solid #b45c41;border-radius:7px;background:#fff8f4;line-height:1.5;margin:0 0 16px}
#sw-asadas-demo .sw-insight-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
#sw-asadas-demo .sw-insight-points p{margin:0;line-height:1.5;font-size:14px}
#sw-asadas-demo .sw-insight-foot{font-size:12px;color:var(--sw-muted);line-height:1.5;margin:18px 0 0}
@media(max-width:980px){#sw-asadas-demo .sw-insight-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}#sw-asadas-demo .sw-insight-points{grid-template-columns:1fr}}
@media(max-width:680px){#sw-asadas-demo .sw-insight{padding:18px}#sw-asadas-demo .sw-insight-heading{display:block}#sw-asadas-demo .sw-insight-status{display:inline-block;margin-top:14px}#sw-asadas-demo .sw-insight-metrics,#sw-asadas-demo .sw-insight-charts{grid-template-columns:1fr}#sw-asadas-demo .sw-insight-metric{min-height:0}#sw-asadas-demo .sw-insight-chart{padding:16px}}
`;
document.head.appendChild(statementStyle);
const operationsStyle=document.createElement('style');operationsStyle.textContent=`
#sw-asadas-demo .sw-op-header{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;margin:12px 0 22px;padding:24px;border-radius:16px;background:linear-gradient(115deg,#0c3545,#137d82);color:white}
#sw-asadas-demo .sw-op-header h2{margin:0 0 6px;font-size:clamp(23px,3vw,30px);color:white}
#sw-asadas-demo .sw-op-header p{margin:0;color:#d6f5f4}
#sw-asadas-demo .sw-op-header .sw-btn{background:#65d8ce;border-color:#65d8ce;color:#072c39;font-weight:700}
#sw-asadas-demo .sw-op-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:16px 0 22px}
#sw-asadas-demo .sw-op-card{margin:14px 0;border-radius:12px}
#sw-asadas-demo .sw-op-card h3{font-size:19px;margin:5px 0 12px}
#sw-asadas-demo .sw-op-card small{color:var(--sw-muted)}
#sw-asadas-demo .sw-op-card-head{display:flex;justify-content:space-between;align-items:start;gap:16px}
#sw-asadas-demo .sw-op-pill{display:inline-flex;align-items:center;white-space:nowrap;border-radius:99px;padding:6px 10px;background:var(--sw-soft);color:var(--sw-brand);font-size:12px;font-weight:700}
#sw-asadas-demo .sw-op-pill.late{background:#fff0e5;color:#9b451d}
#sw-asadas-demo .sw-op-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
#sw-asadas-demo .sw-op-complete{margin-top:14px;padding:18px;border:1px solid #a8d9d5;border-radius:12px;background:#f0faf8}
#sw-asadas-demo .sw-op-complete h4{margin:0 0 8px;font-size:17px}
#sw-asadas-demo .sw-op-complete p{margin:0 0 14px;color:var(--sw-muted)}
#sw-asadas-demo .sw-op-complete label{display:block;margin:12px 0;font-weight:600}
#sw-asadas-demo .sw-op-complete input[type=file],#sw-asadas-demo .sw-op-complete textarea{display:block;width:100%;margin-top:6px;max-width:100%;padding:11px;border:1px solid var(--sw-line);border-radius:8px;background:white}
#sw-asadas-demo .sw-op-complete .sw-btn{min-height:44px}
#sw-asadas-demo .sw-op-pill.done{background:#e2f5eb;color:#126244}
#sw-asadas-demo .sw-op-list-row{display:grid;grid-template-columns:110px minmax(0,1fr) auto auto;align-items:center;gap:16px;padding:15px 4px;border-bottom:1px solid var(--sw-line)}
#sw-asadas-demo .sw-op-list-row time{font-weight:700;color:var(--sw-brand)}
#sw-asadas-demo .sw-op-list-row small{display:block;color:var(--sw-muted);margin-top:4px}
#sw-asadas-demo .sw-op-point-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
#sw-asadas-demo .sw-op-point-grid .sw-op-card{margin:0}
#sw-asadas-demo .sw-op-map{height:420px;overflow:hidden;border:1px solid var(--sw-line);border-radius:12px}
#sw-asadas-demo .sw-op-map iframe{width:100%;height:100%;border:0}
#sw-asadas-demo .sw-op-controls{display:flex;align-items:end;gap:14px;flex-wrap:wrap}
#sw-asadas-demo .sw-op-controls label{display:grid;gap:6px;min-width:180px}
#sw-asadas-demo .sw-op-report h3{font-size:18px;margin-top:24px}
@media(max-width:750px){#sw-asadas-demo .sw-op-stats,#sw-asadas-demo .sw-op-point-grid{grid-template-columns:1fr}#sw-asadas-demo .sw-op-list-row{grid-template-columns:1fr auto}#sw-asadas-demo .sw-op-list-row time{grid-column:1}#sw-asadas-demo .sw-op-list-row>div{grid-column:1/-1}#sw-asadas-demo .sw-op-map{height:320px}}
`;operationsStyle.textContent+="\n#sw-asadas-demo .sw-project-intro{padding:28px;border-radius:16px;background:linear-gradient(120deg,#0c3545,#137d82);color:white;margin-bottom:20px}\n#sw-asadas-demo .sw-project-intro h2{font-size:28px;color:white;margin:0 0 6px;font-weight:700}\n#sw-asadas-demo .sw-project-intro p{color:#daf4f3;margin:0 0 18px}\n#sw-asadas-demo .sw-project-intro .sw-btn{background:#65d8ce;color:#073544;border:0;font-weight:700}\n#sw-asadas-demo .sw-project-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}\n#sw-asadas-demo .sw-project-card{margin:0;padding:22px;display:flex;flex-direction:column;gap:12px;border-left:4px solid #36bcb7}\n#sw-asadas-demo .sw-project-card h3{font-size:20px;line-height:1.25;margin:0}\n#sw-asadas-demo .sw-project-kicker{font-size:11px;letter-spacing:.08em;color:var(--sw-brand);text-transform:uppercase;font-weight:700}\n#sw-asadas-demo .sw-project-card p{color:var(--sw-muted);line-height:1.5}\n#sw-asadas-demo .sw-project-meta{display:flex;gap:8px;flex-wrap:wrap}\n#sw-asadas-demo .sw-project-meta span{padding:5px 9px;border-radius:100px;background:var(--sw-soft);color:var(--sw-brand);font-size:12px;font-weight:700}\n#sw-asadas-demo .sw-project-progress{height:8px;border-radius:8px;background:#e6f0f2;overflow:hidden}\n#sw-asadas-demo .sw-project-progress span{display:block;height:100%;background:#39bfb5}\n#sw-asadas-demo .sw-project-card .sw-op-actions{margin-top:auto}\n#sw-asadas-demo .sw-project-detail{border-top:1px solid var(--sw-line);padding-top:12px}\n#sw-asadas-demo .sw-project-detail summary{cursor:pointer;color:var(--sw-brand);font-weight:700}\n#sw-asadas-demo .sw-project-docs{display:grid;gap:7px;margin-top:10px}\n#sw-asadas-demo .sw-project-docs a{overflow-wrap:anywhere}\n#sw-asadas-demo .sw-project-profile h3{margin:20px 0 8px;font-size:17px}\n#sw-asadas-demo .sw-project-profile p{white-space:pre-wrap;overflow-wrap:anywhere}\n#sw-asadas-demo .sw-project-profile dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\n#sw-asadas-demo .sw-project-profile dt{font-size:12px;color:var(--sw-muted)}\n#sw-asadas-demo .sw-project-profile dd{margin:3px 0 0;font-weight:700}\n#sw-asadas-demo .sw-project-files label{display:block;margin:8px 0}\n#sw-asadas-demo .sw-project-files input{width:auto}\n#sw-asadas-demo .sw-form textarea{width:100%;min-height:90px;border:1px solid var(--sw-line);border-radius:8px;padding:10px;background:var(--sw-panel);color:var(--sw-text);font:inherit}\n@media(max-width:700px){#sw-asadas-demo .sw-project-grid,#sw-asadas-demo .sw-project-profile dl{grid-template-columns:1fr}}\n";
operationsStyle.textContent+="\n#sw-asadas-demo .sw-calendar-panel>h3{font-size:19px;margin:0 0 5px}\n#sw-asadas-demo .sw-calendar-row{grid-template-columns:105px minmax(0,1fr) auto auto}\n#sw-asadas-demo .sw-calendar-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}\n#sw-asadas-demo .sw-calendar-slot{grid-column:1/-1}\n#sw-asadas-demo .sw-calendar-slot:empty{display:none}\n#sw-asadas-demo .sw-calendar-slot .sw-op-complete{margin:0}\n@media(max-width:850px){#sw-asadas-demo .sw-calendar-row{grid-template-columns:1fr auto}#sw-asadas-demo .sw-calendar-row>div:nth-child(2),#sw-asadas-demo .sw-calendar-actions,#sw-asadas-demo .sw-calendar-slot{grid-column:1/-1}#sw-asadas-demo .sw-calendar-actions{justify-content:flex-start}}\n";
document.head.appendChild(operationsStyle);
const money=n=>'₡'+Number(n||0).toLocaleString('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2}),pct=n=>Number.isFinite(n)?n.toLocaleString('es-CR',{maximumFractionDigits:1})+' %':'Sin base';
const months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const modules=[['home','Resumen financiero'],['statements','Estados financieros'],['budget','Presupuesto de la ASADA'],['cash','Flujo de efectivo'],['petty','Caja chica'],['assets','Auxiliar de activos'],['board','Acuerdos de Junta Directiva'],['workplan','Plan de trabajo'],['payments','Acuerdos de pago para Junta Directiva'],['properties','Consulta de propiedades'],['finance-summary','Resumen financiero'],['orders','Órdenes de trabajo'],['calendar','Calendario de obligaciones'],['outages','Interrupciones del servicio'],['network','Mapa del acueducto'],['monthly','Informe mensual para la Junta'],['projects','Portafolio de proyectos']];
const summaryViews=[['home','Vista general'],['finance-summary','Análisis']];
const isSummary=view=>summaryViews.some(([key])=>key===view);
const assemblyLink=new URLSearchParams(location.search);
let asada='',year=new Date().getFullYear(),base=year-1,module='home',records=[],canEdit=false,canEditOperations=false,canCompleteOrders=false,canRestoreOutages=false,asadas=[],loading=false,busy=false,editing=null,isPlatformAdmin=false,budgetMonth=12,budgetService='Todos',budgetFilter='all';
if(modules.some(([key])=>key===assemblyLink.get('module')))module=assemblyLink.get('module');
$('#sw-title').textContent=modules.find(([key])=>key===module)[1];
const cutoff=Number(assemblyLink.get('through'));if(Number.isInteger(cutoff)&&cutoff>=1&&cutoff<=12)budgetMonth=cutoff;
const agreementProgress=state=>({'Pendiente':0,'En proceso':50,'Cumplido':100}[state]??0);
let selectedFinanceMetric='result';
let reportingMonth=new Date().getMonth()+1,monthlyExtra=null;
let boardSearch=null,boardQuery='',boardScope='current';
const status=t=>$('#sw-feedback').textContent=t;
async function api(route,input){const response=await fetch('/api/'+route,{method:input?'POST':'GET',credentials:'same-origin',headers:input?{'Content-Type':'application/json'}:{},body:input?JSON.stringify(input):undefined});let d;try{d=await response.json();}catch{throw Error('No pudimos conectar con la plataforma.');}if(!response.ok){if(response.status===401){status('Su sesión terminó. Ingrese de nuevo para continuar.');}throw Error(d.error||'No fue posible completar la operación.');}return d;}
const endpoint=(name,y=year)=>name+'?asada='+encodeURIComponent(asada)+'&year='+y;
const items=kind=>records.filter(x=>x.kind===kind),values=kind=>items(kind).map(x=>x.payload),sum=a=>a.reduce((s,v)=>s+Number(v||0),0);
const settings=()=>values('settings')[0]||{opening:0,fund:0};
function tx(){return [...values('movement'),...values('petty').map(x=>({...x,type:'out',part:x.part||'Administración',concept:'Caja chica · '+x.concept}))];}
function totals(){const t=tx(),income=sum(t.filter(x=>x.type==='in').map(x=>x.amount)),expense=sum(t.filter(x=>x.type==='out').map(x=>x.amount));return {income,expense,closing:settings().opening+income-expense,budget:sum(values('budget').filter(x=>x.budgetType!=='income').map(x=>x.amount))};}
const stat=(label,value,note='')=>'<div class="sw-stat"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(note)+'</small></div>';
const table=(headers,rows)=>'<div class="sw-table-wrap"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+headers.length+'">Aún no hay registros para este período.</td></tr>')+'</tbody></table></div>';
const btn=(label,kind)=>canEdit?'<button type="button" class="sw-btn primary" data-new="'+kind+'">'+esc(label)+'</button>':'';
const edit=r=>canEdit?'<button class="sw-btn" type="button" data-edit="'+r.id+'">Editar</button> <button class="sw-btn" type="button" data-archive="'+r.id+'">Archivar</button>':'';
const state=a=>!['Cumplido','Cancelado'].includes(a.state)&&a.due<new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'})?'Vencido':a.state;
function chart(){const vals=months.map((_,i)=>[sum(tx().filter(x=>Number(x.date.slice(5,7))===i+1&&x.type==='in').map(x=>x.amount)),sum(tx().filter(x=>Number(x.date.slice(5,7))===i+1&&x.type==='out').map(x=>x.amount))]);const max=Math.max(1e6,Math.ceil(Math.max(...vals.flat())/1e6)*1e6);let s='<svg class="sw-chart" viewBox="0 0 560 240" role="img" aria-label="Entradas y salidas mensuales en millones de colones">';for(let j=0;j<=4;j++){let y=180-j*38;s+='<line x1="48" y1="'+y+'" x2="550" y2="'+y+'" stroke="var(--sw-line)"/><text x="40" y="'+(y+4)+'" text-anchor="end">'+(max*j/4/1e6).toFixed(1)+'</text>';}vals.forEach((v,i)=>{const x=56+i*41;v.forEach((n,j)=>{const h=n/max*152;s+='<rect x="'+(x+j*13)+'" y="'+(180-h)+'" width="11" height="'+h+'" rx="2" fill="var(--sw-'+(j?'expense':'income')+')"><title>'+months[i]+': '+money(n)+'</title></rect>';});s+='<text x="'+(x+12)+'" y="201" text-anchor="middle">'+months[i]+'</text>';});return s+'<text x="48" y="18">Millones de ₡</text></svg>';}
const budgetServices=['Sin clasificar','Acueducto','Alcantarillado','Hidrantes','Protección del recurso hídrico'];
const budgetTypes={income:'Ingresos',expense:'Gastos',investment:'Inversiones'};
const budgetGroups=type=>type==='income'?['Sin clasificar','Ingresos']:type==='investment'?['Sin clasificar','Inversiones']:['Sin clasificar','Operativos','Administrativos','Financieros'];
function budgetClass(p,type='expense'){return {service:p.service||'Sin clasificar',budgetType:p.budgetType||type,group:p.group||'Sin clasificar',part:p.part||'Sin partida'};}
function budgetMatrix(budgets,transactions,throughMonth=12,service='Todos',type='all'){
 const map=new Map(),matches=p=>(service==='Todos'||p.service===service)&&(type==='all'||p.budgetType===type);
 const get=p=>{const c=budgetClass(p),key=JSON.stringify([c.service,c.budgetType,c.group,c.part]);if(!map.has(key))map.set(key,{...c,key,annual:0,hasBudget:false,monthly:Array(12).fill(0)});return map.get(key);};
 for(const p of budgets){const c=budgetClass(p);if(matches(c)){const r=get(c);r.annual+=Math.round(Number(p.amount||0)*100);r.hasBudget=true;}}
 for(const p of transactions){const month=Number(p.date?.slice(5,7));if(!Number.isInteger(month)||month<1||month>12)continue;const c=budgetClass(p,p.type==='in'?'income':'expense');if(matches(c))get(c).monthly[month-1]+=Math.round(Number(p.amount||0)*100);}
 return [...map.values()].map(r=>{r.annual/=100;r.monthly=r.monthly.map(n=>n/100);r.executed=Math.round(sum(r.monthly.slice(0,throughMonth))*100)/100;r.remaining=Math.round((r.annual-r.executed)*100)/100;r.percent=r.annual>0?r.executed/r.annual*100:NaN;return r;}).sort((a,b)=>['income','expense','investment'].indexOf(a.budgetType)-['income','expense','investment'].indexOf(b.budgetType)||a.service.localeCompare(b.service,'es')||a.group.localeCompare(b.group,'es')||a.part.localeCompare(b.part,'es'));
}
function budgetHorizontal(rows,throughMonth){
 const cell=(n,cls='')=>'<td class="num '+cls+'">'+esc(money(n))+'</td>';
 const row=(r,total=false)=>'<tr class="'+(total?'sw-budget-total':'')+'"><th scope="row">'+esc(r.part)+(total?'':'<small>'+esc(r.service+' · '+r.group)+'</small>')+'</th>'+cell(r.annual)+r.monthly.map((n,i)=>cell(n,i>=throughMonth?'sw-budget-future':'')).join('')+cell(r.executed)+cell(r.remaining,r.remaining<0&&r.budgetType!=='income'?'sw-negative':'')+'<td class="num">'+esc(pct(r.percent))+'</td></tr>';
 let body='';for(const [type,label] of Object.entries(budgetTypes)){const group=rows.filter(r=>r.budgetType===type);if(!group.length)continue;const annual=sum(group.map(r=>r.annual)),executed=sum(group.map(r=>r.executed));body+='<tr class="sw-budget-section"><th colspan="17">'+esc(label)+' · '+(type==='income'?'Saldo: falta por recaudar':'Saldo: queda por ejecutar')+'</th></tr>'+group.map(r=>row(r)).join('')+row({part:'Total de '+label.toLowerCase(),budgetType:type,annual,executed,remaining:annual-executed,percent:annual?executed/annual*100:NaN,monthly:months.map((_,i)=>sum(group.map(r=>r.monthly[i])))},true);}
 return '<div class="sw-table-wrap sw-budget-wrap" tabindex="0" role="region" aria-label="Presupuesto horizontal de enero a diciembre; deslice para consultar todos los meses"><table class="sw-budget-table"><thead><tr><th scope="col">Servicio / partida</th><th scope="col" class="num">Presupuesto anual</th>'+months.map(m=>'<th scope="col" class="num">'+m+'</th>').join('')+'<th scope="col" class="num">Acumulado a '+months[throughMonth-1]+'</th><th scope="col" class="num">Saldo anual</th><th scope="col" class="num">% ejecución</th></tr></thead><tbody>'+(body||'<tr><td colspan="17">No hay partidas ni movimientos para esta consulta. Registre el presupuesto aprobado y los movimientos mensuales.</td></tr>')+'</tbody></table></div>';
}
function budgetFields(p,type){
 const c=budgetClass(p,type),select=(key,label,options,value)=>'<label>'+label+'<select name="'+key+'">'+options.map(([id,text])=>'<option value="'+esc(id)+'" '+(id===value?'selected':'')+'>'+esc(text)+'</option>').join('')+'</select></label>';
 const saved=values('budget');
 return (saved.length?'<label class="wide">Usar una partida del presupuesto<select id="sw-budget-template"><option value="">Elegir una partida o completar los campos</option>'+items('budget').map(r=>{const c=budgetClass(r.payload);return '<option value="'+esc(r.id)+'">'+esc(budgetTypes[c.budgetType]+' · '+c.service+' · '+c.group+' · '+c.part)+'</option>';}).join('')+'</select></label>':'')+select('service','Servicio',budgetServices.map(x=>[x,x]),c.service)+select('budgetType','Clasificación',Object.entries(budgetTypes),c.budgetType)+select('group','Grupo',budgetGroups(c.budgetType).map(x=>[x,x]),c.group);
}
function wireBudgetForm(kind){
 if(!['budget','movement','petty'].includes(kind))return;
 const f=$('#sw-form'),type=f.elements.budgetType,group=f.elements.group;
 const groups=()=>{const previous=group.value;group.innerHTML=budgetGroups(type.value).map(x=>'<option '+(x===previous?'selected':'')+'>'+esc(x)+'</option>').join('');};
 if(kind==='petty')type.querySelector('option[value="income"]').remove();
 const sync=()=>{if(kind==='movement'){if(f.elements.type.value==='in')type.value='income';else if(type.value==='income')type.value='expense';}groups();};
 type.addEventListener('change',()=>{if(kind==='movement')f.elements.type.value=type.value==='income'?'in':'out';groups();});
 if(kind==='movement')f.elements.type.addEventListener('change',sync);
 const template=$('#sw-budget-template');if(template)template.addEventListener('change',()=>{const r=items('budget').find(r=>r.id===template.value);if(!r)return;const c=budgetClass(r.payload);if(kind==='petty'&&c.budgetType==='income'){template.value='';$('#sw-error').textContent='Para caja chica seleccione una partida de gastos o inversiones.';return;}for(const k of ['service','budgetType','part'])f.elements[k].value=c[k];if(kind==='movement')f.elements.type.value=c.budgetType==='income'?'in':'out';groups();group.value=c.group;$('#sw-error').textContent='';});
 sync();
}
function budgetView(){
 const rows=budgetMatrix(values('budget'),tx(),budgetMonth,budgetService,budgetFilter),all=budgetMatrix(values('budget'),tx(),budgetMonth,budgetService);
 const totals=type=>{const a=all.filter(r=>r.budgetType===type);return {annual:sum(a.map(r=>r.annual)),executed:sum(a.map(r=>r.executed))};};
 const stats=Object.entries(budgetTypes).map(([type,label])=>{const v=totals(type);return stat(label+' · ejecutado a '+months[budgetMonth-1],money(v.executed),'Presupuesto anual: '+money(v.annual)+' · '+pct(v.annual?v.executed/v.annual*100:NaN));}).join('');
 const max=Math.max(1,...all.map(r=>r.annual),...Object.keys(budgetTypes).flatMap(k=>Object.values(totals(k))));
 const graph=Object.entries(budgetTypes).map(([type,label])=>{const v=totals(type);return '<button type="button" class="sw-fin-bar" data-budget-filter="'+type+'" aria-pressed="'+(budgetFilter===type)+'" aria-label="Ver partidas de '+label.toLowerCase()+'"><strong>'+label+'</strong>'+[['Presupuesto anual',v.annual,''],['Ejecutado a '+months[budgetMonth-1],v.executed,' sw-budget-actual']].map(([label,n,cls])=>'<span class="sw-fin-bar-label"><span>'+label+'</span><strong>'+money(n)+'</strong></span><span class="sw-fin-track"><span class="sw-fin-fill'+cls+'" style="width:'+n/max*100+'%"></span></span>').join('')+'</button>';}).join('');
 const unclassified=all.filter(r=>r.service==='Sin clasificar'||r.group==='Sin clasificar'),unbudgeted=all.filter(r=>!r.hasBudget&&r.executed>0),over=all.filter(r=>r.budgetType!=='income'&&r.hasBudget&&r.executed>r.annual);
 return '<div class="sw-head">'+btn('Registrar presupuesto aprobado','budget')+btn('Registrar movimiento mensual','movement')+'</div><section class="sw-panel"><h2>El presupuesto de su ASADA, mes a mes</h2><p>Compare el presupuesto anual aprobado por la Junta Directiva y enviado al AyA con las entradas y los pagos registrados. Cada partida conserva su servicio y grupo. Deslice la tabla para recorrer los doce meses.</p><div class="sw-toolbar"><label>Servicio<select id="sw-budget-service">'+['Todos',...budgetServices].map(s=>'<option '+(s===budgetService?'selected':'')+'>'+esc(s)+'</option>').join('')+'</select></label><label>Consultar<select id="sw-budget-type">'+[['all','Ingresos, gastos e inversiones'],...Object.entries(budgetTypes)].map(([id,label])=>'<option value="'+id+'" '+(id===budgetFilter?'selected':'')+'>'+label+'</option>').join('')+'</select></label><label>Acumulado hasta<select id="sw-budget-month">'+months.map((m,i)=>'<option value="'+(i+1)+'" '+(budgetMonth===i+1?'selected':'')+'>'+m+'</option>').join('')+'</select></label></div></section><div class="sw-stats">'+stats+'</div><section class="sw-panel"><h2>Presupuestado y ejecutado</h2><div class="sw-budget-chart">'+graph+'</div><p class="sw-note">Pulse un gráfico para ver sus partidas. Las tarjetas y gráficos resumen el servicio seleccionado. La tabla responde también al filtro de clasificación.</p></section><section class="sw-panel"><h2>Comparativo horizontal · Año '+year+'</h2>'+budgetHorizontal(rows,budgetMonth)+'<p class="sw-note">El acumulado y el porcentaje llegan hasta '+months[budgetMonth-1]+'. Los meses posteriores se muestran atenuados y quedan fuera del acumulado. No se reparte el presupuesto anual entre doce. Cero significa que no hay movimientos registrados; confirme que el mes esté completo.</p><p class="sw-note">Los ingresos muestran recaudación de efectivo; gastos e inversiones muestran pagos. No incluye cuentas pendientes ni sustituye los estados financieros. Caja chica se incluye una sola vez.</p></section><section class="sw-panel"><h2>Para revisar con su equipo</h2><p>'+unclassified.length+' partidas con servicio o grupo sin clasificar. '+unbudgeted.length+' partidas con ejecución y sin presupuesto registrado. '+over.length+' partidas de gastos o inversiones superan su presupuesto anual.</p><p class="sw-note">Clasifique los registros anteriores desde Editar. Al registrar un movimiento, puede elegir una partida del presupuesto para conservar su servicio, grupo y nombre.</p></section><section class="sw-panel"><h2>Partidas aprobadas y referencias</h2>'+table(['Servicio','Clasificación','Grupo','Partida','Monto anual','Referencia','Acciones'],items('budget').filter(r=>{const c=budgetClass(r.payload);return (budgetService==='Todos'||c.service===budgetService)&&(budgetFilter==='all'||c.budgetType===budgetFilter);}).map(r=>{const c=budgetClass(r.payload);return [esc(c.service),esc(budgetTypes[c.budgetType]),esc(c.group),esc(c.part),money(r.payload.amount),esc(r.payload.reference),edit(r)];}))+'</section>';
}

function cashMatrix(transactions,opening) {
 const monthly=type=>months.map((_,i)=>sum(transactions.filter(x=>x.type===type&&Number(x.date.slice(5,7))===i+1).map(x=>x.amount)));
 const income=monthly('in'),expense=monthly('out'),net=income.map((n,i)=>n-expense[i]);
 let balance=Number(opening||0);const initial=[],closing=[];
 for(let i=0;i<12;i++){initial.push(balance);balance+=net[i];closing.push(balance);}
 const groups=type=>{const map=new Map();for(const x of transactions.filter(x=>x.type===type)){const key=JSON.stringify([x.part||'Sin partida',x.concept||'Sin descripción']);if(!map.has(key))map.set(key,{label:(x.part||'Sin partida')+' · '+(x.concept||'Sin descripción'),values:Array(12).fill(0)});map.get(key).values[Number(x.date.slice(5,7))-1]+=Number(x.amount||0);}return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label,'es'));};
 return {initial,closing,income,expense,net,incomeGroups:groups('in'),expenseGroups:groups('out')};
}
function cashTable(transactions,opening,m=cashMatrix(transactions,opening)) {
 const cell=n=>'<td class="num'+(n<0?' sw-negative':'')+'">'+esc(money(n))+'</td>';
 const row=(label,values,annual,cls='')=>'<tr class="'+cls+'"><th scope="row">'+esc(label)+'</th>'+values.map(cell).join('')+cell(annual)+'</tr>';
 const section=label=>'<tr class="sw-cash-section"><th colspan="14" scope="colgroup">'+esc(label)+'</th></tr>';
 const details=groups=>groups.length?groups.map(g=>row(g.label,g.values,sum(g.values))).join(''):'<tr><td colspan="14">Aún no hay movimientos registrados en este grupo.</td></tr>';
 return '<div class="sw-table-wrap sw-cash-wrap" tabindex="0" role="region" aria-label="Flujo de efectivo de enero a diciembre; deslice para ver todos los meses"><table class="sw-cash-table"><thead><tr><th scope="col">Concepto</th>'+months.map(v=>'<th class="num" scope="col">'+v+'</th>').join('')+'<th class="num" scope="col">Resumen anual</th></tr></thead><tbody>'+row('Saldo inicial',m.initial,Number(opening||0),'sw-cash-total')+section('INGRESOS DE EFECTIVO')+details(m.incomeGroups)+row('Total de ingresos',m.income,sum(m.income),'sw-cash-total')+section('EGRESOS DE EFECTIVO')+details(m.expenseGroups)+row('Total de egresos',m.expense,sum(m.expense),'sw-cash-total')+row('Movimiento neto',m.net,sum(m.net),'sw-cash-total')+row('Saldo final disponible',m.closing,m.closing[11],'sw-cash-final')+'</tbody></table></div><p class="sw-note">El resumen anual suma ingresos, egresos y movimientos netos. Para los saldos muestra el inicio del año y el cierre de diciembre; los saldos mensuales no se suman.</p>';
}
function financeViewData(){
 const statements=values('statement');if(statements.length!==1)return null;
 const p=statements[0],s=summarizeSavedStatement(p);
 const metrics={assets:{label:'Activos',value:s.assets,text:'Lo que tiene la ASADA: dinero, cuentas por cobrar e infraestructura. Tener activos no significa que todo ese dinero esté disponible en el banco.'},liabilities:{label:'Pasivos',value:s.liabilities,text:'Son las obligaciones pendientes de la ASADA. Revise sus fechas de pago y los fondos disponibles para atenderlas.'},income:{label:'Ingresos',value:s.income,text:'Son los ingresos contables reconocidos durante el período. Una parte puede estar pendiente de cobro; no equivalen necesariamente al dinero que entró al banco.'},expenses:{label:'Gastos',value:s.expenses,text:'Son los gastos contables del período. Pueden incluir depreciación u obligaciones pendientes de pago; no equivalen necesariamente a salidas de efectivo.'},result:{label:s.result<0?'Déficit':s.result===0?'Resultado equilibrado':'Utilidad / excedente',value:s.result,text:s.result>0?'Los ingresos superaron los gastos. Antes de decidir cómo utilizar recursos, revise el efectivo disponible y los pagos pendientes.':s.result<0?'Los gastos superaron los ingresos. Revisen con el contador qué explica el déficit y cuáles acciones de mejora son necesarias.':'Los ingresos igualaron los gastos. El período terminó sin excedente ni déficit.'}};
 return {p,s,metrics};
}
const projectionDefaults=()=>({opening:0,lines:[
 ['in','Cobro del servicio de agua'],['in','Otros ingresos'],
 ...['Luz','Agua','Salarios','CCSS','Pólizas del INS','Cuotas de préstamos','Proveedor 1','Proveedor 2','Proveedor 3','Proveedor 4','Proveedor 5'].map(label=>['out',label])
].map(([type,label])=>({type,label,values:Array(12).fill(0)}))});
let cashView=assemblyLink.get('vista')==='proyectado'?'projected':'real';
function projectionMatrix(p){
 const cents=n=>Math.round(n*100);
 const group=type=>p.lines.filter(x=>x.type===type);
 const incomeGroups=group('in'),expenseGroups=group('out');
 const monthly=lines=>months.map((_,i)=>sum(lines.map(x=>cents(x.values[i]))));
 const inc=monthly(incomeGroups),out=monthly(expenseGroups),delta=inc.map((n,i)=>n-out[i]);
 let balance=cents(p.opening);const initial=[],closing=[];
 for(const change of delta){initial.push(balance/100);balance+=change;closing.push(balance/100);}
 return {initial,closing,income:inc.map(n=>n/100),expense:out.map(n=>n/100),net:delta.map(n=>n/100),incomeGroups,expenseGroups};
}
function projectionView(){
 const p=values('cash_projection')[0];
 const action=btn(p?'Editar proyección':'Crear proyección','cash_projection');
 if(!p)return '<section class="sw-panel"><h2>Flujo proyectado · '+year+'</h2><p>Aún no hay una proyección para este año. Estime el saldo inicial y registre cada cobro o pago en el mes en que espera que ocurra.</p>'+action+'</section>';
 const m=projectionMatrix(p),shortfall=months.filter((_,i)=>m.closing[i]<0);
 return '<section class="sw-panel"><div class="sw-head"><h2>Flujo proyectado · '+year+'</h2>'+action+'</div><p>Estos montos son estimaciones y se guardan aparte de los movimientos reales.</p><div class="sw-stats">'+stat('Saldo inicial estimado',money(p.opening))+stat('Saldo final proyectado',money(m.closing[11]))+stat('Meses con saldo negativo',String(shortfall.length),shortfall.join(', '))+'</div>'+cashTable([],p.opening,m)+'</section>';
}
function projectionEditor(){
 if(!canEdit)return;
 const record=items('cash_projection')[0],p=record?.payload||projectionDefaults(),editor=$('#sw-editor');
 const group=(type,title)=>'<h3>'+title+'</h3><div class="sw-table-wrap sw-cash-wrap" tabindex="0" role="region" aria-label="'+title+'"><table class="sw-cash-table"><thead><tr><th scope="col">Concepto</th>'+months.map(m=>'<th scope="col">'+m+'</th>').join('')+'<th scope="col">Repetir monto</th><th scope="col">Acciones</th></tr></thead><tbody data-lines="'+type+'"></tbody></table></div><button class="sw-btn" type="button" data-projection-add="'+type+'">Agregar '+(type==='in'?'ingreso':'gasto')+'</button>';
 editor.innerHTML='<h2>Editar flujo proyectado · '+year+'</h2><form id="sw-projection-form"><p>Use el mes esperado de cobro o pago. Puede cambiar el nombre de cualquier rubro.</p>'+amount('opening','Saldo inicial estimado ₡',p.opening).replace('min="0"','min="-1000000000000"')+group('in','Ingresos esperados')+group('out','Egresos esperados')+'<p id="sw-error" role="alert"></p><div class="sw-head"><button class="sw-btn primary" type="submit">Guardar proyección</button><button class="sw-btn" type="button" data-cancel>Cancelar</button></div></form>';
 const f=$('#sw-projection-form');
 const add=(type,line={label:'',values:Array(12).fill(0)})=>{
  const row=document.createElement('tr');
  row.innerHTML='<th scope="row"><input data-label aria-label="Nombre del rubro" maxlength="60" required value="'+esc(line.label)+'"></th>'+line.values.map((n,i)=>'<td><input data-value aria-label="'+months[i]+' · monto en colones" style="min-width:7rem" type="number" min="0" max="1000000000000" step="0.01" value="'+(n||'')+'"></td>').join('')+
  '<td><select data-source aria-label="Mes de origen">'+months.slice(0,-1).map((m,i)=>'<option value="'+i+'">'+m+'</option>').join('')+'</select> <button type="button" class="sw-btn" data-projection-repeat>Copiar a meses siguientes</button></td><td><button type="button" class="sw-btn" data-projection-remove>Quitar</button></td>';
  f.querySelector('[data-lines="'+type+'"]').append(row);return row;
 };
 p.lines.forEach(line=>add(line.type,line));
 f.onclick=ev=>{
  const button=ev.target.closest('button');if(!button||busy||loading)return;
  if(button.dataset.projectionAdd){if(f.querySelectorAll('[data-label]').length>=24){$('#sw-error').textContent='Puede incluir hasta 24 rubros.';return;}add(button.dataset.projectionAdd).querySelector('[data-label]').focus();}
  if(button.hasAttribute('data-projection-remove'))button.closest('tr').remove();
  if(button.hasAttribute('data-projection-repeat')){
   const row=button.closest('tr'),start=Number(row.querySelector('[data-source]').value),inputs=[...row.querySelectorAll('[data-value]')];
   if(inputs[start].value===''||!inputs[start].reportValidity()){$('#sw-error').textContent='Digite el monto del mes que quiere copiar.';return;}
   if(inputs.slice(start+1).some(x=>x.value!==''&&x.value!==inputs[start].value)&&!confirm('¿Reemplazar los montos de los meses siguientes en este rubro?'))return;
   inputs.slice(start+1).forEach(x=>x.value=inputs[start].value);
  }
 };
 f.onsubmit=ev=>{
  ev.preventDefault();if(busy||loading)return;
  const lines=[...f.querySelectorAll('[data-lines]')].flatMap(body=>[...body.rows].map(row=>({type:body.dataset.lines,label:row.querySelector('[data-label]').value.trim(),values:[...row.querySelectorAll('[data-value]')].map(i=>Number(i.value))})));
  if(!lines.length||lines.some(x=>!x.label)){$('#sw-error').textContent='Agregue al menos un rubro y complete su nombre.';return;}
  save('cash_projection',{opening:Number(f.elements.opening.value),lines},record);
 };
 editor.hidden=false;f.elements.opening.focus();
}

function financeDetail(data,key){const m=data.metrics[key];return '<h2>'+esc(m.label)+': '+money(m.value)+'</h2><p>'+esc(m.text)+'</p>'+(key==='assets'?table(['Composición de los activos','Monto'],[['Efectivo y equivalentes',money(data.p.cash)],['Cuentas por cobrar',money(data.p.receivables)],['Activos fijos netos',money(data.p.fixed)],['Otros activos',money(data.p.other)]]):key==='result'?table(['Cálculo del resultado','Monto'],[['Ingresos',money(data.s.income)],['Menos: gastos',money(data.s.expenses)],[esc(m.label),money(data.s.result)]]):'');}
function financeSummary(){
 const n=values('statement').length;if(n!==1)return '<section class="sw-panel"><h2>'+(!n?'Falta el estado financiero de este año':'Revise los estados registrados')+'</h2><p>'+(!n?'Registre el estado financiero en Estados financieros. Este resumen tomará automáticamente sus cifras.':'Existe más de un estado para el período. Revise los registros antes de generar el resumen.')+'</p><button class="sw-btn primary" data-module="statements">Ir a Estados financieros</button></section>';
 let data;try{data=financeViewData();}catch(e){return '<section class="sw-panel"><p>'+esc(e.message)+'</p><button class="sw-btn" data-module="statements">Revisar Estados financieros</button></section>';}
 const bars=keys=>{const max=Math.max(1,...keys.map(k=>data.metrics[k].value));return keys.map(k=>{const m=data.metrics[k];return '<button type="button" class="sw-fin-bar" data-fin-metric="'+k+'" title="'+esc(m.label+': '+money(m.value)+' · Pulse para conocer qué significa')+'" aria-label="'+esc(m.label+': '+money(m.value)+'. Ver explicación')+'"><span class="sw-fin-bar-label"><span>'+esc(m.label)+'</span><strong>'+money(m.value)+'</strong></span><span class="sw-fin-track" aria-hidden="true"><span class="sw-fin-fill" style="width:'+Math.max(0,m.value/max*100)+'%"></span></span></button>';}).join('');};
 return '<section class="sw-panel"><h2>Los números de su ASADA, en palabras sencillas</h2><p>Información tomada de Estados financieros · Año '+year+' · Corte: '+esc(data.p.date)+'.</p><p class="sw-note">Pulse una tarjeta o una barra para explorar su monto y significado. Los gráficos se actualizan al cambiar la ASADA o el año.</p><button class="sw-btn" data-module="statements">Revisar estado financiero</button> <button id="sw-fin-word" class="sw-btn primary">Descargar resumen en Word</button></section><div class="sw-fin-cards">'+Object.entries(data.metrics).map(([k,m])=>'<button type="button" class="sw-fin-card '+(m.value<0?'negative':'')+'" data-fin-metric="'+k+'" aria-pressed="'+(selectedFinanceMetric===k)+'"><span>'+esc(m.label)+'</span><strong>'+money(m.value)+'</strong><small>Ver explicación</small></button>').join('')+'</div><div class="sw-fin-charts"><section class="sw-panel"><h2>Lo que tiene y lo que debe</h2>'+bars(['assets','liabilities'])+'<p class="sw-note">Activos y pasivos son saldos a la fecha de corte.</p></section><section class="sw-panel"><h2>Ingresos frente a gastos</h2>'+bars(['income','expenses'])+'<p class="sw-note">'+(data.s.income>0?'Por cada ₡100 de ingresos, se reconocieron '+money(data.s.expenses/data.s.income*100)+' de gastos.':'Sin ingresos registrados no se calcula una proporción de gastos sobre ingresos.')+'</p></section></div><section id="sw-fin-detail" class="sw-panel sw-fin-detail" aria-live="polite">'+financeDetail(data,selectedFinanceMetric)+'</section><section class="sw-panel"><h2>Para conversar con su equipo</h2><p>'+esc(data.metrics.result.text)+'</p><p>'+esc(financialComment(data.p))+'</p><p class="sw-note">Ingresos y gastos corresponden al período informado en el estado. El excedente contable no equivale necesariamente al dinero disponible.</p></section>';
}
async function downloadFinanceWord(){
 const d=financeViewData();if(!d)throw Error('Registre un estado financiero para este año.');const name=asadas.find(a=>a.id===asada)?.name||'ASADA';
 const rows=Object.values(d.metrics).map(m=>[m.label,m.value]);const report={name,example:false,start:'',end:d.p.date,date:d.p.date,data:{...d.p,assets:d.s.assets},warnings:[],summary:rows,rows,cards:Object.values(d.metrics).map(m=>({title:m.label,value:money(m.value),text:m.text})),checks:[financialComment(d.p)],priorities:['Revisar las cifras con la administración, la Junta Directiva y el contador; definir acciones y responsables.']};
 const button=$('#sw-fin-word');busy=true;lock(true);button.disabled=true;status('Preparando el resumen en Word…');try{const images=[financeChartPNG('Activos y pasivos',[['Activos',d.s.assets],['Pasivos',d.s.liabilities]]),financeChartPNG('Ingresos y gastos',[['Ingresos',d.s.income],['Gastos',d.s.expenses]])].filter(Boolean);const blob=await buildFinanceWord(report,images),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Resumen_Financiero_'+year+'.docx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Resumen descargado.');}finally{busy=false;lock(false);button.disabled=false;}
}
const paymentStates=['Pendiente de aprobación','Aprobado','Devuelto para revisión','Pagado'];
let paymentFilter='Pendiente de aprobación',paymentSession='',paymentSelection=new Set(),paymentSelectionInitialized=false;
function paymentRows(){return items('payment').filter(r=>(!paymentFilter||r.payload.state===paymentFilter)&&(!paymentSession||r.payload.session===paymentSession)).sort((a,b)=>a.payload.date.localeCompare(b.payload.date)||a.payload.supplier.localeCompare(b.payload.supplier,'es'));}
function paymentsView(){
 const rows=paymentRows();if(!paymentSelectionInitialized){paymentSelection=new Set(rows.map(r=>r.id));paymentSelectionInitialized=true;}
 const selected=rows.filter(r=>paymentSelection.has(r.id)),total=rows.reduce((n,r)=>n+Math.round(r.payload.amount*100),0)/100;
 return '<section class="sw-panel sw-payments"><h2>Preparar los pagos para la sesión</h2><p>Reúna las facturas pendientes, explique el motivo de cada pago y presente la relación a la Junta Directiva. Después de la sesión, registre el acuerdo; cuando se pague, agregue el comprobante.</p><div class="sw-actions">'+btn('Agregar pago','payment')+'<button type="button" class="sw-btn" data-module="home">Volver al Panel de gestión</button></div><div class="sw-form"><label>Estado<select id="sw-payment-state"><option value="">Todos los estados</option>'+paymentStates.map(x=>'<option '+(paymentFilter===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label><label>Sesión<select id="sw-payment-session"><option value="">Todas las sesiones</option>'+[...new Set(values('payment').map(p=>p.session).filter(Boolean))].sort().map(x=>'<option '+(paymentSession===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label></div><div class="sw-stats">'+stat('Pagos de esta consulta',rows.length)+stat('Monto de esta consulta',money(total))+stat('Para el documento',money(selected.reduce((n,r)=>n+Math.round(r.payload.amount*100),0)/100),'Seleccione los pagos que desea presentar')+'</div><div class="sw-actions"><button type="button" class="sw-btn" data-payment-select="all">Seleccionar todos</button><button type="button" class="sw-btn" data-payment-select="none">Quitar selección</button><button type="button" class="sw-btn primary" id="sw-payment-print" '+(!selected.length?'disabled':'')+'>Preparar documento / guardar PDF</button></div>'+table(['Incluir','Fecha','Proveedor / factura electrónica','Concepto o motivo','Monto a pagar ₡','Estado y respaldo','Acciones'],rows.map(r=>{const p=r.payload;return ['<input type="checkbox" data-payment-id="'+esc(r.id)+'" aria-label="Incluir pago a '+esc(p.supplier)+'" '+(paymentSelection.has(r.id)?'checked':'')+'>',esc(p.date),esc(p.supplier)+'<small>Factura: '+esc(p.invoice)+'</small>',esc(p.concept),esc(money(p.amount)),esc(p.state)+'<small>Sesión: '+esc(p.session||'Por asignar')+' · Acuerdo: '+esc(p.agreement||'Por registrar')+'</small>'+(p.paidDate?'<small>Pagado: '+esc(p.paidDate)+' · '+esc(p.paymentRef)+'</small>':'')+(p.documentId&&canEdit?'<a href="/api/profile-file?asada='+encodeURIComponent(asada)+'&id='+encodeURIComponent(p.documentId)+'">Descargar factura</a>':''),canEdit?'<button class="sw-btn" type="button" data-edit="'+esc(r.id)+'">Editar / seguimiento</button>'+(!['Aprobado','Pagado'].includes(p.state)?' <button class="sw-btn" type="button" data-archive="'+esc(r.id)+'">Archivar</button>':''):'Consulta'];}))+'<p class="sw-note">Los estados reflejan lo registrado por el equipo. La aprobación debe constar en el acta de Junta Directiva. Marcar “Pagado” no crea un movimiento en el flujo de efectivo: registre allí el desembolso una sola vez. Todos los montos se registran en colones.</p></section>';
}
function paymentForm(p,date){return (['Aprobado','Pagado'].includes(p.state)?'<p class="sw-note wide">Los pagos aprobados conservan monto, factura y respaldo. Para corregir uno aprobado, seleccione “Devuelto para revisión” y explique el motivo. Un pago realizado conserva sus datos; puede completar observaciones o el adjunto.</p>':'')+field('date','Fecha de presentación del pago',date,'date')+field('supplier','Nombre del proveedor',p.supplier||'')+field('supplierTax','Cédula del proveedor (opcional)',p.supplierTax||'','text',false)+amount('amount','Monto a pagar ₡',p.amount||0)+field('concept','Concepto o razón del pago',p.concept||'')+field('invoice','Número de factura electrónica',p.invoice||'')+field('session','Número de sesión (puede asignarlo luego)',p.session||'','text',false)+field('sessionDate','Fecha de sesión',p.sessionDate||'','date',false)+'<label>Estado<select name="state">'+paymentStates.map(x=>'<option '+(p.state===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label><div class="sw-payment-approval"><h3>Cuando el pago ya fue aprobado</h3><div class="sw-form">'+field('agreement','Número de acuerdo',p.agreement||'','text',false)+field('approvalDate','Fecha de aprobación',p.approvalDate||'','date',false)+field('approvalBy','Persona que registra el respaldo del acuerdo',p.approvalBy||'','text',false)+'</div><label class="sw-check"><input type="checkbox" name="confirmApproval" '+(['Aprobado','Pagado'].includes(p.state)?'checked':'')+'> Confirmo que la aprobación consta en el acta de Junta Directiva.</label></div><div class="sw-payment-paid"><h3>Cuando el pago ya se realizó</h3><div class="sw-form">'+field('paidDate','Fecha del pago',p.paidDate||'','date',false)+field('paymentRef','Referencia de transferencia o comprobante',p.paymentRef||'','text',false)+'</div></div>'+field('note','Observaciones / motivo de devolución',p.note||'','text',false)+'<input type="hidden" name="documentId" value="'+esc(p.documentId||'')+'"><label>Adjuntar factura (PDF, JPG o PNG; máximo 5 MB)<input name="invoiceFile" type="file" accept="application/pdf,image/jpeg,image/png"></label>'+(p.documentId?'<p class="sw-note">Ya tiene una factura adjunta. Si selecciona otro archivo, el anterior se conservará en los documentos de la ASADA.</p>':'');}
function wirePaymentForm(){const f=$('#sw-form');if(!f?.elements.state)return;const wire=()=>{const approval=['Aprobado','Pagado'].includes(f.elements.state.value),paid=f.elements.state.value==='Pagado';$('.sw-payment-approval').hidden=!approval;$('.sw-payment-paid').hidden=!paid;for(const k of ['session','sessionDate','agreement','approvalDate','approvalBy','confirmApproval'])f.elements[k].required=approval;for(const k of ['paidDate','paymentRef'])f.elements[k].required=paid;f.elements.note.required=f.elements.state.value==='Devuelto para revisión';};f.elements.state.addEventListener('change',wire);wire();}
async function attachPaymentInvoice(file,p){if(!file?.size)return;if(file.size>5*1024*1024||!['application/pdf','image/png','image/jpeg'].includes(file.type))throw Error('Adjunte un PDF, JPG o PNG de hasta 5 MB.');const q=new URLSearchParams({asada,name:('Factura '+p.invoice+' · '+p.supplier).slice(0,160),category:'Otro documento'});const r=await fetch('/api/profile-upload?'+q,{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file});const d=await r.json();if(!r.ok)throw Error(d.error||'No se pudo adjuntar la factura.');p.documentId=d.document.id;$('#sw-form').elements.documentId.value=d.document.id;$('#sw-form').elements.invoiceFile.value='';}
function paymentReportHTML(rows,name){const total=rows.reduce((n,r)=>n+Math.round(r.payload.amount*100),0)/100,pending=rows.filter(r=>r.payload.state==='Pendiente de aprobación'),pendingTotal=pending.reduce((n,r)=>n+Math.round(r.payload.amount*100),0)/100;const sessions=[...new Set(rows.map(r=>r.payload.session||'Por asignar'))],dates=[...new Set(rows.map(r=>r.payload.sessionDate||'Por asignar'))];return '<header><p>JUNTA DIRECTIVA · '+esc(name)+'</p><h1>Acuerdos de pago para Junta Directiva</h1><p>Sesión: '+esc(sessions.join(', '))+' · Fecha de sesión: '+esc(dates.join(', '))+'</p><p>Preparado el '+esc(new Date().toLocaleDateString('es-CR',{timeZone:'America/Costa_Rica'}))+' · Año de registro: '+year+'</p></header><p>Se presenta la siguiente relación para conocimiento, revisión y aprobación de los pagos pendientes. Los pagos aprobados o realizados se identifican por separado en la columna de estado.</p>'+table(['Fecha','Proveedor','Factura electrónica','Concepto / motivo','Monto ₡','Estado'],rows.map(r=>{const p=r.payload;return [esc(p.date),esc(p.supplier),esc(p.invoice),esc(p.concept),esc(money(p.amount)),esc(p.state)];}))+'<h2>Total de pagos incluidos: '+esc(money(total))+'</h2>'+ (pending.length?'<section><h2>Propuesta de acuerdo — pendiente de aprobación</h2><p>La Junta Directiva acuerda aprobar los pagos identificados como “Pendiente de aprobación” en esta relación, por un total de '+esc(money(pendingTotal))+', y autoriza a la administración a tramitarlos conforme a los procedimientos de la ASADA.</p><p>Acuerdo n.º __________________ · Sesión n.º __________________</p><p>Este texto es una propuesta. Debe ajustarse a lo efectivamente acordado y registrarse en el acta.</p></section>':'')+'<section><h2>Seguimiento y respaldo</h2>'+rows.map(r=>{const p=r.payload;return '<p><strong>'+esc(p.supplier)+' · Factura '+esc(p.invoice)+'</strong><br>Sesión: '+esc(p.session||'Por asignar')+' · Fecha: '+esc(p.sessionDate||'Por asignar')+' · Acuerdo: '+esc(p.agreement||'Sin aprobación registrada')+(p.approvalDate?' · Aprobación: '+esc(p.approvalDate)+' · Registrada por: '+esc(p.approvalBy):'')+(p.paidDate?'<br>Pago: '+esc(p.paidDate)+' · Comprobante: '+esc(p.paymentRef):'')+(p.note?'<br>Observaciones: '+esc(p.note):'')+'<br>Factura adjunta: '+(p.documentId?'Disponible en la plataforma':'No adjuntada')+'</p>';}).join('')+'</section><div class="signatures"><p>Preparado por: __________________________<br>Firma: __________________________</p><p>Revisado por: __________________________<br>Firma: __________________________</p></div><footer>La relación documenta la información registrada. Las facturas adjuntas se descargan desde la plataforma y no se incorporan como páginas de este PDF.</footer>';}
async function printPayments(){const membrete=await window.SWLetterhead.html();const rows=paymentRows().filter(r=>paymentSelection.has(r.id));if(!rows.length)throw Error('Seleccione al menos un pago para el documento.');document.getElementById('sw-payment-frame')?.remove();const frame=document.createElement('iframe');frame.id='sw-payment-frame';frame.title='Relación de pagos para guardar en PDF';frame.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0';frame.onload=()=>{try{frame.contentWindow.focus();frame.contentWindow.print();status('Seleccione Guardar como PDF en la ventana de impresión.');}catch{status('No se pudo abrir la impresión. Intente desde Chrome o Edge.');}};frame.srcdoc='<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>Acuerdos de pago para Junta Directiva</title><style>@page{size:A4 landscape;margin:14mm}body{font:11px Arial;color:#173441;line-height:1.5}header{border-bottom:3px solid #0b7186;padding-bottom:12px}h1{font-size:23px}h2{font-size:15px}table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:18px}th,td{padding:9px;border-bottom:1px solid #d3e2e8;text-align:left;overflow-wrap:anywhere}th{background:#edf5f7}thead{display:table-header-group}tr{break-inside:avoid}section{margin-top:22px;border-top:1px solid #ccd9df;padding-top:10px}.signatures{display:flex;justify-content:space-between;margin-top:30px;break-inside:avoid}footer{margin-top:22px;border-top:1px solid #ccd9df;padding-top:8px;font-size:9px}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>'+membrete+''+paymentReportHTML(rows,asadas.find(a=>a.id===asada)?.name||'ASADA')+'</body></html>';document.body.appendChild(frame);}


let planArea=assemblyLink.get('planArea')==='administracion'?'Administración':'Todas',planState='Abiertas',planPeriod='year',planReference='',planSearch='';
function workplanReference(){
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica'}).format(new Date());
 return planReference.startsWith(year+'-')?planReference:today.startsWith(year+'-')?today:year+'-01-01';
}
function workplanRange(period,reference){
 if(period==='year')return null;
 const date=new Date(reference+'T00:00:00Z'), y=date.getUTCFullYear(),m=date.getUTCMonth(),d=date.getUTCDate();
 const iso=x=>x.toISOString().slice(0,10);
 if(period==='week'){
  const monday=new Date(Date.UTC(y,m,d-(date.getUTCDay()+6)%7));
  const sunday=new Date(monday.getTime()+6*86400000);
  return [iso(monday),iso(sunday)];
 }
 const second=period==='half'&&d>15;
 return [iso(new Date(Date.UTC(y,m,second?16:1))),iso(new Date(Date.UTC(y,m+(period==='month'||second?1:0),period==='half'&&!second?15:0)))];
}
function workplanScope(){
 const reference=workplanReference(),range=workplanRange(planPeriod,reference);
 const rows=items('workplan').filter(({payload:p})=>(planArea==='Todas'||p.area===planArea)&&
  (!range||p.date<=range[1]&&p.due>=range[0])).map(r=>({record:r,state:state(r.payload)}));
 return {reference,range,rows};
}

function workplanResults(rows=workplanScope().rows){
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
 const query=normalize(planSearch.trim());
 const lane={'Vencido':0,'En proceso':1,'Pendiente':2,'Cumplido':3,'Cancelado':4};
 const visible=rows.filter(({record:{payload:p},state:label})=>{
  const matchesState=planState==='Todos'||label===planState||
   planState==='Abiertas'&&!['Cumplido','Cancelado'].includes(label);
  return matchesState&&(!query||normalize([p.title,p.responsible,p.objective].join(' ')).includes(query));
 }).sort((a,b)=>lane[a.state]-lane[b.state]||a.record.payload.due.localeCompare(b.record.payload.due));
 if(!visible.length)return '<p class="sw-plan-empty">'+(rows.length?'No hay actividades que coincidan con los filtros.':'Todavía no hay actividades para esta área y período.')+'</p>';
 return '<p class="sw-plan-count">'+visible.length+(visible.length===1?' actividad':' actividades')+'</p>'+
  visible.map(workplanCard).join('');
}

function workplanCard({record:r,state:label}){
 const p=r.payload,progress=Number(p.progress)||0;
 const tone=label==='Vencido'?'late':label==='Cumplido'?'done':'';
 const open=!['Cumplido','Cancelado'].includes(label);
 const statusLabel=label==='Vencido'&&p.state==='En proceso'?'Vencido · En proceso':label;
 const deadline=new Date(p.due+'T12:00:00Z').toLocaleDateString('es-CR',{timeZone:'America/Costa_Rica',day:'numeric',month:'short',year:'numeric'});
 const details=[
  ['Objetivo',p.objective],['Indicador',p.indicator],['Meta',p.target],['Fecha de inicio',p.date],
  ['Presupuesto estimado',p.budget?money(p.budget):''],['Partida',p.part],['Aprobación',p.approval],
  ['Acuerdo de aprobación',p.agreement],['Fecha de aprobación',p.approvalDate],['Seguimiento',p.note],
 ].filter(([,value])=>value);
 return '<article class="sw-plan-task"><div class="sw-plan-task-top"><div><h3>'+esc(p.title)+'</h3>'+
  '<p class="sw-note">'+esc(p.responsible)+' · '+esc(p.area)+' · Fecha límite: <strong>'+esc(deadline)+'</strong></p></div>'+
  '<span class="sw-board-state '+tone+'">'+esc(statusLabel)+'</span></div>'+
  '<div class="sw-plan-progress"><progress max="100" value="'+progress+'" aria-label="Avance de '+esc(p.title)+'"></progress><span>'+progress+' %</span></div>'+
  (canEdit?'<div class="sw-plan-actions"><button class="sw-btn" type="button" data-edit="'+esc(r.id)+'">Editar</button>'+
   (p.state==='Pendiente'?'<button class="sw-btn" type="button" data-plan-start="'+esc(r.id)+'">Iniciar</button>':'')+
   (open?'<button class="sw-btn primary" type="button" data-calendar-complete="'+esc(r.id)+'">Marcar cumplida</button>':'')+'</div>':'')+
  '<details class="sw-plan-detail"><summary>Ver detalles</summary><dl>'+
  details.map(([key,value])=>'<div><dt>'+esc(key)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>'+
  (canEdit?'<button class="sw-btn" type="button" data-archive="'+esc(r.id)+'">Archivar</button>':'')+'</details>'+
  '<div class="sw-calendar-slot" data-calendar-slot="'+esc(r.id)+'"></div></article>';
}

function workplanView(){
 const {reference,range,rows}=workplanScope();
 const select=(id,label,options,value)=>'<label>'+label+'<select id="'+id+'">'+options.map(([key,name])=>
  '<option value="'+esc(key)+'" '+(value===key?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label>';
 const count=match=>rows.filter(match).length;
 const open=count(r=>!['Cumplido','Cancelado'].includes(r.state));
 const late=count(r=>r.state==='Vencido'),done=count(r=>r.state==='Cumplido');
 const budget=sum(rows.filter(r=>r.state!=='Cancelado').map(r=>r.record.payload.budget));
 const states=[['Abiertas','Por hacer'],['Vencido','Vencidas'],['En proceso','En proceso sin vencer'],['Pendiente','Pendientes sin vencer'],
  ['Cumplido','Cumplidas'],['Cancelado','Canceladas'],['Todos','Todas']];
 return '<section class="sw-panel sw-plan"><div class="sw-plan-task-top"><div><h2>Actividades'+(planArea==='Todas'?'':' de '+esc(planArea))+'</h2>'+
  '<p class="sw-note">'+esc(range?range.join(' al '):'Año '+year)+'</p></div>'+btn('Nueva actividad','workplan')+'</div>'+
  '<div class="sw-stats sw-plan-stats">'+stat('Por hacer',open)+stat('Vencidas',late)+stat('Cumplidas',done)+'</div>'+
  (budget?'<p class="sw-note">Presupuesto estimado del área y período: <strong>'+esc(money(budget))+'</strong></p>':'')+
  '<div class="sw-toolbar sw-plan-filters"><label>Buscar<input id="sw-plan-search" type="search" placeholder="Actividad o responsable" value="'+esc(planSearch)+'"></label>'+
  select('sw-plan-state','Mostrar',states,planState)+
  select('sw-plan-area','Área',['Todas','Junta Directiva','Administración','Operación'].map(x=>[x,x]),planArea)+
  select('sw-plan-period','Período',[['year','Anual'],['week','Semanal'],['half','Quincenal'],['month','Mensual']],planPeriod)+
  (range?'<label>Fecha de referencia<input id="sw-plan-reference" type="date" min="'+year+'-01-01" max="'+year+'-12-31" value="'+esc(reference)+'"></label>':'')+
  '</div><div id="sw-plan-results">'+workplanResults(rows)+'</div></section>';
}

function workplanFields(record){
 const p=record?.payload||{},range=workplanRange(planPeriod,workplanReference());
 const due=p.due||(range?[range[1],year+'-12-31'].sort()[0]:'');
 const dateLimits=' min="'+year+'-01-01" max="'+year+'-12-31"';
 const note='<label class="wide">Seguimiento o referencia de evidencia<textarea name="note" maxlength="1500" rows="3">'+esc(p.note||'')+'</textarea></label>';
 const details=field('objective','Objetivo',p.objective||'','text',false)+
  field('indicator','Indicador',p.indicator||'','text',false).replace('maxlength="500"','maxlength="300"')+
  field('target','Meta',p.target||'','text',false).replace('maxlength="500"','maxlength="300"')+
  field('date','Fecha de inicio',p.date||'','date',false).replace('type="date"','type="date"'+dateLimits)+
  amount('budget','Presupuesto estimado ₡',p.budget||'').replace(' required','')+
  field('part','Partida presupuestaria',p.part||'','text',false).replace('maxlength="500"','maxlength="160"')+
  selectField('approval','Aprobación',['Borrador','Aprobado'],p.approval||'Borrador')+
  field('agreement','Referencia del acuerdo de aprobación',p.agreement||'','text',false).replace('maxlength="500"','maxlength="160"')+
  field('approvalDate','Fecha de aprobación',p.approvalDate||'','date',false)+note;
 return field('title','¿Qué hay que hacer?',p.title||'')+
  field('responsible','¿Quién se encarga?',p.responsible||'').replace('maxlength="500"','maxlength="160"')+
  field('due','Fecha límite',due,'date').replace('type="date"','type="date"'+dateLimits)+
  selectField('area','Área',['Junta Directiva','Administración','Operación'],p.area||(planArea==='Todas'?'Administración':planArea))+
  (record?selectField('state','Estado',['Pendiente','En proceso','Cumplido','Cancelado'],p.state)+
   amount('progress','Avance %',p.progress??0).replace('max="1000000000000"','max="100"'):
   '<input type="hidden" name="state" value="Pendiente">')+
  '<details class="wide sw-plan-optional"><summary>Objetivo, presupuesto y otros detalles</summary><div class="sw-form">'+details+'</div></details>';
}

function wireWorkplanForm(form){
 const {state,progress,approval,agreement,approvalDate}=form.elements;
 const details=approval.closest('details');
 const syncApproval=()=>{
  const approved=approval.value==='Aprobado';
  agreement.required=approvalDate.required=approved;
 };
 syncApproval();
 approval.addEventListener('change',syncApproval);
 details.addEventListener('invalid',()=>{details.open=true;},true);
 if(progress){
  state.addEventListener('change',()=>{
   if(state.value==='Cumplido')progress.value='100';
   else if(Number(progress.value)===100)progress.value='0';
  });
  progress.addEventListener('change',()=>{
   if(Number(progress.value)===100)state.value='Cumplido';
   else if(state.value==='Cumplido')state.value='En proceso';
  });
 }
}

function agreementDetail(r,interactive=true){
 const p=r.payload;
 const fields=[['Número',p.code],['Fecha del acuerdo',p.date],['Estado',state(p)],['Responsable',p.responsible],['Plazo',p.due]];
 return `<div class="sw-board-detail"><dl class="sw-board-meta">${fields.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value||'Sin registrar')}</dd></div>`).join('')}</dl>
 <h3>Texto del acuerdo</h3><p class="sw-board-text">${esc(p.text||'Este acuerdo no tiene texto o resumen registrado.')}</p>
 ${p.note?`<h3>Observaciones</h3><p class="sw-board-text">${esc(p.note)}</p>`:''}
 ${interactive?`<div class="sw-board-actions"><button type="button" class="sw-btn primary" data-agreement-pdf="${esc(r.id)}">Guardar acuerdo en PDF</button>${p.documentId?`<a class="sw-btn" data-agreement-document href="/api/panel-agreement-file?${esc(new URLSearchParams({asada,id:r.id}).toString())}">Descargar acta adjunta</a>`:''}${edit(r)}</div>`:(p.documentId?'<p>Acta adjunta disponible en la plataforma.</p>':'')}</div>`;
}
function agreementView(){
 const rows=boardSearch?.records||items('agreement'),total=boardSearch?boardSearch.total:rows.length;
 const period=boardSearch?(boardSearch.year?'Año '+boardSearch.year:'Todos los años'):'Año '+year;
 return `<section class="sw-board">
 <div class="sw-board-top"><div><h2>Registro de acuerdos</h2><p>Seleccione un acuerdo para leerlo o guardarlo en PDF.</p></div>${btn('Registrar acuerdo','agreement')}</div>
 <form id="sw-agreement-search" class="sw-board-search">
 <label>Buscar acuerdo<input type="search" name="q" maxlength="200" value="${esc(boardQuery)}" placeholder="Número, título o palabra clave"></label>
 <label>Año de búsqueda<input type="number" name="scope" min="1900" max="2200" step="1" placeholder="Todos" value="${esc(boardScope==='current'?year:boardScope==='all'?'':boardScope)}"></label>
 <button class="sw-btn primary" type="submit">Buscar</button><button class="sw-btn" type="button" id="sw-agreement-clear">Restablecer</button>
 <p class="sw-note">Deje el año vacío para buscar en todos los años.</p></form>
 <p class="sw-board-count" tabindex="-1">${total} ${total===1?'acuerdo':'acuerdos'} · ${esc(period)}${boardSearch?.query?' · «'+esc(boardSearch.query)+'»':''}</p>
 <div class="sw-board-list">${rows.map(r=>{const p=r.payload,label=state(p);return `<details class="sw-board-entry"><summary><span class="sw-board-identity"><strong>${esc(p.title)}</strong><small>${esc(p.code)} · ${esc(p.date)}</small></span><span class="sw-board-state ${label==='Vencido'?'late':label==='Cumplido'?'done':''}">${esc(label)}</span><span class="sw-board-toggle"><span>Ver acuerdo</span><span>Cerrar</span></span></summary>${agreementDetail(r)}</details>`;}).join('')||'<p class="sw-board-empty">No hay acuerdos para esta consulta. Pruebe otro año o cambie las palabras de búsqueda.</p>'}</div>
 ${boardSearch&&total>50?`<div class="sw-board-pagination"><span>${boardSearch.offset+1}–${Math.min(total,boardSearch.offset+50)} de ${total}</span><button type="button" class="sw-btn" data-agreement-offset="${Math.max(0,boardSearch.offset-50)}" ${!boardSearch.offset?'disabled':''}>Anterior</button><button type="button" class="sw-btn" data-agreement-offset="${boardSearch.offset+50}" ${boardSearch.offset+50>=total?'disabled':''}>Siguiente</button></div>`:''}
 </section>`;
}
async function searchAgreements(offset=0){
 if(busy||loading||!asada)return;busy=true;lock(true);status('Buscando en los acuerdos de su ASADA…');
 try{boardSearch=await api('panel-agreements?'+new URLSearchParams({asada,year:boardScope==='current'?String(year):boardScope,q:boardQuery,offset:String(offset)}));close();draw();$('.sw-board-count')?.focus();status(boardSearch.total+' acuerdos encontrados. La búsqueda corresponde únicamente a su ASADA.');}catch(e){boardSearch=null;draw();status('No se completó la búsqueda: '+e.message);}finally{busy=false;lock(false);}
}

async function attachProjectFile(file,p,category){
 if(!file||file.size>5*1024*1024||!['application/pdf','image/jpeg','image/png'].includes(file.type))throw Error('Adjunte un PDF, JPG o PNG de hasta 5 MB.');
 if(p.documents.length>=12)throw Error('El proyecto permite hasta 12 archivos. Quite uno antes de agregar otro.');
 const q=new URLSearchParams({asada,name:('Proyecto · '+file.name.replace(/\.[^.]+$/,'')).slice(0,160),category:'Otro documento'});
 const response=await fetch('/api/profile-upload?'+q,{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file}),data=await response.json();
 if(!response.ok)throw Error(data.error||'No se pudo adjuntar el respaldo.');
 p.documents.push({id:data.document.id,name:data.document.filename||file.name,type:file.type,category});
}
async function attachOrderFile(file,p){
 if(!file?.size)return;
 if(file.size>5*1024*1024||!['application/pdf','image/png','image/jpeg'].includes(file.type))throw Error('Adjunte JPG, PNG o PDF de hasta 5 MB.');
 const q=new URLSearchParams({asada,name:('Orden de trabajo · '+p.title).slice(0,160),category:'Evidencia de trabajo'});
 const response=await fetch('/api/profile-upload?'+q,{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file}),data=await response.json();
 if(!response.ok)throw Error(data.error||'No se pudo adjuntar la evidencia.');
 p.documentId=data.document.id;$('#sw-form').elements.documentId.value=data.document.id;$('#sw-form').elements.orderFile.value='';
}
async function attachAgreement(file,p){
 if(!file?.size)return;
 if(file.size>5*1024*1024||!['application/pdf','image/png','image/jpeg'].includes(file.type))throw Error('Adjunte un PDF, JPG o PNG de hasta 5 MB.');
 const q=new URLSearchParams({asada,name:('Acuerdo '+p.code+' · '+p.title).slice(0,160),category:'Acuerdo de Junta Directiva'});
 const r=await fetch('/api/profile-upload?'+q,{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file}),d=await r.json();
 if(!r.ok)throw Error(d.error||'No se pudo adjuntar el respaldo del acta.');
 p.documentId=d.document.id;$('#sw-form').elements.documentId.value=d.document.id;$('#sw-form').elements.agreementFile.value='';
}
async function recordForAction(id){
 let r=records.find(x=>x.id===id)||boardSearch?.records.find(x=>x.id===id);
 if(!r)throw Error('Actualice los registros antes de abrir este acuerdo.');
 if(r.kind==='agreement'&&r.year!==year){year=r.year;$('#sw-year').value=year;await load();r=records.find(x=>x.id===id);if(!r)throw Error('El acuerdo cambió o fue archivado. Actualice la búsqueda.');}
 return r;
}

function practicalHome(){
 const d=SWFinancialHome.build(records,year),val=n=>n===null?'Falta registrar':money(n),date=d.p?.date||'Sin estado financiero',card=(label,value,note,target,editKind='')=>'<article class="sw-simple-card"><span>'+esc(label)+'</span><strong>'+esc(val(value))+'</strong><p>'+esc(note)+'</p><button class="sw-btn" type="button" data-module="'+target+'">Ver detalle</button>'+(canEdit&&editKind?' <button class="sw-btn" type="button" data-new="'+editKind+'">'+(editKind==='settings'?'Registrar saldos':'Completar información')+'</button>':'')+'</article>';
 const cards=card(d.cashSource==='Saldo de caja y bancos registrado'?'Saldo de caja y bancos registrado':'Efectivo según el estado financiero',d.cash,(d.cashDate?'Corte: '+d.cashDate+'. ':'')+d.cashSource+'. '+(d.cashVerified?'Verificado contra bancos.':'Pendiente de verificación contra bancos.'),'cash','settings')+card('Dinero en Hidrantes',d.hydrants,(d.bankDate?'Corte: '+d.bankDate+'. ':'')+(d.bankVerified?'Verificado contra banco.':'Pendiente de verificación contra banco.'),'cash','settings')+card('Dinero en Protección del Recurso Hídrico',d.protection,(d.bankDate?'Corte: '+d.bankDate+'. ':'')+(d.bankVerified?'Verificado contra banco.':'Pendiente de verificación contra banco.'),'cash','settings')+card('¿Cuánto nos deben?',d.receivables,'Cuentas por cobrar · '+date+'. No equivale a efectivo disponible.','statements','statement')+card('¿Cuánto debemos?',d.payables,'Cuentas por pagar · '+date+'. El detalle y vencimientos deben revisarse en sus respaldos.','statements','statement');
 const annualMax=Math.max(1,d.income||0,d.expenses||0),annual=d.p?'<div class="sw-home-bars">'+[['Ingresos',d.income,'income'],['Gastos',d.expenses,'expense']].map(([label,n,c])=>'<button type="button" class="sw-home-bar" data-home-detail="'+c+'" aria-label="'+label+': '+esc(money(n))+'"><span>'+label+'<strong>'+money(n)+'</strong></span><span class="sw-home-track"><i class="'+c+'" style="width:'+n/annualMax*100+'%"></i></span></button>').join('')+'</div>':'<p>Registre el estado financiero para comparar sus ingresos y gastos.</p>';
 const max=Math.max(1,...d.monthly.flatMap(x=>[x.income||0,x.expenses||0])),monthly='<div class="sw-home-months">'+d.monthly.map((x,i)=>'<button type="button" data-home-month="'+i+'" class="sw-home-month" aria-label="'+months[i]+': '+(x.count?'Entradas '+money(x.income)+', pagos '+money(x.expenses):'Sin movimientos registrados')+'"><span class="sw-home-columns">'+(x.count?'<i class="income" style="height:'+Math.max(1,x.income/max*100)+'%"></i><i class="expense" style="height:'+Math.max(1,x.expenses/max*100)+'%"></i>':'<span class="sw-home-missing">—</span>')+'</span><span>'+months[i]+'</span></button>').join('')+'</div>';
 const comment=d.result===null?'Complete el estado financiero para conocer si los ingresos cubren los gastos.':d.result>0?'Los ingresos contables superaron los gastos en '+money(d.result)+'. Antes de comprometer recursos, revise los saldos de bancos y las obligaciones pendientes.':d.result<0?'Los gastos contables superaron los ingresos en '+money(-d.result)+'. Revise con su contador qué explica la diferencia y qué puede ajustarse.':'Los ingresos contables igualaron los gastos del período.';
 return '<section class="sw-panel"><h2>Así están las finanzas de nuestra ASADA</h2><p>Estado financiero: '+esc(date)+' · Año '+year+'. Cada cifra muestra su fuente y fecha.</p></section><div class="sw-simple-grid">'+cards+'</div><section class="sw-panel"><h2>¿Cuánto ingresó y cuánto se gastó?</h2><p class="sw-note">Ingresos y gastos contables del estado financiero al '+esc(date)+'. No equivalen necesariamente a cobros y pagos.</p>'+annual+'<div class="sw-home-result"><span>'+(d.result!==null&&d.result<0?'Déficit del período':'Resultado del período')+'</span><strong>'+esc(val(d.result))+'</strong></div><p id="sw-home-annual-detail" class="sw-note" aria-live="polite">Seleccione una barra para ver su explicación.</p><button class="sw-btn" data-module="statements">Ver estado financiero</button></section><section class="sw-panel"><h2>El movimiento del dinero, mes a mes</h2><div class="sw-legend"><span><b class="sw-dot"></b>Entradas de efectivo</span><span><b class="sw-dot expense"></b>Pagos registrados</span></div>'+monthly+'<p id="sw-home-month-detail" class="sw-note" aria-live="polite">Pase el cursor, enfoque o toque un mes para ver los montos exactos.</p><p class="sw-note">Fuente: Flujo de efectivo y Caja chica, contada una sola vez. Un guion indica ausencia de registros; tener movimientos no confirma que el mes esté completo.</p><button class="sw-btn" data-module="cash">Ver movimientos de efectivo</button></section><section class="sw-panel"><h2>¿Cómo vamos con el presupuesto?</h2><div class="sw-stats">'+stat('Aprobado para gastos e inversiones',val(d.budget),'Fuente: presupuesto registrado')+stat('Pagos registrados',val(d.executed),'Flujo de efectivo y caja chica')+stat('Queda por ejecutar',val(d.remaining),d.percent===null?'Sin información suficiente para calcular un porcentaje':pct(d.percent)+' del presupuesto registrado')+'</div><p class="sw-note">Comparación por pagos, no por gastos contables. No confirma que se hayan registrado todos los movimientos.</p><button class="sw-btn" data-module="budget">Ver presupuesto y partidas</button></section><section class="sw-panel"><h2>Qué nos dicen estos números</h2><p>'+esc(comment)+'</p>'+(!d.p?'<p class="sw-note">Falta un estado financiero completo para este año.</p>':d.balanced===false?'<p class="sw-note">Los activos no coinciden con pasivos más patrimonio. Revise el estado financiero antes de usarlo para decidir.</p>':'')+'<p class="sw-note">Hidrantes y Protección del Recurso Hídrico son saldos identificados por separado. No se suman nuevamente al total de caja y bancos ni se consideran dinero de libre uso.</p></section><details class="sw-panel"><summary>Lo que tiene y debe la ASADA</summary><div class="sw-stats">'+stat('Lo que tiene · Activos',val(d.assets),date)+stat('Obligaciones · Pasivos',val(d.liabilities),date)+stat('Patrimonio',val(d.equity),date)+'</div><button class="sw-btn" data-module="statements">Ver detalle del estado financiero</button></details>';
}
function homeMonthDetail(index){const d=SWFinancialHome.build(records,year),x=d.monthly[index];if(x&&$('#sw-home-month-detail'))$('#sw-home-month-detail').textContent=months[index]+' · '+(x.count?'Entradas: '+money(x.income)+' · Pagos: '+money(x.expenses)+' · Diferencia de efectivo: '+money(x.income-x.expenses)+'. '+x.count+' movimientos registrados.':'Falta registrar movimientos. No se supone que el resultado sea cero.');}
function draw(){
 showBillingLink();
 $('#sw-title').textContent=modules.find(m=>m[0]===module)[1];
 $('.sw-sub').textContent=(asadas.find(a=>a.id===asada)?.name||'Información de su ASADA')+(module==='properties'?' · Consulta en el portal oficial':' · Año '+year+(['board','workplan','calendar','orders','outages','network','monthly','projects'].includes(module)?'':' · Montos en colones'));
 const yearLabel=module==='board'?'Año de trabajo':'Año';
 $('#sw-year').closest('label').hidden=module==='projects';
 $('.sw-footer').textContent=module==='workplan'?'Los cambios del plan se guardan en la nube.':module==='projects'?'Cada proyecto conserva su expediente entre años. Los cambios se guardan en la nube; el PDF reúne el perfil para compartirlo.':'Los cambios confirmados se guardan en la nube. Seleccione el año que desea consultar. El comparativo presupuestario usa entradas y pagos y los estados financieros se registran por separado.';
 $('#sw-year-label').textContent=yearLabel;$('#sw-year').setAttribute('aria-label',yearLabel);
 $('#sw-pdf').hidden=module==='properties'||module==='projects';$('#sw-history').hidden=module==='properties'||module==='projects';
 const t=totals(),d=settings();let h='';
 if(!asada){$('#sw-content').innerHTML='<section class="sw-panel"><h2>Seleccione una ASADA</h2><p>Si aún no existe, regístrela en Administrar accesos.</p><a href="administrar-accesos.html">Administrar accesos</a></section>';return;}
 if(isSummary(module)){
  const switcher='<div class="sw-head sw-summary-views" role="group" aria-label="Vistas del resumen financiero">'+summaryViews.map(([key,label])=>'<button type="button" class="sw-btn'+(key===module?' primary':'')+'" data-summary-view="'+key+'" aria-pressed="'+(key===module)+'">'+label+'</button>').join('')+'</div>';
  h=switcher+(module==='home'?practicalHome():financeSummary());
 }
 if(module==='cash'){h='<div class="sw-head">'+btn('Registrar movimiento','movement')+btn('Configurar saldo inicial','settings')+'</div><div class="sw-stats">'+stat('Saldo inicial del año',money(d.opening))+stat('Movimiento neto del año',money(t.income-t.expense))+stat('Saldo final calculado',money(t.closing))+'</div><section class="sw-panel"><h2>Flujo de efectivo anual</h2><p>Revise de izquierda a derecha cómo entra y sale el dinero de su ASADA. El saldo final de cada mes se convierte en el saldo inicial del siguiente.</p>'+cashTable(tx(),d.opening)+'<p class="sw-note">Montos en colones. Los conceptos se agrupan por partida y descripción registrada. Caja chica se incluye una sola vez en los egresos. Un cero indica que no hay movimientos registrados; confirme que la información del mes esté completa. Compare los saldos calculados con el efectivo y los bancos.</p></section><section class="sw-panel"><h2>Movimientos registrados</h2>'+table(['Fecha','Tipo','Concepto','Partida','Monto','Acciones'],items('movement').map(r=>{const p=r.payload;return[esc(p.date),p.type==='in'?'Entrada':'Salida',esc(p.concept),esc(p.part),money(p.amount),edit(r)];}))+'</section>';}
 if(module==='cash'){
  const tabs='<div class="sw-head sw-summary-views" role="group" aria-label="Vistas del flujo de efectivo">'+[['real','Flujo real'],['projected','Flujo proyectado']].map(([key,label])=>'<button type="button" class="sw-btn'+(key===cashView?' primary':'')+'" data-cash-view="'+key+'" aria-pressed="'+(key===cashView)+'">'+label+'</button>').join('')+'</div>';
  h=tabs+(cashView==='projected'?projectionView():h);
 }

 if(module==='petty'){const pending=sum(values('petty').filter(p=>!p.reimbursed).map(p=>p.amount));h='<div class="sw-head">'+btn('Registrar comprobante','petty')+btn('Configurar fondo autorizado','settings')+'</div><div class="sw-stats">'+stat('Fondo autorizado',money(d.fund))+stat('Pendiente de reintegro',money(pending))+stat('Disponible en el fondo',money(d.fund-pending))+'</div><section class="sw-panel">'+table(['Fecha','Comprobante','Concepto','Responsable','Monto','Reintegro','Acciones'],items('petty').map(r=>{let p=r.payload;return[esc(p.date),esc(p.reference),esc(p.concept),esc(p.responsible),money(p.amount),p.reimbursed?'Reintegrado':'Pendiente','<button class="sw-btn" type="button" data-petty-pdf="'+esc(r.id)+'">Guardar PDF</button> '+edit(r)];}))+'<p class="sw-note">Cada comprobante entra una sola vez en las salidas y en Administración. No lo registre de nuevo en Flujo de caja. Marcarlo reintegrado repone el fondo mediante un traslado interno; no crea otro gasto. El saldo inicial consolidado debe incluir la caja chica.</p></section>';}
 if(module==='budget')h=budgetView();
 if(module==='statements'){const r=items('statement')[0],p=r?.payload;h='<div class="sw-head">'+btn(p?'Editar estado del período':'Registrar estado financiero','statement')+'</div>'+(p?statementAnalysis(p):'')+'<section class="sw-panel" aria-labelledby="sw-compare-title"><h2 id="sw-compare-title">Comparar dos años</h2><p>El año seleccionado arriba es <strong>'+year+'</strong>. Escriba el año con el que quiere compararlo y pulse <strong>Ver comparación</strong>. Ambos deben tener un cierre al 31 de diciembre.</p><div class="sw-head"><label for="sw-base">Comparar '+year+' con el año <input id="sw-base" type="number" min="1900" max="2200" value="'+(base!==year?base:year-1)+'"></label><button type="button" class="sw-btn" id="sw-compare">Ver comparación</button></div><div id="sw-comparison" aria-live="polite"></div></section><section class="sw-panel">'+(p?'<h2>Corte al '+esc(p.date)+'</h2>'+table(['Cuenta','Monto'],statementRows(p).map(([a,n])=>[esc(a),money(n)]))+'<p class="sw-note">'+esc(p.note)+'</p><p>'+financialComment(p)+'</p>':'<p>Registre las cifras de los estados financieros. Este apartado no toma los ingresos contables del flujo de caja.</p>')+'</section>';}
 if(module==='assets'){h='<div class="sw-head">'+btn('Registrar activo','asset')+'</div><div class="sw-stats">'+stat('Activos registrados',String(items('asset').length))+stat('Costo histórico',money(sum(values('asset').map(p=>p.cost))))+stat('Valor en libros',money(sum(values('asset').map(p=>p.cost-p.depreciation))))+'</div><section class="sw-panel">'+table(['Código / activo','Adquisición','Ubicación / responsable','Costo','Depreciación acumulada','Valor en libros','Acciones'],items('asset').map(r=>{const p=r.payload;return[esc(p.code)+' · '+esc(p.name)+'<br>'+esc(p.category)+' · '+esc(p.state),esc(p.date)+'<br>Vida útil: '+p.life+' años',esc(p.location)+'<br>'+esc(p.responsible),money(p.cost),money(p.depreciation),money(p.cost-p.depreciation),edit(r)];}))+'<p class="sw-note">Registre la depreciación acumulada al cierre del período según su auxiliar contable. No se calcula automáticamente. Los activos de cada año son un corte del auxiliar de ese año.</p></section>';}
 if(module==='workplan'){h=workplanView();}
 if(module==='board')h=agreementView();
 if(module==='properties'){
 h=`<section class="sw-panel sw-properties"><h2>Consultar una propiedad antes de tomar una decisión</h2><p>Cuando se revisa una solicitud de agua, una naciente o un terreno de interés para la ASADA, conocer quién figura como propietario ayuda a preparar mejor el expediente.</p><p>Desde aquí puede abrir el portal oficial del Registro Nacional. La consulta se realiza allí, con la cuenta y los permisos que correspondan a la persona que la efectúa.</p><a class="sw-btn primary" href="https://www.rnpdigital.com/shopping/login.jspx" target="_blank" rel="noopener noreferrer">Abrir Registro Nacional ↗</a><p class="sw-note">Se abrirá en otra pestaña; este panel permanecerá disponible para volver.</p></section><div class="sw-panels"><section class="sw-panel"><h2>¿Qué información conviene tener a mano?</h2><ul><li>Número de finca, provincia y derecho, si corresponde.</li><li>Número de plano catastrado, cuando se disponga de él.</li><li>Nombre de quien solicita el servicio y motivo de la revisión.</li></ul><p>Si faltan datos para identificar el inmueble, solicítelos antes de continuar.</p></section><section class="sw-panel"><h2>Cómo realizar la revisión</h2><ol><li>Abra el portal oficial e inicie sesión allí. Si necesita una cuenta, revise las opciones y requisitos del Registro Nacional.</li><li>Busque la consulta de bienes inmuebles e ingrese los datos solicitados.</li><li>Revise el propietario registral y compruebe que la finca corresponde al inmueble de la solicitud.</li><li>Guarde el documento obtenido en el expediente de la ASADA y anote la fecha, quién consultó y qué se verificó.</li></ol></section></div><section class="sw-panel"><h2>Una consulta que respalda el trabajo del equipo</h2><p>La administración puede reunir la información para que la Junta Directiva y el equipo técnico cuenten con un respaldo al revisar el caso. La consulta registral es parte de esa revisión; la decisión sobre el servicio requiere también valorar los demás requisitos aplicables.</p><p class="sw-note">Este apartado facilita el acceso al portal oficial. No consulta ni importa datos automáticamente, ni guarda credenciales del Registro Nacional. Las certificaciones u otros servicios pueden tener un costo indicado en ese portal.</p></section>`;
 }
 if(module==='payments')h=paymentsView();
 if(['orders','calendar','outages','network','monthly'].includes(module))h=operationalView(module);
 if(module==='projects')h=projectView();
 $('#sw-content').innerHTML=h;
}
function statementAnalysis(p){
 const cash=Number(p.cash||0),receivables=Number(p.receivables||0),fixed=Number(p.fixed||0),other=Number(p.other||0),liabilities=Number(p.liabilities||0),equity=Number(p.equity||0),income=Number(p.income||0),expenses=Number(p.expenses||0);
 const assets=cash+receivables+fixed+other,result=income-expenses,difference=assets-liabilities-equity,balanced=Math.abs(difference)<=.02;
 const metric=(label,value,sub,tone='')=>'<div class="sw-insight-metric '+tone+'"><span>'+esc(label)+'</span><strong>'+money(value)+'</strong><small>'+esc(sub)+'</small></div>';
 const bar=(label,value,max,color)=>'<div class="sw-insight-bar"><div class="sw-insight-bar-label"><span>'+esc(label)+'</span><strong>'+money(value)+'</strong></div><div class="sw-insight-track"><span class="'+color+'" style="width:'+Math.max(0,Math.min(100,value/Math.max(1,max)*100))+'%"></span></div></div>';
 const maxResult=Math.max(1,income,expenses),maxPosition=Math.max(1,assets,liabilities,equity);
 const ratio=income>0?'Los gastos representan el '+pct(expenses/income*100)+' de los ingresos registrados.':'Aún no hay ingresos registrados para calcular esta relación.';
 const resultText=result<0?'Los gastos superan los ingresos por '+money(-result)+'. Revise las causas con la administración y el contador.':result>0?'Los ingresos superan los gastos por '+money(result)+'. Verifique el efectivo y los pagos pendientes antes de tomar decisiones.':'Los ingresos y gastos registrados son iguales.';
 return '<section class="sw-panel sw-insight"><div class="sw-insight-heading"><div><span class="sw-insight-eyebrow">ESTADOS FINANCIEROS · '+esc(year)+'</span><h2>Las finanzas de su ASADA, con claridad</h2><p>Cifras registradas al '+esc(p.date)+' · Montos en colones</p></div><span class="sw-insight-status '+(balanced?'ok':'attention')+'">'+(balanced?'Balance cuadrado':'Revisar balance')+'</span></div><div class="sw-insight-metrics">'+metric('Ingresos',income,'Durante el período','income')+metric('Gastos',expenses,'Durante el período','expenses')+metric(result<0?'Déficit':result>0?'Excedente':'Resultado',result,'Ingresos menos gastos',result<0?'negative':'result')+metric('Efectivo',cash,'Saldo al corte','cash')+'</div><div class="sw-insight-charts"><div class="sw-insight-chart"><h3>Ingresos y gastos</h3><p>Compare el resultado contable del período.</p>'+bar('Ingresos',income,maxResult,'income')+bar('Gastos',expenses,maxResult,'expenses')+'</div><div class="sw-insight-chart"><h3>Situación financiera</h3><p>Activos, deudas y patrimonio al corte.</p>'+bar('Activos',assets,maxPosition,'income')+bar('Pasivos',liabilities,maxPosition,'expenses')+bar('Patrimonio',equity,maxPosition,'equity')+'</div></div><div class="sw-insight-reading"><h3>Qué nos dicen estos números</h3>'+(balanced?'':'<p class="sw-insight-alert"><strong>El balance necesita revisión.</strong> Activos y pasivos más patrimonio difieren en '+money(Math.abs(difference))+'. Compruebe las cifras antes de presentar el informe.</p>')+'<div class="sw-insight-points"><p>'+esc(resultText)+'</p><p>'+esc(ratio)+'</p>'+(receivables>0?'<p>Hay '+money(receivables)+' por cobrar. Este monto todavía no es dinero disponible.</p>':'')+'</div></div><p class="sw-insight-foot">El análisis se basa en el estado registrado. Los ingresos y gastos contables pueden diferir de los cobros y pagos del flujo de efectivo.</p></section>';
}
function selectField(name,label,choices,value){return '<label>'+esc(label)+'<select name="'+name+'">'+choices.map(x=>'<option value="'+esc(x)+'" '+(x===value?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label>';}
function pointField(value=''){return '<label>Punto relacionado<select name="pointId"><option value="">Sin punto asignado</option>'+items('service_point').map(r=>'<option value="'+esc(r.id)+'" '+(r.id===value?'selected':'')+'>'+esc(r.payload.name+' · '+r.payload.sector)+'</option>').join('')+'</select></label>';}
function pointName(id){return items('service_point').find(r=>r.id===id)?.payload.name||'Sin punto asociado';}

const projectStates=['Idea','En estudio','Listo para financiar','En ejecución','Finalizado'];
function projectDocumentLink(r,d){return '<a href="/api/panel-project-file?asada='+encodeURIComponent(asada)+'&id='+encodeURIComponent(r.id)+'&document='+encodeURIComponent(d.id)+'">'+esc(d.category)+' · '+esc(d.name)+' ↓</a>';}
function projectProfile(r,forPrint=false){
 const p=r.payload,sections=[['Problema que se busca resolver',p.problem],['Solución propuesta',p.solution],['Alcance y actividades',p.scope],['Beneficio esperado',p.benefit],['Respaldo técnico',p.technical],['Acuerdo de Junta Directiva',p.agreement],['Permisos y gestiones',p.permits],['Fuente de financiamiento',p.funding],['Observaciones y próximos pasos',p.notes]];
 const meta=[['Tipo',p.type],['Sector',p.sector],['Estado',p.state],['Prioridad',p.priority],['Avance',Number(p.progress||0)+' %'],['Responsable',p.responsible||'Por definir'],['Inicio',p.start||'Por definir'],['Meta',p.target||'Por definir'],['Presupuesto estimado',money(p.budget)],['Financiamiento confirmado',money(p.secured)],['Pendiente de financiar',money(Math.max(0,p.budget-p.secured))]];
 return '<div class="sw-project-profile"><h2>'+esc(p.title)+'</h2><p>Perfil del proyecto · '+esc(asadas.find(a=>a.id===asada)?.name||'ASADA')+' · Iniciado en '+esc(r.year)+'</p><dl>'+meta.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>'+sections.filter(([,v])=>v).map(([k,v])=>'<section><h3>'+esc(k)+'</h3><p>'+esc(v)+'</p></section>').join('')+'<section><h3>Documentos de respaldo</h3>'+(p.documents?.length?'<ul>'+p.documents.map(d=>'<li>'+esc(d.category)+' · '+esc(d.name)+'</li>').join('')+'</ul>':'<p>Sin documentos adjuntos.</p>')+'</section>'+(forPrint?'<p class="sw-note">Las estimaciones y el estado reflejan la información registrada en la plataforma; los respaldos se consultan en el expediente digital.</p>':'')+'</div>';
}
function projectView(){
 const projects=items('project').slice().sort((a,b)=>(projectStates.indexOf(b.payload.state)-projectStates.indexOf(a.payload.state))||b.updated_at.localeCompare(a.updated_at));
 const count=state=>projects.filter(r=>r.payload.state===state).length;
 return '<div class="sw-project-intro"><h2>Portafolio de proyectos</h2><p>De un estudio o una necesidad del acueducto a un perfil claro para la Junta y posibles fuentes de financiamiento.</p><p><a style="color:#fff;text-decoration:underline" href="/estudio-tecnico.html?asada='+encodeURIComponent(asada)+'&volverArea=junta">Consultar y vincular estudios técnicos →</a></p>'+(canEdit?'<button type="button" class="sw-btn" data-new="project">+ Crear proyecto</button>':'')+'</div><div class="sw-op-stats">'+stat('Proyectos',projects.length)+stat('En estudio',count('En estudio'))+stat('En ejecución',count('En ejecución'))+'</div>'+(projects.length?'<div class="sw-project-grid">'+projects.map(r=>{const p=r.payload;return '<article class="sw-panel sw-project-card"><div><span class="sw-project-kicker">'+esc(p.type)+' · '+esc(p.sector)+'</span><h3>'+esc(p.title)+'</h3></div><div class="sw-project-meta"><span>'+esc(p.state)+'</span><span>Iniciado '+esc(r.year)+'</span><span>'+Number(p.progress||0)+' % de avance</span></div><div class="sw-project-progress" role="progressbar" aria-label="Avance de '+esc(p.title)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Number(p.progress||0)+'"><span style="width:'+Number(p.progress||0)+'%"></span></div><p>'+esc(p.problem)+'</p><p><strong>Presupuesto estimado:</strong> '+money(p.budget)+' · <strong>Por financiar:</strong> '+money(Math.max(0,p.budget-p.secured))+'</p><details class="sw-project-detail"><summary>Ver perfil y respaldos</summary>'+projectProfile(r)+'<div class="sw-project-docs">'+(p.documents||[]).map(d=>projectDocumentLink(r,d)).join('')+'</div></details><div class="sw-op-actions"><button class="sw-btn" type="button" data-project-pdf="'+esc(r.id)+'">Descargar perfil en PDF</button>'+(canEdit?'<button class="sw-btn" type="button" data-edit="'+esc(r.id)+'">Editar</button><button class="sw-btn" type="button" data-archive="'+esc(r.id)+'">Archivar</button>':'')+'</div></article>';}).join('')+'</div>':'<section class="sw-panel"><h2>Su portafolio comienza aquí</h2><p>Registre el primer proyecto, por ejemplo un tanque, una renovación de tubería o macromedidores. Puede iniciar con una idea y completar el perfil conforme avance el estudio.</p></section>');
}
function operationalView(view){
 const points=items('service_point'),orders=items('service_order'),outages=items('service_outage'),deadlines=items('deadline'),now=new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'});
 const action=r=>canEdit?'<button class="sw-btn" type="button" data-edit="'+esc(r.id)+'">Editar</button> '+(canEdit?'<button class="sw-btn" type="button" data-archive="'+esc(r.id)+'">Archivar</button>':''):'';
 const intro=(title,lead,kind,label)=>'<div class="sw-op-header"><div><h2>'+title+'</h2><p>'+lead+'</p></div>'+(canEdit?'<button type="button" class="sw-btn primary" data-new="'+kind+'">'+esc(label)+'</button>':'')+'</div>';
 if(view==='orders')return intro('Órdenes de trabajo','Asigne labores y dé seguimiento hasta su cierre. Cada orden puede vincularse con un punto del acueducto.','service_order','Nueva orden')+'<div class="sw-op-stats">'+stat('Pendientes',String(orders.filter(r=>r.payload.state==='Pendiente').length))+stat('En proceso',String(orders.filter(r=>r.payload.state==='En proceso').length))+stat('Terminadas',String(orders.filter(r=>r.payload.state==='Terminada').length))+'</div>'+(!orders.length?'<section class="sw-panel"><p>Aún no hay órdenes registradas este año.</p></section>':orders.slice().sort((a,b)=>a.payload.state.localeCompare(b.payload.state)||a.payload.due.localeCompare(b.payload.due)).map(r=>{const p=r.payload;return '<article class="sw-panel sw-op-card"><div class="sw-op-card-head"><div><small>'+esc(p.priority)+' · '+esc(p.sector)+'</small><h3>'+esc(p.title)+'</h3></div><span class="sw-op-pill '+(p.state==='Terminada'?'done':'')+'">'+esc(p.state)+'</span></div><p>Responsable: <strong>'+esc(p.responsible)+'</strong> · Fecha prevista: '+esc(p.due)+'</p><p>Punto: '+esc(pointName(p.pointId))+'</p>'+(p.description?'<p>'+esc(p.description)+'</p>':'')+(p.resolution?'<p><strong>Resultado:</strong> '+esc(p.resolution)+'</p>':'')+(p.documentId?'<a href="/api/panel-order-file?asada='+encodeURIComponent(asada)+'&year='+year+'&id='+encodeURIComponent(r.id)+'">Descargar evidencia ↗</a>':'')+'<div class="sw-op-actions">'+(canCompleteOrders&&p.state!=='Terminada'?'<button class="sw-btn primary" type="button" data-complete="'+esc(r.id)+'">✓ Trabajo listo</button> ':'')+action(r)+'</div><div data-completion-slot="'+esc(r.id)+'"></div></article>';}).join(''));
 if(view==='calendar'){
  const entries=[
   ...deadlines.map(r=>({r,date:r.payload.date,title:r.payload.title,subtitle:r.payload.category+' · '+r.payload.responsible,state:r.payload.state,source:'Fecha propia'})),
   ...items('workplan').map(r=>({r,date:r.payload.due,title:r.payload.title,subtitle:'Plan de trabajo · '+r.payload.responsible,state:r.payload.state,source:'Actividad del plan'})),
   ...items('agreement').map(r=>({r,date:r.payload.due,title:r.payload.title,subtitle:'Acuerdo de Junta · '+r.payload.responsible,state:r.payload.state,source:'Acuerdo de Junta'}))
  ].filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date));
  const open=x=>!['Cumplido','Cancelado'].includes(x.state);
  return intro('Calendario de obligaciones','Abra cada compromiso, actualice sus datos o márquelo cumplido. Los acuerdos y actividades se actualizan en su registro original.','deadline','Agregar fecha')+
   '<div class="sw-op-stats">'+stat('Por atender',String(entries.filter(open).length))+stat('Vencidas',String(entries.filter(x=>x.date<now&&open(x)).length))+stat('Cumplidas',String(entries.filter(x=>x.state==='Cumplido').length))+'</div>'+
   '<section class="sw-panel sw-calendar-panel"><h3>Compromisos de '+year+'</h3><p class="sw-note">Las fechas propias se agregan aquí. Los acuerdos y planes aparecen automáticamente cuando tienen fecha límite.</p>'+
   (entries.length?'<div class="sw-op-list">'+entries.map(x=>{
    const late=x.date<now&&open(x),p=x.r.payload;
    return '<div class="sw-op-list-row sw-calendar-row"><time datetime="'+esc(x.date)+'">'+esc(x.date)+'</time><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.source)+' · '+esc(x.subtitle)+'</small>'+(p.note?'<small>Seguimiento: '+esc(p.note)+'</small>':'')+'</div><span class="sw-op-pill '+(late?'late':x.state==='Cumplido'?'done':'')+'">'+esc(late?'Vencida':x.state)+'</span><div class="sw-calendar-actions">'+(canEdit?'<button class="sw-btn" type="button" data-edit="'+esc(x.r.id)+'">Abrir y editar</button>':'')+(canEdit&&open(x)?'<button class="sw-btn primary" type="button" data-calendar-complete="'+esc(x.r.id)+'">✓ Marcar como cumplido</button>':'')+'</div><div class="sw-calendar-slot" data-calendar-slot="'+esc(x.r.id)+'"></div></div>';
   }).join('')+'</div>':'<p>Aún no hay compromisos con fecha límite para este año.</p>')+'</section>';
 }
 if(view==='outages')return intro('Interrupciones del servicio','La administración registra el corte; Operación confirma el restablecimiento desde el campo.','service_outage','Registrar interrupción')+'<div class="sw-op-stats">'+stat('Registradas',String(outages.length))+stat('En curso',String(outages.filter(r=>r.payload.state==='En curso').length))+stat('Abonados afectados (suma)',String(sum(outages.map(r=>r.payload.affected))))+'</div>'+(outages.length?outages.slice().sort((a,b)=>b.payload.date.localeCompare(a.payload.date)).map(r=>{const p=r.payload;return '<article class="sw-panel sw-op-card"><div class="sw-op-card-head"><div><small>'+esc(p.date+' · '+p.time+' · '+p.sector)+'</small><h3>'+esc(p.cause)+'</h3></div><span class="sw-op-pill '+(p.state==='Restablecido'?'done':'')+'">'+esc(p.state)+'</span></div><p>'+esc(p.affected)+' abonados afectados · Punto: '+esc(pointName(p.pointId))+'</p>'+(p.state==='Restablecido'&&p.endDate?'<p>Servicio restablecido: '+esc(p.endDate+' '+p.endTime)+'</p>':'')+(p.notice?'<p>Comunicación: '+esc(p.notice)+'</p>':'')+(p.restorationNote?'<p><strong>Restablecimiento:</strong> '+esc(p.restorationNote)+'</p>':'')+(p.documentId?'<a href="/api/panel-outage-file?asada='+encodeURIComponent(asada)+'&year='+year+'&id='+encodeURIComponent(r.id)+'">Descargar evidencia ↗</a>':'')+'<div class="sw-op-actions">'+(canRestoreOutages&&p.state==='En curso'?'<button class="sw-btn primary" type="button" data-restore="'+esc(r.id)+'">✓ Servicio restablecido</button> ':'')+(canRestoreOutages&&p.state==='Restablecido'?'<button class="sw-btn" type="button" data-restore-evidence="'+esc(r.id)+'">'+(p.documentId?'Actualizar evidencia':'Agregar evidencia')+'</button> ':'')+action(r)+'</div><div data-restoration-slot="'+esc(r.id)+'"></div></article>';}).join(''):'<section class="sw-panel"><p>Aún no hay interrupciones registradas este año.</p></section>');
 if(view==='network'){
  const p=points[0]?.payload;return intro('Mapa del acueducto','Registre puntos con coordenadas y relaciónelos con órdenes e interrupciones.','service_point','Agregar punto')+'<section class="sw-panel"><h3>Ubicación de la infraestructura</h3>'+(p?'<div class="sw-op-map"><iframe id="sw-map-frame" title="Ubicación de '+esc(p.name)+' en OpenStreetMap" loading="lazy" referrerpolicy="no-referrer" src="'+mapURL(p)+'"></iframe></div><p id="sw-map-name"><strong>'+esc(p.name)+'</strong> · '+esc(p.sector)+'</p>':'<p>Agregue un punto para visualizar su ubicación en el mapa.</p>')+'<p class="sw-note">Las coordenadas deben verificarse en campo. El mapa se muestra con OpenStreetMap.</p></section><div class="sw-op-point-grid">'+points.map(r=>{const x=r.payload;return '<article class="sw-panel sw-op-card"><small>'+esc(x.type+' · '+x.sector)+'</small><h3>'+esc(x.name)+'</h3><p>'+esc(x.latitude+', '+x.longitude)+'</p><p>'+esc(x.note)+'</p><button class="sw-btn" data-point-map="'+esc(r.id)+'">Ver en mapa</button> '+action(r)+'</article>';}).join('')+'</div>';
 }
 const month=String(reportingMonth).padStart(2,'0'),prefix=year+'-'+month,match=p=>p.date?.startsWith(prefix),monthOrders=orders.filter(r=>match(r.payload)),monthOutages=outages.filter(r=>match(r.payload)),monthDeadlines=deadlines.filter(r=>match(r.payload)),cash=tx().filter(match),incoming=sum(cash.filter(x=>x.type==='in').map(x=>x.amount)),outgoing=sum(cash.filter(x=>x.type==='out').map(x=>x.amount));
 return '<section class="sw-panel sw-op-report"><h2>Informe mensual para la Junta Directiva</h2><p>Seleccione el mes y genere una lectura de los datos que ya están registrados. Revise el contenido antes de guardarlo en PDF.</p><div class="sw-op-controls"><label>Mes<select id="sw-month-select">'+months.map((name,i)=>'<option value="'+(i+1)+'" '+(reportingMonth===i+1?'selected':'')+'>'+name+'</option>').join('')+'</select></label><button type="button" class="sw-btn primary" id="sw-month-load">Generar informe</button></div></section>'+(monthlyExtra?.month===reportingMonth?'<section class="sw-panel sw-op-report"><p class="sw-insight-eyebrow">ASADA · '+esc(months[reportingMonth-1].toUpperCase())+' '+year+'</p><h2>Resumen de gestión</h2><div class="sw-op-stats">'+stat('Entradas de efectivo',money(incoming))+stat('Salidas de efectivo',money(outgoing))+stat('Saldo de movimientos',money(incoming-outgoing))+'</div><p class="sw-note">Movimientos del flujo de efectivo y caja chica registrados en el mes; no equivalen al resultado contable.</p><h3>Servicio y operación</h3><p>Órdenes abiertas este mes: <strong>'+monthOrders.length+'</strong> · Terminadas: <strong>'+monthOrders.filter(r=>r.payload.state==='Terminada').length+'</strong> · Interrupciones registradas: <strong>'+monthOutages.length+'</strong>.</p><p>Mediciones de cloro registradas: <strong>'+monthlyExtra.waterMeasurements+'</strong> · Labores de bitácora: <strong>'+monthlyExtra.operationalLogs+'</strong>.</p><h3>Fechas y asuntos para seguimiento</h3><p>'+monthDeadlines.filter(r=>r.payload.state!=='Cumplido').length+' fechas registradas en el mes siguen pendientes. '+orders.filter(r=>r.payload.state!=='Terminada'&&r.payload.due<=prefix+'-31').length+' órdenes con fecha prevista hasta este mes aún no están terminadas.</p><p class="sw-note">Los indicadores reflejan solamente registros ingresados. La morosidad se consulta en Seguimiento de morosidad; este informe no suma cifras de ese módulo.</p>'+(monthlyExtra.limited?'<p class="sw-note">Hay más de 1000 registros operativos; consulte la bitácora para el detalle completo.</p>':'')+'</section>':'<section class="sw-panel"><p>Pulse <strong>Generar informe</strong> para incluir las mediciones y labores del mes.</p></section>');
}
function showCalendarCompletion(id){
 const r=records.find(x=>x.id===id);
 if(!canEdit||!r||!['deadline','workplan','agreement'].includes(r.kind)||['Cumplido','Cancelado'].includes(r.payload.state))return;
 root.querySelectorAll('.sw-calendar-slot').forEach(x=>x.innerHTML='');
 const slot=root.querySelector('[data-calendar-slot="'+id+'"]');if(!slot)return;
 slot.innerHTML='<form class="sw-op-complete" data-calendar-id="'+esc(id)+'"><h4>'+(module==='workplan'?'Marcar actividad cumplida':'Confirmar compromiso cumplido')+'</h4><p>Se actualizará el registro original de '+(r.kind==='deadline'?'esta fecha':r.kind==='workplan'?'esta actividad':'este acuerdo')+'. El cambio quedará en el historial.</p><label>Observación de cierre (opcional)<textarea name="closure" maxlength="500" rows="3" placeholder="¿Qué se realizó? Puede indicar la evidencia o el número de acta."></textarea></label><div class="sw-op-actions"><button type="submit" class="sw-btn primary">Confirmar cumplimiento</button><button type="button" class="sw-btn" data-calendar-cancel>Cancelar</button></div><p class="sw-op-complete-error" role="alert"></p></form>';
 slot.querySelector('textarea').focus();
}
async function completeCalendar(form){
 const r=records.find(x=>x.id===form.dataset.calendarId);
 if(!canEdit||!r||!['deadline','workplan','agreement'].includes(r.kind)||['Cumplido','Cancelado'].includes(r.payload.state))throw Error('Actualice el calendario antes de continuar.');
 const closure=form.elements.closure.value.trim(),limit=r.kind==='deadline'?1000:1500;
 const note=[r.payload.note||'',closure?new Date().toLocaleDateString('es-CR',{timeZone:'America/Costa_Rica'})+' · '+closure:''].filter(Boolean).join('\n');
 if(note.length>limit)throw Error('La observación es demasiado extensa. Edite el registro para resumir el seguimiento.');
 const payload={...r.payload,state:'Cumplido',note,...(r.kind==='workplan'?{progress:100}:{})};
 await save(r.kind,payload,r);
}
function showOrderCompletion(id){
 const r=items('service_order').find(x=>x.id===id);
 if(!canCompleteOrders||!r||r.payload.state==='Terminada')return;
 root.querySelectorAll('.sw-op-complete').forEach(x=>x.remove());
 const slot=root.querySelector('[data-completion-slot="'+id+'"]');
 if(!slot)return;
 slot.innerHTML='<form class="sw-op-complete" data-order-id="'+esc(id)+'"><h4>Confirmar trabajo terminado</h4><p>La información asignada por administración queda protegida. Agregue la fotografía del trabajo realizado para cerrar esta orden.</p><label>Fotografía del trabajo (JPG o PNG, máximo 5 MB)<input type="file" name="photo" accept="image/jpeg,image/png" required></label><label>Nota del trabajo realizado (opcional)<textarea name="resolution" rows="3" maxlength="1500" placeholder="Por ejemplo: medidor instalado y probado."></textarea></label><div class="sw-op-actions"><button type="submit" class="sw-btn primary">Confirmar trabajo listo</button><button type="button" class="sw-btn" data-cancel-complete>Cancelar</button></div><p class="sw-op-complete-error" role="alert"></p></form>';
 slot.querySelector('input').focus();
}
async function submitOrderCompletion(form){
 const r=items('service_order').find(x=>x.id===form.dataset.orderId);
 if(!canCompleteOrders||!r||r.payload.state==='Terminada')throw Error('Actualice la lista de órdenes antes de continuar.');
 const file=form.elements.photo.files[0],note=form.elements.resolution.value.trim();
 if(!file||file.size>5*1024*1024||!['image/jpeg','image/png'].includes(file.type))throw Error('Agregue una fotografía JPG o PNG de hasta 5 MB.');
 busy=true;lock(true);form.querySelectorAll('button,input,textarea').forEach(x=>x.disabled=true);
 try{
  status('Subiendo la fotografía y cerrando la orden…');
  const q=new URLSearchParams({asada,name:('Orden de trabajo · '+r.payload.title).slice(0,160),category:'Evidencia de trabajo'});
  const response=await fetch('/api/profile-upload?'+q,{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file});
  const uploaded=await response.json();
  if(!response.ok)throw Error(uploaded.error||'No se pudo guardar la fotografía.');
  await api('panel-order-complete',{asada,year,id:r.id,version:r.version,documentId:uploaded.document.id,resolution:note});
  busy=false;await load();status('Trabajo marcado como terminado. La fotografía quedó adjunta a la orden.');
 }catch(e){
  const error=form.querySelector('.sw-op-complete-error');if(error)error.textContent=e.message;status(e.message);
 }finally{busy=false;lock(false);form.querySelectorAll('button,input,textarea').forEach(x=>x.disabled=false);}
}
function showOutageRestoration(id,evidence=false){
 const r=items('service_outage').find(x=>x.id===id);
 if(!canRestoreOutages||!r||r.payload.state!==(evidence?'Restablecido':'En curso'))return;
 root.querySelectorAll('.sw-op-complete').forEach(x=>x.remove());
 const slot=root.querySelector('[data-restoration-slot="'+id+'"]');
 if(!slot)return;
 slot.innerHTML='<form class="sw-op-complete" data-outage-id="'+esc(id)+'" data-evidence="'+(evidence?'true':'false')+'"><h4>'+(evidence?'Agregar evidencia del restablecimiento':'Confirmar servicio restablecido')+'</h4><p>'+(evidence?'El servicio ya figura como restablecido. Adjunte una foto o una nota sin modificar la fecha, causa ni sector.':'Se guardarán automáticamente la fecha y hora de Costa Rica. Los datos registrados por administración quedarán intactos.')+'</p><label>Fotografía de respaldo ('+(evidence?'JPG o PNG, hasta 5 MB':'opcional; JPG o PNG, hasta 5 MB')+')<input type="file" name="photo" accept="image/jpeg,image/png"></label><label>Nota del restablecimiento (opcional)<textarea name="note" rows="3" maxlength="500" placeholder="Por ejemplo: tubería reparada y servicio normalizado.">'+esc(evidence?r.payload.restorationNote||'':'')+'</textarea></label><div class="sw-op-actions"><button type="submit" class="sw-btn primary">'+(evidence?'Guardar evidencia':'Confirmar restablecimiento')+'</button><button type="button" class="sw-btn" data-cancel-restore>Cancelar</button></div><p class="sw-op-complete-error" role="alert"></p></form>';
 slot.querySelector('input').focus();
}
async function submitOutageRestoration(form){
 const r=items('service_outage').find(x=>x.id===form.dataset.outageId),evidence=form.dataset.evidence==='true';
 if(!canRestoreOutages||!r||r.payload.state!==(evidence?'Restablecido':'En curso'))throw Error('Actualice las interrupciones antes de continuar.');
 const file=form.elements.photo.files[0],note=form.elements.note.value.trim();
 if(file&&(file.size>5*1024*1024||!['image/jpeg','image/png'].includes(file.type)))throw Error('Adjunte una fotografía JPG o PNG de hasta 5 MB.');
 if(evidence&&!file&&!note)throw Error('Agregue una fotografía o una nota breve.');
 busy=true;lock(true);form.querySelectorAll('button,input,textarea').forEach(x=>x.disabled=true);
 try{
  status(evidence?'Guardando la evidencia…':'Confirmando el restablecimiento…');
  let documentId='';
  if(file){
   const q=new URLSearchParams({asada,name:('Interrupción · '+r.payload.sector).slice(0,160),category:'Evidencia de trabajo'});
   const response=await fetch('/api/profile-upload?'+q,{method:'POST',credentials:'same-origin',headers:{'Content-Type':file.type},body:file});
   const uploaded=await response.json();
   if(!response.ok)throw Error(uploaded.error||'No se pudo guardar la fotografía.');
   documentId=uploaded.document.id;
  }
  await api(evidence?'panel-outage-evidence':'panel-outage-restore',{asada,year,id:r.id,version:r.version,documentId,note});
  busy=false;await load();status(evidence?'Evidencia adjunta al restablecimiento.':'Servicio restablecido. Se guardó la hora de confirmación.');
 }catch(e){const error=form.querySelector('.sw-op-complete-error');if(error)error.textContent=e.message;status(e.message);}
 finally{busy=false;lock(false);form.querySelectorAll('button,input,textarea').forEach(x=>x.disabled=false);}
}
function mapURL(p){const lat=Number(p.latitude),lon=Number(p.longitude),d=.012;return 'https://www.openstreetmap.org/export/embed.html?bbox='+encodeURIComponent([lon-d,lat-d,lon+d,lat+d].join(','))+'&marker='+encodeURIComponent(lat+','+lon);}
function showPointMap(id){const r=items('service_point').find(x=>x.id===id),frame=$('#sw-map-frame');if(!r||!frame)return;frame.src=mapURL(r.payload);frame.title='Ubicación de '+r.payload.name+' en OpenStreetMap';$('#sw-map-name').innerHTML='<strong>'+esc(r.payload.name)+'</strong> · '+esc(r.payload.sector);frame.scrollIntoView({behavior:'smooth',block:'center'});}
async function loadMonthly(){monthlyExtra=null;status('Preparando el informe mensual…');const data=await api(endpoint('panel-monthly')+'&month='+reportingMonth);if(data.month!==reportingMonth)return;monthlyExtra=data;draw();status('Informe mensual preparado con los registros disponibles.');}
function statementRows(p){return [['Efectivo y equivalentes',p.cash],['Cuentas por cobrar',p.receivables],['Activos fijos netos',p.fixed],['Otros activos',p.other],['Total de activos',p.cash+p.receivables+p.fixed+p.other],['Total de pasivos',p.liabilities],['Cuentas por pagar (incluidas en pasivos)',p.payables],['Patrimonio',p.equity],['Ingresos contables',p.income],['Gastos contables',p.expenses],['Resultado del período',p.income-p.expenses]];}
function financialComment(p){
 const a=p.cash+p.receivables+p.fixed+p.other,r=p.income-p.expenses;
 if(Math.abs(a-p.liabilities-p.equity)>.02)return 'Pendiente de revisión: el total de activos no coincide con pasivos más patrimonio. Revise el balance antes de interpretar este corte.';
 const result=r===0?'Los ingresos y los gastos contables fueron iguales.':r>0?'Los ingresos superaron los gastos. El excedente contable fue de '+money(r)+'.':'Los gastos superaron los ingresos. El déficit contable fue de '+money(-r)+'.';
 return 'Al '+esc(p.date)+': '+result+' El resultado contable puede ser distinto del dinero disponible. Se reportan '+money(p.cash)+' en efectivo y '+money(p.receivables)+' por cobrar. La Junta debería revisar qué cobros están vencidos, qué pagos se acercan y cuánto efectivo está reservado para fines específicos.';
}

async function compare(){
 const selected=Number($('#sw-base').value),target=$('#sw-comparison');
 const years=[year,selected].sort((a,b)=>a-b);
 if(years.some(y=>!Number.isInteger(y)||y<1900||y>2200)||new Set(years).size!==years.length){target.textContent='Escriba un año válido y distinto de '+year+'.';return;}
 base=selected;const selectedAsada=asada;target.textContent='Buscando los cierres anuales…';
 const states=await Promise.all(years.map(async y=>y===year?values('statement')[0]:(await api(endpoint('panel-data',y))).records.find(x=>x.kind==='statement')?.payload));
 if(target!==$('#sw-comparison')||selectedAsada!==asada)return;
 const missing=years.filter((y,i)=>states[i]?.date!==y+'-12-31');if(missing.length){target.textContent='No hay un cierre al 31 de diciembre para '+missing.join(' y ')+'. Registre ese cierre o elija otro año.';return;}
 const discrepancies=states.flatMap((p,i)=>{
  const assets=p.cash+p.receivables+p.fixed+p.other,total=p.liabilities+p.equity;
  const difference=Math.round((assets-total)*100)/100;
  return Math.abs(difference)>.02?[{year:years[i],assets,total,difference}]:[];
 });
 const warning=discrepancies.length?'<aside class="sw-note" role="status"><p><strong>Comparación preliminar: hay cierres que no cuadran.</strong> Los montos y porcentajes se calculan con las cifras registradas. Úselos para revisar los datos antes de presentar el informe.</p><ul>'+discrepancies.map(d=>'<li><strong>'+d.year+':</strong> activos '+money(d.assets)+'; pasivos más patrimonio '+money(d.total)+'. Los activos son '+money(Math.abs(d.difference))+' '+(d.difference>0?'mayores':'menores')+'.</li>').join('')+'</ul></aside>':'';
 const rows=states.map(statementRows);
 const max=Math.max(1,...states.flatMap(p=>[p.income,p.expenses]));
 const chart='<h3>Ingresos y gastos por año</h3>'+states.map((p,i)=>'<p><strong>'+years[i]+'</strong> · Ingresos '+money(p.income)+'<br><meter aria-label="Ingresos '+years[i]+'" min="0" max="'+max+'" value="'+p.income+'"></meter><br>Gastos '+money(p.expenses)+'<br><meter aria-label="Gastos '+years[i]+'" min="0" max="'+max+'" value="'+p.expenses+'"></meter></p>').join('');
 target.innerHTML='<h2>Comparativo de cierres anuales</h2>'+warning+table(['Cuenta',...years.flatMap((y,i)=>i?[y,'Cambio ₡','Cambio %']:[y])],rows[0].map(([label],i)=>[esc(label),...rows.flatMap((r,j)=>{const v=r[i][1],old=rows[j-1]?.[i][1];return j?[money(v),money(v-old),old?pct((v-old)/Math.abs(old)*100):'No aplica']:[money(v)];})]))+chart+states.map((p,i)=>'<p><strong>'+years[i]+':</strong> '+financialComment(p)+'</p>').join('');
}

function lock(on){['#sw-year','#sw-asada','#sw-reload','#sw-export','#sw-pdf','#sw-history'].forEach(q=>$(q).disabled=on);}
function showBillingLink(){
 const entry=$('#sw-billing-entry'),link=$('#sw-billing-link');
 if(!entry||!link)return;
 entry.hidden=!document.getElementById('billing-access')||!asada||year<2000||year>2099||!['home','finance-summary','cash','budget','statements'].includes(module);
 if(!entry.hidden)link.href='/facturacion.html?'+new URLSearchParams({asada,year});
}
async function load(){if(busy||loading)return;loading=true;boardSearch=null;boardQuery='';boardScope='current';lock(true);$('#sw-content').textContent='Cargando información guardada…';try{if(!asada){records=[];draw();return;}monthlyExtra=null;const d=await api(module==='projects'?'panel-projects?asada='+encodeURIComponent(asada):endpoint('panel-data'));records=d.records;canEdit=d.canEdit;canEditOperations=d.canEditOperations===true;canCompleteOrders=d.canCompleteOrders===true;canRestoreOutages=d.canRestoreOutages===true;$('.sw-sub').textContent=d.asada.name+(module==='projects'?' · Proyectos de todos los años':' · Año '+year+(['board','workplan','calendar','orders','outages','network','monthly'].includes(module)?'':' · Montos en colones'));close();draw();status('Información cargada desde la nube.');}catch(e){records=[];$('#sw-content').textContent='No se cargaron los datos. Pulse Actualizar para intentarlo de nuevo.';status(e.message);}finally{loading=false;lock(false);}}
function close(){editing=null;$('#sw-editor').hidden=true;$('#sw-editor').innerHTML='';}
const amount=(key,label,value=0)=>'<label>'+label+'<input name="'+key+'" type="number" min="0" max="1000000000000" step="0.01" value="'+esc(value)+'" required></label>';
const field=(key,label,value='',type='text',required=true)=>'<label>'+label+'<input name="'+key+'" type="'+type+'" maxlength="'+(key==='note'?1500:500)+'" value="'+esc(value)+'" '+(required?'required':'')+'></label>';
function form(kind,r=null){if(!(canEdit||kind==='service_order'&&canEditOperations)||loading||busy)return;close();editing=r;const p=r?.payload||{},date=p.date||year+'-01-01',e=$('#sw-editor');let f='',title='';
if(kind==='settings'){title='Saldos de caja, bancos y fondos';f=amount('opening','Saldo inicial consolidado de caja y bancos ₡',p.opening||0).replace('min="0"','min="-1000000000000"')+amount('fund','Fondo autorizado de caja chica ₡',p.fund||0)+field('note','Observaciones',p.note||'','text',false)+'<p class="wide sw-note">Saldos al corte: no son recaudación ni el saldo inicial. El total consolidado debe incluir las cuentas de Hidrantes y Protección del Recurso Hídrico. Deje en blanco un monto que no conoce.</p>'+field('bankDate','Fecha del saldo de estas cuentas',p.bankDate||'','date',false)+['bankCash','hydrants','protection'].map((k,i)=>amount(k,['Total de caja y bancos al corte, incluidos los fondos ₡','Saldo de la cuenta de Hidrantes ₡','Saldo de Protección del Recurso Hídrico ₡'][i],p[k]??'').replace(' required','')).join('')+'<label>¿Se verificaron estos saldos contra los bancos?<select name="bankVerified"><option value="false">Pendiente de verificar</option><option value="true" '+(p.bankVerified?'selected':'')+'>Sí, verificados al corte indicado</option></select></label>';}
if(kind==='movement'){title='Movimiento de efectivo';f=field('date','Fecha',date,'date')+'<label>Tipo<select name="type"><option value="in" '+(p.type==='in'?'selected':'')+'>Entrada</option><option value="out" '+(p.type!=='in'?'selected':'')+'>Salida</option></select></label>'+amount('amount','Monto ₡',p.amount||0)+budgetFields(p,p.type==='in'?'income':'expense')+field('part','Partida / categoría',p.part||'')+field('concept','Concepto',p.concept||'')+field('reference','Referencia o comprobante',p.reference||'','text',false);}
if(kind==='petty'){title='Comprobante de caja chica';f=field('date','Fecha',date,'date')+amount('amount','Monto ₡',p.amount||0)+field('reference','Número de comprobante',p.reference||'')+field('concept','Concepto',p.concept||'')+field('responsible','Responsable',p.responsible||'')+budgetFields(p,'expense')+field('part','Partida presupuestaria',p.part||'Administración')+'<label>Reintegro<select name="reimbursed"><option value="false">Pendiente</option><option value="true" '+(p.reimbursed?'selected':'')+'>Reintegrado</option></select></label>';}
if(kind==='budget'){title='Partida del presupuesto anual de la ASADA';f=budgetFields(p,p.budgetType||'expense')+field('part','Nombre de la partida',p.part||'')+amount('amount','Monto anual presupuestado ₡',p.amount||0)+field('reference','Referencia del presupuesto aprobado y presentado al AyA',p.reference||'','text',false);}
if(kind==='statement'){title='Estado financiero del año '+year;f=field('date','Fecha de corte',p.date||year+'-12-31','date');for(const [k,l] of [['cash','Efectivo y equivalentes'],['receivables','Cuentas por cobrar'],['fixed','Activos fijos netos'],['other','Otros activos'],['liabilities','Total de pasivos'],['payables','Cuentas por pagar, incluidas en pasivos'],['equity','Patrimonio'],['income','Ingresos contables del período'],['expenses','Gastos contables del período']])f+=amount(k,l+' ₡',p[k]||0).replace(k==='equity'?'min="0"':'IMPOSSIBLE','min="-1000000000000"');f+=field('note','Observaciones / documento fuente',p.note||'','text',false);f='<details class="wide"><summary>Importar desde PDF</summary><p>Seleccione un PDF con texto. Se lee en este dispositivo.</p><input id="sw-statement-pdf" type="file" accept=".pdf,application/pdf"><button type="button" class="sw-btn" id="sw-read-statement">Leer PDF</button><div id="sw-import-review" aria-live="polite"></div></details>'+f;}
if(kind==='project'){
 title='Perfil de proyecto';
 const area=(key,label,value,required=false,limit=2500)=>'<label class="wide">'+label+'<textarea name="'+key+'" maxlength="'+limit+'" '+(required?'required':'')+'>'+esc(value||'')+'</textarea></label>';
 f='<p class="wide sw-note">Empiece con lo que conoce. Puede completar el estudio, permisos y respaldos conforme avance el proyecto.</p>'+field('title','Nombre del proyecto',p.title||'')+selectField('type','Tipo',['Tanque','Tubería','Macromedición','Fuente de agua','Calidad del agua','Otro'],p.type||'Tanque')+field('sector','Sector o comunidad',p.sector||'')+selectField('state','Estado',projectStates,p.state||'Idea')+selectField('priority','Prioridad',['Normal','Alta','Urgente'],p.priority||'Normal')+amount('progress','Avance estimado (%)',p.progress||0).replace('max="1000000000000"','max="100"')+area('problem','¿Qué problema o necesidad se quiere resolver?',p.problem,true)+area('solution','¿Qué se propone hacer? (puede completarlo después)',p.solution)+area('scope','Alcance y actividades principales',p.scope)+area('benefit','Beneficios para la comunidad',p.benefit)+area('technical','Estudio técnico, diagnóstico o referencia',p.technical,false,1200)+amount('budget','Presupuesto estimado ₡',p.budget||0)+amount('secured','Financiamiento confirmado ₡',p.secured||0)+field('funding','Fuente de financiamiento prevista',p.funding||'','text',false)+field('responsible','Responsable',p.responsible||'','text',false)+field('start','Fecha de inicio (opcional)',p.start||'','date',false)+field('target','Fecha meta (opcional)',p.target||'','date',false)+area('agreement','Acuerdo de Junta Directiva / referencia',p.agreement,false,500)+area('permits','Permisos necesarios y su estado',p.permits,false,1000)+area('notes','Próximos pasos u observaciones',p.notes,false,1500)+'<div class="wide sw-project-files"><h3>Respaldos del proyecto</h3>'+(p.documents?.length?p.documents.map(d=>'<label><input type="checkbox" name="removeDocument" value="'+esc(d.id)+'"> Quitar '+esc(d.category)+' · '+esc(d.name)+'</label>').join(''):'<p class="sw-note">Aún no hay archivos.</p>')+'<label>Categoría del archivo<select name="fileCategory">'+['Estudio técnico','Presupuesto','Acuerdo de Junta','Permiso','Fotografía','Otro respaldo'].map(c=>'<option>'+c+'</option>').join('')+'</select></label><label>Agregar respaldo (PDF, JPG o PNG; máximo 5 MB)<input type="file" name="projectFile" accept="application/pdf,image/jpeg,image/png"></label><p class="sw-note">Puede adjuntar más respaldos editando el proyecto después de guardarlo.</p></div>';
}
if(kind==='service_order'){title='Orden de trabajo';f=field('date','Fecha del reporte',p.date||new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'}),'date')+field('title','Trabajo por realizar',p.title||'')+field('sector','Sector o comunidad',p.sector||'')+field('responsible','Responsable asignado',p.responsible||'')+field('due','Fecha prevista',p.due||p.date||date,'date')+selectField('priority','Prioridad',['Normal','Prioritaria','Urgente'],p.priority||'Normal')+selectField('state','Estado',['Pendiente','En proceso','Terminada'],p.state||'Pendiente')+pointField(p.pointId)+field('description','Descripción del problema',p.description||'','text',false)+field('resolution','Trabajo realizado / resultado',p.resolution||'','text',false)+'<input type="hidden" name="documentId" value="'+esc(p.documentId||'')+'"><label>Foto o evidencia (JPG, PNG o PDF; hasta 5 MB)<input type="file" name="orderFile" accept="image/jpeg,image/png,application/pdf"></label>'+(p.documentId?'<p class="sw-note">Ya hay una evidencia adjunta. Seleccione otra para reemplazar la referencia.</p>':'');}
if(kind==='service_outage'){title='Interrupción del servicio';f=field('date','Fecha de inicio',p.date||new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'}),'date')+field('time','Hora de inicio',p.time||'08:00','time')+field('sector','Sector afectado',p.sector||'')+field('cause','Causa',p.cause||'')+amount('affected','Abonados afectados (estimación)',p.affected||0).replace('step="0.01"','step="1"')+selectField('state','Estado',['En curso','Restablecido'],p.state||'En curso')+'<div class="sw-outage-end wide"><p class="sw-note">Complete estos datos solo cuando ya se haya restablecido el servicio.</p><div class="sw-form">'+field('endDate','Fecha de restablecimiento',p.endDate||'','date',false)+field('endTime','Hora de restablecimiento',p.endTime||'','time',false)+'</div></div>'+pointField(p.pointId)+field('notice','Comunicación a la comunidad / referencia',p.notice||'','text',false);}
if(kind==='service_point'){title='Punto del acueducto';f=field('date','Fecha de registro',p.date||new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'}),'date')+field('name','Nombre del punto',p.name||'')+selectField('type','Tipo',['Naciente','Pozo','Tanque','Válvula','Macromedidor','Tramo crítico','Otro'],p.type||'Tanque')+field('sector','Sector',p.sector||'')+amount('latitude','Latitud (ejemplo: 10.3021)',p.latitude??10).replace('min="0"','min="8"').replace('max="1000000000000"','max="12"').replace('step="0.01"','step="any"')+amount('longitude','Longitud (ejemplo: -84.1284)',p.longitude??-84).replace('min="0"','min="-86"').replace('max="1000000000000"','max="-82"').replace('step="0.01"','step="any"')+field('note','Observaciones',p.note||'','text',false);}
if(kind==='deadline'){title='Fecha importante';f=field('date','Fecha límite',p.date||new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'}),'date')+field('title','Actividad u obligación',p.title||'')+selectField('category','Categoría',['Calidad del agua','Aforos','Mantenimiento','Pólizas','Reuniones','Informes','Otra'],p.category||'Mantenimiento')+field('responsible','Responsable',p.responsible||'')+selectField('state','Estado',['Pendiente','Cumplido'],p.state||'Pendiente')+field('note','Detalle o referencia',p.note||'','text',false);}
if(kind==='asset'){title='Activo al cierre del año '+year;f=field('code','Código del activo',p.code||'')+field('name','Nombre',p.name||'')+field('category','Categoría',p.category||'')+field('date','Fecha de adquisición',date,'date')+amount('cost','Costo histórico ₡',p.cost||0)+amount('depreciation','Depreciación acumulada al corte ₡',p.depreciation||0)+amount('life','Vida útil en años',p.life||0)+field('location','Ubicación',p.location||'')+field('responsible','Responsable',p.responsible||'')+field('state','Estado físico',p.state||'En servicio');}
if(kind==='payment'){title='Pago para Junta Directiva';f=paymentForm(p,p.date||(year===new Date().getFullYear()?new Date().toLocaleDateString('en-CA',{timeZone:'America/Costa_Rica'}):date));}

if(kind==='workplan'){title=r?'Editar actividad':'Nueva actividad';f=workplanFields(r);}
if(kind==='agreement'){title='Acuerdo de Junta Directiva';f=field('code','Número de acuerdo / acta',p.code||'')+field('title','Acuerdo',p.title||'')+field('date','Fecha del acuerdo',date,'date')+field('due','Fecha límite',p.due||date,'date')+field('responsible','Responsable',p.responsible||'')+'<div><p>Avance automático por estado</p><output id="sw-agreement-progress">'+agreementProgress(p.state||'Pendiente')+' %</output><p class="sw-note">Pendiente: 0 % · En proceso: 50 % · Cumplido: 100 %.</p></div>'+'<label>Estado<select name="state">'+['Pendiente','En proceso','Cumplido'].map(x=>'<option '+(p.state===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+field('note','Seguimiento y referencia de evidencia',p.note||'','text',false);f+='<label class="wide">Texto o resumen del acuerdo (opcional)<textarea name="text" maxlength="4000" rows="6" placeholder="Copie lo que consta en el acta o registre un resumen fiel, indicando que es un resumen.">'+esc(p.text||'')+'</textarea></label><label>Palabras clave (opcional)<input name="keywords" maxlength="300" value="'+esc(p.keywords||'')+'" placeholder="tubería 4 pulgadas, compras, materiales"></label><input type="hidden" name="documentId" value="'+esc(p.documentId||'')+'"><label>Respaldo del libro de actas (PDF, JPG o PNG; máximo 5 MB)<input name="agreementFile" type="file" accept="application/pdf,image/jpeg,image/png"></label><p class="sw-note wide">Adjunte únicamente las páginas necesarias del acta. El archivo respalda lo registrado; no sustituye el libro de actas. '+(p.documentId?'Ya existe un respaldo. Si adjunta otro, el anterior se conservará en los documentos de la ASADA.':'El adjunto es opcional; puede agregarlo cuando el acta esté disponible.')+'</p>';}

e.hidden=false;e.className='sw-editor';e.innerHTML='<h2>'+title+'</h2><form id="sw-form"><div class="sw-form">'+f+'</div><p id="sw-error" role="alert"></p><div class="sw-actions"><button type="submit" class="sw-btn primary">Guardar en la nube</button><button type="button" class="sw-btn" data-cancel>Cancelar</button></div></form>';
const verifyImport=kind==='statement'?wireStatementImport($('#sw-form')):null;
wireBudgetForm(kind);if(kind==='workplan')wireWorkplanForm($('#sw-form'));if(kind==='service_outage')wireOutageForm();if(kind==='payment')wirePaymentForm();if(kind==='agreement'){const f=$('#sw-form'),update=()=>{$('#sw-agreement-progress').textContent=agreementProgress(f.elements.state.value)+' %';};f.elements.state.addEventListener('change',update);update();}
$('#sw-form').onsubmit=async ev=>{ev.preventDefault();if(busy)return;if(verifyImport&&!verifyImport())return;const p=Object.fromEntries(new FormData(ev.target));for(const i of ev.target.querySelectorAll('input[type=number]'))p[i.name]=['bankCash','hydrants','protection'].includes(i.name)&&p[i.name]===''?null:Number(p[i.name]);if(kind==='workplan'){p.date ||= [p.due,workplanReference()].sort()[0];p.progress ??= 0;}if(kind==='project'){const file=ev.target.elements.projectFile.files[0],removed=new Set(new FormData(ev.target).getAll('removeDocument'));p.documents=(r?.payload.documents||[]).filter(d=>!removed.has(d.id));delete p.projectFile;delete p.fileCategory;delete p.removeDocument;if(file){busy=true;lock(true);try{await attachProjectFile(file,p,ev.target.elements.fileCategory.value);}catch(e){$('#sw-error').textContent=e.message;return;}finally{busy=false;lock(false);}}}if(kind==='service_order'){const file=ev.target.elements.orderFile.files[0];delete p.orderFile;busy=true;lock(true);try{await attachOrderFile(file,p);}catch(e){$('#sw-error').textContent=e.message;return;}finally{busy=false;lock(false);}}if(kind==='payment'){p.confirmApproval=ev.target.elements.confirmApproval.checked;const file=ev.target.elements.invoiceFile.files[0];delete p.invoiceFile;busy=true;lock(true);try{await attachPaymentInvoice(file,p);}catch(e){$('#sw-error').textContent=e.message;return;}finally{busy=false;lock(false);}}if(kind==='agreement'){const file=ev.target.elements.agreementFile.files[0];delete p.agreementFile;busy=true;lock(true);try{await attachAgreement(file,p);}catch(e){$('#sw-error').textContent=e.message;return;}finally{busy=false;lock(false);}}if(kind==='settings')p.bankVerified=p.bankVerified==='true';if(kind==='petty')p.reimbursed=p.reimbursed==='true';if(kind==='movement'&&((p.type==='in')!==(p.budgetType==='income'))){$('#sw-error').textContent='Las entradas corresponden a ingresos; las salidas a gastos o inversiones.';return;}await save(kind,p,r);};e.scrollIntoView({behavior:'smooth',block:'start'});
}
function wireOutageForm(){const f=$('#sw-form'),wrap=f.querySelector('.sw-outage-end');if(!wrap)return;const update=()=>{const restored=f.elements.state.value==='Restablecido';wrap.hidden=!restored;f.elements.endDate.required=restored;f.elements.endTime.required=restored;if(!restored){f.elements.endDate.value='';f.elements.endTime.value='';}};f.elements.state.addEventListener('change',update);update();}
function wireStatementImport(form){
 const button=form.querySelector('#sw-read-statement'),review=form.querySelector('#sw-import-review');
 const names={cash:'Efectivo',receivables:'Cuentas por cobrar',fixed:'Activos fijos netos',other:'Otros activos',liabilities:'Pasivos',payables:'Cuentas por pagar',equity:'Patrimonio',income:'Ingresos',expenses:'Gastos',assets:'Total de activos según PDF',result:'Resultado según PDF'};
 let active=false,selectedCut='';
 button.addEventListener('click',async()=>{
  if(active){$('#sw-error').textContent='Cancele el borrador para importar otro PDF.';return;}button.disabled=true;review.textContent='Leyendo el documento…';
  try{
   const {readStatement}=await import('/statement-import.mjs');
   const file=form.querySelector('#sw-statement-pdf').files[0];
   const data=await readStatement(file);
   if(!form.isConnected)return;
   const cuts=data.cuts.filter(d=>d.startsWith(year+'-'));
   if(!cuts.length)throw Error('El PDF no contiene un corte reconocido del año seleccionado.');
   review.innerHTML='<label>Corte a importar <select id="sw-import-cut"><option value="">Seleccione el corte</option>'+cuts.map(d=>'<option>'+esc(d)+'</option>').join('')+'</select></label><div id="sw-import-lines"></div>';
   const cut=review.querySelector('#sw-import-cut');
   cut.onchange=()=>{
    if(!cut.value){selectedCut='';return;}
    active=true;selectedCut=cut.value;form.elements.date.value=cut.value;
    const lines=review.querySelector('#sw-import-lines');
    lines.innerHTML='<h3>1. Revise cada monto contra el PDF</h3><p>Elija la fila correcta o digite el valor verificado. Los campos sin coincidencia quedan vacíos.</p>'+Object.entries(names).map(([k,label])=>{
     const options=data.found.filter(r=>r.key===k&&r.date===cut.value);
     return '<label>'+label+' <select data-import-key="'+k+'"><option value="">'+(options.length?'Seleccione la fila':'Sin coincidencia: digite el monto')+'</option>'+options.map(r=>'<option value="'+r.value+'">Pág. '+r.page+' · '+esc(r.label)+' · '+money(r.value)+'</option>').join('')+'</select></label>'+(['assets','result'].includes(k)?'<label>'+label+' <input id="sw-source-'+k+'" type="number" step="0.01" required></label>':'');
    }).join('')+'<h3>2. Compruebe los totales</h3><label><input id="sw-source-confirm" type="checkbox" required> Confirmo que revisé las cuentas, la columna y los montos contra el PDF.</label><p id="sw-check-note" role="status"></p>';
    const input=k=>['assets','result'].includes(k)?form.querySelector('#sw-source-'+k):form.elements[k];
    for(const [k] of Object.entries(names))input(k).value='';
    lines.querySelectorAll('[data-import-key]').forEach(el=>{
     el.onchange=()=>{input(el.dataset.importKey).value=el.value;form.querySelector('#sw-source-confirm').checked=false;};
     const options=data.found.filter(r=>r.key===el.dataset.importKey&&r.date===cut.value);
     if(options.length===1&&!options[0].review){el.selectedIndex=1;el.onchange();}
    });
    const note=form.querySelector('#sw-check-note');note.textContent='Al guardar se verificará el balance y el resultado contra los totales del PDF.';
   };
  }catch(error){if(!active)review.textContent=error.message;else{$('#sw-error').textContent=error.message;}}
  finally{button.disabled=false;}
 });
 form.addEventListener('input',event=>{const confirm=form.querySelector('#sw-source-confirm');if(confirm&&event.target!==confirm)confirm.checked=false;});
 return ()=>{
  if(button.disabled){$('#sw-error').textContent='Espere a que termine la lectura del PDF.';return false;}
  if(!active)return true;
  const error=$('#sw-error'),confirm=form.querySelector('#sw-source-confirm'),source=k=>form.querySelector('#sw-source-'+k)?.value;
  const n=k=>Number(form.elements[k].value),a=n('cash')+n('receivables')+n('fixed')+n('other');
  if(!confirm?.checked||!source('assets')||!source('result')||form.elements.date.value!==selectedCut){error.textContent='Confirme los montos del PDF y mantenga el corte elegido.';return false;}
  if(Math.abs(a-Number(source('assets')))>.02||Math.abs(a-n('liabilities')-n('equity'))>.02||Math.abs(n('income')-n('expenses')-Number(source('result')))>.02||n('payables')>n('liabilities')){error.textContent='Las cifras no cuadran con el PDF. Revise activos, pasivos, patrimonio y resultado antes de guardar.';return false;}
  return true;
 };
}
async function save(kind,payload,r,archive=false){busy=true;lock(true);root.querySelectorAll('button').forEach(b=>b.disabled=true);try{await api('panel-save',{asada,year:r?.year||year,kind,payload,...(r?{id:r.id,version:r.version}:{}),archive});close();if(kind==='payment')paymentSelectionInitialized=false;busy=false;await load();status(archive?'Registro archivado; se conserva su historial.':'Los cambios se guardaron en la nube.');}catch(e){status(e.message);if($('#sw-error'))$('#sw-error').textContent=e.message;}finally{busy=false;lock(false);root.querySelectorAll('button').forEach(b=>b.disabled=false);}}
function pettyReceipt(r){
 const p=r.payload;
 return '<section class="sw-panel"><h2>Monto: '+esc(money(p.amount))+'</h2><dl class="sw-board-meta">'+
 [['Número de comprobante',p.reference],['Fecha',p.date],['Responsable',p.responsible],['Reintegro',p.reimbursed?'Reintegrado':'Pendiente'],['Partida presupuestaria',p.part]].map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+esc(value||'Sin registrar')+'</dd></div>').join('')+
 '</dl><h2>Concepto</h2><p class="sw-board-text">'+esc(p.concept||'Sin registrar')+'</p></section>';
}
async function printReport(agreement=null,petty=null,project=null){const membrete=await window.SWLetterhead.html();
 if(!asada)throw Error('Seleccione una ASADA antes de generar el informe.');
 const content=$('#sw-content').cloneNode(true);if(petty)content.innerHTML=pettyReceipt(petty);else if(agreement)content.innerHTML=agreementDetail(agreement,false);else if(project)content.innerHTML=projectProfile(project,true);content.querySelector('.sw-summary-views')?.remove();if(module==='home')content.querySelectorAll('details').forEach(d=>d.open=true);if(module==='home')content.querySelectorAll('.sw-home-bar,.sw-home-month').forEach(b=>{const v=document.createElement('div');v.className=b.className;v.innerHTML=b.innerHTML;b.replaceWith(v);});if(module==='board'){content.querySelector('#sw-agreement-search')?.remove();content.querySelector('.sw-board-top')?.remove();content.querySelector('.sw-board-pagination')?.remove();content.querySelectorAll('.sw-board-toggle').forEach(e=>e.remove());content.querySelectorAll('details').forEach(d=>d.open=true);content.querySelectorAll('[data-agreement-document]').forEach(a=>{const p=document.createElement('p');p.textContent='Respaldo del acta adjunto: disponible en la plataforma.';a.replaceWith(p);});}
 if(module==='calendar')content.querySelectorAll('.sw-calendar-slot').forEach(e=>e.remove());
 if(module==='workplan'){
  content.querySelector('.sw-plan-filters')?.remove();
  content.querySelectorAll('.sw-calendar-slot').forEach(e=>e.remove());
  content.querySelectorAll('.sw-plan-detail').forEach(d=>d.open=true);
 }
 if(module==='budget')content.querySelectorAll('.sw-budget-chart button').forEach(b=>{const d=document.createElement('div');d.className=b.className;d.innerHTML=b.innerHTML;b.replaceWith(d);});
 content.querySelectorAll('table').forEach(t=>{const headers=[...t.querySelectorAll('thead th')];const i=headers.findIndex(h=>h.textContent.trim()==='Acciones');if(i>=0)t.querySelectorAll('tr').forEach(r=>r.children[i]?.remove());});
 content.querySelectorAll('button,input,select,label').forEach(e=>e.remove());
 document.getElementById('sw-print-frame')?.remove();
 const frame=document.createElement('iframe');frame.id='sw-print-frame';frame.title='Informe para guardar en PDF';frame.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0';
 const name=asadas.find(a=>a.id===asada)?.name||'ASADA',title=project?project.payload.title:petty?'Comprobante de caja chica'+(petty.payload.reference?' N.º '+petty.payload.reference:''):agreement?agreement.payload.title:module==='cash'&&cashView==='projected'?'Flujo proyectado':$('#sw-title').textContent,reportPeriod=project?'Proyecto iniciado en '+project.year:petty||agreement?Number((petty||agreement).year||year):module==='board'&&boardSearch?(boardSearch.year||'Todos los años registrados'):year;
 frame.onload=()=>{try{frame.contentWindow.focus();frame.contentWindow.print();status('En la ventana de impresión, seleccione Guardar como PDF y pulse Guardar.');}catch{status('No se pudo abrir la impresión. Intente desde Chrome o Edge.');}};
 frame.srcdoc='<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>'+esc(name+' - '+title+' - '+reportPeriod)+'</title><style>@page{size:'+ ((module==='budget'||module==='cash'&&cashView==='projected')?'A3':'A4') +(petty||project||['board','workplan'].includes(module)?' portrait':' landscape')+';margin:14mm}*{box-sizing:border-box}body{font:11px Arial,sans-serif;color:#173441}h1{font-size:23px;margin:0 0 6px}h2{font-size:16px;margin:0 0 12px}header{border-bottom:2px solid #0b7186;padding-bottom:12px;margin-bottom:18px}header p{margin:5px 0}.sw-stats{display:flex;gap:12px;margin-bottom:16px}.sw-stat{flex:1;border:1px solid #d3e2e8;padding:14px;border-radius:8px}.sw-stat span,.sw-stat strong,.sw-stat small{display:block}.sw-stat strong{font-size:22px;margin:8px 0}.sw-stat small,.sw-note{color:#536b77}.sw-panel{margin:0 0 18px;padding:12px;border:1px solid #d3e2e8;border-radius:8px}.sw-simple-grid{display:flex;flex-wrap:wrap;gap:12px}.sw-simple-card{flex:1;min-width:160px;border:1px solid #d3e2e8;padding:12px}.sw-simple-card strong{display:block;font-size:19px}.sw-home-bar{padding:12px}.sw-home-bar>span:first-child{display:flex;justify-content:space-between}.sw-home-track{display:block;height:22px;background:#edf5f7}.sw-home-track i{display:block;height:100%;background:#1398ad}.sw-home-track i.expense{background:#8a9fb0}.sw-home-months{display:flex;gap:8px;align-items:end}.sw-home-month{flex:1}.sw-home-columns{display:flex;height:120px;align-items:end;gap:3px}.sw-home-columns i{width:40%;background:#1398ad}.sw-home-columns i.expense{background:#8a9fb0}.sw-home-result strong{font-size:22px;margin-left:15px}table{width:100%;border-collapse:collapse;table-layout:auto}th,td{text-align:left;padding:8px;border-bottom:1px solid #d3e2e8;overflow-wrap:anywhere}th{background:#edf5f7}thead{display:table-header-group}tr{break-inside:avoid}svg{display:block;width:100%;max-height:260px}p{line-height:1.5}button,input,select{display:none}.sw-row-top{display:flex;justify-content:space-between}.sw-meter{background:#e4eff2;height:8px}.sw-meter span{display:block;background:#0b7186;height:8px}footer{border-top:1px solid #d3e2e8;margin-top:18px;padding-top:8px;color:#536b77}.sw-budget-table{font-size:7px;table-layout:fixed}.sw-budget-table th,.sw-budget-table td{padding:4px 1px}.sw-budget-table th:first-child{width:95px}.sw-budget-table td{text-align:right}.sw-budget-section{background:#e1eff3}.sw-budget-total{font-weight:bold;background:#edf5f7}.sw-budget-chart{display:flex;gap:12px}.sw-budget-chart .sw-fin-bar{flex:1}.sw-cash-table{font-size:7px;table-layout:fixed}.sw-cash-table th,.sw-cash-table td{padding:5px 2px}.sw-cash-table th:first-child{width:140px}.sw-cash-table td.num,.sw-cash-table thead th.num{text-align:right;white-space:nowrap}.sw-cash-total{font-weight:bold;background:#edf5f7}.sw-cash-section{background:#e1eff3}.sw-cash-final{font-weight:bold;background:#d5ece7}.sw-negative{color:#9a322c}.sw-fin-cards{display:flex;flex-wrap:wrap;gap:10px}.sw-fin-card{display:block!important;flex:1;padding:12px;border:1px solid #d3e2e8}.sw-fin-card strong{display:block;font-size:16px;margin:10px 0}.sw-fin-card small{display:none}.sw-fin-charts{display:flex;gap:12px}.sw-fin-charts>section{flex:1}.sw-fin-bar{display:block!important;width:100%;border:0;background:white;text-align:left;padding:10px 0}.sw-fin-bar-label{display:flex;justify-content:space-between;gap:10px}.sw-fin-track{display:block;height:22px;background:#e9f1f5;margin-top:8px}.sw-fin-fill{display:block;height:100%;background:#118ca0}.sw-fin-bar:nth-of-type(2) .sw-fin-fill{background:#426d87}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.sw-board-entry{margin:0 0 16px;padding:12px;border:1px solid #d3e2e8}.sw-board-entry summary{display:flex;gap:12px}.sw-board-meta{display:flex;flex-wrap:wrap;gap:12px}.sw-board-meta dt{font-weight:bold}.sw-board-meta dd{margin:3px 0 0}.sw-board-text{white-space:pre-wrap;overflow-wrap:anywhere}.sw-op-stats{display:flex;gap:12px;margin:15px 0}.sw-op-stats .sw-stat{flex:1}.sw-op-report h2{color:#0a5668}.sw-op-report h3{margin-top:20px}.sw-project-profile h2{font-size:21px;margin:0 0 5px}.sw-project-profile dl{display:grid;grid-template-columns:1fr 1fr;gap:8px;border:1px solid #d3e2e8;padding:12px}.sw-project-profile dt{color:#536b77;font-size:10px}.sw-project-profile dd{font-weight:bold;margin:2px 0 0}.sw-project-profile h3{font-size:13px;color:#0b7186;margin:16px 0 4px}.sw-project-profile p{white-space:pre-wrap;overflow-wrap:anywhere;margin:4px 0}.sw-project-profile section{break-inside:avoid}</style></head><body>'+membrete+'<header><h1>'+esc(title)+'</h1><p>'+esc(name)+' · '+(typeof reportPeriod==='number'?'Año '+reportPeriod:esc(reportPeriod))+(['board','calendar','orders','outages','network','monthly','projects'].includes(module)?'':' · Montos en colones')+'</p><p>Fecha de elaboración: '+esc(new Date().toLocaleDateString('es-CR',{timeZone:'America/Costa_Rica'}))+'</p></header>'+content.innerHTML+'<footer>Informe elaborado con los registros ingresados para la ASADA y el período seleccionados. Los resultados dependen de la integridad de esa información.</footer></body></html>';
 document.body.appendChild(frame);
}
function download(data,name){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
root.addEventListener('input',ev=>{
 if(ev.target.id!=='sw-plan-search'||busy||loading)return;
 planSearch=ev.target.value;
 $('#sw-plan-results').innerHTML=workplanResults();
});
root.addEventListener('change',ev=>{
 if(busy||loading)return;
 const {id,value}=ev.target;
 if(id==='sw-plan-area')planArea=value;
 else if(id==='sw-plan-state')planState=value;
 else if(id==='sw-plan-period')planPeriod=value;
 else if(id==='sw-plan-reference'&&value&&ev.target.validity.valid)planReference=value;
 else return;
 draw();
});
root.addEventListener('submit',async e=>{if(!e.target.matches('[data-calendar-id]'))return;e.preventDefault();if(busy||loading)return;try{await completeCalendar(e.target);}catch(error){e.target.querySelector('.sw-op-complete-error').textContent=error.message;}});
root.addEventListener('submit',async e=>{if(!e.target.matches('[data-outage-id]'))return;e.preventDefault();if(!busy&&!loading)await submitOutageRestoration(e.target);});
root.addEventListener('submit',async e=>{if(!e.target.matches('[data-order-id]'))return;e.preventDefault();if(!busy&&!loading)await submitOrderCompletion(e.target);});
root.addEventListener('submit',async e=>{if(e.target.id!=='sw-agreement-search')return;e.preventDefault();if(busy||loading)return;const d=new FormData(e.target);boardQuery=String(d.get('q')||'').trim();boardScope=String(d.get('scope')||'all');await searchAgreements();});
root.addEventListener('pointerover',e=>{const b=e.target.closest('[data-home-month]');if(b)homeMonthDetail(Number(b.dataset.homeMonth));});root.addEventListener('focusin',e=>{const b=e.target.closest('[data-home-month]');if(b)homeMonthDetail(Number(b.dataset.homeMonth));});
root.addEventListener('click',async ev=>{const b=ev.target.closest('button');if(!b||busy||loading)return;try{if(b.dataset.cashView&&module==='cash'){cashView=b.dataset.cashView;close();draw();$('[data-cash-view="'+cashView+'"]').focus();return;}if(b.dataset.new==='cash_projection'){projectionEditor();return;}if(b.id==='sw-month-load'){reportingMonth=Number($('#sw-month-select').value);await loadMonthly();return;}if(b.dataset.planStart&&module==='workplan'){
 const r=items('workplan').find(x=>x.id===b.dataset.planStart);
 if(canEdit&&r?.payload.state==='Pendiente'){
  if(!$('#sw-editor').hidden){status('Guarde o cancele la edición antes de iniciar otra actividad.');return;}
  await save('workplan',{...r.payload,state:'En proceso'},r);
 }
 return;
}if(b.dataset.calendarComplete){if(module==='workplan'&&!$('#sw-editor').hidden){status('Guarde o cancele la edición antes de marcar una actividad cumplida.');return;}showCalendarCompletion(b.dataset.calendarComplete);return;}if(b.hasAttribute('data-calendar-cancel')){b.closest('.sw-calendar-slot').innerHTML='';return;}if(b.dataset.restoreEvidence){showOutageRestoration(b.dataset.restoreEvidence,true);return;}if(b.dataset.restore){showOutageRestoration(b.dataset.restore);return;}if(b.hasAttribute('data-cancel-restore')){b.closest('.sw-op-complete')?.remove();return;}if(b.dataset.complete){showOrderCompletion(b.dataset.complete);return;}if(b.hasAttribute('data-cancel-complete')){b.closest('.sw-op-complete')?.remove();return;}if(b.dataset.pointMap){showPointMap(b.dataset.pointMap);return;}if(b.dataset.homeMonth!==undefined){homeMonthDetail(Number(b.dataset.homeMonth));return;}if(b.dataset.homeDetail){$('#sw-home-annual-detail').textContent=b.dataset.homeDetail==='income'?'Ingresos reconocidos en el estado financiero; una parte puede estar pendiente de cobro.':'Gastos reconocidos en el estado financiero; pueden incluir depreciación y obligaciones todavía no pagadas.';return;}if(b.dataset.projectPdf&&module==='projects'){const r=items('project').find(r=>r.id===b.dataset.projectPdf);if(r)await printReport(null,null,r);return;}if(b.dataset.pettyPdf&&module==='petty'){const r=items('petty').find(r=>r.id===b.dataset.pettyPdf);if(r)await printReport(null,r);return;}if(b.dataset.agreementPdf){const r=(boardSearch?.records||items('agreement')).find(r=>r.id===b.dataset.agreementPdf);if(r)await printReport(r);return;}if(b.dataset.agreementOffset!==undefined){await searchAgreements(Number(b.dataset.agreementOffset));return;}if(b.id==='sw-agreement-clear'){boardSearch=null;boardQuery='';boardScope='current';close();draw();status('Búsqueda limpiada. Mostrando acuerdos del año seleccionado.');return;}if(b.dataset.budgetFilter){budgetFilter=b.dataset.budgetFilter;close();draw();return;}if(b.dataset.finMetric){selectedFinanceMetric=b.dataset.finMetric;const d=financeViewData();if(d&&d.metrics[selectedFinanceMetric]){$('#sw-fin-detail').innerHTML=financeDetail(d,selectedFinanceMetric);root.querySelectorAll('.sw-fin-card').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.finMetric===selectedFinanceMetric)));}return;}if(b.id==='sw-fin-word'){await downloadFinanceWord();return;}if(b.dataset.paymentSelect){paymentSelection=new Set(b.dataset.paymentSelect==='all'?paymentRows().map(r=>r.id):[]);draw();return;}if(b.id==='sw-payment-print'){await printPayments();return;}if(b.dataset.summaryView&&isSummary(b.dataset.summaryView)){module=b.dataset.summaryView;close();draw();$('[data-summary-view="'+module+'"]').focus();return;}if(b.dataset.module){module=b.dataset.module;close();draw();}if(b.dataset.new){const r=['settings','statement'].includes(b.dataset.new)?items(b.dataset.new)[0]:null;form(b.dataset.new,r);}if(b.dataset.edit){const r=await recordForAction(b.dataset.edit);form(r.kind,r);}if(b.dataset.archive){const r=await recordForAction(b.dataset.archive);if(confirm('¿Archivar este registro? Dejará de incluirse en los cálculos y quedará en el historial.'))await save(r.kind,r.payload,r,true);}if(b.hasAttribute('data-cancel'))close();if(b.id==='sw-reload')await load();if(b.id==='sw-compare')await compare();if(b.id==='sw-pdf'){if(module==='payments')await printPayments();else await printReport();}if(b.id==='sw-export'){if(!isPlatformAdmin)return;const d=await api(endpoint('panel-data'));download({format:'asada-panel-v1',exported_at:new Date().toISOString(),...d},'ASADA_'+year+'_respaldo.json');status('Se generó el respaldo de datos en formato JSON. Para un documento, use Guardar informe en PDF.');}if(b.id==='sw-history'){const d=await api(endpoint('panel-history'));$('#sw-content').innerHTML='<section class="sw-panel"><h2>Últimos cambios del período</h2>'+table(['Fecha','Acción','Usuario (identificador)','Registro'],d.changes.map(x=>[esc(x.changed_at),esc(x.action),esc(x.actor),esc(x.current_data?.kind)]))+'<p class="sw-note">Se muestran los últimos 200 cambios. Los registros archivados se conservan en la base de datos.</p></section>';}}catch(e){status(e.message);}});
root.addEventListener('change',ev=>{if(busy||loading)return;if(ev.target.dataset.paymentId){if(ev.target.checked)paymentSelection.add(ev.target.dataset.paymentId);else paymentSelection.delete(ev.target.dataset.paymentId);draw();return;}if(ev.target.id==='sw-payment-state'){paymentFilter=ev.target.value;paymentSelectionInitialized=false;}else if(ev.target.id==='sw-payment-session'){paymentSession=ev.target.value;paymentSelectionInitialized=false;}else if(ev.target.id==='sw-budget-month')budgetMonth=Number(ev.target.value);else if(ev.target.id==='sw-budget-service')budgetService=ev.target.value;else if(ev.target.id==='sw-budget-type')budgetFilter=ev.target.value;else return;close();draw();});
$('#sw-year').addEventListener('change',async ev=>{if(busy||loading){ev.target.value=year;return;}const y=Number(ev.target.value);if(!Number.isInteger(y)||y<1900||y>2200){status('Seleccione un año entre 1900 y 2200.');return;}year=y;base=y>1900?y-1:y+1;paymentSelectionInitialized=false;paymentSelection.clear();await load();});
$('#sw-asada').addEventListener('change',async ev=>{if(busy||loading){ev.target.value=asada;return;}asada=ev.target.value;paymentSelectionInitialized=false;paymentSession='';paymentSelection.clear();await load();});
const returnAssembly=$('#sw-return-assembly');if(assemblyLink.get('from')==='asamblea'){returnAssembly.hidden=false;returnAssembly.addEventListener('click',e=>{e.preventDefault();window.close();setTimeout(()=>{location.href='asamblea.html';},200);});}
(async()=>{try{if(paymentStates.includes(assemblyLink.get('paymentState')))paymentFilter=assemblyLink.get('paymentState');const d=await api('panel-asadas');isPlatformAdmin=d.isPlatformAdmin===true;$('#sw-export').hidden=!isPlatformAdmin;asadas=d.asadas;canEdit=d.canEdit;canEditOperations=d.canEditOperations===true;canCompleteOrders=d.canCompleteOrders===true;canRestoreOutages=d.canRestoreOutages===true;$('#sw-asada').innerHTML='<option value="">Seleccione una ASADA</option>'+asadas.map(a=>'<option value="'+a.id+'">'+esc(a.name)+'</option>').join('');const requested=assemblyLink.get('asada'),requestedYear=Number(assemblyLink.get('year'));if(asadas.some(a=>a.id===requested))asada=requested;else if(asadas.length===1)asada=asadas[0].id;$('#sw-asada').value=asada;if(Number.isInteger(requestedYear)&&requestedYear>=1900&&requestedYear<=2200)year=requestedYear;$('#sw-year').value=year;await load();}catch(e){$('#sw-content').textContent='No se pudo abrir esta herramienta. Pulse Actualizar para intentarlo de nuevo.';status(e.message);}})();
})();
