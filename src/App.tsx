import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowLeft, ArrowRight, Check, ChevronLeft, CircleHelp, Clock3, Heart, Minus, Moon, Plus, RotateCcw, Shield, Skull, Sun, Users, X } from 'lucide-react'
import type { Game, Phase, Player } from './domain/types'
import { applyHpChange, nextPhase, undoLastHpChange } from './domain/hp'
import { buildRoleDeck, canAssignRole, makeAssignments } from './domain/roleAssignment'
import { loadGame, saveGame } from './state/storage'
import { damageScenario, damageRoles } from './scenarios/damage'

const initialNames = Array.from({ length: 10 }, (_, i) => `بازیکن ${i + 1}`)
const makeId = () => crypto.randomUUID()
const shuffled = <T,>(items: T[]): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
const phaseLabel = (phase: Phase) => {
  if (phase.kind === 'intro-day') return 'روز معارفه'
  if (phase.kind === 'intro-night') return 'شب معارفه'
  return `${phase.kind === 'day' ? 'روز' : 'شب'} ${phase.number}`
}
const roleMap = Object.fromEntries(damageRoles.map(role => [role.id, role]))
const hpCauses = [
  { id: 'challenge', label: 'روز · چالش (۵ دمیج)', delta: -5, amount: '5', mode: 'damage' as const },
  { id: 'chaos-vote', label: 'روز · آشوب‌گر (۱۰ دمیج به‌ازای هر رأی)', delta: -10, amount: '10', mode: 'damage' as const },
  { id: 'vote-duel', label: 'روز · رأی دو / رأی‌گیری (۲۰ دمیج)', delta: -20, amount: '20', mode: 'damage' as const },
  { id: 'boss-shot', label: 'شب · شات رئیس مافیا (۱۰۰ دمیج)', delta: -100, amount: '100', mode: 'damage' as const },
  { id: 'archer-shot', label: 'شب · شات کمان‌دار (۷۵ دمیج)', delta: -75, amount: '75', mode: 'damage' as const },
  { id: 'poison', label: 'شب · سم‌ساز (مقدار دلخواه)', amount: '', mode: 'damage' as const },
  { id: 'healer', label: 'شب · هیلر / طبیب (افزایش HP)', amount: '', mode: 'heal' as const },
  { id: 'sage-heal', label: 'شب · حکیم (۵+ HP)', delta: 5, amount: '5', mode: 'heal' as const },
  { id: 'wizard-box', label: 'روز · جعبه جادوگر (۵۰ دمیج)', delta: -50, amount: '50', mode: 'damage' as const },
  { id: 'roulette', label: 'رولت روسی · همسان‌سازی HP دو بازیکن', amount: '', mode: 'damage' as const },
  { id: 'manual', label: 'سایر / تغییر دستی', amount: '', mode: 'damage' as const },
]
type Screen = 'setup' | 'deal' | 'reveal' | 'game' | 'history'

