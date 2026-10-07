begin;
create table if not exists public.water_anc_periods (
 id uuid primary key default gen_random_uuid(), asada_id uuid not null references public.asadas(id),
 period text not null check(period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
 payload jsonb not null check(jsonb_typeof(payload)='object'), version integer not null default 1 check(version>0),
 created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(asada_id,period)
);
alter table public.water_anc_periods enable row level security;
revoke all on public.water_anc_periods from anon,authenticated;
grant select,insert,update on public.water_anc_periods to service_role;
commit;
