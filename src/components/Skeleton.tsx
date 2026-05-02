interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string;
  height?: string;
}

const Skeleton = ({ className = '', variant = 'rect', width, height }: SkeletonProps) => {
  const sizeClasses = variant === 'text'
    ? 'h-4 w-3/4'
    : variant === 'circle'
      ? 'rounded-full'
      : 'rounded-lg';

  return (
    <div
      className={`bg-gray-200 animate-pulse ${sizeClasses} ${className}`}
      style={{ width, height }}
      role="presentation"
      aria-hidden="true"
    />
  );
};

export default Skeleton;
