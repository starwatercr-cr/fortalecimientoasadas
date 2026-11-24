export function buildSubscriberPDF({name,scope,filenames,threshold,increase,category,subscriber,comments,analysis,rows,view,adjustments=[],metric='consumption'}){
 if(!window.jspdf?.jsPDF||!window.AsadaDiagnosticFonts)throw Error('No se pudo cargar el generador PDF. Actualice la página.');
 const num=n=>Number(n).toLocaleString('es-CR',{maximumFractionDigits:2}),money=n=>'₡'+num(n),doc=new window.jspdf.jsPDF({unit:'mm',format:'letter',compress:true});
 for(const [style,key] of [['normal','regular'],['bold','bold']]){doc.addFileToVFS('Abonados-'+style+'.ttf',window.AsadaDiagnosticFonts[key]);doc.addFont('Abonados-'+style+'.ttf','Abonados',style);}
 const ink=[16,62,85],teal=[8,127,140],grey=[75,99,111],width=175;
 let y=Math.max(22,window.SWLetterhead?.pdf(doc)||0);
 const font=(size,bold=false,color=ink)=>{doc.setFont('Abonados',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);};
 function next(){doc.addPage();font(9,true,teal);doc.text('STAR WATER  /  ANÁLISIS DE ABONADOS',20,15);y=25;}
 const room=h=>{if(y+h>252)next();};
 function text(s,size=10,bold=false,color=ink){font(size,bold,color);for(const line of doc.splitTextToSize(String(s),width)){room(5);font(size,bold,color);doc.text(line,20,y);y+=5;}y+=2;}
 function heading(s){room(16);y+=3;text(s,13,true,teal);}
 text('Informe de abonados',22,true);text(name,12,true);text(scope,9,false,grey);
 const m=analysis.metrics;
 if(m){
  const cards=[['Abonados con registro',num(m.subscribers)],['Consumo del mes',num(m.consumption)+' m³'],['Monto facturado',m.billedCount?money(m.billed):'Sin dato'],['Aumentos para revisar',num(analysis.rising.length)]];
  const cardLines=cards.map(([label,value])=>{
   font(7.3,false,grey);const labels=doc.splitTextToSize(label,36);
   font(10,true);const values=doc.splitTextToSize(value,36);
   return {labels,values};
  });
  const cardHeight=Math.max(20,...cardLines.map(c=>6+c.labels.length*4+c.values.length*5));
  room(cardHeight+7);
  cardLines.forEach(({labels,values},i)=>{
   const x=20+i*44;doc.setFillColor(234,246,247);doc.roundedRect(x,y,42,cardHeight,2,2,'F');
   font(7.3,false,grey);labels.forEach((l,j)=>doc.text(l,x+3,y+5+j*4));
   font(10,true);values.forEach((v,j)=>doc.text(v,x+3,y+6+labels.length*4+j*5));
  });y+=cardHeight+7;
 }
 const measures={consumption:'Consumo mensual (m³)',billed:'Facturación mensual (₡)',paid:'Monto pagado registrado (₡)'};
 const months=analysis.months.filter(m=>metric==='consumption'||m[metric+'Count']).slice(-12);
 if(months.length>=2){
  room(78);heading(measures[metric]||measures.consumption);
  const low=Math.min(0,...months.map(m=>m[metric])),high=Math.max(0,...months.map(m=>m[metric])),range=high-low||1,top=y+5,bottom=y+45;
  const pos=v=>bottom-(v-low)/range*40;
  for(const v of [...new Set([low,0,high])]){doc.setDrawColor(208,225,230);doc.line(45,pos(v),195,pos(v));font(7,false,grey);doc.text(num(v),43,pos(v)+1,{align:'right'});}
  const slot=150/months.length;
  months.forEach((m,i)=>{const x=45+slot*(i+.5),a=pos(m[metric]),b=pos(0);doc.setFillColor(...teal);if(a!==b)doc.rect(x-Math.min(5,slot/3),Math.min(a,b),Math.min(10,slot*2/3),Math.abs(a-b),'F');font(7,false,grey);doc.text(m.period.slice(2),x,bottom+6,{align:'center'});});y=bottom+13;
  text('Hasta 12 meses con datos para la medida seleccionada.',8,false,grey);
 }
 heading('Hallazgos y criterios de revisión');
 if(m)text('Consumo alto: más de '+threshold+' m³. Aumento mínimo: '+increase+' %. Categoría: '+(category||'Todas')+' · Abonado: '+(subscriber||'Todos')+'.',9);
 for(const p of comments)text(p,9);
 if(analysis.rising.length){heading('Aumentos que requieren revisión');for(const r of analysis.rising.slice(0,10))text(r.subscriber+' · '+num(r.previous)+' → '+num(r.consumption)+' m³ · +'+num(r.delta)+' m³'+(r.pct===null?'': ' (+ '+num(r.pct)+' %)'),9,true,[153,32,32]);if(analysis.rising.length>10)text('Se muestran los 10 mayores aumentos. Consulte el filtro de aumentos para exportar el resto.',8,false,grey);}
 if(rows.length){heading('Detalle del filtro: '+view);for(const r of rows)text(r.subscriber+' · '+(r.name||'Nombre no incluido')+' · '+num(r.consumption)+' m³ · '+(r.billedCount?money(r.billed)+' facturados':'Facturación sin dato')+(r.previous!==undefined?' · Anterior: '+num(r.previous)+' m³':''),9);}
 if(adjustments.length){
  heading('Ajustes de facturación · MAC-16');text(adjustments.length+' líneas; '+adjustments.filter(a=>a.linked).length+' vinculadas con una factura cargada. Se muestran por separado.',9);
  const labels=['Fijo acueducto','Medido acueducto','Fijo alcantarillado','Medido alcantarillado','Hidrantes','Recurso hídrico','IVA'];
  for(const a of adjustments){const amounts=a.amounts.map((n,i)=>n?labels[i]+': '+money(n):'').filter(Boolean).join(' · ');text([a.period,'Factura '+a.invoice,'Abonado '+a.subscriber,a.motive,a.rubric,amounts,a.linked?'Vinculada':'Sin vínculo'].filter(Boolean).join(' · '),9);}
 }
 heading('Fuentes y alcance');text('Archivos: '+filenames.join(', '),9);
 text('Facturación y pagos son medidas distintas. Un aumento de consumo orienta la revisión de la lectura y no confirma una fuga.',9,false,grey);
 const pages=doc.getNumberOfPages();
 for(let i=1;i<=pages;i++){doc.setPage(i);doc.setDrawColor(208,225,230);doc.line(20,263,195,263);font(8,false,grey);doc.text('Star Water · Informe de abonados',20,269);doc.text(i+' / '+pages,195,269,{align:'right'});}
 return doc;
}
