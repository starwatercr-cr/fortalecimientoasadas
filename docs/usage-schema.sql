-- Server-only daily aggregates. All dates use America/Costa_Rica.
create table if not exists public.platform_usage_daily (
 asada_id uuid not null references public.asadas(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null, tool text not null, kind text not null check(kind in ('trial','paid')),
 seconds integer not null default 0 check(seconds>=0), views integer not null default 0 check(views>=0),
 email text not null, full_name text not null, role text not null,
 last_seen timestamptz not null,
 primary key(asada_id,user_id,day,tool,kind)
);
create index if not exists platform_usage_day_idx on public.platform_usage_daily(day,asada_id,user_id);
create table if not exists public.platform_usage_clock (
 user_id uuid primary key references auth.users(id) on delete cascade,
 last_seen timestamptz not null
);
create table if not exists public.platform_usage_clients (
 client_id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 asada_id uuid not null references public.asadas(id) on delete cascade,
 seq integer not null, last_seen timestamptz not null
);
create index if not exists platform_usage_clients_user_idx on public.platform_usage_clients(user_id,last_seen);
alter table public.platform_usage_daily enable row level security;
alter table public.platform_usage_clock enable row level security;
alter table public.platform_usage_clients enable row level security;
revoke all on public.platform_usage_daily,public.platform_usage_clock,public.platform_usage_clients from public,anon,authenticated;
grant all on public.platform_usage_daily,public.platform_usage_clock,public.platform_usage_clients to service_role;

create or replace function public.record_platform_usage(p_user uuid,p_asada uuid,p_client uuid,p_seq integer,p_seconds integer,p_tool text,p_kind text,p_email text,p_name text,p_role text)
returns integer language plpgsql security invoker set search_path='' as $$
declare
 v_now timestamptz:=clock_timestamp(); v_last timestamptz; v_client public.platform_usage_clients%rowtype;
 v_seconds integer:=0; v_today integer; v_day date; v_midnight timestamptz; v_new boolean:=false;
begin
 if p_seconds<0 or p_seconds>60 or p_seq<1 or p_seq>1000000 or p_kind not in ('trial','paid') or length(p_tool)>40 then raise exception 'Invalid activity'; end if;
 if not exists(select 1 from public.memberships where user_id=p_user and asada_id=p_asada and active) then raise exception 'Inactive membership'; end if;
 -- One lock per person prevents concurrent tabs/devices crediting the same seconds.
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,8173));
 select * into v_client from public.platform_usage_clients where client_id=p_client;
 if found then
  if v_client.user_id<>p_user or v_client.asada_id<>p_asada then raise exception 'Invalid client'; end if;
  if p_seq<=v_client.seq then return 0; end if;
 else v_new:=true;
 end if;
 select last_seen into v_last from public.platform_usage_clock where user_id=p_user;
 if found and not v_new then v_seconds:=least(p_seconds,greatest(0,floor(extract(epoch from(v_now-v_last)))::integer)); end if;
 insert into public.platform_usage_clock values(p_user,v_now) on conflict(user_id) do update set last_seen=excluded.last_seen;
 insert into public.platform_usage_clients values(p_client,p_user,p_asada,p_seq,v_now) on conflict(client_id) do update set seq=excluded.seq,last_seen=excluded.last_seen;
 -- Remove only this person's old transient page tokens; retain daily summaries.
 delete from public.platform_usage_clients where user_id=p_user and last_seen<v_now-interval '7 days';
 v_day:=(v_now at time zone 'America/Costa_Rica')::date;
 v_midnight:=v_day::timestamp at time zone 'America/Costa_Rica';
 v_today:=least(v_seconds,greatest(0,floor(extract(epoch from(v_now-v_midnight)))::integer));
 insert into public.platform_usage_daily values(p_asada,p_user,v_day,p_tool,p_kind,v_today,case when v_new then 1 else 0 end,left(p_email,254),left(p_name,120),left(p_role,40),v_now)
 on conflict(asada_id,user_id,day,tool,kind) do update set seconds=platform_usage_daily.seconds+excluded.seconds,views=platform_usage_daily.views+excluded.views,email=excluded.email,full_name=excluded.full_name,role=excluded.role,last_seen=excluded.last_seen;
 if v_seconds>v_today then
  insert into public.platform_usage_daily values(p_asada,p_user,v_day-1,p_tool,p_kind,v_seconds-v_today,0,left(p_email,254),left(p_name,120),left(p_role,40),v_midnight)
  on conflict(asada_id,user_id,day,tool,kind) do update set seconds=platform_usage_daily.seconds+excluded.seconds,last_seen=greatest(platform_usage_daily.last_seen,excluded.last_seen);
 end if;
 return v_seconds;
end $$;
revoke all on function public.record_platform_usage(uuid,uuid,uuid,integer,integer,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_platform_usage(uuid,uuid,uuid,integer,integer,text,text,text,text,text) to service_role;

create or replace function public.platform_usage_report(p_start date,p_end date,p_asada uuid default null,p_user uuid default null,p_kind text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if p_start is null or p_end is null or p_end<p_start or p_end-p_start>92 or (p_kind is not null and p_kind not in ('trial','paid')) then raise exception 'Invalid period'; end if;
 with base as materialized (
  select d.*,a.name as asada_name from public.platform_usage_daily d join public.asadas a on a.id=d.asada_id
  where d.day between p_start and p_end and (p_asada is null or d.asada_id=p_asada) and (p_user is null or d.user_id=p_user) and (p_kind is null or d.kind=p_kind)
 ), people as (
  select asada_id,user_id,asada_name,kind,max(email) email,max(full_name) full_name,max(role) role,sum(seconds) seconds,sum(views) views,max(last_seen) last_seen from base group by asada_id,user_id,asada_name,kind
 ), days as (select day,sum(seconds) seconds,sum(views) views from base group by day), tools as (select tool,sum(seconds) seconds,sum(views) views from base group by tool)
 select jsonb_build_object('start',p_start,'end',p_end,'seconds',coalesce((select sum(seconds) from base),0),'views',coalesce((select sum(views) from base),0),'asadas',(select count(distinct asada_id) from base),'users',(select count(distinct user_id) from base),
 'people',coalesce((select jsonb_agg(to_jsonb(x) order by seconds desc,asada_name,email) from people x),'[]'::jsonb),
 'days',coalesce((select jsonb_agg(to_jsonb(x) order by day) from days x),'[]'::jsonb),
 'tools',coalesce((select jsonb_agg(to_jsonb(x) order by seconds desc,tool) from tools x),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function public.platform_usage_report(date,date,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.platform_usage_report(date,date,uuid,uuid,text) to service_role;
