create table if not exists public.api_credential_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('apify')),
  event_type text not null check (event_type in ('saved','verified','verification_failed','deleted')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.api_credential_events enable row level security;
revoke all on public.api_credential_events from anon;
grant select on public.api_credential_events to authenticated;
drop policy if exists api_credential_events_select_own on public.api_credential_events;
create policy api_credential_events_select_own on public.api_credential_events
  for select to authenticated using ((select auth.uid()) = owner_id);
create index if not exists api_credential_events_owner_created_idx
  on public.api_credential_events(owner_id, created_at desc);
