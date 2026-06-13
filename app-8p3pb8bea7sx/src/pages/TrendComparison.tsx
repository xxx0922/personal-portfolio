import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft, TrendingUp, Users, Car, Calendar as CalendarDays, Star } from 'lucide-react';
import { getHistoricalTraffic } from '@/db/api';
import type { HistoricalTraffic } from '@/types/traffic';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceDot, Label } from 'recharts';
import HolidaySelector from '@/components/HolidaySelector';
import { HOLIDAYS } from '@/data/holidays';

export default function TrendComparison() {
  const [startDate, setStartDate] = useState<Date>(new Date('2023-10-01'));
  const [endDate, setEndDate] = useState<Date>(new Date('2023-10-07'));
  const [historicalData, setHistoricalData] = useState<HistoricalTraffic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getHistoricalTraffic();
      
      // 过滤日期范围内的数据
      const filtered = data.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
      
      setHistoricalData(filtered);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理节假日选择
  const handleSelectHoliday = (start: Date, end: Date, holidayName: string) => {
    setStartDate(start);
    setEndDate(end);
    toast.success(`已选择 ${holidayName}`, {
      description: `${format(start, 'yyyy-MM-dd')} 至 ${format(end, 'yyyy-MM-dd')}`,
    });
  };

  // 准备图表数据
  const visitorChartData = historicalData.map((item) => ({
    date: format(new Date(item.date), 'MM-dd', { locale: zhCN }),
    fullDate: item.date,
    day: item.day_of_week,
    year2022: item.year_2022 || 0,
    year2023: item.year_2023 || 0,
    total: item.actual_visitor_count,
  }));

  const parkingChartData = historicalData.map((item) => ({
    date: format(new Date(item.date), 'MM-dd', { locale: zhCN }),
    fullDate: item.date,
    day: item.day_of_week,
    guoyuan: item.guoyuan_parking_count || 0,
    yuelvwan: item.yuelvwan_parking_count || 0,
    total: (item.guoyuan_parking_count || 0) + (item.yuelvwan_parking_count || 0),
  }));

  // 计算统计数据
  const totalVisitors = historicalData.reduce((sum, item) => sum + (item.actual_visitor_count || 0), 0);
  const avgVisitors = historicalData.length > 0 ? Math.round(totalVisitors / historicalData.length) : 0;
  const maxVisitors = historicalData.length > 0 ? Math.max(...historicalData.map(d => d.actual_visitor_count || 0)) : 0;
  const maxVisitorData = visitorChartData.find(d => d.total === maxVisitors);
  const totalParking = historicalData.reduce((sum, item) => 
    sum + (item.guoyuan_parking_count || 0) + (item.yuelvwan_parking_count || 0), 0
  );
  const avgParking = historicalData.length > 0 ? Math.round(totalParking / historicalData.length) : 0;
  const maxParking = parkingChartData.length > 0 ? Math.max(...parkingChartData.map(d => d.total)) : 0;
  const maxParkingData = parkingChartData.find(d => d.total === maxParking);

  // 获取当前日期范围内的节假日
  const getHolidaysInRange = () => {
    const holidays: Array<{ name: string; dates: string[] }> = [];
    const years = ['2022', '2023', '2024', '2025', '2026'];
    
    years.forEach(year => {
      const yearHolidays = HOLIDAYS[year as keyof typeof HOLIDAYS] || [];
      yearHolidays.forEach(holiday => {
        const datesInRange = holiday.dates.filter(date => {
          const d = new Date(date);
          return d >= startDate && d <= endDate;
        });
        if (datesInRange.length > 0) {
          holidays.push({ name: holiday.name, dates: datesInRange });
        }
      });
    });
    
    return holidays;
  };

  const holidaysInRange = getHolidaysInRange();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-[1800px] space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              历史趋势对比分析
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              选择日期范围查看客流和车流趋势对比
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  开始: {format(startDate, 'yyyy-MM-dd', { locale: zhCN })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  locale={zhCN}
                  disabled={(date) => date > new Date() || date > endDate}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  结束: {format(endDate, 'yyyy-MM-dd', { locale: zhCN })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  locale={zhCN}
                  disabled={(date) => date > new Date() || date < startDate}
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
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
            {/* 数据统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">数据天数</CardTitle>
                  <CalendarDays className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{historicalData.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {format(startDate, 'yyyy-MM-dd')} 至 {format(endDate, 'yyyy-MM-dd')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总游客数</CardTitle>
                  <Users className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{totalVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    日均 {avgVisitors.toLocaleString()} 人
                  </p>
                </CardContent>
              </Card>

              <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">峰值游客数</CardTitle>
                  <TrendingUp className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{maxVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {maxVisitorData ? `${maxVisitorData.date} (${maxVisitorData.day})` : '历史最高单日游客数'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均停车数</CardTitle>
                  <Car className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{avgParking.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    日均停车数量
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 主要内容区域 */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* 左侧：图表区域 */}
              <div className="space-y-6 lg:col-span-2">
                {/* 客流趋势对比 */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      客流趋势对比
                    </CardTitle>
                    {maxVisitorData && (
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        峰值：{maxVisitorData.date} ({maxVisitorData.day}) - {maxVisitors.toLocaleString()} 人
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {visitorChartData.length > 0 ? (
                      <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={visitorChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              stroke="hsl(var(--foreground))"
                              tick={{ fill: 'hsl(var(--foreground))' }}
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
                            <Line 
                              type="monotone" 
                              dataKey="year2022" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              name="2022年"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="year2023" 
                              stroke="hsl(var(--warning))" 
                              strokeWidth={2}
                              name="2023年"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="total" 
                              stroke="hsl(var(--success))" 
                              strokeWidth={3}
                              name="总游客数"
                            />
                            {/* 标记最高点 */}
                            {maxVisitorData && (
                              <ReferenceDot
                                x={maxVisitorData.date}
                                y={maxVisitorData.total}
                                r={8}
                                fill="hsl(var(--warning))"
                                stroke="hsl(var(--warning))"
                                strokeWidth={2}
                              >
                                <Label
                                  value={`峰值: ${maxVisitors.toLocaleString()}`}
                                  position="top"
                                  fill="hsl(var(--foreground))"
                                  fontSize={12}
                                  fontWeight="bold"
                                />
                              </ReferenceDot>
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        所选日期范围内暂无数据
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 车流趋势对比 */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-gradient-to-r from-secondary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-secondary" />
                      停车场车流趋势对比
                    </CardTitle>
                    {maxParkingData && maxParking > 0 && (
                      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        峰值：{maxParkingData.date} ({maxParkingData.day}) - {maxParking.toLocaleString()} 辆
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {parkingChartData.length > 0 ? (
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={parkingChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              stroke="hsl(var(--foreground))"
                              tick={{ fill: 'hsl(var(--foreground))' }}
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
                            <Bar 
                              dataKey="guoyuan" 
                              fill="hsl(var(--primary))" 
                              name="果园停车场"
                            />
                            <Bar 
                              dataKey="yuelvwan" 
                              fill="hsl(var(--warning))" 
                              name="月亮湾停车场"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        所选日期范围内暂无数据
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 右侧：节假日选择器 */}
              <div className="space-y-6">
                {/* 法定节假日选择器 */}
                <HolidaySelector onSelectHoliday={handleSelectHoliday} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
