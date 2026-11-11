const keys={inventory:/^inventarios$/,deferred:/^gastos diferidos$/,noncurrent:/^total (de )?activos no corrientes$/,cash:/^(efectivo y equivalentes.*|caja y? ?bancos)$/,receivables:/^cuentas por cobrar( -? ?neto)?$/,fixed:/^(total (de )?activos? fijos netos|propiedad(es)?,? planta y equipo neto)$/,other:/^total (de )?otros activos$|^otros activos$/,assets:/^total (de )?activos$/,liabilities:/^total (de )?pasivos?$/,payables:/^cuentas por pagar( a corto plazo)?$/,equity:/^total (de[l]? )?patrimonio$/,income:/^total (de )?ingresos$/,expenses:/^total (de )?gastos$/,result:/^(resultado del periodo|excedentes o perdidas del ejercicio|utilidad del periodo|utilidad neta despues imp(tos|uestos))$/};
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[,.]/g,'').trim();
const dates=s=>[...s.matchAll(/\b(\d{2})\/(\d{2})\/(20\d{2}|19\d{2})\b/g)].map(m=>m[3]+'-'+m[2]+'-'+m[1]);
export function scanStatements(pages){
 const found=[],cuts=new Set();let columns=[],section='';
 pages.forEach((lines,index)=>{
  for(const raw of lines){
   const line=raw.trim(),n=norm(line);
   if(/(estado de resultados|b ?alance general de situacion|estado de situacion financiera)\b/.test(n)){columns=[];section=n.includes('resultados')?'results':'balance';}
   if(/^(estado de (flujo|cambios)|notas a los estados|balance de comprobacion)\b/.test(n)){section='';columns=[];}
   const head=dates(line);
   if(section&&head.length){columns=head;head.forEach(d=>cuts.add(d));continue;}
   if(!section||!columns.length)continue;
   const match=[...line.matchAll(/(?:^|(?<=\s))[-−]?(?:\d{1,3}(?:[ \u00a0.]\d{3})+|\d+),\d{2}(?!\d)/g)];
   if(!match.length)continue;
   const label=line.slice(0,match[0].index).replace(/\s+\d+\.\d+(?:-\d+)?\s*$/,'').trim();
   const k=Object.keys(keys).find(k=>keys[k].test(norm(label)));
   if(!k|| (section==='balance'&&['income','expenses'].includes(k)) || (section==='results'&&!['income','expenses','result'].includes(k)))continue;
   if(columns.length>1&&match.length!==columns.length)continue;
   if(columns.length===1&&match.length!==1&&!(k==='assets'&&match.every(x=>x[0]===match[0][0])))continue;
   columns.forEach((date,i)=>found.push({key:k,date,page:index+1,label,value:Number(match[i][0].replace(/[ .\u00a0]/g,'').replace('−','-').replace(',','.'))}));
  }
 });
 for(const date of cuts){
  const items=k=>found.filter(r=>r.date===date&&r.key===k);
  const [inv,def]=['inventory','deferred'].map(items);
  if(inv.length===1&&def.length===1&&inv[0].page===def[0].page)
   found.push({...inv[0],key:'other',label:'Inventarios + Gastos Diferidos (suma)',value:Math.round((inv[0].value+def[0].value)*100)/100});
  for(const r of items('noncurrent'))found.push({...r,key:'fixed',label:r.label+' (confirme que solo incluye activos fijos netos)',review:true});
 }
 return {found,cuts:[...cuts].sort()};
}
export async function readStatement(file){
 if(!file||!file.name.toLowerCase().endsWith('.pdf')||file.size>20*1024*1024)throw Error('Seleccione un PDF de hasta 20 MB.');
 const pdfjs=await import('/vendor/abonados/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='/vendor/abonados/pdf.worker.min.mjs';
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
 try{
 const pdf=await task.promise;
 if(pdf.numPages>100)throw Error('Use un PDF de hasta 100 páginas.');
 return await extractStatement(pdf);
 }finally{await task.destroy();}
}
export async function extractStatement(pdf){
 const pages=[];
 for(let i=1;i<=pdf.numPages;i++){
  const page=await pdf.getPage(i),content=await page.getTextContent(),rows=[];
  for(const item of content.items){
   if(!item.str?.trim())continue;
   const [x,y]=item.transform.slice(4);
   let row=rows.find(r=>Math.abs(r.y-y)<2);
   if(!row){row={y,items:[]};rows.push(row);}
   row.items.push({x,text:item.str});
  }
  pages.push(rows.sort((a,b)=>b.y-a.y).map(r=>r.items.sort((a,b)=>a.x-b.x).map(t=>t.text.trim()).join(' ')));
 }
 if(!pages.some(p=>p.some(l=>/[a-záéíóú]{3}/i.test(l))))throw Error('El PDF no tiene texto seleccionable. Use el PDF original o registre los montos manualmente.');
 const data=scanStatements(pages);
 if(!data.found.length)throw Error('No se identificaron cuentas y columnas con seguridad. Revise el PDF y use la digitación manual.');
 return data;
}
