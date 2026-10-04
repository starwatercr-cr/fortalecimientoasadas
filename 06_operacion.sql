create table public.operation_records (
 id uuid primary key default gen_random_uuid(),asada_id uuid not null references public.asadas(id),
 kind text not null check(kind in ('point','log','chlorine')),date date,
 related_id uuid references public.operation_records(id),followup_id uuid references public.operation_records(id),
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=9000),
 version integer not null default 1 check(version>0),deleted boolean not null default false,
 created_by uuid not null references auth.users(id),updated_by uuid not null references auth.users(id),
 reviewed_by uuid references auth.users(id),reviewed_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 check((kind='point' and date is null and related_id is null and followup_id is null) or (kind='log' and date is not null and related_id is null and followup_id is null) or (kind='chlorine' and date is not null and related_id is not null)),
 check((reviewed_by is null)=(reviewed_at is null))
);
create index operation_scope_idx on public.operation_records(asada_id,date,kind);
create table public.operation_changes (
 id bigint generated always as identity primary key,record_id uuid not null references public.operation_records(id),
 asada_id uuid not null references public.asadas(id),actor uuid not null references auth.users(id),
 action text not null,previous jsonb,current_data jsonb not null,changed_at timestamptz not null default now()
);
create index operation_changes_idx on public.operation_changes(asada_id,changed_at desc);
alter table public.operation_records enable row level security;
alter table public.operation_changes enable row level security;
revoke all on public.operation_records,public.operation_changes from public,anon,authenticated;
grant select,insert,update on public.operation_records to service_role;
grant select,insert on public.operation_changes to service_role;
grant usage,select on sequence public.operation_changes_id_seq to service_role;
create function public.log_operation_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.asada_id<>old.asada_id or new.kind<>old.kind or new.related_id is distinct from old.related_id or new.followup_id is distinct from old.followup_id or new.created_by<>old.created_by then raise exception 'Record identity is immutable'; end if;
  if new.version<>old.version+1 then raise exception 'Invalid record version'; end if;
 end if;
 if new.related_id is not null and not exists(select 1 from public.operation_records p where p.id=new.related_id and p.asada_id=new.asada_id and p.kind='point') then raise exception 'Invalid point scope'; end if;
 if new.followup_id is not null and not exists(select 1 from public.operation_records p where p.id=new.followup_id and p.asada_id=new.asada_id and p.kind='chlorine' and p.related_id=new.related_id and p.payload->>'type'=new.payload->>'type') then raise exception 'Invalid followup scope'; end if;
 insert into public.operation_changes(record_id,asada_id,actor,action,previous,current_data)
 values(new.id,new.asada_id,new.updated_by,case when TG_OP='INSERT' then 'crear' when new.deleted then 'archivar' when new.reviewed_at is distinct from old.reviewed_at and new.reviewed_at is not null then 'revisar' else 'editar' end,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));return new;
end $$;
revoke all on function public.log_operation_change() from public,anon,authenticated;
grant execute on function public.log_operation_change() to service_role;
create trigger operation_change after insert or update on public.operation_records for each row execute function public.log_operation_change();
