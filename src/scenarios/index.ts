import { damageScenario, damageRoles } from './damage'
export const scenarios = [damageScenario]
export const rolesById = Object.fromEntries(damageRoles.map(role => [role.id, role]))
export const getScenarioRoles = (scenarioId: string) => scenarioId === 'damage' ? damageRoles : []
