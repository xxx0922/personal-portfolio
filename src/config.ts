// API 配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 构建完整的API URL
export const getApiUrl = (path: string) => {
  // 移除路径开头的 /api 如果存在
  const cleanPath = path.replace(/^\/api/, '');
  // 确保 API_BASE_URL 结尾没有斜杠，cleanPath 开头有斜杠
  return `${API_BASE_URL}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
};

// 导出便捷函数
export const apiUrl = {
  // 认证
  login: () => getApiUrl('/auth/login'),

  // 项目
  projects: () => getApiUrl('/projects'),
  projectById: (id: string) => getApiUrl(`/projects/${id}`),

  // 技能
  skills: () => getApiUrl('/skills'),
  skillById: (id: string) => getApiUrl(`/skills/${id}`),

  // 文章
  articles: () => getApiUrl('/articles'),
  articleById: (id: string) => getApiUrl(`/articles/${id}`),

  // 新闻
  news: () => getApiUrl('/news'),
  newsById: (id: string) => getApiUrl(`/news/${id}`),

  // 工作经历
  experiences: () => getApiUrl('/experiences'),
  experienceById: (id: string) => getApiUrl(`/experiences/${id}`),

  // 媒体
  media: () => getApiUrl('/media'),
  mediaById: (id: string) => getApiUrl(`/media/${id}`),

  // 照片
  photos: () => getApiUrl('/photos'),
  photoById: (id: string) => getApiUrl(`/photos/${id}`),

  // 文档
  documents: () => getApiUrl('/documents'),
  documentById: (id: string) => getApiUrl(`/documents/${id}`),

  // 留言
  messages: () => getApiUrl('/messages'),
  messageById: (id: string) => getApiUrl(`/messages/${id}`),
  messageRead: (id: string) => getApiUrl(`/messages/${id}/read`),

  // 个人信息
  personalInfo: () => getApiUrl('/personal-info'),

  // 网站配置
  siteConfig: () => getApiUrl('/site-config'),

  // SEO设置
  seoSettings: () => getApiUrl('/seo-settings'),

  // 导航
  navigation: () => getApiUrl('/navigation'),
  navigationById: (id: string) => getApiUrl(`/navigation/${id}`),

  // 友情链接
  friendLinks: () => getApiUrl('/friend-links'),
  friendLinkById: (id: string) => getApiUrl(`/friend-links/${id}`),

  // 社交媒体
  socialLinks: () => getApiUrl('/social-links'),
  socialLinkById: (id: string) => getApiUrl(`/social-links/${id}`),

  // Footer设置
  footerSettings: () => getApiUrl('/footer-settings'),

  // 文件上传
  upload: () => getApiUrl('/upload'),
  uploadList: () => getApiUrl('/upload/list'),
  uploadDelete: (filename: string) => getApiUrl(`/upload/${filename}`),

  // 统计
  analytics: () => getApiUrl('/analytics'),
};
