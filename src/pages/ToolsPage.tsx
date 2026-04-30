import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const loadTools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tools`);
        const data = await response.json();
        setTools(data);
      } catch (error) {
        console.error('Failed to load tools:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

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
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">返回首页</span>
          </button>
        </div>

        <main className="pt-8 pb-12 px-4 sm:px-6 lg:px-8">
          {/* 工具分类 */}
          {categories.map((category) => (
            <div key={category} className="mb-16">
              {/* 分类标题 */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryGradients[category] || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl">{categoryIcons[category] || '📂'}</span>
                </div>
                <h2 className="text-3xl font-bold text-white">{category}</h2>
              </div>

              {/* 工具卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => window.open(tool.url, '_blank')}
                      className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden"
                    >
                      {/* 顶部渐变条 */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${categoryGradients[category] || 'from-purple-500 to-pink-500'} rounded-t-2xl`}></div>

                      {/* 图标容器 */}
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${categoryGradients[category] || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-3xl">{tool.icon}</span>
                      </div>

                      {/* 工具名称 */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {tool.name}
                      </h3>

                      {/* 工具描述 */}
                      <p className="text-sm text-white/60 leading-relaxed">
                        {tool.description}
                      </p>

                      {/* 悬停箭头 */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
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
