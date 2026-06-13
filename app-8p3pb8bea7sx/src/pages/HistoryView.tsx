import { useState, useEffect } from 'react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  CalendarIcon, 
  ArrowLeft, 
  Users, 
  Car, 
  Cloud,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import {
  getDailySnapshot,
  getParkingLots,
  getParkingHistory,
  getHistoricalTraffic,
} from '@/db/api';
import type { 
  DailySnapshot, 
  ParkingLot, 
  ParkingHistory,
  HistoricalTraffic 
} from '@/types/traffic';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label } from 'recharts';
import HolidaySelector from '@/components/HolidaySelector';

// 年份配置
const YEAR_CONFIGS = [
  { year: 2019, key: 'year2019', color: 'hsl(var(--accent))', name: '2019年' },
  { year: 2020, key: 'year2020', color: 'hsl(var(--secondary))', name: '2020年' },
  { year: 2021, key: 'year2021', color: 'hsl(var(--chart-1))', name: '2021年' },
  { year: 2022, key: 'year2022', color: 'hsl(var(--primary))', name: '2022年' },
  { year: 2023, key: 'year2023', color: 'hsl(var(--warning))', name: '2023年' },
  { year: 2024, key: 'year2024', color: 'hsl(var(--chart-2))', name: '2024年' },
  { year: 2025, key: 'year2025', color: 'hsl(var(--chart-3))', name: '2025年' },
];

