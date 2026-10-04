export const buckets=['Al día','1–30 días','31–60 días','61–90 días','Más de 90 días'];
export const headers=['codigo','abonado','factura','vencimiento','saldo','corte','telefono','correo','sector','nota'];
export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;}
export function debtKey(p){return p.code.trim().toLocaleLowerCase()+'\u001f'+p.invoice.trim().toLocaleLowerCase();}
export function age(due,cutoff){return Math.max(0,Math.round((Date.parse(cutoff+'T00:00:00Z')-Date.parse(due+'T00:00:00Z'))/86400000));}
export function bucket(days){return days===0?0:days<=30?1:days<=60?2:days<=90?3:4;}
export function arrearsView(records,cutoff,{search='',band=''}={}){
 const debts=records.filter(r=>r.kind==='debt').map(r=>({...r,days:age(r.payload.due,cutoff),band:bucket(age(r.payload.due,cutoff)),stale:r.payload.cutoff!==cutoff}));
 const q=search.trim().toLocaleLowerCase(),shown=debts.filter(r=>(!q||[r.payload.code,r.payload.name,r.payload.invoice,r.payload.sector].join(' ').toLocaleLowerCase().includes(q))&&(band===''||r.band===Number(band)));
 const cents=rs=>rs.reduce((n,r)=>n+Math.round(r.payload.balance*100),0)/100;
 const totals=buckets.map((label,i)=>({label,amount:cents(shown.filter(r=>r.band===i)),count:shown.filter(r=>r.band===i&&r.payload.balance>0).length}));
 const pending=records.filter(r=>r.kind==='promise'&&r.payload.state==='Pendiente');
 return {debts:shown.sort((a,b)=>b.days-a.days||a.payload.code.localeCompare(b.payload.code)),total:cents(shown),overdue:cents(shown.filter(r=>r.days>0)),subscribers:new Set(shown.filter(r=>r.payload.balance>0).map(r=>r.payload.code.toLocaleLowerCase())).size,totals,stale:shown.filter(r=>r.stale).length,pending:pending.length,late:pending.filter(r=>r.payload.due<cutoff).length};
}
export function importRows(rows,records){
 if(!rows.length)throw Error('El archivo no contiene filas.');
 const keys=rows[0].map(v=>String(v??'').trim().toLowerCase());
 if(new Set(keys).size!==keys.length)throw Error('Hay encabezados repetidos. Revise la primera fila.');
 for(const h of headers.slice(0,6))if(!keys.includes(h))throw Error('Falta la columna '+h+'. Use la plantilla.');
 const seen=new Set(),existing=new Map(records.filter(r=>r.kind==='debt').map(r=>[debtKey(r.payload),r])),output=[],errors=[];
 for(let i=1;i<rows.length;i++){
  if(rows[i].every(v=>v===null||v===undefined||String(v).trim()===''))continue;
  const get=h=>rows[i][keys.indexOf(h)]??'',str=h=>String(get(h)).trim(),date=h=>{const v=get(h);if(typeof v==='number')return new Date(Date.UTC(1899,11,30)+Math.round(v)*86400000).toISOString().slice(0,10);return str(h);};
  const text=str('saldo');let balance=typeof get('saldo')==='number'?get('saldo'):Number(text.replace(/\s/g,'').replace(',', '.'));
  const payload={code:str('codigo'),name:str('abonado'),invoice:str('factura'),due:date('vencimiento'),balance,cutoff:date('corte'),phone:str('telefono'),email:str('correo'),sector:str('sector'),note:str('nota')};
  let error='';if(!payload.code||!payload.name||!payload.invoice)error='Complete código, abonado y factura.';
  else if(!validDate(payload.due)||!validDate(payload.cutoff))error='Use fechas AAAA-MM-DD o fechas de Excel.';
  else if(!text||!Number.isFinite(balance)||balance<0||balance>1e12||Math.abs(balance*100-Math.round(balance*100))>0.0001)error='Saldo inválido: use número sin separador de miles y hasta dos decimales.';
  if(Object.entries({code:80,name:160,invoice:80,phone:50,email:254,sector:160,note:1500}).some(([k,max])=>payload[k].length>max))error='Algún campo supera el largo permitido. Revise código, nombre, contacto y nota.';
  const k=debtKey(payload);if(seen.has(k))error='Factura repetida para el mismo abonado.';seen.add(k);
  const old=existing.get(k);if(old&&payload.cutoff<old.payload.cutoff)error='El corte es anterior al saldo ya guardado.';
  if(old)for(const [column,field] of [['telefono','phone'],['correo','email'],['sector','sector'],['nota','note']])if(!keys.includes(column))payload[field]=old.payload[field]||'';
  if(error)errors.push({row:i+1,error});else output.push({payload,id:old?.id,version:old?.version,action:old?'Actualizar':'Agregar',row:i+1});
 }
 if(output.length+errors.length>500)throw Error('Importe hasta 500 facturas por archivo. Divida el archivo en bloques.');
 return {entries:output,errors};
}
export function parseCSV(text){
 const first=text.replace(/^\uFEFF/,'').split(/\r?\n/)[0],sep=first.includes(';')?';':',',rows=[];let row=[],v='',quote=false;
 text=text.replace(/^\uFEFF/,'');for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){v+='"';i++;}else quote=!quote;}else if(c===sep&&!quote){row.push(v);v='';}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(v);rows.push(row);row=[];v='';}else v+=c;}
 if(quote)throw Error('Revise las comillas del CSV.');if(v||row.length){row.push(v);rows.push(row);}return rows;
}
export function csv(rows){return '\uFEFF'+rows.map(r=>r.map(v=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(';')).join('\r\n');}

export const caseStates=['Pendiente','En seguimiento','Compromiso de pago','Resuelto'];
export function followupView(records,today,{search='',state=''}={}){
 const q=search.trim().toLocaleLowerCase();
 const cases=records.filter(r=>r.kind==='subscriber').map(r=>{
  const contacts=records.filter(x=>x.kind==='collection'&&x.parent_id===r.id).sort((a,b)=>b.payload.date.localeCompare(a.payload.date)||String(b.created_at||'').localeCompare(String(a.created_at||'')));
  const commitments=records.filter(x=>x.kind==='promise'&&x.parent_id===r.id);const pending=commitments.filter(x=>x.payload.state==='Pendiente');
  const next=contacts[0]?.payload.nextDate||r.payload.nextDate||'';
  const dates=[next,...pending.map(x=>x.payload.due)].filter(Boolean).sort();
  return {...r,lastContact:contacts[0]||null,contacts,commitments,nextDate:dates[0]||'',overdue:r.payload.state!=='Resuelto'&&!!dates[0]&&dates[0]<today};
 }).filter(r=>(!q||[r.payload.code,r.payload.name,r.payload.sector,r.payload.responsible].join(' ').toLocaleLowerCase().includes(q))&&(!state||r.payload.state===state));
 cases.sort((a,b)=>Number(b.overdue)-Number(a.overdue)||(a.nextDate||'9999').localeCompare(b.nextDate||'9999')||a.payload.code.localeCompare(b.payload.code));
 const ids=new Set(cases.map(r=>r.id)),commitments=records.filter(r=>r.kind==='promise'&&ids.has(r.parent_id));
 return {cases,pending:cases.filter(r=>r.payload.state!=='Resuelto').length,overdue:cases.filter(r=>r.overdue).length,commitments:commitments.filter(r=>r.payload.state==='Pendiente').length,states:caseStates.map(label=>({label,count:cases.filter(r=>r.payload.state===label).length}))};
}
