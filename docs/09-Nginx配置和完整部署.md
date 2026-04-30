# 个人作品集网站开发文档

## 第9部分：Nginx配置和完整部署

---

## Nginx反向代理配置

前端和后端都部署完成后，需要配置Nginx将API请求转发到后端服务。

### 什么是反向代理

反向代理是服务器端的代理，它接收客户端请求，然后转发给后端服务器。

**工作流程：**
1. 用户访问 https://你的域名/api/projects
2. 请求到达Nginx服务器
3. Nginx识别这是API请求（路径包含/api）
4. Nginx将请求转发到 http://localhost:3001
5. 后端处理请求并返回数据
6. Nginx将响应返回给用户

**优势：**
- 隐藏后端服务器真实地址
- 统一入口，前后端使用同一个域名
- 可以配置负载均衡
- 可以添加缓存和安全策略

### 完整的Nginx配置文件

编辑Nginx配置文件，配置前端和后端。

**配置文件位置：**
- Ubuntu/Debian：/etc/nginx/sites-available/default 或 /etc/nginx/sites-available/你的域名
- CentOS/RHEL：/etc/nginx/conf.d/default.conf

**完整配置内容：**

#### HTTP重定向块（将HTTP跳转到HTTPS）

```nginx
server {
    listen 80;
    server_name www.bohenan.com bohenan.com;

    # 将所有HTTP请求重定向到HTTPS
    return 301 https://$server_name$request_uri;
}
```

**说明：**
- listen 80：监听HTTP端口
- return 301：永久重定向到HTTPS
- $server_name：用户访问的域名
- $request_uri：用户访问的路径

#### HTTPS主配置块

```nginx
server {
    listen 443 ssl http2;
    server_name www.bohenan.com bohenan.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/bohenan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bohenan.com/privkey.pem;

    # SSL优化配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 请求体大小限制（支持大文件上传）
    client_max_body_size 50M;

    # 前端静态文件配置
    root /var/www/portfolio/frontend;
    index index.html;

    # 前端路由处理（单页应用）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API反向代理
    location /api {
        # 必须：请求体大小限制
        client_max_body_size 50M;

        # 转发到后端服务
        proxy_pass http://localhost:3001;

        # HTTP版本
        proxy_http_version 1.1;

        # 传递真实客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket支持（如果需要）
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件访问（直接访问uploads目录）
    location /uploads {
        alias /var/www/portfolio/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;
}
```

### 配置详解

#### client_max_body_size配置

这个配置非常重要，需要在两个地方设置：

**1. 全局设置（server块）**
限制整个网站的请求体大小。

**2. API location块设置**
特别为API请求设置，确保文件上传不受限制。

**重要说明：**
- 默认值是1MB，上传大文件会失败
- 需要与后端的body-parser限制保持一致
- 两个地方都要设置，否则可能仍然会报413错误

#### proxy_pass配置

将API请求转发到后端服务。

**配置说明：**
- http://localhost:3001：后端服务地址和端口
- 必须与PM2启动的后端端口一致
- 使用localhost因为前后端在同一台服务器

#### proxy_set_header配置

传递客户端信息给后端。

**重要的header：**
- Host：原始请求的域名
- X-Real-IP：客户端真实IP
- X-Forwarded-For：经过的代理IP链
- X-Forwarded-Proto：原始协议（http或https）

后端可以通过这些header获取客户端真实信息。

#### uploads目录配置

允许直接访问上传的文件。

**配置说明：**
- alias：指向实际文件存储目录
- expires 30d：设置缓存30天
- 访问路径：https://域名/uploads/文件名

### 检查配置语法

修改Nginx配置后，必须先测试语法。

**检查结果：**
- syntax is ok：语法正确
- test is successful：配置测试成功

如果有错误，会显示错误位置和原因，需要修正后重新检查。

### 重新加载Nginx

配置正确后，重新加载使配置生效。

**说明：**
- reload：平滑重启，不中断现有连接
- restart：完全重启，会中断所有连接
- 通常使用reload即可

---

## 防火墙和安全组配置

确保所有必需的端口都已开放。

### 服务器防火墙（UFW）

检查和配置UFW防火墙。

#### 查看当前规则

查看防火墙状态和规则。

应该看到以下端口已开放：
- 22/tcp：SSH
- 80/tcp：HTTP
- 443/tcp：HTTPS

#### 如果端口未开放

开放必需的端口。

**说明：**
- 3001端口不需要对外开放，因为通过Nginx代理访问
- 只需要开放80和443即可

### 云服务商安全组

检查云服务商的安全组配置。

#### Google Cloud Platform

1. 进入GCP控制台
2. 找到"VPC网络" → "防火墙规则"
3. 确认有允许HTTP(80)和HTTPS(443)的规则
4. 如果没有，创建新的防火墙规则

