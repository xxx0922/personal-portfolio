import { useState, useEffect } from 'react';
import { getProjects, getProjectStats } from '../services/dataService';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ProtectedContent from '../components/ProtectedContent';
import LoginModal from '../components/LoginModal';
import LazyImage from '../components/LazyImage';
import { useSEO } from '../hooks/useSEO';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AchievementsPage = () => {
  const { hasPermission } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, statsData] = await Promise.all([
          getProjects(),
          getProjectStats()
        ]);
        setProjects(projectsData);
        setProjectStats(statsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // SEO优化
  useSEO({
    title: '工作成就 - 项目展示与职业经历',
    description: '记录职业成长历程，展示项目成果与经验积累。包含多个大型项目的开发经验和技术积累。',
    keywords: '项目展示, 工作经历, 技术栈, 项目管理, 软件开发',
    ogTitle: '工作成就 - 项目作品集',
    ogDescription: '查看我的项目作品和职业成就',
  });

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'public') return !project.isPrivate;
    if (filter === 'private') return project.isPrivate;
    return true;
  });

  const handlePrivateProjectClick = (project: Project) => {
    if (project.isPrivate && !hasPermission('view_private_projects')) {
      setShowLoginModal(true);
      return;
    }
    setSelectedProject(project);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">工作成就</h1>
          <p className="text-xl text-primary-100">
            记录职业成长历程，展示项目成果与经验积累
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部项目 ({projects.length})
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'public'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              公开项目 ({projects.filter(p => !p.isPrivate).length})
            </button>
            <ProtectedContent permission="view_private_projects" fallback={
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                私密项目 ({projects.filter(p => p.isPrivate).length}) 🔒
              </button>
            }>
              <button
                onClick={() => setFilter('private')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'private'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                私密项目 ({projects.filter(p => p.isPrivate).length}) 🔒
              </button>
            </ProtectedContent>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            项目业绩统计
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* 年度项目数量统计 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">年度项目统计</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={projectStats.yearly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="projects" fill="#3b82f6" name="总项目数" />
                  <Bar dataKey="completed" fill="#10b981" name="已完成" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 技术栈分布 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">技术栈使用分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectStats.techStack}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStats.techStack.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 项目绩效指标 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">项目绩效评估</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={projectStats.performance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="绩效指标" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">总项目数</p>
                  <p className="text-3xl font-bold mt-2">26</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">已完成</p>
                  <p className="text-3xl font-bold mt-2">21</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">技术栈</p>
                  <p className="text-3xl font-bold mt-2">6+</p>
                </div>
                <div className="text-4xl">⚡</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">客户满意度</p>
                  <p className="text-3xl font-bold mt-2">92%</p>
                </div>
                <div className="text-4xl">⭐</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Project Image */}
              <div className="relative h-48 bg-gray-200">
                {project.images.length > 0 ? (
                  <LazyImage
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📁</span>
                  </div>
                )}

                {/* Privacy Badge */}
                {project.isPrivate && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                    🔒 私密
                  </div>
                )}
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{project.title}</h3>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span className="mr-4">👤 {project.role}</span>
                  <span>📅 {project.duration}</span>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{project.description}</p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Achievements */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">主要成就：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {project.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePrivateProjectClick(project)}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  {project.isPrivate && !hasPermission('view_private_projects') ? '需要登录' : '查看详情'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Project Images Gallery */}
              {selectedProject.images.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">项目图片</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedProject.images.map((image, index) => (
                      <div key={index} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                        <LazyImage
                          src={image}
                          alt={`项目图片 ${index + 1}`}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Details */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">项目详情</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">项目角色：</span>
                      <span>{selectedProject.role}</span>
                    </div>
                    <div>
                      <span className="font-medium">项目周期：</span>
                      <span>{selectedProject.duration}</span>
                    </div>
                    <div>
                      <span className="font-medium">项目状态：</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedProject.isPrivate
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedProject.isPrivate ? '私密项目' : '公开项目'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">技术栈</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">项目描述</h3>
                <p className="text-gray-700 leading-relaxed">{selectedProject.description}</p>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">项目成就</h3>
                <ul className="space-y-2">
                  {selectedProject.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="登录后可查看私密项目内容"
      />
    </div>
  );
};

export default AchievementsPage;