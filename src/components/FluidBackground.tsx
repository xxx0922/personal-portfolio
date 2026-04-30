/**
 * 流体模拟背景组件
 * 基于 WebGL 的交互式流体模拟
 */

import { useEffect, useRef } from 'react';

interface FluidBackgroundProps {
  className?: string;
}

const FluidBackground = ({ className = '' }: FluidBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // 流体模拟参数
    const config = {
      densityDissipation: 0.98,
      velocityDissipation: 0.99,
      pressureDissipation: 0.8,
      curl: 30,
      SplatRadius: 0.25,
      splatForce: 6000,
      shading: 0.9,
      colorUpdateSpeed: 10,
      backColor: { r: 0.2, g: 0.3, b: 0.5 }, // 蓝灰色背景
      transparent: true,
    };

    // 颜色配置 - 米色 + 蓝色混合
    const colors = [
      { r: 0.92, g: 0.84, b: 0.71 }, // 米色
      { r: 0.96, g: 0.93, b: 0.89 }, // 浅米色
      { r: 0.57, g: 0.72, b: 0.88 }, // 浅蓝
      { r: 0.85, g: 0.75, b: 0.63 }, // 金棕色
      { r: 0.67, g: 0.82, b: 0.92 }, // 天蓝
    ];

    // 粒子系统
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: { r: number; g: number; b: number };
      radius: number;
      life: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 150;

    // 创建粒子
    const createParticle = (x: number, y: number): Particle => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: { ...color },
        radius: Math.random() * 50 + 30,
        life: 1,
      };
    };

    // 鼠标交互
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (isMouseDown || e.movementX || e.movementY) {
        // 创建多个粒子
        for (let i = 0; i < 3; i++) {
          if (particles.length < maxParticles) {
            particles.push(createParticle(
              e.clientX + (Math.random() - 0.5) * 50,
              e.clientY + (Math.random() - 0.5) * 50
            ));
          }
        }
      }
    };

    const handleMouseDown = () => { isMouseDown = true; };
    const handleMouseUp = () => { isMouseDown = false; };

    // 触摸支持
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      mouseX = touch.clientX;
      mouseY = touch.clientY;

      for (let i = 0; i < 5; i++) {
        if (particles.length < maxParticles) {
          particles.push(createParticle(
            touch.clientX + (Math.random() - 0.5) * 50,
            touch.clientY + (Math.random() - 0.5) * 50
          ));
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    // 自动创建背景粒子
    let autoParticleInterval: number;
    const createAutoParticle = () => {
      const edge = Math.floor(Math.random() * 4);
      let x: number, y: number;

      switch (edge) {
        case 0: x = Math.random() * canvas.width; y = -50; break;
        case 1: x = canvas.width + 50; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 50; break;
        default: x = -50; y = Math.random() * canvas.height; break;
      }

      if (particles.length < maxParticles) {
        particles.push(createParticle(x, y));
      }
    };

    autoParticleInterval = window.setInterval(createAutoParticle, 800);

    // 渲染循环
    let animationId: number;
    const render = () => {
      // 清除画布，使用半透明背景实现拖尾效果
      ctx.fillStyle = 'rgba(45, 50, 60, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // 更新位置
        p.x += p.vx;
        p.y += p.vy;

        // 轻微的重力效果
        p.vy += 0.02;

        // 摩擦力
        p.vx *= 0.99;
        p.vy *= 0.99;

        // 减少生命
        p.life -= 0.003;
        p.radius += 0.3;

        // 绘制粒子
        if (p.life > 0) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          gradient.addColorStop(0, `rgba(${p.color.r * 255}, ${p.color.g * 255}, ${p.color.b * 255}, ${p.life * 0.6})`);
          gradient.addColorStop(1, `rgba(${p.color.r * 255}, ${p.color.g * 255}, ${p.color.b * 255}, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          particles.splice(i, 1);
        }
      }

      // 添加流动渐变效果
      const time = Date.now() * 0.0005;
      const gradient = ctx.createLinearGradient(
        0, 0,
        canvas.width * Math.sin(time),
        canvas.height * Math.cos(time)
      );
      gradient.addColorStop(0, 'rgba(100, 120, 150, 0.05)');
      gradient.addColorStop(0.5, 'rgba(180, 160, 140, 0.03)');
      gradient.addColorStop(1, 'rgba(100, 120, 150, 0.05)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(render);
    };

    render();

    // 清理
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchmove', handleTouchMove);
      clearInterval(autoParticleInterval);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full ${className}`}
      style={{
        zIndex: 0,
        pointerEvents: 'auto',
        background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3142 50%, #1a2433 100%)'
      }}
    />
  );
};

export default FluidBackground;
