import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { HistoricalTraffic } from '@/types/traffic';
import { Bus } from 'lucide-react';

declare global {
  interface Window {
    echarts: any;
  }
}

interface FestivalShuttleComparisonChartProps {
  historicalData: HistoricalTraffic[];
}

const FESTIVAL_MAP: Record<string, string> = {
  '春节': '春节',
  '劳动节': '五一',
  '五一': '五一',
  '国庆节': '国庆',
  '国庆': '国庆',
  '清明': '清明',
  '端午': '端午',
};

function parseTimeToHour(time?: string | null): number | null {
  if (!time) return null;

  const trimmed = String(time).trim();
  if (!trimmed) return null;

  // 支持 HH:mm / HH:mm:ss
  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (timeMatch) {
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    if (!Number.isNaN(hour) && !Number.isNaN(minute)) {
      return hour + minute / 60;
    }
  }

  // 支持 ISO / 日期字符串
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    return date.getHours() + date.getMinutes() / 60;
  }

  return null;
}

function formatHour(hour: number | null): string {
  if (hour === null) return '--';
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getFestivalDayLabel(festival: string, index: number) {
  if (festival === '春节') {
    const labels = ['除夕', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八'];
    return labels[index] || `第${index + 1}天`;
  }
  if (festival === '五一') return `五一第${index + 1}天`;
  if (festival === '国庆') return `国庆第${index + 1}天`;
  return `第${index + 1}天`;
}

export function FestivalShuttleComparisonChart({ historicalData }: FestivalShuttleComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<any>(null);
  const [selectedFestival, setSelectedFestival] = useState<string>('');

  const availableFestivals = useMemo(() => {
    const festivals = new Set<string>();
    historicalData.forEach((item) => {
      if (!item.festival) return;
      for (const [key, val] of Object.entries(FESTIVAL_MAP)) {
        if (item.festival.includes(key)) {
          festivals.add(val);
          break;
        }
      }
    });
    return Array.from(festivals).sort();
  }, [historicalData]);

  useEffect(() => {
    if (!selectedFestival && availableFestivals.length > 0) {
      setSelectedFestival(availableFestivals.includes('春节') ? '春节' : availableFestivals[0]);
    }
  }, [availableFestivals, selectedFestival]);

  const festivalData = useMemo(() => {
    if (!selectedFestival) return [];
    return historicalData
      .filter((item) => {
        if (!item.festival) return false;
        return Object.entries(FESTIVAL_MAP).some(
          ([key, val]) => val === selectedFestival && item.festival?.includes(key)
        );
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [historicalData, selectedFestival]);

  const yearlySummary = useMemo(() => {
    const grouped: Record<string, HistoricalTraffic[]> = {};

    festivalData.forEach((item) => {
      const year = item.date.split('-')[0];
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(item);
    });

    return Object.entries(grouped)
      .map(([year, items]) => {
        const sortedItems = [...items].sort((a, b) => a.date.localeCompare(b.date));
        const events = sortedItems.map((item, dayIndex) => {
          const raw = item.yuelvwan_open_time;
          const hour = parseTimeToHour(raw);
          // 只统计早上启用时间：12:00 前
          if (hour === null || hour >= 12) return null;
          return {
            field: 'yuelvwan_open_time',
            label: '月亮湾启用',
            raw,
            hour,
            date: item.date,
            dayLabel: getFestivalDayLabel(selectedFestival, dayIndex),
            visitorCount: item.actual_visitor_count,
          };
        }).filter(Boolean) as Array<{
          field: string;
          label: string;
          raw: string;
          hour: number;
          date: string;
          dayLabel: string;
          visitorCount: number;
        }>;

        // 明细记录按日期展示，便于复盘
        const sortedEvents = [...events].sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.hour - b.hour;
        });

        // “最早月亮湾启用”按时间最早统计，而不是按日期第一天统计
        const earliestEvent = [...events].sort((a, b) => {
          if (a.hour !== b.hour) return a.hour - b.hour;
          return a.date.localeCompare(b.date);
        })[0];

        const peakVisitors = Math.max(...sortedItems.map((i) => i.actual_visitor_count || 0));
        const avgVisitors = Math.round(
          sortedItems.reduce((sum, item) => sum + (item.actual_visitor_count || 0), 0) / sortedItems.length
        );

        return {
          year,
          started: Boolean(earliestEvent),
          startHour: earliestEvent?.hour ?? null,
          startTime: earliestEvent ? formatHour(earliestEvent.hour) : '--',
          startDate: earliestEvent?.date ?? '--',
          startDayLabel: earliestEvent?.dayLabel ?? '--',
          startPoint: earliestEvent?.label ?? '未启动',
          visitorCount: earliestEvent?.visitorCount ?? 0,
          events: sortedEvents,
          peakVisitors,
          avgVisitors,
          days: sortedItems.length,
        };
      })
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [festivalData, selectedFestival]);

  const stats = useMemo(() => {
    const started = yearlySummary.filter((item) => item.started);
    // 顶部“最早/最晚启动”按所有早上月亮湾启用记录统计，而不是只按每年第一条记录统计
    const allEventHours = yearlySummary
      .flatMap((item) => item.events)
      .map((event) => event.hour)
      .filter((v): v is number => v !== null && v !== undefined);

    return {
      totalYears: yearlySummary.length,
      startedYears: started.length,
      earliest: allEventHours.length ? Math.min(...allEventHours) : null,
      latest: allEventHours.length ? Math.max(...allEventHours) : null,
    };
  }, [yearlySummary]);

  useEffect(() => {
    if (!chartRef.current || !window.echarts) return;

    if (!chartInstance.current) {
      chartInstance.current = window.echarts.init(chartRef.current, 'dark', { renderer: 'canvas' });
    }

    if (yearlySummary.length === 0) {
      chartInstance.current.clear();
      return;
    }

    const option = {
      backgroundColor: 'transparent',
      grid: { left: 60, right: 40, top: 35, bottom: 65 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const idx = params[0].dataIndex;
          const item = yearlySummary[idx];
          const eventsHtml = item.events.length
            ? item.events.map((event: any) => `
              <div style="margin:4px 0;padding:4px 6px;border-left:3px solid #fbbf24;background:rgba(251,191,36,0.08)">
                <div style="color:#fbbf24;font-weight:bold">${event.label}：${formatHour(event.hour)}</div>
                <div style="font-size:11px;color:#94a3b8">${event.date} ${event.dayLabel} · 客流 ${event.visitorCount.toLocaleString()}人</div>
              </div>
            `).join('')
            : '<div style="color:#94a3b8;margin-top:4px">暂无短驳相关记录</div>';

          return `
            <div style="font-weight:bold;margin-bottom:6px;font-size:14px">${selectedFestival} · ${item.year}年</div>
            <div style="color:${item.started ? '#fbbf24' : '#94a3b8'};margin:2px 0">● 短驳状态: ${item.started ? `已启动（${item.events.length}条记录）` : '未启动'}</div>
            <div style="margin-top:6px;font-weight:bold;color:#e2e8f0">全部短驳相关记录：</div>
            ${eventsHtml}
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: yearlySummary.map((item) => `${item.year}年`),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold' },
      },
      yAxis: {
        type: 'value',
        min: 6,
        max: 12,
        interval: 1,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 13,
          formatter: (v: number) => `${String(v).padStart(2, '0')}:00`,
        },
      },
      series: [
        {
          name: '短驳启动时间',
          type: 'bar',
          data: yearlySummary.map((item) => ({
            value: item.started ? item.startHour : 6,
            itemStyle: {
              color: item.started ? '#fbbf24' : '#334155',
              borderRadius: [5, 5, 0, 0],
            },
          })),
          barWidth: '45%',
          label: {
            show: true,
            position: 'top',
            color: '#e2e8f0',
            fontSize: 13,
            fontWeight: 'bold',
            formatter: (p: any) => {
              const item = yearlySummary[p.dataIndex];
              return item.started ? item.startTime : '未启动';
            },
          },
        },
      ],
    };

    chartInstance.current.setOption(option, true);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [yearlySummary, selectedFestival]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-transparent pb-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">节假日启动短驳对比分析</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                按节日查看历年早上月亮湾启用短驳时间，并罗列全部早上启用记录
              </p>
            </div>
          </div>

          <Select value={selectedFestival} onValueChange={setSelectedFestival}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="选择节日" />
            </SelectTrigger>
            <SelectContent>
              {availableFestivals.map((f) => (
                <SelectItem key={f} value={f}>
                  {f === '五一' ? '五一劳动节' : f === '国庆' ? '十一国庆节' : f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-400">启动年份</p>
            <p className="mt-1 text-xl font-bold text-amber-400">{stats.startedYears}/{stats.totalYears}年</p>
          </div>
          <div className="rounded-xl border-2 border-blue-500/30 bg-blue-500/10 p-3">
            <p className="text-xs text-blue-400">最早启动</p>
            <p className="mt-1 text-xl font-bold text-blue-400">{formatHour(stats.earliest)}</p>
          </div>
          <div className="rounded-xl border-2 border-purple-500/30 bg-purple-500/10 p-3">
            <p className="text-xs text-purple-400">最晚启动</p>
            <p className="mt-1 text-xl font-bold text-purple-400">{formatHour(stats.latest)}</p>
          </div>
          <div className="rounded-xl border-2 border-slate-500/30 bg-slate-500/10 p-3">
            <p className="text-xs text-slate-400">分析节日</p>
            <p className="mt-1 text-xl font-bold text-slate-200">{selectedFestival || '--'}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        <div ref={chartRef} className="h-[360px] w-full" />

        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-base">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-4 text-left text-base font-bold">年份</th>
                <th className="px-4 py-4 text-left text-base font-bold">是否启动</th>
                <th className="px-4 py-4 text-left text-base font-bold">最早月亮湾启用</th>
                <th className="px-4 py-4 text-left text-base font-bold">首次月亮湾启用</th>
                <th className="px-4 py-4 text-left text-base font-bold">月亮湾启用记录</th>
                <th className="px-4 py-4 text-right text-base font-bold">记录数</th>
              </tr>
            </thead>
            <tbody>
              {yearlySummary.map((item) => (
                <tr key={item.year} className="border-t border-slate-800">
                  <td className="px-4 py-4 text-lg font-bold text-white">{item.year}年</td>
                  <td className="px-4 py-3">
                    <Badge className={item.started ? 'bg-amber-500 px-3 py-1 text-sm font-bold text-black' : 'bg-slate-700 px-3 py-1 text-sm font-bold text-slate-300'}>
                      {item.started ? '已启动' : '未启动'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 font-mono text-xl font-bold text-amber-300">
                    {item.started ? item.startTime : '--'}
                  </td>
                  <td className="px-4 py-3">
                    {item.started ? (
                      <div className="space-y-1">
                        <div className="font-mono text-lg font-bold text-amber-300">{item.startTime}</div>
                        <div className="text-sm text-slate-400">{item.startDate} {item.startDayLabel}</div>
                        <div className="text-sm text-slate-300">{item.startPoint}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.events.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {item.events.map((event: any, idx: number) => (
                          <div
                            key={`${event.date}-${event.field}-${idx}`}
                            className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                          >
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="font-semibold text-amber-300">{event.label}</span>
                              <span className="font-mono text-base font-semibold text-white">{formatHour(event.hour)}</span>
                              <span className="text-sm text-slate-400">{event.date} {event.dayLabel}</span>
                              <span className="text-sm text-blue-300">客流 {event.visitorCount.toLocaleString()}人</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">暂无记录</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-lg font-bold text-amber-300">
                    {item.events.length}条
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
