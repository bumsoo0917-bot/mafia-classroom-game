import Link from 'next/link';
import PageBackground from '@/components/PageBackground';
import { IconSearch, IconShield, IconHeart, IconUsers, IconChevronRight } from '@/components/Icons';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <PageBackground image="main-bg.webp" overlay="dark" />

      {/* 諛곌꼍 ?μ떇 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-900/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full text-center space-y-8 relative z-10">

        {/* 濡쒓퀬 */}
        <div className="space-y-4">
          <div className="text-8xl animate-float drop-shadow-2xl">?빑截?/div>
          <div>
            <h1
              className="text-6xl md:text-7xl text-white leading-tight tracking-tight"
              style={{ fontFamily: '"Black Han Sans", sans-serif', textShadow: '0 0 40px rgba(167,139,250,0.5)' }}
            >
              援먯떎 留덊뵾??            </h1>
            <h2
              className="text-3xl md:text-4xl mt-1"
              style={{
                fontFamily: '"Black Han Sans", sans-serif',
                background: 'linear-gradient(90deg, #a78bfa, #f472b6, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              異붾━ 寃뚯엫
            </h2>
          </div>
          <p className="text-white/40 text-base tracking-widest uppercase font-medium">
            ?? 留덉쓣???⑥뼱??留덊뵾?꾨? 李얠븘????
          </p>
        </div>

        {/* ??븷 移대뱶 */}
        <div className="game-card">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-4 font-bold">?깆옣 ?몃Ъ</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-900/20 border border-red-500/20">
              <IconSword className="text-red-400 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-red-400 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>留덊뵾??/div>
                <div className="text-white/40 text-xs">諛ㅼ뿉 ?쒕????덈씫</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
              <IconSearch className="text-blue-400 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-blue-400 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>寃쎌같</div>
                <div className="text-white/40 text-xs">?뺤껜瑜?議곗궗</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-900/20 border border-green-500/20">
              <IconHeart className="text-green-400 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-green-400 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>?섏궗</div>
                <div className="text-white/40 text-xs">?쒕???蹂댄샇</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-500/20">
              <IconUsers className="text-slate-300 flex-shrink-0" size={28} />
              <div className="text-left">
                <div className="text-slate-300 text-lg" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>?쒕?</div>
                <div className="text-white/40 text-xs">留덊뵾?꾨? 李얠븘??/div>
              </div>
            </div>
          </div>
        </div>

        {/* 踰꾪듉 */}
        <div className="space-y-4">
          <Link href="/teacher/login" className="block">
            <button
              className="w-full flex items-center justify-center gap-3 font-black py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
              style={{
                fontFamily: '"Black Han Sans", sans-serif',
                background: 'linear-gradient(135deg, #b45309, #f59e0b)',
                boxShadow: '0 4px 28px rgba(217,119,6,0.45)',
              }}
            >
              <IconShield size={28} />
              援먯궗???쒖옉?섍린
              <IconChevronRight size={22} />
            </button>
          </Link>
          <Link href="/join" className="block">
            <button
              className="w-full flex items-center justify-center gap-3 font-black py-5 px-8 rounded-2xl text-2xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
              style={{
                fontFamily: '"Black Han Sans", sans-serif',
                background: 'linear-gradient(135deg, #0e7490, #06b6d4)',
                boxShadow: '0 4px 28px rgba(6,182,212,0.4)',
              }}
            >
              <IconSearch size={28} />
              ?숈깮 ?낆옣?섍린
              <IconChevronRight size={22} />
            </button>
          </Link>
        </div>

        <p className="text-white/20 text-xs tracking-widest">珥덈벑?숆탳 6?숇뀈 援먯떎??쨌 援먯쑁 紐⑹쟻</p>
      </div>
    </main>
  );
}

// 留덊뵾??移??꾩씠肄?(Icons.tsx???녿뒗 寃??몃씪?몄쑝濡?
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

