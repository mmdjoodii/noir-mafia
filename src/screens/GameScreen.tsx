import { nextPhase } from "../domain/hp";
import type { Dispatch, SetStateAction } from "react";
import {
  ArrowLeft,
  BedDouble,
  TriangleAlert,
  ChevronLeft,
  Clock3,
  Heart,
  Moon,
  RotateCcw,
  Skull,
  Sun,
  Users,
} from "lucide-react";
import type { Screen } from "../lib/format";
import type { Assignment, Game, Phase, Player } from "../domain/types";
import { phaseLabel, statusLabel } from "../lib/format";
import { rolesById as roleMap } from "../scenarios";

export function GameScreen({
  game,
  players,
  assignments,
  setConfirmReset,
  phaseMenu,
  setPhaseMenu,
  setPhase,
  setGame,
  alarm,
  lowest,
  openHp,
  aliveCount,
  comaCount,
  deadCount,
  setListKind,
  setScreen,
  setHpPlayerId,
  setRoulettePartnerId,
  setCustomMode,
}: {
  game: Game;
  players: Player[];
  assignments: Assignment[];
  setConfirmReset: (v: boolean) => void;
  phaseMenu: boolean;
  setPhaseMenu: Dispatch<SetStateAction<boolean>>;
  setPhase: (phase: Phase) => void;
  setGame: Dispatch<SetStateAction<Game | null>>;
  alarm: { active: boolean; low: number; total: number };
  lowest: Assignment[];
  openHp: (id: string) => void;
  aliveCount: number;
  comaCount: number;
  deadCount: number;
  setListKind: (k: "dead" | "coma" | null) => void;
  setScreen: (s: Screen) => void;
  setHpPlayerId: (id: string) => void;
  setRoulettePartnerId: (v: string) => void;
  setCustomMode: (m: "damage" | "heal") => void;
}) {
  return (
    <main className="px-4 pb-28">
      <div className="mb-5 mt-2 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-violet-300">بازی در حال اجرا</p>
          <h1 className="mt-1 text-2xl font-black">وضعیت بازیکنان</h1>
          <p className="mt-1 text-xs text-zinc-500">
            مدیریت HP و ثبت اتفاقات بازی
          </p>
        </div>
        <button
          onClick={() => setPhaseMenu((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs"
        >
          <Clock3 size={14} />
          {phaseLabel(game.phase)}
          <ChevronLeft size={13} />
        </button>
      </div>
      {phaseMenu && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#171820] p-2">
          <button
            onClick={() => setPhase({ kind: "intro-day", number: 0 })}
            className="rounded-xl bg-amber-400/10 py-3 text-xs text-amber-200"
          >
            <Sun className="ml-1 inline" size={15} /> روز معارفه
          </button>
          <button
            onClick={() => setPhase({ kind: "intro-night", number: 0 })}
            className="rounded-xl bg-indigo-400/10 py-3 text-xs text-indigo-200"
          >
            <Moon className="ml-1 inline" size={15} /> شب معارفه
          </button>
          <button
            onClick={() => setPhase({ kind: "day", number: 1 })}
            className="rounded-xl bg-amber-400/10 py-3 text-xs text-amber-200"
          >
            روز ۱
          </button>
          <button
            onClick={() => setPhase({ kind: "night", number: 1 })}
            className="rounded-xl bg-indigo-400/10 py-3 text-xs text-indigo-200"
          >
            شب ۱
          </button>
          <button
            onClick={() =>
              setGame((current) =>
                current
                  ? { ...current, phase: nextPhase(current.phase) }
                  : current,
              )
            }
            className="col-span-2 rounded-xl bg-white/[0.05] py-3 text-xs text-zinc-300"
          >
            رفتن به مرحله بعد <ArrowLeft className="mr-1 inline" size={13} />
          </button>
        </div>
      )}
      {(game.phase.kind === "intro-day" ||
        game.phase.kind === "intro-night") && (
        <div className="mb-4 rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-4">
          <div className="text-sm font-bold text-violet-200">
            {game.phase.kind === "intro-day" ? "روز معارفه" : "شب معارفه"}
          </div>
          <p className="mt-2 text-xs leading-6 text-zinc-400">
            {game.phase.kind === "intro-day"
              ? "روز معارفه فقط برای معرفی و آماده‌سازی است؛ رأی‌گیری و چالش نداریم. پس از آن وارد شب معارفه می‌شوید."
              : "در شب معارفه مافیاها فقط یکدیگر را می‌شناسند؛ اقدام یا قابلیت دیگری در این مرحله اجرا نمی‌شود. سپس بازی با روز ۱ ادامه پیدا می‌کند."}
          </p>
        </div>
      )}
      {alarm.active && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3"
        >
          <TriangleAlert className="mt-0.5 shrink-0 text-amber-300" size={18} />
          <div>
            <div className="text-sm font-bold text-amber-200">
              هشدار HP پایین
            </div>
            <p className="mt-1 text-xs leading-5 text-amber-100/80">
              {alarm.low} از {alarm.total} بازیکنِ در بازی HP کمتر از ۵۰ دارند.
            </p>
          </div>
        </div>
      )}
      <div className="mb-4 grid grid-cols-4 gap-2">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5">
          <Users className="mb-2 text-zinc-400" size={16} />
          <div className="text-xl font-black">{players.length}</div>
          <div className="mt-1 text-[10px] text-zinc-500">بازیکن</div>
        </div>
        <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-2.5">
          <Heart className="mb-2 text-emerald-300" size={16} />
          <div className="text-xl font-black">{aliveCount}</div>
          <div className="mt-1 text-[10px] text-zinc-500">زنده</div>
        </div>
        <button
          onClick={() => setListKind("coma")}
          className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-2.5 text-right active:bg-amber-400/10"
        >
          <BedDouble className="mb-2 text-amber-300" size={16} />
          <div className="text-xl font-black">{comaCount}</div>
          <div className="mt-1 text-[10px] text-zinc-500">کما</div>
        </button>
        <button
          onClick={() => setListKind("dead")}
          className="rounded-2xl border border-rose-400/10 bg-rose-400/[0.04] p-2.5 text-right active:bg-rose-400/10"
        >
          <Skull className="mb-2 text-rose-300" size={16} />
          <div className="text-xl font-black">{deadCount}</div>
          <div className="mt-1 text-[10px] text-zinc-500">مرده</div>
        </button>
      </div>
      <section className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
        <h2 className="text-xs font-bold">۳ نفری که کمترین HP را دارند</h2>
        <p className="mb-2 mt-1 text-[10px] text-zinc-500">
          بین بازیکنانی که نه مرده‌اند و نه در کما هستند
        </p>
        {lowest.length === 0 ? (
          <p className="py-2 text-center text-xs text-zinc-600">
            بازیکنی باقی نمانده است.
          </p>
        ) : (
          <div className="space-y-1.5">
            {lowest.map((a, i) => (
              <button
                key={a.playerId}
                onClick={() => openHp(a.playerId)}
                className="flex w-full items-center justify-between rounded-xl bg-black/20 px-3 py-2.5 text-sm active:bg-white/[0.05]"
              >
                <span className="truncate">
                  {i + 1}. {players.find((p) => p.id === a.playerId)?.name}{" "}
                  <span className="text-[10px] text-zinc-500">
                    · {roleMap[a.roleId].name}
                  </span>
                </span>
                <span
                  dir="ltr"
                  className="font-black tabular-nums text-amber-300"
                >
                  {a.hp}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold">بازیکنان</h2>
        <button
          onClick={() => setScreen("history")}
          className="text-xs text-violet-300"
        >
          سوابق تغییرات <ArrowLeft className="mr-1 inline" size={13} />
        </button>
      </div>
      <div className="space-y-2">
        {players.map((p) => {
          const a = assignments.find((x) => x.playerId === p.id);
          if (!a) return null;
          const role = roleMap[a.roleId];
          const isLow = a.hp <= 30;
          return (
            <button
              key={p.id}
              onClick={() => {
                setHpPlayerId(p.id);
                setCustomMode("damage");
                setRoulettePartnerId("");
              }}
              className={`w-full rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-right active:bg-white/[0.05] ${a.status === "dead" ? "opacity-70" : ""}`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={role.cardImage}
                  alt=""
                  className="h-14 w-10 rounded-lg bg-black/30 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold">{p.name}</span>
                    {a.status !== "alive" && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] ${a.status === "coma" ? "bg-amber-400/10 text-amber-300" : "bg-rose-500/10 text-rose-300"}`}
                      >
                        {statusLabel(a)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    {role.name} <span className="mx-1 text-zinc-700">•</span>
                    <span
                      className={
                        role.side === "mafia" ? "text-rose-300" : "text-sky-300"
                      }
                    >
                      {role.side === "mafia" ? "مافیا" : "شهروند"}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div
                    dir="ltr"
                    className={`text-xl font-black tabular-nums ${a.hp <= 0 ? "text-rose-300" : isLow ? "text-amber-300" : "text-emerald-300"}`}
                  >
                    {a.hp}
                    <span className="mr-1 text-[10px] font-medium text-zinc-500">
                      HP
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${a.hp <= 0 ? "bg-rose-400" : isLow ? "bg-amber-300" : "bg-emerald-400"}`}
                      style={{ width: `${Math.max(0, Math.min(100, a.hp))}%` }}
                    />
                  </div>
                </div>
                <ChevronLeft size={16} className="text-zinc-600" />
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setConfirmReset(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 py-3 text-xs text-zinc-600"
      >
        <RotateCcw size={13} /> شروع بازی جدید
      </button>
    </main>
  );
}
