import { useState } from 'react';
import { Button } from './button';

interface SimpleMapProps {
  className?: string;
}

export function SimpleMap({ className = '' }: SimpleMapProps) {
  const [mapType, setMapType] = useState<'baidu' | 'amap'>('baidu');

  // 百度地图iframe URL - 无锡灵山景区（包含停车场标记）
  const baiduMapUrl = 'https://map.baidu.com/search/无锡灵山景区/@13373468.17,3669634.25,15z?querytype=s&da_src=shareurl&wd=无锡灵山景区&c=224&src=0&pn=0&sug=0&l=15&b=(13359093,3662259;13387843,3677009)&from=webmap&biz_forward={"scaler":1,"styles":"pl"}&device_ratio=1';

  // 高德地图 URL - 使用官方 POI 搜索，避免固定坐标偏移
  const amapUrl = 'https://uri.amap.com/search?keyword=%E7%81%B5%E5%B1%B1%E8%83%9C%E5%A2%83&city=%E6%97%A0%E9%94%A1&src=mypage&coordinate=gaode&callnative=0';

  return (
    <div className={`flex h-full w-full flex-col ${className}`}>
      {/* 地图切换按钮 */}
      <div className="mb-2 flex gap-2 border-b bg-card p-2">
        <Button
          variant={mapType === 'baidu' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapType('baidu')}
          className="rounded-lg"
        >
          📍 百度地图
        </Button>
        <Button
          variant={mapType === 'amap' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMapType('amap')}
          className="rounded-lg"
        >
          📍 高德地图
        </Button>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(mapType === 'baidu' ? baiduMapUrl : amapUrl, '_blank')}
          className="rounded-lg"
        >
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          新窗口打开
        </Button>
      </div>

      {/* 地图iframe */}
      <div className="relative flex-1 overflow-hidden rounded-lg bg-muted">
        {mapType === 'baidu' ? (
          <iframe
            src={baiduMapUrl}
            className="absolute inset-0 h-full w-full border-0"
            title="百度地图 - 无锡灵山景区"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        ) : (
          <iframe
            src={amapUrl}
            className="absolute inset-0 h-full w-full border-0"
            title="高德地图 - 无锡灵山景区"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </div>

      {/* 地图说明 */}
      <div className="mt-2 rounded-lg border bg-card p-3">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <p className="font-medium text-foreground">📌 地图功能说明：</p>
            <ul className="space-y-0.5">
              <li>🎯 <strong>景区中心</strong>：使用高德/百度官方 POI 搜索“灵山胜境 / 灵山大佛”，避免固定坐标偏移</li>
              <li>🅿️ <strong>停车场</strong>：果园停车场、月亮湾停车场已标注</li>
              <li>🚦 <strong>实时路况</strong>：红色/橙色线条表示拥堵，绿色表示畅通</li>
              <li>🛣️ <strong>关键路段</strong>：灵湖大桥、千波桥、灵湖路、古竹路、环山东路</li>
              <li>🖱️ <strong>操作提示</strong>：支持缩放、拖动查看周边路况，点击"新窗口打开"查看完整功能</li>
              <li>🚗 <strong>路线规划</strong>：使用上方"热门路线"按钮快速查看导航路线</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
