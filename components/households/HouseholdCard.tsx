import { Building2 } from 'lucide-react';

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  residents: number;
  area?: number | null;
  floor?: number | null;
  status: 'paid' | 'pending' | 'overdue' | 'active' | 'inactive';
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
  // Check if household has no residents (unoccupied)
  const isUnoccupied = household.residents === 0;
  
  // Get status color - use yellow for unoccupied
  const statusColor = isUnoccupied 
    ? { bg: 'bg-[rgba(234,179,8,0.2)]', text: 'text-[#EAB308]' }
    : getStatusColor(household.status);

  // Determine display status
  const displayStatus = isUnoccupied 
    ? 'Unoccupied'
    : (household.status === 'active' || household.status === 'paid' || household.status === 'pending' || household.status === 'overdue' 
      ? 'Occupied' 
      : 'Vacant');

  return (
    <div 
      onClick={onClick}
      className="bg-bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition-shadow border border-border-light border-l-4 border-l-brand-primary"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-brand-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-text-primary text-lg">Room {household.unit}</p>
          </div>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
            {displayStatus}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm">Owner:</p>
          <p className="font-medium text-text-primary text-sm text-right truncate max-w-[150px]">{household.ownerName}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm">Members:</p>
          <p className="font-medium text-text-primary text-sm">{household.residents} {household.residents === 1 ? 'person' : 'people'}</p>
        </div>
      </div>
    </div>
  );
}
