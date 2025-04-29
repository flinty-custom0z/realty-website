'use client';

export interface ApplyFiltersButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function ApplyFiltersButton({
  onClick,
  isLoading = false,
  disabled = false,
  label = 'Применить фильтры'
}: ApplyFiltersButtonProps) {
  return (
    <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-100 mt-6">
      <button
        type="submit"
        disabled={isLoading || disabled}
        className="w-full py-2.5 deal-accent-bg hover:deal-accent-bg-hover text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium relative min-h-[42px]"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        <span className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {label}
        </span>
        
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center text-white">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Загрузка...
          </span>
        )}
      </button>
    </div>
  );
} 