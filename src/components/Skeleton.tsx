import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-700/50 overflow-hidden';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const animationClasses = animation === 'pulse'
    ? 'animate-pulse'
    : 'animate-shimmer';

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'string' ? width : `${width}px`;
  if (height) style.height = typeof height === 'string' ? height : `${height}px`;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// 预设骨架屏组件

export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 bg-[#1E293B]/95 backdrop-blur-sm border border-white/10 animate-pulse">
      {/* 顶部标签占位 */}
      <div className="flex justify-between mb-4">
        <Skeleton variant="rounded" width={80} height={20} className="bg-gray-700/30" />
      </div>

      {/* 图标区域占位 */}
      <div className="h-40 rounded-xl bg-gray-700/30 mb-6"></div>

      {/* 标题占位 */}
      <Skeleton variant="text" width="70%" height={24} className="bg-gray-600/50 mb-3" />

      {/* 描述占位 */}
      <Skeleton variant="text" width="90%" height={16} className="bg-gray-700/40 mb-2" />
      <Skeleton variant="text" width="60%" height={16} className="bg-gray-700/40" />
    </div>
  );
}

export function SkeletonToolCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 animate-pulse">
      {/* 顶部渐变条占位 */}
      <div className="h-1 bg-gray-700/30 rounded-t-2xl mb-4"></div>

      {/* 图标占位 */}
      <div className="w-16 h-16 rounded-xl bg-gray-700/30 mb-4"></div>

      {/* 标题占位 */}
      <Skeleton variant="text" width="80%" height={20} className="bg-gray-600/50 mb-2" />

      {/* 描述占位 */}
      <Skeleton variant="text" width="100%" height={14} className="bg-gray-700/40 mb-1" />
      <Skeleton variant="text" width="70%" height={14} className="bg-gray-700/40" />
    </div>
  );
}

export function SkeletonProfessionalCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 animate-pulse">
      {/* 图标占位 */}
      <div className="w-24 h-24 rounded-2xl bg-gray-700/30 mx-auto mb-6"></div>

      {/* 标题占位 */}
      <Skeleton variant="text" width="60%" height={28} className="bg-gray-600/50 mx-auto mb-3" />

      {/* 描述占位 */}
      <Skeleton variant="text" width="80%" height={18} className="bg-gray-700/40 mx-auto mb-8" />

      {/* 技能列表占位 */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2">
            <Skeleton variant="text" width={80} height={14} className="bg-gray-700/40" />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="w-2 h-2 rounded-full bg-gray-700/30"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonAvatar() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonImage({ className = '', aspectRatio = 'square' }: { className?: string; aspectRatio?: 'square' | 'video' | 'portrait' }) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  return (
    <div className={`${aspectClasses[aspectRatio]} ${className} bg-gray-700/50 animate-pulse rounded-lg`} />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          height={16}
          className="bg-gray-700/40"
        />
      ))}
    </div>
  );
}
