import { bazporsRoles, bazpors10, bazpors12, bazpors13 } from "./bazpors";
import { damageScenario, damageRoles } from "./damage";

/** برای سناریوی جدید یک فایل داده بسازید و اینجا ثبتش کنید. */
export const scenarios = [damageScenario, bazpors10, bazpors12, bazpors13];
export const rolesById = Object.fromEntries(
  [...damageRoles, ...bazporsRoles].map((role) => [role.id, role]),
);
export const getScenario = (id: string) => scenarios.find((s) => s.id === id);
