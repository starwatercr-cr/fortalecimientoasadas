create table public.team_records (
 id uuid primary key default gen_random_uuid(),
 asada_id uuid not null references public.asadas(id),
 kind text not null check(kind in ('employee','profile','evaluation','event','document')),
 related_id uuid references public.team_records(id),
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=10000),
 version integer not null default 1 check(version>0),
 deleted boolean not null default false,
 created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check ((kind in ('employee','profile') and related_id is null) or (kind in ('evaluation','event','document') and related_id is not null))
);
create index team_scope_idx on public.team_records(asada_id,created_at,id);
create index team_related_idx on public.team_records(related_id);
create table public.team_changes (
 id bigint generated always as identity primary key,record_id uuid not null references public.team_records(id),
 asada_id uuid not null references public.asadas(id),actor uuid not null references auth.users(id),
 action text not null,previous jsonb,current_data jsonb not null,changed_at timestamptz not null default now()
);
create index team_changes_scope_idx on public.team_changes(asada_id,changed_at desc);
alter table public.team_records enable row level security;
alter table public.team_changes enable row level security;
revoke all on public.team_records,public.team_changes from public,anon,authenticated;
grant select,insert,update on public.team_records to service_role;
grant select,insert on public.team_changes to service_role;
grant usage,select on sequence public.team_changes_id_seq to service_role;
create function public.log_team_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.asada_id<>old.asada_id or new.kind<>old.kind or new.related_id is distinct from old.related_id or new.created_by<>old.created_by then raise exception 'Record identity is immutable'; end if;
  if new.version<>old.version+1 then raise exception 'Invalid record version'; end if;
 end if;
 if new.related_id is not null and not exists(select 1 from public.team_records p where p.id=new.related_id and p.asada_id=new.asada_id and p.kind='employee') then raise exception 'Invalid employee scope'; end if;
 insert into public.team_changes(record_id,asada_id,actor,action,previous,current_data)
 values(new.id,new.asada_id,new.updated_by,case when TG_OP='INSERT' then 'crear' when new.deleted then 'archivar' else 'editar' end,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end $$;
revoke all on function public.log_team_change() from public,anon,authenticated;
grant execute on function public.log_team_change() to service_role;
create trigger team_change after insert or update on public.team_records for each row execute function public.log_team_change();
