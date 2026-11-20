# Harmonia 设置中心生产就绪记录（2026-11-20）

## 已执行的生产变更

- Supabase Edge Function `harmonia-settings` 已部署至 **v11**。
- v11 与仓库 `supabase/functions/harmonia-settings/index.ts` 内容完全一致。
- v11 已移除旧版页面 HTML，仅保留公开配置、会话建立/注销、认证校验、凭据 CRUD、AES-256-GCM 加解密与审计 API。
- 数据库迁移 `20261120122258_tighten_harmonia_credential_table_grants.sql` 已应用并提交。
- 权限回查结果：
  - `api_credentials`：authenticated 仅有 SELECT/INSERT/UPDATE/DELETE；没有 TRUNCATE、TRIGGER、REFERENCES。
  - `api_credential_events`：authenticated 仅有 SELECT。
  - 两表均启用 RLS，按 `auth.uid() = owner_id` 隔离。
  - anon 对两表没有访问权限。
  - Vault 密钥读取函数为 SECURITY DEFINER，固定空 search_path，仅 postgres 与 service_role 有执行权限。
- Supabase Security Advisor 当前唯一告警：Auth 泄露密码保护未启用。

## 当前仍未通过的验收项

- Cloudflare Worker 生产流量仍为旧版本 `c6a2761c-f29f-4949-a5c4-5a340ac40ae5`，100% 流量；本轮没有发布新的 Worker 版本。
- Worker 页面目前由 Worker 源码内嵌 HTML/CSS/React 模块提供，React 与 Motion 从 esm.sh 加载；仓库尚无 Vite/Tailwind 构建配置及锁文件。因此不能把当前状态标记为完成了正式前端构建流水线。
- 本轮 Cloudflare Browser Rendering 在生产页面验收时返回 HTTP 429，要求等待 41,905 秒后才能再次使用；因此 v11 发布后的生产页面渲染和交互回归无法在本轮完成。
- 真实用户登录、会话续期、凭据保存/重新验证/删除端到端测试尚未完成。没有向生产数据库写入模拟凭据。

## 发布结论

**本记录不代表 Harmonia 前端已完成生产验收，也不代表整个潜客发现系统已生产就绪。** 在完成前端构建工程、解除浏览器验收限流并通过真实用户端到端测试前，不应把 Worker 新版本切换到 100% 生产流量。


## Cloudflare production deployment prerequisite

The Vite/Tailwind build is verified by GitHub Actions. Production deployment uses the repository workflow `.github/workflows/harmonia-production.yml` and requires two repository Actions secrets (never commit or paste credentials into chat):

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers Scripts:Edit and Workers Assets:Edit permissions for the Harmonia account.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account identifier used by the existing `harmonia` Worker.

Add them in GitHub → RimAxis → Settings → Secrets and variables → Actions → New repository secret. After both secrets are saved, run the workflow “Harmonia production build” (or push a frontend change). The workflow builds, uploads the artifact, deploys the Worker and static assets, then the production deployment must be checked for 100% traffic before declaring success.

Current limitation (2026-11-20): the GitHub Actions deployment attempt built successfully but failed because both Cloudflare secrets were empty in the runner environment. Cloudflare production traffic therefore remains on the previous Worker version. The connected Cloudflare account itself remains accessible through the Cloudflare integration, but its API token is not exposed to GitHub Actions or to this repository.
