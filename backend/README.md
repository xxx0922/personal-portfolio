# 个人网站后端管理系统

这是个人展示网站的后端API服务，提供完整的数据管理功能。

## 功能特性

- ✅ RESTful API接口
- ✅ JWT身份认证
- ✅ 项目、技能、媒体、照片、文档等数据管理
- ✅ JSON文件本地存储（无需数据库）
- ✅ 简单部署，易于维护

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web框架
- **JWT** - 身份验证
- **JSON** - 数据存储

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 初始化数据

```bash
npm run init
```

这将创建初始的数据文件在 `backend/data` 目录下。

### 3. 启动服务器

```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

服务器将运行在 `http://localhost:3001`

## API端点

### 认证

- `POST /api/auth/login` - 用户登录
- `GET /api/auth/verify` - 验证token

### 个人信息

- `GET /api/personal-info` - 获取个人信息
- `PUT /api/personal-info` - 更新个人信息（需要管理员权限）

### 项目管理

- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取单个项目
- `POST /api/projects` - 创建项目（需要管理员权限）
- `PUT /api/projects/:id` - 更新项目（需要管理员权限）
- `DELETE /api/projects/:id` - 删除项目（需要管理员权限）

### 技能管理

- `GET /api/skills` - 获取所有技能
- `POST /api/skills` - 添加技能（需要管理员权限）
- `PUT /api/skills/:id` - 更新技能（需要管理员权限）
- `DELETE /api/skills/:id` - 删除技能（需要管理员权限）

### 媒体管理（电影/书籍）

- `GET /api/media` - 获取所有媒体
- `POST /api/media` - 添加媒体（需要管理员权限）
- `PUT /api/media/:id` - 更新媒体（需要管理员权限）
- `DELETE /api/media/:id` - 删除媒体（需要管理员权限）

### 照片管理

- `GET /api/photos` - 获取所有照片
- `POST /api/photos` - 添加照片（需要管理员权限）
- `PUT /api/photos/:id` - 更新照片（需要管理员权限）
- `DELETE /api/photos/:id` - 删除照片（需要管理员权限）

### 文档管理

- `GET /api/documents` - 获取所有文档
- `POST /api/documents` - 添加文档（需要管理员权限）
- `PUT /api/documents/:id` - 更新文档（需要管理员权限）
- `DELETE /api/documents/:id` - 删除文档（需要管理员权限）

### 法规管理

- `GET /api/regulations` - 获取所有法规
- `POST /api/regulations` - 添加法规（需要管理员权限）
- `PUT /api/regulations/:id` - 更新法规（需要管理员权限）
- `DELETE /api/regulations/:id` - 删除法规（需要管理员权限）

### 统计数据

- `GET /api/stats` - 获取统计数据
- `PUT /api/stats` - 更新统计数据（需要管理员权限）

## 默认管理员账号

- 用户名: `admin`
- 密码: `admin123`

**重要提示**: 首次部署后请修改默认密码！

## 数据存储

所有数据存储在 `backend/data` 目录下的JSON文件中：

- `personalInfo.json` - 个人信息
- `projects.json` - 项目数据
- `skills.json` - 技能数据
- `media.json` - 媒体数据
- `photos.json` - 照片数据
- `documents.json` - 文档数据
- `regulations.json` - 法规数据
- `stats.json` - 统计数据
- `users.json` - 用户数据

## 部署说明

### 本地部署

1. 确保已安装 Node.js 16+
2. 克隆项目并安装依赖
3. 运行 `npm run init` 初始化数据
4. 运行 `npm start` 启动服务器

### 生产环境

建议使用 PM2 进行进程管理：

```bash
npm install -g pm2
pm2 start src/server.js --name portfolio-backend
pm2 save
pm2 startup
```

## 环境变量

可选的环境变量配置：

- `PORT` - 服务器端口（默认: 3001）
- `JWT_SECRET` - JWT密钥（建议在生产环境中设置）

创建 `.env` 文件：

```
PORT=3001
JWT_SECRET=your-secret-key-here
```

## 安全建议

1. 修改默认管理员密码
2. 在生产环境中设置强JWT密钥
3. 启用HTTPS
4. 定期备份 `data` 目录
5. 限制API访问频率

## 故障排查

### 端口被占用

如果3001端口被占用，可以修改环境变量：

```bash
PORT=3002 npm start
```

### 数据文件损坏

如果数据文件损坏，删除对应的JSON文件，然后运行：

```bash
npm run init
```

## 许可证

MIT
