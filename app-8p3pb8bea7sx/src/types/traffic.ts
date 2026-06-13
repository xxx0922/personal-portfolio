// 历史客流车流数据
export interface HistoricalTraffic {
  id: number;
  date: string;
  day_of_week: string;
  festival?: string | null;
  year_2019: number | null;
  year_2020: number | null;
  year_2021: number | null;
  year_2022: number | null;
  year_2023: number | null;
  year_2024: number | null;
  year_2025: number | null;
  year_2026: number | null;
  actual_visitor_count: number; // 数据库字段名
  weather: string | null;
  forecast_visitors?: number | null;
  weather_forecast?: string | null;
  yuelvwan_open_time?: string | null;
  yuelvwan_open_visitor_count?: number | null;
  guoyuan_remaining_spaces?: number | null;
  guoyuan_full_time?: string | null;
  linghu_bridge_diversion_start?: string | null;
  linghu_bridge_diversion_end?: string | null;
  highway_stop_diversion_time?: string | null;
  qianbo_bridge_stop_diversion_time?: string | null;
  linghu_road_open_time?: string | null;
  linghu_road_full_time?: string | null;
  guzhu_open_time?: string | null;
  guoyuan_parking_count?: number | null;
  yuelvwan_parking_count?: number | null;
  created_at: string;
}

// 停车场数据
export interface ParkingLot {
  id: number;
  name: string;
  total_spaces: number;
  occupied_spaces: number;
  is_full?: boolean;
  open_time?: string | null;
  full_time?: string | null;
  is_activated?: boolean;
  activation_time?: string | null;
  notes?: string | null;
  last_updated: string;
}

// 停车场历史记录
export interface ParkingHistory {
  id: number;
  parking_lot_id: number;
  occupied_spaces: number;
  date: string;
  hour: number;
  created_at: string;
}

// 每日快照
export interface DailySnapshot {
  id: number;
  date: string;
  visitor_count: number;
  weather: string | null;
  parking_data: Record<string, unknown> | null;
  road_data: Record<string, unknown> | null;
  created_at: string;
}

// 道路车流数据
export interface RoadTraffic {
  id: number;
  road_name: string;
  traffic_density: number;
  status: 'normal' | 'busy' | 'congested';
  control_start_time?: string | null;
  control_end_time?: string | null;
  last_updated: string;
}

// 入园人数
export interface VisitorCount {
  id: number;
  current_count: number;
  date: string;
  last_updated: string;
}

// 预警配置
export interface AlertConfig {
  id: number;
  alert_type: string;
  yellow_threshold: number;
  red_threshold: number;
  updated_at: string;
}

// 交通管制措施
export interface TrafficControlMeasure {
  id: number;
  measure_name: string;
  status: 'active' | 'inactive';
  activated_at: string | null;
  deactivated_at: string | null;
  created_at: string;
}

// 天气数据
export interface WeatherData {
  cityInfo: {
    areaCn: string;
    areaCode: string;
    cityCn: string;
  };
  now: {
    temp: string;
    weather: string;
    WD: string;
    WS: string;
    SD: string;
    aqi: string;
  };
  day: {
    weather: string;
    temperature: string;
    wind: string;
    wind_pow: string;
  };
  night: {
    weather: string;
    temperature: string;
    wind: string;
    wind_pow: string;
  };
}

// 预警级别
export type AlertLevel = 'success' | 'warning' | 'danger';

// 预警状态
export interface AlertStatus {
  level: AlertLevel;
  message: string;
  percentage: number;
}

// 短驳管控点位
export interface ShuttleControlPoint {
  id: number;
  point_name: string;
  is_controlled: boolean;
  control_start_time?: string | null;
  control_end_time?: string | null;
  created_at: string;
  updated_at: string;
}

// 当日预约游客
export interface ReservationVisitors {
  id: number;
  date: string;
  reserved_count: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
