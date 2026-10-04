alter table public.arrears_records drop constraint arrears_records_kind_check;
alter table public.arrears_records add constraint arrears_records_kind_check check(kind in ('debt','subscriber','collection','promise'));
alter table public.arrears_records drop constraint arrears_records_check;
alter table public.arrears_records add constraint arrears_records_check check((kind in ('debt','subscriber') and parent_id is null) or (kind in ('collection','promise') and parent_id is not null));
create unique index arrears_subscriber_idx on public.arrears_records(asada_id,lower(payload->>'code')) where kind='subscriber';
create or replace function public.log_arrears_change() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.asada_id<>old.asada_id or new.kind<>old.kind or new.created_by<>old.created_by or new.parent_id is distinct from old.parent_id or new.id<>old.id then raise exception 'Identidad del registro inmutable'; end if;
  if new.version<>old.version+1 then raise exception 'Versión inválida'; end if;
 end if;
 if new.kind='debt' then
  if not (new.payload ?& array['code','name','invoice','due','cutoff','balance']) or jsonb_typeof(new.payload->'balance')<>'number' or (new.payload->>'balance')::numeric<0 then raise exception 'Saldo inválido';end if;
 elsif new.kind='subscriber' then
  if not (new.payload ?& array['code','name','date','state']) then raise exception 'Ficha inválida';end if;
 else
  if not exists(select 1 from public.arrears_records where id=new.parent_id and asada_id=new.asada_id and kind in ('debt','subscriber')) then raise exception 'Factura no disponible';end if;
 end if;
 insert into public.arrears_changes(record_id,asada_id,actor,previous,current_data) values(new.id,new.asada_id,new.updated_by,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));return new;
end $$;
