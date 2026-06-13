import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Cloud,
  Users,
  Car,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  Download,
  RefreshCw,
  Settings,
  History,
  Upload,
  Shield,
  Plus
} from 'lucide-react';
import { Link } from 'react-router';
import {
  getParkingLots,
  getRoadTraffic,
  getVisitorCount,
  getHistoricalTraffic,
  getAlertConfig,
  getTrafficControlMeasures,
  getWeatherData,
  getShuttleControlPoints,
  updateShuttleControlPoint,
  getReservationVisitors,
} from '@/db/api';
import type {
  ParkingLot,
  RoadTraffic,
  VisitorCount,
  HistoricalTraffic,
  AlertConfig,
  TrafficControlMeasure,
  WeatherData,
  ShuttleControlPoint,
  AlertLevel,
  AlertStatus,
  ReservationVisitors,
} from '@/types/traffic';
import { ParkingChart } from '@/components/traffic/ParkingChart';
import { VisitorComparisonChart } from '@/components/traffic/VisitorComparisonChart';
import { FestivalComparisonChart } from '@/components/traffic/FestivalComparisonChart';
import { FestivalShuttleComparisonChart } from '@/components/traffic/FestivalShuttleComparisonChart';
import { ControlPanel } from '@/components/traffic/ControlPanel';
import { HistoricalTrendChart } from '@/components/traffic/HistoricalTrendChart';
import { SimpleMap } from '@/components/ui/simplemap';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import HolidaySelector from '@/components/HolidaySelector';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Dashboard() {
  const { profile } = useAuth();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [roadTraffic, setRoadTraffic] = useState<RoadTraffic[]>([]);
  const [visitorCount, setVisitorCount] = useState<VisitorCount | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalTraffic[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig[]>([]);
  const [controlMeasures, setControlMeasures] = useState<TrafficControlMeasure[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [shuttleMode, setShuttleMode] = useState(() => {
    // 从 localStorage 恢复短驳模式状态，避免刷新丢失
    try {
      return localStorage.getItem('shuttleMode') === 'true';
    } catch {
      return false;
    }
  });
  const [shuttleControlPoints, setShuttleControlPoints] = useState<ShuttleControlPoint[]>([]);
  const [reservationVisitors, setReservationVisitors] = useState<ReservationVisitors | null>(null);
  const [showShuttleDialog, setShowShuttleDialog] = useState(false);
  const [pendingShuttleAction, setPendingShuttleAction] = useState<'start' | 'stop' | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [webhookConfigs, setWebhookConfigs] = useState<{ id: string; name: string; webhook_url: string; enabled: boolean; message_template: string }[]>([]);

  // 通过本地后端代理发送 Webhook（绕过浏览器 CORS 限制）
  const PROXY_BASE_URL = 'http://localhost:3002';
  const renderWebhookTemplate = (template: string, templateData: Record<string, string>) => {
    let message = template;
    Object.entries(templateData).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return message;
  };

  const sendWebhookDirectly = async (fallbackMessage: string, templateData?: Record<string, string>) => {
    const enabledConfigs = webhookConfigs.filter(c => c.enabled);
    if (enabledConfigs.length === 0) {
      toast.warning('没有启用的 Webhook 配置');
      return { sent: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      enabledConfigs.map(async (config) => {
        const message = config.message_template && templateData
          ? renderWebhookTemplate(config.message_template, templateData)
          : fallbackMessage;

        let payload;
        if (config.webhook_url.includes('qyapi.weixin.qq.com')) {
          // 企业微信机器人
          payload = { msgtype: 'text', text: { content: message, mentioned_list: ['@all'] } };
        } else if (config.webhook_url.includes('oapi.dingtalk.com')) {
          // 钉钉机器人
          payload = { msgtype: 'text', text: { content: message }, at: { isAtAll: true } };
        } else if (config.webhook_url.includes('open.feishu.cn') || config.webhook_url.includes('open.larksuite.com')) {
          // 飞书 / Lark 群机器人
          payload = { msg_type: 'text', content: { text: message } };
        } else {
          payload = { text: message, msgtype: 'text' };
        }

        // 通过本地后端代理发送，绕过浏览器 CORS
        const proxyRes = await fetch(`${PROXY_BASE_URL}/api/webhook/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: config.webhook_url, payload }),
        });

        const proxyData = await proxyRes.json();
        if (!proxyRes.ok || !proxyData.success) {
          throw new Error(`${config.name}: ${proxyData.error || proxyData.status || '未知错误'}`);
        }
        return config.name;
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    if (successCount > 0) {
      toast.success('Webhook 通知已发送', {
        description: `成功 ${successCount} 个${failedCount > 0 ? `，失败 ${failedCount} 个` : ''}`
      });
    } else {
      toast.error('Webhook 通知发送失败', {
        description: '所有配置均发送失败，请检查网络或 Webhook 地址'
      });
    }
    return { sent: successCount, failed: failedCount };
  };

  // 加载所有数据
  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const [
        parkingData,
        roadData,
        visitorData,
        historicalDataResult,
        alertConfigData,
        controlMeasuresData,
        weather,
        shuttlePoints,
        reservationData,
        webhookData,
      ] = await Promise.allSettled([
        getParkingLots(),
        getRoadTraffic(),
        getVisitorCount(),
        getHistoricalTraffic(),
        getAlertConfig(),
        getTrafficControlMeasures(),
        getWeatherData('无锡市滨湖区马山'),
        getShuttleControlPoints(),
        getReservationVisitors(today),
        supabase.from('webhook_config').select('*').eq('enabled', true),
      ]);

      const simulatorEnabled = localStorage.getItem('simulatorEnabled') !== 'false';

      if (parkingData.status === 'fulfilled') {
        setParkingLots(
          simulatorEnabled
            ? parkingData.value
            : parkingData.value.map((lot) => ({
                ...lot,
                occupied_spaces: 0,
                is_full: false,
              }))
        );
      }
      if (roadData.status === 'fulfilled') {
        setRoadTraffic(
          simulatorEnabled
            ? roadData.value
            : roadData.value.map((road) => ({
                ...road,
                traffic_density: 0,
                status: 'normal' as const,
                control_start_time: null,
                control_end_time: null,
              }))
        );
      }
      if (visitorData.status === 'fulfilled') {
        setVisitorCount(
          simulatorEnabled
            ? visitorData.value
            : visitorData.value
              ? { ...visitorData.value, current_count: 0 }
              : visitorData.value
        );
      }
      if (historicalDataResult.status === 'fulfilled') setHistoricalData(historicalDataResult.value);
      if (alertConfigData.status === 'fulfilled') setAlertConfig(alertConfigData.value);
      if (controlMeasuresData.status === 'fulfilled') setControlMeasures(controlMeasuresData.value);
      if (weather.status === 'fulfilled') setWeatherData(weather.value);
      if (shuttlePoints.status === 'fulfilled') {
        setShuttleControlPoints(
          shuttlePoints.value.map((point) => ({
            ...point,
            point_name: normalizeControlPointName(point.point_name),
          }))
        );
      }
      if (reservationData.status === 'fulfilled') setReservationVisitors(reservationData.value);
      if (webhookData.status === 'fulfilled' && webhookData.value.data && !webhookData.value.error) {
        setWebhookConfigs(webhookData.value.data);
      }
      setLastUpdate(new Date());
      
      // 显示刷新成功提示
      toast.success('数据已更新', {
        description: `更新时间：${new Date().toLocaleTimeString('zh-CN')}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 抓取入园人数
  useEffect(() => {
    loadData();

    // 每3分钟自动刷新一次
    const interval = setInterval(() => {
      loadData();
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 计算预警状态
  const calculateAlertStatus = (
    current: number,
    total: number,
    type: string
  ): AlertStatus => {
    const percentage = (current / total) * 100;
    const config = alertConfig.find((c) => c.alert_type === type);
    
    if (!config) {
      return { level: 'success', message: '正常', percentage };
    }

    if (percentage >= config.red_threshold) {
      return { level: 'danger', message: '严重拥堵', percentage };
    }
    if (percentage >= config.yellow_threshold) {
      return { level: 'warning', message: '轻度拥堵', percentage };
    }
    return { level: 'success', message: '畅通', percentage };
  };

  // 获取历史峰值
  const getHistoricalPeak = (): number => {
    if (historicalData.length === 0) return 0;
    return Math.max(...historicalData.map((d) => d.actual_visitor_count));
  };

  // 计算访客预警状态
  const visitorAlertStatus = (): AlertStatus => {
    const peak = getHistoricalPeak();
    if (!visitorCount || peak === 0) {
      return { level: 'success', message: '正常', percentage: 0 };
    }
    return calculateAlertStatus(visitorCount.current_count, peak, 'visitor');
  };

  const normalizeControlPointName = (name: string) => {
    const compactName = name.replace(/\s+/g, '').trim();

    // 兼容数据库中残留的「千波桥 前波桥 / 千波桥前波桥 / 前波桥」等脏数据
    if (compactName.includes('千波') || compactName.includes('前波')) {
      return '千波桥';
    }

    return compactName;
  };

  // 切换管控点位状态
  const handleToggleControlPoint = async (point: ShuttleControlPoint) => {
    try {
      const newControlState = !point.is_controlled;
      const controlStartTime = newControlState ? new Date().toISOString() : null;
      const controlEndTime = !newControlState ? new Date().toISOString() : null;

      await updateShuttleControlPoint(
        point.id,
        newControlState,
        controlStartTime,
        controlEndTime
      );

      const pointName = normalizeControlPointName(point.point_name);
      toast.success(newControlState ? `${pointName}已启动管控` : `${pointName}已解除管控`);
      loadData();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  // 处理节假日选择
  const handleSelectHoliday = (startDate: Date, endDate: Date, holidayName: string) => {
    setSelectedDate(startDate);
    toast.success(`已选择${holidayName}，日期范围：${format(startDate, 'yyyy-MM-dd', { locale: zhCN })} 至 ${format(endDate, 'yyyy-MM-dd', { locale: zhCN })}`);
  };

  const getAlertColor = (level: AlertLevel): string => {
    switch (level) {
      case 'success':
        return 'bg-success text-success-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'danger':
        return 'bg-danger text-danger-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // 生成报告
  const generateReport = () => {
    const reportContent = `
无锡灵山景区交通监控报告
生成时间: ${new Date().toLocaleString('zh-CN')}

一、实时数据概览
1. 当前入园人数: ${visitorCount?.current_count || 0}人
2. 历史峰值: ${getHistoricalPeak()}人
3. 当前天气: ${weatherData?.now.weather || '未知'} ${weatherData?.now.temp || '--'}℃

二、停车场状态
${parkingLots.map((lot) => {
  const status = calculateAlertStatus(lot.occupied_spaces, lot.total_spaces, 'parking');
  return `- ${lot.name}: ${lot.occupied_spaces}/${lot.total_spaces} (${status.percentage.toFixed(1)}%) - ${status.message}`;
}).join('\n')}

三、道路交通状态
${roadTraffic.map((road) => `- ${road.road_name}: ${road.status === 'normal' ? '畅通' : road.status === 'busy' ? '繁忙' : '拥堵'} (密度: ${road.traffic_density}%)`).join('\n')}

四、交通管制措施
${controlMeasures.map((measure) => `- ${measure.measure_name}: ${measure.status === 'active' ? '已启用' : '未启用'}`).join('\n')}

五、预警建议
访客预警: ${visitorAlertStatus().message}
建议: ${visitorAlertStatus().level === 'danger' ? '建议启动全面交通管制措施' : visitorAlertStatus().level === 'warning' ? '建议启动部分交通管制措施' : '当前交通状况良好，保持监控'}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `灵山景区交通报告_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('报告已生成并下载');
  };

  const visitorAlert = visitorAlertStatus();

  return (
    <div className={`min-h-screen p-4 xl:p-8 ${shuttleMode ? 'bg-red-50 dark:bg-red-950' : 'bg-background'}`}>
      {/* 全局加载状态指示器 */}
      {loading && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform">
          <div className="flex items-center gap-3 rounded-full border-2 border-primary bg-background/95 px-6 py-3 shadow-xl backdrop-blur-sm">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground">正在加载数据...</span>
          </div>
        </div>
      )}
      
      <div className="mx-auto max-w-[1600px] space-y-8">
        {/* 顶部标题栏 - 优化版 */}
        <div className="relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-8 shadow-xl backdrop-blur-sm">
          {/* 装饰性背景 */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-secondary/5 blur-3xl" />
          
          <div className="relative flex flex-col gap-6">
            {/* 顶部：标题 */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm">
                <svg className="h-14 w-14 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-center text-5xl font-bold text-foreground xl:text-6xl">
                无锡灵山景区交通监控仪表盘
              </h1>
            </div>

            {/* 底部：日期、天气、更新时间、刷新、主题切换、管理员入口 */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-4 py-2.5 backdrop-blur-sm">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-base font-semibold">
                  {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })}
                </span>
                <span className="text-base text-muted-foreground">
                  {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date().getDay()]}
                </span>
              </div>
              
              {weatherData && (
                <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-4 py-2.5 backdrop-blur-sm">
                  <Cloud className="h-5 w-5 text-primary" />
                  <span className="text-base font-semibold">无锡市滨湖区马山</span>
                  <span className="text-base font-semibold">{weatherData.now.weather}</span>
                  <span className="text-base text-muted-foreground">{weatherData.now.temp}°C</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 rounded-lg border bg-card/80 px-4 py-2.5 backdrop-blur-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-base text-muted-foreground">
                  更新于 {lastUpdate.toLocaleTimeString('zh-CN')}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
                className="h-10 rounded-lg text-base font-semibold backdrop-blur-sm transition-all hover:shadow-md"
              >
                <RefreshCw className={`mr-2 h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '刷新中...' : '刷新数据'}
              </Button>
              
              <Button
                variant="default"
                size="sm"
                asChild
                className="h-10 rounded-lg text-base font-semibold backdrop-blur-sm transition-all hover:shadow-md"
              >
                <Link to="/admin">
                  <Shield className="mr-2 h-5 w-5" />
                  管理后台
                </Link>
              </Button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* 启动短驳按钮 - 占据整行 */}
        <div className="w-full">
          <Button
            variant={shuttleMode ? 'destructive' : 'default'}
            size="lg"
            onClick={() => {
              setPendingShuttleAction(shuttleMode ? 'stop' : 'start');
              setShowShuttleDialog(true);
            }}
            className="h-16 w-full rounded-xl text-2xl font-bold shadow-lg transition-all hover:shadow-xl"
          >
            {shuttleMode ? (
              <>
                <span className="mr-2">🔌</span>
                关闭短驳车服务
              </>
            ) : (
              <>
                <span className="mr-2">🚐</span>
                开启短驳车服务
              </>
            )}
          </Button>
        </div>

        {/* 确认弹窗 */}
        <AlertDialog open={showShuttleDialog} onOpenChange={setShowShuttleDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingShuttleAction === 'start' ? '确认开启短驳车服务' : '确认关闭短驳车服务'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingShuttleAction === 'start' ? (
                  <>
                    开启短驳车服务后，系统将：
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>向所有配置的企业群发送通知</li>
                      <li>显示短驳管控点位面板</li>
                      <li>记录启动时间和当前交通状况</li>
                    </ul>
                    <p className="mt-3 font-semibold text-warning">
                      请确认是否开启短驳车服务？
                    </p>
                  </>
                ) : (
                  <>
                    关闭短驳车服务后，系统将：
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>向所有配置的企业群发送结束通知</li>
                      <li>隐藏短驳管控点位面板</li>
                      <li>记录结束时间</li>
                    </ul>
                    <p className="mt-3 font-semibold text-danger">
                      请确认是否关闭短驳车服务？
                    </p>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  const newShuttleMode = pendingShuttleAction === 'start';
                  setShuttleMode(newShuttleMode);
                  localStorage.setItem('shuttleMode', String(newShuttleMode));

                  if (newShuttleMode) {
                    // 启动短驳模式
                    toast.success('短驳车服务已开启');

                    // 发送Webhook通知
                    const currentTime = new Date().toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    });
                    const guoyuanParking = parkingLots.find(p => p.name === '景区停车场' || p.name === '果园停车场');
                    const yuewanwanParking = parkingLots.find(p => p.name === '月亮湾停车场');
                    const templateData = {
                      time: currentTime,
                      visitor_count: String(visitorCount?.current_count || 0),
                      guoyuan_parking: `${guoyuanParking?.occupied_spaces || 0}/${guoyuanParking?.total_spaces || 0}`,
                      yuewanwan_parking: `${yuewanwanParking?.occupied_spaces || 0}/${yuewanwanParking?.total_spaces || 0}`
                    };
                    const fallbackMsg = `【紧急通知】无锡灵山景区启动短驳车辆调度\n\n启动时间: ${templateData.time}\n当前入园人数: ${templateData.visitor_count}人\n果园停车场: ${templateData.guoyuan_parking}\n月亮湾停车场: ${templateData.yuewanwan_parking}\n\n请相关人员立即到岗，执行短驳车辆调度任务！`;

                    // 直接使用本地后端代理发送，避免 Supabase Edge Function CORS 报错
                    await sendWebhookDirectly(fallbackMsg, templateData);
                  } else {
                    // 关闭短驳模式
                    toast.success('短驳车服务已关闭');

                    // 发送关闭通知
                    const closeTime = new Date().toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    });
                    const closeMsg = `【通知】无锡灵山景区短驳车辆调度已结束\n\n结束时间: ${closeTime}\n\n感谢各位工作人员的辛勤付出！`;

                    // 直接使用本地后端代理发送，避免 Supabase Edge Function CORS 报错
                    await sendWebhookDirectly(closeMsg);
                  }
                }}
                className={cn(
                  "rounded-lg",
                  pendingShuttleAction === 'stop' && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}
              >
                {pendingShuttleAction === 'start' ? '确认开启' : '确认关闭'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 短驳管控点位 - 启动后显示 */}
        {shuttleMode && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-300">
                短驳管控点位
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {shuttleControlPoints.length === 0 ? (
                  <div className="col-span-full rounded-xl border-2 border-dashed border-red-300 bg-white/50 p-8 text-center dark:border-red-700 dark:bg-red-900/20">
                    <MapPin className="mx-auto mb-3 h-10 w-10 text-red-400" />
                    <p className="text-lg font-semibold text-red-800 dark:text-red-200">
                      暂无短驳管控点位
                    </p>
                    <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                      数据库中尚未配置短驳管控点位，点击下方按钮一键初始化。
                    </p>
                    <Button
                      variant="default"
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                      onClick={async () => {
                        try {
                          const defaultPoints = [
                            { point_name: '高速口', is_controlled: false },
                            { point_name: '千波桥', is_controlled: false },
                            { point_name: '灵湖大桥', is_controlled: false },
                            { point_name: '七里风光堤', is_controlled: false },
                            { point_name: '灵湖路', is_controlled: false },
                            { point_name: '西村路口', is_controlled: false },
                          ];
                          const { error } = await supabase
                            .from('shuttle_control_points')
                            .insert(defaultPoints);
                          if (error) throw error;
                          toast.success('默认点位已初始化');
                          loadData();
                        } catch (err) {
                          console.error('初始化点位失败:', err);
                          toast.error('初始化失败', {
                            description: err instanceof Error ? err.message : '请检查权限'
                          });
                        }
                      }}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      一键初始化默认点位
                    </Button>
                  </div>
                ) : (
                  shuttleControlPoints.map((point) => (
                    <Card
                      key={point.id}
                      className="border-2 border-red-300 bg-white dark:border-red-700 dark:bg-red-900"
                    >
                      <CardContent className="space-y-4 p-5">
                        {/* 顶部：地点名称和状态 */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400" />
                            <span className="text-xl font-bold text-red-900 dark:text-red-100">
                              {normalizeControlPointName(point.point_name)}
                            </span>
                          </div>
                          <Badge
                            className={
                              point.is_controlled
                                ? 'shrink-0 bg-red-600 px-3 py-1 text-base font-bold text-white'
                                : 'shrink-0 bg-gray-400 px-3 py-1 text-base font-bold text-white'
                            }
                          >
                            {point.is_controlled ? '管控中' : '未管控'}
                          </Badge>
                        </div>

                        {/* 中间：时间信息 */}
                        <div className="min-h-[20px]">
                          {point.is_controlled && point.control_start_time && (
                            <div className="text-base font-semibold text-red-700 dark:text-red-300">
                              管控时间: {new Date(point.control_start_time).toLocaleTimeString('zh-CN')}
                            </div>
                          )}

                          {!point.is_controlled && point.control_end_time && (
                            <div className="text-base font-semibold text-gray-600 dark:text-gray-400">
                              上次解除: {new Date(point.control_end_time).toLocaleTimeString('zh-CN')}
                            </div>
                          )}
                        </div>

                        {/* 底部：操作按钮 */}
                        <Button
                          size="sm"
                          variant={point.is_controlled ? 'outline' : 'default'}
                          onClick={() => handleToggleControlPoint(point)}
                          className="h-11 w-full rounded-lg text-base font-bold shadow-sm transition-all hover:shadow-md"
                        >
                          {point.is_controlled ? (
                            <>
                              <span className="mr-1">🔓</span>
                              解除管控
                            </>
                          ) : (
                            <>
                              <span className="mr-1">🔒</span>
                              启动管控
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 实时数据概览 - 区域标题 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-lingshan-green to-lingshan-blue" />
          <h2 className="text-2xl font-bold text-foreground">📊 实时数据概览</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        {/* 实时数据概览卡片 */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* 当日预约游客 */}
          <Card className="group overflow-hidden border-2 border-blue-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 shadow-xl transition-all hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-bold text-blue-100">当日预约游客</CardTitle>
                <p className="mt-1 text-sm text-slate-400">预约入园统计</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 shadow-inner transition-transform group-hover:scale-110">
                <Users className="h-7 w-7 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black leading-none text-blue-400">
                  {reservationVisitors?.reserved_count?.toLocaleString() || 0}
                </span>
                <span className="pb-2 text-base font-semibold text-slate-400">人</span>
              </div>
              <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
                <p className="text-base font-semibold text-blue-100">
                  📅 {reservationVisitors ? '已录入预约数据' : '暂无预约数据'}
                </p>
                {reservationVisitors?.notes && (
                  <p className="mt-1 text-sm text-slate-400">备注: {reservationVisitors.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 当前入园人数 */}
          <Card className="group overflow-hidden border-2 border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 shadow-xl transition-all hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-bold text-emerald-100">当前入园人数</CardTitle>
                <p className="mt-1 text-sm text-slate-400">实时客流监测</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 shadow-inner transition-transform group-hover:scale-110">
                <Users className="h-7 w-7 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black leading-none text-emerald-400">
                  {visitorCount?.current_count?.toLocaleString() || 0}
                </span>
                <span className="pb-2 text-base font-semibold text-slate-400">人</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "text-base font-bold",
                      visitorAlert.level === 'danger' && 'bg-danger text-danger-foreground',
                      visitorAlert.level === 'warning' && 'bg-warning text-warning-foreground',
                      visitorAlert.level === 'success' && 'bg-success text-success-foreground'
                    )}
                  >
                    {visitorAlert.message}
                  </Badge>
                  <span className="text-sm text-slate-400">峰值 {getHistoricalPeak().toLocaleString()}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="mt-3 h-10 w-full rounded-lg text-base font-semibold shadow-sm transition-all hover:shadow-md">
                <a href="http://dp.lingshan.org:8505/dp/login.html" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center" title="用户名: ls | 密码: q9vik7mf2l">
                  <Download className="mr-2 h-4 w-4" />
                  查看客流数据来源
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* 景区停车场 */}
          <Card className="group overflow-hidden border-2 border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 shadow-xl transition-all hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-lg font-bold text-amber-100">景区停车场</CardTitle>
                <p className="mt-1 text-sm text-slate-400">主停车场车位状态</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 shadow-inner transition-transform group-hover:scale-110">
                <Car className="h-7 w-7 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const scenicParking = parkingLots.find((lot) => lot.name === '景区停车场');
                const occupied = scenicParking?.occupied_spaces || 0;
                const total = scenicParking?.total_spaces || 2400;
                const percentage = total > 0 ? Math.min((occupied / total) * 100, 100) : 0;

                return (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-black leading-none text-amber-400">{occupied.toLocaleString()}</span>
                      <span className="pb-2 text-3xl font-bold text-slate-500">/ {total.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </>
                );
              })()}
              <Button variant="outline" size="sm" asChild className="mt-3 h-10 w-full rounded-lg text-base font-semibold shadow-sm transition-all hover:shadow-md">
                <a href="https://yun.jslife.com.cn/jportal/index.html#/login" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Download className="mr-2 h-4 w-4" />
                  查看停车数据来源
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 历年客流对比分析 - 区域标题 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-lingshan-green to-lingshan-blue" />
          <h2 className="text-2xl font-bold text-foreground">📈 历年客流对比分析（2019-2026年）</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        
        <VisitorComparisonChart 
          historicalData={historicalData} 
          currentCount={visitorCount?.current_count || 0}
        />

        {/* 停车场实时状态 - 区域标题 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-lingshan-blue to-lingshan-gold" />
          <h2 className="text-2xl font-bold text-foreground">🅿️ 停车场实时状态</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        
        {(() => {
          // 按指定顺序排列停车场
          const orderMap: Record<string, number> = {
            '景区停车场': 1,
            '月亮湾停车场': 2,
            '灵湖路停车': 3,
            '八局停车场': 4,
            '贵宾停车场': 5,
            '古竹停车': 6,
          };
          const sortedParkingLots = [...parkingLots].sort(
            (a, b) => (orderMap[a.name] || 99) - (orderMap[b.name] || 99)
          );

          if (sortedParkingLots.length === 0) {
            return (
              <Card className="border-2 border-dashed border-slate-700 bg-slate-900/30">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                    <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-slate-400">暂无停车场数据</p>
                  <p className="mt-2 max-w-md text-center text-sm text-slate-500">
                    数据库中尚未配置停车场信息，请在 Supabase 中执行 seed_parking_lots.sql 添加6个停车场数据。
                  </p>
                  <p className="mt-3 text-xs text-slate-600 font-mono">
                    景区停车场(2400) / 月亮湾(1300) / 灵湖路(300) / 八局(100) / 贵宾(140) / 古竹(200)
                  </p>
                </CardContent>
              </Card>
            );
          }

          return <ParkingChart parkingLots={sortedParkingLots} alertConfig={alertConfig} onUpdate={loadData} />;
        })()}

        {/* 历史趋势分析 - 区域标题 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-lingshan-blue to-lingshan-gold" />
          <h2 className="text-2xl font-bold text-foreground">📊 历史趋势分析</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        
        <HistoricalTrendChart data={historicalData} />

        {/* 节假日对比分析 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-600" />
          <h2 className="text-2xl font-bold text-foreground">🏮 节假日客流对比分析</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <FestivalComparisonChart historicalData={historicalData} />

        {/* 节假日启动短驳对比分析 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-orange-500 to-red-600" />
          <h2 className="text-2xl font-bold text-foreground">🚌 节假日启动短驳对比分析</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <FestivalShuttleComparisonChart historicalData={historicalData} />

        {/* 法定节假日快捷选择 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-lingshan-green to-lingshan-blue" />
          <h2 className="text-2xl font-bold text-foreground">📅 法定节假日快捷选择</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <HolidaySelector onSelectHoliday={handleSelectHoliday} />

        {/* 地图区域 - 区域标题 */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-lingshan-green to-lingshan-blue" />
          <h2 className="text-2xl font-bold text-foreground">🗺️ 景区周边实时路况</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        {/* 高德地图 */}
        <Card className="overflow-hidden border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lingshan-blue/10">
                  <MapPin className="h-5 w-5 text-lingshan-blue" />
                </div>
                <div>
                  <div className="text-lg font-bold">实时路况地图</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    💡 点击地图可查看实时交通状况，支持缩放和拖拽
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('https://www.amap.com/dir?from[name]=灵山大佛&to[name]=拈花湾&type=car');
                  }}
                  className="rounded-lg"
                >
                  🚗 热门路线：灵山→拈花湾
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.open('https://www.amap.com/dir?from[name]=灵山大佛&to[name]=无锡站&type=car');
                  }}
                  className="rounded-lg"
                >
                  🚗 热门路线：灵山→无锡站
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    window.open('https://uri.amap.com/search?keyword=%E7%81%B5%E5%B1%B1%E8%83%9C%E5%A2%83&city=%E6%97%A0%E9%94%A1&src=mypage&coordinate=gaode&callnative=0');
                  }}
                  className="rounded-lg"
                >
                  📍 高德地图
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    window.open('https://map.baidu.com/@13373468,3669634,13z');
                  }}
                  className="rounded-lg"
                >
                  📍 百度地图
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[1500px] w-full">
              <SimpleMap />
              {/* 地图提示层 */}
              <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
                <div className="rounded-lg border-2 border-lingshan-blue bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-medium text-lingshan-blue">
                    🗺️ 地图已加载景区中心点及主要停车场位置
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
