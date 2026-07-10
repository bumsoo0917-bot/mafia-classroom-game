import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Player } from '@/types/game';
import { FieldValue } from 'firebase-admin/firestore';

const actionTypeToRole: Record<string, string> = {
  mafiaKill: 'mafia',
  policeCheck: 'police',
  doctorSave: 'doctor',
};

export async function POST(req: NextRequest) {
  try {
    const { roomId, playerId, actionType, targetPlayerId } = await req.json();

    if (!roomId || !playerId || !actionType || !targetPlayerId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const roomRef = adminDb.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const roomData = roomSnap.data()!;

    if (roomData.currentPhase !== 'night') {
      return NextResponse.json({ error: '밤 단계가 아닙니다.' }, { status: 400 });
    }

    const dayNumber = roomData.dayNumber as number;

    // Get player
    const playerSnap = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .doc(playerId)
      .get();

    if (!playerSnap.exists) {
      return NextResponse.json({ error: '플레이어를 찾을 수 없습니다.' }, { status: 404 });
    }

    const player = { id: playerSnap.id, ...playerSnap.data() } as Player;

    if (!player.isAlive) {
      return NextResponse.json({ error: '탈락한 플레이어는 행동할 수 없습니다.' }, { status: 400 });
    }

    const requiredRole = actionTypeToRole[actionType];
    if (!requiredRole) {
      return NextResponse.json({ error: '유효하지 않은 행동입니다.' }, { status: 400 });
    }

    if (player.role !== requiredRole) {
      return NextResponse.json({ error: '해당 행동을 수행할 수 없는 역할입니다.' }, { status: 400 });
    }

    if (actionType === 'mafiaKill' && dayNumber === 1) {
      return NextResponse.json({ error: '첫날 밤에는 아직 마피아가 공격할 수 없습니다.' }, { status: 400 });
    }

    // Check for duplicate action
    const existingAction = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('nightActions')
      .where('dayNumber', '==', dayNumber)
      .where('actorId', '==', playerId)
      .get();

    if (!existingAction.empty) {
      return NextResponse.json({ error: '이미 행동을 제출했습니다.' }, { status: 400 });
    }

    // Verify target is alive
    const targetSnap = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .doc(targetPlayerId)
      .get();

    if (!targetSnap.exists || !targetSnap.data()?.isAlive) {
      return NextResponse.json({ error: '유효하지 않은 대상입니다.' }, { status: 400 });
    }

    if (actionType === 'mafiaKill' && (targetPlayerId === playerId || player.mafiaTeamIds?.includes(targetPlayerId))) {
      return NextResponse.json({ error: '마피아는 자신이나 동료 마피아를 공격할 수 없습니다.' }, { status: 400 });
    }

    if (actionType === 'policeCheck' && targetPlayerId === playerId) {
      return NextResponse.json({ error: '경찰은 자기 자신을 조사할 수 없습니다.' }, { status: 400 });
    }

    // Save night action
    await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('nightActions')
      .add({
        dayNumber,
        actorId: playerId,
        actionType,
        targetPlayerId,
        result: null,
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('submit-night-action error:', err);
    return NextResponse.json({ error: '행동 제출에 실패했습니다.' }, { status: 500 });
  }
}
