import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Download,
  Upload,
  Settings,
  LogOut,
  User,
  Cog,
  CalendarCheck,
  Car,
} from 'lucide-react';

export default function Admin() {
  const { profile, signOut } = useAuth();
  const [simulatorEnabled, setSimulatorEnabled] = useState(() => localStorage.getItem('simulatorEnabled') !== 'false');

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const toggleSimulator = () => {
    const next = !simulatorEnabled;
    setSimulatorEnabled(next);
    localStorage.setItem('simulatorEnabled', String(next));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 xl:p-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between rounded-2xl border bg-card p-6 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-foreground">管理员后台</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              无锡灵山景区交通监控系统管理
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{profile?.email || '管理员'}</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
            <Button variant="default" asChild>
              <Link to="/">返回首页</Link>
            </Button>
          </div>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* 后端管理 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Cog className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>后端管理</CardTitle>
                  <CardDescription>系统配置和Webhook管理</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                配置Webhook通知、系统参数和其他后端设置
              </p>
              <Button className="w-full" asChild>
                <Link to="/backend">
                  <Cog className="mr-2 h-4 w-4" />
                  进入管理
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 生成报告 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>生成报告</CardTitle>
                  <CardDescription>导出交通监控报告</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                生成包含实时数据、历史对比和管制建议的完整报告
              </p>
              <Button className="w-full" asChild>
                <Link to="/">
                  <Download className="mr-2 h-4 w-4" />
                  前往生成
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 预约游客管理 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <CalendarCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle>预约游客管理</CardTitle>
                  <CardDescription>管理每日预约游客数据</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                录入和管理当日预约游客数量，用于流量预测
              </p>
              <Button className="w-full" asChild>
                <Link to="/reservation">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  管理预约
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 月亮湾停车场管理 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-lingshan-gold/10">
                  <Car className="h-6 w-6 text-lingshan-gold" />
                </div>
                <div>
                  <CardTitle>月亮湾停车场管理</CardTitle>
                  <CardDescription>管理月亮湾停车场数据</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                录入和管理月亮湾停车场的车位占用数据
              </p>
              <Button className="w-full" asChild>
                <Link to="/parking-management">
                  <Car className="mr-2 h-4 w-4" />
                  管理停车场
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 数据上传 */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>数据上传</CardTitle>
                  <CardDescription>上传历史交通数据</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                支持Excel和CSV格式，批量上传历史客流车流数据
              </p>
              <Button className="w-full" asChild>
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  上传数据
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 数据模拟器 */}
          <Card className={simulatorEnabled
            ? 'overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg transition-all hover:shadow-xl'
            : 'overflow-hidden border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card shadow-lg transition-all hover:shadow-xl'
          }>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={simulatorEnabled
                    ? 'flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 shadow-inner'
                    : 'flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/15 shadow-inner'
                  }>
                    <Settings className={simulatorEnabled ? 'h-7 w-7 text-primary' : 'h-7 w-7 text-destructive'} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">数据模拟器</CardTitle>
                    <CardDescription className="mt-1">模拟停车场、道路交通、入园人数等实时数据</CardDescription>
                  </div>
                </div>
                <span className={simulatorEnabled
                  ? 'rounded-full bg-success/15 px-3 py-1 text-sm font-bold text-success'
                  : 'rounded-full bg-destructive/15 px-3 py-1 text-sm font-bold text-destructive'
                }>
                  {simulatorEnabled ? '运行中' : '已关闭'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-xl border bg-background/40 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">前端展示</p>
                  <p className={simulatorEnabled ? 'mt-1 text-base font-bold text-success' : 'mt-1 text-base font-bold text-destructive'}>
                    {simulatorEnabled ? '显示模拟数据' : '隐藏模拟数据'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">页面访问</p>
                  <p className={simulatorEnabled ? 'mt-1 text-base font-bold text-success' : 'mt-1 text-base font-bold text-muted-foreground'}>
                    {simulatorEnabled ? '允许进入' : '禁止进入'}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  size="lg"
                  className={simulatorEnabled ? 'w-full bg-destructive text-white hover:bg-destructive/90' : 'w-full bg-success text-white hover:bg-success/90'}
                  onClick={toggleSimulator}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  {simulatorEnabled ? '关闭模拟器' : '开启模拟器'}
                </Button>
                {simulatorEnabled ? (
                  <Button size="lg" className="w-full" variant="outline" asChild>
                    <Link to="/simulator">
                      <Settings className="mr-2 h-5 w-5" />
                      打开模拟器
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" variant="outline" disabled>
                    <Settings className="mr-2 h-5 w-5" />
                    模拟器已关闭
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 说明信息 */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">管理员权限说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• 第一个注册的用户自动成为管理员</p>
            <p>• 管理员可以访问所有数据管理功能</p>
            <p>• 普通用户只能查看仪表盘数据</p>
            <p>• 如需修改用户权限，请联系系统管理员</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
