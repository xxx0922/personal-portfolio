import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPersonalInfo, getProjects, getPhotos, getDocuments, getArticles, getProfessions, getContact, getSkills } from '../services/dataService';
import type { PersonalInfo, Project, Photo, Document, Article, Profession, Contact, Skill } from '../types';
import LazyImage from '../components/LazyImage';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import BackgroundMusic from '../components/BackgroundMusic';
import { useSEO } from '../hooks/useSEO';

// 后端基础 URL（uploads 静态文件服务）
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';


const HomePage = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Profession[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLabels, setImageLabels] = useState<string[]>([]);

  // 图片标签直接从 contact 派生
  const computedImageLabels = contact?.images?.map((img: any) => img.label || '') || [];

  // 处理标签变化
  const handleLabelChange = (index: number, value: string) => {
    setImageLabels(prev => {
      const newLabels = [...prev];
      newLabels[index] = value;
      return newLabels;
    });
  };

  // 获取完整的图片 URL
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // 注意：使用环境变量配置的后端 URL，uploads 是静态文件目录
    return `${BACKEND_URL}${url}`;
  };

  // 获取头像 URL（处理相对路径）
  const getAvatarUrl = () => {
    if (!personalInfo?.avatar) return '';
    return getImageUrl(personalInfo.avatar);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [infoData, projectsData, photosData, documentsData, articlesData, professionsData, contactData, skillsData] = await Promise.all([
          getPersonalInfo(),
          getProjects(),
          getPhotos(),
          getDocuments(),
          getArticles(),
          getProfessions(),
          getContact(),
          getSkills()
        ]);
        setPersonalInfo(infoData);
        setProjects(projectsData);
        setPhotos(photosData);
        setDocuments(documentsData);
        setArticles(articlesData);
        setProducts(professionsData);
        setContact(contactData);
        setSkills(skillsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 照片墙自动轮播
  useEffect(() => {
    if (!personalInfo || !personalInfo.photos || personalInfo.photos.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setSelectedPhoto((prevPhoto) => {
        const currentIndex = prevPhoto === null ? 0 : prevPhoto;
        const nextIndex = (currentIndex + 1) % personalInfo.photos.length;
        // 直接控制滚动容器
        const scrollContainer = document.getElementById('photo-scroll-container');
        if (scrollContainer) {
          const containerWidth = scrollContainer.offsetWidth; // 容器宽度
          scrollContainer.scrollTo({
            left: nextIndex * containerWidth,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 4000); // 每 4 秒切换一张
    return () => clearInterval(interval);
  }, [personalInfo]);

  // 初始化照片位置
  useEffect(() => {
    if (personalInfo?.photos && personalInfo.photos.length > 0) {
      const scrollContainer = document.getElementById('photo-scroll-container');
      if (scrollContainer && selectedPhoto !== null) {
        const containerWidth = scrollContainer.offsetWidth;
        scrollContainer.scrollLeft = selectedPhoto * containerWidth;
      }
    }
  }, [personalInfo, selectedPhoto]);

  // 鼠标移动流星尾翼特效
  useEffect(() => {
    const canvas = document.getElementById('meteor-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mousePosition = { x: 0, y: 0 };
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseSpeed = 0;
    let hue = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 流星类 - 鼠标位置的主流星
    class MouseMeteor {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      trail: TrailParticle[];
      hue: number;

      constructor() {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.vx = 0;
        this.vy = 0;
        this.trail = [];
        this.hue = 0;
      }

      update() {
        // 平滑跟随鼠标
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.vx += dx * 0.15;
        this.vy += dy * 0.15;
        this.vx *= 0.85;
        this.vy *= 0.85;
        this.x += this.vx;
        this.y += this.vy;

        // 计算速度
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        // 创建尾迹粒子
        if (speed > 0.5) {
          const particleCount = Math.min(3, Math.floor(speed / 2) + 1);
          for (let i = 0; i < particleCount; i++) {
            this.trail.push(new TrailParticle(
              this.x + (Math.random() - 0.5) * 10,
              this.y + (Math.random() - 0.5) * 10,
              -this.vx * 0.3 + (Math.random() - 0.5) * 2,
              -this.vy * 0.3 + (Math.random() - 0.5) * 2,
              this.hue
            ));
          }
        }

        // 更新尾迹
        this.trail = this.trail.filter(p => p.life > 0);
        this.trail.forEach(p => p.update());

        // 颜色循环
        this.hue = (this.hue + 2) % 360;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // 绘制尾迹 - 流星尾巴
        for (let i = 0; i < this.trail.length; i++) {
          this.trail[i].draw(ctx);
        }

        // 绘制流星主体（鼠标位置的光晕）
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 30);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, 1)`);
        gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 50%, 0.5)`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 流星核心
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 90%, 1)`;
        ctx.fill();
      }
    }

    // 尾迹粒子类
    class TrailParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      hue: number;
      sparkles: Array<{ x: number; y: number; size: number; life: number; maxLife: number }>;

      constructor(x: number, y: number, vx: number, vy: number, hue: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.hue = hue;
        this.maxLife = 40 + Math.random() * 20;
        this.life = this.maxLife;
        this.size = 4 + Math.random() * 6;
        this.sparkles = [];

        // 创建闪烁粒子
        const sparkleCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < sparkleCount; i++) {
          this.sparkles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            size: 1 + Math.random() * 2,
            life: 10 + Math.random() * 10,
            maxLife: 10 + Math.random() * 10
          });
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vy += 0.05; // 轻微重力

        // 更新闪烁粒子
        this.sparkles = this.sparkles.filter(s => s.life > 0);
        this.sparkles.forEach(s => {
          s.x += (Math.random() - 0.5) * 0.5;
          s.y += (Math.random() - 0.5) * 0.5;
          s.life--;
        });
      }

      draw(ctx: CanvasRenderingContext2D) {
        const alpha = (this.life / this.maxLife) * 0.9;
        const currentSize = this.size * (this.life / this.maxLife);

        // 绘制光晕
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentSize * 2);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 60%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制核心
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 80%, ${alpha})`;
        ctx.fill();

        // 绘制闪烁粒子
        this.sparkles.forEach(s => {
          const sparkleAlpha = (s.life / s.maxLife) * alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue + 30}, 100%, 90%, ${sparkleAlpha})`;
          ctx.fill();
        });
      }
    }

    // 连接尾迹的流星效果
    class TrailMeteor {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      life: number;
      maxLife: number;
      hue: number;

      constructor(x: number, y: number, vx: number, vy: number, hue: number) {
        this.startX = x;
        this.startY = y;
        this.endX = x - vx * 15;
        this.endY = y - vy * 15;
        this.hue = hue;
        this.maxLife = 20 + Math.random() * 10;
        this.life = this.maxLife;
      }

      update() {
        this.life--;
        this.endX += (Math.random() - 0.5) * 2;
        this.endY += (Math.random() - 0.5) * 2;
      }

      draw(ctx: CanvasRenderingContext2D) {
        const alpha = (this.life / this.maxLife) * 0.6;
        const length = Math.sqrt(
          Math.pow(this.endX - this.startX, 2) + Math.pow(this.endY - this.startY, 2)
        );

        if (length < 5) return;

        const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
        const perpAngle = angle + Math.PI / 2;
        const width = Math.min(length * 0.3, 15);

        // 创建流星尾巴的渐变
        const gradient = ctx.createLinearGradient(this.startX, this.startY, this.endX, this.endY);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${this.hue + 20}, 100%, 60%, ${alpha * 0.7})`);
        gradient.addColorStop(1, `hsla(${this.hue + 40}, 100%, 50%, 0)`);

        ctx.save();
        ctx.translate(this.startX, this.startY);
        ctx.rotate(angle);

        // 绘制流星尾巴
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(length * 0.5, -width, length, 0);
        ctx.quadraticCurveTo(length * 0.5, width, 0, 0);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
      }

      isDead(): boolean {
        return this.life <= 0;
      }
    }

    const meteor = new MouseMeteor();
    let trailMeteors: TrailMeteor[] = [];

    // 鼠标移动处理
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.x = e.clientX;
      mousePosition.y = e.clientY;
      meteor.targetX = e.clientX;
      meteor.targetY = e.clientY;

      // 计算鼠标速度
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      mouseSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 快速移动时创建额外的流星效果
      if (mouseSpeed > 20) {
        trailMeteors.push(new TrailMeteor(
          meteor.x,
          meteor.y,
          deltaX,
          deltaY,
          meteor.hue
        ));
      }

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    document.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制流星尾迹
      trailMeteors = trailMeteors.filter(m => !m.isDead());
      trailMeteors.forEach(m => {
        m.update();
        m.draw(ctx);
      });

      // 更新和绘制主流星（鼠标）
      meteor.update();
      meteor.draw(ctx);

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // SEO 优化
  useSEO({
    title: personalInfo ? `${personalInfo.name} - ${personalInfo.title}` : '个人主页',
    description: personalInfo?.bio || '个人展示网站',
    keywords: '个人网站，全栈开发，项目管理，技术博客',
    ogTitle: personalInfo ? `${personalInfo.name} - 个人主页` : '个人主页',
    ogDescription: personalInfo?.bio || '个人展示网站',
    ogImage: getAvatarUrl(),
    ogUrl: window.location.href,
  });

  if (loading || !personalInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* 星空背景 - 固定外框 + 旋转内容 */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* 底层：静态背景图 */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-150"
          style={{
            backgroundImage: `url('/背景星空.png')`,
          }}
        ></div>

        {/* 上层：旋转的径向遮罩，制造中心旋转视觉效果 */}
        <div
          className="absolute inset-[-50%] w-[200%] h-[200%] animate-rotate-center"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%,
              rgba(0,0,0,0) 0deg,
              rgba(0,0,0,0.1) 10deg,
              rgba(0,0,0,0.15) 30deg,
              rgba(0,0,0,0.2) 60deg,
              rgba(0,0,0,0.25) 90deg,
              rgba(0,0,0,0.2) 120deg,
              rgba(0,0,0,0.15) 150deg,
              rgba(0,0,0,0.1) 170deg,
              rgba(0,0,0,0) 180deg,
              rgba(0,0,0,0.1) 190deg,
              rgba(0,0,0,0.15) 210deg,
              rgba(0,0,0,0.2) 240deg,
              rgba(0,0,0,0.25) 270deg,
              rgba(0,0,0,0.2) 300deg,
              rgba(0,0,0,0.15) 330deg,
              rgba(0,0,0,0.1) 350deg,
              rgba(0,0,0,0) 360deg)`,
            mixBlendMode: 'multiply',
          }}
        ></div>

        {/* 顶部渐变遮罩 - 更亮 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/5 to-slate-900/20 z-10"></div>
      </div>

      {/* 流星特效画布 */}
      <canvas id="meteor-canvas" className="fixed inset-0 z-20 pointer-events-none"></canvas>

      {/* 内容容器 */}
      <div className="relative z-10">
        {/* Navbar */}
        <Navbar personalInfo={personalInfo} />

        {/* Background Music */}
        <BackgroundMusic />

        {/* 主内容区域 */}
        {/* 隐藏滚动条样式 */}
        <style>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">

          {/* 个人介绍区域 - 全屏展示 */}
          <div className="mb-10">
            <div className="clay-card p-8 md:p-12 relative overflow-hidden">
              {/* 装饰性背景 */}
              <div className="absolute inset-0 bg-[#2a3550]/60"></div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* 左侧：头像和信息 */}
                  <div className="flex-1 flex flex-col lg:flex-row items-center gap-8">
                    {/* 头像区域 */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                          <img
                            src={getAvatarUrl()}
                            alt={personalInfo.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                          ✨
                        </div>
                      </div>
                    </div>

                    {/* 个人介绍文本 */}
                    <div className="flex-1 text-center lg:text-left">
                      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold clay-title mb-4 bg-gradient-to-r from-white via-rose-100 to-white bg-clip-text text-transparent">
                        {personalInfo.name}
                      </h1>
                      <p className="text-2xl md:text-3xl text-rose-300 font-semibold mb-4">
                        {personalInfo.title}
                      </p>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                          <span>📍</span>
                          <span className="text-white">{personalInfo.location}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                          <span>💼</span>
                          <span className="text-white">{personalInfo.welcomeMessage ? '8 年 + 经验' : '专业工程师'}</span>
                        </div>
                      </div>
                      <p className="text-xl text-gray-200 leading-relaxed max-w-4xl text-pretty">
                        {personalInfo.welcomeMessage || '欢迎来到我的个人主页。这里展示了我的项目经验、活动瞬间、实用工具和知识文档。'}
                      </p>
                    </div>
                  </div>

                  {/* 右侧：照片墙滚动展示 */}
                  <div className="flex-shrink-0" style={{ contain: 'layout paint' }}>
                    <div className="relative w-[320px] h-64 md:w-[480px] md:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white/10 backdrop-blur-sm">
                      {/* 照片滚动容器 - 每次只显示一张照片 */}
                      <div
                        id="photo-scroll-container"
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
                        onScroll={(e) => {
                          const scrollLeft = e.currentTarget.scrollLeft;
                          const width = e.currentTarget.offsetWidth;
                          const newIndex = Math.round(scrollLeft / width);
                          if (newIndex !== selectedPhoto) {
                            setSelectedPhoto(newIndex);
                          }
                        }}
                      >
                        {personalInfo.photos && personalInfo.photos.map((photoUrl, index) => (
                          <div
                            key={index}
                            id={`photo-${index}`}
                            className="flex-shrink-0 w-full h-full snap-start cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedPhoto(index)}
                          >
                            <img
                              src={getImageUrl(photoUrl)}
                              alt={`照片 ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                      {/* 照片指示器 - 底部（固定不滚动） */}
                      {personalInfo.photos && personalInfo.photos.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {personalInfo.photos.map((_, index) => (
                            <div
                              key={index}
                              className={`w-1.5 h-1.5 rounded-full transition-transform ${
                                selectedPhoto === index
                                  ? 'bg-white scale-x-[2.67]'
                                  : 'bg-white/50 scale-x-100'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* 第一行：项目经验 + 活动瞬间 + 专业系统 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 项目经验 */}
            <section id="projects" className="clay-card p-8 relative overflow-hidden group min-h-[400px]">
              <Link to="/dashboard" className="block h-full">
                {/* 唯美背景图：办公桌面/代码 */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-blue-900/20 to-indigo-900/30 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-transform duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold clay-title">项目经验</h3>
                      <p className="text-base clay-text-muted">多维表格仪表盘</p>
                    </div>
                  </div>
                </div>
              </Link>
            </section>

            {/* 活动瞬间 */}
            <section id="photos" className="clay-card p-8 relative overflow-hidden min-h-[400px]">
              <Link to="/photos" className="block h-full">
                {/* 唯美背景图：自然风光/草原 */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-cyan-900/30 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-25"></div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">📸</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold clay-title">活动瞬间</h3>
                      <p className="text-base clay-text-muted">记录生活美好时刻</p>
                    </div>
                  </div>
                </div>
              </Link>
            </section>

            {/* 专业系统 */}
            <section id="professions" className="clay-card p-8 relative overflow-hidden group min-h-[400px]">
              <Link to="/professions" className="block h-full">
                {/* 唯美背景图：专业/成就 */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-blue-900/30 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-transform duration-500"></div>
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🎓</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold clay-title">专业系统</h3>
                      <p className="text-base clay-text-muted">专业技能与资质</p>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          </div>

          {/* 第二行：联系我 */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            {/* 联系我区域 */}
            <section id="contact" className="clay-card p-0 min-h-[300px] overflow-hidden">
              {/* 背景图 */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 z-10"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>

              <div className="relative z-10 h-full">
                {/* 顶部标题栏 */}
                <div className="flex items-center justify-between px-8 pt-8 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-10 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
                    <h2 className="text-3xl font-bold clay-title text-white">联系我</h2>
                  </div>
                  <p className="text-lg text-gray-300">扫码关注我的社交账号，获取最新动态 ✨</p>
                </div>

                {/* 内容区域 */}
                <div className="flex flex-col md:flex-row gap-6 px-8 pb-8 justify-center">
                  {/* 左侧：二维码图片 - 更大的显示区域 */}
                  <div className="w-full md:w-[78%]">
                    <div className="relative h-80 md:h-[28rem] rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100">
                      {contact?.images && contact.images.length > 0 ? (
                        <div className="flex h-full gap-4 p-4">
                          {contact.images
                            .filter((img: { url: string; label: string }) => img.url)
                            .slice(0, 1)
                            .map((img: { url: string; label: string }, index: number) => (
                            img.url && (
                              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex-1 rounded-xl overflow-hidden shadow-xl border border-white/10 hover:scale-105 transition-transform relative flex items-center justify-center p-3 bg-white/5 backdrop-blur-md">
                                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/15"></div>
                                  <img
                                    src={getImageUrl(img.url)}
                                    alt={`二维码 ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg relative z-10 scale-150"
                                    style={{
                                      mixBlendMode: 'multiply',
                                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                      objectPosition: 'center center'
                                    }}
                                    loading="lazy"
                                  />
                                </div>
                                <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg px-3 py-2 text-center shadow-lg">
                                  <span className="text-white font-semibold text-base">
                                    {computedImageLabels[index] || ''}
                                  </span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          暂无二维码图片
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右侧：联系方式 */}
                  <div className="flex flex-col gap-3 justify-center flex-1">
                    {/* 社交媒体链接 */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all group"
                      >
                        <span className="text-2xl">🐙</span>
                        <span className="text-sm text-white font-medium">GitHub</span>
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all group"
                      >
                        <span className="text-2xl">💼</span>
                        <span className="text-sm text-white font-medium">LinkedIn</span>
                      </a>
                    </div>

                    {/* 邮箱 */}
                    {contact?.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📧</span>
                          <span className="text-sm text-gray-300">邮箱</span>
                        </div>
                        <span className="text-sm text-white font-medium group-hover:text-rose-400 transition-colors truncate max-w-[180px]">
                          {contact.email}
                        </span>
                      </a>
                    )}

                    {/* 电话 */}
                    {contact?.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl hover:from-slate-700 hover:to-slate-600 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📱</span>
                          <span className="text-sm text-gray-300">电话</span>
                        </div>
                        <span className="text-sm text-white font-medium group-hover:text-rose-400 transition-colors">
                          {contact.phone}
                        </span>
                      </a>
                    )}

                    {/* 微信 */}
                    {contact?.wechat && (
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💬</span>
                          <span className="text-sm text-gray-300">微信</span>
                        </div>
                        <span className="text-sm text-white font-medium text-rose-400">
                          {contact.wechat}
                        </span>
                      </div>
                    )}

                    {/* 地址 */}
                    {contact?.location && (
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📍</span>
                          <span className="text-sm text-gray-300">地址</span>
                        </div>
                        <span className="text-sm text-white font-medium">
                          {contact.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* 文档详情 Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDocument(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
              aria-label="关闭文档预览"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-xs px-2 py-1 rounded mr-2 bg-blue-100 text-blue-700">
                      {selectedDocument.category}
                    </span>
                    <span className="text-sm text-gray-500">{selectedDocument.date}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedDocument.title}</h2>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{selectedDocument.content}</p>
              </div>

              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag, idx) => (
                    <span key={idx} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
