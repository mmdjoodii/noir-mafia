import type { Role, Scenario } from '../domain/types'

const img = (name: string) => `${import.meta.env.BASE_URL}cards/${name}.webp`

export const damageRoles: Role[] = [
  { id: 'simple-citizen', name: 'شهروند ساده', side: 'citizen', cardImage: img('simple-citizen') },
  { id: 'mafia-boss', name: 'رئیس مافیا', side: 'mafia', cardImage: img('mafia-boss') },
  { id: 'poisoner', name: 'سم‌ساز', side: 'mafia', cardImage: img('poisoner') },
  { id: 'chaos-maker', name: 'آشوب‌گر', side: 'mafia', cardImage: img('chaos-maker') },
  { id: 'doctor', name: 'طبیب', side: 'citizen', cardImage: img('doctor') },
  { id: 'sage', name: 'حکیم', side: 'citizen', cardImage: img('sage') },
  { id: 'archer', name: 'کمان‌دار', side: 'citizen', cardImage: img('archer') },
  { id: 'wizard', name: 'جادوگر', side: 'citizen', cardImage: img('wizard') },
  { id: 'roulette-man', name: 'رولت من', side: 'citizen', cardImage: img('roulette-man') },
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
