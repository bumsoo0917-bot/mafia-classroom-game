'use client';

import { useState } from 'react';

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
    <div className="game-card text-center space-y-4 bg-amber-500/10 border-amber-400/50">
      <p className="text-white/60 text-lg font-bold uppercase tracking-widest">게임 코드</p>
      <div className="text-8xl md:text-9xl font-black text-amber-400 tracking-widest font-mono">
        {gameCode}
      </div>
      <p className="text-white/50 text-sm">학생들에게 이 코드를 알려주세요 (프로젝터 활용 권장)</p>
      <button
        onClick={handleCopy}
        className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
          copied
            ? 'bg-green-500/30 border border-green-400 text-green-300'
            : 'bg-white/10 hover:bg-white/20 border border-white/30 text-white'
        }`}
      >
        {copied ? '✅ 복사됨!' : '📋 코드 복사'}
      </button>
    </div>
  );
}
