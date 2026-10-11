import { useState } from "react";
import type { Game } from "../types";

/** state صفحه‌های تقسیم نقش و نمایش کارت (دستی و تصادفی). */
export function useDealing(saved: Game | null) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    () => saved?.selectedPlayerId ?? "",
  );
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [revealedRoleId, setRevealedRoleId] = useState(() => {
    return (
      saved?.assignments.find((a) => a.playerId === saved.selectedPlayerId)
        ?.roleId ?? ""
    );
  });
  const [showCard, setShowCard] = useState(false);
  const [randomDealing, setRandomDealing] = useState(() => {
    return saved?.status === "dealing" && saved.dealMode === "random";
  });
  const [randomRevealQueue, setRandomRevealQueue] = useState<string[]>(
    () => saved?.revealQueue ?? [],
  );
  return {
    selectedPlayerId,
    setSelectedPlayerId,
    selectedRoleId,
    setSelectedRoleId,
    revealedRoleId,
    setRevealedRoleId,
    showCard,
    setShowCard,
    randomDealing,
    setRandomDealing,
    randomRevealQueue,
    setRandomRevealQueue,
  };
}
