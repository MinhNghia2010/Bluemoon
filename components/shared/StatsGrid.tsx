'use client'

import { LucideIcon } from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
}

interface StatsGridProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns];

  return (
    <div className={`grid ${gridColsClass} gap-[20px] mb-[40px]`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light">
            <div className="flex items-center justify-between mb-[12px]">
              <p className="text-text-secondary text-sm">{stat.label}</p>
              <div className="bg-[rgba(80,48,229,0.08)] rounded-full p-[8px]">
                <Icon className="size-[20px] text-[#5030e5]" />
              </div>
            </div>
            <p className="font-semibold text-text-primary text-[28px]">{stat.value}</p>
            <p className="text-text-secondary text-xs mt-[4px]">{stat.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
