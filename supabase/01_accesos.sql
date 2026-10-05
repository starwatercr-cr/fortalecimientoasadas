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


-- Extensión de acceso: prueba privada de tres días.
-- Prueba gratuita: registros privados y vigencia consultada por el servidor.
alter table public.asadas add column if not exists access_kind text not null default 'standard' check(access_kind in ('standard','trial'));
alter table public.asadas add column if not exists trial_started_at timestamptz;
alter table public.asadas add column if not exists trial_ends_at timestamptz;
create table public.trial_requests (
 email text primary key,
 legal_id text not null unique check(legal_id ~ '^[0-9]{10}$'),
 name text not null check(length(name) between 3 and 160),
 contact text not null check(length(contact) between 3 and 120),
 phone text not null check(length(phone) between 8 and 30),
 role text not null check(role in ('Administración','Junta Directiva')),
 attempted_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 user_id uuid unique references auth.users(id),
 asada_id uuid unique references public.asadas(id)
);
alter table public.trial_requests enable row level security;
revoke all on public.trial_requests from public,anon,authenticated;
grant all on public.trial_requests to service_role;
grant select(id,email,email_confirmed_at) on auth.users to service_role;
create or replace function public.reserve_asada_trial(p_email text,p_legal text,p_name text,p_contact text,p_phone text,p_role text)
returns void language plpgsql security invoker set search_path = '' as $$
declare r public.trial_requests;
begin
 perform pg_advisory_xact_lock(740503);
 if exists(select 1 from public.memberships where lower(email)=p_email) or exists(select 1 from public.platform_admins a join auth.users u on u.id=a.user_id where lower(u.email)=p_email) then
  raise exception 'Ese correo ya tiene una cuenta. Ingrese con su acceso actual.';
 end if;
 -- Solo se limpian solicitudes sin espacio creado, después de 24 horas.
 delete from public.trial_requests where asada_id is null and attempted_at < now()-interval '24 hours';
 select * into r from public.trial_requests where email=p_email for update;
 if r.asada_id is not null then raise exception 'La prueba de esta ASADA ya fue utilizada.'; end if;
 if r.email is not null and r.attempted_at > now()-interval '60 seconds' then raise exception 'Espere un minuto antes de volver a solicitar la prueba.'; end if;
 if exists(select 1 from public.trial_requests where legal_id=p_legal and email<>p_email) then raise exception 'Ya existe una solicitud para esa cédula jurídica. Consulte a Star Water.'; end if;
 if (select count(*) from public.trial_requests where attempted_at>now()-interval '1 hour')>=60 then raise exception 'Hay muchas solicitudes. Intente más tarde.'; end if;
 insert into public.trial_requests(email,legal_id,name,contact,phone,role) values(p_email,p_legal,p_name,p_contact,p_phone,p_role)
 on conflict(email) do update set legal_id=excluded.legal_id,name=excluded.name,contact=excluded.contact,phone=excluded.phone,role=excluded.role,attempted_at=now();
end; $$;
create or replace function public.start_asada_trial(p_user uuid)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare e text; r public.trial_requests; a uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 select asada_id into a from public.memberships where user_id=p_user;
 if a is not null then return a; end if;
 if exists(select 1 from public.platform_admins where user_id=p_user) then return null; end if;
 select lower(email) into e from auth.users where id=p_user and email_confirmed_at is not null;
 if e is null then return null; end if;
 select * into r from public.trial_requests where email=e for update;
 if r.email is null or r.asada_id is not null then return null; end if;
 insert into public.asadas(name,access_kind,trial_started_at,trial_ends_at) values(r.name,'trial',now(),now()+interval '72 hours') returning id into a;
 insert into public.memberships(user_id,asada_id,email,role) values(p_user,a,e,r.role);
 update public.trial_requests set asada_id=a,user_id=p_user where email=e;
 return a;
end; $$;
revoke all on function public.reserve_asada_trial(text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.start_asada_trial(uuid) from public,anon,authenticated;
grant execute on function public.reserve_asada_trial(text,text,text,text,text,text),public.start_asada_trial(uuid) to service_role;
