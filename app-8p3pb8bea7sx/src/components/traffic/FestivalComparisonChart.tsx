import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { HistoricalTraffic } from '@/types/traffic';
import { Calendar, Check, Square, PieChart as PieIcon } from 'lucide-react';

declare global {
  interface Window {
    echarts: any;
  }
}

interface FestivalComparisonChartProps {
  historicalData: HistoricalTraffic[];
}

const YEAR_CONFIGS = [
  { key: '2019', field: 'year_2019', name: '2019年', color: '#22d3ee' },  // 青色
  { key: '2020', field: 'year_2020', name: '2020年', color: '#a78bfa' },  // 紫色
  { key: '2021', field: 'year_2021', name: '2021年', color: '#f472b6' },  // 粉色
  { key: '2022', field: 'year_2022', name: '2022年', color: '#fbbf24' },  // 琥珀/黄色
  { key: '2023', field: 'year_2023', name: '2023年', color: '#34d399' },  // 翠绿色
  { key: '2024', field: 'year_2024', name: '2024年', color: '#60a5fa' },  // 亮蓝色
  { key: '2025', field: 'year_2025', name: '2025年', color: '#f87171' },  // 珊瑚红
  { key: '2026', field: 'year_2026', name: '2026年', color: '#fb923c' },  // 橙色
];

const FESTIVAL_MAP: Record<string, string> = {
  '春节': '春节',
  '劳动节': '五一',
  '五一': '五一',
  '国庆节': '国庆',
  '国庆': '国庆',
  '清明': '清明',
  '端午': '端午',
};

