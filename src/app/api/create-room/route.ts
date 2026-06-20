import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { generateGameCode } from '@/lib/gameLogic';
import { RoomSettings } from '@/types/game';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomName, maxPlayers, settings } = body as {
      roomName: string;
      maxPlayers: number;
      settings: RoomSettings;
    };

    if (!roomName || !maxPlayers || !settings) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const gameCode = generateGameCode();

    const roomRef = await adminDb.collection('rooms').add({
      roomName,
      gameCode,
      currentPhase: 'waiting',
      dayNumber: 1,
      maxPlayers,
      createdAt: FieldValue.serverTimestamp(),
      status: 'waiting',
      winner: null,
      lastResultMessage: null,
      phaseStartedAt: FieldValue.serverTimestamp(),
      settings,
    });

    return NextResponse.json({ roomId: roomRef.id, gameCode });
  } catch (err) {
    console.error('create-room error:', err);
    return NextResponse.json({ error: '방 생성에 실패했습니다.' }, { status: 500 });
  }
}
