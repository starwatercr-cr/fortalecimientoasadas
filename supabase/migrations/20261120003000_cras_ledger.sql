create table public.cras_accounts (
  code text primary key,
  name text not null,
  services text[] not null,
  needs_review boolean not null default false
);
create table public.cras_periods (
  asada_id uuid not null references public.asadas(id),
  month date not null check (extract(day from month)=1),
  closed_at timestamptz not null default now(),
  closed_by uuid not null,
  primary key (asada_id,month)
);
create table public.cras_entries (
  asada_id uuid not null references public.asadas(id),
  id uuid not null,
  entry_no bigint generated always as identity,
  entry_date date not null,
  kind text not null check (kind in ('apertura','diario','ajuste','orden','reversion')),
  reference text not null check (length(reference) between 1 and 120),
  memo text not null check (length(memo) between 1 and 500),
  posted_by uuid not null,
  posted_at timestamptz not null default now(),
  reverses uuid,
  primary key (asada_id,id),
  unique (entry_no),
  unique (asada_id,reverses),
  foreign key (asada_id,reverses) references public.cras_entries(asada_id,id)
);
create index cras_entries_period on public.cras_entries(asada_id,entry_date,entry_no);
create table public.cras_lines (
  asada_id uuid not null,
  entry_id uuid not null,
  line_no integer not null,
  account text not null references public.cras_accounts(code),
  service text not null check (service in ('AC','AL','HI','RH','NR')),
  stage text not null,
  system_name text not null,
  justification text not null,
  debit bigint not null check (debit between 0 and 99999999999999),
  credit bigint not null check (credit between 0 and 99999999999999),
  check ((debit>0) <> (credit>0)),
  primary key (asada_id,entry_id,line_no),
  foreign key (asada_id,entry_id) references public.cras_entries(asada_id,id)
);
alter table public.cras_accounts enable row level security;
alter table public.cras_periods enable row level security;
alter table public.cras_entries enable row level security;
alter table public.cras_lines enable row level security;
revoke all on public.cras_accounts,public.cras_periods,public.cras_entries,public.cras_lines from public,anon,authenticated;
grant select on public.cras_accounts,public.cras_periods,public.cras_entries,public.cras_lines to service_role;
grant insert on public.cras_periods,public.cras_entries,public.cras_lines to service_role;
grant usage on sequence public.cras_entries_entry_no_seq to service_role;

create function public.cras_post(
  p_asada uuid, p_actor uuid, p_id uuid, p_date date, p_kind text,
  p_reference text, p_memo text, p_lines jsonb, p_reverses uuid default null
) returns bigint language plpgsql set search_path='' as $$
declare
  line jsonb;
  item integer:=0;
  posting_no bigint;
  entry_kind text;
  source_date date;
  period date:=date_trunc('month',p_date)::date;
  difference numeric;
