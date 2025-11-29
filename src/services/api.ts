// API配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API请求基础类
class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 创建API实例
export const api = new ApiService(API_BASE_URL);

// API端点定义（后续对接后端时使用）
export const API_ENDPOINTS = {
  // 个人信息
  PERSONAL_INFO: '/personal-info',

  // 项目相关
  PROJECTS: '/projects',
  PROJECT_STATS: '/projects/stats',
  PROJECT_BY_ID: (id: string) => `/projects/${id}`,

  // 技能
  SKILLS: '/skills',

  // 媒体内容
  MEDIA_ITEMS: '/media-items',
  PHOTOS: '/photos',

  // 文档和法规
  DOCUMENTS: '/documents',
  REGULATIONS: '/regulations',

  // 评论系统（后续功能）
  COMMENTS: '/comments',
  COMMENT_BY_ID: (id: string) => `/comments/${id}`,

  // 小说（后续功能）
  NOVELS: '/novels',
  NOVEL_CHAPTERS: (novelId: string) => `/novels/${novelId}/chapters`,

  // 视频（后续功能）
  VIDEOS: '/videos',

  // 用户认证
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_VERIFY: '/auth/verify',
};

export default api;
