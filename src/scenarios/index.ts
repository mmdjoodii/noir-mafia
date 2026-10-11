import { bazporsRoles, bazpors10, bazpors12, bazpors13 } from "./bazpors";
import { damageScenario, damageRoles } from "./damage";

/** برای سناریوی جدید یک فایل داده بسازید و اینجا ثبتش کنید. */
export const scenarios = [damageScenario, bazpors10, bazpors12, bazpors13];

const damageRoleMap = Object.fromEntries(
  damageRoles.map((role) => [role.id, role]),
);
const bazporsRoleMap = Object.fromEntries(
  bazporsRoles.map((role) => [role.id, role]),
);

/** کارت‌ها با توجه به سناریو resolve می‌شوند تا نقش‌های هم‌نام تصویر اشتباه نگیرند. */
export function getScenarioRoleMap(scenarioId: string) {
  return scenarioId.startsWith("bazpors-") ? bazporsRoleMap : damageRoleMap;
}

export function getScenarioRole(scenarioId: string, roleId: string) {
  return getScenarioRoleMap(scenarioId)[roleId];
}

export const getScenario = (id: string) => scenarios.find((s) => s.id === id);
