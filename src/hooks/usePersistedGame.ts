import { useEffect, useState } from "react";
import type { Game } from "../types";
import { saveGame } from "../services/storage";

/** وضعیت بازی را نگه می‌دارد و با هر تغییر در localStorage ذخیره می‌کند. */
export function usePersistedGame(initial: Game | null) {
  const [game, setGame] = useState<Game | null>(initial);
  useEffect(() => {
    saveGame(game);
  }, [game]);
  return [game, setGame] as const;
}
