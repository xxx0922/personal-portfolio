import { supabase } from './supabase';
import { getLocalDateString } from '@/lib/utils';
import type {
  HistoricalTraffic,
  ParkingLot,
  ParkingHistory,
  DailySnapshot,
  RoadTraffic,
  VisitorCount,
  AlertConfig,
  TrafficControlMeasure,
  WeatherData,
  ShuttleControlPoint,
  ReservationVisitors,
} from '@/types/traffic';

// 获取历史客流车流数据
export async function getHistoricalTraffic(): Promise<HistoricalTraffic[]> {
  const { data, error } = await supabase
    .from('historical_traffic')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 批量插入历史数据
export async function batchInsertHistoricalTraffic(
  records: Omit<HistoricalTraffic, 'id' | 'created_at'>[]
): Promise<void> {
  console.log('[API] 开始批量插入数据，记录数:', records.length);
  
  // 验证必填字段
  const validRecords = records.filter((record, index) => {
    const hasDate = record.date && record.date !== '';
    const hasDayOfWeek = record.day_of_week && record.day_of_week !== '';
    const hasActualVisitorCount = record.actual_visitor_count !== null && 
                                   record.actual_visitor_count !== undefined && 
                                   !isNaN(record.actual_visitor_count);
    
    if (!hasDate || !hasDayOfWeek || !hasActualVisitorCount) {
      console.warn(`[API] 记录${index + 1}缺少必填字段，已过滤:`, {
        date: record.date,
        day_of_week: record.day_of_week,
        actual_visitor_count: record.actual_visitor_count
      });
      return false;
    }
    
    return true;
  });
  
  console.log('[API] 验证后有效记录数:', validRecords.length);
  
  if (validRecords.length === 0) {
    throw new Error('没有有效的记录可以插入');
  }
  
  if (validRecords.length > 0) {
    console.log('[API] 第一条有效记录示例:', JSON.stringify(validRecords[0]));
  }
  
  const { data, error } = await supabase
    .from('historical_traffic')
    .upsert(validRecords, {
      onConflict: 'date',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    console.error('[API] 插入数据失败:', error);
    throw error;
  }
  
  console.log('[API] 插入成功，返回数据条数:', data?.length || 0);
}

// 删除历史数据
export async function deleteHistoricalTraffic(id: number): Promise<void> {
  const { error } = await supabase
    .from('historical_traffic')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 更新历史数据
export async function updateHistoricalTraffic(
  id: number,
  updates: Partial<Omit<HistoricalTraffic, 'id' | 'created_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('historical_traffic')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// 获取停车场数据
export async function getParkingLots(): Promise<ParkingLot[]> {
  const { data, error } = await supabase
    .from('parking_lots')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 更新停车场占用数
export async function updateParkingLot(
  id: number,
  occupied_spaces: number,
  open_time?: string | null,
  full_time?: string | null,
  is_activated?: boolean,
  activation_time?: string | null,
  notes?: string | null,
  is_full?: boolean
): Promise<void> {
  const updates: Record<string, unknown> = {
    occupied_spaces,
    last_updated: new Date().toISOString()
  };

  if (open_time !== undefined) updates.open_time = open_time;
  if (full_time !== undefined) updates.full_time = full_time;
  if (is_activated !== undefined) updates.is_activated = is_activated;
  if (activation_time !== undefined) updates.activation_time = activation_time;
  if (notes !== undefined) updates.notes = notes;
  if (is_full !== undefined) updates.is_full = is_full;

  const { error } = await supabase
    .from('parking_lots')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// 获取停车场历史记录
export async function getParkingHistory(
  parkingLotId: number,
  date: string
): Promise<ParkingHistory[]> {
  const { data, error } = await supabase
    .from('parking_history')
    .select('*')
    .eq('parking_lot_id', parkingLotId)
    .eq('date', date)
    .order('hour', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 保存停车场历史记录
export async function saveParkingHistory(
  parkingLotId: number,
  occupiedSpaces: number,
  date: string,
  hour: number
): Promise<void> {
  const { error } = await supabase
    .from('parking_history')
    .insert({
      parking_lot_id: parkingLotId,
      occupied_spaces: occupiedSpaces,
      date,
      hour,
    });

  if (error) throw error;
}

// 获取每日快照
export async function getDailySnapshot(date: string): Promise<DailySnapshot | null> {
  const { data, error } = await supabase
    .from('daily_snapshot')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取日期范围内的快照
export async function getDailySnapshots(
  startDate: string,
  endDate: string
): Promise<DailySnapshot[]> {
  const { data, error } = await supabase
    .from('daily_snapshot')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 保存每日快照
export async function saveDailySnapshot(
  date: string,
  visitorCount: number,
  weather: string | null,
  parkingData: Record<string, unknown>,
  roadData: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('daily_snapshot')
    .upsert({
      date,
      visitor_count: visitorCount,
      weather,
      parking_data: parkingData,
      road_data: roadData,
    }, {
      onConflict: 'date'
    });

  if (error) throw error;
}

// 获取道路车流数据
export async function getRoadTraffic(): Promise<RoadTraffic[]> {
  const { data, error } = await supabase
    .from('road_traffic')
    .select('*')
    .order('road_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 更新道路车流数据
export async function updateRoadTraffic(
  id: number,
  traffic_density: number,
  status: 'normal' | 'busy' | 'congested',
  control_start_time?: string | null,
  control_end_time?: string | null
): Promise<void> {
  const updates: Record<string, unknown> = { 
    traffic_density, 
    status, 
    last_updated: new Date().toISOString() 
  };
  
  if (control_start_time !== undefined) updates.control_start_time = control_start_time;
  if (control_end_time !== undefined) updates.control_end_time = control_end_time;

  const { error } = await supabase
    .from('road_traffic')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// 获取当日入园人数
export async function getVisitorCount(): Promise<VisitorCount | null> {
  const today = getLocalDateString();
  const { data, error } = await supabase
    .from('visitor_count')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 更新入园人数
export async function updateVisitorCount(count: number): Promise<void> {
  const today = getLocalDateString();
  
  const { data: existing } = await supabase
    .from('visitor_count')
    .select('id')
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('visitor_count')
      .update({ current_count: count, last_updated: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('visitor_count')
      .insert({ current_count: count, date: today });
    if (error) throw error;
  }
}

// 获取预警配置
export async function getAlertConfig(): Promise<AlertConfig[]> {
  const { data, error } = await supabase
    .from('alert_config')
    .select('*');

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 获取交通管制措施
export async function getTrafficControlMeasures(): Promise<TrafficControlMeasure[]> {
  const { data, error } = await supabase
    .from('traffic_control_measures')
    .select('*')
    .order('measure_name', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 更新交通管制措施状态
export async function updateTrafficControlMeasure(
  id: number,
  status: 'active' | 'inactive'
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  
  if (status === 'active') {
    updates.activated_at = new Date().toISOString();
    updates.deactivated_at = null;
  } else {
    updates.deactivated_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('traffic_control_measures')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// 获取天气数据（无锡市滨湖区马山）
export async function getWeatherData(areaCn = '无锡市滨湖区马山'): Promise<WeatherData | null> {
  try {
    // 马山/灵山景区附近坐标，使用 Open-Meteo 无 Key 实时天气接口，避免 Supabase Edge Function CORS/部署问题
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', '31.43');
    url.searchParams.set('longitude', '120.08');
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m');
    url.searchParams.set('timezone', 'Asia/Shanghai');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`天气接口请求失败: ${response.status}`);
    }

    const result = await response.json();
    const current = result?.current;
    if (!current) return null;

    const weatherCodeMap: Record<number, string> = {
      0: '晴',
      1: '大部晴朗',
      2: '局部多云',
      3: '阴',
      45: '雾',
      48: '雾凇',
      51: '小毛毛雨',
      53: '毛毛雨',
      55: '大毛毛雨',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      80: '阵雨',
      81: '强阵雨',
      82: '暴雨',
      95: '雷暴',
      96: '雷暴伴冰雹',
      99: '强雷暴伴冰雹',
    };

    return {
      cityInfo: {
        areaCn,
        areaCode: '320211',
        cityCn: '无锡',
      },
      now: {
        temp: String(Math.round(current.temperature_2m ?? 0)),
        weather: weatherCodeMap[current.weather_code] || '未知',
        WD: '--',
        WS: `${current.wind_speed_10m ?? '--'}km/h`,
        SD: `${current.relative_humidity_2m ?? '--'}%`,
        aqi: '--',
      },
      day: {
        weather: weatherCodeMap[current.weather_code] || '未知',
        temperature: String(Math.round(current.temperature_2m ?? 0)),
        wind: '--',
        wind_pow: `${current.wind_speed_10m ?? '--'}km/h`,
      },
      night: {
        weather: weatherCodeMap[current.weather_code] || '未知',
        temperature: String(Math.round(current.temperature_2m ?? 0)),
        wind: '--',
        wind_pow: `${current.wind_speed_10m ?? '--'}km/h`,
      },
    };
  } catch (err) {
    console.error('获取马山实时天气失败:', err);
    return null;
  }
}

// 获取短驳管控点位
export async function getShuttleControlPoints(): Promise<ShuttleControlPoint[]> {
  const { data, error } = await supabase
    .from('shuttle_control_points')
    .select('*')
    .order('id');

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 更新短驳管控点位状态
export async function updateShuttleControlPoint(
  id: number,
  is_controlled: boolean,
  control_start_time?: string | null,
  control_end_time?: string | null
): Promise<void> {
  const updates: Record<string, unknown> = {
    is_controlled,
    updated_at: new Date().toISOString()
  };

  if (control_start_time !== undefined) updates.control_start_time = control_start_time;
  if (control_end_time !== undefined) updates.control_end_time = control_end_time;

  const { error } = await supabase
    .from('shuttle_control_points')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// 获取当日预约游客数据
export async function getReservationVisitors(date: string): Promise<ReservationVisitors | null> {
  const { data, error } = await supabase
    .from('reservation_visitors')
    .select('*')
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 获取所有预约游客数据
export async function getAllReservationVisitors(): Promise<ReservationVisitors[]> {
  const { data, error } = await supabase
    .from('reservation_visitors')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// 添加或更新预约游客数据
export async function upsertReservationVisitors(
  record: Omit<ReservationVisitors, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const { error } = await supabase
    .from('reservation_visitors')
    .upsert({
      ...record,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'date',
      ignoreDuplicates: false
    });

  if (error) throw error;
}

// 删除预约游客数据（通过日期）
export async function deleteReservationVisitors(date: string): Promise<void> {
  const { error } = await supabase
    .from('reservation_visitors')
    .delete()
    .eq('date', date);

  if (error) throw error;
}
