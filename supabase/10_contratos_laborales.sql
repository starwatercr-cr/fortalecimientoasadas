-- Ampliación compatible: contratos laborales ligados al expediente existente.
begin;
alter table public.team_records drop constraint team_records_kind_check;
alter table public.team_records add constraint team_records_kind_check check(kind in ('employee','profile','evaluation','event','document','labor_contract'));
alter table public.team_records drop constraint team_records_check;
alter table public.team_records add constraint team_records_check check ((kind in ('employee','profile') and related_id is null) or (kind in ('evaluation','event','document','labor_contract') and related_id is not null));
commit;
