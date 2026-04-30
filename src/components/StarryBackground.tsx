import { useEffect, useRef } from 'react';

const StarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
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
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 100;

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    // 网格线
    const gridSize = 50;
    let gridOffset = 0;

    // 扫描线
    let scanLineY = 0;

    // 数据流
    interface DataStream {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
    }

    const dataStreams: DataStream[] = [];
    for (let i = 0; i < 15; i++) {
      dataStreams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: Math.random() * 2 + 1,
        length: Math.random() * 100 + 50,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    // 六边形网格
    interface Hexagon {
      x: number;
      y: number;
      size: number;
      opacity: number;
      pulsePhase: number;
    }

    const hexagons: Hexagon[] = [];
    const hexSize = 40;
    for (let i = 0; i < 20; i++) {
      hexagons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: hexSize,
        opacity: Math.random() * 0.3 + 0.1,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // 绘制六边形
    const drawHexagon = (x: number, y: number, size: number, opacity: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(hx, hy);
        } else {
          ctx.lineTo(hx, hy);
        }
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // 动画循环
    let animationId: number;
    const animate = () => {
      // 半透明清除，创建拖尾效果
      ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0e27');
      gradient.addColorStop(0.6, '#1a1f3a');
      gradient.addColorStop(1, '#1a1f35');
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      // 绘制动态网格
      gridOffset += 0.5;
      if (gridOffset > gridSize) gridOffset = 0;

      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
      ctx.lineWidth = 1;

      // 垂直线
      for (let x = -gridOffset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // 水平线
      for (let y = -gridOffset; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 绘制六边形网格
      hexagons.forEach(hex => {
        hex.pulsePhase += 0.02;
        const pulse = Math.sin(hex.pulsePhase) * 0.2 + 0.8;
        drawHexagon(hex.x, hex.y, hex.size * pulse, hex.opacity * pulse);
      });

      // 更新和绘制粒子
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 边界检测
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
        ctx.fill();

        // 绘制粒子光晕
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, `rgba(0, 212, 255, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // 绘制粒子连线
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.3;
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // 绘制数据流
      dataStreams.forEach(stream => {
        stream.y += stream.speed;
        if (stream.y > canvas.height + stream.length) {
          stream.y = -stream.length;
          stream.x = Math.random() * canvas.width;
        }

        // 绘制数据流渐变
        const gradient = ctx.createLinearGradient(
          stream.x, stream.y - stream.length,
          stream.x, stream.y
        );
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
        gradient.addColorStop(0.5, `rgba(0, 212, 255, ${stream.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stream.x, stream.y - stream.length);
        ctx.lineTo(stream.x, stream.y);
        ctx.stroke();

        // 数据流头部光点
        ctx.beginPath();
        ctx.arc(stream.x, stream.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${stream.opacity})`;
        ctx.fill();
      });

      // 绘制扫描线
      scanLineY += 2;
      if (scanLineY > canvas.height) scanLineY = 0;

      const scanGradient = ctx.createLinearGradient(0, scanLineY - 50, 0, scanLineY + 50);
      scanGradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
      scanGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.3)');
      scanGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanLineY - 50, canvas.width, 100);

      // 绘制随机光束
      if (Math.random() > 0.98) {
        const x = Math.random() * canvas.width;
        const beamGradient = ctx.createLinearGradient(x - 2, 0, x + 2, 0);
        beamGradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
        beamGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.5)');
        beamGradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = beamGradient;
        ctx.fillRect(x - 2, 0, 4, canvas.height);
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      {/* 未来科技动态背景画布 */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{ pointerEvents: 'none' }}
      />

      {/* 城市剪影 */}
      <div className="fixed bottom-0 left-0 w-full h-64 -z-10 opacity-30">
        <svg
          viewBox="0 0 1200 300"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="cityGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0066ff" stopOpacity="0.1" />
            </linearGradient>

            {/* 霓虹光效动画 */}
            <animate
              xlinkHref="#cityGlow"
              attributeName="opacity"
              values="0.3;0.6;0.3"
              dur="3s"
              repeatCount="indefinite"
            />
          </defs>

          {/* 建筑群剪影 */}
          <g fill="url(#cityGlow)">
            {/* 左侧建筑 */}
            <rect x="0" y="150" width="80" height="150" />
            <rect x="90" y="120" width="60" height="180" />
            <rect x="160" y="180" width="70" height="120" />
            <rect x="240" y="100" width="90" height="200" />

            {/* 中央高楼 */}
            <rect x="350" y="50" width="100" height="250" />
            <polygon points="400,50 350,80 450,80" />
            <rect x="470" y="90" width="80" height="210" />
            <rect x="560" y="130" width="70" height="170" />

            {/* 右侧建筑 */}
            <rect x="650" y="110" width="85" height="190" />
            <rect x="750" y="140" width="75" height="160" />
            <rect x="840" y="100" width="95" height="200" />
            <rect x="950" y="160" width="65" height="140" />
            <rect x="1030" y="130" width="80" height="170" />
            <rect x="1120" y="180" width="80" height="120" />
          </g>

          {/* 窗户光效 */}
          <g fill="#00d4ff" opacity="0.6">
            {Array.from({ length: 50 }).map((_, i) => (
              <rect
                key={i}
                x={Math.random() * 1200}
                y={Math.random() * 200 + 50}
                width="3"
                height="4"
                opacity={Math.random() * 0.8 + 0.2}
              >
                <animate
                  attributeName="opacity"
                  values="0.2;0.8;0.2"
                  dur={`${Math.random() * 3 + 2}s`}
                  repeatCount="indefinite"
                />
              </rect>
            ))}
          </g>
        </svg>
      </div>
    </>
  );
};

export default StarryBackground;
