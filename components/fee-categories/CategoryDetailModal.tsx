import { Modal } from '../shared/Modal';

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  description: string;
  active: boolean;
}

interface CategoryDetailModalProps {
  category: FeeCategory | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export function CategoryDetailModal({ category, onClose, onEdit, onDelete }: CategoryDetailModalProps) {
  if (!category) return null;

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return { bg: 'bg-[rgba(80,48,229,0.2)]', text: 'text-[#5030e5]' };
      case 'quarterly': return { bg: 'bg-[rgba(223,168,116,0.2)]', text: 'text-[#d58d49]' };
      case 'annual': return { bg: 'bg-[rgba(122,197,85,0.2)]', text: 'text-[#7AC555]' };
      case 'one-time': return { bg: 'bg-[rgba(211,75,94,0.2)]', text: 'text-[#D34B5E]' };
      default: return { bg: 'bg-neutral-100', text: 'text-text-secondary' };
    }
  };

  const frequencyColor = getFrequencyColor(category.frequency);

  return (
    <Modal isOpen={!!category} onClose={onClose}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-text-primary text-2xl">{category.name}</h3>
          <p className="text-text-secondary text-base">Fee Category Details</p>
        </div>
        <button 
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="font-medium text-text-secondary text-xs mb-1">Amount</p>
          <p className="font-semibold text-text-primary text-2xl">${category.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-xs mb-1">Frequency</p>
          <div className={`${frequencyColor.bg} inline-block px-3 py-1.5 rounded-sm`}>
            <p className={`font-medium text-sm ${frequencyColor.text} capitalize`}>
              {category.frequency}
            </p>
          </div>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-xs mb-1">Description</p>
          <p className="text-text-primary text-base">{category.description}</p>
        </div>
        <div>
          <p className="font-medium text-text-secondary text-xs mb-1">Status</p>
          <div className={`${category.active ? 'bg-[rgba(122,197,85,0.2)]' : 'bg-neutral-100'} inline-block px-3 py-1.5 rounded-sm`}>
            <p className={`font-medium text-sm ${category.active ? 'text-[#7AC555]' : 'text-text-secondary'}`}>
              {category.active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-[12px] mt-[24px]">
        <button 
          onClick={onEdit}
          className="flex-1 bg-[#5030e5] text-white px-[20px] py-[12px] rounded-[6px] font-medium text-sm hover:bg-[#4024c4] transition-colors"
        >
          Edit Category
        </button>
        <button 
          onClick={onDelete}
          className="flex-1 border border-[#D34B5E] text-[#D34B5E] px-[20px] py-[12px] rounded-[6px] font-medium text-sm hover:bg-[rgba(211,75,94,0.1)] transition-colors"
        >
          Deactivate
        </button>
      </div>
    </Modal>
  );
}
