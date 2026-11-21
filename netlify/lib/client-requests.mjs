const route = '/rest/v1/client_requests';
const kinds = {disponibilidad:'Disponibilidad de agua', negativa:'Negativa de agua', proyecto:'Proyecto de agua'};
const statuses = ['Nuevo','En revisión','Pendiente de información','Cerrado'];
const types = {'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg'};
const fields = {
  disponibilidad: ['use','operator'],
  negativa: ['operator','responseDate','reason'],
  proyecto: ['projectType','stage','units']
};
const required = {disponibilidad:'use', negativa:'operator', proyecto:'projectType'};

export async function clientRequests(api, request, {sb, owner, body, uuid, json, PublicError}) {
  if (api==='client-request-submit' && request.method==='POST') {
    const input=await body(request,2850000);
    const clean=(key,max)=>typeof input?.[key]==='string' ? input[key].trim().slice(0,max) : '';
    const kind=clean('kind',20), id=clean('id',36);
    if (!uuid(id) || !Object.hasOwn(kinds,kind) || input.accept!==true || clean('website',150)) throw new PublicError(400,'Revise los datos de la consulta.');
    const details={name:clean('name',140),email:clean('email',254),phone:clean('phone',35),location:clean('location',250),ownerName:clean('ownerName',140),ownerIdentification:clean('ownerIdentification',40),description:clean('description',3000)};
    for (const field of fields[kind]) details[field]=clean(field,500);
    if (!details.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) || details.phone.replace(/\D/g,'').length<8 || !details.location || !details.description || !details[required[kind]]) throw new PublicError(400,'Complete los datos de contacto y del caso.');
    const attachment=clean('attachment',2800000), type=clean('attachmentType',30);
    const magic={'application/pdf':'JVBERi0','image/png':'iVBORw0KGgo','image/jpeg':'/9j/'};
    if (attachment && (kind!=='negativa' || !Object.hasOwn(types,type) || !attachment.startsWith(magic[type]) || !/^[A-Za-z0-9+/]+={0,2}$/.test(attachment) || Buffer.from(attachment,'base64').length>2097152)) throw new PublicError(400,'Adjunte un archivo PDF, PNG o JPG de hasta 2 MB.');
    const inserted=await sb(route+'?on_conflict=id&select=case_number',{method:'POST',prefer:'resolution=ignore-duplicates,return=representation',body:{id,kind,details,attachment:attachment||null,attachment_type:attachment?type:null}});
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
    const rows=await sb(route+'?select=id,case_number,kind,status,created_at,details,identification,appointment,attachment_type'+filter);
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
    const [row]=await sb(route+'?id=eq.'+id+'&select=attachment,attachment_type');
    if (!row?.attachment || !Object.hasOwn(types,row.attachment_type)) throw new PublicError(404,'Documento no disponible.');
    return new Response(Buffer.from(row.attachment,'base64'),{headers:{'Content-Type':row.attachment_type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Content-Disposition':'attachment; filename="respuesta.'+types[row.attachment_type]+'"' }});
  }
  throw new PublicError(404,'Acción no disponible.');
}
