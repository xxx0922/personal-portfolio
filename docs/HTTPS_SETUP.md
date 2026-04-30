# HTTPS 配置指南

## 📋 概述

本文档说明如何为个人门户项目配置 HTTPS，包括本地开发和生产环境。

---

## 🔧 一、本地开发环境

### 方案 1：使用 Vite 内置 HTTPS（推荐）

在 `personal-portfolio/package.json` 中修改启动命令：

```json
{
  "scripts": {
    "dev": "vite --https"
  }
}
```

或在 `.env` 中添加：
```
VITE_HTTPS=true
```

**优点**：简单快速，Vite 自动处理证书
**缺点**：浏览器会显示证书警告

### 方案 2：使用 mkcert 生成可信证书

1. **安装 mkcert**
   ```bash
   # Windows (使用 Chocolatey)
   choco install mkcert

   # macOS
   brew install mkcert

   # Linux
   sudo apt install libnss3-tools && curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64" && chmod +x mkcert-* && sudo cp mkcert-* /usr/local/bin/mkcert
   ```

2. **安装本地 CA**
   ```bash
   mkcert -install
   ```

3. **生成证书**
   ```bash
   cd personal-portfolio
   mkcert localhost 127.0.0.1
   ```

4. **配置 Vite**
   创建 `vite.config.js`：
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import fs from 'fs';

   export default defineConfig({
     plugins: [react()],
     server: {
       https: {
         key: fs.readFileSync('./localhost-key.pem'),
         cert: fs.readFileSync('./localhost.pem')
       },
       port: 5173
     }
   });
   ```

**优点**：浏览器信任的证书，无警告
**缺点**：需要额外安装工具

---

## 🌐 二、生产环境（Netlify 部署）

### Netlify 自动 HTTPS（推荐）

Netlify 自动提供 Let's Encrypt 证书，无需额外配置。

1. **自定义域名**
   - 在 Netlify Dashboard → Domain Settings 添加域名
   - 按照提示配置 DNS

2. **自动 HTTPS**
   - Netlify 自动申请并续期证书
   - 强制 HTTPS 重定向自动启用

### Netlify 配置文件

创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

---

## 🔒 三、后端 HTTPS 配置

### 本地开发

如需要后端支持 HTTPS，创建 `scripts/setup-https.js`：

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查证书是否存在
const keyPath = path.join(__dirname, '../ssl/server.key');
const certPath = path.join(__dirname, '../ssl/server.crt');

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.log('📄 Generating self-signed certificate...');

  // 使用 openssl 生成
  const { execSync } = require('child_process');

  // 创建 ssl 目录
  const sslDir = path.join(__dirname, '../ssl');
  if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
  }

  // 生成证书
  execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`);

  console.log('✅ Certificate generated successfully!');
} else {
  console.log('✅ Certificate already exists');
}
```

### 生产环境

如果使用独立服务器部署后端：

1. **使用 Nginx 反向代理（推荐）**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       location /api {
           proxy_pass http://localhost:3002;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }

   # HTTP 重定向到 HTTPS
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

2. **使用 Let's Encrypt**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## ✅ 四、验证 HTTPS 配置

### 检查清单

- [ ] 证书有效且未过期
- [ ] HTTP 自动重定向到 HTTPS
- [ ] 所有静态资源使用 HTTPS 加载
- [ ] Mixed Content 警告已解决
- [ ] HSTS 头已配置

### 在线工具

- [SSL Labs 测试](https://www.ssllabs.com/ssltest/)
- [Why No Padlock](https://www.whynopadlock.com/)

---

## 🚨 五、常见问题

### 1. 浏览器显示"您的连接不是私密连接"

**原因**：自签名证书不被浏览器信任

**解决方案**：
- 使用 mkcert 生成可信证书（推荐）
- 或点击"高级" → "继续访问"（仅开发环境）

### 2. Mixed Content 错误

**原因**：HTTPS 页面加载了 HTTP 资源

**解决方案**：
- 检查所有 API 请求使用 `https://`
- 更新所有外部资源链接为 HTTPS

### 3. CORS 错误

**原因**：HTTPS 前端访问 HTTP 后端

**解决方案**：
- 确保前后端都使用 HTTPS
- 或在开发环境允许混合协议

---

## 📦 六、快速启动脚本

创建 `scripts/setup-dev.sh`（或 `.bat`）：

```bash
#!/bin/bash

echo "🚀 Setting up development environment..."

# 安装依赖
npm install
cd backend && npm install && cd ..

# 生成证书（如果使用 mkcert）
if command -v mkcert &> /dev/null; then
  echo "📄 Generating SSL certificates..."
  mkcert localhost 127.0.0.1
fi

echo "✅ Setup complete!"
echo "📝 Start development server: npm run dev"
```

---

## 🔗 相关资源

- [Vite HTTPS 配置](https://vitejs.dev/config/server-options.html#server-https)
- [mkcert 官方文档](https://github.com/FiloSottile/mkcert)
- [Let's Encrypt](https://letsencrypt.org/)
- [Netlify HTTPS](https://docs.netlify.com/domains-https/https/)
