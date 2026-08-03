import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getPhotoMapCities,
  getPhotoMapCityPhotos,
  getPhotoMapStats,
  checkPhotoMapAuth,
  loginPhotoMap,
  type PhotoMapCity,
  type PhotoMapStats,
} from '../services/dataService';

interface CityPhoto {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  date: string;
}

// 从照片列表中提取不重复的日期，例如 ["2024.07.12", "2024.07.13"]
function getCityDateSummary(photos: CityPhoto[]): string {
  const dates = Array.from(new Set(
    photos
      .map(p => p.date ? p.date.split(' ')[0].replace(/:/g, '.') : '')
      .filter(Boolean)
  )).sort().reverse();

  if (dates.length === 0) return '';
  if (dates.length <= 3) return dates.join(' / ');
  return `${dates.slice(0, 2).join(' / ')} / 等 ${dates.length - 2} 个日期`;
}

const PhotoMapPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const trajectoryLayerRef = useRef<L.LayerGroup | null>(null);

  const [cities, setCities] = useState<PhotoMapCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<PhotoMapCity | null>(null);
  const [cityPhotos, setCityPhotos] = useState<CityPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<PhotoMapStats | null>(null);
  const [showTrajectory, setShowTrajectory] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // 检查登录状态
  useEffect(() => {
    checkPhotoMapAuth().then(res => {
      setAuthStatus(res.authenticated ? 'authenticated' : 'unauthenticated');
    }).catch(() => {
      setAuthStatus('unauthenticated');
    });
  }, []);

  // 加载城市聚合数据（登录后才加载）
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    let mounted = true;
    const load = async () => {
      try {
        const [cityData, statData] = await Promise.all([
          getPhotoMapCities(),
          getPhotoMapStats(),
        ]);
        if (mounted) {
          setCities(cityData);
          if (statData.success) setStats(statData);
        }
      } catch (err) {
        console.error('Failed to load photo map data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [authStatus]);

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([35.8617, 104.1954], 4);

    // 使用高德地图中文底图（支持 WGS-84 坐标，城市级标记偏移可接受）
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: '1234',
      attribution: '&copy; 高德地图',
      maxZoom: 18
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    trajectoryLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      trajectoryLayerRef.current = null;
    };
  }, []);

  const availableYears = stats?.dateRange
    ? Array.from({ length: parseInt(stats.dateRange.latest.slice(0, 4), 10) - parseInt(stats.dateRange.earliest.slice(0, 4), 10) + 1 },
        (_, i) => parseInt(stats.dateRange.earliest.slice(0, 4), 10) + i)
    : [];

  const filteredCities = selectedYears.length > 0
    ? cities.filter(c => c.years?.some(y => selectedYears.includes(y)))
    : cities;

  const toggleYear = (year: number) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].sort((a, b) => a - b)
    );
  };

  const clearYearFilter = () => setSelectedYears([]);

  // 添加城市标记
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || filteredCities.length === 0) return;

    markersLayerRef.current.clearLayers();

    filteredCities.forEach(city => {
      if (!city.lat || !city.lng) return;

      const size = Math.max(28, Math.min(64, 28 + Math.log(city.count) * 6));
      const icon = L.divIcon({
        className: 'photo-map-marker',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #0ea5e9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: ${size > 40 ? '14px' : '12px'};
            border: 3px solid white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            cursor: pointer;
          ">${city.count}</div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([city.lat, city.lng], { icon })
        .bindTooltip(`${city.city} · ${city.count} 张`, { direction: 'top' })
        .on('click', () => {
          setSelectedCity(city);
          mapRef.current?.flyTo([city.lat, city.lng], Math.max(mapRef.current.getZoom(), 9), {
            duration: 1
          });
        });

      markersLayerRef.current.addLayer(marker);
    });
  }, [filteredCities]);

  // 绘制旅行轨迹
  useEffect(() => {
    if (!trajectoryLayerRef.current || !stats) return;

    trajectoryLayerRef.current.clearLayers();

    if (!showTrajectory) return;

    let trajectory = stats.trajectory.filter(t => t.lat && t.lng);
    if (selectedYears.length > 0) {
      trajectory = trajectory.filter(t => {
        const y = t.firstDate ? parseInt(t.firstDate.slice(0, 4), 10) : null;
        return y !== null && selectedYears.includes(y);
      });
    }
    if (trajectory.length < 2) return;

    const points = trajectory.map(t => [t.lat, t.lng] as [number, number]);

    L.polyline(points, {
      color: '#f43f5e',
      weight: 3,
      opacity: 0.85,
      dashArray: '6 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(trajectoryLayerRef.current);

    trajectory.forEach(t => {
      L.marker([t.lat, t.lng], {
        icon: L.divIcon({
          className: 'trajectory-marker',
          html: `
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: #f43f5e;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 700;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${t.order}</div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        })
      })
        .bindTooltip(`${t.order}. ${t.city}<br/><span class="text-xs text-gray-300">${t.firstDate}</span>`, {
          direction: 'top',
          className: 'trajectory-tooltip'
        })
        .addTo(trajectoryLayerRef.current);
    });

    // 自适应轨迹视野
    const bounds = L.latLngBounds(points);
    mapRef.current?.fitBounds(bounds, { padding: [80, 80], maxZoom: 10, animate: true });
  }, [showTrajectory, stats, selectedYears]);

  // 选中城市后加载该城市照片
  useEffect(() => {
    if (!selectedCity) {
      setCityPhotos([]);
      return;
    }

    let mounted = true;
    setLoadingPhotos(true);
    getPhotoMapCityPhotos(selectedCity.city).then(res => {
      if (mounted && res.success) {
        setCityPhotos(res.photos);
      }
    }).finally(() => {
      if (mounted) setLoadingPhotos(false);
    });

    return () => { mounted = false; };
  }, [selectedCity]);

  // 页面标题
  useEffect(() => {
    document.title = '足迹星图 | 丰生水起';
    return () => { document.title = '丰生水起'; };
  }, []);

  // ESC 关闭灯箱
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxUrl(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoggingIn(true);
    setLoginError('');
    const res = await loginPhotoMap(password.trim());
    setLoggingIn(false);
    if (res.success) {
      setAuthStatus('authenticated');
      setPassword('');
    } else {
      setLoginError('密码错误，请重试');
    }
  };

  const yearRange = stats?.dateRange
    ? (stats.dateRange.earliest.slice(0, 4) === stats.dateRange.latest.slice(0, 4)
      ? stats.dateRange.earliest.slice(0, 4)
      : `${stats.dateRange.earliest.slice(0, 4)} - ${stats.dateRange.latest.slice(0, 4)}`)
    : '';

  const StatCard = ({ label, value, suffix = '' }: { label: string; value: number | string; suffix?: string }) => (
    <div className="relative overflow-hidden rounded-xl bg-white/85 backdrop-blur-md p-2 shadow-lg border border-white/60 text-center min-w-0">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-sky-400/10 pointer-events-none" />
      <div className="relative">
        <div className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent tabular-nums leading-tight">
          {value}{suffix}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 font-medium mt-1 truncate">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="relative h-screen w-full bg-gray-100">
      {/* 登录/校验遮罩 */}
      {authStatus !== 'authenticated' && (
        <div className="fixed inset-0 z-[3000] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🗺️</div>
              <h1 className="text-3xl font-bold text-white mb-2">足迹星图</h1>
              <p className="text-gray-300 text-sm">{authStatus === 'checking' ? '正在校验访问权限...' : '此页面需要密码访问'}</p>
            </div>

            {authStatus === 'checking' ? (
              <div className="flex flex-col items-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入访问密码"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
                {loginError && (
                  <p className="text-rose-400 text-sm">{loginError}</p>
                )}
                <button
                  type="submit"
                  disabled={loggingIn || !password.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingIn ? '登录中...' : '进入'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回首页</span>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            足迹星图
          </h1>
        </div>
        <div className="text-sm text-gray-600">
          {loading
            ? '加载中...'
            : selectedYears.length > 0
              ? `${selectedYears.join('、')}年：${filteredCities.length} 个城市`
              : `已收录 ${cities.length} 个城市 / ${cities.reduce((s, c) => s + c.count, 0)} 张照片`}
        </div>
      </div>

      {/* 地图容器 */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* 加载提示 */}
      {loading && (
        <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">正在加载足迹星图...</p>
        </div>
      )}

      {/* 仪表盘 */}
      {stats && (
        <div className="absolute top-20 left-4 z-[1000] w-72 max-w-[calc(100vw-2rem)] space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="照片" value={stats.totalPhotos} />
            <StatCard label="城市" value={filteredCities.length} />
            <StatCard label="国家/地区" value={stats.totalCountries} />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white/85 backdrop-blur-md px-4 py-2 shadow-lg border border-white/60">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">时间跨度</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">{yearRange}</span>
          </div>

          {/* 年份筛选 */}
          <div className="rounded-xl bg-white/85 backdrop-blur-md p-3 shadow-lg border border-white/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">年份筛选</span>
              </div>
              {selectedYears.length > 0 && (
                <button
                  onClick={clearYearFilter}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                >
                  清除
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {availableYears.map(year => {
                const selected = selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-emerald-500 text-white shadow'
                        : 'bg-white/70 text-gray-600 hover:bg-white hover:text-emerald-600 border border-gray-100'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
            {selectedYears.length > 0 && (
              <p className="text-[10px] text-gray-500 mt-2">
                已选：{selectedYears.join('、')} 年
              </p>
            )}
          </div>

          <button
            onClick={() => setShowTrajectory(!showTrajectory)}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium shadow-lg border transition-all ${
              showTrajectory
                ? 'bg-rose-500 text-white border-rose-400 hover:bg-rose-600'
                : 'bg-white/85 text-gray-700 border-white/60 hover:bg-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
            </svg>
            {showTrajectory ? '隐藏旅行轨迹' : '显示旅行轨迹'}
          </button>
        </div>
      )}

      {/* 城市照片侧栏 */}
      {selectedCity && (
        <div className="absolute top-20 right-4 bottom-4 z-[1000] w-96 max-w-[90vw] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-800">{selectedCity.city}</h2>
                {cityPhotos.length > 0 && (
                  <span className="text-sm text-emerald-600 font-medium">
                    {getCityDateSummary(cityPhotos)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {selectedCity.province} · {selectedCity.count} 张照片
              </p>
            </div>
            <button
              onClick={() => setSelectedCity(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingPhotos ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500">加载照片中...</p>
              </div>
            ) : cityPhotos.length === 0 ? (
              <p className="text-center text-gray-500 py-12">暂无照片</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[...cityPhotos]
                  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
                  .map(photo => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-gray-200"
                      onClick={() => setLightboxUrl(photo.url)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.filename}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 图片灯箱 - 适应屏幕 */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxUrl}
            alt="预览"
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-[90vh] sm:max-h-[95vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoMapPage;
