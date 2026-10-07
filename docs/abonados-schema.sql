begin;
create table if not exists public.subscriber_imports (
 id uuid primary key default gen_random_uuid(),
 asada_id uuid not null references public.asadas(id),
 filename text not null check(length(filename)<=200),
 format text not null,
 operator text not null default '',
 hash text not null check(hash ~ '^[a-f0-9]{64}$'),
 row_count integer not null check(row_count between 1 and 20000),
 payload jsonb not null check(jsonb_typeof(payload->'rows')='array' and jsonb_array_length(payload->'rows')=row_count and octet_length(payload::text)<5500000),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(asada_id,hash)
);
create index if not exists subscriber_imports_scope on public.subscriber_imports(asada_id,created_at desc);
alter table public.subscriber_imports enable row level security;
revoke all on public.subscriber_imports from anon, authenticated;
grant select, insert on public.subscriber_imports to service_role;
commit;
