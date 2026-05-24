'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceChart({ data, timeRange = '1w', symbol = 'tokens' }) {
  // Transform execution data for chart. Include the time-of-day in the label so
  // runs on the same day are distinct points (otherwise they collapse onto one
  // x category and the curve/tooltip break).
  const chartData = data.map(exec => ({
    time: new Date(exec.executionTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    airdropped: Number(exec.totalAirdropped),
    timestamp: new Date(exec.executionTime).getTime(),
  })).reverse(); // Reverse to show oldest to newest

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-line bg-night-900 p-3 shadow-soft">
          <p className="text-xs text-mut">{payload[0].payload.time}</p>
          <p className="text-sm font-semibold text-boom-700">
            {new Intl.NumberFormat('en-US').format(payload[0].value)}
            {symbol ? ` $${symbol}` : ' tokens'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAirdrop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34D399" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E3EBE5" />
          <XAxis dataKey="time" stroke="#8B95A4" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#8B95A4"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#34D399', strokeOpacity: 0.3 }} />
          <Area
            type="monotone"
            dataKey="airdropped"
            stroke="#34D399"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAirdrop)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
