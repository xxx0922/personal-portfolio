# 数据抓取 Skills 安装与使用指南

> 📅 最后更新：2026-04-17
> 🔧 配套：OpenClaw 框架 + 飞书 CLI
> 📊 功能：网页抓取、数据提取、内容自动化

---

## 📋 目录

- [一、Skills 简介](#一 skills-简介)
- [二、安装数据抓取 Skills](#二安装数据抓取 Skills)
- [三、核心 Skills 详解](#三核心-skills-详解)
- [四、实战案例](#四实战案例)
- [五、自定义数据抓取](#五自定义数据抓取)
- [六、注意事项](#六注意事项)

---

## 一、Skills 简介

### 什么是 Skills？

Skills 是飞书 CLI 的能力扩展模块，相当于一个个独立的"插件"或"工具包"。每个 Skills 都封装了一组特定的飞书 API 操作或业务逻辑。

### 数据抓取相关 Skills

| Skill 名称 | 功能描述 |
|-----------|---------|
| `baoyu-url-to-markdown` | 网页转 Markdown，支持登录态页面 |
| `baoyu-baoyu-image-gen` | AI 图片生成 |
| `weixin-article-to-markdown` | 微信公众号文章抓取 |
| `lark-doc` | 飞书云文档读写 |
| `lark-sheets` | 飞书电子表格操作 |
| `lark-base` | 飞书多维表格操作 |
| `ppocrv5` | 图片文字识别（OCR） |
| `webfetch` | 网页内容抓取 |

---

## 二、安装数据抓取 Skills

### 2.1 基础安装命令

```bash
# 安装单个 Skill
npx skills add baoyu-url-to-markdown

# 批量安装多个 Skills
npx skills add baoyu-url-to-markdown weixin-article-to-markdown ppocrv5

# 全局安装（所有项目可用）
npx skills add baoyu-url-to-markdown -g

# 从 GitHub 仓库安装
npx skills add https://github.com/larksuite/cli/skills/baoyu-url-to-markdown -y -g
```

### 2.2 推荐安装的抓取类 Skills

```bash
# 一键安装推荐的数据抓取 Skills 集合
npx skills add baoyu-url-to-markdown -y -g
npx skills add baoyu-format-markdown -y -g
npx skills add ppocrv5 -y -g
npx skills add wechat-article-to-markdown -y -g
npx skills add baoyu-image-gen -y -g
npx skills add baoyu-danger-gemini-web -y -g
```

### 2.3 验证安装

```bash
# 查看已安装的 Skills
lark-cli skills list

# 查看特定 Skill 的详情
lark-cli skills show baoyu-url-to-markdown
```

---

## 三、核心 Skills 详解

### 3.1 baoyu-url-to-markdown

**功能**：将任意网页转换为 Markdown 格式

**触发词**：
- "抓取这个网页"
- "把 URL 转 markdown"
- "下载网页内容"

**使用示例**：

```
# 在 Claude Code 中输入
帮我抓取这个网页并转换为 markdown：
https://example.com/article/123
```

**特殊功能**：
- 支持需要登录的页面（使用 Chrome CDP）
- 自动等待页面加载完成
- 可配置等待用户信号（用于需要交互的页面）

---

### 3.2 wechat-article-to-markdown

**功能**：抓取微信公众号文章并转换为 Markdown

**触发词**：
- "微信文章转 markdown"
- "抓取公众号文章"
- "保存微信链接"

**使用示例**：

```
# 提供微信公众号文章链接
帮我把这篇文章转成 markdown 保存到本地：
https://mp.weixin.qq.com/s/xxxxxx
```

**特性**：
- 自动下载文章图片到本地
- 使用 Camoufox 反检测浏览器
- 自动保存到 Obsidian 仓库（如配置）

---

### 3.3 ppocrv5（OCR 识别）

**功能**：从图片中提取文字

**触发词**：
- "提取图片文字"
- "OCR 识别"
- "读取图片中的文字"

**使用示例**：

```
# 识别本地图片
帮我识别这张图片中的文字：./screenshot.png

# 识别网络图片
提取这个图片 URL 中的文字：https://example.com/image.png
```

**支持格式**：
- PNG、JPG、GIF、BMP
- PDF 文档
- 截图、扫描件、照片

---

### 3.4 baoyu-image-gen

**功能**：AI 图片生成

**触发词**：
- "生成图片"
- "AI 作画"
- "创建插图"

**使用示例**：

```
# 文生图
帮我生成一张图片：一只猫在太空船上

# 图生图（提供参考图）
参考这张图的风格，生成类似的图片：[上传图片]
```

**支持 API**：
- DashScope (WAN2.7)
- OpenAI DALL-E
- Google Imagen

---

### 3.5 lark-doc / lark-sheets / lark-base

**功能**：飞书云文档/表格/多维表格操作

**使用示例**：

```
# 创建文档
帮我创建一个飞书文档，标题为"数据抓取报告"

# 搜索文档
查找我最近创建的文档

# 写入抓取的数据
把抓取到的数据写入飞书表格
```

---

## 四、实战案例

### 案例 1：批量抓取公众号文章

```
# 在 Claude Code 中输入
我有以下公众号文章链接，请帮我全部抓取并转换为 markdown：
1. https://mp.weixin.qq.com/s/xxx1
2. https://mp.weixin.qq.com/s/xxx2
3. https://mp.weixin.qq.com/s/xxx3

每篇文章保存到 docs/wechat/ 目录，文件名为文章标题
```

### 案例 2：网页数据提取 + 飞书表格

```
# 抓取网页表格数据
帮我抓取这个网页中的表格数据：https://example.com/data

然后将数据整理后写入飞书电子表格，创建一个新的 sheet
```

### 案例 3：竞品分析自动化

```
# 多网站信息收集
帮我分析以下竞争对手的产品页面：
1. https://competitor1.com/product
2. https://competitor2.com/product

提取产品特性、价格、用户评价，汇总到一个飞书文档中
```

### 案例 4：日报自动化

```
# 定时抓取 + 自动发送
每天早上 9 点：
1. 抓取指定新闻网站的头条
2. 提取关键信息
3. 发送到飞书群聊
```

---

## 五、自定义数据抓取

### 5.1 创建自己的抓取 Skill

当你有特定的抓取需求时，可以创建自定义 Skill：

```bash
# 创建 Skill 模板
lark-cli skill-maker create my-crawler

# 编辑 Skill 配置
# 在 skills/my-crawler/SKILL.md 中定义抓取逻辑
```

### 5.2 组合多个 Skills

可以通过组合多个 Skills 实现复杂的数据抓取流程：

```
1. 使用 baoyu-url-to-markdown 抓取网页
2. 使用 baoyu-format-markdown 格式化内容
3. 使用 baoyu-image-gen 生成配图
4. 使用 lark-doc 发布到飞书文档
5. 使用 lark-im 发送到群聊
```

### 5.3 定时任务配置

```bash
# 使用 cron 配置定时抓取
# 在 settings.json 中配置 hooks

{
  "hooks": {
    "before-tool-use": {
      "schedule": "0 9 * * *",
      "command": "lark-cli task create --title '每日抓取'"
    }
  }
}
```

---

## 六、注意事项

### ⚠️ 合规提醒

1. **遵守网站 Robots 协议**
   - 不要抓取明确禁止的网站
   - 尊重网站的抓取限制

2. **注意数据使用权限**
   - 仅抓取公开数据
   - 不要用于商业用途（除非获得授权）
   - 遵守版权和隐私法规

3. **控制抓取频率**
   - 避免高频请求导致服务器压力
   - 设置合理的请求间隔

### 🔒 安全建议

1. **不要抓取敏感信息**
   - 个人信息
   - 商业机密
   - 受保护的数据

2. **妥善保管 API 密钥**
   - 不要将密钥提交到代码仓库
   - 使用环境变量管理密钥

3. **审查第三方 Skill**
   - 只安装可信来源的 Skill
   - 查看 Skill 源码了解其行为

---

## 📚 参考资源

| 资源 | 链接 |
|-----|------|
| 飞书 CLI GitHub | https://github.com/larksuite/cli |
| Skills 集合 | https://github.com/larksuite/cli/tree/main/skills |
| OpenClaw 训练营 | https://waytoagi.feishu.cn/wiki/WewVwPVkyipyaCka7twcwPZMnJf |
| 飞书 CLI 使用方法 | https://waytoagi.feishu.cn/wiki/Zsp2wxsKEiRTEjkajJFc7FBGnh3 |

---

## 🎯 快速开始检查清单

- [ ] 已安装 Node.js 和 npm
- [ ] 已安装飞书 CLI (`npm install -g @larksuite/cli`)
- [ ] 已安装 Skills (`npx skills add ...`)
- [ ] 已完成飞书账号授权 (`lark-cli auth login`)
- [ ] 已安装 Claude Code（推荐）
- [ ] 已测试基础抓取功能

---

<div align="center">

**🚀 开始你的数据抓取之旅！**

遇到问题欢迎在飞书学员群中交流

</div>
