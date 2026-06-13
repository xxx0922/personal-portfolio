import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date } = await req.json();
    
    // 获取API密钥
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      throw new Error('API密钥未配置');
    }

    // 调用天气API获取无锡滨湖区天气
    // 使用未来7日天气预报API
    const weatherUrl = new URL('https://app-8p3pb8bea7sx-api-rY7JZ6jqrV6L-gateway.appmiaoda.com/lundear/weather7d');
    weatherUrl.searchParams.append('areaCn', '无锡');

    const weatherResponse = await fetch(weatherUrl.toString(), {
      method: 'GET',
      headers: {
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!weatherResponse.ok) {
      throw new Error(`天气API请求失败: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    // 如果提供了日期，查找对应日期的天气
    let targetDayWeather = null;
    if (date && weatherData.data) {
      const targetDate = new Date(date);
      const today = new Date();
      const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // 根据天数差异获取对应的天气数据
      if (diffDays >= 0 && diffDays <= 6) {
        const dayKey = `d${diffDays + 1}`;
        targetDayWeather = weatherData.data[dayKey];
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: weatherData.data,
        targetDayWeather,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('获取天气数据失败:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
