'use client';

export default function StatCard({ 
  label, 
  value, 
  subtitle, 
  trend, 
  trendValue,
  valueColor = 'text-gray-800',
  icon
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </span>
        </div>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </span>
        )}
      </div>
      <p className={`text-3xl font-bold mb-1 ${valueColor}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
