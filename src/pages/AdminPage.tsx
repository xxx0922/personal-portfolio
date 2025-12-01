import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExperiencesManager from '../components/admin/ExperiencesManager';
import ArticlesManager from '../components/admin/ArticlesManager';
import NewsManager from '../components/admin/NewsManager';
import FooterSettingsManager from '../components/admin/FooterSettingsManager';
import SiteConfigManager from '../components/admin/SiteConfigManager';
import SeoSettingsManager from '../components/admin/SeoSettingsManager';
import NavigationManager from '../components/admin/NavigationManager';
import FriendLinksManager from '../components/admin/FriendLinksManager';
import ImageUploader from '../components/ImageUploader';
import FileUploader from '../components/FileUploader';
import FilesManager from '../components/admin/FilesManager';
import AnalyticsManager from '../components/admin/AnalyticsManager';
import TagsManager from '../components/admin/TagsManager';
import SocialMediaManager from '../components/admin/SocialMediaManager';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL.replace('/api', '')}/api`;

interface AdminStats {
  projectCount: number;
  skillCount: number;
  mediaCount: number;
  photoCount: number;
  articleCount: number;
  newsCount: number;
  experienceCount: number;
  documentCount: number;
  messageCount: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>({
    projectCount: 0,
    skillCount: 0,
    mediaCount: 0,
    photoCount: 0,
    articleCount: 0,
    newsCount: 0,
    experienceCount: 0,
    documentCount: 0,
    messageCount: 0
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [projects, skills, media, photos, articles, news, experiences, documents, messages] = await Promise.all([
        fetch(`${API_BASE_URL}/projects`).then(r => r.json()),
        fetch(`${API_BASE_URL}/skills`).then(r => r.json()),
        fetch(`${API_BASE_URL}/media`).then(r => r.json()),
        fetch(`${API_BASE_URL}/photos`).then(r => r.json()),
        fetch(`${API_BASE_URL}/articles`).then(r => r.json()),
        fetch(`${API_BASE_URL}/news`).then(r => r.json()),
        fetch(`${API_BASE_URL}/experiences`).then(r => r.json()),
        fetch(`${API_BASE_URL}/documents`).then(r => r.json()),
        fetch(`${API_BASE_URL}/messages`).then(r => r.json())
      ]);

      setStats({
        projectCount: projects.length,
        skillCount: skills.length,
        mediaCount: media.length,
        photoCount: photos.length,
        articleCount: articles.length,
        newsCount: news.length,
        experienceCount: experiences.length,
        documentCount: documents.length,
        messageCount: messages.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">管理后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，管理员</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 标签导航 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: '概览' },
                { id: 'site-config', label: '网站配置' },
                { id: 'seo-settings', label: 'SEO设置' },
                { id: 'navigation', label: '导航菜单' },
                { id: 'friend-links', label: '友情链接' },
                { id: 'experiences', label: '工作经历' },
                { id: 'articles', label: '博客文章' },
                { id: 'news', label: '新闻动态' },
                { id: 'projects', label: '项目管理' },
                { id: 'skills', label: '技能管理' },
                { id: 'media', label: '媒体管理' },
                { id: 'photos', label: '照片管理' },
                { id: 'documents', label: '文档管理' },
                { id: 'messages', label: '留言管理' },
                { id: 'files', label: '文件管理' },
                { id: 'analytics', label: '访问统计' },
                { id: 'tags', label: '标签管理' },
                { id: 'social', label: '社交媒体' },
                { id: 'personal', label: '个人信息' },
                { id: 'footer', label: 'Footer设置' }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard title="项目数量" value={stats.projectCount} icon="📊" color="blue" />
                <StatCard title="技能数量" value={stats.skillCount} icon="🎯" color="green" />
                <StatCard title="博客文章" value={stats.articleCount} icon="📝" color="purple" />
                <StatCard title="新闻动态" value={stats.newsCount} icon="📰" color="orange" />
                <StatCard title="工作经历" value={stats.experienceCount} icon="💼" color="indigo" />
                <StatCard title="文档数量" value={stats.documentCount} icon="📄" color="yellow" />
                <StatCard title="媒体数量" value={stats.mediaCount} icon="🎬" color="red" />
                <StatCard title="照片数量" value={stats.photoCount} icon="📸" color="pink" />
                <StatCard title="留言数量" value={stats.messageCount} icon="💬" color="teal" />
              </div>
            </div>
          )}

          {activeTab === 'site-config' && <SiteConfigManager />}
          {activeTab === 'seo-settings' && <SeoSettingsManager />}
          {activeTab === 'navigation' && <NavigationManager />}
          {activeTab === 'friend-links' && <FriendLinksManager />}
          {activeTab === 'experiences' && <ExperiencesManager />}
          {activeTab === 'articles' && <ArticlesManager />}
          {activeTab === 'news' && <NewsManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'skills' && <SkillsManager />}
          {activeTab === 'media' && <MediaManager />}
          {activeTab === 'photos' && <PhotosManager />}
          {activeTab === 'documents' && <DocumentsManager />}
          {activeTab === 'messages' && <MessagesManager />}
          {activeTab === 'files' && <FilesManager />}
          {activeTab === 'analytics' && <AnalyticsManager />}
          {activeTab === 'tags' && <TagsManager />}
          {activeTab === 'social' && <SocialMediaManager />}
          {activeTab === 'personal' && <PersonalInfoManager />}
          {activeTab === 'footer' && <FooterSettingsManager />}
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
    teal: 'from-teal-50 to-teal-100 text-teal-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${colorClasses[color].split(' ')[2]}`}>{value}</p>
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
      alert('删除失败');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">项目管理</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 添加项目
        </button>
      </div>

      <div className="space-y-4">
        {projects.map(project => (
          <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-gray-600 mt-1">{project.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <span className="mr-4">角色: {project.role}</span>
                  <span>周期: {project.duration}</span>
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
      alert('保存失败');
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
      alert('删除失败');
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
      alert('保存失败');
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

// 媒体管理组件
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
      alert('删除失败');
    }
  };

  const filteredMedia = filterType === 'all'
    ? media
    : media.filter(m => m.type === filterType);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">媒体管理</h2>
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
      alert('保存失败');
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
              <label className="block text-xs font-medium text-gray-500 mb-1">或输入图片 URL</label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm bg-white"
                placeholder="https://example.com/cover.jpg"
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
      alert('删除失败');
    }
  };

  // 获取所有分类
  const categories = ['all', ...new Set(photos.map(p => p.category).filter(Boolean))];

  // 过滤照片
  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(p => p.category === selectedCategory);

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
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
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
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{photo.category}</span>
                  <span>{photo.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(isAdding || editingPhoto) && (
        <PhotoForm
          photo={editingPhoto}
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
function PhotoForm({ photo, onClose, onSave }: any) {
  const [formData, setFormData] = useState(photo || {
    url: '',
    title: '',
    description: '',
    category: ''
  });

  const categories = ['生活', '工作', '旅行', '风景', '人物', '其他'];

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
      alert('保存失败');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{photo ? '编辑照片' : '添加照片'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">照片</label>
            {formData.url && (
              <div className="mt-2 mb-3 border rounded-lg overflow-hidden">
                <img src={formData.url} alt="预览" className="w-full h-48 object-cover" />
              </div>
            )}
            <ImageUploader
              currentImage={formData.url}
              onUploadSuccess={(url) => setFormData({ ...formData, url: url })}
              label="上传照片"
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">或输入照片 URL（可选）</label>
              <input
                type="url"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border text-sm bg-white"
                placeholder="https://example.com/photo.jpg"
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
function BatchPhotoUploadForm({ onClose, onSave }: any) {
  const [category, setCategory] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const categories = ['生活', '工作', '旅行', '风景', '人物', '其他'];

  const handleBatchSave = async () => {
    if (uploadedPhotos.length === 0) {
      alert('请先上传照片');
      return;
    }
    if (!category) {
      alert('请选择分类');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');

      // 批量创建照片记录
      const promises = uploadedPhotos.map((url, index) =>
        fetch(`${API_BASE_URL}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            url,
            title: `照片 ${new Date().getTime()}-${index + 1}`,
            description: '',
            category
          })
        })
      );

      await Promise.all(promises);
      alert(`成功添加 ${uploadedPhotos.length} 张照片`);
      onSave();
    } catch (error) {
      alert('批量保存失败');
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
              onChange={e => setCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
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
              已上传照片 ({uploadedPhotos.length})
            </label>
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {uploadedPhotos.map((url, index) => (
                  <div key={index} className="relative group">
                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index))}
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
              onUploadSuccess={(url) => setUploadedPhotos([...uploadedPhotos, url])}
              label="批量上传照片（可多次上传）"
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
              disabled={uploading || uploadedPhotos.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              {uploading ? '保存中...' : `保存 ${uploadedPhotos.length} 张照片`}
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
      alert('删除失败');
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
      alert('保存失败');
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
              type="url"
              value={formData.fileUrl}
              onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border bg-white"
              placeholder="https://example.com/document.pdf"
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
      alert('保存成功！');
    } catch (error) {
      alert('保存失败');
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
                  src={personalInfo.avatar}
                  alt={personalInfo.name}
                  className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg mb-4"
                />
                <h3 className="text-2xl font-bold">{personalInfo.name}</h3>
                <p className="text-gray-600">{personalInfo.title}</p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <InfoItem icon="📧" label="邮箱" value={personalInfo.email} />
                <InfoItem icon="📱" label="电话" value={personalInfo.phone} />
                <InfoItem icon="📍" label="位置" value={personalInfo.location} />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">电话</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
              <label className="block text-xs font-medium text-gray-500 mb-1">或输入头像 URL</label>
              <input
                type="url"
                value={formData.avatar}
                onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                required
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
            {formData.photos?.map((photo: string, index: number) => (
              <div key={index} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-200">
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
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
      alert('标记失败');
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
      alert('删除失败');
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
