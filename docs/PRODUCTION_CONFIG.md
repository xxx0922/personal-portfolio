# 🚀 生产环境部署配置完成

## ✅ 已完成的配置

### 1. 环境变量配置

**后端 `.env`** (已配置生产环境):
```bash
PORT=3002
NODE_ENV=production
JWT_SECRET=46e9cefb2ea2eb3710d0d4fba2bd7530f2132426410fb631a46877133863468c (64 字符)
JWT_EXPIRES_IN=8h
INITIAL_ADMIN_PASSWORD=Xue0922@
ALBUM_PASSWORD=Xue0922@
CORS_ORIGIN=https://bohenan.com,https://www.bohenan.com
```

**前端 `.env.production`** (已创建):
```bash
VITE_API_URL=https://api.bohenan.com/api
VITE_SITE_NAME=丰生水起的个人主页
VITE_SITE_URL=https://bohenan.com
```

### 2. Netlify 部署配置

**`netlify.toml`** (已配置):
- ✅ 自动构建命令
- ✅ SPA 路由重定向
- ✅ 安全响应头
- ✅ HTTPS 强制重定向
- ✅ 缓存策略

### 3. CORS 域名配置

已允许以下域名访问：
- `https://bohenan.com`
- `https://www.bohenan.com`
- `http://localhost:*` (开发环境)

---

## 📋 部署到 Netlify 的步骤

### 方式 1：Netlify Dashboard 部署（推荐）

1. **登录 Netlify**
   - 访问 https://app.netlify.com
   - 登录并点击 "Add new site" → "Import an existing project"

2. **连接 Git 仓库**
   - 选择 GitHub/GitLab
   - 选择你的仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **配置环境变量**
   在 Netlify Dashboard → Site Settings → Environment Variables 添加：
   ```
   VITE_API_URL = https://api.bohenan.com/api
   ```

5. **部署**
   - 点击 "Deploy site"
   - 等待构建完成（约 2-5 分钟）

6. **配置自定义域名**
   - Domain Settings → Add custom domain
   - 输入 `bohenan.com`
   - 按照提示配置 DNS

### 方式 2：Netlify CLI 部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化项目
netlify init

# 部署
netlify deploy --prod
```

---

## 🔧 后端部署选项

### 选项 A：独立服务器部署（推荐）

使用 VPS（如 AWS EC2、DigitalOcean、腾讯云等）：

1. **安装 Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **上传代码**
   ```bash
   scp -r backend/ user@your-server:/var/www/portfolio-backend
   ```

3. **安装依赖**
   ```bash
   cd /var/www/portfolio-backend
   npm install --production
   ```

4. **配置环境变量**
   - 编辑 `.env` 文件
   - 设置 `NODE_ENV=production`

5. **使用 PM2 管理进程**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name portfolio-api
   pm2 save
   pm2 startup
   ```

6. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 443 ssl;
       server_name api.bohenan.com;

       ssl_certificate /etc/letsencrypt/live/api.bohenan.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.bohenan.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3002;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }

   server {
       listen 80;
       server_name api.bohenan.com;
       return 301 https://$server_name$request_uri;
   }
   ```

7. **安装 SSL 证书**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.bohenan.com
   ```

### 选项 B：Netlify Functions（无服务器）

将后端改造为 Netlify Functions（需要较多改动，暂不推荐）。

---

## 📁 文件清单

### 已创建/更新的文件

```
personal-portfolio/
├── .env                          # 前端开发环境
├── .env.production               # 前端生产环境 ✅ 新建
├── .env.example                  # 前端环境示例
├── .gitignore                    # ✅ 已更新
├── netlify.toml                  # Netlify 部署配置 ✅ 已更新
├── package.json                  # ✅ 已添加 dev:https 脚本
├── docs/
│   ├── HTTPS_SETUP.md            # HTTPS 配置指南
│   ├── DEPLOYMENT_CHECKLIST.md   # 部署检查清单
│   ├── SECURITY_SETUP_SUMMARY.md # 安全配置总结
│   └── PRODUCTION_CONFIG.md      # 本文件
└── backend/
    ├── .env                      # 后端生产环境 ✅ 已配置
    ├── .env.example              # 后端环境示例
    ├── package.json              # ✅ 已添加 dotenv
    └── src/
        ├── server.js             # ✅ 已更新环境变量支持
        └── routes/auth.js        # ✅ 已更新 JWT 配置
```

---

## ✅ 部署前检查清单

### 环境变量
- [x] JWT_SECRET 已设置（64 字符）
- [x] NODE_ENV=production
- [x] CORS_ORIGIN 包含 bohenan.com
- [x] INITIAL_ADMIN_PASSWORD=Xue0922@
- [x] ALBUM_PASSWORD=Xue0922@

### 前端
- [x] .env.production 已创建
- [x] VITE_API_URL 配置正确
- [ ] 在 Netlify 配置环境变量

### 后端
- [x] dotenv 依赖已安装
- [x] server.js 使用环境变量
- [ ] 部署到服务器
- [ ] 配置 HTTPS

### 域名
- [x] CORS 已配置 bohenan.com
- [ ] DNS 记录配置
- [ ] SSL 证书签发

---

## 🔐 密码信息

**当前配置（建议生产环境修改）：**

| 项目 | 当前密码 | 建议 |
|------|---------|------|
| 管理员账号 | `Xue0922@` | 修改为更强的密码 |
| 相册密码 | `Xue0922@` | 修改为更强的密码 |

**生成强密码命令：**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

##  快速部署命令

### 前端（Netlify）
```bash
# 1. 构建
npm run build

# 2. 预览
npm run preview

# 3. 部署到 Netlify
netlify deploy --prod
```

### 后端（本地测试）
```bash
cd backend
npm install
npm run dev
```

### 后端（生产服务器）
```bash
cd backend
npm install --production
pm2 start src/server.js --name portfolio-api
```

---

## 📊 域名配置总结

| 服务 | 域名 | 配置 |
|------|------|------|
| 前端 | https://bohenan.com | Netlify |
| 前端 | https://www.bohenan.com | Netlify（重定向） |
| 后端 API | https://api.bohenan.com | 独立服务器/VPS |

---

## 🆘 常见问题

### 1. CORS 错误
确保：
- `CORS_ORIGIN` 包含实际域名
- Netlify 环境变量已配置

### 2. API 请求失败
检查：
- `VITE_API_URL` 是否正确
- 后端服务是否运行
- HTTPS 证书是否有效

### 3. 图片无法上传
检查：
- `uploads/` 目录权限
- 服务器磁盘空间

---

**配置完成时间**: 2026-04-28
**域名**: bohenan.com
**状态**: 准备就绪，可以部署
