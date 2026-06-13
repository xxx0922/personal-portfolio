import { useEffect, useRef, useState } from 'react';

interface AMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    AMap: any;
    _AMapSecurityConfig: any;
  }
}

export function AMap({ center = [120.0853, 31.4342], zoom = 14, className = '' }: AMapProps) {
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
        if (window.AMap) {
          console.log('[AMap] API已存在');
          resolve();
          return;
        }

        // 检查是否已有脚本标签
        const existingScript = document.querySelector('script[src*="webapi.amap.com"]');
        if (existingScript) {
          console.log('[AMap] 脚本标签已存在，等待加载');
          // 等待脚本加载完成
          const checkInterval = setInterval(() => {
            if (window.AMap) {
              console.log('[AMap] API加载完成');
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          // 10秒超时
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.AMap) {
              reject(new Error('地图API加载超时'));
            }
          }, 10000);
          return;
        }

        // 创建新的脚本标签
        console.log('[AMap] 创建新的脚本标签');
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://webapi.amap.com/maps?v=2.0&key=OeTpXHgdUrRT2pPyAPRL7pog6GlMlQzl';
        
        script.onload = () => {
          console.log('[AMap] 脚本加载成功');
          if (window.AMap) {
            resolve();
          } else {
            reject(new Error('脚本加载成功但AMap对象未定义'));
          }
        };
        
        script.onerror = () => {
          console.error('[AMap] 脚本加载失败');
          reject(new Error('地图脚本加载失败'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      if (initAttempted.current) {
        console.log('[AMap] 已尝试初始化，跳过');
        return;
      }
      initAttempted.current = true;

      try {
        console.log('[AMap] 开始初始化地图');
        
        // 等待容器渲染
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!mounted) {
          console.log('[AMap] 组件已卸载');
          return;
        }

        if (!mapContainer.current) {
          console.error('[AMap] 地图容器不存在');
          setError('地图容器初始化失败');
          setLoading(false);
          return;
        }

        console.log('[AMap] 容器已就绪，加载脚本');
        
        // 加载高德地图脚本
        await loadScript();
        
        if (!mounted) {
          console.log('[AMap] 组件已卸载');
          return;
        }

        if (!window.AMap) {
          throw new Error('高德地图API未加载');
        }

        console.log('[AMap] 创建地图实例');
        
        // 创建地图
        mapInstance.current = new window.AMap.Map(mapContainer.current, {
          zoom: zoom,
          center: center,
          viewMode: '2D',
          resizeEnable: true,
          mapStyle: 'amap://styles/normal',
        });

        console.log('[AMap] 地图实例创建成功');

        // 添加主标记点
        const marker = new window.AMap.Marker({
          position: center,
          title: '无锡灵山景区',
        });
        mapInstance.current.add(marker);
        console.log('[AMap] 主标记点添加成功');

        // 添加交通图层
        const trafficLayer = new window.AMap.TileLayer.Traffic({
          zIndex: 10,
          autoRefresh: true,
          interval: 180,
        });
        trafficLayer.setMap(mapInstance.current);
        console.log('[AMap] 交通图层添加成功');

        // 添加关键点位
        const keyPoints = [
          { position: [120.0900, 31.4380], name: '灵湖大桥' },
          { position: [120.0820, 31.4320], name: '千波桥' },
          { position: [120.0880, 31.4350], name: '灵湖路' },
        ];

        keyPoints.forEach((point) => {
          const pointMarker = new window.AMap.Marker({
            position: point.position,
            title: point.name,
            label: {
              content: point.name,
              offset: new window.AMap.Pixel(0, -30),
              direction: 'top',
            },
          });
          mapInstance.current.add(pointMarker);
        });
        console.log('[AMap] 关键点位添加成功');

        // 地图加载完成
        if (mounted) {
          setLoading(false);
          console.log('[AMap] 地图初始化完成');
        }

      } catch (err) {
        console.error('[AMap] 地图初始化失败:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : '地图加载失败');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      console.log('[AMap] 组件卸载');
      mounted = false;
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
        } catch (e) {
          console.warn('[AMap] 地图销毁失败:', e);
        }
        mapInstance.current = null;
      }
    };
  }, [center, zoom]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">{error}</p>
          <p className="mt-2 text-xs">请检查网络连接或稍后重试</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-center">
          <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">地图加载中...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} style={{ width: '100%', height: '100%', minHeight: '400px' }} />;
}
