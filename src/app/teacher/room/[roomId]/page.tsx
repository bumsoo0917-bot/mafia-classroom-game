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
import { Room, Player, PublicPlayer, GameLog } from '@/types/game';
import PhaseBanner from '@/components/PhaseBanner';
import GameCodeDisplay from '@/components/GameCodeDisplay';
import PageBackground, { getPhaseBackground } from '@/components/PageBackground';

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
type AmbientAudioNodes = {
  context: AudioContext;
  masterGain: GainNode;
  sources: AudioScheduledSourceNode[];
  intervalId: number;
};

function TeacherAmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(45);
  const nodesRef = useRef<AmbientAudioNodes | null>(null);

  const stopAmbient = () => {
    const nodes = nodesRef.current;
    if (!nodes) return;

    window.clearInterval(nodes.intervalId);
    nodes.masterGain.gain.setTargetAtTime(0, nodes.context.currentTime, 0.08);
    for (const source of nodes.sources) {
      try {
        source.stop(nodes.context.currentTime + 0.15);
      } catch {
        // Source may already be stopped by the browser.
      }
    }
    window.setTimeout(() => {
      void nodes.context.close();
    }, 250);
    nodesRef.current = null;
  };

  const startAmbient = async () => {
    if (nodesRef.current) return;

    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    await context.resume();

    const masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);

    const lowPass = context.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 520;
    lowPass.Q.value = 0.9;
    lowPass.connect(masterGain);

    const droneGain = context.createGain();
    droneGain.gain.value = 0.13;
    droneGain.connect(lowPass);

    const pulseGain = context.createGain();
    pulseGain.gain.value = 0.022;
    pulseGain.connect(lowPass);

    const lfoGain = context.createGain();
    lfoGain.gain.value = 0.018;
    lfoGain.connect(pulseGain.gain);

    const sources: AudioScheduledSourceNode[] = [];
    const createTone = (frequency: number, type: OscillatorType, destination: AudioNode, detune = 0) => {
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      oscillator.connect(destination);
      oscillator.start();
      sources.push(oscillator);
    };

    createTone(55, 'sine', droneGain, -6);
    createTone(82.41, 'triangle', droneGain, 4);
    createTone(146.83, 'sawtooth', pulseGain, -12);

    const lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.42;
    lfo.connect(lfoGain);
    lfo.start();
    sources.push(lfo);

    const intervalId = window.setInterval(() => {
      const now = context.currentTime;
      lowPass.frequency.cancelScheduledValues(now);
      lowPass.frequency.setValueAtTime(lowPass.frequency.value, now);
      lowPass.frequency.linearRampToValueAtTime(420 + Math.random() * 180, now + 2.5);
    }, 3000);

    masterGain.gain.setTargetAtTime((volume / 100) * 0.18, context.currentTime, 0.08);
    nodesRef.current = { context, masterGain, sources, intervalId };
  };

  const toggleAmbient = async () => {
    if (isPlaying) {
      stopAmbient();
      setIsPlaying(false);
      return;
    }

    await startAmbient();
    setIsPlaying(true);
  };

  useEffect(() => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    nodes.masterGain.gain.setTargetAtTime((volume / 100) * 0.18, nodes.context.currentTime, 0.05);
  }, [volume]);

  useEffect(() => {
    return () => stopAmbient();
  }, []);

  return (
    <div className="game-card bg-black/40 border-amber-500/30 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">🎧 분위기 배경음악</h2>
          <p className="text-white/50 text-sm">마피아 게임에 어울리는 어두운 긴장감을 재생합니다.</p>
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
