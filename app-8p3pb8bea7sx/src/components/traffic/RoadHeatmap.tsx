import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RoadTraffic } from '@/types/traffic';
import { MapPin, Clock } from 'lucide-react';

interface RoadHeatmapProps {
  roadTraffic: RoadTraffic[];
}

export function RoadHeatmap({ roadTraffic }: RoadHeatmapProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'normal':
        return 'bg-success text-success-foreground';
      case 'busy':
        return 'bg-warning text-warning-foreground';
      case 'congested':
        return 'bg-danger text-danger-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'normal':
        return '畅通';
      case 'busy':
        return '繁忙';
      case 'congested':
        return '拥堵';
      default:
        return '未知';
    }
  };

  const getDensityColor = (density: number): string => {
    if (density >= 80) return 'bg-danger';
    if (density >= 60) return 'bg-warning';
    if (density >= 40) return 'bg-primary';
    return 'bg-success';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>重点路段交通状况</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roadTraffic.map((road) => (
            <div
              key={road.id}
              className="rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{road.road_name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      最后更新: {new Date(road.last_updated).toLocaleTimeString('zh-CN')}
                    </p>
                    {(road.control_start_time || road.control_end_time) && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          管控时间: {road.control_start_time || '--'} ~ {road.control_end_time || '--'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(road.status)}>
                  {getStatusText(road.status)}
                </Badge>
              </div>
              
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">车流密度</span>
                  <span className="font-medium">{road.traffic_density}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all ${getDensityColor(road.traffic_density)}`}
                    style={{ width: `${road.traffic_density}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
