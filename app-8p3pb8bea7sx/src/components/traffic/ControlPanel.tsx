import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { TrafficControlMeasure } from '@/types/traffic';
import { updateTrafficControlMeasure } from '@/db/api';
import { toast } from 'sonner';
import { Shield, AlertCircle } from 'lucide-react';

interface ControlPanelProps {
  measures: TrafficControlMeasure[];
  onUpdate: () => void;
}

export function ControlPanel({ measures, onUpdate }: ControlPanelProps) {
  const [updating, setUpdating] = useState<number | null>(null);

  const handleToggle = async (id: number, currentStatus: string) => {
    try {
      setUpdating(id);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateTrafficControlMeasure(id, newStatus);
      toast.success(`管制措施已${newStatus === 'active' ? '启用' : '停用'}`);
      onUpdate();
    } catch (error) {
      console.error('更新管制措施失败:', error);
      toast.error('更新失败，请稍后重试');
    } finally {
      setUpdating(null);
    }
  };

  const activeCount = measures.filter((m) => m.status === 'active').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>交通管制措施</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              当前启用 {activeCount}/{measures.length} 项措施
            </p>
          </div>
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {measures.map((measure) => (
            <div
              key={measure.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle 
                  className={`mt-1 h-5 w-5 ${
                    measure.status === 'active' ? 'text-danger' : 'text-muted-foreground'
                  }`} 
                />
                <div>
                  <h3 className="font-medium">{measure.measure_name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={measure.status === 'active' ? 'default' : 'outline'}>
                      {measure.status === 'active' ? '已启用' : '未启用'}
                    </Badge>
                    {measure.activated_at && measure.status === 'active' && (
                      <span className="text-xs text-muted-foreground">
                        启用于 {new Date(measure.activated_at).toLocaleString('zh-CN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Switch
                checked={measure.status === 'active'}
                onCheckedChange={() => handleToggle(measure.id, measure.status)}
                disabled={updating === measure.id}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-muted p-4">
          <h4 className="mb-2 font-medium">管制建议</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 当访客数达到历史峰值70%时，建议启用部分管制措施</li>
            <li>• 当访客数达到历史峰值90%时，建议启用全面管制措施</li>
            <li>• 根据实时路况和停车场状态灵活调整管制策略</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
