'use client';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const isActive = status === 'active';
  const label = isActive ? 'Активно' : 'Неактивно';
  
  const baseClasses = 'status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200';
  
  const statusClasses = isActive 
    ? 'bg-green-50 text-green-700 border border-green-200' 
    : 'bg-gray-50 text-gray-600 border border-gray-200';
    
  return (
    <span className={`${baseClasses} ${statusClasses} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full inline-block mr-1.5 ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
      {label}
    </span>
  );
} 