export default function HistoryView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [parkingHistories, setParkingHistories] = useState<Record<number, ParkingHistory[]>>({});
  const [historicalData, setHistoricalData] = useState<HistoricalTraffic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParkingLots();
    loadHistoricalData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadData(selectedDate);
    }
  }, [selectedDate]);

  const loadParkingLots = async () => {
    try {
      const lots = await getParkingLots();
      setParkingLots(lots);
    } catch (error) {
      console.error('加载停车场数据失败:', error);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const data = await getHistoricalTraffic();
      setHistoricalData(data);
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
  };

  const loadData = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // 加载每日快照
      const snapshotData = await getDailySnapshot(dateStr);
      setSnapshot(snapshotData);

      // 加载停车场历史记录
      const histories: Record<number, ParkingHistory[]> = {};
      for (const lot of parkingLots) {
        const history = await getParkingHistory(lot.id, dateStr);
        histories[lot.id] = history;
      }
      setParkingHistories(histories);

      if (!snapshotData) {
        toast.info('该日期暂无历史数据记录');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理节假日选择
  const handleSelectHoliday = (start: Date, end: Date, holidayName: string) => {
    // 选择节假日的第一天
    setSelectedDate(start);
    toast.success(`已选择 ${holidayName}`, {
      description: `查看 ${format(start, 'yyyy-MM-dd')} 的数据`,
    });
  };

  // 查找匹配的历史客流数据
  const getMatchingHistoricalTraffic = (): HistoricalTraffic | null => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return historicalData.find(d => d.date === dateStr) || null;
  };

  const matchingTraffic = getMatchingHistoricalTraffic();

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground xl:text-3xl">
              历史数据查看
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              选择日期查看历史交通数据
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  locale={zhCN}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回仪表盘
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          </div>
        ) : (
          <>
            {/* 概览卡片 */}
            <div className="grid gap-4 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">入园人数</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {snapshot?.visitor_count || matchingTraffic?.actual_visitor_count || 0}
                  </div>
                  {matchingTraffic && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div>2022年: {matchingTraffic.year_2022 || '-'}</div>
                      <div>2023年: {matchingTraffic.year_2023 || '-'}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">天气状况</CardTitle>
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {snapshot?.weather || matchingTraffic?.weather || '无记录'}
                  </div>
                  {matchingTraffic && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {matchingTraffic.day_of_week}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">停车场总览</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{parkingLots.length}个</div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    总车位: {parkingLots.reduce((sum, lot) => sum + lot.total_spaces, 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">数据状态</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <Badge variant={snapshot ? 'default' : 'outline'}>
                      {snapshot ? '有记录' : '无记录'}
                    </Badge>
                  </div>
                  {snapshot && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      记录时间: {new Date(snapshot.created_at).toLocaleString('zh-CN')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 主要内容区域 - 添加网格布局 */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* 左侧和中间：数据展示区域 */}
              <div className="space-y-6 lg:col-span-2">
                {/* 历年客流对比分析 */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      历年客流对比分析（2019-2025年）
                    </CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      展示所有历史数据的客流趋势对比
                    </p>
                    {historicalData.length > 0 && (() => {
                      // 计算各年份的最高点
                      const chartData = historicalData.map(item => ({
                        date: format(new Date(item.date), 'yyyy-MM-dd', { locale: zhCN }),
                        day: item.day_of_week,
                        year2019: item.year_2019 || 0,
                        year2020: item.year_2020 || 0,
                        year2021: item.year_2021 || 0,
                        year2022: item.year_2022 || 0,
                        year2023: item.year_2023 || 0,
                        year2024: item.year_2024 || 0,
                        year2025: item.year_2025 || 0,
                        total: item.actual_visitor_count || 0,
                      }));
                      
                      // 计算每个年份的最高点
                      const yearMaxValues = YEAR_CONFIGS.map(config => {
                        const maxItem = chartData.reduce((max, item) => 
                          (item[config.key as keyof typeof item] as number) > (max[config.key as keyof typeof max] as number) ? item : max, 
                          chartData[0]
                        );
                        return {
                          ...config,
                          maxValue: maxItem[config.key as keyof typeof maxItem] as number,
                          maxDate: maxItem.date,
                          maxDay: maxItem.day,
                        };
                      }).filter(item => item.maxValue > 0); // 只显示有数据的年份
                      
                      const maxTotal = chartData.reduce((max, item) => 
                        item.total > max.total ? item : max, chartData[0]);
                      
                      return (
                        <div className="mt-3 grid gap-2 text-xs">
                          {yearMaxValues.map((item, index) => (
                            <div key={item.year} className="flex items-center gap-2" style={{ color: item.color }}>
                              <Star className="h-3 w-3" style={{ fill: item.color }} />
                              <span>{item.name}峰值: {item.maxValue.toLocaleString()}人 ({item.maxDate} {item.maxDay})</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-success">
                            <Star className="h-3 w-3 fill-success" />
                            <span>实际游客峰值: {maxTotal.total.toLocaleString()}人 ({maxTotal.date} {maxTotal.day})</span>
                          </div>
                        </div>
                      );
                    })()}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {historicalData.length > 0 ? (
                      (() => {
                        const chartData = historicalData.map(item => ({
                          date: format(new Date(item.date), 'yyyy-MM-dd', { locale: zhCN }),
                          day: item.day_of_week,
                          year2019: item.year_2019 || 0,
                          year2020: item.year_2020 || 0,
                          year2021: item.year_2021 || 0,
                          year2022: item.year_2022 || 0,
                          year2023: item.year_2023 || 0,
                          year2024: item.year_2024 || 0,
                          year2025: item.year_2025 || 0,
                          total: item.actual_visitor_count || 0,
                        }));
                        
                        // 计算每个年份的最高点
                        const yearMaxValues = YEAR_CONFIGS.map(config => {
                          const maxItem = chartData.reduce((max, item) => 
                            (item[config.key as keyof typeof item] as number) > (max[config.key as keyof typeof max] as number) ? item : max, 
                            chartData[0]
                          );
                          return {
                            ...config,
                            maxValue: maxItem[config.key as keyof typeof maxItem] as number,
                            maxDate: maxItem.date,
                          };
                        });
                        
                        const maxTotal = chartData.reduce((max, item) => 
                          item.total > max.total ? item : max, chartData[0]);
                        
                        return (
                          <div className="h-[600px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis 
                                  dataKey="date" 
                                  stroke="hsl(var(--foreground))"
                                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis 
                                  stroke="hsl(var(--foreground))"
                                  tick={{ fill: 'hsl(var(--foreground))' }}
                                />
                                <Tooltip 
                                  contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                  }}
                                />
                                <Legend />
                                
                                {/* 渲染所有年份的数据线和最高点标记 */}
                                {yearMaxValues.map((config) => (
                                  <React.Fragment key={config.year}>
                                    <Line 
                                      type="monotone" 
                                      dataKey={config.key} 
                                      stroke={config.color}
                                      strokeWidth={2}
                                      name={config.name}
                                      dot={false}
                                    />
                                    {config.maxValue > 0 && (
                                      <ReferenceDot
                                        x={config.maxDate}
                                        y={config.maxValue}
                                        r={5}
                                        fill={config.color}
                                        stroke="hsl(var(--background))"
                                        strokeWidth={2}
                                      >
                                        <Label
                                          value={config.maxValue.toLocaleString()}
                                          position="top"
                                          fill={config.color}
                                          fontSize={11}
                                          fontWeight="bold"
                                        />
                                      </ReferenceDot>
                                    )}
                                  </React.Fragment>
                                ))}
                                
                                {/* 实际游客数据线 */}
                                <Line 
                                  type="monotone" 
                                  dataKey="total" 
                                  stroke="hsl(var(--success))" 
                                  strokeWidth={3}
                                  name="实际游客数"
                                  dot={false}
                                />
                                {/* 实际游客最高点标记 */}
                                {maxTotal.total > 0 && (
                                  <ReferenceDot
                                    x={maxTotal.date}
                                    y={maxTotal.total}
                                    r={6}
                                    fill="hsl(var(--success))"
                                    stroke="hsl(var(--background))"
                                    strokeWidth={2}
                                  >
                                    <Label
                                      value={maxTotal.total.toLocaleString()}
                                      position="top"
                                      fill="hsl(var(--success))"
                                      fontSize={12}
                                      fontWeight="bold"
                                    />
                                  </ReferenceDot>
                                )}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        暂无历史数据
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 右侧：节假日选择器 */}
              <div className="space-y-6">
                <HolidaySelector onSelectHoliday={handleSelectHoliday} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
