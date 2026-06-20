'use client';

import { GamePhase } from '@/types/game';

interface PageBackgroundProps {
  image: string; // e.g. 'main-bg.png'
  overlay?: 'dark' | 'darker' | 'none';
}

export default function PageBackground({ image, overlay = 'dark' }: PageBackgroundProps) {
  const overlayStyle =
    overlay === 'dark'
      ? 'rgba(5,5,20,0.55)'
      : overlay === 'darker'
      ? 'rgba(5,5,20,0.75)'
      : 'transparent';

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: `url(/${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: overlayStyle }}
      />
    </div>
  );
}

// 게임 단계에 따라 배경 이미지 반환
export function getPhaseBackground(phase: GamePhase, winner?: 'mafia' | 'citizen' | null): string {
  if (phase === 'ended') {
    return winner === 'mafia' ? 'ended-mafia-bg.png' : 'ended-citizen-bg.png';
  }
  const map: Record<GamePhase, string> = {
    waiting: 'waiting-bg.png',
    roleReveal: 'role-reveal-bg.png',
    night: 'night-bg.png',
    nightResult: 'night-result-bg.png',
    dayDiscussion: 'day-discussion-bg.png',
    voting: 'voting-bg.png',
    voteResult: 'vote-result-bg.png',
    ended: 'ended-citizen-bg.png',
  };
  return map[phase] ?? 'waiting-bg.png';
}
