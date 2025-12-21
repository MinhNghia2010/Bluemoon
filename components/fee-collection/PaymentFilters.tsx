interface PaymentFiltersProps {
  filter: 'all' | 'pending' | 'collected' | 'overdue';
  onFilterChange: (filter: 'all' | 'pending' | 'collected' | 'overdue') => void;
  counts?: {
    all: number;
    pending: number;
    collected: number;
    overdue: number;
  };
}

export function PaymentFilters({ filter, onFilterChange, counts }: PaymentFiltersProps) {
  const filters = [
    { id: 'all' as const, label: 'All', count: counts?.all },
    { id: 'collected' as const, label: 'Paid', count: counts?.collected },
    { id: 'pending' as const, label: 'Pending', count: counts?.pending },
    { id: 'overdue' as const, label: 'Overdue', count: counts?.overdue }
  ];

  return (
    <div className="flex gap-3 mb-6">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === f.id
              ? 'bg-brand-primary text-white'
              : 'text-text-secondary hover:bg-bg-hover border border-border-default'
          }`}
        >
          {f.label}{f.count !== undefined && ` (${f.count})`}
        </button>
      ))}
    </div>
  );
}
