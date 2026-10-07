export const laborVersion='ASADA-LABORAL-2026-10-07';
export const laborSources={code:'https://www.mtss.go.cr/elministerio/marco-legal/documentos/codigo_trabajo_cr.pdf',salary:'https://www.mtss.go.cr/temas-laborales/salarios/lista_salarios_minimos_2026.pdf'};
export const laborRoles={
 administrador:{name:'Administrador(a)',guide:'No figura con este nombre en la lista aportada. Confirme la categoría con el MTSS según funciones, responsabilidad y formación exigida. El cargo no implica automáticamente exclusión de los límites de jornada.',functions:'Organizar la gestión diaria y coordinar al equipo de la ASADA.\nEjecutar el plan, presupuesto y acuerdos aprobados, dentro de las autorizaciones recibidas.\nPreparar informes claros para la Junta Directiva sobre finanzas, usuarios, operación y pendientes.\nDar seguimiento a acuerdos, solicitudes, cobros y obligaciones; conservar sus respaldos.\nCoordinar compras y pagos autorizados, sin sustituir las competencias de aprobación de la Junta.\nComunicar riesgos, necesidades del acueducto y decisiones que requieren aprobación.',supervisor:'Junta Directiva, mediante la persona y el mecanismo de coordinación formalmente designados.',safety:'Ergonomía, uso seguro de equipos, atención respetuosa de usuarios y coordinación segura de visitas al acueducto.'},
 fontanero:{name:'Fontanero(a)',guide:'La lista 2026 identifica Fontanero como TOC: ₡13.991,86 por jornada ordinaria diaria. Revise si las funciones reales exigen otra clasificación.',functions:'Inspeccionar captaciones, conducción, tanques y red según la ruta asignada.\nRealizar mantenimiento, instalación y reparación de tuberías, válvulas y medidores dentro de su competencia.\nRegistrar averías, materiales utilizados, lecturas y trabajos realizados.\nRealizar aforos y controles operativos cuando cuente con formación, equipos y autorización.\nComunicar fugas, anomalías y condiciones que afecten el servicio o la seguridad.\nCoordinar las interrupciones del servicio y la atención de emergencias mediante los procedimientos de la ASADA.',supervisor:'Administración o responsable operativo designado por la ASADA.',safety:'Equipo de protección, excavaciones seguras, tránsito, herramientas, sustancias de desinfección y procedimientos para espacios confinados. Las tareas especializadas requieren formación y condiciones seguras.'},
 asistente:{name:'Asistente administrativo(a)',guide:'Confirme las tareas: la lista incluye Oficinista general TOSCG (₡405.710,70 mensuales) y Auxiliar de contabilidad TOCG (₡419.755,80 mensuales). Son referencias, no una asignación automática.',functions:'Organizar expedientes y actualizar registros administrativos.\nApoyar la atención y seguimiento de solicitudes de las personas usuarias.\nPreparar documentos, reportes y respaldos asignados por la administración.\nApoyar registros de cobro, pagos y compras conforme a las autorizaciones.\nDar seguimiento a pendientes y comunicar inconsistencias.\nResguardar la información de usuarios, trabajadores y proveedores.',supervisor:'Administración de la ASADA.',safety:'Ergonomía, manejo seguro de equipos y documentos, y atención respetuosa de usuarios.'},
 miscelaneo:{name:'Misceláneo(a)',guide:'Misceláneo figura como TONCG: ₡373.092,30 mensuales en 2026. La limpieza de oficinas de la ASADA no se clasifica automáticamente como trabajo doméstico.',functions:'Limpiar y mantener ordenadas las oficinas, sanitarios y áreas comunes asignadas.\nUsar los productos de limpieza conforme a sus indicaciones y capacitación.\nSeparar y disponer los residuos según los procedimientos establecidos.\nControlar y solicitar los insumos de limpieza necesarios.\nComunicar daños, riesgos o necesidades de mantenimiento.\nApoyar la preparación y limpieza de espacios para reuniones. La limpieza técnica de tanques y otras labores del acueducto requiere asignación específica, capacitación y revisión del puesto.',supervisor:'Administración de la ASADA.',safety:'Guantes y protección adecuada, identificación de productos, ventilación, prevención de caídas y prohibición de mezclar productos incompatibles.'},
 secretario:{name:'Secretario(a)',guide:'La lista 2026 contempla Secretaria TOCG y categorías según título: técnico medio, diplomado, bachiller y licenciatura. Confirme la preparación requerida y aplicable. Este empleo no equivale al cargo electo de Secretaría de la Junta.',functions:'Organizar correspondencia, agenda y archivo de la ASADA.\nPreparar convocatorias y documentos por instrucción de las personas autorizadas.\nApoyar la preparación de borradores de actas y acuerdos, sin reemplazar las funciones estatutarias de la Secretaría de la Junta.\nComunicar y dar seguimiento a gestiones administrativas asignadas.\nAtender consultas y canalizar solicitudes a la persona competente.\nCustodiar documentos e información confidencial.',supervisor:'Administración o persona responsable designada por la ASADA.',safety:'Ergonomía, manejo seguro de equipos y resguardo de documentos.'},
 ayudante:{name:'Ayudante de fontanería',guide:'No figura con ese nombre en la lista. Ayudante de operario de construcción TOSC (₡13.523,69 por día) es una referencia posible que debe confirmarse según las funciones. No use una categoría inferior si ejecuta labores calificadas de fontanería.',functions:'Apoyar al fontanero en tareas de mantenimiento y reparación autorizadas.\nPreparar y trasladar herramientas y materiales de forma segura.\nApoyar excavaciones, señalización y limpieza del área bajo supervisión.\nRegistrar materiales y trabajos asignados y comunicar anomalías.\nMantener ordenadas las herramientas y devolver los equipos utilizados.\nRealizar únicamente tareas acordes con su capacitación; no operar equipos especializados ni manipular desinfectantes sin formación y autorización.',supervisor:'Fontanero responsable, con coordinación de la administración de la ASADA.',safety:'Equipo de protección, señalización, excavaciones, cargas y herramientas. Supervisión y capacitación previa para cada tarea.'}
};
export const salaryCategories=[
 {id:'pending',name:'Categoría por confirmar',amount:0,unit:''},
 {id:'TONCG',name:'TONCG · ocupación no calificada genérica',amount:373092.30,unit:'Mensual'},
 {id:'TOSCG',name:'TOSCG · ocupación semicalificada genérica',amount:405710.70,unit:'Mensual'},
 {id:'TOCG',name:'TOCG · ocupación calificada genérica',amount:419755.80,unit:'Mensual'},
 {id:'TOEG',name:'TOEG · ocupación especializada genérica',amount:487335,unit:'Mensual'},
 {id:'TOSC',name:'TOSC · ocupación semicalificada',amount:13523.69,unit:'Por jornada diaria'},
 {id:'TOC',name:'TOC · ocupación calificada',amount:13991.86,unit:'Por jornada diaria'},
 {id:'TMED',name:'Técnico medio',amount:496838.17,unit:'Mensual'},
 {id:'DES',name:'Diplomado de educación superior',amount:585484.58,unit:'Mensual'},
 {id:'BACH',name:'Bachiller universitario',amount:664078.07,unit:'Mensual'},
 {id:'LIC',name:'Licenciado universitario',amount:796921,unit:'Mensual'},
 {id:'other',name:'Otra categoría / otra vigencia documentada',amount:0,unit:''}
];
export const laborFields=[
 ['asadaName','Nombre legal de la ASADA'],['asadaTax','Cédula jurídica'],['asadaAddress','Domicilio de la ASADA'],
 ['representative','Representante de la ASADA'],['representativeId','Identificación del representante'],['representativeCapacity','Cargo y fundamento de representación'],['representativeNationality','Nacionalidad del representante'],['representativeAge','Edad del representante'],['representativeSex','Sexo del representante'],['representativeCivil','Estado civil del representante'],['representativeAddress','Domicilio del representante'],['agreement','Acuerdo y sesión que autorizan la contratación'],
 ['workerName','Nombre completo del trabajador'],['workerId','Identificación del trabajador'],['nationality','Nacionalidad del trabajador'],['age','Edad del trabajador'],['sex','Sexo del trabajador'],['civil','Estado civil del trabajador'],['residence','Domicilio y residencia habitual del trabajador'],['otherResidence','Residencia para prestar el servicio, si cambia'],
 ['workplace','Lugar o lugares donde trabajará'],['supervisor','Quién supervisa y a quién informa'],['functions','Funciones acordadas'],['safety','Medidas y recursos de trabajo seguro'],
 ['start','Fecha de inicio'],['schedule','Días y horario de trabajo'],['breaks','Descansos y tiempo para alimentación'],['weeklyRest','Día de descanso semanal'],['dailyHours','Horas efectivas ordinarias al día'],['weeklyHours','Horas efectivas ordinarias a la semana'],
 ['salary','Salario bruto acordado en colones'],['payFrequency','Frecuencia y fecha de pago'],['payMethod','Forma y lugar del pago'],['categoryReason','Fundamento de la clasificación y preparación requerida'],['minimum','Mínimo aplicable al mismo período del salario'],['minimumSource','Fuente y fundamento del mínimo aplicable'],['salaryYear','Año de la referencia salarial'],['reviewer','Persona que revisó las condiciones'],
 ['signPlace','Lugar de celebración'],['signDate','Fecha de celebración'],['extras','Condiciones adicionales compatibles con la ley']
];
const optional=new Set(['otherResidence','extras']);
const dates=new Set(['start','signDate']);
export function cleanLabor(p,fail=m=>{throw Error(m);}){
 if(!p||typeof p!=='object'||Array.isArray(p))return fail('Revise los datos del contrato.');
 const out={templateVersion:laborVersion};
 for(const [k,l] of laborFields){const v=p[k]??'';if(typeof v!=='string'||v.length>(['functions','extras'].includes(k)?1600:['safety','schedule','categoryReason','minimumSource','breaks','workplace'].includes(k)?600:300))return fail('Revise '+l+'.');out[k]=v.trim();}
 for(const [k,opts] of Object.entries({role:Object.keys(laborRoles),salaryUnit:['Mensual','Por jornada diaria','Por hora'],workday:['Diurna','Mixta','Nocturna'],category:salaryCategories.map(c=>c.id),workload:['Jornada ordinaria completa','Jornada parcial / referencia ajustada']})){
  out[k]=p[k]??opts[0];if(!opts.includes(out[k]))return fail('Revise '+k+'.');
 }
 out.confirmed=p.confirmed===true;
 for(const k of dates)if(out[k]&&!validDate(out[k]))return fail('Revise la fecha de '+k+'.');
 for(const k of ['salary','minimum','dailyHours','weeklyHours','age','representativeAge','salaryYear'])if(out[k]&&(!Number.isFinite(Number(out[k]))||Number(out[k])<0||Number(out[k])>1e10))return fail('Revise '+k+'.');
 return out;
}
export function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(new Date(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;}
export function laborReview(input){
 const c=cleanLabor(input),issues=[];
 for(const [k,l] of laborFields)if(!optional.has(k)&&!c[k])issues.push('Complete: '+l+'.');
 if(!c.confirmed)issues.push('Confirme la revisión de funciones, jornada y salario.');
 if(c.category==='pending')issues.push('Confirme la categoría ocupacional antes de descargar para firma.');
 for(const k of ['age','representativeAge'])if(c[k]&&(!Number.isInteger(Number(c[k]))||Number(c[k])<18||Number(c[k])>110))issues.push('Este modelo está previsto para personas adultas; revise la edad.');
 if(c.salary&&c.minimum&&Number(c.salary)<Number(c.minimum))issues.push('El salario es inferior al mínimo aplicable registrado.');
 if(c.minimum&&!Number(c.minimum)||c.salary&&!Number(c.salary))issues.push('Salario y mínimo deben ser mayores que cero.');
 const limits={Diurna:[8,48],Mixta:[7,42],Nocturna:[6,36]},[day,week]=limits[c.workday];
 if(Number(c.dailyHours)>day||Number(c.weeklyHours)>week)issues.push('La jornada supera los límites ordinarios del modelo. Revise el caso antes de firmar; esta plantilla no aplica excepciones automáticamente.');
 if(c.dailyHours&&c.weeklyHours&&(Number(c.dailyHours)<=0||Number(c.weeklyHours)<=0||Number(c.weeklyHours)>Number(c.dailyHours)*6))issues.push('Revise las horas efectivas y el descanso semanal.');
 if(c.salaryYear&&(!Number.isInteger(Number(c.salaryYear))||Number(c.salaryYear)<2000||Number(c.salaryYear)>2100))issues.push('Revise el año de referencia salarial.');
 if(c.start&&c.salaryYear&&Number(c.start.slice(0,4))!==Number(c.salaryYear))issues.push('La referencia salarial debe corresponder al año de inicio. Actualice la fuente y el mínimo.');
 const cat=salaryCategories.find(x=>x.id===c.category);
 if(c.workload==='Jornada ordinaria completa'&&Number(c.salaryYear)===2026&&cat.amount){
  if(cat.unit!==c.salaryUnit)issues.push('La referencia está en '+cat.unit.toLowerCase()+' y el salario en '+c.salaryUnit.toLowerCase()+'. Registre una referencia ajustada, explique la conversión y confirme su fundamento.');
  else if(Number(c.minimum)<cat.amount)issues.push('El mínimo registrado es menor que la referencia 2026 de la categoría seleccionada.');
 }
 return {c,issues,ready:issues.length===0};
}
const crc=n=>'₡'+Number(n).toLocaleString('es-CR',{minimumFractionDigits:2,maximumFractionDigits:2});
const date=s=>s.split('-').reverse().join('/');
export function laborParagraphs(input,{draft=false}={}){
 const {c,issues,ready}=laborReview(input);if(!draft&&!ready)throw Error(issues.join('\n'));
 const v=k=>c[k]||'PENDIENTE DE COMPLETAR',role=laborRoles[c.role];
 const paragraphs=[
 {heading:true,text:(draft?'BORRADOR - ':'')+'CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO INDEFINIDO'},
 {text:'Puesto: '+role.name+'. ASADA: '+v('asadaName')+'.'},
 {heading:true,text:'1. Partes y representación'},
 {text:`Comparecen ${v('asadaName')}, cédula jurídica ${v('asadaTax')}, domiciliada en ${v('asadaAddress')}, representada por ${v('representative')}, identificación ${v('representativeId')}, nacionalidad ${v('representativeNationality')}, edad ${v('representativeAge')}, sexo ${v('representativeSex')}, estado civil ${v('representativeCivil')}, domicilio ${v('representativeAddress')}, con facultades según ${v('representativeCapacity')}, en adelante LA ASADA; y ${v('workerName')}, identificación ${v('workerId')}, nacionalidad ${v('nationality')}, edad ${v('age')}, sexo ${v('sex')}, estado civil ${v('civil')}, domiciliado(a) en ${v('residence')}, en adelante LA PERSONA TRABAJADORA.`},
 {text:'La contratación se autoriza mediante '+v('agreement')+'. Si la prestación del servicio exige cambiar la residencia habitual, se identifica la residencia acordada: '+(c.otherResidence||'No se ha pactado cambio de residencia.')},
 {heading:true,text:'2. Inicio, duración y continuidad'},
 {text:'La relación laboral inicia el '+(c.start?date(c.start):'PENDIENTE')+' y se pacta por tiempo indefinido, en atención a la naturaleza permanente de las funciones. La existencia de contratos previos y la antigüedad efectivamente reconocida no se eliminan por la firma de este documento. No se establece una renovación anual ni una renuncia a derechos adquiridos.'},
 {heading:true,text:'3. Funciones y alcance del puesto'},
 {text:'LA PERSONA TRABAJADORA desempeñará el puesto de '+role.name+', con las siguientes funciones acordadas:'},
 ...v('functions').split('\n').filter(Boolean).map(t=>({text:'• '+t.replace(/^[-•]\s*/, '')})),
 {text:'Las instrucciones serán compatibles con el puesto, la capacitación, las condiciones de seguridad y los derechos laborales. Las modificaciones sustanciales se revisarán y documentarán conforme a la ley; la colaboración del equipo no autoriza a desmejorar las condiciones de trabajo.'},
 {heading:true,text:'4. Supervisión y relación con la Junta Directiva'},
 {text:'Supervisión y comunicación: '+v('supervisor')+'. La Junta Directiva dirige y aprueba dentro de sus competencias; la coordinación diaria se canaliza por la supervisión designada. El puesto no otorga por sí mismo representación legal, facultad de contratar, aprobar gastos ni asumir obligaciones a nombre de la ASADA. Las autorizaciones específicas deberán quedar documentadas.'},
 {heading:true,text:'5. Lugar, jornada y descansos'},
 {text:'Lugar o lugares de trabajo: '+v('workplace')+'. Jornada '+c.workday.toLowerCase()+', bajo '+c.workload.toLowerCase()+'. Horario: '+v('schedule')+'. Horas efectivas ordinarias: '+v('dailyHours')+' por día y '+v('weeklyHours')+' por semana. Descansos y alimentación: '+v('breaks')+'. Descanso semanal: '+v('weeklyRest')+'. En jornada continua se respetará el descanso mínimo legal computable como tiempo efectivo. No se aplica automáticamente una excepción de jornada por el nombre del cargo.'},
 {heading:true,text:'6. Salario y forma de pago'},
 {text:'Salario bruto: '+(c.salary?crc(c.salary):'PENDIENTE')+' ('+c.salaryUnit.toLowerCase()+'). Frecuencia y fecha de pago: '+v('payFrequency')+'. Forma y lugar: '+v('payMethod')+'. Se entregará comprobante y se efectuarán únicamente las deducciones legalmente procedentes. El salario se ajustará cuando lo exija el mínimo vigente aplicable.'},
 {text:'Clasificación registrada: '+salaryCategories.find(x=>x.id===c.category).name+'. Fundamento: '+v('categoryReason')+'. Referencia salarial '+v('salaryYear')+': mínimo aplicable '+(c.minimum?crc(c.minimum):'PENDIENTE')+' para el mismo período del salario. Fuente y criterio de aplicación: '+v('minimumSource')+'. Revisión registrada por: '+v('reviewer')+'.'},
 {heading:true,text:'7. Horas extraordinarias y emergencias'},
 {text:'El trabajo fuera de la jornada ordinaria se registrará y se remunerará conforme al Código de Trabajo, con el recargo legal cuando corresponda y respetando los límites y prohibiciones aplicables. La coordinación previa no elimina el pago de trabajo efectivamente realizado y acreditado. La atención de averías no implica disponibilidad permanente ni trabajo gratuito. Cualquier régimen de disponibilidad deberá acordarse por separado, con sus condiciones y remuneración legalmente revisadas.'},
 {heading:true,text:'8. Derechos laborales y seguridad social'},
 {text:'LA ASADA reconocerá descansos, feriados, vacaciones remuneradas, aguinaldo, licencias y demás derechos conforme a la legislación vigente. Gestionará la inscripción y cotizaciones ante la CCSS y el seguro obligatorio de riesgos del trabajo. Las vacaciones respetarán, como mínimo, dos semanas por cada cincuenta semanas de labores continuas, sin perjuicio de derechos superiores. Este contrato no sustituye los registros ni las obligaciones ante esas entidades.'},
 {heading:true,text:'9. Salud ocupacional, herramientas y capacitación'},
 {text:'LA ASADA proporcionará instrucciones, capacitación, herramientas y protección adecuadas. Medidas y recursos específicos: '+v('safety')+'. LA PERSONA TRABAJADORA utilizará correctamente los equipos y comunicará peligros e incidentes. No se asignarán labores para las que falten formación o condiciones seguras. El desgaste normal de herramientas no se cobra ni genera descuentos automáticos.'},
 {heading:true,text:'10. Información, documentos y atención a la comunidad'},
 {text:'La información de usuarios, trabajadores, proveedores y de la gestión de la ASADA se utilizará exclusivamente para las funciones autorizadas. Se resguardarán los documentos, credenciales y datos personales. Este deber no impide denunciar hechos ante autoridades competentes ni ejercer derechos laborales. Las personas usuarias y el equipo recibirán un trato respetuoso, sin discriminación ni hostigamiento.'},
 {heading:true,text:'11. Seguimiento y reglas de trabajo'},
 {text:'La ASADA dará seguimiento mediante objetivos claros, comunicación y evaluaciones que consideren los recursos y la formación disponibles. Las políticas y procedimientos aplicables se comunicarán a la persona trabajadora y respetarán la ley. Un reglamento interior de trabajo requerirá las formalidades legales correspondientes; esta plantilla no acredita su aprobación. Una nota de evaluación no constituye por sí sola una sanción o una causa de despido.'},
 {heading:true,text:'12. Terminación y entrega de responsabilidades'},
 {text:'La terminación de la relación se tramitará conforme a las causas, procedimientos, preaviso, auxilio de cesantía y demás prestaciones que legalmente correspondan. La devolución de documentos, llaves y equipos se documentará sin condicionar el pago de derechos irrenunciables ni autorizar deducciones automáticas.'},
 {heading:true,text:'13. Condiciones adicionales'},
 {text:c.extras||'No se pactan condiciones adicionales mediante este formulario.'},
 {heading:true,text:'14. Buena fe, derechos y ejemplares'},
 {text:'Las partes actuarán de buena fe, con respeto, información clara y disposición para resolver diferencias mediante diálogo y los mecanismos legales. Ninguna cláusula implica renuncia a derechos laborales irrenunciables. Se entregará un ejemplar a cada parte y se atenderá la remisión del tercer tanto y el plazo de quince días contemplados en el artículo 23 del Código de Trabajo, por el medio habilitado por el MTSS.'},
 {heading:true,text:'Celebración y firmas',pageBreak:true},
 {text:'Celebrado en '+v('signPlace')+', el '+(c.signDate?date(c.signDate):'PENDIENTE')+'. Las partes revisan sus condiciones antes de firmar.'},
 {text:'POR LA ASADA\n'+v('representative')+'\nIdentificación: '+v('representativeId')+'\nFirma: __________________________________\nFecha de firma: __________________________',signature:true},
 {text:'LA PERSONA TRABAJADORA\n'+v('workerName')+'\nIdentificación: '+v('workerId')+'\nFirma: __________________________________\nFecha de firma: __________________________',signature:true},
 {text:'Si una persona no sabe o no puede firmar, la sustitución por dos testigos se documentará conforme al artículo 24.\nTestigo 1: ____________________ Identificación: ______________ Firma: ______________\nTestigo 2: ____________________ Identificación: ______________ Firma: ______________'},
 ];
 return {c,paragraphs,issues,draft};
}
