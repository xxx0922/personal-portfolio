# 个人展示网站

一个基于React + TypeScript + Tailwind CSS的综合性个人展示平台。

## 功能特点

### 🏠 个人主页
- 个人风采照片展示
- 详细个人资料介绍
- 专业技能展示
- 精彩瞬间相册

### 💼 工作成就
- 项目展示和成果
- 技术栈展示
- 项目详细描述
- 权限控制（私密项目需要登录查看）

### 🎬 娱乐生活
- 电影推荐和影评
- 图书推荐和读后感
- 摄影作品展示
- 多标签页切换

### 📚 知识库
- 学习文档分类
- 搜索和筛选功能
- 建设行业法律法规
- 响应式阅读体验

### 🛠️ 后端管理系统（新增）
- 完整的内容管理后台
- 项目、技能、媒体等数据管理
- JWT认证保护
- 本地JSON存储，无需数据库
- 独立部署，易于维护

## 技术栈

- **前端框架**: React 18 + TypeScript
- **样式方案**: Tailwind CSS
- **路由管理**: React Router
- **状态管理**: React Context
- **构建工具**: Vite
- **图标**: Emoji Icons

## 开始使用

### 环境要求

- Node.js 16+
- npm 或 yarn

### 前端安装和运行

1. 克隆项目
```bash
git clone [项目地址]
cd personal-portfolio
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 打开浏览器访问 `http://localhost:5173`

### 后端安装和运行

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 初始化数据
```bash
npm run init
```

4. 启动后端服务器
```bash
npm start
# 或开发模式
npm run dev
```

5. 后端API运行在 `http://localhost:3001`

### 访问管理后台

1. 确保前端和后端都在运行
2. 访问 `http://localhost:5173/admin/login`
3. 使用默认账号登录：
   - 用户名: `admin`
   - 密码: `admin123`

### 构建部署

前端构建：
```bash
npm run build
```

构建文件将生成在 `dist` 目录中。

后端部署请参考 `backend/README.md`

## 权限系统

网站实现了简单的权限控制系统：

### 测试账号

**管理员账号:**
- 用户名: `admin`
- 密码: `admin123`
- 权限: 查看所有内容（包括私密项目）

**访客账号:**
- 用户名: `friend`
- 密码: `friend123`
- 权限: 查看私密项目

### 权限说明

- **公开用户**: 只能查看公开内容
- **访客权限**: 可以查看私密项目
- **管理员权限**: 完整访问权限

## 自定义配置

### 修改个人信息

编辑 `src/data/mockData.ts` 文件来更新您的个人信息：

```typescript
export const personalInfo: PersonalInfo = {
  name: "您的姓名",
  title: "您的职位",
  email: "your.email@example.com",
  // ... 更多信息
};
```

### 添加项目作品

在 `src/data/mockData.ts` 中添加更多项目：

```typescript
export const projects: Project[] = [
  // 现有项目...
  {
    id: "new-project",
    title: "新项目名称",
    description: "项目描述",
    role: "您的角色",
    duration: "项目周期",
    technologies: ["技术栈"],
    images: ["/images/project-image.jpg"],
    achievements: ["成就描述"],
    isPrivate: false // 是否为私密项目
  }
];
```

### 图片资源

将您的图片资源放置在以下目录：

- 个人头像和照片: `public/images/`
- 项目图片: `public/images/`
- 封面图片: `public/images/`
- 文档资源: `public/docs/`

### 图片命名建议

- 头像: `avatar.jpg`
- 个人照片: `photo1.jpg`, `photo2.jpg`, ...
- 项目图片: `project{id}-{index}.jpg` (如: `project1-1.jpg`)
- 电影封面: `movie-{title}.jpg`
- 图书封面: `book-{title}.jpg`
- 摄影作品: `photo-life-{id}.jpg`

## 部署说明

### 静态托管部署

项目可以部署到任何支持静态文件的托管服务：

1. **Netlify**: 拖拽 `dist` 文件夹到 Netlify
2. **Vercel**: 连接GitHub仓库自动部署
3. **GitHub Pages**: 启用GitHub Pages功能
4. **传统服务器**: 上传 `dist` 文件夹到Web服务器

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

**享受您的个人展示网站！** 🎉
