'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebaseClient';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { Room, Player, PublicPlayer, GameLog, GamePhase } from '@/types/game';
import PhaseBanner from '@/components/PhaseBanner';
import GameCodeDisplay from '@/components/GameCodeDisplay';
import PageBackground, { getPhaseBackground } from '@/components/PageBackground';
import Timer from '@/components/Timer';

const roleLabels: Record<string, string> = {
  mafia: '🎭 마피아',
  police: '🔍 경찰',
  doctor: '⚕️ 의사',
  citizen: '👤 시민',
};

const roleColors: Record<string, string> = {
  mafia: 'bg-red-500/20 border-red-400 text-red-200',
  police: 'bg-blue-500/20 border-blue-400 text-blue-200',
  doctor: 'bg-green-500/20 border-green-400 text-green-200',
  citizen: 'bg-slate-500/20 border-slate-400 text-slate-200',
};

const phaseProgressInfo: Record<GamePhase, { label: string; description: string; nextAction: string }> = {
  waiting: {
    label: '학생 입장 대기',
    description: '학생들이 게임 코드로 입장하는 단계입니다.',
    nextAction: '인원이 모이면 게임 시작을 누르세요.',
  },
  roleReveal: {
    label: '역할 확인',
    description: '학생들이 자신의 역할과 팀 정보를 확인하는 단계입니다.',
    nextAction: '모두 확인한 뒤 첫날 밤으로 넘기세요.',
  },
  night: {
    label: '밤 행동',
    description: '역할별 밤 행동이 진행되는 단계입니다.',
    nextAction: '행동 제출이 끝나면 밤 결과로 넘기세요.',
  },
  nightResult: {
    label: '밤 결과 발표',
    description: '밤 사이 일어난 결과를 확인하는 단계입니다.',
    nextAction: '결과 확인 후 낮 토론으로 넘기세요.',
  },
  dayDiscussion: {
    label: '낮 토론',
    description: '학생들이 마피아를 찾기 위해 토론하는 단계입니다.',
    nextAction: '시간이 끝나면 투표 단계로 넘기세요.',
  },
  voting: {
    label: '투표',
    description: '학생들이 마피아라고 생각하는 사람에게 투표하는 단계입니다.',
    nextAction: '투표 시간이 끝나면 결과를 진행하세요.',
  },
  finalDefense: {
    label: '최후변론',
    description: '최다 득표자가 마지막으로 변론하는 단계입니다.',
    nextAction: '시간이 끝나면 최종 투표로 넘기세요.',
  },
  finalVote: {
    label: '최종 투표',
    description: '추방할지 살릴지 최종 결정하는 단계입니다.',
    nextAction: '투표 시간이 끝나면 최종 결과를 발표하세요.',
  },
  voteResult: {
    label: '투표 결과',
    description: '투표 결과와 추방 여부를 확인하는 단계입니다.',
    nextAction: '결과 확인 후 다음 밤으로 넘기세요.',
  },
  ended: {
    label: '게임 종료',
    description: '승리 팀이 결정되어 게임이 끝난 상태입니다.',
    nextAction: '다음 게임은 메인화면에서 새로 시작하세요.',
  },
};

const phaseFlow: GamePhase[] = [
  'roleReveal',
  'night',
  'nightResult',
  'dayDiscussion',
  'voting',
  'finalDefense',
  'finalVote',
  'voteResult',
  'ended',
];

function getPhaseDuration(room: Room): number | null {
  if (room.currentPhase === 'dayDiscussion') return room.settings.discussionTime;
  if (room.currentPhase === 'voting') return room.settings.voteTime;
  if (room.currentPhase === 'finalDefense') return room.settings.finalDefenseTime;
  if (room.currentPhase === 'finalVote') return room.settings.finalVoteTime;
  return null;
}

