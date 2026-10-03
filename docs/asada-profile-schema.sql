create table public.asada_profiles (
 asada_id uuid primary key references public.asadas(id), payload jsonb not null default '{}'::jsonb,
 version integer not null default 1 check(version>0), updated_by uuid not null references auth.users(id), updated_at timestamptz not null default now()
);
create table public.asada_documents (
 id uuid primary key default gen_random_uuid(), asada_id uuid not null references public.asadas(id),
 name text not null, category text not null, filename text not null, path text not null unique, type text not null,
 size integer not null check(size>0 and size<=5242880), start_date date, end_date date,
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 check(end_date is null or start_date is null or end_date>=start_date)
);
create index asada_documents_scope on public.asada_documents(asada_id,created_at desc);
create table public.asada_profile_changes (
 id uuid primary key default gen_random_uuid(), asada_id uuid not null references public.asadas(id),
 actor uuid not null references auth.users(id), changed_at timestamptz not null default now(),
 previous_data jsonb, current_data jsonb not null
);
create index asada_profile_changes_scope on public.asada_profile_changes(asada_id,changed_at desc);
alter table public.asada_profiles enable row level security;
alter table public.asada_documents enable row level security;
alter table public.asada_profile_changes enable row level security;
revoke all on public.asada_profiles,public.asada_documents,public.asada_profile_changes from anon,authenticated;
grant all on public.asada_profiles,public.asada_documents,public.asada_profile_changes to service_role;
create function public.audit_asada_profile() returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if TG_OP='UPDATE' then
  if new.asada_id<>old.asada_id or new.version<>old.version+1 then raise exception 'Version de ficha invalida'; end if;
  insert into public.asada_profile_changes(asada_id,actor,previous_data,current_data) values(new.asada_id,new.updated_by,to_jsonb(old),to_jsonb(new));
 else
  insert into public.asada_profile_changes(asada_id,actor,current_data) values(new.asada_id,new.updated_by,to_jsonb(new));
 end if;
 return new;
end $$;
revoke all on function public.audit_asada_profile() from public,anon,authenticated;
create trigger asada_profile_audit after insert or update on public.asada_profiles for each row execute function public.audit_asada_profile();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('asada-profile-private','asada-profile-private',false,5242880,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
