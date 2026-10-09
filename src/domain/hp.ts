import type { Assignment, Game, HpEvent, Phase } from "./types";
import { makeId } from "./id";

const isDayPhase = (p: Phase) => p.kind === "day" || p.kind === "intro-day";

/**
 * وضعیت بعد از تغییر HP:
 *  HP > ۰ → زنده | روز و دقیقاً ۰ → کما | بقیه (منفی در روز، ≤۰ در شب) → مرگ
 */
function statusAfter(
  current: Assignment,
  after: number,
  phase: Phase,
): Pick<Assignment, "status" | "death"> {
  if (after > 0) return { status: "alive" };
  if (after === 0 && isDayPhase(phase)) return { status: "coma" };
  const death =
    current.status === "dead" && current.death
      ? current.death
      : { phase: { ...phase }, announced: isDayPhase(phase) };
  return { status: "dead", death };
}

const withState = (
  a: Assignment,
  hp: number,
  s: Pick<Assignment, "status" | "death">,
): Assignment => ({
  playerId: a.playerId,
  roleId: a.roleId,
  hp,
  status: s.status,
  ...(s.death ? { death: s.death } : {}),
});

/** HP می‌تواند منفی شود؛ مقدار واقعی ثبت می‌شود. */
export function applyHpChange(
  game: Game,
  playerId: string,
  delta: number,
  reason = "",
): Game {
  if (!Number.isFinite(delta) || delta === 0) return game;
  const current = game.assignments.find((a) => a.playerId === playerId);
  if (!current) return game;
  const after = current.hp + delta;
  const event: HpEvent = {
    id: makeId(),
    playerId,
    delta,
    hpBefore: current.hp,
    hpAfter: after,
    phase: { ...game.phase },
    at: Date.now(),
    ...(reason.trim() ? { reason: reason.trim() } : {}),
    prev: {
      status: current.status,
      ...(current.death ? { death: current.death } : {}),
    },
  };
  const assignment = withState(
    current,
    after,
    statusAfter(current, after, game.phase),
  );
  return {
    ...game,
    assignments: game.assignments.map((a) =>
      a.playerId === playerId ? assignment : a,
    ),
    hpEvents: [...game.hpEvents, event],
  };
}

/** برگرداندن آخرین تغییرِ برگردانده‌نشده‌ی بازیکن با ثبت رویداد جبرانی؛ سابقه پاک نمی‌شود. */
export function undoLastHpChange(game: Game, playerId: string): Game {
  const undone = new Set(
    game.hpEvents.flatMap((e) => (e.undoOf ? [e.undoOf] : [])),
  );
  const target = [...game.hpEvents]
    .reverse()
    .find((e) => e.playerId === playerId && !e.undoOf && !undone.has(e.id));
  const current = game.assignments.find((a) => a.playerId === playerId);
  if (!target || !current) return game;
  const after = target.hpBefore;
  const event: HpEvent = {
    id: makeId(),
    playerId,
    delta: after - current.hp,
    hpBefore: current.hp,
    hpAfter: after,
    phase: { ...game.phase },
    at: Date.now(),
    reason: "بازگردانی تغییر قبلی",
    undoOf: target.id,
  };
  const restored = target.prev ?? {
    status: after > 0 ? ("alive" as const) : ("dead" as const),
  };
  const assignment = withState(current, after, restored);
  return {
    ...game,
    assignments: game.assignments.map((a) =>
      a.playerId === playerId ? assignment : a,
    ),
    hpEvents: [...game.hpEvents, event],
  };
}

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

export const LOW_HP = 50;

/** هشدار روز: نیمی از بازیکنانِ در بازی (نه مرده، نه کما) یا بیشتر HP کمتر از ۵۰ دارند. */
export function lowHpAlarm(game: Game) {
  const inPlay = game.assignments.filter((a) => a.status === "alive");
  const low = inPlay.filter((a) => a.hp < LOW_HP).length;
  return {
    low,
    total: inPlay.length,
    active:
      isDayPhase(game.phase) && inPlay.length > 0 && low * 2 >= inPlay.length,
  };
}

/** کم‌HP‌ترین بازیکنان بین کسانی که نه مرده‌اند و نه در کما */
export const lowestHpPlayers = (game: Game, n = 3): Assignment[] =>
  game.assignments
    .filter((a) => a.status === "alive")
    .sort((a, b) => a.hp - b.hp)
    .slice(0, n);
