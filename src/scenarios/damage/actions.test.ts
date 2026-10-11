import { describe, expect, it } from "vitest";
import type { Game } from "../../types";
import { applyDamageRoulette, changeDamageHp, undoDamageHp } from "./actions";

const game = (): Game => ({
  id: "g",
  scenarioId: "damage",
  status: "running",
  phase: { kind: "day", number: 1 },
  hpEvents: [],
  players: [
    { id: "a", name: "الف" },
    { id: "b", name: "ب" },
  ],
  assignments: [
    { playerId: "a", roleId: "doctor", hp: 80, status: "alive" },
    { playerId: "b", roleId: "sage", hp: 50, status: "alive" },
  ],
});

describe("اقدامات اختصاصی سناریوی دمیج", () => {
  it("رولت روسی HP دو بازیکن را به میانگین یکسان می‌کند و هر دو را ثبت می‌کند", () => {
    const next = applyDamageRoulette(game(), "a", "b");
    expect(next.assignments.map((a) => a.hp)).toEqual([65, 65]);
    expect(next.hpEvents).toHaveLength(2);
    expect(next.hpEvents.map((event) => event.playerId)).toEqual(["a", "b"]);
  });

  it("انتخاب نامعتبر رولت هیچ تغییری ایجاد نمی‌کند", () => {
    const current = game();
    expect(applyDamageRoulette(current, "a", "a")).toBe(current);
    expect(applyDamageRoulette(current, "a", "missing")).toBe(current);
  });

  it("تغییر و بازگردانی HP از مسیر اقدامات دمیج انجام می‌شود", () => {
    const changed = changeDamageHp(game(), "a", -10, "تست");
    expect(changed.assignments[0].hp).toBe(70);
    const undone = undoDamageHp(changed, "a");
    expect(undone.assignments[0]).toMatchObject({ hp: 80, status: "alive" });
  });
});
