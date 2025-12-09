// 个人信息类型
export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  photos: string[];
}

// 技能类型
export interface Skill {
  id?: string;
  name: string;
  level: number; // 1-5
  category: string;
}

// 项目类型
export interface Project {
  id: string;
  title: string;
  description: string;
  role: string;
  duration: string;
  year?: string; // 项目年份
  contractAmount?: number; // 合同金额
  technologies: string[];
  images: string[];
  achievements: string[];
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  isPrivate?: boolean;
}

// 电影/书籍类型
export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'book';
  rating: number; // 1-5
  review: string;
  coverImage: string;
  videoUrl?: string; // 视频URL（可选，仅电影类型使用）
  tags: string[];
  date: string;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
}

// 照片类型
export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

// 文档类型
export interface Document {
  id: string;
  title: string;
  category: string;
  content: string;
  fileUrl?: string;
  tags: string[];
  date: string;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
}

// 法律法规类型
export interface Regulation {
  id: string;
  title: string;
  content: string;
  category: string;
  publishDate: string;
  tags: string[];
}

// 用户类型（用于权限控制）
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'friend' | 'public';
  permissions: string[];
}

// 工作经历类型
export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null; // null表示当前在职
  period?: string; // 时间段描述
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies?: string[];
  skills?: string[]; // 添加技能字段
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// 文章类型
export interface Article {
  id: string;
  title: string;
  summary: string;
  excerpt?: string; // 摘要
  content: string; // Markdown格式
  coverImage?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  views: number;
  readTime?: number; // 阅读时间（分钟）
  featured?: boolean; // 是否精选
  author: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// 新闻动态类型
export interface News {
  id: string;
  title: string;
  content: string;
  excerpt?: string; // 摘要
  type: 'industry' | 'company' | 'achievement' | 'project'; // 行业动态、公司公告、最新成就、即将开展的项目
  image?: string;
  date?: string; // 日期
  link?: string; // 链接
  important?: boolean; // 是否重要
  status: 'draft' | 'published';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}