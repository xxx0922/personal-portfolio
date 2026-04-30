import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface PagePreview {
  path: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const pagePreviews: PagePreview[] = [
  {
    path: '/',
    name: '首页',
    description: '个人主页，展示个人风采、专业技能和精彩瞬间',
    icon: '🏠',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    path: '/about',
    name: '关于我',
    description: '详细的个人介绍和经历',
    icon: '👤',
    color: 'from-purple-500 to-pink-500'
  },
  {
    path: '/achievements',
    name: '工作成就',
    description: '项目展示和成果、技术栈展示',
    icon: '💼',
    color: 'from-green-500 to-emerald-500'
  },
  {
    path: '/lifestyle',
    name: '娱乐生活',
    description: '电影推荐、图书推荐、摄影作品',
    icon: '🎬',
    color: 'from-orange-500 to-red-500'
  },
  {
    path: '/knowledge',
    name: '知识库',
    description: '学习文档、法律法规、技术资料',
    icon: '📚',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    path: '/blog',
    name: '博客',
    description: '个人博客文章',
    icon: '📝',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    path: '/news',
    name: '动态',
    description: '最新动态和新闻',
    icon: '📰',
    color: 'from-red-500 to-pink-500'
  },
  {
    path: '/products',
    name: '产品展示',
    description: '产品目录和详情',
    icon: '🛍️',
    color: 'from-pink-500 to-rose-500'
  },
  {
    path: '/professions',
    name: '专业领域',
    description: '专业技能和领域展示',
    icon: '🎯',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    path: '/tools',
    name: '工具集',
    description: '实用工具集合',
    icon: '🛠️',
    color: 'from-gray-500 to-slate-500'
  },
  {
    path: '/quadrant',
    name: '四象限',
    description: '四象限分析展示',
    icon: '📊',
    color: 'from-violet-500 to-purple-500'
  },
  {
    path: '/photos',
    name: '相册',
    description: '摄影作品和照片展示',
    icon: '📷',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    path: '/dashboard',
    name: '仪表盘',
    description: '数据统计和仪表盘',
    icon: '📈',
    color: 'from-emerald-500 to-green-500'
  },
  {
    path: '/search',
    name: '搜索',
    description: '全站搜索功能',
    icon: '🔍',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    path: '/admin/login',
    name: '管理后台',
    description: '内容管理后台登录',
    icon: '🔐',
    color: 'from-slate-600 to-gray-700'
  }
];

const PreviewPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎨 网站预览
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            点击下方任意卡片，预览网站的各个页面
          </p>
        </div>

        {/* 预览卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {pagePreviews.map((page, index) => (
            <Link
              key={page.path}
              to={page.path}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* 渐变背景 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* 卡片内容 */}
              <div className="relative p-6">
                {/* 图标 */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${page.color} flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {page.icon}
                </div>

                {/* 页面名称 */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {page.name}
                </h3>

                {/* 页面描述 */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {page.description}
                </p>

                {/* 路径显示 */}
                <div className="mt-4 flex items-center text-xs text-gray-400">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {page.path}
                  </span>
                </div>

                {/* 箭头指示 */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 统计信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 网站统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">{pagePreviews.length}</div>
              <div className="text-gray-600">页面总数</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-500 mb-2">15+</div>
              <div className="text-gray-600">组件数量</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">React 19</div>
              <div className="text-gray-600">框架版本</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">TypeScript</div>
              <div className="text-gray-600">开发语言</div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">🚀 快速开始</h2>
          <p className="mb-6 opacity-90">
            确保前端和后端服务都已启动，然后点击上方卡片预览各个页面
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              🌐 访问首页
            </a>
            <a
              href="http://localhost:5173/admin/login"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              🔐 管理后台
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PreviewPage;
