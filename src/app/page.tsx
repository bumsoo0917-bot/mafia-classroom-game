import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <div className="text-7xl mb-4">🔍 🎭 🃏</div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
            교실 마피아
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              추리 게임
            </span>
          </h1>
          <p className="text-xl text-white/70 font-medium">
            초등학교 6학년 교실용 탐정·추리 게임
          </p>
        </div>

        {/* Game description */}
        <div className="game-card space-y-3 text-left">
          <h2 className="text-xl font-bold text-white/90 text-center">게임 소개</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-2xl">🎭</span>
              <div>
                <div className="font-bold text-red-300">마피아</div>
                <div className="text-white/60">밤에 시민을 탈락</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">🔍</span>
              <div>
                <div className="font-bold text-blue-300">경찰</div>
                <div className="text-white/60">정체를 조사</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">⚕️</span>
              <div>
                <div className="font-bold text-green-300">의사</div>
                <div className="text-white/60">시민을 보호</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-2xl">👤</span>
              <div>
                <div className="font-bold text-slate-300">시민</div>
                <div className="text-white/60">마피아를 찾아라!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <Link href="/teacher/login" className="block">
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30">
              👩‍🏫 교사용 시작하기
            </button>
          </Link>
          <Link href="/join" className="block">
            <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30">
              🎮 학생 입장하기
            </button>
          </Link>
        </div>

        <p className="text-white/30 text-sm">
          이 게임은 교육적 목적으로 제작되었습니다
        </p>
      </div>
    </main>
  );
}
