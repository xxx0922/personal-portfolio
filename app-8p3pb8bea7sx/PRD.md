# 无锡灵山景区交通监控仪表盘 - 产品需求文档 (PRD)

## 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | 无锡灵山景区交通监控仪表盘 |
| 版本号 | v1.0 |
| 文档日期 | 2026-01-04 |
| 产品负责人 | 景区交通管理部门 |
| 技术栈 | React + TypeScript + Supabase + Tailwind CSS + shadcn/ui |

---

## 1. 产品概述

### 1.1 产品定位
无锡灵山景区交通监控仪表盘是一款面向景区交通管理部门的实时监控与决策支持系统，通过整合历年节假日客流车流历史数据、实时停车场信息及周边道路状况，为交通管制措施提供数据支撑和决策建议。

### 1.2 目标用户
- **主要用户**：景区交通管理部门工作人员
- **管理员用户**：系统管理员（第一个注册用户自动成为管理员）
- **普通用户**：查看仪表盘数据的工作人员

### 1.3 核心价值
- 实时监控景区交通状况，及时发现拥堵问题
- 基于历史数据对比，提供智能预警和管制建议
- 支持数据管理和历史趋势分析
- 提供短驳车辆调度决策支持

---

## 2. 功能架构

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    无锡灵山景区交通监控系统                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  用户认证层   │  │  权限控制层   │  │  数据访问层   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        功能模块层                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              实时监控仪表盘 (Dashboard)                │  │
│  │  - 停车场实时状态    - 入园人数统计                    │  │
│  │  - 道路交通状况      - 预约游客数量                    │  │
│  │  - 天气信息          - 预警状态显示                    │  │
│  │  - 管制措施面板      - 短驳车辆调度                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              管理员后台 (Admin)                        │  │
│  │  - 生成报告          - 历史数据查看                    │  │
│  │  - 趋势对比分析      - 数据上传管理                    │  │
│  │  - 数据模拟器        - 用户权限管理                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              数据管理模块                              │  │
│  │  - 历史数据查看      - Excel/CSV上传                   │  │
│  │  - 趋势图表生成      - 批量数据操作                    │  │
│  │  - 数据筛选导出      - 数据验证清洗                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                        数据层                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Supabase    │  │  实时数据     │  │  历史数据     │     │
│  │  数据库      │  │  Edge Function│  │  存储        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 核心功能详细说明

### 3.1 实时监控仪表盘 (Dashboard)

#### 3.1.1 功能概述
实时监控仪表盘是系统的核心页面，提供景区交通状况的实时监控和可视化展示。

#### 3.1.2 页面布局

**顶部标题区域**
- 大标题：无锡灵山景区交通监控仪表盘（5xl/6xl字体）
- Logo图标：柱状图图标（24x24容器，14x14图标）
- 信息栏（居中显示）：
  - 日期和星期
  - 天气状况和温度
  - 最后更新时间（带动画脉冲点）
  - 刷新按钮
  - 管理后台入口（仅管理员可见）
  - 主题切换按钮（明亮/暗黑模式）

**短驳车辆调度区域**
- 启动短驳按钮：一键启动短驳车辆调度模式
- 短驳模式下整个页面背景变为红色警示色
- 显示关键管制点位信息

**实时数据卡片区域**
- 当前入园人数
  - 显示实时入园总人数
  - 与历史峰值对比
  - 预警状态指示（红/黄/绿）
  - 手动抓取按钮
  
- 当日预约游客
  - 显示预约游客总数
  - 已入园和未入园人数
  - 预约完成率

- 停车场状态（果园停车场、月亮湾停车场）
  - 饼图展示车位占用率
  - 已用/总计车位数
  - 预警状态指示

**可视化图表区域**
- 客流对比柱状图
  - 当前客流 vs 历史峰值
  - 支持点击查看详细数据
  
- 历史趋势图
  - 显示历年同期数据对比
  - 支持按年份筛选

