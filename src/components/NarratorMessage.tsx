interface NarratorMessageProps {
  message: string;
}

export default function NarratorMessage({ message }: NarratorMessageProps) {
  return (
    <div className="game-card bg-indigo-900/40 border-indigo-400/50 flex items-start gap-4">
      <div className="text-3xl flex-shrink-0">📢</div>
      <div>
        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-1">
          게임 진행자
        </p>
        <p className="text-white/90 text-lg font-medium leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
