'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
  title?: string;
}

// Format currency in USD
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Custom tooltip component for dark mode support
const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const percentage = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-bg-card border border-border-light rounded-lg p-4 shadow-lg min-w-[200px]">
        <p className="text-text-primary text-sm font-medium">{payload[0].name}</p>
        <p className="text-text-secondary text-sm mt-1">{formatCurrency(payload[0].value)}</p>
        <p className="text-brand-primary text-sm font-semibold mt-1">{percentage}%</p>
      </div>
    );
  }
  return null;
};

// Custom legend for dark mode support (vertical layout for right side)
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-col gap-3">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shrink-0" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-primary text-xs truncate max-w-[120px]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function CategoryDistributionChart({ data, title = "Revenue by Category" }: CategoryDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light">
      <h3 className="font-semibold text-text-primary text-lg mb-[16px]">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            cx="35%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
          <Legend 
            content={<CustomLegend />} 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            wrapperStyle={{ right: 20, top: '50%', transform: 'translateY(-50%)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
