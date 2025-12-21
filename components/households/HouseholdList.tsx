interface HouseholdMember {
  id: string;
  name: string;
  profilePic?: string | null;
}

interface Household {
  id: string;
  unit: string;
  ownerName: string;
  residents: number;
  status: 'paid' | 'pending' | 'overdue';
  balance: number;
  phone: string;
  email: string;
  members?: HouseholdMember[];
}

interface HouseholdListProps {
  households: Household[];
  onHouseholdClick: (household: Household) => void;
}

// Avatar component for members
function MemberAvatar({ member, size = 24 }: { member: HouseholdMember; size?: number }) {
  if (member.profilePic) {
    return (
      <img 
        src={member.profilePic} 
        alt={member.name}
        className="rounded-full object-cover border-2 border-bg-white"
        style={{ width: size, height: size }}
      />
    );
  }
  
  // Default avatar with initials
  const colors = [
    'from-purple-500 to-purple-600',
    'from-blue-500 to-blue-600', 
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600'
  ];
  const colorIndex = member.name.charCodeAt(0) % colors.length;
  
  return (
    <div 
      className={`rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center border-2 border-bg-white`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-semibold" style={{ fontSize: size * 0.4 }}>
        {member.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function HouseholdList({ households, onHouseholdClick }: HouseholdListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return { bg: 'bg-[rgba(122,197,85,0.2)]', text: 'text-[#7AC555]' };
      case 'pending': return { bg: 'bg-[rgba(223,168,116,0.2)]', text: 'text-[#d58d49]' };
      case 'overdue': return { bg: 'bg-[rgba(211,75,94,0.2)]', text: 'text-[#D34B5E]' };
      case 'unoccupied': return { bg: 'bg-[rgba(234,179,8,0.2)]', text: 'text-[#EAB308]' };
      default: return { bg: 'bg-neutral-100', text: 'text-[#787486]' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
      {households.map((household) => {
        const isUnoccupied = household.residents === 0 || (household.members && household.members.length === 0);
        const displayStatus = isUnoccupied ? 'unoccupied' : household.status;
        const statusColor = getStatusColor(displayStatus);
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
                  {isUnoccupied ? 'Unoccupied' : (household.status === 'paid' ? 'Occupied' : household.status)}
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

            <div className="flex items-center gap-[-8px]">
              {household.members && household.members.length > 0 ? (
                <>
                  {household.members.slice(0, 4).map((member, index) => (
                    <div key={member.id} style={{ marginLeft: index > 0 ? -8 : 0, zIndex: 4 - index }}>
                      <MemberAvatar member={member} size={28} />
                    </div>
                  ))}
                  {household.members.length > 4 && (
                    <div 
                      className="rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center border-2 border-bg-white"
                      style={{ width: 28, height: 28, marginLeft: -8 }}
                    >
                      <span className="text-text-secondary text-xs font-medium">
                        +{household.members.length - 4}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <span className="text-text-secondary text-xs">No members</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
