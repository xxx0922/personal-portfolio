import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// 多维表格仪表盘 URL - 可以在环境变量中配置
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'https://example.feishu.cn/dashboard';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 检查 URL 是否已配置
    if (!import.meta.env.VITE_DASHBOARD_URL) {
      setError('仪表盘 URL 未配置，请在环境变量中设置 VITE_DASHBOARD_URL');
    }

    // 模拟加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
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
                <p className="mt-4 text-gray-600">正在加载仪表盘...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">仪表盘未配置</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <p className="text-sm text-gray-500">
                  请在 <code className="bg-gray-100 px-2 py-1 rounded">.env</code> 文件中配置 <code className="bg-gray-100 px-2 py-1 rounded">VITE_DASHBOARD_URL</code>
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <iframe
              src={DASHBOARD_URL}
              className="w-full h-full border-0"
              title="多维表格仪表盘"
              onLoad={() => setIsLoading(false)}
              onError={() => setError('无法加载仪表盘，请检查 URL 是否正确')}
            />
          )}
        </div>

        {/* 全屏切换按钮 */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              const iframe = document.querySelector('iframe');
              if (iframe) {
                if (iframe.requestFullscreen) {
                  iframe.requestFullscreen();
                }
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>全屏显示</span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
