// 个人信息类型
export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  bio: string;
  welcomeMessage?: string;
  avatar: string;
  photos: string[];
}

// 联系信息类型
export interface ContactImage {
  url: string;
  label: string;
}

export interface Contact {
  email: string;
  phone?: string;
  wechat?: string;
  qq?: string;
  telegram?: string;
  whatsapp?: string;
  other?: string;
  location?: string;
  images?: ContactImage[];
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
  folder?: string;
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

// 任务类型
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'postponed';
  createdAt: string;
  dueDate: string;
  category?: string;
  tags?: string[];
}

// HTML分享类型
export interface HtmlShare {
  id: string;
  title: string;
  content: string;
  type: 'upload' | 'paste';
  fileName?: string;
  createdAt: string;
  updatedAt?: string;
  views: number;
  lastViewedAt?: string;
}
// 留言类型
export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
  readAt?: string;
}

// 产品分类类型
export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  coverImage?: string; // 封面图
  shortDescription?: string; // 简短介绍
  detailedDescription?: string; // 详细描述（富文本）
  mediaResources?: MediaResource[]; // 媒体资源列表
  sortOrder?: number; // 排序值
  isPublished?: boolean; // 是否上架
  folders: ProductFolder[];
}

export interface MediaResource {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string; // 视频封面图
  title?: string;
  description?: string;
  sortOrder: number;
  uploadedAt?: string;
}

export interface ProductFolder {
  id: string;
  name: string;
  count: number;
  attachments?: ProductAttachment[];
  subFolders?: ProductSubFolder[];
}

export interface ProductSubFolder {
  id: string;
  name: string;
  count: number;
  attachments?: ProductAttachment[];
}

export interface ProductAttachment {
  id: string;
  name: string;
  description: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// 工具类型
export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  category: string;
}

// 专业类型
export interface Profession {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: Array<{
    id: string;
    name: string;
    level: number;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    date: string;
  }>;
}
