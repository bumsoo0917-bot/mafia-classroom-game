'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecommendedRoles } from '@/lib/gameLogic';
import { TieRule } from '@/types/game';
import PageBackground from '@/components/PageBackground';

export default function CreateRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [mafiaCount, setMafiaCount] = useState(2);
  const [policeCount, setPoliceCount] = useState(1);
  const [doctorCount, setDoctorCount] = useState(1);
  const [discussionTime, setDiscussionTime] = useState(180);
  const [voteTime, setVoteTime] = useState(60);
  const [finalDefenseTime, setFinalDefenseTime] = useState(60);
  const [finalVoteTime, setFinalVoteTime] = useState(30);
  const [revealRoleOnDeath, setRevealRoleOnDeath] = useState(true);
  const [tieRule, setTieRule] = useState<TieRule>('noElimination');

  const citizenCount = Math.max(0, maxPlayers - mafiaCount - policeCount - doctorCount);

  useEffect(() => {
    const recommended = getRecommendedRoles(maxPlayers);
    setMafiaCount(recommended.mafia);
    setPoliceCount(recommended.police);
    setDoctorCount(recommended.doctor);
  }, []);

  const applyRecommended = () => {
    const recommended = getRecommendedRoles(maxPlayers);
    setMafiaCount(recommended.mafia);
    setPoliceCount(recommended.police);
    setDoctorCount(recommended.doctor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mafiaCount + policeCount + doctorCount > maxPlayers) {
      setError('역할 수의 합이 최대 인원을 초과합니다.');
      return;
    }

    if (mafiaCount < 1) {
      setError('마피아는 최소 1명이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          maxPlayers,
          settings: {
            mafiaCount,
            policeCount,
            doctorCount,
            discussionTime,
            voteTime,
            finalDefenseTime,
            finalVoteTime,
            revealRoleOnDeath,
            tieRule,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/teacher/room/${data.roomId}`);
      } else {
        const data = await res.json();
        setError(data.error ?? '방 생성에 실패했습니다.');
      }
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-10" style={{ position: 'relative', zIndex: 1 }}>
      <PageBackground image="waiting-bg.webp" overlay="darker" />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>게임 방 만들기</h1>
          <p className="text-white/50 mt-2 text-base">게임 설정을 구성하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 설정 */}
          <div className="game-card space-y-5">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>기본 설정</h2>

            <div>
              <label className="block text-white/80 font-bold mb-2">방 이름</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="예) 6학년 1반 마피아"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-2">최대 인원</label>
              <input
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                min={4}
                max={30}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* 역할 설정 */}
          <div className="game-card space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>역할 설정</h2>
              <button
                type="button"
                onClick={applyRecommended}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all"
              >
                ✨ 추천 역할 적용
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-red-300 font-bold mb-2">🎭 마피아</label>
                <input
                  type="number"
                  value={mafiaCount}
                  onChange={(e) => setMafiaCount(Number(e.target.value))}
                  min={1}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-blue-300 font-bold mb-2">🔍 경찰</label>
                <input
                  type="number"
                  value={policeCount}
                  onChange={(e) => setPoliceCount(Number(e.target.value))}
                  min={0}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-green-300 font-bold mb-2">⚕️ 의사</label>
                <input
                  type="number"
                  value={doctorCount}
                  onChange={(e) => setDoctorCount(Number(e.target.value))}
                  min={0}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-2">👤 시민</label>
                <div className="input-field opacity-60 cursor-not-allowed bg-white/5">
                  {citizenCount}명 (자동 계산)
                </div>
              </div>
            </div>

            {citizenCount < 0 && (
              <p className="text-red-400 font-bold">⚠️ 역할 수의 합이 최대 인원을 초과합니다!</p>
            )}
          </div>

          {/* 시간 설정 */}
          <div className="game-card space-y-5">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>시간 설정</h2>

            <div>
              <label className="block text-white/80 font-bold mb-2">
                낮 토론 시간 ({discussionTime}초)
              </label>
              <input
                type="range"
                value={discussionTime}
                onChange={(e) => setDiscussionTime(Number(e.target.value))}
                min={60}
                max={600}
                step={30}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-sm text-white/40 mt-1">
                <span>1분</span>
                <span>5분</span>
                <span>10분</span>
              </div>
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-2">
                투표 시간 ({voteTime}초)
              </label>
              <input
                type="range"
                value={voteTime}
                onChange={(e) => setVoteTime(Number(e.target.value))}
                min={30}
                max={180}
                step={15}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-sm text-white/40 mt-1">
                <span>30초</span>
                <span>1분 30초</span>
                <span>3분</span>
              </div>
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-2">
                최후변론 시간 ({finalDefenseTime}초)
              </label>
              <input
                type="range"
                value={finalDefenseTime}
                onChange={(e) => setFinalDefenseTime(Number(e.target.value))}
                min={15}
                max={120}
                step={15}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-sm text-white/40 mt-1">
                <span>15초</span>
                <span>1분</span>
                <span>2분</span>
              </div>
            </div>

            <div>
              <label className="block text-white/80 font-bold mb-2">
                최종 투표 시간 ({finalVoteTime}초)
              </label>
              <input
                type="range"
                value={finalVoteTime}
                onChange={(e) => setFinalVoteTime(Number(e.target.value))}
                min={15}
                max={90}
                step={15}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between text-sm text-white/40 mt-1">
                <span>15초</span>
                <span>45초</span>
                <span>1분 30초</span>
              </div>
            </div>
          </div>

          {/* 규칙 설정 */}
          <div className="game-card space-y-5">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: '"Black Han Sans", sans-serif' }}>규칙 설정</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">탈락 시 역할 공개</p>
                <p className="text-white/50 text-sm">탈락자의 역할을 모두에게 공개합니다</p>
              </div>
              <button
                type="button"
                onClick={() => setRevealRoleOnDeath(!revealRoleOnDeath)}
                className={`w-14 h-7 rounded-full transition-all duration-300 ${revealRoleOnDeath ? 'bg-indigo-500' : 'bg-white/20'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full mx-1 transition-all duration-300 ${revealRoleOnDeath ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            <div>
              <p className="text-white font-bold mb-3">동률 처리 방식</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTieRule('noElimination')}
                  className={`flex-1 py-3 rounded-xl font-bold border transition-all ${tieRule === 'noElimination' ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200' : 'bg-white/5 border-white/20 text-white/50'}`}
                >
                  아무도 탈락 없음
                </button>
                <button
                  type="button"
                  onClick={() => setTieRule('revote')}
                  className={`flex-1 py-3 rounded-xl font-bold border transition-all ${tieRule === 'revote' ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200' : 'bg-white/5 border-white/20 text-white/50'}`}
                >
                  재투표
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-xl p-4 text-red-300 text-center font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || citizenCount < 0 || !roomName.trim()}
            className="btn-success w-full text-2xl py-5"
            style={{ fontFamily: '"Black Han Sans", sans-serif' }}
          >
            {loading ? '생성 중...' : '🎮 방 만들기'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-white/40 hover:text-white/70 transition-colors">← 메인으로</a>
        </div>
      </div>
    </main>
  );
}
