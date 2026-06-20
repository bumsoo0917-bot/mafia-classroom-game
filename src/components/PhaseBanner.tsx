import { GamePhase } from '@/types/game';

interface PhaseBannerProps {
  phase: GamePhase;
  dayNumber?: number;
}

const phaseInfo: Record<GamePhase, { label: string; emoji: string; colorClass: string }> = {
  waiting: {
    label: '참여자 대기 중',
    emoji: '⏳',
    colorClass: 'bg-slate-500/20 border-slate-400 text-slate-200',
  },
  roleReveal: {
    label: '역할 확인',
    emoji: '🃏',
    colorClass: 'bg-purple-500/20 border-purple-400 text-purple-200',
  },
  night: {
    label: '밤',
    emoji: '🌙',
    colorClass: 'bg-indigo-900/40 border-indigo-400 text-indigo-200',
  },
  nightResult: {
    label: '밤 결과 발표',
    emoji: '🌅',
    colorClass: 'bg-orange-500/20 border-orange-400 text-orange-200',
  },
  dayDiscussion: {
    label: '낮 토론',
    emoji: '☀️',
    colorClass: 'bg-yellow-500/20 border-yellow-400 text-yellow-200',
  },
  voting: {
    label: '투표',
    emoji: '🗳️',
    colorClass: 'bg-red-500/20 border-red-400 text-red-200',
  },
  voteResult: {
    label: '투표 결과',
    emoji: '📋',
    colorClass: 'bg-pink-500/20 border-pink-400 text-pink-200',
  },
  ended: {
    label: '게임 종료',
    emoji: '🏁',
    colorClass: 'bg-green-500/20 border-green-400 text-green-200',
  },
};

export default function PhaseBanner({ phase, dayNumber }: PhaseBannerProps) {
  const info = phaseInfo[phase];

  if (!info) return null;

  const showDay =
    dayNumber &&
    ['night', 'nightResult', 'dayDiscussion', 'voting', 'voteResult'].includes(phase);

  return (
    <div
      className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold text-xl ${info.colorClass}`}
    >
      <span className="text-2xl">{info.emoji}</span>
      <span>
        {showDay ? `${dayNumber}일차 ` : ''}
        {info.label}
      </span>
    </div>
  );
}
