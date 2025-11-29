import type { PersonalInfo, Project, Skill, MediaItem, Photo, Document, Regulation } from '../types';

// 项目统计数据
export const projectStats = {
  yearly: [
    { year: '2020', projects: 8, completed: 7 },
    { year: '2021', projects: 12, completed: 11 },
    { year: '2022', projects: 15, completed: 14 },
    { year: '2023', projects: 18, completed: 17 },
    { year: '2024', projects: 10, completed: 8 }
  ],
  techStack: [
    { name: '海康威视', value: 25 },
    { name: '大华监控', value: 18 },
    { name: '门禁系统', value: 15 },
    { name: '综合布线', value: 22 },
    { name: '智能分析', value: 12 },
    { name: '中控平台', value: 10 }
  ],
  performance: [
    { metric: '项目验收率', value: 98 },
    { metric: '客户满意度', value: 95 },
    { metric: '系统稳定性', value: 99 },
    { metric: '施工质量', value: 96 }
  ]
};

// 模拟个人信息数据
export const personalInfo: PersonalInfo = {
  name: "丰生水起",
  title: "弱电工程师 & 项目经理",
  email: "contact@example.com",
  phone: "+86 138-0000-0000",
  location: "中国·上海",
  bio: "拥有8年弱电系统工程经验的专业工程师，专注于监控系统、门禁系统、综合布线等弱电工程的设计与实施。精通安防监控、智能化系统集成，致力于为客户提供安全可靠的弱电解决方案。",
  avatar: "https://ui-avatars.com/api/?name=Feng+Sheng&size=400&background=3b82f6&color=fff",
  photos: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop"
  ]
};

// 模拟技能数据
export const skills: Skill[] = [
  { name: "视频监控系统", level: 5, category: "安防系统" },
  { name: "门禁管理系统", level: 5, category: "安防系统" },
  { name: "入侵报警系统", level: 4, category: "安防系统" },
  { name: "综合布线", level: 5, category: "弱电工程" },
  { name: "网络工程", level: 4, category: "弱电工程" },
  { name: "智能化系统集成", level: 4, category: "弱电工程" },
  { name: "CAD制图", level: 5, category: "设计能力" },
  { name: "工程预算", level: 4, category: "设计能力" },
  { name: "海康威视", level: 5, category: "品牌设备" },
  { name: "大华监控", level: 5, category: "品牌设备" },
  { name: "项目管理", level: 4, category: "管理能力" },
  { name: "团队协作", level: 5, category: "管理能力" }
];

// 模拟项目数据
export const projects: Project[] = [
  {
    id: "1",
    title: "某商业广场智能安防监控系统",
    description: "为大型商业广场建设的综合安防监控系统，包含400+路高清摄像头、门禁管理、停车场管理等子系统。采用海康威视全套设备，实现7×24小时全方位监控。",
    role: "项目经理/技术负责人",
    duration: "2022.03 - 2023.06",
    technologies: ["海康威视", "H.265编码", "智能分析", "POE供电", "光纤传输"],
    images: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
    ],
    achievements: [
      "安装高清摄像头400+路",
      "实现智能人脸识别和行为分析",
      "项目通过验收，获得甲方高度评价",
      "系统稳定运行零故障"
    ],
    isPrivate: false
  },
  {
    id: "2",
    title: "工业园区综合监控及门禁系统",
    description: "为某工业园区建设的综合安防系统，涵盖视频监控、门禁管理、周界报警等多个子系统，实现园区智能化管理。",
    role: "弱电工程师",
    duration: "2021.08 - 2022.02",
    technologies: ["大华监控", "门禁系统", "周界报警", "综合布线", "中控平台"],
    images: ["https://images.unsplash.com/photo-1590642916589-592bca10dfbf?w=800&h=600&fit=crop"],
    achievements: [
      "布设监控点位280个",
      "门禁点位120个",
      "实现园区全覆盖监控",
      "周界报警准确率达98%"
    ],
    isPrivate: false
  },
  {
    id: "3",
    title: "某政府机关智能化弱电系统",
    description: "为政府机关大楼建设的智能化弱电系统，包含视频监控、会议系统、综合布线、机房建设等。系统达到等保三级要求。",
    role: "项目经理",
    duration: "2023.07 - 至今",
    technologies: ["海康威视", "综合布线", "机房工程", "会议系统", "等保三级"],
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"],
    achievements: [
      "通过等保三级测评",
      "实现会议室智能化改造",
      "机房达到B级标准",
      "系统运行稳定可靠"
    ],
    isPrivate: true // 敏感项目，需要权限访问
  }
];

// 模拟媒体数据
export const mediaItems: MediaItem[] = [
  {
    id: "1",
    title: "肖申克的救赎",
    type: "movie",
    rating: 5,
    review: "一部关于希望和救赎的经典电影。弗兰克·德拉邦特的导演技巧精湛，摩根·弗里曼和蒂姆·罗宾斯的演技完美呈现了这个深刻的故事。",
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    tags: ["剧情", "希望", "经典"],
    date: "2024-01-15"
  },
  {
    id: "2",
    title: "黑客帝国",
    type: "movie",
    rating: 5,
    review: "沃卓斯基姐妹的开创性作品，重新定义了科幻电影。视觉效果震撼，哲学思考深刻。",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    tags: ["科幻", "动作", "哲学"],
    date: "2024-01-10"
  },
  {
    id: "3",
    title: "人类简史",
    type: "book",
    rating: 4,
    review: "尤瓦尔·赫拉利从宏观角度审视人类历史，提供了很多思考的新视角。虽然有些观点值得商榷，但确实值得一读。",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    tags: ["历史", "社会学", "科普"],
    date: "2024-01-05"
  }
];

// 模拟摄影作品数据
export const photos: Photo[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop",
    title: "城市夜景",
    description: "上海陆家嘴的璀璨夜景，现代都市的繁华尽收眼底。",
    category: "城市风光",
    date: "2024-01-20"
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop",
    title: "春日花开",
    description: "公园里樱花盛开的美丽瞬间，春天的生机盎然。",
    category: "自然风光",
    date: "2024-03-15"
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop",
    title: "街头抓拍",
    description: "老城区街头的生活气息，记录城市的温度。",
    category: "人文纪实",
    date: "2024-02-10"
  }
];

// 模拟文档数据
export const documents: Document[] = [
  {
    id: "1",
    title: "React 18 新特性详解",
    category: "技术文档",
    content: "React 18 引入了许多新特性，包括并发特性、自动批处理、Suspense 改进等...",
    fileUrl: "/docs/react18-features.pdf",
    tags: ["React", "前端", "JavaScript"],
    date: "2024-01-10"
  },
  {
    id: "2",
    title: "项目管理最佳实践",
    category: "管理文档",
    content: "基于敏捷开发的项目管理方法，结合多年实践经验总结...",
    fileUrl: "/docs/pm-best-practices.pdf",
    tags: ["项目管理", "敏捷", "团队协作"],
    date: "2024-01-05"
  }
];

// 模拟法律法规数据
export const regulations: Regulation[] = [
  {
    id: "1",
    title: "中华人民共和国建筑法",
    content: "为了加强对建筑活动的监督管理，维护建筑市场秩序...",
    category: "建筑法规",
    publishDate: "2019-03-15",
    tags: ["建筑", "法律", "管理"]
  },
  {
    id: "2",
    title: "建设工程质量管理条例",
    content: "为了加强对建设工程质量的管理，保证建设工程质量...",
    category: "质量管理",
    publishDate: "2020-10-01",
    tags: ["质量", "建设", "法规"]
  }
];
