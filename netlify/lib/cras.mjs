import {catalog} from './cras-catalog.mjs';

const validDate = value => typeof value === 'string' && /^20\d\d-\d\d-\d\d$/.test(value)
  && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
const tidy = (value, max) => typeof value === 'string' ? value.trim().slice(0,max) : '';
const amount = value => typeof value === 'string' && /^\d{1,14}$/.test(value);
const accountCodes = new Map(catalog.map(row => [row.code,row]));
const services = ['AC','AL','HI','RH','NR'];

export async function accountingAPI(api,request,{sb,authorized,sessionToken,body,uuid,json,PublicError}){
  const who = await authorized(sessionToken(request));
  const fail = (message,status=400) => {throw new PublicError(status,message);};
  const canClose = who.admin || (!who.external && who.role === 'Administración');
  const canWrite = canClose || (who.external && who.modules.includes('cras'));
  if(who.termsPending || (!canWrite && (who.external || who.role !== 'Junta Directiva'))) {
    fail('Su cuenta no tiene acceso a contabilidad.',403);
  }
  const params = new URL(request.url).searchParams;
  const input = request.method === 'POST' ? await body(request,100000) : null;
  if(api==='cras-config' && request.method==='GET'){
    const asadas=who.admin
      ? await sb('/rest/v1/asadas?active=eq.true&select=id,name&order=name.asc')
      : [who.asada];
    return json({catalog,asadas,canWrite,canClose});
  }
  const asada = who.admin ? input?.asada ?? params.get('asada') : who.asada?.id;
  if(!uuid(asada)) fail('Seleccione una ASADA.');
  if(who.admin && !(await sb('/rest/v1/asadas?id=eq.'+asada+'&active=eq.true&select=id'))?.length) fail('ASADA no disponible.',404);
  const scope = 'asada_id=eq.'+asada;
  const rpc = (name,data) => sb('/rest/v1/rpc/cras_'+name,{method:'POST',body:{p_asada:asada,...data}});
  if(request.method==='GET'){
    const from=params.get('from'),to=params.get('to');
    if(!validDate(from)||!validDate(to)||from>to) fail('Revise las fechas del informe.');
    if(api==='cras-diary'){
      const offset=Number(params.get('offset')||0);
      if(!Number.isSafeInteger(offset)||offset<0) fail('Página inválida.');
      const account=params.get('account');
      if(account&&!accountCodes.has(account)) fail('Seleccione una cuenta válida.');
      const relation=account?'cras_lines!inner':'cras_lines';
      const filter=account?'&cras_lines.account=eq.'+account:'';
      const entries=await sb('/rest/v1/cras_entries?'+scope+'&entry_date=gte.'+from+'&entry_date=lte.'+to
        +'&select=id,entry_no,entry_date,kind,reference,memo,posted_at,reverses,'+relation+'(line_no,account,service,stage,system_name,justification,debit,credit)'
        +'&order=entry_date.desc,entry_no.desc&cras_lines.order=line_no.asc&limit=51&offset='+offset+filter);
      return json({entries:entries.slice(0,50),hasMore:entries.length>50});
    }
    if(api==='cras-balance'){
      const rows=[];
      for(let offset=0; offset<20000;offset+=500){
        const page=await sb('/rest/v1/rpc/cras_balance?limit=500&offset='+offset,{method:'POST',body:{p_asada:asada,p_from:from,p_to:to}});
        rows.push(...page);
        if(page.length<500) return json({rows});
      }
      fail('El informe supera 20.000 combinaciones contables. Consulte a soporte.');
    }
    if(api==='cras-periods'){
      return json({periods:await sb('/rest/v1/cras_periods?'+scope+'&month=gte.'+from.slice(0,7)+'-01&month=lte.'+to.slice(0,7)+'-01&order=month')});
    }
  }
  if(request.method==='POST'){
    if(!canWrite) fail('Su cuenta tiene acceso de consulta.',403);
    if(api==='cras-close'){
      if(!canClose) fail('El cierre mensual corresponde a la administración.',403);
      if(!validDate(input.month)||!input.month.endsWith('-01')) fail('Seleccione un mes válido.');
      const thisMonth=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit'}).formatToParts();
      const current=thisMonth.find(x=>x.type==='year').value+'-'+thisMonth.find(x=>x.type==='month').value+'-01';
      if(input.month>=current) fail('Puede cerrar solo meses ya finalizados.');
      await rpc('close',{p_actor:who.user.id,p_month:input.month});
      return json({ok:true});
    }
    if(api==='cras-post'){
      const {id,date,kind,reverses}=input;
      const reference=tidy(input.reference,120),memo=tidy(input.memo,500);
      if(!uuid(id)||!validDate(date)||!reference||!memo) fail('Complete la fecha, el comprobante y el concepto.');
      if(reverses!=null && !uuid(reverses)) fail('Asiento original inválido.');
      if(reverses==null && (!['diario','ajuste','apertura','orden'].includes(kind)||!Array.isArray(input.lines)
        ||input.lines.length<2||input.lines.length>100)) fail('Revise el tipo de asiento y agregue entre 2 y 100 líneas.');
      const lines=reverses ? [] : input.lines.map(line=>{
        const account=accountCodes.get(line?.account);
        if(!account||account.review||!services.includes(line.service)||!account.services.includes(line.service)
          ||!amount(line.debit)||!amount(line.credit)) fail('Revise la cuenta, el servicio y los importes de cada línea.');
        return {account:account.code,service:line.service,stage:tidy(line.stage,80),system:tidy(line.system,80),
          justification:tidy(line.justification,250),debit:BigInt(line.debit).toString(),credit:BigInt(line.credit).toString()};
      });
      const number=await rpc('post',{p_actor:who.user.id,p_id:id,p_date:date,p_kind:reverses?'reversion':kind,
        p_reference:reference,p_memo:memo,p_lines:lines,p_reverses:reverses??null});
      return json({number},201);
    }
  }
  fail('Operación no disponible.',404);
}
