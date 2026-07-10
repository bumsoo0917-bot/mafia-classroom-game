'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db, auth } from '@/lib/firebaseClient';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { Room, Player, PublicPlayer } from '@/types/game';
import PhaseBanner from '@/components/PhaseBanner';
import NarratorMessage from '@/components/NarratorMessage';
import Timer from '@/components/Timer';
import PageBackground, { getPhaseBackground } from '@/components/PageBackground';

const roleInfo: Record<string, { label: string; emoji: string; colorClass: string; description: string }> = {
  mafia: {
    label: '마피아',
    emoji: '🎭',
    colorClass: 'bg-red-500/30 border-red-400 text-red-200',
    description: '밤에 시민을 탈락시키세요. 시민보다 수가 많아지면 승리합니다.',
  },
  police: {
    label: '경찰',
    emoji: '🔍',
    colorClass: 'bg-blue-500/30 border-blue-400 text-blue-200',
    description: '밤에 한 명의 정체를 조사할 수 있습니다.',
  },
  doctor: {
    label: '의사',
    emoji: '⚕️',
    colorClass: 'bg-green-500/30 border-green-400 text-green-200',
    description: '밤에 한 명을 마피아의 공격에서 보호할 수 있습니다.',
  },
  citizen: {
    label: '시민',
    emoji: '👤',
    colorClass: 'bg-slate-500/30 border-slate-400 text-slate-200',
    description: '낮 토론과 투표로 마피아를 찾아내세요.',
  },
};

