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
let balancePeriod;
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
  const currency=value=>'₡'+format.format(value || 0);
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
  const trial=Object.fromEntries(Object.keys(exampleAccounts).map(key=>[key,{opening:0,debit:0,credit:0}]));
  entries.forEach(([, ,debits,credits],index)=>{
    for(const [account,value] of debits) trial[account][index===0?'opening':'debit']+=value;
    for(const [account,value] of credits) {
      if(index===0) trial[account].opening-=value;
      else trial[account].credit+=value;
    }
  });
  $('example-trial').innerHTML=table(['Cuenta','Saldo inicial','Debe','Haber','Saldo final'],
    Object.entries(trial).map(([key,{opening,debit,credit}])=>[exampleAccounts[key],...[opening,debit,credit,b[key]].map(currency)]));
  render('example-equity',[
    ['Patrimonio inicial',-b.capital],['Excedente del mes',result],['Patrimonio final',equity]
  ]);
  const describe=lines=>lines.map(([account,value])=>exampleAccounts[account]+' · '+currency(value)).join(' + ');
  $('example-journal').innerHTML=table(['Fecha','Asiento','Debe','Haber'],
    entries.map(([date,description,debits,credits])=>[date,description,describe(debits),describe(credits)]));
  $('example-assets').textContent=currency(assets);
  $('example-surplus').textContent=currency(result);
  $('example-ending-cash').textContent=currency(openingCash+cashChange);
  $('example-check').textContent='Saldo pendiente con el proveedor: '+currency(-b.payable);
}