#### 阿里云

1. 进入ECS控制台
2. 找到"网络与安全" → "安全组"
3. 点击"配置规则"
4. 确认入方向规则包含：
   - 22端口：SSH
   - 80端口：HTTP
   - 443端口：HTTPS

#### 腾讯云

1. 进入CVM控制台
2. 找到"安全组"
3. 配置入站规则
4. 确保开放22、80、443端口

---

## 完整功能测试

前后端和Nginx都配置完成后，进行完整的功能测试。

### 1. 测试前端访问

#### 访问首页

在浏览器输入你的域名，应该看到网站首页正常显示。

#### 检查HTTPS

- 地址栏显示锁图标
- 点击查看证书，确认有效
- HTTP自动跳转到HTTPS

#### 测试页面路由

点击导航菜单，测试各个页面：
- 项目列表页
- 项目详情页
- 博客列表页
- 文章详情页
- 其他页面

刷新页面，确保不会出现404错误。

### 2. 测试API连接

打开浏览器开发者工具（F12），切换到Network标签。

#### 测试数据加载

访问需要加载数据的页面，观察API请求：
- 请求地址应该是：https://域名/api/...
- 状态码应该是200
- 响应内容应该有数据

#### 检查请求详情

点击某个API请求，查看详情：
- Request URL：确认是你的域名
- Status Code：200表示成功
- Response：查看返回的数据是否正确

### 3. 测试管理后台

#### 访问登录页

访问管理后台登录页（通常是 /admin 或 /login）。

#### 测试登录功能

输入管理员账号和密码，点击登录。

**检查项：**
- 登录成功后跳转到管理后台
- Token保存到localStorage
- 后续请求携带Token

#### 测试内容管理

在管理后台测试各个管理功能：
- 查看列表数据是否正常加载
- 测试添加新内容
- 测试编辑现有内容
- 测试删除功能

### 4. 测试文件上传

在管理后台测试文件上传功能。

#### 测试图片上传

- 选择图片文件（小于50MB）
- 点击上传
- 观察上传进度
- 检查是否返回图片URL
- 访问返回的URL，确认图片可以正常显示

#### 测试音乐上传

- 访问背景音乐设置页面
- 输入歌曲名称
- 选择音乐文件
- 点击上传
- 确认上传成功，歌曲添加到播放列表

#### 测试文档上传

- 访问文档管理页面
- 选择文档文件（测试接近50MB的文件）
- 上传并确认成功

### 5. 测试背景音乐功能

这是一个特别开发的功能，需要重点测试。

#### 前台测试

1. 访问网站首页
2. 查看右下角是否有音乐播放器
3. 点击播放按钮，确认音乐开始播放
4. 测试暂停功能
5. 测试上一首/下一首切换
6. 测试音量调节
7. 测试播放进度显示（如：2/5）
8. 等待歌曲播放完毕，确认自动播放下一首

#### 刷新测试

1. 刷新页面
2. 确认音乐从第一首开始播放（不保存进度）
3. 确认播放状态重置

---

## 性能优化

网站上线后可以进行性能优化。

### 启用HTTP/2

在Nginx配置中启用HTTP/2协议。

在listen指令后添加http2。

**优势：**
- 多路复用，减少连接数
- 头部压缩，减少传输量
- 服务器推送
- 显著提升页面加载速度

### 启用Gzip压缩

Gzip压缩可以大幅减小传输文件大小。

在Nginx配置中添加Gzip配置（已包含在前面的完整配置中）。

**效果：**
- HTML、CSS、JS文件可压缩到原来的20-30%
- 显著减少带宽使用
- 加快页面加载速度

### 配置浏览器缓存

为静态资源设置长期缓存（已包含在前面的配置中）。

**缓存策略：**
- 静态资源（CSS、JS、图片）：缓存1年
- HTML文件：不缓存，确保内容更新
- 上传的文件：缓存30天

### 图片优化

**后端优化：**
- 上传时使用Sharp自动压缩
- 生成缩略图，列表页使用缩略图
- 转换为WebP格式（更小的文件大小）

**前端优化：**
- 使用懒加载组件
- 只加载可见区域的图片
- 响应式图片，不同设备加载不同尺寸

### CDN加速（可选）

如果使用Cloudflare等CDN服务：

**优势：**
- 静态文件缓存到全球节点
- 用户从最近的节点获取资源
- 自动压缩和优化
- DDoS防护
- 免费HTTPS

**配置方法：**
1. 将域名DNS托管到Cloudflare
2. 开启橙色云朵（Proxied模式）
3. 配置缓存规则
4. 开启自动优化功能

---

## 安全加固

### 1. 配置安全headers

在Nginx配置中添加安全headers。

