create table public.client_requests (
  id uuid primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('disponibilidad','negativa','proyecto')),
  status text not null default 'Nuevo' check (status in ('Nuevo','En revisión','Pendiente de información','Cerrado')),
  details jsonb not null,
  identification text,
  appointment timestamptz,
  attachment text,
  attachment_type text,
  notified_at timestamptz
);
alter table public.client_requests enable row level security;
revoke all on public.client_requests from public, anon, authenticated;
grant select, insert, update on public.client_requests to service_role;
