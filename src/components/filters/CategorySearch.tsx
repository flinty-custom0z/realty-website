'use client';

export interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

export function CategorySearch({
  value,
  onChange,
  onSearch
}: CategorySearchProps) {
  return (
    <form onSubmit={onSearch} className="mb-5">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Поиск в категории"
          className="w-full py-2 pl-10 pr-4 rounded-md bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm"
        />
      </div>
    </form>
  );
} 