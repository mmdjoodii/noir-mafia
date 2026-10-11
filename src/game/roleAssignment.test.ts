import { describe, expect, it } from "vitest";
import { damageScenario } from "../scenarios/damage";
import {
  buildRoleDeck,
  canAssignRole,
  makeAssignments,
} from "./roleAssignment";

describe("تقسیم نقش", () => {
  it("دسته کارت‌ها به تعداد بازیکنان است", () => {
    const deck = buildRoleDeck(damageScenario);
    expect(deck).toHaveLength(damageScenario.settings.playerCount);
    expect(deck.filter((r) => r === "simple-citizen")).toHaveLength(2);
  });
  it("بیش از ظرفیت یک نقش یا بیش از تعداد بازیکنان مجاز نیست", () => {
    expect(
      canAssignRole(damageScenario, ["simple-citizen"], "simple-citizen", 10),
    ).toBe(true);
    expect(
      canAssignRole(
        damageScenario,
        ["simple-citizen", "simple-citizen"],
        "simple-citizen",
        10,
      ),
    ).toBe(false);
    expect(
      canAssignRole(damageScenario, ["mafia-boss"], "mafia-boss", 10),
    ).toBe(false);
    expect(
      canAssignRole(
        damageScenario,
        buildRoleDeck(damageScenario),
        "doctor",
        10,
      ),
    ).toBe(false);
    expect(canAssignRole(damageScenario, [], "ناشناخته", 10)).toBe(false);
  });
  it("هر بازیکن یک تخصیص با HP اولیه می‌گیرد", () => {
    const players = [
      { id: "a", name: "الف" },
      { id: "b", name: "ب" },
    ];
    const list = makeAssignments(players, ["doctor", "sage"], 100);
    expect(list.map((x) => [x.playerId, x.roleId, x.hp, x.status])).toEqual([
      ["a", "doctor", 100, "alive"],
      ["b", "sage", 100, "alive"],
    ]);
  });
});
