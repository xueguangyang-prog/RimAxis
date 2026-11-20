# Harmonia

Harmonia 全球轮毂行业潜客发现平台。

## 生产入口

- **登录入口**：https://harmonia.xg-y-52f.workers.dev/login
- **API 密钥设置中心**：https://harmonia.xg-y-52f.workers.dev/settings
- **应用服务**：Supabase Edge Function `harmonia-settings`
- **数据库项目**：`ehzdoevqqmmtetulcpbo`

设置中心目前支持用户登录、采集服务 Token 保存、重新验证、删除及状态查询。凭据在服务端使用 AES-256-GCM 加密，主密钥由 Supabase Vault 管理；数据库不保存 API Token 明文。

## 主要目录

- `supabase/migrations/`：数据库迁移
- `supabase/functions/harmonia-settings/`：API 密钥设置中心服务与页面
- `src/discovery/actor-schema/`：采集 Actor 字段映射

## 安全说明

- 前端不保存 API Token 到浏览器本地存储。
- API Token 不写入 Git 仓库、Worker 源码或应用日志。
- API 凭据按用户 ID 隔离。
- API 密钥状态接口不返回密钥明文或密文。
- 生产 Edge Function 在内部验证 Supabase 用户会话；未登录请求不能读取或更改凭据。

## 前端实现约定

- 页面入口统一由 Cloudflare Worker 提供：`/login` 与 `/settings` 是独立路由，不使用同一 HTML 中的隐藏区块切换。
- UI 组件采用 Aceternity UI 的源码组件模式，当前集成 Background Beams、Card Spotlight、Moving Border，并使用 Motion React 驱动动画。
- Supabase Edge Function 只负责认证会话、凭据 API、AES-256-GCM 加解密与审计；直接访问其页面路径会跳转到 Cloudflare Worker。
- 浏览器通过 Worker 同源代理访问 Supabase Auth 与凭据 API；会话使用 HttpOnly、Secure、SameSite Cookie，不写入 localStorage 或 sessionStorage。
- 生产发布必须在 Worker 与 Edge Function 源码检查、数据库安全检查、页面真实浏览器验收及登录/凭据端到端测试通过后统一执行。
