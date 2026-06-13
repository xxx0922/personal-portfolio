import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExperiencesManager from '../components/admin/ExperiencesManager';
import ArticlesManager from '../components/admin/ArticlesManager';
import NewsManager from '../components/admin/NewsManager';
import ImageUploader from '../components/ImageUploader';
import FileUploader from '../components/FileUploader';
import FilesManager from '../components/admin/FilesManager';
import TagsManager from '../components/admin/TagsManager';
import SocialMediaManager from '../components/admin/SocialMediaManager';
import SiteConfigManager from '../components/admin/SiteConfigManager';
import SeoSettingsManager from '../components/admin/SeoSettingsManager';
import NavigationManager from '../components/admin/NavigationManager';
import FriendLinksManager from '../components/admin/FriendLinksManager';
import FooterSettingsManager from '../components/admin/FooterSettingsManager';
import ContactImagesManager from '../components/admin/ContactImagesManager';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
// 后端基础 URL（uploads 静态文件服务）
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

interface AdminStats {
  projectCount: number;
  experienceCount: number;
  articleCount: number;
  newsCount: number;
  photoCount: number;
  documentCount: number;
  messageCount: number;
  professionCount: number;
  productCount: number;
  toolCount: number;
  contactImageCount: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    projectCount: 0,
    experienceCount: 0,
    articleCount: 0,
    newsCount: 0,
    photoCount: 0,
    documentCount: 0,
    messageCount: 0,
    professionCount: 0,
    productCount: 0,
    toolCount: 0,
    contactImageCount: 0
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    return () => setToast(null);
  }, []);

  // 获取头像 URL（处理相对路径）
  const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    return `${BACKEND_URL}${avatarPath}`;
  };

  useEffect(() => {
    // 检查是否手动退出登录
    const manuallyLoggedOut = sessionStorage.getItem('manuallyLoggedOut');
    if (manuallyLoggedOut === 'true') {
      navigate('/admin/login');
      return;
    }

    // 检查是否已登录
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // 自动尝试登录
      autoLogin();
      return;
    }

    // 验证 token 是否有效
    fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.user) {
        setIsAuthenticated(true);
        loadStats();
      } else {
        navigate('/admin/login');
      }
    })
    .catch(() => {
      navigate('/admin/login');
    });
  }, [navigate]);

  // 自动登录（使用默认账户）
  const autoLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: import.meta.env.VITE_ADMIN_USERNAME || 'xue', password: import.meta.env.VITE_ADMIN_PASSWORD || 'Xue0922@' })
      });

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        setIsAuthenticated(true);
        loadStats();
      } else {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('自动登录失败:', error);
      navigate('/admin/login');
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [projects, experiences, articles, news, photos, documents, messages, professions, products, tools, contact] = await Promise.all([
        fetch(`${API_BASE_URL}/projects`).then(r => r.json()),
        fetch(`${API_BASE_URL}/experiences`).then(r => r.json()),
        fetch(`${API_BASE_URL}/articles`).then(r => r.json()),
        fetch(`${API_BASE_URL}/news`).then(r => r.json()),
        fetch(`${API_BASE_URL}/photos`).then(r => r.json()),
        fetch(`${API_BASE_URL}/documents`).then(r => r.json()),
        fetch(`${API_BASE_URL}/messages`, { headers }).then(r => {
          if (r.status === 401) return { length: 0 };
          return r.json();
        }),
        fetch(`${API_BASE_URL}/professions`).then(r => r.json()),
        fetch(`${API_BASE_URL}/products`).then(r => r.json()),
        fetch(`${API_BASE_URL}/tools`).then(r => r.json()),
        fetch(`${API_BASE_URL}/contact`, { headers }).then(r => {
          if (r.status === 401) return { images: [] };
          return r.json();
        })
      ]);

      setStats({
        projectCount: projects.length,
        experienceCount: experiences.length,
        articleCount: articles.length,
        newsCount: news.length,
        photoCount: photos.length,
        documentCount: documents.length,
        messageCount: messages.length,
        professionCount: professions.length,
        productCount: products.length,
        toolCount: tools.length,
        contactImageCount: contact?.images?.filter((img: string) => img).length || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    sessionStorage.setItem('manuallyLoggedOut', 'true');
    setIsAuthenticated(false);
    // 立即跳转，避免 useEffect 再次执行
    window.location.href = '/admin/login';
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                title="返回首页"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11L2 5h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h11" />
                </svg>
                <span className="font-medium">返回首页</span>
              </a>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-blue-600">管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，管理员</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Toast 通知 */}
        {toast && (
          <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-medium transition-all duration-300 max-w-md ${
            toast.type === 'success' ? 'bg-emerald-500' :
            toast.type === 'error' ? 'bg-red-500' :
            'bg-sky-500'
          }`} role="alert" aria-live="assertive">
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-4 text-white/80 hover:text-white focus:outline-none"
                aria-label="关闭通知"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        {/* 快捷操作栏 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow rounded-lg mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">快捷操作</span>
            </div>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11L2 5h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h11" />
              </svg>
              返回首页
            </a>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: '概览' },
                { id: 'experiences', label: '工作经历' },
                { id: 'articles', label: '博客文章' },
                { id: 'news', label: '新闻动态' },
                { id: 'projects', label: '项目管理' },
                { id: 'professions', label: '专业管理' },
                { id: 'photos', label: '照片管理' },
                { id: 'documents', label: '文档管理' },
                { id: 'messages', label: '留言管理' },
                { id: 'products', label: '产品管理' },
                { id: 'tools', label: '工具管理' },
                { id: 'files', label: '文件管理' },
                { id: 'tags', label: '标签管理' },
                { id: 'social', label: '社交媒体' },
                { id: 'music', label: '背景音乐' },
                { id: 'personal', label: '个人信息' },
                { id: 'contact', label: '联系我管理' },
                { id: 'siteConfig', label: '🌐 网站配置' },
                { id: 'seo', label: '🔍 SEO 设置' },
                { id: 'navigation', label: '📋 导航管理' },
                { id: 'friendLinks', label: '🔗 友情链接' },
                { id: 'footer', label: '📌 页脚设置' },
                { id: 'contactImages', label: '🖼 联系图片' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">数据概览</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard title="项目数量" value={stats.projectCount} icon="📊" color="blue" />
                <StatCard title="工作经历" value={stats.experienceCount} icon="💼" color="indigo" />
                <StatCard title="博客文章" value={stats.articleCount} icon="📝" color="purple" />
                <StatCard title="新闻动态" value={stats.newsCount} icon="📰" color="orange" />
                <StatCard title="文档数量" value={stats.documentCount} icon="📄" color="yellow" />
                <StatCard title="照片数量" value={stats.photoCount} icon="📸" color="pink" />
                <StatCard title="留言数量" value={stats.messageCount} icon="💬" color="teal" />
                <StatCard title="专业数量" value={stats.professionCount} icon="🎓" color="indigo" />
                <StatCard title="产品数量" value={stats.productCount} icon="📦" color="green" />
                <StatCard title="工具数量" value={stats.toolCount} icon="🔧" color="orange" />
                <StatCard title="联系图片" value={stats.contactImageCount} icon="🖼️" color="rose" />
              </div>
            </div>
          )}

          {activeTab === 'experiences' && <ExperiencesManager />}
          {activeTab === 'articles' && <ArticlesManager />}
          {activeTab === 'news' && <NewsManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'professions' && <ProfessionsManager />}
          {activeTab === 'photos' && <PhotosManager />}
          {activeTab === 'documents' && <DocumentsManager />}
          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'tools' && <ToolsManager />}
          {activeTab === 'files' && <FilesManager />}
          {activeTab === 'tags' && <TagsManager />}
          {activeTab === 'social' && <SocialMediaManager />}
          {activeTab === 'music' && <MusicManager />}
          {activeTab === 'personal' && <PersonalInfoManager />}
          {activeTab === 'contact' && <ContactManager />}
          {activeTab === 'siteConfig' && <SiteConfigManager />}
          {activeTab === 'seo' && <SeoSettingsManager />}
          {activeTab === 'navigation' && <NavigationManager />}
          {activeTab === 'friendLinks' && <FriendLinksManager />}
          {activeTab === 'footer' && <FooterSettingsManager />}
          {activeTab === 'contactImages' && <ContactImagesManager />}
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ title, value, icon, color = 'blue' }: { title: string; value: number; icon: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    green: 'from-green-50 to-green-100 text-green-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
    orange: 'from-orange-50 to-orange-100 text-orange-600',
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
    yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
    red: 'from-red-50 to-red-100 text-red-600',
    pink: 'from-pink-50 to-pink-100 text-pink-600',
    teal: 'from-teal-50 to-teal-100 text-teal-600',
    rose: 'from-rose-50 to-rose-100 text-rose-600'
  };

  const className = colorClasses[color] || colorClasses['blue'];

  return (
    <div className={`bg-gradient-to-br ${className} rounded-lg p-6 shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums ${className.split(' ')[2]}`}>{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

// 项目管理组件
function ProjectsManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProjects();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const handleExport = () => {
    try {
      // 准备导出数据
      const exportData = projects.map((p, index) => ({
        '序号': index + 1,
        '项目名称': p.title,
        '项目年份': p.year || '-',
        '合同金额': p.contractAmount ? `¥${p.contractAmount.toLocaleString()}` : '-',
        '角色': p.role,
        '周期': p.duration,
        '技术栈': Array.isArray(p.technologies) ? p.technologies.join(', ') : '-',
        '项目描述': p.description
      }));

      // 转换为CSV格式
      const headers = Object.keys(exportData[0]);
      const csv = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h]}"`).join(','))
      ].join('\n');

      // 创建并下载文件
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `项目汇总_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } catch (error) {
      showToast('导出失败', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">项目管理</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            导出项目汇总
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + 添加项目
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map(project => (
          <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-gray-600 mt-1">{project.description}</p>
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <div className="flex flex-wrap gap-4">
                    <span>👤 角色: {project.role}</span>
                    <span>⏱️ 周期: {project.duration}</span>
                    {project.year && <span>📅 年份: {project.year}</span>}
                    {project.contractAmount && <span>💰 金额: ¥{project.contractAmount.toLocaleString()}</span>}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProject(project)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(isAdding || editingProject) && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setIsAdding(false);
            setEditingProject(null);
          }}
          onSave={() => {
            loadProjects();
            setIsAdding(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
}

// 项目表单组件
function ProjectForm({ project, onClose, onSave }: any) {
  const [formData, setFormData] = useState(project || {
    title: '',
    description: '',
    role: '',
    duration: '',
    year: '',
    contractAmount: undefined,
    technologies: [],
    images: [],
    attachments: [],
    achievements: [],
    isPrivate: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const url = project
        ? `${API_BASE_URL}/projects/${project.id}`
        : `${API_BASE_URL}/projects`;
      const method = project ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      onSave();
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{project ? '编辑项目' : '添加项目'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">项目标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">项目描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">角色</label>
              <input
                type="text"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">周期</label>
              <input
                type="text"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">项目年份</label>
              <input
                type="text"
                placeholder="例如: 2024"
                value={formData.year || ''}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">合同金额（元）</label>
              <input
                type="number"
                placeholder="例如: 100000"
                value={formData.contractAmount || ''}
                onChange={e => setFormData({ ...formData, contractAmount: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white px-3 py-2 border"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={e => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">私密项目（需要登录查看）</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">项目图片</label>
            {formData.images && formData.images.length > 0 && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                {formData.images.map((img: string, index: number) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Project ${index + 1}`} className="w-full h-32 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, images: formData.images.filter((_: string, i: number) => i !== index) })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUploader
              multiple={true}
              onUploadSuccess={(url) => setFormData({ ...formData, images: [...formData.images, url] })}
              label="上传项目图片"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">项目附件</label>
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-3 flex-1">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                        {attachment.size && (
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        attachments: formData.attachments.filter((_: any, i: number) => i !== index)
                      })}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FileUploader
              onUploadSuccess={(file) => setFormData({
                ...formData,
                attachments: [...(formData.attachments || []), file]
              })}
              label="上传附件文档"
              maxSizeMB={50}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 技能管理组件
