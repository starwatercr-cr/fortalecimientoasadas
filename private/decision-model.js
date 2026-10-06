import {computeWater} from './water-model.js';
import {followupView} from './morosidad-model.js';
import {QUALITY_PARAMS,waterResult} from './water-parameters.js';
const sum=xs=>xs.reduce((s,n)=>s+Number(n||0),0);
export function decisionSummary({panel,warehouse,operations,arrears,planning,year,month,today}){
 const end=new Date(Date.UTC(year,month,0)).toISOString().slice(0,10),rows=panel?.records||[],tx=rows.filter(r=>['movement','petty'].includes(r.kind)).map(r=>({...r.payload,type:r.kind==='petty'?'out':r.payload.type})).filter(p=>p.date>=year+'-01-01'&&p.date<=end),budgets=rows.filter(r=>r.kind==='budget'&&r.payload.budgetType!=='income'),annual=sum(budgets.map(r=>r.payload.amount)),expense=sum(tx.filter(p=>p.type==='out').map(p=>p.amount)),income=sum(tx.filter(p=>p.type==='in').map(p=>p.amount));
 const monthly=Array.from({length:month},(_,i)=>{const list=tx.filter(p=>Number(p.date.slice(5,7))===i+1);return {month:i+1,hasData:list.length>0,income:sum(list.filter(p=>p.type==='in').map(p=>p.amount)),expense:sum(list.filter(p=>p.type==='out').map(p=>p.amount))};});
 const agreements=rows.filter(r=>r.kind==='agreement'),overdue=agreements.filter(r=>r.payload.state!=='Cumplido'&&r.payload.due<today),week=new Date(today+'T12:00:00Z');week.setUTCDate(week.getUTCDate()+7);const through=week.toISOString().slice(0,10),upcoming=agreements.filter(r=>r.payload.state!=='Cumplido'&&r.payload.due>=today&&r.payload.due<=through);
 const items=(warehouse?.records||[]).filter(r=>r.kind==='item'&&!r.archived),low=items.filter(r=>Number(r.stock)<=Number(r.payload.minimum)),empty=low.filter(r=>Number(r.stock)===0);
 const ops=operations?.records||[],logs=ops.filter(r=>r.kind==='log'),pending=logs.filter(r=>r.payload.state!=='Resuelto'),late=pending.filter(r=>r.payload.due&&r.payload.due<today),reviews=ops.filter(r=>!r.reviewed_at&&(r.kind==='chlorine'||r.kind==='log'&&r.payload.waterResults?.length));
 const settings=rows.find(r=>r.kind==='settings')?.payload;
 const opening=typeof settings?.opening==='number'&&Number.isFinite(settings.opening)?settings.opening:null;
 const cash=opening===null?null:Math.round((opening+income-expense)*100)/100;
 const payments=rows.filter(r=>r.kind==='payment'&&r.payload.date<=end),toApprove=payments.filter(r=>r.payload.state==='Pendiente de aprobación'),toPay=payments.filter(r=>r.payload.state==='Aprobado'),returned=payments.filter(r=>r.payload.state==='Devuelto para revisión');
 const cents=rs=>rs.reduce((n,r)=>n+Math.round(r.payload.amount*100),0)/100;
 const approvedAmount=cents(toPay),pendingAmount=cents(toApprove);
 const statement=rows.filter(r=>r.kind==='statement'&&r.payload.date<=end&&r.payload.date>=year+'-01-01').sort((a,b)=>b.payload.date.localeCompare(a.payload.date))[0]||null;
 let finance=null;if(statement){const p=statement.payload,keys=['cash','receivables','fixed','other','liabilities','equity','income','expenses'];if(keys.every(k=>typeof p[k]==='number'&&Number.isFinite(p[k]))){const assets=Math.round((p.cash+p.receivables+p.fixed+p.other)*100)/100;finance={assets,liabilities:p.liabilities,equity:p.equity,income:p.income,expenses:p.expenses,result:Math.round((p.income-p.expenses)*100)/100,date:p.date,balanced:Math.abs(assets-p.liabilities-p.equity)<=.02};}}
 const ar=arrears?.records||[],followup=followupView(ar,today),openCases=followup.cases.filter(r=>r.payload.state!=='Resuelto'),caseIds=new Set(openCases.map(r=>r.id));
 const promises=ar.filter(r=>r.kind==='promise'&&r.payload.state==='Pendiente'&&(caseIds.has(r.parent_id)||ar.some(d=>d.id===r.parent_id&&d.kind==='debt'&&d.payload.balance>0))),latePromises=promises.filter(r=>r.payload.due<today);
 const quality=[];for(const r of ops){const p=r.payload||{};const results=r.kind==='log'?p.waterResults||[]:r.kind==='chlorine'&&p.type==='Libre'?[{param:'chlorine',value:String(p.value),unit:'mg/L'}]:[];const context=r.kind==='chlorine'?{stage:'treated'}:p.waterContext||{};
 for(const row of results){if(!QUALITY_PARAMS.some(p=>p.id===row.param))continue;const result=waterResult(row,context);quality.push({record:r,result,row});}}
 const qualityAttention=quality.filter(x=>['urgent','outside','alert'].includes(x.result.status)),qualityIncomplete=quality.filter(x=>['pending','context'].includes(x.result.status));
 const planned=(planning?.records||panel?.records||[]).filter(r=>!r.deleted),plans=planned.filter(r=>r.kind==='workplan'&&r.payload.date<=end),planActive=plans.filter(r=>!['Cumplido','Cancelado'].includes(r.payload.state)),planLate=planActive.filter(r=>r.payload.due<today),planUpcoming=planActive.filter(r=>r.payload.due>=today&&r.payload.due<=through);
 const waters=planned.filter(r=>r.kind==='water'&&r.payload.date<=end).sort((a,b)=>b.payload.date.localeCompare(a.payload.date)||(b.updated_at||'').localeCompare(a.updated_at||''));
 const water=waters[0]||null,waterResults=water?computeWater({...water.payload,flows:water.payload.sources.map(source=>source[water.payload.season])}):null;
 const latest=arr=>arr.map(r=>r.updated_at||r.created_at||r.payload?.date).filter(Boolean).sort().at(-1)||null;
 return {plans,planActive,planLate,planUpcoming,waters,water,waterResults,annual:budgets.length?annual:null,expense:tx.length?expense:null,income:tx.length?income:null,percent:annual>0&&tx.length?expense/annual*100:null,monthly,budgets,tx,agreements,overdue,upcoming,items,low,empty,logs,pending,late,reviews,opening,cash,payments,toApprove,toPay,returned,pendingAmount,approvedAmount,statement,finance,followup,openCases,promises,latePromises,quality,qualityAttention,qualityIncomplete,lastPanel:latest(rows),lastOperations:latest(ops),through,end};
}
