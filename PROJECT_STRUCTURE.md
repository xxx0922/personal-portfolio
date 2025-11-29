# 项目结构说明

```
personal-portfolio/
├── backend/                      # 后端服务器
│   ├── data/                     # 数据存储目录（JSON文件）
│   │   ├── personalInfo.json     # 个人信息
│   │   ├── projects.json         # 项目数据
│   │   ├── skills.json          # 技能数据
│   │   ├── media.json           # 媒体（电影/书籍）
│   │   ├── photos.json          # 照片数据
│   │   ├── documents.json       # 文档数据
│   │   ├── regulations.json     # 法规数据
│   │   ├── stats.json           # 统计数据
│   │   └── users.json           # 用户数据
│   ├── src/
│   │   ├── middleware/          # 中间件
│   │   │   └── auth.js          # 认证中间件
│   │   ├── routes/              # API路由
│   │   │   ├── auth.js          # 认证路由
│   │   │   ├── personalInfo.js  # 个人信息路由
│   │   │   ├── projects.js      # 项目管理路由
│   │   │   ├── skills.js        # 技能管理路由
│   │   │   ├── media.js         # 媒体管理路由
│   │   │   ├── photos.js        # 照片管理路由
│   │   │   ├── documents.js     # 文档管理路由
│   │   │   ├── regulations.js   # 法规管理路由
│   │   │   └── stats.js         # 统计数据路由
│   │   ├── services/            # 业务逻辑
│   │   │   └── dataService.js   # 数据存储服务
│   │   ├── init.js              # 数据初始化脚本
│   │   └── server.js            # 服务器入口
│   ├── package.json
│   └── README.md
│
├── src/                          # 前端源码
│   ├── components/               # React组件
│   │   ├── LazyImage.tsx        # 懒加载图片组件
│   │   ├── LoginModal.tsx       # 登录模态框
│   │   ├── Navigation.tsx       # 导航栏
│   │   └── ProtectedContent.tsx # 受保护内容组件
│   ├── contexts/                 # React上下文
│   │   └── AuthContext.tsx      # 认证上下文
│   ├── data/                     # 前端数据
│   │   └── mockData.ts          # 模拟数据（将被API替代）
│   ├── hooks/                    # 自定义Hooks
│   │   └── useSEO.ts            # SEO Hook
│   ├── pages/                    # 页面组件
│   │   ├── HomePage.tsx         # 首页
│   │   ├── AchievementsPage.tsx # 工作成就页
│   │   ├── LifestylePage.tsx    # 娱乐生活页
│   │   ├── KnowledgePage.tsx    # 知识库页
│   │   ├── AdminPage.tsx        # 管理后台（新增）
│   │   └── AdminLoginPage.tsx   # 管理员登录（新增）
│   ├── services/                 # 服务层
│   │   ├── api.ts               # API调用
│   │   └── dataService.ts       # 数据服务
│   ├── types/                    # TypeScript类型定义
│   │   └── index.ts             # 类型定义
│   ├── utils/                    # 工具函数
│   │   └── vcard.ts             # 电子名片生成
│   ├── App.tsx                   # 应用主组件
│   └── main.tsx                  # 应用入口
│
├── public/                       # 静态资源
│   ├── images/                   # 图片资源
│   └── docs/                     # 文档资源
│
├── dist/                         # 构建输出目录
│
├── start.bat                     # Windows启动脚本
├── start.sh                      # Linux/Mac启动脚本
├── DEPLOYMENT.md                 # 部署指南
├── README.md                     # 项目说明
├── package.json                  # 前端依赖配置
├── vite.config.ts               # Vite配置
├── tsconfig.json                # TypeScript配置
├── tailwind.config.js           # Tailwind CSS配置
└── .gitignore                   # Git忽略配置
```

## 主要目录说明

### `/backend` - 后端服务器

提供RESTful API服务，管理所有数据的CRUD操作。

**特点**:
- Express框架
- JWT认证
- JSON文件存储
- 无数据库依赖

