interface PaymentFiltersProps {
  filter: 'all' | 'pending' | 'collected' | 'overdue';
  onFilterChange: (filter: 'all' | 'pending' | 'collected' | 'overdue') => void;
}

export function PaymentFilters({ filter, onFilterChange }: PaymentFiltersProps) {
  return (
    <div className="flex items-center gap-[12px]">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-[16px] py-[8px] rounded-[6px] font-medium text-sm ${
          filter === 'all' 
            ? 'bg-brand-primary text-white' 
            : 'border border-border-default text-text-secondary hover:bg-bg-hover'
        }`}
      >
        All Payments
      </button>
      
      <button
        onClick={() => onFilterChange('pending')}
        className={`px-[16px] py-[8px] rounded-[6px] font-medium text-sm ${
          filter === 'pending' 
            ? 'bg-brand-primary text-white' 
            : 'border border-border-default text-text-secondary hover:bg-bg-hover'
        }`}
      >
        Pending
      </button>

      <button
        onClick={() => onFilterChange('collected')}
        className={`px-[16px] py-[8px] rounded-[6px] font-medium text-sm ${
          filter === 'collected' 
            ? 'bg-brand-primary text-white' 
            : 'border border-border-default text-text-secondary hover:bg-bg-hover'
        }`}
      >
        Collected
      </button>

      <button
        onClick={() => onFilterChange('overdue')}
        className={`px-[16px] py-[8px] rounded-[6px] font-medium text-sm ${
          filter === 'overdue' 
            ? 'bg-brand-primary text-white' 
            : 'border border-border-default text-text-secondary hover:bg-bg-hover'
        }`}
      >
        Overdue
      </button>
    </div>
  );
}
