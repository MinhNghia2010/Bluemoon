'use client'

interface FilterButton {
  id: string;
  label: string;
  count?: number;
}

interface FilterButtonsProps {
  filters: FilterButton[];
  activeFilter: string;
  onFilterChange: (filterId: string) => void;
  variant?: 'default' | 'primary';
}

export function FilterButtons({ 
  filters, 
  activeFilter, 
  onFilterChange,
  variant = 'default'
}: FilterButtonsProps) {
  return (
    <div className="flex gap-[12px] mb-[24px]">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-[16px] py-[8px] rounded-[6px] text-sm font-medium transition-colors ${
            activeFilter === filter.id
              ? variant === 'primary'
                ? 'bg-brand-primary text-white'
                : 'bg-[var(--brand-primary-light)] text-brand-primary'
              : 'text-text-secondary hover:bg-bg-hover border border-border-default'
          }`}
        >
          {filter.label}
          {filter.count !== undefined && ` (${filter.count})`}
        </button>
      ))}
    </div>
  );
}
