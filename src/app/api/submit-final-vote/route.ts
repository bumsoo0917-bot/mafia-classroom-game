import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { roomId, voterId, vote } = await req.json();

    if (!roomId || !voterId || !vote) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    if (vote !== 'eliminate' && vote !== 'save') {
      return NextResponse.json({ error: '올바르지 않은 투표입니다.' }, { status: 400 });
    }

    const roomRef = adminDb.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();
    if (!roomSnap.exists) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const roomData = roomSnap.data()!;
    if (roomData.currentPhase !== 'finalVote') {
      return NextResponse.json({ error: '최종 투표 단계가 아닙니다.' }, { status: 400 });
    }

    const dayNumber = roomData.dayNumber as number;

    // 본인 생존 확인
    const voterSnap = await adminDb.collection('rooms').doc(roomId).collection('players').doc(voterId).get();
    if (!voterSnap.exists || !voterSnap.data()?.isAlive) {
      return NextResponse.json({ error: '생존자만 투표할 수 있습니다.' }, { status: 400 });
    }

    // 최후변론 대상자는 최종투표 불가
    if (roomData.finalDefenseTargetId === voterId) {
      return NextResponse.json({ error: '최후변론 대상자는 투표할 수 없습니다.' }, { status: 400 });
    }

    // 중복 투표 확인
    const existingSnap = await adminDb
      .collection('rooms').doc(roomId)
      .collection('finalVotes')
      .where('dayNumber', '==', dayNumber)
      .where('voterId', '==', voterId)
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json({ error: '이미 투표했습니다.' }, { status: 400 });
    }

    await adminDb.collection('rooms').doc(roomId).collection('finalVotes').add({
      dayNumber,
      voterId,
      vote,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('submit-final-vote error:', err);
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 });
  }
}
