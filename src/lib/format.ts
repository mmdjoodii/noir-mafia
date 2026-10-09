import type { Assignment, Phase } from "../domain/types";

export const phaseLabel = (phase: Phase) => {
  if (phase.kind === "intro-day") return "روز معارفه";
  if (phase.kind === "intro-night") return "شب معارفه";
  return `${phase.kind === "day" ? "روز" : "شب"} ${phase.number}`;
};

export const statusLabel = (a: Assignment) =>
  a.status === "coma"
    ? "در کما"
    : a.status === "alive"
      ? "زنده"
      : a.death
        ? `مرگ ${phaseLabel(a.death.phase)}${a.death.phase.kind.includes("night") ? (a.death.announced ? " · اعلام شد" : " · اعلام نشده") : " · وصیت"}`
        : "مرده";

export type Screen = "setup" | "deal" | "reveal" | "game" | "history";

export const initialNames = Array.from(
  { length: 10 },
  (_, i) => `بازیکن ${i + 1}`,
);
