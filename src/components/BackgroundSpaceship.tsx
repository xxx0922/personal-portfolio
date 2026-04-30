import { useEffect, useState } from 'react';

const BackgroundSpaceship = () => {
  const [position, setPosition] = useState({ x: 0, y: 30 });

  useEffect(() => {
    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // 秒

      // 循环飞行路径（贝塞尔曲线）
      const progress = (elapsed % 30) / 30; // 30秒一个循环

      // 水平移动
      const x = progress * 100;

      // 垂直波浪运动
      const y = 30 + Math.sin(progress * Math.PI * 4) * 15;

      setPosition({ x, y });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-10 transition-all duration-100"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* 小型飞船 */}
      <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-[0_0_15px_rgba(0,212,255,0.6)]">
        <defs>
          <linearGradient id="miniShipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0099ff" />
          </linearGradient>
        </defs>

        {/* 飞船主体 */}
        <path
          d="M20 8 L26 22 L23 25 L20 28 L17 25 L14 22 Z"
          fill="url(#miniShipGradient)"
          opacity="0.8"
        />

        {/* 驾驶舱 */}
        <circle cx="20" cy="16" r="3" fill="#00ffff" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.9;0.6" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* 引擎光效 */}
        <ellipse cx="20" cy="28" rx="5" ry="2" fill="#00d4ff" opacity="0.5">
          <animate attributeName="ry" values="2;4;2" dur="0.4s" repeatCount="indefinite" />
        </ellipse>
      </svg>

      {/* 光迹 */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-20 bg-gradient-to-b from-cyan-400/60 to-transparent"
        style={{
          boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)'
        }}
      />
    </div>
  );
};

export default BackgroundSpaceship;
