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
        className="w-full py-2.5 deal-accent-bg hover:deal-accent-bg-hover text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {isLoading ? 'Загрузка...' : label}
      </button>
    </div>
  );
} 