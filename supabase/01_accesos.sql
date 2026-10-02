-- Ejecutar una vez en un proyecto de Supabase destinado a la plataforma.
create table public.asadas (
 id uuid primary key default gen_random_uuid(),
 name text not null check (length(name) between 1 and 160),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 asada_id uuid not null references public.asadas(id),
 email text not null,
 role text not null check (role in ('Administración','Junta Directiva','Operación')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create index memberships_asada_idx on public.memberships(asada_id);
create table public.platform_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 active boolean not null default true
);
alter table public.asadas enable row level security;
alter table public.memberships enable row level security;
alter table public.platform_admins enable row level security;
-- El navegador no consulta ni modifica estas tablas. El servidor verifica
-- identidad y autorización en cada operación. Sin políticas públicas.
revoke all on public.asadas, public.memberships, public.platform_admins from anon, authenticated;
grant all on public.asadas, public.memberships, public.platform_admins to service_role;
