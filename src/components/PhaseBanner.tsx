import { GamePhase } from '@/types/game';

interface PhaseBannerProps {
  phase: GamePhase;
  dayNumber?: number;
}

const phaseInfo: Record<GamePhase, { label: string; emoji: string; bg: string; border: string; text: string; glow?: string }> = {
  waiting: {
    label: '참여자 대기 중',
    emoji: '⏳',
    bg: 'rgba(71,85,105,0.3)',
    border: 'rgba(148,163,184,0.3)',
    text: '#cbd5e1',
  },
  roleReveal: {
    label: '역할 확인',
    emoji: '🃏',
    bg: 'rgba(109,40,217,0.3)',
    border: 'rgba(167,139,250,0.5)',
    text: '#c4b5fd',
    glow: '0 0 20px rgba(139,92,246,0.4)',
  },
  night: {
    label: '밤',
    emoji: '🌙',
    bg: 'rgba(15,10,60,0.7)',
    border: 'rgba(99,102,241,0.5)',
    text: '#a5b4fc',
    glow: '0 0 24px rgba(99,102,241,0.5)',
  },
  nightResult: {
    label: '밤 결과 발표',
    emoji: '🌅',
    bg: 'rgba(180,83,9,0.25)',
    border: 'rgba(251,146,60,0.4)',
    text: '#fdba74',
    glow: '0 0 20px rgba(251,146,60,0.3)',
  },
  dayDiscussion: {
    label: '낮 토론',
    emoji: '☀️',
    bg: 'rgba(161,98,7,0.25)',
    border: 'rgba(250,204,21,0.4)',
    text: '#fde047',
    glow: '0 0 20px rgba(250,204,21,0.3)',
  },
  voting: {
    label: '투표',
    emoji: '🗳️',
    bg: 'rgba(153,27,27,0.3)',
    border: 'rgba(239,68,68,0.5)',
    text: '#fca5a5',
    glow: '0 0 20px rgba(239,68,68,0.4)',
  },
  finalDefense: {
    label: '최후변론',
    emoji: '🎤',
    bg: 'rgba(124,58,237,0.3)',
    border: 'rgba(167,139,250,0.5)',
    text: '#c4b5fd',
    glow: '0 0 20px rgba(167,139,250,0.4)',
  },
  finalVote: {
    label: '최종 투표',
    emoji: '⚖️',
    bg: 'rgba(153,27,27,0.35)',
    border: 'rgba(248,113,113,0.5)',
    text: '#fca5a5',
    glow: '0 0 20px rgba(248,113,113,0.4)',
  },
  voteResult: {
    label: '투표 결과',
    emoji: '📋',
    bg: 'rgba(157,23,77,0.25)',
    border: 'rgba(244,114,182,0.4)',
    text: '#f9a8d4',
    glow: '0 0 20px rgba(244,114,182,0.3)',
  },
  ended: {
    label: '게임 종료',
    emoji: '🏁',
    bg: 'rgba(21,128,61,0.25)',
    border: 'rgba(74,222,128,0.4)',
    text: '#86efac',
    glow: '0 0 20px rgba(74,222,128,0.3)',
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
      className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md"
      style={{
        background: info.bg,
        borderColor: info.border,
        color: info.text,
        boxShadow: info.glow ?? 'none',
        fontFamily: '"Black Han Sans", sans-serif',
        fontSize: '1.25rem',
        letterSpacing: '0.02em',
      }}
    >
      <span className="text-2xl">{info.emoji}</span>
      <span>
        {showDay ? `${dayNumber}일차 ` : ''}
        {info.label}
      </span>
    </div>
  );
}
