import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  effect?: 'blur' | 'black-and-white' | 'opacity';
  placeholderSrc?: string;
  width?: string | number;
  height?: string | number;
  threshold?: number;
  onClick?: () => void;
}

const LazyImage = ({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  effect = 'blur',
  placeholderSrc,
  width,
  height,
  threshold = 100,
  onClick
}: LazyImageProps) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      wrapperClassName={wrapperClassName}
      effect={effect}
      placeholderSrc={placeholderSrc}
      width={width}
      height={height}
      threshold={threshold}
      onClick={onClick}
    />
  );
};

export default LazyImage;
