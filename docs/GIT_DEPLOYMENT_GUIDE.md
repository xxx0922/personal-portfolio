# Git 部署完整指南

## 📦 文件提交说明

### ✅ 会提交到 Git 的文件

| 文件类型 | 说明 | 用途 |
|---------|------|------|
| `src/` | 前端源代码 | 网站前端代码 |
| `backend/src/` | 后端源代码 | API 服务代码 |
| `backend/data/*.json` | 数据文件 | 文章、项目、经验等数据 |
| `backend/uploads/` | 上传文件 | 图片、头像等媒体文件 |
| `public/` | 公共资源 | 静态资源文件 |
| `docs/` | 文档 | 项目文档 |
| `package.json` | 依赖配置 | npm 依赖管理 |
| `.env.example` | 环境变量示例 | 配置模板 |

### ❌ 不会提交到 Git 的文件

| 文件类型 | 说明 | 原因 |
|---------|------|------|
| `node_modules/` | 依赖包 | 可通过 `npm install` 重新安装 |
| `dist/` | 构建输出 | 可通过 `npm run build` 重新生成 |
| `.env` | 环境变量 | **包含敏感信息（密码、密钥）** |
| `backend/.env` | 后端环境变量 | **包含敏感信息（JWT 密钥、数据库密码）** |
| `projects/` | 其他项目 | 独立项目文件 |
| `tests/` | 测试文件 | 本地测试用 |
| `.claude/` | Claude 配置 | 本地开发配置 |
| `*.log` | 日志文件 | 临时文件 |

---

## 🚀 部署到云服务器的完整流程

### 第一步：本地提交到 Git

```bash
cd /d/TRAE/CC/personal-portfolio

# 1. 检查要提交的文件
git status

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "更新网站内容和配置"

# 4. 推送到远程仓库
git push origin main
```

### 第二步：在云服务器上拉取

```bash
# 1. 登录云服务器
ssh root@your-server-ip

# 2. 进入项目目录
cd /var/www/personal-portfolio

# 3. 拉取最新代码
git pull origin main

# 4. 安装依赖
npm install
cd backend && npm install
cd ..

# 5. 创建环境变量文件（重要！）
cp .env.example .env
cp backend/.env.example backend/.env

# 6. 编辑环境变量（填入实际值）
vim .env
vim backend/.env

# 7. 构建前端
npm run build

# 8. 重启后端服务
cd backend
pm2 restart portfolio-backend
# 或者
pm2 start src/server.js --name portfolio-backend
```

---

## ⚠️ 重要注意事项

### 1. 环境变量必须手动配置

**不要将 `.env` 文件提交到 Git！**

需要在云服务器上手动创建：

#### 前端 `.env`
```bash
VITE_API_URL=http://your-server-ip:3002/api
```

#### 后端 `backend/.env`
```bash
# 服务器配置
PORT=3002
NODE_ENV=production

# JWT 密钥（生产环境必须修改！）
JWT_SECRET=你的超级随机密钥_至少 32 字符

# 管理员密码
INITIAL_ADMIN_PASSWORD=你的强密码

# 相册密码
ALBUM_PASSWORD=你的相册密码

# CORS 配置（改为实际域名）
CORS_ORIGIN=https://yourdomain.com

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 2. 生成强随机 JWT 密钥

```bash
# 在服务器上运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 数据文件说明

当前配置已将以下数据文件加入 Git：
- `backend/data/*.json` - 所有业务数据
- `backend/uploads/*` - 所有上传的图片和文件

**这意味着：**
- ✅ 本地上传的图片会自动同步到云服务器
- ✅ 本地编辑的文章、项目数据会自动同步
- ⚠️ 但如果云服务器上有新的上传，需要先在服务器上提交推送到 Git，然后在本地拉取

### 4. 推荐的数据同步策略

#### 方案 A：单向同步（推荐）
所有数据编辑都在**本地完成**，然后推送到 Git，服务器只负责拉取和部署。

```
本地编辑 → Git 提交 → 服务器拉取
```

#### 方案 B：服务器数据备份
如果需要在服务器上直接上传文件，定期手动备份：

