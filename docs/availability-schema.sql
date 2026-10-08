begin;
create table if not exists public.water_availability_records (
 id uuid primary key default gen_random_uuid(),asada_id uuid not null references public.asadas(id),
 kind text not null check(kind in ('template','letter')), payload jsonb not null check(jsonb_typeof(payload)='object'),
 version integer not null default 1 check(version>0),created_by uuid not null references auth.users(id),updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(id,asada_id)
);
create index if not exists water_availability_records_scope_idx on public.water_availability_records(asada_id,updated_at desc);
create unique index if not exists availability_one_template on public.water_availability_records(asada_id) where kind='template';
create unique index if not exists availability_unique_office on public.water_availability_records(asada_id,(payload->>'office')) where kind='letter' and coalesce(payload->>'office','')<>'';
create table if not exists public.water_availability_files (
 id uuid primary key default gen_random_uuid(),asada_id uuid not null references public.asadas(id),record_id uuid not null,record_version integer not null,
 name text not null,category text not null,filename text not null,path text not null unique,type text not null,size bigint not null check(size>0 and size<=5242880),
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),foreign key(record_id,asada_id) references public.water_availability_records(id,asada_id)
);
create index if not exists water_availability_files_scope_idx on public.water_availability_files(asada_id,record_id);
alter table public.water_availability_records enable row level security;
alter table public.water_availability_files enable row level security;
revoke all on public.water_availability_records,public.water_availability_files from anon,authenticated;
grant select,insert,update on public.water_availability_records to service_role;
grant select,insert on public.water_availability_files to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('asada-availability-private','asada-availability-private',false,5242880,array['application/pdf','image/jpeg','image/png']) on conflict(id) do nothing;
commit;
