create table public.technical_study_quote_invitations (
 id uuid primary key default gen_random_uuid(),
 token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
 label text not null check (char_length(label) between 1 and 160),
 created_by uuid not null,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 submitted_at timestamptz,
 details jsonb,
 attachment text,
 attachment_type text check (attachment_type in ('application/pdf','image/png','image/jpeg')),
 attachment_name text,
 check ((submitted_at is null and details is null and attachment is null) or
        (submitted_at is not null and details is not null and attachment is not null and attachment_type is not null and attachment_name is not null))
);
alter table public.technical_study_quote_invitations enable row level security;
revoke all on public.technical_study_quote_invitations from public, anon, authenticated;
grant select, insert, update on public.technical_study_quote_invitations to service_role;
create index technical_study_quote_created_idx on public.technical_study_quote_invitations(created_at desc,id);
