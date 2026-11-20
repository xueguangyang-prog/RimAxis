drop policy if exists discovery_strategies_read_global on public.discovery_strategies;
create policy discovery_strategies_read_global on public.discovery_strategies
for select to authenticated using (owner_id is null);
