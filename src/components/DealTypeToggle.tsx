'use client';

import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';

interface DealTypeToggleProps {
  current: 'sale' | 'rent';
  variant?: 'default' | 'sidebar' | 'primary' | 'nav';
  showCounts?: boolean;
  counts?: {
    sale: number;
    rent: number;
  };
  onChange: (type: 'sale' | 'rent') => void;
}

const DealTypeToggle = ({ 
  current, 
  variant = 'default', 
  showCounts = false,
  counts = { sale: 0, rent: 0 },
  onChange 
}: DealTypeToggleProps) => {
  // Map legacy variants to new ones
  const normalizedVariant = variant === 'primary' ? 'default' : variant;
  
  // Determine styles based on variant
  const styles = {
    default: {
      container: "inline-flex items-center bg-white rounded-full p-1 text-sm border border-gray-200 shadow-sm",
      button: "py-2 px-5 text-sm rounded-full relative font-medium transition-all duration-200",
      active: "text-white",
      inactive: "text-gray-600 hover:text-gray-800",
      background: "absolute inset-0 rounded-full deal-accent-bg"
    },
    sidebar: {
      container: "flex w-full bg-gray-50 rounded-lg p-1 text-sm border border-gray-200",
      button: "py-2 flex-1 text-center rounded-md relative font-medium transition-all duration-200",
      active: "text-white",
      inactive: "text-gray-600 hover:text-gray-700",
      background: "absolute inset-0 rounded-md deal-accent-bg"
    },
    nav: {
      container: "flex space-x-6 items-center",
      button: "relative py-1 px-2 text-sm transition-colors duration-300",
      active: "deal-accent-text font-medium",
      inactive: "text-gray-600 hover:text-gray-900",
      background: "absolute -bottom-1 left-0 right-0 h-0.5 deal-accent-bg"
    }
  };

  // Get current style or fallback to default
  const currentStyle = styles[normalizedVariant] || styles.default;
  
  // Format count display
  const formatCount = (count: number) => {
    if (!showCounts) return '';
    return ` (${formatNumber(count)})`;
  };
  
  // Format label
  const getLabel = (type: 'sale' | 'rent', count: number) => {
    const countText = formatCount(count);
    return (
      <>
        <span className="sr-only">{type === 'sale' ? 'For Sale' : 'For Rent'}</span>
        <span aria-hidden="true">{type === 'sale' ? 'Продажа' : 'Аренда'}{countText}</span>
      </>
    );
  };

  // Special case for nav variant
  if (normalizedVariant === 'nav') {
    return (
      <div className={currentStyle.container} role="radiogroup" aria-label="Property deal type">
        <button
          type="button"
          onClick={() => onChange('sale')}
          className={`${currentStyle.button} ${current === 'sale' ? currentStyle.active : currentStyle.inactive}`}
          aria-checked={current === 'sale'}
          role="radio"
        >
          {getLabel('sale', counts.sale)}
          {current === 'sale' && (
            <motion.div 
              layoutId="navIndicator"
              className={currentStyle.background}
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => onChange('rent')}
          className={`${currentStyle.button} ${current === 'rent' ? currentStyle.active : currentStyle.inactive}`}
          aria-checked={current === 'rent'}
          role="radio"
        >
          {getLabel('rent', counts.rent)}
          {current === 'rent' && (
            <motion.div 
              layoutId="navIndicator"
              className={currentStyle.background}
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </div>
    );
  }

  // Default style for other variants
  return (
    <div className={currentStyle.container} role="radiogroup" aria-label="Property deal type">
      <button
        type="button"
        onClick={() => onChange('sale')}
        className={`${currentStyle.button} ${current === 'sale' ? currentStyle.active : currentStyle.inactive}`}
        aria-checked={current === 'sale'}
        role="radio"
      >
        {current === 'sale' && (
          <motion.div
            layoutId={`dealTypeBackground-${normalizedVariant}`}
            className={currentStyle.background}
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        )}
        <span className="relative z-10">{getLabel('sale', counts.sale)}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('rent')}
        className={`${currentStyle.button} ${current === 'rent' ? currentStyle.active : currentStyle.inactive}`}
        aria-checked={current === 'rent'}
        role="radio"
      >
        {current === 'rent' && (
          <motion.div
            layoutId={`dealTypeBackground-${normalizedVariant}`}
            className={currentStyle.background}
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        )}
        <span className="relative z-10">{getLabel('rent', counts.rent)}</span>
      </button>
    </div>
  );
};

export default DealTypeToggle; 