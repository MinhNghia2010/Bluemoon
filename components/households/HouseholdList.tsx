interface Household {
  id: string;
  unit: string;
  ownerName: string;
  residents: number;
  status: 'paid' | 'pending' | 'overdue';
  balance: number;
  phone: string;
  email: string;
}

interface HouseholdListProps {
  households: Household[];
  onHouseholdClick: (household: Household) => void;
}

export function HouseholdList({ households, onHouseholdClick }: HouseholdListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return { bg: 'bg-[rgba(122,197,85,0.2)]', text: 'text-[#7AC555]' };
      case 'pending': return { bg: 'bg-[rgba(223,168,116,0.2)]', text: 'text-[#d58d49]' };
      case 'overdue': return { bg: 'bg-[rgba(211,75,94,0.2)]', text: 'text-[#D34B5E]' };
      default: return { bg: 'bg-neutral-100', text: 'text-[#787486]' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
      {households.map((household) => {
        const statusColor = getStatusColor(household.status);
        return (
          <div 
            key={household.id}
            onClick={() => onHouseholdClick(household)}
            className="backdrop-blur-md bg-bg-white/90 rounded-[16px] p-[20px] cursor-pointer hover:shadow-xl transition-all border border-border-light shadow-lg"
          >
            <div className="flex items-start justify-between mb-[16px]">
              <div>
                <p className="font-semibold text-text-primary text-lg">{household.unit}</p>
                <p className="text-text-secondary text-sm">{household.ownerName}</p>
              </div>
              <div className={`${statusColor.bg} px-[12px] py-[4px] rounded-[4px]`}>
                <p className={`font-medium text-xs ${statusColor.text} capitalize`}>
                  {household.status}
                </p>
              </div>
            </div>

            <div className="space-y-[8px] mb-[16px]">
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-xs">Residents</p>
                <p className="font-medium text-text-primary text-xs">{household.residents} people</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-text-secondary text-xs">Balance</p>
                <p className={`font-medium text-xs ${household.balance > 0 ? 'text-[#D34B5E]' : 'text-[#7AC555]'}`}>
                  ${household.balance.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[8px]">
              <img alt="" className="block size-[24px] rounded-full" src="/images/68ebe80fab5d1aee1888ff091f8c21c55b7adb2b.png" />
              <img alt="" className="block size-[24px] rounded-full" src="/images/61ee1b938078bdee53664108367ad387382ae647.png" />
              <img alt="" className="block size-[24px] rounded-full" src="/images/bbacbe45760530f87ab791097144e6fe9bbe34f5.png" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
