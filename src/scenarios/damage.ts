import type { Role, Scenario } from '../domain/types'

export const damageRoles: Role[] = [
  { id: 'simple-citizen', name: 'شهروند ساده', side: 'citizen', cardImage: '/cards/simple-citizen.webp' },
  { id: 'mafia-boss', name: 'رئیس مافیا', side: 'mafia', cardImage: '/cards/mafia-boss.webp' },
  { id: 'poisoner', name: 'سم‌ساز', side: 'mafia', cardImage: '/cards/poisoner.webp' },
  { id: 'chaos-maker', name: 'آشوب‌گر', side: 'mafia', cardImage: '/cards/chaos-maker.webp' },
  { id: 'doctor', name: 'طبیب', side: 'citizen', cardImage: '/cards/doctor.webp' },
  { id: 'sage', name: 'حکیم', side: 'citizen', cardImage: '/cards/sage.webp' },
  { id: 'archer', name: 'کمان‌دار', side: 'citizen', cardImage: '/cards/archer.webp' },
  { id: 'wizard', name: 'جادوگر', side: 'citizen', cardImage: '/cards/wizard.webp' },
  { id: 'roulette-man', name: 'رولت من', side: 'citizen', cardImage: '/cards/roulette-man.webp' },
]

export const damageScenario: Scenario = {
  id: 'damage', name: 'دمیج',
  roles: [
    { roleId: 'simple-citizen', count: 2 }, { roleId: 'mafia-boss', count: 1 },
    { roleId: 'poisoner', count: 1 }, { roleId: 'chaos-maker', count: 1 },
    { roleId: 'doctor', count: 1 }, { roleId: 'sage', count: 1 },
    { roleId: 'archer', count: 1 }, { roleId: 'wizard', count: 1 },
    { roleId: 'roulette-man', count: 1 },
  ],
  settings: { initialHp: 100, playerCount: 10 },
}
