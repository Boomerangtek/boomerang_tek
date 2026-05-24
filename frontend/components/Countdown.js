'use client';

import { useEffect, useState } from 'react';

// The scheduler fires on wall-clock cron boundaries (*/m → minutes divisible
// by m, at :00s), so the next run is the next such boundary — not last + m.
function nextRunAt(m) {
  const d = new Date();
  d.setSeconds(0, 0);
  for (let i = 0; i < 24 * 60; i++) {
    d.setMinutes(d.getMinutes() + 1);
    if (!m || d.getMinutes() % m === 0) break;
  }
  return d.getTime();
}

export default function Countdown({ intervalMinutes, className = '' }) {
  const [left, setLeft] = useState(null);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, nextRunAt(intervalMinutes) - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [intervalMinutes]);

  if (left === null) return <span className={className}>--:--</span>;
  const s = Math.ceil(left / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return (
    <span className={className}>
      {mm}:{ss}
    </span>
  );
}
