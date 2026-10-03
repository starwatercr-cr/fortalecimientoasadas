import {evaluationAreas,evaluationResult} from '../../private/evaluation-model.js';
import {randomUUID} from 'node:crypto';
export const evaluationCriteria={
 'Administración':['Organización de documentos','Seguimiento de acuerdos e informes','Control de tareas y recursos'],
 'Asistencia administrativa':['Orden y actualización de registros','Apoyo a trámites y seguimiento','Coordinación con la administración'],
 'Atención al usuario':['Claridad y respeto en las respuestas','Seguimiento de solicitudes','Registro de gestiones'],
 'Fontanería y operación':['Mantenimiento y atención de averías','Registro y comunicación de labores','Aplicación de instrucciones y uso del equipo de protección'],
 'Otro puesto':['Cumplimiento de funciones del puesto','Calidad de los registros','Seguimiento de tareas asignadas']
};
export const commonCriteria=['Responsabilidad en las tareas','Trato respetuoso','Comunicación y trabajo en equipo','Cuidado de los recursos'];
export const canManageTeam=who=>who.admin===true||who.role==='Administración';
const MAX=2*1024*1024;
export async function teamAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError,teamStorage}){
 const fail=(m,s=400)=>{throw new PublicError(s,m);};
 const who=await authorized(sessionToken(request));if(!canManageTeam(who))fail('Los expedientes laborales están restringidos a la administración de la ASADA.',403);
 const u=new URL(request.url),input=request.method==='POST'&&api!=='team-upload'?await body(request):null;
 if(api==='team-asadas'&&request.method==='GET')return json({asadas:who.admin?await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc'):[who.asada],commonCriteria,evaluationCriteria});
 const requested=input?.asada||u.searchParams.get('asada');let asada=who.asada;
 if(who.admin){if(!uuid(requested))fail('Seleccione una ASADA.');asada=(await sb('/rest/v1/asadas?id=eq.'+requested+'&active=eq.true&select=id,name'))[0];if(!asada)fail('La ASADA no está activa.',403);}
 else if(requested&&requested!==asada.id)fail('No tiene acceso al equipo de esta ASADA.',403);
 const scope='asada_id=eq.'+asada.id;
 const find=async(id,kind)=>{if(!uuid(id))fail('Seleccione un registro válido.');const r=(await sb('/rest/v1/team_records?'+scope+'&id=eq.'+id+'&deleted=eq.false&select=*'))[0];if(!r||kind&&r.kind!==kind)fail('El registro no está disponible.',404);return r;};
 if(api==='team-data'&&request.method==='GET'){const records=[];for(let offset=0;offset<20000;offset+=1000){const rows=await sb('/rest/v1/team_records?'+scope+'&deleted=eq.false&select=*&order=created_at.asc,id.asc&offset='+offset+'&limit=1000');records.push(...rows);if(rows.length<1000)return json({asada,records});}fail('Este equipo requiere una consulta por bloques. Contacte a Star Water.',413);}
 if(api==='team-history'&&request.method==='GET')return json({changes:await sb('/rest/v1/team_changes?'+scope+'&select=action,changed_at,actor,current_data&order=changed_at.desc,id.desc&limit=100')});
 if(api==='team-file'&&request.method==='GET'){const r=await find(u.searchParams.get('id'),'document');const prefix=asada.id+'/'+r.related_id+'/';if(!r.payload.path?.startsWith(prefix))fail('El archivo no está disponible.',404);const result=await teamStorage('GET',r.payload.path);return new Response(result,{headers:{'Content-Type':r.payload.type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(r.payload.filename),'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY'}});}
 if(api==='team-upload'&&request.method==='POST'){
  const worker=await find(u.searchParams.get('worker'),'employee');
  const name=u.searchParams.get('name')?.trim(),category=u.searchParams.get('category')?.trim(),date=u.searchParams.get('date');
  if(!name||name.length>160||!category||category.length>120||!validDate(date))fail('Revise el nombre, la categoría y la fecha del documento.');
  const mime=request.headers.get('content-type');if(!['application/pdf','image/jpeg','image/png'].includes(mime))fail('Adjunte un PDF o una imagen JPG/PNG.');
  if(Number(request.headers.get('content-length'))>MAX)fail('El archivo debe pesar como máximo 2 MB.',413);
  const reader=request.body?.getReader();if(!reader)fail('Seleccione un archivo.');const chunks=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX){await reader.cancel();fail('El archivo debe pesar como máximo 2 MB.',413);}chunks.push(value);}
  const bytes=Buffer.concat(chunks);if(!size)fail('El archivo está vacío.');
  if(mime==='application/pdf'&&bytes.subarray(0,5).toString()!=='%PDF-'||mime==='image/png'&&bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||mime==='image/jpeg'&&bytes.subarray(0,3).toString('hex')!=='ffd8ff')fail('El contenido del archivo no corresponde al formato indicado.');
  const ext={'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'}[mime],path=asada.id+'/'+worker.id+'/'+randomUUID()+'.'+ext;
  await teamStorage('POST',path,bytes,mime);
  try{const rows=await sb('/rest/v1/team_records',{method:'POST',body:{asada_id:asada.id,kind:'document',related_id:worker.id,payload:{name,category,date,path,type:mime,size,filename:name.replace(/[\\/\r\n]/g,'_')+'.'+ext},created_by:who.user.id,updated_by:who.user.id},prefer:'return=representation'});return json({record:rows[0]},201);}catch(e){try{await teamStorage('DELETE',path);}catch{}throw e;}
 }
 if(api!=='team-save'||request.method!=='POST')fail('Operación no disponible.',404);
 if(!['employee','profile','evaluation','event','document'].includes(input.kind))fail('Seleccione un tipo de registro válido.');
 let old=null;if(input.id){old=await find(input.id,input.kind);if(!Number.isInteger(input.version)||input.version!==old.version)fail('Otra persona cambió este registro. Actualice antes de editar.',409);}
 if(input.archive&&!old)fail('Seleccione el registro que desea archivar.');
 if(input.kind==='document'&&!input.archive)fail('Use el formulario para adjuntar documentos.');
 const related=old?old.related_id:input.related_id||null;
 if(['evaluation','event','document'].includes(input.kind)&&!input.archive)await find(related,'employee');
 if(['employee','profile'].includes(input.kind)&&related)fail('Este registro no se vincula a un trabajador.');
 const payload=input.archive?old.payload:validateTeam(input.kind,input.payload,fail);
 if(old&&input.kind==='evaluation'&&!input.archive&&(old.payload.evaluationVersion||1)!==(payload.evaluationVersion||1))fail('Conserve el modelo de esta evaluación. Cree una nueva evaluación para utilizar la escala sobre 100.');
 if(Buffer.byteLength(JSON.stringify(payload),'utf8')>9200)fail('El registro contiene demasiado texto. Resuma los ejemplos y observaciones antes de guardar.',413);
 if(input.kind==='employee'&&payload.profile_id&&!input.archive)await find(payload.profile_id,'profile');
 const row={payload,updated_by:who.user.id,updated_at:new Date().toISOString()};let rows;
 if(old){rows=await sb('/rest/v1/team_records?'+scope+'&id=eq.'+old.id+'&version=eq.'+old.version+'&deleted=eq.false',{method:'PATCH',body:{...row,version:old.version+1,deleted:input.archive===true},prefer:'return=representation'});if(!rows.length)fail('Otra persona cambió este registro. Actualice antes de editar.',409);}
 else rows=await sb('/rest/v1/team_records',{method:'POST',body:{...row,asada_id:asada.id,kind:input.kind,related_id:related,created_by:who.user.id},prefer:'return=representation'});
 return json({record:rows[0]},old?200:201);
}
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function validateTeam(kind,p,fail){
 if(!p||typeof p!=='object'||Array.isArray(p))fail('Revise los datos del formulario.');
 const str=(k,label,max=500,required=true)=>{if(typeof p[k]!=='string'||p[k].length>max||required&&!p[k].trim())fail('Revise '+label+'.');return p[k].trim();};
 const dt=(k,label,required=true)=>{if(!p[k]&&!required)return '';if(!validDate(p[k]))fail('Revise '+label+'.');return p[k];};
 const number=(k,label)=>{if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<0||p[k]>1e10)fail('Revise '+label+'.');return Math.round(p[k]*100)/100;};
 if(kind==='employee'){
  const result={name:str('name','el nombre',160),identity:str('identity','la identificación',80,false),email:str('email','el correo',254,false),phone:str('phone','el teléfono',80,false),position:str('position','el puesto',160),start:dt('start','la fecha de ingreso'),end:dt('end','la fecha de salida',false),supervisor:str('supervisor','quién supervisa',160),contract:str('contract','las condiciones del contrato',500,false),schedule:str('schedule','la jornada y el horario',500,false),salary:number('salary','el salario'),salaryPeriod:str('salaryPeriod','la periodicidad del salario',80),emergency:str('emergency','el contacto de emergencia',300,false),status:str('status','el estado',40),profile_id:str('profile_id','el perfil',36,false),note:str('note','las observaciones',1000,false)};
  if(!['Activo','Inactivo'].includes(result.status)||!['Mensual','Quincenal','Semanal','Por hora','Otro'].includes(result.salaryPeriod))fail('Seleccione el estado y la periodicidad del salario.');if(result.end&&result.end<result.start)fail('La salida no puede ser anterior al ingreso.');return result;
 }
 if(kind==='profile'){const r={name:str('name','el nombre del puesto',160),type:str('type','el tipo de puesto',80),purpose:str('purpose','el propósito',800),daily:str('daily','las tareas diarias',800,false),weekly:str('weekly','las tareas semanales',800,false),monthly:str('monthly','las tareas mensuales',800,false),occasional:str('occasional','las tareas ocasionales',800,false),supervisor:str('supervisor','a quién informa',300),authority:str('authority','la autoridad del puesto',800),requirements:str('requirements','la preparación necesaria',800),resources:str('resources','los recursos',800),results:str('results','los resultados esperados',800)};if(!evaluationCriteria[r.type])fail('Seleccione un tipo de puesto.');return r;}
 if(kind==='event'){const r={type:str('type','el tipo de seguimiento',80),date:dt('date','la fecha'),end:dt('end','la fecha final',false),title:str('title','el motivo',300),quantity:number('quantity','la cantidad'),unit:str('unit','la unidad',60,false),responsible:str('responsible','el responsable',160),note:str('note','las observaciones',1200,false)};if(!['Vacaciones','Permiso','Capacitación','Entrega de equipo','Seguimiento'].includes(r.type))fail('Seleccione un tipo de seguimiento.');if(r.end&&r.end<r.date)fail('Revise las fechas del seguimiento.');return r;}
 if(kind==='evaluation'){
  const r={type:str('type','el tipo de puesto',80),start:dt('start','el inicio del período'),end:dt('end','el cierre del período'),date:dt('date','la fecha de evaluación'),evaluator:str('evaluator','quién evalúa',160),strengths:str('strengths','las fortalezas',1000,false),difficulties:str('difficulties','las dificultades',1000,false),support:str('support','el apoyo necesario',1000),workerComment:str('workerComment','el comentario del trabajador',1000,false),commitment:str('commitment','el compromiso de mejora',1000),responsible:str('responsible','el responsable del seguimiento',160),review:dt('review','la fecha de revisión')};
  if(r.end<r.start||r.date<r.end||r.review<r.date)fail('Revise las fechas del período, la evaluación y la revisión.');if(!evaluationCriteria[r.type])fail('Seleccione un tipo de puesto.');
  const modern=p.evaluationVersion===2;
  if(p.evaluationVersion!==undefined&&p.evaluationVersion!==1&&!modern)fail('El modelo de evaluación no es válido.');
  const expected=modern?evaluationAreas(r.type).flatMap(a=>a.criteria):[...commonCriteria,...evaluationCriteria[r.type]];
  if(!Array.isArray(p.ratings)||p.ratings.length!==expected.length)fail('Complete los criterios de la evaluación.');
  r.ratings=p.ratings.map((v,i)=>{if(!v||!Number.isInteger(v.score)||v.score<0||v.score>(modern?5:4)||typeof v.evidence!=='string'||v.evidence.length>(modern?250:400)||((modern||v.score>0)&&!v.evidence.trim()))fail(modern?'Agregue un ejemplo para cada valoración o explique por qué no se pudo valorar.':'Agregue un ejemplo para cada criterio valorado.');return {criterion:expected[i],score:v.score,evidence:v.evidence.trim()};});
  if(modern){r.successIndicator=str('successIndicator','cómo se comprobará la mejora',500);r.evaluationVersion=2;const result=evaluationResult(r);r.result={score:result.score,complete:result.complete,count:result.count,coverage:result.coverage,label:result.label};}
  return r;
 }
 fail('Tipo de registro no válido.');
}
