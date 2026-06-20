'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  durationSeconds: number;
  phaseStartedAt: unknown;
}

function toDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'object' && val !== null && 'toDate' in val) {
    return (val as { toDate: () => Date }).toDate();
  }
  if (typeof val === 'number') return new Date(val);
  return null;
}

export default function Timer({ durationSeconds, phaseStartedAt }: TimerProps) {
  const [remaining, setRemaining] = useState<number>(durationSeconds);

  useEffect(() => {
    const startDate = toDate(phaseStartedAt);

    const update = () => {
      if (!startDate) {
        setRemaining(durationSeconds);
        return;
      }
      const elapsed = Math.floor((Date.now() - startDate.getTime()) / 1000);
      const left = Math.max(0, durationSeconds - elapsed);
      setRemaining(left);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [durationSeconds, phaseStartedAt]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = (remaining / durationSeconds) * 100;

  const colorClass =
    remaining > durationSeconds * 0.5
      ? 'text-green-400'
      : remaining > durationSeconds * 0.25
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="game-card text-center space-y-3">
      <p className="text-white/60 font-bold">남은 시간</p>
      <div className={`text-6xl font-black font-mono ${colorClass}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-full bg-white/10 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ${
            remaining > durationSeconds * 0.5
              ? 'bg-green-500'
              : remaining > durationSeconds * 0.25
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
