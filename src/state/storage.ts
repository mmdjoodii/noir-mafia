import type { Game } from "../domain/types";

const KEY = "noir-mafia-game-v1";
const LEGACY_KEY = "damage-mafia-game-v1";

export function loadGame(): Game | null {
  try {
    const current = localStorage.getItem(KEY);
    if (current) return JSON.parse(current) as Game;

    // Migrate a save from the previous app name without losing the current game.
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    localStorage.setItem(KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
    return JSON.parse(legacy) as Game;
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
