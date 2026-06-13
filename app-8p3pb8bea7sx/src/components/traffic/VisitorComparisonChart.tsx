import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HistoricalTraffic } from '@/types/traffic';
import { Users, TrendingUp, Check, Square } from 'lucide-react';

declare global {
  interface Window {
    echarts?: any;
  }
}

interface VisitorComparisonChartProps {
  historicalData: HistoricalTraffic[];
  currentCount: number;
}

const YEAR_CONFIGS = [
  { key: '2019年', field: 'year_2019', name: '2019年' },
  { key: '2020年', field: 'year_2020', name: '2020年' },
  { key: '2021年', field: 'year_2021', name: '2021年' },
  { key: '2022年', field: 'year_2022', name: '2022年' },
  { key: '2023年', field: 'year_2023', name: '2023年' },
  { key: '2024年', field: 'year_2024', name: '2024年' },
  { key: '2025年', field: 'year_2025', name: '2025年' },
  { key: '2026年', field: 'year_2026', name: '2026年' },
];

const RED = '#dc2626';
const YELLOW = '#fbbf24';

export function VisitorComparisonChart({ historicalData, currentCount }: VisitorComparisonChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<any>(null);
  const [echartsReady, setEchartsReady] = useState(false);

  const [visibleYears, setVisibleYears] = useState<Record<string, boolean>>(
    YEAR_CONFIGS.reduce((acc, config) => ({ ...acc, [config.key]: false }), {})
  );

  // 等待 echarts 加载
  useEffect(() => {
    const checkEcharts = () => {
      if (window.echarts) {
        setEchartsReady(true);
      } else {
        setTimeout(checkEcharts, 300);
      }
    };
    checkEcharts();
  }, []);

  // 只保留节假日数据
  const holidayData = useMemo(() => {
    return historicalData
      .filter((item) => item.festival && item.festival.trim() !== '')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [historicalData]);

  const peak = useMemo(
    () => (historicalData.length > 0 ? Math.max(...historicalData.map((d) => d.actual_visitor_count)) : 0),
    [historicalData]
  );

  const yearPeaks = useMemo(
    () =>
      YEAR_CONFIGS.map((config) => {
        const maxValue = Math.max(...historicalData.map((d) => (d as any)[config.field] || 0));
        return { ...config, maxValue };
      }).filter((item) => item.maxValue > 0),
    [historicalData]
  );

  const toggleYearVisibility = (yearKey: string) => {
    setVisibleYears((prev) => ({ ...prev, [yearKey]: !prev[yearKey] }));
  };

  // 初始化并更新图表
  useEffect(() => {
    if (!echartsReady || !chartRef.current || holidayData.length === 0) return;

    // 初始化图表（如果还没有）
    if (!chartInstance.current) {
      chartInstance.current = window.echarts.init(chartRef.current, 'dark', { renderer: 'canvas' });
      const handleResize = () => chartInstance.current?.resize();
      window.addEventListener('resize', handleResize);
    }

    const selectedSet = new Set(
      YEAR_CONFIGS.filter((c) => visibleYears[c.key]).map((c) => c.key)
    );

    const option = {
      backgroundColor: 'transparent',
      grid: { left: 50, right: 20, top: 30, bottom: 70 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const p = params[0];
          const d = p.data;
          let html = `<div style="font-weight:bold;margin-bottom:6px;font-size:14px">${d.fullDate} ${d.festival || ''} ${d.dayOfWeek || ''}</div>`;
          if (d.weather) {
            html += `<div style="color:#94a3b8;margin-bottom:4px">🌤️ 天气: ${d.weather}</div>`;
          }
          YEAR_CONFIGS.forEach((config) => {
            const val = d[config.field];
            if (val > 0) {
              const isSel = selectedSet.has(config.key);
              html += `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0">
                <span style="color:${isSel ? YELLOW : '#94a3b8'}">${isSel ? '●' : '○'} ${config.name}</span>
                <span style="font-weight:${isSel ? 'bold' : 'normal'};color:${isSel ? YELLOW : '#e2e8f0'}">${val.toLocaleString()}人</span>
              </div>`;
            }
          });
          html += `<div style="display:flex;justify-content:space-between;gap:16px;margin-top:4px;padding-top:4px;border-top:1px solid #334155">
            <span style="color:${RED};font-weight:bold">● 实际游客数</span>
            <span style="color:${RED};font-weight:bold">${d.actual.toLocaleString()}人</span>
          </div>`;
          return html;
        },
      },
      xAxis: {
        type: 'category',
        data: holidayData.map((d) => d.date.slice(5)),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94a3b8',
          rotate: -45,
          fontSize: 14,
          fontWeight: 'bold',
          interval: (index: number) => {
            if (index === 0) return true;
            return holidayData[index].festival !== holidayData[index - 1].festival;
          },
          formatter: (_: string, idx: number) => holidayData[idx].festival || '',
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
          type: 'bar',
          data: holidayData.map((item) => {
            const yearKey = `${item.date.split('-')[0]}年`;
            const isSelected = selectedSet.has(yearKey);
            return {
              value: item.actual_visitor_count,
              fullDate: item.date,
              festival: item.festival,
              dayOfWeek: item.day_of_week,
              weather: item.weather,
              actual: item.actual_visitor_count,
              yearKey,
              itemStyle: {
                color: isSelected ? YELLOW : RED,
                borderRadius: [3, 3, 0, 0],
              },
              ...YEAR_CONFIGS.reduce((acc, config) => {
                acc[config.field] = (item as any)[config.field] || 0;
                return acc;
              }, {} as any),
            };
          }),
          barWidth: selectedSet.size > 0 ? '50%' : '60%',
          label: {
            show: true,
            position: 'top',
            color: RED,
            fontSize: 15,
            fontWeight: 'bold',
            formatter: (p: any) =>
              p.value === peak && p.value > 0 ? peak.toLocaleString() : '',
          },
          animationDuration: 300,
          animationEasing: 'cubicOut',
        },
      ],
    };

    chartInstance.current.setOption(option, true);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [echartsReady, holidayData, visibleYears, peak]);

  if (holidayData.length === 0) {
    return (
      <Card className="border-2 shadow-xl">
        <CardContent className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">暂无节假日客流数据</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-transparent pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">客流趋势分析（2019-2026）</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">历年同期节假日客流数据对比</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">当前入园</span>
              </div>
              <span className="mt-1 text-2xl font-bold text-primary">{currentCount.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center rounded-xl border-2 border-danger/20 bg-danger/5 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-danger" />
                <span className="text-xs font-medium text-muted-foreground">历史峰值</span>
              </div>
              <span className="mt-1 text-2xl font-bold text-danger">{peak.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 年份峰值统计 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {yearPeaks.map((item) => (
            <Badge key={item.key} variant="outline" className="text-xs" style={{ borderColor: '#64748b', color: '#94a3b8' }}>
              {item.name}峰值: {item.maxValue.toLocaleString()}人
            </Badge>
          ))}
        </div>

        {/* 年份复选框 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {YEAR_CONFIGS.map((config) => (
            <Button
              key={config.key}
              variant="outline"
              size="sm"
              onClick={() => toggleYearVisibility(config.key)}
              className="h-8 gap-1.5 text-xs transition-all"
              style={{
                backgroundColor: visibleYears[config.key] ? YELLOW : '#1e293b',
                borderColor: visibleYears[config.key] ? YELLOW : '#334155',
                color: visibleYears[config.key] ? '#000' : '#94a3b8',
                opacity: visibleYears[config.key] ? 1 : 0.7,
              }}
            >
              {visibleYears[config.key] ? <Check className="h-3 w-3" /> : <Square className="h-3 w-3" />}
              {config.name}
            </Button>
          ))}
        </div>
        {!Object.values(visibleYears).some(Boolean) && (
          <p className="mt-2 text-xs text-muted-foreground">💡 请选择上方年份，图表将显示对应历年数据</p>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {!echartsReady ? (
          <div className="flex h-[500px] items-center justify-center text-muted-foreground">
            正在加载图表...
          </div>
        ) : (
          <div ref={chartRef} className="h-[500px] w-full" />
        )}
      </CardContent>
    </Card>
  );
}
