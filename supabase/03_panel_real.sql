create table public.panel_records (
 id uuid primary key default gen_random_uuid(),
 asada_id uuid not null references public.asadas(id),
 year integer not null check(year between 1900 and 2200),
 kind text not null check(kind in ('settings','movement','petty','budget','statement','asset','agreement','payment')),
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=10000),
 version integer not null default 1 check(version>0),
 deleted boolean not null default false,
 created_by uuid not null references auth.users(id),
 updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index panel_scope_idx on public.panel_records(asada_id,year,created_at,id) where not deleted;
create unique index panel_singletons_idx on public.panel_records(asada_id,year,kind) where not deleted and kind in ('settings','statement');
create table public.panel_changes (
 id bigint generated always as identity primary key,
 record_id uuid not null references public.panel_records(id),
 asada_id uuid not null references public.asadas(id),
 year integer not null,
 actor uuid not null references auth.users(id),
 action text not null,
 previous jsonb,
 current_data jsonb not null,
 changed_at timestamptz not null default now()
);
create index panel_changes_scope_idx on public.panel_changes(asada_id,year,changed_at desc);
alter table public.panel_records enable row level security;
alter table public.panel_changes enable row level security;
revoke all on public.panel_records,public.panel_changes from public,anon,authenticated;
grant select,insert,update on public.panel_records to service_role;
grant select,insert on public.panel_changes to service_role;
grant usage,select on sequence public.panel_changes_id_seq to service_role;
create function public.log_panel_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.asada_id<>old.asada_id or new.year<>old.year or new.kind<>old.kind or new.created_by<>old.created_by then raise exception 'Record identity is immutable'; end if;
  if new.version<>old.version+1 then raise exception 'Invalid record version'; end if;
 end if;
 insert into public.panel_changes(record_id,asada_id,year,actor,action,previous,current_data)
 values(new.id,new.asada_id,new.year,new.updated_by,case when TG_OP='INSERT' then 'crear' when new.deleted then 'archivar' else 'editar' end,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end $$;
revoke all on function public.log_panel_change() from public,anon,authenticated;
grant execute on function public.log_panel_change() to service_role;
create trigger panel_change after insert or update on public.panel_records for each row execute function public.log_panel_change();
