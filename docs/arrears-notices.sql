begin;
alter table public.arrears_records drop constraint if exists arrears_records_kind_check;
alter table public.arrears_records add constraint arrears_records_kind_check
 check (kind in ('debt','subscriber','collection','promise','notice'));
alter table public.arrears_records drop constraint if exists arrears_records_check;
alter table public.arrears_records add constraint arrears_records_check
 check ((kind in ('debt','subscriber') and parent_id is null)
     or (kind in ('collection','promise','notice') and parent_id is not null));
commit;