**地图展示区域**
- 景区周边实时路况地图
- 支持百度地图和高德地图切换
- 显示关键路段（灵湖大桥、千波桥、灵湖路等）
- 实时路况颜色标识（红色=拥堵，绿色=畅通）

**管制措施面板**
- 显示当前执行的交通管制措施
- 管制状态（执行中/已完成/待执行）
- 管制时间和描述

#### 3.1.3 数据刷新机制
- 自动刷新：每3分钟自动刷新一次数据
- 手动刷新：点击刷新按钮立即更新
- 入园人数自动抓取：
  - 首次加载后5秒自动抓取一次
  - 之后每10分钟自动抓取一次
  - 支持手动点击"抓取最新数据"按钮

#### 3.1.4 预警系统
- **红色预警**：实时数据达到历史峰值的90%以上
- **黄色预警**：实时数据达到历史峰值的70%-90%
- **绿色预警**：实时数据低于历史峰值的70%

#### 3.1.5 短驳车辆调度功能
- 一键启动短驳模式
- 页面背景变为红色警示色
- 显示关键管制点位：
  - 灵山胜境大门口
  - 灵湖大桥
  - 千波桥
  - 灵湖路
  - 古竹两侧
- 每个点位显示状态和描述

---

### 3.2 用户认证系统

#### 3.2.1 登录注册功能
- **登录方式**：用户名 + 密码
- **用户名规则**：只能包含字母、数字和下划线
- **注册流程**：
  1. 输入用户名和密码
  2. 系统验证用户名格式
  3. 注册成功后自动登录
  4. 第一个注册的用户自动成为管理员
- **登录流程**：
  1. 输入用户名和密码
  2. 验证成功后跳转到来源页面或首页

#### 3.2.2 权限管理
- **管理员权限**：
  - 访问管理员后台（/admin）
  - 查看和管理所有数据
  - 上传和删除历史数据
  - 使用数据模拟器
  - 生成报告
  
- **普通用户权限**：
  - 查看Dashboard实时数据
  - 查看历史数据（只读）
  - 查看趋势对比（只读）

#### 3.2.3 路由保护
- **公开路由**：/, /login, /403, /404, /history, /trends, /upload, /simulator
- **管理员路由**：/admin（需要管理员权限）
- **权限验证**：
  - 未登录访问管理员路由 → 跳转到登录页
  - 非管理员访问管理员路由 → 跳转到403页面

---

### 3.3 管理员后台 (Admin)

#### 3.3.1 功能概述
管理员后台是管理员专用的功能入口页面，提供所有数据管理和系统配置功能的访问入口。

#### 3.3.2 功能模块

**1. 生成报告**
- 功能：导出包含实时数据、历史对比和管制建议的完整报告
- 入口：跳转到Dashboard页面，使用生成报告功能
- 报告内容：
  - 生成时间
  - 当前入园人数和预警状态
  - 停车场状态
  - 道路交通状况
  - 管制措施建议

**2. 历史数据查看**
- 功能：查看和分析历年节假日客流车流历史数据
- 入口：跳转到/history页面
- 支持功能：
  - 按日期筛选
  - 查看详细数据
  - 数据排序
  - 批量删除

**3. 趋势对比分析**
- 功能：按年份查询历史数据趋势，支持游客人数和停车数量对比
- 入口：跳转到/trends页面
- 支持功能：
  - 按年份筛选（2022年、2023年）
  - 折线图展示趋势
  - 数据对比分析

**4. 数据上传**
- 功能：批量上传历史客流车流数据
- 入口：跳转到/upload页面
- 支持格式：Excel (.xlsx, .xls)、CSV (.csv)
- 上传流程：
  1. 选择文件或拖拽上传
  2. 系统解析数据
  3. 显示上传数据预览
  4. 确认后批量存入数据库
- 数据验证：
  - 必填字段检查
  - 数据格式验证
  - 重复数据检测

