'use client'

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  description: string;
  active: boolean;
}

interface CategoryListProps {
  categories: FeeCategory[];
  onCategoryClick: (category: FeeCategory) => void;
}

export function CategoryList({ categories, onCategoryClick }: CategoryListProps) {
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return { bg: 'bg-[rgba(80,48,229,0.2)]', text: 'text-[#5030e5]' };
      case 'quarterly': return { bg: 'bg-[rgba(223,168,116,0.2)]', text: 'text-[#d58d49]' };
      case 'annual': return { bg: 'bg-[rgba(122,197,85,0.2)]', text: 'text-[#7AC555]' };
      case 'one-time': return { bg: 'bg-[rgba(211,75,94,0.2)]', text: 'text-[#D34B5E]' };
      default: return { bg: 'bg-neutral-100', text: 'text-text-secondary' };
    }
  };

  return (
    <div className="bg-bg-white rounded-[16px] overflow-hidden shadow-lg border border-border-light">
      <div className="grid grid-cols-[2fr_1fr_1fr_2fr_80px] gap-[20px] px-[24px] py-[16px] bg-neutral-50 border-b border-border-light">
        <div className="text-sm font-medium text-text-secondary">Category Name</div>
        <div className="text-sm font-medium text-text-secondary">Amount</div>
        <div className="text-sm font-medium text-text-secondary">Frequency</div>
        <div className="text-sm font-medium text-text-secondary">Description</div>
        <div className="text-sm font-medium text-text-secondary text-center">Actions</div>
      </div>

      {categories.map((category) => {
        const frequencyColor = getFrequencyColor(category.frequency);
        return (
          <div
            key={category.id}
            onClick={() => onCategoryClick(category)}
            className="grid grid-cols-[2fr_1fr_1fr_2fr_80px] gap-[20px] px-[24px] py-[20px] border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer transition-colors"
          >
            <div>
              <p className="font-semibold text-text-primary text-base">{category.name}</p>
            </div>
            <div>
              <p className="font-medium text-text-primary text-base">${category.amount.toLocaleString()}</p>
            </div>
            <div>
              <div className={`${frequencyColor.bg} inline-block px-[12px] py-[4px] rounded-[4px]`}>
                <p className={`font-medium text-xs ${frequencyColor.text} capitalize`}>
                  {category.frequency}
                </p>
              </div>
            </div>
            <div>
              <p className="text-text-secondary text-sm line-clamp-1">{category.description}</p>
            </div>
            <div className="text-center">
              <div className={`${category.active ? 'bg-[rgba(122,197,85,0.2)]' : 'bg-neutral-100'} inline-block px-[12px] py-[4px] rounded-[4px]`}>
                <p className={`font-medium text-xs ${category.active ? 'text-[#7AC555]' : 'text-text-secondary'}`}>
                  {category.active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
