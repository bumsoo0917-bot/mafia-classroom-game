export type Role = 'mafia' | 'police' | 'doctor' | 'citizen';
export type Team = 'mafia' | 'citizen';
export type GamePhase =
  | 'waiting'
  | 'roleReveal'
  | 'night'
  | 'nightResult'
  | 'dayDiscussion'
  | 'voting'
  | 'voteResult'
  | 'ended';
export type TieRule = 'revote' | 'noElimination';
export type WinCondition = 'mafia' | 'citizen' | null;

export interface RoomSettings {
  mafiaCount: number;
  policeCount: number;
  doctorCount: number;
  discussionTime: number; // seconds
  voteTime: number; // seconds
  revealRoleOnDeath: boolean;
  tieRule: TieRule;
}

export interface Room {
  id: string;
  roomName: string;
  gameCode: string;
  currentPhase: GamePhase;
  dayNumber: number;
  maxPlayers: number;
  createdAt: unknown;
  status: 'waiting' | 'playing' | 'ended';
  winner: WinCondition;
  lastResultMessage: string | null;
  settings: RoomSettings;
  phaseStartedAt: unknown;
}

export interface Player {
  id: string;
  nickname: string;
  role: Role | null;
  team: Team | null;
  isAlive: boolean;
  isReady: boolean;
  joinedAt: unknown;
  uid: string;
  mafiaTeamIds?: string[];
  policeLastResult?: string | null;
}

export interface PublicPlayer {
  id: string;
  nickname: string;
  isAlive: boolean;
}

export interface NightAction {
  id: string;
  dayNumber: number;
  actorId: string;
  actionType: 'mafiaKill' | 'policeCheck' | 'doctorSave';
  targetPlayerId: string;
  result: string | null;
  createdAt: unknown;
}

export interface Vote {
  id: string;
  dayNumber: number;
  voterId: string;
  targetPlayerId: string;
  createdAt: unknown;
}

export interface GameLog {
  id: string;
  type: string;
  message: string;
  createdAt: unknown;
}
