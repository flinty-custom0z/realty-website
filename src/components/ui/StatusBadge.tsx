'use client';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const isActive = status === 'active';
  
  // Use more descriptive labels for screen readers
  const ariaLabel = isActive ? 'Listing is active' : 'Listing is inactive';
  const visualLabel = isActive ? 'Активно' : 'Неактивно';
  
  // Status-specific icon (could be emoji or character)
  const statusIcon = isActive ? '●' : '○';
  
  const baseClasses = 'status-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200';
  
  // Updated colors for better contrast
  const statusClasses = isActive 
    ? 'bg-green-50 text-green-700 border border-green-300' 
    : 'bg-gray-50 text-gray-700 border border-gray-300';
    
  return (
    <span 
      className={`${baseClasses} ${statusClasses} ${className}`}
      aria-label={ariaLabel}
    >
      {/* Hide the colored dot from screen readers since we have the aria-label */}
      <span 
        className={`h-1.5 w-1.5 rounded-full inline-block mr-1.5 ${isActive ? 'bg-green-600' : 'bg-gray-500'}`}
        aria-hidden="true"
      ></span>
      
      {/* Screen reader text */}
      <span className="sr-only">{ariaLabel}</span>
      
      {/* Visual text */}
      <span aria-hidden="true">{visualLabel}</span>
    </span>
  );
} 