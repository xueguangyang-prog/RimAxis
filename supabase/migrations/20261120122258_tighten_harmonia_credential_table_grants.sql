revoke all privileges on table public.api_credentials from authenticated;
grant select, insert, update, delete on table public.api_credentials to authenticated;

revoke all privileges on table public.api_credential_events from authenticated;
grant select on table public.api_credential_events to authenticated;
