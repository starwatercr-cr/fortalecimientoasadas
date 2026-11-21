alter table public.client_requests
  drop constraint client_requests_kind_check,
  add constraint client_requests_kind_check check (kind in ('disponibilidad','negativa','proyecto','fuente')),
  add column source_plan text,
  add column source_plan_type text;
