import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Send,
  Webhook,
  Settings,
  Eye,
} from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  enabled: boolean;
  description: string;
  message_template: string;
}

export default function BackendManagement() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [webhookConfigs, setWebhookConfigs] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // 加载Webhook配置
  const loadWebhookConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_config')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setWebhookConfigs(data || []);
    } catch (error) {
      console.error('加载Webhook配置失败:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhookConfigs();
  }, []);

  // 保存Webhook配置
  const saveWebhookConfig = async (config: WebhookConfig) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('webhook_config')
        .update({
          name: config.name,
          webhook_url: config.webhook_url,
          enabled: config.enabled,
          description: config.description,
          message_template: config.message_template,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      toast.success('保存成功');
      await loadWebhookConfigs();
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 删除Webhook配置
  const deleteWebhookConfig = async (id: string) => {
    if (!confirm('确定要删除这个Webhook配置吗？')) return;

    try {
      const { error } = await supabase
        .from('webhook_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('删除成功');
      await loadWebhookConfigs();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  // 添加新的Webhook配置
  const addWebhookConfig = async () => {
    try {
      const defaultTemplate = `【紧急通知】无锡灵山景区启动短驳车辆调度

启动时间: {time}
当前入园人数: {visitor_count}人
果园停车场: {guoyuan_parking}
月亮湾停车场: {yuewanwan_parking}

请相关人员立即到岗，执行短驳车辆调度任务！`;

      const { error } = await supabase
        .from('webhook_config')
        .insert({
          name: '新Webhook配置',
          webhook_url: 'https://example.com/webhook',
          enabled: false,
          description: '请配置Webhook地址',
          message_template: defaultTemplate
        });

      if (error) throw error;

      toast.success('添加成功');
      await loadWebhookConfigs();
    } catch (error) {
      console.error('添加失败:', error);
      toast.error('添加失败');
    }
  };

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

  // 测试Webhook
  const testWebhook = async (configId: string) => {
    try {
      setTesting(configId);
      const testMessage = `【测试消息】\n这是一条来自无锡灵山景区交通监控系统的测试消息\n发送时间: ${new Date().toLocaleString('zh-CN')}`;
      const templateData = {
        time: new Date().toLocaleString('zh-CN'),
        visitor_count: '9999',
        guoyuan_parking: '850/1000',
        yuewanwan_parking: '620/800'
      };

      // 直接使用本地后端代理发送，避免 Supabase Edge Function CORS 报错
      await sendWebhookDirectly(testMessage, templateData);
    } catch (error) {
      console.error('Webhook 测试失败:', error);
      toast.error(`测试失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setTesting(null);
    }
  };

  // 更新配置字段
  const updateConfig = (id: string, field: keyof WebhookConfig, value: string | boolean) => {
    setWebhookConfigs(configs =>
      configs.map(config =>
        config.id === id ? { ...config, [field]: value } : config
      )
    );
  };

  // 预览消息模板
  const previewTemplate = (template: string) => {
    const sampleData = {
      time: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      visitor_count: '12580',
      guoyuan_parking: '850/1000',
      yuewanwan_parking: '620/800'
    };

    let preview = template;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });

    return preview;
  };

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>权限不足</CardTitle>
            <CardDescription>您没有权限访问此页面</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 xl:p-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between rounded-2xl border bg-card p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">后端管理</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                系统配置和Webhook管理
              </p>
            </div>
          </div>
        </div>

        {/* 功能标签页 */}
        <Tabs defaultValue="webhook" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="webhook">
              <Webhook className="mr-2 h-4 w-4" />
              Webhook配置
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="mr-2 h-4 w-4" />
              系统设置
            </TabsTrigger>
          </TabsList>

          {/* Webhook配置 */}
          <TabsContent value="webhook" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook通知配置</CardTitle>
                    <CardDescription>
                      配置企业微信、钉钉、飞书等群聊机器人Webhook地址，启动短驳时自动发送通知
                    </CardDescription>
                  </div>
                  <Button onClick={addWebhookConfig}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加配置
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : webhookConfigs.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    暂无Webhook配置，点击"添加配置"开始
                  </div>
                ) : (
                  webhookConfigs.map((config) => (
                    <Card key={config.id} className="border-2">
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={config.enabled}
                              onCheckedChange={(checked) => updateConfig(config.id, 'enabled', checked)}
                            />
                            <Label className="text-sm font-medium">
                              {config.enabled ? '已启用' : '已禁用'}
                            </Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testWebhook(config.id)}
                              disabled={testing === config.id || !config.enabled}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              {testing === config.id ? '测试中...' : '测试'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => saveWebhookConfig(config)}
                              disabled={saving}
                            >
                              <Save className="mr-2 h-4 w-4" />
                              保存
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteWebhookConfig(config.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`name-${config.id}`}>名称</Label>
                          <Input
                            id={`name-${config.id}`}
                            value={config.name}
                            onChange={(e) => updateConfig(config.id, 'name', e.target.value)}
                            placeholder="例如：企业微信群通知"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`url-${config.id}`}>Webhook地址</Label>
                          <Input
                            id={`url-${config.id}`}
                            value={config.webhook_url}
                            onChange={(e) => updateConfig(config.id, 'webhook_url', e.target.value)}
                            placeholder="企业微信/钉钉/飞书 Webhook 地址"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`desc-${config.id}`}>描述</Label>
                          <Input
                            id={`desc-${config.id}`}
                            value={config.description || ''}
                            onChange={(e) => updateConfig(config.id, 'description', e.target.value)}
                            placeholder="配置说明"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`template-${config.id}`}>消息模板</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewingId(previewingId === config.id ? null : config.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {previewingId === config.id ? '隐藏预览' : '预览'}
                            </Button>
                          </div>
                          <Textarea
                            id={`template-${config.id}`}
                            value={config.message_template || ''}
                            onChange={(e) => updateConfig(config.id, 'message_template', e.target.value)}
                            placeholder="输入消息模板，支持变量：{time} {visitor_count} {guoyuan_parking} {yuewanwan_parking}"
                            rows={6}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            支持的变量：<code className="rounded bg-muted px-1">{'{time}'}</code> 启动时间、
                            <code className="rounded bg-muted px-1">{'{visitor_count}'}</code> 入园人数、
                            <code className="rounded bg-muted px-1">{'{guoyuan_parking}'}</code> 果园停车场、
                            <code className="rounded bg-muted px-1">{'{yuewanwan_parking}'}</code> 月亮湾停车场
                          </p>
                        </div>

                        {/* 预览区域 */}
                        {previewingId === config.id && (
                          <div className="space-y-2">
                            <Label>预览效果（使用示例数据）</Label>
                            <div className="rounded-lg border bg-muted/50 p-4">
                              <pre className="whitespace-pre-wrap text-sm">
                                {previewTemplate(config.message_template || '')}
                              </pre>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">使用说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>企业微信群机器人：</strong></p>
                <p>1. 在企业微信群中添加群机器人</p>
                <p>2. 复制Webhook地址（格式：https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY）</p>
                <p>3. 粘贴到上方"Webhook地址"输入框</p>
                <p className="mt-4"><strong>钉钉群机器人：</strong></p>
                <p>1. 在钉钉群中添加自定义机器人</p>
                <p>2. 复制Webhook地址（格式：https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN）</p>
                <p>3. 粘贴到上方"Webhook地址"输入框</p>
                <p className="mt-4"><strong>飞书群机器人：</strong></p>
                <p>1. 在飞书群中添加自定义机器人</p>
                <p>2. 复制Webhook地址（格式：https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_TOKEN）</p>
                <p>3. 粘贴到上方"Webhook地址"输入框</p>
                <p className="mt-4"><strong>测试功能：</strong></p>
                <p>• 点击"测试"按钮会向所有启用的Webhook发送测试消息</p>
                <p>• 启动短驳时会自动向所有启用的Webhook发送通知</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 系统设置 */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>系统设置</CardTitle>
                <CardDescription>
                  系统配置和参数设置
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center text-muted-foreground">
                  系统设置功能开发中...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
