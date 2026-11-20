# Harmonia 潜客发现基础模块

## 当前已落库
- 任务、运行记录、企业、企业角色、来源链接、字段证据、联系人、产品、评分、合并历史、变更历史、任务事件。
- 采集器注册表、Schema 版本表和八类企业的默认搜索策略。
- 所有租户业务表启用 RLS；公开数据源目录只允许已登录用户读取。

## 数据源边界
当前默认地图数据源仅覆盖地图中存在地点记录的企业，不能单独承担无实体地点制造商、品牌商和进口商的全球发现。后续需要增加网页、企业目录、贸易/进出口公开数据等不同来源，并统一进入证据和去重管线。

## 官方输入 Schema
- 官方页面：https://apify.com/compass/crawler-google-places/input-schema
- 官方 OpenAPI：https://apify.com/compass/crawler-google-places/api/openapi
- 固定 Actor：`compass/crawler-google-places`
- 中文字段映射：`src/discovery/actor-schema/field-map.zh.json`
- 完整原始 Schema 由 `scripts/sync-actor-schema.mjs` 从官方 API 拉取并保存到 `src/discovery/actor-schema/input.schema.json`；该同步脚本需要在安全环境配置 `APIFY_API_TOKEN` 后执行。不得用手工简化字段替代官方原始 Schema。

## 生产启用前置条件
1. 将 Actor API Token 作为 Worker Secret 保存为 `APIFY_API_TOKEN`，禁止提交到 Git。
2. 执行官方 Schema 同步脚本并将生成的原始 Schema 与构建版本提交。
3. 完成后端运行器、回调/轮询、数据规范化和企业去重测试。
4. 完成应用前端和认证链路后再将 Worker 切换到正式流量。
