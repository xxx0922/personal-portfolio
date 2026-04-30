import { useState, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  topPages: Array<{ path: string; views: number }>;
  recentVisits: Array<{
    id: string;
    path: string;
    timestamp: string;
    ip?: string;
    userAgent?: string;
  }>;
}

export default function AnalyticsManager() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    todayViews: 0,
    weekViews: 0,
    topPages: [],
    recentVisits: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // 使用模拟数据用于演示
      setAnalytics({
        totalViews: 12580,
        todayViews: 156,
        weekViews: 982,
        topPages: [
          { path: '/', views: 3245 },
          { path: '/blog', views: 2156 },
          { path: '/about', views: 1534 },
          { path: '/projects', views: 1298 },
          { path: '/news', views: 845 }
        ],
        recentVisits: [
          { id: '1', path: '/', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
          { id: '2', path: '/blog', timestamp: new Date(Date.now() - 300000).toISOString(), ip: '192.168.1.2' },
          { id: '3', path: '/about', timestamp: new Date(Date.now() - 600000).toISOString(), ip: '192.168.1.3' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">访问统计</h2>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">总访问量</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">今日访问</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics.todayViews.toLocaleString()}</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">本周访问</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{analytics.weekViews.toLocaleString()}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* 热门页面 */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">热门页面</h3>
          <div className="space-y-3">
            {analytics.topPages.map((page, index) => (
              <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800">{page.path}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-blue-600">{page.views.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">次访问</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近访问 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">最近访问</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">访问页面</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">时间</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">IP地址</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{visit.path}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(visit.timestamp)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{visit.ip || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">💡 提示：</p>
          <p>此功能需要后端实现访问统计API。当前显示的是演示数据。</p>
          <p className="mt-1">建议集成 Google Analytics 或实现自定义统计系统。</p>
        </div>
      </div>
    </div>
  );
}
