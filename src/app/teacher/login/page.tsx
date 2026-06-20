'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBackground from '@/components/PageBackground';

export default function TeacherLoginPage() {
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/teacher-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminCode }),
      });

      if (res.ok) {
        router.push('/teacher/create');
      } else {
        setError('관리자 코드가 올바르지 않습니다.');
      }
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <PageBackground image="main-bg.webp" overlay="darker" />
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">👩‍🏫</div>
          <h1 className="text-4xl text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>교사 로그인</h1>
          <p className="text-white/50 mt-2 text-base">관리자 코드를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="game-card space-y-6">
          <div>
            <label className="block text-white/80 font-bold mb-2 text-lg">관리자 코드</label>
            <input
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="관리자 코드 입력"
              className="input-field"
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
            disabled={loading || !adminCode}
            className="btn-primary w-full"
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-white/40 hover:text-white/70 transition-colors">← 메인으로</a>
        </div>
      </div>
    </main>
  );
}
