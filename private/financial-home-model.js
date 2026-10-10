(()=>{
 const number=v=>typeof v==='number'&&Number.isFinite(v)?v:null,sum=a=>a.reduce((s,n)=>s+n,0),round=n=>Math.round(n*100)/100;
 function build(records,year){
  const rows=records.filter(r=>!r.deleted),of=k=>rows.filter(r=>r.kind===k).map(r=>r.payload),states=of('statement'),candidate=states.length===1?states[0]:null,keys=['cash','receivables','fixed','other','liabilities','equity','income','expenses'];
  const p=candidate&&keys.every(k=>number(candidate[k])!==null)?candidate:null,s=of('settings')[0]||{},transactions=[...of('movement'),...of('petty').map(x=>({...x,type:'out'}))].filter(x=>x.date?.startsWith(year+'-')&&number(x.amount)!==null);
  const income=p?p.income:null,expenses=p?p.expenses:null,result=p?round(p.income-p.expenses):null,monthly=Array.from({length:12},(_,i)=>{const t=transactions.filter(x=>Number(x.date.slice(5,7))===i+1);return {month:i+1,count:t.length,income:t.length?round(sum(t.filter(x=>x.type==='in').map(x=>x.amount))):null,expenses:t.length?round(sum(t.filter(x=>x.type==='out').map(x=>x.amount))):null};});
  const budgets=of('budget').filter(x=>x.budgetType!=='income'),payments=transactions.filter(x=>x.type==='out'),budget=budgets.length?sum(budgets.map(x=>x.amount)):null,executed=transactions.length?round(sum(payments.map(x=>x.amount))):null;
  const cash=number(s.bankCash)??(p?p.cash:null),cashSource=number(s.bankCash)!==null?'Saldo de caja y bancos registrado':'Efectivo y equivalentes del estado financiero',cashDate=number(s.bankCash)!==null?s.bankDate:p?.date;
  return {p,income,expenses,result,monthly,cash,cashSource,cashDate,cashVerified:number(s.bankCash)!==null&&s.bankVerified===true,hydrants:number(s.hydrants),protection:number(s.protection),bankDate:s.bankDate||null,bankVerified:s.bankVerified===true,receivables:p?number(p.receivables):null,payables:p?number(p.payables):null,budget,executed,remaining:budget!==null&&executed!==null?round(budget-executed):null,percent:budget>0&&executed!==null?executed/budget*100:null,assets:p?round(p.cash+p.receivables+p.fixed+p.other):null,liabilities:p?p.liabilities:null,equity:p?p.equity:null,balanced:p?Math.abs(p.cash+p.receivables+p.fixed+p.other-p.liabilities-p.equity)<=.02:null};
 }
 globalThis.SWFinancialHome={build};
})();
