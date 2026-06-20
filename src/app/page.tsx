import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-900/15 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 text-6xl opacity-10 animate-float">🌙</div>
        <div className="absolute bottom-10 left-10 text-5xl opacity-10 animate-float" style={{animationDelay:'1.5s'}}>🔍</div>
        <div className="absolute top-1/2 right-8 text-4xl opacity-10 animate-float" style={{animationDelay:'0.8s'}}>🎭</div>
      </div>

      <div className="max-w-lg w-full text-center space-y-8 relative z-10">

        {/* 로고 영역 */}
        <div className="space-y-5">
          <div className="animate-float text-7xl drop-shadow-2xl">🕵️</div>

          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              교실 마피아
            </h1>
            <h2 className="text-3xl md:text-4xl font-black mt-1"
              style={{
                background: 'linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
              추리 게임
            </h2>
          </div>

          <p className="text-white/50 text-lg font-medium tracking-wide">
            ── 교실 속 숨겨진 마피아를 찾아라 ──
          </p>
        </div>

        {/* 역할 소개 카드 */}
        <div className="game-card">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-900/20 border border-red-500/20">
              <span className="text-3xl">🎭</span>
              <div className="text-left">
                <div className="font-black text-red-400 text-lg">마피아</div>
                <div className="text-white/50 text-sm">밤에 시민을 탈락</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
              <span className="text-3xl">🔍</span>
              <div className="text-left">
                <div className="font-black text-blue-400 text-lg">경찰</div>
                <div className="text-white/50 text-sm">정체를 조사</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-900/20 border border-green-500/20">
              <span className="text-3xl">⚕️</span>
              <div className="text-left">
                <div className="font-black text-green-400 text-lg">의사</div>
                <div className="text-white/50 text-sm">시민을 보호</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-500/20">
              <span className="text-3xl">🏘️</span>
              <div className="text-left">
                <div className="font-black text-slate-300 text-lg">시민</div>
                <div className="text-white/50 text-sm">마피아를 찾아라</div>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-4">
          <Link href="/teacher/login" className="block">
            <button className="w-full font-black py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
              style={{
                background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                boxShadow: '0 4px 24px rgba(217, 119, 6, 0.45)',
              }}>
              👩‍🏫 교사용 시작하기
            </button>
          </Link>
          <Link href="/join" className="block">
            <button className="w-full font-black py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
              style={{
                background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
                boxShadow: '0 4px 24px rgba(6, 182, 212, 0.4)',
              }}>
              🎮 학생 입장하기
            </button>
          </Link>
        </div>

        <p className="text-white/20 text-sm">초등학교 6학년 교실용 · 교육 목적</p>
      </div>
    </main>
  );
}
