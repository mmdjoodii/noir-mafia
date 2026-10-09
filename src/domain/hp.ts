import type { Assignment, Game, HpEvent, Phase } from './types'
import { makeId } from './id'

const isDayPhase = (p: Phase) => p.kind === 'day' || p.kind === 'intro-day'

/** HP می‌تواند منفی شود؛ مقدار واقعی ثبت می‌شود. HP ≤ ۰ یعنی مرگ. */
export function applyHpChange(game: Game, playerId: string, delta: number, reason = ''): Game {
  if (!Number.isFinite(delta) || delta === 0) return game
  const current = game.assignments.find(a => a.playerId === playerId)
  if (!current) return game
  const before = current.hp
  const after = before + delta
  const event: HpEvent = {
    id: makeId(), playerId, delta, hpBefore: before, hpAfter: after,
    phase: { ...game.phase }, at: Date.now(), ...(reason.trim() ? { reason: reason.trim() } : {}),
  }
  const assignment: Assignment = { ...current, hp: after, status: after <= 0 ? 'dead' : 'alive' }
  if (after <= 0 && before > 0) assignment.death = { phase: { ...game.phase }, announced: isDayPhase(game.phase) }
  if (after > 0) delete assignment.death
  return { ...game, assignments: game.assignments.map(a => a.playerId === playerId ? assignment : a), hpEvents: [...game.hpEvents, event] }
}

/** برگرداندن آخرین تغییرِ برگردانده‌نشده‌ی بازیکن با ثبت رویداد جبرانی؛ سابقه پاک نمی‌شود. */
export function undoLastHpChange(game: Game, playerId: string): Game {
  const undone = new Set(game.hpEvents.flatMap(e => e.undoOf ? [e.undoOf] : []))
  const target = [...game.hpEvents].reverse().find(e => e.playerId === playerId && !e.undoOf && !undone.has(e.id))
  const current = game.assignments.find(a => a.playerId === playerId)
  if (!target || !current) return game
  const after = target.hpBefore
  const event: HpEvent = { id: makeId(), playerId, delta: after - current.hp, hpBefore: current.hp, hpAfter: after, phase: { ...game.phase }, at: Date.now(), reason: 'بازگردانی تغییر قبلی', undoOf: target.id }
  const assignment: Assignment = { ...current, hp: after, status: after <= 0 ? 'dead' : 'alive' }
  if (after > 0) delete assignment.death
  return { ...game, assignments: game.assignments.map(a => a.playerId === playerId ? assignment : a), hpEvents: [...game.hpEvents, event] }
}

export function nextPhase(phase: Phase): Phase {
  switch (phase.kind) {
    case 'intro-day': return { kind: 'intro-night', number: 0 }
    case 'intro-night': return { kind: 'day', number: 1 }
    case 'day': return { kind: 'night', number: phase.number }
    case 'night': return { kind: 'day', number: phase.number + 1 }
  }
}

/** مرگ‌های شبِ اعلام‌نشده؛ فقط وقتی بازی در روز است باید اعلام شوند. */
export function pendingAnnouncements(game: Game): Assignment[] {
  if (!isDayPhase(game.phase)) return []
  return game.assignments.filter(a => a.status === 'dead' && a.death && !a.death.announced)
}

export function markAnnounced(game: Game): Game {
  return { ...game, assignments: game.assignments.map(a => a.death && !a.death.announced ? { ...a, death: { ...a.death, announced: true } } : a) }
}
