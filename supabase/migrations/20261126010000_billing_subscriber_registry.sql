create table public.billing_services (
 id uuid primary key default gen_random_uuid(),
 asada_id uuid not null references public.asadas(id),
 code text not null check (char_length(code) between 1 and 80 and code = btrim(code)),
 code_key text generated always as (lower(code)) stored,
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 version integer not null default 1 check (version > 0),
 created_by uuid not null,
 updated_by uuid not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (asada_id, code_key)
);
create unique index billing_services_meter_idx on public.billing_services(asada_id, lower(payload->>'meter'))
 where coalesce(payload->>'meter','') <> '' and payload->>'status' = 'activo';
alter table public.billing_services enable row level security;
revoke all on public.billing_services from public, anon, authenticated, service_role;
grant select, insert, update on public.billing_services to service_role;

-- Support medium-size operators without splitting a monthly billing period.
alter table public.billing_batches drop constraint billing_batches_report_check,
 add constraint billing_batches_report_check
 check (jsonb_typeof(report) = 'array' and jsonb_array_length(report) between 1 and 3000);
