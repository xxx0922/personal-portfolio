# 当前项目总览（CURRENT_PROJECT_OVERVIEW）

> 本文档用于记录 `D:\TRAE\CC\personal-portfolio` 当前真实项目结构和用途。  
> 旧版 `docs/` 中部分文档为早期版本资料，可能与当前项目结构不完全一致。当前项目情况以本文档为准。

---

## 一、当前项目总体说明

当前 `personal-portfolio` 文件夹中主要包含两套核心网站/系统：

1. **个人网站主体**
2. **大交通仪表盘网站**

除此之外，还包含部署文档、维护资料、脚本工具、依赖目录和构建产物。

---

## 二、目录总览

```text
D:\TRAE\CC\personal-portfolio
│
├── src/                         # 个人网站前端源码
├── backend/                     # 个人网站后端服务
├── public/                      # 个人网站静态资源
├── dist/                        # 个人网站构建产物
│
├── app-8p3pb8bea7sx/            # 大交通仪表盘真实代码目录
├── traffic-dashboard/           # 大交通仪表盘说明入口目录
│
├── docs/                        # 项目文档资料
├── netlify/                     # Netlify 部署相关
├── scripts/                     # 辅助脚本
├── tests/                       # 测试目录
│
├── package.json                 # 个人网站前端工程配置
├── package-lock.json            # 个人网站 npm 锁文件
├── vite.config.ts               # 个人网站 Vite 配置
├── tailwind.config.js           # Tailwind 配置
├── start.bat                    # Windows 启动脚本
├── start.sh                     # Linux/Mac 启动脚本
└── README.md                    # 根项目说明
```

---

# 三、个人网站主体

## 1. 位置

```text
src/
backend/
public/
dist/
```

## 2. 用途

个人网站主要用于：

- 个人主页展示
- 个人信息展示
- 项目/产品展示
- 照片相册
- 工具集合
- 专业领域展示
- 联系方式展示
- 个人网站后台管理
- 背景音乐/开机动画/页面主题等体验功能

## 3. 前端目录

```text
src/
├── components/                  # 公共组件
├── components/admin/            # 个人网站后台管理组件
├── contexts/                    # React Context
├── pages/                       # 页面组件
├── types/                       # 类型定义
├── App.tsx                      # 应用路由入口
├── main.tsx                     # 前端入口
└── index.css                    # 全局样式
```

## 4. 主要页面

```text
/                         # 首页
/about                    # 关于
/blog                     # 博客
/news                     # 新闻
/products                 # 产品中心
/tools                    # 工具集合
/professions              # 专业领域
/photos                   # 相册
/search                   # 搜索
/dashboard                # 项目经验/大交通外链入口
/admin/login              # 个人网站后台登录
/admin                    # 个人网站后台
```

## 5. 后端目录

```text
backend/
├── src/
│   ├── server.js                # 后端入口
│   └── routes/                  # API 路由
├── data/                        # JSON 数据文件
├── uploads/                     # 上传资源
└── package.json                 # 后端依赖配置
```

## 6. 后端数据文件

当前 `backend/data/` 中主要有：

```text
articles.json
contact.json
documents.json
experiences.json
media.json
messages.json
news.json
personalInfo.json
photos.json
products.json
professions.json
projects.json
siteConfig.json
skills.json
tools.json
users.json
```

这些 JSON 文件是个人网站的数据源。

## 7. 个人网站端口

根据当前本地运行情况：

```text
个人网站前端：Vite 自动端口，常见为 5173/5176 等
个人网站后端：http://localhost:3002
后端 API：http://localhost:3002/api
```

> 注意：端口可能因本地占用情况自动变化，请以终端输出为准。

---

# 四、大交通仪表盘网站

## 1. 真实代码目录

```text
app-8p3pb8bea7sx/
```

## 2. 说明入口目录

```text
traffic-dashboard/
```

`traffic-dashboard/` 是说明入口目录，里面只有说明文档，真实代码仍在：

```text
../app-8p3pb8bea7sx
```

之所以没有直接重命名真实目录，是因为该目录名同时作为秒哒应用 ID、环境变量和部分外部 API 地址的一部分使用，贸然修改可能导致接口失效。

## 3. 用途

大交通仪表盘是无锡灵山景区交通监控系统，主要用于：

- 实时数据概览
- 当前入园人数监控
- 当日预约游客管理
- 景区停车场状态监控
- 多停车场状态展示
- 停车场满位标记
- 短驳车服务启动/关闭
- 短驳管控点位管理
- 企业微信/钉钉/飞书 Webhook 通知
- 节假日客流对比分析
- 节假日启动短驳对比分析
- 历史客流车流趋势图
- 批量数据上传
- 单条数据录入
- 数据模拟器开关
- 地图/路况入口

## 4. 技术栈

大交通仪表盘使用：

```text
React
TypeScript
Vite
Supabase
ECharts
Recharts
Tailwind CSS
shadcn/ui 风格组件
```

## 5. 主要目录

```text
app-8p3pb8bea7sx/
├── src/
│   ├── pages/                   # 页面
│   ├── components/traffic/      # 交通图表组件
│   ├── components/ui/           # UI 组件
│   ├── contexts/                # Auth 等上下文
│   ├── db/                      # Supabase API 封装
│   ├── types/                   # 交通数据类型
│   └── routes.tsx               # 路由配置
│
├── supabase/
│   ├── functions/               # Edge Functions
│   ├── migrations/              # 数据库迁移和种子 SQL
│   ├── cloud-init.sql           # 初始化 SQL
│   └── config.toml              # Supabase 配置
│
├── public/
│   └── echarts.min.js           # ECharts 本地静态文件
│
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
└── README.md
```

## 6. 大交通主要页面

