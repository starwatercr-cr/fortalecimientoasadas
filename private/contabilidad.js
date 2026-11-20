const $ = id => document.getElementById(id);
const services={AC:'Acueducto',AL:'Alcantarillado',HI:'Hidrantes',RH:'Protección del recurso hídrico',NR:'Actividad no regulada'};
const format=new Intl.NumberFormat('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2});
function money(value){
  const cents=BigInt(value), absolute=cents<0n?-cents:cents;
  const fraction=(absolute%100n).toString().padStart(2,'0');
  return (cents<0n?'-':'')+format.formatToParts(absolute/100n)
    .map(part=>part.type==='fraction'?fraction:part.value).join('');
}
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica'}).format(new Date());
let catalog=[],canWrite=false,view='',offset=0,version=0,balance=[],asada='',draftId=crypto.randomUUID(),reversalId,original;

function notice(message){$('message').textContent=message;}
async function api(action,{data,query={}}={}){
  const options=data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({asada,...data})}:{};
  const resp=await fetch('/api/cras-'+action+'?'+new URLSearchParams({asada,...query}),options);
  const result=await resp.json();
  if(!resp.ok) throw new Error(result.error||'No fue posible completar la operación.');
  return result;
}
const options=(items,initial='')=>initial+items.map(([key,label])=>'<option value="'+escape(key)+'">'+escape(label)+'</option>').join('');
function cents(value){
  const normalized=value.trim().replace(',','.');
  if(!normalized) return '0';
  if(!/^\d{1,12}(?:\.\d{1,2})?$/.test(normalized)) throw new Error('Ingrese un monto positivo con hasta dos decimales.');
  const [whole,fraction='']=normalized.split('.');
  return (BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'))).toString();
}
function lines(){
  return [...$('entry-lines').querySelectorAll('fieldset')].map(group=>{
    const field=name=>group.querySelector('[data-field="'+name+'"]').value;
    return {account:field('account'),service:field('service'),stage:field('stage'),system:field('system'),
      justification:field('justification'),debit:cents(field('debit')),credit:cents(field('credit'))};
  });
}
function totals(){
  try{
    const sums=lines().reduce(([d,c],l)=>[d+BigInt(l.debit),c+BigInt(l.credit)],[0n,0n]);
    $('entry-totals').textContent='Debe ₡'+money(sums[0])+' · Haber ₡'+money(sums[1])+' · Diferencia ₡'+money(sums[0]-sums[1]);
  }catch(error){$('entry-totals').textContent=error.message;}
}
function accountOptions(kind){
  return options(catalog.filter(a=>!a.review&&(kind==='orden'?a.code.startsWith('6'):kind==='apertura'?/^[123]/.test(a.code):!a.code.startsWith('6')))
    .map(a=>[a.code,a.code+' · '+a.name]),'<option value="">Seleccione</option>');
}
function line(){
  if($('entry-lines').children.length>=100) return;
  const group=document.createElement('fieldset');
  group.innerHTML='<legend>Línea contable</legend><label>Cuenta <select data-field="account" required>'+accountOptions($('kind').value)+'</select></label>'
    +'<label>Servicio <select data-field="service" required><option value="">Seleccione cuenta</option></select></label>'
    +'<label>Etapa <input data-field="stage" maxlength="80"></label><label>Sistema <input data-field="system" maxlength="80"></label>'
    +'<label>Debe ₡ <input data-field="debit" inputmode="decimal"></label><label>Haber ₡ <input data-field="credit" inputmode="decimal"></label>'
    +'<label>Justificación <input data-field="justification" maxlength="250"></label><button type="button">Quitar línea</button>';
  const select=group.querySelector('[data-field="account"]');
  select.addEventListener('change',()=>{
    const allowed=catalog.find(a=>a.code===select.value)?.services||[];
    group.querySelector('[data-field="service"]').innerHTML=options(allowed.map(key=>[key,services[key]]),'<option value="">Seleccione</option>');
  });
  group.querySelector('button').addEventListener('click',()=>{
    if($('entry-lines').children.length>2){group.remove();totals();}
  });
  group.addEventListener('input',totals);
  $('entry-lines').append(group);
}
function clearEntry(){
  $('entry-form').reset();
  $('entry-date').value=today();
  $('entry-lines').replaceChildren();
  draftId=crypto.randomUUID();
  line();line();totals();
}
const exampleAccounts={
  bank:'Bancos', receivable:'Cuentas por cobrar', equipment:'Propiedad, planta y equipo',
  accumulated:'Depreciación acumulada', payable:'Cuentas por pagar a proveedores',
  loan:'Préstamo por pagar', capital:'Patrimonio inicial', revenue:'Ingresos por servicio de agua',
  expense:'Gasto de mantenimiento', depreciation:'Gasto de depreciación'
};

function financialExample(settleInvoice) {
  const entries=[
    ['01/01','Saldos de apertura',[['bank',2000000],['equipment',1000000]],[['capital',3000000]]],
    ['05/01','Facturación del servicio de agua',[['receivable',900000]],[['revenue',900000]]],
    ['10/01','Cobro de recibos a abonados',[['bank',650000]],[['receivable',650000]],'operating'],
    ['13/01','Factura de mantenimiento a crédito',[['expense',300000]],[['payable',300000]]],
    ['16/01','Pago parcial al proveedor',[['payable',200000]],[['bank',200000]],'operating'],
    ['20/01','Compra de equipo al contado',[['equipment',400000]],[['bank',400000]],'investing'],
    ['24/01','Desembolso de préstamo',[['bank',500000]],[['loan',500000]],'financing'],
    ['31/01','Depreciación del mes',[['depreciation',50000]],[['accumulated',50000]]]
  ];
  if(settleInvoice) entries.splice(7,0,
    ['28/01','Pago del saldo al proveedor',[['payable',100000]],[['bank',100000]],'operating']);

  const balances=Object.fromEntries(Object.keys(exampleAccounts).map(key=>[key,0]));
  const flows={operating:0,investing:0,financing:0};
  let openingCash=0;
  for(const [index,[, , debits, credits, activity]] of entries.entries()) {
    for(const [account,amount] of debits) balances[account]+=amount;
    for(const [account,amount] of credits) balances[account]-=amount;
    const cash=[debits,credits].map(lines=>lines.reduce((sum,[key,amount])=>sum+(key==='bank'?amount:0),0));
    const movement=cash[0]-cash[1];
    if(index===0) openingCash=movement;
    if(activity) flows[activity]+=movement;
  }
  const b=balances;
  const expenses=b.expense+b.depreciation;
  const result=-b.revenue-expenses;
  const assets=b.bank+b.receivable+b.equipment+b.accumulated;
  const liabilities=-b.payable-b.loan;
  const equity=-b.capital+result;
  const cashChange=flows.operating+flows.investing+flows.financing;
  return {entries,b,flows,openingCash,expenses,result,assets,liabilities,equity,cashChange};
}

function renderExample() {
  const {entries,b,flows,openingCash,expenses,result,assets,liabilities,equity,cashChange}=financialExample($('example-settle').checked);
  const currency=value=>'₡'+format.format(value);
  const render=(id,rows)=>{$(id).innerHTML=table(['Concepto','Monto'],rows.map(([label,value])=>[label,currency(value)]));};
  render('example-position',[
    ['Bancos',b.bank],['Cuentas por cobrar',b.receivable],['Propiedad, planta y equipo',b.equipment],
    ['Depreciación acumulada',b.accumulated],['Total activos',assets],['Cuentas por pagar a proveedores',-b.payable],
    ['Préstamo por pagar',-b.loan],['Total pasivos',liabilities],['Total patrimonio',equity],['Pasivos más patrimonio',liabilities+equity]
  ]);
  render('example-results',[
    ['Ingresos por servicio de agua',-b.revenue],['Gasto de mantenimiento',b.expense],
    ['Gasto de depreciación',b.depreciation],['Total gastos',expenses],['Excedente del mes',result]
  ]);
  render('example-cash',[
    ['Efectivo inicial',openingCash],['Flujo de operación',flows.operating],['Flujo de inversión',flows.investing],
    ['Flujo de financiamiento',flows.financing],['Variación neta de efectivo',cashChange],['Efectivo final',openingCash+cashChange]
  ]);
  render('example-equity',[
    ['Patrimonio inicial',-b.capital],['Excedente del mes',result],['Patrimonio final',equity]
  ]);
  const describe=lines=>lines.map(([account,value])=>exampleAccounts[account]+' · '+currency(value)).join(' + ');
  $('example-journal').innerHTML=table(['Fecha','Asiento','Debe','Haber'],
    entries.map(([date,description,debits,credits])=>[date,description,describe(debits),describe(credits)]));
  $('example-check').textContent='Al cierre, activos: '+currency(assets)+' · Pasivos más patrimonio: '+currency(liabilities+equity)
    +' · Saldo pendiente con el proveedor: '+currency(-b.payable);
}

$('example-settle').addEventListener('change',renderExample);

function show(name){
  view=name; offset=0;
  for(const button of document.querySelectorAll('[data-view]')){
    const selected=button.dataset.view===name;
    $(button.dataset.view).hidden=!selected;
    button.setAttribute('aria-current',String(selected));
  }
  $('range').hidden=!['diary','balance','periods'].includes(name);
  if(name==='example') renderExample();
  refresh();
}
function renderCatalog(){
  const find=$('search-catalog').value.toLocaleLowerCase('es-CR').trim();
  $('catalog-output').innerHTML=catalog.filter(x=>(x.code+' '+x.name).toLocaleLowerCase('es-CR').includes(find)).map(x=>{
    const details=x.details.map(d=>'<p><strong>'+escape(d.title)+'</strong> · Código declarado '+escape(d.declared)+'</p><p>'+escape(d.description)+'</p><p>'+escape(d.nature)+'</p><p>'+escape(d.file)+'</p>'
      +d.warnings.map(w=>'<p class="cras-notice">'+escape(w)+'</p>').join('')).join('');
    return '<details><summary>'+escape(x.code+' · '+x.name+(x.review?' · Por verificar':''))+'</summary>'+details+'</details>';
  }).join('')||'<p>No se encontraron cuentas.</p>';
}
const table=(headers,rows)=>rows.length?'<table><thead><tr>'+headers.map(h=>'<th scope="col">'+escape(h)+'</th>').join('')+'</tr></thead><tbody>'
  +rows.map(row=>'<tr>'+row.map(cell=>'<td>'+escape(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p>Sin movimientos para el filtro seleccionado.</p>';
function reportRows(){
  const service=$('service-filter').value;
  return balance.filter(row=>!service||service===row.service).map(row=>{
    const account=catalog.find(x=>x.code===row.account);
    const opening=BigInt(row.opening),debit=BigInt(row.debit),credit=BigInt(row.credit);
    return [row.account,account?.name||'',services[row.service],row.stage,row.system_name,money(opening),money(debit),money(credit),money(opening+debit-credit)];
  });
}
const balanceHeaders=['Código','Cuenta','Servicio','Etapa','Sistema','Saldo inicial','Debe','Haber','Saldo final'];
function renderBalance(){
  const rows=reportRows();
  $('balance-output').innerHTML=table(balanceHeaders,rows);
  $('export').disabled=!rows.length;
  const active=$('service-filter').value;
  const totals=balance.filter(r=>!active||r.service===active).reduce(([d,c],r)=>[d+BigInt(r.debit),c+BigInt(r.credit)],[0n,0n]);
  $('balance-totals').textContent='Movimientos del rango · Debe ₡'+money(totals[0])+' · Haber ₡'+money(totals[1])+' · Neto ₡'+money(totals[0]-totals[1]);
}
function renderDiary({entries,hasMore}){
  $('diary-heading').textContent=$('ledger-account').value?'Mayor auxiliar de la cuenta':'Libro diario';
  $('diary-output').innerHTML=entries.map(e=>'<details><summary>#'+escape(e.entry_no)+' · '+escape(e.entry_date)+' · '+escape(e.kind)+' · '+escape(e.reference)
    +'</summary><p>'+escape(e.memo)+'</p><div class="cras-scroll">'
    +table(['Cuenta','Servicio','Etapa','Sistema','Debe','Haber','Justificación'],e.cras_lines.map(l=>[l.account,services[l.service],l.stage,l.system_name,money(l.debit),money(l.credit),l.justification]))
    +'</div>'+((canWrite&&!e.reverses)?'<button type="button" data-reverse="'+escape(e.id)+'">Revertir</button>':'')+'</details>').join('')||'<p>Sin asientos.</p>';
  $('more').hidden=!hasMore;
  $('first').hidden=!offset;
  for(const button of $('diary-output').querySelectorAll('[data-reverse]')){
    button.addEventListener('click',()=>{
      original=entries.find(e=>e.id===button.dataset.reverse);
      reversalId=crypto.randomUUID();
      $('reverse-number').textContent='#'+original.entry_no;
      $('reverse-date').value=today();
      $('reverse-reason').value='';
      $('reversal').showModal();
    });
  }
}
async function refresh(){
  const request=++version;
  const target={diary:'diary-output',balance:'balance-output',periods:'periods-output'}[view];
  if(view==='catalog') renderCatalog();
  if(!target) return;
  $(target).textContent='';
  if(view==='balance'){balance=[];$('export').disabled=true;$('balance-totals').textContent='';}
  if(view==='diary'){$('more').hidden=true;$('first').hidden=true;}
  if(!asada) return;
  const requested=view;
  notice('Consultando…');
  try{
    const result=await api(requested,{query:{from:$('from').value,to:$('to').value,offset,account:$('ledger-account').value}});
    if(request!==version) return;
    if(requested==='diary') renderDiary(result);
    if(requested==='balance'){balance=result.rows;renderBalance();}
    if(requested==='periods') $(target).innerHTML=table(['Mes','Fecha de cierre'],result.periods.map(p=>[p.month.slice(0,7),new Date(p.closed_at).toLocaleString('es-CR',{timeZone:'America/Costa_Rica'})]));
    notice('');
  }catch(error){if(request===version) notice(error.message);}
}
function submit(id,action){
  $(id).addEventListener('submit',async event=>{
    event.preventDefault();
    if(!asada){notice('Seleccione una ASADA.');return;}
    const button=event.currentTarget.querySelector('[type=submit]');
    button.disabled=true;$('asada').disabled=true;
    try{await action();}catch(error){notice(error.message);}
    finally{button.disabled=false;$('asada').disabled=false;}
  });
}
submit('entry-form',async()=>{
  const result=await api('post',{data:{id:draftId,date:$('entry-date').value,kind:$('kind').value,
    reference:$('reference').value,memo:$('memo').value,lines:lines()}});
  clearEntry();notice('Asiento contabilizado #'+result.number+'.');
});
submit('reverse-form',async()=>{
  const result=await api('post',{data:{id:reversalId,date:$('reverse-date').value,reverses:original.id,
    reference:'Reversión #'+original.entry_no,memo:$('reverse-reason').value}});
  $('reversal').close();await refresh();notice('Reversión contabilizada #'+result.number+'.');
});
submit('close-form',async()=>{
  const month=$('month').value;
  if(!window.confirm('¿Cerrar el mes '+month+'? Se bloquearán sus registros contables.')) return;
  await api('close',{data:{month:month+'-01'}});
  await refresh();notice('Mes '+month+' cerrado.');
});
$('cancel-reverse').addEventListener('click',()=>$('reversal').close());
$('add-line').addEventListener('click',line);
$('kind').addEventListener('change',()=>{
  for(const select of $('entry-lines').querySelectorAll('[data-field="account"]')){
    select.innerHTML=accountOptions($('kind').value);
    select.dispatchEvent(new Event('change'));
  }
});
$('asada').addEventListener('change',()=>{
  asada=$('asada').value;clearEntry();offset=0;notice('');refresh();
});
$('range').addEventListener('submit',event=>{event.preventDefault();offset=0;refresh();});
$('ledger-account').addEventListener('change',()=>{offset=0;refresh();});
$('service-filter').addEventListener('change',renderBalance);
$('search-catalog').addEventListener('input',renderCatalog);
$('more').addEventListener('click',()=>{offset+=50;refresh();});
$('first').addEventListener('click',()=>{offset=0;refresh();});
$('export').addEventListener('click',()=>{
  const cell=value=>{
    const text=String(value);
    const safe=/^\s*[=+@]|^\s*-\D|^[\t\r\n]/.test(text) ? "'"+text : text;
    return '"'+safe.replaceAll('"','""')+'"';
  };
  const csv=[balanceHeaders,...reportRows()].map(row=>row.map(cell).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='Balanza-'+$('from').value+'-'+$('to').value+'.csv';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
for(const button of document.querySelectorAll('[data-view]')) button.addEventListener('click',()=>{notice('');show(button.dataset.view);});
try{
  const config=await api('config');
  catalog=config.catalog;canWrite=config.canWrite;
  $('asada').innerHTML=options(config.asadas.map(a=>[a.id,a.name]),'<option value="">Seleccione</option>');
  if(config.asadas.length===1) $('asada').value=config.asadas[0].id;
  asada=$('asada').value;
  $('service-filter').innerHTML=options(Object.entries(services),'<option value="">Todos los servicios</option>');
  $('ledger-account').innerHTML=options(catalog.map(a=>[a.code,a.code+' · '+a.name]),'<option value="">Todas las cuentas</option>');
  $('from').value=today().slice(0,4)+'-01-01';$('to').value=today();
  $('month').value=today().slice(0,7);
  document.querySelector('[data-view="entry"]').hidden=!canWrite;
  $('close-form').hidden=!config.canClose;
  clearEntry();$('workspace').hidden=false;show(canWrite?'entry':'diary');
}catch(error){notice(error.message);}