export default function App() {
  const [game, setGame] = useState<Game | null>(() => loadGame())
  const [screen, setScreen] = useState<Screen>(() => { const saved = loadGame(); return saved?.status === 'running' ? 'game' : saved?.status === 'dealing' ? (saved.dealMode === 'random' && saved.assignments.length > 0 ? 'reveal' : 'deal') : 'setup' })
  const [names, setNames] = useState<string[]>(() => loadGame()?.players.map(p => p.name) ?? initialNames)
  const [selectedPlayerId, setSelectedPlayerId] = useState(() => loadGame()?.selectedPlayerId ?? '')
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [revealedRoleId, setRevealedRoleId] = useState(() => { const saved = loadGame(); return saved?.assignments.find(a => a.playerId === saved.selectedPlayerId)?.roleId ?? '' })
  const [showCard, setShowCard] = useState(false)
  const [hpPlayerId, setHpPlayerId] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [selectedCauseId, setSelectedCauseId] = useState('')
  const [roulettePartnerId, setRoulettePartnerId] = useState('')
  const [customMode, setCustomMode] = useState<'damage' | 'heal'>('damage')
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState('')
  const [phaseMenu, setPhaseMenu] = useState(false)
  const [randomDealing, setRandomDealing] = useState(() => { const saved = loadGame(); return saved?.status === 'dealing' && saved.dealMode === 'random' })
  const [randomRevealQueue, setRandomRevealQueue] = useState<string[]>(() => loadGame()?.revealQueue ?? [])

  useEffect(() => { saveGame(game) }, [game])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2300); return () => window.clearTimeout(timer) }, [toast])

  const players = game?.players ?? []
  const assignments = game?.assignments ?? []
  const assignedCount = assignments.length
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    assignments.forEach(a => { counts[a.roleId] = (counts[a.roleId] ?? 0) + 1 })
    return counts
  }, [assignments])
  const selectedPlayer = players.find(p => p.id === hpPlayerId)
  const selectedAssignment = assignments.find(a => a.playerId === hpPlayerId)
  const hpEvents = game?.hpEvents ?? []
  const aliveCount = assignments.filter(a => a.status === 'alive').length
  const deadCount = assignments.filter(a => a.status === 'dead').length

  function startGame() {
    const cleaned = names.map((n, i) => n.trim() || `بازیکن ${i + 1}`)
    const p: Player[] = cleaned.map(name => ({ id: makeId(), name }))
    const next: Game = { id: makeId(), scenarioId: damageScenario.id, players: p, assignments: [], phase: { kind: 'intro-day', number: 0 }, status: 'dealing', hpEvents: [], dealMode: 'manual' }
    setGame(next); setScreen('deal'); setSelectedPlayerId(p[0].id); setSelectedRoleId(''); setToast('بازیکنان ثبت شدند')
  }

  function assignRole() {
    if (!game || !selectedPlayerId || !selectedRoleId) return
    if (assignments.some(a => a.playerId === selectedPlayerId)) { setToast('این بازیکن نقش دریافت کرده است'); return }
    const used = assignments.map(a => a.roleId)
    if (!canAssignRole(damageScenario, used, selectedRoleId, players.length)) { setToast('ظرفیت این نقش تکمیل شده است'); return }
    const roleIds = [...used, selectedRoleId]
    const newAssignment = makeAssignments([players.find(p => p.id === selectedPlayerId)!], [selectedRoleId], damageScenario.settings.initialHp)[0]
    setGame({ ...game, assignments: [...assignments, newAssignment], status: roleIds.length === players.length ? 'running' : 'dealing' })
    setRevealedRoleId(selectedRoleId); setShowCard(false); setScreen('reveal')
  }

  function startRandomDealing() {
    if (!game || assignments.length > 0) return
    const playerOrder = shuffled(players)
    const roleIds = shuffled(buildRoleDeck(damageScenario))
    const allAssignments = makeAssignments(playerOrder, roleIds, damageScenario.settings.initialHp)
    setGame({ ...game, assignments: allAssignments, status: 'dealing', phase: { kind: 'intro-day', number: 0 }, dealMode: 'random', selectedPlayerId: playerOrder[0]?.id, revealQueue: playerOrder.slice(1).map(player => player.id) })
    const queue = playerOrder.map(player => player.id)
    setRandomRevealQueue(queue.slice(1))
    setRandomDealing(true)
    setSelectedPlayerId(queue[0] ?? '')
    setRevealedRoleId(allAssignments.find(a => a.playerId === queue[0])?.roleId ?? '')
    setShowCard(false)
    setScreen('reveal')
    setToast('نقش‌ها به‌صورت تصادفی تخصیص داده شدند')
  }

  function finishReveal() {
    setShowCard(false)
    if (!game) return
    if (randomDealing) {
      const nextPlayerId = randomRevealQueue[0]
      if (nextPlayerId) {
        setRandomRevealQueue(queue => queue.slice(1))
        setSelectedPlayerId(nextPlayerId)
        setGame({ ...game, selectedPlayerId: nextPlayerId, revealQueue: randomRevealQueue.slice(1) })
        setRevealedRoleId(game.assignments.find(a => a.playerId === nextPlayerId)?.roleId ?? '')
        return
      }
      setRandomDealing(false)
      setRandomRevealQueue([])
      setRevealedRoleId('')
      setGame({ ...game, status: 'running', phase: { kind: 'intro-day', number: 0 }, dealMode: undefined, selectedPlayerId: undefined, revealQueue: undefined })
      setScreen('game')
      setToast('تقسیم نقش‌ها کامل شد؛ روز معارفه شروع شد')
      return
    }
    setRevealedRoleId('')
    const nextUnassigned = players.find(p => !game.assignments.some(a => a.playerId === p.id))
    if (nextUnassigned) { setSelectedPlayerId(nextUnassigned.id); setSelectedRoleId(''); setScreen('deal') }
    else { setGame({ ...game, status: 'running', phase: { kind: 'intro-day', number: 0 } }); setScreen('game'); setToast('روز معارفه شروع شد') }
  }

  function restartDealing() {
    if (!game) return
    setGame({ ...game, assignments: [], hpEvents: [], status: 'dealing', phase: { kind: 'intro-day', number: 0 }, dealMode: 'manual', selectedPlayerId: players[0]?.id, revealQueue: undefined })
    setRandomDealing(false); setRandomRevealQueue([])
    setSelectedPlayerId(players[0]?.id ?? ''); setSelectedRoleId(''); setConfirmReset(false); setScreen('deal'); setToast('تقسیم نقش از ابتدا شروع شد')
  }

  function changeHp(delta: number, reason = '') {
    if (!game || !hpPlayerId) return
    const next = applyHpChange(game, hpPlayerId, delta, reason)
    if (next === game) { setToast('تغییری اعمال نشد'); return }
    setGame(next); setCustomAmount(''); setCustomReason(''); setSelectedCauseId('')
    const a = next.assignments.find(item => item.playerId === hpPlayerId)
    setToast(a?.status === 'dead' ? 'بازیکن به HP صفر رسید' : `HP جدید: ${a?.hp}`)
  }

  function applyRoulette() {
    if (!game || !hpPlayerId || !roulettePartnerId || roulettePartnerId === hpPlayerId) {
      setToast('بازیکن دوم رولت را انتخاب کن')
      return
    }
    const first = game.assignments.find(a => a.playerId === hpPlayerId)
    const second = game.assignments.find(a => a.playerId === roulettePartnerId)
    const firstPlayer = game.players.find(p => p.id === hpPlayerId)
    const secondPlayer = game.players.find(p => p.id === roulettePartnerId)
    if (!first || !second || !firstPlayer || !secondPlayer) return
    const sharedHp = (first.hp + second.hp) / 2
    const reason = `رولت روسی: میانگین HP با ${secondPlayer.name}`
    let next = applyHpChange(game, hpPlayerId, sharedHp - first.hp, reason)
    next = applyHpChange(next, roulettePartnerId, sharedHp - second.hp, `رولت روسی: میانگین HP با ${firstPlayer.name}`)
    if (next === game) {
      setToast('HP دو بازیکن از قبل برابر است')
      return
    }
    setGame(next)
    setCustomReason('')
    setSelectedCauseId('')
    setToast(`HP هر دو بازیکن به ${sharedHp} رسید`)
  }

  function undoHp() {
    if (!game || !hpPlayerId) return
    const next = undoLastHpChange(game, hpPlayerId)
    if (next === game) { setToast('تغییری برای بازگردانی وجود ندارد'); return }
    setGame(next); setToast('آخرین تغییر HP بازگردانده شد')
  }

  function setPhase(phase: Phase) {
    if (!game) return
    setGame({ ...game, phase })
    setPhaseMenu(false)
  }

  const largeScreenNotice = <div className="hidden min-h-dvh items-center justify-center p-8 text-center sm:flex"><div className="max-w-sm"><div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-violet-500/15 text-violet-300"><Activity size={30}/></div><h1 className="text-xl font-black">Noir</h1><p className="mt-3 leading-7 text-zinc-400">این ابزار برای استفاده در موبایل طراحی شده است. لطفاً با گوشی وارد شوید.</p></div></div>

  return <>
    <div className="mobile-shell block sm:hidden">
      <header className="flex items-center justify-between px-5 pb-4 pt-5">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-950/40"><Activity size={21}/></div><div><div className="text-sm font-black tracking-wide">NOIR <span className="text-violet-300">MAFIA</span></div><div className="mt-0.5 text-[10px] text-zinc-500">پنل اختصاصی گرداننده</div></div></div>
        {game && <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">{game.phase.kind === 'day' || game.phase.kind === 'intro-day' ? <Sun className="ml-1 inline text-amber-300" size={13}/> : <Moon className="ml-1 inline text-indigo-300" size={13}/>} {phaseLabel(game.phase)}</div>}
      </header>

      {screen === 'setup' && <main className="px-5 pb-10">
        <div className="relative mt-3 overflow-hidden rounded-[28px] border border-violet-300/15 bg-gradient-to-br from-violet-950/70 via-[#171522] to-[#111218] p-5">
          <div className="absolute -left-8 -top-10 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl"/><div className="relative"><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-400/10 px-3 py-1.5 text-[11px] font-bold text-violet-200"><Shield size={13}/> ابزار مدیریت بازی</div><h1 className="text-3xl font-black leading-tight">میز گرداننده<br/><span className="text-violet-300">دمیج</span></h1><p className="mt-3 max-w-[260px] text-sm leading-6 text-zinc-400">مدیریت بازی مافیا، پخش دستی یا تصادفی نقش‌ها و کنترل HP بازیکنان.</p><div className="mt-5 flex gap-2"><span className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">۱۰ بازیکن</span><span className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">HP اولیه: ۱۰۰</span></div></div>
        </div>
        <div className="mb-3 mt-7 flex items-center justify-between"><h2 className="font-bold">نام بازیکن‌ها</h2><span className="text-xs text-zinc-500">۱۰ نفر</span></div>
        <div className="space-y-2">{names.map((name, i) => <label key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 focus-within:border-violet-400/50"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-xs font-bold text-zinc-400">{String(i + 1).padStart(2, '0')}</span><input value={name} onChange={e => setNames(old => old.map((v, idx) => idx === i ? e.target.value : v))} maxLength={28} aria-label={`نام بازیکن ${i+1}`} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600" placeholder={`نام بازیکن ${i+1}`}/></label>)}</div>
        <button onClick={startGame} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 py-4 font-bold text-white shadow-lg shadow-violet-950/40 active:scale-[.99]">شروع و تقسیم نقش <ArrowLeft size={18}/></button>
        <p className="mt-3 text-center text-[11px] leading-5 text-zinc-600">اطلاعات این نسخه روی همین مرورگر ذخیره می‌شود.</p>
      </main>}

      {screen === 'deal' && game && <main className="px-5 pb-10">
        <div className="mb-5 mt-3 flex items-end justify-between"><div><p className="text-xs font-bold text-violet-300">مرحله ۱ از ۲</p><h1 className="mt-1 text-2xl font-black">تقسیم نقش‌ها</h1><p className="mt-2 text-sm text-zinc-500">روش تقسیم را انتخاب کن؛ در هر دو حالت کارت‌ها محرمانه نمایش داده می‌شوند.</p></div><div className="text-left"><div className="text-2xl font-black tabular-nums">{assignedCount}<span className="text-zinc-600">/10</span></div><div className="text-[10px] text-zinc-500">تقسیم‌شده</div></div></div>
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-400 transition-all" style={{width:`${assignedCount * 10}%`}}/></div>
        {assignedCount === 0 && <button onClick={startRandomDealing} className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/25 bg-violet-400/10 py-4 font-bold text-violet-100"><Activity size={17}/> پخش تصادفی نقش‌ها</button>}
        <div className="mb-3 mt-5"><h2 className="text-sm font-bold">یا تقسیم دستی</h2><p className="mt-1 text-xs text-zinc-500">بازیکن و نقش موردنظر را خودت انتخاب کن.</p></div>
        <section className="mb-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4"><h2 className="mb-3 text-sm font-bold">۱. انتخاب بازیکن</h2><div className="grid grid-cols-2 gap-2">{players.map((p, i) => { const assigned = assignments.some(a => a.playerId === p.id); const active = selectedPlayerId === p.id; return <button key={p.id} disabled={assigned} onClick={() => setSelectedPlayerId(p.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-right text-sm transition ${assigned ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-zinc-600' : active ? 'border-violet-400/60 bg-violet-500/15 text-white' : 'border-white/[0.07] bg-black/10 text-zinc-300'}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-[10px]">{assigned ? <Check size={14} className="text-emerald-400"/> : i+1}</span><span className="min-w-0 flex-1 truncate">{p.name}</span></button>})}</div></section>
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">۲. انتخاب کارت نقش</h2><span className="text-[10px] text-zinc-500">باقی‌مانده</span></div><div className="space-y-2">{damageScenario.roles.map(({roleId, count}) => { const role = roleMap[roleId]; const left = count - (roleCounts[roleId] ?? 0); const active = selectedRoleId === roleId; return <button key={roleId} disabled={left <= 0} onClick={() => setSelectedRoleId(roleId)} className={`flex w-full items-center gap-3 rounded-2xl border p-2 text-right transition ${left <= 0 ? 'border-white/[0.04] opacity-35' : active ? 'border-violet-400/60 bg-violet-500/10' : 'border-white/[0.06] bg-black/10'}`}><img src={role.cardImage} alt="" className="h-14 w-10 rounded-lg bg-black/30 object-cover"/><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{role.name}</span><span className={`mt-1 block text-[10px] ${role.side === 'mafia' ? 'text-rose-300' : 'text-sky-300'}`}>{role.side === 'mafia' ? 'مافیا' : 'شهروند'}</span></span><span className={`grid h-8 min-w-8 place-items-center rounded-xl text-xs font-bold ${left > 0 ? 'bg-white/[0.07] text-zinc-300' : 'bg-white/[0.03] text-zinc-600'}`}>{left}</span>{active && <Check size={16} className="text-violet-300"/>}</button>})}</div>
        <button disabled={!selectedPlayerId || !selectedRoleId} onClick={assignRole} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">نمایش کارت به بازیکن <ArrowLeft size={17}/></button></section>
        <button onClick={() => setConfirmReset(true)} className="mt-4 flex w-full items-center justify-center gap-2 py-3 text-xs text-zinc-500"><RotateCcw size={14}/> شروع دوباره تقسیم نقش</button>
      </main>}

      {screen === 'reveal' && <main className="flex min-h-[calc(100dvh-80px)] flex-col items-center px-6 pb-8 pt-4 text-center"><div className="mb-6 w-full"><div className="text-xs font-bold text-violet-300">نمایش محرمانه نقش</div><h1 className="mt-2 text-2xl font-black">{players.find(p => p.id === selectedPlayerId)?.name ?? 'بازیکن'}</h1><p className="mt-1 text-sm text-zinc-400">کارت را لمس کن و نگه دار</p><p className="mt-2 text-sm leading-6 text-zinc-500">گوشی را به بازیکن بده. با برداشتن انگشت، کارت پنهان می‌شود.</p></div><div className="relative flex w-full max-w-[290px] flex-1 items-center justify-center"><button aria-label="برای مشاهده کارت انگشت را نگه دارید" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setShowCard(true) }} onPointerUp={() => setShowCard(false)} onPointerCancel={() => setShowCard(false)} onContextMenu={e => e.preventDefault()} className="relative aspect-[2/3] w-full overflow-hidden rounded-[26px] border border-violet-300/20 bg-gradient-to-br from-[#211b38] via-[#14131e] to-[#0f1018] shadow-2xl shadow-violet-950/30 select-none">{showCard ? <img src={roleMap[revealedRoleId]?.cardImage} alt="کارت نقش بازیکن" className="card-image h-full w-full" draggable={false}/> : <div className="flex h-full flex-col items-center justify-center p-7"><div className="grid h-20 w-20 place-items-center rounded-3xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><Shield size={38}/></div><div className="mt-7 text-lg font-black tracking-widest">NOIR</div><div className="mt-1 text-[10px] tracking-[.3em] text-violet-200/70">SECRET ROLE</div><div className="mt-12 flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-xs text-zinc-300"><span className="h-2 w-2 animate-pulse rounded-full bg-violet-300"/> لمس طولانی برای نمایش</div></div>}</button></div><button onClick={finishReveal} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-4 font-bold">پایان مشاهده و ادامه <Check size={17}/></button><p className="mt-3 text-[10px] text-zinc-600">این صفحه فقط کارت نقش را نمایش می‌دهد.</p></main>}

      {screen === 'game' && game && <main className="px-4 pb-28">
        <div className="mb-5 mt-2 flex items-end justify-between"><div><p className="text-xs font-bold text-violet-300">بازی در حال اجرا</p><h1 className="mt-1 text-2xl font-black">وضعیت بازیکنان</h1><p className="mt-1 text-xs text-zinc-500">مدیریت HP و ثبت اتفاقات بازی</p></div><button onClick={() => setPhaseMenu(v => !v)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs"><Clock3 size={14}/>{phaseLabel(game.phase)}<ChevronLeft size={13}/></button></div>
        {phaseMenu && <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#171820] p-2"><button onClick={() => setPhase({kind: 'intro-day', number: 0})} className="rounded-xl bg-amber-400/10 py-3 text-xs text-amber-200"><Sun className="ml-1 inline" size={15}/> روز معارفه</button><button onClick={() => setPhase({kind: 'intro-night', number: 0})} className="rounded-xl bg-indigo-400/10 py-3 text-xs text-indigo-200"><Moon className="ml-1 inline" size={15}/> شب معارفه</button><button onClick={() => setPhase({kind: 'day', number: 1})} className="rounded-xl bg-amber-400/10 py-3 text-xs text-amber-200">روز ۱</button><button onClick={() => setPhase({kind: 'night', number: 1})} className="rounded-xl bg-indigo-400/10 py-3 text-xs text-indigo-200">شب ۱</button><button onClick={() => setGame(current => current ? {...current, phase: nextPhase(current.phase)} : current)} className="col-span-2 rounded-xl bg-white/[0.05] py-3 text-xs text-zinc-300">رفتن به مرحله بعد <ArrowLeft className="mr-1 inline" size={13}/></button></div>}
        {(game.phase.kind === 'intro-day' || game.phase.kind === 'intro-night') && <div className="mb-4 rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-4"><div className="text-sm font-bold text-violet-200">{game.phase.kind === 'intro-day' ? 'روز معارفه' : 'شب معارفه'}</div><p className="mt-2 text-xs leading-6 text-zinc-400">{game.phase.kind === 'intro-day' ? 'روز معارفه فقط برای معرفی و آماده‌سازی است؛ رأی‌گیری و چالش نداریم. پس از آن وارد شب معارفه می‌شوید.' : 'در شب معارفه مافیاها فقط یکدیگر را می‌شناسند؛ اقدام یا قابلیت دیگری در این مرحله اجرا نمی‌شود. سپس بازی با روز ۱ ادامه پیدا می‌کند.'}</p></div>}
        <div className="mb-4 grid grid-cols-3 gap-2"><div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"><Users className="mb-2 text-zinc-400" size={16}/><div className="text-xl font-black">{players.length}</div><div className="mt-1 text-[10px] text-zinc-500">بازیکن</div></div><div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-3"><Heart className="mb-2 text-emerald-300" size={16}/><div className="text-xl font-black">{aliveCount}</div><div className="mt-1 text-[10px] text-zinc-500">زنده</div></div><div className="rounded-2xl border border-rose-400/10 bg-rose-400/[0.04] p-3"><Skull className="mb-2 text-rose-300" size={16}/><div className="text-xl font-black">{deadCount}</div><div className="mt-1 text-[10px] text-zinc-500">HP صفر</div></div></div>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">بازیکنان</h2><button onClick={() => setScreen('history')} className="text-xs text-violet-300">سوابق تغییرات <ArrowLeft className="mr-1 inline" size={13}/></button></div>
        <div className="space-y-2">{players.map((p) => { const a = assignments.find(x => x.playerId === p.id); if (!a) return null; const role = roleMap[a.roleId]; const isLow = a.hp <= 30; return <button key={p.id} onClick={() => {setHpPlayerId(p.id); setCustomMode('damage'); setRoulettePartnerId('')}} className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-right active:bg-white/[0.05]"><div className="flex items-center gap-3"><img src={role.cardImage} alt="" className="h-14 w-10 rounded-lg bg-black/30 object-cover"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate text-sm font-bold">{p.name}</span>{a.status === 'dead' && <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[9px] text-rose-300">HP صفر</span>}</div><div className="mt-1 text-[11px] text-zinc-500">{role.name} <span className="mx-1 text-zinc-700">•</span><span className={role.side === 'mafia' ? 'text-rose-300' : 'text-sky-300'}>{role.side === 'mafia' ? 'مافیا' : 'شهروند'}</span></div></div><div className="text-left"><div className={`text-xl font-black tabular-nums ${a.hp === 0 ? 'text-rose-300' : isLow ? 'text-amber-300' : 'text-emerald-300'}`}>{a.hp}<span className="mr-1 text-[10px] font-medium text-zinc-500">HP</span></div><div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${a.hp === 0 ? 'bg-rose-400' : isLow ? 'bg-amber-300' : 'bg-emerald-400'}`} style={{width:`${Math.min(100,a.hp)}%`}}/></div></div><ChevronLeft size={16} className="text-zinc-600"/></div></button>})}</div>
        <button onClick={() => setConfirmReset(true)} className="mt-6 flex w-full items-center justify-center gap-2 py-3 text-xs text-zinc-600"><RotateCcw size={13}/> شروع بازی جدید</button>
      </main>}

      {screen === 'history' && game && <main className="px-5 pb-10"><div className="mb-5 mt-3 flex items-center gap-3"><button onClick={() => setScreen('game')} className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05]"><ArrowRight size={18}/></button><div><h1 className="text-xl font-black">سوابق HP</h1><p className="mt-1 text-xs text-zinc-500">تغییرات ثبت‌شده به ترتیب زمانی</p></div></div>{hpEvents.length === 0 ? <div className="rounded-3xl border border-white/[0.07] p-8 text-center"><Activity className="mx-auto mb-3 text-zinc-600" size={28}/><p className="text-sm text-zinc-400">هنوز تغییری ثبت نشده است.</p></div> : <div className="space-y-2">{[...hpEvents].reverse().map(e => { const p = players.find(x => x.id === e.playerId); return <div key={e.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><div className="flex items-center justify-between gap-2"><div className="text-sm font-bold">{p?.name ?? 'بازیکن'}</div><span className={`text-sm font-black ${e.delta < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{e.delta > 0 ? '+' : ''}{e.delta} HP</span></div><div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500"><span>{phaseLabel(e.phase)} · {e.reason || 'تغییر دستی'}</span><span>{e.hpBefore} ← {e.hpAfter}</span></div>{e.undoOf && <div className="mt-2 text-[10px] text-amber-300">رویداد جبرانی (Undo)</div>}</div>})}</div>}</main>}

      {hpPlayerId && selectedPlayer && selectedAssignment && screen === 'game' && <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setHpPlayerId('')}><section onClick={e => e.stopPropagation()} className="w-full max-w-[480px] rounded-t-[30px] border border-white/10 bg-[#15161e] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl"><div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15"/><div className="mb-5 flex items-center gap-3"><img src={roleMap[selectedAssignment.roleId].cardImage} alt="" className="h-16 w-12 rounded-xl object-cover"/><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-black">{selectedPlayer.name}</h2><p className="mt-1 text-xs text-zinc-500">{roleMap[selectedAssignment.roleId].name}</p></div><button onClick={() => setHpPlayerId('')} className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]"><X size={17}/></button></div><div className="mb-5 rounded-2xl bg-black/20 p-4 text-center"><div className="text-xs text-zinc-500">HP فعلی</div><div className={`mt-1 text-4xl font-black tabular-nums ${selectedAssignment.hp === 0 ? 'text-rose-300' : 'text-emerald-300'}`}>{selectedAssignment.hp}</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${selectedAssignment.hp <= 30 ? 'bg-amber-300' : 'bg-emerald-400'}`} style={{width:`${Math.min(100,selectedAssignment.hp)}%`}}/></div></div><label className="mb-2 block text-xs font-bold text-zinc-300" htmlFor="hp-cause">علت تغییر HP</label><select id="hp-cause" value={selectedCauseId} onChange={e => { const cause = hpCauses.find(item => item.id === e.target.value); setSelectedCauseId(e.target.value); setCustomReason(cause?.label ?? ''); setCustomMode(cause?.mode ?? 'damage'); setCustomAmount(cause?.amount ?? '') }} className="mb-3 w-full rounded-xl border border-white/10 bg-[#20212b] px-3 py-3 text-xs text-zinc-100 outline-none focus:border-violet-400/50"><option value="">انتخاب علت (اختیاری)</option><optgroup label="روز">{hpCauses.filter(c => c.label.startsWith('روز')).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup><optgroup label="شب">{hpCauses.filter(c => c.label.startsWith('شب')).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup><optgroup label="سایر">{hpCauses.filter(c => !c.label.startsWith('روز') && !c.label.startsWith('شب')).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</optgroup></select>{selectedCauseId === 'chaos-vote' && <p className="-mt-1 mb-3 text-[10px] leading-5 text-amber-200/80">برای چند رأی، مقدار را برابر ۱۰ × تعداد رأی وارد کن؛ مثلاً ۳ رأی = ۳۰ دمیج.</p>}{selectedCauseId === 'roulette' && <div className="mb-3 rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-3"><p className="mb-2 text-xs leading-5 text-violet-100">بازیکن دوم را انتخاب کن؛ HP این دو بازیکن با هم جمع و بر ۲ تقسیم می‌شود و هر دو دقیقاً به میانگین می‌رسند.</p><select value={roulettePartnerId} onChange={e => setRoulettePartnerId(e.target.value)} className="mb-2 w-full rounded-xl border border-white/10 bg-[#20212b] px-3 py-3 text-xs text-zinc-100"><option value="">انتخاب بازیکن دوم</option>{players.filter(p => p.id !== hpPlayerId).map(p => { const a = assignments.find(item => item.playerId === p.id); return <option key={p.id} value={p.id}>{p.name} · HP {a?.hp ?? '—'}</option> })}</select><button onClick={applyRoulette} disabled={!roulettePartnerId || roulettePartnerId === hpPlayerId} className="w-full rounded-xl bg-violet-500 py-3 text-xs font-bold disabled:opacity-40">محاسبه و یکسان‌کردن HP</button></div>}{selectedCauseId !== 'roulette' && <div className="mb-3 grid grid-cols-5 gap-2">{[5,10,20,40,100].map(n => <button key={n} onClick={() => changeHp(-n, customReason || `کسر سریع ${n}`)} className="rounded-xl border border-rose-400/10 bg-rose-400/[0.06] py-3 text-xs font-bold text-rose-200">−{n}</button>)}</div>}{selectedCauseId !== 'roulette' && <><div className="mb-4 grid grid-cols-2 gap-2"><button onClick={() => setCustomMode('damage')} className={`rounded-xl py-2.5 text-xs font-bold ${customMode === 'damage' ? 'bg-rose-400/15 text-rose-200' : 'bg-white/[0.04] text-zinc-500'}`}><Minus className="ml-1 inline" size={14}/> کسر دلخواه</button><button onClick={() => setCustomMode('heal')} className={`rounded-xl py-2.5 text-xs font-bold ${customMode === 'heal' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/[0.04] text-zinc-500'}`}><Plus className="ml-1 inline" size={14}/> افزایش دلخواه</button></div><div className="flex gap-2"><input type="number" min="1" value={customAmount} onChange={e => setCustomAmount(e.target.value)} placeholder="مقدار HP" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none focus:border-violet-400/50"/><button disabled={!customAmount || Number(customAmount) <= 0} onClick={() => changeHp((customMode === 'damage' ? -1 : 1) * Number(customAmount), customReason || (customMode === 'damage' ? 'کسر دلخواه' : 'افزایش دلخواه'))} className="rounded-xl bg-violet-500 px-5 text-sm font-bold disabled:opacity-40">ثبت تغییر</button></div><input value={customReason} onChange={e => setCustomReason(e.target.value)} placeholder="توضیح تکمیلی برای علت (اختیاری)" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs outline-none focus:border-violet-400/50"/></>}<div className="mt-4 flex items-center justify-between"><button onClick={undoHp} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-zinc-400"><RotateCcw size={13}/> بازگردانی آخرین تغییر</button><span className="text-[10px] text-zinc-600">{game ? phaseLabel(game.phase) : ''}</span></div></section></div>}

      {confirmReset && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#181922] p-5"><div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-rose-400/10 text-rose-300"><CircleHelp size={22}/></div><h2 className="text-lg font-black">از ابتدا شروع شود؟</h2><p className="mt-2 text-sm leading-6 text-zinc-400">تقسیم نقش‌ها، HP و سوابق فعلی پاک می‌شوند. این کار قابل بازگشت نیست.</p><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setConfirmReset(false)} className="rounded-xl bg-white/[0.06] py-3 text-sm font-bold">انصراف</button><button onClick={() => { if (screen === 'deal') restartDealing(); else { setGame(null); setNames(initialNames); setScreen('setup'); setHpPlayerId(''); setConfirmReset(false) } }} className="rounded-xl bg-rose-500 py-3 text-sm font-bold">تأیید و شروع</button></div></div></div>}
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#252631] px-4 py-3 text-xs font-bold shadow-2xl">{toast}</div>}
      <div className="safe-bottom"/>
    </div>
    {largeScreenNotice}
  </>
}
