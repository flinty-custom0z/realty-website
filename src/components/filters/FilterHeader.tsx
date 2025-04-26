'use client';

import { getListingText } from '@/hooks/useFilterState';

export interface FilterHeaderProps {
  totalCount: number;
  hasCustomFilters: boolean;
  onReset: () => void;
}

export function FilterHeader({
  totalCount,
  hasCustomFilters,
  onReset
}: FilterHeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-800 font-medium">Фильтры</h3>
        {hasCustomFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>
      <div className="text-sm text-gray-500 mb-2">
        {totalCount > 0 ? (
          <span>Найдено: {totalCount} {getListingText(totalCount)}</span>
        ) : (
          <span>Нет объявлений по заданным параметрам</span>
        )}
      </div>
    </div>
  );
} 