import type { Assignment, Game, HpEvent, Phase } from './types'

export function applyHpChange(game: Game, playerId: string, delta: number, reason = ''): Game {
  if (!Number.isFinite(delta) || delta === 0) return game
  const current = game.assignments.find(a => a.playerId === playerId)
  if (!current) return game
  const before = current.hp
  const after = Math.max(0, before + delta)
  if (after === before) return game
  const event: HpEvent = {
    id: crypto.randomUUID(), playerId, delta: after - before, hpBefore: before, hpAfter: after,
    phase: { ...game.phase }, at: Date.now(), ...(reason.trim() ? { reason: reason.trim() } : {}),
  }
  const assignment: Assignment = { ...current, hp: after, status: after === 0 ? 'dead' : 'alive' }
  if (after === 0 && before > 0) assignment.death = { phase: { ...game.phase }, announced: game.phase.kind === 'day' || game.phase.kind === 'intro-day' }
  if (after > 0) delete assignment.death
  return { ...game, assignments: game.assignments.map(a => a.playerId === playerId ? assignment : a), hpEvents: [...game.hpEvents, event] }
}

export function undoLastHpChange(game: Game, playerId: string): Game {
  const target = [...game.hpEvents].reverse().find(e => e.playerId === playerId && !e.undoOf && !game.hpEvents.some(x => x.undoOf === e.id))
  if (!target) return game
  const current = game.assignments.find(a => a.playerId === playerId)
  if (!current) return game
  const before = current.hp
  const after = Math.max(0, target.hpBefore)
  const event: HpEvent = { id: crypto.randomUUID(), playerId, delta: after - before, hpBefore: before, hpAfter: after, phase: { ...game.phase }, at: Date.now(), reason: 'بازگردانی تغییر قبلی', undoOf: target.id }
  const assignment: Assignment = { ...current, hp: after, status: after === 0 ? 'dead' : 'alive' }
  if (after > 0) delete assignment.death
  else if (!assignment.death) assignment.death = { phase: { ...game.phase }, announced: game.phase.kind === 'day' || game.phase.kind === 'intro-day' }
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