**5. 数据模拟器**
- 功能：模拟停车场、道路交通、入园人数等实时数据
- 入口：跳转到/simulator页面
- 模拟功能：
  - 停车场数据模拟
  - 道路交通数据模拟
  - 入园人数模拟
  - 天气数据模拟
  - 预约游客数据模拟

#### 3.3.3 页面布局
- 顶部：标题、用户信息、退出登录、返回首页按钮
- 主体：3x2网格布局展示五个功能卡片
- 底部：管理员权限说明

---

### 3.4 历史数据管理

#### 3.4.1 历史数据查看 (/history)

**功能特性**
- 表格展示历史数据
- 支持按日期筛选
- 支持数据排序
- 支持批量删除（管理员）
- 显示数据统计信息

**数据字段**
- 日期、农历、天气
- 2022年/2023年游客人数
- 各时间段管制措施执行时间
- 果园停车场/月亮湾停车场车辆数
- 当日游客总数

**操作功能**
- 查看详细数据
- 删除单条数据
- 批量删除数据
- 导出数据

#### 3.4.2 趋势对比分析 (/trends)

**功能特性**
- 按年份查询（2022年、2023年）
- 折线图展示趋势
- 支持游客人数和停车数量对比
- 显示峰值和平均值

**图表类型**
- 游客人数趋势图
- 停车数量趋势图
- 对比分析图

#### 3.4.3 数据上传 (/upload)

**上传流程**
1. 选择文件（支持拖拽）
2. 文件格式验证
3. 数据解析和预览
4. 数据验证
5. 批量存入数据库
6. 显示上传结果

**支持格式**
- Excel：.xlsx, .xls
- CSV：.csv

**数据验证规则**
- 必填字段：日期、农历、天气
- 数据格式：日期格式、数字格式
- 重复检测：按日期检查重复数据

**错误处理**
- 文件格式错误提示
- 数据验证失败提示
- 上传失败重试机制

---

### 3.5 数据模拟器 (/simulator)

#### 3.5.1 功能概述
数据模拟器用于测试和演示，可以模拟各种实时数据场景。

#### 3.5.2 模拟功能

**1. 停车场数据模拟**
- 果园停车场：已用车位/总车位
- 月亮湾停车场：已用车位/总车位
- 支持手动输入或随机生成

**2. 道路交通数据模拟**
- 灵湖大桥、千波桥、灵湖路等关键路段
- 车流密度（低/中/高）
- 拥堵状态

**3. 入园人数模拟**
- 当前入园总人数
- 历史峰值对比
- 预警状态

**4. 天气数据模拟**
- 天气状况（晴/阴/雨/雪等）
- 温度
- 风力

**5. 预约游客数据模拟**
- 预约总人数
- 已入园人数
- 未入园人数

#### 3.5.3 操作功能
- 一键生成随机数据
- 手动输入数据
- 保存模拟数据
- 清除模拟数据
- 恢复真实数据

---

## 4. 数据模型

### 4.1 数据库表结构

#### 4.1.1 用户相关表

**profiles（用户配置表）**
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text,
  phone text,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**user_role（用户角色枚举）**
```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
```

#### 4.1.2 交通数据表

**parking_lots（停车场表）**
```sql
CREATE TABLE parking_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  total_spaces integer NOT NULL,
  occupied_spaces integer NOT NULL,
  location text,
  updated_at timestamptz DEFAULT now()
);
```

**road_traffic（道路交通表）**
```sql
CREATE TABLE road_traffic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  road_name text NOT NULL,
  traffic_density text NOT NULL,
  congestion_level text,
  updated_at timestamptz DEFAULT now()
);
```

**visitor_count（入园人数表）**
```sql
CREATE TABLE visitor_count (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total integer NOT NULL,
  timestamp timestamptz DEFAULT now(),
  source text
);
```

