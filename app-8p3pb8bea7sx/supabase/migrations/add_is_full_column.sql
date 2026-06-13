-- ============================================================
-- 添加 is_full 列到 parking_lots 表
-- ============================================================

-- 1. 添加 is_full 列（如果不存在）
ALTER TABLE "public"."parking_lots"
ADD COLUMN IF NOT EXISTS "is_full" boolean DEFAULT false;

-- 2. 清空旧数据
TRUNCATE TABLE "public"."parking_lots" RESTART IDENTITY CASCADE;

-- 3. 插入6个停车场数据
INSERT INTO "public"."parking_lots"
  ("name", "total_spaces", "occupied_spaces", "is_full", "notes", "last_updated")
VALUES
  ('景区停车场', 2400, 0, false, '景区主停车场，靠近灵山正门', NOW()),
  ('月亮湾停车场', 1300, 0, false, '靠近拈花湾入口', NOW()),
  ('灵湖路停车', 300, 0, false, '节假日临时开放', NOW()),
  ('八局停车场', 100, 0, false, '内部停车场', NOW()),
  ('贵宾停车场', 140, 0, false, 'VIP专用', NOW()),
  ('古竹停车', 200, 0, false, '节假日临时开放', NOW());

-- 4. 验证结果
SELECT * FROM "public"."parking_lots" ORDER BY "id";