```text
/                         # 交通监控仪表盘首页
/admin                    # 管理员后台
/backend                  # 后端管理 / Webhook 配置
/upload                   # 数据上传
/reservation              # 预约游客管理
/parking-management       # 停车场管理
/simulator                # 数据模拟器
/history                  # 历史数据查看
/trends                   # 趋势对比
/login                    # 登录
/403                      # 禁止访问
```

## 7. 核心页面说明

### Dashboard

```text
app-8p3pb8bea7sx/src/pages/Dashboard.tsx
```

负责交通仪表盘首页，包含：

- 顶部日期、天气、更新时间、刷新按钮
- 实时数据概览
- 停车场实时状态
- 短驳服务开关
- 短驳管控点位
- 节假日客流对比
- 节假日启动短驳对比
- 历史趋势分析
- 地图入口

### Admin

```text
app-8p3pb8bea7sx/src/pages/Admin.tsx
```

负责交通仪表盘后台首页，包含：

- 后端管理
- 生成报告
- 预约游客管理
- 月亮湾停车场管理
- 数据上传
- 数据模拟器开关

目前已从后台首页移除：

- 历史数据
- 趋势对比

### BackendManagement

```text
app-8p3pb8bea7sx/src/pages/BackendManagement.tsx
```

负责 Webhook 配置，支持：

- 企业微信机器人
- 钉钉机器人
- 飞书机器人
- Lark 国际版机器人
- 消息模板变量替换
- Webhook 测试

### DataUpload

```text
app-8p3pb8bea7sx/src/pages/DataUpload.tsx
```

负责历史数据导入，支持：

- CSV 上传
- Excel 上传
- 下载模板
- 数据预览/粘贴
- 批量导入
- 单条数据录入
- 已导入数据查看和删除

### DataSimulator

```text
app-8p3pb8bea7sx/src/pages/DataSimulator.tsx
```

用于模拟实时数据：

- 模拟入园人数
- 模拟停车场占用
- 模拟道路车流
- 模拟器可在后台开关
- 关闭模拟器后，前端仪表盘不显示模拟数据

---

# 五、大交通 Supabase 内容

## 1. Supabase 目录

```text
app-8p3pb8bea7sx/supabase/
```

## 2. Edge Functions

```text
fetch-visitor-count/
get-wuxi-weather/
send-webhook-notification/
weather-api/
```

说明：当前部分功能已绕过 Edge Function，改用本地后端代理或前端直接接口，以避免 CORS 或部署问题。

## 3. 重要 SQL 文件

```text
seed_shuttle_control_points.sql
update_shuttle_point_names.sql
seed_parking_lots.sql
add_is_full_column.sql
```

用途：

- 初始化短驳管控点位
- 修改短驳点位名称
- 初始化停车场数据
- 添加停车场 `is_full` 字段

---

# 六、Webhook 通知机制

当前 Webhook 通知支持：

```text
企业微信
钉钉
飞书
Lark
```

## 1. 企业微信格式

```json
{
  "msgtype": "text",
  "text": {
    "content": "消息内容",
    "mentioned_list": ["@all"]
  }
}
```

## 2. 钉钉格式

```json
{
  "msgtype": "text",
  "text": {
    "content": "消息内容"
  },
  "at": {
    "isAtAll": true
  }
}
```

## 3. 飞书格式

```json
{
  "msg_type": "text",
  "content": {
    "text": "消息内容"
  }
}
```

如果飞书机器人开启签名校验，则需要额外配置 `timestamp` 和 `sign`。当前如未关闭飞书签名校验，会返回：

```json
{
  "code": 19021,
  "msg": "sign match fail or timestamp is not within one hour from current time"
}
```

建议内部群使用时可先关闭飞书签名校验，或后续扩展 Secret 签名支持。

---

# 七、天气数据

当前顶部天气已改为直接获取：

```text
Open-Meteo 实时天气接口
```

定位区域：

```text
无锡市滨湖区马山
```

坐标：

```text
纬度：31.43
经度：120.08
```

这样避免继续依赖 Supabase Edge Function 天气接口，减少 CORS 报错。

---

# 八、地图入口

地图功能主要在：

```text
app-8p3pb8bea7sx/src/components/ui/simplemap.tsx
```

当前高德地图链接已改为使用官方 POI 搜索：

```text
灵山胜境 / 灵山大佛
```

目的是避免固定坐标偏移。

---

# 九、当前文档目录状态

当前 `docs/` 中许多旧文档是早期版本资料，存在以下问题：

- 端口信息过期
- 数据文件列表过期
- 技术栈版本不准确
- 管理后台说明部分过期
- 未系统覆盖大交通仪表盘

因此：

```text
当前真实结构以本文档为准。
```

建议后续将旧文档移动到：

```text
docs/legacy/
```

并逐步整理成：

```text
docs/
├── CURRENT_PROJECT_OVERVIEW.md
├── PERSONAL_PORTFOLIO.md
├── TRAFFIC_DASHBOARD.md
├── DEPLOYMENT_CURRENT.md
├── MAINTENANCE_CURRENT.md
└── legacy/
```

---

# 十、当前建议

## 1. 不建议立即重命名真实大交通目录

真实目录：

```text
app-8p3pb8bea7sx/
```

内部包含应用 ID 和外部服务绑定信息，例如：

```text
VITE_APP_ID=app-8p3pb8bea7sx
```

不建议直接改名或替换内部 ID。

## 2. 保留说明入口目录

当前已创建：

```text
traffic-dashboard/
```

用于说明该目录对应大交通仪表盘。

## 3. 后续文档维护建议

新增功能后，优先更新本文档或拆分为：

```text
TRAFFIC_DASHBOARD.md
PERSONAL_PORTFOLIO.md
```

避免旧文档继续与实际项目脱节。
