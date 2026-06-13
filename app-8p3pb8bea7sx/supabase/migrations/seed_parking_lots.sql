-- ============================================================
-- 无锡灵山景区 - 停车场默认数据（6个停车场）
-- ============================================================

-- 先清空已有数据（如需保留历史请注释此行）
TRUNCATE TABLE "public"."parking_lots" RESTART IDENTITY CASCADE;

-- 插入6个停车场数据
INSERT INTO "public"."parking_lots"
  ("name", "total_spaces", "occupied_spaces", "is_full", "open_time", "full_time", "is_activated", "activation_time", "notes", "last_updated")
VALUES
  ('景区停车场', 2400, 0, false, NULL, NULL, false, NULL, '景区主停车场，靠近灵山正门', NOW()),
  ('月亮湾停车场', 1300, 0, false, NULL, NULL, false, NULL, '靠近拈花湾入口', NOW()),
  ('灵湖路停车', 300, 0, false, NULL, NULL, false, NULL, '节假日临时开放', NOW()),
  ('八局停车场', 100, 0, false, NULL, NULL, false, NULL, '内部停车场', NOW()),
  ('贵宾停车场', 140, 0, false, NULL, NULL, false, NULL, 'VIP专用', NOW()),
  ('古竹停车', 200, 0, false, NULL, NULL, false, NULL, '节假日临时开放', NOW());

-- 验证结果
SELECT * FROM "public"."parking_lots" ORDER BY "id";
