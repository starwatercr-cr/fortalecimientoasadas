export function buildAncPDF(r,asadaName,comments=[]){
 const num=n=>Number(n).toLocaleString('es-CR',{maximumFractionDigits:2});
 const doc=new window.jspdf.jsPDF({unit:'mm',format:'letter',compress:true});
 for(const [style,key] of [['normal','regular'],['bold','bold']]){
  doc.addFileToVFS('ANC-'+style+'.ttf',window.AsadaDiagnosticFonts[key]);doc.addFont('ANC-'+style+'.ttf','ANC',style);
 }
 doc.setProperties({title:'Informe de macromedición, micromedición y ANC',author:asadaName});
 const x=19,width=177,bottom=249,ink=[24,54,69],teal=[8,127,140],muted=[75,99,111];
 let y=Math.max(22,window.SWLetterhead?.pdf(doc)||0);
 function font(b=false,size=b?13:10,color=ink){doc.setFont('ANC',b?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);}
 function page(){doc.addPage();font(true,9,teal);doc.text('STAR WATER / INFORME DE ANC',x,15);y=25;}
 function room(h){if(y+h>bottom)page();}
 function text(s,b=false){font(b);const lines=doc.splitTextToSize(String(s),width);for(const l of lines){room(5);font(b);doc.text(l,x,y);y+=5;}y+=3;}
 function heading(s){room(20);text(s,true);}
 heading('Macromedición, micromedición y ANC');text(asadaName);text('Mes: '+r.payload.period+' · Lecturas: '+r.payload.start+' al '+r.payload.end);
 text(r.status+' · Responsable: '+r.payload.responsible);
 for(const [l,v] of [['Entradas independientes',r.entry],['Salidas a otros sistemas',r.exit],['Cambio de almacenamiento aplicado',r.storageDelta],['Disponible de comparación',r.available],['Facturado autorizado',r.billed],['ANC',r.anc],['Autorizado no facturado',r.payload.authorizedUnbilled],['Remanente por investigar',r.residual]])text(l+': '+num(v)+' m³');
 text('ANC: '+num(r.pct)+' % · Cobertura: '+(r.coverage===null?'Por confirmar':num(r.coverage)+' %'));
 room(53);heading('Distribución del volumen');
 const parts=[['Facturado autorizado',r.billed,[8,127,140]],['Autorizado no facturado',r.payload.authorizedUnbilled,[222,170,67]],['Remanente por investigar',r.residual,[189,103,118]]];
 let left=x;
 for(const [,v,c] of parts){const w=Math.min(x+width-left,Math.max(0,v/r.available*width));if(w>0){doc.setFillColor(...c);doc.rect(left,y,w,10,'F');left+=w;}}
 y+=17;
 for(const [label,v,c] of parts){room(6);doc.setFillColor(...c);doc.rect(x,y-3,3,3,'F');font(false,9);doc.text(label+': '+num(v)+' m³',x+6,y);y+=6;}y+=3;
 heading('Detalle de macromedidores');
 for(const m of r.payload.macros)text(m.id+' · '+m.location+' · '+({entry:'Entrada',exit:'Salida',internal:'Interno: no sumar'}[m.role])+' · '+num(m.volume)+' m³'+(m.estimated?' · Estimado':'')+' · '+m.note);
 text('Micromedición: '+r.payload.sourceLabel);heading('Observaciones');
 for(const p of comments)text(p);
 text(r.payload.note||'Sin observaciones adicionales.');text('Este balance no separa pérdidas reales y aparentes ni identifica cuánto se pierde por fugas.');
 room(25);y+=12;text('Firma: ____________________________________');
 const total=doc.getNumberOfPages();for(let i=1;i<=total;i++){doc.setPage(i);font(false,8,muted);doc.setDrawColor(208,225,230);doc.line(x,261,x+width,261);doc.text('Informe de ANC · '+r.payload.period,x,267);doc.text(i+' / '+total,x+width,267,{align:'right'});}
 return doc;
}
