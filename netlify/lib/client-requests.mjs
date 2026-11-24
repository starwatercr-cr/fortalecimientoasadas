const route = '/rest/v1/client_requests';
const kinds = {disponibilidad:'Disponibilidad de agua', negativa:'Negativa de agua', proyecto:'Proyecto de agua', fuente:'Inscripción de fuente o concesión'};
const statuses = ['Nuevo','En revisión','Pendiente de información','Cerrado'];
const types = {'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'};
const fields = {
  disponibilidad: ['use','operator'],
  negativa: ['operator','responseDate','reason'],
  proyecto: ['projectType','stage','units'],
  fuente: ['sourceProcedure','sourceType','sourceName','sourceLocation','sourceUse','sourceFlow','hasMeasurements','interestedIdentification','sourceDemand']
};
const required = {disponibilidad:'use', negativa:'operator', proyecto:'projectType'};

export async function clientRequests(api, request, {sb, owner, body, uuid, json, PublicError}) {
  if (api==='client-request-submit' && request.method==='POST') {
    const input=await body(request,4250000);
    const clean=(key,max)=>typeof input?.[key]==='string' ? input[key].trim().slice(0,max) : '';
    const kind=clean('kind',20), id=clean('id',36);
    if (!uuid(id) || !Object.hasOwn(kinds,kind) || input.accept!==true || clean('website',150)) throw new PublicError(400,'Revise los datos de la consulta.');
    const details={name:clean('name',140),email:clean('email',254),phone:clean('phone',35),location:clean('location',250),ownerName:clean('ownerName',140),ownerIdentification:clean('ownerIdentification',40),description:clean('description',3000)};
    for (const field of fields[kind]) details[field]=clean(field,500);
    if (!details.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) || details.phone.replace(/\D/g,'').length<8 || !details.location || !details.description || (required[kind] && !details[required[kind]])) throw new PublicError(400,'Complete los datos de contacto y del caso.');
    if (kind==='fuente' && (!details.sourceProcedure || !details.sourceType || !details.sourceUse || !details.sourceDemand || !['Sí','No'].includes(details.hasMeasurements) || (details.sourceFlow && (!Number.isFinite(Number(details.sourceFlow)) || Number(details.sourceFlow)<=0)))) throw new PublicError(400,'Complete el trámite, el tipo de fuente, el uso y la información de aforos. El caudal debe ser mayor que cero.');
    const magic={'application/pdf':'JVBERi0','image/png':'iVBORw0KGgo','image/jpeg':'/9j/'};
    const recordFiles={};
    let totalBytes=0;
    const validateDocument=(value,type)=>{
      if (typeof value!=='string' || value.length>2796204 || !Object.hasOwn(types,type) || !value.startsWith(magic[type]) || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new PublicError(400,'Adjunte un archivo PDF, PNG o JPG de hasta 2 MB.');
      const bytes=Buffer.from(value,'base64').length;
      totalBytes+=bytes;
      if (bytes>2097152 || totalBytes>3145728) throw new PublicError(400,'Adjunte hasta 2 MB por archivo y 3 MB en total.');
    };
    for (const [key,column,allowed] of [['attachment','attachment',['negativa','fuente']],['sourcePlan','source_plan',['fuente']]]) {
      const value=input[key], type=clean(key+'Type',30);
      if (!value) continue;
      if (!allowed.includes(kind)) throw new PublicError(400,'Documento no permitido para este trámite.');
      validateDocument(value,type);
      recordFiles[column]=value;
      recordFiles[column+'_type']=type;
    }
    if (input.documents!==undefined) {
      const documents=input.documents;
      if (kind!=='negativa' || input.attachment || !Array.isArray(documents) || documents.length<1 || documents.length>5) throw new PublicError(400,'Adjunte hasta cinco documentos para la negativa.');
      for (const document of documents) validateDocument(document?.value,document?.type);
      recordFiles.negative_documents=documents.map(document=>document.value);
      recordFiles.negative_document_types=documents.map(document=>document.type);
    }
    const inserted=await sb(route+'?on_conflict=id&select=case_number',{method:'POST',prefer:'resolution=ignore-duplicates,return=representation',body:{id,kind,details,...recordFiles}});
    const [record]=inserted?.length ? inserted : await sb(route+'?id=eq.'+id+'&select=case_number');
    if (!record?.case_number) throw new PublicError(503,'No pudimos recuperar el número de caso. Intente de nuevo.');
    const caseNumber='6009-'+record.case_number;
    return json({id,caseNumber},201);
  }
  await owner();
  if (api==='client-request-new-count' && request.method==='GET') {
    const count=await sb(route+'?status=eq.Nuevo&select=id&limit=1',{prefer:'count=exact',count:true});
    return json({count});
  }
  const id=new URL(request.url).searchParams.get('id');
  if (api==='client-request-list' && request.method==='GET') {
    const limit=30, offset=Math.max(0,Math.min(100000,parseInt(new URL(request.url).searchParams.get('offset'),10)||0));
    if (id!==null && !uuid(id)) throw new PublicError(400,'Número de caso inválido.');
    const filter=id?'&id=eq.'+id:'&order=created_at.desc,id.desc&limit='+(limit+1)+'&offset='+offset;
    const rows=await sb(route+'?select=id,case_number,kind,status,created_at,details,identification,appointment,attachment_type,source_plan_type,negative_document_types'+filter);
    return json({rows:rows.slice(0,limit),next:rows.length>limit?offset+limit:null});
  }
  if (!uuid(id)) throw new PublicError(400,'Número de caso inválido.');
  if (api==='client-request-update' && request.method==='POST') {
    const input=await body(request);
    const appointment=input.appointment ? new Date(input.appointment) : null;
    if (!statuses.includes(input.status) || (appointment && !Number.isFinite(appointment.getTime()))) throw new PublicError(400,'Revise el estado y la fecha.');
    const rows=await sb(route+'?id=eq.'+id+'&select=id',{method:'PATCH',prefer:'return=representation',body:{status:input.status, appointment:appointment?.toISOString()||null}});
    if (!rows?.length) throw new PublicError(404,'Caso no encontrado.');
    return json({ok:true});
  }
  if (api==='client-request-file' && request.method==='GET') {
    const file=new URL(request.url).searchParams.get('document');
    const number=file?.match(/^negativa-([1-5])$/);
    if (file!==null && file!=='plano' && !number) throw new PublicError(404,'Documento no disponible.');
    const column=file==='plano'?'source_plan':'attachment';
    const columns=number?'negative_documents,negative_document_types':column+','+column+'_type';
    const [row]=await sb(route+'?id=eq.'+id+'&select=kind,'+columns);
    const index=number?Number(number[1])-1:0;
    const value=number?row?.negative_documents?.[index]:row?.[column];
    const type=number?row?.negative_document_types?.[index]:row?.[column+'_type'];
    if (!value || !Object.hasOwn(types,type)) throw new PublicError(404,'Documento no disponible.');
    const filename=number?'documento-'+number[1]:file==='plano'?'plano':row.kind==='fuente'?'aforos':'respuesta';
    return new Response(Buffer.from(value,'base64'),{headers:{'Content-Type':type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Content-Disposition':'attachment; filename="'+filename+'.'+types[type]+'"' }});
  }
  throw new PublicError(404,'Acción no disponible.');
}
