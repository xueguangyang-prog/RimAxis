# Harmonia API 密钥设置中心

## 生产入口

- 用户入口：https://harmonia.xg-y-52f.workers.dev
- 应用页面与 API：https://ehzdoevqqmmtetulcpbo.supabase.co/functions/v1/harmonia-settings
- Supabase Edge Function：`harmonia-settings`（生产版本 11，状态 ACTIVE；仅提供 API，不再托管页面 HTML）
- Cloudflare Worker：`harmonia`（生产部署，302 跳转至设置中心）

## 页面能力

- 登录 / 注册 Supabase 用户
- 查询当前用户的采集服务 API 密钥配置状态
- 输入、保存并验证 API Token
- 重新验证连接
- 删除已保存的凭据
- 显示验证状态、最近验证时间和脱敏错误原因
- 已保存的密钥不会回传给浏览器

## 凭据安全设计

1. 浏览器仅在提交时通过 HTTPS 发送 API Token，不写入 localStorage、sessionStorage、Cookie 或 URL。
2. Edge Function 验证 Supabase 用户会话；所有数据库操作由服务端执行，并按已验证的 user ID 过滤。
3. API Token 使用 AES-256-GCM 加密后写入 `public.api_credentials`。
4. 加密主密钥由 Supabase Vault 保存；仅 `service_role` 可以执行读取加密主密钥的函数。
5. 凭据表启用 RLS，四条策略均按 `auth.uid() = owner_id` 隔离。
6. 状态读取只选择供应商、状态、验证时间、错误摘要和更新时间，不读取密文。
7. 保存、验证成功、验证失败和删除均写入 `api_credential_events`，审计记录不包含密钥内容。
8. 不在 GitHub、浏览器构建产物或应用日志中保存 API Token。

## 数据库对象

- `api_credentials`：用户加密凭据，唯一约束为 `(owner_id, provider)`。
- `api_credential_events`：凭据操作审计记录。
- `get_harmonia_credentials_key()`：受限的 Vault 密钥读取函数，仅授予 `service_role`。

## 首期服务

页面对用户显示为「采集服务 API」，不展示底层供应商品牌。后端首期 provider key 为 `apify`，后续新增服务通过 provider 注册扩展。

## 已知限制与验收边界

- 本次生产部署完成的是 API 密钥管理中心，不代表全球潜客发现采集引擎已经完成。
- 登录依赖当前 Supabase Auth 项目配置；如项目启用了邮箱确认，新用户须先完成邮箱验证。
- 2026-11-20：生产 Edge Function 已升级至 v11，并与仓库 API-only 源码对齐。数据库已确认 `api_credentials` 与 `api_credential_events` 均启用 RLS，凭据读写策略按 `auth.uid() = owner_id` 隔离。Supabase 安全顾问目前报告一项 Auth 警告：泄露密码保护未启用。生产浏览器在本轮验收请求触发 Cloudflare Browser Rendering 429 限流，因此本次未能在 v11 发布后完成线上页面和真实用户凭据端到端验收；不得将其标记为已通过。
