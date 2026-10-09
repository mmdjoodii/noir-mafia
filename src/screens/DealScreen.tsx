import { Activity, ArrowLeft, Check, RotateCcw } from "lucide-react";
import type { Assignment, Player, Scenario } from "../domain/types";
import { rolesById as roleMap } from "../scenarios";

export function DealScreen({
  players,
  assignments,
  assignedCount,
  startRandomDealing,
  assignRole,
  selectedPlayerId,
  setSelectedPlayerId,
  selectedRoleId,
  setSelectedRoleId,
  scenario,
  roleCounts,
  setConfirmReset,
}: {
  players: Player[];
  assignments: Assignment[];
  assignedCount: number;
  startRandomDealing: () => void;
  assignRole: () => void;
  selectedPlayerId: string;
  setSelectedPlayerId: (id: string) => void;
  selectedRoleId: string;
  setSelectedRoleId: (id: string) => void;
  scenario: Scenario;
  roleCounts: Record<string, number>;
  setConfirmReset: (v: boolean) => void;
}) {
  return (
    <main className="px-5 pb-10">
      <div className="mb-5 mt-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-violet-300">مرحله ۱ از ۲</p>
          <h1 className="mt-1 text-2xl font-black">تقسیم نقش‌ها</h1>
          <p className="mt-2 text-sm text-zinc-500">
            روش تقسیم را انتخاب کن؛ در هر دو حالت کارت‌ها محرمانه نمایش داده
            می‌شوند.
          </p>
        </div>
        <div className="text-left">
          <div className="text-2xl font-black tabular-nums">
            {assignedCount}
            <span className="text-zinc-600">/10</span>
          </div>
          <div className="text-[10px] text-zinc-500">تقسیم‌شده</div>
        </div>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-violet-400 transition-all"
          style={{ width: `${assignedCount * 10}%` }}
        />
      </div>
      {assignedCount === 0 && (
        <button
          onClick={startRandomDealing}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/25 bg-violet-400/10 py-4 font-bold text-violet-100"
        >
          <Activity size={17} /> پخش تصادفی نقش‌ها
        </button>
      )}
      <div className="mb-3 mt-5">
        <h2 className="text-sm font-bold">یا تقسیم دستی</h2>
        <p className="mt-1 text-xs text-zinc-500">
          بازیکن و نقش موردنظر را خودت انتخاب کن.
        </p>
      </div>
      <section className="mb-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4">
        <h2 className="mb-3 text-sm font-bold">۱. انتخاب بازیکن</h2>
        <div className="grid grid-cols-2 gap-2">
          {players.map((p, i) => {
            const assigned = assignments.some((a) => a.playerId === p.id);
            const active = selectedPlayerId === p.id;
            return (
              <button
                key={p.id}
                disabled={assigned}
                onClick={() => setSelectedPlayerId(p.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-right text-sm transition ${assigned ? "border-emerald-500/20 bg-emerald-500/[0.06] text-zinc-600" : active ? "border-violet-400/60 bg-violet-500/15 text-white" : "border-white/[0.07] bg-black/10 text-zinc-300"}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-[10px]">
                  {assigned ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">۲. انتخاب کارت نقش</h2>
          <span className="text-[10px] text-zinc-500">باقی‌مانده</span>
        </div>
        <div className="space-y-2">
          {scenario.roles.map(({ roleId, count }) => {
            const role = roleMap[roleId];
            const left = count - (roleCounts[roleId] ?? 0);
            const active = selectedRoleId === roleId;
            return (
              <button
                key={roleId}
                disabled={left <= 0}
                onClick={() => setSelectedRoleId(roleId)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-2 text-right transition ${left <= 0 ? "border-white/[0.04] opacity-35" : active ? "border-violet-400/60 bg-violet-500/10" : "border-white/[0.06] bg-black/10"}`}
              >
                <img
                  src={role.cardImage}
                  alt=""
                  className="h-14 w-10 rounded-lg bg-black/30 object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{role.name}</span>
                  <span
                    className={`mt-1 block text-[10px] ${role.side === "mafia" ? "text-rose-300" : "text-sky-300"}`}
                  >
                    {role.side === "mafia" ? "مافیا" : "شهروند"}
                  </span>
                </span>
                <span
                  className={`grid h-8 min-w-8 place-items-center rounded-xl text-xs font-bold ${left > 0 ? "bg-white/[0.07] text-zinc-300" : "bg-white/[0.03] text-zinc-600"}`}
                >
                  {left}
                </span>
                {active && <Check size={16} className="text-violet-300" />}
              </button>
            );
          })}
        </div>
        <button
          disabled={!selectedPlayerId || !selectedRoleId}
          onClick={assignRole}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          نمایش کارت به بازیکن <ArrowLeft size={17} />
        </button>
      </section>
      <button
        onClick={() => setConfirmReset(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 py-3 text-xs text-zinc-500"
      >
        <RotateCcw size={14} /> شروع دوباره تقسیم نقش
      </button>
    </main>
  );
}
