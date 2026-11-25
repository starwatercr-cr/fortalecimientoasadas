begin;
create table if not exists public.shop_products (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(length(name) between 1 and 200),
 category text not null check(category in ('medicion','dosificacion','filtracion','almacenamiento','tuberias')),
 description text not null default '',
 specifications text not null default '',
 price_crc numeric(12,2) check(price_crc >= 0),
 stock integer check(stock >= 0),
 images text[] not null default '{}',
 technical_pdf text,
 published boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.shop_products enable row level security;
revoke all on public.shop_products from public, anon, authenticated;
grant select, insert, update, delete on public.shop_products to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('starwater-shop','starwater-shop',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do nothing;
commit;
