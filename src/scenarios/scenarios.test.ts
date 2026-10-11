import { describe, expect, it } from "vitest";
import { getScenarioRoleMap, scenarios } from ".";

describe("تعریف سناریوها", () => {
  it.each(scenarios.map((s) => [s.id, s] as const))(
    "%s: جمع کارت‌ها = تعداد بازیکن و نقش‌ها معتبرند",
    (_, s) => {
      expect(s.roles.reduce((n, r) => n + r.count, 0)).toBe(
        s.settings.playerCount,
      );
      for (const r of s.roles)
        expect(getScenarioRoleMap(s.id)[r.roleId]).toBeDefined();
      expect(new Set(s.roles.map((r) => r.roleId)).size).toBe(s.roles.length);
    },
  );
  it("کارت‌های نقش مشترک بین سناریوها از پوشه‌های مستقل می‌آیند", () => {
    const damageCitizen = getScenarioRoleMap("damage")["simple-citizen"];
    const bazporsCitizen = getScenarioRoleMap("bazpors-10")["simple-citizen"];
    expect(damageCitizen.cardImage).toContain("/cards/damage/");
    expect(bazporsCitizen.cardImage).toContain("/cards/bazpors/");
    expect(damageCitizen.cardImage).not.toBe(bazporsCitizen.cardImage);
  });
  it("شناسه سناریوها یکتاست", () => {
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length);
  });
  it("بازپرس ۱۰/۱۲/۱۳ مطابق ترکیب تعریف‌شده است", () => {
    const count = (id: string, role: string) =>
      scenarios.find((s) => s.id === id)!.roles.find((r) => r.roleId === role)
        ?.count ?? 0;
    expect(count("bazpors-10", "sniper")).toBe(0);
    expect(count("bazpors-10", "simple-citizen")).toBe(2);
    expect(
      count("bazpors-12", "sniper") + count("bazpors-12", "simple-mafia"),
    ).toBe(2);
    expect(count("bazpors-12", "simple-citizen")).toBe(2);
    expect(count("bazpors-13", "simple-citizen")).toBe(3);
  });
});
