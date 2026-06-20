interface NarratorMessageProps {
  message: string;
  type?: 'night' | 'day' | 'result' | 'warning' | 'info';
}

const typeStyles = {
  night: {
    bg: 'rgba(15,10,60,0.65)',
    border: 'rgba(99,102,241,0.45)',
    text: '#a5b4fc',
    label: '🌙 게임 진행자',
    labelColor: '#818cf8',
    glow: '0 0 24px rgba(99,102,241,0.3)',
  },
  day: {
    bg: 'rgba(120,70,0,0.25)',
    border: 'rgba(250,204,21,0.35)',
    text: '#fde047',
    label: '☀️ 게임 진행자',
    labelColor: '#fbbf24',
    glow: '0 0 20px rgba(250,204,21,0.2)',
  },
  result: {
    bg: 'rgba(120,50,0,0.25)',
    border: 'rgba(251,146,60,0.4)',
    text: '#fdba74',
    label: '📢 결과 발표',
    labelColor: '#fb923c',
    glow: '0 0 20px rgba(251,146,60,0.25)',
  },
  warning: {
    bg: 'rgba(100,20,20,0.3)',
    border: 'rgba(239,68,68,0.45)',
    text: '#fca5a5',
    label: '⚠️ 알림',
    labelColor: '#f87171',
    glow: '0 0 20px rgba(239,68,68,0.3)',
  },
  info: {
    bg: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.15)',
    text: 'rgba(255,255,255,0.85)',
    label: '💬 게임 진행자',
    labelColor: 'rgba(255,255,255,0.4)',
    glow: 'none',
  },
};

export default function NarratorMessage({ message, type = 'info' }: NarratorMessageProps) {
  const s = typeStyles[type];
  return (
    <div
      className="rounded-2xl border p-5 backdrop-blur-md"
      style={{ background: s.bg, borderColor: s.border, boxShadow: s.glow }}
    >
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: s.labelColor }}>
        {s.label}
      </p>
      <p className="text-lg font-bold leading-relaxed" style={{ color: s.text }}>
        {message}
      </p>
    </div>
  );
}
