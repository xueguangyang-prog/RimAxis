-- Harmonia lead discovery foundation
-- Generated 2026-11-20. All tenant-owned records are isolated by auth.uid().
create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.discovery_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft','active','paused','completed','failed')),
  target_countries text[] not null default '{}',
  company_roles text[] not null default array['wheel_manufacturer','wheel_brand','wheel_importer','wheel_wholesaler','wheel_dealer','auto_tuning_shop','tire_wholesaler','auto_parts_distributor']::text[],
  search_terms jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  schedule_cron text,
  timezone text not null default 'UTC',
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.discovery_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.discovery_tasks(id) on delete set null,
  source_key text not null default 'maps_places',
  status text not null default 'queued' check (status in ('queued','running','succeeded','partial','failed','cancelled')),
  input_snapshot jsonb not null default '{}'::jsonb,
  source_run_id text,
  records_seen integer not null default 0 check (records_seen >= 0),
  records_created integer not null default 0 check (records_created >= 0),
  records_updated integer not null default 0 check (records_updated >= 0),
  records_rejected integer not null default 0 check (records_rejected >= 0),
  error_code text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  canonical_name text not null,
  normalized_name text not null,
  legal_name text,
  trading_name text,
  website_url text,
  website_domain text,
  country_code text,
  country_name text,
  region text,
  city text,
  postal_code text,
  address text,
  phone text,
  email text,
  description text,
  industry text,
  employee_range text,
  employee_count integer,
  company_status text,
  google_place_id text,
  latitude double precision,
  longitude double precision,
  data_confidence numeric(5,2) not null default 0 check (data_confidence between 0 and 100),
  last_verified_at timestamptz,
  merged_into_company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, google_place_id)
);

create table public.company_business_roles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role_key text not null check (role_key in ('wheel_manufacturer','wheel_brand','wheel_importer','wheel_wholesaler','wheel_dealer','auto_tuning_shop','tire_wholesaler','auto_parts_distributor')),
  confidence numeric(5,2) not null default 0 check (confidence between 0 and 100),
  classification_reason text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (owner_id, company_id, role_key)
);

create table public.company_source_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  source_key text not null,
  source_record_id text,
  source_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (owner_id, source_key, source_record_id)
);

create table public.company_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  field_key text not null,
  field_value text,
  source_key text not null,
  source_url text,
  confidence numeric(5,2) not null default 0 check (confidence between 0 and 100),
  observed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text,
  job_title text,
  department text,
  seniority text,
  email text,
  phone text,
  linkedin_url text,
  is_decision_maker boolean not null default false,
  confidence numeric(5,2) not null default 0 check (confidence between 0 and 100),
  source_key text not null,
  source_url text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  product_name text not null,
  product_category text,
  product_url text,
  description text,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.company_scores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  relevance_score numeric(5,2) not null default 0 check (relevance_score between 0 and 100),
  commercial_value_score numeric(5,2) not null default 0 check (commercial_value_score between 0 and 100),
  data_trust_score numeric(5,2) not null default 0 check (data_trust_score between 0 and 100),
  explanation jsonb not null default '{}'::jsonb,
  model_version text,
  scored_at timestamptz not null default now()
);

create table public.company_merge_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_company_id uuid not null,
  target_company_id uuid not null,
  confidence numeric(5,2) not null check (confidence between 0 and 100),
  decision text not null check (decision in ('auto_merged','manually_merged','rejected','suggested')),
  evidence jsonb not null default '{}'::jsonb,
  decided_at timestamptz not null default now()
);

create table public.company_change_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  field_key text not null,
  old_value text,
  new_value text,
  source_key text,
  changed_at timestamptz not null default now()
);

create table public.discovery_task_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.discovery_tasks(id) on delete cascade,
  run_id uuid references public.discovery_runs(id) on delete cascade,
  event_type text not null,
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.actor_registry (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  actor_identifier text not null,
  display_name_zh text not null,
  description_zh text,
  enabled boolean not null default true,
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.actor_schema_versions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actor_registry(id) on delete cascade,
  schema_version text not null,
  source_build_id text,
  raw_input_schema jsonb not null,
  chinese_field_map jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  active boolean not null default true,
  unique (actor_id, schema_version)
);

create table public.discovery_strategies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  role_key text not null,
  priority integer not null default 100,
  keywords jsonb not null default '[]'::jsonb,
  languages text[] not null default '{}',
  enabled boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index discovery_tasks_owner_status_idx on public.discovery_tasks(owner_id, status);
create index discovery_tasks_next_run_idx on public.discovery_tasks(next_run_at) where status = 'active';
create index discovery_runs_owner_created_idx on public.discovery_runs(owner_id, created_at desc);
create index discovery_runs_task_idx on public.discovery_runs(task_id, created_at desc);
create index companies_owner_name_idx on public.companies(owner_id, normalized_name);
create index companies_owner_domain_idx on public.companies(owner_id, website_domain);
create index companies_owner_country_idx on public.companies(owner_id, country_code);
create index company_roles_owner_role_idx on public.company_business_roles(owner_id, role_key);
create index company_source_links_company_idx on public.company_source_links(company_id);
create index company_evidence_company_field_idx on public.company_evidence(company_id, field_key);
create index company_contacts_company_idx on public.company_contacts(company_id);
create index company_products_company_idx on public.company_products(company_id);
create index company_scores_company_idx on public.company_scores(company_id, scored_at desc);
create index discovery_events_task_idx on public.discovery_task_events(task_id, created_at desc);
create index actor_schema_versions_active_idx on public.actor_schema_versions(actor_id, active);

do $$
declare t text;
begin
  foreach t in array array[
    'discovery_tasks','discovery_runs','companies','company_business_roles',
    'company_source_links','company_evidence','company_contacts','company_products',
    'company_scores','company_merge_history','company_change_history','discovery_task_events',
    'discovery_strategies'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using (owner_id = (select auth.uid()))', t || '_select_own', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (owner_id = (select auth.uid()))', t || '_insert_own', t);
    execute format('create policy %I on public.%I for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t || '_update_own', t);
    execute format('create policy %I on public.%I for delete to authenticated using (owner_id = (select auth.uid()))', t || '_delete_own', t);
  end loop;
end $$;

alter table public.actor_registry enable row level security;
create policy actor_registry_read_authenticated on public.actor_registry for select to authenticated using (true);
alter table public.actor_schema_versions enable row level security;
create policy actor_schema_versions_read_authenticated on public.actor_schema_versions for select to authenticated using (true);

create trigger discovery_tasks_updated_at before update on public.discovery_tasks for each row execute function public.set_updated_at();
create trigger companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger company_contacts_updated_at before update on public.company_contacts for each row execute function public.set_updated_at();
create trigger actor_registry_updated_at before update on public.actor_registry for each row execute function public.set_updated_at();
create trigger discovery_strategies_updated_at before update on public.discovery_strategies for each row execute function public.set_updated_at();

insert into public.actor_registry (source_key, actor_identifier, display_name_zh, description_zh, capabilities)
values ('maps_places', 'compass/crawler-google-places', '地图企业发现引擎', '发现地图中公开展示的企业地点、地址、电话、网站及部分公开联系人信息。不能单独覆盖无实体地点的制造商、品牌商或进口商。', '{"supports_location_search":true,"supports_business_contacts":true,"limitations":["无法覆盖没有地图地点的企业","联系人和邮箱字段取决于来源公开信息","结果必须保留来源证据"]}'::jsonb)
on conflict (source_key) do update set display_name_zh = excluded.display_name_zh, description_zh = excluded.description_zh, capabilities = excluded.capabilities, updated_at = now();
