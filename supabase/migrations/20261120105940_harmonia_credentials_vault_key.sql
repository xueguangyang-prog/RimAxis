do $$
begin
  if not exists (select 1 from vault.secrets where name = 'harmonia_api_credentials_key') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'harmonia_api_credentials_key',
      'AES-256-GCM encryption key for Harmonia user API credentials'
    );
  end if;
end
$$;

create or replace function public.get_harmonia_credentials_key()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'forbidden';
  end if;
  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'harmonia_api_credentials_key'
  limit 1;
  if v_key is null then
    raise exception 'encryption key unavailable';
  end if;
  return v_key;
end;
$$;

revoke all on function public.get_harmonia_credentials_key() from public, anon, authenticated;
grant execute on function public.get_harmonia_credentials_key() to service_role;
