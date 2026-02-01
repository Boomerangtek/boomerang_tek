'use client';

import { useEffect, useState } from 'react';

export default function Stats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConfigs: 0,
    totalExecutions: 0,
    totalSolClaimed: '0.00'
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    fetch(`${apiUrl}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  return (
    <section className="py-20 px-6 border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-slate-600">
              Total users
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {stats.activeConfigs}
            </div>
            <div className="text-sm text-slate-600">
              Active bots
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {stats.totalExecutions}
            </div>
            <div className="text-sm text-slate-600">
              Distributions
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {stats.totalSolClaimed}
            </div>
            <div className="text-sm text-slate-600">
              SOL claimed
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