export default function StudentRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [publicPlayers, setPublicPlayers] = useState<PublicPlayer[]>([]);
  const [hasSubmittedAction, setHasSubmittedAction] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasFinalVoted, setHasFinalVoted] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [hasSeenFirstNightStory, setHasSeenFirstNightStory] = useState(false);

  const uid = auth.currentUser?.uid ?? '';

  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const unsubRoom = onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() } as Room);
      }
    });

    const publicRef = collection(db, 'rooms', roomId, 'publicPlayers');
    const unsubPublic = onSnapshot(publicRef, (snap) => {
      setPublicPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PublicPlayer)));
    });

    return () => {
      unsubRoom();
      unsubPublic();
    };
  }, [roomId]);

  useEffect(() => {
    if (!uid) return;
    const playerRef = doc(db, 'rooms', roomId, 'players', uid);
    const unsub = onSnapshot(playerRef, (snap) => {
      if (snap.exists()) {
        setMyPlayer({ id: snap.id, ...snap.data() } as Player);
      }
    });
    return unsub;
  }, [roomId, uid]);

  // Reset submission state on phase change
  useEffect(() => {
    setHasSubmittedAction(false);
    setHasVoted(false);
    setHasFinalVoted(false);
    setSelectedTarget(null);
    setActionError('');
    setHasSeenFirstNightStory(false);
  }, [room?.currentPhase, room?.dayNumber]);

  const submitNightAction = async () => {
    if (!selectedTarget || !myPlayer) return;
    setSubmitting(true);
    setActionError('');

    const actionType =
      myPlayer.role === 'mafia'
        ? 'mafiaKill'
        : myPlayer.role === 'police'
        ? 'policeCheck'
        : 'doctorSave';

    try {
      const res = await fetch('/api/submit-night-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          playerId: uid,
          actionType,
          targetPlayerId: selectedTarget,
        }),
      });

      if (res.ok) {
        setHasSubmittedAction(true);
      } else {
        const data = await res.json();
        setActionError(data.error ?? '제출에 실패했습니다.');
      }
    } catch {
      setActionError('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitVote = async () => {
    if (!selectedTarget || !myPlayer) return;
    setSubmitting(true);
    setActionError('');

    try {
      const res = await fetch('/api/submit-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          voterId: uid,
          targetPlayerId: selectedTarget,
        }),
      });

      if (res.ok) {
        setHasVoted(true);
      } else {
        const data = await res.json();
        setActionError(data.error ?? '투표에 실패했습니다.');
      }
    } catch {
      setActionError('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitFinalVote = async (vote: 'eliminate' | 'save') => {
    if (!myPlayer) return;
    setSubmitting(true);
    setActionError('');
    try {
      const res = await fetch('/api/submit-final-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, voterId: uid, vote }),
      });
      if (res.ok) {
        setHasFinalVoted(true);
      } else {
        const data = await res.json();
        setActionError(data.error ?? '투표에 실패했습니다.');
      }
    } catch {
      setActionError('오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-2xl animate-pulse">불러오는 중...</div>
      </div>
    );
  }

  const isAlive = myPlayer?.isAlive ?? true;
  const alivePlayers = publicPlayers.filter((p) => p.isAlive);
  const isFirstNight = room.currentPhase === 'night' && room.dayNumber === 1;
  const showFirstNightStory = isFirstNight && !hasSeenFirstNightStory;
  const firstNightMessage = myPlayer?.role === 'mafia'
    ? '오늘 밤은 공격하지 않습니다. 정체를 숨기고 기다리세요.'
    : myPlayer?.role === 'police'
    ? '오늘 밤은 조사하지 않습니다. 첫 회의 전까지 단서를 기다리세요.'
    : myPlayer?.role === 'doctor'
    ? '오늘 밤은 보호하지 않습니다. 첫 회의 전까지 상황을 지켜보세요.'
    : '조용히 밤을 보내고, 내일 회의에서 단서를 찾아보세요.';
  const policeResultCard = myPlayer?.role === 'police' && myPlayer.policeLastResult ? (
    <div className="game-card bg-blue-500/20 border-blue-400 text-center space-y-3">
      <div className="text-5xl">🔍</div>
      <p className="text-blue-200 font-bold text-lg">조사 결과</p>
      <p className="text-white text-2xl font-black">{myPlayer.policeLastResult}</p>
      <p className="text-white/50">이 결과는 경찰에게만 보입니다.</p>
    </div>
  ) : null;

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto space-y-6" style={{ position: 'relative', zIndex: 1 }}>
      <PageBackground
        image={getPhaseBackground(room.currentPhase, room.winner)}
        overlay={room.currentPhase === 'night' ? 'darker' : 'dark'}
      />
      {showFirstNightStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl game-card bg-amber-500/20 border-2 border-amber-400 text-center space-y-6 animate-pulse-glow">
            <p
              className="text-4xl md:text-5xl text-amber-100 text-glow-white"
              style={{ fontFamily: '"Song Myung", serif', letterSpacing: 0 }}
            >
              밤이 내려앉았습니다.
            </p>
            <div
              className="space-y-5 text-xl md:text-2xl text-white/85 leading-relaxed text-balance"
              style={{ fontFamily: '"Song Myung", serif', letterSpacing: 0 }}
            >
              <p>
                평화롭던 {room.roomName} 마을에 이상한 소문이 퍼졌습니다.<br />
                우리 중 누군가가 마피아라는 이야기입니다.
              </p>

              <p>
                아직 아무도 서로를 의심할 근거가 없습니다.<br />
                시민들은 불안한 마음으로 밤을 보내고,<br />
                마피아도 정체를 숨긴 채 조용히 상황을 지켜봅니다.
              </p>

              <p>
                날이 밝으면 모두가 한자리에 모여<br />
                누가 마피아인지 첫 회의를 시작합니다.
              </p>

              <p className="text-amber-100 font-bold">
                첫날 밤에는 아무도 행동하지 않습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHasSeenFirstNightStory(true)}
              className="btn-primary w-full text-2xl py-5"
              style={{ fontFamily: '"Black Han Sans", sans-serif', letterSpacing: 0 }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Dead player banner */}
      {myPlayer && !isAlive && (
        <div className="bg-black/50 border border-white/20 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white/50">💀 관전 모드입니다</p>
          <p className="text-white/30">탈락했지만 게임을 계속 관전할 수 있습니다</p>
        </div>
      )}

      {/* Phase banner */}
      <PhaseBanner phase={room.currentPhase} dayNumber={room.dayNumber} />

      {/* My info */}
      {myPlayer && (
        <div className="game-card flex items-center gap-4">
          <div className="text-4xl">{roleInfo[myPlayer.role ?? 'citizen']?.emoji ?? '👤'}</div>
          <div>
            <p className="text-white/60">내 닉네임</p>
            <p className="text-2xl font-black text-white">{myPlayer.nickname}</p>
          </div>
          {myPlayer.role && room.currentPhase !== 'waiting' && (
            <div className={`ml-auto px-4 py-2 rounded-xl border font-bold text-lg ${roleInfo[myPlayer.role].colorClass}`}>
              {roleInfo[myPlayer.role].label}
            </div>
          )}
        </div>
      )}

      {/* Phase-specific content */}

      {/* WAITING */}
      {room.currentPhase === 'waiting' && (
        <div className="game-card text-center space-y-6">
          <div className="text-5xl">⏳</div>
          <p className="text-2xl font-bold text-white">게임 시작을 기다리는 중입니다</p>
          <p className="text-white/60">선생님이 게임을 시작하면 역할이 배정됩니다</p>
          <div className="space-y-2">
            <p className="text-white/60 font-bold">현재 참여자 ({publicPlayers.length}명)</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {publicPlayers.map((p) => (
                <span key={p.id} className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold">
                  {p.nickname}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ROLE REVEAL */}
      {room.currentPhase === 'roleReveal' && myPlayer?.role && (
        <div className="space-y-4">
          <NarratorMessage message="게임이 시작되었습니다. 각자 자신의 역할을 확인하세요. 역할은 다른 친구에게 보여주지 않습니다." />
          <div className={`game-card text-center space-y-4 border-2 ${roleInfo[myPlayer.role].colorClass}`}>
            <div className="text-7xl">{roleInfo[myPlayer.role].emoji}</div>
            <h2 className="text-4xl font-black">나는 {roleInfo[myPlayer.role].label}!</h2>
            <p className="text-lg opacity-80">{roleInfo[myPlayer.role].description}</p>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="font-bold">팀: {myPlayer.team === 'mafia' ? '🎭 마피아팀' : '🏛️ 시민팀'}</p>
            </div>
          </div>


          {myPlayer.role === 'mafia' && myPlayer.mafiaTeamIds && myPlayer.mafiaTeamIds.length > 1 && (
            <div className="game-card bg-red-500/20 border-red-400 space-y-3">
              <p className="font-bold text-red-300 text-lg">🎭 마피아 동료</p>
              {myPlayer.mafiaTeamIds
                .filter((id) => id !== uid)
                .map((id) => {
                  const p = publicPlayers.find((pp) => pp.id === id);
                  return p ? (
                    <div key={id} className="bg-red-500/20 rounded-lg p-3 font-bold text-white">
                      {p.nickname}
                    </div>
                  ) : null;
                })}
            </div>
          )}
        </div>
      )}

      {/* NIGHT */}
      {room.currentPhase === 'night' && myPlayer && (
        <div className="space-y-4">
          <NarratorMessage message="밤이 되었습니다. 모든 플레이어는 조용히 기다려 주세요." />

          {!isAlive ? (
            <div className="game-card text-center">
              <p className="text-2xl text-white/60">💀 탈락자는 행동할 수 없습니다</p>
            </div>
          ) : myPlayer.role === 'citizen' && !isFirstNight ? (
            <div className="game-card text-center space-y-3">
              <div className="text-5xl">🌙</div>
              <p className="text-2xl font-bold text-white">밤입니다</p>
              <p className="text-white/60 text-lg">시민은 조용히 기다려 주세요</p>
            </div>
          ) : isFirstNight ? (
            <div className="game-card text-center space-y-3 bg-red-500/20 border-red-400">
              <div className="text-5xl">🎭</div>
              <p className="text-2xl font-bold text-red-200">첫날 밤에는 행동하지 않습니다</p>
              <p className="text-white/70 text-lg">{firstNightMessage}</p>
            </div>
          ) : hasSubmittedAction ? (
            <div className="game-card text-center space-y-3 bg-green-500/20 border-green-400">
              <div className="text-5xl">✅</div>
              <p className="text-2xl font-bold text-green-300">제출 완료!</p>
              <p className="text-white/60">다른 친구들을 기다리는 중입니다</p>

              {myPlayer.role === 'police' && (
                <p className="text-blue-200">조사 결과는 아침 결과 화면에서 확인할 수 있습니다.</p>
              )}
            </div>
          ) : (
            <div className="game-card space-y-4">
              <h3 className="text-xl font-bold text-white">
                {myPlayer.role === 'mafia' && '🎭 탈락시킬 사람을 선택하세요'}
                {myPlayer.role === 'police' && '🔍 조사할 사람을 선택하세요'}
                {myPlayer.role === 'doctor' && '⚕️ 보호할 사람을 선택하세요'}
              </h3>
              <div className="space-y-2">
                {alivePlayers
                  .filter((p) => {
                    if (myPlayer.role === 'mafia') {
                      return !myPlayer.mafiaTeamIds?.includes(p.id);
                    }
                    if (myPlayer.role === 'police') {
                      return p.id !== uid;
                    }
                    return true;
                  })
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTarget(p.id)}
                      className={`w-full text-left p-4 rounded-xl border font-bold text-lg transition-all ${
                        selectedTarget === p.id
                          ? 'bg-indigo-500/40 border-indigo-400 text-white scale-105'
                          : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {selectedTarget === p.id ? '✅ ' : ''}{p.nickname}
                    </button>
                  ))}
              </div>

              {actionError && (
                <p className="text-red-400 font-bold">{actionError}</p>
              )}

              <button
                onClick={submitNightAction}
                disabled={!selectedTarget || submitting}
                className="btn-primary w-full"
              >
                {submitting ? '제출 중...' : '행동 제출'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* NIGHT RESULT */}
      {room.currentPhase === 'nightResult' && (
        <div className="space-y-4">
          <NarratorMessage message="아침이 되었습니다. 어젯밤의 결과를 확인합니다." />
          {policeResultCard}
          {room.lastResultMessage && (
            <div className="game-card text-center space-y-3 bg-amber-500/20 border-amber-400">
              <div className="text-5xl">🌅</div>
              <p className="text-2xl font-bold text-amber-200">{room.lastResultMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* DAY DISCUSSION */}
      {room.currentPhase === 'dayDiscussion' && (
        <div className="space-y-4">
          <NarratorMessage message="낮 토론 시간입니다. 누가 마피아일지 근거를 들어 이야기해 봅시다." />
          {policeResultCard}

          <Timer
            durationSeconds={room.settings.discussionTime}
            phaseStartedAt={room.phaseStartedAt}
          />

          <div className="game-card space-y-3">
            <h3 className="text-xl font-bold text-white">📋 토론 규칙</h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 친구를 비난하지 않습니다.</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 근거를 들어 말합니다.</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 차례를 지켜 말합니다.</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 역할을 직접 보여주지 않습니다.</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> 탈락자는 조용히 관전합니다.</li>
            </ul>
          </div>

          <div className="game-card">
            <h3 className="font-bold text-white/60 mb-3">생존자 목록</h3>
            <div className="flex flex-wrap gap-2">
              {alivePlayers.map((p) => (
                <span key={p.id} className="bg-white/10 px-3 py-1 rounded-full font-bold">
                  {p.nickname}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VOTING */}
      {room.currentPhase === 'voting' && myPlayer && (
        <div className="space-y-4">
          <NarratorMessage message="투표를 시작합니다. 마피아라고 생각하는 사람을 한 명 선택하세요." />

          <Timer
            durationSeconds={room.settings.voteTime}
            phaseStartedAt={room.phaseStartedAt}
          />

          {!isAlive ? (
            <div className="game-card text-center">
              <p className="text-2xl text-white/60">💀 탈락자는 투표할 수 없습니다</p>
            </div>
          ) : hasVoted ? (
            <div className="game-card text-center space-y-3 bg-green-500/20 border-green-400">
              <div className="text-5xl">🗳️</div>
              <p className="text-2xl font-bold text-green-300">투표 완료!</p>
              <p className="text-white/60">결과를 기다리는 중입니다</p>
            </div>
          ) : (
            <div className="game-card space-y-4">
              <h3 className="text-xl font-bold text-white">🗳️ 마피아를 선택하세요</h3>
              <div className="space-y-2">
                {alivePlayers
                  .filter((p) => p.id !== uid)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedTarget(p.id)}
                      className={`w-full text-left p-4 rounded-xl border font-bold text-lg transition-all ${
                        selectedTarget === p.id
                          ? 'bg-red-500/40 border-red-400 text-white scale-105'
                          : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {selectedTarget === p.id ? '🎯 ' : ''}{p.nickname}
                    </button>
                  ))}
              </div>

              {actionError && (
                <p className="text-red-400 font-bold">{actionError}</p>
              )}

              <button
                onClick={submitVote}
                disabled={!selectedTarget || submitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 px-8 rounded-xl text-xl transition-all disabled:opacity-50"
              >
                {submitting ? '투표 중...' : '투표하기'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* FINAL DEFENSE */}
      {room.currentPhase === 'finalDefense' && (
        <div className="space-y-4">
          {uid === room.finalDefenseTargetId ? (
            <>
              <NarratorMessage message="당신이 최다 득표를 받았습니다. 지금 최후변론을 하세요!" />
              <div className="game-card text-center space-y-4 bg-purple-500/20 border-2 border-purple-400">
                <div className="text-6xl">🎤</div>
                <h2 className="text-3xl font-black text-purple-200">지금 최후변론을 하세요!</h2>
                <p className="text-white/70 text-lg">친구들을 설득해 추방을 막아보세요.</p>
              </div>
            </>
          ) : (
            <>
              <NarratorMessage message={`${room.finalDefenseTargetNickname ?? ''}님이 최후변론 중입니다. 조용히 들어주세요.`} />
              <div className="game-card text-center space-y-4 bg-purple-500/20 border-purple-400">
                <div className="text-6xl">🎤</div>
                <p className="text-xl text-white/70">최후변론 중</p>
                <h2 className="text-3xl font-black text-purple-200">{room.finalDefenseTargetNickname}님</h2>
                <p className="text-white/60">변론이 끝난 후 최종 투표가 진행됩니다.</p>
              </div>
            </>
          )}
          {room.settings?.finalDefenseTime && (
            <Timer durationSeconds={room.settings.finalDefenseTime} phaseStartedAt={room.phaseStartedAt} />
          )}
        </div>
      )}

      {/* FINAL VOTE */}
      {room.currentPhase === 'finalVote' && myPlayer && (
        <div className="space-y-4">
          <NarratorMessage message={`${room.finalDefenseTargetNickname ?? ''}님을 추방할지 최종 투표합니다.`} />

          {room.settings?.finalVoteTime && (
            <Timer durationSeconds={room.settings.finalVoteTime} phaseStartedAt={room.phaseStartedAt} />
          )}

          {!isAlive ? (
            <div className="game-card text-center">
              <p className="text-2xl text-white/60">💀 탈락자는 투표할 수 없습니다</p>
            </div>
          ) : uid === room.finalDefenseTargetId ? (
            <div className="game-card text-center space-y-3 bg-yellow-500/20 border-yellow-400">
              <div className="text-5xl">⚖️</div>
              <p className="text-2xl font-bold text-yellow-200">최후변론 대상자는 투표할 수 없습니다</p>
              <p className="text-white/60">다른 친구들의 투표를 기다려 주세요</p>
            </div>
          ) : hasFinalVoted ? (
            <div className="game-card text-center space-y-3 bg-green-500/20 border-green-400">
              <div className="text-5xl">✅</div>
              <p className="text-2xl font-bold text-green-300">투표 완료!</p>
              <p className="text-white/60">결과를 기다리는 중입니다</p>
            </div>
          ) : (
            <div className="game-card space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-2">⚖️</div>
                <h3 className="text-2xl font-black text-white">
                  <span className="text-red-300">{room.finalDefenseTargetNickname}</span>님을 추방할까요?
                </h3>
              </div>

              {actionError && (
                <p className="text-red-400 font-bold text-center">{actionError}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => submitFinalVote('eliminate')}
                  disabled={submitting}
                  className="py-6 rounded-2xl border-2 font-black text-xl transition-all bg-red-600/40 border-red-400 text-red-200 hover:bg-red-600/60 hover:scale-105 disabled:opacity-50"
                >
                  👊 추방
                </button>
                <button
                  onClick={() => submitFinalVote('save')}
                  disabled={submitting}
                  className="py-6 rounded-2xl border-2 font-black text-xl transition-all bg-blue-600/40 border-blue-400 text-blue-200 hover:bg-blue-600/60 hover:scale-105 disabled:opacity-50"
                >
                  🛡️ 석방
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VOTE RESULT */}
      {room.currentPhase === 'voteResult' && (
        <div className="space-y-4">
          {room.lastResultMessage && (
            <div className="game-card text-center space-y-3 bg-purple-500/20 border-purple-400">
              <div className="text-5xl">📋</div>
              <p className="text-2xl font-bold text-purple-200">{room.lastResultMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* ENDED */}
      {room.currentPhase === 'ended' && (
        <div className="space-y-4">
          <NarratorMessage message="게임이 종료되었습니다. 승리한 팀을 확인해 봅시다." />

          <a href="/" className="block">
            <button
              className="btn-primary w-full text-2xl py-5"
              style={{ fontFamily: '"Black Han Sans", sans-serif', letterSpacing: 0 }}
            >
              🏠 메인화면으로 돌아가기
            </button>
          </a>

          {room.winner && (
            <div
              className={`game-card text-center space-y-5 border-2 ${
                room.winner === 'citizen'
                  ? 'bg-blue-500/20 border-blue-400'
                  : 'bg-red-500/20 border-red-400'
              }`}
            >
              <div className="inline-flex mx-auto px-4 py-1 rounded-full border border-white/20 bg-black/25 text-white/60 text-sm font-black">
                GAME OVER
              </div>
              <div className="text-7xl animate-float">{room.winner === 'citizen' ? '🏆' : '🎭'}</div>
              <h2
                className={`text-5xl font-black text-white ${room.winner === 'citizen' ? 'text-glow-blue' : 'text-glow-red'}`}
                style={{ fontFamily: '"Black Han Sans", sans-serif', letterSpacing: 0 }}
              >
                {room.winner === 'citizen' ? '시민팀 승리!' : '마피아팀 승리!'}
              </h2>
              {myPlayer && (
                <p className="text-xl font-bold text-white/80 leading-relaxed">
                  {(myPlayer.team === room.winner)
                    ? '🎉 축하합니다! 당신의 팀이 이겼습니다!'
                    : '아쉽게도 당신의 팀이 졌습니다.'}
                </p>
              )}

            </div>
          )}

          <div className="game-card space-y-3">
            <h3 className="text-xl font-bold text-white">전체 결과</h3>
            <div className="space-y-2">
              {publicPlayers.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    p.isAlive ? 'bg-white/10' : 'bg-black/30 opacity-60'
                  }`}
                >
                  <span className="font-bold text-lg">
                    {p.isAlive ? '✅' : '💀'} {p.nickname}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <a href="/" className="block">
            <button className="btn-secondary w-full">🏠 메인으로 돌아가기</button>
          </a>
        </div>
      )}
    </main>
  );
}
