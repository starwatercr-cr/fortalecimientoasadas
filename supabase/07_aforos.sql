create table public.water_flow_records (
 id uuid primary key default gen_random_uuid(),
 asada_id uuid not null references public.asadas(id),
 kind text not null check (kind in ('source','measurement')),
 source_id uuid references public.water_flow_records(id),
 date date,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=5000),
 version integer not null default 1 check(version>0),
 deleted boolean not null default false,
 created_by uuid not null references auth.users(id),
 updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check((kind='source' and source_id is null and date is null) or (kind='measurement' and source_id is not null and date is not null))
);
create index water_flow_scope on public.water_flow_records(asada_id,date,id) where not deleted;
create index water_flow_parent on public.water_flow_records(source_id);
create index water_flow_creator on public.water_flow_records(created_by);
create index water_flow_updater on public.water_flow_records(updated_by);
create unique index water_flow_source_name on public.water_flow_records(asada_id,lower(payload->>'name')) where kind='source' and not deleted;
create unique index water_flow_campaign on public.water_flow_records(asada_id,source_id,date,lower(payload->>'campaign')) where kind='measurement' and not deleted and coalesce(payload->>'campaign','')<>'';
alter table public.water_flow_records enable row level security;
revoke all on public.water_flow_records from public,anon,authenticated;
grant select,insert,update on public.water_flow_records to service_role;