$('example-settle').addEventListener('change',renderExample);
$('example-report-select').addEventListener('change',event=>{
  for(const report of document.querySelectorAll('.cras-example-reports > section')){
    report.hidden=report.firstElementChild.id!==event.target.value;
  }
});

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
  $('export-pdf').disabled=!rows.length;
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
  if(view==='balance'){balance=[];$('export').disabled=true;$('export-pdf').disabled=true;$('balance-totals').textContent='';}
  if(view==='diary'){$('more').hidden=true;$('first').hidden=true;}
  if(!asada) return;
  const requested=view;
  const from=$('from').value,to=$('to').value;
  notice('Consultando…');
  try{
    const result=await api(requested,{query:{from:$('from').value,to:$('to').value,offset,account:$('ledger-account').value}});
    if(request!==version) return;
    if(requested==='diary') renderDiary(result);
    if(requested==='balance'){balancePeriod={from,to};balance=result.rows;renderBalance();}
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

function downloadReports({name,period,detail,reports,filename,cover=false}) {
  const JsPDF=window.jspdf?.jsPDF;
  if(!JsPDF){notice('El generador PDF no está disponible. Recargue la página e inténtelo de nuevo.');return;}
  const doc=new JsPDF({format:'a4',orientation:!cover&&reports[0].landscape?'landscape':'portrait'});
  const left=13;
  const clean=value=>String(value??'').replaceAll('₡','').replace(/[\u00a0\u202f]/g,' ');
  const index=[];
  if(cover){
    doc.setFont('times','bold');
    doc.setFontSize(28);
    doc.text('Estados financieros',105,110,{align:'center'});
    doc.setFontSize(17);
    doc.text(name,105,127,{align:'center'});
    doc.setFontSize(12);
    doc.text(period,105,140,{align:'center'});
    doc.text('Ejemplo con datos ficticios',105,151,{align:'center'});
    doc.addPage();
  }
  reports.forEach(({heading,rows,columns,landscape=false,notes=[]},reportIndex)=>{
    const orientation=landscape?'landscape':'portrait';
    if(reportIndex||cover) doc.addPage('a4',orientation);
    index.push([heading,doc.getNumberOfPages()]);
    const width=doc.internal.pageSize.getWidth()-2*left;
    const bottom=doc.internal.pageSize.getHeight()-18;
    const midpoint=left+width/2;
    let y;
    function page(continued=false){
      doc.setTextColor(24,47,64);
      doc.setFont('times','bold');doc.setFontSize(14);
      const nameLines=doc.splitTextToSize(clean(name),width);
      doc.text(nameLines,midpoint,17,{align:'center'});
      y=17+nameLines.length*5;
      doc.text(heading,midpoint,y,{align:'center'});
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      const description=doc.splitTextToSize(clean(period+' · Colones costarricenses'+(detail?' · '+detail:'')+(continued?' · Continuación':'')),width);
      doc.text(description,midpoint,y+5,{align:'center'});
      y+=9+description.length*4;
    }
    function row(values,header=false){
      const label=String(values[0]);
      const section=label.startsWith('§');
      const emphasis=header||section||label.startsWith('Total')||label.startsWith('Excedente')||label.startsWith('Efectivo final');
      doc.setFont('helvetica',emphasis?'bold':'normal');doc.setFontSize(8);
      const numericFrom=columns.length===9?5:columns.length===5?1:2;
      const wrapped=values.map((value,i)=>doc.splitTextToSize(clean(i===0&&section?label.slice(1):value),columns[i]-4));
      const height=Math.max(1,...wrapped.map(cell=>cell.length))*3.8+3;
      if(!header&&y+height>bottom){
        doc.addPage('a4',orientation);page(true);row(rows[0],true);
        doc.setFont('helvetica',emphasis?'bold':'normal');doc.setFontSize(8);
      }
      if(header||section){doc.setFillColor(232,240,243);doc.rect(left,y,width,height,'F');}
      if(emphasis&&!header&&!section){doc.setDrawColor(49,76,91);doc.line(left,y,left+width,y);}
      let x=left;
      wrapped.forEach((cell,i)=>{
        const right=i>=numericFrom;
        doc.text(cell,x+(right?columns[i]-2:2),y+4,{align:right?'right':'left'});
        x+=columns[i];
      });
      y+=height;
    }
    page();
    rows.forEach((values,i)=>row(values,i===0));
    if(notes.length){
      if(y+notes.length*7+34>bottom){doc.addPage('a4',orientation);page(true);}
      y+=5;
      doc.setFont('helvetica','normal');doc.setFontSize(8);
      for(const line of notes){
        const wrapped=doc.splitTextToSize(line,width);
        doc.text(wrapped,left,y);
        y+=wrapped.length*4+2;
      }
      y+=14;
      ['Presidencia','Tesorería','Contaduría'].forEach((label,i)=>{
        const x=left+(i+.5)*width/3;
        doc.line(x-21,y,x+21,y);
        doc.text(label,x,y+5,{align:'center'});
      });
    }
  });
  if(cover){
    doc.setPage(2);
    doc.setFont('times','bold');doc.setFontSize(19);
    doc.text('Contenido',left,25);
    doc.setFont('helvetica','normal');doc.setFontSize(11);
    index.forEach(([heading,page],i)=>{
      doc.text(heading,left,41+i*9);
      doc.text(String(page),197,41+i*9,{align:'right'});
    });
  }
  const pages=doc.getNumberOfPages();
  for(let n=1;n<=pages;n++){
    doc.setPage(n);doc.setFont('helvetica','normal');doc.setFontSize(8);
    const y=doc.internal.pageSize.getHeight()-8;
    doc.text('Star Water · Contabilidad Regulatoria',left,y);
    doc.text(n+' / '+pages,doc.internal.pageSize.getWidth()-left,y,{align:'right'});
  }
  doc.save(filename);
}

$('export-pdf').addEventListener('click',()=>{
  const rows=reportRows();
  if(!rows.length||!balancePeriod) return;
  downloadReports({
    name:$('asada').selectedOptions[0]?.textContent,
    period:balancePeriod.from+' al '+balancePeriod.to,
    detail:services[$('service-filter').value]||'Todos los servicios',
    reports:[{heading:'Balance de comprobación detallado',rows:[
      ['Código','Descripción','Servicio','Etapa','Sistema','Saldo anterior','Débitos','Créditos','Saldo actual'],...rows
    ],columns:[20,50,38,23,24,29,29,29,29],landscape:true}],
    filename:'Balanza-'+balancePeriod.from+'-'+balancePeriod.to+'.pdf'
  });
});

function comparativeExample(current){
  const prior={bank:2000000,equipment:1000000,openingCash:1700000,revenue:400000,expense:100000,result:300000,equity:3000000};
  const {b,flows,openingCash,result,assets,liabilities,equity,cashChange}=current;
  const amount=value=>format.format(value);
  function report(heading,data,notes){
    const rows=data.map(([label,note,now,before])=>[label,note,now==null?'':amount(now),before==null?'':amount(before)]);
    return {heading,columns:[95,17,35,37],rows:[['Concepto','Nota','Enero 2025','Enero 2024'],...rows],notes};
  }
  return [
    report('Estado de situación financiera',[
      ['§Activo corriente',''],['Efectivo y equivalentes','1',b.bank,prior.bank],['Cuentas por cobrar','1',b.receivable,0],
      ['Total activo corriente','',b.bank+b.receivable,prior.bank],['§Activo no corriente',''],
      ['Propiedad, planta y equipo neto','2',b.equipment+b.accumulated,prior.equipment],
      ['Total activos','',assets,prior.bank+prior.equipment],['§Pasivos y patrimonio',''],
      ['Cuentas por pagar a proveedores','3',-b.payable,0],['Préstamo por pagar','3',-b.loan,0],
      ['Total pasivos','',liabilities,0],['Total patrimonio','',equity,prior.equity],
      ['Total pasivos y patrimonio','',liabilities+equity,prior.equity]
    ],['1. Efectivo y cuentas por cobrar del ejercicio ficticio.','2. Equipo al costo menos depreciación acumulada.','3. Obligaciones registradas según el escenario seleccionado.']),
    report('Estado de resultados',[
      ['§Ingresos',''],['Ingresos por servicio de agua','1',-b.revenue,prior.revenue],['Total ingresos','',-b.revenue,prior.revenue],
      ['§Gastos',''],['Mantenimiento','1',b.expense,prior.expense],['Depreciación','1',b.depreciation,0],
      ['Total gastos','',b.expense+b.depreciation,prior.expense],['Excedente del período','',result,prior.result]
    ],['1. Ingresos y gastos reconocidos según los asientos del ejemplo.']),
    report('Estado de flujos de efectivo',[
      ['§Actividades de operación',''],['Excedente del período','',result,prior.result],['Depreciación','',b.depreciation,0],
      ['Aumento de cuentas por cobrar','',-b.receivable,0],['Aumento de cuentas por pagar','',-b.payable,0],
      ['Total flujo de operación','',flows.operating,prior.result],['§Actividades de inversión',''],
      ['Compra de equipo','',flows.investing,0],['§Actividades de financiamiento',''],['Desembolso de préstamo','',flows.financing,0],
      ['Variación neta de efectivo','',cashChange,prior.result],['Efectivo inicial','',openingCash,prior.openingCash],
      ['Efectivo final','',openingCash+cashChange,prior.bank]
    ],['Método indirecto. Los ajustes concilian el excedente con el flujo de operación.']),
    report('Estado de cambios en el patrimonio',[
      ['Patrimonio inicial','',-b.capital,prior.equity-prior.result],
      ['Excedente del período','',result,prior.result],['Total patrimonio al cierre','',equity,prior.equity]
    ],['Ejercicio didáctico sin otros movimientos patrimoniales.'])
  ];
}

$('example-pdf').addEventListener('click',()=>{
  const settled=$('example-settle').checked;
  const reports=comparativeExample(financialExample(settled));
  reports.push({
    heading:'Balance de comprobación detallado · Enero 2025',
    rows:[...$('example-trial').querySelectorAll('tr')].map(row=>[...row.cells].map(cell=>cell.textContent)),
    columns:[68,29,29,29,29]
  });
  downloadReports({name:'ASADA ficticia',period:'Enero 2025 y enero 2024',detail:settled?'Pago al proveedor simulado':'Saldo pendiente con el proveedor',
    reports,cover:true,filename:'Estados-financieros-ejemplo-ASADA.pdf'});
});
