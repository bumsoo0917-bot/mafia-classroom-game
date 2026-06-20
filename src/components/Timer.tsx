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

  const isUrgent = remaining <= durationSeconds * 0.25 && remaining > 0;
  const glowColor = remaining > durationSeconds * 0.5
    ? 'rgba(34,197,94,0.5)'
    : remaining > durationSeconds * 0.25
    ? 'rgba(234,179,8,0.5)'
    : 'rgba(239,68,68,0.7)';

  return (
    <div
      className="rounded-2xl border p-5 text-center space-y-3 backdrop-blur-md"
      style={{
        background: 'rgba(0,0,0,0.4)',
        borderColor: isUrgent ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)',
        boxShadow: isUrgent ? '0 0 24px rgba(239,68,68,0.3)' : 'none',
      }}
    >
      <p className="text-white/50 font-bold text-sm tracking-widest uppercase">⏱ 남은 시간</p>
      <div
        className={`text-6xl font-black font-mono ${colorClass} ${isUrgent ? 'animate-pulse' : ''}`}
        style={{ textShadow: `0 0 30px ${glowColor}` }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ${
            remaining > durationSeconds * 0.5
              ? 'bg-gradient-to-r from-green-500 to-green-400'
              : remaining > durationSeconds * 0.25
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
              : 'bg-gradient-to-r from-red-600 to-red-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