function TeacherProgressPanel({ room }: { room: Room }) {
  const phaseInfo = phaseProgressInfo[room.currentPhase];
  const durationSeconds = getPhaseDuration(room);

  return (
    <div className="game-card bg-black/45 border-cyan-400/30 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-3">
          <p className="text-white/45 text-xs font-black tracking-widest uppercase">진행 현황</p>
          <div className="flex flex-wrap items-center gap-3">
            <PhaseBanner phase={room.currentPhase} dayNumber={room.dayNumber} />
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/70">
              {room.dayNumber}일차
            </span>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{phaseInfo.label}</h2>
            <p className="mt-1 text-white/65 text-lg">{phaseInfo.description}</p>
          </div>
          <p className="rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-amber-100 font-bold">
            {phaseInfo.nextAction}
          </p>
        </div>

        <div className="lg:w-80">
          {durationSeconds ? (
            <Timer durationSeconds={durationSeconds} phaseStartedAt={room.phaseStartedAt} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center space-y-2">
              <p className="text-white/50 font-bold text-sm tracking-widest uppercase">남은 시간</p>
              <div className="text-3xl font-black text-white/80">교사 진행</div>
              <p className="text-white/50 text-sm">이 단계는 시간 제한 없이 교사가 넘깁니다.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {phaseFlow.map((phase) => {
          const active = phase === room.currentPhase;
          return (
            <span
              key={phase}
              className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
                active
                  ? 'border-cyan-300 bg-cyan-400/25 text-cyan-100'
                  : 'border-white/10 bg-white/5 text-white/45'
              }`}
            >
              {phaseProgressInfo[phase].label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
function TeacherAmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(45);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAmbient = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume / 100;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('ambient audio play failed:', error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  return (
    <div className="game-card bg-black/40 border-amber-500/30 space-y-4">
      <audio
        ref={audioRef}
        src="/audio/dark-ambient-soundscape.mp3"
        loop
        preload="auto"
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">🎧 분위기 배경음악</h2>
          <p className="text-white/50 text-sm">어두운 앰비언트 사운드스케이프를 반복 재생합니다.</p>
        </div>
        <button
          type="button"
          onClick={toggleAmbient}
          className={isPlaying ? 'btn-secondary md:w-32' : 'btn-primary md:w-32'}
        >
          {isPlaying ? '끄기' : '켜기'}
        </button>
      </div>

      <label className="block space-y-2">
        <div className="flex items-center justify-between text-sm font-bold text-white/70">
          <span>음량</span>
          <span>{volume}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-amber-500"
          aria-label="배경음악 음량"
        />
      </label>
    </div>
  );
}
export default function TeacherRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [publicPlayers, setPublicPlayers] = useState<PublicPlayer[]>([]);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const unsubRoom = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() } as Room);
      }
    });

    const playersRef = collection(db, 'rooms', roomId, 'publicPlayers');
    const unsubPublic = onSnapshot(playersRef, (snap) => {
      setPublicPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PublicPlayer)));
    });

    const logsRef = query(
      collection(db, 'rooms', roomId, 'logs'),
      orderBy('createdAt', 'desc')
    );
    const unsubLogs = onSnapshot(logsRef, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GameLog)));
    });

    return () => {
      unsubRoom();
      unsubPublic();
      unsubLogs();
    };
  }, [roomId]);

  const handleStartGame = async () => {
    setLoading(true);
    try {
      await fetch('/api/start-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPhase = async () => {
    setLoading(true);
    try {
      await fetch('/api/next-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleForceEnd = async () => {
    setLoading(true);
    try {
      await fetch('/api/next-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, forceEnd: true }),
      });
      setConfirmEnd(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-2xl animate-pulse">불러오는 중...</div>
      </div>
    );
  }

  const alivePlayers = publicPlayers.filter((p) => p.isAlive);
  const deadPlayers = publicPlayers.filter((p) => !p.isAlive);
  const canStartGame = publicPlayers.length >= 4 && !loading;
  const nextPhaseButtonLabel = room.currentPhase === 'roleReveal' ? '🌙 첫날 밤 시작' : '⏭️ 다음 단계';

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ position: 'relative', zIndex: 1 }}>
      <PageBackground
        image={getPhaseBackground(room.currentPhase, room.winner)}
        overlay={room.currentPhase === 'night' ? 'darker' : 'dark'}
      />
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-amber-400">👩‍🏫 교사 화면</h1>
            <p className="text-white/60 text-lg">{room.roomName}</p>
          </div>
          <PhaseBanner phase={room.currentPhase} dayNumber={room.dayNumber} />
        </div>

        {/* Game Code - very large for projector */}
        <GameCodeDisplay gameCode={room.gameCode} />

        <TeacherProgressPanel room={room} />

        <TeacherAmbientAudio />

        {room.currentPhase === 'waiting' && (
          <div className="game-card bg-green-500/20 border-green-400 text-center space-y-4">
            <p className="text-2xl font-black text-white">학생 입장이 끝나면 바로 시작할 수 있습니다</p>
            <button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className="btn-success w-full text-2xl py-5"
            >
              {loading ? '처리 중...' : '🎮 게임 시작'}
            </button>
          </div>
        )}

        {/* Final Defense Banner */}
        {(room.currentPhase === 'finalDefense' || room.currentPhase === 'finalVote') && room.finalDefenseTargetNickname && (
          <div className="game-card bg-purple-500/20 border-purple-400 text-center py-4">
            <p className="text-lg text-purple-300 font-bold">
              {room.currentPhase === 'finalDefense' ? '🎤 최후변론 중' : '⚖️ 최종 투표 중'}
            </p>
            <p className="text-3xl font-black text-white mt-1">{room.finalDefenseTargetNickname}</p>
          </div>
        )}

        {/* Result Message */}
        {room.lastResultMessage && (
          <div className="game-card bg-amber-500/20 border-amber-400 text-center py-6">
            <p className="text-2xl font-bold text-amber-200">{room.lastResultMessage}</p>
          </div>
        )}

        {/* Winner */}
        {room.winner && (
          <div
            className={`game-card text-center py-8 ${
              room.winner === 'citizen'
                ? 'bg-blue-500/20 border-blue-400'
                : 'bg-red-500/20 border-red-400'
            }`}
          >
            <div className="text-6xl mb-3">{room.winner === 'citizen' ? '🏆' : '🎭'}</div>
            <h2 className="text-4xl font-black text-white">
              {room.winner === 'citizen' ? '시민팀 승리!' : '마피아팀 승리!'}
            </h2>
            <a href="/" className="block mt-6">
              <button className="btn-primary w-full md:w-auto md:px-10">
                🏠 메인화면으로 돌아가기
              </button>
            </a>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Player list */}
          <div className="game-card">
            <h2 className="text-xl font-bold text-white mb-4">
              참여자 목록 ({publicPlayers.length}명)
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {publicPlayers.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    p.isAlive
                      ? 'bg-white/5 border-white/20'
                      : 'bg-black/30 border-white/10 opacity-50'
                  }`}
                >
                  <span className="font-bold text-lg">
                    {p.isAlive ? '✅' : '💀'} {p.nickname}
                  </span>
                </div>
              ))}
              {publicPlayers.length === 0 && (
                <p className="text-white/40 text-center py-4">아직 참여자가 없습니다</p>
              )}
            </div>
          </div>

          {/* Game logs */}
          <div className="game-card">
            <h2 className="text-xl font-bold text-white mb-4">게임 로그</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="text-sm text-white/70 p-2 border-b border-white/10">
                  {log.message}
                </div>
              ))}
              {logs.length === 0 && (
                <p className="text-white/40 text-center py-4">로그가 없습니다</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="game-card text-center">
            <div className="text-3xl font-black text-white">{publicPlayers.length}</div>
            <div className="text-white/60">전체 인원</div>
          </div>
          <div className="game-card text-center">
            <div className="text-3xl font-black text-green-400">{alivePlayers.length}</div>
            <div className="text-white/60">생존</div>
          </div>
          <div className="game-card text-center">
            <div className="text-3xl font-black text-red-400">{deadPlayers.length}</div>
            <div className="text-white/60">탈락</div>
          </div>
        </div>

        {/* Control buttons */}
        <div className="game-card space-y-4">
          <h2 className="text-xl font-bold text-white">게임 제어</h2>

          {room.currentPhase === 'waiting' && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className="btn-success w-full"
            >
              {loading ? '처리 중...' : '🎮 게임 시작'}
            </button>
          )}

          {room.currentPhase !== 'waiting' && room.currentPhase !== 'ended' && (
            <button
              onClick={handleNextPhase}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? '처리 중...' : nextPhaseButtonLabel}
            </button>
          )}

          {room.currentPhase !== 'ended' && (
            <>
              {!confirmEnd ? (
                <button
                  onClick={() => setConfirmEnd(true)}
                  className="btn-danger w-full"
                >
                  🛑 게임 강제 종료
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-300 text-center font-bold">정말 게임을 종료하시겠습니까?</p>
                  <div className="flex gap-3">
                    <button onClick={handleForceEnd} className="btn-danger flex-1">
                      예, 종료합니다
                    </button>
                    <button
                      onClick={() => setConfirmEnd(false)}
                      className="btn-secondary flex-1"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {publicPlayers.length < 4 && room.currentPhase === 'waiting' && (
            <p className="text-amber-400 text-center font-bold">
              ⚠️ 게임을 시작하려면 최소 4명이 필요합니다
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
