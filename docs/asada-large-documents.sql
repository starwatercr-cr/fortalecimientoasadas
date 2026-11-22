-- Larger private files are limited to the main legal and technical documents by the API.
alter table public.asada_documents drop constraint asada_documents_size_check;
alter table public.asada_documents add constraint asada_documents_size_check
  check (size > 0 and size <= 41943040);

update storage.buckets
set file_size_limit = 41943040
where id = 'asada-profile-private' and public = false;
