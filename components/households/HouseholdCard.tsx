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

interface HouseholdCardProps {
  household: Household;
  onClick: () => void;
  getStatusColor: (status: string) => { bg: string; text: string };
}

export function HouseholdCard({ household, onClick, getStatusColor }: HouseholdCardProps) {
  const statusColor = getStatusColor(household.status);

  return (
    <div 
      onClick={onClick}
      className="bg-bg-white rounded-[16px] p-[20px] cursor-pointer hover:shadow-lg transition-shadow border border-border-light"
    >
      <div className="flex items-start justify-between mb-[16px]">
        <div className="flex items-center gap-[12px]">
          <div className="bg-[#5030e5] rounded-full size-[48px] flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{household.unit[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-text-primary text-base">{household.unit}</p>
            <p className="text-text-secondary text-sm">{household.ownerName}</p>
          </div>
        </div>
        <div className={`${statusColor.bg} px-[12px] py-[4px] rounded-[4px]`}>
          <p className={`font-medium text-xs ${statusColor.text}`}>
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
          <p className="text-text-secondary text-xs">Phone</p>
          <p className="font-medium text-text-primary text-xs">{household.phone}</p>
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
}
