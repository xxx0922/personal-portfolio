import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
// 默认回退：先取后台配置，无配置时回退到环境变量
const FALLBACK_URL = import.meta.env.VITE_DASHBOARD_URL || '';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardUrl, setDashboardUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 从后台站点配置加载 dashboard URL
    const loadDashboardUrl = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/site-config`);
        if (res.ok) {
          const config = await res.json();
          const url = config?.dashboardUrl || FALLBACK_URL;
          if (url) {
            setDashboardUrl(url);
          } else {
            setError('项目经验链接尚未配置，请在管理后台「网站配置」中设置');
          }
        } else {
          setError('无法读取网站配置');
        }
      } catch (e) {
        const url = FALLBACK_URL;
        if (url) {
          setDashboardUrl(url);
        } else {
          setError('项目经验链接尚未配置，请在管理后台「网站配置」中设置');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardUrl();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回首页</span>
          </button>
        </div>

        {/* 仪表盘容器 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">正在加载项目经验...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md p-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">尚未配置</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && dashboardUrl && (
            <iframe
              src={dashboardUrl}
              className="w-full h-full border-0"
              title="项目经验"
              allow="fullscreen"
            />
          )}
        </div>

        {/* 全屏 + 新窗口打开按钮 */}
        {!isLoading && !error && dashboardUrl && (
          <div className="mt-4 flex justify-end gap-3">
            <a
              href={dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>新窗口打开</span>
            </a>
            <button
              onClick={() => {
                const iframe = document.querySelector('iframe');
                if (iframe?.requestFullscreen) {
                  iframe.requestFullscreen();
                }
              }}
              aria-label="全屏显示"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>全屏显示</span>
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
