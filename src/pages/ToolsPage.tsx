import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton, { SkeletonToolCard, SkeletonText } from '../components/Skeleton';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  category: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const ToolsPage = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tools`);
        if (!response.ok) throw new Error('获取工具数据失败');
        const data = await response.json();
        setTools(data);
        setError(null);
      } catch (error) {
        console.error('Failed to load tools:', error);
        setError('加载工具数据失败，请检查网络连接后刷新页面');
      } finally {
        setLoading(false);
      }
    };
    loadTools();
  }, []);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // 按分类分组
  const categories = Array.from(new Set(tools.map(t => t.category)));

  const categoryIcons: Record<string, string> = {
    '常用工具': '🔧',
    '计算工具': '📐',
    '转换工具': '🔄',
    '查询工具': '🔍',
    '大模型': '🤖',
    '音频': '🎵',
    '图片': '🎨',
    '视频': '🎬',
    '其他': '📦'
  };

  const categoryGradients: Record<string, string> = {
    '常用工具': 'from-blue-500 to-cyan-500',
    '计算工具': 'from-purple-500 to-pink-500',
    '转换工具': 'from-amber-500 to-orange-500',
    '查询工具': 'from-emerald-500 to-teal-500',
    '大模型': 'from-violet-500 to-purple-500',
    '音频': 'from-rose-500 to-pink-500',
    '图片': 'from-orange-500 to-amber-500',
    '视频': 'from-red-500 to-rose-500',
    '其他': 'from-indigo-500 to-blue-500'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* 星空背景 */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url('/背景星空.png')`,
            }}
          ></div>
        </div>

        {/* 内容 */}
        <div className="relative z-10">
          {/* 返回按钮骨架屏 */}
          <div className="pt-8 px-4 sm:px-6 lg:px-8">
            <Skeleton variant="rounded" width={120} height={36} className="bg-gray-700/30" />
          </div>

          <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
            {/* 页面标题骨架屏 */}
            <div className="text-center mb-16">
              <Skeleton variant="rounded" width={64} height={64} className="bg-gray-700/30 mx-auto mb-4" />
              <Skeleton variant="text" width="200px" height={36} className="bg-gray-600/50 mx-auto mb-4" />
              <Skeleton variant="text" width="300px" height={20} className="bg-gray-700/40 mx-auto" />
            </div>

            {/* 工具卡片骨架屏 - 按分类显示 */}
            <div className="space-y-16">
              {[1, 2].map((categoryIndex) => (
                <div key={categoryIndex}>
                  {/* 分类标题骨架屏 */}
                  <div className="flex items-center gap-4 mb-8">
                    <Skeleton variant="rounded" width={48} height={48} className="bg-gray-700/30" />
                    <Skeleton variant="text" width={120} height={32} className="bg-gray-600/50" />
                  </div>

                  {/* 工具卡片骨架屏 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <SkeletonToolCard key={i} />
                    ))}
                  </div>

                  {/* 分隔线骨架屏 */}
                  <div className="mt-12 h-px bg-gray-700/30"></div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">

      {/* 星空背景 */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('/背景星空.png')`,
          }}
        ></div>
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        {/* 顶部导航栏简化版 */}
        <div className="pt-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
            aria-label="返回首页"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回首页</span>
          </button>
        </div>

        <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          {/* 错误状态 */}
          {error && (
            <div className="rounded-2xl p-12 text-center bg-red-900/30 backdrop-blur-sm border border-red-500/30 mb-8" role="alert">
              <div className="text-6xl mb-4" aria-hidden="true">⚠️</div>
              <h3 className="text-xl font-bold text-red-300 mb-3">加载失败</h3>
              <p className="text-red-200/70 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                重新加载
              </button>
            </div>
          )}

          {/* 空状态 */}
          {!error && tools.length === 0 && (
            <div className="rounded-2xl p-16 text-center bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-8xl mb-6" aria-hidden="true">📦</div>
              <h3 className="text-2xl font-bold text-white mb-4">暂无工具</h3>
              <p className="text-gray-300">
                还没有添加任何工具，请在后台管理中添加
              </p>
            </div>
          )}

          {/* 工具分类 */}
          {categories.map((category) => (
            <div key={category} className="mb-16">
              {/* 分类标题 */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradients[category] || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{categoryIcons[category] || '📂'}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">{category}</h2>
              </div>

              {/* 工具卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => window.open(tool.url, '_blank')}
                      className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      aria-label={`${tool.name}：${tool.description}`}
                    >
                      {/* 顶部渐变条 */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryGradients[category] || 'from-purple-500 to-pink-500'} rounded-t-2xl`}></div>

                      {/* 图标容器 */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${categoryGradients[category] || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
                        <span className="text-3xl">{tool.icon}</span>
                      </div>

                      {/* 工具名称 */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {tool.name}
                      </h3>

                      {/* 工具描述 */}
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {tool.description}
                      </p>

                      {/* 悬停箭头 */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </button>
                  ))}
              </div>

              {/* 分类分隔线 */}
              <div className="mt-12 border-t border-white/10"></div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default ToolsPage;