### `/src` - 前端源码

React + TypeScript开发的单页应用。

**架构**:
- 组件化开发
- Context状态管理
- React Router路由
- Tailwind CSS样式

### `/backend/data` - 数据存储

所有数据以JSON格式存储在此目录，便于备份和迁移。

**重要**: 需要定期备份此目录！

### `/src/pages` - 页面组件

| 页面 | 路由 | 说明 |
|------|------|------|
| HomePage | `/` | 首页 - 个人介绍和照片 |
| AchievementsPage | `/achievements` | 工作成就 - 项目展示 |
| LifestylePage | `/lifestyle` | 娱乐生活 - 电影/书籍/摄影 |
| KnowledgePage | `/knowledge` | 知识库 - 文档和法规 |
| AdminLoginPage | `/admin/login` | 管理员登录 |
| AdminPage | `/admin` | 管理后台 |

## 数据流

```
用户 → 前端页面 → API调用 → 后端路由 → 数据服务 → JSON文件
```

### 读取流程

1. 前端页面调用 `fetch` 请求后端API
2. 后端路由接收请求
3. 数据服务读取JSON文件
4. 返回数据给前端
5. 前端渲染展示

### 写入流程（需要认证）

1. 管理员登录获取JWT token
2. 请求携带token访问保护的API
3. 中间件验证token
4. 执行CRUD操作
5. 更新JSON文件
6. 返回操作结果

## 技术栈

### 前端

- **框架**: React 18
- **语言**: TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router v6
- **图表**: Recharts
- **图片**: React Lazy Load

### 后端

- **运行时**: Node.js
- **框架**: Express
- **认证**: JWT
- **数据**: JSON文件存储

## 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 前端依赖和脚本 |
| `backend/package.json` | 后端依赖和脚本 |
| `vite.config.ts` | Vite构建配置 |
| `tsconfig.json` | TypeScript配置 |
| `tailwind.config.js` | Tailwind样式配置 |
| `eslint.config.js` | ESLint代码规范 |

## 开发工作流

### 添加新功能

1. **前端**:
   - 在 `src/pages` 添加新页面
   - 在 `src/components` 添加新组件
   - 在 `App.tsx` 添加路由
   - 在 `src/types` 添加类型定义

2. **后端**:
   - 在 `backend/src/routes` 添加新路由
   - 更新 `backend/src/server.js` 注册路由
   - 在 `backend/data` 创建对应JSON文件

### 修改数据结构

1. 更新 `src/types/index.ts` 类型定义
2. 更新后端路由验证逻辑
3. 更新前端组件使用新字段
4. 迁移现有数据（如需要）

## API设计规范

所有API遵循RESTful设计：

- `GET /api/resource` - 获取列表
- `GET /api/resource/:id` - 获取单个
- `POST /api/resource` - 创建新资源
- `PUT /api/resource/:id` - 更新资源
- `DELETE /api/resource/:id` - 删除资源

认证请求需要在Header中携带：
```
Authorization: Bearer <token>
```

## 扩展建议

### 短期扩展

- [ ] 添加图片上传功能
- [ ] 实现其他管理页面（技能、媒体等）
- [ ] 添加数据导入导出
- [ ] 增加搜索和筛选功能

### 长期扩展

- [ ] 迁移到数据库（PostgreSQL/MongoDB）
- [ ] 添加文件存储服务（OSS）
- [ ] 实现评论系统
- [ ] 添加访问统计
- [ ] SEO优化和SSR
- [ ] 多语言支持

## 注意事项

1. **数据备份**: `backend/data` 目录包含所有数据，务必定期备份
2. **密钥安全**: 生产环境必须修改JWT_SECRET
3. **权限控制**: 当前只有admin角色，可扩展更多角色
4. **错误处理**: 建议添加更完善的错误处理和日志
5. **性能优化**: 大数据量时考虑分页和缓存

---

有问题？查看 [README.md](./README.md) 或 [DEPLOYMENT.md](./DEPLOYMENT.md)
