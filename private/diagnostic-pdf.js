(()=>{
'use strict';
window.buildDiagnosticPDF=function({meta,result:r,notes={},signature=null}){
 if(!window.jspdf?.jsPDF)throw Error('No se pudo cargar el generador PDF. Actualice la página e intente nuevamente.');
 const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
 if(!window.AsadaDiagnosticFonts)throw Error('No se cargó la tipografía del informe. Actualice e intente nuevamente.');
 for(const [style,key] of [['normal','regular'],['bold','bold']]){const name='Diagnostic-'+style+'.ttf';doc.addFileToVFS(name,window.AsadaDiagnosticFonts[key]);doc.addFont(name,'Diagnostic',style);}
 doc.setProperties({title:'Diagnóstico de la ASADA - '+meta.asada,author:meta.evaluator,subject:'Evaluación orientativa de prácticas de gestión'});
 const C={ink:[23,52,68],muted:[87,108,121],teal:[8,111,135],pale:[235,246,248],line:[214,229,235],warn:[156,92,43]},x=18,w=174,bottom=271;let y=30;
 const clean=t=>String(t??'').replace(/[\u2010-\u2015]/g,'-').replace(/[^\x20-\x7e\xa0-\xff\n]/g,'');
 const header=()=>{if(doc.getNumberOfPages()===1&&window.SWLetterhead?.get())return;doc.setFillColor(...C.teal);doc.rect(0,0,210,16,'F');doc.setFont('Diagnostic','bold');doc.setFontSize(10);doc.setTextColor(255,255,255);doc.text('DIAGNÓSTICO DE LA ASADA',x,10);doc.setTextColor(...C.muted);doc.setFont('Diagnostic','normal');doc.setFontSize(8);const label=clean(meta.asada);doc.text(doc.splitTextToSize(label,w)[0],x,23);};
 header();y=Math.max(y,window.SWLetterhead?.pdf(doc)||0);
 const page=()=>{doc.addPage();header();y=32;};
 const need=h=>{if(y+h>bottom)page();};
 const para=(text,size=10,bold=false,color=C.ink,gap=3)=>{doc.setFont('Diagnostic',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);const lines=doc.splitTextToSize(clean(text),w);const step=size*.47;for(const line of lines){need(step+2);doc.setFont('Diagnostic',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(line,x,y);y+=step;}y+=gap;};
 const title=t=>{need(24);para(t,14,true,C.teal);y+=2;};
 const detail=(label,value)=>para(label+': '+(value||'Sin indicar'),10,false);
 const score=s=>s===null?'Sin valoración':s+' / 100';
 title('Informe de evaluación y prioridades de mejora');
 detail('ASADA',meta.asada);detail('Fecha de evaluación',meta.date);detail('Perspectiva',meta.role);detail('Realiza la evaluación',meta.evaluator);detail('Función de quien evalúa',meta.evaluatorRole);detail('Persona entrevistada',meta.interviewee);detail('Función de la persona entrevistada',meta.intervieweeRole);
 need(34);doc.setFillColor(...C.pale);doc.roundedRect(x,y,w,28,3,3,'F');doc.setTextColor(...C.teal);doc.setFont('Diagnostic','bold');doc.setFontSize(22);doc.text(score(r.score),x+6,y+12);doc.setFontSize(10);doc.text(clean(r.status+(r.provisional?' - provisional':'')),x+6,y+21);y+=37;
 title('Lectura general');para(r.narrative);
 para(r.known+' preguntas valoradas, '+r.unknown+' pendientes de verificar y '+r.na+(r.na===1?' no aplicable con explicación.':' no aplicables con explicación.')+' Cobertura: '+r.coverage+' % de las preguntas aplicables.',10,true);
 title('Alcance y forma de interpretar el resultado');para('Esta evaluación recoge las prácticas reportadas durante la entrevista. No constituye una auditoría ni certifica cumplimiento. Las observaciones deben contrastarse con documentos, registros y la experiencia del equipo antes de tomar decisiones.');
 para('Cada respuesta valorada recibe 0, 1, 2 o 3 puntos según el nivel descrito. El resultado de 0 a 100 corresponde a los puntos obtenidos divididos entre el máximo de las preguntas valoradas. Todas las preguntas tienen el mismo peso. No tengo información y No aplica se excluyen del puntaje; las respuestas no aplicables requieren explicación.');
 para('La cobertura indica qué proporción de las preguntas aplicables pudo valorarse. Si queda información pendiente, el resultado es provisional. Un cero en una respuesta valorada describe la práctica seleccionada; no se usa para castigar la falta de información.');
 page();title('Gráfico de resultados por área');para('Escala de 0 a 100. La puntuación representa lo reportado; revise también la cobertura de cada área.',9,false,C.muted);
 for(const a of r.areas){need(19);doc.setFont('Diagnostic','bold');doc.setFontSize(10);doc.setTextColor(...C.ink);doc.text(clean((a.index+1)+'. '+a.short),x,y);doc.text(score(a.score),x+w,y,{align:'right'});y+=4;doc.setFillColor(...C.pale);doc.rect(x,y,w,4,'F');if(a.score!==null&&a.score>0){doc.setFillColor(...(a.score<50?C.warn:C.teal));doc.rect(x,y,w*a.score/100,4,'F');}y+=8;doc.setFont('Diagnostic','normal');doc.setFontSize(8);doc.setTextColor(...C.muted);doc.text(a.known+' valoradas / '+a.unknown+' por verificar / '+a.na+' no aplicables / cobertura '+a.coverage+' %',x,y);y+=8;}
 para('Lectura orientativa: menos de 50, atención prioritaria; de 50 a 79, en desarrollo; desde 80, buena base reportada. Sin valoración significa que no hubo respuestas puntuables para esa área.',9,false,C.muted);
 page();title('Observaciones por área');
 for(const a of r.areas){title((a.index+1)+'. '+a.name);para(score(a.score)+' - '+a.status+' - Cobertura '+a.coverage+' %',10,true);const qs=r.rows.filter(q=>q.areaIndex===a.index),low=qs.filter(q=>q.known&&q.score<3).sort((a,b)=>a.score-b.score).slice(0,2);
  para(a.score===null?'Hace falta reunir información para valorar esta área. Revisen las preguntas y sus respaldos con las personas responsables.':a.score<50?'En esta área se reportan prácticas que necesitan organización y acompañamiento. Conviene empezar por los aspectos de menor desarrollo.':a.score<80?'Hay avances que pueden sostenerse y prácticas que todavía requieren mayor consistencia. Definan tareas concretas y revisen su aplicación.':'Se reporta una buena base de prácticas. Confirmen sus respaldos y mantengan la revisión para sostenerlas.');
  for(const q of low)para('Acción sugerida: '+q.action,9);
  if(a.unknown)para('Pendiente: verificar '+a.unknown+' preguntas de esta área. La falta de información no demuestra que una práctica no se realice.',9,false,C.muted);
  if(a.na)para((a.na===1?'Se excluyó 1 pregunta no aplicable; su explicación aparece en el anexo.':'Se excluyeron '+a.na+' preguntas no aplicables; su explicación aparece en el anexo.'),9,false,C.muted);
  if(String(notes[a.index]||'').trim())para('Observaciones de la entrevista: '+notes[a.index],9);
 }
 page();title('Plan inicial de mejora para acordar con el equipo');para('Las siguientes acciones se sugieren a partir de las respuestas con menor puntuación. La Junta y la administración deberán valorar su prioridad y acordar responsables, plazos y recursos.');
 if(!r.priorities.length)para('Mantener las prácticas reportadas y revisar sus evidencias. Si hay información pendiente, organizar primero su verificación.');
 for(const [i,q] of r.priorities.entries()){need(40);para((i+1)+'. '+q.action,11,true);para('Área: '+r.areas[q.areaIndex].name,9);para('Punto de partida: '+q.answer,9);para('Responsable: ____________________  Plazo: ____________________',9);para('Seguimiento o respaldo acordado: ______________________________',9);y+=2;}
 title('Información pendiente de verificar');if(!r.verify.length)para('Todas las preguntas aplicables tienen una respuesta valorada. Esto no reemplaza la revisión de sus respaldos.');else for(const q of r.verify)para(q.id.toUpperCase()+' - '+q.text,9);
 page();title('Anexo - Respuestas de la evaluación');para('Se conserva la opción elegida para cada pregunta, incluyendo las explicaciones de No aplica. Los datos corresponden a lo reportado por las personas participantes.',9,false,C.muted);
 for(const a of r.areas){title((a.index+1)+'. '+a.name);for(const q of r.rows.filter(q=>q.areaIndex===a.index)){need(25);para(q.id.toUpperCase()+' - '+q.text,9,true,C.ink,1);para('Respuesta: '+q.answer,9,false,C.ink,1);if(q.known)para('Puntuación: '+q.score+' de 3.',8,false,C.muted,3);}}
 page();title('Participantes y firma');para('La firma deja constancia de la participación en la entrevista y de la información reportada. No implica una certificación del cumplimiento de la ASADA.');
 detail('ASADA',meta.asada);detail('Fecha de evaluación',meta.date);detail('Persona que realiza la evaluación',meta.evaluator);detail('Función',meta.evaluatorRole);need(24);y+=14;doc.setDrawColor(...C.line);doc.line(x,y,x+100,y);y+=7;para('Firma de quien realiza la evaluación (para completar, si corresponde).',9,false,C.muted);
 y+=8;detail('Persona entrevistada',meta.interviewee);detail('Función',meta.intervieweeRole);need(50);
 if(signature){doc.addImage(signature,'PNG',x,y,120,32);y+=36;}else{y+=30;para('Firma pendiente: espacio para completar en el documento impreso.',9,false,C.muted);}
 doc.setDrawColor(...C.line);doc.line(x,y,x+120,y);y+=7;para('Firma de la persona entrevistada.',9,true);para(signature?'Se incorporó una firma dibujada en pantalla. No es una firma digital certificada.':'No se incorporó una firma en pantalla.',8,false,C.muted);
 const count=doc.getNumberOfPages();for(let n=1;n<=count;n++){doc.setPage(n);doc.setDrawColor(...C.line);doc.line(x,280,x+w,280);doc.setFont('Diagnostic','normal');doc.setFontSize(8);doc.setTextColor(...C.muted);doc.text('Evaluación orientativa - Prácticas reportadas',x,286);doc.text(n+' / '+count,x+w,286,{align:'right'});}
 return doc;
};
})();
