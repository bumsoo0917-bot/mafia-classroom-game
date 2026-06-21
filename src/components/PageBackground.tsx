'use client';

import { GamePhase } from '@/types/game';

interface PageBackgroundProps {
  image: string; // e.g. 'main-bg.webp'
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: `url(/${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayStyle,
        }}
      />
    </div>
  );
}

// 게임 단계에 따라 배경 이미지 반환
export function getPhaseBackground(phase: GamePhase, winner?: 'mafia' | 'citizen' | null): string {
  if (phase === 'ended') {
    return winner === 'mafia' ? 'ended-mafia-bg.webp' : 'ended-citizen-bg.webp';
  }
  const map: Record<GamePhase, string> = {
    waiting: 'waiting-bg.webp',
    roleReveal: 'role-reveal-bg.webp',
    night: 'night-bg.webp',
    nightResult: 'night-result-bg.webp',
    dayDiscussion: 'day-discussion-bg.webp',
    voting: 'voting-bg.webp',
    finalDefense: 'voting-bg.webp',
    finalVote: 'voting-bg.webp',
    voteResult: 'vote-result-bg.webp',
    ended: 'ended-citizen-bg.webp',
  };
  return map[phase] ?? 'waiting-bg.webp';
}
