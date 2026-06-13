// 用户配置文件类型
export interface Profile {
  id: string;
  email?: string;
  phone?: string;
  role: 'user' | 'admin';
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
