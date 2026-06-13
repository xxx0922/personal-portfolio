import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarIcon, ArrowLeft, Users, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getReservationVisitors,
  getAllReservationVisitors,
  upsertReservationVisitors,
  deleteReservationVisitors,
} from '@/db/api';
import type { ReservationVisitors } from '@/types/traffic';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ReservationManagement() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservedCount, setReservedCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [allReservations, setAllReservations] = useState<ReservationVisitors[]>([]);
  const [currentReservation, setCurrentReservation] = useState<ReservationVisitors | null>(null);

  // 加载所有预约数据
  const loadAllReservations = async () => {
    try {
      const data = await getAllReservationVisitors();
      setAllReservations(data);
    } catch (error) {
      console.error('加载预约数据失败:', error);
    }
  };

  // 加载指定日期的预约数据
  const loadReservation = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const data = await getReservationVisitors(dateStr);
      
      if (data) {
        setCurrentReservation(data);
        setReservedCount(data.reserved_count.toString());
        setNotes(data.notes || '');
      } else {
        setCurrentReservation(null);
        setReservedCount('');
        setNotes('');
      }
    } catch (error) {
      console.error('加载预约数据失败:', error);
      setCurrentReservation(null);
      setReservedCount('');
      setNotes('');
    }
  };

  useEffect(() => {
    loadAllReservations();
  }, []);

  useEffect(() => {
    loadReservation(selectedDate);
  }, [selectedDate]);

  // 保存预约数据
  const handleSave = async () => {
    const count = parseInt(reservedCount);
    
    if (isNaN(count) || count < 0) {
      toast.error('请输入有效的预约人数');
      return;
    }

    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      await upsertReservationVisitors({
        date: dateStr,
        reserved_count: count,
        notes: notes.trim() || null,
      });

      toast.success('保存成功', {
        description: `${dateStr} 的预约游客数据已更新`,
      });

      // 重新加载数据
      await loadReservation(selectedDate);
      await loadAllReservations();
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除预约数据
  const handleDelete = async () => {
    if (!currentReservation) {
      toast.error('没有可删除的数据');
      return;
    }

    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      await deleteReservationVisitors(dateStr);

      toast.success('删除成功', {
        description: `${dateStr} 的预约游客数据已删除`,
      });

      // 重新加载数据
      setCurrentReservation(null);
      setReservedCount('');
      setNotes('');
      await loadAllReservations();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 xl:p-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">预约游客管理</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                管理每日预约游客数据
              </p>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 左侧：输入表单 */}
          <div className="space-y-6 lg:col-span-2">
            {/* 日期选择和数据输入 */}
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  预约游客数据录入
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* 日期选择 */}
                  <div className="space-y-2">
                    <Label htmlFor="date">选择日期</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, 'yyyy年MM月dd日 (E)', { locale: zhCN })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          locale={zhCN}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 预约人数输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="count">预约游客数量</Label>
                    <Input
                      id="count"
                      type="number"
                      min="0"
                      placeholder="请输入预约游客数量"
                      value={reservedCount}
                      onChange={(e) => setReservedCount(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      输入当日预约的游客总数
                    </p>
                  </div>

                  {/* 备注输入 */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">备注信息（可选）</Label>
                    <Textarea
                      id="notes"
                      placeholder="输入备注信息，如特殊情况说明等"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={loading || !reservedCount}
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {currentReservation ? '更新数据' : '保存数据'}
                    </Button>
                    
                    {currentReservation && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={loading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认删除</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除 {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} 的预约游客数据吗？此操作无法撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>
                              确认删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  {/* 当前状态提示 */}
                  {currentReservation && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground">
                        当前日期已有预约数据，保存将更新现有记录
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        最后更新时间: {format(new Date(currentReservation.updated_at), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：历史记录列表 */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-secondary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-secondary" />
                  历史记录
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  最近的预约游客数据
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                {allReservations.length > 0 ? (
                  <div className="space-y-3">
                    {allReservations.slice(0, 10).map((reservation) => (
                      <button
                        key={reservation.id}
                        onClick={() => setSelectedDate(new Date(reservation.date))}
                        className="w-full rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-primary/5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">
                              {format(new Date(reservation.date), 'yyyy-MM-dd (E)', { locale: zhCN })}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              预约人数: {reservation.reserved_count.toLocaleString()}
                            </div>
                            {reservation.notes && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {reservation.notes}
                              </div>
                            )}
                          </div>
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    暂无历史记录
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
