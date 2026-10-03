create table public.assembly_drafts(
 id uuid primary key default gen_random_uuid(),asada_id uuid not null references public.asadas(id),
 year integer not null check(year between 1900 and 2200),type text not null check(type in ('presidencia','tesoreria','fiscalia')),
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=170000),
 version integer not null default 1 check(version>0),created_by uuid not null references auth.users(id),updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(asada_id,year,type)
);
create table public.assembly_draft_changes(id bigint generated always as identity primary key,draft_id uuid not null references public.assembly_drafts(id),asada_id uuid not null references public.asadas(id),actor uuid not null references auth.users(id),changed_at timestamptz not null default now(),previous_data jsonb,current_data jsonb not null);
alter table public.assembly_drafts enable row level security;
alter table public.assembly_draft_changes enable row level security;
revoke all on public.assembly_drafts,public.assembly_draft_changes from public,anon,authenticated;
grant select,insert,update on public.assembly_drafts to service_role;
grant select,insert on public.assembly_draft_changes to service_role;
grant usage,select on sequence public.assembly_draft_changes_id_seq to service_role;
create function public.log_assembly_draft_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if new.asada_id<>old.asada_id or new.year<>old.year or new.type<>old.type or new.created_by<>old.created_by then raise exception 'Draft identity is immutable';end if;
  if new.version<>old.version+1 then raise exception 'Invalid version';end if;
 end if;
 insert into public.assembly_draft_changes(draft_id,asada_id,actor,previous_data,current_data) values(new.id,new.asada_id,new.updated_by,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
 return new;
end;$$;
revoke all on function public.log_assembly_draft_change() from public,anon,authenticated;
create trigger assembly_draft_audit after insert or update on public.assembly_drafts for each row execute function public.log_assembly_draft_change();
