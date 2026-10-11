import { describe, expect, it } from "vitest";
import { setPlayerStatus } from "./status";
import type { Game } from "../types";

const game = (kind: "day" | "night"): Game => ({
  id: "g",
  scenarioId: "bazpors-10",
  status: "running",
  phase: { kind, number: 1 },
  hpEvents: [],
  players: [{ id: "p", name: "الف" }],
  assignments: [{ playerId: "p", roleId: "hunter", hp: 0, status: "alive" }],
});

describe("وضعیت دستی (بدون HP)", () => {
  it("مرگ شب اعلام‌نشده و مرگ روز اعلام‌شده است", () => {
    expect(
      setPlayerStatus(game("night"), "p", "dead").assignments[0].death
        ?.announced,
    ).toBe(false);
    expect(
      setPlayerStatus(game("day"), "p", "dead").assignments[0].death?.announced,
    ).toBe(true);
  });
  it("برگرداندن به بازی مرگ را پاک می‌کند", () => {
    const g = setPlayerStatus(
      setPlayerStatus(game("night"), "p", "dead"),
      "p",
      "alive",
    );
    expect(g.assignments[0]).toEqual({
      playerId: "p",
      roleId: "hunter",
      hp: 0,
      status: "alive",
    });
  });
});
