-- ============================================================
-- 无锡灵山景区 - 短驳管控点位默认数据
-- 执行前请确保已连接到正确的 Supabase 项目数据库
-- ============================================================

-- 1. 先清空已有数据（如需保留历史请跳过此步）
-- TRUNCATE TABLE shuttle_control_points RESTART IDENTITY CASCADE;

-- 2. 插入默认短驳管控点位
INSERT INTO "public"."shuttle_control_points" ("point_name", "is_controlled", "created_at", "updated_at")
VALUES
  ('灵山正门', false, NOW(), NOW()),
  ('拈花湾入口', false, NOW(), NOW()),
  ('果园停车场', false, NOW(), NOW()),
  ('月亮湾停车场', false, NOW(), NOW()),
  ('高速出口接驳点', false, NOW(), NOW()),
  ('公交总站', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3. 验证插入结果
SELECT * FROM "public"."shuttle_control_points" ORDER BY "id";
