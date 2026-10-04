create table public.warehouse_records (
 id uuid primary key default gen_random_uuid(), asada_id uuid not null references public.asadas(id),
 kind text not null check(kind in ('supplier','item')), payload jsonb not null check(jsonb_typeof(payload)='object'),
 stock numeric(15,3) not null default 0 check(stock>=0), version integer not null default 1 check(version>0),
 archived boolean not null default false, created_by uuid not null references auth.users(id), updated_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index warehouse_item_code on public.warehouse_records(asada_id,lower(payload->>'code')) where kind='item' and not archived;
create index warehouse_scope on public.warehouse_records(asada_id,kind,created_at,id);
create table public.warehouse_moves (
 id uuid primary key default gen_random_uuid(), request_id uuid not null, asada_id uuid not null references public.asadas(id),
 item_id uuid not null references public.warehouse_records(id), supplier_id uuid references public.warehouse_records(id),
 date date not null, type text not null check(type in ('in','out','adjust')), quantity numeric(15,3) not null check(quantity<>0),
 balance numeric(15,3) not null check(balance>=0), responsible text not null, reason text not null, reference text not null default '',
 actor uuid not null references auth.users(id), created_at timestamptz not null default now(), unique(asada_id,request_id)
);
create index warehouse_move_scope on public.warehouse_moves(asada_id,created_at,id);
create table public.warehouse_changes (
 id bigint generated always as identity primary key, asada_id uuid not null references public.asadas(id), record_id uuid not null,
 actor uuid not null, changed_at timestamptz not null default now(), previous_data jsonb, current_data jsonb not null
);
create function public.warehouse_audit() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.asada_id<>old.asada_id or new.kind<>old.kind or new.created_by<>old.created_by or new.version<>old.version+1 then raise exception 'Identidad o versión inválida'; end if;
  if new.archived and new.kind='item' and new.stock<>0 then raise exception 'No se puede archivar material con existencias'; end if;
 end if;
 if new.kind='supplier' and new.stock<>0 then raise exception 'Proveedor con existencias inválidas'; end if;
 if new.kind='item' and not new.archived and (TG_OP='INSERT' or new.payload->>'supplier' is distinct from old.payload->>'supplier') and nullif(new.payload->>'supplier','') is not null and not exists(select 1 from public.warehouse_records where id=(new.payload->>'supplier')::uuid and asada_id=new.asada_id and kind='supplier' and not archived) then raise exception 'Proveedor no disponible para esta ASADA'; end if;
 insert into public.warehouse_changes(asada_id,record_id,actor,previous_data,current_data) values(new.asada_id,new.id,new.updated_by,case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));return new;
end $$;
create trigger warehouse_record_audit before insert or update on public.warehouse_records for each row execute function public.warehouse_audit();
create function public.warehouse_move(p_asada uuid,p_item uuid,p_actor uuid,p_request uuid,p_version integer,p_date date,p_type text,p_quantity numeric,p_responsible text,p_reason text,p_reference text,p_supplier uuid default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare item public.warehouse_records; movement public.warehouse_moves; delta numeric; next_stock numeric;
begin
 select * into item from public.warehouse_records where id=p_item and asada_id=p_asada and kind='item' and not archived for update;
 if not found then raise exception 'Material no disponible'; end if;
 select * into movement from public.warehouse_moves where asada_id=p_asada and request_id=p_request;
 if found then
  if movement.item_id<>p_item or movement.actor<>p_actor or movement.type<>p_type or movement.quantity<>(case when p_type='out' then -p_quantity else p_quantity end) or movement.date<>p_date or movement.reason<>p_reason or movement.reference<>p_reference or movement.responsible<>p_responsible or movement.supplier_id is distinct from p_supplier then raise exception 'Solicitud repetida con datos distintos'; end if;
  return jsonb_build_object('movement',to_jsonb(movement),'item',to_jsonb(item),'repeated',true);
 end if;
 if item.version<>p_version then raise exception 'El material cambió. Actualice antes de registrar'; end if;
 if p_type not in ('in','out','adjust') or p_quantity is null or p_quantity=0 or abs(p_quantity)>1000000000 or p_quantity<>round(p_quantity,3) or (p_type in ('in','out') and p_quantity<0) or length(btrim(p_reason))=0 or length(btrim(p_responsible))=0 or p_date>current_date then raise exception 'Revise cantidad, fecha, motivo y responsable'; end if;
 if p_supplier is not null and (p_type<>'in' or not exists(select 1 from public.warehouse_records where id=p_supplier and asada_id=p_asada and kind='supplier' and not archived)) then raise exception 'Proveedor no disponible'; end if;
 delta:=case when p_type='out' then -p_quantity else p_quantity end;next_stock:=item.stock+delta;
 if next_stock<0 then raise exception 'La salida supera las existencias disponibles'; end if;
 update public.warehouse_records set stock=next_stock,version=version+1,updated_by=p_actor,updated_at=now() where id=p_item returning * into item;
 insert into public.warehouse_moves(request_id,asada_id,item_id,supplier_id,date,type,quantity,balance,responsible,reason,reference,actor) values(p_request,p_asada,p_item,p_supplier,p_date,p_type,delta,next_stock,p_responsible,p_reason,p_reference,p_actor) returning * into movement;
 return jsonb_build_object('movement',to_jsonb(movement),'item',to_jsonb(item),'repeated',false);
end $$;
alter table public.warehouse_records enable row level security;
alter table public.warehouse_moves enable row level security;
alter table public.warehouse_changes enable row level security;
revoke all on public.warehouse_records,public.warehouse_moves,public.warehouse_changes from public,anon,authenticated;
grant select,insert,update on public.warehouse_records to service_role;
grant select,insert on public.warehouse_moves,public.warehouse_changes to service_role;
grant usage,select on sequence public.warehouse_changes_id_seq to service_role;
revoke all on function public.warehouse_audit() from public,anon,authenticated;
revoke all on function public.warehouse_move(uuid,uuid,uuid,uuid,integer,date,text,numeric,text,text,text,uuid) from public,anon,authenticated;
grant execute on function public.warehouse_move(uuid,uuid,uuid,uuid,integer,date,text,numeric,text,text,text,uuid) to service_role;
