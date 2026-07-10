import Link from 'next/link';
import PageBackground from '@/components/PageBackground';
import { IconSearch, IconShield, IconHeart, IconUsers, IconChevronRight } from '@/components/Icons';

function IconSword({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
    </svg>
  );
}

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <PageBackground image="main-bg.webp" overlay="dark" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-900/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full text-center space-y-8 relative z-10">

        <div className="space-y-4">
          <div>
            <h1
              className="text-6xl md:text-7xl text-white leading-tight"
              style={{
                fontFamily: '"Hahmlet", "Black Han Sans", serif',
                fontWeight: 900,
                letterSpacing: 0,
                textShadow: '0 0 34px rgba(167,139,250,0.62), 0 8px 28px rgba(0,0,0,0.72)',
              }}
            >
              교실 마피아
            </h1>
            <h2
              className="text-3xl md:text-4xl mt-1"
              style={{
                fontFamily: '"Black Han Sans", sans-serif',
                letterSpacing: 0,
                background: 'linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              추리 게임
            </h2>
          </div>
          <p
            className="text-amber-100/70 text-lg md:text-xl font-medium"
            style={{ fontFamily: '"Hahmlet", serif', fontWeight: 600, letterSpacing: 0 }}
          >
            마을에 숨어든 마피아를 찾아라
          </p>
        </div>

        <div className="game-card">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-bold">등장 인물</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-900/20 border border-red-500/20">
              <IconSword className="text-red-400 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-red-400 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>마피아</div>
                <div className="text-white/40 text-xs">밤에 시민을 탈락</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
              <IconSearch className="text-blue-400 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-blue-400 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>경찰</div>
                <div className="text-white/40 text-xs">정체를 조사</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-900/20 border border-green-500/20">
              <IconHeart className="text-green-400 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-green-400 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>의사</div>
                <div className="text-white/40 text-xs">시민을 보호</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-500/20">
              <IconUsers className="text-slate-300 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-slate-300 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>시민</div>
                <div className="text-white/40 text-xs">마피아를 찾아라</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/teacher/login" className="block">
            <button
              className="w-full flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
              style={{
                fontFamily: '"Black Han Sans", sans-serif',
                letterSpacing: 0,
                background: 'linear-gradient(135deg, #b45309, #f59e0b)',
                boxShadow: '0 4px 28px rgba(217,119,6,0.45)',
              }}
            >
              <IconShield size={28} />
              교사용 시작하기
              <IconChevronRight size={22} />
            </button>
          </Link>
          <Link href="/join" className="block">
            <button
              className="w-full flex items-center justify-center gap-3 py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
              style={{
                fontFamily: '"Black Han Sans", sans-serif',
                letterSpacing: 0,
                background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
                boxShadow: '0 4px 28px rgba(6,182,212,0.4)',
              }}
            >
              <IconSearch size={28} />
              학생 입장하기
              <IconChevronRight size={22} />
            </button>
          </Link>
        </div>

        <p className="text-white/20 text-xs tracking-widest">초등학교 6학년 교실용 · 교육 목적</p>
      </div>
    </main>
  );
}
