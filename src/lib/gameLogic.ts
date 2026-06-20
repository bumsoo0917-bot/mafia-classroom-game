import { Player, Role, Team, TieRule, Vote, WinCondition, RoomSettings } from '@/types/game';

export function generateGameCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getRecommendedRoles(playerCount: number): {
  mafia: number;
  police: number;
  doctor: number;
  citizen: number;
} {
  const presets: Record<number, { mafia: number; police: number; doctor: number; citizen: number }> = {
    6: { mafia: 1, police: 1, doctor: 1, citizen: 3 },
    8: { mafia: 2, police: 1, doctor: 1, citizen: 4 },
    10: { mafia: 2, police: 1, doctor: 1, citizen: 6 },
    12: { mafia: 3, police: 1, doctor: 1, citizen: 7 },
    15: { mafia: 3, police: 1, doctor: 1, citizen: 10 },
  };

  if (presets[playerCount]) {
    return presets[playerCount];
  }

  const mafia = Math.floor(playerCount / 5);
  const police = 1;
  const doctor = 1;
  const citizen = playerCount - mafia - police - doctor;

  return { mafia, police, doctor, citizen: Math.max(0, citizen) };
}

export function assignRoles(players: Player[], settings: RoomSettings): Player[] {
  const roles: Role[] = [];

  for (let i = 0; i < settings.mafiaCount; i++) roles.push('mafia');
  for (let i = 0; i < settings.policeCount; i++) roles.push('police');
  for (let i = 0; i < settings.doctorCount; i++) roles.push('doctor');

  const citizenCount =
    players.length - settings.mafiaCount - settings.policeCount - settings.doctorCount;
  for (let i = 0; i < citizenCount; i++) roles.push('citizen');

  // Fisher-Yates shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  const mafiaPlayerIds = players
    .filter((_, idx) => roles[idx] === 'mafia')
    .map((p) => p.id);

  return players.map((player, index) => {
    const role = roles[index] ?? 'citizen';
    const team: Team = role === 'mafia' ? 'mafia' : 'citizen';
    return {
      ...player,
      role,
      team,
      mafiaTeamIds: role === 'mafia' ? mafiaPlayerIds : [],
    };
  });
}

export function resolveNight(
  mafiaTargetId: string | null,
  doctorTargetId: string | null
): string | null {
  if (!mafiaTargetId) return null;
  if (mafiaTargetId === doctorTargetId) return null;
  return mafiaTargetId;
}

export function policeCheck(targetPlayer: Player): string {
  if (targetPlayer.role === 'mafia') {
    return '마피아입니다.';
  }
  return '마피아가 아닙니다.';
}

export function resolveVote(votes: Vote[], tieRule: TieRule): string | null {
  if (votes.length === 0) return null;

  const voteCounts: Record<string, number> = {};
  for (const vote of votes) {
    voteCounts[vote.targetPlayerId] = (voteCounts[vote.targetPlayerId] ?? 0) + 1;
  }

  const entries = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  const maxVotes = entries[0][1];
  const topCandidates = entries.filter(([, count]) => count === maxVotes);

  if (topCandidates.length > 1) {
    // Tie
    if (tieRule === 'noElimination') {
      return null;
    }
    // revote: eliminate no one in this pass (caller handles revote logic)
    return null;
  }

  return topCandidates[0][0];
}

export function checkWinCondition(players: Player[]): WinCondition {
  const alivePlayers = players.filter((p) => p.isAlive);
  const aliveMafia = alivePlayers.filter((p) => p.team === 'mafia');
  const aliveCitizens = alivePlayers.filter((p) => p.team === 'citizen');

  if (aliveMafia.length === 0) {
    return 'citizen';
  }

  if (aliveMafia.length >= aliveCitizens.length) {
    return 'mafia';
  }

  return null;
}
