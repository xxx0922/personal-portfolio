import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  enabled: boolean;
  message_template: string;
}

interface TemplateData {
  time?: string;
  visitor_count?: string;
  guoyuan_parking?: string;
  yuewanwan_parking?: string;
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取请求数据
    const { message, messageType = 'text', templateData } = await req.json();

    console.log('[send-webhook-notification] 开始发送通知');

    // 获取启用的Webhook配置
    const { data: webhookConfigs, error: configError } = await supabase
      .from('webhook_config')
      .select('*')
      .eq('enabled', true);

    if (configError) {
      console.error('[send-webhook-notification] 获取配置失败:', configError);
      throw configError;
    }

    if (!webhookConfigs || webhookConfigs.length === 0) {
      console.log('[send-webhook-notification] 没有启用的Webhook配置');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: '没有启用的Webhook配置',
          sent: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[send-webhook-notification] 找到${webhookConfigs.length}个启用的Webhook`);

    // 发送通知到所有启用的Webhook
    const results = await Promise.allSettled(
      webhookConfigs.map(async (config: WebhookConfig) => {
        console.log(`[send-webhook-notification] 发送到: ${config.name}`);
        
        // 处理消息内容：优先使用模板，否则使用传入的message
        let finalMessage = message;
        
        if (config.message_template && templateData) {
          // 使用模板并替换变量
          finalMessage = config.message_template;
          Object.entries(templateData as TemplateData).forEach(([key, value]) => {
            finalMessage = finalMessage.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
          });
          console.log(`[send-webhook-notification] 使用模板生成消息`);
        }

        if (!finalMessage) {
          throw new Error('消息内容不能为空');
        }
        
        // 根据Webhook URL判断类型并构造消息格式
        let payload;
        
        if (config.webhook_url.includes('qyapi.weixin.qq.com')) {
          // 企业微信格式
          payload = {
            msgtype: messageType,
            text: {
              content: finalMessage,
              mentioned_list: ['@all'] // @所有人
            }
          };
        } else if (config.webhook_url.includes('oapi.dingtalk.com')) {
          // 钉钉格式
          payload = {
            msgtype: messageType,
            text: {
              content: finalMessage
            },
            at: {
              isAtAll: true // @所有人
            }
          };
        } else if (config.webhook_url.includes('open.feishu.cn') || config.webhook_url.includes('open.larksuite.com')) {
          // 飞书 / Lark 格式
          payload = {
            msg_type: 'text',
            content: {
              text: finalMessage
            }
          };
        } else {
          // 通用格式
          payload = {
            text: finalMessage,
            msgtype: messageType
          };
        }

        const response = await fetch(config.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.text();
        console.log(`[send-webhook-notification] ${config.name} 响应:`, result);

        if (!response.ok) {
          throw new Error(`${config.name} 发送失败: ${result}`);
        }

        return { name: config.name, success: true, result };
      })
    );

    // 统计结果
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    console.log(`[send-webhook-notification] 发送完成: 成功${successCount}个, 失败${failedCount}个`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `通知发送完成: 成功${successCount}个, 失败${failedCount}个`,
        sent: successCount,
        failed: failedCount,
        results: results.map((r, i) => ({
          name: webhookConfigs[i].name,
          status: r.status,
          error: r.status === 'rejected' ? r.reason.message : null
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[send-webhook-notification] 错误:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '发送通知失败'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