```nginx
# 在server块中添加
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

**headers说明：**
- X-Frame-Options：防止点击劫持
- X-Content-Type-Options：防止MIME类型嗅探
- X-XSS-Protection：启用XSS过滤
- Content-Security-Policy：内容安全策略

### 2. 限制请求速率

防止恶意请求和DDoS攻击。

```nginx
# 在http块中添加
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在location /api块中添加
limit_req zone=api_limit burst=20 nodelay;
```

**说明：**
- 限制每个IP每秒最多10个请求
- burst允许短时间内超过限制
- 超过限制返回503错误

### 3. 隐藏Nginx版本

防止攻击者针对特定版本漏洞攻击。

在http块添加：
```nginx
server_tokens off;
```

### 4. 配置Fail2Ban

Fail2Ban可以自动封禁恶意IP。

已在第3部分介绍安装方法，确保已正确配置。

### 5. 定期更新

定期更新系统和软件，修复已知漏洞。

每周或每月执行一次更新。

---

## 监控和日志

### Nginx访问日志

查看Nginx访问日志，了解网站访问情况。

**日志位置：**
- 访问日志：/var/log/nginx/access.log
- 错误日志：/var/log/nginx/error.log

**查看最新日志：**
查看最后100行日志。

**实时监控：**
实时查看新的访问记录。

### Nginx错误日志

当出现问题时，查看错误日志。

错误日志包含详细的错误信息，有助于排查问题。

### PM2日志

查看后端应用日志。

实时监控后端日志。

### 日志分析

可以使用日志分析工具：
- GoAccess：实时Web日志分析工具
- AWStats：网站统计工具
- ELK Stack：企业级日志分析方案

---

## 备份策略

定期备份是非常重要的。

### 备份内容

需要备份以下内容：
1. 后端数据文件（data目录）
2. 上传的文件（uploads目录）
3. Nginx配置文件
4. SSL证书（如果是手动管理）
5. 前端代码（如果有定制修改）

### 手动备份

创建备份目录，定期备份重要数据。

**备份命令：**
打包data和uploads目录。

复制到安全的地方（如本地电脑或其他服务器）。

### 自动备份脚本

编写备份脚本，定期自动执行。

创建backup.sh脚本，包含备份逻辑，使用cron定时任务每天自动备份。

---

## 域名备案（如果使用国内服务器）

如果使用阿里云或腾讯云的国内机房，需要完成域名备案。

### 备案流程

1. **准备材料**
   - 身份证正反面
   - 域名证书
   - 服务器信息
   - 网站信息

2. **提交初审**
   - 在云服务商平台填写备案信息
   - 上传证件照片
   - 提交审核

3. **拍照核验**
   - 云服务商审核通过后
   - 前往指定地点拍照
   - 或使用手机APP人脸识别

4. **管局审核**
   - 提交到省通信管理局
   - 审核时间7-20个工作日

5. **备案成功**
   - 获得备案号
   - 在网站底部显示备案号

**备案期间：**
- 网站无法通过域名访问
- 可以使用IP地址临时访问
- 或使用海外服务器

---

## 部署完成检查清单

完整部署完成后，检查以下所有项目：

### 前端检查
- [ ] 前端文件已上传到服务器
- [ ] Nginx配置前端静态文件服务
- [ ] 域名可以访问网站首页
- [ ] 所有页面路由正常
- [ ] 刷新页面不会404
- [ ] 响应式布局正常
- [ ] 图片和资源正常加载

### 后端检查
- [ ] 后端代码已上传
- [ ] 依赖已安装
- [ ] 数据目录和上传目录已创建
- [ ] PM2成功启动后端服务
- [ ] 后端服务状态为online
- [ ] PM2已配置开机自启

### Nginx检查
- [ ] Nginx配置语法正确
- [ ] API反向代理配置正确
- [ ] uploads目录可访问
- [ ] 静态资源缓存配置
- [ ] Gzip压缩已启用

### SSL/HTTPS检查
- [ ] SSL证书已申请
- [ ] HTTPS可以正常访问
- [ ] HTTP自动重定向到HTTPS
- [ ] 浏览器显示安全连接
- [ ] 证书自动续期已配置

### 功能检查
- [ ] API请求正常
- [ ] 数据正常加载显示
- [ ] 管理后台登录正常
- [ ] 内容管理功能正常
- [ ] 文件上传功能正常
- [ ] 背景音乐功能正常

### 安全检查
- [ ] 防火墙已配置
- [ ] 安全组规则正确
- [ ] 文件上传大小限制正确
- [ ] JWT认证正常工作
- [ ] 敏感信息已保护

### 性能检查
- [ ] Gzip压缩生效
- [ ] 浏览器缓存配置
- [ ] 页面加载速度正常
- [ ] 图片懒加载工作

### 监控检查
- [ ] 日志正常记录
- [ ] PM2监控正常
- [ ] 备份策略已配置

---