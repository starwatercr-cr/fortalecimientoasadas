create table public.billing_batches (
  id uuid primary key default gen_random_uuid(),
  asada_id uuid not null references public.asadas(id),
  period date not null check (extract(day from period) = 1),
  due_date date not null check (due_date >= period),
  status text not null default 'draft' check (status in ('draft', 'approved')),
  version integer not null default 1 check (version > 0),
  source jsonb not null check (jsonb_typeof(source) = 'object'),
  report jsonb not null check (jsonb_typeof(report) = 'array' and jsonb_array_length(report) between 1 and 1000),
  created_at timestamptz not null default now(),
  created_by uuid not null,
  updated_by uuid not null,
  approved_at timestamptz,
  approved_by uuid,
  unique (asada_id, period),
  unique (asada_id, id),
  check (
    (status = 'approved' and approved_at is not null and approved_by is not null)
    or (status = 'draft' and approved_at is null and approved_by is null)
  )
);

create table public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  asada_id uuid not null,
  batch_id uuid not null,
  subscriber text not null check (char_length(subscriber) between 1 and 80),
  amount_cents bigint not null check (amount_cents between 1 and 1010000000000),
  reference text not null check (reference = upper(btrim(reference)) and char_length(reference) between 1 and 100),
  recorded_by uuid not null,
  recorded_at timestamptz not null default now(),
  unique (asada_id, reference),
  foreign key (asada_id, batch_id) references public.billing_batches(asada_id, id)
);
create index billing_payments_batch_idx on public.billing_payments (asada_id, batch_id, subscriber);

alter table public.billing_batches enable row level security;
alter table public.billing_payments enable row level security;
revoke all on public.billing_batches, public.billing_payments from public, anon, authenticated, service_role;
grant select, insert, update on public.billing_batches to service_role;
grant select, insert on public.billing_payments to service_role;

create function public.billing_paid_totals(p_asada uuid, p_batch uuid)
returns table(subscriber text, paid_cents bigint)
language sql stable set search_path = ''
as $$
  select p.subscriber, sum(p.amount_cents)::bigint
  from public.billing_payments p
  where p.asada_id = p_asada and p.batch_id = p_batch
  group by p.subscriber;
$$;

create function public.billing_register_payment(
  p_asada uuid, p_batch uuid, p_subscriber text, p_amount bigint, p_reference text, p_actor uuid
)
returns uuid
language plpgsql set search_path = ''
as $$
declare
  v_report jsonb;
  v_total bigint;
  v_paid bigint;
  v_payment public.billing_payments%rowtype;
begin
  -- Serialize postings for this batch so two callers cannot both spend the same balance.
  select b.report into v_report from public.billing_batches b
    where b.asada_id = p_asada and b.id = p_batch and b.status = 'approved'
    for update;
  if not found then raise exception 'FACT: Lote aprobado no disponible.'; end if;

  select p.* into v_payment from public.billing_payments p
    where p.asada_id = p_asada and p.reference = p_reference;
  if found then
    if v_payment.batch_id = p_batch and v_payment.subscriber = p_subscriber and v_payment.amount_cents = p_amount
      then return v_payment.id;
    end if;
    raise exception 'FACT: Esa referencia ya está asignada a otro pago.';
  end if;

  select (item ->> 'totalCents')::bigint into v_total
    from jsonb_array_elements(v_report) item where item ->> 'subscriber' = p_subscriber;
  if not found then raise exception 'FACT: Abonado no disponible en este lote.'; end if;
  select coalesce(sum(p.amount_cents),0)::bigint into v_paid from public.billing_payments p
    where p.asada_id = p_asada and p.batch_id = p_batch and p.subscriber = p_subscriber;
  if p_amount is null or p_amount <= 0 or p_amount > v_total - v_paid then
    raise exception 'FACT: El monto excede el saldo pendiente o no es válido.';
  end if;

  insert into public.billing_payments (asada_id,batch_id,subscriber,amount_cents,reference,recorded_by)
    values (p_asada,p_batch,p_subscriber,p_amount,p_reference,p_actor)
    on conflict (asada_id,reference) do nothing returning * into v_payment;
  if not found then raise exception 'FACT: Esa referencia ya está asignada a otro pago.'; end if;
  return v_payment.id;
end;
$$;

revoke execute on function public.billing_paid_totals(uuid,uuid),
  public.billing_register_payment(uuid,uuid,text,bigint,text,uuid) from public, anon, authenticated;
grant execute on function public.billing_paid_totals(uuid,uuid),
  public.billing_register_payment(uuid,uuid,text,bigint,text,uuid) to service_role;
