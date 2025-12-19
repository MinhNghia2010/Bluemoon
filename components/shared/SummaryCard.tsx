interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  dotColor: string;
  valueColor?: string;
}

export function SummaryCard({ title, value, subtitle, dotColor, valueColor = 'text-text-primary' }: SummaryCardProps) {
  return (
    <div className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light">
      <div className="flex items-center justify-between mb-[8px]">
        <span className="text-sm text-text-secondary">{title}</span>
        <div className={`${dotColor} size-[12px] rounded-full`}></div>
      </div>
      <div className={`text-2xl font-semibold mb-[4px] ${valueColor}`}>{value}</div>
      <div className="text-xs text-text-secondary">{subtitle}</div>
    </div>
  );
}
