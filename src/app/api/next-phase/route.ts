import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { resolveNight, resolveVote, checkWinCondition, policeCheck } from '@/lib/gameLogic';
import { GamePhase, Player, Vote, TieRule } from '@/types/game';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { roomId, forceEnd } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: '방 ID가 필요합니다.' }, { status: 400 });
    }

    const roomRef = adminDb.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const roomData = roomSnap.data()!;
    const currentPhase = roomData.currentPhase as GamePhase;
    const dayNumber = roomData.dayNumber as number;
    const tieRule = roomData.settings?.tieRule as TieRule ?? 'noElimination';

    // Force end
    if (forceEnd) {
      await roomRef.update({
        currentPhase: 'ended',
        status: 'ended',
        winner: null,
        lastResultMessage: '게임이 강제 종료되었습니다.',
        phaseStartedAt: FieldValue.serverTimestamp(),
      });
      const logRef = adminDb.collection('rooms').doc(roomId).collection('logs').doc();
      await logRef.set({
        type: 'forceEnd',
        message: '게임이 강제 종료되었습니다.',
        createdAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true });
    }

    const batch = adminDb.batch();
    const logRef = adminDb.collection('rooms').doc(roomId).collection('logs').doc();

    let nextPhase: GamePhase;
    let updateData: Record<string, unknown> = {
      phaseStartedAt: FieldValue.serverTimestamp(),
    };

    const clearPoliceResults = async () => {
      const policeSnap = await adminDb
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .where('role', '==', 'police')
        .get();

      for (const policeDoc of policeSnap.docs) {
        batch.update(policeDoc.ref, { policeLastResult: null });
      }
    };

    if (currentPhase === 'roleReveal') {
      nextPhase = 'night';
      updateData.lastResultMessage = null;
      await clearPoliceResults();
      batch.set(logRef, {
        type: 'phaseChange',
        message: `${dayNumber}일차 밤이 시작되었습니다.`,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else if (currentPhase === 'night') {
      nextPhase = 'nightResult';

      // Process night actions
      const nightActionsSnap = await adminDb
        .collection('rooms')
        .doc(roomId)
        .collection('nightActions')
        .where('dayNumber', '==', dayNumber)
        .get();

      let mafiaTargetId: string | null = null;
      let doctorTargetId: string | null = null;
      let policeTargetId: string | null = null;
      let policeActorId: string | null = null;

      for (const actionDoc of nightActionsSnap.docs) {
        const action = actionDoc.data();
        if (action.actionType === 'mafiaKill' && dayNumber !== 1) mafiaTargetId = action.targetPlayerId;
        if (action.actionType === 'doctorSave') doctorTargetId = action.targetPlayerId;
        if (action.actionType === 'policeCheck') {
          policeTargetId = action.targetPlayerId;
          policeActorId = action.actorId;
        }
      }

      const eliminatedId = resolveNight(mafiaTargetId, doctorTargetId);
      let resultMessage: string;

      if (eliminatedId) {
        const eliminatedPlayerSnap = await adminDb
          .collection('rooms')
          .doc(roomId)
          .collection('players')
          .doc(eliminatedId)
          .get();

        if (eliminatedPlayerSnap.exists) {
          const eliminatedData = eliminatedPlayerSnap.data()!;
          const playerRef = adminDb.collection('rooms').doc(roomId).collection('players').doc(eliminatedId);
          const publicPlayerRef = adminDb.collection('rooms').doc(roomId).collection('publicPlayers').doc(eliminatedId);

          batch.update(playerRef, { isAlive: false });
          batch.update(publicPlayerRef, { isAlive: false });

          const roleText = roomData.settings?.revealRoleOnDeath
            ? ` (역할: ${eliminatedData.role === 'mafia' ? '마피아' : eliminatedData.role === 'police' ? '경찰' : eliminatedData.role === 'doctor' ? '의사' : '시민'})`
            : '';

          resultMessage = `어젯밤 ${eliminatedData.nickname}님이 탈락했습니다.${roleText}`;
        } else {
          resultMessage = '어젯밤 아무 일도 일어나지 않았습니다.';
        }
      } else if (dayNumber === 1) {
        resultMessage = '첫날 밤은 아직 시민 회의가 시작되기 전이라 아무도 탈락하지 않았습니다.';
      } else if (mafiaTargetId && mafiaTargetId === doctorTargetId) {
        resultMessage = '어젯밤 아무도 탈락하지 않았습니다. (의사가 구했습니다!)';
      } else {
        resultMessage = '어젯밤 아무 일도 일어나지 않았습니다.';
      }

      // Police check result
      if (policeTargetId && policeActorId) {
        const targetSnap = await adminDb
          .collection('rooms')
          .doc(roomId)
          .collection('players')
          .doc(policeTargetId)
          .get();

        if (targetSnap.exists) {
          const targetPlayer = { id: targetSnap.id, ...targetSnap.data() } as Player;
          const checkResult = `${targetPlayer.nickname}님은 ${policeCheck(targetPlayer)}`;
          const policeRef = adminDb.collection('rooms').doc(roomId).collection('players').doc(policeActorId);
          batch.update(policeRef, { policeLastResult: checkResult });
        }
      }

      updateData.lastResultMessage = resultMessage;
      batch.set(logRef, {
        type: 'nightResult',
        message: resultMessage,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else if (currentPhase === 'nightResult') {
      nextPhase = 'dayDiscussion';
      updateData.lastResultMessage = null;
      batch.set(logRef, {
        type: 'phaseChange',
        message: `${dayNumber}일차 낮 토론이 시작되었습니다.`,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else if (currentPhase === 'dayDiscussion') {
      nextPhase = 'voting';
      batch.set(logRef, {
        type: 'phaseChange',
        message: '투표가 시작되었습니다.',
        createdAt: FieldValue.serverTimestamp(),
      });
    } else if (currentPhase === 'voting') {
      // 투표 집계 → 최다 득표자 확인 → finalDefense 단계로
      const votesSnap = await adminDb
        .collection('rooms').doc(roomId).collection('votes')
        .where('dayNumber', '==', dayNumber).get();

      const votes: Vote[] = votesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Vote));
      const topId = resolveVote(votes, tieRule);

      if (topId) {
        const topSnap = await adminDb.collection('rooms').doc(roomId).collection('players').doc(topId).get();
        const topNickname = topSnap.data()?.nickname ?? '알 수 없음';
        nextPhase = 'finalDefense';
        updateData.finalDefenseTargetId = topId;
        updateData.finalDefenseTargetNickname = topNickname;
        updateData.lastResultMessage = null;
        batch.set(logRef, {
          type: 'phaseChange',
          message: `${topNickname}님이 최다 득표로 최후변론을 시작합니다.`,
          createdAt: FieldValue.serverTimestamp(),
        });
      } else {
        // 동률 - 바로 voteResult 로
        nextPhase = 'voteResult';
        updateData.lastResultMessage = '동률로 아무도 탈락하지 않았습니다.';
        updateData.finalDefenseTargetId = null;
        updateData.finalDefenseTargetNickname = null;
        batch.set(logRef, {
          type: 'voteResult',
          message: '동률로 아무도 탈락하지 않았습니다.',
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    } else if (currentPhase === 'finalDefense') {
      // 최후변론 → 최종투표
      nextPhase = 'finalVote';
      batch.set(logRef, {
        type: 'phaseChange',
        message: `${roomData.finalDefenseTargetNickname ?? ''}님에 대한 최종 투표를 시작합니다.`,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else if (currentPhase === 'finalVote') {
      // 최종투표 집계 → voteResult
      nextPhase = 'voteResult';
      const finalVotesSnap = await adminDb
        .collection('rooms').doc(roomId).collection('finalVotes')
        .where('dayNumber', '==', dayNumber).get();

      const eliminateCount = finalVotesSnap.docs.filter(d => d.data().vote === 'eliminate').length;
      const saveCount = finalVotesSnap.docs.filter(d => d.data().vote === 'save').length;
      const targetId = roomData.finalDefenseTargetId as string | null;
      const targetNickname = roomData.finalDefenseTargetNickname as string | null;

      let resultMessage: string;

      if (targetId && eliminateCount > saveCount) {
        // 추방 확정
        const playerRef = adminDb.collection('rooms').doc(roomId).collection('players').doc(targetId);
        const publicPlayerRef = adminDb.collection('rooms').doc(roomId).collection('publicPlayers').doc(targetId);
        const targetSnap = await playerRef.get();
        const roleText = roomData.settings?.revealRoleOnDeath && targetSnap.exists
          ? ` (역할: ${targetSnap.data()?.role === 'mafia' ? '마피아' : targetSnap.data()?.role === 'police' ? '경찰' : targetSnap.data()?.role === 'doctor' ? '의사' : '시민'})`
          : '';
        batch.update(playerRef, { isAlive: false });
        batch.update(publicPlayerRef, { isAlive: false });
        resultMessage = `최종 투표 결과 ${targetNickname}님이 추방되었습니다.${roleText} (추방 ${eliminateCount}표 vs 석방 ${saveCount}표)`;
      } else if (targetId) {
        // 석방
        resultMessage = `최종 투표 결과 ${targetNickname}님이 석방되었습니다. (추방 ${eliminateCount}표 vs 석방 ${saveCount}표)`;
      } else {
        resultMessage = '최종 투표가 완료되었습니다.';
      }

      updateData.lastResultMessage = resultMessage;
      updateData.finalDefenseTargetId = null;
      updateData.finalDefenseTargetNickname = null;
      batch.set(logRef, {
        type: 'voteResult',
        message: resultMessage,
        createdAt: FieldValue.serverTimestamp(),
      });
    } else if (currentPhase === 'voteResult') {
      // Check win condition with current player states
      const allPlayersSnap = await adminDb
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .get();

      const allPlayers: Player[] = allPlayersSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      } as Player));

      const winner = checkWinCondition(allPlayers);

      if (winner) {
        nextPhase = 'ended';
        updateData.winner = winner;
        updateData.status = 'ended';
        updateData.lastResultMessage =
          winner === 'citizen' ? '시민팀이 승리했습니다!' : '마피아팀이 승리했습니다!';
        batch.set(logRef, {
          type: 'gameEnd',
          message: winner === 'citizen' ? '시민팀 승리!' : '마피아팀 승리!',
          createdAt: FieldValue.serverTimestamp(),
        });
      } else {
        // Next day
        nextPhase = 'night';
        updateData.dayNumber = dayNumber + 1;
        updateData.lastResultMessage = null;
        await clearPoliceResults();
        batch.set(logRef, {
          type: 'phaseChange',
          message: `${dayNumber + 1}일차 밤이 시작되었습니다.`,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    } else {
      return NextResponse.json({ error: '전환할 수 없는 단계입니다.' }, { status: 400 });
    }

    updateData.currentPhase = nextPhase!;
    batch.update(roomRef, updateData);
    await batch.commit();

    return NextResponse.json({ success: true, nextPhase });
  } catch (err) {
    console.error('next-phase error:', err);
    return NextResponse.json({ error: '단계 전환에 실패했습니다.' }, { status: 500 });
  }
}
