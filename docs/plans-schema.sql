begin;
create table if not exists public.asada_plans (
 id uuid primary key default gen_random_uuid(),asada_id uuid not null references public.asadas(id),
 type text not null check(type in ('residues','water','risk','emergency')), payload jsonb not null check(jsonb_typeof(payload)='object'),
 version integer not null default 1 check(version>0),created_by uuid not null references auth.users(id),updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(id,asada_id)
);
create index if not exists asada_plans_scope_idx on public.asada_plans(asada_id,updated_at desc);
create table if not exists public.asada_plan_files (
 id uuid primary key default gen_random_uuid(),asada_id uuid not null references public.asadas(id),plan_id uuid not null,plan_version integer not null,
 name text not null,category text not null,filename text not null,path text not null unique,type text not null,size bigint not null check(size>0 and size<=5242880),
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),foreign key(plan_id,asada_id) references public.asada_plans(id,asada_id)
);
create index if not exists asada_plan_files_scope_idx on public.asada_plan_files(asada_id,plan_id);
alter table public.asada_plans enable row level security;
alter table public.asada_plan_files enable row level security;
revoke all on public.asada_plans,public.asada_plan_files from anon,authenticated;
grant select,insert,update on public.asada_plans to service_role;
grant select,insert on public.asada_plan_files to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('asada-plans-private','asada-plans-private',false,5242880,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
commit;
