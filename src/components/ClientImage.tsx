'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ClientImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export default function ClientImage({
  src,
  alt,
  fill = false,
  className = '',
  sizes = '100vw',
  priority = false,
  fallbackSrc = '/images/placeholder.png',
}: ClientImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  
  const handleError = () => {
    setImgSrc(fallbackSrc);
  };
  
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}