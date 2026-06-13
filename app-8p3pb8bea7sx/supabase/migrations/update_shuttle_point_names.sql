-- ============================================================
-- 更新短驳管控点位名称
-- 按 id 顺序对应替换为新的6个名称
-- ============================================================

UPDATE "public"."shuttle_control_points"
SET "point_name" = CASE "id"
  WHEN 1 THEN '高速口'
  WHEN 2 THEN '千波桥'
  WHEN 3 THEN '灵湖大桥'
  WHEN 4 THEN '七里风光堤'
  WHEN 5 THEN '灵湖路'
  WHEN 6 THEN '西村路口'
  ELSE "point_name"
END
WHERE "id" BETWEEN 1 AND 6;

-- 验证结果
SELECT * FROM "public"."shuttle_control_points" ORDER BY "id";
