import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { gameCode, nickname, uid } = await req.json();

    if (!gameCode || !nickname || !uid) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    if (!nickname.trim() || nickname.trim().length > 10) {
      return NextResponse.json({ error: '닉네임은 1~10자여야 합니다.' }, { status: 400 });
    }

    // Find room by game code
    const roomsSnapshot = await adminDb
      .collection('rooms')
      .where('gameCode', '==', gameCode)
      .limit(1)
      .get();

    if (roomsSnapshot.empty) {
      return NextResponse.json({ error: '게임 코드를 찾을 수 없습니다.' }, { status: 404 });
    }

    const roomDoc = roomsSnapshot.docs[0];
    const roomData = roomDoc.data();
    const roomId = roomDoc.id;

    if (roomData.status !== 'waiting') {
      return NextResponse.json({ error: '이미 시작된 게임에는 입장할 수 없습니다.' }, { status: 400 });
    }

    // Check max players
    const playersSnapshot = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .get();

    if (playersSnapshot.size >= roomData.maxPlayers) {
      return NextResponse.json({ error: '방이 가득 찼습니다.' }, { status: 400 });
    }

    // Check if UID already joined
    const existingPlayer = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .doc(uid)
      .get();

    if (existingPlayer.exists) {
      return NextResponse.json({ roomId, playerId: uid });
    }

    // Check nickname uniqueness
    const nicknameCheck = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .where('nickname', '==', nickname.trim())
      .get();

    if (!nicknameCheck.empty) {
      return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 400 });
    }

    const trimmedNickname = nickname.trim();

    // Create player document
    await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .doc(uid)
      .set({
        id: uid,
        nickname: trimmedNickname,
        role: null,
        team: null,
        isAlive: true,
        isReady: false,
        joinedAt: FieldValue.serverTimestamp(),
        uid,
        mafiaTeamIds: [],
        policeLastResult: null,
      });

    // Create publicPlayer document
    await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('publicPlayers')
      .doc(uid)
      .set({
        id: uid,
        nickname: trimmedNickname,
        isAlive: true,
      });

    return NextResponse.json({ roomId, playerId: uid });
  } catch (err) {
    console.error('join-room error:', err);
    return NextResponse.json({ error: '입장에 실패했습니다.' }, { status: 500 });
  }
}
