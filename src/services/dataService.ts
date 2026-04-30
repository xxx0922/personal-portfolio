/**
 * 数据服务层 - 统一数据获取接口
 *
 * 从后端 API 获取数据
 */

import {
  personalInfo as mockPersonalInfo,
  skills as mockSkills,
  projects as mockProjects,
  mediaItems as mockMediaItems,
  photos as mockPhotos,
  documents as mockDocuments
} from '../data/mockData';

// 标记：是否使用后端 API
const USE_BACKEND_API = true; // 使用后端 API

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// ============ 个人信息相关 ============
export const getPersonalInfo = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/personal-info`);
      if (!response.ok) throw new Error('Failed to fetch personal info');
      return await response.json();
    } catch (error) {
      console.error('Error fetching personal info:', error);
      return mockPersonalInfo; // 降级到 mockData
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
      return data.length > 0 ? data : mockSkills; // 如果后端无数据，使用 mockData
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
      const data = await response.json();
      return data.length > 0 ? data : [];
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

// ============ 产品展示相关 ============
export const getProducts = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

export const getProductById = async (id: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return null;
};

// ============ 实用工具相关 ============
export const getTools = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`);
      if (!response.ok) throw new Error('Failed to fetch tools');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tools:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

export const getToolById = async (id: string) => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/${id}`);
      if (!response.ok) throw new Error('Failed to fetch tool');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tool:', error);
      return null;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return null;
};

export const getToolCategories = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/utils/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

// ============ 专业相关 ============
export const getProfessions = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/professions`);
      if (!response.ok) throw new Error('Failed to fetch professions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching professions:', error);
      return [];
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
};

// ============ 联系信息相关 ============
export const getContact = async () => {
  if (USE_BACKEND_API) {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`);
      if (!response.ok) throw new Error('Failed to fetch contact info');
      return await response.json();
    } catch (error) {
      console.error('Error fetching contact info:', error);
      return {
        email: 'bohenan@163.com',
        phone: '+86 138-0000-0000',
        images: [
          { url: '', label: '抖音' },
          { url: '', label: '公众号' },
          { url: '', label: '小红书' },
          { url: '', label: '微信' }
        ]
      }; // 降级到默认值
    }
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    email: 'bohenan@163.com',
    phone: '+86 138-0000-0000',
    images: [
      { url: '', label: '抖音' },
      { url: '', label: '公众号' },
      { url: '', label: '小红书' },
      { url: '', label: '微信' }
    ]
  };
};
