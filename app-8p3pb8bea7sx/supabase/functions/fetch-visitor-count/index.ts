import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisitorData {
  total: number;
  timestamp: string;
}

Deno.serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[fetch-visitor-count] 开始抓取入园人数数据');

    // 创建Supabase客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 登录凭证
    const loginUrl = 'http://dp.lingshan.org:8505/dp/login.html';
    const username = 'ls';
    const password = 'q9vik7mf2l';

    console.log('[fetch-visitor-count] 准备登录到灵山数据平台');

    // 第一步：获取登录页面，建立会话
    const loginPageResponse = await fetch(loginUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!loginPageResponse.ok) {
      throw new Error(`获取登录页面失败: ${loginPageResponse.status}`);
    }

    // 提取cookies
    const setCookieHeaders = loginPageResponse.headers.getSetCookie();
    const cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
    console.log('[fetch-visitor-count] 获取到cookies:', cookies);

    // 第二步：提交登录表单
    const loginFormData = new URLSearchParams();
    loginFormData.append('username', username);
    loginFormData.append('password', password);

    const loginResponse = await fetch('http://dp.lingshan.org:8505/dp/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookies,
        'Referer': loginUrl,
      },
      body: loginFormData.toString(),
      redirect: 'manual', // 不自动跟随重定向
    });

    console.log('[fetch-visitor-count] 登录响应状态:', loginResponse.status);

    // 获取登录后的cookies
    const loginSetCookies = loginResponse.headers.getSetCookie();
    const sessionCookies = loginSetCookies.length > 0 
      ? loginSetCookies.map(cookie => cookie.split(';')[0]).join('; ')
      : cookies;

    console.log('[fetch-visitor-count] 登录后cookies:', sessionCookies);

    // 第三步：访问数据页面获取入园人数
    const dataPageUrl = 'http://dp.lingshan.org:8505/dp/dashboard'; // 假设数据在dashboard页面
    const dataResponse = await fetch(dataPageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': sessionCookies,
        'Referer': loginUrl,
      },
    });

    if (!dataResponse.ok) {
      throw new Error(`获取数据页面失败: ${dataResponse.status}`);
    }

    const htmlContent = await dataResponse.text();
    console.log('[fetch-visitor-count] 获取到HTML内容长度:', htmlContent.length);

    // 第四步：解析HTML提取"入园合计"数据
    // 使用正则表达式查找"入园合计"相关的数字
    const patterns = [
      /入园合计[：:]\s*(\d+)/i,
      /入园合计.*?(\d+)/i,
      /"入园合计"[^>]*>(\d+)</i,
      /id="visitor-total"[^>]*>(\d+)</i,
    ];

    let visitorCount = 0;
    for (const pattern of patterns) {
      const match = htmlContent.match(pattern);
      if (match && match[1]) {
        visitorCount = parseInt(match[1], 10);
        console.log('[fetch-visitor-count] 匹配到入园人数:', visitorCount);
        break;
      }
    }

    if (visitorCount === 0) {
      console.warn('[fetch-visitor-count] 未能从HTML中提取入园人数，使用默认值0');
      // 可以在这里记录HTML片段用于调试
      console.log('[fetch-visitor-count] HTML片段（前500字符）:', htmlContent.substring(0, 500));
    }

    // 第五步：更新数据库
    const today = new Date().toISOString().split('T')[0];
    const { error: upsertError } = await supabase
      .from('visitor_count')
      .upsert({
        date: today,
        current_count: visitorCount,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'date',
      });

    if (upsertError) {
      throw new Error(`更新数据库失败: ${upsertError.message}`);
    }

    console.log('[fetch-visitor-count] 数据更新成功');

    const result: VisitorData = {
      total: visitorCount,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        message: '入园人数数据抓取成功',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[fetch-visitor-count] 错误:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
