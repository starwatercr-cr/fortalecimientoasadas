create table public.billing_tariff_profiles (
  id uuid primary key default gen_random_uuid(),
  asada_id uuid not null references public.asadas(id),
  category varchar(40) not null,
  effective_month date not null check (extract(day from effective_month) = 1),
  profile jsonb not null check (jsonb_typeof(profile) = 'object'),
  created_by uuid not null,
  created_at timestamptz not null default clock_timestamp()
);
create index billing_tariff_profiles_latest_idx
  on public.billing_tariff_profiles(asada_id,category,effective_month desc,created_at desc,id desc);
alter table public.billing_tariff_profiles enable row level security;
revoke all on public.billing_tariff_profiles from public, anon, authenticated, service_role;
grant select, insert on public.billing_tariff_profiles to service_role;

create function public.billing_tariffs_for_month(p_asada uuid, p_period date)
returns table(id uuid, profile jsonb)
language sql stable set search_path = ''
as $$
  select distinct on (t.category) t.id, t.profile
  from public.billing_tariff_profiles t
  where t.asada_id = p_asada and t.effective_month <= p_period
  order by t.category, t.effective_month desc, t.created_at desc, t.id desc;
$$;
revoke execute on function public.billing_tariffs_for_month(uuid,date) from public, anon, authenticated;
grant execute on function public.billing_tariffs_for_month(uuid,date) to service_role;
