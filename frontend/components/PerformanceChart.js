'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceChart({ data, timeRange = '1w' }) {
  // Transform execution data for chart
  const chartData = data.map(exec => ({
    time: new Date(exec.executionTime).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    airdropped: Number(exec.totalAirdropped),
    timestamp: new Date(exec.executionTime).getTime(),
  })).reverse(); // Reverse to show oldest to newest

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-lg border border-blue-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-800">{payload[0].payload.time}</p>
          <p className="text-sm text-orange-600 font-bold">
            {new Intl.NumberFormat('en-US').format(payload[0].value)} tokens
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAirdrop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#87CEEB" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="airdropped" 
            stroke="#FF8C42" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAirdrop)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
