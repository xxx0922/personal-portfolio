# 个人作品集网站开发文档

## 第3部分：域名购买和DNS解析配置

---

## 📋 目录

1. [域名基础知识](#域名基础知识)
2. [域名购买](#域名购买)
3. [DNS 解析配置](#dns-解析配置)
4. [SSL 证书申请](#ssl-证书申请)
5. [验证域名解析](#验证域名解析)

---

## 域名基础知识

### 什么是域名

域名是互联网上用于标识网站的人类可读地址。例如：
- `www.google.com`
- `www.bohenan.com`
- `github.com`

### 域名结构

```
www.bohenan.com
 │    │      │
 │    │      └── 顶级域名（TLD）: .com
 │    └── 二级域名（SLD）: bohenan
 └── 子域名（Subdomain）: www
```

### 常见顶级域名

#### 通用顶级域名（gTLD）
- `.com`：商业组织（最流行）
- `.net`：网络服务商
- `.org`：非营利组织
- `.info`：信息网站
- `.io`：科技公司（流行于初创公司）
- `.dev`：开发者网站

#### 国家顶级域名（ccTLD）
- `.cn`：中国
- `.us`：美国
- `.uk`：英国
- `.jp`：日本

#### 新顶级域名
- `.tech`：技术类
- `.site`：网站
- `.online`：在线服务
- `.app`：应用程序

### 域名选择建议

1. **简短易记**：越短越好，容易记忆
2. **品牌相关**：与个人品牌或业务相关
3. **避免特殊字符**：不要使用连字符、数字（除非必要）
4. **优先 .com**：最常见，用户习惯
5. **检查商标**：确保不侵犯他人商标

---

## 域名购买

### 主流域名注册商

#### 1. 阿里云（推荐国内用户）
- **官网**：https://wanwang.aliyun.com/
- **价格**：.com 首年 ¥55-78，续费 ¥69
- **优点**：
  - 中文界面
  - 支付宝/微信支付
  - 与阿里云服务集成
  - 客服支持好
- **缺点**：
  - 续费价格较高
  - .com.cn 域名需要备案

#### 2. 腾讯云
- **官网**：https://dnspod.cloud.tencent.com/
- **价格**：.com 首年 ¥23-55，续费 ¥69
- **优点**：
  - 新用户优惠力度大
  - DNSPod 解析速度快
  - 中文支持
- **缺点**：
  - 续费价格较高

#### 3. GoDaddy
- **官网**：https://www.godaddy.com/
- **价格**：.com 首年 $0.99-19.99，续费 $19.99
- **优点**：
  - 全球最大域名注册商
  - 促销活动多
  - 支持多种支付方式
- **缺点**：
  - 英文界面
  - 续费价格较高
  - 客服响应慢

#### 4. Namecheap
- **官网**：https://www.namecheap.com/
- **价格**：.com 首年 $8.88，续费 $13.98
- **优点**：
  - 价格公道
  - 免费 WHOIS 隐私保护
  - 界面简洁
- **缺点**：
  - 英文界面
  - 需要信用卡或 PayPal

#### 5. Cloudflare Registrar
- **官网**：https://www.cloudflare.com/products/registrar/
- **价格**：成本价（.com 约 $9.77/年）
- **优点**：
  - 成本价，无加价
  - 免费 DNS 和 CDN
  - 安全性高
- **缺点**：
  - 需要先有 Cloudflare 账号
  - 域名种类有限

### 阿里云购买流程

#### 步骤 1：搜索域名

1. 访问 https://wanwang.aliyun.com/
2. 在搜索框输入想要的域名（不含后缀）
   - 例如：`bohenan`
3. 点击 **"查域名"**
4. 查看可用性：
   - ✅ 绿色勾号：可注册
   - ❌ 红色叉号：已被注册

#### 步骤 2：选择域名

1. 选择可用的域名后缀（推荐 .com）
2. 点击 **"加入清单"**
3. 可以同时购买多个域名（如 .com 和 .cn）

#### 步骤 3：填写域名信息

1. 点击 **"结算"**
2. 选择购买年限（建议 1-3 年）
3. 填写域名所有者信息：
   - **域名持有者类型**：个人
   - **域名持有者**：真实姓名
   - **证件类型**：身份证
   - **证件号码**：身份证号
   - **省份/城市**：居住地址
   - **详细地址**：详细地址
   - **邮箱**：常用邮箱（重要！）
   - **手机号**：常用手机号

> ⚠️ **重要提示**：
> - 域名信息必须真实，否则可能被收回
> - 邮箱必须真实有效，用于接收验证邮件
> - 国内域名（如 .cn）需要提交实名认证

#### 步骤 4：完成支付

1. 勾选同意服务协议
2. 选择支付方式（支付宝/微信/银行卡）
3. 完成支付

#### 步骤 5：实名认证（必需）

1. 支付完成后，进入 **"控制台"** → **"域名"**
2. 找到刚购买的域名，状态为 **"未实名认证"**
3. 点击 **"实名认证"**
4. 上传证件照片：
   - 个人：身份证正反面
   - 企业：营业执照
5. 提交审核（通常 1-3 个工作日）

> ⚠️ **注意**：域名未完成实名认证会被锁定，无法解析

---

## DNS 解析配置

### DNS 基础知识

DNS（Domain Name System）是将域名转换为 IP 地址的系统。

#### 常见记录类型

| 记录类型 | 说明 | 示例 |
|---------|------|------|
| **A** | 将域名指向 IPv4 地址 | `bohenan.com` → `34.80.123.45` |
| **AAAA** | 将域名指向 IPv6 地址 | `bohenan.com` → `2001:db8::1` |
| **CNAME** | 将域名指向另一个域名 | `www.bohenan.com` → `bohenan.com` |
| **MX** | 邮件服务器记录 | `bohenan.com` → `mail.bohenan.com` |
| **TXT** | 文本记录，用于验证 | SPF、DKIM 等 |
| **NS** | 域名服务器记录 | 指定 DNS 服务器 |

### 阿里云 DNS 解析配置

#### 步骤 1：进入域名解析

1. 登录阿里云控制台
2. 进入 **"域名"** → **"域名列表"**
3. 找到你的域名，点击 **"解析"**

#### 步骤 2：添加 A 记录（主域名）

1. 点击 **"添加记录"**
2. 配置记录：
   - **记录类型**：A
   - **主机记录**：@（表示根域名）
   - **解析线路**：默认
   - **记录值**：你的服务器公网 IP（如 `34.80.123.45`）
   - **TTL**：10分钟（600秒）
3. 点击 **"确认"**

**效果**：`bohenan.com` → 指向服务器 IP

#### 步骤 3：添加 A 记录（www 子域名）

1. 再次点击 **"添加记录"**
2. 配置记录：
   - **记录类型**：A
   - **主机记录**：www
   - **解析线路**：默认
   - **记录值**：你的服务器公网 IP
   - **TTL**：10分钟
3. 点击 **"确认"**

**效果**：`www.bohenan.com` → 指向服务器 IP

#### 步骤 4：添加 CNAME 记录（可选）

如果你想让 `www.bohenan.com` 自动跳转到 `bohenan.com`，可以使用 CNAME：

1. 删除 www 的 A 记录
2. 添加 CNAME 记录：
   - **记录类型**：CNAME
   - **主机记录**：www
   - **记录值**：`bohenan.com`
   - **TTL**：10分钟

**推荐做法**：使用 A 记录，然后在 Nginx 配置 301 重定向

### 其他域名注册商配置

#### GoDaddy DNS 配置

1. 登录 GoDaddy 账户
2. 进入 **"My Products"** → **"Domains"**
3. 点击域名右侧的 **"DNS"** 按钮
4. 在 DNS Records 部分：
   - 点击 **"Add"** 添加 A 记录
   - Type: `A`
   - Name: `@`
   - Value: 服务器 IP
   - TTL: 600 seconds
5. 再添加一条：
   - Type: `A`
   - Name: `www`
   - Value: 服务器 IP
   - TTL: 600 seconds
6. 点击 **"Save"**

#### Cloudflare DNS 配置

1. 登录 Cloudflare 账户
2. 选择你的域名
3. 进入 **"DNS"** 标签
4. 点击 **"Add record"**：
   - Type: `A`
   - Name: `@`
   - IPv4 address: 服务器 IP
   - Proxy status: 🟠 Proxied（橙色云朵，启用CDN）
5. 再添加：
   - Type: `A`
   - Name: `www`
   - IPv4 address: 服务器 IP
   - Proxy status: 🟠 Proxied
6. 点击 **"Save"**

> 💡 **提示**：Cloudflare 的 Proxied 模式会启用 CDN 加速和 DDoS 保护

### DNS 解析配置示例

假设域名是 `bohenan.com`，服务器 IP 是 `34.80.123.45`：

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| @ | A | 34.80.123.45 | 600 |
| www | A | 34.80.123.45 | 600 |
| * | A | 34.80.123.45 | 600（可选，泛解析）|

---

## SSL 证书申请

### 为什么需要 SSL

- ✅ **数据加密**：保护用户隐私
- ✅ **SEO 优势**：Google 优先收录 HTTPS 网站
- ✅ **浏览器信任**：避免"不安全"警告
- ✅ **必备功能**：某些 API（如地理位置）要求 HTTPS

### Let's Encrypt 免费 SSL

Let's Encrypt 提供免费的 SSL 证书，有效期 90 天，支持自动续期。

#### 安装 Certbot

```bash
# 安装 Certbot 和 Nginx 插件
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

#### 申请 SSL 证书

```bash
# 方法 1：自动配置（推荐）
sudo certbot --nginx -d bohenan.com -d www.bohenan.com

# 方法 2：仅获取证书，手动配置
sudo certbot certonly --nginx -d bohenan.com -d www.bohenan.com
```

#### 交互式配置

```
1. 输入邮箱（用于接收续期通知）
   Email address: your_email@example.com

2. 同意服务条款
   (A)gree: A

3. 是否接收 EFF 的邮件（可选）
   (Y)es/(N)o: N

4. 选择是否重定向 HTTP 到 HTTPS
   Select the appropriate number [1-2]: 2（推荐选择 2，自动重定向）
```

#### 证书文件位置

证书安装成功后，文件位置：

```
/etc/letsencrypt/live/bohenan.com/
├── fullchain.pem    # 完整证书链
├── privkey.pem      # 私钥
├── cert.pem         # 证书
└── chain.pem        # 证书链
```

#### 设置自动续期

```bash
# 测试续期
sudo certbot renew --dry-run

# Certbot 会自动设置 cron 任务
# 查看续期任务
sudo systemctl list-timers | grep certbot

# 手动续期（如果需要）
sudo certbot renew
```

### 阿里云免费 SSL 证书（备选）

#### 步骤 1：申请证书

1. 进入阿里云控制台
2. 选择 **"SSL 证书"** → **"免费证书"**
3. 点击 **"立即购买"**（免费的）
4. 填写域名信息
5. 选择验证方式（推荐 DNS 验证）
6. 提交审核

#### 步骤 2：DNS 验证

1. 审核时会给出一条 TXT 记录
2. 在域名解析中添加这条 TXT 记录
3. 等待验证通过（几分钟到几小时）

#### 步骤 3：下载证书

1. 证书签发后，下载证书文件（选择 Nginx 格式）
2. 解压得到：
   - `xxx.pem`：证书文件
   - `xxx.key`：私钥文件

#### 步骤 4：上传到服务器

```bash
# 创建证书目录
sudo mkdir -p /etc/nginx/ssl

# 上传证书文件（使用 scp 或其他工具）
# 本地执行：
scp xxx.pem root@服务器IP:/etc/nginx/ssl/
scp xxx.key root@服务器IP:/etc/nginx/ssl/

# 设置权限
sudo chmod 600 /etc/nginx/ssl/xxx.key
sudo chmod 644 /etc/nginx/ssl/xxx.pem
```

---

## 验证域名解析

### 1. 使用 ping 命令

```bash
# 测试主域名
ping bohenan.com

# 测试 www 子域名
ping www.bohenan.com

# 应该返回服务器 IP 地址
```

### 2. 使用 nslookup

```bash
# Windows / macOS / Linux
nslookup bohenan.com

# 应该看到：
# Name:    bohenan.com
# Address: 34.80.123.45
```

### 3. 使用 dig（Linux / macOS）

```bash
# 查询 A 记录
dig bohenan.com A

# 查询 www 子域名
dig www.bohenan.com A

# 简洁输出
dig +short bohenan.com
```

### 4. 在线工具

访问以下网站进行检测：

- **DNS Checker**：https://dnschecker.org/
  - 输入域名，查看全球解析情况

- **What's My DNS**：https://www.whatsmydns.net/
  - 查看不同地区的 DNS 解析结果

- **MXToolbox**：https://mxtoolbox.com/SuperTool.aspx
  - 综合 DNS 检测工具

### 5. 浏览器测试

```
# HTTP 访问
http://bohenan.com
http://www.bohenan.com

# HTTPS 访问（SSL 配置后）
https://bohenan.com
https://www.bohenan.com
```

---

## 常见问题排查

### 问题 1：域名解析不生效

**原因**：
- DNS 解析需要时间（TTL 生效时间）
- 本地 DNS 缓存

**解决方案**：
```bash
# Windows 清除 DNS 缓存
ipconfig /flushdns

# macOS 清除 DNS 缓存
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Linux 清除 DNS 缓存
sudo systemd-resolve --flush-caches
```

### 问题 2：www 和不带 www 不一致

**解决方案**：
确保同时添加了两条 A 记录：
- @ → 服务器 IP
- www → 服务器 IP

或者在 Nginx 配置 301 重定向（推荐）。

### 问题 3：SSL 证书申请失败

**常见原因**：
- 域名解析未生效
- 80 端口未开放
- Nginx 配置错误

**解决方案**：
```bash
# 检查 80 端口
sudo netstat -tlnp | grep :80

# 检查防火墙
sudo ufw status

# 检查 Nginx 配置
sudo nginx -t

# 查看 Certbot 详细日志
sudo certbot --nginx -d bohenan.com -d www.bohenan.com --debug
```

### 问题 4：证书过期

**解决方案**：
```bash
# 手动续期
sudo certbot renew

# 强制续期
sudo certbot renew --force-renewal

# 重启 Nginx
sudo systemctl reload nginx
```

---

## DNS 配置检查清单

- [ ] 购买域名并完成实名认证
- [ ] 添加 A 记录（@ → 服务器 IP）
- [ ] 添加 A 记录（www → 服务器 IP）
- [ ] 验证域名解析（ping / nslookup / dig）
- [ ] 申请 SSL 证书（Let's Encrypt 或阿里云）
- [ ] 配置 HTTPS（Nginx）
- [ ] 测试 HTTPS 访问
- [ ] 设置自动续期（Let's Encrypt）

---

## 下一步

域名和 SSL 配置完成后，接下来：

1. **第4部分**：部署前端应用到服务器
2. **第5部分**：部署后端应用到服务器
3. **第6部分**：配置 Nginx 反向代理

---

**文档版本**：v1.0
**最后更新**：2024-12-12
