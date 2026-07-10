import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { assignRoles, checkWinCondition } from '@/lib/gameLogic';
import { Player, RoomSettings } from '@/types/game';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();

    if (!roomId) {
      return NextResponse.json({ error: '방 ID가 필요합니다.' }, { status: 400 });
    }

    const roomRef = adminDb.collection('rooms').doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      return NextResponse.json({ error: '방을 찾을 수 없습니다.' }, { status: 404 });
    }

    const roomData = roomSnap.data()!;

    if (roomData.status !== 'waiting') {
      return NextResponse.json({ error: '이미 시작된 게임입니다.' }, { status: 400 });
    }

    // Get all players
    const playersSnap = await adminDb
      .collection('rooms')
      .doc(roomId)
      .collection('players')
      .get();

    const players: Player[] = playersSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    } as Player));

    if (players.length < 4) {
      return NextResponse.json({ error: '최소 4명이 필요합니다.' }, { status: 400 });
    }

    const settings = roomData.settings as RoomSettings;

    // Validate role counts
    const totalSpecial = settings.mafiaCount + settings.policeCount + settings.doctorCount;
    if (totalSpecial > players.length) {
      return NextResponse.json({ error: '역할 수가 참여자 수를 초과합니다.' }, { status: 400 });
    }

    // Assign roles
    const assignedPlayers = assignRoles(players, settings);

    // Batch update player documents
    const batch = adminDb.batch();

    for (const player of assignedPlayers) {
      const playerRef = adminDb
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(player.id);

      batch.update(playerRef, {
        role: player.role,
        team: player.team,
        mafiaTeamIds: player.mafiaTeamIds ?? [],
      });
    }

    const winner = checkWinCondition(assignedPlayers);
    const winnerMessage = winner === 'citizen'
      ? '시민팀이 승리했습니다!'
      : winner === 'mafia'
      ? '마피아팀이 승리했습니다!'
      : null;

    // Update room
    batch.update(roomRef, {
      currentPhase: winner ? 'ended' : 'roleReveal',
      status: winner ? 'ended' : 'playing',
      winner: winner ?? null,
      lastResultMessage: winnerMessage,
      phaseStartedAt: FieldValue.serverTimestamp(),
    });

    // Add log
    const logRef = adminDb.collection('rooms').doc(roomId).collection('logs').doc();
    batch.set(logRef, {
      type: winner ? 'gameEnd' : 'gameStart',
      message: winnerMessage
        ? `게임 시작 직후 ${winnerMessage}`
        : `게임이 시작되었습니다. 참여자 ${players.length}명`,
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('start-game error:', err);
    return NextResponse.json({ error: '게임 시작에 실패했습니다.' }, { status: 500 });
  }
}
