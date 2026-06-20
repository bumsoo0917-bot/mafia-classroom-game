'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { signInAnonymously } from 'firebase/auth';
import PageBackground from '@/components/PageBackground';

export default function JoinPage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      const res = await fetch('/api/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameCode, nickname, uid }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/student/room/${data.roomId}`);
      } else {
        setError(data.error ?? '입장에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8" style={{ position: 'relative', zIndex: 1 }}>
      <PageBackground image="waiting-bg.webp" overlay="darker" />
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>게임 입장</h1>
          <p className="text-white/50 mt-2 text-base">게임 코드와 닉네임을 입력하세요</p>
        </div>

        <form onSubmit={handleJoin} className="game-card space-y-6">
          <div>
            <label className="block text-white/80 font-bold mb-2 text-lg">게임 코드</label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6자리 숫자 입력"
              className="input-field text-center text-3xl font-black tracking-widest"
              maxLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-white/80 font-bold mb-2 text-lg">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 10))}
              placeholder="닉네임 입력 (최대 10자)"
              className="input-field"
              maxLength={10}
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-xl p-4 text-red-300 text-center font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || gameCode.length !== 6 || !nickname.trim()}
            className="btn-primary w-full bg-cyan-600 hover:bg-cyan-500"
          >
            {loading ? '입장 중...' : '🚀 입장하기'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-white/40 hover:text-white/70 transition-colors">← 메인으로</a>
        </div>
      </div>
    </main>
  );
}
