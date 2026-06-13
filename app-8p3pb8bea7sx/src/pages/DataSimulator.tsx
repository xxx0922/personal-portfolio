import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router';
import {
  getParkingLots,
  getRoadTraffic,
  getVisitorCount,
  updateParkingLot,
  updateRoadTraffic,
  updateVisitorCount,
} from '@/db/api';
import type { ParkingLot, RoadTraffic, VisitorCount } from '@/types/traffic';
import { toast } from 'sonner';
import { Save, RefreshCw, ArrowLeft } from 'lucide-react';

export default function DataSimulator() {
  const simulatorEnabled = localStorage.getItem('simulatorEnabled') !== 'false';
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [roadTraffic, setRoadTraffic] = useState<RoadTraffic[]>([]);
  const [visitorCount, setVisitorCount] = useState<VisitorCount | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [parkingData, roadData, visitorData] = await Promise.all([
        getParkingLots(),
        getRoadTraffic(),
        getVisitorCount(),
      ]);
      setParkingLots(parkingData);
      setRoadTraffic(roadData);
      setVisitorCount(visitorData);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateParking = async (
    id: number, 
    occupied: number,
    openTime?: string,
    fullTime?: string,
    isActivated?: boolean,
    activationTime?: string
  ) => {
    try {
      await updateParkingLot(id, occupied, openTime, fullTime, isActivated, activationTime);
      toast.success('停车场数据已更新');
      loadData();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  const handleUpdateRoad = async (
    id: number,
    density: number,
    status: 'normal' | 'busy' | 'congested',
    controlStartTime?: string,
    controlEndTime?: string
  ) => {
    try {
      await updateRoadTraffic(id, density, status, controlStartTime, controlEndTime);
      toast.success('道路数据已更新');
      loadData();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  const handleUpdateVisitor = async (count: number) => {
    try {
      await updateVisitorCount(count);
      toast.success('入园人数已更新');
      loadData();
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败');
    }
  };

  const simulateRandomData = async () => {
    try {
      // 随机更新停车场数据
      for (const lot of parkingLots) {
        const randomOccupied = Math.floor(Math.random() * lot.total_spaces);
        await updateParkingLot(lot.id, randomOccupied);
      }

      // 随机更新道路数据
      for (const road of roadTraffic) {
        const randomDensity = Math.floor(Math.random() * 100);
        let status: 'normal' | 'busy' | 'congested' = 'normal';
        if (randomDensity >= 80) status = 'congested';
        else if (randomDensity >= 60) status = 'busy';
        await updateRoadTraffic(road.id, randomDensity, status);
      }

      // 随机更新入园人数
      const randomVisitors = Math.floor(Math.random() * 35000);
      await updateVisitorCount(randomVisitors);

      toast.success('已生成随机数据');
      loadData();
    } catch (error) {
      console.error('生成随机数据失败:', error);
      toast.error('生成随机数据失败');
    }
  };

  if (!simulatorEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader>
            <CardTitle>数据模拟器已关闭</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              当前模拟器处于关闭状态，请返回管理员后台开启后再使用。
            </p>
            <Button className="w-full" asChild>
              <Link to="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回管理员后台
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground xl:text-3xl">
              数据模拟器
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              用于模拟实时数据更新
            </p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回仪表盘
              </Link>
            </Button>
            <Button onClick={simulateRandomData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              生成随机数据
            </Button>
          </div>
        </div>

        {/* 入园人数 */}
        <Card>
          <CardHeader>
            <CardTitle>入园人数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>当前人数: {visitorCount?.current_count || 0}</Label>
                <Slider
                  value={[visitorCount?.current_count || 0]}
                  onValueChange={([value]) => {
                    if (visitorCount) {
                      setVisitorCount({ ...visitorCount, current_count: value });
                    }
                  }}
                  max={40000}
                  step={100}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={() => handleUpdateVisitor(visitorCount?.current_count || 0)}
              >
                <Save className="mr-2 h-4 w-4" />
                保存
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 停车场 */}
        <Card>
          <CardHeader>
            <CardTitle>停车场状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {parkingLots.map((lot) => {
                const isSpecialLot = lot.name === '灵湖路停车场' || lot.name === '古竹两侧停车场';
                
                return (
                  <div key={lot.id} className="space-y-4 rounded-lg border border-border p-4">
                    <h3 className="font-medium">{lot.name}</h3>
                    
                    {!isSpecialLot && (
                      <div>
                        <Label>
                          占用车位: {lot.occupied_spaces}/{lot.total_spaces}
                        </Label>
                        <Slider
                          value={[lot.occupied_spaces]}
                          onValueChange={([value]) => {
                            setParkingLots(
                              parkingLots.map((p) =>
                                p.id === lot.id ? { ...p, occupied_spaces: value } : p
                              )
                            );
                          }}
                          max={lot.total_spaces}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    )}
                    
                    {isSpecialLot && (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={lot.is_activated || false}
                            onChange={(e) => {
                              setParkingLots(
                                parkingLots.map((p) =>
                                  p.id === lot.id 
                                    ? { 
                                        ...p, 
                                        is_activated: e.target.checked,
                                        activation_time: e.target.checked 
                                          ? new Date().toTimeString().slice(0, 5) 
                                          : null 
                                      } 
                                    : p
                                )
                              );
                            }}
                            className="h-4 w-4"
                          />
                          <Label>是否启动</Label>
                        </div>
                        
                        {lot.is_activated && (
                          <div>
                            <Label>启动时间</Label>
                            <Input
                              type="time"
                              value={lot.activation_time || ''}
                              onChange={(e) => {
                                setParkingLots(
                                  parkingLots.map((p) =>
                                    p.id === lot.id ? { ...p, activation_time: e.target.value } : p
                                  )
                                );
                              }}
                              className="mt-2"
                            />
                          </div>
                        )}
                      </>
                    )}
                    
                    <Button
                      onClick={() => handleUpdateParking(
                        lot.id, 
                        lot.occupied_spaces,
                        undefined,
                        undefined,
                        lot.is_activated,
                        lot.activation_time || undefined
                      )}
                      size="sm"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      保存
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 道路交通 */}
        <Card>
          <CardHeader>
            <CardTitle>道路交通状况</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {roadTraffic.map((road) => (
                <div key={road.id} className="space-y-4 rounded-lg border border-border p-4">
                  <h3 className="font-medium">{road.road_name}</h3>
                  <div>
                    <Label>车流密度: {road.traffic_density}%</Label>
                    <Slider
                      value={[road.traffic_density]}
                      onValueChange={([value]) => {
                        setRoadTraffic(
                          roadTraffic.map((r) =>
                            r.id === road.id ? { ...r, traffic_density: value } : r
                          )
                        );
                      }}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>状态</Label>
                    <Select
                      value={road.status}
                      onValueChange={(value: 'normal' | 'busy' | 'congested') => {
                        setRoadTraffic(
                          roadTraffic.map((r) =>
                            r.id === road.id ? { ...r, status: value } : r
                          )
                        );
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">畅通</SelectItem>
                        <SelectItem value="busy">繁忙</SelectItem>
                        <SelectItem value="congested">拥堵</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>管控开始时间</Label>
                    <Input
                      type="time"
                      value={road.control_start_time || ''}
                      onChange={(e) => {
                        setRoadTraffic(
                          roadTraffic.map((r) =>
                            r.id === road.id ? { ...r, control_start_time: e.target.value } : r
                          )
                        );
                      }}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>管控结束时间</Label>
                    <Input
                      type="time"
                      value={road.control_end_time || ''}
                      onChange={(e) => {
                        setRoadTraffic(
                          roadTraffic.map((r) =>
                            r.id === road.id ? { ...r, control_end_time: e.target.value } : r
                          )
                        );
                      }}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={() =>
                      handleUpdateRoad(
                        road.id, 
                        road.traffic_density, 
                        road.status,
                        road.control_start_time || undefined,
                        road.control_end_time || undefined
                      )
                    }
                    size="sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
