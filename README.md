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
