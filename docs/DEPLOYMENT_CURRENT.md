# 当前部署执行清单（个人网站 + 大交通仪表盘）

> 适用目标：一个域名 `https://www.bohenan.com` 同时部署个人网站和大交通仪表盘。

---

## 一、线上访问规划

```text
https://www.bohenan.com/           个人网站
https://www.bohenan.com/traffic/   大交通仪表盘
https://www.bohenan.com/api/       个人网站后端 API
https://www.bohenan.com/uploads/   后端上传资源
```

---

## 二、服务器目录建议

```text
/www/wwwroot/personal-portfolio/
├── dist/                         # 个人网站构建产物
├── backend/                      # 个人网站后端
├── app-8p3pb8bea7sx/
│   └── dist/                     # 大交通仪表盘构建产物
└── ...
```

---

## 三、服务器拉取代码

第一次部署建议先备份旧站：

```bash
cd /www/wwwroot
mv personal-portfolio personal-portfolio-backup-$(date +%Y%m%d)
git clone https://github.com/xxx0922/personal-portfolio.git personal-portfolio
cd personal-portfolio
```

如果已经是 Git 仓库：

```bash
cd /www/wwwroot/personal-portfolio
git pull origin main
```

---

## 四、环境变量

### 1. 后端环境变量

在服务器创建：

```bash
cd /www/wwwroot/personal-portfolio/backend
nano .env
```

示例：

```env
PORT=3002
NODE_ENV=production
JWT_SECRET=请填写强随机密钥
JWT_EXPIRES_IN=8h
INITIAL_ADMIN_PASSWORD=请填写初始管理员密码
ALBUM_PASSWORD=请填写相册密码
CORS_ORIGIN=https://www.bohenan.com,https://bohenan.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 2. 个人网站前端环境变量

如需配置生产 API，可在根目录创建：

```bash
cd /www/wwwroot/personal-portfolio
nano .env.production
```

示例：

```env
VITE_API_URL=https://www.bohenan.com/api
VITE_BACKEND_URL=https://www.bohenan.com
```

### 3. 大交通仪表盘环境变量

在：

```bash
cd /www/wwwroot/personal-portfolio/app-8p3pb8bea7sx
nano .env
```

示例：

```env
VITE_SUPABASE_URL=https://rqboiemrnfupfxvorgdt.supabase.co
VITE_SUPABASE_ANON_KEY=你的 Supabase anon key
VITE_APP_ID=app-8p3pb8bea7sx
```

> 注意：`VITE_APP_ID=app-8p3pb8bea7sx` 不建议修改，这是秒哒应用 ID。

---

## 五、安装依赖与构建

### 1. 个人网站

```bash
cd /www/wwwroot/personal-portfolio
npm install
npm run build
```

构建结果：

```text
/www/wwwroot/personal-portfolio/dist
```

### 2. 后端

```bash
cd /www/wwwroot/personal-portfolio/backend
npm install
```

### 3. 大交通仪表盘

```bash
cd /www/wwwroot/personal-portfolio/app-8p3pb8bea7sx
npm install
npm run build
```

构建结果：

```text
/www/wwwroot/personal-portfolio/app-8p3pb8bea7sx/dist
```

---

## 六、PM2 启动后端

```bash
cd /www/wwwroot/personal-portfolio/backend
pm2 start src/server.js --name personal-portfolio-backend
pm2 save
```

如果已存在旧进程：

```bash
pm2 restart personal-portfolio-backend
```

查看状态：

```bash
pm2 status
pm2 logs personal-portfolio-backend
```

---

## 七、Nginx 配置示例

```nginx
server {
    listen 80;
    server_name www.bohenan.com bohenan.com;

    root /www/wwwroot/personal-portfolio/dist;
    index index.html;

    # 个人网站前端
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 个人网站后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:3002/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 上传资源
    location /uploads/ {
        proxy_pass http://127.0.0.1:3002/uploads/;
        proxy_set_header Host $host;
    }

    # 大交通仪表盘：/traffic/
    location /traffic/ {
        alias /www/wwwroot/personal-portfolio/app-8p3pb8bea7sx/dist/;
        index index.html;
        try_files $uri $uri/ /traffic/index.html;
    }
}
```

配置后检查并重载：

```bash
nginx -t
systemctl reload nginx
```

---

## 八、HTTPS

建议在宝塔面板或 Certbot 中为以下域名配置证书：

```text
www.bohenan.com
bohenan.com
```

如果使用 Certbot：

```bash
certbot --nginx -d www.bohenan.com -d bohenan.com
```

---

## 九、个人网站大交通入口

个人网站后端配置：

```text
backend/data/siteConfig.json
```

当前已配置：

```json
"dashboardUrl": "https://www.bohenan.com/traffic/"
```

因此个人网站内的大交通入口会指向：

```text
https://www.bohenan.com/traffic/
```

---

## 十、上线后检查清单

### 个人网站

```text
https://www.bohenan.com/
https://www.bohenan.com/admin/login
https://www.bohenan.com/api/health
```

### 大交通仪表盘

```text
https://www.bohenan.com/traffic/
https://www.bohenan.com/traffic/admin
https://www.bohenan.com/traffic/backend
https://www.bohenan.com/traffic/upload
```

### 上传资源

```text
https://www.bohenan.com/uploads/xxx.jpg
```

---

## 十一、注意事项

1. `.env` 文件不提交 Git，需要服务器手动创建。
2. 大交通仪表盘部署在 `/traffic/`，因此已配置：
   - Vite `base: /traffic/`
   - React Router `basename: /traffic`
3. 大交通项目内部的 `VITE_APP_ID=app-8p3pb8bea7sx` 不建议修改。
4. 如果大交通页面空白，优先检查：
   - `/traffic/assets/...` 是否 404
   - `/traffic/echarts.min.js` 是否可访问
   - 浏览器 Console 是否有 Supabase 环境变量错误
5. 如果 Webhook 企业微信/飞书失败，检查后端代理日志：

```bash
pm2 logs personal-portfolio-backend
```

---

## 十二、构建验证记录

本地已验证：

```bash
npm run build
```

个人网站构建通过。

```bash
cd app-8p3pb8bea7sx
npm run build
```

大交通仪表盘构建通过。