export function FestivalComparisonChart({ historicalData }: FestivalComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<any>(null);
  const [echartsReady, setEchartsReady] = useState(false);

  const [selectedFestival, setSelectedFestival] = useState<string>('春节');
  const [visibleYears, setVisibleYears] = useState<Record<string, boolean>>(
    YEAR_CONFIGS.reduce((acc, config) => ({ ...acc, [config.key]: true }), {})
  );

  // 提取所有可用的节日（去重）
  const availableFestivals = useMemo(() => {
    const festivals = new Set<string>();
    historicalData.forEach((item) => {
      if (item.festival && item.festival.trim()) {
        for (const [key, val] of Object.entries(FESTIVAL_MAP)) {
          if (item.festival.includes(key)) {
            festivals.add(val);
            break;
          }
        }
      }
    });
    return Array.from(festivals).sort();
  }, [historicalData]);

  // 根据选中的节日过滤数据
  const festivalData = useMemo(() => {
    if (!selectedFestival) return [];
    return historicalData
      .filter((item) => {
        if (!item.festival) return false;
        for (const [key, val] of Object.entries(FESTIVAL_MAP)) {
          if (val === selectedFestival && item.festival.includes(key)) return true;
        }
        return false;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [historicalData, selectedFestival]);

  // 节日天数标签：春节显示 除夕/初一/初二...，其它节日显示 第1天/第2天...
  const getFestivalDayLabel = (index: number) => {
    if (selectedFestival === '春节') {
      const labels = ['除夕', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八'];
      return labels[index] || `第${index + 1}天`;
    }
    if (selectedFestival === '五一') {
      return `五一第${index + 1}天`;
    }
    if (selectedFestival === '国庆') {
      return `国庆第${index + 1}天`;
    }
    return `第${index + 1}天`;
  };

  // 按年份分组，并给每个年份内的节日日期编号
  const yearDataMap = useMemo(() => {
    const map: Record<
      string,
      { year: string; items: HistoricalTraffic[] }
    > = {};

    festivalData.forEach((item) => {
      const year = item.date.split('-')[0];
      if (!map[year]) map[year] = { year, items: [] };
      map[year].items.push(item);
    });

    Object.values(map).forEach((group) => {
      group.items.sort((a, b) => a.date.localeCompare(b.date));
    });

    return map;
  }, [festivalData]);

  // 可见的年份配置
  const activeYearConfigs = useMemo(
    () => YEAR_CONFIGS.filter((c) => visibleYears[c.key]),
    [visibleYears]
  );

  // X轴数据：只生成已勾选年份对应的节日天
  const axisData = useMemo(() => {
    return activeYearConfigs.flatMap((config) => {
      const group = yearDataMap[config.key];
      if (!group) return [];
      return group.items.map((item, index) => ({
        key: `${config.key}-${index}`,
        year: config.key,
        yearName: config.name,
        date: item.date,
        dayLabel: getFestivalDayLabel(index),
        value: item.actual_visitor_count,
        color: config.color,
        item,
      }));
    });
  }, [activeYearConfigs, yearDataMap, selectedFestival]);

  const toggleYearVisibility = (yearKey: string) => {
    setVisibleYears((prev) => ({ ...prev, [yearKey]: !prev[yearKey] }));
  };

  // ========== 饼图数据：历年总客流占比 ==========
  const pieData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = [];
    YEAR_CONFIGS.forEach((config) => {
      const total = historicalData.reduce(
        (sum, item) => sum + ((item as any)[config.field] || 0),
        0
      );
      if (total > 0) {
        data.push({ name: config.name, value: total, color: config.color });
      }
    });
    return data;
  }, [historicalData]);

  // 等待 ECharts 脚本加载完成
  useEffect(() => {
    let timer: number | undefined;
    const checkEcharts = () => {
      if (window.echarts) {
        setEchartsReady(true);
      } else {
        timer = window.setTimeout(checkEcharts, 200);
      }
    };
    checkEcharts();
    return () => {
      if (timer) window.clearTimeout(timer);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  // 更新图表
  useEffect(() => {
    if (!echartsReady || !chartRef.current || !window.echarts) return;
    if (!chartInstance.current) {
      chartInstance.current = window.echarts.init(chartRef.current, 'dark', { renderer: 'canvas' });
      const handleResize = () => chartInstance.current?.resize();
      window.addEventListener('resize', handleResize);
    }

    // 未选节日：显示饼图（历年总客流占比）
    if (!selectedFestival) {
      const option = {
        backgroundColor: 'transparent',
        title: {
          text: '历年节假日总客流占比',
          left: 'center',
          top: 10,
          textStyle: { color: '#e2e8f0', fontSize: 16, fontWeight: 'bold' },
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: '#334155',
          textStyle: { color: '#e2e8f0' },
          formatter: (p: any) =>
            `<div style="font-weight:bold">${p.name}</div>
             <div style="color:${p.color}">客流: ${p.value.toLocaleString()}人</div>
             <div style="color:#94a3b8;font-size:11px">占比: ${p.percent}%</div>`,
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          top: 50,
          textStyle: { color: '#94a3b8' },
          icon: 'roundRect',
        },
        series: [
          {
            name: '历年客流',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '55%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: '#0f172a',
              borderWidth: 2,
            },
            label: {
              show: true,
              color: '#e2e8f0',
              formatter: (p: any) => `${p.name}\n${p.percent}%`,
            },
            emphasis: {
              label: { show: true, fontSize: 14, fontWeight: 'bold' },
              itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
            },
            data: pieData.map((d) => ({
              name: d.name,
              value: d.value,
              itemStyle: { color: d.color },
            })),
          },
        ],
      };
      chartInstance.current.setOption(option, true);
      return;
    }

    // 已选节日：显示柱状图
    if (axisData.length === 0 || activeYearConfigs.length === 0) {
      chartInstance.current.clear();
      return;
    }

    const option = {
      backgroundColor: 'transparent',
      grid: { left: 60, right: 30, top: 40, bottom: 90 },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0' },
        formatter: (p: any) => {
          const d = p.data;
          return `<div style="font-weight:bold;margin-bottom:6px;font-size:14px">${d.yearName} · ${d.dayLabel}</div>
            <div style="color:#94a3b8;margin-bottom:4px">${d.date} ${d.item?.day_of_week || ''}</div>
            <div style="color:${d.itemStyle.color};font-weight:bold">● 客流: ${d.value.toLocaleString()}人</div>`;
        },
      },
      legend: {
        data: activeYearConfigs.map((c) => c.name),
        textStyle: { color: '#94a3b8' },
        top: 0,
        icon: 'roundRect',
      },
      xAxis: {
        type: 'category',
        data: axisData.map((d) => d.key),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 13,
          fontWeight: 'bold',
          interval: 0,
          formatter: (_: string, idx: number) => {
            const d = axisData[idx];
            if (!d) return '';
            return `${d.yearName}\n${d.dayLabel}`;
          },
        },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 14,
          fontWeight: 'bold',
          formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
        },
      },
      series: [
        {
          name: '客流人数',
          type: 'bar',
          data: axisData.map((d) => ({
            value: d.value,
            yearName: d.yearName,
            dayLabel: d.dayLabel,
            date: d.date,
            item: d.item,
            itemStyle: {
              color: d.color,
              borderRadius: [3, 3, 0, 0],
            },
          })),
          barWidth: activeYearConfigs.length > 1 ? '45%' : '55%',
          label: {
            show: true,
            position: 'top',
            color: '#e2e8f0',
            fontSize: 13,
            fontWeight: 'bold',
            formatter: (p: any) => (p.value >= 1000 ? `${(p.value / 1000).toFixed(0)}k` : p.value),
          },
        },
      ],
    };

    chartInstance.current.setOption(option, true);
  }, [echartsReady, selectedFestival, axisData, activeYearConfigs, pieData]);

  // 统计信息
  const stats = useMemo(() => {
    if (festivalData.length === 0) return null;
    const visitors = festivalData.map((d) => d.actual_visitor_count);
    return {
      maxVisitors: Math.max(...visitors),
      avgVisitors: Math.round(visitors.reduce((a, b) => a + b, 0) / visitors.length),
      totalDays: festivalData.length,
      yearCount: Object.keys(yearDataMap).length,
    };
  }, [festivalData, yearDataMap]);

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-transparent pb-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">节假日客流对比分析（2019-2026年）</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                选择节日后，下方显示该节日历年每一天的客流对比柱状图；未选时显示历年客流占比饼图
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
                  {f === '五一' ? '五一劳动节' : f === '国庆' ? '十一国庆节' : f === '春节' ? '春节' : f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 年份复选框 — 只在选了节日后显示 */}
        {selectedFestival && (
          <div className="mt-4 flex flex-wrap gap-2">
            {YEAR_CONFIGS.map((config) => (
              <Button
                key={config.key}
                variant="outline"
                size="sm"
                onClick={() => toggleYearVisibility(config.key)}
                className="h-8 gap-1.5 text-xs transition-all"
                style={{
                  backgroundColor: visibleYears[config.key] ? config.color : '#1e293b',
                  borderColor: visibleYears[config.key] ? config.color : '#334155',
                  color: visibleYears[config.key] ? 'white' : '#94a3b8',
                  opacity: visibleYears[config.key] ? 1 : 0.7,
                }}
              >
                {visibleYears[config.key] ? <Check className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                {config.name}
              </Button>
            ))}
          </div>
        )}

        {/* 统计信息 — 只在选了节日后显示 */}
        {stats && (
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              { label: '最高单日客流', value: stats.maxVisitors, color: '#dc2626' },
              { label: '平均单日客流', value: stats.avgVisitors, color: '#3b82f6' },
              { label: '统计天数', value: stats.totalDays, color: '#10b981', suffix: '天' },
              { label: '统计年份数', value: stats.yearCount, color: '#f59e0b', suffix: '年' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border-2 p-3"
                style={{ borderColor: `${stat.color}30`, backgroundColor: `${stat.color}08` }}
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-xl font-bold" style={{ color: stat.color }}>
                  {stat.value.toLocaleString()}{stat.suffix || ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        <div className="relative">
          <div ref={chartRef} className="h-[450px] w-full" />
          {selectedFestival && activeYearConfigs.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <p>已选择「{selectedFestival}」</p>
              <p className="mt-2 text-sm opacity-60">请勾选上方至少一个年份（2019-2026），图表将显示对应历年数据</p>
            </div>
          )}
          {selectedFestival && activeYearConfigs.length > 0 && axisData.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">
              暂无{selectedFestival}的历年数据
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
