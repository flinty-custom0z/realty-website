'use client';

import { FilterOption } from '@/types/filters';
import { MultiSelectFilter } from './MultiSelectFilter';

export interface CityFilterProps {
  cities: Array<{
    id: string;
    name: string;
    slug: string;
    value: string;
    count: number;
    available: boolean;
  }>;
  selected: string[];
  onChange: (value: string) => void;
}

export function CityFilter({ cities, selected, onChange }: CityFilterProps) {
  // Transform the cities to display the name but use the ID as value
  const cityOptions = cities.map(city => ({
    value: city.id,
    label: city.name,
    count: city.count,
    available: city.available
  }));
  
  return (
    <MultiSelectFilter
      title="Город"
      options={cityOptions}
      selected={selected}
      onChange={onChange}
      maxHeight="12rem"
    />
  );
} 