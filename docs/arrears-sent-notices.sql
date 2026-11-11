begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('asada-arrears-private', 'asada-arrears-private', false, 3145728, array['application/pdf'])
on conflict (id) do update set public=false, file_size_limit=3145728, allowed_mime_types=array['application/pdf'];
alter table public.arrears_records drop constraint if exists arrears_records_kind_check;
alter table public.arrears_records add constraint arrears_records_kind_check
 check (kind in ('debt','subscriber','collection','promise','notice','notice_sent'));
alter table public.arrears_records drop constraint if exists arrears_records_check;
alter table public.arrears_records add constraint arrears_records_check
 check ((kind in ('debt','subscriber') and parent_id is null)
     or (kind in ('collection','promise','notice','notice_sent') and parent_id is not null));
commit;
