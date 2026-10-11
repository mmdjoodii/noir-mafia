import type { Game } from "../types";

const KEY = "noir-mafia-game-v1";
const LEGACY_KEY = "damage-mafia-game-v1";

/** فقط ذخیره‌هایی که ساختار درست دارند پذیرفته می‌شوند؛ داده خراب باعث کرش نمی‌شود. */
function parseGame(raw: string): Game | null {
  const g = JSON.parse(raw) as Partial<Game> | null;
  const valid =
    !!g &&
    typeof g.id === "string" &&
    typeof g.scenarioId === "string" &&
    Array.isArray(g.players) &&
    Array.isArray(g.assignments) &&
    Array.isArray(g.hpEvents) &&
    (g.status === "dealing" || g.status === "running") &&
    !!g.phase;
  return valid ? (g as Game) : null;
}

export function loadGame(): Game | null {
  try {
    const current = localStorage.getItem(KEY);
    if (current) return parseGame(current);

    // Migrate a save from the previous app name without losing the current game.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    localStorage.setItem(KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
    return parseGame(legacy);
  } catch {
    return null;
  }
}

export function saveGame(game: Game | null) {
  try {
    if (game) localStorage.setItem(KEY, JSON.stringify(game));
    else localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Storage may be disabled by the browser.
  }
}
