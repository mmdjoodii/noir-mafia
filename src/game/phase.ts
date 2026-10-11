import type { Assignment, Game, Phase } from "../types";

/** مراحل بازی (روز/شب)، و اعلام صبح مرگ‌های شب. */

export const isDayPhase = (p: Phase) =>
  p.kind === "day" || p.kind === "intro-day";

export function nextPhase(phase: Phase): Phase {
  switch (phase.kind) {
    case "intro-day":
      return { kind: "intro-night", number: 0 };
    case "intro-night":
      return { kind: "day", number: 1 };
    case "day":
      return { kind: "night", number: phase.number };
    case "night":
      return { kind: "day", number: phase.number + 1 };
  }
}

/** مرگ‌های شبِ اعلام‌نشده؛ فقط وقتی بازی در روز است باید اعلام شوند. */
export function pendingAnnouncements(game: Game): Assignment[] {
  if (!isDayPhase(game.phase)) return [];
  return game.assignments.filter(
    (a) => a.status === "dead" && a.death && !a.death.announced,
  );
}

export function markAnnounced(game: Game): Game {
  return {
    ...game,
    assignments: game.assignments.map((a) =>
      a.death && !a.death.announced
        ? { ...a, death: { ...a.death, announced: true } }
        : a,
    ),
  };
}
