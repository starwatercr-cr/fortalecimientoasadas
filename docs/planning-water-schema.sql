begin;
alter table public.panel_records drop constraint if exists panel_records_kind_check;
alter table public.panel_records add constraint panel_records_kind_check check(kind in ('settings','movement','petty','budget','statement','asset','agreement','payment','workplan','water'));
commit;
