import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Car, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getParkingLots, updateParkingLot } from '@/db/api';
import type { ParkingLot } from '@/types/traffic';

export default function ParkingManagement() {
  const [loading, setLoading] = useState(false);
  const [yuelvwanParking, setYuelvwanParking] = useState<ParkingLot | null>(null);
  const [occupiedSpaces, setOccupiedSpaces] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadParkingData();
  }, []);

  const loadParkingData = async () => {
    try {
      const parkingLots = await getParkingLots();
      const yuelvwan = parkingLots.find((lot) => lot.name === '月亮湾停车场');
      if (yuelvwan) {
        setYuelvwanParking(yuelvwan);
        setOccupiedSpaces(yuelvwan.occupied_spaces.toString());
        setNotes(yuelvwan.notes || '');
      }
    } catch (error) {
      console.error('加载停车场数据失败:', error);
      toast.error('加载停车场数据失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!yuelvwanParking) {
      toast.error('未找到月亮湾停车场数据');
      return;
    }

    const occupied = parseInt(occupiedSpaces);
    if (isNaN(occupied) || occupied < 0) {
      toast.error('请输入有效的车位数量');
      return;
    }

    if (occupied > yuelvwanParking.total_spaces) {
      toast.error(`已占用车位不能超过总车位数（${yuelvwanParking.total_spaces}）`);
      return;
    }

    setLoading(true);
    try {
      await updateParkingLot(
        yuelvwanParking.id,
        occupied,
        yuelvwanParking.open_time,
        yuelvwanParking.full_time,
        yuelvwanParking.is_activated,
        yuelvwanParking.activation_time,
        notes || null
      );
      
      toast.success('月亮湾停车场数据更新成功');
      await loadParkingData();
    } catch (error) {
      console.error('更新停车场数据失败:', error);
      toast.error('更新停车场数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">月亮湾停车场管理</h1>
          <p className="mt-2 text-muted-foreground">
            录入和管理月亮湾停车场的车位占用数据
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回管理后台
          </Link>
        </Button>
      </div>

      {/* 停车场信息卡片 */}
      {yuelvwanParking && (
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lingshan-gold/10">
                <Car className="h-6 w-6 text-lingshan-gold" />
              </div>
              <div>
                <CardTitle>月亮湾停车场</CardTitle>
                <CardDescription>
                  总车位: {yuelvwanParking.total_spaces} | 
                  当前占用: {yuelvwanParking.occupied_spaces} | 
                  剩余: {yuelvwanParking.total_spaces - yuelvwanParking.occupied_spaces}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 已占用车位数 */}
              <div className="space-y-2">
                <Label htmlFor="occupied_spaces" className="text-base font-semibold">
                  已占用车位数 <span className="text-danger">*</span>
                </Label>
                <Input
                  id="occupied_spaces"
                  type="number"
                  min="0"
                  max={yuelvwanParking.total_spaces}
                  value={occupiedSpaces}
                  onChange={(e) => setOccupiedSpaces(e.target.value)}
                  placeholder={`请输入已占用车位数（0-${yuelvwanParking.total_spaces}）`}
                  required
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  当前剩余车位: {yuelvwanParking.total_spaces - parseInt(occupiedSpaces || '0')}
                </p>
              </div>

              {/* 备注 */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">
                  备注信息
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="请输入备注信息（选填）"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  可以记录特殊情况、临时调整等信息
                </p>
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg shadow-sm transition-all hover:shadow-md"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? '保存中...' : '保存数据'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadParkingData}
                  disabled={loading}
                  className="rounded-lg shadow-sm transition-all hover:shadow-md"
                >
                  刷新数据
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="border-l-4 border-l-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 已占用车位数必须在 0 到总车位数（{yuelvwanParking?.total_spaces || 0}）之间</p>
          <p>• 系统会自动计算剩余车位数</p>
          <p>• 备注信息为可选项，可用于记录特殊情况</p>
          <p>• 数据保存后会立即在主页面显示</p>
          <p>• 建议定期更新数据以保持准确性</p>
        </CardContent>
      </Card>
    </div>
  );
}
