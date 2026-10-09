import { damageScenario, damageRoles } from './damage'

/** برای سناریوی جدید یک فایل داده بسازید و اینجا ثبتش کنید. */
export const scenarios = [damageScenario]
export const rolesById = Object.fromEntries(damageRoles.map(role => [role.id, role]))
export const getScenario = (id: string) => scenarios.find(s => s.id === id)
