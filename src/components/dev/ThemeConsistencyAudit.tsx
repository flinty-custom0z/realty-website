'use client';

import { useDealType } from '@/contexts/DealTypeContext';

export default function ThemeConsistencyAudit() {
  const { dealType } = useDealType();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg border z-50">
      <h3 className="font-bold mb-2">Theme Audit</h3>
      <p>Current mode: <span className="font-mono">{dealType}</span></p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="deal-accent-bg p-2 text-white text-center">Accent BG</div>
        <div className="deal-accent-border border-2 p-2 text-center">Accent Border</div>
        <div className="deal-accent-text p-2 text-center">Accent Text</div>
        <div className="bg-white p-2 text-center" style={{color: 'var(--logo-primary)'}}>Logo Primary</div>
      </div>
    </div>
  );
} 