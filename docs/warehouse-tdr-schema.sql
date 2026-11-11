begin;
create table if not exists public.warehouse_tdr (
 id uuid primary key default gen_random_uuid(),
 asada_id uuid not null references public.asadas(id),
 title text not null check (length(title) between 1 and 180),
 payload jsonb not null check (jsonb_typeof(payload)='object'),
 version integer not null default 1 check (version>0),
 created_by uuid not null references auth.users(id),
 updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists warehouse_tdr_scope on public.warehouse_tdr(asada_id,updated_at desc,id);
alter table public.warehouse_tdr enable row level security;
revoke all on public.warehouse_tdr from public, anon, authenticated, service_role;
grant select, insert, update on public.warehouse_tdr to service_role;
commit;
