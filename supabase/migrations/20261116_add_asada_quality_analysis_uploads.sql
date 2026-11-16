alter table public.panel_records
 add constraint panel_records_kind_with_quality_check
 check (kind in ('settings','movement','petty','budget','statement','asset','agreement','payment','workplan','water','cash_projection','service_order','service_outage','service_point','deadline','project','quality_analysis')) not valid;
alter table public.panel_records validate constraint panel_records_kind_with_quality_check;
alter table public.panel_records drop constraint panel_records_kind_check;
alter table public.panel_records rename constraint panel_records_kind_with_quality_check to panel_records_kind_check;
create index if not exists panel_quality_analysis_idx on public.panel_records(asada_id,created_at desc,id) where kind='quality_analysis' and deleted=false;