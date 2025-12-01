/**
 * 数据服务层 - 统一数据获取接口
 *
 * 从后端API获取数据
 */

import {
  personalInfo as mockPersonalInfo,
  skills as mockSkills,
  projects as mockProjects,
  projectStats as mockProjectStats,
  mediaItems as mockMediaItems,
  photos as mockPhotos,
  documents as mockDocuments,
  regulations as mockRegulations
} from '../data/mockData';

// 标记：是否使用后端API
const USE_BACKEND_API = true; // 使用后端API

// API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// ============ 个人信息相关 ============
export const getPersonalInfo = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/personal-info`);
      if (!response.ok) throw new Error('Failed to fetch personal info');
      return await response.json();
    } catch (error) {
      console.error('Error fetching personal info:', error);
      return mockPersonalInfo; // 降级到mockData
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPersonalInfo;
};

// ============ 技能相关 ============
export const getSkills = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/skills`);
      if (!response.ok) throw new Error('Failed to fetch skills');
      const data = await response.json();
      return data.length > 0 ? data : mockSkills; // 如果后端无数据，使用mockData
    } catch (error) {
      console.error('Error fetching skills:', error);
      return mockSkills;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockSkills;
};

// ============ 项目相关 ============
export const getProjects = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      return data.length > 0 ? data : mockProjects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return mockProjects;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockProjects;
};

export const getProjectById = async (id: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project:', error);
      const projects = await getProjects();
      return projects.find((p: any) => p.id === id);
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockProjects.find((p: any) => p.id === id);
};

export const getProjectStats = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      // 如果后端有数据就用后端的，否则用mockData
      return data.yearly && data.yearly.length > 0 ? data : mockProjectStats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return mockProjectStats;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockProjectStats;
};

// ============ 媒体内容相关 ============
export const getMediaItems = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/media`);
      if (!response.ok) throw new Error('Failed to fetch media');
      const data = await response.json();
      return data.length > 0 ? data : mockMediaItems;
    } catch (error) {
      console.error('Error fetching media:', error);
      return mockMediaItems;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockMediaItems;
};

export const getPhotos = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/photos`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      return data.length > 0 ? data : mockPhotos;
    } catch (error) {
      console.error('Error fetching photos:', error);
      return mockPhotos;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockPhotos;
};

// ============ 知识库相关 ============
export const getDocuments = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      return data.length > 0 ? data : mockDocuments;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return mockDocuments;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockDocuments;
};

export const getRegulations = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/regulations`);
      if (!response.ok) throw new Error('Failed to fetch regulations');
      const data = await response.json();
      return data.length > 0 ? data : mockRegulations;
    } catch (error) {
      console.error('Error fetching regulations:', error);
      return mockRegulations;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockRegulations;
};

// ============ 评论系统（后续实现）============
export const getComments = async (_targetId: string, _targetType: string) => {
  if (USE_BACKEND_API) {
    // TODO: 对接后端API
    // return await api.get(`${API_ENDPOINTS.COMMENTS}?targetId=${targetId}&targetType=${targetType}`);
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return []; // 暂时返回空数组
};

export const addComment = async (_commentData: {
  targetId: string;
  targetType: string;
  content: string;
  author: string;
}) => {
  if (USE_BACKEND_API) {
    // TODO: 对接后端API
    // return await api.post(API_ENDPOINTS.COMMENTS, commentData);
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return { success: true, id: Date.now().toString() };
};

// ============ 工作经历相关 ============
export const getExperiences = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/experiences`);
      if (!response.ok) throw new Error('Failed to fetch experiences');
      return await response.json();
    } catch (error) {
      console.error('Error fetching experiences:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

export const getExperienceById = async (id: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/experiences/${id}`);
      if (!response.ok) throw new Error('Failed to fetch experience');
      return await response.json();
    } catch (error) {
      console.error('Error fetching experience:', error);
      return null;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return null;
};

// ============ 文章/博客相关 ============
export const getArticles = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

export const getArticleById = async (id: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      return await response.json();
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return null;
};

export const getArticlesByCategory = async (category: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/category/${category}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

export const getArticlesByTag = async (tag: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/tag/${tag}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

// ============ 新闻动态相关 ============
export const getNews = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

export const getNewsById = async (id: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      return null;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return null;
};

export const getNewsByType = async (type: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/news/type/${type}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

// ============ Footer设置相关 ============
export const getFooterSettings = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/footer-settings`);
      if (!response.ok) throw new Error('Failed to fetch footer settings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching footer settings:', error);
      return null;
    }
  }
  return null;
};

// ============ 网站配置相关 ============
export const getSiteConfig = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/site-config`);
      if (!response.ok) throw new Error('Failed to fetch site config');
      return await response.json();
    } catch (error) {
      console.error('Error fetching site config:', error);
      return null;
    }
  }
  return null;
};

// ============ SEO设置相关 ============
export const getSeoSettings = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/seo-settings`);
      if (!response.ok) throw new Error('Failed to fetch SEO settings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      return null;
    }
  }
  return null;
};

// ============ 导航菜单相关 ============
export const getNavigation = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/navigation`);
      if (!response.ok) throw new Error('Failed to fetch navigation');
      return await response.json();
    } catch (error) {
      console.error('Error fetching navigation:', error);
      return [];
    }
  }
  return [];
};

export const getAllNavigation = async () => {
  if (USE_BACKEND_API) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/navigation/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch all navigation');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all navigation:', error);
      return [];
    }
  }
  return [];
};

// ============ 友情链接相关 ============
export const getFriendLinks = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/friend-links`);
      if (!response.ok) throw new Error('Failed to fetch friend links');
      return await response.json();
    } catch (error) {
      console.error('Error fetching friend links:', error);
      return [];
    }
  }
  return [];
};

export const getAllFriendLinks = async () => {
  if (USE_BACKEND_API) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/friend-links/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch all friend links');
      return await response.json();
    } catch (error) {
      console.error('Error fetching all friend links:', error);
      return [];
    }
  }
  return [];
};
