import type { Game } from "../../types";
import { applyHpChange, undoLastHpChange } from "./hp";

/** Apply one Damage-specific HP change. The generic game layer never owns HP rules. */
export function changeDamageHp(
  game: Game,
  playerId: string,
  delta: number,
  reason = "",
): Game {
  return applyHpChange(game, playerId, delta, reason);
}

/**
 * Damage's Russian roulette rule: both players end with the floored average of their current HP.
 * Each change is recorded independently so the existing history/undo model remains intact.
 */
export function applyDamageRoulette(
  game: Game,
  firstPlayerId: string,
  secondPlayerId: string,
): Game {
  if (!firstPlayerId || !secondPlayerId || firstPlayerId === secondPlayerId)
    return game;
  const first = game.assignments.find((a) => a.playerId === firstPlayerId);
  const second = game.assignments.find((a) => a.playerId === secondPlayerId);
  const firstPlayer = game.players.find((p) => p.id === firstPlayerId);
  const secondPlayer = game.players.find((p) => p.id === secondPlayerId);
  if (!first || !second || !firstPlayer || !secondPlayer) return game;

  const sharedHp = Math.floor((first.hp + second.hp) / 2);
  if (first.hp === sharedHp && second.hp === sharedHp) return game;

  let next = applyHpChange(
    game,
    firstPlayerId,
    sharedHp - first.hp,
    `رولت روسی: میانگین HP با ${secondPlayer.name}`,
  );
  next = applyHpChange(
    next,
    secondPlayerId,
    sharedHp - second.hp,
    `رولت روسی: میانگین HP با ${firstPlayer.name}`,
  );
  return next;
}

export function undoDamageHp(game: Game, playerId: string): Game {
  return undoLastHpChange(game, playerId);
}
