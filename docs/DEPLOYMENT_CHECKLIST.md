# 🚀 生产环境部署安全检查清单

在部署到生产环境之前，请确保完成以下所有步骤。

---

## 🔐 一、环境变量配置（必须）

### 后端 `.env` 文件检查

```bash
cd backend
```

- [ ] **JWT_SECRET** - 生成强随机密钥
  ```bash
  # 使用以下命令生成
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  将生成的密钥填入 `.env`：
  ```
  JWT_SECRET=上面生成的密钥（至少 32 字符）
  ```

- [ ] **JWT_EXPIRES_IN** - Token 过期时间
  ```
  JWT_EXPIRES_IN=8h
  ```

- [ ] **INITIAL_ADMIN_PASSWORD** - 管理员初始密码
  ```
  INITIAL_ADMIN_PASSWORD=你的强密码（至少 8 位，包含大小写字母+数字+符号）
  ```

- [ ] **ALBUM_PASSWORD** - 相册密码
  ```
  ALBUM_PASSWORD=你的密码
  ```

- [ ] **CORS_ORIGIN** - 允许的域名
  ```
  CORS_ORIGIN=https://yourdomain.com
  ```

- [ ] **NODE_ENV** - 环境设置
  ```
  NODE_ENV=production
  ```

### 前端 `.env.production` 文件

- [ ] 创建 `.env.production` 文件
  ```
  VITE_API_URL=https://yourdomain.com/api
  VITE_SITE_URL=https://yourdomain.com
  ```

---

## 🔒 二、HTTPS 配置

### Netlify 部署（推荐）

- [ ] 在 Netlify 添加自定义域名
- [ ] 配置 DNS 记录
- [ ] 等待 HTTPS 证书自动签发（约 5-10 分钟）
- [ ] 验证 HTTPS 访问正常

### 自建服务器

- [ ] 安装 Let's Encrypt Certbot
- [ ] 申请 SSL 证书
  ```bash
  sudo certbot --nginx -d yourdomain.com
  ```
- [ ] 配置 Nginx HTTPS
- [ ] 设置自动续期

---

## 🛡️ 三、安全加固

### 后端安全

- [ ] 安装安全依赖
  ```bash
  cd backend
  npm install express-rate-limit helmet
  ```

- [ ] 配置速率限制（创建 `scripts/security-setup.js`）

- [ ] 安装 helmet（HTTP 安全头）
  ```bash
  npm install helmet
  ```

- [ ] 在 `server.js` 中添加：
  ```javascript
  import helmet from 'helmet';
  app.use(helmet());
  ```

### 数据库备份

- [ ] 备份 `backend/data/` 目录
- [ ] 设置自动备份脚本
- [ ] 测试恢复流程

---

## 📦 四、部署步骤

### Netlify 部署

1. **推送代码到 Git**
   ```bash
   git add .
   git commit -m "Prepare for production"
   git push
   ```

2. **连接 Netlify**
   - 登录 https://netlify.com
   - 导入 Git 仓库
   - 设置构建命令：`npm run build`
   - 设置发布目录：`dist`

3. **配置环境变量**
   在 Netlify Dashboard → Site Settings → Environment Variables 添加：
   - `VITE_API_URL`

4. **部署**
   - 点击 "Deploy site"
   - 等待构建完成

### 验证部署

- [ ] 首页加载正常
- [ ] API 请求成功
- [ ] 登录/退出功能正常
- [ ] 图片上传功能正常
- [ ] 相册密码保护正常
- [ ] 移动端响应式正常

---

## 🔍 五、性能优化

### 前端优化

- [ ] 启用代码分割
- [ ] 图片懒加载（已实现）
- [ ] 启用缓存策略

### 后端优化

- [ ] 启用 Gzip 压缩
- [ ] 配置 CDN（可选）
- [ ] 数据库索引优化

---

## 📊 六、监控与日志

### 建议配置

- [ ] 错误监控（Sentry）
- [ ] 性能监控（Google Analytics）
- [ ] 日志记录（Logrocket）

### 日志检查

- [ ] 无敏感信息泄露
- [ ] 错误日志完整记录
- [ ] 访问日志开启

---

## ✅ 七、最终检查

### 功能测试

- [ ] 所有页面加载正常
- [ ] 所有表单提交正常
- [ ] 所有图片显示正常
- [ ] 所有链接跳转正常

### 安全测试

- [ ] 未登录无法访问管理后台
- [ ] Token 过期自动跳转登录
- [ ] CORS 配置正确
- [ ] HTTPS 无 Mixed Content 警告

### 性能测试

- [ ] 首屏加载 < 3 秒
- [ ] Lighthouse 分数 > 90

---

## 🆘 常见问题

### 1. 部署后 API 请求失败

**检查**：
- `VITE_API_URL` 是否正确
- CORS 配置是否包含生产域名
- 后端服务是否运行

### 2. HTTPS 证书警告

**解决**：
- 等待证书签发（Netlify 自动）
- 或检查 Certbot 配置

### 3. 图片无法上传

**检查**：
- `uploads/` 目录权限
- 文件大小限制
- 文件类型白名单

---

## 📞 支持

如遇到问题，请检查：
1. Netlify 部署日志
2. 浏览器控制台错误
3. 后端日志

---

**最后更新**: 2026-04-28
