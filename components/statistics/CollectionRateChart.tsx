'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CollectionRateData {
  month: string;
  rate: number;
}

interface CollectionRateChartProps {
  data: CollectionRateData[];
}

// Custom tooltip component for dark mode support
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card border border-border-light rounded-lg p-4 shadow-lg min-w-[180px]">
        <p className="text-text-primary text-sm font-medium mb-1">{label}</p>
        <p className="text-text-secondary text-sm">
          Collection Rate: <span className="text-purple-600 dark:text-purple-400 font-medium">{payload[0].value}%</span>
        </p>
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

export function CollectionRateChart({ data }: CollectionRateChartProps) {
  return (
    <div className="bg-bg-white rounded-[16px] p-[24px] shadow-lg border border-border-light">
      <h3 className="font-semibold text-text-primary text-lg mb-[20px]">Collection Rate Trend</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
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
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-default)' }} />
          <Legend content={<CustomLegend />} />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="#5030e5" 
            strokeWidth={3}
            dot={{ fill: '#5030e5', r: 4 }}
            activeDot={{ r: 6 }}
            name="Collection Rate (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
