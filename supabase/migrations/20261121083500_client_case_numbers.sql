lock table public.client_requests in access exclusive mode;

alter table public.client_requests add column case_number bigint;

with ranked as (
  select id, row_number() over (order by created_at, id) as number
  from public.client_requests
)
update public.client_requests as request
set case_number = ranked.number
from ranked
where request.id = ranked.id;

alter table public.client_requests alter column case_number set not null;
alter table public.client_requests add constraint client_requests_case_number_key unique (case_number);

create function public.assign_client_case_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(6009, 1);
  if exists (select 1 from public.client_requests where id = new.id) then
    return null;
  end if;
  select coalesce(max(case_number), 0) + 1
  into new.case_number
  from public.client_requests;
  return new;
end;
$$;

revoke execute on function public.assign_client_case_number() from public, anon, authenticated;
grant execute on function public.assign_client_case_number() to service_role;
create trigger client_requests_assign_case_number
before insert on public.client_requests
for each row execute function public.assign_client_case_number();
