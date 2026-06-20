import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Player } from '@/types/game';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { roomId, voterId, targetPlayerId } = await req.json();

    if (!roomId || !voterId || !targetPlayerId) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    if (voterId === targetPlayerId) {
      return NextResponse.json({ error: '자신에게 투표할 수 없습니다.' }, { status: 400 });
    }

    const roomRef = adminDb.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const roomData = roomSnap.data()!;

    if (roomData.currentPhase !== 'voting') {
      return NextResponse.json({ error: '투표 단계가 아닙니다.' }, { status: 400 });
    }

    const dayNumber = roomData.dayNumber as number;

    // Check voter is alive
    const voterSnap = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .doc(voterId)
      .get();

    if (!voterSnap.exists) {
      return NextResponse.json({ error: '플레이어를 찾을 수 없습니다.' }, { status: 404 });
    }

    const voter = { id: voterSnap.id, ...voterSnap.data() } as Player;

    if (!voter.isAlive) {
      return NextResponse.json({ error: '탈락한 플레이어는 투표할 수 없습니다.' }, { status: 400 });
    }

    // Check target is alive
    const targetSnap = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .doc(targetPlayerId)
      .get();

    if (!targetSnap.exists || !targetSnap.data()?.isAlive) {
      return NextResponse.json({ error: '유효하지 않은 투표 대상입니다.' }, { status: 400 });
    }

    // Check duplicate vote
    const existingVote = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('votes')
      .where('dayNumber', '==', dayNumber)
      .where('voterId', '==', voterId)
      .get();

    if (!existingVote.empty) {
      return NextResponse.json({ error: '이미 투표했습니다.' }, { status: 400 });
    }

    // Save vote
    await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('votes')
      .add({
        dayNumber,
        voterId,
        targetPlayerId,
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('submit-vote error:', err);
    return NextResponse.json({ error: '투표 제출에 실패했습니다.' }, { status: 500 });
  }
}
