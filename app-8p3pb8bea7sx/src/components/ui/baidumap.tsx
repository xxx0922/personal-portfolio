import { useEffect, useRef, useState } from 'react';

interface BaiduMapProps {
  center?: { lng: number; lat: number };
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    BMap: any;
    BMAP_NORMAL_MAP: any;
    BMAP_ANIMATION_BOUNCE: any;
  }
}

export function BaiduMap({ 
  center = { lng: 120.085300, lat: 31.434200 }, 
  zoom = 15, 
  className = '' 
}: BaiduMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initAttempted = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadScript = () => {
      return new Promise<void>((resolve, reject) => {
        // 检查是否已经加载
        if (window.BMap) {
          console.log('[BaiduMap] API已存在');
          resolve();
          return;
        }

        // 检查是否已有脚本标签
        const existingScript = document.querySelector('script[src*="api.map.baidu.com"]');
        if (existingScript) {
          console.log('[BaiduMap] 脚本标签已存在，等待加载');
          // 等待脚本加载完成
          const checkInterval = setInterval(() => {
            if (window.BMap) {
              console.log('[BaiduMap] API加载完成');
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          // 10秒超时
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.BMap) {
              reject(new Error('百度地图API加载超时'));
            }
          }, 10000);
          return;
        }

        // 创建新的脚本标签
        console.log('[BaiduMap] 创建新的脚本标签');
        const script = document.createElement('script');
        script.type = 'text/javascript';
        // 使用百度地图API v3.0，需要有效的百度地图API Key
        const apiKey = import.meta.env.VITE_BAIDU_MAP_KEY || 'YOUR_BAIDU_MAP_API_KEY';
        
        // 检查API Key是否已配置
        if (apiKey === 'YOUR_BAIDU_MAP_API_KEY' || !apiKey) {
          console.error('[BaiduMap] 百度地图API Key未配置');
          reject(new Error('百度地图API Key未配置，请在.env文件中设置VITE_BAIDU_MAP_KEY'));
          return;
        }
        
        script.src = `https://api.map.baidu.com/api?v=3.0&ak=${apiKey}`;
        console.log('[BaiduMap] 加载地图脚本:', script.src);
        
        script.onload = () => {
          console.log('[BaiduMap] 脚本加载成功');
          if (window.BMap) {
            resolve();
          } else {
            reject(new Error('脚本加载成功但BMap对象未定义'));
          }
        };
        
        script.onerror = () => {
          console.error('[BaiduMap] 脚本加载失败');
          reject(new Error('百度地图脚本加载失败，请检查API Key是否有效或网络连接'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      if (initAttempted.current) {
        console.log('[BaiduMap] 已尝试初始化，跳过');
        return;
      }
      initAttempted.current = true;

      try {
        console.log('[BaiduMap] 开始初始化地图');
        
        // 等待容器渲染
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!mounted) {
          console.log('[BaiduMap] 组件已卸载');
          return;
        }

        if (!mapContainer.current) {
          console.error('[BaiduMap] 地图容器不存在');
          setError('地图容器初始化失败');
          setLoading(false);
          return;
        }

        console.log('[BaiduMap] 容器已就绪，加载脚本');
        
        // 加载百度地图脚本
        await loadScript();
        
        if (!mounted) {
          console.log('[BaiduMap] 组件已卸载');
          return;
        }

        if (!window.BMap) {
          throw new Error('百度地图API未加载');
        }

        console.log('[BaiduMap] 创建地图实例');
        
        // 创建地图
        mapInstance.current = new window.BMap.Map(mapContainer.current);
        const point = new window.BMap.Point(center.lng, center.lat);
        mapInstance.current.centerAndZoom(point, zoom);
        
        // 启用滚轮缩放
        mapInstance.current.enableScrollWheelZoom(true);
        
        // 添加地图控件
        mapInstance.current.addControl(new window.BMap.NavigationControl());
        mapInstance.current.addControl(new window.BMap.ScaleControl());
        
        console.log('[BaiduMap] 地图实例创建成功');

        // 添加实时路况图层
        const trafficLayer = new window.BMap.TrafficLayer();
        mapInstance.current.addTileLayer(trafficLayer);
        console.log('[BaiduMap] 实时路况图层添加成功');

        // 添加主标记点（无锡灵山景区）
        const mainMarker = new window.BMap.Marker(point);
        mapInstance.current.addOverlay(mainMarker);
        
        // 添加标签
        const label = new window.BMap.Label('无锡灵山景区', {
          offset: new window.BMap.Size(10, -20)
        });
        label.setStyle({
          color: 'hsl(var(--primary))',
          fontSize: '12px',
          border: '1px solid hsl(var(--border))',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: 'hsl(var(--background))',
          fontWeight: 'bold'
        });
        mainMarker.setLabel(label);
        
        // 添加动画效果
        mainMarker.setAnimation(window.BMAP_ANIMATION_BOUNCE);
        
        console.log('[BaiduMap] 主标记点添加成功');

        // 添加关键点位（基于灵山景区周边实际道路位置）
        const keyPoints = [
          { lng: 120.0950, lat: 31.4400, name: '灵湖大桥' },
          { lng: 120.0750, lat: 31.4280, name: '千波桥' },
          { lng: 120.0900, lat: 31.4350, name: '灵湖路' },
          { lng: 120.0800, lat: 31.4380, name: '古竹路' },
        ];

        keyPoints.forEach((pointData) => {
          const pt = new window.BMap.Point(pointData.lng, pointData.lat);
          const marker = new window.BMap.Marker(pt);
          mapInstance.current.addOverlay(marker);
          
          // 添加标签
          const pointLabel = new window.BMap.Label(pointData.name, {
            offset: new window.BMap.Size(10, -20)
          });
          pointLabel.setStyle({
            color: 'hsl(var(--foreground))',
            fontSize: '11px',
            border: '1px solid hsl(var(--border))',
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: 'hsl(var(--card))'
          });
          marker.setLabel(pointLabel);
        });
        
        console.log('[BaiduMap] 关键点位添加成功');

        // 地图加载完成
        if (mounted) {
          setLoading(false);
          console.log('[BaiduMap] 地图初始化完成');
        }

      } catch (err) {
        console.error('[BaiduMap] 地图初始化失败:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : '地图加载失败');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      console.log('[BaiduMap] 组件卸载');
      mounted = false;
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
        } catch (e) {
          console.warn('[BaiduMap] 地图销毁失败:', e);
        }
        mapInstance.current = null;
      }
    };
  }, [center.lng, center.lat, zoom]);

  if (error) {
    const isApiKeyError = error.includes('API Key') || error.includes('脚本加载失败') || error.includes('未配置');
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/50">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-card border-2 border-destructive/50 rounded-lg shadow-lg p-6">
            {/* 错误标题 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">地图加载失败</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>

            {/* 配置指南 */}
            {isApiKeyError && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    配置百度地图API Key
                  </h4>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                      <div className="flex-1">
                        <p className="font-medium mb-1">访问百度地图开放平台</p>
                        <a 
                          href="https://lbsyun.baidu.com/apiconsole/key" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          https://lbsyun.baidu.com/apiconsole/key
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                      <div className="flex-1">
                        <p className="font-medium mb-1">创建应用并获取API Key</p>
                        <p className="text-muted-foreground text-xs">应用类型选择"浏览器端"，配置Referer白名单</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                      <div className="flex-1">
                        <p className="font-medium mb-1">配置到项目</p>
                        <p className="text-muted-foreground text-xs mb-2">在项目根目录的 <code className="bg-muted px-1 py-0.5 rounded">.env</code> 文件中添加：</p>
                        <div className="bg-background rounded border p-3 font-mono text-xs">
                          <code className="text-foreground">VITE_BAIDU_MAP_KEY=您的百度地图API_Key</code>
                        </div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                      <div className="flex-1">
                        <p className="font-medium mb-1">重启开发服务器</p>
                        <p className="text-muted-foreground text-xs">修改 .env 文件后需要重启才能生效</p>
                      </div>
                    </li>
                  </ol>
                </div>

                {/* 地图功能说明 */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    配置完成后，地图将显示
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-success">●</span>
                      <span>无锡灵山景区精确定位（经度120.085300，纬度31.434200）</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">●</span>
                      <span>实时路况图层（<span className="text-destructive font-medium">红色/橙色</span>=拥堵，<span className="text-success font-medium">绿色</span>=畅通）</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">●</span>
                      <span>关键路段标记：灵湖大桥、千波桥、灵湖路、古竹路</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-success">●</span>
                      <span>导航控件、比例尺、滚轮缩放等交互功能</span>
                    </li>
                  </ul>
                </div>

                {/* 帮助文档链接 */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>详细配置说明请查看项目根目录的 <code className="bg-muted px-1 py-0.5 rounded">BAIDU_MAP_SETUP.md</code> 文件</span>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-primary hover:underline font-medium"
                  >
                    刷新页面
                  </button>
                </div>
              </div>
            )}

            {/* 非API Key错误的简单提示 */}
            {!isApiKeyError && (
              <div className="mt-4">
                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                  刷新页面重试
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">地图加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className={`h-full w-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
