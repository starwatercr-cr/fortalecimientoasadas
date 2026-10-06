import {contractTemplate} from './contract-template.js';
import {requireCompleteContract,findContractPlan,contractPrice,contractTax,contractVersion} from './contract-model.js';
export function contractParagraphs(input){
 const c=requireCompleteContract(input),plan=findContractPlan(c.plan),date=s=>s.split('-').reverse().join('/'),identifier=c.templateVersion+' · '+c.tax+' · '+c.start;
 
 const result=[];
 for(const item of contractTemplate){let t=item.text;
 if(t.startsWith('Este contrato regula'))t='Este contrato regula el acceso a la plataforma y el acompañamiento cuando se contrate, conforme a la modalidad seleccionada y a las condiciones que ambas partes revisarán y aceptarán antes de firmar.';
 if(t.startsWith('Comparecen '))t='Comparecen STAR WATER, cédula jurídica 3-101-797664, con domicilio en '+c.providerAddress+', representada legalmente por Starlen Hidalgo Castro, cédula de identidad 702210136; y '+c.legalName+', cédula jurídica '+c.tax+', con domicilio en '+c.address+', representada por '+c.representative+', cédula '+c.representativeId+', en calidad de '+c.position+', con fundamento de representación en '+c.representation+', en adelante LA ASADA.';
 else if(t.startsWith('Las personas firmantes'))t='Las personas firmantes acreditarán facultades suficientes mediante la documentación de representación correspondiente. LA ASADA hace constar la autorización de su Junta Directiva mediante acuerdo '+c.agreement+', sesión '+c.session+', del '+date(c.agreementDate)+'.';
 else if(t.startsWith('Módulos y funciones habilitados:'))t='Módulos habilitados según la configuración vigente: Nuestra ASADA, diagnóstico, Panel de gestión, estados financieros, acuerdos y seguimiento, informes para la Asamblea, recurso humano, proveedores y bodega, morosidad, operación y calidad del agua, herramientas del recurso hídrico, consulta documental y Centro de decisiones. La descripción y el alcance efectivo se revisarán antes de firmar.';
 else if(t.startsWith('La vigencia inicial'))t=t.replace('[FECHA DE ACTIVACIÓN]',date(c.start)).replace('[FECHA DE FINALIZACIÓN]',date(c.end));
 else if(t.startsWith('Correo de STAR WATER'))t=t.replace('[CORREO]',c.email);
 else if(t.startsWith('Las partes declaran'))t=t.replace('[LUGAR]',c.place).replace('[FECHA]',date(c.signDate));
 else if(t.startsWith('Documento o versión:'))t='Documento y versión: '+identifier+'. Anexos: no se incorporan anexos adicionales mediante este formulario. Cualquier anexo deberá identificarse y ser aceptado por ambas partes antes de la firma.';
 else if(t.startsWith('POR LA ASADA')){t='POR LA ASADA '+c.legalName;}
 else if(t.startsWith('Nombre de la persona representante:'))t='Nombre de la persona representante: '+c.representative;
 else if(t.startsWith('Identificación:'))t='Cédula de identidad: '+c.representativeId;
 else if(t.startsWith('Cargo y fundamento de representación:'))t='Cargo: '+c.position+'. Fundamento: '+c.representation;
 else if(t.startsWith('Fundamento de representación:'))t='Fundamento de representación: '+c.providerRepresentation;
 else if(t.startsWith('Autorización de la Junta'))t='Autorización de la Junta Directiva: acuerdo '+c.agreement+', sesión '+c.session+', del '+date(c.agreementDate)+'.';
 if(t.startsWith('El alcance del acompañamiento'))t='El alcance del acompañamiento y los servicios adicionales se regirán por la cotización aceptada y la ficha de contratación. Las visitas, capacitaciones y sesiones virtuales se incluyen únicamente cuando se acuerden en la cotización. El soporte de uso de la plataforma está incluido en todas las modalidades.';
 if(t.startsWith('LA ASADA pagará la mensualidad'))t='LA ASADA pagará US$'+contractPrice(c)+' mensuales, '+contractTax(plan)+', por la modalidad '+plan.name+'. En la modalidad con acompañamiento, la mensualidad cotizada incluye el acceso a la plataforma. Durante los veinticuatro meses, STAR WATER no modificará unilateralmente el precio. Cualquier variación de alcance o precio requerirá acuerdo escrito, sin perjuicio de los ajustes tributarios obligatorios que se identifiquen y comuniquen conforme a la ley.';
 if(/\[[^\]]+\]/.test(t))throw Error('El contrato contiene datos pendientes de completar.');
 result.push({...item,text:t,signature:t.startsWith('Firma ___'),pageBreak:t==='Aceptación y firmas'});
 if(item.text==='Primera Objeto y finalidad')continue;
 if(t.startsWith('La plataforma es una herramienta de apoyo.')){
 result.push({heading:true,text:'Modalidad y condiciones acordadas'},{text:'Modalidad: '+plan.name+'. Mensualidad: $'+contractPrice(c)+', '+contractTax(plan)+'. Abonados registrados: '+c.users+'. Tres cuentas individuales autorizadas. Vigencia inicial: '+date(c.start)+' al '+date(c.end)+'. El precio de acompañamiento incluye el acceso a la plataforma.'});
 if(plan.legacy&&plan.accompaniment)result.push({heading:true,text:'Acompañamiento incluido'},{text:'Dos visitas presenciales mensuales, previstas para la primera y cuarta semana, y una sesión virtual mensual de seguimiento. La segunda visita incluye capacitación de tres horas a la Junta Directiva, con participación del equipo según el tema. Las fechas concretas se acordarán con LA ASADA y las reprogramaciones quedarán documentadas.'},{text:'La primera visita se orienta al trabajo práctico, revisión de procesos y compromisos. El diagnóstico inicial y el Plan de Fortalecimiento definirán prioridades, responsables, plazos y productos. Se revisarán resultados en los meses 6 y 12; para los meses 13 a 24 se actualizará el plan, manteniendo la frecuencia contratada. STAR WATER acompaña la aplicación; la Junta dirige y aprueba, la administración ejecuta y el personal operativo aporta información.'});
 if(plan.quote)result.push({heading:true,text:'Acompañamiento según cotización'},{text:'Referencia de la cotización: '+c.providerQuoteReference+'. Alcance y modalidad acordados: '+c.providerQuoteScope+'. La mensualidad indicada incluye el acceso a la plataforma. Las visitas, capacitaciones, seguimiento y productos serán únicamente los definidos en esta cotización.'});
 result.push({text:'Estudios técnicos especializados, análisis de laboratorio, obras, trámites profesionales específicos y equipos requieren presupuesto y aceptación adicionales. Si se contrata solo la plataforma, las visitas y capacitaciones no están incluidas.'});
 }
 }
 return {c,plan,identifier,paragraphs:result};
}
export function buildContractPDF(input){
 const data=contractParagraphs(input);
 if(!window.jspdf?.jsPDF||!window.AsadaDiagnosticFonts)throw Error('No se cargó el generador PDF. Actualice la página.');
 const doc=new window.jspdf.jsPDF({unit:'mm',format:'letter',compress:true,putOnlyUsedFonts:true});
 for(const [style,key]of [['normal','regular'],['bold','bold']]){const name='Contract-'+style+'.ttf';doc.addFileToVFS(name,window.AsadaDiagnosticFonts[key]);doc.addFont(name,'Contract',style);}
 doc.setProperties({title:'Contrato - '+data.c.legalName,author:'Star Water',subject:data.identifier});
 const x=19,width=178,bottom=252;let y=29,signatures=false;
 const header=()=>{doc.setFont('Contract','normal');doc.setFontSize(8);doc.setTextColor(0);doc.text('STAR WATER | Contrato de plataforma y acompañamiento para ASADAS',x,14);};
 const page=()=>{doc.addPage();header();y=29;};header();
 for(const [i,row]of data.paragraphs.entries()){
  if(row.pageBreak){signatures=true;if(y>35)page();}
  if(row.signature){if(y+30>bottom)page();y+=18;}
  const size=i===0?17:row.heading?12:signatures?10:10.5,step=size*.48;
  doc.setFont('Contract',row.heading?'bold':'normal');doc.setFontSize(size);
  const lines=doc.splitTextToSize(row.text,width);
  if(row.heading&&y+lines.length*step+16>bottom)page();
  for(const line of lines){if(y+step>bottom)page();doc.setFont('Contract',row.heading?'bold':'normal');doc.setFontSize(size);doc.text(line,x,y);y+=step;}
  y+=row.heading?4:signatures?2.4:3.3;
 }
 const total=doc.getNumberOfPages();for(let n=1;n<=total;n++){doc.setPage(n);doc.setFont('Contract','normal');doc.setFontSize(8);doc.text('Documento para revisión y firma · '+data.c.templateVersion,x,267);doc.text(n+' / '+total,197,267,{align:'right'});}
 return doc;
}
