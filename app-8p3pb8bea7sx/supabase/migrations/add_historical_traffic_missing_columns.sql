-- ============================================================
-- 补齐 historical_traffic 表缺失的列
-- 修复：批量数据上传 / 单条添加失败（Supabase upsert 因未知列返回 400）
-- 原因：代码与 TS 类型(traffic.ts)使用了 festival、year_2019/2020/2021/2024/2025/2026，
--       但线上表只有 year_2022、year_2023，导致 upsert 载荷含不存在的列被 PostgREST 拒绝。
-- ============================================================

-- 1. 节日列
ALTER TABLE "public"."historical_traffic"
ADD COLUMN IF NOT EXISTS "festival" text;

-- 2. 历年同比客流的年度列（补齐缺失的年份）
ALTER TABLE "public"."historical_traffic"
ADD COLUMN IF NOT EXISTS "year_2019" integer;

ALTER TABLE "public"."historical_traffic"
ADD COLUMN IF NOT EXISTS "year_2020" integer;

ALTER TABLE "public"."historical_traffic"
ADD COLUMN IF NOT EXISTS "year_2021" integer;

ALTER TABLE "public"."historical_traffic"
ADD COLUMN IF NOT EXISTS "year_2024" integer;

ALTER TABLE "public"."historical_traffic"
ADD COLUMN IF NOT EXISTS "year_2025" integer;

ALTER TABLE "public"."historical_traffic"
ADD COLUMN IF NOT EXISTS "year_2026" integer;

-- 3. 字段注释
COMMENT ON COLUMN "public"."historical_traffic"."festival" IS '节日（如 春节/五一/国庆），可为空';
COMMENT ON COLUMN "public"."historical_traffic"."year_2019" IS '2019年同期游客数量';
COMMENT ON COLUMN "public"."historical_traffic"."year_2020" IS '2020年同期游客数量';
COMMENT ON COLUMN "public"."historical_traffic"."year_2021" IS '2021年同期游客数量';
COMMENT ON COLUMN "public"."historical_traffic"."year_2024" IS '2024年同期游客数量';
COMMENT ON COLUMN "public"."historical_traffic"."year_2025" IS '2025年同期游客数量';
COMMENT ON COLUMN "public"."historical_traffic"."year_2026" IS '2026年同期游客数量';

-- 4. 验证
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'historical_traffic'
ORDER BY ordinal_position;
