import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { ParkingLot, AlertConfig } from '@/types/traffic';
import { Car, ToggleLeft, ToggleRight } from 'lucide-react';
import { updateParkingLot } from '@/db/api';
import { cn } from '@/lib/utils';

interface ParkingChartProps {
  parkingLots: ParkingLot[];
  alertConfig: AlertConfig[];
  onUpdate?: () => void;
}

// 停车场颜色映射
const PARKING_COLORS: Record<string, { bg: string; text: string; border: string; progress: string }> = {
  '景区停车场': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', progress: '[&>div]:bg-blue-500' },
  '月亮湾停车场': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', progress: '[&>div]:bg-cyan-500' },
  '灵湖路停车': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', progress: '[&>div]:bg-amber-500' },
  '八局停车场': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', progress: '[&>div]:bg-purple-500' },
  '贵宾停车场': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', progress: '[&>div]:bg-pink-500' },
  '古竹停车': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', progress: '[&>div]:bg-emerald-500' },
};

export function ParkingChart({ parkingLots, alertConfig, onUpdate }: ParkingChartProps) {
  const getStatusColor = (occupied: number, total: number, isFull?: boolean): string => {
    if (isFull) return 'hsl(var(--danger))';
    const percentage = (occupied / total) * 100;
    const config = alertConfig.find((c) => c.alert_type === 'parking');
    if (!config) return 'hsl(var(--success))';
    if (percentage >= config.red_threshold) return 'hsl(var(--danger))';
    if (percentage >= config.yellow_threshold) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getStatusText = (occupied: number, total: number, isFull?: boolean): string => {
    if (isFull) return '已满';
    const percentage = (occupied / total) * 100;
    const config = alertConfig.find((c) => c.alert_type === 'parking');
    if (!config) return '正常';
    if (percentage >= config.red_threshold) return '严重拥堵';
    if (percentage >= config.yellow_threshold) return '轻度拥堵';
    return '畅通';
  };

  // 切换停满状态
  const toggleFullStatus = async (lot: ParkingLot) => {
    try {
      const newStatus = !lot.is_full;
      await updateParkingLot(
        lot.id,
        lot.occupied_spaces,
        lot.open_time,
        newStatus ? new Date().toISOString() : null,
        lot.is_activated,
        lot.activation_time,
        lot.notes,
        newStatus
      );
      // 触发父组件刷新
      onUpdate?.();
    } catch (error) {
      console.error('更新停车场状态失败:', error);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {parkingLots.map((lot) => {
        const occupied = lot.occupied_spaces;
        const total = lot.total_spaces;
        const available = total - occupied;
        const percentage = ((occupied / total) * 100).toFixed(1);
        const statusColor = getStatusColor(occupied, total, lot.is_full);
        const statusText = getStatusText(occupied, total, lot.is_full);
        const colors = PARKING_COLORS[lot.name] || PARKING_COLORS['景区停车场'];
        const isFull = lot.is_full || false;

        return (
          <Card
            key={lot.id}
            className={cn(
              "overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl",
              isFull && "border-red-500/50"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    colors.bg
                  )}>
                    <Car className={cn("h-5 w-5", colors.text)} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{lot.name}</CardTitle>
                    {lot.notes && (
                      <p className="text-xs text-muted-foreground">{lot.notes}</p>
                    )}
                  </div>
                </div>
                <Badge
                  className={cn(
                    "text-xs font-semibold",
                    isFull && "bg-red-600 text-white",
                    !isFull && statusColor === 'hsl(var(--danger))' && 'bg-danger text-danger-foreground',
                    !isFull && statusColor === 'hsl(var(--warning))' && 'bg-warning text-warning-foreground',
                    !isFull && statusColor === 'hsl(var(--success))' && 'bg-success text-success-foreground'
                  )}
                >
                  {statusText}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 数值显示 */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-4xl font-bold text-data-highlight">
                    {occupied.toLocaleString()}
                  </span>
                  <span className="ml-2 text-2xl text-muted-foreground">
                    / {total.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-3xl font-bold",
                    isFull ? "text-red-500" : colors.text
                  )}>
                    {percentage}%
                  </div>
                  <div className="text-xs text-muted-foreground">占用率</div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">🚗 已占用</span>
                  <span className="font-semibold">{occupied} 个车位</span>
                </div>
                <Progress
                  value={parseFloat(percentage)}
                  className={cn(
                    "h-3",
                    isFull ? "[&>div]:bg-red-500" : colors.progress
                  )}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">🅿️ 可用</span>
                  <span className={cn(
                    "font-semibold",
                    isFull ? "text-red-400" : "text-success"
                  )}>
                    {isFull ? 0 : available} 个车位
                  </span>
                </div>
              </div>

              {/* 停满切换按钮 */}
              <div className="border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-10 w-full text-base font-semibold transition-all",
                    isFull
                      ? "border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      : "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"
                  )}
                  onClick={() => toggleFullStatus(lot)}
                >
                  {isFull ? (
                    <>
                      <ToggleRight className="mr-2 h-5 w-5" />
                      标记为未满
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="mr-2 h-5 w-5" />
                      标记为已满
                    </>
                  )}
                </Button>

                {/* 时间信息 */}
                {(lot.open_time || lot.full_time) && (
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {lot.open_time && (
                      <div>🕐 开放: {lot.open_time}</div>
                    )}
                    {lot.full_time && (
                      <div>🕐 满位: {lot.full_time}</div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
