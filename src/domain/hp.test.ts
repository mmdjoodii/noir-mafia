import { describe, expect, it } from 'vitest'
import type { Game } from './types'
import { applyHpChange, markAnnounced, nextPhase, pendingAnnouncements, undoLastHpChange } from './hp'

const game = (kind: 'day' | 'night' = 'night'): Game => ({
  id: 'g', scenarioId: 'damage', status: 'running', phase: { kind, number: 1 }, hpEvents: [],
  players: [{ id: 'p', name: 'الف' }],
  assignments: [{ playerId: 'p', roleId: 'doctor', hp: 100, status: 'alive' }],
})
const hp = (g: Game) => g.assignments[0]

describe('HP', () => {
  it('منفی را صفر نمی‌کند و مقدار واقعی را ثبت می‌کند', () => {
    const g = applyHpChange(game(), 'p', -130)
    expect(hp(g).hp).toBe(-30)
    expect(hp(g).status).toBe('dead')
    expect(g.hpEvents[0]).toMatchObject({ delta: -130, hpBefore: 100, hpAfter: -30 })
  })
  it('دقیقاً صفر هم مرگ است', () => expect(hp(applyHpChange(game(), 'p', -100)).status).toBe('dead'))
  it('تغییر صفر یا نامعتبر ثبت نمی‌شود', () => {
    const g = game()
    expect(applyHpChange(g, 'p', 0)).toBe(g)
    expect(applyHpChange(g, 'p', NaN)).toBe(g)
    expect(applyHpChange(g, 'x', -5)).toBe(g)
  })
  it('undo با رویداد جبرانی HP منفی را برمی‌گرداند و سابقه را نگه می‌دارد', () => {
    const g = undoLastHpChange(applyHpChange(game(), 'p', -130), 'p')
    expect(hp(g)).toMatchObject({ hp: 100, status: 'alive' })
    expect(hp(g).death).toBeUndefined()
    expect(g.hpEvents).toHaveLength(2)
    expect(g.hpEvents[1].undoOf).toBe(g.hpEvents[0].id)
    expect(undoLastHpChange(g, 'p')).toBe(g)
  })
})

describe('مرگ و اعلام صبح', () => {
  it('مرگ شب تا روز اعلام نمی‌شود', () => {
    let g = applyHpChange(game('night'), 'p', -100)
    expect(pendingAnnouncements(g)).toHaveLength(0)
    g = { ...g, phase: nextPhase(g.phase) }
    expect(pendingAnnouncements(g)).toHaveLength(1)
    expect(pendingAnnouncements(markAnnounced(g))).toHaveLength(0)
  })
  it('مرگ روز از ابتدا اعلام‌شده است (وصیت)', () => {
    expect(hp(applyHpChange(game('day'), 'p', -100)).death?.announced).toBe(true)
  })
})
