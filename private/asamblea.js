'use strict';
const ASSEMBLY_TYPES={
 presidencia:{name:'Presidencia',intro:'Presentamos a la Asamblea el trabajo realizado durante el período, los avances alcanzados y los asuntos que necesitan continuidad.',fields:[
 ['achievements','Principales logros','Ejemplo: renovación de 120 metros de tubería en el sector norte.'],
 ['agreements','Acuerdos y seguimiento de la Junta','Indique decisiones relevantes, acciones ejecutadas y acuerdos pendientes.'],
 ['water','Agua y calidad del servicio','Describa aforos, análisis, continuidad del servicio y acciones realizadas.'],
 ['works','Operación, mantenimiento y proyectos','Qué se hizo, dónde, su estado y los resultados que pueden respaldar.'],
 ['community','Atención a la comunidad','Solicitudes, reclamos, reuniones y respuestas brindadas.'],
 ['difficulties','Dificultades y asuntos pendientes','Qué no se logró, por qué y qué necesita seguimiento.'],
 ['priorities','Prioridades para el próximo período','Proponga acciones concretas; distinga propuestas de acuerdos aprobados.']],
 sections:[['Gestión y principales logros','achievements'],['Acuerdos de la Junta Directiva','agreements'],['Recurso hídrico y servicio a la comunidad','water'],['Operación y proyectos','works'],['Atención a la comunidad','community'],['Dificultades y asuntos pendientes','difficulties'],['Prioridades para el próximo período','priorities']]},
 tesoreria:{name:'Tesorería',intro:'Presentamos a la Asamblea las cifras del período para explicar los ingresos, los gastos y la situación financiera de la ASADA.',fields:[
 ['sources','Documentos que respaldan las cifras','Ejemplo: estado de resultados y balance preparados por el contador; indique sus fechas.'],
 ['budget','Presupuesto y ejecución','Presupuesto aprobado, principales diferencias y explicación. No confunda presupuesto con ingresos reales.'],
 ['investments','Inversiones y financiamiento','Obras o equipos adquiridos, montos, fuentes y estado de ejecución.'],
 ['collection','Gestión de cobros y pagos','Seguimiento realizado, antigüedad de saldos si se conoce y compromisos próximos.'],
 ['priorities','Prioridades y recomendaciones','Medidas que propone Tesorería y asuntos para revisar con la administración y el contador.']],
 sections:[['Respaldo de la información','sources'],['Plan y presupuesto anual','budget'],['Inversiones y financiamiento','investments'],['Gestión de cobros y pagos','collection'],['Prioridades y recomendaciones','priorities']]},
 fiscalia:{name:'Fiscalía',intro:'Presentamos a la Asamblea las revisiones realizadas por Fiscalía, las observaciones identificadas y las recomendaciones que requieren seguimiento.',fields:[
 ['scope','Qué revisó y en qué fechas','Indique temas, período y alcance real de las revisiones.'],
 ['evidence','Documentos y respaldos consultados','Ejemplo: actas revisadas, estados financieros, comprobantes y registros específicos.'],
 ['findings','Observaciones y hallazgos','Describa el hecho, su respaldo y qué necesita aclaración. Evite afirmaciones generales sin evidencia.'],
 ['followup','Seguimiento de recomendaciones anteriores','Recomendación, respuesta recibida, avance verificado y asuntos pendientes.'],
 ['recommendations','Recomendaciones para la Junta y la administración','Acciones propuestas, responsables sugeridos y plazos.'],
 ['limitations','Información pendiente y límites de la revisión','Documentos no disponibles y temas que no se pudieron verificar.']],
 sections:[['Alcance de las revisiones','scope'],['Documentos consultados','evidence'],['Observaciones de Fiscalía','findings'],['Seguimiento realizado','followup'],['Recomendaciones','recommendations'],['Información pendiente de verificar','limitations']]}
};
const ASSEMBLY_MONEY=[['income','Ingresos del período'],['expenses','Gastos del período'],['cash','Caja y bancos'],['assets','Activos totales'],['liabilities','Pasivos totales'],['equity','Patrimonio'],['receivables','Cuentas por cobrar'],['payables','Cuentas por pagar']];
function assemblyMoney(n){return n===null?'[Pendiente de completar]':new Intl.NumberFormat('es-CR',{style:'currency',currency:'CRC',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);}
function assemblyKnown(s){return typeof s==='string'&&s.trim()!==''&&!/^no (tengo|hay|cuento con) informaci[oó]n[.]?$/i.test(s.trim());}
function assemblyDate(s){if(!s)return '[Fecha pendiente]';const p=s.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:s;}
function buildAssemblyReport(type,data){
 const cfg=ASSEMBLY_TYPES[type];if(!cfg)throw Error('Tipo de informe inválido');
 const pending=[],checks=[],sections=[];
 const value=(key,label)=>{if(assemblyKnown(data[key]))return data[key].trim();pending.push(label);return '[Pendiente de completar: '+label.toLowerCase()+']';};
 const name=value('name','Nombre de la ASADA'),author=value('author','Nombre de quien presenta');
 const period=data.start&&data.end?assemblyDate(data.start)+' al '+assemblyDate(data.end):'[Período pendiente de completar]';
 if(!data.start||!data.end)pending.push('Período del informe');if(!data.meeting)pending.push('Fecha de la asamblea');
 sections.push({title:'Presentación',text:'Estimadas personas asociadas:\n\n'+cfg.intro+' Este informe corresponde al período '+period+'.'});
 let numbers=[];let graphs=[];
 if(type==='tesoreria'){
  const n={};for(const [k,label]of ASSEMBLY_MONEY){n[k]=Number.isFinite(data[k])?data[k]:null;if(n[k]===null)pending.push(label);}
  numbers=ASSEMBLY_MONEY.map(([k,label])=>[label,n[k]]);
  const result=n.income!==null&&n.expenses!==null?n.income-n.expenses:null;
  const text=result===null?'Faltan los totales de ingresos o gastos para calcular el resultado del período.':`Durante el período se reconocieron ingresos por ${assemblyMoney(n.income)} y gastos por ${assemblyMoney(n.expenses)}. ${result>0?'La diferencia fue un excedente de '+assemblyMoney(result):result<0?'Los gastos superaron los ingresos en '+assemblyMoney(-result):'Los ingresos y los gastos fueron iguales'}. Este resultado contable debe distinguirse del dinero efectivamente cobrado y pagado.`;
  sections.push({title:'Ingresos gastos y resultado',text});
  if(result!==null)numbers.splice(2,0,['Resultado del período',result]);
  const balanceKnown=['assets','liabilities','equity'].every(k=>n[k]!==null);
  if(balanceKnown&&Math.abs(n.assets-n.liabilities-n.equity)>1)checks.push('Los activos no coinciden con la suma de pasivos y patrimonio. Confirme estas cifras con el contador antes de presentar el informe.');
  if(n.receivables!==null&&n.assets!==null&&n.receivables>n.assets)checks.push('Las cuentas por cobrar superan los activos totales. Revise su clasificación y alcance.');
  if(n.cash!==null&&n.assets!==null&&n.cash>n.assets)checks.push('Caja y bancos supera los activos totales. Revise las cifras y sus fechas.');
  if(n.payables!==null&&n.liabilities!==null&&n.payables>n.liabilities)checks.push('Las cuentas por pagar superan los pasivos totales. Revise su clasificación y alcance.');
  let position=balanceKnown?`Al ${assemblyDate(data.balanceDate)}, se reportan activos por ${assemblyMoney(n.assets)}, pasivos por ${assemblyMoney(n.liabilities)} y patrimonio por ${assemblyMoney(n.equity)}. Los activos incluyen bienes y derechos; ese total no equivale al efectivo disponible.`:'[Pendiente de completar las cifras de activos, pasivos y patrimonio para explicar la situación financiera.]';
  if(!data.balanceDate)pending.push('Fecha de corte del balance');
  if(n.cash!==null)position+=` En caja y bancos se reportan ${assemblyMoney(n.cash)}. Conviene identificar los fondos con destino específico y los pagos próximos antes de comprometer nuevas inversiones.`;
  if(n.equity!==null&&n.equity<0)position+=' El patrimonio negativo requiere revisar sus causas con el contador y valorar acciones de fortalecimiento.';
  sections.push({title:'Situación financiera al cierre',text:position});
  if(checks.length)sections.push({title:'Cifras que requieren confirmación',text:checks.join('\n\n')});
  graphs=[{title:'Ingresos y gastos del período',items:[['Ingresos',n.income],['Gastos',n.expenses]]},{title:'Activos pasivos y patrimonio',items:[['Activos',n.assets],['Pasivos',n.liabilities],['Patrimonio',n.equity]]}];
 }
 for(const [title,k]of cfg.sections){let text=value(k,cfg.fields.find(f=>f[0]===k)[1]);if(assemblyKnown(data[k])){const lead={achievements:'Entre los avances reportados por el equipo se encuentran los siguientes:',agreements:'El seguimiento de los acuerdos se resume a continuación:',water:'En relación con el agua y la prestación del servicio, se reporta lo siguiente:',works:'El trabajo de operación y los proyectos del período se describen a continuación:',community:'La atención a las personas usuarias incluyó lo siguiente:',difficulties:'Los asuntos que requieren continuidad son los siguientes:',priorities:'Para orientar el trabajo del próximo período, se proponen las siguientes prioridades:',scope:'Las revisiones efectuadas por Fiscalía tuvieron el siguiente alcance:',evidence:'Se consultaron los siguientes documentos y respaldos:',findings:'Las observaciones reportadas por Fiscalía se detallan a continuación:',followup:'El seguimiento realizado se describe a continuación:',recommendations:'Se proponen las siguientes acciones para su valoración:',limitations:'Quedaron pendientes de verificar los siguientes aspectos:',sources:'Las cifras presentadas tienen el siguiente respaldo:',budget:'Sobre el presupuesto y su ejecución, se informa lo siguiente:',investments:'Las inversiones y su financiamiento se resumen a continuación:',collection:'En el seguimiento de los cobros y pagos, se reporta lo siguiente:'};text=lead[k]+'\n\n'+text;}sections.push({title,text});}
 if(type==='fiscalia'){
  if(!assemblyKnown(data.scope)||!assemblyKnown(data.evidence))checks.push('Complete qué se revisó y los respaldos consultados antes de emitir conclusiones de Fiscalía.');
  if(data.conclusion==='no-findings')sections.push({title:'Conclusión de las revisiones',text:assemblyKnown(data.scope)&&assemblyKnown(data.evidence)?'Dentro del alcance y de los documentos descritos en este informe, Fiscalía indica que no identificó observaciones en las revisiones realizadas. Esta conclusión se limita a los asuntos efectivamente revisados.':'[Pendiente de completar el alcance y los respaldos antes de formular una conclusión.]'});
  else if(data.conclusion==='findings')sections.push({title:'Conclusión de las revisiones',text:assemblyKnown(data.findings)?'Las observaciones descritas requieren respuesta y seguimiento. Se propone que la Junta Directiva y la administración valoren las recomendaciones y definan responsables y plazos.':'[Pendiente de describir las observaciones que respaldan la conclusión.]'});
  else sections.push({title:'Conclusión de las revisiones',text:'[Pendiente de formular la conclusión de Fiscalía según las revisiones realizadas.]'});
 }
 sections.push({title:'Cierre',text:type==='fiscalia'?'Agradecemos el espacio para presentar este informe. El seguimiento de las recomendaciones y la disponibilidad de información permitirán dar continuidad a la labor de Fiscalía.':'Agradecemos a las personas asociadas el espacio para conocer y conversar sobre este informe. Invitamos a revisar los asuntos pendientes y las prioridades propuestas para dar continuidad al trabajo de la ASADA.'});
 const keys=type==='presidencia'?['achievements','difficulties','priorities']:type==='tesoreria'?['budget','collection','priorities']:['scope','findings','recommendations'];
 const short=keys.map(k=>assemblyKnown(data[k])?data[k].trim().split('\n').find(x=>x.trim()):'[Pendiente: '+cfg.fields.find(f=>f[0]===k)[1]+']');
 const summary=['Estimadas personas asociadas:',`Presentamos el informe de ${cfg.name} de ${name}, correspondiente al período ${period}.`,...(type==='tesoreria'?[sections[1].text]:[]),...short,...(checks.length?['Antes de presentar este informe, es necesario confirmar lo siguiente: '+checks.join(' ')]:[]),'Estos son los puntos principales. El informe completo detalla los respaldos, avances y asuntos pendientes para su revisión.'].join('\n\n');
 return {type,title:'Informe de '+cfg.name,name,author,period,meeting:assemblyDate(data.meeting),balanceDate:assemblyDate(data.balanceDate),sections,numbers,graphs,summary,pending:[...new Set(pending)],checks};
}
async function buildAssemblyWord(report,mode,images=[]){
 const {Document,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,BorderStyle,VerticalAlign,ImageRun,Packer}=docx;
 const p=(text,heading,keepNext=false)=>new Paragraph({text,heading,keepNext:heading?true:keepNext,spacing:{after:140,line:280}});
 const content=[p(report.title,HeadingLevel.TITLE),p(report.name),p('Período: '+report.period),p('Asamblea: '+report.meeting),p('Presenta: '+report.author)];
 if(mode==='summary'){content.push(p('Resumen para la asamblea',HeadingLevel.HEADING_1));for(const text of report.summary.split('\n'))if(text.trim())content.push(p(text));}
 else{
  for(const section of report.sections){content.push(p(section.title,HeadingLevel.HEADING_1));const lines=section.text.split('\n').filter(x=>x.trim());lines.forEach((text,i)=>content.push(p(text,undefined,i===0&&lines.length>1)));
   if(report.type==='tesoreria'&&section.title==='Situación financiera al cierre'){
    const border={style:BorderStyle.SINGLE,size:4,color:'D9D9D9'};
    const rows=[['Concepto','Monto en colones'],...report.numbers.map(([label,n])=>[label,assemblyMoney(n)])];
    content.push(new Table({width:{size:9360,type:WidthType.DXA},columnWidths:[5900,3460],rows:rows.map((row,i)=>new TableRow({tableHeader:i===0,children:row.map((v,j)=>new TableCell({width:{size:j?3460:5900,type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,margins:{top:100,bottom:100,left:120,right:120},borders:{top:border,bottom:border,left:border,right:border},shading:{fill:i===0?'103E55':i%2?'F1F7FA':'FFFFFF'},children:[new Paragraph({children:[new TextRun({text:v,bold:i===0,color:i===0?'FFFFFF':'000000',size:21})],spacing:{after:0,line:260}})]}))}))}));
    content.push(p('Los ingresos y gastos corresponden al período indicado. Los saldos corresponden a la fecha de corte del balance.'));
    for(const img of images){content.push(p(img.title,HeadingLevel.HEADING_2),new Paragraph({children:[new ImageRun({type:'png',data:img.data,transformation:{width:560,height:img.height*560/img.width},altText:{title:img.title,description:'Comparación de cifras ingresadas'}})]}));}
   }
  }
 }
 content.push(p('Firma: __________________________________________'));
 return Packer.toBlob(new Document({creator:report.author,title:report.title,styles:{default:{document:{run:{font:'Arial',size:22,color:'000000'},paragraph:{spacing:{after:140,line:280}}}},paragraphStyles:[{id:'Title',name:'Title',basedOn:'Normal',run:{size:36,bold:true,color:'000000'},paragraph:{spacing:{after:240}}},{id:'Heading1',name:'Heading 1',basedOn:'Normal',run:{size:27,bold:true,color:'000000'},paragraph:{keepNext:true,spacing:{before:220,after:120}}},{id:'Heading2',name:'Heading 2',basedOn:'Normal',run:{size:23,bold:true,color:'000000'},paragraph:{keepNext:true,spacing:{before:180,after:100}}}]},sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1080,right:1440,bottom:1080,left:1440}}},children:content}]}));
}
function assemblyChartHTML(graph){
 const known=graph.items.filter(x=>Number.isFinite(x[1]));if(!known.length)return '<p>Complete las cifras para mostrar el gráfico.</p>';
 const max=Math.max(...known.map(x=>Math.abs(x[1])),1),negative=known.some(x=>x[1]<0);
 return known.map(([label,n])=>`<div class="fin-bar"><span>${label}<strong>${assemblyMoney(n)}</strong></span><div class="fin-signed-track ${negative?'has-negative':''}" aria-hidden="true"><div class="fin-signed-fill ${n<0?'negative':''}" style="left:${negative?(n<0?50-Math.abs(n)/max*50:50):0}%;width:${Math.abs(n)/max*(negative?50:100)}%"></div></div></div>`).join('');
}
function initAssembly(){
 const form=document.getElementById('assembly-form');if(!form)return;
 const el=id=>document.getElementById(id),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let selected='presidencia',step=1,report=null,edited=false;const cache={};
 function saveFields(){const fields={};form.querySelectorAll('[data-specific]').forEach(x=>fields[x.id]=x.value);cache[selected]=fields;}
 function renderFields(){const cfg=ASSEMBLY_TYPES[selected];el('assembly-fields').innerHTML=cfg.fields.map(([k,label,hint])=>`<label for="as-${k}">${label}<textarea id="as-${k}" data-specific rows="4" maxlength="10000" placeholder="${escape(hint)}"></textarea><span class="fin-help">${escape(hint)} Puede indicar «No tengo información».</span></label>`).join('')+(selected==='fiscalia'?'<label for="as-conclusion">Conclusión de las revisiones<select id="as-conclusion" data-specific><option value="">Pendiente de definir</option><option value="no-findings">No identifiqué observaciones dentro de lo revisado</option><option value="findings">Identifiqué observaciones que requieren seguimiento</option></select></label>':'');
  el('assembly-numbers').hidden=selected!=='tesoreria';el('assembly-balance').hidden=selected!=='tesoreria';
  for(const [id,val]of Object.entries(cache[selected]||{}))if(el(id))el(id).value=val;
 }
 function show(n){step=n;for(let i=1;i<=3;i++)el('assembly-step-'+i).hidden=i!==n;el('assembly-progress').textContent='Paso '+n+' de 3 · '+['Datos generales','Información de '+ASSEMBLY_TYPES[selected].name,'Revisar y descargar'][n-1];el('assembly-progress').focus();}
 function read(){const d={};for(const k of ['name','author','start','end','meeting','balanceDate'])d[k]=el('as-'+k).value.trim();form.querySelectorAll('[data-specific]').forEach(x=>d[x.id.slice(3)]=x.value.trim());for(const [k]of ASSEMBLY_MONEY){const v=el('as-'+k).value;d[k]=v===''?null:Number(v);}return d;}
 function snapshot(){if(!report)return null;const sections=report.sections.map((s,i)=>({...s,text:el('assembly-edit-'+i).value}));return {...report,sections,summary:el('assembly-summary').value};}
 function preview(){saveFields();report=buildAssemblyReport(selected,read());edited=false;el('assembly-preview-title').textContent=report.title+' · '+report.name;
  el('assembly-review').innerHTML=(report.pending.length?'<h3>Datos pendientes de completar</h3><ul>'+report.pending.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul>':'<p>Los campos de información están completos. Revise que su contenido y respaldo sean correctos.</p>')+(report.checks.length?'<h3>Observaciones para revisar</h3><ul>'+report.checks.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul>':'');
  el('assembly-preview').innerHTML=report.sections.map((s,i)=>`<label class="assembly-edit-label" for="assembly-edit-${i}">${escape(s.title)}<textarea id="assembly-edit-${i}" rows="${Math.min(12,Math.max(4,s.text.split('\n').length+2))}" maxlength="30000">${escape(s.text)}</textarea></label>`).join('');
  el('assembly-summary').value=report.summary;
  el('assembly-figures').hidden=selected!=='tesoreria';
  el('assembly-table').innerHTML='<thead><tr><th>Concepto</th><th>Monto en colones</th></tr></thead><tbody>'+report.numbers.map(([label,n])=>'<tr><td>'+label+'</td><td>'+assemblyMoney(n)+'</td></tr>').join('')+'</tbody>';
  el('assembly-charts').innerHTML=report.graphs.map(g=>'<article><h3>'+g.title+'</h3>'+assemblyChartHTML(g)+'</article>').join('');
  el('assembly-download-status').textContent='';show(3);
 }
 el('assembly-type').addEventListener('change',()=>{saveFields();selected=el('assembly-type').value;renderFields();report=null;edited=false;show(1);});
 el('assembly-next').addEventListener('click',()=>{el('assembly-error').textContent='';if(el('as-start').value&&el('as-end').value&&el('as-start').value>el('as-end').value){el('assembly-error').textContent='La fecha inicial debe ser anterior o igual a la fecha final.';return;}show(2);});
 el('assembly-back').addEventListener('click',()=>show(1));
 form.addEventListener('submit',e=>{e.preventDefault();if(step===1){el('assembly-next').click();return;}const fields=selected==='tesoreria'?[...el('assembly-numbers').querySelectorAll('input')]:[];if(fields.some(x=>!x.checkValidity())){fields.find(x=>!x.checkValidity()).reportValidity();return;}preview();});
 el('assembly-modify').addEventListener('click',()=>{if(edited&&!window.confirm('Al volver a generar el informe se reemplazarán los cambios de la vista previa. ¿Desea volver a los datos?'))return;show(2);});
 el('assembly-preview').addEventListener('input',()=>{edited=true;});el('assembly-summary').addEventListener('input',()=>{edited=true;});
 document.querySelectorAll('[data-assembly-mode]').forEach(button=>button.addEventListener('click',async()=>{const current=snapshot();if(!current)return;button.disabled=true;el('assembly-download-status').textContent='Preparando el documento Word…';try{const mode=button.dataset.assemblyMode;const images=mode==='full'?current.graphs.map(g=>financeChartPNG(g.title,g.items)).filter(Boolean):[];const blob=await buildAssemblyWord(current,mode,images);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Informe_'+ASSEMBLY_TYPES[selected].name.replace('í','i')+'_'+(mode==='full'?'Completo':'Resumen')+'.docx';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);el('assembly-download-status').textContent='Documento preparado. Revise los datos pendientes y el contenido antes de firmarlo.';}catch(e){el('assembly-download-status').textContent='No se pudo generar el Word. Intente nuevamente o copie el texto de la vista previa.';}finally{button.disabled=false;}}));
 renderFields();show(1);
}
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',initAssembly);
