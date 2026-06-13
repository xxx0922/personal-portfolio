-- 云端 Supabase 初始化脚本（用于大交通仪表盘）

-- 执行位置：Supabase Dashboard → SQL Editor → New Query → Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  user_count INTEGER;
  default_role TEXT;
  profile_exists BOOLEAN;
BEGIN
  -- 记录日志：函数被调用
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  
  -- 检查profile是否已存在
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE LOG 'Profile already exists for user: %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- 计算现有用户数量
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  RAISE LOG 'Current user count: %', user_count;
  
  -- 如果是第一个用户，设置为admin，否则设置为user
  IF user_count = 0 THEN
    default_role := 'admin';
    RAISE LOG 'Setting user % as admin (first user)', NEW.id;
  ELSE
    default_role := 'user';
    RAISE LOG 'Setting user % as user', NEW.id;
  END IF;
  
  -- 插入新的profile记录
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    default_role::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果插入失败，记录错误但不阻止用户创建
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TABLE "public"."alert_config" (
    "id" bigint NOT NULL,
    "alert_type" "text" NOT NULL,
    "yellow_threshold" numeric DEFAULT 70 NOT NULL,
    "red_threshold" numeric DEFAULT 90 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE SEQUENCE "public"."alert_config_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."alert_config_id_seq" OWNED BY "public"."alert_config"."id";

CREATE TABLE "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(200) NOT NULL,
    "content" "text" NOT NULL,
    "type" character varying(50) DEFAULT 'normal'::character varying,
    "priority" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "publish_date" timestamp with time zone DEFAULT "now"(),
    "expire_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."daily_snapshot" (
    "id" bigint NOT NULL,
    "date" "date" NOT NULL,
    "visitor_count" integer DEFAULT 0 NOT NULL,
    "weather" "text",
    "parking_data" "jsonb",
    "road_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE SEQUENCE "public"."daily_snapshot_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."daily_snapshot_id_seq" OWNED BY "public"."daily_snapshot"."id";

CREATE TABLE "public"."historical_traffic" (
    "id" bigint NOT NULL,
    "date" "date" NOT NULL,
    "day_of_week" "text" NOT NULL,
    "year_2022" integer,
    "year_2023" integer,
    "actual_visitor_count" integer NOT NULL,
    "weather" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "forecast_visitors" integer,
    "weather_forecast" "text",
    "yuelvwan_open_time" time without time zone,
    "yuelvwan_open_visitor_count" integer,
    "guoyuan_remaining_spaces" integer,
    "guoyuan_full_time" time without time zone,
    "linghu_bridge_diversion_start" time without time zone,
    "linghu_bridge_diversion_end" time without time zone,
    "highway_stop_diversion_time" time without time zone,
    "qianbo_bridge_stop_diversion_time" time without time zone,
    "linghu_road_open_time" time without time zone,
    "linghu_road_full_time" time without time zone,
    "guzhu_open_time" time without time zone,
    "guoyuan_parking_count" integer,
    "yuelvwan_parking_count" integer,
    "forecast_visitor_count" integer,
    "yuewanwan_open_time" "text",
    "yuewanwan_guoyuan_capacity" integer,
    "highway_diversion_time" "text",
    "qianbo_bridge_diversion_time" "text",
    "linghu_bridge_diversion_time" "text",
    "linghu_road_parking_time" "text",
    "guzhu_sides_open_time" "text",
    "yuewanwan_parking_count" integer
);

CREATE SEQUENCE "public"."historical_traffic_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."historical_traffic_id_seq" OWNED BY "public"."historical_traffic"."id";

CREATE TABLE "public"."holidays" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "year" integer NOT NULL,
    "holiday_name" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "days" integer NOT NULL,
    "emoji" "text" DEFAULT '🎉'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."parking_history" (
    "id" bigint NOT NULL,
    "parking_lot_id" bigint NOT NULL,
    "occupied_spaces" integer NOT NULL,
    "date" "date" NOT NULL,
    "hour" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE SEQUENCE "public"."parking_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."parking_history_id_seq" OWNED BY "public"."parking_history"."id";

CREATE TABLE "public"."parking_lots" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "total_spaces" integer NOT NULL,
    "occupied_spaces" integer DEFAULT 0 NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "open_time" time without time zone,
    "full_time" time without time zone,
    "is_activated" boolean DEFAULT false,
    "activation_time" time without time zone,
    "notes" "text",
    "in_flow" integer DEFAULT 0,
    "out_flow" integer DEFAULT 0,
    "estimated_full_time" timestamp with time zone
);

CREATE SEQUENCE "public"."parking_lots_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."parking_lots_id_seq" OWNED BY "public"."parking_lots"."id";

CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "phone" "text",
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."reservation_visitors" (
    "id" integer NOT NULL,
    "date" "date" NOT NULL,
    "reserved_count" integer DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE "public"."reservation_visitors_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."reservation_visitors_id_seq" OWNED BY "public"."reservation_visitors"."id";

CREATE TABLE "public"."road_traffic" (
    "id" bigint NOT NULL,
    "road_name" "text" NOT NULL,
    "traffic_density" integer DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'normal'::"text" NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "control_start_time" time without time zone,
    "control_end_time" time without time zone
);

CREATE SEQUENCE "public"."road_traffic_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."road_traffic_id_seq" OWNED BY "public"."road_traffic"."id";

CREATE TABLE "public"."service_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(200) NOT NULL,
    "type" character varying(50) NOT NULL,
    "location_lat" numeric(10,7),
    "location_lng" numeric(10,7),
    "description" "text",
    "icon_emoji" character varying(10),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."shuttle_control_history" (
    "id" bigint NOT NULL,
    "point_id" bigint NOT NULL,
    "point_name" "text" NOT NULL,
    "action" "text" NOT NULL,
    "action_time" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "shuttle_control_history_action_check" CHECK (("action" = ANY (ARRAY['start'::"text", 'stop'::"text"])))
);

CREATE SEQUENCE "public"."shuttle_control_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."shuttle_control_history_id_seq" OWNED BY "public"."shuttle_control_history"."id";

CREATE TABLE "public"."shuttle_control_points" (
    "id" bigint NOT NULL,
    "point_name" "text" NOT NULL,
    "is_controlled" boolean DEFAULT false,
    "control_start_time" timestamp with time zone,
    "control_end_time" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE SEQUENCE "public"."shuttle_control_points_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."shuttle_control_points_id_seq" OWNED BY "public"."shuttle_control_points"."id";

CREATE TABLE "public"."shuttle_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "online_vehicles" integer DEFAULT 0,
    "departure_frequency" integer DEFAULT 0,
    "current_passengers" integer DEFAULT 0,
    "waiting_count" integer DEFAULT 0,
    "total_trips" integer DEFAULT 0,
    "alert_level" character varying(20) DEFAULT 'normal'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."shuttle_vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_number" character varying(50) NOT NULL,
    "vehicle_type" character varying(50) DEFAULT '大巴'::character varying,
    "capacity" integer DEFAULT 50,
    "status" character varying(20) DEFAULT 'offline'::character varying,
    "current_location" "text",
    "driver_name" character varying(100),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."system_status" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "system_name" character varying(100) NOT NULL,
    "status" character varying(20) DEFAULT 'online'::character varying,
    "online_rate" numeric(5,2) DEFAULT 100.00,
    "last_check_time" timestamp with time zone DEFAULT "now"(),
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."traffic_control_measures" (
    "id" bigint NOT NULL,
    "measure_name" "text" NOT NULL,
    "status" "text" DEFAULT 'inactive'::"text" NOT NULL,
    "activated_at" timestamp with time zone,
    "deactivated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE SEQUENCE "public"."traffic_control_measures_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."traffic_control_measures_id_seq" OWNED BY "public"."traffic_control_measures"."id";

CREATE TABLE "public"."traffic_control_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_name" character varying(200) NOT NULL,
    "alert_level" character varying(20) NOT NULL,
    "trigger_condition" "text",
    "control_measures" "text",
    "priority" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE "public"."visitor_count" (
    "id" bigint NOT NULL,
    "current_count" integer DEFAULT 0 NOT NULL,
    "date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "today_total" integer DEFAULT 0,
    "max_capacity" integer DEFAULT 50000,
    "yesterday_count" integer DEFAULT 0,
    "last_week_count" integer DEFAULT 0
);

CREATE SEQUENCE "public"."visitor_count_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE "public"."visitor_count_id_seq" OWNED BY "public"."visitor_count"."id";

CREATE TABLE "public"."webhook_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "webhook_url" "text" NOT NULL,
    "enabled" boolean DEFAULT true,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "message_template" "text"
);

CREATE TABLE "public"."workday_adjustments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "year" integer NOT NULL,
    "reason" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."alert_config" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."alert_config_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."daily_snapshot" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."daily_snapshot_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."historical_traffic" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."historical_traffic_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."parking_history" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."parking_history_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."parking_lots" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."parking_lots_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."reservation_visitors" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."reservation_visitors_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."road_traffic" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."road_traffic_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."shuttle_control_history" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shuttle_control_history_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."shuttle_control_points" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shuttle_control_points_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."traffic_control_measures" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."traffic_control_measures_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."visitor_count" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."visitor_count_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."alert_config"
    ADD CONSTRAINT "alert_config_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."daily_snapshot"
    ADD CONSTRAINT "daily_snapshot_date_key" UNIQUE ("date");

ALTER TABLE ONLY "public"."daily_snapshot"
    ADD CONSTRAINT "daily_snapshot_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."historical_traffic"
    ADD CONSTRAINT "historical_traffic_date_unique" UNIQUE ("date");

ALTER TABLE ONLY "public"."historical_traffic"
    ADD CONSTRAINT "historical_traffic_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."holidays"
    ADD CONSTRAINT "holidays_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."parking_history"
    ADD CONSTRAINT "parking_history_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."parking_lots"
    ADD CONSTRAINT "parking_lots_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reservation_visitors"
    ADD CONSTRAINT "reservation_visitors_date_key" UNIQUE ("date");

ALTER TABLE ONLY "public"."reservation_visitors"
    ADD CONSTRAINT "reservation_visitors_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."road_traffic"
    ADD CONSTRAINT "road_traffic_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."service_points"
    ADD CONSTRAINT "service_points_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shuttle_control_history"
    ADD CONSTRAINT "shuttle_control_history_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shuttle_control_points"
    ADD CONSTRAINT "shuttle_control_points_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shuttle_status"
    ADD CONSTRAINT "shuttle_status_date_key" UNIQUE ("date");

ALTER TABLE ONLY "public"."shuttle_status"
    ADD CONSTRAINT "shuttle_status_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shuttle_vehicles"
    ADD CONSTRAINT "shuttle_vehicles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."shuttle_vehicles"
    ADD CONSTRAINT "shuttle_vehicles_vehicle_number_key" UNIQUE ("vehicle_number");

ALTER TABLE ONLY "public"."system_status"
    ADD CONSTRAINT "system_status_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."traffic_control_measures"
    ADD CONSTRAINT "traffic_control_measures_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."traffic_control_plans"
    ADD CONSTRAINT "traffic_control_plans_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."visitor_count"
    ADD CONSTRAINT "visitor_count_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."webhook_config"
    ADD CONSTRAINT "webhook_config_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."workday_adjustments"
    ADD CONSTRAINT "workday_adjustments_date_key" UNIQUE ("date");

ALTER TABLE ONLY "public"."workday_adjustments"
    ADD CONSTRAINT "workday_adjustments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."parking_history"
    ADD CONSTRAINT "parking_history_parking_lot_id_fkey" FOREIGN KEY ("parking_lot_id") REFERENCES "public"."parking_lots"("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."shuttle_control_history"
    ADD CONSTRAINT "shuttle_control_history_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "public"."shuttle_control_points"("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION "public"."is_admin"("uid" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'::public.user_role
  );
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();


-- 开发阶段访问权限：允许前端读写业务表（后续上线可收紧 RLS）
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;