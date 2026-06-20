import { PublicPlayer } from '@/types/game';

interface PlayerCardProps {
  player: PublicPlayer;
  isMe?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({ player, isMe, isSelected, onClick }: PlayerCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        w-full text-left p-4 rounded-xl border font-bold text-lg transition-all
        ${!player.isAlive ? 'opacity-40 cursor-default' : ''}
        ${isSelected
          ? 'bg-indigo-500/40 border-indigo-400 text-white scale-105'
          : onClick && player.isAlive
          ? 'bg-white/5 border-white/20 text-white/80 hover:bg-white/15 hover:border-white/40'
          : 'bg-white/5 border-white/20 text-white/80 cursor-default'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{player.isAlive ? '✅' : '💀'}</span>
        <span>
          {player.nickname}
          {isMe && (
            <span className="ml-2 text-sm bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full font-normal">
              나
            </span>
          )}
        </span>
        {isSelected && <span className="ml-auto text-indigo-300">선택됨</span>}
      </div>
    </button>
  );
}
