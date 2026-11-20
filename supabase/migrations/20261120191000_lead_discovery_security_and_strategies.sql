-- Security hardening and baseline discovery strategy catalog.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists discovery_tasks_owner_id_idx on public.discovery_tasks(owner_id);
create index if not exists discovery_runs_owner_id_idx on public.discovery_runs(owner_id);
create index if not exists companies_owner_id_idx on public.companies(owner_id);
create index if not exists company_business_roles_owner_id_idx on public.company_business_roles(owner_id);
create index if not exists company_source_links_owner_id_idx on public.company_source_links(owner_id);
create index if not exists company_evidence_owner_id_idx on public.company_evidence(owner_id);
create index if not exists company_contacts_owner_id_idx on public.company_contacts(owner_id);
create index if not exists company_products_owner_id_idx on public.company_products(owner_id);
create index if not exists company_scores_owner_id_idx on public.company_scores(owner_id);
create index if not exists company_merge_history_owner_id_idx on public.company_merge_history(owner_id);
create index if not exists company_change_history_owner_id_idx on public.company_change_history(owner_id);
create index if not exists discovery_task_events_owner_id_idx on public.discovery_task_events(owner_id);
create index if not exists discovery_task_events_run_id_idx on public.discovery_task_events(run_id);
create index if not exists discovery_strategies_owner_id_idx on public.discovery_strategies(owner_id);

insert into public.discovery_strategies (owner_id, role_key, priority, keywords, languages)
values
(null,'wheel_manufacturer',10,'["alloy wheel manufacturer","wheel factory","forged wheel manufacturer","轮毂制造商","铝合金轮毂工厂","鍛造ホイールメーカー"]'::jsonb,array['en','zh-CN','zh-TW','de','ja']),
(null,'wheel_brand',20,'["alloy wheel brand","performance wheel brand","aftermarket wheels","轮毂品牌","改装轮毂品牌"]'::jsonb,array['en','zh-CN','zh-TW','de','ja']),
(null,'wheel_importer',30,'["wheel importer","alloy wheel importers","轮毂进口商","进口轮毂"]'::jsonb,array['en','zh-CN','zh-TW','de','ja']),
(null,'wheel_wholesaler',40,'["wheel wholesaler","alloy wheel distributor","轮毂批发商","轮毂批发"]'::jsonb,array['en','zh-CN','zh-TW','de','ja']),
(null,'wheel_dealer',50,'["wheel dealer","alloy wheel shop","轮毂经销商","轮毂零售"]'::jsonb,array['en','zh-CN','zh-TW','de','ja']),
(null,'auto_tuning_shop',100,'["auto tuning shop","car modification shop","汽车改装店","改装店"]'::jsonb,array['en','zh-CN','zh-TW','de','ja']),
(null,'tire_wholesaler',110,'["tire wholesaler","tyre distributor","轮胎批发商","轮胎经销商"]'::jsonb,array['en','zh-CN','zh-TW','de','ja']),
(null,'auto_parts_distributor',120,'["auto parts distributor","automotive parts wholesaler","汽车配件分销商","汽车零部件批发"]'::jsonb,array['en','zh-CN','zh-TW','de','ja'])
on conflict do nothing;