begin
  perform pg_advisory_xact_lock(hashtextextended('cras:'||p_asada::text,0));
  select entry_no into posting_no from public.cras_entries where asada_id=p_asada and id=p_id;
  if found then
    if not exists(select 1 from public.cras_entries where asada_id=p_asada and id=p_id
      and entry_date=p_date and kind=p_kind and reference=p_reference and memo=p_memo and reverses is not distinct from p_reverses)
      or (p_reverses is null and p_lines is distinct from (
        select jsonb_agg(jsonb_build_object('account',account,'service',service,'stage',stage,'system',system_name,
          'justification',justification,'debit',debit::text,'credit',credit::text) order by line_no)
        from public.cras_lines where asada_id=p_asada and entry_id=p_id)) then
      raise exception 'CRAS: El identificador ya se usó con datos diferentes. Revise el libro diario.';
    end if;
    return posting_no;
  end if;
  if exists(select 1 from public.cras_periods where asada_id=p_asada and month=period) then
    raise exception 'CRAS: El mes seleccionado está cerrado.';
  end if;
  if p_reverses is not null then
    select kind,entry_date into entry_kind,source_date from public.cras_entries where asada_id=p_asada and id=p_reverses;
    if not found or entry_kind='reversion' or p_date<source_date then
      raise exception 'CRAS: Asiento o fecha de reversión inválidos.';
    end if;
    if exists(select 1 from public.cras_entries where asada_id=p_asada and reverses=p_reverses) then
      raise exception 'CRAS: El asiento ya fue revertido.';
    end if;
    p_kind:='reversion';
  elsif p_kind not in ('diario','apertura','ajuste','orden') then
    raise exception 'CRAS: Tipo de asiento inválido.';
  end if;
  insert into public.cras_entries(asada_id,id,entry_date,kind,reference,memo,posted_by,reverses)
    values(p_asada,p_id,p_date,p_kind,p_reference,p_memo,p_actor,p_reverses) returning entry_no into posting_no;
  if p_reverses is not null then
    insert into public.cras_lines
      select asada_id,p_id,line_no,account,service,stage,system_name,justification,credit,debit
      from public.cras_lines where asada_id=p_asada and entry_id=p_reverses;
    return posting_no;
  end if;
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) not between 2 and 100 then
    raise exception 'CRAS: Registre entre 2 y 100 líneas.';
  end if;
  for line in select value from jsonb_array_elements(p_lines) loop
    item:=item+1;
    if not exists(select 1 from public.cras_accounts a where a.code=line->>'account' and not a.needs_review and (line->>'service')=any(a.services))
      or ((p_kind='orden') is distinct from (left(line->>'account',1)='6'))
      or (p_kind='apertura' and left(line->>'account',1) not in ('1','2','3')) then
      raise exception 'CRAS: Revise la cuenta, el servicio y el tipo de asiento.';
    end if;
    if line->>'account' ~ '(^|\.)99(\.|$)' and coalesce(trim(line->>'justification'),'')='' then
      raise exception 'CRAS: Justifique el uso de una cuenta residual.';
    end if;
    insert into public.cras_lines values(p_asada,p_id,item,line->>'account',line->>'service',
      coalesce(line->>'stage',''),coalesce(line->>'system',''),coalesce(line->>'justification',''),
      (line->>'debit')::bigint,(line->>'credit')::bigint);
  end loop;
  select sum(debit::numeric-credit) into difference from public.cras_lines where asada_id=p_asada and entry_id=p_id;
  if difference<>0 then raise exception 'CRAS: El total del debe debe ser igual al haber.'; end if;
  return posting_no;
end;
$$;

create function public.cras_close(p_asada uuid,p_actor uuid,p_month date)
returns void language plpgsql set search_path='' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('cras:'||p_asada::text,0));
  insert into public.cras_periods(asada_id,month,closed_by) values(p_asada,p_month,p_actor)
  on conflict do nothing;
end;
$$;

create function public.cras_balance(p_asada uuid,p_from date,p_to date)
returns table(account text,service text,stage text,system_name text,opening text,debit text,credit text)
stable language sql set search_path='' as $$
 select l.account,l.service,l.stage,l.system_name,
   coalesce(sum(l.debit::numeric-l.credit) filter(where e.entry_date<p_from),0)::text,
   coalesce(sum(l.debit) filter(where e.entry_date>=p_from),0)::text,
   coalesce(sum(l.credit) filter(where e.entry_date>=p_from),0)::text
 from public.cras_entries e join public.cras_lines l on l.asada_id=e.asada_id and l.entry_id=e.id
 where e.asada_id=p_asada and e.entry_date<=p_to
 group by l.account,l.service,l.stage,l.system_name
 order by l.account,l.service,l.stage,l.system_name;
$$;

revoke execute on function public.cras_post(uuid,uuid,uuid,date,text,text,text,jsonb,uuid),
 public.cras_close(uuid,uuid,date),public.cras_balance(uuid,date,date) from public,anon,authenticated;
grant execute on function public.cras_post(uuid,uuid,uuid,date,text,text,text,jsonb,uuid),
 public.cras_close(uuid,uuid,date),public.cras_balance(uuid,date,date) to service_role;

