create index if not exists companies_merged_into_company_idx on public.companies(merged_into_company_id) where merged_into_company_id is not null;
create index if not exists company_business_roles_company_id_idx on public.company_business_roles(company_id);
create index if not exists company_change_history_company_id_idx on public.company_change_history(company_id);