function SkillsManager() {
  const [skills, setSkills] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/skills`);
      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个技能吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/skills/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSkills();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  // 按分类分组技能
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || '其他';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">技能管理</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 添加技能
        </button>
      </div>

      {Object.keys(groupedSkills).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无技能数据</p>
          <p className="text-sm mt-2">点击上方按钮添加新技能</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4 text-blue-600">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(categorySkills as any[]).map((skill: any) => (
                  <div key={skill.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{skill.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingSkill(skill)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          className={`h-2 w-8 rounded ${
                            level <= skill.level ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{skill.level}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingSkill) && (
        <SkillForm
          skill={editingSkill}
          onClose={() => {
            setIsAdding(false);
            setEditingSkill(null);
          }}
          onSave={() => {
            loadSkills();
            setIsAdding(false);
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
}

// 技能表单组件
function SkillForm({ skill, onClose, onSave }: any) {
  const [formData, setFormData] = useState(skill || {
    name: '',
    level: 3,
    category: ''
  });

  const categories = [
    '编程语言',
    '前端框架',
    '后端框架',
    '数据库',
    '工具软件',
    '弱电系统',
    '其他'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const url = skill
        ? `${API_BASE_URL}/skills/${skill.id}`
        : `${API_BASE_URL}/skills`;
      const method = skill ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      onSave();
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{skill ? '编辑技能' : '添加技能'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">技能名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              placeholder="例如: React、JavaScript、监控系统"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">技能分类</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              required
            >
              <option value="">请选择分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              熟练程度: {formData.level}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.level}
              onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>初学</span>
              <span>熟悉</span>
              <span>精通</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 影音书籍管理组件
function MediaManager() {
  const [media, setMedia] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'book'>('all');

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/media`);
      const data = await response.json();
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个媒体吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadMedia();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const filteredMedia = filterType === 'all'
    ? media
    : media.filter(m => m.type === filterType);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">影音书籍管理</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1 rounded ${filterType === 'movie' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              电影
            </button>
            <button
              onClick={() => setFilterType('book')}
              className={`px-3 py-1 rounded ${filterType === 'book' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              书籍
            </button>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + 添加媒体
          </button>
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无媒体数据</p>
          <p className="text-sm mt-2">点击上方按钮添加电影或书籍</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map(item => (
            <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{item.type === 'movie' ? '🎬' : '📚'}</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.type === 'movie' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.type === 'movie' ? '电影' : '书籍'}
                  </span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className="text-yellow-400">
                        {star <= item.rating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.review}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags?.map((tag: string, index: number) => (
                    <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{item.date}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingMedia(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingMedia) && (
        <MediaForm
          media={editingMedia}
          onClose={() => {
            setIsAdding(false);
            setEditingMedia(null);
          }}
          onSave={() => {
            loadMedia();
            setIsAdding(false);
            setEditingMedia(null);
          }}
        />
      )}
    </div>
  );
}

// 媒体表单组件
function MediaForm({ media, onClose, onSave }: any) {
  const [formData, setFormData] = useState(media || {
    title: '',
    type: 'movie',
    rating: 5,
    review: '',
    coverImage: '',
    tags: [],
    attachments: []
  });

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t: string) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const url = media
        ? `${API_BASE_URL}/media/${media.id}`
        : `${API_BASE_URL}/media`;
      const method = media ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      onSave();
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{media ? '编辑媒体' : '添加媒体'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">类型</label>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="movie"
                  checked={formData.type === 'movie'}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="mr-2"
                />
                <span>🎬 电影</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="book"
                  checked={formData.type === 'book'}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="mr-2"
                />
                <span>📚 书籍</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              评分: {formData.rating}/5
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="text-3xl focus:outline-none"
                >
                  {star <= formData.rating ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">评价/心得</label>
            <textarea
              value={formData.review}
              onChange={e => setFormData({ ...formData, review: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">封面图片</label>
            {formData.coverImage && (
              <div className="mt-2 mb-3 border rounded-lg overflow-hidden">
                <img src={formData.coverImage} alt="预览" className="w-full h-48 object-cover" />
              </div>
            )}
            <ImageUploader
              currentImage={formData.coverImage}
              onUploadSuccess={(url) => setFormData({ ...formData, coverImage: url })}
              label="上传封面图片"
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">或输入图片 URL（可选）</label>
              <input
                type="text"
                value={formData.coverImage}
                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm bg-white"
                placeholder="https://example.com/cover.jpg 或 /uploads/cover.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="输入标签后回车"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string) => (
                <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-900 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">附件文件</label>
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-3 flex-1">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                        {attachment.size && (
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        attachments: formData.attachments.filter((_: any, i: number) => i !== index)
                      })}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FileUploader
              onUploadSuccess={(file) => setFormData({
                ...formData,
                attachments: [...(formData.attachments || []), file]
              })}
              label="上传媒体附件（如电子书、字幕等）"
              maxSizeMB={50}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 照片管理组件
function PhotosManager() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isBatchAdding, setIsBatchAdding] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/photos`);
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  };

  // 获取完整的图片 URL（用于预览）
  const getPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // 注意：这里使用 localhost:3002 而不是 API_URL，因为 uploads 是静态文件目录
    const backendUrl = BACKEND_URL;
    return `${backendUrl}${url}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这张照片吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/photos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadPhotos();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  // 获取所有分类
  const categories = ['all', ...new Set(photos.map(p => p.category).filter(Boolean))];

  // 获取当前分类下的所有文件夹
  const folders = ['all', ...new Set(
    photos
      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
      .map(p => p.folder)
      .filter(Boolean)
  )];

  // 当分类改变时，重置文件夹选择
  useEffect(() => {
    setSelectedFolder('all');
  }, [selectedCategory]);

  // 过滤照片
  let filteredPhotos = photos;
  if (selectedCategory !== 'all') {
    filteredPhotos = filteredPhotos.filter(p => p.category === selectedCategory);
  }
  if (selectedFolder !== 'all') {
    filteredPhotos = filteredPhotos.filter(p => p.folder === selectedFolder);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">照片管理</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsBatchAdding(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            批量上传
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + 添加照片
          </button>
        </div>
      </div>

      {/* 分类筛选 */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      )}

      {/* 文件夹筛选（当有文件夹数据时显示） */}
      {folders.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <span className="text-sm text-gray-500">文件夹：</span>
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1.5 rounded text-sm ${
                selectedFolder === folder
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {folder === 'all' ? '全部' : folder}
            </button>
          ))}
        </div>
      )}

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无照片数据</p>
          <p className="text-sm mt-2">点击上方按钮添加照片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map(photo => (
            <div key={photo.id} className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                {photo.url ? (
                  <img
                    src={getPreviewUrl(photo.url)}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3E📸%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <span className="text-4xl">📸</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-center text-white p-4">
                  <p className="font-semibold mb-1">{photo.title}</p>
                  {photo.description && (
                    <p className="text-sm text-gray-200 mb-2 line-clamp-2">{photo.description}</p>
                  )}
                  <div className="flex justify-center space-x-2 mt-3">
                    <button
                      onClick={() => setEditingPhoto(photo)}
                      className="bg-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="bg-red-500 px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-white">
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{photo.category}</span>
                    <span>{photo.date}</span>
                  </div>
                  {photo.folder && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-gray-600">{photo.folder}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingPhoto) && (
        <PhotoForm
          photo={editingPhoto}
          allPhotos={photos}
          onClose={() => {
            setIsAdding(false);
            setEditingPhoto(null);
          }}
          onSave={() => {
            loadPhotos();
            setIsAdding(false);
            setEditingPhoto(null);
          }}
        />
      )}

      {isBatchAdding && (
        <BatchPhotoUploadForm
          allPhotos={photos}
          onClose={() => setIsBatchAdding(false)}
          onSave={() => {
            loadPhotos();
            setIsBatchAdding(false);
          }}
        />
      )}
    </div>
  );
}

// 照片表单组件
function PhotoForm({ photo, onClose, onSave, allPhotos = [] }: any) {
  const [formData, setFormData] = useState(photo || {
    url: '',
    title: '',
    description: '',
    category: '',
    folder: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [imageKey, setImageKey] = useState(0); // 用于强制刷新图片
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [customFolder, setCustomFolder] = useState('');

  // 主分类
  const categories = ['生活', '工作', '旅行', '风景', '人物', '活动', '其他'];

  // 根据选中的分类从所有照片中获取已有的文件夹
  const existingFolders = allPhotos
    .filter((p: any) => p.category === formData.category && p.folder)
    .map((p: any) => p.folder)
    .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const url = photo
        ? `${API_BASE_URL}/photos/${photo.id}`
        : `${API_BASE_URL}/photos`;
      const method = photo ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      onSave();
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  // 处理图片上传成功
  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, url });
    setImageKey(prev => prev + 1); // 强制刷新图片
  };

  // 获取完整的图片 URL（用于预览）
  const getPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // 注意：这里使用 localhost:3002 而不是 API_URL，因为 uploads 是静态文件目录
    const backendUrl = BACKEND_URL;
    const fullUrl = `${backendUrl}${url}`;
    return fullUrl;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{photo ? '编辑照片' : '添加照片'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">照片</label>
            {formData.url && (
              <div className="mt-2 mb-3 border-2 border-blue-300 rounded-lg overflow-hidden relative group bg-gray-50">
                <img
                  key={imageKey}
                  src={getPreviewUrl(formData.url)}
                  alt="预览"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24"%3E📸%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                  预览
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, url: '' });
                    setImageKey(prev => prev + 1);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                  title="删除图片"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <ImageUploader
              currentImage={formData.url}
              onUploadSuccess={handleImageUpload}
              label="上传照片"
              showPreview={false}
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">或输入照片 URL（可选）</label>
              <input
                type="text"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm bg-white"
                placeholder="https://example.com/photo.jpg 或 /uploads/photo.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">分类</label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value, folder: '' });
                setShowFolderInput(false);
                setCustomFolder('');
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              required
            >
              <option value="">请选择分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 文件夹选择（子分类） */}
          {formData.category && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">文件夹/活动名称</label>
                <button
                  type="button"
                  onClick={() => setShowFolderInput(!showFolderInput)}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  {showFolderInput ? '选择已有' : '新建文件夹'}
                </button>
              </div>
              {showFolderInput ? (
                <div>
                  <input
                    type="text"
                    value={customFolder}
                    onChange={(e) => {
                      setCustomFolder(e.target.value);
                      setFormData({ ...formData, folder: e.target.value }); // 同时更新 formData.folder
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                    placeholder="输入文件夹/活动名称，如：2025 年会、团队建设"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    照片将归类到：{formData.category} &gt; {customFolder || '未输入'}
                  </p>
                </div>
              ) : (
                <div>
                  <select
                    value={formData.folder || ''}
                    onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                  >
                    <option value="">请选择文件夹（可选）</option>
                    {existingFolders.map((folderName: string) => (
                      <option key={folderName} value={folderName}>{folderName}</option>
                    ))}
                  </select>
                  {formData.folder && (
                    <p className="mt-1 text-xs text-gray-500">
                      照片将归类到：{formData.category} &gt; {formData.folder}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 批量照片上传组件
function BatchPhotoUploadForm({ onClose, onSave, allPhotos = [] }: any) {
  const [category, setCategory] = useState('');
  const [folder, setFolder] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [customFolder, setCustomFolder] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const categories = ['生活', '工作', '旅行', '风景', '人物', '活动', '其他'];

  // 根据选中的分类从所有照片中获取已有的文件夹
  const existingFolders = allPhotos
    .filter((p: any) => p.category === category && p.folder)
    .map((p: any) => p.folder)
    .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

  // 获取完整的图片 URL（用于预览）
  const getPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // 注意：这里使用 localhost:3002 而不是 API_URL，因为 uploads 是静态文件目录
    const backendUrl = BACKEND_URL;
    return `${backendUrl}${url}`;
  };

  // 处理文件选择 - 直接保存文件列表，不立即上传
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    }
  };

  // 移除选中的文件
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // 批量上传并保存
  const handleBatchSave = async () => {
    if (selectedFiles.length === 0) {
      showToast('请先选择照片', 'info');
      return;
    }
    if (!category) {
      showToast('请选择分类', 'info');
      return;
    }
    if (!folder) {
      showToast('请选择或输入文件夹名称', 'info');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');

      // 使用 FormData 批量上传文件
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // 先调用后端批量上传接口
      const uploadResponse = await fetch(`${API_BASE_URL}/upload/multiple`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('上传失败');
      }

      const uploadResult = await uploadResponse.json();
      const uploadedUrls = uploadResult.data.map((item: any) => item.url);

      // 使用批量添加接口一次性保存所有照片记录
      const photosToSave = uploadedUrls.map((url: string, index: number) => ({
        url,
        title: `照片 ${new Date().getTime()}-${index + 1}`,
        description: '',
        category,
        folder // 使用当前选择的文件夹
      }));

      const saveResponse = await fetch(`${API_BASE_URL}/photos/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ photos: photosToSave })
      });

      if (!saveResponse.ok) {
        throw new Error('保存照片记录失败');
      }

      const saveResult = await saveResponse.json();
      showToast(`成功添加 ${saveResult.count} 张照片`, 'success');
      onSave();
    } catch (error) {
      console.error('Batch upload error:', error);
      showToast('批量保存失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">批量上传照片</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择分类</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setFolder('');
                setShowFolderInput(false);
                setCustomFolder('');
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              required
            >
              <option value="">请选择分类</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 文件夹选择（子分类/活动名称） */}
          {category && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">文件夹/活动名称</label>
                <button
                  type="button"
                  onClick={() => setShowFolderInput(!showFolderInput)}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  {showFolderInput ? '选择已有' : '新建文件夹'}
                </button>
              </div>
              {showFolderInput ? (
                <div>
                  <input
                    type="text"
                    value={customFolder}
                    onChange={(e) => {
                      setCustomFolder(e.target.value);
                      setFolder(e.target.value); // 同时更新 folder 状态
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                    placeholder="输入文件夹/活动名称，如：2025 年会、团队建设"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    照片将归类到：{category} &gt; {customFolder || '未输入'}
                  </p>
                </div>
              ) : (
                <div>
                  <select
                    value={folder || ''}
                    onChange={(e) => setFolder(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                  >
                    <option value="">请选择文件夹（可选）</option>
                    {existingFolders.map((folderName: string) => (
                      <option key={folderName} value={folderName}>{folderName}</option>
                    ))}
                  </select>
                  {folder && (
                    <p className="mt-1 text-xs text-gray-500">
                      照片将归类到：{category} &gt; {folder}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择照片 ({selectedFiles.length})
            </label>
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3E📸%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>所有照片将使用相同的分类</li>
              <li>可以多次点击上传按钮添加更多照片</li>
              <li>照片标题将自动生成，保存后可单独编辑</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={uploading}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleBatchSave}
              disabled={uploading || selectedFiles.length === 0 || !category}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              {uploading ? '保存中...' : `保存 ${selectedFiles.length} 张照片`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 文档管理组件
function DocumentsManager() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文档吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadDocuments();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  // 获取所有分类
  const categories = ['all', ...new Set(documents.map(d => d.category).filter(Boolean))];

  // 过滤文档
  const filteredDocuments = selectedCategory === 'all'
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">文档管理</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 添加文档
        </button>
      </div>

      {/* 分类筛选 */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无文档数据</p>
          <p className="text-sm mt-2">点击上方按钮添加文档</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="border rounded-lg p-6 hover:shadow-md transition bg-white">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{doc.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {doc.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>📅 {doc.date}</span>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        📎 查看文件
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingDocument(doc)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">{doc.content}</p>
              </div>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {doc.tags.map((tag: string, index: number) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingDocument) && (
        <DocumentForm
          document={editingDocument}
          onClose={() => {
            setIsAdding(false);
            setEditingDocument(null);
          }}
          onSave={() => {
            loadDocuments();
            setIsAdding(false);
            setEditingDocument(null);
          }}
        />
      )}
    </div>
  );
}

// 文档表单组件
function DocumentForm({ document, onClose, onSave }: any) {
  const [formData, setFormData] = useState(document || {
    title: '',
    category: '',
    content: '',
    fileUrl: '',
    tags: [],
    attachments: []
  });

  const [tagInput, setTagInput] = useState('');

  const categories = ['技术文档', '项目文档', '学习笔记', '工作总结', '其他'];

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t: string) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      const url = document
        ? `${API_BASE_URL}/documents/${document.id}`
        : `${API_BASE_URL}/documents`;
      const method = document ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      onSave();
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{document ? '编辑文档' : '添加文档'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">文档标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">分类</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
                required
              >
                <option value="">请选择分类</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">内容</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border font-mono text-sm"
              placeholder="支持 Markdown 格式"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">文件链接（可选）</label>
            <input
              type="text"
              value={formData.fileUrl}
              onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              placeholder="https://example.com/document.pdf 或 /uploads/document.pdf"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="输入标签后回车"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                添加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string) => (
                <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-900 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文档附件</label>
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {formData.attachments.map((attachment: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex items-center space-x-3 flex-1">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                        {attachment.size && (
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        attachments: formData.attachments.filter((_: any, i: number) => i !== index)
                      })}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}
            <FileUploader
              onUploadSuccess={(file) => setFormData({
                ...formData,
                attachments: [...(formData.attachments || []), file]
              })}
              label="上传文档附件（PDF、Word、Excel等）"
              maxSizeMB={50}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 个人信息管理组件
function PersonalInfoManager() {
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 获取头像 URL（处理相对路径）
  const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }
    return `${BACKEND_URL}${avatarPath}`;
  };

  useEffect(() => {
    loadPersonalInfo();
  }, []);

  const loadPersonalInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/personal-info`);
      const data = await response.json();
      setPersonalInfo(data);
    } catch (error) {
      console.error('Failed to load personal info:', error);
    }
  };

  const handleSave = async (updatedInfo: any) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/personal-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedInfo)
      });
      setPersonalInfo(updatedInfo);
      setIsEditing(false);
      showToast('保存成功！', 'success');
    } catch (error) {
      showToast('保存失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!personalInfo) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">个人信息管理</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            编辑信息
          </button>
        )}
      </div>

      {isEditing ? (
        <PersonalInfoForm
          personalInfo={personalInfo}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          isSaving={isSaving}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 左侧：头像和基本信息 */}
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <img
                  src={getAvatarUrl(personalInfo.avatar)}
                  alt={personalInfo.name}
                  className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg mb-4"
                />
                <h3 className="text-2xl font-bold">{personalInfo.name}</h3>
                <p className="text-gray-600">{personalInfo.title}</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <InfoItem icon="📍" label="位置" value={personalInfo.location} />
                <InfoItem icon="💼" label="职位" value={personalInfo.title} />
              </div>
            </div>

            {/* 右侧：简介和照片 */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="mr-2">📝</span>
                  个人简介
                </h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {personalInfo.bio}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="mr-2">🖼️</span>
                  照片墙 ({personalInfo.photos?.length || 0} 张)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {personalInfo.photos?.map((photo: string, index: number) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 信息项组件
function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

// 个人信息表单组件
function PersonalInfoForm({ personalInfo, onSave, onCancel, isSaving }: any) {
  const [formData, setFormData] = useState(personalInfo);
  const [photoInput, setPhotoInput] = useState('');

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setFormData({
        ...formData,
        photos: [...(formData.photos || []), photoInput.trim()]
      });
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData({
      ...formData,
      photos: formData.photos.filter((_: any, i: number) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">职位</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">位置</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">欢迎语</label>
            <input
              type="text"
              value={formData.welcomeMessage || ''}
              onChange={e => setFormData({ ...formData, welcomeMessage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="欢迎来到我的个人主页。这里展示了我的项目经验、活动瞬间、实用工具和知识文档。"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">头像</label>
            {formData.avatar && (
              <div className="mb-3 flex justify-center">
                <img src={formData.avatar} alt="头像预览" className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover" />
              </div>
            )}
            <ImageUploader
              currentImage={formData.avatar}
              onUploadSuccess={(url) => setFormData({ ...formData, avatar: url })}
              label="上传头像"
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">或输入头像 URL（可选）</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                placeholder="https://example.com/avatar.jpg 或 /uploads/avatar.jpg"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
          <textarea
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">照片墙</label>
          <div className="mb-3">
            <ImageUploader
              multiple={true}
              onUploadSuccess={(url) => setFormData({ ...formData, photos: [...(formData.photos || []), url] })}
              label="上传照片"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">或输入照片 URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={photoInput}
                onChange={e => setPhotoInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddPhoto())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                placeholder="输入照片 URL"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                添加
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {formData.photos?.map((photo: string, index: number) => {
              // 获取完整的图片 URL（用于预览）
              const getPreviewUrl = (url: string) => {
                if (!url) return '';
                if (url.startsWith('http://') || url.startsWith('https://')) {
                  return url;
                }
                const backendUrl = BACKEND_URL;
                return `${backendUrl}${url}`;
              };
              return (
                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-200">
                  <img src={getPreviewUrl(photo)} alt={`Photo ${index + 1}`} className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3E📸%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </form>
  );
}

// 留言管理组件
function MessagesManager() {
  const [messages, setMessages] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/messages/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadMessages();
    } catch (error) {
      showToast('标记失败', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条留言吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadMessages();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true;
    return msg.status === filter;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">留言管理</h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            未读留言: <span className="font-semibold text-red-600">{unreadCount}</span>
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              全部 ({messages.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              未读 ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'read' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              已读 ({messages.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg">暂无留言</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`border rounded-lg p-6 transition ${
                message.status === 'unread'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{message.name}</h3>
                    {message.status === 'unread' && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        未读
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {message.email}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(message.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {message.status === 'unread' && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      标记已读
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">主题：</h4>
                <p className="text-gray-900">{message.subject}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">内容：</h4>
                <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                  {message.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 背景音乐管理组件
function MusicManager() {
  const [settings, setSettings] = useState({
    enabled: false,
    musicList: [] as Array<{ url: string; name: string }>,
    volume: 0.3
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [songName, setSongName] = useState('');
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/site-config/music`);
      if (response.ok) {
        const data = await response.json();
        // 确保 musicList 存在
        if (!data.musicList) {
          data.musicList = [];
        }
        setSettings(data);
      } else {
        // API 失败时设置默认值
        setSettings({
          enabled: false,
          musicList: [],
          volume: 0.3
        });
      }
    } catch (error) {
      console.error('Failed to load music settings:', error);
      // 错误时设置默认值
      setSettings({
        enabled: false,
        musicList: [],
        volume: 0.3
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        showToast('请上传音频文件（MP3、WAV等）', 'info');
        return;
      }
      setCurrentFile(file);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!currentFile) return;
    if (!songName.trim()) {
      showToast('请输入歌曲名称', 'info');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', currentFile);

    try {
      const token = localStorage.getItem('adminToken');

      // Use XMLHttpRequest for progress tracking
      const uploadResult = await new Promise<{ url: string; name: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/upload/file`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress((e.loaded / e.total) * 100);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data.data);
            } catch {
              reject(new Error('Failed to parse response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      setUploadProgress(100);
      const newSong = { url: uploadResult.url, name: songName.trim() };
      const newIndex = settings.musicList.length;
      const updatedSettings = { ...settings, musicList: [...settings.musicList, newSong] };
      setSettings(updatedSettings);
      setLastAddedIndex(newIndex);
      setCurrentFile(null);
      setSongName('');

      // 🔑 自动保存到后端，避免用户忘记点"保存设置"
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          showToast('⚠️ 上传成功但未登录，无法保存。请重新登录管理后台', 'error');
          return;
        }
        const saveResp = await fetch(`${API_BASE_URL}/site-config/music`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedSettings)
        });
        if (saveResp.ok) {
          showToast(`✅ 上传并保存成功！前端已同步 (共 ${newIndex + 1} 首)`, 'success');
        } else if (saveResp.status === 401 || saveResp.status === 403) {
          showToast('⚠️ 上传成功但登录已过期，请重新登录后台后再保存', 'error');
        } else {
          const errText = await saveResp.text();
          showToast(`⚠️ 上传成功但保存失败 (${saveResp.status}): ${errText.slice(0, 80)}`, 'error');
        }
      } catch (e) {
        showToast(`⚠️ 上传成功但保存请求失败: ${(e as Error).message}`, 'error');
      }

      // Clear highlight after 3 seconds
      setTimeout(() => setLastAddedIndex(null), 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(-1); // error state
      showToast('❌ 上传失败: ' + (error as Error).message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('❌ 未登录或登录已过期，请重新登录后台', 'error');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/site-config/music`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        showToast('✅ 保存成功！前端已同步', 'success');
        loadSettings();
      } else if (response.status === 401 || response.status === 403) {
        showToast('❌ 登录已过期，请重新登录管理后台', 'error');
      } else {
        const errText = await response.text();
        showToast(`保存失败 (${response.status}): ${errText.slice(0, 80)}`, 'error');
      }
    } catch (error) {
      showToast('保存失败: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteMusic = (index: number) => {
    if (!confirm('确定要删除这首音乐吗？')) return;

    const updatedList = settings.musicList.filter((_, i) => i !== index);
    setSettings({ ...settings, musicList: updatedList });
    showToast('已删除音乐，请点击"保存设置"按钮保存更改', 'info');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">背景音乐设置</h2>
        <p className="text-gray-600">为网站添加背景音乐，访客可以控制播放/暂停和音量</p>
      </div>

      <div className="space-y-6">
        {/* 启用开关 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-lg font-medium">启用背景音乐</span>
          </label>
          <p className="text-sm text-gray-500 mt-2 ml-8">
            开启后，访客访问网站时会自动播放背景音乐（可通过右下角控制器控制）
          </p>
        </div>

        {/* 音频上传 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">播放列表 ({settings.musicList.length} 首歌曲)</h3>

          {settings.musicList.length > 0 && (
            <div className="mb-6 space-y-3">
              {settings.musicList.map((song, index) => (
                <div key={index} className={`p-4 rounded-lg border transition-all duration-300 ${lastAddedIndex === index ? 'bg-green-50 border-green-400 shadow-lg scale-[1.01]' : 'bg-blue-50 border-blue-200'}`}>
                  {lastAddedIndex === index && (
                    <div className="inline-flex items-center px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full mb-2 animate-pulse">
                      ✨ 刚添加
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-lg font-semibold text-gray-700">#{index + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{song.name}</p>
                        <p className="text-xs text-gray-500 break-all mt-1">{song.url}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMusic(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center ml-4"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      删除
                    </button>
                  </div>
                  <audio controls src={song.url} className="w-full" />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                添加新歌曲到播放列表
              </label>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">歌曲名称</label>
                <input
                  type="text"
                  value={songName}
                  onChange={(e) => setSongName(e.target.value)}
                  placeholder="例如：轻音乐 - 春天"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                支持MP3、WAV、OGG等格式，建议文件大小不超过10MB
              </p>
            </div>

            {currentFile && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-gray-900 truncate">{currentFile.name}</p>
                    <p className="text-xs text-gray-500">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {!isUploading && uploadProgress >= 0 && (
                    <button
                      onClick={handleUpload}
                      disabled={!songName.trim()}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-sm font-medium shadow-sm transition-all"
                    >
                      ⬆️ 添加
                    </button>
                  )}
                </div>

                {/* Upload progress bar */}
                {isUploading && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-blue-600">⏳ 正在上传...</span>
                      <span className="text-sm font-semibold text-blue-700">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload success */}
                {uploadProgress >= 100 && !isUploading && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">✅ 上传完成！已添加到播放列表</span>
                  </div>
                )}

                {/* Upload error */}
                {uploadProgress < 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">上传失败，请重试</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 默认音量设置 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">默认音量</h3>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-medium w-12 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            设置音乐播放的默认音量（访客可以自己调整）
          </p>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
          >
            💾 保存设置
          </button>
        </div>

        {/* 使用说明 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 使用说明</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>支持添加多首歌曲，按顺序循环播放</li>
            <li>访客可以通过右下角的音乐控制器控制播放/暂停、切换歌曲、调整音量</li>
            <li>页面刷新后音乐将重新开始播放</li>
            <li>每首歌曲播放完毕后会自动播放下一首</li>
            <li>建议上传轻柔的背景音乐，避免干扰浏览</li>
            <li>音频文件会存储在服务器上，请确保有足够空间</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 产品分类表单组件
function ProductForm({ product, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    icon: product?.icon || '📦',
    coverImage: product?.coverImage || '',
    shortDescription: product?.shortDescription || '',
    detailedDescription: product?.detailedDescription || '',
    mediaResources: product?.mediaResources || [],
    sortOrder: product?.sortOrder || 0,
    isPublished: product?.isPublished !== false,
    folders: product?.folders || []
  });

  // 富文本编辑器内容
  const [editorContent, setEditorContent] = useState(product?.detailedDescription || '');

  // 树形结构状态
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedSubFolderId, setSelectedSubFolderId] = useState<string | null>(null);

  // 上传状态
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadingName, setUploadingName] = useState('');
  const [uploadingDesc, setUploadingDesc] = useState('');

  // 新建文件夹输入状态
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newSubFolderName, setNewSubFolderName] = useState('');
  const [showNewSubFolderInput, setShowNewSubFolderInput] = useState(false);

  // 媒体资源编辑状态
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [mediaFormData, setMediaFormData] = useState({
    type: 'image' as 'image' | 'video',
    url: '',
    thumbnailUrl: '',
    title: '',
    description: '',
    sortOrder: 0
  });

  // 上传状态
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...product,
      ...formData,
      detailedDescription: editorContent
    });
  };

  // 添加/更新媒体资源
  const handleSaveMedia = () => {
    const newMedia = {
      id: editingMedia?.id || `media-${Date.now()}`,
      ...mediaFormData,
      uploadedAt: new Date().toISOString()
    };

    let updatedResources;
    if (editingMedia) {
      updatedResources = formData.mediaResources.map((m: any) =>
        m.id === editingMedia.id ? newMedia : m
      );
    } else {
      updatedResources = [...formData.mediaResources, newMedia];
    }

    setFormData({ ...formData, mediaResources: updatedResources });
    setShowMediaForm(false);
    setEditingMedia(null);
    setMediaFormData({ type: 'image', url: '', thumbnailUrl: '', title: '', description: '', sortOrder: 0 });
  };

  const handleEditMedia = (media: any) => {
    setEditingMedia(media);
    setMediaFormData({
      type: media.type,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl || '',
      title: media.title || '',
      description: media.description || '',
      sortOrder: media.sortOrder || 0
    });
    setShowMediaForm(true);
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (!confirm('确定要删除这个媒体资源吗？')) return;
    setFormData({
      ...formData,
      mediaResources: formData.mediaResources.filter((m: any) => m.id !== mediaId)
    });
  };

  const handleMoveMedia = (index: number, direction: 'up' | 'down') => {
    const newResources = [...formData.mediaResources];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newResources.length) return;
    [newResources[index], newResources[targetIndex]] = [newResources[targetIndex], newResources[index]];
    setFormData({ ...formData, mediaResources: newResources });
  };

  // 上传媒体文件
  const handleUploadMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('请先登录', 'info');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/products/upload-media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('上传错误:', errorData);
        throw new Error(errorData.error || `上传失败，状态码：${response.status}`);
      }

      const result = await response.json();
      const isVideo = result.data.type === 'video';

      setMediaFormData(prev => ({
        ...prev,
        type: isVideo ? 'video' : 'image',
        url: result.data.url
      }));
    } catch (error) {
      console.error('Upload error:', error);
      showToast(`上传失败：${error instanceof Error ? error.message : '请重试'}`, 'error');
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 上传封面图
  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('请先登录', 'info');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/products/upload-media`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('上传错误:', errorData);
        throw new Error(errorData.error || `上传失败，状态码：${response.status}`);
      }

      const result = await response.json();

      setMediaFormData(prev => ({
        ...prev,
        thumbnailUrl: result.data.url
      }));
    } catch (error) {
      console.error('Upload error:', error);
      showToast(`上传失败：${error instanceof Error ? error.message : '请重试'}`, 'error');
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  // 切换文件夹展开/折叠
  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // 获取文件夹在数组中的索引
  const getFolderIndex = (folderId: string) => {
    return formData.folders.findIndex((f: any) => f.id === folderId);
  };

  // 获取子文件夹在数组中的索引
  const getSubFolderIndex = (folderId: string, subFolderId: string) => {
    const folder = formData.folders.find((f: any) => f.id === folderId);
    if (!folder?.subFolders) return -1;
    return folder.subFolders.findIndex((sf: any) => sf.id === subFolderId);
  };

  // 添加根目录文件夹
  const handleAddRootFolder = () => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName || '新文件夹',
      count: 0,
      attachments: [],
      subFolders: []
    };
    setFormData({
      ...formData,
      folders: [...formData.folders, newFolder]
    });
    setNewFolderName('');
    setShowNewFolderInput(false);
    // 自动展开新文件夹
    setExpandedFolders(new Set([...expandedFolders, newFolder.id]));
  };

  // 添加子文件夹
  const handleAddSubFolder = (parentFolderId: string) => {
    const folderIndex = getFolderIndex(parentFolderId);
    if (folderIndex === -1) return;

    const newSubFolder = {
      id: `subfolder-${Date.now()}`,
      name: newSubFolderName || '新子文件夹',
      count: 0,
      attachments: []
    };

    const newFolders = [...formData.folders];
    if (!newFolders[folderIndex].subFolders) {
      newFolders[folderIndex].subFolders = [];
    }
    newFolders[folderIndex].subFolders.push(newSubFolder);

    setFormData({ ...formData, folders: newFolders });
    setNewSubFolderName('');
    setShowNewSubFolderInput(false);
    // 自动选中新创建的子文件夹
    setSelectedSubFolderId(newSubFolder.id);
    setSelectedFolderId(parentFolderId);
  };

  // 删除根目录文件夹
  const handleDeleteRootFolder = (folderId: string) => {
    if (!confirm('确定要删除这个文件夹及其所有子文件夹吗？')) return;

    setFormData({
      ...formData,
      folders: formData.folders.filter((f: any) => f.id !== folderId)
    });

    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
      setSelectedSubFolderId(null);
    }
  };

  // 删除子文件夹
  const handleDeleteSubFolder = (parentFolderId: string, subFolderId: string) => {
    if (!confirm('确定要删除这个子文件夹吗？')) return;

    const folderIndex = getFolderIndex(parentFolderId);
    if (folderIndex === -1) return;

    const newFolders = [...formData.folders];
    newFolders[folderIndex].subFolders = newFolders[folderIndex].subFolders.filter(
      (sf: any) => sf.id !== subFolderId
    );

    setFormData({ ...formData, folders: newFolders });

    if (selectedSubFolderId === subFolderId) {
      setSelectedSubFolderId(null);
    }
  };

  // 更新文件夹名称
  const updateFolderName = (folderId: string, newName: string) => {
    const folderIndex = getFolderIndex(folderId);
    if (folderIndex === -1) return;

    const newFolders = [...formData.folders];
    newFolders[folderIndex] = { ...newFolders[folderIndex], name: newName };
    setFormData({ ...formData, folders: newFolders });
  };

  // 更新子文件夹名称
  const updateSubFolderName = (parentFolderId: string, subFolderId: string, newName: string) => {
    const folderIndex = getFolderIndex(parentFolderId);
    if (folderIndex === -1) return;

    const subFolderIndex = getSubFolderIndex(parentFolderId, subFolderId);
    if (subFolderIndex === -1) return;

    const newFolders = [...formData.folders];
    newFolders[folderIndex].subFolders[subFolderIndex] = {
      ...newFolders[folderIndex].subFolders[subFolderIndex],
      name: newName
    };
    setFormData({ ...formData, folders: newFolders });
  };

  // 选择文件夹
  const selectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setSelectedSubFolderId(null);
  };

  // 选择子文件夹
  const selectSubFolder = (parentFolderId: string, subFolderId: string) => {
    setSelectedFolderId(parentFolderId);
    setSelectedSubFolderId(subFolderId);
  };

  // 获取当前选中的文件夹和子文件夹
  const getSelectedFolderData = () => {
    if (!selectedFolderId) return null;

    const folder = formData.folders.find((f: any) => f.id === selectedFolderId);
    if (!folder) return null;

    if (selectedSubFolderId) {
      const subFolder = folder.subFolders?.find((sf: any) => sf.id === selectedSubFolderId);
      return { folder, subFolder, isSubFolder: true };
    }

    return { folder, subFolder: null, isSubFolder: false };
  };

  // 删除附件
  const handleDeleteAttachment = async (attachmentId: string) => {
    const selectedData = getSelectedFolderData();
    if (!selectedData || !product?.id) return;

    if (!confirm('确定要删除这个附件吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const { folder, subFolder, isSubFolder } = selectedData;

      // 构建 API URL
      let url: string;
      if (isSubFolder && subFolder) {
        url = `${API_BASE_URL}/products/${product.id}/folders/${folder.id}/subfolders/${subFolder.id}/attachments/${attachmentId}`;
      } else {
        url = `${API_BASE_URL}/products/${product.id}/folders/${folder.id}/attachments/${attachmentId}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        showToast('删除成功', 'success');
        // 从本地状态中移除
        const newFolders = [...formData.folders];
        const folderIdx = newFolders.findIndex(f => f.id === folder.id);
        if (folderIdx !== -1) {
          if (isSubFolder && subFolder) {
            const subFolderIdx = newFolders[folderIdx].subFolders?.findIndex(sf => sf.id === subFolder.id);
            if (subFolderIdx !== -1 && newFolders[folderIdx].subFolders) {
              newFolders[folderIdx].subFolders[subFolderIdx].attachments =
                newFolders[folderIdx].subFolders[subFolderIdx].attachments?.filter((a: any) => a.id !== attachmentId);
            }
          } else {
            newFolders[folderIdx].attachments = newFolders[folderIdx].attachments?.filter((a: any) => a.id !== attachmentId);
          }
        }
        setFormData({ ...formData, folders: newFolders });
      } else {
        showToast('删除失败', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('删除失败', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{product ? '编辑产品分类' : '添加产品分类'}</h3>
            <p className="text-sm text-gray-500 mt-1">管理产品封面、介绍、媒体资源和 Demo 文件</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</span>
                基本信息
              </h4>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                上架
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">图标 Emoji</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2.5 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-center"
                  placeholder="📦"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">产品名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="输入产品名称"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">简短介绍 <span className="text-gray-400 text-xs">(限 120 字，展示在首页卡片)</span></label>
              <textarea
                value={formData.shortDescription}
                onChange={e => setFormData({ ...formData, shortDescription: e.target.value.slice(0, 120) })}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="简短介绍产品..."
                maxLength={120}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.shortDescription?.length || 0}/120</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">封面图</label>
              <div className="flex items-center gap-4">
                {formData.coverImage ? (
                  <div className="relative">
                    <img src={formData.coverImage} alt="封面预览" className="w-48 h-32 object-cover rounded-lg border border-gray-300" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: '' })}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">暂无封面图</div>
                )}
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  placeholder="输入封面图 URL 或上传图片..."
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">排序值</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                min="0"
              />
              <span className="ml-2 text-sm text-gray-500">数值越小越靠前</span>
            </div>
          </div>

          {/* 文件夹管理 - 简单列表展示 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">2</span>
                <h4 className="text-lg font-bold text-gray-900">文件夹管理</h4>
              </div>
              {!showNewFolderInput ? (
                <button
                  type="button"
                  onClick={() => setShowNewFolderInput(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加文件夹
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="文件夹名称"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAddRootFolder()}
                  />
                  <button
                    type="button"
                    onClick={handleAddRootFolder}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    确认
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>

            {/* 文件夹列表 - 简单表格展示 */}
            <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl bg-white">
              {formData.folders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <p className="text-base">暂无文件夹，点击上方"添加文件夹"按钮创建</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">文件夹名称</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">子文件夹</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.folders.map((folder: any) => (
                      <tr key={folder.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📁</span>
                            <input
                              type="text"
                              value={folder.name}
                              onChange={e => updateFolderName(folder.id, e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {folder.subFolders && folder.subFolders.length > 0 ? (
                              folder.subFolders.map((sub: any) => (
                                <span key={sub.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                  <span>📄</span>
                                  <input
                                    type="text"
                                    value={sub.name}
                                    onChange={e => updateSubFolderName(folder.id, sub.id, e.target.value)}
                                    className="w-20 px-1 py-0.5 border border-gray-300 rounded bg-white text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubFolder(folder.id, sub.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                            <button
                              type="button"
                              onClick={() => { setShowNewSubFolderInput(true); selectFolder(folder.id); }}
                              className="text-green-500 hover:text-green-700 text-lg"
                              title="添加子文件夹"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteRootFolder(folder.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 添加子文件夹输入框 */}
            {showNewSubFolderInput && (
              <div className="mt-3 flex items-center gap-2 bg-white border border-gray-200 p-3 rounded-lg">
                <span className="text-sm text-gray-600">添加子文件夹到:</span>
                <span className="text-sm font-medium text-green-600">
                  {formData.folders.find((f: any) => f.id === selectedFolderId)?.name}
                </span>
                <input
                  type="text"
                  value={newSubFolderName}
                  onChange={e => setNewSubFolderName(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="子文件夹名称"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleAddSubFolder(selectedFolderId)}
                />
                <button
                  type="button"
                  onClick={() => handleAddSubFolder(selectedFolderId)}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  确认
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewSubFolderInput(false); setNewSubFolderName(''); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          {/* 媒体资源管理 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</span>
                <h4 className="text-lg font-bold text-gray-900">媒体资源</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingMedia(null);
                  setMediaFormData({ type: 'image', url: '', thumbnailUrl: '', title: '', description: '', sortOrder: formData.mediaResources.length });
                  setShowMediaForm(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加媒体
              </button>
            </div>

            {/* 媒体列表 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.mediaResources.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-base">暂无媒体资源，点击上方"添加媒体"按钮创建</p>
                </div>
              ) : (
                formData.mediaResources.map((media: any, index: number) => (
                  <div
                    key={media.id}
                    className="group relative rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* 预览区域 */}
                    <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
                      {media.type === 'image' ? (
                        media.url ? (
                          <img src={media.url.startsWith('http') ? media.url : `${BACKEND_URL}${media.url}`} alt={media.title || '预览'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )
                      ) : (
                        <div className="relative w-full h-full">
                          {media.thumbnailUrl ? (
                            <img src={media.thumbnailUrl.startsWith('http') ? media.thumbnailUrl : `${BACKEND_URL}${media.thumbnailUrl}`} alt={media.title || '视频封面'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 flex items-center justify-center">
                              <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* 类型标签 */}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                        {media.type === 'image' ? '🖼️ 图片' : '🎬 视频'}
                      </div>
                    </div>

                    {/* 信息区域 */}
                    <div className="p-3">
                      <h5 className="font-medium text-gray-900 truncate">{media.title || '未命名'}</h5>
                      {media.description && (
                        <p className="text-xs text-gray-500 truncate mt-1">{media.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">排序：{media.sortOrder}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveMedia(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="上移"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMedia(index, 'down')}
                            disabled={index === formData.mediaResources.length - 1}
                            className="p-1 text-gray-400 hover:text-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="下移"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditMedia(media)}
                            className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                            title="编辑"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(media.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="删除"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 详细描述 - 富文本编辑器 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">4</span>
              <h4 className="text-lg font-bold text-gray-900">详细描述</h4>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white font-mono text-sm"
                placeholder="输入产品的详细描述（支持 Markdown 格式）..."
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 支持 Markdown 语法，可使用 **粗体**、*斜体*、- 列表、`代码` 等格式
              </p>
            </div>
          </div>

          {/* 附件上传区域 */}
          {getSelectedFolderData() && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">5</span>
                <h4 className="text-lg font-bold text-gray-900">
                  附件管理 - {getSelectedFolderData()?.subFolder?.name || getSelectedFolderData()?.folder?.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                📍 当前位置：
                <span className="font-medium">{getSelectedFolderData()?.folder?.name}</span>
                {getSelectedFolderData()?.subFolder && (
                  <>
                    {' → '}
                    <span className="font-medium text-purple-600">{getSelectedFolderData()?.subFolder?.name}</span>
                  </>
                )}
              </p>

              {/* 上传附件表单 */}
              <div className="bg-white rounded-xl p-5 mb-5 border border-gray-200 shadow-sm">
                <h5 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  上传附件到 {getSelectedFolderData()?.subFolder?.name || getSelectedFolderData()?.folder?.name}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">附件名称</label>
                    <input
                      type="text"
                      value={uploadingName}
                      onChange={(e) => setUploadingName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      placeholder="留空则使用文件名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">文件选择</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadingFile(e.target.files ? e.target.files[0] : null)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">支持任意文件格式，最大 50MB</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">描述</label>
                  <textarea
                    value={uploadingDesc}
                    onChange={(e) => setUploadingDesc(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                    placeholder="附件描述（可选）"
                  />
                </div>
                {uploadingFile && (
                  <div className="mt-4 flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-purple-900">{uploadingFile.name}</span>
                      <span className="text-xs text-purple-600">({(uploadingFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('上传功能需要后端 API 支持', 'info')}
                      className="flex items-center gap-2 bg-purple-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      上传
                    </button>
                  </div>
                )}
              </div>

              {/* 已上传附件列表 */}
              <div>
                <h5 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  已上传附件
                </h5>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  {(() => {
                    const selectedData = getSelectedFolderData();
                    const attachments = selectedData?.isSubFolder
                      ? selectedData?.subFolder?.attachments || []
                      : selectedData?.folder?.attachments || [];

                    if (attachments.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-400">
                          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm">暂无附件</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {attachments.map((attachment: any, idx: number) => (
                          <div
                            key={attachment.id || idx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {attachment.mimeType?.includes('pdf') ? '📕' :
                                 attachment.mimeType?.includes('image') ? '🖼️' :
                                 attachment.mimeType?.includes('video') ? '🎬' :
                                 attachment.mimeType?.includes('excel') ? '📗' :
                                 attachment.mimeType?.includes('word') ? '📘' : '📄'}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                                {attachment.description && (
                                  <p className="text-xs text-gray-500">{attachment.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="删除附件"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* 底部按钮 */}
          <div className="flex justify-end items-center gap-3 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              保存
            </button>
          </div>

          {/* 媒体资源编辑弹窗 */}
          {showMediaForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingMedia ? '编辑媒体资源' : '添加媒体资源'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => { setShowMediaForm(false); setEditingMedia(null); }}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* 媒体类型选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">媒体类型</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={mediaFormData.type === 'image'}
                          onChange={() => setMediaFormData({ ...mediaFormData, type: 'image' })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="flex items-center gap-1 text-gray-700">
                          <span className="text-xl">🖼️</span> 图片
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={mediaFormData.type === 'video'}
                          onChange={() => setMediaFormData({ ...mediaFormData, type: 'video' })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="flex items-center gap-1 text-gray-700">
                          <span className="text-xl">🎬</span> 视频
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* 上传区域 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {mediaFormData.type === 'image' ? '上传图片' : '上传视频'}
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={mediaFormData.type === 'image' ? 'image/*' : 'video/*'}
                      onChange={handleUploadMediaFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingMedia}
                      className="w-full flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingMedia ? (
                        <>
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-3"></div>
                          <span className="text-sm text-gray-600">上传中...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-purple-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-700 font-medium">
                            点击选择{mediaFormData.type === 'image' ? '图片' : '视频'}或拖拽至此
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            支持 {mediaFormData.type === 'image' ? 'JPG, PNG, WebP, GIF' : 'MP4, WebM, Ogg'} 格式，最大 50MB
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 预览区域 */}
                  {mediaFormData.url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">预览</label>
                      <div className="rounded-lg overflow-hidden border border-gray-200 max-h-64 bg-gray-50 relative">
                        {mediaFormData.type === 'image' ? (
                          <img src={mediaFormData.url.startsWith('http') ? mediaFormData.url : `${BACKEND_URL}${mediaFormData.url}`} alt="预览" className="w-full h-full object-cover" />
                        ) : (
                          <video src={mediaFormData.url.startsWith('http') ? mediaFormData.url : `${BACKEND_URL}${mediaFormData.url}`} controls className="w-full h-full" />
                        )}
                        <button
                          type="button"
                          onClick={() => setMediaFormData({ ...mediaFormData, url: '' })}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 在线 URL 输入（可选） */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      或使用在线 URL（可选）
                    </label>
                    <input
                      type="text"
                      value={mediaFormData.url}
                      onChange={e => setMediaFormData({ ...mediaFormData, url: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      placeholder={mediaFormData.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/video.mp4'}
                    />
                  </div>

                  {/* 视频封面图（仅视频类型） */}
                  {mediaFormData.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">视频封面图（可选）</label>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadThumbnail}
                        className="hidden"
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => thumbnailInputRef.current?.click()}
                          disabled={uploadingThumbnail}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition disabled:opacity-50"
                        >
                          {uploadingThumbnail ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                              <span className="text-sm">上传中...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">上传封面</span>
                            </>
                          )}
                        </button>
                        <input
                          type="text"
                          value={mediaFormData.thumbnailUrl}
                          onChange={e => setMediaFormData({ ...mediaFormData, thumbnailUrl: e.target.value })}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                          placeholder="或输入封面 URL"
                        />
                      </div>
                      {mediaFormData.thumbnailUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-h-32">
                          <img src={mediaFormData.thumbnailUrl.startsWith('http') ? mediaFormData.thumbnailUrl : `${BACKEND_URL}${mediaFormData.thumbnailUrl}`} alt="封面预览" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 标题和描述 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                      <input
                        type="text"
                        value={mediaFormData.title}
                        onChange={e => setMediaFormData({ ...mediaFormData, title: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        placeholder="媒体标题"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">排序值</label>
                      <input
                        type="number"
                        value={mediaFormData.sortOrder}
                        onChange={e => setMediaFormData({ ...mediaFormData, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                    <textarea
                      value={mediaFormData.description}
                      onChange={e => setMediaFormData({ ...mediaFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      placeholder="媒体描述（可选）"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowMediaForm(false); setEditingMedia(null); }}
                    className="flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMedia}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {editingMedia ? '更新' : '添加'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// 专业管理组件
function ProfessionsManager() {
  const [professions, setProfessions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProfession, setEditingProfession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessions();
  }, []);

  const loadProfessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/professions`);
      const data = await response.json();
      setProfessions(data);
    } catch (error) {
      console.error('Failed to load professions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个专业吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/professions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProfessions();
    } catch (error) {
      showToast('删除失败', 'error');
    }
  };

  const handleSave = async (profession: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = profession.id
        ? `${API_BASE_URL}/professions/${profession.id}`
        : `${API_BASE_URL}/professions`;
      const method = profession.id ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profession)
      });

      loadProfessions();
      setIsAdding(false);
      setEditingProfession(null);
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">专业管理</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 添加专业
        </button>
      </div>

      {professions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无专业数据</p>
          <p className="text-sm mt-2">点击上方按钮添加专业</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professions.map(profession => (
            <div key={profession.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{profession.icon}</div>
              <h3 className="text-xl font-bold mb-2">{profession.name}</h3>
              <p className="text-gray-600 mb-4">{profession.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                技能数量：{profession.skills?.length || 0}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProfession(profession)}
                  className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(profession.id)}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingProfession) && (
        <ProfessionForm
          profession={editingProfession}
          onClose={() => {
            setIsAdding(false);
            setEditingProfession(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// 专业表单组件
function ProfessionForm({ profession, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: profession?.name || '',
    description: profession?.description || '',
    icon: profession?.icon || '🎓',
    skills: profession?.skills || [],
    certifications: profession?.certifications || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...profession, ...formData });
  };

  const handleAddSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { id: Date.now().toString(), name: '新技能', level: 3 }]
    });
  };

  const handleRemoveSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_: any, i: number) => i !== index)
    });
  };

  const handleUpdateSkill = (index: number, field: string, value: any) => {
    const updated = formData.skills.map((skill: any, i: number) =>
      i === index ? { ...skill, [field]: value } : skill
    );
    setFormData({ ...formData, skills: updated });
  };

  const handleAddCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, { id: Date.now().toString(), name: '新证书', date: '' }]
    });
  };

  const handleRemoveCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_: any, i: number) => i !== index)
    });
  };

  const handleUpdateCertification = (index: number, field: string, value: any) => {
    const updated = formData.certifications.map((cert: any, i: number) =>
      i === index ? { ...cert, [field]: value } : cert
    );
    setFormData({ ...formData, certifications: updated });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">
          {profession ? '编辑专业' : '添加专业'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">图标</label>
            <input
              type="text"
              value={formData.icon}
              onChange={e => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="🎓"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">专业名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="计算机网络技术"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">专业描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="专业描述..."
              required
            />
          </div>

          {/* 技能列表 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">技能列表</label>
            {formData.skills.map((skill: any, index: number) => (
              <div key={skill.id || index} className="flex items-center gap-2 mb-2 p-2 border rounded">
                <input
                  type="text"
                  value={skill.name}
                  onChange={e => handleUpdateSkill(index, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  placeholder="技能名称"
                />
                <select
                  value={skill.level}
                  onChange={e => handleUpdateSkill(index, 'level', parseInt(e.target.value))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="1">⭐</option>
                  <option value="2">⭐⭐</option>
                  <option value="3">⭐⭐⭐</option>
                  <option value="4">⭐⭐⭐⭐</option>
                  <option value="5">⭐⭐⭐⭐⭐</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSkill}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + 添加技能
            </button>
          </div>

          {/* 证书列表 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">证书列表</label>
            {formData.certifications.map((cert: any, index: number) => (
              <div key={cert.id || index} className="flex items-center gap-2 mb-2 p-2 border rounded">
                <input
                  type="text"
                  value={cert.name}
                  onChange={e => handleUpdateCertification(index, 'name', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  placeholder="证书名称"
                />
                <input
                  type="date"
                  value={cert.date}
                  onChange={e => handleUpdateCertification(index, 'date', e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCertification}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              + 添加证书
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 产品管理组件
function ProductsManager() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个产品分类吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除失败');
      }

      await loadProducts();
    } catch (error: any) {
      console.error('删除失败:', error);
      showToast(`删除失败：${error.message || '请检查是否已登录'}`, 'error');
    }
  };

  const handleSave = async (product: any) => {
    try {
      const token = localStorage.getItem('adminToken');

      // 检查是否已登录
      if (!token) {
        showToast('请先登录！即将跳转到登录页面...', 'info');
        navigate('/admin/login');
        return;
      }

      const url = product.id
        ? `${API_BASE_URL}/products/${product.id}`
        : `${API_BASE_URL}/products`;
      const method = product.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('错误响应:', errorData);

        // 特殊错误处理
        if (errorData.error === 'Invalid or expired token') {
          showToast('登录已过期，请重新登录！', 'error');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          navigate('/admin/login');
          return;
        }

        throw new Error(errorData.error || '保存失败');
      }

      const result = await response.json();

      await loadProducts();
      setIsAdding(false);
      setEditingProduct(null);
      showToast('✅ 保存成功！', 'success');
    } catch (error: any) {
      console.error('保存失败:', error);
      showToast(`❌ 保存失败：${error.message || '请检查是否已登录'}`, 'error');
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">产品管理</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 添加产品分类
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无产品数据</p>
          <p className="text-sm mt-2">点击上方按钮添加产品分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{product.icon}</div>
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                文件夹数量：{product.folders?.length || 0}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setIsAdding(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// 工具管理组件
function ToolsManager() {
  const [tools, setTools] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadTools();
    loadCategories();
  }, []);

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

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/utils/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个工具吗？')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        showToast('请先登录管理后台', 'info');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        loadTools();
      } else {
        const data = await response.json();
        showToast(`删除失败：${data.error || '未知错误'}`, 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('删除失败，请检查网络连接', 'error');
    }
  };

  const handleSave = async (tool: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = tool.id
        ? `${API_BASE_URL}/tools/${tool.id}`
        : `${API_BASE_URL}/tools`;
      const method = tool.id ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(tool)
      });

      loadTools();
      loadCategories();
      setIsAdding(false);
      setEditingTool(null);
    } catch (error) {
      showToast('保存失败', 'error');
    }
  };

  const filteredTools = filterCategory === 'all'
    ? tools
    : tools.filter(t => t.category === filterCategory);

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">工具管理</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 添加工具
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded ${filterCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded ${filterCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">暂无工具数据</p>
          <p className="text-sm mt-2">点击上方按钮添加工具</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map(tool => (
            <div key={tool.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
              <p className="text-gray-600 mb-2">{tool.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded">{tool.category}</span>
              </div>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm block mb-4"
              >
                {tool.url}
              </a>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingTool(tool)}
                  className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingTool) && (
        <ToolForm
          tool={editingTool}
          onClose={() => {
            setIsAdding(false);
            setEditingTool(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// 工具表单组件
function ToolForm({ tool, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: tool?.name || '',
    description: tool?.description || '',
    icon: tool?.icon || '🔧',
    url: tool?.url || '',
    category: tool?.category || '模型'
  });

  const categories = ['模型', '编程', '视频', '音频', '图片', '其他'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...tool, ...formData });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{tool ? '编辑工具' : '添加工具'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图标</label>
            <input
              type="text"
              value={formData.icon}
              onChange={e => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="🔧"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">工具名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">工具链接</label>
            <input
              type="text"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="/tools/ip-calculator"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 联系我管理组件
function ContactManager() {
  const [contact, setContact] = useState<any>({
    email: '',
    phone: '',
    wechat: '',
    qq: '',
    telegram: '',
    whatsapp: '',
    other: '',
    location: '',
    images: [
      { url: '', label: '抖音' },
      { url: '', label: '公众号' },
      { url: '', label: '小红书' },
      { url: '', label: '微信' }
    ]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadContact();
  }, []);

  const loadContact = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`);
      const data = await response.json();
      setContact(data);
    } catch (error) {
      console.error('Failed to load contact info:', error);
    }
  };

  const handleSave = async (updatedContact: any) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/contact`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedContact)
      });
      setContact(updatedContact);
      setIsEditing(false);
      showToast('保存成功！', 'success');
    } catch (error) {
      showToast('保存失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!contact) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">联系我管理</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            编辑信息
          </button>
        )}
      </div>

      {isEditing ? (
        <ContactForm
          contact={contact}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          isSaving={isSaving}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ContactItem icon="📧" label="邮箱" value={contact.email} />
            <ContactItem icon="📱" label="电话" value={contact.phone} />
            <ContactItem icon="💬" label="微信" value={contact.wechat} />
            <ContactItem icon="🐧" label="QQ" value={contact.qq} />
            <ContactItem icon="✈️" label="Telegram" value={contact.telegram} />
            <ContactItem icon="📞" label="WhatsApp" value={contact.whatsapp} />
            <ContactItem icon="🔗" label="其他" value={contact.other} />
            <ContactItem icon="📍" label="所在地" value={contact.location} />
          </div>

          {/* 图片展示区域 */}
          {contact.images && contact.images.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">联系图片</h3>
              <div className="grid grid-cols-4 gap-4">
                {contact.images.map((img: { url: string; label: string }, index: number) => (
                  img.url && (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={img.url.startsWith('/') ? `${BACKEND_URL}${img.url}` : img.url}
                        alt={`联系图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 py-2 text-center">
                        <p className="text-white font-semibold text-base">{img.label}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 联系信息项组件
function ContactItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

// 联系信息表单组件
function ContactForm({ contact, onSave, onCancel, isSaving }: any) {
  const [formData, setFormData] = useState(contact);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // 获取完整的图片 URL
  const getImageUrl = (img: { url: string; label: string } | string) => {
    if (!img) return '';
    const url = typeof img === 'string' ? img : img.url;
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${BACKEND_URL}${url}`;
  };

  // 处理图片上传
  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const token = localStorage.getItem('adminToken');
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload/file`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        const newImages = [...(formData.images || [])];
        // 保持标签，只更新 URL
        if (newImages[index]) {
          newImages[index] = { ...newImages[index], url: data.data.url };
        } else {
          newImages[index] = { url: data.data.url, label: `图片${index + 1}` };
        }
        setFormData({ ...formData, images: newImages });
      } else {
        showToast('上传失败', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('上传失败', 'error');
    } finally {
      setUploadingIndex(null);
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = { url: '', label: newImages[index]?.label || '' };
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">电话</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">微信</label>
            <input
              type="text"
              value={formData.wechat || ''}
              onChange={e => setFormData({ ...formData, wechat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">QQ</label>
            <input
              type="text"
              value={formData.qq || ''}
              onChange={e => setFormData({ ...formData, qq: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telegram</label>
            <input
              type="text"
              value={formData.telegram || ''}
              onChange={e => setFormData({ ...formData, telegram: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
            <input
              type="text"
              value={formData.whatsapp || ''}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">其他联系方式</label>
            <input
              type="text"
              value={formData.other || ''}
              onChange={e => setFormData({ ...formData, other: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="其他联系方式或备注"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">所在地区</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="例如：中国·北京"
            />
          </div>
        </div>

        {/* 图片上传区域 */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">联系图片（1:1 比例）</h3>
          <p className="text-sm text-gray-500 mb-4">建议上传 1:1 正方形图片，最多 4 张</p>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 relative group">
                {formData.images?.[index]?.url ? (
                  <>
                    <img
                      src={getImageUrl(formData.images[index])}
                      alt={`图片 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        删除
                      </button>
                      <label className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm cursor-pointer">
                        更换
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(index, file);
                          }}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">上传图片</span>
                    {uploadingIndex === index && (
                      <span className="text-xs text-blue-500 mt-1">上传中...</span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
          {/* 标签编辑区域 */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index}>
                <label className="block text-xs text-gray-500 mb-1">图片{index + 1} 标签</label>
                <input
                  type="text"
                  value={formData.images?.[index]?.label || ''}
                  onChange={(e) => {
                    const newImages = [...(formData.images || [])];
                    if (newImages[index]) {
                      newImages[index] = { ...newImages[index], label: e.target.value };
                    } else {
                      newImages[index] = { url: '', label: e.target.value };
                    }
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder={`图片${index + 1}标签`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSaving}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </form>
  );
}
