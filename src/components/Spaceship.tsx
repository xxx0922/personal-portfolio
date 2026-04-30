import { useEffect, useState } from 'react';

interface SpaceshipProps {
  onComplete?: () => void;
}

const Spaceship = ({ onComplete }: SpaceshipProps) => {
  const [position, setPosition] = useState({ x: 50, y: -10 });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 飞船飞行路径动画
    const duration = 3000; // 3秒
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 贝塞尔曲线路径
      const x = 50 + Math.sin(progress * Math.PI * 2) * 20;
      const y = -10 + progress * 120;

      setPosition({ x, y });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 500);
      }
    };

    animate();
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none transition-all duration-100"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* 飞船SVG */}
      <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]">
        <defs>
          <linearGradient id="shipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#0099ff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 飞船主体 */}
        <path
          d="M30 10 L40 35 L35 40 L30 45 L25 40 L20 35 Z"
          fill="url(#shipGradient)"
          filter="url(#glow)"
        />

        {/* 驾驶舱 */}
        <circle cx="30" cy="25" r="5" fill="#00ffff" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* 引擎光效 */}
        <ellipse cx="30" cy="45" rx="8" ry="3" fill="#00d4ff" opacity="0.6">
          <animate attributeName="ry" values="3;6;3" dur="0.3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
      </svg>

      {/* 光迹 */}
      <div
        className="absolute top-full left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-cyan-400 to-transparent"
        style={{
          height: '100px',
          boxShadow: '0 0 10px rgba(0, 212, 255, 0.8)'
        }}
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-cyan-300 to-transparent"></div>
      </div>
    </div>
  );
};

export default Spaceship;
