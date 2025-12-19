'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  month: string;
  collected: number;
  pending: number;
  overdue: number;
  total?: number;
}

interface MonthlyRevenueChartProps {
  data: ChartData[];
}

// Format currency in USD (shortened)
const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

// Format full currency in USD
const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Custom tooltip component for dark mode support
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card border border-border-light rounded-lg p-4 shadow-lg min-w-[200px]">
        <p className="text-text-primary text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-secondary">{entry.name}:</span>
            <span className="text-text-primary font-medium">{formatFullCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend for dark mode support
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-text-primary text-xs">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  return (
    <div className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light">
      <h3 className="font-semibold text-text-primary text-lg mb-[20px]">Monthly Revenue Overview</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-light" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128,128,128,0.1)' }} />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="collected" fill="#7AC555" name="Collected/Paid" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" fill="#d58d49" name="Pending" radius={[4, 4, 0, 0]} />
          <Bar dataKey="overdue" fill="#D34B5E" name="Overdue" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