**reservation_visitors（预约游客表）**
```sql
CREATE TABLE reservation_visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total integer NOT NULL,
  entered integer DEFAULT 0,
  not_entered integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

#### 4.1.3 历史数据表

**historical_traffic（历史交通数据表）**
```sql
CREATE TABLE historical_traffic (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  lunar_date text,
  weather text,
  year_2022_visitors integer,
  year_2023_visitors integer,
  total_visitors integer,
  guoyuan_parking integer,
  yuewanwan_parking integer,
  -- 各时间段管制措施字段
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 4.1.4 配置表

**alert_config（预警配置表）**
```sql
CREATE TABLE alert_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  warning_threshold numeric,
  danger_threshold numeric,
  historical_peak integer
);
```

**traffic_control_measures（交通管制措施表）**
```sql
CREATE TABLE traffic_control_measures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text,
  start_time timestamptz,
  end_time timestamptz
);
```

**shuttle_control_points（短驳管制点位表）**
```sql
CREATE TABLE shuttle_control_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  status text,
  description text
);
```

**weather_data（天气数据表）**
```sql
CREATE TABLE weather_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  weather text,
  temperature numeric,
  updated_at timestamptz DEFAULT now()
);
```

### 4.2 数据关系图

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       │ 1:1
       │
┌──────▼──────┐
│  profiles   │
└─────────────┘

┌──────────────────┐
│ parking_lots     │
└──────────────────┘

┌──────────────────┐
│ road_traffic     │
└──────────────────┘

┌──────────────────┐
│ visitor_count    │
└──────────────────┘

┌──────────────────┐
│ reservation_     │
│ visitors         │
└──────────────────┘

┌──────────────────┐
│ historical_      │
│ traffic          │
└──────────────────┘

┌──────────────────┐
│ alert_config     │
└──────────────────┘

┌──────────────────┐
│ traffic_control_ │
│ measures         │
└──────────────────┘

┌──────────────────┐
│ shuttle_control_ │
│ points           │
└──────────────────┘

┌──────────────────┐
│ weather_data     │
└──────────────────┘
```

---

## 5. 技术实现

### 5.1 技术栈

**前端框架**
- React 18
- TypeScript
- Vite（构建工具）

**UI组件库**
- shadcn/ui（基于Radix UI）
- Tailwind CSS（样式框架）
- Lucide React（图标库）

**数据可视化**
- Recharts（图表库）

**后端服务**
- Supabase（BaaS平台）
  - PostgreSQL数据库
  - Supabase Auth（用户认证）
  - Row Level Security（行级安全）
  - Edge Functions（无服务器函数）

**状态管理**
- React Context API
- React Hooks

**路由管理**
- React Router v6

**其他工具**
- XLSX（Excel文件处理）
- Sonner（Toast通知）

### 5.2 项目结构

```
/workspace/app-8p3pb8bea7sx/
├── src/
│   ├── components/          # 组件目录
│   │   ├── common/          # 通用组件
│   │   │   ├── IntersectObserver.tsx
│   │   │   ├── PageMeta.tsx
│   │   │   └── RouteGuard.tsx
│   │   ├── traffic/         # 交通相关组件
│   │   │   ├── ParkingChart.tsx
│   │   │   ├── VisitorComparisonChart.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   └── HistoricalTrendChart.tsx
│   │   └── ui/              # UI组件（shadcn/ui）
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── simplemap.tsx
│   │       ├── theme-toggle.tsx
│   │       └── ...
│   ├── contexts/            # Context上下文
│   │   └── AuthContext.tsx
│   ├── db/                  # 数据库相关
│   │   ├── api.ts           # API封装
│   │   └── supabase.ts      # Supabase客户端
│   ├── hooks/               # 自定义Hooks
│   │   ├── use-debounce.ts
│   │   ├── use-mobile.ts
│   │   ├── use-go-back.ts
│   │   └── use-toast.tsx
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # 仪表盘
│   │   ├── Login.tsx        # 登录页
│   │   ├── Admin.tsx        # 管理员后台
│   │   ├── Forbidden.tsx    # 403页面
│   │   ├── HistoryView.tsx  # 历史数据
│   │   ├── TrendComparison.tsx  # 趋势对比
│   │   ├── DataUpload.tsx   # 数据上传
│   │   ├── DataSimulator.tsx    # 数据模拟器
│   │   └── NotFound.tsx     # 404页面
│   ├── types/               # 类型定义
│   │   ├── types.ts         # 通用类型
│   │   ├── traffic.ts       # 交通相关类型
│   │   └── index.ts
│   ├── lib/                 # 工具函数
│   │   └── utils.ts
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # 主入口
│   ├── routes.tsx           # 路由配置
│   └── index.css            # 全局样式
├── supabase/
│   ├── functions/           # Edge Functions
│   │   └── fetch-visitor-count/
│   │       └── index.ts
│   └── migrations/          # 数据库迁移
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 5.3 核心技术实现

#### 5.3.1 用户认证流程

```typescript
// 1. 用户注册
const signUpWithUsername = async (username: string, password: string) => {
  const email = `${username}@miaoda.com`;
  const { error } = await supabase.auth.signUp({ email, password });
  // 第一个用户自动成为管理员（通过数据库触发器实现）
};

// 2. 用户登录
const signInWithUsername = async (username: string, password: string) => {
  const email = `${username}@miaoda.com`;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
};

// 3. 获取用户配置
const getProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
};
```

#### 5.3.2 权限控制

```typescript
// RouteGuard组件
export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;
    
    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);
    const isAdminRoute = matchPublicRoute(location.pathname, ADMIN_ROUTES);
    
    // 管理员路由权限检查
    if (isAdminRoute) {
      if (!user) navigate('/login');
      if (profile?.role !== 'admin') navigate('/403');
    }
    
    // 普通路由权限检查
    if (!user && !isPublic) navigate('/login');
  }, [user, profile, loading]);
  
  return <>{children}</>;
}
```

#### 5.3.3 数据自动刷新

```typescript
// Dashboard自动刷新
useEffect(() => {
  loadData();
  
  // 每3分钟自动刷新一次
  const interval = setInterval(() => {
    loadData();
  }, 3 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);

// 入园人数自动抓取
useEffect(() => {
  // 首次加载后5秒抓取一次
  const initialFetch = setTimeout(() => {
    fetchVisitorCount();
  }, 5000);
  
  // 每10分钟自动抓取一次
  const autoFetchInterval = setInterval(() => {
    fetchVisitorCount();
  }, 10 * 60 * 1000);
  
  return () => {
    clearTimeout(initialFetch);
    clearInterval(autoFetchInterval);
  };
}, [fetchVisitorCount]);
```

#### 5.3.4 预警系统实现

```typescript
const calculateAlertStatus = (
  current: number,
  total: number,
  type: string
): AlertStatus => {
  const config = alertConfig.find(c => c.type === type);
  if (!config) return { level: 'normal', color: 'success' };
  
  const percentage = (current / config.historical_peak) * 100;
  
  if (percentage >= config.danger_threshold) {
    return { level: 'danger', color: 'danger' };
  } else if (percentage >= config.warning_threshold) {
    return { level: 'warning', color: 'warning' };
  } else {
    return { level: 'normal', color: 'success' };
  }
};
```

#### 5.3.5 Edge Function实现

```typescript
// fetch-visitor-count Edge Function
Deno.serve(async (req) => {
  // 登录灵山数据平台
  const loginResponse = await fetch('http://dp.lingshan.org:8505/dp/login.html', {
    method: 'POST',
    body: new URLSearchParams({
      username: 'ls',
      password: 'q9vik7mf2l'
    })
  });
  
  // 抓取入园人数
  const html = await loginResponse.text();
  const total = extractVisitorCount(html);
  
  // 存入数据库
  await supabase.from('visitor_count').insert({ total, source: 'auto' });
  
  return new Response(JSON.stringify({ success: true, data: { total } }));
});
```

---

## 6. 用户界面设计

### 6.1 设计原则

**1. 简洁明了**
- 信息层次清晰
- 重点数据突出显示
- 避免信息过载

**2. 响应式设计**
- 支持桌面端和移动端
- 自适应不同屏幕尺寸
- 触摸友好的交互

**3. 视觉一致性**
- 统一的配色方案
- 一致的组件样式
- 规范的间距和布局

**4. 可访问性**
- 支持明亮/暗黑主题
- 清晰的文字对比度
- 语义化的HTML结构

### 6.2 配色方案

**主色调**
- Primary（主色）：蓝色系，用于主要按钮和强调元素
- Secondary（辅助色）：灰色系，用于次要信息
- Accent（强调色）：橙色系，用于警告和提示

**预警颜色**
- Success（成功/正常）：绿色 - 数据正常
- Warning（警告）：黄色 - 数据接近峰值
- Danger（危险）：红色 - 数据达到峰值

**背景颜色**
- Background：主背景色
- Card：卡片背景色
- Muted：次要背景色

### 6.3 主题支持

**明亮模式**
- 白色背景
- 深色文字
- 柔和的阴影

**暗黑模式**
- 深色背景
- 浅色文字
- 增强的对比度

### 6.4 组件设计规范

**按钮**
- Default：主要操作按钮
- Outline：次要操作按钮
- Ghost：辅助操作按钮
- 尺寸：sm, md, lg

**卡片**
- 圆角：rounded-lg
- 阴影：shadow-sm
- 边框：border
- 内边距：p-4, p-6

**表格**
- 斑马纹行
- 悬停高亮
- 固定表头
- 响应式滚动

**图表**
- 清晰的坐标轴
- 图例说明
- 交互式提示
- 响应式尺寸

---

## 7. 数据流程

### 7.1 实时数据流程

```
┌─────────────┐
│  数据源      │
│ - 停车场    │
│ - 道路监控  │
│ - 入园闸机  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Edge Function│
│ 数据采集     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Supabase DB │
│ 数据存储     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Dashboard   │
│ 数据展示     │
└─────────────┘
```

### 7.2 历史数据流程

```
┌─────────────┐
│ Excel/CSV   │
│ 文件上传     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 数据解析     │
│ 格式验证     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 数据预览     │
│ 用户确认     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 批量存入DB  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 历史数据查看 │
│ 趋势分析     │
└─────────────┘
```

### 7.3 用户认证流程

```
┌─────────────┐
│ 用户注册/登录│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Supabase Auth│
│ 身份验证     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 触发器执行   │
│ 创建Profile  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AuthContext │
│ 状态管理     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ RouteGuard  │
│ 权限控制     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 页面访问     │
└─────────────┘
```

---

## 8. 安全性设计

### 8.1 认证安全

**密码安全**
- 使用Supabase Auth的加密存储
- 密码强度要求（建议）
- 防止暴力破解

**会话管理**
- JWT Token认证
- 自动过期机制
- 安全的Token存储

### 8.2 数据安全

**Row Level Security (RLS)**
- 管理员拥有完全访问权限
- 用户只能查看自己的数据
- 用户不能修改自己的角色

**SQL注入防护**
- 使用参数化查询
- Supabase自动防护

**XSS防护**
- React自动转义
- 内容安全策略

### 8.3 API安全

**Edge Function安全**
- 环境变量存储敏感信息
- CORS配置
- 请求验证

**数据验证**
- 前端表单验证
- 后端数据验证
- 类型安全（TypeScript）

---

## 9. 性能优化

### 9.1 前端优化

**代码分割**
- 路由级别代码分割
- 组件懒加载
- 动态导入

**资源优化**
- 图片懒加载
- 图标按需导入
- CSS按需加载

**渲染优化**
- React.memo优化组件
- useCallback避免重复渲染
- 虚拟滚动（大数据表格）

### 9.2 数据库优化

**查询优化**
- 使用索引
- 避免N+1查询
- 分页查询

**缓存策略**
- 客户端缓存
- 数据预加载
- 增量更新

### 9.3 网络优化

**请求优化**
- 批量请求
- 请求去重
- 请求取消

**数据压缩**
- Gzip压缩
- 图片压缩
- JSON压缩

---

## 10. 测试策略

### 10.1 单元测试

**测试范围**
- 工具函数
- 自定义Hooks
- 数据处理逻辑

**测试工具**
- Vitest
- React Testing Library

### 10.2 集成测试

**测试范围**
- 组件交互
- 数据流转
- API调用

### 10.3 端到端测试

**测试场景**
- 用户注册登录
- 数据上传
- 报告生成
- 权限控制

**测试工具**
- Playwright
- Cypress

---

## 11. 部署方案

### 11.1 环境配置

**开发环境**
- 本地开发服务器
- 开发数据库
- 热更新

**生产环境**
- 生产数据库
- CDN加速
- 错误监控

### 11.2 部署流程

```
┌─────────────┐
│ 代码提交     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Lint检查     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 构建打包     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 部署到服务器 │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 健康检查     │
└─────────────┘
```

### 11.3 监控告警

**性能监控**
- 页面加载时间
- API响应时间
- 错误率统计

**业务监控**
- 用户活跃度
- 功能使用率
- 数据准确性

---

## 12. 维护和支持

### 12.1 日常维护

**数据维护**
- 定期备份数据库
- 清理过期数据
- 数据一致性检查

**系统维护**
- 依赖包更新
- 安全补丁
- 性能优化

### 12.2 用户支持

**使用文档**
- 用户手册
- 操作指南
- 常见问题

**技术支持**
- 问题反馈渠道
- Bug修复流程
- 功能需求收集

---

## 13. 未来规划

### 13.1 功能扩展

**短期规划（1-3个月）**
- 移动端App开发
- 微信小程序版本
- 更多数据可视化图表
- 导出PDF报告功能

**中期规划（3-6个月）**
- AI预测功能（基于历史数据预测客流）
- 智能调度建议
- 多景区支持
- 数据大屏展示

**长期规划（6-12个月）**
- 与景区其他系统集成
- 实时视频监控集成
- 移动端推送通知
- 数据分析报表系统

### 13.2 技术升级

**性能提升**
- 服务端渲染（SSR）
- 边缘计算
- 实时数据推送（WebSocket）

**功能增强**
- 多语言支持
- 离线模式
- PWA支持

---

## 14. 附录

### 14.1 术语表

| 术语 | 说明 |
|------|------|
| Dashboard | 仪表盘，系统主页面 |
| RLS | Row Level Security，行级安全 |
| Edge Function | 边缘函数，无服务器函数 |
| BaaS | Backend as a Service，后端即服务 |
| JWT | JSON Web Token，身份验证令牌 |
| SSR | Server-Side Rendering，服务端渲染 |
| PWA | Progressive Web App，渐进式Web应用 |

### 14.2 参考资料

**技术文档**
- React官方文档：https://react.dev/
- Supabase文档：https://supabase.com/docs
- shadcn/ui文档：https://ui.shadcn.com/
- Tailwind CSS文档：https://tailwindcss.com/

**设计资源**
- Lucide图标：https://lucide.dev/
- Recharts文档：https://recharts.org/

### 14.3 联系方式

**项目负责人**
- 景区交通管理部门

**技术支持**
- 开发团队

---

## 15. 版本历史

| 版本 | 日期 | 说明 | 作者 |
|------|------|------|------|
| v1.0 | 2026-01-04 | 初始版本，完成核心功能 | 开发团队 |

---

**文档结束**