insert into public.cras_accounts(code,name,services,needs_review) values
('1.1.1','EFECTIVO Y EQUIVALENTES DE EFECTIVO',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.2','INVERSIONES TRANSITORIAS',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.3','CUENTAS POR COBRAR DE SERVICIOS',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.4','OTRAS CUENTAS POR COBRAR',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.5','ESTIMACIÓN DE INCOBRABLES DE SERVICIOS',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.6','ESTIMACIÓN DE INCOBRABLES DE OTRAS CUENTAS POR COBRAR ',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.7','INVENTARIOS',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.8','IMPUESTO AL VALOR AGREGADO PAGADO',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.9','IVA CON DERECHO A CRÉDITO FISCAL',array['AC','AL','HI','NR','RH']::text[],false),
('1.1.99','OTROS ACTIVOS A CORTO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('1.2.1','INVERSIONES A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('1.2.2','DOCUMENTOS POR COBRAR A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('1.2.3','CUENTAS A COBRAR A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('1.2.4','OTROS ACTIVOS A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],true),
('1.2.5','PROPIEDADES PLANTA Y EQUIPO',array['AC','AL','HI','NR','RH']::text[],false),
('1.2.6','OBRAS EN PROCESO Y DISEÑO DE CONSTRUCCIÓN',array['AC','AL','HI','NR','RH']::text[],false),
('1.2.7','FONDOS RESTRINGIDOS PARA INVERSIÓN',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.1','CUENTAS POR PAGAR A CORTO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.2','CUENTAS POR PAGAR SALARIOS Y OBLIGACIONES PATRONALES',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.3','RETENCIONES POR PAGAR',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.4','PORCIÓN CIRCULANTE DEL PASIVO A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.5','IMPUESTO AL VALOR AGREGADO POR PAGAR',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.6','PASIVO POR ARRENDAMIENTO CORTO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.7','INTERESES POR ARRENDAMIENTO',array['AC','AL','HI','NR','RH']::text[],false),
('2.1.99','OTROS PASIVOS A CORTO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('2.2.1','CUENTAS POR PAGAR A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('2.2.2','DOCUMENTOS  POR PAGAR A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('2.2.3','INGRESO DIFERIDO POR DONACIONES',array['AC','AL','HI','NR','RH']::text[],false),
('2.2.4','PASIVO POR ARRENDAMIENTO A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('2.2.5','INTERESES POR ARRENDAMIENTO (LARGO PLAZO)',array['AC','AL','HI','NR','RH']::text[],false),
('2.2.99','OTROS PASIVOS A LARGO PLAZO',array['AC','AL','HI','NR','RH']::text[],false),
('3.1','CAPITAL SOCIAL',array['AC','AL','HI','NR','RH']::text[],true),
('3.2','CAPITAL DONADO',array['AC','AL','HI','NR','RH']::text[],false),
('3.3','SUPERÁVIT POR REVALUACIÓN DE ACTIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('3.4','SUPERÁVIT O PÉRDIDA ACUMULADA',array['AC','AL','HI','NR','RH']::text[],false),
('3.5','SUPERÁVIT O PÉRDIDA DEL PERIODO',array['AC','AL','HI','NR','RH']::text[],false),
('3.99','OTRAS CUENTAS DE PATRIMONIO',array['AC','AL','HI','NR','RH']::text[],true),
('4.1.1','INGRESOS POR TARIFA RESIDENCIAL (Re)',array['AC','AL','HI','RH']::text[],false),
('4.1.2','INGRESOS POR TARIFA GRANDES CONSUMIDORES RESIDENCIALES  (T-GCR)',array['AC','AL','HI','RH']::text[],false),
('4.1.3','INGRESOS POR TARIFA DE COMERCIO Y SERVCIOS (T-CS)',array['AC','AL','HI','RH']::text[],false),
('4.1.4','INGRESOS POR TARIFA INDUSTRIAL (In)',array['AC','AL','HI','RH']::text[],false),
('4.1.5','INGRESOS POR TARIFA PREFERENCIAL (Pre)',array['AC','AL','HI','RH']::text[],false),
('4.1.6','INGRESOS POR TARIFA RESIDENCIAL-SOCIAL POBREZA BÁSICA (T-Re-PB)',array['AC','AL','HI','RH']::text[],false),
('4.1.7','INGRESOS  POR TARIFA RESIDENCIAL-SOCIAL POBREZA EXTREMA (T-Re-PE)',array['AC','AL','HI','RH']::text[],false),
('4.1.8','INGRESOS  POR TARIFA GRANDES CONSUMIDORES RESIDENCIALES DE BIEN SOCIAL  (T-GC-Re-BS)',array['AC','AL','HI','RH']::text[],false),
('4.1.9','INGRESOS POR TARIFA RESIDENCIAL HORARIO (T-Re-H)',array['AC','AL','HI','RH']::text[],false),
('4.1.99','OTROS INGRESOS POR SERVICIOS REGULADOS',array['AC','AL','HI','RH']::text[],false),
('4.2','OTROS INGRESOS OPERATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('4.2.1','OTROS INGRESOS DE OPERACIÓN - SERVICIOS CONEXOS',array['AC','AL']::text[],false),
('4.2.2','TASA URBANÍSTICA',array['AC','AL','HI']::text[],false),
('4.2.3','OTROS INGRESOS DE OPERACIÓN - MORA Y MULTAS',array['AC','AL','HI','NR','RH']::text[],false),
('4.2.4','TRANSFERENCIAS DEL SECTOR PÚBLICO',array['AC','AL','HI','RH']::text[],false),
('4.2.5','TRANSFERENCIAS DEL SECTOR PRIVADO',array['AC','AL','HI','RH']::text[],false),
('4.2.6','VENTA DE AGUA EN BLOQUE',array['AC']::text[],false),
('4.2.7','INGRESOS POR TRANSFERENCIAS DEL SERVICIO DE ACUEDUCTO',array['RH']::text[],false),
('4.2.8','INGRESOS POR TRANSFERENCIAS DEL SERVICIO DE ALCANTARILLADO',array['RH']::text[],false),
('4.2.9','INGRESOS POR TRANSFERENCIAS DEL SERVICIO DE HIDRANTES',array['RH']::text[],false),
('4.3','OTROS INGRESOS NO OPERATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('4.4','INGRESOS FINANCIEROS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.1','SUELDOS Y SALARIOS OPERATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.2','CONTRIBUCIONES SOCIALES OPERATIVAS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.3','PRESTACIONES LEGALES OPERATIVAS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.4','MATERIALES Y SUMINISTROS OPERATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.5','COMBUSTIBLES Y LUBRICANTES',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.6','SERVICIOS OPERATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.7','ELECTRICIDAD OPERATIVA',array['AC','AL','HI','RH']::text[],true),
('5.1.8','SERVICIOS CONTRATADOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.9','GASTOS DE OPERACIÓN AMBIENTAL',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.10','CANONES PAGADOS A  ENTIDADES PÚBLICAS',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.10.01','CANON DE REGULACIÓN ARESEP',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.11','GASTOS DE SERVICIOS CONEXOS',array['AC','AL']::text[],false),
('5.1.12','GASTOS DE DEPRECIACIÓN Y AMORTIZACIÓN OPERATIVA',array['AC','AL','HI','NR','RH']::text[],false),
('5.1.13','GASTOS DE ALMACENAMIENTO',array['AC','AL','HI','RH']::text[],true),
('5.1.16','GASTOS DE ALMACENAMIENTO',array['AC','AL','HI','RH']::text[],true),
('5.1.99','OTROS GASTOS OPERATIVOS',array['AC','AL','HI','RH']::text[],false),
('5.2.1','SUELDOS Y SALARIOS ADMINISTRATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.2.2','CONTRIBUCIONES SOCIALES ADMINISTRATIVAS',array['AC','AL','HI','NR','RH']::text[],false),
('5.2.3','PRESTACIONES LEGALES ADMINISTRATIVAS',array['AC','AL','HI','NR','RH']::text[],false),
('5.2.4','MATERIALES Y SUMINISTROS ADMINISTRATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.2.5','SERVICIOS ADMINISTRATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.2.5.04.04','SERVICIOS AMBIENTALES',array['RH']::text[],false),
('5.2.6','GASTOS DE DEPRECIACIÓN Y AMORTIZACIÓN ADMINISTRATIVA',array['AC','AL','HI','NR','RH']::text[],false),
('5.2.99','OTROS GASTOS ADMINISTRATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.3','GASTOS COMERCIALES',array['AC','AL','HI','NR','RH']::text[],false),
('5.4','GASTOS DE CALIDAD DEL PRODUCTO',array['AC','AL','HI','RH']::text[],false),
('5.5','OTROS  GASTOS NO OPERATIVOS',array['AC','AL','HI','NR','RH']::text[],false),
('5.6','GASTOS  FINANCIEROS',array['AC','AL','HI','NR','RH']::text[],false),
('6.1.1','GARANTÍAS DE CUMPLIMIENTO Y EN CUSTODIA',array['AC','AL','HI','NR','RH']::text[],false),
('6.1.2','GASTOS O INGRESOS POR DIFERENCIALES CAMBIARIOS',array['AC','AL','HI','NR','RH']::text[],false),
('6.1.3','ACTIVOS CONTINGENTES',array['AC','AL','HI','NR','RH']::text[],false),
('6.1.4','INGRESOS CONTINGENTES',array['AC','AL','HI','NR','RH']::text[],false),
('6.1.5','PRESTAMOS INSTITUCIONALES',array['AC','AL','HI','NR','RH']::text[],false),
('6.1.7','OTRAS CUENTAS DE ORDEN',array['AC','AL','HI','NR','RH']::text[],false),
('6.1.8','CUENTA DE CONTROL O CIERRE',array['AC','AL','HI','NR','RH']::text[],false);
