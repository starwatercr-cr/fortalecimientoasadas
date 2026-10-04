begin;
alter table public.panel_records drop constraint if exists panel_records_kind_check;
alter table public.panel_records add constraint panel_records_kind_check check(kind in ('settings','movement','petty','budget','statement','asset','agreement','payment'));
create unique index if not exists panel_payment_invoice_idx on public.panel_records(asada_id,year,(lower(btrim(payload->>'supplier'))),(lower(btrim(payload->>'invoice')))) where kind='payment' and not deleted;
commit;
