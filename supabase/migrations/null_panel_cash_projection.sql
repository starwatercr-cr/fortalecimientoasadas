alter table public.panel_records
  add constraint panel_records_kind_with_projection_check
  check (kind in ('settings','movement','petty','budget','statement','asset','agreement','payment','workplan','water','cash_projection')) not valid;

alter table public.panel_records
  validate constraint panel_records_kind_with_projection_check;

create unique index panel_cash_projection_singleton_idx on public.panel_records (asada_id, year)
  where kind = 'cash_projection' and not deleted;

alter table public.panel_records drop constraint panel_records_kind_check;
alter table public.panel_records rename constraint panel_records_kind_with_projection_check to panel_records_kind_check;
