-- Ampliación compatible: no cambia cuentas, claves ni accesos existentes.
alter table public.memberships add column if not exists full_name text not null default '';
alter table public.memberships add column if not exists external boolean not null default false;
alter table public.memberships add column if not exists allowed_modules text[] not null default '{}';
alter table public.memberships add column if not exists expires_at timestamptz;
alter table public.memberships add column if not exists access_reason text not null default '';
alter table public.memberships add column if not exists authorized_by uuid references auth.users(id);
alter table public.trial_requests add column if not exists terms_version text;
alter table public.trial_requests add column if not exists terms_accepted_at timestamptz;
create table if not exists public.trial_terms_acceptances(
 user_id uuid not null references auth.users(id) on delete cascade,
 version text not null,
 asada_id uuid not null references public.asadas(id),
 accepted_at timestamptz not null default now(),
 primary key(user_id,version)
);
alter table public.trial_terms_acceptances enable row level security;
revoke all on public.trial_terms_acceptances from public,anon,authenticated;
grant select,insert on public.trial_terms_acceptances to service_role;
create or replace function public.check_asada_account_limit() returns trigger
language plpgsql security invoker set search_path='' as $$
declare occupied integer;
begin
 perform pg_advisory_xact_lock(hashtextextended(new.asada_id::text,914));
 if new.external and (new.expires_at is null or cardinality(new.allowed_modules)=0 or length(new.access_reason)<5) then
  raise exception 'El acceso externo requiere áreas, motivo y vencimiento.' using errcode='23514';
 end if;
 if new.active and (new.expires_at is null or new.expires_at>now()) then
  select count(*) into occupied from public.memberships where asada_id=new.asada_id and user_id<>new.user_id and active and (expires_at is null or expires_at>now());
  if occupied>=3 then raise exception 'La ASADA ya tiene tres cuentas activas.' using errcode='23514'; end if;
 end if;
 return new;
end $$;
revoke all on function public.check_asada_account_limit() from public,anon,authenticated;
drop trigger if exists memberships_account_limit on public.memberships;
create trigger memberships_account_limit before insert or update on public.memberships for each row execute function public.check_asada_account_limit();
