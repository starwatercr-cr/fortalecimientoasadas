create table public.arrears_records (
 id uuid primary key default gen_random_uuid(), asada_id uuid not null references public.asadas(id),
 kind text not null check(kind in ('debt','collection','promise')), parent_id uuid,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=10000),
 version integer not null default 1 check(version>0), created_by uuid not null references auth.users(id),updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(asada_id,id),foreign key(asada_id,parent_id) references public.arrears_records(asada_id,id),
 check((kind='debt' and parent_id is null) or (kind<>'debt' and parent_id is not null))
);
create index arrears_scope_idx on public.arrears_records(asada_id,created_at,id);
create index arrears_parent_idx on public.arrears_records(asada_id,parent_id);
create unique index arrears_invoice_idx on public.arrears_records(asada_id,lower(payload->>'code'),lower(payload->>'invoice')) where kind='debt';
create table public.arrears_changes (
 id bigint generated always as identity primary key,record_id uuid not null references public.arrears_records(id),asada_id uuid not null references public.asadas(id),actor uuid not null references auth.users(id),previous jsonb,current_data jsonb not null,changed_at timestamptz not null default now()
);
create index arrears_changes_scope_idx on public.arrears_changes(asada_id,changed_at desc);
create table public.arrears_imports(asada_id uuid not null references public.asadas(id),request_id uuid not null,entries jsonb not null,result jsonb,created_at timestamptz not null default now(),primary key(asada_id,request_id));
alter table public.arrears_records enable row level security;
alter table public.arrears_changes enable row level security;
alter table public.arrears_imports enable row level security;
revoke all on public.arrears_records,public.arrears_changes,public.arrears_imports from public,anon,authenticated;
grant select,insert,update on public.arrears_records,public.arrears_imports to service_role;
grant select,insert on public.arrears_changes to service_role;
grant usage,select on sequence public.arrears_changes_id_seq to service_role;
create function public.log_arrears_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.asada_id<>old.asada_id or new.kind<>old.kind or new.created_by<>old.created_by or new.parent_id is distinct from old.parent_id or new.id<>old.id then raise exception 'Identidad del registro inmutable'; end if;
  if new.version<>old.version+1 then raise exception 'Versión inválida'; end if;
 end if;
 if new.kind='debt' then
  if not (new.payload ?& array['code','name','invoice','due','cutoff','balance']) or jsonb_typeof(new.payload->'balance')<>'number' or (new.payload->>'balance')::numeric<0 then raise exception 'Saldo inválido';end if;
 else
  if not exists(select 1 from public.arrears_records where id=new.parent_id and asada_id=new.asada_id and kind='debt') then raise exception 'Factura no disponible';end if;
 end if;
 insert into public.arrears_changes(record_id,asada_id,actor,previous,current_data) values(new.id,new.asada_id,new.updated_by,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));return new;
end $$;
revoke all on function public.log_arrears_change() from public,anon,authenticated;
grant execute on function public.log_arrears_change() to service_role;
create trigger arrears_change after insert or update on public.arrears_records for each row execute function public.log_arrears_change();
create function public.arrears_import(target_asada uuid,actor_id uuid,request_id uuid,entries jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare entry jsonb; old public.arrears_records; saved jsonb; n integer:=0; inserted integer;
begin
 if jsonb_typeof(entries)<>'array' or jsonb_array_length(entries) not between 1 and 500 then raise exception 'Importación inválida';end if;
 insert into public.arrears_imports(asada_id,request_id,entries) values(target_asada,request_id,entries) on conflict do nothing;
 get diagnostics inserted=row_count;
 if inserted=0 then
  select result into saved from public.arrears_imports i where i.asada_id=target_asada and i.request_id=arrears_import.request_id and i.entries=arrears_import.entries;
  if saved is null then raise exception 'Solicitud repetida con datos distintos';end if;return saved;
 end if;
 for entry in select value from jsonb_array_elements(entries) order by value->>'id',value->'payload'->>'code',value->'payload'->>'invoice' loop
  if entry->>'id' is not null then
   select * into old from public.arrears_records where id=(entry->>'id')::uuid and asada_id=target_asada and kind='debt' for update;
   if not found or old.version<>(entry->>'version')::integer then raise exception 'Los saldos cambiaron. Actualice y revise el archivo de nuevo';end if;
   if lower(old.payload->>'code')<>lower(entry->'payload'->>'code') or lower(old.payload->>'invoice')<>lower(entry->'payload'->>'invoice') or (entry->'payload'->>'cutoff')::date<(old.payload->>'cutoff')::date then raise exception 'Revise la identidad y fecha de corte';end if;
   update public.arrears_records set payload=entry->'payload',version=version+1,updated_by=actor_id,updated_at=now() where id=old.id;
  else
   insert into public.arrears_records(asada_id,kind,payload,created_by,updated_by) values(target_asada,'debt',entry->'payload',actor_id,actor_id);
  end if;n:=n+1;
 end loop;
 saved=jsonb_build_object('saved',n);update public.arrears_imports i set result=saved where i.asada_id=target_asada and i.request_id=arrears_import.request_id;return saved;
end $$;
revoke all on function public.arrears_import(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.arrears_import(uuid,uuid,uuid,jsonb) to service_role;