```bash
# 在服务器上
cd /var/www/personal-portfolio
git add backend/uploads/
git add backend/data/
git commit -m "服务器数据更新"
git push origin main
```

然后在本地：
```bash
git pull origin main
```

---

## 📁 完整的目录结构

```
personal-portfolio/
├── .gitignore              # ✅ 提交 - Git 忽略配置
├── .env.example            # ✅ 提交 - 环境变量模板
├── .env                    # ❌ 不提交 - 实际环境变量
├── package.json            # ✅ 提交 - 依赖配置
├── src/                    # ✅ 提交 - 前端源码
├── public/                 # ✅ 提交 - 静态资源
├── backend/
│   ├── .env.example        # ✅ 提交 - 环境变量模板
│   ├── .env                # ❌ 不提交 - 实际环境变量
│   ├── src/                # ✅ 提交 - 后端源码
│   ├── data/               # ✅ 提交 - JSON 数据文件
│   └── uploads/            # ✅ 提交 - 上传的图片/文件
├── docs/                   # ✅ 提交 - 项目文档
├── dist/                   # ❌ 不提交 - 构建输出
└── node_modules/           # ❌ 不提交 - 依赖包
```

---

## 🔧 常见问题

### Q1: 服务器上的图片会丢失吗？
**不会**。只要按照流程：
1. 本地上传图片 → 提交到 Git → 推送
2. 服务器拉取 → 图片自动同步

### Q2: 在服务器上直接上传的图片怎么办？
需要手动提交到 Git：
```bash
cd /var/www/personal-portfolio
git add backend/uploads/
git commit -m "添加新图片"
git push origin main
```

### Q3: 环境变量忘记配置会怎样？
- 前端无法连接后端 API
- 后端 JWT 认证失败
- CORS 错误

**解决：** 确保服务器上创建了 `.env` 和 `backend/.env` 文件

### Q4: 数据库数据会同步吗？
当前项目使用 **JSON 文件存储**（`backend/data/*.json`），已配置提交到 Git，会自动同步。

如改用 MongoDB/MySQL，需要：
1. 在服务器上导出数据库
2. 在本地导入
3. 或手动迁移数据

---

## 📋 部署检查清单

部署前请确认：

- [ ] 所有代码已提交到 Git
- [ ] `.env` 文件未提交（检查 `git status`）
- [ ] 服务器已安装 Node.js 和 npm
- [ ] 服务器已安装 PM2（用于后端进程管理）
- [ ] 服务器上创建了环境变量文件
- [ ] JWT_SECRET 已修改为强随机密钥
- [ ] 管理员密码已修改
- [ ] CORS 配置为实际域名
- [ ] 前端构建了生产版本 (`npm run build`)
- [ ] 后端服务已启动 (`pm2 list`)
- [ ] Nginx 配置正确（如使用）

---

## 🎯 快速部署脚本

在服务器上创建 `deploy.sh`：

```bash
#!/bin/bash

echo "🚀 开始部署..."

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
echo "📦 安装依赖..."
npm install
cd backend && npm install && cd ..

# 3. 构建前端
echo "🔨 构建前端..."
npm run build

# 4. 重启后端
echo "🔄 重启后端服务..."
cd backend
pm2 restart portfolio-backend || pm2 start src/server.js --name portfolio-backend
cd ..

echo "✅ 部署完成！"
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 总结

| 操作 | 是否提交到 Git | 部署方式 |
|------|--------------|---------|
| 代码修改 | ✅ 是 | `git push` → 服务器 `git pull` |
| 数据文件 (JSON) | ✅ 是 | `git push` → 服务器 `git pull` |
| 上传图片/文件 | ✅ 是 | `git push` → 服务器 `git pull` |
| 环境变量 | ❌ 否 | 服务器手动创建 |
| 依赖包 | ❌ 否 | 服务器 `npm install` |
| 构建文件 | ❌ 否 | 服务器 `npm run build` |

按照这个指南操作，你的所有内容（文章、图片、配置）都会完整同步到云服务器！
