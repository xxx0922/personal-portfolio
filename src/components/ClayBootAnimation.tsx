import { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';

interface ClayBootAnimationProps {
  onComplete: () => void;
  siteName?: string;
}

const ClayBootAnimation = ({ onComplete, siteName = '个人网站' }: ClayBootAnimationProps) => {
  const [phase, setPhase] = useState<'gathering' | 'explode' | 'logo' | 'fade-out' | 'skipped'>('gathering');
  const [logoOpacity, setLogoOpacity] = useState(0);
  const [explodeFlash, setExplodeFlash] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const skipCallbackRef = useRef(false);
  const boomSoundRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音效
  useEffect(() => {
    // 创建爆炸音效
    boomSoundRef.current = new Audio('/audio/boot/big-bang-1.wav');
    boomSoundRef.current.volume = 0.8;

    return () => {
      boomSoundRef.current?.pause();
      boomSoundRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 粒子系统
    interface Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      ax: number; // 加速度
      ay: number;
      radius: number;
      color: { r: number; g: number; b: number };
      life: number;
      phase: 'gathering' | 'forming' | 'exploding' | 'dispersing';
      explosionVel: { vx: number; vy: number }; // 爆炸速度
    }

    const particles: Particle[] = [];
    const particleCount = 300;

    // 颜色配置 - 米色 + 蓝色
    const colors = [
      { r: 0.96, g: 0.93, b: 0.89 }, // 浅米色
      { r: 0.92, g: 0.84, b: 0.71 }, // 米色
      { r: 0.57, g: 0.72, b: 0.88 }, // 浅蓝
      { r: 0.23, g: 0.49, b: 0.97 }, // 蓝色
    ];

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const radius = Math.random() * 150 + 100;
      // 计算从中心到该粒子的方向向量（用于爆炸）
      const dx = (Math.cos(angle) * radius) / radius;
      const dy = (Math.sin(angle) * radius) / radius;

      particles.push({
        x: Math.cos(angle) * radius + canvas.width / 2,
        y: Math.sin(angle) * radius + canvas.height / 2,
        targetX: canvas.width / 2,
        targetY: canvas.height / 2,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        phase: 'gathering',
        explosionVel: {
          vx: dx * (Math.random() * 15 + 20), // 爆炸速度
          vy: dy * (Math.random() * 15 + 20),
        },
      });
    }

    let frame = 0;
    const logoCenter = { x: canvas.width / 2, y: canvas.height / 2 };

    // 渲染循环
    const render = () => {
      // 清除画布 - 使用半透明背景实现拖尾效果
      ctx.fillStyle = 'rgba(26, 31, 46, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;

      // 阶段控制 - 加速版
      if (frame === 60) {
        // 粒子聚集完成，开始爆炸
        setPhase('explode');
        setExplodeFlash(1);
        // 播放宇宙大爆炸音效
        boomSoundRef.current?.play().catch(err => console.log('Audio play prevented:', err));
        particles.forEach((p) => {
          p.phase = 'exploding';
          p.vx = p.explosionVel.vx * 1.5; // 更强的爆炸速度
          p.vy = p.explosionVel.vy * 1.5;
        });

        // 爆炸闪光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (frame > 60 && frame < 100) {
        // 爆炸后渐隐
        setExplodeFlash(Math.max(0, 1 - (frame - 60) / 40));
      }

      if (frame === 100) {
        // 爆炸结束后显示 Logo
        setPhase('logo');
        const fadeInterval = setInterval(() => {
          setLogoOpacity((prev) => {
            if (prev >= 1) {
              clearInterval(fadeInterval);
              return 1;
            }
            return prev + 0.1;
          });
        }, 30);
      }

      if (frame === 160) {
        setPhase('fade-out');
        setLogoOpacity(0);
      }

      if (frame > 200) {
        setLogoOpacity(0);
        animationRef.current = undefined;
        onComplete();
        return;
      }

      // 更新和绘制粒子
      particles.forEach((p) => {
        if (p.phase === 'gathering') {
          // 向中心聚集
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.001;
          p.vy += dy * 0.001;
        } else if (p.phase === 'forming') {
          // 形成 Logo 形状
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.002;
          p.vy += dy * 0.002;
        } else if (p.phase === 'exploding') {
          // 爆炸 - 高速飞散
          p.vx *= 0.98; // 摩擦力较小
          p.vy *= 0.98;
          p.life -= 0.008;
        }

        // 摩擦力
        p.vx *= 0.96;
        p.vy *= 0.96;

        // 更新位置
        p.x += p.vx;
        p.y += p.vy;

        // 绘制粒子
        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r * 255}, ${p.color.g * 255}, ${p.color.b * 255}, ${p.life * 0.8})`;
          ctx.fill();
        }
      });

      // 绘制连接线（粒子之间）
      if (frame > 60 && frame < 240) {
        ctx.strokeStyle = 'rgba(245, 240, 230, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 50) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // 爆炸冲击波效果
      if (frame > 240 && frame < 320) {
        const shockwaveRadius = (frame - 240) * 15;
        const shockwaveOpacity = 1 - (frame - 240) / 80;

        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, shockwaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 240, 230, ${shockwaveOpacity * 0.8})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 内部闪光
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          shockwaveRadius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${shockwaveOpacity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(90, 150, 244, ${shockwaveOpacity * 0.2})`);
        gradient.addColorStop(1, 'rgba(26, 31, 46, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      }

      // 绘制 Logo 文字
      if (logoOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = logoOpacity;
        ctx.font = 'bold 48px "Varela Round", "Nunito", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 文字渐变
        const gradient = ctx.createLinearGradient(
          canvas.width / 2 - 100,
          canvas.height / 2,
          canvas.width / 2 + 100,
          canvas.height / 2
        );
        gradient.addColorStop(0, `rgba(245, 240, 230, ${logoOpacity})`);
        gradient.addColorStop(0.5, `rgba(90, 150, 244, ${logoOpacity})`);
        gradient.addColorStop(1, `rgba(245, 240, 230, ${logoOpacity})`);

        ctx.fillStyle = gradient;
        ctx.fillText(siteName, canvas.width / 2, canvas.height / 2);

        // 副标题
        ctx.font = '16px "Nunito", "Microsoft YaHei", sans-serif';
        ctx.fillStyle = `rgba(192, 184, 168, ${logoOpacity * 0.8})`;
        ctx.fillText('欢迎来到我的个人主页', canvas.width / 2, canvas.height / 2 + 40);

        ctx.restore();
      }

      // 毛玻璃背景效果
      if (frame > 100 && frame < 350) {
        let overlayOpacity = Math.min((frame - 100) / 50, 1) * 0.3;
        if (frame > 300) {
          overlayOpacity *= (420 - frame) / 120;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${overlayOpacity * 0.1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      console.log('Cleaning up animation...');
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [onComplete, siteName]);

  // 跳过动画处理 - 使用 useCallback 确保稳定性
  const handleSkip = useCallback(() => {
    console.log('Skipping animation...');
    if (skipCallbackRef.current) return; // 防止重复调用
    skipCallbackRef.current = true;
    setIsSkipped(true);

    // 停止动画
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    // 使用 flushSync 强制 React 立即更新状态
    flushSync(() => {
      onComplete();
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#1a1f2e] flex items-center justify-center overflow-hidden">
      {/* 流体粒子 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Logo 文字层 - 使用 DOM 渲染，更清晰 */}
      {phase === 'logo' && logoOpacity > 0 && (
        <div
          className="relative z-10 flex flex-col items-center justify-center w-full px-4"
          style={{
            opacity: logoOpacity,
            transform: `scale(${1 + (1 - logoOpacity) * 0.2})`,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {/* 主标题容器 - 赛博朋克故障效果 */}
          <div className="relative cyberpunk-title-wrapper w-full flex justify-center">
            {/* 故障层 - 红色通道错位 */}
            <span
              className="cyberpunk-glitch-layer cyberpunk-glitch-red"
              style={{
                fontSize: 'clamp(3rem, 12vw, 8rem)',
                fontWeight: 900,
                fontFamily: "'Orbitron', 'Arial Black', 'Microsoft YaHei', sans-serif",
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translate(-50%, 0) translate(-3px, 0)',
                color: '#ff0040',
                opacity: 0.7,
                mixBlendMode: 'screen',
                clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                animation: 'glitchTop 2s infinite linear alternate-reverse',
              }}
              aria-hidden="true"
            >
              {siteName}
            </span>
            {/* 故障层 - 蓝色通道错位 */}
            <span
              className="cyberpunk-glitch-layer cyberpunk-glitch-blue"
              style={{
                fontSize: 'clamp(3rem, 12vw, 8rem)',
                fontWeight: 900,
                fontFamily: "'Orbitron', 'Arial Black', 'Microsoft YaHei', sans-serif",
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translate(-50%, 0) translate(3px, 0)',
                color: '#00ffff',
                opacity: 0.7,
                mixBlendMode: 'screen',
                clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
                animation: 'glitchBottom 2.5s infinite linear alternate-reverse',
              }}
              aria-hidden="true"
            >
              {siteName}
            </span>

            {/* 主标题 - 流光渐变字（超大字号） */}
            <h1
              className="clay-title cyberpunk-title"
              style={{
                fontSize: 'clamp(3rem, 12vw, 8rem)',
                fontWeight: 900,
                fontFamily: "'Orbitron', 'Arial Black', 'Microsoft YaHei', sans-serif",
                letterSpacing: '0.15em',
                background: `linear-gradient(
                  90deg,
                  #00ffff 0%,
                  #0080ff 15%,
                  #ff00ff 30%,
                  #8000ff 45%,
                  #00ffff 60%,
                  #0080ff 75%,
                  #ff00ff 100%
                )`,
                backgroundSize: '300% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'cyberpunkGradient 4s ease infinite',
                // 增强光效 - 随字号放大同步增加模糊半径
                textShadow: `
                  0 0 20px rgba(255, 255, 255, 0.9),
                  0 0 40px rgba(0, 255, 255, 0.8),
                  0 0 60px rgba(0, 255, 255, 0.7),
                  0 0 80px rgba(0, 128, 255, 0.6),
                  0 0 100px rgba(255, 0, 255, 0.5),
                  0 0 120px rgba(128, 0, 255, 0.4),
                  0 0 140px rgba(0, 255, 255, 0.3),
                  0 0 160px rgba(0, 255, 255, 0.2)
                `,
                filter: 'drop-shadow(0 0 40px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 80px rgba(255, 0, 255, 0.5))',
                whiteSpace: 'nowrap',
                position: 'relative',
                zIndex: 1,
                // 确保大屏占比
                width: 'max-content',
                maxWidth: '85vw',
              }}
            >
              {siteName}
            </h1>

            {/* 外层霓虹光晕 - 增强版 */}
            <div
              className="cyberpunk-glow"
              style={{
                position: 'absolute',
                inset: '-20%',
                background: `radial-gradient(
                  ellipse at center,
                  rgba(0, 255, 255, 0.25) 0%,
                  rgba(128, 0, 255, 0.15) 30%,
                  rgba(255, 0, 255, 0.08) 50%,
                  transparent 70%
                )`,
                filter: 'blur(60px)',
                animation: 'neonPulse 2s ease-in-out infinite',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* 装饰线条 - 赛博朋克流光效果（加宽） */}
          <div
            className="mt-8 w-80 h-2 rounded-full overflow-hidden relative"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.4) 20%, rgba(255, 0, 255, 0.4) 50%, rgba(0, 255, 255, 0.4) 80%, transparent 100%)',
              backgroundSize: '300% 100%',
              animation: 'cyberpunkFlow 2s linear infinite',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.9), 0 0 60px rgba(255, 0, 255, 0.6), 0 0 90px rgba(0, 128, 255, 0.4)',
            }}
          />

          {/* 副标题 - 打字机光标 + 呼吸闪烁（放大版） */}
          <div className="relative mt-8 flex items-center gap-3">
            <p
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                fontFamily: "'Courier New', 'Courier', monospace",
                background: `linear-gradient(90deg,
                  rgba(0, 255, 255, 1) 0%,
                  rgba(128, 0, 255, 0.9) 35%,
                  rgba(255, 0, 255, 1) 70%,
                  rgba(0, 255, 255, 1) 100%
                )`,
                backgroundSize: '200% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'subtitleBreath 3s ease-in-out infinite',
                letterSpacing: '0.2em',
                fontWeight: 600,
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.5)',
                whiteSpace: 'nowrap',
              }}
            >
              欢迎来到我的个人主页
            </p>
            {/* 打字机光标 - 放大版 */}
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: 'clamp(1.2rem, 3vw, 2rem)',
                background: 'linear-gradient(180deg, #00ffff, #ff00ff)',
                animation: 'cursorBlink 0.8s step-end infinite',
                boxShadow: '0 0 15px rgba(0, 255, 255, 1), 0 0 30px rgba(255, 0, 255, 0.8), 0 0 45px rgba(0, 128, 255, 0.5)',
              }}
            />
          </div>

          {/* 加载进度条 - 赛博朋克能量条样式（加宽） */}
          <div className="mt-12 w-[28rem] max-w-[80vw] relative">
            {/* 外框光晕 - 增强版 */}
            <div
              className="absolute -inset-2 rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.4), rgba(255, 0, 255, 0.4))',
                filter: 'blur(12px)',
                opacity: 0.8,
                animation: 'neonPulse 1.5s ease-in-out infinite',
              }}
            />
            {/* 进度条容器 */}
            <div className="relative h-2 bg-gray-900/90 rounded-full overflow-hidden border-2 border-cyan-500/40">
              {/* 背景网格 */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 10px,
                      rgba(0, 255, 255, 0.3) 10px,
                      rgba(0, 255, 255, 0.3) 11px
                    )
                  `,
                  animation: 'gridScroll 2s linear infinite reverse',
                }}
              />
              {/* 进度条主体 - 多层能量效果 */}
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.min(logoOpacity * 100, 100)}%`,
                  background: `linear-gradient(90deg,
                    rgba(0, 255, 255, 0) 0%,
                    rgba(0, 255, 255, 1) 20%,
                    rgba(255, 255, 255, 1) 50%,
                    rgba(255, 0, 255, 1) 80%,
                    rgba(0, 255, 255, 0) 100%
                  )`,
                  backgroundSize: '200% 100%',
                  animation: 'energyFlow 0.8s linear infinite',
                  boxShadow: `
                    0 0 15px rgba(0, 255, 255, 1),
                    0 0 30px rgba(0, 255, 255, 0.8),
                    0 0 45px rgba(255, 0, 255, 0.6),
                    0 0 60px rgba(128, 0, 255, 0.4),
                    inset 0 0 15px rgba(255, 255, 255, 0.6)
                  `,
                  transition: 'width 0.3s ease',
                }}
              />
              {/* 能量核心 - 前端亮点（放大） */}
              <div
                className="absolute inset-y-0 w-12 rounded-full"
                style={{
                  left: `calc(${Math.min(logoOpacity * 100, 100)}% - 24px)`,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 1), transparent)',
                  filter: 'blur(6px)',
                  boxShadow: '0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(0, 255, 255, 0.8)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 爆炸闪光层 */}
      {phase === 'explode' && (
        <div
          className="absolute inset-0 z-20 bg-white transition-opacity duration-300"
          style={{ opacity: explodeFlash * 0.8 }}
        />
      )}

      {/* 跳过按钮 */}
      <button
        onClick={handleSkip}
        disabled={isSkipped}
        className="absolute bottom-8 right-8 px-6 py-3 clay-button text-sm z-30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ pointerEvents: isSkipped ? 'none' : 'auto' }}
      >
        {isSkipped ? '跳过中...' : '跳过动画'}
      </button>
    </div>
  );
};

export default ClayBootAnimation;
