import { isDayPhase } from "./hp";
import type { Game } from "./types";

/** تغییر دستی وضعیت زنده/مرده برای سناریوهای بدون HP. مرگ شب تا اعلام صبح اعلام‌نشده می‌ماند. */
export function setPlayerStatus(
  game: Game,
  playerId: string,
  status: "alive" | "dead",
): Game {
  return {
    ...game,
    assignments: game.assignments.map((a) => {
      if (a.playerId !== playerId || a.status === status) return a;
      if (status === "alive")
        return { playerId: a.playerId, roleId: a.roleId, hp: a.hp, status };
      return {
        ...a,
        status,
        death: { phase: { ...game.phase }, announced: isDayPhase(game.phase) },
      };
    }),
  };
}
