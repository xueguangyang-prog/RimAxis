revoke all on public.api_credential_events from anon, authenticated;
grant select on public.api_credential_events to authenticated;
grant all on public.api_credential_events to service_role;
