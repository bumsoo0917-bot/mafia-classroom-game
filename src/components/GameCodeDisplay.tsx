'use client';

import { useState } from 'react';
import { IconCopy, IconCheck } from '@/components/Icons';

interface GameCodeDisplayProps {
  gameCode: string;
}

export default function GameCodeDisplay({ gameCode }: GameCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="text-center space-y-4 rounded-2xl border p-6 backdrop-blur-md"
      style={{
        background: 'rgba(180,120,0,0.12)',
        borderColor: 'rgba(251,191,36,0.4)',
        boxShadow: '0 0 40px rgba(251,191,36,0.15)',
      }}
    >
      <p
        className="text-amber-300/70 text-sm uppercase tracking-[0.25em]"
        style={{ fontFamily: '"Black Han Sans", sans-serif' }}
      >
        게임 코드
      </p>
      <div
        className="text-8xl md:text-9xl text-amber-400 tracking-[0.15em] font-mono"
        style={{
          fontFamily: '"Black Han Sans", sans-serif',
          textShadow: '0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.3)',
        }}
      >
        {gameCode}
      </div>
      <p className="text-white/40 text-sm">학생들에게 이 코드를 알려주세요</p>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
        style={
          copied
            ? { background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(74,222,128,0.4)', color: '#86efac' }
            : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }
        }
      >
        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        {copied ? '복사됨!' : '코드 복사'}
      </button>
    </div>
  );
}
