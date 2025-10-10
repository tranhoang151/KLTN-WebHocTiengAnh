import React, { useState, useRef, useEffect } from 'react';
import './OptimizedImage.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  fadeIn?: boolean;
}

/**
 * Optimized image component with lazy loading, blur placeholder, and performance optimizations
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  placeholder,
  blurDataURL,
  priority = false,
  quality = 75,
  sizes,
  onLoad,
  onError,
  lazy = true,
  fadeIn = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Generate optimized image URLs
  const generateOptimizedSrc = (
    originalSrc: string,
    width?: number,
    quality?: number
  ) => {
    // For Firebase Storage URLs, we can add query parameters for optimization
    if (originalSrc.includes('firebasestorage.googleapis.com')) {
      const url = new URL(originalSrc);
      if (width) url.searchParams.set('w', width.toString());
      if (quality) url.searchParams.set('q', quality.toString());
      return url.toString();
    }

    // For other URLs, return as-is (could be extended for other CDNs)
    return originalSrc;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = (originalSrc: string) => {
    if (!width) return undefined;

    const sizes = [1, 1.5, 2, 3]; // Different pixel densities
    return sizes
      .map((size) => {
        const scaledWidth = Math.round(width * size);
        const optimizedSrc = generateOptimizedSrc(
          originalSrc,
          scaledWidth,
          quality
        );
        return `${optimizedSrc} ${size}x`;
      })
      .join(', ');
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  };

  // Update current src when in view
  useEffect(() => {
    if (isInView && src) {
      setCurrentSrc(generateOptimizedSrc(src, width, quality));
    }
  }, [isInView, src, width, quality]);

  // Generate placeholder styles
  const getPlaceholderStyle = (): React.CSSProperties => {
    if (blurDataURL) {
      return {
        backgroundImage: `url(${blurDataURL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(10px)',
        transform: 'scale(1.1)', // Prevent blur edges
      };
    }

    if (placeholder) {
      return {
        backgroundColor: placeholder,
      };
    }

    return {
      backgroundColor: '#f3f4f6',
      backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
                       linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
                       linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
                       linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    };
  };

  const containerClasses = [
    'optimized-image-container',
    className,
    isLoaded && fadeIn ? 'image-loaded' : '',
    hasError ? 'image-error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const imageStyle: React.CSSProperties = {
    ...style,
    width: width || '100%',
    height: height || 'auto',
    opacity: isLoaded && !hasError ? 1 : 0,
    transition: fadeIn ? 'opacity 0.3s ease-in-out' : 'none',
  };

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: width || '100%',
        height: height || 'auto',
        ...getPlaceholderStyle(),
      }}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && (
        <div className="image-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">🖼️</div>
            <div className="placeholder-text">Loading image...</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="image-error-state">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <div className="error-text">Failed to load image</div>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // Preload critical images
          {...(priority && { fetchPriority: 'high' as any })}
        />
      )}

      {/* Loading spinner overlay */}
      {!isLoaded && !hasError && isInView && (
        <div className="image-loading-overlay">
          <div className="loading-spinner-small">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
