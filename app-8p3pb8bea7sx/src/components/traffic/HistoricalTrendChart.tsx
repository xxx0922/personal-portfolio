import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoricalTraffic } from '@/types/traffic';

interface HistoricalTrendChartProps {
  data: HistoricalTraffic[];
}

export function HistoricalTrendChart({ data }: HistoricalTrendChartProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // 获取所有可用年份（从 YYYY-MM-DD 字符串提取，避免时区导致年份错位）
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    data.forEach((item) => {
      const year = item.date.slice(0, 4);
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [data]);

  // 根据选择的年份过滤数据，并始终按日期升序排列
  const filteredData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    if (selectedYear === 'all') {
      return sorted;
    }
    return sorted.filter((item) => item.date.slice(0, 4) === selectedYear);
  }, [data, selectedYear]);

  // 准备图表数据
  const chartData = useMemo(() => {
    return filteredData.map((item) => ({
      date: item.date.replace(/-/g, '/'),
      fullDate: item.date,
      游客人数: item.actual_visitor_count || 0,
      果园停车: item.guoyuan_parking_count || 0,
      月亮湾停车: item.yuelvwan_parking_count || 0,
      总停车数: (item.guoyuan_parking_count || 0) + (item.yuelvwan_parking_count || 0),
      预报人数: item.forecast_visitors || 0,
    }));
  }, [filteredData]);

  // 计算统计数据
  const statistics = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgVisitors: 0,
        maxVisitors: 0,
        avgParking: 0,
        maxParking: 0,
      };
    }

    const visitors = chartData.map((d) => d.游客人数);
    const parking = chartData.map((d) => d.总停车数);

    return {
      avgVisitors: Math.round(visitors.reduce((a, b) => a + b, 0) / visitors.length),
      maxVisitors: Math.max(...visitors),
      avgParking: Math.round(parking.reduce((a, b) => a + b, 0) / parking.length),
      maxParking: Math.max(...parking),
    };
  }, [chartData]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <CardTitle>历史客流车流趋势</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择年份" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部年份</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            暂无数据
          </div>
        ) : (
          <>
            {/* 统计数据卡片 */}
            <div className="mb-6 grid gap-4 xl:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">平均游客人数</div>
                <div className="mt-1 text-2xl font-bold">{statistics.avgVisitors.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">峰值游客人数</div>
                <div className="mt-1 text-2xl font-bold">{statistics.maxVisitors.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">平均停车数量</div>
                <div className="mt-1 text-2xl font-bold">{statistics.avgParking.toLocaleString()}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">峰值停车数量</div>
                <div className="mt-1 text-2xl font-bold">{statistics.maxParking.toLocaleString()}</div>
              </div>
            </div>

            {/* 游客人数趋势图 */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold">游客人数趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 15, fontWeight: 600 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 15, fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="游客人数" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="预报人数" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 停车数量趋势图 */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">停车数量趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 15, fontWeight: 600 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 15, fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="果园停车" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="月亮湾停车" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="总停车数" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
