'use client';

import React, { ReactNode } from 'react';

interface ImageOverlayProps {
  type: 'category' | 'status' | 'price' | 'new' | 'deleted' | 'sale' | 'rent';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  children: ReactNode;
  className?: string;
}

const positionClasses = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

const typeClasses = {
  'category': 'text-white text-xs font-medium px-3 py-1 rounded-md bg-gradient-to-br from-black/60 to-black/0 shadow-sm border border-white/20 backdrop-blur-sm',
  'status': 'bg-black/40 text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-sm border border-white/20',
  'price': 'bg-white px-3 py-1.5 text-sm font-medium text-gray-900 rounded-md shadow-sm border border-transparent',
  'new': 'text-white text-xs font-medium px-3 py-1 rounded-md bg-gradient-to-br from-black/60 to-black/0 shadow-sm border border-white/20 backdrop-blur-sm',
  'deleted': 'text-white text-xs font-medium px-3 py-1 rounded-md bg-gradient-to-br from-red-500/60 to-red-500/0 shadow-sm border border-white/20 backdrop-blur-sm',
  'sale': 'text-white text-xs font-medium px-3 py-1 rounded-md bg-gradient-to-br from-blue-600/70 to-blue-600/0 shadow-sm border border-white/20 backdrop-blur-sm',
  'rent': 'text-white text-xs font-medium px-3 py-1 rounded-md bg-gradient-to-br from-green-600/70 to-green-600/0 shadow-sm border border-white/20 backdrop-blur-sm',
};

export default function ImageOverlay({ 
  type, 
  position, 
  children, 
  className = '' 
}: ImageOverlayProps) {
  return (
    <div className={`absolute ${positionClasses[position]} z-10 transition-all duration-200 ${className}`}>
      <span className={typeClasses[type]}>
        {children}
      </span>
    </div>
  );
} 