create table if not exists public.api_credentials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  provider text not null check (provider in ('apify')),
  encrypted_value text not null,
  encryption_iv text not null,
  key_version integer not null default 1 check (key_version > 0),
  status text not null default 'saved' check (status in ('saved','verified','verification_failed','disabled')),
  last_verified_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, provider)
);

alter table public.api_credentials enable row level security;
revoke all on public.api_credentials from anon;
grant select, insert, update, delete on public.api_credentials to authenticated;

drop policy if exists api_credentials_select_own on public.api_credentials;
create policy api_credentials_select_own on public.api_credentials
  for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists api_credentials_insert_own on public.api_credentials;
create policy api_credentials_insert_own on public.api_credentials
  for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists api_credentials_update_own on public.api_credentials;
create policy api_credentials_update_own on public.api_credentials
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
drop policy if exists api_credentials_delete_own on public.api_credentials;
create policy api_credentials_delete_own on public.api_credentials
  for delete to authenticated using ((select auth.uid()) = owner_id);

create index if not exists api_credentials_owner_id_idx on public.api_credentials(owner_id);
