'use client';

import { useState, useRef, useEffect } from 'react';

interface TruncatedCellProps {
  text: string;
  maxWidth?: number;
  className?: string;
}

export default function TruncatedCell({ 
  text, 
  maxWidth = 280, 
  className = '' 
}: TruncatedCellProps) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkTruncation = () => {
      if (cellRef.current) {
        setIsTruncated(cellRef.current.scrollWidth > cellRef.current.clientWidth);
      }
    };
    
    checkTruncation();
    
    // Check again if window is resized
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);
  
  return (
    <div className="relative">
      <div 
        ref={cellRef}
        className={`whitespace-nowrap overflow-hidden text-overflow-ellipsis ${className}`}
        style={{ maxWidth: `${maxWidth}px` }}
        onMouseEnter={() => isTruncated && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {text}
      </div>
      
      {showTooltip && (
        <div className="absolute z-50 bg-gray-800 text-white text-sm py-1 px-2 rounded shadow-lg max-w-xs whitespace-normal left-0 -bottom-8">
          {text}
        </div>
      )}
    </div>
  );
} 