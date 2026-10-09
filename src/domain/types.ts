export type Side = "citizen" | "mafia";
export type PhaseKind = "intro-day" | "intro-night" | "day" | "night";
export type GameStatus = "setup" | "dealing" | "running";

export interface Role {
  id: string;
  name: string;
  side: Side;
  cardImage: string;
}
export interface Scenario {
  id: string;
  name: string;
  roles: { roleId: string; count: number }[];
  settings: { initialHp: number; playerCount: number };
}
export interface Player {
  id: string;
  name: string;
}
export interface Phase {
  kind: PhaseKind;
  number: number;
}
export interface DeathState {
  phase: Phase;
  announced: boolean;
}
export interface Assignment {
  playerId: string;
  roleId: string;
  hp: number;
  status: "alive" | "coma" | "dead";
  death?: DeathState;
}
export interface HpEvent {
  id: string;
  playerId: string;
  delta: number;
  hpBefore: number;
  hpAfter: number;
  phase: Phase;
  at: number;
  reason?: string;
  undoOf?: string;
  prev?: { status: Assignment["status"]; death?: DeathState };
}
export interface Game {
  id: string;
  scenarioId: string;
  players: Player[];
  assignments: Assignment[];
  phase: Phase;
  status: GameStatus;
  hpEvents: HpEvent[];
  selectedPlayerId?: string;
  dealMode?: "manual" | "random";
  revealQueue?: string[];
}
