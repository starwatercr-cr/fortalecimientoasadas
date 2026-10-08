import {laborParagraphs,laborVersion} from './labor-model.js';
export function buildLaborPDF(input,{draft=false}={}){
 const data=laborParagraphs(input,{draft});
 if(!globalThis.jspdf?.jsPDF||!globalThis.AsadaDiagnosticFonts)throw Error('No se cargó el generador PDF. Actualice e inténtelo de nuevo.');
 const doc=new globalThis.jspdf.jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
 for(const [style,key]of [['normal','regular'],['bold','bold']]){const name='Labor-'+style+'.ttf';doc.addFileToVFS(name,globalThis.AsadaDiagnosticFonts[key]);doc.addFont(name,'Labor',style);}
 doc.setProperties({title:(draft?'Borrador - ':'')+'Contrato laboral - '+data.c.workerName,author:data.c.asadaName,subject:data.c.templateVersion});
 const x=19,width=172,bottom=274;let y=Math.max(28,globalThis.SWLetterhead?.pdf(doc)||0);
 const header=()=>{if(doc.getNumberOfPages()===1&&globalThis.SWLetterhead?.get())return;doc.setFont('Labor','normal');doc.setFontSize(8);doc.setTextColor(25,62,72);doc.text(doc.splitTextToSize((data.c.asadaName||'ASADA')+' | Contrato laboral',width)[0],x,14);};
 const page=()=>{doc.addPage();header();y=28;};header();
 for(const [i,row]of data.paragraphs.entries()){
  if(row.pageBreak)page();
  const size=i===0?15:row.heading?11.5:10.2,step=size*.48;
  doc.setFont('Labor',row.heading?'bold':'normal');doc.setFontSize(size);
  const lines=doc.splitTextToSize(row.text,width);
  if((row.heading&&y+lines.length*step+18>bottom)||(row.signature&&y+lines.length*step+10>bottom))page();
  for(const line of lines){if(y+step>bottom)page();doc.setFont('Labor',row.heading?'bold':'normal');doc.setFontSize(size);doc.text(line,x,y);y+=step;}
  y+=row.heading?3.5:row.signature?12:3.2;
 }
 const total=doc.getNumberOfPages();for(let n=1;n<=total;n++){doc.setPage(n);doc.setFont('Labor','normal');doc.setFontSize(8);doc.text((draft?'Borrador sin firma':'Documento para revisión y firma')+' · '+laborVersion,x,286);doc.text(n+' / '+total,191,286,{align:'right'});}
 return doc;
}
export async function loadLaborPDF(){
 for(const src of ['assets/jspdf.umd.min.js','assets/diagnostic-fonts.js']){
  if(src.includes('jspdf')&&globalThis.jspdf||src.includes('fonts')&&globalThis.AsadaDiagnosticFonts)continue;
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>{script.remove();reject(Error('No se pudo cargar el generador PDF. Revise su conexión.'));};document.head.appendChild(script);});
 }
}
